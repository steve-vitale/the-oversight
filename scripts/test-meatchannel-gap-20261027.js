#!/usr/bin/env node
// test-meatchannel-gap-20261027.js — proof for Triage A3 (monster-meat
// channel): hauled flesh must carry a clock, village meals must leave real
// cooked monster meat behind, and the player-side test drive must reach
// pantry flesh. Fixed seeds, so pre-fix RED and post-fix GREEN run on
// identical worlds. Run: node scripts/test-meatchannel-gap-20261027.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { findUnknownFlesh, testUnknownMeat } = require('./policies/meatseek');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function haulItem(mid, gross) {
  // Shape of the villager-mapmem haul deposit (pre-fix: no spoilDay).
  return {
    name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_' + mid, edible: false, kcalEach: 0, hiddenKcal: gross,
    units: 1, unit: 'portion', kg: 0.2,
    prep: 'Unknown flesh. Test it cautiously.', diseaseRisk: 'rawMeat',
  };
}
function liveVillager(Game) {
  const v = Game.state.village || {};
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) { const p = Game.getPerson(id); if (p && !p.dead) return id; }
  throw new Error('no live villager');
}

(async () => {
  // F1: the real haul path stamps a cleaned-meat clock (day + 2).
  {
    const { Game } = await loadGame({ seed: 20261027, mode: 'meat-gap' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const vid = liveVillager(Game);
    const corpse = {
      id: 'corpse-probe-hushwolf', kind: 'monster', monsterId: 'hushwolf',
      buried: false, node: { x: 4, y: 4 }, dayDied: day,
      items: [{
        plantId: 'meat_hushwolf', foodKind: 'meat', foodState: 'carcass',
        edible: false, units: 1, kcalEach: 0, hiddenKcal: 1400,
        spoilDay: day + 3, name: 'Hushwolf (carcass)', unit: 'carcass', kg: 1.4,
      }],
    };
    Game.corpses().push(corpse);
    const o = Game.objOf(vid);
    o.kind = 'HAUL'; o.targetRef = corpse.id; o.haulLabel = 'Hushwolf';
    const ran = Game.mapmemHaulAt(vid);
    const hu = (o.haulUnknown || [])[0];
    ok('F1 haul stamps spoilDay day+2', ran && hu && hu.spoilDay === day + 2,
      `ran=${ran} spoilDay=${hu && hu.spoilDay} expected=${day + 2}`);
  }

  // F2: reveal sets a clock only when the item has none; keeps existing ones.
  {
    const { Game } = await loadGame({ seed: 20261028, mode: 'meat-gap' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const clockless = {
      name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
      plantId: 'meat_hushwolf', edible: false, kcalEach: 0, hiddenKcal: 1400,
      units: 2, unit: 'portion', kg: 0.5,
    };
    const clocked = {
      name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
      plantId: 'meat_hushwolf', edible: false, kcalEach: 0, hiddenKcal: 1400,
      units: 1, unit: 'portion', kg: 0.5, spoilDay: day + 9,
    };
    Game.state.scholar.inventory = [clockless];
    Game.state.village.pantry = [clocked];
    Game.markMonsterFoodSafe('hushwolf', 'tested');
    ok('F2 reveal sets spoilDay day+2 when missing', clockless.spoilDay === day + 2,
      `spoilDay=${clockless.spoilDay} expected=${day + 2}`);
    ok('F2 reveal keeps an existing spoilDay', clocked.spoilDay === day + 9,
      `spoilDay=${clocked.spoilDay}`);
    ok('F2 reveal makes both edible', clockless.edible === true && clocked.edible === true,
      `pack=${clockless.edible} pantry=${clocked.edible}`);
  }

  // F3: village-cooked meal leaves cooked monster-meat leftovers.
  {
    const { Game } = await loadGame({ seed: 20261029, mode: 'meat-gap' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const it = {
      name: 'Hushwolf (cleaned)', foodKind: 'meat', foodState: 'cleaned',
      plantId: 'meat_hushwolf', edible: true, kcalEach: 400, units: 3,
      unit: 'portion', kg: 0.4, spoilDay: day + 2,
      diseaseRisk: { p: 0.35 }, parasiteRisk: { id: 'trichinosis' },
    };
    Game.state.village.pantry = [it];
    const drawn = Game.pantryDraw(Game.state.village, 400, { cook: true, exposure: Game.freshExposure() });
    const rest = (Game.state.village.pantry || [])[0];
    ok('F3 meal draws with cooked flag', drawn.taken === 400 && (drawn.items[0] || {}).cooked === true,
      `taken=${drawn.taken} cooked=${(drawn.items[0] || {}).cooked}`);
    ok('F3 leftover is cooked, 5-day clock', rest && rest.foodState === 'cooked' && rest.spoilDay === day + 5,
      rest ? `state=${rest.foodState} spoilDay=${rest.spoilDay} expected=${day + 5}` : 'stack gone');
    ok('F3 leftover carries no raw risk', rest && (rest.diseaseRisk === null || rest.diseaseRisk === undefined) && rest.parasiteRisk === undefined,
      rest ? `diseaseRisk=${JSON.stringify(rest.diseaseRisk)} parasiteRisk=${JSON.stringify(rest.parasiteRisk)}` : 'stack gone');
  }

  // F4: normal (non-monster) meat is untouched by the village-cook flip.
  {
    const { Game } = await loadGame({ seed: 20261030, mode: 'meat-gap' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const it = {
      name: 'Deer (cleaned)', foodKind: 'meat', foodState: 'cleaned',
      plantId: 'meat_white_tailed_deer', edible: true, kcalEach: 400, units: 3,
      unit: 'portion', kg: 0.4, spoilDay: day + 2,
      diseaseRisk: { p: 0.35 }, parasiteRisk: { id: 'trichinosis' },
    };
    Game.state.village.pantry = [it];
    Game.pantryDraw(Game.state.village, 400, { cook: true, exposure: Game.freshExposure() });
    const rest = (Game.state.village.pantry || [])[0];
    ok('F4 normal meat stays cleaned, clock kept', rest && rest.foodState === 'cleaned' && rest.spoilDay === day + 2,
      rest ? `state=${rest.foodState} spoilDay=${rest.spoilDay}` : 'stack gone');
    ok('F4 normal meat keeps its risks', rest && rest.diseaseRisk && rest.parasiteRisk,
      rest ? `diseaseRisk=${!!rest.diseaseRisk} parasiteRisk=${!!rest.parasiteRisk}` : 'stack gone');
  }

  // F5: poison flesh rots once its clock runs out (no more immortal clutter).
  {
    const { Game } = await loadGame({ seed: 20261031, mode: 'meat-gap' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const it = haulItem('belltoad', 300);
    it.spoilDay = day + 2;
    Game.state.village.pantry = [it];
    Game.state.codex.monsters = { belltoad: { foodSafe: false, foodTested: 'poison' } };
    Game.state.scholar.day = day + 3;
    Game.sweepSpoiled();
    const still = (Game.state.village.pantry || []).find(x => x && String(x.plantId) === 'meat_belltoad');
    ok('F5 poison flesh swept after its clock', !still, still ? 'still present' : '');
  }

  // F6: pools stay separate — meat quirks are alien, never mundane.
  {
    const { Game } = await loadGame({ seed: 20261032, mode: 'meat-gap' });
    await setupGame(Game);
    const cooking = (Game.data.cooking || {}).monsterDiseases || [];
    const seRaw = Game.data.statusEffects || {};
    const se = Array.isArray(seRaw) ? seRaw : (Array.isArray(seRaw.statuses) ? seRaw.statuses : Object.values(seRaw.statuses || seRaw));
    const pools = cooking.map(d => ((se.find(s => s.id === d.id) || {}).pool || '?'));
    ok('F6 meat quirks all alien-pool', cooking.length > 0 && pools.every(p => p === 'alien'),
      `quirks=${cooking.map(d => d.id).join(',')} pools=${pools.join(',')}`);
    ok('F6 mundane check refuses alien quirks', cooking.every(d => Game.seIsDisease(d.id) === false),
      'seIsDisease must admit mundane only');
  }

  // F7: the player test verb works on a pantry stack (the haul case).
  {
    const { Game } = await loadGame({ seed: 20261033, mode: 'meat-gap' });
    await setupGame(Game);
    Game.state.village.pantry = [haulItem('hushwolf', 1400)];
    const r = Game.testMonsterMeat(0, Game.state.village.pantry);
    const it = (Game.state.village.pantry || [])[0];
    ok('F7 player test on pantry flesh returns the item', !!r,
      `safe=${Game.monsterFoodSafe('hushwolf')} edible=${it && it.edible} kcalEach=${it && it.kcalEach}`);
  }

  // F8: the test drive finds pantry flesh (not just pack/prep).
  {
    const { Game } = await loadGame({ seed: 20261034, mode: 'meat-gap' });
    await setupGame(Game);
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [];
    Game.state.village.pantry = [haulItem('mirrormoth', 120)];
    const hit = findUnknownFlesh(Game);
    ok('F8 test drive scans the pantry', !!hit && hit.container === Game.state.village.pantry,
      hit ? `mid=${hit.mid} container=${hit.container === Game.state.village.pantry ? 'pantry' : 'other'}` : 'no hit');
    const ctx = {};
    testUnknownMeat(Game, ctx);
    ok('F8 one test drive call tests pantry flesh', (ctx.meatTests || 0) === 1 && Game.monsterFoodSafe('mirrormoth'),
      `meatTests=${ctx.meatTests} safe=${Game.monsterFoodSafe('mirrormoth')}`);
  }

  // F9: the test drive cooks revealed cleaned monster meat at a fire.
  {
    const { Game } = await loadGame({ seed: 20261035, mode: 'meat-gap' });
    await setupGame(Game);
    Game.nearFire = () => true;
    const mod = require('./policies/meatseek');
    const cookFn = mod.cookMonsterMeat || mod.cookRevealedMonsterMeat;
    Game.state.codex.monsters = { hushwolf: { foodSafe: true } };
    Game.state.scholar.inventory = [{
      name: 'Hushwolf (cleaned)', foodKind: 'meat', foodState: 'cleaned',
      plantId: 'meat_hushwolf', edible: true, kcalEach: 280, units: 2,
      unit: 'portion', kg: 0.3, spoilDay: (Game.state.scholar.day || 0) + 2,
    }];
    const day = (Game.state.scholar || {}).day || 0;
    let cooked = 0;
    if (typeof cookFn === 'function') {
      const ctx = {};
      cookFn(Game, ctx);
      cooked = ctx.monsterCooked || ctx.cookedMonster || 0;
    }
    const it = (Game.state.scholar.inventory || [])[0];
    ok('F9 test drive cooks revealed monster meat', typeof cookFn === 'function' && cooked >= 1 && it && it.foodState === 'cooked' && it.spoilDay === day + 5,
      `cookFn=${typeof cookFn} cooked=${cooked} state=${it && it.foodState} spoilDay=${it && it.spoilDay} expected=${day + 5}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL', e); process.exit(1); });
