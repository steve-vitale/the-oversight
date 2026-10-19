#!/usr/bin/env node
// test-petition-moot-afterlife-20261012.js — TRUST r6 proof (2026-10-12).
// Lever: petition-moot social afterlife (villageAgency.js + convo-scene.js).
// Before this change, a concluded petition moot left ZERO social traces:
// no voter memories (unlike the justice moot's moot_vote), no gossip for
// non-cannibal outcomes, no conversation label — the village talked about
// nothing the day after. This test proves the afterlife exists and is
// canon-honest (gossip moves REP only, never trust).
//
// RED check: on pristine code (stash the lever), every "afterlife" assertion
// fails: no petition_moot memories, no took_in_hungry gossip, no MEM_LABELS
// entry. On lever code, all green.
//
// Usage: SEED=7 node scripts/test-petition-moot-afterlife-20261012.js
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');

for (const f of ['src/js/villageAgency.js', 'src/js/convo-scene.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(__dirname, '..', f)], { stdio: 'pipe' }); }
  catch (e) { console.log('FAIL syntax ' + f); process.exit(1); }
}
console.log('PASS syntax (villageAgency.js, convo-scene.js)');

const { loadGame, setupGame } = require('./sim-harness');

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  Game._said = lines;
  return Game;
}

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

// runMoot: seed a synthetic pendingPetition, conduct the real moot, vote.
// Ensures haven room first (the moot honestly refuses when full). Returns
// { pet, verdict } where verdict is the room's actual decision.
function runMoot(Game, cause, playerVote, tag) {
  const v = Game.state.village;
  // free room: remove villagers until havenRoom() >= 2
  let guard = 0;
  while (Game.havenRoom() < 2 && guard++ < 20) {
    const cands = (v.roster || []).filter(id => id !== Game.villagerId);
    if (!cands.length) break;
    try { Game.removeVillager(cands[0], 'test-room'); }
    catch (e) { v.roster = (v.roster || []).filter(id => id !== cands[0]); }
  }
  const pet = {
    id: 'pet_test_' + cause + '_' + tag,
    day: (Game.state.scholar || {}).day || 0,
    cause, originName: 'Testfire', originVillage: 'ov_test',
    petitioners: [
      { name: 'Ash Test', occupation: 'forager', temperament: 'steady' },
      { name: 'Bram Test', occupation: 'hunter', temperament: 'steady' },
    ],
    interviews: [],
  };
  Game.state.pendingPetition = pet;
  const r1 = Game.conductPetitionMoot(pet.id);
  ok(!!(r1 && (r1.awaitingPlayerVote || r1.accepted !== undefined)), `moot conducts (${cause}, ${playerVote})`);
  if (!pet.vote) return { pet, verdict: null }; // no room — honest refusal
  const r2 = Game.answerPetition(pet.id, playerVote);
  return { pet, verdict: !!(r2 && r2.accepted) };
}

function countMootMems(Game) {
  const v = Game.state.village || {};
  let n = 0; const notes = [];
  for (const id of Object.keys(v.memory || {})) {
    for (const m of (v.memory[id] || [])) {
      if (m && m.t === 'petition_moot') { n++; notes.push(m.note); }
    }
  }
  return { n, notes };
}

(async () => {
  const seed = parseInt(process.env.SEED || '7', 10);
  const Game = await freshGame(seed);
  const v = Game.state.village;
  // make haven room: the moot refuses when every bed is full (honest).
  // Remove two villagers so the moot can be called.
  const roster0 = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(roster0.length >= 3, `roster has voters (n=${roster0.length})`);
  for (const rid of roster0.slice(0, 2)) {
    try { Game.removeVillager(rid, 'test-room'); } catch (e) {
      v.roster = (v.roster || []).filter(id => id !== rid);
    }
  }
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(Game.havenRoom() >= 2, `haven has room for the moot (room=${Game.havenRoom()})`);

  // ---- 1. MEM_LABELS carries the new memory type
  ok(typeof Game.convoMemoryAbout === 'function' &&
     Game.convoMemoryAbout('petition_moot') === 'the moot over the petitioners',
    "MEM_LABELS['petition_moot'] = 'the moot over the petitioners'");

  // ---- 2. moot with a verdict: voter memories + verdict-matching gossip.
  // The player votes accept, but the ROOM decides — gossip follows the
  // verdict, not the player's ballot (design: the moot is the village's).
  const gossipBefore = (v.gossip || []).length;
  const m1 = runMoot(Game, 'famine-flight', 'accept', 'a1');
  if (m1.verdict === null) { console.log('  SKIP - no room for famine-flight moot'); }
  else {
    ok(m1.pet.vote && Array.isArray(m1.pet.vote.votes) && m1.pet.vote.votes.length > 0,
      'vote recorded on petition');
    const mc = countMootMems(Game);
    ok(mc.n >= m1.pet.vote.votes.length,
      `every voter remembers the moot (${mc.n} mems, ${m1.pet.vote.votes.length} voters)`);
    ok(mc.notes.every(n => /voted to (take them in|turn them away) — the moot (took them in|turned them away)/.test(n || '')),
      'memory notes name vote + outcome honestly');
    const newGossip1 = (v.gossip || []).slice(gossipBefore);
    const wantAction = m1.verdict ? 'took_in_hungry' : 'turned_away_hungry';
    ok(newGossip1.some(g => g.action === wantAction),
      `verdict-matching gossip seeded (${wantAction}; verdict=${m1.verdict ? 'accept' : 'reject'})`);
    ok(newGossip1.every(g => !g.dims || g.dims.trust === undefined),
      'moot gossip carries no trust dim (rep only, canon)');
  }

  // ---- 3. second moot, different cause: peaceful. Memories accumulate,
  // gossip matches the new verdict.
  const gossipBefore2 = (v.gossip || []).length;
  const m2 = runMoot(Game, 'peaceful', 'reject', 'r1');
  if (m2.verdict === null) { console.log('  SKIP - no room for peaceful moot'); }
  else {
    const newGossip2 = (v.gossip || []).slice(gossipBefore2);
    const want2 = m2.verdict ? 'sheltered_peacemakers' : 'turned_away_peacemakers';
    ok(newGossip2.some(g => g.action === want2),
      `verdict-matching gossip seeded (${want2}; verdict=${m2.verdict ? 'accept' : 'reject'})`);
    const mc2 = countMootMems(Game);
    const wantNote = m2.verdict ? 'the moot took them in' : 'the moot turned them away';
    ok(mc2.notes.some(n => (n || '').indexOf(wantNote) >= 0),
      `verdict recorded in voter memories ("${wantNote}")`);
  }

  // ---- 4. 'waited' walk (no moot): NO moot gossip, NO memories — it was
  // never the village's decision
  const gossipBefore3 = (v.gossip || []).length;
  const memBefore3 = countMootMems(Game).n;
  const petW = {
    id: 'pet_test_waited', day: ((Game.state.scholar || {}).day || 0) - 5,
    cause: 'famine-flight', originName: 'Walkfire', originVillage: 'ov_walk',
    petitioners: [{ name: 'Cal Test', occupation: 'forager', temperament: 'steady' }],
    interviews: [],
  };
  Game._vaTurnAway(petW, 'waited');
  const newGossip3 = (v.gossip || []).slice(gossipBefore3);
  ok(!newGossip3.some(g => /took_in|turned_away/.test(g.action || '')),
    'no moot-outcome gossip for an unanswered (walked) petition');
  ok(countMootMems(Game).n === memBefore3,
    'no petition_moot memories for an unanswered petition');

  // ---- 5. cannibal moot: harbor_cannibals still seeded on accept verdict
  // (pre-existing path preserved); refused_eaters on reject verdict.
  const gossipBefore4 = (v.gossip || []).length;
  const m4 = runMoot(Game, 'cannibal', 'accept', 'c1');
  if (m4.verdict === null) { console.log('  SKIP - no room for cannibal moot'); }
  else {
    const newGossip4 = (v.gossip || []).slice(gossipBefore4);
    const want4 = m4.verdict ? 'harbor_cannibals' : 'refused_eaters';
    ok(newGossip4.some(g => g.action === want4),
      `cannibal moot gossip seeded (${want4}; verdict=${m4.verdict ? 'accept' : 'reject'})`);
  }

  // ---- 6. an accepted moot admits petitioners to the roster (pre-existing):
  // admitted ids are 'ptn_'-prefixed.
  const ptnIds = (v.roster || []).filter(id => String(id).indexOf('ptn_') === 0);
  const anyAccept = [m1.verdict, m2.verdict, m4.verdict].some(x => x === true);
  ok(!anyAccept || ptnIds.length > 0,
    `accepted moots admit petitioners (${ptnIds.length} ptn_ ids on roster)`);

  console.log(`\n${pass} passed, ${fail} failed (seed ${seed})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
