#!/usr/bin/env node
// seatblow-instrument-20261017.js — the sim-seatblow feasted-blow attribution
// instrument (flesh-out loop, axis scale-onramp, 2026-10-17, diagnostic).
//
// MEASUREMENT ONLY: read-only attach to the engine (wrappers call through and
// record; none touches RNG, logic, or save state). Shared by the sweep
// (scripts/sweep-seatblow-20261017.js) and the proof test
// (scripts/test-seatblow-20261017.js). No top-level side effects — safe to
// require from any process. No game dependency (pure + wrappers).
//
// WHAT IT ATTRIBUTES: every foodDeeds-crediting event — each
// noteFeastedCombatUse() call that actually marks prog.feastSurgeUsed — gets
// {actor, feasted, via, target}. Credit sites (verified in code this run):
//   - game.js:33674 (tbDamage FEASTED hook): player-sourced strike/ability
//     damage vs a monster/hostile while feasted. The scholar's strike calls
//     tbDamage(t.key, d, 'you', null, ...) — scholar convention is
//     sourceLabel='you'/sourceKey=null (or sourceKey 'p'/'player').
//   - feastBuff.js:328 (applyFeastedForm): any ability resolved in combat
//     while feasted counts as real use. Abilities are scholar-only (single
//     entry point for the player's 6-slot abilities; no villager caller).
//   - debug-scenarios.js:174 sets feastSurgeUsed directly — debug only,
//     never in sims; not attributed.
//
// PAIRING: tbDamage and applyFeastedForm push frames on a stack;
// noteFeastedCombatUse() pairs with the innermost live frame (exact under
// synchronous nesting; trickfunnel #434 lesson: hook the funnel, not the
// fight start). A note with no live frame is via='unframed'/actor='unknown'
// — the diagnostic's honest MISS path (PRIMARY: 100% attribution).
'use strict';

const RING_CAP = 80;
const RING_LEN = 220;
const BEAT_CAP = 2000;
// UPLIFT_BEAT: the WEAPON lines only (game.js:33673) — "FEASTED ×N: the feast
// was the weapon." / "OVERCHARGED ×N (well-fed): food is fuel." The feast-grant
// announcements ("FEASTED ×N until <dawn>...") and the foodPower status line
// are NOT weapon events; an earlier broad regex contaminated the bucket with
// grant announcements (fixed 2026-10-17).
const UPLIFT_BEAT = /the feast was the weapon\.|OVERCHARGED ×[\d.]+ \(well-fed\): food is fuel\./;
const TABLE_BEAT = /THE TABLE|galactic table|take your seat|take the seat|invitation|walk the path|table path|the seat is|seat is earned|tableWaiting|tableScene/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// classifyActor(sourceKey, sourceLabel): pure. The scholar's conventions:
// sourceKey 'p'/'player', or the strike convention (sourceLabel 'you',
// sourceKey null). Villagers (allies are villagers, 2026-10-13) fight under
// 'v_<rid>'. Monsters under 'm_<n>'. Anything else is 'unknown' — the
// diagnostic MISS path, never guessed.
function classifyActor(sourceKey, sourceLabel) {
  if (sourceKey === 'p' || sourceKey === 'player') return 'scholar';
  if ((sourceKey === null || sourceKey === undefined) && sourceLabel === 'you') return 'scholar';
  if (typeof sourceKey === 'string' && sourceKey.indexOf('v_') === 0) return 'villager';
  if (typeof sourceKey === 'string' && sourceKey.indexOf('m_') === 0) return 'monster';
  return 'unknown';
}

// speciesOf: the #405 apexpredators recipe — canonical monster id from the
// fighter's mdef (never a prose alias).
function speciesOf(monsterId, defs) {
  if (!monsterId || !defs) return null;
  const d = defs.find(m => m && m.id === monsterId);
  if (!d) return null;
  return { name: d.name || monsterId, wave: (d.wave | 0) || null };
}

function attachSeatblowCapture(Game) {
  const cap = {
    errors: 0,
    noteEvents: [],      // every noteFeastedCombatUse() call
    upliftEvents: [],    // every FEASTED × / OVERCHARGED × say (weapon events)
    buffGrants: [],      // grantFeastBuff calls {day}
    beats: [],           // table/invitation beats
    seatEver: false, seatDay: null, seatKind: 'none', seatDetailEnd: null,
    inviteEver: false, inviteDay: null,
    pathTaken: null, branchTaken: null, phaseEnd: null,
    tableDone: false, won: false,
    maxRank: 0, arcMax: 0,
    feastSurgeUsedEnd: false, sentimentTaughtEnd: false,
    sdSeatTaken: 0, sdSeatDay: null,
    samples: 0,
  };
  const frames = [];
  const ring = [];
  const defs = (() => { try { return (Game.data && Game.data.monsters) || []; } catch (e) { return []; } })();

  function pushRing(kind, text) {
    try {
      ring.push({ day: gday(Game), kind: kind, text: String(text || '').slice(0, RING_LEN) });
      if (ring.length > RING_CAP) ring.splice(0, ring.length - RING_CAP);
    } catch (e) {}
  }
  function surgeUsed() {
    try { return !!(((Game.state || {}).scholar || {}).prog || {}).feastSurgeUsed; } catch (e) { return false; }
  }
  function feastedNow() {
    try { return !!(typeof Game.feastedActive === 'function' && Game.feastedActive()); } catch (e) { return false; }
  }
  function fighterOf(key) {
    try { return (typeof Game.tbFighter === 'function' && key != null) ? Game.tbFighter(key) : null; } catch (e) { return null; }
  }

  // --- tbDamage: the funnel. Push the actor/target frame, pop in finally.
  const _tbDamage = Game.tbDamage.bind(Game);
  Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
    let frame = null;
    try {
      frame = { type: 'dmg', sourceKey: sourceKey, sourceLabel: sourceLabel, targetKey: targetKey, day: gday(Game) };
      frames.push(frame);
    } catch (e) { cap.errors++; }
    try {
      return _tbDamage(targetKey, dmg, sourceLabel, sourceKey, opts);
    } finally {
      try { if (frame) frames.pop(); } catch (e) {}
    }
  };

  // --- applyFeastedForm: the ability-resolution credit path (scholar-only).
  let _aff = null;
  if (typeof Game.applyFeastedForm === 'function') {
    _aff = Game.applyFeastedForm.bind(Game);
    Game.applyFeastedForm = function (abilityId, actionId, target, preHp) {
      let frame = null;
      try { frame = { type: 'form', abilityId: abilityId, actionId: actionId, target: target, day: gday(Game) }; frames.push(frame); }
      catch (e) { cap.errors++; }
      try { return _aff(abilityId, actionId, target, preHp); }
      finally { try { if (frame) frames.pop(); } catch (e) {} }
    };
  }

  // --- noteFeastedCombatUse: THE credit event. Pair with innermost frame.
  const _note = Game.noteFeastedCombatUse.bind(Game);
  Game.noteFeastedCombatUse = function () {
    let ev = null;
    try {
      const wasMarked = surgeUsed();
      const frame = frames.length ? frames[frames.length - 1] : null;
      const r = _note();
      const nowMarked = surgeUsed();
      ev = {
        day: gday(Game),
        marked: nowMarked && !wasMarked,
        feasted: feastedNow(),
        via: frame ? (frame.type === 'form' ? 'feasted-form' : 'tbDamage-hook') : 'unframed',
        actor: 'unknown', actorDetail: null,
        targetKind: null, targetMid: null, targetName: null, targetWave: null,
        fighterKind: null, // independent cross-check: tbFighter(sourceKey).kind
        abilityId: frame && frame.type === 'form' ? (frame.abilityId || null) : null,
        contextBeats: ring.slice(-12).map(b => ({ day: b.day, text: b.text })),
      };
      if (frame && frame.type === 'dmg') {
        ev.actor = classifyActor(frame.sourceKey, frame.sourceLabel);
        ev.actorDetail = { sourceKey: frame.sourceKey == null ? null : String(frame.sourceKey), sourceLabel: frame.sourceLabel == null ? null : String(frame.sourceLabel) };
        try {
          const f = fighterOf(frame.sourceKey);
          if (f) ev.fighterKind = f.kind || null;
        } catch (e) {}
        try {
          const t = fighterOf(frame.targetKey);
          if (t) {
            ev.targetKind = t.kind || null;
            const mid = (t.mdef && t.mdef.id) || null;
            ev.targetMid = mid;
            const sp = speciesOf(mid, defs);
            if (sp) { ev.targetName = sp.name; ev.targetWave = sp.wave; }
          }
        } catch (e) {}
      } else if (frame && frame.type === 'form') {
        ev.actor = 'scholar'; // abilities are scholar-only by construction
        ev.actorDetail = { path: 'ability-resolution' };
      }
      cap.noteEvents.push(ev);
      return r;
    } catch (e) { cap.errors++; if (ev) cap.noteEvents.push(ev); }
  };

  // --- grantFeastBuff: count buff arming windows.
  if (typeof Game.grantFeastBuff === 'function') {
    const _gfb = Game.grantFeastBuff.bind(Game);
    Game.grantFeastBuff = function (feast) {
      let r = null;
      try { r = _gfb(feast); } catch (e) { cap.errors++; throw e; }
      try { cap.buffGrants.push({ day: gday(Game) }); } catch (e) {}
      return r;
    };
    cap._gfb = _gfb;
  }

  // --- say / sysSay: uplift weapon events + ring buffer + table beats.
  const _say = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      pushRing('say', s);
      if (UPLIFT_BEAT.test(s)) {
        const frame = frames.length ? frames[frames.length - 1] : null;
        const actor = frame && frame.type === 'dmg' ? classifyActor(frame.sourceKey, frame.sourceLabel) : 'unknown';
        cap.upliftEvents.push({
          day: gday(Game), kind: s.indexOf('FEASTED') !== -1 ? 'feasted' : 'overcharged',
          actor: actor,
          sourceKey: frame ? (frame.sourceKey == null ? null : String(frame.sourceKey)) : null,
          sourceLabel: frame ? (frame.sourceLabel == null ? null : String(frame.sourceLabel)) : null,
          text: s.slice(0, 120), // auditability: proves the line is a weapon line
        });
      }
      if (TABLE_BEAT.test(s) && cap.beats.length < BEAT_CAP) cap.beats.push({ day: gday(Game), text: s.slice(0, 400) });
    } catch (e) { cap.errors++; }
    return _say(t);
  };
  let _sysSay = null;
  if (typeof Game.sysSay === 'function') {
    _sysSay = Game.sysSay.bind(Game);
    Game.sysSay = function (t) {
      try {
        const s = String(t || '');
        pushRing('sys', s);
        if (TABLE_BEAT.test(s) && cap.beats.length < BEAT_CAP) cap.beats.push({ day: gday(Game), text: '[sys] ' + s.slice(0, 400) });
      } catch (e) { cap.errors++; }
      return _sysSay(t);
    };
  }

  // --- daily pure-read sample (called by the sweep after policy.daily).
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  function sample() {
    try {
      cap.samples++;
      const d = gday(Game);
      let seat = 'none', detail = null;
      try { const ts = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null; if (ts) { seat = ts.seat || 'none'; detail = ts.detail || null; } } catch (e) {}
      if (seat !== 'none' && !cap.seatEver) { cap.seatEver = true; cap.seatDay = d; cap.seatKind = seat; }
      if (seat !== 'none') cap.seatKind = seat;
      cap.seatDetailEnd = detail;
      let pg = {};
      try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
      if (pg.tableWaiting && !cap.inviteEver) { cap.inviteEver = true; cap.inviteDay = d; }
      if (pg.tableDone) cap.tableDone = true;
      let T = {};
      try { T = Game.tableState ? Game.tableState() : {}; } catch (e) {}
      if (T.path) { cap.pathTaken = T.path; cap.branchTaken = T.branch || null; }
      cap.phaseEnd = T.phase || cap.phaseEnd;
      try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; cap.maxRank = Math.max(cap.maxRank, RANK_ORDER[r] || 0); } catch (e) {}
      try { const a = pg.arc || 0; if (a > cap.arcMax) cap.arcMax = a; } catch (e) {}
      cap.feastSurgeUsedEnd = surgeUsed();
      try { cap.sentimentTaughtEnd = !!pg.sentimentTaught; } catch (e) {}
      if (Game.won) cap.won = true;
    } catch (e) { cap.errors++; }
  }

  function finish(ctx) {
    try {
      if (ctx) {
        cap.sdSeatTaken = (ctx.sdSeatTaken | 0);
        cap.sdSeatDay = ctx.sdSeatDay != null ? ctx.sdSeatDay : null;
      }
    } catch (e) {}
    return cap;
  }

  function restore() {
    Game.tbDamage = _tbDamage;
    if (_aff) Game.applyFeastedForm = _aff;
    Game.noteFeastedCombatUse = _note;
    if (cap._gfb) Game.grantFeastBuff = cap._gfb;
    Game.say = _say;
    if (_sysSay) Game.sysSay = _sysSay;
  }

  return { capture: cap, sample: sample, finish: finish, restore: restore };
}

module.exports = { attachSeatblowCapture: attachSeatblowCapture, classifyActor: classifyActor, speciesOf: speciesOf, UPLIFT_BEAT: UPLIFT_BEAT };
