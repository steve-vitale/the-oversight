'use strict';
// test-journey-landing-r150-move-refusals-20261120.js -- r150 move-refusals
// analyzer proof: the silent-noline split (r149 metric-review item 2).
// The r150 analyzer splits `silent-noline` into `deduped-refusal` (no
// lines AND the last spoken line in the fight is itself a refusal-pattern
// line — the engine's consecutive-duplicate dedup said it once and refused
// to repeat it) vs `silent-noline` (truly silent: no line and no preceding
// refusal line). The split tracks the last SPOKEN line (most recent
// non-empty lines in log order), not the previous entry's lines: a silent
// entry carries no lines, so chaining off the previous entry would break
// the dedup chain after the first silent attempt.
//
// Cases (each runs the REAL analyzer as a subprocess on a synthetic corpus
// in a temp dir — one census JSON per case, fixtures below):
//   A dodge-scan shape: one spoken "Too far" then 3 silent failed moves
//     in the same turn — expect toofar 1, deduped-refusal 3, silent 0.
//   B truly-silent shape: a failed move with no lines and no preceding
//     refusal line (first entry) — expect silent-noline 1.
//   C monster-line intervenes: spoken "No path", then a monster-turn
//     with its own lines, then a silent failed move — the last spoken
//     line is the monster's, not a refusal, so expect silent-noline 1.
//   D mixed refusals: spoken "No path", silent, spoken "Too far",
//     silent — expect nopath 1, toofar 1, deduped-refusal 2, silent 0.
//   E control: all moves succeed — expect failed 0, byReason {}.
//   F movedLie (ret true, posMoved false, no lines) — expect
//     silent-mute 1 (unchanged from r128).
// Real-corpus back-compat (run by hand before this test was written, and
// recorded in the r150 analyzer header): r149 BEFORE corpus
// (landing-r149-after) byReason {"nopath":5,"toofar":2,
// "deduped-refusal":41} (was {"silent-noline":41} under r128), totals
// identical (70 moves, 48 failed, stuckFights 1); r149 AFTER corpus
// (landing-r149-after-fix) 0 failed moves. The synthetic fixtures above
// reproduce the dodge-scan shape (A) and the truly-silent shape (B).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r150-move-refusals.js');

function census(seed, fights) {
  return { seed, fights81: fights };
}
// Minimal fight entry: only the fields the analyzer reads.
function fight(day, log, opts) {
  return Object.assign({
    day, fightLog: log, rounds: 3,
    monsters: [{ name: 'Paparazzo', monsterId: 'paparazzo', wave: 2, hp: 0, maxHp: 72 }],
    allies: 2, villagers: ['v_caleb_jones'],
    turnOrder: ['m_0', 'v_caleb_jones', 'p'],
    playerHpEnd: 98, endResult: 'won', playerFled: false,
  }, opts || {});
}
const move = (from, to, lines, moved) => ({
  turn: 'player-move', from, to,
  moved: moved !== undefined ? moved : false, posMoved: false, lines: lines || [],
});
const okMove = (from, to) => ({ turn: 'player-move', from, to, moved: true, posMoved: true, lines: [] });
const strike = () => ({ turn: 'player-strike', targetKey: 'm_0', dmg: 12 });
const monsterTurn = (lines) => ({ turn: 'monster-turn', monsterKey: 'm_0', monsterName: 'Paparazzo', playerHpBefore: 100, playerHpAfter: 98, dmgTaken: 2, lines: lines || [] });

const CASES = [
  {
    name: 'A dodge-scan (1 spoken + 3 silent)',
    fights: [fight(21, [
      move([8, 8], [7, 7], ['Too far — 3 squares left.']),
      move([8, 8], [6, 7]),
      move([8, 8], [7, 6]),
      move([8, 8], [5, 5]),
      strike(),
      monsterTurn(['The Paparazzo raises its camera.']),
    ])],
    expect: { failed: 4, byReason: { toofar: 1, 'deduped-refusal': 3 }, stuck: 0 },
  },
  {
    name: 'B truly-silent (no preceding refusal)',
    fights: [fight(9, [
      move([4, 4], [4, 5]),
      strike(),
      monsterTurn(['The deer lowers its head.']),
    ])],
    expect: { failed: 1, byReason: { 'silent-noline': 1 }, stuck: 0 },
  },
  {
    name: 'C monster line intervenes',
    fights: [fight(12, [
      move([4, 4], [4, 5], ['No path there.']),
      monsterTurn(['The deer snorts and paws the ground.']),
      move([4, 4], [5, 5]),
      strike(),
    ])],
    expect: { failed: 2, byReason: { nopath: 1, 'silent-noline': 1 }, stuck: 0 },
  },
  {
    name: 'D mixed refusals (nopath + toofar, 2 deduped)',
    fights: [fight(14, [
      move([4, 4], [4, 5], ['No path there.']),
      move([4, 4], [5, 5]),
      move([4, 4], [3, 3], ['Too far — 3 squares left.']),
      move([4, 4], [6, 6]),
      strike(),
      monsterTurn([]),
    ])],
    expect: { failed: 4, byReason: { nopath: 1, toofar: 1, 'deduped-refusal': 2 }, stuck: 0 },
  },
  {
    name: 'E control (all moves succeed)',
    fights: [fight(6, [
      okMove([4, 4], [4, 5]),
      strike(),
      monsterTurn([]),
    ])],
    expect: { failed: 0, byReason: {}, stuck: 0 },
  },
  {
    name: 'F movedLie stays silent-mute',
    fights: [fight(25, [
      { turn: 'player-move', from: [8, 0], to: [7, 0], moved: true, posMoved: false, lines: [] },
      strike(),
      monsterTurn([]),
    ])],
    expect: { failed: 1, byReason: { 'silent-mute': 1 }, stuck: 0 },
  },
];

let failures = 0;
for (const c of CASES) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r150-moveref-'));
  try {
    fs.writeFileSync(path.join(dir, 'journey-landing-r62-census-9001.json'), JSON.stringify(census(9001, c.fights)));
    const out = execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
    const moves = out.match(/moves: total=\d+ failed\(posMoved=false\)=(\d+) movedLie\(ret=true,posMoved=false\)=(\d+)/);
    const byReason = out.match(/byReason: (\{.*\})/);
    const stuck = out.match(/stuckFights\(living scholar, >=3 failed moves, 0 strikes\): (\d+)/);
    const got = {
      failed: moves ? parseInt(moves[1], 10) : null,
      byReason: byReason ? JSON.parse(byReason[1]) : null,
      stuck: stuck ? parseInt(stuck[1], 10) : null,
    };
    const e = c.expect;
    // byReason compared key-wise (insertion order differs by log order).
    const reasonKeys = new Set([...Object.keys(got.byReason || {}), ...Object.keys(e.byReason || {})]);
    let reasonsEqual = true;
    for (const k of reasonKeys) {
      if ((got.byReason || {})[k] !== (e.byReason || {})[k]) { reasonsEqual = false; break; }
    }
    const ok = got.failed === e.failed && got.stuck === e.stuck && reasonsEqual;
    console.log((ok ? 'PASS' : 'FAIL') + ' ' + c.name + ' — got ' + JSON.stringify(got) + ' expected ' + JSON.stringify(e));
    if (!ok) failures++;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
console.log(failures === 0 ? 'ALL CHECKS PASS' : failures + ' CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
