// finishhold-analyze-20261105.js — second-killer production analyzer
// (arm sim-finishhold-b). Pure function over corpus JSON; no game reads,
// no re-scoring. Kill attribution is greedy in corpus order: a wave-4 kill
// log entry (day + monster id) is matched to at most one fight on that
// day with that monster, preferring a fight whose fighters include the
// killer. Unmatched kills are reported, never silently assigned. TB
// "kill-or-rout" endings are NEVER counted as kills — only matched kill
// log entries are. Damage fractions use the instrument's entry-HP
// denominator. Signals below encode the prereg's three implicating
// patterns verbatim; the evidence verdict judges them, the analyzer does
// not override the prereg.
// Usage: node scripts/finishhold-analyze-20261105.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');

function median(nums) {
  const s = nums.filter(function (n) { return n != null && isFinite(n); }).sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}
function partyBucket(f) {
  const p = f.partySize | 0;
  if (p <= 1) return 'solo';
  if (p === 2) return 'leader+1';
  return 'larger';
}
function aliveBucket(f) {
  if (!f.firstKiller) return 'noneYet';
  return f.firstKillerAliveAtStart ? 'alive' : 'notAlive';
}
function splitStats(fights) {
  const by = {};
  function add(key, f) {
    const s = by[key] || (by[key] = { fights: 0, kills: 0, killRate: null, endings: {}, damageFracMedian: null, _fracs: [] });
    s.fights++;
    if (f._matchedKill) s.kills++;
    s.endings[f.ending || '?'] = (s.endings[f.ending || '?'] | 0) + 1;
    if (f.damageFrac != null) s._fracs.push(f.damageFrac);
  }
  fights.forEach(function (f) {
    add('alive:' + aliveBucket(f), f);
    add('party:' + partyBucket(f), f);
    add('secondCand:' + (f.secondCandidatePresent ? 'present' : 'absent'), f);
    add('channel:' + (f.channel || '?'), f);
  });
  Object.keys(by).forEach(function (k) {
    by[k].killRate = by[k].fights ? by[k].kills / by[k].fights : null;
    by[k].damageFracMedian = median(by[k]._fracs);
    delete by[k]._fracs;
  });
  return by;
}

function analyzeSeed(row) {
  const fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; });
  const log = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); });
  // CORRECTED second-candidate flag (post-corpus fix, disclosed in the
  // evidence): the judged corpus's instrument computed TB candidates from
  // humanFighterVids, which is [] for solo scholar fights (the scholar's
  // tbfight entry carries no villagerId), so two solo scholar kill fights
  // were coded secondCandidatePresent=false. Recompute from the record's
  // fighters list + kill history strictly BEFORE the fight day (day
  // granularity: a kill earlier the same day by the same fighter is NOT
  // excluded, stated limitation — same-day ordering inside a day is not
  // recoverable from the log). The instrument field is preserved as
  // secondCandidatePresentInstrument for audit; all splits use corrected.
  fights.forEach(function (f) {
    f.secondCandidatePresentInstrument = !!f.secondCandidatePresent;
    const cands = (f.fighters || []).filter(function (vid) {
      if (!vid || vid === f.firstKiller) return false;
      return !log.some(function (e) { return e.by === vid && (e.d | 0) < (f.day | 0); });
    });
    f.secondCandidatesCorrected = cands;
    f.secondCandidatePresent = cands.length > 0;
  });
  // Greedy kill matching, corpus order, STRICT: a kill is matched only to
  // a fight whose fighters include the killer. The earlier fallback (first
  // same-day same-monster fight regardless of fighters) misattributed seed
  // 99154's day-80 eulogy kill to a different scholar's losing fight on
  // the same day; strict matching attributes it to the killer's own won
  // fight. Kills with no fighter-matching fight stay unmatched and are
  // reported, never silently assigned.
  const used = {};
  fights.forEach(function (f) {
    let match = null;
    for (let i = 0; i < log.length; i++) {
      if (used[i]) continue;
      const e = log[i];
      if ((e.d | 0) === (f.day | 0) && e.mid === f.mid && f.fighters && f.fighters.indexOf(e.by) >= 0) { match = i; break; }
    }
    if (match != null) {
      used[match] = true;
      f._matchedKill = log[match];
      f._matchedKillFirst = log.filter(function (e) { return e.by === log[match].by; })
        .every(function (e) { return (e.d | 0) >= (log[match].d | 0); }) &&
        log.filter(function (e) { return e.by === log[match].by && (e.d | 0) === (log[match].d | 0); }).length >= 1 &&
        !log.some(function (e) { return e.by === log[match].by && (e.d | 0) < (log[match].d | 0); });
    } else { f._matchedKill = null; f._matchedKillFirst = false; }
  });
  const unmatchedKills = log.filter(function (e, i) { return !used[i]; });
  const splits = splitStats(fights);
  const daily = row.daily || [];
  let pairSnapshotDay = null;
  daily.forEach(function (s) {
    if (pairSnapshotDay == null && s.readiness5 && (s.readiness5.veterans | 0) >= 2) pairSnapshotDay = s.day;
  });
  const killers = {};
  log.forEach(function (e) { if (e.by) killers[e.by] = true; });
  const deadMap = row.deadMap || null;
  const fallen = row.fallen || [];
  const livingKillers = Object.keys(killers).filter(function (by) {
    if (deadMap && deadMap[by] !== undefined) return !deadMap[by];
    return !fallen.some(function (f) { return f.villagerId === by; });
  });
  const gearArmor = fights.map(function (f) { return f.gear ? f.gear.armorP : null; });
  const gearWeapon = fights.map(function (f) { return f.gear ? f.gear.weaponBonus : null; });
  return {
    seed: row.seed, run: row.run || null, days: row.days, endReason: row.endReason, won: !!row.won,
    w4fights: fights.length, w4killsLog: log.length, w4killsMatched: fights.filter(function (f) { return !!f._matchedKill; }).length,
    unmatchedKills: unmatchedKills.length,
    killRate: fights.length ? fights.filter(function (f) { return !!f._matchedKill; }).length / fights.length : null,
    splits: splits,
    damageFracMedian: median(fights.map(function (f) { return f.damageFrac; })),
    gearArmorPMedian: median(gearArmor), gearArmorPNull: gearArmor.filter(function (x) { return x == null; }).length,
    gearWeaponBonusMedian: median(gearWeapon),
    killersEver: Object.keys(killers).length, livingKillersAtEnd: livingKillers.length,
    pairSnapshotDay: pairSnapshotDay, hasLivingPairSnapshot: pairSnapshotDay != null,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    instrumentErrors: (row.instrumentErrors || []).length,
    fights: fights.map(function (f) {
      return { day: f.day, channel: f.channel, fighter: f.fighter, fighters: f.fighters,
        mid: f.mid, entryHp: f.entryHp, damageDealt: f.damageDealt, damageFrac: f.damageFrac,
        rounds: f.rounds, swingsAttempted: f.swingsAttempted, partySize: f.partySize,
        partyBucket: partyBucket(f), aliveBucket: aliveBucket(f),
        secondCandidatePresent: !!f.secondCandidatePresent, secondCandidates: f.secondCandidatesCorrected || f.secondCandidates || [],
        secondCandidatePresentInstrument: !!f.secondCandidatePresentInstrument,
        firstKiller: f.firstKiller, firstKillerAliveAtStart: f.firstKillerAliveAtStart,
        firstKillerInFight: !!f.firstKillerInFight, daysSinceFirstBlood: f.daysSinceFirstBlood,
        ending: f.ending, outcomeRaw: f.outcomeRaw, allyVid: f.allyVid || null,
        matchedKillBy: f._matchedKill ? f._matchedKill.by : null,
        matchedKillFirst: !!f._matchedKillFirst,
        gear: f.gear || null, allyGear: f.allyGear || null,
        abilitiesUsed: f.abilitiesUsed || null, intent: f.intent || null,
        focusFire: !!f.focusFire, committedFinish: !!f.committedFinish,
        committedRounds: (f.committedRounds | 0) || 0, shoutRound: f.shoutRound != null ? f.shoutRound : null,
        everWinning: !!f.everWinning, everHopeless: !!f.everHopeless };
    }),
  };
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'finishhold-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const allFights = [];
  seeds.forEach(function (s) { s.fights.forEach(function (f) { allFights.push(Object.assign({ seed: s.seed }, f)); }); });
  const splits = splitStats(allFights.map(function (f) {
    // splitStats reads _matchedKill; the per-seed projection renamed it.
    const g = Object.assign({}, f);
    g._matchedKill = f.matchedKillBy ? { by: f.matchedKillBy } : null;
    return g;
  }));
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const wall = { wins: 0, national: 0, table: 0, wave4unlocks: 0, wave4faced: 0, wave5unlocks: 0, wave5faced: 0, medianDays: null };
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
  // Prereg signal table (analyzer computes; evidence judges).
  const aliveFights = allFights.filter(function (f) { return f.aliveBucket === 'alive'; });
  const candShareAlive = aliveFights.length ? aliveFights.filter(function (f) { return f.secondCandidatePresent; }).length / aliveFights.length : null;
  const candFights = allFights.filter(function (f) { return f.secondCandidatePresent; });
  const candKillRate = candFights.length ? candFights.filter(function (f) { return f.matchedKillBy; }).length / candFights.length : null;
  const candDmgMed = median(candFights.map(function (f) { return f.damageFrac; }));
  const aliveRate = splits['alive:alive'] ? splits['alive:alive'].killRate : null;
  const notAliveRate = splits['alive:notAlive'] ? splits['alive:notAlive'].killRate : null;
  const signals = {
    production: { secondCandShareWhileFirstAlive: candShareAlive, aliveFights: aliveFights.length,
      implicated: candShareAlive != null && candShareAlive < 0.33 },
    finishing: { secondCandKillRate: candKillRate, secondCandFights: candFights.length,
      secondCandDamageFracMedian: candDmgMed,
      implicated: candFights.length > 0 && candKillRate != null && candKillRate < 0.10 && candDmgMed != null && candDmgMed < 0.5 },
    exposureRotation: { killRateFirstAlive: aliveRate, killRateFirstNotAlive: notAliveRate,
      implicated: aliveRate != null && notAliveRate != null && aliveRate < 0.5 * notAliveRate && (notAliveRate - aliveRate) >= 0.10 },
    denominatorsSmall: allFights.length < 10,
  };
  const ranked = ['production', 'finishing', 'exposureRotation'].filter(function (k) { return signals[k].implicated; });
  const fieldFights = allFights.filter(function (f) { return f.channel === 'field'; });
  const postBlood = allFights.filter(function (f) { return f.aliveBucket === 'alive' || f.aliveBucket === 'notAlive'; });
  const ff = function (arr) { return { fights: arr.length, kills: arr.filter(function (f) { return f.matchedKillBy; }).length, dmgMed: median(arr.map(function (f) { return f.damageFrac; })), roundsMed: median(arr.map(function (f) { return f.rounds; })), endings: arr.reduce(function (a, f) { a[f.ending || '?'] = (a[f.ending || '?'] | 0) + 1; return a; }, {}) }; };
  const extra = {
    // FINISHHOLD splits: field fights by real joiner (allyVid), NOT by
    // mustered partySize (partySize overstates combatants — DIAG).
    fieldByAlly: { joined: ff(fieldFights.filter(function (f) { return !!f.allyVid; })), noJoiner: ff(fieldFights.filter(function (f) { return !f.allyVid; })) },
    fieldByFocusFire: { focusFire: ff(fieldFights.filter(function (f) { return !!f.focusFire; })), noFocusFire: ff(fieldFights.filter(function (f) { return !f.focusFire; })) },
    fieldAllyJoined: fieldFights.filter(function (f) { return !!f.allyVid; }).length,
    fieldFights: fieldFights.length,
    fieldPartySize3NoAlly: fieldFights.filter(function (f) { return (f.partySize | 0) >= 3 && !f.allyVid; }).length,
    aliveWindowFights: allFights.filter(function (f) { return f.aliveBucket === 'alive'; }).length,
    postFirstBloodFights: postBlood.length,
    postFirstBloodKills: postBlood.filter(function (f) { return f.matchedKillBy; }).length,
    postFirstBloodKillRate: postBlood.length ? postBlood.filter(function (f) { return f.matchedKillBy; }).length / postBlood.length : null,
    tbDeathEndings: allFights.filter(function (f) { return f.channel === 'player-tb' && f.ending === 'death'; }).length,
    tbFights: allFights.filter(function (f) { return f.channel === 'player-tb'; }).length,
  };
  return { n: seeds.length, totalFights: allFights.length,
    totalKillsLog: seeds.reduce(function (m, s) { return m + s.w4killsLog; }, 0),
    totalKillsMatched: seeds.reduce(function (m, s) { return m + s.w4killsMatched; }, 0),
    totalUnmatchedKills: seeds.reduce(function (m, s) { return m + s.unmatchedKills; }, 0),
    overallKillRate: allFights.length ? allFights.filter(function (f) { return f.matchedKillBy; }).length / allFights.length : null,
    damageFracMedian: median(allFights.map(function (f) { return f.damageFrac; })),
    splits: splits, signals: signals, suggestedRank: ranked, extra: extra,
    totalInstrumentErrors: totalErr, wall: wall, seeds: seeds, fights: allFights };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: finishhold-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, median: median, partyBucket: partyBucket, aliveBucket: aliveBucket, splitStats: splitStats };
