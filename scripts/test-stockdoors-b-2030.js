#!/usr/bin/env node
// test-stockdoors-b-2030.js — proof for sim-stockdoors-b, run
// fleshout-loop-b-20261027T2030Z (boundary-aware ledger re-judgment).
//
// Judged ONLY against evidence/2026-10-27/sim-stockdoors-b-prereg.md.
// Checks, each printed PASS/FAIL, exit non-zero on any failure:
//   1. Corpus validity: pilot 8 files + confirm 12 files, policy fields,
//      no truncation flags, finalPantry present, spoilDays length ==
//      daysAlive.
//   2. Det-gate (leg 1): seed 9820 run twice in stdout mode with
//      STOCKDOORS=1 vs 0; payloads byte-identical excluding `ms` and
//      stockdoors fields, INCLUDING finalPantry; on-run counts equal
//      the pilot corpus seed-9820 counts.
//   3. Independent BA legs: from-scratch per-family aggregation from
//      raw corpus records (no perSeed(), no analyzer leg numbers) with
//      the span-dedup exclusions applied from the shared dedup module;
//      asserts the analyzer's computeBaLegs legs match on counted /
//      passed / pooled residual / pooled inflow (legs 3-4), pooled
//      dried residual (leg 5), and coverage counts (leg 2).
//   4. Verdict follows from legs: pilot GO (all legs pass), confirm
//      CONFIRM-GO (all legs pass, reported alongside, never overriding
//      the pilot verdict).
//   5. Invariants: stockdoor spoilDay == vDay + 3 and name 'Foraged
//      food' on every kcal>0 record; every direct path in the known
//      wrapped set; event-take retMismatch count 0.
//   6. Hygiene: no src/js file modified; no modified/added tracked file
//      outside this run's own files (evidence/2026-10-27/
//      sim-stockdoors-b*, scripts/analyze-stockdoors-b-2030.js,
//      scripts/sweep-stockdoors-b.js, scripts/test-stockdoors-b-2030.js).
// Usage: node scripts/test-stockdoors-b-2030.js
// No jest is run (the proof is node, not jest).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const { computeBaLegs, famOf, isDried, NAMED, GENERIC, FOCAL } = require('./analyze-stockdoors-b-2030');
const { spanDedupSummary } = require('./dedupspan-apply-b');

const ROOT = path.join(__dirname, '..');
const PILOT = path.join(ROOT, 'evidence', '2026-10-27', 'sim-stockdoors-b-corpus');
const CONFIRM = path.join(ROOT, 'evidence', '2026-10-27', 'sim-stockdoors-b-confirm-corpus');
const KNOWN_PATHS = new Set(['player-take', 'player-take-bulk', 'npc-adult-pantry',
  'npc-child-pantry', 'alien-raid', 'thief.steal_pantry', 'event-take']);

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail != null ? ' — ' + detail : ''));
  if (!ok) failures++;
}
function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  return files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

// ---- 1. Corpus validity ----
const pilot = loadDir(PILOT);
const confirm = loadDir(CONFIRM);
check('pilot corpus files', pilot.length === 8, pilot.length + ' files');
check('confirm corpus files', confirm.length === 12, confirm.length + ' files');
for (const ps of pilot.concat(confirm)) {
  check('policy fields seed ' + ps.seed,
    ps.policy === 'competent-nofeast' && ps.plentydepri === 0 && ps.depositgate === 1 &&
    ps.competentFeast === 0 && ps.feastscaleR13 === 0,
    'policy=' + ps.policy + ' pd=' + ps.plentydepri + ' dg=' + ps.depositgate);
  check('no truncation seed ' + ps.seed, !ps.mealdrawTruncated && !ps.inflowTruncated,
    'mealdrawTruncated=' + ps.mealdrawTruncated + ' inflowTruncated=' + ps.inflowTruncated);
  check('finalPantry present seed ' + ps.seed,
    !!ps.finalPantry && Array.isArray(ps.finalPantry.channels),
    ps.finalPantry ? ('day ' + ps.finalPantry.day + ' fresh ' + ps.finalPantry.freshKcal) : 'missing');
  check('spoilDays length == daysAlive seed ' + ps.seed,
    (ps.spoilDays || []).length === ps.daysAlive,
    'spoilDays=' + (ps.spoilDays || []).length + ' daysAlive=' + ps.daysAlive);
}

// ---- 2. Det-gate (leg 1) ----
function detRun(stockdoors) {
  const env = Object.assign({}, process.env, { COMPETENT_FEAST: '0', SEATDRIVE: '0',
    PLENTYDEPRI: '0', DEPOSITGATE: '1', SEEDS: '9820', DAYS: '100',
    SWEEP_STDOUT_JSON: '1', STOCKDOORS: stockdoors ? '1' : '0' });
  const out = execFileSync('node', [path.join(__dirname, 'sweep-stockdoors-b.js')], { env, cwd: ROOT, timeout: 600000 });
  return JSON.parse(out.toString('utf8').trim().split('\n')[0]);
}
const detOn = detRun(true);
const detOff = detRun(false);
const stripDet = (o) => {
  const c = Object.assign({}, o);
  delete c.ms; delete c.stockdoorsOn; delete c.stockdoorRecords; delete c.stockdoorCounters;
  delete c.stockdoorTruncated; delete c.directRecords; delete c.directCounters;
  return c;
};
check('det-gate byte-identical incl finalPantry',
  JSON.stringify(stripDet(detOn)) === JSON.stringify(stripDet(detOff)),
  'finalPantry on=' + (detOn.finalPantry && detOn.finalPantry.freshKcal) +
  ' off=' + (detOff.finalPantry && detOff.finalPantry.freshKcal));
const p9820 = pilot.find(ps => ps.seed === 9820);
check('det-gate reproduces corpus 9820 counts',
  detOn.inflowSeen === p9820.inflowSeen &&
  detOn.mealDrawRecords.length === p9820.mealDrawRecords.length &&
  detOn.deaths === p9820.deaths &&
  detOn.driedEvents.length === p9820.driedEvents.length &&
  detOn.stockdoorRecords.length === p9820.stockdoorRecords.length &&
  detOn.directRecords.length === p9820.directRecords.length,
  'det ' + [detOn.inflowSeen, detOn.mealDrawRecords.length, detOn.deaths, detOn.driedEvents.length, detOn.stockdoorRecords.length, detOn.directRecords.length].join('/') +
  ' corpus ' + [p9820.inflowSeen, p9820.mealDrawRecords.length, p9820.deaths, p9820.driedEvents.length, p9820.stockdoorRecords.length, p9820.directRecords.length].join('/'));

// ---- 3. Independent BA legs (from raw records, no perSeed) ----
function independentBa(corpus) {
  const seeds = [];
  for (const ps of corpus) {
    const fams = new Map();
    const get = (f) => {
      if (!fams.has(f)) fams.set(f, { family: f, opening: 0, openingDried: 0, inflow: 0,
        draws: 0, driedDraws: 0, sweep: 0, driedSweep: 0, closing: 0, closingDried: 0,
        transformPost: 0, transformLoss: 0 });
      return fams.get(f);
    };
    for (const r of (ps.inflows || [])) {
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      if (r.name == null) continue;
      const rec = get(famOf(String(r.name)));
      rec.inflow += r.kcal || 0;
      if (isDried(r.name)) rec.driedDraws += 0; // inflow, not a draw; dried inflow tracked via transform ledger below
    }
    // Dried inflow is NOT part of the dried-channel residual's inflow term
    // beyond transformedPost handling: the dried residual uses
    // transformedPost + driedInflow - driedDraws - driedSweep, where
    // driedInflow is the 3-door dried inflow. Track it separately.
    const driedInflow = new Map();
    for (const r of (ps.inflows || [])) {
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      if (r.name == null || !isDried(r.name)) continue;
      const f = famOf(String(r.name));
      driedInflow.set(f, (driedInflow.get(f) || 0) + (r.kcal || 0));
    }
    for (const r of (ps.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const kcal = (it.units || 0) * (it.kcalEach || 0);
        const rec = get(famOf(String(it.name)));
        rec.draws += kcal;
        if (isDried(it.name)) rec.driedDraws += kcal;
      }
    }
    for (const r of (ps.directRecords || [])) {
      for (const it of (r.items || [])) {
        if (it.name == null) continue;
        const kcal = (it.units || 0) * (it.kcalEach || 0);
        const rec = get(famOf(String(it.name)));
        rec.draws += kcal;
        if (isDried(it.name)) rec.driedDraws += kcal;
      }
    }
    // Span-dedup exclusions (shared dedup module only, not the analyzer).
    const dedup = spanDedupSummary(ps, famOf, isDried);
    for (const [f, kcal] of Object.entries(dedup.byFamily || {})) {
      const rec = get(f);
      rec.draws -= kcal;
    }
    for (const [f, kcal] of Object.entries(dedup.byFamilyDried || {})) {
      const rec = get(f);
      rec.driedDraws -= kcal;
    }
    for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
      const pan = (sw.removed || {}).pantry || {};
      for (const bc of (pan.byChannel || [])) {
        const rec = get(famOf(bc.channel));
        rec.sweep += bc.kcal || 0;
        if (isDried(bc.channel)) rec.driedSweep += bc.kcal || 0;
      }
    }
    for (const ch of ((ps.openingStock || {}).channels || [])) {
      const rec = get(famOf(ch.channel));
      rec.opening += ch.freshKcal || 0;
      if (isDried(ch.channel)) rec.openingDried += ch.freshKcal || 0;
    }
    for (const ch of ((ps.finalPantry || {}).channels || [])) {
      const rec = get(famOf(ch.channel));
      rec.closing += ch.freshKcal || 0;
      if (isDried(ch.channel)) rec.closingDried += ch.freshKcal || 0;
    }
    for (const e of (ps.driedEvents || [])) {
      const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
      const rec = get(famOf(nm));
      rec.transformPost += e.postKcal || 0;
      if (e.linked && e.preKcal != null) rec.transformLoss += (e.lossKcal || 0);
    }
    for (const r of (ps.stockdoorRecords || [])) {
      if (!(r.kcal > 0)) continue;
      get('Foraged food').inflow += r.kcal;
    }
    for (const rec of fams.values()) {
      rec.residualBa = (rec.closing - rec.opening) - (rec.inflow - rec.draws - rec.sweep - rec.transformLoss);
      rec.driedResidualBa = (rec.closingDried - rec.openingDried) -
        (rec.transformPost + (driedInflow.get(rec.family) || 0) - rec.driedDraws - rec.driedSweep);
    }
    seeds.push({ seed: ps.seed, fams });
  }
  function rate(set) {
    let counted = 0, passed = 0, pooledResid = 0, pooledInflow = 0;
    for (const s of seeds) for (const r of s.fams.values()) {
      if (set.indexOf(r.family) < 0 || r.inflow < 10000) continue;
      counted++;
      if (Math.abs(r.residualBa) / r.inflow <= 0.01) passed++;
      pooledResid += r.residualBa; pooledInflow += r.inflow;
    }
    return { counted, passed, pooledResid, pooledInflow };
  }
  let pooledDriedBa = 0, totPost = 0;
  for (const s of seeds) for (const r of s.fams.values()) {
    totPost += r.transformPost;
    if (FOCAL.indexOf(r.family) >= 0 && r.inflow >= 10000) pooledDriedBa += r.driedResidualBa;
  }
  let stockdoorSeeds = 0, eventSeeds = 0, totLinked = 0, driedNoEvent = [];
  for (const ps of corpus) {
    if ((ps.stockdoorRecords || []).some(r => r.kcal > 0)) stockdoorSeeds++;
    if ((ps.driedEvents || []).length > 0) eventSeeds++;
    let linked = 0, post = 0, anyDried = false;
    for (const sd of (ps.spoilDays || [])) for (const ch of (sd.channels || [])) if (isDried(ch.channel) && ch.freshKcal > 0) anyDried = true;
    for (const e of (ps.driedEvents || [])) { post += e.postKcal || 0; if (e.linked) linked += e.postKcal || 0; }
    totLinked += linked;
    if (anyDried && (ps.driedEvents || []).length === 0) driedNoEvent.push(ps.seed);
  }
  return { leg3: rate(NAMED), leg4: rate(GENERIC),
    leg5: { pooledDriedBa, totPost },
    leg2: { stockdoorSeeds, eventSeeds, driedNoEvent, totPost, totLinked,
      linkedShare: totPost > 0 ? totLinked / totPost : null } };
}

function compareLegs(name, ind, ana) {
  check(name + ' leg3 counted/passed/pooled',
    ind.leg3.counted === ana.leg3.counted && ind.leg3.passed === ana.leg3.passed &&
    ind.leg3.pooledResid === ana.leg3.pooledResid && ind.leg3.pooledInflow === ana.leg3.pooledInflow,
    'ind ' + [ind.leg3.counted, ind.leg3.passed, ind.leg3.pooledResid, ind.leg3.pooledInflow].join('/') +
    ' ana ' + [ana.leg3.counted, ana.leg3.passed, ana.leg3.pooledResid, ana.leg3.pooledInflow].join('/'));
  check(name + ' leg4 counted/passed/pooled',
    ind.leg4.counted === ana.leg4.counted && ind.leg4.passed === ana.leg4.passed &&
    ind.leg4.pooledResid === ana.leg4.pooledResid && ind.leg4.pooledInflow === ana.leg4.pooledInflow,
    'ind ' + [ind.leg4.counted, ind.leg4.passed, ind.leg4.pooledResid, ind.leg4.pooledInflow].join('/') +
    ' ana ' + [ana.leg4.counted, ana.leg4.passed, ana.leg4.pooledResid, ana.leg4.pooledInflow].join('/'));
  check(name + ' leg5 pooled dried / totPost',
    ind.leg5.pooledDriedBa === ana.leg5.pooledDriedBa && ind.leg5.totPost === ana.leg5.totPost,
    'ind ' + ind.leg5.pooledDriedBa + '/' + ind.leg5.totPost +
    ' ana ' + ana.leg5.pooledDriedBa + '/' + ana.leg5.totPost);
  check(name + ' leg2 coverage',
    ind.leg2.stockdoorSeeds === ana.leg2.seedsWithStockdoor &&
    ind.leg2.eventSeeds === ana.leg2.seedsWithEvents &&
    JSON.stringify(ind.leg2.driedNoEvent) === JSON.stringify(ana.leg2.driedStockNoEvent) &&
    ind.leg2.totPost === ana.leg2.totPost && ind.leg2.totLinked === ana.leg2.totLinked,
    'ind ' + [ind.leg2.stockdoorSeeds, ind.leg2.eventSeeds, ind.leg2.totPost, ind.leg2.totLinked].join('/') +
    ' ana ' + [ana.leg2.seedsWithStockdoor, ana.leg2.seedsWithEvents, ana.leg2.totPost, ana.leg2.totLinked].join('/'));
}

const anaPilot = computeBaLegs(PILOT);
const indPilot = independentBa(pilot);
compareLegs('pilot', indPilot, anaPilot);
const anaConfirm = computeBaLegs(CONFIRM);
const indConfirm = independentBa(confirm);
compareLegs('confirm', indConfirm, anaConfirm);

// ---- 4. Verdict follows from legs ----
check('pilot verdict GO',
  anaPilot.leg2.pass && anaPilot.leg3.pass && anaPilot.leg4.pass && anaPilot.leg5.pass && anaPilot.verdictBa === 'GO',
  'legs ' + [anaPilot.leg2.pass, anaPilot.leg3.pass, anaPilot.leg4.pass, anaPilot.leg5.pass].join('/') + ' verdict ' + anaPilot.verdictBa);
check('confirm verdict CONFIRM-GO',
  anaConfirm.leg2.pass && anaConfirm.leg3.pass && anaConfirm.leg4.pass && anaConfirm.leg5.pass && anaConfirm.verdictBa === 'GO',
  'legs ' + [anaConfirm.leg2.pass, anaConfirm.leg3.pass, anaConfirm.leg4.pass, anaConfirm.leg5.pass].join('/') + ' verdict ' + anaConfirm.verdictBa);

// ---- 5. Invariants ----
let badStockdoor = 0, badPath = 0, mismatches = 0, sdTotal = 0;
for (const ps of pilot.concat(confirm)) {
  for (const r of (ps.stockdoorRecords || [])) {
    if (!(r.kcal > 0)) continue;
    sdTotal++;
    if (r.spoilDay !== r.vDay + 3 || r.name !== 'Foraged food') badStockdoor++;
  }
  for (const r of (ps.directRecords || [])) {
    if (!KNOWN_PATHS.has(r.path)) badPath++;
    if (r.retMismatch) mismatches++;
  }
}
check('stockdoor invariant spoilDay == vDay + 3, name Foraged food', badStockdoor === 0, sdTotal + ' kcal>0 records, ' + badStockdoor + ' bad');
check('direct paths all in known wrapped set', badPath === 0, badPath + ' unknown-path records');
check('event-take retMismatch 0', mismatches === 0, mismatches + ' mismatches');

// ---- 6. Hygiene ----
const status = execSync('git status --porcelain', { cwd: ROOT }).toString('utf8').trim().split('\n').filter(Boolean);
const allowed = (p) => p.startsWith('evidence/2026-10-27/sim-stockdoors-b') ||
  p === 'scripts/analyze-stockdoors-b-2030.js' ||
  p === 'scripts/sweep-stockdoors-b.js' ||
  p === 'scripts/test-stockdoors-b-2030.js';
let badHygiene = [];
for (const line of status) {
  const p = line.slice(3).trim();
  if (p.startsWith('src/js/') || !allowed(p)) badHygiene.push(line);
}
check('hygiene: no src/js modified, no out-of-run files', badHygiene.length === 0, badHygiene.length ? badHygiene.join('; ') : status.length + ' status lines, all in-run');
console.log('HEAD ' + execSync('git rev-parse HEAD', { cwd: ROOT }).toString('utf8').trim());

if (failures) { console.log('PROOF FAILED: ' + failures + ' check(s)'); process.exit(1); }
console.log('PROOF GREEN: all checks passed');
