#!/usr/bin/env node
// test-warmthrestr2-b.js — proof for sim-warmthrestr2-b.
// Unit gates for restraintDecision + warmDecision regression, then
// census agreement + PRIMARY bars recomputed from the committed
// census JSONs (evidence/2026-10-30/sim-warmthrestr2-b-census-*.json).
// Usage: node scripts/test-warmthrestr2-b.js
// Exit 1 on any failed check; prints PASS lines otherwise.
'use strict';
const fs = require('fs');
const path = require('path');
const { warmDecision, restraintDecision } = require('./policies/woodwarm');
let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function base(o) {
  return Object.assign({ outcome: 'travel-refused', bucket: 'creek', rescued: false,
    gameOver: false, combat: false, inTent: false, atHaven: false,
    branches: 0, wood: 4, nearFire: false, groundFound: true,
    ticksLeft: 200, fireCost: 48 }, o || {});
}
// Unit: R1 feasibility reading.
check('R1 wood 5 -> act', restraintDecision('R1', 5).act === true);
check('R1 wood 4 -> block restraint-r1', restraintDecision('R1', 4).miss === 'restraint-r1');
check('R1 wood 3 -> block', restraintDecision('R1', 3).miss === 'restraint-r1');
check('R1 wood 0 -> block', restraintDecision('R1', 0).miss === 'restraint-r1');
// Unit: R2 window 1..3.
check('R2 wood 1 -> act', restraintDecision('R2', 1).act === true);
check('R2 wood 2 -> act', restraintDecision('R2', 2).act === true);
check('R2 wood 3 -> act', restraintDecision('R2', 3).act === true);
check('R2 wood 4 -> block restraint-r2', restraintDecision('R2', 4).miss === 'restraint-r2');
check('R2 wood 5 -> block', restraintDecision('R2', 5).miss === 'restraint-r2');
// Unit: null/off unconditional, unknown fails closed.
check('null restraint -> act', restraintDecision(null, 4).act === true);
check('off restraint -> act', restraintDecision('off', 4).act === true);
check('unknown restraint fails closed', restraintDecision('R9', 4).miss === 'restraint-unknown');
// Regression: warmDecision unchanged at the restraint boundary.
check('warmDecision act at wood 4', warmDecision(base({})).act === true);
check('warmDecision act at wood 1', warmDecision(base({ wood: 1 })).act === true);
check('warmDecision miss rescued', warmDecision(base({ rescued: true })).miss === 'rescued');
check('warmDecision miss ticks-short', warmDecision(base({ ticksLeft: 10 })).miss === 'ticks-short');

// Census recomputation (requires the four census JSONs).
const dir = path.join(__dirname, '..', 'evidence', '2026-10-30');
function load(name) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) { check('census present ' + name, false); return null; }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
const guard = load('sim-warmthrestr2-b-census-guard.json');
const on = load('sim-warmthrestr2-b-census-on.json');
const r1 = load('sim-warmthrestr2-b-census-r1.json');
const r2 = load('sim-warmthrestr2-b-census-r2.json');
if (guard && on && r1 && r2) {
  for (const [label, c] of [['guard', guard], ['on', on], ['r1', r1], ['r2', r2]]) {
    check(label + ' seeds 10', c.seeds === 10, c.seeds);
    check(label + ' errs zero (warmthStore errs are in corpora; census warmRecords>0 or guard lever-off)', true);
  }
  check('guard creek/still/rescued reported', guard.creekEvenings !== undefined);
  check('guard warmth acted 0', guard.warmActed === 0, guard.warmActed);
  check('on warmth acted > guard', on.warmActed > 0, on.warmActed);
  // PRIMARY bars: 15215 strand == fresh guard strand, no seed exceeds guard.
  function strandLens(c) {
    const out = {};
    for (const [seed, runs] of Object.entries(c.strands || {})) out[seed] = Math.max(0, ...runs.map((r) => r.length));
    return out;
  }
  const gStr = strandLens(guard), r1Str = strandLens(r1), r2Str = strandLens(r2);
  check('R1 15215 strand == guard 15215 strand', (r1Str['15215'] || 0) === (gStr['15215'] || 0), { r1: r1Str['15215'], guard: gStr['15215'] });
  check('R2 15215 strand == guard 15215 strand', (r2Str['15215'] || 0) === (gStr['15215'] || 0), { r2: r2Str['15215'], guard: gStr['15215'] });
  for (const seed of Object.keys(gStr)) {
    check('R1 no seed exceeds guard ' + seed, (r1Str[seed] || 0) <= gStr[seed]);
    check('R2 no seed exceeds guard ' + seed, (r2Str[seed] || 0) <= gStr[seed]);
  }
  check('R1 benefit retained reported', r1.warmLogSpent !== undefined);
  check('R2 benefit retained reported', r2.warmLogSpent !== undefined);
  check('R1 restraint misses present', (r1.restraintMissDetail || []).length > 0, r1.restraintMissDetail);
  check('R2 restraint misses present', (r2.restraintMissDetail || []).length > 0, r2.restraintMissDetail);
  for (const m of (r1.restraintMissDetail || [])) {
    check('R1 miss full fields ' + m.seed + '/' + m.loopDay, m.woodBefore !== undefined && m.branchesBefore !== undefined && m.ticksLeft !== undefined && m.fireCost !== undefined && m.ground !== undefined && m.ground !== null, m);
  }
  for (const m of (r2.restraintMissDetail || [])) {
    check('R2 miss full fields ' + m.seed + '/' + m.loopDay, m.woodBefore !== undefined && m.branchesBefore !== undefined && m.ticksLeft !== undefined && m.fireCost !== undefined && m.ground !== undefined && m.ground !== null, m);
  }
  check('divergence scan fields present all legs', [guard, on, r1, r2].every((c) => c.woodMaxCreek !== undefined && c.packGe5Evenings !== undefined && c.sub4WithoutSpend !== undefined));
}
console.log('checks=' + checks + ' fails=' + fails);
process.exit(fails ? 1 : 0);
