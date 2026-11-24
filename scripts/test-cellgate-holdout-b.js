// test-cellgate-holdout-b.js — arm sim-cellgate-holdout-b: 64-seed deaths
// holdout on the CELLGATE floor (floor 3 vs floor 4, staged kill-loot
// instrument). The floor-b arm proved floor 3 makes the loaded gun fire
// (9 volleys vs 2, 7 at wave 3) but left a village-deaths
// regression_watch (+82 over 16 seeds, 95% CIs straddling zero, paired
// median 0) unresolved — this holdout resolves it. The flip decision
// (default floor 3) needs this answer.
//   node scripts/test-cellgate-holdout-b.js            (pre-run checks:
//       frozen band + bar derivations + paired-stats math + bar wiring
//       + panel wiring — must be GREEN before any judged run)
//   node scripts/test-cellgate-holdout-b.js --dir-ctl <dir>
//       corpus validation: 64 files, floor 4, mode arm, KILLBUNDLE on,
//       STAGE_SEAR on, one shared anchor, policySha + gameSha match,
//       0 instrument errors, 64/64 staged bundled arrivals.
//   node scripts/test-cellgate-holdout-b.js --dir-arm <dir>
//       same, floor 3.
//   node scripts/test-cellgate-holdout-b.js --analyze --dir-ctl <dir>
//       --dir-arm <dir> [--panel <balance-panel-compare.json>]
//       paired deaths table + bar verdicts (JSON on stdout).
// Reads only, except --analyze which writes nothing (stdout only) and
// the panel-wiring proof, which writes synthetic panels under /tmp.
// The paired-stats math is exact (Student-t via the regularized
// incomplete beta, bisected to 1e-9), not a normal approximation:
// with n=64 the t/normal gap is small but the proof must not smuggle
// one in.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const { validateCorpus } = require(path.join(REPO, 'scripts', 'test-killbundle-b'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-killlootbundle-a'));
const panelBuilder = require(path.join(REPO, 'scripts', 'build-cellgate-holdout-panels-b'));

// Frozen from the prereg (sim-cellgate-holdout-b).
const BAND_START = 107670;
const BAND_END = 107733;
const BAND_N = 64;
const PILOT_N = 8; // first 8 seeds 107670-107677
const PILOT_END = BAND_START + PILOT_N - 1;
// Reserved ranges the band must not overlap (prereg §3).
const RESERVED = [
  [107261, 107268, 'killlootbundle pilot'],
  [107281, 107296, 'killloot16'],
  [107313, 107320, 'sim-killrate-a'],
  [107321, 107430, '8-seed bands (gunlife-a 107321-107328 … dawnchoke-a 107423-107430)'],
  [107471, 107494, 'Loop B gateavoid-doorrich-b screen'],
  [107501, 107516, 'journey-endgame-r270 / Loop A original'],
  [107517, 107532, 'Loop A sim-launchsilence-a (moved band)'],
  [107533, 107581, 'killarrive-b (49 seeds) + cellgate staged subset'],
  [107601, 107616, 'departsafe-a'],
  [107617, 107669, 'Loop A hold (muster-a 107617-107632, planform-a 107633-107648)'],
  [108001, 108008, 'named known-used'],
  [109001, 109008, 'journey-establishment r274'],
  [109101, 109116, 'gatehorizon-b'],
];
// Frozen bars (prereg §7; numbering per the prereg's mapping note —
// the deaths check is bar 5, the brief's bars 6-8 shift to 7-9).
const GO_MIN_ARMED_VOLLEYS = 20; // floor-b GO bar >=5/16 scaled x4 (expectation 32/64)
const GO_MIN_W3_VOLLEYS = 12; // floor-b GO bar >=3/16 scaled x4 (expectation 28/64)
const GO_MAX_CTL_VOLLEYS = 6; // brief-frozen; see prereg §7 calibration note
const DEATHS_MEAN_MAX = 2; // paired mean difference <= +2 deaths/run
const DEATHS_CI_HI_MAX = 5; // 95% CI upper bound <= +5 deaths/run
const EXPECTED_ARMED_VOLLEYS = 32; // mechanistic expectation, 50% of 64
const EXPECTED_ARMED_W3_VOLLEYS = 28; // mechanistic expectation, 7/16 x 64
const PANEL_ALLOWED = ['descriptive', 'no_material_signal', 'not_observed', 'insufficient'];
const DEATHS_METRICS = ['villageDeaths', 'villageDeaths100Days'];

// ---- Student-t math (exact) ----
function lgamma(z) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < 9; i++) x += c[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function betacf(a, b, x) {
  const MAXIT = 200, EPS = 3e-14, FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
  return 1 - bt * betacf(b, a, 1 - x) / b;
}
function tCDF(t, df) {
  if (t === 0) return 0.5;
  const x = df / (df + t * t);
  const ib = betai(df / 2, 0.5, x);
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib;
}
function tQuantile(p, df) {
  let lo = 0, hi = 100;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCDF(mid, df) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}
function pairedDeathsStats(diffs) {
  const n = diffs.length;
  if (!n) return { n: 0, mean: null, sd: null, se: null, tCrit: null, ciLo: null, ciHi: null, median: null, worse: 0, better: 0, tied: 0 };
  const mean = diffs.reduce(function (a, b) { return a + b; }, 0) / n;
  let ss = 0;
  diffs.forEach(function (d) { ss += (d - mean) * (d - mean); });
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : 0;
  const se = sd / Math.sqrt(n);
  const tCrit = n > 1 ? tQuantile(0.975, n - 1) : 0;
  const half = tCrit * se;
  return {
    n: n, mean: mean, sd: sd, se: se, tCrit: tCrit,
    ciLo: mean - half, ciHi: mean + half, median: median(diffs),
    worse: diffs.filter(function (d) { return d > 0; }).length,
    better: diffs.filter(function (d) { return d < 0; }).length,
    tied: diffs.filter(function (d) { return d === 0; }).length,
  };
}
function judgeDeathsBar(stats) {
  const meanPass = stats.mean != null && stats.mean <= DEATHS_MEAN_MAX;
  const ciPass = stats.ciHi != null && stats.ciHi <= DEATHS_CI_HI_MAX;
  return {
    pass: meanPass && ciPass, meanPass: meanPass, ciPass: ciPass,
    detail: 'paired mean ' + (stats.mean == null ? 'null' : stats.mean.toFixed(3)) + '/run (bar <= +' + DEATHS_MEAN_MAX + '); 95% CI [' +
      (stats.ciLo == null ? 'null' : stats.ciLo.toFixed(3)) + ', ' + (stats.ciHi == null ? 'null' : stats.ciHi.toFixed(3)) +
      '] (bar upper <= +' + DEATHS_CI_HI_MAX + '); n=' + stats.n + ', median ' + stats.median +
      ', worse ' + stats.worse + ' / better ' + stats.better + ' / tied ' + stats.tied,
  };
}
function judgeVolleyBars(armKlVolleys, armW3Volleys, ctlKlVolleys) {
  return {
    bar3: { pass: armKlVolleys >= GO_MIN_ARMED_VOLLEYS, detail: 'armed volleys ' + armKlVolleys + '/64 (bar >= ' + GO_MIN_ARMED_VOLLEYS + '; expectation ' + EXPECTED_ARMED_VOLLEYS + ')' },
    bar4: { pass: armW3Volleys >= GO_MIN_W3_VOLLEYS, detail: 'armed wave-3 volleys ' + armW3Volleys + '/64 (bar >= ' + GO_MIN_W3_VOLLEYS + '; expectation ' + EXPECTED_ARMED_W3_VOLLEYS + ')' },
    bar6: { pass: ctlKlVolleys <= GO_MAX_CTL_VOLLEYS, detail: 'control volleys ' + ctlKlVolleys + '/64 (bar <= ' + GO_MAX_CTL_VOLLEYS + '; 16-seed control was 2/16)' },
  };
}
function judgeGuardrails(ctlAgg, armAgg) {
  const starvDelta = (armAgg.starvDeaths || 0) - (ctlAgg.starvDeaths || 0);
  const medDelta = (armAgg.medianSurvival || 0) - (ctlAgg.medianSurvival || 0);
  return {
    pass: starvDelta <= 2 && medDelta >= -20,
    detail: 'starvDeaths ctl=' + ctlAgg.starvDeaths + ' arm=' + armAgg.starvDeaths + ' (delta ' + starvDelta + ', bar <= +2); medianSurvival ctl=' +
      ctlAgg.medianSurvival + ' arm=' + armAgg.medianSurvival + ' (delta ' + medDelta + ', bar >= -20)',
  };
}
function judgePanelBar(compareJson) {
  if (!compareJson) return { pass: null, detail: 'no panel compare provided — bar 8 not evaluated' };
  const decisionOk = compareJson.decision === 'review_required';
  const bad = [], deathsWatch = [];
  (compareJson.policies || []).forEach(function (pol) {
    (pol.metrics || []).forEach(function (m) {
      if (PANEL_ALLOWED.indexOf(m.status) !== -1) return;
      if (DEATHS_METRICS.indexOf(m.id) !== -1) deathsWatch.push(m.id + ':' + m.status + ' (delta ' + m.delta + ', CI ' + JSON.stringify(m.interval95) + ')');
      else bad.push(m.id + ':' + m.status);
    });
  });
  return {
    pass: decisionOk && bad.length === 0,
    decisionOk: decisionOk, badRows: bad, deathsWatch: deathsWatch,
    detail: 'decision ' + compareJson.decision + ' (bar review_required); non-deaths watch/regression rows: ' +
      (bad.length ? bad.join(', ') : 'none') + '; deaths rows on watch: ' + (deathsWatch.length ? deathsWatch.join('; ') : 'none') +
      ' (judged by bar 5, not this bar — see prereg §7 bar 8)',
  };
}

// ---- Corpus validation (64 seeds) ----
function loadSeedFiles(dir) {
  return fs.readdirSync(dir).sort().filter(function (f) {
    return /killlootbundle-a-s\d+-killlootbundle-a-arm\.json$/.test(f);
  }).map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}
function validateHoldoutCorpus(dir, floor) {
  const v = validateCorpus(dir, { expectStage: true });
  const files = loadSeedFiles(dir);
  const floors = {};
  const gameShas = {};
  let w3KlVolleys = 0, w4pKlVolleys = 0;
  let stagedArrivals = 0, stagedBundled = 0, naturalArrivals = 0, naturalBundled = 0;
  let deathsTotal = 0;
  files.forEach(function (c) {
    floors[c.cellgateFloor] = (floors[c.cellgateFloor] || 0) + 1;
    gameShas[c.gameSha] = (gameShas[c.gameSha] || 0) + 1;
    deathsTotal += (c.deaths || []).length;
    const kl = (c.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; });
    // The staged arrival is the FIRST kill-loot searcaster event in the
    // file (the STAGE_SEAR forcer fires on the first villagerKillLoot
    // call); any further searcaster kill-loot event is natural.
    kl.forEach(function (e, i) {
      const bundled = (e.gains || []).some(function (g) { return g.cellsGained === 2; });
      if (i === 0) { stagedArrivals++; if (bundled) stagedBundled++; }
      else { naturalArrivals++; if (bundled) naturalBundled++; }
    });
    const holders = {};
    kl.forEach(function (e) {
      const g = (e.gains || []).filter(function (x) { return x.gunsGained > 0; })[0];
      holders[g ? g.holder : e.vid] = true;
    });
    (c.volleyEvents || []).forEach(function (e) {
      if (e.rwId === 'searcaster' && (e.shots || 0) > 0 && !!holders[e.vid]) {
        if (e.wave === 3) w3KlVolleys++;
        else if (e.wave >= 4) w4pKlVolleys++;
      }
    });
  });
  return Object.assign(v, {
    floors: floors, gameShas: gameShas,
    w3KlVolleys: w3KlVolleys, w4pKlVolleys: w4pKlVolleys,
    stagedArrivals: stagedArrivals, stagedBundled: stagedBundled,
    naturalArrivals: naturalArrivals, naturalBundled: naturalBundled,
    deathsTotal: deathsTotal,
  });
}
function corpusPass(v, floor) {
  return v.files === BAND_N && v.instrumentErrors === 0
    && v.missingAnchor === 0 && v.policyShaMismatches === 0
    && Object.keys(v.anchors).length === 1
    && Object.keys(v.gameShas).length === 1
    && v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0
    && v.seeds.length === BAND_N
    && v.seeds.every(function (s, i) { return s === BAND_START + i; })
    && v.stagedArrivals === BAND_N && v.stagedBundled === BAND_N
    && v.naturalBundled === v.naturalArrivals
    && v.klDry === 0
    && Object.keys(v.floors).length === 1 && v.floors[floor] === BAND_N;
}

if (require.main === module) (async function () {
  const args = process.argv.slice(2);
  const ctlIdx = args.indexOf('--dir-ctl');
  const armIdx = args.indexOf('--dir-arm');
  if (ctlIdx !== -1 || armIdx !== -1) {
    const isArm = armIdx !== -1;
    const dir = args[(isArm ? armIdx : ctlIdx) + 1];
    const floor = isArm ? 3 : 4;
    if (args.indexOf('--analyze') !== -1) {
      // --analyze needs BOTH dirs; handled below.
    } else {
      const v = validateHoldoutCorpus(dir, floor);
      console.log(JSON.stringify(v, null, 2));
      const ok = corpusPass(v, floor);
      console.log('TEST-CELLGATE-HOLDOUT-B-CORPUS-' + (isArm ? 'ARM' : 'CTL') + ': ' + (ok ? 'PASS' : 'FAIL'));
      process.exit(ok ? 0 : 1);
    }
  }
  if (args.indexOf('--analyze') !== -1) {
    if (ctlIdx === -1 || armIdx === -1) { console.error('usage: --analyze --dir-ctl <dir> --dir-arm <dir> [--panel <compare.json>]'); process.exit(2); }
    const ctlDir = args[ctlIdx + 1], armDir = args[armIdx + 1];
    const ctlV = validateHoldoutCorpus(ctlDir, 4);
    const armV = validateHoldoutCorpus(armDir, 3);
    const ctlFiles = loadSeedFiles(ctlDir);
    const armFiles = loadSeedFiles(armDir);
    const ctlBySeed = {}, armBySeed = {};
    ctlFiles.forEach(function (c) { ctlBySeed[c.seed] = c; });
    armFiles.forEach(function (c) { armBySeed[c.seed] = c; });
    const pairs = [];
    const diffs = [];
    for (let s = BAND_START; s <= BAND_END; s++) {
      const c = ctlBySeed[s], a = armBySeed[s];
      if (!c || !a) { pairs.push({ seed: s, error: 'missing leg file' }); continue; }
      const dc = (c.deaths || []).length, da = (a.deaths || []).length;
      diffs.push(da - dc);
      pairs.push({ seed: s, deathsCtl: dc, deathsArm: da, delta: da - dc,
        daysCtl: c.gameDays, daysArm: a.gameDays,
        endCtl: c.endReason, endArm: a.endReason,
        waveCtl: c.maxWave, waveArm: a.maxWave,
        standingCtl: c.standing, standingArm: a.standing });
    }
    const stats = pairedDeathsStats(diffs);
    const deathsBar = judgeDeathsBar(stats);
    const volley = judgeVolleyBars(armV.klVolleys, armV.w3KlVolleys, ctlV.klVolleys);
    const ctlAgg = analyzer.analyzeLeg(ctlFiles);
    const armAgg = analyzer.analyzeLeg(armFiles);
    const guard = judgeGuardrails(ctlAgg, armAgg);
    let panelBar = { pass: null, detail: 'no panel compare provided — bar 8 not evaluated' };
    const pIdx = args.indexOf('--panel');
    if (pIdx !== -1 && args[pIdx + 1]) {
      panelBar = judgePanelBar(JSON.parse(fs.readFileSync(args[pIdx + 1], 'utf8')));
    }
    const bar1 = {
      pass: corpusPass(ctlV, 4) && corpusPass(armV, 3),
      detail: 'ctl files=' + ctlV.files + ' arm files=' + armV.files + '; errors ctl=' + ctlV.instrumentErrors + ' arm=' + armV.instrumentErrors +
        '; anchors ctl=' + Object.keys(ctlV.anchors).length + ' arm=' + Object.keys(armV.anchors).length +
        '; gameShas ctl=' + Object.keys(ctlV.gameShas).length + ' arm=' + Object.keys(armV.gameShas).length +
        '; policySha mismatches ctl=' + ctlV.policyShaMismatches + ' arm=' + armV.policyShaMismatches +
        '; floors ctl=' + JSON.stringify(ctlV.floors) + ' arm=' + JSON.stringify(armV.floors),
    };
    const bar2 = {
      pass: ctlV.stagedArrivals === BAND_N && ctlV.stagedBundled === BAND_N && ctlV.naturalBundled === ctlV.naturalArrivals && ctlV.klDry === 0 &&
        armV.stagedArrivals === BAND_N && armV.stagedBundled === BAND_N && armV.naturalBundled === armV.naturalArrivals && armV.klDry === 0,
      detail: 'ctl staged ' + ctlV.stagedBundled + '/' + ctlV.stagedArrivals + ' bundled, natural ' + ctlV.naturalBundled + '/' + ctlV.naturalArrivals + ', dry ' + ctlV.klDry +
        '; arm staged ' + armV.stagedBundled + '/' + armV.stagedArrivals + ' bundled, natural ' + armV.naturalBundled + '/' + armV.naturalArrivals + ', dry ' + armV.klDry,
    };
    const bars = {
      1: bar1, 2: bar2,
      3: volley.bar3, 4: volley.bar4, 5: deathsBar, 6: volley.bar6,
      7: guard, 8: panelBar,
      9: { pass: null, detail: 'sense-test + per-seed table are delivered in the evidence file, not computed here' },
    };
    const core = [1, 2, 3, 4, 6, 7].every(function (k) { return bars[k].pass === true; }) &&
      (bars[8].pass === true || bars[8].pass === null) && bars[9].pass !== false;
    const verdict = !bar1.pass ? 'DIAG'
      : (!bar2.pass || !volley.bar3.pass || !volley.bar4.pass) ? 'DIAG'
      : (deathsBar.pass ? 'GO' : 'NO-GO');
    const out = {
      band: [BAND_START, BAND_END], n: BAND_N,
      ctl: { files: ctlV.files, deaths: ctlV.deathsTotal, klVolleys: ctlV.klVolleys, w3KlVolleys: ctlV.w3KlVolleys, w4pKlVolleys: ctlV.w4pKlVolleys, stagedArrivals: ctlV.stagedArrivals, stagedBundled: ctlV.stagedBundled, naturalArrivals: ctlV.naturalArrivals, naturalBundled: ctlV.naturalBundled, medianSurvival: ctlAgg.medianSurvival, starvDeaths: ctlAgg.starvDeaths, wins: ctlAgg.wins, national: ctlAgg.national, wave5: ctlAgg.wave5, wave4: ctlAgg.wave4, villageLost: ctlAgg.villageLost },
      arm: { files: armV.files, deaths: armV.deathsTotal, klVolleys: armV.klVolleys, w3KlVolleys: armV.w3KlVolleys, w4pKlVolleys: armV.w4pKlVolleys, stagedArrivals: armV.stagedArrivals, stagedBundled: armV.stagedBundled, naturalArrivals: armV.naturalArrivals, naturalBundled: armV.naturalBundled, medianSurvival: armAgg.medianSurvival, starvDeaths: armAgg.starvDeaths, wins: armAgg.wins, national: armAgg.national, wave5: armAgg.wave5, wave4: armAgg.wave4, villageLost: armAgg.villageLost },
      pairs: pairs, pairedDeaths: stats, deathsBar: deathsBar,
      bars: bars, verdict: verdict,
    };
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  }
  if (args.indexOf('--live') !== -1) {
    console.log('TEST-CELLGATE-HOLDOUT-B-LIVE: no live mode — the live field-fight proof is test-cellgate-floor-b.js --live (24/24 on this base); the holdout reuses that proof unchanged.');
    process.exit(0);
  }
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
  // Frozen band (fresh, prereg §3).
  check('band: 64 contiguous fresh seeds 107670-107733', BAND_END - BAND_START + 1 === BAND_N, BAND_START + '-' + BAND_END);
  check('band: pilot is the first 8 seeds', PILOT_N === 8 && PILOT_END === 107677);
  check('band: no overlap with any reserved range',
    RESERVED.every(function (r) { return BAND_END < r[0] || BAND_START > r[1]; }),
    JSON.stringify(RESERVED.filter(function (r) { return !(BAND_END < r[0] || BAND_START > r[1]); })));
  check('band: candidate A 107649-107712 collides (Loop A 107617-107669) — recorded, not reused',
    !(107712 < 107617 || 107649 > 107669));
  check('band: candidate B 107549-107600 collides (killarrive 107533-107581) — recorded, not reused',
    !(107600 < 107533 || 107549 > 107581));
  // Bar derivations (prereg §6/§7).
  check('derive: armed GO bar 20/64 is the floor-b GO bar 5/16 scaled x4', GO_MIN_ARMED_VOLLEYS === 20 && 5 / 16 * 64 === 20);
  check('derive: armed GO bar sits below the mechanistic expectation 32/64', GO_MIN_ARMED_VOLLEYS < EXPECTED_ARMED_VOLLEYS && EXPECTED_ARMED_VOLLEYS === 32);
  check('derive: wave-3 GO bar 12/64 is the floor-b GO bar 3/16 scaled x4', GO_MIN_W3_VOLLEYS === 12 && 3 / 16 * 64 === 12);
  check('derive: wave-3 GO bar sits below the mechanistic expectation 28/64', GO_MIN_W3_VOLLEYS < EXPECTED_ARMED_W3_VOLLEYS && EXPECTED_ARMED_W3_VOLLEYS === 28);
  check('derive: control bar 6/64 is the brief-frozen number (16-seed control was 2/16)', GO_MAX_CTL_VOLLEYS === 6);
  check('derive: deaths bar is mean <= +2 AND 95% CI upper <= +5 per run', DEATHS_MEAN_MAX === 2 && DEATHS_CI_HI_MAX === 5);
  // Instrument: driver exports + floor recording (reused unchanged).
  check('driver: stageFirstKillLoot exported', typeof driver.stageFirstKillLoot === 'function');
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'killlootbundle-driver-a.js'), 'utf8');
  check('driver: records cellgateFloor per seed file', /cellgateFloor/.test(driverSrc));
  check('driver: refuses an out-of-range CELLGATE_FLOOR (no silent fallback)', /CELLGATE_FLOOR must be an integer 1\.\.5/.test(driverSrc));
  check('driver: refuses to overwrite a per-seed file (no valid file ever overwritten)', /refusing to overwrite/.test(driverSrc));
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  check('game: fieldFights reads CELLGATE_FLOOR', /CELLGATE_FLOOR/.test(ffSrc));
  check('game: hold compares wave against the live floor', /wave < _cgFloor/.test(ffSrc));
  // Paired-stats math — t quantiles (exact values).
  check('math: t(0.975, 63) = 1.9983', approx(tQuantile(0.975, 63), 1.99834, 0.002), String(tQuantile(0.975, 63)));
  check('math: t(0.975, 15) = 2.1314', approx(tQuantile(0.975, 15), 2.13145, 0.002), String(tQuantile(0.975, 15)));
  check('math: t(0.975, 7) = 2.3646', approx(tQuantile(0.975, 7), 2.36462, 0.002), String(tQuantile(0.975, 7)));
  check('math: t(0.975, 3) = 3.1824', approx(tQuantile(0.975, 3), 3.18245, 0.002), String(tQuantile(0.975, 3)));
  check('math: tCDF(0, df) = 0.5', tCDF(0, 63) === 0.5);
  check('math: tCDF is symmetric', approx(tCDF(1.5, 10), 1 - tCDF(-1.5, 10), 1e-9));
  // Paired-stats math — fixtures (hand-computed).
  const fZero = pairedDeathsStats([0, 0, 0, 0, 0, 0, 0, 0]);
  check('math: all-zero diffs give mean 0, CI [0,0], median 0, tied 8',
    fZero.mean === 0 && fZero.ciLo === 0 && fZero.ciHi === 0 && fZero.median === 0 && fZero.tied === 8 && fZero.worse === 0 && fZero.better === 0);
  check('math: all-zero diffs PASS the deaths bar', judgeDeathsBar(fZero).pass === true);
  // Floor-b 16-seed fixture (prereg §2, carried numbers): diffs sum 82,
  // mean 5.125, sd ~20.0, t(15)=2.1314, CI ~[-5.53, 15.78].
  const fFloorB = pairedDeathsStats([0, 0, 0, 0, 0, 0, 0, 0, 0, 66, 28, 15, 11, -30, -3, -5]);
  check('math: floor-b 16-seed fixture mean is 5.125', approx(fFloorB.mean, 5.125, 1e-9), String(fFloorB.mean));
  check('math: floor-b 16-seed fixture sd is ~20.0', approx(fFloorB.sd, 20.0, 0.01), String(fFloorB.sd));
  check('math: floor-b 16-seed fixture CI is ~[-5.53, 15.78]', approx(fFloorB.ciLo, -5.53, 0.05) && approx(fFloorB.ciHi, 15.78, 0.05), '[' + fFloorB.ciLo + ', ' + fFloorB.ciHi + ']');
  check('math: floor-b 16-seed fixture median 0, worse 4 / better 3 / tied 9',
    fFloorB.median === 0 && fFloorB.worse === 4 && fFloorB.better === 3 && fFloorB.tied === 9);
  check('math: floor-b 16-seed fixture FAILS the deaths bar (mean 5.125 > 2)',
    judgeDeathsBar(fFloorB).pass === false && judgeDeathsBar(fFloorB).meanPass === false);
  // Small hand-checkable fixture: [1,2,3,4] -> mean 2.5, sd 1.291,
  // t(3)=3.1824, CI ~[0.45, 4.55]; mean clause fails, CI clause passes.
  const fSmall = pairedDeathsStats([1, 2, 3, 4]);
  check('math: [1,2,3,4] mean 2.5, median 2.5, worse 4', approx(fSmall.mean, 2.5, 1e-9) && fSmall.median === 2.5 && fSmall.worse === 4);
  check('math: [1,2,3,4] CI is ~[0.45, 4.55]', approx(fSmall.ciLo, 0.4457, 0.01) && approx(fSmall.ciHi, 4.5543, 0.01), '[' + fSmall.ciLo + ', ' + fSmall.ciHi + ']');
  check('math: [1,2,3,4] FAILS the deaths bar on the mean clause only',
    judgeDeathsBar(fSmall).pass === false && judgeDeathsBar(fSmall).meanPass === false && judgeDeathsBar(fSmall).ciPass === true);
  // CI-clause failure: mean 0 but wide CI.
  const fWide = pairedDeathsStats([10, 10, -10, -10, 5, 5, -5, -5]);
  check('math: wide-zero-mean fixture CI is ~[-7.07, 7.07]', approx(fWide.ciLo, -7.07, 0.05) && approx(fWide.ciHi, 7.07, 0.05), '[' + fWide.ciLo + ', ' + fWide.ciHi + ']');
  check('math: wide-zero-mean fixture FAILS the deaths bar on the CI clause only',
    judgeDeathsBar(fWide).pass === false && judgeDeathsBar(fWide).meanPass === true && judgeDeathsBar(fWide).ciPass === false);
  // Realistic PASS fixture: [1,0,-1,2,0,1,-2,1] -> mean 0.25, CI ~[-0.82, 1.32].
  const fPass = pairedDeathsStats([1, 0, -1, 2, 0, 1, -2, 1]);
  check('math: realistic PASS fixture mean 0.25, median 0.5, worse 4 / better 2 / tied 2',
    approx(fPass.mean, 0.25, 1e-9) && fPass.median === 0.5 && fPass.worse === 4 && fPass.better === 2 && fPass.tied === 2);
  check('math: realistic PASS fixture CI is ~[-0.82, 1.32]', approx(fPass.ciLo, -0.82, 0.05) && approx(fPass.ciHi, 1.32, 0.05), '[' + fPass.ciLo + ', ' + fPass.ciHi + ']');
  check('math: realistic PASS fixture PASSES the deaths bar', judgeDeathsBar(fPass).pass === true);
  // Bar wiring — volley bars on synthetic counts.
  const vbPass = judgeVolleyBars(20, 12, 6);
  check('bars: volley bars PASS at exactly the thresholds (20/12/6)', vbPass.bar3.pass && vbPass.bar4.pass && vbPass.bar6.pass);
  check('bars: volley bars FAIL one below each threshold (19/11/7)',
    !judgeVolleyBars(19, 12, 6).bar3.pass && !judgeVolleyBars(20, 11, 6).bar4.pass && !judgeVolleyBars(20, 12, 7).bar6.pass);
  check('bars: volley bars PASS above the thresholds (32/28/2)', judgeVolleyBars(32, 28, 2).bar3.pass && judgeVolleyBars(32, 28, 2).bar4.pass && judgeVolleyBars(32, 28, 2).bar6.pass);
  // Bar wiring — guardrails on synthetic aggregates.
  check('bars: guardrails PASS at the thresholds (starv +2, median -20)',
    judgeGuardrails({ starvDeaths: 9, medianSurvival: 149 }, { starvDeaths: 11, medianSurvival: 129 }).pass === true);
  check('bars: guardrails FAIL on starvation +3',
    judgeGuardrails({ starvDeaths: 9, medianSurvival: 149 }, { starvDeaths: 12, medianSurvival: 149 }).pass === false);
  check('bars: guardrails FAIL on median -21',
    judgeGuardrails({ starvDeaths: 9, medianSurvival: 149 }, { starvDeaths: 9, medianSurvival: 128 }).pass === false);
  // Bar wiring — panel bar on synthetic compare JSONs.
  function synthCompare(statuses) {
    return { decision: 'review_required', policies: [{ policy: 'killlootbundle-a', metrics: statuses.map(function (s) { return { id: s[0], status: s[1], delta: 0, interval95: [0, 0] }; }) }] };
  }
  check('bars: panel bar PASSES with all-allowed statuses',
    judgePanelBar(synthCompare([['won', 'descriptive'], ['national', 'no_material_signal'], ['villageDeaths', 'no_material_signal']])).pass === true);
  check('bars: panel bar PASSES with a deaths-row regression_watch (judged by bar 5, not bar 8)',
    judgePanelBar(synthCompare([['villageDeaths', 'regression_watch'], ['villageDeaths100Days', 'regression_watch'], ['won', 'descriptive']])).pass === true);
  check('bars: panel bar records the deaths watch rows for reconciliation',
    judgePanelBar(synthCompare([['villageDeaths', 'regression_watch']])).deathsWatch.length === 1);
  check('bars: panel bar FAILS on a non-deaths regression_watch',
    judgePanelBar(synthCompare([['national', 'regression_watch'], ['villageDeaths', 'no_material_signal']])).pass === false);
  check('bars: panel bar FAILS when the decision is not review_required',
    judgePanelBar({ decision: 'go', policies: [{ metrics: [{ id: 'won', status: 'descriptive' }] }] }).pass === false);
  check('bars: panel bar is unevaluated without a compare JSON', judgePanelBar(null).pass === null);
  // Panel wiring — synthetic corpora through the holdout panel builder
  // + balance-panel compare (writes only under /tmp).
  (function panelWiring() {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'holdout-panel-'));
    try {
      function synthSeed(seed, floor, deaths, gameDays, won, scaleRank, endReason) {
        return { seed: seed, mode: 'arm', cellgateFloor: floor, won: won, scaleRank: scaleRank,
          gameDays: gameDays, endReason: endReason, deaths: Array.from({ length: deaths }, function (_, i) { return { day: i + 1, cause: 'monster' }; }),
          killLootEvents: [], volleyEvents: [], instrumentErrors: [] };
      }
      const ctlDir = path.join(tmp, 'ctl'), armDir = path.join(tmp, 'arm');
      fs.mkdirSync(ctlDir); fs.mkdirSync(armDir);
      [107670, 107671].forEach(function (s) {
        fs.writeFileSync(path.join(ctlDir, 'killlootbundle-a-s' + s + '-killlootbundle-a-arm.json'),
          JSON.stringify(synthSeed(s, 4, 100, 150, false, 'village', 'survived')) + '\n');
        fs.writeFileSync(path.join(armDir, 'killlootbundle-a-s' + s + '-killlootbundle-a-arm.json'),
          JSON.stringify(synthSeed(s, 3, 102, 150, false, 'village', 'survived')) + '\n');
      });
      const outPrefix = path.join(tmp, 'panel');
      execSync('node scripts/build-cellgate-holdout-panels-b.js --out ' + outPrefix +
        ' --before ' + ctlDir + ' --after ' + armDir + ' --seeds 107670,107671',
        { cwd: REPO, stdio: 'pipe' });
      check('panel: builder writes before/after panels for synthetic corpora',
        fs.existsSync(outPrefix + '-before.json.gz') && fs.existsSync(outPrefix + '-after.json.gz'));
      const before = JSON.parse(require('zlib').gunzipSync(fs.readFileSync(outPrefix + '-before.json.gz')).toString('utf8'));
      check('panel: before panel carries the holdout origin + 2 rows + villageDeaths 100',
        before.options.origin === 'sim-cellgate-holdout-b' && before.rows.length === 2 &&
        before.rows[0].metrics.villageDeaths === 100 && before.rows[0].row.corpus === 'cellgate-holdout-b-ctl');
      const cmpOut = path.join(tmp, 'compare');
      // balance-panel compare exits 2 whenever the decision is not
      // 'no_material_signal' (review_required is the normal outcome
      // here) — exit 2 is success-with-a-decision, not a crash; only
      // a thrown error with another status, or a missing output file,
      // is a wiring failure.
      try {
        execSync('node scripts/balance-panel.js compare --before ' + outPrefix + '-before.json.gz' +
          ' --after ' + outPrefix + '-after.json.gz' + ' --out ' + cmpOut,
          { cwd: REPO, stdio: 'pipe' });
      } catch (e) {
        if (e.status !== 2) throw e;
      }
      check('panel: balance-panel compare writes its outputs (exit 0 or 2 = decision, not crash)',
        fs.existsSync(cmpOut + '.json') && fs.existsSync(cmpOut + '.md'));
      const cmp = JSON.parse(fs.readFileSync(cmpOut + '.json', 'utf8'));
      check('panel: balance-panel compare completes on synthetic panels (decision present)',
        typeof cmp.decision === 'string' && (cmp.policies || []).length === 1);
      const vd = (cmp.policies[0].metrics || []).find(function (m) { return m.id === 'villageDeaths'; });
      check('panel: compare carries the villageDeaths row with paired delta +2',
        !!vd && vd.delta === 2 && vd.pairs === 2);
      check('panel: compare judges the synthetic deaths delta by its own rule (not by bar 5)',
        !!vd && typeof vd.status === 'string');
    } finally {
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
    }
  })();
  console.log('TEST-CELLGATE-HOLDOUT-B: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = {
  BAND_START: BAND_START, BAND_END: BAND_END, BAND_N: BAND_N,
  RESERVED: RESERVED, GO_MIN_ARMED_VOLLEYS: GO_MIN_ARMED_VOLLEYS,
  GO_MIN_W3_VOLLEYS: GO_MIN_W3_VOLLEYS, GO_MAX_CTL_VOLLEYS: GO_MAX_CTL_VOLLEYS,
  DEATHS_MEAN_MAX: DEATHS_MEAN_MAX, DEATHS_CI_HI_MAX: DEATHS_CI_HI_MAX,
  EXPECTED_ARMED_VOLLEYS: EXPECTED_ARMED_VOLLEYS,
  EXPECTED_ARMED_W3_VOLLEYS: EXPECTED_ARMED_W3_VOLLEYS,
  tQuantile: tQuantile, tCDF: tCDF, pairedDeathsStats: pairedDeathsStats,
  judgeDeathsBar: judgeDeathsBar, judgeVolleyBars: judgeVolleyBars,
  judgeGuardrails: judgeGuardrails, judgePanelBar: judgePanelBar,
  validateHoldoutCorpus: validateHoldoutCorpus, corpusPass: corpusPass,
};
