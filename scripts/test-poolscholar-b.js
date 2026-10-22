// test-poolscholar-b.js — proof for diag-poolscholar-b.js (backlog #816).
//
// (a) ATTRIBUTION: the PRIMARY bar — >=95% of measured pooled-draw kcal in
//     named draw categories on >=15/16 corpus runs (re-asserted from the
//     instrument's own report, not trusted blindly).
// (b) DET: two instrument runs on the corpus are byte-identical.
// (c) FIXTURE: a synthetic 2-run corpus with hand-computed flows exercises
//     the analyzer math exactly (draw attribution, quintile binning, scholar
//     share, residual, thin-pool/starvation join).
//
// Usage: node scripts/test-poolscholar-b.js [--corpus <dir>]
// Exit 0 = all green, 1 = failure. No repo writes (fixture lives in /tmp).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const DIAG = path.join(__dirname, 'diag-poolscholar-b.js');
const REPO = path.resolve(__dirname, '..');
const DEFAULT_CORPUS = path.join(REPO, 'evidence', '2026-10-22', 'perseed-deathcause-b');

function argVal(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

let nPass = 0, nFail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { nPass++; console.log('PASS ' + name); }
  else { nFail++; failures.push(name); console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function runDiag(corpusDir) {
  return execFileSync('node', [DIAG, '--corpus', corpusDir], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// ---- synthetic fixture: 2 runs, hand-computed flows ----
function buildFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'poolscholar-fixture-'));
  // Run A: 4 days. Pantry 10000 -> 6000 (delta -4000).
  //   meals: v1 home drawn 500 gave 1000 (d1-4); v2 away drawn 200 (d1-4)
  //   scholar: 2000/d at haven (d1-4) = 8000
  //   deposits: d2 homecoming 3000
  //   daily: d1 pop10 pan10000; d2 pop10 pan9000 feast 500; d3 pop10 pan7000 trib 300; d4 pop10 pan6000
  //   inflowMeasured = 4000 (gave) + 3000 (dep) = 7000
  //   measuredDraws = 8000 + 2000 (topups: 500*4) + 800 (pack: 200*4) + 500 + 300 = 11600
  //   residual = 7000 - 11600 - (-4000) = -600
  //   thickStock mean = (1000+900+700+600)/4 = 800
  //   thickInflow = 7000/ (10*4 + ... meal-row mouthDays: 2 vids*4d = 8) = 875
  function mealsA() {
    const rows = [];
    for (let d = 1; d <= 4; d++) {
      rows.push({ d, vid: 'v1', ate: 2000, drawn: 500, gave: 1000, fasting: false, away: false, produced: 3000, expected: 2500, need: 2000 });
      rows.push({ d, vid: 'v2', ate: 1800, drawn: 200, gave: 0, fasting: false, away: true, produced: 1800, expected: 2500, need: 2000 });
    }
    return rows;
  }
  const runA = {
    seed: 1, policy: 'leadfeast', days: 4, gameDays: 4, endReason: 'survived',
    villageLost: { lost: false },
    daily: [
      { day: 1, pop: 10, pantryKcal: 10000, feastKcalOut: 0, trimKcal: 0, tributeKcal: 0 },
      { day: 2, pop: 10, pantryKcal: 9000, feastKcalOut: 500, trimKcal: 0, tributeKcal: 0 },
      { day: 3, pop: 10, pantryKcal: 7000, feastKcalOut: 0, trimKcal: 0, tributeKcal: 300 },
      { day: 4, pop: 10, pantryKcal: 6000, feastKcalOut: 0, trimKcal: 0, tributeKcal: 0 },
    ],
    starvechan: {
      meals: mealsA(),
      deposits: [{ d: 2, src: 'homecoming', kcal: 3000 }],
      scholarMeals: [1, 2, 3, 4].map(d => ({ d, meal: 2000, atHaven: true })),
      starv: [{ day: 3, who: 'Vic', vid: 'v9', channel: 'inflow-failure', channelFlags: ['inflow-failure'] }],
    },
  };
  // Run B: 2 days, thick pool. Pantry 50000 -> 48000 (delta -2000).
  //   meals: v1 home drawn 100 gave 5000 (d1-2)
  //   scholar: 2000/d = 4000; deposits: none; feast/tribute 0
  //   inflowMeasured = 10000; measuredDraws = 4000+200+0 = 4200... wait topups=100*2=200
  //   residual = 10000 - 4200 - (-2000) = 7800
  const runB = {
    seed: 2, policy: 'belongfeast', days: 2, gameDays: 2, endReason: 'survived',
    villageLost: { lost: false },
    daily: [
      { day: 1, pop: 10, pantryKcal: 50000, feastKcalOut: 0, trimKcal: 0, tributeKcal: 0 },
      { day: 2, pop: 10, pantryKcal: 48000, feastKcalOut: 0, trimKcal: 0, tributeKcal: 0 },
    ],
    starvechan: {
      meals: [1, 2].map(d => ({ d, vid: 'v1', ate: 2000, drawn: 100, gave: 5000, fasting: false, away: false, produced: 7000, expected: 2500, need: 2000 })),
      deposits: [],
      scholarMeals: [1, 2].map(d => ({ d, meal: 2000, atHaven: true })),
      starv: [],
    },
  };
  fs.writeFileSync(path.join(dir, 'deathcause-fixture-a.json'), JSON.stringify(runA));
  fs.writeFileSync(path.join(dir, 'deathcause-fixture-b.json'), JSON.stringify(runB));
  return dir;
}

function main() {
  const corpusDir = argVal('--corpus', DEFAULT_CORPUS);

  // ---- (c) FIXTURE: exact analyzer math ----
  const fixDir = buildFixture();
  let frep;
  try {
    frep = JSON.parse(runDiag(fixDir));
  } catch (e) {
    check('fixture diag runs', false, String(e).slice(0, 200));
    frep = null;
  }
  if (frep) {
    check('fixture nRuns=2', frep.nRuns === 2, 'got ' + frep.nRuns);
    const A = frep.runs.find(r => r.seed === 1);
    const B = frep.runs.find(r => r.seed === 2);
    check('fixture A draws', A.draws.scholarDraw === 8000 && A.draws.topups === 2000 &&
      A.draws.packDraws === 800 && A.draws.feast === 500 && A.draws.tribute === 300,
      JSON.stringify(A.draws));
    check('fixture A measuredDraws=11600', A.draws.measuredDraws === 11600, 'got ' + A.draws.measuredDraws);
    check('fixture A residual=-600', A.pantry.residual === -600, 'got ' + A.pantry.residual);
    check('fixture A thickStock=800', A.thickness.stockPerMouthMean === 800, 'got ' + A.thickness.stockPerMouthMean);
    check('fixture A scholarShare', Math.abs(A.draws.scholarShare - 100 * 8000 / 11600) < 1e-9, 'got ' + A.draws.scholarShare);
    check('fixture B residual=7800', B.pantry.residual === 7800, 'got ' + B.pantry.residual);
    check('fixture B thickStock=4900', B.thickness.stockPerMouthMean === 4900, 'got ' + B.thickness.stockPerMouthMean);
    // quintiles: 6 run-days total (4 thin ~600-1000, 2 thick ~4800-5000); Q1 must be the thin days
    check('fixture quintiles=5', frep.quintiles.length === 5, 'got ' + frep.quintiles.length);
    check('fixture Q1 thinnest', frep.quintiles[0].spmMax <= 1000 && frep.quintiles[4].spmMin >= 4800,
      'Q1max=' + frep.quintiles[0].spmMax + ' Q5min=' + frep.quintiles[4].spmMin);
    // thin-pool/starvation: Vic died d3 on run A; nearest daily <= 3 is d3 (7000/10=700 spm)
    const vic = frep.thinPoolStarvation.deaths.find(d => d.who === 'Vic');
    check('fixture starv join', !!vic && vic.deathDaySpm === 700 && vic.day === 3,
      vic ? JSON.stringify(vic) : 'missing');
    check('fixture starv nDeaths=1', frep.thinPoolStarvation.nDeaths === 1);
  }
  fs.rmSync(fixDir, { recursive: true, force: true });

  // ---- (b) DET on the real corpus ----
  let r1, r2;
  try {
    r1 = runDiag(corpusDir);
    r2 = runDiag(corpusDir);
  } catch (e) {
    check('corpus diag runs', false, String(e).slice(0, 200));
  }
  if (r1 && r2) {
    check('DET byte-identical', r1 === r2, 'lengths ' + r1.length + ' vs ' + r2.length);
  }

  // ---- (a) PRIMARY bar, re-asserted from the parsed report ----
  if (r1) {
    const rep = JSON.parse(r1);
    check('corpus nRuns=16', rep.nRuns === 16, 'got ' + rep.nRuns);
    const passes = rep.perRun.filter(p => p.attributionPct >= 95).length;
    check('PRIMARY >=95% named on >=15/16', passes >= 15, passes + '/16 pass');
    check('quintile table present', Array.isArray(rep.quintiles) && rep.quintiles.length === 5 &&
      rep.quintiles.every(q => typeof q.scholarSharePct === 'number'),
      'quintiles=' + (rep.quintiles || []).length);
    check('thin-pool/starvation present', rep.thinPoolStarvation && rep.thinPoolStarvation.nDeaths === 13,
      'nDeaths=' + (rep.thinPoolStarvation || {}).nDeaths);
    check('residual decomposition present', rep.residualDecomposition && typeof rep.residualDecomposition.slopePerAwayDay === 'number');
    check('thickness distribution present', rep.thicknessDistribution && rep.thicknessDistribution.perRun.length === 16);
    // every measured draw is in a named category (no unattributed remainder)
    const unnamed = rep.perRun.filter(p => p.measuredDraws <= 0).length;
    check('no empty-draw runs', unnamed === 0, unnamed + ' empty');
  }

  console.log('\n' + nPass + ' passed, ' + nFail + ' failed');
  if (nFail) { console.log('FAILURES: ' + failures.join(', ')); process.exit(1); }
}

main();
