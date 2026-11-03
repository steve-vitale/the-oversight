// gearbar-instrument-20261103.js — gear-bar autopsy instrument (arm
// sim-gearbar-a, run fleshout-20261103T1819Z). Scripts only, zero src/js.
// Daily snapshots of waveCombatReadiness(5) PLUS an independent per-fighter
// recount: worn armor P (gate reader + manual equipped-slot sum), pack /
// stash armor and weapons, equipped weapons, and village context (communal
// stash weapons/armor, village wood, scholar codex bark/hide recipe levels).
// The gate counts armor only when WORN and weapons when equipped OR carried;
// the instrument mirrors those readers exactly, then cross-checks them with
// the manual slot sum so a worn-vs-owned miscount cannot hide inside a
// shared reader.
// Usage: const INST = require('./gearbar-instrument-20261103');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
// Pure helpers (classifyFighter, persistenceRuns) live in the analyzer.
'use strict';

const BODY_SLOTS = ['head', 'torso', 'legs', 'hands', 'shoes'];
const DEMAND = { armored: 4, armorP: 15, armed: 6 };

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function idOf(it) { return (it && (it.itemId || it.id)) || it; }
function defOf(Game, id) {
  try { return (Game.data.items || []).find(function (d) { return d && d.id === id; }) || null; } catch (e) { return null; }
}
function personOf(Game, vid) {
  try { if (typeof Game.getPerson === 'function') { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  try { if (typeof Game.vpOf === 'function') return Game.vpOf(vid); } catch (e) {}
  return null;
}
function isLiving(Game, vid, scholarId) {
  if (vid === scholarId) return true;
  const p = personOf(Game, vid);
  return !!(p && !p.dead);
}
// Manual equipped-slot armor sum, independent of armorOf: full-set torso
// reads exactly the set protection; otherwise sum piece protections over
// BODY_SLOTS only (coordination is >= 0, so armorOf must be >= this sum).
function manualArmor(Game, equipped) {
  const eq = equipped || {};
  if (eq.torso && eq.torso.fullSet) {
    const def = defOf(Game, idOf(eq.torso));
    return { sum: (def && def.armor && def.armor.protection) || 0, fullSet: true, pieces: [{ slot: 'torso', id: idOf(eq.torso), p: (def && def.armor && def.armor.protection) || 0 }] };
  }
  let sum = 0; const pieces = [];
  BODY_SLOTS.forEach(function (slot) {
    const e = eq[slot];
    if (!e) return;
    const def = defOf(Game, idOf(e));
    const p = (def && def.armor && def.armor.protection) || 0;
    pieces.push({ slot: slot, id: idOf(e), p: p });
    sum += p;
  });
  return { sum: sum, fullSet: false, pieces: pieces };
}
function splitItems(Game, list) {
  const armor = [], weapons = [];
  (list || []).forEach(function (it) {
    const id = idOf(it);
    if (!id) return;
    const def = defOf(Game, id);
    if (!def) return;
    if (def.armor) armor.push({ id: id, p: def.armor.protection || 0 });
    if (def.weapon) weapons.push({ id: id, bonus: def.weapon.bonus || 0 });
  });
  return { armor: armor, weapons: weapons };
}

function recountFighter(Game, vid, scholarId) {
  const f = { vid: vid, isScholar: vid === scholarId, living: false, ap: 0, manualAp: 0, fullSet: false,
    apMissed: false, wornArmor: [], packArmor: [], stashArmor: [],
    equippedWeapons: [], packWeapons: [], stashWeapons: [], armed: false, away: false };
  try { f.away = !!(((Game.state || {}).village || {}).away || {})[vid]; } catch (e) {}
  f.living = isLiving(Game, vid, scholarId);
  if (!f.living) return f;
  const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
  const eq = S.equipment || null;
  if (vid === scholarId) {
    const sch = (Game.state || {}).scholar || {};
    try { f.ap = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : 0; } catch (e) { f.ap = 0; }
    const man = manualArmor(Game, sch.equipped || {});
    f.manualAp = man.sum; f.fullSet = man.fullSet; f.wornArmor = man.pieces;
    try {
      const ew = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null;
      if (ew && !ew.unarmed && ew.itemId) f.equippedWeapons.push({ id: ew.itemId });
    } catch (e) {}
    const pack = splitItems(Game, sch.inventory || []);
    f.packArmor = pack.armor; f.packWeapons = pack.weapons;
    f.stashArmor = []; f.stashWeapons = [];
    f.armed = f.equippedWeapons.length > 0 || f.packWeapons.length > 0;
  } else {
    const p = personOf(Game, vid);
    if (!p) return f;
    try { f.ap = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(p, Game.data.items || []) || 0) : 0; } catch (e) { f.ap = 0; }
    const man = manualArmor(Game, p.equipped || {});
    f.manualAp = man.sum; f.fullSet = man.fullSet; f.wornArmor = man.pieces;
    try {
      const mw = (eq && typeof eq.meleeWeaponOf === 'function') ? eq.meleeWeaponOf(p) : null;
      if (mw && mw.itemId) f.equippedWeapons.push({ id: mw.itemId, slot: 'melee' });
    } catch (e) {}
    try {
      const rw = (eq && typeof eq.rangedWeaponOf === 'function') ? eq.rangedWeaponOf(p) : null;
      if (rw && rw.itemId) f.equippedWeapons.push({ id: rw.itemId, slot: 'ranged' });
    } catch (e) {}
    const pack = splitItems(Game, p.items || []);
    f.packArmor = pack.armor; f.packWeapons = pack.weapons;
    const stash = splitItems(Game, p.stashed || []);
    f.stashArmor = stash.armor; f.stashWeapons = stash.weapons;
    f.armed = f.equippedWeapons.length > 0 || f.packWeapons.length > 0;
  }
  // Worn-gear-missed flag: the gate reader must never read BELOW the manual
  // equipped-slot sum (coordination / flat mods only ever add). Full-set
  // reads exactly the set protection; flat mods (scholar) only add.
  f.apMissed = f.ap < f.manualAp;
  return f;
}

function install(Game) {
  const t = { daily: [], instrumentErrors: [] };
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.roster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) { snap.roster = []; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try {
      snap.fighters = snap.roster.map(function (vid) { return recountFighter(Game, vid, snap.scholarId); });
    } catch (e) { snap.fighters = null; t.instrumentErrors.push('recount: ' + String(e.message).slice(0, 80)); }
    try {
      const living = (snap.fighters || []).filter(function (f) { return f.living; });
      snap.recountArmored = living.filter(function (f) { return f.ap >= DEMAND.armorP; }).length;
      snap.recountArmed = living.filter(function (f) { return f.armed; }).length;
      snap.apMissedFighters = living.filter(function (f) { return f.apMissed; }).map(function (f) { return f.vid; });
    } catch (e) { t.instrumentErrors.push('recount-tally: ' + String(e.message).slice(0, 80)); }
    try {
      const st = (typeof Game.stashState === 'function') ? Game.stashState() : (((Game.state || {}).village || {}).stash || {});
      const wEnt = (st.weapons || []).map(function (e) { return { id: idOf(e), units: (e.units ?? 1) }; });
      const aEnt = (st.armor || []).map(function (e) { return { id: idOf(e), units: (e.units ?? 1) }; });
      const rk = ((Game.state || {}).codex || {}).recipes || {};
      snap.village = {
        communalWeapons: wEnt, communalArmor: aEnt,
        communalWeaponUnits: wEnt.reduce(function (s, e) { return s + (e.units || 0); }, 0),
        communalArmorUnits: aEnt.reduce(function (s, e) { return s + (e.units || 0); }, 0),
        wood: (((Game.state || {}).village || {}).wood || 0),
        codexBark: ((rk.bark_armor || {}).level || 0),
        codexHide: ((rk.hide_armor || {}).level || 0),
      };
    } catch (e) { snap.village = null; t.instrumentErrors.push('village: ' + String(e.message).slice(0, 80)); }
    t.daily.push(snap);
    return snap;
  }
  return { t: t, snapshot: snapshot, uninstall: function () {} };
}

module.exports = { install: install, recountFighter: recountFighter, manualArmor: manualArmor, splitItems: splitItems, DEMAND: DEMAND };
