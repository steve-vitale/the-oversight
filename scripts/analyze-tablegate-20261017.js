#!/usr/bin/env node
// scripts/analyze-tablegate-20261017.js — analyzer for the sim-tablegate
// diagnostic (flesh-out loop, axis scale-onramp, 2026-10-17).
// Reads evidence/2026-10-17/perseed-tablegate/*.json and reports the
// single-blocking-gate attribution per run plus the diagnostic GO/MISS
// verdict. No sims run here.
// Usage: node scripts/analyze-tablegate-20261017.js [--out path]
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-tablegate');

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
  const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  const n = recs.length;
  const nat = recs.filter(r => r.national === 1);
  const gates = {};
  for (const r of recs) gates[r.gate] = (gates[r.gate] || 0) + 1;
  const named = recs.filter(r => r.gate && r.gate !== 'unattributed');
  // PRIMARY (diagnostic GO): >=14/16 national-arrival runs get a named
  // single blocking gate (>=90% attribution of national runs).
  const natNamed = nat.filter(r => r.gate && r.gate !== 'unattributed').length;
  const attr = nat.length ? natNamed / nat.length : 0;
  const goAttr = natNamed >= 14;
  const goComplete = n === 16 && named.length === 16;
  const instErr = recs.reduce((a, r) => a + (r.instrumentErrors | 0), 0);

  // seat-never-earned sub-bar frequencies (the bar that never filled).
  const subFreq = {};
  for (const r of recs) {
    if (r.gate === 'seat-never-earned' && Array.isArray(r.gateSub)) {
      for (const s of r.gateSub) subFreq[s] = (subFreq[s] || 0) + 1;
    }
  }
  // Best-seat detail at national runs: which bars hold, which don't.
  const natDetail = {};
  for (const r of nat) {
    const d = r.bestSeatDetail || {};
    for (const k of ['w1', 'w2', 'w3', 'contestsN', 'crisesN', 'rank', 'stage', 'foodDeeds']) {
      if (!natDetail[k]) natDetail[k] = [];
      natDetail[k].push(d[k]);
    }
  }

  const L = [];
  L.push('# tablegate attribution (seeds 3801-3808 x {leadcourt,belongseek})');
  L.push(`runs=${n} national=${nat.length}/16 medianSurv=${median(recs.map(r => r.gameDays)).toFixed(1)}d instErr=${instErr}`);
  L.push('');
  L.push('## Gates');
  for (const [g, c] of Object.entries(gates).sort((a, b) => b[1] - a[1])) {
    const of = recs.filter(r => r.gate === g).map(r => r.policyId + '-s' + r.seed).join(' ');
    L.push(`- ${g}: ${c}/16 — ${of}`);
  }
  L.push('');
  L.push('## seat-never-earned sub-bars (missing-bar frequency)');
  for (const [s, c] of Object.entries(subFreq).sort((a, b) => b[1] - a[1])) L.push(`- ${s}: ${c}/16`);
  L.push('');
  L.push('## Per-run (national runs only, blocking gate + best seat detail)');
  for (const r of nat) {
    const d = r.bestSeatDetail || {};
    L.push(`- ${r.policyId}-s${r.seed} gate=${r.gate} natDay=${r.nationalDay} best=${JSON.stringify(d)} sub=${JSON.stringify(r.gateSub)} realmEnd=${JSON.stringify(r.realmEnd && { a: r.realmEnd.activeLinks, s: r.realmEnd.subordinates })} breadth=${r.breadthEnd} stage=${r.stageEnd} standing=${r.standingEnd}`);
  }
  L.push('');
  L.push('## DIAGNOSTIC VERDICT');
  L.push(`attribution: ${natNamed}/${nat.length} national runs named (${(attr * 100).toFixed(1)}% >= 90%: ${attr >= 0.9 ? 'GO' : 'MISS'})`);
  L.push(`completion: ${n}/16 runs, ${named.length}/16 named (${goComplete ? 'GO' : 'MISS'})`);
  L.push(`primary GO (>=14/16 national named): ${goAttr ? 'GO' : 'MISS'}`);
  const txt = L.join('\n');
  const out = process.argv.indexOf('--out') >= 0 ? process.argv[process.argv.indexOf('--out') + 1] : null;
  if (out) fs.writeFileSync(out, txt + '\n');
  console.log(txt);
}

main();
