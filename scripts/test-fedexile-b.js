#!/usr/bin/env node
// test-fedexile-b.js — proof for sim-fedexile-b (prereg:
// evidence/2026-10-30/sim-fedexile-b-prereg.md).
// Pure unit tests run standalone (no corpus needed); corpus
// checks run on the judged corpora + determinism re-run.
// Usage: node scripts/test-fedexile-b.js [censusJson]
//   [determinismFile] [judgedVariantFile]
// No game code, no RNG, no state edits. Exits non-zero on any fail.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra ? ' :: ' + extra : '')); console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---- Pure units: strand extraction (mirror of analyzer logic) ----
function isStill(e) { const w = e.woodcarry || {}; return w.bucket === 'creek' && !w.rescued; }
function strands(evs) {
  const out = []; let cur = null;
  for (const e of evs.slice().sort((a, b) => a.loopDay - b.loopDay)) {
    if (isStill(e)) {
      if (cur && e.loopDay === cur.endDay + 1) { cur.days.push(e.loopDay); cur.endDay = e.loopDay; }
      else { cur = { startDay: e.loopDay, endDay: e.loopDay, days: [e.loopDay] }; out.push(cur); }
    } else cur = null;
  }
  for (const s of out) s.length = s.days.length;
  return out;
}
function mkEv(d, bucket, rescued) { return { loopDay: d, woodcarry: { bucket, rescued } }; }
{
  const s = strands([mkEv(7, 'creek', false), mkEv(8, 'creek', false), mkEv(9, 'creek', true), mkEv(10, 'creek', false)]);
  check('strand: rescued breaks run', s.length === 2 && s[0].length === 2 && s[1].length === 1, JSON.stringify(s));
  const s2 = strands([mkEv(7, 'creek', false), mkEv(8, 'haven', false), mkEv(9, 'creek', false)]);
  check('strand: non-creek evening breaks run', s2.length === 2, JSON.stringify(s2));
  const s3 = strands([mkEv(16, 'creek', false)]);
  check('strand: run-end single strand kept', s3.length === 1 && s3[0].length === 1);
  const s4 = strands([]);
  check('strand: empty evenings, no strands', s4.length === 0);
  const s5 = strands([mkEv(7, 'creek', false), mkEv(9, 'creek', false)]);
  check('strand: gap day breaks run (non-consecutive)', s5.length === 2, JSON.stringify(s5));
}
// Pairing by order + delta.
{
  const c = [{ startDay: 7, endDay: 16, length: 10 }];
  const v = [{ startDay: 7, endDay: 23, length: 17 }];
  check('pair: same-start extension delta +7', v[0].length - c[0].length === 7);
  const c2 = [{ startDay: 7, endDay: 9, length: 3 }];
  const v2 = [{ startDay: 7, endDay: 9, length: 3 }, { startDay: 20, endDay: 22, length: 3 }];
  check('pair: second variant strand unpaired', v2.length > c2.length);
}
// Median.
function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
check('median: odd', median([7]) === 7);
check('median: even averages middles', median([0, 7]) === 3.5);
check('median: empty null', median([]) === null);
// Wood-seeking scan (same patterns as analyzer).
const GAIN_RES = [
  /comes down with a crack that echoes\. \+\d+ wood\./,
  /You clear the brush\. \+1 wood \(brushwood\)\./,
  /You cut through the fallen tree\. \+2 wood\./,
];
const ATTEMPT_RES = [/Nothing to cut there\./];
function scan(lines) {
  if (!Array.isArray(lines)) return { verdict: 'no-lines-recorded', matched: [] };
  const matched = [];
  for (const l of lines) {
    for (const re of GAIN_RES) if (re.test(l)) matched.push(l);
    for (const re of ATTEMPT_RES) if (re.test(l)) matched.push(l);
  }
  return { verdict: matched.length ? 'seeking' : 'not-seeking', matched };
}
check('scan: fell gain line', scan(['The tree comes down with a crack that echoes. +3 wood. The ground is clear now.']).verdict === 'seeking');
check('scan: bigtree fell gain line', scan(['You pick the straight one — good grain, splits clean, burns hot. The big tree comes down with a crack that echoes. +6 wood.']).verdict === 'seeking');
check('scan: brush gain line', scan(['You clear the brush. +1 wood (brushwood). Easier walking here now.']).verdict === 'seeking');
check('scan: fallen-tree gain line', scan(['You cut through the fallen tree. +2 wood. The path is clear.']).verdict === 'seeking');
check('scan: attempt line', scan(['Nothing to cut there.']).verdict === 'seeking');
check('scan: refusal line NOT seeking', scan(['No bridge tonight — the pack holds 3 logs, and a bridge needs 4.']).verdict === 'not-seeking');
check('scan: creek line NOT seeking', scan(['The creek runs fast here — no crossing without a bridge or a swim.']).verdict === 'not-seeking');
check('scan: fire line NOT seeking', scan(['The tinder catches. A real flame, breathing. You feed it twigs — fire. Yours. (-70 kcal, 48 ticks.) (It will burn down. Feed it branches or a log to keep it alive.)']).verdict === 'not-seeking');
check('scan: fuel prompt NOT seeking', scan(['You need fuel — gather fallen branches, or cut a log.']).verdict === 'not-seeking');
check('scan: travel line NOT seeking', scan(['Travel 1 tile to wetland.']).verdict === 'not-seeking');
check('scan: forage line NOT seeking', scan(['You work the patch: 6× Muscadine Grapes — and 5× unknown shoots, 8× unknown berries you can\'t name yet. This patch is picked clean — it\'ll recover in a few days.']).verdict === 'not-seeking');
check('scan: no lines recorded', scan(null).verdict === 'no-lines-recorded');
check('scan: empty day not seeking', scan([]).verdict === 'not-seeking');
// Bearer-death day extraction + censoring.
function bearerFirst(deaths) {
  const b = (deaths || []).filter((x) => x && x.player === true);
  return b.length ? b[0].day : null;
}
check('bearer: first bearer day', bearerFirst([{ day: 3, player: false }, { day: 17, player: true, cause: 'the wild' }]) === 17);
check('bearer: none censored', bearerFirst([{ day: 3, player: false }]) === null);
check('death-delay: pressb case +6', (() => { const c = bearerFirst([{ day: 17, player: true }]); const v = bearerFirst([{ day: 23, player: true }]); return v - c; })() === 6);

// ---- Corpus checks (only when census path given) ----
const censusPath = process.argv[2];
const determinismFile = process.argv[3];
const judgedVariantFile = process.argv[4];
if (censusPath) {
  let census;
  try { census = JSON.parse(fs.readFileSync(censusPath, 'utf8')); }
  catch (e) { check('corpus: census readable', false, e.message); census = null; }
  if (census) {
    const t = census.totals;
    check('corpus: 10 control seeds', t.seeds === 10, 'got ' + t.seeds);
    check('corpus: 10 variant seeds', t.variantSeeds === 10, 'got ' + t.variantSeeds);
    check('corpus: errs 0 both legs', t.controlErrs === 0 && t.variantErrs === 0, 'c/v ' + t.controlErrs + '/' + t.variantErrs);
    check('corpus: stalls 0', t.stalls === 0, 'got ' + t.stalls);
    check('corpus: strand mornings complete (bar a)', t.strandMorningIncomplete === 0 && t.strandMorningTotal > 0,
      'total ' + t.strandMorningTotal + ' incomplete ' + t.strandMorningIncomplete);
    check('corpus: paired strands exist (bar b)', t.pairedStrands > 0, 'got ' + t.pairedStrands);
    check('corpus: median delta is a number', typeof t.medianDelta === 'number', 'got ' + t.medianDelta);
    check('corpus: death pairs cover all paired seeds', census.deathPairs.length === t.seeds, 'got ' + census.deathPairs.length);
    check('corpus: fed mornings exist (bar c)', t.fedMornings > 0, 'got ' + t.fedMornings);
    check('corpus: conversion rate in [0,1]', t.conversionRate !== null && t.conversionRate >= 0 && t.conversionRate <= 1, 'got ' + t.conversionRate);
    check('corpus: bars a/b/c true', census.bars.a_tableComplete && census.bars.b_deltaQuantified && census.bars.c_conversionCounted, JSON.stringify(census.bars));
    // Every morning row's wood-seeking verdict recomputed from its matched lines.
    let recomputeBad = 0;
    for (const r of (census.morningRows || [])) {
      const expect = r.woodSeekingMatched && r.woodSeekingMatched.length ? 'seeking' : 'not-seeking';
      if (r.fullDaySayPresent && r.woodSeeking !== expect) recomputeBad++;
    }
    check('corpus: wood-seeking verdicts match matched lines', recomputeBad === 0, recomputeBad + ' mismatches');
    // Fed rows all carry press E + daytime delta (possibly null only if records missing).
    const fedBad = (census.morningRows || []).filter((r) => r.leg === 'variant' && r.pressFired && (r.pressE === null || r.pressE === undefined));
    check('corpus: every fed row carries press E', fedBad.length === 0, fedBad.length + ' missing');
    // Guard legs present.
    check('corpus: guard legs present', t.guardControl.seeds === 10 && t.guardVariant.seeds === 10,
      'gc ' + t.guardControl.seeds + ' gv ' + t.guardVariant.seeds);
  }
}
if (determinismFile && judgedVariantFile) {
  try {
    const a = fs.readFileSync(determinismFile, 'utf8');
    const b = fs.readFileSync(judgedVariantFile, 'utf8');
    check('corpus: determinism re-run byte-identical (bar d)', a === b, 'lengths ' + a.length + ' vs ' + b.length);
  } catch (e) { check('corpus: determinism files readable', false, e.message); }
}
// Tracked diff guard: src/ empty vs pinned base, policies/ identical.
try {
  const base = '359a384cc3ff7516235c52777ef66bccd4c01f11';
  const out = execSync('git diff --name-only ' + base + ' -- src/ scripts/policies/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
  check('guard: src/ + scripts/policies/ byte-identical to pinned base', out === '', out);
} catch (e) { check('guard: git diff runnable', false, e.message); }

console.log('test-fedexile-b: ' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('FAILURES:'); for (const f of failures) console.log(' - ' + f); process.exit(1); }
