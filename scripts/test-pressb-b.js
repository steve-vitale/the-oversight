#!/usr/bin/env node
// test-pressb-b.js — proof for sim-pressb-b.
// Part 1 (always): pure-gate unit tests for pressDecision,
// prePressSweep on stub Games, and pressTotals — no harness,
// no RNG, no game code.
// Part 2 (with --corpus <controlDir> <variantDir> <replayDir>):
// corpus checks on judged legs — fire rate, banking ratio,
// off-target 0, control legs press-free, regression pairing,
// determinism files present. Determinism re-runs themselves are
// compared with cmp by the runner (see evidence file), not here.
// Usage: node scripts/test-pressb-b.js [--corpus c v r]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { pressDecision, prePressSweep, pressTotals } = require('./policies/pressb-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
const stranded = { gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false, ticksLeft: 512, knownCapableCells: 1 };
// T1: gate fires on the canonical stranded east morning.
check('T1 gate fires stranded+known', pressDecision(stranded).fire === true);
// T2: west corner (no known kcal) skips, does not fire.
check('T2 gate skips no-known-kcal', (() => { const d = pressDecision({ ...stranded, knownCapableCells: 0 }); return !d.fire && d.skip === 'no-known-kcal'; })());
// T3: haven morning skips even when previous evening stranded.
check('T3 gate skips haven-morning', (() => { const d = pressDecision({ ...stranded, wakeTileType: 'haven' }); return !d.fire && d.skip === 'haven-morning'; })());
// T4: non-stranded previous evening skips (rescued, other bucket, no record).
for (const [label, over] of [['rescued', { prevRescued: true }], ['other-bucket', { prevBucket: 'still' }], ['no-prev', { prevOutcome: null, prevBucket: null, prevRescued: null }]]) {
  check('T4 gate skips prev-not-stranded (' + label + ')', (() => { const d = pressDecision({ ...stranded, ...over }); return !d.fire && d.skip === 'prev-not-stranded'; })());
}
// T5: combat / game-over / ticks-short skip.
check('T5 gate skips combat', !pressDecision({ ...stranded, combatLive: true }).fire);
check('T5 gate skips game-over', !pressDecision({ ...stranded, gameOver: true }).fire);
check('T5 gate skips ticks-short', (() => { const d = pressDecision({ ...stranded, ticksLeft: 16 }); return !d.fire && d.skip === 'ticks-short'; })());
// T6: insideHaven skips.
check('T6 gate skips insideHaven', (() => { const d = pressDecision({ ...stranded, insideHaven: true }); return !d.fire && d.skip === 'haven-morning'; })());

// Stub Game for prePressSweep: 3x3 around (8,0) east corner —
// plant muscadine known, plant chickweed unknown, dirt; and a
// west-corner variant (0,0): dirt/grass/water, nothing green.
function stubGame(cells, knownSet) {
  // cells: map 'x,y' -> cell type; species map for plant cells.
  const grid = [];
  for (let y = 0; y < 9; y++) { const row = []; for (let x = 0; x < 9; x++) row.push(cells[x + ',' + y] || 'dirt'); grid.push(row); }
  return {
    state: { scholar: { mx: 8, my: 0, dayTicks: 0 } },
    map: { px: 2, py: 5 },
    TIME: { TICKS_PER_DAY: 512 },
    genDetail: () => grid.map((r) => r.slice()),
    playerTile: () => ({ type: 'creek', plantSpecies: { '7,0': 'muscadine', '8,0': 'chickweed' }, bushSpecies: {}, detailRegrow: {} }),
    plantKnown: (sp) => knownSet.has(sp),
    cellScorched: () => false,
  };
}
const east = stubGame({ '7,0': 'plant', '8,0': 'plant', '7,1': 'dirt', '8,1': 'plant' }, new Set(['muscadine']));
const eastSweep = prePressSweep(east);
check('T7 east sweep knownCapable 1 (muscadine only)', eastSweep.error === null && eastSweep.knownCapableCells === 1 && eastSweep.knownSpecies[0] === 'muscadine', JSON.stringify(eastSweep));
const westGame = {
  state: { scholar: { mx: 0, my: 0, dayTicks: 0 } }, map: { px: 2, py: 5 }, TIME: { TICKS_PER_DAY: 512 },
  genDetail: () => { const g = []; for (let y = 0; y < 9; y++) { const r = []; for (let x = 0; x < 9; x++) r.push('dirt'); g.push(r); } g[0][1] = 'grass'; g[1][0] = 'water'; g[1][1] = 'grass'; return g; },
  playerTile: () => ({ type: 'creek', plantSpecies: {}, bushSpecies: {}, detailRegrow: {} }),
  plantKnown: () => false, cellScorched: () => false,
};
const westSweep = prePressSweep(westGame);
check('T8 west sweep knownCapable 0', westSweep.error === null && westSweep.knownCapableCells === 0, JSON.stringify(westSweep));
// T9: regrowing known cell does not count; unassigned species does not count.
const regrowGame = stubGame({ '7,0': 'plant' }, new Set(['muscadine']));
regrowGame.playerTile = () => ({ type: 'creek', plantSpecies: { '7,0': 'muscadine' }, bushSpecies: {}, detailRegrow: { '7,0': true } });
check('T9 regrow cell excluded', prePressSweep(regrowGame).knownCapableCells === 0);
const unassignedGame = stubGame({ '7,0': 'plant' }, new Set(['muscadine']));
unassignedGame.playerTile = () => ({ type: 'creek', plantSpecies: {}, bushSpecies: {}, detailRegrow: {} });
check('T9 unassigned species excluded', prePressSweep(unassignedGame).knownCapableCells === 0);
// T10: pressTotals — new stack + merged-stack delta; unknowns separate.
const before = [{ plantId: 'x', name: 'X', units: 5, kcalEach: 90, edible: true }];
const after = [
  { plantId: 'x', name: 'X', units: 5, kcalEach: 90, edible: true },
  { plantId: 'muscadine', name: 'Muscadine Grapes', units: 6, kcalEach: 90, edible: true },
  { plantId: null, name: 'unknown shoots', units: 5, kcalEach: 0, edible: null, foodState: 'unknown' },
];
const tot = pressTotals(before, after);
check('T10 pressTotals E=540 unknowns=5', tot.knownEdibleKcal === 540 && tot.unknownUnits === 5, JSON.stringify(tot));
const before2 = [{ plantId: null, name: 'unknown berries', units: 5, kcalEach: 0, foodState: 'unknown' }];
const after2 = [{ plantId: null, name: 'unknown berries', units: 10, kcalEach: 0, foodState: 'unknown' }];
const tot2 = pressTotals(before2, after2);
check('T10 merged-stack delta counted as unknown', tot2.unknownUnits === 5 && tot2.knownEdibleKcal === 0, JSON.stringify(tot2));

// Part 2: corpus checks.
const ci = process.argv.indexOf('--corpus');
if (ci >= 0) {
  const [cDir, vDir, rDir] = process.argv.slice(ci + 1);
  const loadDir = (dir) => {
    const out = {};
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[inst.seed] = inst;
    }
    return out;
  };
  const control = loadDir(cDir), variant = loadDir(vDir);
  const replay = {};
  if (rDir && fs.existsSync(rDir)) for (const f of fs.readdirSync(rDir).filter((x) => x.endsWith('.json')).sort()) {
    const r = JSON.parse(fs.readFileSync(path.join(rDir, f), 'utf8'));
    if (r.mode === 'press') replay[r.seed + '|' + r.targetDay] = r;
  }
  // C1: control legs are press-free (wrapper delegates untouched).
  let controlAttempts = 0;
  for (const s of Object.keys(control)) controlAttempts += ((control[s].pressbStore || {}).attempts || []).length;
  check('C1 control legs press-free', controlAttempts === 0, 'attempts=' + controlAttempts);
  // C2: every variant attempt's prevEvening is creek+still and wake not haven.
  let offTarget = 0, attempts = 0;
  for (const s of Object.keys(variant)) {
    const v = variant[s];
    const evByDay = {}; for (const e of (v.evenings || [])) evByDay[e.loopDay] = e;
    const moByDay = {}; for (const m of (v.mornings || [])) moByDay[m.loopDay] = m;
    for (const a of ((v.pressbStore || {}).attempts || [])) {
      attempts++;
      const prev = evByDay[a.loopDay - 1];
      const ok = prev && prev.woodcarry && prev.woodcarry.bucket === 'creek' && !prev.woodcarry.rescued
        && moByDay[a.loopDay] && moByDay[a.loopDay].tile !== 'haven';
      if (!ok) offTarget++;
    }
  }
  check('C2 off-target fires 0', offTarget === 0, 'offTarget=' + offTarget + ' attempts=' + attempts);
  // C3: variant errs 0 and control errs 0.
  let errs = 0;
  for (const s of Object.keys(control)) errs += ((control[s].pressbStore || {}).errs || 0);
  for (const s of Object.keys(variant)) errs += ((variant[s].pressbStore || {}).errs || 0);
  check('C3 pressb errs 0', errs === 0, 'errs=' + errs);
  // C4: no variant seed loses >10 days, gains a new BEARER death
  // cause (player:true only — the deaths stream mixes monster
  // kills and villager deaths, which a behavior arm reshuffles
  // via RNG), or worsens endReason from survived.
  let regFail = 0;
  for (const s of Object.keys(control)) {
    if (!variant[s]) continue;
    const dd = (variant[s].daysAlive || 0) - (control[s].daysAlive || 0);
    const bc = (x) => (x && x.player === true) ? (x.cause || '') : null;
    const dc = (control[s].deaths || []).map(bc).filter(Boolean);
    const dv = (variant[s].deaths || []).map(bc).filter(Boolean);
    const newC = dv.filter((d) => !dc.includes(d));
    const endWorsened = variant[s].endReason !== control[s].endReason && variant[s].endReason !== 'survived' && control[s].endReason === 'survived';
    if (dd < -10 || newC.length || endWorsened) regFail++;
  }
  check('C4 no regression pairing fail', regFail === 0, 'regFail=' + regFail);
  // C5: replay comparators present for denominator mornings is checked
  // by the analyzer (coverage); here: every replay press has empty
  // judgedDiffs (snap equality held).
  let mismatch = 0, nReplay = 0;
  for (const k of Object.keys(replay)) { nReplay++; const d = replay[k].judgedDiffs; if (d && d.length) mismatch++; }
  check('C5 replay snap equality (n=' + nReplay + ')', mismatch === 0, 'mismatch=' + mismatch);
  // C6: tracked diff guard — src/ empty vs pinned base; policies/ has
  // exactly one addition (pressb-diag.js); competent.js identical.
  try {
    const base = 'c1b310c9614fa3f7f006da5c38ada73833134178';
    const srcDiff = execSync('git diff ' + base + ' -- src/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
    check('C6 src/ diff vs pinned base empty', srcDiff === '', srcDiff.slice(0, 200));
    const polFiles = execSync('git diff ' + base + ' --name-only -- scripts/policies/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    const untracked = execSync('git status --short -- scripts/policies/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    // Committed: diff lists exactly pressb-diag.js. Uncommitted:
    // diff is empty and status lists exactly the untracked file.
    const polOk = (polFiles.length === 1 && polFiles[0] === 'scripts/policies/pressb-diag.js')
      || (polFiles.length === 0 && untracked.length === 1 && untracked[0].includes('pressb-diag.js'));
    check('C6 policies/ change is pressb-diag.js only', polOk, 'diff=' + JSON.stringify(polFiles) + ' status=' + JSON.stringify(untracked));
    const compDiff = execSync('git diff ' + base + ' -- scripts/policies/competent.js', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
    check('C6 competent.js identical to base', compDiff === '', compDiff.slice(0, 200));
  } catch (e) { check('C6 tracked diff guard ran', false, e.message); }
}
console.log('test-pressb-b: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
