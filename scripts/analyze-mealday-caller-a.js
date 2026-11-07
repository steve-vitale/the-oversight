#!/usr/bin/env node
// analyze-mealday-caller-a.js — DIAG analyzer for sim-mealday-caller-a
// (2026-11-07, run fleshout-20261107T1615Z, Loop A). Reads the
// mealday-caller-a corpus (trace1 per-seed files), pairs each dedupe fire
// (a call with isDup=true) with the previous call for the same (vid,day),
// classifies the fire H1/H2/H3 + benign/bug, and checks trace-off vs
// trace-on neutrality on the shared fields. Writes analysis.json into the
// corpus dir and prints a human-readable table. Exit 0 on a completed
// report; exit 2 on missing/unreadable corpus.
// Usage: node scripts/analyze-mealday-caller-a.js [corpusDir]
//   corpusDir defaults to evidence/2026-11-07/mealday-caller-a-corpus
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'mealday-caller-a-corpus');

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
    .filter(f => f.startsWith('mealday-caller-a-competent-s') && f.endsWith('-trace' + trace + '.json'))
    .sort();
  const bySeed = {};
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  return bySeed;
}

function main() {
  if (!fs.existsSync(CORPUS)) {
    console.error('FAIL LOUDLY: corpus dir missing: ' + CORPUS);
    process.exit(2);
  }
  const trace1 = loadPerSeed(CORPUS, '1');
  const trace0 = loadPerSeed(CORPUS, '0');
  const seeds1 = Object.keys(trace1).map(Number).sort((a, b) => a - b);
  if (!seeds1.length) {
    console.error('FAIL LOUDLY: no trace1 per-seed files in ' + CORPUS + ' — run the runner first.');
    process.exit(2);
  }
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
    // det-gate 2, precisely: a call site captured on 100% of reproduced fires
    capture100: fires.every(f => f.second.site && f.first && f.first.site),
    everyFireClassified: fires.every(f => f.h !== 'UNCLASSIFIED'),
    unclassified: fires.filter(f => f.h === 'UNCLASSIFIED').length,
  };
  const summary = {
    corpus: CORPUS, seeds: seeds1, totalCalls, missingSite,
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
  };
  fs.writeFileSync(path.join(CORPUS, 'analysis.json'), JSON.stringify(summary, null, 2));
  console.log('=== sim-mealday-caller-a analysis ===');
  console.log('seeds (trace1): ' + seeds1.join(','));
  console.log('total villagerMealDay calls recorded: ' + totalCalls + ' (missing site: ' + missingSite + ')');
  console.log('reproduced dedupe fires: ' + fires.length);
  console.log('by H-class: ' + JSON.stringify(byH));
  console.log('by effect: ' + JSON.stringify(byEffect));
  console.log('by second-call site: ' + JSON.stringify(bySite));
  console.log('call sites overall: ' + JSON.stringify(siteCounts));
  console.log('neutrality (trace-off vs trace-on, exact match): ' + JSON.stringify(neutrality));
  console.log('det-gate: ' + JSON.stringify(detGate));
  for (const f of fires.slice(0, 10)) {
    console.log('--- fire seed=' + f.seed + ' ' + f.vid + ' d' + f.day + ' ' + f.h + '/' + f.effect + ' [' + f.tags.join(',') + ']');
    console.log('    ' + f.reason);
    console.log('    first : ate=' + (f.first && f.first.ate) + ' drawn=' + (f.first && f.first.drawn) + ' hunger ' + (f.first && f.first.hungerBefore) + '->' + (f.first && f.first.hungerAfter) + ' health ' + (f.first && f.first.healthBefore) + '->' + (f.first && f.first.healthAfter) + ' away=' + (f.first && f.first.away) + ' site=' + (f.first && f.first.site));
    console.log('    second: ate=' + f.second.ate + ' drawn=' + f.second.drawn + ' hunger ' + f.second.hungerBefore + '->' + f.second.hungerAfter + ' health ' + f.second.healthBefore + '->' + f.second.healthAfter + ' away=' + f.second.away + ' site=' + f.second.site);
  }
  if (fires.length > 10) console.log('... ' + (fires.length - 10) + ' more fires in analysis.json');
  console.log('wrote ' + path.join(CORPUS, 'analysis.json'));
  return summary;
}

if (require.main === module) main();

module.exports = { pairFires, classifyFire, neutralityCheck, loadPerSeed };
