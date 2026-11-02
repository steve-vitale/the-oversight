#!/usr/bin/env node
// test-musterupkeep-a.js — proof test for sim-musterupkeep-a (Loop A
// 20261102, axis scale-onramp). READ-ONLY: asserts over the committed
// per-seed trace JSONs, the policy source, and the policy's exported
// need helper over a fake Game. No harness, no writes, no RNG.
// Proves:
//   1. Baseline reproduction: the new driver's closecommit runs match
//      the closedecay records (gate series + trust series identical).
//   2. Fed-march measurement: exactly 1 fully-fed dawn on 97330 and 2
//      on 97338; day-matched trust gains (+6.0 / +7.0) far below the
//      pre-registered +20 bar; 0 contact attempts in both fed runs;
//      village-lost NOT earlier than baseline (guardrail passes, bar
//      fails) => NO-GO.
//   3. Perception audit: musterfed.js reads no monster roster, no
//      allied roster, no link list (no trust/opinion/arrears code
//      reads); it decides from the call record, its own muster record,
//      its own pack, and the pack verb; it consumes no RNG of its own.
// Usage: node scripts/test-musterupkeep-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OLD = path.join(REPO, 'evidence', '2026-11-02', 'perseed-closedecay-a');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-musterupkeep-a');
let pass = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail != null ? ' — ' + detail : '')); }
  else { console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); process.exitCode = 1; }
}
function load(dir, f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
function rowFor(rec, day) { return rec.dailyTrace.find(function (r) { return r.day === day; }); }
function gateSeries(rec) { return rec.dailyTrace.map(function (r) { return r.day + ':' + r.gate.gateLiving + '/' + r.gate.ready; }).join(','); }
function trustSeries(rec) { return rec.dailyTrace.map(function (r) { return r.day + ':' + r.links.map(function (l) { return l.name + '=' + l.trust; }).join(','); }).join(' | '); }
function trustAt(rec, day, name) {
  const row = rowFor(rec, day);
  if (!row) return null;
  const link = row.links.find(function (l) { return l.name === name; });
  return link ? link.trust : null;
}
function meanAt(rec, day, names) {
  const vals = names.map(function (n) { return trustAt(rec, day, n); }).filter(function (v) { return v != null; });
  if (!vals.length) return null;
  return vals.reduce(function (t, v) { return t + v; }, 0) / vals.length;
}
function fullyFedDawns(rec) {
  // A dawn is fully fed iff the previous day's pack covers that dawn's
  // need: no hungry line on that dawn day AND the prior pack's
  // packAfter >= need. Counted from the policy's own pack records
  // cross-checked against the hungry-line days.
  const packs = ((rec.musterfedCtx || {}).packs || []);
  const hungryDays = {};
  rec.anchoredLines.filter(function (l) { return /muster is hungry/.test(l.line); }).forEach(function (l) { hungryDays[l.day] = true; });
  return packs.filter(function (p) { return p.packAfter >= p.need && !hungryDays[p.day + 1]; }).map(function (p) { return p.day + '->' + (p.day + 1); });
}

const base30 = load(DIR, 'mu-closecommit-s97330-r1.json');
const base38 = load(DIR, 'mu-closecommit-s97338-r1.json');
const old30 = load(OLD, 'cd-closecommit-s97330-r1.json');
const old38 = load(OLD, 'cd-closecommit-s97338-diag.json');
const fed30 = load(DIR, 'mu-musterfed-s97330-r1.json');
const fed38 = load(DIR, 'mu-musterfed-s97338-r1.json');

// 1. Baseline reproduction.
check('97330 baseline gate series == closedecay r1', gateSeries(base30) === gateSeries(old30));
check('97330 baseline trust series == closedecay r1', trustSeries(base30) === trustSeries(old30));
check('97330 baseline contact d110 mean 58.0', meanAt(base30, 110, ['Emberhold', 'Stonebridge']) === 58.0,
  'Emberhold=' + trustAt(base30, 110, 'Emberhold') + ' Stonebridge=' + trustAt(base30, 110, 'Stonebridge'));
check('97338 baseline gate series == closedecay diag', gateSeries(base38) === gateSeries(old38));
check('97338 baseline trust series == closedecay diag', trustSeries(base38) === trustSeries(old38));
check('97338 baseline contact d118 Thornfield 85', trustAt(base38, 118, 'Thornfield') === 85);
check('97330 baseline village-lost d122', base30.endReason === 'village-lost' && base30.gameDays === 122);
check('97338 baseline village-lost d122', base38.endReason === 'village-lost' && base38.gameDays === 122);

// 2. Fed measurement + NO-GO verdict numbers.
check('97330 fed call d97 gate 11 (same as baseline)', fed30.callDay === 97 && rowFor(fed30, 97).gate.gateLiving === 11);
check('97338 fed call d113 gate 9 (same as baseline)', fed38.callDay === 113 && rowFor(fed38, 113).gate.gateLiving === 9);
check('97330 fed fully-fed dawns exactly 1 (d98 pack -> d99 dawn)', JSON.stringify(fullyFedDawns(fed30)) === JSON.stringify(['98->99']),
  'fedDawns=' + JSON.stringify(fullyFedDawns(fed30)));
check('97338 fed fully-fed dawns exactly 2 (d113, d141 packs)', JSON.stringify(fullyFedDawns(fed38)) === JSON.stringify(['113->114', '141->142']),
  'fedDawns=' + JSON.stringify(fullyFedDawns(fed38)));
check('97330 fed 0 contact attempts (no own contact day)', fed30.attemptCount === 0 && fed30.attempts.length === 0);
check('97338 fed 0 contact attempts (no own contact day)', fed38.attemptCount === 0 && fed38.attempts.length === 0);
const fed30d110 = meanAt(fed30, 110, ['Emberhold', 'Stonebridge']);
const fed38d118 = trustAt(fed38, 118, 'Thornfield');
check('97330 fed day-matched d110 mean 64.0, gain +6.0 < +20', fed30d110 === 64.0 && (fed30d110 - 58.0) === 6.0,
  'fed=' + fed30d110 + ' baseline=58.0');
check('97338 fed day-matched d118 Thornfield 92, gain +7.0 < +20', fed38d118 === 92 && (fed38d118 - 85) === 7.0,
  'fed=' + fed38d118 + ' baseline=85');
check('97330 fed village-lost NOT earlier (d141 >= d122)', fed30.endReason === 'village-lost' && fed30.gameDays >= 122, 'fed end d' + fed30.gameDays);
check('97338 fed village-lost NOT earlier (d152 >= d122)', fed38.endReason === 'village-lost' && fed38.gameDays >= 122, 'fed end d' + fed38.gameDays);
check('97330 fed gate at d110 is 9, NOT baseline 8 (trajectory diverged, recorded not hidden)',
  rowFor(fed30, 110).gate.gateLiving === 9 && rowFor(base30, 110).gate.gateLiving === 8);
check('97338 fed gate at d118 is 8, NOT baseline 6 (trajectory diverged, recorded not hidden)',
  rowFor(fed38, 118).gate.gateLiving === 8 && rowFor(base38, 118).gate.gateLiving === 6);
check('97330 fed 0 fights', fed30.attempts.every(function (a) { return a.cls === 'REFUSED'; }) && fed30.won === 0);
check('97338 fed 0 fights', fed38.attempts.every(function (a) { return a.cls === 'REFUSED'; }) && fed38.won === 0);
check('97330 fed pantry emptied by packing (0 from d99)', rowFor(fed30, 99).pantryKcal === 0);
check('97338 fed pantry emptied by packing (0 from d114)', rowFor(fed38, 114).pantryKcal === 0);

// 3. Perception audit (musterfed policy source).
const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'musterfed.js'), 'utf8');
['worldMonsters', '_otherVillage', 'hierarchyState', 'titanCallReadiness', '.roster', 'link.trust', 'link.opinion', 'link.arrears', 'Math.random'].forEach(function (bad) {
  check('musterfed has no ' + bad + ' read/use', src.indexOf(bad) < 0);
});
check('musterfed decides from own muster + pack verb',
  src.indexOf('titanMusterState') >= 0 && src.indexOf('takeFromPantryBulk') >= 0 && src.indexOf('playerPackKcal') >= 0);

// 4. Need-helper unit checks over a fake Game (no harness).
const MF = require(path.join(REPO, 'scripts', 'policies', 'musterfed.js'));
const fake = { villagerId: 'bearer1' };
const est = MF.musterNeedFor(fake, {
  allies: [{ villageId: 'ember', vid: 'a1' }, { villageId: 'ember', vid: 'a1' }, { villageId: 'stone', vid: 'b2' }],
  haven: [{ vid: 'h1' }, { vid: 'bearer1' }, 'h2', { vid: 'h1' }],
});
check('musterNeedFor dedups allies + haven, excludes bearer', est.allies === 2 && est.haven === 2 && est.blades === 4 && est.need === 4000,
  JSON.stringify(est));

console.log(pass + ' checks passed' + (process.exitCode ? ' (FAILURES PRESENT)' : ''));
