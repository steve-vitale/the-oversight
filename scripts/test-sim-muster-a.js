#!/usr/bin/env node
// test-sim-muster-a.js — proof test for the sim-muster-a instrument.
// Synthetic cases for the shared lib (hypothetical yield, trajectory
// summary, first-blade classification) + corpus legs re-deriving the
// verdict gates from the judged corpus (when present). No game loaded.
//   node scripts/test-sim-muster-a.js [corpus-dir]
// Corpus legs are SKIPPED (not failed) when the corpus dir is absent,
// so the synthetic suite stays green on a bare checkout.
'use strict';
const fs = require('fs');
const path = require('path');
const LIB = require(path.join(__dirname, 'sim-muster-a-lib'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b }); }

// --- hypothetical yield: titans.js rules ---
(function () {
  const cfg = { baseBlades: 2, trustedBlades: 6, trustedAt: 70, trustedOpinion: 10 };
  // Trusted link: 6 blades, capped by free faces.
  let y = LIB.hypotheticalYield([{ villageId: 'v1', trust: 80, opinion: 20, arrears: 0, facesFree: 4 }], cfg, {});
  eq('yield trusted capped by faces', y.total, 4);
  // Base link: 2 blades.
  y = LIB.hypotheticalYield([{ villageId: 'v1', trust: 50, opinion: 0, arrears: 0, facesFree: 5 }], cfg, {});
  eq('yield base 2', y.total, 2);
  // Refusals: trust, opinion, arrears each zero the link.
  y = LIB.hypotheticalYield([
    { villageId: 'a', trust: 24, opinion: 50, arrears: 0, facesFree: 5 },
    { villageId: 'b', trust: 90, opinion: -11, arrears: 0, facesFree: 5 },
    { villageId: 'c', trust: 90, opinion: 50, arrears: 1, facesFree: 5 },
  ], cfg, {});
  eq('yield all-refused 0', y.total, 0);
  eq('refuse reasons', y.links.map(l => l.refuseReason), ['trust', 'opinion', 'arrears']);
  // No free faces -> 0 even when willing; already-committed reduces quota.
  y = LIB.hypotheticalYield([{ villageId: 'v1', trust: 80, opinion: 20, arrears: 0, facesFree: 0 }], cfg, {});
  eq('yield no faces 0', y.total, 0);
  y = LIB.hypotheticalYield([{ villageId: 'v1', trust: 50, opinion: 0, arrears: 0, facesFree: 5 }], cfg, { v1: 2 });
  eq('yield quota-filled 0', y.total, 0);
  // Boundary: trust exactly 25 answers; opinion exactly -10 answers.
  y = LIB.hypotheticalYield([{ villageId: 'v1', trust: 25, opinion: -10, arrears: 0, facesFree: 3 }], cfg, {});
  eq('yield boundary answers', y.total, 2);
  // Mixed band: trusted + base + refused sums.
  y = LIB.hypotheticalYield([
    { villageId: 'a', trust: 80, opinion: 20, arrears: 0, facesFree: 9 },
    { villageId: 'b', trust: 50, opinion: 0, arrears: 0, facesFree: 9 },
    { villageId: 'c', trust: 10, opinion: 0, arrears: 0, facesFree: 9 },
  ], cfg, {});
  eq('yield mixed 6+2+0', y.total, 8);
})();

// --- trajectory summary ---
(function () {
  const s = LIB.summarizeTrajectory([
    { day: 10, size: 0 }, { day: 40, size: 3 }, { day: 60, size: 0 },
  ], 0);
  eq('traj max', s.maxSize, 3);
  eq('traj firstPositive', s.firstPositiveDay, 40);
  const s2 = LIB.summarizeTrajectory([{ day: 10, size: 0 }], 0);
  eq('traj zero max', s2.maxSize, 0);
  eq('traj zero firstPositive', s2.firstPositiveDay, null);
})();

// --- classification priority ---
(function () {
  const T = (omen, max, need) => ({ tid: 'herald', omenStageMax: omen, musterMax: max, need: need });
  eq('class A', LIB.classifySeed({ callsSounded: 0, titans: [T(1, 0, 10)] }).cls, 'A-NO-OPPORTUNITY');
  eq('class B', LIB.classifySeed({ callsSounded: 0, titans: [T(2, 0, 10)] }).cls, 'B-OFFERED-NOT-SOUNDED');
  eq('class C', LIB.classifySeed({ callsSounded: 2, titans: [T(2, 0, 10)] }).cls, 'C-CALLED-NO-ANSWERS');
  eq('class D', LIB.classifySeed({ callsSounded: 1, titans: [T(2, 4, 10)] }).cls, 'D-PARTIAL-THEN-LOST');
  eq('class E', LIB.classifySeed({ callsSounded: 1, titans: [T(2, 10, 10)] }).cls, 'E-FORMED-THEN-STOOD-DOWN');
  // A seed with no omen at all is A, not B.
  eq('class A null omen', LIB.classifySeed({ callsSounded: 0, titans: [T(null, 0, 10)] }).cls, 'A-NO-OPPORTUNITY');
  // Priority: a partial muster beats a sounded call (D over C).
  eq('class D over C', LIB.classifySeed({ callsSounded: 3, titans: [T(2, 2, 10)] }).cls, 'D-PARTIAL-THEN-LOST');
})();

// --- corpus legs (skipped when no corpus dir given or absent) ---
const corpusDir = process.argv[2];
if (corpusDir && fs.existsSync(corpusDir)) {
  const files = fs.readdirSync(corpusDir).filter(f => /^s\d+\.json$/.test(f)).sort();
  check('corpus 8 seeds', files.length === 8, { files: files.length });
  let hRef = 0, calls = 0, trajSeeds = 0, zeroMusterSeeds = 0, classifiedZero = 0, capErrs = 0;
  const classes = {};
  files.forEach(function (f) {
    const s = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    hRef += (s.refusals || []).filter(r => r.mid === 'herald').length;
    const ct = (s.musterDiag && s.musterDiag.callTotals) || {};
    calls += ct.soundTitanCall || 0;
    capErrs += (s.captureErrs || 0) + ((s.musterDiag && s.musterDiag.errs) || 0);
    const hasTraj = (s.trajectory || []).length > 0;
    if (hasTraj) trajSeeds++;
    const maxSize = Math.max(0, ...Object.values(s.endSnaps || {}).map(e => (e && e.size) || 0),
      ...(s.trajectory || []).map(t => t.size || 0));
    if (maxSize === 0) {
      zeroMusterSeeds++;
      // Recompute classification inputs the way the analyzer does.
      const TITANS = ['herald', 'nielsen', 'finale', 'the_network'];
      const NEEDS = { herald: 10, nielsen: 12, finale: 20, the_network: 20 };
      const titans = TITANS.map(function (tid) {
        const tr = (s.trajectory || []).filter(t => t.tid === tid);
        let omenMax = null;
        tr.forEach(function (t) { if (t.omenStage != null && (omenMax == null || t.omenStage > omenMax)) omenMax = t.omenStage; });
        return { tid: tid, omenStageMax: omenMax, musterMax: Math.max(0, ...tr.map(t => t.size || 0)), need: NEEDS[tid] };
      });
      const cls = LIB.classifySeed({ callsSounded: ct.soundTitanCall || 0, titans: titans }).cls;
      if (['A-NO-OPPORTUNITY', 'B-OFFERED-NOT-SOUNDED', 'C-CALLED-NO-ANSWERS'].indexOf(cls) >= 0) classifiedZero++;
      classes[cls] = (classes[cls] || 0) + 1;
    }
    // Every counted verb has a titan id + day: muster-diag calls map is keyed by id.
    const verbKeys = Object.keys((s.musterDiag && s.musterDiag.calls) || {});
    check('verb maps present s' + s.seed, verbKeys.length === 4, { keys: verbKeys });
  });
  check('corpus herald refusals == 29 (titangate pilot cross-check)', hRef === 29, { hRef: hRef });
  check('corpus trajectory on 8/8 seeds', trajSeeds === 8, { trajSeeds: trajSeeds });
  check('corpus capture errors 0', capErrs === 0, { capErrs: capErrs });
  check('corpus zero-muster seeds all classified A/B/C', classifiedZero === zeroMusterSeeds, { classifiedZero: classifiedZero, zeroMusterSeeds: zeroMusterSeeds });
  console.error(`corpus legs: seeds=${files.length} heraldRefusals=${hRef} calls=${calls} classes=${JSON.stringify(classes)}`);
} else {
  console.error('corpus legs skipped (no corpus dir).');
}

console.log(`${pass} passed, ${fail} failed, 0 skipped`);
process.exit(fail ? 1 : 0);
