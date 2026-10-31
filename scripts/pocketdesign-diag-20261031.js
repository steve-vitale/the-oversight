#!/usr/bin/env node
// pocketdesign-diag-20261031.js — pocket-call DESIGN-INPUTS instrument (sim-pocketdesign-a).
// MEASUREMENT ONLY. Env-gated on PDIAG=1. Contract: instrumentOn(),
// install(Game, t), uninstall; when unset the wrapper is never installed
// and the sim path is byte-identical to base.
//
// Installs ON TOP of ammo-diag + supply-diag + stickfiber-diag +
// pocketcall-diag (install those first). It wraps, call-through only:
//   - Game.fieldFight: a volley row for EVERY fight (all waves — the
//     low-wave volley spends are the top-up timing evidence pocketcall
//     could only probe post-hoc). Pre/post carried ammo maps, volley
//     copy, global event sequence number shared with pocket rows.
//   - Game.villagerPocketAmmo: a sequence row per invocation, so the
//     analyzer can interleave pockets and volley spends in true order
//     (day granularity alone cannot order same-day events).
//   - Game.startExpedition / Game.resolvePatrol: sat-out GATE
//     attribution (heal / sick / range / other, code order — see the
//     prereg). Pre-call raw reads (sick flag, HP, cached profile);
//     heal verdicts observed via the villagerHealCheck wrapper below.
//   - Game.villagerHealCheck: records return value tagged with the
//     in-progress departure id (null outside departures).
//   - Game.assignTask: patrol-assignment funnel rows (attempts only
//     for task === 'patrol'; other tasks ignored, never recorded).
//   - Game.objDepart (if present): context count of objective
//     departures (never pocket, never in the sat-out denominator).
//   - Game.expeditionReturn (if present): outing-end markers.
//
// READ-ONLY DISCIPLINE (same as ammo-diag/pocketcall-diag, stricter):
// - Draws NO RNG, writes NO game state, returns original results.
// - Never calls a Game method that initializes state: no npcNode,
//   no npcInside, no campPeopleIds, no partyMembers, no stashState,
//   no agencyState, no ensureVillagerPositions, no npcMaxDist, no
//   npcRangeProfile. RANGE is attributed by elimination (the only
//   remaining gate in code order), cross-checked against the RAW
//   cached profile (state.village.agency.profiles) only when one
//   already exists. Missing raw entries record null, never a default.
// - Never iterates the roster. The only roster-adjacent reads are
//   the fighter's own records and the crew array a fight already
//   carries (via the PC instrument, not here).
// - Every catch reports into t.pdErrors (never thrown, never silent).
//
// Pure functions (shared with the analyzer, single source of truth):
// - attributeGate(d): d = {kind, healObserved, healTrue, sickBefore}
//   -> 'heal' | 'sick' | 'range' | 'other' (code order; patrol has
//   no sick/range gates, so patrol + heal-false + sick-false is
//   'other' by construction).
// - nodeDelta(a, b): {manhattan, chebyshev} or nulls.
'use strict';

const AMMO_IDS = ['arrow', 'bolt', 'stone', 'fusion_cell', 'heartseeker_arrows'];

function instrumentOn() { return process.env.PDIAG === '1'; }

function err(t, where, e) {
  try { t.pdErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function vpOf(Game, vid) {
  try {
    const data = Game.data || {};
    return (data.villagers || []).find(x => x && x.id === vid) ||
      (data.background_survivors || []).find(x => x && x.id === vid) || null;
  } catch (e) { return null; }
}

function ammoMap(items) {
  const out = {};
  for (const id of AMMO_IDS) out[id] = 0;
  try {
    for (const e of (items || [])) {
      const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
      if (eid && AMMO_IDS.indexOf(eid) !== -1) out[eid] += (typeof e === 'string') ? 1 : (e.units || 1);
    }
  } catch (e) {}
  return out;
}

// attributeGate: code order, SITE-AWARE. healTrue observed during the
// call wins; else (startExpedition only) sick flag at entry; else
// (startExpedition only) range by elimination; a patrol sat-out with
// heal false is 'other' — resolvePatrol has no sick/range gates, so
// such a row means the pocket call threw or an invocation was missed,
// and it must stay visible, never folded into a gate that never ran.
function attributeGate(d) {
  if (d && d.healTrue) return 'heal';
  if (d && d.kind === 'startExpedition' && d.sickBefore) return 'sick';
  if (d && d.kind === 'startExpedition') return 'range';
  return 'other';
}

function nodeDelta(a, b) {
  if (!a || !b || typeof a.nx !== 'number' || typeof a.ny !== 'number' ||
      typeof b.nx !== 'number' || typeof b.ny !== 'number') return { manhattan: null, chebyshev: null };
  const dx = Math.abs(a.nx - b.nx), dy = Math.abs(a.ny - b.ny);
  return { manhattan: dx + dy, chebyshev: Math.max(dx, dy) };
}

function install(Game, t) {
  if (!t.pdVolleyRows) t.pdVolleyRows = [];
  if (!t.pdPocketSeq) t.pdPocketSeq = [];
  if (!t.pdDepartures) t.pdDepartures = [];
  if (!t.pdHealCalls) t.pdHealCalls = [];
  if (!t.pdAssigns) t.pdAssigns = [];
  if (!t.pdObjDeparts) t.pdObjDeparts = [];
  if (!t.pdReturns) t.pdReturns = [];
  if (!t.pdErrors) t.pdErrors = [];
  if (typeof t.pdSeq !== 'number') t.pdSeq = 0;
  if (typeof t.pdDepSeq !== 'number') t.pdDepSeq = 0;
  t._pdCurDep = null;

  const pocketCountFor = (vid) => {
    let n = 0;
    try { for (const p of (t.pocketCalls || [])) if (p.vid === vid) n++; } catch (e) {}
    return n;
  };

  const uninstalls = [];
  const wrap = (name, fn, optional) => {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') {
        if (optional) {
          try { (t.pdOptionalMissing = t.pdOptionalMissing || []).push(name); } catch (e) {}
        } else err(t, 'install.missing:' + name, new Error('not a function'));
        return;
      }
      Game[name] = fn(orig);
      uninstalls.push(function () { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { err(t, 'install:' + name, e); }
  };

  // villagerHealCheck: tag returns with the in-progress departure id.
  wrap('villagerHealCheck', (orig) => function () {
    let hpBefore = null, vid = null;
    try { vid = arguments[0] !== undefined && arguments[0] !== null ? String(arguments[0]) : null; } catch (e) {}
    try { const h = ((Game.state || {}).village || {}).health || {}; hpBefore = (vid && h[vid] !== undefined) ? h[vid] : null; } catch (e) {}
    const r = orig.apply(this, arguments);
    try {
      const dep = t._pdCurDep;
      t.pdHealCalls.push({ depId: dep ? dep.id : null, day: gday(Game), vid,
        ret: !!r, hpBefore });
    } catch (e) { err(t, 'heal.after', e); }
    return r;
  });

  // villagerPocketAmmo: sequence row per invocation (true event order).
  wrap('villagerPocketAmmo', (orig) => function () {
    let vid = null, seq = 0;
    try { vid = arguments[0] !== undefined && arguments[0] !== null ? String(arguments[0]) : null; } catch (e) {}
    try { seq = ++t.pdSeq; } catch (e) {}
    const r = orig.apply(this, arguments);
    try { t.pdPocketSeq.push({ seq, day: gday(Game), vid }); } catch (e) { err(t, 'pocket.after', e); }
    return r;
  });

  // fieldFight: volley row for EVERY fight (all waves).
  // NOTE (instrument v2): the wrapper MUST be a named function
  // expression `fieldFight` — ammo-diag's callerOf skips frames named
  // '.fieldFight', and an anonymous wrapper assigned via the generic
  // wrap() helper shows as Object.<anonymous>, which callerOf then
  // misreads as the caller (v1 screen corpus: every ranged fight
  // read caller other:Object.<anonymous>). Naming it restores the
  // skip. Verified on the v2 screen re-run (caller classes named).
  wrap('fieldFight', (orig) => function fieldFight(vid, mdef, m, opts) {
    let seq = 0, preCarried = null, mid = null, wave = 0;
    try { seq = ++t.pdSeq; } catch (e) {}
    try {
      mid = (mdef && mdef.id) || null;
      const WF = require('./w4field-instrument-20261030.js');
      wave = mid ? WF.waveOf(Game, mid) : 0;
    } catch (e) { err(t, 'fight.wave', e); }
    try { const vp = vpOf(Game, vid); preCarried = ammoMap(vp ? vp.items : []); } catch (e) {}
    const r = orig.apply(this, arguments);
    try {
      const vp = vpOf(Game, vid);
      const postCarried = ammoMap(vp ? vp.items : []);
      const vol = (r && typeof r === 'object' && r.volley) ? {
        shots: r.volley.shots !== undefined ? r.volley.shots : null,
        hits: r.volley.hits !== undefined ? r.volley.hits : null,
        dmg: r.volley.dmg !== undefined ? r.volley.dmg : null,
        ammoLeft: r.volley.ammoLeft !== undefined ? r.volley.ammoLeft : null } : null;
      t.pdVolleyRows.push({ seq, day: gday(Game),
        vid: (vid === undefined || vid === null) ? null : String(vid),
        mid, wave, volley: vol, preCarried, postCarried,
        outcome: (r && typeof r === 'object' && r.outcome) || null });
    } catch (e) { err(t, 'fight.after', e); }
    return r;
  });

  // Departure sites: gate attribution.
  for (const kind of ['startExpedition', 'resolvePatrol']) {
    wrap(kind, (orig) => function () {
      let vid = null;
      try { vid = arguments[0] !== undefined && arguments[0] !== null ? String(arguments[0]) : null; } catch (e) {}
      const depId = ++t.pdDepSeq;
      let prePocket = 0, sickBefore = false, hpBefore = null, cachedProfile = null;
      let preVolleyLen = 0, depSeq = 0;
      try { depSeq = ++t.pdSeq; } catch (e) {}
      try { preVolleyLen = (t.pdVolleyRows || []).length; } catch (e) {}
      try { prePocket = pocketCountFor(vid); } catch (e) {}
      try { sickBefore = !!(((Game.state || {}).village || {}).sick || {})[vid]; } catch (e) {}
      try { const h = ((Game.state || {}).village || {}).health || {}; hpBefore = (vid && h[vid] !== undefined) ? h[vid] : null; } catch (e) {}
      try {
        const ag = ((Game.state || {}).village || {}).agency || null;
        cachedProfile = (ag && ag.profiles && vid) ? (ag.profiles[vid] || null) : null;
      } catch (e) {}
      const prevDep = t._pdCurDep;
      t._pdCurDep = { id: depId, vid, kind };
      let r;
      try { r = orig.apply(this, arguments); }
      finally { t._pdCurDep = prevDep; }
      try {
        const postPocket = pocketCountFor(vid);
        const pocketDelta = postPocket - prePocket;
        const went = pocketDelta > 0;
        let awayAfter = false, expedAfter = false;
        try {
          const v = (Game.state || {}).village || {};
          awayAfter = !!((v.away || {})[vid]);
          const ag = v.agency || null;
          expedAfter = !!(ag && ag.exped && ag.exped[vid]);
        } catch (e) {}
        let healObserved = false, healTrue = false, healCalls = 0;
        try {
          for (const h of (t.pdHealCalls || [])) {
            if (h.depId === depId) { healObserved = true; healCalls++; if (h.ret) healTrue = true; }
          }
        } catch (e) {}
        const gate = went ? null : attributeGate({ kind, healObserved, healTrue, sickBefore });
        // RANGE cross-check: cached profile (raw read only) implies a
        // maxD; explorer 6 / wanderer 3 / forager 1 / homebody 0.
        let cachedMaxD = null;
        try {
          if (cachedProfile === 'explorer') cachedMaxD = 6;
          else if (cachedProfile === 'wanderer') cachedMaxD = 3;
          else if (cachedProfile === 'forager') cachedMaxD = 1;
          else if (cachedProfile === 'homebody') cachedMaxD = 0;
        } catch (e) {}
        const integrity = [];
        if (healTrue && went) integrity.push('heal-true-but-went');
        if (went && kind === 'startExpedition' && !awayAfter && !expedAfter) integrity.push('went-without-away');
        if (!went && gate === 'range' && cachedMaxD !== null && cachedMaxD >= 1) integrity.push('range-attributed-but-cached-maxD>=1');
        let volleyDuring = 0;
        const volleyDuringWaves = [];
        let volleyDuringRanged = false, volleyDuringShots = 0;
        try {
          for (let i = preVolleyLen; i < (t.pdVolleyRows || []).length; i++) {
            const vr = t.pdVolleyRows[i];
            if (vr.vid !== vid) continue;
            volleyDuring++;
            volleyDuringWaves.push(vr.wave | 0);
            if (vr.volley) { volleyDuringRanged = true; volleyDuringShots += (vr.volley.shots || 0); }
          }
        } catch (e) {}
        t.pdDepartures.push({ seq: depSeq, day: gday(Game), vid, kind, went, pocketDelta,
          gate, healObserved, healTrue, healCalls, sickBefore, hpBefore,
          cachedProfile, cachedMaxD, awayAfter, expedAfter, integrity, volleyDuring,
          volleyDuringWaves, volleyDuringRanged, volleyDuringShots });
      } catch (e) { err(t, 'departure.after:' + kind, e); }
      return r;
    });
  }

  // assignTask: patrol-assignment funnel (patrol attempts only).
  wrap('assignTask', (orig) => function (vid, task, opts) {
    const isPatrol = (task === 'patrol');
    const r = orig.apply(this, arguments);
    try {
      if (isPatrol) {
        let assignedAfter = false;
        try {
          const a = (((Game.state || {}).village || {}).assignments || {})[vid];
          assignedAfter = !!(a && a.task === 'patrol');
        } catch (e) {}
        let retOk = null, retRefused = null;
        try {
          if (r && typeof r === 'object') {
            if (typeof r.ok === 'boolean') retOk = r.ok;
            if (typeof r.refused === 'boolean') retRefused = r.refused;
          }
        } catch (e) {}
        t.pdAssigns.push({ day: gday(Game),
          vid: (vid === undefined || vid === null) ? null : String(vid),
          assignedAfter, retOk, retRefused });
      }
    } catch (e) { err(t, 'assign.after', e); }
    return r;
  });

  // objDepart: context count only (never in the sat-out denominator).
  // Optional: if the method is absent on this base, record the miss
  // (not an instrument error) and continue without the context count.
  wrap('objDepart', (orig) => function () {
    const r = orig.apply(this, arguments);
    try {
      let vid = null;
      try { vid = arguments[0] !== undefined && arguments[0] !== null ? String(arguments[0]) : null; } catch (e) {}
      t.pdObjDeparts.push({ day: gday(Game), vid });
    } catch (e) { err(t, 'objDepart.after', e); }
    return r;
  }, true);

  // expeditionReturn: outing-end markers (sequence-tagged, same counter).
  wrap('expeditionReturn', (orig) => function () {
    let seq = 0;
    try { seq = ++t.pdSeq; } catch (e) {}
    const r = orig.apply(this, arguments);
    try {
      let vid = null;
      try { vid = arguments[0] !== undefined && arguments[0] !== null ? String(arguments[0]) : null; } catch (e) {}
      t.pdReturns.push({ seq, day: gday(Game), vid });
    } catch (e) { err(t, 'expeditionReturn.after', e); }
    return r;
  }, true);

  return function uninstall() {
    for (const u of uninstalls) { try { u(); } catch (e) {} }
    try { t._pdCurDep = null; } catch (e) {}
  };
}

module.exports = { instrumentOn, install, attributeGate, nodeDelta };
