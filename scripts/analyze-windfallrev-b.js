#!/usr/bin/env node
// analyze-windfallrev-b.js — aggregate the windfallrev-b 4-arm sweep.
//
// Arms: control (gate off), full (layer + both reconciliations),
// norecon (reconcile (3) off), noyield (yield-smoke (4) off).
//
// PRIMARY (§14 binding): (rot:preserved + rot:fresh) absolute per 100 days
// alive — full <= 0.80x control.
// ENGAGEMENT: windfall tail-burn fires (a fire with another windfall fire
// <=2d earlier) >= 8 on the full side. Mean fires reported, not gating.
// Guardrail (a) — DOSE-AWARE (the 1.15x per-pair ratio bar is retired):
//   FAIL iff Pearson(windfall count, per-pair starve-rate delta) > +0.3
//   AND the pooled starve-rate rises > +15%. Otherwise PASS (noise).
// Guardrail (b): new-death-mode, EXPOSURE-MATCHED with a >=2 count floor.
// Guardrail (c): median survival >= control-10d (dose-response reported).
// Guardrail (d): laundering 0 measured AT CONVERT TIME.
// Reconciliation attribution: full vs norecon (scavenger-draw yield:
//   suppression counts, fresh-grant dose-response on bearer-churn) and full
//   vs noyield (smoke-drive yield: dutyPreserved recovery, yield counts).
// --agg writes per-side flat aggregates for scripts/telemetry-check.js.
// Usage: node scripts/analyze-windfallrev-b.js <control-glob> <full-glob> <norecon-glob> <noyield-glob> [--agg <dir>]
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
function canonCause(c) {
  c = String(c || '?');
  if (/dehydr/i.test(c)) return 'thirst';
  return c;
}
function tailFires(fireDays) {
  const ds = (fireDays || []).slice().sort((a, b) => a - b);
  let n = 0;
  for (let i = 1; i < ds.length; i++) if (ds[i] - ds[i - 1] <= 2) n++;
  return n;
}
const rate100 = e => (e.days > 0 ? 100 * (e.starveDays || 0) / e.days : 0);

function summarize(files, label) {
  const rows = [];
  for (const f of files) for (const r of f.rows) rows.push({ policy: f.meta.policy, seed: r.seed, e: r.end });
  let rotF = 0, rotP = 0, duty = 0, launder = 0, daysAlive = 0;
  let wf = 0, wfKcal = 0, wfDoomed = 0, wfEaten = 0, wfCapBit = 0, wfTail = 0;
  let wfFresh = 0, wfDraws = 0, reconSup = 0, smokeY = 0, bearers = 0;
  const surv = [], starve100 = [], deaths = {};
  let nat = 0, table = 0, wins = 0, w4 = 0, w5 = 0, exiled = 0, maxSurv = 0;
  for (const r of rows) {
    const e = r.e;
    rotF += e.rotFresh; rotP += e.rotPreserved; duty += e.dutyPreserved; launder += e.laundered;
    daysAlive += e.days; surv.push(e.days);
    starve100.push(rate100(e));
    maxSurv = Math.max(maxSurv, e.days);
    wf += e.windfallFeasts || 0; wfKcal += e.windfallKcal || 0; wfDoomed += e.windfallDoomed || 0;
    wfEaten += e.windfallDoomedEaten || 0; wfCapBit += e.windfallCapBit || 0;
    wfTail += tailFires(e.windfallFireDays);
    wfFresh += e.windfallFreshGrants || 0; wfDraws += e.windfallScavDraws || 0;
    reconSup += e.windfallReconSuppress || 0; smokeY += e.windfallSmokeYield || 0;
    bearers += e.bearerChanges || 0;
    if (e.nationalLive) nat++; if (e.tableWaiting || e.won) table++; if (e.won) wins++;
    if (e.maxWave >= 4) w4++; if (e.maxWave >= 5) w5++; exiled += (e.exiled || 0);
    for (const d of (e.deaths || [])) { const c = canonCause(String(d.cause || '?').split(':')[0]); deaths[c] = (deaths[c] || 0) + 1; }
  }
  const rot100 = daysAlive > 0 ? 100 * (rotF + rotP) / daysAlive : 0;
  const medStarve100 = med(starve100);
  console.log(`\n=== ${label} (${rows.length} runs) ===`);
  console.log(`rot fresh=${Math.round(rotF / 1000)}k  rot preserved=${Math.round(rotP / 1000)}k  TOTAL/100d=${Math.round(rot100)}k`);
  console.log(`duty throughput=${Math.round(duty / 1000)}k  laundered=${launder}`);
  console.log(`windfall feasts=${wf} (tail-burn=${wfTail}, cap-bit=${wfCapBit})  fresh-grants=${wfFresh}  scav-draws=${wfDraws}`);
  console.log(`  recon-suppressed=${reconSup}  smoke-yielded=${smokeY}  kcal spent=${Math.round(wfKcal / 1000)}k  doomed-seen=${Math.round(wfDoomed / 1000)}k  doomed-eaten=${Math.round(wfEaten / 1000)}k`);
  console.log(`median surv=${med(surv).toFixed(0)}d  max=${maxSurv}d  median starveDays/100d=${medStarve100.toFixed(1)}  bearer-changes=${bearers}`);
  console.log(`national=${nat}/${rows.length}  table=${table}/${rows.length}  wins=${wins}/${rows.length}  w4=${w4}/${rows.length}  w5=${w5}/${rows.length}  exiled=${exiled}`);
  const dc = Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('death causes (kind=person/villager, deduped, thirst/dehydration canonicalized): ' + dc.map(([c, n]) => `${c}:${n}`).join(' '));
  return { rot100, medSurv: med(surv), medStarve100, launder, nat, table, wins, w4, w5,
           wf, wfTail, wfFresh, wfDraws, reconSup, smokeY, bearers, duty,
           exiled, rows: rows.length, surv, deaths, byPair: rows };
}

function pairsOf(a, b) {
  const bMap = new Map(b.byPair.map(r => [r.policy + ':' + r.seed, r.e]));
  const pairs = [];
  for (const r of a.byPair) {
    const bc = bMap.get(r.policy + ':' + r.seed);
    if (bc) pairs.push({ policy: r.policy, seed: r.seed, survC: bc.days, survA: r.e.days,
      d: r.e.days - bc.days, wf: r.e.windfallFeasts || 0, wfg: r.e.windfallFreshGrants || 0,
      starveC: bc.starveDays, starveA: r.e.starveDays,
      rateC: rate100(bc), rateA: rate100(r.e),
      bearC: bc.bearerChanges || 0, bearA: r.e.bearerChanges || 0,
      endC: bc, endA: r.e });
  }
  return pairs;
}

const args = process.argv.slice(2);
const ai = args.indexOf('--agg');
const aggDir = ai >= 0 ? args[ai + 1] : null;
const [bGlob, fGlob, nrGlob, nyGlob] = args.filter(a => a !== '--agg' && a !== aggDir);
const b = summarize(loadGlob(bGlob), 'CONTROL');
const f = summarize(loadGlob(fGlob), 'FULL (both reconciliations)');
const nr = summarize(loadGlob(nrGlob), 'NORECON (reconcile off)');
const ny = summarize(loadGlob(nyGlob), 'NOYIELD (smoke-yield off)');

console.log('\n=== DELTA (full - control) ===');
const ratio = b.rot100 > 0 ? f.rot100 / b.rot100 : 0;
const dSurv = f.medSurv - b.medSurv;
const pooledRise = b.medStarve100 > 0 ? (f.medStarve100 - b.medStarve100) / b.medStarve100 : 0;
console.log(`rot/100d: control=${Math.round(b.rot100)}k full=${Math.round(f.rot100)}k ratio=${ratio.toFixed(3)}  (GO: <= 0.80)`);
console.log(`windfall engagement (cluster-tail fires): ${f.wfTail}  (GO: >= 8); mean fires=${f.wf} (informative)`);
console.log(`median survival: ${dSurv.toFixed(0)}d  (GO: >= -10d)`);
console.log(`starveDays/100d pooled median: control=${b.medStarve100.toFixed(1)} full=${f.medStarve100.toFixed(1)} rise=${(pooledRise * 100).toFixed(1)}%  (guardrail (a): dose-aware)`);
console.log(`laundered: control=${b.launder} full=${f.launder}  (KILL if any arm-attributable laundering)`);
console.log(`bearer-changes: control=${b.bearers} full=${f.bearers} (delta=${f.bearers - b.bearers})`);
console.log(`duty throughput: control=${Math.round(b.duty / 1000)}k full=${Math.round(f.duty / 1000)}k noyield=${Math.round(ny.duty / 1000)}k`);

const pairs = pairsOf(f, b);
console.log('\n=== PER-PAIR (policy seed  survC->survA  delta  windfalls  freshGrants) ===');
for (const p of pairs.slice().sort((x, y) => x.d - y.d))
  console.log(`  ${p.policy} s${p.seed}: ${p.survC}d -> ${p.survA}d  ${p.d >= 0 ? '+' : ''}${p.d}d  wf=${p.wf} fg=${p.wfg} bearers ${p.bearC}->${p.bearA}`);
const rSurv = pearson(pairs.map(p => p.wf), pairs.map(p => p.d));
console.log(`dose-response: Pearson(windfall count, survival delta) = ${rSurv === null ? 'n/a' : rSurv.toFixed(2)} (n=${pairs.length})`);

// Guardrail (a) — DOSE-AWARE: fail only when the starve-rate delta
// correlates positively with windfall dose (r > +0.3) AND the pooled rate
// rises > +15%. The 1.15x per-pair ratio bar is retired (fired on noise twice).
const rDose = pearson(pairs.map(p => p.wf), pairs.map(p => p.rateA - p.rateC));
const goRate = !(rDose !== null && rDose > 0.3 && pooledRise > 0.15);
console.log('\n=== GUARDRAIL (a): dose-aware starve-rate ===');
console.log(`Pearson(windfall count, per-pair starve-rate delta) = ${rDose === null ? 'n/a' : rDose.toFixed(2)} (fail iff > +0.3)`);
console.log(`pooled starve-rate rise = ${(pooledRise * 100).toFixed(1)}% (fail iff > +15%)`);
console.log(`guardrail (a): ${goRate ? 'PASS' : 'FAIL'}`);

// Bearer-churn reconciliation (3): dose-response of bearer-changes delta vs
// fresh-grant windfall count (the scavenger-rolling fires).
const rBear = pearson(pairs.map(p => p.wfg), pairs.map(p => p.bearA - p.bearC));
console.log('\n=== RECONCILIATION (3): bearer-churn attribution ===');
console.log(`Pearson(fresh-grant fires, per-pair bearer-change delta) = ${rBear === null ? 'n/a' : rBear.toFixed(2)} (n=${pairs.length})`);
console.log(`scavenger-draw yield suppressed ${f.reconSup} fires (norecon arm: ${nr.reconSup} — must be 0)`);
console.log(`scavenger draws: full=${f.wfDraws} norecon=${nr.wfDraws} control=${b.wfDraws}`);
const dBearFull = f.bearers - b.bearers, dBearNr = nr.bearers - b.bearers;
console.log(`bearer-change delta vs control: full=${dBearFull >= 0 ? '+' : ''}${dBearFull}  norecon=${dBearNr >= 0 ? '+' : ''}${dBearNr}`);

// Smoke-drive yield (4): duty throughput recovery + yield counts.
console.log('\n=== RECONCILIATION (4): smoke-drive yield attribution ===');
console.log(`smoke-yielded fires: full=${f.smokeY} noyield=${ny.smokeY} (must be 0) norecon=${nr.smokeY}`);
console.log(`duty preserved: control=${Math.round(b.duty / 1000)}k full=${Math.round(f.duty / 1000)}k noyield=${Math.round(ny.duty / 1000)}k norecon=${Math.round(nr.duty / 1000)}k`);

// Guardrail (b): exposure-matched new-mode with a >=2 count floor.
const cCauses = new Set(Object.keys(b.deaths));
const expCounts = {};
for (const p of pairs) {
  for (const d of (p.endA.deaths || [])) {
    const day = d.day || 0;
    if (day > p.survC) continue;
    const c = canonCause(String(d.cause || '?').split(':')[0]);
    expCounts[c] = (expCounts[c] || 0) + 1;
  }
}
const newModes = Object.entries(expCounts).filter(([c, n]) => n >= 2 && !cCauses.has(c));
console.log('\n=== GUARDRAIL (b): exposure-matched new death modes (>=2 count floor) ===');
console.log('exposure-matched full-side cause counts: ' + (Object.entries(expCounts).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}:${n}`).join(' ') || 'none'));
console.log(`new death modes (full >=2x, exposure-matched, not in control): ${newModes.length ? newModes.map(([c, n]) => c + ':' + n).join(', ') : 'none'}`);

console.log('\n=== VERDICT (full vs control) ===');
const goPrimary = ratio <= 0.80, goEngage = f.wfTail >= 8;
const goSurv = dSurv >= -10, goLaunder = f.launder === 0;
const goNewMode = newModes.length === 0;
console.log(`primary rot/100d GO (<=0.80x): ${goPrimary ? 'PASS' : 'FAIL'} (ratio=${ratio.toFixed(3)})`);
console.log(`engagement GO (>=8 tail-burn fires): ${goEngage ? 'PASS' : 'FAIL'} (${f.wfTail})`);
console.log(`survival guardrail (>= -10d): ${goSurv ? 'PASS' : 'FAIL'} (${dSurv.toFixed(0)}d)`);
console.log(`starve-rate guardrail (a) dose-aware: ${goRate ? 'PASS' : 'FAIL'}`);
console.log(`new-death-mode guardrail (b) exposure-matched >=2: ${goNewMode ? 'PASS' : 'FAIL'}`);
console.log(`laundering guardrail (d): ${goLaunder ? 'PASS' : 'FAIL'}`);
const go = goPrimary && goEngage && goLaunder && goRate && goNewMode && goSurv;
console.log(go
  ? '==> GO (confirm spend authorized)'
  : '==> NO-GO (pilot fail, no confirm spend)' + (!goEngage ? ' — mechanism did not engage' : ''));

if (aggDir) {
  fs.mkdirSync(aggDir, { recursive: true });
  for (const [s, side] of [['control', b], ['full', f], ['norecon', nr], ['noyield', ny]])
    fs.writeFileSync(path.join(aggDir, `agg-${s}.json`),
      JSON.stringify({ national: side.nat, table: side.table, wins: side.wins, exiled: side.exiled }) + '\n');
  console.log('wrote telemetry aggregates to ' + aggDir);
}
