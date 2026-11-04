'use strict';
// test-hurthome-a.js — proof for the sim-hurthome-a instrument (prereg).
// Fixture/state tests on scripts/hurthome-a-lib.js, the same code the
// sweep judges by. Zero game change, zero RNG reads in the lib.
// Usage: node scripts/test-hurthome-a.js
const assert = require('assert');
const lib = require('./hurthome-a-lib');

let pass = 0;
function check(name, fn) {
  fn();
  pass += 1;
  console.log('ok - ' + name);
}

const AW = (sinceDay, sincePart, purpose, duration) => ({ sinceDay, sincePart, purpose, duration });

// (a) Classifier: exhaustive and exclusive.
check('classifier same-day', () => {
  assert.strictEqual(lib.classifyEpisode({ outcome: 'returned', returnDay: 10, episodeDay: 10 }), 'turn-home-same-day');
});
check('classifier next-day', () => {
  assert.strictEqual(lib.classifyEpisode({ outcome: 'returned', returnDay: 11, episodeDay: 10 }), 'turn-home-next-day');
});
check('classifier later-return is stayed-out-3plus', () => {
  assert.strictEqual(lib.classifyEpisode({ outcome: 'returned', returnDay: 12, episodeDay: 10 }), 'stayed-out-3plus');
  assert.strictEqual(lib.classifyEpisode({ outcome: 'returned', returnDay: 20, episodeDay: 10 }), 'stayed-out-3plus');
});
check('classifier died-away beats a same-part return', () => {
  // expedDeath deletes v.away in the same call as registerDeath: an
  // episode marked died must never re-read as returned.
  assert.strictEqual(lib.classifyEpisode({ outcome: 'died', returnDay: 10, episodeDay: 10 }), 'died-away');
});
check('classifier censored-stayed is stayed-out-3plus', () => {
  assert.strictEqual(lib.classifyEpisode({ outcome: 'censored', episodeDay: 10, dawnsObserved: 3 }), 'stayed-out-3plus');
  assert.strictEqual(lib.classifyEpisode({ outcome: 'censored', episodeDay: 10, dawnsObserved: 5 }), 'stayed-out-3plus');
});
check('classifier censored-early is the only remainder', () => {
  assert.strictEqual(lib.classifyEpisode({ outcome: 'censored', episodeDay: 10, dawnsObserved: 1 }), 'censored-early');
  assert.strictEqual(lib.classifyEpisode({ outcome: 'censored', episodeDay: 10, dawnsObserved: 2 }), 'censored-early');
  assert.strictEqual(lib.classifyEpisode({ outcome: 'open', episodeDay: 10, dawnsObserved: 1 }), 'censored-early');
});
check('classifier covers a synthetic stream with no unclassified', () => {
  const eps = [
    { outcome: 'returned', returnDay: 5, episodeDay: 5 },
    { outcome: 'returned', returnDay: 6, episodeDay: 5 },
    { outcome: 'returned', returnDay: 8, episodeDay: 5 },
    { outcome: 'died', episodeDay: 5 },
    { outcome: 'censored', episodeDay: 5, dawnsObserved: 4 },
    { outcome: 'censored', episodeDay: 5, dawnsObserved: 1 },
  ];
  const got = eps.map((e) => lib.classifyEpisode(e));
  assert.deepStrictEqual(got, ['turn-home-same-day', 'turn-home-next-day', 'stayed-out-3plus', 'died-away', 'stayed-out-3plus', 'censored-early']);
});

// (b) Dawn sampler: one episode per trip; heal + rehurt extends.
check('dawn opens exactly one episode per trip', () => {
  const open = new Map();
  const r1 = lib.dawnStep(open, 'v1', 20, AW(18, 0, 'forage', 8), 6, {});
  assert.strictEqual(r1.action, 'opened');
  const r2 = lib.dawnStep(open, 'v1', 21, AW(18, 0, 'forage', 8), 5, {});
  assert.strictEqual(r2.action, 'extended');
  assert.strictEqual(r2.episode, r1.episode);
  assert.strictEqual(open.size, 1);
  assert.strictEqual(r2.episode.dawnsObserved, 2);
  assert.strictEqual(r2.episode.hurtDawns, 2);
});
check('dawn heal then rehurt on same trip extends, never re-opens', () => {
  const open = new Map();
  lib.dawnStep(open, 'v1', 20, AW(18, 0, 'expedition', 12), 7, {});
  const r = lib.dawnStep(open, 'v1', 21, AW(18, 0, 'expedition', 12), 40, {});
  assert.strictEqual(r.action, 'extended');
  assert.strictEqual(r.episode.healedDawns, 1);
  const r2 = lib.dawnStep(open, 'v1', 22, AW(18, 0, 'expedition', 12), 4, {});
  assert.strictEqual(r2.action, 'extended');
  assert.strictEqual(open.size, 1);
  assert.strictEqual(r2.episode.hurtDawns, 2);
});
check('dawn ignores healthy away villagers (no episode)', () => {
  const open = new Map();
  assert.strictEqual(lib.dawnStep(open, 'v1', 20, AW(18, 0, 'forage', 8), 8, {}).action, 'none');
  assert.strictEqual(lib.dawnStep(open, 'v1', 20, AW(18, 0, 'forage', 8), 100, {}).action, 'none');
  assert.strictEqual(open.size, 0);
});
check('dawn ignores non-away villagers even at hp <= 7', () => {
  const open = new Map();
  assert.strictEqual(lib.dawnStep(open, 'v1', 20, null, 3, {}).action, 'none');
  assert.strictEqual(open.size, 0);
});
check('new trip after a return opens a new episode', () => {
  const open = new Map();
  const first = lib.dawnStep(open, 'v1', 20, AW(18, 0, 'forage', 8), 6, {}).episode;
  lib.closeReturned(open, 'v1', 21, 1);
  assert.strictEqual(lib.classifyEpisode(first), 'turn-home-next-day');
  const second = lib.dawnStep(open, 'v1', 30, AW(29, 2, 'water', 6), 5, {}).episode;
  assert.notStrictEqual(second, first);
  assert.strictEqual(second.episodeDay, 30);
});
check('hp boundary: 7 opens, 8 does not, 0 is not alive-hurt', () => {
  assert.strictEqual(lib.isHurtHp(7), true);
  assert.strictEqual(lib.isHurtHp(8), false);
  assert.strictEqual(lib.isHurtHp(0), false);
  assert.strictEqual(lib.isHurtHp(1), true);
});

// (c) No RNG reads, no game-value writes (fixture records byte-identical).
check('lib reads no RNG and mutates no away/health record', () => {
  let reads = 0;
  const origRandom = Math.random;
  Math.random = function () { reads += 1; return origRandom(); };
  try {
    const away = AW(18, 0, 'forage', 8);
    const awayBefore = JSON.stringify(away);
    const open = new Map();
    for (let i = 0; i < 5; i++) lib.dawnStep(open, 'v1', 20 + i, away, 6 - (i % 2), {});
    lib.closeReturned(open, 'v1', 25, 2);
    assert.strictEqual(reads, 0);
    assert.strictEqual(JSON.stringify(away), awayBefore);
  } finally {
    Math.random = origRandom;
  }
});
check('closeDied / closeCensored keep episodes classifiable', () => {
  const open = new Map();
  lib.dawnStep(open, 'v1', 20, AW(18, 0, 'forage', 8), 6, {});
  lib.dawnStep(open, 'v2', 20, AW(19, 1, 'visit', 8), 7, {});
  lib.dawnStep(open, 'v2', 21, AW(19, 1, 'visit', 8), 6, {});
  lib.dawnStep(open, 'v2', 22, AW(19, 1, 'visit', 8), 6, {});
  const died = lib.closeDied(open, 'v1', 21, 3, 'monster');
  assert.strictEqual(lib.classifyEpisode(died), 'died-away');
  const rest = lib.closeCensored(open, 22);
  assert.strictEqual(rest.length, 1);
  assert.strictEqual(lib.classifyEpisode(rest[0]), 'stayed-out-3plus');
  assert.strictEqual(open.size, 0);
});

console.log('test-hurthome-a: ' + pass + ' checks green');
