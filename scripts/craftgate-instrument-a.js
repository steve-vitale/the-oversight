#!/usr/bin/env node
// craftgate-instrument-a.js — home-duty craft-gate instrument (arm
// sim-craftgate-a, Loop A 20261127T1915Z, axis scale-onramp).
//
// The 2115Z next blank #1 (evidence/2026-11-24/sim-aidammo-a.md §§3b, 4,
// 13): home-duty craft supplies 0.849 of the ammo fighters hold at
// wave-4+ entry, but 131/149 empty-quivered fighters NEVER received a
// batch — and seed 110501 made 0 batches in 150d on 1 failed attempt.
// This instrument opens the gate (villagerAmmoCraftDay,
// src/js/villager-build.js:1584) and watches it: a pure-read gate
// replica evaluated inside the duty wrap BEFORE the original runs (the
// exact state the duty sees), per-vid attempt rows from the wrap's
// before/after diff, and a daily pile + at-home-carrier snapshot.
//
// REUSED from aidammo (scripts/aidammo-driver-a.js, required — not
// copied): the ammo-provenance ledger (createAmmoLedger, ledgerSeed,
// ledgerDaily, ammoSnapVid, ammoSnapAll, ammoRangedKit, provShares,
// provTake, provMove, provPush, AMMO_IDS, fightOrigin, loadWave4Ids,
// recoverMHpStart). The villagerPocketAmmo / villagerKillLoot wraps
// below are copied verbatim from aidammo-driver-a.js (same accounting,
// cited here) so the ledger stays complete; the fieldFight wrap is a
// lean re-implementation (pre-call kit + provenance, post-call spend
// diff, wave-4+ rows) in the same row shape, so the aidammo analyzer's
// ammoAtEntryAll / ledgerStats / ledgerHash read this corpus unchanged.
// The villagerAmmoCraftDay wrap below is aidammo's ledger accounting
// PLUS the gate snapshot + attempt rows (the new instrument).
//
// All wraps call each original exactly once and draw no RNG — pure
// reads + snapshot diffs. The gate replica NEVER calls eq.autoEquip
// (it mutates): a carried-but-unequipped bow is recorded as
// weaponSource 'carried-autoequip' (see prereg §1a).
//
//   install(Game) -> { gateDays, attempts, pileDaily, v4encounters,
//     ammoLedger, dutyCalls, errors, uninstall }
//   gateSnapshot(Game, day, withRows) -> { rows, counts, pile }
//   pileSnapshot(Game) -> { stick, stone, fiber, materials }
//   gateStateOf(row-ish inputs) is internal; the analyzer classifies
//   causes from the stored rows (state + shortfall + attempt outcome).
'use strict';
const AID = require('./aidammo-driver-a.js');
const createAmmoLedger = AID.createAmmoLedger;
const ledgerSeed = AID.ledgerSeed;
const ledgerDaily = AID.ledgerDaily;
const ammoSnapVid = AID.ammoSnapVid;
const ammoSnapAll = AID.ammoSnapAll;
const ammoRangedKit = AID.ammoRangedKit;
const provShares = AID.provShares;
const provTake = AID.provTake;
const provMove = AID.provMove;
const provPush = AID.provPush;
const AMMO_IDS = AID.AMMO_IDS;
const fightOrigin = AID.fightOrigin;
const loadWave4Ids = AID.loadWave4Ids;
const recoverMHpStart = AID.recoverMHpStart;

const W4_SET = new Set(loadWave4Ids());
const CAP = 5; // one recipe batch; the duty's stocked threshold
const CRAFTABLE = { arrow: true, bolt: true };

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }
function entryId(ent) {
  if (typeof ent === 'string') return ent;
  if (!ent) return null;
  return ent.itemId || ent.id || ent.material || null;
}
function entryUnits(ent) {
  if (!ent) return 0;
  if (typeof ent === 'string') return 1;
  return ent.units || 1;
}
function countIn(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) if (entryId(e) === ammoId) n += entryUnits(e);
  return n;
}
function defOf(Game, id) {
  try {
    const items = (Game.data && Game.data.items) || [];
    for (let i = 0; i < items.length; i++) if (items[i] && items[i].id === id) return items[i];
  } catch (e) {}
  return null;
}
// pileSnapshot(Game): the communal pile materials, read directly off
// v.stash.materials — the same object stashState() returns
// (src/js/storage.js:248), so this is the exact map the duty reads,
// without calling stashState() (which would initialize defaults).
function pileSnapshot(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const mats = (v.stash && v.stash.materials) || {};
    return { stick: (mats.stick | 0), stone: (mats.stone | 0), fiber: (mats.fiber | 0),
      materials: JSON.parse(JSON.stringify(mats)) };
  } catch (e) { return { stick: 0, stone: 0, fiber: 0, materials: {} }; }
}
// ownMatCount(p, mat, Game): the duty's isMatEntry rule, verbatim in
// effect — pack entries carrying a material key (never gear): a bare
// string equal to the material, e.material === mat, or e.itemId === mat
// whose def is not a weapon/armor.
function ownMatCount(Game, p, mat) {
  try {
    const defs = (Game.data && Game.data.items) || [];
    const defOfId = function (id) { for (let i = 0; i < defs.length; i++) if (defs[i] && defs[i].id === id) return defs[i]; return null; };
    let n = 0;
    for (const e of (p.items || [])) {
      let isMat = false;
      if (typeof e === 'string') isMat = (e === mat);
      else if (e) {
        if (e.material === mat) isMat = true;
        else if (e.itemId === mat) { const d = defOfId(mat); isMat = !(d && (d.weapon || d.armor)); }
      }
      if (isMat) n += entryUnits(e);
    }
    return n;
  } catch (e) { return 0; }
}
// rangedWeaponRead(Game, p): the duty's weapon read WITHOUT autoEquip
// (never called — it mutates). Returns { rw, rangedId, ammoId,
// weaponSource } where weaponSource is 'equipped' (rangedWeaponOf or
// the equipped ranged slot) or 'carried-autoequip' (a bow/crossbow in
// the pack the duty's autoEquip would seat). A spear in the ranged slot
// yields ammoId null — it is not a candidate.
function rangedWeaponRead(Game, p) {
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const defs = (Game.data && Game.data.items) || [];
    let rw = null, source = null;
    try { if (S.equipment && S.equipment.rangedWeaponOf) rw = S.equipment.rangedWeaponOf(p, defs) || null; } catch (e) {}
    if (rw) source = 'equipped';
    if (!rw) {
      const eq = p.equipped || {};
      if (eq.ranged) { rw = eq.ranged; source = 'equipped'; }
    }
    if (rw) {
      const rwId = entryId(rw);
      const rdef = defOf(Game, rwId);
      const ammoId = (rdef && rdef.weapon && rdef.weapon.ammo) || null;
      return { rw: rw, rangedId: rwId, ammoId: ammoId, weaponSource: source };
    }
    // No seated ranged weapon: scan the pack for a craftable bow/crossbow
    // (what the duty's autoEquip would seat). First match wins.
    for (const e of (p.items || [])) {
      const id = entryId(e);
      const d = defOf(Game, id);
      if (d && d.weapon && d.weapon.type === 'ranged' && d.weapon.ammo && CRAFTABLE[d.weapon.ammo]) {
        return { rw: e, rangedId: id, ammoId: d.weapon.ammo, weaponSource: 'carried-autoequip' };
      }
    }
    return { rw: null, rangedId: null, ammoId: null, weaponSource: null };
  } catch (e) { return { rw: null, rangedId: null, ammoId: null, weaponSource: null }; }
}
// gateSnapshot(Game, day, withRows, seen): the pure-read gate replica —
// one row per candidate per duty-day, evaluated in duty order. `seen`
// is the install closure's candidate set: a vid who was a candidate on
// an earlier day still gets a row (state 'no-weapon' / 'not-craftable')
// when they no longer carry a craftable ranged weapon, so a weapon loss
// is visible instead of silent. withRows=false returns counts + pile
// only (the end-of-day census). Never throws into the caller.
function gateSnapshot(Game, day, withRows, seen) {
  const out = { day: day, rows: [],
    counts: { candidates: 0, atHome: 0, away: 0, short: 0, stocked: 0,
      matsOk: 0, noMaterials: 0, cooldown: 0, attemptEligible: 0 },
    pile: pileSnapshot(Game) };
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    const away = v.away || {};
    const cd = v.arrowCraftCd || {};
    const levels = v.ammoCraft || {};
    const recipes = (Game.data && Game.data.recipes) || [];
    const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
    const pile = out.pile.materials || {};
    for (const vid of roster) {
      if (!vid || vid === Game.villagerId) continue;
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!p) continue;
      const dead = !!p.dead;
      const isAway = !!away[vid];
      const wr = rangedWeaponRead(Game, p);
      const wasCandidate = !!(seen && seen[vid]);
      const isCandidate = !dead && wr.rw && wr.ammoId && CRAFTABLE[wr.ammoId];
      if (!isCandidate) {
        // Only a previously-seen candidate gets a row for losing the
        // weapon (state 'no-weapon' / 'not-craftable', cause other);
        // everyone else was never in the population.
        if (wasCandidate && !dead && withRows) {
          let node = null;
          try { const n = Game.npcNode ? Game.npcNode(vid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
          out.rows.push({ day: day, vid: vid, state: wr.rw ? 'not-craftable' : 'no-weapon',
            cause: 'other', rangedId: wr.rangedId, ammoId: wr.ammoId, weaponSource: wr.weaponSource,
            carried: 0, away: isAway, atHaven: !!(node && node.nx === hx && node.ny === hy),
            node: node, cooldown: false, cdDay: (cd[vid] != null ? cd[vid] : null),
            level: null, own: {}, need: {}, shortfall: [], pile: { stick: out.pile.stick, stone: out.pile.stone, fiber: out.pile.fiber } });
        }
        continue;
      }
      if (seen) seen[vid] = true;
      const ammoId = wr.ammoId;
      const carried = countIn(p.items || [], ammoId);
      const lastCd = (cd[vid] != null ? cd[vid] : null);
      const cooldown = (cd[vid] || -99) > day - 3;
      const level = (((levels[vid] || {})[ammoId]) || 1);
      const recipe = recipes.find(function (r) { return r.id === ammoId; }) || null;
      const need = (recipe && recipe.materials) ? recipe.materials : {};
      const own = {};
      const shortfall = [];
      let pileAloneOk = true, ownAloneOk = true;
      for (const m of Object.keys(need)) {
        own[m] = ownMatCount(Game, p, m);
        const have = own[m] + (pile[m] || 0);
        if (have < need[m]) shortfall.push({ mat: m, need: need[m], have: have, own: own[m], pile: (pile[m] || 0) });
        if ((pile[m] || 0) < need[m]) pileAloneOk = false;
        if (own[m] < need[m]) ownAloneOk = false;
      }
      let node = null;
      try { const n = Game.npcNode ? Game.npcNode(vid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
      const atHaven = !!(node && node.nx === hx && node.ny === hy);
      let state, cause;
      if (isAway) { state = 'away'; cause = 'carrier-absent'; }
      else if (carried >= CAP) { state = 'stocked'; cause = null; }
      else if (cooldown) { state = 'cooldown'; cause = 'carrier-present-but-not-crafting'; }
      else if (!recipe) { state = 'no-recipe'; cause = 'other'; }
      else if (shortfall.length) { state = 'no-materials'; cause = 'pile-materials-absent'; }
      else { state = 'attempt-eligible'; cause = 'attempt'; }
      out.counts.candidates++;
      if (isAway) out.counts.away++;
      else out.counts.atHome++;
      if (carried >= CAP) out.counts.stocked++;
      else {
        out.counts.short++;
        if (state === 'no-materials') out.counts.noMaterials++;
        if (state === 'cooldown') out.counts.cooldown++;
        if (state === 'attempt-eligible') { out.counts.attemptEligible++; out.counts.matsOk++; }
      }
      if (withRows) {
        out.rows.push({ day: day, vid: vid, state: state, cause: cause,
          rangedId: wr.rangedId, ammoId: ammoId, weaponSource: wr.weaponSource,
          carried: carried, away: isAway, atHaven: atHaven, node: node,
          cooldown: cooldown, cdDay: lastCd, level: level,
          own: own, need: need, shortfall: shortfall,
          pileAloneOk: pileAloneOk, ownAloneOk: ownAloneOk,
          pile: { stick: out.pile.stick, stone: out.pile.stone, fiber: out.pile.fiber } });
      }
    }
  } catch (e) { out.error = String(e.message).slice(0, 80); }
  return out;
}

function waveOf(mdef) { try { return (mdef && mdef.wave) | 0; } catch (e) { return 0; } }

function install(Game) {
  const gateDays = [];
  const attempts = [];
  const pileDaily = [];
  const v4encounters = [];
  const errors = [];
  const seenCandidates = {};
  let dutyCalls = 0;
  // Originals captured BEFORE any wrap (uninstall restores these).
  const origACD0 = Game.villagerAmmoCraftDay;
  const origPA0 = Game.villagerPocketAmmo;
  const origKL0 = Game.villagerKillLoot;
  const origFF0 = Game.fieldFight;
  const ammoLedger = createAmmoLedger();
  try { ledgerSeed(ammoLedger, Game, gday(Game)); } catch (e) { errors.push('ledger-seed: ' + String(e.message).slice(0, 80)); }

  // ---- villagerAmmoCraftDay wrap: aidammo's ledger accounting PLUS
  // the gate snapshot (pre-duty state) + per-vid attempt rows.
  // Copied ledger block cited: aidammo-driver-a.js oneRun, the
  // origACD wrap (before/after snapshot diff, provPush home-duty,
  // ledgerRefreshVid). The gate snapshot + attempt diff are new here.
  try {
    const origACD = Game.villagerAmmoCraftDay;
    if (typeof origACD === 'function') {
      Game.villagerAmmoCraftDay = function () {
        dutyCalls++;
        const day = gday(Game);
        const before = ammoSnapAll(Game);
        // Pre-duty gate state, per candidate (the state the duty sees).
        let gate = null;
        try { gate = gateSnapshot(Game, day, true, seenCandidates); } catch (e) { errors.push('gate-snapshot: ' + String(e.message).slice(0, 80)); }
        if (gate && gate.rows) { for (const r of gate.rows) gateDays.push(r); }
        // Pre-call cooldown + carried-ammo per vid (attempt detection).
        const preCd = {};
        const preCarried = {};
        const preLevel = {};
        try {
          const v = (Game.state || {}).village || {};
          for (const vid of Object.keys(before)) {
            preCd[vid] = ((v.arrowCraftCd || {})[vid] != null ? (v.arrowCraftCd || {})[vid] : null);
            preLevel[vid] = JSON.parse(JSON.stringify((v.ammoCraft || {})[vid] || {}));
            preCarried[vid] = before[vid];
          }
        } catch (e) { errors.push('attempt-pre: ' + String(e.message).slice(0, 80)); }
        let ret = 0;
        try { ret = origACD.apply(this, arguments); }
        finally {
          try {
            ammoLedger.counters.homeDutyCalls++;
            ammoLedger.counters.homeDutyBatches += (ret | 0);
            const after = ammoSnapAll(Game);
            const v = (Game.state || {}).village || {};
            for (const vid of Object.keys(after)) {
              for (const ammoId of AMMO_IDS) {
                const b = before[vid] ? before[vid][ammoId] : { carried: 0, stashed: 0 };
                const a = after[vid][ammoId];
                const totGain = (a.carried + a.stashed) - (b.carried + b.stashed);
                if (totGain > 0) {
                  if (a.carried - b.carried > 0) provPush(ammoLedger, vid, ammoId, 'carried', 'home-duty', day, a.carried - b.carried);
                  if (a.stashed - b.stashed > 0) provPush(ammoLedger, vid, ammoId, 'stashed', 'home-duty', day, a.stashed - b.stashed);
                }
              }
              // Attempt detection: the duty sets arrowCraftCd[vid] =
              // today exactly when it attempts (materials-skip sets no
              // cooldown). Success = carried-ammo gain for the vid's
              // craftable ammo id.
              try {
                const cdNow = ((v.arrowCraftCd || {})[vid] != null ? (v.arrowCraftCd || {})[vid] : null);
                if (cdNow === day && preCd[vid] !== day) {
                  let ammoId = null, gain = 0;
                  const grow = (gate && gate.rows) ? gate.rows.find(function (r) { return r.vid === vid && r.state === 'attempt-eligible'; }) : null;
                  if (grow) ammoId = grow.ammoId;
                  if (!ammoId) {
                    for (const id of ['arrow', 'bolt']) {
                      const g = ((after[vid] || {})[id] || { carried: 0 }).carried - ((before[vid] || {})[id] || { carried: 0 }).carried;
                      if (g > 0) { ammoId = id; gain = g; break; }
                    }
                  }
                  if (ammoId && !gain) {
                    gain = ((after[vid] || {})[ammoId] || { carried: 0 }).carried - ((before[vid] || {})[ammoId] || { carried: 0 }).carried;
                  }
                  const lvl = (preLevel[vid] && preLevel[vid][ammoId]) || 1;
                  attempts.push({ day: day, vid: vid, ammoId: ammoId, attempted: true,
                    success: gain > 0, unitsGained: gain, level: lvl, blind: lvl < 2 });
                }
              } catch (e) { errors.push('attempt-post: ' + String(e.message).slice(0, 80)); }
              try {
                const sn = ammoSnapVid(Game, vid);
                if (sn) ammoLedger.lastSnap[vid] = sn;
              } catch (e) {}
            }
          } catch (e) { errors.push('ledger-craftday: ' + String(e.message).slice(0, 80)); }
        }
        return ret;
      };
    } else errors.push('ledger-craftday-wrap: not a function');
  } catch (e) { errors.push('ledger-craftday-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- villagerPocketAmmo wrap: copied verbatim from
  // aidammo-driver-a.js (same accounting, same counters) so the ledger
  // stays complete on departure craft / pile stones / stash moves.
  try {
    const origPA = Game.villagerPocketAmmo;
    if (typeof origPA === 'function') {
      Game.villagerPocketAmmo = function (vid) {
        const before = ammoSnapVid(Game, vid);
        let out = { pocketed: 0, crafted: 0, craftedOk: false, ammoId: null };
        try { out = origPA.apply(this, arguments) || out; }
        finally {
          try {
            ammoLedger.counters.departureCalls++;
            const after = ammoSnapVid(Game, vid);
            const ammoId = out.ammoId;
            if (before && after && ammoId) {
              const b = before[ammoId], a = after[ammoId];
              const stashMoved = Math.max(0, b.stashed - a.stashed);
              const carriedGain = a.carried - b.carried;
              if (stashMoved > 0) {
                provMove(ammoLedger, vid, ammoId, 'stashed', 'carried', stashMoved, gday(Game));
                ammoLedger.counters.departureStashMoved += stashMoved;
              }
              const remainder = carriedGain - stashMoved;
              if (remainder > 0) {
                if (ammoId === 'stone') {
                  provPush(ammoLedger, vid, ammoId, 'carried', 'departure-pile-stones', gday(Game), remainder);
                  ammoLedger.counters.departureStones += remainder;
                } else if (out.craftedOk) {
                  provPush(ammoLedger, vid, ammoId, 'carried', 'departure-craft', gday(Game), remainder);
                } else {
                  provPush(ammoLedger, vid, ammoId, 'carried', 'other', gday(Game), remainder);
                  ammoLedger.other.push({ seq: ammoLedger.seq, day: gday(Game), vid: vid, ammoId: ammoId, units: remainder, loc: 'carried', note: 'pocket-unexplained' });
                }
              } else if (remainder < 0) {
                provTake(ammoLedger, vid, ammoId, 'carried', -remainder, gday(Game));
              }
              if (out.crafted) {
                ammoLedger.counters.departureCraftAttempts += (out.crafted | 0);
                if (out.craftedOk) ammoLedger.counters.departureCraftOk += 1;
              }
            }
            const sn = ammoSnapVid(Game, vid);
            if (sn) ammoLedger.lastSnap[vid] = sn;
          } catch (e) { errors.push('ledger-pocket: ' + String(e.message).slice(0, 80)); }
        }
        return out;
      };
    } else errors.push('ledger-pocket-wrap: not a function');
  } catch (e) { errors.push('ledger-pocket-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- villagerKillLoot wrap: copied verbatim from
  // aidammo-driver-a.js (same accounting) — loot is the only other
  // production path the ledger names.
  try {
    const origKL = Game.villagerKillLoot;
    if (typeof origKL === 'function') {
      Game.villagerKillLoot = function (vid, mdef) {
        const before = ammoSnapVid(Game, vid);
        let dropId = null;
        try { dropId = origKL.apply(this, arguments); }
        finally {
          try {
            if (dropId) ammoLedger.counters.lootDrops++;
            const after = ammoSnapVid(Game, vid);
            if (before && after) {
              for (const ammoId of AMMO_IDS) {
                const gain = (after[ammoId].carried + after[ammoId].stashed) - (before[ammoId].carried + before[ammoId].stashed);
                if (gain > 0) {
                  if (after[ammoId].carried - before[ammoId].carried > 0) provPush(ammoLedger, vid, ammoId, 'carried', 'loot', gday(Game), after[ammoId].carried - before[ammoId].carried);
                  if (after[ammoId].stashed - before[ammoId].stashed > 0) provPush(ammoLedger, vid, ammoId, 'stashed', 'loot', gday(Game), after[ammoId].stashed - before[ammoId].stashed);
                  ammoLedger.counters.lootAmmoDrops++;
                }
              }
            }
            const sn = ammoSnapVid(Game, vid);
            if (sn) ammoLedger.lastSnap[vid] = sn;
          } catch (e) { errors.push('ledger-killloot: ' + String(e.message).slice(0, 80)); }
        }
        return dropId;
      };
    } else errors.push('ledger-killloot-wrap: not a function');
  } catch (e) { errors.push('ledger-killloot-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- fieldFight wrap (lean): pre-call kit + provenance for lead +
  // allies, post-call spend diff (watched and unwatched), wave-4+
  // encounter rows in the aidammo row shape (origin, rangedId,
  // ammoAtEntry, ammoProv, alliesAmmo, volley, volleySpend, log).
  try {
    const origFF = Game.fieldFight;
    if (typeof origFF === 'function') {
      Game.fieldFight = function (vid, mdef, m, opts) {
        const w = waveOf(mdef);
        const watch = w >= 4 && mdef && mdef.id;
        let preHp = null;
        try {
          const hpOf = function (o) { if (!o) return null; const v = (o.maxHp != null ? o.maxHp : o.hp); return (typeof v === 'number' && isFinite(v) && v > 0) ? v : null; };
          preHp = hpOf(m) || hpOf(mdef);
        } catch (e) {}
        let ffPre = null;
        try {
          const allyList = ((opts && opts.allyVids) || []).slice();
          const leadKit = ammoRangedKit(this, vid);
          ffPre = { lead: { vid: vid, snap: ammoSnapVid(Game, vid), kit: leadKit,
            prov: leadKit.ammoId ? provShares(ammoLedger, vid, leadKit.ammoId, 'carried') : [] },
            allies: allyList.map(function (av) {
              const k = ammoRangedKit(Game, av);
              return { vid: av, snap: ammoSnapVid(Game, av), kit: k,
                prov: k.ammoId ? provShares(ammoLedger, av, k.ammoId, 'carried') : [] };
            }) };
        } catch (e) { errors.push('ledger-ff-pre: ' + String(e.message).slice(0, 80)); }
        let row = null;
        if (watch) {
          let rangedId = null, ammoAtEntry = 0;
          try {
            if (ffPre) { rangedId = ffPre.lead.kit.rangedId; ammoAtEntry = ffPre.lead.kit.ammoAtEntry; }
          } catch (e) {}
          row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            mHpStart: null, vKill: false, mHpStartRec: null,
            alliesN: (opts && opts.allies) | 0,
            allyVids: ((opts && opts.allyVids) || []).slice(0, 2),
            origin: fightOrigin(),
            outcome: null, rounds: null, vTaken: null, mDealt: null,
            rangedId: rangedId, ammoAtEntry: ammoAtEntry, volley: null,
            ammoProv: ffPre ? ffPre.lead.prov : [],
            alliesAmmo: ffPre ? ffPre.allies.map(function (a) { return { vid: a.vid, rangedId: a.kit.rangedId, ammoId: a.kit.ammoId, ammoAtEntry: a.kit.ammoAtEntry, prov: a.prov, spent: null }; }) : [],
            volleySpend: null, log: [] };
        }
        let rec = null;
        try { rec = origFF.apply(this, arguments); }
        finally { if (watch) { /* row closed below */ } }
        try {
          const spendFor = function (entry, isLead) {
            const after = ammoSnapVid(Game, entry.vid);
            if (!entry.snap || !after) return;
            for (const ammoId of AMMO_IDS) {
              const spent = entry.snap[ammoId].carried - after[ammoId].carried;
              if (spent > 0) {
                const shares = provTake(ammoLedger, entry.vid, ammoId, 'carried', spent, gday(Game));
                const rec2 = { vid: entry.vid, ammoId: ammoId, units: spent, sources: shares };
                ammoLedger.spends.push(Object.assign({ seq: ++ammoLedger.seq, day: gday(Game) }, rec2));
                if (watch && row) {
                  if (isLead) row.volleySpend = rec2;
                  else {
                    const slot = (row.alliesAmmo || []).find(function (x) { return x.vid === entry.vid; });
                    if (slot) slot.spent = rec2;
                  }
                }
              }
            }
            const sn = ammoSnapVid(Game, entry.vid);
            if (sn) ammoLedger.lastSnap[entry.vid] = sn;
          };
          if (watch && row && rec) {
            const recov = recoverMHpStart(rec, preHp);
            row.mHpStart = recov.mHpStart;
            row.vKill = !!recov.vKill;
            try { row.mHpStartRec = (typeof rec.mHpStart === 'number' && isFinite(rec.mHpStart)) ? rec.mHpStart : null; } catch (e) {}
            row.outcome = rec.outcome || null;
            row.rounds = rec.rounds | 0;
            row.vTaken = rec.vTaken | 0;
            row.mDealt = rec.mDealt | 0;
            try { row.volley = (rec.volley && typeof rec.volley.shots === 'number') ? { shots: rec.volley.shots | 0, hits: rec.volley.hits | 0, dmg: rec.volley.dmg | 0, ammoLeft: (rec.volley.ammoLeft != null ? rec.volley.ammoLeft | 0 : null) } : null; } catch (e) { row.volley = null; }
            try { row.log = (rec.log || []).slice(0, 20).map(function (s) { return String(s).slice(0, 400); }); } catch (e) { row.log = []; }
          }
          if (ffPre) {
            spendFor(ffPre.lead, true);
            for (const a of ffPre.allies) spendFor(a, false);
          }
          if (watch && row) v4encounters.push(row);
        } catch (e) { errors.push('ledger-ff-spend: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }

  function daily(Game2, day) {
    // End-of-day ledger reconcile + pile + carrier census. Called
    // from the driver's policy-daily finally block.
    try { ledgerDaily(ammoLedger, Game2, day, errors); } catch (e) { errors.push('ledger-daily-call: ' + String(e.message).slice(0, 80)); }
    try {
      const census = gateSnapshot(Game2, day, false, seenCandidates);
      const pile = census.pile;
      const arrowOk = (pile.stick >= 2 && pile.stone >= 1 && pile.fiber >= 1);
      const boltOk = (pile.stick >= 2 && pile.stone >= 1);
      pileDaily.push({ day: day, pile: { stick: pile.stick, stone: pile.stone, fiber: pile.fiber },
        arrowRecipeOk: arrowOk, boltRecipeOk: boltOk,
        candidates: census.counts.candidates, atHome: census.counts.atHome,
        away: census.counts.away, short: census.counts.short,
        stocked: census.counts.stocked, matsOk: census.counts.matsOk,
        noMaterials: census.counts.noMaterials, cooldown: census.counts.cooldown,
        attemptEligible: census.counts.attemptEligible });
    } catch (e) { errors.push('pile-daily: ' + String(e.message).slice(0, 80)); }
  }
  return { gateDays: gateDays, attempts: attempts, pileDaily: pileDaily,
    v4encounters: v4encounters, ammoLedger: ammoLedger,
    dutyCalls: function () { return dutyCalls; },
    errors: errors, daily: daily,
    uninstall: function () {
      try { if (typeof origACD0 === 'function') Game.villagerAmmoCraftDay = origACD0; } catch (e) {}
      try { if (typeof origPA0 === 'function') Game.villagerPocketAmmo = origPA0; } catch (e) {}
      try { if (typeof origKL0 === 'function') Game.villagerKillLoot = origKL0; } catch (e) {}
      try { if (typeof origFF0 === 'function') Game.fieldFight = origFF0; } catch (e) {}
    } };
}

module.exports = { install: install, gateSnapshot: gateSnapshot, pileSnapshot: pileSnapshot,
  rangedWeaponRead: rangedWeaponRead, ownMatCount: ownMatCount, AMMO_IDS: AMMO_IDS, CAP: CAP };
