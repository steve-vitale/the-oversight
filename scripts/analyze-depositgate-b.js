#!/usr/bin/env node
// analyze-depositgate-b.js — pure census analyzer for sim-depositgate-b.
// (DIAG ONLY.) Reads depositgate-b-driver .jsonl on stdin (one JSON object
// per line, one seed per line) and prints a JSON summary to stdout.
// No game load, no file writes, no RNG. Pure functions are exported for
// scripts/test-depositgate-b-census.js.
//
// Per-day derivation: driver rows carry CUMULATIVE ledger/wrapper totals;
// day values are consecutive-row deltas (first row deltas from zero), so
// scholar-day ledger keying can never misattribute a day.
//   easedFire(day) = dayShareEased + dayHoldbackKcal   (kcal eaten at fire)
//   tributeWaived is reported separately and NEVER enters easedFire.
//   homecoming keep is voice-counted only (not ledgered) — counted from
//   say lines, never kcal-estimated.
'use strict';
const fs = require('fs');

function sumLedgerDays(daysObj) {
  let share = 0, ret = 0, big = 0, trib = 0;
  for (const k of Object.keys(daysObj || {})) {
    const r = daysObj[k] || {};
    share += r.shareEased || 0; ret += r.returnEased || 0; big += r.bigHaulEased || 0; trib += r.tributeWaived || 0;
  }
  return { share: Math.round(share), returnCount: ret, bigCount: big, tributeWaived: Math.round(trib) };
}

// Derive per-day rows from a driver's cumulative rows.
function deriveDays(seedJson) {
  const rows = seedJson.rows || [];
  let prev = { share: 0, returnCount: 0, bigCount: 0, tributeWaived: 0, holdbackKcal: 0, intakeKcal: 0 };
  return rows.map((r, i) => {
    const c = r.cum || {};
    const cur = {
      share: c.share || 0, returnCount: c.returnCount || 0, bigCount: c.bigCount || 0,
      tributeWaived: c.tributeWaived || 0, holdbackKcal: c.holdbackKcal || 0, intakeKcal: c.intakeKcal || 0,
    };
    const day = {
      loopDay: r.loopDay, gameDay: r.gameDay,
      morningPantryKcal: r.morningPantryKcal, pantryKcal: r.pantryKcal,
      freshDays: r.freshDays, daysEstimate: r.daysEstimate,
      gateEngaged: r.gateEngaged, hungryStreak: r.hungryStreak, alive: r.alive,
      shareEased: cur.share - prev.share,
      returnEasedCount: cur.returnCount - prev.returnCount,
      bigEasedCount: cur.bigCount - prev.bigCount,
      tributeWaivedDay: cur.tributeWaived - prev.tributeWaived,
      holdbackKcal: cur.holdbackKcal - prev.holdbackKcal,
      intakeKcal: cur.intakeKcal - prev.intakeKcal,
    };
    day.easedFire = day.shareEased + day.holdbackKcal;
    day.shareDays = day.shareEased > 0 ? 1 : 0;
    prev = cur;
    if (i > 0) day.pantryDelta = (r.pantryKcal == null || rows[i - 1].pantryKcal == null) ? null : r.pantryKcal - rows[i - 1].pantryKcal;
    else day.pantryDelta = null;
    return day;
  });
}

function scattered(seedJson) {
  if (seedJson.endReason === 'village-lost') return true;
  for (const s of (seedJson.sayLines || [])) if (/scattering/i.test(s.line || '')) return true;
  return false;
}

function analyzeSeed(seedJson) {
  const days = deriveDays(seedJson);
  const collapsed = seedJson.endReason !== 'survived';
  const last = days.length ? days[days.length - 1] : null;
  let easedTotal = 0, shareTotal = 0, holdbackTotal = 0, intakeTotal = 0, tributeTotal = 0;
  let engagedDays = 0, fullWhileFalling = 0, keepVoiceLines = 0;
  for (const d of days) {
    easedTotal += d.easedFire; shareTotal += d.shareEased; holdbackTotal += d.holdbackKcal;
    intakeTotal += d.intakeKcal; tributeTotal += d.tributeWaivedDay;
    if (d.gateEngaged) engagedDays++;
    if (d.gateEngaged && d.pantryDelta != null && d.pantryDelta < 0) fullWhileFalling++;
  }
  for (const s of (seedJson.sayLines || [])) if (/bursting past tomorrow/i.test(s.line || '')) keepVoiceLines++;
  const holdbackCalls = (seedJson.holdbacks || []).length;
  const shareDays = days.filter((d) => d.shareEased > 0).length;
  const nEasedEvents = holdbackCalls + shareDays;
  const accountingDiff = Math.abs(intakeTotal - (shareTotal + holdbackTotal));
  const accountingTol = 10 + nEasedEvents;
  const accountingOk = accountingDiff <= accountingTol;
  // Pre-collapse windows (collapse day = last lived row, excluded).
  let preCollapse7 = 0, engagedBeforeCollapse = 0;
  if (collapsed && last) {
    for (const d of days) {
      if (d.loopDay >= last.loopDay - 7 && d.loopDay < last.loopDay) preCollapse7 += d.easedFire;
      if (d.loopDay >= last.loopDay - 14 && d.loopDay < last.loopDay && d.gateEngaged) engagedBeforeCollapse++;
    }
  }
  const censusComplete = days.length > 0 && days.length === seedJson.daysAlive &&
    days.every((d) => typeof d.gateEngaged === 'boolean');
  return {
    seed: seedJson.seed, arm: seedJson.arm, endReason: seedJson.endReason,
    collapsed, scattered: scattered(seedJson), daysAlive: seedJson.daysAlive,
    maxWaveUnlocked: seedJson.maxWaveUnlocked, waveKills: seedJson.waveKills,
    days, easedTotal, shareTotal, holdbackTotal, intakeTotal, tributeTotal,
    engagedDays, fullWhileFalling, keepVoiceLines,
    holdbackCalls, shareDays, nEasedEvents, accountingDiff, accountingTol, accountingOk,
    preCollapse7, engagedBeforeCollapse, censusComplete,
  };
}

// Prereg verdict rule (d): SUPPORTED iff >=1 collapsed seed has
// preCollapse7 > 0 AND >=1 fullWhileFalling day exists on any armed seed.
// NOT-SUPPORTED iff collapses exist but that conjunction fails.
// UNJUDGED iff zero collapses.
function verdictForBand(armedSeeds) {
  const collapsed = armedSeeds.filter((s) => s.collapsed);
  const totalFullWhileFalling = armedSeeds.reduce((t, s) => t + s.fullWhileFalling, 0);
  if (collapsed.length === 0) return { verdict: 'UNJUDGED', collapsed: 0, totalFullWhileFalling, reason: 'no collapse in band; precedence cannot be judged' };
  const anyPre = collapsed.some((s) => s.preCollapse7 > 0);
  if (anyPre && totalFullWhileFalling >= 1) {
    return { verdict: 'SUPPORTED', collapsed: collapsed.length, totalFullWhileFalling, reason: 'fire-eating in a pre-collapse window and gate firing on a falling pantry both observed' };
  }
  return { verdict: 'NOT-SUPPORTED', collapsed: collapsed.length, totalFullWhileFalling,
    reason: anyPre ? 'pre-collapse fire-eating seen but zero full-while-falling days' : 'no collapsed seed eased fire in its pre-collapse 7 days' };
}

// Prereg GO bars (a)–(c): control zero, armed positive, accounting,
// census complete on every pilot seed.
function goCheck(controlSeeds, armedSeeds) {
  const failures = [];
  for (const s of controlSeeds) if (s.easedTotal !== 0) failures.push('control seed ' + s.seed + ' easedTotal=' + s.easedTotal + ' (must be 0)');
  if (!armedSeeds.some((s) => s.easedTotal > 0)) failures.push('armed easedTotal is 0 on every pilot seed');
  for (const s of controlSeeds.concat(armedSeeds)) {
    if (!s.accountingOk) failures.push('seed ' + s.seed + ' (' + s.arm + ') accounting diff ' + s.accountingDiff + ' > tol ' + s.accountingTol);
    if (!s.censusComplete) failures.push('seed ' + s.seed + ' (' + s.arm + ') census incomplete (rows vs daysAlive or gateEngaged flag missing)');
  }
  return { go: failures.length === 0, failures };
}

function summarize(allSeeds) {
  const byArm = { control: [], armed: [] };
  for (const sj of allSeeds) {
    const a = analyzeSeed(sj);
    (byArm[a.arm] || (byArm[a.arm] = [])).push(a);
  }
  const verdict = verdictForBand(byArm.armed || []);
  const go = goCheck(byArm.control || [], byArm.armed || []);
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const wall = {};
  for (const arm of Object.keys(byArm)) {
    const ss = byArm[arm];
    wall[arm] = {
      seeds: ss.length, collapsed: ss.filter((s) => s.collapsed).length,
      scattered: ss.filter((s) => s.scattered).length,
      medianDaysAlive: med(ss.map((s) => s.daysAlive)),
      maxDaysAlive: ss.length ? Math.max(...ss.map((s) => s.daysAlive)) : null,
      maxWaveUnlocked: ss.length ? Math.max(...ss.map((s) => s.maxWaveUnlocked || 1)) : null,
    };
  }
  return { byArm, verdict, go, wall };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    const out = summarize(seeds);
    // Strip per-day rows from the printed summary (they live in the .jsonl).
    const slim = (a) => a.map((s) => { const o = Object.assign({}, s); delete o.days; return o; });
    out.byArm.control = slim(out.byArm.control); out.byArm.armed = slim(out.byArm.armed);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  });
}

module.exports = { sumLedgerDays, deriveDays, scattered, analyzeSeed, verdictForBand, goCheck, summarize };
