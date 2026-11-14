#!/usr/bin/env node
// test-m23-revision-r198.js — r198 §M23-REV + §NO-OVER-ATTEMPT + §REFUSAL-WINDOW proof.
// Part 1 (smoke): runs the r198 probe in smoke mode on the r194 89704
// pass-B shape (SEEDS=89704, CAPSTONE=1 BUYOUT=1) and asserts the
// probe fixes: zero 'over' attempts (the guard), one
// capstoneRefusalVoicing entry per refused-despite-ready attempt, a
// non-null firstRefusalCapIdx when a refusal exists, and a transcript
// that starts at the first refusal day (header names it) when the
// refusal precedes announce. Days are NOT asserted — the shape, not
// the day, is the proof (the trajectory may shift on the new
// substrate; r194's d87-d89 shape is the fixture, not the bar).
// Part 2 (analyzer synthetics): the r198 analyzer scores three
// corpora built from the real r194 pass-B/C JSONs (read-only):
//   V (vacuous): r194 pass-B as-is — 89704 scholar+1 only eligible,
//     all refusals exempt, no delivery → M23 NO-GO with a VACUOUS note.
//   G (go): r194 pass-C as-is — 89704 + 89705 delivered and priced
//     full, zero non-exempt refusals → M23 GO.
//   N (non-exempt): r194 pass-B with 89704's first attempt mutated so
//     the 'veterans-short' refusal is NOT scholar+1 (payable=2) →
//     M23 NO-GO naming a NON-EXEMPT refusal.
// Only the M23 line is grepped (like test-corpus-purity-r198); the
// analyzer exits 1 on other verdicts. Writes only under /tmp/m23-r198-*.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROBE = path.join(__dirname, 'probe-endgame-r198-20261114.js');
const ANALYZER = path.join(__dirname, 'analyze-endgame-r198-20261114.js');
const SCRATCH = '/tmp/m23-r198';
fs.mkdirSync(SCRATCH, { recursive: true });

let fail = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fail++;
}

// ---- Part 1: smoke run on the 89704 pass-B shape ----
const SMOKE_DIR = path.join(SCRATCH, 'smoke-b-89704');
fs.mkdirSync(SMOKE_DIR, { recursive: true });
const smokeEnv = {
  FULLSEAT: '1', VETCOMMIT: '1', CAPABLE_GREEDY: '1',
  ARMORYDRIVE: '1', CAPABLE_VETGUARD: '1', SMOKE: '1',
  CAPSTONE: '1', BUYOUT: '1', RELAYGREY: '1', TELEMETRY_FULL: '1',
  SEEDS: '89704', EVIDDIR: SMOKE_DIR,
};
const smokeOut = execFileSync(process.execPath, [PROBE], {
  env: { ...process.env, ...smokeEnv },
  encoding: 'utf8', timeout: 0, maxBuffer: 64 * 1024 * 1024,
});
console.log('smoke: ' + (smokeOut.split('\n').find((l) => l.startsWith('SMOKE ')) || '').slice(0, 200));
const jPath = path.join(SMOKE_DIR, 'endgame-r198-89704.json');
const tPath = path.join(SMOKE_DIR, 'endgame-r198-89704-transcript.txt');
check('smoke wrote the per-seed JSON', fs.existsSync(jPath));
check('smoke wrote the transcript', fs.existsSync(tPath));
const j = JSON.parse(fs.readFileSync(jPath, 'utf8'));
const c = j.capstone || {};
const att = Array.isArray(c.attempts) ? c.attempts : [];
const overAttempts = att.filter((a) => a.result && a.result.reason === 'over');
check('zero over attempts (guard held)', overAttempts.length === 0, `over=${overAttempts.length} of ${att.length} attempts`);
const refused = att.filter((a) => a.result && !a.result.ok && a.result.reason !== 'none-ready');
const voicing = Array.isArray(c.refusalVoicing) ? c.refusalVoicing : null;
check('capstone.refusalVoicing is an array', voicing !== null);
check('one voicing entry per refused-despite-ready attempt',
  voicing !== null && voicing.length === refused.length,
  `voicing=${voicing ? voicing.length : 'null'} refused=${refused.length}`);
check('every voicing entry names its day + reason + lines array',
  voicing !== null && voicing.every((v) => typeof v.day === 'number' && typeof v.reason === 'string' && Array.isArray(v.lines)),
  voicing ? JSON.stringify(voicing.map((v) => ({ day: v.day, reason: v.reason, lines: v.lines.length }))) : 'null');
if (refused.length > 0) {
  check('firstRefusalCapIdx is set', c.firstRefusalCapIdx != null, `firstRefusalCapIdx=${c.firstRefusalCapIdx}`);
  const t = fs.readFileSync(tPath, 'utf8');
  const firstDay = voicing[0].day;
  check('transcript header names the first refusal day', t.includes(`# first capstone refusal d${firstDay}:`), `first refusal d${firstDay}`);
  if (firstDay < j.announceDay) {
    check('transcript window starts at the first refusal day', t.includes('# window: the first refusal day'), `refusal d${firstDay} < announce d${j.announceDay}`);
  } else {
    console.log(`NOTE refusal d${firstDay} is not before announce d${j.announceDay} — window starts at announce (no widening to prove)`);
  }
} else {
  check('no refusals: firstRefusalCapIdx is null', c.firstRefusalCapIdx == null, `firstRefusalCapIdx=${c.firstRefusalCapIdx}`);
  console.log('NOTE no refused-despite-ready attempt on this substrate — the window half is vacuous here (the guard half still proved)');
}

// ---- Part 2: analyzer synthetics from the real r194 corpora ----
const SRC_B = path.join(__dirname, '..', 'evidence', '2026-11-13', 'perseed-endgame-r194-b');
const SRC_C = path.join(__dirname, '..', 'evidence', '2026-11-13', 'perseed-endgame-r194-c');

function buildCorpus(dir, src, mutate) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const m = /^endgame-r194-(\d+)(\.json|-transcript\.txt)$/.exec(f);
    if (!m) continue;
    const seed = m[1];
    const dst = path.join(dir, `endgame-r198-${seed}${m[2]}`);
    if (m[2] === '.json') {
      const jj = JSON.parse(fs.readFileSync(path.join(src, f), 'utf8'));
      if (mutate) mutate(seed, jj);
      fs.writeFileSync(dst, JSON.stringify(jj, null, 1));
    } else {
      fs.copyFileSync(path.join(src, f), dst);
    }
  }
}

function m23Line(dir) {
  let out = '';
  try {
    out = execFileSync(process.execPath, [ANALYZER], {
      env: { ...process.env, ANALYZEDIR: dir }, encoding: 'utf8', timeout: 120000,
    });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
  }
  const line = out.split('\n').find((l) => l.includes('M23-capstone'));
  if (!line) throw new Error(`no M23-capstone line for ${dir}; output tail:\n${out.slice(-2000)}`);
  return line;
}

const dirV = path.join(SCRATCH, 'corpus-vacuous');
buildCorpus(dirV, SRC_B, null);
const lineV = m23Line(dirV);
console.log('V (r194 pass-B): ' + lineV);
check('V: M23 NO-GO with VACUOUS note (scholar+1 only, all refusals exempt)', /^NO-GO/.test(lineV) && /VACUOUS/.test(lineV), lineV);
check('V: M24b still GO on the same corpus', (() => {
  let out = '';
  try { out = execFileSync(process.execPath, [ANALYZER], { env: { ...process.env, ANALYZEDIR: dirV }, encoding: 'utf8', timeout: 120000 }); } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  const l = out.split('\n').find((x) => x.includes('M24b-scholar-plus-one'));
  return l && /^GO/.test(l);
})(), 'M24b carries the scholar+1 verdict');

const dirG = path.join(SCRATCH, 'corpus-go');
buildCorpus(dirG, SRC_C, null);
const lineG = m23Line(dirG);
console.log('G (r194 pass-C): ' + lineG);
check('G: M23 GO (deliveries priced full, zero non-exempt refusals)', /^GO/.test(lineG), lineG);

const dirN = path.join(SCRATCH, 'corpus-nonexempt');
buildCorpus(dirN, SRC_B, (seed, jj) => {
  if (seed !== '89704') return;
  // Make the first veterans-short refusal NOT scholar+1: payable meets
  // need, so the readiness/delivery split cannot excuse it.
  const a = (jj.capstone.attempts || [])[0];
  if (!a) return;
  const t = (a.readiness || []).find((x) => x.kind === 'military_tribute');
  if (t) t.payable = 2;
});
const lineN = m23Line(dirN);
console.log('N (mutated pass-B): ' + lineN);
check('N: M23 NO-GO naming a NON-EXEMPT refusal', /^NO-GO/.test(lineN) && /NON-EXEMPT/.test(lineN), lineN);

if (fail) { console.error(`test-m23-revision-r198: ${fail} failure(s)`); process.exit(1); }
console.log('test-m23-revision-r198: ALL PASS');
