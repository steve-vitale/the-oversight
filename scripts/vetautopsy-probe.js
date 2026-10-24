#!/usr/bin/env node
// vetautopsy-probe.js — PROBE (not the census): what is readable at death-tele
// time? Answers the instrument-design question for vetautopsy-instrument:
// for a person death, is getPerson(who) still alive at tele fire (hp,
// equipped/armor), or is the roster record already gone? Falls back to the
// daily-snapshot plan if the tele is too late.
//
// Usage (pinned defer5-rediag substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 \
//   SEED=70119 BASE=lead DAYS=130 node scripts/vetautopsy-probe.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));

const SEED = parseInt(process.env.SEED || '70119', 10);
const BASE = process.env.BASE || 'lead';
const DAYS = parseInt(process.env.DAYS || '130', 10) || 130;

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'vetautopsy-probe', fullTelemetry: false });
  const rows = [];
  const otele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    let r;
    try { r = otele.apply(this, arguments); } catch (e) { throw e; }
    try {
      if (type === 'death' && data) {
        const day = (((Game.state || {}).scholar || {}).day) | 0;
        const who = data.who != null ? String(data.who) : null;
        const rec = { day, who, kind: data.kind || null, cause: data.cause || null,
          playerEager: !!(data.player), wave: data.wave != null ? (data.wave | 0) : null,
          teleType: ((((Game.state || {}).telemetry || []).slice(-1)[0] || {}).type) };
        // Person readability AT tele time.
        let person = null;
        try { person = (typeof Game.getPerson === 'function') ? Game.getPerson(who) : null; } catch (e) { rec.getPersonErr = String((e && e.message) || e); }
        rec.personPresent = !!person;
        if (person) {
          try { rec.hp = (person.hp != null ? person.hp : (person.health != null ? person.health : null)); } catch (e) {}
          try { rec.maxHp = (person.maxHp != null ? person.maxHp : null); } catch (e) {}
          try {
            const S = Game.Scattering || globalThis.Scattering || null;
            const EQ = (S && S.equipment) || null;
            rec.armor = (EQ && typeof EQ.armorOf === 'function') ? EQ.armorOf(person, (Game.data || {}).items) : 'EQ-missing';
          } catch (e) { rec.armor = 'ERR:' + String((e && e.message) || e); }
          try { rec.equippedKeys = person.equipped ? Object.keys(person.equipped) : null; } catch (e) {}
          try { rec.hunger = (person.hunger != null ? person.hunger : (person.satiety != null ? person.satiety : null)); } catch (e) {}
          try { rec.deadFlag = !!person.dead; } catch (e) {}
        }
        try { rec.onRoster = ((((Game.state || {}).village || {}).roster) || []).map(String).includes(who); } catch (e) { rec.onRoster = 'err'; }
        try { rec.scholarVid = String((((Game.state || {}).scholar || {}).villagerId) || ''); } catch (e) { rec.scholarVid = 'err'; }
        try { rec.vpOfDead = ((typeof Game.vpOf === 'function') ? !!((Game.vpOf(who) || {}).dead) : 'n/a'); } catch (e) { rec.vpOfDead = 'err'; }
        rows.push(rec);
      }
    } catch (e) { rows.push({ probeErr: String((e && e.message) || e) }); }
    return r;
  };
  const policy = AV.armedFor(BASE === 'belong' ? 'belongfeast' : 'leadfeast');
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { Game.tele = otele; } catch (e) {}
  console.log(`=== vetautopsy-probe seed=${SEED} base=${BASE} days=${result.days} end=${result.endReason} deaths=${rows.length} ===`);
  // Print only the wave-4-relevant + scholar deaths in full, plus a presence summary.
  let present = 0, absent = 0, w4 = 0;
  for (const r of rows) {
    if (r.personPresent) present++; else absent++;
    if (r.wave != null && r.wave >= 4) { w4++; console.log(JSON.stringify(r)); }
  }
  console.log(`personPresent@tele: ${present}/${rows.length}; w4-deaths: ${w4}`);
  // First 3 rows raw for shape reference.
  console.log('--- shape sample ---');
  for (const r of rows.slice(0, 3)) console.log(JSON.stringify(r));
})().catch(e => { console.error('PROBE FAILED:', (e && e.stack) || e); process.exit(1); });
