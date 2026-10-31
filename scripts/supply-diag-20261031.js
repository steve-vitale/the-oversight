#!/usr/bin/env node
// supply-diag-20261031.js — supply extension for sim-supply-b.
// MEASUREMENT ONLY. Env-gated on SUPPLYDIAG=1. Installs ON TOP of
// ammo-diag-20261031.js (install that first): it wraps
// Game.villagerPocketAmmo a second time ONLY to capture the communal
// pile + ammoCraft pre/post each pocket call — the one thing the
// ammo-diag pocket record lacks, and the one thing that distinguishes
// a craft attempt blocked on materials from a craft that never ran.
// Also records a daily raw-pile snapshot from the sweep's daily hook.
//
// READ-ONLY DISCIPLINE (same as ammo-diag):
// - Draws NO RNG, writes NO game state, returns original results.
// - Never calls Game.stashState() (initializes defaults — a write).
//   Pile comes from the raw state.village.stash.materials object.
// - Never calls Game.agencyState() / npcNode() / partyMembers().
// - Every catch reports into t.supplyErrors (never thrown, never silent).
'use strict';

const AMMO_IDS = ['arrow', 'bolt', 'stone', 'fusion_cell', 'heartseeker_arrows'];

function instrumentOn() { return process.env.SUPPLYDIAG === '1'; }

function err(t, where, e) {
  try { t.supplyErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
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

function rawPile(Game) {
  try {
    const st = ((Game.state || {}).village || {}).stash || null;
    if (!st) return null;
    const m = st.materials || null;
    if (!m) return null;
    return { stone: m.stone || 0, stick: m.stick || 0, fiber: m.fiber || 0, branch: m.branch || 0 };
  } catch (e) { return null; }
}

function ammoCraftOf(Game, vid) {
  try {
    const ac = (((Game.state || {}).village || {}).ammoCraft || {})[vid] || null;
    return ac ? JSON.parse(JSON.stringify(ac)) : null;
  } catch (e) { return null; }
}

function ammoCraftAll(Game) {
  try {
    const ac = ((Game.state || {}).village || {}).ammoCraft || {};
    return JSON.parse(JSON.stringify(ac));
  } catch (e) { return {}; }
}

function equipOf(Game) {
  try { return (globalThis.S && globalThis.S.equipment) || (globalThis.Scattering && globalThis.Scattering.S && globalThis.Scattering.S.equipment) || null; } catch (e) { return null; }
}

function rangedInfo(Game, vp) {
  const out = { rangedWeaponId: null, rangedAmmoId: null };
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
  if (!out.rangedWeaponId && vp && vp.equipped && vp.equipped.ranged) {
    out.rangedWeaponId = vp.equipped.ranged.itemId || vp.equipped.ranged.id || null;
    try {
      const items = (Game.data && Game.data.items) || [];
      const def = items.find(d => d.id === out.rangedWeaponId);
      out.rangedAmmoId = (def && def.weapon && def.weapon.ammo) || null;
    } catch (e) {}
  }
  return out;
}

// scanDay(Game, t): read-only daily pile snapshot, called from the
// sweep's daily hook (never from game code). Aggregates are computed
// by the analyzer from the raw daily array, so this function only
// appends one small row per day.
function scanDay(Game, t) {
  try {
    if (!t.supplyDaily) t.supplyDaily = [];
    t.supplyDaily.push({ day: gday(Game), pile: rawPile(Game) });
  } catch (e) { err(t, 'scanDay', e); }
}

// endCensus(Game): read-only end-of-run snapshot. Roster villagers
// only (the scholar/player is excluded and noted as such by callers).
// Pile holds MATERIALS, not ammo — never conflated: ammo totals count
// fighter packs + own stashes only.
function endCensus(Game) {
  const out = { finalPile: null, ammoCraftAll: {}, carriedTotals: {}, stashTotals: {}, rangedCarriers: [] };
  try {
    out.finalPile = rawPile(Game);
    out.ammoCraftAll = ammoCraftAll(Game);
    for (const id of AMMO_IDS) { out.carriedTotals[id] = 0; out.stashTotals[id] = 0; }
    const roster = (((Game.state || {}).village || {}).roster) || [];
    for (const vid of roster) {
      if (vid === Game.villagerId) continue;
      const vp = vpOf(Game, vid);
      if (!vp) continue;
      const carried = ammoMap(vp.items || []);
      const stashed = ammoMap(vp.stashed || []);
      for (const id of AMMO_IDS) { out.carriedTotals[id] += carried[id]; out.stashTotals[id] += stashed[id]; }
      const ri = rangedInfo(Game, vp);
      if (ri.rangedWeaponId) {
        out.rangedCarriers.push({ vid: String(vid), rangedWeaponId: ri.rangedWeaponId,
          rangedAmmoId: ri.rangedAmmoId, carriedNeeded: ri.rangedAmmoId ? (carried[ri.rangedAmmoId] || 0) : null,
          stashNeeded: ri.rangedAmmoId ? (stashed[ri.rangedAmmoId] || 0) : null });
      }
    }
  } catch (e) {}
  return out;
}

function install(Game, t) {
  if (!t.supplyPocketCalls) t.supplyPocketCalls = [];
  if (!t.supplyDaily) t.supplyDaily = [];
  if (!t.supplyErrors) t.supplyErrors = [];
  if (typeof t.supplyOverflow !== 'number') t.supplyOverflow = 0;
  const cur = Game.villagerPocketAmmo;
  if (typeof cur !== 'function') { err(t, 'install.missing:villagerPocketAmmo', new Error('not a function')); return function () {}; }
  Game.villagerPocketAmmo = function (vid) {
    let prePile = null, preCraft = null, preCarried = null;
    try { prePile = rawPile(Game); } catch (e) {}
    try { preCraft = ammoCraftOf(Game, vid); } catch (e) {}
    try { const vp = vpOf(Game, vid); preCarried = ammoMap(vp ? vp.items : []); } catch (e) {}
    const out = cur.apply(this, arguments);
    try {
      const vp = vpOf(Game, vid);
      const row = { day: gday(Game), vid: String(vid), prePile, postPile: rawPile(Game),
        preCraft, postCraft: ammoCraftOf(Game, vid),
        preCarried, postCarried: ammoMap(vp ? vp.items : []),
        out: out ? JSON.parse(JSON.stringify(out)) : null };
      if (t.supplyPocketCalls.length < 20000) t.supplyPocketCalls.push(row);
      else t.supplyOverflow++;
    } catch (e) { err(t, 'pocket.after', e); }
    return out;
  };
  return function uninstall() { try { Game.villagerPocketAmmo = cur; } catch (e) {} };
}

module.exports = { instrumentOn, install, scanDay, endCensus, rawPile, ammoMap };
