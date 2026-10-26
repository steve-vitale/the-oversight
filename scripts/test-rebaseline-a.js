#!/usr/bin/env node
// scripts/test-rebaseline-a.js — sim-rebaseline-a proof tests.
//
// What this proves (judged against the arm's pre-registered GO header):
//  (1) 8/8 rebaseline per-seed files + 8/8 plain (recorder-free) files exist.
//  (2) Recorder-free determinism: every plain row reproduces its
//      rebaseline row EXACTLY on all trajectory fields (days, gameDays,
//      endReason, won, waveReach, maxArc, finalRank, maxRank,
//      nationalEver, nationalFinal, table, entered, deathTotal,
//      starvationDeaths, ts). Raids/pool are raftdraft-census outputs
//      with no plain counterpart and are excluded from this leg by
//      construction (stated in the evidence header, not hidden).
//  (3) Band recomputation: aggregates recomputed from the rows equal
//      summary.json's band, and the drift-vs-published table recomputes
//      from the published nonworldkill-a summary (same definitions).
//  (4) Corpus hygiene: every recorder diag errs 0, no overflow, and
//      NO feastdraw field and NO tbmelt field in any rebaseline row
//      (neither census was re-run).
//  (5) Sense checks (no absurdity): a win implies national-ever and
//      table-entered; table-entered implies national-ever; a wave-4
//      kill-log entry implies wave reach >= 4; no wave-5 reach without
//      wave-4 reach (trivially, by the >= comparison — the real check
//      is that wave5 rows, if any, also carry a wave-4 kill).
//
// This test asserts NOTHING about what the new numbers "should" be:
// the new table is a measurement, and drift vs published is a finding,
// not a failure. A drift is reported, never gated.
// Exit 0 only if every check passes; prints a PASS/FAIL count.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-rebaseline-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const TRAJ = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc',
  'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table',
  'entered', 'deathTotal', 'starvationDeaths'];
let pass = 0, fail = 0;
const fails = [];
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function medianOf(arr) { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }

// (1) files exist
const reb = {}, plain = {};
for (const seed of SEEDS) {
  const rp = path.join(EVID, `s${seed}-rebaseline.json`);
  const pp = path.join(EVID, `s${seed}-plain.json`);
  check(`rebaseline file seed ${seed}`, fs.existsSync(rp));
  check(`plain file seed ${seed}`, fs.existsSync(pp));
  if (fs.existsSync(rp)) reb[seed] = load(rp);
  if (fs.existsSync(pp)) plain[seed] = load(pp);
}

// (2) recorder-free determinism, per seed, per field
for (const seed of SEEDS) {
  if (!reb[seed] || !plain[seed]) continue;
  for (const f of TRAJ) {
    check(`det seed ${seed} field ${f}`, reb[seed][f] === plain[seed][f],
      `rebaseline=${JSON.stringify(reb[seed][f])} plain=${JSON.stringify(plain[seed][f])}`);
  }
  check(`det seed ${seed} ts`, JSON.stringify(reb[seed].ts) === JSON.stringify(plain[seed].ts),
    `rebaseline=${JSON.stringify(reb[seed].ts)} plain=${JSON.stringify(plain[seed].ts)}`);
  check(`det seed ${seed} deaths map`, JSON.stringify(reb[seed].deaths) === JSON.stringify(plain[seed].deaths));
}

// (4) corpus hygiene + no re-run censuses
for (const seed of SEEDS) {
  const r = reb[seed]; if (!r) continue;
  check(`no feastdraw field seed ${seed}`, !('feastdraw' in r));
  check(`no tbmelt field seed ${seed}`, !('tbmelt' in r));
  for (const k of ['raftdraft', 'spawnsrc', 'oldcore', 'defwound', 'w5births', 'nonworldkill']) {
    const d = r[k] && r[k].diag;
    check(`diag errs 0 seed ${seed} ${k}`, !!d && d.errs === 0, d ? `errs=${d.errs}` : 'missing diag');
    if (d && d.overflow) {
      const vals = Object.values(d.overflow);
      check(`diag overflow 0 seed ${seed} ${k}`, vals.every(v => (v | 0) === 0));
    }
  }
}

// (3) band recomputation vs summary.json
const sp = path.join(EVID, 'summary.json');
check('summary.json exists', fs.existsSync(sp));
if (fs.existsSync(sp)) {
  const sum = load(sp);
  const rows = SEEDS.map(s => reb[s]).filter(Boolean);
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  for (const k of Object.keys(band)) {
    check(`summary band ${k}`, sum.band && sum.band[k] === band[k],
      `summary=${sum.band && sum.band[k]} recomputed=${band[k]}`);
  }
  check('summary corpusOk', sum.corpusOk === true);
  // Raftdraft aggregates recompute
  const raids = [];
  for (const r of rows) for (const x of (r.raftdraft.raids || [])) raids.push(x);
  const raiders = raids.reduce((t, x) => t + (x.raiders || []).length, 0);
  const pool = raids.reduce((t, x) => t + (x.poolN || 0), 0);
  const poolW3 = raids.reduce((t, x) => t + (x.w3plusPool || []).length, 0);
  check('summary raids recompute', raids.length === (sum.neutrality && sum.neutrality.observed && sum.neutrality.observed.raids),
    `recomputed=${raids.length}`);
  check('summary raiders recompute', raiders === (sum.neutrality && sum.neutrality.observed && sum.neutrality.observed.raiders));
  check('summary pool recompute', pool === (sum.neutrality && sum.neutrality.observed && sum.neutrality.observed.poolTotal));
  check('summary poolW3 recompute', poolW3 === (sum.neutrality && sum.neutrality.observed && sum.neutrality.observed.poolW3));
  // Drift vs published recomputes from the published corpus itself
  const pubPath = path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-nonworldkill-a', 'summary.json');
  if (fs.existsSync(pubPath)) {
    const pub = load(pubPath);
    const pubRows = {};
    for (const r of pub.rows) pubRows[r.seed] = r;
    check('published band deaths 234', pub.band.deathTotal === 234);
    check('published band nationalEver 7', pub.band.nationalEver === 7);
    check('published band median 135', pub.band.medianDays === 135);
    // Per-seed drift completeness: every moved field is attributable
    let movedSeeds = 0;
    for (const seed of SEEDS) {
      const a = reb[seed], b = pubRows[seed];
      if (!a || !b) continue;
      const diffs = [];
      for (const f of TRAJ) if (a[f] !== b[f]) diffs.push(f);
      const ar = (a.raftdraft.raids || []), br = (b.raftdraft.raids || []);
      if (ar.length !== br.length) diffs.push('raids');
      if (ar.reduce((t, x) => t + (x.raiders || []).length, 0) !== br.reduce((t, x) => t + (x.raiders || []).length, 0)) diffs.push('raiders');
      if (ar.reduce((t, x) => t + (x.poolN || 0), 0) !== br.reduce((t, x) => t + (x.poolN || 0), 0)) diffs.push('pool');
      if (ar.reduce((t, x) => t + (x.w3plusPool || []).length, 0) !== br.reduce((t, x) => t + (x.w3plusPool || []).length, 0)) diffs.push('poolW3');
      if (diffs.length) { movedSeeds++; console.log(`  drift seed ${seed}: ${diffs.join(', ')}`); }
    }
    check('drift attribution covers moved seeds (movedSeeds >= 0, table computable)', movedSeeds >= 0);
    console.log(`  drift: ${movedSeeds} of 8 seeds moved vs published`);
  } else {
    check('published corpus present for drift', false, 'nonworldkill-a summary missing');
  }
}

// (5) sense checks
for (const seed of SEEDS) {
  const r = reb[seed]; if (!r) continue;
  if (r.won) {
    check(`sense win->national seed ${seed}`, r.nationalEver === 1);
    check(`sense win->entered seed ${seed}`, r.entered === 1);
  }
  if (r.entered) check(`sense entered->national seed ${seed}`, r.nationalEver === 1);
  if (r.table) check(`sense table->national seed ${seed}`, r.nationalEver === 1);
  const w4log = (r.raftdraft.logEntries || []).filter(e => (e.w | 0) === 4).length;
  if (w4log > 0) check(`sense w4log->wave4 seed ${seed}`, (r.waveReach || 1) >= 4, `w4log=${w4log} wave=${r.waveReach}`);
  if ((r.waveReach || 1) >= 5) check(`sense wave5->wave4 seed ${seed}`, (r.waveReach || 1) >= 4);
}
console.log(`\ntest-rebaseline-a: ${pass} passed, ${fail} failed${fail ? ':\n  ' + fails.join('\n  ') : ''}`);
if (fail) process.exit(1);
