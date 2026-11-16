// analyze-seedattach-a.js — classifier for arm sim-seedattach-a (DIAG).
// Implements the frozen bucket definitions from
// evidence/2026-11-15/sim-seedattach-a-prereg.md (incl. Correction 1:
// bounce rows carry foughtAtBounce as context only).
// Subject: a target-null hunt-stage plan instance — an epoch opened by
// the first wave>=4 seed call whose BEFORE-state plan is stage 'hunt'
// and target null. Precedence (first match wins):
// companion-inherited > haven-born-never-seeded > seeded-then-lost >
// unknown. Anything else is `unknown` and fails the run.
// Usage:
//   node scripts/analyze-seedattach-a.js <mainDir> [baselineDir]
// Writes evidence/2026-11-15/seedattach-a-analysis.json. Exits 0 iff
// every plan instance in the main leg is classified (unknown == 0),
// all files parse, and no instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const BUCKETS = ['companion-inherited', 'haven-born-never-seeded', 'seeded-then-lost', 'unknown'];

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

// Census runs per vid: maximal runs of consecutive census days where
// the plan is stage 'hunt' and target null. A run is {vid, startDay,
// endDay, sinceDay}. Bounces attach to the run active on their day;
// a bounce with no active run opens a bounce-only epoch.
function huntRuns(censusRows) {
  const byVid = {};
  for (const r of censusRows) {
    if (!r || r.stage !== 'hunt' || r.target != null) continue;
    (byVid[r.vid] = byVid[r.vid] || []).push(r);
  }
  const runs = [];
  for (const vid of Object.keys(byVid)) {
    const rows = byVid[vid].slice().sort(function (a, b) { return a.day - b.day; });
    let cur = null;
    for (const r of rows) {
      if (cur && r.day === cur.endDay + 1 && (r.sinceDay === cur.sinceDay || r.sinceDay == null || cur.sinceDay == null)) {
        cur.endDay = r.day;
      } else {
        cur = { vid: vid, startDay: r.day, endDay: r.day, sinceDay: (r.sinceDay != null ? r.sinceDay : null) };
        runs.push(cur);
      }
    }
  }
  return runs;
}

function classifySeed(j) {
  const errors = (j.instrumentErrors || []).slice();
  const bounces = (j.seedattachBounces || []).slice();
  const creations = (j.seedattachCreations || []).slice();
  const launches = (j.seedattachLaunches || []).slice();
  const census = (j.seedattachCensus || []).slice();
  const encounters = (j.v4encounters || []).slice();
  const finalDay = j.gameDays || j.days || 0;

  // ---- Secondary counts: every seed call by class ----
  const secondary = { seedCallsW4: 0, seedCallsW3: 0, opened: 0, noPlanCreated: 0,
    bouncedNullHunt: 0, bouncedTargeted: 0, other: 0 };
  for (const b of bounces) {
    if ((b.wave | 0) >= 4) secondary.seedCallsW4++;
    else if ((b.wave | 0) === 3) secondary.seedCallsW3++;
    else continue;
    if (b.stageBefore == null && b.targetAfter != null) secondary.noPlanCreated++;
    else if ((b.stageBefore === 'gear' || b.stageBefore === 'party') && b.targetAfter != null) secondary.opened++;
    else if (b.stageBefore === 'hunt' && b.targetBefore == null) secondary.bouncedNullHunt++;
    else if ((b.stageBefore === 'hunt' || b.stageBefore === 'standing' || b.stageBefore === 'table') && b.targetBefore != null) secondary.bouncedTargeted++;
    else secondary.other++;
  }

  // ---- Epochs from subject bounces ----
  const runs = huntRuns(census);
  const epochs = [];
  const epochByKey = {};
  function epochFor(b) {
    const run = runs.find(function (r) { return r.vid === b.vid && b.day >= r.startDay && b.day <= r.endDay; });
    const key = run ? (b.vid + '|run|' + run.startDay) : (b.vid + '|bounce|' + b.day);
    if (!epochByKey[key]) {
      const ep = { vid: b.vid, key: key, huntEntryDay: run ? run.startDay : b.day,
        runEndDay: run ? run.endDay : null, censusBacked: !!run,
        firstBounceDay: b.day, firstBounceMid: b.mid, firstBounceOutcome: b.outcome || null,
        bounces: [], repeatBounces: 0, nodeAtFirstBounce: b.nodeBefore || null,
        planAgeAtFirstBounce: (b.planSinceDay != null ? (b.day - b.planSinceDay) : null),
        foughtAtFirstBounce: (b.foughtAtBounce || []).slice() };
      epochs.push(ep);
      epochByKey[key] = ep;
    }
    return epochByKey[key];
  }
  for (const b of bounces) {
    if ((b.wave | 0) < 4) continue;
    if (b.stageBefore !== 'hunt' || b.targetBefore != null) continue;
    const ep = epochFor(b);
    ep.bounces.push({ day: b.day, mid: b.mid, outcome: b.outcome || null });
    ep.repeatBounces = ep.bounces.length;
  }

  // ---- Per-epoch evidence + classification ----
  for (const ep of epochs) {
    const vid = ep.vid;
    const myCensus = census.filter(function (r) { return r.vid === vid; }).sort(function (a, b) { return a.day - b.day; });
    const myCreations = creations.filter(function (r) { return r.vid === vid; }).sort(function (a, b) { return a.day - b.day; });
    const myLaunchesAsCompanion = launches.filter(function (r) { return r.companion === vid; }).sort(function (a, b) { return a.day - b.day; });
    const myBounces = bounces.filter(function (r) { return r.vid === vid; }).sort(function (a, b) { return a.day - b.day; });

    // Creation event: the latest creation on/before the first bounce
    // (a plan is created once; a later creation for the same vid means
    // the old plan was deleted and a new one began). All epoch
    // evidence below is scoped to rows on/after the creation day, so
    // a deleted predecessor plan cannot contaminate this epoch.
    let creation = null;
    for (const c of myCreations) if (c.day <= ep.firstBounceDay) creation = c;
    ep.creation = creation ? { day: creation.day, createdBy: creation.createdBy,
      creatorSite: creation.creatorSite, fought: creation.fought || [],
      villageSlainTotal: creation.villageSlainTotal,
      stageAtCreation: creation.stageAtCreation, targetAtCreation: creation.targetAtCreation } : null;
    const epochStartDay = creation ? creation.day : 0;
    // First census sighting of this plan (any stage) on/after creation
    // and on/before the epoch.
    const firstSighting = myCensus.find(function (r) { return r.day >= epochStartDay && r.day <= ep.firstBounceDay; }) || null;
    ep.firstSightingStage = firstSighting ? firstSighting.stage : null;
    ep.firstSightingDay = firstSighting ? firstSighting.day : null;
    // Seed-set events for this epoch before it opened (a seed that
    // moved target null -> non-null while gear/party).
    const seedSets = myBounces.filter(function (b) {
      return b.day >= epochStartDay && b.day < ep.firstBounceDay && b.targetBefore == null && b.targetAfter != null;
    });
    ep.seedSetsBeforeEpoch = seedSets.length;
    // Launch events naming this vid as companion, on/before the epoch.
    ep.launchesAsCompanion = myLaunchesAsCompanion.filter(function (l) { return l.day <= ep.firstBounceDay; })
      .map(function (l) { return { day: l.day, path: l.path, inviter: l.vid,
        inviterTargetBefore: l.inviterTargetBefore, companionTargetBefore: l.companionTargetBefore,
        companionTargetAfter: l.companionTargetAfter }; });
    // Target-ever-non-null before a later null (seeded-then-lost check):
    // any census row or bounce with target non-null, followed by a
    // census row / bounce with target null, both within this epoch.
    let sawTarget = null, lostDay = null;
    for (const r of myCensus) {
      if (r.day < epochStartDay || r.day > ep.firstBounceDay) continue;
      if (r.target != null) { if (sawTarget == null) sawTarget = { day: r.day, target: r.target, src: 'census' }; }
      else if (sawTarget) { lostDay = r.day; break; }
    }
    if (lostDay == null) {
      for (const b of myBounces) {
        if (b.day < epochStartDay || b.day > ep.firstBounceDay) continue;
        if (b.targetBefore != null) { if (sawTarget == null) sawTarget = { day: b.day, target: b.targetBefore, src: 'bounce-before' }; }
        else if (b.targetAfter != null) { if (sawTarget == null) sawTarget = { day: b.day, target: b.targetAfter, src: 'bounce-after' }; }
        else if (sawTarget) { lostDay = b.day; break; }
      }
    }
    ep.everTargeted = sawTarget;
    ep.targetLostDay = lostDay;
    // Epoch close: first census day after the run end showing the plan
    // gone / non-hunt / targeted, or holder dead, or run end.
    let closeKind = 'run-end';
    if (ep.runEndDay != null) {
      const after = myCensus.find(function (r) { return r.day === ep.runEndDay + 1; });
      if (!after) closeKind = 'plan-deleted';
      else if (!after.holderAlive) closeKind = 'holder-died';
      else if (after.stage !== 'hunt') closeKind = 'stage-left-hunt:' + after.stage;
      else if (after.target != null) closeKind = 'target-set:' + after.target;
    }
    ep.closeKind = closeKind;

    // ---- Classification (frozen precedence) ----
    let bucket = null, sub = null;
    const companionLaunch = ep.launchesAsCompanion.find(function (l) {
      return l.companionTargetAfter == null &&
        (l.path === 'brain' ? l.companionTargetBefore == null : l.inviterTargetBefore == null);
    });
    const firstSeenHunt = ep.firstSightingStage === 'hunt';
    // A haven-born plan can be invited as a companion the SAME day it
    // was created (first census sighting hunt, launch event present) —
    // its null predates the launch, so it is haven-born, not inherited.
    // Excluded: created by HavenTick, or created before the launch day.
    const launchCreated = companionLaunch &&
      !(ep.creation && ep.creation.createdBy === 'winPlanHavenTick') &&
      !(ep.creation && ep.creation.day < companionLaunch.day);
    // Fallback (prereg): no launch event captured, but the first census
    // sighting is stage hunt with party [inviter] and the inviter's plan
    // target is null that day — the plan entered hunt as a companion copy.
    let censusOnlyInviter = null;
    if (!companionLaunch && firstSeenHunt && firstSighting && (firstSighting.party || []).length) {
      const inviterVid = firstSighting.party[0];
      const inviterRow = census.find(function (r) { return r.vid === inviterVid && r.day === firstSighting.day; });
      if (inviterRow && inviterRow.target == null) censusOnlyInviter = inviterVid;
    }
    const havenBornExcluded = ep.creation &&
      (ep.creation.createdBy === 'winPlanHavenTick' ||
        (companionLaunch && ep.creation.day < companionLaunch.day));
    if (companionLaunch && launchCreated && firstSeenHunt) {
      bucket = 'companion-inherited';
      sub = companionLaunch.path + ':inviter-' + (companionLaunch.inviter || 'unknown');
    } else if (censusOnlyInviter && !havenBornExcluded) {
      bucket = 'companion-inherited';
      sub = 'census-only:inviter-' + censusOnlyInviter;
    } else if (ep.creation && ep.creation.targetAtCreation == null && ep.seedSetsBeforeEpoch === 0) {
      bucket = 'haven-born-never-seeded';
      const fought = (ep.creation.fought || []).length > 0;
      if (fought) sub = 'fought-personally';
      else if ((ep.creation.villageSlainTotal | 0) > 0) sub = 'heard-at-fire';
      else sub = 'created-by-read';
    } else if (ep.everTargeted && ep.targetLostDay != null) {
      bucket = 'seeded-then-lost';
      sub = 'target:' + ep.everTargeted.target + ':lost-day:' + ep.targetLostDay;
    }
    if (!bucket) { bucket = 'unknown'; sub = 'no-rule-matched'; }
    ep.bucket = bucket;
    ep.sub = sub;
  }

  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  const bySub = {};
  for (const ep of epochs) {
    byBucket[ep.bucket]++;
    const k = ep.bucket + ':' + (ep.sub || '');
    bySub[k] = (bySub[k] || 0) + 1;
  }
  // Sense case: first epoch + its holder's wave-4 fight log lines.
  let senseCase = null;
  if (epochs.length) {
    const ep = epochs[0];
    const near = encounters.filter(function (e) { return e.vid === ep.vid && Math.abs(e.day - ep.firstBounceDay) <= 3; });
    senseCase = { vid: ep.vid, firstBounceDay: ep.firstBounceDay, mid: ep.firstBounceMid,
      bucket: ep.bucket, sub: ep.sub,
      nearbyEncounters: near.slice(0, 3).map(function (e) {
        return { day: e.day, mid: e.mid, outcome: e.outcome, log: (e.log || []).slice(0, 8) };
      }) };
  }
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: errors.length,
    secondary: secondary,
    instancesOpened: epochs.length,
    byBucket: byBucket, bySub: bySub,
    instances: epochs,
    senseCase: senseCase,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  const bySub = {};
  let opened = 0, seedCallsW4 = 0, seedCallsW3 = 0;
  const secondary = { opened: 0, noPlanCreated: 0, bouncedNullHunt: 0, bouncedTargeted: 0, other: 0 };
  for (const s of seeds) {
    opened += s.instancesOpened;
    seedCallsW4 += s.secondary.seedCallsW4;
    seedCallsW3 += s.secondary.seedCallsW3;
    secondary.opened += s.secondary.opened;
    secondary.noPlanCreated += s.secondary.noPlanCreated;
    secondary.bouncedNullHunt += s.secondary.bouncedNullHunt;
    secondary.bouncedTargeted += s.secondary.bouncedTargeted;
    secondary.other += s.secondary.other;
    for (const b of BUCKETS) byBucket[b] += s.byBucket[b];
    for (const k of Object.keys(s.bySub)) bySub[k] = (bySub[k] || 0) + s.bySub[k];
  }
  const classified = opened - byBucket.unknown;
  return {
    files: leg.files.length,
    seeds: seeds.length,
    seedCallsW4: seedCallsW4, seedCallsW3: seedCallsW3,
    secondary: secondary,
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

function corpusBarPass(mainLoad, baseSummary) {
  return mainLoad.files.length === 8 && (!baseSummary || baseSummary.files === 8);
}

function main() {
  const mainDir = process.argv[2];
  const baselineDir = process.argv[3] || null;
  if (!mainDir) { console.error('SEEDATTACH ANALYZE STOP: mainDir required.'); process.exit(2); }
  // Wave-4 id set check (frozen list vs live data).
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const main = loadDir(mainDir);
  for (const k of Object.keys(main.bySeed)) main.bySeed[k] = classifySeed(main.bySeed[k]);
  const mainSummary = summarize(main);
  let baseSummary = null;
  if (baselineDir) {
    const base = loadDir(baselineDir);
    for (const k of Object.keys(base.bySeed)) base.bySeed[k] = classifySeed(base.bySeed[k]);
    baseSummary = summarize(base);
  }
  const mainErrors = mainSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const baseErrors = baseSummary ? baseSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const bar1 = mainSummary.instancesOpened > 0 && mainSummary.classifiedShare >= 0.9 && mainSummary.unknown === 0;
  // NOTE: summarize() returns files as a COUNT (see the dawnbid
  // summarize-shape regression) — the bar must compare the count, not
  // read .length off it. (An earlier draft of this line read
  // baseSummary.files.length and failed the bar with 8/8 files present.)
  const bar2 = corpusBarPass(main, baseSummary);
  const bar3 = mainErrors === 0 && baseErrors === 0;

  const out = {
    arm: 'seedattach-a', run: 'seedattach-a',
    instrumentDir: path.basename(mainDir), baselineDir: baselineDir ? path.basename(baselineDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    main: mainSummary, baseline: baseSummary,
    bars: {
      classification: { pass: bar1, classifiedShare: mainSummary.classifiedShare, unknown: mainSummary.unknown, instancesOpened: mainSummary.instancesOpened },
      corpus: { pass: bar2, mainFiles: main.files.length, baselineFiles: baseSummary ? baseSummary.files : null },
      instrumentErrors: { pass: bar3, main: mainErrors, baseline: baseErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-15', 'seedattach-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== seedattach-a classification (main leg, competent) ===');
  console.log('seeds: ' + mainSummary.seeds + '  files: ' + mainSummary.files +
    '  seedCallsW4: ' + mainSummary.seedCallsW4 + '  seedCallsW3: ' + mainSummary.seedCallsW3 +
    '  instancesOpened: ' + mainSummary.instancesOpened);
  for (const b of BUCKETS) {
    const n = mainSummary.byBucket[b];
    const share = mainSummary.instancesOpened ? round(n / mainSummary.instancesOpened, 3) : null;
    console.log('  ' + b + ': ' + n + (share == null ? '' : ' (' + share + ')'));
  }
  console.log('sub-reasons: ' + JSON.stringify(mainSummary.bySub));
  console.log('secondary: ' + JSON.stringify(mainSummary.secondary));
  console.log('classifiedShare: ' + mainSummary.classifiedShare + '  unknown: ' + mainSummary.unknown);
  console.log('wall (main): ' + JSON.stringify(mainSummary.wall) + '  medianSurvival: ' + mainSummary.medianSurvival);
  if (baseSummary) {
    console.log('--- baseline leg (tableseat-nowait) ---');
    console.log('seeds: ' + baseSummary.seeds + '  files: ' + baseSummary.files +
      '  seedCallsW4: ' + baseSummary.seedCallsW4 + '  instancesOpened: ' + baseSummary.instancesOpened);
    for (const b of BUCKETS) console.log('  ' + b + ': ' + baseSummary.byBucket[b]);
    console.log('sub-reasons: ' + JSON.stringify(baseSummary.bySub));
    console.log('wall (baseline): ' + JSON.stringify(baseSummary.wall) + '  medianSurvival: ' + baseSummary.medianSurvival);
  }
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifySeed: classifySeed, summarize: summarize, corpusBarPass: corpusBarPass, BUCKETS: BUCKETS };
