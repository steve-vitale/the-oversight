#!/usr/bin/env node
// analyze-dinreserve-20261013.js — aggregate dinreserve sweep sides.
// Usage: node scripts/analyze-dinreserve-20261013.js <baseline-glob> <after-glob>
// Prints per-policy tables, combined fresh-rot share, medians, wall numbers.
'use strict';
const fs = require('fs');
const path = require('path');

function loadGlob(glob) {
  // simple glob: prefix*suffix
  const [pre, suf] = glob.split('*');
  const dir = path.dirname(pre) || '.';
  const rows = [];
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith(path.basename(pre)) && f.endsWith(suf || '')) {
      rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
    }
  }
  return rows;
}
function med(a) { const s = a.slice().sort((x, y) => x - y); return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : 0; }

function summarize(files, label) {
  const rows = [];
  for (const f of files) for (const r of f.rows) rows.push({ policy: f.meta.policy, seed: r.seed, e: r.end });
  const byPol = {};
  for (const r of rows) { (byPol[r.policy] = byPol[r.policy] || []).push(r.e); }
  let rotF = 0, rotP = 0, duty = 0, launder = 0;
  const surv = [], starve = [], deaths = {};
  let nat = 0, table = 0, wins = 0, w4 = 0, w5 = 0, maxSurv = 0;
  for (const r of rows) {
    const e = r.e;
    rotF += e.rotFresh; rotP += e.rotPreserved; duty += e.dutyPreserved; launder += e.laundered;
    surv.push(e.days); starve.push(e.starveDays); maxSurv = Math.max(maxSurv, e.days);
    if (e.nationalLive) nat++; if (e.tableWaiting || e.won) table++; if (e.won) wins++;
    if (e.maxWave >= 4) w4++; if (e.maxWave >= 5) w5++;
    for (const d of (e.deaths || [])) { const c = (d.cause || '?').split(':')[0]; deaths[c] = (deaths[c] || 0) + 1; }
  }
  const share = (rotF + rotP) > 0 ? 100 * rotF / (rotF + rotP) : 0;
  console.log(`\n=== ${label} (${rows.length} runs) ===`);
  console.log(`rot fresh=${Math.round(rotF/1000)}k  rot preserved=${Math.round(rotP/1000)}k  FRESH-ROT SHARE=${share.toFixed(1)}pp`);
  console.log(`duty throughput=${Math.round(duty/1000)}k  laundered=${launder}`);
  console.log(`median surv=${med(surv).toFixed(0)}d  max=${maxSurv}d  median starveDays=${med(starve).toFixed(1)}`);
  console.log(`national=${nat}/${rows.length}  table=${table}/${rows.length}  wins=${wins}/${rows.length}  w4=${w4}/${rows.length}  w5=${w5}/${rows.length}`);
  const dc = Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('death causes: ' + dc.map(([c, n]) => `${c}:${n}`).join(' '));
  for (const [p, es] of Object.entries(byPol)) {
    let rf = 0, rp = 0, du = 0;
    for (const e of es) { rf += e.rotFresh; rp += e.rotPreserved; du += e.dutyPreserved; }
    const sh = (rf + rp) > 0 ? 100 * rf / (rf + rp) : 0;
    console.log(`  ${p}: rot=${Math.round(rf/1000)}k share=${sh.toFixed(1)}pp duty=${Math.round(du/1000)}k medSurv=${med(es.map(e => e.days)).toFixed(0)}d`);
  }
  return { share, medSurv: med(surv), medStarve: med(starve), launder };
}

const [bGlob, aGlob] = process.argv.slice(2);
const b = summarize(loadGlob(bGlob), 'BASELINE');
if (aGlob) {
  const a = summarize(loadGlob(aGlob), 'AFTER');
  console.log('\n=== DELTA (after - baseline) ===');
  console.log(`fresh-rot share: ${(a.share - b.share).toFixed(1)}pp  (GO: <= -10pp; KILL if > -5pp)`);
  console.log(`median survival: ${(a.medSurv - b.medSurv).toFixed(0)}d  (GO: within +/-10d; KILL if < -10d)`);
  console.log(`median starveDays: ${(a.medStarve - b.medStarve).toFixed(1)}  (GO: delta <= +1)`);
  console.log(`laundered: baseline=${b.launder} after=${a.launder}  (KILL if any smoking-of-spoiled attributable to arm)`);
}
