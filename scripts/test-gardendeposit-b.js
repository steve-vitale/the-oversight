#!/usr/bin/env node
// test-gardendeposit-b.js — proof for sim-gardendeposit-b (DIAG, no sims).
// Re-derives the traced set from the 2026-10-26 stock9762 corpus file alone
// (never from the analyst's notes) and grep-anchors every named code path in
// the worktree source. Exit 0 only if every check passes.
// Usage: node scripts/test-gardendeposit-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra || ''); }
}
const corpus = path.join(root, 'evidence', '2026-10-26', 'sim-stock9762-b-corpus');
const load = s => JSON.parse(fs.readFileSync(path.join(corpus,
  `stock9762-b-competent-nofeast-s${s}.json`), 'utf8'));
const d = load(9762);
const gi = d.gardenEvents.gardenInflows;

// (a) Re-derivation of the traced set.
check('9762 gardenInflows count == 129', gi.length === 129, 'got ' + gi.length);
check('9762 gardenInflows kcal == 396750',
  gi.reduce((a, r) => a + (r.kcal || 0), 0) === 396750);
check('9762 unclassified (missing door or name) == 0',
  gi.filter(r => !r.door || !r.name).length === 0);
check('9762 doors: deposit 129, stock 0, pantryAdd 0',
  gi.filter(r => r.door === 'deposit').length === 129 &&
  gi.filter(r => r.door === 'stock').length === 0 &&
  gi.filter(r => r.door === 'pantryAdd').length === 0);
check('9762 names: Lamb\'s Quarters 129',
  gi.filter(r => r.name === "Lamb's Quarters").length === 129);
check('9762 day range 20..100',
  Math.min(...gi.map(r => r.day)) === 20 && Math.max(...gi.map(r => r.day)) === 100);
check('9762 distinct deposit days == 71', new Set(gi.map(r => r.day)).size === 71);

// (b) Cross-checks against the independent inflows instrument.
const infDepLQ = d.inflows.filter(r => r.door === 'deposit' && r.name === "Lamb's Quarters");
check('inflows deposit-LQ count == gardenInflows count', infDepLQ.length === gi.length);
check('inflows deposit-LQ kcal == gardenInflows kcal',
  infDepLQ.reduce((a, r) => a + (r.kcal || 0), 0) === 396750);
check('inflows stock Garden harvest == 0',
  d.inflows.filter(r => r.door === 'stock' && r.name === 'Garden harvest').length === 0);
check('gardenInflows pantryAdd == 0 despite 6 pantryAdd inflows on 9762',
  d.inflows.filter(r => r.door === 'pantryAdd').length === 6 &&
  gi.filter(r => r.door === 'pantryAdd').length === 0);

// Band context (not judged, reported): all garden-attributed records deposit-door.
let bandN = 0, bandStock = 0, bandPantryAdd = 0, bandUncl = 0;
for (const s of [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767]) {
  const recs = load(s).gardenEvents.gardenInflows;
  bandN += recs.length;
  bandStock += recs.filter(r => r.door === 'stock').length;
  bandPantryAdd += recs.filter(r => r.door === 'pantryAdd').length;
  bandUncl += recs.filter(r => !r.door || !r.name).length;
}
check('band gardenInflows total == 276, stock 0, pantryAdd 0, unclassified 0',
  bandN === 276 && bandStock === 0 && bandPantryAdd === 0 && bandUncl === 0,
  `n=${bandN} stock=${bandStock} pantryAdd=${bandPantryAdd} uncl=${bandUncl}`);

// Timing: harvest precedes deposits; ripe never stands at snapshot.
const harvDays = new Set(d.gardenDays.filter(g => g.plots.some(p => p.lastHarvest === g.day)).map(g => g.day));
check('first snapshot harvest day (17) precedes first deposit day (20)',
  Math.min(...harvDays) === 17 && Math.min(...gi.map(r => r.day)) === 20);
check('end-of-day ripe max == 0 on all 100 gardenDays',
  Math.max(...d.gardenDays.map(g => g.ripe)) === 0);
check('no snapshot plot with growthLeft <= 0',
  d.gardenDays.filter(g => g.plots.some(p => p.growthLeft != null && p.growthLeft <= 0)).length === 0);
check('9762 garden resolutions throttle-engaged 99/99',
  d.gardenEvents.resolutions.length === 99 &&
  d.gardenEvents.resolutions.filter(r => r.throttle).length === 99);
check('9762 NPC sows == 0, player LQ sows == 28',
  d.gardenEvents.npcSows.length === 0 &&
  d.gardenEvents.sows.filter(s => s.pid === 'lambs_quarters').length === 28);

// (c) Code anchors: every named path must exist verbatim in source.
const src = f => fs.readFileSync(path.join(root, f), 'utf8');
const game = src('src/js/game.js');
const cult = src('src/js/gardenCultivation.js');
const food = src('src/js/food.js');
const policy = src('scripts/policies/competent.js');
check('anchor: harvestGarden mints gardenShares from the plot',
  game.includes('item.gardenShares = this.gardenHarvestOrigin(p);'));
check('anchor: gardenHarvestOrigin returns assisted/ordinary from magic',
  cult.includes('gardenHarvestOrigin(plot)'));
check('anchor: plotRipe is growthLeft <= 0 (transient intra-day state)',
  game.includes('return this.gardenGrowthLeft(plot, day) <= 0;'));
check('anchor: gardenHarvestTaken stamps lastHarvest and resets magic',
  cult.includes('gardenHarvestTaken(plot, harvestedDay)'));
check('anchor: NPC stock door is named Garden harvest',
  game.includes("this.stockPantry(kcal, 'Garden harvest'"));
check('anchor: NPC stock door harvests only edibility safe crops',
  game.includes("?.edibility === 'safe'"));
check('anchor: donateToPantry moves the pack item via depositPantryPieces',
  game.includes('this.depositPantryPieces(v, donated, 500);'));
check('anchor: policy workGarden harvests, then donates the haul',
  policy.includes('Game.harvestGarden();') && policy.includes('donateHaul(Game,ctx);'));
check('anchor: policy workGarden coaxes (cultivate) between harvests',
  policy.includes('Game.cultivateGarden();'));
check('anchor: blendGardenShares only propagates existing shares (no plot input)',
  food.includes('blendGardenShares(parts)') &&
  food.includes("p.item?.gardenShares?.[key]"));
check('anchor: LQ edibility is caution, not safe (NPC door closed for LQ)',
  (() => { const plants = JSON.parse(fs.readFileSync(
    path.join(root, 'src/data/plants.json'), 'utf8'));
    const lq = plants.find(p => p.id === 'lambs_quarters');
    return lq && lq.edibility === 'caution'; })());

console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
