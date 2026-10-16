// @ontology
// system: villager-objectives
// description: Villager objective AI. Villagers pursue objectives instead of drifting randomly.
// provides:
//   - objState()
//   - objOf(vid)
//   - objPick(vid, hx, hy)
//   - objDanger(vid, tx, ty, hx, hy)
//   - objMaybeDepart(rid, node, atHaven, hx, hy)
//   - objAwayStep(rid, node, away, hx, hy)
//   - objAskCompanion(vid, obj, hx, hy)
//   - objTick()
//   - objHealGate(vid, obj, hx, hy, playerAtHaven)
// rules:
//   - objectives_drive_departures: npcNodeTravel's old dice triggers are replaced by objMaybeDepart (code: villager-objectives.js)
//   - night_departure_ban: nobody sets out at night, hard rule kept from base (code: villager-objectives.js)
//   - danger_gates_departure: every departure verdicts go / ask / tighten / defer via objDanger (code: villager-objectives.js)
//   - heal_gates_departure: objective departures get the expedition 70-HP heal check (pharmacy -> healer -> sit-out, one verdict/villager/day); LEAVE is exempt from the sit-out (code: villager-objectives.js, game.js, departure heal gate 2026-10-13)
//   - return_names_are_honest: objective-return copy names the found one via _repName — a stranger descriptor ("A person, maybe 40s") is used whole, never its first word ("found A" read broken). (code: villager-objectives.js, travel lever r4 2026-10-12)
//   - bark_armor_teach: a villager WEARING bark armor teaches the player its recipe L1 on return (trust 15+, player at haven, once per teacher) — the snare-lesson pattern for the occupation lottery's armor. (code: villager-objectives.js, 2026-10-13)
// consumes:
//   - village.roster, village.away, village.nodePos, village.gossip
//   - npcNode, npcSetNode, npcInside, npcSetInside, npcTemper, npcGoal, npcNeeds
//   - npcRangeProfile, npcMaxDist (villager-agency.js), agencyState
/* VILLAGER OBJECTIVES — src/js/villager-objectives.js
 *
 * Steve (2026-10-08): "people don't ever seem to leave haven. They shouldn't
 * just move randomly, they should pursue objectives."
 *
 * The old npcNodeTravel departure logic was four dice triggers (hungry→forage
 * 0.35, escape→leave 0.15, bold→explore 0.12, curious 0.04) — in a fed village
 * the hunger trigger rarely fires and most of the roster sits. While away,
 * movement was pure random drift. This module replaces the departure decision
 * with OBJECTIVES and gives away-movement a target plus meander:
 *
 * 1. OBJECTIVES — each villager holds one: FORAGE, WATER, TRAPS, VISIT,
 *    HAVEN_CHORE, EXPLORE, REST, EAT, LEAVE (escape). Re-picked at dawn and when
 *    idle. Outdoor kinds carry a target node and a tightness (max nodes out,
 *    max parts). Indoor kinds keep people home with real lives.
 * 2. DEPARTURE DANGER CHECK — before leaving: recent monster activity (from
 *    village gossip), rain, distance, temperament. GO / ASK (find a companion
 *    — both go, gossiped) / TIGHTEN (short nearby errand only) / DEFER (stay,
 *    take an indoor objective). Night never leaves (hard rule, kept).
 * 3. MOVEMENT WITH DRIFT — each part, step toward the target; 35% of the time
 *    step somewhere adjacent instead (meander → encounters). Co-location with
 *    another villager sometimes produces a seen-together beat.
 * 4. INDOOR vs OUTDOOR — indoor objectives (chores, rest, teach, socialize)
 *    hold villagers inside the hall; the objective generator still pushes
 *    people out because water/forage/traps can't be done inside.
 * 5. NOMADIC RANGE — npcRangeProfile/npcMaxDist (villager-agency.js): explorers
 *    range to 6 nodes, homebodies stay tight. The driven go farther (kept).
 * 6. HONESTY — departures/returns/asks are said (player present) and gossiped
 *    (departure). The base away/return machinery (pantry stocking on forage
 *    return, explorer news, escape) is preserved and extended, not replaced.
 *
 * Every part away costs hunger/energy through npcNeeds — the engine already
 * tracks it, this just charges it honestly.
 *
 * Self-attaching module. Load after villager-agency.js (uses npcRangeProfile,
 * npcMaxDist, agencyState; wraps npcNodeTravel after agencyTick).
 */
(function () {
  'use strict';
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  var R = Math.random;
  var pick = function (a) { return a[Math.floor(R() * a.length)]; };
  var clampN = function (n) { return Math.max(0, Math.min(8, n)); }; // 9x9 world

  // AMBIENT VOICE POOLS (2026-10-16, sim-findings #394): the single-template
  // indoor beats (REST / EAT / HAVEN_CHORE fire|repair|cook|sweep, the teach-
  // less "finds" beat, the VISIT beat) each get 4 verb-phrase renderings.
  // Variant 0 is always the original line verbatim. Steve's voice: plain,
  // specific, human, no purple prose. Knowledge-gating is untouched — the
  // call sites keep their playerAtHaven gates; only the wording rotates.
  var AMBIENT_BEATS = {
    rest: [
      function (nm) { return `😴 ${nm} is sleeping by the fire.`; },
      function (nm) { return `😴 ${nm} is out by the fire, wrapped tight in their blanket, breathing slow.`; },
      function (nm) { return `😴 ${nm} claimed the warm spot by the fire. Dead asleep.`; },
      function (nm) { return `😴 ${nm} is asleep sitting up against the woodpile, chin on their chest.`; },
    ],
    eat: [
      function (nm) { return `🍲 ${nm} is eating by the fire — not talking, just eating.`; },
      function (nm) { return `🍲 ${nm} is hunched over their bowl by the fire, eating like it matters.`; },
      function (nm) { return `🍲 ${nm} eats quiet by the fire, scraping the bowl clean with their thumb.`; },
      function (nm) { return `🍲 ${nm} has their bowl and their own thoughts. Neither one is being shared.`; },
    ],
    chore_fire: [
      function (nm) { return `${nm} is tending the fire, coaxing it steady.`; },
      function (nm) { return `${nm} is feeding the fire one stick at a time, watching the flame take.`; },
      function (nm) { return `${nm} is down by the firepit, nudging coals back into the middle.`; },
      function (nm) { return `${nm} is crouched over the embers, blowing soft, one hand blocking the draft.`; },
    ],
    chore_repair: [
      function (nm) { return `${nm} is mending something by the door — patient work.`; },
      function (nm) { return `${nm} is stitching a tear shut by the door light, squinting at every stitch.`; },
      function (nm) { return `${nm} is patching a seam with a scrap of cloth, knot after careful knot.`; },
      function (nm) { return `${nm} sits by the door re-lacing a strap, testing each pull before the next.`; },
    ],
    chore_cook: [
      function (nm) { return `${nm} is working the cookpot, tasting, adjusting.`; },
      function (nm) { return `${nm} is at the cookpot, tasting off the spoon, frowning, adding a pinch of something.`; },
      function (nm) { return `${nm} is stirring the pot slow, fishing out a bone to check the meat.`; },
      function (nm) { return `${nm} is over the cookpot, blowing on a spoonful before it goes back in.`; },
    ],
    chore_sweep: [
      function (nm) { return `${nm} is sweeping the hall. Someone has to.`; },
      function (nm) { return `${nm} is sweeping ash and grit out through the door, steady strokes.`; },
      function (nm) { return `${nm} is working the broom along the hall floor, slow and thorough.`; },
      function (nm) { return `${nm} is sweeping the corners out, muttering at the dust.`; },
    ],
    finds: [
      function (nm) { return `📖 ${nm} is going over their finds, re-tying the bundle.`; },
      function (nm) { return `📖 ${nm} is sorting their finds, setting each one in its place before the bundle gets tied.`; },
      function (nm) { return `📖 ${nm} has their finds spread out on a cloth, re-tying the bundle tighter.`; },
      function (nm) { return `📖 ${nm} is re-packing the bundle, checking each thing twice before it goes back in.`; },
    ],
    visit: [
      function (nm, t2) { return `💬 ${nm} is sitting with ${t2}, talking low. Not business. Just people.`; },
      function (nm, t2) { return `💬 ${nm} and ${t2} are hunched over the fire together, voices too low to catch.`; },
      function (nm, t2) { return `💬 ${nm} is with ${t2}, talking the way people do when nobody else is listening.`; },
      function (nm, t2) { return `💬 ${nm} has ${t2}'s ear — quiet talk, the kind that doesn't need an audience.`; },
    ],
    // mend: the sick-recovery line in game.js (sick tick). Variant 0 is the
    // original verbatim. The `of` slot keeps the knowledge gate: the true
    // disease name only when the village knows it, else 'the fever'.
    mend: [
      function (nm, of) { return `🤒 ${nm} is on the mend — ${of} broke.`; },
      function (nm, of) { return `🤒 ${nm} made it through the worst of it — ${of} finally broke.`; },
      function (nm, of) { return `🤒 ${nm} is sitting up again. Whatever ${of} was, it let go.`; },
      function (nm, of) { return `🤒 ${nm} is back on their feet — ${of} ran its course.`; },
    ],
  };

  var DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];

  var methods = {

    // ---------- AMBIENT VOICE ----------
    // ambientPick (2026-10-16, sim-findings #394): deterministic variant
    // rotation for the single-template indoor beats and the sick-recovery
    // line. A pure function of (villager id, key, day) via _hashStr — NEVER
    // R(): the ambient block draws RNG (findings #263/#264) and any
    // draw-count change shifts downstream sims and breaks the det-gate.
    ambientPick(vid, key, n) {
      var d = 0;
      try { d = (this.state.scholar || {}).day || 0; } catch (e) {}
      return this._hashStr(String(vid) + '|' + String(key) + '|' + d) % n;
    },
    // ambientBeats: the voice pools (module-scope AMBIENT_BEATS).
    ambientBeats() { return AMBIENT_BEATS; },
    // ambientLine: render one beat's current variant. Returns null for an
    // unknown key so the chore branch keeps its old "unknown chore = silent"
    // behavior. Never throws — voice must not break the tick. Call sites
    // null-guard before say (never print "null").
    ambientLine(key, vid, nm, arg) {
      var pool = null;
      try { pool = (this.ambientBeats() || {})[key]; } catch (e) {}
      if (!pool || !pool.length) return null;
      var i = 0;
      try { i = this.ambientPick(vid, key, pool.length); } catch (e) {}
      try { return pool[i](nm, arg); } catch (e) { return null; }
    },

    // ---------- STATE ----------
    objState() {
      var v = this.state.village;
      v.objectives = v.objectives || {};
      return v.objectives;
    },
    // objDist: trip distance in STEPS (chebyshev). The world moves
    // 8-directionally — a diagonal is one step, not two. Tightness, range,
    // and danger all speak steps.
    objDist(ax, ay, bx, by) {
      return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
    },
    objOf(vid) {
      var o = this.objState();
      if (!o[vid]) o[vid] = { kind: 'idle', state: 'idle' };
      return o[vid];
    },

    // ---------- 1. OBJECTIVE PICKING ----------
    // Called at dawn (dayPart 0) and whenever a villager is idle at haven.
    objPick(vid, hx, hy) {
      var o = this.objOf(vid);
      var v = this.state.village;
      var vp = {};
      try { vp = this.vpOf(vid) || {}; } catch (e) {}
      if (vp.dead) { o.kind = 'idle'; o.state = 'idle'; return o; }
      o.tightened = false; // fresh pick: not a danger-tightened trip
      o.chore = null; // fresh pick: a stale chore label must not linger on
      // non-chore objectives (longsim agency 2026-10-11: census showed
      // VISIT/out(fire), GUARD/out(teach) — old chore tags on new errands)
      var n = {};
      try { n = this.npcNeeds(vid); } catch (e) {}
      var goal = null;
      try { goal = this.npcGoal(vid); } catch (e) {}
      var temp = 'steady';
      try { temp = this.npcTemper(vid); } catch (e) {}
      var prof = 'forager';
      try { prof = this.npcRangeProfile(vid); } catch (e) {}
      var maxD = 1;
      try { maxD = Math.max(0, this.npcMaxDist(vid)); } catch (e) {}

      // the escape goal: they leave. Maybe for good. (kept from base)
      if (goal === 'escape') {
        o.kind = 'LEAVE'; o.purpose = 'leave'; o.state = 'ready';
        // they walk AWAY — a far node, not the haven doorstep. Duration 999:
        // the base return clock never brings them home.
        var ld = pick(DIRS8), ldist = 4 + Math.floor(R() * 3);
        o.tx = clampN(hx + ld[0] * ldist); o.ty = clampN(hy + ld[1] * ldist);
        o.tightness = 8; o.partsLeft = 999;
        o.indoor = false; o.targetVid = null; o.companion = null;
        return o;
      }
      // body first: rest when spent
      if ((n.energy || 70) < 35) {
        o.kind = 'REST'; o.purpose = 'rest'; o.state = 'indoor';
        o.indoor = true; o.targetVid = null; o.companion = null;
        o.partsLeft = 2 + Math.floor(R() * 3);
        return o;
      }
      var pantry = 0;
      try { pantry = this.pantryKcalLive(v); } catch (e) {}
      // EAT — hungry and the pantry has food: go eat. Indoor, at the fire.
      // (meals-like-people 2026-10-08: hunger is a real need now, driven by
      // real individual meals in villageEats — the EAT objective is the
      // visible behavior: they go to the hall and eat, like people.)
      if ((n.hunger || 0) > 55 && pantry > 500) {
        o.kind = 'EAT'; o.purpose = 'eat'; o.state = 'indoor';
        o.indoor = true; o.targetVid = null; o.companion = null;
        o.partsLeft = 1 + Math.floor(R() * 2);
        return o;
      }
      // THEY WANT TO WIN (parity 2026-10-14, Steve: "villagers need to act
      // in smart ways, including towards getting good gear and builds. They
      // want to win as well." / "they need to seek knowledge about the
      // abilities and go for a build that suits their technology"). A
      // level-up waiting on what they know comes first: they go and ask
      // someone who holds or knows abilities (villager-build.js).
      var wantKnow = null;
      try { wantKnow = this.villagerWantsKnowledge ? this.villagerWantsKnowledge(vid) : null; } catch (e) { console.warn('[objectives] wantKnow', e); }
      if (wantKnow === 'sheet' || (wantKnow === 'build' && R() < 0.5)) {
        var sought = null;
        try { sought = this.villagerSeekKnowledge(vid); } catch (e) { console.warn('[objectives] seek', e); }
        if (sought) {
          o.kind = 'SEEK'; o.purpose = 'seek'; o.state = 'indoor'; o.indoor = true;
          o.targetVid = (sought.teacher && sought.teacher !== 'player' && sought.teacher !== 'system') ? sought.teacher : null;
          o.companion = null; o.tx = hx; o.ty = hy; o.tightness = 0;
          o.partsLeft = 2;
          return o;
        }
      }
      // the deeds their build needs: the track whose next level-up brings
      // the ability they're building toward weights the matching errand.
      var needTrack = null;
      try { needTrack = this.villagerNeedTrack ? this.villagerNeedTrack(vid) : null; } catch (e) { console.warn('[objectives] needTrack', e); }
      var water = 99;
      try { water = ((v.water || {}).clean == null) ? 99 : v.water.clean; } catch (e) {}
      var cands = [];
      if (needTrack === 'field' && maxD > 0) cands.push({ kind: 'FORAGE', w: 1.5 });
      if (needTrack === 'social') cands.push({ kind: 'HAVEN_CHORE', w: 1.2, chore: 'teach' });
      if ((needTrack === 'combat' || needTrack === 'strange') && (prof === 'wanderer' || prof === 'explorer')) cands.push({ kind: 'EXPLORE', w: 1.5 });
      // FORAGE — the village eats, or they do. Homebodies only go when hungry.
      // GOAL r7 (2026-10-12): the 'feed' goal lives here now — "Nobody goes
      // hungry if I can help it. That's the whole thing." They feel the
      // pantry dip before anyone else (forage gate at 6000 kcal, not 4000)
      // and they go out first when food runs short (+1.5 weight). Measured
      // 12x200d before: 'feed' foraged at the population rate (14.9% obj
      // share vs 35.7% for 'belong' — noise) — the goal was a label.
      var feedDrive = (goal === 'feed');
      if (pantry < 4000 || (n.hunger || 0) > 50 || (feedDrive && pantry < 6000)) {
        var w = pantry < 2000 ? 4 : pantry < 4000 ? 2.5 : 1.5;
        if (feedDrive) w += 1.5;
        if (prof === 'homebody' && pantry >= 2000 && (n.hunger || 0) <= 60) w = 0;
        if (w > 0) cands.push({ kind: 'FORAGE', w: w });
      }
      // WATER — the well runs dry; someone has to walk.
      if (water < 3) cands.push({ kind: 'WATER', w: 3.5 });
      // TRAPS — only hands that know the wire. (knowledge-gated)
      if (vp.knowsSnare) cands.push({ kind: 'TRAPS', w: 1.6 });
      // HAUL — map memory (villager-mapmem 2026-10-13): a remembered corpse
      // with known-safe meat, when the village needs food. Objectives that
      // carry past whatever node they're on — kills as resources.
      var haulSite = null;
      try { haulSite = this.mapmemBestHaul ? this.mapmemBestHaul(vid, hx, hy) : null; } catch (e) {}
      if (haulSite && (pantry < 5000 || (n.hunger || 0) > 50)) {
        cands.push({ kind: 'HAUL', w: 1 + Math.min(3, haulSite.estKcal / 2000), site: haulSite });
      }
      // VISIT — go find someone specific. Social, uses real familiarity.
      // Tight goals: don't cross the world for a chat — the target must be
      // within this villager's range (homebodies visit at home, not abroad).
      var visitT = this.objVisitTarget(vid);
      if (visitT) {
        var vtn = null;
        try { vtn = this.npcNode(visitT); } catch (e) {}
        var vdist = vtn ? this.objDist(vtn.nx, vtn.ny, hx, hy) : 0;
        if (vdist > Math.max(1, maxD)) visitT = null;
      }
      if (visitT) cands.push({ kind: 'VISIT', w: 1.2 + ((n.social || 40) > 60 ? 0.8 : 0), targetVid: visitT });
      // EXPLORE — nomads only.
      if ((prof === 'wanderer' || prof === 'explorer') && R() < 0.5) cands.push({ kind: 'EXPLORE', w: prof === 'explorer' ? 2 : 1.2 });
      // HAVEN_CHORE — indoor life. Always available; homebodies lean here.
      cands.push({ kind: 'HAVEN_CHORE', w: prof === 'homebody' ? 3 : 1.4 });
      var tot = 0, i;
      for (i = 0; i < cands.length; i++) tot += cands[i].w;
      var r = R() * tot, chosen = cands[cands.length - 1];
      for (i = 0; i < cands.length; i++) { r -= cands[i].w; if (r <= 0) { chosen = cands[i]; break; } }

      o.kind = chosen.kind; o.targetVid = chosen.targetVid || null;
      o.companion = null; o.indoor = false; o.state = 'ready';
      var dist = 1;
      if (chosen.kind === 'FORAGE') {
        o.purpose = 'forage'; dist = Math.max(1, Math.min(maxD, 1 + Math.floor(R() * 2)));
        o.partsLeft = 2 + Math.floor(R() * 3); o.tightness = dist;
      } else if (chosen.kind === 'WATER') {
        o.purpose = 'water'; dist = Math.min(1 + Math.floor(R() * 2), Math.max(1, maxD));
        o.partsLeft = 2 + Math.floor(R() * 2); o.tightness = dist;
      } else if (chosen.kind === 'TRAPS') {
        o.purpose = 'traps'; dist = Math.min(1 + Math.floor(R() * 2), Math.max(1, maxD));
        o.partsLeft = 2 + Math.floor(R() * 2); o.tightness = dist;
      } else if (chosen.kind === 'VISIT') {
        o.purpose = 'visit'; o.partsLeft = 3 + Math.floor(R() * 3);
        var tn = null;
        try { tn = this.npcNode(chosen.targetVid); } catch (e) {}
        if (tn && (tn.nx !== hx || tn.ny !== hy)) {
          // they're out there — go find them
          o.tx = tn.nx; o.ty = tn.ny;
          o.tightness = Math.abs(tn.nx - hx) + Math.abs(tn.ny - hy);
        } else {
          // they're home — this is an indoor social call
          o.indoor = true; o.state = 'indoor'; o.tx = hx; o.ty = hy;
          o.partsLeft = 2; o.tightness = 0;
          return o;
        }
      } else if (chosen.kind === 'EXPLORE') {
        o.purpose = 'explore'; dist = 1 + Math.floor(R() * Math.max(1, maxD));
        o.partsLeft = 3 + Math.floor(R() * 4); o.tightness = dist;
      } else if (chosen.kind === 'HAUL') {
        // HAUL: go back for the remembered carcass. The target is a real
        // remembered node, not a random direction — this is the cross-node
        // objective. They tell the hall where they're going (gossip spread:
        // listeners gain the memory secondhand).
        var hs = chosen.site;
        o.purpose = 'haul'; o.state = 'ready'; o.indoor = false;
        o.tx = hs.nx; o.ty = hs.ny;
        o.targetRef = hs.ref; o.haulLabel = hs.label; o.haulSite = hs;
        var hdist = this.objDist(hx, hy, hs.nx, hs.ny);
        o.tightness = Math.max(1, hdist);
        o.partsLeft = 2 * hdist + 3;
        o.targetVid = null; o.companion = null;
        try {
          var _mates = (v.roster || []).filter(function (id) {
            if (id === vid) return false;
            try { var _self = this.villagerId; if (id === _self) return false; } catch (e) {}
            try { var nd = this.npcNode(id); return !!(nd && nd.nx === hx && nd.ny === hy); }
            catch (e) { return false; }
          }, this);
          for (var _ti = 0; _ti < Math.min(2, _mates.length); _ti++) {
            try { this.mapmemTell(vid, _mates[_ti]); } catch (e) {}
          }
        } catch (e) {}
        return o;
      } else { // HAVEN_CHORE
        o.purpose = 'chore'; o.indoor = true; o.state = 'indoor';
        o.tx = hx; o.ty = hy; o.tightness = 0;
        o.partsLeft = 2 + Math.floor(R() * 3);
        // LONGSIM agency r2 (2026-10-11): 'teach' is only an honest chore
        // when the villager actually knows a plant (the identity system —
        // plantsKnownBy) — the old pool let anyone claim teaching with
        // nothing behind it (theater: trust bumps and a deed for nothing
        // transferred).
        var chores = ['fire', 'repair', 'cook', 'sweep'];
        try {
          var _pk = this.plantsKnownBy ? this.plantsKnownBy(vid) : [];
          // SNARE APPRENTICESHIP (trapline 2026-10-13): a wire-knowing
          // villager can teach even with no plants to show — the lesson is
          // the snare, not the flora.
          var _ks = false;
          try { _ks = !!(this.vpOf && this.vpOf(vid) && this.vpOf(vid).knowsSnare); } catch (e) {}
          if (_pk.length || _ks) chores.push('teach');
        } catch (e) {}
        o.chore = (chosen.chore && chores.indexOf(chosen.chore) >= 0) ? chosen.chore : pick(chores);
        return o;
      }
      // outdoor target: a real direction, clamped to the 9x9 world
      var d = pick(DIRS8);
      o.tx = clampN(hx + d[0] * dist);
      o.ty = clampN(hy + d[1] * dist);
      if (o.tx === hx && o.ty === hy) { o.tx = clampN(hx + 1); }
      // APEXROUTE (2026-10-16): the village remembers where apexes were
      // seen. Reroute the errand to cold ground at the same distance when
      // the pantry holds — the mission continues, around the hot ground.
      // Hungry villages walk straight (food missions win); no cold way →
      // keep the original (routing never strands). Tightness is a radius,
      // so a same-distance new direction keeps the leash honest.
      try {
        if (this.apexRouteOn && this.apexRouteOn() && this.apexPantryOk() &&
            (o.purpose === 'forage' || o.purpose === 'water' || o.purpose === 'traps' || o.purpose === 'explore') &&
            this.apexPathHeat(hx, hy, o.tx, o.ty) > 0) {
          var _cd = Math.max(Math.abs(o.tx - hx), Math.abs(o.ty - hy));
          var _nd = this.apexColdDir(hx, hy, _cd);
          if (_nd) {
            o.tx = clampN(hx + _nd[0] * _cd); o.ty = clampN(hy + _nd[1] * _cd);
            if (o.tx === hx && o.ty === hy) { o.tx = clampN(hx + 1); }
            var _as = this.state.village.apexStats || (this.state.village.apexStats = {});
            _as.reroute = (_as.reroute | 0) + 1;
          }
        }
      } catch (e) {}
      return o;
    },
    // VISIT target: someone they actually know — same fire-group, or someone
    // the village trusts (familiar face), or someone away worth checking on.
    objVisitTarget(vid) {
      var v = this.state.village;
      var roster = (v.roster || []).filter(function (id) {
        if (id === vid) return false;
        try { var vp = this.vpOf(id); if (vp && vp.dead) return false; } catch (e) {}
        try { if (this.isEngaged(id)) return false; } catch (e) {}
        return true;
      }, this);
      if (!roster.length) return null;
      var mates = {};
      try {
        for (var gi = 0; gi < (v.groups || []).length; gi++) {
          var gr = v.groups[gi];
          if (gr.members && gr.members.indexOf(vid) !== -1) {
            for (var mi = 0; mi < gr.members.length; mi++) mates[gr.members[mi]] = true;
          }
        }
      } catch (e) {}
      var scored = [];
      for (var i = 0; i < roster.length; i++) {
        var id = roster[i], s = 0;
        if (mates[id]) s += 3;
        var tr = 0;
        try { tr = (v.trust || {})[id] || 0; } catch (e) {}
        if (tr > 40) s += 2; else if (tr > 20) s += 1;
        var away = null;
        try { away = (v.away || {})[id]; } catch (e) {}
        if (away) s += 2; // checking on someone out there is a real errand
        if (s > 0) scored.push({ id: id, s: s });
      }
      if (!scored.length) return null;
      scored.sort(function (a, b) { return b.s - a.s; });
      return scored[0].id;
    },

    // ---------- 2. DEPARTURE DANGER CHECK ----------
    // Before leaving: read the world. Recent monster activity comes from
    // village gossip (attack/death/murder within 3 days). Rain makes it
    // miserable. Distance and temperament move the needle.
    // Verdicts: go / ask (bring someone) / tighten (short errand only) / defer (stay).
    objDanger(vid, tx, ty, hx, hy) {
      var score = 0;
      var day = 0;
      try { day = this.state.scholar.day; } catch (e) {}
      try {
        var g = (this.state.village.gossip || []);
        for (var i = 0; i < g.length; i++) {
          var a = g[i].action;
          if ((a === 'attack' || a === 'murder') && day - (g[i].day || 0) <= 3) score += 2;
          else if (a === 'death' && day - (g[i].day || 0) <= 3) score += 1;
        }
        if (score > 4) score = 4;
      } catch (e) {}
      try { if (this.state.weather === 'rain') score += 1; } catch (e) {}
      var dist = this.objDist(tx, ty, hx, hy);
      var maxD = 1;
      try { maxD = Math.max(1, this.npcMaxDist(vid)); } catch (e) {}
      if (dist > maxD) score += 2;
      else if (dist > Math.ceil(maxD * 0.66)) score += 1;
      var temp = 'steady';
      try { temp = this.npcTemper(vid); } catch (e) {}
      if (temp === 'cautious' || temp === 'withdrawn') score += 1;
      if (temp === 'bold' || temp === 'restless') score -= 1;
      try { if (this.npcGoal(vid) === 'escape') score -= 2; } catch (e) {} // the desperate don't count danger
      // APEXROUTE (2026-10-16): fresh apex sightings on the walk add danger —
      // the village gives known-hot ground room when the pantry holds. Weight
      // follows the predator census (eater 3 > reunion 2 > others 1, capped).
      try {
        if (this.apexRouteOn && this.apexRouteOn() && this.apexPantryOk()) {
          var _ah = this.apexPathHeat(hx, hy, tx, ty);
          if (_ah > 0) {
            score += Math.min(3, _ah);
            var _as2 = this.state.village.apexStats || (this.state.village.apexStats = {});
            _as2.heat = (_as2.heat | 0) + 1;
          }
        }
      } catch (e) {}
      if (score < 0) score = 0;
      var verdict = score <= 1 ? 'go' : score <= 3 ? 'ask' : score <= 5 ? 'tighten' : 'defer';
      return { score: score, verdict: verdict };
    },
    // objVillageDanger: the world-level part of the danger check (gossip +
    // weather, no distance). Used to gate expedition launches too.
    objVillageDanger() {
      var score = 0;
      var day = 0;
      try { day = this.state.scholar.day; } catch (e) {}
      try {
        var g = (this.state.village.gossip || []);
        for (var i = 0; i < g.length; i++) {
          var a = g[i].action;
          if ((a === 'attack' || a === 'murder') && day - (g[i].day || 0) <= 3) score += 2;
          else if (a === 'death' && day - (g[i].day || 0) <= 3) score += 1;
        }
        if (score > 4) score = 4;
      } catch (e) {}
      try { if (this.state.weather === 'rain') score += 1; } catch (e) {}
      return score;
    },
    // ASK: find someone to walk with. A companion with their own outdoor
    // errand is ideal; otherwise the willing (bold, warm, trusting, sociable).
    // Both are marked away together, and the village hears about it.
    objAskCompanion(vid, obj, hx, hy) {
      var v = this.state.village;
      var roster = v.roster || [];
      var tripDist = this.objDist(obj.tx, obj.ty, hx, hy);
      var cands = [];
      for (var i = 0; i < roster.length; i++) {
        var id = roster[i];
        if (id === vid || id === this.villagerId) continue;
        var vp = null;
        try { vp = this.vpOf(id); } catch (e) {}
        if (vp && vp.dead) continue;
        try { if (this.isEngaged(id)) continue; } catch (e) {}
        try { if ((v.away || {})[id]) continue; } catch (e) {}
        var node = null;
        try { node = this.npcNode(id); } catch (e) { continue; }
        if (!node || node.nx !== hx || node.ny !== hy) continue;
        // tight goals: the companion must actually be willing to walk that far
        var cmax = 1;
        try { cmax = Math.max(1, this.npcMaxDist(id)); } catch (e) {}
        if (tripDist > cmax) continue;
        var co = this.objOf(id);
        var s = 0;
        if (co && !co.indoor && co.state === 'ready' && co.kind !== 'LEAVE') s += 4; // their own errand — natural pair
        var t = 'steady';
        try { t = this.npcTemper(id); } catch (e) {}
        if (t === 'bold' || t === 'warm') s += 2;
        var tr = 0;
        try { tr = (v.trust || {})[id] || 0; } catch (e) {}
        if (tr > 40) s += 1;
        var nn = null;
        try { nn = this.npcNeeds(id); } catch (e) {}
        if (nn && (nn.social || 0) > 65) s += 1;
        if (s > 0) cands.push({ id: id, s: s });
      }
      if (!cands.length) return null;
      cands.sort(function (a, b) { return b.s - a.s; });
      var cid = cands[0].id;
      // the companion walks with them: same target, same clock, purpose 'guard'
      var co2 = this.objOf(cid);
      co2.kind = 'GUARD'; co2.purpose = 'guard'; co2.state = 'ready';
      co2.tx = obj.tx; co2.ty = obj.ty; co2.targetVid = vid;
      co2.tightness = obj.tightness; co2.partsLeft = obj.partsLeft;
      co2.indoor = false; co2.companion = vid;
      obj.companion = cid;
      return cid;
    },
    // HEAL GATE (departure heal gate, lever 2026-10-13): objective
    // departures get the expedition 70-HP heal check (villagerHealCheck in
    // game.js: pharmacy -> healer -> sit-out). A hurt villager is patched
    // before ranging out; with no help at hand they rest at haven for the
    // day instead of walking out at 22 HP (r16 arm C census: 22/27 wave-1
    // NPC monster deaths were non-expedition purposes, median entry hp 22).
    // One verdict per villager per day (hurtGate): a patched villager isn't
    // re-healed on a second departure, and a sat-out one isn't re-narrated.
    // LEAVE is exempt from the sit-out — the desperate still walk out,
    // patched first when help is at hand. Returns true when cleared.
    objHealGate(vid, obj, hx, hy, playerAtHaven) {
      var v = this.state.village || {};
      var today = 0;
      try { today = (this.state.scholar || {}).day || 0; } catch (e) {}
      v.hurtGate = v.hurtGate || {};
      var g = v.hurtGate[vid];
      if (g && g.day === today) return !g.satOut; // already verdicts today — silent
      if (!this.villagerHealCheck) return true;
      var nm = 'Someone';
      try { nm = this.displayName(vid).split(' ')[0]; } catch (e) {}
      var sat = false;
      try { sat = !!this.villagerHealCheck(vid, nm, { noSitOut: !!(obj && obj.kind === 'LEAVE') }); } catch (e) {}
      v.hurtGate[vid] = { day: today, satOut: sat };
      return !sat;
    },
    objDepart(vid, obj, hx, hy, playerAtHaven) {
      // HEAL GATE (2026-10-13): hurt villagers are patched or sat out
      // (objHealGate) BEFORE the move. Returns true when they departed.
      try {
        if (this.objHealGate && !this.objHealGate(vid, obj, hx, hy, playerAtHaven)) return false;
      } catch (e) {}
      var v = this.state.village;
      var s = this.state.scholar;
      var node = null;
      try { node = this.npcNode(vid); } catch (e) { return; }
      this.npcSetNode(vid, obj.tx, obj.ty);
      try { this.npcSetInside(vid, false); } catch (e) {}
      v.away = v.away || {};
      v.away[vid] = {
        nx: obj.tx, ny: obj.ty, purpose: obj.purpose,
        sinceDay: s.day, sincePart: this.dayPart, duration: obj.partsLeft,
      };
      obj.state = 'out';
      var nm = 'Someone';
      try { nm = this.displayName(vid); } catch (e) {}
      var purposeLine = {
        forage: 'heads out to forage. "Back before dark. Probably."',
        water: 'heads out for water. "The well won\'t fill itself."',
        traps: 'heads out to check the snares. "Wire doesn\'t lie."',
        visit: 'sets out to find ' + (function () { try { return this.displayName(obj.targetVid); } catch (e) { return 'someone'; } }.call(this)) + '. "Won\'t be long."',
        explore: 'wanders off. "I want to see what\'s out there."',
        leave: 'walks away from Haven. They don\'t look back.',
        guard: 'walks out with ' + (function () { try { return this.displayName(obj.targetVid); } catch (e) { return 'someone'; } }.call(this)) + '. "Nobody walks alone today."',
        haul: 'sets out for the ' + (obj.haulLabel || 'carcass') + '. "Meat\'s meat. Back with it or not at all."',
      }[obj.purpose] || 'heads out.';
      if (playerAtHaven) this.say((obj.companion ? '👥 ' : '') + nm + ' ' + purposeLine);
      // leaving is gossip-worthy. Two witnesses so the rumor can travel.
      try {
        var seen = (v.roster || []).filter(function (id) { return id !== vid && id !== this.villagerId; }, this);
        var shuf = seen.slice();
        for (var i = shuf.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = shuf[i]; shuf[i] = shuf[j]; shuf[j] = t; }
        var dims = { who: vid };
        if (obj.companion) dims.with = obj.companion;
        this.seedGossip('departure', dims, shuf.slice(0, 2));
      } catch (e) {}
      return true;
    },

    // ---------- 3. THE DEPARTURE DECISION (replaces the dice triggers) ----------
    // Called from npcNodeTravel for each villager at haven, once per day-part.
    objMaybeDepart(rid, node, atHaven, hx, hy) {
      if (!atHaven) return;
      var v = this.state.village;
      // expeditions (agency) own their departures; don't double-book
      try {
        var ast = this.agencyState();
        if (ast.exped && ast.exped[rid]) return;
      } catch (e) {}
      if ((v.away || {})[rid]) return;
      try { if (this.isEngaged(rid)) return; } catch (e) {}
      // SICK: the feverish stay home (parity 2026-10-08 — villagers get sick now)
      try { if ((v.sick || {})[rid]) return; } catch (e) {}
      // HEAL GATE (departure heal gate, 2026-10-13): a villager who sat out
      // hurt rests at haven the rest of the day instead of re-rolling
      // departures every day-part. The +2/day passive still heals them.
      try {
        var _hg = ((this.state.village || {}).hurtGate || {})[rid];
        if (_hg && _hg.day === ((this.state.scholar || {}).day || 0) && _hg.satOut) return;
      } catch (e) {}
      var o = this.objOf(rid);
      // idle or done → pick fresh (dawn re-pick happens in objTick, but a
      // villager can finish mid-day and should decide again, not sit)
      if (!o.kind || o.kind === 'idle' || o.state === 'done' || o.state === 'indoor') {
        // indoor objectives are handled by objTick; nothing to depart for
        if (o.state === 'indoor') return;
        this.objPick(rid, hx, hy);
        o = this.objOf(rid);
        if (!o.kind || o.kind === 'idle' || o.indoor || o.state === 'indoor') return;
      }
      if (o.state === 'out' || o.indoor) return;
      if (o.state !== 'ready') return;
      var playerAtHaven = false;
      try { playerAtHaven = (this.map.px === hx && this.map.py === hy); } catch (e) {}
      // escape: the desperate don't do danger checks
      if (o.kind === 'LEAVE') { this.objDepart(rid, o, hx, hy, playerAtHaven); return; }
      var dg = this.objDanger(rid, o.tx, o.ty, hx, hy);
      if (dg.verdict === 'go') {
        this.objDepart(rid, o, hx, hy, playerAtHaven);
      } else if (dg.verdict === 'ask') {
        var cid = this.objAskCompanion(rid, o, hx, hy);
        if (cid) {
          // HEAL GATE (2026-10-13): gate rid first — a sat-out rid must not
          // strand a departed companion. Companion sat out -> rid tightens
          // or defers, same as the no-companion case. (rid sat out: rests.)
          var co = this.objOf(cid);
          var ridOk = this.objHealGate(rid, o, hx, hy, playerAtHaven);
          var cidOk = ridOk && this.objHealGate(cid, co, hx, hy, playerAtHaven);
          if (ridOk && cidOk) {
            this.objDepart(rid, o, hx, hy, playerAtHaven);
            // the companion walks out with them, same part
            this.objDepart(cid, co, hx, hy, playerAtHaven);
            // TRUST LEDGER (journey landing r12 2026-10-13): reason attributed.
            try { this.bumpTrust(rid, 1, 'they walk out with me'); this.bumpTrust(cid, 1, 'heading out together'); } catch (e) {}
          } else if (ridOk) {
            // rid is fit but the companion sat out hurt -> rid tightens or
            // defers, same as the no-companion case
            this.objTightenOrDefer(rid, o, hx, hy, playerAtHaven);
          }
        } else {
          // nobody to walk with → tighten or stay
          this.objTightenOrDefer(rid, o, hx, hy, playerAtHaven);
        }
      } else if (dg.verdict === 'tighten') {
        this.objTightenOrDefer(rid, o, hx, hy, playerAtHaven);
      } else {
        // defer: stay home, take indoor work instead
        o.kind = 'HAVEN_CHORE'; o.purpose = 'chore'; o.indoor = true; o.state = 'indoor';
        o.tx = hx; o.ty = hy; o.tightness = 0; o.partsLeft = 2 + Math.floor(R() * 2);
        o.chore = pick(['fire', 'repair', 'sweep', 'cook']);
        o.targetVid = null; o.companion = null;
      }
    },
    objTightenOrDefer(rid, o, hx, hy, playerAtHaven) {
      // TIGHTEN: only accept a short nearby errand. FORAGE/WATER/TRAPS can
      // shrink to 1 node and a short clock; EXPLORE and far VISITs defer.
      var ok = (o.kind === 'FORAGE' || o.kind === 'WATER' || o.kind === 'TRAPS');
      if (ok) {
        // orthogonal only: a tightened trip is EXACTLY 1 node out, never a
        // diagonal 2. (DIRS8 diagonals would break the promise.)
        var d = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        o.tx = clampN(hx + d[0]); o.ty = clampN(hy + d[1]);
        if (o.tx === hx && o.ty === hy) o.tx = clampN(hx + 1);
        o.tightness = 1; o.partsLeft = Math.min(o.partsLeft, 2);
        o.state = 'ready'; o.tightened = true; // short leash: no meandering out
        this.objDepart(rid, o, hx, hy, playerAtHaven);
      } else {
        o.kind = 'HAVEN_CHORE'; o.purpose = 'chore'; o.indoor = true; o.state = 'indoor';
        o.tx = hx; o.ty = hy; o.tightness = 0; o.partsLeft = 2 + Math.floor(R() * 2);
        o.chore = pick(['fire', 'repair', 'sweep', 'cook']);
        o.targetVid = null; o.companion = null;
      }
    },

    // ---------- 4. AWAY MOVEMENT: pursue, meander, cost ----------
    // Called from npcNodeTravel for each away villager, once per day-part.
    // Replaces the old pure-random drift: step toward the objective target,
    // but 35% of the time step somewhere adjacent instead — they meander,
    // run into people, get seen. Every part out costs hunger and energy.
    objAwayStep(rid, node, away, hx, hy) {
      // agency expeditions move themselves
      try {
        var ast = this.agencyState();
        if (ast.exped && ast.exped[rid]) return;
      } catch (e) {}
      var o = this.objOf(rid);
      var tx = (o && o.state === 'out' && o.tx != null) ? o.tx : away.nx;
      var ty = (o && o.state === 'out' && o.ty != null) ? o.ty : away.ny;
      var returning = !o || o.state !== 'out';
      if (returning) { tx = hx; ty = hy; } // objective done or lost: head home; the base return clock brings them in
      var nx = node.nx, ny = node.ny;
      var leashed = !!(o && o.tightened); // danger-tightened: short leash, no meander
      var ox = nx, oy = ny; // pre-step position (for the tightness guard)
      if (nx !== tx || ny !== ty) {
        if (!leashed && R() < 0.35) {
          // meander: a step somewhere adjacent
          var dx = Math.floor(R() * 3) - 1, dy = Math.floor(R() * 3) - 1;
          if (dx || dy) { nx = clampN(nx + dx); ny = clampN(ny + dy); }
        } else {
          // pursue: one step toward the target
          nx = clampN(nx + Math.sign(tx - nx));
          ny = clampN(ny + Math.sign(ty - ny));
        }
      } else if (!returning && !leashed && o && o.partsLeft > 1 && R() < 0.5) {
        // AT THE SITE, clock still running: work the area instead of standing
        // still — forage the patch, check around the snares. Stays near the
        // target; the pursue logic pulls them back if they drift.
        var mdx = Math.floor(R() * 3) - 1, mdy = Math.floor(R() * 3) - 1;
        if (mdx || mdy) {
          var mx = clampN(nx + mdx), my = clampN(ny + mdy);
          if (Math.abs(mx - tx) + Math.abs(my - ty) <= 2) { nx = mx; ny = my; }
        }
      }
      // TIGHTNESS IS A TRIP RADIUS: no step (meander or area-work) may take
      // them farther from haven than the objective allows. Homebodies stay
      // home; tightened trips stay tight. The walk home is always allowed.
      if (!returning && o && o.tightness != null) {
        if (this.objDist(nx, ny, hx, hy) > o.tightness) { nx = ox; ny = oy; }
      }
      if (nx !== ox || ny !== oy) this.npcSetNode(rid, nx, ny);
      // the walk costs: hunger up, energy down (npcNeeds is the engine's ledger)
      try {
        var nn = this.npcNeeds(rid);
        nn.hunger = Math.min(100, (nn.hunger || 0) + 3);
        nn.energy = Math.max(0, (nn.energy || 70) - 4);
      } catch (e) {}
      if (o && o.partsLeft != null) o.partsLeft--;
      // arrived at a VISIT target: the visit happens
      if (o && o.state === 'out' && o.kind === 'VISIT' && o.targetVid) {
        var tn = null;
        try { tn = this.npcNode(o.targetVid); } catch (e) {}
        if (tn && tn.nx === nx && tn.ny === ny) {
          try {
            // TRUST LEDGER (journey landing r12 2026-10-13): reasons are the
            // trust ledger's only attribution — reasonless bumps were 31% of
            // week-1 trust events with no explanation.
            this.bumpTrust(rid, 2, 'walked out to visit them'); this.bumpTrust(o.targetVid, 2, 'they came all this way to visit');
            var v = this.state.village;
            v.objectives[o.targetVid] = v.objectives[o.targetVid] || { kind: 'idle', state: 'idle' };
            this.seedGossip('deed', { generous: 2, who: rid }, [o.targetVid]);
          } catch (e) {}
          o.state = 'returning';
        }
      }
      // HAUL arrival (villager-mapmem 2026-10-13): at the remembered node —
      // butcher the carcass. mapmemHaulAt narrates honestly and flips the
      // objective to returning (meat carried as objective state).
      if (o && o.state === 'out' && o.kind === 'HAUL' && nx === o.tx && ny === o.ty) {
        try { this.mapmemHaulAt(rid); } catch (e) { o.state = 'returning'; }
      }
      // MAP MEMORY (villager-mapmem 2026-10-13): they notice what's on the
      // node they're standing on — fresh corpses become remembered sites.
      try { if (this.mapmemNoticeNode) this.mapmemNoticeNode(rid, nx, ny); } catch (e) {}
      // co-location: run into someone out here. Sometimes the village hears.
      try {
        var others = this.npcsOnNode(nx, ny).filter(function (id) {
          return id !== rid && ((this.state.village.away || {})[id]);
        }, this);
        if (others.length && R() < 0.25) {
          var other = pick(others);
          // TRUST LEDGER (journey landing r12 2026-10-13): reason attributed.
          this.bumpTrust(rid, 1, 'ran into each other out there'); this.bumpTrust(other, 1, 'ran into each other out there');
          var pHere = false;
          try { pHere = (this.map.px === nx && this.map.py === ny); } catch (e) {}
          if (pHere) {
            var a1 = 'Someone', a2 = 'Someone';
            try { a1 = this.displayName(rid); a2 = this.displayName(other); } catch (e) {}
            this.say(`👥 Out here, of all places — ${a1} and ${a2} run into each other. They stop and talk a while.`);
          }
        }
      } catch (e) {}
    },

    // ---------- 5. INDOOR LIFE ----------
    // Runs after the base loop each day-part. Indoor-objective holders stay
    // inside (the door drift may have moved them; their objective holds them),
    // live their chore/rest/social, and cost less than the walkers.
    objTick() {
      if (this.over) return;
      var v = this.state.village;
      var hx = v.px ?? 4, hy = v.py ?? 4;
      var dawn = false;
      try { dawn = (this.dayPart === 0); } catch (e) {}
      var playerAtHaven = false;
      try { playerAtHaven = (this.map.px === hx && this.map.py === hy); } catch (e) {}
      var roster = v.roster || [];
      for (var i = 0; i < roster.length; i++) {
        var rid = roster[i];
        if (rid === this.villagerId) continue;
        var vp = null;
        try { vp = this.vpOf(rid); } catch (e) {}
        if (vp && vp.dead) continue;
        try { if (this.isEngaged(rid)) continue; } catch (e) {}
        var o = this.objOf(rid);
        var away = (v.away || {})[rid];
        // expeditions (agency) own these villagers: keep the objective
        // truthful — they're out exploring, not on indoor chores.
        try {
          var ast2 = this.agencyState();
          if (ast2.exped && ast2.exped[rid]) {
            var ex = ast2.exped[rid];
            o.kind = 'EXPLORE'; o.purpose = 'expedition'; o.state = 'out';
            o.indoor = false; o.tx = ex.tx; o.ty = ex.ty;
            o.targetVid = null; o.companion = null;
            continue; // agency moves them; nothing more to do here
          }
        } catch (e) {}
        // dawn: everyone re-decides. Idle villagers pick up a life.
        if (dawn && !away) {
          try {
            var ast = this.agencyState();
            if (!(ast.exped && ast.exped[rid])) {
              if (!o.kind || o.kind === 'idle' || o.state === 'done' || o.state === 'returning') this.objPick(rid, hx, hy);
            }
          } catch (e) {}
          o = this.objOf(rid);
        }
        if (away) continue; // the away machinery (base + objAwayStep) owns them
        // stale out-objective: home with no away entry and no expedition — the
        // trip ended without the objective closing (e.g. expedition return).
        // Don't sit on a dead errand; re-decide below.
        if (o.state === 'out' && !o.indoor) { o.state = 'done'; o.kind = 'idle'; }
        var node = null;
        try { node = this.npcNode(rid); } catch (e) { continue; }
        if (!node || node.nx !== hx || node.ny !== hy) continue;
        if (!o.indoor || o.state !== 'indoor') {
          // no indoor objective: make sure they have one rather than sitting
          // in the decision gap (objMaybeDepart already ran this part; the
          // indoor set is the fallback life, not a second departure roll)
          if (!o.kind || o.kind === 'idle' || o.state === 'done') this.objPick(rid, hx, hy);
          o = this.objOf(rid);
          // a fresh indoor pick starts living it THIS part, not next
          if (!o.indoor || o.state !== 'indoor') continue;
        }
        // indoor: hold the door, live the chore
        try { if (!this.npcInside(rid)) this.npcSetInside(rid, true); } catch (e) {}
        try {
          var nn = this.npcNeeds(rid);
          nn.hunger = Math.min(100, (nn.hunger || 0) + 1);
          if (o.kind === 'REST') nn.energy = Math.min(100, (nn.energy || 0) + 9);
        } catch (e) {}
        if (o.partsLeft != null) { o.partsLeft--; if (o.partsLeft <= 0) { o.state = 'done'; o.kind = 'idle'; } }
        if (R() >= 0.22) continue; // most indoor life is quiet
        var nm = 'Someone';
        try { nm = this.displayName(rid); } catch (e) {}
        if (o.kind === 'REST') {
          if (playerAtHaven) { var _rl = this.ambientLine('rest', rid, nm); if (_rl) this.say(_rl); }
        } else if (o.kind === 'EAT') {
          // visible hunger, answered: they went to the hall and ate
          if (playerAtHaven && R() < 0.5) { var _el = this.ambientLine('eat', rid, nm); if (_el) this.say(_el); }
        } else if (o.kind === 'HAVEN_CHORE') {
          if (o.chore === 'teach') {
            // LONGSIM agency r2 (2026-10-11): the teach chore is real
            // teaching now. A villager who knows the wild shows a villager
            // who is actually here something from it (agencyTeachVillager:
            // recorded, xp-granted, honest deed) — never trust bumps and a
            // deed for nothing transferred, the old theater.
            var lesson = null;
            try {
              var mates = roster.filter(function (id) { return id !== rid && id !== this.villagerId; }, this);
              var here = mates.filter(function (id) {
                try { var nd = this.npcNode(id); return !!(nd && nd.nx === hx && nd.ny === hy); }
                catch (e) { return false; }
              }, this);
              if (here.length) lesson = this.agencyTeachVillager(rid, pick(here));
            } catch (e) {}
            if (lesson && lesson.taught) {
              // TRUST LEDGER (journey landing r12 2026-10-13): reason attributed.
              try { this.bumpTrust(rid, 1, 'taught a villager their craft'); this.bumpTrust(lesson.learner, 1, 'learned a craft from a villager'); } catch (e) {}
              // PARITY (2026-10-14): a lesson that landed is the player's teaching deed.
              try { if (this.creditDeed) this.creditDeed(rid, 'teaching'); } catch (eT) { console.warn('[tracks] teach chore deed', eT); }
              if (playerAtHaven) {
                // LONGSIM agency r5 (2026-10-12): the spoken line varies off
                // the lesson's NEED (r4 recorded it on the lesson result;
                // nothing read it) — see teachChoreLine. firstRef for the
                // teacher ref too: displayName's bare "A person, maybe 60s"
                // reads as stage directions ("A is showing A ...").
                var tnm2 = nm;
                try { tnm2 = this.firstRef ? this.firstRef(rid) : nm; } catch (e) {}
                try { this.say(this.teachChoreLine(tnm2, lesson)); } catch (e) {}
                // SNARE OVERHEAR (trapline 2026-10-13): a player at haven
                // watching the wire lesson learns its shape — recipe L1.
                // Same regard gate as the TRAPS-return teach beat.
                if (lesson.topic === 'snare') { try { this.snareLessonOverhear(rid, true); } catch (e) {} }
              }
            } else if (playerAtHaven) {
              // no learner in earshot: they review their own finds, and the
              // line says that — never claims a lesson was given.
              this.say(this.ambientLine('finds', rid, nm) || `📖 ${nm} is going over their finds, re-tying the bundle.`);
            }
          } else if (o.chore !== 'teach' && playerAtHaven) {
            var _choreLine = this.ambientLine('chore_' + o.chore, rid, nm);
            if (_choreLine) this.say(_choreLine);
          }
        } else if (o.kind === 'VISIT' && o.targetVid) {
          // indoor social call: the visit happens at home
          var tnode2 = null;
          try { tnode2 = this.npcNode(o.targetVid); } catch (e) {}
          if (tnode2 && tnode2.nx === hx && tnode2.ny === hy && R() < 0.5) {
            try {
              // TRUST LEDGER (journey landing r12 2026-10-13): reason attributed.
              this.bumpTrust(rid, 1, 'sat and talked a while'); this.bumpTrust(o.targetVid, 1, 'shared a quiet talk');
              var nn2 = this.npcNeeds(rid); nn2.social = Math.max(0, (nn2.social || 40) - 15);
              if (playerAtHaven) {
                var tname2 = 'someone';
                try { tname2 = this.displayName(o.targetVid); } catch (e) {}
                var _vl = this.ambientLine('visit', rid, nm, tname2);
                if (_vl) this.say(_vl);
              }
            } catch (e) {}
          }
        }
      }
    },

    // teachChoreLine — the spoken line for a landed teach lesson (longsim
    // agency r5 2026-10-12). Varies off the lesson's NEED (r4 recorded the
    // need on the lesson result; nothing read it): a wounded villager gets
    // shown wound herbs, a hungry one gets shown food, a novice gets the
    // beginner's tour — mirroring the deed text, which already records the
    // same why. firstRef for the learner: displayName's bare "A person,
    // maybe 60s" reads as stage directions ("A is showing A the ...");
    // firstRef's "the woman in her 30s" is a voice. Pure string building,
    // no RNG — narration-only, sim trajectories unchanged.
    teachChoreLine(tnm, lesson) {
      var lnm = 'someone';
      try {
        if (lesson && lesson.learner) lnm = this.firstRef ? this.firstRef(lesson.learner) : this.displayName(lesson.learner);
      } catch (e) {}
      // SNARE APPRENTICESHIP (trapline 2026-10-13): the wire lesson gets its
      // own line — the loop, the trigger stick, where the run narrows.
      if (lesson && lesson.topic === 'snare') {
        return `📖 ${tnm} is showing ${lnm} the snare — the loop, the trigger stick, where the run narrows between the roots. "Opossum trails. Check at dawn. Always."`;
      }
      var pname = (lesson && lesson.plantName) || 'something from the wild';
      // descriptors already carry their article ("a tree with...")
      var pnameArt = pname;
      try { pnameArt = (/^(a|an)\s/i.test(pname)) ? pname : 'the ' + pname; } catch (e) {}
      var need = lesson ? lesson.need : null;
      if (need === 'wound') return `📖 ${tnm} is showing ${lnm} ${pnameArt} — which leaves to press on a wound.`;
      if (need === 'hunger') return `📖 ${tnm} is showing ${lnm} ${pnameArt} — where it grows, what's safe to eat.`;
      if (need === 'novice') return `📖 ${tnm} is walking ${lnm} through ${pnameArt} — leaf, stem, smell, the beginner's tour.`;
      return `📖 ${tnm} is showing ${lnm} ${pnameArt} — leaf, stem, smell.`;
    },

    // snareLessonOverhear — the player's cut of a witnessed snare lesson
    // (trapline 2026-10-13). Watching real hands teach the wire teaches the
    // shape of it: recipe L1 (seen — blind 35% craft, materials at risk).
    // Same regard gate as the TRAPS-return teach beat (trust 15+; strangers
    // don't hand over their craft), and only while L0 — a second viewing
    // adds nothing. The overhear never teaches L2: your hands learn by
    // doing (a successful blind craft), not by watching.
    snareLessonOverhear(teacherVid, playerAtHaven) {
      try {
        var atHaven = playerAtHaven;
        if (atHaven === undefined) {
          var _v = this.state.village || {};
          atHaven = (this.map.px === (_v.px ?? 4) && this.map.py === (_v.py ?? 4));
        }
        if (!atHaven) return false;
        var tvp = this.vpOf ? this.vpOf(teacherVid) : null;
        if (!tvp || !tvp.knowsSnare) return false;
        var tr = 10;
        try { var _t = (this.state.village.trust || {})[teacherVid]; if (_t !== undefined) tr = _t; } catch (e) {}
        if (tr < 15) return false;
        var rk = ((this.state.codex || {}).recipes || {})['snare'] || {};
        if ((rk.level || 0) >= 1) return false;
        var nm = 'Someone';
        try { nm = this.firstRef ? this.firstRef(teacherVid) : this.displayName(teacherVid); } catch (e) {}
        if (this.grantKnowledge) this.grantKnowledge('recipe', 'snare', 1, { type: 'witnessed', by: nm });
        this.say(`🪤 You watch ${nm} walk someone through the snare — the loop, the trigger stick, where the run narrows between the roots. Your hands don't know it yet. Your eyes do.`);
        try { this.tele('snare_overhear', { teacher: teacherVid }); } catch (e) {}
        return true;
      } catch (e) { return false; }
    },

    // ---------- 6. RETURN EFFECTS for the new purposes ----------
    // The base return block handles forage/explore/leave; these extend it.
    // Called from the base return path (surgical hook in npcNodeTravel).
    objReturnEffect(vid, purpose) {
      var v = this.state.village;
      var nm = 'Someone';
      try { nm = this.displayName(vid); } catch (e) {}
      var playerAtHaven = false;
      try { playerAtHaven = (this.map.px === (v.px ?? 4) && this.map.py === (v.py ?? 4)); } catch (e) {}
      if (purpose === 'water') {
        var n = 2 + Math.floor(R() * 3);
        v.water = v.water || { clean: 0 };
        v.water.clean = (v.water.clean || 0) + n;
        if (playerAtHaven) this.say(`💧 ${nm} returns with water: +${n} clean.`);
        try { this.bumpTrust(vid, 1, 'hauled clean water home'); } catch (e) {}
      } else if (purpose === 'traps') {
        var _caught = false, _kcal = 0;
        if (R() < 0.4) {
          _caught = true;
          _kcal = 100 + Math.floor(R() * 300);
          try { this.stockPantry(_kcal, 'Snared meat'); } catch (e) {}
          if (playerAtHaven) this.say(`🪤 ${nm} is back from the snares: +${_kcal} kcal to the pantry.`);
        } else if (playerAtHaven) {
          this.say(`🪤 ${nm} is back. "Snares were empty. They'll keep."`);
        }
        // SIM TELEMETRY (trapline 2026-10-13): NPC trapline activity per
        // return — measurement infrastructure, zero gameplay effect.
        try { this.tele('npc_trap', { vid: vid, caught: _caught, kcal: _kcal }); } catch (e) {}
        // TRAP TEACHING (structural 2026-10-10): a hunter who knows the wire
        // can SHOW you — once, and only if you've earned their regard (trust
        // 15+; strangers don't hand over their craft). Watching real hands
        // work a real snare teaches the shape of it: recipe L1 (seen — blind
        // 35% craft, materials at risk). Word of mouth is the canon pre-codex
        // channel; this is its trapping beat. Fires on the witnessed return,
        // never silently.
        try {
          var _vp = this.vpOf ? this.vpOf(vid) : null;
          var _rk = ((this.state.codex || {}).recipes || {})['snare'] || {};
          var _tr = (this.state.village.trust || {})[vid];
          if (_tr === undefined) _tr = 10;
          if (playerAtHaven && _vp && _vp.knowsSnare && ((_rk.level || 0) < 1) && !_vp.taughtSnare && _tr >= 15) {
            _vp.taughtSnare = true;
            if (this.grantKnowledge) this.grantKnowledge('recipe', 'snare', 1, { type: 'taught', by: nm });
            this.say(`🪤 ${nm} catches you watching the snares come off the line. "...Want to actually SEE one?" They show you — the loop, the trigger stick, where the run narrows between the roots. "Opossum trails. Check at dawn. Always." Your hands don't know it yet. Your eyes do.`);
          }
        } catch (e) {}
        try { this.bumpTrust(vid, 1, 'worked the snare line'); } catch (e) {} // NOTE: the teaching gate
        // above reads trust BEFORE this +1 — the lesson is earned on prior
        // regard, not on the bump for this return.
      } else if (purpose === 'visit' || purpose === 'guard') {
        var withLine = '';
        var withId = null;
        try {
          var o = this.objOf(vid);
          if (o.companion) { withLine = ' with ' + this.displayName(o.companion); withId = o.companion; }
          // REP-NAME HONESTY (travel longsim r4 2026-10-12): a stranger
          // descriptor's first word ("A person, maybe 40s…") is not a name —
          // "found A" read broken. Descriptors are used whole via _repName.
          else if (o.targetVid) { withLine = ' — found ' + this._repName({ id: o.targetVid }); withId = o.targetVid; }
        } catch (e) {}
        if (playerAtHaven) {
          this.say(`🚶 ${nm} is back${withLine}.`);
        }
        // BONDS (pacing build 2026-10-10): a completed visit with someone —
        // miles walked together, stories traded. +4. Fires whether or not
        // the player was there to see them return.
        try { if (withId && this.bondAdd) this.bondAdd(vid, withId, 4, 'visit'); } catch (e) {}
        // LONGSIM trust r2 (2026-10-11): the return is news — seed two
        // witnesses so the rumor can travel (was heard: [], born dead).
        // Same pattern as the objective-departure path above.
        try {
          var _seenR = (v.roster || []).filter(function (id) { return id !== vid && id !== this.villagerId; }, this);
          var _shufR = _seenR.slice();
          for (var _iR = _shufR.length - 1; _iR > 0; _iR--) { var _jR = Math.floor(R() * (_iR + 1)); var _tR = _shufR[_iR]; _shufR[_iR] = _shufR[_jR]; _shufR[_jR] = _tR; }
          this.seedGossip('return', { who: vid }, _shufR.slice(0, 2));
        } catch (e) {}
      } else if (purpose === 'haul') {
        // HAUL return (villager-mapmem 2026-10-13): the carried meat lands
        // in the pantry as safe food (only known-safe meat was hauled), and
        // the village eats it through the normal meal system — closing the
        // loop the r12 run showed rotting open.
        var hk = 0, hn = 'Hauled meat';
        try {
          var ho = this.objOf(vid);
          hk = ho.haulKcal || 0; hn = ho.haulName || hn;
          ho.haulKcal = 0; // deposited — don't double-count on re-return
        } catch (e) {}
        if (hk > 0) {
          try { this.stockPantry(hk, hn); } catch (e) {}
          if (playerAtHaven) this.say(`🥩 ${nm} is back with meat: +${hk} kcal to the pantry.`);
          try { this.bumpTrust(vid, 1); } catch (e) {}
        } else if (playerAtHaven) {
          this.say(`🥩 ${nm} is back empty-handed. "Nothing worth hauling out there."`);
        }
      }
      // BARK-ARMOR TEACH (armor discovery 2026-10-13): a villager who WEARS
      // bark armor can SHOW you — once, and only if you've earned their
      // regard (trust 15+; strangers don't hand over their craft). A worn
      // cuirass, examined up close, teaches the shape of it: recipe L1
      // (seen — blind 35% craft, materials at risk). The snare-lesson
      // pattern, for the armor the occupation lottery puts into play.
      // Fires on any return, never silently.
      try {
        var _vpB = this.vpOf ? this.vpOf(vid) : null;
        var _rkB = ((this.state.codex || {}).recipes || {})['bark_armor'] || {};
        var _trB = (this.state.village.trust || {})[vid];
        if (_trB === undefined) _trB = 10;
        var _wearsBark = false;
        try { _wearsBark = !!(_vpB && _vpB.equipped && _vpB.equipped.torso && _vpB.equipped.torso.itemId === 'bark_armor'); } catch (e) {}
        if (playerAtHaven && _wearsBark && ((_rkB.level || 0) < 1) && !_vpB.taughtBarkArmor && _trB >= 15) {
          _vpB.taughtBarkArmor = true;
          if (this.grantKnowledge) this.grantKnowledge('recipe', 'bark_armor', 1, { type: 'taught', by: nm });
          this.say(`🛡️ ${nm} catches you eyeing the bark plates — claw-scored, vine-laced. "...Want to actually SEE one?" They talk you through it — wide strips dried flat, laced overlapping like shingles, snug but not tight. Your hands don't know it yet. Your eyes do.`);
        }
      } catch (e) {}
      // objective complete
      var oo = this.objOf(vid);
      oo.state = 'done'; oo.kind = 'idle'; oo.companion = null; oo.targetVid = null;
    },
  };

  Object.assign(G, methods);

  // ============ WRAPS (chain-safe) ============
  (function attach() {
    // after the base away-system AND agency run each day-part, run objectives:
    // dawn re-picks, indoor life, door-holding.
    var _nnt = G.npcNodeTravel;
    G.npcNodeTravel = function () {
      if (_nnt) _nnt.call(this);
      try { this.objTick(); } catch (e) {}
    };
  })();
})();
