// @ontology
// system: npc-triggers
// description: Declarative trigger registry for villager AI. Event names map to ordered handler lists (and optional hard gates); game code dispatches through npcTrigger(vid, event, data) instead of calling transition functions directly. Day-one content is a pure mechanical move of the existing trigger sites — zero behavior change — so future triggers (feasts, contest outcomes, mid-trip interrupts) become registry rows instead of transition-function edits.
// provides:
//   - npcTrigger(vid, event, data)
// rules:
//   - registry_is_dispatch_only: npcTrigger adds no control flow of its own — handlers and gates run with `this` = the Game object, in row order, exactly as the code they were moved from; a throwing handler propagates exactly as the original inline code did (code: npc-triggers.js)
//   - zero_behavior_change_p05: the day-one rows ('death', 'deed', 'departure', 'return', 'table_sits', 'expedition_launch') are verbatim moves of the pre-existing trigger sites; no new triggers, no weight/threshold edits, no dormant-motivation wiring (code: npc-triggers.js, villager-agency.js, villager-objectives.js)
//   - table_sanctity_gate: the 'table_sits' row keeps tableActive() as a hard gate — while the table sits, expeditions meet nothing (code: npc-triggers.js, villager-agency.js expeditionMonster)
//   - unknown_events_noop: dispatching an unregistered event is a silent no-op returning false (chain-safe) (code: npc-triggers.js)
// consumes:
//   - village.roster, village.gossip, village.npcViewership
//   - codex.deeds, scholar.day
//   - seedGossip(...), recordMoment(...), broadcastLine(...), displayName(...), say(...)
//   - agencyState(...), objVillageDanger(...), tableActive(...)
//   - objOf(...), objDanger(...) — the 'gossip' row re-runs departure danger
//     for in-flight objectives (rogue P1 mid-trip re-targeting)
/* NPC TRIGGERS — src/js/npc-triggers.js
 *
 * Roguelike Celebration 2026 audit, Talk 2 (Savant, Modular Motivations),
 * proposal P2-1 (P0-5): "Declarative trigger registry." HIGHEST value /
 * LOWEST effort. The talk's core technique: NPC reactivity = states +
 * triggers, not full AI — and every game system is a potential trigger
 * source. The game already HAD the triggers (monster gossip → objDanger,
 * rain → danger, deaths → gossip+grief, sickness/heal gates, pantry/cistern
 * → objective weights, deeds → Codex+board+broadcast, knowledge → SEEK,
 * table state standing down expeditions) but they were hardcoded transition
 * functions — a list you could grep, not a mechanism. Adding a trigger
 * source meant editing transition functions.
 *
 * This module is the mechanism: a declarative table keyed by event name.
 * Each row lists which systems react (the ordered handler list) and which
 * fields gate it. Game code dispatches through npcTrigger(vid, event, data).
 *
 * DAY ONE IS A PURE REFACTOR — ZERO BEHAVIOR CHANGE. The rows below are
 * verbatim moves of the existing trigger sites:
 *   'death'            <- expedDeath's gossip + moment + grief voice (villager-agency.js)
 *   'deed'             <- recordDeed's three-channel surfacing: deed ledger,
 *                         living Codex, contest viewership board, broadcast,
 *                         gossip, moment, overheard say (villager-agency.js)
 *   'departure'        <- departure gossip seeding, two witnesses
 *                         (objDepart in villager-objectives.js,
 *                          startExpedition in villager-agency.js)
 *   'return'           <- return gossip seeding, two witnesses
 *                         (objReturnEffect in villager-objectives.js,
 *                          expeditionReturn in villager-agency.js)
 *   'table_sits'       <- TABLE SANCTITY hard gate: tableActive() stands
 *                         down expeditionMonster (villager-agency.js)
 *   'expedition_launch'<- village-danger expedition-launch gate:
 *                         objVillageDanger() >= 4 (villager-agency.js agencyTick)
 *   'gossip'           <- ROGUE P1 (Talk 2 G2/P2-3): seedGossip dispatches;
 *                         the row's handler re-runs objDanger for in-flight
 *                         objectives on high-severity gossip
 *                         (attack/murder/death/raid); a 'defer' verdict flips
 *                         out→returning via the existing return path, with a
 *                         narrated cause. New row, not a P0-5 move.
 *
 * Polled conditions (objDanger's gossip/weather reads, objPick's
 * pantry/knowledge reads, the sick/heal gates inside objMaybeDepart) stay
 * where they are — they are polled, not pushed, and making them
 * event-driven is future work (P2-4 weather / contest-outcome triggers).
 * P2-3 (mid-trip re-targeting) is event-driven now via the 'gossip' row.
 * The P0-5 rows above are NOT new triggers here.
 *
 * Self-attaching module. Load after villager-agency.js (uses agencyState
 * at dispatch time, never at load). Handlers run at game time with
 * `this` bound to the Game object, so load order vs. the call sites is
 * unconstrained.
 */
(function () {
  'use strict';
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  var R = Math.random;

  // ---------- row handlers: verbatim moves, one trigger site each ----------

  // 'death' row — moved verbatim from expedDeath (villager-agency.js).
  // The death bookkeeping (registerDeath, removeVillager, clearing
  // exped/away) stays in expedDeath; the TRIGGER reactions (gossip +
  // moment + grief voice) live here.
  function deathGossip(vid, d) {
    try { this.seedGossip('death', { who: vid }, []); } catch (e) {}
  }
  function deathMoment(vid, d) {
    try { this.recordMoment(`${d.nm} didn't come back. ${d.mName}.`); } catch (e) {}
  }
  function deathGriefSay(vid, d) {
    if (d.playerAtHaven) this.say(`🕯️ Word comes back with a torn pack and no ${d.nm.split(' ')[0]}. ${d.mName}, out past the ridge. The fire is quieter tonight.`);
  }

  // 'deed' row — moved verbatim from recordDeed (villager-agency.js).
  // recordDeed keeps its signature and resolves the magnitude (DEED_MAG
  // lives in villager-agency.js scope); the row receives d.mag.
  function deedLog(vid, d) {
    var st = this.agencyState();
    st.ach.push({ vid: vid, type: d.type, text: d.text, mag: d.mag, day: this.state.scholar.day });
    if (st.ach.length > 50) st.ach = st.ach.slice(-50);
  }
  function deedCodex(vid, d) {
    var nm = '';
    try { nm = this.displayName(vid); } catch (e) { nm = 'Someone'; }
    // 1. codex entry — the village's memory, in the book
    try {
      var cx = this.state.codex = this.state.codex || {};
      cx.deeds = cx.deeds || [];
      cx.deeds.unshift({ vid: vid, type: d.type, text: d.text, mag: d.mag, day: this.state.scholar.day });
      cx.deeds = cx.deeds.slice(0, 40);
    } catch (e) {}
  }
  function deedBoard(vid, d) {
    // 2. contest viewership — the board moves
    try {
      var vv = this.state.village;
      vv.npcViewership = vv.npcViewership || {};
      vv.npcViewership[vid] = (vv.npcViewership[vid] || 0) + Math.max(1, Math.round(d.mag / 2));
    } catch (e) {}
  }
  function deedBroadcast(vid, d) {
    // 3. broadcast — the big ones air
    if (d.mag >= 8) { try { this.broadcastLine(d.text); } catch (e) {} }
  }
  function deedGossip(vid, d) {
    // the village's respect: deeds move reputation along social lines
    try {
      var dims = {};
      if (d.type === 'monster_kill' || d.type === 'stood_down') dims.brave = 8;
      if (d.type === 'cache_haul') dims.generous = 6;
      if (d.type === 'rescue') { dims.brave = 6; dims.generous = 6; }
      if (d.type === 'mapped_far') dims.brave = 4;
      // GRAPEVINE (journey social r39 2026-10-22): deed gossip was seeded
      // heard-less and who-less — born dead on both counts. spreadGossip
      // only iterates g.heard as tellers and askAbout only serves gossip
      // the speaker has heard, so a heard-less entry could never travel
      // (measured: 255 deed entries born heard-less across 4 runs, 0 ever
      // gained a hearer). And who-less gossip is the PLAYER channel: the
      // fallback render says "word is YOU..." and rep pays to the hearer,
      // so an NPC's kill would credit the player. The doer tells it
      // themself plus one witness (same pattern as departure/return
      // gossip), and dims.who names the doer so rep and rendering
      // attribute the deed correctly.
      dims.who = vid;
      var _vw = this.state.village || {};
      var _seen = (_vw.roster || []).filter(function (id) { return id !== vid && id !== this.villagerId; }, this);
      var _wit = _seen.length ? _seen[Math.floor(R() * _seen.length)] : null;
      var _heard = [vid].concat(_wit ? [_wit] : []);
      this.seedGossip('deed', dims, _heard);
    } catch (e) {}
  }
  function deedMoment(vid, d) {
    // the show notices big plays — the audience is watching
    if (d.mag >= 8) { try { this.recordMoment(d.text); } catch (e) {} }
  }
  function deedOverhear(vid, d) {
    // if you're at Haven, you hear about it. That's the outshining:
    // not a popup saying "an NPC is better than you" — just the village
    // talking, and you overhearing.
    var v = this.state.village;
    var hx = v.px ?? 4, hy = v.py ?? 4;
    var atHaven = false;
    try { atHaven = (this.map.px === hx && this.map.py === hy); } catch (e) {}
    if (atHaven && d.mag >= 4 && R() < 0.7) this.say('📣 ' + d.text);
  }

  // 'departure' row — moved verbatim from objDepart (villager-objectives.js)
  // and startExpedition (villager-agency.js). Both seeded 'departure' gossip
  // with the same witness filter + shuffle; the dims differ per site and
  // arrive in d.dims.
  function announceDeparture(vid, d) {
    try {
      var v = this.state.village;
      var seen = (v.roster || []).filter(function (id) { return id !== vid && id !== this.villagerId; }, this);
      var shuf = seen.slice();
      for (var i = shuf.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = shuf[i]; shuf[i] = shuf[j]; shuf[j] = t; }
      this.seedGossip('departure', d.dims, shuf.slice(0, 2));
    } catch (e) {}
  }

  // 'return' row — moved verbatim from expeditionReturn (villager-agency.js)
  // and objReturnEffect (villager-objectives.js). Same pattern: the return
  // is news — two witnesses so the rumor can travel.
  function announceReturn(vid, d) {
    try {
      var v = this.state.village;
      var seen = (v.roster || []).filter(function (id) { return id !== vid && id !== this.villagerId; }, this);
      var shuf = seen.slice();
      for (var i = shuf.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = shuf[i]; shuf[i] = shuf[j]; shuf[j] = t; }
      this.seedGossip('return', { who: vid }, shuf.slice(0, 2));
    } catch (e) {}
  }

  // 'gossip' row — ROGUE P1 (mid-trip re-targeting; audit Talk 2 G2/P2-3).
  // High-severity gossip is event-driven now, not polled: villagers mid-trip
  // re-run objDanger and turn back when the new verdict is 'defer' — the
  // same bar that would have kept them home. Fixed start (the gossip),
  // flexible middle (each villager's own danger read), fixed end (the
  // existing out→returning path: objAwayStep walks them home, the base
  // return clock brings them in, objReturnEffect narrates the arrival).
  //
  // SEVERITY is read off the existing gossip fields, never invented: the
  // set is objDanger's own danger-gossip ('attack', 'murder', 'death') plus
  // 'raid' — a raid warning is danger, and objDanger counts it since this
  // row. (No 'monster sighting' gossip action exists; sightings arrive as
  // 'attack'/'death'.) No RNG, no mood rolls — the flip is a legible
  // consequence of the news.
  var GOSSIP_RETARGET_SEVERE = { attack: 1, murder: 1, death: 1, raid: 1 };

  function gossipCauseLine(action, dims) {
    // render the news as the fiction the turn-back cites — the narrated
    // cause (no silent actions). Reads only existing gossip fields.
    if (action === 'death' && dims.who) {
      var nm = 'Someone';
      try { nm = this.displayName(dims.who).split(' ')[0]; } catch (e) {}
      return 'word that ' + nm + ' didn\'t come back';
    }
    if (action === 'murder') return 'word that someone was killed';
    if (action === 'raid') {
      if (dims.raiders != null) return 'word that raiders are on the move (' + dims.raiders + ' of them)';
      return 'word of a raid';
    }
    return 'word of an attack out in the wilds'; // 'attack'
  }

  function gossipRetargetInFlight(vid, d) {
    // RETARGET_GATE=0 (testing only): restore the old polled behavior —
    // gossip never interrupts a trip. Lets the proof test show before/after.
    if (typeof process !== 'undefined' && process.env && process.env.RETARGET_GATE === '0') return;
    var action = (d && d.action) || '';
    if (!GOSSIP_RETARGET_SEVERE[action]) return; // low-severity gossip: no interrupt
    var v = (this.state || {}).village || {};
    var roster = v.roster || [];
    if (!roster.length) return;
    var hx = (v.px == null ? 4 : v.px), hy = (v.py == null ? 4 : v.py);
    var flips = [];
    var flipped = {};
    for (var i = 0; i < roster.length; i++) {
      var rid = roster[i];
      if (rid === this.villagerId) continue;
      var o = null;
      try { o = this.objOf(rid); } catch (e) { continue; }
      if (!o || o.state !== 'out') continue; // in-flight objectives only
      if (o.kind === 'LEAVE') continue; // the desperate don't do danger checks — same as departure
      try { var ast = this.agencyState(); if (ast.exped && ast.exped[rid]) continue; } catch (e) {}
      var dg = null;
      try { dg = this.objDanger(rid, o.tx, o.ty, hx, hy); } catch (e) { continue; }
      if (!dg || dg.verdict !== 'defer') continue; // the same bar that would have kept them home
      flips.push(rid); flipped[rid] = 1;
    }
    // they came out together, they turn back together: one hop along the
    // companion link (leader↔guard), no verdict needed — the pairing is the cause.
    for (var j = 0; j < roster.length; j++) {
      var gid = roster[j];
      if (flipped[gid] || gid === this.villagerId) continue;
      var go = null;
      try { go = this.objOf(gid); } catch (e) { continue; }
      if (!go || go.state !== 'out') continue;
      if (go.companion && flipped[go.companion]) { flips.push(gid); flipped[gid] = 1; }
    }
    if (!flips.length) return;
    var cause = 'word of trouble';
    try { cause = gossipCauseLine.call(this, action, (d && d.dims) || {}); } catch (e) {}
    var names = [];
    for (var k = 0; k < flips.length; k++) {
      var fo = null;
      try { fo = this.objOf(flips[k]); } catch (e) { continue; }
      if (!fo) continue;
      fo.state = 'returning'; // the existing return path takes it from here
      fo.retreatCause = cause; // the return stays explainable in fiction
      var fnm = 'Someone';
      try { fnm = this.displayName(flips[k]).split(' ')[0]; } catch (e) {}
      names.push(fnm);
    }
    // narrate the cause. Presence-gated like the other objective lines: the
    // village hears the news at the fire; the return itself narrates on arrival.
    var playerAtHaven = false;
    try { playerAtHaven = (this.map.px === hx && this.map.py === hy); } catch (e) {}
    if (playerAtHaven && names.length) {
      var who = names.length === 1 ? names[0]
        : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
      var verb = names.length === 1 ? 'turns' : 'turn';
      this.say('⚠️ ' + cause.charAt(0).toUpperCase() + cause.slice(1) + ' reaches the trail — ' + who + ' ' + verb + ' back for Haven.');
    }
  }

  // ---------- row gates: verbatim predicates, moved not rewritten ----------

  // 'table_sits' gate — verbatim predicate from the expeditionMonster gate
  // (villager-agency.js). TABLE SANCTITY (2026-10-12, Steve): while the
  // table sits, the world holds its breath — expeditions meet nothing out
  // there. The village is at the table or watching it; every stake is the
  // table's own.
  function gateTableSits(vid, d) {
    return !!(this.tableActive && this.tableActive());
  }
  // 'expedition_launch' gate — verbatim predicate from the agencyTick
  // expedition-launch gate (villager-agency.js).
  function gateExpeditionDanger(vid, d) {
    return !!(this.objVillageDanger && this.objVillageDanger() >= 4);
  }

  // ---------- the declarative table ----------

  var NPC_TRIGGER_REGISTRY = {
    'death': {
      source: 'expedDeath (villager-agency.js) — a villager dies on expedition',
      reacts: ['gossip:death', 'moment', 'grief voice at the fire'],
      gate: null,
      handlers: [deathGossip, deathMoment, deathGriefSay],
    },
    'deed': {
      source: 'recordDeed (villager-agency.js) — a villager does something real',
      reacts: ['deed ledger', 'living Codex', 'contest viewership board', 'broadcast', 'gossip:deed', 'moment', 'overheard say'],
      gate: null,
      handlers: [deedLog, deedCodex, deedBoard, deedBroadcast, deedGossip, deedMoment, deedOverhear],
    },
    'departure': {
      source: 'objDepart (villager-objectives.js), startExpedition (villager-agency.js) — a villager leaves',
      reacts: ['gossip:departure (two witnesses)'],
      gate: null,
      handlers: [announceDeparture],
    },
    'return': {
      source: 'expeditionReturn (villager-agency.js), objReturnEffect (villager-objectives.js) — a villager comes home',
      reacts: ['gossip:return (two witnesses)'],
      gate: null,
      handlers: [announceReturn],
    },
    'table_sits': {
      source: 'table state — TABLE SANCTITY (2026-10-12, Steve)',
      reacts: ['expedition stand-down: expeditionMonster meets nothing'],
      gate: gateTableSits,
      handlers: [],
    },
    'expedition_launch': {
      source: 'agencyTick expedition launch (villager-agency.js)',
      reacts: ['expedition launch gate: village danger >= 4'],
      gate: gateExpeditionDanger,
      handlers: [],
    },
    'gossip': {
      source: 'seedGossip (game.js) — any gossip source; ROGUE P1 mid-trip re-targeting (audit Talk 2 G2/P2-3)',
      reacts: ['in-flight objectives re-run objDanger on high-severity gossip; defer verdict flips out→returning (narrated)'],
      gate: gateTableSits, // TABLE SANCTITY: the same hard gate — while the table sits, no mid-trip re-targeting
      handlers: [gossipRetargetInFlight],
    },
  };

  // ---------- the dispatch ----------

  function npcTrigger(vid, event, data) {
    // Dispatch an event through the registry. Returns true when a gate row
    // halted the caller (the caller returns/continues on true), false
    // otherwise. Pure dispatch: no added control flow — gates and handlers
    // run with `this` = the Game object, in row order, exactly as the code
    // they were moved from, so a throwing handler propagates exactly as the
    // original inline code did. Unknown events are a silent no-op
    // (chain-safe: a missing row never breaks the caller).
    var row = NPC_TRIGGER_REGISTRY[event];
    if (!row) return false;
    var d = data || {};
    if (row.gate) { if (row.gate.call(G, vid, d)) return true; }
    var hs = row.handlers || [];
    for (var i = 0; i < hs.length; i++) hs[i].call(G, vid, d);
    return false;
  }

  G.npcTrigger = npcTrigger;
  // exposed for debugging and for the future P1 rows (dormant motivations,
  // mid-trip re-targeting); the dispatch above is the only caller in game code.
  G.npcTriggerRegistry = NPC_TRIGGER_REGISTRY;
})();
