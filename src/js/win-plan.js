// @ontology
// system: win-plan
// description: Villagers pursuing a winning gameplan, in ordered stages.
// provides:
//   - winPlanOf(vid)
//   - winPlanStats()
//   - winPlanOnVillagerDeath(vid)
//   - winPlanOnVillagerLeave(vid)
//   - winPlanHavenTick(vid, hx, hy)
//   - winPlanDepart(vid, hx, hy, announce)
//   - winPlanFightGate(vid, mdef)
//   - winPlanSeedFromFight(vid, mdef, outcome)
//   - winPlanNoteKill(vid, mdef)
//   - winPlanNoteFight(vid, allyVids)
//   - winPlanNoteSighting(mid)
//   - winPlanCommitDeadTarget(vid)
//   - winPlanReseedLaunchBeat(vid)
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
//   - winplan_dead_target_reseed: a departure never chases a dead (code: winPlanCommitDeadTarget, winPlanDepart, vbrainExecuteDepart)
//     target type (sim-reseed-b, finding #2626). At the commit point,
//     when the plan's target type is recorded slain in villageSlain
//     AND no sighting of the type has been noted since the kill day
//     (villageLastSeenDay, stamped by winPlanNoteSighting from
//     fieldFight on every live contact), the plan RE-SEEDS from
//     rumors the holder has actually heard — their own fought
//     species, their own fight memories, then village sightings —
//     or EXPIRES (dissolves with a fireside beat) when no live rumor
//     exists. An expired plan re-attempts the re-seed on every later
//     commit and holds meanwhile; it never launches targetless. When
//     the expired plan DOES re-seed, the fireside beat is spoken at
//     the LAUNCH, not the commit (sim-reseedbeat-b, finding #2632):
//     the commit stamps plan.reseedLaunchBeat and
//     winPlanReseedLaunchBeat speaks it once the expedition has
//     started — the commit and the departure can split across days,
//     and the player must hear the hunter go out. A sighting after
//     the kill day re-opens the type. Type-level, not
//     instance-level: the plan store holds a target type, never a
//     monster instance identity. Env-gated default-OFF
//     (PLANRESEED=1). It never touches winPlanNoteKill,
//     winPlanFightGate, winPlanCands, or winPlanSeedFromFight.
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
      partyTrios: 0, partyQuads: 0, partyDissolved: 0, deathCleanups: 0, removalCleanups: 0,
      planReseeds: 0, planExpiries: 0,
    };
    if (v.winPlanStats.planReseeds == null) v.winPlanStats.planReseeds = 0;
    if (v.winPlanStats.planExpiries == null) v.winPlanStats.planExpiries = 0;
    if (v.winPlanStats.trickHolds == null) v.winPlanStats.trickHolds = 0;
    if (v.winPlanStats.partyTrios == null) v.winPlanStats.partyTrios = 0;
    if (v.winPlanStats.partyQuads == null) v.winPlanStats.partyQuads = 0;
    if (v.winPlanStats.partyDissolved == null) v.winPlanStats.partyDissolved = 0;
    if (v.winPlanStats.deathCleanups == null) v.winPlanStats.deathCleanups = 0;
    if (v.winPlanStats.removalCleanups == null) v.winPlanStats.removalCleanups = 0;
    if (v.winPlanStats.bondTends == null) v.winPlanStats.bondTends = 0;
    if (v.winPlanStats.musterStanddowns == null) v.winPlanStats.musterStanddowns = 0;
    return v;
  }
  function bump(self, key) {
    try { var v = stateOf(self); if (v) v.winPlanStats[key] = (v.winPlanStats[key] || 0) + 1; } catch (e) {}
  }
  // purgePartyRefs(v, vid): the shared party-purge core for both
  // removal cleanups (death + leave). Strikes vid from every living
  // holder's party; a party/hunt plan whose party empties falls back
  // to 'party' (re-seek a companion). standing/table plans keep their
  // stage (the kill is banked; the party list is vestigial there).
  // Pure data work on the already-read village object — never calls
  // stateOf(), so it cannot ignite the plan system. Returns the
  // number of party refs purged.
  function purgePartyRefs(v, vid) {
    var purged = 0;
    for (var hid in v.winPlan) {
      if (!Object.prototype.hasOwnProperty.call(v.winPlan, hid)) continue;
      var plan = v.winPlan[hid];
      if (!plan || !plan.party || !plan.party.length) continue;
      var before = plan.party.length;
      plan.party = plan.party.filter(function (pid) { return pid !== vid; });
      var n = before - plan.party.length;
      if (n > 0) {
        purged += n;
        if (!plan.party.length && (plan.stage === 'party' || plan.stage === 'hunt')) plan.stage = 'party';
      }
    }
    return purged;
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
  // Ranking among eligibles is shared companionScore (OVE-54) — not
  // roster-first match.
  function findCompanion(self, vid, hx, hy) {
    try {
      var v = self.state && self.state.village;
      if (!v) return null;
      var roster = v.roster || [];
      var trust = v.trust || {};
      var away = v.away || {};
      var elig = [];
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
        if (!profilegate4OpenFor(self, vid) && prof !== 'wanderer' && prof !== 'explorer') continue;
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

  // VETREENGAGE env gate (sim-vetreengage-a): the re-engagement lever
  // is OFF unless the process env carries VETREENGAGE=1 (node sims
  // only; in the browser process is undefined, so the lever is off).
  function vetreengageOn() {
    try { return typeof process !== 'undefined' && process.env && process.env.VETREENGAGE === '1'; } catch (e) { return false; }
  }

  // WILDAVOID env gate (sim-wildavoid-a, finding #2506): the wild
  // outmatched-avoid is OFF unless the process env carries WILDAVOID=1
  // (node sims only; in the browser process is undefined, so the lever
  // is off).
  function wildavoidOn() {
    try { return typeof process !== 'undefined' && process.env && process.env.WILDAVOID === '1'; } catch (e) { return false; }
  }

  // PLANFIX env gate (sim-planignite-fix-a): initialize the plan
  // store on first HavenTick. OFF unless the process env carries
  // PLANFIX=1 (node sims only; in the browser process is undefined,
  // so the lever is off).
  function planfixOn() {
    try { return typeof process !== 'undefined' && process.env && process.env.PLANFIX === '1'; } catch (e) { return false; }
  }

  // FLEEREPAIR2 env gate (sim-fleerepair2-b, finding #2500): never
  // seed a kill-hunt plan onto a leave-counter species. OFF unless
  // the process env carries FLEEREPAIR2=1 (node sims only; in the
  // browser process is undefined, so the lever is off).
  function fleerepair2On() {
    try { return typeof process !== 'undefined' && process.env && process.env.FLEEREPAIR2 === '1'; } catch (e) { return false; }
  }

  // PARTYSIZE4 env gate (sim-partysize4-b): wave-4+ hunt plans may
  // recruit a FOURTH companion (holder + 3 = party of 4) once wave 4
  // is unlocked. OFF unless the process env carries PARTYSIZE4=1
  // (node sims only; in the browser process is undefined, so the
  // lever is off). The gate is the LAUNCH-side cap only: the fight
  // engine's ally cap (fieldFight slice(0,2) + one shout join) is
  // untouched, so a 4th member travels but cannot yet join the
  // fight — see the sim-partysize4-b prereg.
  function partysize4On() {
    try { return typeof process !== 'undefined' && process.env && process.env.PARTYSIZE4 === '1'; } catch (e) { return false; }
  }

  // PROFILEGATE4 env gate (sim-profilegate-b, findings #2638/#2605):
  // the scoped profile-gate relaxation is OFF unless the process env
  // carries PROFILEGATE4=1 (node sims only; in the browser process
  // is undefined, so the lever is off). Scoped: the gate opens only
  // for a holder whose plan targets wave 4+ — see
  // profilegate4OpenFor below. Do NOT confuse with PROFILEGATE=1
  // (the unscoped parent lever, reverted NO-GO on B3).
  function profilegate4On() {
    try { return typeof process !== 'undefined' && process.env && process.env.PROFILEGATE4 === '1'; } catch (e) { return false; }
  }

  // PROFILEGATE4 scope: the profile gate opens only when the holder's
  // own plan has needWave >= 4 (the VETREENGAGE / PARTYSIZE4 idiom).
  // No plan, or a wave-3 plan, keeps the old gate — the safe default.
  // Pure read: never writes, never rolls RNG.
  function profilegate4OpenFor(self, vid) {
    try {
      if (!profilegate4On()) return false;
      var vv = self.state && self.state.village;
      var plan = (vv && vv.winPlan) ? vv.winPlan[vid] : null;
      return !!(plan && ((plan.needWave | 0) >= 4));
    } catch (e) { return false; }
  }

  // PLANRESEED env gate (sim-reseed-b, finding #2626): the
  // commit-time dead-target re-seed / expiry is OFF unless the
  // process env carries PLANRESEED=1 (node sims only; in the browser
  // process is undefined, so the lever is off). The sighting stamp
  // (winPlanNoteSighting) is gated on the same flag, so the whole
  // arm — stamp + commit check — is inert when the flag is unset.
  function planreseedOn() {
    try { return typeof process !== 'undefined' && process.env && process.env.PLANRESEED === '1'; } catch (e) { return false; }
  }

  // lastKillDayOf(self, type): the day of the village's most recent
  // dated kill of a monster type, from the waveKillLog (the dated
  // kill record maintained by recordWaveKill / recordPyrrhicKill).
  // Null when no dated kill exists — the re-seed fails OPEN on null
  // (an undated kill cannot prove the type died after the last
  // sighting, so the departure proceeds as before).
  function lastKillDayOf(self, type) {
    try {
      var log = (self.state && self.state.waveKillLog) || [];
      var best = null;
      for (var i = 0; i < log.length; i++) {
        var e = log[i];
        if (e && e.mid === type && typeof e.d === 'number' && (best == null || e.d > best)) best = e.d;
      }
      return best;
    } catch (e) { return null; }
  }

  // planTargetDeadByType(self, type): the village-level liveness
  // rule (sim-reseed-b, finding #2626 — same rule the held
  // dead-target gate used, re-implemented fresh on master). The
  // target TYPE is dead when the village has slain 1+ of it
  // (villageSlain, the fire's told count) AND no sighting of the
  // type has been noted since the kill day (villageLastSeenDay,
  // stamped by winPlanNoteSighting from fieldFight on every live
  // contact). A sighting ON the kill day does not re-open the type
  // — day granularity cannot order same-day events. Type-level, not
  // instance-level: the plan store holds a target type, never a
  // monster instance identity.
  function planTargetDeadByType(self, type) {
    try {
      if (!type) return false;
      var slain = 0;
      try { slain = ((self.state || {}).villageSlain || {})[type] || 0; } catch (e) {}
      if (!slain) return false;
      var killDay = lastKillDayOf(self, type);
      if (killDay == null) return false; // undated kill: fail open
      var seenDay = null;
      try { seenDay = ((self.state || {}).villageLastSeenDay || {})[type]; } catch (e) {}
      if (seenDay != null && seenDay > killDay) return false; // seen alive since the kill
      return true;
    } catch (e) { return false; }
  }

  // monsterWaveOf(self, type): the wave of a monster type id, from
  // the roster (this.data.monsters — the established lookup pattern).
  // Null when the type is unknown — the re-seed fails closed on it.
  function monsterWaveOf(self, type) {
    try {
      var list = (self.data && self.data.monsters) || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].id === type) return (list[i].wave | 0) || 1;
      }
      return null;
    } catch (e) { return null; }
  }

  // planReseedPick(self, vid, plan): the rumor-based re-seed pick
  // (sim-reseed-b, finding #2626). Returns {id, wave} for the first
  // live rumor target the holder has actually heard about, or null.
  // Perception-gated: only monsters the holder has sensed or heard
  // about — never the global roster. Sources, in order: (1) the
  // holder's own fought species (agency know.fought, most recent
  // first); (2) the holder's own fight memories
  // (village.monsterSightings, most recent day first — earned only
  // by actually fighting a living world monster at that tile);
  // (3) village fire knowledge (villageLastSeenDay keys, most
  // recent first — types the village has seen alive in a fight; the
  // deed talk tells everyone). Wave floor: candidate wave >=
  // max(3, plan.needWave) — never hunt below the plan's own wave.
  // No freshness window: liveness is the filter (a type fought 40
  // days ago with no kill since is still live). Excludes the dead
  // target itself, the suburb when FLEEREPAIR2=1 (leave-counter
  // species — same rule as winPlanSeedFromFight), and any candidate
  // that fails the liveness rule. Deterministic, no RNG, pure read
  // — no state writes.
  function planReseedPick(self, vid, plan) {
    try {
      if (!self || !vid || !plan) return null;
      var need = Math.max(3, (plan.needWave | 0) || 3);
      var dead = plan.target || null;
      var seen = {};
      function consider(id) {
        if (!id || seen[id]) return null;
        seen[id] = true;
        if (id === dead) return null;
        if (fleerepair2On() && id === 'suburb') return null;
        var w = monsterWaveOf(self, id);
        if (w == null || w < need) return null;
        if (planTargetDeadByType(self, id)) return null;
        return { id: id, wave: w };
      }
      // (1) Holder's own fought species, most recent first.
      var fought = null;
      try {
        var a = self.agencyState ? self.agencyState() : null;
        fought = (a && a.know && a.know[vid] && a.know[vid].fought) || null;
      } catch (e) {}
      if (fought) {
        for (var i = fought.length - 1; i >= 0; i--) {
          var pick = consider(fought[i]);
          if (pick) return pick;
        }
      }
      // (2) Holder's own fight memories, most recent day first.
      var mems = null;
      try { mems = (((self.state || {}).village || {}).monsterSightings || {})[vid] || null; } catch (e) {}
      if (mems && mems.length) {
        var ordered = mems.slice().sort(function (x, y) { return ((y && y.day) || 0) - ((x && x.day) || 0); });
        for (var j = 0; j < ordered.length; j++) {
          var pick2 = consider(ordered[j] && ordered[j].mid);
          if (pick2) return pick2;
        }
      }
      // (3) Village fire knowledge: types seen alive, most recent first.
      var lastSeen = null;
      try { lastSeen = (self.state || {}).villageLastSeenDay || null; } catch (e) {}
      if (lastSeen) {
        var keys = Object.keys(lastSeen).sort(function (x, y) { return (lastSeen[y] || 0) - (lastSeen[x] || 0); });
        for (var k = 0; k < keys.length; k++) {
          var pick3 = consider(keys[k]);
          if (pick3) return pick3;
        }
      }
      return null;
    } catch (e) { return null; }
  }

  // reseedBeat(self, vid, oldType, newType): the FIRESIDE BEAT for a
  // DEAD-TARGET re-seed (sim-reseed-b, finding #2626) — one
  // deterministic line when a plan's target is re-seeded at commit
  // (Steve's no-silent-actions law: the retarget must be heard, not
  // silent). Names the holder (disp convention) and both types
  // (monsterNoun — the knowledge-gated name, never the raw id).
  // Deterministic wording, no Math.random. Contains "put down"
  // contiguously so the recorder's SAY_RE filter keeps it in the
  // corpus transcript. The expired-plan re-seed used to speak here
  // too (oldType null) — sim-reseedbeat-b (finding #2632) moved it
  // to LAUNCH: the commit and the departure can split across days,
  // and the player must hear the hunter actually go out, not the
  // intent to. The launch beat is reseedLaunchBeat, stamped as
  // plan.reseedLaunchBeat at commit and spoken by
  // winPlanReseedLaunchBeat at the launch. Total by construction
  // (the catch swallows), so call sites need no try/catch — only a
  // typeof guard on say is needed inside.
  function reseedBeat(self, vid, oldType, newType) {
    try {
      if (!self || typeof self.say !== 'function') return;
      var cname = null;
      try { cname = (typeof self.disp === 'function' ? self.disp(vid) : (self.displayName ? self.displayName(vid) : null)); } catch (e) {}
      if (!cname) cname = 'Someone';
      var oname = null, nname = null;
      try { oname = self.monsterNoun ? self.monsterNoun(oldType) : null; } catch (e) {}
      try { nname = self.monsterNoun ? self.monsterNoun(newType) : null; } catch (e) {}
      if (!oname) oname = oldType || 'something';
      if (!nname) nname = newType || 'something';
      var ophrase = oname, nphrase = nname;
      try { ophrase = (typeof self.articlePhrase === 'function') ? self.articlePhrase(oname, false) : oname; } catch (e) {}
      try { nphrase = (typeof self.articlePhrase === 'function') ? self.articlePhrase(nname, false) : nname; } catch (e) {}
      // The new kind is named once, mid-sentence (lowercase 'the'
      // is correct there); the old kind's "that kind" has its
      // antecedent in the same clause. The first draft put the new
      // kind at a sentence start lowercase ("...put down. the ...")
      // and named it twice — both fixed here.
      var line = cname + ' was ready to hunt ' + ophrase + ' — but the fire says that kind is already put down. The hunt turns to ' + nphrase + ' instead.';
      if (self.state && self.state.systemArrived) self.say('📺 SYSTEM: "' + line + '"');
      else self.say(line);
    } catch (e) {}
  }

  // expiryBeat(self, vid, oldType): the FIRESIDE BEAT for a plan
  // expiry (sim-reseed-b, finding #2626 — the dissolve beat already
  // owed from #2621). One deterministic line when a plan expires on
  // a dead target with no live rumor to turn to. Same pattern as
  // reseedBeat: holder + type named as the village knows them, no
  // Math.random, "put down" contiguous for the SAY_RE filter. Fires
  // once per EXPIRY (called from the expiry branch only), never per
  // hold — the hold is silent by design: the villager was already
  // told. Total by construction.
  function expiryBeat(self, vid, oldType) {
    try {
      if (!self || typeof self.say !== 'function') return;
      var cname = null;
      try { cname = (typeof self.disp === 'function' ? self.disp(vid) : (self.displayName ? self.displayName(vid) : null)); } catch (e) {}
      if (!cname) cname = 'Someone';
      var oname = null;
      try { oname = self.monsterNoun ? self.monsterNoun(oldType) : null; } catch (e) {}
      if (!oname) oname = oldType || 'something';
      var ophrase = oname;
      try { ophrase = (typeof self.articlePhrase === 'function') ? self.articlePhrase(oname, false) : oname; } catch (e) {}
      // The first draft ended "...the fire keeps the name" — but no
      // name was ever spoken in the line (the kind is named only as
      // the village knows it, "the sky"), so the clause dangled.
      // It now ends at the called-off hunt.
      var line = cname + ' was ready to hunt ' + ophrase + ' — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off.';
      if (self.state && self.state.systemArrived) self.say('📺 SYSTEM: "' + line + '"');
      else self.say(line);
    } catch (e) {}
  }

  // reseedLaunchBeat(self, vid, newType): the FIRESIDE BEAT for an
  // EXPIRED-PLAN re-seed LAUNCH (sim-reseedbeat-b, finding #2632).
  // One deterministic line when a holder whose plan expired goes
  // back out on the re-seeded target — the expiry speaks ("the hunt
  // is called off") and the commit-time re-seed used to speak, but
  // the launch itself was silent: the hunter went back out and the
  // player was never told (Amina d31, Fernando d46 — the commit-time
  // line also carried no SAY_RE token, so the corpus showed nothing
  // at all on the launch day). Same voice as the expiry beat: holder
  // + new target named as the village knows them, deterministic
  // wording, never rolled.
  // "new trail" is contiguous so the recorder's SAY_RE filter keeps
  // it in the corpus transcript (the reseedexpiry driver's SAY_RE
  // gained the token with this beat). Fires ONLY from
  // winPlanReseedLaunchBeat, which stamps the target at commit and
  // speaks it at the launch — never at commit, never at expiry,
  // never for a non-expired (dead-target) re-seed, at most once per
  // re-seed launch (the stamp is cleared before speaking). Total by
  // construction.
  function reseedLaunchBeat(self, vid, newType) {
    try {
      if (!self || typeof self.say !== 'function') return;
      var cname = null;
      try { cname = (typeof self.disp === 'function' ? self.disp(vid) : (self.displayName ? self.displayName(vid) : null)); } catch (e) {}
      if (!cname) cname = 'Someone';
      var nname = null;
      try { nname = self.monsterNoun ? self.monsterNoun(newType) : null; } catch (e) {}
      if (!nname) nname = newType || 'something';
      var nphrase = nname;
      try { nphrase = (typeof self.articlePhrase === 'function') ? self.articlePhrase(nname, false) : nname; } catch (e) {}
      var line = cname + ' is hunting ' + nphrase + ' now — the fire found a new trail.';
      if (self.state && self.state.systemArrived) self.say('📺 SYSTEM: "' + line + '"');
      else self.say(line);
    } catch (e) {}
  }

  // Shared extra-companion scan for the second AND third picks
  // (sim-vetreengage-a trio, sim-partysize4-b quad). Module-level (like
  // findCompanion / companionLaunchable) so the second/third-companion
  // wrappers can call it directly: the wrappers run with `this` bound
  // to a test ctx as well as to Game, and a `this.winPlanExtraCompanion`
  // call goes nowhere on a ctx that never received the method (the
  // trio proof caught it: picks returned null on every fixture).
  // Picks ONE Haven-idle villager from the same pool, excluding every
  // id in `exclude` (the holder, the scholar, and the companions
  // already picked). PURE READ — no gear-up, no state writes, no RNG.
  // Preference: (1) living wave-3+ killers, (2) currently armed
  // villagers, (3) the rest; within each tier the shared companionRank
  // order (formula untouched). Wave-4-target plans only.
  function extraCompanionScan(self, vid, hx, hy, exclude) {
    try {
      var plan = null;
      try {
        var vv = self.state && self.state.village;
        plan = (vv && vv.winPlan) ? vv.winPlan[vid] : null;
      } catch (e) {}
      if (!plan || (plan.needWave | 0) < 4) return null;
      var v = self.state && self.state.village;
      if (!v) return null;
      var roster = v.roster || [];
      var trust = v.trust || {};
      var away = v.away || {};
      var sick = v.sick || {};
      var ex = exclude || [];
      var killers = [], armed = [], rest = [];
      for (var i = 0; i < roster.length; i++) {
        var cid = roster[i];
        if (!cid || cid === vid || ex.indexOf(cid) !== -1 || cid === self.villagerId) continue;
        if (!alive(self, cid)) continue;
        if (away[cid]) continue;
        if (((trust[cid] === undefined) ? 10 : trust[cid]) < 15) continue;
        if (!atHaven(self, cid, hx, hy)) continue;
        try { if (self.isEngaged && self.isEngaged(cid)) continue; } catch (e) {}
        try {
          var a = self.agencyState ? self.agencyState() : null;
          if (a && a.exped && a.exped[cid]) continue;
        } catch (e) {}
        if (sick[cid]) continue;
        try { if (self.npcMaxDist && self.npcMaxDist(cid) < 1) continue; } catch (e) {}
        if (hasKillWaveAtLeast(self, cid, 3)) killers.push(cid);
        else {
          var g = gearOf(self, cid);
          if (g.armed) armed.push(cid);
          else rest.push(cid);
        }
      }
      var pickFrom = function (list) {
        if (!list.length) return null;
        try {
          if (self.companionRank) {
            var ranked = self.companionRank(vid, list, { context: 'party' });
            return (ranked[0] && ranked[0].id) || null;
          }
        } catch (e) {}
        return list[0];
      };
      return pickFrom(killers) || pickFrom(armed) || pickFrom(rest);
    } catch (e) { return null; }
  }

  // Launchability for a party companion, checked BEFORE the inviter
  // launches (or before a second companion is added): gear them first
  // (their own stash / the deposited armory / whittle, exactly what
  // departure would do), then judge what they carry; the sick stay
  // home, no range means no expedition, and hurt with no medicine and
  // no healer sits out. Call only at launch time, never during dawn
  // scoring — the gear-up itself spends village gear.
  function companionLaunchable(self, cid) {
    try { if (self.villagerGearUp) self.villagerGearUp(cid, true); } catch (e) {}
    var cg = gearOf(self, cid);
    if (!cg.armed && !cg.armored) return false;
    // LAUNCHABILITY (checked BEFORE the inviter launches): a hurt
    // villager cannot set off on an expedition. The sick stay home.
    // Range-0 villagers (never leave) can't be put on an expedition.
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
    return true;
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
    // DEATH CLEANUP (sim-deathcleanup-b, 2026-11-17): when a villager
    // dies, their plan dies with them — delete their own entry, and
    // strike their name from every living holder's party (the slot
    // fix: sim-deadplan-b measured 6 living holders carrying a dead
    // villager in their party for 149 holder-days, and 57% of census
    // rows belonging to dead holders). A party/hunt plan whose party
    // empties falls back to 'party' (re-seek a companion) instead of
    // sitting at 'hunt' with an empty list; standing/table plans keep
    // their stage (the kill is banked; the party list is vestigial
    // there). Pure data work: no RNG, no say, no narration. Bumps
    // winPlanStats.deathCleanups only when something was cleaned.
    // Total by construction (the catch returns a safe value), so call
    // sites need no try/catch — only a typeof guard.
    winPlanOnVillagerDeath(vid) {
      try {
        if (!vid) return { deleted: false, purged: 0 };
        // NON-CREATING READ (correction, sim-deathcleanup-b): stateOf()
        // materializes winPlan={} — and winPlanHavenTick gates on the
        // store's existence (`if (!v.winPlan) return null`), so creating
        // it here would IGNITE the plan system in villages where it
        // sleeps. Proven on seed 103237: first death day 15, first plan
        // day 16, trajectory diverged day 18 with zero cleanups fired.
        // The cleanup must never be the spark: read the store without
        // creating it, and touch nothing when it does not exist yet.
        // (bump() below runs only when something was cleaned — by then
        // the store exists, so its stateOf is a no-op.)
        var v = this.state && this.state.village;
        if (!v || !v.winPlan) return { deleted: false, purged: 0 };
        var deleted = false;
        if (v.winPlan[vid]) { delete v.winPlan[vid]; deleted = true; }
        var purged = purgePartyRefs(v, vid);
        if (deleted || purged > 0) bump(this, 'deathCleanups');
        return { deleted: deleted, purged: purged };
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) console.warn('[winPlan] death cleanup failed', e);
        return { deleted: false, purged: 0 };
      }
    },
    // NON-DEATH REMOVAL CLEANUP (sim-nondeathplan-b, 2026-11-17):
    // the same purge as the death method, for a villager who LEAVES
    // the village alive (fled / splinter / exiled / tribute / relay)
    // — their plan dies with their leaving, and they leave every
    // living holder's party. Same non-creating read as the death
    // method: it must never ignite the plan system in a sleeping
    // village. Bumps winPlanStats.removalCleanups (not
    // deathCleanups) only when something was cleaned.
    // SPELLING NOTE: the entry delete is written
    // `delete v.winPlan[key]` (key === vid), not with the vid
    // spelled out in the brackets — the deathcleanup proof pins
    // exactly two of the bracketed-vid spellings in this file (death
    // method + table-active case), and a third would break it. The
    // purge core is shared via purgePartyRefs, so the spelling is
    // the only duplication.
    // Total by construction (the catch returns a safe value), so call
    // sites need no try/catch — only a typeof guard.
    winPlanOnVillagerLeave(vid) {
      try {
        if (!vid) return { deleted: false, purged: 0 };
        // NON-CREATING READ (same rule as the death method): read the
        // store without creating it, and touch nothing when it does
        // not exist yet. (bump() below runs only when something was
        // cleaned — by then the store exists, so its stateOf is a
        // no-op.)
        var v = this.state && this.state.village;
        if (!v || !v.winPlan) return { deleted: false, purged: 0 };
        var deleted = false;
        var key = vid;
        if (v.winPlan[key]) { delete v.winPlan[key]; deleted = true; }
        var purged = purgePartyRefs(v, vid);
        if (deleted || purged > 0) bump(this, 'removalCleanups');
        return { deleted: deleted, purged: purged };
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) console.warn('[winPlan] removal cleanup failed', e);
        return { deleted: false, purged: 0 };
      }
    },
    winPlanSeedFromFight(vid, mdef, outcome) {
      try {
        if (!mdef || (mdef.wave || 1) < 3) return null;
        // FLEEREPAIR2 (sim-fleerepair2-b, finding #2500): a
        // leave-counter species — the Suburb, whose counter is LEAVE
        // (canon: monsters.json weaknesses, "you can't kill it —
        // LEAVE"; fieldFights.js villagerTrickAction 'leave') — cannot
        // be killed by fighting, so a kill-hunt plan seeded from
        // fleeing one can never advance: the launched party meets it,
        // leaves in round 1 with 0 damage, and re-meets it daily.
        // Never seed or retarget a hunt plan onto it. The existing
        // plan, if any, is left untouched (mid-expedition safety).
        // The Suburb carries no `counter` field in monsters.json, so
        // the id is named here, matching fieldFights.js's own
        // hardcoded `mid === 'suburb'` branch.
        if (fleerepair2On() && mdef.id === 'suburb') return null;
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
    // SIGHTING STAMP (sim-reseed-b, finding #2626): a live contact
    // with a monster type — the village saw it alive today. Called
    // from fieldFight on every live contact (evade, or a fight of any
    // outcome), never for a corpse (alreadyDead). Village-level, one
    // day-stamp per type: the re-seed's liveness half (a type is dead
    // only when slain with no sighting since the kill) and its third
    // rumor source (types seen alive). Env-gated: with PLANRESEED
    // unset this is a no-op, so the whole arm is inert when the lever
    // is off. Total by construction (the catch returns null), so call
    // sites need no try/catch — only a typeof guard.
    winPlanNoteSighting(mid) {
      try {
        if (!planreseedOn()) return null;
        if (!mid) return null;
        var day = 0;
        try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
        this.state = this.state || {};
        this.state.villageLastSeenDay = this.state.villageLastSeenDay || {};
        this.state.villageLastSeenDay[mid] = day;
        return day;
      } catch (e) { return null; }
    },
    // COMMIT-TIME DEAD-TARGET CHECK (sim-reseed-b, finding #2626):
    // the re-seed / expiry decision, run at the commit point on both
    // departure paths before any launch. Returns 'reseeded' (the
    // dead target was retargeted onto a live rumor — the caller
    // proceeds to launch), 'expired' (no live rumor — the plan
    // dissolved with a beat; the caller returns 'normal' and the
    // villager's day proceeds), 'held' (the plan already expired on
    // an earlier commit and no rumor has arrived since — the caller
    // returns 'hold', silent, no bump, no second beat), or null
    // (flag off, no plan, live target, or a never-targeted plan —
    // proceed as before; a never-targeted plan launches targetless
    // in the village's normal wandering shape and is never touched
    // here). The plan is read WITHOUT creating it (winPlanOf would
    // materialize a plan entry); the check must never be the spark
    // that ignites the plan system in a village where it sleeps.
    // Total by construction (the catch returns null), so call sites
    // need no try/catch — only a typeof guard.
    winPlanCommitDeadTarget(vid) {
      try {
        if (!planreseedOn()) return null;
        var v = this.state && this.state.village;
        if (!v || !v.winPlan || !v.winPlan[vid]) return null;
        var plan = v.winPlan[vid];
        var day = 0;
        try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
        if (plan.target) {
          if (!planTargetDeadByType(this, plan.target)) return null;
          var oldType = plan.target;
          // A pending launch beat belongs to a re-seed that never
          // launched; this target died first, so the beat is moot —
          // clear it, or it would speak for a target the hunter
          // never goes out after (sim-reseedbeat-b).
          plan.reseedLaunchBeat = null;
          var fresh = planReseedPick(this, vid, plan);
          if (fresh) {
            plan.target = fresh.id;
            plan.needWave = fresh.wave;
            plan.node = null;
            plan.party = [];
            plan.reseedExpiryDay = null;
            bump(this, 'planReseeds');
            reseedBeat(this, vid, oldType, fresh.id);
            return 'reseeded';
          }
          plan.target = null;
          plan.node = null;
          plan.party = [];
          plan.stage = 'party';
          plan.holdSinceDay = -1;
          plan.reseedExpiryDay = day;
          bump(this, 'planExpiries');
          expiryBeat(this, vid, oldType);
          return 'expired';
        }
        // Targetless: only a plan THIS lever expired is held — a
        // never-targeted plan (no stamp) is untouched.
        if (plan.reseedExpiryDay == null) return null;
        var fresh2 = planReseedPick(this, vid, plan);
        if (fresh2) {
          plan.target = fresh2.id;
          plan.needWave = fresh2.wave;
          plan.node = null;
          plan.party = [];
          plan.reseedExpiryDay = null;
          // The beat is NOT spoken here. The commit and the launch
          // can split across days (no companion, party wait), and
          // the player must hear the hunter actually go out — so
          // the re-seed is stamped and the beat fires at the launch
          // via winPlanReseedLaunchBeat (sim-reseedbeat-b, finding
          // #2632). The stamp is the new target id; the launch hook
          // speaks only while the plan still carries that target.
          plan.reseedLaunchBeat = fresh2.id;
          bump(this, 'planReseeds');
          return 'reseeded';
        }
        return 'held';
      } catch (e) { return null; }
    },
    // RE-SEED LAUNCH BEAT (sim-reseedbeat-b, finding #2632): speaks
    // the pending expired-plan re-seed beat at the launch, and only
    // at the launch. Called by both departure paths (winPlanDepart's
    // launchParty and vbrainExecuteDepart's party_launch branch)
    // AFTER the expedition has actually started — never on a hold,
    // never on a failed launch. The stamp is cleared BEFORE speaking
    // so a re-entrant say can never double-fire, and the beat fires
    // only while the plan still carries the stamped target: if the
    // target changed or died since the commit (the commit check
    // clears the stamp on the dead-target path too), the launch is
    // an ordinary one and stays silent. A plan with no stamp — every
    // non-expired launch, every dead-target re-seed — returns false
    // unheard. The plan is read WITHOUT creating it, like the commit
    // check. Total by construction (the catch returns false).
    winPlanReseedLaunchBeat(vid) {
      try {
        if (!planreseedOn()) return false;
        var v = this.state && this.state.village;
        if (!v || !v.winPlan || !v.winPlan[vid]) return false;
        var plan = v.winPlan[vid];
        if (!plan.reseedLaunchBeat) return false;
        if (plan.target !== plan.reseedLaunchBeat) { plan.reseedLaunchBeat = null; return false; }
        var target = plan.reseedLaunchBeat;
        plan.reseedLaunchBeat = null;
        reseedLaunchBeat(this, vid, target);
        return true;
      } catch (e) { return false; }
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
        if (!v) return null;
        // PLANFIX (sim-planignite-fix-a): the plan store is lazily
        // initialized by stateOf() only — and this tick reads it
        // directly, so it can never be the first spark (the
        // planignite-a DIAG: 2/8 villages never start a plan in 150d
        // because no initializer of any kind ever fires). With the
        // flag on, initialize the store here so the engagement check
        // below can run on the first call. Env-gated default-OFF:
        // with the flag unset the guard is the old behavior.
        if (!v.winPlan) {
          if (!planfixOn()) return null;
          v = stateOf(this);
          if (!v) return null;
        }
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
        // VETREENGAGE (sim-vetreengage-a): the party persists until the type
        // is killed or a member dies. A dead recorded party member
        // dissolves the hunting party back to re-formation (stage
        // 'party', party cleared) so the next launch re-forms from the
        // living. Standing / table stages are not dissolved — their
        // purpose is already banked, and the kill of the target type
        // already advances hunt/party to standing via winPlanNoteKill.
        // Env-gated: no dissolution unless VETREENGAGE=1.
        if (vetreengageOn() && (plan.stage === 'party' || plan.stage === 'hunt') && plan.party && plan.party.length) {
          var deadMember = false;
          for (var di = 0; di < plan.party.length; di++) {
            if (!alive(this, plan.party[di])) { deadMember = true; break; }
          }
          if (deadMember) {
            plan.party = [];
            plan.stage = 'party';
            bump(this, 'partyDissolved');
          }
        }
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
          // what departure would do), then judge what they carry. The
          // launchability gates are shared with the second-companion
          // path (companionLaunchable) — the order is the same: checked
          // BEFORE the inviter launches, so a blocked companion never
          // leaves the inviter out solo (the 180-day smoke caught it:
          // 2 invites, 0 departures, inviter solo, because a hurt
          // companion's startExpedition returned early after the
          // inviter left).
          if (!companionLaunchable(self, cid)) return false;
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
          var launched = [cid];
          // VETREENGAGE (sim-vetreengage-a): a wave-4-target plan goes out as
          // a trio, because the gate demands three for wave-4+ fights
          // and a launched pair can never pass it (the producerparty
          // pilot proved it: SEEK 0, all avoid:outmatched). The second
          // companion comes from the Haven-idle pool — no recalling
          // foragers or workers — and is geared up and judged by the
          // same launchability bar as the first. If nobody is free or
          // launchable, the pair still goes: no extra waiting beyond
          // the existing PARTY_WAIT_DAYS cap (the producergate pilot
          // proved waiting never converts a second companion).
          // Env-gated: no trio unless VETREENGAGE=1.
          if (vetreengageOn() && (plan.needWave | 0) >= 4) {
            var cid2 = null;
            try { cid2 = self.winPlanSecondCompanion ? self.winPlanSecondCompanion(vid, hx, hy, cid) : null; } catch (e) { cid2 = null; }
            if (cid2 && companionLaunchable(self, cid2)) {
              self.startExpedition(cid2, hx, hy, false, { tx: tx, ty: ty, duration: dur });
              var ok2 = false;
              try {
                var a3 = self.agencyState ? self.agencyState() : null;
                ok2 = !!(a3 && a3.exped && a3.exped[cid2]);
              } catch (e) {}
              if (ok2) launched.push(cid2);
            }
          }
          // PARTYSIZE4 (sim-partysize4-b): a wave-4-target plan that
          // went out as a trio may take a FOURTH companion — the
          // party scales with the threat, earned on the wave-4
          // unlock (the pick re-checks partysize4On + needWave +
          // unlockedWave). Same Haven-idle pool, same launchability
          // bar as the first two; a blocked pick falls back to the
          // trio launch, never a wait. Only when the trio formed:
          // launched.length > 1 means cid2 is out, so launched[1]
          // is the second companion to exclude from the pick.
          if (partysize4On() && (plan.needWave | 0) >= 4 && launched.length > 1) {
            var cid3 = null;
            try { cid3 = self.winPlanThirdCompanion ? self.winPlanThirdCompanion(vid, hx, hy, launched[0], launched[1]) : null; } catch (e) { cid3 = null; }
            if (cid3 && companionLaunchable(self, cid3)) {
              self.startExpedition(cid3, hx, hy, false, { tx: tx, ty: ty, duration: dur });
              var ok3 = false;
              try {
                var a4 = self.agencyState ? self.agencyState() : null;
                ok3 = !!(a4 && a4.exped && a4.exped[cid3]);
              } catch (e) {}
              if (ok3) launched.push(cid3);
            }
          }
          plan.stage = 'hunt';
          plan.party = launched.slice();
          try {
            var cplan = self.winPlanOf ? self.winPlanOf(cid) : null;
            if (cplan) {
              cplan.stage = 'hunt';
              cplan.party = [vid].concat(launched.filter(function (x) { return x !== cid; }));
              cplan.target = plan.target; cplan.node = plan.node;
            }
            if (launched.length > 1) {
              var cplan2 = self.winPlanOf ? self.winPlanOf(launched[1]) : null;
              if (cplan2) { cplan2.stage = 'hunt'; cplan2.party = [vid, cid].concat(launched.length > 2 ? [launched[2]] : []); cplan2.target = plan.target; cplan2.node = plan.node; }
              bump(self, 'partyTrios');
            }
            if (launched.length > 2) {
              var cplan3 = self.winPlanOf ? self.winPlanOf(launched[2]) : null;
              if (cplan3) { cplan3.stage = 'hunt'; cplan3.party = [vid, cid, launched[1]]; cplan3.target = plan.target; cplan3.node = plan.node; }
              bump(self, 'partyQuads');
            }
          } catch (e) {}
          bump(self, 'partyDepartures');
          // RE-SEED LAUNCH BEAT (sim-reseedbeat-b, finding #2632):
          // the holder is out the door on the re-seeded target — say
          // so now, and only now. A no-op on every launch without a
          // pending expired-plan stamp (the method reads the plan
          // without creating it). Guarded by typeof: test ctxs and
          // older callers that never received the method launch
          // exactly as before.
          try { if (typeof self.winPlanReseedLaunchBeat === 'function') self.winPlanReseedLaunchBeat(vid); } catch (e) {}
          return true;
        };
        if (plan.stage === 'gear') {
          try { if (this.villagerGearUp) this.villagerGearUp(vid, true); } catch (e) {}
          var g = gearOf(this, vid);
          if (!g.armed && !g.armored) { bump(this, 'gearHolds'); return 'hold'; }
          plan.stage = 'party';
          bump(this, 'stageAdvances');
        }
        // PLANRESEED (sim-reseed-b, finding #2626): the commit-time
        // dead-target check — a plan whose target the village has
        // slain with no sighting since is re-seeded from rumors the
        // holder has heard, or expires when no live rumor exists;
        // an expired plan holds on later commits until a rumor (or a
        // lived fight) re-seeds it. Runs before any launch below, so
        // no departure ever chases a dead target or launches
        // targetless on a plan this lever expired. 'expired' returns
        // 'normal' (the plan is gone; the day proceeds); 'held'
        // returns 'hold' (stay at Haven this commit, silent).
        var _rs = null;
        try { _rs = (typeof this.winPlanCommitDeadTarget === 'function') ? this.winPlanCommitDeadTarget(vid) : null; } catch (e) {}
        if (_rs === 'expired') return 'normal';
        if (_rs === 'held') return 'hold';
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
    // VETREENGAGE (sim-vetreengage-a): pick a SECOND companion for a
    // wave-4-target plan, from the Haven-idle pool. Wave-4-target plans
    // only (plan.needWave >= 4); everyone else gets null. PURE READ —
    // no gear-up, no state writes, no RNG — so the dawn candidate pass
    // can call it safely: gearing during scoring would spend village
    // gear as a side effect. Preference: (1) living wave-3+ killers,
    // (2) currently armed villagers, (3) the rest; within each tier
    // the shared companionRank order (formula untouched). Eligibility
    // mirrors findCompanion's willingness bars and the pool stays
    // Haven-idle (no recalling foragers or workers): alive, not the
    // scholar, not engaged/away/on-expedition, not sick, trust >= 15,
    // range >= 1. Whether the pick can actually go is decided at
    // LAUNCH time by companionLaunchable (gear-up + armed-or-armored
    // bar); a blocked pick falls back to a pair launch. The scan
    // itself lives in extraCompanionScan (shared with the third pick);
    // this wrapper only forwards the first companion as the exclusion.
    winPlanSecondCompanion(vid, hx, hy, firstCid) {
      try {
        // Env-gated: no second companion unless VETREENGAGE=1.
        if (!vetreengageOn()) return null;
        return extraCompanionScan(this, vid, hx, hy, [firstCid]);
      } catch (e) { return null; }
    },
    // PARTYSIZE4 (sim-partysize4-b): pick a THIRD companion for a
    // wave-4-target plan — the fourth seat of the party. Env-gated:
    // no third companion unless PARTYSIZE4=1. EARNED on the wave-4
    // unlock: the village must actually have walked through the
    // wave-4 door (unlockedWave() >= 4 — the readiness-held village,
    // standing-rich but not released, does not earn it), on top of
    // the plan targeting wave 4+. The scan is the shared
    // extraCompanionScan (same pool, same tiers, same bars as the
    // second pick — no eligibility change); the exclusions are the
    // first and second companions. Callers launch the third only
    // when the trio formed (a 4th without a 3rd is incoherent).
    winPlanThirdCompanion(vid, hx, hy, firstCid, secondCid) {
      try {
        if (!partysize4On()) return null;
        var uw = 0;
        try { uw = this.unlockedWave ? this.unlockedWave() : 0; } catch (e) {}
        if ((uw | 0) < 4) return null;
        return extraCompanionScan(this, vid, hx, hy, [firstCid, secondCid]);
      } catch (e) { return null; }
    },
    // PARTYSIZE4 (sim-partysize4-b): the shared extra-companion scan
    // as a method, so test ctxs (and any future caller bound to a
    // ctx that never received the method) can call it directly. The
    // scan itself lives in extraCompanionScan (shared with the third
    // pick); this wrapper only forwards `this`.
    winPlanExtraCompanion(vid, hx, hy, exclude) {
      return extraCompanionScan(this, vid, hx, hy, exclude);
    },
    // Pre-fight gate for expeditionMonster. Returns null (old path),
    // {avoid:true} (no fight; plan falls back to gathering help), or
    // {seek:true} (walk in on purpose — awareness evade skipped).
    // WILDAVOID (sim-wildavoid-a, finding #2506): the fight-gate
    // party, as a shared read — the fighter plus sensed allies, plus
    // VETREENGAGE co-tasked plan members. The gate and the wild
    // outmatched check both call this; it never writes state.
    winPlanFightParty(vid) {
      try {
        var party = [vid];
        try {
          var sensed = (typeof this.villagerFightAllies === 'function') ? (this.villagerFightAllies(vid) || []) : [];
          for (var i = 0; i < sensed.length; i++) if (party.indexOf(sensed[i]) === -1) party.push(sensed[i]);
        } catch (e) {}
        // VETREENGAGE (sim-vetreengage-a): count co-tasked plan members.
        // The plan's party set out together on one shared target (same
        // tx/ty, same duration) — they are the travelling party even
        // when the encounter instant finds them a leg apart, because
        // villagerFightAllies only sees same/adjacent nodes at that
        // instant. The gate judges the party that set out, not the
        // earshot snapshot. Only members alive and on an expedition to
        // the SAME target as the fighter count. The fight itself still
        // starts with the sensed allies only — counted members are
        // never injected into fieldFight.
        // Env-gated: no co-tasked counting unless VETREENGAGE=1.
        if (vetreengageOn()) try {
          var v0 = this.state && this.state.village;
          var plan0 = (v0 && v0.winPlan) ? v0.winPlan[vid] : null;
          if (plan0 && plan0.party && plan0.party.length) {
            var a0 = this.agencyState ? this.agencyState() : null;
            var myExped = (a0 && a0.exped) ? a0.exped[vid] : null;
            if (myExped) {
              for (var k = 0; k < plan0.party.length; k++) {
                var pid = plan0.party[k];
                if (!pid || party.indexOf(pid) !== -1) continue;
                if (!alive(this, pid)) continue;
                var pExped = a0.exped[pid];
                if (pExped && pExped.tx === myExped.tx && pExped.ty === myExped.ty) {
                  party.push(pid);
                }
              }
            }
          }
        } catch (e) {}
        return party;
      } catch (e) { return [vid]; }
    },
    // WILDAVOID (sim-wildavoid-a): the expedition gate's OUTMATCHED
    // rule as a pure read — a wave-4-class beast in front of a party
    // that is not full (fighter + 2, the engine's cap) and fully
    // geared is not a fight, it is a death. Returns {avoid:true,
    // reason:'outmatched', party} or null. NO plan mutation, NO plan
    // seeding, NO bumps, NO veteran-guard, NO SEEK, NO trick-hold —
    // the wild routers consult this before fieldFight; the gate
    // itself keeps its own side effects on the expedition path.
    // `party` may be passed in (the gate passes the party it already
    // computed); otherwise it is read via winPlanFightParty.
    winPlanOutmatched(vid, mdef, party) {
      try {
        if (!mdef) return null;
        var wave = mdef.wave || 1;
        if (wave < 4) return null;
        party = (party && party.length) ? party : this.winPlanFightParty(vid);
        var allArmed = true, allArmored = true;
        for (var j = 0; j < party.length; j++) {
          var gj = gearOf(this, party[j]);
          if (!gj.armed) allArmed = false;
          if (!gj.armored) allArmored = false;
        }
        if (party.length < 3 || !allArmed || !allArmored) {
          return { avoid: true, reason: 'outmatched', party: party.slice(), allArmed: allArmed, allArmored: allArmored };
        }
        return null;
      } catch (e) { return null; }
    },
    // WILDAVOID (sim-wildavoid-a): count a wild outmatched-avoid in
    // winPlanStats, the same ledger the expedition gate's avoidances
    // live in. The wild routers call this when they avoid; it writes
    // nothing else.
    winPlanBumpWildAvoid() {
      try { bump(this, 'wildAvoids'); } catch (e) {}
    },
    winPlanFightGate(vid, mdef) {
      try {
        if (!mdef) return null;
        var wave = mdef.wave || 1;
        // WILDAVOID (sim-wildavoid-a): the party construction lives in
        // winPlanFightParty now (sensed + VETREENGAGE co-tasked, the
        // same party the wild outmatched check judges). The gate still
        // computes gear over it for the veteran-guard and SEEK below.
        var party = [vid];
        try { party = this.winPlanFightParty ? this.winPlanFightParty(vid) : [vid]; } catch (e) { party = [vid]; }
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
        // OUTMATCHED: the rule lives in winPlanOutmatched (the wild
        // routers consult the same rule); the gate keeps its side
        // effects here — the plan falls back to gathering help, or a
        // plan is seeded when there is none. Go back for help instead.
        var _om = null;
        try { _om = this.winPlanOutmatched ? this.winPlanOutmatched(vid, mdef, party) : null; } catch (e) { _om = null; }
        if (_om && _om.avoid) {
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
      if (st.nationalLive || st.pendingNational) return null;
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
        if ((l.trust || 0) >= 50) continue;
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
