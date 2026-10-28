#!/usr/bin/env node
// analyze-homebirth-b.js — judge the sim-homebirth-b pilot corpus against
// its prereg (evidence/2026-10-28/sim-homebirth-b-prereg.md).
// Usage: node scripts/analyze-homebirth-b.js [corpusDir]
// Exit 0 on QUESTION-ANSWERED, 1 on INCONCLUSIVE, 2 on corpus unreadable.
// Deterministic on a frozen corpus: re-running must print the same verdict.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-homebirth-b-corpus');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('NO CORPUS FILES in ' + dir); process.exit(2); }
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const byPolicy = {};
for (const r of rows) (byPolicy[r.policy] = byPolicy[r.policy] || []).push(r);
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
let q1 = true, q2 = true, q3 = true, q4 = true;
const problems = [];
for (const r of rows) {
  const need = ['census', 'censusEnd', 'joiners', 'leavers', 'distant', 'deathCauses'];
  for (const k of need) if (r[k] === undefined) { q1 = false; problems.push(`seed ${r.seed} ${r.policy}: missing ${k}`); }
  if (!Array.isArray(r.joiners) || !Array.isArray(r.leavers)) { q1 = false; problems.push(`seed ${r.seed} ${r.policy}: roster diff not arrays`); }
  if (typeof r.homeChildrenStart !== 'number' || typeof r.homeChildrenEnd !== 'number') { q2 = false; problems.push(`seed ${r.seed} ${r.policy}: homeChild count not numeric`); }
  if (Array.isArray(r.joiners)) for (const j of r.joiners) {
    if (!['adult', 'child', 'unknown'].includes(j.cls)) { q3 = false; problems.push(`seed ${r.seed} ${r.policy}: joiner ${j.id} unclassified`); }
  }
  if (typeof r.maxScholarDay !== 'number' || typeof r.maxDistantDay !== 'number' || !Array.isArray(r.birthLines)) { q4 = false; problems.push(`seed ${r.seed} ${r.policy}: gate fields incomplete`); }
}
const expected = 16;
if (rows.length !== expected) { q1 = false; problems.push(`corpus has ${rows.length} files, expected ${expected} (8 seeds x 2 policies)`); }
for (const [pol, rs] of Object.entries(byPolicy)) {
  console.log(`\n== ${pol} (${rs.length} seeds) ==`);
  console.log('seed days end homeCh(start/end) joiners(adult/child/unk) leavers distVil distCh distBirth maxDay birthLines nat/tab/win wave arc');
  for (const r of rs.sort((a, b) => a.seed - b.seed)) {
    const j = r.joiners || [];
    console.log(`${r.seed} ${r.daysAlive} ${r.endReason} ${r.homeChildrenStart}/${r.homeChildrenEnd} ${j.length}(${j.filter(x => x.cls === 'adult').length}/${j.filter(x => x.cls === 'child').length}/${j.filter(x => x.cls === 'unknown').length}) ${(r.leavers || []).length} ${r.distantVillages} ${r.distantChildren} ${r.distantBirths} ${Math.max(r.maxScholarDay || 0, r.maxDistantDay || 0)} ${r.birthLines.length} ${r.national ? 1 : 0}/${r.table ? 1 : 0}/${r.win ? 1 : 0} ${r.maxWave} ${r.arc}`);
  }
  const tot = k => rs.reduce((a, r) => a + (r[k] || 0), 0);
  const joiners = rs.flatMap(r => r.joiners || []);
  const deaths = {};
  for (const r of rs) for (const [c, n] of Object.entries(r.deathCauses || {})) deaths[c] = (deaths[c] || 0) + n;
  console.log(`POOLED: homeChildren ${tot('homeChildrenStart')}/${tot('homeChildrenEnd')} joiners ${joiners.length} (adult ${joiners.filter(j => j.cls === 'adult').length} child ${joiners.filter(j => j.cls === 'child').length} unknown ${joiners.filter(j => j.cls === 'unknown').length}) leavers ${tot('leavers')} distantVillages ${tot('distantVillages')} distantChildren ${tot('distantChildren')} distantBirths ${tot('distantBirths')} birthLines ${rs.reduce((a, r) => a + r.birthLines.length, 0)} gateReached ${rs.filter(r => r.gateReached).length}/${rs.length} national ${tot('national')} table ${tot('table')} wins ${tot('win')} wave4 ${rs.filter(r => r.maxWave >= 4).length} wave5 ${rs.filter(r => r.maxWave >= 5).length} medianSurv ${median(rs.map(r => r.daysAlive))} maxSurv ${Math.max(...rs.map(r => r.daysAlive))}`);
  console.log('deaths: ' + JSON.stringify(deaths));
  console.log('arrival cross-check (arrivedDay joiners / all joiners): ' + rs.reduce((a, r) => a + (r.arrivedJoiners || 0), 0) + '/' + joiners.length);
}
console.log('\n== JUDGEMENT ==');
console.log(`Q1 corpus complete: ${q1}, Q2 homeChild exact: ${q2}, Q3 joiners classified: ${q3}, Q4 gate classified: ${q4}`);
if (problems.length) console.log('problems:\n- ' + problems.join('\n- '));
const answered = q1 && q2 && q3 && q4;
console.log('VERDICT: ' + (answered ? 'QUESTION-ANSWERED' : 'INCONCLUSIVE'));
const anyChild = rows.some(r => (r.homeChildrenEnd || 0) > 0 || (r.joiners || []).some(j => j.cls === 'child'));
const anyBirthLine = rows.some(r => (r.birthLines || []).length > 0);
console.log(`confirm trigger: homeChild-or-childJoiner=${anyChild} birthLine=${anyBirthLine} -> confirm ${anyChild || anyBirthLine ? 'REQUIRED (12-16 fresh seeds)' : 'NOT SPENT (all-zero structural result)'}`);
process.exit(answered ? 0 : 1);
