#!/usr/bin/env node
// scripts/aggregate-grieftrib-20261017.js — verdict aggregation for
// sim-grieftrib (2026-10-17). Reads the per-seed JSONs in
// evidence/2026-10-17/perseed-grieftrib/ and judges the pre-registered
// PRIMARY + guardrails (§14 binding). The sweep chunks write per-seed
// JSONs; this is the single judge.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.env.TELEMETRY_DIR || 'evidence/2026-10-17/perseed-grieftrib';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const C = rows.filter(r => r.arm === 'control');
const A = rows.filter(r => r.arm === 'armed');
const Cb = C.filter(r => r.policy === 'belongfeast');
const Ab = A.filter(r => r.policy === 'belongfeast');

const cnt = (rs, f) => rs.filter(f).length;
const sumK = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

const bMean = (rs) => mean(rs.map(r => r.subTermsMax || 0));
const controlGrabs = sumK(Cb, 'grabsLanded');
const ratio = bMean(Ab) / Math.max(1, bMean(Cb));
const substrateOk = controlGrabs >= 1;
const go = substrateOk && ratio <= 0.75;

const sum = {};
for (const [nm, rs] of [['control', C], ['armed', A]]) {
  sum[nm] = {
    n: rs.length,
    grabsLanded: sumK(rs, 'grabsLanded'),
    subTermsMaxMean: Math.round(mean(rs.map(r => r.subTermsMax || 0))),
    gtStaged: sumK(rs, 'gtStaged'), gtGift: sumK(rs, 'gtGift'), gtVisit: sumK(rs, 'gtVisit'),
    tributePaidTotal: sumK(rs, 'tributePaidTotal'),
    leverageLandings: sumK(rs, 'leverageLandings'),
    brokenSub: sumK(rs, 'brokenSub'),
    subTrustMean: Math.round(mean(rs.filter(r => r.subTrustMean != null).map(r => r.subTrustMean)) * 10) / 10,
    national: cnt(rs, r => r.national), table: cnt(rs, r => r.table),
    wins: cnt(rs, r => r.wins), w4: cnt(rs, r => r.maxWave >= 4), w5: cnt(rs, r => r.maxWave >= 5),
    medSurv: med(rs.map(r => r.survivalDays || 0)), exiled: cnt(rs, r => r.exiled),
  };
}

const g1 = sum.armed.national >= sum.control.national - 2;
const g2 = sum.armed.brokenSub <= sum.control.brokenSub;
const g3 = (sum.armed.subTrustMean || 0) >= (sum.control.subTrustMean || 0) - 5;

console.log('=== GRIEFTRIB VERDICT (n=' + rows.length + ') ===');
console.log(JSON.stringify(sum, null, 1));
console.log(`\nSUBSTRATE control belongfeast grabs landed: ${controlGrabs} -> ${substrateOk ? 'OK' : 'INCONCLUSIVE'}`);
console.log(`PRIMARY belongfeast subTermsMax mean: control=${Math.round(bMean(Cb))} armed=${Math.round(bMean(Ab))} ratio=${ratio.toFixed(2)} <= 0.75 -> ${go ? 'GO' : (substrateOk ? 'NO-GO' : 'INCONCLUSIVE')}`);
console.log(`GUARD national armed >= control-2: ${sum.armed.national} >= ${sum.control.national - 2} -> ${g1 ? 'OK' : 'MISS'}`);
console.log(`GUARD broken subordinate links armed <= control: ${sum.armed.brokenSub} <= ${sum.control.brokenSub} -> ${g2 ? 'OK' : 'MISS'}`);
console.log(`GUARD sub trust mean armed >= control-5: ${sum.armed.subTrustMean} >= ${((sum.control.subTrustMean || 0) - 5).toFixed(1)} -> ${g3 ? 'OK' : 'MISS'}`);
console.log(`GUARD verdict line: ${go && g1 && g2 && g3 ? 'ALL GREEN' : 'REVIEW'}`);
