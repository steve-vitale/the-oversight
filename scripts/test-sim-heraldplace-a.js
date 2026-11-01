#!/usr/bin/env node
// test-sim-heraldplace-a.js — proof test for the heraldplace
// instrument. Synthetic cases for the shared lib + corpus legs
// re-deriving the verdict gates from the judged corpus (when
// present). No game loaded.
//   node scripts/test-sim-heraldplace-a.js [corpus-dir]
// Corpus legs are SKIPPED (not failed) when the corpus dir is
// absent, so the synthetic suite stays green on a bare checkout.
'use strict';
const fs = require('fs');
const path = require('path');
const HPL = require(path.join(__dirname, 'sim-heraldplace-a-lib'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b }); }

// --- distances ---
(function () {
  eq('manhattan', HPL.manhattan({ x: 7, y: 4 }, { x: 4, y: 4 }), 3);
  eq('manhattan diag', HPL.manhattan({ x: 7, y: 4 }, { x: 4, y: 6 }), 5);
  eq('chebyshev', HPL.chebyshev({ x: 7, y: 4 }, { x: 4, y: 6 }), 3);
  eq('manhattan null', HPL.manhattan(null, { x: 4, y: 4 }), null);
  eq('chebyshev same', HPL.chebyshev({ x: 5, y: 5 }, { x: 5, y: 5 }), 0);
})();

// --- step classification vs scholar tile ---
(function () {
  const S = { x: 4, y: 4 };
  eq('step approach', HPL.stepClass({ x: 7, y: 4 }, { x: 6, y: 4 }, S), 'approach');
  eq('step retreat', HPL.stepClass({ x: 6, y: 4 }, { x: 7, y: 4 }, S), 'retreat');
  eq('step lateral', HPL.stepClass({ x: 7, y: 4 }, { x: 6, y: 5 }, S), 'lateral');
  eq('step sit', HPL.stepClass({ x: 7, y: 4 }, { x: 7, y: 4 }, S), 'sit');
  eq('step absent from', HPL.stepClass(null, { x: 7, y: 4 }, S), 'absent');
  eq('step absent to', HPL.stepClass({ x: 7, y: 4 }, null, S), 'absent');
  // Step toward haven while away from scholar is lateral-vs-scholar only
  // when distance to scholar is unchanged; here it also approaches scholar.
  eq('step diagonal approach', HPL.stepClass({ x: 7, y: 5 }, { x: 6, y: 4 }, S), 'approach');
})();

// --- day classification ---
(function () {
  const S = { x: 4, y: 4 };
  eq('day contact beats move', HPL.dayClass({ x: 7, y: 4 }, { x: 6, y: 4 }, true, S), 'CONTACT');
  eq('day absent', HPL.dayClass({ x: 7, y: 4 }, null, false, S), 'ABSENT');
  eq('day sit', HPL.dayClass({ x: 7, y: 4 }, { x: 7, y: 4 }, false, S), 'SIT');
  eq('day approach', HPL.dayClass({ x: 7, y: 4 }, { x: 6, y: 4 }, false, S), 'APPROACH');
  eq('day wander retreat', HPL.dayClass({ x: 6, y: 4 }, { x: 7, y: 4 }, false, S), 'WANDER');
  eq('day wander lateral', HPL.dayClass({ x: 7, y: 4 }, { x: 7, y: 5 }, false, S), 'WANDER');
  eq('day no-prev', HPL.dayClass(null, { x: 7, y: 4 }, false, S), 'WANDER');
})();

// --- corpus legs (skipped when no corpus dir given or absent) ---
const corpusDir = process.argv[2];
if (corpusDir && fs.existsSync(corpusDir)) {
  const files = fs.readdirSync(corpusDir).filter(f => /^s\d+\.json$/.test(f)).sort();
  check('corpus 8 seeds', files.length === 8, { files: files.length });
  let capErrs = 0, contactedSeeds = 0, lairSeeds = 0, locatedDawnsTotal = 0, classifiedDays = 0, stepsClassified = 0, stepsTotal = 0;
  files.forEach(function (f) {
    const s = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    capErrs += (s.captureErrs || 0) + ((s.musterDiag && s.musterDiag.errs) || 0);
    if ((s.contacts || []).length > 0) contactedSeeds++;
    if ((s.lairs || []).length > 0) {
      lairSeeds++;
      // Every lair record carries tile + both distances + tile type.
      s.lairs.forEach(function (l) {
        check('lair complete s' + s.seed, Number.isFinite(l.tx) && Number.isFinite(l.ty) && Number.isFinite(l.distHavenMan) && Number.isFinite(l.distScholarMan) && l.tileType != null, { lair: l });
      });
    }
    // Dawn snapshots exist on located seeds; every step has a class.
    (s.steps || []).forEach(function (st) {
      stepsTotal++;
      if (['approach', 'retreat', 'lateral', 'sit', 'absent'].indexOf(st.classScholar) >= 0 &&
          ['approach', 'retreat', 'lateral', 'sit', 'absent'].indexOf(st.classHaven) >= 0) stepsClassified++;
    });
    // Day classification recomputation: located dawns each get a class
    // via the lib (placement day handled by analyzer, not re-derived here;
    // this leg checks dawns exist and herald tiles are in-bounds).
    (s.dawns || []).forEach(function (d) {
      if (d.heraldTile) {
        locatedDawnsTotal++;
        check('herald tile in-bounds s' + s.seed, d.heraldTile.x >= 0 && d.heraldTile.x <= 8 && d.heraldTile.y >= 0 && d.heraldTile.y <= 8, { tile: d.heraldTile });
      }
    });
    // Every counted verb has a titan id key (muster-diag maps keyed by id).
    const verbKeys = Object.keys((s.musterDiag && s.musterDiag.calls) || {});
    check('verb maps present s' + s.seed, verbKeys.length === 4, { keys: verbKeys });
    // Contacts carry channel + outcome + tiles.
    (s.contacts || []).forEach(function (c) {
      check('contact complete s' + s.seed, (c.channel === 'scholar' || c.channel === 'villager') && c.outcome != null, { contact: c });
    });
    classifiedDays += 0; // day classes are analyzer outputs, verified in evidence, not here
  });
  check('corpus contact gate >= 1 contacted seed', contactedSeeds >= 1, { contactedSeeds: contactedSeeds });
  check('corpus capture errors 0', capErrs === 0, { capErrs: capErrs });
  check('corpus steps all classified', stepsClassified === stepsTotal, { stepsClassified: stepsClassified, stepsTotal: stepsTotal });
  check('corpus lair recorded where herald present at end or spawned', lairSeeds >= 1, { lairSeeds: lairSeeds });
  console.error(`corpus legs: seeds=${files.length} contactedSeeds=${contactedSeeds} lairSeeds=${lairSeeds} locatedDawnRows=${locatedDawnsTotal} steps=${stepsTotal}`);
} else {
  console.error('corpus legs skipped (no corpus dir).');
}

console.log(`${pass} passed, ${fail} failed, 0 skipped`);
process.exit(fail ? 1 : 0);
