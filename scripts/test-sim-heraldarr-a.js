// test-sim-heraldarr-a.js — proof test for the Herald arrival instrument.
//   node scripts/test-sim-heraldarr-a.js                          (synthetic only)
//   node scripts/test-sim-heraldarr-a.js <corpusDir> <analysisJson> (synthetic + corpus legs)
// Exits non-zero on any failure. Prints "N passed, 0 failed" on green.
'use strict';
const fs = require('fs');
const path = require('path');
const HAL = require(path.join(__dirname, 'sim-heraldarr-a-lib'));

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (detail ? ' :: ' + JSON.stringify(detail) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- Synthetic: travel branch prediction ----
check('branch-noTravel', HAL.predictTravelBranch({ scholarMoved: false, hadOldMonster: true, follows: true, destOccupied: false, destSafe: false }) === 'noTravel');
check('branch-noOldMonster', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: false, follows: true, destOccupied: false, destSafe: false }) === 'noOldMonster');
check('branch-notFollows-false', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: false, destOccupied: false, destSafe: false }) === 'oldMonsterNotFollows');
check('branch-notFollows-undef', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: undefined, destOccupied: false, destSafe: false }) === 'oldMonsterNotFollows');
check('branch-notFollows-empty-string', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: '', destOccupied: false, destSafe: false }) === 'oldMonsterNotFollows');
check('branch-blockedOccupied', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: true, destOccupied: true, destSafe: false }) === 'followBlockedOccupied');
check('branch-holdSafe', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: true, destOccupied: false, destSafe: true }) === 'followHoldSafe');
check('branch-enter-bool', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: true, destOccupied: false, destSafe: false }) === 'followEnter');
// The herald quirk: a non-empty string is truthy, so the follow branch fires.
check('branch-enter-string-follows', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: 'it does not follow. It precedes.', destOccupied: false, destSafe: false }) === 'followEnter');
check('branch-holdSafe-string-follows', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: 'it does not follow. It precedes.', destOccupied: false, destSafe: true }) === 'followHoldSafe');

// ---- Synthetic: travel mismatch ----
check('mismatch-enter-lands', HAL.travelMismatch('followEnter', { x: 6, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 4 }) === null);
check('mismatch-enter-misses', HAL.travelMismatch('followEnter', { x: 6, y: 4 }, { x: 6, y: 4 }, { x: 4, y: 4 }) === 'followEnterDidNotLand');
check('mismatch-hold-stays', HAL.travelMismatch('followHoldSafe', { x: 5, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 4 }) === null);
check('mismatch-hold-moves', HAL.travelMismatch('followHoldSafe', { x: 5, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 4 }) === 'movedDespiteHold');
check('mismatch-removed', HAL.travelMismatch('followHoldSafe', { x: 5, y: 4 }, null, { x: 4, y: 4 }) === 'removedDuringTravel');
check('mismatch-appeared', HAL.travelMismatch('noOldMonster', null, { x: 4, y: 4 }, { x: 4, y: 4 }) === 'appearedDuringTravel');
check('mismatch-none-absent', HAL.travelMismatch('noOldMonster', null, null, { x: 4, y: 4 }) === null);

// ---- Synthetic: attribution chains ----
check('attr-no-change', eq(HAL.attributeWindow({ x: 7, y: 4 }, { x: 7, y: 4 }, []), { attributed: true, landingCls: null, reason: 'no-change-no-events' }));
check('attr-follow-chain', (() => {
  const a = HAL.attributeWindow({ x: 6, y: 4 }, { x: 4, y: 4 }, [{ from: { x: 6, y: 4 }, to: { x: 4, y: 4 }, cls: 'followEnter' }]);
  return a.attributed === true && a.landingCls === 'followEnter';
})());
check('attr-raid-chain', (() => {
  const a = HAL.attributeWindow({ x: 6, y: 4 }, { x: 4, y: 4 }, [{ from: { x: 6, y: 4 }, to: { x: 4, y: 4 }, cls: 'raidPin' }]);
  return a.attributed === true && a.landingCls === 'raidPin';
})());
check('attr-multi-step', (() => {
  const a = HAL.attributeWindow({ x: 7, y: 4 }, { x: 4, y: 4 }, [
    { from: { x: 7, y: 4 }, to: { x: 6, y: 4 }, cls: 'wander' },
    { from: { x: 6, y: 4 }, to: { x: 4, y: 4 }, cls: 'raidPin' },
  ]);
  return a.attributed === true && a.landingCls === 'raidPin';
})());
check('attr-gap', (() => {
  const a = HAL.attributeWindow({ x: 6, y: 4 }, { x: 4, y: 4 }, [{ from: { x: 5, y: 4 }, to: { x: 4, y: 4 }, cls: 'wander' }]);
  return a.attributed === false && a.reason === 'chain-gap-at-event-0';
})());
check('attr-no-events-change', (() => {
  const a = HAL.attributeWindow({ x: 6, y: 4 }, { x: 4, y: 4 }, []);
  return a.attributed === false && a.reason === 'tile-changed-no-events';
})());
check('attr-spawn-from-absent', (() => {
  const a = HAL.attributeWindow(null, { x: 7, y: 4 }, [{ from: null, to: { x: 7, y: 4 }, cls: 'spawn' }]);
  return a.attributed === true && a.landingCls === 'spawn';
})());
check('attr-lateral-case', (() => {
  // A wander step that keeps Manhattan distance but changes tile still
  // chains (attribution is about tile continuity, not approach class).
  const a = HAL.attributeWindow({ x: 7, y: 4 }, { x: 7, y: 3 }, [{ from: { x: 7, y: 4 }, to: { x: 7, y: 3 }, cls: 'wander' }]);
  return a.attributed === true && a.landingCls === 'wander';
})());

// ---- Corpus legs (only when a corpus dir + analysis file are passed) ----
const corpusDir = process.argv[2];
const analysisPath = process.argv[3];
if (corpusDir && analysisPath) {
  const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json')).sort();
  check('corpus-has-8-seeds', files.length === 8, { files: files });
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  check('analysis-seed-count-matches', analysis.seeds === files.length, { analysisSeeds: analysis.seeds, files: files.length });
  for (const f of files) {
    const s = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    check('corpus-' + s.seed + '-capture-clean', s.captureErrs === 0, { seed: s.seed, errs: s.captureErrors });
    check('corpus-' + s.seed + '-has-end-fields', s.endReason != null && s.gameDays != null && s.endScaleRank != null, { seed: s.seed });
    check('corpus-' + s.seed + '-has-dawns-or-unlocated', Array.isArray(s.dawns), { seed: s.seed });
    // Recompute travel mismatches from the records and compare counts.
    let recomputed = 0;
    for (const t of (s.travelEvents || [])) {
      if (!t.oldMonsterId) continue;
      if (t.mismatch) recomputed++;
      // Cross-check the stored mismatch against the lib's own verdict
      // when the herald sat on the from-tile (the case the lib judges).
      if (t.heraldBefore && HAL.sameTile(t.heraldBefore, t.from)) {
        const want = HAL.travelMismatch(t.branch, t.heraldBefore, t.heraldAfter, t.dest);
        check('corpus-' + s.seed + '-mismatch-agrees-' + t.day + '-' + t.branch, (want === null) === (t.mismatch === null), { day: t.day, branch: t.branch, stored: t.mismatch, recomputed: want });
      }
    }
    const perSeed = (analysis.perSeed || []).find(p => p.seed === s.seed);
    check('corpus-' + s.seed + '-in-analysis', !!perSeed, { seed: s.seed });
    if (perSeed) {
      check('corpus-' + s.seed + '-mismatch-count-agrees', perSeed.mismatches.length === recomputed, { seed: s.seed, analysis: perSeed.mismatches.length, recomputed: recomputed });
      check('corpus-' + s.seed + '-contact-count-agrees', perSeed.contacts === (s.contacts || []).length, { seed: s.seed });
      // Re-derive haven windows from dawns and compare landing classes.
      const derived = [];
      for (let i = 1; i < (s.dawns || []).length; i++) {
        const prev = s.dawns[i - 1], cur = s.dawns[i];
        if (!cur.heraldTile) continue;
        if (!HAL.sameTile(cur.heraldTile, cur.havenTile)) continue;
        if (prev.heraldTile && HAL.sameTile(prev.heraldTile, cur.havenTile)) continue;
        derived.push({ fromDawn: prev.day, toDawn: cur.day });
      }
      check('corpus-' + s.seed + '-haven-window-count-agrees', perSeed.havenWindows.length === derived.length, { seed: s.seed, analysis: perSeed.havenWindows.length, derived: derived.length });
      for (let i = 0; i < derived.length; i++) {
        check('corpus-' + s.seed + '-haven-window-' + i + '-days-agree',
          perSeed.havenWindows[i] && perSeed.havenWindows[i].fromDawn === derived[i].fromDawn && perSeed.havenWindows[i].toDawn === derived[i].toDawn,
          { seed: s.seed, i: i, analysis: perSeed.havenWindows[i], derived: derived[i] });
      }
    }
  }
  // Pooled cross-checks.
  const pooled = analysis.pooled || {};
  const sumSeeds = (analysis.perSeed || []).length;
  check('pooled-contacted-plus-unfaced-plus-never', pooled.contactedSeeds + pooled.locatedUnfacedSeeds + pooled.neverLocatedSeeds === sumSeeds,
    { pooled: pooled, sumSeeds: sumSeeds });
}

console.log(passed + ' passed, ' + failed + ' failed' + (failed ? '\nFAILURES:\n' + failures.join('\n') : ''));
process.exit(failed ? 1 : 0);
