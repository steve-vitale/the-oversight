// analyze-launchfunnel-b.js — survey ranker for arm sim-launchfunnel-b
// (DIAG survey: screen fresh 8-seed bands for a launch-rich band to
// designate for the dmgshape/partysurvive re-runs; finding #2604).
// For each band dir (8 per-seed corpus files from
// scripts/launchfunnel-driver-20261119.js) it reports the established
// launch counts — analyze-partyquads-b.js summarizeLeg: launches =
// v4departs rows with result 'launch' and targetWave >= 4 (one row
// per launch: the brain/winPlan depart paths are exclusive in
// villager-agency.js, so no double count), quadLaunches = launches
// with partySize >= 4 — plus the launchfunnel-a funnel taxonomy
// (analyze-launchfunnel-a.js funnelForSeed/summarize) for binding
// stage, pool, and 0-unknown completeness, and the wall numbers.
// Ranks bands by launches desc, quadLaunches desc, joined quad
// meetings desc, median survival desc.
// GO (frozen in the prereg): the best band has >= 6 wave-4+ launches
// AND >= 2 quad launches per 8 seeds AND the funnel taxonomy is
// complete (0 unknown) on ALL screened bands.
// Usage:
//   node scripts/analyze-launchfunnel-b.js <bandDir1> [bandDir2 ...]
// Writes evidence/2026-11-19/launchfunnel-b-survey.json. Exits 0 iff
// GO; on NO-GO it still writes the JSON and exits 1 (same pattern as
// the launchfunnel-a analyzer).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PQ = require(path.join(REPO, 'scripts', 'analyze-partyquads-b.js'));
const LF = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-a.js'));

const GO_LAUNCHES = 6;
const GO_QUADS = 2;

function bandOf(dir) {
  const abs = path.isAbsolute(dir) ? dir : path.join(REPO, dir);
  const files = fs.existsSync(abs) ? fs.readdirSync(abs).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const leg = PQ.summarizeLeg(abs);
  // Funnel taxonomy per seed file (launchfunnel-a instrument, reused).
  let instancesOpened = 0, unknown = 0;
  const byFunnel = {};
  for (const b of LF.FUNNEL_BUCKETS) byFunnel[b] = 0;
  const launchedSizes = {};
  const poolDist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
  let joinedQuadMeetings = 0, launchedInstances = 0;
  let bindingStage = null, bindingCount = 0;
  const perSeedFunnel = [];
  for (const f of files) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8')); }
    catch (e) { unknown++; continue; }
    const r = LF.funnelForSeed(j);
    instancesOpened += r.instancesOpened;
    for (const b of LF.FUNNEL_BUCKETS) byFunnel[b] += r.byFunnel[b] || 0;
    for (const k of Object.keys(r.launchedSizes || {})) launchedSizes[k] = (launchedSizes[k] || 0) + r.launchedSizes[k];
    poolDist.dawns += r.poolDist.dawns; poolDist.eligible0 += r.poolDist.eligible0;
    poolDist.eligible1 += r.poolDist.eligible1; poolDist.eligible2 += r.poolDist.eligible2;
    poolDist.eligible3plus += r.poolDist.eligible3plus;
    for (const inst of (r.instances || [])) {
      if (inst.funnelBucket === 'unknown') unknown++;
      if (inst.funnelBucket && inst.funnelBucket.indexOf('launched-') === 0) {
        launchedInstances++;
        if ((inst.launchPartySize | 0) >= 4 && (inst.meetings || []).length) joinedQuadMeetings += inst.meetings.length;
      }
    }
    perSeedFunnel.push({ seed: j.seed, instancesOpened: r.instancesOpened, byFunnel: r.byFunnel,
      launchedSizes: r.launchedSizes, poolDawns: r.poolDist.dawns, poolEligible0: r.poolDist.eligible0 });
  }
  // Binding stage: largest leak bucket among the dying stages.
  const LEAKS = ['candidate-not-bid', 'bid-not-selected', 'selected-blocked',
    'plan-churned-before-dawn', 'launched-no-meeting', 'launched-fought-no-kill'];
  for (const b of LEAKS) {
    if ((byFunnel[b] || 0) > bindingCount) { bindingCount = byFunnel[b]; bindingStage = b; }
  }
  const seeds = leg.perSeed.map(function (r) { return r.seed; }).sort(function (a, b) { return a - b; });
  return {
    dir: path.basename(abs), files: files.length, seeds: seeds,
    launches: leg.launches, trioLaunches: leg.trioLaunches,
    quadLaunches: leg.quadLaunches, partyQuads: leg.partyQuads,
    sizes: leg.sizes, sources: leg.sources,
    errors: leg.errors, valid: leg.valid,
    perSeed: leg.perSeed, wall: leg.wall,
    instancesOpened: instancesOpened, launchedInstances: launchedInstances,
    byFunnel: byFunnel, unknown: unknown,
    taxonomyComplete: unknown === 0 && instancesOpened > 0,
    bindingStage: bindingStage, bindingCount: bindingCount,
    poolDist: poolDist, launchedSizes: launchedSizes,
    joinedQuadMeetings: joinedQuadMeetings, perSeedFunnel: perSeedFunnel,
  };
}

function rankBands(bands) {
  return bands.slice().sort(function (a, b) {
    if (b.launches !== a.launches) return b.launches - a.launches;
    if (b.quadLaunches !== a.quadLaunches) return b.quadLaunches - a.quadLaunches;
    if (b.joinedQuadMeetings !== a.joinedQuadMeetings) return b.joinedQuadMeetings - a.joinedQuadMeetings;
    const ma = (a.wall && a.wall.medianDays) || 0, mb = (b.wall && b.wall.medianDays) || 0;
    return mb - ma;
  });
}

function main() {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error('LAUNCHFUNNEL-B ANALYZE STOP: at least one band dir required.'); process.exit(2); }
  const bands = dirs.map(bandOf);
  const ranked = rankBands(bands);
  const best = ranked[0];
  const allTaxonomy = bands.every(function (b) { return b.unknown === 0; });
  const allFilesOk = bands.every(function (b) { return b.files === 8 && b.valid === 8 && b.errors === 0; });
  const go = !!best && best.launches >= GO_LAUNCHES && best.quadLaunches >= GO_QUADS && allTaxonomy && allFilesOk;
  const out = {
    arm: 'launchfunnel-b', run: 'launchfunnel-b',
    goLaunches: GO_LAUNCHES, goQuads: GO_QUADS,
    bands: bands, ranking: ranked.map(function (b) { return b.dir; }),
    best: best ? { dir: best.dir, seeds: best.seeds, launches: best.launches, quadLaunches: best.quadLaunches,
      joinedQuadMeetings: best.joinedQuadMeetings, bindingStage: best.bindingStage } : null,
    bars: {
      launchRich: { pass: !!best && best.launches >= GO_LAUNCHES && best.quadLaunches >= GO_QUADS,
        bestLaunches: best ? best.launches : null, bestQuads: best ? best.quadLaunches : null,
        floorLaunches: GO_LAUNCHES, floorQuads: GO_QUADS },
      taxonomy: { pass: allTaxonomy, unknownByBand: bands.map(function (b) { return { dir: b.dir, unknown: b.unknown }; }) },
      instrument: { pass: allFilesOk, filesByBand: bands.map(function (b) { return { dir: b.dir, files: b.files, valid: b.valid, errors: b.errors }; }) },
    },
    verdict: go ? 'GO' : 'NO-GO',
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-19', 'launchfunnel-b-survey.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  for (const b of bands) {
    console.log('band ' + b.dir + ' seeds ' + (b.seeds.join(',') || '?') +
      ' launches=' + b.launches + ' quads=' + b.quadLaunches + ' trios=' + b.trioLaunches +
      ' partyQuads=' + b.partyQuads + ' instances=' + b.instancesOpened +
      ' launchedInst=' + b.launchedInstances + ' joinedQuadMtgs=' + b.joinedQuadMeetings +
      ' binding=' + b.bindingStage + '(' + b.bindingCount + ')' + ' unknown=' + b.unknown +
      ' wall=' + JSON.stringify(b.wall));
  }
  console.log('ranking: ' + ranked.map(function (b) { return b.dir; }).join(' > '));
  console.log('best: ' + (best ? best.dir + ' seeds ' + best.seeds.join('-') : 'none'));
  console.log('bars: launchRich=' + (out.bars.launchRich.pass ? 'PASS' : 'FAIL') +
    ' taxonomy=' + (out.bars.taxonomy.pass ? 'PASS' : 'FAIL') +
    ' instrument=' + (out.bars.instrument.pass ? 'PASS' : 'FAIL'));
  console.log('VERDICT: ' + out.verdict);
  console.log('survey: ' + path.relative(REPO, outFile));
  if (!go) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { bandOf: bandOf, rankBands: rankBands, GO_LAUNCHES: GO_LAUNCHES, GO_QUADS: GO_QUADS };
