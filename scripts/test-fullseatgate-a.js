#!/usr/bin/env node
// scripts/test-fullseatgate-a.js — proof validator for sim-fullseatgate-a.
// Reads evidence/2026-10-27/perseed-fullseatgate-a/summary.json (rows
// embedded) and checks the prereg's proof gates. Exit 0 = ALL PROOFS
// PASS; exit 1 = any gate failure (a failed gate is a loud failure,
// never a verdict input — the verdict lives in the evidence, judged
// against the prereg, from the same counts recomputed here).
//
// G1 corpus integrity: 8/8 rows, days > 0, gate + deedEnd present,
//   entry snapshot present iff table==1, entered snapshot iff entered==1.
// G2 deed identity: on every entry/entered/end snapshot AND every daily
//   deed tuple, ok == (barsOnly && scale), barsOnly recomputed from the
//   snapshot's own fields. A scale-false 'full' seat at end is a failure.
// G3 deed agreement: deed w4 faced count == waveEngaged(4) at end;
//   deed w-counts never exceed the wavesFaced-derived counts.
// G4 recount: the AUDIT-GO counting (entry split + end split + lesser
//   split) recomputed from rows equals summary.fullseatgate.
// Usage: node scripts/test-fullseatgate-a.js [evidDir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.argv[2] || path.join(REPO, 'evidence', '2026-10-27', 'perseed-fullseatgate-a');

let failures = 0, checks = 0;
function check(name, ok, detail) {
  checks++;
  if (!ok) { failures++; console.log(`  FAIL ${name}: ${detail}`); }
  else console.log(`  ok ${name}: ${detail}`);
}
function barsOnlyOf(d) {
  return !!(d && d.waves && d.contests && d.crises && d.stageOk && d.foodDeeds);
}
function tupleBarsOnly(t) {
  // Daily deed tuple: [w1,w2,w3,w4,w5,contestsN,crisesN,stage,food,scale,ok].
  if (!t) return null;
  const waves = t[0] >= 5 && t[1] >= 5 && t[2] >= 4 && t[3] >= 3 && t[4] >= 2;
  const contests = t[5] >= 3, crises = t[6] >= 3, stageOk = t[7] >= 2, food = t[8] === 1;
  return { barsOnly: waves && contests && crises && stageOk && food, scale: t[9] === 1, ok: t[10] === 1 };
}

const summaryPath = path.join(EVID, 'summary.json');
if (!fs.existsSync(summaryPath)) { console.log('FAIL: summary.json missing: ' + summaryPath); process.exit(1); }
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const rows = summary.rows || [];
console.log(`=== fullseatgate validator: ${EVID} ===`);

// G1
check('G1 rows', rows.length === 8, `n=${rows.length}`);
for (const r of rows) {
  check(`G1 row s${r.seed} days`, (r.days | 0) > 0, `days=${r.days}`);
  check(`G1 row s${r.seed} gate+deedEnd`, !!(r.gate && r.gate.deedEnd), `deedEnd=${r.gate && r.gate.deedEnd ? 'present' : 'MISSING'}`);
  check(`G1 row s${r.seed} entry snap`, (r.table ? 1 : 0) === (r.entryDeedSnap ? 1 : 0),
    `table=${r.table} entrySnap=${r.entryDeedSnap ? 'day ' + r.entryDeedSnap.day : 'absent'}`);
  check(`G1 row s${r.seed} entered snap`, (r.entered ? 1 : 0) === (r.enteredDeedSnap ? 1 : 0),
    `entered=${r.entered} enteredSnap=${r.enteredDeedSnap ? 'day ' + r.enteredDeedSnap.day : 'absent'}`);
}

// G2: snapshots + daily tuples
let snapCount = 0, tupleCount = 0, tupleBad = 0;
for (const r of rows) {
  for (const [label, holder] of [['entry', r.entryDeedSnap], ['entered', r.enteredDeedSnap]]) {
    if (!holder || !holder.deed) continue;
    const d = holder.deed;
    snapCount++;
    check(`G2 s${r.seed} ${label} identity`, d.ok === (barsOnlyOf(d) && !!d.scale),
      `ok=${d.ok} barsOnly=${barsOnlyOf(d)} scale=${d.scale} stage=${d.stage} stageOk=${d.stageOk} rank=${d.rank}`);
  }
  const de = r.gate && r.gate.deedEnd;
  if (de) {
    snapCount++;
    check(`G2 s${r.seed} end identity`, de.ok === (barsOnlyOf(de) && !!de.scale),
      `ok=${de.ok} barsOnly=${barsOnlyOf(de)} scale=${de.scale} stage=${de.stage} stageOk=${de.stageOk} rank=${de.rank}`);
    if (r.tableState && r.tableState.seat === 'full' && !de.scale) {
      check(`G2 s${r.seed} full seat has scale`, false, 'seat=full with scale=false');
    }
  }
  for (const d of (r.daily || [])) {
    if (!d.deed) continue;
    tupleCount++;
    const t = tupleBarsOnly(d.deed);
    if (t.ok !== (t.barsOnly && t.scale)) { tupleBad++; }
  }
}
check('G2 daily tuples identity', tupleBad === 0, `${tupleCount} tuples, ${tupleBad} mismatches`);
check('G2 snapshot count', snapCount > 0, `${snapCount} entry/entered/end snapshots checked`);

// G3
for (const r of rows) {
  const de = r.gate && r.gate.deedEnd;
  const faced = (r.gate && r.gate.wavesFaced) || {};
  if (de) {
    check(`G3 s${r.seed} deed w4 == waveEngaged(4)`, de.w4 === r.gate.w4faced,
      `deed w4=${de.w4} waveEngaged(4)=${r.gate.w4faced}`);
    // gate.wavesFaced is ALREADY counts-per-wave (the sweep's
    // wavesFacedCounts counted the mid->wave map once); comparing it
    // as a mid->wave map again double-counts (the trap the w5twokey
    // validator note warns about). Compare directly.
    check(`G3 s${r.seed} deed counts == wavesFaced counts`,
      de.w1 === (faced[1] || 0) && de.w2 === (faced[2] || 0) && de.w3 === (faced[3] || 0) && de.w4 === (faced[4] || 0) && de.w5 === (faced[5] || 0),
      `deed=${de.w1}/${de.w2}/${de.w3}/${de.w4}/${de.w5} faced=${faced[1] || 0}/${faced[2] || 0}/${faced[3] || 0}/${faced[4] || 0}/${faced[5] || 0}`);
  }
}

// G4: recount from rows vs summary.fullseatgate
const fg = summary.fullseatgate || {};
const rec = { entry: { invited: 0, entrySnapPresent: 0, eligible: 0, blocked: 0, pass: 0 },
  end: { tableReaching: 0, endSnapPresent: 0, eligible: 0, blocked: 0, pass: 0 },
  lesser: 0, full: 0 };
for (const r of rows) {
  const e = r.entryDeedSnap && r.entryDeedSnap.deed;
  const de = r.gate && r.gate.deedEnd;
  if (r.table) {
    rec.entry.invited++; rec.end.tableReaching++;
    if (e) { rec.entry.entrySnapPresent++; if (barsOnlyOf(e)) { rec.entry.eligible++; if (e.scale) rec.entry.pass++; else rec.entry.blocked++; } }
    if (de) { rec.end.endSnapPresent++; if (barsOnlyOf(de)) { rec.end.eligible++; if (de.scale) rec.end.pass++; else rec.end.blocked++; } }
  }
  if (r.tableState && r.tableState.seat === 'lesser') rec.lesser++;
  if (r.tableState && r.tableState.seat === 'full') rec.full++;
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
check('G4 entry recount', eq(rec.entry, fg.entry), `rec=${JSON.stringify(rec.entry)} sum=${JSON.stringify(fg.entry)}`);
check('G4 end recount', eq(rec.end, fg.end), `rec=${JSON.stringify(rec.end)} sum=${JSON.stringify(fg.end)}`);
check('G4 lesser/full recount', rec.lesser === fg.lesser && rec.full === fg.full,
  `rec lesser=${rec.lesser} full=${rec.full} sum lesser=${fg.lesser} full=${fg.full}`);
check('G4 verdict candidate', fg.verdictCandidate === summary.verdictCandidate,
  `fg=${fg.verdictCandidate} summary=${summary.verdictCandidate}`);

console.log(`\n${failures === 0 ? 'ALL PROOFS PASS' : 'PROOF FAILURES: ' + failures} (${checks} checks)`);
process.exit(failures === 0 ? 0 : 1);
