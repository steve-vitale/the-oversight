// test-titanmuster-b.js — proof test for scripts/analyze-titanmuster-b.js.
//
// Synthetic corpus in a temp dir (no repo writes), plus a determinism check
// on the real tbrefuse corpus: two runs must be byte-identical.
// Run: node scripts/test-titanmuster-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { analyzeFile } = require('./analyze-titanmuster-b.js');

let pass = 0;
function check(name, fn) {
  fn();
  pass += 1;
  console.log('PASS ' + name);
}

function seedFile(dir, seed, refusals, daily) {
  const doc = {
    seed, arm: 'test', run: 'test',
    refusals: refusals || [],
    daily: daily || [],
    refusalSayLines: [],
  };
  const f = path.join(dir, 'tbrefuse-b-s' + seed + '-tbrefuse-b-v2.json');
  fs.writeFileSync(f, JSON.stringify(doc));
  return f;
}

const MUSTER = '⛔ THE HERALD does not notice you the way prey notices a hunter. '
  + 'It notices you the way weather notices a field. You cannot face this alone '
  + '— sound the call, muster 10 allied blades (you have 0). This is not courage. '
  + 'This is arithmetic.';
const SOUNDING = '📯 THE CALL GOES OUT — THE HERALD must fall, and no one fire can do it.';
const PROMPT = 'Still short — but the gap is closing. Sound the call, and send Haven\u2019s own.';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'titanmuster-test-'));

// 1. have/need extraction from the spoken line.
check('have/need extracted from the muster line', () => {
  const f = seedFile(tmp, 1, [{
    seq: 0, day: 10, mid: 'herald', isTitan: true, titanLineFired: true,
    fate: 'still-waiting-at-end', fateDetail: 'tagged monster still tracked at end of run',
    linesDuringCall: [{ via: 'say', line: MUSTER }], contextLines: [],
  }], [{ day: 10, livingCount: 9 }]);
  const out = analyzeFile(f);
  assert.strictEqual(out.titanRefusals, 1);
  assert.strictEqual(out.titanClassified, 1);
  assert.strictEqual(out.titanUnclassified, 0);
  assert.deepStrictEqual(out.haveValues, [0]);
  assert.deepStrictEqual(out.needValues, [10]);
  assert.strictEqual(out.musterLines.length, 1);
});

// 2. Same-day inheritance: repeat refusal carries no line, same titan-day does.
check('same-day repeat inherits have/need from the firing refusal', () => {
  const f = seedFile(tmp, 2, [
    {
      seq: 0, day: 20, mid: 'herald', isTitan: true, titanLineFired: true,
      fate: 'still-waiting-at-end', fateDetail: 'x',
      linesDuringCall: [{ via: 'say', line: MUSTER }], contextLines: [],
    },
    {
      seq: 1, day: 20, mid: 'herald', isTitan: true, titanLineFired: false,
      fate: 'still-waiting-at-end', fateDetail: 'x',
      linesDuringCall: [{ via: 'say', line: 'Victor watches, jaw tight.' }], contextLines: [],
    },
    {
      seq: 2, day: 21, mid: 'herald', isTitan: true, titanLineFired: false,
      fate: 'still-waiting-at-end', fateDetail: 'x',
      linesDuringCall: [{ via: 'say', line: 'Victor watches, jaw tight.' }], contextLines: [],
    },
  ], [{ day: 20, livingCount: 8 }, { day: 21, livingCount: 8 }]);
  const out = analyzeFile(f);
  assert.strictEqual(out.titanRefusals, 3);
  assert.strictEqual(out.titanClassified, 2);
  assert.strictEqual(out.titanUnclassified, 1);
  assert.strictEqual(out.inheritedCount, 1);
  assert.strictEqual(out.parseErrors.length, 1);
  assert.strictEqual(out.parseErrors[0].day, 21);
});

// 3. Sounding vs prompt: only the real call counts as a sounding.
check('real sounding counted, dawn prompt not counted', () => {
  const f = seedFile(tmp, 3, [{
    seq: 0, day: 30, mid: 'herald', isTitan: true, titanLineFired: true,
    fate: 'killed-field', fateDetail: 'x',
    linesDuringCall: [{ via: 'say', line: SOUNDING }], contextLines: [],
  }], [{ day: 30, livingCount: 7 }]);
  const out = analyzeFile(f);
  assert.strictEqual(out.callSoundings.length, 1);
  assert.strictEqual(out.callSoundings[0].day, 30);
  // The prompt line lives in a non-refusal string; count it via a second file.
  const f2 = seedFile(tmp, 4, [], [{ day: 31, livingCount: 7 }]);
  const doc = JSON.parse(fs.readFileSync(f2, 'utf8'));
  doc.saySample = [PROMPT];
  fs.writeFileSync(f2, JSON.stringify(doc));
  const out2 = analyzeFile(f2);
  assert.strictEqual(out2.promptLines, 1);
  assert.strictEqual(out2.callSoundings.length, 0);
});

// 4. Non-titan refusals are ignored.
check('non-titan refusals do not enter the census', () => {
  const f = seedFile(tmp, 5, [{
    seq: 0, day: 40, mid: 'audit', wave: 4, isTitan: false,
    fate: 'still-waiting-at-end', fateDetail: 'x',
    linesDuringCall: [{ via: 'say', line: MUSTER }], contextLines: [],
  }], []);
  const out = analyzeFile(f);
  assert.strictEqual(out.titanRefusals, 0);
  assert.strictEqual(out.titanClassified, 0);
  // The muster line still appears in the wide sweep (extra census).
  assert.strictEqual(out._extraMusterLines, 1);
  assert.deepStrictEqual(out._extraHave, { 0: 1 });
});

// 5. Determinism on the real corpus: two runs, byte-identical output.
check('real corpus deterministic across two runs', () => {
  const script = path.join(__dirname, 'analyze-titanmuster-b.js');
  const a = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  const b = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  assert.strictEqual(a, b);
  const sum = JSON.parse(a);
  assert.strictEqual(sum.seeds, 16);
  assert.strictEqual(sum.titanRefusals, 76);
  assert.strictEqual(sum.titanClassified, 76);
  assert.strictEqual(sum.maxHave, 0);
  assert.strictEqual(sum.callSoundings, 0);
});

// 6. Real-corpus bar check: the frozen prereg numbers reproduce.
check('real corpus reproduces the prereg census numbers', () => {
  const script = path.join(__dirname, 'analyze-titanmuster-b.js');
  const sum = JSON.parse(execFileSync(process.execPath, [script], { encoding: 'utf8' }));
  assert.strictEqual(sum.musterLineOccurrences, 83);
  assert.deepStrictEqual(sum.haveDistribution, { 0: 76 });
  assert.deepStrictEqual(sum.needDistribution, { 10: 76 });
  assert.deepStrictEqual(sum.fates, { 'killed-field': 28, 'still-waiting-at-end': 48 });
  assert.strictEqual(sum.parseErrors.length, 0);
});

console.log('test-titanmuster-b: ' + pass + '/6 PASS');
