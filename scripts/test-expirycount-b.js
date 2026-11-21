// test-expirycount-b.js — integration proof for the sim-expirycount-b arm
// (findings #2626/#2633): the analyzer fix + the pooled re-judgment.
// Runs the analyzer IN-PROCESS on the frozen corpora (no sims, no
// writes into the repo) and asserts:
//   (a) the #2633 fix newly counts the 106705 d37 companion-out
//       expiry and clears the expiry-rule mismatch on the beat band;
//   (b) the other four expiries' counts are unchanged (no moved
//       instrument);
//   (c) no control leg newly counts an expiry;
//   (d) the pooled re-judgment under the re-derived 14-day bar
//       (minExpiries 3) is DIAG-GO at 4/5, while the frozen 7-day
//       pooled judge on the same data is still NO-GO RESEED (2/5) —
//       the bar change, not the data, flips the verdict.
// Usage: node scripts/test-expirycount-b.js
'use strict';
const path = require('path');
const A = require(path.join(__dirname, 'analyze-reseedexpiry-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

const ROOT = path.join(__dirname, '..');
function dir(rel) { return path.join(ROOT, rel); }

const ARMED = {
  '106301': 'evidence/2026-11-20/perseed-reseedexpiry-b-106301-armed',
  '106401': 'evidence/2026-11-20/perseed-reseedexpiry-b-106401-armed',
  '106601': 'evidence/2026-11-20/perseed-reseedwide-b-106601-armed',
  '106609': 'evidence/2026-11-20/perseed-reseedwide-b-106609-armed',
  '106701': 'evidence/2026-11-20/perseed-reseedbeat-b-106701-armed',
};
const CONTROL = {
  '106301': 'evidence/2026-11-20/perseed-reseedexpiry-b-106301-control',
  '106401': 'evidence/2026-11-20/perseed-reseedexpiry-b-106401-control',
  '106601': 'evidence/2026-11-20/perseed-reseedwide-b-106601-control',
  '106609': 'evidence/2026-11-20/perseed-reseedwide-b-106609-control',
};
// Frozen pre-fix counts (baseline /tmp/expirycount-baseline, the
// published evidence): expiries per armed dir, all mismatches 0.
const FROZEN_ARMED_EXPIRIES = { '106301': 2, '106401': 0, '106601': 1, '106609': 1 };

const armedAnalyses = {};
for (const band of Object.keys(ARMED)) {
  const a = A.analyzeDir(dir(ARMED[band]));
  armedAnalyses[band] = a;
  check('armed ' + band + ': 8 files, 0 instrument errors',
    a.files === 8 && a.errors === 0, { files: a.files, errors: a.errors });
}

// (a) The beat band newly counts the 106705 d37 companion-out expiry.
const beat = armedAnalyses['106701'];
check('beat band counts exactly 1 expiry (was 0 pre-fix)',
  beat.expiriesCount === 1 && beat.expiries.length === 1, beat.expiries);
check('beat band expiry is Amina d37 (seed 106705, brain path)',
  beat.expiries.length === 1 && beat.expiries[0].seed === 106705 &&
  beat.expiries[0].day === 37 && beat.expiries[0].vid === 'amina_diallo',
  beat.expiries);
check('beat band expiry-rule mismatch cleared (was 1 pre-fix)',
  beat.expiryRuleMismatch === 0, beat.expiryRuleMismatch);
check('beat band: Amina re-seeded in 16d — outside both windows; no fought encounter',
  beat.reseededWithin7Count === 0 && beat.reseededWithin14Count === 0 &&
  beat.foughtAgain14Count === 0 && beat.foughtEncounter14Count === 0,
  { w7: beat.reseededWithin7Count, w14: beat.reseededWithin14Count,
    fa: beat.foughtAgain14Count, fe: beat.foughtEncounter14Count });
check('beat band: post-expiry targetless launches still 0',
  beat.postExpiryTargetlessLaunches === 0, beat.postExpiryTargetlessLaunches);

// (b) The other four expiries' counts are unchanged.
for (const band of ['106301', '106401', '106601', '106609']) {
  const a = armedAnalyses[band];
  check('armed ' + band + ': expiries unchanged at ' + FROZEN_ARMED_EXPIRIES[band],
    a.expiriesCount === FROZEN_ARMED_EXPIRIES[band], a.expiriesCount);
  check('armed ' + band + ': expiry-rule mismatch still 0',
    a.expiryRuleMismatch === 0, a.expiryRuleMismatch);
}
check('frozen four: re-seed within 14d is 4/4 (Lorenzo 14d, Emmett 6d, Amina 3d, Fernando 8d)',
  armedAnalyses['106301'].reseededWithin14Count === 2 &&
  armedAnalyses['106601'].reseededWithin14Count === 1 &&
  armedAnalyses['106609'].reseededWithin14Count === 1,
  { a: armedAnalyses['106301'].reseededWithin14Count,
    b: armedAnalyses['106601'].reseededWithin14Count,
    c: armedAnalyses['106609'].reseededWithin14Count });

// (c) No control leg newly counts an expiry.
for (const band of Object.keys(CONTROL)) {
  const a = A.analyzeDir(dir(CONTROL[band]));
  check('control ' + band + ': expiries still 0, mismatch still 0',
    a.expiriesCount === 0 && a.expiryRuleMismatch === 0,
    { expiries: a.expiriesCount, mismatch: a.expiryRuleMismatch });
}

// (d) Pooled re-judgment under the re-derived 14-day bar.
const pooled14 = A.judgePooled(
  Object.keys(ARMED).map(function (b) { return armedAnalyses[b]; }),
  { armed: true, minExpiries: 3, reseedDays: 14 });
check('pooled 14-day: 5 expiries across 40 armed seeds (4 frozen + 1 beat)',
  pooled14.pooled.expiries === 5, pooled14.pooled);
check('pooled 14-day: re-seeded within 14d 4/5 = 0.800 >= 2/3',
  pooled14.pooled.reseededWithin14 === 4 && pooled14.pooled.reseededShare14 === 0.8,
  pooled14.pooled);
check('pooled 14-day: fought again (launch-based) 4/5 = 0.800',
  pooled14.pooled.foughtAgain14 === 4 && pooled14.pooled.foughtAgainShare === 0.8,
  pooled14.pooled);
check('pooled 14-day: fought-encounter diagnostic 0/5 (never a GO bar)',
  pooled14.pooled.foughtEncounter14 === 0 && pooled14.pooled.foughtEncounter14Share === 0,
  pooled14.pooled);
check('pooled 14-day: post-expiry targetless 0, dead commits 40, mismatch 0, disagreements 0',
  pooled14.pooled.postExpiryTargetlessLaunches === 0 &&
  pooled14.pooled.deadCommits === 40 && pooled14.pooled.expiryRuleMismatch === 0 &&
  pooled14.pooled.poolDisagreements === 0, pooled14.pooled);
check('pooled 14-day: verdict DIAG-GO (n=5 >= minExpiries 3, primary bar passes)',
  pooled14.verdict === 'DIAG-GO', JSON.stringify(pooled14));
check('pooled 14-day: 7-day share reported alongside as 2/5 = 0.400',
  pooled14.pooled.reseededWithin7 === 2 && pooled14.pooled.reseededShare7 === 0.4,
  pooled14.pooled);

const pooled7 = A.judgePooled(
  Object.keys(ARMED).map(function (b) { return armedAnalyses[b]; }),
  { armed: true, minExpiries: 3, reseedDays: 7 });
check('pooled 7-day on the same data: NO-GO RESEED (2/5) — the bar change flips the verdict, not the data',
  pooled7.verdict === 'NO-GO' && pooled7.kind === 'RESEED' &&
  pooled7.pooled.reseededShare === 0.4, JSON.stringify(pooled7.pooled));

console.log('test-expirycount-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
