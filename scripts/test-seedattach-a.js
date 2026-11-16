// test-seedattach-a.js — proof for arm sim-seedattach-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): this arm touches NO src file (instrument-only), the driver
// wraps exist (incl. the BEFORE-state seed wrap and the creation
// wraps), the taxonomy's code anchors still hold (two target-write
// sites, four hunt-entry sites, the seed early return), the wave-4 id
// set matches the data, the classifier places one fixture per bucket /
// sub-reason (incl. precedence, the same-day-launch exclusion, repeat
// bounces, already-targeted secondary counts, the census-only
// fallback), the recorder rows have their shape, both LEG policies
// load with their frozen shas, and the determinism legs D1
// (repeatability) + D2 (wrap neutrality) are green at 60d on seed
// 100871.
// Usage:
//   node scripts/test-seedattach-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-seedattach-a.js'));

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
  return /scripts\/(seedattach-driver-20261115|analyze-seedattach-a|test-seedattach-a)\.js$/.test(s);
});
check('scripts worktree diff is seedattach-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'seedattach-driver-20261115.js'), 'utf8');
for (const w of ['winPlanOf', 'winPlanHavenTick', 'winPlanSeedFromFight', 'winPlanDepart', 'vbrainExecuteDepart',
  'seedattachBounces', 'seedattachCreations', 'seedattachLaunches', 'seedattachCensus']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has SEEDATTACH_RECORDER off-switch', driverSrc.indexOf('SEEDATTACH_RECORDER') !== -1);
check('driver has LEG policy switch (competent|tableseat-nowait)', driverSrc.indexOf("LEG === 'tableseat-nowait'") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records BEFORE-state in the seed wrap', driverSrc.indexOf('stageBefore') !== -1 && driverSrc.indexOf('targetBefore') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
// Taxonomy anchors: the code the buckets are built on must still hold.
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('anchor: seed writes target only for gear/party (early return present)',
  winPlanJs.indexOf("plan.stage !== 'gear' && plan.stage !== 'party'") !== -1);
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
    seed: 100871, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4encounters: [],
    seedattachBounces: [], seedattachCreations: [], seedattachLaunches: [], seedattachCensus: [],
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
function launch(day, inviterVid, pathName, companion, inviterTargetBefore, companionTargetBefore, companionTargetAfter) {
  return { day: day, vid: inviterVid, path: pathName, result: 'launch',
    inviterTargetBefore: inviterTargetBefore, companion: companion,
    companionTargetBefore: companionTargetBefore, companionTargetAfter: companionTargetAfter };
}
function censusRow(day, vid, target, stage, party, sinceDay) {
  return { day: day, vid: vid, target: target, needWave: null, stage: stage,
    party: party || [], sinceDay: (sinceDay != null ? sinceDay : 5), node: null,
    holderAlive: true, holderNode: { nx: 0, ny: 0 }, holderExped: false,
    holderSick: false, holderHealth: 100 };
}
function classifyOne(j) {
  const r = ANALYZE.classifySeed(j);
  return r;
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
  seedattachLaunches: [launch(10, 'v0', 'winplan', 'v1', null, null, null)],
  seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
  seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
  seedattachBounces: [bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
}), 'companion-inherited', 'winplan:inviter-v0');
// companion-inherited via the brain mirror (companion keeps its null target — no copy)
expectBucket('companion-inherited via brain mirror', baseSeed({
  seedattachLaunches: [launch(10, 'v0', 'brain', 'v1', null, null, null)],
  seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'villager-brain.js:1048', [], 0, 'gear', null)],
  seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
  seedattachBounces: [bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
}), 'companion-inherited', 'brain:inviter-v0');
// haven-born-never-seeded, fought-personally (inviter's own plan; launched with a companion)
expectBucket('haven-born fought-personally', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['strike'], 0, 'gear', null)],
  seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
    censusRow(9, 'v1', null, 'hunt', ['v2']), censusRow(10, 'v1', null, 'hunt', ['v2']), censusRow(11, 'v1', null, 'hunt', ['v2'])],
  seedattachBounces: [bounce(11, 'v1', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 5, fought: ['strike'] })],
}), 'haven-born-never-seeded', 'fought-personally');
// haven-born-never-seeded, heard-at-fire (rumor-only, no beast met)
expectBucket('haven-born heard-at-fire', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', [], 3, 'gear', null)],
  seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
    censusRow(9, 'v1', null, 'hunt', ['v2']), censusRow(10, 'v1', null, 'hunt', ['v2']), censusRow(11, 'v1', null, 'hunt', ['v2'])],
  seedattachBounces: [bounce(11, 'v1', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
}), 'haven-born-never-seeded', 'heard-at-fire');
// haven-born-never-seeded, created-by-read (lazy winPlanOf read, neither engaged at creation)
expectBucket('haven-born created-by-read', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanOf', 'villager-brain.js:1025', [], 0, 'gear', null)],
  seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(7, 'v1', null, 'party', []),
    censusRow(9, 'v1', null, 'hunt', ['v2']), censusRow(10, 'v1', null, 'hunt', ['v2']), censusRow(11, 'v1', null, 'hunt', ['v2'])],
  seedattachBounces: [bounce(11, 'v1', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
}), 'haven-born-never-seeded', 'created-by-read');
// seeded-then-lost: plan had a target (seed-set at gear), then a launch overwrote it to null
expectBucket('seeded-then-lost', baseSeed({
  seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['strike'], 0, 'gear', null)],
  seedattachBounces: [
    bounce(6, 'v1', 'strike', 4, 'gear', null, 'party', 'strike', { sinceDay: 5 }),
    bounce(10, 'v1', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 }),
  ],
  seedattachLaunches: [launch(8, 'v0', 'winplan', 'v1', null, null, null)],
  seedattachCensus: [censusRow(6, 'v1', 'strike', 'party', []), censusRow(8, 'v1', null, 'hunt', ['v0']),
    censusRow(9, 'v1', null, 'hunt', ['v0']), censusRow(10, 'v1', null, 'hunt', ['v0'])],
}), 'seeded-then-lost', 'target:strike:lost-day:8');
// unknown: bounce with no creation, no launch, no census at all
expectBucket('unknown (no provenance anywhere)', baseSeed({
  seedattachBounces: [bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
}), 'unknown', 'no-rule-matched');
// precedence: haven-born plan invited the SAME day it was created -> haven-born, not inherited
expectBucket('precedence same-day haven-born launch -> haven-born', baseSeed({
  seedattachCreations: [creation(10, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['audit'], 0, 'gear', null)],
  seedattachLaunches: [launch(10, 'v0', 'winplan', 'v1', null, null, null)],
  seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
  seedattachBounces: [bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 10 })],
}), 'haven-born-never-seeded', 'fought-personally');
// repeat bounces group into ONE instance
(function () {
  const r = classifyOne(baseSeed({
    seedattachLaunches: [launch(10, 'v0', 'winplan', 'v1', null, null, null)],
    seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
    seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']),
      censusRow(12, 'v1', null, 'hunt', ['v0']), censusRow(13, 'v1', null, 'hunt', ['v0']), censusRow(14, 'v1', null, 'hunt', ['v0'])],
    seedattachBounces: [
      bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 }),
      bounce(14, 'v1', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 }),
    ],
  }));
  check('repeat bounces group into ONE instance (repeatBounces=2)',
    r.instances.length === 1 && r.instances[0].repeatBounces === 2,
    'got ' + r.instances.length + ' instances, repeatBounces=' + ((r.instances[0] || {}).repeatBounces));
})();
// already-targeted bounces are secondary, not instances; opens + creates are not instances
(function () {
  const r = classifyOne(baseSeed({
    seedattachBounces: [
      bounce(6, 'v1', 'strike', 4, 'gear', null, 'party', 'strike', { sinceDay: 5 }),
      bounce(7, 'v2', 'audit', 4, null, null, 'gear', 'audit', { sinceDay: 7 }),
      bounce(8, 'v3', 'strike', 4, 'hunt', 'strike', 'hunt', 'strike', { sinceDay: 5 }),
      bounce(9, 'v4', 'herald', 3, 'party', null, 'party', 'herald', { sinceDay: 5 }),
    ],
  }));
  check('opens/creates/targeted bounces open 0 instances', r.instances.length === 0, 'got ' + r.instances.length);
  check('secondary counts: opened=2 noPlanCreated=1 bouncedTargeted=1',
    r.secondary.opened === 2 && r.secondary.noPlanCreated === 1 && r.secondary.bouncedTargeted === 1,
    JSON.stringify(r.secondary));
  check('secondary seed-call split: w4=3 w3=1',
    r.secondary.seedCallsW4 === 3 && r.secondary.seedCallsW3 === 1, JSON.stringify(r.secondary));
})();
// census-only fallback: no launch event, first sighting hunt with a null-target inviter
expectBucket('companion-inherited census-only fallback', baseSeed({
  seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
  seedattachCensus: [
    censusRow(10, 'v0', null, 'hunt', ['v1']),
    censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(11, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0']),
  ],
  seedattachBounces: [bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
}), 'companion-inherited', 'census-only:inviter-v0');
// context: node null + plan age are recorded on the instance (not buckets)
(function () {
  const r = classifyOne(baseSeed({
    seedattachCreations: [creation(5, 'v1', 'winPlanHavenTick', 'win-plan.js:winPlanHavenTick', ['strike'], 0, 'gear', null)],
    seedattachCensus: [censusRow(5, 'v1', null, 'gear', []), censusRow(11, 'v1', null, 'hunt', ['v2'])],
    seedattachBounces: [bounce(11, 'v1', 'audit', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
  }));
  check('instance records node-at-bounce + plan age as context',
    r.instances.length === 1 && r.instances[0].nodeAtFirstBounce === null && r.instances[0].planAgeAtFirstBounce === 6,
    'got node=' + JSON.stringify((r.instances[0] || {}).nodeAtFirstBounce) + ' age=' + (r.instances[0] || {}).planAgeAtFirstBounce);
})();

// ---------- 2b. Analyzer summarize shape (regression: files is a count) ----------
(function () {
  const one = ANALYZE.classifySeed(baseSeed({
    seedattachLaunches: [launch(10, 'v0', 'winplan', 'v1', null, null, null)],
    seedattachCreations: [creation(10, 'v1', 'winPlanOf', 'win-plan.js:438', [], 0, 'gear', null)],
    seedattachCensus: [censusRow(10, 'v1', null, 'hunt', ['v0']), censusRow(12, 'v1', null, 'hunt', ['v0'])],
    seedattachBounces: [bounce(12, 'v1', 'strike', 4, 'hunt', null, 'hunt', null, { sinceDay: 5 })],
  }));
  const leg = { bySeed: { 100871: one }, files: ['a.json'] };
  const sum = ANALYZE.summarize(leg);
  check('summarize returns files as a count (not an array)', sum.files === 1, 'got ' + JSON.stringify(sum.files));
  check('summarize counts the one opened instance', sum.instancesOpened === 1, 'got ' + sum.instancesOpened);
  check('summarize bucket table carries the instance', sum.byBucket['companion-inherited'] === 1, JSON.stringify(sum.byBucket));
})();

// ---------- 3. Recorder: live in-memory runs (shape + both LEG policies) ----------
console.log('== recorder live ==');
function loadDriverFresh(leg) {
  const driverPath = path.join(REPO, 'scripts', 'seedattach-driver-20261115.js');
  delete require.cache[require.resolve(driverPath)];
  process.env.LEG = leg;
  process.env.DAYS = '5';
  return require(driverPath);
}
async function liveRuns() {
  const d1 = loadDriverFresh('competent');
  const out = await d1.oneRun(100871);
  check('live competent run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run policy is competent, sha 74a890f0844e', out.policy === 'competent' && out.policySha === '74a890f0844e',
    'got ' + out.policy + '/' + out.policySha);
  check('live run carries seedattach arrays', Array.isArray(out.seedattachBounces) && Array.isArray(out.seedattachCreations) &&
    Array.isArray(out.seedattachLaunches) && Array.isArray(out.seedattachCensus));
  check('live run carries dawnbid + v4 arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.v4seeds) && Array.isArray(out.v4encounters));
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
  const d2 = loadDriverFresh('tableseat-nowait');
  const out2 = await d2.oneRun(100871);
  check('live tableseat-nowait run completes with 0 instrument errors', out2.instrumentErrors.length === 0, JSON.stringify(out2.instrumentErrors.slice(0, 3)));
  check('live run policy is tableseat-nowait, sha a11a1abc672e', out2.policy === 'tableseat-nowait' && out2.policySha === 'a11a1abc672e',
    'got ' + out2.policy + '/' + out2.policySha);
  check('live run carries seedattach arrays on the baseline leg too', Array.isArray(out2.seedattachBounces) && Array.isArray(out2.seedattachCensus));
}

// ---------- 4. Determinism legs D1 + D2 (60d, seed 100871, competent) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60', LEG: 'competent' }, envExtra || {});
  const script = "const d=require('./scripts/seedattach-driver-20261115.js');" +
    "d.oneRun(100871).then(function(o){" +
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
  const off = childFingerprint({ SEEDATTACH_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty seedattach/v4/dawnbid arrays',
    (off.full.seedattachBounces || []).length === 0 && (off.full.seedattachCensus || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidScores || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
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
