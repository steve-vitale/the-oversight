// killersim-analyze-20261105.js — killer-simultaneity analyzer
// (arm sim-killersim-a). Pure function over per-seed corpus JSON; no
// game reads, no re-scoring. Reuses killerdeath-analyze-20261105's
// killerFates (death-cause split — monsterId/monsterName wins, then
// scholarDeath context, then literal fallen cause; 'the wild' stays a
// residual, never a cause) and overlays the exile/exit tracking this
// arm's instrument adds: exitDay = min(deathDay, exileDay), so a
// killer who leaves stops being a living veteran on the exit day.
// L(d) counts killers with firstDay <= d < exitDay (same-day
// kill-and-exit contributes to NO day — the vetprod rule). Verdict
// rules are the prereg's letter: GO iff the gap is confirmed
// (L>=2 days on <= 1/8 seeds) AND >= 1 named mechanism (M1–M4)
// holds on >= 1 fresh seed; NO iff >= 2 seeds show sustained pairs
// (>= 7 consecutive L>=2 days) with no mechanism visible;
// UNDERPOWERED covers the non-discriminating cases (few banking
// seeds, exactly one sustained pair with no mechanism, gap
// confirmed but no named mechanism — the last case is where the
// evidence judges an UNNAMED mechanism per the prereg parenthetical).
// Usage: node scripts/killersim-analyze-20261105.js <per-seed-dir>
//   Prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const KD = require(path.join(__dirname, 'killerdeath-analyze-20261105'));

function median(vals) {
  if (!vals.length) return null;
  const s = vals.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

function killerFatesEx(row) {
  const base = KD.killerFates(row);
  const exiles = row.exiles || [];
  return base.map(function (f) {
    const exits = exiles.filter(function (x) { return x.vid === f.by && (x.day | 0) >= (f.firstDay | 0); });
    let exileDay = null, exileHow = null;
    exits.forEach(function (x) {
      if (exileDay == null || (x.day | 0) < exileDay) { exileDay = (x.day | 0); exileHow = x.how || null; }
    });
    const deathDay = f.deathDay;
    let exitDay = null, exitKind = null;
    if (deathDay != null && exileDay != null) {
      if (deathDay <= exileDay) { exitDay = deathDay; exitKind = 'death'; }
      else { exitDay = exileDay; exitKind = (exileHow === 'exiled') ? 'exiled' : 'left:' + (exileHow || '?'); }
    } else if (deathDay != null) { exitDay = deathDay; exitKind = 'death'; }
    else if (exileDay != null) { exitDay = exileDay; exitKind = (exileHow === 'exiled') ? 'exiled' : 'left:' + (exileHow || '?'); }
    // Fate label (prereg): earliest exit wins. Died-in-fight iff the
    // death split names a monster, the raw cause is 'combat', or the
    // scholar died in combat on that day.
    let fate = null;
    if (exitDay == null) { fate = 'still-living'; }
    else if (exitKind === 'death') {
      const cs = f.deathCauseSplit || '';
      const inFight = cs.indexOf('monster:') === 0 || f.deathCauseRaw === 'combat' ||
        (f.scholarDeathCtx && f.scholarDeathCtx.inCombat);
      fate = inFight ? 'died-in-fight' : 'died-away';
    } else { fate = exitKind; } // 'exiled' or 'left:<how>'
    return Object.assign({}, f, {
      exileDay: exileDay, exileHow: exileHow,
      exitDay: exitDay, exitKind: exitKind, fate: fate,
      survivalDays: exitDay != null ? (exitDay - (f.firstDay | 0)) : null,
      deathSurvivalDays: f.killToDeathDays,
    });
  });
}

function livingOnDay(fates, d) {
  return fates.filter(function (f) {
    return f.firstDay <= d && (f.exitDay == null || d < f.exitDay);
  }).length;
}

function longestRun(days, pred) {
  let best = 0, cur = 0, prev = null;
  days.forEach(function (d) {
    if (pred(d)) { cur = (prev != null && d.day === prev + 1) ? cur + 1 : 1; if (cur > best) best = cur; }
    else { cur = 0; }
    prev = d.day;
  });
  return best;
}

function analyzeSeed(row) {
  const fates = killerFatesEx(row);
  const days = [];
  (row.daily || []).forEach(function (s) {
    const r5 = s.readiness5;
    const L = livingOnDay(fates, s.day);
    days.push({
      day: s.day, raw: s.raw, gated: s.gated,
      living: L, livingLive: (s.livingKillersDerived != null) ? s.livingKillersDerived : null,
      engineVets: r5 ? (r5.veterans | 0) : null,
      ready: r5 ? !!r5.ready : null,
      short: r5 ? (r5.short || null) : null,
      mismatchEngine: r5 ? (L !== (r5.veterans | 0)) : false,
      mismatchLive: (s.livingKillersDerived != null) ? (L !== s.livingKillersDerived) : false,
    });
  });
  const endDay = days.length ? days[days.length - 1].day : null;
  const l2Days = days.filter(function (d) { return d.living >= 2; }).map(function (d) { return d.day; });
  const l1Days = days.filter(function (d) { return d.living === 1; }).map(function (d) { return d.day; });
  const readyDays = days.filter(function (d) { return d.ready === true; }).map(function (d) { return d.day; });
  const releaseDays = days.filter(function (d) { return d.living >= 2 && d.gated != null && d.gated >= 200 && d.ready === true; }).map(function (d) { return d.day; });
  const maxLiving = days.reduce(function (m, d) { return d.living > m ? d.living : m; }, 0);
  const longestL2 = longestRun(days, function (d) { return d.living >= 2; });
  const w4fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; });
  const w5fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 5; });
  const w4kills = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const facedFeed = row.wavesFaced || {};
  const facedTypes4 = Object.keys(facedFeed).filter(function (mid) { return (facedFeed[mid] | 0) >= 4; }).length;
  const facedTypes5 = Object.keys(facedFeed).filter(function (mid) { return (facedFeed[mid] | 0) >= 5; }).length;
  const gatedPeak = days.reduce(function (m, d) { return (d.gated != null && d.gated > m) ? d.gated : m; }, 0);
  const rawPeak = days.reduce(function (m, d) { return (d.raw != null && d.raw > m) ? d.raw : m; }, 0);
  // Kill distribution + clustering inputs.
  const killsByKiller = {};
  fates.forEach(function (f) { killsByKiller[f.by] = f.kills; });
  const topKills = fates.reduce(function (m, f) { return f.kills > m ? f.kills : m; }, 0);
  const topShare = w4kills > 0 ? topKills / w4kills : null;
  const fighterSet = {};
  w4fights.forEach(function (f) { (f.fighters || []).forEach(function (v) { if (v) fighterSet[v] = true; }); });
  const killerSet = {};
  fates.forEach(function (f) { killerSet[f.by] = true; });
  const otherFighters = Object.keys(fighterSet).filter(function (v) { return !killerSet[v]; }).length;
  const firstKiller = fates.length ? fates.slice().sort(function (a, b) { return a.firstDay - b.firstDay; })[0] : null;
  // Mechanisms M1–M4 (prereg quantitative forms).
  const m1 = firstKiller && firstKiller.survivalDays != null && firstKiller.survivalDays <= 14;
  const m2 = fates.length === 1 && w4fights.length >= 5;
  const m3 = topShare != null && topShare >= (2 / 3) && otherFighters >= 2;
  const m4 = firstKiller && endDay != null && firstKiller.firstDay >= (endDay - 30);
  const mechanisms = [];
  if (m1) mechanisms.push('M1-dies-fast');
  if (m2) mechanisms.push('M2-never-arrives');
  if (m3) mechanisms.push('M3-clusters');
  if (m4) mechanisms.push('M4-made-late');
  const mismatchesEngine = days.filter(function (d) { return d.mismatchEngine; }).length;
  const mismatchesLive = days.filter(function (d) { return d.mismatchLive; }).length;
  const liveMissing = fates.reduce(function (m, f) { return m + (f.liveMissing | 0); }, 0);
  const fateCounts = {};
  fates.forEach(function (f) { fateCounts[f.fate] = (fateCounts[f.fate] | 0) + 1; });
  return {
    seed: row.seed, days: row.days, endReason: row.endReason, endDay: endDay,
    won: !!row.won, scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    wave4met: ((row.unlockedWave | 0) >= 4) || ((row.maxWave | 0) >= 4) || w4fights.length > 0 || w4kills > 0,
    w4fights: w4fights.length, w5fights: w5fights.length, w4kills: w4kills,
    w4killRate: w4fights.length ? (w4kills / w4fights.length) : null,
    w4facedTypes: facedTypes4, w5facedTypes: facedTypes5,
    killersEver: fates.length, killers: fates, killsByKiller: killsByKiller,
    topKills: topKills, topShare: topShare, otherFighters: otherFighters,
    firstKiller: firstKiller ? { by: firstKiller.by, firstDay: firstKiller.firstDay, survivalDays: firstKiller.survivalDays, deathSurvivalDays: firstKiller.deathSurvivalDays, fate: firstKiller.fate } : null,
    maxLiving: maxLiving, l2Days: l2Days, l1Days: l1Days,
    daysL2: l2Days.length, daysL1: l1Days.length, longestL2Run: longestL2,
    readyDays: readyDays, daysReady5: readyDays.length,
    releaseDays: releaseDays,
    gatedPeak: gatedPeak, rawPeak: rawPeak,
    mechanisms: mechanisms, m1: !!m1, m2: !!m2, m3: !!m3, m4: !!m4,
    fateCounts: fateCounts,
    mismatchEngineDays: mismatchesEngine, mismatchLiveDays: mismatchesLive,
    liveMissingRows: liveMissing,
    instrumentErrors: (row.instrumentErrors || []).length,
    snapshotDays: days.length,
    dayTable: days,
  };
}

function closestSeed(seeds) {
  // Closest to a pair: most L>=2 days, tie-break most ready days, then
  // longest-lived first killer, then lowest seed. If none pairs, the
  // longest-lived first killer (for the sense-test).
  const sorted = seeds.slice().sort(function (a, b) {
    if (b.daysL2 !== a.daysL2) return b.daysL2 - a.daysL2;
    if (b.daysReady5 !== a.daysReady5) return b.daysReady5 - a.daysReady5;
    const as = a.firstKiller && a.firstKiller.survivalDays != null ? a.firstKiller.survivalDays : -1;
    const bs = b.firstKiller && b.firstKiller.survivalDays != null ? b.firstKiller.survivalDays : -1;
    if (bs !== as) return bs - as;
    return a.seed - b.seed;
  });
  return sorted.length ? sorted[0].seed : null;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('killersim-s') === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const clean = seeds.filter(function (s) { return s.instrumentErrors === 0; });
  const banking = seeds.filter(function (s) { return s.killersEver >= 1; });
  const gapSeeds = seeds.filter(function (s) { return s.daysL2 > 0; });
  const sustained = seeds.filter(function (s) { return s.longestL2Run >= 7; });
  const mechSeeds = seeds.filter(function (s) { return s.mechanisms.length > 0; });
  const gapConfirmed = gapSeeds.length <= 1;
  // First-killer survival: exit-based (prereg definition) + death-based
  // (comparable to the 11d/9d priors). Medians only with >= 3 observed.
  const firstExit = seeds.map(function (s) { return s.firstKiller ? s.firstKiller.survivalDays : null; }).filter(function (v) { return v != null; });
  const firstDeath = seeds.map(function (s) { return s.firstKiller ? s.firstKiller.deathSurvivalDays : null; }).filter(function (v) { return v != null; });
  const firstCensored = seeds.filter(function (s) { return s.firstKiller && s.firstKiller.survivalDays == null; }).length;
  const allExit = [];
  seeds.forEach(function (s) { s.killers.forEach(function (k) { if (k.survivalDays != null) allExit.push(k.survivalDays); }); });
  const allDeath = [];
  seeds.forEach(function (s) { s.killers.forEach(function (k) { if (k.deathSurvivalDays != null) allDeath.push(k.deathSurvivalDays); }); });
  let verdict = null, verdictReason = null;
  if (errSeeds > 2) { verdict = 'INSUFFICIENT-DATA'; verdictReason = errSeeds + ' seeds carry instrument errors'; }
  else if (banking.length < 4) { verdict = 'UNDERPOWERED'; verdictReason = 'only ' + banking.length + ' seeds bank >= 1 wave-4 killer'; }
  else if (gapConfirmed && mechSeeds.length >= 1) { verdict = 'DIAG-GO'; verdictReason = 'gap confirmed (' + gapSeeds.length + '/8 seeds with any L>=2 day) and ' + mechSeeds.length + ' seed(s) match a named mechanism: ' + mechSeeds.map(function (s) { return s.seed + ':' + s.mechanisms.join('+'); }).join(', '); }
  else if (sustained.length >= 2 && mechSeeds.length === 0) { verdict = 'DIAG-NO'; verdictReason = sustained.length + ' seeds show sustained L>=2 pairs with no mechanism visible'; }
  else if (sustained.length === 1 && mechSeeds.length === 0) { verdict = 'UNDERPOWERED'; verdictReason = 'exactly 1 sustained pair, no mechanism'; }
  else if (gapConfirmed && mechSeeds.length === 0) { verdict = 'UNDERPOWERED'; verdictReason = 'gap confirmed but no named mechanism reproduced (evidence judges an unnamed mechanism per prereg parenthetical)'; }
  else { verdict = 'UNDERPOWERED'; verdictReason = 'band does not discriminate: ' + gapSeeds.length + ' seeds with L>=2 days, ' + sustained.length + ' sustained, ' + mechSeeds.length + ' mechanism seeds'; }
  const dayList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = dayList.length ? ((dayList[Math.floor((dayList.length - 1) / 2)] + dayList[Math.ceil((dayList.length - 1) / 2)]) / 2) : null;
  const fateTotals = {};
  seeds.forEach(function (s) { Object.keys(s.fateCounts).forEach(function (k) { fateTotals[k] = (fateTotals[k] | 0) + s.fateCounts[k]; }); });
  const wall = {
    wins: seeds.filter(function (s) { return s.won; }).length,
    national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: 0, // not detectable from this corpus; reported as unobserved, never inferred
    wave4unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 4 || (s.maxWave | 0) >= 4; }).length,
    wave4faced: seeds.filter(function (s) { return s.w4fights > 0; }).length,
    wave4kills: seeds.reduce(function (m, s) { return m + s.w4kills; }, 0),
    wave5unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    wave5faced: seeds.filter(function (s) { return s.w5fights > 0 || s.w5facedTypes > 0; }).length,
    medianDays: medianDays,
  };
  return {
    verdict: verdict, verdictReason: verdictReason, n: seeds.length,
    closestSeed: closestSeed(seeds),
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    gapConfirmed: gapConfirmed, gapSeeds: gapSeeds.map(function (s) { return s.seed; }),
    sustainedPairSeeds: sustained.map(function (s) { return s.seed; }),
    mechanismSeeds: mechSeeds.map(function (s) { return { seed: s.seed, mechanisms: s.mechanisms }; }),
    bankingSeeds: banking.length,
    firstKillerSurvivalExit: { intervals: firstExit, median: firstExit.length >= 3 ? median(firstExit) : null, censored: firstCensored },
    firstKillerSurvivalDeath: { intervals: firstDeath, median: firstDeath.length >= 3 ? median(firstDeath) : null },
    allKillerSurvivalExit: { intervals: allExit.sort(function (a, b) { return a - b; }), median: allExit.length >= 3 ? median(allExit) : null },
    allKillerSurvivalDeath: { intervals: allDeath.sort(function (a, b) { return a - b; }), median: allDeath.length >= 3 ? median(allDeath) : null },
    fateTotals: fateTotals,
    wall: wall, seeds: seeds,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: killersim-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { killerFatesEx: killerFatesEx, livingOnDay: livingOnDay, analyzeSeed: analyzeSeed, closestSeed: closestSeed, analyzeDir: analyzeDir, median: median };
