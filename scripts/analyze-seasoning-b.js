// analyze-seasoning-b.js — analyzer for the DIAG arm sim-seasoning-b
// (run fleshout-loop-b-20261116T1130Z, axis winnability chain).
// THE QUESTION (tracker blank 6, 0430Z blank #3): how often does
// 2-of-3-seasoned block covenant staging / national reach? The
// re-confirm's two armed non-stages (100630, 100636) were 2-of-3
// seasoned at 200d. This analyzer reads the per-seed JSONs from
// scripts/onlylead-driver-20261115.js (RUN=seasoning-b) and, per seed
// per day, classifies every covenant staging decision from the
// record's own daily roll — the engine's own shape-candidate roll
// (shapeCands), the rung flag, the road maxima, and the per-link roll
// — against the frozen gate list from hierarchy.js _checkNational:
//
//   staged: pendingNational.shape === 'covenant' that day, or an
//     answerNationalChoice event with shape covenant that day.
//   seasoning-blocked: not staged AND rung met AND no pendingNational
//     AND !nationalLive AND !scaleRefused AND !exiled AND no
//     higher-priority candidate (lead/conquest/belong all null) AND
//     the covenant candidate null AND >=3 covenant links formed AND
//     <3 seasoned. The ONLY failing gate is seasoning.
//   other-blocked: not staged and some other gate failing (rung not
//     met; a higher-priority candidate present; <3 formed; a beat of
//     another shape pending; national already live; scale refused;
//     exiled).
//   unclassified: the covenant candidate present, rung met, nothing
//     pending/live/refused/exiled, no higher shape — yet no beat
//     staged. The engine should have staged it; a mystery, never a
//     silent default. Counts toward unknown.
//
// Per seed it reports: firstOpportunityDay (first day all
// non-seasoning gates pass), seasoningBlockedDays, stagedDay,
// daysLost (stagedDay - firstOpportunityDay, or censored
// endDay - firstOpportunityDay when never staged), the blocker
// link(s) — the unseasoned covenant link(s) on blocked days, each
// decomposed into age-short (age < 30) vs trust-short (trust < 40)
// — the decisive blocker (the link seasoning last), and the verdict:
// staged | seasoning-blocked | other-blocked | unknown. The
// onlylead classifyShape covenant blocker is carried as a
// cross-check (maxima-based summary vs this per-day read); the
// per-day read is authoritative where they differ.
//
// Seasoned (hierarchy.js _linkSeasoned): age 30+ days AND trust 40+
// (conquered links age only; mercy-grace / SUCC gates env-gated,
// default OFF here). The links roll's `se` flag is the 2-arg read;
// the blocked-day decision ALSO requires the engine's own candidate
// null, so the engine agrees the polity does not qualify — the `se`
// flags only NAME the blocker links, they never decide blocked-ness.
//
// Usage: node scripts/analyze-seasoning-b.js [controlDir] [onDir] [outPath]
//   writes evidence/2026-11-16/seasoning-b-analysis.json and prints a
//   human summary to stdout.
// As a module: { classifySeasoningDay, analyzeSeasoning, analyze }.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const ONLYLEAD = require(path.join(REPO, 'scripts', 'analyze-onlylead-b.js'));

function candOf(sn, shape) {
  try { return (sn.shapeCands || {})[shape] || null; } catch (e) { return null; }
}
function roadOf(sn) {
  return sn.road || { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null };
}
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Unseasoned covenant links on one snapshot day, each decomposed
// into the two seasoning components (age 30+ AND trust 40+).
function blockerLinks(sn) {
  const out = [];
  try {
    for (const l of (sn.linksRoll || [])) {
      if (!l || l.k !== 'covenant' || l.st !== 'active' || l.se) continue;
      out.push({
        other: l.o || null, id: l.id || null,
        formedDay: l.f | 0, age: l.age | 0, trust: l.t | 0,
        ageShort: (l.age | 0) < 30, trustShort: (l.t | 0) < 40,
        // Days until the age half is met (0 when met); trust points
        // still owed (0 when met). The decisive component is the one
        // that resolves last.
        ageDaysOwed: Math.max(0, 30 - (l.age | 0)),
        trustOwed: Math.max(0, 40 - (l.t | 0)),
      });
    }
  } catch (e) {}
  return out;
}

// Classify ONE day for the covenant shape. `stagedToday` is true when
// a verbEvent answers a covenant national beat that day (the beat may
// already be answered by snapshot time, so the snapshot alone cannot
// see it). Returns { cls, gate, blockers } where cls is one of
// 'staged' | 'seasoning-blocked' | 'other-blocked' | 'unclassified'
// and gate names the failing gate (null when staged).
function classifySeasoningDay(sn, stagedToday) {
  const pn = sn.pendingNational || null;
  if ((pn && pn.shape === 'covenant') || stagedToday) {
    return { cls: 'staged', gate: null, blockers: [] };
  }
  if (!sn.rungMet) return { cls: 'other-blocked', gate: 'rung', blockers: [] };
  if (pn) return { cls: 'other-blocked', gate: 'pending:' + (pn.shape || '?'), blockers: [] };
  if (sn.nationalLive) return { cls: 'other-blocked', gate: 'national-live', blockers: [] };
  if (sn.scaleRefused) return { cls: 'other-blocked', gate: 'scale-refused', blockers: [] };
  if (sn.exiled) return { cls: 'other-blocked', gate: 'exiled', blockers: [] };
  if (candOf(sn, 'lead')) return { cls: 'other-blocked', gate: 'shadowed:lead', blockers: [] };
  if (candOf(sn, 'conquest')) return { cls: 'other-blocked', gate: 'shadowed:conquest', blockers: [] };
  if (candOf(sn, 'belong')) return { cls: 'other-blocked', gate: 'shadowed:belong', blockers: [] };
  if (candOf(sn, 'covenant')) return { cls: 'unclassified', gate: 'qualified-unstaged', blockers: [] };
  const r = roadOf(sn);
  if ((r.nCovFormed | 0) < 3) {
    return { cls: 'other-blocked', gate: (r.nCovFormed | 0) === 0 ? 'no-peer-links' : 'formed-short:' + (r.nCovFormed | 0) + '-of-3', blockers: [] };
  }
  if ((r.nCovSeas | 0) >= 3) return { cls: 'unclassified', gate: 'seas-count-mismatch', blockers: [] };
  return { cls: 'seasoning-blocked', gate: 'seasoned-short:' + (r.nCovSeas | 0) + '-of-' + (r.nCovFormed | 0), blockers: blockerLinks(sn) };
}

// Analyze ONE per-seed record for the covenant shape. Returns the
// per-seed seasoning record (see header). `unknown` is 1 when any
// staging decision in the window is unclassified, else 0.
function analyzeSeasoning(rec) {
  const series = rec.series || [];
  const evs = rec.verbEvents || [];
  const stagedDays = new Set();
  for (const ev of evs) {
    if (ev.verb === 'answerNationalChoice' && ev.shape === 'covenant') stagedDays.add(ev.day | 0);
  }
  for (const sn of series) {
    if (sn.pendingNational && sn.pendingNational.shape === 'covenant') stagedDays.add(sn.d | 0);
  }
  const stagedDay = stagedDays.size ? Math.min.apply(null, Array.from(stagedDays)) : null;
  const endDay = series.length ? (series[series.length - 1].d | 0) : 0;

  // Per-day classification over the whole series (post-stage days
  // classify as national-live / pending and are reported separately,
  // never counted as blocked days).
  const dayCls = [];
  let firstOpportunityDay = null;
  let unclassifiedDays = 0;
  const unclassifiedList = [];
  for (const sn of series) {
    const c = classifySeasoningDay(sn, stagedDays.has(sn.d | 0));
    dayCls.push({ day: sn.d | 0, cls: c.cls, gate: c.gate, blockers: c.blockers });
    if (c.cls === 'unclassified') { unclassifiedDays++; unclassifiedList.push(sn.d | 0); }
    // The opportunity window opens on the first day all
    // non-seasoning gates pass: a seasoning-blocked day, or the
    // staging day itself (seasoning already met that morning).
    if (firstOpportunityDay === null && (c.cls === 'seasoning-blocked' || c.cls === 'staged')) {
      firstOpportunityDay = sn.d | 0;
    }
  }
  // Window days: [firstOpportunityDay, stagedDay] when staged,
  // [firstOpportunityDay, endDay] when never staged. Days after the
  // staging day are post-stage, never window days.
  const windowEnd = stagedDay !== null ? stagedDay : endDay;
  let seasoningBlockedDays = 0;
  let otherBlockedWindowDays = 0;
  let windowUnclassified = 0;
  // Age-vs-trust split over blocked days: when exactly one link is
  // unseasoned, the binding component is that link's shortfall;
  // with 2+ unseasoned, the day counts as multi.
  let ageOnlyDays = 0, trustOnlyDays = 0, bothDays = 0, multiDays = 0;
  const blockerDayCount = {}; // other village -> blocked days as a blocker
  for (const dc of dayCls) {
    if (firstOpportunityDay === null || dc.day < firstOpportunityDay || dc.day > windowEnd) continue;
    if (dc.cls === 'staged') continue; // the staging day itself is not lost
    if (dc.cls === 'seasoning-blocked') {
      seasoningBlockedDays++;
      const bs = dc.blockers || [];
      for (const b of bs) blockerDayCount[b.other || b.id || '?'] = (blockerDayCount[b.other || b.id || '?'] || 0) + 1;
      if (bs.length === 1) {
        if (bs[0].ageShort && bs[0].trustShort) bothDays++;
        else if (bs[0].ageShort) ageOnlyDays++;
        else if (bs[0].trustShort) trustOnlyDays++;
      } else if (bs.length > 1) multiDays++;
    } else if (dc.cls === 'other-blocked') otherBlockedWindowDays++;
    else if (dc.cls === 'unclassified') windowUnclassified++;
  }
  const daysLost = firstOpportunityDay === null ? null
    : (stagedDay !== null ? stagedDay - firstOpportunityDay : endDay - firstOpportunityDay + 1);
  // daysLost counts WINDOW days: [firstOpp, stagedDay) when staged
  // (the staged day itself is not lost), [firstOpp, endDay] inclusive
  // when never staged — i.e. seasoningBlockedDays +
  // otherBlockedWindowDays. Censored when never staged.
  const censored = stagedDay === null && firstOpportunityDay !== null;

  // Decisive blocker: the link seasoning last. Staged seeds — the
  // link whose `se` flips 0 -> 1 on the staging day (compare the
  // links roll on stagedDay vs the previous series day). Never-staged
  // seeds — the link(s) still unseasoned on the final day, with what
  // each still owes. When seasoning was already met before staging
  // (staged after a shadow lifted), decisive is null by design.
  let decisive = null;
  try {
    if (stagedDay !== null) {
      const byDay = {};
      for (const sn of series) byDay[sn.d | 0] = sn;
      const today = byDay[stagedDay];
      const prev = byDay[stagedDay - 1] || null;
      const prevSe = {};
      if (prev) for (const l of (prev.linksRoll || [])) if (l && l.id) prevSe[l.id] = !!l.se;
      if (today) {
        for (const l of (today.linksRoll || [])) {
          if (!l || l.k !== 'covenant' || l.st !== 'active' || !l.se) continue;
          if (prev && prevSe[l.id] === false) {
            decisive = { other: l.o || null, id: l.id || null, formedDay: l.f | 0, age: l.age | 0, trust: l.t | 0, seasonedDay: stagedDay };
          }
        }
      }
    } else if (firstOpportunityDay !== null && series.length) {
      const last = series[series.length - 1];
      const still = blockerLinks(last);
      if (still.length) {
        decisive = { stillUnseasoned: still.map(function (b) {
          return { other: b.other, formedDay: b.formedDay, age: b.age, trust: b.trust, ageDaysOwed: b.ageDaysOwed, trustOwed: b.trustOwed };
        }) };
      }
    }
  } catch (e) {}

  // Final-day gate (the state at run end, for the verdict).
  const finalCls = dayCls.length ? dayCls[dayCls.length - 1] : null;
  // Cross-check: the onlylead maxima-based covenant blocker.
  let crossCheck = null;
  try { crossCheck = ONLYLEAD.classifyShape(rec, 'covenant'); } catch (e) { crossCheck = { outcome: 'UNCLASSIFIED', blocker: 'analyzer-error:' + String((e && e.message) || e).slice(0, 60) }; }

  let verdict, verdictGate = null;
  if (stagedDay !== null) { verdict = 'staged'; }
  else if (windowUnclassified > 0 || unclassifiedDays > 0) { verdict = 'unknown'; verdictGate = 'unclassified-days:' + unclassifiedList.slice(0, 5).join(','); }
  else if (firstOpportunityDay === null) {
    // No opportunity day ever: the binding gate is the final day's
    // per-day gate (rung / no-peer-links / formed-short). The
    // maxima-based cross-check is informational only — it cannot
    // distinguish rung-blocked from seasoned-short (a seed with 3
    // seasoned links and no rung reads 'seasoned-short:3-of-3' there).
    verdict = 'other-blocked';
    verdictGate = (finalCls && finalCls.gate) || (crossCheck && crossCheck.blocker) || 'no-opportunity';
  }
  else if (finalCls && finalCls.cls === 'seasoning-blocked') { verdict = 'seasoning-blocked'; verdictGate = finalCls.gate; }
  else if (seasoningBlockedDays > 0 && finalCls && finalCls.cls === 'other-blocked') {
    // Seasoning bound the seed for days, but the final day's binding
    // gate was another one (e.g. a higher shape shadowed it at the
    // end). Primary verdict is other-blocked; seasoningBound below
    // keeps the honest count.
    verdict = 'other-blocked'; verdictGate = finalCls.gate;
  } else if (seasoningBlockedDays > 0) { verdict = 'seasoning-blocked'; verdictGate = 'seasoned-short'; }
  else { verdict = 'other-blocked'; verdictGate = (finalCls && finalCls.gate) || ((crossCheck && crossCheck.blocker) || 'no-opportunity'); }

  return {
    seed: rec.seed, policy: rec.policy,
    endDay: endDay, endReason: rec.endReason || null,
    survived: rec.endReason === 'survived',
    stagedDay: stagedDay, firstOpportunityDay: firstOpportunityDay,
    seasoningBlockedDays: seasoningBlockedDays,
    otherBlockedWindowDays: otherBlockedWindowDays,
    daysLost: daysLost, censored: !!censored,
    verdict: verdict, verdictGate: verdictGate,
    seasoningBound: seasoningBlockedDays > 0,
    ageOnlyDays: ageOnlyDays, trustOnlyDays: trustOnlyDays,
    bothDays: bothDays, multiDays: multiDays,
    blockerDayCount: blockerDayCount,
    decisive: decisive,
    finalDayCls: finalCls ? { day: finalCls.day, cls: finalCls.cls, gate: finalCls.gate } : null,
    unclassifiedDays: unclassifiedDays, unclassifiedList: unclassifiedList,
    unknown: (verdict === 'unknown' || windowUnclassified > 0) ? 1 : 0,
    crossCheck: crossCheck ? { outcome: crossCheck.outcome, blocker: crossCheck.blocker, blockers: crossCheck.blockers || [] } : null,
  };
}

// D3 engine-agreement: on every day of the corpus, the analyzer's
// classification agrees with the engine's own candidate roll —
// every seasoning-blocked day has the covenant candidate null (by
// construction — verified), and every staged day has the candidate
// non-null that day or the day before (staging runs in hierarchyDaily;
// the snapshot may catch the answer, not the staging). Returns the
// agreement counts; 100% is the D3 bar.
function engineAgreement(records) {
  let blockedDays = 0, blockedCandidateNull = 0;
  let stagedDays = 0, stagedCandidateSeen = 0;
  const misses = [];
  for (const rec of records) {
    const candByDay = {};
    for (const sn of (rec.series || [])) candByDay[sn.d | 0] = !!(sn.shapeCands && sn.shapeCands.covenant);
    const per = analyzeSeasoning(rec);
    const stagedSet = new Set();
    for (const ev of (rec.verbEvents || [])) {
      if (ev.verb === 'answerNationalChoice' && ev.shape === 'covenant') stagedSet.add(ev.day | 0);
    }
    for (const sn of (rec.series || [])) {
      if (sn.pendingNational && sn.pendingNational.shape === 'covenant') stagedSet.add(sn.d | 0);
    }
    for (const sn of (rec.series || [])) {
      const c = classifySeasoningDay(sn, stagedSet.has(sn.d | 0));
      if (c.cls === 'seasoning-blocked') {
        blockedDays++;
        if (!candByDay[sn.d | 0]) blockedCandidateNull++;
        else misses.push(rec.seed + ':' + rec.policy + ' d' + sn.d + ' blocked-but-candidate-present');
      }
    }
    for (const d of stagedSet) {
      stagedDays++;
      if (candByDay[d] || candByDay[d - 1]) stagedCandidateSeen++;
      else misses.push(rec.seed + ':' + rec.policy + ' d' + d + ' staged-but-no-candidate');
    }
    void per;
  }
  return { blockedDays: blockedDays, blockedCandidateNull: blockedCandidateNull, stagedDays: stagedDays, stagedCandidateSeen: stagedCandidateSeen, misses: misses };
}

function analyze(records) {
  const perSeed = {};
  const byPolicy = {};
  let unknown = 0;
  for (const rec of records) {
    const r = analyzeSeasoning(rec);
    perSeed[rec.seed + '-' + rec.policy] = r;
    if (r.unknown) unknown++;
    if (!byPolicy[rec.policy]) {
      byPolicy[rec.policy] = { n: 0, staged: 0, seasoningBlocked: 0, otherBlocked: 0, unknown: 0, seasoningBound: 0, blockedDays: 0, daysLostStaged: [], daysLostCensored: [], ageOnlyDays: 0, trustOnlyDays: 0, bothDays: 0, multiDays: 0 };
    }
    const b = byPolicy[rec.policy];
    b.n++;
    if (r.verdict === 'staged') { b.staged++; if (r.daysLost !== null) b.daysLostStaged.push(r.daysLost); }
    else if (r.verdict === 'seasoning-blocked') b.seasoningBlocked++;
    else if (r.verdict === 'other-blocked') b.otherBlocked++;
    else b.unknown++;
    if (r.seasoningBound) b.seasoningBound++;
    b.blockedDays += r.seasoningBlockedDays;
    if (r.verdict !== 'staged' && r.daysLost !== null) b.daysLostCensored.push(r.daysLost);
    b.ageOnlyDays += r.ageOnlyDays; b.trustOnlyDays += r.trustOnlyDays;
    b.bothDays += r.bothDays; b.multiDays += r.multiDays;
  }
  // Seasoning-blocked share of non-stages, per leg + band-wide.
  // Primary verdict read, and the seasoningBound read (any blocked
  // day, even when the final day's binding gate was another one).
  for (const pol of Object.keys(byPolicy)) {
    const b = byPolicy[pol];
    const nonStaged = b.n - b.staged;
    b.nonStaged = nonStaged;
    b.seasoningShareOfNonStages = nonStaged ? b.seasoningBlocked / nonStaged : null;
    const boundNonStaged = records.filter(function (r) {
      if (r.policy !== pol) return false;
      const ps = perSeed[r.seed + '-' + r.policy];
      return ps && ps.verdict !== 'staged' && ps.seasoningBound;
    }).length;
    b.seasoningBoundShareOfNonStages = nonStaged ? boundNonStaged / nonStaged : null;
    b.medianDaysLostStaged = med(b.daysLostStaged);
    b.medianDaysLostCensored = med(b.daysLostCensored);
  }
  const band = { n: records.length, staged: 0, seasoningBlocked: 0, otherBlocked: 0, unknown: unknown };
  for (const pol of Object.keys(byPolicy)) {
    band.staged += byPolicy[pol].staged;
    band.seasoningBlocked += byPolicy[pol].seasoningBlocked;
    band.otherBlocked += byPolicy[pol].otherBlocked;
  }
  band.nonStaged = band.n - band.staged;
  band.seasoningShareOfNonStages = band.nonStaged ? band.seasoningBlocked / band.nonStaged : null;
  const bandBoundNonStaged = records.filter(function (r) {
    const ps = perSeed[r.seed + '-' + r.policy];
    return ps && ps.verdict !== 'staged' && ps.seasoningBound;
  }).length;
  band.seasoningBoundShareOfNonStages = band.nonStaged ? bandBoundNonStaged / band.nonStaged : null;
  // Wall numbers, national BOTH ways (findings #2422): end standing
  // >= 200 vs the final scaleRank field, plus ever-national from the
  // per-day series scale field.
  const wall = {};
  for (const pol of Object.keys(byPolicy)) {
    const recs = records.filter(function (r) { return r.policy === pol; });
    const natStanding = recs.filter(function (r) { return (r.standing | 0) >= 200; }).length;
    const natRank = recs.filter(function (r) { return r.scaleRank === 'national' || r.scaleRank === 'global'; }).length;
    let natEver = 0;
    for (const r of recs) {
      if ((r.series || []).some(function (sn) { return sn.scale === 'national' || sn.scale === 'global'; })) natEver++;
    }
    const wins = recs.filter(function (r) { return r.won; }).length;
    const table = recs.filter(function (r) { return r.tableState && r.tableState.phase; }).length;
    const w4 = recs.filter(function (r) { return (r.maxWave | 0) >= 4; }).length;
    const w5 = recs.filter(function (r) { return (r.maxWave | 0) >= 5; }).length;
    const w4k = recs.reduce(function (t, r) { return t + (((r.waveKills || {})['4'] | 0)); }, 0);
    const w5k = recs.reduce(function (t, r) { return t + (((r.waveKills || {})['5'] | 0)); }, 0);
    const surv = recs.map(function (r) { return r.gameDays | 0; }).sort(function (a, b) { return a - b; });
    wall[pol] = {
      n: recs.length,
      nationalStanding200: natStanding, nationalScaleRank: natRank, nationalEver: natEver,
      table: table, wins: wins, wave4ever: w4, wave5ever: w5,
      wave4kills: w4k, wave5kills: w5k,
      medianSurvival: med(surv), maxSurvival: surv.length ? surv[surv.length - 1] : null,
      survived: recs.filter(function (r) { return r.endReason === 'survived'; }).length,
      starvationDeaths: recs.reduce(function (t, r) {
        return t + ((r.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length);
      }, 0),
      totalDeaths: recs.reduce(function (t, r) { return t + ((r.deaths || []).length); }, 0),
    };
  }
  const d3 = engineAgreement(records);
  // Onlylead shape layer (cross-check): covenant classifyShape per seed.
  const shapes = {};
  try { shapes.covenantBySeed = ONLYLEAD.analyzeShapes(records).perSeed; } catch (e) { shapes.error = String((e && e.message) || e).slice(0, 120); }
  return { perSeed: perSeed, byPolicy: byPolicy, band: band, wall: wall, d3: d3, shapes: shapes, unknown: unknown };
}

// ---------- PHASE-CORRECTED CLASSIFIER (sim-seasoning-g1-b) ---------- //
// Metric-review items 1–3 + 5 of sim-seasoning-b.md, implemented
// ADDITIVELY: every frozen export above keeps frozen semantics (the
// frozen proof stays 59/59 and the frozen CLI output stays
// byte-identical to seasoning-b-analysis.json). The corrected layer
// below re-reads the same records and re-judges G1 under the
// phase-corrected definitions:
//
//   * The driver snapshots AFTER policy.daily(); _checkNational runs
//     inside sleep()'s endDay, before the day increments. The day-D
//     snapshot therefore shows the pre-boundary state, while the
//     staging is recorded the same day in the Codex channel
//     ("National beat staged: covenant" linkLine, dated the
//     qualification day on 8/8 staged seeds) and answered the next
//     day (answerNationalChoice verbEvent, uncapped channel).
//   * A should-stage day (frozen 'unclassified': covenant candidate
//     present, rung met, nothing pending/live/refused/exiled, no
//     higher shape — or 3+ seasoned with the candidate null) is a
//     STAGED-PRECURSOR when staging follows within one boundary
//     (answer/pending on day d or d+1, nationalLive on the d+1
//     snapshot, or a staging linkLine dated day d). The linkLine is
//     supporting evidence only (capped channel, item 4 — the cap is
//     LEFT as-is, never raised on the shared harness); the verbEvents
//     answer is authoritative.
//   * A should-stage day counts as UNKNOWN only when the qualified
//     candidate survives a boundary unstaged: it follows another
//     should-stage day with no staging between them AND no staging
//     follows within one boundary of it. The first day of such a run
//     is QUALIFIED-FIRST (not counted); a lone should-stage day whose
//     qualification lapses the next day is neither precursor nor
//     unknown — the engine did not fail to stage, the state changed.
//   * daysLost is measured to the QUALIFICATION day (first precursor
//     day), not the answer day; the frozen figure rides alongside.
//   * The decisive-blocker flip window compares the qualification day
//     against the day before it (item 3), not the answer day.
//   * The wall carries the raw-standing read (standingRaw >= 200)
//     alongside the gated read and scaleRank (item 5).
//
// A staged seed with no precursor day (candidate and staging visible
// in the same snapshot — pendingNational on the qualification day
// itself) falls back to qualificationDay = answerDay, recorded as
// qualificationSource 'answer-fallback'; daysLost then equals the
// frozen figure.

// Days carrying a "National beat staged: covenant" Codex line.
function stagingLineDaysOf(rec) {
  const s = new Set();
  try {
    for (const l of (rec.linkLines || [])) {
      if (l && typeof l.line === 'string' && l.line.indexOf('National beat staged: covenant') !== -1) s.add(l.day | 0);
    }
  } catch (e) {}
  return s;
}
// Answer/pending days for the covenant shape (same set the frozen
// analyzer uses for stagedDay).
function stagedDaysOf(rec) {
  const s = new Set();
  for (const ev of (rec.verbEvents || [])) {
    if (ev.verb === 'answerNationalChoice' && ev.shape === 'covenant') s.add(ev.day | 0);
  }
  for (const sn of (rec.series || [])) {
    if (sn.pendingNational && sn.pendingNational.shape === 'covenant') s.add(sn.d | 0);
  }
  return s;
}
// The frozen 'unclassified' gate for one day, or null when the day is
// not a should-stage day.
function shouldStageGate(sn, stagedToday) {
  const c = classifySeasoningDay(sn, stagedToday);
  return c.cls === 'unclassified' ? c.gate : null;
}

// Corrected classification of ONE day. ctx: { stagingFollows(day),
// prevShouldStage }. cls is one of the frozen four plus
// 'staged-precursor' | 'qualified-first' | 'unknown'.
function classifySeasoningDayCorrected(sn, stagedToday, ctx) {
  const base = classifySeasoningDay(sn, stagedToday);
  if (base.cls !== 'unclassified') return base;
  const d = sn.d | 0;
  if (ctx.stagingFollows(d)) return { cls: 'staged-precursor', gate: 'precursor:' + base.gate, blockers: [] };
  if (ctx.prevShouldStage) return { cls: 'unknown', gate: 'survived-boundary:' + base.gate, blockers: [] };
  return { cls: 'qualified-first', gate: 'qualified-first:' + base.gate, blockers: [] };
}

// Corrected per-seed analysis. Returns the frozen per-seed record
// plus the corrected fields (corrected values unprefixed where they
// supersede, frozen values kept under *Frozen names).
function analyzeSeasoningCorrected(rec) {
  const frozen = analyzeSeasoning(rec);
  const series = rec.series || [];
  const stagedDays = stagedDaysOf(rec);
  const stagingLines = stagingLineDaysOf(rec);
  const byDay = {};
  for (const sn of series) byDay[sn.d | 0] = sn;
  const shouldGate = {};
  for (const sn of series) shouldGate[sn.d | 0] = shouldStageGate(sn, stagedDays.has(sn.d | 0));
  function stagingFollows(d) {
    if (stagedDays.has(d) || stagedDays.has(d + 1)) return true;
    if (stagingLines.has(d)) return true;
    const nx = byDay[d + 1];
    if (nx && nx.nationalLive) return true;
    return false;
  }
  const dayCls = [];
  let prevShould = false;
  for (const sn of series) {
    const d = sn.d | 0;
    const c = classifySeasoningDayCorrected(sn, stagedDays.has(d), {
      stagingFollows: stagingFollows,
      prevShouldStage: prevShould,
    });
    dayCls.push({ day: d, cls: c.cls, gate: c.gate, blockers: c.blockers });
    prevShould = shouldGate[d] !== null;
  }
  const precursorDays = dayCls.filter(function (dc) { return dc.cls === 'staged-precursor'; }).map(function (dc) { return dc.day; });
  const unknownDays = dayCls.filter(function (dc) { return dc.cls === 'unknown'; }).map(function (dc) { return dc.day; });
  const qualifiedFirstDays = dayCls.filter(function (dc) { return dc.cls === 'qualified-first'; }).map(function (dc) { return dc.day; });
  const answerDay = frozen.stagedDay;
  const qualificationDay = precursorDays.length ? precursorDays[0] : (answerDay !== null ? answerDay : null);
  const qualificationSource = precursorDays.length ? 'precursor' : (answerDay !== null ? 'answer-fallback' : null);
  const reStagePrecursors = precursorDays.filter(function (d) { return answerDay !== null && d > answerDay; });
  let firstOpp = null;
  for (const dc of dayCls) {
    if (dc.cls === 'seasoning-blocked' || dc.cls === 'staged-precursor' || dc.cls === 'staged') { firstOpp = dc.day; break; }
  }
  const endDay = frozen.endDay;
  const daysLost = firstOpp === null ? null
    : (answerDay !== null ? qualificationDay - firstOpp : endDay - firstOpp + 1);
  // Decisive blocker (item 3): the se flip on the QUALIFICATION day
  // vs the day before it. Null by design when seasoning was already
  // met before staging (rung-gated seeds) or when the qualification
  // day fell back to the answer day.
  let decisive = null;
  if (qualificationDay !== null && qualificationSource === 'precursor') {
    const today = byDay[qualificationDay];
    const prev = byDay[qualificationDay - 1] || null;
    const prevSe = {};
    if (prev) for (const l of (prev.linksRoll || [])) if (l && l.id) prevSe[l.id] = !!l.se;
    if (today) {
      for (const l of (today.linksRoll || [])) {
        if (!l || l.k !== 'covenant' || l.st !== 'active' || !l.se) continue;
        if (prev && prevSe[l.id] === false) {
          decisive = { other: l.o || null, id: l.id || null, formedDay: l.f | 0, age: l.age | 0, trust: l.t | 0, seasonedDay: qualificationDay };
        }
      }
    }
  }
  // Corrected verdict: staged wins; otherwise unknown only on
  // corrected unknown days; otherwise the frozen verdict — except a
  // frozen 'unknown' verdict that rested only on days now classified
  // as precursors / qualified-firsts is recomputed from the frozen
  // fields (seasoning-blocked when the final day is seasoning-blocked
  // or blocked days exist, else other-blocked).
  let verdict, verdictGate = null;
  if (answerDay !== null) { verdict = 'staged'; }
  else if (unknownDays.length > 0) { verdict = 'unknown'; verdictGate = 'unclassified-days:' + unknownDays.slice(0, 5).join(','); }
  else if (frozen.verdict === 'unknown') {
    if (frozen.seasoningBlockedDays > 0) { verdict = 'seasoning-blocked'; verdictGate = 'seasoned-short'; }
    else { verdict = 'other-blocked'; verdictGate = frozen.verdictGate; }
  } else { verdict = frozen.verdict; verdictGate = frozen.verdictGate; }

  const out = Object.assign({}, frozen, {
    stagedDay: answerDay, answerDay: answerDay,
    qualificationDay: qualificationDay, qualificationSource: qualificationSource,
    precursorDays: precursorDays, reStagePrecursors: reStagePrecursors,
    qualifiedFirstDays: qualifiedFirstDays,
    firstOpportunityDay: firstOpp, firstOpportunityDayFrozen: frozen.firstOpportunityDay,
    daysLost: daysLost, daysLostFrozen: frozen.daysLost,
    decisive: decisive, decisiveFrozen: frozen.decisive,
    unclassifiedDays: unknownDays.length, unclassifiedList: unknownDays,
    unclassifiedDaysFrozen: frozen.unclassifiedDays, unclassifiedListFrozen: frozen.unclassifiedList,
    unknown: (verdict === 'unknown' || unknownDays.length > 0) ? 1 : 0,
    unknownFrozen: frozen.unknown,
    verdict: verdict, verdictGate: verdictGate,
    verdictFrozen: frozen.verdict, verdictGateFrozen: frozen.verdictGate,
    standing: rec.standing | 0, standingRaw: rec.standingRaw | 0,
  });
  return out;
}

// Corrected band analysis: same aggregation shape as analyze(), over
// corrected per-seed records, plus the raw-standing wall read.
function analyzeCorrected(records) {
  const perSeed = {};
  const byPolicy = {};
  let unknown = 0, precursorDaysTotal = 0, unknownDaysTotal = 0;
  for (const rec of records) {
    const r = analyzeSeasoningCorrected(rec);
    perSeed[rec.seed + '-' + rec.policy] = r;
    if (r.unknown) unknown++;
    precursorDaysTotal += r.precursorDays.length;
    unknownDaysTotal += r.unclassifiedDays;
    if (!byPolicy[rec.policy]) {
      byPolicy[rec.policy] = { n: 0, staged: 0, seasoningBlocked: 0, otherBlocked: 0, unknown: 0, seasoningBound: 0, blockedDays: 0, daysLostStaged: [], daysLostStagedFrozen: [], daysLostCensored: [], ageOnlyDays: 0, trustOnlyDays: 0, bothDays: 0, multiDays: 0 };
    }
    const b = byPolicy[rec.policy];
    b.n++;
    if (r.verdict === 'staged') { b.staged++; if (r.daysLost !== null) b.daysLostStaged.push(r.daysLost); if (r.daysLostFrozen !== null) b.daysLostStagedFrozen.push(r.daysLostFrozen); }
    else if (r.verdict === 'seasoning-blocked') b.seasoningBlocked++;
    else if (r.verdict === 'other-blocked') b.otherBlocked++;
    else b.unknown++;
    if (r.seasoningBound) b.seasoningBound++;
    b.blockedDays += r.seasoningBlockedDays;
    if (r.verdict !== 'staged' && r.daysLost !== null) b.daysLostCensored.push(r.daysLost);
    b.ageOnlyDays += r.ageOnlyDays; b.trustOnlyDays += r.trustOnlyDays;
    b.bothDays += r.bothDays; b.multiDays += r.multiDays;
  }
  for (const pol of Object.keys(byPolicy)) {
    const b = byPolicy[pol];
    const nonStaged = b.n - b.staged;
    b.nonStaged = nonStaged;
    b.seasoningShareOfNonStages = nonStaged ? b.seasoningBlocked / nonStaged : null;
    const boundNonStaged = records.filter(function (r) {
      if (r.policy !== pol) return false;
      const ps = perSeed[r.seed + '-' + r.policy];
      return ps && ps.verdict !== 'staged' && ps.seasoningBound;
    }).length;
    b.seasoningBoundShareOfNonStages = nonStaged ? boundNonStaged / nonStaged : null;
    b.medianDaysLostStaged = med(b.daysLostStaged);
    b.medianDaysLostStagedFrozen = med(b.daysLostStagedFrozen);
    b.medianDaysLostCensored = med(b.daysLostCensored);
  }
  const band = { n: records.length, staged: 0, seasoningBlocked: 0, otherBlocked: 0, unknown: unknown };
  for (const pol of Object.keys(byPolicy)) {
    band.staged += byPolicy[pol].staged;
    band.seasoningBlocked += byPolicy[pol].seasoningBlocked;
    band.otherBlocked += byPolicy[pol].otherBlocked;
  }
  band.nonStaged = band.n - band.staged;
  band.seasoningShareOfNonStages = band.nonStaged ? band.seasoningBlocked / band.nonStaged : null;
  const bandBoundNonStaged = records.filter(function (r) {
    const ps = perSeed[r.seed + '-' + r.policy];
    return ps && ps.verdict !== 'staged' && ps.seasoningBound;
  }).length;
  band.seasoningBoundShareOfNonStages = band.nonStaged ? bandBoundNonStaged / band.nonStaged : null;
  band.precursorDaysTotal = precursorDaysTotal;
  band.unknownDaysTotal = unknownDaysTotal;
  // Wall: frozen wall (gated standing + scaleRank) plus the raw
  // standing read (item 5) per leg.
  const frozenOut = analyze(records);
  const wall = frozenOut.wall;
  for (const pol of Object.keys(wall)) {
    const recs = records.filter(function (r) { return r.policy === pol; });
    wall[pol].nationalStandingRaw200 = recs.filter(function (r) { return (r.standingRaw | 0) >= 200; }).length;
  }
  return { perSeed: perSeed, byPolicy: byPolicy, band: band, wall: wall, d3: frozenOut.d3, shapes: frozenOut.shapes, unknown: unknown };
}

if (require.main === module) (async function () {
  const CORRECTED = process.argv.indexOf('--corrected') !== -1;
  const args = process.argv.slice(2).filter(function (a) { return a !== '--corrected'; });
  const controlDir = args[0] || path.join(REPO, 'evidence', '2026-11-16', 'perseed-seasoning-b-control');
  const onDir = args[1] || path.join(REPO, 'evidence', '2026-11-16', 'perseed-seasoning-b-on');
  const outPath = args[2] || path.join(REPO, 'evidence', '2026-11-16', CORRECTED ? 'seasoning-g1-b-analysis.json' : 'seasoning-b-analysis.json');
  const records = [];
  for (const dir of [controlDir, onDir]) {
    const files = fs.readdirSync(dir).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
    for (const f of files) records.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  if (CORRECTED) {
    const out = analyzeCorrected(records);
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
    for (const pol of Object.keys(out.byPolicy)) {
      const b = out.byPolicy[pol];
      console.log(pol + ': n=' + b.n + ' staged=' + b.staged + ' seasoning-blocked=' + b.seasoningBlocked +
        ' other-blocked=' + b.otherBlocked + ' unknown=' + b.unknown +
        ' nonStaged=' + b.nonStaged +
        ' seasoningShare=' + (b.seasoningShareOfNonStages === null ? 'n/a' : (b.seasoningShareOfNonStages * 100).toFixed(0) + '%') +
        ' blockedDays=' + b.blockedDays +
        ' medianDaysLost(staged, corrected)=' + b.medianDaysLostStaged +
        ' medianDaysLost(staged, frozen)=' + b.medianDaysLostStagedFrozen +
        ' medianDaysLost(censored)=' + b.medianDaysLostCensored);
    }
    console.log('band (corrected): staged=' + out.band.staged + ' seasoning-blocked=' + out.band.seasoningBlocked +
      ' other-blocked=' + out.band.otherBlocked + ' unknown=' + out.band.unknown +
      ' seasoningShare=' + (out.band.seasoningShareOfNonStages === null ? 'n/a' : (out.band.seasoningShareOfNonStages * 100).toFixed(0) + '%') +
      ' precursorDays=' + out.band.precursorDaysTotal + ' unknownDays=' + out.band.unknownDaysTotal);
    console.log('D3 engine-agreement (frozen, unchanged): blockedDays=' + out.d3.blockedDays + ' candidate-null=' + out.d3.blockedCandidateNull +
      ' stagedDays=' + out.d3.stagedDays + ' candidate-seen=' + out.d3.stagedCandidateSeen + ' misses=' + JSON.stringify(out.d3.misses));
    console.log('wall (raw read added): ' + JSON.stringify(out.wall));
    for (const k of Object.keys(out.perSeed).sort()) {
      const r = out.perSeed[k];
      console.log(k + ' :: ' + r.verdict + ' (frozen ' + r.verdictFrozen + ')' +
        ' qualDay=' + (r.qualificationDay === null ? '—' : 'd' + r.qualificationDay + ' [' + r.qualificationSource + ']') +
        ' answerDay=' + (r.answerDay === null ? '—' : 'd' + r.answerDay) +
        ' firstOpp=' + (r.firstOpportunityDay === null ? '—' : 'd' + r.firstOpportunityDay) + ' (frozen ' + (r.firstOpportunityDayFrozen === null ? '—' : 'd' + r.firstOpportunityDayFrozen) + ')' +
        ' blockedDays=' + r.seasoningBlockedDays +
        ' daysLost=' + (r.daysLost === null ? '—' : r.daysLost + (r.censored ? ' (censored)' : '')) + ' (frozen ' + (r.daysLostFrozen === null ? '—' : r.daysLostFrozen) + ')' +
        ' decisive=' + JSON.stringify(r.decisive) + ' (frozen ' + JSON.stringify(r.decisiveFrozen) + ')' +
        ' precursors=' + JSON.stringify(r.precursorDays) + ' reStage=' + JSON.stringify(r.reStagePrecursors));
    }
    console.log('UNKNOWN total (corrected): ' + out.unknown);
    console.log('wrote ' + path.relative(REPO, outPath));
    return;
  }
  const out = analyze(records);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  for (const pol of Object.keys(out.byPolicy)) {
    const b = out.byPolicy[pol];
    console.log(pol + ': n=' + b.n + ' staged=' + b.staged + ' seasoning-blocked=' + b.seasoningBlocked +
      ' other-blocked=' + b.otherBlocked + ' unknown=' + b.unknown +
      ' nonStaged=' + b.nonStaged +
      ' seasoningShare=' + (b.seasoningShareOfNonStages === null ? 'n/a' : (b.seasoningShareOfNonStages * 100).toFixed(0) + '%') +
      ' boundShare=' + (b.seasoningBoundShareOfNonStages === null ? 'n/a' : (b.seasoningBoundShareOfNonStages * 100).toFixed(0) + '%') +
      ' blockedDays=' + b.blockedDays +
      ' medianDaysLost(staged)=' + b.medianDaysLostStaged +
      ' medianDaysLost(censored)=' + b.medianDaysLostCensored +
      ' ageOnly=' + b.ageOnlyDays + ' trustOnly=' + b.trustOnlyDays + ' both=' + b.bothDays + ' multi=' + b.multiDays);
  }
  console.log('band: staged=' + out.band.staged + ' seasoning-blocked=' + out.band.seasoningBlocked +
    ' other-blocked=' + out.band.otherBlocked + ' unknown=' + out.band.unknown +
    ' seasoningShare=' + (out.band.seasoningShareOfNonStages === null ? 'n/a' : (out.band.seasoningShareOfNonStages * 100).toFixed(0) + '%'));
  console.log('D3 engine-agreement: blockedDays=' + out.d3.blockedDays + ' candidate-null=' + out.d3.blockedCandidateNull +
    ' stagedDays=' + out.d3.stagedDays + ' candidate-seen=' + out.d3.stagedCandidateSeen + ' misses=' + JSON.stringify(out.d3.misses));
  console.log('wall: ' + JSON.stringify(out.wall));
  for (const k of Object.keys(out.perSeed).sort()) {
    const r = out.perSeed[k];
    console.log(k + ' :: ' + r.verdict + ' (' + (r.verdictGate || '') + ')' +
      ' stagedDay=' + (r.stagedDay === null ? '—' : 'd' + r.stagedDay) +
      ' firstOpp=' + (r.firstOpportunityDay === null ? '—' : 'd' + r.firstOpportunityDay) +
      ' blockedDays=' + r.seasoningBlockedDays + ' daysLost=' + (r.daysLost === null ? '—' : r.daysLost + (r.censored ? ' (censored)' : '')) +
      ' decisive=' + JSON.stringify(r.decisive));
  }
  console.log('UNKNOWN total: ' + out.unknown);
  console.log('wrote ' + path.relative(REPO, outPath));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { classifySeasoningDay: classifySeasoningDay, blockerLinks: blockerLinks, analyzeSeasoning: analyzeSeasoning, engineAgreement: engineAgreement, analyze: analyze, classifySeasoningDayCorrected: classifySeasoningDayCorrected, analyzeSeasoningCorrected: analyzeSeasoningCorrected, analyzeCorrected: analyzeCorrected, stagingLineDaysOf: stagingLineDaysOf, stagedDaysOf: stagedDaysOf, shouldStageGate: shouldStageGate };
