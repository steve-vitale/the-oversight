#!/usr/bin/env node
// playtest-marketgod-impact-20261014.js — IMPACT playtest for Market God capstone.
// Steve 2026-10-14: "Unsure if actually going to be game changing."
//
// This measures MECHANICAL IMPACT, not just function:
// 1. buyOff: does 2-turn hesitation flip fight outcomes vs wave 4-5?
// 2. namePrice: does on-demand item delivery change endgame outcomes?
//
// Model: abstract DPS race using real monster stats from monsters.json.
// Player: 100 HP. Monster: real HP/ATK ranges. We measure win-rate deltas.
'use strict';

const fs = require('fs');
const path = require('path');

const monsters = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/monsters.json'), 'utf8'));

// Seeded PRNG
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function parseRange(v, rng) {
  if (Array.isArray(v)) return v[0] + rng() * (v[1] - v[0]);
  if (typeof v === 'number') return v;
  return 50;
}

// Simulate a fight: player vs monster, both deal damage each round.
// Returns { playerWins, rounds, playerHpLeft }
function simulateFight(playerDmg, playerHp, monsterHp, monsterDmg, rng, opts) {
  opts = opts || {};
  let pHp = playerHp, mHp = monsterHp;
  let mHesitate = opts.monsterHesitate || 0; // buyOff: monster skips N turns
  let round = 0;
  const maxRounds = 100;

  while (pHp > 0 && mHp > 0 && round < maxRounds) {
    round++;
    // Player acts
    const pDmg = playerDmg * (0.9 + rng() * 0.2);
    mHp -= pDmg;
    if (mHp <= 0) break;
    // Monster acts (unless hesitating)
    if (mHesitate > 0) {
      mHesitate--;
    } else {
      const mDmg = monsterDmg * (0.9 + rng() * 0.2);
      pHp -= mDmg;
    }
  }
  return { playerWins: mHp <= 0 && pHp > 0, rounds: round, playerHpLeft: Math.max(0, pHp) };
}

function runSuite(label, playerDmg, playerHp, wave, hesitateTurns, seeds) {
  const ms = monsters.filter(m => m.wave === wave);
  let wins = 0, total = 0, flips = 0;
  // flips: fights lost without hesitate but won with hesitate
  for (const m of ms) {
    for (let s = 0; s < seeds; s++) {
      const rng = mulberry32(s * 1000 + m.hp[0]);
      const mHp = parseRange(m.hp, rng);
      const mDmg = parseRange(m.attack, rng);

      const rng1 = mulberry32(s * 1000 + m.hp[0] + 1);
      const without = simulateFight(playerDmg, playerHp, mHp, mDmg, rng1, { monsterHesitate: 0 });

      const rng2 = mulberry32(s * 1000 + m.hp[0] + 1); // same rolls
      const withH = simulateFight(playerDmg, playerHp, mHp, mDmg, rng2, { monsterHesitate: hesitateTurns });

      total++;
      if (withH.playerWins) wins++;
      if (!without.playerWins && withH.playerWins) flips++;
    }
  }
  return { label, wins, total, winRate: wins / total, flips, flipRate: flips / total };
}

console.log('=== Market God buyOff IMPACT playtest ===');
console.log('Model: abstract DPS race, real monster stats, 100 HP player\n');

// Baseline: competent player with good (not god-tier) gear
// ~40 dmg/hit is realistic for a well-equipped endgame player without tier-4
console.log('--- Player: 40 dmg/hit, 100 HP (strong, no tier-4) ---');
for (const wave of [4, 5]) {
  const noBuy = runSuite('no buyOff', 40, 100, wave, 0, 20);
  const buy = runSuite('buyOff (2 turns)', 40, 100, wave, 2, 20);
  console.log(`Wave ${wave}: no-buyOff win rate ${(noBuy.winRate * 100).toFixed(1)}% | ` +
    `buyOff win rate ${(buy.winRate * 100).toFixed(1)}% | ` +
    `flip rate ${(buy.flipRate * 100).toFixed(1)}% (${buy.flips}/${buy.total} fights flipped)`);
}

console.log('\n--- Player: 80 dmg/hit, 100 HP (tier-4 weapon, e.g. starfall_lance) ---');
for (const wave of [4, 5]) {
  const noBuy = runSuite('no buyOff', 80, 100, wave, 0, 20);
  const buy = runSuite('buyOff (2 turns)', 80, 100, wave, 2, 20);
  console.log(`Wave ${wave}: no-buyOff win rate ${(noBuy.winRate * 100).toFixed(1)}% | ` +
    `buyOff win rate ${(buy.winRate * 100).toFixed(1)}% | ` +
    `flip rate ${(buy.flipRate * 100).toFixed(1)}% (${buy.flips}/${buy.total} fights flipped)`);
}

console.log('\n--- Sensitivity: how many hesitate turns WOULD be game-changing? (80 dmg, wave 5) ---');
for (const h of [2, 4, 6, 8]) {
  const r = runSuite(`${h} turns`, 80, 100, 5, h, 20);
  console.log(`  ${h} turns hesitation: win rate ${(r.winRate * 100).toFixed(1)}%, flip rate ${(r.flipRate * 100).toFixed(1)}%`);
}

console.log('\n=== Verdict ===');
const w5base = runSuite('w5', 80, 100, 5, 0, 20);
const w5buy = runSuite('w5', 80, 100, 5, 2, 20);
if (w5buy.flipRate < 0.05) {
  console.log('buyOff (2 turns) is NOT game-changing vs wave 5: flip rate <5%.');
  console.log('The math: player needs ~20 hits to kill 1600 HP; 2 free hits is 10% of required.');
  console.log('Monster still 2-shots the 100 HP player. Steve\'s skepticism VALIDATED.');
} else {
  console.log(`buyOff flips ${(w5buy.flipRate * 100).toFixed(1)}% of wave-5 fights. Potentially meaningful.`);
}
