// analyze-dmgcheck-b.js — survey ranker for arm sim-dmgcheck-b
// (DIAG check, finding #2627: re-run the dmgsurvey instrument
// verbatim on its designated band 106181–106188 on current master,
// to decide whether the 1530Z launch collapse was band variance
// or a base regression. No game-code change, no default flipped.)
// For each band dir (8 per-seed corpus files from
// scripts/dmgcheck-driver-b.js) it reports the established launch
// counts — analyze-launchfunnel-b.js bandOf: launches =
// v4departs rows with result 'launch' and targetWave >= 4, quad
// launches = launches with partySize >= 4 — plus the first-fight
// join (analyze-dmgshape-rerun-b.js launchesOf/firstFight,
// imported — not copied): for each launch, the earliest
// v4encounters row with mid === launch.target, day in
// [launch.day, launch.day+21], fought (rounds > 0 or mDealt > 0),
// ANY origin, ANY fighter. Ranks bands by firstFights desc,
// launches desc, quadLaunches desc, median survival desc.
// DECISION (frozen in the prereg, judged against the dmgsurvey
// designation on this same band: 16 launches, 9 first-fights,
// 6 fled): launches >= 12 AND first-fights >= 6 → BAND VARIANCE;
// launches <= 8 OR first-fights <= 3 → BASE REGRESSION (report
// the call for a bisect of 057bfa60f..e103a64cc — do NOT bisect
// here); between the bars → INCONCLUSIVE, never re-scored. The
// survey `judge` (first-fight floor + taxonomy + instrument) is
// kept verbatim for instrument-validity reporting.
// The survey judges COUNTS only — no decomposition (survey corpora
// carry no roundsDetail; the re-run decomposes on its own corpora).
// Usage:
//   node scripts/analyze-dmgcheck-b.js <bandDir1> [bandDir2 ...]
//   node scripts/analyze-dmgcheck-b.js --selftest
// Writes evidence/2026-11-20/dmgcheck-b-survey.json. Exits 0 iff
// the verdict is BAND VARIANCE; on BASE REGRESSION or INCONCLUSIVE
// it still writes the JSON and exits 1 (both need coordinator
// action — same pattern as the launchfunnel-b analyzer).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LFB = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-b.js'));
const DSR = require(path.join(REPO, 'scripts', 'analyze-dmgshape-rerun-b.js'));

const GO_FIRST_FIGHTS = 6;

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 120; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return true;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) {
      if (i === 119) return false;
      sleepMs(1000);
    }
  }
  return false;
}

// First-fight stats for one band dir: per-seed launches -> first
// fights (DSR join), aggregated. Returns null when the dir has no
// readable corpus files.
function firstFightStats(dir) {
  const abs = path.isAbsolute(dir) ? dir : path.join(REPO, dir);
  const files = fs.existsSync(abs) ? fs.readdirSync(abs).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let rows = [];
  let errors = 0, filesRead = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8')); } catch (e) { continue; }
    filesRead++;
    errors += ((d.instrumentErrors || []).length);
    const launches = DSR.launchesOf(d);
    const seedRows = [];
    for (const launch of launches) {
      const fight = DSR.firstFight(d, launch);
      seedRows.push({ seed: d.seed, launch: launch, fight: fight || null,
        sameDay: !!fight && fight.day === launch.day });
    }
    rows = rows.concat(seedRows);
    perSeed.push({ seed: d.seed, launches: launches.length,
      firstFights: seedRows.filter(function (r) { return !!r.fight; }).length,
      fled: seedRows.filter(function (r) { return r.fight && r.fight.outcome === 'vFlee'; }).length,
      killed: seedRows.filter(function (r) { return r.fight && r.fight.outcome === 'vKill'; }).length,
      died: seedRows.filter(function (r) { return r.fight && r.fight.outcome === 'vDie'; }).length,
      other: seedRows.filter(function (r) { return r.fight && ['vFlee', 'vKill', 'vDie'].indexOf(r.fight.outcome) === -1; }).length,
      noFight: seedRows.filter(function (r) { return !r.fight; }).length });
  }
  const firstFights = rows.filter(function (r) { return !!r.fight; });
  const distinctKeys = {};
  for (const r of firstFights) {
    distinctKeys[[r.seed, r.fight.day, r.fight.mid, r.fight.vid].join('|')] = true;
  }
  const byOrigin = {};
  const byOutcome = {};
  for (const r of firstFights) {
    byOrigin[r.fight.origin || 'null'] = (byOrigin[r.fight.origin || 'null'] || 0) + 1;
    byOutcome[r.fight.outcome || 'null'] = (byOutcome[r.fight.outcome || 'null'] || 0) + 1;
  }
  return { files: filesRead, errors: errors, perSeed: perSeed, rows: rows,
    launches: rows.length,
    firstFights: firstFights.length, distinctFirstFights: Object.keys(distinctKeys).length,
    fled: firstFights.filter(function (r) { return r.fight.outcome === 'vFlee'; }).length,
    killed: firstFights.filter(function (r) { return r.fight.outcome === 'vKill'; }).length,
    died: firstFights.filter(function (r) { return r.fight.outcome === 'vDie'; }).length,
    other: firstFights.filter(function (r) { return ['vFlee', 'vKill', 'vDie'].indexOf(r.fight.outcome) === -1; }).length,
    noFight: rows.length - firstFights.length,
    sameDayFirstFights: firstFights.filter(function (r) { return r.sameDay; }).length,
    byOrigin: byOrigin, byOutcome: byOutcome };
}

function bandOf(dir) {
  const base = LFB.bandOf(dir);
  const ff = firstFightStats(dir);
  return Object.assign({}, base, {
    firstFights: ff.firstFights, distinctFirstFights: ff.distinctFirstFights,
    fledFirstFights: ff.fled, killedFirstFights: ff.killed,
    diedFirstFights: ff.died, otherFirstFights: ff.other,
    launchesNoFight: ff.noFight, sameDayFirstFights: ff.sameDayFirstFights,
    firstFightByOrigin: ff.byOrigin, firstFightByOutcome: ff.byOutcome,
    perSeedFirstFights: ff.perSeed, firstFightRows: ff.rows,
  });
}

function rankBands(bands) {
  return bands.slice().sort(function (a, b) {
    if (b.firstFights !== a.firstFights) return b.firstFights - a.firstFights;
    if (b.launches !== a.launches) return b.launches - a.launches;
    if (b.quadLaunches !== a.quadLaunches) return b.quadLaunches - a.quadLaunches;
    const ma = (a.wall && a.wall.medianDays) || 0, mb = (b.wall && b.wall.medianDays) || 0;
    return mb - ma;
  });
}

function judge(bands, ranked) {
  const best = ranked[0];
  const allTaxonomy = bands.every(function (b) { return b.unknown === 0; });
  const allFilesOk = bands.every(function (b) { return b.files === 8 && b.valid === 8 && b.errors === 0; });
  const go = !!best && best.firstFights >= GO_FIRST_FIGHTS && allTaxonomy && allFilesOk;
  return { go: go,
    bars: {
      firstFightRich: { pass: !!best && best.firstFights >= GO_FIRST_FIGHTS,
        bestFirstFights: best ? best.firstFights : null, floorFirstFights: GO_FIRST_FIGHTS,
        bestLaunches: best ? best.launches : null, bestQuads: best ? best.quadLaunches : null },
      taxonomy: { pass: allTaxonomy, unknownByBand: bands.map(function (b) { return { dir: b.dir, unknown: b.unknown }; }) },
      instrument: { pass: allFilesOk, filesByBand: bands.map(function (b) { return { dir: b.dir, files: b.files, valid: b.valid, errors: b.errors }; }) },
    },
    verdict: go ? 'GO' : 'NO-GO',
    best: best ? { dir: best.dir, seeds: best.seeds, firstFights: best.firstFights,
      distinctFirstFights: best.distinctFirstFights, launches: best.launches,
      quadLaunches: best.quadLaunches, fled: best.fledFirstFights, killed: best.killedFirstFights } : null,
  };
}

// Three-way dmgcheck verdict (frozen in the prereg), judged against
// the dmgsurvey designation on this same band (16 launches, 9
// first-fights, 6 fled). `band` is the ranked-best band object
// (launches + firstFights). Returns the verdict string plus the
// bar that fired, for the JSON record.
function dmgcheckVerdict(band) {
  if (!band) return { verdict: 'INCONCLUSIVE', bar: 'no-band', launches: null, firstFights: null };
  const launches = band.launches, firstFights = band.firstFights;
  if (launches >= 12 && firstFights >= 6) {
    return { verdict: 'BAND VARIANCE', bar: 'launches>=12 AND firstFights>=6', launches: launches, firstFights: firstFights };
  }
  if (launches <= 8 || firstFights <= 3) {
    return { verdict: 'BASE REGRESSION', bar: launches <= 8 ? 'launches<=8' : 'firstFights<=3', launches: launches, firstFights: firstFights };
  }
  return { verdict: 'INCONCLUSIVE', bar: 'between the bars', launches: launches, firstFights: firstFights };
}

function main() {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error('DMGCHECK ANALYZE STOP: at least one band dir required.'); process.exit(2); }
  const bands = dirs.map(bandOf);
  const ranked = rankBands(bands);
  const j = judge(bands, ranked);
  const dc = dmgcheckVerdict(j.best);
  const out = {
    arm: 'dmgcheck-b', run: 'dmgcheck-b',
    goFirstFights: GO_FIRST_FIGHTS,
    designationReference: { band: '106181-106188', launches: 16, firstFights: 9, fled: 6, source: 'sim-dmgsurvey-b' },
    bands: bands, ranking: ranked.map(function (b) { return b.dir; }),
    best: j.best, bars: j.bars, verdict: j.verdict,
    dmgcheck: dc,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-20', 'dmgcheck-b-survey.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const wrote = writeRobust(outFile, JSON.stringify(out, null, 2) + '\n');
  for (const b of bands) {
    console.log('band ' + b.dir + ' seeds ' + (b.seeds.join(',') || '?') +
      ' launches=' + b.launches + ' firstFights=' + b.firstFights +
      ' distinct=' + b.distinctFirstFights + ' fled=' + b.fledFirstFights +
      ' killed=' + b.killedFirstFights + ' noFight=' + b.launchesNoFight +
      ' quads=' + b.quadLaunches + ' trios=' + b.trioLaunches +
      ' instances=' + b.instancesOpened +
      ' binding=' + b.bindingStage + '(' + b.bindingCount + ')' + ' unknown=' + b.unknown +
      ' wall=' + JSON.stringify(b.wall));
  }
  console.log('ranking: ' + ranked.map(function (b) { return b.dir; }).join(' > '));
  console.log('best: ' + (j.best ? j.best.dir + ' seeds ' + j.best.seeds.join('-') : 'none'));
  console.log('bars: firstFightRich=' + (j.bars.firstFightRich.pass ? 'PASS' : 'FAIL') +
    ' taxonomy=' + (j.bars.taxonomy.pass ? 'PASS' : 'FAIL') +
    ' instrument=' + (j.bars.instrument.pass ? 'PASS' : 'FAIL'));
  console.log('VERDICT: ' + j.verdict);
  console.log('DMGCHECK: ' + dc.verdict + ' (' + dc.bar + ') launches=' + dc.launches + ' firstFights=' + dc.firstFights);
  console.log('survey: ' + path.relative(REPO, outFile) + (wrote ? '' : ' (WRITE FAILED — flap)'));
  if (dc.verdict !== 'BAND VARIANCE') process.exitCode = 1;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A FIRST-FIGHT COUNTING (synthetic per-seed docs; DSR join only —
  // no decomposition: survey corpora carry no roundsDetail).
  function mkEnc(day, vid, mid, origin, outcome, rounds, mDealt) {
    return { day: day, vid: vid, mid: mid, wave: 4, origin: origin, outcome: outcome,
      rounds: rounds, mDealt: mDealt, log: [] };
  }
  function mkLaunch(day, vid, target, wave, partySize) {
    return { day: day, vid: vid, result: 'launch', target: target, targetWave: wave || 4,
      party: ['c1', 'c2'], partySize: partySize || 3, source: 'brain' };
  }
  const d = {
    seed: 999001,
    instrumentErrors: [],
    v4departs: [
      mkLaunch(10, 'h1', 'eater'),
      mkLaunch(20, 'h2', 'audit'),
      mkLaunch(30, 'h3', 'herald'),
      mkLaunch(40, 'h4', 'reunion'),
      mkLaunch(42, 'h5', 'reunion'),
      mkLaunch(50, 'h6', 'eulogy'),
      mkLaunch(60, 'h7', 'cancellation', 5),
      mkLaunch(70, 'h8', 'strike', 4, 4),
    ],
    v4encounters: [
      mkEnc(9, 'h1', 'eater', 'world-tick', 'vFlee', 2, 30),
      mkEnc(10, 'x1', 'eater', 'world-tick', 'vFlee', 3, 95),
      mkEnc(12, 'h1', 'eater', 'expedition', 'vFlee', 4, 120),
      mkEnc(25, 'h2', 'audit', 'aid', 'vKill', 6, 400),
      mkEnc(45, 'h4', 'reunion', 'expedition', 'vFlee', 5, 200),
      mkEnc(52, 'h6', 'eulogy', 'world-tick', 'vFlee', 0, 0),
      mkEnc(55, 'h6', 'eulogy', 'aid', 'vFlee', 1, 0),
      mkEnc(80, 'h7', 'cancellation', 'world-tick', 'vFlee', 3, 90),
    ],
  };
  const launches = DSR.launchesOf(d);
  check('§A eight launches counted (incl. wave-5 + quad)', launches.length === 8, launches.length);
  const ff = {};
  for (const l of launches) ff[l.vid] = DSR.firstFight(d, l);
  check('§A h1: same-day world-tick fight by another party is the first fight',
    !!ff.h1 && ff.h1.day === 10 && ff.h1.origin === 'world-tick' && ff.h1.mDealt === 95, ff.h1);
  check('§A h2: aid kill on d25 is the first fight',
    !!ff.h2 && ff.h2.day === 25 && ff.h2.outcome === 'vKill', ff.h2);
  check('§A h3: no herald fight in window, no first fight', ff.h3 === null, ff.h3);
  check('§A h4+h5 share one first fight (d45 reunion)',
    !!ff.h4 && !!ff.h5 && ff.h4 === ff.h5 && ff.h4.day === 45,
    { h4: ff.h4 && ff.h4.day, h5: ff.h5 && ff.h5.day });
  check('§A h6: no-contact evade skipped, 0-damage aid fight on d55 is the first fight',
    !!ff.h6 && ff.h6.day === 55 && ff.h6.mDealt === 0, ff.h6);
  check('§A h7: wave-5 cancellation fight on d80 is inside the 21-day window',
    !!ff.h7 && ff.h7.day === 80 && ff.h7.mid === 'cancellation', ff.h7);
  check('§A h8: quad launch with no strike fight has no first fight', ff.h8 === null, ff.h8);
  // §B RANKING: firstFights leads, then launches, then quads.
  function mkBand(dir, firstFights, launches, quads, medianDays) {
    return { dir: dir, firstFights: firstFights, launches: launches, quadLaunches: quads,
      wall: { medianDays: medianDays } };
  }
  let r = rankBands([
    mkBand('b-low', 3, 12, 5, 150),
    mkBand('b-mid', 6, 8, 2, 140),
    mkBand('b-high', 9, 7, 1, 130),
  ]);
  check('§B ranking leads on firstFights (9 > 6 > 3) even when launches run the other way',
    r.map(function (b) { return b.dir; }).join(',') === 'b-high,b-mid,b-low', r.map(function (b) { return b.dir; }));
  r = rankBands([
    mkBand('b-a', 6, 8, 3, 150),
    mkBand('b-b', 6, 10, 1, 150),
  ]);
  check('§B tie on firstFights breaks on launches (10 > 8)',
    r[0].dir === 'b-b', r.map(function (b) { return b.dir; }));
  r = rankBands([
    mkBand('b-a', 6, 8, 1, 150),
    mkBand('b-b', 6, 8, 4, 140),
  ]);
  check('§B tie on firstFights+launches breaks on quads (4 > 1)',
    r[0].dir === 'b-b', r.map(function (b) { return b.dir; }));
  // §C JUDGE fixtures.
  function mkJudgeBand(dir, firstFights, unknown, files, valid, errors) {
    return { dir: dir, seeds: [1], firstFights: firstFights, launches: 8, quadLaunches: 2,
      distinctFirstFights: firstFights, fledFirstFights: 3, killedFirstFights: 0,
      unknown: unknown, files: files, valid: valid, errors: errors, wall: { medianDays: 150 } };
  }
  let j = judge([mkJudgeBand('b1', 7, 0, 8, 8, 0)], rankBands([mkJudgeBand('b1', 7, 0, 8, 8, 0)]));
  check('§C judge GO at 7 first-fights, 0 unknown, 8/8 files',
    j.go === true && j.verdict === 'GO', JSON.stringify(j));
  j = judge([mkJudgeBand('b1', 5, 0, 8, 8, 0)], rankBands([mkJudgeBand('b1', 5, 0, 8, 8, 0)]));
  check('§C judge NO-GO below the first-fight floor (5 < 6)',
    j.go === false && j.verdict === 'NO-GO' && j.bars.firstFightRich.pass === false, JSON.stringify(j));
  j = judge([mkJudgeBand('b1', 8, 1, 8, 8, 0)], rankBands([mkJudgeBand('b1', 8, 1, 8, 8, 0)]));
  check('§C judge NO-GO on taxonomy unknown (1) even with 8 first-fights',
    j.go === false && j.bars.taxonomy.pass === false, JSON.stringify(j));
  j = judge([mkJudgeBand('b1', 8, 0, 7, 7, 0)], rankBands([mkJudgeBand('b1', 8, 0, 7, 7, 0)]));
  check('§C judge NO-GO on 7/8 files',
    j.go === false && j.bars.instrument.pass === false, JSON.stringify(j));
  j = judge([mkJudgeBand('b1', 8, 0, 8, 8, 1)], rankBands([mkJudgeBand('b1', 8, 0, 8, 8, 1)]));
  check('§C judge NO-GO on 1 instrument error',
    j.go === false && j.bars.instrument.pass === false, JSON.stringify(j));
  check('§C frozen floor is 6 first-fights', GO_FIRST_FIGHTS === 6, GO_FIRST_FIGHTS);
  // §D DMGCHECK VERDICT (frozen three-way bars, vs the designation
  // 16 launches / 9 first-fights on this band).
  function mkDcBand(launches, firstFights) {
    return { dir: 'b1', launches: launches, firstFights: firstFights };
  }
  check('§D designation itself (16/9) is BAND VARIANCE',
    dmgcheckVerdict(mkDcBand(16, 9)).verdict === 'BAND VARIANCE', dmgcheckVerdict(mkDcBand(16, 9)));
  check('§D lower edge of variance (12/6) is BAND VARIANCE',
    dmgcheckVerdict(mkDcBand(12, 6)).verdict === 'BAND VARIANCE', dmgcheckVerdict(mkDcBand(12, 6)));
  check('§D 12 launches with 5 first-fights is INCONCLUSIVE (first-fight bar misses, regression bar misses)',
    dmgcheckVerdict(mkDcBand(12, 5)).verdict === 'INCONCLUSIVE', dmgcheckVerdict(mkDcBand(12, 5)));
  check('§D 11 launches with 6 first-fights is INCONCLUSIVE (launch bar misses)',
    dmgcheckVerdict(mkDcBand(11, 6)).verdict === 'INCONCLUSIVE', dmgcheckVerdict(mkDcBand(11, 6)));
  check('§D strikeband best band (6/2) is BASE REGRESSION',
    dmgcheckVerdict(mkDcBand(6, 2)).verdict === 'BASE REGRESSION', dmgcheckVerdict(mkDcBand(6, 2)));
  check('§D upper edge of regression (8/9) is BASE REGRESSION (launches<=8 fires first)',
    dmgcheckVerdict(mkDcBand(8, 9)).verdict === 'BASE REGRESSION', dmgcheckVerdict(mkDcBand(8, 9)));
  check('§D 9 launches with 3 first-fights is BASE REGRESSION (firstFights<=3 fires)',
    dmgcheckVerdict(mkDcBand(9, 3)).verdict === 'BASE REGRESSION', dmgcheckVerdict(mkDcBand(9, 3)));
  check('§D 9 launches with 4 first-fights is INCONCLUSIVE (between the bars)',
    dmgcheckVerdict(mkDcBand(9, 4)).verdict === 'INCONCLUSIVE', dmgcheckVerdict(mkDcBand(9, 4)));
  check('§D no band is INCONCLUSIVE',
    dmgcheckVerdict(null).verdict === 'INCONCLUSIVE', dmgcheckVerdict(null));
  console.log('analyze-dmgcheck-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  main();
}

module.exports = { firstFightStats: firstFightStats, bandOf: bandOf,
  rankBands: rankBands, judge: judge, dmgcheckVerdict: dmgcheckVerdict,
  GO_FIRST_FIGHTS: GO_FIRST_FIGHTS, selftest: selftest };
