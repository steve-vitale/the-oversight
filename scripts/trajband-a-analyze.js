#!/usr/bin/env node
// trajband-a-analyze.js — band trajectory-safety analyzer for sim-trajband-a.
//
// DIAG ONLY, pure read of per-seed sweep JSONs (the s87135traj-sweep.js
// corpus format: daily, fieldFights, killLog, spawns, trajSnaps,
// trajTicks, hashes, endScaleRank, gameDays, endReason).
//
// Usage:
//   node scripts/trajband-a-analyze.js <baseline-json> <lever-json>
//   node scripts/trajband-a-analyze.js --baseline-dir <dir> --lever-dir <dir>
//     (pairs files named s<seed>.json present in both dirs, sorted by seed)
//
// Definitions are EXACTLY the prereg
// (evidence/2026-11-01/sim-trajband-a-prereg.md):
//   firstW3KillDay, firstW4SpawnDay, firstW4FightDay, firstAttemptDay,
//   divergenceDay (first differing sweep hash), peak/end rank (order
//   village 0, local 1, regional 2, national 3, global 4), ACCEL /
//   KILL-ONLY / ABSENT, muster episodes from trajSnaps shelteredList
//   (max >= 5 = MAJOR), pre/during wild-opportunity collapse (< 25% of
//   pre-episode tick-opps/day AND wild fights/day also down), end-rank
//   UNDERSTATE (peak order > end order), trajectory-SAFE (ACCEL + no
//   MUSTER-MAJOR + lever end rank >= baseline end rank).
// A seed is UNCLASSIFIED iff any required corpus field is missing/empty
// or a leg fails to run; no other outcome value exists.
'use strict';
const fs = require('fs');
const path = require('path');

const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
const HAVEN = { px: 4, py: 4 }; // shelter.js fallback (v.px ?? 4, v.py ?? 4)

function isArr(x) { return Array.isArray(x); }
function minDay(rows, pred, dayKey) {
  let best = null;
  for (const r of rows || []) {
    if (!pred(r)) continue;
    const d = r[dayKey];
    if (typeof d !== 'number' || !Number.isFinite(d)) continue;
    if (best === null || d < best) best = d;
  }
  return best;
}
function hashDay(h) {
  if (typeof h !== 'string') return null;
  const i = h.indexOf(':');
  if (i < 0) return null;
  const d = parseInt(h.slice(0, i), 10);
  return Number.isFinite(d) ? d : null;
}
function divergenceDay(B, L) {
  const n = Math.min((B.hashes || []).length, (L.hashes || []).length);
  for (let i = 0; i < n; i++) {
    if (B.hashes[i] !== L.hashes[i]) return hashDay(B.hashes[i]);
  }
  return null;
}
function peakRank(daily) {
  let best = null;
  for (const d of daily || []) {
    const o = RANK_ORDER[d.rank];
    if (o === undefined) continue;
    if (best === null || o > best.order) best = { rank: d.rank, order: o, day: d.day };
  }
  return best;
}
function loadMonsterWaves() {
  try {
    const p = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
    const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
    const m = {};
    for (const d of arr) if (d && d.id) m[d.id] = d.wave | 0;
    return m;
  } catch (e) { return null; }
}
function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }

// Muster episodes over trajSnaps in snap order. A missing snap day inside
// a run does not split it (gap <= 2 calendar days bridges); a snap day
// with an empty shelteredList closes the episode.
function musterEpisodes(snaps, waveMap) {
  const eps = [];
  let cur = null;
  const close = () => { if (cur) { eps.push(cur); cur = null; } };
  for (const s of snaps || []) {
    const n = (s.shelteredList || []).length;
    if (n > 0) {
      if (cur && s.day - cur.lastSnapDay <= 2) {
        cur.end = s.day; cur.lastSnapDay = s.day; cur.snapDays++;
        if (n > cur.max) { cur.max = n; cur.daysAtMax = 1; }
        else if (n === cur.max) cur.daysAtMax++;
      } else {
        close();
        const near = [];
        for (const m of (s.worldMonsters || [])) {
          if (typeof m.tx !== 'number' || typeof m.ty !== 'number') continue;
          if (cheb(m.tx, m.ty, HAVEN.px, HAVEN.py) > 2) continue;
          const w = waveMap ? (waveMap[m.id] !== undefined ? waveMap[m.id] : null) : null;
          if (w === null || w >= 4) near.push({ id: m.id, tx: m.tx, ty: m.ty, wave: w });
        }
        cur = { start: s.day, end: s.day, lastSnapDay: s.day, snapDays: 1, max: n, daysAtMax: 1, threatAtStart: near };
      }
    } else {
      close();
    }
  }
  close();
  for (const e of eps) { e.span = e.end - e.start + 1; delete e.lastSnapDay; }
  return eps;
}
function sumTicks(ticks, lo, hi) {
  let opps = 0, rows = 0, shelterSkipped = 0;
  for (const t of ticks || []) {
    if (t.day < lo || t.day > hi) continue;
    rows++; opps += t.opps | 0; shelterSkipped += t.shelterSkipped | 0;
  }
  return { opps, rows, shelterSkipped };
}
function countWildFights(fights, lo, hi) {
  let n = 0;
  const byMid = {};
  for (const f of fights || []) {
    if (f.day < lo || f.day > hi || f.caller !== 'wild') continue;
    n++; byMid[f.mid] = (byMid[f.mid] || 0) + 1;
  }
  return { n, byMid };
}

// Collapse test for one lever leg + its first MAJOR episode. Returns
// { state: 'PRESENT'|'ABSENT'|'N/A', ...detail }.
function collapseFor(lever, episodes, divDay) {
  const major = episodes.find((e) => e.max >= 5);
  if (!major) return { state: 'N/A', reason: 'no major episode' };
  const startA = Math.max(major.start - 30, divDay != null ? divDay : major.start - 30);
  const endA = major.start - 1;
  const lenA = Math.max(0, endA - startA + 1);
  const lenB = major.span;
  const tA = sumTicks(lever.trajTicks, startA, endA);
  const tB = sumTicks(lever.trajTicks, major.start, major.end);
  const fA = countWildFights(lever.fieldFights, startA, endA);
  const fB = countWildFights(lever.fieldFights, major.start, major.end);
  const oppsPerDayA = lenA ? tA.opps / lenA : 0;
  const oppsPerDayB = lenB ? tB.opps / lenB : 0;
  const fightsPerDayA = lenA ? fA.n / lenA : 0;
  const fightsPerDayB = lenB ? fB.n / lenB : 0;
  const shortWindow = lenA < 5 || lenB < 5;
  const zeroBase = oppsPerDayA === 0;
  let present = false;
  if (!zeroBase) present = oppsPerDayB < 0.25 * oppsPerDayA && fightsPerDayB < fightsPerDayA;
  return {
    state: present ? 'PRESENT' : 'ABSENT',
    episode: { start: major.start, end: major.end, span: major.span, max: major.max },
    windowA: { start: startA, end: endA, days: lenA, tickOpps: tA.opps, tickRows: tA.rows, wildFights: fA.n, oppsPerDay: oppsPerDayA, fightsPerDay: fightsPerDayA },
    windowB: { start: major.start, end: major.end, days: lenB, tickOpps: tB.opps, tickRows: tB.rows, shelterSkipped: tB.shelterSkipped, wildFights: fB.n, wildFightsByMid: fB.byMid, oppsPerDay: oppsPerDayB, fightsPerDay: fightsPerDayB },
    shortWindow, zeroBase,
  };
}

function classifyPair(B, L, waveMap) {
  const missing = [];
  for (const [leg, name] of [[B, 'baseline'], [L, 'lever']]) {
    if (!leg || typeof leg !== 'object') { missing.push(name + ' leg missing'); continue; }
    if (!isArr(leg.daily) || leg.daily.length === 0) missing.push(name + ' daily empty');
    if (!isArr(leg.trajSnaps) || leg.trajSnaps.length === 0) missing.push(name + ' trajSnaps empty');
    if (!isArr(leg.trajTicks) || leg.trajTicks.length === 0) missing.push(name + ' trajTicks empty');
    if (!isArr(leg.fieldFights)) missing.push(name + ' fieldFights missing');
    if (!isArr(leg.killLog)) missing.push(name + ' killLog missing');
    if (!isArr(leg.spawns)) missing.push(name + ' spawns missing');
    if (!isArr(leg.hashes) || leg.hashes.length === 0) missing.push(name + ' hashes empty');
  }
  if (B && L && B.seed !== L.seed) missing.push('seed mismatch');
  if (missing.length) {
    return { seed: (B && B.seed) != null ? B.seed : (L && L.seed), unclassified: missing.join('; '), outcome: 'UNCLASSIFIED' };
  }
  const bKill = minDay(B.killLog, (k) => k.w >= 3, 'd');
  const lKill = minDay(L.killLog, (k) => k.w >= 3, 'd');
  const bSpawn = minDay(B.spawns, (s) => s.wave === 4, 'day');
  const lSpawn = minDay(L.spawns, (s) => s.wave === 4, 'day');
  const bFight4 = minDay(B.fieldFights, (f) => f.wave === 4, 'day');
  const lFight4 = minDay(L.fieldFights, (f) => f.wave === 4, 'day');
  const lAttempt = minDay(L.fieldFights, (f) => !!f.contactFinishAttempted, 'day');
  const lAttemptKills = (L.fieldFights || []).filter((f) => !!f.contactFinishKill).map((f) => ({ day: f.day, vid: f.vid, mid: f.mid }));
  const div = divergenceDay(B, L);
  const killEarlier = lKill != null && bKill != null && lKill < bKill;
  const killEarlierVsNever = lKill != null && bKill == null;
  const spawnEarlier = lSpawn != null && (bSpawn == null || lSpawn < bSpawn);
  let accel;
  if ((killEarlier || killEarlierVsNever) && spawnEarlier) accel = 'ACCEL';
  else if (killEarlier || killEarlierVsNever) accel = 'KILL-ONLY';
  else accel = 'ABSENT';
  const killAccelDays = (bKill != null && lKill != null) ? (bKill - lKill) : null;
  const spawnAccelDays = (bSpawn != null && lSpawn != null) ? (bSpawn - lSpawn) : null;
  const bEps = musterEpisodes(B.trajSnaps, waveMap);
  const lEps = musterEpisodes(L.trajSnaps, waveMap);
  const musterClass = (eps) => {
    if (!eps.length) return 'NO-MUSTER';
    return eps.some((e) => e.max >= 5) ? 'MUSTER-MAJOR' : 'MUSTER-MINOR';
  };
  const bMuster = musterClass(bEps);
  const lMuster = musterClass(lEps);
  const collapse = collapseFor(L, lEps, div);
  const bPeak = peakRank(B.daily);
  const lPeak = peakRank(L.daily);
  const bEndRank = B.endScaleRank || (B.daily.length ? B.daily[B.daily.length - 1].rank : null);
  const lEndRank = L.endScaleRank || (L.daily.length ? L.daily[L.daily.length - 1].rank : null);
  const bEndOrder = RANK_ORDER[bEndRank] !== undefined ? RANK_ORDER[bEndRank] : null;
  const lEndOrder = RANK_ORDER[lEndRank] !== undefined ? RANK_ORDER[lEndRank] : null;
  const lUnderstate = lPeak && lEndOrder != null && lPeak.order > lEndOrder;
  const bUnderstate = bPeak && bEndOrder != null && bPeak.order > bEndOrder;
  const safe = accel === 'ACCEL' && lMuster !== 'MUSTER-MAJOR' && lEndOrder != null && bEndOrder != null && lEndOrder >= bEndOrder;
  const safeFail = [];
  if (accel !== 'ACCEL') safeFail.push('no ACCEL');
  if (lMuster === 'MUSTER-MAJOR') safeFail.push('MUSTER-MAJOR present');
  if (lEndOrder == null || bEndOrder == null || lEndOrder < bEndOrder) safeFail.push('lever end rank below baseline');
  // Neutrality: hashes identical until the lever's first attempt day.
  // Hashes are pre-daily snapshots, so divergence on/after the attempt
  // day is consistent with neutrality; divergence BEFORE it is not.
  let neutrality;
  if (lAttempt == null) neutrality = div == null ? 'HOLDS' : 'FAILS';
  else neutrality = (div == null || div >= lAttempt) ? 'HOLDS' : 'FAILS';
  const tickOpps = (X) => (X.trajTicks || []).reduce((a, t) => a + (t.opps | 0), 0);
  const wildFights = (X) => (X.fieldFights || []).filter((f) => f.caller === 'wild').length;
  const outcome = [accel, lMuster, 'COLLAPSE-' + collapse.state, lUnderstate ? 'UNDERSTATE' : 'NO-UNDERSTATE', safe ? 'SAFE' : 'NOT-SAFE'].join('/');
  return {
    seed: B.seed,
    baseline: { gameDays: B.gameDays, endReason: B.endReason, endRank: bEndRank, endOrder: bEndOrder, peakRank: bPeak ? bPeak.rank : null, peakDay: bPeak ? bPeak.day : null, understate: !!bUnderstate, firstW3KillDay: bKill, firstW4SpawnDay: bSpawn, firstW4FightDay: bFight4, muster: bMuster, episodes: bEps, tickOpps: tickOpps(B), wildFights: wildFights(B), fieldFights: (B.fieldFights || []).length, national: B.national, table: B.table, won: B.won },
    lever: { gameDays: L.gameDays, endReason: L.endReason, endRank: lEndRank, endOrder: lEndOrder, peakRank: lPeak ? lPeak.rank : null, peakDay: lPeak ? lPeak.day : null, understate: !!lUnderstate, firstW3KillDay: lKill, firstW4SpawnDay: lSpawn, firstW4FightDay: lFight4, firstAttemptDay: lAttempt, attemptKills: lAttemptKills, muster: lMuster, episodes: lEps, tickOpps: tickOpps(L), wildFights: wildFights(L), fieldFights: (L.fieldFights || []).length, national: L.national, table: L.table, won: L.won },
    divergenceDay: div,
    accel, killAccelDays, spawnAccelDays,
    collapse,
    safe, safeFail,
    neutrality,
    outcome,
    unclassified: null,
  };
}

function bandSummary(pairs) {
  const n = pairs.length;
  const classified = pairs.filter((p) => !p.unclassified);
  const count = (fn) => classified.filter(fn).length;
  return {
    seeds: n,
    classified: classified.length,
    unclassified: pairs.filter((p) => p.unclassified).map((p) => ({ seed: p.seed, reason: p.unclassified })),
    neutralityFails: classified.filter((p) => p.neutrality !== 'HOLDS').map((p) => p.seed),
    accel: count((p) => p.accel === 'ACCEL'),
    killOnly: count((p) => p.accel === 'KILL-ONLY'),
    absent: count((p) => p.accel === 'ABSENT'),
    musterMajor: count((p) => p.lever.muster === 'MUSTER-MAJOR'),
    musterMinor: count((p) => p.lever.muster === 'MUSTER-MINOR'),
    noMuster: count((p) => p.lever.muster === 'NO-MUSTER'),
    collapsePresent: count((p) => p.collapse.state === 'PRESENT'),
    leverUnderstate: count((p) => p.lever.understate),
    baselineUnderstate: count((p) => p.baseline.understate),
    safe: count((p) => p.safe),
    killAccelDays: classified.filter((p) => p.killAccelDays != null).map((p) => ({ seed: p.seed, days: p.killAccelDays })),
    spawnAccelDays: classified.filter((p) => p.spawnAccelDays != null).map((p) => ({ seed: p.seed, days: p.spawnAccelDays })),
    perSeed: pairs,
  };
}

function main() {
  const args = process.argv.slice(2);
  const waveMap = loadMonsterWaves();
  if (args[0] === '--baseline-dir') {
    const bd = args[1], ld = args[3];
    if (!bd || args[2] !== '--lever-dir' || !ld) { console.error('usage: trajband-a-analyze.js --baseline-dir <dir> --lever-dir <dir>'); process.exit(2); }
    const baseFiles = fs.readdirSync(bd).filter((f) => /^s\d+\.json$/.test(f)).sort();
    const pairs = [];
    for (const f of baseFiles) {
      const lp = path.join(ld, f);
      if (!fs.existsSync(lp)) { console.error('missing lever file for ' + f); continue; }
      pairs.push(classifyPair(JSON.parse(fs.readFileSync(path.join(bd, f), 'utf8')), JSON.parse(fs.readFileSync(lp, 'utf8')), waveMap));
    }
    console.log(JSON.stringify(bandSummary(pairs), null, 1));
    return;
  }
  const [bp, lp] = args;
  if (!bp || !lp) { console.error('usage: trajband-a-analyze.js <baseline-json> <lever-json>'); process.exit(2); }
  console.log(JSON.stringify(classifyPair(JSON.parse(fs.readFileSync(bp, 'utf8')), JSON.parse(fs.readFileSync(lp, 'utf8')), waveMap), null, 1));
}

if (require.main === module) main();
module.exports = { classifyPair, bandSummary, musterEpisodes, collapseFor, divergenceDay, peakRank, RANK_ORDER };
