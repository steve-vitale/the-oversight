#!/usr/bin/env node
// scholarhome-conservation-20261021.js — DIAG instrument for the scholar_home
// (returnToVillage homecoming-pool deposit, game.js depositPantryPieces call
// at ~8348) conservation story.
//
// Method: tag every piece deposited through the homecoming pool with a unique
// per-deposit __shTag (via a behavior-faithful reimplementation of
// depositPantryPieces whose ONLY delta is tag-aware merge: tagged pieces merge
// only with same-tag stacks). Then wrap every named pantry-removal path with
// pre/post tagged-kcal diffs (outermost hook wins; nested hooks defer) and
// attribute each tagged kcal to a named sink. At run end the residual tagged
// kcal in the pantry closes the equation:
//
//   inflow == sum(sinks) + in_pantry,  within +/-2%
//
// Instrument-only: zero src/js changes. All behavior deltas are verified by
// scripts/test-scholarhome-20261021.js (fidelity: instrumented vs pristine
// digests identical; det-gate: identical re-runs byte-identical).
'use strict';
const path = require('path');
const fs = require('fs');

const TAG = '__shTag';

// ---------------------------------------------------------------------------
// substrate assertion (LOUD STOP, pre-registration binding)
// ---------------------------------------------------------------------------
function assertSubstrate() {
  const problems = [];
  if (process.env.FEASTSCALE_R13 !== '1') problems.push(`FEASTSCALE_R13=${process.env.FEASTSCALE_R13} (need 1)`);
  if (process.env.SEATDRIVE !== '0') problems.push(`SEATDRIVE=${process.env.SEATDRIVE} (need explicit 0)`);
  if (process.env.SURPLUSFEED !== undefined) problems.push(`SURPLUSFEED=${process.env.SURPLUSFEED} (must be unset)`);
  if (problems.length) {
    console.error('LOUD STOP — substrate mismatch: ' + problems.join('; '));
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// per-tag pantry census: tag -> { kcal, pieces[] }
// ---------------------------------------------------------------------------
function census(Game) {
  const out = {};
  const v = Game.state && Game.state.village;
  const pan = (v && v.pantry) || [];
  for (const p of pan) {
    if (!p || !p[TAG]) continue;
    const t = p[TAG];
    let e = out[t];
    if (!e) e = out[t] = { kcal: 0, pieces: [] };
    e.kcal += (p.kcalEach || 0) * (p.units || 1);
    e.pieces.push(p);
  }
  return out;
}
function censusKcal(Game) {
  let t = 0;
  const c = census(Game);
  for (const k of Object.keys(c)) t += c[k].kcal;
  return t;
}

// ---------------------------------------------------------------------------
// install(Game) -> S (the conservation state)
// ---------------------------------------------------------------------------
function install(Game) {
  const S = {
    inflow: 0,
    inflowEvents: [],
    depositMeta: {},          // tag -> {day,name,foodState,spoilDay,freshDays,kcalEach,units}
    sinks: {},                // name -> kcal
    rotFast: 0, rotSlow: 0,   // sub-buckets of rotted
    depth: 0,                 // reentrancy guard: only outermost hook attributes
    tagSeq: 0,
    beats: [],                // captured homecoming say() lines (SENSE)
    errors: [],
    hookCalls: {},            // name -> number of outer attributions
  };
  let inRTV = false;

  const rotBucket = (tag) => {
    const m = S.depositMeta[tag];
    if (!m) return 'unknown';
    return (m.freshDays <= 5) ? 'fast' : 'slow';
  };
  const addSink = (name, tag, kcal) => {
    if (!(kcal > 0)) return;
    S.sinks[name] = (S.sinks[name] || 0) + kcal;
    S.hookCalls[name] = (S.hookCalls[name] || 0) + 1;
    if (name === 'rotted') {
      const b = rotBucket(tag);
      if (b === 'fast') S.rotFast += kcal; else S.rotSlow += kcal;
    }
  };

  // --- depositPantryPieces: behavior-faithful reimplementation + tagging ----
  // Copied verbatim from game.js @ 1aadc167d except the `existing` lookup,
  // which additionally requires tag equality (tagged pieces never merge into
  // untagged stacks, so no tagged kcal is ever diluted into the mixed pool).
  const origDPP = Game.depositPantryPieces;
  if (typeof origDPP !== 'function') { S.errors.push('depositPantryPieces missing'); return S; }
  Game.depositPantryPieces = function (v, src, pieceKcal) {
    let tag = null;
    if (inRTV && src && (src.kcalEach || 0) > 0 && (src.units || 0) > 0) {
      const day = (Game.state.scholar || {}).day || 0;
      tag = 'sh:' + day + ':' + (S.tagSeq++);
      src[TAG] = tag;
      S.depositMeta[tag] = {
        day, name: src.name || '?', foodState: src.foodState || '?',
        spoilDay: (src.spoilDay == null ? null : src.spoilDay),
        freshDays: (src.spoilDay ?? 9999) - day,
        kcalEach: src.kcalEach, units: src.units,
      };
    }
    // ---- begin verbatim copy (game.js depositPantryPieces) ----
    v.pantry = v.pantry || [];
    const cap = Math.max(1, Math.round(pieceKcal || 500));
    const perUnit = Math.round(src.kcalEach || 0);
    const units = Math.max(0, Math.round(src.units || 0));
    if (perUnit <= 0 || units <= 0) return 0;
    const srcKg = Number(src.kg) || 0;
    let deposited = 0;
    const place = (kcalEach, kgShare) => {
      const piece = Object.assign({}, src, {
        kcalEach, units: 1, kg: Math.max(0.01, kgShare),
      });
      // TAG-AWARE MERGE: the only deliberate delta from the original.
      const existing = (this.stacksMatch && v.pantry.find(p => this.stacksMatch(p, piece) && ((p[TAG] || null) === (piece[TAG] || null)))) || null;
      if (existing) { this.mergeHarvestShares(existing, piece, 1); existing.units += 1; }
      else v.pantry.push(piece);
      deposited += kcalEach;
    };
    for (let u = 0; u < units; u++) {
      let rem = perUnit;
      while (rem > 0) {
        const pk = Math.min(cap, rem);
        // weight follows the calories proportionally — total kg preserved
        place(pk, srcKg * (pk / perUnit));
        rem -= pk;
      }
    }
    v.pantryKcal = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    // ---- end verbatim copy ----
    if (tag) {
      S.inflow += deposited;
      S.inflowEvents.push(Object.assign({ tag, deposited }, S.depositMeta[tag]));
    }
    return deposited;
  };

  // --- returnToVillage: raise the flag + capture homecoming beats ----------
  const origRTV = Game.returnToVillage;
  if (typeof origRTV !== 'function') { S.errors.push('returnToVillage missing'); return S; }
  Game.returnToVillage = function () {
    const origSay = this.say;
    const beatBuf = [];
    const self = this;
    this.say = function (msg) { beatBuf.push(String(msg)); return origSay.apply(self, arguments); };
    inRTV = true;
    let r, err;
    try { r = origRTV.apply(this, arguments); }
    catch (e) { err = e; }
    finally { inRTV = false; this.say = origSay; }
    if (beatBuf.length && S.beats.length < 400) {
      S.beats.push({ day: (Game.state.scholar || {}).day || 0, lines: beatBuf.slice(0, 12) });
    }
    if (err) throw err;
    return r;
  };

  // --- generic remove-hook: outermost attribute
  const removeHook = (name, fnName) => {
    const orig = Game[fnName];
    if (typeof orig !== 'function') { S.errors.push('missing hook target: ' + fnName); return; }
    Game[fnName] = function () {
      const pre = census(Game);
      const outer = S.depth === 0;
      S.depth++;
      let r, err;
      try { r = orig.apply(this, arguments); }
      catch (e) { err = e; }
      finally { S.depth--; }
      if (outer) {
        const post = census(Game);
        for (const tag of Object.keys(pre)) {
          const delta = pre[tag].kcal - ((post[tag] && post[tag].kcal) || 0);
          addSink(name, tag, delta);
        }
        // a removal that ADDS tagged kcal is a bug in the instrument/game
        for (const tag of Object.keys(post)) {
          if (!pre[tag] && post[tag].kcal > 0) {
            S.errors.push(`${name}: unexpected new tag ${tag} (+${Math.round(post[tag].kcal)} kcal)`);
          }
        }
      }
      if (err) throw err;
      return r;
    };
  };

  // --- transform-hook (preserveFood/renderFat/makePemmican: player actions;
  // resolveOneAssignment: the village cook's rack-smoking): in-place or
  // unit-consuming preservation. Attribute consumed/changed tagged kcal to
  // the named sink and strip the tag from outputs so later eats don't
  // double-count.
  const transformHook = (sinkName, fnName) => {
    const orig = Game[fnName];
    if (typeof orig !== 'function') { S.errors.push('missing hook target: ' + fnName); return; }
    Game[fnName] = function () {
      const v = Game.state && Game.state.village;
      const pan = (v && v.pantry) || [];
      const pre = new Map(); // piece -> {kcal, kcalEach, foodState, name, spoilDay, units, tag}
      for (const p of pan) {
        if (!p || !p[TAG]) continue;
        pre.set(p, { kcal: (p.kcalEach || 0) * (p.units || 1), kcalEach: p.kcalEach || 0, foodState: p.foodState, name: p.name, spoilDay: p.spoilDay, units: p.units || 1, tag: p[TAG] });
      }
      S.depth++;
      let r, err;
      try { r = orig.apply(this, arguments); }
      catch (e) { err = e; }
      finally { S.depth--; }
      const pan2 = ((Game.state && Game.state.village) || {}).pantry || [];
      const postSet = new Set(pan2);
      // Per-tag balance: transformed kcal = pre-tag kcal minus kcal still
      // riding as FRESH tagged pieces (unchanged survivors + fresh split
      // copies like the cook's dinner-reserve keep-aside). Only genuinely
      // transformed outputs (changed foodState/name/spoilDay) lose the tag.
      const sig = (p) => [p.foodState || '', p.name || '', p.spoilDay ?? '', p.kcalEach || 0].join('|');
      const preKcal = {}, preSigs = {};
      for (const [piece, info] of pre) {
        preKcal[info.tag] = (preKcal[info.tag] || 0) + info.kcal;
        (preSigs[info.tag] = preSigs[info.tag] || new Set()).add(sig(piece));
      }
      const postFresh = {};
      for (const p of pan2) {
        if (!p || !p[TAG]) continue;
        const info = pre.get(p);
        if (info) {
          if (sig(p) === sig({ foodState: info.foodState, name: info.name, spoilDay: info.spoilDay, kcalEach: info.kcalEach })) {
            postFresh[info.tag] = (postFresh[info.tag] || 0) + (p.kcalEach || 0) * (p.units || 1); // fresh survivor
            continue;
          }
          delete p[TAG]; // transformed in place
          continue;
        }
        // new piece: fresh split copy (dinner-reserve) keeps the tag;
        // converted output (racks/pemmican bars) loses it.
        if ((preSigs[p[TAG]] || new Set()).has(sig(p))) {
          postFresh[p[TAG]] = (postFresh[p[TAG]] || 0) + (p.kcalEach || 0) * (p.units || 1);
        } else {
          delete p[TAG];
        }
      }
      for (const tag of Object.keys(preKcal)) {
        const t = preKcal[tag] - (postFresh[tag] || 0);
        addSink(sinkName, tag, t);
      }
      if (err) throw err;
      return r;
    };
  };

  // --- sink hook table (named operations) ---
  removeHook('eaten_villager', 'villageEats');     // villagerMealDay -> pantryDraw/drawSpoiled
  removeHook('eaten_player', 'villageMeal');       // scholar's trust-scaled meal
  removeHook('packed_out', 'takeFromPantry');
  removeHook('packed_out', 'takeFromPantryBulk');
  removeHook('feast_out', 'hostFeast');
  removeHook('rotted', 'sweepSpoiled');
  removeHook('tribute_out', '_removePantryKcal'); // payTribute / tendLink / answers
  removeHook('raided_alien', 'apPlaygroundRaid');
  removeHook('raided', 'raidPillage');             // monster raids on our pantry
  removeHook('raided_commons', 'commonsRaid');     // neighbor-village night raids
  removeHook('deal_tribute', 'villageDeal');      // commons-deal tribute
  removeHook('pantryDraw_other', 'pantryDraw');    // fallback: direct draws
  removeHook('eaten_npc_field', 'npcTakeAction');  // field NPCs snacking 1u
  removeHook('eaten_npc_field', 'npcChildAction'); // kids snacking 1u
  removeHook('traded', '_evTakePantryKcal');       // river-trader feed/pay
  transformHook('preserved', 'preserveFood');      // player smoke (inv/stash)
  transformHook('preserved', 'renderFat');
  transformHook('preserved', 'makePemmican');
  transformHook('preserved_racks', 'resolveOneAssignment'); // village cook's racks

  return S;
}

// ---------------------------------------------------------------------------
// finalize(Game, S) — residual into in_pantry, equation, shares.
// ---------------------------------------------------------------------------
function finalize(Game, S) {
  const residual = censusKcal(Game);
  S.sinks.in_pantry = (S.sinks.in_pantry || 0) + residual;
  const sinksTotal = Object.keys(S.sinks).reduce((t, k) => t + S.sinks[k], 0);
  const unattributed = S.inflow - sinksTotal;
  const shares = {};
  for (const k of Object.keys(S.sinks)) shares[k] = S.inflow > 0 ? S.sinks[k] / S.inflow : 0;
  const summary = {
    inflow: Math.round(S.inflow),
    nDeposits: S.inflowEvents.length,
    meanDepositKcal: S.inflowEvents.length ? Math.round(S.inflow / S.inflowEvents.length) : 0,
    sinksTotal: Math.round(sinksTotal),
    residual: Math.round(residual),
    unattributed: Math.round(unattributed),
    unexplainedShare: S.inflow > 0 ? unattributed / S.inflow : 0,
    attributedShare: S.inflow > 0 ? sinksTotal / S.inflow : 0,
    rotFast: Math.round(S.rotFast),
    rotSlow: Math.round(S.rotSlow),
  };
  return { summary, shares, sinks: S.sinks, inflowEvents: S.inflowEvents, beats: S.beats, errors: S.errors };
}

module.exports = { install, finalize, assertSubstrate, TAG };