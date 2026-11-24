// test-launchready-b.js — proof test for scripts/analyze-launchready-b.js.
//
// Synthetic legs in a temp dir (no repo writes), plus determinism on the
// real ragecarry confirm corpus: two runs byte-identical, and the frozen
// census numbers reproduce.
// Run: node scripts/test-launchready-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { analyzeLeg, dist } = require('./analyze-launchready-b.js');

let pass = 0;
function check(name, fn) {
  fn();
  pass += 1;
  console.log('PASS ' + name);
}

check('dist quartiles', () => {
  const d = dist([10, 20, 30, 40, 50]);
  assert.strictEqual(d.n, 5);
  assert.strictEqual(d.min, 10);
  assert.strictEqual(d.median, 30);
  assert.strictEqual(d.max, 50);
  assert.deepStrictEqual(dist([]), { n: 0, min: null, q1: null, median: null, q3: null, max: null });
});

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'launchready-test-'));
const armDir = path.join(tmp, 'arm');
const ctlDir = path.join(tmp, 'ctl');
fs.mkdirSync(armDir);
fs.mkdirSync(ctlDir);
function writeLeg(dir, seed, departs, census, encounters) {
  fs.writeFileSync(path.join(dir, 'ragecarry-b-s' + seed + '-ragecarry-b-arm.json'), JSON.stringify({
    seed,
    v4departs: departs,
    dawnbidCensus: census,
    v4encounters: encounters || [],
  }));
}
// Joined launch rows (same vid+day census present) + one unjoined.
writeLeg(armDir, 1, [
  { day: 5, vid: 'a', result: 'launch', partySize: 2, partyArmed: 1 },
  { day: 6, vid: 'a', result: 'launch', partySize: 2, partyArmed: 2 },
  { day: 7, vid: 'b', result: 'hold', partySize: 1, partyArmed: 0 },
  { day: 8, vid: 'c', result: 'launch', partySize: 3, partyArmed: 1 },
], [
  { day: 5, vid: 'a', holderHealth: 80 },
  { day: 6, vid: 'a', holderHealth: 14 },
  { day: 7, vid: 'b', holderHealth: 90 },
], [{ fleeHpFrac: 0.2 }, { fleeHpFrac: 0.4 }]);
writeLeg(ctlDir, 1, [
  { day: 5, vid: 'a', result: 'launch', partySize: 2, partyArmed: 2 },
], [{ day: 5, vid: 'a', holderHealth: 95 }], []);

check('join rate counts only same-(vid,day) census rows', () => {
  const a = analyzeLeg(armDir);
  assert.strictEqual(a.departsTotal, 4);
  assert.strictEqual(a.joined, 3);
  assert.strictEqual(a.joinRate, 0.75);
  assert.deepStrictEqual(a.departsByResult, { launch: 3, hold: 1 });
  assert.strictEqual(a.healthAtDepart.n, 3);
  assert.strictEqual(a.healthAtDepart.min, 14);
  assert.strictEqual(a.healthAtDepart.median, 80);
  assert.strictEqual(a.healthAtDepart.shareLt25, 1 / 3);
  assert.strictEqual(a.fleeHpFrac.n, 2);
  assert.ok(Math.abs(a.fleeHpFrac.median - 0.3) < 1e-9, 'median ≈ 0.3, got ' + a.fleeHpFrac.median);
});

check('armed share splits by result', () => {
  const a = analyzeLeg(armDir);
  assert.strictEqual(a.armedShareByResult.launch.median, 0.5);
  assert.strictEqual(a.armedShareByResult.hold.median, 0);
});

check('real corpus deterministic and reproduces frozen numbers', () => {
  const script = path.join(__dirname, 'analyze-launchready-b.js');
  const a = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  const b = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  assert.strictEqual(a, b);
  const sum = JSON.parse(a);
  assert.strictEqual(sum.arm.files, 12);
  assert.strictEqual(sum.arm.departsTotal, 426);
  assert.strictEqual(sum.arm.joined, 20);
  assert.strictEqual(sum.ctl.files, 12);
  assert.strictEqual(sum.ctl.departsTotal, 493);
  assert.strictEqual(sum.ctl.joined, 40);
  assert.strictEqual(sum.arm.parseErrors.length, 0);
  assert.strictEqual(sum.ctl.parseErrors.length, 0);
});

console.log('test-launchready-b: ' + pass + '/4 PASS');
