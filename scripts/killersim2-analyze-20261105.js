// killersim2-analyze-20261105.js — killer-simultaneity re-measure analyzer
// (arm sim-killersim2-b). Pure function over per-seed corpus JSON; no
// game reads, no re-scoring. Reuses killersim-analyze-20261105's
// analyzeSeed (fates with exit tracking, L(d), M1–M4 patterns) and adds
// exactly what the killersim2 prereg fixes:
//  - BANKING SEED: >= 1 wave-4 kill AND the killer alive at end of the
//    kill day (exitDay == null OR exitDay > firstDay). Same-day
//    kill-and-exit (survivalDays 0) does NOT bank.
//  - M3 GUARD (0915Z metric review): clustering requires >= 2 wave-4
//    kills on the seed; at n=1 it is vacuous.
//  - POST-BLOOD DEATH CHANNEL per dead killer: 'contest/arena' vs
//    'wild' vs 'other', derived from the killerdeath split vocabulary
//    (deathCauseSplit). 'the wild (unsplit residual)' counts inside
//    wild but is labelled residual, never cited as a cause. A killer
//    who leaves (exiled / left:<how>) has no death channel.
//  - STAGE-2 measures on the banking subset only: M1 days L>=2, M2
//    first-killer survival, M3 second-killer production (banking seeds
//    with >= 2 killers ever + post-first-blood fights/kills), M4 ready
//    days.
//  - VERDICT per the prereg (judged on the banking subset; the 32-seed
//    screen is the band): UNDERPOWERED iff < 4 banking seeds;
//    INSUFFICIENT-DATA iff > 2 of 32 screen seeds carry instrument
//    errors; DIAG-GO iff powered AND L>=2 days on <= 1 banking seed
//    AND >= 1 named mechanism holds on >= 1 banking seed; DIAG-NO iff
//    >= 2 banking seeds show sustained pairs (>= 7 consecutive L>=2
//    days) with no mechanism visible.
// Usage: node scripts/killersim2-analyze-20261105.js <per-seed-dir>
//   Prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const KS = require(path.join(__dirname, 'killersim-analyze-20261105'));

function median(vals) {
  if (!vals.length) return null;
  const s = vals.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

// A killer banks iff alive at end of the kill day: no exit, or the exit
// falls strictly after the first kill day. survivalDays is
// exitDay - firstDay (null when no exit); same-day exit is 0.
function killerBanks(k) {
  return k.survivalDays == null || k.survivalDays >= 1;
}

function seedBanks(seedSum) {
  return (seedSum.killers || []).some(killerBanks);
}

function deathChannel(fate) {
  // No death (still living, exiled, left) -> no channel.
  if (!fate || fate.exitKind !== 'death' || fate.deathDay == null) return null;
  const split = fate.deathCauseSplit || '';
  if (split === 'alive') return null;
  let m = split.match(/^scholar-death:([^:]+):/);
  if (m) {
    const arg = m[1];
    if (arg === 'arena' || arg === 'contest') return 'contest/arena';
    if (arg === 'the wild') return 'wild';
    if (arg === 'expedition') return 'other:expedition';
    return 'other:' + arg;
  }
  if (split.indexOf('monster:') === 0) return 'wild';
  if (split === 'the wild (unsplit residual)') return 'wild (unsplit residual)';
  if (split === 'unknown (no fallen entry)') return 'other:unknown';
  return 'other:' + split;
}

function guardedMechanisms(seedSum) {
  const out = [];
  if (seedSum.m1) out.push('M1-dies-fast');
  if (seedSum.m2) out.push('M2-never-arrives');
  // M3 guard: >= 2 wave-4 kills on the seed, else vacuous.
  if (seedSum.m3 && seedSum.w4kills >= 2) out.push('M3-clusters');
  if (seedSum.m4) out.push('M4-made-late');
  return out;
}

function postBloodRow(row, seedSum) {
  const first = seedSum.firstKiller;
  if (!first) return { fights: 0, kills: 0, killRate: null };
  const fd = first.firstDay;
  const fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4 && (f.day | 0) > fd; }).length;
  const kills = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4) && (e.d | 0) > fd; }).length;
  return { fights: fights, kills: kills, killRate: fights ? (kills / fights) : null };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('killersim-s') === 0 && f.endsWith('.json'); }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const seeds = rows.map(function (row) {
    const s = KS.analyzeSeed(row);
    s.banks = seedBanks(s);
    s.mechanismsGuarded = guardedMechanisms(s);
    s.postBlood = postBloodRow(row, s);
    s.deathChannels = {};
    (s.killers || []).forEach(function (k) {
      const ch = deathChannel(k);
      if (ch) s.deathChannels[k.by] = ch;
    });
    return s;
  });
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const banking = seeds.filter(function (s) { return s.banks; });
  const pairBanking = banking.filter(function (s) { return s.daysL2 > 0; });
  const sustainedBanking = banking.filter(function (s) { return s.longestL2Run >= 7; });
  const mechBanking = banking.filter(function (s) { return s.mechanismsGuarded.length > 0; });
  const gapConfirmed = pairBanking.length <= 1;
  // Stage-2 measures on the banking subset only.
  const firstExit = banking.map(function (s) { return s.firstKiller ? s.firstKiller.survivalDays : null; }).filter(function (v) { return v != null; });
  const firstDeath = banking.map(function (s) { return s.firstKiller ? s.firstKiller.deathSurvivalDays : null; }).filter(function (v) { return v != null; });
  const firstCensored = banking.filter(function (s) { return s.firstKiller && s.firstKiller.survivalDays == null; }).length;
  const allExit = [];
  banking.forEach(function (s) { s.killers.forEach(function (k) { if (k.survivalDays != null) allExit.push(k.survivalDays); }); });
  const multiKillerBanking = banking.filter(function (s) { return s.killersEver >= 2; }).length;
  const pbFights = banking.reduce(function (m, s) { return m + s.postBlood.fights; }, 0);
  const pbKills = banking.reduce(function (m, s) { return m + s.postBlood.kills; }, 0);
  const readyDaysBanking = banking.reduce(function (m, s) { return m + s.daysReady5; }, 0);
  const releaseDaysBanking = banking.reduce(function (m, s) { return m + s.releaseDays.length; }, 0);
  const channelCounts = {};
  banking.forEach(function (s) {
    Object.keys(s.deathChannels).forEach(function (by) {
      const ch = s.deathChannels[by];
      channelCounts[ch] = (channelCounts[ch] | 0) + 1;
    });
  });
  const fateTotals = {};
  seeds.forEach(function (s) { Object.keys(s.fateCounts).forEach(function (k) { fateTotals[k] = (fateTotals[k] | 0) + s.fateCounts[k]; }); });
  const dayList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = dayList.length ? ((dayList[Math.floor((dayList.length - 1) / 2)] + dayList[Math.ceil((dayList.length - 1) / 2)]) / 2) : null;
  let verdict = null, verdictReason = null;
  if (errSeeds > 2) { verdict = 'INSUFFICIENT-DATA'; verdictReason = errSeeds + ' of ' + seeds.length + ' screen seeds carry instrument errors'; }
  else if (banking.length < 4) { verdict = 'UNDERPOWERED'; verdictReason = 'only ' + banking.length + ' banking seeds (need >= 4)'; }
  else if (gapConfirmed && mechBanking.length >= 1) { verdict = 'DIAG-GO'; verdictReason = 'gap confirmed on banking subset (' + pairBanking.length + '/' + banking.length + ' banking seeds with any L>=2 day) and ' + mechBanking.length + ' banking seed(s) match a named mechanism: ' + mechBanking.map(function (s) { return s.seed + ':' + s.mechanismsGuarded.join('+'); }).join(', '); }
  else if (sustainedBanking.length >= 2 && mechBanking.length === 0) { verdict = 'DIAG-NO'; verdictReason = sustainedBanking.length + ' banking seeds show sustained L>=2 pairs with no mechanism visible'; }
  else if (sustainedBanking.length === 1 && mechBanking.length === 0) { verdict = 'UNDERPOWERED'; verdictReason = 'exactly 1 sustained pair on the banking subset, no mechanism'; }
  else if (gapConfirmed && mechBanking.length === 0) { verdict = 'UNDERPOWERED'; verdictReason = 'gap confirmed on the banking subset but no named mechanism reproduced'; }
  else { verdict = 'UNDERPOWERED'; verdictReason = 'banking subset does not discriminate: ' + pairBanking.length + ' seeds with L>=2 days, ' + sustainedBanking.length + ' sustained, ' + mechBanking.length + ' mechanism seeds'; }
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
    closestSeed: KS.closestSeed(seeds),
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    bankingSeeds: banking.length,
    bankingSeedList: banking.map(function (s) { return s.seed; }),
    gapConfirmedBanking: gapConfirmed,
    pairBankingSeeds: pairBanking.map(function (s) { return s.seed; }),
    sustainedBankingSeeds: sustainedBanking.map(function (s) { return s.seed; }),
    mechanismBankingSeeds: mechBanking.map(function (s) { return { seed: s.seed, mechanisms: s.mechanismsGuarded }; }),
    stage2: {
      m1DaysL2Total: banking.reduce(function (m, s) { return m + s.daysL2; }, 0),
      m1DaysL1Total: banking.reduce(function (m, s) { return m + s.daysL1; }, 0),
      m2FirstKillerSurvivalExit: { intervals: firstExit, median: firstExit.length >= 3 ? median(firstExit) : null, censored: firstCensored },
      m2FirstKillerSurvivalDeath: { intervals: firstDeath, median: firstDeath.length >= 3 ? median(firstDeath) : null },
      m2AllKillerSurvivalExit: { intervals: allExit.sort(function (a, b) { return a - b; }), median: allExit.length >= 3 ? median(allExit) : null },
      m3MultiKillerBankingSeeds: multiKillerBanking,
      m3PostBloodFights: pbFights, m3PostBloodKills: pbKills,
      m3PostBloodKillRate: pbFights ? (pbKills / pbFights) : null,
      m4ReadyDaysTotal: readyDaysBanking,
      m4ReleaseDaysTotal: releaseDaysBanking,
      deathChannels: channelCounts,
    },
    fateTotals: fateTotals,
    wall: wall, seeds: seeds,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: killersim2-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { killerBanks: killerBanks, seedBanks: seedBanks, deathChannel: deathChannel, guardedMechanisms: guardedMechanisms, postBloodRow: postBloodRow, analyzeDir: analyzeDir, median: median };
