#!/usr/bin/env node
// analyze-tableaudit-20261021.js — judge the r35 PRIMARY (binding).
// Reads evidence/2026-10-21/perseed-tableaudit/tableaudit-r35-*.json and
// reports, per seed: whether the village sat with w4/w5 deeds, whether the
// seated audit named them, and the walked door/branch. Exit 0 = verdict
// line; exit 1 = NO-GO (a silent audit).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-tableaudit');
const files = fs.readdirSync(DIR).filter(f => /^tableaudit-r35-\d+\.json$/.test(f));
if (!files.length) { console.error('no seed JSONs'); process.exit(2); }
let bound = 0, boundSilent = 0, sat = 0, won = 0;
const rows = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const w = r.satWaves || {};
  const w45 = (w.w4 | 0) + (w.w5 | 0);
  let v;
  if (r.satDay == null) { v = 'no-sat'; }
  else {
    sat++;
    if (r.won) won++;
    // BINDING scope: lesser seats with w4/w5 deeds (the r34 blank was the
    // lesser line). Full seats are report-only ("every wave faced" covers).
    if (w45 > 0 && r.satSeatKind === 'lesser') {
      bound++;
      v = r.auditNamed ? 'named-GO' : 'SILENT-NOGO';
      if (!r.auditNamed) boundSilent++;
    } else if (w45 > 0) {
      v = r.auditNamed ? `full-seat covered ("every wave faced")` : `full-seat UNCOVERED?`;
      if (!r.auditNamed) boundSilent++;
    } else v = 'no-w4w5 (audit clean by vacuity)';
  }
  rows.push(`seed ${r.seed}: ${v} — sat d${r.satDay} ${r.satSeatKind} w=${JSON.stringify(w)} path=${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} end=${r.endReason}`);
}
console.log(rows.join('\n'));
console.log(`\nPRIMARY: ${bound} bound seeds, ${boundSilent} silent audits, ${sat} sits, ${won} wins`);
if (boundSilent > 0) { console.log('VERDICT: NO-GO (§14 — a silent tier-equivalent audit)'); process.exit(1); }
console.log('VERDICT: GO');
