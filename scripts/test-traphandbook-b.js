#!/usr/bin/env node
// scripts/test-traphandbook-b.js — proof for the day-0 "your old life
// taught you the pit" beat (arm sim-traphandbook-b, loop B food-economy
// axis, run fleshout-loop-b-20261018T1845Z).
//
// The field-shelf WEIGHTING lever (books.json fieldWeight, game.js
// pickFieldBook/trapHandbookOn) was KILLED at pilot 2026-10-18 — engagement
// 2 < 8 (books=0 on all 32 runs; the book channel never fired on this
// substrate). Deleted zero-trace; GATE-1/DIST-1/DIST-2 removed. What remains
// is the proven day-0 beat plus the read/craft engine-path fixtures.
//
// Executes sim-pitknowledge-b's named next #3 (the silent scholar-background
// L3 grant gets a day-0 beat). Named next #2 (Trapper Handbook loot tuning)
// is dead with the lever.
//
// THE BEAT: the pit-background L3 grant (newGame, occ.knowsPit) was a
// silent ledger entry. One say line makes it a learning moment. Fires
// exactly once per run for pit-background scholars, never otherwise,
// never when PITKNOWLEDGE=0.
//
// PART A — fixture (real Game via sim-harness):
//   READ-1: readBook('trappers_handbook') -> pit_trap L3 via grantKnowledge
//           (via 'read', learnedFrom 'Trapper Handbook') — gate never bypassed
//   CRAFT-1 (RED): craft('pit_trap') at L0 -> null + honest refusal (gate kept)
//   BEAT-1 (GREEN): newGame, knowsPit scholar -> beat line exactly once
//   BEAT-2 (RED): newGame, non-pit scholar -> beat absent
// PART B — det-gate: REMOVED with the lever (no gate left to test).
//   Run: node scripts/test-traphandbook-b.js detgate
//   then: TRAPHANDBOOK=0 node scripts/test-traphandbook-b.js detgate
//   and diff the DETGATE lines.
// PART B2 — beat gate-off: PITKNOWLEDGE=0 -> newGame, knowsPit scholar ->
//   no beat, pit_trap stays L0.
//   Run: PITKNOWLEDGE=0 node scripts/test-traphandbook-b.js beatgate
// PART C — smoke: 1 seed x 60d leadtraphandbook, armed: report books read,
//   handbook reads, ruins searched, pit level/via. Informational.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-traphandbook-b.js [part]
//   part: fixture (default) | detgate | beatgate | smoke
'use strict';
const assert = require('assert');
const { loadGame, setupGame, quietLog, runDays } = require('./sim-harness');

const MODE = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'fixture';
const proofCase = MODE === 'fixture' ? require('./godpath/isolated-proof-cases')(['read','craft','pit','plain']) : null;
const BEAT_LINE = 'Your old life comes back to your hands';

let passed = 0;
function ok(name, cond, extra) {
  assert(cond, 'FAIL: ' + name + (extra ? ' — ' + extra : ''));
  passed++;
  console.log('  ok: ' + name);
}

async function newWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'traphandbook-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function pitRec(Game) { return (((Game.state.codex || {}).recipes || {}).pit_trap || {}); }

// resolve a roster char's occupation -> knowsPit, the same lookup newGame uses
function occKnowsPit(Game, char) {
  const cg = Game.data.characterGen || {};
  const occ = (cg.occupations || []).find(o => o.id === char.occupationId) || {};
  return !!occ.knowsPit;
}

async function partFixture() {
  console.log('PART A — fixture');
  // ---- GATE-1: REMOVED 2026-10-18 (lever killed at pilot) — the
  // trapHandbookOn() gate was deleted with the weighting. The field shelf
  // is the uniform line again; no gate to assert.
  // ---- DIST-1 / DIST-2: REMOVED 2026-10-18 (lever killed at pilot) —
  // they tested the deleted pickFieldBook weighting. The field shelf is
  // the uniform line again; nothing to assert.
  // ---- READ-1: the book teaches through grantKnowledge
  if (proofCase === 'read') {
    const Game = await newWorld(105102); // probe: non-pit scholar here
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    delete Game.state.codex.recipes.pit_trap;
    Game.state.scholar.inventory.push({ bookId: 'trappers_handbook', units: 1, name: 'Trapper Handbook', kcalEach: 0, spoilDay: 9999, unit: 'book', prep: 'Read it.', kg: 0.5 });
    let said = '';
    const oSay = Game.say; Game.say = (s) => { said += s + '\n'; };
    const r = Game.readBook('trappers_handbook');
    Game.say = oSay;
    const rec = pitRec(Game);
    ok('READ-1 readBook returns true', r === true);
    ok('READ-1 pit_trap L3 via grantKnowledge', rec.level === 3);
    ok('READ-1 via is read (engine path, not a direct write)', rec.via === 'read', 'via=' + rec.via);
    ok('READ-1 learnedFrom names the book', rec.learnedFrom === 'Trapper Handbook', 'by=' + rec.learnedFrom);
    ok('READ-1 the book is consumed', !(Game.state.scholar.inventory || []).some(i => i && i.bookId === 'trappers_handbook'));
    ok('READ-1 the read narrates', /Trapper Handbook/.test(said));
  }
  // ---- CRAFT-1 (RED): the L0 refusal stands
  if (proofCase === 'craft') {
    const Game = await newWorld(105102);
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    delete Game.state.codex.recipes.pit_trap;
    let said = '';
    const oSay = Game.say; Game.say = (s) => { said += s + '\n'; };
    const r = Game.craft('pit_trap');
    Game.say = oSay;
    ok('CRAFT-1 craft at L0 refuses (null)', r === null);
    ok('CRAFT-1 refusal narrates honestly', /don't know how to make/i.test(said));
  }
  // ---- BEAT-1 (GREEN): pit-background scholar hears the line exactly once
  if (proofCase === 'pit') {
    const { Game } = await loadGame({ seed: 105101, mode: 'traphandbook-beat', fullTelemetry: false });
    const says = [];
    const oSay = Game.say; Game.say = function (m) { says.push(String(m)); return oSay.apply(this, arguments); };
    Game.genRoster('Columbus, Ohio');
    const pitChar = Game.generatedRoster.find(c => occKnowsPit(Game, c));
    assert(pitChar, 'no knowsPit occupation in roster on seed 105101');
    Game.say = function (m) { says.push(String(m)); return oSay.apply(this, arguments); };
    await quietLog(async () => { Game.newGame('Columbus, Ohio', null, pitChar.id); });
    Game.say = oSay;
    const hits = says.filter(s => s.indexOf(BEAT_LINE) !== -1);
    ok('BEAT-1 pit scholar: beat fires', hits.length >= 1, 'hits=' + hits.length);
    ok('BEAT-1 pit scholar: beat fires exactly once', hits.length === 1, 'hits=' + hits.length);
    ok('BEAT-1 pit scholar: pit_trap L3 background', pitRec(Game).level === 3 && pitRec(Game).via === 'background');
    console.log('  beat text: ' + hits[0]);
  }
  // ---- BEAT-2 (RED): non-pit scholar never hears it
  if (proofCase === 'plain') {
    const { Game } = await loadGame({ seed: 105101, mode: 'traphandbook-beat2', fullTelemetry: false });
    const says = [];
    const oSay = Game.say; Game.say = function (m) { says.push(String(m)); return oSay.apply(this, arguments); };
    Game.genRoster('Columbus, Ohio');
    const plainChar = Game.generatedRoster.find(c => !occKnowsPit(Game, c));
    assert(plainChar, 'no non-pit occupation in roster on seed 105101');
    await quietLog(async () => { Game.newGame('Columbus, Ohio', null, plainChar.id); });
    Game.say = oSay;
    const hits = says.filter(s => s.indexOf(BEAT_LINE) !== -1);
    ok('BEAT-2 non-pit scholar: beat absent', hits.length === 0, 'hits=' + hits.length);
    ok('BEAT-2 non-pit scholar: pit_trap stays L0', (pitRec(Game).level || 0) === 0);
  }
  console.log(`PART A: ${passed} assertions green`);
}

async function partDetgate() {
  // REMOVED 2026-10-18 (lever killed at pilot) — no gate left to test.
  console.log('INFO-SKIP: det-gate removed with the weighting lever');
}
async function partBeatgate() {
  // PITKNOWLEDGE=0: the channel is off — no grant, no beat, even for a
  // pit-background scholar.
  assert(process.env.PITKNOWLEDGE === '0', 'run with PITKNOWLEDGE=0');
  const { Game } = await loadGame({ seed: 105101, mode: 'traphandbook-beatgate', fullTelemetry: false });
  const says = [];
  const oSay = Game.say; Game.say = function (m) { says.push(String(m)); return oSay.apply(this, arguments); };
  Game.genRoster('Columbus, Ohio');
  const pitChar = Game.generatedRoster.find(c => occKnowsPit(Game, c));
  assert(pitChar, 'no knowsPit occupation in roster');
  await quietLog(async () => { Game.newGame('Columbus, Ohio', null, pitChar.id); });
  Game.say = oSay;
  const hits = says.filter(s => s.indexOf(BEAT_LINE) !== -1);
  ok('BEATGATE pit scholar, channel off: beat absent', hits.length === 0);
  ok('BEATGATE pit scholar, channel off: pit_trap L0', (pitRec(Game).level || 0) === 0);
  console.log(`PART B2: ${passed} assertions green`);
}

async function partSmoke() {
  // REMOVED 2026-10-18 (lever killed at pilot) — the smoke ran the deleted
  // book-channel policy.
  console.log('INFO-SKIP: smoke removed with the weighting lever');
}

(async () => {
  if (MODE === 'detgate') await partDetgate();
  else if (MODE === 'beatgate') await partBeatgate();
  else if (MODE === 'smoke') await partSmoke();
  else await partFixture();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
