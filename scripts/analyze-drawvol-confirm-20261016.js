#!/usr/bin/env node
// scripts/analyze-drawvol-confirm-20261016.js — confirm verdict for
// sim-drawvol-confirm-b against the pre-registered header (MEASUREMENT §14).
//
// Reads evidence/2026-10-16/perseed-drawvol/<policy>-<side>-s<seed>.json for
// the confirm seeds only (env SEEDS or default 974-980,991). Prints the
// before/after table and the GO/KILL verdict per arm's binding header:
//
//   PRIMARY:      absolute starvedDays armed <= control
//   ENGAGEMENT:   armed holds when fd<6 >= 8 (else no-coverage -> KILL)
//   GUARDRAILS:   national >= control-2/16; median survival >= control-10d;
//                 no new death mode; armed aid+feast >= 50% of control
//
// Also counts byte-identical control/armed pairs (per-day hash arrays) —
// the non-engaged pairs must be identical to prove clean delegation.
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [974, 975, 976, 977, 978, 979, 980, 991]).filter(Number.isFinite);
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-drawvol');

const recs = [];
for (const p of POLICIES) for (const s of SEEDS) for (const side of ['control', 'armed']) {
  const f = path.join(EVID, `${p}-${side}-s${s}.json`);
  if (!fs.existsSync(f)) { console.error(`MISSING per-seed file: ${f}`); process.exit(2); }
  recs.push(JSON.parse(fs.readFileSync(f, 'utf8')));
}
const by = (side) => recs.filter(r => r.side === side);
const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const C = by('control'), A = by('armed');
const n = C.length;

console.log('== drawvol confirm verdict (seeds ' + SEEDS.join(',') + ') ==');
// PRIMARY
const sdC = sum(C, 'starvedDays'), sdA = sum(A, 'starvedDays');
const primPass = sdA <= sdC;
console.log(`PRIMARY starvedDays: control=${sdC} armed=${sdA} -> ${primPass ? 'PASS' : 'FAIL (NO-GO)'} (armed <= control)`);
console.log(`  starvation deaths: control=${sum(C, 'starvation')} armed=${sum(A, 'starvation')}`);
// ENGAGEMENT
let holdsFd6 = 0, holdsTotal = 0, feastHolds = 0, aidHolds = 0;
for (const r of A) {
  for (const e of (r.dvHoldEvents || [])) {
    if (e.fd < 6) { holdsFd6++; if (e.kind === 'feast') feastHolds++; else aidHolds++; }
  }
  holdsTotal += r.drawvolHeld || 0;
}
const engPass = holdsFd6 >= 8;
console.log(`ENGAGEMENT: armed holds total=${holdsTotal}, holds with fd<6=${holdsFd6} (feast=${feastHolds} aid=${aidHolds}) -> ${engPass ? 'PASS' : 'NO-COVERAGE DIAGNOSTIC -> KILL as invisible'} (bar >= 8)`);
// GUARDRAILS
const natC = sum(C, 'national'), natA = sum(A, 'national');
const natPass = natA >= natC - 2;
const medC = median(C.map(r => r.gameDays)), medA = median(A.map(r => r.gameDays));
const medPass = medA >= medC - 10;
console.log(`GUARD national: control=${natC}/${n} armed=${natA}/${n} -> ${natPass ? 'PASS' : 'FAIL'} (bar >= ${natC - 2})`);
console.log(`GUARD median survival: control=${medC.toFixed(1)}d armed=${medA.toFixed(1)}d -> ${medPass ? 'PASS' : 'FAIL'} (bar >= ${(medC - 10).toFixed(1)}d)`);
console.log(`  max survival: control=${Math.max(...C.map(r => r.gameDays))}d armed=${Math.max(...A.map(r => r.gameDays))}d`);
const verbs = (rs) => rs.reduce((t, r) => t + (r.dvAidGives || 0) + (r.dvFeasts || 0), 0);
const vc = verbs(C), va = verbs(A);
const verbPass = va >= vc / 2;
console.log(`GUARD social verbs (aid+feast count): control=${vc} armed=${va} -> ${verbPass ? 'PASS' : 'FAIL'} (bar >= ${(vc / 2).toFixed(1)})`);
// death modes
const agg = (rs) => { const o = {}; for (const r of rs) for (const [k, v] of Object.entries(r.deaths || {})) o[k] = (o[k] || 0) + v; return o; };
const dc = agg(C), da = agg(A);
const newModes = Object.keys(da).filter(k => !(k in dc));
const goneModes = Object.keys(dc).filter(k => !(k in da));
console.log(`GUARD death modes: control={${Object.keys(dc).join(', ')}} armed={${Object.keys(da).join(', ')}}`);
console.log(`  new in armed: ${newModes.length ? newModes.join(', ') : 'none'} -> ${newModes.length ? 'FAIL' : 'PASS'}`);
console.log(`  control-only (divergence singletons ok): ${goneModes.length ? goneModes.join(', ') : 'none'}`);
// byte-identical pairs
let ident = 0;
const identSeeds = [];
for (const r of A) {
  const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
  const same = c && c.hashes && r.hashes && c.hashes.length === r.hashes.length && c.hashes.every((h, i) => h === r.hashes[i]);
  if (same) { ident++; identSeeds.push(`${r.policyId}/s${r.seed}`); }
}
console.log(`byte-identical pairs: ${ident}/${n}${identSeeds.length ? ' (' + identSeeds.join(' ') + ')' : ''}`);
// hold autopsy: dayTotalBefore==0 feast-holds vs stacking
let zeroBefore = 0, stacking = 0;
for (const r of A) for (const e of (r.dvHoldEvents || [])) {
  if (e.fd >= 6) continue;
  if ((e.dayTotalBefore | 0) === 0 && e.kind === 'feast') zeroBefore++; else stacking++;
}
console.log(`hold autopsy: dayTotalBefore=0 feast-holds=${zeroBefore} vs stacking-channel=${stacking}`);
// wall numbers
const w = (rs) => ({ national: sum(rs, 'national'), table: sum(rs, 'table'), wins: sum(rs, 'wins'), w4: sum(rs, 'wave4'), w5: sum(rs, 'wave5'), arc2: sum(rs, 'arc2'), arc3: sum(rs, 'arc3'), arc4: sum(rs, 'arc4'), fourRealm: sum(rs, 'fourRealm'), exiled: sum(rs, 'exiled') });
const wc = w(C), wa = w(A);
console.log(`WALL control: nat=${wc.national}/${n} table=${wc.table}/${n} wins=${wc.wins}/${n} w4=${wc.w4} w5=${wc.w5} arc2-4=${wc.arc2}/${wc.arc3}/${wc.arc4} fourRealm=${wc.fourRealm} exiled=${wc.exiled}`);
console.log(`WALL armed:   nat=${wa.national}/${n} table=${wa.table}/${n} wins=${wa.wins}/${n} w4=${wa.w4} w5=${wa.w5} arc2-4=${wa.arc2}/${wa.arc3}/${wa.arc4} fourRealm=${wa.fourRealm} exiled=${wa.exiled}`);
console.log(`drawdown outflow: obl ${Math.round(sum(C, 'dvObligatedKcal') / 1000)}k/${Math.round(sum(A, 'dvObligatedKcal') / 1000)}k aid ${Math.round(sum(C, 'dvAidKcal') / 1000)}k(${sum(C, 'dvAidGives')}) -> ${Math.round(sum(A, 'dvAidKcal') / 1000)}k(${sum(A, 'dvAidGives')}) feast ${Math.round(sum(C, 'dvFeastKcal') / 1000)}k(${sum(C, 'dvFeasts')}) -> ${Math.round(sum(A, 'dvFeastKcal') / 1000)}k(${sum(A, 'dvFeasts')})`);
console.log(`fresh-rot kcal: control=${Math.round(sum(C, 'freshRotKcal') / 1000)}k armed=${Math.round(sum(A, 'freshRotKcal') / 1000)}k`);
// paired deltas
const deltas = [];
for (const r of A) {
  const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
  if (c) deltas.push({ seed: r.seed, p: r.policyId, d: r.starvedDays - c.starvedDays, h: r.drawvolHeld });
}
console.log('paired starvedDays deltas (armed-control; holds): ' + deltas.map(x => `${x.p}/s${x.seed}:${x.d >= 0 ? '+' : ''}${x.d}(h${x.h})`).join(' '));
const verdict = primPass && engPass && natPass && medPass && verbPass && newModes.length === 0;
console.log(`\nVERDICT: ${verdict ? 'GO — the layer stays landed' : 'KILL — per kill protocol (see pre-registered header)'}`);
if (!verdict) process.exit(1);
