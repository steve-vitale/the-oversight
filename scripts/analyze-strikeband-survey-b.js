// analyze-strikeband-survey-b.js — survey ranker for arm sim-strikeband-b
// (DIAG survey: screen fresh 8-seed bands for launched first-fights
// against the launch target, so the next dmgshape run has a band
// worth measuring; findings #2605 + #2620).
// For each band dir (8 per-seed corpus files from
// scripts/strikeband-survey-driver-b.js) it reports the established launch
// counts — analyze-launchfunnel-b.js bandOf: launches =
// v4departs rows with result 'launch' and targetWave >= 4, quad
// launches = launches with partySize >= 4 — plus the first-fight
// join (analyze-dmgshape-rerun-b.js launchesOf/firstFight,
// imported — not copied): for each launch, the earliest
// v4encounters row with mid === launch.target, day in
// [launch.day, launch.day+21], fought (rounds > 0 or mDealt > 0),
// ANY origin, ANY fighter. Ranks bands by firstFights desc,
// launches desc, quadLaunches desc, median survival desc.
// GO (frozen in the prereg): the best band has >= 6 launched
// first-fights per 8 seeds AND >= 4 DISTINCT strike-fights
// (distinct first-fights with mDealt > 0 — the designation proxy
// for fights with >= 1 landed strike; the judged run re-classifies
// exactly from roundsDetail) AND the funnel taxonomy is complete
// (0 unknown) on ALL screened bands AND all files parse (8/8 per
// band, 0 instrument errors).
// The survey judges COUNTS only — no decomposition (survey corpora
// carry no roundsDetail; the re-run decomposes on its own corpora).
// Usage:
//   node scripts/analyze-strikeband-survey-b.js <bandDir1> [bandDir2 ...]
//   node scripts/analyze-strikeband-survey-b.js --selftest
// Writes evidence/2026-11-20/strikeband-b-survey.json. Exits 0 iff
// GO; on NO-GO it still writes the JSON and exits 1 (same pattern
// as the launchfunnel-b analyzer).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LFB = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-b.js'));
const DSR = require(path.join(REPO, 'scripts', 'analyze-dmgshape-rerun-b.js'));

const GO_FIRST_FIGHTS = 6;
const GO_DISTINCT_STRIKE = 4;

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
      strikeFirstFights: seedRows.filter(function (r) { return !!r.fight && (r.fight.mDealt | 0) > 0; }).length,
      counterplayFirstFights: seedRows.filter(function (r) { return !!r.fight && (r.fight.mDealt | 0) === 0; }).length,
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
  // STRIKEBAND extension (prereg): distinct strike-fights = distinct
  // first-fights with mDealt > 0 — the designation proxy for fights
  // with >= 1 landed strike (survey corpora carry no roundsDetail,
  // so no exact landed-strike count exists here; the judged run
  // re-classifies exactly). Counterplay-fights are the mDealt = 0
  // distinct first-fights (Eulogy contradict / death-before-strike).
  const strikeKeys = {};
  const counterplayKeys = {};
  for (const r of firstFights) {
    const k = [r.seed, r.fight.day, r.fight.mid, r.fight.vid].join('|');
    if ((r.fight.mDealt | 0) > 0) strikeKeys[k] = true; else counterplayKeys[k] = true;
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
    strikeFirstFights: firstFights.filter(function (r) { return (r.fight.mDealt | 0) > 0; }).length,
    distinctStrikeFirstFights: Object.keys(strikeKeys).length,
    counterplayFirstFights: firstFights.filter(function (r) { return (r.fight.mDealt | 0) === 0; }).length,
    distinctCounterplayFirstFights: Object.keys(counterplayKeys).length,
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
    strikeFirstFights: ff.strikeFirstFights,
    distinctStrikeFirstFights: ff.distinctStrikeFirstFights,
    counterplayFirstFights: ff.counterplayFirstFights,
    distinctCounterplayFirstFights: ff.distinctCounterplayFirstFights,
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
  const strikeRich = !!best && (best.distinctStrikeFirstFights | 0) >= GO_DISTINCT_STRIKE;
  const go = !!best && best.firstFights >= GO_FIRST_FIGHTS && strikeRich && allTaxonomy && allFilesOk;
  return { go: go,
    bars: {
      firstFightRich: { pass: !!best && best.firstFights >= GO_FIRST_FIGHTS,
        bestFirstFights: best ? best.firstFights : null, floorFirstFights: GO_FIRST_FIGHTS,
        bestLaunches: best ? best.launches : null, bestQuads: best ? best.quadLaunches : null },
      strikeRich: { pass: strikeRich,
        bestDistinctStrikeFirstFights: best ? best.distinctStrikeFirstFights : null,
        floorDistinctStrikeFirstFights: GO_DISTINCT_STRIKE,
        bestDistinctCounterplayFirstFights: best ? best.distinctCounterplayFirstFights : null },
      taxonomy: { pass: allTaxonomy, unknownByBand: bands.map(function (b) { return { dir: b.dir, unknown: b.unknown }; }) },
      instrument: { pass: allFilesOk, filesByBand: bands.map(function (b) { return { dir: b.dir, files: b.files, valid: b.valid, errors: b.errors }; }) },
    },
    verdict: go ? 'GO' : 'NO-GO',
    best: best ? { dir: best.dir, seeds: best.seeds, firstFights: best.firstFights,
      distinctFirstFights: best.distinctFirstFights,
      distinctStrikeFirstFights: best.distinctStrikeFirstFights,
      distinctCounterplayFirstFights: best.distinctCounterplayFirstFights,
      launches: best.launches,
      quadLaunches: best.quadLaunches, fled: best.fledFirstFights, killed: best.killedFirstFights } : null,
  };
}

function main() {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error('STRIKEBAND ANALYZE STOP: at least one band dir required.'); process.exit(2); }
  const bands = dirs.map(bandOf);
  const ranked = rankBands(bands);
  const j = judge(bands, ranked);
  const out = {
    arm: 'strikeband-b', run: 'strikeband-b',
    goFirstFights: GO_FIRST_FIGHTS, goDistinctStrike: GO_DISTINCT_STRIKE,
    bands: bands, ranking: ranked.map(function (b) { return b.dir; }),
    best: j.best, bars: j.bars, verdict: j.verdict,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-20', 'strikeband-b-survey.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const wrote = writeRobust(outFile, JSON.stringify(out, null, 2) + '\n');
  for (const b of bands) {
    console.log('band ' + b.dir + ' seeds ' + (b.seeds.join(',') || '?') +
      ' launches=' + b.launches + ' firstFights=' + b.firstFights +
      ' distinct=' + b.distinctFirstFights + ' strike=' + b.strikeFirstFights +
      ' distinctStrike=' + b.distinctStrikeFirstFights +
      ' counterplay=' + b.counterplayFirstFights +
      ' distinctCounterplay=' + b.distinctCounterplayFirstFights +
      ' fled=' + b.fledFirstFights +
      ' killed=' + b.killedFirstFights + ' noFight=' + b.launchesNoFight +
      ' quads=' + b.quadLaunches + ' trios=' + b.trioLaunches +
      ' instances=' + b.instancesOpened +
      ' binding=' + b.bindingStage + '(' + b.bindingCount + ')' + ' unknown=' + b.unknown +
      ' wall=' + JSON.stringify(b.wall));
  }
  console.log('ranking: ' + ranked.map(function (b) { return b.dir; }).join(' > '));
  console.log('best: ' + (j.best ? j.best.dir + ' seeds ' + j.best.seeds.join('-') : 'none'));
  console.log('bars: firstFightRich=' + (j.bars.firstFightRich.pass ? 'PASS' : 'FAIL') +
    ' strikeRich=' + (j.bars.strikeRich.pass ? 'PASS' : 'FAIL') +
    ' taxonomy=' + (j.bars.taxonomy.pass ? 'PASS' : 'FAIL') +
    ' instrument=' + (j.bars.instrument.pass ? 'PASS' : 'FAIL'));
  console.log('VERDICT: ' + j.verdict);
  console.log('survey: ' + path.relative(REPO, outFile) + (wrote ? '' : ' (WRITE FAILED — flap)'));
  if (!j.go) process.exitCode = 1;
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
  // §C JUDGE fixtures. mkJudgeBand takes distinctStrike as the 7th
  // arg (default = firstFights, i.e. every first-fight strikes);
  // pass an explicit low value to test the strike bar.
  function mkJudgeBand(dir, firstFights, unknown, files, valid, errors, distinctStrike) {
    return { dir: dir, seeds: [1], firstFights: firstFights, launches: 8, quadLaunches: 2,
      distinctFirstFights: firstFights, fledFirstFights: 3, killedFirstFights: 0,
      distinctStrikeFirstFights: distinctStrike == null ? firstFights : distinctStrike,
      distinctCounterplayFirstFights: firstFights - (distinctStrike == null ? firstFights : distinctStrike),
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
  // §D STRIKE-FIGHT COUNTING + JUDGE (the strikeband extension).
  // A distinct first-fight strikes iff mDealt > 0; shared fights
  // count once; a 0-damage fight is counterplay, never a strike.
  (function () {
    const dd = {
      seed: 999002, instrumentErrors: [],
      v4departs: [
        mkLaunch(10, 's1', 'eater'),
        mkLaunch(20, 's2', 'audit'),
        mkLaunch(30, 's3', 'eulogy'),
        mkLaunch(40, 's4', 'eulogy'),
        mkLaunch(50, 's5', 'strike'),
      ],
      v4encounters: [
        mkEnc(12, 's1', 'eater', 'expedition', 'vFlee', 5, 329),
        mkEnc(25, 's2', 'audit', 'aid', 'vKill', 6, 400),
        mkEnc(32, 's3', 'eulogy', 'world-tick', 'vFlee', 3, 0),
        mkEnc(32, 's3', 'eulogy', 'world-tick', 'vFlee', 3, 0),
        mkEnc(55, 's5', 'strike', 'expedition', 'vFlee', 2, 0),
      ],
    };
    // s3+s4 share the d32 eulogy fight (0-damage); s5's strike fight
    // deals 0 (all strikes missed / no landed strike).
    const ll = DSR.launchesOf(dd);
    const rr = [];
    for (const l of ll) rr.push({ fight: DSR.firstFight(dd, l) });
    const struck = rr.filter(function (r) { return !!r.fight && (r.fight.mDealt | 0) > 0; }).length;
    check('§D counted strike-fights are 2 of 5 (eater 329 + audit 400; eulogy 0 + strike 0 excluded)',
      struck === 2, struck);
    const keys = {};
    for (const r of rr) {
      if (!r.fight || (r.fight.mDealt | 0) === 0) continue;
      keys[[dd.seed, r.fight.day, r.fight.mid, r.fight.vid].join('|')] = true;
    }
    check('§D distinct strike-fights are 2 (shared 0-damage fight contributes 0)',
      Object.keys(keys).length === 2, Object.keys(keys).length);
  })();
  j = judge([mkJudgeBand('b1', 9, 0, 8, 8, 0, 2)], rankBands([mkJudgeBand('b1', 9, 0, 8, 8, 0, 2)]));
  check('§D judge NO-GO when first-fights clear (9) but distinct strike-fights are 2 < 4 (the dmgshape shape)',
    j.go === false && j.verdict === 'NO-GO' && j.bars.firstFightRich.pass === true && j.bars.strikeRich.pass === false,
    JSON.stringify(j.bars));
  j = judge([mkJudgeBand('b1', 9, 0, 8, 8, 0, 4)], rankBands([mkJudgeBand('b1', 9, 0, 8, 8, 0, 4)]));
  check('§D judge GO at 9 first-fights with 4 distinct strike-fights, 0 unknown, 8/8 files',
    j.go === true && j.verdict === 'GO' && j.bars.strikeRich.pass === true, JSON.stringify(j.bars));
  check('§D frozen strike floor is 4 distinct strike-fights', GO_DISTINCT_STRIKE === 4, GO_DISTINCT_STRIKE);
  console.log('analyze-strikeband-survey-b selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  rankBands: rankBands, judge: judge, GO_FIRST_FIGHTS: GO_FIRST_FIGHTS,
  GO_DISTINCT_STRIKE: GO_DISTINCT_STRIKE, selftest: selftest };
