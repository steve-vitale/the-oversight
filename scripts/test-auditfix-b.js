#!/usr/bin/env node
// test-auditfix-b.js — proof test for sim-auditfix-b (findings #2246/#2247).
//
// The r185/r188 analyzer revisions under test:
//   M21: a sat seed with satSeatKind 'full' is exempt from the audit-line
//        parse and passes iff its satWaves meets the deed bars directly
//        (5/5/4/3/2 distinct fought per wave).
//   M23: only refusals-despite-ready count against the capstone rule;
//        honest none-ready attempts (no kind ready yet) do not fail it.
//
// Method: build synthetic corpora in os.tmpdir() from the real r182
// per-seed records (read-only inputs, deep-copied and mutated), run the
// r188 analyzer over each with ANALYZEDIR, and assert on the M21/M23
// verdict lines. No game eval, no randomness — deterministic.
//
// Legs:
//   1. full-seat-exempt: a constructed full seat (lesser record re-typed
//      to full with the numberless full-seat audit line) parses via the
//      satWaves deed-bar exemption -> M21 GO, FULL-EXEMPT.
//   2. none-ready-ok: two honest none-ready attempts prepended before a
//      successful delivery -> M23 GO, none-ready 2, refused-despite-ready 0.
//   3. refusal-despite-ready fails: the delivery replaced by a genuine
//      refusal (reason 'veterans-short') -> M23 NO-GO.
//   4. full-seat-below-bars fails: a full seat whose satWaves misses a
//      deed bar (w5 4 -> 1, bar is 2) -> M21 NO-GO, deedBars=false.
//
// Usage: node scripts/test-auditfix-b.js
// Exit 0 = all 4 legs pass, 1 = any leg fails.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(ROOT, 'scripts', 'analyze-endgame-r188-20261112.js');
const CORPUS_B = path.join(ROOT, 'evidence', '2026-11-11', 'perseed-endgame-r182-b');
const CORPUS_C = path.join(ROOT, 'evidence', '2026-11-11', 'perseed-endgame-r182-c');

let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

function loadCorpus(dir) {
  const recs = {};
  for (const f of fs.readdirSync(dir).filter(f => /^endgame-r182-\d+\.json$/.test(f)).sort()) {
    const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    recs[r.seed] = { record: r, transcript: path.join(dir, `endgame-r182-${r.seed}-transcript.txt`) };
  }
  return recs;
}

function writeCorpus(dir, recs) {
  fs.mkdirSync(dir, { recursive: true });
  for (const seed of Object.keys(recs)) {
    const { record, transcript } = recs[seed];
    fs.writeFileSync(path.join(dir, `endgame-r188-${seed}.json`), JSON.stringify(record, null, 1));
    if (transcript && fs.existsSync(transcript)) {
      fs.copyFileSync(transcript, path.join(dir, `endgame-r188-${seed}-transcript.txt`));
    }
  }
}

function runAnalyzer(dir) {
  try {
    return execFileSync('node', [ANALYZER], {
      env: { ...process.env, ANALYZEDIR: dir },
      encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '');
  }
}

function verdictLine(out, id) {
  const line = out.split('\n').find(l => l.includes(id + ':'));
  return line || '';
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'auditfix-b-test-'));
try {
  const baseB = loadCorpus(CORPUS_B);
  const baseC = loadCorpus(CORPUS_C);
  const fullAuditLine = baseB['89702'].record.auditLine;
  check('fixture full-seat audit line carries no numbers',
    !/waves 1–3 faced/.test(fullAuditLine) && /A full seat/.test(fullAuditLine),
    JSON.stringify(fullAuditLine.slice(0, 80)));

  // --- Leg 1: constructed full seat parses via the satWaves exemption.
  // 89704 is a lesser seat whose satWaves (23/11/8+5/1) miss only the w5
  // deed bar (2); re-type it to full with the numberless full-seat audit
  // line and a w5 that meets the bar, and it must pass via the exemption.
  {
    const recs = JSON.parse(JSON.stringify(baseB));
    recs['89704'].record.satSeatKind = 'full';
    recs['89704'].record.auditLine = fullAuditLine;
    recs['89704'].record.satWaves.w5 = 2;
    const dir = path.join(tmp, 'leg1');
    writeCorpus(dir, recs);
    const out = runAnalyzer(dir);
    const m21 = verdictLine(out, 'M21-audit-crosscheck');
    check('leg1 M21 GO on constructed full seat', /^GO/.test(m21), m21.slice(0, 200));
    check('leg1 89704 prints FULL-EXEMPT with deedBars=true',
      /89704:FULL-EXEMPT satWaves=\(23\/11\/8\)\+5\/2 deedBars\(5\/5\/4\/3\/2\)=true/.test(m21));
    check('leg1 no AUDIT-UNPARSED anywhere', !/AUDIT-UNPARSED/.test(m21));
  }

  // --- Leg 2: two honest none-ready attempts before a delivery do not fail M23.
  {
    const recs = JSON.parse(JSON.stringify(baseC));
    const c = recs['89702'].record.capstone;
    const noneReady = {
      day: 76, deedGateOk: true, readyKinds: [],
      readiness: [
        { kind: 'feast_embassy', ready: false, reason: 'no-bundle-feast', bundle: false, stage: 3 },
        { kind: 'trade_charter', ready: false, reason: 'no-sealed-charter', charteredLinks: 0 },
        { kind: 'military_tribute', ready: false, reason: 'veterans-short', veterans: 0, need: 2, payable: 0 },
      ],
      result: { ok: false, kind: null, reason: 'none-ready' },
    };
    const noneReady2 = JSON.parse(JSON.stringify(noneReady));
    noneReady2.day = 77;
    c.attempts = [noneReady, noneReady2, ...c.attempts];
    const dir = path.join(tmp, 'leg2');
    writeCorpus(dir, recs);
    const out = runAnalyzer(dir);
    const m23 = verdictLine(out, 'M23-capstone');
    check('leg2 M23 GO despite 2 none-ready attempts', /^GO/.test(m23), m23.slice(0, 200));
    check('leg2 note counts none-ready 2, refused-despite-ready 0',
      /none-ready 2, refused-despite-ready 0/.test(m23));
  }

  // --- Leg 3: a genuine refusal-despite-ready still fails M23.
  {
    const recs = JSON.parse(JSON.stringify(baseB));
    const c = recs['89702'].record.capstone;
    const del = c.attempts.find(a => a.result && a.result.ok);
    del.result = { ok: false, kind: null, reason: 'veterans-short' };
    c.delivery = null;
    const dir = path.join(tmp, 'leg3');
    writeCorpus(dir, recs);
    const out = runAnalyzer(dir);
    const m23 = verdictLine(out, 'M23-capstone');
    check('leg3 M23 NO-GO on genuine refusal-despite-ready', /^NO-GO/.test(m23), m23.slice(0, 200));
    check('leg3 note counts refused-despite-ready 1', /refused-despite-ready 1/.test(m23));
  }

  // --- Leg 4: a full seat below the deed bars still fails M21.
  {
    const recs = JSON.parse(JSON.stringify(baseB));
    recs['89702'].record.satWaves.w5 = 1; // bar is 2
    const dir = path.join(tmp, 'leg4');
    writeCorpus(dir, recs);
    const out = runAnalyzer(dir);
    const m21 = verdictLine(out, 'M21-audit-crosscheck');
    check('leg4 M21 NO-GO on full seat below deed bars', /^NO-GO/.test(m21), m21.slice(0, 200));
    check('leg4 89702 prints FULL-EXEMPT with deedBars=false',
      /89702:FULL-EXEMPT satWaves=\(24\/12\/8\)\+4\/1 deedBars\(5\/5\/4\/3\/2\)=false/.test(m21));
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(failures === 0 ? 'test-auditfix-b: 4/4 legs PASS' : `test-auditfix-b: ${failures} leg(s) FAILED`);
process.exit(failures === 0 ? 0 : 1);
