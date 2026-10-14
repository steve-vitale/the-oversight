#!/usr/bin/env node
// scripts/validate-regions.js — the world-region content validator
// (docs/WORLD-REGIONS.md §8 and §11). Run after any region content change:
//
//   node scripts/validate-regions.js            # all regions in src/data/regions.json
//   node scripts/validate-regions.js --quiet    # errors only
//
// Every region: metadata (id, name, continent, climateFamily, hemisphere,
// status, originTags, neighbors that exist). Every lifeseedRegions /
// landingVariants id it lists must exist.
// PLAYABLE / RICH regions also need the playable minimums:
//   biome with a forage table: >=12 edible plants (safe/caution/cook),
//     >=3 safe staples (edibility safe), >=2 toxic lookalikes (edibility avoid)
//   fauna: >=6 game animals (pool minus fish), >=2 fish, >=1 predator,
//     every id in animals.json; parasite hosts exist
//   flora: >=3 trees (nuts are real plants), >=2 bushes (real plants),
//     common trees are listed trees, bounty plants exist
//   climate: every season's weather sums to 1; season days add up to the
//     year length (365)
//   people: language exists, >=2 ruin stories, >=6 scavenge items
//     (id/name/kcal/kg, at least one non-rare), a pantry, >=4 village names
//   >=3 landing variants (locations.json), >=1 lifeseed region
//   monsters (variants), if listed, exist in monsters.json
// Also: every originPicker label resolves to a region (one origin vocabulary).
//
// As a module: require('./validate-regions').validateRegions(data) -> {errors, warnings, checked}
// where data = {regions, biomes, plants, animals, locations, lifeseeds, characterGen, originPicker, monsters}.
// Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const YEAR_DAYS = 365;
const STATUSES = ['stub', 'playable', 'rich'];
const MIN = { edible: 12, staples: 3, toxic: 2, game: 6, fish: 2, predators: 1, trees: 3, bushes: 2,
  ruins: 2, scavenge: 6, landings: 3, lifeseeds: 1, villageNames: 4 };

function loadData() {
  const D = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8'));
  return {
    regions: D('regions.json'), biomes: D('biomes.json'), plants: D('plants.json'), animals: D('animals.json'),
    locations: D('locations.json'), lifeseeds: D('lifeseeds.json'), characterGen: D('characterGen.json'),
    originPicker: D('originPicker.json'), monsters: D('monsters.json'),
  };
}

// Same matching as game.js parseOrigin + originRegionsForTags.
function originRegion(label, data) {
  const kw = (data.characterGen || {}).originKeywords || {};
  const lower = String(label).toLowerCase();
  const tags = new Set();
  for (const k of Object.keys(kw).sort((a, b) => b.length - a.length)) {
    if (lower.includes(k)) kw[k].forEach(t => tags.add(String(t).toLowerCase()));
  }
  let best = null;
  (data.regions || []).forEach((r, i) => {
    const n = (r.originTags || []).filter(t => tags.has(String(t).toLowerCase())).length;
    if (n && (!best || n > best.n)) best = { id: r.id, n, i };
  });
  return best ? best.id : null;
}

function validateRegions(data) {
  const errors = [];
  const warnings = [];
  const err = (rid, msg) => errors.push(`${rid}: ${msg}`);
  const regions = data.regions;
  if (!Array.isArray(regions)) return { errors: ['regions.json must be an array'], warnings, checked: 0 };
  const ids = new Set();
  const plantById = new Map((data.plants || []).map(p => [p.id, p]));
  const animalById = new Map((data.animals || []).map(a => [a.id, a]));
  const locIds = new Set((data.locations || []).map(l => l.id));
  const lsIds = new Set((((data.lifeseeds || {}).regions) || []).map(r => r.id));
  const langIds = new Set((((data.characterGen || {}).languages) || []).map(l => l.id));
  const monsterIds = new Set((data.monsters || []).map(m => m.id));
  for (const r of regions) {
    if (!r || !r.id) { errors.push('a region has no id'); continue; }
    if (ids.has(r.id)) err(r.id, 'duplicate id');
    ids.add(r.id);
  }
  for (const r of regions) {
    if (!r || !r.id) continue;
    const rid = r.id;
    // ---- metadata (every region) ----
    for (const f of ['name', 'continent', 'climateFamily']) if (!r[f] || typeof r[f] !== 'string') err(rid, `missing ${f}`);
    if (!['north', 'south'].includes(r.hemisphere)) err(rid, `hemisphere must be north|south (got ${r.hemisphere})`);
    if (!STATUSES.includes(r.status)) err(rid, `status must be one of ${STATUSES.join('/')} (got ${r.status})`);
    if (!Array.isArray(r.originTags)) err(rid, 'originTags must be an array');
    if (!Array.isArray(r.neighbors)) err(rid, 'neighbors must be an array');
    for (const n of (r.neighbors || [])) if (!ids.has(n)) err(rid, `neighbor ${n} is not a region`);
    for (const l of (r.lifeseedRegions || [])) if (!lsIds.has(l)) err(rid, `lifeseedRegions: ${l} not in lifeseeds.json regions`);
    for (const l of (r.landingVariants || [])) if (!locIds.has(l)) err(rid, `landingVariants: ${l} not in locations.json`);
    if (r.status === 'stub') continue;

    // ---- playable minimums ----
    const biome = (data.biomes || []).find(b => b.id === r.biome);
    if (!biome) err(rid, `biome ${r.biome} not in biomes.json`);
    const table = (biome && biome.forageTable) || {};
    let edible = 0, staples = 0, toxic = 0;
    for (const pid of Object.keys(table)) {
      const p = plantById.get(pid);
      if (!p) { err(rid, `forage plant ${pid} not in plants.json`); continue; }
      if (['safe', 'caution', 'cook'].includes(p.edibility)) edible++;
      if (p.edibility === 'safe') staples++;
      if (p.edibility === 'avoid') toxic++;
    }
    if (edible < MIN.edible) err(rid, `${edible} edible forage plants (need ${MIN.edible})`);
    if (staples < MIN.staples) err(rid, `${staples} safe staples (need ${MIN.staples})`);
    if (toxic < MIN.toxic) err(rid, `${toxic} toxic lookalikes (need ${MIN.toxic})`);

    const fa = r.fauna || {};
    const pool = new Set(fa.animals || []);
    for (const id of (fa.add || [])) pool.add(id);
    for (const id of (fa.remove || [])) pool.delete(id);
    for (const id of [...(fa.animals || []), ...(fa.add || []), ...(fa.remove || []), ...(fa.fish || []), ...(fa.predators || [])]) {
      if (!animalById.has(id)) err(rid, `animal ${id} not in animals.json`);
    }
    const fish = (fa.fish || []).filter(id => animalById.has(id));
    for (const id of fish) {
      const a = animalById.get(id);
      if (!(a.biomes || []).some(b => b === 'creek' || b === 'wetland')) err(rid, `fish ${id} lives in no creek/wetland`);
    }
    const game = [...pool].filter(id => !fish.includes(id) && animalById.has(id));
    if (game.length < MIN.game) err(rid, `${game.length} game animals (need ${MIN.game})`);
    if (fish.length < MIN.fish) err(rid, `${fish.length} fish (need ${MIN.fish})`);
    if ((fa.predators || []).length < MIN.predators) err(rid, `${(fa.predators || []).length} predators (need ${MIN.predators})`);
    for (const pid of Object.keys(fa.parasites || {})) {
      for (const host of Object.keys(fa.parasites[pid] || {})) {
        if (!animalById.has(host)) err(rid, `parasite ${pid} host ${host} not in animals.json`);
        const p = fa.parasites[pid][host];
        if (!(p >= 0 && p <= 1)) err(rid, `parasite ${pid} host ${host} chance ${p} not in 0..1`);
      }
    }
    if (fa.density != null && !(fa.density > 0)) err(rid, `fauna.density must be > 0`);

    const fl = r.flora || {};
    const trees = fl.trees || [];
    if (trees.length < MIN.trees) err(rid, `${trees.length} trees (need ${MIN.trees})`);
    trees.forEach((t, i) => {
      if (!t || !t.id) err(rid, `tree ${i} has no id`);
      if (t && t.nut && !plantById.has(t.nut)) err(rid, `tree ${t.id} nut ${t.nut} not in plants.json`);
      if (t && i < trees.length - 1 && !(t.roll > 0 && t.roll <= 1)) err(rid, `tree ${t.id} needs roll in (0,1] (all but the last tree)`);
    });
    const bushes = fl.bushes || [];
    if (bushes.length < MIN.bushes) err(rid, `${bushes.length} bushes (need ${MIN.bushes})`);
    for (const b of bushes) if (!plantById.has(b)) err(rid, `bush ${b} not in plants.json`);
    for (const c of (fl.commonTrees || [])) if (!trees.some(t => t.id === c)) err(rid, `common tree ${c} is not one of its trees`);
    for (const [ep, v] of Object.entries(fl.bounty || {})) {
      if (!Array.isArray(v) || !plantById.has(v[0])) err(rid, `bounty '${ep}' plant ${v && v[0]} not in plants.json`);
    }

    const seasons = ((r.climate || {}).seasons) || [];
    if (!seasons.length) err(rid, 'climate.seasons is empty');
    let days = 0;
    for (const s of seasons) {
      days += s.days || 0;
      if (!s.id) err(rid, 'a season has no id');
      if (!(s.days > 0)) err(rid, `season ${s.id} needs days > 0`);
      const w = s.weather || {};
      const sum = Object.values(w).reduce((t, x) => t + (x || 0), 0);
      if (Math.abs(sum - 1) > 1e-9) err(rid, `season ${s.id} weather sums to ${sum} (need 1)`);
    }
    if (seasons.length && days !== YEAR_DAYS) err(rid, `season days add up to ${days} (need ${YEAR_DAYS})`);

    const pe = r.people || {};
    if (!langIds.has(pe.language)) err(rid, `language ${pe.language} not in characterGen.languages`);
    if ((pe.ruins || []).length < MIN.ruins) err(rid, `${(pe.ruins || []).length} ruin stories (need ${MIN.ruins})`);
    const scav = pe.scavenge || [];
    if (scav.length < MIN.scavenge) err(rid, `${scav.length} scavenge items (need ${MIN.scavenge})`);
    for (const it of scav) {
      if (!it.id || !it.name || typeof it.kcal !== 'number' || typeof it.kg !== 'number') err(rid, `scavenge item ${it.id || '?'} needs id/name/kcal/kg`);
    }
    if (!scav.some(it => !it.rare)) err(rid, 'scavenge needs at least one non-rare item');
    const pantry = pe.pantry || [];
    if (!pantry.length) err(rid, 'people.pantry is empty');
    for (const it of pantry) {
      if (!it.name || typeof it.kcalEach !== 'number' || typeof it.units !== 'number' || typeof it.spoilDays !== 'number') err(rid, `pantry item ${it.name || '?'} needs name/kcalEach/units/spoilDays`);
    }
    if ((pe.villageNames || []).length < MIN.villageNames) err(rid, `${(pe.villageNames || []).length} village names (need ${MIN.villageNames})`);
    if ((r.landingVariants || []).length < MIN.landings) err(rid, `${(r.landingVariants || []).length} landing variants (need ${MIN.landings})`);
    if ((r.lifeseedRegions || []).length < MIN.lifeseeds) err(rid, `${(r.lifeseedRegions || []).length} lifeseed regions (need ${MIN.lifeseeds})`);
    for (const m of (r.monsters || [])) {
      const mid = typeof m === 'string' ? m : (m && m.id);
      if (!monsterIds.has(mid)) err(rid, `monster ${mid} not in monsters.json`);
    }
  }
  // One origin vocabulary: every picker label lands on a region.
  const picker = ((data.originPicker || {}).regions) || [];
  for (const c of picker) {
    for (const o of (c.origins || [])) {
      if (!originRegion(o.label, data)) err('originPicker', `"${o.label}" resolves to no region`);
    }
  }
  if (!regions.some(r => r && (r.status === 'playable' || r.status === 'rich'))) warnings.push('no playable region: every landing falls back to the default');
  return { errors, warnings, checked: regions.length };
}

module.exports = { validateRegions, loadData, originRegion, MIN, YEAR_DAYS };

if (require.main === module) {
  const quiet = process.argv.includes('--quiet');
  const data = loadData();
  const res = validateRegions(data);
  if (!quiet) {
    for (const r of data.regions) console.log(`  ${r.status === 'stub' ? '·' : '✓'} ${r.id} (${r.status})`);
  }
  for (const w of res.warnings) console.log('  warn: ' + w);
  for (const e of res.errors) console.log('  FAIL ' + e);
  console.log(`validate-regions: ${res.checked} regions, ${data.regions.filter(r => r.status !== 'stub').length} playable, ${res.errors.length} errors`);
  process.exit(res.errors.length ? 1 : 0);
}
