#!/usr/bin/env node
// analyze-recallpolicy-b.js — judged analysis for sim-recallpolicy-b.
// Reads the OFF/ON per-seed corpora, verifies every recorded recall
// step for legality (orthogonal-adjacent, in-bounds, contiguous from
// the fire node, arrivals at haven), and judges the prereg gates:
// pilot gate, guards G1/G2/G3, and the PRIMARY strict rescue rate.
//
// Usage:
//   node scripts/analyze-recallpolicy-b.js --corpus evidence/2026-10-29 [--seeds 68101,68102] [--out <verdict.json>]
// With --seeds, only those seeds are judged (pilot subset); without it,
// every seed present in the OFF corpus is judged (pooled set).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : process.argv[i + 1]; };
const CORPUS = arg('corpus', path.join(ROOT, 'evidence', '2026-10-29'));
const SEEDS = arg('seeds', null) ? arg('seeds', '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isFinite) : null;
const OUT = arg('out', path.join(ROOT, 'evidence', '2026-10-29', 'sim-recallpolicy-b-analysis.json'));

function load(leg, seed) {
  const fp = path.join(CORPUS, 'sim-recallpolicy-b-corpus-' + leg, 'recallpolicy-' + leg + '-s' + seed + '.json');
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}
function seedsPresent() {
  const dir = path.join(CORPUS, 'sim-recallpolicy-b-corpus-off');
  return fs.readdirSync(dir).filter((f) => /^recallpolicy-off-s\d+\.json$/.test(f))
    .map((f) => parseInt(f.replace(/^recallpolicy-off-s(\d+)\.json$/, '$1'), 10)).sort((a, b) => a - b);
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

// Verify legality of every ON-leg recall step. Returns illegal[].
function verifySteps(run) {
  const illegal = [];
  const rc = run.recall || {};
  const eps = {};
  (rc.episodes || []).forEach((e) => { eps[e.vid + '|' + e.id] = e; });
  (rc.steps || []).forEach((st) => {
    if (st.kind === 'snap-passthrough') {
      const cheb = Math.max(Math.abs(st.to.nx - st.from.nx), Math.abs(st.to.ny - st.from.ny));
      if (cheb <= 1) illegal.push({ seed: run.seed, step: st, why: 'snap-passthrough with Chebyshev<=1 (not a snap)' });
      return;
    }
    if (st.kind !== 'recall-step') return;
    const man = Math.abs(st.to.nx - st.from.nx) + Math.abs(st.to.ny - st.from.ny);
    if (man !== 1) illegal.push({ seed: run.seed, step: st, why: 'recall step not orthogonal-adjacent (Manhattan ' + man + ')' });
    if (st.to.nx < 0 || st.to.nx > 8 || st.to.ny > 8 || st.to.ny < 0) illegal.push({ seed: run.seed, step: st, why: 'step outside 0..8' });
  });
  // Contiguity per episode: first recall-step from == fireNode, each
  // next from == previous to.
  (rc.episodes || []).forEach((ep) => {
    const steps = (ep.steps || []).filter((s) => s.kind === 'recall-step');
    for (let i = 0; i < steps.length; i++) {
      const want = i === 0 ? ep.fireNode : steps[i - 1].to;
      if (!want || steps[i].from.nx !== want.nx || steps[i].from.ny !== want.ny) {
        illegal.push({ seed: run.seed, vid: ep.vid, why: 'step chain not contiguous at step ' + i, step: steps[i], want: want });
      }
    }
  });
  // Arrivals: every recall-cleared completion must be at the haven
  // node recorded by the instrument for that run (default 4,4).
  const hv = (rc.haven || { hx: 4, hy: 4 });
  (rc.completions || []).forEach((c) => {
    if (c.kind === 'recall-cleared' && c.node && (c.node.nx !== hv.hx || c.node.ny !== hv.hy)) {
      illegal.push({ seed: run.seed, completion: c, why: 'recall-cleared arrival not at haven node' });
    }
  });
  return illegal;
}

const seeds = SEEDS || seedsPresent();
const off = [], on = [];
const illegalAll = [];
const epTable = [];
for (const seed of seeds) {
  const o = load('off', seed); const n = load('on', seed);
  off.push(o); on.push(n);
  illegalAll.push.apply(illegalAll, verifySteps(n));
  (n.recall.episodes || []).forEach((e) => epTable.push({
    seed: seed, leg: 'on', vid: e.vid, name: e.name, fireDay: e.fireDay, fireDist: e.fireDist,
    outcome: e.outcome, outcomeDay: e.outcomeDay, death: e.death || null, steps: (e.steps || []).length,
  }));
  (o.recall.episodes || []).forEach((e) => epTable.push({
    seed: seed, leg: 'off', vid: e.vid, name: e.name, fireDay: e.fireDay, fireDist: e.fireDist,
    outcome: e.outcome, outcomeDay: e.outcomeDay, death: e.death || null, steps: 0,
  }));
}
const sum = (runs, f) => runs.reduce((a, r) => a + f(r), 0);
const trigOn = sum(on, (r) => (r.recall || {}).triggered || 0);
const trigOff = sum(off, (r) => (r.recall || {}).triggered || 0);
const rescOn = sum(on, (r) => (r.recall || {}).rescuedStrict || 0);
const rate = trigOn ? +(rescOn / trigOn).toFixed(3) : null;
const starvOn = sum(on, (r) => (r.deaths || []).filter((d) => d.pclass === 'starvation').length);
const starvOff = sum(off, (r) => (r.deaths || []).filter((d) => d.pclass === 'starvation').length);
const medOn = median(on.map((r) => r.gameDays));
const medOff = median(off.map((r) => r.gameDays));
const errOn = sum(on, (r) => (r.instrumentErrors || []).length);
const errOff = sum(off, (r) => (r.instrumentErrors || []).length);
// Starvation among triggered/would-fire episodes.
function trigStarved(runs) {
  let n = 0;
  runs.forEach((r) => ((r.recall || {}).episodes || []).forEach((e) => {
    if (e.outcome === 'scope-excluded' || e.outcome === 'dead-at-fire') return;
    if (e.death && e.death.pclass === 'starvation') n++;
  }));
  return n;
}
const trigStarvOn = trigStarved(on);
const trigStarvOff = trigStarved(off);
const g1 = medOn !== null && medOff !== null && medOn >= medOff - 2;
const g2 = starvOn <= starvOff + 2;
const g3 = illegalAll.length === 0;
const pilotGate = trigOn >= 2 && g3 && g1 && g2 && errOn === 0 && errOff === 0;
let primary;
if (trigOn < 8) primary = 'insufficient-data';
else if (rate >= 0.50 && g1 && g2 && g3) primary = 'GO';
else primary = 'NO-GO';
const wall = (runs) => ({
  n: runs.length,
  national: sum(runs, (r) => r.national || 0),
  everNational: sum(runs, (r) => r.everNational || 0),
  table: sum(runs, (r) => r.table || 0),
  won: sum(runs, (r) => r.won || 0),
  wave4: sum(runs, (r) => r.wave4 || 0),
  wave5: sum(runs, (r) => r.wave5 || 0),
  medianSurvival: median(runs.map((r) => r.gameDays)),
});
const verdict = {
  seeds: seeds, nSeeds: seeds.length,
  triggers: { on: trigOn, off: trigOff },
  rescuedStrict: rescOn, rescueRate: rate,
  starvation: { on: starvOn, off: starvOff, triggeredStarvedOn: trigStarvOn, triggeredStarvedOff: trigStarvOff },
  guards: { G1_medianSurvival: { on: medOn, off: medOff, pass: g1 }, G2_starvationTotals: { on: starvOn, off: starvOff, pass: g2 }, G3_illegalMoves: { n: illegalAll.length, pass: g3 } },
  instrumentErrors: { on: errOn, off: errOff },
  illegalMoves: illegalAll,
  pilotGate: pilotGate,
  primary: primary,
  wall: { off: wall(off), on: wall(on) },
  episodes: epTable,
};
fs.writeFileSync(OUT, JSON.stringify(verdict, null, 1) + '\n');
console.log('seeds: ' + seeds.join(','));
console.log('triggers ON=' + trigOn + ' OFF(would-fire)=' + trigOff);
console.log('rescued strict ON=' + rescOn + ' rate=' + rate + ' (bar >=0.50, min-n 8)');
console.log('starvation total ON=' + starvOn + ' OFF=' + starvOff + ' | triggered-starved ON=' + trigStarvOn + ' OFF=' + trigStarvOff);
console.log('median survival ON=' + medOn + ' OFF=' + medOff + ' (G1 ' + (g1 ? 'PASS' : 'FAIL') + ')');
console.log('G2 ' + (g2 ? 'PASS' : 'FAIL') + ' | G3 illegal=' + illegalAll.length + ' ' + (g3 ? 'PASS' : 'FAIL'));
console.log('instrument errors ON=' + errOn + ' OFF=' + errOff);
console.log('pilotGate=' + pilotGate + ' primary=' + primary);
console.log('wall OFF: ' + JSON.stringify(verdict.wall.off));
console.log('wall ON:  ' + JSON.stringify(verdict.wall.on));
console.log('wrote ' + OUT);
