// @ontology
// system: villager-agency
// description: Villager AI. Villagers act on their own with goals and routines.
// provides:
//   - agencyState(vid)
//   - agencyTick()
//   - agencyOf(vid)
//   - agencyScore(vid)
//   - recordDeed(vid, deed)
//   - startExpedition(vid)
// rules:
//   - (none documented)
// consumes:
//   - village.villagers
/* VILLAGER AGENCY — src/js/villager-agency.js
 *
 * Steve: "Villagers need to be encountering these and more as they wander
 * about the world... Some of them need to be like most our players would be.
 * Skilled, independent, generally benign, and willing to explore far and
 * really become someone in the world. I want people to feel like they can
 * be outshone by someone more talented and hardworking than they are,
 * someone more clever."
 *
 * Villagers are independent players, not set dressing. This module builds
 * on the existing npcNodeTravel away-system (game.js) with:
 *
 * 1. RANGING — real range profiles per villager (homebody / forager /
 *    wanderer / explorer), derived from temperament, goal, age, and
 *    occupation aptitude. Multi-day expeditions with real distance from
 *    Haven. Far = danger = sometimes they don't come back, and that's a
 *    story the village tells.
 * 2. INDEPENDENT PROGRESSION — explorers gain XP (tracking, survival,
 *    bravery), knowledge (plants, monsters, places), scars, and integration
 *    (fed into the existing npcLadderDaily so slot moments fire through the
 *    same visible beats). They come back CHANGED, with things to teach.
 * 3. OUTSHINING — deeds are recorded, scored, and surfaced honestly through
 *    gossip, say-lines, and show narration (recordMoment). A few villagers
 *    per game carry hidden high-potential seeds (talented / hardworking /
 *    clever) — never displayed, only visible through deeds. Rising stars
 *    with the 'lead' goal accumulate contender heat through the existing
 *    leadership machinery. Being outpaced by an NPC is a feature.
 * 4. INTEGRATION — the mantle: deeds earn trust, so the village's choice of
 *    successor (playerDeath sorts by trust) naturally favors the explorer
 *    who became someone.
 *
 * Nothing here is artificial: achievements come from the sim doing real
 * things (expedition legs, encounter rolls, returns), reported honestly.
 * The game never rubs it in — the village just talks about what happened.
 *
 * Self-attaching module. Load after ledger.js (recordMoment, playerDeath,
 * progState). Chain-safe wraps throughout.
 */
(function () {
  'use strict';
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  var R = Math.random;
  var pick = function (a) { return a[Math.floor(R() * a.length)]; };
  // pickW: weighted pick (longsim agency r4 2026-10-11). wf maps each item
  // to a non-negative weight; weight 0 items are excluded, all-zero falls
  // back to uniform pick so the draw never fails.
  var pickW = function (a, wf) {
    var tot = 0, ws = [];
    for (var i = 0; i < a.length; i++) {
      var w = Math.max(0, wf(a[i]) || 0);
      ws.push(w); tot += w;
    }
    if (tot <= 0) return pick(a);
    var r = R() * tot;
    for (var j = 0; j < a.length; j++) {
      r -= ws[j];
      if (r <= 0) return a[j];
    }
    return a[a.length - 1];
  };

  // Occupations whose hands know the wild. Ranging aptitude, not a class.
  var RANGY_OCC = {
    hunting_guide: 1, park_ranger: 1, wildlife_biologist: 1, forester: 1,
    surveyor: 1, trail_crew: 1, search_rescue: 1, fisherman: 1, farmer: 1,
    rancher: 1, geologist: 1, backpacking_guide: 1, smoke_jumper: 1,
  };

  var DEED_MAG = {
    monster_kill: 10, rescue: 8, cache_haul: 6, stood_down: 4,
    mapped_far: 3, survived_hurt: 2, taught: 1,
  };

  var methods = {

    // ---------- STATE ----------
    agencyState() {
      var v = this.state.village;
      v.agency = v.agency || {};
      var a = v.agency;
      a.profiles = a.profiles || {};
      a.potential = a.potential || {};
      a.exped = a.exped || {};
      a.know = a.know || {};
      a.xp = a.xp || {};
      a.tier = a.tier || {};
      a.scars = a.scars || {};
      a.ach = a.ach || [];
      a.stats = a.stats || {};
      a.teachable = a.teachable || {};
      a.lessons = a.lessons || {}; // villager->villager field lessons (longsim agency r2 2026-10-11)
      // transfer high-potential seeds planted at genRoster time
      if (this._pendingPotential && !a._potTransferred) {
        for (var i = 0; i < this._pendingPotential.length; i++) {
          var e = this._pendingPotential[i];
          if (e && e.id) a.potential[e.id] = e.kind;
        }
        a._potTransferred = true;
      }
      return a;
    },
    agencyOf(vid) {
      var a = this.agencyState();
      if (!a.stats[vid]) a.stats[vid] = { expeditions: 0, monsterKills: 0, caches: 0, nodes: {} };
      if (!a.know[vid]) a.know[vid] = { plants: 0, monsters: 0, places: [], fought: [] };
      if (!a.know[vid].fought) a.know[vid].fought = []; // monster species they actually fought (teachable)
      if (!a.xp[vid]) a.xp[vid] = { tracking: 0, survival: 0, bravery: 0 };
      if (!a.tier[vid]) a.tier[vid] = 0;
      if (!a.scars[vid]) a.scars[vid] = [];
      return a;
    },

    // ---------- 1. RANGE PROFILES ----------
    // How far does this person go? Answered by who they are, not dice.
    npcRangingApt(vid) {
      var vp = this.vpOf(vid) || {};
      var score = 0;
      var occ = vp.occupationId || '';
      if (RANGY_OCC[occ]) score += 2;
      if (vp.knowsSnare) score += 1;
      try {
        var tags = [];
        // BREAK-IT abilities r6 2026-10-11 (sibling sweep): the stale
        // this.data.occupations path made odef {} forever, so no occupation
        // ever scored its +2 teachTags ranging bonus. Same class as the
        // ledger.js succession bug fixed the same run.
        var odef = (((this.data.characterGen || {}).occupations) || []).find(function (o) { return o.id === occ; }) || {};
        tags = odef.teachTags || [];
        if (tags.some(function (t) { return /track|forag|surviv|hunt|trail|wild/i.test(t); })) score += 2;
      } catch (e) {}
      var intel = vp.intelligence || {};
      if (intel.secondary === 'observant' || intel.primary === 'observant') score += 1;
      return score;
    },
    npcRangeProfile(vid) {
      var a = this.agencyState();
      if (a.profiles[vid]) return a.profiles[vid];
      var temp = 'steady';
      try { temp = this.npcTemper(vid); } catch (e) {}
      var goal = null;
      try { goal = this.npcGoal(vid); } catch (e) {}
      var vp = this.vpOf(vid) || {};
      var age = vp.age || 35;
      var score = 0;
      if (temp === 'bold' || temp === 'restless') score += 2;
      else if (temp === 'intense') score += 1;
      else if (temp === 'cautious' || temp === 'withdrawn') score -= 2;
      else if (temp === 'gentle') score -= 1;
      if (goal === 'explore') score += 2;
      else if (goal === 'prove' || goal === 'lead' || goal === 'escape') score += 1;
      else if (goal === 'heal' || goal === 'protect') score -= 1;
      if (age < 30) score += 1;
      else if (age > 55) score -= 2;
      else if (age > 45) score -= 1;
      score += this.npcRangingApt(vid);
      if (a.potential[vid]) score += 2; // the driven go farther
      var prof = score >= 5 ? 'explorer' : score >= 2 ? 'wanderer' : score >= -1 ? 'forager' : 'homebody';
      a.profiles[vid] = prof;
      return prof;
    },
    npcMaxDist(vid) {
      var p = this.npcRangeProfile(vid);
      return p === 'explorer' ? 6 : p === 'wanderer' ? 3 : p === 'forager' ? 1 : 0;
    },

    // ---------- 2. EXPEDITIONS ----------
    // Hooked after npcNodeTravel (once per day-part). Explorers and wanderers
    // leave for multi-day expeditions; legs resolve encounters with real stakes.
    agencyTick() {
      if (this.over) return;
      var v = this.state.village;
      var a = this.agencyState();
      var hx = v.px ?? 4, hy = v.py ?? 4;
      var roster = v.roster || [];
      var playerAtHaven = (this.map.px === hx && this.map.py === hy);
      for (var i = 0; i < roster.length; i++) {
        var rid = roster[i];
        if (rid === this.villagerId) continue;
        var vp = null;
        try { vp = this.vpOf(rid); } catch (e) {}
        if (vp && vp.dead) continue;
        try { if (this.isEngaged(rid)) continue; } catch (e) {}
        var ex = a.exped[rid];
        var away = (v.away || {})[rid];
        if (ex) {
          // base npcNodeTravel may have brought them home (duration elapsed)
          if (!away) { this.expeditionReturn(rid, playerAtHaven); continue; }
          this.expeditionLeg(rid, hx, hy, playerAtHaven);
          continue;
        }
        // at home: consider departing. Only wanderers/explorers range;
        // foragers use the base forage loop, homebodies stay.
        var prof = this.npcRangeProfile(rid);
        if (prof !== 'wanderer' && prof !== 'explorer') continue;
        var node = null;
        try { node = this.npcNode(rid); } catch (e) { continue; }
        if (!node || node.nx !== hx || node.ny !== hy) continue;
        var night = false;
        try { night = this.isNight(); } catch (e) {}
        if (night) continue;
        // OBJECTIVES (villager-objectives.js): the objective system owns the
        // door. Indoor-objective holders don't get expeditions, and expedition
        // launches respect the village danger level (tighten/defer territory
        // means nobody walks far today). Chain-safe: module may be absent.
        try {
          if (this.objOf) {
            var oo = this.objOf(rid);
            if (oo && oo.indoor && oo.state === 'indoor') continue;
          }
          // TRIGGER REGISTRY (rogue P0-5): the village-danger expedition
          // gate lives in the npc-triggers.js registry row
          // 'expedition_launch' — same predicate, same threshold.
          if (this.npcTrigger && this.npcTrigger(rid, 'expedition_launch')) continue;
        } catch (e) {}
        var chance = prof === 'explorer' ? 0.09 : 0.045;
        if (a.potential[rid]) chance *= 1.6;
        if (R() < chance) this.startExpedition(rid, hx, hy, playerAtHaven);
      }
      // rising stars with the 'lead' goal: the village starts looking at them.
      // The existing contender-heat machinery takes it from there.
      try { this.agencyLeadershipTick(); } catch (e) {}
      // the village talks about what its people did. Ambient, honest.
      try { if (playerAtHaven && R() < 0.12) this.agencyDeedTalk(); } catch (e) {}
    },
    startExpedition(vid, hx, hy, announce) {
      var a = this.agencyOf(vid);
      var st = this.agencyState();
      // GEAR-UP + HEAL CHECK (Steve 2026-10-09): expeditions arm up from the
      // village's gear and don't walk out hurt when help is at hand. A hurt
      // villager with no healer sits this cycle out (rest, try tomorrow).
      try { if (this.villagerGearUp) this.villagerGearUp(vid, true); } catch (e) {}
      try {
        if (this.villagerHealCheck) {
          var nm0 = 'Someone';
          try { nm0 = this.displayName(vid).split(' ')[0]; } catch (e2) {}
          if (this.villagerHealCheck(vid, nm0)) return;
        }
      } catch (e) {}
      // SICK (crisis leg 2026-10-22): the feverish stay home — parity with
      // the objective departure gate (objMaybeDepart). A sick villager
      // doesn't shoulder a pack for a multi-day expedition at any severity;
      // the fire's care is days away. (villagerHealCheck above only sees
      // wound HP.)
      try { if ((this.state.village.sick || {})[vid]) return; } catch (e) {}
      var maxD = this.npcMaxDist(vid);
      if (maxD < 1) return;
      // AMMO (gap-ammo 2026-10-27): the expedition is really launching —
      // pocket stones / craft a batch from the pile before leaving.
      try { if (this.villagerPocketAmmo) this.villagerPocketAmmo(vid); } catch (e) {}
      // target: a node out there, at real distance
      var dist = 1 + Math.floor(R() * maxD);
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      var d = pick(dirs);
      var tx = Math.max(0, Math.min(8, hx + d[0] * dist)); // 9x9 world (2026-10-07)
      var ty = Math.max(0, Math.min(8, hy + d[1] * dist)); // 9x9 world (2026-10-07)
      var duration = 8 + Math.floor(R() * 13); // 2-5 days of parts
      st.exped[vid] = {
        tx: tx, ty: ty, dist: dist, legs: 0,
        sinceDay: this.state.scholar.day, sincePart: this.dayPart,
        duration: duration, finds: [], encounters: [],
      };
      // mark away so the base loop treats them as gone (it handles the clock;
      // we handle the meaning). Base return just brings them home; we narrate.
      var v = this.state.village;
      v.away = v.away || {};
      v.away[vid] = {
        nx: tx, ny: ty, purpose: 'expedition',
        sinceDay: this.state.scholar.day, sincePart: this.dayPart, duration: duration,
      };
      try { this.npcSetNode(vid, tx > hx ? hx + 1 : tx < hx ? hx - 1 : hx, ty > hy ? hy + 1 : ty < hy ? hy - 1 : hy); } catch (e) {}
      a.stats[vid].expeditions++;
      var nm = '';
      try { nm = this.displayName(vid); } catch (e) { nm = 'Someone'; }
      if (announce) {
        var lines = [
          `${nm} shoulders a pack. "Going far this time. Don't wait up."`,
          `${nm} is leaving — not foraging. Really leaving. "I'll bring back something worth the walk."`,
          `"${dist > 3 ? 'Gone a while' : 'Out past the ridge'}," ${nm} says, already walking. "If I'm not back in a few days... well. I'll be back."`,
        ];
        this.say('🎒 ' + pick(lines));
      }
      // LONGSIM trust r2 (2026-10-11): departures are gossip-worthy news —
      // seed two witnesses so the rumor can actually travel (was heard: [],
      // born dead — the village never learned anyone had left). Same pattern
      // as the objective-departure path in villager-objectives.js.
      // DEPARTURE-PURPOSE (journey landing r32 2026-10-20): a multi-day
      // expedition is not a walk-out — mark it so the gossip render tells
      // the truth ("set out on a long trek", not "walked away").
      // TRIGGER REGISTRY (rogue P0-5): the witness shuffle + seeding lives
      // in the npc-triggers.js registry row 'departure'.
      try { if (this.npcTrigger) this.npcTrigger(vid, 'departure', { dims: { who: vid, purpose: 'expedition' } }); } catch (e) {}
    },
    expeditionLeg(vid, hx, hy, playerAtHaven) {
      var st = this.agencyState();
      var a = this.agencyOf(vid);
      var ex = st.exped[vid];
      if (!ex) return;
      ex.legs++;
      // move a node toward the target (they're out there, living)
      var node = null;
      try { node = this.npcNode(vid); } catch (e) { return; }
      var nx = node.nx, ny = node.ny;
      if (nx !== ex.tx || ny !== ex.ty) {
        nx += Math.sign(ex.tx - nx); ny += Math.sign(ex.ty - ny);
        nx = Math.max(0, Math.min(8, nx)); ny = Math.max(0, Math.min(8, ny)); // 9x9 world (2026-10-07)
        try { this.npcSetNode(vid, nx, ny); } catch (e) {}
        var key = nx + ',' + ny;
        a.stats[vid].nodes[key] = true;
      }
      var dist = Math.abs(nx - hx) + Math.abs(ny - hy);
      // XP accrues just for being out there and paying attention
      var mult = st.potential[vid] ? 2 : 1;
      a.xp[vid].tracking += mult;
      a.xp[vid].survival += mult;
      // VILLAGER XP (Steve 2026-10-09): ranging the wild is field work.
      try { if (this.creditDeed) this.creditDeed(vid, 'discovery'); } catch (e) { console.warn('[tracks] expedition deed', e); }
      // one encounter roll per leg, weighted by distance
      var roll = R();
      var mChance = 0.10 + dist * 0.035;
      if (roll < mChance) { this.expeditionMonster(vid, dist, playerAtHaven); return; }
      if (roll < mChance + 0.14) { this.expeditionCache(vid, dist); return; }
      if (roll < mChance + 0.14 + 0.22) { this.expeditionSign(vid, dist); return; }
      if (roll < mChance + 0.14 + 0.22 + 0.07) { this.expeditionStranger(vid, dist); return; }
      // tier check: sustained ranging changes people
      this.agencyTierCheck(vid, playerAtHaven);
    },
    // FIELD FIGHTS (Steve 2026-10-08): expedition meetings are real
    // blow-by-blow fights — real stats, the monster's real attack data.
    // The old flat death/hurt/evade/kill rolls are gone. The pre-fight
    // awareness check ("saw it, gave it room") stays — it decides contact,
    // not outcome. Once steel is crossed, the fight decides.
    expeditionMonster(vid, dist, playerAtHaven) {
      // POST-FLEE REST (sim-postflee-a 2026-10-25): a critically wounded
      // fleer fights nothing for the rest of the day. The entry check
      // precedes all agency reads, so it holds even when agency state is
      // uninitialized in a probe process.
      if (this.isPostFleeResting && this.isPostFleeResting(vid)) return;
      // TABLE SANCTITY (2026-10-12, Steve): while the table sits, the world
      // holds its breath — expeditions meet nothing out there. The village
      // is at the table or watching it; every stake is the table's own.
      // TRIGGER REGISTRY (rogue P0-5): the hard gate lives in the
      // npc-triggers.js registry row 'table_sits' — tableActive() unchanged.
      if (this.npcTrigger && this.npcTrigger(null, 'table_sits')) return;
      var a = this.agencyOf(vid);
      var st = this.agencyState();
      var pool = [];
      try { pool = this.monsterWavePool ? this.monsterWavePool() : (this.data.monsters || []); }
      catch (e) { pool = this.data.monsters || []; }
      if (!pool.length) return;
      var m = pick(pool);
      var mName = 'something';
      try { mName = this.encDescribeMonster ? this.encDescribeMonster(m) : (m.unknown || 'something'); } catch (e) {}
      var nm = '';
      try { nm = this.displayName(vid); } catch (e) { nm = 'Someone'; }
      // PARTY WIRING (Steve 2026-10-12): villagers fight together — nearby
      // villagers (same outdoor crew, in earshot) arrive as allies through
      // the fieldFight machinery. Trust-ordered: friends answer, strangers
      // don't. The depth probe measured calledHelp 0/531 before this.
      var allyVids = [];
      try { allyVids = this.villagerFightAllies ? this.villagerFightAllies(vid) : []; } catch (e) { allyVids = []; }
      // POST-FLEE REST: entry HP, so a vFlee below 25% of max can be
      // recognized after the fight's wounds land (max = max(100, entry)).
      var _pfEntryHp = 100;
      try { var _vh = (this.state.village || {}).health || {}; if (_vh[vid] !== undefined) _pfEntryHp = _vh[vid]; } catch (e) {}
      var rec = this.fieldFight(vid, m, null, { awareness: true, allies: allyVids.length, allyVids: allyVids });
      // The village hears about a rescue — gossip fodder, honestly sourced.
      // "Mara ran into the treeline when she heard James scream."
      if (rec.calledHelp && rec.allyVid) {
        try {
          var _rw = (this.state.village.roster || []).filter(function (id) { return id !== vid && id !== rec.allyVid; });
          for (var _ri = _rw.length - 1; _ri > 0; _ri--) { var _rj = Math.floor(R() * (_ri + 1)); var _rt = _rw[_ri]; _rw[_ri] = _rw[_rj]; _rw[_rj] = _rt; /* sim audit 2026-10-14: was `_rw[_ri] = _rj; _rw[_j] = _rt` (ReferenceError — rescue gossip never spread) */ }
          this.seedGossip('rescue', { who: rec.allyVid, for: vid }, _rw.slice(0, 2));
        } catch (e) {}
      }
      var fightNote = rec.rounds + ' rounds' + (rec.vTaken ? ', ' + rec.vTaken + ' taken' : '');
      if (rec.outcome === 'evade') {
        // saw it, gave it room, lived. That's a kind of knowledge.
        a.know[vid].monsters++;
        a.xp[vid].tracking += 2 * (st.potential[vid] ? 2 : 1);
        st.exped[vid].encounters.push('evaded ' + (m.id || 'it'));
        return;
      }
      // contact: they fought. Fighting teaches, whatever the ending.
      // (2026-10-08: wins and drive-offs used to walk away unwounded —
      // the record said "44 taken" while health never moved. Every
      // outcome now pays the fight's real price through the hurt pipeline.)
      a.know[vid].monsters++;
      if (rec.outcome === 'vKill') {
        try { this.hurtVillager(vid, rec.vTaken, 'monster', rec); } catch (e) {}
        // WAVE GATE (break-it 2026-10-09): village-wide kill minimums —
        // see resolveWildMonsterEncounter. The expedition's kill counts too.
        try { this.recordWaveKill(m.id, vid, 'agency', this.trickSummary ? this.trickSummary(rec) : null); } catch (e) {}
        // MAP MEMORY (villager-mapmem 2026-10-13): the kill used to leave no
        // body at all — the meat vanished. Now the body is really there
        // (registerDeath with node override, real rot clock, real meat
        // entry), and the killer remembers where. Kills are resources.
        try {
          var _kn = this.npcNode ? this.npcNode(vid) : null;
          var _carried = null;
          if (this.mapmemNoteKill && _kn) _carried = this.mapmemNoteKill(vid, m, _kn);
          // (r12 2026-10-17): the killer butchered on the spot — the meat
          // rides home in the expedition's pack, not on a corpse the rot
          // beats. Unknown flesh arrives as 0-kcal testable, per the
          // knowledge law.
          if (_carried && st.exped[vid]) {
            st.exped[vid].meat = st.exped[vid].meat || [];
            st.exped[vid].meat.push(_carried);
          }
        } catch (e) {}
        // KILL LOOT (Steve 2026-10-09): the killer loots the body — the
        // System's gift goes in their pack and they re-equip on the spot.
        var lootNote = '';
        try {
          var dropId = this.villagerKillLoot ? this.villagerKillLoot(vid, m) : null;
          if (dropId) {
            var ldef = (this.data.items || []).find(function (d) { return d.id === dropId; }) || {};
            lootNote = ' Took ' + (ldef.name || 'something strange') + ' off the body.';
            if (this.villagerGearUp) this.villagerGearUp(vid, false);
          }
        } catch (e) {}
        a.know[vid].monsters++;
        a.xp[vid].bravery += 3 * (st.potential[vid] ? 2 : 1);
        a.stats[vid].monsterKills++;
        // FOUGHT, not just seen (gap-breadth 2026-10-10): a kill means they
        // can TEACH the species later — earned monster knowledge, one
        // species per lesson, declining by construction.
        if (m.id && a.know[vid].fought.indexOf(m.id) === -1) a.know[vid].fought.push(m.id);
        st.exped[vid].encounters.push('killed ' + (m.id || 'it') + ' (' + fightNote + ')' + (lootNote ? ' —' + lootNote : ''));
        // PARTY WIRING: the "alone" copy is a lie when someone answered the
        // shout — name the rescuer honestly.
        var aloneNote = ' — alone — ';
        if (rec.calledHelp && rec.allyVid) {
          try { aloneNote = ' — with ' + this.displayName(rec.allyVid).split(' ')[0] + ' charging in when it turned — '; } catch (e) {}
        }
        this.recordDeed(vid, 'monster_kill', `${nm} killed ${mName} out past the ridge${aloneNote}and walked home. ${fightNote}.`, 10);
        return;
      }
      if (rec.outcome === 'mFlee') {
        try { this.hurtVillager(vid, rec.vTaken, 'monster', rec); } catch (e) {}
        a.xp[vid].bravery += 1;
        // stood it down = real contact = teachable (gap-breadth 2026-10-10).
        // Evades are just sightings — they stay flavor, never knowledge.
        if (m.id && a.know[vid].fought.indexOf(m.id) === -1) a.know[vid].fought.push(m.id);
        st.exped[vid].encounters.push('stood down ' + (m.id || 'it') + ' (' + fightNote + ')');
        this.recordDeed(vid, 'stood_down', `${nm} stood down ${mName} and kept walking. ${fightNote}.`, 4);
        return;
      }
      if (rec.outcome === 'vDie') return this.expedDeath(vid, mName, nm, playerAtHaven, m.id);
      // vFlee: real wounds from the real fight, then the hurt pipeline
      try { this.hurtVillager(vid, rec.vTaken, 'monster', rec); } catch (e) {}
      // POST-FLEE REST: fled at or below 25% of max — flag the day's rest and
      // log it in the expedition encounters list, never a silent save.
      var _pfRest = false;
      try {
        var _vh2 = (this.state.village || {}).health || {};
        var _endHp = (_vh2[vid] !== undefined) ? _vh2[vid] : 0;
        if (_endHp / Math.max(100, _pfEntryHp) <= 0.25) _pfRest = this.markPostFleeRest ? !!this.markPostFleeRest(vid) : false;
      } catch (e) {}
      if (_pfRest && st.exped[vid]) st.exped[vid].encounters.push('fled ' + (m.id || 'it') + ' — staying out of sight for the rest of the day, too hurt to meet it again');
      return this.expedHurt(vid, mName + ' (' + fightNote + ')', nm);
    },
    expedHurt(vid, mName, nm) {
      var a = this.agencyOf(vid);
      var st = this.agencyState();
      var scar = pick(['a limp that comes back in the cold', 'three white lines across the forearm', 'a flinch at sudden movement', 'a missing tip of the left ear']);
      a.scars[vid].push(scar);
      a.xp[vid].bravery += 2;
      if (st.exped[vid]) {
        st.exped[vid].encounters.push('hurt');
        // cut the expedition short — the body insists
        st.exped[vid].duration = Math.min(st.exped[vid].duration, st.exped[vid].legs + 1);
      }
      this.recordDeed(vid, 'survived_hurt', `${nm} came back mauled by ${mName} and alive. ${scar.charAt(0).toUpperCase() + scar.slice(1)} now.`, 2);
    },
    expedDeath(vid, mName, nm, playerAtHaven, monsterId) {
      var st = this.agencyState();
      var char = {};
      try { char = (this.data.villagers || []).find(function (x) { return x.id === vid; }) || {}; } catch (e) {}
      var v = this.state.village;
      try {
        // EXPEDID (2026-10-25, #1047): thread the killer's roster id through,
        // mirroring the hurtVillager path — registerDeath carries monsterId
        // (corpse + tele wave) and the fallen push below carries it too.
        // The display name stays mName, so a generated village-name alias
        // still displays exactly as before; only the plumbing now says
        // which species wore it. An absent monsterId lands null, as before.
        this.registerDeath({ kind: 'villager', villagerId: vid, name: char.name || nm, cause: mName, killerId: null,
          monsterId: monsterId || null, monsterName: mName });
      } catch (e) {}
      try { this.removeVillager(vid, 'killed'); } catch (e) {}
      // MEMORIAL ROLL (2026-10-25, #1047): expedition deaths never pushed
      // v.fallen — the roll missed them entirely. Mirror hurtVillager's
      // fallen push field for field, so the threaded monsterId lands in
      // the fallen entry, not just the corpse.
      try { v.fallen = v.fallen || []; v.fallen.push({ villagerId: vid, day: this.state.scholar.day, cause: mName, name: this.fallenName(vid), monsterId: monsterId || null, monsterName: mName }); } catch (e) {}
      delete st.exped[vid];
      if (v.away) delete v.away[vid];
      // TRIGGER REGISTRY (rogue P0-5): death reactions (gossip + moment +
      // grief voice) live in the npc-triggers.js registry row 'death' —
      // same handlers, same order, same conditions.
      try { if (this.npcTrigger) this.npcTrigger(vid, 'death', { mName: mName, nm: nm, playerAtHaven: playerAtHaven }); } catch (e) {}
    },
    expeditionCache(vid, dist) {
      var st = this.agencyState();
      var kcal = Math.round((300 + R() * 900) * (1 + dist * 0.15));
      st.exped[vid].finds.push({ kcal: kcal });
      var a = this.agencyOf(vid);
      a.stats[vid].caches++;
      a.xp[vid].survival += 2 * (st.potential[vid] ? 2 : 1);
      if (kcal > 1200) {
        var nm = '';
        try { nm = this.displayName(vid); } catch (e) { nm = 'Someone'; }
        this.recordDeed(vid, 'cache_haul', `${nm} found a cache out there — enough to matter.`, 6);
      }
    },
    expeditionSign(vid, dist) {
      var a = this.agencyOf(vid);
      var st = this.agencyState();
      // reading the wild: plants, tracks, places. This is how knowledge grows.
      var what = R();
      if (what < 0.45) {
        a.know[vid].plants++;
        a.xp[vid].tracking += 1;
        // LONGSIM lever 3 (2026-10-11): a teachable plant-lesson entry every
        // 2nd plant discovery (was every 3rd). Baseline: 7 entries / 20 runs
        // x200d — the villager->player plant-teach path was nearly dead.
        // Declining-by-construction is unchanged: one entry still spends one
        // unique plant lesson (agencyTeachPlant).
        if (a.know[vid].plants % 2 === 0) {
          st.teachable[vid] = st.teachable[vid] || [];
          st.teachable[vid].push({ topic: 'plants', day: this.state.scholar.day });
        }
      } else if (what < 0.75) {
        a.know[vid].monsters++;
      } else {
        var places = ['a burned farmhouse', 'an old trapline', 'a spring that runs clear', 'a ridge with a view for miles', 'a cellar full of jars'];
        var pl = pick(places);
        if (a.know[vid].places.indexOf(pl) === -1) a.know[vid].places.push(pl);
      }
      this.agencyTierCheck(vid, false);
    },
    expeditionStranger(vid, dist) {
      var a = this.agencyOf(vid);
      var nm = '';
      try { nm = this.displayName(vid); } catch (e) { nm = 'Someone'; }
      // someone else is out there. Sometimes that's a story.
      if (R() < 0.25) {
        this.recordDeed(vid, 'rescue', `${nm} found someone lost out past the ridge and walked them to shelter.`, 8);
      }
      a.xp[vid].survival += 1;
    },
    agencyTierCheck(vid, announce) {
      var a = this.agencyOf(vid);
      var st = this.agencyState();
      var xp = a.xp[vid];
      var total = xp.tracking + xp.survival + xp.bravery;
      var tier = total >= 120 ? 3 : total >= 60 ? 2 : total >= 25 ? 1 : 0;
      if (tier > a.tier[vid]) {
        a.tier[vid] = tier;
        // feed the visible ladder: their integration climbs, slot moments fire
        // through the existing beats (progression.js npcLadderDaily).
        try {
          var pg = this.progState();
          pg.npcInteg = pg.npcInteg || {};
          pg.npcInteg[vid] = (pg.npcInteg[vid] || 5) + 6;
        } catch (e) {}
        var nm = '';
        try { nm = this.displayName(vid); } catch (e) { nm = 'Someone'; }
        var lines = [
          `${nm} came back different. Quieter. Surer. The wild is writing on them.`,
          `Something in ${nm}'s eyes has changed. They've seen enough out there to stop being afraid of the dark.`,
          `${nm} doesn't boast. They don't have to. Everyone can see it.`,
        ];
        if (announce) this.say('◈ ' + pick(lines));
        try { this.seedGossip('changed', { who: vid }, []); } catch (e) {}
      }
    },
    expeditionReturn(vid, playerAtHaven) {
      var st = this.agencyState();
      var a = this.agencyOf(vid);
      var ex = st.exped[vid];
      delete st.exped[vid];
      if (!ex) return;
      var nm = '';
      try { nm = this.displayName(vid); } catch (e) { nm = 'Someone'; }
      // bring home the food
      var total = 0;
      for (var i = 0; i < (ex.finds || []).length; i++) total += ex.finds[i].kcal || 0;
      if (total > 0) {
        try { this.stockPantry(total, 'Expedition haul'); } catch (e) {}
      }
      // (r12 2026-10-17): the killer's butchered meat comes home too.
      // Known-safe meat feeds the pantry; unrevealed flesh arrives as
      // 0-kcal testable items — the knowledge law holds, transport is not
      // consumption, and the cautious-test loop can now see field meat.
      var meatKcal = 0, meatUnknown = 0;
      try {
        for (var mi = 0; mi < ((ex.meat || []).length); mi++) {
          var mm = ex.meat[mi];
          if (!mm) continue;
          if (mm.kcal) meatKcal += mm.kcal;
          for (var ui = 0; ui < ((mm.unknown || []).length); ui++) {
            var uitem = mm.unknown[ui];
            var vv = this.state.village;
            vv.pantry = vv.pantry || [];
            var hexist = null;
            try {
              hexist = (this.stacksMatch && vv.pantry.find(function (p) { return this.stacksMatch(p, uitem); }.bind(this))) || null;
            } catch (e2) {}
            if (hexist) {
              hexist.units = (hexist.units || 1) + (uitem.units || 1);
              // MERGE HONESTY (journey-deepening r19 2026-10-19): hiddenKcal
              // is the value-bearing field on 0-kcal unknown flesh — the
              // reveal distributes it over ALL units. Sum it, or the second
              // haul's energy silently vanishes at reveal (measured: 2x1400
              // hauls merged revealed 560, not 1120).
              hexist.hiddenKcal = (hexist.hiddenKcal || 0) + (uitem.hiddenKcal || 0);
            }
            else vv.pantry.push(uitem);
            meatUnknown++;
          }
        }
        if (meatKcal > 0) this.stockPantry(meatKcal, 'Expedition meat');
      } catch (e) {}
      var dist = ex.dist || 1;
      if (dist >= 4) this.recordDeed(vid, 'mapped_far', `${nm} walked farther than anyone's gone and came back with the map in their head.`, 3);
      // TRUST LEDGER (journey landing r12 2026-10-13): reason attributed.
      try { this.bumpTrust(vid, 1, 'came back from an expedition'); } catch (e) {}
      // the return is news, if you're there to see it
      if (playerAtHaven) {
        var bits = [];
        if (total > 0) bits.push(`+${total} kcal for the pantry`);
        if (meatKcal > 0) bits.push(`+${meatKcal} kcal of meat`);
        if (meatUnknown > 0) bits.push(`strange meat (unknown flesh — test it cautiously)`);
        if ((ex.encounters || []).length) bits.push(`${ex.encounters.length} ${ex.encounters.length === 1 ? 'story' : 'stories'}`);
        if (a.scars[vid].length) bits.push('a new scar');
        var suffix = bits.length ? ` (${bits.join(', ')})` : '. "Nothing out there but weather."';
        var dirs = ['north', 'south', 'east', 'west'];
        this.say(`🧭 ${nm} is back from ${dist >= 4 ? 'far past' : 'past'} the ${pick(dirs)}${suffix} (Ask them what they saw.)`);
      }
      // their knowledge is askable now
      var v = this.state.village;
      v.explorerNews = v.explorerNews || {};
      v.explorerNews[vid] = { day: this.state.scholar.day, agency: true, dist: dist };
      // LONGSIM trust r2 (2026-10-11): the return is news — seed two
      // witnesses so the rumor can travel (was heard: [], born dead).
      // TRIGGER REGISTRY (rogue P0-5): the witness shuffle + seeding lives
      // in the npc-triggers.js registry row 'return'.
      try { if (this.npcTrigger) this.npcTrigger(vid, 'return'); } catch (e) {}
    },

    // ---------- 3. DEEDS & OUTSHINING ----------
    // recordDeed: the sim did something real. Report it honestly through
    // THREE channels (Steve's surfacing direction, 2026-10-04):
    //   1. THE LIVING CODEX — the village's book remembers who did what.
    //      Synced within the village; later multi-village sync reads this.
    //      A deed is a codex entry, not just a rumor.
    //   2. THE CONTEST — deeds move a villager's viewership. The leaderboard
    //      ranks villagers; being outshone becomes VISIBLE: she's above you.
    //   3. THE BROADCAST — big deeds air. The village watches the footage;
    //      the galaxy sees it too.
    // Gossip then points at things the player can VERIFY — check the codex,
    // check the board, remember the footage. That's what makes being
    // outshone undeniable instead of hearsay.
    //
    // Play-your-own-game (Steve's philosophy): public surfacing pushes
    // DIFFERENTIATION, not imitation. Deed texts celebrate distinct lanes
    // ("Mara's the one who walks far") — identity, not rank-chasing.
    recordDeed(vid, type, text, magnitude) {
      // TRIGGER REGISTRY (rogue P0-5): the deed surfacing (deed ledger +
      // living Codex + contest viewership board + broadcast + gossip +
      // moment + overheard say) lives in the npc-triggers.js registry row
      // 'deed' — same handlers, same order, same conditions. The magnitude
      // resolution stays here (DEED_MAG is module scope); the row receives
      // the resolved mag. This signature is unchanged for all callers.
      var mag = magnitude || DEED_MAG[type] || 2;
      if (this.npcTrigger) return this.npcTrigger(vid, 'deed', { type: type, text: text, mag: mag });
    },
    // codexDeeds: the village's book of who did what. Read by the codex UI.
    codexDeeds() {
      try { return ((this.state.codex || {}).deeds || []).slice(); }
      catch (e) { return []; }
    },
    // npcViewership: per-villager contest score. Deeds move it; the board ranks it.
    npcViewership(vid) {
      try {
        var vv = this.state.village;
        vv.npcViewership = vv.npcViewership || {};
        if (vv.npcViewership[vid] == null) {
          vv.npcViewership[vid] = 5 + Math.floor((((vv.trust || {})[vid] || 10)) / 12);
        }
        return vv.npcViewership[vid];
      } catch (e) { return 5; }
    },
    // playerBoardScore: your own standing — notable moments plus what you've learned.
    playerBoardScore() {
      try {
        var pg = this.progState ? this.progState() : {};
        var n = ((pg.moments || []).length);
        var breadth = 0;
        try { breadth = this.codexBreadth ? this.codexBreadth() : 0; } catch (e) {}
        return 5 + n * 2 + Math.floor(breadth / 3);
      } catch (e) { return 5; }
    },
    // villagerBoard: THE contest board, per villager, high→low. The player is
    // a row like everyone else. She's above you — visible, verifiable.
    villagerBoard() {
      var rows = [];
      try {
        var self = this;
        var roster = (this.state.village.roster || []);
        for (var i = 0; i < roster.length; i++) {
          var id = roster[i];
          try { var vp = this.vpOf(id); if (vp && vp.dead) continue; } catch (e) {}
          var isYou = (id === this.villagerId);
          var nm = 'Someone';
          try { nm = isYou ? 'You' : this.displayName(id); } catch (e) {}
          var score = isYou ? this.playerBoardScore() : this.npcViewership(id);
          // trend: recent deeds rising?
          var recent = 0;
          try {
            var st = this.agencyState();
            for (var j = 0; j < st.ach.length; j++) {
              var d = st.ach[j];
              if (d.vid === id && (this.state.scholar.day - d.day) <= 3) recent += d.mag;
            }
          } catch (e) {}
          rows.push({ vid: id, name: nm, score: score, you: isYou, trend: recent >= 8 ? '▲' : '' });
        }
      } catch (e) {}
      rows.sort(function (a, b) { return b.score - a.score; });
      return rows;
    },
    agencyScore(vid) {
      var st = this.agencyState();
      var score = 0;
      for (var i = 0; i < st.ach.length; i++) if (st.ach[i].vid === vid) score += st.ach[i].mag;
      var s = (st.stats[vid] || {});
      score += (s.expeditions || 0) * 2 + (s.monsterKills || 0) * 8;
      score += Object.keys(s.nodes || {}).length;
      var a = st; // tier lives keyed by vid
      score += ((a.tier || {})[vid] || 0) * 4;
      return score;
    },
    // ambient: the village talks about its people. You overhear.
    agencyDeedTalk() {
      var st = this.agencyState();
      var recent = st.ach.filter(function (d) { return (this.state.scholar.day - d.day) <= 2; }.bind(this));
      if (!recent.length) return;
      var d = pick(recent);
      var roster = (this.state.village.roster || []).filter(function (id) { return id !== this.villagerId && id !== d.vid; }.bind(this));
      if (!roster.length) return;
      var teller = pick(roster);
      var tn = '', dn = '';
      try { tn = this.displayName(teller); dn = this.displayName(d.vid); } catch (e) { return; }
      var lines = [
        `You catch ${tn} telling the fire about ${dn}. "${d.text.split('—')[0].trim()}" The story's already growing.`,
        `${tn} shakes their head, admiring. "Did you hear what ${dn} did?" You hadn't. Now you have.`,
        `Someone's retelling it again — ${dn}, out past the ridge. ${tn} says "${dn} would've gone farther if we'd let them."`,
      ];
      // big deeds are verifiable: the gossip points at the codex and the board.
      if (d.mag >= 6) lines.push(`${tn} is going on about ${dn} again. "Don't believe me? It's in the Codex. Check the board — ${dn.split(' ')[0]}'s above half the village."`);
      this.say(pick(lines));
    },
    agencyLeadershipTick() {
      var v = this.state.village;
      if (v.challenge) return;
      var roster = v.roster || [];
      for (var i = 0; i < roster.length; i++) {
        var id = roster[i];
        if (id === this.villagerId) continue;
        var goal = null;
        try { goal = this.npcGoal(id); } catch (e) {}
        if (goal !== 'lead') continue;
        var score = this.agencyScore(id);
        if (score >= 20 && R() < 0.10) {
          v.heat = v.heat || {};
          v.heat[id] = (v.heat[id] || 0) + 1;
          var nm = '';
          try { nm = this.displayName(id); } catch (e) { nm = 'Someone'; }
          this.say(`${nm} doesn't say much lately. Doesn't have to — people are starting to look at them when decisions get made.`);
          if ((v.heat[id] || 0) >= 3 && !v.challenge) {
            v.challenge = { cid: id, task: 'forage', age: 0 };
            this.say(`${nm} steps closer. "We need to talk. About who's actually running things here."`);
          }
        }
      }
    },

    // ---------- 4. TEACHING: what they learned out there ----------
    // Explorers come back with knowledge the player can ask for. Earned,
    // specific, through conversation — never passive.
    npcFieldLessons(vid) {
      var st = this.agencyState();
      var lessons = [];
      var t = st.teachable[vid] || [];
      if (t.length) lessons.push({ topic: 'plants', n: t.length });
      // MONSTER LESSONS (gap-breadth 2026-10-10): only species they FOUGHT
      // and you haven't learned yet — the lesson is real or it doesn't exist.
      var teachableMonsters = this.agencyTeachableMonsters(vid);
      if (teachableMonsters.length) lessons.push({ topic: 'monsters', n: teachableMonsters.length });
      var k = (st.know[vid] || {});
      if ((k.places || []).length) lessons.push({ topic: 'places', n: k.places.length });
      var v = this.state.village;
      if (v.explorerNews && v.explorerNews[vid]) lessons.push({ topic: 'expedition', n: 1 });
      return lessons;
    },
    // agencyTeachableMonsters: fought species the player hasn't learned.
    // 'observed'/'slain' = already known — never re-taught (declining).
    agencyTeachableMonsters(vid) {
      var st = this.agencyState();
      var fought = ((st.know[vid] || {}).fought) || [];
      var cxm = (this.state.codex || {}).monsters || {};
      return fought.filter(function (mid) {
        var e = cxm[mid] || {};
        return !(e.stage === 'observed' || e.stage === 'slain');
      });
    },
    agencyChoices(vid) {
      try {
        var lessons = this.npcFieldLessons(vid);
        if (!lessons.length) return [];
        var v = this.state.village;
        if (v.explorerNews && v.explorerNews[vid] && v.explorerNews[vid].agency) {
          return [{ id: 'agency:ask_expedition', label: '"What did you see out there?"' }];
        }
        // LABEL HONESTY (journey-establishment r27 2026-10-23): the ask
        // teaches monster > plant > place in priority order, but the old
        // label always promised "from the wild" — a farmhouse or a cellar
        // isn't the wild, and four runs of sense-reads flagged it. The
        // label now names what's actually on offer.
        return [{ id: 'agency:ask_field', label: this.agencyAskFieldLabel(vid) }];
      } catch (e) { return []; }
    },
    // agencyAskFieldLabel: topic-aware label for the field-teach ask. Shared
    // by agencyChoices (the menu) and agencyTurn (the transcript echo) so
    // the player line in the transcript always matches the label picked.
    agencyAskFieldLabel(vid) {
      try {
        var lessons = this.npcFieldLessons(vid) || [];
        var hasWild = lessons.some(function (l) { return l && (l.topic === 'monsters' || l.topic === 'plants'); });
        var hasPlaces = lessons.some(function (l) { return l && l.topic === 'places'; });
        if (!hasWild && hasPlaces) return '"What places have you found out there?"';
      } catch (e) {}
      return '"Teach me something from the wild."';
    },
    agencyTurn(vid, choiceId) {
      var st = this.agencyState();
      var nm = '';
      // SENSE (longsim agency r2): firstRef, never split(' ')[0] — a stranger
      // descriptor's first word is bare "A" ("A taught you"), but firstRef
      // gives the distinguishing descriptor.
      try { nm = this.firstRef ? this.firstRef(vid) : this.displayName(vid); } catch (e) { nm = 'They'; }
      if (choiceId === 'agency:ask_expedition' || choiceId === 'agency:ask_field') {
        var v = this.state.village;
        var k = st.know[vid] || { plants: 0, monsters: 0, places: [] };
        // LABEL TIMING (journey-establishment r27 2026-10-23): the label is
        // computed BEFORE any lesson is consumed — the teach block below
        // spends entries (places.pop()), and a post-teach label would always
        // read the pool one lesson late (places-only pools echoed the wild
        // label). The menu (agencyChoices) and the turn share agencyAskFieldLabel.
        var youLabel = choiceId === 'agency:ask_expedition'
          ? '"What did you see out there?"' : this.agencyAskFieldLabel(vid);
        // ONE ASK, ONE LESSON (journey-succession 2026-10-12): the old path
        // fired agencyTeachMonster AND agencyTeachPlant in the same ask —
        // each permanently spent a teachable entry — then shuffled and spoke
        // only one line. Two lessons burned, one delivered. Now exactly one
        // lesson per ask (monster > plant > place); each resource is spent
        // once, including places, which used to be an infinite faucet (the
        // same ridge "shown on the map" forever).
        var taughtMid = null, taughtPlant = null, taughtPlace = null;
        // real teaching: monster lore from someone who fought it. One
        // species per ask; the lesson lands as 'observed' — you've learned
        // it the way the village learns things: through talk. The line names
        // the species: each lesson is specific, never a generic repeat.
        try { taughtMid = this.agencyTeachMonster(vid); } catch (e) {}
        // real teaching: one plant identification per earned lesson entry.
        // The entry is SPENT — talk doesn't print knowledge (gap-breadth
        // 2026-10-10; the old path re-taught forever on k.plants>=3).
        // The line names the plant taught: specific beats repeat.
        if (!taughtMid && (st.teachable[vid] || []).length) {
          try {
            if (this.agencyTeachPlant(vid)) taughtPlant = st.lastTaughtPlantName || 'a plant';
          } catch (e) {}
        }
        if (!taughtMid && !taughtPlant && (k.places || []).length) {
          taughtPlace = k.places.pop();
        }
        var lineText = null;
        if (taughtMid) {
          // PER-MONSTER LESSON (journey establishment r6 2026-10-12): the
          // teacher's real tell, not the old generic template.
          lineText = this.agencyMonsterLessonLine(taughtMid);
        } else if (taughtPlant) {
          lineText = `"This one — ${taughtPlant}. Leaf, stem, smell. You won't forget it now."`;
        } else if (taughtPlace) {
          lineText = `"${taughtPlace} — I'll show you on the map sometime. It's real."`;
        } else if ((k.monsters || 0) >= 2) {
          lineText = `"Saw things with too many joints. Give them room. That's the whole lesson."`;
        }
        if (v.explorerNews) delete v.explorerNews[vid];
        // HONESTY (longsim agency 2026-10-11): the 'taught' deed and the
        // teaching trust bump fire only when something was actually taught.
        // Baseline: 133 of 160 asks recorded the deed with no lesson behind
        // it — the village's book must not lie about its people.
        var actuallyTaught = !!(taughtMid || taughtPlant || taughtPlace);
        if (actuallyTaught) {
          try { this.bumpTrust(vid, 2); } catch (e) {}
          try { this.recordDeed(vid, 'taught', `${nm} taught you something from the wild.`, 1); } catch (e) {}
          if ((taughtMid || taughtPlant) && typeof this.addGrounding === 'function') this.addGrounding(2, 'teaching', vid, { save: false });
        }
        // TRANSCRIPT (longsim agency 2026-10-11): agency turns bypassed the
        // convoTurn wrapper, so teaching conversations left no trace in the
        // dialogue transcript/history. Speak through sayLine — the single
        // emission choke point — which pushes the transcript entry and
        // enforces the no-repeat invariant (per-convo + run-wide ledgers).
        // The player line is pushed ONLY when the NPC has something to say —
        // the old path pushed it first, so an exhausted ask left a naked
        // player echo in the transcript (sense-caught 2026-10-12: "Teach me
        // something from the wild." with no reply, repeated).
        var c = null;
        try { c = this.convoGet(vid); } catch (e) {}
        // (youLabel computed at the top of this branch — see LABEL TIMING.)
        // The player line lands BEFORE the NPC answers (reading order), but
        // is pulled back on the noop path — an exhausted ask leaves no
        // naked player echo in the transcript.
        var youEntry = { who: 'you', text: youLabel };
        if (c) c.transcript.push(youEntry);
        var spokenText = null;
        if (lineText) {
          try { if (this.sayLine(vid, lineText)) spokenText = lineText; } catch (e) { spokenText = null; }
        }
        var closedOut = false;
        if (!spokenText) {
          // nothing new (or the line was a blocked repeat): honest closers,
          // tried in order THROUGH the no-repeat ledger, so the view and the
          // transcript can never disagree (sense-caught 2026-10-11: the old
          // fallback returned a ledger-blocked line, so the view showed it
          // while the transcript denied it).
          var closers = [
            '"There\'s more, but that\'s for another fire."',
            '"That\'s everything I brought back. The rest is just walking."',
            '"I\'ve told you everything I know about that."',
          ];
          for (var ci = 0; ci < closers.length; ci++) {
            var em2 = null;
            try { em2 = this.sayLine(vid, closers[ci]); } catch (e) { em2 = null; }
            if (em2) { spokenText = closers[ci]; closedOut = true; break; }
          }
        }
        if (!spokenText) {
          // even the closers are exhausted: honest noop — the player echo is
          // pulled back out (object identity, robust against the 200-cap
          // shift), no transcript void. The choice should never have been
          // offered (agencyChoices gates on npcFieldLessons), but a silent
          // player echo is worse than a silent no-op.
          if (c) { var xi = c.transcript.indexOf(youEntry); if (xi !== -1) c.transcript.splice(xi, 1); }
          var noChoices = [];
          try { noChoices = this.convoChoices(vid); } catch (e) {}
          return { ended: true, line: null, choices: [], noop: true, transcript: c ? c.transcript.slice() : [] };
        }
        // SPENT (journey-succession 2026-10-12): a closer means the pool is
        // dry for this sitting — "I've told you everything" must not loop.
        if (closedOut) {
          try { this.convoSpendChoice(vid, choiceId); } catch (e) {}
        }
        var choices = [];
        try { choices = this.convoChoices(vid); } catch (e) {}
        if (taughtMid || taughtPlant) {
          try { this.save(); } catch (e) { console.warn('[grounding] settled lesson save', e); }
        }
        return { line: spokenText, choices: choices, ended: false, transcript: c ? c.transcript.slice() : [] };
      }
      return null;
    },
    // teachPlantLine — the spoken line for a villager->player plant lesson
    // (longsim agency r6 2026-10-12). Varies off the player's READ NEED
    // (wound/hunger/novice/general), parallel to r5's teachChoreLine for the
    // villager->villager chore: a hurt player gets shown wound herbs, a
    // hungry one gets shown food, a novice gets the beginner's tour. The
    // wound/hunger frames only fire when the picked plant actually fits —
    // a wound claim on a food plant would be a lie the player might act on —
    // so the need is the conjunction of (player state) x (plant properties).
    // Novice is about the teaching, not the plant, so it needs no fit.
    // Pure string building, no RNG — narration-only, sim trajectories
    // unchanged.
    teachPlantLine(nm, plantName, need) {
      var shown = plantName || 'a plant';
      var codexName = plantName || 'plant';
      var codexBit = `(Codex: ${codexName} identified.)`;
      if (need === 'wound') return `📖 ${nm} shows you ${shown} — which leaves to press on a wound. You won't forget it now. ${codexBit}`;
      if (need === 'hunger') return `📖 ${nm} shows you ${shown} — where it grows, what's safe to eat. You won't forget it now. ${codexBit}`;
      if (need === 'novice') return `📖 ${nm} walks you through ${shown} — leaf, stem, smell, the beginner's tour. You won't forget it now. ${codexBit}`;
      return `📖 ${nm} shows you ${shown} — leaf, stem, smell. You won't forget it now. ${codexBit}`;
    },
    agencyTeachPlant(vid) {
      // an explorer teaches you one plant they actually learned. Concrete,
      // from the data pool, only if you don't know it yet. Each lesson
      // SPENDS one earned teachable entry (gap-breadth 2026-10-10):
      // declining returns, not an infinite talk faucet.
      var st = this.agencyState();
      var t = st.teachable[vid] || [];
      st.lastTaughtPlantName = null; // read by agencyTurn for the spoken line
      if (!t.length) return false;
      t.shift();
      var plants = this.data.plants || [];
      var cx = this.state.codex || {};
      cx.plants = cx.plants || {};
      var cands = plants.filter(function (p) { return p && p.id && !((cx.plants[p.id] || {}).level >= 1); });
      if (!cands.length) return false;
      var p = pick(cands);
      // READ THE PLAYER (longsim agency r6 2026-10-12): the teacher sees
      // who's in front of them — hurt, hungry, or green — and frames the
      // lesson accordingly. Computed BEFORE the codex write so the novice
      // read reflects pre-lesson teaching experience. Zero RNG draws, no
      // state writes: narration-only by construction.
      //
      // NOVICE is "new to being taught the wild" (taught-source lessons < 3),
      // not codex breadth: the player outgrows breadth<8 before the first
      // ask (fireside/shared teach fast), but the first few direct lessons
      // are still the beginner's tour. Wound/hunger frames only fire when
      // the picked plant actually fits — a wound claim on a food plant
      // would be a lie the player might act on.
      var need = null;
      try {
        var _pid = this.villagerId;
        var _h = ((this.state.village || {}).health || {})[_pid];
        var _wounded = (_h !== undefined ? _h : 100) < 40; // open-wounds threshold (disease vector)
        var _hungry = false;
        try { _hungry = (this.npcNeeds(_pid).hunger || 0) >= 60; } catch (e2) {}
        var _taughtCount = 0;
        try {
          var _cpl = (this.state.codex || {}).plants || {};
          for (var _k in _cpl) if (_cpl[_k] && _cpl[_k].source === 'taught') _taughtCount++;
        } catch (e2) {}
        var _novice = _taughtCount < 3;
        var _isMed = !!(p && p.medicinal);
        var _isFood = false;
        try {
          if (p && (p.edibility === 'safe' || p.edibility === 'caution') && (p.caloriesPerUnit || 0) > 0) _isFood = true;
          else if (p) for (var _ui = 0; _ui < (p.uses || []).length; _ui++) if (p.uses[_ui].kind === 'food') { _isFood = true; break; }
        } catch (e2) {}
        if (_wounded && _isMed) need = 'wound';
        else if (_hungry && _isFood) need = 'hunger';
        else if (_novice) need = 'novice';
      } catch (e) {}
      cx.plants[p.id] = { level: 1, source: 'taught' };
      st.lastTaughtPlantName = p.name || p.id;
      // AGENCY-TEACH HONESTY (journey deepening r12 2026-10-15): teaching the
      // player a plant proves the teacher knows it. Record it in
      // village.taught so plantsKnownBy covers it — otherwise the
      // conversation teach-back menu later offers the SAME plant back with
      // "I never knew that" reactions (sense-caught 8504-d45: Monique
      // taught Chinese Chive, then the player "taught" it back to her).
      try { if (this.villagerLearnsPlant) this.villagerLearnsPlant(vid, p.id, 'taught'); } catch (e2) {}
      var nm = '';
      try { nm = this.firstRef ? this.firstRef(vid) : this.displayName(vid); } catch (e) { nm = 'They'; } // firstRef: never bare "A" for stranger descriptors
      this.say(this.teachPlantLine(nm, p.name, need));
      return true;
    },
    // agencyTeachVillager: the HAVEN_CHORE 'teach' chore made real (longsim
    // agency r2 2026-10-11). A villager who knows plants (the identity
    // system: familiar/taught/plantKnowledge via plantsKnownBy) shows a
    // fellow villager one they don't know yet: villagerLearnsPlant lands
    // the identity with source 'taught' — the same real teaching the
    // duty-system 'teach' task does, but ambient, not assigned. The learner
    // also gains one tracking xp (fieldcraft, the way discoveries earn it)
    // and a real lesson record lands in a.lessons; the teacher gets the
    // honest 'taught' deed (mag 1). The spoken line and deed name the
    // plant through plantDisplayName — knowledge-gated, so the player
    // reads a name or an honest descriptor, never a leak. Monster lore
    // stays the player channel: villagers keep no monster codex.
    //
    // NEED-DRIVEN, TEACHER-QUALITY TEACHING (longsim agency r4 2026-10-11):
    // lessons used to pick a random plant for a random learner. Now the
    // teacher reads the learner's state first, and the lesson quality
    // depends on the teacher's own knowledge. Exact dial:
    //   - learner WOUNDED (homeWounds[vid] > today): medicinal plants x4 weight
    //   - else learner HUNGRY (npcNeeds.hunger >= 60) or NOVICE forager
    //     (tracking xp < 8): food plants x3 weight
    //   - teacher breadth <5 known: 60% lesson success; 5-11: 85%; 12+:
    //     95% and the lesson grants +2 tracking xp instead of +1
    // A failed lesson returns {taught:false} — the chore's honest "going
    // over their finds" line covers it, never a lesson claim. The deed
    // text varies by the need read, so the village's book records WHY.
    agencyTeachVillager(teacherVid, learnerVid) {
      var st = this.agencyState();
      var v = this.state.village || {};
      if (!learnerVid || (v.roster || []).indexOf(learnerVid) === -1) return { taught: false };
      var dead = false;
      try { var lvp = this.vpOf(learnerVid); if (lvp && lvp.dead) dead = true; } catch (e) {}
      if (dead) return { taught: false };
      // SNARE APPRENTICESHIP (trapline 2026-10-13): a villager who knows the
      // wire can hand it on to a fellow villager who doesn't. Before this,
      // knowsSnare was occupation-sealed — no villager could ever learn it,
      // so the whole NPC trapline lived or died on the starting cast. Word
      // of mouth is the canon pre-codex channel; this is its trapping beat.
      // Same regard gate as the player teach beat (trust 15+; strangers
      // don't hand over their craft), once per learner, need-driven (the
      // lesson lands for a hungry or novice learner — nobody studies wire
      // on a full belly for fun), and recorded like every real lesson.
      try {
        var _tvp = this.vpOf ? this.vpOf(teacherVid) : null;
        var _lvp = this.vpOf ? this.vpOf(learnerVid) : null;
        if (_tvp && _tvp.knowsSnare && _lvp && !_lvp.knowsSnare && !_lvp.snareTaught) {
          var _ttr = 10;
          try { var __t = (this.state.village.trust || {})[teacherVid]; if (__t !== undefined) _ttr = __t; } catch (e) {}
          if (_ttr >= 15) {
            var _hungry = false, _novice = false;
            try { _hungry = (this.npcNeeds(learnerVid).hunger || 0) >= 60; } catch (e) {}
            try {
              var _lag = this.agencyOf ? this.agencyOf(learnerVid) : null;
              var _lxp = _lag && _lag.xp ? _lag.xp[learnerVid] : null;
              _novice = !_lxp || (_lxp.tracking || 0) < 8;
            } catch (e) {}
            if (_hungry || _novice) {
              // the teacher knows the wire cold — binary knowledge, no
              // breadth tiers; the lesson lands or it doesn't.
              if (R() < 0.85) {
                _lvp.knowsSnare = true;
                _lvp.snareTaught = true;
                var _day = 0;
                try { _day = this.state.scholar.day || 0; } catch (e) {}
                var _need = _hungry ? 'hunger' : 'novice';
                st.lessons[learnerVid] = st.lessons[learnerVid] || [];
                st.lessons[learnerVid].push({ from: teacherVid, topic: 'snare', day: _day, need: _need });
                try {
                  var _la = this.agencyOf(learnerVid);
                  _la.xp[learnerVid].tracking += 1;
                  this.agencyTierCheck(learnerVid, false);
                } catch (e) {}
                var _tnm = 'Someone', _lnm = 'someone';
                try { _tnm = this.firstRef ? this.firstRef(teacherVid) : this.displayName(teacherVid); } catch (e) {}
                try { _lnm = this.firstRef ? this.firstRef(learnerVid) : this.displayName(learnerVid); } catch (e) {}
                var _deed = _need === 'hunger'
                  ? `${_tnm} taught ${_lnm} the snare — the loop, the trigger stick, where the run narrows. Meat for the hungry.`
                  : `${_tnm} showed ${_lnm} the snare — the loop, the trigger stick, where the run narrows. The beginner's wire.`;
                try { this.recordDeed(teacherVid, 'taught', _deed, 1); } catch (e) {}
                try { this.tele('snare_lesson', { teacher: teacherVid, learner: learnerVid, need: _need }); } catch (e) {}
                return { taught: true, learner: learnerVid, topic: 'snare', need: _need };
              }
              return { taught: false, failed: true };
            }
          }
        }
      } catch (e) {}
      // PIT APPRENTICESHIP (pitknowledge 2026-10-18): the same word-of-mouth
      // for the pit — a villager who knows it can hand it on to a fellow
      // villager who doesn't. Same regard gate (trust 15+), once per learner,
      // need-driven (hungry or novice), recorded like every real lesson, and
      // gated on the channel flag. More pit-knowing hands means more pit
      // lines worked — and more chances the player witnesses one.
      try {
        var _pitOn = (this.pitKnowledgeOn && this.pitKnowledgeOn()) ? true : false;
        var _ptvp = this.vpOf ? this.vpOf(teacherVid) : null;
        var _plvp = this.vpOf ? this.vpOf(learnerVid) : null;
        if (_pitOn && _ptvp && _ptvp.knowsPit && _plvp && !_plvp.knowsPit && !_plvp.pitTaught) {
          var _pttr = 10;
          try { var __pt = (this.state.village.trust || {})[teacherVid]; if (__pt !== undefined) _pttr = __pt; } catch (e) {}
          if (_pttr >= 15) {
            var _phungry = false, _pnovice = false;
            try { _phungry = (this.npcNeeds(learnerVid).hunger || 0) >= 60; } catch (e) {}
            try {
              var _plag = this.agencyOf ? this.agencyOf(learnerVid) : null;
              var _plxp = _plag && _plag.xp ? _plag.xp[learnerVid] : null;
              _pnovice = !_plxp || (_plxp.tracking || 0) < 8;
            } catch (e) {}
            if (_phungry || _pnovice) {
              if (R() < 0.85) {
                _plvp.knowsPit = true;
                _plvp.pitTaught = true;
                var _pday = 0;
                try { _pday = this.state.scholar.day || 0; } catch (e) {}
                var _pneed = _phungry ? 'hunger' : 'novice';
                st.lessons[learnerVid] = st.lessons[learnerVid] || [];
                st.lessons[learnerVid].push({ from: teacherVid, topic: 'pit', day: _pday, need: _pneed });
                try {
                  var _pla = this.agencyOf(learnerVid);
                  _pla.xp[learnerVid].tracking += 1;
                  this.agencyTierCheck(learnerVid, false);
                } catch (e) {}
                var _ptnm = 'Someone', _plnm = 'someone';
                try { _ptnm = this.firstRef ? this.firstRef(teacherVid) : this.displayName(teacherVid); } catch (e) {}
                try { _plnm = this.firstRef ? this.firstRef(learnerVid) : this.displayName(learnerVid); } catch (e) {}
                var _pdeed = _pneed === 'hunger'
                  ? `${_ptnm} taught ${_plnm} the pit trap — the depth, the stakes, where the game trail runs. Meat for the hungry.`
                  : `${_ptnm} showed ${_plnm} the pit trap — the depth, the stakes, where the game trail runs. The beginner's pit.`;
                try { this.recordDeed(teacherVid, 'taught', _pdeed, 1); } catch (e) {}
                try { this.tele('pit_lesson', { teacher: teacherVid, learner: learnerVid, need: _pneed }); } catch (e) {}
                return { taught: true, learner: learnerVid, topic: 'pit', need: _pneed };
              }
              return { taught: false, failed: true };
            }
          }
        }
      } catch (e) {}
      var tKnown = [], lKnown = [];
      try { tKnown = this.plantsKnownBy ? this.plantsKnownBy(teacherVid) : []; } catch (e) {}
      try { lKnown = this.plantsKnownBy ? this.plantsKnownBy(learnerVid) : []; } catch (e) {}
      var cands = tKnown.filter(function (pid) { return lKnown.indexOf(pid) === -1; });
      if (!cands.length) return { taught: false }; // theater check: nothing to show
      // READ THE LEARNER: is someone struggling in front of the teacher?
      var today = 0;
      try { today = this.state.scholar.day || 0; } catch (e) {}
      var wounded = false, hungry = false, novice = false;
      try { wounded = ((this.state.homeWounds || {})[learnerVid] || 0) > today; } catch (e) {}
      try { hungry = (this.npcNeeds(learnerVid).hunger || 0) >= 60; } catch (e) {}
      try {
        var lag = this.agencyOf ? this.agencyOf(learnerVid) : null;
        var lxp = lag && lag.xp ? lag.xp[learnerVid] : null;
        novice = !lxp || (lxp.tracking || 0) < 8;
      } catch (e) {}
      var need = wounded ? 'wound' : (hungry ? 'hunger' : (novice ? 'novice' : null));
      var plants = [];
      try { plants = this.data.plants || []; } catch (e) {}
      var isMedicinal = function (pid) {
        var p = null;
        for (var i = 0; i < plants.length; i++) if (plants[i].id === pid) { p = plants[i]; break; }
        return !!(p && p.medicinal);
      };
      var isFood = function (pid) {
        var p = null;
        for (var i = 0; i < plants.length; i++) if (plants[i].id === pid) { p = plants[i]; break; }
        if (!p) return false;
        if ((p.edibility === 'safe' || p.edibility === 'caution') && (p.caloriesPerUnit || 0) > 0) return true;
        try { for (var u = 0; u < (p.uses || []).length; u++) if (p.uses[u].kind === 'food') return true; } catch (e) {}
        return false;
      };
      var pid;
      if (need === 'wound') {
        pid = pickW(cands, function (id) { return isMedicinal(id) ? 4 : 1; });
      } else if (need === 'hunger' || need === 'novice') {
        pid = pickW(cands, function (id) { return isFood(id) ? 3 : 1; });
      } else {
        pid = pick(cands);
      }
      // TEACHER QUALITY: does the teacher actually know the wild?
      var breadth = tKnown.length;
      var success = breadth >= 12 ? 0.95 : (breadth >= 5 ? 0.85 : 0.60);
      if (R() >= success) return { taught: false, failed: true }; // didn't land; chore line stays honest
      var landed = false;
      try { landed = this.villagerLearnsPlant ? this.villagerLearnsPlant(learnerVid, pid, 'taught') : false; } catch (e) {}
      if (!landed) return { taught: false };
      var day = 0;
      try { day = this.state.scholar.day; } catch (e) {}
      st.lessons[learnerVid] = st.lessons[learnerVid] || [];
      st.lessons[learnerVid].push({ from: teacherVid, topic: 'plants', pid: pid, day: day, need: need });
      try {
        var la = this.agencyOf(learnerVid);
        la.xp[learnerVid].tracking += (breadth >= 12 ? 2 : 1);
        this.agencyTierCheck(learnerVid, false);
      } catch (e) {}
      var pname = pid, pnameArt = pid;
      try { pname = this.plantDisplayName ? this.plantDisplayName(pid) : pid; } catch (e) {}
      // descriptors already carry their article ("a tree with...", "the giant
      // tree with...") — keep them as-is. (playtest deepening r18 2026-10-18,
      // #542 class: the old /^(a|an)/ check missed "the"-descriptors and
      // composed "the the giant tree...".)
      try { pnameArt = (/^(a|an|the)\s/i.test(pname)) ? pname : 'the ' + pname; } catch (e) {}
      // SENSE: firstRef, never split(' ')[0] — a stranger descriptor's first
      // word is bare "A" ("A taught A"), but firstRef gives the
      // distinguishing descriptor ("the woman in her 30s").
      var tnm = 'Someone', lnm = 'someone';
      try { tnm = this.firstRef ? this.firstRef(teacherVid) : this.displayName(teacherVid); } catch (e) {}
      try { lnm = this.firstRef ? this.firstRef(learnerVid) : this.displayName(learnerVid); } catch (e) {}
      var deedText = `${tnm} taught ${lnm} ${pnameArt}.`;
      if (need === 'wound') deedText = `${tnm} taught ${lnm} ${pnameArt} — for the wound, which leaves to press on it.`;
      else if (need === 'hunger') deedText = `${tnm} taught ${lnm} ${pnameArt} — where it grows, what's safe to eat.`;
      else if (need === 'novice') deedText = `${tnm} showed ${lnm} ${pnameArt} — leaf, stem, smell, the beginner's tour.`;
      try { this.recordDeed(teacherVid, 'taught', deedText, 1); } catch (e) {}
      return { taught: true, learner: learnerVid, plant: pid, plantName: pname, need: need };
    },
    // agencyMonsterLessonLine: per-monster field lessons (journey
    // establishment r6 2026-10-12). The old path spoke ONE generic template
    // for every species ("the tracks, the sound it makes before it moves,
    // where not to stand") — and agencyTeachMonster's narrator beat repeated
    // the same template, so a single teach doubled it, and five teaches were
    // five copies with a swapped name. Lessons now teach the monster's real
    // tell: the first sentence of its primary-attack telegraph (data), plus
    // when it hunts. Counter TRICKS stay knowledge-gated (discoverMonster-
    // Counter / the beasttricks topic — slain types only): a field lesson
    // teaches 'observed'-level knowledge — what it looks like right before
    // it moves, and when it's out. Deterministic per species (hashed by mid)
    // so the village's knowledge is consistent no matter who teaches it.
    agencyMonsterLessonLine(mid) {
      var mdef = null;
      try { mdef = (this.data.monsters || []).find(function (m) { return m.id === mid; }); } catch (e) {}
      var noun = 'something';
      try { noun = (this.monsterNoun && this.monsterNoun(mid)) || 'something'; } catch (e2) {}
      noun = String(noun);
      // PROSE DESCRIPTORS aren't noun phrases (union_rep's "a clipboard. a
      // bullhorn. a sense of grievance.", heckler's laughing-dark sentence):
      // a terminator with more text after it means the descriptor is a
      // sentence, not a name — the lesson falls back to 'something' rather
      // than mangling prose into grammar. monsterNoun already returns
      // 'something' for these; no monsterDisplayName fallback (its raw prose
      // is exactly what breaks composition).
      if (/[.!?…]\s*\S/.test(noun)) noun = 'something';
      var Name = noun.charAt(0).toUpperCase() + noun.slice(1);
      // sentence-safe tell: first sentence of the primary attack's telegraph
      var tell = null;
      try {
        var at = ((mdef && (mdef.attacks || [])) || [])[0] || (mdef && mdef.attack) || null;
        var tg = String((at && at.telegraph) || '').trim();
        if (tg) {
          tell = tg.split(/(?<=[.!?…])\s/)[0].trim();
          // union_rep's first "sentence" is an unterminated shout
          // ("'BROTHERS!") — drop a dangling leading quote so spoken
          // dialogue stays clean.
          var qn = (tell.match(/'/g) || []).length + (tell.match(/"/g) || []).length;
          if (qn % 2 === 1) tell = tell.replace(/^['"]/, '');
          // long tells (nevermore) get capped at a word boundary
          if (tell.length > 110) {
            var cut = tell.slice(0, 110);
            var sp = cut.lastIndexOf(' ');
            tell = (sp > 40 ? cut.slice(0, sp) : cut).replace(/[,.—–-]$/, '') + '…';
          }
          if (tell && !/[.!?…]$/.test(tell)) tell += '.';
        }
      } catch (e4) { tell = null; }
      var act = (mdef && mdef.activity) || '';
      var when = '';
      if (act === 'nocturnal') when = 'It hunts at night — give the dark a wide berth.';
      else if (act === 'diurnal') when = 'It hunts by day — watch the open ground.';
      else if (act === 'crepuscular') when = 'Dawn and dusk, that\'s when it\'s out.';
      var hh = 0, ms = String(mid);
      for (var i = 0; i < ms.length; i++) hh = (hh * 31 + ms.charCodeAt(i)) >>> 0;
      var tail = when || 'Give it room. That\'s the whole lesson.';
      var line = null;
      if (tell) {
        var tellCap = tell.charAt(0).toUpperCase() + tell.slice(1);
        var v = hh % 3;
        if (v === 0) line = `"${Name} — ${tell} ${tail}"`;
        // ARTICLE SAFETY (deepening r38 2026-10-23: "That's the The Union Rep
        // telling you" — monsterNoun keeps proper-cased System names as-is,
        // so blind "the "+noun doubles the article; same class as backlog
        // #542). articlePhrase normalizes: proper names stand bare,
        // lowercase descriptors keep "the ".
        else if (v === 1) line = `"${tellCap} That's ${(this.articlePhrase ? this.articlePhrase(noun) : 'the ' + noun)} telling you it's about to move. ${tail}"`;
        else line = `"Watch for this: ${tell} ${Name}, every time. ${tail}"`;
      }
      // FALLBACK (no telegraph data): the old generic template, honestly
      // framed as the teacher's own words, not data the village doesn't have.
      if (!line) line = `"The ${Name} — the tracks, the sound it makes before it moves, where not to stand. That's the one that matters. Ask me again sometime, there's more."`;
      return line;
    },
    // agencyTeachMonster: one fought species, taught honestly. Lands as
    // 'observed' (never downgrades 'slain') — the village-name gate opens
    // the way talk opens it. Returns the species id or null.
    agencyTeachMonster(vid) {
      var cands = this.agencyTeachableMonsters(vid);
      if (!cands.length) return null;
      var mid = pick(cands);
      var e = this.ensureMonsterEntry(mid);
      if (e.stage !== 'slain') e.stage = 'observed';
      var nm = '';
      try { nm = this.firstRef ? this.firstRef(vid) : this.displayName(vid); } catch (e) { nm = 'They'; } // firstRef: never bare "A" for stranger descriptors
      // FRAMING BEAT (journey establishment r6 2026-10-12): this used to
      // repeat the lesson's generic template verbatim ("the tracks, the
      // sound it makes before it moves, where not to stand") — the same
      // words the villager then speaks. The narrator now only frames the
      // moment and records the codex effect; the lesson itself is spoken
      // once, per-monster, by the teacher.
      var what = '';
      try { what = (this.monsterNoun && this.monsterNoun(mid)) || 'that thing'; } catch (err) { what = 'that thing'; }
      var art = /^[A-Z]/.test(what) ? '' : 'the ';
      this.say(`📖 ${nm} walks you through ${art}${what}. (Monster codex: observed.)`);
      return mid;
    },

    // ---------- 5. HIGH-POTENTIAL SEEDS ----------
    // A few villagers per game are talented, hardworking, clever — hidden.
    // Never displayed. Visible only through deeds. Given room, they become
    // someone. Watching it happen is the point.
    seedPotential(ids) {
      if (!ids || !ids.length) return;
      var kinds = ['talented', 'hardworking', 'clever'];
      var shuffled = ids.slice();
      for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(R() * (i + 1));
        var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
      }
      var n = Math.min(3, shuffled.length);
      var seeds = [];
      for (var k = 0; k < n; k++) seeds.push({ id: shuffled[k], kind: kinds[k % kinds.length] });
      this._pendingPotential = seeds;
    },
  };

  Object.assign(G, methods);

  // ============ WRAPS (chain-safe) ============
  (function attach() {
    // after the base away-system runs each day-part, run the agency sim
    var _nnt = G.npcNodeTravel;
    G.npcNodeTravel = function () {
      if (_nnt) _nnt.call(this);
      try { this.agencyTick(); } catch (e) {}
    };
    // plant the hidden seeds at roster generation
    var _genRoster = G.genRoster;
    G.genRoster = function (origin) {
      var chars = _genRoster ? _genRoster.call(this, origin) : [];
      try {
        var ids = (chars || []).map(function (c) { return c.id; }).filter(Boolean);
        this.seedPotential(ids);
      } catch (e) {}
      return chars;
    };
    // the mantle: deeds earn trust, so the village's choice of successor
    // naturally favors the explorer who became someone. Permanent, small,
    // honest — the village remembers what you did.
    var _pd = G.playerDeath;
    G.playerDeath = function (cause) {
      try {
        var v = this.state.village;
        v.trust = v.trust || {};
        var roster = v.roster || [];
        for (var i = 0; i < roster.length; i++) {
          var id = roster[i];
          if (id === this.villagerId) continue;
          var bonus = Math.min(12, Math.floor(this.agencyScore(id) / 4));
          if (bonus > 0) v.trust[id] = Math.min(100, (v.trust[id] || 0) + bonus);
        }
      } catch (e) {}
      return _pd ? _pd.call(this, cause) : undefined;
    };
    // conversation: ask about the wild
    var _convoChoices = G.convoChoices;
    G.convoChoices = function (vid) {
      var base = _convoChoices ? _convoChoices.call(this, vid) : [];
      try {
        // An ambush replaces the old exchange. A stale question's answer
        // budget must not trim RUN/TALK/FIGHT before the final focus filter.
        if (this.convoGet(vid).thread === 'ambush') return this.convoMenuPage(vid, this.betrayalChoices(vid));
        var extra = this.agencyChoices(vid) || [];
        // REACTIVE BUDGET (journey-establishment r16 2026-10-19): convoMenuPage
        // deliberately returns reactive (ans:/gq:) menus whole — the question's
        // answers are structural. But a hanging question plus live prepends blew
        // to 15 on an opening menu (seed 124-d13), breaking the non-negotiable
        // one-screen rule. So prepends compete for the answers+2 contract here:
        // answers survive, 'leave' stays pinned, 'silence' last. Non-reactive
        // overflow stays convoMenuPage's pagination ("More things to say").
        var isReactiveItem = function (ch) {
          var id = ch && ch.id;
          return typeof id === 'string' && (id.indexOf('ans:') === 0 || id.indexOf('gq:') === 0);
        };
        var isReactive = base.some(isReactiveItem);
        if (isReactive) {
          var reactiveCount = base.filter(isReactiveItem).length;
          var MAXC = reactiveCount + 2; // the answers+2 contract from buildMenu
          var trigger = reactiveCount + 4; // answers + leave + silence + 2
          if (extra.length || base.length > trigger) {
            var isSil = function (ch) { return ch && (ch.id === 'silence' || ch.id === 'nv:listen'); };
            var isLeave = function (ch) { return ch && ch.id === 'leave'; };
            var silence = base.filter(isSil).slice(0, 1);
            var leave = base.filter(isLeave).slice(0, 1);
            var content = base.filter(function (ch) { return !isSil(ch) && !isLeave(ch); });
            // TRIM PRIORITY (kill-rule scoping 2026-10-18): the first version
            // trimmed the raw tail and starved 'teach' from every menu on a
            // live-betrayal seed — the exact starvation the 2026-10-07/08/12
            // fixes rescued those verbs from. The trim now cuts the
            // expandable middle (pool reactions, recaps, topic asks) before
            // it touches leads and earned verbs. Priority: confrontation
            // prepends (betrayal:/confront:) > alive/event lead (r21) > want
            // verbs (the want leads) > earned verbs (teach/trade/skills/
            // invites — never lose the lottery) > pool + topics.
            var PROTECTED = /^(betrayal:|confront:|alive:|dlg:commit|dlg:cant|dlg:help|dlg:heed|dlg:stay|teach|trade|offer_help|hawker|invite_party|dlg:invite|skill_learn:|skill_teach:|agency:)/;
            var reactive = [], prot = [], rest = [];
            for (var i = 0; i < content.length; i++) {
              var cid = content[i] && content[i].id;
              if (isReactiveItem(content[i])) reactive.push(content[i]);
              else if (typeof cid === 'string' && PROTECTED.test(cid)) prot.push(content[i]);
              else rest.push(content[i]);
            }
            var room = Math.max(0, MAXC - extra.length - leave.length);
            var kept = reactive.concat(prot, rest).slice(0, room);
            return this.convoMenuPage(vid, extra.concat(kept, leave, silence));
          }
        }
        // Final budget after every injector (Steve 2026-10-19): keep overflow
        // reachable rather than permanently deleting lower-priority topics or
        // earned verbs.
        return this.convoMenuPage(vid, extra.concat(base));
      } catch (e) {}
      return base;
    };
    var _convoTurn = G.convoTurn;
    G.convoTurn = function (vid, choiceId) {
      if(choiceId==='menu:more') return this.convoNextMenu(vid);
      const menuConvo=this.convoGet(vid);menuConvo.menuPage=0;menuConvo.menuPages=1;
      const selectedWords = menuConvo.offeredReplies?.[choiceId];
      const priorEntries = new Set(menuConvo.transcript || []);
      try {
        try {
          if (typeof choiceId === 'string' && choiceId.indexOf('agency:') === 0) {
            var r = this.agencyTurn(vid, choiceId);
            if (r) return r;
          }
        } catch (e) { console.warn('[conversation] agency reply', e); }
        return _convoTurn ? _convoTurn.call(this, vid, choiceId) : undefined;
      } finally {
        // All handlers, including gesture, invitation and confrontation
        // shortcuts, record exactly the choice the player actually selected.
        if (selectedWords) {
          const spoken = (menuConvo.transcript || []).find(e => e.who === 'you' && !priorEntries.has(e));
          if (spoken) spoken.text = selectedWords;
        }
      }
    };
  })();
})();
