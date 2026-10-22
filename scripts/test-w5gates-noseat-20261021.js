#!/usr/bin/env node
// test-w5gates-noseat-20261021.js — proof for the w5gates-noseat instrument
// (sim-w5gates-noseat, run fleshout-20261021T2215Z, axis scale-onramp).
//
// INSTRUMENT-ONLY: zero src/js, zero scripts/policies changes.
//
// RED->GREEN:
//   E1 (gate-state detection): attribute() classifies synthetic gate
//     vectors for all six binding gates (w3rung / stand-raw / plenty-cap /
//     defer4 / defer5 / w4faced), unlocked-all-met, grandfathered,
//     locked-unexplained, unlocked-unexplained. RED: the lib absent ->
//     require throws -> exit 1 (verified by temporarily moving
//     scripts/w5gates-lib.js before the first GREEN run).
//   E2 (honest gates): the sweep's substrate guard FAILS LOUD when the
//     env is wrong (VGEAR=1 -> exit 2; SEATDRIVE unset -> exit 2); the
//     policy bases are the PLAIN feastscale bases (not vgear-wrapped);
//     SMOKE on the noseat substrate attributes a live 10d end vector.
//   E3 (det-gate): the noseat sweep's DET=1 mode on paired seeds is
//     byte-identical (instrument-on vs instrument-off), proving the daily
//     reads (incl. villageStandingTotal's idempotent beats) are
//     trajectory-neutral on this substrate.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-w5gates-noseat-20261021.js
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SWEEP = path.join(REPO, 'scripts', 'w5gates-noseat-sweep-20261021.js');

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
  return Object.assign({}, base, over || {});
}

console.log('E1: gate-state detection (synthetic vectors)');
{
  const v = synV({ gated: 199, df5: { deferred: true, grandfathered: false, raw: 250, capped: 210, threshold: 200 },
    r5: { armored: 4, armed: 6, tricks: 3, veterans: 1, short: ['veterans'], ready: false },
    dist: Object.assign(synV().dist, { defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 1 } }) });
  const a = lib.attribute(v);
  check('locked-on-defer5: attributed', a.attributed === true);
  check('locked-on-defer5: binding=defer5', a.binding === 'defer5', 'got ' + a.binding);
  check('locked-on-defer5: unmet=[defer5]', JSON.stringify(a.unmet) === '["defer5"]', 'got ' + JSON.stringify(a.unmet));
}
{
  const v = synV({ raw: 240, capped: 160, gated: 199, plenty: 180, feasts: 9,
    dist: Object.assign(synV().dist, { 'plenty-cap': { loss: 80 } }) });
  const a = lib.attribute(v);
  check('locked-on-cap: attributed', a.attributed === true);
  check('locked-on-cap: binding=plenty-cap', a.binding === 'plenty-cap', 'got ' + a.binding);
  check('locked-on-cap: cap loss=80', v.dist['plenty-cap'].loss === 80);
}
{
  const v = synV({ w4faced: 0, w4facedMids: [],
    dist: Object.assign(synV().dist, { w4faced: { types: 1 } }) });
  const a = lib.attribute(v);
  check('locked-on-w4faced: attributed', a.attributed === true);
  check('locked-on-w4faced: binding=w4faced', a.binding === 'w4faced', 'got ' + a.binding);
}
{
  const v = synV({ day: 20, l2: 1, w3: { dayOk: false, l2Ok: false, met: false, b2need: 4 }, raw: 40, capped: 40,
    dist: Object.assign(synV().dist, { w3rung: { day: 5, l2: 3 }, 'stand-raw': { standing: 160 } }) });
  const a = lib.attribute(v);
  check('locked-on-w3rung: attributed', a.attributed === true);
  check('locked-on-w3rung: binding=w3rung', a.binding === 'w3rung', 'got ' + a.binding);
  check('locked-on-w3rung: day distance=5', v.dist.w3rung.day === 5);
}
{
  const v = synV({ raw: 80, capped: 80, gated: 80, warPts: 3, war: 75,
    dist: Object.assign(synV().dist, { 'stand-raw': { standing: 120 }, 'plenty-cap': { loss: 0 } }) });
  const a = lib.attribute(v);
  check('locked-on-stand-raw: attributed', a.attributed === true);
  check('locked-on-stand-raw: binding=stand-raw', a.binding === 'stand-raw', 'got ' + a.binding);
}
{
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
  const v = synV({ uw: 5, peak: 5, gated: 250 });
  const a = lib.attribute(v);
  check('unlocked-all-met: attributed', a.attributed === true);
  check('unlocked-all-met: why=all gates met', a.why === 'all gates met', 'got ' + a.why);
}
{
  const v = synV({ uw: 5, peak: 5, raw: 120, capped: 120, gated: 200, war: 60, plenty: 60, feasts: 3,
    dist: Object.assign(synV().dist, { 'stand-raw': { standing: 80 }, 'plenty-cap': { loss: 0 } }) });
  const a = lib.attribute(v);
  check('grandfathered: attributed', a.attributed === true);
  check('grandfathered: why names the ratchet', /grandfathered/.test(a.why), 'got ' + a.why);
}
{
  const v = synV({ uw: 4 });
  const a = lib.attribute(v);
  check('locked-unexplained: NOT attributed', a.attributed === false);
  check('locked-unexplained: why=UNEXPLAINED', /UNEXPLAINED/.test(a.why), 'got ' + a.why);
}
{
  const v = synV({ uw: 5, peak: 0, raw: 100, capped: 100, gated: 100,
    dist: Object.assign(synV().dist, { 'stand-raw': { standing: 100 }, 'plenty-cap': { loss: 0 } }) });
  const a = lib.attribute(v);
  check('unlocked-unexplained: NOT attributed', a.attributed === false);
}

// ---- E2: honest gates (substrate guard + live smoke on the noseat stack) ----
console.log('E2: honest gates (substrate guard + live smoke)');
{
  // Guard must FAIL LOUD with VGEAR=1 (exit 2).
  let code = null;
  try {
    execSync(`node ${SWEEP}`, {
      cwd: REPO, env: Object.assign({}, process.env, { FEASTSCALE_R13: '1', SEATDRIVE: '0', VGEAR: '1', SMOKE: '1' }),
      timeout: 60000, encoding: 'utf8', stdio: 'pipe',
    });
    code = 0;
  } catch (e) { code = e && e.status != null ? e.status : -1; }
  check('guard: VGEAR=1 -> exit 2 (fails loud)', code === 2, 'got ' + code);
}
{
  // Guard must FAIL LOUD with SEATDRIVE unset (exit 2).
  const env = Object.assign({}, process.env, { FEASTSCALE_R13: '1', SMOKE: '1' });
  delete env.SEATDRIVE;
  let code = null;
  try {
    execSync(`node ${SWEEP}`, { cwd: REPO, env, timeout: 60000, encoding: 'utf8', stdio: 'pipe' });
    code = 0;
  } catch (e) { code = e && e.status != null ? e.status : -1; }
  check('guard: SEATDRIVE unset -> exit 2 (fails loud)', code === 2, 'got ' + code);
}
{
  // The policy bases are the PLAIN feastscale bases, not vgear-wrapped.
  const sweep = require('./w5gates-noseat-sweep-20261021');
  const FS = require('./policies/feastscale');
  check('bases: leadfeast is the plain feastscale base', sweep.baseFor('leadfeast') === FS.leadfeast);
  check('bases: belongfeast is the plain feastscale base', sweep.baseFor('belongfeast') === FS.belongfeast);
  check('bases: no vgear wrapper in the module graph', !Object.keys(require.cache).some(k => k.endsWith('policies/villagergear.js')));
}
try {
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', SEATDRIVE: '0', SMOKE: '1', SEEDS: '65201', DAYS: '10', ONLY: 'belongfeast',
  });
  const out = execSync(`node ${SWEEP}`, {
    cwd: REPO, env, timeout: 600000, encoding: 'utf8',
  });
  const m = out.match(/SMOKE belongfeast\/s65201: ([^\n]+)/);
  check('smoke: one noseat run completes', !!m, 'no SMOKE line');
  if (m) {
    const line = m[1];
    check('smoke: end vector attributed', /attributed=true/.test(line), line);
    check('smoke: gate numbers finite', /uw=\d+ raw=-?\d+ capped=-?\d+ gated=-?\d+/.test(line), line);
  }
} catch (e) {
  check('live-read smoke (noseat)', false, String((e && e.message) || e).slice(0, 300));
}

// ---- E3: det-gate (paired seeds byte-identical on the noseat substrate) ----
console.log('E3: det-gate (paired seeds, instrument-on vs instrument-off)');
try {
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', SEATDRIVE: '0', DET: '1', SEEDS: '65201,65202', DAYS: '60',
  });
  const out = execSync(`node ${SWEEP}`, {
    cwd: REPO, env, timeout: 900000, encoding: 'utf8',
  });
  const lines = out.split('\n').filter((l) => /^DET [^:]+: (IDENTICAL|DIVERGED)/.test(l));
  const ok = lines.length > 0 && lines.every((l) => /IDENTICAL/.test(l)) && /DET GREEN/.test(out);
  console.log(lines.join('\n'));
  check('det-gate: byte-identical trajectories', ok, 'see output above');
} catch (e) {
  check('det-gate: byte-identical trajectories', false, String((e && e.message) || e).slice(0, 300));
}

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
