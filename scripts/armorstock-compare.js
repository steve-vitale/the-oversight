#!/usr/bin/env node
// scripts/armorstock-compare.js — §15 before/after comparison for sim-armorstock.
//
// §15 DEVIATION (same as sim-shellcounter-b, sim-shellrevive-b): the official
// balance-panel driver cannot express this arm (policy-side layer;
// FEASTSCALE_R13 substrate; leadfeast/belongfeast are not panel policies; the
// contract lacks deferral-margin/reserve/scholar-armor metrics). Light
// per-seed panel-schema JSONs are emitted by the sweep for the wall + arm
// metrics; this script runs paired before/after statistics on the
// pre-registered metrics and writes the compare .md attached to the evidence.
//
// Reads evidence/2026-10-17/perseed-armorstock/*.json (control-*.json,
// armed-*.json), pairs by seed+policy, and reports:
//   PRIMARY: wave-4 unlock share armed-control (GO >= +3)
//   SECONDARY: deferral armor-margin>=2 coverage armed-control
//   GUARDRAILS: starvation deaths, median survival, death-cause modes,
//     national/table/wins, mass-death check on unlocks.
// Paired sign test on per-pair unlock deltas; means on margins.
//
// Usage: node scripts/armorstock-compare.js
// Writes: evidence/2026-10-17/armorstock-compare-20261017.md
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-armorstock');
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-17', 'armorstock-compare-20261017.md');

function load() {
  const rows = [];
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith('.json')) continue;
    try { rows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))); }
    catch (e) { console.error('skip ' + f); }
  }
  return rows.filter(r => !r.crashed);
}

function main() {
  const rows = load();
  const pairs = [];
  const key = r => `${r.policyId}-s${r.seed}`;
  const byKey = {};
  for (const r of rows) byKey[`${r.arm}:${key(r)}`] = r;
  for (const r of rows.filter(x => x.arm === 'control')) {
    const a = byKey[`armed:${key(r)}`];
    if (a) pairs.push({ control: r, armed: a, key: key(r) });
  }
  const L = [];
  L.push('# sim-armorstock — balanced before/after (§15 compare)');
  L.push('');
  L.push(`Pairs: ${pairs.length} (seed+policy matched, identical seeds per arm).`);
  L.push(`Sweep commit: ${(rows[0] && rows[0].sweepCommit) || '?'}`);
  L.push('');

  // PRIMARY
  const cW4 = rows.filter(r => r.arm === 'control' && r.maxWaveUnlocked >= 4).length;
  const aW4 = rows.filter(r => r.arm === 'armed' && r.maxWaveUnlocked >= 4).length;
  const dW4 = aW4 - cW4;
  const pairDelta = pairs.map(p => (p.armed.maxWaveUnlocked >= 4 ? 1 : 0) - (p.control.maxWaveUnlocked >= 4 ? 1 : 0));
  const pos = pairDelta.filter(d => d > 0).length, neg = pairDelta.filter(d => d < 0).length;
  L.push('## PRIMARY: wave-4 unlocks (binding, GO needs armed-control >= +3)');
  L.push('');
  L.push(`- control: ${cW4}/${rows.filter(r => r.arm === 'control').length}`);
  L.push(`- armed:   ${aW4}/${rows.filter(r => r.arm === 'armed').length}`);
  L.push(`- delta:   ${dW4 >= 0 ? '+' : ''}${dW4}  (paired sign: +${pos}/-${neg}/${pairDelta.length - pos - neg})`);
  L.push(`- verdict: ${dW4 >= 3 ? 'GO' : 'NO-GO'}`);
  L.push('');

  // SECONDARY: deferral margin>=2
  const mgn = r => (r.deferralSnapshot && (r.deferralArmorMargin | 0) >= 2) ? 1 : 0;
  const cM = rows.filter(r => r.arm === 'control').reduce((t, r) => t + mgn(r), 0);
  const aM = rows.filter(r => r.arm === 'armed').reduce((t, r) => t + mgn(r), 0);
  L.push('## SECONDARY: deferral armor-margin >= 2 (report-only)');
  L.push('');
  L.push(`- control: ${cM} runs with margin>=2 at last deferral`);
  L.push(`- armed:   ${aM} runs with margin>=2 at last deferral`);
  L.push(`- delta:   ${aM - cM >= 0 ? '+' : ''}${aM - cM}`);
  L.push('');

  // per-pair table
  L.push('## Per-pair');
  L.push('');
  L.push('| pair | control w4 | armed w4 | control deferMargin | armed deferMargin | control starv | armed starv |');
  L.push('|---|---|---|---|---|---|---|');
  for (const p of pairs) {
    L.push(`| ${p.key} | ${p.control.maxWaveUnlocked >= 4 ? 'W4@' + p.control.firstW4Day : '-'} | ${p.armed.maxWaveUnlocked >= 4 ? 'W4@' + p.armed.firstW4Day : '-'} | ${p.control.deferralArmorMargin} | ${p.armed.deferralArmorMargin} | ${p.control.deaths.starv} | ${p.armed.deaths.starv} |`);
  }
  L.push('');

  // GUARDRAILS
  const sum = arm => {
    const rs = rows.filter(r => r.arm === arm);
    const starv = rs.reduce((t, r) => t + r.deaths.starv, 0);
    const ds = rs.map(r => r.gameDays).sort((x, y) => x - y);
    const med = ds.length ? ds[Math.floor(ds.length / 2)] : 0;
    const mx = ds.length ? ds[ds.length - 1] : 0;
    const causes = {};
    for (const r of rs) for (const [c, n] of Object.entries(r.deaths.byCause)) causes[c] = (causes[c] || 0) + n;
    const nat = rs.filter(r => r.national).length;
    const won = rs.filter(r => r.won).length;
    const lost = rs.filter(r => r.endReason === 'village-lost').length;
    return { n: rs.length, starv, med, mx, causes, nat, won, lost };
  };
  const gc = sum('control'), ga = sum('armed');
  L.push('## Guardrails');
  L.push('');
  L.push(`- starvation deaths: control ${gc.starv} / armed ${ga.starv} (kill if armed > control+2 = ${gc.starv + 2}) → ${ga.starv > gc.starv + 2 ? 'KILL' : 'hold'}`);
  L.push(`- median survival (gameDays): control ${gc.med} / armed ${ga.med} (kill if armed < control-10) → ${ga.med < gc.med - 10 ? 'KILL' : 'hold'}`);
  L.push(`- max survival: control ${gc.mx} / armed ${ga.mx}`);
  L.push(`- national: control ${gc.nat}/${gc.n} / armed ${ga.nat}/${ga.n}`);
  L.push(`- wins: control ${gc.won}/${gc.n} / armed ${ga.won}/${ga.n}`);
  L.push(`- village-lost: control ${gc.lost}/${gc.n} / armed ${ga.lost}/${ga.n}`);
  L.push(`- death causes control: ${JSON.stringify(gc.causes)}`);
  L.push(`- death causes armed:   ${JSON.stringify(ga.causes)}`);
  const cModes = new Set(Object.keys(gc.causes)), newModes = Object.keys(ga.causes).filter(c => !cModes.has(c));
  L.push(`- new death modes on armed: ${newModes.length ? newModes.join(', ') + ' → KILL' : 'none → hold'}`);
  L.push('');

  // arm mechanism reads
  const avgReserve = arm => {
    const rs = rows.filter(r => r.arm === arm && r.reserveNow != null);
    return rs.length ? (rs.reduce((t, r) => t + r.reserveNow, 0) / rs.length).toFixed(2) : '?';
  };
  const avgScholarP = arm => {
    const rs = rows.filter(r => r.arm === arm && r.scholarPNow != null);
    return rs.length ? (rs.reduce((t, r) => t + r.scholarPNow, 0) / rs.length).toFixed(1) : '?';
  };
  L.push('## Arm mechanism (end-state reads + leg engagement)');
  L.push('');
  L.push(`- mean reserve (trophy pieces in scholar pack, end): control ${avgReserve('control')} / armed ${avgReserve('armed')}`);
  L.push(`- mean scholar worn P (end): control ${avgScholarP('control')} / armed ${avgScholarP('armed')}`);
  const armedRows = rows.filter(r => r.arm === 'armed' && r.armorstockCounters);
  if (armedRows.length) {
    const tot = k => armedRows.reduce((t, r) => t + ((r.armorstockCounters || {})[k] | 0), 0);
    L.push(`- leg engagement (armed, ${armedRows.length} runs): recovered=${tot('asRecovered')} crafted=${tot('asCrafted')} (tries ${tot('asCraftTries')}) reservePeakTotal=${tot('asReservePeak')} successions=${tot('asSuccessions')} recoveryTries=${tot('asRecoveryTries')}`);
    const ctrlNull = rows.filter(r => r.arm === 'control').every(r => r.armorstockCounters == null);
    L.push(`- control counters null (no leg writes): ${ctrlNull}`);
  }
  L.push('');
  L.push('§15 deviation noted: official balance-panel driver cannot express this policy-side arm; paired statistics above run on the pre-registered metrics directly.');
  L.push('');

  fs.writeFileSync(OUT, L.join('\n'));
  console.log(L.join('\n'));
  console.log(`\nwrote ${OUT}`);
}

main();
