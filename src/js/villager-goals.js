// @ontology
// system: villager-goals
// description: Persistent per-villager goals (drives) that bias the dawn objective lottery by character type, gated strictly by what the villager personally perceived or learned.
// provides:
//   - vgoalWeights(vid)
//   - vgoalGate(vid, goalId)
//   - vgoalBiasCands(vid, cands)
//   - vgoalTop(vid, weights)
//   - vgoalState(vid)
// rules:
//   - vgoal_perception_only: a goal scores only what its villager personally perceived or learned (code: vgoalGate)
//     — sensed allies (villagerFightAllies), own kit, own kills (waveKillLog by=vid), own village lore (villageLoreOf),
//     own trust map, own fight memory (agency know.fought), heard gossip (heard list), own build-knowledge want.
//     A goal about an unseen person, place, or monster scores zero. Never a roster scan, never a panel number.
//   - vgoal_character_weights: weights come from the code's real character axes (code: vgoalWeights)
//     — npcGoal label, npcTemper temperament, occupation trackLean, npcIntel primary — never an invented type.
//   - vgoal_no_new_verbs: goals only bias EXISTING objective kinds (code: vgoalBiasCands)
//     — FORAGE, WATER, TRAPS, VISIT, HAVEN_CHORE, HUNT, HAUL, SEEK. No new action, no new brain, no planner above objPick.
//   - vgoal_no_gate_changes: this module never writes a win price, deed gate, readiness bar, or table rule (code: vgoalBiasCands)
//     — it changes how villagers choose, not what winning costs.
//   - vgoal_additive_no_rng: the bias only ADDS weight to existing lottery candidates (code: vgoalBiasCands)
//     — no new RNG draws on any path, no suppression of existing candidates, no reordering of the draw.
//   - vgoal_persistent_commitment: a villager sticks with their top goal across days until it is satisfied (code: vgoalBiasCands)
//     — the stored top goal gets a commitment bonus while it still scores, so goals are pursuits, not daily dice rolls.
//   - vgoal_narration: when a goal contributes weight to the drawn objective, the departure line carries the reason (code: vgoalBiasCands)
//     — the objective carries goal/goalLine; villager-objectives.js appends goalLine to the said departure line. No new UI surface.
/* VILLAGER GOALS — src/js/villager-goals.js
 *
 * Steve (2026-10-14, parity): "villagers need to act in smart ways,
 * including towards getting good gear and builds. They want to win as
 * well." Steve (2026-11-03): build the systemic goals system — winning
 * strategies as drives, weights tied to character types.
 *
 * This module is the drive layer the win-drive framework
 * (evidence/2026-11-03/win-drive-framework.md) describes: a want, written
 * down, wired into the decision code villagers already use. It is NOT a
 * new brain and NOT a planner above objPick. Every goal resolves to an
 * existing objective kind, and every weight comes from character axes
 * the game already stores plus state the villager themselves can see.
 *
 * How it plugs in (one hook, villager-objectives.js objPick):
 *   - after the lottery candidates are built, vgoalBiasCands adds goal
 *     weight to matching kinds and annotates the top contributing goal
 *     on each boosted candidate;
 *   - objPick copies the drawn candidate's goal/goalLine onto the
 *     objective, and the departure announcement appends goalLine.
 *
 * Self-attaching module. Load after villager-objectives.js (uses its
 * objPick hook only at call time) and after party-wiring.js,
 * villager-mapmem.js, hierarchy.js (perception queries, all defensive).
 */
(function () {
  // Attach pattern shared with villager-objectives.js: Game is published on
  // globalThis.Scattering by game.js (loaded first). A bare `Game` reference
  // here breaks old head-80 loaders that eval files inside a scope where a
  // later `const Game` is still in its temporal dead zone — so capture it
  // from Scattering instead of naming it. If it is not published yet, the
  // module no-ops rather than throwing at load.
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  var GOAL_IDS = ['party_up', 'gear_up', 'bank_veterans', 'build_standing',
    'food_security', 'bonds', 'knowledge', 'safety'];
  var GOAL_KINDS = {
    party_up: ['VISIT'],
    gear_up: ['FORAGE', 'TRAPS'],
    bank_veterans: ['HUNT'],
    build_standing: ['VISIT'],
    food_security: ['FORAGE', 'WATER', 'HAUL'],
    bonds: ['VISIT', 'HAVEN_CHORE'],
    knowledge: ['SEEK'],
    safety: ['HAVEN_CHORE'],
  };
  var GOAL_LINES = {
    party_up: 'Company makes the road shorter.',
    gear_up: 'Good kit is the difference out there.',
    bank_veterans: "There's a kill out there with their name on it.",
    build_standing: 'The village needs friends beyond the fire.',
    food_security: "The pantry won't fill itself.",
    bonds: "They've been meaning to check on their people.",
    knowledge: "There's something they still need to learn.",
    safety: 'Better close to the fire today.',
  };
  // Base weight of each goal for each npcGoal label (characterGen goals[]).
  // Primary drives 2.0, secondary 1.0, background 0.25. '*' is the fallback
  // for an unknown label — flat, so an unmapped villager still follows
  // state and perception, just without a character lean.
  var GOAL_BASE = {
    lead: { party_up: 2, gear_up: 1, bank_veterans: 1, build_standing: 2, food_security: 0.25, bonds: 1, knowledge: 0.25, safety: 0.25 },
    family: { party_up: 1, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 2, bonds: 2, knowledge: 0.25, safety: 1 },
    prove: { party_up: 1, gear_up: 2, bank_veterans: 2, build_standing: 1, food_security: 0.25, bonds: 0.25, knowledge: 0.25, safety: 0.25 },
    alone: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 0.25, bonds: 0.25, knowledge: 1, safety: 1 },
    feed: { party_up: 0.25, gear_up: 1, bank_veterans: 0.25, build_standing: 0.25, food_security: 2, bonds: 1, knowledge: 0.25, safety: 0.25 },
    understand: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 1, food_security: 0.25, bonds: 0.5, knowledge: 2, safety: 0.25 },
    protect: { party_up: 2, gear_up: 1, bank_veterans: 1, build_standing: 0.25, food_security: 0.25, bonds: 0.25, knowledge: 0.25, safety: 2 },
    escape: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 0.25, bonds: 0.25, knowledge: 1, safety: 2 },
    remember: { party_up: 1, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 0.25, bonds: 2, knowledge: 1, safety: 0.25 },
    belong: { party_up: 2, gear_up: 0.25, bank_veterans: 0.25, build_standing: 1, food_security: 0.25, bonds: 2, knowledge: 0.25, safety: 0.25 },
    survive: { party_up: 0.25, gear_up: 1, bank_veterans: 0.25, build_standing: 0.25, food_security: 2, bonds: 0.25, knowledge: 0.25, safety: 2 },
    heal: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 0.25, bonds: 1, knowledge: 2, safety: 1 },
    home: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 1, bonds: 1, knowledge: 0.25, safety: 1 },
    record: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 1, food_security: 0.25, bonds: 0.5, knowledge: 2, safety: 0.25 },
    answers: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 1, food_security: 0.25, bonds: 0.25, knowledge: 2, safety: 0.25 },
    legacy: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 2, food_security: 0.25, bonds: 1, knowledge: 1, safety: 0.25 },
    joy: { party_up: 2, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 0.5, bonds: 2, knowledge: 0.25, safety: 0.25 },
    peace: { party_up: 0.25, gear_up: 0.25, bank_veterans: 0.25, build_standing: 0.25, food_security: 0.5, bonds: 1, knowledge: 0.25, safety: 2 },
    '*': { party_up: 0.5, gear_up: 0.5, bank_veterans: 0.5, build_standing: 0.5, food_security: 0.5, bonds: 0.5, knowledge: 0.5, safety: 0.5 },
  };
  // Temperament multipliers — only where the temperament plainly leans.
  // Everything else stays 1.0 (no opinion).
  var TEMP_MULT = {
    bold: { bank_veterans: 1.4, gear_up: 1.3, safety: 0.6 },
    cautious: { safety: 1.5, bank_veterans: 0.6, gear_up: 0.8 },
    warm: { bonds: 1.4, party_up: 1.4 },
    withdrawn: { party_up: 0.5, bonds: 0.7, build_standing: 0.7 },
    restless: { build_standing: 1.3, party_up: 1.3, safety: 0.8 },
    anxious: { safety: 1.4, bank_veterans: 0.7 },
    intense: { bank_veterans: 1.3, gear_up: 1.2 },
    gentle: { safety: 1.2, bonds: 1.2, bank_veterans: 0.8 },
    prickly: { bonds: 0.7, party_up: 0.7 },
    stoic: { safety: 1.2, party_up: 0.8 },
  };
  // Occupation lean bonus: the occupation's TOP trackLean track adds a
  // small bonus to the goals that track serves. (occupationLean comes
  // from tracks.js; the bonus is additive so it never zeroes a goal.)
  var OCC_BONUS = {
    combat: { bank_veterans: 0.5, gear_up: 0.5 },
    field: { food_security: 0.5, gear_up: 0.5 },
    social: { bonds: 0.5, party_up: 0.5, build_standing: 0.5 },
    craft: { gear_up: 0.5 },
    strange: { knowledge: 0.5 },
  };
  var INTEL_BONUS = {
    observant: { knowledge: 0.5 },
    social: { bonds: 0.5, party_up: 0.5 },
    analytical: { knowledge: 0.5 },
    practical: { food_security: 0.5 },
  };

  function personOf(G, vid) {
    try { if (G.getPerson) return G.getPerson(vid); } catch (e) {}
    try { if (G.vpOf) return G.vpOf(vid); } catch (e) {}
    return null;
  }
  function dayOf(G) {
    try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }
  }
  function needsOf(G, vid) {
    try { if (G.npcNeeds) return G.npcNeeds(vid) || {}; } catch (e) {}
    return {};
  }
  function goalOf(G, vid) {
    try { if (G.npcGoal) return G.npcGoal(vid); } catch (e) {}
    return null;
  }
  function tempOf(G, vid) {
    try { if (G.npcTemper) return G.npcTemper(vid) || 'steady'; } catch (e) {}
    return 'steady';
  }
  function intelOf(G, vid) {
    try { if (G.npcIntel) return G.npcIntel(vid) || {}; } catch (e) {}
    return {};
  }
  function occLeanOf(G, vid) {
    try {
      var p = personOf(G, vid);
      var occ = p ? p.occupationId : null;
      if (occ && G.occupationLean) return G.occupationLean(occ) || {};
    } catch (e) {}
    return {};
  }
  // Gear the villager can see and judge: their own kit only. Mirrors
  // win-plan.js gearOf (same equipment helpers, same weapon scan) so
  // "geared" means the same thing in both systems.
  function gearOf(G, vid) {
    var person = personOf(G, vid);
    if (!person) return { armed: false, armored: false };
    var S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    var eq = S.equipment || null;
    var items = (G.data ? G.data.items : []) || [];
    var armorP = 0, weaponB = 0;
    try { armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0; } catch (e) {}
    try { weaponB = (eq && eq.weaponBonusOf) ? (eq.weaponBonusOf(person, items) || 0) : 0; } catch (e) {}
    var carriesWeapon = false;
    try {
      for (var i = 0; i < ((person.items || []).length); i++) {
        var iid = person.items[i] && (person.items[i].itemId || person.items[i].id || person.items[i]);
        var def = null;
        for (var j = 0; j < items.length; j++) if (items[j] && items[j].id === iid) { def = items[j]; break; }
        if (def && def.weapon) { carriesWeapon = true; break; }
      }
    } catch (e) {}
    return { armed: !!(weaponB > 0 || carriesWeapon), armored: armorP > 0 };
  }
  // Own wave-4+ kill: the villager's own deeds (waveKillLog by=vid).
  // First-person experience — the strongest perception there is.
  function ownW4Kill(G, vid) {
    try {
      var log = G.state.waveKillLog || [];
      for (var i = 0; i < log.length; i++) {
        if (log[i] && log[i].by === vid && (log[i].w || 0) >= 4) return true;
      }
    } catch (e) {}
    return false;
  }
  function foughtAny(G, vid) {
    try {
      var a = G.agencyState ? G.agencyState() : null;
      var k = a && a.know ? a.know[vid] : null;
      return !!((k && k.fought && k.fought.length) || 0);
    } catch (e) { return false; }
  }
  // Villages THIS villager personally knows (their own lore map only).
  function loreCount(G, vid) {
    try {
      if (G.villageLoreOf) {
        var m = G.villageLoreOf(vid) || {};
        return Object.keys(m).length;
      }
    } catch (e) {}
    return 0;
  }
  // Someone THIS villager trusts (their own trust map only — never a
  // roster scan: these are relationships the villager themselves holds).
  function trustedAnyone(G, vid) {
    try {
      var p = personOf(G, vid);
      var t = (p && p.trust) || {};
      for (var k in t) if ((t[k] || 0) >= 40) return true;
    } catch (e) {}
    return false;
  }
  // Danger gossip THIS villager heard — one shared read with the door
  // and the rally (Game.objDangerBelief). A raid nobody told them about
  // arms nothing.
  function dangerHeard(G, vid) {
    try {
      if (G.objDangerBelief) return !!(G.objDangerBelief(vid) || {}).threat;
    } catch (e) {}
    return false;
  }
  // Believed pantry days for THIS villager (objResourceBelief). Falls
  // back to the live estimate only when the belief helper is absent —
  // never prefer live over a stored away/stale belief.
  function pantryDays(G, vid) {
    try {
      if (G.objResourceBelief && vid) {
        var b = G.objResourceBelief(vid) || {};
        if (b.unknown) return null;
        if (typeof b.pantryDays === 'number' && isFinite(b.pantryDays)) return b.pantryDays;
      }
    } catch (e) {}
    try {
      if (G.pantryDaysEstimate) {
        var d = G.pantryDaysEstimate();
        if (typeof d === 'number' && isFinite(d)) return d;
      }
    } catch (e) {}
    return null;
  }
  function wantsKnow(G, vid) {
    try { if (G.villagerWantsKnowledge) return G.villagerWantsKnowledge(vid); } catch (e) {}
    return null;
  }
  // Sensed allies: co-tasked or co-located, trust-ordered — the
  // sanctioned "who would answer" query (party-wiring.js). If the
  // helper is absent, fail closed: no sensed allies, party scores 0.
  function alliesSensed(G, vid) {
    try {
      if (G.villagerFightAllies) {
        var a = G.villagerFightAllies(vid) || [];
        return a.length > 0;
      }
    } catch (e) {}
    return false;
  }
  // Perception gate strength for one goal, 0..1. Zero means the goal
  // may not score at all: its object is unseen, unheard, or already
  // achieved by this villager's own deeds.
  function gateFor(G, vid, goalId, needs) {
    switch (goalId) {
      case 'party_up': return alliesSensed(G, vid) ? 1 : 0;
      case 'gear_up': { var gr = gearOf(G, vid); return (gr.armed && gr.armored) ? 0 : 1; }
      case 'bank_veterans': return ownW4Kill(G, vid) ? 0 : (foughtAny(G, vid) ? 1 : 0);
      case 'build_standing': return loreCount(G, vid) >= 1 ? 1 : 0;
      case 'food_security': {
        var pd = pantryDays(G, vid);
        if ((pd != null && pd < 3) || (needs.hunger || 0) > 55) return 1;
        return 0.4;
      }
      case 'bonds': return trustedAnyone(G, vid) ? 1 : 0;
      case 'knowledge': return wantsKnow(G, vid) != null ? 1 : 0;
      case 'safety': return ((needs.fear || 0) > 55 || dangerHeard(G, vid)) ? 1 : 0.3;
      default: return 0;
    }
  }
  // Full weight vector for one villager: character axes x state x gate.
  // Pure arithmetic — no RNG draws, so identical state gives identical
  // weights and the objPick lottery stays the only dice in the room.
  function weightsFor(G, vid) {
    var out = {}, i, id;
    for (i = 0; i < GOAL_IDS.length; i++) out[GOAL_IDS[i]] = 0;
    var goal = goalOf(G, vid);
    var base = GOAL_BASE[goal] || GOAL_BASE['*'];
    var tm = TEMP_MULT[tempOf(G, vid)] || {};
    var lean = occLeanOf(G, vid);
    var topTrack = null, topXp = -1;
    for (var tr in lean) { if (lean[tr] > topXp) { topXp = lean[tr]; topTrack = tr; } }
    var ob = (topTrack && OCC_BONUS[topTrack]) || {};
    var intel = intelOf(G, vid);
    var ib = INTEL_BONUS[intel.primary] || {};
    var needs = needsOf(G, vid);
    for (i = 0; i < GOAL_IDS.length; i++) {
      id = GOAL_IDS[i];
      var w = (base[id] != null ? base[id] : 0.25);
      if (tm[id] != null) w *= tm[id];
      if (ob[id] != null) w += ob[id];
      if (ib[id] != null) w += ib[id];
      if (id === 'food_security' && (needs.hunger || 0) > 55) w *= 1.5;
      if (id === 'safety' && (needs.fear || 0) > 55) w *= 1.5;
      if ((id === 'bonds' || id === 'party_up') && (needs.social || 0) > 65) w *= 1.3;
      if ((needs.energy || 100) < 35) w *= 0.25;
      var gate = 0;
      try { gate = (G.vgoalGate ? G.vgoalGate(vid, id) : gateFor(G, vid, id, needs)); } catch (e) { gate = 0; }
      w *= gate;
      out[id] = Math.round(w * 1000) / 1000;
    }
    return out;
  }
  function stateFor(G, vid) {
    try {
      var v = G.state.village;
      if (!v.vgoals) v.vgoals = {};
      if (!v.vgoals[vid]) v.vgoals[vid] = { top: null, sinceDay: -1 };
      return v.vgoals[vid];
    } catch (e) { return { top: null, sinceDay: -1 }; }
  }
  // Commitment: the stored top goal gets +0.75 while it still scores,
  // so a villager sticks with a pursuit across days instead of flapping
  // with every dawn's arithmetic. Returns the (possibly new) top goal.
  function applyCommitment(G, vid, weights) {
    var st = null;
    try { st = (G.vgoalState ? G.vgoalState(vid) : stateFor(G, vid)); } catch (e) { st = stateFor(G, vid); }
    var top = null, topW = -1, id;
    for (id in weights) if (weights[id] > topW) { topW = weights[id]; top = id; }
    if (st.top && weights[st.top] > 0) {
      weights[st.top] = Math.round((weights[st.top] + 0.75) * 1000) / 1000;
      top = null; topW = -1;
      for (id in weights) if (weights[id] > topW) { topW = weights[id]; top = id; }
    }
    if (top && topW > 0 && st.top !== top) { st.top = top; st.sinceDay = dayOf(G); }
    return (top && topW > 0) ? top : null;
  }

  var methods = {
    vgoalState: function (vid) { return stateFor(this, vid); },
    vgoalWeights: function (vid) { return weightsFor(this, vid); },
    vgoalGate: function (vid, goalId) { return gateFor(this, vid, goalId, needsOf(this, vid)); },
    vgoalTop: function (vid, weights) {
      var w = weights || weightsFor(this, vid);
      return applyCommitment(this, vid, w);
    },
    // The objPick hook. Adds goal weight to existing lottery candidates
    // and annotates each boosted candidate with its top contributing
    // goal + plain-words line. Returns the villager's top goal (or null).
    // Test seam + safety valve: Game.vgoalDisabled = true skips the bias
    // entirely (the lottery then runs exactly as before goals existed).
    vgoalBiasCands: function (vid, cands) {
      try { if (this.vgoalDisabled) return null; } catch (e) {}
      if (!cands || !cands.length) return null;
      var w = this.vgoalWeights(vid);
      var top = this.vgoalTop(vid, w);
      var i, g, kinds, sum, best, bestW;
      for (i = 0; i < cands.length; i++) {
        sum = 0; best = null; bestW = 0;
        for (g in GOAL_KINDS) {
          kinds = GOAL_KINDS[g];
          if (kinds.indexOf(cands[i].kind) === -1) continue;
          if ((w[g] || 0) > 0) {
            sum += w[g];
            if (w[g] > bestW) { bestW = w[g]; best = g; }
          }
        }
        if (sum > 0) {
          cands[i].w += sum;
          cands[i].vgoal = best;
          cands[i].vgoalLine = GOAL_LINES[best] || null;
          cands[i].vgoalW = Math.round(sum * 1000) / 1000;
        }
      }
      return top;
    },
  };
  Object.assign(G, methods);
})();
