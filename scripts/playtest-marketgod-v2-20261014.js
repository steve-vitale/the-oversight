#!/usr/bin/env node
// playtest-marketgod-v2-20261014.js — Design iteration playtest (clean rewrite).
'use strict';
const fs = require('fs');
const path = require('path');
const monsters = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/monsters.json'), 'utf8'));

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
  return v || 50;
}

function simulateFight(playerDmg, monsterHp, monsterDmg, seed, opts) {
  const rng = mulberry32(seed);
  let pHp = 100, mHp = monsterHp;
  let coinPool = (opts.coins || 0) * (opts.coinAbsorb || 60);
  let round = 0;
  if (opts.safePassage) return 'flee';
  while (pHp > 0 && mHp > 0 && round < 100) {
    round++;
    mHp -= playerDmg * (0.9 + rng() * 0.2);
    if (mHp <= 0) break;
    let dmg = monsterDmg * (0.9 + rng() * 0.2);
    if (coinPool > 0) {
      const absorbed = Math.min(coinPool, dmg);
      coinPool -= absorbed;
      dmg -= absorbed;
    }
    pHp -= dmg;
  }
  if (mHp <= 0 && pHp > 0) return 'win';
  if (pHp <= 0) return 'die';
  return 'timeout';
}

function runSuite(playerDmg, wave, opts, seeds) {
  const ms = monsters.filter(m => m.wave === wave);
  let win = 0, flee = 0, die = 0;
  for (const m of ms) {
    for (let s = 0; s < seeds; s++) {
      const rng = mulberry32(s * 777 + Math.floor(m.hp[0]));
      const mHp = parseRange(m.hp, rng);
      const mDmg = parseRange(m.attack, rng);
      const outcome = simulateFight(playerDmg, mHp, mDmg, s * 999 + Math.floor(mHp), opts);
      if (outcome === 'win') win++;
      else if (outcome === 'flee') flee++;
      else die++;
    }
  }
  const total = win + flee + die;
  return { winRate: win / total, surviveRate: (win + flee) / total, deathRate: die / total };
}

console.log('=== Market God v2 design playtest ===');
console.log('Player: 80 dmg/hit, 100 HP. Unavoidable fights.\n');

const configs = [
  ['Baseline (no godhood)', {}],
  ['Gilded Guard: 4 coins x 60', { coins: 4, coinAbsorb: 60 }],
  ['Gilded Guard: 6 coins x 60', { coins: 6, coinAbsorb: 60 }],
  ['Buy Safe Passage', { safePassage: true }],
];

for (const [label, opts] of configs) {
  const w4 = runSuite(80, 4, opts, 15);
  const w5 = runSuite(80, 5, opts, 15);
  console.log(label + ':');
  console.log('  Wave 4: win ' + (w4.winRate * 100).toFixed(1) + '% | survive ' + (w4.surviveRate * 100).toFixed(1) + '% | die ' + (w4.deathRate * 100).toFixed(1) + '%');
  console.log('  Wave 5: win ' + (w5.winRate * 100).toFixed(1) + '% | survive ' + (w5.surviveRate * 100).toFixed(1) + '% | die ' + (w5.deathRate * 100).toFixed(1) + '%');
}
