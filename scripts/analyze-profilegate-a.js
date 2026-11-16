// analyze-profilegate-a.js — classifier for arm sim-profilegate-a (LEVER).
// Copied from scripts/analyze-dawnbid-a.js (classifier + bucket definitions
// UNCHANGED); the only additions are the arm label, the output file,
// and the GO section (primary metric + scalemetric cost bar) in main().
// Implements the frozen bucket definitions from
// evidence/2026-11-15/sim-dawnbid-a-prereg.md (incl. Correction 2:
// stage advancement is not churn; churn = holder-died /
// plan-deleted / retargeted; new terminal bucket target-killed;
// new sub-reason selected-not-executed).
// Precedence (first match wins): launched > target-killed >
// selected-blocked > bid-not-selected > plan-churned-before-dawn
// > candidate-not-bid. Anything else is `unknown` and fails the run.
// Usage:
//   node scripts/analyze-profilegate-a.js <armedDir> [controlDir]
// Writes evidence/2026-11-15/profilegate-a-analysis.json. Exits 0 iff
// every plan instance in the instrument leg is classified
// (unknown == 0), all files parse, and no instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const BUCKETS = ['launched', 'target-killed', 'selected-blocked', 'bid-not-selected', 'plan-churned-before-dawn', 'candidate-not-bid', 'unknown'];

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
function mapVidBlock(b) {
  if (b === 'sick') return 'inviter-sick';
  if (b === 'range-0') return 'inviter-range-0';
  if (b === 'hurt-no-medicine-no-healer') return 'inviter-hurt';
  return 'inviter-exped-failed-unknown';
}

function classifySeed(j) {
  const errors = (j.instrumentErrors || []).slice();
  const seedRows = (j.v4seeds || []).slice();
  const scoreRows = (j.dawnbidScores || []).slice();
  const departRows = (j.dawnbidDeparts || []).slice();
  const censusRows = (j.dawnbidCensus || []).slice();
  const daily = (j.daily || []).slice();
  const finalDay = j.gameDays || j.days || 0;

  // Final waveKillLog (cumulative) for target-killed detection.
  let finalKillLog = [];
  try {
    const last = daily.length ? daily[daily.length - 1] : null;
    if (last && last.waveKillLog) finalKillLog = last.waveKillLog;
  } catch (e) {}

  const instances = [];
  const openByVid = {};
  let nonOpeningSeeds = 0;
  let seedCallsW4 = 0;

  function closeInstance(inst, kind, day) {
    if (inst.closeDay != null) return;
    inst.closeDay = day;
    inst.closeKind = kind;
    if (openByVid[inst.vid] === inst) delete openByVid[inst.vid];
  }

  // ---- State machine over seed rows (chronological) ----
  for (const s of seedRows) {
    if ((s.wave | 0) < 3) continue;
    if ((s.wave | 0) >= 4) seedCallsW4++;
    const stageAfter = s.stageAfter;
    if (stageAfter !== 'gear' && stageAfter !== 'party') { nonOpeningSeeds++; continue; }
    const open = openByVid[s.vid] || null;
    if ((s.wave | 0) < 4) {
      // Wave-3 seed: never opens an instance; retargets an open one.
      if (open && open.target !== s.target) closeInstance(open, 'retargeted', s.day);
      continue;
    }
    if (open) {
      if (open.target === s.target) { open.refreshes++; open.lastSeedDay = s.day; }
      else {
        closeInstance(open, 'retargeted', s.day);
        const inst = { vid: s.vid, target: s.target, needWave: s.wave, seedDay: s.day, seedOutcome: s.outcome || null, refreshes: 0, lastSeedDay: s.day, closeDay: null, closeKind: null, history: [] };
        instances.push(inst);
        openByVid[s.vid] = inst;
      }
    } else {
      const inst = { vid: s.vid, target: s.target, needWave: s.wave, seedDay: s.day, seedOutcome: s.outcome || null, refreshes: 0, lastSeedDay: s.day, closeDay: null, closeKind: null, history: [] };
      instances.push(inst);
      openByVid[s.vid] = inst;
    }
  }

  // ---- Per-instance evidence ----
  for (const inst of instances) {
    const vid = inst.vid;
    const myScores = scoreRows.filter(function (r) {
      return r.vid === vid && r.plan && r.plan.target === inst.target && r.day >= inst.seedDay &&
        (inst.closeDay == null || r.day <= inst.closeDay);
    });
    const dawnRows = myScores.filter(function (r) { return r.part === 0; });
    // One dawn commit per vid+day: the LAST part-0 row wins (a re-pick
    // overwrites the earlier commit).
    const dawnByDay = {};
    for (const r of dawnRows) dawnByDay[r.day] = r;
    const dawnDays = Object.keys(dawnByDay).map(Number).sort(function (a, b) { return a - b; });
    inst.scoredDawns = dawnDays.length;
    inst.firstScoredDawn = dawnDays.length ? dawnDays[0] : null;
    // Stage history (Correction 2: transitions are history, not churn).
    const stages = [];
    for (const r of myScores) {
      if (r.plan && r.plan.stage && (stages.length === 0 || stages[stages.length - 1] !== r.plan.stage)) stages.push(r.plan.stage);
    }
    inst.stageHistory = stages;
    // Bids: any part-0 row whose candidate list carries party_launch.
    inst.bids = [];
    for (const r of dawnRows) {
      const cand = (r.cands || []).find(function (c) { return c && c.winPlanAction === 'party_launch'; });
      if (!cand) continue;
      let score = null, rank = null;
      try {
        const lc = (r.logCands || []);
        for (let i = 0; i < lc.length; i++) {
          if (lc[i] && lc[i].winPlanAction === 'party_launch') { score = lc[i].score; rank = i; break; }
        }
      } catch (e) {}
      inst.bids.push({ day: r.day, w: cand.w, score: score, rank: rank, totalCands: (r.logCands || []).length });
    }
    // Selections: dawn commit party_launch (last part-0 row per day).
    inst.selections = [];
    for (const d of dawnDays) {
      const r = dawnByDay[d];
      // The commit is authoritative: a commit that exists with a null
      // winPlanAction means the core pick won (never fall back to the
      // pick's action when a commit exists).
      const act = r.commit ? (r.commit.winPlanAction || null) : ((r.pick && r.pick.winPlanAction) || null);
      if (act === 'party_launch') inst.selections.push({ day: d, companion: (r.commit && r.commit.companion) || null });
    }
    // Resolve each selection day against depart rows / midday commits.
    inst.resolved = [];
    for (const sel of inst.selections) {
      const D = sel.day;
      const deps = departRows.filter(function (r) { return r.vid === vid && r.day === D && r.winPlanAction === 'party_launch'; });
      let res = null;
      for (const r of deps) {
        if (r.result === 'launch' && r.vidExped && r.companionExped) { res = { outcome: 'launched', day: D, companion: r.companion }; break; }
      }
      if (!res) for (const r of deps) {
        if (r.result === 'launch' && r.vidExped && !r.companionExped) { res = { outcome: 'blocked', reason: 'companion-not-started:' + (r.companionBlock || 'unknown'), day: D }; break; }
      }
      if (!res) for (const r of deps) {
        if (r.result === 'hold') { res = { outcome: 'blocked', reason: r.vidBlock ? mapVidBlock(r.vidBlock) : 'inviter-exped-failed-unknown', day: D }; break; }
      }
      if (!res) for (const r of deps) {
        if (r.result === 'normal') { res = { outcome: 'blocked', reason: 'inviter-exped-failed-unknown', day: D }; break; }
      }
      if (!res) {
        const midday = myScores.filter(function (r) { return r.day === D && r.part !== 0; });
        let overwrote = null;
        for (const m of midday) {
          const a = (m.commit && m.commit.winPlanAction) || null;
          if (a && a !== 'party_launch') { overwrote = a; break; }
        }
        res = overwrote
          ? { outcome: 'blocked', reason: 'commit-overwritten-midday:' + overwrote, day: D }
          : { outcome: 'blocked', reason: 'selected-not-executed', day: D };
      }
      inst.resolved.push(res);
    }
    // Target-killed: holder slew the target type while open.
    inst.targetKilledDay = null;
    for (const e of finalKillLog) {
      if (e && e.by === vid && e.mid === inst.target && (e.d | 0) >= inst.seedDay &&
        (inst.closeDay == null || (e.d | 0) <= inst.closeDay)) {
        if (inst.targetKilledDay == null || (e.d | 0) < inst.targetKilledDay) inst.targetKilledDay = e.d | 0;
      }
    }
    // Churn (Correction 2: holder-died / plan-deleted / retargeted only).
    if (inst.closeKind == null) {
      const myCensus = censusRows.filter(function (r) { return r.vid === vid; }).sort(function (a, b) { return a.day - b.day; });
      let diedDay = null;
      for (const c of myCensus) if (!c.holderAlive) { diedDay = c.day; break; }
      if (diedDay == null) {
        // Backup: daily roster dead flags.
        for (const snap of daily) {
          if (!snap.roster) continue;
          const row = snap.roster.find(function (x) { return x && x.vid === vid; });
          if (row && row.dead) { diedDay = snap.day; break; }
        }
      }
      if (diedDay != null && diedDay >= inst.seedDay) {
        inst.closeDay = diedDay;
        inst.closeKind = 'holder-died';
      } else if (myCensus.length) {
        const lastCensusDay = myCensus[myCensus.length - 1].day;
        if (lastCensusDay < finalDay) {
          // Plan left winPlan after the last census day (retargets are
          // already closed by the seed state machine above).
          inst.closeDay = lastCensusDay + 1;
          inst.closeKind = 'plan-deleted';
        }
      }
    }
    // ---- Classification (frozen precedence) ----
    const launched = inst.resolved.find(function (r) { return r.outcome === 'launched'; });
    const blocked = inst.resolved.find(function (r) { return r.outcome === 'blocked'; });
    const churnedBeforeDawn = inst.closeDay != null && inst.closeKind != null &&
      (inst.firstScoredDawn == null || inst.closeDay < inst.firstScoredDawn);
    let bucket = null, sub = null;
    if (launched) { bucket = 'launched'; sub = 'companion:' + (launched.companion || 'none'); }
    else if (inst.targetKilledDay != null) { bucket = 'target-killed'; sub = 'day:' + inst.targetKilledDay; }
    else if (blocked) { bucket = 'selected-blocked'; sub = blocked.reason; }
    else if (inst.bids.length) { bucket = 'bid-not-selected'; sub = 'bids:' + inst.bids.length; }
    else if (churnedBeforeDawn) { bucket = 'plan-churned-before-dawn'; sub = inst.closeKind; }
    else {
      bucket = 'candidate-not-bid';
      // Sub-reason: most frequent per-dawn not-bid reason.
      const tally = {};
      for (const d of dawnDays) {
        const r = dawnByDay[d];
        const acts = (r.cands || []).map(function (c) { return c && c.winPlanAction; }).filter(Boolean);
        let reason;
        if (acts.indexOf('gear_hold') !== -1) reason = 'gear-stage';
        else if (acts.indexOf('party_wait') !== -1) reason = 'no-companion-party';
        else if (acts.indexOf('veteran_guard') !== -1) reason = 'veteran-guard';
        else if (acts.length === 0) reason = 'no-companion-hunt-plus';
        else reason = 'other-action:' + acts.join(',');
        tally[reason] = (tally[reason] || 0) + 1;
      }
      if (dawnDays.length === 0) sub = 'not-scored';
      else {
        let best = null, bestN = -1;
        for (const k of Object.keys(tally)) if (tally[k] > bestN) { best = k; bestN = tally[k]; }
        sub = best;
      }
    }
    if (!bucket) { bucket = 'unknown'; sub = 'no-rule-matched'; }
    inst.bucket = bucket;
    inst.sub = sub;
    inst.churnedBeforeDawn = churnedBeforeDawn;
    inst.tally = { scoredDawns: inst.scoredDawns, bids: inst.bids.length, selections: inst.selections.length };
  }

  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  const bySub = {};
  for (const inst of instances) {
    byBucket[inst.bucket]++;
    const k = inst.bucket + ':' + (inst.sub || '');
    bySub[k] = (bySub[k] || 0) + 1;
  }
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: errors.length,
    seedCallsW4: seedCallsW4, nonOpeningSeeds: nonOpeningSeeds,
    instancesOpened: instances.length,
    byBucket: byBucket, bySub: bySub,
    instances: instances,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  const bySub = {};
  let opened = 0, seedCalls = 0;
  for (const s of seeds) {
    opened += s.instancesOpened;
    seedCalls += s.seedCallsW4;
    for (const b of BUCKETS) byBucket[b] += s.byBucket[b];
    for (const k of Object.keys(s.bySub)) bySub[k] = (bySub[k] || 0) + s.bySub[k];
  }
  const classified = opened - byBucket.unknown;
  return {
    files: leg.files.length,
    seeds: seeds.length,
    seedCallsW4: seedCalls,
    instancesOpened: opened,
    byBucket: byBucket,
    bySub: bySub,
    classifiedShare: opened ? round(classified / opened, 4) : null,
    unknown: byBucket.unknown,
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
  if (!instrumentDir) { console.error('PROFILEGATE ANALYZE STOP: armedDir required.'); process.exit(2); }
  // Wave-4 id set check (frozen list vs live data).
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const instRaw = loadDir(instrumentDir);
  const ctrlRaw = controlDir ? loadDir(controlDir) : null;
  const inst = loadDir(instrumentDir);
  for (const k of Object.keys(inst.bySeed)) inst.bySeed[k] = classifySeed(inst.bySeed[k]);
  const instSummary = summarize(inst);
  let ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    for (const k of Object.keys(ctrl.bySeed)) ctrl.bySeed[k] = classifySeed(ctrl.bySeed[k]);
    ctrlSummary = summarize(ctrl);
  }
  const instErrors = instSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const bar1 = instSummary.instancesOpened > 0 && instSummary.classifiedShare >= 0.9 && instSummary.unknown === 0;
  const bar2 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.files === 8);
  const bar3 = instErrors === 0 && ctrlErrors === 0;

  // ---- GO section (sim-profilegate-a prereg) ----
  // Primary metric: launched wave-4+ plans per seed (armed leg).
  // Cost bar per analyze-scale-costbar.js B1/B3: median ratio >= 0.8,
  // starvation totals armed <= control + 2, starvation arm-only
  // (matched same-seed same-day) armed <= control arm-only + 2.
  function starvDaysOf(rawBySeed) {
    const perSeed = {};
    let total = 0;
    for (const k of Object.keys(rawBySeed)) {
      const j = rawBySeed[k];
      const days = (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).map(function (d) { return d.day; });
      perSeed[j.seed] = days;
      total += days.length;
    }
    return { perSeed: perSeed, total: total };
  }
  function matchedStarv(a, b) {
    let m = 0;
    for (const seed of Object.keys(a.perSeed)) {
      const counts = {};
      for (const d of (b.perSeed[seed] || [])) counts[d] = (counts[d] || 0) + 1;
      for (const d of a.perSeed[seed]) if (counts[d]) { m++; counts[d]--; }
    }
    return m;
  }
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  function nationalEnd(rawBySeed) {
    let n = 0;
    for (const k of Object.keys(rawBySeed)) {
      const j = rawBySeed[k];
      if ((RANK_ORDER[j.scaleRank] || 0) >= 2) n++;
    }
    return n;
  }
  const armStarv = starvDaysOf(instRaw.bySeed);
  const ctrlStarv = ctrlRaw ? starvDaysOf(ctrlRaw.bySeed) : null;
  const armStarvOnly = ctrlStarv ? armStarv.total - matchedStarv(armStarv, ctrlStarv) : null;
  const ctrlStarvOnly = ctrlStarv ? ctrlStarv.total - matchedStarv(ctrlStarv, armStarv) : null;
  const medArm = instSummary.medianSurvival, medCtrl = ctrlSummary ? ctrlSummary.medianSurvival : null;
  const medianRatio = (medArm != null && medCtrl) ? round(medArm / medCtrl, 3) : null;
  const launchedSeeds = Object.keys(inst.bySeed).filter(function (k) { return (inst.bySeed[k].byBucket.launched || 0) >= 1; }).map(Number).sort(function (a, b) { return a - b; });
  let launchedTotal = 0, launchedW4Only = 0;
  for (const k of Object.keys(inst.bySeed)) {
    for (const x of (inst.bySeed[k].instances || [])) {
      if (x.bucket === 'launched') { launchedTotal++; if (W4_SET.has(x.target)) launchedW4Only++; }
    }
  }
  const goLaunch = launchedSeeds.length >= 3;
  const goMedian = medianRatio != null && medianRatio >= 0.8;
  const goStarvTot = ctrlStarv ? armStarv.total <= ctrlStarv.total + 2 : null;
  const goStarvOnly = (ctrlStarvOnly != null) ? armStarvOnly <= ctrlStarvOnly + 2 : null;
  const goPass = goLaunch && goMedian && goStarvTot === true && goStarvOnly === true;
  const go = {
    launchedSeeds: launchedSeeds, launchedSeedsN: launchedSeeds.length,
    launchedTotal: launchedTotal, launchedW4Only: launchedW4Only,
    medianArmed: medArm, medianControl: medCtrl, medianRatio: medianRatio,
    starvArmedTotal: armStarv.total, starvControlTotal: ctrlStarv ? ctrlStarv.total : null,
    starvArmedOnly: armStarvOnly, starvControlOnly: ctrlStarvOnly,
    nationalEndArmed: nationalEnd(instRaw.bySeed),
    nationalEndControl: ctrlRaw ? nationalEnd(ctrlRaw.bySeed) : null,
    bars: { launch: goLaunch, median: goMedian, starvTotals: goStarvTot, starvArmOnly: goStarvOnly },
    pass: goPass,
  };

  const out = {
    arm: 'profilegate-a', run: 'profilegate-a',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: instSummary, control: ctrlSummary,
    go: go,
    bars: {
      classification: { pass: bar1, classifiedShare: instSummary.classifiedShare, unknown: instSummary.unknown, instancesOpened: instSummary.instancesOpened },
      corpus: { pass: bar2, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.files : null },
      instrumentErrors: { pass: bar3, instrument: instErrors, control: ctrlErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-15', 'profilegate-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== profilegate-a classification (armed leg) ===');
  console.log('seeds: ' + instSummary.seeds + '  files: ' + instSummary.files +
    '  seedCallsW4: ' + instSummary.seedCallsW4 + '  instancesOpened: ' + instSummary.instancesOpened);
  for (const b of BUCKETS) {
    const n = instSummary.byBucket[b];
    const share = instSummary.instancesOpened ? round(n / instSummary.instancesOpened, 3) : null;
    console.log('  ' + b + ': ' + n + (share == null ? '' : ' (' + share + ')'));
  }
  console.log('sub-reasons: ' + JSON.stringify(instSummary.bySub));
  console.log('classifiedShare: ' + instSummary.classifiedShare + '  unknown: ' + instSummary.unknown);
  console.log('wall (instrument): ' + JSON.stringify(instSummary.wall) + '  medianSurvival: ' + instSummary.medianSurvival);
  if (ctrlSummary) {
    console.log('--- control leg ---');
    console.log('seeds: ' + ctrlSummary.seeds + '  files: ' + ctrlSummary.files +
      '  seedCallsW4: ' + ctrlSummary.seedCallsW4 + '  instancesOpened: ' + ctrlSummary.instancesOpened);
    console.log('wall (control): ' + JSON.stringify(ctrlSummary.wall) + '  medianSurvival: ' + ctrlSummary.medianSurvival);
  }
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('GO: launchedSeeds=' + launchedSeeds.length + ' (' + launchedSeeds.join(',') + ')' +
    ' launchedTotal=' + launchedTotal + ' launchedW4Only=' + launchedW4Only +
    ' medianRatio=' + medianRatio +
    ' starvTotals armed=' + armStarv.total + ' control=' + (ctrlStarv ? ctrlStarv.total : 'n/a') +
    ' starvArmOnly armed=' + armStarvOnly + ' control=' + ctrlStarvOnly +
    ' nationalEnd armed=' + go.nationalEndArmed + ' control=' + go.nationalEndControl +
    ' => ' + (goPass ? 'GO' : 'NO-GO'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifySeed: classifySeed, summarize: summarize, BUCKETS: BUCKETS };
