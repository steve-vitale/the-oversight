#!/usr/bin/env node
// scripts/analyze-huntstaff-b.js — analyzer for the huntstaff-b arm sweep.
// (Consistent with the other -chan-b instruments; the mandated name
// analyze-huntstaff-b.js is free — the old arm kept only sweep/test/sense.)
//
// Reads evidence/2026-10-21/perseed-huntstaff-b/<side>-<policy>-s<seed>-rep1.json
// (rep 2 is the det-gate pair only) and judges the pre-registered PRIMARY +
// guardrails. Prints the verdict table; exits 0 on GO, 1 on NO-GO.
//
// Usage: node scripts/analyze-huntstaff-b.js
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-huntstaff-b');
const SEEDS = [8901, 8902, 8903, 8904, 8905, 8906, 8907, 8908];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(side, policyId, seed, rep) {
  const want = side === 'armed' ? policyId.replace('feast', 'staffhunt') : policyId;
  const f = path.join(EVID, `${side}-${policyId}-s${seed}-rep${rep}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
const sum = a => a.reduce((t, x) => t + (x || 0), 0);
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

function main() {
  const ctrl = [], armed = [];
  for (const s of SEEDS) for (const p of POLICIES) {
    const c = load('control', p, s, 1), a = load('armed', p, s, 1);
    if (!c || !a) { console.error(`MISSING per-seed file for ${p}/s${s}`); process.exit(2); }
    ctrl.push(c); armed.push(a);
  }

  // PRIMARY: pooled hunt-channel kcal/day
  const pooled = rows => { const d = sum(rows.map(r => r.days)); return d ? sum(rows.map(r => r.huntKcal)) / d : 0; };
  const huntCtrl = pooled(ctrl), huntArmed = pooled(armed);
  const primary = huntArmed - huntCtrl;
  const PRIMARY_BAR = 120;

  // Guardrails
  const starvCtrl = sum(ctrl.map(r => r.starvationDeaths)), starvArmed = sum(armed.map(r => r.starvationDeaths));
  const medCtrl = med(ctrl.map(r => r.days)), medArmed = med(armed.map(r => r.days));
  const natCtrl = sum(ctrl.map(r => r.national ? 1 : 0)), natArmed = sum(armed.map(r => r.national ? 1 : 0));
  const fastPer100 = rows => { const d = sum(rows.map(r => r.days)); return d ? sum(rows.map(r => r.fastRot)) / d * 100 : 0; };
  const fCtrl = fastPer100(ctrl), fArmed = fastPer100(armed);
  const fastRatio = fCtrl ? fArmed / fCtrl : null;
  const laundArmed = sum(armed.map(r => r.laundered));
  const kindsCtrl = new Set(ctrl.flatMap(r => r.deaths.map(d => d.cause)));
  const newKinds = [...new Set(armed.flatMap(r => r.deaths.map(d => d.cause)))].filter(k => !kindsCtrl.has(k));

  // Wall numbers
  const wall = rows => ({
    n: rows.length, won: sum(rows.map(r => r.won ? 1 : 0)),
    national: sum(rows.map(r => r.national ? 1 : 0)), table: sum(rows.map(r => r.table ? 1 : 0)),
    wave4: sum(rows.map(r => r.maxWave >= 4 ? 1 : 0)), wave5: sum(rows.map(r => r.maxWave >= 5 ? 1 : 0)),
    medSurv: med(rows.map(r => r.days)), maxSurv: Math.max(...rows.map(r => r.days)),
  });
  const wCtrl = wall(ctrl), wArmed = wall(armed);

  // Death-cause shares
  const causeShare = rows => { const m = {}; for (const r of rows) for (const d of r.deaths) m[d.cause] = (m[d.cause] || 0) + 1; return m; };

  // staffing telemetry
  const staffTot = sum(armed.map(r => r.staffed)), staffDaysTot = sum(armed.map(r => r.staffDays));

  const lines = [];
  const P = (name, cond, detail) => { lines.push(`${cond ? 'GO  ' : 'NO-GO'} ${name}${detail ? ' — ' + detail : ''}`); return cond; };
  let verdict = true;
  lines.push('== sim-huntstaff-b pilot verdict (pre-registered, binding) ==');
  verdict = P('PRIMARY: pooled hunt kcal/day armed-control >= +120',
    primary >= PRIMARY_BAR, `+${primary.toFixed(1)} (armed ${huntArmed.toFixed(1)} vs control ${huntCtrl.toFixed(1)})`) && verdict;
  verdict = P('GUARD starvation deaths <= control', starvArmed <= starvCtrl, `${starvArmed} vs ${starvCtrl}`) && verdict;
  verdict = P('GUARD median survival >= control-10d', medArmed >= medCtrl - 10, `${medArmed}d vs ${medCtrl}d`) && verdict;
  verdict = P('GUARD national >= control-2', natArmed >= natCtrl - 2, `${natArmed} vs ${natCtrl}`) && verdict;
  verdict = P('GUARD fast-rot pooled/100d <= 1.15x', fastRatio !== null && fastRatio <= 1.15,
    `${fastRatio !== null ? fastRatio.toFixed(2) + 'x' : 'n/a'} (${fArmed.toFixed(0)} vs ${fCtrl.toFixed(0)}/100d)`) && verdict;
  verdict = P('GUARD laundering == 0', laundArmed === 0, `armed=${laundArmed}`) && verdict;
  verdict = P('GUARD no new death mechanism', newKinds.length === 0, newKinds.join(',') || 'none') && verdict;
  lines.push('');
  lines.push(`wall control: ${JSON.stringify(wCtrl)}`);
  lines.push(`wall armed:   ${JSON.stringify(wArmed)}`);
  lines.push(`death causes control: ${JSON.stringify(causeShare(ctrl))}`);
  lines.push(`death causes armed:   ${JSON.stringify(causeShare(armed))}`);
  lines.push(`staffing: ${staffTot} assignments / ${staffDaysTot} staff-days across ${armed.length} armed runs`);
  lines.push(`garden (secondary): control ${pooled(ctrl.map(r => ({ days: r.days, huntKcal: r.gardenKcal })) ).toFixed(1)} vs armed ${pooled(armed.map(r => ({ days: r.days, huntKcal: r.gardenKcal })) ).toFixed(1)} kcal/day`);
  lines.push('');
  lines.push(verdict ? 'VERDICT: GO' : 'VERDICT: NO-GO');
  console.log(lines.join('\n'));

  const out = path.join(__dirname, '..', 'evidence', '2026-10-21', 'huntstaff-b-verdict.json');
  fs.writeFileSync(out, JSON.stringify({
    primary: { armed: huntArmed, control: huntCtrl, delta: primary, bar: PRIMARY_BAR, go: primary >= PRIMARY_BAR },
    guardrails: {
      starvation: { armed: starvArmed, control: starvCtrl, go: starvArmed <= starvCtrl },
      medianSurvival: { armed: medArmed, control: medCtrl, go: medArmed >= medCtrl - 10 },
      national: { armed: natArmed, control: natCtrl, go: natArmed >= natCtrl - 2 },
      fastRot: { armed: fArmed, control: fCtrl, ratio: fastRatio, go: fastRatio !== null && fastRatio <= 1.15 },
      laundering: { armed: laundArmed, go: laundArmed === 0 },
      newKinds: { kinds: newKinds, go: newKinds.length === 0 },
    },
    wall: { control: wCtrl, armed: wArmed },
    verdict: verdict ? 'GO' : 'NO-GO',
  }, null, 1));
  console.log('wrote ' + out);
  process.exit(verdict ? 0 : 1);
}

main();
