// trickcensus-instrument-20261104.js — trick/ability availability census
// (arm sim-trickcensus-a, run fleshout-20261104T0215Z, axis scale-onramp).
// DIAG-ONLY, scripts only, zero src/js. Builds on the tbfinish instrument
// (turn economy, kill linkage, damage ledger) and adds, without touching
// any game code:
//  - ROUND-1 CAPTURE (tbfinish's pending-buffer spec): this instrument's
//    player-action wraps sit OUTSIDE the tbfinish wraps. During the
//    startCombat opening pass the exposure does not exist yet, so an
//    action whose fight has no exposure yet is buffered as pending and
//    attached to the exposure the startCombat post-call creates.
//    Actions in a live exposure are NOT buffered (exposure exists).
//  - TRICK INVENTORY at fight start and fight end: scholar System
//    abilities held, activatable combat actions (id/available/why),
//    monsterCounterKnown / villageKnowsTrick / villagerTricks /
//    villageCounterObs / villageSlain for the fought kind, the bar's
//    trick count, and waveCombatReadiness(5) — all pure reads.
//  - TELE capture of counter_discovered / counter_observed /
//    skill_taught events (source channel for learned tricks).
//  - DAILY SNAPSHOTS (driver calls snapshotDaily from policy.daily):
//    readiness-5 bars + standing breakdown + trick-state census.
//    The snapshot NEVER calls villageStandingTotal() or unlockedWave()
//    (both record the peak / fire beats); villageStanding() is the
//    pure breakdown the ready5 instrument already used.
// All wraps are call-through and RNG-neutral; every catch reports into
// t.instrumentErrors, never silently. Source attribution honesty:
// trick knowledge in this engine is VILLAGE state (monsterCounters,
// villagerTricks, villageCounterObs), not per-villager state — a
// fighter's personal inventory is therefore scholar abilities + gear;
// village-known tricks are reported at village level, and any
// per-villager source the engine does not store is reported as
// "unknown, needs instrument", never invented.
'use strict';
const TBFIN = require('./tbfinish-instrument-20261103');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}
function compactAbilities(Game) {
  try {
    const list = ((Game.state || {}).scholar || {}).abilities || [];
    return list.map(function (a) {
      if (typeof a === 'string') return { id: a };
      if (a && typeof a === 'object') return { id: a.id || null, level: (a.level != null ? a.level : null), source: (a.source || a.via || null) };
      return { id: null };
    });
  } catch (e) { return null; }
}
function compactActivatables(Game) {
  try {
    if (typeof Game.activatableAbilities !== 'function') return null;
    const out = Game.activatableAbilities() || [];
    return out.map(function (a) {
      return { id: (a && (a.id || (a.abilityId + '.' + a.actionId))) || null,
        abilityId: (a && a.abilityId) || null, actionId: (a && a.actionId) || null,
        available: !!(a && a.available), why: (a && a.why) || null };
    });
  } catch (e) { return { error: String(e.message).slice(0, 80) }; }
}
function trickStateFor(Game, mid) {
  const s = { mid: mid || null };
  try { s.monsterCounterKnown = (typeof Game.monsterCounterKnown === 'function') ? !!Game.monsterCounterKnown(mid) : null; } catch (e) { s.monsterCounterKnown = null; }
  try { s.villageKnowsTrick = (typeof Game.villageKnowsTrick === 'function') ? !!Game.villageKnowsTrick(mid) : null; } catch (e) { s.villageKnowsTrick = null; }
  try { s.villagerTricks = !!(((Game.state || {}).villagerTricks || {})[mid]); } catch (e) { s.villagerTricks = null; }
  try { s.villageCounterObs = (((Game.state || {}).villageCounterObs || {})[mid] | 0); } catch (e) { s.villageCounterObs = null; }
  try { s.villageSlain = (((Game.state || {}).villageSlain || {})[mid] | 0); } catch (e) { s.villageSlain = null; }
  try {
    const defs = (typeof Game.villagerTrickDefs === 'function') ? Game.villagerTrickDefs() : {};
    s.hasSigDef = !!(defs && defs[mid]);
    s.sigTrick = (defs && defs[mid] && defs[mid].trick) || null;
  } catch (e) { s.hasSigDef = null; }
  try {
    const mdef = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    s.hasCounterField = !!(mdef && mdef.counter);
    s.counterKind = (mdef && mdef.counter && mdef.counter.kind) || null;
    s.wave = mdef ? (mdef.wave || null) : null;
  } catch (e) { s.hasCounterField = null; }
  return s;
}
function barTrickCount(Game) {
  try {
    const mc = ((Game.state || {}).monsterCounters) || {};
    let n = 0; const ids = [];
    for (const mid of Object.keys(mc)) {
      if (typeof Game.monsterCounterKnown === 'function' && Game.monsterCounterKnown(mid)) { n++; ids.push(mid); }
    }
    return { count: n, ids: ids };
  } catch (e) { return { count: null, ids: null }; }
}
function readiness(Game, w) {
  try { return Game.waveCombatReadiness ? Game.waveCombatReadiness(w) : null; } catch (e) { return null; }
}
function captureInventory(Game, mid) {
  return {
    day: dayOf(Game), mid: mid || null,
    scholarAbilities: compactAbilities(Game),
    activatables: compactActivatables(Game),
    trick: mid ? trickStateFor(Game, mid) : null,
    barTricks: barTrickCount(Game),
    readiness5: readiness(Game, 5),
    readiness4: readiness(Game, 4),
  };
}

function install(Game) {
  const base = TBFIN.install(Game);
  const t = base.t;
  t.trickEvents = [];
  t.actionAvailLog = [];
  t.daily = [];
  t.endInventory = null;
  const orig = {};
  let pending = [];
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }

  function exposureForFight(fight) {
    if (!fight) return null;
    for (let i = t.exposures.length - 1; i >= 0; i--) {
      if (t.exposures[i].fightId === fight.id) return t.exposures[i];
    }
    return null;
  }
  function availSnapshot() {
    try { return compactActivatables(Game); } catch (e) { return null; }
  }
  function logAvail(fnName) {
    try {
      const fight = Game.tbfight || null;
      if (!fight) return;
      const ex = exposureForFight(fight);
      // Only log inside a wave-4+ TB fight (exposure, or the pending
      // opening pass of one: fight monsters include a wave-4 kind).
      let isW4 = false;
      if (ex) isW4 = true;
      else {
        try {
          isW4 = (fight.fighters || []).some(function (f) {
            const mid = ((f.mdef || {}).id || f.monsterId || f.id) || null;
            return f && f.kind === 'monster' && mid && waveOf(Game, mid) === 4;
          });
        } catch (e) {}
      }
      if (!isW4) return;
      t.actionAvailLog.push({
        day: dayOf(Game), fightId: fight.id || null, seq: ex ? ex.seq : null,
        round: (fight.round != null ? fight.round : null), fn: fnName,
        turnIndex: ex ? ex.turns.length : -1,
        activatables: availSnapshot(), scholarAbilities: compactAbilities(Game),
      });
    } catch (e) { err('logAvail', e); }
  }

  // --- tele: counter / skill-taught channels ---
  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'counter_discovered' || type === 'counter_observed' || type === 'skill_taught') {
          t.trickEvents.push({ day: dayOf(Game), type: type, id: (data && (data.id || data.ability)) || null,
            via: (data && (data.via || data.source)) || null, n: (data && data.n) != null ? data.n : null,
            vid: (data && (data.vid || data.who)) || null });
        }
      } catch (e) { err('tele.post', e); }
      return r;
    };
  } else { t.notes.push('tele not a function at install'); }

  // --- player actions (OUTER wraps): pending round-1 buffer + availability log ---
  const ACTION_FNS = ['tbPlayerStrike', 'tbPlayerMove', 'tbPlayerWait', 'tbPlayerStudy',
    'tbPlayerShout', 'tbPlayerOfferFood', 'tbPlayerTalk', 'tbPlayerRally',
    'tbPlayerWarCry', 'tbPlayerFlip', 'tbPlayerEndTurn', 'tbBarrierExit', 'useAbility'];
  ACTION_FNS.forEach(function (fnName) {
    if (typeof Game[fnName] !== 'function') { t.notes.push(fnName + ' not a function at trickcensus install'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      count('tc-' + fnName);
      // Pending test runs BEFORE the inner (tbfinish) wrap: during the
      // startCombat opening pass no exposure exists for this fight yet.
      let pendRec = null;
      try {
        const fight = Game.tbfight || null;
        if (fight && !exposureForFight(fight)) {
          const isW4 = (fight.fighters || []).some(function (f) {
            const mid = ((f.mdef || {}).id || f.monsterId || f.id) || null;
            return f && f.kind === 'monster' && mid && waveOf(Game, mid) === 4;
          });
          if (isW4 && pending.length < 20) {
            pendRec = { fn: fnName, round: (fight.round != null ? fight.round : null),
              args: Array.prototype.slice.call(arguments, 0, 2).map(function (a) {
                try { return (a && typeof a === 'object') ? '[obj]' : String(a); } catch (e) { return '[?]'; }
              }) };
            pending.push(pendRec);
          }
        }
      } catch (e) { err(fnName + '.pending', e); }
      logAvail(fnName);
      let r, threw = null;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { threw = e; }
      try { if (pendRec) pendRec.returned = threw ? ('THREW:' + String(threw.message).slice(0, 60)) : (r === undefined ? null : r); } catch (e) {}
      if (threw) throw threw;
      return r;
    };
  });

  // --- startCombat (OUTER): attach pending + start inventory ---
  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function () {
      count('tc-startCombat');
      const beforeCount = t.exposures.length;
      pending = [];
      let r, threw = null;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { threw = e; }
      try {
        const added = t.exposures.slice(beforeCount);
        for (const ex of added) {
          ex.round1Actions = pending.slice();
          ex.trickInventoryStart = captureInventory(Game, ex.mid);
        }
        if (!added.length) pending = [];
      } catch (e) { err('startCombat.post', e); }
      if (threw) throw threw;
      return r;
    };
  }

  // --- tbEnd (OUTER): attach end inventory ---
  if (typeof Game.tbEnd === 'function') {
    orig.tbEnd = Game.tbEnd;
    Game.tbEnd = function () {
      count('tc-tbEnd');
      const fight = Game.tbfight || null;
      const exBefore = fight ? exposureForFight(fight) : null;
      let r, threw = null;
      try { r = orig.tbEnd.apply(this, arguments); } catch (e) { threw = e; }
      try { if (exBefore) exBefore.trickInventoryEnd = captureInventory(Game, exBefore.mid); } catch (e) { err('tbEnd.post', e); }
      if (threw) throw threw;
      return r;
    };
  }

  function snapshotDaily() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.readiness5 = readiness(Game, 5); } catch (e) { snap.readiness5 = null; }
    try { snap.readiness4 = readiness(Game, 4); } catch (e) { snap.readiness4 = null; }
    try { snap.standing = Game.villageStanding ? Game.villageStanding() : null; } catch (e) { snap.standing = null; }
    try { snap.capped = Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; } catch (e) { snap.capped = null; }
    try { snap.peak = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) { snap.peak = null; }
    try { snap.barTricks = barTrickCount(Game); } catch (e) { snap.barTricks = null; }
    try {
      const vt = ((Game.state || {}).villagerTricks) || {};
      snap.villagerTrickKinds = Object.keys(vt).filter(function (k) { return !!vt[k]; });
    } catch (e) { snap.villagerTrickKinds = null; }
    try { snap.villageCounterObs = Object.assign({}, ((Game.state || {}).villageCounterObs) || {}); } catch (e) { snap.villageCounterObs = null; }
    try { snap.scholarAbilities = compactAbilities(Game); } catch (e) { snap.scholarAbilities = null; }
    try {
      const slain = ((Game.state || {}).villageSlain) || {};
      snap.villageSlainW4 = {};
      for (const mid of Object.keys(slain)) { if (waveOf(Game, mid) === 4) snap.villageSlainW4[mid] = slain[mid]; }
    } catch (e) { snap.villageSlainW4 = null; }
    t.daily.push(snap);
    return snap;
  }

  function finalInventory() {
    const inv = { day: dayOf(Game), kinds: {}, scholarAbilities: compactAbilities(Game),
      barTricks: barTrickCount(Game), readiness5: readiness(Game, 5) };
    try {
      for (const mdef of (Game.data.monsters || [])) {
        if (!mdef || (mdef.wave !== 4 && mdef.wave !== 5)) continue;
        inv.kinds[mdef.id] = trickStateFor(Game, mdef.id);
      }
    } catch (e) { err('finalInventory', e); }
    t.endInventory = inv;
    return inv;
  }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshotDaily: snapshotDaily, finalInventory: finalInventory, uninstall: uninstall,
    captureInventory: captureInventory, trickStateFor: trickStateFor, barTrickCount: barTrickCount };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf,
  captureInventory: captureInventory, trickStateFor: trickStateFor, barTrickCount: barTrickCount };
