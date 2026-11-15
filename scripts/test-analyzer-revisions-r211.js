#!/usr/bin/env node
// Proof: analyzer revisions (journey-endgame r211 2026-11-15).
// Runs the r211 analyzer (ANALYZEDIR) against the REAL r203 corpora,
// copied to temp dirs and renamed endgame-r211-*.json /
// endgame-r211-*-transcript.txt (the transcript header's run tag is
// re-pointed r203 -> r211, the only run-tagged line; the JSONs are
// byte-identical to r203). Asserts the three r203-metric-review
// revisions, each on the pass where r203 exhibited it:
//
// (R1) pass B: the ONLY failing binding is M23 VACUOUS, so the headline
//   must read VACUOUS-UNANSWERED (r203 printed NO-GO). Exit code still
//   follows ALL (1 — a vacuous question is still unanswered).
// (R2) C-wide: the fresh band has no forcedrift control seed, so M5 must
//   print GO with a VACUOUS note (r203 printed NO-GO) — while the
//   headline stays NO-GO because M3b-peak fails for REAL, proving the
//   headline discriminates vacuous from failed.
// (R3) pass C: the ROAD-TALLY must distinguish full seats EARNED from
//   SAT — r203 pass C earned 3, sat 2, earned-not-sat 89704@d70.
//
// RED (r203 analyzer): pass B prints PRIMARY-BINDINGS NO-GO; C-wide
// prints NO-GO M5-voicing-canonical: no forcedrift control seed; pass C
// prints no ROAD-TALLY earned/sat line.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-endgame-r211-20261115.js');
const R203 = path.join(ROOT, 'evidence', '2026-11-14');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) failures++;
}

function buildFixture(passDir, tag) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'endgame-r211-' + tag + '-'));
  const src = path.join(R203, passDir);
  const files = fs.readdirSync(src).filter(f => /^endgame-r203-\d+\.json$/.test(f) || /^endgame-r203-\d+-transcript\.txt$/.test(f));
  for (const f of files) {
    const dst = f.replace(/^endgame-r203-/, 'endgame-r211-');
    let content = fs.readFileSync(path.join(src, f), 'utf8');
    if (f.endsWith('-transcript.txt')) {
      // The transcript header is the only run-tagged line; re-point it so
      // CORPUS-PURITY can parse the header (the JSONs stay byte-identical).
      content = content.replace('# journey-endgame r203 —', '# journey-endgame r211 —');
    }
    fs.writeFileSync(path.join(dir, dst), content);
  }
  return dir;
}

function runAnalyzer(dir) {
  const r = spawnSync(process.execPath, [ANALYZER], {
    env: { ...process.env, ANALYZEDIR: dir },
    encoding: 'utf8',
    timeout: 120000,
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

const dirB = buildFixture('perseed-endgame-r203-b', 'passb');
const outB = runAnalyzer(dirB);
check('R1 pass B: headline VACUOUS-UNANSWERED (not NO-GO)',
  /PRIMARY-BINDINGS VACUOUS-UNANSWERED/.test(outB.stdout),
  (outB.stdout.match(/PRIMARY-BINDINGS.*/) || ['(no headline)'])[0]);
check('R1 pass B: M23 line carries the VACUOUS note',
  /NO-GO M23-capstone: VACUOUS/.test(outB.stdout),
  (outB.stdout.match(/M23-capstone.*/) || ['(no M23 line)'])[0].slice(0, 160));
check('R1 pass B: exit code still follows ALL (1, not 0)',
  outB.status === 1, 'status=' + outB.status + ' stderr=' + outB.stderr.slice(0, 120));

const dirW = buildFixture('perseed-endgame-r203-cwide', 'cwide');
const outW = runAnalyzer(dirW);
check('R2 C-wide: M5 prints GO with a VACUOUS note (no control seed)',
  /GO\s+M5-voicing-canonical: VACUOUS: no forcedrift control seed/.test(outW.stdout),
  (outW.stdout.match(/M5-voicing-canonical.*/) || ['(no M5 line)'])[0].slice(0, 160));
check('R2 C-wide: headline stays NO-GO — M3b-peak fails for real',
  /PRIMARY-BINDINGS NO-GO/.test(outW.stdout) && /NO-GO M3b-peak/.test(outW.stdout),
  (outW.stdout.match(/PRIMARY-BINDINGS.*/) || ['(no headline)'])[0]);
check('R2 C-wide: exit code 1', outW.status === 1, 'status=' + outW.status);

const dirC = buildFixture('perseed-endgame-r203-c', 'passc');
const outC = runAnalyzer(dirC);
check('R3 pass C: ROAD-TALLY earned 3 sat 2',
  /ROAD-TALLY full-seats earned 3 sat 2/.test(outC.stdout),
  (outC.stdout.match(/ROAD-TALLY.*/) || ['(no ROAD-TALLY line)'])[0]);
check('R3 pass C: earned-not-sat names 89704@d70',
  /earned-not-sat: 89704@d70/.test(outC.stdout),
  (outC.stdout.match(/ROAD-TALLY.*/) || ['(no ROAD-TALLY line)'])[0]);
check('R3 pass C: exit code 0 (r203 pass C was ALL GO)',
  outC.status === 0, 'status=' + outC.status + ' stderr=' + outC.stderr.slice(0, 200));

// Temp dirs are scratch — clean them up.
for (const d of [dirB, dirW, dirC]) fs.rmSync(d, { recursive: true, force: true });

console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
