// test-belongzombie-analyze-20261104.js — BELONG-zombie census + clear analyzer
// (arm sim-belongzombie-a). Pure functions over per-seed JSONs: no Game.
// BELONG link: primary !== 'haven', subordinate === 'haven' (a peer a/b link
// is not a BELONG link). A BELONG zombie is a BELONG link that reaches
// trust <= 0 while 'active' on a snapshot BEFORE the village's death day
// (death-day snapshots excluded: a break landing on the death day itself
// proves nothing about in-life blocking, cf. 99808/99401 death-day breaks).
// Trust flickers (99808: 0 -> 1-2 -> 0): firstZero is the first in-life
// trust-0 snapshot; zeroDaysInLife counts in-life trust-0 snapshots.
// Blocking: while a zombie link is 'active', proposeLink's linkWith guard
// (active-only, direction-agnostic — hierarchy.js linkWith) refuses ANY
// new link with that village, and leadcourt's candidate filter
// (!linkWith) never even attempts one. So the census records proposal
// attempts to the zombie village while the link is active (expected 0)
// and, separately, whether the seed still had proposal activity at all
// (so "0 attempts" is blocking, not a dead policy).
// Step-2 clear event (BELONG direction): a BELONG link active -> non-active
// whose last active trust was <= 0 AND whose break is named by a 'faded'
// say line (the rule says the clear aloud, same pattern as the held
// Haven-primary rule). Breaks without a faded line are otherBreaks.
// Census judge + step-2 GO judge + cost bar live here; the prereg binds
// them. Usage: const AN = require('./test-belongzombie-analyze-20261104');
'use strict';
const PF = require('./test-polityfrag-analyze-20261104');

function detailMap(snap) {
  const m = {};
  if (snap && snap.linkFunnel && Array.isArray(snap.linkFunnel.detail)) {
    for (const d of snap.linkFunnel.detail) { if (d && d.id != null) m[String(d.id)] = d; }
  }
  return m;
}
function isBelong(d) {
  return !!(d && d.primary && d.primary !== 'haven' && d.subordinate === 'haven');
}
function pantryAt(out, day) {
  const snap = (out.daily || []).find(function (s) { return s.day === day; });
  return snap ? snap.pantryKcal : null;
}
// Per-link BELONG zombie records for one per-seed JSON.
function belongZombies(out) {
  const daily = (out.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  const deathDay = out.villageLost ? out.days : null;
  const byId = {};
  for (const snap of daily) {
    const m = detailMap(snap);
    for (const id of Object.keys(m)) {
      const d = m[id];
      if (!isBelong(d)) continue;
      const r = byId[id] || (byId[id] = { linkId: id, village: d.primary,
        formed: snap.day, minTrust: d.trust, firstZero: null, lastZero: null,
        zeroDaysInLife: 0, zeroDaysTotal: 0, lastActive: null, breakDay: null,
        breakTrust: null, endStatus: d.status });
      if (d.trust != null && (r.minTrust == null || d.trust < r.minTrust)) r.minTrust = d.trust;
      if (d.status === 'active') {
        r.lastActive = snap.day; r.endStatus = 'active';
        if ((d.trust || 0) <= 0) {
          r.zeroDaysTotal++;
          if (deathDay == null || snap.day < deathDay) {
            if (r.firstZero == null) r.firstZero = snap.day;
            r.lastZero = snap.day; r.zeroDaysInLife++;
          }
        }
      } else {
        if (r.breakDay == null && r.lastActive != null) { r.breakDay = snap.day; r.breakTrust = r.minTrust; }
        r.endStatus = d.status;
      }
    }
  }
  const zombies = [];
  for (const id of Object.keys(byId)) {
    const r = byId[id];
    if (r.firstZero == null) continue;
    const windowEnd = r.breakDay != null ? r.breakDay : (deathDay != null ? deathDay : r.lastActive);
    const windowDays = windowEnd != null ? windowEnd - r.firstZero : null;
    const postZeroLife = deathDay != null ? deathDay - r.firstZero : null;
    // Pantry feasibility inside the 35-day re-seasoning window after firstZero:
    // any in-life snapshot in (firstZero, firstZero+35] with pantry >= 12000.
    let pantryGateOpen = false, pantryMax35 = null;
    for (const snap of daily) {
      if (snap.day <= r.firstZero || snap.day > r.firstZero + 35) continue;
      if (deathDay != null && snap.day >= deathDay) continue;
      if (typeof snap.pantryKcal === 'number') {
        if (pantryMax35 == null || snap.pantryKcal > pantryMax35) pantryMax35 = snap.pantryKcal;
        if (snap.pantryKcal >= 12000) pantryGateOpen = true;
      }
    }
    const propsWhileActive = (out.proposalEvents || []).filter(function (e) {
      return e.target === r.village && e.day > r.firstZero &&
        (r.breakDay == null || e.day < r.breakDay);
    }).map(function (e) { return { day: e.day, fn: e.fn }; });
    zombies.push(Object.assign({}, r, { windowDays: windowDays,
      postZeroLife: postZeroLife, pantryGateOpen35: pantryGateOpen,
      pantryMax35: pantryMax35, propsWhileActive: propsWhileActive,
      // Addressable for step 2: the village lives >= 35d past firstZero AND
      // the proposal gate opens inside that window.
      addressable: (postZeroLife != null && postZeroLife >= 35 && pantryGateOpen) }));
  }
  return zombies;
}
// BELONG-direction clear events (armed leg only): active -> non-active
// with last active trust <= 0, named by a faded say line.
function belongClears(out) {
  const daily = (out.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  const clears = [], otherBreaks = [];
  const prev = {};
  for (const snap of daily) {
    const m = detailMap(snap);
    for (const id of Object.keys(m)) {
      const d = m[id];
      if (!isBelong(d)) continue;
      if (d.status === 'active') { prev[id] = d; continue; }
      if (prev[id]) {
        const rec = { day: snap.day, linkId: id, village: d.primary,
          trustAtBreak: prev[id].trust, status: d.status };
        // The rule says the clear aloud at the weekly boundary; the say day
        // lags the first broken snapshot by ~1 day (recovery-zombie finding).
        // Name matching is unreliable (say lines use display names, snapshots
        // use village ids), so the window test is used: a faded line within
        // 7 days before the broken snapshot names this clear.
        const faded = (out.sayLines || []).some(function (s) {
          return /faded to nothing/i.test(s.line || '') &&
            s.day != null && s.day <= snap.day && s.day >= snap.day - 7;
        });
        if ((prev[id].trust || 0) <= 0 && faded) clears.push(rec);
        else otherBreaks.push(rec);
        prev[id] = null;
      }
    }
  }
  return { clears: clears, otherBreaks: otherBreaks };
}
function analyzeSeed(out) {
  const base = PF.analyzeSeed(out);
  const zombies = belongZombies(out);
  const ce = belongClears(out);
  const firstClear = ce.clears.length ? ce.clears[0] : null;
  const lastSnapDay = (out.daily || []).length ? out.daily[out.daily.length - 1].day : null;
  const survivalAfterClear = firstClear
    ? ((out.villageLost ? out.days : lastSnapDay) - firstClear.day) : null;
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
  const passes = !!(firstClear
    && (reproposalsAfterClear.length > 0 || relinksAfterClear.length > 0)
    && survivalAfterClear != null && survivalAfterClear >= 35
    && reSeason && typeof reSeason.pantryKcal === 'number' && reSeason.pantryKcal >= 12000);
  return Object.assign({}, base, {
    belongZombies: zombies, belongZombieLinks: zombies.length,
    belongClears: ce.clears, belongOtherBreaks: ce.otherBreaks,
    firstBelongClear: firstClear, survivalAfterClear: survivalAfterClear,
    reproposalsAfterClear: reproposalsAfterClear,
    relinksAfterClear: relinksAfterClear,
    recoveriesAfterClear: recoveriesAfterClear,
    reSeasonPantry: reSeason ? reSeason.pantryKcal : null,
    passesBelongRecovery: passes,
    starvationDeaths: (base.deathCauses || {}).starvation || 0,
  });
}
function median(nums) {
  const s = nums.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
// Census judge (prereg §C): GO-TO-STEP-2 iff addressable seeds >= 2
// (each: >= 1 BELONG zombie with postZeroLife >= 35d AND pantry gate open
// in the 35d window). Otherwise SUBSTRATE-MISSING (pool 0) or
// INSUFFICIENT-DATA (pool > 0 but < bar). bad = instrument-error seeds.
function judgeCensus(summaries) {
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0; }).length;
  const zombieSeeds = summaries.filter(function (s) { return (s.belongZombies || []).length > 0; });
  const addrSeeds = summaries.filter(function (s) {
    return (s.belongZombies || []).some(function (z) { return z.addressable; });
  });
  const zombieLinks = summaries.reduce(function (n, s) { return n + ((s.belongZombies || []).length); }, 0);
  const verdict = bad > 2 ? 'INSUFFICIENT-DATA'
    : (addrSeeds.length >= 2 ? 'GO-TO-STEP-2'
    : (zombieLinks === 0 ? 'SUBSTRATE-MISSING' : 'INSUFFICIENT-DATA'));
  return { zombieSeeds: zombieSeeds.map(function (s) { return s.seed; }),
    addressableSeeds: addrSeeds.map(function (s) { return s.seed; }),
    zombieLinks: zombieLinks, badSeeds: bad, verdict: verdict };
}
// Step-2 GO judge: GO iff >= 1 armed seed passes (clear + re-proposal or
// re-link + survival >= 35d + post-clear recovery pantry >= 12000).
function judgeGo(summaries) {
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0; }).length;
  const passing = summaries.filter(function (s) { return s.passesBelongRecovery; });
  const verdict = bad > 2 ? 'INSUFFICIENT-DATA'
    : (passing.length >= 1 ? 'GO' : 'NO-GO');
  return { passingSeeds: passing.map(function (s) { return s.seed; }),
    clearSeeds: summaries.filter(function (s) { return (s.belongClears || []).length; }).map(function (s) { return s.seed; }),
    badSeeds: bad, verdict: verdict };
}
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
module.exports = { analyzeSeed: analyzeSeed, belongZombies: belongZombies,
  belongClears: belongClears, judgeCensus: judgeCensus, judgeGo: judgeGo,
  costBar: costBar, median: median, isBelong: isBelong };
