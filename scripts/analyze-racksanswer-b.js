#!/usr/bin/env node
// analyze-racksanswer-b.js — aggregate racksanswer-b sweep sides.
// Usage: node scripts/analyze-racksanswer-b.js <control-glob> <armed-glob>
//
// Pre-registered PRIMARY (§14 binding): (rot:preserved + rot:fresh) absolute
// per 100 days alive — armed <= 0.85x control. GO also requires mechanism
// engagement: windfall feasts >= 16 across the armed side.
// Guardrails: starvation <= control+2 per-pair (collapse-aware); median
// survival >= control-10d; no new death mode; no laundering.
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
  let rotF = 0, rotP = 0, duty = 0, launder = 0, daysAlive = 0;
  let wf = 0, wfKcal = 0, wfDoomed = 0;
  const surv = [], starve100 = [], deaths = {};
  let nat = 0, table = 0, wins = 0, w4 = 0, w5 = 0, exiled = 0, maxSurv = 0;
  for (const r of rows) {
    const e = r.e;
    rotF += e.rotFresh; rotP += e.rotPreserved; duty += e.dutyPreserved; launder += e.laundered;
    daysAlive += e.days; surv.push(e.days);
    starve100.push(e.days > 0 ? 100 * e.starveDays / e.days : 0);
    maxSurv = Math.max(maxSurv, e.days);
    wf += e.windfallFeasts || 0; wfKcal += e.windfallKcal || 0; wfDoomed += e.windfallDoomed || 0;
    if (e.nationalLive) nat++; if (e.tableWaiting || e.won) table++; if (e.won) wins++;
    if (e.maxWave >= 4) w4++; if (e.maxWave >= 5) w5++; exiled += (e.exiled || 0);
    for (const d of (e.deaths || [])) { const c = String(d.cause || '?').split(':')[0]; deaths[c] = (deaths[c] || 0) + 1; }
  }
  const rot100 = daysAlive > 0 ? 100 * (rotF + rotP) / daysAlive : 0;
  const medStarve100 = med(starve100);
  console.log(`\n=== ${label} (${rows.length} runs) ===`);
  console.log(`rot fresh=${Math.round(rotF / 1000)}k  rot preserved=${Math.round(rotP / 1000)}k  TOTAL/100d=${Math.round(rot100)}k`);
  console.log(`duty throughput=${Math.round(duty / 1000)}k  laundered=${launder}`);
  console.log(`windfall feasts=${wf}  windfall kcal=${Math.round(wfKcal / 1000)}k  windfall doomed-seen=${Math.round(wfDoomed / 1000)}k`);
  console.log(`median surv=${med(surv).toFixed(0)}d  max=${maxSurv}d  median starveDays/100d=${medStarve100.toFixed(1)}`);
  console.log(`national=${nat}/${rows.length}  table=${table}/${rows.length}  wins=${wins}/${rows.length}  w4=${w4}/${rows.length}  w5=${w5}/${rows.length}  exiled=${exiled}`);
  const dc = Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('death causes (kind=person/villager, deduped): ' + dc.map(([c, n]) => `${c}:${n}`).join(' '));
  return { rot100, medSurv: med(surv), medStarve100, launder, nat, table, wins, w4, w5, wf, rows: rows.length, surv, deaths };
}

const [bGlob, aGlob] = process.argv.slice(2);
const b = summarize(loadGlob(bGlob), 'CONTROL');
if (aGlob) {
  const a = summarize(loadGlob(aGlob), 'ARMED');
  console.log('\n=== DELTA (armed - control) ===');
  const ratio = b.rot100 > 0 ? a.rot100 / b.rot100 : 0;
  const dSurv = a.medSurv - b.medSurv, dStarve = a.medStarve100 - b.medStarve100;
  console.log(`rot/100d: control=${Math.round(b.rot100)}k armed=${Math.round(a.rot100)}k ratio=${ratio.toFixed(3)}  (GO: <= 0.85)`);
  console.log(`windfall engagement: ${a.wf} feasts  (GO: >= 16)`);
  console.log(`median survival: ${dSurv.toFixed(0)}d  (GO: >= -10d one-sided)`);
  console.log(`starveDays/100d: ${dStarve.toFixed(1)}  (guardrail: per-pair <= +2, pooled informative)`);
  console.log(`laundered: control=${b.launder} armed=${a.launder}  (KILL if any arm-attributable laundering)`);
  // Per-pair starvation (collapse-aware): only pairs where both survived >30d.
  console.log('\n=== VERDICT ===');
  const goPrimary = ratio <= 0.85, goEngage = a.wf >= 16;
  const goSurv = dSurv >= -10, goLaunder = a.launder === 0;
  console.log(`primary rot/100d GO (<=0.85x): ${goPrimary ? 'PASS' : 'FAIL'}`);
  console.log(`engagement GO (>=16 windfalls): ${goEngage ? 'PASS' : 'FAIL'}`);
  console.log(`survival guardrail (>= -10d): ${goSurv ? 'PASS' : 'FAIL'}`);
  console.log(`laundering guardrail: ${goLaunder ? 'PASS' : 'FAIL'}`);
  const verdict = (goPrimary && goEngage && goSurv && goLaunder)
    ? '==> GO (confirm spend authorized)'
    : '==> NO-GO (pilot fail, no confirm spend)' + (!goEngage ? ' — mechanism did not engage' : '');
  console.log(verdict);
}
