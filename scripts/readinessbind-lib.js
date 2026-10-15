#!/usr/bin/env node
// scripts/readinessbind-lib.js — READ-ONLY readiness telemetry for the
// wave-4/5 Standing unlock diagnostic (readinessbind, 2026-10-15).
//
// INSTRUMENT-ONLY: every function in this file READS game state and returns
// plain data. Nothing here writes state, calls verbs, consumes RNG, or calls
// Date.now() (the sim clock is call-count-based; touching it would perturb
// IDs). Trajectory-neutrality of the sampling wrap is PROVEN, not asserted:
// scripts/test-readinessbind-20261015.js runs a MUTATING naive probe
// (MUTATE=1 — deliberately drains pantry kcal) to show the trajectory hash
// IS sensitive, then shows the real instrument on/off is byte-identical.
//
// STRUCTURAL NOTE (engine truth, verified 2026-10-15): villager counter
// knowledge is VILLAGE-LEVEL by design — state.monsterCounters[id] (waves
// 1-2, the ledger convention) and state.villagerTricks[mid] (wave-3
// signatures) are shared fire knowledge fed by a shared 2-observation bar
// (noteVillagerTrickObservation/_trickObservation). There is NO per-villager
// counter-knowledge field. So "villagers with learned counters for
// wave-(w-1) types (count + share)" is measured at TYPE granularity:
// how many of the wave-(w-1) monster types the village knows the trick for
// (count + share of that wave's roster). When a trick is known, every living
// villager shares it by design (teaching happens via the askAbout
// 'beasttricks' topic at the fire).
'use strict';

function num(x, dflt) {
  const n = Number(x);
  return Number.isFinite(n) ? n : (dflt == null ? 0 : dflt);
}

// livingNPCs: engine-true "is the village alive" (cf. sim-harness.js) —
// roster minus the scholar minus .dead-marked person records.
function livingNPCs(Game) {
  try {
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    return (v.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    }).length;
  } catch (e) { return -1; }
}

function trustMean(Game) {
  try {
    const tr = Object.values((Game.state.village || {}).trust || {});
    if (!tr.length) return { mean: null, n: 0 };
    const mean = tr.reduce((a, b) => a + num(b, 0), 0) / tr.length;
    return { mean: +mean.toFixed(1), n: tr.length };
  } catch (e) { return { mean: null, n: 0 }; }
}

function standingBreakdown(Game) {
  const out = { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 };
  try {
    if (typeof Game.villageStanding === 'function') {
      const s = Game.villageStanding() || {};
      for (const k of Object.keys(out)) if (typeof s[k] === 'number') out[k] = s[k];
    }
  } catch (e) {}
  return out;
}

// waveTypes(Game, w): monster ids with def.wave === w.
function waveTypes(Game, w) {
  try {
    return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).map(m => m.id);
  } catch (e) { return []; }
}

// ledgerPerType(Game, w): DIRECT state read (no ledgerState() init call —
// the defensive init is a write; the sweep runs on live sims where the
// ledger exists, and missing reads as empty).
function ledgerPerType(Game, w) {
  try {
    const e = ((Game.state || {}).waveLedger || {})[w] || {};
    const pt = e.perType || {};
    const out = {};
    for (const k of Object.keys(pt)) out[k] = num(pt[k], 0);
    return out;
  } catch (e) { return {}; }
}

function ledgerPoints(Game, w) {
  const pt = ledgerPerType(Game, w);
  return Object.values(pt).reduce((t, v) => t + v, 0);
}

// tricksKnown(Game, w): village-level trick knowledge for wave-w types.
// villageKnowsTrick covers monsterCounters (waves 1-2) + villagerTricks
// (wave-3 signatures). Waves 4-5 are deliberately counter-less (canon:
// MONSTER-WAVES.md) — expect 0 there; the instrument records it honestly.
function tricksKnown(Game, w) {
  const types = waveTypes(Game, w);
  let known = 0;
  const knownIds = [];
  try {
    for (const mid of types) {
      if (typeof Game.villageKnowsTrick === 'function' && Game.villageKnowsTrick(mid)) {
        known++;
        knownIds.push(mid);
      }
    }
  } catch (e) {}
  return { known, total: types.length, share: types.length ? +(known / types.length).toFixed(3) : 0, knownIds };
}

function scholarArmorP(Game) {
  try {
    if (typeof Game.armorBonus === 'function') return Math.round(num(Game.armorBonus(), 0));
  } catch (e) {}
  return null;
}

function pantryFreshDays(Game) {
  try {
    if (typeof Game.pantryFreshDays === 'function') return +num(Game.pantryFreshDays(), 0).toFixed(2);
  } catch (e) {}
  return null;
}

function scaleRank(Game) {
  try { return (typeof Game.scaleRank === 'function') ? (Game.scaleRank() || 'village') : 'village'; }
  catch (e) { return 'village'; }
}

function waveEngaged(Game, w) {
  try { return (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(w) | 0) : 0; }
  catch (e) { return 0; }
}

function tableSeatName(Game) {
  try {
    if (typeof Game.tableSeat === 'function') {
      const s = Game.tableSeat();
      return (s && s.seat) || 'none';
    }
  } catch (e) {}
  return 'none';
}

// readinessSnapshot(Game, wave): the full covariate vector captured AT the
// unlock day for a wave-N Standing unlock. wave-(w-1) is the readiness
// reference wave (the content the village just proved itself against).
function readinessSnapshot(Game, wave) {
  const prev = wave - 1;
  const st = standingBreakdown(Game);
  const tm = trustMean(Game);
  const tricksPrev = tricksKnown(Game, prev);
  const tricksW3 = prev === 3 ? tricksPrev : tricksKnown(Game, 3);
  let rosterTotal = 0;
  try { rosterTotal = ((Game.state.village || {}).roster || []).length; } catch (e) {}
  return {
    wave,
    day: num((Game.state.scholar || {}).day, 0),
    // the unlock driver (context, not a readiness covariate)
    standing: st,
    // covariate 1: wave-(w-1) ledger kill points, per type
    ledgerPrevWave: prev,
    ledgerPerType: ledgerPerType(Game, prev),
    ledgerPointsPrev: ledgerPoints(Game, prev),
    // covariate 2: village-known tricks for wave-(w-1) types (count + share;
    // village-level by engine design — see header note). tricksW3 is the
    // military-learning proxy for wave-5 unlocks (wave-4 is counter-less).
    tricksPrev,
    tricksW3,
    // covariate 3: scholar armor P (additive pieces into the DR curve)
    scholarArmorP: scholarArmorP(Game),
    // covariate 4: roster alive count (living NPC villagers)
    rosterAlive: livingNPCs(Game),
    rosterTotal,
    // covariate 5: pantry fresh-days
    pantryFreshDays: pantryFreshDays(Game),
    // covariate 6: trust (mean over village trust map)
    trustMean: tm.mean,
    trustN: tm.n,
    // covariate 7: rank/scale
    rank: scaleRank(Game),
    // context: distinct wave-(w-1) types actually FOUGHT blow-by-blow
    waveEngagedPrev: waveEngaged(Game, prev),
    waveEngagedW: waveEngaged(Game, wave),
  };
}

function snapshotComplete(snap) {
  if (!snap || typeof snap !== 'object') return false;
  const keys = ['standing', 'ledgerPerType', 'ledgerPointsPrev', 'tricksPrev',
    'scholarArmorP', 'rosterAlive', 'pantryFreshDays', 'trustMean', 'rank'];
  for (const k of keys) if (snap[k] == null) return false;
  if (typeof snap.day !== 'number' || snap.day <= 0) return false;
  return true;
}

// classifyOutcome(unlock, run): the 30d post-unlock outcome.
// unlock: {unlockDay, wave}; run: {finalDay, endReason, over, livingAtPlus30,
//   tableDays: [days when seat != 'none'], horizonDays}.
// Operationalization (pre-registered):
//   window = [unlockDay, unlockDay+30]
//   - finalDay >= unlockDay+30: outcome at +30: livingNPCs>0 ? 'held' : 'hollow'
//   - else (run ended early):
//       endReason 'village-dead' (deadTail: scholar alone, community gone) -> 'hollow'
//       'survived' (hit the horizon) with finalDay < unlockDay+30 -> 'held-censored'
//       otherwise (village-lost / over-other) -> 'died'
//   - tableBy30: any tableDay inside the window (orthogonal flag).
function classifyOutcome(unlock, run) {
  const uDay = num(unlock.unlockDay, 0);
  const fDay = num(run.finalDay, 0);
  const endReason = run.endReason || '?';
  const tableDays = Array.isArray(run.tableDays) ? run.tableDays : [];
  const tableBy30 = tableDays.some(d => d >= uDay && d <= uDay + 30) ? 1 : 0;
  let outcome, daysObserved;
  if (fDay >= uDay + 30) {
    outcome = (num(run.livingAtPlus30, 0) > 0) ? 'held' : 'hollow';
    daysObserved = 30;
  } else if (endReason === 'village-dead') {
    outcome = 'hollow';
    daysObserved = Math.max(0, fDay - uDay);
  } else if (endReason === 'survived') {
    outcome = 'held-censored';
    daysObserved = Math.max(0, fDay - uDay);
  } else {
    outcome = 'died';
    daysObserved = Math.max(0, fDay - uDay);
  }
  return { outcome, tableBy30, daysObserved, unlockDay: uDay, wave: unlock.wave };
}

// attribution(unlocks): fraction of wave-4/5 unlock events fully attributed.
// Fully attributed = covariates complete AND outcome uncensored
// (outcome in held/died/hollow — died/hollow before +30 IS a determined
// outcome; the window closed by termination, not by the horizon).
function attribution(unlocks) {
  const n = unlocks.length;
  let full = 0, censored = 0;
  for (const u of unlocks) {
    const oc = (u.outcome || {}).outcome;
    if (oc === 'held-censored') { censored++; continue; }
    if (snapshotComplete(u.snapshot) && (oc === 'held' || oc === 'died' || oc === 'hollow')) full++;
  }
  return { n, fullyAttributed: full, censored, rate: n ? +(full / n).toFixed(3) : 0 };
}

function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mad(a, med) {
  if (!a.length || med == null) return 0;
  const ds = a.map(x => Math.abs(x - med)).sort((x, y) => x - y);
  const m = ds.length >> 1;
  return ds.length % 2 ? ds[m] : (ds[m - 1] + ds[m]) / 2;
}

// Numeric covariates eligible for the separation analysis (all snapshot
// fields that are numbers on every unlock).
const SEP_COVARIATES = [
  'ledgerPointsPrev', 'tricksPrevShare', 'scholarArmorP', 'rosterAlive',
  'pantryFreshDays', 'trustMean',
];
function covValue(u, name) {
  const s = u.snapshot || {};
  if (name === 'tricksPrevShare') return num((s.tricksPrev || {}).share, 0);
  return num(s[name], NaN);
}

// separation(unlocks): holders (outcome 'held') vs corpses ('died'/'hollow').
// PRE-REGISTERED RULE:
//   SEPARATES: both groups n>=3 AND value ranges disjoint.
//   SUGGESTIVE: both groups n>=2 AND |median_h - median_c| >= pooled MAD.
//   else: no signal for that covariate.
//   Overall: >=1 SEPARATES -> "separating factors: [...]"; else any
//   SUGGESTIVE -> "suggestive only: [...]"; else UNCONCENTRATED (named).
//   <6 total unlocks -> underpowered (cannot name either honestly).
function separation(unlocks) {
  const holders = unlocks.filter(u => (u.outcome || {}).outcome === 'held');
  const corpses = unlocks.filter(u => {
    const o = (u.outcome || {}).outcome;
    return o === 'died' || o === 'hollow';
  });
  if (unlocks.length < 6) {
    return { underpowered: true, n: unlocks.length, holders: holders.length, corpses: corpses.length,
      verdict: 'UNDERPOWERED', note: 'fewer than 6 unlock events — cannot name separating factors or unconcentration honestly' };
  }
  const per = [];
  for (const name of SEP_COVARIATES) {
    const hv = holders.map(u => covValue(u, name)).filter(Number.isFinite);
    const cv = corpses.map(u => covValue(u, name)).filter(Number.isFinite);
    const hm = median(hv), cm = median(cv);
    const pmad = mad(hv.concat(cv), median(hv.concat(cv)));
    let signal = 'none';
    if (hv.length >= 3 && cv.length >= 3 && hm != null && cm != null) {
      const hMin = Math.min.apply(null, hv), hMax = Math.max.apply(null, hv);
      const cMin = Math.min.apply(null, cv), cMax = Math.max.apply(null, cv);
      if (hMax < cMin || cMax < hMin) signal = 'SEPARATES';
    }
    if (signal === 'none' && hv.length >= 2 && cv.length >= 2 && hm != null && cm != null && pmad > 0) {
      if (Math.abs(hm - cm) >= pmad) signal = 'SUGGESTIVE';
    }
    per.push({ covariate: name, holders: hv.length, corpses: cv.length,
      holderMedian: hm, corpseMedian: cm, pooledMAD: +pmad.toFixed(3),
      holderRange: hv.length ? [Math.min.apply(null, hv), Math.max.apply(null, hv)] : null,
      corpseRange: cv.length ? [Math.min.apply(null, cv), Math.max.apply(null, cv)] : null,
      signal });
  }
  const sep = per.filter(p => p.signal === 'SEPARATES').map(p => p.covariate);
  const sug = per.filter(p => p.signal === 'SUGGESTIVE').map(p => p.covariate);
  let verdict, note;
  if (sep.length) {
    verdict = 'SEPARATING';
    note = 'separating factors: ' + sep.join(', ');
  } else if (sug.length) {
    verdict = 'SUGGESTIVE-ONLY';
    note = 'suggestive only (medians differ >= pooled MAD, ranges overlap): ' + sug.join(', ');
  } else {
    verdict = 'UNCONCENTRATED';
    note = 'named unconcentration: no single readiness covariate separates holders from corpses at this scale — the future gate arm needs a composite or a different signal';
  }
  return { underpowered: false, n: unlocks.length, holders: holders.length, corpses: corpses.length,
    perCovariate: per, verdict, note };
}

// trajectoryHash(Game): per-day digest for the instrument-honesty proof.
// Mirrors det-gate.js's dayHash (same fields) so the sensitivity claim is
// comparable. Pure reads.
function trajectoryHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

module.exports = {
  livingNPCs, trustMean, standingBreakdown, waveTypes, ledgerPerType, ledgerPoints,
  tricksKnown, scholarArmorP, pantryFreshDays, scaleRank, waveEngaged, tableSeatName,
  readinessSnapshot, snapshotComplete, classifyOutcome, attribution, separation,
  trajectoryHash, SEP_COVARIATES,
};
