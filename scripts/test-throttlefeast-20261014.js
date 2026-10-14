#!/usr/bin/env node
// scripts/test-throttlefeast-20261014.js — proof test for the throttle x
// feast-road measurement (fleshout-b, 2026-10-14).
//
// Proves, RED-capable where noted:
//   R1. The throttle-OFF arm's instrument wrap is honest: pristine
//       prodThrottleEngaged() CAN return true on a stocked pantry (fixture
//       engages), and the wrap used by the sweep neutralizes it to false.
//       (RED: delete the wrap line in the sweep and the "off" arm no longer
//       differs from "on" — this test pins the difference.)
//   R2. The sweep's oneRun measures the feast road: leadfeast 20d OFF run
//       returns numeric feasts/plenty schema and zero redirects under the wrap.
//   R3. The sweep honors its two-arm contract end to end: OFF and ON 20d runs
//       on the same seed both complete, report their throttle tag, and carry
//       FEASTSCALE_R13=1 (the feast layer armed).
//
// SMOKE=1 mode is validated separately (sweep SMOKE gate).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---- R1: OFF-wrap honesty (real RED phase lives here) ----
async function r1() {
  console.log('R1: throttle-off wrap honesty');
  const { Game } = await loadGame({ seed: 11, mode: 'tf-test-r1', fullTelemetry: false });
  await setupGame(Game);
  check('pristine prodThrottleEngaged is a function', typeof Game.prodThrottleEngaged === 'function');
  // Lean pantry should NOT engage.
  check('lean pantry: gate disengaged (false)', Game.prodThrottleEngaged() === false,
    'got ' + Game.prodThrottleEngaged());
  // Stuff the pantry far beyond 4 fresh days -> the fixture must engage.
  Game.stockPantry(300000, 'proof-fixture');
  const freshDays = Game.pantryFreshDays();
  check('fixture pantry is >4 fresh days (' + freshDays.toFixed(1) + ')', freshDays > 4);
  const engaged = Game.prodThrottleEngaged();
  check('RED-probe: pristine gate ENGAGES on stocked pantry (true)', engaged === true,
    'got ' + engaged + ' — if false, the fixture cannot engage and R1b/R2 prove nothing');
  // Apply exactly the wrap the sweep uses for the OFF arm.
  Game.prodThrottleEngaged = function () { return false; };
  check('OFF wrap neutralizes the gate (false)', Game.prodThrottleEngaged() === false);
}

// ---- R2: oneRun measures the feast road ----
async function r2() {
  console.log('R2: oneRun feast-road measurement (OFF arm, 20d)');
  process.env.THROTTLE_OFF = '1';
  delete require.cache[require.resolve('./sweep-throttlefeast-20261014')];
  const { oneRun } = require('./sweep-throttlefeast-20261014');
  let r = null;
  await quietLog(async () => { r = await oneRun(11, 20); });
  check('run completed (days>0)', r.days > 0, 'days=' + r.days);
  check('throttle tag is off', r.throttle === 'off', 'got ' + r.throttle);
  check('feasts is numeric', typeof r.feasts === 'number', JSON.stringify(r.feasts));
  check('plentyMax is numeric', typeof r.plentyMax === 'number', JSON.stringify(r.plentyMax));
  check('plentyFinal is numeric', typeof r.plentyFinal === 'number');
  check('redirects is numeric', typeof r.redirects === 'number');
  check('OFF arm never redirects under the wrap (redirects===0)', r.redirects === 0,
    'redirects=' + r.redirects);
  check('wall fields present (national/table/won/exiled)', [r.national, r.table, r.won, r.exiled].every(v => v === 0 || v === 1));
  delete process.env.THROTTLE_OFF;
}

// ---- R3: two-arm contract end to end ----
async function r3() {
  console.log('R3: OFF vs ON contract (20d, seed 11)');
  delete require.cache[require.resolve('./sweep-throttlefeast-20261014')];
  let sweep = require('./sweep-throttlefeast-20261014');
  // OFF side
  process.env.THROTTLE_OFF = '1';
  delete require.cache[require.resolve('./sweep-throttlefeast-20261014')];
  sweep = require('./sweep-throttlefeast-20261014');
  let off = null;
  await quietLog(async () => { off = await sweep.oneRun(11, 20); });
  // ON side
  delete process.env.THROTTLE_OFF;
  delete require.cache[require.resolve('./sweep-throttlefeast-20261014')];
  sweep = require('./sweep-throttlefeast-20261014');
  let on = null;
  await quietLog(async () => { on = await sweep.oneRun(11, 20); });
  check('OFF run tagged off', off.throttle === 'off');
  check('ON run tagged on', on.throttle === 'on');
  check('arms differ ONLY by the wrap: same policy, same seed, same days',
    off.policy === 'leadfeast' && on.policy === 'leadfeast' && off.seed === on.seed && off.days === on.days,
    JSON.stringify({ op: off.policy, np: on.policy, od: off.days, nd: on.days }));
  check('FEASTSCALE_R13 stayed armed across both arms', process.env.FEASTSCALE_R13 === '1',
    'got ' + process.env.FEASTSCALE_R13);
  // Feast layer really runs in this suite: feastscale exports layerOn guard.
  console.log('  INFO off: feasts=' + off.feasts + ' plentyMax=' + off.plentyMax + ' redirects=' + off.redirects);
  console.log('  INFO on:  feasts=' + on.feasts + ' plentyMax=' + on.plentyMax + ' redirects=' + on.redirects);
}

async function main() {
  await r1();
  await r2();
  await r3();
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
