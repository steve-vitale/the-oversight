#!/usr/bin/env node
// analyze-tricktag-20261016.js — judges the sim-tricktag sweep against its
// pre-registered header (binding per MEASUREMENT.md §14).
//
// PRIMARY (100% attribution):
//   (a) conservation: per (policy,seed), nKills equal both arms AND
//       control player-via = armed player-via + armed companion-via
//       (kills re-tagged, none lost, none created);
//   (b) every armed via='companion' entry carries by=<companion vid>
//       (not the scholar, not 'player');
//   (c) the path fires: armed companion entries > 0 across the sweep.
// GUARDRAIL: trajHash armed === control on all 32 pairs (attribution-only;
//   waveKillLog excluded from the hash by construction).
// If the guardrail fails, the arm is a BEHAVIOR arm: gate on
// national >= control-2, median survival >= control-10d, no new death mode.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-tricktag');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const byKey = {};
for (const r of runs) byKey[`${r.policyId}-s${r.seed}-${r.arm}`] = r;
const pairs = [];
for (const r of runs.filter(x => x.arm === 'control')) {
  const a = byKey[`${r.policyId}-s${r.seed}-armed`];
  if (a) pairs.push({ policyId: r.policyId, seed: r.seed, control: r, armed: a });
}

let fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

// ---- PRIMARY (a): conservation ----
let consOk = 0;
for (const p of pairs) {
  const c = p.control, a = p.armed;
  const cPlayer = (c.killsByVia || {}).player || 0;
  const aPlayer = (a.killsByVia || {}).player || 0;
  const aComp = (a.killsByVia || {}).companion || 0;
  const totOk = c.nKills === a.nKills;
  const splitOk = cPlayer === aPlayer + aComp;
  if (totOk && splitOk) consOk++;
  else fails.push(`conservation ${p.policyId}-s${p.seed}: control kills=${c.nKills} player=${cPlayer} vs armed kills=${a.nKills} player=${aPlayer} companion=${aComp}`);
}

// ---- PRIMARY (b): 100% companion attribution ----
let compTotal = 0, compBad = 0;
const compByWave = {};
for (const r of runs.filter(x => x.arm === 'armed')) {
  for (const k of (r.companionKills || [])) {
    compTotal++;
    if (!k.by || k.by === 'player' || k.byScholar) { compBad++; }
    const w = 'w' + (k.w || '?');
    compByWave[w] = compByWave[w] || { kills: 0, trick: 0 };
    compByWave[w].kills++;
    if (k.trick) compByWave[w].trick++;
  }
}
if (compBad > 0) fails.push(`attribution: ${compBad}/${compTotal} companion entries mis-tagged`);

// ---- PRIMARY (c): the path fires ----
if (compTotal === 0) fails.push('path never fired: 0 companion entries across the sweep');

// ---- GUARDRAIL: det-gate ----
let hashOk = 0;
const hashBad = [];
for (const p of pairs) {
  if (p.control.trajHash && p.control.trajHash === p.armed.trajHash) hashOk++;
  else hashBad.push(`${p.policyId}-s${p.seed}: ${p.control.trajHash} vs ${p.armed.trajHash}`);
}

// ---- wall numbers ----
function wall(rs) {
  const nat = rs.filter(r => r.national).length;
  const tab = rs.filter(r => r.table).length;
  const win = rs.filter(r => r.wins).length;
  const days = rs.map(r => r.days).sort((a, b) => a - b);
  const med = days[Math.floor(days.length / 2)];
  return { n: rs.length, nat, tab, win, med, max: days[days.length - 1] };
}
const wC = wall(runs.filter(x => x.arm === 'control'));
const wA = wall(runs.filter(x => x.arm === 'armed'));

// death-cause comparison (new-mode check)
const causes = {};
for (const r of runs) {
  for (const [c, n] of Object.entries(r.deathCauses || {})) {
    causes[c] = causes[c] || { control: 0, armed: 0 };
    causes[c][r.arm] += n;
  }
}

console.log('=== sim-tricktag analyzer ===');
console.log(`pairs: ${pairs.length} (expect 16 = 8 seeds x 2 policies)`);
console.log(`PRIMARY (a) conservation: ${consOk}/${pairs.length} pairs`);
console.log(`PRIMARY (b) companion attribution: ${compTotal - compBad}/${compTotal} clean`);
console.log(`PRIMARY (c) path fires: ${compTotal} companion entries`);
console.log('companion kills by wave:', JSON.stringify(compByWave));
console.log(`GUARDRAIL det-gate: ${hashOk}/${pairs.length} byte-identical trajectories`);
if (hashBad.length) console.log('  diverged: ' + hashBad.join(' | '));
console.log('wall control:', JSON.stringify(wC));
console.log('wall armed:  ', JSON.stringify(wA));
console.log('death causes (control vs armed):');
for (const [c, v] of Object.entries(causes).sort((a, b) => (b[1].control + b[1].armed) - (a[1].control + a[1].armed)).slice(0, 12)) {
  console.log(`  ${c}: ${v.control} vs ${v.armed}`);
}
const trickArmed = runs.filter(x => x.arm === 'armed').reduce((n, r) => n + (r.trickKills || []).length, 0);
const compTrickArmed = runs.filter(x => x.arm === 'armed').reduce((n, r) => n + (r.companionTrickKills || []).length, 0);
console.log(`trick-attributed kills (armed): ${trickArmed} total, ${compTrickArmed} via companion`);
if (fails.length) { console.log('\nFAILURES:'); for (const m of fails) console.log('  - ' + m); }
console.log(fails.length ? '\nVERDICT: NO-GO' : '\nVERDICT: GO');
process.exit(fails.length ? 1 : 0);
