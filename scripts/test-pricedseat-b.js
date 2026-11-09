// test-pricedseat-b.js — proof for the takeseat analyzer earned-count
// repair (arm sim-pricedseat-b, run fleshout-loop-b-20261109T0630Z).
//
// The defect (sim-sitmetric-sweep-b, bar 4): the takeseat analyzer's
// substrate-sanity bar counted TAKEN seats as EARNED — analyzeSeed's
// finalSeat is the ALIGNED (taken) seat, so the baseline leg (sitting
// switched off, 5 lesser seats priced, 0 taken) read 0/8 against the
// recorded earned 5/8 and flipped the verdict GO -> "NO-GO
// (substrate)". The repair: pricedSeatOf — the analyzer reads the
// PRICED seat (finalSeatPriced on new-instrument rows, the raw
// finalSeat on old rows) separately from the TAKEN seat (finalSeat).
// The same mislabeling is repaired in the feareddoor/darkwit
// analyzers' baseSeatsEarned fields.
//
// Proof: pricedSeatOf fixtures on both corpus generations; known-case
// earned/taken counts on the real committed corpora; the three
// analyzers re-run (takeseat GO, feareddoor/darkwit verdicts stand
// with only baseSeatsEarned moving); the six sweep-corpus pairs judge
// identically to their recorded goldens through the UNCHANGED
// scorecard; and a cross-check that pricedSeatOf agrees with the raw
// priced seat on every old-corpus row. Exit non-zero on any failure.
// Nothing is written into the repo (analyzer scratch goes to /tmp).
// Usage: node scripts/test-pricedseat-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const child = require('child_process');
const REPO = path.join(__dirname, '..');
const { pricedSeatOf, seatTakenOf, alignedSeat } = require(path.join(REPO, 'scripts', 'lib', 'seat-taken'));
const TK = require(path.join(REPO, 'scripts', 'takeseat-b-analyze-20261107'));
const FD = require(path.join(REPO, 'scripts', 'feareddoor-b-analyze-20261107'));
const DW = require(path.join(REPO, 'scripts', 'darkwit-b-analyze-20261107'));
const score = require(path.join(REPO, 'scripts', 'lib', 'balance-scorecard'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function sha(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function loadDir(dir) {
  return fs.readdirSync(path.join(REPO, dir)).sort()
    .filter(function (f) { return f.endsWith('.json'); })
    .map(function (f) { return JSON.parse(fs.readFileSync(path.join(REPO, dir, f), 'utf8')); });
}

// ---------- (1) pricedSeatOf fixtures: both corpus generations ----------
(function () {
  // Old row: no finalSeatPriced; finalSeat IS the priced seat.
  check('priced-old-object', pricedSeatOf({ finalSeat: { seat: 'lesser', detail: {} } }) === 'lesser', '');
  check('priced-old-string', pricedSeatOf({ finalSeat: 'lesser' }) === 'lesser', '');
  check('priced-old-none', pricedSeatOf({ finalSeat: { seat: 'none', detail: {} } }) === 'none', '');
  // New row: finalSeat is the TAKEN seat ('none' here); the priced
  // seat comes from finalSeatPriced and must win over it.
  check('priced-new-preferred', pricedSeatOf({
    finalSeat: { seat: 'none', detail: {} }, finalSeatPriced: { seat: 'lesser', detail: {} },
    seatTaken: false }) === 'lesser', '');
  // New row, taken: priced and taken agree; the priced reading is
  // still the priced field, not the taken one.
  check('priced-new-taken', pricedSeatOf({
    finalSeat: { seat: 'lesser', detail: {} }, finalSeatPriced: { seat: 'lesser', detail: {} },
    seatTaken: true }) === 'lesser', '');
  // New row, priced 'full' but taken lesser is impossible in the
  // instrument (taken seat IS the priced seat when taken) — the
  // derivation still trusts finalSeatPriced, the priced field.
  check('priced-new-full', pricedSeatOf({
    finalSeat: { seat: 'lesser' }, finalSeatPriced: { seat: 'full' }, seatTaken: true }) === 'full', '');
  // finalSeatPriced present but empty: fall back to finalSeat.
  check('priced-new-empty-fallback', pricedSeatOf({
    finalSeat: { seat: 'lesser' }, finalSeatPriced: {} }) === 'lesser', '');
  check('priced-new-null-fallback', pricedSeatOf({
    finalSeat: { seat: 'lesser' }, finalSeatPriced: null }) === 'lesser', '');
  // No priced signal at all: null, never invented.
  check('priced-no-signal', pricedSeatOf({}) === null && pricedSeatOf(null) === null &&
    pricedSeatOf({ finalSeat: { detail: {} } }) === null, '');
  // alignedSeat is UNCHANGED by the repair on every shape above:
  // the taken reading never consults finalSeatPriced for its verdict.
  check('aligned-new-untaken', alignedSeat({
    finalSeat: { seat: 'none', detail: {} }, finalSeatPriced: { seat: 'lesser' },
    seatTaken: false }) === 'none', '');
  check('aligned-new-taken', alignedSeat({
    finalSeat: { seat: 'lesser', detail: {} }, finalSeatPriced: { seat: 'lesser' },
    seatTaken: true }) === 'lesser', '');
  check('aligned-new-noboolean', alignedSeat({
    finalSeat: { seat: 'lesser' }, finalSeatPriced: { seat: 'lesser' },
    takeseatStats: { seatTaken: 1 } }) === 'lesser', '');
  // No taken/not-taken signal: the priced reading stands, as before.
  check('aligned-unknown-preserved', seatTakenOf({ finalSeat: { seat: 'lesser' },
    finalSeatPriced: { seat: 'lesser' } }) === null &&
    alignedSeat({ finalSeat: { seat: 'lesser' }, finalSeatPriced: { seat: 'lesser' } }) === 'lesser', '');
})();

// ---------- (2) known cases: earned vs taken on the real corpora ----------
(function () {
  const earned = function (rows) {
    return rows.filter(function (r) { return pricedSeatOf(r) === 'lesser' || pricedSeatOf(r) === 'full'; }).length;
  };
  const taken = function (rows) {
    return rows.filter(function (r) { return alignedSeat(r) === 'lesser' || alignedSeat(r) === 'full'; }).length;
  };
  // takeseat baseline: 5 earned, 0 taken; armed: 5 earned, 5 taken.
  const tkB = loadDir('evidence/2026-11-07/perseed-takeseat-b-baseline');
  const tkA = loadDir('evidence/2026-11-07/perseed-takeseat-b-armed');
  check('known-takeseat-baseline', earned(tkB) === 5 && taken(tkB) === 0,
    'earned=' + earned(tkB) + ' taken=' + taken(tkB));
  check('known-takeseat-armed', earned(tkA) === 5 && taken(tkA) === 5,
    'earned=' + earned(tkA) + ' taken=' + taken(tkA));
  // The analyzers carry BOTH fields per row now, and the sanity bar
  // reads the priced one.
  const tkBRows = tkB.map(function (o) { return TK.analyzeSeed(o); });
  check('known-takeseat-rows', tkBRows.filter(function (r) { return r.finalSeatPriced === 'lesser'; }).length === 5 &&
    tkBRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length === 0,
    JSON.stringify(tkBRows.map(function (r) { return [r.seed, r.finalSeatPriced, r.finalSeat]; })));
  // darkwit 53201-baseline leg: 3 earned, 0 taken (per-row read — no
  // armed leg exists to pair it with; see the prereg).
  const dwOld = loadDir('evidence/2026-11-07/perseed-darkwit-b-baseline');
  check('known-darkwit-53201', earned(dwOld) === 3 && taken(dwOld) === 0,
    'earned=' + earned(dwOld) + ' taken=' + taken(dwOld));
  const dwOldRows = dwOld.map(function (o) { return DW.analyzeSeed(o); });
  check('known-darkwit-53201-rows', dwOldRows.filter(function (r) { return r.finalSeatPriced === 'lesser'; }).length === 3 &&
    dwOldRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length === 0, '');
  // feareddoor baseline: 6 earned, 5 taken; seed 53210 on both legs:
  // earned 'lesser', taken 'none'.
  const fdB = loadDir('evidence/2026-11-07/perseed-feareddoor-b-baseline');
  const fdA = loadDir('evidence/2026-11-07/perseed-feareddoor-b-armed');
  check('known-feareddoor-baseline', earned(fdB) === 6 && taken(fdB) === 5,
    'earned=' + earned(fdB) + ' taken=' + taken(fdB));
  const s10b = fdB.find(function (r) { return r.seed === 53210; });
  const s10a = fdA.find(function (r) { return r.seed === 53210; });
  check('known-feareddoor-53210', pricedSeatOf(s10b) === 'lesser' && alignedSeat(s10b) === 'none' &&
    pricedSeatOf(s10a) === 'lesser' && alignedSeat(s10a) === 'none',
    'b=' + pricedSeatOf(s10b) + '/' + alignedSeat(s10b) + ' a=' + pricedSeatOf(s10a) + '/' + alignedSeat(s10a));
  const s10row = FD.analyzeSeed(s10b);
  check('known-feareddoor-53210-row', s10row.finalSeatPriced === 'lesser' && s10row.finalSeat === 'none', '');
  // darkwit fresh pair: baseline 5 earned, armed 6 earned.
  const dwB = loadDir('evidence/2026-11-07/perseed-darkwit-b-pilot-baseline-fresh');
  const dwA = loadDir('evidence/2026-11-07/perseed-darkwit-b-pilot-armed-fresh');
  check('known-darkwit-fresh', earned(dwB) === 5 && earned(dwA) === 6,
    'earned b=' + earned(dwB) + ' a=' + earned(dwA));
})();

// ---------- (3) analyzer verdicts, re-run on the existing corpora ----------
(function () {
  function runAnalyzer(script, args) {
    const out = child.execSync('node ' + path.join(REPO, 'scripts', script) + (args || ''),
      { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    return JSON.parse(out);
  }
  // takeseat: the defect's verdict — GO under the repaired analyzer.
  const tk = runAnalyzer('takeseat-b-analyze-20261107.js');
  check('verdict-takeseat-go', tk.verdict.overall === 'GO', tk.verdict.overall);
  check('verdict-takeseat-fields', tk.verdict.primary.pass === true &&
    tk.verdict.primary.satArmed === 5 && tk.verdict.primary.satBaseline === 0 &&
    tk.verdict.substrateSanity.baseSeatsEarned === 5 && tk.verdict.substrateSanity.pass === true &&
    tk.verdict.substrateGuard.exactSeeds === 8 && tk.verdict.substrateGuard.pass === true &&
    tk.verdict.costBar.pass === true, JSON.stringify(tk.verdict));
  // feareddoor: verdict STANDS (NO-GO, primary fails); only the
  // earned count moves, 5 -> 6.
  const fd = runAnalyzer('feareddoor-b-analyze-20261107.js');
  check('verdict-feareddoor-stands', fd.verdict.overall === 'NO-GO' &&
    fd.verdict.substrateSanity.baseSeatsEarned === 6 &&
    fd.verdict.substrateSanity.baseSat === 5 && fd.verdict.substrateSanity.armedSat === 5 &&
    fd.verdict.primary.pass === false && fd.verdict.primary.winDelta === 0 &&
    fd.verdict.substrateGuard.exactSeeds === 12 && fd.verdict.costBar.pass === true,
    JSON.stringify({ overall: fd.verdict.overall, sanity: fd.verdict.substrateSanity }));
  // darkwit fresh pair: verdict STANDS (NO-GO at pilot); the earned
  // count is unchanged at 5 (priced was already 5 there).
  const dw = runAnalyzer('darkwit-b-analyze-20261107.js',
    ' evidence/2026-11-07/perseed-darkwit-b-pilot-baseline-fresh evidence/2026-11-07/perseed-darkwit-b-pilot-armed-fresh');
  check('verdict-darkwit-stands', dw.verdict.overall === 'NO-GO' &&
    dw.verdict.substrateSanity.baseSeatsEarned === 5 &&
    dw.verdict.substrateSanity.baseSat === 5 && dw.verdict.substrateSanity.armedSat === 2 &&
    dw.verdict.primary.pass === false && dw.verdict.primary.darkWitnessEnteredArmed === 0 &&
    dw.verdict.substrateGuard.exactSeeds === 8 && dw.verdict.costBar.pass === false,
    JSON.stringify({ overall: dw.verdict.overall, sanity: dw.verdict.substrateSanity }));
})();

// ---------- (4) six-pair invariance through the UNCHANGED scorecard ----------
// Goldens copied from scripts/test-sitmetric-sweep-b.js (recorded from
// the unmodified code; the scorecard is untouched by this arm, so the
// judged values must be byte-identical here too).
const GOLDEN_TABLE = { id: 'table', label: 'Table sitting rate (seat taken, whether or not a waiting invitation was observed)',
  unit: 'fraction', direction: 'higher', tolerance: 0.02, reviewChanges: false, status: 'not_observed',
  coverageChanged: false, eligibleBefore: 0, eligibleAfter: 0, pairs: 0, before: null, after: null, delta: null,
  interval95: [null, null], pairedP10: null, pairedMedian: null, pairedP90: null,
  increased: 0, decreased: 0, better: 0, worse: 0, tied: 0 };
const GOLDENS = {
  takeseat: { decision: 'review_required', cases: 8, digest: '460a36fdfbf3a19cffa1e26fffaa6a71b1c2264c8b9c6b32aeac18df8e01b885' },
  feareddoor: { decision: 'review_required', cases: 12, digest: 'eeaa356cdc1a36f15dfbd4b8e9b6f76579da8fc7b3353a357bff280267f90730' },
  'darkwit-fresh': { decision: 'review_required', cases: 8, digest: 'f202d5baa641882f4e6a04688082a15865d975221f7cd272ccec2b4a3ac347ff' },
  'darkwit-53201': { decision: 'review_required', cases: 8, digest: '460a36fdfbf3a19cffa1e26fffaa6a71b1c2264c8b9c6b32aeac18df8e01b885' },
  'feareddoor-53210': { decision: 'review_required', cases: 1, digest: '53b95785e1539e289b1028196c3ea2151bc2d3572dd75bdc5248b7b0d02d6ab4' },
  fightloop: { decision: 'review_required', cases: 8, digest: '460a36fdfbf3a19cffa1e26fffaa6a71b1c2264c8b9c6b32aeac18df8e01b885' },
};
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every(function (v, i) { return deepEqual(v, b[i]); });
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every(function (k, i) { return k === kb[i] && deepEqual(a[k], b[k]); });
}
function checkInvariance(name, rep) {
  const g = GOLDENS[name];
  const p = rep.policies[0];
  const table = p.metrics.find(function (m) { return m.id === 'table'; });
  const expectedTable = Object.assign({}, GOLDEN_TABLE, { totalPairs: g.cases });
  check('invariance-' + name, rep.decision === g.decision && p.cases === g.cases &&
    deepEqual(table, expectedTable) && sha(JSON.stringify(p.metrics)) === g.digest,
    'decision=' + rep.decision + ' cases=' + p.cases + ' digest=' + sha(JSON.stringify(p.metrics)));
}
(function () {
  function loadLabeled(dir, label) {
    return loadDir(dir).map(function (r) { if (label) r.policy = label; return r; });
  }
  const tkB = loadLabeled('evidence/2026-11-07/perseed-takeseat-b-baseline', 'takeseat');
  const tkA = loadLabeled('evidence/2026-11-07/perseed-takeseat-b-armed', 'takeseat');
  checkInvariance('takeseat', score.comparePanels(tkB, tkA, {}));
  const fdB = loadLabeled('evidence/2026-11-07/perseed-feareddoor-b-baseline', 'feareddoor');
  const fdA = loadLabeled('evidence/2026-11-07/perseed-feareddoor-b-armed', 'feareddoor');
  checkInvariance('feareddoor', score.comparePanels(fdB, fdA, {}));
  checkInvariance('feareddoor-53210', score.comparePanels(
    fdB.filter(function (r) { return r.seed === 53210; }),
    fdA.filter(function (r) { return r.seed === 53210; }), {}));
  const dwOld = loadLabeled('evidence/2026-11-07/perseed-darkwit-b-baseline', 'darkwit');
  checkInvariance('darkwit-53201', score.comparePanels(dwOld, dwOld, {}));
  const dwB = loadLabeled('evidence/2026-11-07/perseed-darkwit-b-pilot-baseline-fresh', 'darkwit-fresh');
  const dwA = loadLabeled('evidence/2026-11-07/perseed-darkwit-b-pilot-armed-fresh', 'darkwit-fresh');
  checkInvariance('darkwit-fresh', score.comparePanels(dwB, dwA, {}));
  const flB = loadDir('evidence/2026-11-08/perseed-fightloop-b-baseline');
  const flA = loadDir('evidence/2026-11-08/perseed-fightloop-b-candidate');
  checkInvariance('fightloop', score.comparePanels(flB, flA, {}));
})();

// ---------- (5) cross-check: pricedSeatOf vs the raw priced seat ----------
// Every committed corpus row is old-generation (no finalSeatPriced),
// so pricedSeatOf must agree with the row's own raw finalSeat on
// every one of them. A disagreement would mean the repair changed
// the priced reading on rows it should have left alone.
(function () {
  const dirs = ['evidence/2026-11-07/perseed-takeseat-b-baseline', 'evidence/2026-11-07/perseed-takeseat-b-armed',
    'evidence/2026-11-07/perseed-feareddoor-b-baseline', 'evidence/2026-11-07/perseed-feareddoor-b-armed',
    'evidence/2026-11-07/perseed-darkwit-b-baseline', 'evidence/2026-11-07/perseed-darkwit-b-pilot-baseline-fresh',
    'evidence/2026-11-07/perseed-darkwit-b-pilot-armed-fresh', 'evidence/2026-11-08/perseed-fightloop-b-baseline',
    'evidence/2026-11-08/perseed-fightloop-b-candidate'];
  let rows = 0, bad = [];
  dirs.forEach(function (dir) {
    loadDir(dir).forEach(function (r) {
      rows++;
      const raw = (r.finalSeat && typeof r.finalSeat === 'object') ? (r.finalSeat.seat || null)
        : (typeof r.finalSeat === 'string' ? (r.finalSeat || null) : null);
      if (pricedSeatOf(r) !== raw) bad.push(dir + '/s' + r.seed + ': priced=' + pricedSeatOf(r) + ' raw=' + raw);
    });
  });
  check('xcheck-priced-agrees-raw-finalSeat', bad.length === 0, rows + ' rows; ' + bad.slice(0, 5).join('; '));
})();

console.log(pass + '/' + (pass + fail) + ' PASS');
process.exit(fail ? 1 : 0);
