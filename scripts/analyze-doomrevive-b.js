#!/usr/bin/env node
// analyze-doomrevive-b.js — aggregate doomrevive sweep sides.
// Usage: node scripts/analyze-doomrevive-b.js <control-glob> <armed-glob> [--agg <dir>]
//
// Pre-registered PRIMARY (§14 binding): (rot:preserved + rot:fresh) ABSOLUTE
// per 100 days alive, POOLED — armed <= 0.80x control.
// ENGAGEMENT (kill-fast): fires >= 50% of doomed-glut nights (armed side);
// fires == 0 -> mechanism invisible -> KILL.
// Guardrails: pooled ate/person-day >= 0.98x control; DOSE-AWARE starve-rate
// (standing revision from sim-windfallrev-b — the 1.15x per-pair bar is
// RETIRED: FAIL iff Pearson(fires, per-pair starve-rate delta) > +0.3 AND
// the pooled starve-rate rises > +15%); median survival >= control-10d; no
// new death mode (exposure-matched, >=2 floor); laundering 0 at convert
// time; PRODUCTION RESPONSE (pre-registered, gates the arm): pooled
// shareSurplus inflow armed <= 1.15x control — the landed surplusfeed
// governor is active in BOTH arms; a bigger delta means the draw drives
// ungoverned production.
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
  let rotF = 0, rotP = 0, duty = 0, launder = 0, daysAlive = 0, starveSum = 0;
  let ddN = 0, ddKcal = 0, ddGlut = 0, ddRaw = 0, ddP1 = 0, ddP2x = 0;
  let ateSum = 0, ateVdays = 0, surp = 0, thrOn = 0, thrCalls = 0;  const surv = [], starve100 = [], deaths = {};
  let nat = 0, table = 0, wins = 0, w4 = 0, w5 = 0, exiled = 0, maxSurv = 0;
  for (const r of rows) {
    const e = r.e;
    rotF += e.rotFresh; rotP += e.rotPreserved; duty += e.dutyPreserved; launder += e.laundered;
    daysAlive += e.days; starveSum += (e.starveDays || 0); surv.push(e.days);
    starve100.push(e.days > 0 ? 100 * e.starveDays / e.days : 0);
    maxSurv = Math.max(maxSurv, e.days);
    ddN += e.ddNights || 0; ddKcal += e.ddKcal || 0; ddGlut += e.ddGlutNights || 0;
    ddRaw += e.ddRawSeen || 0; ddP1 += e.ddP1 || 0; ddP2x += e.ddP2x || 0;
    ateSum += (e.ateSum || 0); ateVdays += (e.ateVdays || 0);
    surp += e.shareSurplus || 0;
    if (e.throttleEngaged !== null && e.throttleEngaged !== undefined) { thrOn += e.throttleEngaged; thrCalls++; }
    if (e.nationalLive) nat++; if (e.tableWaiting || e.won) table++; if (e.won) wins++;
    if (e.maxWave >= 4) w4++; if (e.maxWave >= 5) w5++; exiled += (e.exiled || 0);
    for (const d of (e.deaths || [])) { const c = String(d.cause || '?'); deaths[c] = (deaths[c] || 0) + 1; }
  }
  const rot100 = daysAlive > 0 ? 100 * (rotF + rotP) / daysAlive : 0;
  const starve100pooled = daysAlive > 0 ? 100 * starveSum / daysAlive : 0;
  console.log(`\n=== ${label} (${rows.length} runs) ===`);
  console.log(`rot fresh=${Math.round(rotF / 1000)}k  rot preserved=${Math.round(rotP / 1000)}k  TOTAL/100d=${Math.round(rot100)}k`);
  console.log(`starveDays/100d POOLED=${starve100pooled.toFixed(1)} (sum=${starveSum} over ${daysAlive}d alive)`);
  console.log(`duty throughput=${Math.round(duty / 1000)}k  laundered=${launder}`);
  console.log(`doomeddraw: fires=${ddN}  glutNights=${ddGlut}  fire/glut=${ddGlut ? (ddN / ddGlut).toFixed(2) : 'n/a'}  kcal eaten=${Math.round(ddKcal / 1000)}k  rawSeen=${Math.round(ddRaw / 1000)}k  p1=${Math.round(ddP1 / 1000)}k  p2x=${Math.round(ddP2x / 1000)}k`);
  console.log(`median surv=${med(surv).toFixed(0)}d  max=${maxSurv}d  median starveDays/100d=${med(starve100).toFixed(1)}`);
  console.log(`ate/person-day POOLED=${(ateVdays ? ateSum / ateVdays : 0).toFixed(1)}  shareSurplus=${Math.round(surp / 1000)}k  throttleEngaged=${thrCalls ? (thrOn / thrCalls).toFixed(3) : 'n/a'}`);
  console.log(`national=${nat}/${rows.length}  table=${table}/${rows.length}  wins=${wins}/${rows.length}  w4=${w4}/${rows.length}  w5=${w5}/${rows.length}  exiled=${exiled}`);
  const dc = Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('death causes (kind=person/villager, deduped, canon): ' + dc.map(([c, n]) => `${c}:${n}`).join(' '));
  return { rot100, starve100pooled, medSurv: med(surv), launder, nat, table, wins, w4, w5, exiled, rows: rows.length,
           surv, deaths, byPair: rows, ddN, ddGlut, ateMean: ateVdays ? ateSum / ateVdays : 0,
           surp, thr: thrCalls ? thrOn / thrCalls : null, rotF, rotP, daysAlive };
}

const args = process.argv.slice(2);
const ai = args.indexOf('--agg');
const aggDir = ai >= 0 ? args[ai + 1] : null;
const [bGlob, aGlob] = args.filter(a => a !== '--agg' && a !== aggDir);
const b = summarize(loadGlob(bGlob), 'CONTROL');
const a = summarize(loadGlob(aGlob), 'ARMED');
console.log('\n=== DELTA (armed - control) ===');
const ratio = b.rot100 > 0 ? a.rot100 / b.rot100 : 0;
const dSurv = a.medSurv - b.medSurv;
console.log(`PRIMARY rot/100d: control=${Math.round(b.rot100)}k armed=${Math.round(a.rot100)}k ratio=${ratio.toFixed(3)}  (GO: <= 0.80)`);
const engRatio = a.ddGlut > 0 ? a.ddN / a.ddGlut : 0;
console.log(`ENGAGEMENT fires/glutNights: ${a.ddN}/${a.ddGlut} = ${engRatio.toFixed(2)}  (GO: >= 0.50; fires==0 -> KILL invisible)`);
console.log(`median survival: ${dSurv.toFixed(0)}d  (guardrail: >= -10d)`);
console.log(`ate/person-day: control=${b.ateMean.toFixed(1)} armed=${a.ateMean.toFixed(1)} ratio=${(b.ateMean ? a.ateMean / b.ateMean : 0).toFixed(3)}  (guardrail: >= 0.98)`);
console.log(`laundered: control=${b.launder} armed=${a.launder}  (guardrail: 0)`);
console.log(`DIAG shareSurplus: control=${Math.round(b.surp / 1000)}k armed=${Math.round(a.surp / 1000)}k`);
console.log(`PRODUCTION RESPONSE (gates): pooled shareSurplus ratio=${(b.surp > 0 ? a.surp / b.surp : 0).toFixed(3)}  (guardrail: <= 1.15 — governor active both arms)`);
console.log(`DIAG throttleEngaged: control=${b.thr === null ? 'n/a' : b.thr.toFixed(3)} armed=${a.thr === null ? 'n/a' : a.thr.toFixed(3)}`);

// Per-pair table + dose-response attribution.
const bMap = new Map(b.byPair.map(r => [r.policy + ':' + r.seed, r.e]));
const pairs = [];
for (const r of a.byPair) {
  const bc = bMap.get(r.policy + ':' + r.seed);
  if (!bc) continue;
  const rateC = bc.days > 0 ? 100 * bc.starveDays / bc.days : 0;
  const rateA = r.e.days > 0 ? 100 * r.e.starveDays / r.e.days : 0;
  const rotC = (bc.rotFresh + bc.rotPreserved), rotA = (r.e.rotFresh + r.e.rotPreserved);
  pairs.push({ policy: r.policy, seed: r.seed, survC: bc.days, survA: r.e.days,
    d: r.e.days - bc.days, dd: r.e.ddNights || 0,
    rateC, rateA, rateOk: (bc.days > 30 && r.e.days > 30) ? (rateA <= rateC * 1.15 || (rateC === 0 && rateA === 0)) : null,
    rotRatio: rotC > 0 ? rotA / rotC : (rotA > 0 ? Infinity : 1),
    rotC, rotA, bcDays: bc.days });
}
console.log('\n=== PER-PAIR (policy seed  survC->survA  delta  fires  starveRate C->A  rotRatio) ===');
for (const p of pairs.slice().sort((x, y) => x.d - y.d))
  console.log(`  ${p.policy} s${p.seed}: ${p.survC}d -> ${p.survA}d  ${p.d >= 0 ? '+' : ''}${p.d}d  fires=${p.dd}  rate=${p.rateC.toFixed(1)}->${p.rateA.toFixed(1)}${p.rateOk === null ? '' : (p.rateOk ? ' OK' : ' FAIL')}  rot=${p.rotRatio === Infinity ? 'inf' : p.rotRatio.toFixed(2)}`);
const rSurv = pearson(pairs.map(p => p.dd), pairs.map(p => p.d));
const lr = pairs.filter(p => isFinite(p.rotRatio) && p.rotRatio > 0).map(p => Math.log(p.rotRatio));
const rRot = pearson(pairs.filter(p => isFinite(p.rotRatio) && p.rotRatio > 0).map(p => p.dd), lr);
console.log(`DIAG dose-response: Pearson(fires, survival delta) = ${rSurv === null ? 'n/a' : rSurv.toFixed(2)} (n=${pairs.length})`);
console.log(`DIAG dose-response: Pearson(fires, log rot-ratio) = ${rRot === null ? 'n/a' : rRot.toFixed(2)}`);

// Guardrail (b): DOSE-AWARE starve-rate (standing revision — the per-pair
// 1.15x bar is RETIRED; it fired on lifespan/trajectory noise twice).
// FAIL iff Pearson(fires, per-pair starve-rate delta) > +0.3 AND the pooled
// starve-rate rises > +15%.
const rateDelta = pairs.map(p => p.rateA - p.rateC);
const rRate = pearson(pairs.map(p => p.dd), rateDelta);
const pooledRise = b.starve100pooled > 0 ? (a.starve100pooled / b.starve100pooled - 1) : (a.starve100pooled > 0 ? Infinity : 0);
console.log(`\nGUARDRAIL starve-rate (dose-aware): Pearson(fires, rate-delta)=${rRate === null ? 'n/a' : rRate.toFixed(2)}  pooled ${b.starve100pooled.toFixed(1)}->${a.starve100pooled.toFixed(1)} (${(pooledRise * 100).toFixed(1)}%)`);
const rateGo = !(rRate !== null && rRate > 0.3 && pooledRise > 0.15);
console.log(`  verdict: ${rateGo ? 'PASS' : 'FAIL'} (fails iff r > +0.3 AND pooled rises > +15%)`);
// per-pair table retained for the autopsy only — NOT a guardrail anymore.
const ratePairs = pairs.filter(p => p.rateOk !== null);
console.log(`  (per-pair 1.15x, informational: ${ratePairs.filter(p => p.rateOk).length}/${ratePairs.length} OK)`);

// Guardrail (d): new death mode — exposure-matched, >=2 count floor.
const controlCauses = new Set();
for (const r of b.byPair) for (const d of (r.e.deaths || [])) controlCauses.add(String(d.cause || '?'));
const newModes = {};
for (const r of a.byPair) {
  const bc = bMap.get(r.policy + ':' + r.seed);
  if (!bc) continue;
  for (const d of (r.e.deaths || [])) {
    const c = String(d.cause || '?');
    if (controlCauses.has(c)) continue;
    if ((d.day || 0) > bc.days) continue; // exposure-matched: twin must be alive
    newModes[c] = (newModes[c] || 0) + 1;
  }
}
const tripped = Object.entries(newModes).filter(([, n]) => n >= 2);
console.log(`GUARDRAIL new-death-mode (exposure-matched, >=2 floor): ${tripped.length ? 'TRIPPED: ' + tripped.map(([c, n]) => `${c}x${n}`).join(', ') : 'none'}`);

if (aggDir) {
  fs.mkdirSync(aggDir, { recursive: true });
  for (const [s, nm] of [[b, 'agg-control.json'], [a, 'agg-armed.json']]) {
    fs.writeFileSync(path.join(aggDir, nm), JSON.stringify({
      national: s.nat, table: s.table, wins: s.wins, exiled: s.exiled,
      _regime: 'preseat-courtship', _note: 'winseat-regime baseline mismatch is documented; compare within-regime only',
    }) + '\n');
  }
  console.log(`\nwrote agg to ${aggDir}`);
}

// Verdict block (machine-readable for the evidence file).
const prodRatio = b.surp > 0 ? a.surp / b.surp : 0;
const verdict = {
  primary_ratio: +ratio.toFixed(3), primary_go: ratio <= 0.80,
  engagement_ratio: +engRatio.toFixed(3), engagement_go: engRatio >= 0.50 && a.ddN > 0,
  ate_ratio: b.ateMean ? +(a.ateMean / b.ateMean).toFixed(3) : 0,
  ate_go: b.ateMean ? (a.ateMean / b.ateMean) >= 0.98 : false,
  rate_r: rRate === null ? null : +rRate.toFixed(3),
  rate_pooled_rise: +pooledRise.toFixed(3),
  rate_go: rateGo,
  prod_ratio: +prodRatio.toFixed(3), prod_go: prodRatio <= 1.15,
  surv_delta: +dSurv.toFixed(1), surv_go: dSurv >= -10,
  new_modes: tripped.map(([c]) => c), newmode_go: tripped.length === 0,
  launder_go: a.launder === 0,
};
console.log('\nVERDICT ' + JSON.stringify(verdict));
