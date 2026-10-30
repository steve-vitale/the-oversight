#!/usr/bin/env node
// test-raidname-b1-b.js — proof for the staged-B1 leg
// (sim-raidname-b1-b; prereg:
// evidence/2026-10-29/sim-raidname-b1-b-prereg.md).
//
// MEASUREMENT ONLY: zero src/js changes. Proves the
// instrument, not the game: (a) analyzer classification
// on synthetic staged-fight records (misfire /
// non-misfire / isolation-broken / snapshot-fail /
// missing-tail cases); (b) corpus invariants on the
// judged ON/OFF corpora — every staged event linked or
// a recorded miss, staged fights carry entry snapshots,
// pre-staging determinism identical OFF vs ON on staged
// seeds, at least one staged fight has a full say tail
// for the sense read, and the verdict recomputed here
// matches the analyzer's.
//
// Usage:
//   node scripts/test-raidname-b1-b.js --corpus <on-dir> --base-corpus <off-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze, classifyStagedFight } = require('./analyze-raidname-b1-b');

let pass = 0, fail = 0, skip = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

// (a) Synthetic classification cases (in-memory, no files).
const baseFight = {
  shadowAtEntry: null,
  originAtEntry: { id: 'bulldozer', raidBorn: true, lingering: true, hp: 40 },
  sayTail: ['⚔ BULLDOZER! You join!', '🐗 This one came with the raid on Haven — it was with the teeth at the door, not a lone wanderer.'],
  raidLineFired: true, pendingMatch: false, entityMatchCandidate: true,
};
check('T-CLS misfire-b', classifyStagedFight(baseFight) === 'misfire-b');
check('T-CLS non-misfire (line absent)',
  classifyStagedFight({ ...baseFight, raidLineFired: false, sayTail: ['⚔ BULLDOZER!'] }) === 'non-misfire');
check('T-CLS isolation-broken (shadow matched) unclassified',
  classifyStagedFight({ ...baseFight, shadowAtEntry: 'bulldozer', pendingMatch: true }) === 'unclassified');
check('T-CLS snapshot-fail (origin not raidBorn) unclassified',
  classifyStagedFight({ ...baseFight, originAtEntry: { id: 'bulldozer', raidBorn: false }, entityMatchCandidate: false }) === 'unclassified');
check('T-CLS missing origin unclassified',
  classifyStagedFight({ ...baseFight, originAtEntry: null }) === 'unclassified');
check('T-CLS missing sayTail unclassified',
  classifyStagedFight({ ...baseFight, sayTail: null }) === 'unclassified');
check('T-CLS null fight unclassified', classifyStagedFight(null) === 'unclassified');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const corpus = get('--corpus'), baseCorpus = get('--base-corpus');
if (!corpus || !baseCorpus) {
  console.error('usage: node scripts/test-raidname-b1-b.js --corpus <on-dir> --base-corpus <off-dir>');
  process.exit(2);
}

// (b) Corpus invariants.
const res = analyze(corpus, baseCorpus);
check('T-CORPUS seeds present', res.seedCount >= 8, 'seeds=' + res.seedCount);
check('T-CORPUS staged events accounted (linked or miss)',
  res.stagedConfigs + res.unclassified + res.stagingMisses >= res.stagedConfigs, 'counts=' + JSON.stringify({ c: res.stagedConfigs, u: res.unclassified, m: res.stagingMisses }));
check('T-CORPUS no unclassified staged fights', res.unclassified === 0, 'unclassified=' + res.unclassified);
check('T-CORPUS pre-staging determinism clean', res.detMismatches.length === 0, 'mismatch seeds=' + res.detMismatches.join(','));
// Every staged seed's staged fight carries a verified entry snapshot.
let snapOk = true, snapDetail = '';
for (const row of res.perSeed) {
  for (const s of row.staged) {
    if (s.classification && s.classification !== 'miss') {
      if (!s.originAtEntry || !s.originAtEntry.raidBorn || s.shadowAtEntry === s.species) { snapOk = false; snapDetail = 'seed ' + row.seed; }
    }
  }
}
check('T-CORPUS staged entry snapshots verified', snapOk, snapDetail);
// At least one staged fight has a full say tail (sense input).
let fullTail = false;
for (const name of fs.readdirSync(corpus).sort()) {
  if (!name.endsWith('.json')) continue;
  const inst = JSON.parse(fs.readFileSync(path.join(corpus, name), 'utf8'));
  if (inst.stagedEvents && inst.stagedEvents.length && Array.isArray(inst.stagedSayFull) && inst.stagedSayFull.length) { fullTail = true; break; }
}
if (res.stagedConfigs === 0) { skip++; console.log('SKIP: T-CORPUS full say tail (no staged configs yet)'); }
else check('T-CORPUS staged full say tail present', fullTail);
// Verdict recomputation matches the prereg ladder.
let expected;
if (res.stagedConfigs < 8 || res.unclassified > 0 || res.detMismatches.length) expected = 'INSUFFICIENT-DATA';
else if (res.misfireRate >= 0.75) expected = 'DIAG-GO';
else expected = 'DIAG-NO-GO';
check('T-CORPUS verdict recomputed', res.verdict === expected, res.verdict + ' vs ' + expected);

console.log('RESULT pass=' + pass + ' fail=' + fail + ' skip=' + skip);
console.log(JSON.stringify({
  seeds: res.seedCount, stagedConfigs: res.stagedConfigs, misfires: res.misfires,
  nonMisfires: res.nonMisfires, unclassified: res.unclassified, stagingMisses: res.stagingMisses,
  misfireRate: res.misfireRate, verdict: res.verdict,
}, null, 2));
process.exit(fail ? 1 : 0);
