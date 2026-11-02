#!/usr/bin/env node
// heralddepart-analyze-20261102.js — classification table for
// sim-heralddepart-a. Reads per-seed JSONs written by
// scripts/heralddepart-driver-20261102.js and classifies every
// missed-bump day (prereg definition) from DAY-END positions +
// captured removal events. No re-simulation, no hand counts.
// Usage: node scripts/heralddepart-analyze-20261102.js [--out <file>]
//   [per-seed-dir]  (default: evidence/2026-11-02/perseed-heralddepart-a)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
let outFile = null;
let dir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-heralddepart-a');
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') outFile = args[++i];
  else dir = args[i];
}

function mechanismOf(rec, removal) {
  if (!removal) return 'UNKNOWN';
  const say = ((removal.sayDuring || []).concat(removal.sayAfter || [])).join(' ');
  const st0 = (removal.stackTop || []).map(function (n) { return String(n).replace(/^.*\./, ''); });
  if (/lost your trail/.test(say)) return 'LOST-SIGHT';
  if (/melts back into the treeline/.test(say)) return 'FEARFUL-FLEE';
  if (removal.fled) return 'FEARFUL-FLEE';
  const st = st0;
  if (st.indexOf('titanVictory') >= 0) return 'OTHER:titanVictory';
  if (st.indexOf('startCombat') >= 0 || st.indexOf('tbEnd') >= 0) return 'FIGHT-START';
  // Villager kill: a herald fieldFight on the removal day with vKill.
  const ff = (rec.fieldFights || []).filter(function (f) {
    return f && f.mid === 'herald' && f.day === removal.day && f.outcome === 'vKill';
  });
  if (ff.length) return 'VILLAGER-KILL';
  if (st.indexOf('monsterTurn') >= 0) return 'LOST-SIGHT';
  return 'OTHER:' + (st[0] || 'no-stack');
}

function analyze(rec) {
  const trace = (rec.dailyTrace || []).slice().sort(function (a, b) { return a.day - b.day; });
  const attemptDays = {};
  (rec.attempts || []).forEach(function (a) { if (a.mid === 'herald') attemptDays[a.day] = (attemptDays[a.day] || 0) + 1; });
  const callDay = rec.callDay;
  // Departure day: first day-end absent after a day-end present.
  let departureDay = null, lastPresentDay = null;
  for (let i = 0; i < trace.length; i++) {
    if (trace[i].heraldTile) lastPresentDay = trace[i].day;
    else if (lastPresentDay != null && departureDay == null) departureDay = trace[i].day;
  }
  const removals = rec.removalEvents || [];
  // Removal that caused the departure: latest removal with day in
  // [lastPresentDay, departureDay]; else latest with day <= departureDay.
  let depRemoval = null;
  if (departureDay != null) {
    const inWindow = removals.filter(function (r) { return r.day >= lastPresentDay && r.day <= departureDay; });
    if (inWindow.length) depRemoval = inWindow[inWindow.length - 1];
    else {
      const before = removals.filter(function (r) { return r.day <= departureDay; });
      if (before.length) depRemoval = before[before.length - 1];
    }
  }
  const rows = [];
  trace.forEach(function (r) {
    if (callDay == null || r.day < callDay) return;
    if (!r.onLair) return;
    if (attemptDays[r.day]) return;
    let cls, mech = null, inBlock = null;
    if (!r.heraldTile) {
      cls = 'HEROLD-LEFT';
      mech = mechanismOf(rec, depRemoval);
    } else if (r.heraldTile.x !== r.scholarTile.x || r.heraldTile.y !== r.scholarTile.y) {
      cls = 'NEVER-ARRIVED';
    } else if (!r.detailMatchExact) {
      cls = 'DETAIL-DIFFERED';
      inBlock = !!r.detailInBlock;
    } else {
      cls = 'MATCHED-NO-BUMP';
    }
    const mtRows = (rec.monsterTurnLog || []).filter(function (m) { return m.day === r.day; });
    rows.push({ seed: rec.seed, arm: rec.arm, day: r.day, cls: cls, mechanism: mech,
      inBlock: inBlock, scholarTile: r.scholarTile, heraldTile: r.heraldTile,
      scholarDetail: r.scholarDetail, heraldDetail: r.heraldDetail,
      mtRelevantToday: mtRows.length,
      mtSeeScholar: mtRows.map(function (m) { return m.pre ? m.pre.seeScholar : null; }),
      mtStances: mtRows.map(function (m) { return m.pre && m.pre.herald ? m.pre.herald.stance : null; }),
      mtLostSight: mtRows.map(function (m) { return m.pre && m.pre.herald ? m.pre.herald.lostSight : null; }),
      mtRemovedDuring: mtRows.filter(function (m) { return m.removedDuring; }).length });
  });
  const counts = {};
  rows.forEach(function (r) { counts[r.cls] = (counts[r.cls] || 0) + 1; });
  const mechCounts = {};
  rows.filter(function (r) { return r.cls === 'HEROLD-LEFT'; }).forEach(function (r) { mechCounts[r.mechanism] = (mechCounts[r.mechanism] || 0) + 1; });
  const unknownLeft = rows.filter(function (r) { return r.cls === 'HEROLD-LEFT' && r.mechanism === 'UNKNOWN'; }).length;
  const matched = counts['MATCHED-NO-BUMP'] || 0;
  const assigned = rows.length - matched - unknownLeft;
  return { seed: rec.seed, arm: rec.arm, run: rec.run, callDay: callDay,
    lairTile: rec.lairTile, departureDay: departureDay, lastPresentDay: lastPresentDay,
    depRemoval: depRemoval ? { day: depRemoval.day, stackTop: depRemoval.stackTop, fled: !!depRemoval.fled, sayDuring: depRemoval.sayDuring } : null,
    depMechanism: departureDay != null ? mechanismOf(rec, depRemoval) : null,
    allRemovals: removals.map(function (r) { return { day: r.day, stackTop: r.stackTop, fled: !!r.fled, sayDuring: r.sayDuring }; }),
    missedTotal: rows.length, counts: counts, mechCounts: mechCounts,
    coverage: rows.length ? assigned / rows.length : null, rows: rows,
    endReason: rec.endReason, gameDays: rec.gameDays };
}

// Corpus = r1 runs only: the determinism repeat (r2) is excluded
// from the corpus by the prereg, so it must never inflate counts.
const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('hd-') === 0 && f.endsWith('-r1.json'); }).sort();
const perSeed = files.map(function (f) { return analyze(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
const totals = { missedTotal: 0, counts: {}, mechCounts: {}, matched: 0, unknownLeft: 0 };
perSeed.forEach(function (p) {
  totals.missedTotal += p.missedTotal;
  Object.keys(p.counts).forEach(function (k) { totals.counts[k] = (totals.counts[k] || 0) + p.counts[k]; });
  Object.keys(p.mechCounts).forEach(function (k) { totals.mechCounts[k] = (totals.mechCounts[k] || 0) + p.mechCounts[k]; });
  totals.matched += p.counts['MATCHED-NO-BUMP'] || 0;
  totals.unknownLeft += p.rows.filter(function (r) { return r.cls === 'HEROLD-LEFT' && r.mechanism === 'UNKNOWN'; }).length;
});
totals.assigned = totals.missedTotal - totals.matched - totals.unknownLeft;
totals.coverage = totals.missedTotal ? totals.assigned / totals.missedTotal : null;
const out = { totals: totals, perSeed: perSeed };
console.log(JSON.stringify(out, null, 2));
if (outFile) fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
