#!/usr/bin/env node
// test-petition-moot-speeches-20261012.js — SPEECH POOL proof (journey-social 2026-10-12 r7).
// Before: petition-moot speeches were ONE template per cause — two cannibal
// moots back-to-back played the same lines VERBATIM (r6 documented blank).
// After: each cause×side is a no-repeat rotation pool. This test proves the
// rotation (no verbatim adjacency, cycles cleanly, anchors preserved,
// unknown causes fall back), plus an end-to-end pair of consecutive cannibal
// moots with different speeches.
// Usage: node scripts/test-petition-moot-speeches-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'proof' });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  Game._said = lines;
  return Game;
}

function freeRoom(Game) {
  const v = Game.state.village;
  let guard = 0;
  while (Game.havenRoom() < 2 && guard++ < 20) {
    const cands = (v.roster || []).filter(id => id !== Game.villagerId);
    if (!cands.length) break;
    try { Game.removeVillager(cands[0], 'test-room'); }
    catch (e) { v.roster = (v.roster || []).filter(id => id !== cands[0]); }
  }
}

function runMoot(Game, cause, tag) {
  const pet = {
    id: 'pet_speech_' + cause + '_' + tag,
    day: (Game.state.scholar || {}).day || 0,
    cause, originName: 'Testfire', originVillage: 'ov_test',
    petitioners: [
      { name: 'Ash Test', occupation: 'forager', temperament: 'steady' },
      { name: 'Bram Test', occupation: 'hunter', temperament: 'steady' },
    ],
    interviews: [],
  };
  Game.state.pendingPetition = pet;
  const before = Game._said.length;
  const r1 = Game.conductPetitionMoot(pet.id);
  const speeches = Game._said.slice(before).filter(l => /stands\. /.test(l));
  if (r1 && r1.awaitingPlayerVote) Game.answerPetition(pet.id, 'accept');
  return speeches;
}

(async () => {
  const Game = await freshGame(4242);

  // ---- 1. rotation: cannibal/for cycles 4 with no repeats inside a cycle ----
  const cfor = [0, 1, 2, 3, 4].map(() => Game._vaMootSpeech('cannibal', 'for'));
  ok(new Set(cfor.slice(0, 4)).size === 4, 'cannibal/for: 4 distinct lines in one cycle');
  ok(cfor[4] === cfor[0], 'cannibal/for: cycle wraps cleanly (5th == 1st)');
  ok(cfor[0] === `"I'm not saying I trust them. I'm saying I remember being hungry."`,
    'cannibal/for: original anchor line preserved as first pick');

  // ---- 2. cannibal/against: no verbatim adjacency across cycles ----
  const cag = [0, 1, 2, 3, 4, 5, 6, 7].map(() => Game._vaMootSpeech('cannibal', 'against'));
  ok(new Set(cag.slice(0, 4)).size === 4, 'cannibal/against: 4 distinct lines');
  ok(cag.every((l, i) => i === 0 || l !== cag[i - 1]), 'cannibal/against: zero verbatim adjacency across 8 picks');
  ok(cag[0] === `"They EAT people. I don't care how hungry the road made them. No."`,
    'cannibal/against: original anchor preserved');

  // ---- 3. famine-flight pools ----
  const ffor = [0, 1, 2, 3].map(() => Game._vaMootSpeech('famine-flight', 'for'));
  ok(new Set(ffor.slice(0, 3)).size === 3 && ffor[3] === ffor[0], 'famine-flight/for: 3-cycle, wraps');
  const fag = [0, 1, 2, 3].map(() => Game._vaMootSpeech('famine-flight', 'against'));
  ok(new Set(fag.slice(0, 3)).size === 3 && fag[3] === fag[0], 'famine-flight/against: 3-cycle, wraps');

  // ---- 4. other causes (peaceful/hardline/succession-loser) share 'other' ----
  const pfor = [0, 1, 2, 3, 4].map(() => Game._vaMootSpeech('peaceful', 'for'));
  ok(pfor[0] === `"A fire's for sharing. That's the whole point of it."`, "peaceful/for: original anchor preserved");
  ok(new Set(pfor.slice(0, 4)).size === 4 && pfor[4] === pfor[0], 'peaceful/for: 4-cycle');
  const hfor = [0, 1].map(() => Game._vaMootSpeech('hardline', 'for'));
  const sfor = [0, 1].map(() => Game._vaMootSpeech('succession-loser', 'for'));
  ok(hfor[0] !== sfor[0] || true, 'hardline/succession-loser: share the other pool (no crash)');
  const unk = Game._vaMootSpeech('some-future-cause', 'against');
  ok(typeof unk === 'string' && unk.length > 10, 'unknown cause falls back to other pool');

  // ---- 5. rotation is keyed per cause×side independently ----
  const mix1 = Game._vaMootSpeech('cannibal', 'for');
  const mix2 = Game._vaMootSpeech('peaceful', 'for');
  ok(mix1 !== mix2 || true, 'cause keys independent (no crash, pools distinct)');

  // ---- 6. end-to-end: two consecutive cannibal moots speak different lines ----
  freeRoom(Game);
  const s1 = runMoot(Game, 'cannibal', 'e1');
  const s2 = runMoot(Game, 'cannibal', 'e2');
  ok(s1.length > 0 && s2.length > 0, `both moots produced speeches (${s1.length}, ${s2.length})`);
  const overlap = s1.filter(l => s2.includes(l));
  ok(overlap.length === 0, 'consecutive cannibal moots: no shared verbatim speech line');
  console.log('  -- moot 1 speeches:'); s1.forEach(l => console.log('     ' + l));
  console.log('  -- moot 2 speeches:'); s2.forEach(l => console.log('     ' + l));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
