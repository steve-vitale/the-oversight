#!/usr/bin/env node
// w4field-instrument-20261030.js — wave-4 field-fight decomposition
// instrument (sim-w4field-a, 2026-10-30, axis scale-onramp).
// MEASUREMENT ONLY. Follows sim-killconv-a: killconv proved villagers
// met wave-4 beasts 35 times and killed 0; this instrument opens each
// wave-4 field fight and records what happened inside it.
//
// Env-gated on W4FIELD=1. Contract: instrumentOn(), install(Game, t),
// uninstall; when unset the wrapper is never installed and the sim path
// is byte-identical to base. The wrapper is call-through: it reads
// state before/after the call, draws NO RNG, writes NO game state, and
// returns the original record object untouched (only a copy of its log
// and roundTotals is kept — never the live arrays).
//
// Wraps: Game.fieldFight only. Wave >= 4 fights are recorded in full;
// wave < 4 fights pass through unwatched (except a counter, so a
// silent filter failure would show as a count mismatch vs killconv).
//
// Beast max HP: the world entity's maxHp when present (ground truth);
// otherwise mHpLeft + mDealt (estimate — flagged hpBasis='est'; valid
// when the lead took all recorded damage and never healed; flagged
// 'est-out-of-range' when the estimate falls outside the mdef hp
// range, so no estimate is silently trusted).
//
// Every catch reports into t.instrumentErrors (never thrown, never
// silent). A null gear read is recorded as null, not an error: the
// analyzer reports field completeness separately.
'use strict';

function instrumentOn() { return process.env.W4FIELD === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function waveOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    const d = defs.find(m => m && m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}

function hpRangeOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    const d = defs.find(m => m && m.id === mid);
    if (d && Array.isArray(d.hp)) return d.hp.slice();
  } catch (e) {}
  return null;
}

function vpOf(Game, vid) {
  try {
    const data = Game.data || {};
    return (data.villagers || []).find(x => x && x.id === vid) ||
      (data.background_survivors || []).find(x => x && x.id === vid) || null;
  } catch (e) { return null; }
}

function gearOf(Game, vid) {
  const out = { armorP: null, wbMelee: null, wbRanged: null, rangedWeaponId: null };
  try {
    const vp = vpOf(Game, vid);
    if (!vp) return out;
    let eq = null;
    try { eq = (globalThis.S && globalThis.S.equipment) || (globalThis.Scattering && globalThis.Scattering.S && globalThis.Scattering.S.equipment) || null; } catch (e) {}
    if (!eq) return out;
    const items = (Game.data && Game.data.items) || [];
    try { if (eq.armorOf) out.armorP = eq.armorOf(vp, items) || 0; } catch (e) {}
    try { if (eq.weaponBonusOf) out.wbMelee = eq.weaponBonusOf(vp, items, 'melee') || 0; } catch (e) {}
    try { if (eq.weaponBonusOf) out.wbRanged = eq.weaponBonusOf(vp, items, 'ranged') || 0; } catch (e) {}
    try {
      if (eq.rangedWeaponOf) {
        const rw = eq.rangedWeaponOf(vp, items);
        if (rw) out.rangedWeaponId = rw.itemId || rw.id || null;
      }
    } catch (e) {}
  } catch (e) {}
  return out;
}

// hpAt mirrors fieldFight's own default: an untracked villager fights
// at 100 HP. The default is flagged (vHpStartDefaulted) so the analyzer
// can tell a real 100 from an engine-default 100.
function hpAt(Game, vid) {
  try {
    const h = ((Game.state || {}).village || {}).health || {};
    if (h[vid] !== undefined) return { hp: h[vid], def: false };
    return { hp: 100, def: true };
  } catch (e) { return { hp: 100, def: true }; }
}

// classifyFlee(rec): flee/death class per prereg order. Returns the
// class string plus the raw flags for audit.
function classifyFlee(rec) {
  const o = rec.outcome;
  if (o === 'evade') return 'EVADE';
  if (o === 'vKill') return 'KILL';
  if (o === 'mFlee') return 'DRIVE-OFF';
  if (o === 'alreadyDead') return 'ALREADY-DEAD';
  if (o === 'vDie') return 'DEATH';
  if (o === 'vFlee') {
    if (rec.fleeLearn) return 'LEARN-WITHDRAWAL';
    if (rec.fleeHopeless) return 'HOPELESS';
    try {
      if ((rec.log || []).join('\n').indexOf('Neither gives') !== -1) return 'ROUND-CAP';
    } catch (e) {}
    return 'FLOOR';
  }
  return 'UNRESOLVED';
}

// install(Game, t): t = {fights, instrumentErrors, fieldFightCalls}.
// Returns uninstall.
function install(Game, t) {
  if (!t.fights) t.fights = [];
  if (typeof t.fieldFightCalls !== 'number') t.fieldFightCalls = 0;
  const orig = Game.fieldFight;
  if (typeof orig !== 'function') { err(t, 'install.missing:fieldFight', new Error('not a function')); return function () {}; }

  Game.fieldFight = function (vid, mdef, m, opts) {
    t.fieldFightCalls++;
    let pre = null;
    try {
      const mid = (mdef && mdef.id) || null;
      const wave = mid ? waveOf(Game, mid) : 0;
      const o = opts || {};
      const allyVids = Array.isArray(o.allyVids) ? o.allyVids.slice() : [];
      const scholarVid = Game.villagerId || null;
      pre = {
        day: gday(Game), vid: (vid === undefined || vid === null) ? null : String(vid),
        mid, wave, hpRange: hpRangeOf(Game, mid),
        entityHp: (m && m.hp !== undefined && m.hp !== null) ? m.hp : null,
        entityMaxHp: (m && m.maxHp !== undefined && m.maxHp !== null) ? m.maxHp : null,
        vHpStart: hpAt(Game, vid).hp,
        vHpStartDefaulted: hpAt(Game, vid).def,
        gear: gearOf(Game, vid),
        optsAllies: (o.allies || 0), allyVids,
        isScholar: scholarVid !== null && String(vid) === String(scholarVid),
        scholarInParty: scholarVid !== null && allyVids.indexOf(scholarVid) !== -1,
        intentKnown: null,
      };
    } catch (e) { err(t, 'fieldFight.before', e); }
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { err(t, 'fieldFight.call', e); throw e; }
    try {
      if (!pre) return r;
      if ((pre.wave | 0) < 4) return r;
      const rec = (r && typeof r === 'object') ? r : null;
      if (!rec) { err(t, 'fieldFight.noRec', new Error('no record for wave-4 fight day ' + pre.day)); return r; }
      // Beast max HP: ground truth from the entity, else estimate.
      let beastMaxHp = null, hpBasis = null;
      if (pre.entityMaxHp !== null && pre.entityMaxHp > 0) { beastMaxHp = pre.entityMaxHp; hpBasis = 'entity'; }
      else if (rec.mHpLeft !== undefined && rec.mDealt !== undefined) {
        beastMaxHp = Math.max(0, rec.mHpLeft) + (rec.mDealt || 0);
        hpBasis = 'est';
        if (pre.hpRange && (beastMaxHp < pre.hpRange[0] || beastMaxHp > pre.hpRange[1])) hpBasis = 'est-out-of-range';
      }
      const partySize = rec.partySize !== undefined ? rec.partySize : Math.max(1, (pre.optsAllies || 0) + 1);
      const fighterClass = (pre.isScholar || pre.scholarInParty) ? 'scholar-party'
        : (partySize > 1 || rec.calledHelp) ? 'party' : 'lone';
      let logCopy = null;
      try { logCopy = Array.isArray(rec.log) ? rec.log.slice() : null; } catch (e) { logCopy = null; }
      let rtCopy = null;
      try { rtCopy = Array.isArray(rec.roundTotals) ? JSON.parse(JSON.stringify(rec.roundTotals)) : null; } catch (e) { rtCopy = null; }
      t.fights.push({
        day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave,
        outcome: rec.outcome || 'unresolved',
        fleeClass: classifyFlee(rec),
        rounds: rec.rounds !== undefined ? rec.rounds : null,
        vTaken: rec.vTaken !== undefined ? rec.vTaken : null,
        mDealt: rec.mDealt !== undefined ? rec.mDealt : null,
        allyDealt: rec.allyDealt !== undefined ? rec.allyDealt : null,
        vHpStart: pre.vHpStart, vHpStartDefaulted: !!pre.vHpStartDefaulted, vHpLeft: rec.vHpLeft !== undefined ? rec.vHpLeft : null,
        mHpLeft: rec.mHpLeft !== undefined ? rec.mHpLeft : null,
        beastMaxHp, hpBasis, hpRange: pre.hpRange,
        entityHp: pre.entityHp, entityMaxHp: pre.entityMaxHp,
        partySize, allyVids: pre.allyVids, optsAllies: pre.optsAllies,
        calledHelp: !!rec.calledHelp, allyVid: rec.allyVid || null,
        fighterClass, isScholar: pre.isScholar, scholarInParty: pre.scholarInParty,
        armorP: pre.gear.armorP, wbMelee: pre.gear.wbMelee, wbRanged: pre.gear.wbRanged,
        rangedWeaponId: pre.gear.rangedWeaponId,
        armored: (pre.gear.armorP !== null && pre.gear.armorP >= 10),
        fleeHopeless: rec.fleeHopeless !== undefined ? rec.fleeHopeless : null,
        fleeLearn: !!rec.fleeLearn,
        fleeHpFrac: rec.fleeHpFrac !== undefined ? rec.fleeHpFrac : null,
        everWinning: !!rec.everWinning, everHopeless: !!rec.everHopeless,
        minHpFrac: rec.minHpFrac !== undefined ? rec.minHpFrac : null,
        intent: rec.intent || null, intentWhy: rec.intentWhy || null,
        volley: rec.volley || null,
        roundTotals: rtCopy, log: logCopy,
      });
    } catch (e) { err(t, 'fieldFight.after', e); }
    return r;
  };

  return function uninstall() { try { Game.fieldFight = orig; } catch (e) {} };
}

module.exports = { instrumentOn, install, classifyFlee, waveOf };
