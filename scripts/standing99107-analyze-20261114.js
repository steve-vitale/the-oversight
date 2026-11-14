// standing99107-analyze-20261114.js — standing-accumulation
// decomposition analyzer (arm sim-standing99107-b).
// Pure functions over one per-seed run JSON (driver output).
// Reconciles the standing decomposition three ways: (1) per-snapshot
// breakdown math (war == 25*ledger pts, diplomacy == 34*counting
// links, plenty == 20*quality>=1 feasts, capped == war+diplomacy+
// min(plenty,100), total == war+diplomacy+plenty); (2) per-delta
// event attribution (every war/diplomacy/plenty change between
// consecutive snapshots has a supporting kill / link-transition /
// feast event in the window); (3) veteran-to-kill linkage (same as
// the ready5 analyzer). Reports ready days, blocked-day splits,
// best capped/raw + split, per-source income, door classification,
// ladder-track totals, tribute markers, and wall numbers.
// Usage: const AN = require('./standing99107-analyze-20261114');
//   const s = AN.summarizeSeed(perSeedJson);
'use strict';

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function readyRuns(days) {
  const runs = [];
  let start = null;
  for (let i = 0; i < days.length; i++) {
    const r = days[i].readiness5 && days[i].readiness5.ready;
    if (r && start == null) start = days[i].day;
    if (!r && start != null) { runs.push({ start: start, end: days[i - 1].day }); start = null; }
  }
  if (start != null && days.length) runs.push({ start: start, end: days[days.length - 1].day });
  return runs;
}

function linkCounts(snap) {
  const links = (snap && snap.links) || [];
  let counting = 0, seasoned = 0, regionalPlus = 0, active = 0;
  for (const l of links) {
    if (l.status !== 'active') continue;
    active++;
    if (l.seasoned) seasoned++;
    if (l.regionalPlus) regionalPlus++;
    if (l.counts) counting++;
  }
  return { counting: counting, seasoned: seasoned, regionalPlus: regionalPlus, active: active };
}

function feastCount(snap) {
  const fs = (snap && snap.feasts) || [];
  let n = 0, bundle = 0;
  for (const f of fs) { if ((f.quality | 0) >= 1) n++; if (f.bundle) bundle++; }
  return { major: n, bundle: bundle, rows: fs.length };
}

function ledgerPts(snap) {
  const L = (snap && snap.ledger) || {};
  let pts = 0;
  const perWave = {};
  for (const w of [3, 4, 5]) { perWave[w] = ((L[w] || {}).points | 0) || 0; pts += perWave[w]; }
  return { total: pts, perWave: perWave };
}

function summarizeSeed(out) {
  const daily = out.daily || [];
  const s = {
    seed: out.seed, days: out.days, gameDays: out.gameDays,
    endReason: out.endReason, won: !!out.won, scaleRank: out.scaleRank,
    maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
    peakBeforeEndCall: out.peakBeforeEndCall, peakAfterEndCall: out.peakAfterEndCall,
    endCallMovedPeak: !!out.endCallMovedPeak,
    readyDays: [], readyRuns: [], readyDayCount: 0,
    readyBlockedStandingDays: 0, readyBlockedOtherDays: 0,
    standingOkNotReadyDays: 0, shortBarDays: {},
    bestCapped: 0, bestRaw: 0, bestSplit: { war: 0, diplomacy: 0, plenty: 0 },
    bestDay: null, bestShort: [], bestLedger: null, bestLinks: null, bestFeasts: null,
    doorOpenDay: null, unclassifiedReleases: [], releaseLines: [], holdLineCount: 0,
    mismatchDays: [], vetWithoutKill: [], killersNotVeterans: [], logW4Count: 0,
    reconMismatches: [], unclassifiedDeltas: [],
    warFirstDay: null, warKills: 0, warKillsByWave: { 3: 0, 4: 0, 5: 0 },
    warPointsByWave: { 3: 0, 4: 0, 5: 0 },
    diplomacyFirstDay: null, diplomacyLinksEver: [], diplomacyLinksSeasonedOnly: [],
    plentyFirstDay: null, feastCount: 0, bundleFeastCount: 0,
    plentyCapBiteDays: 0, capBiteFirstDay: null,
    ladderEnd: null, ladderBest: null, tributeMarkers: [],
    deathCauses: {}, deathEvents: (out.deathEvents || []).length,
    instrumentErrors: (out.instrumentErrors || []).length,
    sayLines: (out.standingLines || []).length,
  };

  // --- ready days / blocked splits / best capped ---
  let bestIdx = -1;
  for (let i = 0; i < daily.length; i++) {
    const d = daily[i];
    const r5 = d.readiness5 || {};
    if (r5.ready) {
      s.readyDays.push(d.day);
      if ((d.capped | 0) < 200) s.readyBlockedStandingDays++;
      else if ((d.peak | 0) < 5) s.readyBlockedOtherDays++;
    } else if ((d.capped | 0) >= 200) {
      s.standingOkNotReadyDays++;
      for (const b of (r5.short || [])) s.shortBarDays[b] = (s.shortBarDays[b] || 0) + 1;
    }
    if (((d.capped | 0) || 0) > s.bestCapped || (bestIdx < 0)) {
      if (((d.capped | 0) || 0) > s.bestCapped) {
        s.bestCapped = (d.capped | 0) || 0; bestIdx = i;
      }
    }
    if (bestIdx < 0 && i === 0) bestIdx = 0;
    const raw = (d.standing && d.standing.total) | 0;
    if (raw > s.bestRaw) s.bestRaw = raw;
    if ((d.standing && d.standing.plenty) != null && (d.capped | 0) < 200 && raw >= 200) {
      s.plentyCapBiteDays++;
      if (s.capBiteFirstDay == null) s.capBiteFirstDay = d.day;
    }
    // --- per-snapshot breakdown-math reconciliation ---
    const st = d.standing;
    if (st) {
      const lp = ledgerPts(d), lc = linkCounts(d), fc = feastCount(d);
      const expWar = 25 * lp.total;
      const expDiplo = 34 * lc.counting;
      const expPlenty = 20 * fc.major;
      const expCapped = expWar + expDiplo + Math.min(expPlenty, 100);
      const expTotal = expWar + expDiplo + expPlenty;
      const bad = [];
      if ((st.war | 0) !== expWar) bad.push('war ' + st.war + '!=' + expWar);
      if ((st.diplomacy | 0) !== expDiplo) bad.push('diplomacy ' + st.diplomacy + '!=' + expDiplo);
      if ((st.plenty | 0) !== expPlenty) bad.push('plenty ' + st.plenty + '!=' + expPlenty);
      if ((st.total | 0) !== expTotal) bad.push('total ' + st.total + '!=' + expTotal);
      if (((d.capped | 0) || 0) !== expCapped) bad.push('capped ' + d.capped + '!=' + expCapped);
      if (bad.length) s.reconMismatches.push({ day: d.day, bad: bad });
    }
  }
  s.readyDayCount = s.readyDays.length;
  s.readyRuns = readyRuns(daily);
  if (bestIdx >= 0 && daily[bestIdx]) {
    const b = daily[bestIdx];
    s.bestDay = b.day;
    const bs = b.standing || {};
    s.bestSplit = { war: (bs.war | 0), diplomacy: (bs.diplomacy | 0), plenty: (bs.plenty | 0) };
    s.bestShort = ((b.readiness5 || {}).short || []).slice();
    s.bestLedger = ledgerPts(b);
    s.bestLinks = linkCounts(b);
    s.bestFeasts = feastCount(b);
    s.ladderBest = b.ladder ? clone(b.ladder) : null;
  }
  if (daily.length) {
    const last = daily[daily.length - 1];
    s.ladderEnd = last.ladder ? clone(last.ladder) : null;
  }

  // --- per-delta event attribution (war/diplomacy/plenty changes) ---
  // Windows are INCLUSIVE on both ends [prev.day, cur.day]: a kill or
  // feast stamped prev.day may have happened AFTER that day's snapshot
  // (snapshots run inside policy.daily; kills/feasts can land later
  // the same day) and only shows in the NEXT snapshot. The strict
  // check is the ledger/log delta equality; the event presence check
  // is belt-and-braces, so an inclusive window can only over-attribute
  // an already-explained event, never hide an unexplained delta.
  const kills = out.killEvents || [];
  const feasts = out.feastEvents || [];
  function killsIn(a, b) { return kills.filter(function (k) { return k.day >= a && k.day <= b; }); }
  function feastsIn(a, b) { return feasts.filter(function (f) { return f.day >= a && f.day <= b; }); }
  for (let i = 1; i < daily.length; i++) {
    const prev = daily[i - 1], cur = daily[i];
    if (!prev.standing || !cur.standing) continue;
    const dWar = (cur.standing.war | 0) - (prev.standing.war | 0);
    const dDip = (cur.standing.diplomacy | 0) - (prev.standing.diplomacy | 0);
    const dPlen = (cur.standing.plenty | 0) - (prev.standing.plenty | 0);
    if (dWar !== 0) {
      const ks = killsIn(prev.day, cur.day);
      const lpPrev = ledgerPts(prev), lpCur = ledgerPts(cur);
      const ledgerDelta = (lpCur.total - lpPrev.total) * 25;
      if (ledgerDelta !== dWar) s.unclassifiedDeltas.push({ day: cur.day, kind: 'war', delta: dWar, ledgerDelta: ledgerDelta, killsInWindow: ks.length });
      else if (ks.length === 0) s.unclassifiedDeltas.push({ day: cur.day, kind: 'war-no-kill-event', delta: dWar, killsInWindow: 0 });
    }
    if (dDip !== 0) {
      const pKeys = {}, cKeys = {};
      (prev.links || []).forEach(function (l) { pKeys[l.key] = l.counts; });
      (cur.links || []).forEach(function (l) { cKeys[l.key] = l.counts; });
      let transitions = 0;
      const all = {};
      Object.keys(pKeys).forEach(function (k) { all[k] = true; });
      Object.keys(cKeys).forEach(function (k) { all[k] = true; });
      Object.keys(all).forEach(function (k) { if (!!pKeys[k] !== !!cKeys[k]) transitions++; });
      const exp = transitions * 34;
      if (exp !== dDip) s.unclassifiedDeltas.push({ day: cur.day, kind: 'diplomacy', delta: dDip, transitions: transitions });
    }
    if (dPlen !== 0) {
      const fs = feastsIn(prev.day, cur.day);
      const fcPrev = feastCount(prev), fcCur = feastCount(cur);
      const logDelta = (fcCur.major - fcPrev.major) * 20;
      if (logDelta !== dPlen) s.unclassifiedDeltas.push({ day: cur.day, kind: 'plenty', delta: dPlen, logDelta: logDelta, feastEventsInWindow: fs.length });
      else if (fs.length === 0 && (fcCur.rows - fcPrev.rows) > 0) s.unclassifiedDeltas.push({ day: cur.day, kind: 'plenty-no-feast-event', delta: dPlen });
    }
  }

  // --- kill / war totals ---
  const logW4 = [];
  for (const d of daily) { if (d.logW4) for (const e of d.logW4) logW4.push(e); }
  // dedupe logW4 across snapshots (same entries repeat): key on d+mid+by
  const seenLog = {};
  const uniqW4 = [];
  for (const e of logW4) { const k = e.d + '|' + e.mid + '|' + e.by; if (!seenLog[k]) { seenLog[k] = true; uniqW4.push(e); } }
  s.logW4Count = uniqW4.length;
  for (const k of kills) {
    if (k.entryAdded === false) continue;
    s.warKills++;
    if (s.warKillsByWave[k.wave] != null) s.warKillsByWave[k.wave]++;
    if (s.warFirstDay == null) s.warFirstDay = k.day;
  }
  const lastSnap = daily[daily.length - 1];
  if (lastSnap) {
    const lp = ledgerPts(lastSnap);
    s.warPointsByWave = lp.perWave;
    // veteran linkage: every veteran reconciles to a wave-4+ kill
    const vets = lastSnap.veteranVids || [];
    const killers = {};
    uniqW4.forEach(function (e) { if (e.by) killers[e.by] = true; });
    for (const v of vets) if (!killers[v]) s.vetWithoutKill.push(v);
    for (const k of Object.keys(killers)) if (vets.indexOf(k) < 0) s.killersNotVeterans.push(k);
    if (lastSnap.veteranMismatch) s.mismatchDays.push(lastSnap.day);
  }
  for (const d of daily) if (d.veteranMismatch) s.mismatchDays.push(d.day);
  s.mismatchDays = Array.from(new Set(s.mismatchDays)).sort(function (a, b) { return a - b; });

  // --- diplomacy: per-link first-count + seasoned-only links ---
  const firstCount = {}, seasonedOnly = {};
  for (const d of daily) {
    for (const l of (d.links || [])) {
      if (l.counts && firstCount[l.key] == null) { firstCount[l.key] = d.day; if (s.diplomacyFirstDay == null) s.diplomacyFirstDay = d.day; }
      if (l.seasoned && !l.regionalPlus) seasonedOnly[l.key] = true;
    }
  }
  s.diplomacyLinksEver = Object.keys(firstCount).map(function (k) { return { key: k, firstDay: firstCount[k] }; });
  s.diplomacyLinksSeasonedOnly = Object.keys(seasonedOnly);

  // --- plenty: feasts ---
  for (const f of feasts) {
    if (((f.quality | 0) >= 1)) { s.feastCount++; if (s.plentyFirstDay == null) s.plentyFirstDay = f.day; }
    if (f.bundle) s.bundleFeastCount++;
  }
  if (s.feastCount === 0 && daily.length) {
    // No feast EVENTS captured (policy may never feast): fall back to log rows.
    const last = daily[daily.length - 1];
    if (last) { const fc = feastCount(last); s.feastCount = fc.major; s.bundleFeastCount = fc.bundle; }
  }

  // --- tribute markers: any link carrying a tributePaidWeek ---
  const trib = {};
  for (const d of daily) {
    for (const l of (d.links || [])) {
      if (l.tributePaidWeek != null) {
        if (!trib[l.key]) trib[l.key] = { key: l.key, firstDay: d.day, weeks: [] };
        if (trib[l.key].weeks.indexOf(l.tributePaidWeek) < 0) trib[l.key].weeks.push(l.tributePaidWeek);
      }
    }
  }
  s.tributeMarkers = Object.keys(trib).map(function (k) { return trib[k]; });

  // --- door classification ---
  // Wave-5 release lines ONLY: the wave-2/3/4 releases all say
  // "RATINGS ARE UP ... talent has been released", so the filter must
  // name the fifth draft, never the generic RATINGS phrase.
  const RELEASE_RE = /greenlit the fifth|Wave 5 talent has been released/i;
  const lines = out.standingLines || [];
  let prevPeak = 0;
  for (const d of daily) {
    const pk = (d.peak | 0) || 0;
    if (pk > prevPeak && pk >= 5) {
      const dayLines = lines.filter(function (L) { return L.day === d.day && RELEASE_RE.test(L.line); });
      if (dayLines.length) s.doorOpenDay = d.day;
      else s.unclassifiedReleases.push({ day: d.day, kind: 'peak-to-5-no-line' });
    }
    prevPeak = Math.max(prevPeak, pk);
  }
  for (const L of lines) {
    if (RELEASE_RE.test(L.line)) s.releaseLines.push(L);
    if (/stays in the wings|still waiting|next act|bread alone/i.test(L.line)) s.holdLineCount++;
  }
  // A release line with no door-open day is unclassified unless it is
  // the end-of-run unlockedWave() call's artifact.
  if (s.releaseLines.length && s.doorOpenDay == null && !out.endCallMovedPeak) {
    for (const L of s.releaseLines) s.unclassifiedReleases.push({ day: L.day, kind: 'release-line-no-peak' });
  }
  // death causes
  for (const e of (out.deathEvents || [])) {
    const c = e.cause || 'unknown';
    s.deathCauses[c] = (s.deathCauses[c] || 0) + 1;
  }
  return s;
}

function summarizeAll(seeds) {
  const per = seeds.map(summarizeSeed);
  const pooled = {
    seeds: per.length,
    wins: per.filter(function (s) { return s.won; }).length,
    national: per.filter(function (s) { return s.scaleRank === 'national'; }).length,
    table: 0,
    wave4faced: 0, wave5faced: 0, wave5unlock: 0,
    readyDaysTotal: 0, doorOpens: 0, capped200: 0,
    medianSurvival: null, maxSurvival: 0,
    deaths: {},
  };
  const days = [];
  for (const s of per) {
    days.push(s.days);
    if (s.maxWave >= 4) pooled.wave4faced++;
    if (s.maxWave >= 5) pooled.wave5faced++;
    if (s.endUnlockedWave >= 5) pooled.wave5unlock++;
    pooled.readyDaysTotal += s.readyDayCount;
    if (s.doorOpenDay != null) pooled.doorOpens++;
    if (s.bestCapped >= 200) pooled.capped200++;
    for (const c of Object.keys(s.deathCauses)) pooled.deaths[c] = (pooled.deaths[c] || 0) + (s.deathCauses[c] || 0);
  }
  days.sort(function (a, b) { return a - b; });
  pooled.medianSurvival = days.length ? days[Math.floor(days.length / 2)] : null;
  pooled.maxSurvival = days.length ? days[days.length - 1] : 0;
  return { per: per, pooled: pooled };
}

module.exports = { summarizeSeed: summarizeSeed, summarizeAll: summarizeAll, linkCounts: linkCounts, feastCount: feastCount, ledgerPts: ledgerPts };
