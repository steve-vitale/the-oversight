// probe: does villagerExperimentBeat(true) pick hauled unknown flesh from the pantry?
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 9964, mode: 'probe-meatexperiment', fullTelemetry: true });
  await setupGame(Game);
  const sayLines = [];
  const _say = Game.say;
  Game.say = function (a) { sayLines.push(String(a)); return _say.apply(this, arguments); };

  // replicate the haul-deposit item EXACTLY as villager-mapmem.js mapmemHaulAt builds it
  const uitem = {
    name: 'Unknown flesh',
    foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_mirror_stag',
    edible: false, kcalEach: 0, hiddenKcal: 2800,
    units: 3, unit: 'portion',
    kg: 1.4,
    prep: 'Unknown flesh. Test it cautiously.',
    diseaseRisk: 'rawMeat',
  };
  Game.state.village.pantry = Game.state.village.pantry || [];
  Game.state.village.pantry.push(uitem);
  // make sure scholar inventory has no unknown meat (priority path)
  const inv = (Game.state.scholar || {}).inventory || [];
  const invUnknown = inv.filter(it => it && it.foodKind === 'meat' && it.edible === false);
  console.log('inventory unknown-meat items:', invUnknown.length);
  // make sure prepStash has no unknown lumps
  const stash = (Game.state.scholar || {}).prepStash || [];
  let unknownLumps = 0;
  for (const cont of stash) {
    if (!cont || !cont.lump) continue;
    unknownLumps += Object.keys(cont.lump || {}).filter(p => { try { return !Game.plantKnown(p); } catch (e) { return false; } }).length;
  }
  console.log('stash unknown lumps:', unknownLumps);
  console.log('monsterFoodSafe(mirror_stag):', (function () { try { return Game.monsterFoodSafe('mirror_stag'); } catch (e) { return 'ERR ' + e.message; } })());
  console.log('roster alive:', (Game.state.village.roster || []).filter(id => { try { return !Game.getPerson(id).dead; } catch (e) { return false; } }).length);

  const day = Game.state.scholar.day;
  console.log('day:', day, 'lastExperimentDay:', Game.state.village.lastExperimentDay);
  Game.villagerExperimentBeat(true);
  console.log('--- say lines after beat ---');
  for (const l of sayLines.slice(-8)) console.log(l.slice(0, 200));
  console.log('lastExperimentDay now:', Game.state.village.lastExperimentDay);
  try {
    const e = (Game.state.codex.monsters || {}).mirror_stag || {};
    console.log('codex mirror_stag:', JSON.stringify(e));
  } catch (err) { console.log('codex read ERR'); }
}
main().catch(e => { console.error('PROBE ERROR:', e); process.exit(2); });
