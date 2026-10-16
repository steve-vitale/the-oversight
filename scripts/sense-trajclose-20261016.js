#!/usr/bin/env node
// scripts/sense-trajclose-20261016.js — SIM-TRAJCLOSE-B sense testing
// (loop B, 2026-10-16, food-economy axis). SENSE-TESTING LAW: read
// transcripts, judge meaning — sample villager behavior around the
// driver's verbs (aid/feast beats) — do they read as people or robots?
//
// Re-runs the driver cell (TRAJCLOSE=1 + FEASTSCALE_R13=1) on chosen seeds
// (deterministic per the det-gate — same seed, same beats), captures all
// Game.say beats, and prints ±6 beats around each driver cause line
// (/not the rot/, /eats itself/) plus a general sample.
//
// Usage:
//   TRAJCLOSE=1 FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS=11,22 DAYS=180 \
//     node scripts/sense-trajclose-20261016.js > evidence/2026-10-16/trajclose-sense/sense-beats.txt
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let TC = null;
try { TC = require('./policies/trajclose'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: trajclose driver absent; status in evidence/2026-10-16/sim-trajclose-b.md');
    process.exit(0);
  }
  throw e;
}

const seeds = (process.env.SEEDS || '11').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const days = parseInt(process.env.DAYS || '180', 10);

function isDriverCause(t) { return /not the rot|eats itself/.test(String(t)); }

(async () => {
  for (const seed of seeds) {
    process.env.TRAJCLOSE = '1';
    const { Game } = await loadGame({ seed, mode: 'trajclose-sense', fullTelemetry: false });
    await setupGame(Game);
    const beats = [];
    const oSay = Game.say;
    Game.say = function (t) { try { beats.push({ day: (Game.state.scholar || {}).day || 0, t: String(t) }); } catch (e) {} return oSay.apply(this, arguments); };
    let result = null;
    await quietLog(async () => { result = await runDays(Game, TC.trajLead, { days, manifest: undefined, sampleEvery: 10 }); });
    const marks = [];
    beats.forEach((b, i) => { if (isDriverCause(b.t)) marks.push(i); });
    console.log(`\n===== seed ${seed} — ${beats.length} beats, ${marks.length} driver-cause beats, days=${result.days} end=${result.endReason} =====`);
    const shown = new Set();
    for (const m of marks) {
      for (let i = Math.max(0, m - 6); i <= Math.min(beats.length - 1, m + 6); i++) {
        if (shown.has(i)) continue;
        shown.add(i);
        const mark = i === m ? '>>>' : '   ';
        console.log(`${mark} [d${beats[i].day}] ${beats[i].t.slice(0, 260)}`);
      }
      console.log('   ...');
    }
    // general sample: every ~200th beat for villager-behavior flavor
    console.log(`\n----- general sample (seed ${seed}) -----`);
    for (let i = 0; i < beats.length; i += 200) {
      console.log(`   [d${beats[i].day}] ${beats[i].t.slice(0, 220)}`);
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
