#!/usr/bin/env node
// scripts/test-sim-wave4leth-a-parser.js — proof test for the wave4leth-a
// wrapper parsers (ally end-HP from rec.log, ability-note inventory).
// Pure functions, no harness, no repo writes. Exit 1 on any failure.
'use strict';
const assert = require('assert');
const { allyEndFromLog, abilityNotes } = require('./sim-wave4leth-a-sweep');

// Ally struck twice, ends at 0 -> died.
let r = allyEndFromLog([
  'R1: eater hits Mara for 40 (60 left)',
  'R2: Mara strikes for 12 (800 left)',
  'R3: eater hits Mara for 60 (0 left)',
], 'Mara');
assert.deepStrictEqual(r, { allyHpLeft: 0, allyDied: true }, 'ally killed at 0');

// Ally struck, survives at 25.
r = allyEndFromLog(['R1: eater hits Mara for 40 (25 left)'], 'Mara');
assert.deepStrictEqual(r, { allyHpLeft: 25, allyDied: false }, 'ally survives');

// Ally never struck: nulls, never guessed.
r = allyEndFromLog(['R1: eater hits Joren for 40 (60 left)', 'R2: Mara strikes for 12 (800 left)'], 'Mara');
assert.deepStrictEqual(r, { allyHpLeft: null, allyDied: null }, 'unstruck ally nulls');

// Leader hit lines must not leak into the ally read (leader Joren at 0,
// ally Mara unstruck).
r = allyEndFromLog(['R1: eater hits Joren for 90 (0 left)'], 'Mara');
assert.deepStrictEqual(r, { allyHpLeft: null, allyDied: null }, 'leader line ignored for ally');

// Name with regex chars does not break the matcher.
r = allyEndFromLog(['R1: eater hits Mara (II) for 10 (5 left)'], 'Mara (II)');
assert.deepStrictEqual(r, { allyHpLeft: 5, allyDied: false }, 'regex-char name');

// Ability notes: strike tags counted, HP-left and hit-count parens skipped.
const notes = abilityNotes([
  'R1: Joren strikes for 12 (HAYMAKER x2) (800 left)',
  'R2: Mara strikes again, louder — 6 (790 left). (Live Broadcast)',
  'R3: Joren strikes for 8 (dead aim x2) (780 left)',
  '  loosed — it takes eater for 9 (771 left).',
]);
assert.strictEqual(notes['HAYMAKER x2'], 1, 'haymaker noted');
assert.strictEqual(notes['Live Broadcast'], 1, 'broadcast noted');
assert.strictEqual(notes['dead aim x2'], 1, 'dead aim noted');
assert.strictEqual(notes['800 left'], undefined, 'hp-left paren skipped');
assert.strictEqual(notes['790 left'], undefined, 'hp-left paren skipped 2');

console.log('test-sim-wave4leth-a-parser: 8/8 assertions PASS');
