// tbretreat-analyze-20261105.js — TB retreat-and-refind analyzer
// (arm sim-tbretreat-b). Pure function over corpus JSON; no game reads,
// no re-scoring. Kill attribution is greedy in corpus order (dmground rule):
// a wave-4 kill-log entry (day + monster id) is matched to at most one fight
// on that day with that monster, preferring a fight whose fighters include
// the killer. Unmatched kills are reported, never silently assigned. TB
// "kill-or-rout" endings are NEVER counted as kills — only matched kill-log
// entries are.
//
// Chain decomposition (per seed, per mid, day order):
//  (a) field->TB: TB fights split lifted (pre-call tile-monster alias id ===
//      mid; tbWorldHpFor enters at world HP) vs fresh (def-range roll).
//      Strict field->TB link: TB entryHpPrimary == most recent prior field
//      fight's mHpLeft for the same mid.
//  (b) TB->TB: successive TB fights vs the same mid; entry vs previous exit:
//      reset (entry > prev exit), continuation (entry == prev exit),
//      further-wounded (entry < prev exit). Pairs split by whether a field
//      fight of the same mid intervened.
//  (c) re-find: wounded field exits (0 < mHpLeft < defHpLo) re-met by a later
//      field fight of the same mid at exactly that HP (strict), gap in days;
//      also TB-lift re-meets (lifted TB entry == prev field exit).
//  (d) kill conversion: matched TB kills split by entry fracHi (primary):
//      wounded < 0.25, middle [0.25, 0.75), fresh >= 0.75.
// Usage: node scripts/tbretreat-analyze-20261105.js <per-seed-dir>
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
  // Greedy strict matching (dmground rule), corpus order.
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

function fracBucket(f) {
  const x = (f.entryFracHiPrimary != null) ? f.entryFracHiPrimary : f.entryFracHi;
  if (x == null) return 'unknown';
  if (x < 0.25) return 'wounded';
  if (x >= 0.75) return 'fresh';
  return 'middle';
}

function analyzeSeed(row) {
  const fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; });
  const log = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); });
  const unmatchedKills = matchKills(fights, log);
  const field = fights.filter(function (f) { return f.channel === 'field'; });
  const tb = fights.filter(function (f) { return f.channel === 'player-tb'; });

  // ---- (a) field -> TB ----
  const lifted = tb.filter(function (f) { return !!f.lifted; });
  const fresh = tb.filter(function (f) { return !f.lifted; });
  // Strict field->TB link: TB entryHpPrimary equals the most recent prior
  // field fight's mHpLeft for the same mid (any day).
  let strictFieldTb = 0, strictFieldTbDays = [];
  const fieldByMid = {};
  field.forEach(function (f) { (fieldByMid[f.mid] = fieldByMid[f.mid] || []).push(f); });
  tb.forEach(function (f) {
    if (!f.lifted || f.entryHpPrimary == null) return;
    const priors = (fieldByMid[f.mid] || []).filter(function (pf) { return pf.day <= f.day; });
    if (!priors.length) return;
    const last = priors[priors.length - 1];
    if (last.mHpLeft != null && last.mHpLeft === f.entryHpPrimary) {
      strictFieldTb++;
      strictFieldTbDays.push(f.day - last.day);
    }
  });
  // Lift fidelity: lifted entryHpPrimary should equal worldHpAtLift.hp.
  const liftFidelity = lifted.filter(function (f) { return f.worldHpAtLift && f.worldHpAtLift.hp != null && f.entryHpPrimary != null; });
  const liftFidelityMatch = liftFidelity.filter(function (f) { return f.entryHpPrimary === f.worldHpAtLift.hp; }).length;

  // ---- (b) TB -> TB ----
  const tbByMid = {};
  tb.forEach(function (f) { (tbByMid[f.mid] = tbByMid[f.mid] || []).push(f); });
  const tbPairs = [];
  Object.keys(tbByMid).forEach(function (mid) {
    const arr = tbByMid[mid].slice().sort(function (a, b) { return a.day - b.day; });
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1], cur = arr[i];
      if (prev.mHpLeftPrimary == null || cur.entryHpPrimary == null) continue;
      const fieldBetween = field.some(function (ff) { return ff.mid === mid && ff.day > prev.day && ff.day <= cur.day; });
      let cls = null;
      if (cur.entryHpPrimary > prev.mHpLeftPrimary) cls = 'reset';
      else if (cur.entryHpPrimary === prev.mHpLeftPrimary) cls = 'continuation';
      else cls = 'further-wounded';
      tbPairs.push({ mid: mid, dayPrev: prev.day, dayCur: cur.day, gapDays: cur.day - prev.day,
        prevExit: prev.mHpLeftPrimary, curEntry: cur.entryHpPrimary, cls: cls,
        fieldBetween: fieldBetween, prevEnding: prev.ending, curEnding: cur.ending,
        curMatchedKill: !!cur._matchedKill, prevLifted: !!prev.lifted, curLifted: !!cur.lifted });
    }
  });

  // ---- (c) re-find ----
  // Wounded field exits: 0 < mHpLeft < defHpLo (below a fresh world's HP).
  const woundedExits = [];
  field.forEach(function (f) {
    if (f.mHpLeft != null && f.mHpLeft > 0 && f.defHpLo != null && f.mHpLeft < f.defHpLo) {
      woundedExits.push({ mid: f.mid, day: f.day, hp: f.mHpLeft, fighter: f.fighter });
    }
  });
  const refind = woundedExits.map(function (we) {
    const laterField = field.filter(function (ff) { return ff.mid === we.mid && ff.day > we.day && ff.entryHp === we.hp; });
    const laterTbLift = tb.filter(function (tf) { return tf.mid === we.mid && tf.day > we.day && tf.lifted && tf.entryHpPrimary === we.hp; });
    const firstField = laterField.length ? laterField[0] : null;
    const firstTb = laterTbLift.length ? laterTbLift[0] : null;
    let first = null, firstChannel = null;
    if (firstField && firstTb) {
      if (firstField.day <= firstTb.day) { first = firstField; firstChannel = 'field'; }
      else { first = firstTb; firstChannel = 'tb-lift'; }
    } else if (firstField) { first = firstField; firstChannel = 'field'; }
    else if (firstTb) { first = firstTb; firstChannel = 'tb-lift'; }
    return { mid: we.mid, day: we.day, hp: we.hp, refound: !!first,
      gapDays: first ? first.day - we.day : null, channel: firstChannel };
  });

  // ---- (d) kill conversion by entry frac ----
  const buckets = {};
  ['wounded', 'middle', 'fresh', 'unknown'].forEach(function (b) {
    const arr = tb.filter(function (f) { return fracBucket(f) === b; });
    buckets[b] = { fights: arr.length, kills: arr.filter(function (f) { return !!f._matchedKill; }).length,
      killRate: share(arr.filter(function (f) { return !!f._matchedKill; }).length, arr.length),
      entryFracHiMedian: median(arr.map(function (f) { return f.entryFracHiPrimary; })) };
  });
  const fieldBuckets = {};
  ['wounded', 'middle', 'fresh', 'unknown'].forEach(function (b) {
    const arr = field.filter(function (f) {
      const x = (f.entryFracHi != null) ? f.entryFracHi : null;
      if (x == null) return b === 'unknown';
      if (x < 0.25) return b === 'wounded';
      if (x >= 0.75) return b === 'fresh';
      return b === 'middle';
    });
    fieldBuckets[b] = { fights: arr.length, kills: arr.filter(function (f) { return !!f._matchedKill; }).length,
      killRate: share(arr.filter(function (f) { return !!f._matchedKill; }).length, arr.length) };
  });

  // ---- chains: per-mid fight sequences (field + TB, day order) ----
  const chains = {};
  fights.slice().sort(function (a, b) { return a.day - b.day; }).forEach(function (f) {
    (chains[f.mid] = chains[f.mid] || []).push({
      day: f.day, channel: f.channel === 'field' ? 'F' : 'TB',
      entry: (f.channel === 'field') ? f.entryHp : f.entryHpPrimary,
      exit: (f.channel === 'field') ? f.mHpLeft : f.mHpLeftPrimary,
      entryFracHi: (f.channel === 'field') ? f.entryFracHi : f.entryFracHiPrimary,
      lifted: (f.channel === 'player-tb') ? !!f.lifted : null,
      ending: f.ending, kill: !!f._matchedKill, rounds: f.rounds });
  });

  // ---- 1-HP arrivals ----
  const fieldEnter1Hp = field.filter(function (f) { return f.entryHp === 1; }).length;
  const tbEnter1Hp = tb.filter(function (f) { return f.entryHpPrimary === 1; }).length;
  const fieldExit1Hp = field.filter(function (f) { return f.mHpLeft === 1; }).length;

  // ---- wall numbers ----
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

  // ---- (e) retreat-and-refind (this arm) ----
  // Retreated beast = a TB fight ending 'flee' whose world monster was
  // restored (restored === true, restoredHp recorded). Re-found = a
  // later fight of the same mid at exactly the restored HP (strict,
  // grindfinish rule): field entryHp or lifted TB entryHpPrimary.
  const fledTb = tb.filter(function (f) { return f.ending === 'flee'; });
  const fledWithOrigin = fledTb.filter(function (f) { return !!f.tileOrigin; });
  const restoredFights = fledTb.filter(function (f) { return f.restored === true; });
  const skipReasons = {};
  fledTb.forEach(function (f) {
    const r = f.restoreSkippedReason || (f.restored === true ? null : 'null');
    if (r) skipReasons[r] = (skipReasons[r] || 0) + 1;
  });
  const retreatRefind = restoredFights.map(function (rf) {
    const later = fights.filter(function (ff) {
      if (ff === rf) return false;
      if (ff.mid !== rf.mid) return false;
      if (ff.day < rf.day) return false;
      if (ff.day === rf.day && ff.channel === 'player-tb') return false;
      const entry = (ff.channel === 'field') ? ff.entryHp : ff.entryHpPrimary;
      return entry != null && entry === rf.restoredHp;
    });
    const first = later.length ? later[0] : null;
    const firstChannel = first ? (first.channel === 'field' ? 'field' : (first.lifted ? 'tb-lift' : 'tb-fresh')) : null;
    const laterKills = fights.filter(function (ff) {
      return ff.mid === rf.mid && ff.day >= rf.day && !!ff._matchedKill;
    });
    return { seed: row.seed, mid: rf.mid, day: rf.day, tile: rf.tileOrigin ? { tx: rf.tileOrigin.tx, ty: rf.tileOrigin.ty } : null,
      restoredHp: rf.restoredHp, restoreFidelity: !!rf.restoreFidelity,
      scholarHpFracAtExit: rf.scholarHpFracAtExit,
      refound: !!first, gapDays: first ? first.day - rf.day : null, channel: firstChannel,
      refindFightDay: first ? first.day : null, refindFightEnding: first ? first.ending : null,
      refindFightKill: first ? !!first._matchedKill : false,
      laterKills: laterKills.length };
  });
  const retreat = {
    fledTb: fledTb.length,
    fledWithOrigin: fledWithOrigin.length,
    restored: restoredFights.length,
    restoredShare: share(restoredFights.length, fledWithOrigin.length),
    restoreFidelity: restoredFights.length ? restoredFights.filter(function (f) { return !!f.restoreFidelity; }).length : 0,
    restoreFidelityShare: share(restoredFights.filter(function (f) { return !!f.restoreFidelity; }).length, restoredFights.length),
    skipReasons: skipReasons,
    originRecorded: tb.filter(function (f) { return !!f.retreatOriginRecorded; }).length,
    retreatedBeasts: restoredFights.length,
    refound: retreatRefind.filter(function (r) { return r.refound; }).length,
    refoundShare: share(retreatRefind.filter(function (r) { return r.refound; }).length, retreatRefind.length),
    refound7d: retreatRefind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length,
    refound7dShare: share(retreatRefind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length, retreatRefind.length),
    refoundGapMedian: median(retreatRefind.filter(function (r) { return r.refound; }).map(function (r) { return r.gapDays; })),
    refindDetail: retreatRefind,
    prevFleePairs: tbPairs.filter(function (p) { return p.prevEnding === 'flee'; }).length,
    prevFleePairClasses: (function () {
      const c = {};
      tbPairs.filter(function (p) { return p.prevEnding === 'flee'; }).forEach(function (p) { c[p.cls] = (c[p.cls] || 0) + 1; });
      return c;
    })(),
  };
  const stay = row.stayStats || null;

  return {
    seed: row.seed, run: row.run || null, days: row.days, endReason: row.endReason, won: !!row.won,
    w4fights: fights.length, w4field: field.length, w4tb: tb.length,
    w4killsLog: log.length, w4killsMatched: fights.filter(function (f) { return !!f._matchedKill; }).length,
    unmatchedKills: unmatchedKills.length,
    killRate: share(fights.filter(function (f) { return !!f._matchedKill; }).length, fights.length),
    tbKillRate: share(tb.filter(function (f) { return !!f._matchedKill; }).length, tb.length),
    fieldKillRate: share(field.filter(function (f) { return !!f._matchedKill; }).length, field.length),
    chainA: {
      tbLifted: lifted.length, tbFresh: fresh.length,
      liftedShare: share(lifted.length, tb.length),
      liftedEntryFracHiMedian: median(lifted.map(function (f) { return f.entryFracHiPrimary; })),
      freshEntryFracHiMedian: median(fresh.map(function (f) { return f.entryFracHiPrimary; })),
      liftFidelityMatch: liftFidelityMatch, liftFidelityChecked: liftFidelity.length,
      strictFieldTbLinks: strictFieldTb,
      strictFieldTbGapMedian: median(strictFieldTbDays),
      doorFledReengages: tb.filter(function (f) { return f.doorFledAtEntry && f.doorFledAtEntry.length; }).length,
      pendingLiveTb: tb.filter(function (f) { return !!f.pendingLive; }).length,
      worldOriginTb: tb.filter(function (f) { return !!f.worldOriginPresent; }).length,
      veteranTb: tb.filter(function (f) { return !!f.primaryVeteran; }).length,
    },
    chainB: {
      pairs: tbPairs.length,
      reset: tbPairs.filter(function (p) { return p.cls === 'reset'; }).length,
      continuation: tbPairs.filter(function (p) { return p.cls === 'continuation'; }).length,
      furtherWounded: tbPairs.filter(function (p) { return p.cls === 'further-wounded'; }).length,
      resetShare: share(tbPairs.filter(function (p) { return p.cls === 'reset'; }).length, tbPairs.length),
      resetNoFieldBetween: tbPairs.filter(function (p) { return p.cls === 'reset' && !p.fieldBetween; }).length,
      pairsNoFieldBetween: tbPairs.filter(function (p) { return !p.fieldBetween; }).length,
      resetShareNoFieldBetween: share(tbPairs.filter(function (p) { return p.cls === 'reset' && !p.fieldBetween; }).length, tbPairs.filter(function (p) { return !p.fieldBetween; }).length),
      gapMedian: median(tbPairs.map(function (p) { return p.gapDays; })),
      pairsDetail: tbPairs,
    },
    chainC: {
      woundedExits: woundedExits.length,
      refound: refind.filter(function (r) { return r.refound; }).length,
      refoundShare: share(refind.filter(function (r) { return r.refound; }).length, refind.length),
      refound7d: refind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length,
      refound7dShare: share(refind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length, refind.length),
      refound30d: refind.filter(function (r) { return r.refound && r.gapDays <= 30; }).length,
      refound30dShare: share(refind.filter(function (r) { return r.refound && r.gapDays <= 30; }).length, refind.length),
      refoundGapMedian: median(refind.filter(function (r) { return r.refound; }).map(function (r) { return r.gapDays; })),
      refoundByChannel: {
        field: refind.filter(function (r) { return r.refound && r.channel === 'field'; }).length,
        tbLift: refind.filter(function (r) { return r.refound && r.channel === 'tb-lift'; }).length,
      },
      refindDetail: refind,
    },
    chainD: { tbBuckets: buckets, fieldBuckets: fieldBuckets },
    retreat: retreat, stayStats: stay,
    oneHp: { fieldEnter1Hp: fieldEnter1Hp, tbEnter1Hp: tbEnter1Hp, fieldExit1Hp: fieldExit1Hp },
    killersEver: Object.keys(killers).length, livingKillersAtEnd: livingKillers.length,
    ready5Days: ready5Days,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    standing: row.standing,
    instrumentErrors: (row.instrumentErrors || []).length,
    chains: chains,
    fights: fights.map(function (f) {
      return { day: f.day, channel: f.channel, fighter: f.fighter, fighters: f.fighters,
        mid: f.mid, entryHp: f.entryHp, entryHpPrimary: f.entryHpPrimary || null,
        entryFracHi: f.entryFracHi || null, entryFracHiPrimary: f.entryFracHiPrimary || null,
        entryMaxHp: f.entryMaxHp || null, entryMaxHpPrimary: f.entryMaxHpPrimary || null,
        damageDealt: f.damageDealt, damageFrac: f.damageFrac, rounds: f.rounds,
        partySize: f.partySize, ending: f.ending, outcomeRaw: f.outcomeRaw,
        mHpLeft: f.mHpLeft, mHpLeftPrimary: f.mHpLeftPrimary || null,
        lifted: (f.channel === 'player-tb') ? !!f.lifted : null,
        worldHpAtLift: f.worldHpAtLift || null, pendingLive: !!f.pendingLive,
        doorFledAtEntry: f.doorFledAtEntry || null, primaryVeteran: !!f.primaryVeteran,
        worldOriginPresent: !!f.worldOriginPresent,
        tileOrigin: f.tileOrigin || null, retreatOriginRecorded: !!f.retreatOriginRecorded,
        flagOn: !!f.flagOn, restored: (f.restored == null ? null : !!f.restored),
        restoredHp: (f.restoredHp != null ? f.restoredHp : null),
        restoredTile: f.restoredTile || null,
        restoreSkippedReason: f.restoreSkippedReason || null,
        restoreFidelity: (f.restoreFidelity == null ? null : !!f.restoreFidelity),
        scholarHpFracAtExit: (f.scholarHpFracAtExit != null ? f.scholarHpFracAtExit : null),
        doorStashAtEnd: (f.doorStashAtEnd == null ? null : !!f.doorStashAtEnd),
        matchedKillBy: f._matchedKill ? f._matchedKill.by : null,
        gear: f.gear || null, allyVid: f.allyVid || null, intent: f.intent || null };
    }),
  };
}

function analyzeDir(dir, prefix, run) {
  prefix = prefix || 'tbretreat-s';
  const files = fs.readdirSync(dir).filter(function (f) {
    return f.indexOf(prefix) === 0 && f.endsWith('.json') && (!run || f.indexOf('-' + run + '.json') >= 0);
  }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const allFights = [];
  seeds.forEach(function (s) { s.fights.forEach(function (f) { allFights.push(Object.assign({ seed: s.seed }, f)); }); });
  const allTb = allFights.filter(function (f) { return f.channel === 'player-tb'; });
  const allField = allFights.filter(function (f) { return f.channel === 'field'; });

  // Band rollups of the four chain measures.
  const chainA = {
    tb: allTb.length,
    lifted: allTb.filter(function (f) { return !!f.lifted; }).length,
    liftedShare: share(allTb.filter(function (f) { return !!f.lifted; }).length, allTb.length),
    liftedEntryFracHiMedian: median(allTb.filter(function (f) { return !!f.lifted; }).map(function (f) { return f.entryFracHiPrimary; })),
    freshEntryFracHiMedian: median(allTb.filter(function (f) { return !f.lifted; }).map(function (f) { return f.entryFracHiPrimary; })),
    strictFieldTbLinks: seeds.reduce(function (m, s) { return m + s.chainA.strictFieldTbLinks; }, 0),
    liftFidelityMatch: seeds.reduce(function (m, s) { return m + s.chainA.liftFidelityMatch; }, 0),
    liftFidelityChecked: seeds.reduce(function (m, s) { return m + s.chainA.liftFidelityChecked; }, 0),
    doorFledReengages: seeds.reduce(function (m, s) { return m + s.chainA.doorFledReengages; }, 0),
    pendingLiveTb: seeds.reduce(function (m, s) { return m + s.chainA.pendingLiveTb; }, 0),
    worldOriginTb: seeds.reduce(function (m, s) { return m + s.chainA.worldOriginTb; }, 0),
    veteranTb: seeds.reduce(function (m, s) { return m + s.chainA.veteranTb; }, 0),
  };
  const allPairs = [];
  seeds.forEach(function (s) { s.chainB.pairsDetail.forEach(function (p) { allPairs.push(Object.assign({ seed: s.seed }, p)); }); });
  const chainB = {
    pairs: allPairs.length,
    reset: allPairs.filter(function (p) { return p.cls === 'reset'; }).length,
    continuation: allPairs.filter(function (p) { return p.cls === 'continuation'; }).length,
    furtherWounded: allPairs.filter(function (p) { return p.cls === 'further-wounded'; }).length,
    resetShare: share(allPairs.filter(function (p) { return p.cls === 'reset'; }).length, allPairs.length),
    pairsNoFieldBetween: allPairs.filter(function (p) { return !p.fieldBetween; }).length,
    resetNoFieldBetween: allPairs.filter(function (p) { return p.cls === 'reset' && !p.fieldBetween; }).length,
    resetShareNoFieldBetween: share(allPairs.filter(function (p) { return p.cls === 'reset' && !p.fieldBetween; }).length, allPairs.filter(function (p) { return !p.fieldBetween; }).length),
    gapMedian: median(allPairs.map(function (p) { return p.gapDays; })),
    pairsDetail: allPairs,
  };
  const allRefind = [];
  seeds.forEach(function (s) { s.chainC.refindDetail.forEach(function (r) { allRefind.push(Object.assign({ seed: s.seed }, r)); }); });
  const chainC = {
    woundedExits: allRefind.length,
    refound: allRefind.filter(function (r) { return r.refound; }).length,
    refoundShare: share(allRefind.filter(function (r) { return r.refound; }).length, allRefind.length),
    refound7d: allRefind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length,
    refound7dShare: share(allRefind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length, allRefind.length),
    refound30d: allRefind.filter(function (r) { return r.refound && r.gapDays <= 30; }).length,
    refound30dShare: share(allRefind.filter(function (r) { return r.refound && r.gapDays <= 30; }).length, allRefind.length),
    refoundGapMedian: median(allRefind.filter(function (r) { return r.refound; }).map(function (r) { return r.gapDays; })),
    refoundByChannel: {
      field: allRefind.filter(function (r) { return r.refound && r.channel === 'field'; }).length,
      tbLift: allRefind.filter(function (r) { return r.refound && r.channel === 'tb-lift'; }).length,
    },
    refindDetail: allRefind,
  };
  const tbBuckets = {};
  ['wounded', 'middle', 'fresh', 'unknown'].forEach(function (b) {
    const arr = allTb.filter(function (f) {
      const x = (f.entryFracHiPrimary != null) ? f.entryFracHiPrimary : f.entryFracHi;
      if (x == null) return b === 'unknown';
      if (x < 0.25) return b === 'wounded';
      if (x >= 0.75) return b === 'fresh';
      return b === 'middle';
    });
    tbBuckets[b] = { fights: arr.length, kills: arr.filter(function (f) { return f.matchedKillBy; }).length,
      killRate: share(arr.filter(function (f) { return f.matchedKillBy; }).length, arr.length) };
  });
  const fieldBuckets = {};
  ['wounded', 'middle', 'fresh', 'unknown'].forEach(function (b) {
    const arr = allField.filter(function (f) {
      const x = (f.entryFracHi != null) ? f.entryFracHi : null;
      if (x == null) return b === 'unknown';
      if (x < 0.25) return b === 'wounded';
      if (x >= 0.75) return b === 'fresh';
      return b === 'middle';
    });
    fieldBuckets[b] = { fights: arr.length, kills: arr.filter(function (f) { return f.matchedKillBy; }).length,
      killRate: share(arr.filter(function (f) { return f.matchedKillBy; }).length, arr.length) };
  });
  const chainD = { tbBuckets: tbBuckets, fieldBuckets: fieldBuckets };

  // Band rollup of the retreat measure (e).
  const allRetreatRefind = [];
  seeds.forEach(function (s) { s.retreat.refindDetail.forEach(function (r) { allRetreatRefind.push(r); }); });
  const skipReasonsBand = {};
  seeds.forEach(function (s) {
    Object.keys(s.retreat.skipReasons || {}).forEach(function (k) {
      skipReasonsBand[k] = (skipReasonsBand[k] || 0) + s.retreat.skipReasons[k];
    });
  });
  const stayTotals = (function () {
    let fires = 0, exits = 0, fleeTurns = 0, stuck = 0, sealed = 0, seen = 0;
    seeds.forEach(function (s) {
      const st = s.stayStats;
      if (!st) return;
      seen++;
      fires += (st.triggerFires | 0); exits += (st.exits | 0);
      fleeTurns += (st.fleeTurns | 0); stuck += (st.stuckFallbacks | 0); sealed += (st.sealedFallbacks | 0);
    });
    return { legsWithStayStats: seen, triggerFires: fires, exits: exits, fleeTurns: fleeTurns,
      stuckFallbacks: stuck, sealedFallbacks: sealed,
      exitRate: share(exits, fires) };
  })();
  const retreatBand = {
    fledTb: seeds.reduce(function (m, s) { return m + s.retreat.fledTb; }, 0),
    fledWithOrigin: seeds.reduce(function (m, s) { return m + s.retreat.fledWithOrigin; }, 0),
    restored: seeds.reduce(function (m, s) { return m + s.retreat.restored; }, 0),
    restoredShare: share(seeds.reduce(function (m, s) { return m + s.retreat.restored; }, 0), seeds.reduce(function (m, s) { return m + s.retreat.fledWithOrigin; }, 0)),
    restoreFidelity: seeds.reduce(function (m, s) { return m + s.retreat.restoreFidelity; }, 0),
    restoreFidelityShare: share(seeds.reduce(function (m, s) { return m + s.retreat.restoreFidelity; }, 0), seeds.reduce(function (m, s) { return m + s.retreat.restored; }, 0)),
    skipReasons: skipReasonsBand,
    originRecorded: seeds.reduce(function (m, s) { return m + s.retreat.originRecorded; }, 0),
    retreatedBeasts: allRetreatRefind.length,
    refound: allRetreatRefind.filter(function (r) { return r.refound; }).length,
    refoundShare: share(allRetreatRefind.filter(function (r) { return r.refound; }).length, allRetreatRefind.length),
    refound7d: allRetreatRefind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length,
    refound7dShare: share(allRetreatRefind.filter(function (r) { return r.refound && r.gapDays <= 7; }).length, allRetreatRefind.length),
    refoundGapMedian: median(allRetreatRefind.filter(function (r) { return r.refound; }).map(function (r) { return r.gapDays; })),
    refindDetail: allRetreatRefind,
    prevFleePairs: seeds.reduce(function (m, s) { return m + s.retreat.prevFleePairs; }, 0),
    stayTotals: stayTotals,
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

  // Pilot GO verdict inputs (prereg rule; the evidence judges, the
  // analyzer only computes). Computed by compareLegs over two legs,
  // never from one leg alone. G1: exits / trigger firings >= 25%
  // (armed). G2: retreated beasts re-found within 7d >= 25% (armed;
  // thin when retreated < 4). G3: armed wave-4 kill rate >= 1/2
  // baseline. G4: armed median survival >= 0.8 x baseline.
  const oneHp = {
    fieldEnter1Hp: seeds.reduce(function (m, s) { return m + s.oneHp.fieldEnter1Hp; }, 0),
    tbEnter1Hp: seeds.reduce(function (m, s) { return m + s.oneHp.tbEnter1Hp; }, 0),
    fieldExit1Hp: seeds.reduce(function (m, s) { return m + s.oneHp.fieldExit1Hp; }, 0),
  };
  return { n: seeds.length, run: run || null,
    totalFights: allFights.length, totalTb: allTb.length, totalField: allField.length,
    totalKillsLog: seeds.reduce(function (m, s) { return m + s.w4killsLog; }, 0),
    totalKillsMatched: seeds.reduce(function (m, s) { return m + s.w4killsMatched; }, 0),
    totalUnmatchedKills: seeds.reduce(function (m, s) { return m + s.unmatchedKills; }, 0),
    overallKillRate: share(allFights.filter(function (f) { return f.matchedKillBy; }).length, allFights.length),
    damageFracMedian: median(allFights.map(function (f) { return f.damageFrac; })),
    chainA: chainA, chainB: chainB, chainC: chainC, chainD: chainD, retreat: retreatBand,
    oneHp: oneHp,
    totalInstrumentErrors: seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0),
    wall: wall, seeds: seeds, fights: allFights };
}

function compareLegs(base, armed) {
  const g1 = {
    triggerFires: armed.retreat.stayTotals.triggerFires,
    exits: armed.retreat.stayTotals.exits,
    exitRate: armed.retreat.stayTotals.exitRate,
    fledTb: armed.retreat.fledTb,
    holds: armed.retreat.stayTotals.exitRate != null && armed.retreat.stayTotals.exitRate >= 0.25,
  };
  const g2 = {
    retreatedBeasts: armed.retreat.retreatedBeasts,
    refound7d: armed.retreat.refound7d,
    refound7dShare: armed.retreat.refound7dShare,
    thin: armed.retreat.retreatedBeasts < 4,
    holds: armed.retreat.refound7dShare != null && armed.retreat.refound7dShare >= 0.25,
  };
  const g3 = {
    baseKillRate: base.overallKillRate, armedKillRate: armed.overallKillRate,
    ratio: (base.overallKillRate != null && base.overallKillRate > 0) ? armed.overallKillRate / base.overallKillRate : null,
    holds: base.overallKillRate == null || base.overallKillRate === 0 ? (armed.overallKillRate || 0) >= 0 : (armed.overallKillRate >= 0.5 * base.overallKillRate),
  };
  const g4 = {
    baseMedianDays: base.wall.medianDays, armedMedianDays: armed.wall.medianDays,
    ratio: (base.wall.medianDays != null && base.wall.medianDays > 0) ? armed.wall.medianDays / base.wall.medianDays : null,
    holds: armed.wall.medianDays != null && base.wall.medianDays != null && armed.wall.medianDays >= 0.8 * base.wall.medianDays,
  };
  return { g1: g1, g2: g2, g3: g3, g4: g4,
    go: !!(g1.holds && g2.holds && g3.holds && g4.holds),
    baseline: { n: base.n, wall: base.wall, overallKillRate: base.overallKillRate },
    armed: { n: armed.n, wall: armed.wall, overallKillRate: armed.overallKillRate, retreat: armed.retreat } };
}

if (require.main === module) {
  const dir = process.argv[2];
  const a2 = process.argv[3], a3 = process.argv[4];
  if (!dir) { console.error('usage: tbretreat-analyze-20261105.js <per-seed-dir> [run] | <per-seed-dir> <baseline-run> <armed-run>'); process.exit(2); }
  if (a2 && a3) {
    const base = analyzeDir(dir, undefined, a2);
    const armed = analyzeDir(dir, undefined, a3);
    console.log(JSON.stringify({ baseline: base, armed: armed, verdict: compareLegs(base, armed) }, null, 2));
  } else {
    console.log(JSON.stringify(analyzeDir(dir, undefined, a2 || null), null, 2));
  }
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, compareLegs: compareLegs, median: median, matchKills: matchKills, fracBucket: fracBucket };
