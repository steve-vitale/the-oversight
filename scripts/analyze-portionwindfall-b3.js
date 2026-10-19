#!/usr/bin/env node
// analyze-portionwindfall-b3.js — aggregate portionwindfall-b3 sweep sides.
//
// Second revival of sim-portionwindfall-b under the REVISED guardrails
// (see evidence/2026-10-18/sim-portionwindfall-b3.md pre-registration).
// b2's metric review RETIRED the 1.15x per-pair starve-rate ratio as
// noise-firing; #582 adopted the dose-aware form as the standing
// replacement — that is the binding bar here.
//
// PRIMARY (§14 binding): (rot:preserved + rot:fresh) absolute per 100 days
// alive — armed <= 0.80x control.
// ENGAGEMENT (§14 binding): windfall tail-burn fires (a fire with another
// windfall fire <=2d earlier) >= 400 across the armed side (the #571 bar),
// and the cap bit set on every firing (structural: the 300*roster trigger
// sits above the 275*roster cap). Mean fires reported, not gating.
// Guardrail (a) DOSE-AWARE: per-pair starve RATE (starveDays/100d alive)
// reported for every pair (collapse-aware, both >30d); FAIL iff pooled
// armed rate > pooled control rate x 1.15 AND Pearson(windfall count,
// per-pair rate delta) > +0.3. The old 1.15x per-pair table prints as
// context only (metric review, not binding).
// Guardrail (b): new-death-mode, EXPOSURE-MATCHED with a >=2 count floor —
// a cause counts only if it appears >=2x on the armed side AND survives
// exposure-time matching (each armed death counted only while its paired
// control twin was still alive: death.day <= control survival) AND is absent
// from the control cause set. Thirst/dehydration canonicalized (#515/#544).
// Guardrail (c): median survival >= control-10d, with dose-response
// attribution and the #538-adopted unattributed-harm split rule (|r|<0.3 AND
// primary <= 0.70x).
// Guardrail (d): laundering 0 measured AT CONVERT TIME.
// Guardrail (e): ate/person-day intact (pooled): pooled village ate kcal
// per person-day, armed >= control x 0.98.
// --agg writes per-side flat aggregates {national,table,wins,exiled} for
// scripts/telemetry-check.js.
// Usage: node scripts/analyze-portionwindfall-b3.js <control-glob> <armed-glob> [--agg <dir>]
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
  let ateSum = 0, ateVdays = 0;
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
    ateSum += e.ateSum || 0; ateVdays += e.ateVdays || 0;
    if (e.nationalLive) nat++; if (e.tableWaiting || e.won) table++; if (e.won) wins++;
    if (e.maxWave >= 4) w4++; if (e.maxWave >= 5) w5++; exiled += (e.exiled || 0);
    for (const d of (e.deaths || [])) { const c = canonCause(String(d.cause || '?').split(':')[0]); deaths[c] = (deaths[c] || 0) + 1; }
  }
  const rot100 = daysAlive > 0 ? 100 * (rotF + rotP) / daysAlive : 0;
  const medStarve100 = med(starve100);
  const pooledStarve100 = daysAlive > 0 ? 100 * rows.reduce((t, r) => t + (r.e.starveDays || 0), 0) / daysAlive : 0;
  const pooledAte = ateVdays > 0 ? ateSum / ateVdays : 0;
  console.log(`\n=== ${label} (${rows.length} runs) ===`);
  console.log(`rot fresh=${Math.round(rotF / 1000)}k  rot preserved=${Math.round(rotP / 1000)}k  TOTAL/100d=${Math.round(rot100)}k`);
  console.log(`duty throughput=${Math.round(duty / 1000)}k  laundered=${launder}`);
  console.log(`windfall feasts=${wf} (tail-burn=${wfTail}, cap-bit=${wfCapBit})  kcal spent=${Math.round(wfKcal / 1000)}k  doomed-seen=${Math.round(wfDoomed / 1000)}k  doomed-eaten=${Math.round(wfEaten / 1000)}k`);
  console.log(`median surv=${med(surv).toFixed(0)}d  max=${maxSurv}d  median starveDays/100d=${medStarve100.toFixed(1)}  pooled starveDays/100d=${pooledStarve100.toFixed(1)}`);
  console.log(`pooled ate/person-day=${pooledAte.toFixed(0)} kcal`);
  console.log(`national=${nat}/${rows.length}  table=${table}/${rows.length}  wins=${wins}/${rows.length}  w4=${w4}/${rows.length}  w5=${w5}/${rows.length}  exiled=${exiled}`);
  const dc = Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('death causes (kind=person/villager, deduped, thirst/dehydration canonicalized): ' + dc.map(([c, n]) => `${c}:${n}`).join(' '));
  return { rot100, medSurv: med(surv), medStarve100, pooledStarve100, pooledAte,
           launder, nat, table, wins, w4, w5, wf, wfTail, wfCapBit,
           exiled, rows: rows.length, surv, deaths, byPair: rows };
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
console.log(`rot/100d: control=${Math.round(b.rot100)}k armed=${Math.round(a.rot100)}k ratio=${ratio.toFixed(3)}  (GO: <= 0.80)`);
console.log(`windfall engagement (cluster-tail fires): ${a.wfTail}  (GO: >= 400, cap-bit every firing); mean fires=${a.wf} (informative)`);
console.log(`median survival: ${dSurv.toFixed(0)}d  (GO: >= -10d)`);
console.log(`starveDays/100d median: ${dStarve.toFixed(1)}  (guardrail (a): dose-aware pooled rate + attribution)`);
console.log(`laundered: control=${b.launder} armed=${a.launder}  (KILL if any arm-attributable laundering)`);

// Per-pair table + dose-response attribution.
const bMap = new Map(b.byPair.map(r => [r.policy + ':' + r.seed, r.e]));
const pairs = [];
for (const r of a.byPair) {
  const bc = bMap.get(r.policy + ':' + r.seed);
  if (bc) pairs.push({ policy: r.policy, seed: r.seed, survC: bc.days, survA: r.e.days,
    d: r.e.days - bc.days, wf: r.e.windfallFeasts || 0, starveC: bc.starveDays, starveA: r.e.starveDays,
    rateC: rate100(bc), rateA: rate100(r.e), endC: bc, endA: r.e });
}
console.log('\n=== PER-PAIR (policy seed  survC->survA  delta  windfalls) ===');
for (const p of pairs.slice().sort((x, y) => x.d - y.d))
  console.log(`  ${p.policy} s${p.seed}: ${p.survC}d -> ${p.survA}d  ${p.d >= 0 ? '+' : ''}${p.d}d  wf=${p.wf}`);
const r = pearson(pairs.map(p => p.wf), pairs.map(p => p.d));
console.log(`dose-response: Pearson(windfall count, survival delta) = ${r === null ? 'n/a' : r.toFixed(2)} (n=${pairs.length})`);
const attributed = r !== null && r < -0.3;
const harmUnattributed = r === null || Math.abs(r) < 0.3;
console.log(`attribution: ${attributed ? 'ATTRIBUTED (harm concentrates on high-engagement pairs)' : 'unattributed (harm does not track mechanism frequency)'}`);

// Guardrail (a) DOSE-AWARE (binding): per-pair starve RATE reported for
// every pair (collapse-aware, both >30d). FAIL iff pooled armed rate >
// pooled control rate x 1.15 AND the rate delta correlates positively with
// mechanism dose (Pearson > +0.3). The old 1.15x per-pair ratio table prints
// below as CONTEXT ONLY (metric review, not binding — retired in b2).
const ratePairs = pairs.filter(p => p.survC > 30 && p.survA > 30);
const rateDelta = ratePairs.map(p => p.rateA - p.rateC);
const rRate = pearson(ratePairs.map(p => p.wf), rateDelta);
const pooledFail = a.pooledStarve100 > b.pooledStarve100 * 1.15;
console.log('\n=== GUARDRAIL (a): dose-aware starve RATE (binding) ===');
console.log(`pooled rate: control=${b.pooledStarve100.toFixed(1)}/100d armed=${a.pooledStarve100.toFixed(1)}/100d (bar armed <= control x1.15 = ${(b.pooledStarve100 * 1.15).toFixed(1)}): ${pooledFail ? 'FAIL' : 'OK'}`);
console.log(`dose-response: Pearson(windfall count, per-pair rate delta) = ${rRate === null ? 'n/a' : rRate.toFixed(2)} (n=${ratePairs.length}); harm-attributed iff > +0.3`);
const goRate = !(pooledFail && rRate !== null && rRate > 0.3);
console.log(`guardrail (a) binding verdict: ${goRate ? 'PASS' : 'FAIL (pooled rise AND dose-attributed — real harm)'}`);

// Context (retired bar): the old 1.15x per-pair ratio table.
const rateFails = [];
console.log('context — retired 1.15x per-pair ratio (not binding):');
for (const p of ratePairs.slice().sort((x, y) => x.d - y.d)) {
  const bar = p.rateC * 1.15;
  const ok = p.rateA <= bar;
  if (!ok) rateFails.push(p);
  console.log(`  ${p.policy} s${p.seed}: control=${p.rateC.toFixed(1)}/100d armed=${p.rateA.toFixed(1)}/100d bar=${bar.toFixed(1)} ${ok ? 'OK' : 'trip'}`);
}
console.log(`retired-bar trips: ${rateFails.length ? rateFails.map(p => p.policy + ' s' + p.seed).join(', ') : 'none'}`);

// Guardrail (b) REVISED: exposure-matched new-mode with a >=2 count floor.
// A cause trips only if: exposure-matched armed count >= 2 AND absent from
// the control cause set. Exposure matching: each armed death counts only
// while its paired control twin was still alive (death.day <= survC).
const cCauses = new Set(Object.keys(b.deaths));
const expCounts = {};
for (const p of pairs) {
  for (const d of (p.endA.deaths || [])) {
    const day = d.day || 0;
    if (day > p.survC) continue; // exposure-time: control twin was already dead
    const c = canonCause(String(d.cause || '?').split(':')[0]);
    expCounts[c] = (expCounts[c] || 0) + 1;
  }
}
const newModes = Object.entries(expCounts).filter(([c, n]) => n >= 2 && !cCauses.has(c));
console.log('\n=== GUARDRAIL (b): exposure-matched new death modes (>=2 count floor) ===');
console.log('exposure-matched armed cause counts: ' + (Object.entries(expCounts).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}:${n}`).join(' ') || 'none'));
console.log(`control cause set: ${[...cCauses].join(', ') || 'none'}`);
console.log(`new death modes (armed >=2x, exposure-matched, not in control): ${newModes.length ? newModes.map(([c, n]) => c + ':' + n).join(', ') : 'none'}`);

console.log('\n=== VERDICT ===');
const goPrimary = ratio <= 0.80;
const goEngage = a.wfTail >= 400 && a.wfCapBit === a.wf;
const goSurv = dSurv >= -10, goLaunder = a.launder === 0;
const goNewMode = newModes.length === 0;
const goAte = a.pooledAte >= b.pooledAte * 0.98;
const goSurvSplit = !goSurv && harmUnattributed && ratio <= 0.70;
console.log(`primary rot/100d GO (<=0.80x): ${goPrimary ? 'PASS' : 'FAIL'} (ratio=${ratio.toFixed(3)})`);
console.log(`engagement GO (>=400 tail-burn fires, cap-bit every firing): ${goEngage ? 'PASS' : 'FAIL'} (tail=${a.wfTail}, cap-bit=${a.wfCapBit}/${a.wf} fires)`);
console.log(`survival guardrail (>= -10d): ${goSurv ? 'PASS' : 'FAIL' + (goSurvSplit ? ' — SPLIT: harm unattributed + primary<=0.70x (adopted metric review)' : ' — ' + (attributed ? 'attributed: KILL' : 'unattributed'))} (${dSurv.toFixed(0)}d)`);
console.log(`starve-rate guardrail (a) dose-aware: ${goRate ? 'PASS' : 'FAIL'}`);
console.log(`new-death-mode guardrail (b) exposure-matched >=2: ${goNewMode ? 'PASS' : 'FAIL'}`);
console.log(`laundering guardrail (d): ${goLaunder ? 'PASS' : 'FAIL'}`);
console.log(`ate/person-day guardrail (e) pooled >= control x0.98: ${goAte ? 'PASS' : 'FAIL'} (armed=${Math.round(a.pooledAte)} vs ${(b.pooledAte * 0.98).toFixed(0)} kcal/vday)`);
const go = goPrimary && goEngage && goLaunder && goRate && goNewMode && goAte && (goSurv || goSurvSplit);
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
