#!/usr/bin/env node
// analyze-tableaudit-r37-20261022.js — judge the r37 PRIMARY (binding).
// Reads evidence/2026-10-22/perseed-tableaudit-r37/tableaudit-r37-*.json and
// reports, per seed:
//   (a) the r37 extension: satPenalty {tier,losses,penalty} + maxTier are
//       present on every sat seed, and satPenalty matches the transcript's
//       voiced "Every door's standing −M" line (table.js:717 voices the same
//       overtimeStanding() stores the probe reads);
//   (b) the r35 regression: the seated audit names nonzero w4/w5 deeds.
// Exit 1 = NO-GO (a silent audit, a missing/inconsistent overtime record).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-tableaudit-r37');
const files = fs.readdirSync(DIR).filter(f => /^tableaudit-r37-\d+\.json$/.test(f));
if (!files.length) { console.error('no seed JSONs'); process.exit(2); }
let bound = 0, boundSilent = 0, sat = 0, won = 0;
let otPresent = 0, otSat = 0, otMismatch = 0;
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
    otSat++;
    // (a) overtime extension: fields present?
    const sp = r.satPenalty, mt = r.maxTier;
    const fieldsOk = sp && typeof sp === 'object'
      && Number.isFinite(sp.tier) && Number.isFinite(sp.losses) && Number.isFinite(sp.penalty)
      && Number.isFinite(mt) && mt >= 0;
    // cross-check: the transcript's voiced overtime line must carry the same penalty
    let voiced = null;
    try {
      const tr = fs.readFileSync(path.join(DIR, f.replace(/\.json$/, '-transcript.txt')), 'utf8');
      const m = tr.match(/Every door's standing −(\d+)/);
      voiced = m ? parseInt(m[1], 10) : null;
    } catch (e) {}
    let otV;
    if (!fieldsOk) { otV = 'OT-RECORD-MISSING'; otMismatch++; }
    else if (sp.penalty > 0 && voiced == null) { otV = 'OT-VOICED-LINE-MISSING'; otMismatch++; }
    else if (voiced != null && voiced !== sp.penalty) { otV = `OT-MISMATCH record=${sp.penalty} voiced=${voiced}`; otMismatch++; }
    else { otV = `ot-ok tier=${sp.tier} losses=${sp.losses} penalty=${sp.penalty} maxTier=${mt}`; otPresent++; }
    // (b) audit regression
    if (w45 > 0 && r.satSeatKind === 'lesser') {
      bound++;
      v = (r.auditNamed ? 'named-GO' : 'SILENT-NOGO') + ' | ' + otV;
      if (!r.auditNamed) boundSilent++;
    } else if (w45 > 0) {
      // Full seats are report-only ("every wave faced" IS the naming);
      // the binding scope is lesser seats with w4/w5 deeds.
      v = (r.auditNamed ? 'full-seat covered ("every wave faced")' : 'full-seat UNCOVERED?') + ' | ' + otV;
      if (!r.auditNamed) boundSilent++;
    } else v = 'no-w4w5 (audit clean by vacuity) | ' + otV;
  }
  rows.push(`seed ${r.seed}: ${v} — sat d${r.satDay} ${r.satSeatKind} w=${JSON.stringify(w)} path=${r.walkedPath || '—'}/${r.walkedBranch || '?'} won=${r.won} end=${r.endReason}`);
}
console.log(rows.join('\n'));
console.log(`\nPRIMARY(a) overtime records: ${otPresent}/${otSat} sat seeds ok, ${otMismatch} missing/mismatched`);
console.log(`PRIMARY(b) audit regression: ${bound} bound seeds, ${boundSilent} silent audits, ${sat} sits, ${won} wins`);
if (boundSilent > 0 || otMismatch > 0) {
  console.log('VERDICT: NO-GO (§14 — silent audit or inconsistent overtime record)');
  process.exit(1);
}
console.log('VERDICT: GO');
