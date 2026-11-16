// test-launchdef-a.js — proof for arm sim-launchdef-a (LEVER re-test +
// instrument). Proves, on synthetic fixtures and live in-memory runs
// (no corpus numbers): the seed call's presence matches
// LAUNCHDEF_SEED_CALL (default 'on'; 'off' is the post-revert
// not-built shape), the gate carve-out's presence in
// villager-agency.js matches LAUNCHDEF_GATE (default 'on'; 'off' is
// the control shape), the game-code diff is the seed call + the gate
// only, the wave-4 id set matches the data, the classifier places one
// fixture per bucket/sub-reason (copied fixtures — the classifier's
// bucket machinery is copied, so these prove the copy plus the new
// any-commit definition), the recorder rows have their shape, the
// vbrainScorePick wrap records bids without changing the pick, the
// profile gate lets a committed party_launch holder through on the
// armed tip (and skips them on the control tip / without a commit),
// the skip recorder records a REAL reason for a committed holder who
// cannot depart (staged live: away-as-companion; profile-gate-veto on
// the control tip), the classifier counts a real mid-day launch
// under any-commit but not under dawn-only (the 100877-style matched
// pair at fixture level), and the determinism legs D1 (repeatability)
// + D2 (wrap neutrality) are green at 60d on seed 102011.
// Usage:
//   node scripts/test-launchdef-a.js            (seed call + gate expected ON)
//   LAUNCHDEF_GATE=off node scripts/test-launchdef-a.js   (control shape)
//   LAUNCHDEF_SEED_CALL=off LAUNCHDEF_GATE=off node scripts/test-launchdef-a.js   (post-revert shape)
// Env for the live runs (the tableseat-nowait policy is default-OFF
// without them): LEANLINKRESCUE=1 TABLESEATNOWAIT=1 — set by this
// file itself below so the proof never silently runs the wrong policy.
'use strict';
process.env.LEANLINKRESCUE = '1';
process.env.TABLESEATNOWAIT = '1';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.LAUNCHDEF_SEED_CALL || 'on';
const GATE_EXPECTED = process.env.LAUNCHDEF_GATE || 'on';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));

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
check('seed call present iff LAUNCHDEF_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
const gateBlockPresent = agencyJs.indexOf("LAUNCHDEF (sim-launchdef-a)") !== -1 &&
  agencyJs.indexOf("winPlanAction === 'party_launch'") !== -1;
check('gate carve-out present iff LAUNCHDEF_GATE=on (expected ' + GATE_EXPECTED + ', found ' + (gateBlockPresent ? 'present' : 'absent') + ')',
  (GATE_EXPECTED === 'on') === gateBlockPresent);
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
// The presence checks above are the real assertions; this one only
// polices that no OTHER src file is dirty (the changes may be committed
// already, so an empty status is fine).
const srcOk = srcStatus.every(function (s) { return /src\/js\/game\.js$/.test(s) || /src\/js\/villager-agency\.js$/.test(s); });
check('game-code worktree diff is the seed call + the gate only (src status: ' + JSON.stringify(srcStatus) + ')', srcOk);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*launchdef-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is launchdef-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'launchdef-driver-20261115.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'startExpedition', 'agencyTick', 'installSkipRecorder', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'launchdefSkips', 'commitKindOf', 'tableseatNowait']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has LAUNCHDEF_RECORDER off-switch', driverSrc.indexOf("LAUNCHDEF_RECORDER") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));

// ---------- 2. Classifier unit fixtures ----------
console.log('== classifier fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 100861, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], launchdefSkips: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
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
  // A non-win-plan candidate so the row is recorded even with no win-plan bid.
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
function departRow(day, vid, result, action, vidExped, compExped, vidBlock, compBlock, commitKind) {
  return { day: day, vid: vid, source: 'brain', result: result, winPlanAction: action,
    companion: 'v2', vidExped: vidExped, companionExped: compExped,
    vidBlock: vidBlock || null, companionBlock: compBlock || null,
    commitKind: commitKind || 'dawn', commitPart: commitKind === 'mid-day part-1' ? 1 : (commitKind === 'mid-day part-2' ? 2 : 0),
    stage: 'party', target: 'strike', party: ['v2'] };
}
function skipRow(day, part, vid, target, stage, reason, commitKind) {
  return { seq: 1, day: day, part: part, vid: vid, target: target, stage: stage, party: [],
    commitKind: commitKind || 'dawn', commitPart: part, leg: 'control', reason: reason,
    executeResult: null,
    raw: { profile: 'forager', node: { nx: 4, ny: 4 }, haven: true, exped: false, away: false,
      night: false, engaged: false, indoor: false, danger: false, dead: false } };
}
function censusRow(day, vid, target, stage, alive) {
  return { day: day, vid: vid, target: target, needWave: 4, stage: stage, party: [],
    holderAlive: alive, holderNode: { nx: 0, ny: 0 }, holderExped: false,
    holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } };
}
function classifyOne(j) {
  const r = ANALYZE.classifySeed(j);
  return r.instances;
}
function expectBucket(name, j, bucket, sub) {
  const insts = classifyOne(j);
  const got = insts.length ? insts[0].bucket + ':' + insts[0].sub : '(no instances)';
  check(name + ' -> ' + bucket + ':' + sub, insts.length === 1 && insts[0].bucket === bucket && insts[0].sub === sub, 'got ' + got + ' over ' + insts.length + ' instances');
}

// launched
expectBucket('launched', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
  dawnbidDeparts: [departRow(11, 'v1', 'launch', 'party_launch', true, true)],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'hunt', true)],
}), 'launched', 'companion:v2:dawn');
// ANY-COMMIT vs DAWN-ONLY: the 100877-style matched pair at fixture
// level. Dawn commit party_launch, mid-day part-1 commit party_launch,
// launch consumed by the mid-day commit.
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [
      scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch'),
      scoreRow(11, 1, 'v1', 'strike', 'party', ['party_launch'], 'party_launch'),
    ],
    dawnbidDeparts: [departRow(11, 'v1', 'launch', 'party_launch', true, true, null, null, 'mid-day part-1')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'hunt', true)],
  });
  const anyCommit = ANALYZE.classifySeed(j);
  check('any-commit: mid-day launch -> launched:companion:v2:mid-day part-1',
    anyCommit.length === 1 && anyCommit[0].bucket === 'launched' && anyCommit[0].sub === 'companion:v2:mid-day part-1',
    'got ' + (anyCommit[0] || {}).bucket + ':' + (anyCommit[0] || {}).sub);
  const dawnOnly = ANALYZE.classifySeed(j, { launchDefinition: 'dawn-only' });
  check('dawn-only: same fixture -> selected-blocked:selected-not-executed (the 0446Z miss)',
    dawnOnly.length === 1 && dawnOnly[0].bucket === 'selected-blocked' && dawnOnly[0].sub === 'selected-not-executed',
    'got ' + (dawnOnly[0] || {}).bucket + ':' + (dawnOnly[0] || {}).sub);
})();
// Skip-reason fixtures: one per recorder reason — a dawn party_launch
// commit, no depart row, one skip row with the reason.
for (const reason of ['away-as-companion', 'away-on-expedition', 'profile-gate-veto', 'not-at-haven', 'night', 'indoor-objective', 'danger-gate', 'holder-dead', 'engaged', 'other']) {
  expectBucket('skip-reason ' + reason, baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    launchdefSkips: [skipRow(11, 0, 'v1', 'strike', 'party', reason)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  }), 'selected-blocked', reason);
}
// Skip-reason via execute-returned-normal: depart row 'normal' + skip row.
expectBucket('skip-reason execute-returned-normal', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
  dawnbidDeparts: [departRow(11, 'v1', 'normal', 'party_launch', false, null)],
  launchdefSkips: [skipRow(11, 0, 'v1', 'strike', 'party', 'execute-returned-normal')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
}), 'selected-blocked', 'execute-returned-normal');
// No-tick-after-commit: only a part-2 commit, no depart row, no skip row.
expectBucket('no-tick-after-commit', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 2, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
}), 'selected-blocked', 'no-tick-after-commit');
// target-killed (holder slew the target outside a launch)
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(20, 'v1', 'strike', 'standing', true)],
  });
  j.daily = [{ day: 150, waveKillLog: [{ d: 20, mid: 'strike', w: 4, by: 'v1', via: 'wild' }], roster: [] }];
  expectBucket('target-killed', j, 'target-killed', 'day:20');
})();
// selected-blocked: inviter-hurt / inviter-sick / inviter-range-0
for (const b of [['hurt-no-medicine-no-healer', 'inviter-hurt'], ['sick', 'inviter-sick'], ['range-0', 'inviter-range-0']]) {
  expectBucket('selected-blocked ' + b[1], baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    dawnbidDeparts: [departRow(11, 'v1', 'hold', 'party_launch', false, null, b[0], null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  }), 'selected-blocked', b[1]);
}
// selected-blocked: companion-not-started (companion sick)
expectBucket('selected-blocked companion-not-started:sick', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
  dawnbidDeparts: [departRow(11, 'v1', 'launch', 'party_launch', true, false, null, 'sick')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
}), 'selected-blocked', 'companion-not-started:sick');
// selected-blocked: commit-overwritten-midday
expectBucket('selected-blocked commit-overwritten-midday', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [
    scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch'),
    scoreRow(11, 1, 'v1', 'strike', 'party', ['gear_hold'], 'gear_hold'),
  ],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
}), 'selected-blocked', 'commit-overwritten-midday:gear_hold');
// selected-blocked: selected-not-executed
expectBucket('selected-blocked selected-not-executed', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
}), 'selected-blocked', 'selected-not-executed');
// bid-not-selected (bid, core pick wins — commit has no win-plan action)
expectBucket('bid-not-selected', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], null)],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
}), 'bid-not-selected', 'bids:1');
// plan-churned-before-dawn: holder-died
expectBucket('churned holder-died', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', false)],
}), 'plan-churned-before-dawn', 'holder-died');
// plan-churned-before-dawn: plan-deleted
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true)],
  });
  j.gameDays = 150;
  expectBucket('churned plan-deleted', j, 'plan-churned-before-dawn', 'plan-deleted');
})();
// plan-churned-before-dawn: retargeted (second instance opens)
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party'), seedRow(12, 'v1', 'audit', 4, 'party')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(12, 'v1', 'audit', 'party', true)],
  });
  const insts = classifyOne(j);
  check('retarget closes old instance + opens new (2 instances)', insts.length === 2, 'got ' + insts.length);
  check('retargeted instance -> churned-before-dawn:retargeted',
    insts[0].bucket === 'plan-churned-before-dawn' && insts[0].sub === 'retargeted',
    'got ' + insts[0].bucket + ':' + insts[0].sub);
})();
// candidate-not-bid: gear-stage / no-companion-party / no-companion-hunt-plus / not-scored
expectBucket('candidate-not-bid gear-stage', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'gear')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'gear', ['gear_hold'], 'gear_hold'), scoreRow(12, 0, 'v1', 'strike', 'gear', ['gear_hold'], 'gear_hold')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'gear', true), censusRow(12, 'v1', 'strike', 'gear', true)],
}), 'candidate-not-bid', 'gear-stage');
expectBucket('candidate-not-bid no-companion-party', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
}), 'candidate-not-bid', 'no-companion-party');
expectBucket('candidate-not-bid no-companion-hunt-plus', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'hunt', [], null)],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'hunt', true)],
}), 'candidate-not-bid', 'no-companion-hunt-plus');
expectBucket('candidate-not-bid veteran-guard', baseSeed({
  v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
  dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'table', ['veteran_guard'], 'veteran_guard')],
  dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'table', true)],
}), 'candidate-not-bid', 'veteran-guard');
expectBucket('candidate-not-bid not-scored', baseSeed({
  v4seeds: [seedRow(148, 'v1', 'strike', 4, 'party')],
  dawnbidCensus: [censusRow(148, 'v1', 'strike', 'party', true), censusRow(150, 'v1', 'strike', 'party', true)],
}), 'candidate-not-bid', 'not-scored');
// precedence: blocked-then-launched -> launched
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [
      scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch'),
      scoreRow(13, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch'),
    ],
    dawnbidDeparts: [
      departRow(11, 'v1', 'hold', 'party_launch', false, null, 'sick', null),
      departRow(13, 'v1', 'launch', 'party_launch', true, true),
    ],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(13, 'v1', 'strike', 'hunt', true)],
  });
  const insts = classifyOne(j);
  check('precedence blocked-then-launched -> launched', insts.length === 1 && insts[0].bucket === 'launched',
    'got ' + (insts[0] || {}).bucket);
})();
// precedence: never-bid-then-churned-after-first-dawn -> candidate-not-bid (stage history, not churn)
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'gear', ['gear_hold'], 'gear_hold')],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'gear', true), censusRow(12, 'v1', 'strike', 'gear', false)],
  });
  const insts = classifyOne(j);
  check('precedence never-bid-then-churned-after-first-dawn -> candidate-not-bid',
    insts.length === 1 && insts[0].bucket === 'candidate-not-bid' && insts[0].sub === 'gear-stage',
    'got ' + (insts[0] || {}).bucket + ':' + (insts[0] || {}).sub);
})();
// stage advance is history, not churn (Correction 2)
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')],
    dawnbidScores: [
      scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait'),
      scoreRow(12, 0, 'v1', 'strike', 'standing', ['party_wait'], 'party_wait'),
    ],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(12, 'v1', 'strike', 'standing', true)],
  });
  const insts = classifyOne(j);
  check('stage advance standing keeps instance open (history, not churn)',
    insts.length === 1 && insts[0].bucket === 'candidate-not-bid' && insts[0].stageHistory.join(',') === 'party,standing',
    'got ' + (insts[0] || {}).bucket + ' stages=' + ((insts[0] || {}).stageHistory || []).join(','));
})();
// refresh same-target -> one instance; non-opening seed at hunt stage opens nothing
(function () {
  const j = baseSeed({
    v4seeds: [
      seedRow(10, 'v1', 'strike', 4, 'party'),
      seedRow(12, 'v1', 'strike', 4, 'party'),
      seedRow(14, 'v1', 'strike', 4, 'hunt'),
    ],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(14, 'v1', 'strike', 'hunt', true)],
  });
  const insts = classifyOne(j);
  check('same-target re-seed refreshes (1 instance, refreshes=1, non-opening seed ignored)',
    insts.length === 1 && insts[0].refreshes === 1, 'got ' + insts.length + ' instances, refreshes=' + ((insts[0] || {}).refreshes));
})();

// ---------- 2b. Analyzer summarize shape (regression: files is a count) ----------
(function () {
  const one = ANALYZE.classifySeed(baseSeed({ v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party')] }));
  const leg = { bySeed: { 100861: one }, files: ['a.json'] };
  const sum = ANALYZE.summarize(leg);
  check('summarize returns files as a count (not an array)', sum.files === 1, 'got ' + JSON.stringify(sum.files));
  check('summarize bar2-style comparison uses the count', (leg.files.length === 1) === (sum.files === 1));
  check('summarize counts the one opened instance', sum.instancesOpened === 1, 'got ' + sum.instancesOpened);
})();

// ---------- 3. Recorder: live in-memory run (shape + pick neutrality) ----------
console.log('== recorder live ==');
async function liveRuns() {
  // DAYS=5 live run through the driver: rows exist with their shape,
  // no instrument errors, and the score wrap records bids.
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'launchdef-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'launchdef-driver-20261116.js'));
  const out = await driver.oneRun(102011);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries launchdefSkips array', Array.isArray(out.launchdefSkips));
  const KNOWN_SKIP = ['holder-dead', 'engaged', 'away-as-companion', 'away-on-expedition', 'profile-gate-veto', 'not-at-haven', 'night', 'indoor-objective', 'danger-gate', 'execute-returned-normal', 'other'];
  const badSkip = (out.launchdefSkips || []).find(function (r) { return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && r.target && KNOWN_SKIP.indexOf(r.reason) !== -1 && r.raw && typeof r.raw === 'object'); });
  check('skip rows have their shape + a known reason', !badSkip, badSkip ? JSON.stringify(badSkip).slice(0, 200) : '');
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run policy is tableseat-nowait', out.policy === 'tableseat-nowait', 'got ' + out.policy);
  const expPolicySha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait.js'), 'utf8')).digest('hex').slice(0, 12);
  const expLeanSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leanlinkrescue.js'), 'utf8')).digest('hex').slice(0, 12);
  check('live run policy sha is tableseat-nowait.js', out.policySha === expPolicySha, 'got ' + out.policySha + ' expected ' + expPolicySha);
  check('live run leanlinkrescue sha recorded', out.leanlinkrescueSha === expLeanSha, 'got ' + out.leanlinkrescueSha + ' expected ' + expLeanSha);
  const badScore = (out.dawnbidScores || []).find(function (r) { return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && Array.isArray(r.cands) && r.plan !== undefined); });
  check('score rows have their shape', !badScore, badScore ? JSON.stringify(badScore).slice(0, 200) : '');
  const badDepart = (out.dawnbidDeparts || []).find(function (r) { return !(r && typeof r.day === 'number' && r.vid && ('vidExped' in r) && ('companionExped' in r)); });
  check('depart rows have their shape', !badDepart, badDepart ? JSON.stringify(badDepart).slice(0, 200) : '');
  const badCensus = (out.dawnbidCensus || []).find(function (r) { return !(r && typeof r.day === 'number' && r.vid && r.target && r.stage); });
  check('census rows have their shape', !badCensus, badCensus ? JSON.stringify(badCensus).slice(0, 200) : '');
  return out;
}

// ---------- 3b. Gate: live in-memory (agencyTick reach test) ----------
console.log('== gate live ==');
async function gateLive() {
  // A non-ranger at Haven with a party_launch commit for today must
  // REACH vbrainExecuteDepart on the armed tip (gate bypassed) and
  // must NOT reach it on the control tip (gate intact) — nor without
  // a commit on either tip. The assertion is on the execute call,
  // not the launch outcome: sick / range-0 / hurt launch conditions
  // still apply downstream inside startExpedition.
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 102011, mode: 'launchdef-gate-test', fullTelemetry: false });
  await setupGame(Game);
  Game.dayPart = 0; // day, not night (isNight() is dayPart === 3)
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const today = ((Game.state.scholar || {}).day || 0);
  function atHaven(rid) {
    try { const n = Game.npcNode(rid); return !!(n && n.nx === hx && n.ny === hy); } catch (e) { return false; }
  }
  function dangerOff(rid) {
    try { return !Game.npcTrigger(rid, 'expedition_launch'); } catch (e) { return true; }
  }
  let holder = null, holderProf = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId) continue;
    let prof = null; try { prof = Game.npcRangeProfile(rid); } catch (e) {}
    if (prof !== 'forager' && prof !== 'homebody') continue;
    if (!atHaven(rid)) continue;
    try { if (Game.isEngaged && Game.isEngaged(rid)) continue; } catch (e) {}
    if (((v.away || {})[rid])) continue;
    if (!dangerOff(rid)) continue;
    holder = rid; holderProf = prof; break;
  }
  check('gate fixture: a non-ranger at Haven exists to test (' + (holder || 'none') + ')', !!holder);
  if (!holder) return;
  let companion = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId || rid === holder) continue;
    if (atHaven(rid)) { companion = rid; break; }
  }
  check('gate fixture: a companion at Haven exists (' + (companion || 'none') + ')', !!companion);
  if (!companion) return;
  check('gate fixture: holder profile is non-ranger (' + holderProf + ')', holderProf === 'forager' || holderProf === 'homebody');
  // Write the commit the way writeCommit does (village.vbrain is the
  // brain store; ensure() creates it with exactly this shape).
  v.vbrain = v.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  v.vbrain.commit = v.vbrain.commit || {};
  // LAUNCHDEF: install the skip recorder on this live game (same
  // installer oneRun uses) and assert it records REAL reasons.
  const driver = require(path.join(REPO, 'scripts', 'launchdef-driver-20261116.js'));
  const skips = [];
  const recErrors = [];
  const rec = driver.installSkipRecorder(Game, GATE_EXPECTED === 'on' ? 'on' : 'control', recErrors, skips);
  check('skip recorder installs with 0 errors', recErrors.length === 0, JSON.stringify(recErrors.slice(0, 2)));
  const calls = [];
  const origExecute = Game.vbrainExecuteDepart.bind(Game);
  Game.vbrainExecuteDepart = function (vid, hx2, hy2, ann) {
    calls.push(vid);
    return origExecute(vid, hx2, hy2, ann);
  };
  function tickOnce() {
    calls.length = 0;
    try { Game.agencyTick(); } catch (e) { throw new Error('agencyTick threw: ' + (e && e.message)); }
    return calls.indexOf(holder) !== -1;
  }
  // Case A: no commit — the holder is skipped on BOTH tips.
  delete v.vbrain.commit[holder];
  let reachedA = false, errA = null;
  try { reachedA = tickOnce(); } catch (e) { errA = String(e.message); }
  check('gate A: no commit -> execute NOT reached (reached=' + reachedA + ')', !errA && !reachedA, errA || '');
  // Case B: party_launch commit for today — reached iff gate is ON.
  v.vbrain.commit[holder] = { kind: 'EXPEDITION', day: today, part: 0, winPlanAction: 'party_launch', companion: companion };
  // The holder needs a wave-4 plan for the recorder to snapshot them.
  v.winPlan = v.winPlan || {};
  v.winPlan[holder] = { stage: 'party', target: 'audit', needWave: 4, party: [companion] };
  const skipsBeforeB = skips.length;
  let reachedB = false, errB = null;
  try { reachedB = tickOnce(); } catch (e) { errB = String(e.message); }
  check('gate B: party_launch commit -> execute reached iff LAUNCHDEF_GATE=on (expected ' + GATE_EXPECTED + ', reached=' + reachedB + ')',
    !errB && ((GATE_EXPECTED === 'on') === reachedB), errB || '');
  const holderSkipsB = skips.slice(skipsBeforeB).filter(function (r) { return r.vid === holder; });
  if (GATE_EXPECTED === 'off') {
    check('recorder B (control): a profile-gate-veto skip row for the holder',
      holderSkipsB.length >= 1 && holderSkipsB[0].reason === 'profile-gate-veto',
      'got ' + JSON.stringify(holderSkipsB.map(function (r) { return r.reason; })));
  } else {
    check('recorder B (armed): no skip row for the holder (execute reached)',
      holderSkipsB.length === 0, 'got ' + JSON.stringify(holderSkipsB.map(function (r) { return r.reason; })));
  }
  // Case C: holder away on expedition (plan still at party stage) —
  // the Diana Osei case: the recorder must say away-as-companion,
  // on EITHER tip (the expedition branch precedes the profile gate).
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    if (a) a.exped[holder] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: today, sincePart: 0, duration: 12, finds: [], encounters: [] };
    v.away = v.away || {};
    v.away[holder] = { nx: 6, ny: 6, purpose: 'expedition' };
  } catch (e) {}
  const skipsBeforeC = skips.length;
  let errC = null;
  try { tickOnce(); } catch (e) { errC = String(e.message); }
  const holderSkipsC = skips.slice(skipsBeforeC).filter(function (r) { return r.vid === holder; });
  check('recorder C: away holder -> away-as-companion skip row (both tips)',
    !errC && holderSkipsC.length >= 1 && holderSkipsC[0].reason === 'away-as-companion',
    errC || ('got ' + JSON.stringify(holderSkipsC.map(function (r) { return r.reason; }))));
  try { rec.uninstall(); } catch (e) {}
}

// ---------- 4. Determinism legs D1 + D2 (60d, seed 102011) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60' }, envExtra || {});
  const script = "const d=require('./scripts/launchdef-driver-20261116.js');" +
    "d.oneRun(102011).then(function(o){" +
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
  const off = childFingerprint({ LAUNCHDEF_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty dawnbid/v4 arrays',
    (off.full.dawnbidScores || []).length === 0 && (off.full.v4seeds || []).length === 0 &&
    (off.full.dawnbidCensus || []).length === 0 && (off.full.launchdefSkips || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
}

(async function () {
  try {
    await liveRuns();
    await gateLive();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
