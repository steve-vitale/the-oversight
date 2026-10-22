#!/usr/bin/env node
// test-plentydepri-confirm-b.js — PLENTYDEPRI confirm-run measurement proof
// (sim-plentydepri-confirm-b, axis food-economy, run fleshout-b-20261022T035902Z).
//
// MEASUREMENT ONLY: reads the 4 confirm sweep JSONs (control/armed x
// leadfeast/belongfeast, seeds 9009-9016, 180d death-aware, FEASTSCALE_R13=1,
// SEATDRIVE=0) and asserts the pre-registered verdict:
//
// PRIMARY (per feast-side): (rotFresh+rotPreserved) absolute kcal per 100
//   days alive, armed/control <= 0.80 (pilot: 0.542x leadfeast / 0.622x).
// ENGAGEMENT (kill-fast): depriKcal > 0 on >= 6/16 armed runs.
// GUARDRAILS (all must hold, per feast-side unless noted):
//   - median survival armed >= control-10d
//   - starvation deaths <= control+2
//   - national reach >= control-2
//   - no new death-cause modes (armed modes subset of control modes)
//   - channel laundering: no inflow channel grows >2x control
// Verdict: GO if primary passes on BOTH feast-sides AND all guardrails hold;
// else NO-GO. Exit 0 on GO, 1 on NO-GO, 2 on malformed input.
//
// MEASUREMENT-DEFINITION NOTE (see metric review in the evidence file): the
// pilot's nationalEnd field tests /national/i against rank, which misses
// rank='global' (the ladder comment in hierarchy.js says global implies
// national). This script counts national reach as rank in {national, global}
// or nationalLive=true. Both sides use the same definition, so the
// before/after comparison is honest; absolute national counts differ from
// the pilot's for that reason alone.
'use strict';
const fs = require('fs'), path = require('path');

const DIR = process.env.CONFIRM_DIR || '/tmp/sim-plentydepri-confirm-b';
const files = {
  'control|leadfeast': path.join(DIR, 'sweep-control-leadfeast.json'),
  'armed|leadfeast': path.join(DIR, 'sweep-armed-leadfeast.json'),
  'control|belongfeast': path.join(DIR, 'sweep-control-belongfeast.json'),
  'armed|belongfeast': path.join(DIR, 'sweep-armed-belongfeast.json'),
};

const FAIL = { n: 0 };
const check = (name, cond, detail) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) FAIL.n++;
};

const sweeps = {};
for (const [k, f] of Object.entries(files)) {
  if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
  sweeps[k] = JSON.parse(fs.readFileSync(f, 'utf8'));
  const m = sweeps[k].meta;
  if (m.seeds.join(',') !== '9009,9010,9011,9012,9013,9014,9015,9016') {
    console.error('SEED MISMATCH in ' + f); process.exit(2);
  }
  if (m.days !== 180 || m.env.FEASTSCALE_R13 !== '1' || m.env.SEATDRIVE !== '0') {
    console.error('ENV/HORIZON MISMATCH in ' + f + ' ' + JSON.stringify(m.env)); process.exit(2);
  }
}
check('input sweeps present, seeds 9009-9016, 180d, FEASTSCALE_R13=1/SEATDRIVE=0', true);

const rowsOf = (side, policy) => sweeps[side + '|' + policy].rows;
const rot = r => (r.end.rotFresh || 0) + (r.end.rotPreserved || 0);
const days = r => r.end.days || 1;
const median = xs => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const nationalReach = r => /national|global/i.test(String(r.end.rank || '')) || !!r.end.nationalLive;
const starve = r => (r.end.deaths || []).filter(d => /starv/i.test(String(d.cause || ''))).length;

const verdicts = {};
for (const policy of ['leadfeast', 'belongfeast']) {
  const C = rowsOf('control', policy), A = rowsOf('armed', policy);
  const rot100 = rs => rs.reduce((t, r) => t + rot(r), 0) / rs.reduce((t, r) => t + days(r), 0) * 100;
  const cRot = rot100(C), aRot = rot100(A), ratio = aRot / cRot;
  console.log(`\n== ${policy} ==`);
  console.log(`rot/100d: control ${(cRot / 1000).toFixed(1)}k -> armed ${(aRot / 1000).toFixed(1)}k = ${ratio.toFixed(3)}x`);
  const primary = ratio <= 0.80;
  verdicts[policy] = { primary, ratio };

  const cMed = median(C.map(days)), aMed = median(A.map(days));
  check(`${policy} guardrail median survival armed>=control-10d`, aMed >= cMed - 10, `${aMed}d vs ${cMed}d`);

  const cStarve = C.reduce((t, r) => t + starve(r), 0), aStarve = A.reduce((t, r) => t + starve(r), 0);
  check(`${policy} guardrail starvation deaths <=control+2`, aStarve <= cStarve + 2, `${aStarve} vs ${cStarve}`);

  const cNat = C.filter(nationalReach).length, aNat = A.filter(nationalReach).length;
  check(`${policy} guardrail national reach >=control-2`, aNat >= cNat - 2, `${aNat} vs ${cNat}`);

  // kind-filtered death modes (pilot operationalization: "no new death modes
  // (kind-filtered, deduped)"). Named-monster causes ("the night",
  // "speedbump", "glasswing darter", "the eater"...) are combat-family
  // deaths, not new modes. Allowed families = the control corpus across
  // BOTH policies (a mode that fires on leadfeast-control is not a new
  // mode when it fires on belongfeast-armed).
  const familyOf = c => {
    c = String(c || '?').toLowerCase();
    if (/starv/.test(c)) return 'starvation';
    if (/dehydrat/.test(c)) return 'dehydration';
    if (/alien/.test(c)) return 'alien';
    if (/sickness|lockjaw|drum-belly|bad belly|wound/.test(c)) return 'sickness';
    return 'combat'; // combat, monster, ambush, contest, choir toad, named monsters
  };
  const fams = rs => new Set(rs.flatMap(r => (r.end.deaths || []).map(d => familyOf(d.cause))));
  const ctrlFams = new Set([...fams(rowsOf('control', 'leadfeast')), ...fams(rowsOf('control', 'belongfeast'))]);
  for (const policy of ['leadfeast', 'belongfeast']) {
    const newModes = [...fams(rowsOf('armed', policy))].filter(m => !ctrlFams.has(m));
    check(`${policy} guardrail no new death-cause modes (kind-filtered)`, newModes.length === 0,
      newModes.length ? 'NEW: ' + newModes.join(',') : 'armed families ⊆ control-corpus families {' + [...ctrlFams].join(',') + '}');
  }

  const chanSum = rs => { const o = {}; for (const r of rs) for (const [k, v] of Object.entries(r.end.chan || {})) o[k] = (o[k] || 0) + v; return o; };
  const cCh = chanSum(C), aCh = chanSum(A);
  const launder = Object.keys(aCh).filter(k => cCh[k] > 0 && aCh[k] / cCh[k] > 2);
  const launderNew = Object.keys(aCh).filter(k => !(cCh[k] > 0) && aCh[k] > 500000);
  check(`${policy} guardrail channel laundering <=2x`, launder.length === 0 && launderNew.length === 0,
    launder.length || launderNew.length ? 'VIOL: ' + launder.concat(launderNew).join(',') :
    'max ratio ' + Object.keys(aCh).map(k => cCh[k] > 0 ? k + '=' + (aCh[k] / cCh[k]).toFixed(2) + 'x' : k + '=new').join(', '));

  // summary facts
  const waves = rs => rs.map(r => r.end.maxWave);
  const arcs = rs => rs.map(r => r.end.arc);
  const medSurvAll = [cMed, aMed];
  console.log(`days: control median ${cMed} / armed median ${aMed}; max ${Math.max(...C.map(days))}/${Math.max(...A.map(days))}`);
  console.log(`wave reach: control max ${Math.max(...waves(C))}, armed max ${Math.max(...waves(A))}; wave>=4: ${waves(C).filter(w => w >= 4).length}/${waves(A).filter(w => w >= 4).length}`);
  console.log(`arc: control max ${Math.max(...arcs(C))}, armed max ${Math.max(...arcs(A))}`);
  console.log(`won: control ${C.filter(r => r.end.won).length} / armed ${A.filter(r => r.end.won).length}; exiled: control ${C.reduce((t, r) => t + r.end.exiled, 0)} / armed ${A.reduce((t, r) => t + r.end.exiled, 0)}`);
  const depriKcalA = A.reduce((t, r) => t + (r.end.depriKcal || 0), 0);
  console.log(`armed depri: runs firing ${A.filter(r => (r.end.depriKcal || 0) > 0).length}/8, depriKcal total ${Math.round(depriKcalA / 1000)}k`);
  const rawModes = rs => new Set(rs.flatMap(r => (r.end.deaths || []).map(d => String(d.cause || '?'))));
  const causeCount = (rs, m) => rs.reduce((t, r) => t + (r.end.deaths || []).filter(d => String(d.cause) === m).length, 0);
  console.log(`deaths by cause (control): ` + JSON.stringify([...rawModes(C)].map(m => [m, causeCount(C, m)])));
  console.log(`deaths by cause (armed):   ` + JSON.stringify([...rawModes(A)].map(m => [m, causeCount(A, m)])));
}

// pooled engagement
const armedAll = ['leadfeast', 'belongfeast'].flatMap(p => rowsOf('armed', p));
const engaged = armedAll.filter(r => (r.end.depriKcal || 0) > 0).length;
check('ENGAGEMENT eased kcal>0 on >=6/16 armed runs', engaged >= 6, engaged + '/16');

const go = Object.values(verdicts).every(v => v.primary) && FAIL.n === 0;
console.log('\n' + (go ? 'VERDICT: GO' : 'VERDICT: NO-GO') +
  ' — primary leadfeast ' + (verdicts.leadfeast.primary ? 'GO' : 'NO-GO') +
  ' (' + verdicts.leadfeast.ratio.toFixed(3) + 'x), belongfeast ' + (verdicts.belongfeast.primary ? 'GO' : 'NO-GO') +
  ' (' + verdicts.belongfeast.ratio.toFixed(3) + 'x), guardrails ' + (FAIL.n === 0 ? 'all hold' : FAIL.n + ' FAILED'));
process.exit(go ? 0 : 1);
