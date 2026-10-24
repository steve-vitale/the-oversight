#!/usr/bin/env node
// test-doorready.js — KILL-STATE PROOF for arm sim-doorready (NO-GO at
// pilot, 2026-10-24). The original proof (19/19 green: decision unit tests,
// env-suppression mechanism, sweep plumbing mini-run) ran BEFORE the pilot
// sweep; after the NO-GO verdict the policy file was deleted per the brief
// ("killed arms leave no trace"), and this file was rewritten to prove the
// kill state instead of the live arm. It must NOT require the deleted
// policy module — a require here would fail loudly, which is the point of
// K1. Run: node scripts/test-doorready.js (no jest; writes nothing).
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-doorready');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// K1: the policy file is gone — the arm leaves no trace in the policy set.
check('K1 policy file deleted',
  !fs.existsSync(path.join(REPO, 'scripts', 'policies', 'doorready.js')));
// K2: the pilot corpus is complete (16/16) on the run anchor.
{
  const seeds = [71901, 71902, 71903, 71904, 71905, 71906, 71907, 71908];
  const bases = ['competent', 'doorready'];
  let ok = true, detail = '';
  for (const s of seeds) for (const b of bases) {
    const fn = path.join(EVID, `s${s}-${b}.json`);
    if (!fs.existsSync(fn)) { ok = false; detail += `missing ${s}-${b} `; continue; }
    try {
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      if (d.seed !== s || d.base !== b) { ok = false; detail += `identity ${s}-${b} `; }
      if (!String(d.anchorCommit || '').startsWith('ba9e5a7df')) { ok = false; detail += `anchor ${s}-${b} `; }
      if (!d.unlock || !('w4Day' in d.unlock) || !('w5Day' in d.unlock) || !d.doorSnapshot) { ok = false; detail += `keys ${s}-${b} `; }
    } catch (e) { ok = false; detail += `parse ${s}-${b} `; }
  }
  check('K2 corpus 16/16 on anchor ba9e5a7df with unlock+snapshot keys', ok, detail);
}
// K3: the analysis verdict is NO-GO with 0 matched doors.
{
  let ok = false, detail = '';
  try {
    const a = JSON.parse(fs.readFileSync(path.join(EVID, 'sim-doorready-analysis.json'), 'utf8'));
    ok = a.verdict === 'NO-GO' && a.matchedDoors === 0 && a.goDoors === false;
    detail = `verdict=${a.verdict} matched=${a.matchedDoors}`;
  } catch (e) { detail = String((e && e.message) || e); }
  check('K3 analysis verdict NO-GO, 0 matched doors', ok, detail);
}
// K4: game code and the baseline policy carry no doorready reference.
{
  const comp = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8');
  const standing = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
  check('K4 no doorready string in competent.js or standing.js',
    comp.indexOf('doorready') < 0 && standing.indexOf('doorready') < 0);
}
// K5: the analyzer still judges the corpus after the arm's death (exit 2 = NO-GO).
{
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sim-doorready-analyze.js')],
    { encoding: 'utf8', timeout: 120000 });
  const out = (r.stdout || '') + (r.stderr || '');
  check('K5 analyzer re-run exits 2 with NO-GO line',
    r.status === 2 && out.indexOf('VERDICT: NO-GO (matched doors 0/8') >= 0,
    'status=' + r.status);
}
// K6: the sense transcript exists, is live narration, and is marked NON-MEASURED.
{
  const fn = path.join(EVID, 'sim-doorready-sense.txt');
  let ok = false, detail = '';
  try {
    const body = fs.readFileSync(fn, 'utf8');
    ok = body.indexOf('NON-MEASURED') >= 0 && body.indexOf('sayLive=true') >= 0 && body.indexOf('seed=71903') >= 0;
    detail = 'lines=' + body.split('\n').length;
  } catch (e) { detail = String((e && e.message) || e); }
  check('K6 sense transcript present, live, NON-MEASURED', ok, detail);
}
// K7: the evidence file records the NO-GO verdict and the policy deletion.
{
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-10-24', 'sim-doorready.md'), 'utf8');
  check('K7 evidence records NO-GO + policy deletion',
    ev.indexOf('NO-GO at pilot') >= 0 && ev.indexOf('DELETED') >= 0);
}

console.log(`\ntest-doorready (kill-state): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
