// Proof test for the r135 analyzer PRIMARY-BINDINGS fix (journey-endgame
// r135 blank, from the r131 metric-review proposal). Presentation-only
// claim: on the r131 corpus, the fixed analyzer must produce
//   (a) per-id verdict lines BYTE-IDENTICAL to the baseline r131 analyzer,
//   (b) PRIMARY and ALL unchanged (NO-GO / NO-GO on this corpus),
//   (c) PRIMARY-BINDINGS GO, with the only NO-GO verdict ids being the
//       tally ids (M4-wave5-or-full, W5-question; M3-conversion is a
//       tally verdict that was never in primaryIds).
// Runs both analyzers as subprocesses against the committed r131 corpus.
// Temp copies live in os.tmpdir(); nothing is written into the repo.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const baseline = path.join(root, 'scripts', 'analyze-endgame-r131-20261104.js');
const fixed = path.join(root, 'scripts', 'analyze-endgame-r135-20261104.js');
for (const f of [baseline, fixed]) {
  if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
}
const corpus = path.join(root, 'evidence', '2026-11-04', 'perseed-endgame-r131');
if (!fs.existsSync(corpus)) { console.error('MISSING corpus ' + corpus); process.exit(2); }

function run(file) {
  try {
    return execFileSync('node', [file], { encoding: 'utf8', timeout: 120000 });
  } catch (e) {
    // The analyzer exits 1 when ALL is NO-GO; that output is still the verdict.
    if (e.status === 1 && e.stdout) return e.stdout;
    throw e;
  }
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'primary-bindings-'));
// The analyzer resolves its corpus relative to __dirname, so the temp
// copy must sit in a mirrored <tmp>/scripts/ layout with <tmp>/evidence
// symlinked at the real evidence tree (symlink in /tmp only; the repo
// is never written by this test).
fs.mkdirSync(path.join(tmp, 'scripts'));
fs.symlinkSync(path.join(root, 'evidence'), path.join(tmp, 'evidence'));
const fixedOnR131 = path.join(tmp, 'scripts', 'analyze-fixed-on-r131.js');
// Corpus addressing in the analyzer is BOTH the directory name and the
// per-seed filename prefix (endgame-r135-*.json); swap both so the fixed
// copy reads the r131 corpus. Only addressing changes — the verdict
// logic under test is untouched.
fs.writeFileSync(fixedOnR131,
  fs.readFileSync(fixed, 'utf8')
    .replace(/perseed-endgame-r135/g, 'perseed-endgame-r131')
    .replace(/endgame-r135-/g, 'endgame-r131-'));

const baseOut = run(baseline);
const fixedOut = run(fixedOnR131);
const verdictLines = (out) => out.split('\n').filter(l => /^(GO|NO-GO) /.test(l));
const baseVerdicts = verdictLines(baseOut);
const fixedVerdicts = verdictLines(fixedOut);
const failures = [];
if (JSON.stringify(baseVerdicts) !== JSON.stringify(fixedVerdicts)) {
  failures.push('per-id verdict lines differ between baseline and fixed analyzer');
}
const baseFinal = baseOut.trim().split('\n').pop();
const fixedFinal = fixedOut.trim().split('\n').pop();
if (baseFinal !== 'PRIMARY NO-GO | ALL NO-GO') failures.push('unexpected baseline final: ' + baseFinal);
if (fixedFinal !== 'PRIMARY-BINDINGS GO | PRIMARY NO-GO | ALL NO-GO') failures.push('unexpected fixed final: ' + fixedFinal);
const noGoIds = baseVerdicts.filter(l => l.startsWith('NO-GO ')).map(l => l.split(' ')[1].replace(/:$/, ''));
const tally = ['M3-conversion', 'M4-wave5-or-full', 'W5-question'];
if (JSON.stringify([...noGoIds].sort()) !== JSON.stringify([...tally].sort())) {
  failures.push('NO-GO ids are not exactly the tally ids: ' + noGoIds.join(','));
}
if (failures.length) { for (const f of failures) console.error('FAIL ' + f); process.exit(1); }
console.log('PASS primary-bindings: ' + baseVerdicts.length + ' verdict lines identical; ' +
  'baseline final [' + baseFinal + ']; fixed final [' + fixedFinal + ']; ' +
  'NO-GO ids = tally ids only (' + noGoIds.join(',') + ')');
