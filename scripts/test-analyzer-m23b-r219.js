#!/usr/bin/env node
// Proof: M23b GATE-OK TALLY (journey-endgame r219 2026-11-15).
// Runs the r219 analyzer (ANALYZEDIR) against the REAL r211 corpora,
// copied to temp dirs and renamed endgame-r219-*.json /
// endgame-r219-*-transcript.txt (the transcript header's run tag is
// re-pointed r211 -> r219, the only run-tagged line; the JSONs are
// byte-identical to r211). Asserts the r211-metric-review M23b tally,
// each on the pass where r211 exhibited it:
//
// (M23b) pass B: exactly 1 gate-ok seed (89703, d87 — the only seed
//   where deedGateFirstOkDay != null).
// (M23b) pass C: 0 gate-ok seeds.
// (M23b) C-wide: 0 gate-ok seeds (no seed reached deedGateReady ok).
//
// And that the tally changed NOTHING else: the r219 analyzer's stdout
// minus the M23b line must be byte-identical to the r211 analyzer's
// stdout on the same corpus (run-tag normalized r211 -> r219), with
// equal exit codes.
//
// RED (r211 analyzer): no M23b line at all (the tally does not exist).
// The byte-identity half has no red control — it guards the addition,
// not a defect; if it ever fails, the addition moved a verdict and the
// run must stop and investigate before trusting any r219 verdict.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER_NEW = path.join(__dirname, 'analyze-endgame-r219-20261115.js');
const ANALYZER_OLD = path.join(__dirname, 'analyze-endgame-r211-20261115.js');
const R211 = path.join(ROOT, 'evidence', '2026-11-15');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) failures++;
}

function buildFixture(passDir, tag) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'endgame-r219-' + tag + '-'));
  const src = path.join(R211, passDir);
  const files = fs.readdirSync(src).filter(f => /^endgame-r211-\d+\.json$/.test(f) || /^endgame-r211-\d+-transcript\.txt$/.test(f));
  for (const f of files) {
    const dst = f.replace(/^endgame-r211-/, 'endgame-r219-');
    let content = fs.readFileSync(path.join(src, f), 'utf8');
    if (f.endsWith('-transcript.txt')) {
      // The transcript header is the only run-tagged line; re-point it so
      // CORPUS-PURITY can parse the header (the JSONs stay byte-identical).
      content = content.replace('# journey-endgame r211 —', '# journey-endgame r219 —');
    }
    fs.writeFileSync(path.join(dir, dst), content);
  }
  return dir;
}

function runAnalyzer(analyzer, dir) {
  const r = spawnSync(process.execPath, [analyzer], {
    env: { ...process.env, ANALYZEDIR: dir },
    encoding: 'utf8',
    timeout: 120000,
  });
  return r;
}

function m23bLine(out) {
  const m = out.match(/M23b GATE-OK TALLY: .*/);
  return m ? m[0] : '(no M23b line)';
}

// Strip the M23b line (and its trailing newline) from new-analyzer output.
function stripM23b(out) {
  return out.split('\n').filter(l => !l.startsWith('M23b GATE-OK TALLY:')).join('\n');
}

const passes = [
  { dir: 'perseed-endgame-r211-b', tag: 'passb', expect: /M23b GATE-OK TALLY: 1\/5 seeds reached deedGateReady\(\)\.ok — 89703@d87/ },
  { dir: 'perseed-endgame-r211-c', tag: 'passc', expect: /M23b GATE-OK TALLY: 0\/5 seeds reached deedGateReady\(\)\.ok — none/ },
  { dir: 'perseed-endgame-r211-cwide', tag: 'cwide', expect: /M23b GATE-OK TALLY: 0\/8 seeds reached deedGateReady\(\)\.ok — none/ },
];

const tmpDirs = [];
for (const p of passes) {
  const fixture = buildFixture(p.dir, p.tag);
  tmpDirs.push(fixture);
  const outNew = runAnalyzer(ANALYZER_NEW, fixture);
  const outOld = runAnalyzer(ANALYZER_OLD, path.join(R211, p.dir));
  check(`M23b ${p.tag}: tally line present and exact`, p.expect.test(outNew.stdout), m23bLine(outNew.stdout));
  check(`M23b ${p.tag}: old analyzer has no M23b line (red control)`, !/M23b GATE-OK TALLY/.test(outOld.stdout), '(old analyzer output checked)');
  check(`M23b ${p.tag}: exit codes equal (new=${outNew.status} old=${outOld.status})`, outNew.status === outOld.status, 'new stderr=' + (outNew.stderr || '').slice(0, 200) + ' old stderr=' + (outOld.stderr || '').slice(0, 200));
  const newStripped = stripM23b(outNew.stdout);
  const oldNormalized = outOld.stdout.replace(/r211/g, 'r219');
  check(`M23b ${p.tag}: stdout byte-identical apart from the tally line`, newStripped === oldNormalized,
    newStripped === oldNormalized ? '' : 'first diff at char ' + (() => { for (let i = 0; i < Math.max(newStripped.length, oldNormalized.length); i++) { if (newStripped[i] !== oldNormalized[i]) return i; } return -1; })() +
      ' | new: ' + JSON.stringify(newStripped.slice(0, 400)) + ' | old: ' + JSON.stringify(oldNormalized.slice(0, 400)));
}

// Temp dirs are scratch — clean them up.
for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });

console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
