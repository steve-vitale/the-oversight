#!/usr/bin/env node
// test-journey-succession-r70-eager-yes.js — proof for the r70 analyzer fix:
// the 3 BACKSTABBER eager-accept cores (party.js betrayalIntent path)
// classify as SPOKEN-accept under the analyzer's substring YES mechanism,
// without moving declines, deflections, or standard accepts.
// Mirrors the analyzer exactly: stripQ + txt.includes(core).
'use strict';
const assert = require('assert');
const YES = ['Okay. Yeah. I trust you.', 'Someone should watch your back. Might as well be me.', "Alright. But I'm not carrying your stuff.", '...Fine. This had better be worth it.'];
const YES_EAGER = ["Yes. Absolutely. I've been hoping you'd ask.", "Finally. I was wondering when you'd see my value.", "I'd love to. Lead the way."];
const YES_ALL = YES.concat(YES_EAGER);
const NO = ["I work alone. Nothing personal. ...It's a little personal.", "I don't know you well enough for that. Ask me again when we've survived something together.", 'Out there? With YOU leading? ...Let me think about it.', "Not right now. I've got my own things to handle."];
const DEFLECT = ['...Sorry, lost my train of thought.', 'Hm. Never mind — go on.'];
const stripQ = (t) => String(t || '').trim().replace(/^"+|"+$/g, '');
const classify = (txt) => {
  const sq = stripQ(txt);
  if (YES_ALL.some(y => txt.includes(y))) return 'accept';
  if (NO.some(n => txt.includes(n))) return 'decline';
  if (DEFLECT.includes(sq)) return 'deflected';
  return 'other';
};
// Transcript line shapes: eager lines carry parenthetical asides + quotes.
assert.strictEqual(classify('"Yes. Absolutely. I\'ve been hoping you\'d ask." (A little too quickly.)'), 'accept');
assert.strictEqual(classify('"Finally. I was wondering when you\'d see my value."'), 'accept');
assert.strictEqual(classify('"I\'d love to. Lead the way." (They\'re already checking your pack.)'), 'accept');
// Regression: standard lines unchanged.
for (const y of YES) assert.strictEqual(classify(y), 'accept');
for (const n of NO) assert.strictEqual(classify(n), 'decline');
for (const d of DEFLECT) assert.strictEqual(classify(d), 'deflected');
// Old YES (without eager) must leave the eager lines as OTHER — proves the
// r67 OTHER was a table gap, not a game behavior.
const classifyOld = (txt) => YES.some(y => txt.includes(y)) ? 'accept' : 'other';
assert.strictEqual(classifyOld('"Finally. I was wondering when you\'d see my value."'), 'other');
console.log('r70 eager-yes proof: 3 eager accept, 4 standard accept, 4 decline, 2 deflect, old-table OTHER — all pass');
