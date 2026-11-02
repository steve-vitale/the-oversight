#!/usr/bin/env node
// test-meatchannel-e2e-20261102.js — staged haul->reveal->test->cook
// proof on IDENTICAL seeds, before/after the counter-flesh fix.
// S1/S4/S6 are regression guards (pass before+after). S2/S3/S5 test the
// counter-flesh gap (FAIL before the fix: the villager beat never
// scanned prepStash meat). Stdout only; writes nothing.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require(ROOT + '/scripts/sim-harness');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function liveVillager(Game) {
  const v = Game.state.village || {};
  for (const id of (v.roster || [])) {
    if (id === Game.villagerId) continue;
    const p = Game.getPerson(id); if (p && !p.dead) return id;
  }
  throw new Error('no live villager');
}
function counterFlesh(mid, gross, spoilDay) {
  return { name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_' + mid, edible: false, kcalEach: 0, hiddenKcal: gross,
    units: 2, unit: 'portion', kg: 0.4, spoilDay,
    prep: 'Unknown flesh. Test it cautiously.', diseaseRisk: 'rawMeat' };
}
(async () => {
  // S1: haul path end to end (corpse at haven -> pantry deposit).
  {
    const { Game } = await loadGame({ seed: 20261102, mode: 'meat-e2e' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const vid = liveVillager(Game);
    const corpse = { id: 'corpse-e2e-hushwolf', kind: 'monster', monsterId: 'hushwolf',
      buried: false, node: { x: 4, y: 4 }, dayDied: day,
      items: [{ plantId: 'meat_hushwolf', foodKind: 'meat', foodState: 'carcass',
        edible: false, units: 1, kcalEach: 0, hiddenKcal: 1400,
        spoilDay: day + 3, name: 'Hushwolf (carcass)', unit: 'carcass', kg: 1.4 }] };
    Game.corpses().push(corpse);
    const o = Game.objOf(vid);
    o.kind = 'HAUL'; o.targetRef = corpse.id; o.haulLabel = 'Hushwolf';
    const ran = Game.mapmemHaulAt(vid);
    Game.objReturnEffect(vid, 'haul');
    const pan = Game.state.village.pantry || [];
    const hit = pan.find(x => x && String(x.plantId) === 'meat_hushwolf');
    ok('S1 haul deposits unknown flesh in pantry', ran && !!hit && hit.edible === false && hit.kcalEach === 0,
      `ran=${ran} hit=${!!hit}`);
  }
  // S2: villager beat on counter flesh.
  {
    const { Game } = await loadGame({ seed: 20261103, mode: 'meat-e2e' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [counterFlesh('hushwolf', 1400, day + 2)];
    Game.state.village.pantry = [];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const it = (Game.state.scholar.prepStash || [])[0];
    ok('S2 beat tests counter flesh', Game.monsterFoodSafe('hushwolf') && it && it.edible === true,
      `safe=${Game.monsterFoodSafe('hushwolf')} edible=${it && it.edible}`);
  }
  // S3: urgent flesh vs plant queue.
  {
    const { Game } = await loadGame({ seed: 20261104, mode: 'meat-e2e' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    const unkPlant = (Game.data.plants || []).find(p => { try { return !Game.plantKnown(p.id); } catch (e) { return false; } });
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [];
    if (unkPlant) {
      Game.state.scholar.prepStash.push({ name: 'bag', lump: { [unkPlant.id]: { units: 5, day } },
        lumpForm: 'bag', units: 1, spoilDay: day + 5 });
    }
    Game.state.village.pantry = [counterFlesh('mirrormoth', 120, day + 1)];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    ok('S3 urgent flesh wins over plant queue', Game.monsterFoodSafe('mirrormoth'),
      `safe=${Game.monsterFoodSafe('mirrormoth')} plantKnown=${unkPlant ? Game.plantKnown(unkPlant.id) : 'n/a'}`);
  }
  // S4: village meal draws revealed meat cooked.
  {
    const { Game } = await loadGame({ seed: 20261105, mode: 'meat-e2e' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const it = { name: 'Hushwolf (cleaned)', foodKind: 'meat', foodState: 'cleaned',
      plantId: 'meat_hushwolf', edible: true, kcalEach: 400, units: 3,
      unit: 'portion', kg: 0.4, spoilDay: day + 2, diseaseRisk: { p: 0.35 } };
    Game.state.village.pantry = [it];
    Game.state.codex.monsters = { hushwolf: { foodSafe: true } };
    const drawn = Game.pantryDraw(Game.state.village, 400, { cook: true, exposure: Game.freshExposure() });
    const rest = (Game.state.village.pantry || [])[0];
    ok('S4 meal draws revealed meat cooked', drawn.taken === 400 && (drawn.items[0] || {}).cooked === true,
      `taken=${drawn.taken} cooked=${(drawn.items[0] || {}).cooked}`);
    ok('S4 leftover is cooked, 5-day clock', rest && rest.foodState === 'cooked' && rest.spoilDay === day + 5,
      rest ? `state=${rest.foodState} spoilDay=${rest.spoilDay}` : 'stack gone');
  }
  // S5: poison counter flesh tested then rots.
  {
    const { Game } = await loadGame({ seed: 20261106, mode: 'meat-e2e' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [counterFlesh('belltoad', 300, day + 2)];
    Game.state.village.pantry = [];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const codex = (Game.state.codex.monsters || {}).belltoad || {};
    ok('S5 poison counter flesh marked poison', codex.foodTested === 'poison' && codex.foodSafe === false,
      `tested=${codex.foodTested} safe=${codex.foodSafe}`);
    Game.state.scholar.day = day + 3;
    // advance past the bonus-aware spoilage boundary (preservation
    // instinct can extend shelf life), then sweep
    {
      const it0 = (Game.state.scholar.prepStash || []).find(x => x && String(x.plantId) === 'meat_belltoad');
      if (it0) {
        let guard = 0;
        while (!Game.isSpoiled(it0) && guard < 30) { Game.state.scholar.day += 1; guard += 1; }
      }
    }
    Game.sweepSpoiled();
    const still = (Game.state.scholar.prepStash || []).find(x => x && String(x.plantId) === 'meat_belltoad');
    ok('S5 poison flesh swept after its clock', !still, still ? 'still present' : '');
  }
  // S6: deer carcass on the counter is NOT monster-tested.
  {
    const { Game } = await loadGame({ seed: 20261107, mode: 'meat-e2e' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [{ name: 'Deer (carcass)', foodKind: 'meat', foodState: 'carcass',
      plantId: 'meat_white_tailed_deer', edible: false, kcalEach: 0, hiddenKcal: 9000,
      units: 1, unit: 'carcass', kg: 9, spoilDay: day + 3 }];
    Game.state.village.pantry = [];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const codex = (Game.state.codex.monsters || {}).white_tailed_deer || {};
    const it = (Game.state.scholar.prepStash || [])[0];
    ok('S6 deer carcass not monster-tested', !codex.foodSafe && it && it.edible === false,
      `safe=${codex.foodSafe} edible=${it && it.edible}`);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL', e); process.exit(1); });
