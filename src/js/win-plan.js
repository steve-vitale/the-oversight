// @ontology
// system: win-plan
// description: Villagers pursuing a winning gameplan, in ordered stages.
// provides:
//   - winPlanOf(vid)
//   - winPlanStats()
//   - winPlanHavenTick(vid, hx, hy)
//   - winPlanDepart(vid, hx, hy, announce)
//   - winPlanFightGate(vid, mdef)
//   - winPlanSeedFromFight(vid, mdef, outcome)
//   - winPlanNoteKill(vid, mdef)
//   - winPlanNoteFight(vid, allyVids)
//   - winPlanBondsTick(hx, hy)
//   - winPlanMusterTick(hx, hy)
// rules:
//   - winplan_engagement: a plan starts from lived or heard knowledge (code: winPlanHavenTick)
//     — a beast the villager personally fought (agency know.fought), or
//     a village slain count the fire has told everyone (villageSlain,
//     the deed-talk channel) — never from a roster scan, and never
//     before the village has any kill to talk about. Without this the
//     system sleeps until a villager survives a wave-3+ beast: the
//     30-day organic smoke ran with zero plans, zero counters.
//   - winplan_ordered_stages: gear -> party -> hunt -> standing -> table. (code: winPlanHavenTick, winPlanDepart)
//     A stage advances only on its owner's own events (their gear after
//     gear-up, a trusted villager they can SEE at Haven, a beast THEY
//     fought or fled, a kill THEY banked, a System hold/release beat
//     broadcast while they are at Haven). No village scheduler assigns
//     anyone anything: composition comes from the order — each stage's
//     action is the next stage's precondition — not from a planner.
//   - winplan_perception_only: party = self + villagerFightAllies(vid) (code: winPlanFightGate)
//     (co-tasked or co-located, trust-ordered) and nothing else; a
//     party member's gear is judged only for those sensed members, never
//     for the roster; beast strength is judged from the beast in front
//     of them (its bulk and speed in its def), never from a panel.
//   - winplan_trick_gate: a wave-4 beast whose trick the village has (code: winPlanFightGate)
//     not learned is never a forced-contact seek: the field fighter opens
//     with the trick on round 1 only when the village knows it
//     (villageKnowsTrick: ledger counter or two survived observations),
//     and a trick-less wave-4 fight is the funnel's flee pattern (2 kills
//     in 83 wild wave-4 fights). The gate withholds SEEK only — ordinary
//     encounters still happen, and surviving one (flee/evade) teaches
//     the trick, so no plan strands waiting for knowledge it can never earn.
//   - winplan_no_gate_changes: this module never writes standing (code: winPlanStats)
//     thresholds, deed gates, readiness numbers, or win prices. It reads
//     the System's broadcast hold beats (state._standingDeferBeat) as
//     what the village was TOLD, and waveUnlockReady's short bars only
//     behind an existing beat, to name which kill the village lacks.
//   - winplan_bonds: tending and muster stand-down follow Arm 4's (code: winPlanBondsTick, winPlanMusterTick)
//     natwindow policy bars (tend weekly at trust<50 when
//     pantry-days>=3; stand down a >=3-day-old hungry muster when the
//     weakest primary link is below 55) but are decided by villagers:
//     the tend actor is a plan-holder home at Haven, the stand-down
//     actor is a plan-holder home at Haven who is committed to the
//     muster themselves. Inputs are Haven's OWN primary links, OWN
//     pantry-days, the OWN herald muster and the hunger bleed on the
//     OWN links' histories, and the OWN scale flags — never another
//     village's state, never a roster scan (actors come from the
//     plan-holder set), never titan-call readiness. Costs are real:
//     1,500 pantry kcal per tended link per week; stand-down costs
//     -5 trust per allied link and abandons the titan road for the
//     run. No gate, threshold, or price changes.
//   - winplan_no_second_join: party formation feeds the existing (code: winPlanDepart)
//     villagerFightAllies / fieldFight opts path. This module launches
//     companions on the same expedition target so the engine can find
//     them; it never builds a second join trigger.
// ============ WIN PLAN ============
// Why villagers kept losing the long game: they had breadth (a rule for
// every situation) but no sequence — a villager could be geared, alone,
// facing a wave-4 beast, with no reason to go back for help, no reason
// to bank the veteran kill the village actually lacks, and no reason to
// protect a veteran once banked. The plan is one villager's own sequence
// of reasons, each earned by something that happened to THEM:
//   gear    — "I am going after something hard and I am not armed."
//   party   — "I am armed, but not going after that alone."
//   hunt    — "We are going after the beast I know, together."
//   standing— "I banked the kill; now the village needs more of that."
//   table   — "The fifth draft waits; veterans stay alive and ready."
// A villager with no plan behaves exactly as before (the gate returns
// 'normal' / null and every old path runs untouched).
(function () {
  'use strict';
  var G = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
  var Game = G.Game;
  if (!Game) return;

  var STAGES = ['gear', 'party', 'hunt', 'standing', 'table'];
  var PARTY_WAIT_DAYS = 3;
  var VETERAN_GUARD_DAYS = 7;

  function stateOf(self) {
    var v = self.state && self.state.village;
    if (!v) return null;
    v.winPlan = v.winPlan || {};
    v.winPlanStats = v.winPlanStats || {
      gearHolds: 0, partyInvites: 0, partyDepartures: 0, partyWaits: 0,
      avoidances: 0, seekContacts: 0, standingContacts: 0,
      veteranGuardHolds: 0, partyFights: 0, planSeeds: 0, stageAdvances: 0,
      bondTends: 0, musterStanddowns: 0, trickHolds: 0,
    };
    if (v.winPlanStats.trickHolds == null) v.winPlanStats.trickHolds = 0;
    if (v.winPlanStats.bondTends == null) v.winPlanStats.bondTends = 0;
    if (v.winPlanStats.musterStanddowns == null) v.winPlanStats.musterStanddowns = 0;
    return v;
  }
  function bump(self, key) {
    try { var v = stateOf(self); if (v) v.winPlanStats[key] = (v.winPlanStats[key] || 0) + 1; } catch (e) {}
  }
  function personOf(self, vid) {
    try { if (self.getPerson) return self.getPerson(vid); } catch (e) {}
    try { if (self.vpOf) return self.vpOf(vid); } catch (e) {}
    return null;
  }
  // Gear the villager can see and judge: their own, and a sensed party
  // member's. Never a roster scan — callers pass only sensed members.
  function gearOf(self, vid) {
    var person = personOf(self, vid);
    if (!person) return { armed: false, armored: false, armorP: 0, weaponB: 0 };
    var S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    var eq = S.equipment || null;
    var items = self.data ? self.data.items : [];
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
    return { armed: !!(weaponB > 0 || carriesWeapon), armored: armorP > 0, armorP: armorP, weaponB: weaponB };
  }
  function atHaven(self, vid, hx, hy) {
    try {
      var n = self.npcNode ? self.npcNode(vid) : null;
      return !!(n && n.nx === hx && n.ny === hy);
    } catch (e) { return false; }
  }
  function alive(self, vid) {
    try { var p = personOf(self, vid); return !!(p && !p.dead); } catch (e) { return true; }
  }
  function ownKills(self, vid) {
    try { return ((self.state && self.state.waveKillLog) || []).filter(function (e) { return e && e.by === vid; }); } catch (e) { return []; }
  }
  function hasKillWaveAtLeast(self, vid, w) {
    var ks = ownKills(self, vid);
    for (var i = 0; i < ks.length; i++) if ((ks[i].w | 0) >= w) return true;
    return false;
  }
  function deferBeat(self) {
    try { return (self.state && self.state._standingDeferBeat) || {}; } catch (e) { return {}; }
  }
  // The kill the village was TOLD it lacks, behind an existing beat.
  // Returns a beast wave (3 or 4) or null. A beat with no veterans short
  // names no kill — the villager seeks nothing on its strength.
  function needWave(self) {
    try {
      var beat = deferBeat(self);
      if (beat[5] != null && self.waveUnlockReady) {
        var r5 = self.waveUnlockReady(5);
        if (r5 && (r5.short || []).indexOf('veterans') !== -1) return 4;
      }
      if (beat[4] != null && self.waveUnlockReady) {
        var r4 = self.waveUnlockReady(4);
        if (r4 && (r4.short || []).indexOf('veterans') !== -1) return 3;
      }
    } catch (e) {}
    return null;
  }
  // A trusted villager this villager can SEE at Haven, willing and able
  // to walk: same node, trust floor shared with party-wiring (15),
  // alive, not engaged, not already out, a ranger by profile.
  function findCompanion(self, vid, hx, hy) {
    try {
      var v = self.state && self.state.village;
      if (!v) return null;
      var roster = v.roster || [];
      var trust = v.trust || {};
      var away = v.away || {};
      for (var i = 0; i < roster.length; i++) {
        var cid = roster[i];
        if (!cid || cid === vid || cid === self.villagerId) continue;
        if (!alive(self, cid)) continue;
        if (away[cid]) continue;
        if (((trust[cid] === undefined) ? 10 : trust[cid]) < 15) continue;
        if (!atHaven(self, cid, hx, hy)) continue;
        try { if (self.isEngaged && self.isEngaged(cid)) continue; } catch (e) {}
        var prof = null;
        try { prof = self.npcRangeProfile ? self.npcRangeProfile(cid) : null; } catch (e) {}
        if (prof !== 'wanderer' && prof !== 'explorer') continue;
        try {
          var a = self.agencyState ? self.agencyState() : null;
          if (a && a.exped && a.exped[cid]) continue;
        } catch (e) {}
        return cid;
      }
    } catch (e) {}
    return null;
  }

  var methods = {
    winPlanOf(vid) {
      var v = stateOf(this);
      if (!v) return null;
      if (!v.winPlan[vid]) v.winPlan[vid] = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      return v.winPlan[vid];
    },
    winPlanStats() {
      var v = stateOf(this);
      return v ? v.winPlanStats : {};
    },
    winPlanSeedFromFight(vid, mdef, outcome) {
      try {
        if (!mdef || (mdef.wave || 1) < 3) return null;
        var v = stateOf(this);
        if (!v) return null;
        var plan = v.winPlan[vid];
        if (plan && plan.stage !== 'gear' && plan.stage !== 'party') return plan;
        var node = null;
        try { node = this.npcNode ? this.npcNode(vid) : null; } catch (e) {}
        if (!plan) {
          plan = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
          v.winPlan[vid] = plan;
          bump(this, 'planSeeds');
        }
        plan.target = mdef.id || null;
        plan.needWave = (mdef.wave || 1);
        if (node) plan.node = { nx: node.nx, ny: node.ny };
        var g = gearOf(this, vid);
        plan.stage = (g.armed && g.armored) ? 'party' : 'gear';
        try { plan.sinceDay = (this.state.scholar || {}).day || 0; } catch (e) {}
        return plan;
      } catch (e) { return null; }
    },
    // A fight that started with a plan party beside the fighter: the
    // party formed BEFORE the fight did its job. Called by
    // expeditionMonster right after fieldFight returns.
    winPlanNoteFight(vid, allyVids) {
      try {
        var v = this.state && this.state.village;
        var plan = (v && v.winPlan) ? v.winPlan[vid] : null;
        if (plan && (plan.stage === 'hunt' || plan.stage === 'standing' || plan.stage === 'table') &&
          allyVids && allyVids.length) bump(this, 'partyFights');
      } catch (e) {}
    },
    winPlanNoteKill(vid, mdef) {
      try {
        if (!mdef) return null;
        var v = stateOf(this);
        if (!v || !v.winPlan[vid]) return null;
        var plan = v.winPlan[vid];
        var w = mdef.wave || 1;
        var need = needWave(this);
        if (w >= 3 && (need == null || w >= need - 1)) {
          if (plan.stage === 'hunt' || plan.stage === 'party') {
            plan.stage = 'standing';
            bump(this, 'stageAdvances');
          }
        }
        return plan;
      } catch (e) { return null; }
    },
    // Haven evaluation: stage transitions from what the villager can
    // judge at home — their own gear, a beat broadcast while here, a
    // companion they can see. Never departs anyone; departure is the
    // agencyTick gate's job. Safe to call every tick for at-home
    // villagers: it seeds a plan from lived/heard knowledge (below)
    // and otherwise only touches villagers who already hold a plan.
    winPlanHavenTick(vid, hx, hy) {
      try {
        var v = this.state && this.state.village;
        if (!v || !v.winPlan) return null;
        if (!atHaven(this, vid, hx, hy)) return null;
        var plan = v.winPlan[vid];
        // ENGAGEMENT: a plan starts from lived or heard knowledge, not
        // from a hard fight alone — otherwise the whole system sleeps
        // until a villager survives a wave-3+ beast (the 30-day organic
        // smoke proved it: zero plans, zero counters). A ranger at
        // Haven who has personally fought a beast, or whose village
        // has slain one (fire knowledge — the deed talk tells
        // everyone), starts thinking in gameplan terms: gear first,
        // then party, then hunt. No roster scan: the villager learns
        // only that the village HAS kills, never who or where.
        if (!plan) {
          var prof = null;
          try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
          if (prof !== 'wanderer' && prof !== 'explorer') return null;
          var engaged = false;
          try {
            var a = this.agencyState ? this.agencyState() : null;
            var kn = a && a.know ? a.know[vid] : null;
            if (kn && kn.fought && kn.fought.length) engaged = true;
          } catch (e) {}
          if (!engaged) {
            try {
              var sl = this.state.villageSlain || {};
              for (var k in sl) if (sl[k] > 0) { engaged = true; break; }
            } catch (e) {}
          }
          if (!engaged) return null;
          plan = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
          try { plan.sinceDay = (this.state.scholar || {}).day || 0; } catch (e) {}
          v.winPlan[vid] = plan;
          bump(this, 'planSeeds');
        }
        try {
          if (typeof this.tableActive === 'function' && this.tableActive()) {
            delete v.winPlan[vid];
            return null;
          }
        } catch (e) {}
        if (plan.stage === 'gear') {
          try { if (this.villagerGearUp) this.villagerGearUp(vid, true); } catch (e) {}
          var g = gearOf(this, vid);
          if (g.armed && g.armored) { plan.stage = 'party'; bump(this, 'stageAdvances'); }
        } else if (plan.stage === 'standing') {
          var beat = deferBeat(this);
          if (beat[5] != null) { plan.stage = 'table'; bump(this, 'stageAdvances'); }
        } else if (plan.stage === 'table') {
          // A veteran who has banked the table's kill stays table-staged;
          // the guard itself lives in winPlanDepart / winPlanFightGate.
        }
        // Seed table stage from the fifth-draft beat for a living veteran
        // standing at Haven: they heard the village needs them alive.
        if (plan.stage === 'standing' || plan.stage === 'hunt') {
          var beat2 = deferBeat(this);
          if (beat2[5] != null && hasKillWaveAtLeast(this, vid, 4)) {
            plan.stage = 'table'; bump(this, 'stageAdvances');
          }
        }
        return plan;
      } catch (e) { return null; }
    },
    // Departure gate for agencyTick. Returns 'hold' (stay today),
    // 'launch' (already departed with a party — skip the chance roll),
    // or 'normal' (no plan, or the plan imposes nothing today).
    winPlanDepart(vid, hx, hy, playerAtHaven) {
      try {
        var v = this.state && this.state.village;
        if (!v || !v.winPlan || !v.winPlan[vid]) return 'normal';
        var plan = v.winPlan[vid];
        var day = 0;
        try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
        var self = this;
        var launchParty = function () {
          var cid = findCompanion(self, vid, hx, hy);
          if (!cid) return false;
          // The companion must be willing AND geared: gear them first
          // (their own stash / the deposited armory / whittle, exactly
          // what departure would do), then judge what they carry.
          try { if (self.villagerGearUp) self.villagerGearUp(cid, true); } catch (e) {}
          var cg = gearOf(self, cid);
          if (!cg.armed && !cg.armored) return false;
          // LAUNCHABILITY (checked BEFORE the inviter launches): the
          // companion must be able to leave under the same gates
          // startExpedition applies — hurt with no medicine and no
          // healer sits out, the sick stay home, no range means no
          // expedition. This is a pure read, not a second heal call:
          // calling villagerHealCheck here would spend medicine (or a
          // healer's care) twice, once here and once inside
          // startExpedition. Getting this order wrong leaves the
          // inviter out solo — the 180-day smoke caught it: 2 invites,
          // 0 departures, inviter solo, because a hurt companion's
          // startExpedition returned early after the inviter left.
          try { if ((self.state.village.sick || {})[cid]) return false; } catch (e) {}
          try { if (self.npcMaxDist && self.npcMaxDist(cid) < 1) return false; } catch (e) {}
          try {
            var ch = ((self.state.village.health || {})[cid] !== undefined) ? self.state.village.health[cid] : 100;
            if (ch < 70) {
              var canHeal = false;
              try {
                var st = self.stashState ? self.stashState() : null;
                var meds = (st && st.medicine) || [];
                var defs = {};
                var items = self.data ? self.data.items : [];
                for (var mi = 0; mi < items.length; mi++) if (items[mi]) defs[items[mi].id] = items[mi];
                for (var mj = 0; mj < meds.length; mj++) {
                  var me = meds[mj];
                  if (((me.units != null ? me.units : 1) <= 0) || (me.doses != null && me.doses <= 0)) continue;
                  if (((defs[me.itemId || me.id] || {}).healAmount || 0) > 0) { canHeal = true; break; }
                }
              } catch (e2) {}
              if (!canHeal) {
                try {
                  var place = null;
                  try {
                    if (self.campPeopleIds && self.campPeopleIds('haven').indexOf(cid) !== -1) place = 'haven';
                    else if (self.campPeopleIds && self.campPeopleIds().indexOf(cid) !== -1) place = 'here';
                  } catch (e3) {}
                  if (place && self.campHealerId && self.campHealerId(place)) canHeal = true;
                } catch (e2) {}
              }
              if (!canHeal) return false;
            }
          } catch (e) {}
          // One shared target, so the legs stay together and the fight
          // engine can find the party: the plan's known node when there
          // is one, else a fresh ranging target in the usual shape.
          var tx = null, ty = null, dur = 0;
          if (plan.node) { tx = plan.node.nx; ty = plan.node.ny; }
          else {
            var maxD = 3;
            try { maxD = self.npcMaxDist ? self.npcMaxDist(vid) : 3; } catch (e) {}
            var dist = 1 + Math.floor(Math.random() * Math.max(1, maxD));
            var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
            var d = dirs[Math.floor(Math.random() * dirs.length)];
            tx = Math.max(0, Math.min(8, hx + d[0] * dist));
            ty = Math.max(0, Math.min(8, hy + d[1] * dist));
          }
          dur = 8 + Math.floor(Math.random() * 13);
          self.startExpedition(vid, hx, hy, playerAtHaven, { tx: tx, ty: ty, duration: dur });
          try {
            var a = self.agencyState ? self.agencyState() : null;
            if (a && !a.exped[vid]) return false;
          } catch (e) {}
          bump(self, 'partyInvites');
          self.startExpedition(cid, hx, hy, false, { tx: tx, ty: ty, duration: dur });
          try {
            var a2 = self.agencyState ? self.agencyState() : null;
            if (a2 && !a2.exped[cid]) return false;
          } catch (e) {}
          plan.stage = 'hunt';
          plan.party = [cid];
          try {
            var cplan = self.winPlanOf ? self.winPlanOf(cid) : null;
            if (cplan) { cplan.stage = 'hunt'; cplan.party = [vid]; cplan.target = plan.target; cplan.node = plan.node; }
          } catch (e) {}
          bump(self, 'partyDepartures');
          return true;
        };
        if (plan.stage === 'gear') {
          try { if (this.villagerGearUp) this.villagerGearUp(vid, true); } catch (e) {}
          var g = gearOf(this, vid);
          if (!g.armed && !g.armored) { bump(this, 'gearHolds'); return 'hold'; }
          plan.stage = 'party';
          bump(this, 'stageAdvances');
        }
        if (plan.stage === 'table' && hasKillWaveAtLeast(this, vid, 4)) {
          // Guard the veteran: no solo hard departure. With a party,
          // launch; without one, hold (bounded — the fight gate is the
          // backstop if the hold ever expires).
          if (launchParty()) return 'launch';
          if (plan.holdSinceDay < 0) plan.holdSinceDay = day;
          if (day - plan.holdSinceDay < VETERAN_GUARD_DAYS) {
            bump(this, 'veteranGuardHolds');
            return 'hold';
          }
          plan.holdSinceDay = -1;
          return 'normal';
        }
        if (plan.stage === 'party' || plan.stage === 'hunt' || plan.stage === 'standing' || plan.stage === 'table') {
          if (launchParty()) return 'launch';
          if (plan.stage === 'party') {
            if (plan.holdSinceDay < 0) plan.holdSinceDay = day;
            if (day - plan.holdSinceDay < PARTY_WAIT_DAYS) {
              bump(this, 'partyWaits');
              return 'hold';
            }
            plan.holdSinceDay = -1;
          }
          return 'normal';
        }
        return 'normal';
      } catch (e) { return 'normal'; }
    },
    // Pre-fight gate for expeditionMonster. Returns null (old path),
    // {avoid:true} (no fight; plan falls back to gathering help), or
    // {seek:true} (walk in on purpose — awareness evade skipped).
    winPlanFightGate(vid, mdef) {
      try {
        if (!mdef) return null;
        var wave = mdef.wave || 1;
        var party = [vid];
        try {
          var sensed = (typeof this.villagerFightAllies === 'function') ? (this.villagerFightAllies(vid) || []) : [];
          for (var i = 0; i < sensed.length; i++) if (party.indexOf(sensed[i]) === -1) party.push(sensed[i]);
        } catch (e) {}
        var allArmed = true, allArmored = true;
        for (var j = 0; j < party.length; j++) {
          var gj = gearOf(this, party[j]);
          if (!gj.armed) allArmed = false;
          if (!gj.armored) allArmored = false;
        }
        var v = this.state && this.state.village;
        var plan = (v && v.winPlan) ? v.winPlan[vid] : null;
        var isVeteran = hasKillWaveAtLeast(this, vid, 4);
        // GUARD: a table-stage veteran does not risk the veterans bar on
        // a wave-3+ beast without a geared party beside them.
        if (plan && plan.stage === 'table' && isVeteran && wave >= 3 && (party.length < 2 || !allArmed)) {
          plan.stage = 'party'; plan.party = [];
          bump(this, 'avoidances');
          return { avoid: true, reason: 'veteran-guard', party: party.slice() };
        }
        // OUTMATCHED: a wave-4-class beast in front of a party that is
        // not full (fighter + 2, the engine's cap) and fully geared is
        // not a fight, it is a death. Go back for help instead.
        if (wave >= 4 && (party.length < 3 || !allArmed || !allArmored)) {
          if (plan) { plan.stage = (gearOf(this, vid).armed && gearOf(this, vid).armored) ? 'party' : 'gear'; plan.party = []; }
          else this.winPlanSeedFromFight(vid, mdef, 'avoided');
          bump(this, 'avoidances');
          return { avoid: true, reason: 'outmatched', party: party.slice() };
        }
        // SEEK: the villager is on a hunt/standing plan, the beast is
        // the wave the village was told it lacks (or the plan's own
        // target species), and the party beside them is real — armed,
        // and for a wave-4 beast full and armored. Then they walk in
        // instead of giving it room.
        if (plan && (plan.stage === 'hunt' || plan.stage === 'standing')) {
          var need = needWave(this);
          var targetWave = (need != null) ? need : (plan.needWave || null);
          var isTarget = (targetWave != null && wave === targetWave) ||
            (plan.target && mdef.id === plan.target) ||
            (plan.stage === 'standing' && wave >= 3);
          var partyOk = party.length >= 2 && allArmed &&
            (wave >= 4 ? (party.length >= 3 && allArmored) : gearOf(this, vid).armored);
          // TRICK: a wave-4 beast whose trick the village has not learned
          // is not a veteran-seeking fight — the field fighter opens with
          // the trick on round 1 only when the village knows it, and the
          // funnel's wave-4 fights without that opener mostly flee or die.
          // Withhold forced contact ONLY: the ordinary encounter still
          // proceeds (awareness intact), and surviving it teaches the
          // trick after two observations, so the seek opens on its own.
          if (wave >= 4 && isTarget && partyOk &&
              !(this.villageKnowsTrick && this.villageKnowsTrick(mdef.id))) {
            bump(this, 'trickHolds');
            return null;
          }
          if (isTarget && partyOk) {
            if (plan.stage === 'standing') bump(this, 'standingContacts');
            else bump(this, 'seekContacts');
            return { seek: true, reason: 'seek', party: party.slice() };
          }
        }
        return null;
      } catch (e) { return null; }
    },
    winPlanBondsTick(hx, hy) {
    try {
      var st = this.state || {};
      // TENDDRIVE-A (sim-tenddrive-a, 2026-11-08): the tending leg runs
      // WHILE national — the realm is a live relationship, and the only
      // mechanism that builds trust headroom above the 40 bar used to
      // switch off the day the realm was won (tendtrust-b: 0 engine
      // tends while nationalLive on 7/8 seeds; both national losses on
      // the 764 band are that shape). The muster stand-down leg
      // (winPlanMusterTick) keeps its own nationalLive early return.
      var prims = ownPrimaryLinks(this);
      if (prims.length < 2) return null;
      var actors = planActorsAtHaven(this, hx, hy);
      if (!actors.length) return null;
      var pd = pantryDays(this);
      if (pd == null || pd < 3) return null;
      var week = weekOf(this);
      var day = 0;
      try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
      var tended = [];
      for (var i = 0; i < prims.length; i++) {
        var l = prims[i];
        // TENDDRIVE-A: while national the cap is 55, not 50 — a link at
        // 55 banks 15 points of headroom above the 40 bar, which holds
        // the largest observed national-loss dip (12 points); at 50 it
        // banks only 10, which does not (50-12=38 < 40). Cap stays 50
        // when not national.
        if ((l.trust || 0) >= (st.nationalLive ? 55 : 50)) continue;
        if (l.tendedWeek === week) continue;
        if (l.mourningUntil && day < l.mourningUntil) continue;
        if (typeof this.tendLink !== 'function') continue;
        var paid = 0;
        try { paid = this.tendLink(l.id); } catch (e) { paid = 0; }
        if (paid > 0) { tended.push(l.id); bump(this, 'bondTends'); }
      }
      return { tended: tended, actor: actors[0] };
    } catch (e) { return null; }
    },
    winPlanMusterTick(hx, hy) {
    try {
      var st = this.state || {};
      if (st.nationalLive || st.pendingNational) return null;
      var day = 0;
      try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
      var gatePassed = !!st.networkLive && (day - (st.networkLiveDay || 0)) >= 30;
      if (gatePassed) return null;
      if (typeof this.titanMusterState !== 'function' || typeof this.titanStandDown !== 'function') return null;
      var muster = this.titanMusterState('herald');
      if (!muster) return null;
      var slain = false;
      try { slain = !!(((this.state || {}).titans || {}).slain || {}).herald; } catch (e) {}
      if (slain) return null;
      var age = day - (muster.day || day);
      if (age < 3) return null;
      var prims = ownPrimaryLinks(this);
      if (!prims.length) return null;
      var seasonedN = 0;
      for (var i = 0; i < prims.length; i++) if (linkSeasoned(this, prims[i])) seasonedN++;
      var polity = null;
      try { polity = (typeof this._havenPolity === 'function') ? this._havenPolity() : null; } catch (e) {}
      if (!(seasonedN >= 2 || !!polity)) return null;
      var weakest = Infinity;
      for (var j = 0; j < prims.length; j++) weakest = Math.min(weakest, prims[j].trust || 0);
      if (weakest >= 55) return null;
      var bled = false;
      for (var k = 0; k < prims.length && !bled; k++) {
        var hist = prims[k].history || [];
        for (var h = 0; h < hist.length; h++) if (hist[h] && hist[h].kind === 'muster-hunger') { bled = true; break; }
      }
      var pd = pantryDays(this);
      var hungry = bled || (pd != null && pd < 3);
      if (!hungry) return null;
      var actors = planActorsAtHaven(this, hx, hy, true);
      var vv = this.state.village || {};
      var committed = vv.titanCommitted || {};
      var actor = null;
      for (var a = 0; a < actors.length; a++) {
        if (committed[actors[a]] === 'herald') { actor = actors[a]; break; }
      }
      if (!actor) return null;
      var ok = false;
      try { ok = !!this.titanStandDown('herald'); } catch (e) { ok = false; }
      if (ok) { bump(this, 'musterStanddowns'); return { stoodDown: true, actor: actor }; }
      return null;
    } catch (e) { return null; }
    },
  };

  // ---- BONDS DRIVE (Arm 4 natwindow blueprint, villager-side) ----
  // Helpers shared by the two ticks below. Actors come from the
  // plan-holder set, never from a roster scan.
  function ownPrimaryLinks(self) {
    try {
      var links = (typeof self.hierarchyState === 'function') ? (self.hierarchyState() || []) : [];
      return links.filter(function (l) { return l && l.status === 'active' && l.primary === 'haven'; });
    } catch (e) { return []; }
  }
  function pantryDays(self) {
    try {
      if (typeof self.pantryDaysEstimate === 'function') {
        var d = self.pantryDaysEstimate();
        if (typeof d === 'number' && isFinite(d)) return d;
      }
    } catch (e) {}
    return null;
  }
  function weekOf(self) {
    try { if (typeof self._week === 'function') return self._week(); } catch (e) {}
    try { return Math.floor(((self.state.scholar || {}).day || 0) / 7); } catch (e) { return 0; }
  }
  function linkSeasoned(self, link) {
    try { return !!(self._linkSeasoned && self._linkSeasoned(link, !!link.conquered, true)); } catch (e) { return false; }
  }
  // allowEngaged: for the muster tick only. A muster-committed villager
  // counts as engaged (isEngaged covers titanCommitted) — and commitment
  // is exactly what qualifies them to break the muster. Excluding the
  // engaged there would leave no actor ever (the stand-down bug caught
  // by the panel: res false, muster standing, on every seed).
  function planActorsAtHaven(self, hx, hy, allowEngaged) {
    var out = [];
    try {
      var v = self.state && self.state.village;
      var plans = (v && v.winPlan) || {};
      for (var vid in plans) {
        if (!Object.prototype.hasOwnProperty.call(plans, vid)) continue;
        if (vid === self.villagerId) continue;
        if (!alive(self, vid)) continue;
        if (!atHaven(self, vid, hx, hy)) continue;
        if (!allowEngaged) { try { if (self.isEngaged && self.isEngaged(vid)) continue; } catch (e) {} }
        out.push(vid);
      }
    } catch (e) {}
    return out;
  }

  Object.assign(Game, methods);
})();
