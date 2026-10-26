#!/usr/bin/env node
// test-mealdraw-reprereg-b.js — proof for the sim-mealdraw-reprereg-b prereg.
//
// sim-mealdraw-reprereg-b, 2026-10-26, oversight-flesh-out-loop-b.
// Requires scripts/analyze-mealdraw-reprereg-b.js and asserts the
// prereg legs. Leg 0 (base pin) is verified by the shell before
// each sweep (ancestor + empty game-tree diff) and is NOT
// re-proven here — this script asserts legs 1–5 (pilot mode)
// or the confirm legs (confirm mode).
//
// Usage:
//   node scripts/test-mealdraw-reprereg-b.js [--confirm]
//     [--control <dir>] [--judged <dir>] [--focus <seed>]
// Pilot defaults: the pilot corpora, focus 9750.
// Confirm: --confirm (focus 0, generalized-window leg, 16 seeds).
// Exit 0 iff every asserted leg passes; exit 1 otherwise, with
// failing legs named — a NO-GO proof failure IS the verdict when
// the failure is a prereg leg.
'use strict';
const path = require('path');
const { analyze } = require('./analyze-mealdraw-reprereg-b');

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
const confirm = process.argv.includes('--confirm');
const base = path.join(__dirname, '..', 'evidence', '2026-10-26');
const out = analyze({
  controlDir: arg('control', path.join(base, confirm
    ? 'sim-mealdraw-reprereg-b-confirm-control-corpus'
    : 'sim-mealdraw-reprereg-b-control-corpus')),
  judgedDir: arg('judged', path.join(base, confirm
    ? 'sim-mealdraw-reprereg-b-confirm-corpus'
    : 'sim-mealdraw-reprereg-b-corpus')),
  focusSeed: confirm ? 0 : (parseInt(arg('focus', '9750'), 10) || 0),
});

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail: detail == null ? '' : String(detail) });
}

if (confirm) {
  check('confirm control 16 files', out.controlFiles === 16, out.controlFiles);
  check('confirm judged 16 files', out.judgedFiles === 16, out.judgedFiles);
  check('confirm control no truncation', out.controlTruncBad.length === 0, JSON.stringify(out.controlTruncBad));
  check('confirm neutrality judged==control 16/16', out.determinism.pass, JSON.stringify(out.determinism.mismatches));
  check('confirm cross-checks pass', out.crossChecks.pass,
    `mealCallMismatch=${out.crossChecks.mealCallMismatchTotal} spoilMismatch=${out.crossChecks.spoilMismatchTotal} truncBad=${JSON.stringify(out.crossChecks.truncBad)}`);
  check('confirm ctxKcalMatch 0 mismatches', out.judgedInstrument.ctxMismatch === 0,
    `${out.judgedInstrument.ctxMismatch} over ${out.judgedInstrument.ctxChecked} lines`);
  check('confirm resid join 0 misses', out.judgedInstrument.residJoinMiss === 0, out.judgedInstrument.residJoinMiss);
  check('confirm generalized windows >= 8 checkable', out.generalized.total >= 8, out.generalized.total);
  check('confirm generalized windows all closed', out.generalized.allClosed,
    JSON.stringify(out.generalized.open.slice(0, 5)));
} else {
  check('leg1 control 8 files', out.controlFiles === 8, out.controlFiles);
  check('leg1 judged 8 files', out.judgedFiles === 8, out.judgedFiles);
  check('leg1 control no truncation', out.controlTruncBad.length === 0, JSON.stringify(out.controlTruncBad));
  check('leg2 determinism judged==control 8/8', out.determinism.pass, JSON.stringify(out.determinism.mismatches));
  check('leg3 focus seed present', !!out.focus && !out.focus.missing, out.focus ? JSON.stringify(out.focus.seed) : 'missing');
  check('leg3 focus >= 3 checkable windows', out.focus && out.focus.checkable >= 3, out.focus ? out.focus.checkable : 'no-focus');
  check('leg3 focus windows all closed', out.focus && out.focus.allClosed,
    out.focus ? JSON.stringify(out.focus.open.map(w => ({ day: w.day, residual: w.residual }))) : 'no-focus');
  for (const d of [81, 82, 83]) {
    const w = out.focus ? out.focus['window' + d] : null;
    check(`leg3 focus window ${d} reported`,
      !!w, w ? `checkable=${w.checkable} gross=${w.gross} surviving=${w.surviving} residual=${w.residual} closed=${w.closed}` : 'absent');
  }
  // Leg 4 (strict prereg reading): residuals reported verbatim. The
  // old pair (9750,83)/(9750,84) is ABSENT on the pinned base — a
  // finding, not a failure, per the prereg. But ANY other residual
  // must have its covering window closed: residual day D on seed S
  // is covered by surplus window D-1 on S (the night-D-1 writes
  // are what the day-D cook faces). Covering windows come from
  // the generalized scan (all seeds), not just the focus seed.
  const residuals = out.controlView.residuals;
  const pairPresent = residuals.some(r => (r.seed === 9750 && (r.day === 83 || r.day === 84)));
  const genByKey = new Map(out.generalized.windows.map(w => [w.seed + '|' + w.day, w]));
  let leg4pass = true, leg4detail = `residuals=${JSON.stringify(residuals)}`;
  if (!pairPresent) leg4detail += ' pair ABSENT on pinned base (finding, not a failure)';
  for (const r of residuals) {
    const covering = genByKey.get(r.seed + '|' + (r.day - 1));
    if (!covering || !covering.closed) {
      leg4pass = false;
      leg4detail += ` residual (${r.seed},${r.day}) covering window ${r.day - 1} NOT closed` +
        (covering ? ` residual=${covering.residual}` : ' (not checkable)');
    }
  }
  check('leg4 residual-pair disposition', leg4pass, leg4detail);
  check('leg5 mealCall cross-check 0 mismatches', out.crossChecks.mealCallMismatchTotal === 0,
    `${out.crossChecks.mealCallMismatchTotal} over ${out.crossChecks.mealCallChecked} home calls`);
  check('leg5 drawSpoiled diff 0 mismatches', out.crossChecks.spoilMismatchTotal === 0,
    `${out.crossChecks.spoilMismatchTotal} over ${out.crossChecks.spoilChecked} spoiled draws`);
  check('leg5 no mealdraw truncation', out.crossChecks.truncBad.length === 0, JSON.stringify(out.crossChecks.truncBad));
  check('leg5 ctxKcalMatch 0 mismatches', out.judgedInstrument.ctxMismatch === 0,
    `${out.judgedInstrument.ctxMismatch} over ${out.judgedInstrument.ctxChecked} lines`);
  check('leg5 resid join 0 misses', out.judgedInstrument.residJoinMiss === 0, out.judgedInstrument.residJoinMiss);
  check('leg5 cross-checks pass', out.crossChecks.pass, '');
}

let pass = 0, fail = 0;
for (const ch of checks) {
  if (ch.pass) { pass++; console.log(`PASS ${ch.name}${ch.detail ? ' :: ' + ch.detail : ''}`); }
  else { fail++; console.log(`FAIL ${ch.name}${ch.detail ? ' :: ' + ch.detail : ''}`); }
}
console.log(`\n${pass} PASS, ${fail} FAIL — mode=${confirm ? 'confirm' : 'pilot'}`);
console.log(`control view: neutrality=${JSON.stringify(out.controlView.neutrality)} attrFlagMismatch=${out.controlView.attrFlagMismatch} lag=${JSON.stringify(out.controlView.lagDistribution)} medianLag=${out.controlView.medianLag} coverage=${JSON.stringify(out.controlView.coverage)} residuals=${JSON.stringify(out.controlView.residuals)}`);
console.log(`wall judged: national=${out.wallJudged.national} table=${out.wallJudged.table} win=${out.wallJudged.win} wave4=${out.wallJudged.wave4} wave5=${out.wallJudged.wave5} medianDays=${out.wallJudged.medianDaysAlive} deaths=${out.wallJudged.deaths} causes=${JSON.stringify(out.wallJudged.deathCauses)} waveReach=${JSON.stringify(out.wallJudged.waveReach)}`);
process.exit(fail ? 1 : 0);
