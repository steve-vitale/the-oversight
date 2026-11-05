// tbretreat-refind-analyze-20261105.js — retreat-and-refind pilot analyzer
// (arm sim-tbretreat-refind-b). Pure function over corpus JSON; no game
// reads, no re-scoring. Same kill-matching discipline as the staypolicy
// analyzer (greedy, corpus order, STRICT: killer must be among the
// fight's fighters; TB "kill-or-rout" endings are NEVER counted as
// kills — only matched kill-log entries are). ADDS, for this arm:
// per-leg refind totals (trigger fires, exits by kind, crossings, push
// outcomes by category), the prereg gates G1-G4 as a computed verdict
// object (the evidence judges it; the analyzer does not override the
// prereg), TB-fight survival per leg, and re-engagement within 7d
// (the same scholar faces a wave-4+ beast again after a retreat — the
// refind measure now the restore is gone). Refind-event joins to TB
// fights are by day + monster id — an APPROXIMATE join, disclosed in
// the evidence: two same-day same-monster TB fights cannot be told
// apart from the event alone.
// Usage: node scripts/tbretreat-refind-analyze-20261105.js <per-seed-dir>
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
  fights.forEach(function (f) {
    const cands = (f.fighters || []).filter(function (vid) {
      if (!vid || vid === f.firstKiller) return false;
      return !log.some(function (e) { return e.by === vid && (e.d | 0) < (f.day | 0); });
    });
    f.secondCandidatesCorrected = cands;
    f.secondCandidatePresent = cands.length > 0;
  });
  // Greedy kill matching, corpus order, STRICT: a kill is matched only to
  // a fight whose fighters include the killer. Kills with no
  // fighter-matching fight stay unmatched and are reported, never
  // silently assigned. (Same-day ordering inside a day is not
  // recoverable from the log — stated limitation.)
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
    } else { f._matchedKill = null; }
  });
  const unmatchedKills = log.filter(function (e, i) { return !used[i]; });
  const splits = splitStats(fights);
  const daily = row.daily || [];
  let pairSnapshotDay = null;
  let readyDays = 0;
  daily.forEach(function (s) {
    if (s.readiness5 && (s.readiness5.veterans | 0) >= 2) {
      if (pairSnapshotDay == null) pairSnapshotDay = s.day;
      readyDays++;
    }
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
  // REFIND JOIN (approximate, disclosed): a refind event joins a TB
  // fight on same day + same monster id.
  const refindEvents = (row.refindStats && row.refindStats.events) || [];
  function refindFiredFor(f) {
    if (f.channel !== 'player-tb') return false;
    return refindEvents.some(function (e) { return (e.day | 0) === (f.day | 0) && e.mid === f.mid; });
  }
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
    pairSnapshotDay: pairSnapshotDay, hasLivingPairSnapshot: pairSnapshotDay != null, readyDays: readyDays,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    instrumentErrors: (row.instrumentErrors || []).length,
    refindEvents: refindEvents,
    fights: fights.map(function (f) {
      return { day: f.day, channel: f.channel, fighter: f.fighter, fighters: f.fighters,
        mid: f.mid, entryHp: f.entryHp, damageDealt: f.damageDealt, damageFrac: f.damageFrac,
        rounds: f.rounds, swingsAttempted: f.swingsAttempted, partySize: f.partySize,
        partyBucket: partyBucket(f), aliveBucket: aliveBucket(f),
        secondCandidatePresent: !!f.secondCandidatePresent, secondCandidates: f.secondCandidatesCorrected || f.secondCandidates || [],
        firstKiller: f.firstKiller, firstKillerAliveAtStart: f.firstKillerAliveAtStart,
        firstKillerInFight: !!f.firstKillerInFight, daysSinceFirstBlood: f.daysSinceFirstBlood,
        ending: f.ending, outcomeRaw: f.outcomeRaw, allyVid: f.allyVid || null,
        matchedKillBy: f._matchedKill ? f._matchedKill.by : null,
        gear: f.gear || null, allyGear: f.allyGear || null,
        abilitiesUsed: f.abilitiesUsed || null, intent: f.intent || null,
        focusFire: !!f.focusFire, committedFinish: !!f.committedFinish,
        committedRounds: (f.committedRounds | 0) || 0, shoutRound: f.shoutRound != null ? f.shoutRound : null,
        everWinning: !!f.everWinning, everHopeless: !!f.everHopeless,
        refindFired: refindFiredFor(f) };
    }),
  };
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'tbretreat-refind-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const allFights = [];
  seeds.forEach(function (s) { s.fights.forEach(function (f) { allFights.push(Object.assign({ seed: s.seed, run: s.run }, f)); }); });
  const splits = splitStats(allFights.map(function (f) {
    const g = Object.assign({}, f);
    g._matchedKill = f.matchedKillBy ? { by: f.matchedKillBy } : null;
    return g;
  }));
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const wall = { wins: 0, national: 0, table: 0, wave4unlocks: 0, wave4faced: 0, wave5unlocks: 0, wave5faced: 0, medianDays: null, readyDays: 0 };
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
  wall.readyDays = seeds.reduce(function (m, s) { return m + (s.readyDays | 0); }, 0);
  const fieldFights = allFights.filter(function (f) { return f.channel === 'field'; });
  const ff = function (arr) { return { fights: arr.length, kills: arr.filter(function (f) { return f.matchedKillBy; }).length, dmgMed: median(arr.map(function (f) { return f.damageFrac; })), roundsMed: median(arr.map(function (f) { return f.rounds; })), endings: arr.reduce(function (a, f) { a[f.ending || '?'] = (a[f.ending || '?'] | 0) + 1; return a; }, {}) }; };
  const extra = {
    fieldByAlly: { joined: ff(fieldFights.filter(function (f) { return !!f.allyVid; })), noJoiner: ff(fieldFights.filter(function (f) { return !f.allyVid; })) },
    fieldFights: fieldFights.length,
    tbDeathEndings: allFights.filter(function (f) { return f.channel === 'player-tb' && f.ending === 'death'; }).length,
    tbFights: allFights.filter(function (f) { return f.channel === 'player-tb'; }).length,
  };
  // LEGS: the corpus dir holds both legs; group by row.run.
  const legs = {};
  seeds.forEach(function (s) {
    const leg = legs[s.run] || (legs[s.run] = { run: s.run, n: 0, days: [], fights: [], tb: [], field: [],
      refindTotals: { fights: 0, triggerFires: 0, fleeTurns: 0, exits: 0, exitsHaven: 0, exitsGaveup: 0,
        crossings: 0, crossingCaps: 0, consumedPushes: 0,
        pushes: { sealed: 0, worldEdge: 0, blocked: 0, crossed: 0 },
        stuckFallbacks: 0, sealedFallbacks: 0, suppressions: 0, havenHolds: 0 } });
    leg.n += 1; leg.days.push(s.days);
  });
  allFights.forEach(function (f) {
    const leg = legs[f.run];
    if (!leg) return;
    leg.fights.push(f);
    if (f.channel === 'player-tb') leg.tb.push(f); else if (f.channel === 'field') leg.field.push(f);
  });
  files.forEach(function (fn) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    const leg = legs[row.run];
    if (!leg || !row.refindStats) return;
    const st = row.refindStats;
    const t = leg.refindTotals;
    t.fights += st.fights | 0;
    t.triggerFires += st.triggerFires | 0;
    t.fleeTurns += st.fleeTurns | 0;
    t.exits += st.exits | 0;
    t.exitsHaven += st.exitsHaven | 0;
    t.exitsGaveup += st.exitsGaveup | 0;
    t.crossings += st.crossings | 0;
    t.crossingCaps += st.crossingCaps | 0;
    t.consumedPushes += st.consumedPushes | 0;
    if (st.pushes) {
      t.pushes.sealed += st.pushes.sealed | 0;
      t.pushes.worldEdge += st.pushes.worldEdge | 0;
      t.pushes.blocked += st.pushes.blocked | 0;
      t.pushes.crossed += st.pushes.crossed | 0;
    }
    t.stuckFallbacks += st.stuckFallbacks | 0;
    t.sealedFallbacks += st.sealedFallbacks | 0;
    t.suppressions += st.suppressions | 0;
    t.havenHolds += st.havenHolds | 0;
  });
  // Re-engagement within 7d: for each armed-leg exit event, a later
  // wave-4+ TB fight by the same fighter within 7 days (any beast;
  // same-mid slice separately). Measurement join, never a decision.
  const reengage = { exits: 0, reengaged7d: 0, reengagedSameMid7d: 0, detail: [] };
  seeds.forEach(function (s) {
    if (!s.run || s.run.indexOf('armed') < 0) return;
    (s.refindEvents || []).forEach(function (ev) {
      if (ev.result !== 'exited') return;
      reengage.exits++;
      const later = s.fights.filter(function (f) {
        return f.channel === 'player-tb' && (f.day | 0) > (ev.day | 0) && (f.day | 0) <= (ev.day | 0) + 7 &&
          f.fighters && ev.fighterVid && f.fighters.indexOf(ev.fighterVid) >= 0;
      });
      const sameMid = later.filter(function (f) { return f.mid === ev.mid; });
      if (later.length) reengage.reengaged7d++;
      if (sameMid.length) reengage.reengagedSameMid7d++;
      reengage.detail.push({ seed: s.seed, day: ev.day, mid: ev.mid, wave: ev.wave, fighterVid: ev.fighterVid,
        exitKind: ev.exitKind, crossings: ev.crossings,
        reengaged7d: later.length > 0, reengageDays: later.map(function (f) { return f.day; }),
        sameMid7d: sameMid.length > 0 });
    });
  });
  Object.keys(legs).forEach(function (k) {
    const leg = legs[k];
    const kills = leg.fights.filter(function (f) { return f.matchedKillBy; }).length;
    leg.killRate = leg.fights.length ? kills / leg.fights.length : null;
    leg.kills = kills;
    leg.medianDays = median(leg.days);
    leg.tbKills = leg.tb.filter(function (f) { return f.matchedKillBy; }).length;
    leg.tbKillRate = leg.tb.length ? leg.tbKills / leg.tb.length : null;
    leg.tbDeaths = leg.tb.filter(function (f) { return f.ending === 'death'; }).length;
    leg.tbFlees = leg.tb.filter(function (f) { return f.ending === 'flee'; }).length;
    leg.tbSurvival = leg.tb.length ? (leg.tb.length - leg.tbDeaths) / leg.tb.length : null;
    leg.tbFired = leg.tb.filter(function (f) { return f.refindFired; }).length;
    leg.tbFiredDeaths = leg.tb.filter(function (f) { return f.refindFired && f.ending === 'death'; }).length;
    leg.tbFiredFlees = leg.tb.filter(function (f) { return f.refindFired && f.ending === 'flee'; }).length;
    leg.tbFiredKills = leg.tb.filter(function (f) { return f.refindFired && f.matchedKillBy; }).length;
    leg.fieldDeaths = leg.field.filter(function (f) { return f.ending === 'death'; }).length;
    leg.fieldKills = leg.field.filter(function (f) { return f.matchedKillBy; }).length;
    leg.fieldFlees = leg.field.filter(function (f) { return f.ending === 'flee'; }).length;
    leg.readyDays = seeds.filter(function (s) { return s.run === k; }).reduce(function (m, s) { return m + (s.readyDays | 0); }, 0);
    // Wave-4-only slice of the refind totals, for direct comparability
    // with the sibling confirm's 10.2% (wave-4 TB fights only).
    const w4fires = [];
    seeds.filter(function (s) { return s.run === k; }).forEach(function (s) {
      (s.refindEvents || []).forEach(function (ev) { if ((ev.wave | 0) === 4) w4fires.push(ev); });
    });
    leg.w4only = { fires: w4fires.length,
      exits: w4fires.filter(function (e) { return e.result === 'exited'; }).length };
    delete leg.fights; delete leg.tb; delete leg.field; delete leg.days;
  });
  // Prereg gates G1-G4 (analyzer computes; evidence judges).
  const legKeys = Object.keys(legs);
  const baseLeg = legs[legKeys.filter(function (k) { return k.indexOf('baseline') >= 0; })[0]];
  const armedLeg = legs[legKeys.filter(function (k) { return k.indexOf('armed') >= 0; })[0]];
  let gates = null;
  if (baseLeg && armedLeg) {
    const t = armedLeg.refindTotals;
    const g1rate = t.triggerFires ? t.exits / t.triggerFires : null;
    const g2armed = armedLeg.tbSurvival, g2base = baseLeg.tbSurvival;
    const g3ratio = (baseLeg.killRate != null && baseLeg.killRate > 0) ? (armedLeg.killRate / baseLeg.killRate) : (armedLeg.killRate === 0 && baseLeg.killRate === 0 ? 1 : null);
    const g4ratio = (baseLeg.medianDays != null && baseLeg.medianDays > 0) ? (armedLeg.medianDays / baseLeg.medianDays) : null;
    gates = {
      g1: { bar: 'exits / trigger fires >= 0.25', rate: g1rate, exits: t.exits, fires: t.triggerFires,
        w4onlyRate: legKeys.length ? (armedLeg.w4only.fires ? armedLeg.w4only.exits / armedLeg.w4only.fires : null) : null,
        w4onlyExits: armedLeg.w4only.exits, w4onlyFires: armedLeg.w4only.fires,
        holds: g1rate != null && g1rate >= 0.25 },
      g2: { bar: 'armed TB survival > baseline TB survival', armed: g2armed, baseline: g2base,
        holds: g2armed != null && g2base != null && g2armed > g2base },
      g3: { bar: 'armed kill rate >= 0.5x baseline', armed: armedLeg.killRate, baseline: baseLeg.killRate, ratio: g3ratio,
        holds: g3ratio != null && g3ratio >= 0.5 },
      g4: { bar: 'armed median survival >= 0.8x baseline', armed: armedLeg.medianDays, baseline: baseLeg.medianDays, ratio: g4ratio,
        holds: g4ratio != null && g4ratio >= 0.8 },
      thin: t.triggerFires < 15,
    };
    gates.go = gates.g1.holds && gates.g2.holds && gates.g3.holds && gates.g4.holds && !gates.thin;
  }
  return { n: seeds.length, totalFights: allFights.length,
    totalKillsLog: seeds.reduce(function (m, s) { return m + s.w4killsLog; }, 0),
    totalKillsMatched: seeds.reduce(function (m, s) { return m + s.w4killsMatched; }, 0),
    totalUnmatchedKills: seeds.reduce(function (m, s) { return m + s.unmatchedKills; }, 0),
    overallKillRate: allFights.length ? allFights.filter(function (f) { return f.matchedKillBy; }).length / allFights.length : null,
    damageFracMedian: median(allFights.map(function (f) { return f.damageFrac; })),
    splits: splits,
    totalInstrumentErrors: totalErr, wall: wall, legs: legs, gates: gates,
    reengage: reengage, extra: extra, seeds: seeds, fights: allFights };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: tbretreat-refind-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, median: median, partyBucket: partyBucket, aliveBucket: aliveBucket, splitStats: splitStats };
