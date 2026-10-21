#!/usr/bin/env node
// test-upkeepgate-b.js — sim-upkeepgate-b proof-first gate.
//
// PRE-SWEEP proof for the UPKEEPGATE lever arm. All must pass before any
// sweep sims run. Writes NOTHING into the repo (OUT goes to os.tmpdir()).
//
//   ENGAGE: UPKEEPGATE=low on the parent's clean lean seed (8801 leadfeast
//           armed — pantry collapsed 46k->2.8k post-court, tending halted at
//           the 20k gate from week 16): the lowered gate must FIRE —
//           gate-skips recorded AND variant upkeep calls actually made.
//   RED:    UPKEEPGATE unset => variant policy trajectories byte-identical
//           to the baseline policies (leadfeast/belongfeast), armed and
//           unset, on identical seeds (the lever is default-OFF).
//   DET:    same seed twice in-process byte-identical, variant unset (and,
//           additionally, with the variant engaged — the lever itself must
//           be deterministic).
//
// Usage (ENV TRAP — read this header): FEASTSCALE_R13=1 SEATDRIVE=0 must be
// set explicitly, mirroring the sweep driver. The proof sets SURPLUSFEED /
// UPKEEPGATE per check below.
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-upkeepgate-b.js
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}

const DRIVER = path.join(__dirname, 'probe-upkeepgate-b.js');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ugproof-'));
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; failures.push(name); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function runDriver(env, seeds, policy, days) {
  const out = path.join(TMP, `r${runDriver.n++}.json`);
  const e = Object.assign({}, process.env, env, {
    SEEDS: seeds, POLICY: policy, DAYS: String(days), OUT: out,
  });
  // explicit unset marker: env.UPKEEPGATE === null removes any leaked value
  if (env.UPKEEPGATE === null) delete e.UPKEEPGATE;
  if (env.SURPLUSFEED === null) delete e.SURPLUSFEED;
  const r = spawnSync(process.execPath, [DRIVER], { env: e, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error('driver failed', { seeds, policy, days, env });
    console.error((r.stderr || '').slice(-3000));
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(out, 'utf8'));
}
runDriver.n = 0;

function normRow(row) {
  const c = JSON.parse(JSON.stringify(row));
  delete c.ms;
  return c;
}
function rowsEqual(a, b) {
  return JSON.stringify(normRow(a)) === JSON.stringify(normRow(b));
}

// ---------- ENGAGE: the lowered gate fires on the lean seed ----------
console.log('ENGAGE (8801 leadfeast-upkeepgate, SURPLUSFEED=1, UPKEEPGATE=low, 180d)');
{
  const res = runDriver({ SURPLUSFEED: '1', UPKEEPGATE: 'low' }, '8801', 'leadfeast-upkeepgate', 180);
  const row = res.rows[0];
  const ug = row.ug || {};
  console.log(`  ug: ${JSON.stringify(ug)} trim=${Math.round((row.sfeed || {}).trimKcal || 0)}`);
  check('ENGAGE gate-skips recorded (base 20k gate would skip, 8k gate covers)',
    (ug.gateSkips || 0) > 0, `gateSkips=${ug.gateSkips || 0}`);
  check('ENGAGE variant upkeep calls made (tendLink fired in the 8k-20k band)',
    (ug.tendCalls || 0) > 0, `tendCalls=${ug.tendCalls || 0}`);
  check('ENGAGE base tending still present (no cannibalization of the base pass)',
    (ug.baseTended || 0) > 0, `baseTended=${ug.baseTended || 0}`);
}

// ---------- RED: variant unset === baseline trajectories ----------
console.log('RED (UPKEEPGATE unset: variant policy vs baseline policy, byte-identical rows)');
{
  const pairs = [
    ['leadfeast-upkeepgate', 'leadfeast'],
    ['belongfeast-upkeepgate', 'belongfeast'],
  ];
  for (const [variant, base] of pairs) {
    for (const armed of [false, true]) {
      const env = { UPKEEPGATE: null }; // variant explicitly OFF
      if (armed) env.SURPLUSFEED = '1';
      const rv = runDriver(env, '8801,8802', variant, 60);
      // the baseline through the same driver (UPKEEPGATE never set here)
      const ebase = armed ? { SURPLUSFEED: '1', UPKEEPGATE: null } : { UPKEEPGATE: null };
      const rb = runDriver(ebase, '8801,8802', base, 60);
      for (let i = 0; i < 2; i++) {
        check(`RED ${variant}≡${base} ${armed ? 'armed' : 'control'} seed=${rv.rows[i].seed}`,
          rowsEqual(rv.rows[i], rb.rows[i]));
      }
    }
  }
}

// ---------- DET: same seed twice in-process, byte-identical ----------
console.log('DET (repeat in-process)');
{
  const r1 = runDriver({ UPKEEPGATE: null }, '8801,8801', 'leadfeast-upkeepgate', 60); // variant explicitly OFF
  check('DET variant-unset repeat byte-identical', rowsEqual(r1.rows[0], r1.rows[1]));
  const r2 = runDriver({ UPKEEPGATE: 'low', SURPLUSFEED: '1' }, '8802,8802', 'belongfeast-upkeepgate', 60);
  check('DET variant-engaged repeat byte-identical', rowsEqual(r2.rows[0], r2.rows[1]));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.error('FAILED: ' + failures.join('; ')); process.exit(1); }
console.log('PROOF GREEN — sweep may proceed');
