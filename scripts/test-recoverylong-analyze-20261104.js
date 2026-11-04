// test-recoverylong-analyze-20261104.js — recoverylong analyzer
// (arm sim-recoverylong-b). Self-contained: reuses the polityfrag
// analyzer's analyzeSeed, re-implements the zombie clear detector
// (same definition: Haven-primary link active -> non-active with
// last active trust <= 0), and adds the recoverylong GO judge:
// a seed PASSES iff it has a clear AND a re-proposal or re-link
// after the clear AND survival-after-clear >= 35 days (snapshot
// days, conservative vs the say-line day) AND a post-clear
// diplomacy recovery whose snapshot pantryKcal >= 12000.
// Cost bar (paired, same seeds): starvation deaths armed <=
// control + 2 on totals AND on arm-only deaths (deaths on seeds
// where control has none of that cause is not applicable here —
// arm-only means deaths beyond control on the same seed), and
// armed median survival >= 0.8 x control median. Starvation is
// deathEvents cause 'starvation' (the polityfrag deathCauses
// key); the cost judge is implemented over per-seed summaries
// produced by summarizePair below, so the units are explicit.
// Pure functions over per-seed JSONs: no Game.
// Usage: const AN = require('./test-recoverylong-analyze-20261104');
'use strict';
const PF = require('./test-polityfrag-analyze-20261104');

function detailMap(snap) {
  const m = {};
  if (snap && snap.linkFunnel && Array.isArray(snap.linkFunnel.detail)) {
    for (const d of snap.linkFunnel.detail) { if (d && d.id != null) m[String(d.id)] = d; }
  }
  return m;
}

function clearEvents(out) {
  const daily = (out.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  const clears = [], otherBreaks = [];
  const prev = {};
  for (const snap of daily) {
    const m = detailMap(snap);
    for (const id of Object.keys(m)) {
      const d = m[id];
      const isHavenPrimary = d.primary === 'haven' && d.subordinate && d.subordinate !== 'haven';
      if (!isHavenPrimary) continue;
      if (d.status === 'active') { prev[id] = d; continue; }
      if (prev[id]) {
        const rec = { day: snap.day, linkId: id, village: d.subordinate,
          trustAtBreak: prev[id].trust, status: d.status };
        if ((prev[id].trust || 0) <= 0) clears.push(rec);
        else otherBreaks.push(rec);
        prev[id] = null;
      }
    }
  }
  return { clears: clears, otherBreaks: otherBreaks };
}

function pantryAt(out, day) {
  const snap = (out.daily || []).find(function (s) { return s.day === day; });
  return snap ? snap.pantryKcal : null;
}

function analyzeSeed(out) {
  const base = PF.analyzeSeed(out);
  const ce = clearEvents(out);
  const firstClear = ce.clears.length ? ce.clears[0] : null;
  const sayClearDay = firstClear ? (function () {
    const hit = (out.sayLines || []).find(function (s) { return /faded to nothing/i.test(s.line || ''); });
    return hit ? hit.day : null;
  })() : null;
  const lastSnapDay = (out.daily || []).length ? out.daily[out.daily.length - 1].day : null;
  // Survival after clear: death day (out.days) minus first broken
  // snapshot day when lost; censored at last snapshot when alive.
  // Snapshot-based: conservative by the 1-day say/snapshot lag.
  const survivalAfterClear = firstClear
    ? ((out.villageLost ? out.days : lastSnapDay) - firstClear.day) : null;
  const survivalAfterClearSay = (firstClear && sayClearDay != null)
    ? ((out.villageLost ? out.days : lastSnapDay) - sayClearDay) : null;
  const reproposalsAfterClear = firstClear
    ? (out.proposalEvents || []).filter(function (e) { return e.day > firstClear.day; })
      .map(function (e) { return { day: e.day, fn: e.fn, target: e.target }; })
    : [];
  const relinksAfterClear = firstClear
    ? (out.linkFormedEvents || []).filter(function (f) { return f.day > firstClear.day; })
      .map(function (f) { return { day: f.day, link: f.link }; })
    : [];
  const recoveriesAfterClear = firstClear
    ? (base.recoveries || []).filter(function (r) { return r.day > firstClear.day; })
      .map(function (r) { return Object.assign({}, r, { pantryKcal: pantryAt(out, r.day) }); })
    : [];
  const reSeason = recoveriesAfterClear.length ? recoveriesAfterClear[0] : null;
  const pantryAtClear = firstClear ? pantryAt(out, firstClear.day) : null;
  const passes = !!(firstClear
    && (reproposalsAfterClear.length > 0 || relinksAfterClear.length > 0)
    && survivalAfterClear != null && survivalAfterClear >= 35
    && reSeason && typeof reSeason.pantryKcal === 'number' && reSeason.pantryKcal >= 12000);
  return Object.assign({}, base, {
    clears: ce.clears, otherBreaks: ce.otherBreaks, firstClear: firstClear,
    sayClearDay: sayClearDay, pantryAtClear: pantryAtClear,
    survivalAfterClear: survivalAfterClear,
    survivalAfterClearSay: survivalAfterClearSay,
    reproposalsAfterClear: reproposalsAfterClear,
    relinksAfterClear: relinksAfterClear,
    recoveriesAfterClear: recoveriesAfterClear,
    reSeasonPantry: reSeason ? reSeason.pantryKcal : null,
    reSeasonDay: reSeason ? reSeason.day : null,
    passesRecoveryLong: passes,
    starvationDeaths: (base.deathCauses || {}).starvation || 0,
  });
}

function median(nums) {
  const s = nums.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// summaries: [{seed, days, starvationDeaths, instrumentErrors}]
// costBar: {armedStarvation, controlStarvation, armedMedian, controlMedian, pass, notes[]}
// Bar as pre-registered: starvation total armed <= control + 2 AND
// armed median >= 0.8 x control median. "Arm-only deaths" reading:
// per-seed excess starvation (armed - control, floored at 0, summed)
// must also be <= 2 — i.e. the rule must not add more than 2
// starvation deaths on any reading of the same total.
function costBar(armed, control) {
  const aStarv = armed.reduce(function (s, x) { return s + (x.starvationDeaths || 0); }, 0);
  const cStarv = control.reduce(function (s, x) { return s + (x.starvationDeaths || 0); }, 0);
  const excess = armed.reduce(function (s, x) {
    const c = control.find(function (y) { return y.seed === x.seed; });
    return s + Math.max(0, (x.starvationDeaths || 0) - (c ? c.starvationDeaths || 0 : 0));
  }, 0);
  const aMed = median(armed.map(function (x) { return x.days; }));
  const cMed = median(control.map(function (x) { return x.days; }));
  const notes = [];
  if (aStarv > cStarv + 2) notes.push('starvation total ' + aStarv + ' > control ' + cStarv + ' + 2');
  if (excess > 2) notes.push('per-seed starvation excess ' + excess + ' > 2');
  if (!(aMed >= 0.8 * cMed)) notes.push('median ' + aMed + ' < 0.8 x control ' + cMed);
  return { armedStarvation: aStarv, controlStarvation: cStarv, perSeedExcess: excess,
    armedMedian: aMed, controlMedian: cMed, pass: notes.length === 0, notes: notes };
}

function judgeGo(summaries) {
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0; }).length;
  const passing = summaries.filter(function (s) { return s.passesRecoveryLong; });
  const verdict = bad > 2 ? 'INSUFFICIENT-DATA'
    : (passing.length >= 1 ? 'GO' : 'NO-GO');
  return { passingSeeds: passing.map(function (s) { return s.seed; }),
    clearSeeds: summaries.filter(function (s) { return (s.clears || []).length; }).map(function (s) { return s.seed; }),
    badSeeds: bad, verdict: verdict };
}

module.exports = { analyzeSeed: analyzeSeed, judgeGo: judgeGo, costBar: costBar,
  clearEvents: clearEvents, median: median };
