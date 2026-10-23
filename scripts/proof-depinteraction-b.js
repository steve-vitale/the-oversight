#!/usr/bin/env node
// proof-depinteraction-b.js — PLENTYDEPRI x DEPOSITGATE interaction DIAG
// proof (sim-depinteraction-b, 2026-10-23). In the *-depinteraction-b
// namespace. MEASUREMENT ONLY — zero src/js changes.
//
// Proves, on current master, before any interaction verdict is read:
//   1. Fixture proofs still pass: scripts/test-plentydepri-b.js 28/28 and
//      scripts/test-depositgate-b.js ALL GREEN.
//   2. Det-gate on the 2x2: gate-off legs (PLENTYDEPRI=0 / DEPOSITGATE=0)
//      never engage their ledger; gate-on legs diverge from the paired
//      gate-off leg ONLY where their own mechanism engaged (4 seeds x
//      {leadfeast,belongfeast}, 40d, DG=0 for the PD leg, PD=0 for the DG leg).
//   3. Hook byte-identical vs landing commits: the _plentyDepri code region
//      is byte-identical (code lines) to df66ebaff; the DEPOSITGATE region to
//      1ff979f19 (drift since landing is other levers only).
//   4. If the 8 sweep JSONs exist: scripts/analyze-depinteraction-b.js runs
//      and its DIAG verdict is propagated (exit 0 = DIAG-GO, 1 = DIAG-NO-GO,
//      both are DATA for a DIAG — neither is a proof failure). Before the
//      full sweep this part reports "pending".
//
// Exit 0 iff all proof checks pass (and the analyzer, when inputs exist,
// ran cleanly and produced a verdict); exit 2 on any proof failure.
'use strict';
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let fail = 0;
const check = (name, cond, detail) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) fail++;
};
const run = (cmd, env, timeoutMs) => {
  const r = cp.spawnSync('bash', ['-c', cmd], { cwd: ROOT, env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: timeoutMs || 300000, maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};

(async () => {
  // 1. fixture proofs, re-run on current master
  {
    const r = run('node scripts/test-plentydepri-b.js', { FEASTSCALE_R13: '1', SEATDRIVE: '0' });
    const passes = (r.out.match(/^PASS /gm) || []).length;
    const fails = (r.out.match(/^FAIL /gm) || []).length;
    check('fixture proof test-plentydepri-b.js 28/28 on master', r.code === 0 && passes === 28 && fails === 0, `${passes} pass / ${fails} fail`);
    if (r.code !== 0 || fails) console.log(r.out.slice(-1500));
  }
  {
    const r = run('node scripts/test-depositgate-b.js', { FEASTSCALE_R13: '1', SEATDRIVE: '0' });
    check('fixture proof test-depositgate-b.js ALL GREEN on master', r.code === 0 && /ALL GREEN/.test(r.out),
      r.code === 0 ? 'ALL GREEN' : 'exit ' + r.code);
    if (r.code !== 0) console.log(r.out.slice(-1500));
  }

  // 2. det-gate: 2x2 isolation, 4 seeds x 2 policies, 40d
  const seeds = '9250,9251,9252,9253';
  const parse = out => {
    const rows = [];
    for (const l of out.split('\n')) {
      if (!l.startsWith('seed=')) continue;
      const row = {};
      for (const p of l.split(' ').slice(1)) {
        const m = p.match(/^([^:]+):([0-9a-f]{24}):pk=(\d+):pdE=(\d+):dgE=(\d+)$/);
        if (m) row[m[1]] = { fp: m[2], pk: +m[3], pdE: +m[4], dgE: +m[5] };
      }
      rows.push(row);
    }
    return rows;
  };
  const det = (env) => run(`SEEDS="${seeds}" DAYS=40 node scripts/det-gate-depinteraction-b.js`, env);
  const base = { FEASTSCALE_R13: '1', SEATDRIVE: '0' };
  // PD leg: DG=0 common-mode; PD=0 vs PD=1
  const pdOff = det(Object.assign({}, base, { PLENTYDEPRI: '0', DEPOSITGATE: '0' }));
  const pdOn = det(Object.assign({}, base, { PLENTYDEPRI: '1', DEPOSITGATE: '0' }));
  // DG leg: PD=0 common-mode; DG=0 vs DG=1
  const dgOff = det(Object.assign({}, base, { PLENTYDEPRI: '0', DEPOSITGATE: '0' }));
  const dgOn = det(Object.assign({}, base, { PLENTYDEPRI: '0', DEPOSITGATE: '1' }));
  check('det-gate ran (pdOff)', pdOff.code === 0, 'exit ' + pdOff.code);
  check('det-gate ran (pdOn)', pdOn.code === 0, 'exit ' + pdOn.code);
  check('det-gate ran (dgOff)', dgOff.code === 0, 'exit ' + dgOff.code);
  check('det-gate ran (dgOn)', dgOn.code === 0, 'exit ' + dgOn.code);
  {
    const P0 = parse(pdOff.out), P1 = parse(pdOn.out);
    let offZero = true, divergeOnly = true, n = 0;
    for (let i = 0; i < P0.length && i < P1.length; i++) for (const pn of Object.keys(P0[i])) {
      n++;
      if ((P0[i][pn].pdE || 0) !== 0) offZero = false;
      if ((P1[i][pn].pdE || 0) === 0 && P0[i][pn].fp !== P1[i][pn].fp) divergeOnly = false;
    }
    check('det-gate PD=0 ledger engaged=0 everywhere (DG=0 common-mode)', offZero, n + ' runs');
    check('det-gate PD=1 diverges from PD=0 only where PD engaged', divergeOnly, n + ' runs');
  }
  {
    const D0 = parse(dgOff.out), D1 = parse(dgOn.out);
    let offZero = true, divergeOnly = true, n = 0;
    for (let i = 0; i < D0.length && i < D1.length; i++) for (const pn of Object.keys(D0[i])) {
      n++;
      if ((D0[i][pn].dgE || 0) !== 0) offZero = false;
      if ((D1[i][pn].dgE || 0) === 0 && D0[i][pn].fp !== D1[i][pn].fp) divergeOnly = false;
    }
    check('det-gate DG=0 ledger engaged=0 everywhere (PD=0 common-mode)', offZero, n + ' runs');
    check('det-gate DG=1 diverges from DG=0 only where DG engaged', divergeOnly, n + ' runs');
  }

  // 3. hook byte-identical vs landing commits (code lines only)
  const codeDiff = (base, hookRe) => {
    const r = run(`git diff ${base} HEAD -U0 -- src/js/game.js`, {});
    const lines = r.out.split('\n').filter(l => /^[+-]/.test(l) && !/^[+-][+-]/.test(l) && hookRe.test(l));
    const nonComment = lines.filter(l => !/^\s*[+-]\s*(\/\/|\*|$)/.test(l));
    return { ok: r.code === 0, nonComment };
  };
  {
    const { ok, nonComment } = codeDiff('df66ebaff', /_plentyDepri/);
    check('plentydepri hook code byte-identical vs df66ebaff', ok && nonComment.length === 0,
      nonComment.length ? 'CHANGED: ' + nonComment.slice(0, 3).join(' | ') : 'code lines unchanged');
  }
  {
    const { ok, nonComment } = codeDiff('1ff979f19', /_depositGate|depositGate/);
    check('depositgate hook code byte-identical vs 1ff979f19', ok && nonComment.length === 0,
      nonComment.length ? 'CHANGED: ' + nonComment.slice(0, 3).join(' | ') : 'code lines unchanged');
  }

  // 4. analyzer propagation (only if sweep inputs exist)
  {
    const files = [];
    for (const cell of ['pd0-dg0', 'pd1-dg0', 'pd0-dg1', 'pd1-dg1'])
      for (const p of ['leadfeast', 'belongfeast'])
        files.push(`evidence/2026-10-23/depinteraction-b-corpus/sweep-${cell}-${p}.json`);
    const missing = files.filter(f => !fs.existsSync(path.join(ROOT, f)));
    if (missing.length) {
      console.log(`SKIP analyzer propagation — ${missing.length}/8 sweep inputs missing (pending full sweep)`);
    } else {
      const r = run('node scripts/analyze-depinteraction-b.js', {});
      console.log('--- analyzer output (tail) ---');
      console.log(r.out.split('\n').slice(-30).join('\n'));
      check('analyzer ran and produced a verdict (DIAG-GO or DIAG-NO-GO both propagate)', r.code === 0 || r.code === 1,
        'exit ' + r.code);
    }
  }

  console.log(fail === 0 ? '\nPROOF: ALL GREEN' : '\nPROOF: ' + fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 2);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
