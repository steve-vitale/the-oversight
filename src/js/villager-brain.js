// @ontology
// system: villager-brain
// description: One dawn scoring entry for Haven villagers — candidates feed, one pass picks, a log explains every pick. Phase-1 coherence only; IAUS product-of-curves arithmetic stays deferred pending Steve review.
// provides:
//   - vbrainScorePick(vid, cands, opts)
//   - vbrainLogGate(vid, kind, gateId, detail)
//   - vbrainFeedExtras(vid, cands, hx, hy)
//   - vbrainAlignObjective(vid, o, hx, hy)
//   - vbrainCommit(vid)
//   - vbrainMarkPerception(vid, reason)
//   - vbrainShouldRefresh(vid, opts)
//   - vbrainLastLog(vid)
//   - vbrainLogs()
//   - vbrainExecuteDepart(vid, hx, hy, announce)
//   - vbrainOwnsDawn()
//   - dutyFeedCands(vid)
//   - assignFeedCand(vid)
// rules:
//   - vbrain_one_dawn_entry: every dawn lead pick (gate or lottery) is recorded through this module so one log explains the choice (code: vbrainScorePick, vbrainLogGate)
//   - vbrain_legacy_weights: phase 1 keeps existing additive candidate weights and the weighted lottery; it does NOT ship the product-of-curves formula from VILLAGER-BRAIN.md (code: vbrainScorePick)
//   - vbrain_feeders_not_deciders: goals bias, win-plan stage intents, EXPEDITION, bond/link social ads, and duty ads from believed needs feed candidates here; agency chance-rolls and win-plan re-decides stop owning the day when this module is loaded (code: vbrainFeedExtras, vbrainExecuteDepart)
//   - vbrain_bond_candidates: PROPOSE_BOND / RAISE_LINK from bondFeedCands enter the dawn extras list so the initiator's scorer weighs them; warmth gate and npcInviteDecision stay in bond-initiation (code: vbrainFeedExtras, VILLAGER-BRAIN Phase 4)
//   - vbrain_duty_candidates: unassigned villagers get DUTY ads from believed village needs (objResourceBelief → forage/cook/water) and combat/social opportunity (heard danger → patrol, known prey/pantry → hunt, teachable knowledge → teach); player/convo assignTask stays a binding commitment — assigned people get no competing duty ads (code: dutyFeedCands, vbrainFeedExtras, VILLAGER-BRAIN Phase 6)
//   - vbrain_duty_pick: when a DUTY extra is top-scoring vs the core lottery pick, it becomes the dawn commitment (duty_top_score); align maps forage/water/cook/hunt/patrol/teach to real objectives — never calls assignTask (code: vbrainScorePick, vbrainAlignObjective, VILLAGER-BRAIN Phase 6)
//   - vbrain_duty_respects_garden_keeper: standing village.gardenKeeper gets no DUTY ads and cannot duty_top_score override — caretaker order stays at Haven (code: dutyFeedCands, vbrainScorePick)
//   - vbrain_duty_combat_social: hunt/patrol/teach DUTY ads honor vbrainDisableCombatSocialDuty failing control; same duty_top_score / gardenKeeper / assign_standing seams as survival DUTY (code: dutyFeedCands, VILLAGER-BRAIN Phase 6)
//   - vbrain_assign_standing: obeyed standing assignTask / conversation orders feed as ASSIGN extras and win the dawn commitment (assign_standing); scorer honors the order — not a parallel decider; obedience gate unchanged (code: assignFeedCand, vbrainScorePick, vbrainAlignObjective, VILLAGER-BRAIN Phase 6)
//   - vbrain_commitment: the dawn pick writes a commitment record the same day so midday agency honors it instead of rolling again (code: vbrainScorePick, vbrainCommit)
//   - vbrain_materialize_matches_commit: when an aimed override wins, objPick aligns the live objective kind to the commitment after core chore/facing draws (code: vbrainAlignObjective)
//   - vbrain_midday_event_only: mid-day idle/done refresh runs only when commit day/part is stale or a perception flag fired; dawn still force-refreshes (code: vbrainShouldRefresh, vbrainMarkPerception)
//   - vbrain_chain_safe: missing feeders fail silent; agency falls back to the old chance roll only when vbrainOwnsDawn is absent (code: vbrainFeedExtras)
// consumes:
//   - npcRangeProfile, npcMaxDist, agencyState (villager-agency.js)
//   - winPlanOf, winPlanHavenTick (win-plan.js) — optional feeders
//   - vgoalBiasCands (villager-goals.js) — called by objPick before this scorer
//   - bondFeedCands (bond-initiation.js) — optional PROPOSE_BOND / RAISE_LINK ads
//   - objResourceBelief (villager-objectives.js) — believed pantry/cistern for duty ads
//   - objDangerBelief (villager-objectives.js) — heard-filtered danger for patrol DUTY ads
//   - plantsKnownBy (game.js) — teachable knowledge for teach DUTY ads
//   - assignmentFor, delegateTasks, villagerCompetence (game.js) — standing orders + task catalog + competence consideration
/* VILLAGER BRAIN — src/js/villager-brain.js
 *
 * Steve (2026-11-06): "Make sure all our intelligence systems are coherent
 * and in one spot. These aren't separate systems but building one villager
 * brain..." docs/VILLAGER-BRAIN.md is the contract. Its product-of-curves
 * scoring formula is marked for review — this module implements coherence
 * (one dawn entry + explanatory log + feeder demotion), not that arithmetic.
 *
 * Phase 1 closes seams 1, 2, and 10 for the dawn:
 *   - objPick early returns and the lottery both log through here;
 *   - win-plan stage intents and EXPEDITION enter as candidates;
 *   - agencyTick stops chance-rolling / re-deciding when this module loads.
 * OVE-38 demotes seam 9's mid-day idle/done re-pick: refresh only when the
 * commitment day/part is stale or vbrainMarkPerception fired.
 *
 * Load after villager-goals.js (goals already bias the candidate list) and
 * win-plan.js (optional feeder). Self-attaching.
 */
(function () {
  'use strict';
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;

  var LOG_CAP = 400;

  function villageOf(self) {
    try { return self.state && self.state.village; } catch (e) { return null; }
  }
  function dayOf(self) {
    try { return (self.state.scholar || {}).day || 0; } catch (e) { return 0; }
  }
  function partOf(self) {
    try { return self.dayPart | 0; } catch (e) { return 0; }
  }
  function ensure(self) {
    var v = villageOf(self);
    if (!v) return null;
    if (!v.vbrain) {
      v.vbrain = { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
    }
    if (!v.vbrain.commit) v.vbrain.commit = {};
    if (!v.vbrain.perception) v.vbrain.perception = {};
    if (!v.vbrain.logs) v.vbrain.logs = [];
    if (!v.vbrain.stats) v.vbrain.stats = { picks: 0, gates: 0, expeditions: 0, winPlan: 0 };
    return v.vbrain;
  }
  function clearPerception(br, vid) {
    if (!br || !br.perception) return;
    try { delete br.perception[vid]; } catch (e) { br.perception[vid] = null; }
  }
  // Seam 9 residual: a same-day commitment is stale only when day/part
  // metadata is missing or the recorded day no longer matches. Advancing
  // day-part alone does NOT stale the lead — that was the mid-day rewrite bug.
  function commitDayPartStale(self, commit) {
    if (!commit) return true;
    if (commit.day == null || commit.part == null) return true;
    return commit.day !== dayOf(self);
  }
  function pushLog(self, entry) {
    var br = ensure(self);
    if (!br) return entry;
    br.logs.push(entry);
    if (br.logs.length > LOG_CAP) br.logs.splice(0, br.logs.length - LOG_CAP);
    return entry;
  }
  function gearRead(self, vid) {
    var person = null;
    try { person = self.getPerson ? self.getPerson(vid) : (self.vpOf ? self.vpOf(vid) : null); } catch (e) {}
    if (!person) return { armed: false, armored: false };
    var S = (_g.Scattering) || {};
    var eq = S.equipment || null;
    var items = self.data ? self.data.items : [];
    var armorP = 0, weaponB = 0, carriesWeapon = false;
    try { armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0; } catch (e) {}
    try { weaponB = (eq && eq.weaponBonusOf) ? (eq.weaponBonusOf(person, items) || 0) : 0; } catch (e) {}
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
  // Party-path companion pick: eligibility stays local; ranking is the
  // shared companionScore (OVE-54). Do not fold bond-candidate ads here.
  function findCompanion(self, vid, hx, hy) {
    try {
      var v = villageOf(self);
      if (!v) return null;
      var roster = v.roster || [];
      var trust = v.trust || {};
      var away = v.away || {};
      var elig = [];
      for (var i = 0; i < roster.length; i++) {
        var cid = roster[i];
        if (!cid || cid === vid || cid === self.villagerId) continue;
        try { var p = self.getPerson ? self.getPerson(cid) : null; if (p && p.dead) continue; } catch (e) {}
        if (away[cid]) continue;
        if (((trust[cid] === undefined) ? 10 : trust[cid]) < 15) continue;
        try {
          var n = self.npcNode ? self.npcNode(cid) : null;
          if (!n || n.nx !== hx || n.ny !== hy) continue;
        } catch (e) { continue; }
        try { if (self.isEngaged && self.isEngaged(cid)) continue; } catch (e) {}
        var prof = null;
        try { prof = self.npcRangeProfile ? self.npcRangeProfile(cid) : null; } catch (e) {}
        if (prof !== 'wanderer' && prof !== 'explorer') continue;
        try {
          var a = self.agencyState ? self.agencyState() : null;
          if (a && a.exped && a.exped[cid]) continue;
        } catch (e) {}
        elig.push(cid);
      }
      if (!elig.length) return null;
      try {
        if (self.companionRank) {
          var ranked = self.companionRank(vid, elig, { context: 'party' });
          return (ranked[0] && ranked[0].id) || null;
        }
      } catch (e) {}
      return elig[0];
    } catch (e) {}
    return null;
  }
  function hasKillWaveAtLeast(self, vid, w) {
    try {
      var ks = ((self.state && self.state.waveKillLog) || []).filter(function (e) { return e && e.by === vid; });
      for (var i = 0; i < ks.length; i++) if ((ks[i].w | 0) >= w) return true;
    } catch (e) {}
    return false;
  }
  // Deterministic [0,1) roll from villager+day — no shared Math.random, so
  // the core objective lottery's RNG stream stays byte-identical.
  function dawnHashRoll(self, vid, salt) {
    var day = dayOf(self);
    var s = String(vid || '') + ':' + day + ':' + (salt || 'exped');
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // xorshift mix
    h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16;
    return ((h >>> 0) % 10000) / 10000;
  }
  // Win-plan stage intents as candidates. Same stage reads as winPlanDepart,
  // but they bid in the dawn pass instead of re-deciding at agencyTick.
  // Read-only: never seed a plan here (winPlanOf / HavenTick would engage
  // villagers the feeder merely inspects). Stage advances stay in agencyTick.
  function winPlanCands(self, vid, hx, hy) {
    var out = [];
    try {
      var plan = null;
      try {
        var vv = self.state && self.state.village;
        plan = (vv && vv.winPlan) ? vv.winPlan[vid] : null;
      } catch (e) {}
      if (!plan || !plan.stage) return out;
      var stage = plan.stage;
      var gear = gearRead(self, vid);
      if (stage === 'gear' && !gear.armed && !gear.armored) {
        out.push({
          kind: 'HAVEN_CHORE', w: 6.0, chore: 'repair',
          vbrainSrc: 'win_plan', winPlanAction: 'gear_hold',
          considerations: [
            { id: 'win_plan_stage', raw: 1, note: 'gear' },
            { id: 'unarmed', raw: 1, note: 'hold for kit' },
          ],
        });
        return out;
      }
      var companion = findCompanion(self, vid, hx, hy);
      if (stage === 'table' && hasKillWaveAtLeast(self, vid, 4) && !companion) {
        out.push({
          kind: 'HAVEN_CHORE', w: 5.5, chore: 'repair',
          vbrainSrc: 'win_plan', winPlanAction: 'veteran_guard',
          considerations: [
            { id: 'win_plan_stage', raw: 1, note: 'table' },
            { id: 'veteran', raw: 1, note: 'no party yet' },
          ],
        });
        return out;
      }
      if ((stage === 'party' || stage === 'hunt' || stage === 'standing' || stage === 'table') && companion) {
        out.push({
          kind: 'EXPEDITION', w: 5.0, companion: companion,
          vbrainSrc: 'win_plan', winPlanAction: 'party_launch',
          considerations: [
            { id: 'win_plan_stage', raw: 1, note: stage },
            { id: 'companion', raw: 1, note: String(companion) },
          ],
        });
      } else if (stage === 'party' && !companion) {
        out.push({
          kind: 'HAVEN_CHORE', w: 4.0, chore: 'fire',
          vbrainSrc: 'win_plan', winPlanAction: 'party_wait',
          considerations: [
            { id: 'win_plan_stage', raw: 1, note: 'party' },
            { id: 'waiting_companion', raw: 1, note: 'none at haven' },
          ],
        });
      }
    } catch (e) {}
    return out;
  }
  // Agency's old explorer/wanderer chance roll, expressed as a dawn candidate
  // so departure is one pick — not a second brain negotiating by exclusion.
  // Weights stay soft vs urgent forage/water so the errand mix panel holds.
  function expeditionCand(self, vid, hx, hy) {
    try {
      var prof = null;
      try { prof = self.npcRangeProfile ? self.npcRangeProfile(vid) : null; } catch (e) {}
      if (prof !== 'wanderer' && prof !== 'explorer') return null;
      var night = false;
      try { night = !!self.isNight(); } catch (e) {}
      if (night) return null;
      try {
        if (self.npcTrigger && self.npcTrigger(vid, 'expedition_launch')) return null;
      } catch (e) {}
      var maxD = 0;
      try { maxD = self.npcMaxDist ? self.npcMaxDist(vid) : 0; } catch (e) {}
      if (maxD < 1) return null;
      try { if ((self.state.village.sick || {})[vid]) return null; } catch (e) {}
      var potential = false;
      try {
        var a = self.agencyState ? self.agencyState() : null;
        potential = !!(a && a.potential && a.potential[vid]);
      } catch (e) {}
      // ~0.09 / 0.045 per daytime agency tick × ~3 parts, diluted into the
      // dawn lottery so explorers occasionally range without owning forage.
      var w = (prof === 'explorer' ? 0.55 : 0.28);
      if (potential) w *= 1.6;
      return {
        kind: 'EXPEDITION', w: Math.round(w * 1000) / 1000,
        vbrainSrc: 'agency_range',
        considerations: [
          { id: 'range_profile', raw: 1, note: prof },
          { id: 'potential', raw: potential ? 1 : 0, note: potential ? 'rising star' : 'ordinary' },
        ],
      };
    } catch (e) { return null; }
  }
  // Phase 6 — duty ads from believed village needs (VILLAGER-BRAIN seam 7).
  // Feeder only: does not call assignTask / checkObedience. Standing player
  // or conversation assignments stay binding — assigned villagers get no
  // competing duty ads. Thresholds mirror objPick FORAGE/WATER + food_security
  // pantryDays < 3; additive weights only (no IAUS product-of-curves).
  function dutyBelievedNeeds(self, vid) {
    var out = {
      unknown: true, pantryLow: false, pantryVeryLow: false, waterLow: false,
      pantryKcal: null, pantryDays: null, waterDays: null, fromLive: false,
    };
    // Probe seam: strip the belief hook so ads stop even when pantry is low.
    try { if (self.vbrainDutyIgnoreBelief) return out; } catch (e) {}
    var bel = null;
    try { bel = self.objResourceBelief ? self.objResourceBelief(vid) : null; } catch (e) { bel = null; }
    if (!bel || bel.unknown) return out;
    out.unknown = false;
    out.fromLive = !!bel.fromLive;
    if (typeof bel.pantryKcal === 'number' && isFinite(bel.pantryKcal)) out.pantryKcal = bel.pantryKcal;
    if (typeof bel.pantryDays === 'number' && isFinite(bel.pantryDays)) out.pantryDays = bel.pantryDays;
    if (typeof bel.waterDays === 'number' && isFinite(bel.waterDays)) out.waterDays = bel.waterDays;
    var kcalLow = out.pantryKcal != null && out.pantryKcal < 4000;
    var kcalVery = out.pantryKcal != null && out.pantryKcal < 2000;
    var daysLow = out.pantryDays != null && out.pantryDays < 3;
    var daysVery = out.pantryDays != null && out.pantryDays < 1;
    out.pantryLow = kcalLow || daysLow;
    out.pantryVeryLow = kcalVery || daysVery;
    out.waterLow = out.waterDays != null && out.waterDays < 2;
    return out;
  }
  function dutyCompetenceOf(self, vid, task) {
    try {
      if (typeof self.villagerCompetence === 'function') {
        var c = self.villagerCompetence(vid, task);
        if (typeof c === 'number' && isFinite(c) && c > 0) return c;
      }
    } catch (e) {}
    return 1.0;
  }
  function dutyBuildCand(self, vid, task, baseW, needs, needNote) {
    var catalog = null;
    try { catalog = self.delegateTasks ? self.delegateTasks() : null; } catch (e) { catalog = null; }
    if (catalog && !catalog[task]) return null;
    var comp = dutyCompetenceOf(self, vid, task);
    // Mild competence nudge (±15%) — consideration, not a new curve family.
    var w = baseW * Math.min(1.15, Math.max(0.85, comp));
    w = Math.round(w * 1000) / 1000;
    var note = needNote || (needs && needs.pantryVeryLow ? 'pantry_very_low'
      : (needs && needs.pantryLow ? 'pantry_low'
        : (needs && needs.waterLow ? 'water_low' : 'need')));
    var considerations = [
      { id: 'believed_need', raw: 1, note: note },
      { id: 'competence', raw: Math.round(comp * 1000) / 1000, note: task },
    ];
    if (needs && needs.pantryKcal != null) {
      considerations.push({ id: 'believed_pantry_kcal', raw: Math.round(needs.pantryKcal), note: needs.fromLive ? 'live' : 'stale' });
    }
    if (needs && needs.pantryDays != null) {
      considerations.push({ id: 'believed_pantry_days', raw: Math.round(needs.pantryDays * 1000) / 1000, note: 'days' });
    }
    if (needs && needs.waterDays != null && task === 'water') {
      considerations.push({ id: 'believed_water_days', raw: Math.round(needs.waterDays * 1000) / 1000, note: 'days' });
    }
    return {
      kind: 'DUTY',
      dutyTask: task,
      w: w,
      vbrainSrc: 'duty',
      considerations: considerations,
    };
  }
  // Combat/social opportunity — heard danger, known prey, teachable knowledge.
  // Independent of pantry/cistern unknown: a hearer can patrol even with no
  // resource belief yet. Seam: vbrainDisableCombatSocialDuty.
  function dutyKnownPrey(self) {
    try {
      var animals = (((self.state || {}).village || {}).animals) || {};
      for (var aid in animals) {
        if (!Object.prototype.hasOwnProperty.call(animals, aid)) continue;
        var row = animals[aid];
        if (row && (row.level || 0) >= 1) return true;
      }
    } catch (e) {}
    return false;
  }
  function dutyTeachOpportunity(self, vid) {
    var known = [];
    try { known = self.plantsKnownBy ? (self.plantsKnownBy(vid) || []) : []; } catch (e) { known = []; }
    var vp = null;
    try { vp = self.vpOf ? self.vpOf(vid) : null; } catch (e) { vp = null; }
    var knowsTrap = !!(vp && (vp.knowsSnare || vp.knowsPit));
    if ((!known || !known.length) && !knowsTrap) return false;
    var roster = ((((self.state || {}).village || {}).roster) || []);
    for (var i = 0; i < roster.length; i++) {
      var rid = roster[i];
      if (!rid || rid === vid) continue;
      try { if (rid === self.villagerId) continue; } catch (e) {}
      var other = [];
      try { other = self.plantsKnownBy ? (self.plantsKnownBy(rid) || []) : []; } catch (e) { other = []; }
      for (var j = 0; j < known.length; j++) {
        if (other.indexOf(known[j]) === -1) return true;
      }
      if (knowsTrap) {
        var ovp = null;
        try { ovp = self.vpOf ? self.vpOf(rid) : null; } catch (e) { ovp = null; }
        if (ovp) {
          if (vp.knowsSnare && !ovp.knowsSnare) return true;
          if (vp.knowsPit && !ovp.knowsPit) return true;
        } else {
          return true;
        }
      }
    }
    return false;
  }
  function dutyFeedCandsFor(self, vid) {
    var out = [];
    if (!vid) return out;
    try { if (self.vbrainDisableDutyCands) return out; } catch (e) {}
    try { if (vid === self.villagerId) return out; } catch (e) {}
    // Standing assignTask / conversation order — scorer honors it: no ads.
    try {
      var asg = null;
      if (typeof self.assignmentFor === 'function') asg = self.assignmentFor(vid);
      else asg = ((self.state || {}).village || {}).assignments
        ? ((self.state.village.assignments || {})[vid] || null) : null;
      if (asg && asg.task && asg.task !== 'rest') return out;
    } catch (e) {}
    // Standing garden caretaker — keep them at Haven; DUTY must not pull them.
    try {
      var gk = ((self.state || {}).village || {}).gardenKeeper;
      if (gk && gk === vid) return out;
    } catch (e) {}
    try {
      var vpDead = self.vpOf ? self.vpOf(vid) : null;
      if (vpDead && vpDead.dead) return out;
    } catch (e) {}
    var needs = dutyBelievedNeeds(self, vid);
    // Survival DUTY ads still need a non-unknown resource belief.
    if (!needs.unknown) {
      if (needs.pantryLow) {
        var forageW = needs.pantryVeryLow ? 3.2 : 2.2;
        var cookW = needs.pantryVeryLow ? 2.4 : 1.6;
        var fc = dutyBuildCand(self, vid, 'forage', forageW, needs);
        var cc = dutyBuildCand(self, vid, 'cook', cookW, needs);
        if (fc) out.push(fc);
        if (cc) out.push(cc);
      }
      if (needs.waterLow) {
        var ww = 3.0 + (2 - (needs.waterDays == null ? 2 : needs.waterDays)) * 1.5;
        if (needs.waterDays != null && needs.waterDays < 1) ww = Math.max(ww, 5.5);
        var wc = dutyBuildCand(self, vid, 'water', ww, needs);
        if (wc) out.push(wc);
      }
    }
    // Combat + social DUTY ads (OVE-71): same DUTY shape / duty_top_score path.
    // Do not require pantry belief — heard danger and teachable knowledge stand alone.
    var roleDutyOff = false;
    try { roleDutyOff = !!self.vbrainDisableCombatSocialDuty; } catch (e) { roleDutyOff = false; }
    if (!roleDutyOff) {
      var danger = null;
      try { danger = self.objDangerBelief ? self.objDangerBelief(vid) : null; } catch (e) { danger = null; }
      var heardThreat = !!(danger && (danger.threat || danger.freshRaid));
      if (heardThreat) {
        var patrolW = danger.freshRaid ? 3.0 : 2.5;
        var pc = dutyBuildCand(self, vid, 'patrol', patrolW, needs, danger.freshRaid ? 'fresh_raid' : 'heard_danger');
        if (pc) out.push(pc);
      }
      var preyKnown = dutyKnownPrey(self);
      var huntFromNeed = !needs.unknown && needs.pantryLow;
      if (preyKnown || huntFromNeed) {
        var huntW = huntFromNeed ? (needs.pantryVeryLow ? 2.0 : 1.8) : 2.0;
        var hc = dutyBuildCand(self, vid, 'hunt', huntW, needs, preyKnown ? 'known_prey' : 'pantry_protein');
        if (hc) out.push(hc);
      }
      if (dutyTeachOpportunity(self, vid)) {
        var tc = dutyBuildCand(self, vid, 'teach', 2.4, needs, 'teachable_knowledge');
        if (tc) out.push(tc);
      }
    }
    return out;
  }
  function standingAssignmentOf(self, vid) {
    var asg = null;
    try {
      if (typeof self.assignmentFor === 'function') asg = self.assignmentFor(vid);
      else asg = ((self.state || {}).village || {}).assignments
        ? ((self.state.village.assignments || {})[vid] || null) : null;
    } catch (e) { asg = null; }
    if (!asg || !asg.task || asg.task === 'rest') return null;
    return asg;
  }
  // Player/conversation assignTask as a dawn feeder — binding commitment the
  // scorer honors (Phase 6). Does not rewrite assignments or re-check obedience;
  // the order already cleared the gate when written.
  function assignFeedCandFor(self, vid) {
    if (!vid) return null;
    try { if (self.vbrainDisableAssignCands) return null; } catch (e) {}
    try { if (vid === self.villagerId) return null; } catch (e) {}
    try {
      var vp = self.vpOf ? self.vpOf(vid) : null;
      if (vp && vp.dead) return null;
    } catch (e) {}
    var asg = standingAssignmentOf(self, vid);
    if (!asg) return null;
    var task = asg.task;
    var catalog = null;
    try { catalog = self.delegateTasks ? self.delegateTasks() : null; } catch (e) { catalog = null; }
    if (catalog && !catalog[task]) return null;
    var chore = null;
    if (task === 'cook' || task === 'tend' || task === 'teach' || task === 'mend' || task === 'garden') {
      chore = task === 'tend' ? 'fire' : task;
    }
    return {
      kind: 'ASSIGN',
      assignTask: task,
      dutyTask: task,
      chore: chore,
      w: 99,
      vbrainSrc: 'assign',
      considerations: [
        { id: 'standing_order', raw: 1, note: asg.via || 'assignTask' },
        { id: 'obedience', raw: 1, note: 'already_obeyed' },
      ],
    };
  }
  function annotateCand(c) {
    var considerations = (c.considerations || []).slice();
    considerations.unshift({
      id: 'base_weight',
      raw: Math.round((c.w || 0) * 1000) / 1000,
      note: 'legacy additive weight',
    });
    if (c.vgoal) {
      considerations.push({
        id: 'vgoal_bias',
        raw: Math.round((c.vgoalW || 0) * 1000) / 1000,
        note: c.vgoal,
      });
    }
    if (c.vbrainSrc) {
      considerations.push({
        id: 'feeder',
        raw: 1,
        note: c.vbrainSrc,
      });
    }
    return {
      kind: c.kind,
      score: Math.round((c.w || 0) * 1000) / 1000,
      targetVid: c.targetVid || null,
      villageId: c.villageId || null,
      chore: c.chore || null,
      dutyTask: c.dutyTask || null,
      assignTask: c.assignTask || null,
      vgoal: c.vgoal || null,
      vbrainSrc: c.vbrainSrc || null,
      winPlanAction: c.winPlanAction || null,
      companion: c.companion || null,
      bondAct: c.bondAct || null,
      considerations: considerations,
    };
  }
  function writeCommit(self, vid, chosen, entry) {
    var br = ensure(self);
    if (!br) return;
    br.commit[vid] = {
      kind: chosen.kind,
      day: dayOf(self),
      part: partOf(self),
      scoreAtChoice: chosen.score != null ? chosen.score : (chosen.w || 0),
      vgoal: chosen.vgoal || null,
      vgoalLine: chosen.vgoalLine || null,
      chore: chosen.chore || null,
      dutyTask: chosen.dutyTask || null,
      assignTask: chosen.assignTask || null,
      vbrainSrc: chosen.vbrainSrc || null,
      winPlanAction: chosen.winPlanAction || null,
      companion: chosen.companion || null,
      logIndex: br.logs.length - 1,
    };
    // A real re-score consumes the perception event that authorized it.
    clearPerception(br, vid);
    br.stats.picks = (br.stats.picks || 0) + 1;
    if (chosen.kind === 'EXPEDITION') br.stats.expeditions = (br.stats.expeditions || 0) + 1;
    if (chosen.winPlanAction) br.stats.winPlan = (br.stats.winPlan || 0) + 1;
    return br.commit[vid];
  }

  var methods = {
    vbrainOwnsDawn: function () { return true; },
    vbrainCommit: function (vid) {
      var br = ensure(this);
      return (br && br.commit) ? (br.commit[vid] || null) : null;
    },
    // Perception-changing event → authorize one mid-day re-score (seam 9).
    vbrainMarkPerception: function (vid, reason) {
      var br = ensure(this);
      if (!br) return null;
      br.perception[vid] = {
        reason: reason || 'event',
        day: dayOf(this),
        part: partOf(this),
      };
      return br.perception[vid];
    },
    // Mid-day idle/done may refresh only when commit day/part is stale or a
    // perception flag fired. Dawn callers pass { dawn: true } / { force: true }.
    vbrainShouldRefresh: function (vid, opts) {
      opts = opts || {};
      if (opts.force || opts.dawn) return true;
      try {
        if (typeof this.vbrainOwnsDawn !== 'function' || !this.vbrainOwnsDawn()) return true;
      } catch (e) { return true; }
      var br = ensure(this);
      if (!br) return true;
      var c = br.commit ? br.commit[vid] : null;
      if (commitDayPartStale(this, c)) return true;
      if (br.perception && br.perception[vid]) return true;
      return false;
    },
    vbrainLastLog: function (vid) {
      var br = ensure(this);
      if (!br || !br.logs || !br.logs.length) return null;
      for (var i = br.logs.length - 1; i >= 0; i--) {
        if (br.logs[i] && br.logs[i].vid === vid) return br.logs[i];
      }
      return null;
    },
    vbrainLogs: function () {
      var br = ensure(this);
      return (br && br.logs) ? br.logs.slice() : [];
    },
    // Hard early returns (escape/rest/eat/haul/seek) still win as gates —
    // scored in the open so the log shows why they beat the lottery.
    vbrainLogGate: function (vid, kind, gateId, detail) {
      var entry = {
        day: dayOf(this),
        part: partOf(this),
        vid: vid,
        mode: 'gate',
        pick: kind,
        gate: gateId,
        detail: detail || null,
        candidates: [{
          kind: kind,
          score: 1,
          considerations: [
            { id: gateId, raw: 1, note: 'hard gate' },
            { id: 'lottery', raw: 0, note: 'bypassed' },
          ],
        }],
      };
      var br = ensure(this);
      if (br) br.stats.gates = (br.stats.gates || 0) + 1;
      pushLog(this, entry);
      writeCommit(this, vid, { kind: kind, score: 1, vbrainSrc: 'gate:' + gateId }, entry);
      return entry;
    },
    // Append win-plan + EXPEDITION + bond/link + duty (believed-need) +
    // standing assignTask ads. Marked with vbrainSrc so the scorer keeps
    // them out of the core weight pool — core errand mix stays the legacy
    // lottery; extras override in-log. Bond ads are scored for the log;
    // entry points still execute propose/stage after the initiator's
    // bondScoreCands weigh. Duty ads advertise production work from belief;
    // ASSIGN feeds the obeyed standing order as a binding commitment.
    vbrainFeedExtras: function (vid, cands, hx, hy) {
      if (!cands) return cands;
      try { if (this.vbrainDisableExtras) return cands; } catch (e) {}
      var wp = winPlanCands(this, vid, hx, hy);
      for (var i = 0; i < wp.length; i++) cands.push(wp[i]);
      var hasExped = false;
      for (var j = 0; j < cands.length; j++) if (cands[j].kind === 'EXPEDITION') { hasExped = true; break; }
      if (!hasExped) {
        var ex = expeditionCand(this, vid, hx, hy);
        if (ex) cands.push(ex);
      }
      // Phase 4 social: PROPOSE_BOND / RAISE_LINK as scored extras.
      try {
        if (typeof this.bondFeedCands === 'function' && !this.vbrainDisableBondCands) {
          var bondCands = this.bondFeedCands(vid) || [];
          for (var bi = 0; bi < bondCands.length; bi++) cands.push(bondCands[bi]);
        }
      } catch (e) {}
      // Phase 6 roles: DUTY ads from believed pantry/cistern needs.
      try {
        if (!this.vbrainDisableDutyCands) {
          var dutyCands = dutyFeedCandsFor(this, vid) || [];
          for (var di = 0; di < dutyCands.length; di++) cands.push(dutyCands[di]);
        }
      } catch (e) {}
      // Phase 6: standing assignTask as a binding ASSIGN feeder.
      try {
        if (!this.vbrainDisableAssignCands) {
          var assignCand = assignFeedCandFor(this, vid);
          if (assignCand) cands.push(assignCand);
        }
      } catch (e) {}
      return cands;
    },
    // Dawn / probe feed: DUTY candidates for one unassigned villager from
    // believed village needs + combat/social opportunity. Empty when assigned,
    // gardenKeeper, or no survival/role opportunity (or seams disabled).
    // Does not write assignments.
    dutyFeedCands: function (vid) {
      try { return dutyFeedCandsFor(this, vid) || []; } catch (e) { return []; }
    },
    // Dawn / probe feed: standing assignTask order as one ASSIGN candidate.
    // Empty when unassigned / rest / dead. Does not rewrite assignments.
    assignFeedCand: function (vid) {
      try { return assignFeedCandFor(this, vid); } catch (e) { return null; }
    },
    // THE dawn scoring entry. Core candidates (no vbrainSrc) use the legacy
    // additive weighted lottery — same arithmetic as pre-brain objPick, same
    // RNG draws. Extras (win-plan / EXPEDITION) are scored into the log and
    // may override without consuming Math.random (hash roll / priority).
    // Product-of-curves IAUS formula is intentionally NOT used (for review).
    vbrainScorePick: function (vid, cands, opts) {
      opts = opts || {};
      var list = cands || [];
      var core = [];
      var extras = [];
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i] && list[i].vbrainSrc) extras.push(list[i]);
        else core.push(list[i]);
      }
      var annotated = [];
      var coreTot = 0;
      for (i = 0; i < core.length; i++) {
        var ac = annotateCand(core[i]);
        annotated.push(ac);
        if (ac.score > 0) coreTot += ac.score;
      }
      for (i = 0; i < extras.length; i++) annotated.push(annotateCand(extras[i]));

      var chosen = core.length ? core[core.length - 1] : null;
      if (coreTot > 0 && core.length) {
        var rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
        var r = rng() * coreTot;
        for (i = 0; i < core.length; i++) {
          r -= (core[i].w || 0);
          if (r <= 0) { chosen = core[i]; break; }
        }
      }
      var coreKind = chosen ? chosen.kind : null;
      var override = null;
      var overrideReason = null;
      // Win-plan holds / party launches outrank the soft lottery when live.
      for (i = 0; i < extras.length; i++) {
        var exi = extras[i];
        if (exi.winPlanAction === 'gear_hold' || exi.winPlanAction === 'veteran_guard' ||
            exi.winPlanAction === 'party_wait' || exi.winPlanAction === 'party_launch') {
          override = exi; overrideReason = 'win_plan:' + exi.winPlanAction; break;
        }
      }
      // Phase 6: standing assignTask is a binding commitment the scorer
      // honors (hard inertia) — outranks soft DUTY ads / expedition hash.
      // Win-plan holds/launches still outrank (table path). Materialize stays
      // core (OVE-36); align maps assignTask onto a real objective. Seam:
      // vbrainDisableAssignPick strips the pick hook (ASSIGN still scores).
      if (!override) {
        try {
          if (!this.vbrainDisableAssignPick) {
            for (i = 0; i < extras.length; i++) {
              if (!extras[i] || extras[i].kind !== 'ASSIGN') continue;
              override = extras[i];
              overrideReason = 'assign_standing';
              break;
            }
          }
        } catch (e) {}
      }
      // Phase 6: DUTY extras compete by score. When the best DUTY weight beats
      // or ties the core lottery pick, it wins the commitment (no Math.random;
      // core stream untouched). Does not call assignTask — align maps the
      // dutyTask onto a real objective the person will pursue. Standing
      // gardenKeeper never overrides (same honor as dutyFeedCands). Seams:
      // vbrainDisableDutyPick strips the pick hook (ads still score).
      if (!override) {
        try {
          if (!this.vbrainDisableDutyPick) {
            var isGardenKeeper = false;
            try {
              var gkPick = ((this.state || {}).village || {}).gardenKeeper;
              isGardenKeeper = !!(gkPick && gkPick === vid);
            } catch (eGk) { isGardenKeeper = false; }
            if (!isGardenKeeper) {
              var bestDuty = null;
              for (i = 0; i < extras.length; i++) {
                if (!extras[i] || extras[i].kind !== 'DUTY') continue;
                if (!bestDuty || (extras[i].w || 0) > (bestDuty.w || 0)) bestDuty = extras[i];
              }
              var coreW = chosen ? (chosen.w || 0) : 0;
              if (bestDuty && (bestDuty.w || 0) >= coreW) {
                override = bestDuty;
                overrideReason = 'duty_top_score';
              }
            }
          }
        } catch (e) {}
      }
      // Soft EXPEDITION: only when the core pick would keep them home, so the
      // ranging brain replaces hall time rather than stealing forage/water.
      // Hash roll — no Math.random — keeps the core lottery stream intact.
      if (!override) {
        for (i = 0; i < extras.length; i++) {
          if (extras[i].kind !== 'EXPEDITION') continue;
          var indoorCore = coreKind === 'HAVEN_CHORE' || coreKind === 'REST' ||
            coreKind === 'EAT' || coreKind === 'SEEK';
          if (!indoorCore) break;
          var chance = Math.min(0.95, (extras[i].w || 0) / 2); // w~0.55 → ~0.275
          if (dawnHashRoll(this, vid, 'exped') < chance) {
            override = extras[i];
            overrideReason = 'expedition_hash';
          }
          break;
        }
      }
      // Return the CORE pick so objPick still runs chore/facing draws on the
      // legacy lottery kind (panel byte-stability). Commitment + log carry the
      // aimed override; objPick calls vbrainAlignObjective afterward so the
      // live objective kind matches the commit without extra Math.random.
      var materialize = chosen;
      var logged = override || chosen;
      var chosenAnn = logged ? annotateCand(logged) : null;

      var entry = {
        day: dayOf(this),
        part: partOf(this),
        vid: vid,
        mode: 'lottery',
        pick: logged ? logged.kind : null,
        total: Math.round(coreTot * 1000) / 1000,
        candidates: annotated,
        pickScore: chosenAnn ? chosenAnn.score : 0,
        pickSrc: logged ? (logged.vbrainSrc || logged.vgoal || 'objectives') : null,
        winPlanAction: logged ? (logged.winPlanAction || null) : null,
        override: overrideReason,
        corePick: coreKind,
      };
      pushLog(this, entry);
      if (logged) writeCommit(this, vid, Object.assign({}, logged, { score: chosenAnn ? chosenAnn.score : logged.w }), entry);
      return materialize;
    },
    // OVE-36 / Candidate A: after objPick materializes the core lottery kind
    // (preserving chore/facing RNG), rewrite the live objective to the dawn
    // commitment when an aimed override won. No Math.random here.
    vbrainAlignObjective: function (vid, o, hx, hy) {
      if (!o) return o;
      var log = null;
      try { log = this.vbrainLastLog(vid); } catch (e) { log = null; }
      if (!log || !log.override) return o;
      var c = null;
      try { c = this.vbrainCommit(vid); } catch (e) { c = null; }
      if (!c || !c.kind) return o;
      if (c.day != null && c.day !== dayOf(this)) return o;
      // Win-plan holds: hall chore matching the commit (repair/fire/…).
      // Always overwrite chore — core lottery may have drawn a different tag.
      if (c.winPlanAction === 'gear_hold' || c.winPlanAction === 'veteran_guard' ||
          c.winPlanAction === 'party_wait') {
        o.kind = c.kind || 'HAVEN_CHORE';
        o.purpose = 'chore';
        o.indoor = true;
        o.state = 'indoor';
        o.tx = hx; o.ty = hy; o.tightness = 0;
        o.targetVid = null;
        o.companion = null;
        o.chore = c.chore || (c.winPlanAction === 'party_wait' ? 'fire' : 'repair');
        if (c.vgoal) { o.goal = c.vgoal; o.goalLine = c.vgoalLine || null; }
        return o;
      }
      // EXPEDITION (hash or party_launch): kind reads the commit; keep an
      // indoor chore hold so agencyTick can launch without a second lottery.
      if (c.kind === 'EXPEDITION') {
        o.kind = 'EXPEDITION';
        o.purpose = 'chore';
        o.indoor = true;
        o.state = 'indoor';
        o.tx = hx; o.ty = hy; o.tightness = 0;
        if (!o.chore) o.chore = c.chore || 'repair';
        if (c.companion) o.companion = c.companion;
        if (c.vgoal) { o.goal = c.vgoal; o.goalLine = c.vgoalLine || null; }
        return o;
      }
      // DUTY top-score / ASSIGN standing: map task onto a real errand.
      // DUTY never writes assignTask; ASSIGN honors the standing order.
      if (c.kind === 'DUTY' || c.kind === 'ASSIGN') {
        var dutyTask = (c.kind === 'ASSIGN' ? (c.assignTask || c.dutyTask) : c.dutyTask) || null;
        var faceKey = (c.kind === 'ASSIGN' ? 'assign' : 'duty') + '-face-' + dutyTask;
        var distKey = (c.kind === 'ASSIGN' ? 'assign' : 'duty') + '-dist-' + dutyTask;
        var faceOutdoor = function (purpose, partsDefault, kindOverride) {
          o.kind = kindOverride || (purpose === 'water' ? 'WATER' : (purpose === 'hunt' ? 'HUNT' : (purpose === 'explore' ? 'EXPLORE' : 'FORAGE')));
          o.purpose = purpose;
          o.indoor = false;
          o.state = 'ready';
          o.targetVid = null;
          o.companion = null;
          o.chore = null;
          if (o.partsLeft == null) o.partsLeft = partsDefault;
          // Keep core outdoor facing when materialize already left home;
          // otherwise plant a hash facing (no Math.random — OVE-36).
          var atHome = (o.tx == null || o.ty == null || (o.tx === hx && o.ty === hy));
          if (atHome) {
            var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
            var di = Math.floor(dawnHashRoll(this, vid, faceKey) * dirs.length) % dirs.length;
            var dist = 1 + Math.floor(dawnHashRoll(this, vid, distKey) * 2);
            o.tx = Math.max(0, Math.min(8, hx + dirs[di][0] * dist));
            o.ty = Math.max(0, Math.min(8, hy + dirs[di][1] * dist));
            if (o.tx === hx && o.ty === hy) o.tx = Math.max(0, Math.min(8, hx + 1));
            o.tightness = dist;
          } else if (o.tightness == null) {
            o.tightness = Math.abs((o.tx || hx) - hx) + Math.abs((o.ty || hy) - hy);
          }
        }.bind(this);
        var faceHaven = function (chore) {
          o.kind = 'HAVEN_CHORE';
          o.purpose = 'chore';
          o.chore = chore || 'fire';
          o.indoor = true;
          o.state = 'indoor';
          o.tx = hx; o.ty = hy; o.tightness = 0;
          o.targetVid = null;
          o.companion = null;
        };
        if (dutyTask === 'forage') {
          faceOutdoor('forage', 3);
        } else if (dutyTask === 'water') {
          faceOutdoor('water', 2);
        } else if (dutyTask === 'cook') {
          faceHaven('cook');
        } else if (dutyTask === 'garden' || dutyTask === 'tend' ||
                   dutyTask === 'teach' || dutyTask === 'mend') {
          // Haven work — DUTY teach (OVE-71) and ASSIGN haven orders share this.
          // gardenKeeper honor stays via gardenKeeperTurn / dutyFeed skip.
          faceHaven(dutyTask === 'tend' ? 'fire' : dutyTask);
        } else if (dutyTask === 'hunt') {
          faceOutdoor('hunt', 3, 'HUNT');
        } else if (dutyTask === 'scout' || dutyTask === 'patrol') {
          faceOutdoor('explore', 3, 'EXPLORE');
        } else if (c.kind === 'ASSIGN' && (dutyTask === 'wood' || dutyTask === 'stone' ||
                   dutyTask === 'deadfall' || dutyTask === 'fish')) {
          faceOutdoor('forage', 3);
        } else {
          // Unknown dutyTask: keep materialize; commitment still records kind.
          return o;
        }
        // OVE-74: DUTY stamps practiceTask so objective completion can accrue
        // villagerPractice without writing assignTask. ASSIGN keeps practice on
        // resolveOneAssignment — do not stamp, or the same work would double.
        if (c.kind === 'DUTY' && dutyTask) o.practiceTask = dutyTask;
        else if (c.kind === 'ASSIGN') o.practiceTask = null;
        if (c.vgoal) { o.goal = c.vgoal; o.goalLine = c.vgoalLine || null; }
        return o;
      }
      // Any other aimed override: kind/purpose follow commit; no new draws.
      o.kind = c.kind;
      if (c.chore) o.chore = c.chore;
      if (c.targetVid) o.targetVid = c.targetVid;
      if (c.companion) o.companion = c.companion;
      if (c.vgoal) { o.goal = c.vgoal; o.goalLine = c.vgoalLine || null; }
      return o;
    },
    // Agency-tick executor: honor today's dawn commitment. No new strategy.
    vbrainExecuteDepart: function (vid, hx, hy, announce) {
      var c = this.vbrainCommit(vid);
      if (!c || c.day !== dayOf(this)) return 'normal';
      if (c.winPlanAction === 'gear_hold' || c.winPlanAction === 'veteran_guard' || c.winPlanAction === 'party_wait') {
        return 'hold';
      }
      if (c.kind !== 'EXPEDITION') return 'normal';
      try {
        var a = this.agencyState ? this.agencyState() : null;
        if (a && a.exped && a.exped[vid]) return 'launch';
      } catch (e) {}
      var opts = null;
      if (c.winPlanAction === 'party_launch' && c.companion && typeof this.startExpedition === 'function') {
        // Mirror winPlanDepart's shared-target party launch, owned by the
        // dawn commitment rather than a midday re-decide.
        var tx = null, ty = null, dur = 0;
        try {
          var plan = this.winPlanOf ? this.winPlanOf(vid) : null;
          if (plan && plan.node) { tx = plan.node.nx; ty = plan.node.ny; }
        } catch (e) {}
        if (tx == null) {
          var maxD = 3;
          try { maxD = this.npcMaxDist ? this.npcMaxDist(vid) : 3; } catch (e) {}
          var dist = 1 + Math.floor(Math.random() * Math.max(1, maxD));
          var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
          var d = dirs[Math.floor(Math.random() * dirs.length)];
          tx = Math.max(0, Math.min(8, hx + d[0] * dist));
          ty = Math.max(0, Math.min(8, hy + d[1] * dist));
        }
        dur = 8 + Math.floor(Math.random() * 13);
        opts = { tx: tx, ty: ty, duration: dur };
        this.startExpedition(vid, hx, hy, announce, opts);
        try {
          var a2 = this.agencyState ? this.agencyState() : null;
          if (!a2 || !a2.exped[vid]) return 'hold';
        } catch (e) {}
        this.startExpedition(c.companion, hx, hy, false, opts);
        try {
          var plan2 = this.winPlanOf ? this.winPlanOf(vid) : null;
          if (plan2) { plan2.stage = 'hunt'; plan2.party = [c.companion]; }
          var cplan = this.winPlanOf ? this.winPlanOf(c.companion) : null;
          if (cplan) { cplan.stage = 'hunt'; cplan.party = [vid]; }
        } catch (e) {}
        return 'launch';
      }
      if (typeof this.startExpedition === 'function') {
        this.startExpedition(vid, hx, hy, announce, opts);
        return 'launch';
      }
      return 'normal';
    },
  };
  Object.assign(G, methods);
})();
