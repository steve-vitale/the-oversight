#!/usr/bin/env node
// test-loot-taper.js — proof for the loot taper (Steve 2026-11-02).
// Seeded Math.random around rollAlienLoot calls only; 20,000 rolls per
// sampled def. Run on baseline: taper cases FAIL (up-rate 0). Run after
// the fix: up-rates match the prereg wave scale, down-rate ~5%.
// Usage: node scripts/test-loot-taper.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const UP = { 2: 0.05, 3: 0.10, 4: 0.15, 5: 0.20 };
const N = 20000;
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}
async function main() {
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  const monsters = (Game.data.monsters || []).filter(m => m && m.loot && m.loot.chance > 0);
  const items = Game.data.items || [];
  const tierOf = (id) => { const d = items.find(i => i.id === id); return d ? (d.lootTier || 1) : null; };
  const realRandom = Math.random;
  function sample(def, fighter) {
    const counts = {};
    let grants = 0;
    Math.random = mulberry32(424242);
    try {
      for (let i = 0; i < N; i++) {
        const id = Game.rollAlienLoot(def, fighter || {});
        if (id) { grants++; const t = tierOf(id); counts[t] = (counts[t] || 0) + 1; }
      }
    } finally { Math.random = realRandom; }
    return { grants, counts };
  }
  // Taper sample: non-apex, non-tier4Chance, tier-3 defs per wave 2-5.
  const sampleDefs = [];
  for (const w of [2, 3, 4, 5]) {
    const defs = monsters.filter(m => (m.wave || 1) === w && !m.apex && !(m.loot.tier4Chance > 0) && m.loot.tier === 3);
    for (const d of defs.slice(0, 4)) sampleDefs.push(d);
  }
  console.log('taper sample defs: ' + sampleDefs.map(d => d.id + '(w' + d.wave + ')').join(', '));
  for (const def of sampleDefs) {
    const { grants, counts } = sample(def);
    const up = (counts[4] || 0) / Math.max(1, grants);
    const down = (counts[2] || 0) / Math.max(1, grants);
    const want = UP[def.wave];
    check('taper-up ' + def.id + ' w' + def.wave, Math.abs(up - want) <= 0.04,
      'up=' + up.toFixed(3) + ' want~' + want + ' grants=' + grants + ' counts=' + JSON.stringify(counts));
    check('taper-down ' + def.id + ' w' + def.wave, down >= 0.02 && down <= 0.12,
      'down=' + down.toFixed(3) + ' grants=' + grants);
    check('taper-bounds ' + def.id, Object.keys(counts).every(t => t >= 1 && t <= 4),
      'counts=' + JSON.stringify(counts));
  }
  // Apex: always tier 4.
  for (const def of monsters.filter(m => m.apex)) {
    const { grants, counts } = sample(def);
    check('apex ' + def.id, grants > 0 && Object.keys(counts).length === 1 && counts[4] === grants,
      'grants=' + grants + ' counts=' + JSON.stringify(counts));
  }
  // Wave-1: never above tier 2 (non-veteran).
  for (const def of monsters.filter(m => (m.wave || 1) <= 1 && !m.apex).slice(0, 4)) {
    const { grants, counts } = sample(def);
    check('wave1-cap ' + def.id, Object.keys(counts).every(t => t <= 2),
      'grants=' + grants + ' counts=' + JSON.stringify(counts));
  }
  // RewardSource: never tapers — always exactly the base tier.
  const prize = { wave: 3, loot: { chance: 1, tier: 2, rewardSource: 'contest' } };
  {
    const { grants, counts } = sample(prize);
    check('prize-no-taper', grants === N && Object.keys(counts).length === 1 && counts[2] === N,
      'grants=' + grants + ' counts=' + JSON.stringify(counts));
  }
  // Wave-6 network: chance 0 by design, always null.
  for (const def of (Game.data.monsters || []).filter(m => m && m.loot && !(m.loot.chance > 0)).slice(0, 3)) {
    const { grants } = sample(def);
    check('wave6-zero ' + def.id, grants === 0, 'grants=' + grants);
  }
  // tier4Chance mechanism intact (loose: it still pays tier 4).
  const t4 = monsters.find(m => m.loot.tier4Chance > 0);
  if (t4) {
    const { grants, counts } = sample(t4);
    const share = (counts[4] || 0) / Math.max(1, grants);
    check('tier4Chance-intact ' + t4.id, share > 0.15,
      't4share=' + share.toFixed(3) + ' grants=' + grants + ' counts=' + JSON.stringify(counts));
  }
  // W4: every T3 def carries tier4Chance, so the taper composes with it:
  // P(T4) = up + (1-up)*0.25 = 0.3625; P(T2) = down*(1-0.25) = 0.0375.
  const w4t4 = monsters.find(m => (m.wave || 1) === 4 && m.loot.tier === 3 && m.loot.tier4Chance > 0);
  if (w4t4) {
    const { grants, counts } = sample(w4t4);
    const up = (counts[4] || 0) / Math.max(1, grants);
    const down = (counts[2] || 0) / Math.max(1, grants);
    check('taper-compose-w4 ' + w4t4.id, Math.abs(up - 0.3625) <= 0.04,
      'up=' + up.toFixed(3) + ' want~0.3625 grants=' + grants + ' counts=' + JSON.stringify(counts));
    check('taper-compose-w4-down ' + w4t4.id, down >= 0.01 && down <= 0.08,
      'down=' + down.toFixed(3) + ' grants=' + grants);
  }
  console.log(failures === 0 ? 'ALL TAPER CHECKS PASSED' : failures + ' TAPER CHECK(S) FAILED');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
