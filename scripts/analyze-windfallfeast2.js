#!/usr/bin/env node
// analyze-windfallfeast2.js — aggregate windfallfeast2 sweep sides.
// Usage: node scripts/analyze-windfallfeast2.js <control-glob> <armed-glob> [--agg <dir>]
//
// Pre-registered PRIMARY (§14 binding): (rot:preserved + rot:fresh) absolute
// per 100 days alive — armed <= 0.75x control. GO also requires mechanism
// engagement: windfall feasts >= 8 across the armed side (raised threshold
// fires less than the killed arm's ~1/run).
// Guardrails: starvation <= control+2 per-pair (collapse-aware); median
// survival >= control-10d; a survival miss only kills if
// windfall-count-vs-survival dose-response shows attribution (adopted from
// the killed arm's metric review); no new death mode; no laundering.
// --agg writes per-side flat aggregates {national,table,wins,exiled} for
// scripts/telemetry-check.js.
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
function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < n; i++) { cov += (xs[i] - mx) * (ys[i] - my); vx += (xs[i] - mx) ** 2; vy += (ys[i] - my) ** 2; }
  if (vx === 0 || vy === 0) return null;
  return cov / Math.sqrt(vx * vy);
}

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
  console.log(`windfall feasts=${wf}  windfall kcal saved=${Math.round(wfKcal / 1000)}k  windfall doomed-seen=${Math.round(wfDoomed / 1000)}k`);
  console.log(`median surv=${med(surv).toFixed(0)}d  max=${maxSurv}d  median starveDays/100d=${medStarve100.toFixed(1)}`);
  console.log(`national=${nat}/${rows.length}  table=${table}/${rows.length}  wins=${wins}/${rows.length}  w4=${w4}/${rows.length}  w5=${w5}/${rows.length}  exiled=${exiled}`);
  const dc = Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('death causes (kind=person/villager, deduped): ' + dc.map(([c, n]) => `${c}:${n}`).join(' '));
  return { rot100, medSurv: med(surv), medStarve100, launder, nat, table, wins, w4, w5, wf, exiled, rows: rows.length, surv, deaths, byPair: rows };
}

const args = process.argv.slice(2);
const ai = args.indexOf('--agg');
const aggDir = ai >= 0 ? args[ai + 1] : null;
const [bGlob, aGlob] = args.filter(a => a !== '--agg' && a !== aggDir);
const b = summarize(loadGlob(bGlob), 'CONTROL');
const a = summarize(loadGlob(aGlob), 'ARMED');
console.log('\n=== DELTA (armed - control) ===');
const ratio = b.rot100 > 0 ? a.rot100 / b.rot100 : 0;
const dSurv = a.medSurv - b.medSurv, dStarve = a.medStarve100 - b.medStarve100;
console.log(`rot/100d: control=${Math.round(b.rot100)}k armed=${Math.round(a.rot100)}k ratio=${ratio.toFixed(3)}  (GO: <= 0.75)`);
console.log(`windfall engagement: ${a.wf} feasts  (GO: >= 8)`);
console.log(`median survival: ${dSurv.toFixed(0)}d  (GO: >= -10d)`);
console.log(`starveDays/100d: ${dStarve.toFixed(1)}  (guardrail: per-pair <= +2, pooled informative)`);
console.log(`laundered: control=${b.launder} armed=${a.launder}  (KILL if any arm-attributable laundering)`);

// Per-pair survival table + dose-response attribution.
const bMap = new Map(b.byPair.map(r => [r.policy + ':' + r.seed, r.e]));
const pairs = [];
for (const r of a.byPair) {
  const bc = bMap.get(r.policy + ':' + r.seed);
  if (bc) pairs.push({ policy: r.policy, seed: r.seed, survC: bc.days, survA: r.e.days,
    d: r.e.days - bc.days, wf: r.e.windfallFeasts || 0, starveC: bc.starveDays, starveA: r.e.starveDays });
}
console.log('\n=== PER-PAIR (policy seed  survC->survA  delta  windfalls) ===');
for (const p of pairs.slice().sort((x, y) => x.d - y.d))
  console.log(`  ${p.policy} s${p.seed}: ${p.survC}d -> ${p.survA}d  ${p.d >= 0 ? '+' : ''}${p.d}d  wf=${p.wf}`);
const r = pearson(pairs.map(p => p.wf), pairs.map(p => p.d));
console.log(`dose-response: Pearson(windfall count, survival delta) = ${r === null ? 'n/a' : r.toFixed(2)} (n=${pairs.length})`);
const attributed = r !== null && r < -0.3;
console.log(`attribution: ${attributed ? 'ATTRIBUTED (harm concentrates on high-engagement pairs)' : 'unattributed (harm does not track mechanism frequency)'}`);

// Collapse-aware per-pair starvation guardrail: only pairs where both survived >30d.
const starveFails = pairs.filter(p => p.survC > 30 && p.survA > 30 && (p.starveA - p.starveC) > 2);
console.log(`per-pair starvation fails (>30d both, armed-control > +2): ${starveFails.length ? starveFails.map(p => p.policy + ' s' + p.seed + ' +' + (p.starveA - p.starveC)).join(', ') : 'none'}`);

// New-death-mode guardrail: armed causes must be subset of control's.
const cCauses = new Set(Object.keys(b.deaths)), newModes = Object.keys(a.deaths).filter(c => !cCauses.has(c));
console.log(`new death modes (armed not in control): ${newModes.length ? newModes.join(', ') : 'none'}`);

console.log('\n=== VERDICT ===');
const goPrimary = ratio <= 0.75, goEngage = a.wf >= 8;
const goSurv = dSurv >= -10, goLaunder = a.launder === 0;
const goStarve = starveFails.length === 0, noNewMode = newModes.length === 0;
// Adopted revision (killed arm's metric review, proposed for this run):
// a survival miss does not kill when the harm is unattributed AND the
// primary holds at the stricter 0.70x bar.
const goSurvSplit = !goSurv && !attributed && ratio <= 0.70;
console.log(`primary rot/100d GO (<=0.75x): ${goPrimary ? 'PASS' : 'FAIL'} (ratio=${ratio.toFixed(3)})`);
console.log(`engagement GO (>=8 windfalls): ${goEngage ? 'PASS' : 'FAIL'} (${a.wf})`);
console.log(`survival guardrail (>= -10d): ${goSurv ? 'PASS' : 'FAIL' + (goSurvSplit ? ' — SPLIT: harm unattributed + primary<=0.70x (adopted metric review)' : ' — ' + (attributed ? 'attributed: KILL' : 'unattributed'))} (${dSurv.toFixed(0)}d)`);
console.log(`starvation guardrail (per-pair <= +2): ${goStarve ? 'PASS' : 'FAIL'}`);
console.log(`new-death-mode guardrail: ${noNewMode ? 'PASS' : 'FAIL'}`);
console.log(`laundering guardrail: ${goLaunder ? 'PASS' : 'FAIL'}`);
const go = goPrimary && goEngage && goLaunder && goStarve && noNewMode && (goSurv || goSurvSplit);
console.log(go
  ? '==> GO' + (goSurvSplit ? ' (survival-guardrail split per adopted metric review)' : '') + ' (confirm spend authorized)'
  : '==> NO-GO (pilot fail, no confirm spend)' + (!goEngage ? ' — mechanism did not engage' : ''));

if (aggDir) {
  fs.mkdirSync(aggDir, { recursive: true });
  for (const [s, side] of [['control', b], ['armed', a]])
    fs.writeFileSync(path.join(aggDir, `agg-${s}.json`),
      JSON.stringify({ national: side.nat, table: side.table, wins: side.wins, exiled: side.exiled }) + '\n');
  console.log('wrote telemetry aggregates to ' + aggDir);
}
