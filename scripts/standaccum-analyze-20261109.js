// standaccum-analyze-20261109.js — standing-accumulation diag analyzer
// (arm sim-standaccum-b). Pure summary functions (unit-tested in
// test-standaccum-20261109.js) + a CLI that reads per-seed JSONs and
// prints one summary row per seed plus a cross-seed verdict table.
// Definitions (stated in the prereg, applied here, never re-scored):
// - "end" = last snapshot with living >= 1 (gearbar end-correction).
// - "gear-ready day" = armored >= 4 AND armed >= 6 on that day (the
//   gearbar gear bars), regardless of tricks/veterans. "ready day" =
//   readiness5.ready (all four bars).
// - Trajectory classes per the 2026-11-09 prereg, precedence order:
//   released > bars-met-standing-short > standing-clears-veterans-hold
//   > never-unlocked > standing-short.
// - Binding constraint per the prereg's mechanical rule: reference
//   days are ALL ready days if >= 1 exists, else the first day at
//   peak gated standing; per-day binding is the argmax shortfall
//   against the spec pure-path targets (war 200, diplomacy 204,
//   plenty 100); class-3 seeds bind 'veterans-hold', released seeds
//   bind 'none'.
// - Prior-30-day movers: component deltas between the anchor day
//   (first gear-ready day, else peak day) and the nearest snapshot at
//   or before anchor-30, plus transition events in that window
//   (link starts/stops counting, link appears/vanishes, feast added,
//   ledger points gained, by wave).
'use strict';
const fs = require('fs');
const path = require('path');

function lastLivingSnap(daily) {
  for (let i = daily.length - 1; i >= 0; i--) {
    if ((daily[i].living || 0) >= 1) return daily[i];
  }
  return daily[daily.length - 1] || null;
}
function peakSnap(daily, field) {
  let best = null;
  daily.forEach(function (s) {
    const v = (field === 'gated') ? (s.gated | 0) : (s.standing ? (s.standing.total | 0) : 0);
    if (!best || v > best.v) best = { snap: s, v: v };
  });
  return best ? best.snap : null;
}
function gearReady(s) {
  const r = s.readiness5 || {};
  return (r.armored | 0) >= 4 && (r.armed | 0) >= 6;
}
function countLinksByReason(snap) {
  const out = { counts: 0, 'too-young': 0, 'low-trust': 0, 'not-regional': 0, inactive: 0, total: 0 };
  (snap.links || []).forEach(function (l) {
    out.total++;
    if (out[l.reason] == null) out[l.reason] = 0;
    out[l.reason]++;
  });
  return out;
}
// Transition events between two consecutive snapshots (day-ordered).
function deriveEvents(prev, cur) {
  const evs = [];
  if (!prev || !cur) return evs;
  const pm = {}, cm = {};
  (prev.links || []).forEach(function (l) { pm[l.key] = l; });
  (cur.links || []).forEach(function (l) { cm[l.key] = l; });
  Object.keys(cm).forEach(function (k) {
    if (!pm[k]) evs.push({ day: cur.day, kind: 'link-appears', other: cm[k].other, detail: cm[k].reason });
    else if (pm[k].reason !== cm[k].reason) evs.push({ day: cur.day, kind: 'link-reason-change', other: cm[k].other, from: pm[k].reason, to: cm[k].reason });
  });
  Object.keys(pm).forEach(function (k) {
    if (!cm[k]) evs.push({ day: cur.day, kind: 'link-vanishes', other: pm[k].other, detail: pm[k].reason });
  });
  const pf = prev.feasts || {}, cf = cur.feasts || {};
  if ((cf.total | 0) > (pf.total | 0)) {
    const added = (cf.entries || []).slice((pf.entries || []).length);
    added.forEach(function (e) { evs.push({ day: cur.day, kind: 'feast-added', quality: e.quality }); });
  }
  [3, 4, 5].forEach(function (w) {
    const a = (prev.ledger || {})[w] | 0, b = (cur.ledger || {})[w] | 0;
    if (b > a) evs.push({ day: cur.day, kind: 'ledger-gain', wave: w, from: a, to: b });
  });
  return evs;
}
function windowEvents(daily, fromDay, toDay) {
  const evs = [];
  for (let i = 1; i < daily.length; i++) {
    if (daily[i].day < fromDay || daily[i].day > toDay) continue;
    deriveEvents(daily[i - 1], daily[i]).forEach(function (e) { evs.push(e); });
  }
  return evs;
}
function snapAtOrBefore(daily, day) {
  let best = null;
  daily.forEach(function (s) { if (s.day <= day && (!best || s.day > best.day)) best = s; });
  return best;
}
// New trajectory classes (prereg 2026-11-09, precedence order — first
// match wins; never-unlocked is checked before standing-short per the
// prereg's precedence correction, as the more specific condition):
// 1. released — a ready day with gated >= 200 and wave-4 faced.
// 2. bars-met-standing-short — >= 1 ready day, gated < 200 on every one.
// 3. standing-clears-veterans-hold — peak raw >= 200, gated held at 199,
//    veterans the ONLY short bar at peak.
// 4. never-unlocked — peak gated < 100.
// 5. standing-short — peak gated < 200, no ready day.
function readyDay(s) { const r = s.readiness5 || {}; return !!r.ready; }
function classifySeed(sum) {
  if (sum.released) return 'released';
  if (sum.readyDays.length > 0) return 'bars-met-standing-short';
  if ((sum.peakRaw | 0) >= 200 && sum.peakGated === 199 &&
      (sum.peakShortBars || []).length === 1 && sum.peakShortBars[0] === 'veterans') return 'standing-clears-veterans-hold';
  if ((sum.peakGated | 0) < 100) return 'never-unlocked';
  return 'standing-short';
}
// Binding shortfall of each standing source on one snapshot, against
// the spec's pure-path targets: war 200 (8 ledger pts x 25), diplomacy
// 204 (6 links x 34), plenty 100 (5 feasts x 20, the T5 plenty cap).
// Returns the argmax sources (all tied sources on a tie).
function dayBinding(s) {
  const st = s.standing || {};
  const shorts = [
    { source: 'war', short: Math.max(0, 200 - (st.war | 0)) },
    { source: 'diplomacy', short: Math.max(0, 204 - (st.diplomacy | 0)) },
    { source: 'plenty', short: Math.max(0, 100 - (st.plenty | 0)) },
  ];
  const max = Math.max.apply(null, shorts.map(function (x) { return x.short; }));
  return shorts.filter(function (x) { return x.short === max; }).map(function (x) { return x.source; });
}
// Per-seed binding constraint + day-counts, per the prereg rule.
// Reference days: ALL ready days if >= 1 exists, else the first day at
// peak gated standing. Class-3 seeds bind 'veterans-hold'; released
// seeds bind 'none'; otherwise the argmax source over reference days.
function bindingSeed(daily, sum) {
  if (sum.released) return { binding: 'none', refDays: sum.readyDays, refKind: 'ready-days', dayCounts: { war: 0, diplomacy: 0, plenty: 0 }, tiedDays: 0 };
  if (sum.trajectory === 'standing-clears-veterans-hold') return { binding: 'veterans-hold', refDays: [], refKind: 'peak-day (standing sufficient)', dayCounts: { war: 0, diplomacy: 0, plenty: 0 }, tiedDays: 0 };
  let refDays, refKind;
  if (sum.readyDays.length > 0) {
    refDays = sum.readyDays.slice();
    refKind = 'ready-days';
  } else {
    const peak = daily.find(function (s) { return s.day === sum.peakGatedDay; }) || null;
    refDays = peak ? [peak.day] : [];
    refKind = 'peak-gated-day';
  }
  const dayCounts = { war: 0, diplomacy: 0, plenty: 0 };
  let tiedDays = 0;
  refDays.forEach(function (d) {
    const snap = daily.find(function (s) { return s.day === d; });
    if (!snap) return;
    const b = dayBinding(snap);
    if (b.length > 1) tiedDays++;
    b.forEach(function (src) { dayCounts[src]++; });
  });
  let binding = null, best = -1;
  ['war', 'diplomacy', 'plenty'].forEach(function (src) {
    if (dayCounts[src] > best) { best = dayCounts[src]; binding = src; }
  });
  // A tie for the seed-level binding is reported as shared (all tied).
  const tied = ['war', 'diplomacy', 'plenty'].filter(function (src) { return dayCounts[src] === best; });
  return { binding: tied.length > 1 ? tied.join('+') : binding, refDays: refDays, refKind: refKind, dayCounts: dayCounts, tiedDays: tiedDays };
}
function summarizeSeed(out) {
  const daily = out.daily || [];
  const peakG = peakSnap(daily, 'gated');
  const peakR = peakSnap(daily, 'raw');
  const end = lastLivingSnap(daily);
  const readyDays = daily.filter(function (s) { return s.readiness5 && s.readiness5.ready; }).map(function (s) { return s.day; });
  const gearDays = daily.filter(gearReady).map(function (s) { return s.day; });
  let maxBars = { armored: 0, armed: 0, tricks: 0, veterans: 0 };
  daily.forEach(function (s) {
    const r = s.readiness5 || {};
    maxBars.armored = Math.max(maxBars.armored, r.armored | 0);
    maxBars.armed = Math.max(maxBars.armed, r.armed | 0);
    maxBars.tricks = Math.max(maxBars.tricks, r.tricks | 0);
    maxBars.veterans = Math.max(maxBars.veterans, r.veterans | 0);
  });
  const peak = peakG || peakR;
  // Release check (prereg class 1): a ready day with gated >= 200 and
  // wave-4 faced. A ready day implies wave-4 faced (a veteran holds a
  // wave-4+ kill), but the faced flag is checked explicitly, never assumed.
  const released = daily.some(function (s) {
    return readyDay(s) && (s.gated | 0) >= 200 && !!s.w4faced;
  });
  const peakShortBars = peak && peak.readiness5 ? ((peak.readiness5.short || []).slice()) : [];
  // Standing split on every ready day (the decomposition this arm judges).
  const readyDaySplits = daily.filter(readyDay).map(function (s) {
    return {
      day: s.day, gated: s.gated | 0,
      war: s.standing ? (s.standing.war | 0) : null,
      diplomacy: s.standing ? (s.standing.diplomacy | 0) : null,
      plenty: s.standing ? (s.standing.plenty | 0) : null,
      raw: s.standing ? (s.standing.total | 0) : null,
      w4faced: !!s.w4faced, standingLine: s.standingLine || null,
    };
  });
  const peakLinks = peak ? countLinksByReason(peak) : null;
  const peakNearMissTotal = peakLinks ? (peakLinks['too-young'] + peakLinks['low-trust'] + peakLinks['not-regional']) : 0;
  // Anchor day: first gear-ready day, else peak day. Prior-30d window.
  const anchor = gearDays.length ? daily.find(function (s) { return s.day === gearDays[0]; }) : peak;
  const anchorDay = anchor ? anchor.day : 0;
  const base = anchor ? snapAtOrBefore(daily, anchorDay - 30) : null;
  const deltas = (anchor && base && anchor.standing && base.standing) ? {
    raw: (anchor.standing.total | 0) - (base.standing.total | 0),
    war: (anchor.standing.war | 0) - (base.standing.war | 0),
    diplomacy: (anchor.standing.diplomacy | 0) - (base.standing.diplomacy | 0),
    plenty: (anchor.standing.plenty | 0) - (base.standing.plenty | 0),
    baseDay: base.day, anchorDay: anchorDay,
  } : null;
  const evs = (anchor && base) ? windowEvents(daily, base.day + 1, anchorDay) : [];
  const ledgerGrewPrior30 = evs.some(function (e) { return e.kind === 'ledger-gain'; });
  // Peak-day prior-30d window: the window that answers "what moved it"
  // at the standing peak (first-gear-ready anchors are often day 2,
  // before any 30-day window exists, so their prior30 is null by
  // construction — the peak window is the substantive one).
  const peakBase = peak ? snapAtOrBefore(daily, peak.day - 30) : null;
  const peakDeltas = (peak && peakBase && peak.standing && peakBase.standing) ? {
    raw: (peak.standing.total | 0) - (peakBase.standing.total | 0),
    war: (peak.standing.war | 0) - (peakBase.standing.war | 0),
    diplomacy: (peak.standing.diplomacy | 0) - (peakBase.standing.diplomacy | 0),
    plenty: (peak.standing.plenty | 0) - (peakBase.standing.plenty | 0),
    baseDay: peakBase.day, anchorDay: peak.day,
  } : null;
  const peakEvs = (peak && peakBase) ? windowEvents(daily, peakBase.day + 1, peak.day) : [];
  const peakEvCounts = peakEvs.reduce(function (acc, e) { acc[e.kind] = (acc[e.kind] || 0) + 1; return acc; }, {});
  // Standing across gear-ready days (first / last / max).
  const gearSnaps = daily.filter(gearReady);
  const gearDayStanding = gearSnaps.length ? {
    firstDay: gearSnaps[0].day,
    firstRaw: gearSnaps[0].standing ? (gearSnaps[0].standing.total | 0) : null,
    lastDay: gearSnaps[gearSnaps.length - 1].day,
    lastRaw: gearSnaps[gearSnaps.length - 1].standing ? (gearSnaps[gearSnaps.length - 1].standing.total | 0) : null,
    maxRaw: Math.max.apply(null, gearSnaps.map(function (s) { return s.standing ? (s.standing.total | 0) : 0; })),
    maxDay: gearSnaps.reduce(function (best, s) { const v = s.standing ? (s.standing.total | 0) : 0; return (best === null || v > best.v) ? { day: s.day, v: v } : best; }, null).day,
  } : null;
  // Top missing source at peak day (gate-effective components).
  let topMissing = null;
  if (peak && peak.standing) {
    const cands = [
      { source: 'war', value: peak.standing.war | 0 },
      { source: 'diplomacy', value: peak.standing.diplomacy | 0 },
      { source: 'plenty', value: Math.min(peak.standing.plenty | 0, 100) },
    ];
    cands.sort(function (a, b) { return a.value - b.value; });
    topMissing = cands[0].source;
  }
  const sum = {
    seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
    villageLost: out.villageLost, scaleRank: out.scaleRank,
    maxWave: out.maxWave, unlockedWave: out.unlockedWave,
    snapshots: daily.length, instrumentErrors: (out.instrumentErrors || []).length,
    peakGated: peakG ? (peakG.gated | 0) : null, peakGatedDay: peakG ? peakG.day : null,
    peakRaw: peakR ? (peakR.standing ? (peakR.standing.total | 0) : null) : null, peakRawDay: peakR ? peakR.day : null,
    endGated: end ? (end.gated | 0) : null, endRaw: end && end.standing ? (end.standing.total | 0) : null,
    endDay: end ? end.day : null, endLiving: end ? end.living : null,
    peakStanding: peak && peak.standing ? { war: peak.standing.war, diplomacy: peak.standing.diplomacy, plenty: peak.standing.plenty, warPts: peak.standing.warPts, links: peak.standing.links, feasts: peak.standing.feasts } : null,
    peakLedger: peak ? peak.ledger : null,
    peakLinks: peakLinks, peakNearMissTotal: peakNearMissTotal,
    peakFeasts: peak && peak.feasts ? { total: peak.feasts.total, qualifying: peak.feasts.qualifying, subquality: peak.feasts.subquality } : null,
    readyDays: readyDays, gearReadyDays: gearDays, maxBars: maxBars,
    released: released, peakShortBars: peakShortBars,
    readyDaySplits: readyDaySplits,
    anchorDay: anchorDay, prior30deltas: deltas, prior30events: evs,
    peakPrior30deltas: peakDeltas, peakPrior30eventCounts: peakEvCounts,
    gearDayStanding: gearDayStanding,
    ledgerGrewPrior30: ledgerGrewPrior30, topMissing: topMissing,
    w4faced: peak ? peak.w4faced : null,
  };
  sum.trajectory = classifySeed(sum);
  sum.binding = bindingSeed(daily, sum);
  return sum;
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node standaccum-analyze-20261109.js <per-seed-dir>'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const sums = files.map(function (f) { return summarizeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  sums.forEach(function (s) {
    console.log(JSON.stringify({
      seed: s.seed, days: s.days, end: s.endReason, won: s.won, scale: s.scaleRank,
      maxWave: s.maxWave, unlocked: s.unlockedWave,
      peakGated: s.peakGated, peakGatedDay: s.peakGatedDay, peakRaw: s.peakRaw,
      endGated: s.endGated, endRaw: s.endRaw, endLiving: s.endLiving,
      peakSplit: s.peakStanding, peakLedger: s.peakLedger, peakLinks: s.peakLinks,
      peakFeasts: s.peakFeasts, traj: s.trajectory, topMissing: s.topMissing,
      readyDays: s.readyDays, gearDays: s.gearReadyDays, maxBars: s.maxBars,
      released: s.released, peakShortBars: s.peakShortBars,
      readyDaySplits: s.readyDaySplits, binding: s.binding,
      anchorDay: s.anchorDay, prior30: s.prior30deltas,
      peakPrior30: s.peakPrior30deltas, peakPrior30events: s.peakPrior30eventCounts,
      gearDayStanding: s.gearDayStanding,
      errors: s.instrumentErrors,
    }));
  });
  const withTop = sums.filter(function (s) { return !!s.topMissing; }).length;
  const withGear = sums.filter(function (s) { return s.gearReadyDays.length > 0; }).length;
  console.log(JSON.stringify({
    summary: true, seeds: sums.length,
    classified: sums.length, withTopMissing: withTop, withGearReadyDays: withGear,
    trajCounts: sums.reduce(function (acc, s) { acc[s.trajectory] = (acc[s.trajectory] || 0) + 1; return acc; }, {}),
    bindingCounts: sums.reduce(function (acc, s) { const b = s.binding ? s.binding.binding : null; if (b) acc[b] = (acc[b] || 0) + 1; return acc; }, {}),
    released: sums.filter(function (s) { return s.released; }).length,
    barsMetStandingShort: sums.filter(function (s) { return s.trajectory === 'bars-met-standing-short'; }).length,
    readyDaySeeds: sums.filter(function (s) { return s.readyDays.length > 0; }).length,
    topMissingCounts: sums.reduce(function (acc, s) { if (s.topMissing) acc[s.topMissing] = (acc[s.topMissing] || 0) + 1; return acc; }, {}),
    wins: sums.filter(function (s) { return s.won; }).length,
    national: sums.filter(function (s) { return s.scaleRank === 'national'; }).length,
    medianDays: (function () { const ds = sums.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; }); return ds.length ? ds[Math.floor(ds.length / 2)] : null; })(),
    w4unlock: sums.filter(function (s) { return s.unlockedWave >= 4; }).length,
    w5unlock: sums.filter(function (s) { return s.unlockedWave >= 5; }).length,
  }));
}

module.exports = { summarizeSeed: summarizeSeed, classifySeed: classifySeed, countLinksByReason: countLinksByReason, deriveEvents: deriveEvents, windowEvents: windowEvents, lastLivingSnap: lastLivingSnap, gearReady: gearReady, readyDay: readyDay, dayBinding: dayBinding, bindingSeed: bindingSeed };
