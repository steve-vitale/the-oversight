#!/usr/bin/env node
// analyze-doublenight-fix-a.js — FIX-ARM analyzer for sim-doublenight-fix-a
// (2026-11-07/08, run fleshout-20261108T0015Z, Loop A). Derived from
// scripts/analyze-mealday-caller-a.js (that script is NOT modified).
// pairFires / classifyFire / neutralityCheck are VERBATIM; loadPerSeed
// changes only the per-seed filename prefix. ADDED: the before/after
// trajectory diff (prereg GO clause 2 as amended by A1) + the
// survival/starvation table + the goBar object.
//
// Usage:
//   node scripts/analyze-doublenight-fix-a.js <corpusDir>
//     Single-corpus mode (before run, or after run alone): fires,
//     classification, neutrality (trace0 vs trace1) — same shape as the
//     diag analyzer. Writes analysis.json into the corpus dir.
//   node scripts/analyze-doublenight-fix-a.js <beforeCorpus> <afterCorpus>
//     Diff mode: everything above for BOTH corpora, plus the per-seed
//     trajectory diff, the survival/starvation table, and the goBar
//     verdict inputs (the verdict itself is rendered in the evidence
//     file, never by this script's exit code). Writes analysis.json into
//     the AFTER corpus dir.
// Exit 0 on a completed report; exit 2 on missing/unreadable corpus.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'doublenight-fix-a-corpus-before');
const AFTER_CORPUS = process.argv[3] || null;

// pairFires(mealCalls): each call with isDup=true pairs with the most
// recent prior call for the same (vid,day). A triple call yields two fires.
function pairFires(mealCalls) {
  const fires = [];
  const lastByKey = new Map();
  for (const c of (mealCalls || [])) {
    const key = c.vid + '|' + c.day;
    if (c.isDup) {
      const first = lastByKey.get(key) || null;
      fires.push({ vid: c.vid, day: c.day, first, second: c });
    }
    lastByKey.set(key, c);
  }
  return fires;
}

// classifyFire(fire): H-class from invocation identity + call site, effect
// from first-vs-second end state. Prereg rule (binding):
//   H1: different villageEats invocation ids (villageEats ran twice for
//       the same scholar.day).
//   H2: same invocation id (same vid twice in one villageEats pass).
//   H3: either call's site is NOT the villageEats call site
//       (game.js:32246 via villageEats) — a different direct caller.
//   UNCLASSIFIED: no first call found, or either call's site is empty.
//   BENIGN iff ate, drawn, hungerAfter and healthAfter are all equal
//       across the two calls (pure re-record, no state effect).
//   BUG otherwise, sub-tagged: double-draw (drawn2 > 0), extra-hunger
//       (hungerAfter differs), meal-overwritten (ate differs),
//       health-changed (healthAfter differs).
function classifyFire(fire) {
  const { first, second } = fire;
  if (!first || !second) return { h: 'UNCLASSIFIED', reason: 'no first call for this (vid,day)', effect: 'UNCLASSIFIED', tags: [] };
  if (!first.site || !second.site) return { h: 'UNCLASSIFIED', reason: 'missing call site on ' + (!first.site ? 'first' : 'second') + ' call', effect: 'UNCLASSIFIED', tags: [] };
  const isEatsSite = (s) => /villageEats/.test(s) || /game\.js:32246/.test(s);
  let h, reason;
  if (!isEatsSite(first.site) || !isEatsSite(second.site)) {
    h = 'H3';
    reason = 'non-villageEats call site: first=' + first.site.slice(0, 120) + ' second=' + second.site.slice(0, 120);
  } else if (first.eatsInv !== second.eatsInv) {
    h = 'H1';
    reason = 'different villageEats invocations (' + first.eatsInv + ' vs ' + second.eatsInv + '), same scholar.day ' + second.day;
  } else {
    h = 'H2';
    reason = 'same villageEats invocation ' + first.eatsInv + ' (seq ' + first.seq + ' then ' + second.seq + '), same scholar.day ' + second.day;
  }
  const tags = [];
  if ((second.drawn || 0) > 0) tags.push('double-draw');
  if ((first.hungerAfter ?? null) !== (second.hungerAfter ?? null)) tags.push('extra-hunger');
  if ((first.ate ?? null) !== (second.ate ?? null)) tags.push((second.ate || 0) < (first.ate || 0) ? 'meal-overwritten-lost' : 'meal-overwritten-inflated');
  if ((first.healthAfter ?? null) !== (second.healthAfter ?? null)) tags.push('health-changed');
  const benign = (first.ate ?? null) === (second.ate ?? null)
    && (first.drawn ?? null) === (second.drawn ?? null)
    && (first.hungerAfter ?? null) === (second.hungerAfter ?? null)
    && (first.healthAfter ?? null) === (second.healthAfter ?? null);
  return { h, reason, effect: benign ? 'BENIGN' : 'BUG', tags };
}

// neutralityCheck(trace0, trace1): exact-match on the shared trajectory
// fields. trace0 files are the recorder-off runs of the same seeds on the
// same base. Any mismatch = recorder NOT neutral.
function neutralityCheck(trace0, trace1) {
  const out = [];
  for (const s of Object.keys(trace1).sort()) {
    const a = trace0[s], b = trace1[s];
    if (!a) { out.push({ seed: Number(s), match: false, diff: 'no trace-off file for this seed' }); continue; }
    const diffs = [];
    if (a.daysAlive !== b.daysAlive) diffs.push('daysAlive ' + a.daysAlive + ' vs ' + b.daysAlive);
    if (JSON.stringify(a.deathRows) !== JSON.stringify(b.deathRows)) diffs.push('deathRows differ');
    if (JSON.stringify(a.mealRows) !== JSON.stringify(b.mealRows)) diffs.push('mealRows differ');
    out.push({ seed: Number(s), match: diffs.length === 0, diff: diffs.join('; ') || 'exact' });
  }
  return out;
}

function loadPerSeed(corpus, trace) {
  const files = fs.readdirSync(corpus)
    .filter(f => f.startsWith('doublenight-fix-a-competent-s') && f.endsWith('-trace' + trace + '.json'))
    .sort();
  const bySeed = {};
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  return bySeed;
}

// loadSummary(corpus, trace): the sweep's merged summary rows (carry the
// per-seed diag block: starveDays, endReason, mealDupCount, ...). Returns
// { seed: diag } or {} when the summary is absent.
function loadSummary(corpus, trace) {
  const f = path.join(corpus, 'sweep-competent-trace' + trace + '.json');
  if (!fs.existsSync(f)) return {};
  try {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    const out = {};
    for (const r of (j.rows || [])) out[r.seed] = r.diag || {};
    return out;
  } catch (e) { return {}; }
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

// analyzeCorpus(corpus): fires + classification + neutrality for ONE
// corpus (the diag analyzer's report, verbatim shape).
function analyzeCorpus(corpus) {
  const trace1 = loadPerSeed(corpus, '1');
  const trace0 = loadPerSeed(corpus, '0');
  const seeds1 = Object.keys(trace1).map(Number).sort((a, b) => a - b);
  let totalCalls = 0, missingSite = 0;
  const siteCounts = {};
  const fires = [];
  for (const s of seeds1) {
    const j = trace1[s];
    const calls = j.mealCalls || [];
    totalCalls += calls.length;
    for (const c of calls) {
      if (!c.site) missingSite++;
      else siteCounts[c.site] = (siteCounts[c.site] || 0) + 1;
    }
    for (const f of pairFires(calls)) {
      const cls = classifyFire(f);
      fires.push({ seed: s, ...f, ...cls });
    }
  }
  const byH = {}, byEffect = {}, bySite = {};
  for (const f of fires) {
    byH[f.h] = (byH[f.h] || 0) + 1;
    byEffect[f.effect] = (byEffect[f.effect] || 0) + 1;
    bySite[f.second.site || '(missing)'] = (bySite[f.second.site || '(missing)'] || 0) + 1;
  }
  const neutrality = neutralityCheck(trace0, trace1);
  const neutral = neutrality.length > 0 && neutrality.every(n => n.match);
  const detGate = {
    neutralityExact: neutral,
    capture100: fires.every(f => f.second.site && f.first && f.first.site),
    everyFireClassified: fires.every(f => f.h !== 'UNCLASSIFIED'),
    unclassified: fires.filter(f => f.h === 'UNCLASSIFIED').length,
  };
  return {
    corpus, seeds: seeds1, totalCalls, missingSite,
    reproducedFires: fires.length,
    byH, byEffect, bySite,
    siteCounts,
    neutrality,
    detGate,
    fires: fires.map(f => ({
      seed: f.seed, vid: f.vid, day: f.day, h: f.h, effect: f.effect, tags: f.tags, reason: f.reason,
      first: { site: f.first ? f.first.site : null, eatsInv: f.first ? f.first.eatsInv : null, seq: f.first ? f.first.seq : null, away: f.first ? f.first.away : null, ate: f.first ? f.first.ate : null, drawn: f.first ? f.first.drawn : null, fasting: f.first ? f.first.fasting : null, hungerBefore: f.first ? f.first.hungerBefore : null, hungerAfter: f.first ? f.first.hungerAfter : null, healthBefore: f.first ? f.first.healthBefore : null, healthAfter: f.first ? f.first.healthAfter : null },
      second: { site: f.second.site, eatsInv: f.second.eatsInv, seq: f.second.seq, away: f.second.away, ate: f.second.ate, drawn: f.second.drawn, fasting: f.second.fasting, hungerBefore: f.second.hungerBefore, hungerAfter: f.second.hungerAfter, healthBefore: f.second.healthBefore, healthAfter: f.second.healthAfter },
    })),
    trace1, trace0,
  };
}

// trajectoryDiff(before, after): prereg GO clause 2 as amended by A1.
// The fix is provably inert until a seed's first double-night, so:
//  - zero-fire seeds: daysAlive/deathRows/mealRows must match EXACTLY.
//  - firing seeds: mealRows/deathRows must match exactly on all days
//    BEFORE the seed's first firing day; on firing days the AFTER run must
//    show the single-pass shape (one row per (vid,day), no dedupe fire).
//  - AFTER the first firing day, divergence is EXPECTED (the removed
//    second pass consumed RNG in the before run, so the random stream
//    shifts) — it is counted and reported, never required identical.
// Returns { perSeed, clause2Pass, notes }.
function trajectoryDiff(before, after) {
  const perSeed = {};
  let clause2Pass = true;
  const notes = [];
  const bSeeds = Object.keys(before.trace1).map(Number).sort((a, b) => a - b);
  const aSeeds = Object.keys(after.trace1).map(Number).sort((a, b) => a - b);
  if (JSON.stringify(bSeeds) !== JSON.stringify(aSeeds)) {
    clause2Pass = false;
    notes.push('seed lists differ before vs after: before=' + bSeeds.join(',') + ' after=' + aSeeds.join(','));
  }
  for (const s of bSeeds) {
    const b = before.trace1[s], a = after.trace1[s];
    if (!a) { perSeed[s] = { pass: false, reason: 'no after file' }; clause2Pass = false; continue; }
    const bFires = (before.fires || []).filter(f => f.seed === s);
    const firingDays = [...new Set(bFires.map(f => f.day))].sort((x, y) => x - y);
    const firstFire = firingDays.length ? firingDays[0] : null;
    const row = { seed: s, firingDays, firstFireDay: firstFire,
      daysAliveBefore: b.daysAlive, daysAliveAfter: a.daysAlive,
      daysAliveDelta: a.daysAlive - b.daysAlive };
    const keyOf = (m) => m.vid + '|' + m.day;
    const bMeals = new Map((b.mealRows || []).map(m => [keyOf(m), m]));
    const aMeals = new Map((a.mealRows || []).map(m => [keyOf(m), m]));
    const bDeaths = b.deathRows || [], aDeaths = a.deathRows || [];
    if (firstFire === null) {
      // Zero-fire seed: end-to-end exact.
      const mealDiff = diffMealMaps(bMeals, aMeals);
      const deathDiff = JSON.stringify(bDeaths) !== JSON.stringify(aDeaths);
      row.zeroFireExact = mealDiff.length === 0 && !deathDiff && b.daysAlive === a.daysAlive;
      row.preFirstFireMealDiffs = mealDiff;
      row.deathRowsDiffer = deathDiff;
      row.pass = row.zeroFireExact;
      if (!row.pass) { clause2Pass = false; notes.push('seed ' + s + ' zero-fire but trajectories differ'); }
    } else {
      // Firing seed: exact before the first firing day.
      const preB = new Map([...bMeals].filter(([k, m]) => m.day < firstFire));
      const preA = new Map([...aMeals].filter(([k, m]) => m.day < firstFire));
      const preDiffs = diffMealMaps(preB, preA);
      const preDeathB = bDeaths.filter(d => d.day < firstFire);
      const preDeathA = aDeaths.filter(d => d.day < firstFire);
      const preDeathDiff = JSON.stringify(preDeathB) !== JSON.stringify(preDeathA);
      row.preFirstFireMealDiffs = preDiffs;
      row.preFirstFireDeathDiff = preDeathDiff;
      // Firing-day single-pass shape in AFTER: one row per (vid,day) and
      // no dedupe fire on those days.
      const aFires = (after.fires || []).filter(f => f.seed === s);
      const aFireDays = [...new Set(aFires.map(f => f.day))];
      const fireDayRows = (a.mealRows || []).filter(m => firingDays.includes(m.day));
      const dupKeys = new Set();
      const seen = new Set();
      for (const m of (a.mealRows || [])) { const k = keyOf(m); if (seen.has(k)) dupKeys.add(k); seen.add(k); }
      row.firingDaySinglePass = aFireDays.length === 0 && dupKeys.size === 0;
      row.firingDayMealRows = fireDayRows.length;
      row.afterFiresOnSeed = aFires.length;
      // Post-first-fire divergence: counted, reported, not judged.
      const postB = new Map([...bMeals].filter(([k, m]) => m.day >= firstFire));
      const postA = new Map([...aMeals].filter(([k, m]) => m.day >= firstFire));
      const postDiffs = diffMealMaps(postB, postA);
      row.postFirstFireMealDiffs = postDiffs.length;
      row.postFirstFireMealDiffSample = postDiffs.slice(0, 5);
      const postDeathB = bDeaths.filter(d => d.day >= firstFire);
      const postDeathA = aDeaths.filter(d => d.day >= firstFire);
      row.postFirstFireDeathsBefore = postDeathB.length;
      row.postFirstFireDeathsAfter = postDeathA.length;
      row.pass = preDiffs.length === 0 && !preDeathDiff && row.firingDaySinglePass;
      if (!row.pass) { clause2Pass = false; notes.push('seed ' + s + ' pre-first-fire or firing-day shape fails'); }
    }
    perSeed[s] = row;
  }
  return { perSeed, clause2Pass, notes };
}

function diffMealMaps(bMap, aMap) {
  const diffs = [];
  const keys = new Set([...bMap.keys(), ...aMap.keys()]);
  for (const k of keys) {
    const b = bMap.get(k), a = aMap.get(k);
    if (!b) { diffs.push({ key: k, kind: 'only-after' }); continue; }
    if (!a) { diffs.push({ key: k, kind: 'only-before' }); continue; }
    const fields = ['away', 'ate', 'drawn', 'fasting', 'hungerBefore', 'hungerAfter', 'healthBefore', 'healthAfter', 'needEst'];
    const changed = fields.filter(f => (b[f] ?? null) !== (a[f] ?? null));
    if (changed.length) diffs.push({ key: k, day: b.day, kind: 'changed', fields: changed,
      before: { ate: b.ate, drawn: b.drawn }, after: { ate: a.ate, drawn: a.drawn } });
  }
  return diffs;
}

function main() {
  if (!fs.existsSync(CORPUS)) {
    console.error('FAIL LOUDLY: corpus dir missing: ' + CORPUS);
    process.exit(2);
  }
  const before = analyzeCorpus(CORPUS);
  if (!Object.keys(before.trace1).length) {
    console.error('FAIL LOUDLY: no trace1 per-seed files in ' + CORPUS + ' — run the runner first.');
    process.exit(2);
  }
  const summary = {
    corpus: CORPUS, seeds: before.seeds, totalCalls: before.totalCalls, missingSite: before.missingSite,
    reproducedFires: before.reproducedFires,
    byH: before.byH, byEffect: before.byEffect, bySite: before.bySite,
    siteCounts: before.siteCounts,
    neutrality: before.neutrality,
    detGate: before.detGate,
    fires: before.fires,
  };
  let outDir = CORPUS;
  if (AFTER_CORPUS) {
    if (!fs.existsSync(AFTER_CORPUS)) {
      console.error('FAIL LOUDLY: after corpus dir missing: ' + AFTER_CORPUS);
      process.exit(2);
    }
    const after = analyzeCorpus(AFTER_CORPUS);
    if (!Object.keys(after.trace1).length) {
      console.error('FAIL LOUDLY: no trace1 per-seed files in ' + AFTER_CORPUS + ' — run the runner first.');
      process.exit(2);
    }
    const diff = trajectoryDiff(before, after);
    const bSum = loadSummary(CORPUS, '1'), aSum = loadSummary(AFTER_CORPUS, '1');
    const judged = before.seeds;
    const bDays = judged.map(s => before.trace1[s].daysAlive);
    const aDays = judged.map(s => after.trace1[s].daysAlive);
    const bStarve = judged.reduce((n, s) => n + ((bSum[s] || {}).starveDays || 0), 0);
    const aStarve = judged.reduce((n, s) => n + ((aSum[s] || {}).starveDays || 0), 0);
    const survival = { medianBefore: median(bDays), medianAfter: median(aDays),
      medianRatio: median(bDays) ? +(median(aDays) / median(bDays)).toFixed(3) : null,
      daysAliveBefore: bDays, daysAliveAfter: aDays };
    const starvation = { totalBefore: bStarve, totalAfter: aStarve, delta: aStarve - bStarve };
    const goBar = {
      firesAfter: after.reproducedFires,
      firesAfterZero: after.reproducedFires === 0,
      trajectoryClause2: diff.clause2Pass,
      medianSurvivalRatio: survival.medianRatio,
      medianSurvivalOk: survival.medianRatio !== null && survival.medianRatio >= 0.8,
      starvationDelta: starvation.delta,
      starvationOk: starvation.delta <= 2,
      neutralityBeforeExact: before.detGate.neutralityExact,
      neutralityAfterExact: after.detGate.neutralityExact,
      go: after.reproducedFires === 0 && diff.clause2Pass
        && survival.medianRatio !== null && survival.medianRatio >= 0.8
        && starvation.delta <= 2 && before.detGate.neutralityExact,
    };
    summary.after = { corpus: AFTER_CORPUS, seeds: after.seeds, totalCalls: after.totalCalls,
      reproducedFires: after.reproducedFires, byH: after.byH, byEffect: after.byEffect,
      neutrality: after.neutrality, detGate: after.detGate, fires: after.fires };
    summary.trajectoryDiff = diff;
    summary.survival = survival;
    summary.starvation = starvation;
    summary.goBar = goBar;
    outDir = AFTER_CORPUS;
    console.log('=== sim-doublenight-fix-a BEFORE/AFTER analysis ===');
    console.log('before fires: ' + before.reproducedFires + ' (seeds ' + before.seeds.join(',') + ')');
    console.log('after fires: ' + after.reproducedFires + ' (seeds ' + after.seeds.join(',') + ')');
    console.log('trajectory clause2 pass: ' + diff.clause2Pass + (diff.notes.length ? ' — ' + diff.notes.join('; ') : ''));
    for (const s of before.seeds) {
      const r = diff.perSeed[s];
      console.log('  seed ' + s + ': firingDays=[' + (r.firingDays || []).join(',') + '] daysAlive ' + r.daysAliveBefore + '->' + r.daysAliveAfter + ' pass=' + r.pass +
        (r.firstFireDay === null ? ' (zero-fire exact=' + r.zeroFireExact + ')' : ' preDiffs=' + (r.preFirstFireMealDiffs || []).length + ' postDiffs=' + r.postFirstFireMealDiffs + ' postDeaths ' + r.postFirstFireDeathsBefore + '->' + r.postFirstFireDeathsAfter));
    }
    console.log('survival: median ' + survival.medianBefore + ' -> ' + survival.medianAfter + ' (ratio ' + survival.medianRatio + ', bar >= 0.8: ' + goBar.medianSurvivalOk + ')');
    console.log('starvation: total starveDays ' + starvation.totalBefore + ' -> ' + starvation.totalAfter + ' (delta ' + starvation.delta + ', bar <= +2: ' + goBar.starvationOk + ')');
    console.log('neutrality before exact: ' + before.detGate.neutralityExact + '; after exact: ' + after.detGate.neutralityExact);
    console.log('GO-BAR: ' + JSON.stringify(goBar));
  } else {
    console.log('=== sim-doublenight-fix-a analysis ===');
    console.log('seeds (trace1): ' + before.seeds.join(','));
    console.log('total villagerMealDay calls recorded: ' + before.totalCalls + ' (missing site: ' + before.missingSite + ')');
    console.log('reproduced dedupe fires: ' + before.reproducedFires);
    console.log('by H-class: ' + JSON.stringify(before.byH));
    console.log('by effect: ' + JSON.stringify(before.byEffect));
    console.log('by second-call site: ' + JSON.stringify(before.bySite));
    console.log('call sites overall: ' + JSON.stringify(before.siteCounts));
    console.log('neutrality (trace-off vs trace-on, exact match): ' + JSON.stringify(before.neutrality));
    console.log('det-gate: ' + JSON.stringify(before.detGate));
    for (const f of before.fires.slice(0, 10)) {
      console.log('--- fire seed=' + f.seed + ' ' + f.vid + ' d' + f.day + ' ' + f.h + '/' + f.effect + ' [' + f.tags.join(',') + ']');
      console.log('    ' + f.reason);
      console.log('    first : ate=' + (f.first && f.first.ate) + ' drawn=' + (f.first && f.first.drawn) + ' hunger ' + (f.first && f.first.hungerBefore) + '->' + (f.first && f.first.hungerAfter) + ' health ' + (f.first && f.first.healthBefore) + '->' + (f.first && f.first.healthAfter) + ' away=' + (f.first && f.first.away) + ' site=' + (f.first && f.first.site));
      console.log('    second: ate=' + f.second.ate + ' drawn=' + f.second.drawn + ' hunger ' + f.second.hungerBefore + '->' + f.second.hungerAfter + ' health ' + f.second.healthBefore + '->' + f.second.healthAfter + ' away=' + f.second.away + ' site=' + f.second.site);
    }
    if (before.fires.length > 10) console.log('... ' + (before.fires.length - 10) + ' more fires in analysis.json');
  }
  fs.writeFileSync(path.join(outDir, 'analysis.json'), JSON.stringify(summary, null, 2));
  console.log('wrote ' + path.join(outDir, 'analysis.json'));
  return summary;
}

if (require.main === module) main();

module.exports = { pairFires, classifyFire, neutralityCheck, loadPerSeed, loadSummary, trajectoryDiff, diffMealMaps, median, analyzeCorpus };
