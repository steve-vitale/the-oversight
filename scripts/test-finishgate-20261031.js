// test-finishgate-20261031.js — proof test for sim-finishgate-a (plain node).
// Synthetic log-parse / gap / classifier cases + corpus reconciliation
// proving analyzer counts sum to corpus totals on both legs.
// Usage: node scripts/test-finishgate-20261031.js  (exit 0 = all pass)
'use strict';
const path = require('path');
const { parseStrikes, classify, distribution, analyzeLeg } = require('./finishgate-analyze-20261031.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass += 1; }
  else { fail += 1; console.log(`FAIL: ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function eq(name, a, b) { check(name, a === b, { got: a, want: b }); }

// --- Synthetic: strike parsing ---
{
  const log = [
    'R1: Emily speaks to the face — as THEM.',
    'R2: Emily strikes for 12 (48 left)',
    'R3: Emily strikes for 7 (41 left)',
    'R10: Emily strikes for 25 (16 left)',
    'R3: Encore hits Emily for 18 (82 left)',
    'Emily strikes for 99 (no round prefix — must NOT parse)',
  ];
  const s = parseStrikes(log);
  eq('parse: count', s.length, 3);
  eq('parse: max vd', Math.max(...s.map(x => x.vd)), 25);
  eq('parse: names all Emily', s.every(x => x.name === 'Emily'), true);
}

// --- Synthetic: classifier cases (mMaxHp 300 => break line 45) ---
{
  // gap-table: fought, below line, strikes present. gap = 40-12 = 28; two-strike: 40 <= 12+7 false.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 300, mMaxHp: 300, mHpLeft: 40,
    log: ['R1: Ana strikes for 12 (x left)', 'R2: Ana strikes for 7 (40 left)'] };
  const c = classify(r);
  eq('class gap-table', c.cls, 'gap-table');
  eq('gap value', c.gap, 28);
  eq('maxStrike', c.maxStrike, 12);
  eq('secondStrike', c.secondStrike, 7);
  eq('twoStrikeReach false', c.twoStrikeReach, false);
}
{
  // two-strike reach boundary: left 19 <= 12+7 exactly => true; gap 7.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 300, mMaxHp: 300, mHpLeft: 19,
    log: ['R1: Ana strikes for 12 (x left)', 'R2: Ana strikes for 7 (19 left)'] };
  const c = classify(r);
  eq('twoStrikeReach boundary true', c.twoStrikeReach, true);
  eq('gap boundary', c.gap, 7);
}
{
  // gap<=0: left 10 <= max 12 => gap -2.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 300, mMaxHp: 300, mHpLeft: 10,
    log: ['R1: Ana strikes for 12 (10 left)'] };
  const c = classify(r);
  eq('gap<=0 case', c.gap, -2);
  eq('single-strike twoReach', c.twoStrikeReach, true); // second defaults 0; 10 <= 12
}
{
  // contact-break: met below line (start 30 < 45), rounds 0 style.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 30, mMaxHp: 300, mHpLeft: 30,
    log: ['Ana drove the beast off with the bow.'] };
  eq('class contact-break', classify(r).cls, 'contact-break');
}
{
  // contact-break takes precedence over multi-striker (stated precedence).
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 30, mMaxHp: 300, mHpLeft: 30,
    log: ['R1: Ana strikes for 5 (x left)', 'R1: Bo strikes for 6 (x left)'] };
  eq('contact beats multi-striker', classify(r).cls, 'contact-break');
}
{
  // no-lead-strike: fought, no strike lines.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 300, mMaxHp: 300, mHpLeft: 40,
    log: ['R1: Ana walks in open-handed, talking. It stands down.'] };
  eq('class no-lead-strike', classify(r).cls, 'no-lead-strike');
}
{
  // non-break-flight: above line with strikes.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 300, mMaxHp: 300, mHpLeft: 100,
    log: ['R1: Ana strikes for 12 (100 left)'] };
  const c = classify(r);
  eq('class non-break-flight', c.cls, 'non-break-flight');
  eq('non-break gap still computed for audit', c.gap, 88);
}
{
  // unlogged: null and empty list.
  eq('class unlogged null', classify({ mHpStart: 300, mMaxHp: 300, mHpLeft: 40, log: null }).cls, 'unlogged');
  eq('class unlogged empty', classify({ mHpStart: 300, mMaxHp: 300, mHpLeft: 40, log: [] }).cls, 'unlogged');
}
{
  // missing-fields.
  eq('class missing-fields', classify({ mHpStart: 300, mMaxHp: 300, mHpLeft: null, log: ['R1: Ana strikes for 5 (x left)'] }).cls, 'missing-fields');
}
{
  // multi-striker fought row.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 300, mMaxHp: 300, mHpLeft: 40,
    log: ['R1: Ana strikes for 5 (x left)', 'R1: Bo strikes for 6 (40 left)'] };
  eq('class multi-striker', classify(r).cls, 'multi-striker');
}
{
  // strict break line: left exactly 45 (== 15% of 300) is NOT below => non-break.
  const r = { wave: 3, outcome: 'mFlee', mHpStart: 300, mMaxHp: 300, mHpLeft: 45,
    log: ['R1: Ana strikes for 5 (45 left)'] };
  eq('strict break line (==line is non-break)', classify(r).cls, 'non-break-flight');
  // start exactly at line is NOT contact-break (strict <).
  const r2 = { wave: 3, outcome: 'mFlee', mHpStart: 45, mMaxHp: 300, mHpLeft: 45,
    log: ['R1: Ana strikes for 5 (45 left)'] };
  eq('strict contact line (==line is not contact)', classify(r2).cls, 'non-break-flight');
}

// --- Synthetic: distributions ---
{
  const d = distribution([10, 20, 30, 40]);
  eq('dist n', d.n, 4);
  eq('dist min', d.min, 10);
  eq('dist max', d.max, 40);
  eq('dist median', d.median, 25);
  eq('dist q1', d.q1, 17.5);
  eq('dist q3', d.q3, 32.5);
  const e = distribution([]);
  eq('dist empty n', e.n, 0);
  eq('dist empty median', e.median, null);
}

// --- Corpus reconciliation (both legs; counts must sum to corpus totals) ---
{
  const ROOT = path.resolve(__dirname, '..');
  for (const [name, dir] of [
    ['baseline', path.join(ROOT, 'evidence/2026-10-31/perseed-fieldfinish2-baseline-pilot/leadfeast')],
    ['lever', path.join(ROOT, 'evidence/2026-10-31/perseed-fieldfinish2-pilot/leadfeast')],
  ]) {
    const leg = analyzeLeg(dir);
    eq(`${name}: files`, leg.files, 8);
    check(`${name}: class sum == w3 mFlee total`, leg.reconciliation.classSumEqualsMFlee, leg.reconciliation);
    check(`${name}: wave sum == fieldFights total`, leg.reconciliation.waveSumEqualsFieldFights, leg.reconciliation);
    check(`${name}: w3 outcome sum == w3 total`, leg.reconciliation.w3OutcomeSumEqualsW3Total, leg.reconciliation);
    eq(`${name}: unclassified`, leg.reconciliation.unclassified, 0);
    eq(`${name}: coverage 1`, leg.coverage, 1);
    check(`${name}: gap rows == gap-table class count`, leg.gapRows.length === (leg.classes['gap-table'] || 0), { rows: leg.gapRows.length, cls: leg.classes['gap-table'] });
    check(`${name}: every gap row below break line`, leg.gapRows.every(r => r.mHpLeft < 0.15 * r.mMaxHp), null);
    check(`${name}: every gap row has maxStrike`, leg.gapRows.every(r => typeof r.maxStrike === 'number' && r.maxStrike > 0), null);
    check(`${name}: every gap row gap == left - maxStrike`, leg.gapRows.every(r => r.gap === r.mHpLeft - r.maxStrike), null);
  }
}

console.log(`finishgate proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
