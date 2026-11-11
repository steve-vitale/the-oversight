// knowfood-a-instrument-20261110.js — Knowledge FOOD, VILLAGER-SIDE rate
// revision (arm sim-knowfood-a, run fleshout-loop-a-20261110T2215Z).
// Scripts only, zero src/js. Re-judges the knowledge-b FOOD domain with a
// VILLAGER-SIDE known check (per-eater plant knowledge, village monster
// safety verdict) and counts unknown-food encounters: what villagers do
// with food they do not know is edible (eat / test / cook / ignore), plus
// whether unknown flesh still draws 0 kcal villager-side.
//
// Method wraps call the original, return its value unchanged, record only
// — never alter state, never consume RNG. Any failure in the RECORDING path
// is pushed to t.instrumentErrors, never thrown into the game. (AGENTS.md:
// no empty catch in new code — every catch reports.)
//
//   (1) DAILY SNAPSHOTS: roster, pantry kcal, sharedKnowledge breadth,
//       tested verdicts, unknown-flesh present in the pantry (items +
//       units), unknown plant lumps in the prep stash, wave/standing.
//   (2) FOOD: villagerMealDay reentrancy flag tags pantryDraw calls as
//       villager meals (other draws go in the otherDraws bucket); packMeal
//       sub-flag tags pack-seeding draws; per-item known-status BOTH
//       scholar-side (pantryItemKnown) AND villager-side (revised check);
//       drawSpoiled desperation draws (before/after diff); packMeal away
//       meals (kcal eaten from packs); villagerDayProduction totals
//       (scalar kcal, identity unmeasurable — counted as context).
//   (3) ENCOUNTERS: villagerExperimentBeat fires (before/after diff
//       attributes target kind + verdict + tester); thrown-out spoiled
//       stores and experiment say lines are captured by the driver's
//       say-line filter (see driver SAY_RE).
//
// Usage: const INST = require('./knowfood-a-instrument-20261110');
//   const inst = INST.install(Game); inst.snapshot(); ...
//   ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function rosterOf(Game) {
  try { return ((Game.state || {}).village || {}).roster || []; } catch (e) { return []; }
}

// villagerKnownOf(Game, vid, item) — THE revised villager-side known check
// (prereg). Returns true/false, or 'error' when the check itself is
// unavailable — never throws. Meat is judged by the village safety verdict
// (monsterFoodSafe); plants by the EATER's plantKnownBy union; animal meat
// is always known; meat_unknown is definitionally unknown.
function villagerKnownOf(Game, vid, item) {
  try {
    if (!item) return 'error';
    const pid = item.plantId;
    if (!pid) return true;
    const id = String(pid);
    if (id.indexOf('meat_') === 0) {
      const mid = id.slice(5);
      if (mid === 'unknown') return false;
      const animals = (Game.data || {}).animals || [];
      for (let i = 0; i < animals.length; i++) if (animals[i] && animals[i].id === mid) return true;
      if (typeof Game.monsterFoodSafe !== 'function') return 'error';
      return Game.monsterFoodSafe(mid) === true;
    }
    const plants = (Game.data || {}).plants || [];
    let isPlant = false;
    for (let i = 0; i < plants.length; i++) if (plants[i] && plants[i].id === pid) { isPlant = true; break; }
    if (!isPlant) return true; // tools, keepsakes, non-plant plantIds
    if (!vid) return 'error';
    if (typeof Game.plantKnownBy !== 'function') return 'error';
    return Game.plantKnownBy(vid, pid) === true;
  } catch (e) { return 'error'; }
}

// scholarKnownOf — the knowledge-b check, kept for the direct delta.
function scholarKnownOf(Game, item) {
  try {
    if (typeof Game.pantryItemKnown !== 'function') return 'error';
    return Game.pantryItemKnown(item) === true;
  } catch (e) { return 'error'; }
}

function isSpoiledItem(Game, it) {
  try { return !!(Game.isSpoiled && Game.isSpoiled(it)); } catch (e) { return false; }
}

// Scan for experiment-beat meat candidates (same guards as the beat:
// monster-gated flesh, not food-safe, not known-poison).
function meatCandidates(Game) {
  const out = [];
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    const pan = ((Game.state || {}).village || {}).pantry || [];
    const stash = ((Game.state || {}).scholar || {}).prepStash || [];
    const scan = function (list, where) {
      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        if (!it || it.foodKind !== 'meat' || it.edible !== false) continue;
        if (where === 'counter' && !(it.foodState === 'cleaned' || it.foodState === 'cooked')) continue;
        const mid = String(it.plantId || '').replace(/^meat_/, '');
        if (!mid) continue;
        let gated = false;
        try { gated = Game.monsterMeatGated ? Game.monsterMeatGated(mid) : false; } catch (e) { gated = false; }
        if (!gated) continue;
        let safe = false, poison = false;
        try { safe = Game.monsterFoodSafe ? Game.monsterFoodSafe(mid) : false; } catch (e) {}
        try { poison = Game.monsterFoodPoisoned ? Game.monsterFoodPoisoned(mid) : false; } catch (e) {}
        if (!safe && !poison) out.push({ mid: mid, where: where });
      }
    };
    scan(inv, 'inventory'); scan(pan, 'pantry'); scan(stash, 'counter');
  } catch (e) {}
  return out;
}

// Scan for experiment-beat plant candidates (scholar-unknown lumps).
function plantCandidates(Game) {
  const out = [];
  try {
    const stash = ((Game.state || {}).scholar || {}).prepStash || [];
    for (let i = 0; i < stash.length; i++) {
      const cont = stash[i];
      if (!cont || !cont.lump) continue;
      const keys = Object.keys(cont.lump || {});
      for (let j = 0; j < keys.length; j++) {
        let known = false;
        try { known = Game.plantKnown ? Game.plantKnown(keys[j]) : false; } catch (e) { known = false; }
        if (!known) out.push({ pid: keys[j] });
      }
    }
  } catch (e) {}
  return out;
}

function verdictMaps(Game) {
  const plants = {};
  const meats = {};
  try {
    const shared = ((Game.state || {}).village || {}).sharedKnowledge || {};
    for (const k in shared) if (shared[k] && shared[k].tested !== undefined) plants[k] = { tested: shared[k].tested, by: shared[k].testedBy || null };
  } catch (e) {}
  try {
    const cm = ((Game.state || {}).codex || {}).monsters || {};
    for (const k in cm) {
      if (!cm[k]) continue;
      if (cm[k].foodTested !== undefined || cm[k].foodSafe !== undefined) {
        meats[k] = { foodTested: cm[k].foodTested || null, foodSafe: cm[k].foodSafe === true, by: cm[k].foodTestedBy || null };
      }
    }
  } catch (e) {}
  return { plants: plants, meats: meats };
}

function install(Game) {
  const t = {
    daily: [], foodDraws: [], otherDraws: [], experimentBeats: [],
    spoiledDraws: [], packMeals: [], instrumentErrors: [],
    produced: { total: 0, n: 0 },
  };
  let inVillagerMeal = null; // vid while inside villagerMealDay
  let inPackMeal = false; // true while inside packMeal
  const wrapped = {}; // name -> original fn (for uninstall)

  function err(where, e) {
    try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try { record(Array.prototype.slice.call(arguments), r, threw); } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  // ---- MEAL FLAGS ----
  try {
    const origMeal = Game.villagerMealDay;
    if (typeof origMeal !== 'function') { t.instrumentErrors.push('villagerMealDay-missing: not a function'); }
    else {
      wrapped.villagerMealDay = origMeal;
      Game.villagerMealDay = function (vid) {
        const prev = inVillagerMeal;
        inVillagerMeal = vid || null;
        let r, threw = null;
        try { r = origMeal.apply(Game, arguments); } catch (e) { threw = e; }
        inVillagerMeal = prev;
        if (threw) throw threw;
        return r;
      };
    }
  } catch (e) { err('villagerMealDay-wrap', e); }

  try {
    const origPack = Game.packMeal;
    if (typeof origPack !== 'function') { t.instrumentErrors.push('packMeal-missing: not a function'); }
    else {
      wrapped.packMeal = origPack;
      Game.packMeal = function (vid, want, exposure) {
        const prev = inPackMeal;
        inPackMeal = true;
        let r, threw = null;
        try { r = origPack.apply(Game, arguments); } catch (e) { threw = e; }
        inPackMeal = prev;
        if (threw) throw threw;
        try {
          t.packMeals.push({
            day: dayOf(Game), vid: vid || null, want: want || 0,
            taken: (typeof r === 'number' ? r : 0),
          });
        } catch (e) { err('packMeal-record', e); }
        return r;
      };
    }
  } catch (e) { err('packMeal-wrap', e); }

  // ---- FOOD ----
  wrapMethod('pantryDraw', function (args, r) {
    try {
      const items = ((r && r.items) || []).map(function (d) {
        const it = (d && d.item) || {};
        // No eater outside a villager meal (scholar meals, feast draws,
        // theft): the villager-side check has no eater to judge by, so
        // it is null (not applicable), never an 'error'.
        const kv = inVillagerMeal ? villagerKnownOf(Game, inVillagerMeal, it) : null;
        const ks = scholarKnownOf(Game, it);
        return {
          knownVillager: kv,
          knownScholar: ks,
          foodKind: it.foodKind || null,
          plantId: it.plantId || null,
          units: d.units || 0,
          effectiveKcal: d.effectiveKcal || 0,
          cooked: !!d.cooked,
        };
      });
      const row = {
        day: dayOf(Game), vid: inVillagerMeal,
        isScholar: !!(inVillagerMeal && Game.villagerId && inVillagerMeal === Game.villagerId),
        context: inVillagerMeal ? 'villager-meal' : 'other',
        packSeed: inPackMeal,
        want: args[1] || 0, taken: (r && r.taken) || 0, items: items,
      };
      if (inVillagerMeal) t.foodDraws.push(row); else t.otherDraws.push(row);
      for (let i = 0; i < items.length; i++) {
        if (items[i].knownVillager === 'error') t.instrumentErrors.push('pantryDraw-villager-known-check-error: day ' + dayOf(Game));
        if (items[i].knownScholar === 'error') t.instrumentErrors.push('pantryDraw-scholar-known-check-error: day ' + dayOf(Game));
      }
    } catch (e) { err('pantryDraw-record', e); }
  });

  // drawSpoiled: before/after diff by object identity — the original
  // mutates units in place and splices fully-consumed items, so references
  // stay valid. Records which spoiled items were actually eaten and their
  // villager-side known-status (the eater is the enclosing villagerMealDay).
  try {
    const origSpoiled = Game.drawSpoiled;
    if (typeof origSpoiled !== 'function') { t.instrumentErrors.push('drawSpoiled-missing: not a function'); }
    else {
      wrapped.drawSpoiled = origSpoiled;
      Game.drawSpoiled = function (v, want, exposure) {
        let before = [];
        try {
          const pan = (v && v.pantry) || [];
          for (let i = 0; i < pan.length; i++) {
            const it = pan[i];
            if (!it) continue;
            const ke = it.kcalEach || 0;
            if (ke <= 0 || !isSpoiledItem(Game, it)) continue;
            before.push({ it: it, units: it.units || 1, ke: ke,
              knownVillager: inVillagerMeal ? villagerKnownOf(Game, inVillagerMeal, it) : null,
              knownScholar: scholarKnownOf(Game, it),
              plantId: it.plantId || null, foodKind: it.foodKind || null });
          }
        } catch (e) { err('drawSpoiled-before', e); }
        let r, threw = null;
        try { r = origSpoiled.apply(Game, arguments); } catch (e) { threw = e; }
        try {
          const takenItems = [];
          for (let i = 0; i < before.length; i++) {
            const b = before[i];
            const nowUnits = (b.it.units === undefined || b.it.units === null) ? 0 : b.it.units;
            // An item spliced out of the pantry still holds units 0 after
            // full consumption (drawSpoiled decrements before splicing).
            const takenUnits = Math.max(0, b.units - nowUnits);
            if (takenUnits > 0) {
              takenItems.push({
                knownVillager: b.knownVillager, knownScholar: b.knownScholar,
                plantId: b.plantId, foodKind: b.foodKind,
                units: takenUnits, effectiveKcal: b.ke,
              });
              if (b.knownVillager === 'error') t.instrumentErrors.push('drawSpoiled-villager-known-check-error: day ' + dayOf(Game));
              if (b.knownScholar === 'error') t.instrumentErrors.push('drawSpoiled-scholar-known-check-error: day ' + dayOf(Game));
            }
          }
          t.spoiledDraws.push({
            day: dayOf(Game), vid: inVillagerMeal,
            isScholar: !!(inVillagerMeal && Game.villagerId && inVillagerMeal === Game.villagerId),
            want: want || 0, takenKcal: (typeof r === 'number' ? r : 0),
            candidates: before.length,
            candidatesUnknownVillager: before.filter(function (b) { return b.knownVillager === false; }).length,
            takenItems: takenItems,
          });
        } catch (e) { err('drawSpoiled-record', e); }
        if (threw) throw threw;
        return r;
      };
    }
  } catch (e) { err('drawSpoiled-wrap', e); }

  // villagerDayProduction: scalar kcal totals only (no identity exists).
  wrapMethod('villagerDayProduction', function (args, r) {
    try {
      if (typeof r === 'number' && isFinite(r)) { t.produced.total += r; t.produced.n++; }
    } catch (e) { err('villagerDayProduction-record', e); }
  });

  // villagerExperimentBeat: before/after diff attributes the target
  // (plant lump vs meat, which item) and the verdict. The beat only fires
  // when present and when no experiment has run today; outcome records
  // which gate stopped it.
  try {
    const origBeat = Game.villagerExperimentBeat;
    if (typeof origBeat !== 'function') { t.instrumentErrors.push('villagerExperimentBeat-missing: not a function'); }
    else {
      wrapped.villagerExperimentBeat = origBeat;
      Game.villagerExperimentBeat = function (present) {
        let beforePlants = [], beforeMeats = [], beforeVerdicts = null;
        let lastDayBefore = null, presentBefore = null;
        try {
          beforePlants = plantCandidates(Game);
          beforeMeats = meatCandidates(Game);
          beforeVerdicts = verdictMaps(Game);
          lastDayBefore = (((Game.state || {}).village || {}).lastExperimentDay ?? null);
          presentBefore = (typeof Game.playerAtHaven === 'function') ? Game.playerAtHaven() : null;
        } catch (e) { err('experimentBeat-before', e); }
        let r, threw = null;
        try { r = origBeat.apply(Game, arguments); } catch (e) { threw = e; }
        try {
          const day = dayOf(Game);
          const afterVerdicts = verdictMaps(Game);
          const lastDayAfter = (((Game.state || {}).village || {}).lastExperimentDay ?? null);
          let fired = (lastDayAfter === day && lastDayBefore !== day);
          let target = null, verdict = null, tester = null, outcome = null;
          if (fired) {
            // New/changed plant verdict?
            for (const k in afterVerdicts.plants) {
              const a = afterVerdicts.plants[k], b = (beforeVerdicts && beforeVerdicts.plants[k]) || null;
              if (!b || b.tested !== a.tested) { target = { kind: 'plant', id: k }; verdict = a.tested; tester = a.by; break; }
            }
            if (!target) {
              for (const k in afterVerdicts.meats) {
                const a = afterVerdicts.meats[k], b = (beforeVerdicts && beforeVerdicts.meats[k]) || null;
                const aSig = (a.foodTested || '') + '|' + (a.foodSafe ? 'safe' : 'unsafe');
                const bSig = b ? ((b.foodTested || '') + '|' + (b.foodSafe ? 'safe' : 'unsafe')) : null;
                if (aSig !== bSig) {
                  target = { kind: 'meat', id: k };
                  verdict = (a.foodTested === 'poison') ? 'poison' : (a.foodSafe ? 'safe' : 'unknown');
                  tester = a.by; break;
                }
              }
            }
            outcome = target ? 'tested' : 'fired-no-verdict-diff';
            if (!target) t.instrumentErrors.push('experimentBeat-unattributed: day ' + day + ' fired but no verdict diff found');
          } else if (lastDayBefore === day) outcome = 'already-today';
          else if (presentBefore === false) outcome = 'not-present';
          else if (!beforePlants.length && !beforeMeats.length) outcome = 'no-target';
          else outcome = 'not-fired-unknown';
          t.experimentBeats.push({
            day: day, outcome: outcome, fired: fired,
            target: target, verdict: verdict, tester: tester,
            plantCandidates: beforePlants.length, meatCandidates: beforeMeats.length,
          });
        } catch (e) { err('experimentBeat-record', e); }
        if (threw) throw threw;
        return r;
      };
    }
  } catch (e) { err('experimentBeat-wrap', e); }

  function snapshot() {
    try {
      const v = (Game.state || {}).village || {};
      const roster = v.roster || [];
      let alive = 0;
      for (let i = 0; i < roster.length; i++) {
        try { const p = Game.getPerson ? Game.getPerson(roster[i]) : null; if (p && !p.dead) alive++; } catch (e) {}
      }
      const shared = v.sharedKnowledge || {};
      let tested = 0;
      for (const k in shared) if (shared[k] && shared[k].tested) tested++;
      let pantryKcal = 0;
      let unknownFleshItems = 0, unknownFleshUnits = 0;
      try {
        for (let i = 0; i < (v.pantry || []).length; i++) {
          const it = v.pantry[i];
          if (!it) continue;
          pantryKcal += ((it.kcalEach || 0) * (it.units || 1));
          if (it.foodKind === 'meat' && it.edible === false && (it.kcalEach || 0) === 0) {
            unknownFleshItems++;
            unknownFleshUnits += (it.units || 1);
          }
        }
      } catch (e) {}
      let unknownLumps = 0;
      try {
        const stash = ((Game.state || {}).scholar || {}).prepStash || [];
        for (let i = 0; i < stash.length; i++) {
          const cont = stash[i];
          if (!cont || !cont.lump) continue;
          const keys = Object.keys(cont.lump || {});
          for (let j = 0; j < keys.length; j++) {
            let known = false;
            try { known = Game.plantKnown ? Game.plantKnown(keys[j]) : false; } catch (e) { known = false; }
            if (!known) unknownLumps++;
          }
        }
      } catch (e) {}
      let wave = null, standing = null, scaleRank = null;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
      t.daily.push({
        day: dayOf(Game), roster: roster.length, alive: alive,
        pantryKcal: pantryKcal, sharedKnown: Object.keys(shared).length,
        testedVerdicts: tested,
        unknownFleshItems: unknownFleshItems, unknownFleshUnits: unknownFleshUnits,
        unknownLumps: unknownLumps,
        wave: wave, standing: standing, scaleRank: scaleRank,
        fallen: ((v.fallen || []).length),
      });
    } catch (e) { err('snapshot', e); }
  }

  function uninstall() {
    try {
      for (const name in wrapped) {
        try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
      }
    } catch (e) { err('uninstall', e); }
  }

  // Install-time availability check: both known checks must exist or the
  // FOOD rate cannot be computed honestly.
  try {
    if (typeof Game.pantryItemKnown !== 'function') t.instrumentErrors.push('pantryItemKnown-missing at install');
    if (typeof Game.plantKnownBy !== 'function') t.instrumentErrors.push('plantKnownBy-missing at install');
    if (typeof Game.monsterFoodSafe !== 'function') t.instrumentErrors.push('monsterFoodSafe-missing at install');
  } catch (e) { err('install-check', e); }

  return { t: t, snapshot: snapshot, uninstall: uninstall, villagerKnownOf: villagerKnownOf, scholarKnownOf: scholarKnownOf };
}

module.exports = { install: install, villagerKnownOf: villagerKnownOf, scholarKnownOf: scholarKnownOf };
