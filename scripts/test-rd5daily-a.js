#!/usr/bin/env node
// scripts/test-rd5daily-a.js — proof test for sim-rd5daily-a
// (scale-onramp axis, 2026-11-01, run fleshout-loop-a-20261101T0715Z).
// DIAG ONLY: no game code, no existing script/policy file is touched.
// This test proves the daily rd5short instrument's ANALYSIS, not the
// sweep's printed verdict: unit checks on closest-approach (tie ->
// earliest), decay/persistent classification, and missing-day
// detection, PLUS corpus legs that re-derive every headline number
// from the judged daily corpora (evidence/2026-11-01/rd5daily-a-perseed)
// independently of the sweep's printed table.
//
// NOTE on the verdict this test pins down: the judged corpora have
// seriesOk=false on all 8 seeds SOLELY because scholar-day labels skip
// (substrate daily-hook day settlement: labels 2,2,4,4,... on every
// seed, plus 78202's 46->48). Counts agree everywhere (daily rows ==
// fullseat-diag days == vet2 rows, rd5 errs 0), so no daily call was
// ever missed — but the prereg's literal "zero missing days" gate
// (label consecutiveness) fails, and this test asserts that literal
// outcome rather than papering over it. The arm verdict is therefore
// DIAG-NO-GO on gate D1 alone; every other gate item passes.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-01', 'rd5daily-a-perseed');
const RECHECK_DIR = path.join(REPO, 'evidence', '2026-11-01', 'perseed-fullseat-recheck-a');
const { checkDailySeries, closestApproach, summarizeSeed, compareToRecheck,
  weaponsShortOn, weaponsMetOn } = require('./rd5daily-a-sweep');

let checks = 0, fails = 0;
function ok(cond, label, extra) {
  checks += 1;
  if (!cond) { fails += 1; console.log(`FAIL: ${label}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function eq(a, b, label) { ok(a === b, `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function deepEq(a, b, label) { ok(JSON.stringify(a) === JSON.stringify(b), `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

// --- unit: closest approach, tie -> earliest ---
{
  const daily = [
    { d: 10, t: 5, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
    { d: 11, t: 3, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
    { d: 12, t: 3, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
    { d: 13, t: 4, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
  ];
  eq(closestApproach(daily).d, 11, 'closest-approach tie breaks to earliest day');
  eq(closestApproach([{ d: 7, t: 9, sh: [], a: [4, 6, 3, 0], v: [0, 0] }]).d, 7, 'closest-approach single row');
}

// --- unit: weapons short/met predicates ---
{
  ok(weaponsShortOn({ sh: ['armor', 'weapons', 'veterans'] }), 'weaponsShortOn true');
  ok(!weaponsShortOn({ sh: ['veterans'] }), 'weaponsShortOn false');
  ok(weaponsMetOn({ a: [4, 6, 3, 0] }), 'weaponsMetOn at exactly 6');
  ok(!weaponsMetOn({ a: [4, 5, 3, 0] }), 'weaponsMetOn false below 6');
}

// --- unit: decay / persistent / not-applicable classification ---
function synthRow(endShort) {
  return { seed: 99999, days: 2, gameDays: 2, endReason: 'survived', won: 0,
    finalRank: 'regional', maxRank: 'national',
    endSnapFull: { unlock: { rd5short: endShort } },
    diag: { days: 2 }, vet: { days: 2, endVet5n: 0 }, rd5errs: 0 };
}
{
  // DECAY: short at end, met at closest (tie -> earliest row, armed 6).
  const daily = [
    { d: 5, t: 3, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
    { d: 6, t: 3, sh: ['weapons', 'veterans'], a: [4, 2, 3, 0], v: [0, 0] },
  ];
  eq(summarizeSeed(synthRow(['weapons', 'veterans']), daily).verdict, 'DECAY', 'decay classification');
  // PERSISTENT: short at end AND short at closest.
  const dailyP = [
    { d: 5, t: 3, sh: ['weapons', 'veterans'], a: [4, 4, 3, 0], v: [0, 0] },
    { d: 6, t: 4, sh: ['weapons', 'veterans'], a: [4, 4, 3, 0], v: [0, 0] },
  ];
  eq(summarizeSeed(synthRow(['weapons', 'veterans']), dailyP).verdict, 'PERSISTENT', 'persistent classification');
  // NOT-APPLICABLE: met at end.
  const dailyN = [{ d: 5, t: 3, sh: ['veterans'], a: [4, 8, 3, 0], v: [0, 0] }];
  eq(summarizeSeed(synthRow(['veterans']), dailyN).verdict, 'NOT-APPLICABLE', 'not-applicable classification');
  // INDETERMINATE: short at end, closest row carries neither signal.
  const dailyI = [{ d: 5, t: 3, sh: null, a: null, v: [0, 0] }];
  eq(summarizeSeed(synthRow(['weapons']), dailyI).verdict, 'INDETERMINATE', 'indeterminate classification');
}

// --- unit: missing-day detection ---
{
  const good = [{ d: 1, t: 9, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
    { d: 2, t: 8, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] }];
  ok(checkDailySeries(good, 2, 2).ok, 'missing-day detector passes consecutive series');
  const gap = [{ d: 1, t: 9, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
    { d: 3, t: 8, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] }];
  ok(!checkDailySeries(gap, 2, 2).ok, 'missing-day detector flags skipped day');
  const dup = [{ d: 2, t: 9, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] },
    { d: 2, t: 9, sh: ['veterans'], a: [4, 6, 3, 0], v: [0, 0] }];
  ok(!checkDailySeries(dup, 2, 2).ok, 'missing-day detector flags duplicate day');
  ok(!checkDailySeries(good, 3, 2).ok, 'missing-day detector flags diag count mismatch');
  ok(!checkDailySeries(good, 2, 3).ok, 'missing-day detector flags vet count mismatch');
  const nulls = [{ d: 1, t: 9, sh: null, a: [4, 6, 3, 0], v: [0, 0] }];
  ok(!checkDailySeries(nulls, 1, 1).ok, 'missing-day detector flags null rd5 fields');
  ok(!checkDailySeries([], 0, 0).ok, 'missing-day detector flags empty series');
}

// --- corpus legs: re-derive every headline from judged corpora ---
const EXPECTED = {
  78201: { days: 180, end: 'survived', won: 0, closestDay: 165, closestDist: 2, armed: 4, vet5: 0, verdict: 'PERSISTENT', endShort: true, caShort: ['weapons', 'veterans'], ties: 16, firstW4: 109, lastMet: 153, wave: 4, nationalEver: 1, table: 1 },
  78202: { days: 131, end: 'village-lost', won: 0, closestDay: 130, closestDist: 3, armed: 3, vet5: 0, verdict: 'PERSISTENT', endShort: true, caShort: ['armor', 'weapons', 'veterans'], ties: 1, firstW4: 106, lastMet: 120, wave: 4, nationalEver: 0, table: 0 },
  78203: { days: 168, end: 'village-lost', won: 0, closestDay: 161, closestDist: 4, armed: 10, vet5: 0, verdict: 'NOT-APPLICABLE', endShort: false, caShort: ['veterans'], ties: 8, firstW4: 135, lastMet: 168, wave: 4, nationalEver: 1, table: 0 },
  78204: { days: 180, end: 'survived', won: 0, closestDay: 172, closestDist: 6, armed: 8, vet5: 0, verdict: 'NOT-APPLICABLE', endShort: false, caShort: ['veterans'], ties: 9, firstW4: 128, lastMet: 180, wave: 4, nationalEver: 1, table: 0 },
  78205: { days: 99, end: 'village-lost', won: 0, closestDay: 90, closestDist: 5, armed: 2, vet5: 0, verdict: 'PERSISTENT', endShort: true, caShort: ['armor', 'weapons', 'veterans'], ties: 9, firstW4: 58, lastMet: 85, wave: 4, nationalEver: 1, table: 0 },
  78206: { days: 90, end: 'over-other', won: 1, closestDay: 86, closestDist: 5, armed: 9, vet5: 0, verdict: 'NOT-APPLICABLE', endShort: false, caShort: ['veterans'], ties: 5, firstW4: 82, lastMet: 90, wave: 4, nationalEver: 1, table: 1 },
  78207: { days: 26, end: 'village-lost', won: 0, closestDay: 23, closestDist: 17, armed: 8, vet5: 0, verdict: 'NOT-APPLICABLE', endShort: false, caShort: ['armor', 'veterans'], ties: 4, firstW4: null, lastMet: 26, wave: 2, nationalEver: 0, table: 0 },
  78208: { days: 164, end: 'village-lost', won: 0, closestDay: 128, closestDist: 3, armed: 6, vet5: 0, verdict: 'DECAY', endShort: true, caShort: ['armor', 'veterans'], ties: 36, firstW4: 70, lastMet: 148, wave: 4, nationalEver: 0, table: 1 },
};
let aggPersistent = 0, aggDecay = 0, aggEndShort = 0, aggMetAtClosestVet2Missing = 0;
for (const seedStr of Object.keys(EXPECTED)) {
  const seed = parseInt(seedStr, 10);
  const exp = EXPECTED[seed];
  const row = JSON.parse(fs.readFileSync(path.join(DIR, `s${seed}.json`), 'utf8'));
  const daily = JSON.parse(fs.readFileSync(path.join(DIR, `s${seed}-daily.json`), 'utf8')).daily;
  const recheck = JSON.parse(fs.readFileSync(path.join(RECHECK_DIR, `s${seed}-armed.json`), 'utf8'));
  const s = summarizeSeed(row, daily);
  eq(row.days, exp.days, `${seed} days`);
  eq(row.endReason, exp.end, `${seed} endReason`);
  eq(row.won, exp.won, `${seed} won`);
  eq(s.closestDay, exp.closestDay, `${seed} closestDay`);
  eq(s.closestDist, exp.closestDist, `${seed} closestDist`);
  eq(s.closestArmed, exp.armed, `${seed} armed at closest`);
  eq(s.closestVet5n, exp.vet5, `${seed} vet5 at closest`);
  eq(s.verdict, exp.verdict, `${seed} decay/persistent verdict`);
  eq(s.endWeaponsShort, exp.endShort, `${seed} end weapons-short`);
  deepEq(s.closestRd5short, exp.caShort, `${seed} rd5short at closest`);
  eq(daily.filter(r => r.t === s.closestDist).length, exp.ties, `${seed} tied min-dist days`);
  eq(s.firstWave4Day, exp.firstW4, `${seed} first wave-4 day`);
  eq(s.firstWave5Day, null, `${seed} wave 5 never unlocks`);
  eq(s.lastWeaponsMetDay, exp.lastMet, `${seed} last weapons-met day`);
  eq(s.firstWeaponsMetDay, 2, `${seed} first weapons-met day`);
  eq(s.weaponsEverMet, true, `${seed} weapons ever met`);
  eq(row.waveReach, exp.wave, `${seed} wave reach`);
  eq(row.nationalEver, exp.nationalEver, `${seed} national ever`);
  eq(row.table, exp.table, `${seed} table`);
  eq(s.distRoseAfterClosest, false, `${seed} dist never rises after closest`);
  eq(s.lastDailyAgreesWithEnd, true, `${seed} last daily agrees with end snapshot`);
  // Completeness by count (the substance of D1) holds even though the
  // label-consecutiveness clause fails: no call was ever missed.
  eq(s.seriesCount, row.diag.days, `${seed} daily rows == fullseat-diag days`);
  eq(s.seriesCount, row.vet.days, `${seed} daily rows == vet2 rows`);
  eq(s.rd5Errs, 0, `${seed} rd5 errs zero`);
  eq(s.vet2MissingAtClosest, true, `${seed} veterans-2 missing at closest`);
  eq(s.vet2MissingAtEnd, true, `${seed} veterans-2 missing at end`);
  // Label gaps are the ONLY series problem on every seed.
  ok(s.seriesProblems.length > 0, `${seed} series problems recorded`);
  ok(s.seriesProblems.every(p => p.indexOf('gap-or-dup') === 0), `${seed} all series problems are label gap-or-dup only`, s.seriesProblems);
  eq(s.seriesOk, false, `${seed} seriesOk false (label gate, literal)`);
  // Recorder neutrality + end-state reproduction vs the recheck corpus.
  deepEq(compareToRecheck(row, recheck), [], `${seed} neutrality vs recheck armed row`);
  eq(row.finalRank, recheck.finalRank, `${seed} finalRank reproduces recheck`);
  eq(row.maxRank, recheck.maxRank, `${seed} maxRank reproduces recheck`);
  eq(row.gameDays, recheck.gameDays, `${seed} gameDays reproduces recheck`);
  eq(row.vet.endVet5n, recheck.vet.endVet5n, `${seed} vet end reproduces recheck`);
  if (s.endWeaponsShort) aggEndShort += 1;
  if (s.verdict === 'PERSISTENT') aggPersistent += 1;
  if (s.verdict === 'DECAY') aggDecay += 1;
  if (s.weaponsMetAtClosestAndVet2Missing) aggMetAtClosestVet2Missing += 1;
}
eq(aggEndShort, 4, 'aggregate end-weapons-short seeds');
eq(aggPersistent, 3, 'aggregate persistent');
eq(aggDecay, 1, 'aggregate decay');
eq(aggMetAtClosestVet2Missing, 5, 'aggregate weapons-met-at-closest with veterans-2 missing');
// 78201-specific: closest day is the first lesser-seat day; the armed
// slip (7 -> 6 -> 5 -> 4) precedes closest approach, it does not
// follow it — the PERSISTENT verdict is not an end-state artifact.
{
  const daily = JSON.parse(fs.readFileSync(path.join(DIR, 's78201-daily.json'), 'utf8')).daily;
  const byDay = {};
  for (const r of daily) if (byDay[r.d] === undefined) byDay[r.d] = r;
  eq(byDay[153].a[1], 6, '78201 armed 6 on last met day 153');
  eq(byDay[154].a[1], 5, '78201 armed slips to 5 the next day');
  eq(byDay[165].a[1], 4, '78201 armed 4 at closest day 165');
  eq(byDay[165].s, 'lesser', '78201 seat lesser at closest day');
}

console.log(`\ntest-rd5daily-a: ${checks - fails}/${checks} checks green`);
if (fails) { console.error('PROOF TEST FAILED'); process.exit(1); }
