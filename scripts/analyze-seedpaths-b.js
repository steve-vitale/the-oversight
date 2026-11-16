// analyze-seedpaths-b.js — classifier for arm sim-seedpaths-b (DIAG).
// Requires the poolmarginals analyzer (not copied): reuses its
// classifyMarginals for the plan-instance buckets + first-fail
// decomposition + per-member marginals, then counts ALL FOUR seed
// paths per instance and per launch from the v4seeds rows' `path`
// field (recorded by the driver wrap from the outcome + caller
// stack: 'world-tick' | 'agency-evade' | 'agency-flee' |
// 'gate-avoid', or an explicit 'unknown-*' path with the caller
// frame recorded on the row).
// Frozen definitions: evidence/2026-11-16/sim-seedpaths-b-prereg.md.
// Attribution rule (frozen): FIRST-SEEDER WINS for the headline
// count — the opening seed row's path attributes the instance; all
// firings while the instance is live are listed in the row so a
// later reader can re-count under any rule. A path counts as firing
// only when the wrap observed the actual winPlanSeedFromFight call.
// An instance is ATTRIBUTED iff its opening row's path is one of
// the four named paths; every unattributed instance carries an
// explicit reason (its opening path string + caller frame) — no
// bare `unknown`.
// Usage:
//   node scripts/analyze-seedpaths-b.js <instrumentDir> [controlDir]
// Writes evidence/2026-11-16/seedpaths-b-analysis.json. Exits 0 iff
// attribution coverage >= 0.90 on EACH leg with every unattributed
// instance reasoned, all files parse, and no instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const POOLMARGINALS = require(path.join(REPO, 'scripts', 'analyze-poolmarginals-b.js'));

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const SEED_PATHS = ['world-tick', 'agency-evade', 'agency-flee', 'gate-avoid'];
const BUCKETS = POOLMARGINALS.BUCKETS;

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
function isNamedPath(p) { return SEED_PATHS.indexOf(p) !== -1; }

// replaySeedMachine(seedRows): mirrors analyze-dawnbid-a.js
// classifySeed's seed-row state machine EXACTLY (same iteration
// order, same wave/stageAfter gates, same open/refresh/retarget
// rules) and tags each created instance with its OPENING row
// (index + row) and its CLOSING row index (the retargeting row's
// index, or null when the close comes from the census logic in
// classifySeed, which runs after this machine). Returns
// { opened: [{vid, target, seedDay, openIdx, closeIdx, openingRow}],
//   replayMismatch: null | string } — the caller matches `opened`
// against classifySeed's instances by position and reports any
// divergence as an analysis error, never silently.
function replaySeedMachine(seedRows) {
  const opened = [];
  const openByVid = {};
  let replayMismatch = null;
  function closeInstance(inst, rowIdx) {
    if (inst.closeIdx != null) return;
    inst.closeIdx = rowIdx;
    if (openByVid[inst.vid] === inst) delete openByVid[inst.vid];
  }
  for (let i = 0; i < seedRows.length; i++) {
    const s = seedRows[i];
    if ((s.wave | 0) < 3) continue;
    const stageAfter = s.stageAfter;
    if (stageAfter !== 'gear' && stageAfter !== 'party') continue;
    const open = openByVid[s.vid] || null;
    if ((s.wave | 0) < 4) {
      if (open && open.target !== s.target) closeInstance(open, i);
      continue;
    }
    if (open) {
      if (open.target === s.target) { /* refresh: same instance, same opening row */ }
      else {
        closeInstance(open, i);
        const inst = { vid: s.vid, target: s.target, seedDay: s.day, openIdx: i, closeIdx: null, openingRow: s };
        opened.push(inst);
        openByVid[s.vid] = inst;
      }
    } else {
      const inst = { vid: s.vid, target: s.target, seedDay: s.day, openIdx: i, closeIdx: null, openingRow: s };
      opened.push(inst);
      openByVid[s.vid] = inst;
    }
  }
  return { opened: opened, replayMismatch: replayMismatch };
}

// classifySeedPaths(j): poolmarginals classification + per-instance
// seed-path attribution. Attaches to each base instance:
// openingPath, openingOutcome, openingCaller, firings (all seed
// rows for the instance while live), firingPaths (distinct),
// attributed, unattributedReason.
function classifySeedPaths(j) {
  const base = POOLMARGINALS.classifyMarginals(j);
  const seedRows = (j.v4seeds || []).slice();
  const finalDay = j.gameDays || j.days || 0;
  const replay = replaySeedMachine(seedRows);
  const instances = base.instances || [];
  let replayMismatch = null;
  if (replay.opened.length !== instances.length) {
    replayMismatch = 'replay opened ' + replay.opened.length + ' instances, classifySeed opened ' + instances.length;
  } else {
    for (let i = 0; i < instances.length; i++) {
      const a = replay.opened[i], b = instances[i];
      if (a.vid !== b.vid || a.target !== b.target || a.seedDay !== b.seedDay) {
        replayMismatch = 'replay instance ' + i + ' is ' + a.vid + '/' + a.target + '/day' + a.seedDay +
          ', classifySeed instance ' + i + ' is ' + b.vid + '/' + b.target + '/day' + b.seedDay;
        break;
      }
    }
  }
  // Seed rows by path (all waves >= 3, as recorded; wave >= 4 split).
  const rowsByPath = {};
  const rowsW4ByPath = {};
  for (const p of SEED_PATHS.concat(['unknown'])) { rowsByPath[p] = 0; rowsW4ByPath[p] = 0; }
  let unknownRows = [];
  for (const s of seedRows) {
    if ((s.wave | 0) < 3) continue;
    const key = isNamedPath(s.path) ? s.path : 'unknown';
    rowsByPath[key]++;
    if ((s.wave | 0) >= 4) rowsW4ByPath[key]++;
    if (key === 'unknown') unknownRows.push({ day: s.day, vid: s.vid, mid: s.mid, wave: s.wave, outcome: s.outcome || null, path: s.path || null, caller: s.caller || null });
  }
  // First world-tick seed day (the stricter D3 read: the instrument
  // leg's first possible divergence cause is the first WORLD-TICK
  // seed, not the first seed of any path).
  let firstWorldTickDay = null;
  for (const s of seedRows) {
    if (s.path === 'world-tick' && (firstWorldTickDay == null || s.day < firstWorldTickDay)) firstWorldTickDay = s.day;
  }

  const attributedInstances = [];
  const unattributedInstances = [];
  const instancesByFirstSeeder = {};
  const launchesByFirstSeeder = {};
  for (const p of SEED_PATHS.concat(['unknown'])) { instancesByFirstSeeder[p] = 0; launchesByFirstSeeder[p] = 0; }
  let multiPathInstances = 0;
  const launches = [];
  for (let i = 0; i < instances.length; i++) {
    const inst = instances[i];
    const rep = replay.opened[i] || null;
    const openingRow = rep ? rep.openingRow : null;
    const openingPath = openingRow ? (openingRow.path || null) : null;
    const attributed = isNamedPath(openingPath);
    // Firings: seed rows at/after the opening row, before the
    // retargeting close row (if any), same vid, post-call target
    // == instance target, day within the instance's life. The
    // opening row itself is the first firing.
    const firings = [];
    const firingPaths = [];
    if (rep) {
      const closeIdx = rep.closeIdx == null ? Infinity : rep.closeIdx;
      const closeDay = inst.closeDay == null ? finalDay : inst.closeDay;
      for (let k = rep.openIdx; k < seedRows.length && k < closeIdx; k++) {
        const s = seedRows[k];
        if (s.vid !== inst.vid) continue;
        if (s.target !== inst.target) continue;
        if (s.day > closeDay) continue;
        firings.push({ day: s.day, path: s.path || null, outcome: s.outcome || null, mid: s.mid, wave: s.wave, stageAfter: s.stageAfter || null });
        if (firingPaths.indexOf(s.path) === -1) firingPaths.push(s.path || null);
      }
    }
    if (firingPaths.filter(function (p) { return isNamedPath(p); }).length >= 2) multiPathInstances++;
    inst.openingPath = openingPath;
    inst.openingOutcome = openingRow ? (openingRow.outcome || null) : null;
    inst.openingCaller = openingRow ? (openingRow.caller || null) : null;
    inst.openingRowIdx = rep ? rep.openIdx : null;
    inst.firings = firings;
    inst.firingPaths = firingPaths;
    inst.firstSeeder = openingPath;
    inst.attributed = attributed;
    inst.unattributedReason = null;
    if (!attributed) {
      inst.unattributedReason = openingRow
        ? ('opening-path ' + String(openingPath) + ' caller ' + String(openingRow.caller || 'none'))
        : 'no opening row found in replay (replay mismatch)';
      unattributedInstances.push({ vid: inst.vid, target: inst.target, seedDay: inst.seedDay, bucket: inst.bucket,
        reason: inst.unattributedReason, firings: firings.length });
    } else {
      attributedInstances.push(inst);
    }
    const bucketKey = attributed ? openingPath : 'unknown';
    instancesByFirstSeeder[bucketKey]++;
    if (inst.bucket === 'launched') {
      launchesByFirstSeeder[bucketKey]++;
      let companion = null;
      try {
        const res = (inst.resolved || []).find(function (r) { return r.outcome === 'launched'; });
        companion = res ? (res.companion || null) : null;
      } catch (e) {}
      launches.push({ vid: inst.vid, target: inst.target, seedDay: inst.seedDay, firstSeeder: openingPath,
        firingPaths: firingPaths, companion: companion });
    }
  }
  const coverage = instances.length ? round(attributedInstances.length / instances.length, 4) : null;
  return Object.assign({}, base, {
    replayMismatch: replayMismatch,
    seedRowsByPath: rowsByPath,
    seedRowsW4ByPath: rowsW4ByPath,
    unknownSeedRows: unknownRows,
    firstWorldTickDay: firstWorldTickDay,
    instancesByFirstSeeder: instancesByFirstSeeder,
    launchesByFirstSeeder: launchesByFirstSeeder,
    launches: launches,
    multiPathInstances: multiPathInstances,
    attributedInstances: attributedInstances.length,
    unattributedInstances: unattributedInstances,
    attributionCoverage: coverage,
  });
}

function summarizeSeedPaths(leg) {
  const marginal = POOLMARGINALS.summarizeMarginals(leg);
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const rowsByPath = {};
  const rowsW4ByPath = {};
  const instancesByFirstSeeder = {};
  const launchesByFirstSeeder = {};
  for (const p of SEED_PATHS.concat(['unknown'])) {
    rowsByPath[p] = 0; rowsW4ByPath[p] = 0; instancesByFirstSeeder[p] = 0; launchesByFirstSeeder[p] = 0;
  }
  let instances = 0, attributed = 0, unattributed = 0, launches = 0, multiPath = 0, unknownRows = 0;
  const unattributedList = [];
  const perSeed = [];
  let replayMismatch = null;
  for (const s of seeds) {
    instances += s.instancesOpened;
    attributed += s.attributedInstances;
    unattributed += s.unattributedInstances.length;
    launches += s.launches.length;
    multiPath += s.multiPathInstances;
    unknownRows += s.unknownSeedRows.length;
    if (s.replayMismatch && !replayMismatch) replayMismatch = 'seed ' + s.seed + ': ' + s.replayMismatch;
    for (const p of Object.keys(rowsByPath)) {
      rowsByPath[p] += s.seedRowsByPath[p] || 0;
      rowsW4ByPath[p] += s.seedRowsW4ByPath[p] || 0;
      instancesByFirstSeeder[p] += s.instancesByFirstSeeder[p] || 0;
      launchesByFirstSeeder[p] += s.launchesByFirstSeeder[p] || 0;
    }
    for (const u of s.unattributedInstances) unattributedList.push(Object.assign({ seed: s.seed }, u));
    perSeed.push({ seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
      standing: s.standing, scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
      seedCallsW4: s.seedCallsW4, instancesOpened: s.instancesOpened,
      attributedInstances: s.attributedInstances, unattributedInstances: s.unattributedInstances.length,
      attributionCoverage: s.attributionCoverage,
      instancesByFirstSeeder: s.instancesByFirstSeeder, launches: s.launches.length,
      launchesByFirstSeeder: s.launchesByFirstSeeder,
      seedRowsByPath: s.seedRowsByPath, seedRowsW4ByPath: s.seedRowsW4ByPath,
      firstWorldTickDay: s.firstWorldTickDay,
      scoredDawns: s.marginalScoredDawns, classifiedDawns: s.marginalClassifiedDawns,
      unknownDawns: s.marginalUnknownDawns, byBucket: s.byBucket });
  }
  const coverage = instances ? round(attributed / instances, 4) : null;
  // Every unattributed instance must carry an explicit, non-bare reason.
  const bareUnknown = unattributedList.filter(function (u) {
    return !u.reason || u.reason === 'unknown' || u.reason === 'null';
  });
  return {
    marginals: marginal,
    seedRowsByPath: rowsByPath,
    seedRowsW4ByPath: rowsW4ByPath,
    unknownSeedRows: unknownRows,
    instancesOpened: instances,
    attributedInstances: attributed,
    unattributedInstances: unattributed,
    unattributedList: unattributedList,
    bareUnknownReasons: bareUnknown.length,
    attributionCoverage: coverage,
    instancesByFirstSeeder: instancesByFirstSeeder,
    launchesByFirstSeeder: launchesByFirstSeeder,
    launches: launches,
    multiPathInstances: multiPath,
    replayMismatch: replayMismatch,
    wall: marginal.wall,
    medianSurvival: marginal.medianSurvival,
    perSeed: perSeed,
  };
}

function main() {
  const instrumentDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  if (!instrumentDir) { console.error('SEEDPATHS ANALYZE STOP: instrumentDir required.'); process.exit(2); }
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
  for (const k of Object.keys(inst.bySeed)) inst.bySeed[k] = classifySeedPaths(inst.bySeed[k]);
  const instSummary = summarizeSeedPaths(inst);
  let ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    for (const k of Object.keys(ctrl.bySeed)) ctrl.bySeed[k] = classifySeedPaths(ctrl.bySeed[k]);
    ctrlSummary = summarizeSeedPaths(ctrl);
  }
  const instErrors = instSummary.marginals.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.marginals.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  // GO bar 1: >=90% attributed on EACH leg (a leg with zero instances
  // is vacuous — reported, not failed — since there is nothing to
  // attribute). GO bar 2: every unattributed instance reasoned.
  function coveragePass(summary) {
    if (!summary) return true;
    if (summary.instancesOpened === 0) return true;
    return summary.attributionCoverage >= 0.9;
  }
  function reasonsPass(summary) {
    if (!summary) return true;
    return summary.bareUnknownReasons === 0 && summary.replayMismatch == null;
  }
  const bar1 = coveragePass(instSummary) && coveragePass(ctrlSummary) &&
    reasonsPass(instSummary) && reasonsPass(ctrlSummary);
  const bar2 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.marginals.firstFail.files === 8);
  const bar3 = instErrors === 0 && ctrlErrors === 0;

  const out = {
    arm: 'seedpaths-b', run: 'seedpaths-b',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: instSummary, control: ctrlSummary,
    bars: {
      attribution: { pass: bar1,
        instrumentCoverage: instSummary.attributionCoverage, instrumentInstances: instSummary.instancesOpened,
        instrumentAttributed: instSummary.attributedInstances, instrumentUnattributed: instSummary.unattributedInstances,
        controlCoverage: ctrlSummary ? ctrlSummary.attributionCoverage : null,
        controlInstances: ctrlSummary ? ctrlSummary.instancesOpened : null,
        bareUnknownReasons: instSummary.bareUnknownReasons + (ctrlSummary ? ctrlSummary.bareUnknownReasons : 0),
        replayMismatch: instSummary.replayMismatch || (ctrlSummary ? ctrlSummary.replayMismatch : null) },
      corpus: { pass: bar2, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.marginals.firstFail.files : null },
      instrumentErrors: { pass: bar3, instrument: instErrors, control: ctrlErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'seedpaths-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  function printLeg(name, sum) {
    const ff = sum.marginals.firstFail;
    console.log('=== seedpaths-b ' + name + ' leg ===');
    console.log('seeds: ' + ff.seeds + '  files: ' + ff.files +
      '  seedCallsW4: ' + ff.seedCallsW4 + '  instancesOpened: ' + sum.instancesOpened +
      '  scoredDawns: ' + sum.marginals.marginalScoredDawns + '  marginal-classified: ' + sum.marginals.marginalClassifiedDawns +
      '  unknownDawns: ' + sum.marginals.marginalUnknownDawns);
    console.log('seed rows by path (wave>=3): ' + JSON.stringify(sum.seedRowsByPath));
    console.log('seed rows by path (wave>=4): ' + JSON.stringify(sum.seedRowsW4ByPath));
    console.log('instances by first-seeder: ' + JSON.stringify(sum.instancesByFirstSeeder) +
      '  coverage: ' + sum.attributionCoverage + ' (' + sum.attributedInstances + '/' + sum.instancesOpened + ')' +
      '  unattributed: ' + sum.unattributedInstances + '  multi-path instances: ' + sum.multiPathInstances);
    console.log('launches by first-seeder: ' + JSON.stringify(sum.launchesByFirstSeeder) + '  launches: ' + sum.launches);
    console.log('wall: ' + JSON.stringify(sum.wall) + '  medianSurvival: ' + sum.medianSurvival);
    if (sum.unattributedList.length) console.log('unattributed instances: ' + JSON.stringify(sum.unattributedList));
    if (sum.replayMismatch) console.log('REPLAY MISMATCH: ' + sum.replayMismatch);
  }
  printLeg('instrument', instSummary);
  if (ctrlSummary) printLeg('control', ctrlSummary);
  console.log('bars: attribution=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifySeedPaths: classifySeedPaths, summarizeSeedPaths: summarizeSeedPaths, replaySeedMachine: replaySeedMachine, SEED_PATHS: SEED_PATHS };
