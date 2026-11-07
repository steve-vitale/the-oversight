// Proof test for the r115 Miriam closing-line fix (Q2, pre-registered).
// The defect (r111 first sighting, r113 second: seed 1071 Celestin): a
// wind-down farewell reads "Good. That's settled, then. Onward." while the
// sitting's want is still unresolved — the closer asserts settlement of
// something the game itself says is unfinished.
//
// Mechanism: the goodbye picker (conversation.js ~7079, endConvo path)
// draws an exit line from the speaker's temperament pool in
// characterGen.json (convo.exits) BLIND to thread state — it cannot know
// whether anything was settled. The honest settlement beat already exists
// separately (convoCloseLine, which fires ONLY when a thread was genuinely
// closed this conversation). So no exit-pool line may assert settlement
// at all: any line containing "settled" is a false claim waiting for an
// unresolved sitting to draw it.
//
// Fix: reword the one steady-pool line so it stops asserting settlement
// ("Good talk. Onward, then.") — pool size unchanged, voice kept.
// No canon doc covers farewell-line wording (docs/CANON.md manifest
// checked 2026-11-07); the bar is the SENSE-TESTING LAW — a line must not
// assert a state the game does not hold.
//
// Usage: node scripts/test-landing-r115-miriam-line.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const cg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'));
const wd = ((cg.convo || {}).exits) || {};
assert(Object.keys(wd).length > 0, 'characterGen.json must carry convo.exits pools');
let total = 0;
const settled = [];
for (const [temp, lines] of Object.entries(wd)) {
  assert(Array.isArray(lines), 'winddowns.' + temp + ' must be a line array');
  for (const line of lines) {
    total++;
    if (/settled/i.test(String(line))) settled.push(temp + ': ' + line);
  }
}
console.log('exit pools: ' + Object.keys(wd).length + ' temperaments, ' + total + ' lines, settled-asserting: ' + settled.length);
for (const s of settled) console.log('  SETTLED: ' + s);
assert.strictEqual(settled.length, 0, 'no goodbye line may assert settlement (exit picker is blind to thread state); found: ' + settled.join(' | '));
// The steady pool keeps its 8 lines — the fix rewords, never deletes.
assert.strictEqual((wd.steady || []).length, 8, 'steady exit pool must keep 8 lines');
assert((wd.steady || []).some(l => /Onward/.test(String(l))), 'steady pool keeps an Onward beat');
console.log('test-landing-r115-miriam-line: PASS (' + total + ' exit lines scanned, 0 settled-asserting, steady pool intact at 8)');
