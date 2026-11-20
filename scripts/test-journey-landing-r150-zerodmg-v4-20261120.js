'use strict';
// test-journey-landing-r150-zerodmg-v4-20261120.js -- r150 v4 zerodmg
// analyzer proof: the all-fights refused-turns line (r149 metric-review
// item 5). The v4 analyzer counts refusedTurnsOf across ALL fights and
// reports it as WATCH alongside the binding zero-DMG count, so a
// wasted-turns shape can't hide behind a damage-dealing scholar (r149:
// the 1277 d25 Spool fight's 14 refused approach steps did not bind).
// Binding bar unchanged: zero-DMG refusedTurns 0.
//
// Cases (each runs the REAL analyzer as a subprocess on a synthetic corpus
// in a temp dir — one census JSON per case, fixtures below):
//   A zero-DMG B fight with one refused move — expect binding 1,
//     all-fights 1, nonZeroDmgWithRefusals 0, SPLIT-VERDICT FAIL.
//   B damage-dealing fight with one refused move (the Spool shape) —
//     expect zeroDmg 0, binding 0, all-fights 1,
//     nonZeroDmgWithRefusals 1, SPLIT-VERDICT PASS (binding only).
//   C damage-dealing fight with no refused move — expect all-fights 0.
//   D mixed panel: one zero-DMG B fight with a refused move + one
//     damage-dealing fight with a refused move — expect binding 1,
//     all-fights 2, nonZeroDmgWithRefusals 1, FAIL.
//   E control: zero-DMG A-shape, no refusals — expect 0/0 PASS.
// Real-corpus back-compat (run by hand before this test was written, and
// recorded in the v4 analyzer header): r149 BEFORE corpus
// (landing-r149-after) binding 33, all-fights 48 (33 dodge + 14 Spool
// approach + 1 Highbeam Deer 1275 d14), nonZeroDmgWithRefusals 2;
// r149 AFTER corpus (landing-r149-after-fix) binding 0, all-fights 0.
// The synthetic fixtures above reproduce the Spool shape (B) and the
// binding shape (A) exactly.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r150-zerodmg-v4.js');

function census(seed, fights) {
  return { seed, fights81: fights };
}
// Minimal fight entry: only the fields the analyzer reads.
function fight(day, log, opts) {
  return Object.assign({
    day, fightLog: log, rounds: 3,
    monsters: [{ name: 'Spool', monsterId: 'spool', wave: 3, hp: 0, maxHp: 288 }],
    allies: 2, villagers: ['v_caleb_jones', 'v_naran_tumen'],
    turnOrder: ['m_0', 'v_caleb_jones', 'v_naran_tumen', 'p'],
    playerHpEnd: 98, endResult: 'won', playerFled: false,
  }, opts || {});
}
const allyDmg = (src, applied) => ({ turn: 'damage', targetKey: 'm_0', asked: 10, applied, sourceLabel: src, sourceKey: 'v_' + src.toLowerCase() });
const monsterTurn = () => ({ turn: 'monster-turn', monsterKey: 'm_0', monsterName: 'Spool', playerHpBefore: 100, playerHpAfter: 98, dmgTaken: 2, lines: [] });
const waitTurn = () => ({ turn: 'player-wait' });
const failedMove = (from, to) => ({ turn: 'player-move', from, to, moved: false, posMoved: false, lines: ['No path there.'] });
const youDmg = (applied) => ({ turn: 'damage', targetKey: 'm_0', asked: applied, applied, sourceLabel: 'you', sourceKey: 'p' });

const CASES = [
  {
    name: 'A zero-DMG B fight, one refused move',
    fights: [fight(9, [
      failedMove([4, 4], [4, 5]),
      allyDmg('Caleb', 40), monsterTurn(),
      allyDmg('Naran', 50), monsterTurn(),
      waitTurn(),
      allyDmg('Caleb', 30),
    ])],
    expect: { zeroDmg: 1, binding: 1, allFights: 1, nonZero: 0, verdict: 'FAIL' },
  },
  {
    name: 'B Spool shape (damage dealt, refused move)',
    fights: [fight(25, [
      { turn: 'player-strike', targetKey: 'm_0', dmg: 12 },
      youDmg(12),
      failedMove([8, 8], [7, 7]),
      allyDmg('Caleb', 40), monsterTurn(),
      allyDmg('Naran', 50),
    ])],
    expect: { zeroDmg: 0, binding: 0, allFights: 1, nonZero: 1, verdict: 'PASS' },
  },
  {
    name: 'C damage-dealing fight, no refused move',
    fights: [fight(15, [
      { turn: 'player-strike', targetKey: 'm_0', dmg: 12 },
      youDmg(12),
      { turn: 'player-move', from: [4, 4], to: [4, 5], moved: true, posMoved: true, lines: [] },
      allyDmg('Caleb', 40), monsterTurn(),
      allyDmg('Naran', 50),
    ])],
    expect: { zeroDmg: 0, binding: 0, allFights: 0, nonZero: 0, verdict: 'PASS' },
  },
  {
    name: 'D mixed panel (binding 1 + Spool 1)',
    fights: [
      fight(9, [
        failedMove([4, 4], [4, 5]),
        allyDmg('Caleb', 40), monsterTurn(),
        allyDmg('Naran', 50), monsterTurn(),
        waitTurn(),
        allyDmg('Caleb', 30),
      ]),
      fight(25, [
        { turn: 'player-strike', targetKey: 'm_0', dmg: 12 },
        youDmg(12),
        failedMove([8, 8], [7, 7]),
        allyDmg('Caleb', 40), monsterTurn(),
        allyDmg('Naran', 50),
      ]),
    ],
    expect: { zeroDmg: 1, binding: 1, allFights: 2, nonZero: 1, verdict: 'FAIL' },
  },
  {
    name: 'E control A-shape, no refusals',
    fights: [fight(6, [
      allyDmg('Caleb', 90), allyDmg('Naran', 80),
    ], { rounds: 1, turnOrder: ['v_caleb_jones', 'v_naran_tumen', 'm_0', 'p'] })],
    expect: { zeroDmg: 1, binding: 0, allFights: 0, nonZero: 0, verdict: 'PASS' },
  },
];

let failures = 0;
for (const c of CASES) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r150-zerodmg-v4-'));
  try {
    fs.writeFileSync(path.join(dir, 'journey-landing-r62-census-9001.json'), JSON.stringify(census(9001, c.fights)));
    const out = execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
    const split = out.match(/SPLIT \(r149\): refusedTurns=(\d+) \(bar 0\) stoodThroughByChoice=(\d+) bShapeWithRefusals=(\d+)/);
    const verdict = out.match(/SPLIT-VERDICT: (PASS|FAIL)/);
    const panel = out.match(/PANEL: fights=\d+ zeroDmg=(\d+)/);
    const allF = out.match(/REFUSED-ALL-FIGHTS \(r150, watch\): refusedTurnsAllFights=(\d+) \(binding zero-DMG count above is (\d+)\)/);
    const nonZero = out.match(/nonZeroDmgWithRefusals: (\d+)/);
    const got = {
      zeroDmg: panel ? parseInt(panel[1], 10) : null,
      binding: split ? parseInt(split[1], 10) : null,
      verdict: verdict ? verdict[1] : null,
      allFights: allF ? parseInt(allF[1], 10) : null,
      bindingEcho: allF ? parseInt(allF[2], 10) : null,
      nonZero: nonZero ? parseInt(nonZero[1], 10) : null,
    };
    const e = c.expect;
    const ok = got.zeroDmg === e.zeroDmg && got.binding === e.binding &&
      got.verdict === e.verdict && got.allFights === e.allFights &&
      got.bindingEcho === e.binding && got.nonZero === e.nonZero;
    console.log((ok ? 'PASS' : 'FAIL') + ' ' + c.name + ' — got ' + JSON.stringify(got) + ' expected ' + JSON.stringify(e));
    if (!ok) failures++;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
console.log(failures === 0 ? 'ALL CHECKS PASS' : failures + ' CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
