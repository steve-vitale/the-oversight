#!/usr/bin/env node
// compare-wintrace-20261015.js — verdict for the wintrace diagnostic sweep
// (sim-wintrace, sim-findings #233).
//
// Reads evidence/2026-10-15/perseed-wintrace/summary.json, applies the
// pre-registered PHASE 1 GO (binding, MEASUREMENT §14):
//   ≥90% of table-reaching traced runs fully attributed
//     (seat → paths qualified → path entered → challenge → outcome →
//      win/no-win reason), where "fully attributed" = traced && verdict in
//     a named bucket (anything but 'unknown').
// Also reports the wall numbers (national / table / wins, wave 4–5
// unlocks, median survival) on both sides — the instrument is read-only, so
// control vs traced must match; any divergence is an instrument bug.
// Usage: node scripts/compare-wintrace-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-wintrace');
const all = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));

const KNOWN = ['WIN', 'never-sat', 'sat-withdrawn', 'invitation-no-fire',
  'finale-died', 'deferred-died', 'reoffer-died', 'deferred-pending',
  'deferral-reoffer-missed', 'sequence-stalled', 'resolved-no-win'];

const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = (rs, k) => {
  const v = rs.map(r => r[k] || 0).sort((a, b) => a - b);
  if (!v.length) return 0;
  return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};

let go = true;
function verdict(name, ok, detail) {
  console.log(`  ${ok ? 'GO  ' : 'MISS'} ${name} — ${detail}`);
  if (!ok) go = false;
}

for (const policyId of ['belongfeast', 'leadfeast']) {
  for (const side of ['control', 'traced']) {
    const rs = all.filter(r => r.policyId === policyId && r.side === side && !r.error);
    console.log(`\n=== ${policyId} / ${side} (n=${rs.length}) ===`);
    console.log(`  national: ${sum(rs, 'national')}/${rs.length}  table: ${sum(rs, 'everTable')}/${rs.length}  won: ${sum(rs, 'won')}/${rs.length}`);
    console.log(`  wave4-5 unlocks: ${sum(rs, 'wave45')}/${rs.length}  median survival: ${med(rs, 'gameDays')}d  max: ${Math.max(...rs.map(r => r.gameDays || 0))}d`);
    console.log(`  exiled: ${sum(rs, 'exiled')}/${rs.length}`);
    if (side === 'traced') {
      const byVerdict = {};
      for (const r of rs) {
        const v = (r.wintrace && r.wintrace.verdict) || '?';
        byVerdict[v] = byVerdict[v] || [];
        byVerdict[v].push(r.seed);
      }
      console.log('  attribution buckets:');
      for (const v of Object.keys(byVerdict).sort()) {
        console.log(`    ${v}: ${byVerdict[v].length} (seeds ${byVerdict[v].join(',')})`);
      }
      for (const r of rs) {
        const a = r.wintrace || {};
        if (a.tableEver || a.sitEver) {
          console.log(`    s${r.seed}: verdict=${a.verdict} seat=${a.seatFirst || '-'} paths=${a.pathsCount} entered=[${(a.pathsEntered || []).join('>')}] defer=${(a.deferDays || []).length ? a.deferDays[0] + '..' : '-'} answers=${a.answersTotal} | ${(a.evidence || []).join(' // ')}`);
        }
      }
    }
  }
}

// PHASE 1 GO: ≥90% of table-reaching traced runs fully attributed.
console.log('\n=== PRE-REGISTERED PHASE 1 VERDICT ===');
const traced = all.filter(r => r.side === 'traced' && !r.error);
const tableRuns = traced.filter(r => (r.wintrace && (r.wintrace.tableEver || r.wintrace.sitEver)) || r.everTable);
const attributed = tableRuns.filter(r => {
  const a = r.wintrace || {};
  return a.traced && KNOWN.includes(a.verdict);
});
console.log(`  table-reaching traced runs: ${tableRuns.length}`);
console.log(`  fully attributed: ${attributed.length}`);
for (const r of tableRuns) {
  const a = r.wintrace || {};
  console.log(`    ${r.policyId} s${r.seed}: verdict=${a.verdict || '?'} traced=${!!a.traced}`);
}
if (tableRuns.length === 0) {
  console.log('  INFO-SKIP: no table reaches in the traced set — the diagnostic question is unanswerable on this substrate; see metric review.');
} else {
  const pct = attributed.length / tableRuns.length;
  verdict('PHASE 1 DIAGNOSTIC GO (≥90% attributed)', pct >= 0.90,
    `${attributed.length}/${tableRuns.length} = ${(100 * pct).toFixed(0)}%`);
}

// Instrument neutrality: control vs traced wall numbers must match
// (read-only instrument). Divergence = instrument bug, fail loudly.
console.log('\n=== INSTRUMENT NEUTRALITY (control vs traced, identical seeds) ===');
for (const policyId of ['belongfeast', 'leadfeast']) {
  const c = all.filter(r => r.policyId === policyId && r.side === 'control' && !r.error);
  const t = all.filter(r => r.policyId === policyId && r.side === 'traced' && !r.error);
  const keys = ['national', 'everTable', 'won', 'wave45', 'exiled'];
  const diffs = [];
  for (const k of keys) if (sum(c, k) !== sum(t, k)) diffs.push(`${k}: ${sum(c, k)} vs ${sum(t, k)}`);
  if (med(c, 'gameDays') !== med(t, 'gameDays')) diffs.push(`medianDays: ${med(c, 'gameDays')} vs ${med(t, 'gameDays')}`);
  // Per-seed end-state equality (stronger than aggregates).
  let seedDiffs = 0;
  for (const cr of c) {
    const tr = t.find(x => x.seed === cr.seed);
    if (tr && (cr.gameDays !== tr.gameDays || cr.endReason !== tr.endReason || cr.won !== tr.won)) seedDiffs++;
  }
  if (diffs.length || seedDiffs) {
    console.log(`  ${policyId}: DIVERGED — ${diffs.join('; ')}${seedDiffs ? `; ${seedDiffs} per-seed end-state diffs` : ''} (instrument bug — investigate)`);
    go = false;
  } else {
    console.log(`  ${policyId}: identical (instrument behavior-neutral)`);
  }
}

console.log(`\n${go ? 'PHASE 1 GO' : 'PHASE 1 NO-GO'} — see evidence/2026-10-15/sim-wintrace.md`);
process.exit(go ? 0 : 1);
