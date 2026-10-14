#!/usr/bin/env node
// sweep-raidration-20261014.js — RAID-AWARE RATION sweep (scale-onramp r31 ARM 3).
//
// Baseline (SIDE=baseline): leadfeast (FEASTSCALE_R13=1) + predation-lib.
//   Pre-screen: measures the trailing-14d gorge-night distribution the siege
//   threshold is picked from (r30 PREDATION-POSITIVE DROUGHT caveat — if the
//   phenomenon doesn't occur on this road, the arm is UNMEASURABLE).
// Armed (SIDE=armed): leadfeast + scripts/policies/raidration.js (RAIDRATION=1)
//   + predation-lib. Identical seeds, post-fix code both sides.
//
// Modes:
//   --invocations=1   single invocation per seed            -> sweep JSON
//   --invocations=2   two in-process invocations            -> det-gate style
//                     A/A (identical day-hash check)        -> sweep JSON per invocation
//
// PRE-REGISTERED (evidence/2026-10-14/sim-raidration-r31.md header, written before any sims):
//   SEEDS 11/22/33/44/55/66/77/88 x leadfeast, 180d death-aware, identical seeds.
//   DET-GATE: 8/8 identical per side required; a diverged seed is EXCLUDED
//     from the before/after comparison (documented). >2 diverged -> untrustworthy, KILL.
//   PREDATION-POSITIVE (baseline side): gorge nights >= 3 AND total gorged kcal >= 6000.
//   PRIMARY: mean survival days on predation-positive seeds, armed - baseline >= +20d.
//   GO: primary AND national >= baseline-2, median >= baseline-10d, exiled = 0.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { stdSnapshot } = require('./sweep-compare');
const { installPredation, finalizePredation } = require('./predation-lib-20261014');
// NAMED export unwrap (the r20b lesson): destructure leadfeast from the
// module — never Object.assign({}, require(...)).
const { leadfeast: baselineLeadfeast } = require('./policies/feastscale');
// raidration is required lazily (SIDE=armed only) so the baseline pre-screen
// never loads the armed layer.

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SIDE = process.env.SIDE || 'baseline';
const INVOC = parseInt((process.argv.find(a => a.startsWith('--invocations=')) || '=1').split('=')[1], 10) || 1;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-14');
const PERSEED = path.join(EVID, 'raidration-per-seed');

function basePolicy() {
  if (SIDE === 'armed') {
    return require('./policies/raidration').policyForRun();
  }
  return baselineLeadfeast;
}

async function runCombo(seed, inv) {
  const { Game } = await loadGame({ seed, mode: `raidration-${SIDE}-i${inv}` });
  await setupGame(Game);
  const track = installPredation(Game);
  const halfDays = new Set();
  const daySamples = [];
  const hashes = [];
  let lastCtx = null;
  let maxRank = 0, maxArc = 1, maxWave = 1, everTable = false, won = false;
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      if (/Half ration/.test(String(msg))) halfDays.add((Game.state.scholar || {}).day || 0);
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const base = basePolicy();
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  const origUpkeep = base.upkeep;
  policy.daily = (G, ctx) => {
    try {
      lastCtx = ctx;
      const d = (G.state.scholar || {}).day || 0;
      hashes.push(d + ':' + dayHash(G));
      const s = stdSnapshot(G);
      maxRank = Math.max(maxRank, RANK_ORDER[s.rank] || 0);
      maxArc = Math.max(maxArc, s.arc || 1);
      maxWave = Math.max(maxWave, s.wave || 1);
      if (s.tableWaiting) everTable = true;
      if (s.won) won = true;
      daySamples.push({ day: d, exiled: !!((G.state.scholar || {}).exiled) });
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  if (origUpkeep) {
    policy.upkeep = (G, ctx) => { try { lastCtx = ctx; } catch (e) {} return origUpkeep(G, ctx); };
  }
  let r;
  try {
    r = await runDays(Game, policy, { days: DAYS, sampleEvery: 1 });
  } finally {
    Game.say = origSay;
  }
  let pred = null;
  try { pred = finalizePredation(Game, track); } catch (e) { pred = { error: String(e && e.message) }; }
  const gorgeNights = (track.gorgeNights || []);
  const totalGorgedKcal = gorgeNights.reduce((t, g) => t + Math.round(g.totalGorged || 0), 0);
  // trailing-14d gorge-night peak (the siege detector's own signal, from the instrument side)
  const gdays = gorgeNights.map(g => g.day).sort((a, b) => a - b);
  let peak14 = 0;
  for (const d0 of gdays) {
    const c = gdays.filter(d => d >= d0 && d < d0 + 14).length;
    if (c > peak14) peak14 = c;
  }
  const vv = Game.state.village || {};
  const end = stdSnapshot(Game);
  const rr = {};
  try {
    for (const k of Object.keys(lastCtx || {})) {
      if (k.startsWith('rr')) rr[k] = lastCtx[k];
    }
  } catch (e) {}
  return {
    side: SIDE, invocation: inv, policy: base.id || 'leadfeast', seed,
    days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    waveReach: r.maxWaveUnlocked || maxWave || 1,
    national: maxRank >= 2 ? 1 : 0, table: everTable || end.tableWaiting ? 1 : 0,
    won: won || end.won ? 1 : 0, vests: end.vests || 0, maxArc,
    halfRationDays: halfDays.size,
    halfRationShare: r.gameDays > 0 ? halfDays.size / r.gameDays : 0,
    everExiled: daySamples.some(x => x.exiled) ? 1 : 0,
    gorgeNights: gorgeNights.length,
    totalGorgedKcal,
    gorgePeak14d: peak14,
    predInstrErrors: (track.instrErrors || []).length,
    rr,
    hashes,
  };
}

async function main() {
  if (!fs.existsSync(PERSEED)) fs.mkdirSync(PERSEED, { recursive: true });
  const rows = [];
  const gateLines = [];
  for (const seed of SEEDS) {
    const a = await runCombo(seed, 1);
    rows.push(a);
    fs.writeFileSync(path.join(PERSEED, `raidration-${SIDE}-leadfeast-s${seed}-i1.json`),
      JSON.stringify(a, (k, v) => (k === 'hashes' ? `[${(v || []).length} hashes]` : v), 1));
    console.log(`  [${SIDE} seed ${seed} i1] days=${a.days} end=${a.endReason} wave=${a.waveReach} national=${a.national} table=${a.table} won=${a.won} exiled=${a.everExiled} gorgeN=${a.gorgeNights} gorgeK=${a.totalGorgedKcal} peak14=${a.gorgePeak14d} instrErr=${a.predInstrErrors}`);
    if (INVOC >= 2) {
      const b = await runCombo(seed, 2);
      rows.push(b);
      fs.writeFileSync(path.join(PERSEED, `raidration-${SIDE}-leadfeast-s${seed}-i2.json`),
        JSON.stringify(b, (k, v) => (k === 'hashes' ? `[${(v || []).length} hashes]` : v), 1));
      let firstDiv = -1;
      const n = Math.min(a.hashes.length, b.hashes.length);
      for (let i = 0; i < n; i++) { if (a.hashes[i] !== b.hashes[i]) { firstDiv = i; break; } }
      const identical = firstDiv < 0 && a.hashes.length === b.hashes.length;
      const divDay = firstDiv >= 0 ? a.hashes[firstDiv].split(':')[0] : '-';
      gateLines.push(`${SIDE} seed ${seed}: ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} (${n} days)`);
      console.log(`  [${SIDE} seed ${seed} i2] ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} gorgeN=${b.gorgeNights} gorgeK=${b.totalGorgedKcal}`);
    }
  }
  const out = path.join(EVID, `sweep-raidration-${SIDE}-inv${INVOC}.json`);
  fs.writeFileSync(out, JSON.stringify({ side: SIDE, invocations: INVOC, days: DAYS, rows, gate: gateLines }, null, 1));
  console.log(`wrote ${out}`);
  if (gateLines.length) {
    const idn = gateLines.filter(l => l.includes('IDENTICAL')).length;
    console.log(`GATE: ${idn}/${gateLines.length} identical`);
    for (const l of gateLines) console.log('  ' + l);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
