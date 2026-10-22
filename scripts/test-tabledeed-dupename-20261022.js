#!/usr/bin/env node
// test-tabledeed-dupename-20261022.js — journey-endgame r39 (lane B, 2026-10-22).
//
// BLANK (sense-read of evidence/2026-10-22/perseed-endgame-r39/
// endgame-r39-81014-transcript.txt): the seated audit's WAR PATH beat named
// two engagements against the same monster type with the identical sentence
// twice — "They faced Big Loud and lived to sit here. They faced Big Loud
// and lived to sit here." A stutter, not a list.
//
// Proves: (1) two engagements with the same voiced noun now name once with a
// count ("They faced X twice and lived to sit here."); (2) two engagements
// with different nouns keep the old two-sentence voicing byte-identical
// (no regression); (3) a single engagement is unchanged.
//
// Fixtures touch only real stores the engine reads: real monster ids,
// Game.state.systemArrived=true so monsterNoun resolves deterministically to
// the true names (knowledge-gated otherwise), and a stubbed
// tableDeedRecords() returning the record the pure renderer tableDeedLines()
// reads. Voicing only — pricing untouched.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('tabledeed-dupename');

function warPathLine(Game, engagements) {
  const real = Game.tableDeedRecords;
  Game.tableDeedRecords = () => ({ kills: [], engagements, titans: [], bars: [] });
  let lines;
  try { lines = Game.tableDeedLines(); }
  finally { Game.tableDeedRecords = real; }
  T.ok('setup: one WAR PATH line voiced', Array.isArray(lines) && lines.length === 1, (lines || []).length + ' lines');
  return (lines || []).join('\n');
}

(async () => {
  const Game = await K.load({ seed: 81014 });
  K.newRun(Game);
  Game.state.systemArrived = true;   // monsterNoun -> true names, deterministic
  const ids = (Game.data.monsters || []).map(m => m.id).filter(Boolean);
  T.ok('setup: monster roster present', ids.length >= 2, ids.length + ' ids');
  const A = ids[0], B = ids.find(id => Game.monsterNoun(id) !== Game.monsterNoun(A));
  T.ok('setup: two distinct-voiced monsters', !!B, A + ' vs ' + B);

  // 1. same noun twice -> one naming with a count
  const dup = warPathLine(Game, [{ mid: A }, { mid: A }]);
  const noun = Game.monsterNoun(A);
  T.ok('dup: names once with "twice"', dup.indexOf(`They faced ${noun} twice and lived to sit here.`) >= 0, dup.slice(0, 160));
  const dupSentences = (dup.match(/lived to sit here\./g) || []).length;
  T.ok('dup: no repeated sentence', dupSentences === 1, dupSentences + ' occurrences');

  // 2. different nouns -> old two-sentence voicing, byte-identical shape
  const two = warPathLine(Game, [{ mid: A }, { mid: B }]);
  const nounB = Game.monsterNoun(B);
  T.ok('pair: first sentence kept', two.indexOf(`They faced ${noun} and lived to sit here.`) >= 0, two.slice(0, 200));
  T.ok('pair: second sentence kept', two.indexOf(`They faced ${nounB} and lived to sit here.`) >= 0, two.slice(0, 200));
  T.ok('pair: no "twice" in engagement naming', !/They faced .* twice and lived/.test(two), 'clean');

  // 3. single engagement -> unchanged
  const one = warPathLine(Game, [{ mid: A }]);
  T.ok('single: one sentence', (one.match(/lived to sit here\./g) || []).length === 1, one.slice(0, 160));
  T.ok('single: no "twice"', one.indexOf('twice') < 0, 'clean');

  T.done();
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
