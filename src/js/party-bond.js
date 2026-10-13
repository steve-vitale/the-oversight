// @ontology
// system: party-bond
// description: Bond between villagers who fight and survive together. A combat dimension on the existing pair-bond store (betrayal.js), grows on shared survival, steadies them in combat, grieves proportionally on death. The undying_ward godhood anchors a village-scale bond pool.
// provides:
//   - combatBondGet(a, b)
//   - combatBondAdd(a, b, n)
//   - noteSharedFight(vids)
//   - noteBondGrief(deadVid, partyVids)
//   - noteCrewTogether(crewVids)
//   - bondCombatBonus(vid, allyVids)
//   - wardAnchor()
//   - villageBondBonus()
//   - noteVillageBondFight()
//   - noteVillageBondGrief()
//   - isNewcomer(vid)
//   - findVeteranBuddy(vid, task)
//   - OUTDOOR_TASKS
(function (global) {
  'use strict';
  const S = global.Scattering;

  // Outdoor tasks — the ones that put villagers in the treeline.
  // Mirrors the _outdoorCrew filter in game.js resolveAssignments.
  const OUTDOOR_TASKS = ['patrol', 'scout', 'hunt', 'forage'];

  // Ward kit (post godhood-rework phase 1: herbal_remedy -> leech).
  const WARD_KIT = ['triage', 'steady_hands', 'field_medicine', 'leech', 'purify', 'second_wind'];

  // ---------- 1. PARTY BOND: the bled-together dimension ----------
  // The village already has a SOCIAL bond store (betrayal.js —
  // v.bonds["a|b"] = {v, depth, day, dayGain}: warmth built by
  // meals/visits/feasts, +6/pair/day cap, no bonds with the dead or gone).
  // The party bond rides the SAME store as a second dimension: bnd.combat
  // (0..100) — trust that only forms when you bleed together and live.
  // Warmth is who you like; combat bond is who you'd stand beside in the
  // treeline. Separate fields because a shared fight shouldn't eat the
  // social day-cap, and because grief scales them differently: social
  // warmth lingers as memory, the combat edge dies with its pair and must
  // be re-earned.
  function pairKey(a, b) {
    var g = global.Game;
    if (g && g.bondKey) { try { return g.bondKey(a, b); } catch (e) {} }
    return a < b ? a + '|' + b : b + '|' + a;
  }

  function combatBondGet(a, b) {
    if (!a || !b || a === b) return 0;
    var g = global.Game;
    var v = (g && g.state && g.state.village) || {};
    var bnd = (v.bonds || {})[pairKey(a, b)];
    return Math.max(0, Math.min(100, (bnd && bnd.combat) || 0));
  }

  function firstName(vid) {
    try {
      var g = global.Game;
      if (g && g.displayName) return String(g.displayName(vid)).split(' ')[0];
    } catch (e) {}
    return 'Someone';
  }

  // combatBondAdd: the single writer. Crosses 60 -> the village notices.
  // Gossip (rep) and trust move separately, per the existing pattern.
  function combatBondAdd(a, b, n) {
    if (!a || !b || a === b || !n) return combatBondGet(a, b);
    var g = global.Game;
    var v = (g && g.state && g.state.village) || {};
    v.bonds = v.bonds || {};
    var k = pairKey(a, b);
    var bnd = v.bonds[k] || (v.bonds[k] = { v: 0, depth: 0, day: 0, dayGain: 0 });
    var before = Math.max(0, Math.min(100, bnd.combat || 0));
    var after = Math.max(0, Math.min(100, before + n));
    bnd.combat = after;
    if (n > 0 && before < 60 && after >= 60) {
      try {
        if (g && g.seedGossip) g.seedGossip('blood_bond', { brave: 2, loyal: 3 }, [a, b]);
        if (g && g.bumpTrust) { g.bumpTrust(a, 3, 'blood bond'); g.bumpTrust(b, 3, 'blood bond'); }
      } catch (e) {}
    }
    return after;
  }

  // noteSharedFight: everyone who walked out of the same fight together.
  // +4 combat per pair, +1 trust each way. Survival is the practice.
  function noteSharedFight(vids) {
    vids = (vids || []).filter(Boolean);
    if (vids.length < 2) return;
    var g = global.Game;
    for (var i = 0; i < vids.length; i++) {
      for (var j = i + 1; j < vids.length; j++) {
        combatBondAdd(vids[i], vids[j], 4);
        try { if (g && g.bumpTrust) { g.bumpTrust(vids[i], 1, 'bled together'); g.bumpTrust(vids[j], 1, 'bled together'); } } catch (e) {}
      }
    }
  }

  // noteBondGrief: X died. The combat bond of X's pairs dies with them
  // (social warmth lingers as memory — betrayal.js owns that; the fighting
  // edge must be re-earned). Pairs among the survivors of X's party scale
  // by survivors/party. Grief, not amnesia.
  function noteBondGrief(deadVid, partyVids) {
    var g = global.Game;
    var v = (g && g.state && g.state.village) || {};
    v.bonds = v.bonds || {};
    partyVids = (partyVids || []).filter(function (x) { return x && x !== deadVid; });
    for (var k in v.bonds) {
      if (k.split('|').indexOf(deadVid) >= 0 && v.bonds[k]) v.bonds[k].combat = 0;
    }
    if (partyVids.length >= 2) {
      var scale = partyVids.length / (partyVids.length + 1);
      for (var i = 0; i < partyVids.length; i++) {
        for (var j = i + 1; j < partyVids.length; j++) {
          var kk = pairKey(partyVids[i], partyVids[j]);
          var bnd = v.bonds[kk];
          if (bnd && bnd.combat) bnd.combat = Math.max(0, Math.round(bnd.combat * scale));
        }
      }
    }
    // the village feels it too
    noteVillageBondGrief();
  }

  // noteCrewTogether: a day-part on the same outdoor task. +1 combat/pair.
  // This is how newcomers bond with veterans — two birds.
  function noteCrewTogether(crewVids) {
    crewVids = (crewVids || []).filter(Boolean);
    for (var i = 0; i < crewVids.length; i++) {
      for (var j = i + 1; j < crewVids.length; j++) {
        combatBondAdd(crewVids[i], crewVids[j], 1);
      }
    }
  }

  // bondCombatBonus: average combat bond with the allies in this fight ->
  // holdBonus. At bond 100 with your people beside you: +0.08 steadiness.
  // Earned, and grief can take it back.
  function bondCombatBonus(vid, allyVids) {
    allyVids = (allyVids || []).filter(function (x) { return x && x !== vid; });
    if (!allyVids.length) return 0;
    var sum = 0;
    for (var i = 0; i < allyVids.length; i++) sum += combatBondGet(vid, allyVids[i]);
    var avg = sum / allyVids.length;
    return Math.min(0.08, avg * 0.001);
  }

  // wardAnchor: who holds the village-scale bond together.
  // 1.0 — the Bearer ascended as undying_ward (persistent godhood state).
  // 0.5 — a villager walks the ward path (3+ ward-kit abilities).
  // 0   — no ward. The village fights as individuals.
  function wardAnchor() {
    try {
      var g = global.Game;
      if (!g || !g.state) return 0;
      var act = ((g.state.scholar || {}).godhood || {}).active || [];
      if (act.indexOf('undying_ward') >= 0) return 1;
      var npcAbs = (g.state.village || {}).npcAbilities || {};
      for (var vid in npcAbs) {
        var held = npcAbs[vid] || [];
        var n = 0;
        for (var i = 0; i < WARD_KIT.length; i++) if (held.indexOf(WARD_KIT[i]) >= 0) n++;
        if (n >= 3) return 0.5;
      }
    } catch (e) {}
    return 0;
  }

  function villageBondBonus() {
    try {
      var a = wardAnchor();
      if (!a) return 0;
      var v = (global.Game.state || {}).village || {};
      return a * Math.max(0, Math.min(100, v.villageBond || 0)) * 0.0008;
    } catch (e) { return 0; }
  }

  function noteVillageBondFight() {
    try {
      if (!wardAnchor()) return;
      var v = global.Game.state.village;
      v.villageBond = Math.max(0, Math.min(100, (v.villageBond || 0) + 2));
    } catch (e) {}
  }

  function noteVillageBondGrief() {
    try {
      var v = global.Game.state.village;
      if (!v || !(v.villageBond > 0)) return;
      v.villageBond = Math.max(0, Math.round(v.villageBond * 0.9));
      var g = global.Game;
      if (g && g.say) g.say('The village feels it — the bond dips, but holds. They endure together.');
    } catch (e) {}
  }

  // isNewcomer: arrived within the last 14 days (arrivalTick records arrivedDay).
  function isNewcomer(vid) {
    try {
      var v = global.Game.state.village || {};
      var ad = (v.arrivedDay || {})[vid];
      if (ad == null) return false;
      var day = (global.Game.state.scholar || {}).day || 0;
      return (day - ad) < 14;
    } catch (e) { return false; }
  }

  function braveryOf(vid) {
    try {
      var g = global.Game;
      if (g && g.agencyOf) return ((((g.agencyOf(vid) || {}).xp || {})[vid] || {}).bravery || 0);
    } catch (e) {}
    return 0;
  }

  // findVeteranBuddy: a veteran (bravery >= 10, not a newcomer) already on
  // the same task. Newcomers walk with someone who's bled before.
  function findVeteranBuddy(vid, task) {
    try {
      var g = global.Game;
      var v = g.state.village || {};
      var asg = v.assignments || {};
      var best = null, bestBrave = 10;
      for (var id in asg) {
        if (id === vid) continue;
        if ((asg[id] || {}).task !== task) continue;
        if (isNewcomer(id)) continue;
        var b = braveryOf(id);
        if (b >= bestBrave) { best = id; bestBrave = b; }
      }
      return best;
    } catch (e) { return null; }
  }

  // wire into the game object (same self-attaching pattern as party.js).
  // NOTE: bondKey/bondGet/bondAdd are NOT wired here — betrayal.js owns
  // the social pair-bond store and loads after this module. The combat
  // dimension uses its own writer (combatBondAdd) on the same store.
  if (global.Game) {
    global.Game.combatBondGet = combatBondGet;
    global.Game.combatBondAdd = combatBondAdd;
    global.Game.noteSharedFight = noteSharedFight;
    global.Game.noteBondGrief = noteBondGrief;
    global.Game.noteCrewTogether = noteCrewTogether;
    global.Game.bondCombatBonus = bondCombatBonus;
    global.Game.wardAnchor = wardAnchor;
    global.Game.villageBondBonus = villageBondBonus;
    global.Game.noteVillageBondFight = noteVillageBondFight;
    global.Game.noteVillageBondGrief = noteVillageBondGrief;
    global.Game.isNewcomer = isNewcomer;
    global.Game.findVeteranBuddy = findVeteranBuddy;
    global.Game.OUTDOOR_TASKS = OUTDOOR_TASKS;
  }

  S.PartyBond = {
    combatBondGet, combatBondAdd, noteSharedFight, noteBondGrief, noteCrewTogether,
    bondCombatBonus, wardAnchor, villageBondBonus, noteVillageBondFight,
    noteVillageBondGrief, isNewcomer, findVeteranBuddy, OUTDOOR_TASKS, WARD_KIT,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
