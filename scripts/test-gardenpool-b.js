#!/usr/bin/env node
// test-gardenpool-b.js — proof for sim-gardenpool-b (garden-pooling
// timing). Live checks on a harness game (NON-JUDGED seed 74099;
// judged bands are 74001-74008 pilot, 74101-74112 confirm):
//   A. a fitting ripe plot still goes to the pack (control);
//   B. an overflowing FINISHED plot pools straight to the pantry
//      (pack unchanged, pantry up by the plot's kcal, narration
//      names the kg and the pantry);
//   C. an overflowing UNPROCESSED (unknown) plot DEFERS: plot
//      stays ripe on its bed, pack and pantry unchanged, narration
//      names the deferral;
//   D. an overflowing finished plot DEFERS when the pantry is full;
//   E. no-loss: plots are never dropped in any case.
// Plus code anchors: harvestGarden gates on canCarry, pools via
// depositPantryPieces, and the carryCapacity base is still 20
// (the 20 -> 40 landing value is a separate decision, not this arm).
// Usage: node scripts/test-gardenpool-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

async function main() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 74099, mode: 'gardenpool-b', fullTelemetry: false });
  await setupGame(Game);
  const S = Game.state.scholar, V = Game.state.village;
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function (...args) {
    try { sayLines.push(String(args[0] || '')); } catch (e) {}
    return origSay.apply(this, args);
  };
  const saySince = (from) => sayLines.slice(from);
  // Stand on the haven tile, outside the hall: gardenWorkGate's terms.
  Game.map.px = 4; Game.map.py = 4; S.insideHaven = false;
  check('scholar stands on the haven tile', () => {
    assert.strictEqual(Game.playerTile() && Game.playerTile().type, 'haven');
    assert.strictEqual(Game.gardenWorkGate().ok, true);
  });
  const PID = 'blackberry';
  const plant = (Game.data.plants || []).find((p) => p.id === PID);
  assert(plant, 'blackberry plant def exists');
  assert.strictEqual(plant.edibility, 'safe');
  // Known plant: codex level >= 1 is plantKnown's rule.
  Game.state.codex.plants[PID] = { level: 1, identifiedDay: 0, harvests: 0, tastings: 0 };
  assert.strictEqual(Game.plantKnown(PID), true);
  assert.strictEqual(Game.plantKnown('dandelion'), false);

  const plots = Game.gardenPlots();
  const cap = () => Game.packCapacity();
  const wt = () => Game.packWeight();
  const pantryKcal = () => Game.pantryKcal();
  function ripePlot(pid, day) {
    // Legacy profile (no cultivation v1): maturity by form, regrow 3d.
    // plantedDay 0 + day 30 => ripe for any form (max maturity 14).
    return { pid, plantedDay: 0, lastTend: day, lastHarvest: 0, weeds: 0, dead: false };
  }
  function clearPlots() { plots.length = 0; }
  function fillPackTo(kg) {
    S.inventory.length = 0;
    const units = Math.max(0, Math.floor(kg / 0.5));
    if (units) S.inventory.push({ name: 'Branch', units, kg: 0.5 });
    return wt();
  }
  function fillPantryToCap() {
    V.pantry = V.pantry || [];
    let guard = 0;
    while (pantryKcal() < Game.pantryCapKcal() && guard++ < 500) {
      V.pantry.push({ name: 'Foraged food', kcalEach: 200, units: 50, spoilDay: 9999, safe: true, kg: 0.2 });
    }
  }

  // --- Case A: fitting plot -> pack (control).
  {
    S.day = 30; clearPlots(); S.inventory.length = 0; V.pantry = [];
    plots.push(ripePlot(PID, 30));
    const beforePlots = plots.length, from = sayLines.length;
    const res = Game.harvestGarden();
    assert(res, 'harvestGarden returns status');
    assert.strictEqual(plots.length, beforePlots, 'no plot dropped');
    assert.strictEqual(plots[0].lastHarvest, 30, 'plot taken');
    const packed = S.inventory.find((i) => i.plantId === PID);
    assert(packed && packed.units > 0, 'ripe plot packed');
    assert(saySince(from).some((l) => /^Harvest: /.test(l)), 'Harvest line said');
    console.log('ok - A: fitting plot goes to pack (' + packed.units + ' units, ' + packed.units * 0.1 + ' kg)');
    pass++;
  }
  // --- Case B: overflowing finished plot -> pantry.
  {
    S.day = 31; clearPlots();
    const c = cap();
    fillPackTo(c - 5); // +11.1 kg plot cannot fit
    const packBefore = wt(), panBefore = pantryKcal();
    plots.push(ripePlot(PID, 31));
    const plotUnits = Game.gardenHarvestUnits(plots[0]);
    const plotKg = Math.round(plotUnits * 0.1 * 10) / 10;
    assert(wt() + plotKg > c, 'plot genuinely overflows: pack ' + wt() + ' + ' + plotKg + ' > cap ' + c);
    const from = sayLines.length;
    Game.harvestGarden();
    assert.strictEqual(plots[0].lastHarvest, 31, 'pooled plot taken');
    assert.strictEqual(Math.round(wt() * 10) / 10, Math.round(packBefore * 10) / 10, 'pack unchanged by pooling');
    const panDelta = pantryKcal() - panBefore;
    assert(panDelta > 0, 'pantry gained kcal');
    assert.strictEqual(panDelta, plotUnits * plant.caloriesPerUnit, 'pantry delta == plot kcal (got ' + panDelta + ')');
    const lines = saySince(from);
    assert(lines.some((l) => /goes straight to the pantry/.test(l)), 'pooled narration names pantry: ' + JSON.stringify(lines));
    assert(lines.some((l) => new RegExp(plotKg + ' kg').test(l)), 'pooled narration names kg');
    console.log('ok - B: overflowing finished plot pooled to pantry (+' + panDelta + ' kcal, pack ' + packBefore + ' -> ' + wt() + ')');
    pass++;
  }
  // --- Case C: overflowing unknown plot -> defer on the bed.
  {
    S.day = 32; clearPlots();
    const c = cap();
    fillPackTo(c - 5);
    const packBefore = wt(), panBefore = pantryKcal();
    plots.push(ripePlot('dandelion', 32));
    assert.strictEqual(Game.plantKnown('dandelion'), false);
    const from = sayLines.length;
    Game.harvestGarden();
    assert.strictEqual(plots.length, 1, 'deferred plot not dropped');
    assert.strictEqual(plots[0].pid, 'dandelion', 'deferred plot keeps its crop');
    assert.notStrictEqual(plots[0].lastHarvest, 32, 'deferred plot NOT taken');
    assert.strictEqual(Game.plotRipe(plots[0], 32), true, 'deferred plot still ripe');
    assert.strictEqual(Math.round(wt() * 10) / 10, Math.round(packBefore * 10) / 10, 'pack unchanged by deferral');
    assert.strictEqual(pantryKcal(), panBefore, 'pantry unchanged by deferral');
    const lines = saySince(from);
    assert(lines.some((l) => /stays in its bed/.test(l)), 'deferral narration: ' + JSON.stringify(lines));
    console.log('ok - C: overflowing unknown plot deferred on its bed, still ripe');
    pass++;
  }
  // --- Case D: pantry full -> finished plot defers too.
  {
    S.day = 33; clearPlots();
    fillPantryToCap();
    assert(pantryKcal() >= Game.pantryCapKcal(), 'pantry full');
    const c = cap();
    fillPackTo(c - 5);
    const packBefore = wt(), panBefore = pantryKcal();
    plots.push(ripePlot(PID, 33));
    const from = sayLines.length;
    Game.harvestGarden();
    assert.strictEqual(plots.length, 1, 'pantry-full plot not dropped');
    assert.notStrictEqual(plots[0].lastHarvest, 33, 'pantry-full plot NOT taken');
    assert.strictEqual(Game.plotRipe(plots[0], 33), true, 'pantry-full plot still ripe');
    assert.strictEqual(Math.round(wt() * 10) / 10, Math.round(packBefore * 10) / 10, 'pack unchanged');
    assert.strictEqual(pantryKcal(), panBefore, 'pantry unchanged');
    const lines = saySince(from);
    assert(lines.some((l) => /stays in its bed/.test(l) && /pantry/.test(l)), 'pantry-full deferral narration: ' + JSON.stringify(lines));
    console.log('ok - D: pantry-full finished plot deferred, still ripe');
    pass++;
  }
  // --- Case E: deferral narrates once per day across workGarden's double harvest.
  {
    S.day = 34; clearPlots(); V.pantry = [];
    fillPackTo(cap() - 5);
    plots.push(ripePlot('dandelion', 34));
    const from = sayLines.length;
    Game.harvestGarden();
    Game.harvestGarden();
    const defers = saySince(from).filter((l) => /stays in its bed/.test(l));
    assert.strictEqual(defers.length, 1, 'one deferral line per day, got ' + defers.length);
    console.log('ok - E: deferral narrates once per day, not twice');
    pass++;
  }
  // --- Code anchors (no silent bypass, no cap change).
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
  const hv = src.slice(src.indexOf('harvestGarden() {'), src.indexOf('gardenTick()'));
  check('harvestGarden gates on canCarry', () => assert(hv.includes('canCarry(plotKg)')));
  check('harvestGarden pools via depositPantryPieces', () => assert(hv.includes('depositPantryPieces(v,')));
  check('harvestGarden defers without gardenHarvestTaken on the else path', () => assert(hv.includes('DEFER: no push, no gardenHarvestTaken')));
  check('carryCapacity base still 20 (no cap change in this arm)', () => {
    const cc = src.slice(src.indexOf('carryCapacity() {'), src.indexOf('carryCapacity() {') + 400);
    assert(cc.includes('let cap = 20;'), 'base must stay 20');
  });
  console.log('gardenpool proof: ' + pass + ' checks passed');
}
main().catch((e) => { console.error('GARDENPOOL PROOF CRASH', e && (e.stack || e)); process.exit(2); });
