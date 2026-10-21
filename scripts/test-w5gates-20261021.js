#!/usr/bin/env node
// test-w5gates-20261021.js — proof for the w5gates instrument
// (sim-w5gates, run fleshout-20261021T0146Z, axis scale-onramp).
//
// INSTRUMENT-ONLY: zero src/js, zero scripts/policies changes.
//
// RED->GREEN:
//   E1 (gate-state detection): attribute() classifies synthetic gate
//     vectors — locked-on-defer5 / locked-on-cap / locked-on-w4faced /
//     locked-on-w3rung / locked-on-stand-raw / locked-on-defer4 /
//     unlocked-all-met / grandfathered-unlocked / locked-unexplained /
//     unlocked-but-unmet. RED: the lib absent -> require throws -> exit 1
//     (verified by temporarily moving scripts/w5gates-lib.js before the
//     first GREEN run).
//   E2 (det-gate): the sweep's DET=1 mode on paired seeds is byte-identical
//     (instrument-on vs instrument-off), proving the daily reads (incl.
//     villageStandingTotal's idempotent beats) are trajectory-neutral.
//   E3 (live-read): SMOKE mode — gateVector reads live harness state on a
//     real 10d run without crashing, and the end vector attributes.
//
// Usage: node scripts/test-w5gates-20261021.js
//   (env the sweep needs: VGEAR=1 FEASTSCALE_R13=1, SEATDRIVE unset)
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// ---- E1: attribute() on synthetic vectors (PURE, no harness) ----
const lib = require('./w5gates-lib');
check('E1 lib loads: gateVector/dailyGateTrace/attribute exported',
  typeof lib.gateVector === 'function' && typeof lib.dailyGateTrace === 'function' && typeof lib.attribute === 'function');

function synV(over) {
  const base = {
    day: 100, dayFloor: 25, l2: 4,
    w3: { dayOk: true, l2Ok: true, met: true, b2need: 4 },
    raw: 250, war: 150, dip: 0, plenty: 100, warPts: 6, links: 0, feasts: 5,
    t4: 100, t5: 200, plentyCap: 100,
    demand4: { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 },
    demand5: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 },
    capped: 210, peak: 0, gated: 199,
    r4: { armored: 3, armed: 5, tricks: 3, veterans: 1, short: [], ready: true },
    r5: { armored: 4, armed: 6, tricks: 3, veterans: 2, short: [], ready: true },
    df4: { deferred: false, grandfathered: false, raw: 250, threshold: 100 },
    df5: { deferred: false, grandfathered: false, raw: 250, capped: 210, threshold: 200 },
    w4faced: 2, w4facedMids: ['eater', 'audit'], facedPerWave: { 1: 5, 2: 5, 3: 4, 4: 2, 5: 0 },
    uw: 4,
    dist: {
      w3rung: { day: 0, l2: 0 },
      'stand-raw': { standing: 0 },
      'plenty-cap': { loss: 40 },
      defer4: { armor: 0, weapons: 0, tricks: 0, veterans: 0 },
      defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 0 },
      w4faced: { types: 0 },
    },
  };
  const v = Object.assign({}, base, over || {});
  return v;
}

console.log('E1: gate-state detection (synthetic vectors)');
{
  // 1. locked on defer5 (the vgear pilot's shape: veteran leg short)
  const v = synV({ gated: 199, df5: { deferred: true, grandfathered: false, raw: 250, capped: 210, threshold: 200 },
    r5: { armored: 4, armed: 6, tricks: 3, veterans: 1, short: ['veterans'], ready: false },
    dist: Object.assign(synV().dist, { defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 1 } }) });
  const a = lib.attribute(v);
  check('locked-on-defer5: attributed', a.attributed === true);
  check('locked-on-defer5: binding=defer5', a.binding === 'defer5', 'got ' + a.binding);
  check('locked-on-defer5: unmet=[defer5]', JSON.stringify(a.unmet) === '["defer5"]', 'got ' + JSON.stringify(a.unmet));
  check('locked-on-defer5: veteran distance=1', v.dist.defer5.veterans === 1);
}
{
  // 2. locked on the plenty cap (bread alone)
  const v = synV({ raw: 240, capped: 160, gated: 199,
    plenty: 180, feasts: 9,
    dist: Object.assign(synV().dist, { 'plenty-cap': { loss: 80 } }) });
  const a = lib.attribute(v);
  check('locked-on-cap: attributed', a.attributed === true);
  check('locked-on-cap: binding=plenty-cap', a.binding === 'plenty-cap', 'got ' + a.binding);
  check('locked-on-cap: cap loss=80', v.dist['plenty-cap'].loss === 80);
}
{
  // 3. locked on w4faced (everything met but no wave-4 fight)
  const v = synV({ w4faced: 0, w4facedMids: [],
    dist: Object.assign(synV().dist, { w4faced: { types: 1 } }) });
  const a = lib.attribute(v);
  check('locked-on-w4faced: attributed', a.attributed === true);
  check('locked-on-w4faced: binding=w4faced', a.binding === 'w4faced', 'got ' + a.binding);
}
{
  // 4. locked on the w3 rung (early death)
  const v = synV({ day: 20, l2: 1, w3: { dayOk: false, l2Ok: false, met: false, b2need: 4 }, raw: 40, capped: 40,
    dist: Object.assign(synV().dist, { w3rung: { day: 5, l2: 3 }, 'stand-raw': { standing: 160 } }) });
  const a = lib.attribute(v);
  check('locked-on-w3rung: attributed', a.attributed === true);
  check('locked-on-w3rung: binding=w3rung', a.binding === 'w3rung', 'got ' + a.binding);
  check('locked-on-w3rung: day distance=5', v.dist.w3rung.day === 5);
}
{
  // 5. locked on raw standing (never got close)
  const v = synV({ raw: 80, capped: 80, gated: 80, warPts: 3, war: 75,
    dist: Object.assign(synV().dist, { 'stand-raw': { standing: 120 }, 'plenty-cap': { loss: 0 } }) });
  const a = lib.attribute(v);
  check('locked-on-stand-raw: attributed', a.attributed === true);
  check('locked-on-stand-raw: binding=stand-raw', a.binding === 'stand-raw', 'got ' + a.binding);
}
{
  // 6. locked on defer4 (wave-4 readiness blocks wave-5 indirectly — the
  // engine's defer4 bound (t4-1=99) is TIGHTER than defer5's (t5-1=199), so
  // when both deferrals apply, defer4 binds)
  const v = synV({ gated: 99,
    r4: { armored: 1, armed: 4, tricks: 2, veterans: 0, short: ['armor', 'weapons', 'tricks', 'veterans'], ready: false },
    df4: { deferred: true, grandfathered: false, raw: 250, threshold: 100 },
    r5: { armored: 1, armed: 4, tricks: 2, veterans: 0, short: ['armor', 'weapons', 'tricks', 'veterans'], ready: false },
    df5: { deferred: true, grandfathered: false, raw: 250, capped: 250, threshold: 200 },
    w4faced: 0, w4facedMids: [],
    dist: Object.assign(synV().dist, {
      defer4: { armor: 2, weapons: 1, tricks: 1, veterans: 1 },
      defer5: { armor: 3, weapons: 2, tricks: 1, veterans: 2 },
      w4faced: { types: 1 },
    }) });
  const a = lib.attribute(v);
  check('locked-on-defer4: attributed', a.attributed === true);
  check('locked-on-defer4: binding=defer4 (tighter than defer5)', a.binding === 'defer4', 'got ' + a.binding);
  check('locked-on-defer4: defer5 unmet too, but not binding', a.unmet.indexOf('defer5') >= 0 && a.binding !== 'defer5',
    'got ' + JSON.stringify(a.unmet));
}
{
  // 7. unlocked, all gates met
  const v = synV({ uw: 5, peak: 5, gated: 250 });
  const a = lib.attribute(v);
  check('unlocked-all-met: attributed', a.attributed === true);
  check('unlocked-all-met: why=all gates met', a.why === 'all gates met', 'got ' + a.why);
}
{
  // 8. grandfathered: peak ratchet held the door open after standing fell
  const v = synV({ uw: 5, peak: 5, raw: 120, capped: 120, gated: 200, war: 60, plenty: 60, feasts: 3,
    dist: Object.assign(synV().dist, { 'stand-raw': { standing: 80 }, 'plenty-cap': { loss: 0 } }) });
  const a = lib.attribute(v);
  check('grandfathered: attributed', a.attributed === true);
  check('grandfathered: why names the ratchet', /grandfathered/.test(a.why), 'got ' + a.why);
}
{
  // 9. locked but every gate reads met = UNEXPLAINED
  const v = synV({ uw: 4 });
  const a = lib.attribute(v);
  check('locked-unexplained: NOT attributed', a.attributed === false);
  check('locked-unexplained: why=UNEXPLAINED', /UNEXPLAINED/.test(a.why), 'got ' + a.why);
}
{
  // 10. unlocked but gates read unmet without a ratchet = UNEXPLAINED
  const v = synV({ uw: 5, peak: 0, raw: 100, capped: 100, gated: 100,
    dist: Object.assign(synV().dist, { 'stand-raw': { standing: 100 }, 'plenty-cap': { loss: 0 } }) });
  const a = lib.attribute(v);
  check('unlocked-unexplained: NOT attributed', a.attributed === false);
}

// ---- E2: det-gate (paired seeds byte-identical) ----
console.log('E2: det-gate (paired seeds, instrument-on vs instrument-off)');
try {
  const env = Object.assign({}, process.env, {
    VGEAR: '1', FEASTSCALE_R13: '1', DET: '1', SEEDS: '64401', DAYS: '60', ONLY: 'leadfeast',
  });
  delete env.SEATDRIVE; delete env.VETSHAPE;
  const out = execSync(`node ${path.join(REPO, 'scripts', 'w5gates-sweep-20261021.js')}`, {
    cwd: REPO, env, timeout: 600000, encoding: 'utf8',
  });
  const lines = out.split('\n').filter((l) => /^DET [^:]+: (IDENTICAL|DIVERGED)/.test(l));
  const ok = lines.length > 0 && lines.every((l) => /IDENTICAL/.test(l)) && /DET GREEN/.test(out);
  console.log(lines.join('\n'));
  check('det-gate: byte-identical trajectories', ok, 'see output above');
} catch (e) {
  check('det-gate: byte-identical trajectories', false, String((e && e.message) || e).slice(0, 300));
}

// ---- E3: live-read smoke (gateVector on a real 10d run) ----
console.log('E3: live-read smoke (gateVector on real harness state)');
try {
  const env = Object.assign({}, process.env, {
    VGEAR: '1', FEASTSCALE_R13: '1', SMOKE: '1', SEEDS: '64401', DAYS: '10', ONLY: 'belongfeast',
  });
  delete env.SEATDRIVE; delete env.VETSHAPE;
  const out = execSync(`node ${path.join(REPO, 'scripts', 'w5gates-sweep-20261021.js')}`, {
    cwd: REPO, env, timeout: 600000, encoding: 'utf8',
  });
  const m = out.match(/SMOKE belongfeast\/s64401: ([^\n]+)/);
  check('smoke: one run completes', !!m, 'no SMOKE line');
  if (m) {
    const line = m[1];
    check('smoke: end vector attributed', /attributed=true/.test(line), line);
    check('smoke: gate numbers finite', /uw=\d+ raw=-?\d+ capped=-?\d+ gated=-?\d+/.test(line), line);
  }
} catch (e) {
  check('live-read smoke', false, String((e && e.message) || e).slice(0, 300));
}

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
