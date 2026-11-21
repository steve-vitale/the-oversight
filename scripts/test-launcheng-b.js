// test-launcheng-b.js — proof for arm sim-launcheng-b (DIAG analyzer).
// §1 static (frozen prereg + CORRECTION 2026-11-21, instrument = 2 new
// files only, src diff 0, bid-path files identical between the corpus
// base 1fcd7edba and this base) + §2 analyzer selftest green + §3
// fixture end-to-end through classifyNotBid / classifyChurn on
// synthetic corpora + §4 real-corpus regression (corrected frozen
// totals on band 106241-106248) + §5 judge DIAG-NO-GO (completeness
// fails on the 10 unknown-no-signal zero-row days; binding gate,
// launch accounting and instrument pass).
// No new sims: §4 reads the existing strikeband4 corpora only.
// Usage: node scripts/test-launcheng-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AE = require(path.join(REPO, 'scripts', 'analyze-launcheng-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function git(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); } catch (e) { return null; }
}

// ---- §1 STATIC ----
(function () {
  const prereg = path.join(REPO, 'evidence', '2026-11-20', 'sim-launcheng-b-prereg.md');
  check('§1 prereg exists', fs.existsSync(prereg));
  const text = fs.existsSync(prereg) ? fs.readFileSync(prereg, 'utf8') : '';
  check('§1 prereg freezes the DIAG-GO bar', text.indexOf('DIAG-GO BAR (frozen') !== -1);
  check('§1 prereg decides the §7.3 uncounted-launch question',
    text.indexOf('follow-on hunts COUNT as launches') !== -1);
  check('§1 prereg names the overlap guard', text.indexOf('OVERLAP GUARD') !== -1);
  check('§1 prereg carries the 2026-11-21 day-level CORRECTION (143 -> 141, Taxonomy B\')',
    text.indexOf('CORRECTION 2026-11-21') !== -1 && text.indexOf('Taxonomy B\'') !== -1 &&
    text.indexOf('141 scored not-bid dawns') !== -1);
  const st = git('status --short -- src/js scripts evidence/2026-11-20/sim-launcheng-b.md evidence/2026-11-20/launcheng-b-analysis.json');
  check('§1 src/ clean at proof time', (git('status --short -- src/js') || '') === '', git('status --short -- src/js'));
  const bidDiff = git('diff 1fcd7edba HEAD -- src/js/villager-brain.js src/js/win-plan.js src/js/villager-objectives.js src/js/villager-agency.js');
  check('§1 bid-path files identical between corpus base 1fcd7edba and HEAD', bidDiff === '', (bidDiff || '').slice(0, 200));
  // The analyzer + test are new files on this branch: either still
  // untracked in the worktree (?? in status) or already committed.
  const newSt = git('status --short -- scripts/analyze-launcheng-b.js scripts/test-launcheng-b.js') || '';
  const inHead = git('ls-tree HEAD -- scripts/analyze-launcheng-b.js scripts/test-launcheng-b.js') || '';
  check('§1 analyzer + test are new files on this branch',
    (newSt.indexOf('??') !== -1 && newSt.indexOf('analyze-launcheng-b.js') !== -1 &&
      newSt.indexOf('test-launcheng-b.js') !== -1) ||
    (inHead.indexOf('analyze-launcheng-b.js') !== -1 && inHead.indexOf('test-launcheng-b.js') !== -1),
    { status: newSt, head: inHead });
})();

// ---- §2 ANALYZER SELFTEST ----
check('§2 analyzer selftest green', AE.selftest() === true);

// ---- §3 FIXTURE END-TO-END ----
function mkDoc(over) {
  const base = { seed: 999001, arm: 'strikeband4-b', run: 'strikeband4-b', mode: 'vre',
    policySha: '1884c8852d38aaaa', senseexpedFlag: '1', partysize4Flag: '1',
    vetreengageFlag: '1', fleerepair2Flag: '1', fightally2Flag: '1',
    allyslot3Flag: '1', launchsurviveFlag: '1', allyslot3InSrc: false,
    days: 12, gameDays: 12, endReason: 'survived', standing: 199, scaleRank: 'regional',
    won: false, maxWave: 4, instrumentErrors: [],
    v4seeds: [], dawnbidScores: [], dawnbidDeparts: [], dawnbidCensus: [],
    dawnbidStarts: [], launchdefSkips: [], companionPool: [], v4launchTrack: [],
    v4departs: [], v4gates: [], v4encounters: [], deaths: [], daily: [] };
  return Object.assign(base, over || {});
}
(function () {
  // One not-bid instance: seed d10, two scored dawns d11-12 with
  // party_wait, a midday-only assessed day d13 (part-1 party_wait),
  // pool rows with 0 eligible, census rows at haven. The seed day
  // d10 is a zero-row seed-day.
  const doc = mkDoc({
    days: 13, gameDays: 13,
    v4seeds: [{ day: 10, vid: 'h1', mid: 'algorithm', wave: 4, outcome: 'fled',
      path: 'world-tick', stageAfter: 'party', target: 'algorithm', node: null }],
    dawnbidScores: [11, 12].map(function (d) {
      return { day: d, part: 0, vid: 'h1',
        cands: [{ kind: 'HAVEN_CHORE', w: 4, winPlanAction: 'party_wait' }],
        pick: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' },
        logCands: [{ kind: 'HAVEN_CHORE', score: 4, winPlanAction: 'party_wait' }],
        commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null },
        plan: { stage: 'party', target: 'algorithm', needWave: 4, party: [] },
        holderGear: { armed: true, armored: true } };
    }).concat([{ day: 13, part: 1, vid: 'h1',
      cands: [{ kind: 'HAVEN_CHORE', w: 4, winPlanAction: 'party_wait' }],
      pick: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', corePick: 'VISIT' },
      logCands: [{ kind: 'HAVEN_CHORE', score: 4, winPlanAction: 'party_wait' }],
      commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null },
      plan: { stage: 'party', target: 'algorithm', needWave: 4, party: [] },
      holderGear: { armed: true, armored: true } }]),
    companionPool: [11, 12].map(function (d) {
      return { day: d, part: 0, vid: 'h1', target: 'algorithm', stage: 'party',
        holderProfile: 'forager', holderNode: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 },
        rosterN: 5, counts: { selfOrScholar: 2, dead: 0, away: 1, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 },
        fails: {}, eligible: [], rankedOrder: [], rankedPick: null, rankedVia: 'roster-fallback',
        bidCompanion: null, agree: null, members: [] };
    }),
    dawnbidCensus: [10, 11, 12, 13].map(function (d) {
      return { day: d, vid: 'h1', target: 'algorithm', needWave: 4, stage: 'party',
        party: [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false,
        holderSick: false, holderHealth: 80, holderGear: { armed: true, armored: true } };
    }),
  });
  const LD = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));
  const cls = LD.classifySeed(doc, { launchDefinition: 'any-commit' });
  check('§3 fixture opens exactly 1 instance', cls.instancesOpened === 1, cls.instancesOpened);
  check('§3 fixture instance is candidate-not-bid', cls.instances[0] && cls.instances[0].bucket === 'candidate-not-bid', cls.instances[0] && cls.instances[0].bucket);
  const ctx = AE.buildCtx(doc);
  const enriched = AE.classifyNotBid(doc, cls.instances[0], ctx);
  check('§3 fixture not-bid has 2 scored dawns, both party-no-companion',
    enriched.scoredDawns === 2 && enriched.scoredTally['party-no-companion'] === 2, enriched.scoredTally);
  check('§3 fixture not-bid modal reason is party-no-companion', enriched.reason === 'party-no-companion', enriched.reason);
  check('§3 fixture not-bid has 0 unknown', enriched.unknown === 0, enriched.unknown);
  check('§3 fixture not-bid: 4 instance-days = 3 assessed (2 dawn + 1 midday-only) + 1 zero-row',
    enriched.instanceDays === 4 && enriched.assessedDays === 3 && enriched.dawnDays === 2 &&
    enriched.middayOnlyDays === 1 && enriched.zeroRowDays === 1, enriched);
  check('§3 fixture not-bid zero-row day is the d10 seed-day',
    enriched.zeroRow.length === 1 && enriched.zeroRow[0].day === 10 && enriched.zeroRow[0].reason === 'seed-day', enriched.zeroRow);
  check('§3 fixture not-bid midday-only day d13 is assessed as party-no-companion at part 1',
    enriched.assessed.some(function (a) { return a.day === 13 && a.part === 1 && a.reason === 'party-no-companion'; }), enriched.assessed);
  check('§3 fixture scored-dawn count matches the classifier', enriched.scoredDawnsMatch === true);
  check('§3 fixture pool join: 0 eligible on both dawns',
    enriched.scored.every(function (s) { return s.pool && s.pool.eligible === 0; }));
})();

(function () {
  // One churned instance: seed d10 algorithm, retarget seed d11
  // congregation, no scores; census node off-haven d11. The d12
  // census row keeps the congregation instance open (not churned),
  // and the d10 pool row pins the haven for the off-haven rule.
  const doc = mkDoc({
    v4seeds: [
      { day: 10, vid: 'h1', mid: 'algorithm', wave: 4, outcome: 'fled', path: 'world-tick', stageAfter: 'party', target: 'algorithm', node: null },
      { day: 11, vid: 'h1', mid: 'congregation', wave: 4, outcome: 'fled', path: 'world-tick', stageAfter: 'party', target: 'congregation', node: null },
    ],
    companionPool: [
      { day: 10, part: 0, vid: 'h1', target: 'algorithm', stage: 'party',
        holderProfile: 'forager', holderNode: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 },
        rosterN: 5, counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 3, onExped: 0, eligible: 0 },
        fails: {}, eligible: [], rankedOrder: [], rankedPick: null, rankedVia: 'roster-fallback',
        bidCompanion: null, agree: null, members: [] },
    ],
    dawnbidCensus: [
      { day: 10, vid: 'h1', target: 'algorithm', needWave: 4, stage: 'party', party: [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderSick: false, holderHealth: 80, holderGear: { armed: true, armored: true } },
      { day: 11, vid: 'h1', target: 'congregation', needWave: 4, stage: 'party', party: [], holderAlive: true, holderNode: { nx: 4, ny: 0 }, holderExped: false, holderSick: false, holderHealth: 80, holderGear: { armed: true, armored: true } },
      { day: 12, vid: 'h1', target: 'congregation', needWave: 4, stage: 'party', party: [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderSick: false, holderHealth: 80, holderGear: { armed: true, armored: true } },
    ],
  });
  const LD = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));
  const cls = LD.classifySeed(doc, { launchDefinition: 'any-commit' });
  check('§3 churn fixture opens 2 instances', cls.instancesOpened === 2, cls.instancesOpened);
  const churned = cls.instances.filter(function (x) { return x.bucket === 'plan-churned-before-dawn'; });
  check('§3 churn fixture has 1 churned instance', churned.length === 1, churned.length);
  const ctx = AE.buildCtx(doc);
  const enriched = AE.classifyChurn(doc, churned[0], ctx);
  check('§3 churn closeKind is retargeted', enriched.closeKind === 'retargeted', enriched.closeKind);
  check('§3 churn closing row is the d11 congregation seed',
    enriched.closing.kind === 'retarget-seed-row' && enriched.closing.day === 11 && enriched.closing.target === 'congregation', enriched.closing);
  check('§3 churn zero-row days are d10 seed-day + d11 holder-off-haven',
    enriched.zeroRow.length === 2 &&
    enriched.zeroRow[0].day === 10 && enriched.zeroRow[0].reason === 'seed-day' &&
    enriched.zeroRow[1].day === 11 && enriched.zeroRow[1].reason === 'holder-off-haven', enriched.zeroRow);
  check('§3 churn has 0 unknown', enriched.unknown === 0, enriched.unknown);
})();

// ---- §4 REAL-CORPUS REGRESSION (frozen totals) ----
(function () {
  const band = AE.bandOf(path.join(REPO, 'evidence', '2026-11-20', 'perseed-strikeband4-b-106241-106248'));
  check('§4 real band: 8 files, 0 instrument errors, clean substrate',
    band.files === 8 && band.errors === 0 && band.substrateBadFiles.length === 0,
    { files: band.files, errors: band.errors, substrateBad: band.substrateBadFiles });
  check('§4 real band: 31 instances', band.instancesOpened === 31, band.instancesOpened);
  check('§4 real band: 19 candidate-not-bid', band.notBidInstances === 19, band.notBidInstances);
  check('§4 real band: 7 churned', band.churnInstances === 7, band.churnInstances);
  check('§4 real band: 141 scored not-bid dawns (corrected from 143; see prereg C1)',
    band.scoredNotBidDawns === 141, band.scoredNotBidDawns);
  check('§4 real band: all 141 scored dawns are party-no-companion',
    band.scoredReasons['party-no-companion'] === 141 && Object.keys(band.scoredReasons).length === 1, band.scoredReasons);
  check('§4 real band: 268 instance-days = 223 assessed (141 dawn + 82 midday-only) + 45 zero-row',
    band.instanceDays === 268 && band.assessedNotBidDays === 223 && band.dawnDays === 141 &&
    band.middayOnlyDays === 82 && band.zeroRowNotBidDays === 45,
    { instanceDays: band.instanceDays, assessed: band.assessedNotBidDays, dawn: band.dawnDays,
      middayOnly: band.middayOnlyDays, zeroRow: band.zeroRowNotBidDays });
  check('§4 real band: all 223 assessed days are party-no-companion (226 rows)',
    band.assessedDayReasons['party-no-companion'] === 223 && Object.keys(band.assessedDayReasons).length === 1 &&
    band.assessedRows === 226 && band.middayRows === 85, band.assessedDayReasons);
  check('§4 real band: zero-row reasons sum to 45 with exactly 10 unknown-no-signal',
    band.zeroRowReasons['seed-day'] === 12 && band.zeroRowReasons['holder-scholar'] === 7 &&
    band.zeroRowReasons['retarget-boundary'] === 4 && band.zeroRowReasons['holder-away'] === 4 &&
    band.zeroRowReasons['holder-off-haven'] === 4 && band.zeroRowReasons['field-encounter-day'] === 3 &&
    band.zeroRowReasons['phase-edge'] === 1 && band.zeroRowReasons['unknown-no-signal'] === 10 &&
    band.unknownZeroRowDays === 10, band.zeroRowReasons);
  check('§4 real band: 22 wave-4-target launches, 15 uncounted',
    band.wave4TargetLaunches === 22 && band.uncountedLaunches === 15,
    { wave4: band.wave4TargetLaunches, uncounted: band.uncountedLaunches });
  check('§4 real band: unknown is exactly the 10 unknown-no-signal zero-row days',
    band.unknown === 10, band.unknown);
  check('§4 real band: 0 launch-no-start-call, 0 uncounted-no-copy-link',
    band.launchNoStartCall === 0 && band.uncountedNoCopyLink === 0,
    { noStart: band.launchNoStartCall, noCopy: band.uncountedNoCopyLink });
  check('§4 real band: scored-dawn counts match the classifier on every instance',
    band.scoredDawnsMismatch === 0, band.scoredDawnsMismatch);
  check('§4 real band: wall numbers match strikeband4 §4',
    band.wall.wins === 0 && band.wall.nationalRank === 0 && band.wall.nationalStanding === 3 &&
    band.wall.wave5 === 3 && band.wall.wave4 === 8 && band.wall.medianDays === 142.5 &&
    band.wall.deaths === 758 && band.wall.starvation === 3 && band.wall.standing199 === 4,
    band.wall);
})();

// ---- §5 JUDGE ----
(function () {
  const band = AE.bandOf(path.join(REPO, 'evidence', '2026-11-20', 'perseed-strikeband4-b-106241-106248'));
  const j = AE.judge(band);
  check('§5 judge is DIAG-NO-GO (completeness fails on the 10 unknown-no-signal days)',
    j.go === false && j.verdict === 'DIAG-NO-GO', j);
  check('§5 completeness FAILS with unknown exactly 10',
    j.bars.completeness.pass === false && j.bars.completeness.unknown === 10, j.bars.completeness);
  check('§5 binding gate PASSES: party-no-companion on 223/223 assessed days',
    j.bars.bindingGate.pass === true && j.bars.bindingGate.gate === 'party-no-companion' &&
    j.bars.bindingGate.count === 223, j.bars.bindingGate);
  check('§5 launch accounting PASSES',
    j.bars.launchAccounting.pass === true, j.bars.launchAccounting);
  check('§5 instrument PASSES (corrected frozen totals reproduce)',
    j.bars.instrument.pass === true && j.bars.instrument.totalsOk === true, j.bars.instrument);
})();

console.log('test-launcheng-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
