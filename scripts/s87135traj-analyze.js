#!/usr/bin/env node
// s87135traj-analyze.js — divergence + classification analyzer for sim-s87135-traj-a.
// Usage: node scripts/s87135traj-analyze.js <baseline-json> <lever-json>
// Prints a JSON report to stdout. Pure read of two per-seed JSONs.
'use strict';
const fs = require('fs');
const [basePath, leverPath] = process.argv.slice(2);
if (!basePath || !leverPath) { console.error('usage: s87135traj-analyze.js <baseline> <lever>'); process.exit(2); }
const B = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const L = JSON.parse(fs.readFileSync(leverPath, 'utf8'));

function snapKey(s) {
  return JSON.stringify({
    day: s.day, px: s.px, py: s.py,
    scholarHp: s.scholar.hp, scholarKcal: s.scholar.kcal,
    roster: s.roster.map((r) => r.id + ':' + (r.alive ? 1 : 0)),
    rosterAlive: s.rosterAlive, pantry: s.pantryKcalBucket,
    wm: s.worldMonsters, fled: s.fledKeys,
    killLen: s.killLogLen, lastKill: s.lastKill, faced: s.faced,
  });
}
function fieldDiffs(a, b) {
  const out = [];
  if (a.day !== b.day) out.push('day');
  if (a.px !== b.px || a.py !== b.py) out.push('tile');
  if (a.scholar.hp !== b.scholar.hp || a.scholar.kcal !== b.scholar.kcal) out.push('scholar-hp-kcal');
  const ra = a.roster.map((r) => r.id + ':' + (r.alive ? 1 : 0)).join(',');
  const rb = b.roster.map((r) => r.id + ':' + (r.alive ? 1 : 0)).join(',');
  if (ra !== rb || a.rosterAlive !== b.rosterAlive) out.push('roster');
  if (a.pantryKcalBucket !== b.pantryKcalBucket) out.push('pantry');
  if (JSON.stringify(a.worldMonsters) !== JSON.stringify(b.worldMonsters)) out.push('worldMonsters');
  if (JSON.stringify(a.fledKeys) !== JSON.stringify(b.fledKeys)) out.push('fledKeys');
  if (a.killLogLen !== b.killLogLen || JSON.stringify(a.lastKill) !== JSON.stringify(b.lastKill)) out.push('killLog');
  if (JSON.stringify(a.faced) !== JSON.stringify(b.faced)) out.push('faced');
  if (a.nodePos && b.nodePos && JSON.stringify(a.nodePos) !== JSON.stringify(b.nodePos)) out.push('nodePos');
  if (a.overlap !== undefined && a.overlap !== b.overlap) out.push('overlap');
  if (a.haven && b.haven && JSON.stringify(a.haven) !== JSON.stringify(b.haven)) out.push('haven');
  return out;
}

// 1. Hash sequence divergence.
let hashDiv = null;
for (let i = 0; i < Math.min(B.hashes.length, L.hashes.length); i++) {
  if (B.hashes[i] !== L.hashes[i]) { hashDiv = { index: i, baseline: B.hashes[i], lever: L.hashes[i] }; break; }
}
// 2. Snapshot sequence divergence.
let snapDiv = null;
for (let i = 0; i < Math.min(B.trajSnaps.length, L.trajSnaps.length); i++) {
  const f = fieldDiffs(B.trajSnaps[i], L.trajSnaps[i]);
  if (f.length) { snapDiv = { index: i, baselineDay: B.trajSnaps[i].day, leverDay: L.trajSnaps[i].day, fields: f, baseline: B.trajSnaps[i], lever: L.trajSnaps[i] }; break; }
}
// First divergence per field category (scan full shared prefix).
const firstFieldDiv = {};
for (let i = 0; i < Math.min(B.trajSnaps.length, L.trajSnaps.length); i++) {
  for (const f of fieldDiffs(B.trajSnaps[i], L.trajSnaps[i])) {
    if (!firstFieldDiv[f]) firstFieldDiv[f] = { index: i, day: B.trajSnaps[i].day };
  }
}
// 3. Fullseat daily divergence (rank / ledger / w3 rung / war points).
let dailyDiv = null;
for (let i = 0; i < Math.min(B.daily.length, L.daily.length); i++) {
  const a = B.daily[i], b = L.daily[i];
  const diffs = [];
  for (const k of ['rank', 'bar2', 'dN', 'p1', 'p2', 'p3', 'p4', 'p5', 'w3rung', 'warPts']) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) diffs.push(k);
  }
  if (diffs.length) { dailyDiv = { index: i, baselineDay: a.day, leverDay: b.day, fields: diffs, baseline: a, lever: b }; break; }
}
// 4. Field-fight day divergence: first day whose ff-row set differs.
function ffByDay(rows) {
  const m = {};
  for (const r of rows) {
    (m[r.day] = m[r.day] || []).push([r.vid, r.mid, r.wave, r.outcome, r.mDealt, r.mHpLeft, r.contactFinishAttempted || false, r.contactFinishKill || false].join('|'));
  }
  return m;
}
const bFF = ffByDay(B.fieldFights), lFF = ffByDay(L.fieldFights);
let ffDiv = null;
for (let d = 1; d <= Math.max(B.gameDays, L.gameDays); d++) {
  if (JSON.stringify(bFF[d] || []) !== JSON.stringify(lFF[d] || [])) { ffDiv = { day: d, baseline: bFF[d] || [], lever: lFF[d] || [] }; break; }
}
// 5. Spawn sequence divergence.
function spawnKey(s) { return [s.day, s.mid, s.wave, s.tx, s.ty, s.veteran].join('|'); }
let spawnDiv = null;
for (let i = 0; i < Math.min(B.spawns.length, L.spawns.length); i++) {
  if (spawnKey(B.spawns[i]) !== spawnKey(L.spawns[i])) { spawnDiv = { index: i, baseline: B.spawns[i], lever: L.spawns[i] }; break; }
}
// 6. Baseline wave-3 classification.
const bW3 = B.fieldFights.filter((r) => r.wave === 3);
const lW3 = L.fieldFights.filter((r) => r.wave === 3);
const spoolAll = bW3.filter((r) => r.mid === 'spool');
const spoolPost = spoolAll.filter((r) => r.day >= 85);
const spoolPre = spoolAll.filter((r) => r.day < 85);
const otherBeast = bW3.filter((r) => !(r.mid === 'spool' && r.day >= 85));
const byMid = {};
for (const r of bW3) byMid[r.mid] = (byMid[r.mid] || 0) + 1;
const byMidPost = {};
for (const r of bW3.filter((r) => r.day >= 85)) byMidPost[r.mid] = (byMidPost[r.mid] || 0) + 1;
// Finishable CONTACT meetings on baseline (analyzer universe: mFlee + wave>=3,
// mHpAtContact below break line — approximate via contactfinish analyzer fields:
// use the confirm's own count as cross-check; here report mFlee w3 rows).
const bW3Flee = bW3.filter((r) => r.outcome === 'mFlee');
// 7. Lever conversions.
const leverAttempts = L.fieldFights.filter((r) => r.contactFinishAttempted);
const leverW3ByMid = {};
for (const r of lW3) leverW3ByMid[r.mid] = (leverW3ByMid[r.mid] || 0) + 1;
// 8. Counterfactual day table: baseline w3 days -> lever activity that day.
const leverSnapByDay = {};
for (const s of L.trajSnaps) if (!leverSnapByDay[s.day]) leverSnapByDay[s.day] = s;
const baseSnapByDay = {};
for (const s of B.trajSnaps) if (!baseSnapByDay[s.day]) baseSnapByDay[s.day] = s;
const counterfactual = [];
for (const d of [...new Set(bW3.map((r) => r.day))].sort((a, b) => a - b)) {
  const ls = leverSnapByDay[d] || null;
  const bs = baseSnapByDay[d] || null;
  counterfactual.push({
    day: d,
    baselineW3: (bFF[d] || []).filter((x) => true).length,
    baselineW3Rows: bW3.filter((r) => r.day === d).map((r) => r.mid + '/' + r.vid + '/' + r.outcome),
    leverFightsThatDay: (lFF[d] || []),
    leverTile: ls ? [ls.px, ls.py] : null,
    baselineTile: bs ? [bs.px, bs.py] : null,
    leverRosterAlive: ls ? ls.rosterAlive : null,
    baselineRosterAlive: bs ? bs.rosterAlive : null,
  });
}
// 9. Spool meeting streams: days of spool rows per leg.
const spoolDays = {
  baseline: spoolAll.map((r) => ({ day: r.day, vid: r.vid, outcome: r.outcome, mHpLeft: r.mHpLeft })),
  lever: lW3.filter((r) => r.mid === 'spool').map((r) => ({ day: r.day, vid: r.vid, outcome: r.outcome, attempted: !!r.contactFinishAttempted, kill: !!r.contactFinishKill })),
};
// 10. Roster/scholar first divergence detail (from firstFieldDiv) + tile path around d80-95.
function tilePath(snaps, lo, hi) {
  const out = [];
  for (const s of snaps) if (s.day >= lo && s.day <= hi && (out.length === 0 || out[out.length - 1].day !== s.day)) out.push({ day: s.day, px: s.px, py: s.py });
  return out;
}

const report = {
  headline: {
    baseline: { national: B.national, table: B.table, won: B.won, gameDays: B.gameDays, endReason: B.endReason, endScaleRank: B.endScaleRank, ff: B.fieldFights.length, kills: B.killEvents.length, spawns: B.spawns.length },
    lever: { national: L.national, table: L.table, won: L.won, gameDays: L.gameDays, endReason: L.endReason, endScaleRank: L.endScaleRank, ff: L.fieldFights.length, kills: L.killEvents.length, spawns: L.spawns.length },
  },
  hashDiv, snapDiv: snapDiv ? { index: snapDiv.index, baselineDay: snapDiv.baselineDay, leverDay: snapDiv.leverDay, fields: snapDiv.fields } : null,
  firstFieldDiv,
  dailyDiv: dailyDiv ? { index: dailyDiv.index, baselineDay: dailyDiv.baselineDay, leverDay: dailyDiv.leverDay, fields: dailyDiv.fields } : null,
  ffDiv, spawnDiv,
  classification: {
    baselineW3Total: bW3.length,
    spoolAll: spoolAll.length, spoolPre85: spoolPre.length, spoolPost85: spoolPost.length,
    otherBeast: otherBeast.length,
    byMid, byMidPost85: byMidPost,
    baselineW3Flee: bW3Flee.length,
    leverW3Total: lW3.length, leverW3ByMid,
    leverAttempts: leverAttempts.map((r) => ({ day: r.day, vid: r.vid, mid: r.mid, weapon: r.contactFinishWeapon, instrument: r.contactFinishInstrument, beastHp: r.contactFinishBeastHp, dmg: r.contactFinishDmg, kill: r.contactFinishKill })),
  },
  spoolDays,
  counterfactual,
  tilePath85: { baseline: tilePath(B.trajSnaps, 80, 95), lever: tilePath(L.trajSnaps, 80, 95) },
  snapDivDetail: snapDiv ? { baseline: snapDiv.baseline, lever: snapDiv.lever } : null,
  recorderErrs: { baseline: B.recorderErrs, lever: L.recorderErrs, trajBaseline: B.trajErrs, trajLever: L.trajErrs },
};
console.log(JSON.stringify(report, null, 1));
