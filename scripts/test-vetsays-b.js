// test-vetsays-b.js — proof for finding #2271 (sim-vetsays-b).
// The veteran-filtered SAY_RE /elder/ matched "Elderberry", flooding the
// vetSays capture (seed 190393: 112 of 148 lines). The fix tightens the
// elder alternative to \belder\b in all three copies of the filter
// (vetfirst / vetphantom / survivalcontrol drivers — the instrument file
// itself carries no SAY_RE). This test:
//   (1) extracts SAY_RE from each driver file and asserts all three are
//       byte-identical with the elder alternative exactly \belder\b;
//   (2) unit-checks the filter: rejects Elderberry / elders-plural /
//       elderly lines, accepts genuine "elder" lines and all other
//       alternatives, and shows the OLD filter accepted the bug lines;
//   (3) re-applies the fixed filter to the already-judged corpus
//       evidence/2026-11-11/perseed-survivalcontrol-b/*.json (8 seeds,
//       190391-190398) and asserts the preregistered GO:
//       (a) 0 /elderberry/i lines in the re-filtered capture, all seeds;
//       (b) no false negatives: 0 dropped lines contain /\belder\b/i,
//           every dropped line is Elderberry-substring or plural-"elders",
//           per-seed /\belder\b/ counts identical before/after.
// No sims run here; the corpus files are read-only (never rewritten).
// Run: node scripts/test-vetsays-b.js  (exit 0 = GO, non-zero = NO-GO)
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DRIVERS = [
  'scripts/vetfirst-driver-20261111.js',
  'scripts/vetphantom-driver-20261111.js',
  'scripts/survivalcontrol-driver-20261111.js',
];
const CORPUS_DIR = path.join(REPO, 'evidence', '2026-11-11', 'perseed-survivalcontrol-b');
// The pre-fix filter, as it shipped (reconstructed from git history / the
// finding; validated below: every stored corpus line must match OLD).
const OLD_SAY_RE = /veteran|blooded|scarred|elder|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;

let failures = 0;
function ok(cond, label, detail) {
  if (cond) { console.log('ok   ' + label); }
  else { failures++; console.log('FAIL ' + label + (detail !== undefined ? ' :: ' + detail : '')); }
}

// (1) Extract SAY_RE from each driver file; all three must agree, and the
// elder alternative must be exactly \belder\b.
const extracted = {};
for (const rel of DRIVERS) {
  const src = fs.readFileSync(path.join(REPO, rel), 'utf8');
  const m = src.match(/const SAY_RE\s*=\s*(\/(?:\\.|[^\/])*\/i);/);
  ok(!!m, rel + ' carries a SAY_RE literal');
  if (!m) continue;
  extracted[rel] = m[1];
  let re = null;
  try { re = eval(m[1]); } catch (e) { re = null; }
  ok(re instanceof RegExp, rel + ' SAY_RE parses as a RegExp');
  if (re) extracted[rel + '#re'] = re;
}
const lits = DRIVERS.map(function (d) { return extracted[d]; }).filter(Boolean);
ok(lits.length === 3 && lits[0] === lits[1] && lits[1] === lits[2],
  'all three drivers carry the identical SAY_RE', JSON.stringify(lits));
ok(lits.length > 0 && lits[0].indexOf('|\\belder\\b|') !== -1,
  'elder alternative is exactly \\belder\\b', lits[0] || '(none)');
ok(lits.length > 0 && !/\|elder\|/.test(lits[0]),
  'no bare |elder| alternative remains', lits[0] || '(none)');

const NEW = extracted[DRIVERS[0] + '#re'];
if (!NEW) { console.log('FAIL no usable NEW SAY_RE; aborting'); process.exit(1); }

// (2) Unit cases.
const rejectCases = [
  'From the lumped bag: Elderberry — named, and out.',
  '★ IDENTIFIED: Elderberry. White flower clusters in spring, dark berries in late summer. Uses unknown — harvest, taste, and learn.',
  "💡 You see it again in your mind: tall shrub with white flower clusters, dark purple-black berry clusters. Jesse's words land on the memory like a label. Elderberry. Of course.",
  '🍽️ Jorge leaves the foraging basket at the door. "The pantry can\'t take more — sitting with the elders instead."',
  'The elderly villager rests by the fire.',
  'Elderberry jam for the feast.',
];
const acceptCases = [
  '⚠ This one is different — old, patient, unhurried — it has seen your kind before. A Elder veteran.',
  'Tashi strikes the Elder The Ugly Beast.',
  'The Elder Glasswing Darter falls.',
  '★ IDENTIFIED: Ground Elder. Creeping patches of divided leaves in shady spots.',
  '★ IDENTIFIED: European Elder. Elder. Big shrub; flat white flower plates in June.',
  "The Elder's patience wears thin.",
  'A scarred veteran of the wave-4 fight.',
  'The pack-leader circles the village.',
  'Remember the name of the fallen.',
  'We must put down the beast.',
  'A killing blow ends it.',
  'The blooded hunter returns at dusk.',
];
for (const line of rejectCases) {
  ok(OLD_SAY_RE.test(line), 'OLD filter accepted (bug reproduced): ' + JSON.stringify(line.slice(0, 60)));
  ok(!NEW.test(line), 'NEW filter rejects: ' + JSON.stringify(line.slice(0, 60)));
}
for (const line of acceptCases) {
  ok(NEW.test(line), 'NEW filter accepts: ' + JSON.stringify(line.slice(0, 60)));
}

// (3) Corpus re-filter.
const files = fs.readdirSync(CORPUS_DIR).filter(function (f) { return /\.json$/.test(f); }).sort();
ok(files.length === 8, 'corpus has 8 seed files', 'found ' + files.length);
let totOld = 0, totNew = 0, totDrop = 0;
const dropClasses = {};
let elderberryKept = 0;
for (const f of files) {
  const seed = (f.match(/s(\d+)/) || [])[1] || f;
  const j = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, f), 'utf8'));
  const vs = j.vetSays || [];
  // Sanity: the stored capture must reproduce under OLD (validates the
  // OLD reconstruction; the stored lines are already slice(0,600)).
  let oldFail = 0;
  for (const x of vs) { if (!OLD_SAY_RE.test(x.line || '')) oldFail++; }
  ok(oldFail === 0, 'seed ' + seed + ': stored capture reproduces under OLD', oldFail + ' lines fail OLD');
  const kept = vs.filter(function (x) { return NEW.test(x.line || ''); });
  const dropped = vs.filter(function (x) { return !NEW.test(x.line || ''); });
  const ebKept = kept.filter(function (x) { return /elderberry/i.test(x.line || ''); }).length;
  elderberryKept += ebKept;
  const wordElderOld = vs.filter(function (x) { return /\belder\b/i.test(x.line || ''); }).length;
  const wordElderNew = kept.filter(function (x) { return /\belder\b/i.test(x.line || ''); }).length;
  let standaloneDropped = 0;
  for (const d of dropped) {
    const line = d.line || '';
    let cls = 'OTHER';
    if (/elderberry/i.test(line)) cls = 'elderberry';
    else if (/elders/i.test(line)) cls = 'elders';
    else if (/\belder\b/i.test(line)) cls = 'STANDALONE-ELDER';
    dropClasses[cls] = (dropClasses[cls] || 0) + 1;
    if (/\belder\b/i.test(line)) standaloneDropped++;
  }
  console.log('seed ' + seed + ': old=' + vs.length + ' new=' + kept.length +
    ' dropped=' + dropped.length + ' elderberryKept=' + ebKept +
    ' wordElder old=' + wordElderOld + ' new=' + wordElderNew);
  ok(ebKept === 0, 'seed ' + seed + ' (a): 0 Elderberry lines in re-filtered capture', 'kept ' + ebKept);
  ok(standaloneDropped === 0, 'seed ' + seed + ' (b1): 0 dropped lines contain standalone elder', 'dropped ' + standaloneDropped);
  ok(wordElderOld === wordElderNew, 'seed ' + seed + ' (b3): word-elder count identical before/after',
    'old ' + wordElderOld + ' new ' + wordElderNew);
  totOld += vs.length; totNew += kept.length; totDrop += dropped.length;
}
console.log('TOTAL old=' + totOld + ' new=' + totNew + ' dropped=' + totDrop +
  ' droppedClasses=' + JSON.stringify(dropClasses));
ok(totOld === 452 && totNew === 280 && totDrop === 172,
  'corpus totals match the judged record (452 -> 280, dropped 172)',
  'old=' + totOld + ' new=' + totNew + ' dropped=' + totDrop);
ok(elderberryKept === 0, '(a) total: 0 Elderberry lines in re-filtered capture, all 8 seeds',
  'kept ' + elderberryKept);
ok(dropClasses['STANDALONE-ELDER'] === undefined && dropClasses.OTHER === undefined,
  '(b2) every dropped line is Elderberry-substring or plural-"elders"',
  JSON.stringify(dropClasses));
ok(dropClasses.elderberry === 116 && dropClasses.elders === 56,
  'dropped-line inventory is exactly 116 Elderberry + 56 elders',
  JSON.stringify(dropClasses));

console.log(failures === 0 ? 'PASS test-vetsays-b: GO' : 'FAIL test-vetsays-b: ' + failures + ' failure(s) — NO-GO');
process.exitCode = failures === 0 ? 0 : 1;
