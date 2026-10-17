#!/usr/bin/env node
// scripts/sweep-seatblow-open-20261017.js — sim-seatblow-open pilot sweep
// (flesh-out loop, axis scale-onramp, 2026-10-17).
//
// Steve 2026-10-17 decision #441/#445 ("Food deeds: open the gate"): the
// tbDamage _ps gate opens — villager fighters' blows carry FEASTED/
// OVERCHARGE and bank the food-thesis deed.
//
// 8 FRESH seeds [61111-61118] x {leadfeast, belongfeast} x {armed, control}
// = 32 runs, 180d death-aware, identical-seed armed/control pairs.
// Fresh = 0 `"seed": 6111X` hits across evidence/ (verified 2026-10-17).
// ARMED = this tree (SEATBLOW_ROOT default): gate open.
// CONTROL = pristine master pin (SEATBLOW_ROOT=~/workspace/worktrees/sim-seatblow-ctl).
// Substrate asserted up front (SWEEP STOP on mismatch).
//
// Per run: foodDeeds end flags (sentimentTaught, feastSurgeUsed,
// feastSurgeBy), villager feasted/overcharged blow counts (from the honest
// narration lines), scholar feasted blows, mark-by-source shares, seat
// chain (tablegate instrument), national, table, wins, survival, scholar
// combat deaths (live tele capture), death-cause shares.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-seatblow-open-20261017.js                 # ARMED
//   FEASTSCALE_R13=1 SEATDRIVE=0 SEATBLOW_ROOT=~/workspace/worktrees/sim-seatblow-ctl \
//       ARM=control node scripts/sweep-seatblow-open-20261017.js                             # CONTROL
// Targeted: SEEDS="9601,9602" ONLY="leadfeast" ARM="armed" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-seatblow-open-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const SB_ROOT = process.env.SEATBLOW_ROOT || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(SB_ROOT, 'scripts/sim-harness'));
const { leadfeast, belongfeast } = require(path.join(SB_ROOT, 'scripts/policies/feastscale'));
const { attachTablegateCapture } = require('./tablegate-instrument-20261017');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') fails.push('SEATDRIVE=0 required EXPLICIT');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [61111, 61112, 61113, 61114, 61115, 61116, 61117, 61118]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const BASES = { leadfeast, belongfeast };
const ROADS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => BASES[s]) : ['leadfeast', 'belongfeast'];
const ARMS = process.env.ARM ? String(process.env.ARM).split(',').map(s => s.trim()).filter(s => s === 'armed' || s === 'control') : ['armed', 'control'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-seatblow');
if (!SMOKE) fs.mkdirSync(EVID, { recursive: true });

function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function runOne(seed, road, arm) {
  const policy = BASES[road];
  try {
    const { Game } = await loadGame({ seed, mode: `seatblow-${road}-${arm}` });
    await setupGame(Game);
    // --- read-only instruments: hooks record, never alter ---
    const m = {
      marks: 0, markBy: {}, vFeastedBlows: 0, vOverBlows: 0, scholarFeastedBlows: 0,
      vFeastedBlowDays: [], errors: 0,
    };
    const onm = Game.noteFeastedCombatUse;
    if (typeof onm === 'function') Game.noteFeastedCombatUse = function (...a) {
      let r = null;
      try { r = onm.apply(this, a); } catch (e) { m.errors++; }
      try {
        m.marks++;
        const by = ((Game.state.scholar || {}).prog || {}).feastSurgeBy || 'p(legacy)';
        m.markBy[by] = (m.markBy[by] || 0) + 1;
      } catch (e) { m.errors++; }
      return r;
    };
    // Narration-line capture: the hook narrates every uplift honestly, so
    // the lines ARE the count (villager feasted / villager overcharged /
    // scholar feasted). Read-only wrap on say.
    const _say = Game.say;
    if (typeof _say === 'function') Game.say = function (msg) {
      let r;
      try { r = _say.apply(this, arguments); } catch (e) { m.errors++; }
      try {
        const l = String(msg);
        if (/FEASTED/.test(l) && /'s blow carries the feast/.test(l)) { m.vFeastedBlows++; m.vFeastedBlowDays.push(dayOf(Game)); }
        else if (/OVERCHARGED/.test(l) && /fights on a full belly/.test(l)) m.vOverBlows++;
        else if (/FEASTED/.test(l) && /the feast was the weapon/.test(l)) m.scholarFeastedBlows++;
      } catch (e) {}
      return r;
    };
    // --- live death capture (independent of the 300-event tele cap) ---
    const deaths = [];
    const _tele = Game.tele;
    Game.tele = function (type, data) {
      let r; try { r = _tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'death') deaths.push({ day: dayOf(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
      } catch (e) {}
      return r;
    };
    // --- tablegate arrival-path capture (read-only) ---
    const tg = attachTablegateCapture(Game);
    const baseDaily = policy.daily;
    const wrapped = Object.assign({}, policy, {
      daily(G, ctx) {
        let r;
        try { r = baseDaily ? baseDaily(G, ctx) : undefined; } catch (e) { r = undefined; }
        try { tg.sample(); } catch (e) {}
        return r;
      },
    });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: EFF_DAYS, sampleEvery: 30 }); });
    const cap = tg.finish();
    try { tg.restore(); } catch (e) {}
    const s = Game.state.scholar || {};
    const pg = (() => { try { return Game.progState() || {}; } catch (e) { return {}; } })();
    const sprog = s.prog || {};
    const scholarDeaths = deaths.filter(d => d.player);
    const scholarCombatDeaths = scholarDeaths.filter(d => /combat|monster|fight/i.test(String(d.cause || '') + ' ' + String(d.kind || ''))).length;
    const out = {
      seed, road, arm, days: EFF_DAYS, tree: SB_ROOT,
      survived: !Game.over, endDay: dayOf(Game),
      foodDeeds: {
        sentimentTaught: !!pg.sentimentTaught,
        feastSurgeUsed: !!sprog.feastSurgeUsed,
        feastSurgeBy: sprog.feastSurgeBy || null,
      },
      marks: m.marks, markBy: m.markBy,
      vFeastedBlows: m.vFeastedBlows, vFeastedBlowDays: m.vFeastedBlowDays,
      vOverBlows: m.vOverBlows, scholarFeastedBlows: m.scholarFeastedBlows,
      seatEver: cap.seatEver, seatEverDay: cap.seatEverDay,
      waitingDay: cap.waitingDay, announcedDay: cap.announcedDay, arc4Day: cap.arc4Day,
      seated: cap.seated, seatDay: cap.seatDay,
      nationalDay: cap.nationalDay, nationalRank: cap.nationalRank,
      tableWaiting: !!pg.tableWaiting, tableDone: !!pg.tableDone,
      won: !!Game.won,
      scholarDeaths: scholarDeaths.length, scholarCombatDeaths,
      deathCauses: deaths.reduce((a, d) => { const k = String(d.cause || d.kind || 'unknown'); a[k] = (a[k] || 0) + 1; return a; }, {}),
      instrumentErrors: m.errors + (cap.errors | 0),
      endDetail: cap.endDetail,
      ms: result ? result.ms : 0,
    };
    out.foodDeeds.holds = out.foodDeeds.sentimentTaught && out.foodDeeds.feastSurgeUsed;
    if (!SMOKE) fs.writeFileSync(path.join(EVID, `seatblow-${road}-${arm}-s${seed}.json`), JSON.stringify(out, null, 1));
    return out;
  } catch (e) {
    console.error(`RUN FAILED ${road}/${arm}/s${seed}:`, e.message);
    throw e;
  }
}

(async () => {
  assertSubstrate();
  console.log('SEATBLOW_ROOT=' + SB_ROOT);
  const rows = [];
  for (const road of ROADS) for (const seed of SEEDS) for (const arm of ARMS) {
    const r = await runOne(seed, road, arm);
    rows.push(r);
    console.log(`done ${r.road}/${r.arm}/s${r.seed}: holds=${r.foodDeeds.holds} by=${r.foodDeeds.feastSurgeBy} vFeast=${r.vFeastedBlows} vOver=${r.vOverBlows} schFeast=${r.scholarFeastedBlows} seat=${r.seatEver !== 'none'} national=${r.nationalDay != null ? 'd' + r.nationalDay : 'no'} won=${r.won} surv=${r.survived ? 'Y' : 'N'}:d${r.endDay}`);
  }
  const sum = (f) => rows.filter(f).length;
  for (const arm of ARMS) {
    const rs = rows.filter(r => r.arm === arm);
    console.log(`--- ${arm}: holds ${sum(r => r.arm === arm && r.foodDeeds.holds)}/${rs.length} ` +
      `vBanked ${sum(r => r.arm === arm && String(r.foodDeeds.feastSurgeBy || '').startsWith('v:'))}/${rs.length} ` +
      `vFeastBlows ${rs.reduce((a, r) => a + r.vFeastedBlows, 0)} ` +
      `national ${sum(r => r.arm === arm && r.nationalDay != null)}/${rs.length} ` +
      `won ${sum(r => r.arm === arm && r.won)}/${rs.length}`);
  }
})().catch(e => { console.error('SWEEP FATAL', e); process.exit(1); });
