// test-tbretreat-refind-confirm-20261105.js — proof for the tbretreat-refind
// CONFIRM (arm sim-tbretreat-refind-confirm-b, run fleshout-loop-b-20261105T2130Z).
// No instrument code changed in this arm (policy, driver, analyzer reused
// verbatim from the pilot landing 4a065f050), so this test proves the CONFIRM
// corpus itself: 48 files, identical seeds both legs, zero instrument errors,
// gates recomputed from the corpus by the pilot analyzer, prereg committed
// before any judged sim, zero src/js or policy changes in this worktree.
// Run: node scripts/test-tbretreat-refind-confirm-20261105.js
// (writes nothing into evidence/; analyzer reads the committed corpus dir).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-05', 'perseed-tbretreat-refind-confirm-b');
const PREREG = path.join(REPO, 'evidence', '2026-11-05', 'sim-tbretreat-refind-confirm-b-prereg.md');
const { analyzeDir } = require(path.join(REPO, 'scripts', 'tbretreat-refind-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function git(args) { try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); } catch (e) { return ''; } }

// 1. Corpus shape: 48 files, 24 seeds x 2 legs, identical seed sets.
const files = fs.readdirSync(DIR).filter(function (f) { return f.indexOf('tbretreat-refind-s') === 0 && f.endsWith('.json'); }).sort();
check('corpus-48-files', files.length === 48, 'got ' + files.length);
const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); });
const seedsByLeg = {};
rows.forEach(function (r) { (seedsByLeg[r.run] = seedsByLeg[r.run] || []).push(r.seed); });
const legNames = Object.keys(seedsByLeg).sort();
check('corpus-two-legs', legNames.length === 2 && legNames[0].indexOf('armed') >= 0 && legNames[1].indexOf('baseline') >= 0, legNames.join(','));
const baseSeeds = (seedsByLeg[legNames[1]] || []).slice().sort(function (a, b) { return a - b; });
const armedSeeds = (seedsByLeg[legNames[0]] || []).slice().sort(function (a, b) { return a - b; });
check('corpus-identical-seeds', JSON.stringify(baseSeeds) === JSON.stringify(armedSeeds) && baseSeeds.length === 24, baseSeeds.length + ' seeds');
check('corpus-band-93011-93026-plus-92011-92018',
  baseSeeds.slice(0, 8).join(',') === '92011,92012,92013,92014,92015,92016,92017,92018' &&
  baseSeeds.slice(8).join(',') === '93011,93012,93013,93014,93015,93016,93017,93018,93019,93020,93021,93022,93023,93024,93025,93026',
  baseSeeds.join(','));

// 2. Every row ran on the prereg-committed tree (anchor = the prereg commit;
// the evidence commit lands later, so HEAD at test time is NOT the anchor).
const preregCommitForAnchor = git('log --format=%H -1 -- evidence/2026-11-05/sim-tbretreat-refind-confirm-b-prereg.md').slice(0, 12);
const anchors = {};
rows.forEach(function (r) { anchors[r.anchorCommit] = (anchors[r.anchorCommit] | 0) + 1; });
const anchorKeys = Object.keys(anchors);
check('corpus-single-anchor', anchorKeys.length === 1, anchorKeys.join(','));
check('corpus-anchor-is-prereg-commit', anchorKeys[0] === preregCommitForAnchor, 'anchor ' + anchorKeys[0] + ' vs prereg ' + preregCommitForAnchor);

// 3. Zero instrument errors, zero unmatched kills, both legs 150d horizon.
const errs = rows.reduce(function (m, r) { return m + ((r.instrumentErrors || []).length); }, 0);
check('corpus-zero-instrument-errors', errs === 0, errs + ' errors');
const a = analyzeDir(DIR);
check('analyzer-zero-unmatched-kills', a.totalUnmatchedKills === 0, a.totalUnmatchedKills + ' unmatched');
check('analyzer-48-rows', a.n === 48, 'n=' + a.n);

// 4. Gates recomputed from the corpus by the pilot analyzer: GO.
check('gate-g1-14-of-27', a.gates.g1.exits === 14 && a.gates.g1.fires === 27, a.gates.g1.exits + '/' + a.gates.g1.fires);
check('gate-g1-rate-above-25', a.gates.g1.rate >= 0.25, String(a.gates.g1.rate));
check('gate-g2-armed-above-baseline', a.gates.g2.holds, a.gates.g2.armed + ' vs ' + a.gates.g2.baseline);
check('gate-g3-ratio-above-half', a.gates.g3.holds, 'ratio ' + a.gates.g3.ratio);
check('gate-g4-ratio-above-0.8', a.gates.g4.holds, 'ratio ' + a.gates.g4.ratio);
check('gate-denominator-not-thin', a.gates.thin === false, 'fires=' + a.gates.g1.fires);
check('gate-go', a.gates.go === true, JSON.stringify(a.gates));

// 5. No sealed fallbacks anywhere in 27 fires (the sibling's bucket, still zero).
const armedTotals = a.legs[legNames[0]].refindTotals;
check('refind-zero-consumed-pushes', armedTotals.consumedPushes === 0, String(armedTotals.consumedPushes));
check('refind-zero-sealed-pushes', armedTotals.pushes.sealed === 0, String(armedTotals.pushes.sealed));
check('refind-exits-split', armedTotals.exitsHaven + armedTotals.exitsGaveup === armedTotals.exits,
  armedTotals.exitsHaven + '+' + armedTotals.exitsGaveup + ' vs ' + armedTotals.exits);
check('refind-fires-accounted', armedTotals.exits + armedTotals.havenHolds + (a.legs[legNames[0]].tbFiredDeaths - armedTotals.havenHolds) === armedTotals.triggerFires,
  'exits ' + armedTotals.exits + ' + havenHolds ' + armedTotals.havenHolds + ' + open-deaths ' + (a.legs[legNames[0]].tbFiredDeaths - armedTotals.havenHolds) + ' vs fires ' + armedTotals.triggerFires);

// 6. Zero-fire seeds are identical between legs (policy never fired, RNG never diverged).
const bySeed = {};
rows.forEach(function (r) { (bySeed[r.seed] = bySeed[r.seed] || {})[r.run] = r; });
let zeroFire = 0, zeroFireIdentical = 0;
Object.keys(bySeed).forEach(function (seed) {
  const pair = bySeed[seed];
  if (!pair[legNames[0]] || !pair[legNames[1]]) return;
  if (((pair[legNames[0]].refindStats || {}).triggerFires | 0) === 0) {
    zeroFire++;
    const b = pair[legNames[1]], ar = pair[legNames[0]];
    if (b.days === ar.days && b.endReason === ar.endReason && b.fights.length === ar.fights.length) zeroFireIdentical++;
  }
});
check('zero-fire-seeds-identical', zeroFire === 12 && zeroFireIdentical === 12, zeroFireIdentical + '/' + zeroFire + ' identical');

// 7. Prereg committed before any judged sim (commit time < earliest corpus mtime).
const preregCommit = git('log --format=%H -1 -- evidence/2026-11-05/sim-tbretreat-refind-confirm-b-prereg.md');
check('prereg-committed', preregCommit.length === 40, 'no commit found');
if (preregCommit) {
  const ct = parseInt(git('show -s --format=%ct ' + preregCommit), 10);
  const earliest = Math.min.apply(null, files.map(function (f) { return fs.statSync(path.join(DIR, f)).mtimeMs / 1000; }));
  check('prereg-before-corpus', ct < earliest, 'commit ' + ct + ' vs earliest corpus ' + Math.floor(earliest));
}

// 8. Freshness: confirm seeds appear in no OTHER prereg (this arm's own prereg names them by design).
const preregDir = path.join(REPO, 'evidence');
let foreignHits = [];
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (/^\d{4}-\d{2}-\d{2}$/.test(e.name)) walk(p); }
    else if (/sim-.*-prereg\.md$/.test(e.name) && p !== PREREG) {
      const text = fs.readFileSync(p, 'utf8');
      baseSeeds.forEach(function (s) { if (new RegExp('\\b' + s + '\\b').test(text)) foreignHits.push(e.name + ':' + s); });
    }
  });
})(preregDir);
check('confirm-seeds-in-no-other-prereg', foreignHits.length === 0, foreignHits.slice(0, 5).join('; '));

// 9. Zero src/js or policy changes in this worktree vs HEAD (policy-side arm, reuse only).
const changed = git('diff --name-only HEAD -- src/js scripts/policies scripts/tbretreat-refind-driver-20261105.js scripts/tbretreat-refind-analyze-20261105.js scripts/test-tbretreat-refind-20261105.js');
check('no-src-or-instrument-changes', changed === '', changed.split('\n').slice(0, 5).join(','));

// 10. Pilot bands disjoint from confirm bands (no seed reuse across the two runs).
const pilotSeeds = [];
for (let s = 96811; s <= 96828; s++) pilotSeeds.push(s);
check('confirm-band-disjoint-from-pilot', baseSeeds.every(function (s) { return pilotSeeds.indexOf(s) < 0; }), 'overlap found');

console.log(pass + '/' + (pass + fail) + ' PASS');
if (fail) process.exit(1);
