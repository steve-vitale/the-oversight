// test-53007-a.js — proof for the 53007 death classification
// (arm sim-53007-a). G1 det-gate (classifier on the judged/committed
// corpora + broken-recorder/broken-classifier sensitivity), G2 recorder
// neutrality, G3 corpus integrity. Fixture-based; no sim, no harness
// load — runs at any SHA. Real-corpus legs run when the committed
// corpora exist (perseed-53007-a + perseed-53007-a-unrec) and SKIP
// otherwise; the evidence run records the full count with corpora present.
// Run: node scripts/test-53007-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./analyze-53007-20261108');

const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function checkSkip(name, cond, extra) {
  if (cond === null) { skip++; console.log('SKIP ' + name + (extra ? ' — ' + extra : '')); }
  else check(name, cond, extra);
}
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

// --- G1: classifier on the real committed corpora ---
// P1 53007 (xphalf-rejudge judged label: sickness-first).
const p1 = readJson(path.join(REPO, 'evidence', '2026-11-07', 'xphalf-p1', 'doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: P1 53007 classifies sickness-first (judged label)',
  p1 ? A.classify(p1.fallen, A.livingAt(p1, 30)).mech === 'sickness-first' : null,
  p1 ? ('got ' + A.classify(p1.fallen, A.livingAt(p1, 30)).mech) : 'no committed xphalf-p1 corpus');
// Healed 53007 (50d): sickness-first.
const healed = readJson(path.join(REPO, 'evidence', '2026-11-08', 'perseed-healerctl-healed-b', 'doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: healed 53007 classifies sickness-first',
  healed ? A.classify(healed.fallen, A.livingAt(healed, 30)).mech === 'sickness-first' : null,
  healed ? ('got ' + A.classify(healed.fallen, A.livingAt(healed, 30)).mech) : 'no committed healed corpus');
// Collapsed 53007 (63d): mixed/other, never forced into sickness-first.
const collapsed = readJson(path.join(REPO, 'evidence', '2026-11-08', 'perseed-healerctl-collapse-b', 'doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: collapsed 53007 classifies mixed/other (sickness 3/8 < 40%)',
  collapsed ? A.classify(collapsed.fallen, A.livingAt(collapsed, 30)).mech === 'mixed/other' : null,
  collapsed ? ('got ' + A.classify(collapsed.fallen, A.livingAt(collapsed, 30)).mech) : 'no committed collapsed corpus');
// Broken-classifier sensitivity: a mutated rule (sickness bar 90%)
// must NOT reproduce the judged label — the gate can fail.
function brokenClassify(fallen) {
  const sick = (fallen || []).filter(function (f) { return f.cause === 'sickness'; }).length;
  return (fallen && fallen.length && fallen[0].cause === 'sickness' && sick / fallen.length >= 0.9) ? 'sickness-first' : 'mixed/other';
}
check('G1: broken classifier (90% sickness bar) does NOT reproduce the judged label',
  p1 ? brokenClassify(p1.fallen) !== 'sickness-first' : false,
  p1 ? 'broken rule returned ' + brokenClassify(p1.fallen) : 'no P1 corpus');
// Synthetic fixtures: attrition-after-thinning and combat-led fire.
const attrFixture = [
  { day: 10, cause: 'monster' }, { day: 12, cause: 'combat' }, { day: 14, cause: 'the wild' },
  { day: 35, cause: 'sickness' }, { day: 40, cause: 'starvation' }, { day: 45, cause: 'thirst' },
];
check('G1: violent opener + thin roster + late attrition classifies attrition-after-thinning',
  A.classify(attrFixture, 6).mech === 'attrition-after-thinning');
const combatFixture = [
  { day: 9, cause: 'monster' }, { day: 15, cause: 'combat' }, { day: 20, cause: 'ambush' },
  { day: 25, cause: 'monster' }, { day: 30, cause: 'contest' },
];
check('G1: all-violent deaths classify combat-led',
  A.classify(combatFixture, 10).mech === 'combat-led');
// 'the night' is never silently bucketed: a corpus whose only deaths
// are 'the night' lands mixed/other with the cause named.
check('G1: night-only deaths land mixed/other, cause stated',
  A.classify([{ day: 5, cause: 'the night' }, { day: 9, cause: 'the night' }], 11).mech === 'mixed/other' &&
  A.classify([{ day: 5, cause: 'the night' }], 11).detail.indexOf('the night') >= 0);

// --- G3: corpus integrity on synthetic corpora ---
function goodCorpus() {
  // Instrument shape (Amendments 1–2): rows start d2, day 3 is never
  // snapshot, the closing snapshot duplicates the final scholar day.
  const daily = [];
  for (let d = 2; d <= 10; d++) {
    if (d === 3) continue;
    daily.push({ day: d, living: d < 5 ? 12 : 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  }
  daily.push({ day: 10, living: 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  return { seed: 53007, days: 10, gameDays: 10, endReason: 'village-lost', daily: daily, fallen: [{ day: 5, name: 'X', cause: 'sickness' }], instrumentErrors: [] };
}
check('G3: good synthetic corpus (instrument shape) PASSES integrity', A.checkCorpus(goodCorpus()).ok);
check('G3: the d3 gap is enumerated, not failed', A.checkCorpus(goodCorpus()).gaps.join(',') === 'd2 -> d4');
const noDiag = goodCorpus();
noDiag.daily[3].diag = null;
check('G3: broken recorder (diag dropped on a row) FAILS integrity', !A.checkCorpus(noDiag).ok);
const gap = goodCorpus();
gap.daily = gap.daily.filter(function (r) { return r.day !== 6; });
check('G3: an unexplained mid-run gap is enumerated, corpus still passes',
  A.checkCorpus(gap).ok && A.checkCorpus(gap).gaps.join(',').indexOf('d5 -> d7') >= 0);
const badFallen = goodCorpus();
badFallen.fallen = [{ day: 6, name: 'Y', cause: 'sickness' }];
check('G3: fallen with no living drop is a note, not a failure (joins mask drops)',
  A.checkCorpus(badFallen).ok && A.checkCorpus(badFallen).livingNotes.length === 1,
  JSON.stringify(A.checkCorpus(badFallen)));
// A last-daily != gameDays corpus still fails (the end reference is gameDays).
const badEnd = goodCorpus();
badEnd.gameDays = 12;
check('G3: last daily != gameDays FAILS integrity', !A.checkCorpus(badEnd).ok);
const withErr = goodCorpus();
withErr.instrumentErrors = ['diag-53007: boom'];
check('G3: instrument errors FAIL integrity', !A.checkCorpus(withErr).ok);

// --- G2: neutrality on synthetic pairs ---
const rec = goodCorpus();
const unrec = A.stripDiag(JSON.parse(JSON.stringify(rec)));
check('G2: stripDiag pair is neutral (identical once diag removed)',
  A.neutralityCompare(unrec, rec).ok);
const drifted = A.stripDiag(JSON.parse(JSON.stringify(rec)));
drifted.daily[4].living = 10;
check('G2: a one-life drift in the unrecorded trajectory FAILS neutrality',
  !A.neutralityCompare(drifted, rec).ok);

// --- G2 + G3 on the real committed corpora (run when present) ---
const armedDir = path.join(REPO, 'evidence', '2026-11-08', 'perseed-53007-a');
const unrecDir = path.join(REPO, 'evidence', '2026-11-08', 'perseed-53007-a-unrec');
if (fs.existsSync(armedDir) && fs.existsSync(unrecDir)) {
  const armed = A.loadDir(armedDir);
  const un = A.loadDir(unrecDir);
  Object.keys(un).sort().forEach(function (s) {
    const n = A.neutralityCompare(un[s], armed[s]);
    check('G2 real: seed ' + s + ' armed == unrecorded', n.ok, n.diffs.join(', '));
  });
  Object.keys(armed).sort().forEach(function (s) {
    const ck = A.checkCorpus(armed[s]);
    check('G3 real: seed ' + s + ' corpus integrity', ck.ok, ck.problems.join('; '));
  });
} else {
  skip += 2;
  console.log('SKIP G2/G3 real legs — committed corpora not present yet (perseed-53007-a / perseed-53007-a-unrec)');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
