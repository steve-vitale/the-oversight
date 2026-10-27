#!/usr/bin/env node
// DIAGNOSTIC ONLY (not the proof): measure the monster-meat channel mechanics
// before choosing a fix. One world, one species per scenario, state reset
// between scenarios. Run: node scripts/test-meatchannel-measure-20261027.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function show(name, val, note) {
  console.log(`${name}: ${val}${note ? ' — ' + note : ''}`);
}
function haulItem(mid, gross, units) {
  // Exact shape of the villager-mapmem haul deposit (no spoilDay).
  const net = Math.round(gross * 0.4);
  const u = units || Math.max(1, Math.ceil(net / 500));
  return {
    name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_' + mid, edible: false, kcalEach: 0, hiddenKcal: gross,
    units: u, unit: 'portion',
    kg: Math.max(0.01, 0.5 * 0.4),
    prep: 'Unknown flesh. Test it cautiously.',
    diseaseRisk: 'rawMeat',
  };
}

(async () => {
  const { Game } = await loadGame({ seed: 20261027, mode: 'meat-measure' });
  await setupGame(Game);
  const day = () => (Game.state.scholar || {}).day || 0;
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  console.log('setup: day=' + day() + ' liveVillager=' + !!vid + ' playerAtHaven=' + Game.playerAtHaven());
  Game.nearFire = () => true; // accepted probe stub (existing tests do this)
  const V = () => Game.state.village;
  const resetCodex = () => { Game.state.codex.monsters = {}; };

  // D1: player test on PACK unknown flesh (safe species) — verb itself?
  {
    resetCodex();
    Game.state.scholar.inventory = [{
      name: 'Hushwolf flesh (cleaned)', foodKind: 'meat', foodState: 'cleaned',
      plantId: 'meat_hushwolf', edible: false, kcalEach: 0, hiddenKcal: 1400,
      units: 2, unit: 'portion', kg: 0.5, spoilDay: day() + 2, diseaseRisk: { p: 0.35 },
    }];
    const before = Game.state.scholar.energy;
    const r = Game.testMonsterMeat(0);
    const it = Game.state.scholar.inventory[0];
    show('D1 pack-test fires', r ? 'yes' : 'no',
      `safe=${Game.monsterFoodSafe('hushwolf')} edible=${it.edible} kcalEach=${it.kcalEach} spoilDay=${it.spoilDay} energyDelta=${(Game.state.scholar.energy || 0) - before}`);
  }

  // D2: villager beat on PANTRY haul-shaped flesh (safe) — reveal + clock?
  {
    resetCodex();
    V().pantry = [haulItem('mirrormoth', 120, 1)];
    V().lastExperimentDay = -1;
    Game.state.scholar.prepStash = [];
    Game.state.scholar.inventory = [];
    Game.villagerExperimentBeat(true);
    const it = (V().pantry || [])[0];
    show('D2 villager-beat pantry reveal', Game.monsterFoodSafe('mirrormoth') ? 'yes' : 'no',
      it ? `edible=${it.edible} kcalEach=${it.kcalEach} foodState=${it.foodState} spoilDay=${it.spoilDay}` : 'stack GONE');
  }

  // D3: away-from-home beat — present gate?
  {
    resetCodex();
    V().pantry = [haulItem('gallowdeer', 2800, 1)];
    V().lastExperimentDay = -1;
    Game.villagerExperimentBeat(false);
    show('D3 away beat reveals', Game.monsterFoodSafe('gallowdeer') ? 'yes' : 'no',
      'present=false must not test (documented gate)');
  }

  // D4: village meal draw on revealed pantry meat — cooked stack left?
  {
    resetCodex();
    const it = haulItem('bulldozer', 3200, 3);
    it.edible = true; it.kcalEach = 400; it.spoilDay = day() + 2;
    V().pantry = [it];
    Game.state.codex.monsters = { bulldozer: { foodSafe: true } };
    const drawn = Game.pantryDraw(V(), 400, { cook: true, exposure: Game.freshExposure() });
    const rest = (V().pantry || [])[0];
    show('D4 pantryDraw cook:true', `taken=${drawn.taken} cookedFlag=${(drawn.items[0] || {}).cooked}`,
      rest ? `leftover units=${rest.units} foodState=${rest.foodState} spoilDay=${rest.spoilDay}` : 'stack fully eaten');
  }

  // D5: per-item cook on PANTRY revealed meat — verb works on pantry?
  {
    resetCodex();
    const it = haulItem('sunbasker', 180, 1);
    it.edible = true; it.kcalEach = 70; it.spoilDay = day() + 2;
    V().pantry = [it];
    Game.state.codex.monsters = { sunbasker: { foodSafe: true } };
    Game.cookFood(0, V().pantry);
    const after = (V().pantry || [])[0];
    show('D5 cookFood on pantry', after ? `foodState=${after.foodState} kcalEach=${after.kcalEach} spoilDay=${after.spoilDay}` : 'stack GONE');
  }

  // D6: poison pantry flesh — immortal?
  {
    resetCodex();
    V().pantry = [haulItem('belltoad', 300, 1)];
    V().lastExperimentDay = -1;
    Game.state.scholar.prepStash = [];
    Game.state.scholar.inventory = [];
    Game.villagerExperimentBeat(true);
    const it = (V().pantry || [])[0];
    const codex = (Game.state.codex.monsters || {}).belltoad || {};
    Game.sweepSpoiled();
    const still = (V().pantry || []).find(x => x && String(x.plantId) === 'meat_belltoad');
    show('D6 poison flesh after beat+sweep', `codex=${codex.foodTested}/${codex.foodSafe} kcalEach=${it ? it.kcalEach : 'gone'} spoilDay=${it ? it.spoilDay : 'gone'} stillPresent=${!!still}`,
      'sweepSpoiled only removes spoilDay<=day items');
  }

  // D7: player test DIRECTLY on pantry container — verb accepts it?
  {
    resetCodex();
    V().pantry = [haulItem('nightcourt', 900, 1)];
    const r = Game.testMonsterMeat(0, V().pantry);
    const it = (V().pantry || [])[0];
    show('D7 testMonsterMeat(pantry)', r ? 'yes' : 'no',
      `safe=${Game.monsterFoodSafe('nightcourt')} edible=${it ? it.edible : 'gone'} kcalEach=${it ? it.kcalEach : 'gone'}`);
  }

  // D8: pantry knowledge gate — unknown flesh packable?
  {
    resetCodex();
    V().pantry = [haulItem('nevermore', 350, 1)];
    let known = null;
    try { known = Game.pantryItemKnown(V().pantry[0]); } catch (e) { known = 'err:' + e.message; }
    show('D8 pantryItemKnown(unknown flesh)', String(known),
      'false = deliberately not packable (knowledge gate holds)');
  }

  // D9: untested haul flesh vs sweep after clock passes — no spoilDay?
  {
    resetCodex();
    const it = haulItem('glasswing', 140, 1);
    V().pantry = [it];
    show('D9 haul item spoilDay', String(it.spoilDay),
      `isSpoiled=${Game.isSpoiled(it)} (false forever without a clock)`);
  }

  // D10: quirk-pool separation on the safe path — eating revealed monster
  // meat must NOT route through mundane contractDisease. Check statusEffects
  // pool of the meat-disease defs vs mundane roster.
  {
    const cooking = (Game.data.cooking || {}).monsterDiseases || [];
    const seRaw = Game.data.statusEffects || {};
    const se = Array.isArray(seRaw) ? seRaw : (Array.isArray(seRaw.statuses) ? seRaw.statuses : Object.values(seRaw.statuses || seRaw));
    const pools = cooking.map(d => d.id + ':' + ((se.find(s => s.id === d.id) || {}).pool || '?')).join(',');
    show('D10 monster-disease pools', pools || '(no monsterDiseases in cooking.json)',
      'alien pool expected; mundane medicine must not touch them');
  }
  console.log('done');
  process.exit(0);
})().catch(e => { console.error('PROBE FATAL', e); process.exit(1); });
