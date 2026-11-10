// test-approachretest-20261109.js — verification proof for arm
// sim-approachretest-b (Loop B run fleshout-loop-b-20261110T0122Z).
//
// This arm ran NO judged sims: its brief (a 12-seed guardrail re-test
// of the combined approachfall variant on band 99601-99612, owed by
// sim-findings #1709) was already executed TWICE on that exact band,
// horizon, and variant — sim-approachguard-b (anchor e44da039d8c7) and
// sim-approachlive-b (anchor f4101562380d) — and a third run would
// violate the standing rule (no new measurement arm on an
// already-proven constraint without a new lever). This proof verifies,
// from the worktree on current master, that (a) the gated code still
// exists verbatim, (b) the variant file is the exact combined variant,
// (c) both prior corpora exist intact with a single anchor each, and
// (d) the guardrail + direct-counter numbers re-derive from the
// per-seed files to the published verdicts (both NO-GO).
//
// Run: node scripts/test-approachretest-20261109.js  (exit 0 = ALL PASS)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

const competent = fs.readFileSync(path.join(REPO, 'scripts/policies/competent.js'), 'utf8');
const variant = fs.readFileSync(path.join(REPO, 'scripts/policies/competent-approachfall-b.js'), 'utf8');

// (a) Gated code still exists on current master (worktree HEAD == main
// master, verified in evidence; the gate + counter symbols are the
// variant's contract with competent.js).
check('gate: approachFallbackOn defined', /function approachFallbackOn\(\)/.test(competent));
check('gate: COMPETENT_APPROACH_FALLBACK env read', competent.includes("process.env.COMPETENT_APPROACH_FALLBACK === '1'"));
check('gate: other three variant gates defined',
  /function dirFleeOn\(\)/.test(competent) && /function exitVerifiedFleeOn\(\)/.test(competent) && /function fleeRepairOn\(\)/.test(competent));
check('counters: approachFallbackMarks written', competent.includes('ctx.approachFallbackMarks'));
check('counters: approachFallbackWaits written', competent.includes('ctx.approachFallbackWaits'));
check('counters: approachRepickSteps written', competent.includes('ctx.approachRepickSteps'));
check('counters: approachStuckTurns written', competent.includes('ctx.approachStuckTurns'));
check('fallback: 3-stuck-turn mark threshold', /st\.turns >= 3/.test(competent));

// (b) Variant file is the exact combined variant from sim-approachfall-b.
check('variant: sets DIRECTIONAL_FLEE', variant.includes("process.env.COMPETENT_DIRECTIONAL_FLEE = '1'"));
check('variant: sets EXIT_VERIFIED_FLEE', variant.includes("process.env.COMPETENT_EXIT_VERIFIED_FLEE = '1'"));
check('variant: sets FLEE_REPAIR', variant.includes("process.env.COMPETENT_FLEE_REPAIR = '1'"));
check('variant: sets APPROACH_FALLBACK', variant.includes("process.env.COMPETENT_APPROACH_FALLBACK = '1'"));
check('variant: DPS_RACE not enabled', !/COMPETENT_DPS_RACE\s*=\s*'1'/.test(variant));
check('variant: requires ./competent verbatim', variant.includes("require('./competent')"));

// (c) Policy files unmodified vs HEAD (no silent substitution).
let diffClean = false;
try { execSync('git diff --quiet HEAD -- scripts/policies/competent.js scripts/policies/competent-approachfall-b.js', { cwd: REPO, stdio: 'ignore' }); diffClean = true; } catch (e) { diffClean = false; }
check('policy files unmodified vs HEAD', diffClean);

// (d) Re-derive both prior corpora from per-seed files.
function median(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function derive(dir, prefix) {
  const out = {};
  for (const run of ['baseline', 'armed']) {
    const files = fs.readdirSync(dir)
      .filter(function (f) { return f.startsWith(prefix + '-s') && f.endsWith('-' + run + '.json'); }).sort();
    let starv = 0, starvP = 0, days = [], anchors = {};
    let fb = { marks: 0, waits: 0, repicks: 0, fightsWithMarks: 0 };
    for (const f of files) {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      anchors[j.anchorCommit] = (anchors[j.anchorCommit] || 0) + 1;
      days.push(j.days);
      for (const d of (j.deaths || [])) {
        if (/starv/i.test(String((d && d.cause) || ''))) { starv++; if (d.player === true) starvP++; }
      }
      if (j.fallbackTotals) {
        fb.marks += j.fallbackTotals.marks || 0;
        fb.waits += j.fallbackTotals.waits || 0;
        fb.repicks += j.fallbackTotals.repicks || 0;
        fb.fightsWithMarks += j.fallbackTotals.fightsWithMarks || 0;
      }
    }
    out[run] = { files: files.length, starv: starv, starvP: starvP,
      medianDays: median(days), anchors: anchors, fallback: fb };
  }
  return out;
}
function verdict(r) {
  const b = r.baseline, a = r.armed;
  return (a.starv <= b.starv + 2) && (a.starvP <= b.starvP + 2) && (a.medianDays >= 0.8 * b.medianDays);
}

const guardDir = path.join(REPO, 'evidence/2026-11-04/perseed-approachguard-b');
const liveDir = path.join(REPO, 'evidence/2026-11-05/perseed-approachlive-b');
const guard = derive(guardDir, 'approachguard');
const live = derive(liveDir, 'approachlive');

check('guard corpus: 12 baseline + 12 armed files', guard.baseline.files === 12 && guard.armed.files === 12);
check('guard corpus: single anchor e44da039d8c7',
  Object.keys(guard.baseline.anchors).join() === 'e44da039d8c7' && Object.keys(guard.armed.anchors).join() === 'e44da039d8c7');
check('guard re-derived: baseline starv 1, starvP 0, median 111d',
  guard.baseline.starv === 1 && guard.baseline.starvP === 0 && guard.baseline.medianDays === 111,
  JSON.stringify(guard.baseline));
check('guard re-derived: armed starv 7, starvP 2, median 83d',
  guard.armed.starv === 7 && guard.armed.starvP === 2 && guard.armed.medianDays === 83,
  JSON.stringify(guard.armed));
check('guard verdict re-derived: NO-GO (totals 7 vs bar 3; median 83 vs 88.8)', verdict(guard) === false);

check('live corpus: 12 baseline + 12 armed files', live.baseline.files === 12 && live.armed.files === 12);
check('live corpus: single anchor f4101562380d',
  Object.keys(live.baseline.anchors).join() === 'f4101562380d' && Object.keys(live.armed.anchors).join() === 'f4101562380d');
check('live re-derived: baseline starv 1, starvP 0, median 108d',
  live.baseline.starv === 1 && live.baseline.starvP === 0 && live.baseline.medianDays === 108,
  JSON.stringify(live.baseline));
check('live re-derived: armed starv 6, starvP 2, median 83d',
  live.armed.starv === 6 && live.armed.starvP === 2 && live.armed.medianDays === 83,
  JSON.stringify(live.armed));
check('live verdict re-derived: NO-GO (totals 6 vs bar 3; median 83 vs 86.4)', verdict(live) === false);

// (e) #1708 direct-counter instrument: live firing totals from the
// approachlive corpus (armed leg only; baseline must read 0).
check('live direct counter: baseline marks 0', live.baseline.fallback.marks === 0);
check('live direct counter: armed marks 5, waits 0, repicks 3, fightsWithMarks 4',
  live.armed.fallback.marks === 5 && live.armed.fallback.waits === 0 &&
  live.armed.fallback.repicks === 3 && live.armed.fallback.fightsWithMarks === 4,
  JSON.stringify(live.armed.fallback));
const live99606 = JSON.parse(fs.readFileSync(path.join(liveDir, 'approachlive-s99606-armed.json'), 'utf8'));
const seq5 = (live99606.exposures || []).find(function (e) { return e.seq === 5; });
check('live firing case: 99606 seq 5 fallback marks 2, repicks 2',
  !!seq5 && seq5.fallback && seq5.fallback.marks === 2 && seq5.fallback.repicks === 2,
  seq5 ? JSON.stringify(seq5.fallback) : 'seq 5 missing');

console.log(fail === 0 ? 'ALL PASS (' + pass + '/' + pass + ')' : 'FAILURES: ' + fail + ' of ' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
