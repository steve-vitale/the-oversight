// test-rumorplan-a.js — proof for arm sim-rumorplan-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): this arm touches NO src file (instrument-only), the driver
// wraps exist (incl. the per-participant launch wrap with the
// expedition-start gate and the census-diff target wrap), the
// taxonomy's code anchors still hold (two target-write sites, four
// hunt-entry sites, the seed early return + wave gate, the single
// plan-deletion site, the three hunt-exit sites, the launch-at-any-
// stage depart branch), the wave-4 AND wave-5 id sets match the
// data, the classifier places one fixture per bucket / sub-reason
// (incl. precedence, the same-day-launch exclusion, seed-created,
// instances that never reach hunt, repeat bounces), the lifecycle
// rules place conversion / churn / death / superseded / party-stage
// fixtures, the Q2 share table sums correctly over known launches
// (broad vs strict), the recorder rows have their shape, both LEG
// policies load with their frozen shas, and the determinism legs D1
// (repeatability) + D2 (wrap neutrality) are green at 60d on seed
// 102011 under TABLESEATNOWAIT=1 LEANLINKRESCUE=1.
// Usage:
//   node scripts/test-rumorplan-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-rumorplan-a.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitOut(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
  catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcDiff = gitOut('diff master...HEAD -- src/');
check('NO src change on this branch (instrument-only)', srcDiff === '', srcDiff.slice(0, 300));
const srcStatus = gitOut('status --porcelain -- src/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
check('src worktree clean', srcStatus.length === 0, JSON.stringify(srcStatus));
const scriptsStatus = gitOut('status --porcelain -- scripts/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) {
  return /scripts\/(rumorplan-driver-20261116|analyze-rumorplan-a|test-rumorplan-a|build-rumorplan-panels-20261116)\.js$/.test(s);
});
check('scripts worktree diff is rumorplan-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'rumorplan-driver-20261116.js'), 'utf8');
for (const w of ['winPlanOf', 'winPlanHavenTick', 'winPlanSeedFromFight', 'winPlanDepart', 'vbrainExecuteDepart',
  'seedattachBounces', 'seedattachCreations', 'seedattachLaunches', 'seedattachCensus',
  'rumorplanLaunches', 'rumorplanTargetDiffs', 'snapAllPlans', 'recordRumorLaunch', 'expedMap']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has RUMORPLAN_RECORDER off-switch', driverSrc.indexOf('RUMORPLAN_RECORDER') !== -1);
check('driver has LEG policy switch (competent|tableseat-nowait)', driverSrc.indexOf("LEG === 'tableseat-nowait'") !== -1);
check('driver defaults LEG to tableseat-nowait', driverSrc.indexOf("process.env.LEG || 'tableseat-nowait'") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records BEFORE-state in the launch wrap', driverSrc.indexOf('stageBefore') !== -1 && driverSrc.indexOf('targetBefore') !== -1);
check('driver gates launch rows on the expedition start', driverSrc.indexOf('inviterStarted') !== -1 && driverSrc.indexOf('expedStart') !== -1);
check('driver records the census-diff target wrap', driverSrc.indexOf('census-diff') !== -1 && driverSrc.indexOf('prevPlanTarget') !== -1);
// Wave-4 AND wave-5 id sets match the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
const liveW5 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
const frozenW5 = ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'].sort();
check('wave-5 id set matches monsters.json (10 ids)', JSON.stringify(liveW5) === JSON.stringify(frozenW5), JSON.stringify(liveW5));
// Taxonomy anchors: the code the buckets are built on must still hold.
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('anchor: seed writes target only for gear/party (early return present)',
  winPlanJs.indexOf("plan.stage !== 'gear' && plan.stage !== 'party'") !== -1);
check('anchor: seed is wave-gated to wave 3+',
  winPlanJs.indexOf("(mdef.wave || 1) < 3") !== -1);
check('anchor: seed target write exists', winPlanJs.indexOf('plan.target = mdef.id') !== -1);
check('anchor: launchParty companion target copy exists', winPlanJs.indexOf('cplan.target = plan.target') !== -1);
const huntSetsWinPlan = (winPlanJs.match(/\.stage = 'hunt'/g) || []).length;
check('anchor: exactly 2 hunt entries in win-plan.js (inviter + companion)', huntSetsWinPlan === 2, 'got ' + huntSetsWinPlan);
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const huntSetsBrain = (brainJs.match(/\.stage = 'hunt'/g) || []).length;
check('anchor: exactly 2 hunt entries in villager-brain.js (mirror inviter + companion)', huntSetsBrain === 2, 'got ' + huntSetsBrain);
check('anchor: brain mirror does NOT copy the target (no cplan.target write in brain)',
  brainJs.indexOf('cplan.target') === -1);
check('anchor: target is born null in exactly 3 creation literals (winPlanOf / seed / HavenTick)',
  (winPlanJs.match(/target: null/g) || []).length === 3,
  'got ' + (winPlanJs.match(/target: null/g) || []).length);
check('anchor: no target-clearing assignment anywhere in win-plan.js',
  (winPlanJs.match(/\.target\s*=\s*null/g) || []).length === 0,
  'got ' + (winPlanJs.match(/\.target\s*=\s*null/g) || []).length);
check('anchor: exactly ONE plan-deletion site (tableActive in HavenTick)',
  (winPlanJs.match(/delete v\.winPlan\[vid\]/g) || []).length === 1,
  'got ' + (winPlanJs.match(/delete v\.winPlan\[vid\]/g) || []).length);
check('anchor: kill advances hunt/party to standing (winPlanNoteKill)',
  winPlanJs.indexOf("plan.stage = 'standing'") !== -1);
check('anchor: fight-gate outmatched demotion exists (hunt -> party/gear)',
  winPlanJs.indexOf("? 'party' : 'gear'") !== -1);
check('anchor: HavenTick advances standing/hunt to table (two sites)',
  (winPlanJs.match(/plan\.stage = 'table'/g) || []).length === 2,
  'got ' + (winPlanJs.match(/plan\.stage = 'table'/g) || []).length);
check('anchor: depart attempts a launch at party/hunt/standing/table alike',
  winPlanJs.indexOf("plan.stage === 'party' || plan.stage === 'hunt'") !== -1);
check('anchor: brain returns launch for an already-out villager (the repeat the exped gate excludes)',
  brainJs.indexOf('if (a.exped && a.exped[vid]) return \'launch\'') !== -1 ||
  brainJs.indexOf("if (a && a.exped && a.exped[vid]) return 'launch'") !== -1);
// Policy shas (frozen in the prereg).
const crypto = require('crypto');
function sha12(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', file), 'utf8')).digest('hex').slice(0, 12);
}
check('competent policy sha is 74a890f0844e', sha12('competent.js') === '74a890f0844e', 'got ' + sha12('competent.js'));
check('tableseat-nowait policy sha is a11a1abc672e', sha12('tableseat-nowait.js') === 'a11a1abc672e', 'got ' + sha12('tableseat-nowait.js'));

// ---------- 2. Classifier unit fixtures ----------
console.log('== classifier fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 102011, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4encounters: [], deaths: [],
    seedattachBounces: [], seedattachCreations: [], seedattachLaunches: [], seedattachCensus: [],
    rumorplanLaunches: [], rumorplanTargetDiffs: [],
    daily: [],
  };
  return Object.assign(j, over || {});
}
function bounce(day, vid, mid, wave, stageBefore, targetBefore, stageAfter, targetAfter, opts) {
  const o = opts || {};
  return { day: day, vid: vid, mid: mid, wave: wave, outcome: o.outcome || 'fled',
    stageBefore: stageBefore, targetBefore: targetBefore, nodeBefore: null,
    stageAfter: stageAfter, targetAfter: targetAfter, nodeAfter: null,
    planSinceDay: (o.sinceDay != null ? o.sinceDay : 5), planParty: o.party || [],
    foughtAtBounce: o.fought || [] };
}
function creation(day, vid, createdBy, creatorSite, fought, slainTotal, stageAtCreation, targetAtCreation) {
  return { day: day, vid: vid, createdBy: createdBy, creatorSite: creatorSite,
    fought: fought || [], villageSlainTotal: slainTotal || 0,
    stageAtCreation: stageAtCreation || 'gear', targetAtCreation: targetAtCreation || null };
}
function saLaunch(day, inviterVid, pathName, companion, inviterTargetBefore, companionTargetBefore, companionTargetAfter) {
  return { day: day, vid: inviterVid, path: pathName, result: 'launch',
    inviterTargetBefore: inviterTargetBefore, companion: companion,
    companionTargetBefore: companionTargetBefore, companionTargetAfter: companionTargetAfter };
}
function rumorLaunch(day, vid, role, pathName, inviter, stageBefore, targetBefore, stageAfter, targetAfter, opts) {
  const o = opts || {};
  return { day: day, vid: vid, role: role, path: pathName, inviter: inviter,
    companion: o.companion || null, expedStart: o.expedStart || 'yes',
    expedBefore: false, expedAfter: true,
    stageBefore: stageBefore, targetBefore: targetBefore,
    needWaveBefore: o.needWaveBefore != null ? o.needWaveBefore : null, nodeBefore: null,
    partyBefore: o.partyBefore || [],
    stageAfter: stageAfter, targetAfter: targetAfter,
    needWaveAfter: o.needWaveAfter != null ? o.needWaveAfter : null, nodeAfter: null,
    partyAfter: o.partyAfter || [] };
}
function censusRow(day, vid, target, stage, party, sinceDay, opts) {
  const o = opts || {};
  return { day: day, vid: vid, target: target, needWave: o.needWave != null ? o.needWave : null, stage: stage,
    party: party || [], sinceDay: (sinceDay != null ? sinceDay : 5), node: null,
    holderAlive: o.holderAlive !== undefined ? o.holderAlive : true,
    holderNode: { nx: 0, ny: 0 }, holderExped: !!o.holderExped,
    holderSick: false, holderHealth: 100 };
}
function targetDiff(day, vid, from, to, stage) {
  return { day: day, vid: vid, from: from, to: to, stage: stage || null, source: 'census-diff' };
}
function classifyOne(j) {
  return ANALYZE.classifyRumor(j);
}
function expectBucket(name, j, bucket, sub) {
  const r = classifyOne(j);
  const insts = r.instances;
  const got = insts.length ? insts[0].bucket + ':' + insts[0].sub : '(no instances)';
  check(name + ' -> ' + bucket + ':' + sub, insts.length === 1 && insts[0].bucket === bucket && insts[0].sub === sub,
    'got ' + got + ' over ' + insts.length + ' instances');
}

// companion-inherited via the win-plan launch path (companion copy carries the null target)
expectBucket('companion-inherited via winplan', baseSeed({
  seedattachLaunches: [saLaunch(10, 'v0', 'winplan', 'v1', null, null, null)],
  seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
  seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
}), 'companion-inherited', 'winplan:inviter-v0');
// companion-inherited via the brain mirror (companion keeps its null target — no copy)
expectBucket('companion-inherited via brain mirror', baseSeed({
  seedattachLaunches: [saLaunch(10, 'v0', 'brain', 'v1', null, null, null)],
  seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'villager-brain.js:1048', [], 0, 'gear', null)],
  seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
}), 'companion-inherited', 'brain:inviter-v0');
// companion-inherited via the rumorplan companion row alone (no seedattach launch row)
expectBucket('companion-inherited via rumorplan row only', baseSeed({
  rumorplanLaunches: [
    rumorLaunch(10, 'v0', 'inviter', 'brain', 'v0', 'hunt', null, 'hunt', null, { partyAfter: ['v1'] }),
    rumorLaunch(10, 'v1', 'companion', 'brain', 'v0', 'gear', null, 'hunt', null, { partyAfter: ['v0'] }),
  ],
  seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'villager-brain.js:1048', [], 0, 'gear', null)],
  seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
}), 'companion-inherited', 'brain:inviter-v0');
// haven-born, heard-at-fire (rumor-only, no beast met)
expectBucket('haven-born heard-at-fire', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 3, 'gear', null)],
  seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
    censusRow(9, 'v1', null, 'hunt', ['v2']), censusRow(10, 'v1', null, 'hunt', ['v2']), censusRow(11, 'v1', null, 'hunt', ['v2'])],
}), 'haven-born', 'heard-at-fire');
// haven-born, fought-personally (inviter's own plan; fought a beast, plan never named it)
expectBucket('haven-born fought-personally', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['strike'], 0, 'gear', null)],
  seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
    censusRow(9, 'v1', null, 'hunt', ['v2']), censusRow(10, 'v1', null, 'hunt', ['v2']), censusRow(11, 'v1', null, 'hunt', ['v2'])],
}), 'haven-born', 'fought-personally');
// haven-born, created-by-read (lazy winPlanOf read, neither engaged at creation)
expectBucket('haven-born created-by-read', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanOf', 'villager-brain.js:1025', [], 0, 'gear', null)],
  seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
    censusRow(9, 'v1', null, 'hunt', ['v2']), censusRow(10, 'v1', null, 'hunt', ['v2']), censusRow(11, 'v1', null, 'hunt', ['v2'])],
}), 'haven-born', 'created-by-read');
// seed-created: the seed created the plan and set its target at once (no creation row)
expectBucket('seed-created', baseSeed({
  seedattachBounces: [bounce(5, 'v1', 'strike', 4, null, null, 'gear', 'strike', { sinceDay: 5 })],
  seedattachCensus: [censusRow(5, 'v1', 'strike', 'gear', []), censusRow(7, 'v1', 'strike', 'party', []),
    censusRow(9, 'v1', 'strike', 'hunt', ['v2']), censusRow(10, 'v1', 'strike', 'hunt', ['v2'])],
}), 'seed-created', 'target:strike');
// seeded-then-lost: plan had a target (seed-set at gear), then the target went null
expectBucket('seeded-then-lost', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['strike'], 0, 'gear', null)],
  seedattachBounces: [bounce(6, 'v1', 'strike', 4, 'gear', null, 'party', 'strike', { sinceDay: 5 })],
  seedattachCensus: [censusRow(6, 'v1', 'strike', 'party', []), censusRow(8, 'v1', null, 'hunt', ['v0']),
    censusRow(9, 'v1', null, 'hunt', ['v0']), censusRow(10, 'v1', null, 'hunt', ['v0'])],
}), 'seeded-then-lost', 'target:strike:lost-day:8');
// unknown: creation carries a target but no rule matches (impossible shape — analyzer bug bait)
expectBucket('unknown (targeted creation, no rule)', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['strike'], 0, 'gear', 'strike')],
  seedattachCensus: [censusRow(5, 'v1', 'strike', 'gear', []), censusRow(9, 'v1', 'strike', 'hunt', ['v2']),
    censusRow(10, 'v1', 'strike', 'hunt', ['v2'])],
}), 'unknown', 'no-rule-matched');
// precedence: seeded-then-lost beats haven-born (a lost target is not "never seeded")
expectBucket('precedence seeded-then-lost beats haven-born', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null)],
  seedattachBounces: [bounce(6, 'v1', 'strike', 4, 'gear', null, 'party', 'strike', { sinceDay: 5 })],
  seedattachCensus: [censusRow(6, 'v1', 'strike', 'party', []), censusRow(8, 'v1', null, 'hunt', ['v0']),
    censusRow(9, 'v1', null, 'hunt', ['v0'])],
}), 'seeded-then-lost', 'target:strike:lost-day:8');
// precedence: haven-born plan invited the SAME day it was created -> haven-born, not inherited
expectBucket('precedence same-day haven-born launch -> haven-born', baseSeed({
  seedattachCreations: [creation(10, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['audit'], 0, 'gear', null)],
  seedattachLaunches: [saLaunch(10, 'v0', 'winplan', 'v1', null, null, null)],
  seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
}), 'haven-born', 'fought-personally');
// repeat bounces group into ONE instance
(function () {
  const r = classifyOne(baseSeed({
    seedattachLaunches: [saLaunch(10, 'v0', 'winplan', 'v1', null, null, null)],
    seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
    seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']),
      censusRow(12, 'v1', null, 'hunt', ['v0']), censusRow(13, 'v1', null, 'hunt', ['v0']), censusRow(14, 'v1', null, 'hunt', ['v0'])],
    seedattachBounces: [
      bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 }),
      bounce(14, 'v1', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 }),
    ],
  }));
  check('repeat bounces group into ONE instance (repeatBounces=2)',
    r.instances.length === 1 && r.instances[0].bounces.length === 2,
    'got ' + r.instances.length + ' instances');
})();
// instances that never reach hunt are NOT in the population
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 3, 'gear', null)],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'gear', [])],
  }));
  check('never-hunt instance is NOT in the population (huntInstances=0, instancesTotal=1)',
    r.huntInstances === 0 && r.instancesTotal === 1, 'got hunt=' + r.huntInstances + ' total=' + r.instancesTotal);
})();
// companion-inherited census-only fallback: no launch event, first sighting hunt with a null-target inviter
expectBucket('companion-inherited census-only fallback', baseSeed({
  seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
  seedattachCensus: [
    censusRow(10, 'v0', null, 'hunt', ['v1']),
    censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0']),
  ],
}), 'companion-inherited', 'census-only:inviter-v0');

// ---------- 2b. Lifecycle fixtures ----------
console.log('== lifecycle fixtures ==');
// Q1 conversion: rumor-born plan seeded at party stage, then launches at hunt WITH the named beast
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null)],
    seedattachBounces: [bounce(8, 'v1', 'strike', 4, 'party', null, 'party', 'strike', { sinceDay: 5 })],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
      censusRow(9, 'v1', 'strike', 'party', []), censusRow(10, 'v1', 'strike', 'hunt', ['v2']),
      censusRow(11, 'v1', 'strike', 'hunt', ['v2']), censusRow(12, 'v1', 'strike', 'hunt', ['v2'])],
    rumorplanLaunches: [rumorLaunch(11, 'v1', 'inviter', 'brain', 'v1', 'hunt', 'strike', 'hunt', 'strike', { partyAfter: ['v2'] })],
  }));
  const inst = r.instances[0];
  check('conversion: rumor-born plan converts (converted=true, mechanism seed-party)',
    r.conversions === 1 && inst.converted === true && inst.acquireMechanism === 'seed-party',
    'got conversions=' + r.conversions + ' mechanism=' + inst.acquireMechanism);
  check('conversion: launchStatus launched-targeted, seededBeforeHunt=true',
    inst.launchStatus === 'launched-targeted' && inst.seededBeforeHunt === true,
    'got ' + inst.launchStatus + ' seededBeforeHunt=' + inst.seededBeforeHunt);
})();
// acquired-but-unlaunched: rumor-born plan gains a wave-4 target but never launches with it
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null)],
    seedattachBounces: [bounce(8, 'v1', 'strike', 4, 'party', null, 'party', 'strike', { sinceDay: 5 })],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
      censusRow(9, 'v1', 'strike', 'party', []), censusRow(10, 'v1', 'strike', 'hunt', ['v2']),
      censusRow(11, 'v1', 'strike', 'hunt', ['v2'])],
    rumorplanTargetDiffs: [targetDiff(8, 'v1', null, 'strike', 'party')],
  }));
  const inst = r.instances[0];
  check('acquired-but-unlaunched: target gained, no converting launch',
    r.conversions === 0 && r.acquiredButUnlaunched === 1 && inst.acquiredButUnlaunched === true,
    'got conversions=' + r.conversions + ' acquired=' + r.acquiredButUnlaunched);
})();
// launched-target-null: rumor-born plan launches at hunt with no target
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null)],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
      censusRow(9, 'v1', null, 'hunt', ['v2']), censusRow(10, 'v1', null, 'hunt', ['v2']),
      censusRow(11, 'v1', null, 'hunt', ['v2']), censusRow(12, 'v1', null, 'hunt', ['v2'])],
    rumorplanLaunches: [rumorLaunch(11, 'v1', 'inviter', 'brain', 'v1', 'hunt', null, 'hunt', null, { partyAfter: ['v2'] })],
  }));
  const inst = r.instances[0];
  check('launched-target-null: rumor-born launches with no target',
    inst.launchStatus === 'launched-target-null' && inst.converted === false && r.conversions === 0,
    'got ' + inst.launchStatus + ' conversions=' + r.conversions);
  check('Q3 trip recorded for the target-null launch (trips.total=1, withEncounters=0)',
    r.trips.total === 1 && r.trips.withEncounters === 0, JSON.stringify(r.trips));
})();
// churned: hunt -> party (outmatched demotion shape)
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null)],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(9, 'v1', null, 'hunt', ['v2']),
      censusRow(10, 'v1', null, 'party', [])],
  }));
  check('churned: hunt->party terminal is churned:party',
    r.instances[0].terminal === 'churned:party', 'got ' + r.instances[0].terminal);
})();
// holder-died: last census row shows the holder dead
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null)],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(9, 'v1', null, 'hunt', ['v2']),
      censusRow(10, 'v1', null, 'hunt', ['v2'], 5, { holderAlive: false })],
  }));
  check('holder-died: terminal is holder-died',
    r.instances[0].terminal === 'holder-died', 'got ' + r.instances[0].terminal);
})();
// superseded: deleted-then-recreated plan is two instances, the first superseded
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [
      creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null),
      creation(20, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['strike'], 0, 'gear', null),
    ],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(9, 'v1', null, 'hunt', ['v2']),
      censusRow(15, 'v1', null, 'hunt', ['v2']),
      censusRow(20, 'v1', null, 'gear', []), censusRow(22, 'v1', null, 'gear', [])],
  }));
  check('superseded: two instances, first terminal superseded, second never-hunt',
    r.instancesTotal === 2 && r.huntInstances === 1 && r.instances[0].terminal === 'superseded',
    'got total=' + r.instancesTotal + ' hunt=' + r.huntInstances + ' terminal=' + (r.instances[0] || {}).terminal);
})();

// ---------- 2c. Q2 launch-share fixtures ----------
console.log('== launch-share fixtures ==');
(function () {
  // Two wave-4+ launched plans: a heard-at-fire inviter launching WITH
  // the named beast (strict), and a companion-inherited companion
  // launching target-null whose instance has a wave-4 bounce in its
  // history (broad only).
  const r = classifyOne(baseSeed({
    seedattachCreations: [
      creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null),
      creation(10, 'v2', 'winPlanOf', 'villager-brain.js:1048', [], 0, 'gear', null),
    ],
    seedattachBounces: [
      bounce(8, 'v1', 'strike', 4, 'party', null, 'party', 'strike', { sinceDay: 5 }),
      bounce(12, 'v2', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 10 }),
    ],
    seedattachLaunches: [saLaunch(10, 'v1', 'brain', 'v2', 'strike', null, null)],
    seedattachCensus: [
      censusRow(5, 'v1', null, 'gear', []), censusRow(9, 'v1', 'strike', 'hunt', ['v2']),
      censusRow(10, 'v1', 'strike', 'hunt', ['v2']), censusRow(11, 'v1', 'strike', 'hunt', ['v2']),
      censusRow(10, 'v2', null, 'hunt', ['v1']), censusRow(11, 'v2', null, 'hunt', ['v1']),
      censusRow(12, 'v2', null, 'hunt', ['v1']),
    ],
    rumorplanLaunches: [
      rumorLaunch(11, 'v1', 'inviter', 'brain', 'v1', 'hunt', 'strike', 'hunt', 'strike', { partyAfter: ['v2'] }),
      rumorLaunch(11, 'v2', 'companion', 'brain', 'v1', 'hunt', null, 'hunt', null, { partyAfter: ['v1'] }),
    ],
  }));
  check('Q2 shares: 2 wave-4+ launched plans (heard-at-fire 1, companion-inherited 1), unknown 0',
    r.launchShares.total === 2 && r.launchShares.byOrigin['heard-at-fire'] === 1 &&
    r.launchShares.byOrigin['companion-inherited'] === 1 && r.launchShares.unknown === 0,
    JSON.stringify(r.launchShares));
  check('Q2 strict: only the named-beast launch is strict (strict=1)',
    r.launchShares.strict === 1 && r.launchShares.byOriginStrict['heard-at-fire'] === 1 &&
    (r.launchShares.byOriginStrict['companion-inherited'] || 0) === 0,
    JSON.stringify(r.launchShares.byOriginStrict));
  check('Q2 hunt shares: both launched plans are hunt-stage (hunt total=2)',
    r.huntLaunchShares.total === 2, 'got ' + r.huntLaunchShares.total);
})();
// party-stage launch with a wave-4+ target: counts in Q2 (broad), NOT in hunt shares
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 5, 'gear', null)],
    seedattachBounces: [bounce(8, 'v1', 'strike', 4, 'party', null, 'party', 'strike', { sinceDay: 5 })],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
      censusRow(9, 'v1', 'strike', 'party', []), censusRow(10, 'v1', 'strike', 'party', [])],
    rumorplanLaunches: [rumorLaunch(9, 'v1', 'inviter', 'brain', 'v1', 'party', 'strike', 'party', 'strike', { partyAfter: ['v2'] })],
  }));
  check('party-stage wave-4+ launch counts in Q2 but not in hunt shares',
    r.launchShares.total === 1 && r.huntLaunchShares.total === 0 && r.huntInstances === 0,
    'got q2=' + r.launchShares.total + ' hunt=' + r.huntLaunchShares.total + ' huntInstances=' + r.huntInstances);
})();

// ---------- 2d. Corpus-bar regression (count, not .length) ----------
(function () {
  check('corpusBarPass: 8/8 main + 8 baseline passes',
    ANALYZE.corpusBarPass({ files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] }, { files: 8 }) === true);
  check('corpusBarPass: 8 main, no baseline passes',
    ANALYZE.corpusBarPass({ files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] }, null) === true);
  check('corpusBarPass: 7 baseline files fails',
    ANALYZE.corpusBarPass({ files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] }, { files: 7 }) === false);
  check('corpusBarPass: 7 main files fails',
    ANALYZE.corpusBarPass({ files: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { files: 8 }) === false);
})();
(function () {
  const one = ANALYZE.classifyRumor(baseSeed({
    seedattachLaunches: [saLaunch(10, 'v0', 'winplan', 'v1', null, null, null)],
    seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
    seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
  }));
  const leg = { bySeed: { 102011: one }, files: ['a.json'] };
  const sum = ANALYZE.summarize(leg);
  check('summarize returns files as a count (not an array)', sum.files === 1, 'got ' + JSON.stringify(sum.files));
  check('summarize counts the one opened hunt instance', sum.huntInstances === 1, 'got ' + sum.huntInstances);
  check('summarize bucket table carries the instance', sum.byBucket['companion-inherited'] === 1, JSON.stringify(sum.byBucket));
})();

// ---------- 3. Recorder: live in-memory runs (shape + both LEG policies) ----------
console.log('== recorder live ==');
function loadDriverFresh(leg) {
  const driverPath = path.join(REPO, 'scripts', 'rumorplan-driver-20261116.js');
  delete require.cache[require.resolve(driverPath)];
  process.env.LEG = leg;
  process.env.DAYS = '5';
  process.env.TABLESEATNOWAIT = '1';
  process.env.LEANLINKRESCUE = '1';
  return require(driverPath);
}
async function liveRuns() {
  const d1 = loadDriverFresh('tableseat-nowait');
  const out = await d1.oneRun(102011);
  check('live tableseat-nowait run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run policy is tableseat-nowait, sha a11a1abc672e', out.policy === 'tableseat-nowait' && out.policySha === 'a11a1abc672e',
    'got ' + out.policy + '/' + out.policySha);
  check('live run carries rumorplan arrays', Array.isArray(out.rumorplanLaunches) && Array.isArray(out.rumorplanTargetDiffs));
  check('live run carries seedattach arrays', Array.isArray(out.seedattachBounces) && Array.isArray(out.seedattachCreations) &&
    Array.isArray(out.seedattachLaunches) && Array.isArray(out.seedattachCensus));
  check('live run carries dawnbid + v4 arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.v4seeds) && Array.isArray(out.v4encounters));
  check('live run carries wave4Ids + wave5Ids (10 + 10)', Array.isArray(out.wave4Ids) && out.wave4Ids.length === 10 &&
    Array.isArray(out.wave5Ids) && out.wave5Ids.length === 10,
    'got w4=' + (out.wave4Ids || []).length + ' w5=' + (out.wave5Ids || []).length);
  const badBounce = (out.seedattachBounces || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && ('stageBefore' in r) && ('targetBefore' in r) && ('stageAfter' in r) && ('targetAfter' in r) && Array.isArray(r.foughtAtBounce));
  });
  check('bounce rows have their shape (before + after + fought)', !badBounce, badBounce ? JSON.stringify(badBounce).slice(0, 200) : '');
  const badCreation = (out.seedattachCreations || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && r.createdBy && ('creatorSite' in r) && Array.isArray(r.fought) && ('villageSlainTotal' in r));
  });
  check('creation rows have their shape', !badCreation, badCreation ? JSON.stringify(badCreation).slice(0, 200) : '');
  const badCensus = (out.seedattachCensus || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && ('target' in r) && r.stage && ('sinceDay' in r) && ('party' in r));
  });
  check('census rows have their shape (target may be null)', !badCensus, badCensus ? JSON.stringify(badCensus).slice(0, 200) : '');
  const badLaunch = (out.rumorplanLaunches || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && (r.role === 'inviter' || r.role === 'companion') &&
      (r.path === 'winplan' || r.path === 'brain') && ('stageBefore' in r) && ('targetBefore' in r) &&
      ('stageAfter' in r) && ('targetAfter' in r) && (r.expedStart === 'yes' || r.expedStart === 'unknown') &&
      ('expedBefore' in r) && ('expedAfter' in r));
  });
  check('rumorplan launch rows have their shape (before + after + exped gate)', !badLaunch,
    badLaunch ? JSON.stringify(badLaunch).slice(0, 300) : '');
  const badDiff = (out.rumorplanTargetDiffs || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && ('from' in r) && ('to' in r) && r.source === 'census-diff');
  });
  check('rumorplan target-diff rows have their shape', !badDiff, badDiff ? JSON.stringify(badDiff).slice(0, 200) : '');
  const d2 = loadDriverFresh('competent');
  const out2 = await d2.oneRun(102011);
  check('live competent run completes with 0 instrument errors', out2.instrumentErrors.length === 0, JSON.stringify(out2.instrumentErrors.slice(0, 3)));
  check('live run policy is competent, sha 74a890f0844e', out2.policy === 'competent' && out2.policySha === '74a890f0844e',
    'got ' + out2.policy + '/' + out2.policySha);
  check('live run carries rumorplan arrays on the competent leg too', Array.isArray(out2.rumorplanLaunches) && Array.isArray(out2.rumorplanTargetDiffs));
}

// ---------- 4. Determinism legs D1 + D2 (60d, seed 102011, tableseat-nowait, flags on) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60', LEG: 'tableseat-nowait',
    TABLESEATNOWAIT: '1', LEANLINKRESCUE: '1' }, envExtra || {});
  const script = "const d=require('./scripts/rumorplan-driver-20261116.js');" +
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
  const off = childFingerprint({ RUMORPLAN_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty rumorplan/seedattach/v4/dawnbid arrays',
    (off.full.rumorplanLaunches || []).length === 0 && (off.full.rumorplanTargetDiffs || []).length === 0 &&
    (off.full.seedattachBounces || []).length === 0 && (off.full.seedattachCensus || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidScores || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  // The launch wrap must have fired at least once in 60d on this seed
  // (otherwise the before-state proof below is vacuous).
  const launches = a.full.rumorplanLaunches || [];
  check('D1 60d run produced >=1 rumorplan launch row (before-state proof is non-vacuous)',
    launches.length >= 1, 'got ' + launches.length);
  const badBefore = launches.find(function (r) {
    // The gate's promise is about the INVITER: this call started their
    // expedition. A companion's own start is flagged on the row
    // (expedAfter), not gated here — the brain mirror can set a
    // companion's stage to hunt without their expedition starting.
    return !('stageBefore' in r) || !('targetBefore' in r) ||
      (r.role === 'inviter' && r.expedBefore !== false);
  });
  check('every launch row records a true expedition start (inviter expedBefore=false, expedStart yes/unknown)',
    !badBefore, badBefore ? JSON.stringify(badBefore).slice(0, 300) : '');
  const invRows = launches.filter(function (r) { return r.role === 'inviter'; });
  const compRows = launches.filter(function (r) { return r.role === 'companion'; });
  check('launch rows cover both roles (inviter + companion present)',
    invRows.length >= 1 && compRows.length >= 1,
    'inviter=' + invRows.length + ' companion=' + compRows.length);
}

(async function () {
  try {
    await liveRuns();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
