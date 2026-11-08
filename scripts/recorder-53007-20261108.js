// recorder-53007-20261108.js — the 53007 DIAG recorder
// (arm sim-53007-a, run fleshout-20261108T1622Z). Scripts only, zero src/js.
// Wraps the sitstep instrument snapshot (same pattern as the doorwalk
// driver's own snapshot extension) and adds ONE pure-read `diag` object
// per daily row: pantry + food-days + sickness/wounds/hunger in camp +
// pellet holder. No existing instrument records pantry or sickness-in-camp
// per day — that is why this recorder exists.
//
// PURE READS ONLY: pantryKcalLive is a reduce over pantry items;
// villageFoodDays/villageDailyNeed read burnHistory; village.sick and
// village.health are plain maps; hunger reads the needs map DIRECTLY
// (never npcNeeds(), which lazily initialises entries); the pellet holder
// is a plain state field. No writes, no RNG draws, no game-state mutation.
// Neutrality is proven, not assumed: scripts/test-53007-a.js G2 compares
// armed vs unrecorded trajectories on identical seeds.
// Usage: const REC = require('./recorder-53007-20261108');
//   const inst = INST.install(Game); REC.install(Game, inst);
//   ... inst.snapshot() per day ... inst.uninstall(); REC.uninstall() is a no-op
//   (the wrap rides inst.snapshot, restored by inst.uninstall()).
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function nameOf(Game, vid) {
  try {
    if (typeof Game.npcName === 'function') return String(Game.npcName(vid) || 'Someone').split(' ')[0];
  } catch (e) {}
  try {
    const p = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; });
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return 'Someone';
}

function diagRow(Game) {
  const d = { pantryKcal: null, foodDays: null, sickN: null, sickList: null, woundedN: null, woundedList: null, hungryN: null, needsTracked: null, pelletHolder: null, pelletPassDay: null };
  try {
    const v = (Game.state || {}).village || {};
    try { d.pantryKcal = (typeof Game.pantryKcalLive === 'function') ? Math.round(Game.pantryKcalLive(v) || 0) : null; } catch (e) { d.pantryKcal = null; }
    try { d.foodDays = (typeof Game.villageFoodDays === 'function') ? Math.round((Game.villageFoodDays() || 0) * 10) / 10 : null; } catch (e) { d.foodDays = null; }
    try {
      const sick = v.sick || {};
      const ids = Object.keys(sick);
      d.sickN = ids.length;
      d.sickList = ids.map(function (vid) {
        const s = sick[vid] || {};
        return { vid: vid, name: nameOf(Game, vid), disease: s.name || null, daysLeft: (s.daysLeft != null) ? s.daysLeft : null };
      });
    } catch (e) { d.sickN = null; d.sickList = null; }
    try {
      const health = v.health || {};
      const living = ((Game.data || {}).villagers || []).filter(function (p) { return p && !p.dead; });
      const wounded = [];
      living.forEach(function (p) {
        const hp = (health[p.id] !== undefined) ? health[p.id] : 100;
        if (hp < 100) wounded.push({ vid: p.id, name: nameOf(Game, p.id), hp: hp });
      });
      d.woundedN = wounded.length;
      d.woundedList = wounded;
    } catch (e) { d.woundedN = null; d.woundedList = null; }
    try {
      const needs = v.needs || {};
      const keys = Object.keys(needs);
      d.needsTracked = keys.length;
      let hungry = 0;
      keys.forEach(function (vid) { if (((needs[vid] || {}).hunger || 0) > 70) hungry += 1; });
      d.hungryN = hungry;
    } catch (e) { d.hungryN = null; d.needsTracked = null; }
    try {
      const h = Game.state.fusionReactorHolder || null;
      d.pelletHolder = (h && h.who === 'villager') ? h.vid : ((h && h.who) ? String(h.who) : null);
    } catch (e) { d.pelletHolder = null; }
    try {
      const pp = Game.state.pelletPass || null;
      d.pelletPassDay = (pp && pp.lastPassDay != null) ? pp.lastPassDay : null;
    } catch (e) { d.pelletPassDay = null; }
  } catch (e) {
    // A diag failure must never break the snapshot: the row keeps nulls and
    // the error is surfaced through the instrument error channel by the
    // driver (see install: errors pushed to t.instrumentErrors).
    d._error = String(e && e.message ? e.message : e).slice(0, 80);
  }
  return d;
}

function install(Game, inst) {
  if (!inst || typeof inst.snapshot !== 'function') throw new Error('recorder-53007: inst.snapshot required');
  const t = inst.t || {};
  const origSnapshot = inst.snapshot;
  inst.snapshot = function () {
    const snap = origSnapshot();
    try {
      snap.diag = diagRow(Game);
      if (snap.diag && snap.diag._error) {
        try { (t.instrumentErrors || (t.instrumentErrors = [])).push('diag-53007: ' + snap.diag._error); } catch (e) {}
        delete snap.diag._error;
      }
    } catch (e) {
      try { (t.instrumentErrors || (t.instrumentErrors = [])).push('diag-53007-wrap: ' + String(e.message).slice(0, 80)); } catch (e2) {}
      snap.diag = null;
    }
    return snap;
  };
  return inst;
}

module.exports = { install: install, diagRow: diagRow };
