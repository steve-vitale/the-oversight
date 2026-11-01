// test-sim-heraldarr2follow-a.js — proof test for the Herald follow-up instrument.
//   node scripts/test-sim-heraldarr2follow-a.js                          (synthetic only)
//   node scripts/test-sim-heraldarr2follow-a.js <corpusDir> <analysisJson> (synthetic + corpus legs)
//   node scripts/test-sim-heraldarr2follow-a.js --old-corpus <oldCorpusDir>
//       (synthetic + old-corpus re-analysis leg: the NEW analyzer over the
//        heraldarr2-a pilot corpus must attribute day-120/day-121 windows
//        and reclassify all 11 pilot mismatches as nestedWander)
// Exits non-zero on any failure. Prints "N passed, 0 failed" on green.
'use strict';
const fs = require('fs');
const path = require('path');
const HAL = require(path.join(__dirname, 'sim-heraldarr2follow-a-lib'));

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

// ---- Synthetic: linkChain (order-independent) ----
// The 95404 day-120 shape, in shuffled raw order: wander pushed
// during travelTo precedes the follow legs pushed after it.
check('link-day120-shape-shuffled', (() => {
  const r = HAL.linkChain({ x: 4, y: 4 }, { x: 3, y: 3 }, [
    { from: { x: 3, y: 4 }, to: { x: 3, y: 3 }, cls: 'wander' },
    { from: { x: 4, y: 4 }, to: { x: 4, y: 3 }, cls: 'followEnter' },
    { from: { x: 4, y: 3 }, to: { x: 3, y: 4 }, cls: 'followEnter' },
  ]);
  return r.attributed === true && r.landingCls === 'wander' &&
    JSON.stringify(r.chain.map(e => e.cls)) === JSON.stringify(['followEnter', 'followEnter', 'wander']);
})());
check('link-gap-fails', (() => {
  const r = HAL.linkChain({ x: 4, y: 4 }, { x: 3, y: 3 }, [
    { from: { x: 3, y: 4 }, to: { x: 3, y: 3 }, cls: 'wander' },
  ]);
  return r.attributed === false;
})());
check('link-spawn-from-null', (() => {
  const r = HAL.linkChain(null, { x: 7, y: 4 }, [
    { from: null, to: { x: 7, y: 4 }, cls: 'spawn' },
  ]);
  return r.attributed === true && r.landingCls === 'spawn';
})());
check('link-leftover-event-fails', (() => {
  const r = HAL.linkChain({ x: 4, y: 4 }, { x: 4, y: 3 }, [
    { from: { x: 4, y: 4 }, to: { x: 4, y: 3 }, cls: 'followEnter' },
    { from: { x: 4, y: 3 }, to: { x: 3, y: 3 }, cls: 'wander' },
  ]);
  return r.attributed === false;
})());

// ---- Synthetic: splitFollow / splitRaidNet / reclassifyTravel / twin ----
check('splitFollow-decomposes', (() => {
  const t = { day: 120, branch: 'followEnter', mismatch: 'followEnterDidNotLand', dest: { x: 3, y: 4 }, heraldBefore: { x: 4, y: 3 }, heraldAfter: { x: 3, y: 3 } };
  const s = HAL.splitFollow(t, [{ day: 120, kind: 'wander', from: { x: 3, y: 4 }, to: { x: 3, y: 3 } }]);
  return !!s && eq(s.leg, { from: { x: 4, y: 3 }, to: { x: 3, y: 4 }, cls: 'followEnter' });
})());
check('splitFollow-no-prim-no-split', (() => {
  const t = { day: 120, branch: 'followEnter', mismatch: 'followEnterDidNotLand', dest: { x: 3, y: 4 }, heraldBefore: { x: 4, y: 3 }, heraldAfter: { x: 3, y: 3 } };
  return HAL.splitFollow(t, [{ day: 120, kind: 'wander', from: { x: 5, y: 5 }, to: { x: 3, y: 3 } }]) === null;
})());
check('splitRaidNet-landing', (() => {
  const m = { kind: 'raidPin', day: 121, from: { x: 4, y: 3 }, to: { x: 3, y: 5 } };
  const s = HAL.splitRaidNet(m, [{ day: 121, heraldDraftMovedOff: true }], [{ kind: 'mFleeMove', day: 121, from: { x: 4, y: 4 }, to: { x: 3, y: 5 } }]);
  return !!s && eq(s, { from: { x: 4, y: 3 }, to: { x: 4, y: 4 }, cls: 'raidPin' });
})());
check('splitRaidNet-no-movedoff-no-split', (() => {
  const m = { kind: 'raidPin', day: 121, from: { x: 4, y: 3 }, to: { x: 4, y: 4 } };
  return HAL.splitRaidNet(m, [{ day: 121, heraldDraftMovedOff: false }], []) === null;
})());
check('reclassify-follow-nested', (() => {
  const t = { day: 120, branch: 'followEnter', mismatch: 'followEnterDidNotLand', dest: { x: 3, y: 4 }, heraldBefore: { x: 4, y: 3 }, heraldAfter: { x: 3, y: 3 } };
  const r = HAL.reclassifyTravel(t, [{ day: 120, kind: 'wander', from: { x: 3, y: 4 }, to: { x: 3, y: 3 } }]);
  return !!r && r.reclass === 'nestedWander';
})());
check('reclassify-hold-nested', (() => {
  const t = { day: 110, branch: 'followBlockedOccupied', mismatch: 'movedDespiteHold', dest: { x: 4, y: 3 }, heraldBefore: { x: 4, y: 4 }, heraldAfter: { x: 5, y: 4 } };
  const r = HAL.reclassifyTravel(t, [{ day: 110, kind: 'wander', from: { x: 4, y: 4 }, to: { x: 5, y: 4 } }]);
  return !!r && r.reclass === 'nestedWander';
})());
check('reclassify-no-explainer-stays', (() => {
  const t = { day: 110, branch: 'followBlockedOccupied', mismatch: 'movedDespiteHold', dest: { x: 4, y: 3 }, heraldBefore: { x: 4, y: 4 }, heraldAfter: { x: 5, y: 4 } };
  return HAL.reclassifyTravel(t, [{ day: 110, kind: 'wander', from: { x: 1, y: 1 }, to: { x: 5, y: 4 } }]) === null;
})());
check('twin-explained-dup', HAL.isTwinExplained('eulogy', ['herald', 'eulogy', 'strike', 'eulogy']) === true);
check('twin-explained-unique-false', HAL.isTwinExplained('eulogy', ['herald', 'eulogy', 'strike']) === false);

// ---- Corpus legs (only when a corpus dir + analysis file are passed) ----
const corpusDir = process.argv[2];
const analysisPath = process.argv[3];
if (corpusDir && analysisPath && corpusDir !== '--old-corpus') {
  const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json')).sort();
  check('corpus-has-8-seeds', files.length === 8, { files: files });
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  check('analysis-seed-count-matches', analysis.seeds === files.length, { analysisSeeds: analysis.seeds, files: files.length });
  for (const f of files) {
    const s = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    check('corpus-' + s.seed + '-instrument', s.instrument === 'heraldarr2follow-a-v1', { seed: s.seed, instrument: s.instrument });
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
    // NEW: stepwise followEnter rows cover every tracked followEnter travel.
    for (const t of (s.travelEvents || [])) {
      if (t.oldMonsterId !== 'herald' || t.branch !== 'followEnter') continue;
      if (!t.heraldBefore || !t.dest || HAL.sameTile(t.heraldBefore, t.dest)) continue;
      const row = (s.moves || []).find(m => m.kind === 'followEnter' && m.day === t.day && HAL.sameTile(m.from, t.heraldBefore) && HAL.sameTile(m.to, t.dest));
      check('corpus-' + s.seed + '-followEnter-row-' + t.day, !!row, { seed: s.seed, day: t.day, before: t.heraldBefore, dest: t.dest });
    }
    // NEW: stepwise raidPin rows + reference-snapshot draftedPostList.
    for (const r of (s.raidDrafts || [])) {
      if (r.cls !== 'draft') continue;
      if (r.draftedPostList) {
        check('corpus-' + s.seed + '-draftedPostList-length-' + r.day, r.draftedPostList.length === (r.draftedIds || []).length, { seed: s.seed, day: r.day, list: r.draftedPostList.length, ids: (r.draftedIds || []).length });
        for (const e of r.draftedPostList) {
          if (e.present) check('corpus-' + s.seed + '-draftedPostList-raidBorn-' + r.day + '-' + e.id, e.raidBorn === true, { seed: s.seed, day: r.day, entry: e });
        }
      }
      if (r.heraldStatus === 'drafted' && r.heraldTileBefore) {
        const hv = (s.dawns || []).find(d => d.day === r.day);
        // Haven tile from the raid record itself is not stored; use the
        // first dawn's haven tile as the haven reference (constant 4,4
        // on this stack, read from data, never assumed in the check
        // beyond the dawn record).
        const haven = hv ? hv.havenTile : null;
        if (haven && !HAL.sameTile(r.heraldTileBefore, haven)) {
          const row = (s.moves || []).find(m => m.kind === 'raidPin' && m.day === r.day && HAL.sameTile(m.from, r.heraldTileBefore) && HAL.sameTile(m.to, haven));
          check('corpus-' + s.seed + '-raidPin-stepwise-' + r.day, !!row, { seed: s.seed, day: r.day, before: r.heraldTileBefore, haven: haven });
        }
      }
    }
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

// ---- Old-corpus re-analysis leg (only with --old-corpus <oldDir>) ----
if (process.argv[2] === '--old-corpus' && process.argv[3]) {
  const os = require('os');
  const { execSync } = require('child_process');
  const oldDir = process.argv[3];
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heraldarr2follow-old-'));
  const tmpOut = path.join(tmpDir, 'analysis.json');
  try {
    execSync('node ' + path.join(__dirname, 'sim-heraldarr2follow-a-analyze.js') + ' ' + oldDir + ' ' + tmpOut, { stdio: 'pipe' });
    const oldAnalysis = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
    check('old-corpus-seeds-8', oldAnalysis.seeds === 8, { seeds: oldAnalysis.seeds });
    check('old-corpus-unattributed-zero', (oldAnalysis.pooled.unattributedWindows || []).length === 0, { unattributed: oldAnalysis.pooled.unattributedWindows });
    const p95404 = (oldAnalysis.perSeed || []).find(p => p.seed === 95404);
    check('old-corpus-95404-unattributed-zero', !!p95404 && p95404.unattributed.length === 0, { seed: 95404, unattributed: p95404 ? p95404.unattributed : null });
    check('old-corpus-mismatches-all-nested', oldAnalysis.pooled.totalUnexplainedMismatches === 0 && oldAnalysis.pooled.totalNestedWander === oldAnalysis.pooled.totalMismatches, { total: oldAnalysis.pooled.totalMismatches, nested: oldAnalysis.pooled.totalNestedWander, unexplained: oldAnalysis.pooled.totalUnexplainedMismatches });
    check('old-corpus-mismatches-11', oldAnalysis.pooled.totalMismatches === 11, { total: oldAnalysis.pooled.totalMismatches });
  } catch (e) {
    check('old-corpus-analyzer-runs', false, { error: String((e && e.message) || e).slice(0, 300) });
  }
}

if (failed > 0) {
  console.error(failures.slice(0, 40).join('\n'));
  console.error(passed + ' passed, ' + failed + ' failed');
  process.exit(1);
}
console.log(passed + ' passed, 0 failed');
