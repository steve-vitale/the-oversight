#!/usr/bin/env node
// scripts/test-woundprice-analyze.js — sim-woundprice-a pricing paper analyzer.
// PURE analysis over the Stage-1 corpus rows on disk (no Game, no RNG,
// no src/js). Re-derives defwound Stage-1 numbers on this base via the
// defwound analyzer (reused VERBATIM), adds: manufactured-fight rounds
// distribution, met-below-line residual sizing, and neutrality vs the
// published 1815 band. Exit 1 on any gate failure (corpus incomplete,
// recorder errs > 0, overflow VALUES > 0).
// Usage: node scripts/test-woundprice-analyze.js [corpusDir]
//   default corpusDir: evidence/2026-10-26/perseed-sim-woundprice-a
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { analyzeDefwound } = require('./policies/defwound-diag');

const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
// Published 1815 control band (evidence/2026-10-25/sim-scale-onramp-round-1815.md).
const CONTROL = {
  raids: 85, raiders: 361, deaths: 234, nationalEver: 7, wins: 4,
  medianDays: 135, poolTotal: 1494, poolW3: 107,
};
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function histOf(arr) {
  const h = {};
  for (const v of arr) h[String(v)] = (h[String(v)] || 0) + 1;
  return h;
}

function main() {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-woundprice-a');
  const rows = [];
  const gateProblems = [];
  for (const seed of SEEDS) {
    const p = path.join(dir, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { gateProblems.push(`missing s${seed}-armed.json`); continue; }
    const row = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(row);
    const checks = [
      ['defwound errs', row.defwound && row.defwound.diag.errs === 0],
      ['defwound overflow values', row.defwound && Object.values(row.defwound.diag.overflow || {}).every(v => v === 0)],
      ['raftdraft errs', row.raftdraft && row.raftdraft.diag.errs === 0],
      ['oldcore errs', row.oldcore && row.oldcore.diag.errs === 0],
      ['spawnsrc errs', row.spawnsrc && row.spawnsrc.diag.errs === 0],
    ];
    for (const [name, ok] of checks) if (!ok) gateProblems.push(`seed ${seed}: ${name} FAILED`);
    // Overflow VALUE gates for the other recorders too (key-count gates
    // are the known defwound-summary bug class; a zero counter is not
    // an overflow). Report values, fail only on a nonzero value.
    for (const key of ['raftdraft', 'oldcore', 'spawnsrc']) {
      const ov = row[key] && row[key].diag && row[key].diag.overflow;
      if (ov && Object.values(ov).some(v => v !== 0)) gateProblems.push(`seed ${seed}: ${key} overflow VALUE nonzero ${JSON.stringify(ov)}`);
    }
  }
  if (rows.length !== SEEDS.length) gateProblems.push(`corpus ${rows.length}/8 seeds`);

  const perSeed = rows.map(r => {
    const a = analyzeDefwound(
      { resolveFights: (r.defwound && r.defwound.resolveFights) || [] },
      r.oldcore || { removals: [] },
      (r.oldcore && r.oldcore.finalPresent) || [],
    );
    return { seed: r.seed, row: r, analysis: a };
  });
  const sum = (f) => perSeed.reduce((t, s) => t + f(s.analysis), 0);
  const merge = (f) => {
    const m = {};
    for (const s of perSeed) { const o = f(s.analysis) || {}; for (const k of Object.keys(o)) m[k] = (m[k] || 0) + o[k]; }
    return m;
  };

  // Rounds distribution for MANUFACTURED defender fights (the fights a
  // narrow defender-finish rule would extend by +1 round each, per the
  // Stage-2 first-divergence check), and for pre-wounded (met) fights.
  const manufRounds = [];
  const metRounds = [];
  const manufBySeed = {};
  const vKillStartFracs = [];
  for (const s of perSeed) {
    const fights = (s.row.defwound && s.row.defwound.resolveFights) || [];
    for (const f of fights) {
      if (!f.raid) continue;
      // The recorder sets manufactured/preWounded flags on ANY row
      // whose end fraction crosses/starts below the line, including
      // vKill rows; the Stage-1 event counts restrict to mFlee
      // below-line ends (analyzeDefwound's defBelowEnd). Mirror that
      // restriction here, or the rounds distribution overcounts.
      if (f.outcome !== 'mFlee') continue;
      if (f.manufactured) { manufRounds.push(f.rounds | 0); manufBySeed[s.seed] = (manufBySeed[s.seed] || 0) + 1; }
      if (f.preWounded) metRounds.push(f.rounds | 0);
      if (f.outcome === 'vKill' && f.mHpStartFrac != null) vKillStartFracs.push(f.mHpStartFrac);
    }
  }

  // Met-below-line residual: the population a met-finish rule would
  // touch = pre-wounded defender mFlee-below-line events + their
  // re-meets (all rounds-0 phantoms on the defwound band). Also the
  // defender fights STARTING below the line (every one ends mFlee).
  const residual = {
    preWoundedEvents: sum(a => a.defender.preWounded),
    preWoundedByWave: merge(a => a.defender.preWoundedByWave),
    defenderStartBelowLine: sum(a => a.defender.startBelowLine),
    preWoundedReMeets: sum(a => a.remeet.preWounded.totalReMeets),
    preWoundedReMetEvents: sum(a => a.remeet.preWounded.reMetAtLeastOnce),
    preWoundedFinished: sum(a => a.remeet.preWounded.finishedEntities),
    preWoundedRounds0ReMeets: sum(a => a.remeet.preWounded.rounds0ReMeets),
  };

  const raftRaids = [];
  for (const r of rows) for (const x of (r.raftdraft.raids || [])) raftRaids.push(x);
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    raids: raftRaids.length,
    raiders: raftRaids.reduce((t, r) => t + (r.raiders || []).length, 0),
    poolTotal: raftRaids.reduce((t, r) => t + (r.livingN || 0), 0),
    poolW3: raftRaids.reduce((t, r) => t + (r.w3plusPool || []).length, 0),
  };
  const neutrality = {
    control: CONTROL, observed: band,
    exact: band.raids === CONTROL.raids && band.raiders === CONTROL.raiders
      && band.deathTotal === CONTROL.deaths && band.nationalEver === CONTROL.nationalEver
      && band.won === CONTROL.wins && band.medianDays === CONTROL.medianDays
      && band.poolTotal === CONTROL.poolTotal && band.poolW3 === CONTROL.poolW3,
  };

  const out = {
    label: 'sim-woundprice-a Stage-1 re-derivation + pricing inputs',
    seeds: SEEDS, corpusDir: dir,
    gates: { problems: gateProblems, pass: gateProblems.length === 0 },
    neutrality,
    band,
    stage1: {
      defenderFights: sum(a => a.defender.fights),
      defenderByOutcome: merge(a => a.defender.byOutcome),
      defenderStartBelowLine: sum(a => a.defender.startBelowLine),
      mFleeBelowLine: sum(a => a.defender.mFleeBelowLine),
      manufactured: sum(a => a.defender.manufactured),
      manufacturedByWave: merge(a => a.defender.manufacturedByWave),
      preWounded: sum(a => a.defender.preWounded),
      preWoundedByWave: merge(a => a.defender.preWoundedByWave),
      untaggedBelowLine: sum(a => a.defender.untaggedBelowLine),
      otherBelowLineEnds: sum(a => a.defender.otherBelowLineEnds),
      fieldMFleeBelowLine: sum(a => a.field.mFleeBelowLine),
      fieldManufactured: sum(a => a.field.manufactured),
      fieldPreWounded: sum(a => a.field.preWounded),
      remeetAll: {
        events: sum(a => a.remeet.all.events),
        distinctEntities: sum(a => a.remeet.distinctEntities),
        reMetAtLeastOnce: sum(a => a.remeet.all.reMetAtLeastOnce),
        totalReMeets: sum(a => a.remeet.all.totalReMeets),
        finishedEntities: sum(a => a.remeet.all.finishedEntities),
        rounds0ReMeets: sum(a => a.remeet.all.rounds0ReMeets),
        hpRiseEvents: sum(a => a.remeet.all.hpRiseEvents),
      },
      remeetManufactured: {
        events: sum(a => a.remeet.manufactured.events),
        reMetAtLeastOnce: sum(a => a.remeet.manufactured.reMetAtLeastOnce),
        totalReMeets: sum(a => a.remeet.manufactured.totalReMeets),
        finishedEntities: sum(a => a.remeet.manufactured.finishedEntities),
      },
      remeetPreWounded: {
        events: sum(a => a.remeet.preWounded.events),
        reMetAtLeastOnce: sum(a => a.remeet.preWounded.reMetAtLeastOnce),
        totalReMeets: sum(a => a.remeet.preWounded.totalReMeets),
        finishedEntities: sum(a => a.remeet.preWounded.finishedEntities),
      },
      fates: merge(a => a.fates),
    },
    perSeed: perSeed.map(s => ({
      seed: s.seed, days: s.row.days, endReason: s.row.endReason, won: s.row.won,
      defenderFights: s.analysis.defender.fights,
      byOutcome: s.analysis.defender.byOutcome,
      mFleeBelowLine: s.analysis.defender.mFleeBelowLine,
      manufactured: s.analysis.defender.manufactured,
      preWounded: s.analysis.defender.preWounded,
      vKill: (s.analysis.defender.byOutcome.vKill || 0),
    })),
    manufacturedRounds: {
      n: manufRounds.length,
      hist: histOf(manufRounds),
      median: medianOf(manufRounds),
      mean: Number(meanOf(manufRounds).toFixed(2)),
      min: manufRounds.length ? Math.min(...manufRounds) : null,
      max: manufRounds.length ? Math.max(...manufRounds) : null,
      bySeed: manufBySeed,
      // +1 round each (Stage-2 divergence finding): total extra rounds
      // the narrow finish would add across the band, and the mean
      // relative lengthening of a manufactured fight.
      extraRoundsIfPlus1: manufRounds.length,
      meanRelativeLengthening: manufRounds.length ? Number((1 / meanOf(manufRounds)).toFixed(3)) : null,
    },
    metRounds: { n: metRounds.length, hist: histOf(metRounds) },
    vKillStartFracMin: vKillStartFracs.length ? Math.min(...vKillStartFracs) : null,
    residual,
  };
  console.log(JSON.stringify(out, null, 1));
  if (gateProblems.length) { console.error('WOUNDPRICE GATE FAILURE:', gateProblems.join('; ')); process.exit(1); }
}
main();
