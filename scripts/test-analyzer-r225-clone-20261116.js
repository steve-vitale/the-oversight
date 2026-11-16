#!/usr/bin/env node
// Proof: r225 analyzer clone fidelity (journey-endgame r225 2026-11-16).
// Runs the r225 analyzer (ANALYZEDIR) against the REAL r219 corpora,
// copied to temp dirs and renamed endgame-r219-*.json /
// endgame-r219-*-transcript.txt -> endgame-r225-* (the transcript
// header's run tag is re-pointed r219 -> r225, the only run-tagged line;
// the JSONs are byte-identical to r219). Asserts the r219 run note's
// M23b tallies on each pass, and that the r225 analyzer's stdout is
// byte-identical to the r219 analyzer's stdout on the same corpus
// (run-tag normalized r219 -> r225), with equal exit codes.
//
// (M23b) pass A: 0/5 gate-ok seeds (none).
// (M23b) pass C: 3/5 gate-ok seeds — 89702@d62/DELIVERED,
//   89704@d91/DELIVERED, 89705@d83/DELIVERED.
// (M23b) C-wide: 0/8 gate-ok seeds (none).
//
// If any check fails, the rename moved a verdict and the run must stop
// and investigate before trusting any r225 verdict.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER_NEW = path.join(__dirname, 'analyze-endgame-r225-20261116.js');
const ANALYZER_OLD = path.join(__dirname, 'analyze-endgame-r219-20261115.js');
const R219 = path.join(ROOT, 'evidence', '2026-11-15');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) failures++;
}

function buildFixture(passDir, tag) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'endgame-r225-' + tag + '-'));
  const src = path.join(R219, passDir);
  const files = fs.readdirSync(src).filter(f => /^endgame-r219-\d+\.json$/.test(f) || /^endgame-r219-\d+-transcript\.txt$/.test(f));
  for (const f of files) {
    const dst = f.replace(/^endgame-r219-/, 'endgame-r225-');
    let content = fs.readFileSync(path.join(src, f), 'utf8');
    if (f.endsWith('-transcript.txt')) {
      content = content.replace('# journey-endgame r219 —', '# journey-endgame r225 —');
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

const passes = [
  { dir: 'perseed-endgame-r219', tag: 'passa', expect: /M23b GATE-OK TALLY: 0\/5 seeds reached deedGateReady\(\)\.ok — none/ },
  { dir: 'perseed-endgame-r219-c', tag: 'passc', expect: /M23b GATE-OK TALLY: 3\/5 seeds reached deedGateReady\(\)\.ok — 89702@d62\/DELIVERED, 89704@d91\/DELIVERED, 89705@d83\/DELIVERED/ },
  { dir: 'perseed-endgame-r219-cwide', tag: 'cwide', expect: /M23b GATE-OK TALLY: 0\/8 seeds reached deedGateReady\(\)\.ok — none/ },
];

const tmpDirs = [];
for (const p of passes) {
  const fixture = buildFixture(p.dir, p.tag);
  tmpDirs.push(fixture);
  const outNew = runAnalyzer(ANALYZER_NEW, fixture);
  const outOld = runAnalyzer(ANALYZER_OLD, path.join(R219, p.dir));
  check(`clone ${p.tag}: M23b tally line present and exact`, p.expect.test(outNew.stdout), m23bLine(outNew.stdout));
  check(`clone ${p.tag}: exit codes equal (new=${outNew.status} old=${outOld.status})`, outNew.status === outOld.status, 'new stderr=' + (outNew.stderr || '').slice(0, 200) + ' old stderr=' + (outOld.stderr || '').slice(0, 200));
  const oldNormalized = outOld.stdout.replace(/r219/g, 'r225');
  check(`clone ${p.tag}: stdout byte-identical to r219 analyzer (run-tag normalized)`, outNew.stdout === oldNormalized,
    outNew.stdout === oldNormalized ? '' : 'first diff at char ' + (() => { for (let i = 0; i < Math.max(outNew.stdout.length, oldNormalized.length); i++) { if (outNew.stdout[i] !== oldNormalized[i]) return i; } return -1; })() +
      ' | new: ' + JSON.stringify(outNew.stdout.slice(0, 400)) + ' | old: ' + JSON.stringify(oldNormalized.slice(0, 400)));
}

// Temp dirs are scratch — clean them up.
for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });

console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
