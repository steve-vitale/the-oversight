#!/usr/bin/env node
// test-corpus-purity-r194.js — r194 §CORPUS-PURITY proof.
// Builds two synthetic corpora in /tmp from the r188 pass-A corpus
// (evidence/2026-11-12/perseed-endgame-r188/, seeds 89702+89703 —
// the two pass-A seeds whose JSONs are intact; 89701's pass-A files
// were overwritten with pass-C data after the r188 analyzer ran, see
// the r194 run note §r188-corpus-corruption, so 89701 is NOT used
// here). Files are renamed to r194 + transcript headers rewritten to
// the r194 format; the clean corpus additionally carries ONE injected
// honest buyout attempt (pantryAfter == pantry - spent) so the
// pantryAfter rule is exercised both ways:
//   clean: projections intact — analyzer must print GO CORPUS-PURITY.
//   dirty: same + the injected attempt corrupted to the stale-read echo
//     (pantryAfter == pantry) + one broken ladder projection
//     (transcript counted=999 vs JSON) + one stray diagnostic file —
//     analyzer must print NO-GO CORPUS-PURITY naming all three defects.
// The r194 analyzer scores the r188 corpus for the OTHER verdicts too
// (M2c falls back to the legacy call count) — this test greps ONLY the
// CORPUS-PURITY line, never the exit code. Reads the r188 corpus
// read-only; writes scratch only under /tmp/purity-r194-*.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ANALYZER = path.join(__dirname, 'analyze-endgame-r194-20261113.js');
const SRC = path.join(__dirname, '..', 'evidence', '2026-11-12', 'perseed-endgame-r188');
const SEEDS = [89702, 89703];

// One honest buyout attempt, injected into 89702's JSON so the
// pantryAfter rule (pantryAfter == pantryKcal - spent) is exercised.
const HONEST_ATTEMPT = {
  day: 41, early: true, atHaven: true, pantryKcal: 10000,
  result: { ok: true, why: null, spent: 8000, bundleStage: 1, pantryAfter: 2000, pantryAfterRead: 10000 },
};

function build(dir, dirty) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const seed of SEEDS) {
    const j = JSON.parse(fs.readFileSync(path.join(SRC, `endgame-r188-${seed}.json`), 'utf8'));
    if (seed === 89702) {
      const att = JSON.parse(JSON.stringify(HONEST_ATTEMPT));
      if (dirty) att.result.pantryAfter = 10000; // the stale-read echo
      j.buyout.attempts.push(att);
    }
    fs.writeFileSync(path.join(dir, `endgame-r194-${seed}.json`), JSON.stringify(j, null, 1));
    let t = fs.readFileSync(path.join(SRC, `endgame-r188-${seed}-transcript.txt`), 'utf8');
    // Rewrite the header to the r194 format (same values, new pin field).
    t = t.replace(
      new RegExp(`# journey-endgame r188 — seed ${seed}, announced`),
      `# journey-endgame r194 — seed ${seed}, competentPin live, announced`,
    );
    if (dirty && seed === 89703) t = t.replace(/(# ladder peak=\d+ stage=\d+ counted=)\d+/, '$1999');
    fs.writeFileSync(path.join(dir, `endgame-r194-${seed}-transcript.txt`), t);
  }
  if (dirty) fs.writeFileSync(path.join(dir, 'probe-diag-stray.json'), '{"stray":true}\n');
}

function purityLine(dir) {
  let out = '';
  try {
    out = execFileSync(process.execPath, [ANALYZER], {
      env: { ...process.env, ANALYZEDIR: dir }, encoding: 'utf8', timeout: 120000,
    });
  } catch (e) {
    // The analyzer exits 1 on other verdicts (expected on an r188-based
    // corpus) — its stdout still holds the CORPUS-PURITY line.
    out = (e.stdout || '') + (e.stderr || '');
  }
  const line = out.split('\n').find((l) => l.includes('CORPUS-PURITY'));
  if (!line) throw new Error(`no CORPUS-PURITY line for ${dir}; output tail:\n${out.slice(-2000)}`);
  return line;
}

let fail = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fail++;
}

const cleanDir = '/tmp/purity-r194-clean';
const dirtyDir = '/tmp/purity-r194-dirty';
build(cleanDir, false);
build(dirtyDir, true);

const clean = purityLine(cleanDir);
console.log('clean: ' + clean);
check('clean corpus: CORPUS-PURITY GO', /^GO/.test(clean), clean);

const dirty = purityLine(dirtyDir);
console.log('dirty: ' + dirty);
check('dirty corpus: CORPUS-PURITY NO-GO', /^NO-GO/.test(dirty), dirty);
check('dirty note names the pantryAfter echo', /pantryAfter=10000 != pantry-spent=2000/.test(dirty), dirty);
check('dirty note names the stray file', /unexpected files/.test(dirty) && /probe-diag-stray\.json/.test(dirty), dirty);
check('dirty note names the ladder mismatch', /ladder counted/.test(dirty), dirty);

if (fail) { console.error(`test-corpus-purity-r194: ${fail} failure(s)`); process.exit(1); }
console.log('test-corpus-purity-r194: ALL PASS');
