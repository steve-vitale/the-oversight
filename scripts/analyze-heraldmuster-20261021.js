#!/usr/bin/env node
// analyze-heraldmuster-20261021.js — pilot analysis for sim-heraldmuster.
//
// Reads evidence/2026-10-21/perseed-heraldmuster/{control,armed}-*.json and
// judges the pre-registered PRIMARY plus guardrails. Prints the verdict and
// writes a JSON report. The PRIMARY is:
//   GO = armed accepted-seeds >= 3/16 AND armed - control >= 3
// Guardrails: median survival >= control -10d; no new death mode;
//   starvation-death share <= control +2pp; national reach not regressed.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-heraldmuster');

function load(arm) {
  return fs.readdirSync(EVID)
    .filter(f => f.startsWith(arm + '-') && f.endsWith('.json') && !f.startsWith('_'))
    .map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function sumDeaths(rows) {
  const o = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) o[k] = (o[k] || 0) + v;
  return o;
}

function arm(arm, rows) {
  const acc = rows.filter(r => r.heraldAccepted === 1);
  const ref = rows.reduce((s, r) => s + (r.heraldRefusedN | 0), 0);
  const accN = rows.reduce((s, r) => s + (r.heraldAcceptedN | 0), 0);
  const unx = rows.reduce((s, r) => s + (r.heraldUnexplainedN | 0), 0);
  const surv = rows.map(r => r.gameDays | 0);
  const starv = sumDeaths(rows);
  const starvTot = Object.values(starv).reduce((a, b) => a + b, 0);
  const starvN = (starv.starvation || 0) + (starv.starved || 0);
  return {
    arm, n: rows.length,
    acceptedSeeds: acc.length, acceptedSeedsList: acc.map(r => r.seed + '/' + r.policy.split('-')[0]),
    refusedTotal: ref, acceptedTotal: accN, unexplainedTotal: unx,
    medianSurvival: median(surv),
    national: rows.filter(r => r.national === 1).length,
    table: rows.filter(r => r.table === 1).length,
    won: rows.filter(r => r.won === 1).length,
    wave4: rows.filter(r => r.wave4 === 1).length,
    wave5: rows.filter(r => r.wave5 === 1).length,
    deathCauses: starv,
    starvationShare: starvTot ? +(starvN / starvTot).toFixed(4) : null,
    musterReadySeeds: rows.filter(r => (r.musterReadyDays | 0) > 0).length,
    musterMaxAllies: Math.max(0, ...rows.map(r => r.musterMaxAllies | 0)),
    musterMaxHaven: Math.max(0, ...rows.map(r => r.musterMaxHaven | 0)),
    omenSeeds: rows.filter(r => r.omenLocatedDay != null).length,
    soundAttempts: rows.reduce((s, r) => s + ((r.layer && r.layer.soundAttempts) | 0), 0),
    commitTaps: rows.reduce((s, r) => s + ((r.layer && r.layer.commitTaps) | 0), 0),
    driveErrors: rows.reduce((s, r) => s + ((r.layer && (r.layer.driveError + r.layer.soundError + r.layer.commitError)) | 0), 0),
    instrumentErrors: rows.reduce((s, r) => s + (r.instrumentErrors || []).length, 0),
  };
}

const control = arm('control', load('control'));
const armed = arm('armed', load('armed'));

const goPrimary = armed.acceptedSeeds >= 3 && (armed.acceptedSeeds - control.acceptedSeeds) >= 3;
const guardSurv = (armed.medianSurvival != null && control.medianSurvival != null)
  ? armed.medianSurvival >= control.medianSurvival - 10 : null;
const guardStarv = (armed.starvationShare != null && control.starvationShare != null)
  ? armed.starvationShare <= control.starvationShare + 0.02 : null;
const guardNat = armed.national >= control.national;
const ctrlDeathModes = new Set(Object.keys(control.deathCauses));
const newModes = Object.keys(armed.deathCauses).filter(k => !ctrlDeathModes.has(k) && armed.deathCauses[k] > 0);
const guardModes = newModes.length === 0;

const verdict = goPrimary && guardSurv && guardStarv && guardNat && guardModes ? 'GO'
  : 'NO-GO';

const report = {
  generated: new Date().toISOString(),
  control, armed,
  primary: { bar: 'armed accepted-seeds >= 3 AND armed - control >= 3', go: goPrimary },
  guardrails: { survival: guardSurv, starvation: guardStarv, national: guardNat, noNewDeathModes: guardModes, newModes },
  verdict,
};
fs.writeFileSync(path.join(EVID, '_analysis.json'), JSON.stringify(report, null, 1) + '\n');

for (const a of [control, armed]) {
  console.log(`--- ${a.arm} (n=${a.n})`);
  console.log(`  accepted-seeds: ${a.acceptedSeeds} [${a.acceptedSeedsList.join(',')}]  refused: ${a.refusedTotal}  accepted: ${a.acceptedTotal}  unexplained: ${a.unexplainedTotal}`);
  console.log(`  median survival: ${a.medianSurvival}  national: ${a.national}  table: ${a.table}  won: ${a.won}  wave4: ${a.wave4}  wave5: ${a.wave5}`);
  console.log(`  musterReadySeeds: ${a.musterReadySeeds}  maxAllies: ${a.musterMaxAllies}  maxHaven: ${a.musterMaxHaven}  omenSeeds: ${a.omenSeeds}`);
  console.log(`  layer: soundAttempts=${a.soundAttempts} commitTaps=${a.commitTaps} driveErrors=${a.driveErrors} instrumentErrors=${a.instrumentErrors}`);
  console.log(`  starvationShare: ${a.starvationShare}  deathCauses: ${JSON.stringify(a.deathCauses)}`);
}
console.log(`\nPRIMARY GO=${goPrimary} (bar: armed>=3 AND armed-control>=3)`);
console.log(`guardrails: survival>=ctrl-10d: ${guardSurv}  starvation<=ctrl+2pp: ${guardStarv}  national: ${guardNat}  noNewModes: ${guardModes} ${JSON.stringify(newModes)}`);
console.log(`\nVERDICT: ${verdict}`);
