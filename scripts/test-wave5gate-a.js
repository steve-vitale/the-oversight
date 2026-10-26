#!/usr/bin/env node
// scripts/test-wave5gate-a.js — proof for arm sim-wave5gate-a.
// Re-runs the analyzer over the corpus and asserts the reported counts
// (band table, per-seed binding gates, GO verdict, full-seat secondary,
// veteran channel). Any corpus change that moves a reported number fails
// loudly here instead of silently re-deriving the evidence.
// DIAG/MEASUREMENT ONLY, zero src/js changes.
'use strict';
const { analyze } = require('./sim-wave5gate-a-analyze');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''}`); }
}
function main() {
  const out = analyze({});
  console.log('=== test-wave5gate-a proof ===');
  check('corpus complete', out.corpusOk === true, out.corpusErrors);
  check('no endCheck failures', out.endCheckFails.length === 0, out.endCheckFails);
  const seeds = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  for (const s of seeds) {
    check(`rebaseline==1715Z s${s}`, (out.reproDiffs[s] || []).length === 0, out.reproDiffs[s]);
    check(`gate==rebaseline s${s}`, (out.trajDiffs[s] || []).length === 0, out.trajDiffs[s]);
  }
  const b = out.band || {};
  check('band won 2', b.won === 2, b.won);
  check('band medianDays 166', b.medianDays === 166, b.medianDays);
  check('band nationalEver 6', b.nationalEver === 6, b.nationalEver);
  check('band nationalFinal 5', b.nationalFinal === 5, b.nationalFinal);
  check('band table 3', b.table === 3, b.table);
  check('band entered 2', b.entered === 2, b.entered);
  check('band wave3 8', b.wave3 === 8, b.wave3);
  check('band wave4 6', b.wave4 === 6, b.wave4);
  check('band wave5 0', b.wave5 === 0, b.wave5);
  check('band deaths 338', b.deaths === 338, b.deaths);
  check('band starvation 1', b.starvation === 1, b.starvation);
  const bySeed = {};
  for (const s of out.seeds) bySeed[s.seed] = s;
  const expectSingle = { 73671: 'STANDING-RAW', 73672: 'STANDING-RAW', 73673: 'STANDING-RAW', 73674: 'STANDING-RAW', 73675: 'READINESS-DEF5', 73676: 'READINESS-DEF5' };
  for (const [seed, gate] of Object.entries(expectSingle)) {
    const s = bySeed[seed];
    check(`s${seed} single ${gate}`, !!(s && s.single && s.failing.length === 1 && s.failing[0] === gate), s && s.failing);
  }
  for (const seed of [73677, 73678]) {
    const s = bySeed[seed];
    check(`s${seed} compound RAW+DEF4`, !!(!s.single && s.failing.length === 2 && s.failing.includes('STANDING-RAW') && s.failing.includes('READINESS-DEF4')), s && s.failing);
  }
  check('distribution RAW 4', out.gateDist['STANDING-RAW'] === 4, out.gateDist);
  check('distribution DEF5 2', out.gateDist['READINESS-DEF5'] === 2, out.gateDist);
  check('compound count 2', out.compoundCount === 2, out.compoundCount);
  check('verdict DIAG-NO-GO', out.verdict.verdict === 'DIAG-NO-GO', out.verdict);
  check('no seed ever gated>=200', out.seeds.every(s => s.daysGated200 === 0), out.seeds.map(s => [s.seed, s.daysGated200]));
  check('no seed ever faced4-missing-while-standing-ok (daysStandingOkFacedMissing 0)', out.seeds.every(s => s.daysStandingOkFacedMissing === 0), out.seeds.map(s => [s.seed, s.daysStandingOkFacedMissing]));
  for (const s of out.seeds) {
    check(`s${s.seed} rd5 veterans peak 0`, s.peakRd5.veterans === 0, s.peakRd5);
    check(`s${s.seed} w4 kills 0`, (s.w4plusKillers || []).length === 0, s.w4plusKillers);
  }
  const fullBySeed = {};
  for (const f of out.fullSeat) fullBySeed[f.seed] = f;
  for (const seed of seeds) {
    const f = fullBySeed[seed];
    check(`s${seed} full-seat w5 faced 0`, !!f && f.fullWaves && f.fullWaves[4] === 0, f && f.fullWaves);
    check(`s${seed} full seat unreached`, !!f && f.fullOk === false, f && f.fullOk);
  }
  const f72 = fullBySeed[73672];
  check('s73672 full seat fails ONLY the w5 bar', !!f72 && f72.shortBars.length === 1 && /waves/.test(f72.shortBars[0]) && f72.fullWaves[0] >= 5 && f72.fullWaves[1] >= 5 && f72.fullWaves[2] >= 4 && f72.fullWaves[3] >= 3, f72 && f72.shortBars);
  console.log(`\nPROOF: ${pass} PASS, ${fail} FAIL`);
  if (fail > 0) process.exit(1);
}
if (require.main === module) main();
