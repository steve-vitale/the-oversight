#!/usr/bin/env node
// diag-food-r6-20261012.js — food economy ROUND 6 diagnostic (lever 0).
// Measures on current master, multi-seed × 200d, competent policy:
//   IN by source (stockPantry labels, all days)
//   TRAP chain: crafted (wire-improvised vs recipe craft) / looted / set / dawn catches / trap kcal
//   PRESERVATION: kcal preserved/day, racksFull days, eligible-but-skipped rot,
//                 fresh rot vs preserved rot (racks->rot)
//   EAT: scholar kcal/cap sampling (competentEat), days player hungry
//   DEATH causes
// Usage: SEEDS="11,22,33" DAYS=200 OUT=/tmp/food-r6.json node scripts/diag-food-r6-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88,99,111,222,333').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/food-r6.json';

function pantryKcalOf(Game) {
  try {
    return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    await setupGame(Game);
    const L = {
      inBy: {}, spoilLostKcal: 0, spoilBy: {}, spoilFreshKcal: 0, spoilPreservedKcal: 0,
      preservedKcal: 0, preservedN: 0, racksFullDays: 0, eligibleSkippedKcal: 0,
      trapCraftedRecipe: 0, trapWire: 0, trapLooted: 0, trapsSet: 0, trapsWireSet: 0, trapCatches: 0, trapKcal: 0, carcassesCleaned: 0,
      // r6: the knife in the pack
      knifeDays: 0, knifeCrafts: 0, knivesKnappedCtx: 0, knappedKnifeCtx: 0, knapFailedCtx: 0,
      rubbleClearedCtx: 0, stoneFromRubbleCtx: 0, trapCarcassesCleaned: 0,
      trapCatchByAnimal: {}, hungryDays: 0, sampleDays: 0, daysSurvived: 0,
      causes: {},
    };
    // ---- racks state: count smoke-racks messages ----
    let racksFullNotes = 0, smokeNotes = 0, smokeKcalKept = 0;
    const origSay = Game.say;
    Game.say = function (msg) {
      try {
        const m = String(msg || '');
        if (m.indexOf('racks are already full') >= 0) racksFullNotes++;
        if (/worked the smoke racks too/.test(m)) {
          smokeNotes++;
          const km = m.match(/~([\d,]+) kcal/);
          if (km) smokeKcalKept += parseInt(km[1].replace(/,/g, ''), 10);
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
    // ---- IN by label ----
    const origStock = Game.stockPantry.bind(Game);
    Game.stockPantry = function (kcal, name, opts) {
      try {
        const lbl = String(name || '?');
        L.inBy[lbl] = (L.inBy[lbl] || 0) + Math.round(kcal || 0);
      } catch (e) {}
      return origStock(kcal, name, opts);
    };
    // ---- spoilage: split fresh vs preserved rot ----
    const origSweep = Game.sweepSpoiled;
    if (typeof origSweep === 'function') {
      Game.sweepSpoiled = function () {
        try {
          const scan = (cont) => {
            for (const it of (cont || [])) {
              if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it)) {
                const k = (it.kcalEach || 0) * (it.units || 1);
                L.spoilLostKcal += k;
                if (it.foodState === 'preserved' || it.foodState === 'rendered') L.spoilPreservedKcal += k;
                else L.spoilFreshKcal += k;
              }
            }
          };
          scan(Game.state.scholar.inventory);
          scan((Game.state.village || {}).pantry);
        } catch (e) {}
        return origSweep.apply(this, arguments);
      };
    }
    // ---- preservation: wrap the village cook preserve pass ----
    // The preserve block lives inside the villager meal resolution; instrument
    // via racksFull flag visibility: patch Game on the pantry path by hooking
    // isSpoiled? Instead: count 'preserved' conversions by scanning pantry
    // delta of preserved items per day in daily hook below.
    // ---- traps: source ----
    const origCraft = Game.craft;
    Game.craft = function (rid) {
      const r = origCraft.apply(this, arguments);
      try {
        if (r && /snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap/i.test(String(rid || ''))) L.trapCraftedRecipe++;
        if (r && String(rid || '') === 'stone_knife') L.knifeCrafts++; // r6: knap-first firings
      } catch (e) {}
      return r;
    };
    const origSetTrap = Game.setTrap;
    Game.setTrap = function (rid) {
      let hadTool = false, hadWire = false;
      try {
        const tools = Game.state.scholar.tools || [];
        hadTool = tools.some(t => t && /snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap/i.test(String(t.recipeId || '')));
        hadWire = !!(Game.hasItem && Game.hasItem('snare_wire'));
      } catch (e) {}
      const r = origSetTrap.apply(this, arguments);
      try { if (r) { L.trapsSet++; if (!hadTool && hadWire && String(rid) === 'snare') L.trapsWireSet++; } } catch (e) {}
      return r;
    };
    // wire-improvised snares: setTrap consumes wire; detect by before/after wire count
    // (workTrapline only crafts 'snare' recipe; wire path makes no craft call)
    // ---- dawn trap catches ----
    const origCleanCarcass = Game.cleanCarcass;
    Game.cleanCarcass = function (idx, container) {
      try {
        // r6 fix: cleanCatch also sweeps the prep stash (homecoming pooling
        // moves carcasses there) — count whichever container was cleaned.
        const inv = container || Game.state.scholar.inventory || [];
        const n = inv.filter(i => i && i.foodState === 'carcass').length;
        L.carcassesCleaned += n;
        // r6: trapped-only cleanings (catch -> cleaned conversion)
        L.trapCarcassesCleaned += inv.filter(i => i && i.foodState === 'carcass' && /\((trapped)\)/.test(String(i.name || ''))).length;
        if (container) L.stashCleaned = (L.stashCleaned || 0) + n;
      } catch (e) {}
      return origCleanCarcass.apply(this, arguments);
    };
    const origCheck = Game.checkTraps;
    Game.checkTraps = function () {
      let before = 0;
      try { before = (Game.state.scholar.inventory || []).length; } catch (e) {}
      const r = origCheck.apply(this, arguments);
      try {
        const inv = Game.state.scholar.inventory || [];
        for (let i = before; i < inv.length; i++) {
          const it = inv[i];
          if (it && /\((trapped)\)/.test(String(it.name || ''))) {
            L.trapCatches++;
            const k = (it.kcalEach || 0) * (it.units || 1);
            L.trapKcal += k;
            const base = String(it.name).replace(' (trapped)', '').replace(' (carcass)', '');
            L.trapCatchByAnimal[base] = (L.trapCatchByAnimal[base] || 0) + 1;
          }
        }
      } catch (e) {}
      return r;
    };
    // loot_dropped traps (found traps)
    let prevTools = 0;
    // ---- daily sample ----
    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    let prevPreservedKcal = null, prevPantryPreservedCount = null;
    policy.daily = (G, ctx) => {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      // sample AFTER the policy's end-of-day work (its final competentEat
      // runs at the end of daily — sampling before it over-counted hunger).
      try {
        const day = (G.state.scholar || {}).day || 0;
        L.daysSurvived = Math.max(L.daysSurvived, day);
        L.sampleDays++;
        // r6: policy ctx counters (knife in the pack)
        try {
          L.knivesKnappedCtx = ctx.knivesKnapped || 0;
          L.knappedKnifeCtx = ctx.knappedKnife || 0;
          L.knapFailedCtx = ctx.knapFailed || 0;
          L.rubbleClearedCtx = ctx.rubbleCleared || 0;
          L.stoneFromRubbleCtx = ctx.stoneFromRubble || 0;
          if (G.hasCuttingTool && G.hasCuttingTool()) L.knifeDays++;
        } catch (e) {}
        // preserved kcal in pantry (racks state)
        let pk = 0;
        for (const it of ((G.state.village || {}).pantry || [])) {
          if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) pk += (it.kcalEach || 0) * (it.units || 1);
        }
        if (prevPreservedKcal !== null && pk > prevPreservedKcal + 1) {
          L.preservedKcal += (pk - prevPreservedKcal);
          L.preservedN++;
        }
        prevPreservedKcal = pk;
        // player hungry?
        try {
          const s = G.state.scholar;
          if (s && typeof s.kcal === 'number' && typeof G.kcalCap === 'function') {
            const cap = G.kcalCap(); const fed = 2400 * ((s.metabolicMult || 1));
            if (s.kcal < fed * 0.5) L.hungryDays++;
          }
        } catch (e) {}
      } catch (e) {}
    };
    // death causes via telemetry
    const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
    try {
      for (const ev of (result.telemetry || [])) {
        if (ev && (ev.ev === 'death' || ev.type === 'death')) {
          const c = (ev.cause || (ev.data && ev.data.cause) || 'unknown');
          L.causes[c] = (L.causes[c] || 0) + 1;
        }
      }
    } catch (e) {}
    // trap looted count: from ctx of policy? measure via telemetry craft/loot
    try {
      let crafted = 0, looted = 0, wire = 0;
      for (const ev of (result.telemetry || [])) {
        const id = String((ev.data && ev.data.id) || ev.id || '');
        if (ev.type === 'craft' && /snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap/i.test(id)) crafted++;
        if (ev.type === 'loot_dropped' && /snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap/i.test(id)) looted++;
      }
      if (crafted > L.trapCraftedRecipe) L.trapCraftedRecipe = crafted;
      L.trapLooted = looted;
    } catch (e) {}
    rows.push({
      racksFullNotes, smokeNotes, smokeKcalKept,
      seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
      inBy: L.inBy, spoilLostKcal: Math.round(L.spoilLostKcal),
      spoilFreshKcal: Math.round(L.spoilFreshKcal), spoilPreservedKcal: Math.round(L.spoilPreservedKcal),
      preservedKcal: Math.round(L.preservedKcal), racksFullDays: L.racksFullDays,
      trapsCraftedRecipe: L.trapCraftedRecipe, trapsSet: L.trapsSet, trapsWireSet: L.trapsWireSet, trapCatches: L.trapCatches, carcassesCleaned: L.carcassesCleaned,
      trapCarcassesCleaned: L.trapCarcassesCleaned, stashCleaned: L.stashCleaned || 0,
      knifeDays: L.knifeDays, knifeCrafts: L.knifeCrafts,
      knivesKnappedCtx: L.knivesKnappedCtx, knappedKnifeCtx: L.knappedKnifeCtx, knapFailedCtx: L.knapFailedCtx,
      rubbleClearedCtx: L.rubbleClearedCtx, stoneFromRubbleCtx: L.stoneFromRubbleCtx,
      trapKcal: Math.round(L.trapKcal), trapLooted: L.trapLooted,
      trapCatchByAnimal: L.trapCatchByAnimal,
      snareLevelEnd: 0, // filled below
      hungryDays: L.hungryDays, sampleDays: L.sampleDays, causes: L.causes,
      policyTrapsCrafted: 0, policyTrapsSet: 0,
    });
    // snare recipe level at end of run (the knowledge gate)
    try {
      rows[rows.length - 1].snareLevelEnd = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
    } catch (e) {}
    console.log(`seed=${seed} days=${result.days} end=${result.endReason} trapKcal=${Math.round(L.trapKcal)} catches=${L.trapCatches} spoil=${Math.round(L.spoilLostKcal)} preserved+=${Math.round(L.preservedKcal)} knifeCrafts=${L.knifeCrafts} rubble=${L.rubbleClearedCtx} knifeDays=${L.knifeDays}`);
  }
  require('fs').writeFileSync(OUT, JSON.stringify({ meta: { seeds: SEEDS, days: DAYS }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
