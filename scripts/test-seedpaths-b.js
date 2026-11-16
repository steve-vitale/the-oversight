// test-seedpaths-b.js — proof for arm sim-seedpaths-b (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seed call's presence matches SEEDPATHS_SEED_CALL
// (default 'on'; 'off' is the post-revert not-built shape), the
// driver wraps exist (incl. the seed-path classification in the
// winPlanSeedFromFight wrap), the game-code diff is the seed call
// only, the wave-4 id set matches the data, the four call sites
// exist where the prereg says they do, classifySeedPath places one
// fixture per path (plus unknown cases), the seed-path analyzer
// attributes instances first-seeder-wins (multi-firing, retarget,
// non-opening-seed, launched, and unknown-path cases), the recorder
// rows carry a path on every seed row, and the determinism legs D1
// (repeatability) + D2 (wrap neutrality) are green at 60d on seed
// 102131, with a 150d live run proving every recorded seed row
// carries a named path.
// Usage:
//   node scripts/test-seedpaths-b.js            (seed call expected ON)
//   SEEDPATHS_SEED_CALL=off node scripts/test-seedpaths-b.js   (post-revert shape)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.SEEDPATHS_SEED_CALL || 'on';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-seedpaths-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'));

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
check('seed call present iff SEEDPATHS_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const srcOk = srcStatus.every(function (s) { return /src\/js\/game\.js$/.test(s); }) &&
  (SEED_CALL_EXPECTED === 'off' ? srcStatus.length === 0 : true);
check('game-code worktree diff is the seed call only (src status: ' + JSON.stringify(srcStatus) + ')', srcOk);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*seedpaths-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is seedpaths-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'startExpedition', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'poolReplica', 'members', 'classifySeedPath', 'firstCallerFrame', 'SEEDPATHS_RECORDER']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver records path + caller on v4seeds rows', driverSrc.indexOf('path: seedPath') !== -1 && driverSrc.indexOf('caller: seedCaller') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
// The four call sites exist where the prereg says they do (call TEXT
// is the anchor — line numbers drift daily).
check('world-tick call site: resolveWildMonsterEncounter seeds on vFlee (game.js)',
  gameJs.indexOf('resolveWildMonsterEncounter') !== -1 &&
  (SEED_CALL_EXPECTED === 'off' || gameJs.indexOf("rec.outcome === 'vFlee'") !== -1));
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
check('agency evade call site: expeditionMonster seeds on evade (villager-agency.js)',
  agencyJs.indexOf("this.winPlanSeedFromFight(vid, m, 'evaded')") !== -1);
check('agency flee call site: expeditionMonster seeds on vFlee (villager-agency.js)',
  agencyJs.indexOf("this.winPlanSeedFromFight(vid, m, 'fled')") !== -1);
check('agency evade + flee share expeditionMonster (one function, outcome disambiguates)',
  agencyJs.indexOf('expeditionMonster(vid, dist, playerAtHaven)') !== -1);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('gate avoid call site: winPlanFightGate seeds on avoid (win-plan.js)',
  winPlanJs.indexOf("this.winPlanSeedFromFight(vid, mdef, 'avoided')") !== -1);
check('gate avoid seeds ONLY when no plan exists (else-branch)',
  winPlanJs.indexOf("else this.winPlanSeedFromFight(vid, mdef, 'avoided')") !== -1);

// ---------- 2. classifySeedPath unit fixtures ----------
console.log('== classifySeedPath fixtures ==');
function fakeStack(frames) {
  return 'Error: seedpaths-caller\n' + frames.map(function (f) { return '    at ' + f; }).join('\n');
}
const STACK_WORLD_TICK = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:401:20)',
  'Object.resolveWildMonsterEncounter (/home/hatch/workspace/the-scattering/src/js/game.js:20940:10)',
  'Object.resolveWorldMonster (/home/hatch/workspace/the-scattering/src/js/game.js:20845:12)',
]);
const STACK_AGENCY = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:401:20)',
  'Object.expeditionMonster (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:660:40)',
  'Object.expeditionLeg (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:559:12)',
]);
const STACK_AGENCY_FLEE = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:401:20)',
  'Object.expeditionMonster (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:743:40)',
  'Object.expeditionLeg (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:559:12)',
]);
const STACK_GATE = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:401:20)',
  'Object.winPlanFightGate (/home/hatch/workspace/the-scattering/src/js/win-plan.js:512:15)',
  'Object.expeditionMonster (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:630:20)',
]);
check("'fled' + resolveWildMonsterEncounter stack -> world-tick",
  DRIVER.classifySeedPath('fled', STACK_WORLD_TICK) === 'world-tick',
  DRIVER.classifySeedPath('fled', STACK_WORLD_TICK));
check("'evaded' + expeditionMonster stack -> agency-evade",
  DRIVER.classifySeedPath('evaded', STACK_AGENCY) === 'agency-evade',
  DRIVER.classifySeedPath('evaded', STACK_AGENCY));
check("'fled' + expeditionMonster stack -> agency-flee (same outcome as world-tick, stack disambiguates)",
  DRIVER.classifySeedPath('fled', STACK_AGENCY_FLEE) === 'agency-flee',
  DRIVER.classifySeedPath('fled', STACK_AGENCY_FLEE));
check("'avoided' + winPlanFightGate stack -> gate-avoid",
  DRIVER.classifySeedPath('avoided', STACK_GATE) === 'gate-avoid',
  DRIVER.classifySeedPath('avoided', STACK_GATE));
check("'fled' + empty stack -> unknown-fled-no-caller (explicit, never a silent default)",
  DRIVER.classifySeedPath('fled', '') === 'unknown-fled-no-caller',
  DRIVER.classifySeedPath('fled', ''));
check("'evaded' + world-tick stack -> unknown-evaded-no-agency-frame (outcome/stack mismatch is named)",
  DRIVER.classifySeedPath('evaded', STACK_WORLD_TICK) === 'unknown-evaded-no-agency-frame',
  DRIVER.classifySeedPath('evaded', STACK_WORLD_TICK));
check("'avoided' + agency stack -> unknown-avoided-no-gate-frame",
  DRIVER.classifySeedPath('avoided', STACK_AGENCY) === 'unknown-avoided-no-gate-frame',
  DRIVER.classifySeedPath('avoided', STACK_AGENCY));
check("unknown outcome 'stood-down' -> unknown-outcome (named, not a path)",
  DRIVER.classifySeedPath('stood-down', STACK_WORLD_TICK) === 'unknown-outcome:stood-down',
  DRIVER.classifySeedPath('stood-down', STACK_WORLD_TICK));
check('firstCallerFrame skips the driver wrap frame and returns the game caller',
  (DRIVER.firstCallerFrame(STACK_WORLD_TICK) || '').indexOf('resolveWildMonsterEncounter') !== -1,
  String(DRIVER.firstCallerFrame(STACK_WORLD_TICK)));
check('firstCallerFrame on an empty stack returns null (not a crash)',
  DRIVER.firstCallerFrame('') === null);
check('SEED_PATHS lists exactly the four named paths',
  JSON.stringify(DRIVER.SEED_PATHS) === JSON.stringify(['world-tick', 'agency-evade', 'agency-flee', 'gate-avoid']),
  JSON.stringify(DRIVER.SEED_PATHS));

// ---------- 3. Seed-path analyzer fixtures ----------
// Fixture builders (same shapes as test-poolmarginals-b.js, with
// seedRow extended to carry path + caller).
console.log('== seed-path analyzer fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 102131, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], companionPool: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
  };
  return Object.assign(j, over || {});
}
function seedRow(day, vid, target, wave, stageAfter, outcome, pathName, caller) {
  return { day: day, vid: vid, mid: target, wave: wave, outcome: outcome || 'fled',
    path: pathName || 'agency-flee', caller: caller || 'Object.expeditionMonster (villager-agency.js:743:40)',
    stageAfter: stageAfter, target: target, node: { nx: 1, ny: 1 } };
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
function memberFor(firstFail, id) {
  const base = { id: id, profile: 'wanderer', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 },
    away: false, engaged: false, onExped: false, alive: true, firstFail: firstFail };
  if (firstFail === 'selfOrScholar') return { id: id, profile: null, trust: 10, trustRaw: null, node: null,
    away: false, engaged: false, onExped: false, alive: true, firstFail: firstFail };
  if (firstFail === 'notRanger') { base.profile = 'forager'; return base; }
  return base;
}
function poolRow(day, vid, target, stage, holderProfile, counts, eligible, rankedPick, bidCompanion, agree) {
  let rosterN = 0;
  for (const k of Object.keys(counts)) rosterN += counts[k];
  const members = [];
  let mx = 1;
  const order = ['selfOrScholar', 'dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped', 'eligible'];
  let eligIdx = 0;
  for (const cond of order) {
    const n = (counts[cond] | 0);
    for (let i = 0; i < n; i++) {
      if (cond === 'selfOrScholar') { members.push(memberFor('selfOrScholar', i === 0 ? 'v1' : 'scholar')); continue; }
      if (cond === 'eligible') {
        const id = (eligible && eligible[eligIdx] != null) ? eligible[eligIdx] : ('mx' + (mx++));
        eligIdx++;
        members.push(memberFor('eligible', id));
        continue;
      }
      members.push(memberFor(cond, 'mx' + (mx++)));
    }
  }
  const fails = {};
  for (const m of members) if (m && m.id != null) fails[m.id] = m.firstFail;
  return { day: day, part: 0, vid: vid, target: target, stage: stage,
    holderProfile: holderProfile, holderNode: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 },
    rosterN: rosterN, counts: counts, fails: fails,
    eligible: (eligible || []).slice(),
    rankedOrder: (eligible || []).map(function (id) { return { id: id, s: null }; }),
    rankedPick: rankedPick || null, rankedVia: 'companionRank',
    bidCompanion: bidCompanion === undefined ? null : bidCompanion,
    agree: agree === undefined ? null : agree,
    members: members };
}
const BLOCKED_COUNTS = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 };
function classifyOne(j) { return ANALYZE.classifySeedPaths(j); }

// S1: instance opened by agency-evade -> first-seeder agency-evade, attributed.
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party', 'evaded', 'agency-evade')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', BLOCKED_COUNTS, [], null, null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const inst = (r.instances || [])[0] || {};
  check('S1 agency-evade opens -> firstSeeder agency-evade, attributed, coverage 1',
    r.instancesOpened === 1 && inst.firstSeeder === 'agency-evade' && inst.attributed === true &&
    r.attributionCoverage === 1 && r.unattributedInstances.length === 0 && r.replayMismatch == null,
    'instances=' + r.instancesOpened + ' firstSeeder=' + inst.firstSeeder + ' coverage=' + r.attributionCoverage + ' replay=' + r.replayMismatch);
  check('S1 rows by path count the evade row (wave>=4)',
    r.seedRowsByPath['agency-evade'] === 1 && r.seedRowsW4ByPath['agency-evade'] === 1,
    JSON.stringify(r.seedRowsByPath));
})();
// S2: multi-firing — world-tick opens, agency-flee refreshes, a
// non-opening gate-avoid seed (stageAfter hunt) fires while live:
// first-seeder stays world-tick, firings list all three paths.
(function () {
  const j = baseSeed({
    v4seeds: [
      seedRow(10, 'v1', 'strike', 4, 'party', 'fled', 'world-tick', 'Object.resolveWildMonsterEncounter (game.js:20940:10)'),
      seedRow(12, 'v1', 'strike', 4, 'party', 'fled', 'agency-flee'),
      seedRow(14, 'v1', 'strike', 4, 'hunt', 'avoided', 'gate-avoid', 'Object.winPlanFightGate (win-plan.js:512:15)'),
    ],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', BLOCKED_COUNTS, [], null, null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(14, 'v1', 'strike', 'hunt', true)],
  });
  const r = classifyOne(j);
  const inst = (r.instances || [])[0] || {};
  check('S2 multi-firing: firstSeeder world-tick, 3 firings, firingPaths all three, multiPath counted',
    r.instancesOpened === 1 && inst.firstSeeder === 'world-tick' && (inst.firings || []).length === 3 &&
    (inst.firingPaths || []).length === 3 && inst.firingPaths.indexOf('world-tick') !== -1 &&
    inst.firingPaths.indexOf('agency-flee') !== -1 && inst.firingPaths.indexOf('gate-avoid') !== -1 &&
    r.multiPathInstances === 1 && r.attributionCoverage === 1,
    'firings=' + JSON.stringify(inst.firings) + ' paths=' + JSON.stringify(inst.firingPaths) + ' multi=' + r.multiPathInstances);
  check('S2 non-opening seed did not open a second instance',
    r.instancesOpened === 1, 'instances=' + r.instancesOpened);
})();
// S3: launched instance opened by gate-avoid -> launchesByFirstSeeder gate-avoid 1.
(function () {
  const counts = { selfOrScholar: 1, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 1 };
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party', 'avoided', 'gate-avoid', 'Object.winPlanFightGate (win-plan.js:512:15)')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_launch'], 'party_launch')],
    dawnbidDeparts: [{ day: 11, vid: 'v1', source: 'brain', result: 'launch', winPlanAction: 'party_launch',
      companion: 'v2', vidExped: true, companionExped: true, vidBlock: null, companionBlock: null,
      stage: 'party', target: 'strike', party: ['v2'] }],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'wanderer', counts, ['v2'], 'v2', 'v2', true)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const inst = (r.instances || [])[0] || {};
  check('S3 gate-avoid launch -> bucket launched, launchesByFirstSeeder gate-avoid 1',
    r.instancesOpened === 1 && inst.bucket === 'launched' && inst.firstSeeder === 'gate-avoid' &&
    r.launchesByFirstSeeder['gate-avoid'] === 1 && r.launches.length === 1 &&
    r.launches[0].firstSeeder === 'gate-avoid' && r.launches[0].companion === 'v2',
    'bucket=' + inst.bucket + ' launches=' + JSON.stringify(r.launchesByFirstSeeder));
})();
// S4: unknown-path opening row -> unattributed WITH an explicit
// reason (path string + caller), never a bare 'unknown'.
(function () {
  const j = baseSeed({
    v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party', 'fled', 'unknown-fled-no-caller', null)],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', BLOCKED_COUNTS, [], null, null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const inst = (r.instances || [])[0] || {};
  const u = (r.unattributedInstances || [])[0] || {};
  check('S4 unknown opening path -> unattributed, coverage 0, reason names path + caller',
    r.instancesOpened === 1 && inst.attributed === false && r.attributionCoverage === 0 &&
    r.unattributedInstances.length === 1 && u.reason && u.reason.indexOf('unknown-fled-no-caller') !== -1 &&
    u.reason !== 'unknown',
    'coverage=' + r.attributionCoverage + ' reason=' + u.reason);
  check('S4 unknown seed row counted under rowsByPath.unknown',
    r.seedRowsByPath.unknown === 1 && r.unknownSeedRows.length === 1,
    JSON.stringify(r.seedRowsByPath));
})();
// S5: retarget — agency-evade opens strike day 10, agency-flee
// retargets to herald day 12: two instances, second first-seeded
// agency-flee; the retarget row is NOT a firing of the first.
(function () {
  const j = baseSeed({
    v4seeds: [
      seedRow(10, 'v1', 'strike', 4, 'party', 'evaded', 'agency-evade'),
      seedRow(12, 'v1', 'herald', 4, 'party', 'fled', 'agency-flee'),
    ],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', BLOCKED_COUNTS, [], null, null, null)],
    dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(12, 'v1', 'herald', 'party', true)],
  });
  const r = classifyOne(j);
  const a = (r.instances || [])[0] || {};
  const b = (r.instances || [])[1] || {};
  check('S5 retarget: two instances, first agency-evade / second agency-flee, first has 1 firing',
    r.instancesOpened === 2 && a.firstSeeder === 'agency-evade' && b.firstSeeder === 'agency-flee' &&
    (a.firings || []).length === 1 && a.closeKind === 'retargeted' && r.attributionCoverage === 1,
    'instances=' + r.instancesOpened + ' a=' + a.firstSeeder + '/' + (a.firings || []).length + ' b=' + b.firstSeeder);
})();
// S6: summarizeSeedPaths shape over a two-seed leg.
(function () {
  function oneSeed(seed, pathName) {
    return ANALYZE.classifySeedPaths(baseSeed({
      seed: seed,
      v4seeds: [seedRow(10, 'v1', 'strike', 4, 'party', 'fled', pathName)],
      dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
      companionPool: [poolRow(11, 'v1', 'strike', 'party', 'forager', BLOCKED_COUNTS, [], null, null, null)],
      dawnbidCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
    }));
  }
  const leg = { bySeed: { 102131: oneSeed(102131, 'world-tick'), 102132: oneSeed(102132, 'agency-flee') }, files: ['a.json', 'b.json'] };
  const sum = ANALYZE.summarizeSeedPaths(leg);
  check('S6 summarize: 2 instances, coverage 1, first-seeder split world-tick 1 / agency-flee 1',
    sum.instancesOpened === 2 && sum.attributedInstances === 2 && sum.attributionCoverage === 1 &&
    sum.instancesByFirstSeeder['world-tick'] === 1 && sum.instancesByFirstSeeder['agency-flee'] === 1 &&
    sum.bareUnknownReasons === 0 && sum.replayMismatch == null,
    'instances=' + sum.instancesOpened + ' split=' + JSON.stringify(sum.instancesByFirstSeeder));
  check('S6 summarize wall carries national by standing AND by rank',
    sum.wall && typeof sum.wall.nationalByStanding === 'number' && typeof sum.wall.nationalByRank === 'number',
    'wall=' + JSON.stringify(sum.wall));
})();

// ---------- 4. Recorder: live in-memory run (shape + path recording) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'));
  const out = await driver.oneRun(102131);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries companionPool array', Array.isArray(out.companionPool));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run policy sha is competent verbatim (74a890f0844e)', out.policySha === '74a890f0844e', 'got ' + out.policySha);
  const badSeed = (out.v4seeds || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && r.mid && typeof r.wave === 'number' &&
      typeof r.path === 'string' && (DRIVER.SEED_PATHS.indexOf(r.path) !== -1 || r.path.indexOf('unknown-') === 0));
  });
  check('every recorded v4seeds row carries a path (named, or explicit unknown-*)', !badSeed, badSeed ? JSON.stringify(badSeed).slice(0, 300) : '');
  const namedPaths = {};
  for (const r of (out.v4seeds || [])) namedPaths[r.path] = (namedPaths[r.path] || 0) + 1;
  console.log('  info: live 5d run recorded ' + (out.v4seeds || []).length + ' seed rows by path ' + JSON.stringify(namedPaths) +
    ', ' + (out.companionPool || []).length + ' pool rows');
  return out;
}

// ---------- 5. Determinism legs D1 + D2 (60d, seed 102131) + 150d path coverage ----------
console.log('== determinism legs D1/D2 + path coverage ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  const script = "const d=require('./scripts/seedpaths-driver-20261116.js');" +
    "d.oneRun(102131).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
function pathsNamed(full) {
  const bad = (full.v4seeds || []).find(function (r) { return DRIVER.SEED_PATHS.indexOf(r.path) === -1; });
  return { bad: bad, count: (full.v4seeds || []).length };
}
async function determinism() {
  const a = childRun(60, {});
  const b = childRun(60, {});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { SEEDPATHS_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4 arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  const p60 = pathsNamed(a.full);
  check('D1 60d run: every recorded seed row carries a NAMED path (no unknown-*)',
    !p60.bad, p60.bad ? JSON.stringify(p60.bad).slice(0, 300) : '0 rows recorded (vacuous — see 150d check)');
  console.log('  info: D1 60d run recorded ' + p60.count + ' seed rows, ' +
    (a.full.companionPool || []).length + ' pool rows, ' + (a.full.dawnbidScores || []).length + ' score rows');
  // 150d live run: the path-coverage check — on the instrument tip the
  // world-tick call is ON, so all four paths can fire; every recorded
  // row must carry a named path, and at least one row must exist.
  const long = childRun(150, {});
  const p150 = pathsNamed(long.full);
  const byPath = {};
  for (const r of (long.full.v4seeds || [])) byPath[r.path] = (byPath[r.path] || 0) + 1;
  check('150d live run records >=1 seed row', p150.count >= 1, 'recorded ' + p150.count);
  check('150d live run: every recorded seed row carries a NAMED path',
    !p150.bad, p150.bad ? JSON.stringify(p150.bad).slice(0, 300) : '');
  console.log('  info: 150d run seed rows by path ' + JSON.stringify(byPath) +
    ' (world-tick share of rows: ' + (p150.count ? ((byPath['world-tick'] || 0) / p150.count).toFixed(2) : 'n/a') + ')');
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
