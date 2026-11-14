#!/usr/bin/env node
// test-m23-mixed-r203.js — r203 M23-fix regression proof.
// The r198 analyzer's capNoRefusal demanded delivery from EVERY eligible
// seed (line 1272: `&& x.delivered`), contradicting the prereg rule
// (§M23-REV: GO iff ≥1 eligible delivered AND ≥1 priced full AND zero
// non-exempt refusals). The r199 one-line fix dropped `&& x.delivered`;
// the r203 analyzer carries that fix verbatim (rename only). The r198
// pass-B mixed case — 89705 delivered + priced FULL, 89704
// eligible-undelivered with all refusals exempt — scored NO-GO under
// the bug and must score GO with the fix.
// This test re-scores the COMMITTED r198 corpora (read-only copies under
// /tmp, files renamed endgame-r198-* -> endgame-r203-* with the transcript
// header's run tag rewritten so the r203 analyzer's filename filter and
// purity regex match; all values unchanged) with the r203 analyzer and asserts:
//   B: analyzer RC=0 (ALL GO) and the M23 line is GO naming
//      89705:feast_embassy@d68/FULL, 89704:none, delivered 1/2,
//      NON-EXEMPT-refused-despite-ready 0.
//   C: analyzer RC=0 (ALL GO, unchanged) and M23 GO with delivered 2/2.
//   A: analyzer RC=0 (ALL GO, unchanged).
// A revert of the one-line fix fails B (M23 NO-GO, RC=1). Writes only
// under /tmp/m23-mixed-r203-*.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ANALYZER = path.join(__dirname, 'analyze-endgame-r203-20261114.js');
const EVID = path.join(__dirname, '..', 'evidence', '2026-11-14');
const SCRATCH = '/tmp/m23-mixed-r203';
fs.mkdirSync(SCRATCH, { recursive: true });

let fail = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fail++;
}

function copyCorpus(srcDir, dstDir) {
  fs.rmSync(dstDir, { recursive: true, force: true });
  fs.mkdirSync(dstDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir)) {
    const m = /^endgame-r198-(\d+)(\.json|-transcript\.txt)$/.exec(f);
    if (!m) continue;
    const dst = path.join(dstDir, `endgame-r203-${m[1]}${m[2]}`);
    if (m[2] === '-transcript.txt') {
      // Rewrite the header's run tag (values unchanged): the r203
      // analyzer's purity regex keys on "# journey-endgame r203".
      const lines = fs.readFileSync(path.join(srcDir, f), 'utf8').split('\n');
      lines[0] = lines[0].replace('journey-endgame r198', 'journey-endgame r203');
      fs.writeFileSync(dst, lines.join('\n'));
    } else {
      fs.copyFileSync(path.join(srcDir, f), dst);
    }
  }
}

function runAnalyzer(dir) {
  try {
    const out = execFileSync(process.execPath, [ANALYZER], {
      env: { ...process.env, ANALYZEDIR: dir }, encoding: 'utf8', timeout: 120000,
    });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

function m23Line(out) {
  const line = out.split('\n').find((l) => l.includes('M23-capstone'));
  if (!line) throw new Error(`no M23-capstone line; output tail:\n${out.slice(-2000)}`);
  return line;
}

// ---- Pass B (mixed case): the fix under test ----
const dirB = path.join(SCRATCH, 'corpus-b');
copyCorpus(path.join(EVID, 'perseed-endgame-r198-b'), dirB);
const resB = runAnalyzer(dirB);
const lineB = m23Line(resB.out);
console.log('B: ' + lineB);
check('B: analyzer RC=0 (ALL GO after the fix)', resB.rc === 0, `rc=${resB.rc}`);
check('B: M23 GO (mixed case: one delivered, one exempt-undelivered)', /^GO/.test(lineB), lineB);
check('B: M23 names 89705 delivered feast_embassy@d68/FULL', /89705:feast_embassy@d68\/FULL/.test(lineB), lineB);
check('B: M23 names 89704 none (eligible, undelivered, all refusals exempt)', /89704:none/.test(lineB), lineB);
check('B: M23 counts delivered 1/2', /delivered 1\/2/.test(lineB), lineB);
check('B: M23 counts NON-EXEMPT-refused-despite-ready 0', /NON-EXEMPT-refused-despite-ready 0/.test(lineB), lineB);

// ---- Pass C (unchanged): still ALL GO ----
const dirC = path.join(SCRATCH, 'corpus-c');
copyCorpus(path.join(EVID, 'perseed-endgame-r198-c'), dirC);
const resC = runAnalyzer(dirC);
const lineC = m23Line(resC.out);
console.log('C: ' + lineC);
check('C: analyzer RC=0 (ALL GO, unchanged)', resC.rc === 0, `rc=${resC.rc}`);
check('C: M23 GO with delivered 2/2', /^GO/.test(lineC) && /delivered 2\/2/.test(lineC), lineC);

// ---- Pass A (unchanged): still ALL GO ----
const dirA = path.join(SCRATCH, 'corpus-a');
copyCorpus(path.join(EVID, 'perseed-endgame-r198'), dirA);
const resA = runAnalyzer(dirA);
console.log('A: ' + m23Line(resA.out));
check('A: analyzer RC=0 (ALL GO, unchanged)', resA.rc === 0, `rc=${resA.rc}`);

if (fail) { console.error(`test-m23-mixed-r203: ${fail} failure(s)`); process.exit(1); }
console.log('test-m23-mixed-r203: ALL PASS');
