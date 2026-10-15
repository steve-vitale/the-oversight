#!/usr/bin/env node
// compare-windefer-20261015.js — verdict for the deferral-discipline sweep
// (sim-findings #310, 2026-10-15).
//
// Pre-registered GO (binding, MEASUREMENT §14):
//   PRIMARY: deferred-died verdicts armed <= control (fewer lame-duck deaths).
//   CO-PRIMARY: wins armed >= control (discipline must not cost wins).
//   GUARDRAILS: median survival >= control-10d; national >= control-2/16;
//               no new death mode at n>=3.
// Honesty (hard fail): an armed run that fired ZERO holds must be
// byte-identical to its control on identical seeds — the hold is the
// layer's only legitimate delta.
// Also reports attribution buckets, holds fired, and the wall numbers.
// Usage: node scripts/compare-windefer-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-windefer');
const all = fs.readdirSync(EVID).filter(f => /-s\d+\.json$/.test(f))
  .map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

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

const byKey = {};
for (const r of all) byKey[`${r.policyId}|${r.side}|${r.seed}`] = r;

for (const policyId of ['belongfeast', 'leadfeast']) {
  for (const side of ['control', 'armed']) {
    const rs = all.filter(r => r.policyId === policyId && r.side === side && !r.error);
    console.log(`\n=== ${policyId} / ${side} (n=${rs.length}) ===`);
    console.log(`  national: ${sum(rs, 'national')}/${rs.length}  table: ${sum(rs, 'everTable')}/${rs.length}  won: ${sum(rs, 'won')}/${rs.length}`);
    console.log(`  wave4-5: ${sum(rs, 'wave45')}/${rs.length}  median: ${med(rs, 'gameDays')}d  max: ${Math.max(...rs.map(r => r.gameDays || 0))}d  exiled: ${sum(rs, 'exiled')}/${rs.length}  holds: ${sum(rs, 'holds')}`);
    const byVerdict = {};
    for (const r of rs) {
      const v = (r.wintrace && r.wintrace.verdict) || '?';
      (byVerdict[v] = byVerdict[v] || []).push(r.seed);
    }
    console.log('  attribution: ' + Object.keys(byVerdict).sort().map(v => `${v}=${byVerdict[v].length}[${byVerdict[v].join(',')}]`).join(' '));
    for (const r of rs) {
      const a = r.wintrace || {};
      if (a.sitEver || r.everTable) {
        const decs = (r.decisions || []).map(d => `d${d.day}:${d.hold ? 'HOLD' : 'walk'}`).join(' ');
        console.log(`    s${r.seed}: verdict=${a.verdict} seat=${a.seatFirst || '-'} entered=[${(a.pathsEntered || []).join('>')}] defer=${(a.deferDays || []).length ? 'd' + a.deferDays[0] : '-'} answers=${r.tableAnswers} holds=${r.holds}${decs ? ' [' + decs + ']' : ''} | ${(a.evidence || []).join(' // ')}`);
      }
    }
  }
}

console.log('\n=== HONESTY: zero-hold armed runs byte-identical to control ===');
{
  let okAll = true;
  for (const r of all.filter(r => r.side === 'armed' && !r.error)) {
    const c = byKey[`${r.policyId}|control|${r.seed}`];
    if (!c || c.error) { console.log(`  SKIP s${r.seed} ${r.policyId}: no clean control`); continue; }
    if ((r.holds | 0) > 0) { console.log(`  s${r.seed} ${r.policyId}: ${r.holds} hold(s) fired — divergence legitimate, skipped`); continue; }
    const ha = r.hashes || [], hb = c.hashes || [];
    const same = ha.length === hb.length && ha.every((h, i) => h === hb[i]);
    console.log(`  ${same ? 'IDENTICAL' : 'DIVERGED '} s${r.seed} ${r.policyId} (0 holds, ${ha.length} day-hashes)`);
    if (!same) okAll = false;
  }
  verdict('HONESTY zero-hold armed == control', okAll, okAll ? 'all zero-hold runs byte-identical' : 'DIVERGENCE without a hold — investigate');
}

console.log('\n=== PRE-REGISTERED VERDICT ===');
const ctrl = all.filter(r => r.side === 'control' && !r.error);
const armed = all.filter(r => r.side === 'armed' && !r.error);
const dd = rs => rs.filter(r => (r.wintrace || {}).verdict === 'deferred-died').length;
verdict('PRIMARY (deferred-died armed <= control)', dd(armed) <= dd(ctrl),
  `armed=${dd(armed)}/16 control=${dd(ctrl)}/16`);
verdict('CO-PRIMARY (wins armed >= control)', sum(armed, 'won') >= sum(ctrl, 'won'),
  `armed=${sum(armed, 'won')}/16 control=${sum(ctrl, 'won')}/16`);
verdict('GUARDRAIL national >= control-2', sum(armed, 'national') >= sum(ctrl, 'national') - 2,
  `armed=${sum(armed, 'national')} control=${sum(ctrl, 'national')}`);
verdict('GUARDRAIL median >= control-10d', med(armed, 'gameDays') >= med(ctrl, 'gameDays') - 10,
  `armed=${med(armed, 'gameDays')}d control=${med(ctrl, 'gameDays')}d`);
{
  const cc = {}, pc = {};
  for (const r of ctrl) for (const [k, v] of Object.entries(r.deaths || {})) cc[k] = (cc[k] || 0) + v;
  for (const r of armed) for (const [k, v] of Object.entries(r.deaths || {})) pc[k] = (pc[k] || 0) + v;
  const novel = Object.keys(pc).filter(k => !(k in cc) && pc[k] >= 3);
  verdict('GUARDRAIL no new death mode (n>=3)', novel.length === 0,
    novel.length ? `novel armed-only: ${novel.map(k => k + ':' + pc[k]).join(', ')}` : 'none');
}

console.log(`\n${go ? 'WINDEFER GO' : 'WINDEFER NO-GO'} — see evidence/2026-10-15/sim-deferraldisc.md`);
process.exit(go ? 0 : 1);
