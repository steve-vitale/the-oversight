#!/usr/bin/env node
// test-vetobudget-confirm-b.js — proof for the veto-budget CONFIRM
// instruments (sim-vetobudget-confirm-b). Covers ONLY the confirm's
// own deltas vs the pilot instruments; the wrapper itself is proven
// by scripts/test-vetobudget-b.js (27/27, re-run separately).
//
// Checks:
//  1-3. Confirm driver env gate: DAYS=30 fatal, DAYS=61 fatal,
//       COMPETENT_FEAST=1 fatal (all exit 2 before any game boot).
//  4-5. Confirm driver snapshot carries pantryKcal + sorted roster.
//  6-10. Confirm analyzer on synthetic driver records (child
//       processes, temp files under os.tmpdir — never the repo):
//       GO case with one route-reopen + one pantry-only identity
//       divergence on the reopen day; structural case (armed
//       later-day hop for an abandoned step) => NO-GO; no
//       repetition at baseline => DIAG exit 2.
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
const DRIVER = path.join(HERE, 'vetobudget-confirm-b-driver.js');
const ANALYZER = path.join(HERE, 'analyze-vetobudget-confirm-b.js');
const BASE_ENV = { PATH: process.env.PATH, POLICY: 'competent-homewardstep-b',
  COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '0',
  SEEDS: '66001' };
function runDriver(env) {
  return spawnSync(process.execPath, [DRIVER], { env: Object.assign({}, BASE_ENV, env), encoding: 'utf8', timeout: 60000 });
}
let r = runDriver({ DAYS: '30' });
check('driver gate: DAYS=30 is fatal (exit 2)', r.status === 2, 'status=' + r.status + ' stderr=' + (r.stderr || '').slice(0, 200));
check('driver gate: DAYS=30 names the 60-day rule', /DAYS must be 60/.test(r.stderr || ''));
r = runDriver({ DAYS: '61' });
check('driver gate: DAYS=61 is fatal (exit 2)', r.status === 2, 'status=' + r.status);
r = runDriver({ DAYS: '60', COMPETENT_FEAST: '1' });
check('driver gate: COMPETENT_FEAST=1 is fatal (exit 2)', r.status === 2, 'status=' + r.status);

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
  return { seed, policy, days: 60, daysAlive: 6, endReason: 'survived', gameDays: 6,
    maxWaveUnlocked: 1, waveKills: {}, deaths: [], days, sayLines: [] };
}
function runAnalyzer(baseInsts, armedInsts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vetobudget-confirm-test-'));
  const bf = path.join(dir, 'base.jsonl'), af = path.join(dir, 'armed.jsonl');
  fs.writeFileSync(bf, baseInsts.map((x) => JSON.stringify(x)).join('\n') + '\n');
  fs.writeFileSync(af, armedInsts.map((x) => JSON.stringify(x)).join('\n') + '\n');
  const out = spawnSync(process.execPath, [ANALYZER, '--baseline', bf, '--armed', af], { encoding: 'utf8', timeout: 60000 });
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  return out;
}
// GO case: baseline repetition (silent vetoes days 2-5 = 4 days),
// baseline pass of the step on day 6 (route reopened after the
// armed abandonment on day 3); armed abandons day 3, suppresses
// days 4-6, pantry diverges only on day 6 (the reopen day).
const baseGo = inst(99901, 'competent-homewardstep-b', [
  day(1), day(2, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(3, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(4, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(5, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(6, { hops: [hop(STEP, false, false)] }),
]);
const armedGo = inst(99901, 'competent-vetobudget-b', [
  day(1), day(2, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(3, { vetoes: 2, silentVetoes: 2, abandonments: 1,
    hops: [hop(STEP, true, true), hop(STEP, true, true)],
    budgetLog: [{ from: { x: 4, y: 4 }, to: { x: 4, y: 1 }, abandoned: true, count: 3 }] }),
  day(4, { suppressions: 1 }), day(5, { suppressions: 1 }),
  day(6, { suppressions: 1, endPantry: 600 }),
]);
let a = runAnalyzer([baseGo], [armedGo]);
check('analyzer GO case exits 0', a.status === 0, 'status=' + a.status + ' out=' + (a.stdout || '').slice(-600));
check('analyzer GO case reports the route reopen (1 pass, day 6)', /"baselinePassesAfter": 1/.test(a.stdout || '') && /"firstBaselinePassDay": 6/.test(a.stdout || ''), (a.stdout || '').slice(-1200));
check('analyzer GO case reports pantry identity divergence on day 6', /"divergentDays": 1/.test(a.stdout || '') && /"firstDivergentDay": 6/.test(a.stdout || ''), (a.stdout || '').slice(-1200));
check('analyzer GO case verdict is GO with cost noted', /VERDICT: GO/.test(a.stdout || '') && /route-reopen cost measured: 1/.test(a.stdout || ''), (a.stdout || '').slice(-600));
// Structural case: armed leg logs a hop for the abandoned step on
// a later day (guard invoked after abandonment) => NO-GO.
const armedLeak = inst(99901, 'competent-vetobudget-b', [
  day(1), day(2, { vetoes: 1, silentVetoes: 1, hops: [hop(STEP, true, true)] }),
  day(3, { vetoes: 2, silentVetoes: 2, abandonments: 1,
    hops: [hop(STEP, true, true), hop(STEP, true, true)],
    budgetLog: [{ from: { x: 4, y: 4 }, to: { x: 4, y: 1 }, abandoned: true, count: 3 }] }),
  day(4, { suppressions: 1 }), day(5, { suppressions: 1, hops: [hop(STEP, true, false)] }),
  day(6, { suppressions: 1 }),
]);
a = runAnalyzer([baseGo], [armedLeak]);
check('analyzer structural leak exits 1 (NO-GO)', a.status === 1, 'status=' + a.status);
check('analyzer structural leak names the violation', /"armedLaterHops": 1/.test(a.stdout || ''), (a.stdout || '').slice(-1200));
// DIAG case: no repetition at baseline => exit 2, never GO.
const baseDiag = inst(99902, 'competent-homewardstep-b', [day(1), day(2), day(3)]);
const armedDiag = inst(99902, 'competent-vetobudget-b', [day(1), day(2), day(3)]);
a = runAnalyzer([baseDiag], [armedDiag]);
check('analyzer DIAG case exits 2', a.status === 2, 'status=' + a.status);
check('analyzer DIAG case prints DIAG verdict', /VERDICT: DIAG/.test(a.stdout || ''));

console.log('vetobudget-confirm proof: ' + pass + '/' + (pass + fail) + ' checks pass');
process.exit(fail ? 1 : 0);
