#!/usr/bin/env node
// Proof test: mood-beat stage-direction pools are wide enough that a player
// reading many transcripts doesn't feel the template.
// journey scale r4 2026-10-12 — the three single-entry pools
// (up:neutral, down:friendly, down:neutral) repeated the same line for every
// NPC; they are widened to 3 variants each in convo-mood.js.
// RED on pristine master (each returns 1 distinct line), GREEN after.
// Usage: node scripts/test-moodbeat-pools-20261012.js [path-to-convo-mood.js]
const fs = require('fs');
const path = require('path');
const TARGET = process.argv[2] || path.join(__dirname, '..', 'src', 'js', 'convo-mood.js');

// Stub Game: convoPickCycle cycles per key (mirrors the real per-vid cycle).
// convo-mood.js self-attaches via (globalThis.Scattering || {}).Game.
const counters = {};
globalThis.Scattering = {
  Game: {
    convoGet: () => ({}),
    convoPickCycle: (vid, key, pool) => {
      const i = counters[key] || 0;
      counters[key] = i + 1;
      return pool[i % pool.length];
    },
  },
};
const Game = globalThis.Scattering.Game;
eval(fs.readFileSync(TARGET, 'utf8'));

// (from, to) transitions covering every pool key in convoMoodBeat.
const TRANSITIONS = {
  'up:warm': ['neutral', 'warm'],
  'up:friendly': ['neutral', 'friendly'],
  'up:neutral': ['cool', 'neutral'],
  'down:cool': ['neutral', 'cool'],
  'down:tense': ['neutral', 'tense'],
  'down:friendly': ['warm', 'friendly'],
  'down:neutral': ['friendly', 'neutral'],
};
const WIDENED = ['up:neutral', 'down:friendly', 'down:neutral'];

let failures = 0;
for (const [key, [from, to]] of Object.entries(TRANSITIONS)) {
  const seen = new Set();
  for (let i = 0; i < 12; i++) seen.add(Game.convoMoodBeat('vid' + i, from, to));
  const min = WIDENED.includes(key) ? 3 : 1;
  const ok = seen.size >= min;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${key}: ${seen.size} distinct line(s) (need >= ${min})`);
  if (!ok) failures++;
}
if (failures) {
  console.log(`\n${failures} pool(s) too small — template repetition.`);
  process.exit(1);
}
console.log('\nAll mood-beat pools wide enough.');
