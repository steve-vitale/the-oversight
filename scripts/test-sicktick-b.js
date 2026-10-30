#!/usr/bin/env node
// scripts/test-sicktick-b.js — proof for sim-sicktick-b (DIAG-GO bar).
// Asserts, from the committed trace + summary JSONs only (no sims here):
//  1. 9983 death sequence still equals the starveplenty wound-probe deaths.
//  2. 9983 gen_a29exbk step: d35 -3 tick-fever/sev1 -> d37 -5 wound-fever/sev2,
//     same caller, healer unchanged, new-record-after-gap shape.
//  3. >=2 fresh seeds with the same clean sev1->sev2 wound-fever step.
//  4. Every sickness hurt row in every trace comes from villageSicknessTick.
//  5. No src/js file differs from HEAD (DIAG-only guard).
// Usage: node scripts/test-sicktick-b.js  (run from the worktree root)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
let pass = 0;
function check(name, cond, extra) {
  if (!cond) { console.error('FAIL:', name, extra || ''); process.exitCode = 1; }
  else { pass++; console.log('ok:', name, extra || ''); }
}
const E = 'evidence/2026-10-30';
const trace9983 = JSON.parse(fs.readFileSync(path.join(E, 'sim-sicktick-b-trace-9983.json'), 'utf8'));
const wounds = JSON.parse(fs.readFileSync(path.join(E, 'sim-starveplenty-b-wounds-9983.json'), 'utf8'));
const summary = JSON.parse(fs.readFileSync(path.join(E, 'sim-sicktick-b-summary.json'), 'utf8'));
const key = d => [d.day, d.kind, d.who, d.cause].join('|');
check('9983 deaths equal wound-probe deaths',
  JSON.stringify(trace9983.deaths.map(key)) === JSON.stringify(wounds.deaths.map(key)),
  `(${trace9983.deaths.length} deaths)`);
const s9983 = summary.perSeed.find(s => s.seed === 9983);
const step = s9983.stepUps.find(u => u.vid === 'gen_a29exbk');
check('9983 gen step present', !!step);
check('9983 step is -3 -> -5', step && step.prevDamage === 3 && step.curDamage === 5,
  step ? `d${step.prevDay} -> d${step.curDay}` : '');
check('9983 step is tick-fever/sev1 -> wound-fever/sev2',
  step && step.prevRecord.name === 'tick fever' && step.prevRecord.severity === 1 &&
  step.curRecord.name === 'wound fever' && step.curRecord.severity === 2);
check('9983 step same caller, healer unchanged, new-record shape',
  step && step.prevCaller === 'villageSicknessTick' && step.curCaller === 'villageSicknessTick' &&
  !step.healerChanged && step.shape === 'new-record-after-gap');
check('9983 step-up day is a starving day but the new record predates it',
  step && step.starvingCur === true && step.starvingPrev === false);
const cleanConfirms = [];
for (const s of summary.perSeed) {
  if (s.seed === 9983) continue;
  const has = s.stepUps.some(u => u.prevRecord && u.curRecord &&
    u.prevRecord.name === 'tick fever' && u.prevRecord.severity === 1 &&
    u.curRecord.name === 'wound fever' && u.curRecord.severity === 2 &&
    !u.healerChanged && u.shape === 'new-record-after-gap');
  if (has) cleanConfirms.push(s.seed);
}
check('>=2 fresh seeds confirm the same attribution', cleanConfirms.length >= 2,
  `seeds ${cleanConfirms.join(', ')}`);
let sicknessRows = 0, badCallers = 0;
for (const f of fs.readdirSync(E).filter(f => f.startsWith('sim-sicktick-b-trace-'))) {
  const t = JSON.parse(fs.readFileSync(path.join(E, f), 'utf8'));
  for (const r of t.hurtRows) {
    if (r.cause === 'sickness') { sicknessRows++; if (r.caller !== 'villageSicknessTick') badCallers++; }
  }
}
check('all sickness rows from villageSicknessTick', badCallers === 0, `(${sicknessRows} rows)`);
const srcDiff = execSync('git diff --name-only HEAD -- src/js; git status --porcelain -- src/js', { encoding: 'utf8' }).trim();
check('no src/js changes (DIAG-only)', srcDiff === '', srcDiff || '(clean)');
console.log(`\n${pass} checks passed${process.exitCode ? ' (with failures above)' : ''}`);
