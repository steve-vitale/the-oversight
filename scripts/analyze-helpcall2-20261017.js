#!/usr/bin/env node
'use strict';
// analyze-helpcall2-20261017.js — verdict analyzer for the sim-helpcall2 arm.
//
// Pre-registered (binding):
//   PRIMARY: post-invite raid-attributed deaths (fieldfightsrc tagging) —
//     armed <= 0.75x own paired control. GO iff
//     sum(armed.raidDeathsPostInvite) / sum(control.raidDeathsPostInvite) <= 0.75.
//   DIAGNOSTIC SECONDARY: aid-call attribution — every aid call on apex
//     raids classified accepted/refused (unattributed must be 0);
//     acceptance share reported (not judged).
//   GUARDRAILS: national armed >= control-2; exiled 0 (armed); matched
//     non-win median survival armed >= control-10d; no new death mode at
//     n>=3 armed.
//
// Reports the wall numbers (national / table / wins, wave 4-5 unlocks,
// median survival) every run.
//
// Run: node scripts/analyze-helpcall2-20261017.js
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-helpcall2');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
const armed = rows.filter(r => r.armed);
const control = rows.filter(r => !r.armed);

function pair(a, c) {
  return a.map(x => {
    const y = c.find(z => z.seed === x.seed && z.policyId === x.policyId);
    return { seed: x.seed, policy: x.policyId, a: x, c: y };
  });
}
const pairs = pair(armed, control);
const missing = pairs.filter(p => !p.c);
if (missing.length) { console.error('MISSING pairs:', missing.map(p => `${p.policy}-s${p.seed}`).join(', ')); process.exit(1); }
console.log(`pairs: ${pairs.length} (armed ${armed.length}, control ${control.length})`);

const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = (rs, k) => { const v = rs.map(r => r[k] || 0).sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const mean = (rs, k) => rs.length ? rs.reduce((t, r) => t + (r[k] || 0), 0) / rs.length : 0;

console.log('\n--- wall numbers ---');
console.log(`national : armed ${sum(armed, 'national')}/${armed.length}  control ${sum(control, 'national')}/${control.length}`);
console.log(`table    : armed ${sum(armed, 'table')}/${armed.length}  control ${sum(control, 'table')}/${control.length}`);
console.log(`wins     : armed ${sum(armed, 'wins')}/${armed.length}  control ${sum(control, 'wins')}/${control.length}`);
console.log(`exiled   : armed ${sum(armed, 'exiled')}/${armed.length}  control ${sum(control, 'exiled')}/${control.length}`);
console.log(`wave4-5 unlocks: armed ${sum(armed, 'wave45')}/${armed.length}  control ${sum(control, 'wave45')}/${control.length}`);
console.log(`median survival: armed ${med(armed, 'gameDays')}d  control ${med(control, 'gameDays')}d`);
console.log(`max survival   : armed ${Math.max(...armed.map(r => r.gameDays || 0))}d  control ${Math.max(...control.map(r => r.gameDays || 0))}d`);

// --- PRIMARY: post-invite raid-attributed deaths, paired ---
const aPI = sum(armed, 'raidDeathsPostInvite'), cPI = sum(control, 'raidDeathsPostInvite');
console.log('\n--- PRIMARY: post-invite raid-attributed deaths (armed <= 0.75x control) ---');
console.log(`post-invite raid deaths: armed ${aPI} (mean ${mean(armed, 'raidDeathsPostInvite').toFixed(2)}/run)  control ${cPI} (mean ${mean(control, 'raidDeathsPostInvite').toFixed(2)}/run)`);
console.log(`(all raid deaths, ungated: armed ${sum(armed, 'raidDeaths')}  control ${sum(control, 'raidDeaths')})`);
const noInvite = pairs.filter(p => p.a.inviteDay == null).length;
console.log(`pairs with no invite (excluded from primary): ${noInvite}/${pairs.length}`);
let primaryVerdict;
if (cPI === 0 && aPI === 0) primaryVerdict = 'NO-GO (no coverage — zero post-invite raid deaths on both sides)';
else if (cPI === 0) primaryVerdict = 'NO-GO (control denominator 0, armed > 0)';
else {
  const ratio = aPI / cPI;
  primaryVerdict = ratio <= 0.75 ? `GO (${ratio.toFixed(3)}x <= 0.75x)` : `NO-GO (${ratio.toFixed(3)}x > 0.75x)`;
}
console.log(`PRIMARY: ${primaryVerdict}`);
console.log('\npaired post-invite raidDeaths (armed-control) per seed/policy:');
for (const p of pairs) {
  const d = (p.a.raidDeathsPostInvite || 0) - (p.c.raidDeathsPostInvite || 0);
  console.log(`  s${p.seed} ${p.policy}: armed=${p.a.raidDeathsPostInvite} (inv ${p.a.inviteDay == null ? '—' : 'd' + p.a.inviteDay}) control=${p.c.raidDeathsPostInvite} (inv ${p.c.inviteDay == null ? '—' : 'd' + p.c.inviteDay}) delta=${d >= 0 ? '+' : ''}${d}  hcPlace=${(p.a.hc || {}).placements || 0}`);
}

// --- SECONDARY: aid-call attribution (armed only) ---
let nPlace = 0, unattributed = 0, enRoute = 0, accepted = 0, refused = 0, arrived = 0, arrivedParty = 0, errors = 0;
const retCounts = {}, verdictCounts = {};
for (const r of armed) {
  const h = r.hc || {};
  nPlace += h.placements || 0;
  unattributed += h.unattributed || 0;
  enRoute += h.enRoute || 0;
  accepted += h.accepted || 0;
  refused += h.refused || 0;
  arrived += h.aidArrived || 0;
  arrivedParty += h.aidArrivedParty || 0;
  errors += h.errors || 0;
  for (const [k, v] of Object.entries(h.retCounts || {})) retCounts[k] = (retCounts[k] || 0) + v;
  for (const [k, v] of Object.entries(h.verdictCounts || {})) verdictCounts[k] = (verdictCounts[k] || 0) + v;
}
console.log('\n--- SECONDARY: help-call placements & attribution (armed only, diagnostic) ---');
console.log(`placements: ${nPlace}`);
console.log(`  engine returns: ${JSON.stringify(retCounts)}`);
console.log(`  verdicts: ${JSON.stringify(verdictCounts)}`);
console.log(`  accepted=${accepted} refused=${refused} aidArrived(parties)=${arrived} aidArrived(fighters)=${arrivedParty} enRouteAtRunEnd=${enRoute}`);
console.log(`  unattributed placements: ${unattributed}  (diagnostic requirement: 0 for 100% attribution)`);
console.log(`  aid-system errors: ${errors}`);
const judged = accepted + refused;
console.log(`  acceptance share: ${judged ? (accepted / judged).toFixed(3) : 'n/a'} (${accepted}/${judged} judged; reported, not judged)`);
console.log(`SECONDARY attribution: ${unattributed === 0 ? '100% — requirement met' : 'VIOLATED — unattributed placements exist'}`);

// --- Guardrails ---
const causesA = {}, causesC = {};
for (const r of armed) for (const [k, v] of Object.entries(r.causeCounts || {})) causesA[k] = (causesA[k] || 0) + v;
for (const r of control) for (const [k, v] of Object.entries(r.causeCounts || {})) causesC[k] = (causesC[k] || 0) + v;
const newModes3 = Object.entries(causesA).filter(([k, v]) => v >= 3 && !(k in causesC));
const newModesSmall = Object.entries(causesA).filter(([k, v]) => v < 3 && !(k in causesC));
console.log('\n--- guardrails ---');
console.log(`new death modes in armed vs control at n>=3: ${newModes3.length ? newModes3.map(([k, v]) => `${k}(${v})`).join(', ') : 'none'} ${newModes3.length ? '— VIOLATED' : '— HOLD'}`);
if (newModesSmall.length) console.log(`  (noted, n<3: ${newModesSmall.map(([k, v]) => `${k}(${v})`).join(', ')})`);
console.log(`national guardrail (>= control-2): ${sum(armed, 'national') >= sum(control, 'national') - 2 ? 'HOLD' : 'VIOLATED'} (${sum(armed, 'national')} vs ${sum(control, 'national')})`);
console.log(`exiled guardrail (armed == 0): ${sum(armed, 'exiled') === 0 ? 'HOLD' : 'VIOLATED'} (${sum(armed, 'exiled')})`);
const nonWinA = armed.filter(r => !r.won), nonWinC = control.filter(r => !r.won);
const medA = med(nonWinA, 'gameDays'), medC = med(nonWinC, 'gameDays');
console.log(`matched non-win median survival: armed ${medA}d (n=${nonWinA.length}) vs control ${medC}d (n=${nonWinC.length}) — ${medA >= medC - 10 ? 'HOLD' : 'VIOLATED'} (need >= ${medC - 10}d)`);
console.log(`aid-runner road deaths: armed ${sum(armed, 'aidRunnerDeaths')}  control ${sum(control, 'aidRunnerDeaths')}`);

function shares(rs) {
  const t = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.causeCounts || {})) t[k] = (t[k] || 0) + 1 * v;
  const tot = Object.values(t).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}(${(100 * v / tot).toFixed(0)}%)`).join(' ');
}
console.log(`\ndeath shares armed  : ${shares(armed)}`);
console.log(`death shares control: ${shares(control)}`);
