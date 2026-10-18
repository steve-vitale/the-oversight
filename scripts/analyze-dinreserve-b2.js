#!/usr/bin/env node
// analyze-dinreserve-b2.js — aggregate dinreserve-b2 sweep sides.
// Usage: node scripts/analyze-dinreserve-b2.js <control-glob> <armed-glob>
// (§14 revisions from 2026-10-13 metric review: survival GO one-sided
// no-worse-than -10d; starveDays normalized per 100 days alive, guardrail
// armed <= control + 1.0.)
'use strict';
const fs = require('fs');
const path = require('path');

function loadGlob(glob) {
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
  const surv = [], starve100 = [], deaths = {};
  let nat = 0, table = 0, wins = 0, w4 = 0, w5 = 0, exiled = 0, maxSurv = 0;
  for (const r of rows) {
    const e = r.e;
    rotF += e.rotFresh; rotP += e.rotPreserved; duty += e.dutyPreserved; launder += e.laundered;
    surv.push(e.days);
    starve100.push(e.days > 0 ? 100 * e.starveDays / e.days : 0);
    maxSurv = Math.max(maxSurv, e.days);
    if (e.nationalLive) nat++; if (e.tableWaiting || e.won) table++; if (e.won) wins++;
    if (e.maxWave >= 4) w4++; if (e.maxWave >= 5) w5++; exiled += (e.exiled || 0);
    for (const d of (e.deaths || [])) { const c = String(d.cause || '?').split(':')[0]; deaths[c] = (deaths[c] || 0) + 1; }
  }
  const share = (rotF + rotP) > 0 ? 100 * rotF / (rotF + rotP) : 0;
  const medStarve100 = med(starve100);
  console.log(`\n=== ${label} (${rows.length} runs) ===`);
  console.log(`rot fresh=${Math.round(rotF / 1000)}k  rot preserved=${Math.round(rotP / 1000)}k  FRESH-ROT SHARE=${share.toFixed(1)}pp`);
  console.log(`duty throughput=${Math.round(duty / 1000)}k  laundered=${launder}`);
  console.log(`median surv=${med(surv).toFixed(0)}d  max=${maxSurv}d  median starveDays/100d=${medStarve100.toFixed(1)}`);
  console.log(`national=${nat}/${rows.length}  table=${table}/${rows.length}  wins=${wins}/${rows.length}  w4=${w4}/${rows.length}  w5=${w5}/${rows.length}  exiled=${exiled}`);
  const dc = Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('death causes (kind=person/villager, deduped): ' + dc.map(([c, n]) => `${c}:${n}`).join(' '));
  for (const [p, es] of Object.entries(byPol)) {
    let rf = 0, rp = 0, du = 0;
    for (const e of es) { rf += e.rotFresh; rp += e.rotPreserved; du += e.dutyPreserved; }
    const sh = (rf + rp) > 0 ? 100 * rf / (rf + rp) : 0;
    console.log(`  ${p}: rot=${Math.round(rf / 1000)}k share=${sh.toFixed(1)}pp duty=${Math.round(du / 1000)}k medSurv=${med(es.map(e => e.days)).toFixed(0)}d`);
  }
  return { share, medSurv: med(surv), medStarve100, launder, nat, table, wins, w4, w5, rows: rows.length };
}

const [bGlob, aGlob] = process.argv.slice(2);
const b = summarize(loadGlob(bGlob), 'CONTROL');
if (aGlob) {
  const a = summarize(loadGlob(aGlob), 'ARMED');
  console.log('\n=== DELTA (armed - control) ===');
  const dShare = a.share - b.share, dSurv = a.medSurv - b.medSurv, dStarve = a.medStarve100 - b.medStarve100;
  console.log(`fresh-rot share: ${dShare.toFixed(1)}pp  (GO: <= -10pp; KILL if > -5pp)`);
  console.log(`median survival: ${dSurv.toFixed(0)}d  (GO: >= -10d one-sided; KILL if < -10d)`);
  console.log(`starveDays/100d: ${dStarve.toFixed(1)}  (GO: <= +1.0)`);
  console.log(`laundered: control=${b.launder} armed=${a.launder}  (KILL if any arm-attributable laundering)`);
  console.log('\n=== VERDICT ===');
  const go1 = dShare <= -10, go2 = dSurv >= -10, go3 = dStarve <= 1.0, go4 = a.launder === 0;
  const kill1 = dShare > -5, kill2 = dSurv < -10, kill3 = a.launder > 0;
  console.log(`primary rot-share GO: ${go1 ? 'PASS' : 'FAIL'} | KILL-fired: ${kill1 ? 'YES rot-share' : 'no'}`);
  console.log(`survival guardrail: ${go2 ? 'PASS' : 'FAIL'} | KILL-fired: ${kill2 ? 'YES survival' : 'no'}`);
  console.log(`starve guardrail: ${go3 ? 'PASS' : 'FAIL'}`);
  console.log(`laundering guardrail: ${go4 ? 'PASS' : 'FAIL'} | KILL-fired: ${kill3 ? 'YES laundering' : 'no'}`);
  console.log(kill1 || kill2 || kill3 ? '==> KILLED' : (go1 && go2 && go3 && go4 ? '==> GO (confirm spend authorized)' : '==> NO-GO (pilot fail, no confirm spend)'));
}
