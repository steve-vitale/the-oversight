#!/usr/bin/env node
// test-belongcost-adopt-b.js — proof for the ADOPTED belongcost DIAG instrument
// (sim-belongcost-adopt-b, backlog #889). Measurement only, zero src/js changes.
//
// Legs:
//   A derivation: sweep in this tree carries the dead instrument's anchors
//     (FATAL asserts, writeRobust 300, death-row retention fields) and the
//     pdvalue anchors it was derived from.
//   B schema: every corpus per-seed file parses, is nonzero, and retains
//     deathRows (list of {day,who,whoName,kind,cause,ctx,sayWin,teleWin})
//     plus daySeries.
//   C FATAL asserts: gate/substrate mismatch exits 2 without simming.
//   D analyzer exit semantics: missing corpus dir -> exit 2.
//   E attribution logic: synthetic rows classify C1/C2/C3/C4/U.
//   F live retention + determinism: one config (belongfeast pd0 dg0 seed
//     94101, 100d) runs fresh into a scratch dir inside this tree (deleted
//     afterwards — never /tmp, never the corpus), and its deathRows match
//     the adopted corpus file's rows in count and cause multiset.
//   G adopt-runner completeness: after the adoption sweep, the
//     missing-seed computation reports empty for every cell (the
//     pre-sweep snapshot — leadfeast pd0 dg1 missing 94103-94108,
//     belongfeast pd1 dg1 all missing — was verified green before the
//     sweep and is recorded in the evidence file; at commit time the
//     invariant is full completion, not the snapshot).
// Usage: node scripts/test-belongcost-adopt-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SWEEP = path.join(__dirname, 'sweep-belongcost-b.js');
const PDVALUE = path.join(__dirname, 'sweep-pdvalue-b.js');
const ANALYZER = path.join(__dirname, 'analyze-belongcost-b.js');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-24', 'belongcost-b-corpus');
let pass = 0, fail = 0;
const check = (name, ok, extra) => {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
};
const run = (cmd, env) => execSync(cmd, { cwd: ROOT, env: { ...process.env, ...env }, stdio: 'pipe', encoding: 'utf8' });

// A derivation
const src = fs.readFileSync(SWEEP, 'utf8');
const pd = fs.readFileSync(PDVALUE, 'utf8');
check('A1 shared anchors', ['FATAL: FEASTSCALE_R13=1', 'writeRobust', 'channelOf', 'canonCause', 'sweepSpoiled', 'stockPantry', '_depositGateHoldback', 'registerDeath', 'glutChannels', 'SUMMARY MERGE'].every(a => src.includes(a) && pd.includes(a)));
check('A2 retention deltas', ['snapContext', 'sayWin', 'teleWin', 'deathRows', 'daySeries', 'depriDec7d', 'belongcost-b-corpus'].every(d => src.includes(d)));
check('A3 retry budget 300', /for \(let i = 0; i < 300; i\+\+\)/.test(src) && /if \(i === 299\)/.test(src));

// B schema on adopted corpus (only files present; completeness is the runner's job)
let bOk = true, bN = 0;
for (const f of fs.readdirSync(CORPUS).filter(x => x.startsWith('belongcost-b-') && x.endsWith('.json'))) {
  bN++;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    if (!Array.isArray(j.deathRows) || !Array.isArray(j.daySeries)) throw new Error('retention missing');
    for (const r of j.deathRows) {
      if (typeof r.day !== 'number' || !r.cause || !r.ctx || !Array.isArray(r.sayWin) || !Array.isArray(r.teleWin)) throw new Error('row shape');
      if (r.ctx.freshDays === undefined || r.ctx.pantryKcal === undefined) throw new Error('ctx shape');
    }
  } catch (e) { bOk = false; console.log('  bad file ' + f + ': ' + e.message); }
}
check('B corpus schema + retention (' + bN + ' files)', bOk && bN >= 18, 'files=' + bN);

// C FATAL
let c1 = false;
try { run(`node ${SWEEP}`, { FEASTSCALE_R13: '1', SEATDRIVE: '0', SIDE: 'pd0', DG: 'dg0', PLENTYDEPRI: '1', DEPOSITGATE: '0', POLICY: 'belongfeast', SEEDS: '94101', DAYS: '100' }); } catch (e) { c1 = (e.status === 2); }
check('C1 FATAL on gate mismatch', c1);
let c2 = false;
try { run(`node ${SWEEP}`, { FEASTSCALE_R13: '0', SEATDRIVE: '0', SIDE: 'pd0', DG: 'dg0', PLENTYDEPRI: '0', DEPOSITGATE: '0', POLICY: 'belongfeast', SEEDS: '94101', DAYS: '100' }); } catch (e) { c2 = (e.status === 2); }
check('C2 FATAL on substrate mismatch', c2);

// D analyzer exit semantics
let d = false;
try { run(`node ${ANALYZER}`, { CORPUS_DIR: path.join(ROOT, 'evidence', '2026-10-24', 'belongcost-b-NOPE'), ANALYZER_OUT: path.join(ROOT, 'evidence', '2026-10-24', 'belongcost-b-NOPE.txt') }); } catch (e) { d = (e.status === 2); }
check('D analyzer exits 2 on missing corpus', d);

// E attribution logic
const { classify } = require('./analyze-belongcost-b.js');
const mk = (cause, ctx, say, tele) => ({ cause, ctx, sayWin: say || [], teleWin: tele || [] });
check('E1 C1 pantry-empty starvation', classify(mk('starvation', { freshDays: 0, hungry: 2, depriDec7d: 0 })).chain === 'C1');
check('E2 C2 ease-shortfall starvation', classify(mk('starvation', { freshDays: 3, hungry: 0, depriDec7d: 2 })).chain === 'C2');
check('E3 C3 water-window dehydration', classify(mk('dehydration', { freshDays: 30, hungry: 0 }, ['d20 need water'], [])).chain === 'C3');
check('E4 C4 alien-window', classify(mk('alien', {}, [], ['d10 alien beam'])).chain === 'C4');
check('E5 U silent dehydration', classify(mk('dehydration', { freshDays: 30, hungry: 0 })).chain === 'U');

// F live retention + determinism (scratch inside tree, removed afterwards)
const scratch = fs.mkdtempSync(path.join(ROOT, '.test-belongcost-adopt-'));
try {
  execFileSync('node', [SWEEP], {
    cwd: ROOT,
    env: { ...process.env, FEASTSCALE_R13: '1', SEATDRIVE: '0', SIDE: 'pd0', DG: 'dg0', PLENTYDEPRI: '0', DEPOSITGATE: '0', POLICY: 'belongfeast', SEEDS: '94101', DAYS: '100', OUT: path.join(scratch, 'sweep.json'), PERSEED_DIR: scratch },
    stdio: 'pipe', encoding: 'utf8', timeout: 600000,
  });
  const fresh = JSON.parse(fs.readFileSync(path.join(scratch, 'belongcost-b-pd0-dg0-belongfeast-s94101.json'), 'utf8'));
  const adopted = JSON.parse(fs.readFileSync(path.join(CORPUS, 'belongcost-b-pd0-dg0-belongfeast-s94101.json'), 'utf8'));
  const multiset = (rows) => rows.map(r => r.cause).sort().join(',');
  check('F1 live run retains deathRows', Array.isArray(fresh.deathRows) && fresh.deathRows.length > 0, 'rows=' + (fresh.deathRows || []).length);
  check('F2 determinism vs adopted corpus (count + causes)', fresh.deathRows.length === adopted.deathRows.length && multiset(fresh.deathRows) === multiset(adopted.deathRows),
    'fresh ' + fresh.deathRows.length + ' vs adopted ' + adopted.deathRows.length);
  check('F3 live run retains daySeries', Array.isArray(fresh.daySeries) && fresh.daySeries.length === adopted.daySeries.length);
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

// G adopt-runner missing-seed computation (re-implemented check, not the shell)
const missingFor = (side, dg, pol, pdn, dgn) => {
  const out = [];
  for (let s = 94101; s <= 94108; s++) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(CORPUS, `belongcost-b-${side}-${dg}-${pol}-s${s}.json`), 'utf8'));
      if (j.seed !== s || j.policy !== pol || j.plentydepri !== pdn || j.depositgate !== dgn || !Array.isArray(j.deathRows)) throw new Error('bad');
    } catch (e) { out.push(s); }
  }
  return out;
};
check('G1 all 6 cells complete (missing = [])',
  [['belongfeast', 'pd0', 'dg0', 0, 0], ['belongfeast', 'pd1', 'dg0', 1, 0],
   ['belongfeast', 'pd0', 'dg1', 0, 1], ['belongfeast', 'pd1', 'dg1', 1, 1],
   ['leadfeast', 'pd0', 'dg1', 0, 1], ['leadfeast', 'pd1', 'dg1', 1, 1]]
    .every(([pol, side, dg, pdn, dgn]) => missingFor(side, dg, pol, pdn, dgn).length === 0));
check('G2 belongfeast pd0 dg0 complete', missingFor('pd0', 'dg0', 'belongfeast', 0, 0).length === 0);
check('G3 belongfeast pd1 dg1 complete after adoption', missingFor('pd1', 'dg1', 'belongfeast', 1, 1).length === 0);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
