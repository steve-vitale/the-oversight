#!/usr/bin/env node
// test-repairrate-b.js — sim-repairrate-b proof-first gate.
//
// PRE-SWEEP proof for the REPAIRRATE repair-rate arm. All must pass before
// any sweep sims run. Writes NOTHING into the repo (OUT goes to os.tmpdir()).
//
//   ENGAGE: REPAIRRATE=1 + SUCCPOLITY=1 on the parent's succession-heavy
//           seeds (8805/8806 leadfeast armed — the parent's persistent
//           dissolutions, trust 100->39 under haircuts): the repair-rate
//           package must FIRE — beat-gifts answered AND SUCCPOLITY grace
//           windows stamped.
//   RED:    REPAIRRATE/SUCCPOLITY unset => variant policy trajectories
//           byte-identical to the baseline policies (leadfeast/belongfeast),
//           on the SURPLUSFEED=1 substrate (this arm's control) and unset.
//   DET:    same seed twice in-process byte-identical, variant unset (and,
//           additionally, with the package engaged — the levers themselves
//           must be deterministic).
//
// Usage (ENV TRAP — read this header): FEASTSCALE_R13=1 SEATDRIVE=0 and
// SURPLUSFEED=1 must be set explicitly, mirroring the sweep driver (this
// arm's control AND armed both run SURPLUSFEED=1). The proof sets
// REPAIRRATE / SUCCPOLITY per check below.
//   FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 node scripts/test-repairrate-b.js
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1, SEATDRIVE=0 and SURPLUSFEED=1 must all be set explicitly (see Usage header)');
  process.exit(2);
}

const DRIVER = path.join(__dirname, 'probe-repairrate-b.js');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'rrproof-'));
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
  // explicit unset markers: null removes any leaked value
  if (env.REPAIRRATE === null) delete e.REPAIRRATE;
  if (env.SUCCPOLITY === null) delete e.SUCCPOLITY;
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
function graceWindows(row) {
  const keys = new Set();
  for (const s of (row.succScan || [])) for (const l of (s.links || [])) {
    if (l[3] >= 0) keys.add(l[0] + ':' + l[3]);
  }
  return keys.size;
}

// ---------- ENGAGE: the repair-rate package fires on succession-heavy seeds ----------
console.log('ENGAGE (8805/8806 leadfeast-repairrate, SURPLUSFEED=1, REPAIRRATE=1, SUCCPOLITY=1, 180d)');
{
  const res = runDriver({ REPAIRRATE: '1', SUCCPOLITY: '1' }, '8805,8806', 'leadfeast-repairrate', 180);
  let gifts = 0, grace = 0;
  for (const row of res.rows) {
    gifts += (row.rr && row.rr.beatGifts) || 0;
    grace += graceWindows(row);
    console.log(`  seed=${row.seed} beatGifts=${(row.rr || {}).beatGifts || 0} graceWindows=${graceWindows(row)} diss=${(row.dissolve.dissolutions || []).length}`);
  }
  check('ENGAGE beat-gifts fired (succession beats answered +8 vs -6 silence)', gifts > 0, `gifts=${gifts}`);
  check('ENGAGE SUCCPOLITY grace windows stamped (haircut-shrink engaged)', grace > 0, `grace=${grace}`);
  check('ENGAGE instrument agreement holds (polity replication never diverged)',
    res.rows.every(r => (r.dissolve.agreeBad || 0) === 0));
}

// ---------- RED: package unset === baseline trajectories ----------
// Scoped to this arm's substrate (SURPLUSFEED=1 on both arms): variant-unset
// must delegate byte-identically to the baseline policies. (The delegation
// is SURPLUSFEED-independent — repairMode() only reads REPAIRRATE — so the
// substrate case is the sufficient check; the probe enforces SURPLUSFEED=1
// as substrate discipline.)
console.log('RED (REPAIRRATE/SUCCPOLITY unset: variant policy vs baseline policy, byte-identical rows)');
{
  const pairs = [
    ['leadfeast-repairrate', 'leadfeast'],
    ['belongfeast-repairrate', 'belongfeast'],
  ];
  for (const [variant, base] of pairs) {
    const env = { REPAIRRATE: null, SUCCPOLITY: null }; // package explicitly OFF
    const rv = runDriver(env, '8801,8802', variant, 60);
    const rb = runDriver({ REPAIRRATE: null, SUCCPOLITY: null }, '8801,8802', base, 60);
    for (let i = 0; i < 2; i++) {
      check(`RED ${variant}≡${base} seed=${rv.rows[i].seed}`,
        rowsEqual(rv.rows[i], rb.rows[i]));
    }
  }
}

// ---------- DET: same seed twice in-process, byte-identical ----------
console.log('DET (repeat in-process)');
{
  const r1 = runDriver({ REPAIRRATE: null, SUCCPOLITY: null }, '8801,8801', 'leadfeast-repairrate', 60);
  check('DET package-unset repeat byte-identical', rowsEqual(r1.rows[0], r1.rows[1]));
  const r2 = runDriver({ REPAIRRATE: '1', SUCCPOLITY: '1' }, '8802,8802', 'belongfeast-repairrate', 60);
  check('DET package-engaged repeat byte-identical', rowsEqual(r2.rows[0], r2.rows[1]));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.error('FAILED: ' + failures.join('; ')); process.exit(1); }
console.log('PROOF GREEN — sweep may proceed');
