#!/usr/bin/env node
// sense-defer5gate.js — SENSE-TESTING for sim-defer5gate: runs ONE fresh
// seed with LIVE narration (the harness's sanctioned {narration:true}
// path) on the w5door-b pinned substrate and prints the defer5 hold beats
// ("The fifth draft stays in the wings...") IN CONTEXT: the five voiced
// lines before each first-fire/reminder beat, so the reader can judge
// whether the beat reads sensibly against what the gate is actually doing
// (SENSE-TESTING LAW: meaning, coherence, relevance — never counts).
//
// SEPARATE diagnostic run, not part of any corpus — no DET claim. Fresh
// seed 67801 (the w5door corpus used 65511-65522; the brief offers the
// 67801-67808 block for fresh comparability).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   SEED=67801 ARM=control DAYS=150 node scripts/sense-defer5gate.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

const SEED = parseInt(process.env.SEED || '67801', 10);
const ARM = process.env.ARM || 'control';
const DAYS = parseInt(process.env.DAYS || '150', 10);
const HOLD_RE = /fifth draft stays in the wings/i;
const CTX_RE = /fifth draft|not bought with bread alone|stays in the wings|RATINGS ARE UP|armor the village|weapons in hands|learn their tricks|blood your fighters|readiness|standing|wave 4|fourth draft|mirror draft|died|has fallen|funeral|galactic table/i;

(async () => {
  const base = ARM === 'armorydrive' ? AD.armedFor('leadfeast') : AD.substrateFor('leadfeast');
  const { Game } = await loadGame({ seed: SEED, mode: 'defer5gate-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const holdBeats = [];
  const recent = []; // ring buffer of voiced context lines
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      const day = ((Game.state || {}).scholar || {}).day || 0;
      if (CTX_RE.test(s)) {
        recent.push(`[d${day}] ${s.slice(0, 300)}`);
        if (recent.length > 12) recent.shift();
      }
      if (HOLD_RE.test(s)) {
        holdBeats.push({ day, text: s.slice(0, 400), context: recent.slice(-6, -1) });
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, base, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log(`=== sense-defer5gate: seed=${SEED} arm=${ARM} narration=on, ${holdBeats.length} defer5 hold beats over ${DAYS}d ===`);
  for (const b of holdBeats) {
    console.log(`\n--- d${b.day} (context: preceding voiced lines) ---`);
    for (const c of b.context) console.log('    ' + c);
    console.log('>>> ' + b.text);
  }
  try {
    const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null;
    const vs = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null;
    const rd = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    console.log(`\nend: day=${(((Game.state || {}).scholar) || {}).day} over=${!!Game.over} unlockedWave=${uw} gatedTotal=${vs} r5=${rd ? JSON.stringify({ armored: rd.armored, armed: rd.armed, tricks: rd.tricks, veterans: rd.veterans, short: rd.short }) : 'n/a'}`);
  } catch (e) { console.log('end: ' + String(e && e.message)); }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
