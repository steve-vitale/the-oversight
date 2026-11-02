#!/usr/bin/env node
// test-locatedengage-a.js — corpus validator for sim-locatedengage-a.
// Reproduces the verdict from the corpus alone (no game load): reads
// evidence/2026-11-02/perseed-locatedengage-a/le-s97307.json and
// le-s97301.json, runs scripts/locatedengage-classify.js over the
// judged windows, and checks every DIAG-GO bar in
// evidence/2026-11-02/sim-locatedengage-a-prereg.md:
//   (a) 97307 days 129–152: 0 UNCLASSIFIED.
//   (b) 97301 days 59–91: 0 UNCLASSIFIED, 0 ATTEMPT-UNRESOLVED, and
//       attempt days resolved (pilot expectation: days 78/89, 4 rows).
//   (c) REPRODUCIBILITY vs the 0725Z pilot corpus values.
//   (d) this validator + the unit proof both green (this file IS the
//       corpus half; run test-locatedengage-classify.js for the other).
//   (e) purity (zero src/js changes) is verified by the coordinator at
//       commit time via git diff, not from the corpus.
//   (f) wall fields present per seed (reported, never pooled).
// Exit 0 + DIAG-GO only if every check passes; otherwise NO-GO + exit 1.
// Usage: node scripts/test-locatedengage-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const C = require(path.join(__dirname, 'locatedengage-classify.js'));

const DIR = path.join(__dirname, '..', 'evidence', '2026-11-02', 'perseed-locatedengage-a');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ': ' + JSON.stringify(extra) : '')); }
}
function load(seed) {
  const p = path.join(DIR, 'le-s' + seed + '.json');
  if (!fs.existsSync(p)) { console.log('MISSING corpus file: ' + p); process.exitCode = 1; return null; }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const r307 = load(97307);
const r301 = load(97301);
if (r307 && r301) {
  // ---- (a) case window ----
  const w307 = C.classifyWindow(r307, 129, 152);
  console.log('s97307 window 129-152 counts: ' + JSON.stringify(w307.counts));
  console.log('s97307 shared days: ' + JSON.stringify(w307.sharedDays) + ' near days: ' + JSON.stringify(w307.nearDays) + ' attempt days: ' + JSON.stringify(w307.attemptDays));
  check('(a) 97307 0 UNCLASSIFIED days 129-152', w307.unclassified.length === 0, w307.unclassified);
  check('(a) 97307 window covers 24 days', w307.days.length === 24, w307.days.length);
  // ---- (b) contrast window ----
  const w301 = C.classifyWindow(r301, 59, 91);
  console.log('s97301 window 59-91 counts: ' + JSON.stringify(w301.counts));
  console.log('s97301 shared days: ' + JSON.stringify(w301.sharedDays) + ' near days: ' + JSON.stringify(w301.nearDays) + ' attempt days: ' + JSON.stringify(w301.attemptDays));
  check('(b) 97301 0 UNCLASSIFIED days 59-91', w301.unclassified.length === 0, w301.unclassified);
  check('(b) 97301 0 ATTEMPT-UNRESOLVED days', w301.unresolved.length === 0, w301.unresolved);
  check('(b) 97301 attempt rows = 4', (r301.attempts || []).length === 4, (r301.attempts || []).length);
  const attDays = Array.from(new Set((r301.attempts || []).map(function (a) { return a.day; }))).sort(function (a, b) { return a - b; });
  check('(b) 97301 attempt days {78,89}', JSON.stringify(attDays) === '[78,89]', attDays);
  check('(b) 97301 every attempt day resolved', w301.attemptDays.length === 2 && w301.attemptDays.every(function (x) { return x.sub !== 'ATTEMPT-UNRESOLVED'; }), w301.attemptDays);
  // ---- (c) reproducibility vs pilot ----
  const m307 = r307.milestones || {}, m301 = r301.milestones || {};
  check('(c) 97307 wave4Day 116', m307.wave4Day === 116, m307.wave4Day);
  check('(c) 97307 omenStage2Day 129', m307.omenStage2Day === 129, m307.omenStage2Day);
  check('(c) 97307 firstPresentDay 129', m307.firstPresentDay === 129, m307.firstPresentDay);
  check('(c) 97307 lastPresentDay 152', m307.lastPresentDay === 152, m307.lastPresentDay);
  check('(c) 97307 attemptCount 0', r307.attemptCount === 0, r307.attemptCount);
  check('(c) 97307 lair 7,4', !!r307.lairTile && r307.lairTile.x === 7 && r307.lairTile.y === 4, r307.lairTile);
  check('(c) 97301 wave4Day 48', m301.wave4Day === 48, m301.wave4Day);
  check('(c) 97301 omenStage2Day 59', m301.omenStage2Day === 59, m301.omenStage2Day);
  check('(c) 97301 firstPresentDay 59', m301.firstPresentDay === 59, m301.firstPresentDay);
  check('(c) 97301 lastPresentDay 91', m301.lastPresentDay === 91, m301.lastPresentDay);
  check('(c) 97301 lair 8,4', !!r301.lairTile && r301.lairTile.x === 8 && r301.lairTile.y === 4, r301.lairTile);
  check('(c) 97307 instrument errors 0', (r307.instrumentErrors || []).length === 0 && (r307.interceptorErrors || []).length === 0 && (r307.travelErrors || []).length === 0,
    { inst: (r307.instrumentErrors || []).length, icpt: (r307.interceptorErrors || []).length, trav: (r307.travelErrors || []).length });
  check('(c) 97301 instrument errors 0', (r301.instrumentErrors || []).length === 0 && (r301.interceptorErrors || []).length === 0 && (r301.travelErrors || []).length === 0,
    { inst: (r301.instrumentErrors || []).length, icpt: (r301.interceptorErrors || []).length, trav: (r301.travelErrors || []).length });
  // ---- (f) wall fields present ----
  for (const [nm, r] of [['97307', r307], ['97301', r301]]) {
    check('(f) ' + nm + ' wall fields present',
      r.national != null && r.table != null && r.won != null && r.gameDays != null && r.endReason != null,
      { national: r.national, table: r.table, won: r.won, gameDays: r.gameDays, endReason: r.endReason });
  }
  // ---- daily tables (for the evidence file) ----
  console.log('--- s97307 daily 129-152 ---');
  for (const d of w307.days) console.log(d.day + ' ' + d.label + (d.sub ? '/' + d.sub : '') + ' minDist=' + d.minDist + ' ' + d.why);
  console.log('--- s97301 daily 59-91 (attempt/shared/near days only; rest APART) ---');
  for (const d of w301.days) { if (d.label !== 'APART') console.log(d.day + ' ' + d.label + (d.sub ? '/' + d.sub : '') + ' minDist=' + d.minDist + ' ' + d.why); }
  console.log('s97301 APART days in window: ' + JSON.stringify(w301.days.filter(function (d) { return d.label === 'APART'; }).map(function (d) { return d.day; })));
}

console.log('locatedengage corpus validator: ' + pass + ' passed, ' + fail + ' failed');
console.log(fail ? 'VERDICT: NO-GO' : 'VERDICT: DIAG-GO');
process.exit(fail ? 1 : 0);
