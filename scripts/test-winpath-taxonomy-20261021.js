// test-winpath-taxonomy-20261021.js — proof for scripts/winpath-taxonomy-20261021.js
//
// Usage: node scripts/test-winpath-taxonomy-20261021.js
// (pure JSON analysis — no env gates, no Game load, no RNG.)
//
// RED->GREEN: this test was written BEFORE the instrument existed and run
// against the missing module (RED). It goes GREEN when the instrument
// attributes every forged fixture correctly.

'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MOD = path.join(__dirname, 'winpath-taxonomy-20261021.js');

let T;
try {
  T = require(MOD);
} catch (e) {
  console.error('RED: instrument module missing/unloadable:', e.message);
  process.exit(1);
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', name, extra === undefined ? '' : JSON.stringify(extra)); }
}

// --- forged fixtures: one win record per ladder class ---
const base = (o) => Object.assign({
  corpus: 'fixture', seed: 1, base: 'leadfeast', policy: 'fx',
  won: 1, table: 1, nationalEnd: 1, everNational: 1,
  satShapes: ['lead'], winTrack: { path: 'feared', moral: 'light', track: 'field', seat: null },
  instrumentErrors: [],
}, o);

const fixtures = [
  ['lead',          base({ satShapes: ['lead'] }),                            'lead'],
  ['belong',        base({ satShapes: ['belong'], base: 'belongfeast' }),      'belong'],
  ['covenant',      base({ satShapes: ['covenant'] }),                         'covenant'],
  ['trade',         base({ satShapes: ['trade'] }),                            'trade'],
  ['conquest',      base({ satShapes: ['conquest'] }),                         'conquest'],
  ['refuse',        base({ satShapes: ['refuse'] }),                           'refuse'],
  ['mixed-rungs',   base({ satShapes: ['lead', 'belong'] }),                   'mixed-rungs'],
  ['lead-sat-lost', base({ satShapes: ['lead'], nationalEnd: 0 }),             'lead'],
  ['court-skipped', base({ everNational: 0, nationalEnd: 0, satShapes: [] }), 'court-skipped'],
  ['held-national', base({ everNational: null, nationalEnd: 1, satShapes: [] }), 'held-national'],
  ['unheld-national', base({ everNational: null, nationalEnd: 0, satShapes: [] }), 'unheld-national'],
  ['unwon',         base({ won: 0, table: 1 }),                                'unwon'],
  ['no-table',      base({ won: 0, table: 0 }),                                'no-table'],
];

for (const [name, rec, want] of fixtures) {
  let r;
  try { r = T.classifyWin(rec); }
  catch (e) { check('fixture ' + name + ' threw', false, String(e && e.message || e)); continue; }
  check('fixture ' + name + ' class', r && r.class === want, r);
  check('fixture ' + name + ' has honest reason', !!(r && r.reason), r);
}

// sat-lost honesty: lead fixture with nationalEnd 0 must note the loss
{
  const r = T.classifyWin(base({ satShapes: ['lead'], nationalEnd: 0 }));
  check('sat-lost flagged heldAtWin=false', r.heldAtWin === false, r);
}

// court-skipped must say so plainly in the reason
{
  const r = T.classifyWin(base({ everNational: 0, nationalEnd: 0, satShapes: [] }));
  check('court-skipped reason names the skipped court', /never sat|court/i.test(r.reason || ''), r);
}

// held/unheld-national must carry the ever-unknown honesty note
{
  const r = T.classifyWin(base({ everNational: null, nationalEnd: 1, satShapes: [] }));
  check('held-national notes ever-state unrecorded', /ever/i.test(r.reason || ''), r);
  const r2 = T.classifyWin(base({ everNational: null, nationalEnd: 0, satShapes: [] }));
  check('unheld-national notes ambiguity', /ambiguous|cannot distinguish/i.test(r2.reason || ''), r2);
}

// --- the forged unattributable record: honest unexplained ---
{
  const rec = {
    corpus: 'fixture', seed: 999, base: 'leadfeast', policy: 'fx',
    won: 1, table: 1, nationalEnd: null, everNational: null,
    satShapes: [], winTrack: null, instrumentErrors: [],
  };
  const r = T.classifyWin(rec);
  check('unattributable lands in unexplained', r && r.class === 'unexplained', r);
  check('unexplained carries the honest reason', !!(r && /no national-state evidence/i.test(r.reason || '')), r);
}

// --- contradictory evidence also lands unexplained, with reason ---
{
  const r = T.classifyWin(base({ everNational: 1, satShapes: [], nationalEnd: 1 }));
  check('ever-sat with no rung shape is unexplained', r && r.class === 'unexplained', r);
}
{
  const r = T.classifyWin(base({ won: 1, table: 0 }));
  check('won-without-table is unexplained', r && r.class === 'unexplained', r);
}

// --- determinism: same input, same output ---
{
  const rec = base({ satShapes: ['belong'], base: 'belongfeast' });
  const a = JSON.stringify(T.classifyWin(rec));
  const b = JSON.stringify(T.classifyWin(rec));
  check('deterministic', a === b, null);
}

// --- taxonomy vocabulary is exactly the brief's ---
{
  const want = ['lead', 'belong', 'covenant', 'trade', 'conquest', 'refuse',
    'mixed-rungs', 'court-skipped', 'held-national', 'unheld-national',
    'unwon', 'no-table', 'unexplained'];
  const have = (T.TAXONOMY && T.TAXONOMY.classes) || [];
  check('class vocabulary matches brief', want.every(c => have.includes(c)) && have.length === want.length, have);
}

// --- read-only static scan: no RNG, no Game writes ---
{
  const src = fs.readFileSync(MOD, 'utf8');
  const bad = [];
  if (/Math\.random\s*\(/.test(src)) bad.push('Math.random(');
  if (/\bR\s*\(/.test(src)) bad.push('R(');
  if (/Game\.(state|save)/.test(src)) bad.push('Game.state/save');
  check('instrument is read-only/pure', bad.length === 0, bad);
}

console.log(`\nwinpath-taxonomy proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
