// finishprobe-analyze-20261106.js — finishing-probe analyzer
// (arm sim-finishprobe-a). Pure function over corpus JSON; no game reads,
// no re-scoring. Kill attribution is STRICT (secondkiller rule): a wave-4
// kill-log entry (day + monster id) is matched to at most one fight on
// that day with that monster whose fighters include the killer.
// Unmatched kills are reported, never silently assigned. TB "won" is
// NEVER counted as a kill — only matched kill-log entries are kills;
// won-without-match is a ROUT (monster fled/dismissed). Field vKill
// without a matched kill-log row is reported as a kill-log gap, never
// counted as a kill. Contest/arena fights (opts.noFlee) are split out
// of the wild counts, never mixed in.
//
// Outputs: ending distribution (overall / wild-field / wild-TB / arena),
// mFlee mechanism table (flag-attributed, never SAY-line), kill-rate
// splits (channel, entry type, entry frac, ally, rounds, damage frac,
// post-first-blood), near-miss table (non-kill endings with the beast
// below its break line), round-cap table, P1–P5 rule evaluation against
// the prereg, per-seed table, wall numbers.
// Usage: node scripts/finishprobe-analyze-20261106.js <per-seed-dir>
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

function matchKills(fights, log) {
  // Greedy strict matching (dmground/secondkiller rule), corpus order.
  const used = {};
  fights.forEach(function (f) {
    let match = null;
    for (let i = 0; i < log.length; i++) {
      if (used[i]) continue;
      const e = log[i];
      if ((e.d | 0) === (f.day | 0) && e.mid === f.mid && f.fighters && f.fighters.indexOf(e.by) >= 0) { match = i; break; }
    }
    if (match != null) { used[match] = true; f._matchedKill = log[match]; }
    else { f._matchedKill = null; }
  });
  return log.filter(function (e, i) { return !used[i]; });
}

function fracBucket(x) {
  if (x == null) return 'unknown';
  if (x < 0.25) return 'wounded';
  if (x >= 0.75) return 'fresh';
  return 'middle';
}

// Monster HP fraction left at fight end, on the denominator the engine
// itself uses for the break line (world maxHp for field fights,
// fighter maxHp for TB). Falls back to defHpHi when no maxHp was read.
function endFrac(f) {
  if (f.channel === 'field') {
    if (f.mHpLeft == null) return null;
    if (f.entryMaxHp != null && f.entryMaxHp > 0) return f.mHpLeft / f.entryMaxHp;
    if (f.defHpHi != null && f.defHpHi > 0) return f.mHpLeft / f.defHpHi;
    return null;
  }
  const hp = (f.mHpLeftPrimary != null) ? f.mHpLeftPrimary : f.mHpLeft;
  if (hp == null) return null;
  if (f.entryMaxHpPrimary != null && f.entryMaxHpPrimary > 0) return hp / f.entryMaxHpPrimary;
  if (f.defHpHi != null && f.defHpHi > 0) return hp / f.defHpHi;
  return null;
}

function entryFrac(f) {
  if (f.channel === 'field') return (f.entryFracHi != null) ? f.entryFracHi : null;
  return (f.entryFracHiPrimary != null) ? f.entryFracHiPrimary : f.entryFracHi;
}

// Field-fight mechanism classification, from rec flags only (never SAY).
function classifyField(f) {
  const e = f.ending;
  if (e === 'kill') return f._matchedKill ? 'kill' : 'kill-no-log-match';
  if (e === 'vDie') return 'villager-death';
  if (e === 'evade') return 'evade';
  if (e === 'mFlee') {
    if (f.staredDown) return 'mflee-stare-down';
    if (f.peaceful) return 'mflee-peacemaker';
    if ((f.abilitiesUsed || []).indexOf('poison') >= 0) return 'mflee-eater-poison';
    if (f.contactFinishAttempted) return 'mflee-contact-finish';
    if (f.volley && (f.volley.dmg | 0) > 0 && (f.rounds | 0) === 0) return 'mflee-volley-driveoff';
    if (f.judges) return 'mflee-arena-judges';
    if ((f.rounds | 0) >= 15) return 'mflee-round-cap';
    return 'mflee-unclassified';
  }
  if (e === 'vFlee') {
    if (f.fleeWise) return 'vflee-suburb-walkout';
    if (f.fleeHpFrac != null) return 'vflee-floor-flee';
    if ((f.rounds | 0) >= 15) return 'vflee-round-cap';
    return 'vflee-unclassified';
  }
  return 'other-' + String(e);
}

// TB-fight mechanism classification: won splits by the kill-log match.
function classifyTb(f) {
  if (f.outcomeRaw === 'won') return f._matchedKill ? 'kill' : (f.monFled ? 'rout-monster-fled' : 'rout-dismissed');
  if (f.outcomeRaw === 'fled') return 'scholar-flee';
  if (f.outcomeRaw === 'lost') return 'scholar-death';
  if (f.outcomeRaw === 'unfinished') return 'unfinished';
  return 'other-' + String(f.outcomeRaw);
}

function classify(f) { return (f.channel === 'field') ? classifyField(f) : classifyTb(f); }

function isKill(f) { return !!(f._matchedKill || f.matchedKillBy); }
function isWild(f) { return !(f.channel === 'field' && f.arena); }
function postBlood(f) { return f.firstDay != null && f.day > f.firstDay; }

function splitRate(arr, pred) {
  const a = arr.filter(pred);
  return { fights: a.length, kills: a.filter(isKill).length, killRate: share(a.filter(isKill).length, a.length) };
}

function analyzeSeed(row) {
  const fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; });
  const log = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); });
  const unmatchedKills = matchKills(fights, log);
  fights.forEach(function (f) { f._mech = classify(f); f._endFrac = endFrac(f); f._entryFrac = entryFrac(f); });
  const wild = fights.filter(isWild);
  const arena = fights.filter(function (f) { return !isWild(f); });
  const field = wild.filter(function (f) { return f.channel === 'field'; });
  const tb = wild.filter(function (f) { return f.channel === 'player-tb'; });
  const fieldArena = arena.filter(function (f) { return f.channel === 'field'; });

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
    w4fights: fights.length, w4wild: wild.length, w4arena: arena.length,
    w4field: field.length, w4tb: tb.length, w4fieldArena: fieldArena.length,
    w4killsLog: log.length, w4killsMatched: fights.filter(isKill).length,
    w4killsWildMatched: wild.filter(isKill).length,
    unmatchedKills: unmatchedKills.length,
    killRateWild: share(wild.filter(isKill).length, wild.length),
    killRateTb: share(tb.filter(isKill).length, tb.length),
    killRateField: share(field.filter(isKill).length, field.length),
    killersEver: Object.keys(killers).length, livingKillersAtEnd: livingKillers.length,
    ready5Days: ready5Days,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    standing: row.standing,
    instrumentErrors: (row.instrumentErrors || []).length,
    fights: fights.map(function (f) {
      return { seed: row.seed, day: f.day, channel: f.channel, arena: !!f.arena,
        fighter: f.fighter, fighters: f.fighters, mid: f.mid,
        entryHp: f.entryHp, entryHpPrimary: f.entryHpPrimary || null,
        entryFrac: f._entryFrac, endFrac: f._endFrac,
        damageDealt: f.damageDealt, damageFrac: f.damageFrac, rounds: f.rounds,
        roundCap: !!f.roundCap, partySize: f.partySize, allyVid: f.allyVid || null,
        ending: f.ending, outcomeRaw: f.outcomeRaw, mech: f._mech,
        mHpLeft: f.mHpLeft, mHpLeftPrimary: f.mHpLeftPrimary || null,
        lifted: (f.channel === 'player-tb') ? !!f.lifted : null,
        pendingLive: !!f.pendingLive, worldOriginPresent: !!f.worldOriginPresent,
        primaryVeteran: !!f.primaryVeteran, monFled: !!f.monFled,
        swingsAttempted: f.swingsAttempted || 0,
        abilitiesUsed: f.abilitiesUsed || null,
        endScholarHp: (f.endScholarHp != null) ? f.endScholarHp : null,
        endScholarMaxHp: (f.endScholarMaxHp != null) ? f.endScholarMaxHp : null,
        committedFinish: !!f.committedFinish, committedRounds: f.committedRounds | 0,
        committedHold: f.committedHold | 0,
        staredDown: !!f.staredDown, peaceful: !!f.peaceful,
        contactFinishAttempted: !!f.contactFinishAttempted,
        volley: f.volley || null, judges: !!f.judges, fleeWise: !!f.fleeWise,
        cornered: !!f.cornered, intent: f.intent || null,
        matchedKillBy: f._matchedKill ? f._matchedKill.by : null,
        postBlood: postBlood(f), firstDay: f.firstDay,
        log: f.log || null };
    }),
  };
}

function countMech(arr) {
  const out = {};
  arr.forEach(function (f) { out[f._mech || f.mech] = (out[f._mech || f.mech] || 0) + 1; });
  return out;
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'finishprobe-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const allFights = [];
  seeds.forEach(function (s) { s.fights.forEach(function (f) { allFights.push(f); }); });
  const wild = allFights.filter(function (f) { return !f.arena || f.channel !== 'field'; });
  const field = wild.filter(function (f) { return f.channel === 'field'; });
  const tb = wild.filter(function (f) { return f.channel === 'player-tb'; });
  const arenaF = allFights.filter(function (f) { return f.channel === 'field' && f.arena; });

  const endings = {
    wild: countMech(wild), field: countMech(field), tb: countMech(tb), arenaField: countMech(arenaF),
  };

  // mFlee mechanism table (wild field only).
  const mFlee = field.filter(function (f) { return f.ending === 'mFlee'; });
  const mFleeMech = countMech(mFlee);
  const bypassMFlee = mFlee.filter(function (f) {
    return f.mech === 'mflee-stare-down' || f.mech === 'mflee-peacemaker' || f.mech === 'mflee-eater-poison';
  });

  // Near-miss: non-kill wild fights with the beast below its break line.
  const nearMiss = wild.filter(function (f) { return !f.matchedKillBy && f.endFrac != null && f.endFrac < 0.15; });
  const nearMissDeep = wild.filter(function (f) { return !f.matchedKillBy && f.endFrac != null && f.endFrac < 0.05; });
  const nearMissByMech = countMech(nearMiss);

  // Round-cap endings (wild field, rounds >= 15).
  const roundCap = field.filter(function (f) { return (f.rounds | 0) >= 15; });
  const roundCapEndFracs = roundCap.map(function (f) { return f.endFrac; });

  // Kill-rate splits (wild only).
  const splits = {
    byChannel: { tb: splitRate(tb, function () { return true; }), field: splitRate(field, function () { return true; }) },
    tbByEntry: {
      lifted: splitRate(tb, function (f) { return !!f.lifted; }),
      pendingLive: splitRate(tb, function (f) { return !f.lifted && !!f.pendingLive; }),
      otherNonLifted: splitRate(tb, function (f) { return !f.lifted && !f.pendingLive; }),
    },
    tbByEntryFrac: {},
    fieldByEntryFrac: {},
    tbByAlly: {
      allyPresent: splitRate(tb, function (f) { return !!f.allyVid || (f.partySize | 0) > 1; }),
      solo: splitRate(tb, function (f) { return !f.allyVid && (f.partySize | 0) <= 1; }),
    },
    fieldByAlly: {
      allyPresent: splitRate(field, function (f) { return !!f.allyVid; }),
      noAlly: splitRate(field, function (f) { return !f.allyVid; }),
    },
    tbByRounds: {
      short1to5: splitRate(tb, function (f) { return (f.rounds | 0) <= 5; }),
      mid6to15: splitRate(tb, function (f) { return (f.rounds | 0) >= 6 && (f.rounds | 0) <= 15; }),
      long16plus: splitRate(tb, function (f) { return (f.rounds | 0) >= 16; }),
    },
    fieldByRounds: {
      contact0: splitRate(field, function (f) { return (f.rounds | 0) === 0; }),
      short1to3: splitRate(field, function (f) { return (f.rounds | 0) >= 1 && (f.rounds | 0) <= 3; }),
      mid4to14: splitRate(field, function (f) { return (f.rounds | 0) >= 4 && (f.rounds | 0) <= 14; }),
      cap15: splitRate(field, function (f) { return (f.rounds | 0) >= 15; }),
    },
    postBlood: splitRate(wild, postBlood),
    preBlood: splitRate(wild, function (f) { return !postBlood(f); }),
    tbPostBlood: splitRate(tb, postBlood),
    fieldPostBlood: splitRate(field, postBlood),
  };
  ['wounded', 'middle', 'fresh', 'unknown'].forEach(function (b) {
    splits.tbByEntryFrac[b] = splitRate(tb, function (f) { return fracBucket(f.entryFrac) === b; });
    splits.fieldByEntryFrac[b] = splitRate(field, function (f) { return fracBucket(f.entryFrac) === b; });
  });

  // P3 inputs: TB losses with the beast still above half HP; ability use.
  const tbLost = tb.filter(function (f) { return f.outcomeRaw === 'lost'; });
  const tbLostHighHp = tbLost.filter(function (f) { return f.endFrac != null && f.endFrac > 0.5; });
  const tbWithAbility = tb.filter(function (f) { return (f.abilitiesUsed || []).length > 0; });
  const tbDamageFracMedian = median(tb.map(function (f) { return f.damageFrac; }));
  const fieldDamageFracMedian = median(field.map(function (f) { return f.damageFrac; }));

  // ---- P1–P5 rule evaluation (prereg; the analyzer computes, the evidence judges) ----
  const p1 = {
    nearMissBelowBreak: nearMiss.length, wildFights: wild.length,
    share: share(nearMiss.length, wild.length),
    fires: share(nearMiss.length, wild.length) != null && share(nearMiss.length, wild.length) >= 0.25,
  };
  const p2 = {
    bypassMFlee: bypassMFlee.length, fieldFights: field.length,
    share: share(bypassMFlee.length, field.length),
    fires: share(bypassMFlee.length, field.length) != null && share(bypassMFlee.length, field.length) >= 0.15,
    byMech: { stareDown: mFleeMech['mflee-stare-down'] || 0, peacemaker: mFleeMech['mflee-peacemaker'] || 0, eaterPoison: mFleeMech['mflee-eater-poison'] || 0 },
  };
  const p3 = {
    tbKillRate: splits.byChannel.tb.killRate, tbFights: tb.length,
    tbLost: tbLost.length, tbLostHighHp: tbLostHighHp.length,
    tbLostHighHpShare: share(tbLostHighHp.length, tbLost.length),
    tbWithAbility: tbWithAbility.length, tbAbilityShare: share(tbWithAbility.length, tb.length),
    fires: splits.byChannel.tb.killRate != null && splits.byChannel.tb.killRate < 0.10 &&
      share(tbLostHighHp.length, tbLost.length) != null && share(tbLostHighHp.length, tbLost.length) >= 0.50 &&
      share(tbWithAbility.length, tb.length) != null && share(tbWithAbility.length, tb.length) < 0.25,
  };
  const p4 = {
    lifted: splits.tbByEntry.lifted, pendingLive: splits.tbByEntry.pendingLive,
    fires: splits.tbByEntry.pendingLive.fights >= 5 && splits.tbByEntry.lifted.fights >= 5 &&
      splits.tbByEntry.pendingLive.killRate != null && splits.tbByEntry.pendingLive.killRate >= 0.20 &&
      splits.tbByEntry.lifted.killRate != null && splits.tbByEntry.lifted.killRate <= 0.05,
    unjudgeable: splits.tbByEntry.pendingLive.fights < 5 || splits.tbByEntry.lifted.fights < 5,
  };
  const p5 = {
    tbAlly: splits.tbByAlly, fieldAlly: splits.fieldByAlly,
    note: 'probe-only; ally-staging build belongs to sibling sim-stageally-a',
  };
  const diagGo = !!(p1.fires || p3.fires || p4.fires);

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
    totalFights: allFights.length, totalWild: wild.length, totalField: field.length, totalTb: tb.length, totalArenaField: arenaF.length,
    totalKillsLog: seeds.reduce(function (m, s) { return m + s.w4killsLog; }, 0),
    totalKillsMatched: seeds.reduce(function (m, s) { return m + s.w4killsMatched; }, 0),
    totalKillsWildMatched: seeds.reduce(function (m, s) { return m + s.w4killsWildMatched; }, 0),
    totalUnmatchedKills: seeds.reduce(function (m, s) { return m + s.unmatchedKills; }, 0),
    overallKillRateWild: share(wild.filter(function (f) { return f.matchedKillBy; }).length, wild.length),
    endings: endings,
    mFlee: { count: mFlee.length, mech: mFleeMech,
      endFracMedian: median(mFlee.map(function (f) { return f.endFrac; })),
      roundsMedian: median(mFlee.map(function (f) { return f.rounds; })) },
    nearMiss: { belowBreak: nearMiss.length, belowBreakShare: share(nearMiss.length, wild.length),
      below5pct: nearMissDeep.length, byMech: nearMissByMech,
      endFracMedian: median(nearMiss.map(function (f) { return f.endFrac; })),
      detail: nearMiss.map(function (f) { return { seed: f.seed, day: f.day, channel: f.channel, mid: f.mid, mech: f.mech, rounds: f.rounds, endFrac: f.endFrac, damageFrac: f.damageFrac }; }) },
    roundCap: { count: roundCap.length, shareOfField: share(roundCap.length, field.length),
      endFracMedian: median(roundCapEndFracs),
      endFracBelowBreak: roundCap.filter(function (f) { return f.endFrac != null && f.endFrac < 0.15; }).length,
      byMech: countMech(roundCap) },
    splits: splits,
    tbLostHighHp: { lost: tbLost.length, highHp: tbLostHighHp.length, share: share(tbLostHighHp.length, tbLost.length) },
    tbAbilityShare: share(tbWithAbility.length, tb.length),
    tbDamageFracMedian: tbDamageFracMedian, fieldDamageFracMedian: fieldDamageFracMedian,
    p1: p1, p2: p2, p3: p3, p4: p4, p5: p5,
    diagGo: diagGo,
    totalInstrumentErrors: seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0),
    wall: wall, seeds: seeds, fights: allFights };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: finishprobe-analyze-20261106.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, median: median, matchKills: matchKills, fracBucket: fracBucket, endFrac: endFrac, classifyField: classifyField, classifyTb: classifyTb, classify: classify };
