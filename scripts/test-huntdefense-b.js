#!/usr/bin/env node
// test-huntdefense-b.js — proof test for scripts/analyze-huntdefense-b.js (diagnostic, read-only).
// RED/GREEN: the analyzer must be deterministic (byte-identical re-run), read-only
// (corpus checksums unchanged), and its invariants must hold against the landed corpus.
// No sims, no src/js changes, no writes outside the two temp outputs.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-huntdefense-b.js');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-huntstaff-b2');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

function sha1(p) { return crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex'); }

function main() {
  // READ-ONLY gate: checksum the whole corpus before running.
  const files = fs.readdirSync(CORPUS).filter(f => f.endsWith('.json')).sort();
  const before = files.map(f => sha1(path.join(CORPUS, f)).slice(0, 12)).join(',');
  check('corpus has 32 per-seed files', files.length === 32, 'got ' + files.length);

  // Each invocation owns its outputs; concurrent agents must not overwrite
  // the same /tmp files while comparing determinism or corpus integrity.
  const temp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'oversight-huntdefense-'));
  const out1 = path.join(temp, 'proof-1.json');
  const out2 = path.join(temp, 'proof-2.json');
  execFileSync('node', [ANALYZER, out1], { cwd: ROOT });
  execFileSync('node', [ANALYZER, out2], { cwd: ROOT });
  const b1 = fs.readFileSync(out1, 'utf8');
  const b2 = fs.readFileSync(out2, 'utf8');
  check('determinism: byte-identical re-run', b1 === b2,
    'len ' + b1.length + ' vs ' + b2.length);

  const after = files.map(f => sha1(path.join(CORPUS, f)).slice(0, 12)).join(',');
  check('read-only: corpus checksums unchanged', before === after);

  const r = JSON.parse(b1);

  // Invariants against the landed b2 evidence (raw sweep-counter view).
  check('16 seed x policy pairs', r.pairRows.length === 16, 'got ' + r.pairRows.length);
  check('raw totals match landed b2 evidence (615/564)',
    r.duplication.rawTotals.armed === 615 && r.duplication.rawTotals.control === 564,
    JSON.stringify(r.duplication.rawTotals));
  check('dedup only removes records',
    r.duplication.dedupTotals.armed <= 615 && r.duplication.dedupTotals.control <= 564 &&
    r.duplication.dupExtraRecords.armed === 615 - r.duplication.dedupTotals.armed &&
    r.duplication.dupExtraRecords.control === 564 - r.duplication.dedupTotals.control);
  const d = r.duplication.dedupTotals;
  check('deduped delta arithmetic', d.delta === d.armed - d.control, d.delta + ' vs ' + (d.armed - d.control));

  // Primary metric arithmetic: share = attributed / deduped extra deaths (honest count).
  const p = r.primary;
  check('primary share arithmetic',
    Math.abs(p.attributedShare - p.attributedDeaths / p.denominatorDeduped) < 1e-3,
    p.attributedShare + ' vs ' + (p.attributedDeaths / p.denominatorDeduped));

  // Noise reference: 16 independent b-pilot paired deltas.
  check('pilot noise band has 16 deltas', r.noise.pilotDeltasSorted.length === 16);
  check('pilot band sd ~12.9 (documented combat-noise band)',
    Math.abs(r.noise.pilotSd - 12.87) < 0.05, 'sd=' + r.noise.pilotSd);

  // Verdict class is one of the three pre-registered classes, judged in order.
  const classes = ['DEFENSE-HARM', 'NOISE', 'UNRESOLVED-BUT-SCOPED'];
  check('verdict is a pre-registered class', classes.includes(r.verdict), r.verdict);
  if (r.verdict === 'DEFENSE-HARM') {
    check('DEFENSE-HARM requires share >= 0.80', p.attributedShare >= 0.80);
  } else {
    check('non-HARM verdict requires share < 0.80', p.attributedShare < 0.80,
      'share=' + p.attributedShare);
  }

  // Hunter-fate recheck: instrument claims 0 hunt-attributable among 151 assignments.
  check('151 assignment records, 0 hunt-attributable',
    r.hunterFateRecheck.assignedHunterDeathRecords === 151 &&
    r.hunterFateRecheck.huntAttributable === 0,
    JSON.stringify(r.hunterFateRecheck));

  // Raid telemetry absence is declared, not silently skipped.
  check('raid-outcome gap declared',
    /NOT MEASURABLE/.test(r.raidOutcomes), r.raidOutcomes.slice(0, 60));

  fs.unlinkSync(out1); fs.unlinkSync(out2); fs.rmdirSync(temp);

  console.log(failures === 0 ? '\nALL GREEN' : '\n' + failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main();
