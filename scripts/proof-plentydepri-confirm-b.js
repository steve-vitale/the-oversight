#!/usr/bin/env node
// proof-plentydepri-confirm-b.js — PLENTYDEPRI confirm-run proof
// (sim-plentydepri-confirm-b, 2026-10-23). In the *-plentydepri-confirm-b
// namespace. (scripts/test-plentydepri-confirm-b.js already exists on master
// from the prior 16-seed confirm run — retained for that run's provenance,
// not overwritten.)
//
// Proves, on current master, before any confirm verdict is read:
//   1. The pilot's fixture proof (scripts/test-plentydepri-b.js, 28/28)
//      still passes: RED gate-off = pure delegation (no voice, no ledger,
//      production untouched); GREEN gate-on = honest easing, own meal sacred.
//   2. Det-gate: on 4 fresh seeds x {leadfeast,belongfeast}, PLENTYDEPRI=0
//      runs engage the ledger ZERO times (gate unreachable); PLENTYDEPRI=1
//      runs diverge from gate-off ONLY where the mechanism engages.
//   3. Hook byte-identical: no code (non-comment) change to any
//      _plentyDepri line in src/js/game.js between the landing commit
//      df66ebaff and current HEAD (drift since landing is other levers only).
//   4. The 4 confirm sweep JSONs exist with the pre-registered seeds/env/
//      horizon, and the analyzer (scripts/analyze-plentydepri-confirm-b.js)
//      verdict is propagated.
//
// Exit 0 iff all proof checks pass AND the analyzer verdict is GO;
// exit 1 on analyzer NO-GO; exit 2 on any proof failure.
'use strict';
const cp = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = process.env.CONFIRM_DIR || path.join(os.homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-plentydepri-confirm-b'); // NEVER /tmp (wiped mid-run 2026-10-23)
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
  // 1. pilot fixture proof, re-run on current master
  {
    const r = run('node scripts/test-plentydepri-b.js', { FEASTSCALE_R13: '1', SEATDRIVE: '0' });
    const passes = (r.out.match(/^PASS /gm) || []).length;
    const fails = (r.out.match(/^FAIL /gm) || []).length;
    check('pilot fixture proof test-plentydepri-b.js 28/28 on master', r.code === 0 && passes === 28 && fails === 0, `${passes} pass / ${fails} fail`);
    if (r.code !== 0) console.log(r.out.slice(-2000));
  }

  // 2. det-gate: gate-off ledger never engages; gate-on diverges only where engaged
  {
    const seeds = '9209,9222,9223,9224';
    const off = run('SEEDS="' + seeds + '" DAYS=40 node scripts/det-gate-plentydepri-b.js', { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: '0' });
    const on = run('SEEDS="' + seeds + '" DAYS=40 node scripts/det-gate-plentydepri-b.js', { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: '1' });
    check('det-gate ran gate-off', off.code === 0);
    check('det-gate ran gate-on', on.code === 0);
    const parse = out => {
      const rows = [];
      for (const l of out.split('\n')) {
        if (!l.startsWith('seed=')) continue;
        const row = {};
        for (const p of l.split(' ').slice(1)) {
          const m = p.match(/^([^:]+):([0-9a-f]{24}):pk=(\d+):engaged=(\d+)$/);
          if (m) row[m[1]] = { fp: m[2], pk: +m[3], en: +m[4] };
        }
        rows.push(row);
      }
      return rows;
    };
    const pOff = parse(off.out), pOn = parse(on.out);
    let allOffZero = true, divergeOnlyEngaged = true, n = 0;
    for (let i = 0; i < pOff.length && i < pOn.length; i++) {
      for (const pn of Object.keys(pOff[i])) {
        n++;
        if ((pOff[i][pn].en || 0) !== 0) allOffZero = false;
        const engaged = (pOn[i][pn].en || 0) > 0;
        if (!engaged && pOff[i][pn].fp !== pOn[i][pn].fp) divergeOnlyEngaged = false;
      }
    }
    check('det-gate gate-off ledger engaged=0 everywhere', allOffZero, n + ' runs');
    check('det-gate gate-on diverges from gate-off only where engaged', divergeOnlyEngaged, n + ' runs');
  }

  // 3. hook byte-identical vs landing commit (code lines only)
  {
    const r = run('git diff df66ebaff HEAD -U0 -- src/js/game.js', {});
    const lines = r.out.split('\n').filter(l => /^[+-]/.test(l) && !/^[+-][+-]/.test(l) && /_plentyDepri/.test(l));
    const nonComment = lines.filter(l => !/^\s*[+-]\s*(\/\/|\*|$)/.test(l));
    check('plentydepri hook code byte-identical vs df66ebaff', r.code === 0 && nonComment.length === 0,
      nonComment.length ? 'CHANGED: ' + nonComment.slice(0, 3).join(' | ') : lines.length + ' comment-only mentions');
  }

  // 4. sweep inputs present + analyzer verdict
  {
    const files = ['sweep-control-leadfeast.json', 'sweep-armed-leadfeast.json', 'sweep-control-belongfeast.json', 'sweep-armed-belongfeast.json'];
    const missing = files.filter(f => !fs.existsSync(path.join(DIR, f)));
    check('4 confirm sweep JSONs present', missing.length === 0, missing.join(',') || files.length + ' files');
    if (!missing.length) {
      const r = run('CONFIRM_DIR=' + DIR + ' node scripts/analyze-plentydepri-confirm-b.js', {});
      console.log('--- analyzer output (tail) ---');
      console.log(r.out.split('\n').slice(-40).join('\n'));
      check('analyzer verdict GO', r.code === 0, 'exit ' + r.code);
    } else { check('analyzer verdict GO', false, 'missing inputs'); }
  }

  console.log(fail === 0 ? '\nPROOF: ALL GREEN' : '\nPROOF: ' + fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 2);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
