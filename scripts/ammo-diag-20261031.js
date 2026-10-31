#!/usr/bin/env node
// ammo-diag-20261031.js — Stage 1 ammo diagnosis instrument (sim-ammo-a).
// MEASUREMENT ONLY. Env-gated on AMMODIAG=1. Contract: instrumentOn(),
// install(Game, t), uninstall; when unset the wrapper is never installed
// and the sim path is byte-identical to base.
//
// The wrapper is call-through: it reads state before/after the call,
// draws NO RNG, writes NO game state, and returns the original record
// object untouched (only a copy of its log is kept — never live arrays).
//
// Wraps: Game.fieldFight (wave >= 4 fights recorded in full with a
// volley-time ammo census; lower-wave fights counted only) and
// Game.villagerPocketAmmo (every departure pocketing call recorded with
// pre/post carried ammo and the returned result).
//
// READ-ONLY DISCIPLINE (learned from prior arms):
// - Never calls Game.stashState() (it initializes defaults — a write).
//   Pile materials come from the raw state.village.stash.materials
//   object, or null when absent. Labeled rawStashMaterials.
// - Never calls Game.agencyState() (it initializes sub-objects).
//   Departure state comes from raw state.village.agency.exped,
//   state.village.away, and Game._outdoorCrew. All guarded reads.
// - Never calls npcNode / partyMembers / ensureVillagerPositions
//   (initialization risk, per sim-w4party-a).
// - Stack capture is read-only (new Error().stack, function names only,
//   paths stripped). It names the fieldFight caller class, which is the
//   whole point: pocketing only runs at departure sites, so WHICH caller
//   produced a dry fight decides the verdict.
//
// Every catch reports into t.instrumentErrors (never thrown, never
// silent). A null gear read is recorded as null, not an error.
'use strict';

const AMMO_IDS = ['arrow', 'bolt', 'stone', 'fusion_cell', 'heartseeker_arrows'];
const KNOWN_CALLERS = ['expeditionMonster', 'resolveWildMonsterEncounter',
  'resolvePatrol', 'aidFight', 'contestEngine', 'fieldFight'];

function instrumentOn() { return process.env.AMMODIAG === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
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

function stashAmmoMap(stashed) {
  return ammoMap(stashed);
}

function equipOf(Game) {
  try { return (globalThis.S && globalThis.S.equipment) || (globalThis.Scattering && globalThis.Scattering.S && globalThis.Scattering.S.equipment) || null; } catch (e) { return null; }
}

function rangedInfo(Game, vp) {
  const out = { rangedWeaponId: null, rangedAmmoId: null, equippedRangedId: null };
  try {
    if (vp && vp.equipped && vp.equipped.ranged) out.equippedRangedId = vp.equipped.ranged.itemId || vp.equipped.ranged.id || null;
  } catch (e) {}
  try {
    const eq = equipOf(Game);
    const items = (Game.data && Game.data.items) || [];
    if (eq && eq.rangedWeaponOf && vp) {
      const rw = eq.rangedWeaponOf(vp, items);
      if (rw) {
        out.rangedWeaponId = rw.itemId || rw.id || null;
        const def = items.find(d => d.id === out.rangedWeaponId);
        out.rangedAmmoId = (def && def.weapon && def.weapon.ammo) || null;
      }
    }
  } catch (e) {}
  if (!out.rangedWeaponId && out.equippedRangedId) {
    // Fall back to the equipped weapon when rangedWeaponOf is unavailable.
    out.rangedWeaponId = out.equippedRangedId;
    try {
      const items = (Game.data && Game.data.items) || [];
      const def = items.find(d => d.id === out.rangedWeaponId);
      out.rangedAmmoId = (def && def.weapon && def.weapon.ammo) || null;
    } catch (e) {}
  }
  return out;
}

function rawPile(Game) {
  try {
    const st = ((Game.state || {}).village || {}).stash || null;
    if (!st) return null;
    const m = st.materials || null;
    if (!m) return null;
    // Only the pocketing-relevant materials, to keep rows small.
    return { stone: m.stone || 0, stick: m.stick || 0, fiber: m.fiber || 0, branch: m.branch || 0 };
  } catch (e) { return null; }
}

function ammoCraftOf(Game, vid) {
  try {
    const ac = (((Game.state || {}).village || {}).ammoCraft || {})[vid] || null;
    return ac ? JSON.parse(JSON.stringify(ac)) : null;
  } catch (e) { return null; }
}

function departOf(Game, vid) {
  const out = { onExpedition: false, expedDist: null, away: false, outdoorCrew: false };
  try {
    const v = (Game.state || {}).village || {};
    const ag = v.agency || null;
    if (ag && ag.exped && ag.exped[vid]) { out.onExpedition = true; out.expedDist = ag.exped[vid].dist || null; }
    if (v.away && v.away[vid]) out.away = true;
    const crew = Game._outdoorCrew || [];
    if (Array.isArray(crew) && crew.indexOf(vid) !== -1) out.outdoorCrew = true;
  } catch (e) {}
  return out;
}

function callerOf() {
  const out = { callerClass: 'other', callerFrames: [] };
  try {
    const stack = (new Error().stack || '').split('\n').slice(1);
    const frames = [];
    for (const line of stack) {
      const m = line.match(/at\s+([A-Za-z0-9_$.<>]+)/);
      if (m) frames.push(m[1]);
    }
    out.callerFrames = frames.slice(0, 8);
    for (const f of frames) {
      // Skip this instrument's own frame and both fieldFight wrapper
      // frames (Game.fieldFight = the installed wrapper,
      // Object.fieldFight = the original method). The first frame after
      // those is the real caller (expeditionMonster, resolveWildMonster-
      // Encounter, aidFight, ...). The earlier version returned
      // 'other:callerOf' here because callerOf itself was not skipped.
      if (f === 'callerOf') continue;
      if (f.indexOf('ammo-diag') !== -1) continue;
      if (f === 'fieldFight' || f.indexOf('.fieldFight') !== -1) continue;
      for (const k of KNOWN_CALLERS) {
        if (k === 'fieldFight') continue;
        if (f === k || f.indexOf('.' + k) !== -1) {
          out.callerClass = (k === 'contestEngine') ? 'contest' : k;
          return out;
        }
      }
      // First non-instrument, non-fieldFight frame is the caller even if unnamed in the list.
      out.callerClass = 'other:' + f;
      return out;
    }
  } catch (e) {}
  return out;
}

function pocketSummary(t, vid) {
  let count = 0, totalPocketed = 0, lastPost = null, lastOut = null, everCarried = 0;
  try {
    for (const p of (t.pocketCalls || [])) {
      if (p.vid !== vid) continue;
      count++;
      // Carried delta, not out.pocketed: the engine's crafted-batch
      // placement does not increment out.pocketed, so the delta is the
      // honest total (stones + own-stash moves + crafted batches).
      const preTot = Object.values(p.pre || {}).reduce((a, b) => a + b, 0);
      const postTot = Object.values(p.post || {}).reduce((a, b) => a + b, 0);
      totalPocketed += Math.max(0, postTot - preTot);
      lastPost = p.post;
      lastOut = p.out;
      const s = Object.values(p.post || {}).reduce((a, b) => a + b, 0);
      if (s > everCarried) everCarried = s;
    }
  } catch (e) {}
  return { pocketCalls: count, totalPocketed, lastPost, lastOut, everCarried };
}

// scanDay(Game, t): read-only daily snapshot called from the sweep's
// daily hook (never from game code, so it cannot perturb trajectories).
// Records the first day each roster villager is seen carrying/equipping
// a ranged weapon — this dates weapon acquisition against departure
// history for dry fighters (a crossbow picked up after the last
// departure was never pocketed for, by construction).
function scanDay(Game, t) {
  try {
    if (!t.weaponFirstSeen) t.weaponFirstSeen = {};
    const day = gday(Game);
    const roster = (((Game.state || {}).village || {}).roster) || [];
    for (const vid of roster) {
      if (vid === Game.villagerId) continue;
      const vp = vpOf(Game, vid);
      if (!vp) continue;
      const ri = rangedInfo(Game, vp);
      if (!ri.rangedWeaponId) continue;
      const seen = t.weaponFirstSeen[vid] || (t.weaponFirstSeen[vid] = {});
      if (seen[ri.rangedWeaponId] === undefined) {
        seen[ri.rangedWeaponId] = { day, equippedRangedId: ri.equippedRangedId };
      }
    }
  } catch (e) {}
}

function install(Game, t) {
  if (!t.fights) t.fights = [];
  if (!t.pocketCalls) t.pocketCalls = [];
  if (!t.departures) t.departures = [];
  if (!t.weaponFirstSeen) t.weaponFirstSeen = {};
  if (!t.pocketOverflow) t.pocketOverflow = 0;
  if (typeof t.fieldFightCalls !== 'number') t.fieldFightCalls = 0;
  if (typeof t.lowWaveFights !== 'number') t.lowWaveFights = 0;
  const WF = require('./w4field-instrument-20261030.js');

  const origFight = Game.fieldFight;
  if (typeof origFight !== 'function') { err(t, 'install.missing:fieldFight', new Error('not a function')); return function () {}; }
  Game.fieldFight = function (vid, mdef, m, opts) {
    t.fieldFightCalls++;
    let pre = null;
    try {
      const mid = (mdef && mdef.id) || null;
      const wave = mid ? WF.waveOf(Game, mid) : 0;
      const vp = vpOf(Game, vid);
      const ri = rangedInfo(Game, vp);
      const carried = ammoMap(vp ? vp.items : []);
      pre = {
        day: gday(Game), vid: (vid === undefined || vid === null) ? null : String(vid),
        mid, wave,
        rangedWeaponId: ri.rangedWeaponId, rangedAmmoId: ri.rangedAmmoId,
        equippedRangedId: ri.equippedRangedId,
        carried, carriedNeeded: ri.rangedAmmoId ? (carried[ri.rangedAmmoId] || 0) : null,
        ownStash: stashAmmoMap(vp ? vp.stashed : []),
        ownStashNeeded: null, pile: rawPile(Game), ammoCraft: ammoCraftOf(Game, vid),
        depart: departOf(Game, vid), caller: callerOf(),
        pocket: pocketSummary(t, String(vid)),
      };
      pre.ownStashNeeded = ri.rangedAmmoId ? (pre.ownStash[ri.rangedAmmoId] || 0) : null;
    } catch (e) { err(t, 'fieldFight.before', e); }
    let r;
    try { r = origFight.apply(this, arguments); } catch (e) { err(t, 'fieldFight.call', e); throw e; }
    try {
      if (!pre) return r;
      if ((pre.wave | 0) < 4) { t.lowWaveFights++; return r; }
      const rec = (r && typeof r === 'object') ? r : null;
      if (!rec) { err(t, 'fieldFight.noRec', new Error('no record for wave-4 fight day ' + pre.day)); return r; }
      // WEAPON IDENTITY (fixture-caught): fight entry runs
      // villagerGearUp(vid, false), whose autoEquip can equip a carried
      // ranged weapon AFTER this wrapper's pre-read. The volley reads
      // the post-autoEquip weapon, so a pre-read-only weapon id would
      // miss carried-but-unequipped bows. Weapon identity is therefore
      // taken post-fight (the weapon never changes mid-fight), while
      // ammo QUANTITY always comes from the pre-fight carried map —
      // the volley spends from exactly that map.
      let postRi = null, postCarried = null;
      try {
        const vpPost = vpOf(Game, vid);
        postRi = rangedInfo(Game, vpPost);
        postCarried = ammoMap(vpPost ? vpPost.items : []);
      } catch (e) { postRi = null; postCarried = null; }
      const finWeapon = pre.rangedWeaponId || (postRi && postRi.rangedWeaponId) || null;
      const finAmmo = pre.rangedAmmoId || (postRi && postRi.rangedAmmoId) || null;
      const finCarriedNeeded = finAmmo ? (pre.carried[finAmmo] || 0) : null;
      const finStashNeeded = finAmmo ? (pre.ownStash[finAmmo] || 0) : null;
      let logCopy = null;
      try { logCopy = Array.isArray(rec.log) ? rec.log.slice() : null; } catch (e) { logCopy = null; }
      t.fights.push({
        day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave,
        outcome: rec.outcome || 'unresolved',
        fleeClass: WF.classifyFlee(rec),
        rounds: rec.rounds !== undefined ? rec.rounds : null,
        vTaken: rec.vTaken !== undefined ? rec.vTaken : null,
        mDealt: rec.mDealt !== undefined ? rec.mDealt : null,
        volley: rec.volley || null,
        rangedWeaponId: finWeapon, rangedAmmoId: finAmmo,
        equippedRangedId: pre.equippedRangedId,
        postEquippedRangedId: postRi ? postRi.equippedRangedId : null,
        carried: pre.carried, carriedNeeded: finCarriedNeeded,
        postCarried: postCarried,
        ownStash: pre.ownStash, ownStashNeeded: finStashNeeded,
        pile: pre.pile, ammoCraft: pre.ammoCraft,
        depart: pre.depart, callerClass: pre.caller.callerClass,
        callerFrames: pre.caller.callerFrames,
        pocket: pre.pocket,
        log: logCopy,
      });
    } catch (e) { err(t, 'fieldFight.after', e); }
    return r;
  };

  const origPocket = Game.villagerPocketAmmo;
  let uninstallPocket = function () {};
  if (typeof origPocket === 'function') {
    Game.villagerPocketAmmo = function (vid) {
      let preMap = null;
      try { const vp = vpOf(Game, vid); preMap = ammoMap(vp ? vp.items : []); } catch (e) {}
      const out = origPocket.apply(this, arguments);
      try {
        const vp = vpOf(Game, vid);
        const postMap = ammoMap(vp ? vp.items : []);
        const row = { day: gday(Game), vid: String(vid), pre: preMap, post: postMap,
          out: out ? JSON.parse(JSON.stringify(out)) : null };
        if (t.pocketCalls.length < 20000) t.pocketCalls.push(row);
        else t.pocketOverflow++;
      } catch (e) { err(t, 'pocket.after', e); }
      return out;
    };
    uninstallPocket = function () { try { Game.villagerPocketAmmo = origPocket; } catch (e) {} };
  } else {
    err(t, 'install.missing:villagerPocketAmmo', new Error('not a function'));
  }

  // Departure wrappers (v2): startExpedition + resolvePatrol are the
  // only two pocketing departure sites. Recording their calls per vid
  // distinguishes "never departed" from "departed but pocketing failed"
  // for a dry fighter. Call-through, no RNG, no game writes.
  const depUninstalls = [];
  for (const kind of ['startExpedition', 'resolvePatrol']) {
    try {
      const orig = Game[kind];
      if (typeof orig !== 'function') { err(t, 'install.missing:' + kind, new Error('not a function')); continue; }
      Game[kind] = function () {
        let vid = null;
        try { vid = arguments[0] !== undefined && arguments[0] !== null ? String(arguments[0]) : null; } catch (e) {}
        const r = orig.apply(this, arguments);
        try { if (t.departures.length < 20000) t.departures.push({ day: gday(Game), vid, kind }); } catch (e) {}
        return r;
      };
      depUninstalls.push(function () { try { Game[kind] = orig; } catch (e) {} });
    } catch (e) { err(t, 'install.departure:' + kind, e); }
  }

  return function uninstall() {
    try { Game.fieldFight = origFight; } catch (e) {}
    try { uninstallPocket(); } catch (e) {}
    for (const u of depUninstalls) { try { u(); } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, scanDay, ammoMap, callerOf };
