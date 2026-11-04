// standaccum-analyze-20261104.js — standing-accumulation diag analyzer
// (arm sim-standaccum-b). Pure summary functions (unit-tested in
// test-standaccum-20261104.js) + a CLI that reads per-seed JSONs and
// prints one summary row per seed plus a cross-seed verdict table.
// Definitions (stated in the prereg, applied here, never re-scored):
// - "end" = last snapshot with living >= 1 (gearbar end-correction).
// - "gear-ready day" = armored >= 4 AND armed >= 6 on that day (the
//   gearbar gear bars), regardless of tricks/veterans. "ready day" =
//   readiness5.ready (all four bars).
// - Trajectory classes per prereg, judged at the peak-GATED day.
// - Top missing source = the smallest gate-effective component at the
//   peak day (war, diplomacy, min(plenty,100)); ties break in the
//   order war, diplomacy, plenty. Its near-miss pool is counted:
//   diplomacy near-miss = active non-counting links by reason;
//   plenty near-miss = sub-quality feasts in the log; war near-miss =
//   ledger points by wave + distinct types scored (war gains need new
//   ledger kills; no countable "almost" pool exists in state).
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
function classifySeed(sum) {
  if (sum.unlockedWave >= 5 || (sum.peakGatedSnap && sum.peakGatedSnap.peakWave >= 5)) return 'released';
  const p = sum.peakStanding || {};
  const plentyGate = Math.min(p.plenty | 0, 100);
  if (plentyGate >= 100 && ((p.war | 0) + (p.diplomacy | 0)) < 100) return 'bread-capped';
  if ((p.diplomacy | 0) === 0 && (sum.peakNearMissTotal | 0) > 0) return 'diplomacy-starved';
  if ((p.war | 0) < 50 && !sum.ledgerGrewPrior30) return 'war-starved';
  return 'mixed-shortfall';
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
    anchorDay: anchorDay, prior30deltas: deltas, prior30events: evs,
    ledgerGrewPrior30: ledgerGrewPrior30, topMissing: topMissing,
    w4faced: peak ? peak.w4faced : null,
  };
  sum.trajectory = classifySeed(sum);
  return sum;
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node standaccum-analyze-20261104.js <per-seed-dir>'); process.exit(2); }
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
      anchorDay: s.anchorDay, prior30: s.prior30deltas,
      errors: s.instrumentErrors,
    }));
  });
  const withTop = sums.filter(function (s) { return !!s.topMissing; }).length;
  const withGear = sums.filter(function (s) { return s.gearReadyDays.length > 0; }).length;
  console.log(JSON.stringify({
    summary: true, seeds: sums.length,
    classified: sums.length, withTopMissing: withTop, withGearReadyDays: withGear,
    trajCounts: sums.reduce(function (acc, s) { acc[s.trajectory] = (acc[s.trajectory] || 0) + 1; return acc; }, {}),
    topMissingCounts: sums.reduce(function (acc, s) { if (s.topMissing) acc[s.topMissing] = (acc[s.topMissing] || 0) + 1; return acc; }, {}),
    wins: sums.filter(function (s) { return s.won; }).length,
    national: sums.filter(function (s) { return s.scaleRank === 'national'; }).length,
    medianDays: (function () { const ds = sums.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; }); return ds.length ? ds[Math.floor(ds.length / 2)] : null; })(),
    w4unlock: sums.filter(function (s) { return s.unlockedWave >= 4; }).length,
    w5unlock: sums.filter(function (s) { return s.unlockedWave >= 5; }).length,
  }));
}

module.exports = { summarizeSeed: summarizeSeed, classifySeed: classifySeed, countLinksByReason: countLinksByReason, deriveEvents: deriveEvents, windowEvents: windowEvents, lastLivingSnap: lastLivingSnap, gearReady: gearReady };
