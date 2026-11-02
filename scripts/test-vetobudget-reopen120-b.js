#!/usr/bin/env node
// test-vetobudget-reopen120-b.js — proof for the veto-budget 120d
// REOPEN instruments (sim-reopen120-b). Covers ONLY this run's own
// deltas vs the confirm instruments; the wrapper itself is proven
// by scripts/test-vetobudget-b.js (27/27, re-run separately) and
// the confirm driver/analyzer by test-vetobudget-confirm-b.js
// (14/14, re-run separately).
//
// Checks:
//  1-4. Reopen driver env gate: DAYS=60 fatal, DAYS=121 fatal,
//       DAYS=120 passes the gate (scratch seed 99999, NOT a judged
//       band seed; the run is discarded, never evidence).
//  5-6. Reopen driver snapshot still carries pantryKcal + sorted
//       roster (carried over from the confirm driver, unchanged).
//  7-15. Reopen analyzer on synthetic driver records (child
//       processes, temp files under os.tmpdir — never the repo):
//       DIAG-GO case with one abandonment + one baseline pass
//       after (reopen rate 0.333 = 1 pass / 2 vetoes after,
//       window 3) => exit 0; DIAG-GO
//       zero-reopen case (abandonment, 0 passes, 3 vetoes after,
//       rate 0, window 3) => exit 0; DIAG-NO-BAND case (0
//       abandonments) => exit 2; structural case (armed
//       later-day hop for an abandoned step) => exit 1 FAIL.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const HERE = __dirname;
const DRIVER = path.join(HERE, 'vetobudget-reopen120-b-driver.js');
const ANALYZER = path.join(HERE, 'analyze-vetobudget-reopen120-b.js');
const BASE_ENV = { PATH: process.env.PATH, POLICY: 'competent-homewardstep-b',
  COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '0' };
function runDriver(env, timeout) {
  return spawnSync(process.execPath, [DRIVER],
    { env: Object.assign({}, BASE_ENV, env), encoding: 'utf8', timeout: timeout || 60000 });
}
let r = runDriver({ DAYS: '60', SEEDS: '99999' });
check('driver gate: DAYS=60 is fatal (exit 2)', r.status === 2, 'status=' + r.status + ' stderr=' + (r.stderr || '').slice(0, 200));
check('driver gate: DAYS=60 names the 120-day rule', /DAYS must be 120/.test(r.stderr || ''));
r = runDriver({ DAYS: '121', SEEDS: '99999' });
check('driver gate: DAYS=121 is fatal (exit 2)', r.status === 2, 'status=' + r.status);
r = runDriver({ DAYS: '120', SEEDS: '99999' }, 60000);
check('driver gate: DAYS=120 passes the gate (no FATAL, not exit 2)',
  r.status !== 2 && !/FATAL/.test(r.stderr || ''),
  'status=' + r.status + ' stderr=' + (r.stderr || '').slice(0, 200));

const drv = require(DRIVER);
const fake = { map: { px: 4, py: 4 }, over: false,
  state: { scholar: { day: 5, kcal: 1000, hydration: 90 },
    village: { px: 4, py: 4, pantry: [{ kcalEach: 100, units: 3 }, { kcalEach: 50, units: 2 }], roster: ['b_id', 'a_id'] } } };
const snap = drv.snapshot(fake);
check('snapshot carries pantryKcal (harness formula)', snap.pantryKcal === 400, JSON.stringify(snap));
check('snapshot carries sorted roster + count', snap.roster.count === 2 && JSON.stringify(snap.roster.ids) === '["a_id","b_id"]', JSON.stringify(snap.roster));

// --- Synthetic analyzer cases ---
const HAVEN = { x: 4, y: 4 };
function snapAt(kcal, pantry) {
  return { pos: { x: 4, y: 4 }, haven: HAVEN, over: false, day: 0, kcal, hydration: 100,
    pantryKcal: pantry, roster: { count: 2, ids: ['a_id', 'b_id'] } };
}
function day(ld, opts) {
  opts = opts || {};
  return { loopDay: ld, start: snapAt(1000, 500), forages: opts.forages || [], end: snapAt(opts.endKcal || 1000, opts.endPantry == null ? 500 : opts.endPantry),
    vetoes: opts.vetoes || 0, silentVetoes: opts.silentVetoes || 0, lateralPasses: 0, creditUses: 0, simChecks: 0,
    beyondUngenerated: 0, homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0,
    hops: opts.hops || [], dayEndReturnSim: { ok: true, via: 'home', directOk: true, legs: 0, reason: 'home', creditUsed: 0, hops: 0, beyondUngenerated: 0 },
    suppressions: opts.suppressions || 0, abandonments: opts.abandonments || 0, budgetLog: opts.budgetLog || [] };
}
function hop(step, vetoed, silent) {
  const parts = step.split('->'); const f = parts[0].split(',').map(Number), t = parts[1].split(',').map(Number);
  return { from: { x: f[0], y: f[1] }, to: { x: t[0], y: t[1] }, simOk: !vetoed, directOk: !vetoed, via: 'direct', legs: 0, creditUsed: 0, vetoed: !!vetoed, homeward: false, originSimOk: null, silent: !!silent, shadow: false };
}
const STEP = '4,4->4,1';
function inst(seed, policy, days) {
  return { seed, policy, days: 120, daysAlive: 6, endReason: 'survived', gameDays: 6,
    maxWaveUnlocked: 1, waveKills: {}, deaths: [], days, sayLines: [] };
}
function runAnalyzer(baseInsts, armedInsts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vetobudget-reopen120-test-'));
  const bf = path.join(dir, 'base.jsonl'), af = path.join(dir, 'armed.jsonl');
  fs.writeFileSync(bf, baseInsts.map((x) => JSON.stringify(x)).join('\n') + '\n');
  fs.writeFileSync(af, armedInsts.map((x) => JSON.stringify(x)).join('\n') + '\n');
  const out = spawnSync(process.execPath, [ANALYZER, '--baseline', bf, '--armed', af], { encoding: 'utf8', timeout: 60000 });
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  return out;
}
function abandonDay3() {
  return { vetoes: 2, silentVetoes: 2, abandonments: 1,
    hops: [hop(STEP, true, true), hop(STEP, true, true)],
    budgetLog: [{ from: { x: 4, y: 4 }, to: { x: 4, y: 1 }, abandoned: true, count: 3 }] };
}
// DIAG-GO with reopen: baseline silent days 2-5, pass day 6 after
// the armed abandonment on day 3; armed suppresses days 4-6.
const baseReopen = inst(99901, 'competent-homewardstep-b', [
  day(1), day(2, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(3, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(4, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(5, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(6, { hops: [hop(STEP, false, false)] }),
]);
const armedReopen = inst(99901, 'competent-vetobudget-b', [
  day(1), day(2, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(3, abandonDay3()),
  day(4, { suppressions: 1 }), day(5, { suppressions: 1 }),
  day(6, { suppressions: 1 }),
]);
let a = runAnalyzer([baseReopen], [armedReopen]);
check('analyzer DIAG-GO reopen case exits 0', a.status === 0, 'status=' + a.status + ' out=' + (a.stdout || '').slice(-600));
check('analyzer DIAG-GO reopen case counts 1 pass, day 6', /"baselinePassesAfter": 1/.test(a.stdout || '') && /"firstBaselinePassDay": 6/.test(a.stdout || ''), (a.stdout || '').slice(-1200));
check('analyzer DIAG-GO reopen case rates 1/3 over window 3', /"reopenRate": 0.333/.test(a.stdout || '') && /"postAbandonWindowDays": 3/.test(a.stdout || ''), (a.stdout || '').slice(-1200));
// DIAG-GO zero-reopen: baseline keeps vetoing days 4-6 after the
// armed abandonment on day 3 (3 vetoes after, 0 passes, rate 0).
const baseZero = inst(99901, 'competent-homewardstep-b', [
  day(1), day(2, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(3, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(4, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(5, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(6, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
]);
a = runAnalyzer([baseZero], [armedReopen]);
check('analyzer DIAG-GO zero-reopen case exits 0', a.status === 0, 'status=' + a.status);
check('analyzer DIAG-GO zero-reopen case counts 0 passes, rate 0', /"baselinePassesAfter": 0/.test(a.stdout || '') && /"reopenRate": 0/.test(a.stdout || '') && /"baselineVetoesAfter": 3/.test(a.stdout || ''), (a.stdout || '').slice(-1200));
// DIAG-NO-BAND: 0 abandonments on the armed leg => exit 2.
const baseNone = inst(99902, 'competent-homewardstep-b', [day(1), day(2), day(3)]);
const armedNone = inst(99902, 'competent-vetobudget-b', [day(1), day(2), day(3)]);
a = runAnalyzer([baseNone], [armedNone]);
check('analyzer DIAG-NO-BAND case exits 2', a.status === 2, 'status=' + a.status);
check('analyzer DIAG-NO-BAND case prints DIAG-NO-BAND verdict', /VERDICT: DIAG-NO-BAND/.test(a.stdout || ''));
// Structural: armed leg logs a hop for the abandoned step on a
// later day (guard invoked after abandonment) => exit 1 FAIL.
const armedLeak = inst(99901, 'competent-vetobudget-b', [
  day(1), day(2, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(3, abandonDay3()),
  day(4, { suppressions: 1 }), day(5, { suppressions: 1, hops: [hop(STEP, true, false)] }),
  day(6, { suppressions: 1 }),
]);
a = runAnalyzer([baseReopen], [armedLeak]);
check('analyzer structural leak exits 1 (FAIL)', a.status === 1, 'status=' + a.status);
check('analyzer structural leak names the violation', /"armedLaterHops": 1/.test(a.stdout || ''), (a.stdout || '').slice(-1200));

console.log('vetobudget-reopen120 proof: ' + pass + '/' + (pass + fail) + ' checks pass');
process.exit(fail ? 1 : 0);
