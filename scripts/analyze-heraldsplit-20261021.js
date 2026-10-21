#!/usr/bin/env node
// analyze-heraldsplit-20261021.js — corpus analysis for sim-heraldsplit.
//
// Reads evidence/2026-10-21/perseed-heraldsplit/{policy}/s<seed>.json and
// prints:
//   PRIMARY verdict per wave-4-reaching run (100% attributed, 0 unexplained,
//   0 instrumentErrors), the per-channel table (titan class x trigger x
//   outcome), the herald solo-TB-entry refusal rate, kill attribution by
//   channel x killer, and the wall numbers.
//
// Usage: node scripts/analyze-heraldsplit-20261021.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-21', 'perseed-heraldsplit');

const runs = [];
for (const pol of ['leadfeast', 'belongfeast']) {
  const d = path.join(DIR, pol);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter(f => /^s\d+\.json$/.test(f))) {
    try { runs.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'))); } catch (e) {}
  }
}
if (!runs.length) { console.error('no runs found in ' + DIR); process.exit(1); }

const w4runs = runs.filter(r => !r.error && r.wave4);
console.log(`corpus: ${runs.length} runs, ${w4runs.length} wave-4-reaching`);

console.log('\n== PRIMARY (DIAG-GO): attribution per wave-4-reaching run ==');
let primaryGo = true;
for (const r of w4runs.sort((a, b) => a.seed - b.seed || (a.policyId < b.policyId ? -1 : 1))) {
  const errs = (r.instrumentErrors || []).length;
  const go = r.unexplained === 0 && errs === 0;
  if (!go) primaryGo = false;
  console.log(`  ${r.policyId} s${r.seed}: nUnits=${r.nUnits} unexplained=${r.unexplained} errs=${errs} -> ${go ? 'GO' : 'NO-GO'}`);
}
console.log(`  PRIMARY: ${w4runs.length >= 2 ? (primaryGo ? 'GO' : 'NO-GO') : 'INSUFFICIENT-DATA (<2 wave-4-reaching runs)'}`);

// per-channel table: class x trigger x outcome
const chan = {};
const killChan = {};
let heraldEng = 0, heraldRef = 0;
const refusalCtx = [];
const refusalReasons = {};
for (const r of runs) {
  if (r.error) continue;
  for (const u of (r.units || [])) {
    const k = `${u.cls || '?' }|${u.trigger || '?'}`;
    chan[k] = chan[k] || { entered: 0, 'refused-solo': 0, fled: 0, unmet: 0, delegated: 0, none: 0 };
    const oc = u.outcome || 'none';
    chan[k][oc] = (chan[k][oc] || 0) + 1;
    if (u.outcome === 'refused-solo' && u.refusal && u.refusal.reason) {
      refusalReasons[u.refusal.reason] = (refusalReasons[u.refusal.reason] || 0) + 1;
    }
    if (u.kind === 'engagement' && u.cls === 'herald') {
      heraldEng++;
      if (u.outcome === 'refused-solo') {
        heraldRef++;
        if (u.refusal) refusalCtx.push(u.refusal);
      }
    }
    if (u.kills) {
      const kk = `${u.cls}|${u.trigger}`;
      killChan[kk] = killChan[kk] || { n: 0, by: {} };
      for (const kl of (u.killers || [])) {
        killChan[kk].n++;
        const who = String(kl).split(':')[0];
        killChan[kk].by[who] = (killChan[kk].by[who] || 0) + 1;
      }
    }
  }
}
console.log('\n== per-channel table (class | trigger : entered / refused-solo / fled / unmet / delegated / none) ==');
for (const k of Object.keys(chan).sort()) {
  const c = chan[k];
  console.log(`  ${k}: entered=${c.entered} refused-solo=${c['refused-solo']} fled=${c.fled} unmet=${c.unmet} delegated=${c.delegated} none=${c.none}`);
}
console.log(`  refusal reasons: ${JSON.stringify(refusalReasons)}`);
console.log('\n== wave-4 kills by channel x killer ==');
for (const k of Object.keys(killChan).sort()) {
  console.log(`  ${k}: kills=${killChan[k].n} by=${JSON.stringify(killChan[k].by)}`);
}
console.log(`\n== herald solo-TB-entry refusal: ${heraldRef}/${heraldEng} refused${heraldEng ? ` (${(100 * heraldRef / heraldEng).toFixed(1)}%)` : ''} ==`);
if (refusalCtx.length) {
  const haves = refusalCtx.map(r => r.have);
  const needs = refusalCtx.map(r => r.need);
  console.log(`  refusal muster ctx: have min=${Math.min(...haves)} max=${Math.max(...haves)} | need min=${Math.min(...needs)} max=${Math.max(...needs)} | ready=${refusalCtx.filter(r => r.ready).length}/${refusalCtx.length}`);
}

// wall numbers
const ok = runs.filter(r => !r.error);
const days = ok.map(r => r.gameDays || r.days || 0).sort((a, b) => a - b);
const med = days.length ? days[Math.floor(days.length / 2)] : 0;
console.log('\n== wall numbers ==');
console.log(`  national ${ok.filter(r => r.national).length}/${ok.length} · table ${ok.filter(r => r.table).length}/${ok.length} · wins ${ok.filter(r => r.won).length}/${ok.length} · exiled ${ok.filter(r => r.exiled).length}/${ok.length}`);
console.log(`  wave-4 unlocks ${ok.filter(r => r.wave4).length}/${ok.length} · wave-5 unlocks ${ok.filter(r => r.wave5).length}/${ok.length}`);
console.log(`  median survival ${med}d · max ${days.length ? days[days.length - 1] : 0}d`);
console.log(`  endReasons: ${JSON.stringify(ok.reduce((m, r) => { m[r.endReason || '?'] = (m[r.endReason || '?'] || 0) + 1; return m; }, {}))}`);

// resolution mix (attribution classes observed)
const res = {};
for (const r of runs) {
  if (r.error) continue;
  for (const u of (r.units || [])) res[u.resolution || '?'] = (res[u.resolution || '?'] || 0) + 1;
}
console.log(`\n== attribution resolutions: ${JSON.stringify(res)} ==`);
