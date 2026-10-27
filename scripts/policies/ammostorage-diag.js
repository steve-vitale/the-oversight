// ammostorage-diag — per-field-fight storage / carried / equipped ammo census
// for sim-ammostorage-a (2026-10-26, flesh-out loop, axis scale-onramp).
// DIAG ONLY: zero src/js changes, policy-side only.
//
// WHAT IT RECORDS (one row per Game.fieldFight call, ALL waves):
// - The volley gate, classified in engine order exactly as volley-a's
//   G0–G8 (see evidence/2026-10-26/sim-volley-a.md): G0-preempt-evade,
//   G0-preempt-alreadyDead, G1-no-equipment-api, G2-no-ranged-equipped,
//   G3-ranged-def-missing, G4-weapon-field-missing,
//   G5-ammo-field-missing (spear class), G6-bow-no-ammo,
//   G7-fires, G8-exception-suspect.
// - The fighter's carried ammo by type (volley mirror: entries matching
//   ammoId by itemId OR material, units summed), the fighter's personal
//   stashed ammo by type, carried-but-unequipped ranged items, and the
//   equipped ranged weapon (post-fight equipped, as volley-a did).
// - VILLAGE STORAGE at fight time, in separate buckets (never merged):
//   (a) communal stash materials (raw state.village.stash.materials —
//   stone flagged as sling ammo); (b) stash sections tools/weapons/
//   medicine/armor scanned for ammo-class entries; (c) village pantry
//   scanned for ammo-class entries (food-only by construction —
//   expect 0); (d) all OTHER persons' carried + stashed ammo by type
//   (persons = Game.data.villagers + background_survivors, deduped by
//   id, plus rosterChars if present); (e) scholar inventory (player
//   pack) ammo by type, its own bucket.
// - A light daily storage snapshot (day, communal materials, section
//   ammo, village-wide person totals, scholar inventory) taken in the
//   daily wrapper BEFORE delegating to the inner policy.
//
// OBSERVATIONAL ONLY. AMMOSTORAGE=1 is the only on-switch. Unset
// delegates byte-identically: no wrap installed, no ctx surface, no
// record. The wrap records after delegating (the record is only
// complete after the fight), draws no RNG, never throws into the
// engine (recording errors are counted), and returns the original's
// value untouched. It never calls villageStandingTotal() or
// unlockedWave() mid-run.
//
// PURE-READ DISCIPLINE: the recorder NEVER calls stashState() (which
// would initialize defaults — a write). It reads raw
// state.village.stash / state.village.pantry, defaulting missing
// sections to 0/[]. Person reads mirror volley-diag's personOf.
//
// KNOWN LIMITS (stated, not hidden):
// - Buried personal caches (storage.js personal caches) are NOT
//   censused: they are personal, unsecured, and have no village-wide
//   enumeration in code — a cache is not village storage. Noted in
//   the evidence, not folded into any bucket.
// - A fight whose record is null (caller swallowed) yields no row;
//   such calls are counted as noRecord in the store.
// - If the fighter IS the scholar, the scholar-inventory bucket and
//   the fighter-carried bucket may describe overlapping packs (the
//   player's person.items vs state.scholar.inventory are separate
//   structures); the proof reports the overlap note and never adds
//   the two buckets together.
'use strict';

const MAX_EVENTS = 20000;
const AMMO_IDS = ['arrow', 'bolt', 'stone', 'heartseeker_arrows', 'fusion_cell'];

function layerOn() { try { return process.env.AMMOSTORAGE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    fieldFights: [], dailySnapshots: [], noRecord: 0,
    errs: 0, errors: [], overflow: { fieldFights: 0, dailySnapshots: 0 },
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

function itemIdOf(ent) {
  if (!ent) return null;
  if (typeof ent === 'string') return ent;
  return ent.itemId || ent.id || null;
}
function matOf(ent) {
  if (!ent || typeof ent !== 'object') return null;
  return ent.material || null;
}
function unitsOf(ent) {
  if (!ent) return 0;
  if (typeof ent === 'string') return 1;
  return (ent.units || 1);
}
// Engine-mirror ammo count for one ammoId over one item list.
function ammoCountOf(list, ammoId) {
  let n = 0;
  try {
    for (const ent of (list || [])) {
      if (!ent) continue;
      if (itemIdOf(ent) === ammoId || matOf(ent) === ammoId) n += unitsOf(ent);
    }
  } catch (e) {}
  return n;
}
function ammoByType(list) {
  const out = {};
  for (const id of AMMO_IDS) out[id] = ammoCountOf(list, id);
  return out;
}
function defOf(Game, id) {
  try {
    const items = Game.data && Game.data.items;
    if (Array.isArray(items)) { const d = items.find(x => x && x.id === id); if (d) return d; }
  } catch (e) {}
  return null;
}
function personOf(Game, vid) {
  try {
    const lists = [];
    if (Game.data && Array.isArray(Game.data.villagers)) lists.push(Game.data.villagers);
    if (Game.data && Array.isArray(Game.data.background_survivors)) lists.push(Game.data.background_survivors);
    for (const l of lists) { const f = l.find(x => x && x.id === vid); if (f) return f; }
  } catch (e) {}
  return null;
}
// All persons, deduped by id: villagers + background_survivors + rosterChars.
function allPersons(Game) {
  const out = [], seen = {};
  try {
    const push = (p) => {
      if (!p || !p.id || seen[p.id]) return;
      seen[p.id] = true; out.push(p);
    };
    if (Game.data && Array.isArray(Game.data.villagers)) for (const p of Game.data.villagers) push(p);
    if (Game.data && Array.isArray(Game.data.background_survivors)) for (const p of Game.data.background_survivors) push(p);
    const rc = ((Game.state || {}).village || {}).rosterChars;
    if (rc && typeof rc === 'object') for (const k of Object.keys(rc)) push(rc[k]);
  } catch (e) {}
  return out;
}
// Raw communal stash read (NO stashState() call — that initializes = writes).
function rawStash(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const st = v.stash || {};
    return {
      materials: (st.materials && typeof st.materials === 'object') ? st.materials : {},
      sections: {
        tools: Array.isArray(st.tools) ? st.tools : [],
        weapons: Array.isArray(st.weapons) ? st.weapons : [],
        medicine: Array.isArray(st.medicine) ? st.medicine : [],
        armor: Array.isArray(st.armor) ? st.armor : [],
      },
      present: !!v.stash,
    };
  } catch (e) { return { materials: {}, sections: { tools: [], weapons: [], medicine: [], armor: [] }, present: false }; }
}
function sectionAmmo(sections) {
  const out = {};
  for (const name of Object.keys(sections)) out[name] = ammoByType(sections[name]);
  return out;
}
function pantryAmmo(Game) {
  try {
    const pantry = ((Game.state || {}).village || {}).pantry || [];
    // Pantry entries carry food fields (plantId, kcalEach...); an ammo
    // entry would have to carry an itemId/id/material tag. Also scan
    // names against ammo names as a secondary net.
    const names = { arrow: 'Arrow', bolt: 'Crossbow bolt', stone: 'Stone', heartseeker_arrows: 'Heartseeker Arrows', fusion_cell: 'Fusion cell' };
    const out = {};
    for (const id of AMMO_IDS) {
      let n = ammoCountOf(pantry, id);
      if (n === 0) {
        for (const ent of pantry) {
          if (ent && typeof ent === 'object' && ent.name === names[id]) n += unitsOf(ent);
        }
      }
      out[id] = n;
    }
    return { byType: out, entries: pantry.length };
  } catch (e) { return { byType: {}, entries: 0 }; }
}
function scholarAmmo(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    return ammoByType(inv);
  } catch (e) { return {}; }
}
// Village-wide person totals, excluding one vid (the fighter).
function villagePersonTotals(Game, excludeVid) {
  const carried = {}, stashed = {};
  for (const id of AMMO_IDS) { carried[id] = 0; stashed[id] = 0; }
  let persons = 0, carriers = 0;
  try {
    for (const p of allPersons(Game)) {
      if (p.id === excludeVid) continue;
      persons++;
      const c = ammoByType(p.items || []);
      const s = ammoByType(p.stashed || []);
      let any = false;
      for (const id of AMMO_IDS) { carried[id] += c[id]; stashed[id] += s[id]; if (c[id] || s[id]) any = true; }
      if (any) carriers++;
    }
  } catch (e) {}
  return { carried: carried, stashed: stashed, persons: persons, carriers: carriers };
}
function storageSnapshot(Game, excludeVid) {
  const stash = rawStash(Game);
  const persons = villagePersonTotals(Game, excludeVid);
  return {
    stashPresent: stash.present,
    stashMaterials: Object.assign({}, stash.materials),
    stashSections: sectionAmmo(stash.sections),
    pantry: pantryAmmo(Game),
    otherPersonsCarried: persons.carried,
    otherPersonsStashed: persons.stashed,
    otherPersons: persons.persons,
    otherCarriers: persons.carriers,
    scholarInventory: scholarAmmo(Game),
  };
}

function installAmmoStorageDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._ammoStorageDiagStore === store && Game._ammoStorageDiagInstalled) return Game._ammoStorageDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        opts = opts || {};
        fighterCarriedByType = {};
        // ---- pre-fight reads (pure; never fed back) ----
        let preRanged = null, preAmmoId = null, preAmmoN = null;
        let preCarriedRanged = [], preCarriedAmmoUnits = 0;
        let preFighterStashed = null, preStorage = null;
        try {
          const vp = personOf(Game, vid);
          if (vp) {
            const eq = vp.equipped || {};
            preRanged = eq.ranged ? (eq.ranged.itemId || eq.ranged.id || null) : null;
            if (preRanged) {
              const d = defOf(Game, preRanged);
              preAmmoId = (d && d.weapon) ? (d.weapon.ammo || null) : null;
              if (preAmmoId) preAmmoN = ammoCountOf(vp.items || [], preAmmoId);
            }
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
            }
            for (const ent of (vp.items || [])) {
              const id = itemIdOf(ent);
              const d = id ? defOf(Game, id) : null;
              if (d && d.class === 'ammo') preCarriedAmmoUnits += unitsOf(ent);
            }
            fighterCarriedByType = ammoByType(vp.items || []);
            preFighterStashed = ammoByType(vp.stashed || []);
          }
        } catch (e) { noteErr(store, 'ammostorage.pre', e); }
        try { preStorage = storageSnapshot(Game, vid); } catch (e) { noteErr(store, 'ammostorage.storage', e); preStorage = null; }
        const rec = orig.apply(this, arguments);
        try {
          if (!rec) { store.noRecord++; return rec; }
          // ---- post-fight gate classification (volley-a G0–G8, verbatim logic) ----
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
          } catch (e) { noteErr(store, 'ammostorage.post', e); }
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
          else if (!volley) gate = 'G6-bow-no-ammo';
          else gate = 'G8-exception-suspect';
          const fighterCarried = fighterCarriedByType;
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: (mdef && mdef.id) || null, wave: (mdef && mdef.wave) ? (mdef.wave | 0) : 1,
            ephemeral: !m,
            outcome: rec.outcome || null, rounds: rec.rounds | 0,
            totalDmg: rec.mDealt != null ? (rec.mDealt | 0) : null,
            volleyDmg: volley ? (volley.dmg | 0) : 0,
            volleyShots: volley ? (volley.shots | 0) : null,
            volleyHits: volley ? (volley.hits | 0) : null,
            volleyAmmoLeft: volley ? (volley.ammoLeft != null ? (volley.ammoLeft | 0) : null) : null,
            intent: rec.intent || null, intentWhy: rec.intentWhy || null,
            gate: gate,
            preRanged: preRanged, postRanged: postRanged,
            postDefName: postDef ? (postDef.name || null) : null,
            postAmmoId: postAmmoId, preAmmoId: preAmmoId, preAmmoN: preAmmoN,
            carriedRanged: preCarriedRanged, carriedAmmoUnits: preCarriedAmmoUnits,
            fighterCarriedByType: fighterCarriedByType,
            fighterStashedByType: preFighterStashed,
            storage: preStorage,
            isScholar: (() => { try { return vid === Game.villagerId; } catch (e) { return false; } })(),
          });
        } catch (e) { noteErr(store, 'ammostorage.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
    } else { noteErr(store, 'fieldFight.missing', new Error('no fieldFight')); }
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._ammoStorageDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._ammoStorageDiagStore = store;
    Game._ammoStorageDiagInstalled = true;
    Game._ammoStorageDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

// Pre-fight fighter carried-by-type, captured in the wrap closure.
// (Kept as a module-level handoff because the post-fight push needs
// the pre-fight person read; the wrap sets it before delegating.)
let fighterCarriedByType = {};

function withAmmoStorageDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      if (layerOn()) {
        try { installAmmoStorageDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._ammostorage = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
        // Light daily snapshot BEFORE the day's actions.
        try {
          const snap = storageSnapshot(Game, null);
          pushCapped(st, 'dailySnapshots', { day: dayOf(Game), storage: snap });
        } catch (e) { noteErr(st, 'daily.snap', e); }
      }
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installAmmoStorageDiag, withAmmoStorageDiag, MAX_EVENTS, AMMO_IDS };
