// Proof test for the r117 zero-DMG analyzer v2 (Q1-adjacent instrument fix).
// The v2 change: the scholar's dealt damage is read from the DAMAGE entries
// sourced 'you' (applied sum), not from the player-strike entries' dmg
// field — a killing blow ends the fight inside tbPlayerStrike, so its strike
// entry carries dmg: null while the damage entry carries the applied damage
// (r117 seed 1085 d24: strike dmg null, youDmg 35, "You STRIKE the heron
// for 35 (Hatchet)" / "The White Noise falls").
// Runs the REAL analyzer (child process) on (a) synthetic fixtures and
// (b) the three landing corpora, and asserts the shape counts.
//   BEFORE (r115 analyzer): r117 corpus gives 3 zero-DMG, B:2 S:1 — the S
//     is the 1085 d24 killing blow misread as struck-but-0-dmg.
//   AFTER (v2): r117 corpus gives 2 zero-DMG, both B; r115 corpus unchanged
//     (2, both B); r113 corpus gives 4 (B:3 S:1) — the 4 R82 phantom killing
//     blows drop out, Paul's S stays.
// Usage: node scripts/test-landing-r117-zerodmg-v2.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r117-zerodmg-v2.js');
const GOAL = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-07');

function runAnalyzer(dir) {
  const out = execSync(`node ${ANALYZER} ${dir}`, { encoding: 'utf8' });
  const panel = /PANEL: fights=(\d+) zeroDmg=(\d+)/.exec(out);
  const shapes = /byShape: (\{[^}]*\})/.exec(out);
  assert(panel, 'no PANEL line from analyzer on ' + dir);
  return { fights: +panel[1], zeroDmg: +panel[2], byShape: JSON.parse(shapes[1]) };
}

// (a) Synthetic fixtures: one census file, four fights.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zerodmg-v2-'));
const dmg = (targetKey, applied, sourceLabel, sourceKey) =>
  ({ turn: 'damage', targetKey, applied, sourceLabel, sourceKey: sourceKey || null });
const mturn = (monsterKey) =>
  ({ turn: 'monster-turn', monsterKey, monsterName: 'X', playerHpBefore: 100, playerHpAfter: 100, dmgTaken: 0, lines: [] });
const strike = (dmgVal, result) =>
  ({ turn: 'player-strike', targetKey: 'm_0', targetHpBefore: 27, targetHpAfter: null, dmg: dmgVal, result, lines: [] });
const census = {
  seed: 99999,
  fights81: [
    // Killing blow, dmg null on the strike entry (r117 seed 1085 d24 shape):
    // NOT zero-DMG — the scholar dealt 35 and killed it.
    { day: 1, endResult: 'won', rounds: 3, pendingFace: false, allies: 3,
      villagers: ['A'], monsters: [{ name: 'White Noise', wave: 1, hp: 0, maxHp: 67 }],
      turnOrder: ['p', 'v_a', 'm_0'],
      fightLog: [mturn('m_0'), dmg('m_0', 13, 'Adaeze'), mturn('m_0'),
        dmg('m_0', 4, 'Catalina'), dmg('m_0', 35, 'you'), strike(null, 'true')] },
    // B-shape: scholar stood through, 0 strikes, 2 monster turns, 3 rounds.
    { day: 2, endResult: 'won', rounds: 3, pendingFace: false, allies: 2,
      villagers: ['B'], monsters: [{ name: 'Sunback', wave: 1, hp: 0, maxHp: 63 }],
      turnOrder: ['p', 'v_b', 'm_0'],
      fightLog: [mturn('m_0'), dmg('m_0', 5, 'Samat'), mturn('m_0'), dmg('m_0', 101, 'Catalina')] },
    // S-shape (Paul shape): 8 strikes, all dmg 0, no 'you' damage — but
    // others DID deal damage (an ally's 10), so the fight is others-killed
    // shaped S, not the all-missed branch (which needs othersDmg == 0).
    { day: 3, endResult: 'lost', rounds: 5, pendingFace: false, allies: 0,
      villagers: [], monsters: [{ name: 'Focus Group', wave: 2, hp: 90, maxHp: 90 }],
      turnOrder: ['p', 'm_0'],
      fightLog: [mturn('m_0'), strike(0, 'true'), mturn('m_0'), strike(0, 'true'),
        mturn('m_0'), strike(0, 'true'), mturn('m_0'), strike(0, 'true'),
        mturn('m_0'), strike(0, 'true'), mturn('m_0'), strike(0, 'true'),
        mturn('m_0'), strike(0, 'true'), mturn('m_0'), strike(0, 'true'),
        dmg('m_0', 10, 'Adaeze')] },
    // A-shape: ended before any monster turn, 0 strikes, 1 round.
    { day: 4, endResult: 'won', rounds: 1, pendingFace: false, allies: 2,
      villagers: ['C'], monsters: [{ name: 'Raccoon', wave: 1, hp: 0, maxHp: 44 }],
      turnOrder: ['p', 'v_c', 'm_0'],
      fightLog: [dmg('m_0', 44, 'Catalina')] },
  ],
};
fs.writeFileSync(path.join(tmp, 'journey-landing-r62-census-99999.json'), JSON.stringify(census));
const fix = runAnalyzer(tmp);
assert.strictEqual(fix.fights, 4, 'fixtures: 4 fights, got ' + fix.fights);
assert.strictEqual(fix.zeroDmg, 3, 'fixtures: killing blow drops out, 3 zero-DMG, got ' + fix.zeroDmg);
assert.deepStrictEqual(fix.byShape,
  { 'B-scholar-stood-through': 1, 'S-struck-0-dmg': 1, 'A-allies-before-scholar-turn': 1 },
  'fixtures: shapes B:1 S:1 A:1, got ' + JSON.stringify(fix.byShape));
console.log('fixtures: PASS (killing-blow dmg:null drops out; B/S/A each 1)');

// (b) Corpus back-compat: the real corpora.
const r117 = runAnalyzer(path.join(GOAL, 'landing-r117'));
assert.strictEqual(r117.fights, 21, 'r117: 21 fights, got ' + r117.fights);
assert.strictEqual(r117.zeroDmg, 2, 'r117: 2 zero-DMG (S-artifact out), got ' + r117.zeroDmg);
assert.deepStrictEqual(r117.byShape, { 'B-scholar-stood-through': 2 },
  'r117: shapes B:2, got ' + JSON.stringify(r117.byShape));
console.log('r117 corpus: PASS (21 fights, 2 zero-DMG, both B)');

const r115 = runAnalyzer(path.join(GOAL, 'landing-r115'));
assert.strictEqual(r115.fights, 16, 'r115: 16 fights, got ' + r115.fights);
assert.strictEqual(r115.zeroDmg, 2, 'r115: 2 zero-DMG unchanged, got ' + r115.zeroDmg);
assert.deepStrictEqual(r115.byShape, { 'B-scholar-stood-through': 2 },
  'r115: shapes B:2, got ' + JSON.stringify(r115.byShape));
console.log('r115 corpus: PASS (16 fights, 2 zero-DMG, both B — unchanged)');

const r113 = runAnalyzer(path.join(GOAL, 'landing-r113'));
assert.strictEqual(r113.fights, 20, 'r113: 20 fights, got ' + r113.fights);
assert.strictEqual(r113.zeroDmg, 4, 'r113: 4 zero-DMG (phantoms out), got ' + r113.zeroDmg);
assert.deepStrictEqual(r113.byShape, { 'B-scholar-stood-through': 3, 'S-struck-0-dmg': 1 },
  'r113: shapes B:3 S:1, got ' + JSON.stringify(r113.byShape));
console.log('r113 corpus: PASS (20 fights, 4 zero-DMG, B:3 S:1 — phantoms out, Paul stays)');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('test-landing-r117-zerodmg-v2: PASS (fixtures + 3 corpora)');
