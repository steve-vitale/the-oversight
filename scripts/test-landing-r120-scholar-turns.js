// Proof test for the r120 scholar-turns analyzer (r119 zero-DMG watch).
// Runs the REAL analyzer (child process) on (a) synthetic fixtures and
// (b) the r119 landing corpus, and asserts the verb counts.
//   Fixtures: a B-shape fight WITH scholar verbs (2 waits, 1 move,
//     1 ability) prints "wait=2 move=1 barrier=0 ability=1"; a B-shape
//     fight with NO logged verb prints the "no logged scholar verb" NOTE;
//     an S-shape fight with 1 wait prints wait=1; a killing-blow fight
//     (you dealt 35) drops out of the zero-DMG set entirely; a fled fight
//     with a barrier-exit prints barrier=1.
//   r119 corpus (pre-r120 driver, no wraps): 20 fights, 2 zero-DMG, both
//     B, verbTotals all 0, and the "no turn data (pre-r120 corpus)" line.
// Usage: node scripts/test-landing-r120-scholar-turns.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r120-scholar-turns.js');
const GOAL = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-08');

function runAnalyzer(dir) {
  const out = execSync(`node ${ANALYZER} ${dir}`, { encoding: 'utf8' });
  const panel = /PANEL: fights=(\d+) zeroDmg=(\d+) B-shape=(\d+)/.exec(out);
  const shapes = /byShape: (\{[^}]*\})/.exec(out);
  const verbs = /verbTotals \(all fights, r120 wraps\): (\{[^}]*\})/.exec(out);
  assert(panel, 'no PANEL line from analyzer on ' + dir);
  return { out, fights: +panel[1], zeroDmg: +panel[2], bShape: +panel[3],
    byShape: JSON.parse(shapes[1]), verbTotals: JSON.parse(verbs[1]) };
}

// (a) Synthetic fixtures: one census file, five fights.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scholar-turns-'));
const dmg = (targetKey, applied, sourceLabel, sourceKey) =>
  ({ turn: 'damage', targetKey, applied, sourceLabel, sourceKey: sourceKey || null });
const mturn = (monsterKey) =>
  ({ turn: 'monster-turn', monsterKey, monsterName: 'X', playerHpBefore: 100, playerHpAfter: 100, dmgTaken: 0, lines: [] });
const strike = (dmgVal, result) =>
  ({ turn: 'player-strike', targetKey: 'm_0', targetHpBefore: 27, targetHpAfter: null, dmg: dmgVal, result, lines: [] });
const wait = () => ({ turn: 'player-wait' });
const move = (tx, ty, moved) => ({ turn: 'player-move', to: [tx, ty], moved: !!moved });
const barrier = (dx, dy) => ({ turn: 'player-barrier-exit', dir: [dx, dy] });
const ability = (aid, act, ok) => ({ turn: 'player-ability', abilityId: aid, action: act, ok: !!ok });
const census = {
  seed: 99999,
  fights81: [
    // B-shape WITH verbs: scholar waited twice, moved once, used an
    // ability once — allies killed (2 monster turns, 3 rounds, 0 strikes).
    { day: 2, endResult: 'won', rounds: 3, pendingFace: false, allies: 2,
      villagers: ['B'], monsters: [{ name: 'Sunback', wave: 1, hp: 0, maxHp: 63 }],
      turnOrder: ['p', 'v_b', 'm_0'],
      fightLog: [wait(), mturn('m_0'), dmg('m_0', 5, 'Samat'), move(3, 4, true),
        mturn('m_0'), dmg('m_0', 101, 'Catalina'), wait(), ability('purify', 'cast', true)] },
    // B-shape with NO logged verb: 0 strikes, 2 monster turns, 3 rounds,
    // allies killed, and the scholar's turns left no trace.
    { day: 5, endResult: 'won', rounds: 3, pendingFace: false, allies: 2,
      villagers: ['C'], monsters: [{ name: 'Drum-Belly', wave: 1, hp: 0, maxHp: 70 }],
      turnOrder: ['p', 'v_c', 'm_0'],
      fightLog: [mturn('m_0'), dmg('m_0', 20, 'Adaeze'), mturn('m_0'), dmg('m_0', 50, 'Catalina')] },
    // S-shape with a wait: 2 strikes, both dmg 0, an ally dealt 10.
    { day: 7, endResult: 'lost', rounds: 5, pendingFace: false, allies: 0,
      villagers: [], monsters: [{ name: 'Focus Group', wave: 2, hp: 90, maxHp: 90 }],
      turnOrder: ['p', 'm_0'],
      fightLog: [wait(), mturn('m_0'), strike(0, 'true'), mturn('m_0'), strike(0, 'true'),
        dmg('m_0', 10, 'Adaeze')] },
    // Killing blow: the scholar dealt 35 — NOT zero-DMG, drops out.
    { day: 1, endResult: 'won', rounds: 3, pendingFace: false, allies: 3,
      villagers: ['A'], monsters: [{ name: 'White Noise', wave: 1, hp: 0, maxHp: 67 }],
      turnOrder: ['p', 'v_a', 'm_0'],
      fightLog: [mturn('m_0'), dmg('m_0', 13, 'Adaeze'), mturn('m_0'),
        dmg('m_0', 4, 'Catalina'), dmg('m_0', 35, 'you'), strike(null, 'true')] },
    // Fled with a barrier exit: 0 strikes, no damage to monsters, the
    // scholar left through the barrier (shape no-strikes, verb barrier=1).
    { day: 9, endResult: 'fled', rounds: 2, pendingFace: false, allies: 1,
      villagers: ['D'], monsters: [{ name: 'Heron', wave: 1, hp: 60, maxHp: 60 }],
      turnOrder: ['p', 'v_d', 'm_0'], playerFled: true, playerHpEnd: 80,
      fightLog: [mturn('m_0'), dmg('p', 12, 'Heron'), barrier(1, 0)] },
  ],
};
fs.writeFileSync(path.join(tmp, 'journey-landing-r62-census-99999.json'), JSON.stringify(census));
const fix = runAnalyzer(tmp);
assert.strictEqual(fix.fights, 5, 'fixtures: 5 fights, got ' + fix.fights);
assert.strictEqual(fix.zeroDmg, 4, 'fixtures: killing blow drops out, 4 zero-DMG, got ' + fix.zeroDmg);
assert.strictEqual(fix.bShape, 2, 'fixtures: 2 B-shape, got ' + fix.bShape);
assert.deepStrictEqual(fix.byShape,
  { 'B-scholar-stood-through': 2, 'S-struck-0-dmg': 1, 'no-strikes': 1 },
  'fixtures: shapes B:2 S:1 no-strikes:1, got ' + JSON.stringify(fix.byShape));
assert.deepStrictEqual(fix.verbTotals,
  { 'player-wait': 3, 'player-move': 1, 'player-barrier-exit': 1, 'player-ability': 1 },
  'fixtures: verbTotals wait:3 move:1 barrier:1 ability:1, got ' + JSON.stringify(fix.verbTotals));
assert(fix.out.includes('scholar verbs: wait=2 move=1 barrier=0 ability=1'),
  'fixtures: B-with-verbs line missing');
assert(fix.out.includes('abilities: purify(cast,ok=true)'),
  'fixtures: ability detail line missing');
assert(fix.out.includes('NOTE: no logged scholar verb in this fight'),
  'fixtures: no-verb NOTE missing');
assert(fix.out.includes('scholar verbs: wait=1 move=0 barrier=0 ability=0'),
  'fixtures: S-with-wait line missing');
assert(fix.out.includes('scholar verbs: wait=0 move=0 barrier=1 ability=0'),
  'fixtures: fled barrier line missing');
assert(!fix.out.includes('no turn data (pre-r120 corpus)'),
  'fixtures: pre-r120 line must NOT print when verb data exists');
console.log('fixtures: PASS (B-with-verbs 2/1/0/1, B-no-verb NOTE, S wait=1, fled barrier=1, killing blow out)');

// (b) r119 corpus calibration: pre-r120 driver, so no verb data at all.
const r119 = runAnalyzer(path.join(GOAL, 'landing-r119'));
assert.strictEqual(r119.fights, 20, 'r119: 20 fights, got ' + r119.fights);
assert.strictEqual(r119.zeroDmg, 2, 'r119: 2 zero-DMG, got ' + r119.zeroDmg);
assert.deepStrictEqual(r119.byShape, { 'B-scholar-stood-through': 2 },
  'r119: shapes B:2, got ' + JSON.stringify(r119.byShape));
assert.deepStrictEqual(r119.verbTotals,
  { 'player-wait': 0, 'player-move': 0, 'player-barrier-exit': 0, 'player-ability': 0 },
  'r119: verbTotals all 0, got ' + JSON.stringify(r119.verbTotals));
assert(r119.out.includes('no turn data (pre-r120 corpus)'),
  'r119: pre-r120 line missing');
console.log('r119 corpus: PASS (20 fights, 2 zero-DMG, both B, no turn data)');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('test-landing-r120-scholar-turns: PASS (fixtures + r119 corpus)');
