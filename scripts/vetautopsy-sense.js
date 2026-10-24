#!/usr/bin/env node
// vetautopsy-sense.js — SENSE-TESTING for sim-vetautopsy: replays a census
// seed with LIVE narration and prints the death beats of villagers who hold
// wave-4+ kills in waveKillLog, with voiced context lines around them, so a
// reader can judge whether killer deaths read as earned/coherent (mantle,
// haven, succession, pantry context) — SENSE-TESTING LAW: meaning,
// coherence, relevance, never counts.
//
// Replaying the SAME seed+policy with narration on is trajectory-safe: the
// harness's sanctioned {narration:true} path is read-only output. The
// substrate matches the census (armorvillage+armorydrive pinned).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 \
//   SEED=70119 BASE=lead DAYS=180 node scripts/vetautopsy-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));

const SEED = parseInt(process.env.SEED || '70119', 10);
const BASE = process.env.BASE || 'lead';
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const CTX_RE = /died|has fallen|funeral|killed|slain|wave 4|fourth draft|fifth draft|blood your fighters|readiness|armor the village|havens?|overtime|mantle|succession|trust|pantry|starv|hunger|feast|meat|system|influencer|reunion|congregation|eater|strike|audit/i;

(async () => {
  const policy = AV.armedFor(BASE === 'belong' ? 'belongfeast' : 'leadfeast');
  const { Game } = await loadGame({ seed: SEED, mode: 'vetautopsy-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const initialScholar = String((((Game.state || {}).scholar || {}).villagerId) || '');
  const recent = [];
  const killerDeaths = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      const day = ((Game.state || {}).scholar || {}).day || 0;
      if (CTX_RE.test(s)) { recent.push(`[d${day}] ${s.slice(0, 280)}`); if (recent.length > 20) recent.shift(); }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const otele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    const r = otele.apply(this, arguments);
    try {
      if (type === 'death' && data) {
        const vid = String(data.who || '');
        const log = ((Game.state || {}).waveKillLog || []);
        const w4kills = log.filter(e => e && (e.w | 0) >= 4 && String(e.by) === vid);
        if (w4kills.length) {
          const day = ((Game.state || {}).scholar || {}).day || 0;
          const scholarVid = String((((Game.state || {}).scholar || {}).villagerId) || '');
          killerDeaths.push({
            day, vid, cause: data.cause, kind: data.kind, wave: data.wave,
            player: !!(data.player), mantleHolder: vid === scholarVid,
            kills: w4kills.map(e => ({ d: e.d, mid: e.mid, via: e.via })),
            context: recent.slice(-10),
          });
        }
      }
    } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log(`=== vetautopsy-sense: seed=${SEED} base=${BASE} narration=on, ${killerDeaths.length} wave-4-killer deaths over ${DAYS}d ===`);
  for (const kd of killerDeaths) {
    console.log(`\n--- ${kd.vid} died d${kd.day} (cause=${kd.cause}, kind=${kd.kind}, vs wave-${kd.wave}, mantle=${kd.mantleHolder ? 'HOLDER' : 'fighter'}) — wave-4+ kills: ${kd.kills.map(k => `${k.mid}@d${k.d} (${k.via})`).join(', ')}`);
    for (const c of kd.context) console.log('    ' + c);
  }
})().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
