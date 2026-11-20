'use strict';
// test-journey-landing-r149-zerodmg-split-20261120.js -- r149 v3 zerodmg
// analyzer proof: the B-shape split (r148 metric-review item 1).
// The v3 analyzer counts REFUSED TURNS per zero-DMG fight (a scholar turn
// lost to a refused verb) and splits B-shape into refused vs
// stood-through-by-choice. The panel total binds at 0; stood-through is
// reported only.
//
// Cases (each runs the REAL analyzer as a subprocess on a synthetic corpus
// in a temp dir — one census JSON per case, fixtures below):
//   A r148-original shape: the 1271 d25 moderator fight verbatim in
//     fightLog shape — 2 muted moves (moved:true, posMoved:false) while
//     allies deal 279 — expect refusedTurns=2 (movedLie=2), B-shape 1,
//     stoodThroughByChoice=0, SPLIT-VERDICT FAIL.
//   B r148-fix2 shape: the same fight with the scholar's turns as
//     player-wait (the competent wait-out) — expect refusedTurns=0,
//     stoodThroughByChoice=1, SPLIT-VERDICT PASS.
//   C failed-move shape: a zero-DMG B fight with one plain failed move
//     (moved:false, posMoved:false, "No path there") — expect
//     refusedTurns=1 (failedMove=1), SPLIT-VERDICT FAIL.
//   D ability-fail shape: a zero-DMG B fight with one refused ability
//     (ok:false) — expect refusedTurns=1 (abilityFail=1), FAIL.
//   E control: a zero-DMG A-shape fight (allies before the scholar's
//     turn, no scholar entries) — expect refusedTurns=0,
//     stoodThroughByChoice=0 (A is not B), SPLIT-VERDICT PASS.
//   F scope: a fight where the scholar DEALT damage and also had a
//     refused move — expect the fight not to count at all (zeroDmg=0)
//     and refusedTurns=0: the binding total covers zero-DMG fights only;
//     the r128 analyzer reports panel-wide move refusals as a watch.
// Real-corpus back-compat (run by hand before this test was written, and
// recorded in the v3 analyzer header): r148 original corpus
// refusedTurns=2 / stoodThroughByChoice=0 / FAIL; r148 fix2 corpus
// refusedTurns=0 / stoodThroughByChoice=1 / PASS. The synthetic fixtures
// above reproduce those two shapes exactly (A and B).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r149-zerodmg-v3.js');

function census(seed, fights) {
  return { seed, fights81: fights };
}
// Minimal fight entry: only the fields the analyzer reads.
function fight(day, log, opts) {
  return Object.assign({
    day, fightLog: log, rounds: 3,
    monsters: [{ name: 'Elder The Moderator', monsterId: 'moderator', wave: 2, hp: 0, maxHp: 245 }],
    allies: 2, villagers: ['v_caleb_jones', 'v_naran_tumen'],
    turnOrder: ['m_0', 'v_caleb_jones', 'v_naran_tumen', 'p'],
    playerHpEnd: 98, endResult: 'won', playerFled: false,
  }, opts || {});
}
const allyDmg = (src, applied) => ({ turn: 'damage', targetKey: 'm_0', asked: 10, applied, sourceLabel: src, sourceKey: 'v_' + src.toLowerCase() });
const mutedMove = (from, to, n) => ({
  turn: 'player-move', from, to, moved: true, posMoved: false,
  lines: ['\uD83D\uDEAB MOVE IS MUTED inside the suppression field. Your feet refuse the order — flagged as a violation. (PRIOR VIOLATIONS: ' + n + ' — its Notices hit +' + (n * 3) + ' harder.'],
});
const waitTurn = () => ({ turn: 'player-wait' });
const monsterTurn = () => ({ turn: 'monster-turn', monsterKey: 'm_0', monsterName: 'Elder The Moderator', playerHpBefore: 100, playerHpAfter: 98, dmgTaken: 2, lines: [] });

const CASES = [
  {
    name: 'A r148-original (2 muted moves)',
    fights: [fight(25, [
      { turn: 'player-move', from: [8, 0], to: [7, 0], moved: true, posMoved: true, lines: [] },
      allyDmg('Caleb', 28), allyDmg('Naran', 65), monsterTurn(),
      allyDmg('Caleb', 24), allyDmg('Naran', 61), monsterTurn(),
      mutedMove([7, 0], [6, 0], 1),
      allyDmg('Caleb', 28), allyDmg('Naran', 73),
      mutedMove([7, 0], [6, 1], 2),
    ])],
    expect: { zeroDmg: 1, refusedTurns: 2, movedLie: 2, failedMove: 0, abilityFail: 0, stood: 0, verdict: 'FAIL' },
  },
  {
    name: 'B r148-fix2 (competent wait-out)',
    fights: [fight(25, [
      { turn: 'player-move', from: [8, 0], to: [7, 0], moved: true, posMoved: true, lines: [] },
      allyDmg('Caleb', 28), allyDmg('Naran', 65), monsterTurn(),
      waitTurn(),
      allyDmg('Caleb', 24), allyDmg('Naran', 61), monsterTurn(),
      waitTurn(),
      allyDmg('Caleb', 28), allyDmg('Naran', 73),
    ])],
    expect: { zeroDmg: 1, refusedTurns: 0, movedLie: 0, failedMove: 0, abilityFail: 0, stood: 1, verdict: 'PASS' },
  },
  {
    name: 'C failed move (no path)',
    fights: [fight(9, [
      { turn: 'player-move', from: [4, 4], to: [4, 5], moved: false, posMoved: false, lines: ['No path there.'] },
      allyDmg('Caleb', 40), monsterTurn(),
      allyDmg('Naran', 50), monsterTurn(),
      waitTurn(),
      allyDmg('Caleb', 30),
    ])],
    expect: { zeroDmg: 1, refusedTurns: 1, movedLie: 0, failedMove: 1, abilityFail: 0, stood: 0, verdict: 'FAIL' },
  },
  {
    name: 'D refused ability',
    fights: [fight(12, [
      { turn: 'player-ability', abilityId: 'purify', action: 'use', ok: false },
      allyDmg('Caleb', 40), monsterTurn(),
      allyDmg('Naran', 50), monsterTurn(),
      waitTurn(),
      allyDmg('Caleb', 30),
    ])],
    expect: { zeroDmg: 1, refusedTurns: 1, movedLie: 0, failedMove: 0, abilityFail: 1, stood: 0, verdict: 'FAIL' },
  },
  {
    name: 'E control A-shape (allies before scholar turn)',
    fights: [fight(6, [
      allyDmg('Caleb', 90), allyDmg('Naran', 80),
    ], { rounds: 1, turnOrder: ['v_caleb_jones', 'v_naran_tumen', 'm_0', 'p'] })],
    expect: { zeroDmg: 1, refusedTurns: 0, movedLie: 0, failedMove: 0, abilityFail: 0, stood: 0, verdict: 'PASS' },
  },
  {
    name: 'F scope (scholar dealt damage; refused move excluded)',
    fights: [fight(15, [
      { turn: 'player-strike', targetKey: 'm_0', dmg: 12 },
      { turn: 'damage', targetKey: 'm_0', asked: 12, applied: 12, sourceLabel: 'you', sourceKey: 'p' },
      { turn: 'player-move', from: [4, 4], to: [4, 5], moved: false, posMoved: false, lines: ['No path there.'] },
      allyDmg('Caleb', 40), monsterTurn(),
      allyDmg('Naran', 50),
    ])],
    expect: { zeroDmg: 0, refusedTurns: 0, movedLie: 0, failedMove: 0, abilityFail: 0, stood: 0, verdict: 'PASS' },
  },
];

let failures = 0;
for (const c of CASES) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r149-zerodmg-'));
  try {
    fs.writeFileSync(path.join(dir, 'journey-landing-r62-census-9001.json'), JSON.stringify(census(9001, c.fights)));
    const out = execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
    const split = out.match(/SPLIT \(r149\): refusedTurns=(\d+) \(bar 0\) stoodThroughByChoice=(\d+) bShapeWithRefusals=(\d+)/);
    const verdict = out.match(/SPLIT-VERDICT: (PASS|FAIL)/);
    const panel = out.match(/PANEL: fights=\d+ zeroDmg=(\d+)/);
    const perFight = out.match(/refusedTurns=\d+ \(movedLie=(\d+) failedMove=(\d+) abilityFail=(\d+)\)/);
    const got = {
      zeroDmg: panel ? parseInt(panel[1], 10) : null,
      refusedTurns: split ? parseInt(split[1], 10) : null,
      stood: split ? parseInt(split[2], 10) : null,
      verdict: verdict ? verdict[1] : null,
      movedLie: perFight ? parseInt(perFight[1], 10) : (c.expect.zeroDmg === 0 ? 0 : null),
      failedMove: perFight ? parseInt(perFight[2], 10) : (c.expect.zeroDmg === 0 ? 0 : null),
      abilityFail: perFight ? parseInt(perFight[3], 10) : (c.expect.zeroDmg === 0 ? 0 : null),
    };
    const e = c.expect;
    const ok = got.zeroDmg === e.zeroDmg && got.refusedTurns === e.refusedTurns &&
      got.stood === e.stood && got.verdict === e.verdict &&
      got.movedLie === e.movedLie && got.failedMove === e.failedMove && got.abilityFail === e.abilityFail;
    console.log((ok ? 'PASS' : 'FAIL') + ' ' + c.name + ' — got ' + JSON.stringify(got) + ' expected ' + JSON.stringify(e));
    if (!ok) failures++;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
console.log(failures === 0 ? 'ALL CHECKS PASS' : failures + ' CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
