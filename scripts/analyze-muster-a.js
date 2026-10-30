// analyze-muster-a — join muster snapshots to the refusalsay pilot
// population and tabulate every muster component (prereg
// evidence/2026-10-30/sim-muster-a-prereg.md).
// Usage: node scripts/analyze-muster-a.js [musterDir] [refusalsayAnalysis] [outJson]
// Defaults: evidence/2026-10-30/perseed-muster-a,
//   evidence/2026-10-30/sim-refusalsay-a-analysis.json,
//   evidence/2026-10-30/sim-muster-a-analysis.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const musterDir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-30', 'perseed-muster-a');
const refPath = process.argv[3] || path.join(REPO, 'evidence', '2026-10-30', 'sim-refusalsay-a-analysis.json');
const outPath = process.argv[4] || path.join(REPO, 'evidence', '2026-10-30', 'sim-muster-a-analysis.json');

function dist(arr, key) {
  const d = {};
  for (const v of arr) { const k = String(v[key]); d[k] = (d[k] || 0) + 1; }
  return d;
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const ref = JSON.parse(fs.readFileSync(refPath, 'utf8'));
const pilotSeeds = ref.base.seeds;
const refPerSeed = ref.base.dissolvedPerSeed;
const refRowsBySeed = {};
for (const r of ref.probeRows) { (refRowsBySeed[r.seed] = refRowsBySeed[r.seed] || []).push(r); }

const perSeed = {};
let allSnaps = [];
let wall = { won: 0, nationalEver: 0, nationalFinal: 0, tableReached: 0, tableEntered: 0,
  waveReach: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, days: [], deaths: 0 };
for (const seed of pilotSeeds) {
  const mp = path.join(musterDir, `muster-s${seed}.json`);
  const fp = path.join(musterDir, `s${seed}-fresh.json`);
  const cp = path.join(musterDir, `census-s${seed}.json`);
  const entry = { seed, musterFile: fs.existsSync(mp), freshFile: fs.existsSync(fp), censusFile: fs.existsSync(cp) };
  if (entry.musterFile) {
    const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
    entry.diag = m.diag;
    entry.calls = m.callTotals;
    entry.commitReturns = m.commitReturns;
    entry.refusals = m.refusals.length;
    entry.endHeraldMuster = m.endHeraldMuster;
    entry.endHeraldOmen = m.endHeraldOmen;
    entry.endHeraldOutcomes = (m.endHeraldOutcomes || []).length;
    entry.snaps = m.refusals;
    allSnaps = allSnaps.concat(m.refusals.map(s => Object.assign({ seed: seed }, s)));
  } else { entry.refusals = null; entry.snaps = []; }
  entry.refusalsayDissolved = refPerSeed[String(seed)];
  entry.countMatch = (entry.refusals === entry.refusalsayDissolved);
  // Day multiset match vs refusalsay probe rows on this seed.
  const refDays = (refRowsBySeed[seed] || []).map(r => r.dayStart).sort((a, b) => a - b);
  const myDays = (entry.snaps || []).map(s => s.day).sort((a, b) => a - b);
  entry.dayMatch = JSON.stringify(refDays) === JSON.stringify(myDays);
  entry.refDays = refDays;
  entry.myDays = myDays;
  if (entry.freshFile) {
    const row = JSON.parse(fs.readFileSync(fp, 'utf8'));
    entry.fresh = { days: row.days, endReason: row.endReason, won: row.won, waveReach: row.waveReach,
      finalRank: row.finalRank, maxRank: row.maxRank, nationalEver: row.nationalEver,
      nationalFinal: row.nationalFinal, table: row.table, entered: row.entered, deathTotal: row.deathTotal };
    wall.won += row.won ? 1 : 0;
    wall.nationalEver += row.nationalEver ? 1 : 0;
    wall.nationalFinal += row.nationalFinal ? 1 : 0;
    wall.tableReached += row.table ? 1 : 0;
    wall.tableEntered += row.entered ? 1 : 0;
    for (let w = 1; w <= 5; w++) if ((row.waveReach || 1) >= w) wall.waveReach[w]++;
    wall.days.push(row.days);
    wall.deaths += row.deathTotal || 0;
  }
  if (entry.censusFile) {
    const cen = JSON.parse(fs.readFileSync(cp, 'utf8'));
    const days = (cen.snapshots || []).map(s => s.day);
    const sorted = days.every((d, i) => i === 0 || d >= days[i - 1]);
    entry.census = { n: days.length, sorted: sorted, lastDay: days.length ? days[days.length - 1] : null };
    entry.censusLastWithin1 = (entry.fresh && days.length) ? Math.abs(days[days.length - 1] - entry.fresh.days) <= 1 : null;
  }
  perSeed[seed] = entry;
}
wall.medianDays = medianOf(wall.days);
wall.daysSorted = wall.days.slice().sort((a, b) => a - b);

const n = allSnaps.length;
const complete = allSnaps.filter(s => s.have != null && s.need != null && s.musterExists != null &&
  s.alliesRaw != null && s.alliesUnique != null && s.havenValid != null && s.linksActive != null &&
  s.callYield != null && s.omenStage !== undefined && s.callsSoFar != null && s.readyManual != null);
const comp = {
  total: n, complete: complete.length, attribution: n ? complete.length / n : 0,
  musterExists: dist(allSnaps, 'musterExists'),
  alliesRaw: dist(allSnaps, 'alliesRaw'),
  alliesUnique: dist(allSnaps, 'alliesUnique'),
  havenValid: dist(allSnaps, 'havenValid'),
  linksActive: dist(allSnaps, 'linksActive'),
  callYield: dist(allSnaps, 'callYield'),
  omenStage: dist(allSnaps, 'omenStage'),
  callOffered: dist(allSnaps, 'callOffered'),
  commitOffered: dist(allSnaps, 'commitOffered'),
  readyManual: dist(allSnaps, 'readyManual'),
  readyGame: dist(allSnaps, 'readyGame'),
  volunteers: dist(allSnaps, 'volunteers'),
  have: dist(allSnaps, 'have'),
  need: dist(allSnaps, 'need'),
};
// Per-link aggregate + refusal-reason breakdown.
let linkRows = [];
for (const s of allSnaps) for (const l of (s.links || [])) linkRows.push(Object.assign({ snapSeed: s.seed, snapDay: s.day }, l));
const linkAgg = {
  totalLinks: linkRows.length,
  refused: linkRows.filter(l => l.wouldRefuse).length,
  refusedByTrust: linkRows.filter(l => l.trust < 25).length,
  refusedByOpinion: linkRows.filter(l => l.opinion < -10).length,
  refusedByArrears: linkRows.filter(l => l.arrears > 0).length,
  quota: dist(linkRows, 'quota'),
  facesFree: dist(linkRows, 'facesFree'),
  wouldYield: dist(linkRows, 'wouldYield'),
  trustValues: dist(linkRows, 'trust'),
};
// Call totals summed across seeds.
const callTotals = { soundTitanCall: 0, titanCommitOwn: 0, titanSelfDo: 0, titanWarCouncil: 0 };
const callByKey = { soundTitanCall: {}, titanCommitOwn: {}, titanSelfDo: {}, titanWarCouncil: {} };
for (const seed of pilotSeeds) {
  const e = perSeed[seed];
  if (!e.musterFile) continue;
  const m = JSON.parse(fs.readFileSync(path.join(musterDir, `muster-s${seed}.json`), 'utf8'));
  for (const v of Object.keys(callTotals)) {
    callTotals[v] += (m.callTotals && m.callTotals[v]) || 0;
    Object.assign(callByKey[v], m.calls ? m.calls[v] : {});
  }
}
// Zero-candidate counts: how many snapshots each candidate blocks.
const zeroCandidates = {
  noCallAttempted: allSnaps.filter(s => (s.callsSoFar.soundTitanCall || 0) === 0 && (s.callsSoFar.titanCommitOwn || 0) === 0 && (s.callsSoFar.titanSelfDo || 0) === 0).length,
  musterAbsent: allSnaps.filter(s => !s.musterExists).length,
  alliesRawZero: allSnaps.filter(s => s.alliesRaw === 0).length,
  havenZero: allSnaps.filter(s => s.havenValid === 0).length,
  noActiveLinks: allSnaps.filter(s => s.linksActive === 0).length,
  callYieldZero: allSnaps.filter(s => s.callYield === 0).length,
  callYieldLtNeed: allSnaps.filter(s => s.callYield < 10).length,
  omenBelow2: allSnaps.filter(s => s.omenStage == null || s.omenStage < 2).length,
  callNotOffered: allSnaps.filter(s => !s.callOffered).length,
  readyFalse: allSnaps.filter(s => !s.readyManual).length,
  readyGameMismatch: allSnaps.filter(s => s.readyGame !== s.readyManual).length,
};

const out = { perSeed, totalSnapshots: n, components: comp, linkAgg, callTotals, callByKey,
  zeroCandidates, wall, refusalsayPilotWall: ref.base.wall || null,
  refusalsayDissolvedTotal: ref.base.dissolvedTotal };
fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
console.log('seeds:', pilotSeeds.join(','));
console.log('snapshots:', n, 'complete:', complete.length, 'attribution:', (n ? (complete.length / n).toFixed(4) : 'n/a'));
console.log('per-seed countMatch:', pilotSeeds.map(s => s + ':' + perSeed[s].countMatch).join(' '));
console.log('per-seed dayMatch:', pilotSeeds.map(s => s + ':' + perSeed[s].dayMatch).join(' '));
console.log('callTotals:', JSON.stringify(callTotals));
console.log('zeroCandidates:', JSON.stringify(zeroCandidates));
console.log('components.musterExists:', JSON.stringify(comp.musterExists));
console.log('components.alliesRaw:', JSON.stringify(comp.alliesRaw));
console.log('components.havenValid:', JSON.stringify(comp.havenValid));
console.log('components.linksActive:', JSON.stringify(comp.linksActive));
console.log('components.callYield:', JSON.stringify(comp.callYield));
console.log('components.omenStage:', JSON.stringify(comp.omenStage));
console.log('components.callOffered:', JSON.stringify(comp.callOffered));
console.log('linkAgg:', JSON.stringify({ total: linkAgg.totalLinks, refused: linkAgg.refused,
  byTrust: linkAgg.refusedByTrust, byOpinion: linkAgg.refusedByOpinion, byArrears: linkAgg.refusedByArrears,
  quota: linkAgg.quota, facesFree: linkAgg.facesFree, wouldYield: linkAgg.wouldYield }));
console.log('wall:', JSON.stringify(wall));
console.log('wrote', outPath);
