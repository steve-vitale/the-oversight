#!/usr/bin/env node
// test-atimescale-b.js — proof for sim-atimescale-b (2026-11-02).
// Covers: analyzer delta fixtures (closing day 7; pass-through day 8;
// broken camp; walk-out-E failure; day-5 already closed) and a
// reused-files-unmodified check (zero edits to game code, competent,
// construct policy/driver, or any destfirst/shapes instrument).
// Writes fixtures to /tmp only; never writes into the repo.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const assert = require('assert');
const HERE = path.dirname(__filename);
const ANALYZER = path.join(HERE, 'atimescale-b-analyze.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atimescale-test-'));

function day(loopDay, endPos, eOk, opts) {
  const o = opts || {};
  return {
    loopDay,
    start: { pos: o.startPos || { x: 4, y: 4 }, haven: { x: 4, y: 4 } },
    end: { pos: endPos, haven: { x: 4, y: 4 } },
    dayEndReturnSim: eOk === null ? null : { ok: eOk, via: eOk ? 'lateral' : 'none', directOk: false, legs: eOk ? 1 : 0 },
    construct: o.construct || null,
    hops: o.hops || [],
  };
}
function inst(days) { return { seed: 99999, daysAlive: 30, days }; }
function runFixture(name, instance, dest) {
  const f = path.join(tmp, name + '.jsonl');
  fs.writeFileSync(f, JSON.stringify(instance) + '\n');
  const out = execFileSync('node', [ANALYZER, '--file', f, '--dest', dest], { encoding: 'utf8' });
  const line = out.split('\n').find((l) => l.startsWith('ATIMESCALE'));
  assert(line, 'no ATIMESCALE line for ' + name);
  return line;
}
const DEST = { x: 6, y: 2 };
const walkConstruct = { kind: 'walkout', posAfterForced: { x: 6, y: 2 } };
const walkHops = [{ from: { x: 4, y: 4 }, to: { x: 5, y: 4 }, simOk: true },
  { from: { x: 5, y: 4 }, to: { x: 6, y: 4 }, simOk: true },
  { from: { x: 6, y: 4 }, to: { x: 6, y: 3 }, simOk: true },
  { from: { x: 6, y: 3 }, to: { x: 6, y: 2 }, simOk: true }];
function baseDays(overrides) {
  const o = overrides || {};
  return [
    day(5, { x: 6, y: 2 }, o.d5E === undefined ? true : o.d5E, { construct: walkConstruct, hops: o.hops || walkHops }),
    day(6, o.d6Pos || { x: 6, y: 2 }, o.d6E === undefined ? true : o.d6E),
    day(7, o.d7Pos || { x: 6, y: 2 }, o.d7E === undefined ? true : o.d7E),
    day(8, o.d8Pos || { x: 6, y: 2 }, o.d8E === undefined ? true : o.d8E),
  ];
}
let n = 0;
// 1. Closing on day 7.
let line = runFixture('close7', inst(baseDays({ d7E: false })), '6,2');
assert(/confirmed=true/.test(line) && /closingDay=7/.test(line), 'close7: ' + line); n++;
// 2. Closing on day 8 (day 6-7 pass).
line = runFixture('close8', inst(baseDays({ d8E: false })), '6,2');
assert(/confirmed=true/.test(line) && /closingDay=8/.test(line), 'close8: ' + line); n++;
// 3. Pass-through: camps through day 8, E always passing.
line = runFixture('pass', inst(baseDays({})), '6,2');
assert(/confirmed=false/.test(line) && /reason=camped-through-day8-E-passing/.test(line), 'pass: ' + line); n++;
// 4. Broken camp: day 6 ends elsewhere, day 7 fails THERE — not a setup.
line = runFixture('broken', inst(baseDays({ d6Pos: { x: 4, y: 4 }, d7Pos: { x: 4, y: 4 }, d7E: false })), '6,2');
assert(/confirmed=false/.test(line) && /reason=camp-broken-day6/.test(line), 'broken: ' + line); n++;
// 5. Walk-out hop E fails, day-end fails at dest — outward prevention, not a setup.
const badHops = walkHops.slice(0, 3).concat([{ from: { x: 6, y: 3 }, to: { x: 6, y: 2 }, simOk: false }]);
line = runFixture('walke', inst(baseDays({ hops: badHops, d5E: false })), '6,2');
assert(/confirmed=false/.test(line) && /reason=walkout-E-failed/.test(line), 'walke: ' + line); n++;
// 6. Day-5 already closed (single-day pocket, not a multi-day closing).
line = runFixture('d5closed', inst(baseDays({ d5E: false })), '6,2');
assert(/confirmed=false/.test(line) && /reason=day5-already-closed/.test(line), 'd5closed: ' + line); n++;
// 7. Leg ends before day 8 (village lost / truncated): day 7 absent.
const shortDays = baseDays({}); shortDays.splice(2, 1);
line = runFixture('short', inst(shortDays), '6,2');
assert(/confirmed=false/.test(line) && /leg-ends-before-day7/.test(line), 'short: ' + line); n++;
// 8. Reused-files-unmodified check: no tracked modification to protected paths.
const protectedPaths = [
  'src/js', 'scripts/policies/competent.js', 'scripts/policies/competent-homewardconstruct-b.js',
  'scripts/homeconstruct-b-driver.js', 'scripts/destfirst-b-screen.js', 'scripts/destfirst-b-confirm.js',
  'scripts/analyze-destfirst-b.js', 'scripts/analyze-homeward-shapes-b.js',
  'scripts/policies/competent-homewardstep-b.js',
];
const changed = execSync('git diff HEAD --name-only -- ' + protectedPaths.join(' '), { encoding: 'utf8', cwd: HERE + '/..' }).trim();
const staged = execSync('git diff --cached --name-only -- ' + protectedPaths.join(' '), { encoding: 'utf8', cwd: HERE + '/..' }).trim();
assert(!changed && !staged, 'protected paths modified: diff=[' + changed + '] staged=[' + staged + ']'); n++;
console.log('test-atimescale-b: ' + n + '/' + n + ' checks passed (7 analyzer fixtures + reused-files-unmodified)');
