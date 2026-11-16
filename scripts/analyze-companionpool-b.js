// analyze-companionpool-b.js — classifier for arm sim-companionpool-b (DIAG).
// Extends the dawnbid analyzer (required, not copied): reuses its
// classifySeed for the plan-instance buckets, then decomposes the
// companionPool rows joined to those instances' scored dawns.
// Frozen definitions: evidence/2026-11-16/sim-companionpool-b-prereg.md.
// A scored dawn is CLASSIFIED iff exactly one companionPool row joins
// to it (same day, part 0, vid), the row parses, its counts sum to its
// rosterN, its eligible array matches counts.eligible, its rankedPick
// is non-null whenever eligible > 0, and — whenever the dawn's score
// row carries a party_launch bid — agree is true (the replica's ranked
// pick equals the real findCompanion pick the scorer saw). Anything
// else is `unknown` and fails the run.
// Usage:
//   node scripts/analyze-companionpool-b.js <instrumentDir> [controlDir]
// Writes evidence/2026-11-16/companionpool-b-analysis.json. Exits 0 iff
// every plan-holder scored dawn in the instrument leg is classified
// (unknown == 0), all files parse, and no instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DAWNBID = require(path.join(REPO, 'scripts', 'analyze-dawnbid-a.js'));

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const POOL_CONDITIONS = ['selfOrScholar', 'dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped'];
const BUCKETS = DAWNBID.BUCKETS;

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function isRanger(profile) { return profile === 'wanderer' || profile === 'explorer'; }

// classifyPool(j): dawnbid instance classification + pool decomposition
// joined to each instance's scored dawns. Returns the per-seed result
// (instances from classifySeed, plus poolDawns + aggregates).
function classifyPool(j) {
  const base = DAWNBID.classifySeed(j);
  const scoreRows = (j.dawnbidScores || []).slice();
  const poolRows = (j.companionPool || []).slice();
  const poolDawns = [];
  const unknownList = [];

  for (const inst of base.instances) {
    const vid = inst.vid;
    // Scored dawns for this instance: part-0 score rows while live,
    // plan target matching (same join as the dawnbid classifier).
    const myScores = scoreRows.filter(function (r) {
      return r.vid === vid && r.plan && r.plan.target === inst.target && r.day >= inst.seedDay &&
        (inst.closeDay == null || r.day <= inst.closeDay);
    });
    const dawnByDay = {};
    for (const r of myScores) if (r.part === 0) dawnByDay[r.day] = r;
    const dawnDays = Object.keys(dawnByDay).map(Number).sort(function (a, b) { return a - b; });
    for (const D of dawnDays) {
      const scoreRow = dawnByDay[D];
      const rows = poolRows.filter(function (r) { return r.vid === vid && r.part === 0 && r.day === D; });
      const dawn = { vid: vid, target: inst.target, day: D, stage: (scoreRow.plan && scoreRow.plan.stage) || null,
        holderProfile: null, eligibleN: null, counts: null, rankedPick: null, bidCompanion: null,
        dominantBlocker: null, classified: false, unknownReason: null };
      if (rows.length !== 1) {
        dawn.unknownReason = rows.length === 0 ? 'missing-pool-row' : 'duplicate-pool-rows:' + rows.length;
        unknownList.push({ vid: vid, target: inst.target, day: D, reason: dawn.unknownReason });
        poolDawns.push(dawn);
        continue;
      }
      const row = rows[0];
      // Bid companion off the same dawn's score row (the candidate the
      // scorer actually saw).
      let bidCompanion = null;
      try {
        const launch = (scoreRow.cands || []).find(function (c) { return c && c.winPlanAction === 'party_launch'; });
        bidCompanion = launch ? (launch.companion || null) : null;
      } catch (e) { bidCompanion = null; }
      dawn.bidCompanion = bidCompanion;
      dawn.holderProfile = row.holderProfile || null;
      // Shape checks (each failure is a distinct unknown reason).
      const counts = row.counts || null;
      let sum = null;
      if (counts) {
        sum = 0;
        for (const k of Object.keys(counts)) sum += (counts[k] | 0);
      }
      if (!counts || typeof row.rosterN !== 'number') dawn.unknownReason = 'malformed-counts';
      else if (sum !== row.rosterN) dawn.unknownReason = 'counts-sum-mismatch:' + sum + '!=' + row.rosterN;
      else if (!Array.isArray(row.eligible) || row.eligible.length !== (counts.eligible | 0)) dawn.unknownReason = 'eligible-mismatch';
      else if ((counts.eligible | 0) > 0 && !row.rankedPick) dawn.unknownReason = 'eligible-no-pick';
      else if (row.target !== inst.target) dawn.unknownReason = 'target-mismatch:' + row.target;
      else if (bidCompanion != null && row.agree !== true) dawn.unknownReason = 'replica-disagree:ranked=' + row.rankedPick + ',bid=' + bidCompanion;
      if (dawn.unknownReason) {
        unknownList.push({ vid: vid, target: inst.target, day: D, reason: dawn.unknownReason });
        poolDawns.push(dawn);
        continue;
      }
      dawn.classified = true;
      dawn.eligibleN = counts.eligible | 0;
      dawn.counts = counts;
      dawn.rankedPick = row.rankedPick;
      dawn.rankedVia = row.rankedVia || null;
      if (dawn.eligibleN === 0) {
        // Binding blocker: the failing condition with the largest count
        // on this dawn (ties name all tied conditions, '+'-joined).
        let best = -1;
        const tied = [];
        for (const c of POOL_CONDITIONS) {
          const n = counts[c] | 0;
          if (n > best) { best = n; tied.length = 0; tied.push(c); }
          else if (n === best) tied.push(c);
        }
        dawn.dominantBlocker = tied.join('+');
      }
      poolDawns.push(dawn);
    }
  }

  const classified = poolDawns.filter(function (d) { return d.classified; });
  const unknown = poolDawns.filter(function (d) { return !d.classified; });
  const pooledCounts = {};
  for (const c of POOL_CONDITIONS.concat(['eligible'])) pooledCounts[c] = 0;
  let pooledChecks = 0;
  const bindingTally = {};
  const eligibleHist = { '0': 0, '1': 0, '2': 0, '3+': 0 };
  const rangerSplit = { ranger: { dawns: 0, eligible0: 0 }, nonRanger: { dawns: 0, eligible0: 0 }, unknownProfile: { dawns: 0, eligible0: 0 } };
  for (const d of classified) {
    for (const c of Object.keys(pooledCounts)) pooledCounts[c] += (d.counts[c] | 0);
    pooledChecks += (d.counts.selfOrScholar | 0) + (d.counts.dead | 0) + (d.counts.away | 0) + (d.counts.trustLow | 0) +
      (d.counts.notAtHaven | 0) + (d.counts.engaged | 0) + (d.counts.notRanger | 0) + (d.counts.onExped | 0) + (d.counts.eligible | 0);
    if (d.eligibleN === 0) bindingTally[d.dominantBlocker] = (bindingTally[d.dominantBlocker] || 0) + 1;
    const hk = d.eligibleN >= 3 ? '3+' : String(d.eligibleN);
    eligibleHist[hk]++;
    const slot = d.holderProfile == null ? 'unknownProfile' : (isRanger(d.holderProfile) ? 'ranger' : 'nonRanger');
    rangerSplit[slot].dawns++;
    if (d.eligibleN === 0) rangerSplit[slot].eligible0++;
  }
  // Wave-4-only cut (instances whose target is a wave-4 id).
  const w4Dawns = classified.filter(function (d) { return W4_SET.has(d.target); });
  const w4Unknown = unknown.filter(function (d) { return W4_SET.has(d.target); });

  return {
    seed: base.seed, days: base.days, gameDays: base.gameDays, endReason: base.endReason,
    standing: base.standing, scaleRank: base.scaleRank, won: base.won, maxWave: base.maxWave,
    villageLost: base.villageLost,
    instrumentErrors: base.instrumentErrors,
    seedCallsW4: base.seedCallsW4, nonOpeningSeeds: base.nonOpeningSeeds,
    instancesOpened: base.instancesOpened,
    byBucket: base.byBucket, bySub: base.bySub,
    instances: base.instances,
    scoredDawns: poolDawns.length,
    classifiedDawns: classified.length,
    unknownDawns: unknown.length,
    unknownList: unknownList,
    poolDawns: poolDawns,
    pooledCounts: pooledCounts, pooledChecks: pooledChecks,
    bindingTally: bindingTally, eligibleHist: eligibleHist,
    rangerSplit: rangerSplit,
    wave4Only: { scoredDawns: w4Dawns.length + w4Unknown.length, classifiedDawns: w4Dawns.length, unknownDawns: w4Unknown.length },
  };
}

function summarizePool(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const pooledCounts = {};
  for (const c of POOL_CONDITIONS.concat(['eligible'])) pooledCounts[c] = 0;
  let pooledChecks = 0, scored = 0, classified = 0, unknown = 0;
  const bindingTally = {};
  const eligibleHist = { '0': 0, '1': 0, '2': 0, '3+': 0 };
  const rangerSplit = { ranger: { dawns: 0, eligible0: 0 }, nonRanger: { dawns: 0, eligible0: 0 }, unknownProfile: { dawns: 0, eligible0: 0 } };
  let opened = 0, seedCalls = 0, w4Scored = 0, w4Classified = 0, w4Unknown = 0;
  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  const bySub = {};
  for (const s of seeds) {
    opened += s.instancesOpened;
    seedCalls += s.seedCallsW4;
    scored += s.scoredDawns;
    classified += s.classifiedDawns;
    unknown += s.unknownDawns;
    w4Scored += s.wave4Only.scoredDawns;
    w4Classified += s.wave4Only.classifiedDawns;
    w4Unknown += s.wave4Only.unknownDawns;
    for (const c of Object.keys(pooledCounts)) pooledCounts[c] += s.pooledCounts[c];
    pooledChecks += s.pooledChecks;
    for (const k of Object.keys(s.bindingTally)) bindingTally[k] = (bindingTally[k] || 0) + s.bindingTally[k];
    for (const k of Object.keys(eligibleHist)) eligibleHist[k] += s.eligibleHist[k];
    for (const k of Object.keys(rangerSplit)) {
      rangerSplit[k].dawns += s.rangerSplit[k].dawns;
      rangerSplit[k].eligible0 += s.rangerSplit[k].eligible0;
    }
    for (const b of BUCKETS) byBucket[b] += s.byBucket[b];
    for (const k of Object.keys(s.bySub)) bySub[k] = (bySub[k] || 0) + s.bySub[k];
  }
  const failShares = {};
  for (const c of POOL_CONDITIONS) failShares[c] = pooledChecks ? round(pooledCounts[c] / pooledChecks, 4) : null;
  const bindingShares = {};
  const eligible0 = eligibleHist['0'];
  for (const k of Object.keys(bindingTally)) bindingShares[k] = eligible0 ? round(bindingTally[k] / eligible0, 4) : null;
  return {
    files: leg.files.length,
    seeds: seeds.length,
    seedCallsW4: seedCalls,
    instancesOpened: opened,
    byBucket: byBucket,
    bySub: bySub,
    scoredDawns: scored,
    classifiedDawns: classified,
    unknownDawns: unknown,
    classifiedShare: scored ? round(classified / scored, 4) : null,
    unknown: unknown,
    wave4Only: { scoredDawns: w4Scored, classifiedDawns: w4Classified, unknownDawns: w4Unknown },
    pooledCounts: pooledCounts,
    pooledChecks: pooledChecks,
    failShares: failShares,
    bindingTally: bindingTally,
    bindingShares: bindingShares,
    eligibleHist: eligibleHist,
    eligible0Share: scored ? round(eligibleHist['0'] / scored, 4) : null,
    rangerSplit: rangerSplit,
    survived: seeds.filter(function (s) { return !s.villageLost && ((s.days || 0) >= 150 || s.endReason === 'survived' || (s.gameDays || 0) >= 150); }).length,
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    wall: {
      national: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      table: 0, wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    },
    perSeed: seeds,
  };
}

function main() {
  const instrumentDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  if (!instrumentDir) { console.error('COMPANIONPOOL ANALYZE STOP: instrumentDir required.'); process.exit(2); }
  // Wave-4 id set check (frozen list vs live data).
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const inst = loadDir(instrumentDir);
  for (const k of Object.keys(inst.bySeed)) inst.bySeed[k] = classifyPool(inst.bySeed[k]);
  const instSummary = summarizePool(inst);
  let ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    for (const k of Object.keys(ctrl.bySeed)) ctrl.bySeed[k] = classifyPool(ctrl.bySeed[k]);
    ctrlSummary = summarizePool(ctrl);
  }
  const instErrors = instSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const bar1 = instSummary.scoredDawns > 0 && instSummary.classifiedShare >= 0.9 && instSummary.unknown === 0;
  const bar2 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.files === 8);
  const bar3 = instErrors === 0 && ctrlErrors === 0;

  const out = {
    arm: 'companionpool-b', run: 'companionpool-b',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: instSummary, control: ctrlSummary,
    bars: {
      classification: { pass: bar1, classifiedShare: instSummary.classifiedShare, unknown: instSummary.unknown, scoredDawns: instSummary.scoredDawns, classifiedDawns: instSummary.classifiedDawns },
      corpus: { pass: bar2, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.files : null },
      instrumentErrors: { pass: bar3, instrument: instErrors, control: ctrlErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'companionpool-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== companionpool-b pool decomposition (instrument leg) ===');
  console.log('seeds: ' + instSummary.seeds + '  files: ' + instSummary.files +
    '  seedCallsW4: ' + instSummary.seedCallsW4 + '  instancesOpened: ' + instSummary.instancesOpened);
  console.log('scoredDawns: ' + instSummary.scoredDawns + '  classified: ' + instSummary.classifiedDawns +
    '  unknown: ' + instSummary.unknown + '  share: ' + instSummary.classifiedShare);
  console.log('per-condition first-fail counts: ' + JSON.stringify(instSummary.pooledCounts) + ' over ' + instSummary.pooledChecks + ' checks');
  console.log('fail shares: ' + JSON.stringify(instSummary.failShares));
  console.log('binding blockers on eligible==0 dawns: ' + JSON.stringify(instSummary.bindingTally));
  console.log('eligible histogram: ' + JSON.stringify(instSummary.eligibleHist) + '  eligible0Share: ' + instSummary.eligible0Share);
  console.log('ranger split: ' + JSON.stringify(instSummary.rangerSplit));
  console.log('wall (instrument): ' + JSON.stringify(instSummary.wall) + '  medianSurvival: ' + instSummary.medianSurvival);
  if (ctrlSummary) {
    console.log('--- control leg ---');
    console.log('seeds: ' + ctrlSummary.seeds + '  files: ' + ctrlSummary.files +
      '  seedCallsW4: ' + ctrlSummary.seedCallsW4 + '  instancesOpened: ' + ctrlSummary.instancesOpened +
      '  scoredDawns: ' + ctrlSummary.scoredDawns + '  classified: ' + ctrlSummary.classifiedDawns +
      '  unknown: ' + ctrlSummary.unknown);
    console.log('wall (control): ' + JSON.stringify(ctrlSummary.wall) + '  medianSurvival: ' + ctrlSummary.medianSurvival);
  }
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyPool: classifyPool, classifySeed: DAWNBID.classifySeed, summarizePool: summarizePool, BUCKETS: BUCKETS, POOL_CONDITIONS: POOL_CONDITIONS };
