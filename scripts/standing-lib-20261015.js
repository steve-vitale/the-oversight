#!/usr/bin/env node
'use strict';
// scripts/standing-lib-20261015.js — standing-economy census instrument
// (fleshout-*, loop A, axis scale-onramp, 2026-10-15: sim-standecon).
//
// INSTRUMENT ONLY — reads engine state, never writes game code. Built on
// scripts/wave4gate-lib-20261015.js's sampleGate() (engine-read-equivalent,
// proven by scripts/test-wave4gate-20261015.js), plus PURE census functions
// over persisted run records (rows sampled every 5 game-days + unlock
// transitions, with the war/diplomacy/plenty breakdown per row).
//
// What the census answers (the calibration brief for Steve):
//   1. At wave-4 unlock: % of standing from each source (war / diplomacy /
//      plenty), per policy road (leadfeast / belongfeast). "100%
//      attribution" = every run's unlock-row breakdown present and summing
//      to raw.
//   2. Days-to-wave-4 distribution per road.
//   3. The plenty-cap bind at wave 5: gated-at-199 events (raw >= t5 while
//      capped < t5) per road.
//   4. Measured vs standingCfg()'s intent comment ("wave-4 organic unlocks
//      on ~30-50% of day-80+ runs; earliest T4 >= ~day 60").
//   5. Whether t4=100 is "nearly free" on the bread road (5 feasts), and
//      what raising the bar would cost the courtship/survival road —
//      a DESIGN BRIEF FOR STEVE, not a redesign.
//
// The census decomposes villageStandingTotal()'s GAINS by source: between
// consecutive rows it diffs war/diplomacy/plenty, so per-run-per-day source
// gains are measured, not just end states.
const wave4gate = require('./wave4gate-lib-20261015');

const G = { sampleGate: wave4gate.sampleGate, classifySample: wave4gate.classifySample,
  classifyGate: wave4gate.classifyGate, SAYRE: wave4gate.SAYRE };

G.cfgOf = wave4gate.cfgOf;

// shares(row): % of RAW standing from each source at one row. Returns null
// when the row has no breakdown (unattributable) — the census counts these
// against the 100%-attribution bar, never silently.
G.shares = function (row) {
  try {
    const war = (row.war | 0), dip = (row.diplomacy | 0), pl = (row.plenty | 0);
    const raw = (row.raw | 0);
    if (!raw) return { war: 0, diplomacy: 0, plenty: 0, raw: 0, attributable: false };
    return {
      war: war / raw, diplomacy: dip / raw, plenty: pl / raw, raw,
      counts: { war, diplomacy: dip, plenty: pl },
      attributable: true,
    };
  } catch (e) { return null; }
};

// dominantSource(shares): war | diplomacy | plenty | hybrid (no source >= 50%).
G.dominantSource = function (sh) {
  if (!sh || !sh.attributable) return 'unattributable';
  if (sh.war >= 0.5) return 'war';
  if (sh.diplomacy >= 0.5) return 'diplomacy';
  if (sh.plenty >= 0.5) return 'plenty';
  return 'hybrid';
};

// unlockRow(run): the persisted row closest at-or-before the wave-4 unlock
// day (unlockDay[4] from the sweep's transition tracking; fallback: first
// row with uw >= 4). Rows carry gameDay.
G.unlockRow = function (run) {
  try {
    const rows = (run.rows || []).slice().sort((a, b) => a.gameDay - b.gameDay);
    if (!rows.length) return null;
    const u4 = (run.unlockDay && run.unlockDay[4] != null) ? run.unlockDay[4] : null;
    if (u4 != null) {
      let best = null;
      for (const r of rows) { if (r.gameDay <= u4 + 1) best = r; else break; }
      if (best) return best;
    }
    for (const r of rows) if (r.uw >= 4) return r;
    return rows[rows.length - 1];
  } catch (e) { return null; }
};

// gainTrace(run): per-interval source gains (war/diplomacy/plenty deltas
// between consecutive rows, normalized to per-game-day), plus the cumulative
// sources of each increment. Pure over persisted rows.
G.gainTrace = function (run) {
  const out = [];
  try {
    const rows = (run.rows || []).slice().sort((a, b) => a.gameDay - b.gameDay);
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1], b = rows[i];
      const dt = (b.gameDay - a.gameDay) || 1;
      out.push({
        fromDay: a.gameDay, toDay: b.gameDay,
        dWar: ((b.war | 0) - (a.war | 0)) / dt,
        dDip: (((b.diplomacy | 0)) - (a.diplomacy | 0)) / dt,
        dPlenty: ((b.plenty | 0) - (a.plenty | 0)) / dt,
        dRaw: ((b.raw | 0) - (a.raw | 0)) / dt,
      });
    }
  } catch (e) {}
  return out;
};

// censusRun(run): per-run census — the unit of the 100%-attribution bar.
G.censusRun = function (run) {
  const c = { seed: run.seed, policyId: run.policyId, gameDays: run.gameDays,
    endReason: run.endReason, scaleRank: run.scaleRank, tableEver: !!run.tableEver,
    w4: null, w5: null, capEvents: [], capBoundW5: false };
  try {
    const w4u = (run.unlockDay && run.unlockDay[4] != null) ? run.unlockDay[4] : null;
    const w5u = (run.unlockDay && run.unlockDay[5] != null) ? run.unlockDay[5] : null;
    const urow = G.unlockRow(run);
    const sh = urow ? G.shares(urow) : null;
    c.w4 = { unlocked: w4u != null, day: w4u,
      shares: sh, dominant: G.dominantSource(sh),
      feastsAtUnlock: urow ? ((urow.feasts | 0) || 0) : null,
      warPtsAtUnlock: urow ? ((urow.warPts | 0) || 0) : null,
      linksAtUnlock: urow ? ((urow.links | 0) || 0) : null,
      rowDay: urow ? urow.gameDay : null };
    c.w5 = { unlocked: w5u != null, day: w5u };
    // gated-at-199 events: rows where raw >= t5 while capped < t5 (the
    // plenty cap holding a village that earned the bar).
    const t5 = 200;
    for (const r of (run.rows || [])) {
      if (((r.raw | 0) >= t5) && (((r.capped | 0)) < t5)) {
        c.capEvents.push({ day: r.gameDay, raw: r.raw, capped: r.capped,
          war: r.war, diplomacy: r.diplomacy, plenty: r.plenty,
          feasts: r.feasts, uw: r.uw });
      }
    }
    c.capBoundW5 = !c.w5.unlocked && c.capEvents.length > 0;
  } catch (e) { c.error = String((e && e.message) || e); }
  return c;
};

// censusRoad(runs, policyId): per-road aggregate.
G.censusRoad = function (runs, policyId) {
  const road = runs.filter(r => r.policyId === policyId);
  const cRuns = road.map(G.censusRun);
  const w4days = cRuns.filter(r => r.w4.unlocked && r.w4.day != null)
    .map(r => r.w4.day).sort((a, b) => a - b);
  const med = w4days.length ? w4days[Math.floor(w4days.length / 2)] : null;
  const attrib = cRuns.filter(r => r.w4.unlocked &&
    r.w4.shares && r.w4.shares.attributable).length;
  const unlocked = cRuns.filter(r => r.w4.unlocked).length;
  const shareMean = { war: 0, diplomacy: 0, plenty: 0 };
  let shareN = 0;
  const dom = { war: 0, diplomacy: 0, plenty: 0, hybrid: 0, unattributable: 0 };
  const feats = [];
  for (const r of cRuns) {
    if (r.w4.shares && r.w4.shares.attributable) {
      shareMean.war += r.w4.shares.war; shareMean.diplomacy += r.w4.shares.diplomacy;
      shareMean.plenty += r.w4.shares.plenty; shareN++;
    }
    dom[r.w4.dominant] = (dom[r.w4.dominant] || 0) + 1;
    if (r.w4.unlocked && r.w4.feastsAtUnlock != null) feats.push(r.w4.feastsAtUnlock);
  }
  if (shareN) { shareMean.war /= shareN; shareMean.diplomacy /= shareN; shareMean.plenty /= shareN; }
  feats.sort((a, b) => a - b);
  const w5u = cRuns.filter(r => r.w5.unlocked).length;
  const capRuns = cRuns.filter(r => r.capEvents.length > 0).length;
  const capBoundRuns = cRuns.filter(r => r.capBoundW5).length;
  const dead = cRuns.filter(r => r.gameDays < 180).length;
  return { policyId, runs: road.length, cRuns,
    w4Unlock: unlocked, w4Share: road.length ? unlocked / road.length : 0,
    w4Days: w4days, w4Median: med, w4Min: w4days.length ? w4days[0] : null,
    w4Max: w4days.length ? w4days[w4days.length - 1] : null,
    w5Unlock: w5u, capRuns, capBoundRuns,
    attributionRate: unlocked ? attrib / unlocked : 1,
    shareMeanAtUnlock: shareMean, dominantAtUnlock: dom,
    feastsAtUnlock: feats, feastsMedian: feats.length ? feats[Math.floor(feats.length / 2)] : null,
    deadBefore180: dead };
};

// censusGo(runs): the GO bar — 100% attribution of standing sources at
// unlock on every w4-unlocking run, plus every run classified (the
// wave4gate classifier's binding rung present).
G.censusGo = function (runs) {
  const misses = [];
  for (const r of runs) {
    const b = r.classification && r.classification.w4 && r.classification.w4.binding;
    if (!b) { misses.push({ seed: r.seed, policyId: r.policyId, miss: 'unclassified' }); continue; }
    const cr = G.censusRun(r);
    if (cr.w4.unlocked && (!cr.w4.shares || !cr.w4.shares.attributable)) {
      misses.push({ seed: r.seed, policyId: r.policyId, miss: 'unattributed-unlock' });
    }
  }
  return { go: misses.length === 0, misses, runs: runs.length };
};

module.exports = G;
