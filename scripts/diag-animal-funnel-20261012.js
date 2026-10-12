#!/usr/bin/env node
// diag-animal-funnel-20261012.js — DIAGNOSTIC (r6): where does the animal-
// codex funnel break in long sims? r3 (2026-10-11) diagnosed "animal codex
// depth 0 entries in 40 runs — sims never eat meat; input problem, not
// threshold problem". This verifies that claim on current master (which has
// r4's trade hook, r5's pool growth, agency r7 feed-goal DIAL since r3).
//
// Stages instrumented (all wraps live in the sweep — zero game-code changes):
//   meat events -> carcasses -> cleaned -> cooked -> eaten(tastings) ->
//   _noteAnimalDepth (via kill/tasted/taught) -> bear-gate firings
// Near-miss counters (r3's lesson): tastings that ALMOST deepened (species
// unknown so beats never fire), tastings on phantom meat (no animal def),
// kills that taught L1, cleaned meat never eaten (rotted away).
//
// Usage: SEEDS="1,2,3" DAYS=60 OUT=/tmp/diag-funnel.json node scripts/diag-animal-funnel-20261012.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { tradeRound } = require('./trade-hook');

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

(async () => {
  const seeds = parseList('SEEDS', '1,2,3,4,5,6').map(Number);
  const days = parseInt(process.env.DAYS || '60', 10);
  const outFile = process.env.OUT || null;
  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent+ask', fullTelemetry: true });
    await setupGame(Game);
    const K = {
      trapSets: 0, craftBy: {}, setTrapRes: 0,
      cleanCarcassCalls: 0, carcassesCleaned: 0,
      cookMeat: 0, cookFoodCalls: 0,
      identifyAnimalCalls: 0, identAnimalIds: {},
      noteDepth: [],           // {aid, level, type}
      depthBeats: { 2: 0, 3: 0, 4: 0 }, // via tasted
      masterTech: 0,           // grantKnowledge('technique') via mastery
      testMonsterMeat: 0,
      tastedDiff: 0,           // total new tastings observed in animalPrep
      // daily snapshots
      meatPack: [], meatPantry: [], carcassesPack: [],
      tastingsByAid: {},        // cumulative per aid
    };
    const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
    try {
      const _st = Game.setTrap;
      Game.setTrap = function (rid) { const r = _st.call(this, rid); if (r) { K.trapSets++; } return r; };
      const _cr = Game.craft;
      Game.craft = function (rid) { const r = _cr.call(this, rid); if (r) bump(K.craftBy, String(rid)); return r; };
      const _cc = Game.cleanCarcass;
      Game.cleanCarcass = function (idx, container) {
        K.cleanCarcassCalls++;
        let before = 0;
        try { const inv = container || this.state.scholar.inventory; before = inv.filter(i => i && i.foodState === 'carcass').length; } catch (e) {}
        const r = _cc.call(this, idx, container);
        let after = 0;
        try { const inv = container || this.state.scholar.inventory; after = inv.filter(i => i && i.foodState === 'carcass').length; } catch (e) {}
        K.carcassesCleaned += Math.max(0, before - after);
        return r;
      };
      const _cf = Game.cookFood;
      Game.cookFood = function (idx) {
        let isMeat = false;
        try { const it = this.state.scholar.inventory[idx]; isMeat = !!(it && String(it.plantId || '').startsWith('meat_')); } catch (e) {}
        const r = _cf.call(this, idx);
        K.cookFoodCalls++;
        if (isMeat && r) K.cookMeat++;
        return r;
      };
      const _ia = Game.encIdentifyAnimal;
      Game.encIdentifyAnimal = function (id) { K.identifyAnimalCalls++; bump(K.identAnimalIds, String(id)); return _ia.call(this, id); };
      const _nd = Game._noteAnimalDepth;
      Game._noteAnimalDepth = function (aid, level, src) {
        const r = _nd.call(this, aid, level, src);
        if (r) {
          const t = (src && src.type) || '?';
          K.noteDepth.push({ aid: String(aid), level, type: t });
          if (t === 'tasted' && K.depthBeats[level] != null) K.depthBeats[level]++;
        }
        return r;
      };
      const _gk = Game.grantKnowledge;
      Game.grantKnowledge = function (d, id, lvl, src) {
        const r = _gk.call(this, d, id, lvl, src);
        if (r && d === 'technique' && src && src.type === 'mastery') K.masterTech++;
        return r;
      };
      const _tm = Game.testMonsterMeat;
      Game.testMonsterMeat = function () { K.testMonsterMeat++; return _tm.apply(this, arguments); };
    } catch (e) { console.error('wrap fail', e); }

    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    const prevTast = {};
    policy.daily = (G, ctx) => {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        // daily meat census
        const pack = (G.state.scholar.inventory || []);
        const pantry = ((G.state.village || {}).pantry || []);
        let mp = 0, cp = 0, mt = 0;
        const byState = {};
        for (const it of pack) {
          if (!it) continue;
          if (it.foodState === 'carcass') cp++;
          if (String(it.plantId || '').startsWith('meat_') && (it.kcalEach || 0) > 0) {
            mp++;
            const fs = it.foodState || '?';
            byState[fs] = (byState[fs] || 0) + 1;
          }
        }
        for (const it of pantry) {
          if (it && String(it.plantId || '').startsWith('meat_') && (it.kcalEach || 0) > 0) mt++;
        }
        K.meatPack.push(mp); K.meatPantry.push(mt); K.carcassesPack.push(cp);
        K._byState = byState;
        // tasting deltas from animalPrep
        const ap = (G.state.codex || {}).animalPrep || {};
        for (const [aid, e] of Object.entries(ap)) {
          const t = (e && e.tastings) || 0;
          const prev = prevTast[aid] || 0;
          if (t > prev) {
            K.tastedDiff += (t - prev);
            K.tastingsByAid[aid] = (K.tastingsByAid[aid] || 0) + (t - prev);
          }
          prevTast[aid] = t;
        }
      } catch (e) {}
    };
    try {
      const r = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      K.days = r.days; K.endReason = r.endReason;
    } catch (e) { K.error = String(e).slice(0, 200); }
    // end-state: codex.animals levels, animalPrep, near-miss audit
    const nearMiss = { unknownSpeciesTastings: {}, phantomMeat: 0, tastingsLostToUnknown: 0 };
    try {
      const ap = (Game.state.codex || {}).animalPrep || {};
      for (const [aid, e] of Object.entries(ap)) {
        const t = (e && e.tastings) || 0;
        if (!t) continue;
        const adef = (Game.data.animals || []).find(a => a.id === aid);
        if (!adef) { nearMiss.phantomMeat += t; continue; }
        let known = false;
        try { known = Game.encAnimalKnown(aid); } catch (x) {}
        if (!known) {
          nearMiss.unknownSpeciesTastings[aid] = t;
          if (t >= 3) nearMiss.tastingsLostToUnknown += t;
        }
      }
    } catch (e) {}
    K.nearMiss = nearMiss;
    K.endAnimals = (() => { const o = {}; try { for (const [aid, e] of Object.entries((Game.state.codex || {}).animals || {})) o[aid] = (e && e.level) || 0; } catch (x) {} return o; })();
    K.endAnimalPrep = (() => { const o = {}; try { for (const [aid, e] of Object.entries((Game.state.codex || {}).animalPrep || {})) o[aid] = (e && e.tastings) || 0; } catch (x) {} return o; })();
    K.maxMeatPack = Math.max.apply(null, K.meatPack.concat([0]));
    K.maxCarcasses = Math.max.apply(null, K.carcassesPack.concat([0]));
    runs.push({ seed, K: { days: K.days, endReason: K.endReason, error: K.error,
      trapSets: K.trapSets, craftBy: K.craftBy, cleanCarcassCalls: K.cleanCarcassCalls,
      carcassesCleaned: K.carcassesCleaned, cookFoodCalls: K.cookFoodCalls, cookMeat: K.cookMeat,
      identifyAnimalCalls: K.identifyAnimalCalls, identAnimalIds: K.identAnimalIds,
      noteDepth: K.noteDepth, depthBeats: K.depthBeats, masterTech: K.masterTech,
      testMonsterMeat: K.testMonsterMeat, tastedDiff: K.tastedDiff,
      tastingsByAid: K.tastingsByAid, maxMeatPack: K.maxMeatPack, maxCarcasses: K.maxCarcasses,
      lastByState: K._byState, nearMiss: K.nearMiss, endAnimals: K.endAnimals, endAnimalPrep: K.endAnimalPrep } });
    console.log(`done seed=${seed} days=${K.days} end=${K.endReason} traps=${K.trapSets} craft=${JSON.stringify(K.craftBy)} ` +
      `cleaned=${K.carcassesCleaned} cookMeat=${K.cookMeat} tastings=${K.tastedDiff} idAnimal=${K.identifyAnimalCalls} ` +
      `depth=${JSON.stringify(K.depthBeats)} noteDepth=${JSON.stringify(K.noteDepth)} nearMiss=${JSON.stringify(K.nearMiss)} ` +
      `endAnimals=${JSON.stringify(K.endAnimals)} endPrep=${JSON.stringify(K.endAnimalPrep)}`);
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ runs }, null, 1)); console.log('wrote ' + outFile); }
})();
