// test-polityfrag-analyze-20261104.js — polity-fragility analyzer
// (arm sim-polityfrag-b). Pure functions over a per-seed JSON
// corpus: no Game, no harness. Per-day diplomacy series from
// daily[].standing.diplomacy; a DROP is a consecutive-snapshot
// transition diplomacy > 0 -> 0; a RECOVERY is 0 -> > 0 after a
// drop. Drop cause is read from the link-funnel detail diff
// across the bracketing snapshots (seasoned true->false =
// unseasoned; status active->non-active = broken), never from a
// say-line alone. Re-seasoning names the link that flips
// seasoned false->true across a recovery bracket. Last-tend day
// per link comes from courtshipEvents tendLink targets.
'use strict';

function detailMap(snap) {
  const m = {};
  if (snap && snap.linkFunnel && Array.isArray(snap.linkFunnel.detail)) {
    for (const d of snap.linkFunnel.detail) { if (d && d.id != null) m[String(d.id)] = d; }
  }
  return m;
}

function diploOf(snap) {
  if (!snap || !snap.standing || typeof snap.standing.diplomacy !== 'number') return null;
  return snap.standing.diplomacy;
}

function lastTendDays(out) {
  const m = {};
  for (const e of (out.courtshipEvents || [])) {
    if (e.fn === 'tendLink' && e.target != null) {
      const k = String(e.target);
      if (m[k] == null || e.day > m[k]) m[k] = e.day;
    }
  }
  return m;
}

function trustAt(out, linkId, day) {
  // Latest snapshot at or before `day` carrying this link, else null.
  let found = null;
  for (const snap of (out.daily || [])) {
    if (snap.day > day) break;
    const d = detailMap(snap)[String(linkId)];
    if (d) found = d;
  }
  return found;
}

function analyzeSeed(out) {
  const daily = (out.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  const tends = lastTendDays(out);
  const series = daily.map(function (snap) { return { day: snap.day, diplo: diploOf(snap), snap: snap }; })
    .filter(function (p) { return p.diplo != null; });
  let firstDiploDay = null, diploDays = 0;
  for (const p of series) {
    if (p.diplo > 0) {
      if (firstDiploDay == null) firstDiploDay = p.day;
      diploDays++;
    }
  }
  const lastDay = series.length ? series[series.length - 1].day : null;
  const postFirstDays = (firstDiploDay != null && lastDay != null) ? (lastDay - firstDiploDay + 1) : 0;
  // Post-first days counted on snapshot days only (snapshots are
  // ~daily, plus a final snapshot; gaps of 1 day from the final
  // snapshot are negligible and reported, not fudged).
  const postFirstSnapshots = firstDiploDay == null ? 0 : series.filter(function (p) { return p.day >= firstDiploDay; }).length;
  const postFirstDiplo = firstDiploDay == null ? 0 : series.filter(function (p) { return p.day >= firstDiploDay && p.diplo > 0; }).length;
  const holdShare = postFirstSnapshots ? (postFirstDiplo / postFirstSnapshots) : null;

  const drops = [], recoveries = [];
  let inDiplo = false, dropOpen = null;
  for (let i = 0; i < series.length; i++) {
    const p = series[i], prev = i ? series[i - 1] : null;
    if (!inDiplo && p.diplo > 0) {
      if (dropOpen) {
        // Recovery: re-seasoned links = seasoned false->true across bracket.
        const prevMap = detailMap(prev.snap), curMap = detailMap(p.snap);
        const reseasoned = [];
        for (const id of Object.keys(curMap)) {
          if (curMap[id].seasoned && prevMap[id] && !prevMap[id].seasoned) reseasoned.push(id);
        }
        const freshLinks = (out.linkFormedEvents || []).filter(function (f) { return f.day > dropOpen.dropDay && f.day <= p.day; }).map(function (f) { return f.link && f.link.id; });
        recoveries.push({ day: p.day, afterDropDay: dropOpen.dropDay, reseasonedLinks: reseasoned, freshLinks: freshLinks });
        dropOpen = null;
      }
      inDiplo = true;
    } else if (inDiplo && p.diplo === 0) {
      const prevMap = prev ? detailMap(prev.snap) : {}, curMap = detailMap(p.snap);
      const unseasoned = [], broken = [];
      for (const id of Object.keys(curMap)) {
        if (prevMap[id] && prevMap[id].seasoned && !curMap[id].seasoned) unseasoned.push({ id: id, trustBefore: prevMap[id].trust, trustAt: curMap[id].trust });
        if (prevMap[id] && prevMap[id].status === 'active' && curMap[id].status !== 'active') broken.push({ id: id, status: curMap[id].status, trustAt: curMap[id].trust });
      }
      const pantryAt = (p.snap && typeof p.snap.pantryKcal === 'number') ? p.snap.pantryKcal : null;
      const lastTend = {};
      for (const u of unseasoned.concat(broken)) {
        const lt = tends[u.id];
        lastTend[u.id] = (lt == null ? null : lt);
      }
      const drop = { dropDay: p.day, prevDay: prev ? prev.day : null,
        unseasoned: unseasoned, broken: broken, pantryAtDrop: pantryAt, lastTendByLink: lastTend,
        cause: (broken.length ? 'broken' : (unseasoned.length ? 'trust-unseason' : 'unknown')) };
      drops.push(drop);
      dropOpen = drop;
      inDiplo = false;
    }
  }

  // Per-link trust trajectory (sampled: first / min / last + break day).
  const linkIds = {};
  for (const snap of daily) { for (const id of Object.keys(detailMap(snap))) linkIds[id] = true; }
  const linkTrajectories = {};
  for (const id of Object.keys(linkIds)) {
    const pts = [];
    for (const snap of daily) {
      const d = detailMap(snap)[id];
      if (d) pts.push({ day: snap.day, trust: d.trust, seasoned: !!d.seasoned, status: d.status });
    }
    const brokenPt = pts.find(function (p) { return p.status !== 'active'; });
    linkTrajectories[id] = {
      first: pts[0] || null, last: pts[pts.length - 1] || null,
      minTrust: pts.reduce(function (m, p) { return (m == null || p.trust < m) ? p.trust : m; }, null),
      brokeDay: brokenPt ? brokenPt.day : null,
      lastTendDay: (tends[id] == null ? null : tends[id]),
      tendCount: (out.courtshipEvents || []).filter(function (e) { return e.fn === 'tendLink' && String(e.target) === id; }).length,
    };
  }

  // Re-proposals after a break (leadcourt re-proposes only while
  // active subordinates < 3).
  const breakDays = Object.keys(linkTrajectories).map(function (id) { return linkTrajectories[id].brokeDay; }).filter(function (d) { return d != null; });
  const firstBreakDay = breakDays.length ? Math.min.apply(null, breakDays) : null;
  const reproposals = (out.proposalEvents || []).filter(function (e) { return firstBreakDay != null && e.day > firstBreakDay; })
    .map(function (e) { return { day: e.day, fn: e.fn, target: e.target }; });

  // Never-diplomacy reason.
  let neverReason = null;
  if (firstDiploDay == null) {
    let maxSeasoned = 0, everRegional = false;
    for (const snap of daily) {
      if (snap.linkFunnel) {
        if (snap.linkFunnel.seasoned > maxSeasoned) maxSeasoned = snap.linkFunnel.seasoned;
        if (snap.linkFunnel.regionalPlus > 0) everRegional = true;
      }
    }
    if (out.villageLost && daily.length && maxSeasoned === 0) neverReason = 'died-before-seasoning';
    else if (maxSeasoned < 3) neverReason = 'never-3-seasoned-at-once (max ' + maxSeasoned + ')';
    else if (!everRegional) neverReason = 'seasoned-3-but-never-regional (polity-shape)';
    else neverReason = 'regional-fired-but-diplomacy-never-positive';
  }

  // Trajectory class.
  let trajectory;
  if (firstDiploDay == null) trajectory = 'never';
  else if (drops.length === 0) trajectory = out.villageLost ? 'holds-to-death' : 'holds';
  else if (recoveries.length > 0) trajectory = (drops.length > recoveries.length) ? 'flickers-then-collapses' : 'flickers';
  else trajectory = 'collapses';

  // Classification completeness (the prereg bar's unit).
  let classified = false, classifyNote = '';
  if (firstDiploDay == null) {
    classified = neverReason != null;
    classifyNote = classified ? ('never: ' + neverReason) : 'never: reason undetermined';
  } else {
    const dropsNamed = drops.every(function (d) { return d.cause !== 'unknown'; });
    const recoveryKnown = drops.every(function (d, i) {
      // Each drop is either recovered (a recovery names it) or
      // still open at end of run (last drop with no recovery).
      const recovered = recoveries.some(function (r) { return r.afterDropDay === d.dropDay; });
      const isLastOpen = (i === drops.length - 1) && recoveries.length < drops.length;
      return recovered || isLastOpen;
    });
    classified = dropsNamed && recoveryKnown;
    classifyNote = classified ? (trajectory + ' (' + drops.length + ' drops, ' + recoveries.length + ' recoveries)') : 'drop cause or recovery outcome undetermined';
  }

  const lastSnap = daily[daily.length - 1] || null;
  const deathCauses = {};
  (out.deathEvents || []).forEach(function (d) { const k = d.cause || d.kind || 'unknown'; deathCauses[k] = (deathCauses[k] || 0) + 1; });
  return {
    seed: out.seed, policy: out.policy, run: out.run, anchorCommit: out.anchorCommit,
    days: out.days, endReason: out.endReason, won: out.won, villageLost: out.villageLost,
    scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
    endCallMovedPeak: out.endCallMovedPeak, instrumentErrors: (out.instrumentErrors || []).length,
    firstDiploDay: firstDiploDay, diploDays: diploDays, postFirstDays: postFirstDays,
    postFirstSnapshots: postFirstSnapshots, holdShare: holdShare,
    drops: drops, recoveries: recoveries, trajectory: trajectory,
    classified: classified, classifyNote: classifyNote, neverReason: neverReason,
    linkTrajectories: linkTrajectories, reproposals: reproposals, firstBreakDay: firstBreakDay,
    linksFormed: (out.linkFormedEvents || []).length,
    proposals: (out.proposalEvents || []).length,
    finalCapped: lastSnap ? lastSnap.capped : null,
    finalStanding: lastSnap ? lastSnap.standing : null,
    finalScaleRank: lastSnap ? lastSnap.scaleRank : null,
    w4faced: lastSnap ? !!lastSnap.w4faced : false, w5faced: lastSnap ? !!lastSnap.w5faced : false,
    readyDays: daily.filter(function (snap) { return snap.readiness5 && snap.readiness5.ready; }).length,
    deathTotal: (out.deathEvents || []).length, deathCauses: deathCauses,
    finalLiving: lastSnap ? lastSnap.livingCount : null,
  };
}

function judgeGo(summaries) {
  const classified = summaries.filter(function (s) { return s.classified; });
  const diploSeeds = summaries.filter(function (s) { return s.firstDiploDay != null && s.classified; });
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0; }).length;
  const verdict = bad > 2 ? 'INSUFFICIENT-DATA'
    : (classified.length >= 6 && diploSeeds.length >= 3 ? 'DIAG-GO' : 'DIAG-NO-CANDIDATE');
  return { classifiedN: classified.length, diploClassifiedN: diploSeeds.length,
    total: summaries.length, badSeeds: bad, insufficientData: bad > 2, verdict: verdict };
}

module.exports = { analyzeSeed: analyzeSeed, judgeGo: judgeGo };
