#!/usr/bin/env node
// compare-winpursuit-20261015.js — verdict for the PHASE 2 pursuit sweep
// (sim-wintrace, sim-findings #233).
//
// Pre-registered GO (binding, MEASUREMENT §14):
//   PRIMARY: table→win conversions (pursued won − control won) ≥ +1.
//   GUARDRAILS: national ≥ control−2/16; median survival ≥ control−10d;
//               no new death mode at n≥3.
// Also reports the attribution buckets on the pursued side (the diagnostic
// question: does the win get attempted now?) and the wall numbers.
// Usage: node scripts/compare-winpursuit-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-winpursuit');
const all = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));

const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = (rs, k) => {
  const v = rs.map(r => r[k] || 0).sort((a, b) => a - b);
  if (!v.length) return 0;
  return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};

let go = true;
function verdict(name, ok, detail) {
  console.log(`  ${ok ? 'GO  ' : 'MISS'} ${name} — ${detail}`);
  if (!ok) go = false;
}

for (const policyId of ['belongfeast', 'leadfeast']) {
  for (const side of ['control', 'pursued']) {
    const rs = all.filter(r => r.policyId === policyId && r.side === side && !r.error);
    console.log(`\n=== ${policyId} / ${side} (n=${rs.length}) ===`);
    console.log(`  national: ${sum(rs, 'national')}/${rs.length}  table: ${sum(rs, 'everTable')}/${rs.length}  won: ${sum(rs, 'won')}/${rs.length}`);
    console.log(`  wave4-5: ${sum(rs, 'wave45')}/${rs.length}  median: ${med(rs, 'gameDays')}d  max: ${Math.max(...rs.map(r => r.gameDays || 0))}d  exiled: ${sum(rs, 'exiled')}/${rs.length}`);
    if (side === 'pursued') {
      const byVerdict = {};
      for (const r of rs) {
        const v = (r.wintrace && r.wintrace.verdict) || '?';
        (byVerdict[v] = byVerdict[v] || []).push(r.seed);
      }
      console.log('  attribution: ' + Object.keys(byVerdict).sort().map(v => `${v}=${byVerdict[v].length}[${byVerdict[v].join(',')}]`).join(' '));
      for (const r of rs) {
        const a = r.wintrace || {};
        if (a.sitEver || r.everTable) {
          console.log(`    s${r.seed}: verdict=${a.verdict} seat=${a.seatFirst || '-'} entered=[${(a.pathsEntered || []).join('>')}] defer=${(a.deferDays || []).length ? 'd' + a.deferDays[0] : '-'} answers=${r.tableAnswers} | ${(a.evidence || []).join(' // ')}`);
        }
      }
    }
  }
}

console.log('\n=== PRE-REGISTERED PHASE 2 VERDICT ===');
const ctrl = all.filter(r => r.side === 'control' && !r.error);
const pursued = all.filter(r => r.side === 'pursued' && !r.error);
const conversions = sum(pursued, 'won') - sum(ctrl, 'won');
verdict('PRIMARY (pursued−control wins ≥ +1)', conversions >= 1,
  `pursued won=${sum(pursued, 'won')}/16 control won=${sum(ctrl, 'won')}/16 → Δ=${conversions >= 0 ? '+' : ''}${conversions}`);
verdict('GUARDRAIL national ≥ control−2', sum(pursued, 'national') >= sum(ctrl, 'national') - 2,
  `pursued=${sum(pursued, 'national')} control=${sum(ctrl, 'national')}`);
verdict('GUARDRAIL median ≥ control−10d', med(pursued, 'gameDays') >= med(ctrl, 'gameDays') - 10,
  `pursued=${med(pursued, 'gameDays')}d control=${med(ctrl, 'gameDays')}d`);
// New death mode at n≥3: death causes present pursued-only with count ≥3.
{
  const cc = {}, pc = {};
  for (const r of ctrl) for (const [k, v] of Object.entries(r.deaths || {})) cc[k] = (cc[k] || 0) + v;
  for (const r of pursued) for (const [k, v] of Object.entries(r.deaths || {})) pc[k] = (pc[k] || 0) + v;
  const novel = Object.keys(pc).filter(k => !(k in cc) && pc[k] >= 3);
  verdict('GUARDRAIL no new death mode (n≥3)', novel.length === 0,
    novel.length ? `novel pursued-only: ${novel.map(k => k + ':' + pc[k]).join(', ')}` : 'none');
}

console.log(`\n${go ? 'PHASE 2 GO' : 'PHASE 2 NO-GO'} — see evidence/2026-10-15/sim-wintrace.md`);
process.exit(go ? 0 : 1);
