#!/usr/bin/env node
// test-mealdraw-b.js — proof for the sim-mealdraw-b prereg.
//
// sim-mealdraw-b, 2026-10-26, oversight-flesh-out-loop-b.
// Requires scripts/analyze-mealdraw-b.js and asserts every
// prereg leg: control reproduction, night-82 gap (Class A 800 +
// whole-@85 1,142, zero residual), day-84 @85 anchor (0 draws),
// day-84 @86 class equations with evidenced smoke, cross-checks,
// determinism vs the stockdoor corpus. Exit 0 iff every check
// passes (verdict GO); exit 1 otherwise, with the failing legs
// named — a NO-GO proof failure IS the verdict, not a broken
// test, when the failure is a prereg leg rather than the harness.
'use strict';
const { analyze } = require('./analyze-mealdraw-b');

const out = analyze();
const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail: detail == null ? '' : String(detail) });
}
const c = out.control;
check('control neutrality 327/289/38', c.neutralityPass, JSON.stringify(c.neutrality));
check('control attrFlag 0 mismatches', c.attrFlagMismatch === 0, c.attrFlagMismatch);
check('control lag 1x32/2x4/3x1/4x1', c.lagPass, JSON.stringify(c.lagDistribution));
check('control median lag 1.0', c.medianLag === 1, c.medianLag);
check('control coverage 36/38', c.coveragePass, JSON.stringify(c.coverage));
check('control residuals (9750,83)+(9750,84)', c.residualsPass, JSON.stringify(c.residuals));
check('instrument ctxKcalMatch 0 mismatches', out.instrument.ctxMismatch === 0,
  `${out.instrument.ctxMismatch} over ${out.instrument.ctxChecked} lines`);
check('instrument resid join 0 misses', out.instrument.residJoinMiss === 0, out.instrument.residJoinMiss);
check('instrument no truncation', out.instrument.truncBad.length === 0, JSON.stringify(out.instrument.truncBad));
check('instrument meal records present', out.instrument.mealRecTotal > 0, out.instrument.mealRecTotal);
check('stockdoor gross day82 2800 reproduced', out.leg2.stockdoorGross82 === 2800, out.leg2.stockdoorGross82);
check('stockdoor gross day81 3000 reproduced', out.night81.stockdoorGross81 === 3000, out.night81.stockdoorGross81);
check('leg2 Class-A draws 800', out.leg2.classA === 800, out.leg2.classA);
check('leg2 Class-A all villager-home', Object.keys(out.leg2.classAByContext).every(k => k === 'villager-home') &&
  (out.leg2.classAByContext['villager-home'] || 0) === 800, JSON.stringify(out.leg2.classAByContext));
check('leg2 whole-@85 draws 1142', out.leg2.at85Total === 1142, out.leg2.at85Total);
check('leg2 granary 122+220 drawn', (out.leg2.gran122 + out.leg2.gran220) === 342,
  `${out.leg2.gran122}+${out.leg2.gran220}`);
check('leg2 equation closes at 2000', out.leg2.equation === 2000, out.leg2.equation);
check('leg2 PASS', out.leg2.pass, '');
check('leg4 @85 window-2 draws 0', out.leg4.classA === 0, out.leg4.classA);
check('leg4 PASS', out.leg4.pass, '');
for (const cl of out.leg5.classes) {
  check(`leg5 ${cl.label} equation`, cl.pass,
    `before=${cl.before} writes=${cl.writes} draws=${cl.draws} smoke=${cl.smoke} predicted=${cl.predicted} after=${cl.after}`);
}
check('leg5 no unmapped smoke', !Object.keys(out.leg5.smoke).some(k => k.startsWith('unmapped')),
  JSON.stringify(out.leg5.smoke));
check('leg5 smoke kcal matches worked line', out.leg5.smokeKcalMatch,
  `smokeFresh=${out.leg5.smokeFreshTotal} x0.8=${Math.round(out.leg5.smokeFreshTotal * 0.8)} worked=${out.leg5.worked84Kcal}`);
check('leg5 PASS', out.leg5.pass, '');
check('leg6 mealCall cross-check 0 mismatches', out.leg6.mealCallMismatchTotal === 0,
  `${out.leg6.mealCallMismatchTotal} over ${out.leg6.mealCallChecked} home calls`);
check('leg6 drawSpoiled diff 0 mismatches', out.leg6.spoilMismatchTotal === 0,
  `${out.leg6.spoilMismatchTotal} over ${out.leg6.spoilChecked} spoiled draws`);
check('leg6 PASS', out.leg6.pass, '');
check('leg7 determinism 8/8 seeds', out.leg7.pass, JSON.stringify(out.leg7.detMismatches));
check('dayPantry endpoints match stockdoor corpus', [82, 83, 84].every(d => out.pantryMatch[d]),
  JSON.stringify(out.pantryMatch));
check('wall national/table/win 0/0/0', out.wall.national === 0 && out.wall.table === 0 && out.wall.win === 0,
  `${out.wall.national}/${out.wall.table}/${out.wall.win}`);
check('wall wave4/5 0/0', out.wall.wave4 === 0 && out.wall.wave5 === 0, `${out.wall.wave4}/${out.wall.wave5}`);
check('wall median survival 100d', out.wall.medianDaysAlive === 100, out.wall.medianDaysAlive);
check('wall deaths 43', out.wall.deaths === 43, out.wall.deaths);
check('verdict GO', out.verdict === 'GO', out.verdict);

let pass = 0, fail = 0;
for (const ch of checks) {
  if (ch.pass) { pass++; console.log(`PASS ${ch.name}${ch.detail ? ' :: ' + ch.detail : ''}`); }
  else { fail++; console.log(`FAIL ${ch.name}${ch.detail ? ' :: ' + ch.detail : ''}`); }
}
console.log(`\n${pass} PASS, ${fail} FAIL — verdict ${out.verdict}`);
console.log(`night81 (corroboration, not a leg): gross=${out.night81.stockdoorGross81} at84Before=${out.night81.at84Before} draws=${out.night81.at84Draws} at84After=${out.night81.at84After} equation=${out.night81.equation}`);
process.exit(fail ? 1 : 0);
