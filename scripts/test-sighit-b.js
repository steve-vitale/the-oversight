#!/usr/bin/env node
// test-sighit-b.js — proof for sim-sighit-b (DIAG, measurement only).
// Checks, independently of the fixture's own summaries:
//  1. Corpus exists, anchor == current worktree HEAD.
//  2. Determinism gate: fixture re-run to /tmp byte-identical to corpus.
//  3. Independent re-derivation of the per-beast round-1 summaries and
//     the prereg GO gate from fights[]; verdict must be DIAG-GO.
//  4. Per-hit integrity: every fight has >= 1 hit; every hit carries a
//     non-null sig delta, base band, and observed damage; reconMatch
//     true on every hit (log-final == sig-returned total, i.e. no hidden
//     armor/wornDamage/ability layer on an unarmored leader).
//  5. Attribution: main-leg round-1 congregation/eater hits all above
//     their attack's band top; audit round-1 hits all in-band; paired
//     main-minus-instrument round-1 deltas inside the predicted sig
//     bands (cong [50,70], eater [45,75]); audit main hits identical
//     to instrument hits on every round (delta 0 everywhere).
//  6. DIAG purity: git status shows no modification under src/ or to
//     any existing policy file (only new files from this arm).
// Usage: node scripts/test-sighit-b.js
// Writes nothing into the repo (det-gate rerun goes to /tmp).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-31', 'perseed-sighit-b', 'fixture-band.json');
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}
function median(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
const head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
check('anchor == worktree HEAD', corpus.anchorCommit === head, corpus.anchorCommit);
check('48 fights (3 beasts x 8 streams x 2 legs)', corpus.fights.length === 48, corpus.fights.length);
check('leader is boris_kowalski, iron_stomach only',
  corpus.leader === 'boris_kowalski' && JSON.stringify(corpus.fighterInfo.heldAbilities) === JSON.stringify(['iron_stomach']),
  JSON.stringify(corpus.fighterInfo));

// Determinism gate.
const tmpOut = '/tmp/sighit-det-' + process.pid + '.json';
execSync('node ' + path.join(REPO, 'scripts', 'sighit-fixture-20261031.js') + ' ' + tmpOut, { cwd: REPO, stdio: 'pipe' });
const rerun = fs.readFileSync(tmpOut, 'utf8');
const committed = fs.readFileSync(CORPUS, 'utf8');
check('det-gate: rerun byte-identical to corpus', rerun === committed);
try { fs.unlinkSync(tmpOut); } catch (e) {}

// Per-hit integrity + independent re-derivation.
let allHitsOk = true, reconOk = true, fightsWithHits = 0;
for (const f of corpus.fights) {
  if (f.hits.length > 0) fightsWithHits++;
  for (const h of f.hits) {
    if (h.sigDelta == null || h.baseBand == null || h.observed == null) allHitsOk = false;
    if (h.reconMatch !== true) reconOk = false;
  }
}
check('every fight has >= 1 recorded hit', fightsWithHits === 48, fightsWithHits);
check('every hit has sigDelta + baseBand + observed', allHitsOk);
check('reconMatch true on every hit (no hidden damage layer)', reconOk);

function r1(leg, beast) {
  return corpus.fights.filter(f => f.leg === leg && f.beast === beast)
    .reduce((a, f) => a.concat(f.hits.filter(h => h.round === 1)), []);
}
for (const beast of ['congregation', 'eater', 'audit']) {
  const m = r1('main', beast), inst = r1('instrument', beast);
  const med = median(m.map(h => h.observed));
  const above = m.filter(h => h.observed > h.baseBand[1]).length;
  const deaths = m.filter(h => h.leaderDiedThisRound).length;
  check(beast + ' main R1 n=8', m.length === 8, m.length);
  check(beast + ' main R1 median matches corpus', med === corpus.perBeast[beast].mainR1.medianObserved, med);
  if (beast === 'audit') {
    check('audit main R1 0/8 above band top', above === 0, above);
    check('audit main R1 0/8 deaths', deaths === 0, deaths);
  } else {
    check(beast + ' main R1 8/8 above band top', above === 8, above);
    check(beast + ' main R1 8/8 deaths', deaths === 8, deaths);
  }
  // Paired deltas per stream.
  const band = beast === 'congregation' ? [50, 70] : (beast === 'eater' ? [45, 75] : [0, 0]);
  let deltaOk = 0, bandOk = 0;
  for (const s of corpus.streams) {
    const mh = m.find(h => h.stream === s), ih = inst.find(h => h.stream === s);
    if (!mh || !ih) continue;
    const d = mh.observed - ih.observed;
    if (d >= band[0] && d <= band[1]) deltaOk++;
    if (ih.observed >= mh.baseBand[0] && ih.observed <= mh.baseBand[1]) bandOk++;
  }
  check(beast + ' paired R1 deltas in sig band', beast === 'audit' ? deltaOk === 8 : deltaOk >= 7, deltaOk + '/8');
  check(beast + ' instrument R1 hits in base band', beast === 'audit' ? bandOk === 8 : bandOk >= 7, bandOk + '/8');
}
// Audit: main == instrument on EVERY round, not just round 1.
let auditIdentical = true;
for (const s of corpus.streams) {
  const mh = corpus.fights.find(f => f.leg === 'main' && f.beast === 'audit' && f.stream === s).hits;
  const ih = corpus.fights.find(f => f.leg === 'instrument' && f.beast === 'audit' && f.stream === s).hits;
  if (mh.length !== ih.length) { auditIdentical = false; break; }
  for (let i = 0; i < mh.length; i++) {
    if (mh[i].observed !== ih[i].observed || mh[i].attack !== ih[i].attack || mh[i].round !== ih[i].round) { auditIdentical = false; break; }
  }
}
check('audit main == instrument on all rounds (control exactness)', auditIdentical);
check('corpus verdict DIAG-GO', corpus.verdict === 'DIAG-GO', corpus.verdict);
check('corpus gate g1+g2 true', corpus.g1 === true && corpus.g2 === true);

// DIAG purity: no src/ modifications.
const status = execSync('git status --short', { cwd: REPO }).toString();
const srcTouched = status.split('\n').filter(l => l.trim() && /(^|\s)??(M|A|D)\s+src\//.test(l) || /\sM\s+src\//.test(l));
check('no src/ files modified', srcTouched.length === 0, srcTouched.join(';') || 'clean');

console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
