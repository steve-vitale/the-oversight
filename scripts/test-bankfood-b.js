#!/usr/bin/env node
// test-bankfood-b.js — proof for the bankfood instrument.
// Pure checks always run (packSnap splits, pressTotals, gather-target
// BFS on a fake grid). Corpus checks run only when
// BANKFOOD_CORPUS_CHECK=1 with dirs in BANKFOOD_TEST_CONTROL /
// BANKFOOD_TEST_VARIANT / BANKFOOD_TEST_OFF (pilot dirs by default)
// and seeds in BANKFOOD_TEST_SEEDS: every file present + parses,
// bankfoodStore errs 0, det-gate (OFF reproduces control counts).
// Usage: node scripts/test-bankfood-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { packSnap, pressTotals, findGatherTarget } = require('./policies/bankfood-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function fakeGame(inv) {
  return { state: { scholar: { inventory: inv, kcal: 0, dayTicks: 0 } } };
}

// ---- pure: packSnap splits ----
{
  const g = fakeGame([
    { name: 'Muscadine Grapes', units: 8, kcalEach: 90, edible: true, foodState: 'raw', spoilDay: 5 },
    { name: 'Hickory Nuts (in shell)', units: 4, kcalEach: 0, edible: false, foodState: 'in_shell', spoilDay: 60 },
    { name: 'Branch', units: 2, kcalEach: 0, material: 'branch', spoilDay: 9999 },
  ]);
  const s = packSnap(g);
  check('packSnap edible counts only edible-now', s.edibleKcal === 720, 'got ' + s.edibleKcal);
  check('packSnap gross equals edible here', s.grossKcal === 720, 'got ' + s.grossKcal);
  check('packSnap lump zero without lumps', s.lumpUnits === 0, 'got ' + s.lumpUnits);
}
{
  const g = fakeGame([
    { name: 'unknown shoots', units: 14, kcalEach: 0, edible: false, foodState: 'unknown', spoilDay: 3, lump: { dandelion: { units: 14, day: 1 } } },
    { name: 'Trail mix', units: 2, kcalEach: 400, spoilDay: 61 },
  ]);
  const s = packSnap(g);
  check('packSnap lump units counted', s.lumpUnits === 14, 'got ' + s.lumpUnits);
  check('packSnap lump contributes 0 edible kcal', s.edibleKcal === 800, 'got ' + s.edibleKcal);
  check('packSnap lump spoilDay recorded', JSON.stringify(s.lumpSpoilDays) === '[3]', 'got ' + JSON.stringify(s.lumpSpoilDays));
  check('packSnap no-edible-flag stack counts as edible', s.grossKcal === 800, 'got ' + s.grossKcal);
}
{
  const g = fakeGame([]);
  const s = packSnap(g);
  check('packSnap empty pack is zero, not null', s.edibleKcal === 0 && s.grossKcal === 0 && s.lumpUnits === 0, JSON.stringify(s));
}
// ---- pure: pressTotals ----
{
  const before = [{ name: 'Trail mix', units: 2, kcalEach: 400, edible: null, foodState: null }];
  const after = before.concat([
    { name: 'Muscadine Grapes', units: 8, kcalEach: 90, edible: true, foodState: 'raw' },
    { name: 'unknown shoots', units: 14, kcalEach: 0, edible: false, foodState: 'unknown', lump: {} },
  ]);
  const t = pressTotals(before, after);
  check('pressTotals known edible kcal', t.knownEdibleKcal === 720, 'got ' + t.knownEdibleKcal);
  check('pressTotals unknown units', t.unknownUnits === 14, 'got ' + t.unknownUnits);
  check('pressTotals unknown forms', JSON.stringify(t.unknownForms) === '["unknown shoots"]', 'got ' + JSON.stringify(t.unknownForms));
}
// ---- pure: findGatherTarget on a fake grid ----
{
  const grid = [];
  for (let y = 0; y < 9; y++) { grid.push([]); for (let x = 0; x < 9; x++) grid[y].push('grass'); }
  grid[0][5] = 'bigtree';
  const g = { state: { scholar: { mx: 7, my: 0 } }, map: { px: 4, py: 4 },
    genDetail: () => grid,
    cellProps: (c) => ({ blocks: c === 'tree' || c === 'bigtree' || c === 'wall' || c === 'water' }) };
  const tgt = findGatherTarget(g);
  check('findGatherTarget finds the bigtree', !!tgt && tgt.target.x === 5 && tgt.target.y === 0, JSON.stringify(tgt && tgt.target));
  check('findGatherTarget stance adjacent', !!tgt && Math.max(Math.abs(tgt.stance[0] - 5), Math.abs(tgt.stance[1] - 0)) <= 1, JSON.stringify(tgt && tgt.stance));
}
// ---- corpus checks (only when asked) ----
if (process.env.BANKFOOD_CORPUS_CHECK === '1') {
  const ROOT = path.join(__dirname, '..');
  const seeds = (process.env.BANKFOOD_TEST_SEEDS || '15003,15009,15091,15211,15215,15220,15221,15337').split(',').map((s) => s.trim()).filter(Boolean);
  const dirs = {
    control: process.env.BANKFOOD_TEST_CONTROL || 'evidence/2026-11-04/sim-bankfood-a-corpus-guard-control',
    variant: process.env.BANKFOOD_TEST_VARIANT || 'evidence/2026-11-04/sim-bankfood-a-corpus-guard-variant',
    off: process.env.BANKFOOD_TEST_OFF || 'evidence/2026-11-04/sim-bankfood-a-corpus-guard-off',
  };
  const load = (dir, seed) => {
    const f = path.join(ROOT, dir, 'bankfood-b-nighttravel-s' + seed + '.json');
    if (!fs.existsSync(f)) return null;
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  };
  const census = (inst) => {
    let creek = 0, still = 0, rescued = 0; const days = [];
    for (const r of inst.evenings || []) {
      const wc = r.woodcarry;
      if (!wc || wc.bucket !== 'creek') continue;
      creek++;
      if (wc.rescued) rescued++; else { still++; days.push(r.loopDay); }
    }
    return { creek, still, rescued, days };
  };
  for (const seed of seeds) {
    for (const leg of ['control', 'variant', 'off']) {
      const inst = load(dirs[leg], seed);
      check(`corpus ${leg} seed ${seed} present + parses`, !!inst);
      if (!inst) continue;
      check(`corpus ${leg} seed ${seed} bankfood errs 0`, (inst.bankfoodStore && inst.bankfoodStore.errs) === 0, 'errs=' + (inst.bankfoodStore && inst.bankfoodStore.errs));
      check(`corpus ${leg} seed ${seed} evenings recorded`, (inst.evenings || []).length > 0);
      for (const r of inst.evenings || []) {
        if (r.bankfoodEvening && (r.bankfoodEvening.mode === 'bank' || r.bankfoodEvening.mode === 'flip')) {
          check(`corpus ${leg} seed ${seed} loopDay ${r.loopDay} post-daily pack present`, !!r.postDailyPack, 'postDailyPack missing');
          break;
        }
      }
    }
    const c = load(dirs.control, seed), o = load(dirs.off, seed);
    if (c && o) {
      const cc = census(c), oc = census(o);
      check(`det-gate seed ${seed} off==control`, cc.creek === oc.creek && cc.still === oc.still && cc.rescued === oc.rescued && JSON.stringify(cc.days) === JSON.stringify(oc.days),
        'control=' + JSON.stringify(cc) + ' off=' + JSON.stringify(oc));
    }
  }
} else {
  console.log('SKIP corpus checks (set BANKFOOD_CORPUS_CHECK=1 to run them)');
}
console.log(`test-bankfood-b: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
