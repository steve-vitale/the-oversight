// freshkill-analyze-20261105.js — fresh-kill inversion DIAG analyzer
// (arm sim-freshkill-a, run fleshout-20261105T1515Z). Pure function over
// corpus JSON; no game reads, no re-scoring. Channel classifier + ±1-day
// kill matcher are the new measurement; everything else (wall numbers,
// chains, 1-HP arrivals, lift fidelity) follows the grindfinish analyzer
// shape so the two bands compare directly.
//
// Channels (prereg; precedence A > C > B > D), per wave-4 player-TB fight:
//   A — pending-live wanderer fresh-entry: !lifted && pendingLive &&
//       entryFracHiPrimary >= 0.75  (scholar-initiated wild fight)
//   C — wounded-entry: entryFracHiPrimary < 0.25  (grind tail)
//   B — lifted-siege: lifted, not A, not C  (forced treeline siege)
//   D — other TB: non-lifted non-pending (contest/trial/bystander,
//       door-flee re-engage, veteran rolls), plus pending-live fights
//       that fail the fresh leg.
// Field fights carry no channel.
//
// Kill matching — the ±1-day join (staypolicy metric review): a wave-4
// kill-log row matches at most one fight, a fight at most one kill.
// Greedy in kill-log order; prefer a fight starting the SAME day, else a
// fight starting the PREVIOUS day (kill logged day N+1 for a fight that
// started day N — midnight-spanning kills). TB "kill-or-rout" endings are
// NEVER counted as kills without a matched kill-log row. Unmatched kills
// are reported, never silently assigned. The analyzer ALSO computes
// same-day-only matches so this band compares to grindfinish's same-day
// rule; the verdict is judged on the ±1-day join only.
// Usage: node scripts/freshkill-analyze-20261105.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');

function median(nums) {
  const s = nums.filter(function (n) { return n != null && isFinite(n); }).sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}
function share(num, den) { return den ? num / den : null; }

// Channel attribution for one wave-4 player-TB fight record. Returns
// 'A' | 'B' | 'C' | 'D', or null for non-TB fights.
function channelOf(f) {
  if (!f || f.channel !== 'player-tb') return null;
  const frac = (f.entryFracHiPrimary != null) ? f.entryFracHiPrimary : null;
  if (!f.lifted && f.pendingLive && frac != null && frac >= 0.75) return 'A';
  if (frac != null && frac < 0.25) return 'C';
  if (f.lifted) return 'B';
  return 'D';
}

// D sub-classification (residual reporting only).
function dSub(f) {
  if (!f || f.channel !== 'player-tb') return null;
  if (f.pendingLive) return 'pendingLive-nonfresh';
  if (f.primaryVeteran) return 'veteran';
  if (f.doorFledAtEntry && f.doorFledAtEntry.length) return 'doorFled';
  return 'contestOrTrial';
}

// ±1-day join. Mutates fights with _matchedKill / _matchedKillDayOffset.
// Returns the list of unmatched kill-log rows.
function matchKills(fights, log) {
  const usedFight = {};
  const unmatched = [];
  log.forEach(function (e) {
    const eDay = (e.d | 0);
    let best = -1, bestOffset = null;
    for (let i = 0; i < fights.length; i++) {
      if (usedFight[i]) continue;
      const f = fights[i];
      if (e.mid !== f.mid) continue;
      if (!f.fighters || f.fighters.indexOf(e.by) < 0) continue;
      const off = eDay - (f.day | 0);
      if (off === 0) { best = i; bestOffset = 0; break; }
      if (off === 1 && best < 0) { best = i; bestOffset = 1; }
    }
    if (best >= 0) {
      usedFight[best] = true;
      fights[best]._matchedKill = e;
      fights[best]._matchedKillDayOffset = bestOffset;
    } else {
      unmatched.push(e);
    }
  });
  fights.forEach(function (f) { if (!f._matchedKill) { f._matchedKill = null; f._matchedKillDayOffset = null; } });
  return unmatched;
}

// Same-day-only matching (grindfinish rule) for the comparability table.
// Operates on a shallow copy of the fight list so it never disturbs the
// ±1-day attribution. Returns { matchedCount, unmatched }.
function matchKillsSameDay(fights, log) {
  const used = {};
  let matched = 0;
  const unmatched = [];
  log.forEach(function (e) {
    let hit = -1;
    for (let i = 0; i < fights.length; i++) {
      if (used[i]) continue;
      const f = fights[i];
      if ((e.d | 0) === (f.day | 0) && e.mid === f.mid && f.fighters && f.fighters.indexOf(e.by) >= 0) { hit = i; break; }
    }
    if (hit >= 0) { used[hit] = true; matched++; }
    else unmatched.push(e);
  });
  return { matchedCount: matched, unmatched: unmatched };
}

function channelTable(tb) {
  const out = {};
  ['A', 'B', 'C', 'D'].forEach(function (ch) {
    const arr = tb.filter(function (f) { return channelOf(f) === ch; });
    const kills = arr.filter(function (f) { return !!f._matchedKill; });
    const endings = { death: 0, 'kill-or-rout': 0, flee: 0, unfinished: 0, other: 0 };
    arr.forEach(function (f) {
      if (endings[f.ending] != null) endings[f.ending]++;
      else endings.other++;
    });
    out[ch] = {
      fights: arr.length,
      kills: kills.length,
      killRate: share(kills.length, arr.length),
      entryFracHiMedian: median(arr.map(function (f) { return f.entryFracHiPrimary; })),
      damageFracMedian: median(arr.map(function (f) { return f.damageFrac; })),
      roundsMedian: median(arr.map(function (f) { return f.rounds; })),
      partySizeMedian: median(arr.map(function (f) { return f.partySize; })),
      soloFights: arr.filter(function (f) { return (f.partySize | 0) <= 1; }).length,
      soloKills: kills.filter(function (f) { return (f.partySize | 0) <= 1; }).length,
      partyKills: kills.filter(function (f) { return (f.partySize | 0) > 1; }).length,
      endings: endings,
    };
  });
  return out;
}

function analyzeSeed(row) {
  const fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; });
  const log = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); });
  const unmatchedKills = matchKills(fights, log);
  const sameDay = matchKillsSameDay(fights, log);
  const field = fights.filter(function (f) { return f.channel === 'field'; });
  const tb = fights.filter(function (f) { return f.channel === 'player-tb'; });

  const channels = channelTable(tb);
  // Same-day-only channel table (comparability secondary).
  const sameDayChannels = {};
  ['A', 'B', 'C', 'D'].forEach(function (ch) {
    const arr = tb.filter(function (f) { return channelOf(f) === ch; });
    sameDayChannels[ch] = { fights: arr.length, killsSameDay: 0, killRateSameDay: null };
  });
  // Recompute same-day attribution per channel without disturbing _matchedKill.
  const usedSd = {};
  log.forEach(function (e) {
    for (let i = 0; i < tb.length; i++) {
      if (usedSd[i]) continue;
      const f = tb[i];
      if ((e.d | 0) === (f.day | 0) && e.mid === f.mid && f.fighters && f.fighters.indexOf(e.by) >= 0) {
        usedSd[i] = true;
        const ch = channelOf(f);
        if (ch) sameDayChannels[ch].killsSameDay++;
        break;
      }
    }
  });
  ['A', 'B', 'C', 'D'].forEach(function (ch) {
    sameDayChannels[ch].killRateSameDay = share(sameDayChannels[ch].killsSameDay, sameDayChannels[ch].fights);
  });

  const dSubs = { 'pendingLive-nonfresh': 0, veteran: 0, doorFled: 0, contestOrTrial: 0 };
  tb.filter(function (f) { return channelOf(f) === 'D'; }).forEach(function (f) { dSubs[dSub(f)]++; });

  // Lift fidelity + pending-live share (grindfinish mechanism checks).
  const lifted = tb.filter(function (f) { return !!f.lifted; });
  const liftChecked = lifted.filter(function (f) { return f.worldHpAtLift && f.worldHpAtLift.hp != null && f.entryHpPrimary != null; });
  const liftMatch = liftChecked.filter(function (f) { return f.entryHpPrimary === f.worldHpAtLift.hp; }).length;

  // Chains: per-mid fight sequences (field + TB, day order).
  const chains = {};
  fights.slice().sort(function (a, b) { return a.day - b.day; }).forEach(function (f) {
    (chains[f.mid] = chains[f.mid] || []).push({
      day: f.day, channel: f.channel === 'field' ? 'F' : 'TB',
      tbChannel: f.channel === 'player-tb' ? channelOf(f) : null,
      entry: (f.channel === 'field') ? f.entryHp : f.entryHpPrimary,
      exit: (f.channel === 'field') ? f.mHpLeft : f.mHpLeftPrimary,
      entryFracHi: (f.channel === 'field') ? f.entryFracHi : f.entryFracHiPrimary,
      lifted: (f.channel === 'player-tb') ? !!f.lifted : null,
      pendingLive: (f.channel === 'player-tb') ? !!f.pendingLive : null,
      ending: f.ending, kill: !!f._matchedKill, killDayOffset: f._matchedKillDayOffset,
      rounds: f.rounds, partySize: f.partySize });
  });

  const daily = row.daily || [];
  let ready5Days = 0;
  daily.forEach(function (s) {
    if (s.readiness5 && (s.readiness5.veterans | 0) >= 2) ready5Days++;
  });
  const killers = {};
  log.forEach(function (e) { if (e.by) killers[e.by] = true; });
  const deadMap = row.deadMap || null;
  const fallen = row.fallen || [];
  const livingKillers = Object.keys(killers).filter(function (by) {
    if (deadMap && deadMap[by] !== undefined) return !deadMap[by];
    return !fallen.some(function (f) { return f.villagerId === by; });
  });

  return {
    seed: row.seed, run: row.run || null, days: row.days, endReason: row.endReason, won: !!row.won,
    w4fights: fights.length, w4field: field.length, w4tb: tb.length,
    w4killsLog: log.length, w4killsMatched: fights.filter(function (f) { return !!f._matchedKill; }).length,
    unmatchedKills: unmatchedKills.length,
    killsMatchedNextDay: fights.filter(function (f) { return f._matchedKillDayOffset === 1; }).length,
    sameDayMatched: sameDay.matchedCount, sameDayUnmatched: sameDay.unmatched.length,
    killRate: share(fights.filter(function (f) { return !!f._matchedKill; }).length, fights.length),
    tbKillRate: share(tb.filter(function (f) { return !!f._matchedKill; }).length, tb.length),
    fieldKillRate: share(field.filter(function (f) { return !!f._matchedKill; }).length, field.length),
    channels: channels, sameDayChannels: sameDayChannels, dSubs: dSubs,
    liftFidelityMatch: liftMatch, liftFidelityChecked: liftChecked.length,
    pendingLiveTb: tb.filter(function (f) { return !!f.pendingLive; }).length,
    worldOriginTb: tb.filter(function (f) { return !!f.worldOriginPresent; }).length,
    veteranTb: tb.filter(function (f) { return !!f.primaryVeteran; }).length,
    doorFledReengages: tb.filter(function (f) { return f.doorFledAtEntry && f.doorFledAtEntry.length; }).length,
    oneHp: {
      fieldEnter1Hp: field.filter(function (f) { return f.entryHp === 1; }).length,
      tbEnter1Hp: tb.filter(function (f) { return f.entryHpPrimary === 1; }).length,
      fieldExit1Hp: field.filter(function (f) { return f.mHpLeft === 1; }).length,
    },
    killersEver: Object.keys(killers).length, livingKillersAtEnd: livingKillers.length,
    ready5Days: ready5Days,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    standing: row.standing,
    instrumentErrors: (row.instrumentErrors || []).length,
    chains: chains,
    fights: fights.map(function (f) {
      return { day: f.day, channel: f.channel, tbChannel: f.channel === 'player-tb' ? channelOf(f) : null,
        fighter: f.fighter, fighters: f.fighters, mid: f.mid,
        entryHp: f.entryHp, entryHpPrimary: f.entryHpPrimary || null,
        entryFracHi: f.entryFracHi || null, entryFracHiPrimary: f.entryFracHiPrimary || null,
        damageDealt: f.damageDealt, damageFrac: f.damageFrac, rounds: f.rounds,
        partySize: f.partySize, ending: f.ending, outcomeRaw: f.outcomeRaw,
        mHpLeft: f.mHpLeft, mHpLeftPrimary: f.mHpLeftPrimary || null,
        lifted: (f.channel === 'player-tb') ? !!f.lifted : null,
        pendingLive: (f.channel === 'player-tb') ? !!f.pendingLive : null,
        worldHpAtLift: f.worldHpAtLift || null, doorFledAtEntry: f.doorFledAtEntry || null,
        primaryVeteran: !!f.primaryVeteran, worldOriginPresent: !!f.worldOriginPresent,
        matchedKillBy: f._matchedKill ? f._matchedKill.by : null,
        matchedKillDayOffset: f._matchedKillDayOffset,
        gear: f.gear || null, allyVid: f.allyVid || null, intent: f.intent || null };
    }),
  };
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'freshkill-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const allFights = [];
  seeds.forEach(function (s) { s.fights.forEach(function (f) { allFights.push(Object.assign({ seed: s.seed }, f)); }); });
  const allTb = allFights.filter(function (f) { return f.channel === 'player-tb'; });
  const allField = allFights.filter(function (f) { return f.channel === 'field'; });

  // Band channel table (±1-day join).
  const channels = {};
  ['A', 'B', 'C', 'D'].forEach(function (ch) {
    const arr = allTb.filter(function (f) { return f.tbChannel === ch; });
    const kills = arr.filter(function (f) { return f.matchedKillBy; });
    channels[ch] = {
      fights: arr.length, kills: kills.length,
      killRate: share(kills.length, arr.length),
      entryFracHiMedian: median(arr.map(function (f) { return f.entryFracHiPrimary; })),
      damageFracMedian: median(arr.map(function (f) { return f.damageFrac; })),
      roundsMedian: median(arr.map(function (f) { return f.rounds; })),
      partySizeMedian: median(arr.map(function (f) { return f.partySize; })),
      soloFights: arr.filter(function (f) { return (f.partySize | 0) <= 1; }).length,
      soloKills: kills.filter(function (f) { return (f.partySize | 0) <= 1; }).length,
      partyKills: kills.filter(function (f) { return (f.partySize | 0) > 1; }).length,
    };
  });
  // Band same-day-only channel table (grindfinish-rule comparison).
  const sameDayChannels = {};
  ['A', 'B', 'C', 'D'].forEach(function (ch) {
    sameDayChannels[ch] = { fights: 0, killsSameDay: 0, killRateSameDay: null };
  });
  seeds.forEach(function (s) {
    ['A', 'B', 'C', 'D'].forEach(function (ch) {
      sameDayChannels[ch].fights += s.sameDayChannels[ch].fights;
      sameDayChannels[ch].killsSameDay += s.sameDayChannels[ch].killsSameDay;
    });
  });
  ['A', 'B', 'C', 'D'].forEach(function (ch) {
    sameDayChannels[ch].killRateSameDay = share(sameDayChannels[ch].killsSameDay, sameDayChannels[ch].fights);
  });

  // Pairwise channel gaps (verdict inputs).
  const pairs = [];
  ['A', 'B', 'C', 'D'].forEach(function (x, i) {
    ['A', 'B', 'C', 'D'].forEach(function (y, j) {
      if (j <= i) return;
      const rx = channels[x].killRate, ry = channels[y].killRate;
      pairs.push({ x: x, y: y, fightsX: channels[x].fights, fightsY: channels[y].fights,
        rateX: rx, rateY: ry,
        gapPp: (rx != null && ry != null) ? Math.abs(rx - ry) : null,
        bothGe8: channels[x].fights >= 8 && channels[y].fights >= 8 });
    });
  });
  const goPairs = pairs.filter(function (p) { return p.bothGe8 && p.gapPp != null && p.gapPp >= 0.15; });
  const totalTb = allTb.length;
  const diag = {
    goPairs: goPairs,
    go: goPairs.length > 0,
    underpowered: totalTb < 20 && goPairs.length === 0,
    verdict: goPairs.length > 0 ? 'DIAG-GO' : (totalTb < 20 ? 'UNDERPOWERED' : 'DIAG-NO'),
    totalTb: totalTb,
  };

  const wall = { wins: 0, national: 0, table: 0, wave4unlocks: 0, wave4faced: 0, wave5unlocks: 0, wave5faced: 0, medianDays: null, ready5DaysTotal: 0 };
  files.forEach(function (f) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (row.won) wall.wins++;
    if (row.scaleRank === 'national' || row.scaleRank === 'global') wall.national++;
    if (row.tableDone || row.tableEntered) wall.table++;
    if ((row.unlockedWave | 0) >= 4 || (row.maxWave | 0) >= 4) wall.wave4unlocks++;
    if ((row.fights || []).some(function (ev) { return (ev.wave | 0) >= 4; })) wall.wave4faced++;
    if ((row.unlockedWave | 0) >= 5) wall.wave5unlocks++;
    if ((row.fights || []).some(function (ev) { return (ev.wave | 0) >= 5; })) wall.wave5faced++;
  });
  wall.medianDays = median(seeds.map(function (s) { return s.days; }));
  wall.ready5DaysTotal = seeds.reduce(function (m, s) { return m + s.ready5Days; }, 0);

  return { n: seeds.length,
    totalFights: allFights.length, totalTb: totalTb, totalField: allField.length,
    totalKillsLog: seeds.reduce(function (m, s) { return m + s.w4killsLog; }, 0),
    totalKillsMatched: seeds.reduce(function (m, s) { return m + s.w4killsMatched; }, 0),
    totalUnmatchedKills: seeds.reduce(function (m, s) { return m + s.unmatchedKills; }, 0),
    killsMatchedNextDay: seeds.reduce(function (m, s) { return m + s.killsMatchedNextDay; }, 0),
    sameDayMatched: seeds.reduce(function (m, s) { return m + s.sameDayMatched; }, 0),
    sameDayUnmatched: seeds.reduce(function (m, s) { return m + s.sameDayUnmatched; }, 0),
    overallKillRate: share(allFights.filter(function (f) { return f.matchedKillBy; }).length, allFights.length),
    tbKillRate: share(allTb.filter(function (f) { return f.matchedKillBy; }).length, allTb.length),
    fieldKillRate: share(allField.filter(function (f) { return f.matchedKillBy; }).length, allField.length),
    damageFracMedian: median(allFights.map(function (f) { return f.damageFrac; })),
    channels: channels, sameDayChannels: sameDayChannels, pairs: pairs, diag: diag,
    dSubs: {
      'pendingLive-nonfresh': seeds.reduce(function (m, s) { return m + s.dSubs['pendingLive-nonfresh']; }, 0),
      veteran: seeds.reduce(function (m, s) { return m + s.dSubs.veteran; }, 0),
      doorFled: seeds.reduce(function (m, s) { return m + s.dSubs.doorFled; }, 0),
      contestOrTrial: seeds.reduce(function (m, s) { return m + s.dSubs.contestOrTrial; }, 0),
    },
    liftFidelityMatch: seeds.reduce(function (m, s) { return m + s.liftFidelityMatch; }, 0),
    liftFidelityChecked: seeds.reduce(function (m, s) { return m + s.liftFidelityChecked; }, 0),
    pendingLiveTb: seeds.reduce(function (m, s) { return m + s.pendingLiveTb; }, 0),
    worldOriginTb: seeds.reduce(function (m, s) { return m + s.worldOriginTb; }, 0),
    veteranTb: seeds.reduce(function (m, s) { return m + s.veteranTb; }, 0),
    doorFledReengages: seeds.reduce(function (m, s) { return m + s.doorFledReengages; }, 0),
    oneHp: {
      fieldEnter1Hp: seeds.reduce(function (m, s) { return m + s.oneHp.fieldEnter1Hp; }, 0),
      tbEnter1Hp: seeds.reduce(function (m, s) { return m + s.oneHp.tbEnter1Hp; }, 0),
      fieldExit1Hp: seeds.reduce(function (m, s) { return m + s.oneHp.fieldExit1Hp; }, 0),
    },
    totalInstrumentErrors: seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0),
    wall: wall, seeds: seeds, fights: allFights };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: freshkill-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, median: median, matchKills: matchKills, matchKillsSameDay: matchKillsSameDay, channelOf: channelOf, dSub: dSub };
