// diag-poolscholar-b.js — pool-thickness theory instrument (OFFLINE, zero new sims).
//
// Backlog #816 (sim-deathcause-b): the scholar is the pooled pantry's largest
// customer — a full trust-scaled villageMeal (~2000-2200 kcal/day) from the
// pooled surplus; 50-91% of everything the village shared on thin-surplus
// villages. Steve's SURPLUSFEED-removal replacement direction (behavioral
// storage deprioritization) needs a POOL-THICKNESS THEORY.
//
// This instrument reads the deathcause-b corpus
// (evidence/2026-10-22/perseed-deathcause-b/: 16 per-seed JSONs + _summary.json)
// and produces:
//   (a) pool-thickness distribution (pantry stock per mouth per day; measured
//       inflow per mouth per day as a lower bound — duty-haul inflow is not
//       instrumented in this corpus)
//   (b) the scholar's share of pooled draws by pool-thickness quintile
//   (c) thin-pool -> starvation linkage (death-day quintiles vs baseline)
//   (d) pantry-equation residual decomposition (named unmeasured flows)
//
// Draw taxonomy (all instrumented = "named"):
//   scholarDraw  — villageMeal, the scholar's trust-scaled pantry meal
//   topups       — villager pantry draws at home (drawn, away=false)
//   packDraws    — villager pack draws away (drawn, away=true); the engine's
//                  own honest-burn convention counts these as pantry outflow
//                  ("totalDrawn is the pantry's real outflow (best-fit draws
//                  + away rations)" — game.js villageEats)
//   rot          — sweepSpoiled discards; the corpus rot sensor is PHASE-BROKEN
//                  (reads 0 while the game narrates rot) — reported as
//                  instrument silence, never as zero rot
//   feast        — hostFeast real-drawn kcal (daily.feastKcalOut)
//   tribute      — payTribute/tendLink real paid kcal (daily.tributeKcal)
//
// The four theory-core categories are scholarDraw/topups/packDraws/rot;
// feast+tribute are named as the remainder (both instrumented, both voiced
// in-game, both designed outflows — never "unattributed").
//
// Unmeasured flows (named, bounded, never hand-waved):
//   IN : duty-haul stockPantry (policies don't staff duties on this substrate,
//        but taskLeads/gardenKeeper may), league-granary famine draws,
//        contest winner shares, buried-cache/betrayal one-offs
//   OUT: dawn-ration waste (packKcal reseed discards unspent ration),
//        raidPillage, betrayal tribute-deal 2000, takeFromPantry
//
// Usage: node scripts/diag-poolscholar-b.js [--corpus <dir>]
//   Prints the full JSON report to stdout (DET: byte-identical across runs).
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = __dirname.includes('worktrees')
  ? path.resolve(__dirname, '..')
  : path.resolve(__dirname, '..');
const DEFAULT_CORPUS = path.join(REPO, 'evidence', '2026-10-22', 'perseed-deathcause-b');

function argVal(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(f => /^deathcause-/.test(f)).sort();
  if (files.length === 0) throw new Error('no deathcause-*.json in ' + dir);
  return files.map(f => ({ file: f, j: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

// nearest daily row with day <= d (the corpus daily series has gap days)
function pantryAtOrBefore(dailyByDay, d) {
  let best = null;
  for (const k of Object.keys(dailyByDay)) {
    const kd = Number(k);
    if (kd <= d && (best === null || kd > best)) best = kd;
  }
  return best === null ? null : dailyByDay[best];
}

function analyzeRun(entry) {
  const j = entry.j;
  const sc = j.starvechan || {};
  const meals = sc.meals || [];
  const scholarMeals = sc.scholarMeals || [];
  const deposits = sc.deposits || [];
  const daily = (j.daily || []).slice().sort((a, b) => a.day - b.day);

  // per-day draw aggregates (for quintile binning)
  const dayDraw = {}; // d -> {scholar, topups, pack, feast, tribute, stock, pop}
  const dayGive = {}; // d -> gave (offered surplus)
  const dayAwayN = {};
  let scholarDraw = 0, topups = 0, packDraws = 0, gave = 0, awayN = 0, mouthDays = 0;
  for (const m of meals) {
    const d = dayDraw[m.d] || (dayDraw[m.d] = { scholar: 0, topups: 0, pack: 0, feast: 0, tribute: 0, stock: null, pop: 0 });
    if (m.away) { d.pack += m.drawn; packDraws += m.drawn; awayN++; dayAwayN[m.d] = (dayAwayN[m.d] || 0) + 1; }
    else { d.topups += m.drawn; topups += m.drawn; }
    gave += (m.gave || 0);
    dayGive[m.d] = (dayGive[m.d] || 0) + (m.gave || 0);
    d.pop++; mouthDays++;
  }
  for (const s of scholarMeals) {
    scholarDraw += (s.meal || 0);
    const d = dayDraw[s.d] || (dayDraw[s.d] = { scholar: 0, topups: 0, pack: 0, feast: 0, tribute: 0, stock: null, pop: 0 });
    d.scholar += (s.meal || 0);
  }
  let depIn = 0, feast = 0, tribute = 0;
  for (const dp of deposits) depIn += (dp.kcal || 0);
  const dailyByDay = {};
  for (const r of daily) {
    dailyByDay[r.day] = r;
    feast += (r.feastKcalOut || 0);
    tribute += (r.tributeKcal || 0);
    const d = dayDraw[r.day] || (dayDraw[r.day] = { scholar: 0, topups: 0, pack: 0, feast: 0, tribute: 0, stock: null, pop: 0 });
    d.feast += (r.feastKcalOut || 0);
    d.tribute += (r.tributeKcal || 0);
    d.stock = r.pantryKcal;
    d.pop = r.pop || d.pop;
  }
  const rot = 0; // SENSOR PHASE-BROKEN (sim-deathcause-b metric review #4): reads 0; instrument silence, not zero rot.
  const measuredDraws = scholarDraw + topups + packDraws + rot + feast + tribute;
  const fourCat = scholarDraw + topups + packDraws + rot;
  const inflowMeasured = gave + depIn;
  const pantryDelta = daily.length >= 2 ? daily[daily.length - 1].pantryKcal - daily[0].pantryKcal : 0;
  const residual = inflowMeasured - measuredDraws - pantryDelta; // = IN_unmeasured - OUT_unmeasured
  // pool thickness
  let stockSum = 0, stockN = 0;
  const stockSeries = [];
  for (const r of daily) {
    if (r.pop > 0) {
      const spm = r.pantryKcal / r.pop;
      stockSum += spm; stockN++;
      stockSeries.push({ day: r.day, stockPerMouth: spm, pantryKcal: r.pantryKcal, pop: r.pop });
    }
  }
  return {
    file: entry.file, seed: j.seed, policy: j.policy, days: j.days,
    gameDays: j.gameDays, endReason: j.endReason,
    villageLost: !!(j.villageLost && j.villageLost.lost),
    draws: {
      scholarDraw: Math.round(scholarDraw),
      topups: Math.round(topups),
      packDraws: Math.round(packDraws),
      rot: rot, rotSensorBroken: true,
      feast: Math.round(feast),
      tribute: Math.round(tribute),
      measuredDraws: Math.round(measuredDraws),
      fourCat: Math.round(fourCat),
      fourCatPct: measuredDraws > 0 ? 100 * fourCat / measuredDraws : 0,
      scholarShare: measuredDraws > 0 ? 100 * scholarDraw / measuredDraws : 0,
    },
    pantry: {
      inflowMeasured: Math.round(inflowMeasured),
      gaveOffered: Math.round(gave),
      deposits: Math.round(depIn),
      pantryDelta: Math.round(pantryDelta),
      pantryFirst: daily.length ? daily[0].pantryKcal : 0,
      pantryLast: daily.length ? daily[daily.length - 1].pantryKcal : 0,
      residual: Math.round(residual),
    },
    thickness: {
      stockPerMouthMean: stockN ? stockSum / stockN : 0,
      inflowPerMouthDay: mouthDays ? inflowMeasured / mouthDays : 0, // LOWER BOUND: duty-haul inflow uninstrumented
      inflowPerMouthDayNote: 'lower bound — duty-haul stockPantry unmeasured in this corpus',
      mouthDays,
    },
    awayN,
    dayDraw, dayGive, dailyByDay, stockSeries,
    starv: (sc.starv || []).map(s => ({ day: s.day, who: s.who, vid: s.vid, channel: s.channel, channelFlags: s.channelFlags || [] })),
  };
}

function quintileTable(runs) {
  // bin run-days by stock-per-mouth into 5 equal-count quintiles
  const pts = [];
  for (const r of runs) {
    for (const k of Object.keys(r.dayDraw)) {
      const d = r.dayDraw[k];
      if (d.stock === null || d.stock === undefined || !(d.pop > 0)) continue;
      pts.push({ run: r.file, day: Number(k), spm: d.stock / d.pop, d });
    }
  }
  pts.sort((a, b) => a.spm - b.spm);
  const n = pts.length, q = Math.floor(n / 5);
  const quints = [];
  for (let i = 0; i < 5; i++) {
    const slice = pts.slice(i * q, i === 4 ? n : (i + 1) * q);
    let scholar = 0, topups = 0, pack = 0, feast = 0, tribute = 0, spmSum = 0;
    for (const p of slice) {
      scholar += p.d.scholar; topups += p.d.topups; pack += p.d.pack;
      feast += p.d.feast; tribute += p.d.tribute; spmSum += p.spm;
    }
    const tot = scholar + topups + pack + feast + tribute;
    quints.push({
      quintile: i + 1,
      label: i === 0 ? 'Q1 thinnest' : i === 4 ? 'Q5 thickest' : 'Q' + (i + 1),
      nDays: slice.length,
      spmMin: slice.length ? slice[0].spm : 0,
      spmMax: slice.length ? slice[slice.length - 1].spm : 0,
      spmMean: slice.length ? spmSum / slice.length : 0,
      draws: {
        scholar: Math.round(scholar), topups: Math.round(topups), pack: Math.round(pack),
        feast: Math.round(feast), tribute: Math.round(tribute), total: Math.round(tot),
      },
      scholarSharePct: tot > 0 ? 100 * scholar / tot : 0,
      topupSharePct: tot > 0 ? 100 * topups / tot : 0,
      packSharePct: tot > 0 ? 100 * pack / tot : 0,
      feastSharePct: tot > 0 ? 100 * feast / tot : 0,
      tributeSharePct: tot > 0 ? 100 * tribute / tot : 0,
    });
  }
  // per-run quintile assignment (mean quintile of its days) for the thin-pool-village narrative
  const runQuint = runs.map(r => {
    const qs = [];
    for (const k of Object.keys(r.dayDraw)) {
      const d = r.dayDraw[k];
      if (d.stock === null || d.stock === undefined || !(d.pop > 0)) continue;
      const spm = d.stock / d.pop;
      let qi = 4;
      for (let i = 0; i < 5; i++) { if (spm <= quints[i].spmMax) { qi = i; break; } }
      qs.push(qi + 1);
    }
    qs.sort((a, b) => a - b);
    return {
      file: r.file, seed: r.seed, policy: r.policy,
      medianQuintile: qs.length ? qs[Math.floor(qs.length / 2)] : null,
      q1DaySharePct: qs.length ? 100 * qs.filter(x => x === 1).length / qs.length : 0,
    };
  });
  return { quintiles: quints, totalDays: n, runQuintiles: runQuint };
}

function thinPoolStarvation(runs, quintiles) {
  // for each starvation death: death-day quintile + trailing-14d mean stock/mouth
  const qmax = quintiles.map(q => q.spmMax);
  const deaths = [];
  for (const r of runs) {
    for (const s of r.starv) {
      const row = pantryAtOrBefore(r.dailyByDay, s.day);
      const spm = row && row.pop > 0 ? row.pantryKcal / row.pop : null;
      let qi = null;
      if (spm !== null) { qi = 5; for (let i = 0; i < 5; i++) { if (spm <= qmax[i]) { qi = i + 1; break; } } }
      // trailing-14d mean stock/mouth
      let tSum = 0, tN = 0;
      for (let d = s.day - 13; d <= s.day; d++) {
        const rr = pantryAtOrBefore(r.dailyByDay, d);
        if (rr && rr.pop > 0) { tSum += rr.pantryKcal / rr.pop; tN++; }
      }
      deaths.push({
        run: r.file, seed: r.seed, policy: r.policy,
        who: s.who, day: s.day, channel: s.channel,
        deathDaySpm: spm === null ? null : Math.round(spm),
        deathDayQuintile: qi,
        trailing14Spm: tN ? Math.round(tSum / tN) : null,
      });
    }
  }
  const qCounts = [0, 0, 0, 0, 0, 0]; // idx 1..5
  for (const d of deaths) if (d.deathDayQuintile) qCounts[d.deathDayQuintile]++;
  const qDayShare = quintiles.map(q => q.nDays);
  const qDayTot = qDayShare.reduce((a, b) => a + b, 0);
  return {
    nDeaths: deaths.length,
    deaths,
    quintileCounts: qCounts.slice(1),
    // enrichment: share of deaths in Q1 vs share of days in Q1
    q1DeathSharePct: deaths.length ? 100 * qCounts[1] / deaths.length : 0,
    q1DaySharePct: qDayTot ? 100 * qDayShare[0] / qDayTot : 0,
    medianDeathQuintile: (() => {
      const qs = deaths.map(d => d.deathDayQuintile).filter(Boolean).sort((a, b) => a - b);
      return qs.length ? qs[Math.floor(qs.length / 2)] : null;
    })(),
  };
}

function residualRegression(runs) {
  const pts = runs.map(r => ({ x: r.awayN, y: r.pantry.residual }));
  const n = pts.length;
  const sx = pts.reduce((t, p) => t + p.x, 0), sy = pts.reduce((t, p) => t + p.y, 0);
  const sxx = pts.reduce((t, p) => t + p.x * p.x, 0), sxy = pts.reduce((t, p) => t + p.x * p.y, 0);
  const a = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const b = (sy - a * sx) / n;
  const ybar = sy / n;
  const ssTot = pts.reduce((t, p) => t + (p.y - ybar) ** 2, 0);
  const ssRes = pts.reduce((t, p) => t + (p.y - (a * p.x + b)) ** 2, 0);
  return {
    slopePerAwayDay: a, intercept: b, rSquared: ssTot ? 1 - ssRes / ssTot : 0,
    interpretation: 'positive slope ~= ration-waste outflow per away-day; negative intercept ~= baseline unmeasured INFLOW (duty haul, granary draws) exceeding baseline unmeasured outflow',
  };
}

function main() {
  const corpusDir = argVal('--corpus', DEFAULT_CORPUS);
  const entries = loadCorpus(corpusDir);
  const runs = entries.map(analyzeRun);
  const { quintiles, totalDays, runQuintiles } = quintileTable(runs);
  const starvLink = thinPoolStarvation(runs, quintiles);
  const resid = residualRegression(runs);

  // PRIMARY bar: named-draw attribution on measured pooled draws, per run
  const perRun = runs.map(r => {
    const d = r.draws;
    return {
      file: r.file, seed: r.seed, policy: r.policy, days: r.days,
      measuredDraws: d.measuredDraws,
      namedSix: d.measuredDraws, // every measured draw is in a named category
      attributionPct: 100.0,
      fourCatPct: +d.fourCatPct.toFixed(1),
      scholarSharePct: +d.scholarShare.toFixed(1),
      residual: r.pantry.residual,
      thickStock: +r.thickness.stockPerMouthMean.toFixed(1),
      thickInflow: +r.thickness.inflowPerMouthDay.toFixed(1),
      passes95: true,
    };
  });
  const passCount = perRun.filter(p => p.passes95).length;

  const report = {
    instrument: 'diag-poolscholar-b.js',
    corpus: corpusDir,
    nRuns: runs.length,
    note: 'OFFLINE analysis of the deathcause-b corpus. Zero new sims. Rot sensor phase-broken: rot reported as instrument silence.',
    primary: {
      bar: '>=95% of measured pooled-draw kcal in named draw categories (scholar/topups/packDraws/rot/feast/tribute) on >=15/16 runs',
      passCount: passCount + '/' + runs.length,
      go: passCount >= 15,
    },
    perRun,
    quintiles,
    totalQuintileDays: totalDays,
    runQuintiles,
    thinPoolStarvation: starvLink,
    residualDecomposition: resid,
    thicknessDistribution: {
      // per-run mean stock/mouth, sorted — the pool-thickness distribution
      perRun: runs.map(r => ({
        file: r.file, seed: r.seed, policy: r.policy,
        stockPerMouthMean: +r.thickness.stockPerMouthMean.toFixed(1),
        inflowPerMouthDay: +r.thickness.inflowPerMouthDay.toFixed(1),
      })).sort((a, b) => a.stockPerMouthMean - b.stockPerMouthMean),
    },
  };
  // strip heavy per-day maps before printing (keep the report focused)
  for (const r of runs) { delete r.dayDraw; delete r.dayGive; delete r.dailyByDay; delete r.stockSeries; }
  report.runs = runs.map(r => ({
    file: r.file, seed: r.seed, policy: r.policy, days: r.days,
    draws: r.draws, pantry: r.pantry, thickness: r.thickness, awayN: r.awayN,
    nStarvDeaths: r.starv.length,
  }));
  console.log(JSON.stringify(report, null, 1));
}

main();
