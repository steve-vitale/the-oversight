// @ontology
// system: calorie-engine
// description: The master clock. Every cost in the game flows through here. Needs never decrease with level; power costs calories.
// provides:
//   - BASE_BMR (code: calories.js)
//   - ACTIVE_DAY (code: calories.js)
//   - ACTION_COSTS (code: calories.js)
//   - dailyNeed(scholar)
//   - resolveDay(scholar, village)
// rules:
//   - (none documented)
// consumes:
//   - (none documented)
/* The master clock. Every cost in the game flows through here.
   Thesis enforcement: needs never decrease with level; power costs calories. */
(function (global) {
  'use strict';

  const BASE_BMR = 1800;          // kcal/day at rest
  const ACTIVE_DAY = 2200;       // typical expedition day
  const STARVATION_THRESHOLD = 500; // kcal reserve below which the spiral starts

  const ACTION_COSTS = {
    forage: 60, hunt: 240, craft: 100, explore: 160, // forage is a quick 16-tick beat now: 60 kcal effort, not 120
    rest: 40,              // cost: resting through a day part burns fuel (doAction('rest') reads this — the old -200 was dead config and would have been a food printer)
    treat_water: 50, travel_leg: 320,
    combat_round: 100, system_ability: 800, // power is expensive
  };

  // BURDEN TIERS (Steve 2026-10-06): weight is a calorie tax. The hauling
  // loop should feel heavy. Tiers scale with fraction of carry capacity —
  // not a flat tax. Movement multiplies; sustained work adds flat effort.
  // Pure function of (weight, capacity) — the game decides where to apply it.
  function burdenTier(weight, capacity) {
    const f = capacity > 0 ? weight / capacity : 1;
    // COMBAT (Steve 2026-10-06): lugging a heavy pack while something tries
    // to kill you. dodgePen subtracts from dodge chance; speedPen subtracts
    // from combat speed (initiative). The fiction: you can't slip aside fast
    // with 18kg on your back, and you react slower.
    if (f < 0.5) return { name: 'light', frac: f, moveMult: 1, workAdd: 0, dodgePen: 0, speedPen: 0 };
    if (f < 0.75) return { name: 'laden', frac: f, moveMult: 1.25, workAdd: 15, dodgePen: 0.03, speedPen: 0 };
    if (f < 0.95) return { name: 'heavy', frac: f, moveMult: 1.6, workAdd: 35, dodgePen: 0.08, speedPen: 1 };
    return { name: 'straining', frac: f, moveMult: 2.0, workAdd: 60, dodgePen: 0.15, speedPen: 2 };
  }

  function dailyNeed(scholar) {
    // BMR + activity; injuries and heavy abilities raise it. Never lowers with level.
    let need = ACTIVE_DAY;
    (scholar.injuries || []).forEach(() => { need += 150; });
    // FUSION REACTOR (Steve 2026-10-12): the pellet covers the body's
    // metabolism — an installed, online reactor means no food need. The
    // check is defensive: the engine must never crash on a bare scholar.
    try {
      const fr = scholar && scholar.fusionReactor;
      const has = global.Scattering && global.Scattering.hasAbility
        && global.Scattering.hasAbility(scholar, 'fusion_reactor');
      if (has && fr && fr.installed && fr.online !== false) return 0;
    } catch (e) {}
    return need;
  }

  // HYDRATION REALITY (Steve 2026-10-08): the day drinks too — heat and work.
  // Night 30 + day 12 base; clear (sunny) days sweat 1.5x, cold days 0.75x;
  // exertion costs ~1 per 32-tick batch (a full active day: -16). A hard sunny
  // day runs ~60+ hydration (~1.3L); an idle cold day ~40.
  // SURVIVAL-ATTRITION (2026-10-10): burn was 35+15 — the policy couldn't keep
  // up (overnight dehydration was the #1 attrition killer, -15/day on top of
  // the crisis half-heal). One drink (+50) now covers ~a day of quiet living.
  function hydrationBurn(scholar, opts) {
    opts = opts || {};
    let dayBurn = 12;
    if (opts.weather === 'clear') dayBurn = Math.round(dayBurn * 1.5);
    else if (opts.weather === 'cold') dayBurn = Math.round(dayBurn * 0.75);
    const exert = Math.floor(((opts.dayTicks) || 0) / 32);
    return 30 + dayBurn + exert;
  }

  // Apply one day's metabolic reality. Returns {ok, warnings[]}.
  // Warnings telegraph the spiral BEFORE it arrives (design rule).
  // opts: { weather, dayTicks } — heat and exertion drink too (Steve 2026-10-08).
  function resolveDay(scholar, village, opts) {
    const warnings = [];
    const need = dailyNeed(scholar);
    // HONEST DEATH CAUSES (player-survivability 2026-10-14): the overnight
    // tick used to report every death as 'starvation', even when dehydration
    // or pre-existing wounds did the killing. Track which damage source
    // brings health to 0 so the epitaph and telemetry tell the truth.
    // A player who learns "I died of thirst" drinks tomorrow; a player told
    // "you starved" with a full belly learns nothing.
    let killedBy = null;
    const healthBefore = scholar.health || 0;
    if (healthBefore <= 0) {
      // Already at 0 entering the night — the day's damage did it. Attribute
      // honestly: open wounds bleed out overnight, disease kills in sleep.
      // (This should be rare; daytime paths kill with specific causes.)
      const wounds = (scholar.wounds || []).length;
      const diseases = scholar.diseases ? Object.keys(scholar.diseases).length : 0;
      if (wounds > 0) killedBy = 'wounds';
      else if (diseases > 0) killedBy = 'sickness';
      else killedBy = 'the night';
    }
    scholar.kcal -= need;
    scholar.hydration -= hydrationBurn(scholar, opts);
    if (scholar.kcal < 0) {
      const deficit = -scholar.kcal;
      scholar.health -= Math.min(20, 2 + deficit / 180);
      scholar.energy = Math.max(0, scholar.energy - 25);
      warnings.push('STARVING: health and energy falling. The spiral has started.');
      if (!killedBy && scholar.health <= 0) killedBy = 'starvation';
    } else if (scholar.kcal < STARVATION_THRESHOLD) {
      warnings.push('WARNING: reserves critical. Eat tomorrow or the spiral begins.');
    }
    if (scholar.hydration <= 0) {
      scholar.hydration = 0;
      scholar.health -= 12;
      scholar.energy = Math.max(0, scholar.energy - 30);
      warnings.push('DEHYDRATED: find and treat water today.');
      if (!killedBy && scholar.health <= 0) killedBy = 'dehydration';
    }
    // floors: the body bottoms out at 0. Death is checked via ok, not negative numbers.
    // (Negative kcal/hp are display/logic noise — the spiral already did its damage above.)
    scholar.kcal = Math.max(0, scholar.kcal);
    scholar.health = Math.max(0, scholar.health);
    // village metabolism lives in game.js (villageEats) — single owner, tuned net drain.
    // the engine only runs the scholar's own body here.
    return { ok: scholar.health > 0, warnings, killedBy };
  }

  global.Scattering = global.Scattering || {};
  global.Scattering.calories = { BASE_BMR, ACTIVE_DAY, ACTION_COSTS, burdenTier, dailyNeed, hydrationBurn, resolveDay };
})(typeof window !== 'undefined' ? window : globalThis);
