// tbrefuse-b-analyze-20261124.js — non-building-TB-start analysis
// (arm sim-tbrefuse-b). V2 (Amendment #1): the judged rows are ALL
// non-building startCombat calls, split by callKind
// (guard-refusal / titan-refusal / instant-resolve /
// noop-unexplained). Reuses the bloodcluster analyzer VERBATIM as
// the base (kill linkage, door verification, contacts) and ADDS the
// classification: call-kind counts, fate counts, visibility
// verdicts (lines fired during the call), episodes per live fight,
// wait-to-re-engagement, and kill attribution (delayed vs
// not-killed-in-window, with opening-round kills reported
// separately — they died in the opening, they were not delayed by
// a refusal) per the frozen prereg (evidence/2026-11-24/
// sim-tbrefuse-b-prereg.md, Amendment #1).
// Usage:
//   const AN = require('./tbrefuse-b-analyze-20261124');
//   const s = AN.summarizeSeed(perSeedJson);
//   const all = AN.summarizeAll([perSeedJson, ...]);
'use strict';

const BC = require('./bloodcluster-b-analyze-20261124');

function counts(rows, keyFn) {
  const c = {};
  for (const r of rows) {
    const k = keyFn(r);
    c[k] = (c[k] || 0) + 1;
  }
  return c;
}
function median(xs) {
  if (!xs.length) return null;
  const a = xs.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(a.length / 2);
  return (a.length % 2) ? a[m] : (a[m - 1] + a[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}

function summarizeSeed(out) {
  const base = BC.summarizeSeed(out);
  const s = base;
  s.arm = 'tbrefuse-b';
  const refusals = (out.refusals || []).slice();
  const tbEnds = (out.tbEnds || []).slice();
  const ctx = (out.tbKillCtx || []).slice();
  s.refusals = refusals;
  s.refusalCount = refusals.length;
  s.callKindCounts = counts(refusals, function (r) { return (r && r.callKind) || 'UNCLASSIFIED'; });
  s.fateCounts = counts(refusals, function (r) { return (r && r.fate) || 'UNCLASSIFIED'; });
  // Bar 1 (Amendment #1): 0 unclassified = every row has a fate
  // AND a known call kind (noop-unexplained and gone-untracked
  // both fail).
  s.unclassifiedRefusals = refusals.filter(function (r) {
    return !r || !r.fate || r.fate === 'gone-untracked' || !r.callKind || r.callKind === 'noop-unexplained';
  });
  s.callerCounts = counts(refusals, function (r) { return (r && r.caller) || 'caller-unknown'; });
  s.callerUnknown = refusals.filter(function (r) { return !r || !r.caller || r.caller === 'caller-unknown' || !r.callerFrame; });
  // Bar 3 (Amendment #1): every row carries linesDuringCall
  // (empty array = silent, a verdict — not missing data).
  s.noVisibility = refusals.filter(function (r) { return !r || !Array.isArray(r.linesDuringCall); });
  s.silentRows = refusals.filter(function (r) { return r && Array.isArray(r.linesDuringCall) && r.linesDuringCall.length === 0; });
  s.lineRows = refusals.filter(function (r) { return r && Array.isArray(r.linesDuringCall) && r.linesDuringCall.length > 0; });
  s.sayFiredCount = refusals.filter(function (r) { return r && r.sayFired; }).length;
  s.silentCount = refusals.filter(function (r) { return r && r.sayFired === false; }).length;
  s.refusalSayCount = (out.refusalSayCount | 0);
  s.sayFiringsSum = refusals.reduce(function (a, r) { return a + ((r && r.sayFirings) | 0); }, 0);
  s.sayCountMismatch = s.refusalSayCount - s.sayFiringsSum;
  // Titan line: fires once per titan per day (game dedups speech).
  // Per (mid, day) group of titan-refusals, exactly one row should
  // carry titanLineFired=true.
  s.titanRows = refusals.filter(function (r) { return r && r.callKind === 'titan-refusal'; });
  s.titanLineRows = s.titanRows.filter(function (r) { return r && r.titanLineFired; });
  s.titanCountsByMid = counts(s.titanRows, function (r) { return (r && r.mid) || 'unknown'; });
  const titanGroups = {};
  for (const r of s.titanRows) {
    const k = (r.mid || '?') + '@' + (r.day | 0);
    (titanGroups[k] = titanGroups[k] || []).push(r);
  }
  s.titanLineDedupViolations = Object.keys(titanGroups).filter(function (k) {
    return titanGroups[k].filter(function (r) { return r.titanLineFired; }).length !== 1;
  }).length;
  // Instant-resolve cross-checks: each instant row must link to
  // exactly one tbEnd fired during its call, and its fate must
  // agree with tbKillCtx for that fight.
  s.instantRows = refusals.filter(function (r) { return r && r.callKind === 'instant-resolve'; });
  s.instantNoEnd = s.instantRows.filter(function (r) {
    return !r.endedFightId || !tbEnds.some(function (e) { return e && e.fightId === r.endedFightId && e.duringStartCombat; });
  });
  s.endsDuringStartCount = tbEnds.filter(function (e) { return e && e.duringStartCombat; }).length;
  s.endsDuringStartMismatch = s.endsDuringStartCount - s.instantRows.length;
  s.instantKilledMismatch = s.instantRows.filter(function (r) {
    const killed = r.endedFightId ? ctx.some(function (c) { return c && c.fightId === r.endedFightId; }) : false;
    return (r.fate === 'killed-in-opening') !== killed;
  });
  s.openingKilledRows = s.instantRows.filter(function (r) { return r && r.fate === 'killed-in-opening'; }).length;
  // Distinct refused monsters: first refusal per tagged world-monster
  // instance (repeatOf links repeats); pending-refusals have no
  // identity and count individually.
  s.distinctWorldMonsters = refusals.filter(function (r) { return r && r.hasWorldMonster && r.repeatOf == null; }).length;
  s.repeatRefusals = refusals.filter(function (r) { return r && r.repeatOf != null; }).length;
  s.pendingRefusals = refusals.filter(function (r) { return r && !r.hasWorldMonster; }).length;
  s.refusalsW4Plus = refusals.filter(function (r) { return r && (r.wave | 0) >= 4; }).length;
  s.refusalsW4PlusShare = s.refusalCount ? s.refusalsW4Plus / s.refusalCount : null;
  // Episodes: refusals blocked by one live fight id (guard rows
  // only — titan/instant rows have no live fight to block them).
  const epMap = {};
  for (const r of refusals) {
    if (!r || !r.liveFightId) continue;
    const k = r.liveFightId;
    (epMap[k] = epMap[k] || []).push(r);
  }
  s.episodes = Object.keys(epMap).map(function (k) {
    const rows = epMap[k];
    const days = rows.map(function (r) { return r.day | 0; });
    return {
      liveFightId: k, count: rows.length,
      liveMonsterMid: rows[0] ? rows[0].liveMonsterMid : null,
      dayFirst: Math.min.apply(null, days), dayLast: Math.max.apply(null, days),
      mids: Array.from(new Set(rows.map(function (r) { return r.mid; }))),
      callers: Array.from(new Set(rows.map(function (r) { return r.caller; }))),
      sayFirings: rows.reduce(function (a, r) { return a + ((r && r.sayFirings) | 0); }, 0),
      fates: counts(rows, function (r) { return (r && r.fate) || 'UNCLASSIFIED'; }),
    };
  }).sort(function (a, b) { return b.count - a.count; });
  s.episodeCount = s.episodes.length;
  s.maxRefusalsPerEpisode = s.episodes.length ? s.episodes[0].count : 0;
  // Wait to re-engagement (same-day = 0).
  const reeng = refusals.filter(function (r) { return r && r.fate === 're-engaged-tb'; });
  s.reengagedWaits = reeng.map(function (r) { return (r.fateDay | 0) - (r.day | 0); });
  s.reengagedWaitMedian = median(s.reengagedWaits);
  s.reengagedWaitMean = mean(s.reengagedWaits);
  s.reengagedWaitMax = s.reengagedWaits.length ? Math.max.apply(null, s.reengagedWaits) : null;
  s.reengagedSameDay = s.reengagedWaits.filter(function (w) { return w === 0; }).length;
  // Kill attribution for re-engaged rows: did the re-engaged fight
  // kill this monster? tbKillCtx rows carry the fight id; tbEnds
  // carry the fight result. Counts are DISTINCT monsters: all rows
  // of one monster share one fate (a re-engaged wild monster is
  // either dead or gone — never refused again), so rows are grouped
  // by their repeatOf root before counting kills.
  const endById = {};
  for (const e of tbEnds) { if (e && e.fightId) endById[e.fightId] = e; }
  function rootSeq(r) {
    const bySeq = {};
    for (const x of refusals) bySeq[x.seq] = x;
    let cur = r, guard = 0;
    while (cur && cur.repeatOf != null && bySeq[cur.repeatOf] && guard++ < 100) cur = bySeq[cur.repeatOf];
    return cur ? cur.seq : (r ? r.seq : null);
  }
  s.reengagedKilledRows = 0;
  const killedRoots = new Set();
  s.reengagedFightResults = {};
  s.reengagedNoEnd = 0;
  for (const r of reeng) {
    const fid = r.reengagedFightId || null;
    const killed = fid ? ctx.some(function (c) { return c && c.fightId === fid && c.mid === r.mid; }) : false;
    if (killed) { s.reengagedKilledRows += 1; killedRoots.add(rootSeq(r)); }
    const end = fid ? endById[fid] : null;
    if (!end) { s.reengagedNoEnd += 1; continue; }
    const res = end.result || 'unknown';
    s.reengagedFightResults[res] = (s.reengagedFightResults[res] || 0) + 1;
  }
  s.reengagedKilled = killedRoots.size;
  const fieldKilledRoots = new Set();
  for (const r of refusals) {
    if (r && r.fate === 'killed-field') fieldKilledRoots.add(rootSeq(r));
  }
  s.fieldKilledDistinct = fieldKilledRoots.size;
  // Delayed vs not-killed-in-window (prereg reading): a refused
  // monster fought again (re-engaged) or killed in the field is
  // DELAYED; the rest are NOT-KILLED-IN-WINDOW, by fate class.
  // delayedCount / delayedKilledCount are DISTINCT monsters.
  const delayedRoots = new Set();
  for (const r of refusals) {
    if (r && (r.fate === 're-engaged-tb' || r.fate === 'killed-field')) delayedRoots.add(rootSeq(r));
  }
  s.delayedCount = delayedRoots.size;
  s.delayedKilledCount = killedRoots.size + fieldKilledRoots.size;
  s.delayedRows = refusals.filter(function (r) { return r && (r.fate === 're-engaged-tb' || r.fate === 'killed-field'); }).length;
  s.notKilledByFate = {};
  for (const f of ['removed-vanished', 'removed-fled-across', 'still-waiting-at-end', 'pending-unresolved-at-end', 'fled-in-opening', 'lost-in-opening', 'instant-other']) {
    s.notKilledByFate[f] = s.fateCounts[f] || 0;
  }
  // Cross-check vs the bloodcluster base: rebuilt-false tbStarts
  // rows should match this instrument's non-building-start count
  // exactly (same band/policy/horizon — every non-building start
  // is a rebuilt-false row and vice versa, modulo throws).
  const bcRefused = (base.refusedTbStartsAll || []).length;
  s.bloodclusterRefusedCount = bcRefused;
  s.refusalCountMismatch = s.refusalCount - bcRefused;
  s.instrumentErrors = out.instrumentErrors || [];
  return s;
}

function summarizeAll(seeds) {
  const base = BC.summarizeAll(seeds);
  const per = seeds.map(function (o) { return summarizeSeed(o); });
  const all = base;
  all.arm = 'tbrefuse-b';
  all.refusalCount = per.reduce(function (a, s) { return a + s.refusalCount; }, 0);
  all.callKindCounts = {};
  all.fateCounts = {};
  all.callerCounts = {};
  all.titanCountsByMid = {};
  for (const s of per) {
    for (const k of Object.keys(s.callKindCounts)) all.callKindCounts[k] = (all.callKindCounts[k] || 0) + (s.callKindCounts[k] || 0);
    for (const k of Object.keys(s.fateCounts)) all.fateCounts[k] = (all.fateCounts[k] || 0) + (s.fateCounts[k] || 0);
    for (const k of Object.keys(s.callerCounts)) all.callerCounts[k] = (all.callerCounts[k] || 0) + (s.callerCounts[k] || 0);
    for (const k of Object.keys(s.titanCountsByMid)) all.titanCountsByMid[k] = (all.titanCountsByMid[k] || 0) + (s.titanCountsByMid[k] || 0);
  }
  all.unclassifiedRefusals = per.reduce(function (a, s) { return a + s.unclassifiedRefusals.length; }, 0);
  all.callerUnknown = per.reduce(function (a, s) { return a + s.callerUnknown.length; }, 0);
  all.noVisibility = per.reduce(function (a, s) { return a + s.noVisibility.length; }, 0);
  all.silentRows = per.reduce(function (a, s) { return a + s.silentRows.length; }, 0);
  all.lineRows = per.reduce(function (a, s) { return a + s.lineRows.length; }, 0);
  all.titanLineRows = per.reduce(function (a, s) { return a + s.titanLineRows.length; }, 0);
  all.titanLineDedupViolations = per.reduce(function (a, s) { return a + s.titanLineDedupViolations; }, 0);
  all.instantRows = per.reduce(function (a, s) { return a + s.instantRows.length; }, 0);
  all.instantNoEnd = per.reduce(function (a, s) { return a + s.instantNoEnd.length; }, 0);
  all.endsDuringStartMismatch = per.reduce(function (a, s) { return a + s.endsDuringStartMismatch; }, 0);
  all.instantKilledMismatch = per.reduce(function (a, s) { return a + s.instantKilledMismatch.length; }, 0);
  all.openingKilledRows = per.reduce(function (a, s) { return a + s.openingKilledRows; }, 0);
  all.sayFiredCount = per.reduce(function (a, s) { return a + s.sayFiredCount; }, 0);
  all.silentCount = per.reduce(function (a, s) { return a + s.silentCount; }, 0);
  all.refusalSayCount = per.reduce(function (a, s) { return a + s.refusalSayCount; }, 0);
  all.sayFiringsSum = per.reduce(function (a, s) { return a + s.sayFiringsSum; }, 0);
  all.sayCountMismatch = all.refusalSayCount - all.sayFiringsSum;
  all.distinctWorldMonsters = per.reduce(function (a, s) { return a + s.distinctWorldMonsters; }, 0);
  all.repeatRefusals = per.reduce(function (a, s) { return a + s.repeatRefusals; }, 0);
  all.pendingRefusals = per.reduce(function (a, s) { return a + s.pendingRefusals; }, 0);
  all.refusalsW4Plus = per.reduce(function (a, s) { return a + s.refusalsW4Plus; }, 0);
  all.episodeCount = per.reduce(function (a, s) { return a + s.episodeCount; }, 0);
  all.maxRefusalsPerEpisode = per.reduce(function (a, s) { return Math.max(a, s.maxRefusalsPerEpisode); }, 0);
  const waits = [];
  for (const s of per) waits.push.apply(waits, s.reengagedWaits);
  all.reengagedWaits = waits;
  all.reengagedWaitMedian = median(waits);
  all.reengagedWaitMean = mean(waits);
  all.reengagedWaitMax = waits.length ? Math.max.apply(null, waits) : null;
  all.reengagedSameDay = per.reduce(function (a, s) { return a + s.reengagedSameDay; }, 0);
  all.reengagedKilled = per.reduce(function (a, s) { return a + s.reengagedKilled; }, 0);
  all.reengagedFightResults = {};
  for (const s of per) {
    for (const k of Object.keys(s.reengagedFightResults)) {
      all.reengagedFightResults[k] = (all.reengagedFightResults[k] || 0) + s.reengagedFightResults[k];
    }
  }
  all.reengagedNoEnd = per.reduce(function (a, s) { return a + s.reengagedNoEnd; }, 0);
  all.delayedCount = per.reduce(function (a, s) { return a + s.delayedCount; }, 0);
  all.delayedKilledCount = per.reduce(function (a, s) { return a + s.delayedKilledCount; }, 0);
  all.notKilledByFate = {};
  for (const s of per) {
    for (const k of Object.keys(s.notKilledByFate)) {
      all.notKilledByFate[k] = (all.notKilledByFate[k] || 0) + s.notKilledByFate[k];
    }
  }
  all.bloodclusterRefusedCount = per.reduce(function (a, s) { return a + s.bloodclusterRefusedCount; }, 0);
  all.refusalCountMismatch = all.refusalCount - all.bloodclusterRefusedCount;
  all.instrumentErrors = [];
  for (const s of per) all.instrumentErrors.push.apply(all.instrumentErrors, s.instrumentErrors || []);
  // Scale-wall numbers (band-level, from the raw outs).
  all.wins = seeds.filter(function (o) { return o && o.won; }).length;
  all.scaleRanks = counts(seeds, function (o) { return (o && o.scaleRank) || 'unknown'; });
  all.national = seeds.filter(function (o) { return o && typeof o.scaleRank === 'string' && /national|galactic|table/i.test(o.scaleRank); }).length;
  all.w5Unlocked = seeds.filter(function (o) { return o && (o.endUnlockedWave | 0) >= 5; }).length;
  all.w5Faced = seeds.filter(function (o) {
    return o && (o.daily || []).some(function (d) { return d && (d.w5faced | 0) > 0; });
  }).length;
  all.w5Kills = 0;
  for (const o of seeds) {
    all.w5Kills += ((o && o.killEvents) || []).filter(function (k) { return k && (k.wave | 0) >= 5 && k.entryAdded; }).length;
  }
  const endDays = seeds.map(function (o) { return (o && o.days) | 0; }).filter(function (d) { return d > 0; });
  all.medianSurvival = median(endDays);
  all.survived = seeds.filter(function (o) { return o && o.endReason === 'survived'; }).length;
  all.villageLost = seeds.filter(function (o) { return o && o.villageLost; }).length;
  return all;
}

module.exports = { summarizeSeed: summarizeSeed, summarizeAll: summarizeAll };
