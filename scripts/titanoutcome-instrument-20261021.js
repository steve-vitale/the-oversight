#!/usr/bin/env node
// titanoutcome-instrument-20261021.js — titan engagement-outcome census
// instrument (sim-titanoutcome, 2026-10-21, backlog #784, #749 family).
// DIAGNOSTIC — no lever.
//
// Adapted from scripts/killdisc-instrument-20261021.js (v2): same wrap
// contract — install(Game, t), uninstall; env-gated on TITANOUTCOME=1;
// all wraps call through, draw zero RNG, and write zero game state (the
// telemetry buffer t is the only write target). The game-side record it
// cross-checks against lives in src/js/titans.js (state.titans.outcomes:
// refused / fought / slain / fled / stood-down — pure log writes).
//
// What it captures, per titan encounter:
//   encounters[] — {day, titan, omenStage, musterAllies, havenBlades,
//     ready, need, have, started, fightId}: every startCombat call on a
//     titan mid (herald / finale / nielsen per src/data/titans.json).
//     started=false = the hard-gate refusal (tb-refused class).
//   tbOutcomes{} — fightId -> tbEnd result for titan fights, matched to
//     encounters by fightId ('won' -> slain, 'lost'/'fled' -> fled).
//   dissolves[] — tbBarrierExit fight-dissolve detection (succession /
//     game-over dissolves without tbEnd), same mirror as killdisc v2.
//   standdowns[] — titanStandDown calls (the evaded class).
//   census[] — daily state.titans snapshot: omen stages, muster sizes,
//     slain flags, outcomes-record length (read-only).
//
// crossCheck(Game, t): joins the instrument census to the game-side
// state.titans.outcomes records. Every instrument encounter must have a
// matching game-side record (refused <-> refused, fought <->
// fought/slain/fled) and every game-side record must have an instrument
// encounter. Residuals are returned as unexplained[] — the attribution
// gate watches this, never a friendlier metric.
//
// NOTE on determinism: tbfight.id contains Date.now() — used ONLY as an
// in-run map key, never written to per-seed JSON. Aggregates are
// RNG-determined and re-run byte-identical (proven by the proof test's
// det-gate).
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.TITANOUTCOME === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// titanMids(Game): the titan class mids from src/data/titans.json
// (herald / finale / nielsen), never hardcoded.
function titanMids(Game) {
  try {
    const raw = (Game.data && Game.data.titans) || {};
    return Object.keys(raw).filter(k => k.charAt(0) !== '_');
  } catch (e) { return []; }
}

function isTitanMid(Game, mid) {
  try { return titanMids(Game).indexOf(mid) >= 0; } catch (e) { return false; }
}

function musterSnap(Game, titanId) {
  const s = { omenStage: null, allies: null, haven: null, ready: null, need: null, have: null };
  try {
    const st = (Game.state || {}).titans || {};
    const o = (st.omens || {})[titanId] || null;
    s.omenStage = o ? (o.stage | 0) : null;
    const m = (st.musters || {})[titanId] || null;
    if (m) {
      s.allies = (m.allies || []).length;
      s.haven = (m.haven || []).length;
    }
    if (typeof Game.titanMusterReady === 'function') s.ready = !!Game.titanMusterReady(titanId);
    const def = ((Game.data || {}).titans || {})[titanId] || null;
    s.need = def ? (def.minAllies | 0) : null;
    s.have = s.allies;
  } catch (e) {}
  return s;
}

// classifyOutcome(enc, tbOutcomes): the per-encounter taxonomy.
// Returns one of: tb-refused | fought | slain | fled | evaded | dissolved
// | unresolved. 'unresolved' is the residual the attribution gate watches.
function classifyOutcome(enc, tbOutcomes) {
  try {
    if (!enc || typeof enc !== 'object') return 'unresolved';
    if (enc.stoodDown) return 'evaded';
    if (!enc.started) return 'tb-refused';
    const end = enc.fightId ? tbOutcomes[enc.fightId] : null;
    if (end === 'dissolved') return 'dissolved';
    if (end === 'won') return 'slain';
    if (end === 'lost' || end === 'fled') return 'fled';
    if (end) return 'fled'; // any other terminal result = the coalition did not win
    if (enc.dissolved) return 'dissolved';
    return 'unresolved';
  } catch (e) { return 'unresolved'; }
}

// crossCheck(Game, t): join instrument encounters to the game-side
// state.titans.outcomes records (both directions). Returns
// {matched, unexplained: [{side, ...}]}.
function crossCheck(Game, t) {
  const out = { matched: 0, unexplained: [] };
  try {
    const recs = (((Game.state || {}).titans || {}).outcomes || []).slice();
    const encs = (t.encounters || []).slice();
    const used = new Array(recs.length).fill(false);
    const recKey = (r) => (r.titan || '') + '@' + (r.day | 0);
    // index game-side records by titan@day
    const byKey = {};
    recs.forEach((r, i) => { (byKey[recKey(r)] = byKey[recKey(r)] || []).push(i); });
    for (const e of encs) {
      const want = e.started ? ['fought', 'slain', 'fled'] : (e.stoodDown ? ['stood-down'] : ['refused']);
      const cands = byKey[(e.titan || '') + '@' + (e.day | 0)] || [];
      let hit = -1;
      for (const i of cands) {
        if (used[i]) continue;
        if (want.indexOf(recs[i].outcome) >= 0) { hit = i; break; }
      }
      if (hit >= 0) { used[hit] = true; out.matched++; }
      else out.unexplained.push({ side: 'instrument', encounter: { day: e.day, titan: e.titan, started: e.started, stoodDown: !!e.stoodDown }, want });
    }
    recs.forEach((r, i) => {
      if (!used[i]) out.unexplained.push({ side: 'game-record', record: { day: r.day, titan: r.titan, outcome: r.outcome } });
    });
  } catch (e) { err(t, 'crossCheck', e); }
  return out;
}

// install(Game, t): installs the read-only wraps.
// t = {encounters, tbOutcomes, dissolves, standdowns, census, instrumentErrors}.
function install(Game, t) {
  if (!t.encounters) t.encounters = [];
  if (!t.tbOutcomes) t.tbOutcomes = {};
  if (!t.dissolves) t.dissolves = [];
  if (!t.standdowns) t.standdowns = [];
  if (!t.census) t.census = [];
  const orig = {};
  const wrap = (name, before, after) => {
    const o = Game[name];
    if (typeof o !== 'function') { err(t, 'install.missing:' + name, new Error('not a function')); return; }
    orig[name] = o;
    Game[name] = function () {
      let pre = null;
      try { if (before) pre = before.apply(this, arguments); } catch (e) { err(t, name + '.before', e); }
      let r;
      try { r = o.apply(this, arguments); } catch (e) { err(t, name + '.call', e); throw e; }
      try { if (after) after.call(this, r, pre, arguments); } catch (e) { err(t, name + '.after', e); }
      return r;
    };
  };

  // Titan engagement census: startCombat(mid) on a titan mid.
  wrap('startCombat',
    function (mid) {
      if (!isTitanMid(Game, mid)) return null;
      const snap = musterSnap(Game, mid);
      let beforeId = null;
      try { beforeId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { titan: mid, day: gday(Game), snap, beforeId };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        let afterId = null;
        try { afterId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
        const started = !!(afterId && afterId !== pre.beforeId);
        t.encounters.push({
          day: pre.day, titan: pre.titan,
          omenStage: pre.snap.omenStage, musterAllies: pre.snap.allies,
          havenBlades: pre.snap.haven, ready: pre.snap.ready,
          need: pre.snap.need, have: pre.snap.have,
          started, fightId: started ? afterId : null, stoodDown: false,
        });
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  // Titan fight end: tbEnd(result) — match by fightId, but only for fights
  // the titan wrapper marked (state.titans._fight set at startCombat time).
  // The titans wrapper nulls _fight AFTER origEnd; this instrument wraps
  // outside it, so the before-hook still sees the mark.
  wrap('tbEnd',
    function (result) {
      let mark = null, fightId = null;
      try { mark = ((Game.state || {}).titans || {})._fight || null; } catch (e) {}
      try { fightId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { titan: mark ? mark.titan : null, fightId, result: (result === undefined || result === null) ? 'unknown' : String(result) };
    },
    function (r, pre) {
      if (!pre || !pre.titan) return;
      try {
        if (pre.fightId) t.tbOutcomes[pre.fightId] = pre.result;
        else t.tbOutcomes['no-fight-id:' + pre.titan + ':' + pre.result] = (t.tbOutcomes['no-fight-id:' + pre.titan + ':' + pre.result] || 0) + 1;
      } catch (e) { err(t, 'tbEnd.push', e); }
    });

  // Fight-dissolve path: tbBarrierExit dissolves an in-progress fight when
  // the bearer changed (succession) or the game ended — tbfight.result =
  // 'dissolved' WITHOUT calling tbEnd. Mirror of killdisc v2's wrap.
  wrap('tbBarrierExit',
    function () {
      let f = null, bearer = null, over = false, mark = null;
      try { f = Game.tbfight || null; } catch (e) {}
      try { bearer = Game.villagerId; } catch (e) {}
      try { over = !!Game.over; } catch (e) {}
      try { mark = ((Game.state || {}).titans || {})._fight || null; } catch (e) {}
      return { fightId: f ? (f.id || null) : null, hadFight: !!f, bearer, over, titan: mark ? mark.titan : null };
    },
    function (r, pre) {
      if (!pre || !pre.fightId || !pre.hadFight || !pre.titan) return;
      try {
        if (t.tbOutcomes[pre.fightId]) return;
        if (Game.tbfight) return;
        let nb = null, nover = false;
        try { nb = Game.villagerId; } catch (e) {}
        try { nover = !!Game.over; } catch (e) {}
        if (nover || nb !== pre.bearer) {
          t.tbOutcomes[pre.fightId] = 'dissolved';
          t.dissolves.push({ day: gday(Game), titan: pre.titan, fightId: pre.fightId });
          // mark the matching encounter dissolved for the classifier
          for (const e of t.encounters) if (e.fightId === pre.fightId) e.dissolved = true;
        }
      } catch (e) { err(t, 'tbBarrierExit.push', e); }
    });

  // The evaded class: titanStandDown breaks an out-of-combat muster.
  // Call-through; records the call (day, titan, muster size before).
  wrap('titanStandDown',
    function (titanId) {
      const snap = musterSnap(Game, titanId);
      return { titan: titanId, day: gday(Game), snap };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        t.standdowns.push({
          day: pre.day, titan: pre.titan,
          musterAllies: pre.snap.allies, havenBlades: pre.snap.haven,
          broke: r === true,
        });
        if (r === true) t.encounters.push({
          day: pre.day, titan: pre.titan,
          omenStage: pre.snap.omenStage, musterAllies: pre.snap.allies,
          havenBlades: pre.snap.haven, ready: pre.snap.ready,
          need: pre.snap.need, have: pre.snap.have,
          started: false, fightId: null, stoodDown: true,
        });
      } catch (e) { err(t, 'titanStandDown.push', e); }
    });

  // Daily titans census (pure reads): omen stages, muster sizes, slain
  // flags, outcomes-record length — the state the census joins against.
  const origSleep = Game.sleep;
  if (typeof origSleep === 'function') {
    orig.sleep = origSleep;
    Game.sleep = function () {
      try {
        const day = gday(Game);
        const st = (Game.state || {}).titans || {};
        const omens = {}, musters = {}, slain = {};
        try {
          for (const k of Object.keys(st.omens || {})) omens[k] = (st.omens[k] || {}).stage | 0;
          for (const k of Object.keys(st.musters || {})) {
            const m = st.musters[k];
            musters[k] = m ? { allies: (m.allies || []).length, haven: (m.haven || []).length } : null;
          }
          for (const k of Object.keys(st.slain || {})) slain[k] = !!st.slain[k];
        } catch (e) { err(t, 'sleep.titans', e); }
        t.census.push({
          day, omens, musters, slain,
          outcomes: ((st.outcomes || []).length) | 0,
        });
      } catch (e) { err(t, 'sleep', e); }
      return origSleep.apply(this, arguments);
    };
  } else { err(t, 'install.missing:sleep', new Error('not a function')); }

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, classifyOutcome, crossCheck, titanMids, isTitanMid };
