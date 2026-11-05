// test-journey-deepening-r105-pkeep-metric-20261105.js -- proof test for the
// R105 P-KEEP metric revision (analyzer only, zero game code).
// The r104 metric review showed the r100 regex missed the fix's own stale-
// opener lines (Ruth's day-80 repay sitting scored SILENT while the
// transcript named the promise). R105 widens the regex to the stale-opener
// vocabulary AND counts a later sitting whose `want: ` line is `repay` as
// NAMED-STRUCTURAL. This test proves the revised classifier on synthetic
// transcripts (no dependence on panel files):
//   1. Ruth's stale-broken opener is NAMED by the revised regex, missed by the old.
//   2. All six stale-opener wordings the old regex missed now match the revised one.
//   3. A repay sitting with no regex words at all is NAMED-STRUCTURAL.
//   4. A seek_taken-style re-presentation with no regex words stays SILENT.
//   5. DEAD / NO-LATER-SITTING classification is unchanged.
// Run: node scripts/test-journey-deepening-r105-pkeep-metric-20261105.js
'use strict';
const assert = require('assert');
const { scanPromiseTranscript, classifyPromiseThreads } = require('./analyze-journey-deepening-r105-20261105.js');

let pass = 0;
function check(name, fn) { fn(); pass++; console.log('ok - ' + name); }

function sitting(wantLine, themLines, wantFinal) {
  const lines = [wantLine].concat(themLines.map(t => 'THEM: ' + t));
  if (wantFinal) lines.push('want final: id=' + wantFinal.id + ' stage=3 resolution=' + wantFinal.resolution);
  return lines.join('\n') + '\n';
}
function promisedDay(vid, day) {
  return { seed: '99999', day, vid, text: sitting('want: ask_favor (stage 1)', ['"Please — food to spare?"'], { id: 'ask_favor', resolution: 'promised' }) };
}

// 1. Ruth's stale-broken opener (real line from r104, seed 92102 day 80).
check('ruth stale-broken opener is NAMED (revised) and missed by old regex', () => {
  const t1 = promisedDay('ruth', 45);
  const t2 = { seed: '99999', day: 80, vid: 'ruth', text: sitting('want: repay (stage 1)',
    ['"About the pantry run — I keep turning it over. It\'s done now, but I haven\'t forgotten it."'],
    { id: 'repay', resolution: 'deflected' }) };
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th.length, 1);
  assert.strictEqual(th[0].cls, 'NAMED');
  assert.strictEqual(th[0].oldNamed, false);
  assert.ok(th[0].evidence.line.includes('turning it over'));
});

// 2. The six stale-opener wordings the old regex missed.
const STALE_LINES = [
  '"About the creek run — it\'s still on my mind."',
  '"About the pantry run — I keep coming back to it."',
  '"I keep thinking about what you did."',
  '"About the pantry run — I keep turning it over."',
  '"It\'s done now, but I haven\'t forgotten it."',
  '"About the food run — have you had a chance?"',
];
for (const line of STALE_LINES) {
  check('stale wording matches revised regex: ' + line.slice(0, 44), () => {
    const t1 = promisedDay('v', 45);
    const t2 = { seed: '99999', day: 60, vid: 'v', text: sitting('want: ask_favor (stage 1)', [line], { id: 'ask_favor', resolution: 'stated' }) };
    const th = classifyPromiseThreads([t1, t2], []);
    assert.strictEqual(th[0].cls, 'NAMED');
    assert.strictEqual(th[0].oldNamed, false);
  });
}

// 3. Structural: repay sitting, zero regex words anywhere.
check('repay sitting with no regex words is NAMED-STRUCTURAL', () => {
  const t1 = promisedDay('v1', 45);
  const t2 = { seed: '99999', day: 60, vid: 'v1', text: sitting('want: repay (stage 1)',
    ['"About the creek run."', '"The buckets are still by the door."'],
    { id: 'repay', resolution: 'deflected' }) };
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED-STRUCTURAL');
  assert.strictEqual(th[0].oldNamed, false);
  assert.strictEqual(th[0].evidence.wantLine, 'want: repay (stage 1)');
});

// 4. seek_taken-style re-presentation, no regex words, no repay sitting -> SILENT.
check('seek_taken re-presentation without regex words stays SILENT', () => {
  const t1 = { seed: '99999', day: 45, vid: 'tanya', text: sitting('want: ask_favor (stage 1)', ['"Help?"'], { id: 'seek_taken', resolution: 'promised' }) };
  const t2 = { seed: '99999', day: 60, vid: 'tanya', text: sitting('want: ask_favor (stage 0, fromSeed)',
    ['"About what happened to my taken kin — You talk to it -- the System. Have you ever asked?"'],
    { id: 'seek_taken', resolution: 'promised' }) };
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'SILENT');
  assert.strictEqual(th[0].oldNamed, false);
});

// 5. DEAD / NO-LATER-SITTING unchanged.
check('DEAD when the villager dies after the thread day, else NO-LATER-SITTING', () => {
  const t1 = promisedDay('dead1', 45);
  const t2 = promisedDay('alive1', 45);
  const th = classifyPromiseThreads([t1, t2], [{ who: 'dead1', day: 50 }]);
  assert.strictEqual(th.find(t => t.vid === 'dead1').cls, 'DEAD');
  assert.strictEqual(th.find(t => t.vid === 'alive1').cls, 'NO-LATER-SITTING');
});

// 6. Old-regex lines still count as oldNamed (comparability with r103/r104).
check('fresh fulfilled line counts under both regexes', () => {
  const t1 = promisedDay('v2', 45);
  const t2 = { seed: '99999', day: 60, vid: 'v2', text: sitting('want: repay (stage 1)',
    ['"You came through on the food run. I won\'t forget it."'],
    { id: 'repay', resolution: 'deflected' }) };
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED');
  assert.strictEqual(th[0].oldNamed, true);
});

// 7. scanPromiseTranscript captures the sitting want line.
check('scanPromiseTranscript returns wantLine', () => {
  const sc = scanPromiseTranscript(sitting('want: repay (stage 1)', ['"Hi."'], { id: 'repay', resolution: 'deflected' }));
  assert.strictEqual(sc.wantLine, 'want: repay (stage 1)');
  assert.strictEqual(sc.wantFinal.id, 'repay');
});

console.log(`\n${pass} passed`);
