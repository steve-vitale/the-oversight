#!/usr/bin/env node
// meatchannel-panel-20261102.js — long-run haul->reveal->test->cook
// measurement on IDENTICAL seeds, before/after. Stdout JSON only; no
// file writes. Mirrors the journey-driver day loop (3 parts +
// policy.daily + sleep). Read-only wraps: each calls the original
// exactly once and logs only (no state mutation, no RNG use).
// Usage: POLICY=competent|meatseek SEEDS=209,228,238,239 DAYS=42 node
//   scripts/meatchannel-panel-20261102.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { meatseek } = require('./policies/meatseek');
const POLICY = process.env.POLICY || 'competent';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [209, 228, 238, 239]);
const DAYS = parseInt(process.env.DAYS || '42', 10);

function isMonMid(Game, mid) {
  return (Game.data.monsters || []).some(m => m.id === mid) || mid === 'belltoad_legs';
}
function meatStacks(Game) {
  const scan = (cont) => {
    const out = [];
    for (const it of (cont || [])) {
      if (!it) continue;
      const pid = String(it.plantId || '');
      if (!pid.startsWith('meat_')) continue;
      const mid = pid.slice(5);
      if (!isMonMid(Game, mid)) continue;
      out.push({ plantId: pid, mid, units: it.units || 0, kcalEach: it.kcalEach || 0,
        edible: !!it.edible, foodState: it.foodState || null, spoilDay: (it.spoilDay === undefined ? null : it.spoilDay) });
    }
    return out;
  };
  return {
    pantry: scan((Game.state.village || {}).pantry),
    pack: scan((Game.state.scholar || {}).inventory),
    prep: scan((Game.state.scholar || {}).prepStash),
  };
}
function codexMeat(Game) {
  const out = {};
  try {
    const cm = (Game.state.codex || {}).monsters || {};
    for (const mid of Object.keys(cm)) {
      const e = cm[mid] || {};
      if (e.foodTested !== undefined || e.foodSafe !== undefined) out[mid] = { t: e.foodTested || null, s: !!e.foodSafe };
    }
  } catch (e) {}
  return out;
}
function unknownByMid(snap) {
  const m = {};
  for (const loc of ['pantry', 'pack', 'prep'])
    for (const it of (snap[loc] || [])) if (!it.edible) m[it.mid] = (m[it.mid] || 0) + (it.units || 0);
  return m;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'meat-panel', fullTelemetry: true });
  await setupGame(Game);
  const policy = POLICY === 'meatseek' ? meatseek : competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) {} }
  const C = { haulDeposits: 0, villagerTests: 0, villagerTestMids: [],
    playerTests: 0, reveals: 0, cookedMonsterKcal: 0, monsterKcal: 0, cookedMeals: 0,
    nightsPresent: 0, nights: 0, fleshNights: 0, presentBlockedNights: 0,
    plantBlockedNights: 0, rottedFleshUnits: 0 };
  let prevUnknown = unknownByMid(meatStacks(Game));
  let prevCodex = codexMeat(Game);
  let cookedLeftoverRows = 0;
  const _ore = Game.objReturnEffect ? Game.objReturnEffect.bind(Game) : null;
  if (_ore) Game.objReturnEffect = function (vid, purpose) {
    let hu = null;
    try { if (purpose === 'haul') { const ho = Game.objOf(vid); hu = ho.haulUnknown || null; } } catch (e) {}
    const r = _ore(vid, purpose);
    try { if (hu && hu.length) C.haulDeposits += hu.length; } catch (e) {}
    return r;
  };
  const _veb = Game.villagerExperimentBeat ? Game.villagerExperimentBeat.bind(Game) : null;
  if (_veb) Game.villagerExperimentBeat = function (present) {
    const before = codexMeat(Game);
    const beforePlants = Object.keys((Game.state.codex || {}).plants || {});
    const beforeSnap = meatStacks(Game);
    const hadFlesh = unknownByMid(beforeSnap);
    const hadFleshAny = Object.keys(hadFlesh).length > 0;
    const hadLump = ((Game.state.scholar || {}).prepStash || []).some(c => c && c.lump &&
      Object.keys(c.lump || {}).some(p => { try { return !Game.plantKnown(p); } catch (e) { return false; } }));
    const r = _veb(present);
    try {
      const after = codexMeat(Game);
      let meatChanged = false;
      for (const mid of Object.keys(after)) {
        if (JSON.stringify(before[mid] || null) !== JSON.stringify(after[mid])) {
          meatChanged = true; C.villagerTests += 1; C.villagerTestMids.push(mid);
        }
      }
      if (!meatChanged && hadFleshAny && hadLump) {
        const afterPlants = Object.keys((Game.state.codex || {}).plants || {});
        if (afterPlants.length > beforePlants.length) C.plantBlockedNights += 1;
      }
    } catch (e) {}
    return r;
  };
  const _tmm = Game.testMonsterMeat ? Game.testMonsterMeat.bind(Game) : null;
  if (_tmm) Game.testMonsterMeat = function () {
    const r = _tmm.apply(Game, arguments);
    try { C.playerTests += 1; } catch (e) {}
    return r;
  };
  const _mms = Game.markMonsterFoodSafe ? Game.markMonsterFoodSafe.bind(Game) : null;
  if (_mms) Game.markMonsterFoodSafe = function () {
    const r = _mms.apply(Game, arguments);
    try { C.reveals += 1; } catch (e) {}
    return r;
  };
  const _pd = Game.pantryDraw ? Game.pantryDraw.bind(Game) : null;
  if (_pd) Game.pantryDraw = function (v, want, opts) {
    const r = _pd(v, want, opts);
    try {
      let cookedK = 0, totK = 0, anyCooked = false;
      for (const d of (r.items || [])) {
        const pid = String((d.item || {}).plantId || '');
        if (!pid.startsWith('meat_')) continue;
        if (!isMonMid(Game, pid.slice(5))) continue;
        const k = (d.units || 0) * (d.effectiveKcal || 0);
        totK += k;
        if (d.cooked) { cookedK += k; anyCooked = true; }
      }
      C.monsterKcal += totK; C.cookedMonsterKcal += cookedK;
      if (anyCooked) C.cookedMeals += 1;
    } catch (e) {}
    return r;
  };
  const nowDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) {} }
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) {} }
    try {
      const snap = meatStacks(Game);
      const unk = unknownByMid(snap);
      let present = false;
      try { present = !!Game.playerAtHaven(); } catch (e) {}
      C.nights += 1;
      if (present) C.nightsPresent += 1;
      if (Object.keys(unk).length > 0) {
        C.fleshNights += 1;
        if (!present) C.presentBlockedNights += 1;
      }
    } catch (e) {}
    try { Game.sleep(); } catch (e) {}
    try {
      const snap = meatStacks(Game);
      for (const loc of ['pantry', 'pack', 'prep'])
        for (const it of (snap[loc] || []))
          if (['cooked', 'smoked', 'rendered', 'pemmican', 'dried'].includes(it.foodState || '')) cookedLeftoverRows += 1;
      const unk = unknownByMid(snap);
      const cx = codexMeat(Game);
      for (const mid of Object.keys(prevUnknown)) {
        const drop = (prevUnknown[mid] || 0) - (unk[mid] || 0);
        if (drop > 0 && JSON.stringify(prevCodex[mid] || null) === JSON.stringify(cx[mid] || null)) C.rottedFleshUnits += drop;
      }
      prevUnknown = unk; prevCodex = cx;
    } catch (e) {}
    if (Game.over) break;
  }
  const end = meatStacks(Game);
  return { seed, policy: policy.id, reachedDay: nowDay(Game), over: !!Game.over, counts: C,
    cookedLeftoverRows, endStacks: end, endCodex: codexMeat(Game) };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) { console.log(`--- seed ${s} policy ${POLICY} ---`); const r = await runSeed(s); rows.push(r); console.log(JSON.stringify(r)); }
  const tot = (k) => rows.reduce((t, r) => t + (r.counts[k] || 0), 0);
  console.log(JSON.stringify({ PANEL: POLICY, seeds: SEEDS, days: DAYS,
    haulDeposits: tot('haulDeposits'), villagerTests: tot('villagerTests'), playerTests: tot('playerTests'),
    reveals: tot('reveals'), cookedMonsterKcal: tot('cookedMonsterKcal'), monsterKcal: tot('monsterKcal'),
    cookedMeals: tot('cookedMeals'), cookedLeftoverRows: rows.reduce((t, r) => t + r.cookedLeftoverRows, 0),
    nights: tot('nights'), nightsPresent: tot('nightsPresent'), fleshNights: tot('fleshNights'),
    presentBlockedNights: tot('presentBlockedNights'), plantBlockedNights: tot('plantBlockedNights'),
    rottedFleshUnits: tot('rottedFleshUnits') }, null, 1));
  process.exit(0);
})().catch(e => { console.error('PANEL FATAL', e); process.exit(1); });
