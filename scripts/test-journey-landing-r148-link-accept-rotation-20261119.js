#!/usr/bin/env node
// test-journey-landing-r148-link-accept-rotation-20261119.js — proof test
// for the r148 LINK-ACCEPT ROTATION fix (journey-landing r148 2026-11-19,
// src/js/bond-initiation.js, linkAcceptLine).
//
// The defect (panel r148): 23 link-accepts, all voiced (never the parrot
// label — the watch PASSED), but 22/23 used the IDENTICAL line:
//   "Good. What I've heard of them, I believe. Go and ask."
// Only 1 used the second pool line. Mechanism: linkAcceptLine picks the
// first-unledgered line against a 48-entry run-ledger window; accepts are
// days apart, so the line ages out of the window and pool[0] always wins.
// The single pool[1] serving proves rotation works when the line is still
// in-window. The pools exist to vary — two different villagers days apart
// saying the same acceptance verbatim is the repeat they are for.
//
// The fix: a module-level LINK_ACCEPT_ROTATION store (last line served per
// `how`). When the first-unledgered pick would repeat the last served line
// for that `how` and another pool line is unledgered, serve the other one.
// The ledger check still runs first; fail-open to first-unledgered.
//
// Staging: real lore state (state.village.villageLore) pins `how` to
// 'rumor' — the pool the panel actually hit. The ledger is the real
// convoRunLedger (state.village.convoRunLines). Each served line is
// "emitted" (its key pushed to the ledger, as sayLine does in play) and
// the ledger is then cleared before the next call — the 48-entry window
// aging the line out, i.e. accepts days apart.
//
// The rotation case varies the VILLAGE per call (the panel shape:
// Thornfield, Ashford, Stonebridge, Emberhold on seed 1266) — the served
// line embeds the village name, so a fix that compares full lines never
// matches across villages and never rotates. The store must compare pool
// positions, not substituted lines.
//
// Cases (each in its own process — the rotation store is module-level):
//   rotation: 4 calls, age-out between each -> A,B,A,B. Unfixed: A,A,A,A.
//   control-ledgered: ledger A -> call -> B (first-unledgered, the
//     pre-existing behavior). Passes on fixed AND unfixed code.
//   control-both-ledgered: ledger A and B -> call -> A (fail-open to
//     pool[0]: a repeat beats a ledgered parrot). Passes on both.
//
// Usage: node scripts/test-journey-landing-r148-link-accept-rotation-20261119.js [rotation|control-ledgered|control-both-ledgered]
//   Default (no arg): runs all three cases, spawning children for the
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

const VID = 'test-villager';
const VILLAGE_ID = 'test-village';
const VILLAGE_NAME = 'Testville';
// The 'rumor' pool from bond-initiation.js linkAcceptLine, {V} replaced.
// lineA/lineB build the pool lines for any village name — the rotation
// case serves a different village per call, as the panel does.
const lineA = (v) => `"Good. What I've heard of them, I believe. Go and ask." You carry the proposal to ${v}.`;
const lineB = (v) => `"Good — the word on them is kind. Go and ask." You carry the proposal to ${v}.`;
const LINE_A = lineA(VILLAGE_NAME);
const LINE_B = lineB(VILLAGE_NAME);

async function stageGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'landing-r148-link-accept-proof', fullTelemetry: true });
  await setupGame(Game);
  // Pin `how` to 'rumor' through real lore state (no stubbing).
  const vil = Game.state.village || (Game.state.village = {});
  vil.villageLore = vil.villageLore || {};
  vil.villageLore[VID] = {};
  vil.villageLore[VID][VILLAGE_ID] = { how: 'rumor' };
  return Game;
}

// The ledger key, exactly as linkAcceptLine computes it.
function ledgerKey(Game, s) {
  const ch = (typeof Game.convoSplitBeats === 'function') ? Game.convoSplitBeats(s) : [s];
  return String((ch && ch[0]) || s).trim();
}
function ledger(Game) { return (typeof Game.convoRunLedger === 'function') ? Game.convoRunLedger() : []; }
function emit(Game, line) { ledger(Game).push(ledgerKey(Game, line)); } // sayLine does this in play
function ageOut(Game) { ledger(Game).length = 0; } // the 48-entry window moves on

async function runCase(mode) {
  const seed = { rotation: 20261119, 'control-ledgered': 20261120, 'control-both-ledgered': 20261121 }[mode] || 20261119;
  const Game = await stageGame(seed);
  check(`${mode}: linkAcceptLine exists`, typeof Game.linkAcceptLine === 'function');
  if (typeof Game.linkAcceptLine !== 'function') return;
  check(`${mode}: lore pins how=rumor`,
    ((Game.villageLoreOf && Game.villageLoreOf(VID)) || {})[VILLAGE_ID] &&
    Game.villageLoreOf(VID)[VILLAGE_ID].how === 'rumor',
    `how=${(Game.villageLoreOf(VID)[VILLAGE_ID] || {}).how}`);
  if (mode === 'rotation') {
    // A different village per call — the panel shape (seed 1266: four
    // accepts, four villages). The line embeds the village name, so the
    // rotation must survive the name changing.
    const villages = ['Thornfield', 'Ashford', 'Stonebridge', 'Emberhold'];
    const served = [];
    for (let i = 0; i < 4; i++) {
      ageOut(Game); // days apart: the last accept aged out of the window
      const line = Game.linkAcceptLine(VID, VILLAGE_ID, villages[i]);
      served.push(line);
      emit(Game, line); // spoken in play: ledgered, then aged out
    }
    check('rotation: 1st accept is pool[0]', served[0] === lineA(villages[0]), JSON.stringify(served[0]));
    check('rotation: 2nd accept varies (panel shape was a repeat)', served[1] === lineB(villages[1]), JSON.stringify(served[1]));
    check('rotation: 3rd accept returns to pool[0]', served[2] === lineA(villages[2]), JSON.stringify(served[2]));
    check('rotation: 4th accept varies again', served[3] === lineB(villages[3]), JSON.stringify(served[3]));
    check('rotation: alternation A,B,A,B across villages',
      served[0] === lineA(villages[0]) && served[1] === lineB(villages[1]) && served[2] === lineA(villages[2]) && served[3] === lineB(villages[3]));
    return;
  }
  if (mode === 'control-ledgered') {
    emit(Game, LINE_A); // pool[0] was said recently: still in-window
    const line = Game.linkAcceptLine(VID, VILLAGE_ID, VILLAGE_NAME);
    check('control-ledgered: ledgered pool[0] yields pool[1] (existing behavior)', line === LINE_B, JSON.stringify(line));
    return;
  }
  // control-both-ledgered: both lines said recently.
  emit(Game, LINE_A);
  emit(Game, LINE_B);
  const line = Game.linkAcceptLine(VID, VILLAGE_ID, VILLAGE_NAME);
  check('control-both-ledgered: both ledgered -> fail-open to pool[0]', line === LINE_A, JSON.stringify(line));
}

async function main() {
  const mode = process.argv[2];
  if (!mode) {
    for (const m of ['rotation', 'control-ledgered', 'control-both-ledgered']) {
      console.log(`\n### case ${m} ###`);
      try {
        execFileSync(process.execPath, [__filename, m], { stdio: 'inherit' });
      } catch (e) {
        console.log(`FAIL case ${m} exited ${e.status}`);
        fails++;
      }
    }
    console.log(fails === 0 ? '\nALL CHECKS PASS' : `\n${fails} CHECK(S) FAILING`);
    process.exit(fails ? 1 : 0);
  }
  await runCase(mode);
  console.log(fails === 0 ? '\nALL CHECKS PASS' : `\n${fails} CHECK(S) FAILING`);
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
