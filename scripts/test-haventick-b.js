// test-haventick-b.js — proof for arm sim-haventick-b (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seed call's presence matches HAVENTICK_SEED_CALL
// (default 'off' — the primary leg is master as-is, seed call
// absent; 'on' is the secondary seed-on shape), the driver wraps
// exist (incl. the creation-ledger wraps on winPlanHavenTick,
// winPlanSeedFromFight, and winPlanOf), the game-code diff is the
// seed call only, the wave-4 id set matches the data, the creation
// sites exist where the prereg says they do, classifySeedPath places
// one fixture per path (plus unknown cases), classifyHavenSource
// places one fixture per source (plus the unknown case), the
// havenTick analyzer attributes episodes first-creator-wins
// (havenTick-only, handoff/retarget, launched, launch-kill,
// winPlanOf, ledger-miss, and unknown-creator cases), the recorder
// rows carry a named creator on every creation row and a named path
// on every seed row, and the determinism legs D1 (repeatability) +
// D2 (wrap neutrality) are green at 60d on seed 102141, with a 150d
// live run proving every recorded row is named.
// Usage:
//   node scripts/test-haventick-b.js            (seed call expected ABSENT)
//   HAVENTICK_SEED_CALL=on node scripts/test-haventick-b.js   (seed-on shape)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.HAVENTICK_SEED_CALL || 'off';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-haventick-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'haventick-driver-20261116.js'));

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
check('seed call present iff HAVENTICK_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const srcOk = srcStatus.every(function (s) { return /src\/js\/game\.js$/.test(s); }) &&
  (SEED_CALL_EXPECTED === 'off' ? srcStatus.length === 0 : true);
check('game-code worktree diff is the seed call only (src status: ' + JSON.stringify(srcStatus) + ')', srcOk);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*haventick-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is haventick-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'haventick-driver-20261116.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'winPlanHavenTick', 'winPlanOf', 'startExpedition', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'poolReplica', 'members', 'classifySeedPath', 'classifyHavenSource', 'firstCallerFrame', 'HAVENTICK_RECORDER', 'v4creates', 'planCensus', 'planExistedBefore']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver records path + caller + planExistedBefore on v4seeds rows',
  driverSrc.indexOf('path: seedPath') !== -1 && driverSrc.indexOf('caller: seedCaller') !== -1 &&
  driverSrc.indexOf('planExistedBefore:') !== -1);
check('driver records creator + source on v4creates rows',
  driverSrc.indexOf('creator:') !== -1 && driverSrc.indexOf('source: classifyHavenSource') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
// The creation sites exist where the prereg says they do (call TEXT
// is the anchor — line numbers drift daily).
check('havenTick creation site: winPlanHavenTick creates a plan (win-plan.js)',
  (function () {
    const wp = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
    return wp.indexOf('winPlanHavenTick(vid, hx, hy)') !== -1 &&
      wp.indexOf("plan = { stage: 'gear', target: null") !== -1;
  })());
check('havenTick is called from villager-agency.js agencyTick',
  fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8')
    .indexOf('this.winPlanHavenTick(rid, hx, hy)') !== -1);
check('winPlanOf creation site: winPlanOf creates a plan when missing (win-plan.js)',
  fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8')
    .indexOf('if (!v.winPlan[vid]) v.winPlan[vid] = { stage:') !== -1);
check('world-tick call site: resolveWildMonsterEncounter exists (game.js)',
  gameJs.indexOf('resolveWildMonsterEncounter') !== -1);
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
check('agency evade call site: expeditionMonster seeds on evade (villager-agency.js)',
  agencyJs.indexOf("this.winPlanSeedFromFight(vid, m, 'evaded')") !== -1);
check('agency flee call site: expeditionMonster seeds on vFlee (villager-agency.js)',
  agencyJs.indexOf("this.winPlanSeedFromFight(vid, m, 'fled')") !== -1);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('gate avoid call site: winPlanFightGate seeds on avoid (win-plan.js)',
  winPlanJs.indexOf("this.winPlanSeedFromFight(vid, mdef, 'avoided')") !== -1);
check('exactly three winPlan assignments exist in src/js (havenTick, seed, winPlanOf)',
  (function () {
    const hits = [];
    for (const f of ['win-plan.js']) {
      const src = fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8');
      const re = /v\.winPlan\[vid\] = /g;
      let m;
      while ((m = re.exec(src)) !== null) hits.push(f + ':' + (src.slice(0, m.index).split('\n').length));
    }
    return hits.length === 3;
  })());

// ---------- 2. classifySeedPath + classifyHavenSource fixtures ----------
console.log('== classifier fixtures ==');
function fakeStack(frames) {
  return 'Error: haventick-caller\n' + frames.map(function (f) { return '    at ' + f; }).join('\n');
}
const STACK_WORLD_TICK = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/haventick-driver-20261116.js:401:20)',
  'Object.resolveWildMonsterEncounter (/home/hatch/workspace/the-scattering/src/js/game.js:20940:10)',
  'Object.resolveWorldMonster (/home/hatch/workspace/the-scattering/src/js/game.js:20845:12)',
]);
const STACK_AGENCY = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/haventick-driver-20261116.js:401:20)',
  'Object.expeditionMonster (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:660:40)',
  'Object.expeditionLeg (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:559:12)',
]);
check("'fled' + resolveWildMonsterEncounter stack -> world-tick",
  DRIVER.classifySeedPath('fled', STACK_WORLD_TICK) === 'world-tick',
  DRIVER.classifySeedPath('fled', STACK_WORLD_TICK));
check("'evaded' + expeditionMonster stack -> agency-evade",
  DRIVER.classifySeedPath('evaded', STACK_AGENCY) === 'agency-evade',
  DRIVER.classifySeedPath('evaded', STACK_AGENCY));
check("'fled' + empty stack -> unknown-fled-no-caller (explicit, never a silent default)",
  DRIVER.classifySeedPath('fled', '') === 'unknown-fled-no-caller',
  DRIVER.classifySeedPath('fled', ''));
check('SEED_PATHS lists exactly the four named seed paths',
  JSON.stringify(DRIVER.SEED_PATHS) === JSON.stringify(['world-tick', 'agency-evade', 'agency-flee', 'gate-avoid']),
  JSON.stringify(DRIVER.SEED_PATHS));
check('CREATORS lists the six named creators (five paths + winPlanOf)',
  JSON.stringify(DRIVER.CREATORS) === JSON.stringify(['havenTick', 'world-tick', 'agency-evade', 'agency-flee', 'gate-avoid', 'winPlanOf']),
  JSON.stringify(DRIVER.CREATORS));
check('classifyHavenSource: fought only -> lived',
  DRIVER.classifyHavenSource(2, 0) === 'lived', DRIVER.classifyHavenSource(2, 0));
check('classifyHavenSource: slain only -> heard',
  DRIVER.classifyHavenSource(0, 3) === 'heard', DRIVER.classifyHavenSource(0, 3));
check('classifyHavenSource: both -> both',
  DRIVER.classifyHavenSource(1, 1) === 'both', DRIVER.classifyHavenSource(1, 1));
check('classifyHavenSource: neither -> unknown-haventick-no-engagement (explicit, never silent)',
  DRIVER.classifyHavenSource(0, 0) === 'unknown-haventick-no-engagement', DRIVER.classifyHavenSource(0, 0));
check('isNamedCreator: havenTick + winPlanOf named, unknown-* not',
  DRIVER.isNamedCreator('havenTick') === true && DRIVER.isNamedCreator('winPlanOf') === true &&
  DRIVER.isNamedCreator('unknown-fled-no-caller') === false);

// ---------- 3. HavenTick analyzer fixtures ----------
console.log('== havenTick analyzer fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 102141, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], companionPool: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
    v4creates: [], planCensus: [], v4departs: [], v4gates: [], v4encounters: [],
    dawnbidStarts: [],
  };
  return Object.assign(j, over || {});
}
function seedRow(day, vid, target, wave, stageAfter, outcome, pathName, planExistedBefore, caller) {
  return { day: day, vid: vid, mid: target, wave: wave, outcome: outcome || 'fled',
    path: pathName || 'agency-flee', caller: caller || 'Object.expeditionMonster (villager-agency.js:743:40)',
    planExistedBefore: planExistedBefore === undefined ? true : planExistedBefore,
    stageAfter: stageAfter, target: target, node: { nx: 1, ny: 1 } };
}
function createRow(day, vid, creator, source, target, needWave, stageAfter) {
  return { day: day, vid: vid, creator: creator, source: source || null,
    profile: 'wanderer', stageAfter: stageAfter || 'gear',
    target: target === undefined ? null : target,
    needWave: needWave === undefined ? null : needWave,
    foughtN: creator === 'havenTick' ? 1 : null, slainN: creator === 'havenTick' ? 0 : null,
    caller: creator === 'havenTick' ? 'Object.agencyTick (villager-agency.js:433:10)' : 'Object.winPlanFightGate (win-plan.js:512:15)' };
}
function scoreRow(day, part, vid, target, stage, cands, commitAction) {
  const c = (cands || []).map(function (a) {
    return a ? { kind: a === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', w: a === 'party_launch' ? 5.0 : 4.0, winPlanAction: a, companion: a === 'party_launch' ? 'v2' : null, vbrainSrc: 'win_plan' } : null;
  });
  if (!cands || !cands.length) c.push({ kind: 'HAVEN_CHORE', w: 1.4, winPlanAction: null, companion: null, vbrainSrc: null });
  const logCands = c.map(function (x) { return { kind: x.kind, score: x.w, winPlanAction: x.winPlanAction }; });
  // target null = a target-null plan (havenTick / winPlanOf): the plan
  // object exists with target null (unlike plan:null = no plan).
  const plan = (target === null)
    ? { stage: stage, target: null, needWave: null, party: [] }
    : { stage: stage, target: target, needWave: 4, party: [] };
  return { day: day, part: part, vid: vid,
    cands: c,
    pick: { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', winPlanAction: commitAction || null, override: commitAction ? 'win_plan:' + commitAction : null, corePick: 'HAVEN_CHORE' },
    logCands: logCands,
    commit: commitAction ? { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', winPlanAction: commitAction, companion: commitAction === 'party_launch' ? 'v2' : null } : { kind: 'HAVEN_CHORE', winPlanAction: null, companion: null },
    plan: plan,
    holderGear: { armed: true, armored: true } };
}
function censusRow(day, vid, target, stage, alive) {
  return { day: day, vid: vid, target: target === undefined ? null : target, needWave: target ? 4 : null, stage: stage, party: [],
    holderAlive: alive, holderNode: { nx: 0, ny: 0 }, holderExped: false,
    holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } };
}
function classifyOne(j) { return ANALYZE.classifyHavenTick(j); }

// H1: havenTick creates a target-null plan, holder waits for a
// companion -> episode attributed havenTick, candidate-not-bid.
(function () {
  const j = baseSeed({
    v4creates: [createRow(10, 'v1', 'havenTick', 'lived', null, null, 'gear')],
    dawnbidScores: [scoreRow(11, 0, 'v1', null, 'party', ['party_wait'], 'party_wait')],
    planCensus: [censusRow(10, 'v1', null, 'gear', true), censusRow(11, 'v1', null, 'party', true)],
  });
  const r = classifyOne(j);
  const ep = (r.episodes || [])[0] || {};
  check('H1 havenTick creates -> episode attributed havenTick, bucket candidate-not-bid/no-companion-party, coverage 1',
    r.episodesOpened === 1 && ep.creator === 'havenTick' && ep.attributed === true &&
    ep.bucket === 'candidate-not-bid' && ep.sub === 'no-companion-party' &&
    r.attributionCoverage === 1 && r.unattributedEpisodes.length === 0 &&
    r.censusRowWithoutEpisode.length === 0 && r.frameReconciliation.difference === 0,
    'episodes=' + r.episodesOpened + ' creator=' + ep.creator + ' bucket=' + ep.bucket + '/' + ep.sub +
    ' coverage=' + r.attributionCoverage + ' frameDiff=' + r.frameReconciliation.difference);
  check('H1 havenTick episode: target null, targetKilledDay null (structurally N/A), scoredDawns 1',
    ep.target === null && ep.targetKilledDay === null && ep.scoredDawns === 1,
    'target=' + ep.target + ' scored=' + ep.scoredDawns);
})();
// H2: havenTick creates day 10, agency-flee retargets to herald day
// 12 -> havenTick episode closes retargeted (handoff), a seed
// episode opens; seedpaths frame (1 instance) reconciles exactly.
(function () {
  const j = baseSeed({
    v4creates: [
      createRow(10, 'v1', 'havenTick', 'heard', null, null, 'gear'),
    ],
    // NOTE: no creates row for the day-12 seed call — it found the
    // havenTick plan (planExistedBefore true), so it retargeted
    // rather than creating. A creates row for it would contradict
    // the seed row's own flag.
    v4seeds: [seedRow(12, 'v1', 'herald', 4, 'party', 'fled', 'agency-flee', true)],
    dawnbidScores: [scoreRow(11, 0, 'v1', null, 'party', ['party_wait'], 'party_wait')],
    planCensus: [censusRow(10, 'v1', null, 'gear', true), censusRow(11, 'v1', null, 'party', true),
      censusRow(12, 'v1', 'herald', 'party', true)],
  });
  const r = classifyOne(j);
  const a = (r.episodes || [])[0] || {};
  const b = (r.episodes || [])[1] || {};
  check('H2 handoff: havenTick episode retargeted, seed episode agency-flee opens, handoffs 1',
    r.episodesOpened === 2 && a.creator === 'havenTick' && a.closeKind === 'retargeted' &&
    b.creator === 'agency-flee' && (r.handoffs || []).length === 1 &&
    r.attributionCoverage === 1,
    'episodes=' + r.episodesOpened + ' a=' + a.creator + '/' + a.closeKind + ' b=' + b.creator);
  check('H2 frames reconcile: seedpaths instances 1 == creation seed episodes 1, difference 0',
    r.frameReconciliation.seedpathsFrameInstances === 1 &&
    r.frameReconciliation.creationFrameSeedEpisodes === 1 &&
    r.frameReconciliation.difference === 0,
    JSON.stringify(r.frameReconciliation));
})();
// H3: havenTick creates, holder launches with v2 -> bucket launched,
// launchesByCreator havenTick 1, no kills.
(function () {
  const j = baseSeed({
    v4creates: [createRow(10, 'v1', 'havenTick', 'both', null, null, 'gear')],
    dawnbidScores: [scoreRow(11, 0, 'v1', null, 'party', ['party_launch'], 'party_launch')],
    dawnbidDeparts: [{ day: 11, vid: 'v1', source: 'brain', result: 'launch', winPlanAction: 'party_launch',
      companion: 'v2', vidExped: true, companionExped: true, vidBlock: null, companionBlock: null,
      stage: 'party', target: null, party: ['v2'] }],
    planCensus: [censusRow(10, 'v1', null, 'gear', true), censusRow(11, 'v1', null, 'party', true)],
  });
  const r = classifyOne(j);
  const ep = (r.episodes || [])[0] || {};
  check('H3 havenTick launch -> bucket launched, launchesByCreator havenTick 1, launchKills 0',
    r.episodesOpened === 1 && ep.bucket === 'launched' && ep.creator === 'havenTick' &&
    r.launchesByCreator['havenTick'] === 1 && r.launches.length === 1 &&
    r.launches[0].creator === 'havenTick' && r.launches[0].companion === 'v2' &&
    (ep.launchKills || []).length === 0,
    'bucket=' + ep.bucket + ' launches=' + JSON.stringify(r.launchesByCreator));
})();
// H4: havenTick launch + the companion kills a wave-4 beast the next
// day -> launchKills 1, wave-4 1, listed in launchKillList.
(function () {
  const j = baseSeed({
    v4creates: [createRow(10, 'v1', 'havenTick', 'lived', null, null, 'gear')],
    dawnbidScores: [scoreRow(11, 0, 'v1', null, 'party', ['party_launch'], 'party_launch')],
    dawnbidDeparts: [{ day: 11, vid: 'v1', source: 'brain', result: 'launch', winPlanAction: 'party_launch',
      companion: 'v2', vidExped: true, companionExped: true, vidBlock: null, companionBlock: null,
      stage: 'party', target: null, party: ['v2'] }],
    planCensus: [censusRow(10, 'v1', null, 'gear', true), censusRow(11, 'v1', null, 'party', true),
      censusRow(12, 'v1', null, 'hunt', true)],
    daily: [{ day: 150, waveKillLog: [{ d: 12, mid: 'strike', w: 4, by: 'v2', via: 'wild', trick: null, pyrrhic: false }], roster: [] }],
  });
  const r = classifyOne(j);
  const ep = (r.episodes || [])[0] || {};
  check('H4 launch-kill: companion wave-4 kill day 12 counted (launchKills 1, W4 1)',
    ep.bucket === 'launched' && (ep.launchKills || []).length === 1 &&
    (ep.launchKillsW4 || []).length === 1 && ep.launchKills[0].mid === 'strike' &&
    (r.launchKills || []).length === 1,
    'kills=' + JSON.stringify(ep.launchKills));
})();
// H5: winPlanOf creates a companion plan -> episode attributed
// winPlanOf (explicit sixth creator, never unknown).
(function () {
  const j = baseSeed({
    v4creates: [createRow(10, 'v2', 'winPlanOf', null, null, null, 'gear')],
    dawnbidScores: [scoreRow(11, 0, 'v2', null, 'hunt', ['party_wait'], 'party_wait')],
    planCensus: [censusRow(10, 'v2', null, 'gear', true), censusRow(11, 'v2', null, 'hunt', true)],
  });
  const r = classifyOne(j);
  const ep = (r.episodes || [])[0] || {};
  check('H5 winPlanOf creates -> episode attributed winPlanOf, coverage 1',
    r.episodesOpened === 1 && ep.creator === 'winPlanOf' && ep.attributed === true &&
    r.attributionCoverage === 1 && r.episodesByCreator['winPlanOf'] === 1,
    'creator=' + ep.creator + ' coverage=' + r.attributionCoverage);
})();
// H6: ledger miss — a planCensus holder with no creation row at all
// -> holdersWithoutCreation 1 (the prereg bar-2 gate); the row is
// also listed in censusRowWithoutEpisode as a diagnostic.
(function () {
  const j = baseSeed({
    planCensus: [censusRow(10, 'v9', null, 'party', true)],
  });
  const r = classifyOne(j);
  check('H6 ledger miss: census holder with no creation row is flagged (holdersWithoutCreation 1)',
    r.episodesOpened === 0 && (r.holdersWithoutCreation || []).length === 1 &&
    r.holdersWithoutCreation[0].vid === 'v9' && (r.censusRowWithoutEpisode || []).length === 1 &&
    r.censusRowWithoutEpisode[0].vid === 'v9',
    'flagged=' + JSON.stringify(r.holdersWithoutCreation));
})();
// H7: unknown creator -> unattributed WITH an explicit reason (creator
// string + caller), never a bare 'unknown'.
(function () {
  const j = baseSeed({
    v4creates: [createRow(10, 'v1', 'unknown-fled-no-caller', null, 'strike', 4, 'party')],
    dawnbidScores: [scoreRow(11, 0, 'v1', 'strike', 'party', ['party_wait'], 'party_wait')],
    planCensus: [censusRow(10, 'v1', 'strike', 'party', true), censusRow(11, 'v1', 'strike', 'party', true)],
  });
  const r = classifyOne(j);
  const ep = (r.episodes || [])[0] || {};
  const u = (r.unattributedEpisodes || [])[0] || {};
  check('H7 unknown creator -> unattributed, coverage 0, reason names creator + caller',
    r.episodesOpened === 1 && ep.attributed === false && r.attributionCoverage === 0 &&
    r.unattributedEpisodes.length === 1 && u.reason && u.reason.indexOf('unknown-fled-no-caller') !== -1 &&
    u.reason !== 'unknown',
    'coverage=' + r.attributionCoverage + ' reason=' + u.reason);
})();
// H8: summarizeHavenTick shape over a two-seed leg.
(function () {
  function oneSeed(seed, creator) {
    return ANALYZE.classifyHavenTick(baseSeed({
      seed: seed,
      v4creates: [createRow(10, 'v1', creator, creator === 'havenTick' ? 'lived' : null, null, null, 'gear')],
      dawnbidScores: [scoreRow(11, 0, 'v1', null, 'party', ['party_wait'], 'party_wait')],
      planCensus: [censusRow(10, 'v1', null, 'gear', true), censusRow(11, 'v1', null, 'party', true)],
    }));
  }
  const leg = { bySeed: { 102141: oneSeed(102141, 'havenTick'), 102142: oneSeed(102142, 'winPlanOf') }, files: ['a.json', 'b.json'] };
  const sum = ANALYZE.summarizeHavenTick(leg);
  check('H8 summarize: 2 episodes, coverage 1, creator split havenTick 1 / winPlanOf 1, frameDifference 0',
    sum.episodesOpened === 2 && sum.attributedEpisodes === 2 && sum.attributionCoverage === 1 &&
    sum.episodesByCreator['havenTick'] === 1 && sum.episodesByCreator['winPlanOf'] === 1 &&
    sum.bareUnknownReasons === 0 && sum.frameDifference === 0 &&
    sum.holdersWithoutCreation === 0 && sum.creationRowMissing === 0,
    'episodes=' + sum.episodesOpened + ' split=' + JSON.stringify(sum.episodesByCreator) +
    ' frameDiff=' + sum.frameDifference);
  check('H8 summarize wall carries national by standing AND by rank',
    sum.wall && typeof sum.wall.nationalByStanding === 'number' && typeof sum.wall.nationalByRank === 'number',
    'wall=' + JSON.stringify(sum.wall));
})();

// H9: wave-3 seed creation opens NO episode by design, yet its plan
// lives in the census — the rows are diagnosed w3PlanNoEpisode, NOT a
// gate failure: holdersWithoutCreation stays 0.
(function () {
  const j = baseSeed({
    v4creates: [createRow(10, 'v1', 'world-tick', null, 'buffering', 3, 'party')],
    planCensus: [censusRow(10, 'v1', 'buffering', 'party', true), censusRow(11, 'v1', 'buffering', 'party', true)],
  });
  const r = classifyOne(j);
  check('H9 wave-3 plan census rows diagnosed w3PlanNoEpisode, gate passes (holdersWithoutCreation 0)',
    r.episodesOpened === 0 && (r.holdersWithoutCreation || []).length === 0 &&
    (r.censusRowWithoutEpisode || []).length === 2 &&
    (r.censusRowWithoutEpisodeCauses || {}).w3PlanNoEpisode === 2 &&
    (r.censusRowWithoutEpisodeCauses || {}).unexplained === 0,
    'causes=' + JSON.stringify(r.censusRowWithoutEpisodeCauses));
})();
// H10: dead holder's plan lingers in the census past the holder-died
// close — the tail rows are diagnosed postDeathTail, NOT a gate
// failure: holdersWithoutCreation stays 0.
(function () {
  const j = baseSeed({
    v4creates: [createRow(10, 'v1', 'havenTick', 'lived', null, null, 'gear')],
    dawnbidScores: [scoreRow(11, 0, 'v1', null, 'party', ['party_wait'], 'party_wait')],
    planCensus: [censusRow(10, 'v1', null, 'gear', true), censusRow(11, 'v1', null, 'party', false),
      censusRow(12, 'v1', null, 'party', false), censusRow(13, 'v1', null, 'party', false)],
  });
  const r = classifyOne(j);
  const ep = (r.episodes || [])[0] || {};
  check('H10 post-death census tail diagnosed postDeathTail, gate passes (holdersWithoutCreation 0)',
    r.episodesOpened === 1 && ep.closeKind === 'holder-died' &&
    (r.holdersWithoutCreation || []).length === 0 &&
    (r.censusRowWithoutEpisode || []).length === 2 &&
    (r.censusRowWithoutEpisodeCauses || {}).postDeathTail === 2 &&
    (r.censusRowWithoutEpisodeCauses || {}).unexplained === 0,
    'close=' + ep.closeKind + ' causes=' + JSON.stringify(r.censusRowWithoutEpisodeCauses));
})();

// ---------- 4. Recorder: live in-memory run (shape + creation recording) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'haventick-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'haventick-driver-20261116.js'));
  const out = await driver.oneRun(102141);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries companionPool array', Array.isArray(out.companionPool));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run carries creation-ledger arrays (v4creates, planCensus)', Array.isArray(out.v4creates) && Array.isArray(out.planCensus));
  check('live run policy sha is competent verbatim (74a890f0844e)', out.policySha === '74a890f0844e', 'got ' + out.policySha);
  const badSeed = (out.v4seeds || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && r.mid && typeof r.wave === 'number' &&
      typeof r.path === 'string' && (DRIVER.SEED_PATHS.indexOf(r.path) !== -1 || r.path.indexOf('unknown-') === 0) &&
      typeof r.planExistedBefore === 'boolean');
  });
  check('every recorded v4seeds row carries a path (named, or explicit unknown-*) + planExistedBefore', !badSeed, badSeed ? JSON.stringify(badSeed).slice(0, 300) : '');
  const badCreate = (out.v4creates || []).find(function (r) {
    if (!r || typeof r.day !== 'number' || !r.vid || !DRIVER.isNamedCreator(r.creator)) return true;
    if (r.creator === 'havenTick' && (!r.source || r.source.indexOf('unknown-') === 0)) return true;
    return false;
  });
  check('every recorded v4creates row carries a named creator (+ named source for havenTick)', !badCreate, badCreate ? JSON.stringify(badCreate).slice(0, 300) : '');
  const namedPaths = {};
  for (const r of (out.v4seeds || [])) namedPaths[r.path] = (namedPaths[r.path] || 0) + 1;
  const namedCreates = {};
  for (const r of (out.v4creates || [])) namedCreates[r.creator] = (namedCreates[r.creator] || 0) + 1;
  console.log('  info: live 5d run recorded ' + (out.v4seeds || []).length + ' seed rows by path ' + JSON.stringify(namedPaths) +
    ', ' + (out.v4creates || []).length + ' creates by creator ' + JSON.stringify(namedCreates) +
    ', ' + (out.planCensus || []).length + ' planCensus rows, ' + (out.companionPool || []).length + ' pool rows');
  return out;
}

// ---------- 5. Determinism legs D1 + D2 (60d, seed 102141) + 150d coverage ----------
console.log('== determinism legs D1/D2 + coverage ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  const script = "const d=require('./scripts/haventick-driver-20261116.js');" +
    "d.oneRun(102141).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
function rowsNamed(full) {
  const badSeed = (full.v4seeds || []).find(function (r) { return DRIVER.SEED_PATHS.indexOf(r.path) === -1; });
  const badCreate = (full.v4creates || []).find(function (r) {
    if (!DRIVER.isNamedCreator(r.creator)) return true;
    if (r.creator === 'havenTick' && (!r.source || r.source.indexOf('unknown-') === 0)) return true;
    return false;
  });
  return { badSeed: badSeed, badCreate: badCreate,
    seedCount: (full.v4seeds || []).length, createCount: (full.v4creates || []).length };
}
async function determinism() {
  const a = childRun(60, {});
  const b = childRun(60, {});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { HAVENTICK_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4/ledger arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4creates || []).length === 0 && (off.full.planCensus || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  const p60 = rowsNamed(a.full);
  check('D1 60d run: every recorded seed row carries a NAMED path (no unknown-*)',
    !p60.badSeed, p60.badSeed ? JSON.stringify(p60.badSeed).slice(0, 300) : '0 rows recorded (vacuous — see 150d check)');
  check('D1 60d run: every recorded creates row carries a NAMED creator (+ named havenTick source)',
    !p60.badCreate, p60.badCreate ? JSON.stringify(p60.badCreate).slice(0, 300) : '0 rows recorded (vacuous — see 150d check)');
  console.log('  info: D1 60d run recorded ' + p60.seedCount + ' seed rows, ' + p60.createCount + ' creates, ' +
    (a.full.companionPool || []).length + ' pool rows, ' + (a.full.dawnbidScores || []).length + ' score rows');
  // 150d live run: the coverage check — every recorded row must carry
  // a named path / creator / source. In the OFF (primary, master
  // as-is) shape the world-tick call is ABSENT, so the >=1-seed-row
  // assertion does not apply (agency/gate rows may or may not exist
  // on this seed); in the ON shape at least one seed row must exist.
  const long = childRun(150, {});
  const p150 = rowsNamed(long.full);
  const byPath = {};
  for (const r of (long.full.v4seeds || [])) byPath[r.path] = (byPath[r.path] || 0) + 1;
  const byCreator = {};
  for (const r of (long.full.v4creates || [])) byCreator[r.creator] = (byCreator[r.creator] || 0) + 1;
  if (SEED_CALL_EXPECTED === 'on') {
    check('150d live run records >=1 seed row', p150.seedCount >= 1, 'recorded ' + p150.seedCount);
  } else {
    check('150d live run (off shape): seed rows are agency/gate only (no world-tick call)',
      (byPath['world-tick'] || 0) === 0, 'rows by path ' + JSON.stringify(byPath));
  }
  check('150d live run: every recorded seed row carries a NAMED path',
    !p150.badSeed, p150.badSeed ? JSON.stringify(p150.badSeed).slice(0, 300) : '');
  check('150d live run: every recorded creates row carries a NAMED creator (+ named havenTick source)',
    !p150.badCreate, p150.badCreate ? JSON.stringify(p150.badCreate).slice(0, 300) : '');
  console.log('  info: 150d run seed rows by path ' + JSON.stringify(byPath) +
    ', creates by creator ' + JSON.stringify(byCreator));
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
