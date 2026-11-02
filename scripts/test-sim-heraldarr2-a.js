// test-sim-heraldarr2-a.js — proof test for the Herald raid-pin instrument.
//   node scripts/test-sim-heraldarr2-a.js                          (synthetic only)
//   node scripts/test-sim-heraldarr2-a.js <corpusDir> <analysisJson> (synthetic + corpus legs)
//   node scripts/test-sim-heraldarr2-a.js <corpusDir> <analysisJson> <expectedSeedCount>
//     (same legs, but the corpus-size leg asserts exact equality to the
//     passed count instead of the default 8 — a confirm band is not an
//     8-seed pilot, and the old hardcoded leg failed by construction on
//     16-seed corpora. Default 8 preserves the old behavior exactly;
//     no assertion is loosened: the leg still asserts exact equality.)
// Exits non-zero on any failure. Prints "N passed, 0 failed" on green.
'use strict';
const fs = require('fs');
const path = require('path');
const HAL = require(path.join(__dirname, 'sim-heraldarr2-a-lib'));

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (detail ? ' :: ' + JSON.stringify(detail) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- Synthetic: v2 regression (derived lib intact) ----
check('branch-enter-string-follows', HAL.predictTravelBranch({ scholarMoved: true, hadOldMonster: true, follows: 'it does not follow. It precedes.', destOccupied: false, destSafe: false }) === 'followEnter');
check('attr-raid-chain', (() => {
  const a = HAL.attributeWindow({ x: 6, y: 4 }, { x: 4, y: 4 }, [{ from: { x: 6, y: 4 }, to: { x: 4, y: 4 }, cls: 'raidPin' }]);
  return a.attributed === true && a.landingCls === 'raidPin';
})());
check('attr-linger-chain', (() => {
  const a = HAL.attributeWindow({ x: 6, y: 4 }, { x: 4, y: 4 }, [{ from: { x: 6, y: 4 }, to: { x: 4, y: 4 }, cls: 'lingerPin' }]);
  return a.attributed === true && a.landingCls === 'lingerPin';
})());

// ---- Synthetic: classifyRaidCall ----
function raidPre(o) {
  return Object.assign({
    over: false, tableActive: false, day: 100, lastRaidDay: 90, cooldown: 7,
    livingCount: 4, pantry: 5000, sortedIds: ['hushpuppy', 'herald', 'bulldozer', 'moth'],
    raidN: 3, heraldRank: 1, heraldPresent: true,
  }, o);
}
function raidPost(o) { return Object.assign({ lastRaidDay: 90 }, o); }
check('raid-blocked-over', (() => {
  const r = HAL.classifyRaidCall(raidPre({ over: true, tableActive: true }), raidPost(), false);
  return r.cls === 'blocked-over' && r.heraldStatus === 'gate-or-roll' && r.draftedIds.length === 0;
})());
check('raid-blocked-table', (() => {
  const r = HAL.classifyRaidCall(raidPre({ tableActive: true }), raidPost(), false);
  return r.cls === 'blocked-table' && r.heraldStatus === 'gate-or-roll';
})());
check('raid-blocked-cooldown', (() => {
  const r = HAL.classifyRaidCall(raidPre({ day: 95, lastRaidDay: 90 }), raidPost(), false);
  return r.cls === 'blocked-cooldown';
})());
check('raid-cooldown-boundary-passes', (() => {
  const r = HAL.classifyRaidCall(raidPre({ day: 97, lastRaidDay: 90 }), raidPost(), false);
  return r.cls === 'roll-miss';
})());
check('raid-blocked-few', (() => {
  const r = HAL.classifyRaidCall(raidPre({ livingCount: 2 }), raidPost(), false);
  return r.cls === 'blocked-few';
})());
check('raid-blocked-pantry', (() => {
  const r = HAL.classifyRaidCall(raidPre({ pantry: 2999 }), raidPost(), false);
  return r.cls === 'blocked-pantry';
})());
check('raid-pantry-boundary-passes', (() => {
  const r = HAL.classifyRaidCall(raidPre({ pantry: 3000 }), raidPost(), false);
  return r.cls === 'roll-miss';
})());
check('raid-roll-miss', (() => {
  const r = HAL.classifyRaidCall(raidPre(), raidPost(), false);
  return r.cls === 'roll-miss' && r.heraldStatus === 'gate-or-roll' && r.draftedIds.length === 0;
})());
check('raid-draft-herald-drafted', (() => {
  const r = HAL.classifyRaidCall(raidPre(), raidPost({ lastRaidDay: 100 }), false);
  return r.cls === 'draft' && r.heraldStatus === 'drafted' && eq(r.draftedIds, ['hushpuppy', 'herald', 'bulldozer']);
})());
check('raid-draft-rank-missed', (() => {
  const r = HAL.classifyRaidCall(raidPre({ sortedIds: ['hushpuppy', 'bulldozer', 'moth', 'herald'], heraldRank: 3, raidN: 3 }), raidPost({ lastRaidDay: 100 }), false);
  return r.cls === 'draft' && r.heraldStatus === 'rank-missed' && r.draftedIds.indexOf('herald') === -1;
})());
check('raid-draft-absent', (() => {
  const r = HAL.classifyRaidCall(raidPre({ heraldPresent: false, heraldRank: null, sortedIds: ['hushpuppy', 'bulldozer', 'moth'] }), raidPost({ lastRaidDay: 100 }), false);
  return r.cls === 'draft' && r.heraldStatus === 'absent';
})());
check('raid-unknown-on-read-err', (() => {
  const r = HAL.classifyRaidCall(raidPre({ pantry: null }), raidPost(), true);
  return r.cls === 'unknown' && r.heraldStatus === 'unknown';
})());
check('raid-raidN-cap-5', (() => {
  const r = HAL.classifyRaidCall(raidPre({ sortedIds: ['a', 'b', 'c', 'd', 'herald', 'f'], raidN: 5, heraldRank: 4 }), raidPost({ lastRaidDay: 100 }), false);
  return r.draftedIds.length === 5 && r.heraldStatus === 'drafted';
})());

// ---- Synthetic: classifyLingerPin ----
check('linger-moved', (() => {
  const r = HAL.classifyLingerPin({ lingering: true, tile: { x: 6, y: 4 }, havenTile: { x: 4, y: 4 }, lingerSince: 100, day: 103, tableActive: false }, { lingering: true, tile: { x: 4, y: 4 } });
  return r.cls === 'repin-moved' && r.gorgeSkipped === false;
})());
check('linger-held', (() => {
  const r = HAL.classifyLingerPin({ lingering: true, tile: { x: 4, y: 4 }, havenTile: { x: 4, y: 4 }, lingerSince: 100, day: 103, tableActive: false }, { lingering: true, tile: { x: 4, y: 4 } });
  return r.cls === 'repin-held';
})());
check('linger-drift-cleared', (() => {
  const r = HAL.classifyLingerPin({ lingering: true, tile: { x: 4, y: 4 }, havenTile: { x: 4, y: 4 }, lingerSince: 100, day: 107, tableActive: false }, { lingering: false, tile: { x: 4, y: 4 } });
  return r.cls === 'repin-drift-cleared';
})());
check('linger-not-lingering', (() => {
  const r = HAL.classifyLingerPin({ lingering: false, tile: { x: 6, y: 4 }, havenTile: { x: 4, y: 4 }, lingerSince: null, day: 103, tableActive: false }, { lingering: false, tile: { x: 6, y: 4 } });
  return r.cls === 'not-lingering';
})());
check('linger-unexpected-off-haven', (() => {
  const r = HAL.classifyLingerPin({ lingering: true, tile: { x: 6, y: 4 }, havenTile: { x: 4, y: 4 }, lingerSince: 100, day: 103, tableActive: false }, { lingering: true, tile: { x: 6, y: 4 } });
  return r.cls === 'repin-unexpected';
})());
check('linger-table-gorge-skipped', (() => {
  const r = HAL.classifyLingerPin({ lingering: true, tile: { x: 4, y: 4 }, havenTile: { x: 4, y: 4 }, lingerSince: 100, day: 103, tableActive: true }, { lingering: true, tile: { x: 4, y: 4 } });
  return r.cls === 'repin-held' && r.gorgeSkipped === true;
})());

// ---- Corpus legs (only when a corpus dir + analysis file are passed) ----
const corpusDir = process.argv[2];
const analysisPath = process.argv[3];
if (corpusDir && analysisPath) {
  const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json')).sort();
  // Corpus-size leg, parameterized (heraldkill-a fix): optional 4th argv
  // is the exact expected seed count; default 8 preserves prior behavior.
  // The assertion stays an exact equality — nothing is loosened.
  const expectedSeeds = process.argv[4] ? parseInt(process.argv[4], 10) : 8;
  check('corpus-has-' + expectedSeeds + '-seeds', files.length === expectedSeeds, { files: files });
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  check('analysis-seed-count-matches', analysis.seeds === files.length, { analysisSeeds: analysis.seeds, files: files.length });
  for (const f of files) {
    const s = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    check('corpus-' + s.seed + '-instrument', s.instrument === 'heraldarr2-a-v1', { seed: s.seed, instrument: s.instrument });
    check('corpus-' + s.seed + '-capture-clean', s.captureErrs === 0, { seed: s.seed, errs: s.captureErrors });
    check('corpus-' + s.seed + '-has-end-fields', s.endReason != null && s.gameDays != null && s.endScaleRank != null, { seed: s.seed });
    // Bar 2: every raid call carries exactly one draft record; no unknowns.
    check('corpus-' + s.seed + '-raid-records-complete', (s.raidDrafts || []).length === s.raidCalls, { seed: s.seed, records: (s.raidDrafts || []).length, calls: s.raidCalls });
    let unknownRaids = 0;
    for (const r of (s.raidDrafts || [])) {
      if (r.cls === 'unknown') { unknownRaids++; continue; }
      if (r.reason === 'pre-state-failed') { unknownRaids++; continue; }
      const recomputed = HAL.classifyRaidCall(
        { over: r.over, tableActive: r.tableActive, day: r.day, lastRaidDay: r.lastRaidDayBefore,
          cooldown: r.cooldown, livingCount: r.livingCount, pantry: r.pantry,
          sortedIds: r.sortedIds, raidN: r.raidN, heraldRank: r.heraldRank,
          heraldPresent: r.heraldRank !== null },
        { lastRaidDay: r.lastRaidDayAfter }, false);
      check('corpus-' + s.seed + '-raid-reclass-agrees-' + r.day + '-' + r.cls,
        recomputed.cls === r.cls && recomputed.heraldStatus === r.heraldStatus && eq(recomputed.draftedIds, r.draftedIds),
        { seed: s.seed, day: r.day, stored: r.cls + '/' + r.heraldStatus, recomputed: recomputed.cls + '/' + recomputed.heraldStatus });
    }
    check('corpus-' + s.seed + '-raid-unknown-zero', unknownRaids === 0, { seed: s.seed, unknownRaids: unknownRaids });
    // Bar 3: every lingering-at-entry daily call has a linger record.
    const lingerDays = new Set((s.lingerPins || []).map(lp => lp.day));
    const missing = (s.dailyObs || []).filter(o => o.heraldLingering && !o.over && !lingerDays.has(o.day)).map(o => o.day);
    check('corpus-' + s.seed + '-linger-records-complete', missing.length === 0, { seed: s.seed, missing: missing });
    for (const lp of (s.lingerPins || [])) {
      if (lp.cls === 'skipped-over') continue;
      const recomputed = HAL.classifyLingerPin(
        { lingering: true, tile: lp.tileBefore, havenTile: lp.havenTile, lingerSince: lp.lingerSince, day: lp.day, tableActive: lp.tableActive },
        { lingering: lp.lingeringAfter, tile: lp.tileAfter });
      check('corpus-' + s.seed + '-linger-reclass-agrees-' + lp.day + '-' + lp.cls,
        recomputed.cls === lp.cls, { seed: s.seed, day: lp.day, stored: lp.cls, recomputed: recomputed.cls });
    }
    // v2 sweep emits no travelTo-diff move events (double-count source).
    const forbiddenKinds = (s.moves || []).filter(m => ['travelOther', 'travelRemove', 'travelAppear'].indexOf(m.kind) >= 0);
    check('corpus-' + s.seed + '-no-v1-duplicate-kinds', forbiddenKinds.length === 0, { seed: s.seed, forbidden: forbiddenKinds });
    const perSeed = (analysis.perSeed || []).find(p => p.seed === s.seed);
    check('corpus-' + s.seed + '-in-analysis', !!perSeed, { seed: s.seed });
    if (perSeed) {
      check('corpus-' + s.seed + '-contact-count-agrees', perSeed.contacts === (s.contacts || []).length, { seed: s.seed });
      check('corpus-' + s.seed + '-raid-count-agrees', perSeed.raidDraftRecords === (s.raidDrafts || []).length, { seed: s.seed });
      check('corpus-' + s.seed + '-linger-missing-agrees', perSeed.lingerMissingDays.length === missing.length, { seed: s.seed });
      // Re-derive haven windows from dawns and compare landing classes.
      const derived = [];
      for (let i = 1; i < (s.dawns || []).length; i++) {
        const prev = s.dawns[i - 1], cur = s.dawns[i];
        if (!cur.heraldTile) continue;
        if (!HAL.sameTile(cur.heraldTile, cur.havenTile)) continue;
        if (prev.heraldTile && HAL.sameTile(prev.heraldTile, cur.havenTile)) continue;
        derived.push({ fromDawn: prev.day, toDawn: cur.day });
      }
      check('corpus-' + s.seed + '-haven-window-count-agrees', perSeed.havenWindows.length === derived.length,
        { seed: s.seed, analysis: perSeed.havenWindows.length, derived: derived.length });
    }
  }
}

if (failed > 0) {
  console.error(failures.slice(0, 40).join('\n'));
  console.error(passed + ' passed, ' + failed + ' failed');
  process.exit(1);
}
console.log(passed + ' passed, 0 failed');
