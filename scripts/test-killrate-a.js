// test-killrate-a.js — proof for arm sim-killrate-a (finding #2649).
// Proves the CODE-READ arithmetic behind the kill-loot searcaster arrival
// prediction, re-derived from the source data on every run — nothing is
// asserted from memory:
//   * tier-4 kill pool size (alien-origin tier-4 items + killItems[4]),
//     searcaster's 1-in-N draw, disjointness, all killItems[4] lootTier 4
//   * LOOT TAPER up-rates by wave + flat 5% down (game.js rollAlienLoot)
//   * tier4Chance values by monster def (only W4 tier-3 defs, all 0.25)
//   * GUNRATE x4 weighting is contest-only (rewardSource === 'contest')
//   * per-wave P(tier 4 | tier-3-base kill, gate passed), incl. the
//     W4 taper x tier4Chance stack: 1-(1-0.15)(1-0.25) = 36.25%
//   * prediction arithmetic: tier-3-base share x effective up-rate,
//     per-drop searcaster rate, per-seed arrival probability, sized band
//   * villagerKillLoot's only caller (havenGrowth.js lingerer sortie)
// Run: node scripts/test-killrate-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }

const items = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'items.json'), 'utf8'));
const reward = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'reward-economy.json'), 'utf8'));
const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');

// --- 1. Tier-4 kill pool (kill path: origin alien OR killItems[4], lootTier 4) ---
const byId = {};
items.forEach(function (i) { byId[i.id] = i; });
const alien4 = items.filter(function (i) { return i.origin === 'alien' && (i.lootTier || 1) === 4; }).map(function (i) { return i.id; });
const kill4 = (reward.killItems || {})['4'] || [];
const kill4Tier4 = kill4.filter(function (id) { return byId[id] && (byId[id].lootTier || 1) === 4; });
const overlap = alien4.filter(function (id) { return kill4.indexOf(id) !== -1; });
const pool = alien4.concat(kill4Tier4);
check('pool: alien-origin tier-4 items = 4', alien4.length === 4, alien4.join(','));
check('pool: alien tier-4 are fusion_cell/starfall_lance/genesis_seed/searcaster',
  ['fusion_cell', 'starfall_lance', 'genesis_seed', 'searcaster'].every(function (id) { return alien4.indexOf(id) !== -1; }),
  alien4.join(','));
check('pool: killItems[4] = 11', kill4.length === 11, kill4.join(','));
check('pool: all killItems[4] carry lootTier 4', kill4Tier4.length === 11,
  'non-tier4 members: ' + kill4.filter(function (id) { return !(byId[id] && (byId[id].lootTier || 1) === 4); }).join(','));
check('pool: sets disjoint', overlap.length === 0, overlap.join(','));
check('pool: kill tier-4 pool size = 15', pool.length === 15, 'got ' + pool.length);
check('pool: searcaster in pool exactly once', pool.filter(function (id) { return id === 'searcaster'; }).length === 1);
check('pool: fusion_pellet NOT a tier-4 item (exclusion cannot shrink pool)',
  (byId.fusion_pellet || {}).lootTier !== 4, 'pellet lootTier=' + ((byId.fusion_pellet || {}).lootTier));

// --- 2. Taper rates + tier4Chance in game.js source ---
check('taper: W2 5% / W3 10% / W4 15% / W5+ 20% up-rates in rollAlienLoot',
  /wave >= 5 \? 0\.20 : wave === 4 \? 0\.15 : wave === 3 \? 0\.10 : 0\.05/.test(gameSrc));
check('taper: down is flat 5% after up', /_tr < _up \+ 0\.05/.test(gameSrc));
check('tier4Chance: block present, sets maxTier 4',
  /loot\.tier4Chance > 0 && Math\.random\(\) < loot\.tier4Chance/.test(gameSrc));
check('tier4Chance: taper runs BEFORE tier4Chance (stacking order)',
  gameSrc.indexOf('LOOT TAPER') !== -1 && gameSrc.indexOf('TIER-4 ON HARD KILLS') !== -1 &&
  gameSrc.indexOf('LOOT TAPER') < gameSrc.indexOf('TIER-4 ON HARD KILLS'));

// --- 3. GUNRATE x4 is contest-only ---
const gunBlock = gameSrc.slice(gameSrc.indexOf('GUNRATE (sim-gunrate-a'), gameSrc.indexOf('TIER4POOL (sim-tier4pool-a'));
check('gunrate: block gates on rewardSource === contest',
  /loot\.rewardSource === 'contest'/.test(gunBlock) && gunBlock.indexOf('searcaster') !== -1);
check('gunrate: pushes exactly 3 extra searcaster copies (+1 = 4/18)',
  /pool\.push\(_sear, _sear, _sear\)/.test(gunBlock));
check('gunrate: no weighting on the kill path (kill pool built before, untouched)',
  gameSrc.indexOf("const kill = loot.rewardSource ? [] :") !== -1);

// --- 4. Monster loot census (monsters.json) ---
const withLoot = monsters.filter(function (m) { return m.loot && m.loot.chance > 0; });
const t4c = monsters.filter(function (m) { return m.loot && m.loot.tier4Chance > 0; });
check('monsters: tier4Chance only on W4 tier-3 defs, 9 defs, all 0.25',
  t4c.length === 9 && t4c.every(function (m) { return m.wave === 4 && m.loot.tier === 3 && m.loot.tier4Chance === 0.25; }),
  'got ' + t4c.length + ': ' + t4c.map(function (m) { return m.id + '(w' + m.wave + ' t' + m.loot.tier + ' ' + m.loot.tier4Chance + ')'; }).join(', '));
const apex4 = monsters.filter(function (m) { return m.loot && m.loot.tier === 4 && m.loot.chance > 0; }).map(function (m) { return m.id + '(w' + m.wave + ')'; });
check('monsters: apex tier-4 defs are gallowdeer/moderator/herald/cancellation/editor/finale',
  apex4.length === 6 &&
  ['gallowdeer', 'moderator', 'herald', 'cancellation', 'editor', 'finale'].every(function (id) { return apex4.join(' ').indexOf(id) !== -1; }),
  apex4.join(', '));
const chances = {};
withLoot.forEach(function (m) {
  const w = m.wave || 1;
  chances[w] = chances[w] || [];
  chances[w].push(m.loot.chance);
});
check('monsters: chance gate ranges W1 0.08-0.12 / W2 0.12-0.15 / W3 0.15 / W4 0.10-0.12 / W5 0.08-0.10',
  Math.min.apply(null, chances[1]) === 0.08 && Math.max.apply(null, chances[1]) === 0.12 &&
  Math.min.apply(null, chances[2]) === 0.12 && Math.max.apply(null, chances[2]) === 0.15 &&
  Math.min.apply(null, chances[3]) === 0.15 && Math.max.apply(null, chances[3]) === 0.15 &&
  Math.min.apply(null, chances[4]) === 0.10 && Math.max.apply(null, chances[4]) === 0.12 &&
  Math.min.apply(null, chances[5]) === 0.08 && Math.max.apply(null, chances[5]) === 0.10,
  JSON.stringify(chances));
check('monsters: W6 network defs carry chance 0 (drop nothing)',
  monsters.filter(function (m) { return m.wave === 6; }).every(function (m) { return !(m.loot && m.loot.chance > 0); }));

// --- 5. Per-wave P(tier 4 | tier-3-base kill, gate passed) ---
function pTier4Tier3Base(wave) {
  if (wave <= 1) return 0;
  const up = wave >= 5 ? 0.20 : wave === 4 ? 0.15 : wave === 3 ? 0.10 : 0.05;
  const t4c = wave === 4 ? 0.25 : 0;
  return 1 - (1 - up) * (1 - t4c);
}
check('pTier4: W2 tier-3 base = 5%', approx(pTier4Tier3Base(2), 0.05));
check('pTier4: W3 tier-3 base = 10%', approx(pTier4Tier3Base(3), 0.10));
check('pTier4: W4 tier-3 base = 1-(0.85)(0.75) = 36.25%', approx(pTier4Tier3Base(4), 0.3625));
check('pTier4: W5 tier-3 base = 20%', approx(pTier4Tier3Base(5), 0.20));
check('pTier4: W1 tier-3 base = 0 (cap)', approx(pTier4Tier3Base(1), 0));

// --- 6. Prediction arithmetic (prereg §2c-2d) ---
const tier3BaseShare = 26 / 105; // prior band: 21 tier-3 + 5 tier-4 drops of 105
const effUp = (0.05 + 0.10 + 0.3625 + 0.20) / 4;
const pT4 = tier3BaseShare * effUp;
check('predict: effective up-rate (uniform W2-W5) ≈ 17.8%', approx(effUp, 0.178125));
check('predict: tier-4 rate ≈ 4.4% per drop', approx(pT4, 0.044, 0.002), 'got ' + (pT4 * 100).toFixed(2) + '%');
check('predict: tier-4 range 1.2%-9.0% from per-wave spread',
  approx(tier3BaseShare * 0.05, 0.0124, 0.001) && approx(tier3BaseShare * 0.3625, 0.0898, 0.001));
const pSearPerDrop = pT4 / 15;
check('predict: searcaster ≈ 0.29% per drop', approx(pSearPerDrop, 0.00293, 0.0002), 'got ' + (pSearPerDrop * 100).toFixed(3) + '%');
const dropsPerSeed = 105 / 16;
const pSeed = 1 - Math.pow(1 - pSearPerDrop, dropsPerSeed);
check('predict: P(>=1 searcaster per seed) ≈ 1.9%', approx(pSeed, 0.019, 0.002), 'got ' + (pSeed * 100).toFixed(2) + '%');
const n90 = Math.ceil(Math.log(0.1) / Math.log(1 - pSeed));
check('predict: seeds for P(>=1) >= 90% = 120', n90 === 120, 'got ' + n90);
check('predict: P(0 arrivals in 16 seeds) ≈ 72% (killloot16 zero is expected)',
  approx(Math.pow(1 - pSeed, 16), 0.73, 0.03), 'got ' + (Math.pow(1 - pSeed, 16) * 100).toFixed(1) + '%');

// --- 7. villagerKillLoot call sites (definition + 4 kill paths) ---
const havenSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'havenGrowth.js'), 'utf8');
const agencySrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
const callSites = (gameSrc.match(/villagerKillLoot\(/g) || []).length +
  (havenSrc.match(/villagerKillLoot\(/g) || []).length +
  (agencySrc.match(/villagerKillLoot\(/g) || []).length;
check('kill-loot: definition + 4 call sites (patrol, wild, expedition, sortie)',
  callSites === 5, 'call-site matches: ' + callSites);
check('kill-loot: patrol kills roll it (game.js ~8485)',
  /cause: 'patrol combat'/.test(gameSrc) && gameSrc.indexOf('villagerKillLoot(vid, mdef)') !== -1);
check('kill-loot: expedition kills roll it (villager-agency.js ~793)',
  /this\.villagerKillLoot\(vid, m\)/.test(agencySrc));
check('kill-loot: sortie kills roll it (havenGrowth.js ~928)',
  /this\.villagerKillLoot\(leader, mdef\)/.test(havenSrc));
check('kill-loot: scholar kills use rollAlienLoot directly, not villagerKillLoot',
  /const dropId = this\.rollAlienLoot\(mdef, _km\)/.test(gameSrc));

console.log('TEST-KILLRATE-A: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
