#!/usr/bin/env node
// analyze-childbirth-b.js — aggregate the sim-childbirth-b corpus and
// judge the pre-registered GO bar (evidence/2026-10-28/
// sim-childbirth-b-prereg.md). Read-only: never modifies the corpus.
// Usage: node scripts/analyze-childbirth-b.js [corpusDir]
// Exit 0 when the corpus is complete and the verdict is computed
// (GO or DIAG-NO-GO are both computed verdicts, not failures);
// exit 2 when the corpus is incomplete or a file is invalid.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(
  __dirname, '..', 'evidence', '2026-10-28', 'sim-childbirth-b-corpus');
const EXPECTED = [10410, 10411, 10412, 10413, 10414, 10415, 10416, 10417];
const rows = [];
const missing = [];
for (const seed of EXPECTED) {
  const f = path.join(DIR, `childbirth-b-competent-nofeast-s${seed}.json`);
  if (!fs.existsSync(f)) { missing.push(seed); continue; }
  try { rows.push(JSON.parse(fs.readFileSync(f, 'utf8'))); }
  catch (e) { console.error('INVALID ' + f + ': ' + e.message); process.exit(2); }
}
if (missing.length) {
  console.error('INCOMPLETE corpus: missing seeds ' + missing.join(','));
  process.exit(2);
}
const sum = (fn) => rows.reduce((a, r) => a + fn(r), 0);
const median = (arr) => {
  const s = arr.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};
const homeChildrenStart = sum(r => (r.census.children || []).length);
const homeChildrenEnd = sum(r => (r.censusEnd.children || []).length);
const homeChildrenWithPos = sum(r => (r.censusEnd.childrenWithPositions || 0));
const distantVillages = sum(r => (r.distant || []).length);
const distantChildren = sum(r => (r.distant || []).reduce((a, d) => a + d.children, 0));
const distantBirths = sum(r => (r.distant || []).reduce((a, d) => a + d.births, 0));
const distantDaysMax = Math.max(0, ...rows.flatMap(r => (r.distant || []).map(d => d.day || 0)));
const childCalls = sum(r => r.childCalls || 0);
const childRecords = sum(r => r.childRecordCount || 0);
const daysAlive = rows.map(r => r.daysAlive);
const villageDays = sum(r => r.daysAlive || 0);
const national = rows.filter(r => r.national).length;
const table = rows.filter(r => r.table).length;
const wins = rows.filter(r => r.win).length;
const waveMax = Math.max(0, ...rows.map(r => (r.waveReach || []).length));
const wave4 = rows.filter(r => (r.waveReach || []).includes(4)).length;
const wave5 = rows.filter(r => (r.waveReach || []).includes(5)).length;
const deathCauses = {};
for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) deathCauses[k] = (deathCauses[k] || 0) + v;
const birthLines = rows.flatMap(r => (r.distant || []).flatMap(d => (d.birthLines || []).map(l => ({ seed: r.seed, village: d.name, line: l }))));
const g1 = childRecords >= 1;
const g2 = g1 && rows.some(r => (r.childRecordCount || 0) >= 1 && (r.censusEnd.childrenWithPositions || 0) >= 1);
const verdict = (g1 && g2) ? 'GO' : 'DIAG-NO-GO';
console.log(JSON.stringify({
  seeds: EXPECTED.length, verdict, G1_unscriptedChildEatRecords: childRecords,
  G2_recordOnSeedWithPositionedHomeChild: g2,
  homeChildrenStart, homeChildrenEnd, homeChildrenWithPos,
  distantVillagesGenerated: distantVillages, distantChildren, distantBirths,
  distantMaxVillageDay: distantDaysMax, childCalls,
  daysAlive, villageDays, medianSurvival: median(daysAlive),
  national, table, wins, waveMax, wave4, wave5, deathCauses,
  birthLines: birthLines.slice(0, 10),
}, null, 2));
for (const r of rows) {
  console.log(`seed=${r.seed} days=${r.daysAlive} end=${r.endReason} rank=${r.rank} wave=${(r.waveReach || []).length} deaths=${r.deaths} homeChildEnd=${(r.censusEnd.children || []).length} distantV=${(r.distant || []).length} distantChild=${(r.distant || []).reduce((a, d) => a + d.children, 0)} distantBirths=${(r.distant || []).reduce((a, d) => a + d.births, 0)} childCalls=${r.childCalls} childRecords=${r.childRecordCount}`);
}
