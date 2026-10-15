#!/usr/bin/env node
'use strict';
// scripts/survdiff-lib-20261015.js — post-wave-4-unlock survival-differential
// sampler + pure classifier (sim-survdiff, 2026-10-15, scale-onramp axis).
//
// DIAGNOSTIC INSTRUMENT ONLY — reads engine state, never writes game code.
// Shared by scripts/sweep-survdiff-20261015.js (the 16-run sweep) and
// scripts/test-survdiff-20261015.js (the proof test), so both read the same
// way and the test proves the sweep's instrument. Executes sim-findings
// #268's named diagnostic: what distinguishes wave-4-unlock villages that
// survive 30d+ post-unlock from those that die 20-50d early?
//
// For EVERY run that unlocks wave 4, the sampler records: unlock day;
// standing composition at unlock (war/dip/plenty, gated vs raw); and at
// unlock+30d (or at death if earlier): villager count, median villager HP,
// wound load, armor coverage, counters known (villagerTricks + monsterCounters),
// pantry kcal + fresh-days, wave-4+ fight count and deaths in the window,
// death cause if died. The classifier: survivor (alive >=30d post-unlock)
// vs non-survivor. differentialFactors() names the top separating factors
// over the PRE-REGISTERED candidate set (evidence/2026-10-15/sim-survdiff.md).
//
// Engine reads are guarded and ENGINE-READ-EQUIVALENT: the engine itself
// evaluates unlockedWave()/villageStanding() on spawn checks, vv.health is
// read by fieldFights every fight, pantryDaysEstimate is read by upkeep —
// the sampler adds no engine-visible traffic. Death-family mapping reuses
// holdloss-lib's classifyDeathFamily (same taxonomy as the sibling census).
const HL = require('./holdloss-lib-20261015');

const SD = {};

// --- small helpers ---
SD.median = function (xs) {
  const a = (xs || []).filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return 0;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

SD.gday = function (Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
};

// sampleStanding(Game): the standing composition at a moment, gated vs raw.
// Mirrors the engine's villageStanding()/villageStandingTotal() exactly.
SD.sampleStanding = function (Game) {
  const s = { day: SD.gday(Game), uw: 1, raw: 0, gated: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 };
  try { s.uw = Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  try {
    const b = Game.villageStanding ? Game.villageStanding() : null;
    if (b) {
      s.war = (b.war | 0) || 0; s.diplomacy = (b.diplomacy | 0) || 0;
      s.plenty = (b.plenty | 0) || 0; s.warPts = (b.warPts | 0) || 0;
      s.links = (b.links | 0) || 0; s.feasts = (b.feasts | 0) || 0;
    }
    s.raw = s.war + s.diplomacy + s.plenty;
  } catch (e) {}
  try { s.gated = Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : s.raw; } catch (e) {}
  return s;
};

// dominantRoad(s): which lane carried the unlock. Hybrid when two lanes
// each hold >=40% of raw (e.g. s55: war=75 + dip=34). None when raw=0.
SD.dominantRoad = function (s) {
  const r = (s && s.raw) | 0;
  if (!r) return 'none';
  const lanes = [
    ['blood', (s.war | 0) / r],
    ['bonds', (s.diplomacy | 0) / r],
    ['bread', (s.plenty | 0) / r],
  ].sort((a, b) => b[1] - a[1]);
  if (lanes[1][1] >= 0.4) return 'hybrid';
  return lanes[0][0];
};

// livingRoster(Game): ids in state.village.roster, minus the scholar, minus
// .dead-marked person records — the harness's livingNPCs() convention.
SD.livingRoster = function (Game) {
  try {
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    return (v.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
};

// personOf(Game, vid): the person record for armor reads.
SD.personOf = function (Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p) return p; } catch (e) {}
  try {
    const mains = (Game.data || {}).villagers || [];
    const p = mains.find(x => x && x.id === vid);
    if (p) return p;
  } catch (e) {}
  try {
    const bgs = (Game.data || {}).background_survivors || [];
    const p = bgs.find(x => x && x.id === vid);
    if (p) return p;
  } catch (e) {}
  return {};
};

// armorP(Game, person): equipment.js's armorOf on the person record.
// The canonical namespace is Scattering.equipment (window.S keeps working
// for the UI/fieldFights consumers, but the harness deletes global.window).
SD.armorP = function (Game, person) {
  try {
    const g = (typeof globalThis !== 'undefined') ? globalThis : {};
    const eq = (g.Scattering && g.Scattering.equipment) ||
               (g.S && g.S.equipment) || null;
    if (eq && typeof eq.armorOf === 'function') {
      const items = (Game.data || {}).items || [];
      return eq.armorOf(person, items) || 0;
    }
  } catch (e) {}
  return 0;
};

// sampleVillageState(Game): the village's capability state at a moment.
//   villagersN   — living non-scholar roster count
//   medianHp     — median of vv.health[vid] (default 100, fieldFights convention)
//   woundedN     — villagers with hp < maxHp (maxHp = max(100, hp))
//   woundShare   — woundedN / villagersN
//   hpMissingPct — sum(maxHp-hp)/sum(maxHp)*100
//   armorN       — villagers with armorOf > 0
//   armorCoverage — armorN / villagersN
//   meanArmorP   — mean protection P over the roster
//   counters     — |state.monsterCounters| (wave 1-2 counter-known ids)
//   tricks       — |state.villagerTricks| (wave 3+ signature knowledge)
//   pantryKcal   — summed kcalEach*units over the pantry
//   pantryDays   — pantryDaysEstimate(), bounded like the engine's own read
SD.sampleVillageState = function (Game) {
  const st = { day: SD.gday(Game), villagersN: 0, medianHp: 0, woundedN: 0,
    woundShare: 0, hpMissingPct: 0, armorN: 0, armorCoverage: 0, meanArmorP: 0,
    counters: 0, tricks: 0, pantryKcal: 0, pantryDays: 0 };
  try {
    const roster = SD.livingRoster(Game);
    const vv = (Game.state.village || {});
    const health = vv.health || {};
    const hps = [], armorPs = [];
    let missSum = 0, maxSum = 0, wounded = 0, armored = 0;
    for (const vid of roster) {
      let hp = health[vid];
      if (hp === undefined || hp === null) hp = 100;
      hp = +hp || 0;
      const maxHp = Math.max(100, hp);
      hps.push(hp);
      missSum += Math.max(0, maxHp - hp); maxSum += maxHp;
      if (hp < maxHp) wounded++;
      const P = SD.armorP(Game, SD.personOf(Game, vid));
      armorPs.push(P);
      if (P > 0) armored++;
    }
    st.villagersN = roster.length;
    st.medianHp = +SD.median(hps).toFixed(1);
    st.woundedN = wounded;
    st.woundShare = roster.length ? +(wounded / roster.length).toFixed(3) : 0;
    st.hpMissingPct = maxSum ? +(missSum / maxSum * 100).toFixed(2) : 0;
    st.armorN = armored;
    st.armorCoverage = roster.length ? +(armored / roster.length).toFixed(3) : 0;
    st.meanArmorP = +SD.median(armorPs).toFixed(1);
  } catch (e) {}
  try { st.counters = Object.keys((Game.state || {}).monsterCounters || {}).length; } catch (e) {}
  try { st.tricks = Object.keys((Game.state || {}).villagerTricks || {}).length; } catch (e) {}
  try {
    const pantry = ((Game.state.village || {}).pantry) || [];
    let k = 0;
    for (const it of pantry) k += ((it && it.kcalEach) || 0) * ((it && it.units) || 1);
    st.pantryKcal = Math.round(k);
  } catch (e) {}
  try {
    st.pantryDays = Game.pantryDaysEstimate ? Math.min(999, Game.pantryDaysEstimate()) : 0;
  } catch (e) {}
  return st;
};

// sampleFaced(Game): deed feed wavesFaced keys, waves 4-5 only. Diffed
// across two snapshots, this is "new distinct wave-4+ monsters faced in
// the window" — the engine-honest engagement read (fleeing counts, same
// as the readiness gate reads).
SD.sampleFaced = function (Game) {
  const out = { w4: [], w5: [] };
  try {
    const d = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (d && d.wavesFaced) || {};
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      if (w === 4) out.w4.push(mid);
      else if (w === 5) out.w5.push(mid);
    }
  } catch (e) {}
  return out;
};

// fightWaveOf(mdef): the wave of a hooked fight's monster def, defensive.
SD.fightWaveOf = function (mdef) {
  try { return (mdef && mdef.wave) | 0 || 1; } catch (e) { return 1; }
};

// classifyDeathFamily: re-exported from holdloss-lib (the sibling census's
// taxonomy — same families: sickness/starvation/wounds/monster/combat/null).
SD.classifyDeathFamily = HL.classifyDeathFamily;

// --- pure classification over a persisted record ---
//
// rec shape (built by the sweep from persisted rows):
//   { unlockDay|null, standingAtUnlock, road, evalDay, windowDays, alive30,
//     diedInWindow, stateAtUnlock, stateAtEval, fightsW4plus, deathsWindow,
//     newFacedW4, newFacedW5, unlock5day, endReason, deathFamily }
// verdict: 'no-unlock' | 'survivor' | 'non-survivor'.
// survivor = the run reached unlockDay+30 (days >= unlockDay+30). The
// window state snapshot is at evalDay = min(unlockDay+30, daysRan).
SD.classifyRecord = function (rec) {
  if (!rec || rec.unlockDay == null) return { verdict: 'no-unlock' };
  if (rec.alive30) return { verdict: 'survivor', windowDays: rec.windowDays | 0 };
  return {
    verdict: 'non-survivor',
    windowDays: rec.windowDays | 0,
    diedInWindow: !!rec.diedInWindow,
    deathFamily: rec.deathFamily || null,
    endReason: rec.endReason || null,
  };
};

// differentialFactors(records): over the PRE-REGISTERED candidate set,
// name the factors that separate survivors from non-survivors. Each
// candidate yields a "high-side" and a "low-side" read; a factor is
// reported when the split is PERFECT (all of one class on one side) or
// STRONG (>=80% of each class on opposite sides of the threshold). The
// threshold is chosen as the midpoint between the most-extreme
// misclassified values on each side (i.e. the widest perfect/strong
// split on the observed data). Output is honest numbers: survOK/survN,
// nonOK/nonN counts — the evidence file quotes these directly.
//
// candidates: {key, label, read(rec), dir} — dir 'high' means survivors
// are expected high (e.g. pantryDays), 'low' means expected low
// (e.g. woundShare), 'either' tries both.
SD.FACTOR_CANDIDATES = [
  { key: 'pantryDays', label: 'pantry fresh-days at unlock', dir: 'high', read: r => (r.stateAtUnlock || {}).pantryDays },
  { key: 'pantryKcal', label: 'pantry kcal at unlock', dir: 'high', read: r => (r.stateAtUnlock || {}).pantryKcal },
  { key: 'villagersN', label: 'villager count at unlock', dir: 'high', read: r => (r.stateAtUnlock || {}).villagersN },
  { key: 'medianHp', label: 'median villager HP at unlock', dir: 'high', read: r => (r.stateAtUnlock || {}).medianHp },
  { key: 'woundShare', label: 'wound share at unlock', dir: 'low', read: r => (r.stateAtUnlock || {}).woundShare },
  { key: 'hpMissingPct', label: 'wound load (missing-HP %) at unlock', dir: 'low', read: r => (r.stateAtUnlock || {}).hpMissingPct },
  { key: 'armorCoverage', label: 'armor coverage at unlock', dir: 'high', read: r => (r.stateAtUnlock || {}).armorCoverage },
  { key: 'counters', label: 'counters known (monsterCounters) at unlock', dir: 'high', read: r => (r.stateAtUnlock || {}).counters },
  { key: 'tricks', label: 'villager tricks known (villagerTricks) at unlock', dir: 'high', read: r => (r.stateAtUnlock || {}).tricks },
  { key: 'countersAll', label: 'counters+tricks known at unlock', dir: 'high', read: r => ((r.stateAtUnlock || {}).counters | 0) + ((r.stateAtUnlock || {}).tricks | 0) },
  { key: 'warShare', label: 'standing war share at unlock', dir: 'either', read: r => { const s = r.standingAtUnlock || {}; return s.raw ? (s.war / s.raw) : 0; } },
  { key: 'dipShare', label: 'standing diplomacy share at unlock', dir: 'either', read: r => { const s = r.standingAtUnlock || {}; return s.raw ? (s.diplomacy / s.raw) : 0; } },
  { key: 'plentyShare', label: 'standing plenty share at unlock', dir: 'either', read: r => { const s = r.standingAtUnlock || {}; return s.raw ? (s.plenty / s.raw) : 0; } },
  { key: 'fightsW4', label: 'wave-4+ fights in the post-unlock window', dir: 'either', read: r => r.fightsW4plus | 0 },
  { key: 'windowDeaths', label: 'deaths in the post-unlock window', dir: 'low', read: r => (r.deathsWindow || []).length },
];

SD.differentialFactors = function (records, opts) {
  opts = opts || {};
  const surv = (records || []).filter(r => r.verdict === 'survivor');
  const nons = (records || []).filter(r => r.verdict === 'non-survivor');
  const out = [];
  const strongBar = opts.strongBar != null ? opts.strongBar : 0.8;
  for (const cand of SD.FACTOR_CANDIDATES) {
    const sv = surv.map(cand.read).filter(v => typeof v === 'number' && isFinite(v));
    const nv = nons.map(cand.read).filter(v => typeof v === 'number' && isFinite(v));
    if (!sv.length || !nv.length) continue;
    const dirs = cand.dir === 'either' ? ['high', 'low'] : [cand.dir];
    for (const dir of dirs) {
      // Candidate threshold: split between the max of one class and the
      // min of the other, on the side where the classes order as dir
      // expects (survivors high/low).
      let thr, survOK, nonOK;
      if (dir === 'high') {
        // survivors should be >= thr: thr = (max non-surv value + min
        // survivor value above it) / 2 — widest separation on this side.
        const nmax = Math.max.apply(null, nv);
        const above = sv.filter(v => v > nmax);
        thr = above.length ? (nmax + Math.min.apply(null, above)) / 2 : (nmax + Math.min.apply(null, sv)) / 2;
        survOK = sv.filter(v => v >= thr).length;
        nonOK = nv.filter(v => v < thr).length;
      } else {
        const nmin = Math.min.apply(null, nv);
        const below = sv.filter(v => v < nmin);
        thr = below.length ? (nmin + Math.max.apply(null, below)) / 2 : (nmin + Math.max.apply(null, sv)) / 2;
        survOK = sv.filter(v => v <= thr).length;
        nonOK = nv.filter(v => v > thr).length;
      }
      const perfect = survOK === sv.length && nonOK === nv.length;
      const strong = (survOK / sv.length) >= strongBar && (nonOK / nv.length) >= strongBar;
      if (perfect || strong) {
        out.push({
          factor: cand.key, label: cand.label, side: dir,
          threshold: +thr.toFixed(4),
          survOK, survN: sv.length, nonOK, nonN: nv.length,
          perfect, strong: strong && !perfect,
        });
      }
    }
  }
  out.sort((a, b) => (b.perfect - a.perfect) || ((b.survOK / b.survN + b.nonOK / b.nonN) - (a.survOK / a.survN + a.nonOK / a.nonN)));
  return out;
};

// ROAD_SPLIT(records): the blood/bonds/bread/hybrid composition split of
// survivors vs non-survivors (secondary).
SD.roadSplit = function (records) {
  const out = { survivor: {}, nonsurvivor: {} };
  for (const r of (records || [])) {
    const bucket = r.verdict === 'survivor' ? out.survivor : (r.verdict === 'non-survivor' ? out.nonsurvivor : null);
    if (!bucket) continue;
    const road = r.road || 'none';
    bucket[road] = (bucket[road] | 0) + 1;
  }
  return out;
};

module.exports = SD;
