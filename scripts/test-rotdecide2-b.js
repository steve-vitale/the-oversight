// test-rotdecide2-b.js — proof test for the NEXT DECIDING rot corpus.
// T1 classification (all classes, via the analyzer module, synthetic cells).
// T2 binding GO rule (G1/G2/G3, incl. the prior-corpus shape that must NO-GO).
// T3 abs/median arithmetic + haul-bucket closure arithmetic.
// T4 corpus mode (--corpus <dir> --seeds <lo-hi> [--pilot]): 16/16 rows,
// 0 fatal, tags + contrast (via the loader), wrappers present on every
// cell, bucket closure (via the loader), GO verdict computable. With
// --pilot, additionally asserts invHaulActions > 0 on every pilot cell
// (the pilot non-vacuity bar); without --pilot, zero-haul cells are
// counted and reported, not failed (a village can die before hauling).
//
// No game code is loaded here (synthetic cells + real corpus files only).
// Corpus numbers are never computed by T1-T3: those tests use hand-made
// cells, so running them before the sweep cannot pre-judge the corpus.
'use strict';
const { classifyCompanion, absRot, median, goVerdict, analyze } = require('./analyze-rotdecide2-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function cell(rot, days, extra) {
  return Object.assign({
    rotFreshKcal: rot, rotPreservedKcal: 0, depriKcal: 0, daysAlive: days,
    national: false, waveReach: [1],
  }, extra || {});
}
// abs = rot/days*100; with days=100, abs == rot. Four cells per seed.
function seedCells(pPd0, pPd1, cPd0, cPd1) {
  return {
    parentPd0: cell(pPd0, 100), parentPd1: cell(pPd1, 100),
    commitPd0: cell(cPd0, 100), commitPd1: cell(cPd1, 100),
  };
}

// ---- T1: classification ----
check('T1 genuine', classifyCompanion(seedCells(100, 100, 100, 50)).cls === 'genuine');
check('T1 denominator-driven', classifyCompanion(seedCells(100, 100, 200, 100)).cls === 'denominator-driven');
check('T1 mixed', classifyCompanion(seedCells(100, 100, 200, 80)).cls === 'mixed');
check('T1 identical', classifyCompanion(seedCells(100, 50, 100, 50)).cls === 'identical');
check('T1 degenerate undefined-ratio', (() => {
  const c = classifyCompanion(seedCells(0, 50, 100, 50));
  return c.cls === 'degenerate' && c.reason === 'undefined-ratio';
})());
check('T1 degenerate pd1-zero-both', (() => {
  const c = classifyCompanion(seedCells(100, 0, 100, 0));
  return c.cls === 'degenerate' && c.reason === 'pd1-rot-zero-both';
})());
check('T1 up mild', (() => {
  const c = classifyCompanion(seedCells(100, 50, 100, 75));
  return c.cls === 'up' && c.magnitude === 'mild';
})());
check('T1 up sharp', (() => {
  const c = classifyCompanion(seedCells(100, 10, 100, 50));
  return c.cls === 'up' && c.magnitude === 'sharp';
})());
check('T1 up-from-zero', (() => {
  const c = classifyCompanion(seedCells(100, 0, 100, 50));
  // pd1 rot 0 on parent only (not both) -> up-from-zero, NOT degenerate (b).
  return c.cls === 'up' && c.magnitude === 'up-from-zero';
})());
check('T1 down-to-zero is genuine', (() => {
  const c = classifyCompanion(seedCells(100, 50, 100, 0));
  return c.cls === 'genuine' && c.step === 0;
})());
check('T1 denominator-driven with pd1 rise', (() => {
  // Both sides worse, denominator worse faster -> denominator-driven.
  const c = classifyCompanion(seedCells(100, 100, 500, 200));
  return c.cls === 'denominator-driven';
})());

// ---- T2: binding GO rule ----
check('T2 GO all conditions', (() => {
  const g = goVerdict(100, 90, 100, 105, { genuine: 2, 'denominator-driven': 1, mixed: 0 });
  return g.verdict === 'GO' && g.failed.length === 0;
})());
check('T2 G1 fail only', (() => {
  const g = goVerdict(100, 96, 100, 105, { genuine: 2, 'denominator-driven': 1, mixed: 0 });
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["G1"]';
})());
check('T2 G1 boundary 0.95 passes', (() => {
  const g = goVerdict(100, 95, 100, 100, { genuine: 1, 'denominator-driven': 0, mixed: 0 });
  return g.verdict === 'GO';
})());
check('T2 G2 fail only', (() => {
  const g = goVerdict(100, 90, 100, 100, { genuine: 1, 'denominator-driven': 1, mixed: 1 });
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["G2"]';
})());
check('T2 G2 boundary genuine == denom+mixed passes', (() => {
  const g = goVerdict(100, 90, 100, 100, { genuine: 2, 'denominator-driven': 1, mixed: 1 });
  return g.verdict === 'GO';
})());
check('T2 G3 fail only', (() => {
  const g = goVerdict(100, 90, 100, 115, { genuine: 3, 'denominator-driven': 0, mixed: 0 });
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["G3"]';
})());
check('T2 G3 boundary 1.10 passes', (() => {
  const g = goVerdict(100, 90, 100, 110, { genuine: 1, 'denominator-driven': 0, mixed: 0 });
  return g.verdict === 'GO';
})());
check('T2 prior-corpus shape must NO-GO on all three', (() => {
  // Primary leg2decide shape: median pd1 abs ROSE (x1.152), pd0 median
  // rose x1.315, down split genuine 2 vs denom 3 -> fails G1, G2, G3.
  const g = goVerdict(18706, 21545, 72687, 95572, { genuine: 2, 'denominator-driven': 3, mixed: 0 });
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["G1","G2","G3"]';
})());
check('T2 denominator-driven step alone never GO', (() => {
  // Ratio steps (pd1/pd0 falls) but pd1 abs flat and pd0 abs explodes.
  const g = goVerdict(100, 100, 100, 400, { genuine: 0, 'denominator-driven': 3, mixed: 0 });
  return g.verdict === 'NO-GO' && g.failed.includes('G1') && g.failed.includes('G2') && g.failed.includes('G3');
})());

// ---- T3: arithmetic ----
check('T3 absRot', absRot(cell(5000, 50)) === 10000);
check('T3 absRot daysAlive denominator (not villageDays)', absRot(Object.assign(cell(5000, 50), { villageDays: 500 })) === 10000);
check('T3 median even', median([3, 1, 2, 4]) === 2.5);
check('T3 median odd', median([5, 1, 3]) === 3);
check('T3 bucket closure arithmetic', (() => {
  const d = { pantryDepositActions: 10, pantryDepositKcal: 1000, invHaulActions: 7, invHaulKcal: 700, invStockExcludedActions: 2, invStockExcludedKcal: 200, invPiecesHomeExcludedActions: 1, invPiecesHomeExcludedKcal: 100, invPiecesForeignActions: 0, invPiecesForeignKcal: 0 };
  const sumA = d.invHaulActions + d.invStockExcludedActions + d.invPiecesHomeExcludedActions + d.invPiecesForeignActions;
  const sumK = d.invHaulKcal + d.invStockExcludedKcal + d.invPiecesHomeExcludedKcal + d.invPiecesForeignKcal;
  return sumA === d.pantryDepositActions && sumK === d.pantryDepositKcal;
})());

// ---- T4: corpus mode ----
const args = process.argv.slice(2);
const get = (flag, def) => { const i = args.indexOf(flag); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const corpus = get('--corpus', null);
const pilotMode = args.includes('--pilot');
if (corpus) {
  const seeds = get('--seeds', '9500-9515').split('-').map(Number);
  const res = analyze(corpus, seeds[0], seeds[1]);
  const expectSeeds = seeds[1] - seeds[0] + 1;
  check('T4 corpus rows == seeds', res.rows.length === expectSeeds, { rows: res.rows.length, expectSeeds });
  check('T4 corpus fatal empty', res.fatal.length === 0, res.fatal.slice(0, 5));
  check('T4 corpus counts sum to seeds', Object.values(res.counts).reduce((a, b) => a + b, 0) === expectSeeds, res.counts);
  check('T4 corpus no ambiguous', (res.counts.ambiguous || 0) === 0, res.counts);
  check('T4 corpus GO verdict computable', res.go && (res.go.verdict === 'GO' || res.go.verdict === 'NO-GO'), res.go);
  check('T4 corpus wall configs == 4x seeds', res.wall.configs === expectSeeds * 4, res.wall.configs);
  check('T4 corpus haul medians defined', res.medHaul && res.medHaul.invHaulKcalPd1Parent != null && res.medHaul.invHaulKcalPd1Commit != null);
  let wrappersOk = true, zeroHaulCells = 0, totalCells = 0;
  for (const r of res.rows) {
    for (const c of [r.parentPd0, r.parentPd1, r.commitPd0, r.commitPd1]) {
      totalCells++;
      const w = c.wrappers;
      if (!w || !['stockPantry', 'depositPantryPieces', 'preserveFood', 'renderFat', 'makePemmican', 'creditDeed'].every((k) => typeof w[k] === 'boolean')) wrappersOk = false;
      if (c.invHaulActions === 0) zeroHaulCells++;
    }
  }
  check('T4 corpus wrappers present on every cell', wrappersOk);
  console.log(`T4 corpus cells=${totalCells} zero-invHaul-cells=${zeroHaulCells}`);
  if (pilotMode) check('T4 pilot invHaulActions > 0 on every cell', zeroHaulCells === 0, { zeroHaulCells });
}

console.log(`${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
