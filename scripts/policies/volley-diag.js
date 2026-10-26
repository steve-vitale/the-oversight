// volley-diag — per-field-fight volley-gate / party / intent recorder
// for sim-volley-a (2026-10-26, flesh-out loop, axis scale-onramp).
// DIAG ONLY: zero src/js changes, policy-side only.
//
// WHAT IT RECORDS (one row per Game.fieldFight call, ALL waves):
// - The volley gate, classified in engine order from
//   src/js/fieldFights.js (volley section): G0-preempt-evade,
//   G0-preempt-alreadyDead, G1-no-equipment-api, G2-no-ranged-equipped,
//   G3-ranged-def-missing, G4-weapon-field-missing,
//   G5-ammo-field-missing (spear class), G6-bow-no-ammo,
//   G7-fires, G8-exception-suspect (rec.volley null despite passing
//   G1-G6 with ammo > 0 — the volley try/catch swallowed a throw).
// - The engine-mirror person lookup (data.villagers, then
//   background_survivors, exactly as the volley code does it), the
//   post-fight equipped.ranged entry (fieldFight gear-ups at entry,
//   so post-fight equipped IS fight equipped; volley ammo spend
//   changes ammo counts, not the weapon), and the PRE-fight ammo
//   count (gear-up consumes no ammo), counted the engine's way
//   (entries matching ammoId by itemId OR material, units summed).
// - Party potential verbatim from opts (allies, allyVids, allyFromStart,
//   awareness) plus diagnostic-only pre-fight potentials:
//   _outdoorCrew snapshot size/trusted count (world routes feed opts
//   from it) and villagerFightAllies() result count (the expedition
//   route feeds opts from it). Both are pure reads, never fed back.
// - Intent entry reason (rec.intentWhy) and final intent (rec.intent);
//   a mismatch implies a mid-fight flip (good-exchange at round >= 2).
// - trickKnown pre-fight (villageKnowsTrick, pure read).
// - Carried-but-unequipped ranged items and carried ammo units, so
//   "no bow in the village" splits from "bow in the pack, not equipped".
//
// OBSERVATIONAL ONLY. VOLLEYDIAG=1 is the only on-switch. Unset
// delegates byte-identically: no wrap installed, no ctx surface, no
// record. The wrap records after delegating (the record is only
// complete after the fight), draws no RNG, never throws into the
// engine (recording errors are counted), and returns the original's
// value untouched. It never calls villageStandingTotal() or
// unlockedWave() mid-run.
//
// KNOWN LIMITS (stated, not hidden):
// - Pre-fight person state is read before delegating; post-fight
//   equipped state is read after. If the fighter's person object is
//   replaced mid-fight (it is not, by any known path), the two reads
//   could disagree; the gate class uses post-fight equipped + pre-fight
//   ammo, as documented in the prereg.
// - The volley code's own vp lookup can differ from vpOf() when
//   duplicate ids exist; this recorder mirrors the volley code's
//   lookup, not vpOf, for gate purposes.
// - A fight whose record is null (caller swallowed) yields no row;
//   such calls are counted as noRecord in the store.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.VOLLEYDIAG === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    fieldFights: [], noRecord: 0,
    errs: 0, errors: [], overflow: { fieldFights: 0 },
    installed: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

// Engine-mirror person lookup: data.villagers, then background_survivors.
function personOf(Game, vid) {
  try {
    const lists = [];
    if (Game.data && Array.isArray(Game.data.villagers)) lists.push(Game.data.villagers);
    if (Game.data && Array.isArray(Game.data.background_survivors)) lists.push(Game.data.background_survivors);
    for (const l of lists) { const f = l.find(x => x && x.id === vid); if (f) return f; }
  } catch (e) {}
  return null;
}
function defOf(Game, id) {
  try {
    const items = Game.data && Game.data.items;
    if (Array.isArray(items)) { const d = items.find(x => x && x.id === id); if (d) return d; }
  } catch (e) {}
  return null;
}
function itemIdOf(ent) {
  if (!ent) return null;
  if (typeof ent === 'string') return ent;
  return ent.itemId || ent.id || null;
}
// Engine-mirror ammo count: entries matching ammoId by itemId OR material.
function ammoCountOf(vp, ammoId) {
  let n = 0;
  try {
    const items = (vp && vp.items) || [];
    for (const ent of items) {
      if (!ent) continue;
      const eid = itemIdOf(ent);
      const mat = (typeof ent === 'object') ? ent.material : null;
      if (eid === ammoId || mat === ammoId) n += (typeof ent === 'object' ? (ent.units || 1) : 1);
    }
  } catch (e) {}
  return n;
}

function installVolleyDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._volleyDiagStore === store && Game._volleyDiagInstalled) return Game._volleyDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        opts = opts || {};
        // ---- pre-fight reads (pure; never fed back) ----
        let preRanged = null, preAmmoId = null, preAmmoN = null, preDefName = null;
        let preCarriedRanged = [], preCarriedAmmoUnits = 0;
        let trickKnown = null, crewSize = null, crewTrusted = null, vfaCount = null;
        let seq = null;
        try {
          const vp = personOf(Game, vid);
          if (vp) {
            const eq = vp.equipped || {};
            preRanged = eq.ranged ? (eq.ranged.itemId || eq.ranged.id || null) : null;
            if (preRanged) {
              const d = defOf(Game, preRanged);
              preDefName = d ? (d.name || null) : null;
              preAmmoId = (d && d.weapon) ? (d.weapon.ammo || null) : null;
              if (preAmmoId) preAmmoN = ammoCountOf(vp, preAmmoId);
            }
            // Carried-but-unequipped ranged items (engine slot rule:
            // isRangedWeapon via S.equipment when available).
            let eqApi = null;
            try { eqApi = (globalThis.Scattering || {}).equipment || null; } catch (e) {}
            if (!eqApi) { try { eqApi = ((globalThis.Scattering || {}).S || {}).equipment || null; } catch (e) {} }
            if (!eqApi) { try { eqApi = (Game.S && Game.S.equipment) ? Game.S.equipment : null; } catch (e) {} }
            const seen = {};
            for (const ent of (vp.items || [])) {
              const id = itemIdOf(ent);
              if (!id || seen[id] || id === preRanged) continue;
              seen[id] = true;
              const d = defOf(Game, id);
              if (!d || !d.weapon) continue;
              let ranged = false;
              try { ranged = eqApi && typeof eqApi.isRangedWeapon === 'function' ? !!eqApi.isRangedWeapon(d) : ((d.weapon.range || 0) > 1); } catch (e) { ranged = (d.weapon.range || 0) > 1; }
              if (ranged) preCarriedRanged.push(id);
              if (d.weapon.ammo) preCarriedAmmoUnits += 0; // ammo units counted per ammoId below
            }
            // Total units of any ammo-class item carried (context only).
            for (const ent of (vp.items || [])) {
              const id = itemIdOf(ent);
              const d = id ? defOf(Game, id) : null;
              if (d && d.class === 'ammo') preCarriedAmmoUnits += (typeof ent === 'object' ? (ent.units || 1) : 1);
            }
          }
        } catch (e) { noteErr(store, 'volley.pre', e); }
        try {
          if (mdef && mdef.id && typeof Game.villageKnowsTrick === 'function') trickKnown = !!Game.villageKnowsTrick(mdef.id);
        } catch (e) { trickKnown = null; }
        try {
          const crew = Game._outdoorCrew || [];
          crewSize = crew.length;
          const trust = ((Game.state || {}).village || {}).trust || {};
          const roster = ((Game.state || {}).village || {}).roster || [];
          crewTrusted = crew.filter(rid => rid !== vid && roster.indexOf(rid) !== -1 && ((trust[rid] === undefined ? 10 : trust[rid]) >= 15)).length;
        } catch (e) { crewSize = null; crewTrusted = null; }
        try {
          if (typeof Game.villagerFightAllies === 'function') {
            const vfa = Game.villagerFightAllies(vid);
            vfaCount = Array.isArray(vfa) ? vfa.length : null;
          }
        } catch (e) { vfaCount = null; }
        try { if (m && m._spawnSeq != null) seq = m._spawnSeq | 0; } catch (e) {}
        const rec = orig.apply(this, arguments);
        try {
          if (!rec) { store.noRecord++; return rec; }
          // ---- post-fight gate classification ----
          let postRanged = null, postDef = null, postAmmoId = null;
          let apiOk = false;
          try {
            const vp = personOf(Game, vid);
            if (vp) {
              const eq = vp.equipped || {};
              postRanged = eq.ranged ? (eq.ranged.itemId || eq.ranged.id || null) : null;
            }
            let eqApi = null;
            try { eqApi = (globalThis.Scattering || {}).equipment || null; } catch (e) {}
            if (!eqApi) { try { eqApi = ((globalThis.Scattering || {}).S || {}).equipment || null; } catch (e) {} }
            if (!eqApi) { try { eqApi = (Game.S && Game.S.equipment) ? Game.S.equipment : null; } catch (e) {} }
            apiOk = !!(eqApi && typeof eqApi.rangedWeaponOf === 'function');
            if (postRanged) {
              postDef = defOf(Game, postRanged);
              postAmmoId = (postDef && postDef.weapon) ? (postDef.weapon.ammo || null) : null;
            }
          } catch (e) { noteErr(store, 'volley.post', e); }
          const volley = rec.volley || null;
          let gate = null;
          if (rec.outcome === 'evade') gate = 'G0-preempt-evade';
          else if (rec.outcome === 'alreadyDead') gate = 'G0-preempt-alreadyDead';
          else if (!apiOk) gate = 'G1-no-equipment-api';
          else if (!postRanged) gate = 'G2-no-ranged-equipped';
          else if (!postDef) gate = 'G3-ranged-def-missing';
          else if (!postDef.weapon) gate = 'G4-weapon-field-missing';
          else if (!postAmmoId) gate = 'G5-ammo-field-missing';
          else if (volley && volley.shots === 0) gate = 'G6-bow-no-ammo';
          else if (volley && volley.shots > 0) gate = 'G7-fires';
          else if (!volley && preAmmoId && preAmmoN != null && preAmmoN > 0) gate = 'G8-exception-suspect';
          else if (!volley) gate = 'G6-bow-no-ammo'; // pre/post ammo disagreement fallback: volley section ran, no volley object, ammo field present — engine's own count was 0
          else gate = 'G8-exception-suspect';
          // Ammo count used for the gate: prefer the pre-fight count for
          // the equipped weapon (post-fight ammo is spent by the volley).
          // When postRanged differs from preRanged (gear-up equipped a
          // new bow mid-entry), recompute from the pre-fight inventory
          // snapshot is impossible — flag it via preRanged/postRanged.
          const mSpeed = (mdef && mdef.speed) || 3;
          const range = (postDef && postDef.weapon) ? (postDef.weapon.range || 3) : null;
          const maxShots = range != null ? Math.min(4, Math.max(1, 1 + Math.floor(range / Math.max(1, mSpeed)))) : null;
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: (mdef && mdef.id) || null, wave: (mdef && mdef.wave) ? (mdef.wave | 0) : 1,
            seq: seq, ephemeral: !m,
            outcome: rec.outcome || null, rounds: rec.rounds | 0,
            totalDmg: rec.mDealt != null ? (rec.mDealt | 0) : null,
            volleyDmg: volley ? (volley.dmg | 0) : 0,
            volleyShots: volley ? (volley.shots | 0) : null,
            volleyHits: volley ? (volley.hits | 0) : null,
            volleyAmmoLeft: volley ? (volley.ammoLeft != null ? (volley.ammoLeft | 0) : null) : null,
            allyDealt: rec.allyDealt != null ? (rec.allyDealt | 0) : 0,
            calledHelp: !!rec.calledHelp, allyVid: rec.allyVid || null,
            intent: rec.intent || null, intentWhy: rec.intentWhy || null,
            everHopeless: !!rec.everHopeless, everWinning: !!rec.everWinning,
            fleeLearn: !!rec.fleeLearn, fleeHopeless: !!rec.fleeHopeless,
            trickKnown: trickKnown,
            optsAllies: opts.allies != null ? (opts.allies | 0) : 0,
            optsAllyVids: Array.isArray(opts.allyVids) ? opts.allyVids.length : 0,
            optsAllyFromStart: !!opts.allyFromStart, optsAwareness: !!opts.awareness,
            crewSize: crewSize, crewTrusted: crewTrusted, vfaCount: vfaCount,
            gate: gate,
            preRanged: preRanged, postRanged: postRanged,
            postDefName: postDef ? (postDef.name || null) : null,
            postAmmoId: postAmmoId, preAmmoId: preAmmoId, preAmmoN: preAmmoN,
            postRange: range, postBonus: (postDef && postDef.weapon) ? (postDef.weapon.bonus || 0) : null,
            mSpeed: mSpeed, maxShots: maxShots,
            carriedRanged: preCarriedRanged, carriedAmmoUnits: preCarriedAmmoUnits,
            wbMelee: null, wbRanged: null, // filled by the w4dmg cross-check join, not here
          });
        } catch (e) { noteErr(store, 'volley.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
    } else { noteErr(store, 'fieldFight.missing', new Error('no fieldFight')); }
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._volleyDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._volleyDiagStore = store;
    Game._volleyDiagInstalled = true;
    Game._volleyDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withVolleyDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installVolleyDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._volley = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installVolleyDiag, withVolleyDiag, MAX_EVENTS };
