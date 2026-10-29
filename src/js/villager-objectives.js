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
//   - return_to_fight: a villager who fought a living world monster remembers the fight's tile, and only that villager may be offered a HUNT errand back to it (fresh memory, armed, in range, existing departure gates still apply). No villager is ever routed to a monster tile nobody fought on — knowledge gates the route, never a radar. (code: villager-objectives.js, game.js resolveWildMonsterEncounter, 2026-10-27)
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
 *    HAVEN_CHORE, EXPLORE, REST, EAT, LEAVE (escape), HUNT (return-to-fight:
 *    back to a tile where that villager already fought a living monster).
 *    Re-picked at dawn and when idle. Outdoor kinds carry a target node
 *    and a tightness (max nodes out, max parts). Indoor kinds keep people
 *    home with real lives.
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
      // SHARING (sim-prosefix-b, #438): the old variant asserted private
      // eating ("Neither one is being shared") while the village runs
      // communal bowls (villageMeal, mealLog sittings, logSitting's
      // "lingered over the fire together"). Now it names today's company —
      // the ateWith vid stamped on the meal memory by logSitting, voiced
      // through displayName so strangers stay descriptors (knowledge
      // gating untouched) — and when nobody sat with them it says that
      // honestly instead of claiming a private bowl.
      function (nm, comp) { return comp
        ? `🍲 ${nm} eats with ${comp} — bowls side by side, talk low.`
        : `🍲 ${nm} eats by the fire, slow, watching the flames.`; },
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
    // grief: the death-beat coda in game.js (starvation / wound / sickness
    // lines). Deaths name the loss in the cause tail (the `tail` slot); the
    // coda is the village's grief — never a headcount (the old 'The village
    // is N now.' blank, death-liturgy 2026-10-21). Steve's voice: plain,
    // specific, human, no purple prose. Variant 0 is the canonical line.
    grief: [
      function (nm, tail) { return `💀 ${nm}${tail} Somebody keeps looking at the door, like they're still going to walk in.`; },
      function (nm, tail) { return `💀 ${nm}${tail} Nobody eats much tonight. The pot stays full and nobody touches it.`; },
      function (nm, tail) { return `💀 ${nm}${tail} Somebody's sleeping-roll stays rolled out. Nobody puts it away.`; },
      function (nm, tail) { return `💀 ${nm}${tail} The talk dies fast around the fire. Nobody has the words yet.`; },
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
    // eatBeatLine (sim-prosefix-b, #438): the EAT beat voices today's
    // company honestly. Two sources, in order: (1) today's 'ate with' meal
    // memory (carrying the ateWith vid from logSitting) — present when the
    // linger already wrote it; (2) who's at the hall eating RIGHT NOW —
    // fellow EAT-objective holders are indoor at the hall this part
    // (objPick sets state 'indoor'; the beat fires in the same tick).
    // Without company it renders the honest quiet, never the old
    // private-bowl assertion. The companion goes through displayName
    // (strangers stay descriptors — knowledge gating untouched).
    // Deterministic given state: no RNG draws.
    eatBeatLine(rid, nm) {
      var comp = null;
      try {
        var mem = (((this.state || {}).village || {}).memory || {})[rid] || [];
        var day = ((this.state || {}).scholar || {}).day || 0;
        for (var i = mem.length - 1; i >= 0; i--) {
          var e = mem[i];
          if (e && e.t === 'meal' && e.day === day && e.ateWith) {
            try { comp = this.displayName(e.ateWith); } catch (e2) { comp = null; }
            break;
          }
        }
        if (!comp && typeof this.objState === 'function') {
          var os = this.objState();
          for (var vid in os) {
            if (vid === rid) continue;
            var o = os[vid];
            if (o && o.kind === 'EAT' && o.state === 'indoor') {
              try { comp = this.displayName(vid); } catch (e3) { comp = null; }
              if (comp) break;
            }
          }
        }
      } catch (e4) { comp = null; }
      try { return this.ambientLine('eat', rid, nm, comp); } catch (e5) { return null; }
    },
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
    // griefLine (death-liturgy 2026-10-21): render a death beat — the cause
    // tail names the loss (nm is already knowledge-gated through displayName
    // at the call site), the pool renders the village's grief. Never returns
    // null: variant 0 is the canonical line, so even a broken pool keeps the
    // beat. Rotation is the pure (vid, day) ambientPick — never R().
    griefLine(vid, nm, causeTail) {
      var line = `💀 ${nm}${causeTail} Somebody keeps looking at the door, like they're still going to walk in.`;
      try {
        var pool = null;
        try { pool = (this.ambientBeats() || {})['grief']; } catch (e0) {}
        if (pool && pool.length >= 3) {
          var i = 0;
          try { i = this.ambientPick(vid, 'grief', pool.length); } catch (e1) {}
          line = pool[i](nm, causeTail);
        }
      } catch (e2) {}
      return line;
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
      o.huntMid = null; o.huntTx = null; o.huntTy = null; o.huntDay = null; // fresh pick: a stale hunt provenance must not linger on a new errand
      o.chore = null; // fresh pick: a stale chore label must not linger on
      // non-chore objectives (longsim agency 2026-10-11: census showed
      // VISIT/out(fire), GUARD/out(teach) — old chore tags on new errands)
      var n = {};
      try { n = this.npcNeeds(vid); } catch (e) {}
      var goal = null;
      try { goal = this.npcGoal(vid); } catch (e) {}
      // DORMANT MOTIVATIONS (rogue P1, audit Talk 2 P2-2): 'alone' villagers
      // deprioritize companions — the flag rides the objective into
      // objMaybeDepart (skips the companion ask) and objAskCompanion (never
      // picked as someone else's guard). Reads the GENERATED npcGoal —
      // unique-person law, no fixed-cast scripting.
      o.solo = (goal === 'alone');
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
      // DAWN-AFTER-KILL (r13 2026-10-17): a fresh unrevealed-flesh kill is
      // time-critical knowledge — it rots in ~3 days, and the weighted chore
      // lottery almost never picks HAUL inside that window (r12: 0-1 takes
      // across 6 pilots despite 1-3 offer-days/seed). A person who knows
      // fresh meat is out there goes and gets it; they don't enter a chore
      // lottery. After the body-first gates (rest/eat), a remembered corpse
      // killed yesterday/today with unrevealed flesh and a feasible haul
      // takes the HAUL objective directly. mapmemHaulCandidate still
      // enforces feasibility, range, and the no-dogpile cap; objDanger
      // still gates the actual departure.
      var freshHaul = null;
      try { freshHaul = this.mapmemHaulCandidate ? this.mapmemHaulCandidate(vid, hx, hy) : null; } catch (e) {}
      if (freshHaul && this.objFreshKillUnrevealed(freshHaul.ref)) {
        o.kind = 'HAUL';
        this.objHaulFromSite(vid, hx, hy, o, freshHaul);
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
      // DESIGNCALL 7 (2026-10-16): thirst measured in days of village supply.
      // The village shares one cistern (villageDrinks: 2L/head/day) — this is
      // the honest signal, not a per-villager thirst stat.
      var waterDays = 99;
      try {
        var _wliv = 0;
        for (var _wli = 0; _wli < (v.roster || []).length; _wli++) {
          var _wvp = this.vpOf((v.roster || [])[_wli]);
          if (_wvp && !_wvp.dead) _wliv++;
        }
        var _wdem = 2 * Math.max(1, _wliv);
        var _wsup = ((v.water || {}).clean || 0) + ((v.water || {}).dirty || 0);
        waterDays = _wsup / _wdem;
      } catch (e) {}
      var cands = [];
      // DORMANT MOTIVATIONS (rogue P1, audit Talk 2 P2-2): the 11 generated
      // goals with no objPick voice now bias the lottery as visible weights
      // — not RNG mood rolls. Mapping (audit + design):
      //   family    -> VISIT kin (go find people, ask about kin)
      //   belong    -> social: VISIT + hall life (HAVEN_CHORE)
      //   remember  -> VISIT (sit with people, hear/keep stories)
      //   joy       -> VISIT (company)
      //   record/understand/answers -> SEEK (go learn from someone)
      //   survive   -> caution: avoid EXPLORE/HAUL, stay near the fire
      //   peace     -> avoid EXPLORE/HAUL, hall life
      //   alone     -> deprioritize company: VISIT down + o.solo (above)
      //   home      -> HAVEN_CHORE (tend the hall, make this home)
      //   legacy    -> HAVEN_CHORE, and teach when they can (leave something)
      // The 7 already-wired goals (feed/escape/lead/explore/prove/heal/
      // protect) are untouched here — their reads above read exactly as
      // before. Pure arithmetic: no new RNG draws on any path.
      var gwVisit = 0, gwChore = 0, gwSeek = 0;
      var gwVisitMul = 1, gwExploreMul = 1, gwHaulMul = 1;
      var gwChoreTag = null;
      if (goal === 'family') gwVisit += 1.5;
      if (goal === 'belong') { gwVisit += 1.0; gwChore += 0.6; }
      if (goal === 'remember') gwVisit += 1.0;
      if (goal === 'joy') gwVisit += 0.8;
      if (goal === 'alone') gwVisitMul = 0.4;
      if (goal === 'record' || goal === 'understand' || goal === 'answers') gwSeek = 2.0;
      if (goal === 'survive') { gwExploreMul = 0.35; gwHaulMul = 0.5; gwChore += 1.0; }
      if (goal === 'peace') { gwExploreMul = 0.3; gwHaulMul = 0.5; gwChore += 0.8; }
      if (goal === 'home') gwChore += 1.2;
      if (goal === 'legacy') { gwChore += 1.0; gwChoreTag = 'teach'; }
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
      // WATER — the cistern is the village's thirst, measured against what the
      // village actually drinks (2L/head/day, see villageDrinks in game.js).
      // DESIGNCALL 7 (2026-10-16): the old gate was a binary cliff at <3L
      // clean against a ~24L/day drain — a thirsty village (10L = half a day's
      // supply) adapted NOTHING, and at the cliff only half the village walked.
      // Now the weight ramps as days-of-supply falls, and when the cistern
      // can't cover today's drinks, thirst beats every errand including
      // hunger — it kills faster than hunger does (BALANCING.md attrition).
      if (waterDays < 2) {
        var ww = 3.5 + (2 - waterDays) * 2.5; // 2 days -> 3.5, 1 day -> 6, dry -> 8.5
        if (waterDays < 1) ww = Math.max(ww, 7); // thirst outranks hunger now
        cands.push({ kind: 'WATER', w: ww });
      }
      // TRAPS — only hands that know the wire. (knowledge-gated)
      // PIT KNOWLEDGE (pitknowledge 2026-10-18): pit-knowing hands work the
      // line too — their return runs the pit (see objReturnEffect). With
      // PITKNOWLEDGE=0 knowsPit is never set, so this reads exactly as before.
      if (vp.knowsSnare || vp.knowsPit) cands.push({ kind: 'TRAPS', w: 1.6 });
      // HAUL — map memory (villager-mapmem 2026-10-13): a remembered corpse
      // with meat. Offered through mapmemHaulCandidate (r12 2026-10-17):
      // the famine gate plus the knowledge channel (unrevealed monster
      // flesh is worth a trip even with a full pantry — the cautious-test
      // loop only ever sees field meat if someone brings it home).
      var haulSite = null;
      try { haulSite = this.mapmemHaulCandidate ? this.mapmemHaulCandidate(vid, hx, hy) : null; } catch (e) {}
      if (haulSite) {
        // KNOWLEDGE VALUE (r12): unrevealed flesh is worth more than its
        // kcal — the trip buys the village a new food. Weight the unknown
        // so the knowledge channel actually gets chosen, not just offered.
        var haulKnow = false;
        try {
          var hcs = this.corpses ? this.corpses() : [];
          for (var hci = 0; hci < hcs.length; hci++) {
            if (hcs[hci] && hcs[hci].id === haulSite.ref) {
              haulKnow = !!(this.mapmemFoodKnown && !this.mapmemFoodKnown(hcs[hci]));
              break;
            }
          }
        } catch (e) {}
        var hw = 1 + Math.min(3, haulSite.estKcal / 2000) + (haulKnow ? 1.5 : 0);
        hw *= gwHaulMul; // DORMANT MOTIVATIONS (rogue P1): survive/peace avoid the haul
        cands.push({ kind: 'HAUL', w: hw, site: haulSite });
      }
      // HUNT (return-to-fight, gap-routing 2026-10-27): a villager with a
      // fresh fight memory may be offered the trip back to that fight's
      // tile. objHuntCandidate enforces every gate (fresh memory, armed,
      // in range, not sheltering, not resting off a bad flee); this is
      // only a lottery weight, never a guarantee — food, water, and hall
      // life still compete, and the departure gates still decide.
      var huntSite = null;
      try { huntSite = this.objHuntCandidate ? this.objHuntCandidate(vid, hx, hy) : null; } catch (e) {}
      if (huntSite) cands.push({ kind: 'HUNT', w: 2.0, site: huntSite });
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
      // DORMANT MOTIVATIONS (rogue P1): family/belong/remember/joy seek people
      // out (VISIT up); alone villagers deprioritize company (VISIT down).
      if (visitT) cands.push({ kind: 'VISIT', w: (1.2 + ((n.social || 40) > 60 ? 0.8 : 0)) * gwVisitMul + gwVisit, targetVid: visitT });
      // EXPLORE — nomads only.
      // DORMANT MOTIVATIONS (rogue P1): survive/peace avoid the wild.
      if ((prof === 'wanderer' || prof === 'explorer') && R() < 0.5) cands.push({ kind: 'EXPLORE', w: (prof === 'explorer' ? 2 : 1.2) * gwExploreMul });
      // SEEK — the knowledge-seekers. DORMANT MOTIVATIONS (rogue P1):
      // record/understand/answers go find someone and learn. Indoor, a real
      // target, a short clock — same shape as the build-knowledge SEEK above.
      if (gwSeek > 0) cands.push({ kind: 'SEEK', w: gwSeek });
      // HAVEN_CHORE — indoor life. Always available; homebodies lean here.
      // DORMANT MOTIVATIONS (rogue P1): belong/home/legacy/survive/peace lean
      // into hall life; legacy villagers teach when they can (the honest
      // 'teach' gate in the build below keeps the chore real).
      cands.push({ kind: 'HAVEN_CHORE', w: (prof === 'homebody' ? 3 : 1.4) + gwChore, chore: gwChoreTag });
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
        // DESIGNCALL 7 (2026-10-16): a parched cistern (< half a day's supply)
        // means the near creek is picked over — the water run ranges farther
        // out, like foragers do when the near grounds are thin.
        if (waterDays < 0.5) dist = Math.max(1, Math.min(maxD, 2 + Math.floor(R() * 3)));
        o.partsLeft = 2 + Math.floor(R() * 2) + (waterDays < 0.5 ? 1 : 0); o.tightness = dist;
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
      } else if (chosen.kind === 'HUNT') {
        this.objHuntFromSite(vid, hx, hy, o, chosen.site);
        return o;
      } else if (chosen.kind === 'HAUL') {
        this.objHaulFromSite(vid, hx, hy, o, chosen.site);
        return o;
      } else if (chosen.kind === 'SEEK') {
        // DORMANT MOTIVATIONS (rogue P1): the knowledge-seeker's errand —
        // go find someone who knows things and learn. Same shape as the
        // build-knowledge SEEK above: indoor, a real target, a short clock.
        // The target is someone they actually know (objVisitTarget scores
        // trust/fire-group, no RNG); the beat is quiet — the seeking is the
        // behavior, not a line.
        o.kind = 'SEEK'; o.purpose = 'seek'; o.state = 'indoor'; o.indoor = true;
        o.targetVid = visitT; o.companion = null;
        o.tx = hx; o.ty = hy; o.tightness = 0; o.partsLeft = 2;
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
      return o;
    },
    // objFreshKillUnrevealed(ref) (r13 2026-10-17): true when the corpse was
    // killed yesterday or today AND its flesh is still unrevealed. The
    // dawn-after-kill prioritization fires only on time-critical knowledge —
    // a stale kill keeps the lottery path, revealed meat keeps no offer.
    objFreshKillUnrevealed(ref) {
      var day = 0;
      try { day = this.state.scholar.day || 0; } catch (e) {}
      var corpses = [];
      try { corpses = this.corpses ? this.corpses() : []; } catch (e) {}
      for (var i = 0; i < corpses.length; i++) {
        var c = corpses[i];
        if (!c || c.id !== ref) continue;
        var age = day - (c.dayDied || 0);
        if (age < 0 || age > 1) return false;
        var known = false;
        try { known = !!(this.mapmemFoodKnown && this.mapmemFoodKnown(c)); } catch (e) {}
        return !known;
      }
      return false;
    },
    // objHaulFromSite(vid, hx, hy, o, site) (r13 2026-10-17): build the HAUL
    // objective for a remembered carcass site. Extracted from the lottery
    // path so the dawn-after-kill prioritization builds byte-identical
    // objectives. The caller sets o.kind = 'HAUL' first.
    objHaulFromSite(vid, hx, hy, o, site) {
      var v = this.state.village;
      // HAUL: go back for the remembered carcass. The target is a real
      // remembered node, not a random direction — this is the cross-node
      // objective. They tell the hall where they're going (gossip spread:
      // listeners gain the memory secondhand).
      o.purpose = 'haul'; o.state = 'ready'; o.indoor = false;
      o.tx = site.nx; o.ty = site.ny;
      o.targetRef = site.ref; o.haulLabel = site.label; o.haulSite = site;
      var hdist = this.objDist(hx, hy, site.nx, site.ny);
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
    },
    // RETURN-TO-FIGHT (gap-routing 2026-10-27): the fight-memory store and
    // the hunt offer. The store is per-villager, on the village record:
    // state.village.monsterSightings[vid] = [{mid, tx, ty, day, part}].
    // A memory is earned only by actually fighting a living world monster
    // at that tile (recorded from resolveWildMonsterEncounter in game.js
    // — never from a mere sighting, never from gossip, never from the
    // monster list). It is never shared with villagers who were not
    // there, and it carries no live-monster lookup: the hunt target is
    // the remembered tile, whether or not the beast is still on it when
    // the villager arrives. That is the whole knowledge gate — a villager
    // goes back to where they fought, never to a tile the game knows
    // about but they do not.
    // objNoteMonsterSighting(vid, mid, tx, ty): record or refresh one
    // memory. Cap 4 per villager, oldest dropped first. Returns the
    // entry, or null on bad input. Never throws into the caller.
    objNoteMonsterSighting(vid, mid, tx, ty) {
      try {
        if (!vid || !mid || tx == null || ty == null) return null;
        if (vid === this.villagerId) return null; // the player is not a routed villager
        var v = this.state.village;
        v.monsterSightings = v.monsterSightings || {};
        var list = v.monsterSightings[vid] || (v.monsterSightings[vid] = []);
        var day = 0, part = 0;
        try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
        try { part = this.dayPart || 0; } catch (e) {}
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].mid === mid && list[i].tx === tx && list[i].ty === ty) {
            list[i].day = day; list[i].part = part;
            return list[i];
          }
        }
        var entry = { mid: mid, tx: tx, ty: ty, day: day, part: part };
        list.push(entry);
        while (list.length > 4) list.shift();
        return entry;
      } catch (e) { return null; }
    },
    // objDropMonsterSighting(vid, mid, tx, ty): remove one memory — used
    // when a hunter reaches the remembered tile and the quarry is gone
    // (they checked; it is gone). Returns true when something was removed.
    objDropMonsterSighting(vid, mid, tx, ty) {
      try {
        var v = this.state.village;
        var list = (v.monsterSightings || {})[vid] || [];
        var kept = [], dropped = false;
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].mid === mid && list[i].tx === tx && list[i].ty === ty) { dropped = true; continue; }
          kept.push(list[i]);
        }
        if (v.monsterSightings) v.monsterSightings[vid] = kept;
        return dropped;
      } catch (e) { return false; }
    },
    // objVillagerArmed(vid): the readiness gate's weapon test, reused
    // (standing.js waveCombatReadiness): a weapon equipped, or a weapon
    // item carried. Fail-closed: any read error means unarmed.
    objVillagerArmed(vid) {
      try {
        var vp = this.vpOf ? this.vpOf(vid) : null;
        if (!vp || vp.dead) return false;
        var S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
        var eq = S.equipment || null;
        if (eq) {
          if (typeof eq.meleeWeaponOf === 'function' && eq.meleeWeaponOf(vp)) return true;
          if (typeof eq.rangedWeaponOf === 'function' && eq.rangedWeaponOf(vp)) return true;
        }
        var itemDefs = (this.data && this.data.items) || [];
        var items = vp.items || [];
        for (var i = 0; i < items.length; i++) {
          var e = items[i];
          var iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
          if (!iid) continue;
          for (var j = 0; j < itemDefs.length; j++) {
            if (itemDefs[j] && itemDefs[j].id === iid && itemDefs[j].weapon) return true;
          }
        }
        return false;
      } catch (e) { return false; }
    },
    // objHuntCandidate(vid, hx, hy): the best fresh fight memory that may
    // be offered as a HUNT errand, or null. Gates, all of them:
    // fresh (no older than 3 days), armed, within roaming range, not
    // sheltering, not resting off today's bad flee. Nearest fresh memory
    // wins — the shortest walk to the most recent fight.
    objHuntCandidate(vid, hx, hy) {
      try {
        if (!vid || vid === this.villagerId) return null;
        var vp = this.vpOf ? this.vpOf(vid) : null;
        if (!vp || vp.dead) return null;
        try { if (this.isSheltered && this.isSheltered(vid)) return null; } catch (e) {}
        try { if (this.isPostFleeResting && this.isPostFleeResting(vid)) return null; } catch (e) {}
        if (!this.objVillagerArmed(vid)) return null;
        var maxD = 0;
        try { maxD = Math.max(0, this.npcMaxDist(vid)); } catch (e) { return null; }
        if (maxD < 1) return null;
        var list = (((this.state || {}).village || {}).monsterSightings || {})[vid] || [];
        if (!list.length) return null;
        var day = 0;
        try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
        var best = null, bestDist = 1e9;
        for (var i = 0; i < list.length; i++) {
          var s = list[i];
          if (!s || !s.mid) continue;
          var age = day - (s.day || 0);
          if (age < 0 || age > 3) continue; // stale: older than 3 days is not hunted on
          var d = this.objDist(s.tx, s.ty, hx, hy);
          if (d < 1 || d > maxD) continue;
          if (d < bestDist) { bestDist = d; best = s; }
        }
        if (!best) return null;
        return { mid: best.mid, tx: best.tx, ty: best.ty, day: best.day };
      } catch (e) { return null; }
    },
    // objHuntFromSite(vid, hx, hy, o, site): build the HUNT objective for
    // a fight memory. Same shape as objHaulFromSite: a real remembered
    // node, a tightness, a clock. The provenance rides on the objective
    // (huntMid/huntTx/huntTy/huntDay) so any reader — including the
    // panel — can check the route against the memory it came from.
    objHuntFromSite(vid, hx, hy, o, site) {
      o.purpose = 'hunt'; o.state = 'ready'; o.indoor = false;
      o.tx = site.tx; o.ty = site.ty;
      o.huntMid = site.mid; o.huntTx = site.tx; o.huntTy = site.ty; o.huntDay = site.day;
      var hdist = this.objDist(hx, hy, site.tx, site.ty);
      o.tightness = Math.max(1, hdist);
      o.partsLeft = 2 * hdist + 3;
      o.targetVid = null; o.companion = null;
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
          // RAID WARNING (rogue P1 2026-10-22): a raid warning is danger —
          // it moves departures and mid-trip re-targeting alike, same
          // weight as an attack.
          if ((a === 'attack' || a === 'murder' || a === 'raid') && day - (g[i].day || 0) <= 3) score += 2;
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
          // RAID WARNING (rogue P1 2026-10-22): same as objDanger — a raid
          // warning is danger, and it can stand down expedition launches.
          if ((a === 'attack' || a === 'murder' || a === 'raid') && day - (g[i].day || 0) <= 3) score += 2;
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
        // SICK (crisis leg 2026-10-22): the feverish stay home — a sick
        // villager is never asked to walk guard. Their own objMaybeDepart
        // gates them, but the companion departs inside the LEADER's call,
        // so without this filter the gate never sees them.
        try { if ((v.sick || {})[id]) continue; } catch (e) {}
        // DORMANT MOTIVATIONS (rogue P1): 'alone' villagers are never asked
        // to walk guard — leave them be. Reads the GENERATED npcGoal.
        try { if (this.npcGoal && this.npcGoal(id) === 'alone') continue; } catch (e) {}
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
      // FOODVOICE2 (2026-10-17): the forage departure line was a single
      // template fired verbatim per departure (up to 6/day on the corpus).
      // A small pool in the speaker's wry-terse register; selection is a
      // deterministic vid+day hash plus a per-day sequence kept OFF-STATE
      // on the Game object — zero engine-RNG draws, zero game-state moves.
      // FOODVOICE2_GATE='0' (testing only) restores the single line.
      var purposeLine;
      // GAP-W4-NARR #588/#721: the water departure was the same single
      // stock line every day ("The well won't fill itself."). Water
      // departures share the FOODVOICE2 pool machinery (per-day sequence,
      // no within-day repeats, off-state, zero RNG draws).
      if ((obj.purpose === 'forage' || obj.purpose === 'water') && !(typeof process !== 'undefined' && process.env && process.env.FOODVOICE2_GATE === '0')) {
        var fvToday = 0;
        try { fvToday = (this.state.scholar || {}).day || 0; } catch (e) {}
        if (this._fvDepartDay !== fvToday) { this._fvDepartDay = fvToday; this._fvDepartSeq = 0; this._fvDepartUsed = {}; }
        var fvPool = obj.purpose === 'water' ? [
          '"The well won\'t fill itself."',
          '"Water first. Everything else waits."',
          '"Off to the well — back with a full skin."',
          '"Thirst doesn\'t negotiate. Going."',
          '"Fetching water. Somebody has to."',
        ] : [
          '"Back before dark. Probably."',
          '"Gone looking. Don\'t wait up."',
          '"There\'s food out there. Going to find it."',
          '"Out for a forage. If I\'m late, start without me."',
          '"Bringing dinner back. One way or another."',
        ];
        var fvKey = String(vid) + ':' + fvToday;
        var fvH = 0;
        for (var fvI = 0; fvI < fvKey.length; fvI++) fvH = ((fvH << 5) - fvH + fvKey.charCodeAt(fvI)) | 0;
        var fvSeq = this._fvDepartSeq || 0;
        this._fvDepartSeq = fvSeq + 1;
        var fvIdx = (((fvH + fvSeq) % fvPool.length) + fvPool.length) % fvPool.length;
        // within-day uniqueness: a village doesn't echo the same send-off
        // twice in one day (the robotic tell was N identical lines/day).
        var fvGuard = 0;
        while (this._fvDepartUsed[fvIdx] && fvGuard < fvPool.length) { fvIdx = (fvIdx + 1) % fvPool.length; fvGuard++; }
        this._fvDepartUsed[fvIdx] = 1;
        purposeLine = (obj.purpose === 'water' ? 'heads out for water. ' : 'heads out to forage. ') + fvPool[fvIdx];
      } else {
        purposeLine = {
        forage: 'heads out to forage. "Back before dark. Probably."',
        water: 'heads out for water. "The well won\'t fill itself."',
        traps: 'heads out to check the snares. "Wire doesn\'t lie."',
        visit: 'sets out to find ' + (function () { try { return this.displayName(obj.targetVid); } catch (e) { return 'someone'; } }.call(this)) + '. "Won\'t be long."',
        explore: 'wanders off. "I want to see what\'s out there."',
        leave: 'walks away from Haven. They don\'t look back.',
        guard: 'walks out with ' + (function () { try { return this.displayName(obj.targetVid); } catch (e) { return 'someone'; } }.call(this)) + '. "Nobody walks alone today."',
        // SENTENCE-SAFE (playtest deepening r18 2026-10-18, #542 class):
        // haulLabel is monsterDisplayName — proper names keep casing ("The
        // Loud Beast"), descriptors carry articles. Never "the The X".
        haul: 'sets out for ' + (this.articlePhrase ? this.articlePhrase(obj.haulLabel || 'carcass') : 'the ' + (obj.haulLabel || 'carcass')) + '. "Meat\'s meat. Back with it or not at all."',
        // RETURN-TO-FIGHT (gap-routing 2026-10-27): the hunt line names
        // the beast the way the village knows it (monsterDisplayName:
        // descriptor or village name, never the true name pre-System).
        hunt: 'sets out to hunt ' + (function () { try { var _mn = this.monsterDisplayName ? this.monsterDisplayName(obj.huntMid) : 'the beast'; return this.articlePhrase ? this.articlePhrase(_mn) : _mn; } catch (e) { return 'the beast'; } }.call(this)) + '. "It was there. Going back for it."',
      }[obj.purpose] || 'heads out.';
      }
      if (playerAtHaven) this.say((obj.companion ? '👥 ' : '') + nm + ' ' + purposeLine);
      // leaving is gossip-worthy. Two witnesses so the rumor can travel.
      var dims = { who: vid };
      if (obj.companion) dims.with = obj.companion;
      // DEPARTURE-PURPOSE (journey landing r32 2026-10-20): the gossip
      // render used to tell EVERY leaving as a dramatic walk-out
      // ("walked away from Haven. Didn't look back.") — including routine
      // forage/water/trap trips. Carry the objective purpose so the
      // render can tell the truth per purpose.
      if (obj.purpose) dims.purpose = obj.purpose;
      // TRIGGER REGISTRY (rogue P0-5): the witness shuffle + seeding lives
      // in the npc-triggers.js registry row 'departure'.
      try { if (this.npcTrigger) this.npcTrigger(vid, 'departure', { dims: dims }); } catch (e) {}
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
        // DORMANT MOTIVATIONS (rogue P1): 'alone' villagers deprioritize
        // companions (o.solo, set in objPick) — they tighten or stay rather
        // than bring company. Same fallthrough as the no-companion case.
        // RETURN-TO-FIGHT (gap-routing 2026-10-27): a HUNT is the knower's
        // own errand — it never drags along a villager who has not seen
        // the beast, so a hunt also takes the no-companion fallthrough
        // (tighten or stay) instead of asking for company.
        var cid = (o.solo || o.kind === 'HUNT') ? null : this.objAskCompanion(rid, o, hx, hy);
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
        // BEYOND-BOARD GUARD (fixall-map slice 2, narrowed after the
        // balanced-panel comparison): home-board walkers keep their exact
        // old wander — returning or not, the meander roll is consumed and
        // the step meanders as before, so panel games are bit-identical
        // to base until a villager actually stands beyond the edge. Only
        // a BEYOND-board returner skips meander: a clamped meander step
        // from a beyond position would snap them to the rim (a teleport),
        // and wandering farther from home is not a return walk anyway.
        var beyondBoard = nx < 0 || nx > 8 || ny < 0 || ny > 8;
        if (!leashed && !beyondBoard && R() < 0.35) {
          // meander: a step somewhere adjacent
          var dx = Math.floor(R() * 3) - 1, dy = Math.floor(R() * 3) - 1;
          if (dx || dy) { nx = clampN(nx + dx); ny = clampN(ny + dy); }
        } else {
          // pursue: one step toward the target. The RETURN walk is
          // UNCLAMPED (fixall-map slice 2): a villager beyond the edge
          // steps home through beyond coordinates, retracing ground they
          // already stand on. Outbound pursuit stays clamped — no errand,
          // expedition, or meander ever leaves the board through here.
          if (returning) {
            nx = nx + Math.sign(tx - nx);
            ny = ny + Math.sign(ty - ny);
          } else {
            nx = clampN(nx + Math.sign(tx - nx));
            ny = clampN(ny + Math.sign(ty - ny));
          }
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
      // allowBeyond ONLY on the return walk (see npcSetNode): the step
      // above is already clamped for every outbound walker, so the flag
      // changes nothing for them and unblocks only the walk home.
      if (nx !== ox || ny !== oy) this.npcSetNode(rid, nx, ny, returning);
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
      // RETURN-TO-FIGHT arrival (gap-routing 2026-10-27): at the hunt tile
      // with the quarry gone, the memory is spent — they checked, it is
      // not there, so it must not keep offering hunts to an empty tile.
      // When the quarry is still there, the memory stays: the world tick
      // may start the real fight from here, and that fight records a
      // fresh memory of its own.
      if (o && o.state === 'out' && o.kind === 'HUNT' && nx === o.tx && ny === o.ty) {
        try {
          var _qm = this.monsterAt ? this.monsterAt(nx, ny) : null;
          if ((!_qm || _qm.id !== o.huntMid) && this.objDropMonsterSighting) this.objDropMonsterSighting(rid, o.huntMid, o.tx, o.ty);
        } catch (e) {}
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
              // CARRIED-HAUL GUARD (r22): a 'returning' haul whose away-return
              // never fired still carries meat — deposit it before the re-pick
              // orphans it on the new objective. (r22 probe: haulUnknown stuck
              // on a replaced EAT objective, never deposited, never tested —
              // the wild haul→pantry→test arc broke here.)
              if (o.state === 'returning' && o.purpose === 'haul' && this.objReturnEffect) {
                try { this.objReturnEffect(rid, 'haul'); } catch (e) {}
                o = this.objOf(rid);
              }
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
          // visible hunger, answered: they went to the hall and ate.
          // SHARING (sim-prosefix-b, #438): the beat names today's company
          // (or the honest quiet when nobody sat with them) — never the
          // old private-bowl assertion.
          if (playerAtHaven && R() < 0.5) { var _el = this.eatBeatLine(rid, nm); if (_el) this.say(_el); }
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
                // PIT OVERHEAR INSTEAD-OF (gap-closure 2026-10-24, findings
                // #616): the pit overhear line says the same lesson in the
                // player's own voice ("You watch ... the depth, the
                // sharpened stakes ..."), so when it fires it REPLACES the
                // third-person teachChoreLine — saying both duplicated the
                // lesson back-to-back. The overhear's gates (L0, trust 15+,
                // knowsPit) decide; when it refuses, the chore line stands.
                var _pitOverheard = false;
                if (lesson.topic === 'pit') { try { _pitOverheard = !!this.pitLessonOverhear(rid, true); } catch (e) {} }
                if (!_pitOverheard) { try { this.say(this.teachChoreLine(tnm2, lesson)); } catch (e) {} }
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
      // PIT KNOWLEDGE (pitknowledge 2026-10-18): the pit lesson's own line —
      // the depth, the stakes, the marked ground.
      if (lesson && lesson.topic === 'pit') {
        return `📖 ${tnm} is showing ${lnm} the pit trap — the depth, the sharpened stakes at the bottom, where the game trail runs. "Brush it over with leaves. And mark it well — your own pit will take you too."`;
      }
      var pname = (lesson && lesson.plantName) || 'something from the wild';
      // descriptors already carry their article ("a tree with...", "the giant
      // tree with...") — keep them as-is. (playtest deepening r18 2026-10-18,
      // #542 class: the old /^(a|an)/ check missed "the"-descriptors and
      // composed "the the giant tree...".)
      var pnameArt = pname;
      try { pnameArt = (/^(a|an|the)\s/i.test(pname)) ? pname : 'the ' + pname; } catch (e) {}
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

    // pitLessonOverhear — the player's cut of a witnessed pit lesson
    // (pitknowledge 2026-10-18). Watching real hands lay out a pit teaches
    // the shape of it: recipe L1 (seen — blind 35% craft, materials at risk).
    // Same regard gate as the snare overhear (trust 15+; strangers don't hand
    // over their craft), only while L0, only when the channel is on. The
    // overhear never teaches L2: your hands learn by doing (a successful
    // blind craft), not by watching.
    pitLessonOverhear(teacherVid, playerAtHaven) {
      try {
        if (!this.pitKnowledgeOn || !this.pitKnowledgeOn()) return false;
        var atHaven = playerAtHaven;
        if (atHaven === undefined) {
          var _v = this.state.village || {};
          atHaven = (this.map.px === (_v.px ?? 4) && this.map.py === (_v.py ?? 4));
        }
        if (!atHaven) return false;
        var tvp = this.vpOf ? this.vpOf(teacherVid) : null;
        if (!tvp || !tvp.knowsPit) return false;
        var tr = 10;
        try { var _t = (this.state.village.trust || {})[teacherVid]; if (_t !== undefined) tr = _t; } catch (e) {}
        if (tr < 15) return false;
        var rk = ((this.state.codex || {}).recipes || {})['pit_trap'] || {};
        if ((rk.level || 0) >= 1) return false;
        var nm = 'Someone';
        try { nm = this.firstRef ? this.firstRef(teacherVid) : this.displayName(teacherVid); } catch (e) {}
        if (this.grantKnowledge) this.grantKnowledge('recipe', 'pit_trap', 1, { type: 'witnessed', by: nm });
        this.say(`🪤 You watch ${nm} walk someone through the pit trap — the depth, the sharpened stakes at the bottom, where the game trail runs. "Brush it over with leaves. And mark it well — your own pit will take you too." Your hands don't know it yet. Your eyes do.`);
        try { this.tele('pit_overhear', { teacher: teacherVid }); } catch (e) {}
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
        var _vp = null;
        try { _vp = this.vpOf ? this.vpOf(vid) : null; } catch (e) {}
        // PIT KNOWLEDGE (pitknowledge 2026-10-18): the return reads the
        // villager's own hands. The snare line needs knowsSnare (before this
        // channel, TRAPS implied it — the gate keeps that exact); the pit
        // line needs knowsPit and the channel on. PITKNOWLEDGE=0 leaves
        // knowsPit unset on every profile, so both gates read as before.
        var _knowsSnare = !!(_vp && _vp.knowsSnare);
        var _knowsPit = !!((this.pitKnowledgeOn && this.pitKnowledgeOn()) && _vp && _vp.knowsPit);
        var _caught = false, _kcal = 0;
        // LUCK INSTRUMENTATION (rogue P0-6): record the honest snare roll.
        let _snareRoll = false;
        if (_knowsSnare) {
          _snareRoll = R() < 0.4;
          try { this.luckRoll('snare', 0.4, _snareRoll); } catch (e) {}
        }
        if (_snareRoll) {
          _caught = true;
          _kcal = 100 + Math.floor(R() * 300);
          try { this.stockPantry(_kcal, 'Snared meat'); } catch (e) {}
          if (playerAtHaven) this.say(`🪤 ${nm} is back from the snares: +${_kcal} kcal to the pantry.`);
        } else if (playerAtHaven && _knowsSnare) {
          this.say(`🪤 ${nm} is back. "Snares were empty. They'll keep."`);
        }
        // SIM TELEMETRY (trapline 2026-10-13): NPC trapline activity per
        // return — measurement infrastructure, zero gameplay effect.
        try { this.tele('npc_trap', { vid: vid, caught: _caught, kcal: _kcal }); } catch (e) {}
        // PIT LINE (pitknowledge 2026-10-18): a trapper who knows the pit
        // works one — abstract like the snare roll above, not a tile trap.
        // 18% a return; species from the pit_trap table (recipes.json); the
        // haul is the carried share of a big carcass (400–1000 kcal), named
        // by species. A pit catch the player witnesses teaches the shape of
        // the pit (recipe L1) — the checkTraps learnability beat, through the
        // village's own hands instead of yours: the witnessed-catch bootstrap
        // that doesn't need a first pit of your own. No wound roll — they
        // know the craft (the goring beat in checkTraps is for YOUR pit).
        var _pitKcal = 0, _pitSpecies = null;
        // LUCK INSTRUMENTATION (rogue P0-6): record the honest pit roll.
        let _pitRoll = false;
        if (_knowsPit) {
          _pitRoll = R() < 0.18;
          try { this.luckRoll('pit', 0.18, _pitRoll); } catch (e) {}
        }
        if (_pitRoll) {
          var _pitTable = ['white_tailed_deer', 'white_tailed_deer', 'wild_boar', 'raccoon', 'opossum'];
          try {
            var _pitR = (this.data.recipes || []).find(function (r) { return r.id === 'pit_trap'; });
            if (_pitR && _pitR.catches && _pitR.catches.length) _pitTable = _pitR.catches;
          } catch (e) {}
          _pitSpecies = _pitTable[Math.floor(R() * _pitTable.length)];
          var _pitAn = null;
          try { _pitAn = (this.data.animals || []).find(function (a) { return a.id === _pitSpecies; }); } catch (e) {}
          var _pitName = (_pitAn && _pitAn.name) || _pitSpecies;
          _pitKcal = 400 + Math.floor(R() * 601);
          try { this.stockPantry(_pitKcal, 'Pit meat (' + _pitName + ')'); } catch (e) {}
          if (playerAtHaven) this.say(`🪤 ${nm} is back from the pit line: ${_pitName} in the pit — +${_pitKcal} kcal to the pantry.`);
          try { this.tele('npc_pit', { vid: vid, species: _pitSpecies, kcal: _pitKcal }); } catch (e) {}
          try {
            var _pitRk = ((this.state.codex || {}).recipes || {})['pit_trap'] || {};
            if (playerAtHaven && ((_pitRk.level || 0) < 1) && this.grantKnowledge) {
              this.grantKnowledge('recipe', 'pit_trap', 1, { type: 'witnessed', by: nm });
              this.say(`Watching ${nm} work the pit — the depth, the stakes, the brushed-over leaves — you finally see the shape of it. You could dig one now.`);
            }
          } catch (e) {}
        } else if (playerAtHaven && _knowsPit) {
          this.say(`🪤 ${nm} is back from the pit line. "Pit was quiet. They'll keep."`);
        }
        // TRAP TEACHING (structural 2026-10-10): a hunter who knows the wire
        // can SHOW you — once, and only if you've earned their regard (trust
        // 15+; strangers don't hand over their craft). Watching real hands
        // work a real snare teaches the shape of it: recipe L1 (seen — blind
        // 35% craft, materials at risk). Word of mouth is the canon pre-codex
        // channel; this is its trapping beat. Fires on the witnessed return,
        // never silently.
        try {
          var _rk = ((this.state.codex || {}).recipes || {})['snare'] || {};
          var _tr = (this.state.village.trust || {})[vid];
          if (_tr === undefined) _tr = 10;
          if (playerAtHaven && _knowsSnare && ((_rk.level || 0) < 1) && !_vp.taughtSnare && _tr >= 15) {
            _vp.taughtSnare = true;
            if (this.grantKnowledge) this.grantKnowledge('recipe', 'snare', 1, { type: 'taught', by: nm });
            this.say(`🪤 ${nm} catches you watching the snares come off the line. "...Want to actually SEE one?" They show you — the loop, the trigger stick, where the run narrows between the roots. "Opossum trails. Check at dawn. Always." Your hands don't know it yet. Your eyes do.`);
          }
        } catch (e) {}
        // PIT TEACHING (pitknowledge 2026-10-18): the same regard gate for
        // the pit — a trapper who knows it can SHOW you, once, and only if
        // you've earned their regard (trust 15+; strangers don't hand over
        // their craft). Watching real hands lay out a pit teaches the shape
        // of it: recipe L1 (seen — blind 35% craft, materials at risk). Word
        // of mouth is the canon pre-codex channel; this is its pit beat.
        // Fires on the witnessed return, never silently.
        try {
          var _pitRk2 = ((this.state.codex || {}).recipes || {})['pit_trap'] || {};
          var _tr2 = (this.state.village.trust || {})[vid];
          if (_tr2 === undefined) _tr2 = 10;
          if (playerAtHaven && _knowsPit && ((_pitRk2.level || 0) < 1) && !_vp.taughtPit && _tr2 >= 15) {
            _vp.taughtPit = true;
            if (this.grantKnowledge) this.grantKnowledge('recipe', 'pit_trap', 1, { type: 'taught', by: nm });
            this.say(`🪤 ${nm} catches you watching the pit line. "...Want to actually SEE one?" They walk you out to it — the depth, the sharpened stakes at the bottom, where the game trail runs. "Brush it over with leaves. And mark it well — your own pit will take you too." Your hands don't know it yet. Your eyes do.`);
            try { this.tele('pit_teach', { teacher: vid }); } catch (e) {}
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
        // TRIGGER REGISTRY (rogue P0-5): the witness shuffle + seeding lives
        // in the npc-triggers.js registry row 'return'.
        try { if (this.npcTrigger) this.npcTrigger(vid, 'return'); } catch (e) {}
      } else if (purpose === 'haul') {
        // HAUL return (villager-mapmem 2026-10-13): the carried meat lands
        // in the pantry as safe food (only known-safe meat was hauled), and
        // the village eats it through the normal meal system — closing the
        // loop the r12 run showed rotting open.
        // HAUL-UNREVEALED (Steve 2026-10-16): unknown flesh arrives as
        // 0-kcal testable items, NOT as pantry kcal. The knowledge law holds:
        // it is not food until someone runs the cautious test.
        // (r22: `ho` was declared AFTER this use — hoisted undefined, the
        // try/catch swallowed the TypeError, and hu was always null. The
        // unknown-flesh deposit never fired even when this branch ran.)
        var ho = this.objOf(vid);
        var hu = null;
        try { hu = ho.haulUnknown || null; ho.haulUnknown = null; } catch (e) {}
        if (hu && hu.length) {
          var vv = this.state.village;
          vv.pantry = vv.pantry || [];
          for (var hui = 0; hui < hu.length; hui++) {
            var hup = hu[hui];
            var hexist = (this.stacksMatch && vv.pantry.find(function (p) { return this.stacksMatch(p, hup); }.bind(this))) || null;
            if (hexist) {
              hexist.units = (hexist.units || 1) + (hup.units || 1);
              // MERGE HONESTY (journey-deepening r19 2026-10-19): hiddenKcal
              // is the value-bearing field on 0-kcal unknown flesh — the
              // reveal distributes it over ALL units. Sum it, or the second
              // haul's energy silently vanishes at reveal (measured: 2x1400
              // hauls merged revealed 560, not 1120).
              hexist.hiddenKcal = (hexist.hiddenKcal || 0) + (hup.hiddenKcal || 0);
            }
            else vv.pantry.push(hup);
          }
          if (playerAtHaven) this.say(`🥩 ${nm} is back with strange meat: unknown flesh in the pantry. "Test it cautiously before anyone eats."`);
          try { this.bumpTrust(vid, 1); } catch (e) {}
        }
        var hk = 0, hn = 'Hauled meat';
        try {
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
