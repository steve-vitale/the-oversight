#!/usr/bin/env node
// test-warmthfuel-b.js — proof for sim-warmthfuel-b.
// Usage: node scripts/test-warmthfuel-b.js [corpusGuardDir corpusOnDir]
// Unit tests always run. Corpus assertions run only when both dirs
// are passed. DIAG ONLY: asserts src/ and scripts/policies/ are
// clean vs HEAD and the recorder source calls no engine verbs.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { attributeNight, counterfactual, analyzeDir } = require('./analyze-warmthfuel-b.js');

let checks = 0, failures = 0;
function check(name, cond, extra) {
  checks++;
  if (!cond) { failures++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

function W(o) { return Object.assign({ acted: false, miss: 'lever-off' }, o); }
function R(o) { return Object.assign({ logs: 4, kcal: 0, ticks: 239, warmth: null, eveningBranchesAfter: null }, o); }

// --- attribution unit cases (every fuel class + every miss reason) ---
check('WOOD basic', attributeNight(R({ warmth: W({ acted: true, fireLit: true, logSpent: 1, branchesBefore: 0, woodBefore: 4, woodAfter: 3 }) })).fuel === 'WOOD');
check('WOOD branches=1', attributeNight(R({ warmth: W({ acted: true, fireLit: true, logSpent: 1, branchesBefore: 1, woodBefore: 4, woodAfter: 3 }) })).fuel === 'WOOD');
check('WOOD-SURPLUS logs=5', attributeNight(R({ logs: 5, warmth: W({ acted: true, fireLit: true, logSpent: 1, branchesBefore: 0, woodBefore: 5, woodAfter: 4 }) })).fuel === 'WOOD-SURPLUS');
check('BRANCHES diff-2', attributeNight(R({ eveningBranchesAfter: 2, warmth: W({ acted: true, fireLit: true, logSpent: 0, branchesBefore: 4 }) })).fuel === 'BRANCHES');
check('BRANCHES diff!=2 unexplained', attributeNight(R({ eveningBranchesAfter: 3, warmth: W({ acted: true, fireLit: true, logSpent: 0, branchesBefore: 4 }) })).fuel === 'OTHER-UNEXPLAINED');
check('NO-FUEL friction-failed', attributeNight(R({ warmth: W({ acted: true, fireLit: false, logSpent: 0, branchesBefore: 0 }) })).fuel === 'NO-FUEL');
check('NO-WARMTH-SPEND branches-available', attributeNight(R({ warmth: W({ miss: 'branches-available', branchesBefore: 4 }) })).fuel === 'NO-WARMTH-SPEND');
check('NO-WARMTH-SPEND no-wood', attributeNight(R({ warmth: W({ miss: 'no-wood', branchesBefore: 0 }) })).fuel === 'NO-WARMTH-SPEND');
check('NO-WARMTH-SPEND ticks-short', attributeNight(R({ warmth: W({ miss: 'ticks-short', branchesBefore: 0 }) })).fuel === 'NO-WARMTH-SPEND');
check('NO-WARMTH-SPEND fire-near', attributeNight(R({ warmth: W({ miss: 'fire-near', branchesBefore: 0 }) })).fuel === 'NO-WARMTH-SPEND');
check('NO-WARMTH-SPEND lever-off', attributeNight(R({ warmth: W({ miss: 'lever-off' }) })).fuel === 'NO-WARMTH-SPEND');
check('OTHER logSpent=2', attributeNight(R({ warmth: W({ acted: true, fireLit: true, logSpent: 2, branchesBefore: 0 }) })).fuel === 'OTHER-UNEXPLAINED');
check('OTHER acted-with-branches>=2', attributeNight(R({ warmth: W({ acted: true, fireLit: true, logSpent: 1, branchesBefore: 3 }) })).fuel === 'OTHER-UNEXPLAINED');
check('OTHER fireLit-false-but-spent', attributeNight(R({ warmth: W({ acted: true, fireLit: false, logSpent: 1, branchesBefore: 0 }) })).fuel === 'OTHER-UNEXPLAINED');
check('UNATTRIBUTED null-warmth', attributeNight(R({ warmth: null })).fuel === 'UNATTRIBUTED');

// --- counterfactual unit cases ---
function ev(day, logs, kcal, ticks, fuel) {
  return { loopDay: day, logs, kcal, ticks, fuel, unclassified: false };
}
// kcalshort ON shape, truncated at the converting evening: d10 converts.
const onShape = [ev(7, 4, 2254, 47, 'NO-WARMTH-SPEND'), ev(8, 4, 0, 239, 'NO-WARMTH-SPEND'),
  ev(9, 4, 0, 109, 'WOOD'), ev(10, 3, 240, 238, 'NO-WARMTH-SPEND')];
const cfOn = counterfactual(onShape);
check('CF ON converts d10', cfOn.converted && cfOn.converted.loopDay === 10, cfOn);
check('CF ON length 3', cfOn.length === 3, cfOn);
check('CF ON woodPrime d10 = 4', cfOn.converted && cfOn.converted.woodPrime === 4, cfOn);
// Guard shape: no conversion inside the strand (rescue is d10, outside).
const guardShape = [ev(7, 4, 2254, 47, 'NO-WARMTH-SPEND'), ev(8, 4, 0, 239, 'NO-WARMTH-SPEND'), ev(9, 4, 0, 109, 'NO-WARMTH-SPEND')];
const cfGuard = counterfactual(guardShape);
check('CF guard no conversion', cfGuard.converted === null && cfGuard.length === 3, cfGuard);
// WOOD-SURPLUS does not feed the counterfactual (bridge need unaffected).
const surplusShape = [ev(7, 5, 0, 239, 'WOOD-SURPLUS'), ev(8, 4, 240, 239, 'NO-WARMTH-SPEND')];
const cfSur = counterfactual(surplusShape);
check('CF surplus: d8 converts on own wood', cfSur.converted && cfSur.converted.loopDay === 8 && cfSur.converted.woodPrime === 4, cfSur);
// Unclassified evening poisons the counterfactual (never silently computed).
const badShape = [ev(7, 4, 0, 239, 'NO-WARMTH-SPEND')];
badShape[0].unclassified = true;
check('CF unclassified errors', counterfactual(badShape).error === 'unclassified-evening');
// Never-reached: evenings after the conversion are listed, not converted.
const longShape = [ev(7, 4, 2254, 47, 'NO-WARMTH-SPEND'), ev(8, 4, 0, 239, 'NO-WARMTH-SPEND'),
  ev(9, 4, 0, 109, 'WOOD'), ev(10, 3, 240, 238, 'NO-WARMTH-SPEND'),
  ev(11, 3, 0, 111, 'WOOD'), ev(12, 2, 0, 239, 'NO-WARMTH-SPEND')];
const cfLong = counterfactual(longShape);
check('CF neverReached lists later nights', JSON.stringify(cfLong.neverReached) === JSON.stringify([11, 12]), cfLong);

// --- tracked-diff guard + recorder verb guard ---
try {
  const out = cp.execSync('git status --porcelain -- src scripts/policies', { encoding: 'utf8', cwd: path.join(__dirname, '..') });
  check('src/ and scripts/policies/ clean vs HEAD', out.trim() === '', out);
} catch (e) { check('src/ and scripts/policies/ clean vs HEAD', false, String(e)); }
try {
  const rec = fs.readFileSync(path.join(__dirname, 'warmthfuel-trace-b.js'), 'utf8');
  check('recorder calls no engine verbs', !/\.makeFire\(|\.feedFire\(|\.spendWood\(|\.tickAction\(|\.consumeItem\(/.test(rec));
  check('recorder has read-only snapshots', /eveningWoodAfter/.test(rec) && /eveningBranchesAfter/.test(rec) && /morningBranches/.test(rec));
} catch (e) { check('recorder source readable', false, String(e)); }

// --- corpus assertions (only when dirs passed) ---
const [guardDir, onDir] = process.argv.slice(2);
if (guardDir && onDir) {
  for (const [label, dir] of [['guard', guardDir], ['on', onDir]]) {
    const c = analyzeDir(dir);
    check(label + ' seeds=10 files=10', c.seeds === 10 && c.files === 10, { seeds: c.seeds, files: c.files });
    check(label + ' all seeds 30d alive', c.wall.every((w) => w.daysAlive === 30), c.wall);
    check(label + ' zero unclassified', c.unclassifiedCount === 0, c.unclassified);
    check(label + ' zero unexplained', c.unexplainedCount === 0, c.unexplained);
    check(label + ' zero recorder errs', c.recorderErrs === 0, c.recorderErrs);
    // Independent counterfactual recomputation from the table rows.
    for (const st of c.strands) {
      const rows = c.table.filter((r) => r.seed === st.seed && st.nights.includes(r.loopDay));
      const recomputed = counterfactual(rows);
      check(label + ' seed ' + st.seed + ' CF recomputed identical',
        JSON.stringify(recomputed) === JSON.stringify(st.counterfactual), { stored: st.counterfactual, recomputed });
      // Warmth-delta consistency on every strand night.
      for (const r of rows) {
        const expected = r.warmth ? (r.warmth.acted ? -(r.warmth.logSpent || 0) : 0) : null;
        check(label + ' seed ' + r.seed + ' day ' + r.loopDay + ' warmth delta consistent',
          expected === null || r.warmthDelta === null || r.warmthDelta === expected,
          { warmthDelta: r.warmthDelta, expected });
      }
    }
    // 15215 must strand on both legs (drift watch).
    const s15215 = c.strands.filter((st) => st.seed === 15215);
    check(label + ' 15215 strands', s15215.length >= 1, c.strands.map((st) => st.seed + ':' + st.nights.join(',')));
  }
  const g = analyzeDir(guardDir), o = analyzeDir(onDir);
  const g15215 = g.strands.filter((st) => st.seed === 15215);
  const o15215 = o.strands.filter((st) => st.seed === 15215);
  check('guard 15215 strand nights 7,8,9', g15215.length === 1 && JSON.stringify(g15215[0].nights) === JSON.stringify([7, 8, 9]), g15215);
  check('on 15215 strand nights 7..16', o15215.length === 1 && JSON.stringify(o15215[0].nights) === JSON.stringify([7, 8, 9, 10, 11, 12, 13, 14, 15, 16]), o15215);
  check('guard CF reproduces actual (no conversion)', g15215[0].counterfactual.converted === null && g15215[0].counterfactual.length === 3, g15215[0].counterfactual);
  check('on CF converts d10 length 3', o15215[0].counterfactual.converted && o15215[0].counterfactual.converted.loopDay === 10 && o15215[0].counterfactual.length === 3, o15215[0].counterfactual);
  check('on CF neverReached 11..16', JSON.stringify(o15215[0].counterfactual.neverReached) === JSON.stringify([11, 12, 13, 14, 15, 16]), o15215[0].counterfactual);
  check('guard warmth spends zero logs', g.warmLogSpent === 0, g.warmLogSpent);
  check('on warmth log-spends = 4 (nights 9,11,12,13)', o.warmLogSpent === 4, o.warmLogSpent);
}

console.log('warmthfuel proof: ' + (checks - failures) + '/' + checks + ' checks pass');
if (failures) process.exit(1);
