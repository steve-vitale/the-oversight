#!/usr/bin/env node
// scripts/test-diverge73677-a-sweep.js — sim-diverge73677-a analyzer
// (scale-onramp axis, 2026-10-27, arm sim-diverge73677-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// PURE over corpus files: no sim runs, no Game load. Modes:
//   --diff <censusRow> <transcriptRow>  : first-divergence day (null
//     when the trajectories agree), trajectory-field table, wall
//     counts via the seq51gap analyzer, and a fightId-only diff
//     classification for tbEnds / nonworldkill rows.
//   --compare : the arm's rep table — every rep file under
//     evidence/2026-10-27/perseed-diverge73677-a/ summarized by
//     (mode, rep) with days / deaths / walls, plus within-mode
//     equality and cross-mode equality verdicts.
//
// The binding pre-registration lives in
// evidence/2026-10-27/sim-diverge73677-a-prereg.md — read it before
// judging anything this script prints. This script does NOT run the
// C/D bisection arms: arm 3 of the prereg triggers only when the
// fresh census and transcript modes diverge, and on the current base
// they do not (see the final evidence file). No C/D recorder was
// built for a condition that did not trigger.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const seq51 = require('./test-seq51gap-diag-sweep');

const TRAJ_KEYS = ['days', 'gameDays', 'endReason', 'won', 'waveReach',
  'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal',
  'table', 'entered', 'deathTotal', 'starvationDeaths', 'finalPop',
  'finalPantry', 'finalKnown'];

function wallsOfRow(row) {
  const out = [];
  for (const q of seq51.wave4Seqs(row)) {
    const tr = seq51.traceSeq(row, q);
    for (const s of tr.steps) {
      if (s.cause === 'C2-palisade-wall' || s.cause === 'C2?-wall-amount-only') {
        out.push({ seq: q, cause: s.cause, detail: s.detail });
      }
    }
  }
  return out;
}

function tickKey(t) {
  const ents = (t.entities || []).map(e => [e.seq, e.id, e.hp, e.maxHp,
    e.tx, e.ty, e.lingering, e.lingerSince == null ? null : e.lingerSince])
    .sort((a, b) => (a[0] - b[0]) || String(a[1]).localeCompare(String(b[1])));
  return JSON.stringify([t.day, ents, t.lastRaidDay, t.havenTier, t.hx, t.hy]);
}

// stripId: fightIds are 'f' + Date.now().toString(36) + '_' + random
// suffix. The random suffix is RNG-stream-derived (identical across
// narration modes); the timestamp prefix is harness-clock-derived
// (shifts with every emit's Date.now() call). Comparing rows with
// the prefix stripped tests trajectory equality; comparing raw tests
// ID equality. Both are reported, never conflated.
function stripFightIds(v) {
  if (typeof v === 'string') return v.replace(/f[0-9a-z]+_/g, 'f<_ts>_');
  if (Array.isArray(v)) return v.map(stripFightIds);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = stripFightIds(v[k]);
    return o;
  }
  return v;
}

function diffRows(a, b) {
  const traj = {};
  for (const k of TRAJ_KEYS) traj[k] = { a: a[k], b: b[k], eq: a[k] === b[k] };
  const trajEq = TRAJ_KEYS.every(k => traj[k].eq);
  const deathsEq = JSON.stringify(a.deaths) === JSON.stringify(b.deaths);
  const facedEq = JSON.stringify(a.faced) === JSON.stringify(b.faced);
  const logEq = JSON.stringify(a.logEntries) === JSON.stringify(b.logEntries);
  const tsEq = JSON.stringify(a.ts) === JSON.stringify(b.ts);
  const ta = (a.seq51gap && a.seq51gap.ticks) || [];
  const tb = (b.seq51gap && b.seq51gap.ticks) || [];
  const tickDaysEq = JSON.stringify(ta.map(t => t.day)) === JSON.stringify(tb.map(t => t.day));
  let firstTickDiffDay = null;
  const tickDiffs = [];
  for (let i = 0; i < Math.max(ta.length, tb.length); i++) {
    const ka = ta[i] ? tickKey(ta[i]) : null;
    const kb = tb[i] ? tickKey(tb[i]) : null;
    if (ka !== kb) {
      tickDiffs.push({ index: i, dayA: ta[i] ? ta[i].day : null, dayB: tb[i] ? tb[i].day : null });
      if (firstTickDiffDay == null) firstTickDiffDay = ta[i] ? ta[i].day : tb[i].day;
    }
  }
  const sections = ['w4dmg', 'wave4enc', 'spawnsrc', 'fieldfinish', 'nonworldkill'];
  const secRaw = {}, secStripped = {};
  for (const s of sections) {
    secRaw[s] = JSON.stringify(a[s]) === JSON.stringify(b[s]);
    secStripped[s] = JSON.stringify(stripFightIds(a[s])) === JSON.stringify(stripFightIds(b[s]));
  }
  const wallsA = wallsOfRow(a), wallsB = wallsOfRow(b);
  const wallsEq = JSON.stringify(wallsA) === JSON.stringify(wallsB);
  return {
    traj, trajEq, deathsEq, facedEq, logEq, tsEq, tickDaysEq,
    tickCount: [ta.length, tb.length], tickDiffs, firstTickDiffDay,
    secRaw, secStripped, wallsA, wallsB, wallsEq,
    days: [a.days, b.days], deaths: [a.deathTotal, b.deathTotal],
  };
}

function summarizeRow(row) {
  const walls = wallsOfRow(row);
  return {
    days: row.days, gameDays: row.gameDays, endReason: row.endReason,
    won: row.won, deaths: row.deathTotal, walls: walls.length,
    finalRank: row.finalRank, table: row.table, entered: row.entered,
  };
}

function diffMode(censusPath, transcriptPath) {
  const a = JSON.parse(fs.readFileSync(censusPath, 'utf8'));
  const b = JSON.parse(fs.readFileSync(transcriptPath, 'utf8'));
  const d = diffRows(a, b);
  console.log(`DIFF census=${path.basename(censusPath)} transcript=${path.basename(transcriptPath)}`);
  console.log(`  trajectory fields equal: ${d.trajEq} (days ${d.days[0]}/${d.days[1]}, deaths ${d.deaths[0]}/${d.deaths[1]})`);
  for (const k of TRAJ_KEYS) if (!d.traj[k].eq) console.log(`  TRAJ DIFF ${k}: A=${d.traj[k].a} B=${d.traj[k].b}`);
  console.log(`  deaths breakdown equal: ${d.deathsEq}; faced equal: ${d.facedEq}; kill-log equal: ${d.logEq}; ts equal: ${d.tsEq}`);
  console.log(`  ticks: ${d.tickCount[0]}/${d.tickCount[1]}, tick days equal: ${d.tickDaysEq}, tick diffs: ${d.tickDiffs.length}, firstTickDiffDay: ${d.firstTickDiffDay}`);
  for (const s of Object.keys(d.secRaw)) {
    console.log(`  section ${s}: raw equal: ${d.secRaw[s]}, fightId-prefix-stripped equal: ${d.secStripped[s]}`);
  }
  console.log(`  walls: census ${d.wallsA.length}, transcript ${d.wallsB.length}, equal: ${d.wallsEq}`);
  for (const w of d.wallsA) console.log(`    census wall seq${w.seq} ${w.cause} :: ${w.detail}`);
  for (const w of d.wallsB) console.log(`    transcript wall seq${w.seq} ${w.cause} :: ${w.detail}`);
  console.log(`  VERDICT: ${d.trajEq && d.deathsEq && d.facedEq && d.logEq && d.tsEq && d.tickDiffs.length === 0 && d.wallsEq ? 'TRAJECTORIES AGREE (any remaining diff is fightId timestamps only)' : 'TRAJECTORIES DIFFER — first tick diff day ' + d.firstTickDiffDay}`);
  return d;
}

function compareMode() {
  const dir = path.join(REPO, 'evidence', '2026-10-27', 'perseed-diverge73677-a');
  const reps = [];
  for (const rep of [1, 2, 3]) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, `s73677-census-rep${rep}.json`), 'utf8'));
    const t = JSON.parse(fs.readFileSync(path.join(dir, `s73677-transcript-armed-rep${rep}.json`), 'utf8'));
    reps.push({ rep, census: summarizeRow(c), transcript: summarizeRow(t) });
    console.log(`rep${rep} census: ${JSON.stringify(reps[rep - 1].census)}`);
    console.log(`rep${rep} transcript: ${JSON.stringify(reps[rep - 1].transcript)}`);
  }
  const cEq = reps.every(r => JSON.stringify(r.census) === JSON.stringify(reps[0].census));
  const tEq = reps.every(r => JSON.stringify(r.transcript) === JSON.stringify(reps[0].transcript));
  const crossEq = reps.every(r => JSON.stringify(r.census) === JSON.stringify(r.transcript));
  console.log(`within-mode deterministic: census ${cEq}, transcript ${tEq}; cross-mode identical summaries: ${crossEq}`);
  return { reps, cEq, tEq, crossEq };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--diff')) {
    return diffMode(args[args.indexOf('--diff') + 1], args[args.indexOf('--diff') + 2]);
  }
  if (args.includes('--compare')) return compareMode();
  console.error('usage: --diff <censusRow> <transcriptRow> | --compare');
  process.exit(2);
}
if (require.main === module) main();
module.exports = { diffRows, wallsOfRow, summarizeRow, stripFightIds, TRAJ_KEYS };
