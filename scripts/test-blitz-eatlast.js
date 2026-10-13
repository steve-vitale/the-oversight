#!/usr/bin/env node
// scripts/test-blitz-eatlast.js — proof tests for the pantry->mouths last mile
// (blitz-eatlast, 2026-10-13). Steve's finding: hauled and cooked meat rots
// uneaten — the pantry->meal->mouths chain is broken (r12: 0% of revealed
// monster meat eaten even when it reached the village).
//
// ROOT CAUSE (measured, not asserted): pantryDraw sorts smallest-kcalEach
// first with spoilDay only as a TIEBREAK. Meat portions are ~500 kcal with a
// 2-day (cleaned) / 5-day (cooked) shelf; staples are 150-400 kcal with
// 30-365-day shelves. Villagers eat own production first, then draw only the
// remainder — the draw fills the need with long-shelf staples and never
// reaches the meat before its clock runs out. The scholar's own eat() eats
// most-perishable first; the village preservation layer (DINNER-FIRST,
// game.js) was BUILT assuming the nightly meal eats fresh-first. pantryDraw
// is the one place that doesn't.
//
// THE FIX (game.js pantryDraw): FRESH-FIRST — spoilDay ascending primary,
// kcalEach ascending secondary (best-fit within a shelf class), slabs
// (kcalEach > 2000, more than a day's food in one piece) still ride last so
// Steve's 2026-10-08 anti-slab law ("never a 30000-kcal slab for a small
// need") holds. Knowledge gating untouched: unknown flesh (edible:false,
// kcalEach 0) never draws; spoiled never draws.
//
// Proves (seeds 3, 4 — identical scenarios before/after):
//  (A) RED: one hungry villager's pantry draw on a mixed pantry leaves ALL
//      meat untouched (1950 kcal of beans, 0 of meat). GREEN: meat drawn.
//  (B) RED: the player's villageMeal on a mixed pantry takes staples, never
//      meat. GREEN: the 2-day meat goes first.
//  (C) RED: over 3 village days with staples sufficient, 0 meat kcal is
//      drawn and the cleaned meat rots in the pantry (spoiled, units>0).
//      GREEN: meat drawn > 0 and nothing rots uneaten.
//  (D) GUARDRAIL: no villager goes to sleep hungry (ate < 60% need) on a day
//      the pantry held drawable food at dawn — before AND after.
//  (E) REGRESSION: fish/garden economy still feeds the village (no crash,
//      ate >= 60% need, pantry drains) — before AND after.
//  (F) SLAB LAW: a 30000-kcal slab is not cracked for a small need (beans
//      drawn first), but IS eaten when it's the only food — before AND after.
//  (G) KNOWLEDGE GATE: edible:false unknown flesh is never drawn — before
//      AND after (canon: knowledge-gated edibility stays).
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [3, 4];
const results = [];

function meat(mid, state, kcalEach, units, spoilDay) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: state,
    edible: true, units, kcalEach, hiddenKcal: null, spoilDay, kg: 0.5,
    name: 'Testbeast meat (' + state + ')', diseaseRisk: null };
}
function staple(name, kcalEach, units, spoilDay, pid) {
  return { foodKind: 'plant', foodState: 'ready', edible: true, units, kcalEach,
    spoilDay, kg: 0.2, name, plantId: pid || ('staple_' + name.replace(/\W+/g, '_')) };
}
function unknownFlesh(mid, hiddenK, spoilDay) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'cleaned',
    edible: false, units: 2, kcalEach: 0, hiddenKcal: hiddenK,
    spoilDay, kg: 0.5, name: 'Unknown flesh (cleaned)' };
}
const meatKcal = (pantry) => pantry.filter(i => i && (i.plantId || '').startsWith('meat_') && i.edible !== false)
  .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
const drawableKcal = (Game, pantry) => pantry
  .filter(it => it && (it.kcalEach || 0) > 0 && (it.units || 0) > 0 && !(Game.isSpoiled && Game.isSpoiled(it)))
  .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);

async function freshVillage(Game, seed) {
  await setupGame(Game);
  const v = Game.state.village, s = Game.state.scholar;
  v.trust = v.trust || {};
  const vids = v.roster.filter(id => id !== Game.villagerId).slice(0, 2);
  for (const vid of vids) {
    v.trust[vid] = 90;
    const p = Game.getPerson(vid); p.kcalPerDay = 2000;
    Game.npcNeeds(vid).hunger = 90;
  }
  v.trust[Game.villagerId] = 90;
  // force full pantry reliance: no own production
  Game.villagerDayProduction = () => 0;
  return { v, s, vids, day: s.day };
}

function mixedPantry(day) {
  return [
    staple('Beans', 150, 40, day + 365),
    staple('Rice', 200, 40, day + 365),
    meat('testbeast', 'cleaned', 500, 2, day + 2),
    meat('testbeast', 'cooked', 500, 2, day + 5),
  ];
}

async function runSeed(seed) {
  const out = { seed, phases: {} };
  const { Game } = await loadGame({ seed, mode: 'eatlast-proof' });

  // ---------- (A) one hungry villager's draw: meat vs staples ----------
  {
    const { v, vids, day } = await freshVillage(Game, seed);
    v.pantry = mixedPantry(day);
    const before = meatKcal(v.pantry);
    const r = Game.villagerMealDay(vids[0], Game.getPerson(vids[0]), v, { cookId: null });
    const meatDrawn = before - meatKcal(v.pantry);
    out.phases.A = { ate: Math.round(r.ate), drawn: Math.round(r.drawn), meatDrawn: Math.round(meatDrawn) };
    assert(meatDrawn > 0, `A: a hungry villager's pantry draw must take meat (drew ${meatDrawn} of ${before} meat kcal)`);
    console.log(`  seed ${seed} PASS A: villager draw took ${Math.round(meatDrawn)} kcal of meat (ate ${Math.round(r.ate)})`);
  }

  // ---------- (B) the player's villageMeal: meat first ----------
  {
    const { v, s, day } = await freshVillage(Game, seed);
    v.pantry = mixedPantry(day);
    const origReach = Game.pantryInReach;
    Game.pantryInReach = () => true;
    s.kcal = 0;
    const before = meatKcal(v.pantry);
    Game.villageMeal();
    Game.pantryInReach = origReach;
    const meatDrawn = before - meatKcal(v.pantry);
    out.phases.B = { taken: Math.round(v.lastPlayerMeal || 0), meatDrawn: Math.round(meatDrawn) };
    assert(meatDrawn >= 1500, `B: the player's meal must eat the expiring meat first (drew ${meatDrawn} meat kcal)`);
    console.log(`  seed ${seed} PASS B: villageMeal took ${Math.round(meatDrawn)} kcal of meat (meal ${Math.round(v.lastPlayerMeal || 0)})`);
  }

  // ---------- (C) 3-day rot watch: staples sufficient, meat at risk ----------
  {
    const { v, s, vids, day } = await freshVillage(Game, seed);
    v.pantry = mixedPantry(day); // 14000 staples + 2000 meat; 2 villagers x 2000 x 3d = 12000 need
    const meat0 = meatKcal(v.pantry);
    let meatDrawn = 0, starved = 0;
    for (let d = 0; d < 3; d++) {
      s.day = day + d;
      const drawableAtDawn = drawableKcal(Game, v.pantry);
      for (const vid of vids) Game.npcNeeds(vid).hunger = 90;
      const rs = {};
      for (const vid of vids) rs[vid] = Game.villagerMealDay(vid, Game.getPerson(vid), v, { cookId: null });
      meatDrawn = meat0 - meatKcal(v.pantry);
      for (const vid of vids) {
        const r = rs[vid];
        if (!r.fasting && (r.ate || 0) < 2000 * 0.6 && drawableAtDawn > 300) starved++;
      }
    }
    const rotted = v.pantry.filter(i => i && (i.plantId || '').startsWith('meat_') && i.edible !== false &&
      (i.units || 0) > 0 && Game.isSpoiled(i));
    out.phases.C = { meatDrawn: Math.round(meatDrawn), rottedStacks: rotted.length, starved };
    assert(meatDrawn > 0, `C: 3 days of village meals must eat pantry meat (drew ${meatDrawn})`);
    assert(rotted.length === 0, `C: no meat may rot uneaten in the pantry (${rotted.length} spoiled stacks with units left)`);
    console.log(`  seed ${seed} PASS C: 3d drew ${Math.round(meatDrawn)} meat kcal, rotted stacks 0, starved ${starved}`);
    out.phases.D = { starved };
    assert(starved === 0, `D: nobody goes to sleep hungry while drawable food exists (starved ${starved})`);
    console.log(`  seed ${seed} PASS D: no starvation-while-pantry-full (${starved})`);
  }

  // ---------- (E) fish/garden regression: the normal economy still works ----------
  {
    const { v, s, vids, day } = await freshVillage(Game, seed);
    v.pantry = [
      staple('Smoked fish', 300, 10, day + 30, 'fish_perch'),
      staple('Garden greens', 80, 30, day + 4, 'garden_greens'),
      staple('Beans', 150, 40, day + 365),
    ];
    let ateTotal = 0, starved = 0, threw = null;
    try {
      for (let d = 0; d < 2; d++) {
        s.day = day + d;
        for (const vid of vids) Game.npcNeeds(vid).hunger = 90;
        for (const vid of vids) {
          const r = Game.villagerMealDay(vid, Game.getPerson(vid), v, { cookId: null });
          ateTotal += r.ate || 0;
          if (!r.fasting && (r.ate || 0) < 2000 * 0.6) starved++;
        }
      }
    } catch (e) { threw = e; }
    out.phases.E = { ateTotal: Math.round(ateTotal), starved, threw: threw ? String(threw.message) : null };
    assert(!threw, 'E: fish/garden meals must not throw: ' + (threw && threw.message));
    assert(ateTotal > 3000, `E: the village must actually eat the fish/garden economy (ate ${ateTotal})`);
    assert(starved === 0, `E: nobody starves on the normal economy (starved ${starved})`);
    console.log(`  seed ${seed} PASS E: fish/garden economy feeds village (ate ${Math.round(ateTotal)}, starved ${starved})`);
  }

  // ---------- (F) slab law: Steve 2026-10-08 — never a slab for a small need ----------
  {
    const { v, vids, day } = await freshVillage(Game, seed);
    const slab = { name: 'Legacy slab', kcalEach: 30000, units: 1, spoilDay: day + 1, kg: 5, foodKind: 'plant', foodState: 'ready', edible: true };
    v.pantry = [staple('Beans', 150, 40, day + 365), slab];
    const r = Game.villagerMealDay(vids[0], Game.getPerson(vids[0]), v, { cookId: null });
    const slabLeft = v.pantry.find(i => i.name === 'Legacy slab');
    out.phases.F = { ate: Math.round(r.ate), slabUnitsLeft: slabLeft ? slabLeft.units : 0 };
    assert(slabLeft && slabLeft.units === 1, 'F: the 30000-kcal slab must ride last — not cracked for a small need');
    // ...but when it's the ONLY food, a fed village beats a wasted slab
    v.pantry = [Object.assign({}, slab)];
    const r2 = Game.villagerMealDay(vids[0], Game.getPerson(vids[0]), v, { cookId: null });
    assert((r2.drawn || 0) > 0, 'F: with only the slab left, the village eats it (no fractionating, no starving)');
    console.log(`  seed ${seed} PASS F: slab rides last with beans present, eaten when it's the only food`);
  }

  // ---------- (G) knowledge gate: unknown flesh never draws ----------
  {
    const { v, vids, day } = await freshVillage(Game, seed);
    v.pantry = [staple('Beans', 150, 40, day + 365), unknownFlesh('gallowdeer', 700, day + 2)];
    const r = Game.villagerMealDay(vids[0], Game.getPerson(vids[0]), v, { cookId: null });
    const uf = v.pantry.find(i => (i.plantId || '') === 'meat_gallowdeer');
    out.phases.G = { ate: Math.round(r.ate), unknownUnitsLeft: uf ? uf.units : -1, unknownEdible: uf ? uf.edible : null };
    assert(uf && uf.units === 2 && uf.edible === false, 'G: edible:false unknown flesh is never drawn — the discovery chain owns it');
    console.log(`  seed ${seed} PASS G: unknown flesh untouched (knowledge gating intact)`);
  }

  results.push(out);
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    console.log(`seed ${seed}:`);
    await runSeed(seed);
  }
  console.log('\nblitz-eatlast proof: ALL GREEN on seeds ' + SEEDS.join(', '));
  console.log(JSON.stringify(results.map(r => ({ seed: r.seed, phases: r.phases })), null, 1));
})().catch(e => { console.error('FATAL/FAIL:', e.message); process.exit(1); });
