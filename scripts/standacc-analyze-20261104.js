// standacc-analyze-20261104.js — standing accumulation analyzer
// (arm sim-standacc-b). Pure functions over a per-seed driver JSON:
// best-capped day + decomposition, gap to 200, plenty shave,
// diplomacy funnel, war headroom, negative component deltas
// (sinks), qualifying-seed test, ready / ready-but-unreleased day
// counts, GO-trace classification, wall-number fields, and
// standing-line classification (hold / release / other).
// No game code, no I/O.
'use strict';

function barsMet(rd) {
  if (!rd || !rd.demand) return 0;
  let n = 0;
  if ((rd.armored | 0) >= (rd.demand.armored | 0)) n++;
  if ((rd.armed | 0) >= (rd.demand.armed | 0)) n++;
  if ((rd.tricks | 0) >= (rd.demand.tricks | 0)) n++;
  if ((rd.veterans | 0) >= (rd.demand.veterans | 0)) n++;
  return n;
}

function summarizeSeed(out) {
  const daily = out.daily || [];
  let best = null, bestCapped = -1;
  let readyDayCount = 0, readyUnreleasedDayCount = 0, readyRuns = [];
  let curRun = null;
  const mismatchDays = [];
  let peak = 0;
  let firstCapped150 = null, firstCapped200 = null;
  let maxBarsMet = 0;
  const negDeltas = [];
  let prev = null;
  for (const s of daily) {
    const capped = (s.capped == null ? -1 : (s.capped | 0));
    if (capped > bestCapped) { bestCapped = capped; best = s; }
    if ((s.peak | 0) > peak) peak = (s.peak | 0);
    const ready = !!(s.readiness5 && s.readiness5.ready);
    if (ready) {
      readyDayCount++;
      if (curRun == null) curRun = { start: s.day, days: 0 };
      curRun.days++; curRun.end = s.day;
    } else if (curRun) { readyRuns.push(curRun); curRun = null; }
    if (capped >= 200 && !ready && (s.peak | 0) < 5) readyUnreleasedDayCount++;
    if (firstCapped150 == null && capped >= 150) firstCapped150 = s.day;
    if (firstCapped200 == null && capped >= 200) firstCapped200 = s.day;
    const bm = barsMet(s.readiness5);
    if (bm > maxBarsMet) maxBarsMet = bm;
    if (s.veteranMismatch) mismatchDays.push(s.day);
    if (prev && s.standing && prev.standing) {
      for (const k of ['war', 'diplomacy', 'plenty']) {
        const d = ((s.standing[k] | 0) - (prev.standing[k] | 0));
        if (d < 0) negDeltas.push({ from: prev.day, to: s.day, component: k, delta: d, before: (prev.standing[k] | 0), after: (s.standing[k] | 0) });
      }
    }
    prev = s;
  }
  if (curRun) readyRuns.push(curRun);
  const qualifying = (maxBarsMet >= 3) || (bestCapped >= 150) || (readyDayCount > 0);
  const st = (best && best.standing) || {};
  const raw = (st.total == null ? null : (st.total | 0));
  const cappedBest = (best && best.capped == null ? null : (best.capped | 0));
  const shave = (st.plenty == null ? null : Math.max(0, (st.plenty | 0) - 100));
  const gap = (cappedBest == null ? null : Math.max(0, 200 - cappedBest));
  const funnel = (best && best.linkFunnel) || null;
  const ledger = (best && best.ledger) || null;
  let warHeadroomPts = null;
  if (ledger) {
    warHeadroomPts = 0;
    for (const w of ['w3', 'w4', 'w5']) if (ledger[w]) warHeadroomPts += (ledger[w].headroomPts | 0);
  }
  // GO-trace classification (prereg): ONE named source's missing/
  // shaved amount >= gap at the best capped day, or the diplomacy
  // channel entirely absent with the funnel showing why.
  let traceKind = null;
  if (gap != null && gap > 0) {
    const stallClosure = funnel ? (funnel.seasonedNotRegional | 0) * 34 : 0;
    if (shave != null && shave >= gap) traceKind = 'plenty-cap';
    else if (stallClosure >= gap) traceKind = 'diplomacy-stalled';
    else if ((st.diplomacy | 0) === 0 && funnel && (funnel.total | 0) === 0) traceKind = 'diplomacy-absent-no-links';
    else if ((st.diplomacy | 0) === 0 && funnel && (funnel.seasoned | 0) === 0) traceKind = 'diplomacy-absent-unseasoned';
    else if ((st.diplomacy | 0) === 0 && funnel && (funnel.seasonedNotRegional | 0) > 0) traceKind = 'diplomacy-absent-stalled';
  } else if (gap === 0) {
    traceKind = 'no-gap';
  }
  const traced = traceKind != null && traceKind !== 'no-gap';
  // Death-cause tally.
  const deathCauses = {};
  for (const d of (out.deathEvents || [])) {
    const c = d.cause || d.kind || 'unknown';
    deathCauses[c] = (deathCauses[c] | 0) + 1;
  }
  // Standing-line classification.
  const holdLines = [], releaseLines = [], otherLines = [];
  for (const l of (out.standingLines || [])) {
    if (/fifth draft stays in the wings|next act is (not|still)/i.test(l.line)) holdLines.push(l);
    else if (/RATINGS ARE UP|greenlit|talent has been released/i.test(l.line)) releaseLines.push(l);
    else otherLines.push(l);
  }
  const endSnap = daily.length ? daily[daily.length - 1] : null;
  return {
    seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
    villageLost: out.villageLost, scaleRank: out.scaleRank, maxWave: out.maxWave,
    endUnlockedWave: out.endUnlockedWave, endCallMovedPeak: out.endCallMovedPeak,
    peak: peak, snapshots: daily.length,
    bestDay: best ? best.day : null, bestCapped: bestCapped < 0 ? null : bestCapped,
    bestRaw: raw,
    bestSplit: { war: (st.war == null ? null : (st.war | 0)), diplomacy: (st.diplomacy == null ? null : (st.diplomacy | 0)), plenty: (st.plenty == null ? null : (st.plenty | 0)), warPts: (st.warPts == null ? null : (st.warPts | 0)), links: (st.links == null ? null : (st.links | 0)), feasts: (st.feasts == null ? null : (st.feasts | 0)) },
    gapAtBest: gap, shaveAtBest: shave,
    funnelAtBest: funnel ? { total: funnel.total, active: funnel.active, seasoned: funnel.seasoned, regionalPlus: funnel.regionalPlus, seasonedNotRegional: funnel.seasonedNotRegional } : null,
    ledgerAtBest: ledger,
    warHeadroomPts: warHeadroomPts,
    endSplit: endSnap && endSnap.standing ? { war: (endSnap.standing.war | 0), diplomacy: (endSnap.standing.diplomacy | 0), plenty: (endSnap.standing.plenty | 0), capped: (endSnap.capped | 0) } : null,
    maxBarsMet: maxBarsMet, qualifying: qualifying,
    readyDayCount: readyDayCount, readyRuns: readyRuns,
    readyUnreleasedDayCount: readyUnreleasedDayCount,
    firstCapped150: firstCapped150, firstCapped200: firstCapped200,
    w4faced: daily.some(function (s) { return !!s.w4faced; }),
    w5faced: daily.some(function (s) { return !!s.w5faced; }),
    w3rungMet: daily.some(function (s) { return s.w3rung && s.w3rung.met; }),
    mismatchDays: mismatchDays, negDeltas: negDeltas,
    deathCauses: deathCauses, deathCount: (out.deathEvents || []).length,
    killWaves: (function () { const c = {}; for (const k of (out.killEvents || [])) c['w' + k.wave] = (c['w' + k.wave] | 0) + 1; return c; })(),
    holdLines: holdLines.length, releaseLines: releaseLines.length, otherLines: otherLines.length,
    traced: traced, traceKind: traceKind,
    instrumentErrors: (out.instrumentErrors || []).length,
  };
}

function judgeGo(summaries) {
  const qualifying = summaries.filter(function (s) { return s.qualifying; });
  const pool = qualifying.length >= 6 ? summaries : qualifying;
  const traced = pool.filter(function (s) { return s.traced; });
  const kinds = {};
  for (const s of traced) kinds[s.traceKind] = (kinds[s.traceKind] | 0) + 1;
  let dominant = null, dominantN = 0;
  for (const k of Object.keys(kinds)) if (kinds[k] > dominantN) { dominant = k; dominantN = kinds[k]; }
  const go = pool.length > 0 && traced.length === pool.length && dominant != null && dominantN === pool.length;
  // Prereg bar: traced on >=6/8, or on every qualifying seed if <6 qualify.
  // The single-named-source reading requires the SAME kind on all judged seeds.
  const goStrict = (qualifying.length >= 6)
    ? (summaries.filter(function (s) { return s.traced; }).length >= 6 && dominantN >= 6)
    : (pool.length > 0 && traced.length === pool.length);
  return { qualifying: qualifying.length, judgedPool: pool.length, traced: traced.length, kinds: kinds, dominant: dominant, dominantN: dominantN, go: goStrict, goNote: goStrict ? 'DIAG-GO' : 'DIAG-NO-CANDIDATE' };
}

module.exports = { summarizeSeed: summarizeSeed, barsMet: barsMet, judgeGo: judgeGo };
