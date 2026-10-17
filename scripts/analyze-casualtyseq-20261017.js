#!/usr/bin/env node
'use strict';
// analyze-casualtyseq-20261017.js — census analysis for the sim-casualtyseq
// diagnostic (flesh-out loop arm, scale-onramp axis, 2026-10-17).
//
// Reads evidence/2026-10-17/perseed-casualtyseq/*.json and answers the
// pre-registered questions:
//   PRIMARY (diagnostic GO): >=90% of post-wave-4-unlock villager deaths
//     attributed to a source system. (NO-COVERAGE when nothing unlocked.)
//   Secondaries: median inter-death interval; trajectory shape (sprint vs
//     siege); share of deaths in the first 10d post-unlock; death clusters
//     and their overlap with wave-5-contacted days.
// Plus: the unlock-rate finding (the readiness gate's veterans bar) and the
// full pre-unlock death census (what kills villages that never unlock).
//
// Usage: node scripts/analyze-casualtyseq-20261017.js
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-casualtyseq');

function median(xs) {
  const s = (xs || []).filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

console.log(`=== sim-casualtyseq census — ${runs.length} runs ===\n`);

// --- unlock rate ---
const unlocked = runs.filter(r => r.unlockDay != null);
console.log(`wave-4 unlocks: ${unlocked.length}/${runs.length}`);
const byPolicy = {};
for (const r of runs) {
  byPolicy[r.policyId] = byPolicy[r.policyId] || { n: 0, u: 0 };
  byPolicy[r.policyId].n++;
  if (r.unlockDay != null) byPolicy[r.policyId].u++;
}
for (const [p, v] of Object.entries(byPolicy)) console.log(`  ${p}: ${v.u}/${v.n} unlocked`);
console.log(`  unlock days: ${unlocked.map(r => r.unlockDay).sort((a,b)=>a-b).join(', ') || '—'}`);
console.log(`  median survival: ${median(runs.map(r => r.days))}d (max ${Math.max(...runs.map(r => r.days))}d)`);
console.log(`  endReasons: ${JSON.stringify(runs.reduce((m, r) => { m[r.endReason] = (m[r.endReason] || 0) + 1; return m; }, {}))}`);
console.log(`  national: ${runs.filter(r => r.national).length}/${runs.length}, table invites: ${runs.filter(r => r.table).length}/${runs.length}, wins: ${runs.filter(r => r.wins).length}/${runs.length}, wave5: ${runs.filter(r => r.wave5Day != null).length}/${runs.length}`);

// --- PRIMARY: post-unlock attribution ---
const postDeaths = [];
for (const r of runs) for (const d of (r.deaths || [])) postDeaths.push(d);
const attributed = postDeaths.filter(d => d.src !== 'unattributed').length;
const attrRate = postDeaths.length ? attributed / postDeaths.length : null;
console.log(`\n--- PRIMARY (diagnostic GO: >=90% of post-unlock villager deaths attributed) ---`);
console.log(`post-unlock villager deaths: ${postDeaths.length}`);
if (postDeaths.length) {
  console.log(`attributed: ${attributed}/${postDeaths.length} = ${(attrRate * 100).toFixed(1)}%`);
  const shares = {};
  for (const d of postDeaths) shares[d.src] = (shares[d.src] || 0) + 1;
  console.log(`source shares: ${JSON.stringify(shares)}`);
  console.log(`VERDICT: ${attrRate >= 0.9 ? 'GO — the casualty sequence is measured' : 'MISS — instrument/substrate gap'}`);
} else {
  console.log(`VERDICT: NO-COVERAGE — no post-unlock deaths exist (0/${runs.length} wave-4 unlocks). Not a vacuous GO.`);
}

// --- secondaries (only meaningful with unlocks) ---
if (unlocked.length) {
  const allIntervals = [];
  for (const r of unlocked) allIntervals.push(...(r.intervals || []));
  console.log(`\n--- secondaries ---`);
  console.log(`median inter-death interval: ${median(allIntervals)}d (n=${allIntervals.length})`);
  const sameDay = allIntervals.filter(i => i === 0).length;
  console.log(`same-day (0d) intervals: ${sameDay}/${allIntervals.length}`);
  let f10n = 0, f10d = 0;
  for (const r of unlocked) {
    const n = (r.deaths || []).length;
    if (r.first10dShare != null) { f10n += r.first10dShare * n; f10d += n; }
  }
  console.log(`share of deaths in first 10d post-unlock: ${f10d ? (f10n / f10d * 100).toFixed(1) + '%' : '—'} (n=${f10d})`);
  let nCl = 0;
  for (const r of unlocked) nCl += (r.clusters || []).length;
  console.log(`death clusters (>=3 deaths / 7d): ${nCl} across ${unlocked.length} unlocking runs`);
  const w5runs = unlocked.filter(r => r.wave5Day != null);
  console.log(`unlocking runs with wave-5 contact: ${w5runs.length}/${unlocked.length}`);
}

// --- the no-unlock finding: full death census (confirm runs carry allDeaths) ---
const allD = [];
for (const r of runs) for (const d of (r.allDeaths || [])) allD.push(d);
console.log(`\n--- full villager death census (${allD.length} deaths, runs with allDeaths persisted) ---`);
if (allD.length) {
  const fam = {}, src = {};
  for (const d of allD) {
    fam[d.family || 'null'] = (fam[d.family || 'null'] || 0) + 1;
    src[d.src] = (src[d.src] || 0) + 1;
  }
  console.log(`by family: ${JSON.stringify(fam)}`);
  console.log(`by source: ${JSON.stringify(src)}`);
  const scholarDeaths = runs.reduce((m, r) => m + (r.scholarDeaths || 0), 0);
  console.log(`scholar deaths: ${scholarDeaths}`);
} else {
  console.log(`(no runs with the full census yet — pilot code persisted post-unlock deaths only)`);
}

// --- roster trajectories (no-unlock runs: what the village looked like) ---
console.log(`\n--- roster at end ---`);
const endLiving = runs.map(r => {
  const t = r.trajectory && r.trajectory.daily;
  return t && t.length ? t[t.length - 1].living : null;
}).filter(x => x != null);
console.log(`median living at end: ${median(endLiving)} (n=${endLiving.length})`);
const n0s = runs.map(r => r.trajectory && r.trajectory.n0).filter(x => x != null);
console.log(`median roster at day 1: ${median(n0s)}`);

console.log(`\nAnalysis complete.`);
