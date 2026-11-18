// test-launchquad-trace-b.js — proof for scripts/trace-launchquad-b.js.
// Fixtures pin the launch join (incl. the day-49 triple-launch
// regression) and the mechanism verdict; the population check
// reproduces the frozen 3 launched evades (1 ctl, 2 arm) from the
// corpus dirs passed as argv[2]/argv[3] (defaults: the in-repo frozen
// corpora). Exits non-zero on any failure. No repo writes.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const T = require('./trace-launchquad-b.js');

let n = 0;
function check(name, fn) { n++; fn(); console.log('ok ' + n + ' - ' + name); }

// --- joinLaunch fixtures ---
const launches49 = [
  { day: 49, vid: 'gen_ke7f7nq', target: 'audit', party: ['benoit_lambert'] },
  { day: 49, vid: 'naran_tumen', target: 'audit', party: ['benoit_lambert'] },
  { day: 49, vid: 'ivy_wang', target: 'audit', party: ['benoit_lambert', 'ava_garcia', 'naran_tumen'] },
];
check('join: Ava d53 meeting joins Ivy\'s d49 quad, not the same-day size-2 launches', function () {
  const m = { day: 53, vid: 'ava_garcia', mid: 'audit', allyVid: null };
  const l = T.joinLaunch(launches49, m);
  assert.strictEqual(l.vid, 'ivy_wang');
  assert.deepStrictEqual(l.party, ['benoit_lambert', 'ava_garcia', 'naran_tumen']);
});
check('join: first-match order — a size-2 launch wins when the vid matches it first', function () {
  const m = { day: 49, vid: 'gen_ke7f7nq', mid: 'audit', allyVid: null };
  const l = T.joinLaunch(launches49, m);
  assert.strictEqual(l.vid, 'gen_ke7f7nq');
});
check('join: target mismatch skips the launch', function () {
  const m = { day: 50, vid: 'ivy_wang', mid: 'eulogy', allyVid: null };
  const l = T.joinLaunch(launches49, m);
  assert.strictEqual(l, null);
});
check('join: 21-day window — a meeting 22 days after launch does not join', function () {
  const m = { day: 71, vid: 'ivy_wang', mid: 'audit', allyVid: null };
  const l = T.joinLaunch([{ day: 49, vid: 'ivy_wang', target: 'audit', party: [] }], m);
  assert.strictEqual(l, null);
});

// --- verdict fixtures ---
check('verdict: E2 shape -> ALLY-PICK (plan differs, sensed matches, allyFromStart false)', function () {
  const v = T.verdict({
    launchParty: ['ivy_wang', 'benoit_lambert', 'naran_tumen', 'gen_ke7f7nq'],
    meetingParty: ['ivy_wang', 'gen_256ihks', 'gen_x833x9m'],
    allyFromStart: false,
    gatePlanParty: ['benoit_lambert', 'ava_garcia', 'naran_tumen'],
    gateSensed: ['ivy_wang', 'gen_256ihks', 'gen_x833x9m'],
    togetherRows: [{ day: 48, vid: 'naran_tumen', mid: 'strike', outcome: 'evade', allies: ['gen_256ihks', 'gen_ke7f7nq'] }],
    apartRows: [],
  });
  assert.strictEqual(v.verdict, 'ALLY-PICK');
});
check('verdict: together + apart rows -> SCATTER', function () {
  const v = T.verdict({
    launchParty: ['a', 'b', 'c', 'd'], meetingParty: ['a', 'x', 'y'],
    allyFromStart: false, gatePlanParty: ['b', 'c'], gateSensed: ['a', 'x', 'y'],
    togetherRows: [{ day: 2, vid: 'a', mid: 'm', outcome: 'evade', allies: ['b'] }],
    apartRows: [{ day: 3, vid: 'b', mid: 'm', outcome: 'evade', allies: ['x'] }],
  });
  assert.strictEqual(v.verdict, 'SCATTER');
});
check('verdict: meeting party equals launch party -> UNDECIDED (nothing to explain)', function () {
  const v = T.verdict({
    launchParty: ['a', 'b'], meetingParty: ['b', 'a'],
    allyFromStart: true, gatePlanParty: ['b'], gateSensed: ['a', 'b'],
    togetherRows: [], apartRows: [],
  });
  assert.strictEqual(v.verdict, 'UNDECIDED');
});
check('verdict: no gate rows at all -> UNDECIDED, names the gap', function () {
  const v = T.verdict({
    launchParty: ['a', 'b', 'c', 'd'], meetingParty: ['a', 'x', 'y'],
    allyFromStart: null, gatePlanParty: null, gateSensed: null,
    togetherRows: [], apartRows: [],
  });
  assert.strictEqual(v.verdict, 'UNDECIDED');
  assert.ok(v.reason.indexOf('allyFromStart=null') !== -1);
});

// --- launchesForSeed fixtures (wave-4 filter + (vid,day) dedupe) ---
check('launchesForSeed: wave-3 hunts are filtered, wave-4 launches kept, same-day dupes merged', function () {
  const raw = { v4departs: [
    { result: 'launch', vid: 'a', day: 10, target: 'ad_break', targetWave: 3, party: ['b'], partySize: 2, source: 'brain' },
    { result: 'launch', vid: 'c', day: 10, target: 'audit', targetWave: 4, party: ['d'], partySize: 2, source: 'brain' },
    { result: 'launch', vid: 'c', day: 10, target: 'audit', targetWave: 4, party: ['e'], partySize: 4, source: 'winPlan' },
    { result: 'hold', vid: 'c', day: 11, target: 'audit', targetWave: 4, party: [], partySize: 1, source: 'brain' },
  ] };
  const ls = T.launchesForSeed(raw);
  assert.strictEqual(ls.length, 1);
  assert.strictEqual(ls[0].vid, 'c');
  assert.strictEqual(ls[0].partySize, 4);
  assert.deepStrictEqual(ls[0].party.slice().sort(), ['d', 'e']);
});

// --- population check (frozen corpus) ---
check('population: tracer reproduces the 3 launched evades (1 ctl, 2 arm)', function () {
  const ctlDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-17', 'perseed-partysize-allycap-b-ctl');
  const armDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-17', 'perseed-partysize-allycap-b-arm');
  if (!fs.existsSync(ctlDir) || !fs.existsSync(armDir)) {
    console.log('   (corpus dirs absent in this worktree — population check skipped; run with sibling corpus paths)');
    return;
  }
  const out = path.join(__dirname, '..', 'evidence', '2026-11-18', 'launchquad-trace-b-test-pop.json');
  execFileSync(process.execPath, [path.join(__dirname, 'trace-launchquad-b.js'), ctlDir, armDir, out], { stdio: 'pipe' });
  const j = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.deepStrictEqual(j.population.actual, T.EXPECTED);
  assert.deepStrictEqual(j.population.expected, T.EXPECTED);
  const e2 = j.rows.find(function (r) { return r.seed === '103604' && r.day === 49; });
  assert.ok(e2, 'E2 row present');
  assert.deepStrictEqual(e2.meetingParty, ['ivy_wang', 'gen_256ihks', 'gen_x833x9m']);
  assert.strictEqual(e2.verdict, 'ALLY-PICK');
  const e3 = j.rows.find(function (r) { return r.seed === '103604' && r.day === 53; });
  assert.ok(e3, 'E3 row present');
  assert.strictEqual(e3.verdict, 'ALLY-PICK');
  const e1 = j.rows.find(function (r) { return r.seed === '103606' && r.day === 77; });
  assert.ok(e1, 'E1 row present');
  assert.strictEqual(e1.verdict, 'ALLY-PICK');
  fs.unlinkSync(out);
});

console.log('test-launchquad-trace-b: ' + n + '/' + n + ' green');
