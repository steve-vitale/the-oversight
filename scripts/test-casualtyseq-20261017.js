#!/usr/bin/env node
'use strict';
// test-casualtyseq-20261017.js — proof for the sim-casualtyseq diagnostic
// (flesh-out loop arm, scale-onramp axis, 2026-10-17).
//
// Proves, REAL RED->GREEN:
//   1. The pure classifiers on synthetic fixtures (unlockDayOf, isVillagerDeath,
//      sourceOf with an injected fieldfightsrc-srcOf, interDeathIntervals,
//      clusters, trajectoryShape, wave5ContactDay).
//   2. The sweep wiring: SMOKE=1 on the instrument (real 15d runs, unlock-day
//      sampler + roster rows + deaths instrumented — the survdiff lesson:
//      proof must cover the sweep's day-stamping, not just the lib).
//   3. The det-gate: DET=1 (instrument ON vs OFF trajectory-identical,
//      both-repeat, 4/4).
//
// The instrument module must NOT exist when this test is first run (REAL RED).
// Usage: node scripts/test-casualtyseq-20261017.js
// Env for the sweep modes is set by the child spawns (same substrate as the
// instrument's sweep).

const { execFileSync } = require('child_process');
const path = require('path');

let CSEQ;
try {
  CSEQ = require('./casualtyseq-20261017');
} catch (e) {
  console.error('RED: scripts/casualtyseq-20261017.js is absent (or failed to load): ' + e.message);
  process.exit(1);
}

const fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// A stub for fieldfightsrc's srcOf with the SAME rule order (raid first,
// then agency-expedition carve-out, then the travel-leg correlation, else
// wild) — the production path injects the real FFS().srcOf; the stub only
// exercises the branching here.
function stubSrcOf(c) {
  if (!c || c.day == null || c.cause == null) return 'unattributed';
  if (c.family !== 'monster') return 'nontarget';
  if (c.raid) return 'RAID';
  if (c.via === 'agency-expedition') return 'WILD-ENCOUNTER';
  if ((c.travelLegs | 0) > 0) return 'EXPEDITION';
  return 'WILD-ENCOUNTER';
}

const { unlockDayOf, isVillagerDeath, sourceOf, interDeathIntervals,
        clusters, trajectoryShape, wave5ContactDay, installScholarFlag } = CSEQ;

// --- 1. unlockDayOf ---
check('unlockDayOf: rising edge', unlockDayOf([{day:70,wave:3},{day:71,wave:3},{day:72,wave:4},{day:73,wave:4}]) === 72);
check('unlockDayOf: null when never', unlockDayOf([{day:70,wave:3},{day:180,wave:3}]) === null);
check('unlockDayOf: empty', unlockDayOf([]) === null);

// --- 2. isVillagerDeath ---
check('isVillagerDeath: villager kind', isVillagerDeath({kind:'villager', player:false}) === true);
check('isVillagerDeath: person kind', isVillagerDeath({kind:'person', player:false}) === true);
check('isVillagerDeath: scholar excluded', isVillagerDeath({kind:'player', player:true}) === false);
check('isVillagerDeath: player flag beats kind', isVillagerDeath({kind:'villager', player:true}) === false);

// --- 2b. installScholarFlag: the scholar dies as kind 'villager' — the
// beat-time Game.villagerId read is the only honest scholar detector.
{
  const calls = [];
  const fakeGame = {
    villagerId: 'v_scholar',
    registerDeath(opts) { calls.push(opts); return 'orig-ret'; },
  };
  const ctx = { _cseq: { scholarFlags: [] } };
  installScholarFlag(fakeGame, ctx);
  const r1 = fakeGame.registerDeath({ kind: 'villager', villagerId: 'v_scholar', cause: 'sickness' });
  const r2 = fakeGame.registerDeath({ kind: 'villager', villagerId: 'v_other', cause: 'monster' });
  check('installScholarFlag: delegates to inner', r1 === 'orig-ret' && calls.length === 2);
  check('installScholarFlag: flags the scholar vid', ctx._cseq.scholarFlags[0].isScholar === true);
  check('installScholarFlag: non-scholar vid not flagged', ctx._cseq.scholarFlags[1].isScholar === false);
  // Second install is a no-op (no double wrap).
  installScholarFlag(fakeGame, ctx);
  fakeGame.registerDeath({ kind: 'villager', villagerId: 'v_x', cause: 'combat' });
  check('installScholarFlag: idempotent (no double wrap)', ctx._cseq.scholarFlags.length === 3 && calls.length === 3);
}
const so = (d) => sourceOf(d, stubSrcOf);
check('sourceOf: raid monster death', so({day:80, cause:'monster', family:'monster', raid:true, via:'wild', kind:'villager', player:false}) === 'RAID');
check('sourceOf: agency-expedition monster death', so({day:80, cause:'the Reunion', family:'monster', raid:false, via:'agency-expedition', travelLegs:3, kind:'villager', player:false}) === 'WILD-ENCOUNTER');
check('sourceOf: policy-outing correlation', so({day:80, cause:'monster', family:'monster', raid:false, via:'wild', travelLegs:2, kind:'villager', player:false}) === 'EXPEDITION');
check('sourceOf: contest carve-out', so({day:80, cause:'contest', family:'combat', raid:false, via:'contest', kind:'villager', player:false}) === 'CONTEST');
check('sourceOf: contest via opts on monster verb', so({day:80, cause:'monster', family:'monster', raid:false, via:'contest', kind:'villager', player:false}) === 'CONTEST');
check('sourceOf: sickness family', so({day:80, cause:'gutrot', family:'sickness', kind:'villager', player:false}) === 'DISEASE');
check('sourceOf: starvation family', so({day:80, cause:'starvation', family:'starvation', kind:'villager', player:false}) === 'STARVATION');
check('sourceOf: wounds family', so({day:80, cause:"a wound that wouldn't close", family:'wounds', kind:'villager', player:false}) === 'WOUNDS');
check('sourceOf: combat family (raid-defense)', so({day:80, cause:'raid-defense', family:'combat', raid:false, via:null, kind:'villager', player:false}) === 'COMBAT');
check('sourceOf: null family preserved as OTHER', so({day:80, cause:'the phoenix link', family:null, kind:'villager', player:false}) === 'OTHER');
check('sourceOf: missing day is unattributed', so({day:null, cause:'monster', family:'monster', kind:'villager', player:false}) === 'unattributed');
check('sourceOf: unattributed monster death stays unattributed', so({day:undefined, cause:'monster', family:'monster', kind:'villager', player:false}) === 'unattributed');

// --- 4. interDeathIntervals ---
check('interDeathIntervals: first = days since unlock', eq(
  interDeathIntervals([{day:80},{day:80},{day:82},{day:90}], 76), [4, 0, 2, 8]));
check('interDeathIntervals: empty', eq(interDeathIntervals([], 76), []));

// --- 5. clusters (>=3 deaths in any 7-day sliding window) ---
const cl = clusters([{day:80},{day:80},{day:82},{day:84},{day:100}], 76);
check('clusters: one cluster found', cl.length === 1 && cl[0].n === 4 && cl[0].start === 80 && cl[0].end === 84,
  JSON.stringify(cl));
check('clusters: none on sparse deaths', clusters([{day:80},{day:100},{day:130}], 76).length === 0);

// --- 6. trajectoryShape ---
// Sprint: the median run ends <=45d post-unlock. Siege: it holds.
const sprintRuns = [{unlockDay:70, endDay:100, daily:[{day:70,living:7},{day:85,living:4},{day:100,living:2}]},
                    {unlockDay:60, endDay:90, daily:[{day:60,living:8},{day:75,living:5},{day:90,living:1}]}];
const siegeRuns = [{unlockDay:70, endDay:180, daily:[{day:70,living:7},{day:85,living:7},{day:100,living:6},{day:130,living:6}]},
                   {unlockDay:60, endDay:175, daily:[{day:60,living:8},{day:75,living:8},{day:90,living:7},{day:120,living:7}]}];
const shp1 = trajectoryShape(sprintRuns);
check('trajectoryShape: sprint shape', shp1.shape === 'sprint' && shp1.medianDaysPostUnlock === 30,
  JSON.stringify(shp1));
const shp2 = trajectoryShape(siegeRuns);
check('trajectoryShape: siege shape', shp2.shape === 'siege', JSON.stringify(shp2));

// --- 7. wave5ContactDay ---
check('wave5ContactDay: first wave-5 day', wave5ContactDay([{day:70,wave:4},{day:93,wave:5},{day:94,wave:5}]) === 93);
check('wave5ContactDay: null when never', wave5ContactDay([{day:70,wave:4}]) === null);

// --- 8. sweep wiring: SMOKE ---
console.log('\n--- SMOKE (instrument sweep, 15d x 2 policies) ---');
try {
  const out = execFileSync('node', [path.join(__dirname, 'casualtyseq-20261017.js')], {
    env: Object.assign({}, process.env, {
      FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
      WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', SMOKE: '1',
    }),
    timeout: 600000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  check('SMOKE exits green', /SMOKE GATE: GREEN/.test(out), out.split('\n').slice(-4).join(' | '));
} catch (e) {
  check('SMOKE exits green', false, String(e.stdout || e.message).slice(-600));
}

// --- 9. det-gate: instrument read-only ---
console.log('\n--- DET-GATE (instrument ON vs OFF, both-repeat, 4 pairs) ---');
try {
  const out = execFileSync('node', [path.join(__dirname, 'casualtyseq-20261017.js')], {
    env: Object.assign({}, process.env, {
      FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
      WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', DET: '1',
    }),
    timeout: 900000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  check('DET-GATE 4/4 identical', /DET-GATE: 4\/4 identical/.test(out), out.split('\n').slice(-4).join(' | '));
} catch (e) {
  check('DET-GATE 4/4 identical', false, String(e.stdout || e.message).slice(-600));
}

console.log(fails.length ? `\nPROOF FAILED: ${fails.length} check(s).` : '\nPROOF GREEN: all checks pass.');
process.exit(fails.length ? 1 : 0);
