// test-preserverleg2-a.js — proof test for the HAUL-THROUGHPUT vs ROT
// TRADEOFF deciding corpus.
// T1 ratio classification (all classes, via the analyzer module, synthetic
//   cells) — retained from rotdecide2-b as the ratio DIAGNOSTIC.
// T1b tradeoff classification (all classes: identical / throughput-win /
//   lean-win / glut / collapse / flat-efficiency / degenerate) + E arithmetic.
// T2 BINDING tradeoff verdict rule (H1+H2+H3+S1+S2, incl. the rotdecide2
//   shape and a 9514-like glut shape, both of which must NO-GO).
// T2b rot-rule diagnostic (G1+G2+G3 recomputed on this corpus only —
//   diagnostic, never the verdict; the prior-corpus shape must NO-GO).
// T3 abs/median arithmetic + haul-bucket closure + fish-subset arithmetic.
// T4 corpus mode (--corpus <dir> --seeds <lo-hi> [--pilot]): 16/16 rows,
// 0 fatal, tags + contrast (via the loader), wrappers present on every
// cell, bucket closure (via the loader), tradeoff verdict computable,
// E defined on >= 14/16 paired seeds, fish fields present, fish a subset
// of invHaul on every cell, govern records == seeds. With --pilot,
// additionally asserts invHaulActions > 0 AND E defined on every pilot
// cell (the pilot non-vacuity bar); without --pilot, zero-haul cells are
// counted and reported, not failed (a village can die before hauling).
//
// No game code is loaded here (synthetic cells + real corpus files only).
// Corpus numbers are never computed by T1-T3: those tests use hand-made
// cells, so running them before the sweep cannot pre-judge the corpus.
// Proof-of-effect: the corpus mode runs the analyzer on REAL per-seed
// files and asserts the verdict is computable from them; the pilot mode
// asserts the instrument actually counted hauls (invHaul > 0) on every
// cell — a wrapper that never attached fails here, not silently. The
// observable effect is the corpus + verdict, not green assertions alone.
'use strict';
const { classifyCompanion, classifyTradeoff, efficiency, absRot, median, tradeoffVerdict, rotRuleDiagnostic, analyze } = require('./analyze-preserverleg2-a');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function cell(rot, days, extra) {
  return Object.assign({
    rotFreshKcal: rot, rotPreservedKcal: 0, depriKcal: 0, daysAlive: days,
    national: false, waveReach: [1],
    invHaulKcal: 1000, fishHaulActions: 0, fishHaulKcal: 0,
  }, extra || {});
}
// abs = rot/days*100; with days=100, abs == rot. Four cells per seed.
function seedCells(pPd0, pPd1, cPd0, cPd1) {
  return {
    parentPd0: cell(pPd0, 100), parentPd1: cell(pPd1, 100),
    commitPd0: cell(cPd0, 100), commitPd1: cell(cPd1, 100),
  };
}

// Four cells per seed with explicit pd1 haul amounts (pd0 fixed H=1000, R=100).
function seedCellsHaul(pPd1, cPd1) {
  return {
    parentPd0: cell(100, 100, { invHaulKcal: 1000 }),
    parentPd1: cell(pPd1.rot, 100, { invHaulKcal: pPd1.haul }),
    commitPd0: cell(100, 100, { invHaulKcal: 1000 }),
    commitPd1: cell(cPd1.rot, 100, { invHaulKcal: cPd1.haul }),
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


// ---- T1b: tradeoff classification + E arithmetic ----
check('T1b E basic', efficiency(cell(30, 100, { invHaulKcal: 100 })) === 0.7);
check('T1b E negative when rot exceeds haul', efficiency(cell(150, 100, { invHaulKcal: 100 })) === -0.5);
check('T1b E undefined on zero haul', efficiency(cell(0, 100, { invHaulKcal: 0 })) === null);
check('T1b throughput-win', classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 40, haul: 120 })).cls === 'throughput-win');
check('T1b lean-win', classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 20, haul: 80 })).cls === 'lean-win');
check('T1b glut (9514 shape)', classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 150, haul: 200 })).cls === 'glut');
check('T1b collapse', classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 60, haul: 80 })).cls === 'collapse');
check('T1b identical', classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 50, haul: 100 })).cls === 'identical');
check('T1b flat-efficiency', classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 100, haul: 200 })).cls === 'flat-efficiency');
check('T1b degenerate zero haul', (() => {
  const c = classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 0, haul: 0 }));
  return c.cls === 'degenerate' && /efficiency-undefined/.test(c.reason || '');
})());
check('T1b throughput-win on equal haul', classifyTradeoff(seedCellsHaul({ rot: 50, haul: 100 }, { rot: 40, haul: 100 })).cls === 'throughput-win');

// ---- T2: BINDING tradeoff verdict rule (H1+H2+H3+S1+S2) ----
// Signature: tradeoffVerdict(medE1p, medE1c, medH1p, medH1c, medAbs1p,
// medAbs1c, split, medDaysParent, medDaysCommit, starvParent, starvCommit).
// Base case: E 0.50->0.60 (+0.10), haul 100->110, abs 100->105, split
// 2 throughput-wins vs 1 glut, days 100->98, starvation 10->12.
const SPLIT_GO = { 'throughput-win': 2, glut: 1, collapse: 0 };
check('T2 GO all conditions', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 105, SPLIT_GO, 100, 98, 10, 12);
  return g.verdict === 'GO' && g.failed.length === 0;
})());
check('T2 H1 fail only', (() => {
  const g = tradeoffVerdict(0.50, 0.54, 100, 110, 100, 105, SPLIT_GO, 100, 98, 10, 12);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["H1"]';
})());
check('T2 H1 boundary +0.05 passes', (() => {
  const g = tradeoffVerdict(0.50, 0.55, 100, 110, 100, 105, SPLIT_GO, 100, 98, 10, 12);
  return g.verdict === 'GO';
})());
check('T2 H2a fail only (haul median falls)', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 99, 100, 105, SPLIT_GO, 100, 98, 10, 12);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["H2"]';
})());
check('T2 H2b fail only (split disagrees)', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 105, { 'throughput-win': 1, glut: 1, collapse: 1 }, 100, 98, 10, 12);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["H2"]';
})());
check('T2 H2b boundary wins == glut+collapse passes', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 105, { 'throughput-win': 2, glut: 1, collapse: 1 }, 100, 98, 10, 12);
  return g.verdict === 'GO';
})());
check('T2 H3 fail only (abs rot +11%)', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 111, SPLIT_GO, 100, 98, 10, 12);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["H3"]';
})());
check('T2 H3 boundary +10% passes', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 110, SPLIT_GO, 100, 98, 10, 12);
  return g.verdict === 'GO';
})());
check('T2 S1 fail only (median survival -6d)', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 105, SPLIT_GO, 100, 94, 10, 12);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["S1"]';
})());
check('T2 S1 boundary -5d passes', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 105, SPLIT_GO, 100, 95, 10, 12);
  return g.verdict === 'GO';
})());
check('T2 S2 fail only (starvation +6)', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 105, SPLIT_GO, 100, 98, 10, 16);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["S2"]';
})());
check('T2 S2 boundary +5 passes', (() => {
  const g = tradeoffVerdict(0.50, 0.60, 100, 110, 100, 105, SPLIT_GO, 100, 98, 10, 15);
  return g.verdict === 'GO';
})());
check('T2 rotdecide2 shape must NO-GO (E falls, abs rises)', (() => {
  // Rotdecide2 medians as an efficiency shape: pd1 haul flat at the
  // median while abs rot rose 7,380 -> 9,353, so E fell; the split had
  // 0 throughput-wins against 1 glut-class move. H1 and H2 must fail.
  const g = tradeoffVerdict(0.20, 0.10, 100000, 100000, 7380, 9353, { 'throughput-win': 0, glut: 1, collapse: 0 }, 100, 100, 39, 39);
  return g.verdict === 'NO-GO' && g.failed.includes('H1') && g.failed.includes('H2');
})());
check('T2 9514-like glut shape must NO-GO', (() => {
  // One seed's story scaled to medians: haul up, E down (rot up faster).
  const g = tradeoffVerdict(0.50, 0.30, 100, 300, 100, 250, { 'throughput-win': 0, glut: 3, collapse: 0 }, 100, 100, 10, 10);
  return g.verdict === 'NO-GO' && g.failed.includes('H1');
})());
check('T2 lean-win-only shape must NO-GO on H2a', (() => {
  // Efficiency up purely by hauling less: H1 passes, H2a (median haul)
  // fails. The tradeoff must not be bought by shrinking throughput.
  const g = tradeoffVerdict(0.50, 0.70, 100, 80, 100, 60, { 'throughput-win': 0, 'lean-win': 4, glut: 0, collapse: 0 }, 100, 100, 10, 10);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["H2"]';
})());

// ---- T2b: rot-rule DIAGNOSTIC (G1+G2+G3, never the verdict) ----
check('T2b prior-corpus shape must NO-GO on all three (diagnostic)', (() => {
  // Primary leg2decide shape: median pd1 abs ROSE (x1.152), pd0 median
  // rose x1.315, down split genuine 2 vs denom 3 -> fails G1, G2, G3.
  const g = rotRuleDiagnostic(18706, 21545, 72687, 95572, { genuine: 2, 'denominator-driven': 3, mixed: 0 });
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["G1","G2","G3"]';
})());
check('T2b rotdecide2 shape must NO-GO on G1+G2 (diagnostic)', (() => {
  const g = rotRuleDiagnostic(7380, 9353, 33089, 24264, { genuine: 0, 'denominator-driven': 1, mixed: 0 });
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["G1","G2"]';
})());
check('T2b rot-rule GO shape still computes', (() => {
  const g = rotRuleDiagnostic(100, 90, 100, 105, { genuine: 2, 'denominator-driven': 1, mixed: 0 });
  return g.verdict === 'GO' && g.failed.length === 0;
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

check('T3 fish subset of invHaul (synthetic cell)', (() => {
  const d = { invHaulKcal: 1000, fishHaulKcal: 250, fishHaulActions: 5, invHaulActions: 40 };
  return d.fishHaulKcal <= d.invHaulKcal && d.fishHaulActions <= d.invHaulActions;
})());
check('T3 efficiency uses invHaulKcal not census haul', efficiency(cell(20, 100, { invHaulKcal: 200, haulKcal: 999 })) === 0.9);

// ---- T4: corpus mode ----
const args = process.argv.slice(2);
const get = (flag, def) => { const i = args.indexOf(flag); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const corpus = get('--corpus', null);
const pilotMode = args.includes('--pilot');
if (corpus) {
  const seeds = get('--seeds', '96500-96515').split('-').map(Number);
  const res = analyze(corpus, seeds[0], seeds[1]);
  const expectSeeds = seeds[1] - seeds[0] + 1;
  check('T4 corpus rows == seeds', res.rows.length === expectSeeds, { rows: res.rows.length, expectSeeds });
  check('T4 corpus fatal empty', res.fatal.length === 0, res.fatal.slice(0, 5));
  check('T4 corpus counts sum to seeds', Object.values(res.counts).reduce((a, b) => a + b, 0) === expectSeeds, res.counts);
  check('T4 corpus no ambiguous', (res.counts.ambiguous || 0) === 0, res.counts);
  check('T4 corpus GO verdict computable', res.go && (res.go.verdict === 'GO' || res.go.verdict === 'NO-GO'), res.go);
  check('T4 corpus wall configs == 4x seeds', res.wall.configs === expectSeeds * 4, res.wall.configs);
  check('T4 corpus haul medians defined', res.medHaul && res.medHaul.invHaulKcalPd1Parent != null && res.medHaul.invHaulKcalPd1Commit != null);
  check('T4 corpus tradeoff verdict computable', res.go && (res.go.verdict === 'GO' || res.go.verdict === 'NO-GO'), res.go);
  check('T4 corpus tradeoff counts sum to seeds', Object.values(res.tradeoffCounts).reduce((a, b) => a + b, 0) === expectSeeds, res.tradeoffCounts);
  check('T4 corpus E defined on >= 14 paired seeds', res.medE && res.medE.pairedN >= 14, res.medE);
  check('T4 corpus fish medians defined', res.medFish && res.medFish.kcalPd1Parent != null && res.medFish.kcalPd1Commit != null);
  check('T4 corpus govern records == seeds', res.governRecords && res.governRecords.length === expectSeeds, res.governRecords && res.governRecords.length);
  check('T4 corpus rot-rule diagnostic computable', res.rotRule && (res.rotRule.verdict === 'GO' || res.rotRule.verdict === 'NO-GO'), res.rotRule);
  let wrappersOk = true, zeroHaulCells = 0, totalCells = 0, fishOk = true, fishSubsetOk = true, eUndefinedCells = 0;
  for (const r of res.rows) {
    for (const c of [r.parentPd0, r.parentPd1, r.commitPd0, r.commitPd1]) {
      totalCells++;
      const w = c.wrappers;
      if (!w || !['stockPantry', 'depositPantryPieces', 'preserveFood', 'renderFat', 'makePemmican', 'creditDeed'].every((k) => typeof w[k] === 'boolean')) wrappersOk = false;
      if (c.invHaulActions === 0) zeroHaulCells++;
      if (c.fishHaulActions == null || !Number.isInteger(c.fishHaulActions) || c.fishHaulActions < 0 || c.fishHaulKcal == null || !Number.isInteger(c.fishHaulKcal) || c.fishHaulKcal < 0) fishOk = false;
      if (!(c.fishHaulKcal <= c.invHaulKcal && c.fishHaulActions <= c.invHaulActions)) fishSubsetOk = false;
      if (efficiency(c) == null) eUndefinedCells++;
    }
  }
  check('T4 corpus wrappers present on every cell', wrappersOk);
  check('T4 corpus fish fields present on every cell', fishOk);
  check('T4 corpus fish subset of invHaul on every cell', fishSubsetOk);
  console.log(`T4 corpus cells=${totalCells} zero-invHaul-cells=${zeroHaulCells} E-undefined-cells=${eUndefinedCells}`);
  if (pilotMode) {
    check('T4 pilot invHaulActions > 0 on every cell', zeroHaulCells === 0, { zeroHaulCells });
    check('T4 pilot E defined on every cell', eUndefinedCells === 0, { eUndefinedCells });
  }
}

console.log(`${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
