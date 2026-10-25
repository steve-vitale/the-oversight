// test-preserveact-b.js — proof test for the preserve-ACTION corpus.
// T1 binding GO rule (P1 + C1 + C2, incl. boundaries and OFF-median-0
// edge cases). T2 total-action arithmetic + median. T3 rot
// classification (rotcompanion template, off/on naming) + bucket
// closure arithmetic. T4 corpus mode (--corpus <dir> --seeds <lo-hi>
// [--pilot] [--base <sha>]): rows, fatal empty, tags + contrast (via
// the loader), wrappers present on every cell, batches >= resolutions
// on every cell (violations must be 0), bucket closure (via the
// loader), GO verdict computable. With --pilot, additionally asserts
// invHaulActions > 0 on every pilot cell (pilot non-vacuity bar) and
// preserve fields present (non-null integers) on every pilot cell.
//
// No game code is loaded here (synthetic cells + real corpus files
// only). Corpus numbers are never computed by T1-T3: those tests use
// hand-made cells, so running them before the sweep cannot pre-judge
// the corpus.
'use strict';
const { classifyRot, absRot, totalActions, median, goVerdict, analyze } = require('./analyze-preserveact-b');

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
function seedCells(oPd0, oPd1, nPd0, nPd1) {
  return {
    offPd0: cell(oPd0, 100), offPd1: cell(oPd1, 100),
    onPd0: cell(nPd0, 100), onPd1: cell(nPd1, 100),
  };
}

// ---- T1: binding GO rule ----
// goVerdict(medOff, medOn, starvOff, starvOn, daysOff, daysOn).
check('T1 GO all conditions', (() => {
  const g = goVerdict(40, 50, 10, 11, 100, 90);
  return g.verdict === 'GO' && g.failed.length === 0;
})());
check('T1 P1 boundary 1.25 passes', (() => {
  const g = goVerdict(40, 50, 10, 10, 100, 100);
  return g.verdict === 'GO';
})());
check('T1 P1 fail only (1.24x)', (() => {
  const g = goVerdict(100, 124, 10, 10, 100, 100);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["P1"]';
})());
check('T1 P1 OFF-median-0 + ON > 0 passes', (() => {
  const g = goVerdict(0, 5, 10, 10, 100, 100);
  return g.verdict === 'GO' && g.ratio == null;
})());
check('T1 P1 both medians 0 fails', (() => {
  const g = goVerdict(0, 0, 10, 10, 100, 100);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["P1"]';
})());
check('T1 C1 boundary OFF+2 passes', (() => {
  const g = goVerdict(40, 60, 10, 12, 100, 100);
  return g.verdict === 'GO';
})());
check('T1 C1 fail only (OFF+3)', (() => {
  const g = goVerdict(40, 60, 10, 13, 100, 100);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["C1"]';
})());
check('T1 C2 boundary 0.8x passes', (() => {
  const g = goVerdict(40, 60, 10, 10, 100, 80);
  return g.verdict === 'GO';
})());
check('T1 C2 fail only (0.79x)', (() => {
  const g = goVerdict(40, 60, 10, 10, 100, 79);
  return g.verdict === 'NO-GO' && JSON.stringify(g.failed) === '["C2"]';
})());
check('T1 rotdecide2-shape preserve counts still judged on actions, not rot', (() => {
  // Even with rot medians rising (the rotdecide2 shape), the GO rule
  // here judges ONLY action medians + cost guards: strong action rise
  // with clean guards GOes regardless of rot.
  const g = goVerdict(35, 50, 5, 5, 100, 100);
  return g.verdict === 'GO';
})());

// ---- T2: arithmetic ----
check('T2 totalActions batches + attempts', totalActions({ preserveVillagerBatches: 37, preserveAttempts: 0 }) === 37);
check('T2 totalActions scholar attempts counted when present', totalActions({ preserveVillagerBatches: 37, preserveAttempts: 3 }) === 40);
check('T2 totalActions missing fields default 0', totalActions({}) === 0);
check('T2 absRot daysAlive denominator (not villageDays)', absRot(Object.assign(cell(5000, 50), { villageDays: 500 })) === 10000);
check('T2 median even', median([3, 1, 2, 4]) === 2.5);
check('T2 median odd', median([5, 1, 3]) === 3);
check('T2 median empty null', median([]) === null);

// ---- T3: rot classification (diagnostic template) + bucket arithmetic ----
check('T3 genuine', classifyRot(seedCells(100, 100, 100, 50)).cls === 'genuine');
check('T3 denominator-driven', classifyRot(seedCells(100, 100, 200, 100)).cls === 'denominator-driven');
check('T3 mixed', classifyRot(seedCells(100, 100, 200, 80)).cls === 'mixed');
check('T3 identical', classifyRot(seedCells(100, 50, 100, 50)).cls === 'identical');
check('T3 degenerate undefined-ratio', (() => {
  const c = classifyRot(seedCells(0, 50, 100, 50));
  return c.cls === 'degenerate' && c.reason === 'undefined-ratio';
})());
check('T3 degenerate pd1-zero-both', (() => {
  const c = classifyRot(seedCells(100, 0, 100, 0));
  return c.cls === 'degenerate' && c.reason === 'pd1-rot-zero-both';
})());
check('T3 up-from-zero', (() => {
  const c = classifyRot(seedCells(100, 0, 100, 50));
  return c.cls === 'up' && c.magnitude === 'up-from-zero';
})());
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
  const seeds = get('--seeds', '9750-9757').split('-').map(Number);
  const base = get('--base', null);
  const res = analyze(corpus, seeds[0], seeds[1], base);
  const expectSeeds = seeds[1] - seeds[0] + 1;
  check('T4 corpus rows == seeds', res.rows.length === expectSeeds, { rows: res.rows.length, expectSeeds });
  check('T4 corpus fatal empty', res.fatal.length === 0, res.fatal.slice(0, 5));
  check('T4 corpus counts sum to seeds', Object.values(res.counts).reduce((a, b) => a + b, 0) === expectSeeds, res.counts);
  check('T4 corpus no ambiguous', (res.counts.ambiguous || 0) === 0, res.counts);
  check('T4 corpus GO verdict computable', res.go && (res.go.verdict === 'GO' || res.go.verdict === 'NO-GO'), res.go);
  check('T4 corpus wall configs == 4x seeds', res.wall.configs === expectSeeds * 4, res.wall.configs);
  check('T4 corpus action medians defined', res.med && res.med.actionsPooledOff != null && res.med.actionsPooledOn != null, res.med);
  check('T4 corpus batches >= resolutions violations 0', res.violations.length === 0, res.violations.slice(0, 5));
  let wrappersOk = true, zeroHaulCells = 0, totalCells = 0, preserveFieldsOk = true;
  for (const r of res.rows) {
    for (const c of [r.offPd0, r.offPd1, r.onPd0, r.onPd1]) {
      totalCells++;
      const w = c.wrappers;
      if (!w || !['stockPantry', 'depositPantryPieces', 'preserveFood', 'renderFat', 'makePemmican', 'creditDeed'].every((k) => typeof w[k] === 'boolean')) wrappersOk = false;
      if (c.invHaulActions === 0) zeroHaulCells++;
      for (const hf of ['preserveAttempts', 'preserveSuccessItems', 'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions']) {
        if (c[hf] == null || !Number.isInteger(c[hf]) || c[hf] < 0) preserveFieldsOk = false;
      }
    }
  }
  check('T4 corpus wrappers present on every cell', wrappersOk);
  check('T4 corpus preserve fields present on every cell', preserveFieldsOk);
  console.log(`T4 corpus cells=${totalCells} zero-invHaul-cells=${zeroHaulCells}`);
  if (pilotMode) {
    check('T4 pilot invHaulActions > 0 on every cell', zeroHaulCells === 0, { zeroHaulCells });
    check('T4 pilot GO verdict computable', res.go && (res.go.verdict === 'GO' || res.go.verdict === 'NO-GO'));
  }
}

console.log(`${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
