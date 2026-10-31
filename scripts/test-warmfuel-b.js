#!/usr/bin/env node
// test-warmfuel-b.js — proof suite for sim-warmfuel-b.
// Usage: node scripts/test-warmfuel-b.js [corpusGuard corpusOn baseGuard baseOn determinismDir]
// Defaults to the judged warmfuel corpora in evidence/2026-10-30/.
// Pure counterfactual/classify unit tests + corpus checks.
// Exits non-zero on any failure; prints PASS counts.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { analyzeDir, classify, counterfactual } = require('./analyze-warmfuel-b.js');

const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-30');
const PIN = 'f52f08600550b0da8159849ffcfd5665c75e04f0';

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b }); }

// ---------- unit: classify ----------
const mk = (logs, kcal, ticks) => ({ woodcarry: { classification: { woodPlayer: logs, kcalLive: kcal, ticksToDayEnd: ticks } } });
eq('classify wood-only', classify(mk(3, 240, 238)).mode, 'wood-only');
eq('classify kcal-only', classify(mk(4, 0, 239)).mode, 'kcal-only');
eq('classify both', classify(mk(3, 0, 111)).mode, 'both');
eq('classify ticks-only', classify(mk(4, 2254, 47)).mode, 'ticks-only');
eq('classify wood+ticks', classify(mk(2, 100, 50)).mode, 'wood+ticks');
eq('classify kcal+ticks', classify(mk(4, 30, 50)).mode, 'kcal+ticks');
eq('classify all-three', classify(mk(1, 0, 10)).mode, 'all-three');
eq('classify neither', classify(mk(4, 180, 110)).mode, 'neither/other');
check('classify null gate unclassified', classify(mk(null, 100, 100)).unclassified === true);
check('classify no classification unclassified', classify({ woodcarry: {} }).unclassified === true);
eq('classify kcal fallback', classify({ woodcarry: { classification: { woodPlayer: 4, kcal: 24, ticksToDayEnd: 100 } } }).kcal, 24);

// ---------- unit: counterfactual ----------
// Kcalshort ON strand table as INPUT fixture (function test, not a base claim):
// nights 7-16: modes ticks-only, kcal-only, kcal-only, wood-only, both,
// both, both, wood-only, both, both; spends on 9,11,12,13.
const fixture = [
  { loopDay: 7, logs: 4, kcal: 2254, ticks: 47, mode: 'ticks-only', spend: 0 },
  { loopDay: 8, logs: 4, kcal: 0, ticks: 239, mode: 'kcal-only', spend: 0 },
  { loopDay: 9, logs: 4, kcal: 0, ticks: 109, mode: 'kcal-only', spend: 1 },
  { loopDay: 10, logs: 3, kcal: 240, ticks: 238, mode: 'wood-only', spend: 0 },
  { loopDay: 11, logs: 3, kcal: 0, ticks: 111, mode: 'both', spend: 1 },
  { loopDay: 12, logs: 2, kcal: 0, ticks: 239, mode: 'both', spend: 1 },
  { loopDay: 13, logs: 1, kcal: 0, ticks: 111, mode: 'both', spend: 1 },
  { loopDay: 14, logs: 0, kcal: 240, ticks: 238, mode: 'wood-only', spend: 0 },
  { loopDay: 15, logs: 0, kcal: 0, ticks: 111, mode: 'both', spend: 0 },
  { loopDay: 16, logs: 0, kcal: 0, ticks: 111, mode: 'both', spend: 0 },
];
const cf = counterfactual(fixture);
eq('cf total logs', cf.totalLogs, 4);
eq('cf spend nights', cf.spendNights, 4);
eq('cf cfLogs', cf.table.map((t) => t.cfLogs), [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
eq('cf preservedBefore', cf.table.map((t) => t.preservedBefore), [0, 0, 0, 1, 1, 2, 3, 4, 4, 4]);
eq('cf rescued nights (independent)', cf.rescuedNights, [10, 14]);
eq('cf both-evenings never rescued even at cfLogs 4',
  cf.table.filter((t) => t.mode === 'both' && t.rescued).length, 0);
eq('cf first rescue', cf.firstRescue, 10);
eq('cf sequential shortening', cf.shortening, 7);
// Same-evening spend excluded from its own cfLogs.
const same = counterfactual([
  { loopDay: 1, logs: 3, kcal: 240, ticks: 200, mode: 'wood-only', spend: 1 },
  { loopDay: 2, logs: 3, kcal: 240, ticks: 200, mode: 'wood-only', spend: 0 },
]);
eq('cf same-evening spend excluded (night1 cfLogs 3, not rescued)', same.table[0].cfLogs, 3);
check('cf same-evening spend excluded (night1 not rescued)', same.table[0].rescued === false);
eq('cf next night sees preserved log', same.table[1].cfLogs, 4);
check('cf next night rescued', same.table[1].rescued === true);
eq('cf same-evening shortening', same.shortening, 1);
// Failed fire spends nothing (spend 0 in rows by construction).
const failedFire = counterfactual([
  { loopDay: 1, logs: 3, kcal: 240, ticks: 200, mode: 'wood-only', spend: 0 },
]);
eq('cf failed fire no rescue', failedFire.rescuedNights, []);
eq('cf failed fire shortening 0', failedFire.shortening, 0);
// Ticks-only / kcal-only never rescued even with preserved logs.
const noRescue = counterfactual([
  { loopDay: 1, logs: 4, kcal: 2254, ticks: 47, mode: 'ticks-only', spend: 1 },
  { loopDay: 2, logs: 4, kcal: 0, ticks: 200, mode: 'kcal-only', spend: 0 },
]);
eq('cf ticks/kcal-only never rescued', noRescue.rescuedNights, []);
eq('cf no-rescue shortening 0', noRescue.shortening, 0);
// Empty strand.
eq('cf empty shortening', counterfactual([]).shortening, 0);
eq('cf empty total logs', counterfactual([]).totalLogs, 0);

// ---------- corpus checks ----------
const corpusGuard = process.argv[2] || path.join(EV, 'sim-warmfuel-b-corpus-guard');
const corpusOn = process.argv[3] || path.join(EV, 'sim-warmfuel-b-corpus-on');
const baseGuard = process.argv[4] || path.join(EV, 'sim-warmfuel-b-corpus-base-guard');
const baseOn = process.argv[5] || path.join(EV, 'sim-warmfuel-b-corpus-base-on');
const determDir = process.argv[6] || path.join(EV, 'sim-warmfuel-b-corpus-determinism');

function mustDir(d, name) {
  if (!fs.existsSync(d)) { console.error('MISSING DIR: ' + name + ' ' + d); process.exit(2); }
}
for (const [d, n] of [[corpusGuard, 'guard'], [corpusOn, 'on'], [baseGuard, 'base-guard'], [baseOn, 'base-on'], [determDir, 'determinism']]) mustDir(d, n);

const g = analyzeDir(corpusGuard);
const o = analyzeDir(corpusOn);
const bg = analyzeDir(baseGuard);
const bo = analyzeDir(baseOn);

check('guard 10 seeds', g.seeds === 10, g.seeds);
check('on 10 seeds', o.seeds === 10, o.seeds);
check('guard all seeds 30 days alive', Object.values(g.perSeed).every((s) => s.daysAlive === 30));
check('on all seeds 30 days alive', Object.values(o.perSeed).every((s) => s.daysAlive === 30));
check('guard recorder errs 0', g.recorderErrs === 0, g.recorderErrs);
check('on recorder errs 0', o.recorderErrs === 0, o.recorderErrs);
check('guard pantry/pack errs 0', g.pantryPackErrs === 0, g.pantryPackErrs);
check('on pantry/pack errs 0', o.pantryPackErrs === 0, o.pantryPackErrs);
check('guard 0 unclassified', g.unclassified.length === 0, g.unclassified);
check('on 0 unclassified', o.unclassified.length === 0, o.unclassified);
check('guard 0 ledger mismatches', g.ledgerMismatches.length === 0, g.ledgerMismatches);
check('on 0 ledger mismatches', o.ledgerMismatches.length === 0, o.ledgerMismatches);
check('guard 0 kcal fallbacks on strand evenings', g.kcalFallback.length === 0, g.kcalFallback);
check('on 0 kcal fallbacks on strand evenings', o.kcalFallback.length === 0, o.kcalFallback);

// Equivalence: recorder == fresh baselines per-seed, both legs.
for (const [rec, base, leg] of [[g, bg, 'guard'], [o, bo, 'on']]) {
  for (const seed of Object.keys(base.perSeed)) {
    const r = rec.perSeed[seed], b = base.perSeed[seed];
    check(`equivalence ${leg} seed ${seed} creek/still/rescued`,
      r && r.creek === b.creek && r.still === b.still && r.rescued === b.rescued,
      { rec: r && [r.creek, r.still, r.rescued], base: [b.creek, b.still, b.rescued] });
    const rStr = (r.strands || []).map((s) => s.nights.join(',')).join('|');
    const bStr = (b.strands || []).map((s) => s.nights.join(',')).join('|');
    check(`equivalence ${leg} seed ${seed} strand nights`, rStr === bStr, { rec: rStr, base: bStr });
  }
  eq(`equivalence ${leg} totals`, [rec.creekEvenings, rec.stillRefused, rec.rescued],
    [base.creekEvenings, base.stillRefused, base.rescued]);
}

// Every strand evening carries a warmth record (acted flag present).
for (const [res, leg] of [[g, 'guard'], [o, 'on']]) {
  for (const t of res.table) {
    check(`warmth record present ${leg} seed ${t.seed} day ${t.loopDay}`,
      t.warmthActed !== undefined && t.logSpent !== undefined);
  }
}

// Determinism: 15215 ON re-run byte-identical to judged ON 15215.
const judged15215 = fs.readdirSync(corpusOn).filter((f) => f.includes('15215'));
check('judged ON has exactly one 15215 file', judged15215.length === 1, judged15215);
const determ15215 = fs.readdirSync(determDir).filter((f) => f.includes('15215'));
check('determinism has exactly one 15215 file', determ15215.length === 1, determ15215);
if (judged15215.length === 1 && determ15215.length === 1) {
  const a = fs.readFileSync(path.join(corpusOn, judged15215[0]), 'utf8');
  const b = fs.readFileSync(path.join(determDir, determ15215[0]), 'utf8');
  check('determinism 15215 ON byte-identical', a === b);
}

// Tracked-diff guard: src/ and scripts/policies/ empty vs pin.
let diff = '';
try {
  diff = execSync(`git diff --name-only ${PIN} -- src scripts/policies`, { cwd: ROOT, encoding: 'utf8' }).trim();
} catch (e) { diff = 'GIT-ERROR:' + e.message; }
check('tracked diff src/ + policies/ empty vs pin', diff === '', diff);

// Strand-set summary (reported, not asserted — the base re-derives it).
console.error(`guard strands: ${JSON.stringify(g.strands.map((s) => [s.seed, s.nights]))}`);
console.error(`on strands: ${JSON.stringify(o.strands.map((s) => [s.seed, s.nights]))}`);
console.error(`guard totals: creek=${g.creekEvenings} still=${g.stillRefused} rescued=${g.rescued}`);
console.error(`on totals: creek=${o.creekEvenings} still=${o.stillRefused} rescued=${o.rescued}`);

console.log(`test-warmfuel-b: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
