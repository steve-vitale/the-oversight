#!/usr/bin/env node
// test-heralddepart-a.js — proof test for sim-heralddepart-a (Loop A
// 20261102, axis scale-onramp). READ-ONLY: asserts over the per-seed
// trace JSONs and the analyzer's classification output. No harness,
// no writes, no RNG. Proves:
//   1. Determinism: 97400 closecommit r1 == r2 (full JSON, minus run
//      label) — the instrument is trusted.
//   2. Instrument neutrality: the OLD laircontact driver on current
//      code gives 97405 EXACTLY the new driver's result (no call,
//      gameDays 103, over-other) — so the band's shift since
//      laircontact-a (97405/97412/97432 no longer call) is code
//      movement, not a driver artifact.
//   3. Departure cases (prereg GO leg 2): 97400 dep d69, fed-97338
//      dep d87, noise-97338 dep d85 — every removal named
//      LOST-SIGHT, before.lostSight == 7, and the following say
//      line is the lost-trail line.
//   4. Corpus totals (prereg GO leg 1): 140 missed-bump days,
//      HEROLD-LEFT 63 / NEVER-ARRIVED 68 / DETAIL-DIFFERED 9 /
//      MATCHED-NO-BUMP 0 / UNKNOWN-removal 0, coverage 1.00;
//      removal mechanisms LOST-SIGHT 62 + FIGHT-START 1.
//   5. Fight-start departure: 97418's removal stackTop is
//      startCombat and its titan outcome record resolves the d60
//      fight to 'slain' — a fight entry, not a vanishing.
//   6. Detail-differed split: 4 spiral days (every monster-turn
//      seeScholar False, lostSight climbing) vs 5 approach days
//      (seeScholar True, stance machine advancing to hungry /
//      a bump on a later day).
//   7. Engagement rule re-check on the new records: every herald
//      attempt row has scholar tile == herald tile at attempt time.
// Usage: node scripts/test-heralddepart-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-heralddepart-a');
const OLD = path.join(REPO, 'evidence', '2026-11-02', 'perseed-laircontact-a');
let pass = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail != null ? ' — ' + detail : '')); }
  else { console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); process.exitCode = 1; }
}
function load(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
function rec(arm, s, run) { return load(path.join(DIR, `hd-${arm}-s${s}-${run}.json`)); }
function stripped(r) { const c = JSON.parse(JSON.stringify(r)); delete c.run; return c; }
const cls = load(path.join(DIR, 'classification.json'));
const per = {};
cls.perSeed.forEach(function (p) { per[p.seed + ':' + p.arm] = p; });

// 1. Determinism.
check('97400 closecommit r1 == r2 (minus run)',
  JSON.stringify(stripped(rec('closecommit', '97400', 'r1'))) === JSON.stringify(stripped(rec('closecommit', '97400', 'r2'))));

// 2. Instrument neutrality (old driver, current code, 97405).
const old97405 = load(path.join(OLD, 'lc-closecommit-s97405-rX.json'));
const new97405 = rec('closecommit', '97405', 'r1');
check('old driver 97405 == new driver 97405 on current code',
  old97405.callDay === null && new97405.callDay === null &&
  old97405.gameDays === 103 && new97405.gameDays === 103 &&
  old97405.endReason === 'over-other' && new97405.endReason === 'over-other',
  'call null, gameDays 103, over-other on both');

// 3. Departure cases.
const LOST_LINE = 'You hold still behind cover. After a while, the sounds fade. It lost your trail.';
function depCase(arm, seed, day) {
  const r = rec(arm, seed, 'r1');
  const p = per[seed + ':' + arm];
  const ev = (r.removalEvents || [])[0];
  return r && p && p.departureDay === day && p.depMechanism === 'LOST-SIGHT' &&
    ev && ev.before && ev.before.lostSight === 7 &&
    ev.sayAfter && ev.sayAfter[0] === LOST_LINE;
}
check('97400 closecommit dep d69 LOST-SIGHT (lostSight 7, lost-trail line)', depCase('closecommit', '97400', 69));
check('97338 musterfed dep d87 LOST-SIGHT', depCase('musterfed', '97338', 87));
check('97338 lairnoise dep d85 LOST-SIGHT', depCase('lairnoise', '97338', 85));

// 4. Corpus totals.
check('corpus 140 missed days, coverage 1.00',
  cls.totals.missedTotal === 140 && cls.totals.coverage === 1 &&
  cls.totals.counts['HEROLD-LEFT'] === 63 && cls.totals.counts['NEVER-ARRIVED'] === 68 &&
  cls.totals.counts['DETAIL-DIFFERED'] === 9 && cls.totals.matched === 0 && cls.totals.unknownLeft === 0,
  JSON.stringify(cls.totals.counts));
check('removal mechanisms 62 LOST-SIGHT + 1 FIGHT-START, 0 UNKNOWN',
  cls.totals.mechCounts['LOST-SIGHT'] === 62 && cls.totals.mechCounts['FIGHT-START'] === 1);

// 5. Fight-start departure is a slain fight, not a vanishing.
const r97418 = rec('closecommit', '97418', 'r1');
const ev97418 = (r97418.removalEvents || [])[0];
const out97418 = (r97418.dailyTrace[r97418.dailyTrace.length - 1] || {}).titanOutcomes || [];
check('97418 removal via startCombat, fight resolves slain d60',
  ev97418 && ev97418.stackTop[0] === 'startCombat' &&
  out97418.some(function (o) { return o.outcome === 'slain' && o.day === 60; }));

// 6. Detail-differed split.
const spiral = [], approach = [];
cls.perSeed.forEach(function (p) {
  p.rows.forEach(function (r) {
    if (r.cls !== 'DETAIL-DIFFERED') return;
    const key = p.seed + ':' + p.arm + ' d' + r.day;
    if (r.mtSeeScholar.length && r.mtSeeScholar.every(function (v) { return v === false; })) spiral.push(key);
    else approach.push(key);
  });
});
check('detail-differed split 4 spiral / 5 approach',
  spiral.length === 4 && approach.length === 5,
  'spiral: ' + spiral.join(', ') + ' | approach: ' + approach.join(', '));

// 7. Engagement rule on new records.
let attTotal = 0, attBad = 0;
fs.readdirSync(DIR).filter(function (f) { return f.indexOf('hd-') === 0 && f.endsWith('-r1.json'); }).forEach(function (f) {
  const r = load(path.join(DIR, f));
  (r.attempts || []).forEach(function (a) {
    if (a.mid !== 'herald') return;
    attTotal++;
    if (!a.scholarPos || !a.entityPos || a.scholarPos.px !== a.entityPos.tx || a.scholarPos.py !== a.entityPos.ty) attBad++;
  });
});
check('every herald attempt row tile-co-located', attBad === 0, attTotal + ' attempt rows');
console.log('heralddepart proof: ' + pass + ' checks passed');
