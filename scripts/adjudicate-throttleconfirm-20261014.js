#!/usr/bin/env node
// THROTTLE-CONFIRM adjudication: compares before vs armed OUT files
// (scripts/measure-prodthrottle-20261013.js format) against the
// pre-registered GO/guardrails in evidence/2026-10-14/sim-throttleconfirm-b.md.
// Usage: node scripts/adjudicate-throttleconfirm-20261014.js <before.json> <armed.json>
'use strict';
const fs = require('fs');
const [bPath, aPath] = process.argv.slice(2);
const B = JSON.parse(fs.readFileSync(bPath, 'utf8'));
const A = JSON.parse(fs.readFileSync(aPath, 'utf8'));

const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const deaths = (rows) => { const o = {}; for (const r of rows) for (const [k, n] of Object.entries(r.deaths || {})) o[k] = (o[k] || 0) + n; return o; };
const starve = (d) => Object.entries(d).filter(([k]) => /starv|hunger|famine/i.test(k)).reduce((t, [, n]) => t + n, 0);
const combat = (d) => Object.entries(d).filter(([k]) => /combat|monster|ambush|fight|kill/i.test(k)).reduce((t, [, n]) => t + n, 0);

const bR = B.rows, aR = A.rows;
const bRot = sum(bR, 'rotFresh'), aRot = sum(aR, 'rotFresh');
const bMed = med(bR.map(r => r.days)), aMed = med(aR.map(r => r.days));
const bNat = sum(bR, 'national'), aNat = sum(aR, 'national');
const bHun = sum(bR, 'hungryDays'), aHun = sum(aR, 'hungryDays');
const bD = deaths(bR), aD = deaths(aR);
const bSt = starve(bD), aSt = starve(aD);
const bCo = combat(bD), aCo = combat(aD);
const bMx = Math.max(...bR.map(r => r.days)), aMx = Math.max(...aR.map(r => r.days));
const bW4 = bR.filter(r => r.waveReach >= 4).length, aW4 = aR.filter(r => r.waveReach >= 4).length;
const bW5 = bR.filter(r => r.waveReach >= 5).length, aW5 = aR.filter(r => r.waveReach >= 5).length;
const bT = sum(bR, 'table'), aT = sum(aR, 'table'), bW = sum(bR, 'wins'), aW = sum(aR, 'wins');
const bEx = sum(bR, 'exiled'), aEx = sum(aR, 'exiled');

const checks = [];
const go = (name, cond, detail) => { checks.push({ name, pass: !!cond, detail }); };

go('PRIMARY: armed rotFresh <= 0.85 * before', aRot <= 0.85 * bRot,
  `armed ${(aRot / 1000).toFixed(1)}k vs before ${(bRot / 1000).toFixed(1)}k = ${((aRot / bRot - 1) * 100).toFixed(1)}%`);
go('GUARD national: armed >= before-2', aNat >= bNat - 2, `${aNat} vs ${bNat}`);
go('GUARD median survival (one-sided): armed >= before-10d', aMed >= bMed - 10, `${aMed}d vs ${bMed}d`);
go('GUARD hungryDays: armed <= before + max(5, 10%)', aHun <= bHun + Math.max(5, 0.10 * bHun), `${aHun} vs ${bHun}`);
go('GUARD starvation deaths: armed <= before + max(5, 25%)', aSt <= bSt + Math.max(5, 0.25 * bSt), `${aSt} vs ${bSt}`);
go('GUARD combat deaths: no 2x explosion', aCo <= 2 * bCo, `${aCo} vs ${bCo}`);

console.log('=== THROTTLE-CONFIRM adjudication ===');
console.log(`rotFresh: ${(bRot / 1000).toFixed(1)}k -> ${(aRot / 1000).toFixed(1)}k (${((aRot / bRot - 1) * 100).toFixed(1)}%)`);
console.log(`rotPreserved: ${(sum(bR, 'rotPreserved') / 1000).toFixed(1)}k -> ${(sum(aR, 'rotPreserved') / 1000).toFixed(1)}k`);
console.log(`median/max survival: ${bMed}/${bMx}d -> ${aMed}/${aMx}d`);
console.log(`national: ${bNat} -> ${aNat}; table: ${bT} -> ${aT}; wins: ${bW} -> ${aW}; exiled: ${bEx} -> ${aEx}`);
console.log(`wave4 reach: ${bW4} -> ${aW4}; wave5 reach: ${bW5} -> ${aW5}`);
console.log(`hungryDays: ${bHun} -> ${aHun}; starvation: ${bSt} -> ${aSt}; combat: ${bCo} -> ${aCo}`);
console.log(`total deaths: ${Object.values(bD).reduce((t, n) => t + n, 0)} -> ${Object.values(aD).reduce((t, n) => t + n, 0)}`);
console.log(`redirects (armed): ${sum(aR, 'throttleRedirects')} (before: ${sum(bR, 'throttleRedirects')})`);
console.log(`death causes before: ${JSON.stringify(bD)}`);
console.log(`death causes armed:  ${JSON.stringify(aD)}`);
console.log('--- verdicts ---');
for (const c of checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'} ${c.name} — ${c.detail}`);
const allPass = checks.every(c => c.pass);
console.log(allPass ? '\nCONFIRM: GO' : '\nCONFIRM: NO-GO');
process.exit(allPass ? 0 : 1);
