#!/usr/bin/env node
// test-lackingline-woodshort-b.js — proof for sim-lackingline-woodshort-b
// (prereg: evidence/2026-10-29/sim-lackingline-woodshort-b-prereg.md,
// pinned base d6723d3f39495b26cedcfd518997a99df98ec5fc). Proves, from
// the committed corpora plus a fresh determinism re-run, the
// INSUFFICIENT-DATA diagnosis: the 500-seed OFF screen, the 10-seed
// qualifier bank, the ON census (wood 4 on every ON creek evening,
// 0 wood-short still-refused evenings), the carry-skip census that
// closes both honest routes to a wood-short evening, the OFF guard,
// and byte-identical determinism. No game code is changed by this arm
// (measurement only).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const ev = (p) => path.join(root, 'evidence', '2026-10-29', p);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const QUALIFIERS = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];

// 1. Screen: 500 seeds, errs 0, day-1 always inside, 60 OFF creek evenings, 10 qualifiers.
const census = read(ev('sim-lackingline-woodshort-b-census.json'));
check('census pinned base is d6723d3f39495b26cedcfd518997a99df98ec5fc', census.pinnedBase === 'd6723d3f39495b26cedcfd518997a99df98ec5fc', census.pinnedBase);
check('census screen band is 15000-15499, 500 seeds', census.screenBand === '15000-15499' && census.screenSeeds === 500, census.screenBand + '/' + census.screenSeeds);
let screenCreek = 0, screenErrs = 0, screenUncl = 0;
const derivedQualifiers = [];
let day1Inside = 0, day1Total = 0;
for (let s = 15000; s <= 15499; s++) {
  const j = read(ev(`sim-lackingline-woodshort-b-corpus-screen-off/woodcarry3-b-nighttravel-s${s}.json`));
  screenErrs += j.woodcarryStore.errs || 0;
  screenUncl += j.woodcarryStore.unclassified || 0;
  const ce = j.evenings.filter((e) => e.woodcarry && e.woodcarry.outcome === 'travel-refused' && e.woodcarry.bucket === 'creek');
  screenCreek += ce.length;
  if (ce.length >= 1) derivedQualifiers.push(s);
  const d1 = j.evenings.find((e) => e.loopDay === 1);
  if (d1) { day1Total++; if (d1.inside) day1Inside++; }
}
check('screen errs==0 and unclassified==0 over 500 seeds', screenErrs === 0 && screenUncl === 0, screenErrs + '/' + screenUncl);
check('screen OFF creek evenings = 60', screenCreek === 60, String(screenCreek));
check('derived qualifiers match census qualifier list (10, screen order)', eq(derivedQualifiers, QUALIFIERS) && eq(census.qualifiers, QUALIFIERS), JSON.stringify(derivedQualifiers));
check('day-1 evening inside on all 500 screen seeds (no day-1 creek route)', day1Total === 500 && day1Inside === 500, day1Inside + '/' + day1Total);
check('census day-1 creek evenings = 0', census.day1CreekEvenings === 0, String(census.day1CreekEvenings));

// 2. ON census recomputed: 15 creek, 4 still (kcal 3 / ticks 1 / wood 0), 11 rescued, wood 4 always.
let onCreek = 0, onStill = 0, onRescued = 0;
const skipCounts = {};
const woodVals = [];
for (const s of QUALIFIERS) {
  const onJ = read(ev(`sim-lackingline-woodshort-b-corpus-on/woodcarry3-b-nighttravel-s${s}.json`));
  check('ON seed ' + s + ' errs==0 and unclassified==0', onJ.woodcarryStore.errs === 0 && onJ.woodcarryStore.unclassified === 0);
  check('ON seed ' + s + ' survived 30 days', onJ.endReason === 'survived' && onJ.daysAlive === 30, onJ.endReason + '/' + onJ.daysAlive);
  for (const e of onJ.evenings) {
    const w = e.woodcarry;
    if (!w || w.outcome !== 'travel-refused' || w.bucket !== 'creek') continue;
    onCreek++;
    woodVals.push(w.classification.woodPlayer);
    if (w.rescued) { onRescued++; continue; }
    onStill++;
    const sk = (w.bridge && w.bridge.skip) || 'none';
    skipCounts[sk] = (skipCounts[sk] || 0) + 1;
  }
}
check('ON creek evenings = 15', onCreek === 15, String(onCreek));
check('ON still-refused = 4, rescued = 11', onStill === 4 && onRescued === 11, onStill + '/' + onRescued);
check('ON still-refused skip breakdown kcal 3 / ticks 1 / wood 0', skipCounts['kcal-short'] === 3 && skipCounts['ticks-short'] === 1 && !skipCounts['wood-short'], JSON.stringify(skipCounts));
check('woodPlayer = 4 on every ON creek evening (never below the floor)', woodVals.length === 15 && woodVals.every((v) => v === 4), JSON.stringify(woodVals));
check('census counts match recomputation', census.onCreekEvenings === onCreek && census.onStillRefused === onStill && census.onRescued === onRescued && census.onWoodShortStill === 0 && census.staged === null,
  [census.onCreekEvenings, census.onStillRefused, census.onRescued, census.onWoodShortStill, census.staged].join('/'));
check('census gate wood distribution: min=max=4, belowFloor 0', census.gateDistributions.wood.min === 4 && census.gateDistributions.wood.max === 4 && census.gateDistributions.wood.belowFloor === 0);

// 3. Carry-skip census: pile-floor only on day 1 (10/10, never same-day creek);
//    kcal-floor and cannot-carry never occur; not-at-haven same-day creek evenings still hold wood 4.
const carryCounts = {};
let pileFloorDay1 = 0, pileFloorSameDayCreek = 0;
for (const s of QUALIFIERS) {
  const onJ = read(ev(`sim-lackingline-woodshort-b-corpus-on/woodcarry3-b-nighttravel-s${s}.json`));
  const ceDays = new Set(onJ.evenings.filter((e) => e.woodcarry && e.woodcarry.outcome === 'travel-refused' && e.woodcarry.bucket === 'creek').map((e) => e.loopDay));
  for (const e of onJ.evenings) {
    const c = e.woodcarryCarry;
    if (!c || c.acted || c.skip === 'lever-off') continue;
    carryCounts[c.skip] = (carryCounts[c.skip] || 0) + 1;
    if (c.skip === 'pile-floor') {
      if (e.loopDay === 1 && c.woodBefore === 0 && c.pileBefore === 10) pileFloorDay1++;
      if (ceDays.has(e.loopDay)) pileFloorSameDayCreek++;
    }
    if (c.skip === 'not-at-haven' && ceDays.has(e.loopDay)) {
      const ceRow = onJ.evenings.find((x) => x.loopDay === e.loopDay);
      check('not-at-haven same-day creek evening still holds wood 4 (seed ' + s + ' day ' + e.loopDay + ')',
        ceRow && ceRow.woodcarry.classification.woodPlayer === 4, 'wood=' + (ceRow && ceRow.woodcarry.classification.woodPlayer));
    }
  }
}
check('carry-skip counts pile-floor 10 / already-carrying 253 / not-at-haven 12',
  carryCounts['pile-floor'] === 10 && carryCounts['already-carrying'] === 253 && carryCounts['not-at-haven'] === 12, JSON.stringify(carryCounts));
check('all 10 pile-floor mornings are day 1 (wood 0, pile 10)', pileFloorDay1 === 10, String(pileFloorDay1));
check('no pile-floor morning is followed by a same-day creek evening', pileFloorSameDayCreek === 0, String(pileFloorSameDayCreek));
check('kcal-floor and cannot-carry never occur on the bank', !carryCounts['kcal-floor'] && !carryCounts['cannot-carry'], JSON.stringify(carryCounts));
check('census carry-skip census matches recomputation',
  census.carrySkipCensus['pile-floor'].count === 10 && census.carrySkipCensus['not-at-haven'].count === 12 &&
  census.carrySkipCensus['already-carrying'].count === 253 && !census.carrySkipCensus['kcal-floor'] && !census.carrySkipCensus['cannot-carry']);

// 4. OFF guard: qualifier OFF legs contain no lever lacking-line.
let offEvenings = 0, offHits = 0;
for (const s of QUALIFIERS) {
  const j = read(ev(`sim-lackingline-woodshort-b-corpus-screen-off/woodcarry3-b-nighttravel-s${s}.json`));
  for (const e of j.evenings) {
    offEvenings++;
    for (const l of (e.eveningSayTail || [])) if (l.includes('No bridge')) offHits++;
  }
}
check('OFF guard: 300 evenings checked, 0 lever lines', offEvenings === 300 && offHits === 0, offEvenings + ' evenings, ' + offHits + ' hits');
check('census OFF guard matches recomputation', census.offGuardEvenings === offEvenings && census.offGuardHits === offHits);

// 5. Verdict: no staged wood-short evening exists, so DIAG-GO bars (a)/(b)/(g) cannot hold — INSUFFICIENT-DATA.
check('no wood-short still-refused ON creek evening exists (verdict INSUFFICIENT-DATA, not a GO)', onStill > 0 && !skipCounts['wood-short'] && census.staged === null);
check('wood-short line text is unit-proven only (policy lackingLine wood branch present, unplayed)',
  fs.readFileSync(path.join(root, 'scripts', 'policies', 'woodcarry.js'), 'utf8').includes('the pack holds ') && fs.readFileSync(path.join(root, 'scripts', 'policies', 'woodcarry.js'), 'utf8').includes('and a bridge needs 4.'));

// 6. Determinism: fresh ON re-run of first qualifier seed is byte-identical on the pinned base.
const staging = path.join(root, '.test-lackingline-woodshort-det');
try {
  fs.rmSync(staging, { recursive: true, force: true });
  const env = { ...process.env, SEEDS: '15003', POLICY: 'nighttravel', COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', DAYS: '30', WOODCARRY: '1', OUTDIR: staging };
  execFileSync('node', [path.join(root, 'scripts', 'woodcarry3-trace-b.js')], { env, stdio: 'pipe' });
  const rerun = fs.readFileSync(path.join(staging, 'woodcarry3-b-nighttravel-s15003.json'), 'utf8');
  const orig = fs.readFileSync(ev('sim-lackingline-woodshort-b-corpus-on/woodcarry3-b-nighttravel-s15003.json'), 'utf8');
  check('determinism re-run of 15003 ON is byte-identical to judged corpus', rerun === orig);
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
}
check('determinism staging dir deleted', !fs.existsSync(staging));

if (failures) { console.error('FAILURES: ' + failures); process.exit(1); }
console.log('ALL sim-lackingline-woodshort-b proof checks passed (verdict: INSUFFICIENT-DATA)');
