// test-companionpool-b.js — proof for arm sim-companionpool-b (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seed call's presence matches COMPANIONPOOL_SEED_CALL
// (default 'on'; 'off' is the post-revert not-built shape), the
// driver wraps exist (incl. the companionPool capture), the game-code
// diff is the seed call only, the wave-4 id set matches the data, the
// pool classifier places one fixture per failing condition (plus
// eligible-pool, ranked-pick, replica-agreement, and unknown cases),
// the recorder rows have their shape, the vbrainScorePick wrap records
// pool rows without changing the pick, the pool replica runs against
// live game state, and the determinism legs D1 (repeatability) + D2
// (wrap neutrality) are green at 60d on seed 102001.
// Usage:
//   node scripts/test-companionpool-b.js            (seed call expected ON)
//   COMPANIONPOOL_SEED_CALL=off node scripts/test-companionpool-b.js   (post-revert shape)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.COMPANIONPOOL_SEED_CALL || 'on';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-companionpool-b.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitStatus(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const seedBlockPresent = gameJs.indexOf("VETPARTY (sim-vetparty-a)") !== -1 &&
  gameJs.indexOf("this.winPlanSeedFromFight(vid, mdef, 'fled')") !== -1;
check('seed call present iff COMPANIONPOOL_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
// The seed-block presence check above is the real assertion; this one
// only polices that no OTHER src file is dirty (the seed call may be
// committed already, so an empty status is fine when seed=on).
const srcOk = srcStatus.every(function (s) { return /src\/js\/game\.js$/.test(s); }) &&
  (SEED_CALL_EXPECTED === 'off' ? srcStatus.length === 0 : true);
check('game-code worktree diff is the seed call only (src status: ' + JSON.stringify(srcStatus) + ')', srcOk);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*companionpool-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is companionpool-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'companionpool-driver-20261116.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'startExpedition', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'poolReplica']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has COMPANIONPOOL_RECORDER off-switch', driverSrc.indexOf("COMPANIONPOOL_RECORDER") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
// The two findCompanions exist where the prereg says they do.
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('villager-brain.js findCompanion calls companionRank (party_launch path)',
  brainJs.indexOf('function findCompanion') !== -1 && brainJs.indexOf('companionRank(vid, elig') !== -1);
check('win-plan.js findCompanion exists (depart-gate twin)',
  winPlanJs.indexOf('function findCompanion') !== -1 && winPlanJs.indexOf('companionRank(vid, elig') !== -1);
check('winPlanCands calls the brain findCompanion (line ~215)',
  brainJs.indexOf('var companion = findCompanion(self, vid, hx, hy);') !== -1);
check('winPlanDepart launchParty calls the win-plan findCompanion',
  winPlanJs.indexOf('var cid = findCompanion(self, vid, hx, hy);') !== -1);

// ---------- 2. Pool classifier unit fixtures ----------
console.log('== pool classifier fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 102001, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], companionPool: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
  };
  return Object.assign(j, over || {});
}
function seedRow(day, vid, target, wave, stageAfter, outcome) {
  return { day: day, vid: vid, mid: target, wave: wave, outcome: outcome || 'fled', stageAfter: stageAfter, target: target, node: { nx: 1, ny: 1 } };
}
function scoreRow(day, part, vid, target, stage, cands, commitAction) {
  const c = (cands || []).map(function (a) {
    return a ? { kind: a === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', w: a === 'party_launch' ? 5.0 : 4.0, winPlanAction: a, companion: a === 'party_launch' ? 'v2' : null, vbrainSrc: 'win_plan' } : null;
  });
  if (!cands || !cands.length) c.push({ kind: 'HAVEN_CHORE', w: 1.4, winPlanAction: null, companion: null, vbrainSrc: null });
  const logCands = c.map(function (x) { return { kind: x.kind, score: x.w, winPlanAction: x.winPlanAction }; });
  return { day: day, part: part, vid: vid,
    cands: c,
    pick: { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', winPlanAction: commitAction || null, override: commitAction ? 'win_plan:' + commitAction : null, corePick: 'HAVEN_CHORE' },
    logCands: logCands,
    commit: commitAction ? { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', winPlanAction: commitAction, companion: commitAction === 'party_launch' ? 'v2' : null } : { kind: 'HAVEN_CHORE', winPlanAction: null, companion: null },
    plan: target ? { stage: stage, target: target, needWave: 4, party: [] } : null,
    holderGear: { armed: true, armored: true } };
}
function censusRow(day, vid, target, stage, alive) {
  return { day: day, vid: vid, target: target, needWave: 4, stage: stage, party: [],
    holderAlive: alive, holderNode: { nx: 0, ny: 0 }, holderExped: false,
    holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } };
}
function poolRow(day, vid, target, stage, holderProfile, counts, eligible, rankedPick, rankedOrder, bidCompanion, agree) {
  let rosterN = 0;
  for (const k of Object.keys(counts)) rosterN += counts[k];
  const fails = {};
  if (eligible) for (const id of eligible) fails[id] = 'eligible';
  return { day: day, part: 0, vid: vid, target: target, stage: stage,
    holderProfile: holderProfile, holderNode: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 },
    rosterN: rosterN, counts: counts, fails: fails,
    eligible: (eligible || []).slice(),
    rankedOrder: rankedOrder || (eligible || []).map(function (id) { return { id: id, s: null }; }),
    rankedPick: rankedPick || null, rankedVia: 'companionRank',
    bidCompanion: bidCompanion === undefined ? null : bidCompanion,
    agree: agree === undefined ? null : agree };
}
function classifyOne(j) {
  return ANALYZE.classifyPool(j);
}
// One fixture per failing condition as the SOLE blocker (eligible 0):
// roster = holder (selfOrScholar 1) + 2 members failing at that check.
const SOLE = {
  selfOrScholar: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  dead: { selfOrScholar: 1, dead: 2, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  away: { selfOrScholar: 1, dead: 0, away: 2, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  trustLow: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 2, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  notAtHaven: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 2, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
  engaged: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 2, notRanger: 0, onExped: 0, eligible: 0 },
  notRanger: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 },
  onExped: { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 2, eligible: 0 },
};
for (const cond of Object.keys(SOLE)) {
  const rosterN = cond === 'selfOrScholar' ? 1 : 3;
  const counts = SOLE[cond];
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, [], null, [], null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const d = r.poolDawns[0] || {};
  check('sole blocker ' + cond + ' -> classified, dominant ' + cond,
    r.scoredDawns === 1 && r.classifiedDawns === 1 && r.unknownDawns === 0 &&
    d.classified === true && d.dominantBlocker === cond && d.eligibleN === 0,
    'scored=' + r.scoredDawns + ' classified=' + r.classifiedDawns + ' unknown=' + r.unknownDawns +
    ' dominant=' + d.dominantBlocker + ' eligibleN=' + d.eligibleN + ' rosterN-check=' + rosterN);
}
// Eligible pool, ranked pick agrees with the bid.
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 1, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const d = r.poolDawns[0] || {};
  check('eligible 1 + bid agrees -> classified, pick v2',
    r.classifiedDawns === 1 && r.unknownDawns === 0 && d.eligibleN === 1 && d.rankedPick === 'v2' && d.dominantBlocker == null,
    'classified=' + r.classifiedDawns + ' unknown=' + r.unknownDawns + ' pick=' + d.rankedPick);
})();
// Eligible 2+: ranked pick is the RANKED-first id, not roster-first.
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    // scoreRow's party_launch companion is 'v2'; ranked pick here is 'v3'
    // — the fixture overrides the score row's companion to 'v3' so the
    // bid and the replica agree on the ranked-first id.
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'wanderer', counts, ['v2', 'v3'], 'v3', [{ id: 'v3', s: 9 }, { id: 'v2', s: 5 }], 'v3', true)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  j.dawnbidScores[0].cands[0].companion = 'v3';
  j.dawnbidScores[0].commit.companion = 'v3';
  const r = classifyOne(j);
  const d = r.poolDawns[0] || {};
  check('eligible 2 ranked-first (v3, not roster-first v2) -> classified',
    r.classifiedDawns === 1 && r.unknownDawns === 0 && d.eligibleN === 2 && d.rankedPick === 'v3',
    'classified=' + r.classifiedDawns + ' unknown=' + r.unknownDawns + ' pick=' + d.rankedPick);
})();
// Two dawns: blocked then eligible (histogram + ranger split).
(function () {
  const blocked = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 };
  const open = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [
      scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait'),
      scoreRow(12, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch'),
    ],
    companionPool: [
      poolRow(11, 'v1', 'strike', 'party', 'explorer', blocked, [], null, [], null, null),
      poolRow(12, 'v1', 'strike', 'party', 'explorer', open, ['v2', 'v3'], 'v2', [{ id: 'v2', s: 8 }, { id: 'v3', s: 6 }], 'v2', true),
    ],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(12, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('two dawns blocked-then-eligible -> classified 2, hist 0:1 2:1',
    r.scoredDawns === 2 && r.classifiedDawns === 2 && r.unknownDawns === 0 &&
    r.eligibleHist['0'] === 1 && r.eligibleHist['2'] === 1 &&
    r.rangerSplit.ranger.dawns === 2 && r.rangerSplit.ranger.eligible0 === 1,
    'scored=' + r.scoredDawns + ' hist=' + JSON.stringify(r.eligibleHist) + ' ranger=' + JSON.stringify(r.rangerSplit.ranger));
})();
// Unknown cases.
(function () {
  // Missing pool row.
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('missing pool row -> unknown (missing-pool-row)',
    r.scoredDawns === 1 && r.classifiedDawns === 0 && r.unknownDawns === 1 &&
    (r.unknownList[0] || {}).reason === 'missing-pool-row',
    'unknown=' + JSON.stringify(r.unknownList));
})();
(function () {
  // Counts do not sum to rosterN.
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 };
  const row = poolRow(11, 'v1', 'strike', 'party', 'forager', counts, [], null, [], null, null);
  row.rosterN = 99;
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [row],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('counts-sum mismatch -> unknown',
    r.unknownDawns === 1 && String((r.unknownList[0] || {}).reason).indexOf('counts-sum-mismatch') === 0,
    'unknown=' + JSON.stringify(r.unknownList));
})();
(function () {
  // Replica disagrees with the real bid.
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', false)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('replica disagree (agree=false with a bid) -> unknown',
    r.unknownDawns === 1 && String((r.unknownList[0] || {}).reason).indexOf('replica-disagree') === 0,
    'unknown=' + JSON.stringify(r.unknownList));
})();
(function () {
  // Eligible array length disagrees with counts.eligible.
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 2 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('eligible-mismatch -> unknown',
    r.unknownDawns === 1 && (r.unknownList[0] || {}).reason === 'eligible-mismatch',
    'unknown=' + JSON.stringify(r.unknownList));
})();
// Precedence: a dawn with a bid AND an eligible pool is still classified
// by the pool row, not by the bid (pool row is the record).
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 1, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'explorer', counts, ['v2'], 'v2', [{ id: 'v2', s: 7 }], 'v2', true)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  check('bid+eligible dawn classified by pool row (eligibleN 1, not unknown)',
    r.classifiedDawns === 1 && r.unknownDawns === 0 && (r.poolDawns[0] || {}).eligibleN === 1,
    'classified=' + r.classifiedDawns + ' unknown=' + r.unknownDawns);
})();

// ---------- 2b. Analyzer summarizePool shape ----------
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 };
  const one = ANALYZE.classifyPool(baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', counts, [], null, [], null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  }));
  const leg = { bySeed: { 102001: one }, files: ['a.json'] };
  const sum = ANALYZE.summarizePool(leg);
  check('summarizePool returns files as a count (not an array)', sum.files === 1, 'got ' + JSON.stringify(sum.files));
  check('summarizePool counts the one scored dawn, classified 1, unknown 0',
    sum.scoredDawns === 1 && sum.classifiedDawns === 1 && sum.unknown === 0 && sum.classifiedShare === 1,
    'got scored=' + sum.scoredDawns + ' share=' + sum.classifiedShare);
  check('summarizePool fail share for notRanger is 2/3', sum.failShares.notRanger === 0.6667, 'got ' + sum.failShares.notRanger);
})();

// ---------- 3. Recorder: live in-memory run (shape + pick neutrality) ----------
console.log('== recorder live ==');
async function liveRuns() {
  // DAYS=5 live run through the driver: rows exist with their shape,
  // no instrument errors, and the score wrap records bids.
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'companionpool-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'companionpool-driver-20261116.js'));
  const out = await driver.oneRun(102001);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries companionPool array', Array.isArray(out.companionPool));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run policy sha is competent verbatim (74a890f0844e)', out.policySha === '74a890f0844e', 'got ' + out.policySha);
  const badScore = (out.dawnbidScores || []).find(function (r) { return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && Array.isArray(r.cands) && r.plan !== undefined); });
  check('score rows have their shape', !badScore, badScore ? JSON.stringify(badScore).slice(0, 200) : '');
  const badPool = (out.companionPool || []).find(function (r) {
    if (!(r && typeof r.day === 'number' && r.part === 0 && r.vid && r.counts && typeof r.rosterN === 'number' && Array.isArray(r.eligible))) return true;
    let sum = 0;
    for (const k of Object.keys(r.counts)) sum += r.counts[k];
    if (sum !== r.rosterN) return true;
    if (r.eligible.length !== (r.counts.eligible | 0)) return true;
    if ((r.counts.eligible | 0) > 0 && !r.rankedPick) return true;
    return false;
  });
  check('pool rows have their shape (counts sum, eligible matches, pick present)', !badPool, badPool ? JSON.stringify(badPool).slice(0, 300) : '');
  console.log('  info: live 5d run recorded ' + (out.companionPool || []).length + ' pool rows, ' + (out.dawnbidScores || []).length + ' score rows');
  return out;
}

// ---------- 3b. Pool replica against live game state ----------
async function replicaLive() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const driver = require(path.join(REPO, 'scripts', 'companionpool-driver-20261116.js'));
  const { Game } = await loadGame({ seed: 102001, mode: 'companionpool-proof', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  check('live replica: roster is non-empty', roster.length > 0, 'roster=' + roster.length);
  let checked = 0;
  for (const vid of roster.slice(0, 5)) {
    const pool = driver.poolReplica(Game, vid);
    if (!pool) continue;
    checked++;
    let sum = 0;
    for (const k of Object.keys(pool.counts)) sum += pool.counts[k];
    check('live replica for ' + vid + ': counts sum to rosterN, eligible matches',
      sum === pool.rosterN && pool.eligible.length === (pool.counts.eligible | 0) &&
      ((pool.counts.eligible | 0) === 0 || !!pool.rankedPick),
      'sum=' + sum + ' rosterN=' + pool.rosterN + ' eligible=' + pool.eligible.length + ' pick=' + pool.rankedPick);
    if (checked >= 3) break;
  }
  check('live replica ran on at least 3 roster members', checked >= 3, 'checked=' + checked);
}

// ---------- 4. Determinism legs D1 + D2 (60d, seed 102001) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60' }, envExtra || {});
  const script = "const d=require('./scripts/companionpool-driver-20261116.js');" +
    "d.oneRun(102001).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childFingerprint({});
  const b = childFingerprint({});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childFingerprint({ COMPANIONPOOL_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4 arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  console.log('  info: D1 60d run recorded ' + (a.full.companionPool || []).length + ' pool rows, ' +
    (a.full.dawnbidScores || []).length + ' score rows, ' + (a.full.v4seeds || []).length + ' v4 seeds');
}

(async function () {
  try {
    await liveRuns();
    await replicaLive();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
