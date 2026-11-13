#!/usr/bin/env node
'use strict';
// test-regresswatch-b.js — proof test for the fresh-band reproduction of
// the regression_watch player named-class read (arm sim-regresswatch-b,
// run fleshout-loop-b-20261112T2130Z).
//
// THE READ TO REPRODUCE (prereg, committed c6a89c0cf): the synergy
// holdout (16 fresh seeds 190509-190524, before fed635f1f -> after
// ad2bd13fd) flagged the player named-class line (classAccess)
// 0.8125 -> 0.625, delta -0.1875, interval touching zero at its upper
// bound — status regression_watch, adjudicated trajectory noise. This
// arm re-runs the same before/after on the fresh 8-seed band
// 190525-190532. GO for confirm iff the pilot compare flags classAccess
// as regression_signal; watch or no-signal is NO-GO (noise) and the
// run stops there — no 16-seed confirm.
//
// WHAT THIS TEST PROVES (from the committed corpora only — no sims,
// no cases/ caches: those were deleted at closeout per the prereg and
// the panel.json.gz files are the retained artifacts):
//   1. The compare's classAccess row is no_material_signal, 0.875 ->
//      0.875, delta 0, interval [0, 0], 8 pairs, 8/8 tied — NOT a
//      signal, so the prereg NO-GO rule fires and no confirm is owed.
//   2. Both panels carry the prereg legs (source heads fed635f1f /
//      ad2bd13fd) and exactly the 8 distinct competent seeds
//      190525-190532 at 150d; the panel rows themselves hold the
//      per-seed classes (190531 class-less on both legs).
//   3. Wall numbers match the evidence file: before 7/8 village-lost,
//      1 survived, median 124d; after 4/8 survived, 4 lost, median
//      150d; wins / national / table 0 on both legs.
//   4. The evidence file's verdict (NO-GO, no confirm) matches the
//      compare, and its numbers match the corpora.
//   5. The four other watch rows that drive the overall
//      review_required decision are present and are watches, not
//      signals — the overall decision is not the judge.
//
// Usage: node scripts/test-regresswatch-b.js
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.resolve(__dirname, '..');
const EV = path.join(root, 'evidence', '2026-11-12');
const COMPARE = path.join(EV, 'regresswatch-b-panel-compare.json');
const BEFORE_DIR = path.join(EV, 'regresswatch-b-panel-before');
const AFTER_DIR = path.join(EV, 'regresswatch-b-panel-after');
const EVIDENCE = path.join(EV, 'sim-regresswatch-b.md');
const BEFORE_SHA = 'fed635f1fd3565c284ae7b7eecb628babecb1df7';
const AFTER_SHA = 'ad2bd13fd8fb70081f61f47feb1b839fd4787508';
const BAND = [190525, 190526, 190527, 190528, 190529, 190530, 190531, 190532];

let pass = 0, fail = 0;
function leg(name, ok, detail) {
  if (ok) { pass++; console.log('  ok   ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readPanel(dir) {
  const bytes = fs.readFileSync(path.join(dir, 'panel.json.gz'));
  return JSON.parse(zlib.gunzipSync(bytes).toString('utf8'));
}

const compare = readJson(COMPARE);
const comp = (compare.policies || []).filter(function (p) { return p.policy === 'competent'; })[0] || {};
const rows = comp.metrics || [];
const byId = {};
for (const r of rows) byId[r.id] = r;
const ca = byId.classAccess || {};

// 1. The judged row.
leg('classAccess status is no_material_signal (not a signal)',
  ca.status === 'no_material_signal', 'status ' + ca.status);
leg('classAccess before is 0.875 (7/8)', ca.before === 0.875, 'before ' + ca.before);
leg('classAccess after is 0.875 (7/8)', ca.after === 0.875, 'after ' + ca.after);
leg('classAccess delta is exactly 0', ca.delta === 0, 'delta ' + ca.delta);
leg('classAccess interval is [0, 0]', JSON.stringify(ca.interval95) === '[0,0]',
  'interval ' + JSON.stringify(ca.interval95));
leg('classAccess pairs 8/8 eligible both legs',
  ca.pairs === 8 && ca.eligibleBefore === 8 && ca.eligibleAfter === 8,
  'pairs ' + ca.pairs + ' eligible ' + ca.eligibleBefore + '/' + ca.eligibleAfter);
leg('classAccess tied 8/8, none increased or decreased',
  ca.tied === 8 && ca.increased === 0 && ca.decreased === 0,
  'tied ' + ca.tied + ' inc ' + ca.increased + ' dec ' + ca.decreased);
leg('prereg NO-GO rule fires: status is not regression_signal',
  ca.status !== 'regression_signal', 'status ' + ca.status);

// 2. Panel legs + seeds, from the retained panel.json.gz rows.
const beforePanel = readPanel(BEFORE_DIR);
const afterPanel = readPanel(AFTER_DIR);
leg('before panel source heads are the prereg before leg fed635f1f',
  beforePanel.sourceHeadStart === BEFORE_SHA && beforePanel.sourceHeadEnd === BEFORE_SHA,
  'heads ' + String(beforePanel.sourceHeadStart).slice(0, 8));
leg('after panel source heads are the prereg after leg ad2bd13fd',
  afterPanel.sourceHeadStart === AFTER_SHA && afterPanel.sourceHeadEnd === AFTER_SHA,
  'heads ' + String(afterPanel.sourceHeadStart).slice(0, 8));
for (const side of [['before', beforePanel], ['after', afterPanel]]) {
  const panel = side[1];
  const prow = panel.rows || [];
  const seeds = prow.map(function (c) { return (c.row || {}).seed; }).sort(function (a, b) { return a - b; });
  leg(side[0] + ' panel holds exactly the 8 band seeds 190525-190532',
    JSON.stringify(seeds) === JSON.stringify(BAND), 'seeds ' + seeds.join(','));
  leg(side[0] + ' panel rows are all competent policy at 150d',
    prow.every(function (c) { return (c.row || {}).policy === 'competent'; }) &&
    (panel.options || {}).days === 150, 'options days ' + ((panel.options || {}).days));
  leg(side[0] + ' panel options name the band seeds',
    JSON.stringify((panel.options || {}).seeds) === JSON.stringify(BAND), '');
  const bySeed = {};
  for (const c of prow) bySeed[(c.row || {}).seed] = c;
  leg(side[0] + ' seed 190531 has no player class (the one miss)',
    bySeed[190531] && Array.isArray((bySeed[190531].classes || {}).player) &&
    bySeed[190531].classes.player.length === 0,
    'player classes ' + JSON.stringify((bySeed[190531].classes || {}).player));
  leg(side[0] + ' seed 190525 has a player class (not the miss)',
    bySeed[190525] && Array.isArray((bySeed[190525].classes || {}).player) &&
    bySeed[190525].classes.player.length > 0,
    'player classes ' + JSON.stringify((bySeed[190525].classes || {}).player));
}
leg('compare pairs 8 competent cases', comp.cases === 8, 'compare cases ' + comp.cases);

// 3. Wall numbers from the panel rows.
function wall(panel) {
  const prow = panel.rows || [];
  const days = prow.map(function (c) { return (c.row || {}).days || 0; }).sort(function (a, b) { return a - b; });
  return {
    n: prow.length,
    survived: prow.filter(function (c) { return (c.row || {}).endReason === 'survived'; }).length,
    lost: prow.filter(function (c) { return (c.row || {}).endReason === 'village-lost'; }).length,
    medianDays: days[Math.floor(days.length / 2)],
  };
}
const wBefore = wall(beforePanel);
const wAfter = wall(afterPanel);
leg('before wall: 1/8 survived, 7/8 village-lost',
  wBefore.survived === 1 && wBefore.lost === 7, wBefore.survived + '/' + wBefore.lost);
leg('before wall: median 124d', wBefore.medianDays === 124, 'median ' + wBefore.medianDays);
leg('after wall: 4/8 survived, 4/8 village-lost',
  wAfter.survived === 4 && wAfter.lost === 4, wAfter.survived + '/' + wAfter.lost);
leg('after wall: median 150d', wAfter.medianDays === 150, 'median ' + wAfter.medianDays);
leg('no wins / national / table on either leg (compare rows 0 -> 0)',
  byId.won && byId.won.before === 0 && byId.won.after === 0 &&
  byId.national && byId.national.before === 0 && byId.national.after === 0 &&
  byId.table && byId.table.before === 0 && byId.table.after === 0,
  'won ' + (byId.won || {}).before + '->' + (byId.won || {}).after +
  ' national ' + (byId.national || {}).before + '->' + (byId.national || {}).after +
  ' table ' + (byId.table || {}).before + '->' + (byId.table || {}).after);

// 4. Evidence file matches the compare.
const ev = fs.readFileSync(EVIDENCE, 'utf8');
leg('evidence verdict is NO-GO (noise)',
  ev.indexOf('Verdict: NO-GO (noise)') >= 0, 'verdict line present');
leg('evidence says no confirm is owed',
  ev.indexOf('No 16-seed confirm is owed') >= 0 || ev.indexOf('no confirm is owed') >= 0,
  'confirm line present');
leg('evidence records classAccess 0.875 -> 0.875',
  ev.indexOf('0.875 → 0.875') >= 0, 'numbers line present');
leg('evidence names the duplicate 190525 case file',
  ev.indexOf('9 files for 8 seeds') >= 0, 'duplicate line present');

// 5. The other watch rows drive review_required; none is a signal.
leg('overall decision is review_required', compare.decision === 'review_required',
  'decision ' + compare.decision);
const watchIds = ['survival30', 'survival60', 'villageDeaths', 'livingNpcs'];
for (const id of watchIds) {
  const r = byId[id] || {};
  leg('watch row ' + id + ' is regression_watch, not a signal',
    r.status === 'regression_watch', 'status ' + r.status);
}
const signals = rows.filter(function (r) { return r.status === 'regression_signal'; });
leg('no regression_signal anywhere in the compare',
  signals.length === 0, 'signals ' + signals.length);

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
