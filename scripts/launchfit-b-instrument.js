#!/usr/bin/env node
// launchfit-b-instrument.js — departure-stamping instrument (arm
// sim-launchfit-b, Loop B 20261127, axis winnability-chain).
//
// Wraps Game.winPlanDepart and Game.vbrainExecuteDepart. At every
// departure with result 'hold' or 'launch', stamps BEFORE the original
// call runs (departure instant; pure read — no RNG touch, no state
// mutation, determinism preserved) one row per departure with a
// `members[]` array: one entry per party member (holder vid +
// plan.party; brain departs also include commit companions), each with
// HP + weapon + loaded state + ammo.
//
// Conventions inherited verbatim from scripts/ammocensus-driver-20261115.js
// (entryId/entryUnits/countAmmo, volley = ranged def with weapon.ammo,
// spear-in-ranged-slot recorded not counted) and from the aguard driver
// (gearOfReplica armed rule: weapon bonus > 0 OR a weapon item carried;
// village.health[vid] default 100).
//
//   install(Game) -> { departs, errors, uninstall }
//   departs: [{day, seed, vid, source, result, stage, target, targetWave,
//              party, partySize, members: [{vid, name, role, hp, hpFrac,
//              hpSource, armed, melee, meleeBonus, ranged, rangedBonus,
//              volley, ammoNeed, ammoN, otherAmmoN, loaded, armorP}]}]
//   loaded: true/false for volley-weapon carriers (ammoN > 0), null for
//   melee-only or unarmed members (no load state).
'use strict';

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function entryId(ent) {
  if (typeof ent === 'string') return ent;
  if (!ent) return null;
  return ent.itemId || ent.id || null;
}
function entryMaterial(ent) {
  if (!ent || typeof ent === 'string') return null;
  return ent.material || null;
}
function entryUnits(ent) {
  if (!ent) return 0;
  if (typeof ent === 'string') return 1;
  return ent.units || 1;
}
function defOf(Game, id) {
  try {
    const items = (Game.data && Game.data.items) || [];
    for (let i = 0; i < items.length; i++) if (items[i] && items[i].id === id) return items[i];
  } catch (e) {}
  return null;
}
function ammoIdSet(Game) {
  const set = {};
  try {
    const items = (Game.data && Game.data.items) || [];
    for (let i = 0; i < items.length; i++) {
      const d = items[i];
      if (!d) continue;
      if (d.weapon && d.weapon.ammo) set[d.weapon.ammo] = true;
      if (d.class === 'ammo') set[d.id] = true;
    }
  } catch (e) {}
  return set;
}
function countAmmo(Game, person, ammoId) {
  let n = 0;
  try {
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const ent = items[i];
      if (entryId(ent) === ammoId || entryMaterial(ent) === ammoId) n += entryUnits(ent);
    }
  } catch (e) {}
  return n;
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  try { if (Game.vpOf) { const p = Game.vpOf(vid); if (p) return p; } } catch (e) {}
  return null;
}
function hpOf(Game, person, vid) {
  // Roster person.health first (muster driver convention), then the
  // village.health map (aguard convention, default 100), then the
  // scholar's own health when the holder IS the scholar.
  try {
    if (person && typeof person.health === 'number') return { hp: person.health, source: 'person' };
    const map = ((Game.state || {}).village || {}).health || {};
    if (typeof map[vid] === 'number') return { hp: map[vid], source: 'village-health' };
    const sch = (Game.state || {}).scholar || {};
    if (sch.id === vid && typeof sch.health === 'number') return { hp: sch.health, source: 'scholar' };
  } catch (e) {}
  return { hp: 100, source: 'default-100' };
}
function armorPOf(Game, person) {
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    const items = (Game.data && Game.data.items) || [];
    if (eq && eq.armorOf) return eq.armorOf(person, items) || 0;
  } catch (e) {}
  return 0;
}

// stampMember(Game, vid, role): the frozen per-member classification.
// Pure reads. Never throws (error field instead).
function stampMember(Game, vid, role) {
  const out = { vid: vid, name: null, role: role || 'party', hp: 100, hpFrac: 1,
    hpSource: 'default-100', armed: false, melee: null, meleeBonus: 0,
    ranged: null, rangedBonus: 0, volley: false, ammoNeed: null, ammoN: 0,
    otherAmmoN: 0, loaded: null, armorP: 0, error: null };
  try {
    const person = personOf(Game, vid);
    if (!person) { out.error = 'no-person'; return out; }
    out.name = person.name || person.displayName || null;
    const hp = hpOf(Game, person, vid);
    out.hp = hp.hp; out.hpSource = hp.source; out.hpFrac = hp.hp / 100;
    out.armorP = armorPOf(Game, person);
    const eq = person.equipped || {};
    const ammoIds = ammoIdSet(Game);
    // Ranged: a REAL ranged weapon has weapon.type 'ranged' AND
    // weapon.ammo. A spear in the ranged slot is recorded as melee.
    const rangedEnt = eq.ranged || null;
    const rangedDef = rangedEnt ? defOf(Game, entryId(rangedEnt)) : null;
    if (rangedDef && rangedDef.weapon && rangedDef.weapon.type === 'ranged' && rangedDef.weapon.ammo) {
      out.ranged = rangedDef.id;
      out.rangedBonus = rangedDef.weapon.bonus || 0;
      out.volley = true;
      out.ammoNeed = rangedDef.weapon.ammo;
      out.ammoN = countAmmo(Game, person, rangedDef.weapon.ammo);
      out.loaded = out.ammoN > 0;
    } else if (rangedDef && rangedDef.weapon) {
      out.melee = rangedDef.id;
      out.meleeBonus = rangedDef.weapon.bonus || 0;
    } else if (rangedEnt) {
      out.error = 'ranged-entry-no-def';
    }
    // Melee: equipped melee slot, else any carried melee-type weapon.
    if (!out.melee) {
      const meleeEnt = eq.melee || eq.weapon || null;
      const meleeDef = meleeEnt ? defOf(Game, entryId(meleeEnt)) : null;
      if (meleeDef && meleeDef.weapon) {
        out.melee = meleeDef.id;
        out.meleeBonus = meleeDef.weapon.bonus || 0;
      }
    }
    if (!out.melee) {
      const items = person.items || [];
      for (let i = 0; i < items.length; i++) {
        const d = defOf(Game, entryId(items[i]));
        if (d && d.weapon && d.weapon.type !== 'ranged') {
          out.melee = d.id;
          out.meleeBonus = d.weapon.bonus || 0;
          break;
        }
      }
    }
    // Armed (gearOfReplica convention): melee bonus > 0 OR any weapon
    // item carried (equipped ranged counts via the pack scan below).
    let carriesWeapon = false;
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const d = defOf(Game, entryId(items[i]));
      if (d && d.weapon) { carriesWeapon = true; break; }
    }
    out.armed = !!((out.meleeBonus > 0) || (out.rangedBonus > 0) || carriesWeapon ||
      (out.ranged && true) || (out.melee && true));
    // Other ammo on hand (wrong-ammo shape): units of any ammo id/class
    // that is NOT the equipped weapon's need.
    let other = 0;
    for (let i = 0; i < items.length; i++) {
      const ent = items[i];
      const eid = entryId(ent);
      const mat = entryMaterial(ent);
      const d = eid ? defOf(Game, eid) : null;
      const isAmmo = !!(ammoIds[eid] || ammoIds[mat] || (d && d.class === 'ammo'));
      if (!isAmmo) continue;
      if (eid === out.ammoNeed || mat === out.ammoNeed) continue;
      other += entryUnits(ent);
    }
    out.otherAmmoN = other;
  } catch (e) { out.error = 'stamp: ' + String(e.message).slice(0, 80); }
  return out;
}

function install(Game) {
  const departs = [];
  const errors = [];
  function planOf(vid) {
    try { const v = (Game.state || {}).village || {}; return (v.winPlan || {})[vid] || null; } catch (e) { return null; }
  }
  function stamp(vid, source, result, plan, extra) {
    try {
      const members = [];
      const seen = {};
      function addMember(id, role) {
        if (!id || seen[id]) return;
        seen[id] = true;
        members.push(stampMember(Game, id, role));
      }
      addMember(vid, 'holder');
      const party = (plan && plan.party) ? plan.party.slice() : [];
      for (let i = 0; i < party.length; i++) addMember(party[i], 'party');
      if (extra) {
        if (extra.companion) addMember(extra.companion, 'companion');
        if (extra.companion2) addMember(extra.companion2, 'companion2');
      }
      const stampErrors = members.filter(function (m) { return m.error; }).length;
      departs.push({ day: gday(Game), vid: vid, source: source, result: result,
        stage: plan ? plan.stage : null, target: plan ? (plan.target || null) : null,
        targetWave: plan ? (plan.needWave || null) : null,
        party: party, partySize: members.length,
        members: members, stampErrors: stampErrors,
        complete: stampErrors === 0 });
    } catch (e) { errors.push('stamp: ' + String(e.message).slice(0, 80)); }
  }
  const orig = {};
  try {
    const origDepart = Game.winPlanDepart;
    if (typeof origDepart === 'function') {
      const wrapped = function (vid, hx, hy, playerAtHaven) {
        // STAMP FIRST: the departure instant is before the call moves
        // anyone or consumes anything.
        try {
          const plan = planOf(vid);
          // Pre-read the return only after stamping: stamp needs the
          // plan as it stands at the decision instant.
          const before = departs.length;
          stamp(vid, 'winPlanDepart', null, plan, null);
          // Fill in the result once known (same row object).
          const row = departs.length > before ? departs[departs.length - 1] : null;
          const ret = origDepart.apply(this, arguments);
          if (row) row.result = ret;
          // Drop the row if the call was neither hold nor launch — it
          // was not a departure (e.g. 'normal' / no plan action).
          if (row && ret !== 'hold' && ret !== 'launch') departs.pop();
          return ret;
        } catch (e) {
          errors.push('winPlanDepart-wrap: ' + String(e.message).slice(0, 80));
          return origDepart.apply(this, arguments);
        }
      };
      wrapped.__launchfitWrapped = true;
      orig.winPlanDepart = origDepart;
      Game.winPlanDepart = wrapped;
    } else errors.push('winPlanDepart-wrap: not a function');
  } catch (e) { errors.push('winPlanDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origBrain = Game.vbrainExecuteDepart;
    if (typeof origBrain === 'function') {
      const wrapped = function (vid, hx, hy, playerAtHaven) {
        let commit = null;
        try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
        try {
          const plan = planOf(vid);
          const before = departs.length;
          stamp(vid, 'brain', null, plan, commit || null);
          const row = departs.length > before ? departs[departs.length - 1] : null;
          const ret = origBrain.apply(this, arguments);
          if (row) {
            row.result = ret;
            row.winPlanAction = commit ? (commit.winPlanAction || null) : null;
            row.companion = commit ? (commit.companion || null) : null;
            row.companion2 = commit ? (commit.companion2 || null) : null;
          }
          if (row && ret !== 'hold' && ret !== 'launch') departs.pop();
          return ret;
        } catch (e) {
          errors.push('vbrainExecuteDepart-wrap: ' + String(e.message).slice(0, 80));
          return origBrain.apply(this, arguments);
        }
      };
      wrapped.__launchfitWrapped = true;
      orig.vbrainExecuteDepart = origBrain;
      Game.vbrainExecuteDepart = wrapped;
    } else errors.push('vbrainExecuteDepart-wrap: not a function');
  } catch (e) { errors.push('vbrainExecuteDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  function uninstall() {
    try { if (orig.winPlanDepart) Game.winPlanDepart = orig.winPlanDepart; } catch (e) {}
    try { if (orig.vbrainExecuteDepart) Game.vbrainExecuteDepart = orig.vbrainExecuteDepart; } catch (e) {}
  }
  return { departs: departs, errors: errors, uninstall: uninstall, stampMember: stampMember };
}

module.exports = { install: install, stampMember: stampMember };
