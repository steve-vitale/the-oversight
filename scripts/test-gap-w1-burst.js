#!/usr/bin/env node
// test-gap-w1-burst.js — proof for gap-phase2 W1 line 353 (fightAssessRace
// burst term). The raidassess modal death: a counter-known scholar trades
// blows and eats max-roll hits for the rounds the kill takes (4 hits /
// 103 dmg), while the average discounted race prices the fight winnable.
// Case: gallowdeer (codex slain -> counter discount x0.7 on average DPR),
// machete-armed scholar (player DPR 48), 160 HP deer, 95 HP scholar.
//   Old race: monsterDPR 17.5, roundsToKill 3.3, roundsToDie 5.4 -> HOLD
//     (not lostRace, not deadInTwo).
//   Burst term: kill window at max rolls = 3.3 rounds x 30 max = 100 >= 95
//     -> DECLINE. At 110 HP the same window (100) does not kill -> HOLD.
// Usage: node scripts/test-gap-w1-burst.js (from the repo root)
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const monsters = require(path.join(REPO, 'src/data', 'monsters.json'));
const C = require(path.join(REPO, 'scripts', 'policies', 'competent.js'));

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function mockGame(opts) {
  opts = opts || {};
  return {
    state: { codex: { monsters: opts.codexMonsters || {} }, scholar: { hp: opts.hp || 100, health: opts.hp || 100 } },
    data: { monsters },
    equippedWeapon: () => ({ bonus: opts.bonus || 0 }),
  };
}
function fighter(mid, hp) {
  const def = monsters.find(d => d.id === mid);
  const h = hp || (def && def.hp ? Math.round((def.hp[0] + def.hp[1]) / 2) : 100);
  return { kind: 'monster', hp: h, maxHp: h, monsterId: mid };
}

{
  const G = mockGame({ bonus: 35, codexMonsters: { gallowdeer: { stage: 'slain' } } });
  const race = C.fightAssessRace(G, {}, [fighter('gallowdeer', 160)], { hp: 95, maxHp: 95 });
  ok('burst: discounted average race alone holds', race.detail.lostRace === false && race.detail.deadInTwo === false,
    JSON.stringify(race.detail));
  ok('burst: burstDPR is the undiscounted max (30)', race.detail.burstDPR === 30,
    `burstDPR=${race.detail.burstDPR}`);
  ok('burst: kill window 100 >= 95 HP', race.detail.burstKill === true,
    `burstWindow=${race.detail.burstWindow}`);
  ok('burst: verdict flips to decline', race.decline === true, JSON.stringify(race.detail));
}
{
  const G = mockGame({ bonus: 35, codexMonsters: { gallowdeer: { stage: 'slain' } } });
  const race = C.fightAssessRace(G, {}, [fighter('gallowdeer', 160)], { hp: 110, maxHp: 110 });
  ok('burst: window 100 < 110 HP holds', race.detail.burstKill === false && race.decline === false,
    JSON.stringify(race.detail));
}
{
  // Regression: the r1 winnable case still holds (weak monster, strong scholar).
  const G = mockGame({ bonus: 35, codexMonsters: { ducks_in_a_row: { stage: 'slain' } } });
  const race = C.fightAssessRace(G, {}, [fighter('ducks_in_a_row', 40)], { hp: 110, maxHp: 110 });
  ok('burst: r1 winnable case still holds', race.decline === false, JSON.stringify(race.detail));
}
console.log(`\n${pass} pass, ${fail} fail`);
if (fail) process.exit(1);
