#!/usr/bin/env node
// scripts/compare-pathselect-20261015.js — verdict for the PATHSELECT
// door-chooser sweep (sim-pathselect, 2026-10-15, sim-findings #311).
// Reads evidence/2026-10-15/perseed-pathselect/summary.json.
//
// Pre-registered (binding, MEASUREMENT §14):
//   PRIMARY: total wins armed ≥ control.
//   CO-PRIMARY: non-feared-path wins armed ≥ 2.
//   GUARDRAILS: national ≥ control−2/16; median survival ≥ control−10d;
//               no new death mode at n≥3.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-pathselect');
const rows = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8')).filter(r => !r.error);
const ok = (s) => rows.filter(r => r.side === s);
const median = (a) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const C = ok('control'), A = ok('armed');
const wins = (rs) => rs.filter(r => r.won);
const doorsOf = (r) => {
  const a = (r.wintrace || {});
  return a.pathEntered || (a.verdict === 'WIN' ? 'unknown-win' : null);
};

console.log('=== PATHSELECT verdict (pre-registered, §14 binding) ===');
console.log(`n: control ${C.length}, armed ${A.length}`);
const cw = wins(C).length, aw = wins(A).length;
const go1 = aw >= cw;
console.log(`PRIMARY total wins: control ${cw}/${C.length}, armed ${aw}/${A.length} — ${go1 ? 'GO' : 'NO-GO'} (bar: armed ≥ control)`);
const aNonFeared = wins(A).filter(r => doorsOf(r) && doorsOf(r) !== 'feared');
const go2 = aNonFeared.length >= 2;
console.log(`CO-PRIMARY non-feared-path wins (armed): ${aNonFeared.length} — ${go2 ? 'GO' : 'NO-GO'} (bar ≥ 2)`);
for (const r of wins(A)) console.log(`  armed win: ${r.policyId} s${r.seed} door=${doorsOf(r)} day=${r.gameDays} verdict=${(r.wintrace || {}).verdict}`);

const doors = {};
for (const r of A) for (const d of (r.pathDoors || [])) doors[d.walked] = (doors[d.walked] || 0) + 1;
console.log('doors walked (armed, all sittings incl. re-offers):', JSON.stringify(doors));

const cn = C.filter(r => r.national).length, an = A.filter(r => r.national).length;
const goN = an >= cn - 2;
console.log(`GUARDRAIL national: control ${cn}/${C.length}, armed ${an}/${A.length} — ${goN ? 'GO' : 'NO-GO'} (bar ≥ control−2)`);

const cm = median(C.map(r => r.gameDays)), am = median(A.map(r => r.gameDays));
const goM = am >= cm - 10;
console.log(`GUARDRAIL median survival: control ${cm}d, armed ${am}d — ${goM ? 'GO' : 'NO-GO'} (bar ≥ control−10d)`);
// Per-seed matched non-win median (wintrace metric review: win-completion confounds the all-runs median).
const cmN = median(C.filter(r => !r.won).map(r => r.gameDays)), amN = median(A.filter(r => !r.won).map(r => r.gameDays));
console.log(`  (review metric) non-win median: control ${cmN}d, armed ${amN}d`);

const modes = (rs) => { const m = {}; for (const r of rs) { const d = r.deaths || {}; for (const k of Object.keys(d)) m[k] = (m[k] || 0) + (d[k] || 0); } return m; };
const cM = modes(C), aM = modes(A);
const newModes = Object.keys(aM).filter(k => (aM[k] || 0) >= 3 && !(cM[k] || 0));
console.log(`GUARDRAIL death modes: ${newModes.length ? 'NEW MODE ≥3: ' + newModes.join(',') : 'none new'} — ${newModes.length ? 'NO-GO' : 'GO'}`);
console.log('  control modes:', JSON.stringify(cM));
console.log('  armed modes:  ', JSON.stringify(aM));

const table = (rs) => rs.filter(r => r.everTable).length;
console.log(`table reached: control ${table(C)}/${C.length}, armed ${table(A)}/${A.length}`);
const w45 = (rs) => rs.filter(r => r.wave45).length;
console.log(`wave 4–5 unlocks: control ${w45(C)}/${C.length}, armed ${w45(A)}/${A.length}`);

console.log(`\nVERDICT: ${go1 && go2 && goN && goM && !newModes.length ? 'GO' : 'NO-GO'}` +
  `${go1 && go2 && !(goN && goM && !newModes.length) ? ' — guardrail miss, see metric review' : ''}`);
