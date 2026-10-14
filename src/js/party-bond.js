// @ontology
// system: party-bond
// description: Bond between villagers who fight and survive together. A combat dimension on the existing pair-bond store (betrayal.js), grows on shared survival, steadies them in combat, grieves proportionally on death. The SHIELDBEARER ability path (draw_fire/bodyguard/shield_wall/rally) carries the village-scale bond pool: the System offers its abilities to villagers who've bled beside others, and a completed path anchors the whole village.
// provides:
//   - combatBondGet(a, b)
//   - combatBondAdd(a, b, n)
//   - noteSharedFight(vids)
//   - noteBondGrief(deadVid, partyVids)
//   - noteCrewTogether(crewVids)
//   - bondCombatBonus(vid, allyVids)
//   - pathAnchor()
//   - villageBondBonus()
//   - noteVillageBondFight()
//   - noteVillageBondGrief()
//   - noteShieldbearerOffer(vid)
//   - isNewcomer(vid)
//   - findVeteranBuddy(vid, task)
//   - OUTDOOR_TASKS
//   - SHIELDBEARER_PATH
(function (global) {
  'use strict';
  const S = global.Scattering;

  // Outdoor tasks — the ones that put villagers in the treeline.
  // Mirrors the _outdoorCrew filter in game.js resolveAssignments.
  const OUTDOOR_TASKS = ['patrol', 'scout', 'hunt', 'forage'];

  // ---------- THE SHIELDBEARER PATH: the stand-together ability path ----------
  // Steve 2026-10-12: the village-scale bond belongs to an ABILITY PATH, not
  // a godhood. Four abilities, one identity: the villager who stands between
  // the monsters and everyone else. The System offers them to villagers who
  // have bled beside others — the party bond (feature 1, for everyone) is the
  // on-ramp to this path (feature 2). Grant order is fixed; the bond
  // threshold is the price. System_offer unlock stays for the player's route.
  var SHIELDBEARER_PATH = ['draw_fire', 'bodyguard', 'shield_wall', 'rally'];
  var SHIELDBEARER_BOND = { draw_fire: 25, bodyguard: 45, shield_wall: 65, rally: 85 };

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

  // pathAbilityCount: how many of the path a set of held ability ids covers.
  function pathAbilityCount(ids) {
    var n = 0;
    for (var i = 0; i < SHIELDBEARER_PATH.length; i++) {
      if ((ids || []).indexOf(SHIELDBEARER_PATH[i]) >= 0) n++;
    }
    return n;
  }

  function livingVid(vid) {
    try {
      var g = global.Game;
      if (g && g.vpOf) { var vp = g.vpOf(vid); if (vp && vp.dead) return false; }
    } catch (e) {}
    return true;
  }

  // pathAnchor: who holds the village-scale bond together. NO GODHOODS —
  // Steve 2026-10-12: two separate features; the village bond is an ability
  // path's identity.
  // 1.0 — someone completed the path: a villager holds all four
  //        shieldbearer abilities, or the player holds all four, or the
  //        player discovered the stand_together capstone synergy.
  // 0.5 — someone walks the path: a villager or the player holds 2+.
  // 0   — no shieldbearer. The village fights as individuals.
  function pathAnchor() {
    try {
      var g = global.Game;
      if (!g || !g.state) return 0;
      var sch = g.state.scholar || {};
      // An evolved ability counts as its root (evolvedFrom keeps the lineage).
      // ABILITY LANES (2026-10-14): known skill-lane abilities count too.
      var pAbs = (typeof g.ownedAbilityIds === 'function') ? g.ownedAbilityIds()
        : (sch.abilities || []).map(function (a) { return (a && (a.evolvedFrom || a.id)) || a; });
      var pCount = pathAbilityCount(pAbs);
      if (pCount >= 4) return 1;
      if ((sch.synergies || []).indexOf('stand_together') >= 0) return 1;
      var npcAbs = (g.state.village || {}).npcAbilities || {};
      var walking = pCount >= 2;
      for (var vid in npcAbs) {
        if (!livingVid(vid)) continue;
        var n = pathAbilityCount(npcAbs[vid] || []);
        if (n >= 4) return 1;
        if (n >= 2) walking = true;
      }
      return walking ? 0.5 : 0;
    } catch (e) { return 0; }
  }

  // noteShieldbearerOffer: the System's path grant. Called at fight end for
  // villagers who fought. The System has been watching who bleeds beside
  // whom — at bond thresholds it offers the next shieldbearer ability.
  // Same honesty rules as the track grants: nothing before the System's
  // arrival (day 7), the dead earn nothing, six slots like everyone.
  function noteShieldbearerOffer(vid) {
    try {
      var g = global.Game;
      if (!g || !g.state || !vid || vid === g.villagerId) return;
      if (!g.state.systemArrived) return;
      if (!livingVid(vid)) return;
      var v = g.state.village || {};
      var roster = v.roster || [];
      var best = 0, who = null;
      for (var i = 0; i < roster.length; i++) {
        var o = roster[i];
        if (!o || o === vid || !livingVid(o)) continue;
        var b = combatBondGet(vid, o);
        if (b > best) { best = b; who = o; }
      }
      if (!who) return;
      var held = (v.npcAbilities || {})[vid] || [];
      if (held.length >= 6) return; // six slots, same as you
      for (var k = 0; k < SHIELDBEARER_PATH.length; k++) {
        var id = SHIELDBEARER_PATH[k];
        if (held.indexOf(id) >= 0) continue;
        if (best < SHIELDBEARER_BOND[id]) return; // not yet — keep bleeding together
        if (g.npcGrantAbility) g.npcGrantAbility(vid, id);
        else {
          v.npcAbilities = v.npcAbilities || {};
          v.npcAbilities[vid] = held.concat([id]);
        }
        var aname = id;
        try {
          var def = (g.data && g.data.abilities || []).filter(function (a) { return a.id === id; })[0];
          if (def && def.name) aname = def.name;
        } catch (e2) {}
        var vname = vnameOf(vid), wname = vnameOf(who);
        if (g.say) g.say('◈ THE SYSTEM has been watching ' + vname + ' — stood beside ' + wname + ' through blood and back. It offers ' + aname + '. The line needs its shieldbearer. Earned, not given. (' + id + ': shieldbearer path)');
        try { if (g.journalNote) g.journalNote('system', 'grant', 'The System granted ' + vname + ' ' + aname + ' (' + id + ') for a combat bond of ' + best + ' with ' + wname + '.'); } catch (e3) {}
        try { if (g.tele) g.tele('villager_grant', { vid: vid, ability: id, track: 'shieldbearer', bond: best }); } catch (e4) {}
        return; // one offer per fight
      }
    } catch (e) {}
  }

  function vnameOf(vid) {
    try { var g = global.Game; if (g && g.displayName) return g.displayName(vid); } catch (e) {}
    return 'Someone';
  }

  function villageBondBonus() {
    try {
      var a = pathAnchor();
      if (!a) return 0;
      var v = (global.Game.state || {}).village || {};
      return a * Math.max(0, Math.min(100, v.villageBond || 0)) * 0.0008;
    } catch (e) { return 0; }
  }

  // The stand_together capstone synergy (draw_fire + shield_wall, player
  // route): the village learns the shape of it — the pool grows twice as
  // fast. The synergy's discovery copy says exactly this.
  function villageBondGrowth() {
    try {
      var sch = (global.Game.state || {}).scholar || {};
      if ((sch.synergies || []).indexOf('stand_together') >= 0) return 4;
    } catch (e) {}
    return 2;
  }

  function noteVillageBondFight() {
    try {
      if (!pathAnchor()) return;
      var v = global.Game.state.village;
      v.villageBond = Math.max(0, Math.min(100, (v.villageBond || 0) + villageBondGrowth()));
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
    global.Game.pathAnchor = pathAnchor;
    global.Game.villageBondBonus = villageBondBonus;
    global.Game.villageBondGrowth = villageBondGrowth;
    global.Game.noteVillageBondFight = noteVillageBondFight;
    global.Game.noteVillageBondGrief = noteVillageBondGrief;
    global.Game.noteShieldbearerOffer = noteShieldbearerOffer;
    global.Game.isNewcomer = isNewcomer;
    global.Game.findVeteranBuddy = findVeteranBuddy;
    global.Game.OUTDOOR_TASKS = OUTDOOR_TASKS;
  }

  S.PartyBond = {
    combatBondGet, combatBondAdd, noteSharedFight, noteBondGrief, noteCrewTogether,
    bondCombatBonus, pathAnchor, villageBondBonus, villageBondGrowth,
    noteVillageBondFight, noteVillageBondGrief, noteShieldbearerOffer,
    isNewcomer, findVeteranBuddy, OUTDOOR_TASKS, SHIELDBEARER_PATH,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
