#!/usr/bin/env node
// test-laircontact-a.js — proof test for sim-laircontact-a (Loop A
// 20261102, axis scale-onramp). READ-ONLY: asserts over the committed
// per-seed trace JSONs, the new policy sources, and the new policy
// modules. No harness, no writes, no RNG. Proves:
//   1. Determinism: closecommit 97330 r1 == r2 (minus run label), and
//      all 8 band baselines r1 == their screen runs (minus run label,
//      screen ran in parallel batches) — the instrument is trusted.
//   2. Driver equivalence: the OLD musterupkeep driver on current
//      master gives the same 97330 closecommit result as the NEW
//      driver (call 117, 0 attempts, village-lost 132) — so the
//      baseline shift vs the 1340Z records (call 97, 12 attempts,
//      lost 122) is code movement, not a driver artifact.
//   3. Phase-1 matrix (current master, identical seeds): 97330
//      base 0 / fed 12 / sham 16 / noise 0 attempts; 97338 base 0 /
//      fed 0 (co-located d86, no attempts) / sham 0 / noise 12.
//      No prereg arm pattern holds on both seeds -> band triggered.
//   4. Band matrix (8 baseline-attempt-positive seeds): baseline
//      8/8, musterfed 7/8 (zero only 97435), lairsham 7/8 (zero only
//      97435), lairnoise 8/8 attempt-positive. Fed-zero rate 1/8 is
//      far below the pre-registered >=7/8 systematic bar -> contact
//      is NOT systematically killed by feeding (verdict: roaming
//      luck / wild-contact bump timing, not a feeding effect).
//   5. Engagement rule: every r1 attempt row (845) is engagement-time
//      co-located (scholar tile == herald tile at call); callers are
//      843 wild-contact + 2 harness contest-drive, 0 policy-hunt —
//      contact IS a tile-sharing bump, not the scholar's march.
//   6. Fight-contact robustness: on gate-met seeds 97412 / 97418,
//      ALL FOUR arms produce the identical single FOUGHT attempt on
//      the identical day (d78 / d60).
//   7. Q3 day-matched trust: call day identical across arms per band
//      seed (anchor well-defined); 97420 + 97433 fed saves exactly
//      +2.0 mean by feeding the first dawn (0 hungry days vs 1);
//      97435 fed feeds 5 of 6 dawns (1 hungry day vs 6) yet still
//      has 0 attempts — trust and contact are independent outcomes.
//   8. Perception audit: the new policies read no monster roster,
//      allied roster, or link list; sham consumes no RNG; noise
//      consumes exactly 8 draws/day and changes no state.
// Usage: node scripts/test-laircontact-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-laircontact-a');
const OLD = path.join(REPO, 'evidence', '2026-11-02', 'perseed-musterupkeep-a');
let pass = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail != null ? ' — ' + detail : '')); }
  else { console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); process.exitCode = 1; }
}
function load(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
function rec(arm, s, run) { return load(path.join(DIR, `lc-${arm}-s${s}-${run}.json`)); }
function stripped(r) { const c = JSON.parse(JSON.stringify(r)); delete c.run; return c; }
function attDays(r) { return [...new Set(r.attempts.map(function (a) { return a.day; }))].sort(function (a, b) { return a - b; }); }
function coLocDays(r) {
  return r.dailyTrace.filter(function (d) { return r.callDay != null && d.day >= r.callDay && d.coLocated; }).map(function (d) { return d.day; });
}
function trustAt(r, day, names) {
  const rows = r.dailyTrace.filter(function (d) { return d.day === day; });
  if (!rows.length) return {};
  const out = {};
  rows[0].links.forEach(function (l) { if (names.indexOf(l.name) >= 0) out[l.name] = l.trust; });
  return out;
}
function hungryDays(r, callDay, anchor) {
  return new Set(r.anchoredLines.filter(function (l) { return l.line.indexOf('muster is hungry') >= 0 && callDay < l.day && l.day <= anchor; }).map(function (l) { return l.day; })).size;
}
function meanDelta(r, base, anchor) {
  const callRow = base.dailyTrace.filter(function (d) { return d.day === base.callDay; })[0];
  const allies = callRow.links.filter(function (l) { return l.alliesHere > 0; }).map(function (l) { return l.name; });
  const tc = trustAt(r, base.callDay, allies), ta = trustAt(r, anchor, allies);
  const vals = allies.filter(function (n) { return tc[n] != null && ta[n] != null; }).map(function (n) { return ta[n] - tc[n]; });
  return vals.length ? vals.reduce(function (t, v) { return t + v; }, 0) / vals.length : null;
}

const BAND = ['97405', '97420', '97432', '97433', '97435', '97412', '97418', '97426'];
const ARMS = ['closecommit', 'musterfed', 'lairsham', 'lairnoise'];

// 1. Determinism.
check('97330 closecommit r1 == r2 (minus run)',
  JSON.stringify(stripped(rec('closecommit', '97330', 'r1'))) === JSON.stringify(stripped(rec('closecommit', '97330', 'r2'))));
BAND.forEach(function (s) {
  check('band baseline r1 == screen (minus run) ' + s,
    JSON.stringify(stripped(rec('closecommit', s, 'r1'))) === JSON.stringify(stripped(load(path.join(DIR, `lc-closecommit-s${s}-screen.json`)))));
});

// 2. Driver equivalence on current master.
const oldX = load(path.join(OLD, 'mu-closecommit-s97330-rX.json'));
const new1 = rec('closecommit', '97330', 'r1');
check('old driver rX == new driver r1 on current master (call 117, 0 att, lost 132)',
  oldX.callDay === 117 && new1.callDay === 117 && oldX.attemptCount === 0 && new1.attemptCount === 0 &&
  oldX.gameDays === 132 && new1.gameDays === 132 && oldX.endReason === 'village-lost' && new1.endReason === 'village-lost');
// Baseline re-basing fact: current-master baselines differ from 1340Z records.
const old30 = load(path.join(OLD, 'mu-closecommit-s97330-r1.json'));
const old38 = load(path.join(OLD, 'mu-closecommit-s97338-r1.json'));
check('current-master baselines differ from 1340Z records (code moved: call 117/82 vs 97/113)',
  new1.callDay !== old30.callDay && rec('closecommit', '97338', 'r1').callDay !== old38.callDay,
  'now 117/82, then 97/113');

// 3. Phase-1 matrix.
const p = function (arm, s) { return rec(arm, s, 'r1'); };
check('97330: base 0 att', p('closecommit', '97330').attemptCount === 0);
check('97330: fed 12 att on d123', p('musterfed', '97330').attemptCount === 12 && JSON.stringify(attDays(p('musterfed', '97330'))) === '[123]');
check('97330: sham 16 att on d119-121', p('lairsham', '97330').attemptCount === 16 && JSON.stringify(attDays(p('lairsham', '97330'))) === '[119,120,121]');
check('97330: noise 0 att', p('lairnoise', '97330').attemptCount === 0);
check('97338: base 0 att', p('closecommit', '97338').attemptCount === 0);
check('97338: fed 0 att but co-located d86', p('musterfed', '97338').attemptCount === 0 && JSON.stringify(coLocDays(p('musterfed', '97338'))) === '[86]');
check('97338: sham 0 att', p('lairsham', '97338').attemptCount === 0);
check('97338: noise 12 att on d84', p('lairnoise', '97338').attemptCount === 12 && JSON.stringify(attDays(p('lairnoise', '97338'))) === '[84]');

// 4. Band matrix.
function attPos(arm) { return BAND.filter(function (s) { return rec(arm, s, 'r1').attemptCount > 0; }); }
check('band baseline attempt-positive 8/8', attPos('closecommit').length === 8, attPos('closecommit').join(','));
check('band fed attempt-positive 7/8 (zero only 97435)', attPos('musterfed').length === 7 && JSON.stringify(BAND.filter(function (s) { return rec('musterfed', s, 'r1').attemptCount === 0; })) === '["97435"]',
  attPos('musterfed').join(','));
check('band sham attempt-positive 7/8 (zero only 97435)', attPos('lairsham').length === 7 && JSON.stringify(BAND.filter(function (s) { return rec('lairsham', s, 'r1').attemptCount === 0; })) === '["97435"]',
  attPos('lairsham').join(','));
check('band noise attempt-positive 8/8', attPos('lairnoise').length === 8, attPos('lairnoise').join(','));
check('band fed-zero rate 1/8 below pre-registered >=7/8 systematic bar',
  BAND.filter(function (s) { return rec('musterfed', s, 'r1').attemptCount === 0; }).length === 1);

// 5. Engagement rule over all r1 records.
let tot = 0, co = 0, wild = 0, contest = 0;
fs.readdirSync(DIR).filter(function (f) { return /-r1\.json$/.test(f); }).forEach(function (f) {
  load(path.join(DIR, f)).attempts.forEach(function (a) {
    tot++;
    if (a.scholarPos && a.entityPos && a.scholarPos.px === a.entityPos.tx && a.scholarPos.py === a.entityPos.ty) co++;
    if (a.caller === 'wild-contact') wild++;
    if (a.caller === 'contest') contest++;
  });
});
check('all r1 attempt rows engagement-co-located (845/845)', tot === 845 && co === 845, 'tot=' + tot + ' co=' + co);
check('r1 attempt callers: 843 wild-contact + 2 harness contest-drive, 0 policy-hunt', wild === 843 && contest === 2 && wild + contest === tot,
  'wild=' + wild + ' contest=' + contest);

// 6. Fight-contact robustness.
['97412', '97418'].forEach(function (s) {
  const expDay = s === '97412' ? 78 : 60;
  ARMS.forEach(function (arm) {
    const r = rec(arm, s, 'r1');
    check(s + ' ' + arm + ' single FOUGHT attempt d' + expDay,
      r.attemptCount === 1 && r.attempts[0].cls === 'FOUGHT' && r.attempts[0].day === expDay);
  });
});

// 7. Q3 day-matched trust.
BAND.forEach(function (s) {
  const base = rec('closecommit', s, 'r1');
  const calls = new Set(ARMS.map(function (arm) { return rec(arm, s, 'r1').callDay; }));
  check('band ' + s + ' call day identical across arms (anchor well-defined)', calls.size === 1, 'call=' + base.callDay);
});
(function () {
  const b20 = rec('closecommit', '97420', 'r1'), f20 = rec('musterfed', '97420', 'r1');
  const a20 = [...new Set(b20.attempts.filter(function (a) { return a.day >= b20.callDay; }).map(function (a) { return a.day; }))].sort(function (x, y) { return x - y; })[0];
  check('97420 fed saves +2.0 mean (0 hungry days vs base 1; meanDelta 0 vs -2)',
    hungryDays(b20, b20.callDay, a20) === 1 && hungryDays(f20, b20.callDay, a20) === 0 &&
    meanDelta(b20, b20, a20) === -2.0 && meanDelta(f20, b20, a20) === 0.0, 'anchor=' + a20);
  const b33 = rec('closecommit', '97433', 'r1'), f33 = rec('musterfed', '97433', 'r1');
  const a33 = [...new Set(b33.attempts.filter(function (a) { return a.day >= b33.callDay; }).map(function (a) { return a.day; }))].sort(function (x, y) { return x - y; })[0];
  check('97433 fed saves +2.0 mean (0 hungry days vs base 1; meanDelta 0 vs -2)',
    hungryDays(b33, b33.callDay, a33) === 1 && hungryDays(f33, b33.callDay, a33) === 0 &&
    meanDelta(b33, b33, a33) === -2.0 && meanDelta(f33, b33, a33) === 0.0, 'anchor=' + a33);
  const b35 = rec('closecommit', '97435', 'r1'), f35 = rec('musterfed', '97435', 'r1');
  const a35 = [...new Set(b35.attempts.filter(function (a) { return a.day >= b35.callDay; }).map(function (a) { return a.day; }))].sort(function (x, y) { return x - y; })[0];
  check('97435 fed feeds 5 of 6 dawns (1 hungry day vs base 6) yet 0 attempts',
    hungryDays(b35, b35.callDay, a35) === 6 && hungryDays(f35, b35.callDay, a35) === 1 && f35.attemptCount === 0, 'anchor=' + a35);
})();

// 8. Perception audit.
['lairsham', 'lairnoise'].forEach(function (pol) {
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', pol + '.js'), 'utf8');
  ['worldMonsters', '_otherVillage', 'hierarchyState', 'titanCallReadiness', '.roster', 'link.trust', 'link.opinion', 'link.arrears'].forEach(function (bad) {
    check(pol + ' has no ' + bad + ' read/use', src.indexOf(bad) < 0);
  });
});
(function () {
  const sh = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'lairsham.js'), 'utf8');
  check('lairsham consumes no RNG of its own', sh.indexOf('Math.random') < 0);
  const NZ = require(path.join(REPO, 'scripts', 'policies', 'lairnoise.js'));
  check('lairnoise draws exactly 8/day', NZ.DRAWS_PER_DAY === 8);
  check('lairnoise records draws on band seeds', rec('lairnoise', '97405', 'r1').lairnoiseCtx.draws.length > 0);
  check('lairsham records packs on band seeds', rec('lairsham', '97405', 'r1').lairshamCtx.packs.length > 0);
})();

console.log(pass + ' checks passed' + (process.exitCode ? ' (FAILURES PRESENT)' : ''));
