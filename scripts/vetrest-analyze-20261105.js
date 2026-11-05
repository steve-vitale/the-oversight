// vetrest-analyze-20261105.js — first-killer survival analyzer
// (arm sim-vetrest-b). Pure function over the per-seed corpus JSON;
// no game reads, no re-scoring. Per-seed computation reuses
// killersim-analyze-20261105's analyzeSeed and killersim2-analyze's
// banking / death-channel / post-blood helpers verbatim (same
// definitions as the grounding screen); this file adds only the
// two-leg (baseline vs vetrest) comparison, the skip accounting,
// the paired first-killer survival, the prereg's cost bars
// (including the §14c roster co-primary), and the verdict per the
// sim-vetrest-b prereg. Usage:
//   node scripts/vetrest-analyze-20261105.js <per-seed-dir>
// Prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const KS = require(path.join(__dirname, 'killersim-analyze-20261105'));
const K2 = require(path.join(__dirname, 'killersim2-analyze-20261105'));

function median(vals) {
  if (!vals.length) return null;
  const s = vals.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

// Non-scholar fallen count (§14c roster co-primary): fallen entries
// whose villagerId never appears as a scholarDeath scholarId on
// that seed. A skip that protects the killer while the village
// dies around them must show up here.
function rosterFallen(row) {
  const sd = {};
  (row.scholarDeaths || []).forEach(function (s) { if (s.scholarId) sd[s.scholarId] = true; });
  return (row.fallen || []).filter(function (f) { return !sd[f.villagerId]; }).length;
}

function starvationDeaths(row) {
  return (row.teleDeaths || []).filter(function (t) { return t && t.cause === 'starvation'; }).length;
}

// Cross-check the skip trace against daily snapshots: a skipped vid
// must not appear as scholarId on any snapshot day inside its
// 45d window. Returns {checked, violations[]}.
function skipCrossCheck(row) {
  const out = { checked: 0, violations: [] };
  const skips = row.vetrestSkips || [];
  const daily = row.daily || [];
  skips.forEach(function (sk) {
    out.checked++;
    daily.forEach(function (snap) {
      if (snap.scholarId === sk.skipped && snap.day >= sk.day && snap.day <= sk.day + 45) {
        out.violations.push({ seed: row.seed, skipped: sk.skipped, day: snap.day, skipDay: sk.day });
      }
    });
  });
  return out;
}

function perSeed(row) {
  const s = KS.analyzeSeed(row);
  s.banks = K2.seedBanks(s);
  s.mechanismsGuarded = K2.guardedMechanisms(s);
  s.postBlood = K2.postBloodRow(row, s);
  s.deathChannels = {};
  (s.killers || []).forEach(function (k) {
    const ch = K2.deathChannel(k);
    if (ch) s.deathChannels[k.by] = ch;
  });
  s.policy = row.policy || null;
  s.flagOn = !!row.flagOn;
  s.villageLost = !!row.villageLost;
  s.skips = (row.vetrestSkips || []).slice();
  s.skipCount = s.skips.length;
  s.skipCheck = skipCrossCheck(row);
  s.rosterFallen = rosterFallen(row);
  s.starvation = starvationDeaths(row);
  return s;
}

function legSummary(seeds) {
  const banking = seeds.filter(function (s) { return s.banks; });
  const pairBanking = banking.filter(function (s) { return s.daysL2 > 0; });
  const firstExit = banking.map(function (s) { return s.firstKiller ? s.firstKiller.survivalDays : null; }).filter(function (v) { return v != null; });
  const firstCensored = banking.filter(function (s) { return s.firstKiller && s.firstKiller.survivalDays == null; }).length;
  const dayList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = dayList.length ? median(dayList) : null;
  const rosterList = seeds.map(function (s) { return s.rosterFallen; });
  const channelCounts = {};
  banking.forEach(function (s) {
    Object.keys(s.deathChannels).forEach(function (by) {
      const ch = s.deathChannels[by];
      channelCounts[ch] = (channelCounts[ch] | 0) + 1;
    });
  });
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
    n: seeds.length,
    closestSeed: KS.closestSeed(seeds),
    totalInstrumentErrors: seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0),
    errSeeds: seeds.filter(function (s) { return s.instrumentErrors > 0; }).length,
    bankingSeeds: banking.length,
    bankingSeedList: banking.map(function (s) { return s.seed; }),
    pairBankingSeeds: pairBanking.map(function (s) { return s.seed; }),
    firstKillerSurvivalExit: { intervals: firstExit, median: firstExit.length >= 3 ? median(firstExit) : null, censored: firstCensored },
    m1DaysL2Total: banking.reduce(function (m, s) { return m + s.daysL2; }, 0),
    m1DaysL1Total: banking.reduce(function (m, s) { return m + s.daysL1; }, 0),
    m3MultiKillerBankingSeeds: banking.filter(function (s) { return s.killersEver >= 2; }).length,
    m3PostBloodFights: banking.reduce(function (m, s) { return m + s.postBlood.fights; }, 0),
    m3PostBloodKills: banking.reduce(function (m, s) { return m + s.postBlood.kills; }, 0),
    m4ReadyDaysTotal: banking.reduce(function (m, s) { return m + s.daysReady5; }, 0),
    deathChannels: channelCounts,
    skipsTotal: seeds.reduce(function (m, s) { return m + s.skipCount; }, 0),
    skipSeeds: seeds.filter(function (s) { return s.skipCount > 0; }).map(function (s) { return s.seed; }),
    skipViolations: seeds.reduce(function (m, s) { return m + s.skipCheck.violations.length; }, 0),
    medianDays: medianDays,
    starvationDeaths: seeds.reduce(function (m, s) { return m + s.starvation; }, 0),
    villageLosses: seeds.filter(function (s) { return s.villageLost; }).length,
    rosterFallenMedian: median(rosterList),
    rosterFallenList: rosterList,
    wall: wall,
    seeds: seeds,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('vetrest-s') === 0 && f.endsWith('.json'); }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const base = legSummary(rows.filter(function (r) { return r.policy === 'baseline'; }).map(perSeed));
  const armed = legSummary(rows.filter(function (r) { return r.policy === 'vetrest'; }).map(perSeed));

  // Paired first-killer survival on banking seeds present in both legs.
  const paired = [];
  base.seeds.forEach(function (bs) {
    if (!bs.banks) return;
    const as = armed.seeds.filter(function (s) { return s.seed === bs.seed && s.banks; })[0];
    if (!as) return;
    paired.push({
      seed: bs.seed,
      baselineFirst: bs.firstKiller,
      armedFirst: as.firstKiller,
      baselineSurvival: bs.firstKiller ? bs.firstKiller.survivalDays : null,
      armedSurvival: as.firstKiller ? as.firstKiller.survivalDays : null,
      sameKiller: !!(bs.firstKiller && as.firstKiller && bs.firstKiller.by === as.firstKiller.by),
    });
  });
  const pairedUp = paired.filter(function (p) { return p.baselineSurvival != null && p.armedSurvival != null && p.armedSurvival > p.baselineSurvival; }).length;
  const pairedDown = paired.filter(function (p) { return p.baselineSurvival != null && p.armedSurvival != null && p.armedSurvival < p.baselineSurvival; }).length;

  // Cost bars (prereg): (i) median days armed >= 0.8x baseline;
  // (ii) starvation armed <= baseline + 2; (iii) losses armed <=
  // baseline + 1; (iv) roster median armed <= baseline median + 2.
  const costBars = {
    medianDays: { baseline: base.medianDays, armed: armed.medianDays, pass: base.medianDays != null && armed.medianDays != null && armed.medianDays >= 0.8 * base.medianDays },
    starvation: { baseline: base.starvationDeaths, armed: armed.starvationDeaths, pass: armed.starvationDeaths <= base.starvationDeaths + 2 },
    losses: { baseline: base.villageLosses, armed: armed.villageLosses, pass: armed.villageLosses <= base.villageLosses + 1 },
    roster: { baseline: base.rosterFallenMedian, armed: armed.rosterFallenMedian, pass: base.rosterFallenMedian != null && armed.rosterFallenMedian != null && armed.rosterFallenMedian <= base.rosterFallenMedian + 2 },
  };
  const costPass = costBars.medianDays.pass && costBars.starvation.pass && costBars.losses.pass && costBars.roster.pass;

  // Primary (prereg, binding): median >= 19d (needs >= 3 observed
  // exits) AND >= 1 banking seed with >= 1 L>=2 day AND cost bars.
  const medianPass = armed.firstKillerSurvivalExit.median != null && armed.firstKillerSurvivalExit.median >= 19;
  const pairPass = armed.pairBankingSeeds.length >= 1;
  const errSeeds = base.errSeeds + armed.errSeeds;
  // Power rule (prereg): UNDERPOWERED iff < 2 banking seeds across
  // both legs, or < 3 observed first-killer exits for the median.
  // The median needs >= 3 observed exits on the ARMED leg to judge.
  const medianPowered = armed.firstKillerSurvivalExit.intervals.length >= 3;
  const pairPowered = (base.bankingSeeds + armed.bankingSeeds) >= 2;
  const powered = pairPowered && medianPowered;

  let verdict = null, verdictReason = null, killClass = null;
  if (errSeeds > 2) {
    verdict = 'INSUFFICIENT-DATA';
    verdictReason = errSeeds + ' legs carry instrument errors';
  } else if (!pairPowered || !medianPowered) {
    verdict = 'UNDERPOWERED';
    verdictReason = 'banking seeds baseline ' + base.bankingSeeds + ' / armed ' + armed.bankingSeeds +
      '; armed observed first-killer exits ' + armed.firstKillerSurvivalExit.intervals.length + ' (need >= 3 for the median)';
  } else if (medianPass && pairPass && costPass) {
    verdict = 'GO';
    verdictReason = 'armed first-killer median ' + armed.firstKillerSurvivalExit.median + 'd >= 19d; ' +
      armed.pairBankingSeeds.length + ' armed banking seed(s) with >= 1 L>=2 day; cost bars hold';
  } else {
    verdict = 'NO-GO';
    const parts = [];
    if (!medianPass) parts.push('median ' + armed.firstKillerSurvivalExit.median + 'd < 19d');
    if (!pairPass) parts.push('no armed banking seed with an L>=2 day');
    if (!costPass) parts.push('cost bar(s) breached');
    verdictReason = parts.join('; ');
    // Kill classification (§14a): METRIC-BROKEN iff the mechanism
    // fired (skips > 0 and paired survival up on >= 1 banking seed)
    // but the median bar missed — the bar needs the scholar-at-kill
    // majority to move, which this lever cannot do (pool ~29%).
    // CONCEPT-DEAD iff zero skips fired. SUBSTRATE-MISSING iff the
    // engine never staged a succession inside a killer's window
    // (no skips AND no succession opportunity — stated by the
    // analyzer only when skips are 0 and no banking seed ever had
    // a fresh killer as top-trust candidate; here: skips 0).
    if (armed.skipsTotal === 0) killClass = 'CONCEPT-DEAD (no skip fired — mechanism never engaged)';
    else if (pairedUp >= 1 && !medianPass) killClass = 'METRIC-BROKEN (skip fires and paired survival rises on ' + pairedUp + ' banking seed(s), but the median bar needs the scholar-at-kill majority, which the skip cannot move)';
    else killClass = 'CONCEPT-DEAD';
  }

  return {
    verdict: verdict, verdictReason: verdictReason, killClass: killClass,
    powered: powered, medianPowered: medianPowered, pairPowered: pairPowered,
    medianPass: medianPass, pairPass: pairPass, costPass: costPass, costBars: costBars,
    paired: paired, pairedUp: pairedUp, pairedDown: pairedDown,
    baseline: base, armed: armed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: vetrest-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeDir: analyzeDir, median: median, rosterFallen: rosterFallen, starvationDeaths: starvationDeaths, skipCrossCheck: skipCrossCheck };
