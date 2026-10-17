#!/usr/bin/env node
'use strict';
// analyze-helpcost-20261017.js — verdict analyzer for the sim-helpcost arm.
//
// Pre-registered (binding):
//   PRIMARY: attribution completeness of the armed-control total-death
//     delta. delta = sum(control.nDeaths) - sum(armed.nDeaths).
//       perExposureGain = (C.raidDeaths - A.raidDeaths)
//                         - (C.apexEpisodes - A.apexEpisodes) * (C.raidDeaths / max(1,C.apexEpisodes))
//       exposureAsym    = (C.apexEpisodes - A.apexEpisodes) * (C.raidDeaths / max(1,C.apexEpisodes))
//       runnerCost      = -sum(armed.aidRunnerDeaths)            [counted cost]
//       absenceCorr     = -sum(armed non-raid deaths with day in a runner trip window)  [correlational]
//       noInviteNonRaid = non-raid/non-runner/non-absence death delta over no-invite pairs
//     unattributed = delta - sum(classified).
//     GO iff |delta| > 0 and |unattributed| <= 0.20 * |delta|.
//   SECONDARY: replicate-or-refute the median-survival gap (prior 155.5 vs
//     172d): median gameDays, paired sign test, clock-rate
//     (gameDays/harness-days), endReason village-lost, total deaths.
//   GUARDRAILS: national armed >= control-2; exiled 0 (armed); no NEW death
//     mode beyond aid-runner at n>=3 armed.
//
// Run: node scripts/analyze-helpcost-20261017.js
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-helpcost');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
const armed = rows.filter(r => r.armed);
const control = rows.filter(r => !r.armed);

const pairs = armed.map(x => {
  const y = control.find(z => z.seed === x.seed && z.policyId === x.policyId);
  return { seed: x.seed, policy: x.policyId, a: x, c: y };
});
const missing = pairs.filter(p => !p.c);
if (missing.length) { console.error('MISSING pairs:', missing.map(p => `${p.policy}-s${p.seed}`).join(', ')); process.exit(1); }
console.log(`pairs: ${pairs.length} (armed ${armed.length}, control ${control.length})`);

const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = rs => { const v = rs.map(r => r.gameDays || 0).sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const mean = (rs, k) => rs.length ? rs.reduce((t, r) => t + (r[k] || 0), 0) / rs.length : 0;

function costOf(r) { return r.cost || {}; }
function tripWindows(r) { return (costOf(r).tripWindows || []).map(w => [w.firstDay, w.lastDay]); }
function inWindow(day, wins) { return wins.some(([f, l]) => day >= f && day <= l); }
// Non-raid deaths (armed) whose day falls in a runner trip window.
// Excludes aid-runner deaths (counted in runnerCost) and subtracts
// day-matched hc-tagged raid deaths (counted in raidGain) to keep the
// partition clean.
function absenceNonRaid(r) {
  const wins = tripWindows(r);
  if (!wins.length) return 0;
  const raidDays = r.raidDeathDays || [];
  const deaths = r.deathDays || [];
  let n = 0, raidInWin = 0;
  for (const [day, cause] of deaths) {
    if (cause === 'aid-runner') continue;
    if (inWindow(day, wins)) n++;
  }
  for (const d of raidDays) if (inWindow(d, wins)) raidInWin++;
  return Math.max(0, n - raidInWin);
}

console.log('\n--- wall numbers ---');
console.log(`national : armed ${sum(armed, 'national')}/${armed.length}  control ${sum(control, 'national')}/${control.length}`);
console.log(`table    : armed ${sum(armed, 'table')}/${armed.length}  control ${sum(control, 'table')}/${control.length}`);
console.log(`wins     : armed ${sum(armed, 'wins')}/${armed.length}  control ${sum(control, 'wins')}/${control.length}`);
console.log(`exiled   : armed ${sum(armed, 'exiled')}/${armed.length}  control ${sum(control, 'exiled')}/${control.length}`);
console.log(`wave4-5 unlocks: armed ${sum(armed, 'wave45')}/${armed.length}  control ${sum(control, 'wave45')}/${control.length}`);
console.log(`median survival: armed ${med(armed)}d  control ${med(control)}d`);
console.log(`max survival   : armed ${Math.max(...armed.map(r => r.gameDays || 0))}d  control ${Math.max(...control.map(r => r.gameDays || 0))}d`);
console.log(`total deaths   : armed ${sum(armed, 'nDeaths')}  control ${sum(control, 'nDeaths')}`);
console.log(`village-lost ends: armed ${armed.filter(r => r.endReason === 'village-lost' || r.endReason === 'village-dead').length}/${armed.length}  control ${control.filter(r => r.endReason === 'village-lost' || r.endReason === 'village-dead').length}/${control.length}`);
console.log(`mean clockRate (gameDays/harness-days): armed ${mean(armed, 'clockRate').toFixed(3)}  control ${mean(control, 'clockRate').toFixed(3)}`);

// --- engagement volume (both sides) ---
const sumCost = (rs, k) => rs.reduce((t, r) => t + ((r.cost || {})[k] || 0), 0);
console.log('\n--- engagement volume (apex-raid census, both sides) ---');
console.log(`apex raid episodes: armed ${sumCost(armed, 'apexRaidEpisodes')}  control ${sumCost(control, 'apexRaidEpisodes')}`);
console.log(`apex crisis days  : armed ${sumCost(armed, 'apexCrisisDays')}  control ${sumCost(control, 'apexCrisisDays')}`);
const sumPlacements = rs => rs.reduce((t, r) => t + ((r.hc || {}).placements || 0), 0);
console.log(`placements         : armed ${sumPlacements(armed)}  (per-episode: ${(sumPlacements(armed) / Math.max(1, sumCost(armed, 'apexRaidEpisodes'))).toFixed(2)})`);
console.log(`runner trips       : armed ${sumCost(armed, 'runnerTrips')}  runnerAwayDayParts=${sumCost(armed, 'runnerAwayDayParts')}  in-crisis=${sumCost(armed, 'absenceCrisisDayParts')}`);
console.log(`aid-runner deaths  : armed ${sum(armed, 'aidRunnerDeaths')}  control ${sum(control, 'aidRunnerDeaths')}`);

// --- PRIMARY: attribution completeness of the death delta ---
const dN = sum(control, 'nDeaths'), aN = sum(armed, 'nDeaths');
const delta = dN - aN;
const dRaid = sum(control, 'raidDeaths'), aRaid = sum(armed, 'raidDeaths');
const raidGain = dRaid - aRaid;
const cEpN = sumCost(control, 'apexRaidEpisodes'), aEpN = sumCost(armed, 'apexRaidEpisodes');
const rC = dRaid / Math.max(1, cEpN);
const exposureAsym = (cEpN - aEpN) * rC;
const perExposureGain = raidGain - exposureAsym;
const runnerCost = -sum(armed, 'aidRunnerDeaths');
let absenceCorr = 0;
const absenceByRun = [];
for (const r of armed) { const n = absenceNonRaid(r); absenceCorr -= n; absenceByRun.push({ seed: r.seed, policy: r.policyId, n }); }
const noInvitePairs = pairs.filter(p => p.a.inviteDay == null && p.c.inviteDay == null);
let noInviteNonRaid = 0;
for (const p of noInvitePairs) {
  const cNR = (p.c.nDeaths || 0) - (p.c.raidDeaths || 0);
  const aNR = (p.a.nDeaths || 0) - (p.a.raidDeaths || 0) - (p.a.aidRunnerDeaths || 0) - absenceNonRaid(p.a);
  noInviteNonRaid += cNR - aNR;
}
const classified = perExposureGain + exposureAsym + runnerCost + absenceCorr + noInviteNonRaid;
const unattributed = delta - classified;
console.log('\n--- PRIMARY: attribution completeness of the armed-control death delta ---');
console.log(`delta (control.deaths - armed.deaths) = ${dN} - ${aN} = ${delta >= 0 ? '+' : ''}${delta}`);
console.log(`  raidGain (ungated)      : ${raidGain >= 0 ? '+' : ''}${raidGain.toFixed(1)}  (post-invite: armed ${sum(armed, 'raidDeathsPostInvite')} vs control ${sum(control, 'raidDeathsPostInvite')})`);
console.log(`    exposureAsym         : ${exposureAsym >= 0 ? '+' : ''}${exposureAsym.toFixed(1)}  (episodes C=${cEpN} A=${aEpN}, rC=${rC.toFixed(2)} raid deaths/episode)`);
console.log(`    perExposureGain      : ${perExposureGain >= 0 ? '+' : ''}${perExposureGain.toFixed(1)}`);
console.log(`  runnerCost (counted)   : ${runnerCost}  (aid-runner deaths, armed)`);
console.log(`  absenceCorr (corr.)    : ${absenceCorr}  (non-raid deaths in runner trip windows, armed)`);
console.log(`  noInviteNonRaid        : ${noInviteNonRaid >= 0 ? '+' : ''}${noInviteNonRaid}  (pairs with no invite either side: ${noInvitePairs.length}/${pairs.length})`);
console.log(`  classified total       : ${classified >= 0 ? '+' : ''}${classified.toFixed(1)}`);
console.log(`  UNATTRIBUTED           : ${unattributed >= 0 ? '+' : ''}${unattributed.toFixed(1)}  (|unattr|/|delta| = ${delta !== 0 ? (Math.abs(unattributed) / Math.abs(delta)).toFixed(3) : 'n/a'})`);
let primaryVerdict;
if (delta === 0) primaryVerdict = (unattributed === 0) ? 'GO (zero delta, zero residual)' : 'NO-GO (zero delta with nonzero residual)';
else primaryVerdict = Math.abs(unattributed) <= 0.20 * Math.abs(delta)
  ? `GO (|unattributed| ${Math.abs(unattributed).toFixed(1)} <= 20% of |delta| ${(0.2 * Math.abs(delta)).toFixed(1)})`
  : `NO-GO (|unattributed| ${Math.abs(unattributed).toFixed(1)} > 20% of |delta| ${(0.2 * Math.abs(delta)).toFixed(1)})`;
console.log(`PRIMARY: ${primaryVerdict}`);
console.log(`  (absence runs: ${absenceByRun.filter(x => x.n).map(x => `s${x.seed}/${x.policy}:${x.n}`).join(' ') || 'none'})`);

// --- runner-death situations ---
console.log('\n--- aid-runner death situations (armed) ---');
for (const r of armed) {
  for (const d of ((r.cost || {}).runnerDeaths || [])) {
    console.log(`  s${r.seed} ${r.policyId} d${d.day}: wave=${d.wave} parts=${d.parts} temper=${d.temper} abilities=${d.abilities} danger=${d.danger} mishap=${d.mishap} target=${d.target}`);
  }
}

// --- SECONDARY: median-survival gap replicate-or-refute ---
const diffs = pairs.map(p => (p.a.gameDays || 0) - (p.c.gameDays || 0));
const nz = diffs.filter(d => d !== 0);
const pos = nz.filter(d => d > 0).length, neg = nz.filter(d => d < 0).length;
// two-sided sign test
let pval = 1;
if (nz.length) {
  const n = nz.length, k = Math.min(pos, neg);
  let s = 0;
  for (let i = 0; i <= k; i++) s += binom(n, i);
  pval = Math.min(1, 2 * s / Math.pow(2, n));
}
function binom(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - i + 1) / i; return r; }
console.log('\n--- SECONDARY: median-survival gap replicate-or-refute (prior 155.5 vs 172d) ---');
console.log(`median gameDays: armed ${med(armed)}d  control ${med(control)}d`);
console.log(`paired diffs (armed-control): ${diffs.map(d => (d >= 0 ? '+' : '') + d).join(' ')}`);
console.log(`sign test on ${nz.length} nonzero diffs: +${pos}/-${neg}, two-sided p=${pval.toFixed(3)}`);
console.log(`clock-rate (tick-stall check): armed ${mean(armed, 'clockRate').toFixed(3)} vs control ${mean(control, 'clockRate').toFixed(3)}`);

// --- guardrails ---
const causesA = {}, causesC = {};
for (const r of armed) for (const [k, v] of Object.entries(r.causeCounts || {})) causesA[k] = (causesA[k] || 0) + v;
for (const r of control) for (const [k, v] of Object.entries(r.causeCounts || {})) causesC[k] = (causesC[k] || 0) + v;
const newModes = Object.entries(causesA).filter(([k, v]) => v >= 3 && k !== 'aid-runner' && !(k in causesC));
console.log('\n--- guardrails ---');
console.log(`new death modes in armed vs control at n>=3 (excl. aid-runner): ${newModes.length ? newModes.map(([k, v]) => `${k}(${v})`).join(', ') + ' — VIOLATED' : 'none — HOLD'}`);
console.log(`aid-runner (counted cost, pre-registered): armed ${sum(armed, 'aidRunnerDeaths')} — not a violation`);
console.log(`national guardrail (>= control-2): ${sum(armed, 'national') >= sum(control, 'national') - 2 ? 'HOLD' : 'VIOLATED'} (${sum(armed, 'national')} vs ${sum(control, 'national')})`);
console.log(`exiled guardrail (armed == 0): ${sum(armed, 'exiled') === 0 ? 'HOLD' : 'VIOLATED'} (${sum(armed, 'exiled')})`);

function shares(rs) {
  const t = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.causeCounts || {})) t[k] = (t[k] || 0) + 1 * v;
  const tot = Object.values(t).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}(${(100 * v / tot).toFixed(0)}%)`).join(' ');
}
console.log(`\ndeath shares armed  : ${shares(armed)}`);
console.log(`death shares control: ${shares(control)}`);
