// test-seedland-b.js — proof for arm sim-seedland-b (BUILD: land
// the vetparty seed call on top of the gate fix).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seed call is present VERBATIM from the frozen prereg
// (SEEDLAND_SEED_CALL=on; 'off' is the post-revert shape), the
// src/ diff vs the frozen base is the 13-line seed call only (0
// post-revert), the scripts diff is the seedland instrument + the
// seedpaths driver extension only, the SEEDLAND=1 driver extension
// widens the fieldFight watch to wave >= 4 and tags origins with
// the gatelever taxonomy (flag unset = seedpaths behavior:
// wave == 4 only, no origin key), the seedland analyzer judges the
// four frozen bars on fixtures (covering-launch window, distinct
// meetings, kill:death incl. zero-denominator pass, wave-5 classes
// incl. 0-unlocked null), origin classification places one fixture
// per origin (plus unclassified/other), the live recorder shape
// carries origins, and the determinism legs D1 (repeatability) +
// D2 (wrap neutrality) are green at 60d on seed 102141 with
// SEEDLAND=1.
// Usage:
//   node scripts/test-seedland-b.js            (seed call expected ON)
//   SEEDLAND_SEED_CALL=off node scripts/test-seedland-b.js   (post-revert shape)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.SEEDLAND_SEED_CALL || 'on';
// SEEDLAND=1 for every live run in this test (the judged legs both
// run with the flag on; the flag-unset shape is checked separately
// in §5).
process.env.SEEDLAND = '1';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-seedland-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED the frozen
// prereg — self-locating across rebases. Env SEEDLAND_BASE overrides.
function frozenBase() {
  if (process.env.SEEDLAND_BASE) return process.env.SEEDLAND_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-16/sim-seedland-b-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO }).toString().trim();
  } catch (e) {}
  return '5eedd695b';
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitDiffNumstat(base, file) {
  try {
    return execSync('git diff --numstat ' + base + ' HEAD -- ' + file, { cwd: REPO }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'sim-seedland-b-prereg.md'), 'utf8');
const fence = prereg.match(/```js\n([\s\S]*?)\n```/);
const seedBlock = fence ? fence[1] : null;
check('prereg carries the 13-line seed-call fence (exact text source)', !!seedBlock && seedBlock.indexOf('VETPARTY (sim-vetparty-a)') !== -1 && seedBlock.split('\n').length === 13, seedBlock ? (seedBlock.split('\n').length + ' lines') : 'no fence');
const seedBlockPresent = !!seedBlock && gameJs.indexOf(seedBlock) !== -1;
check('seed call present VERBATIM from the prereg iff SEEDLAND_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
check('seed call sits immediately before the alreadyDead anchor',
  SEED_CALL_EXPECTED === 'off' || (seedBlockPresent && (function () {
    const i = gameJs.indexOf(seedBlock);
    const after = gameJs.slice(i + seedBlock.length, i + seedBlock.length + 80);
    return after.indexOf("if (rec.outcome === 'alreadyDead')") !== -1 && after.trim().startsWith("if (rec.outcome === 'alreadyDead')");
  })()));
const BASE = frozenBase();
console.log('  info: frozen base ' + BASE);
const srcNames = gitDiffNames(BASE, 'src/');
const srcNumstat = gitDiffNumstat(BASE, 'src/js/game.js');
check('game-code diff vs base is the seed call only (src files: ' + JSON.stringify(srcNames) + ', game.js numstat: ' + JSON.stringify(srcNumstat) + ')',
  SEED_CALL_EXPECTED === 'off' ? srcNames.length === 0 : (srcNames.length === 1 && srcNames[0] === 'src/js/game.js' && srcNumstat === '13\t0\tsrc/js/game.js'),
  'src=' + JSON.stringify(srcNames) + ' numstat=' + JSON.stringify(srcNumstat));
const scriptsNames = gitDiffNames(BASE, 'scripts/');
const scriptsOk = scriptsNames.every(function (s) {
  return /scripts\/[a-z-]*seedland-[a-z0-9.-]+\.js$/.test(s) || s === 'scripts/seedpaths-driver-20261116.js';
});
check('scripts diff vs base is seedland instrument + seedpaths driver extension only (' + JSON.stringify(scriptsNames) + ')',
  scriptsNames.length >= 3 && scriptsOk, JSON.stringify(scriptsNames));
check('seedland instrument files exist (analyzer + proof test + panel builder)',
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-seedland-b.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'test-seedland-b.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'build-seedland-panels-20261116.js')));
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'), 'utf8');
check('driver defines SEEDLAND flag + fightOrigin', driverSrc.indexOf("SEEDLAND = process.env.SEEDLAND === '1'") !== -1 && driverSrc.indexOf('function fightOrigin(') !== -1);
check('driver fieldFight watch widens to wave >= 4 under SEEDLAND', driverSrc.indexOf('SEEDLAND ? w >= 4 : w === 4') !== -1);
check('driver tags origin only under SEEDLAND (no origin key when flag unset)', driverSrc.indexOf('if (SEEDLAND) row.origin = fightOrigin();') !== -1);
check('gate fix present on this tip (PROFILEGATE in villager-agency.js)',
  fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8').indexOf('PROFILEGATE (sim-profilegate-a)') !== -1);

// ---------- 2. fightOrigin fixtures ----------
console.log('== fightOrigin fixtures ==');
function fakeStack(frames) {
  return 'Error\n' + frames.map(function (f) { return '    at ' + f; }).join('\n');
}
const STACK_EXPED = fakeStack([
  'Game.fieldFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:600:20)',
  'Object.fieldFight (/home/hatch/workspace/the-scattering/src/js/progression.js:120:10)',
  'Object.expeditionMonster (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:660:40)',
  'Object.expeditionLeg (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:559:12)',
]);
const STACK_WORLDTICK = fakeStack([
  'Game.fieldFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:600:20)',
  'Object.resolveWildMonsterEncounter (/home/hatch/workspace/the-scattering/src/js/game.js:20940:10)',
  'Object.resolveWorldMonster (/home/hatch/workspace/the-scattering/src/js/game.js:20845:12)',
]);
const STACK_PATROL = fakeStack([
  'Game.fieldFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:600:20)',
  'Object.resolvePatrol (/home/hatch/workspace/the-scattering/src/js/game.js:15000:10)',
]);
const STACK_AID = fakeStack([
  'Game.fieldFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:600:20)',
  'Object.aidFight (/home/hatch/workspace/the-scattering/src/js/game.js:16000:10)',
]);
const STACK_OTHER = fakeStack([
  'Game.fieldFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:600:20)',
  'Object.contestDuel (/home/hatch/workspace/the-scattering/src/js/game.js:17000:10)',
]);
check('expeditionMonster stack -> expedition', DRIVER.fightOrigin(STACK_EXPED) === 'expedition', DRIVER.fightOrigin(STACK_EXPED));
check('resolveWildMonsterEncounter stack -> world-tick', DRIVER.fightOrigin(STACK_WORLDTICK) === 'world-tick', DRIVER.fightOrigin(STACK_WORLDTICK));
check('resolvePatrol stack -> patrol', DRIVER.fightOrigin(STACK_PATROL) === 'patrol', DRIVER.fightOrigin(STACK_PATROL));
check('aidFight stack -> aid', DRIVER.fightOrigin(STACK_AID) === 'aid', DRIVER.fightOrigin(STACK_AID));
check('unknown src/js caller -> other:<fn> (named, not silent)', DRIVER.fightOrigin(STACK_OTHER) === 'other:contestDuel', DRIVER.fightOrigin(STACK_OTHER));
check('empty stack -> unclassified (explicit, never a silent default)', DRIVER.fightOrigin('') === 'unclassified', DRIVER.fightOrigin(''));
check('driver-frame-only stack -> unclassified', DRIVER.fightOrigin(fakeStack(['Game.fieldFight (/home/hatch/workspace/the-scattering/scripts/seedpaths-driver-20261116.js:600:20)'])) === 'unclassified');

// ---------- 3. Seedland judge fixtures ----------
console.log('== seedland judge fixtures ==');
// Fixture builders: hand-classified per-seed corpora (instances
// carry bucket/resolved/closeDay exactly as classifySeedPaths
// produces them).
function baseSeed(over) {
  const j = {
    seed: 102141, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4encounters: [], killCalls: [], deaths: [],
    instances: [], attributionCoverage: 1,
  };
  return Object.assign(j, over || {});
}
function launchedInst(vid, target, seedDay, launchDay, companion, closeDay) {
  return { vid: vid, target: target, seedDay: seedDay, bucket: 'launched',
    resolved: [{ outcome: 'launched', day: launchDay, companion: companion || null }],
    closeDay: closeDay == null ? null : closeDay, closeKind: closeDay == null ? null : 'plan-deleted' };
}
function enc(day, vid, mid, wave, origin, outcome) {
  return { day: day, vid: vid, mid: mid, wave: wave, origin: origin, outcome: outcome };
}
function legOf(perSeedList) {
  // Hand-built leg summary in the shape judgeSeedland reads.
  let kills = 0, deaths = 0, starv = 0, fnk = 0, unlocked = 0;
  for (const s of perSeedList) {
    kills += s.launchedKills; deaths += s.launchedDeaths; starv += s.starvation;
    if (s.w5unlocked) { unlocked++; if (s.w5class === 'FACED-NOT-KILLED') fnk++; }
  }
  const med = perSeedList.map(function (s) { return s.gameDays; }).sort(function (a, b) { return a - b; });
  const median = med.length % 2 ? med[(med.length - 1) / 2] : (med[med.length / 2 - 1] + med[med.length / 2]) / 2;
  return { launchedKills: kills, launchedDeaths: deaths,
    killDeath: deaths === 0 ? null : +(kills / deaths).toFixed(2),
    vcDeathsSecondary: 0,
    facedNotKilledShare: unlocked ? +(fnk / unlocked).toFixed(2) : null,
    facedNotKilled: fnk, w5unlocked: unlocked,
    w5classes: perSeedList.map(function (s) { return { seed: s.seed, cls: s.w5class }; }),
    starvation: starv, medianSurvival: median,
    instrumentErrors: 0, files: 8, parseErrors: [], seeds: 8,
    attributionCoverage: 1, instancesOpened: perSeedList.length };
}
// J1: covering-launch window — kill day 25 (in [20,40]) counts,
// vDie day 30 counts, kill day 45 (past closeDay 40) is excluded.
(function () {
  const j = baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', 40)],
    v4encounters: [
      enc(25, 'v2', 'strike', 4, 'expedition', 'vKill'),
      enc(30, 'v1', 'strike', 4, 'expedition', 'vDie'),
      enc(45, 'v1', 'strike', 4, 'expedition', 'vKill'),
      enc(26, 'v1', 'strike', 4, 'world-tick', 'vKill'),
    ],
  });
  const r = ANALYZE.analyzeSeedlandSeed(j);
  check('J1 window: in-window kill + death count, past-close kill excluded, world-tick origin excluded',
    r.launchedKills === 1 && r.launchedDeaths === 1 && r.windowExcludedMeetings.length === 1 &&
    r.windowExcludedMeetings[0].day === 45 && r.originCounts['world-tick'] === 1,
    'kills=' + r.launchedKills + ' deaths=' + r.launchedDeaths + ' excluded=' + JSON.stringify(r.windowExcludedMeetings));
  check('J1 kill:death 1.0 (1 kill / 1 death)', (r.launchedDeaths ? r.launchedKills / r.launchedDeaths : null) === 1);
})();
// J2: distinct meetings — two identical rows for the same
// seed|vid|day|mid count once.
(function () {
  const j = baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, null, null)],
    v4encounters: [enc(25, 'v1', 'strike', 4, 'expedition', 'vKill'), enc(25, 'v1', 'strike', 4, 'expedition', 'vKill')],
  });
  const r = ANALYZE.analyzeSeedlandSeed(j);
  check('J2 distinct meetings: duplicate rows count once (kills 1, not 2)',
    r.launchedKills === 1, 'kills=' + r.launchedKills);
})();
// J3: kill:death zero-denominator pass — kills >= 1, deaths 0.
(function () {
  const onSeed = baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
    v4encounters: [enc(25, 'v2', 'strike', 4, 'expedition', 'vKill')],
    maxWave: 5,
    killCalls: [{ day: 25, mid: 'cancellation', wave: 5, by: 'v1', via: 'field', trick: null, dup: false }],
  });
  // Wave-5 kill in killCalls + a wave-5 encounter row -> KILLED.
  onSeed.v4encounters.push(enc(60, 'v1', 'cancellation', 5, 'expedition', 'vKill'));
  const r = ANALYZE.analyzeSeedlandSeed(onSeed);
  check('J3 zero-denominator: kills 1, deaths 0, w5 class KILLED',
    r.launchedKills === 1 && r.launchedDeaths === 0 && r.w5class === 'KILLED',
    'kills=' + r.launchedKills + ' deaths=' + r.launchedDeaths + ' cls=' + r.w5class);
  const ctrl = legOf([baseSeed({ gameDays: 150 })]);
  const on = legOf([r]);
  const judge = ANALYZE.judgeSeedland(ctrl, on);
  check('J3 judge: zero-denominator kill:death passes (value null)',
    judge.killDeath.pass === true && judge.killDeath.value === null,
    'pass=' + judge.killDeath.pass + ' value=' + judge.killDeath.value);
})();
// J4: wave-5 classes — LOCKED / NEVER-FACED / FACED-NOT-KILLED /
// KILLED, and 0-unlocked null FAILS bar 3.
(function () {
  const locked = ANALYZE.analyzeSeedlandSeed(baseSeed({ maxWave: 4 }));
  const neverFaced = ANALYZE.analyzeSeedlandSeed(baseSeed({ maxWave: 5 }));
  const fnkSeed = ANALYZE.analyzeSeedlandSeed(baseSeed({ maxWave: 5,
    v4encounters: [enc(60, 'v1', 'cancellation', 5, 'expedition', 'vFlee')] }));
  const killed = ANALYZE.analyzeSeedlandSeed(baseSeed({ maxWave: 5,
    v4encounters: [enc(60, 'v1', 'cancellation', 5, 'expedition', 'vKill')],
    killCalls: [{ day: 60, mid: 'cancellation', wave: 5, by: 'v1', via: 'field', trick: null, dup: false }] }));
  check('J4 wave-5 classes: LOCKED / NEVER-FACED / FACED-NOT-KILLED / KILLED',
    locked.w5class === 'LOCKED' && neverFaced.w5class === 'NEVER-FACED' &&
    fnkSeed.w5class === 'FACED-NOT-KILLED' && killed.w5class === 'KILLED',
    [locked.w5class, neverFaced.w5class, fnkSeed.w5class, killed.w5class].join('/'));
  const ctrl = legOf([baseSeed({ gameDays: 150 })]);
  const onNoUnlock = legOf([ANALYZE.analyzeSeedlandSeed(baseSeed({ maxWave: 4,
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
    v4encounters: [enc(25, 'v2', 'strike', 4, 'expedition', 'vKill')] }))]);
  const judge = ANALYZE.judgeSeedland(ctrl, onNoUnlock);
  check('J4 0-unlocked leg: facedNotKilledShare null and bar 3 FAILS (no wave-5 access)',
    judge.facedNotKilledShare.value === null && judge.facedNotKilledShare.pass === false,
    'share=' + judge.facedNotKilledShare.value + ' pass=' + judge.facedNotKilledShare.pass);
})();
// J5: full GO — all four bars pass on fixtures.
(function () {
  function goSeed(seed) {
    return ANALYZE.analyzeSeedlandSeed(baseSeed({ seed: seed, maxWave: 5, gameDays: 150,
      instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
      v4encounters: [
        enc(25, 'v2', 'strike', 4, 'expedition', 'vKill'),
        enc(60, 'v1', 'cancellation', 5, 'expedition', 'vKill'),
      ],
      killCalls: [{ day: 60, mid: 'cancellation', wave: 5, by: 'v1', via: 'field', trick: null, dup: false }],
    }));
  }
  const ctrl = legOf([baseSeed({ seed: 102141, gameDays: 150 }), baseSeed({ seed: 102142, gameDays: 140 })]);
  const on = legOf([goSeed(102141), goSeed(102142)]);
  const judge = ANALYZE.judgeSeedland(ctrl, on);
  check('J5 full GO fixture: all four bars + instrument pass -> GO',
    judge.verdict === 'GO' && judge.launchedPartyKills.pass && judge.killDeath.pass &&
    judge.facedNotKilledShare.pass && judge.costs.pass && judge.instrument.pass,
    'verdict=' + judge.verdict + ' bars=' + JSON.stringify({ b1: judge.launchedPartyKills.pass, b2: judge.killDeath.pass, b3: judge.facedNotKilledShare.pass, b4: judge.costs.pass }));
  // ...and one failing bar flips the verdict.
  const onNoKill = legOf([ANALYZE.analyzeSeedlandSeed(baseSeed({ seed: 102141, maxWave: 5, gameDays: 150 }))]);
  const judge2 = ANALYZE.judgeSeedland(ctrl, onNoKill);
  check('J5 one failing bar (0 kills) -> NO-GO',
    judge2.verdict === 'NO-GO' && judge2.launchedPartyKills.pass === false,
    'verdict=' + judge2.verdict);
  // ...and a cost-bar breach flips the verdict.
  const onStarving = legOf([Object.assign(goSeed(102141), { starvation: 99 })]);
  const judge3 = ANALYZE.judgeSeedland(ctrl, onStarving);
  check('J5 cost-bar breach (starvation) -> NO-GO',
    judge3.verdict === 'NO-GO' && judge3.costs.pass === false,
    'verdict=' + judge3.verdict);
})();
// J6: vcDeaths secondary — death-log 'villager combat' rows for a
// killed beast are counted as secondary, never in the bar.
(function () {
  const j = baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
    v4encounters: [enc(25, 'v2', 'strike', 4, 'expedition', 'vKill')],
    deaths: [{ day: 25, kind: 'monster', who: 'strike', cause: 'villager combat', player: false }],
  });
  const r = ANALYZE.analyzeSeedlandSeed(j);
  check('J6 vcDeaths secondary counted (1) but launchedDeaths stays 0',
    r.vcDeathsSecondary === 1 && r.launchedDeaths === 0,
    'vc=' + r.vcDeathsSecondary + ' deaths=' + r.launchedDeaths);
})();

// ---------- 4. Recorder: live in-memory run (shape + origins) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'));
  check('live driver sees SEEDLAND=1', driver.SEEDLAND === true);
  const out = await driver.oneRun(102141);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run policy sha is competent verbatim (74a890f0844e)', out.policySha === '74a890f0844e', 'got ' + out.policySha);
  const noOrigin = (out.v4encounters || []).find(function (r) { return !r.origin || typeof r.origin !== 'string'; });
  check('every recorded v4encounters row carries an origin string under SEEDLAND=1', !noOrigin, noOrigin ? JSON.stringify(noOrigin).slice(0, 300) : '');
  const badOrigin = (out.v4encounters || []).find(function (r) {
    return ['expedition', 'world-tick', 'patrol', 'aid', 'unclassified'].indexOf(r.origin) === -1 && r.origin.indexOf('other:') !== 0;
  });
  check('every origin is in the frozen taxonomy', !badOrigin, badOrigin ? JSON.stringify(badOrigin).slice(0, 300) : '');
  const w5rows = (out.v4encounters || []).filter(function (r) { return (r.wave | 0) === 5; });
  console.log('  info: live 5d run recorded ' + (out.v4encounters || []).length + ' encounters (' + w5rows.length + ' wave-5), ' +
    (out.v4seeds || []).length + ' seed rows');
  return out;
}

// ---------- 5. Flag-unset shape + determinism legs D1/D2 (60d, seed 102141) ----------
console.log('== flag-unset shape + determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  // An explicit undefined value means "remove this key from the child
  // env" (execFileSync would stringify it otherwise).
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/seedpaths-driver-20261116.js');" +
    "d.oneRun(102141).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  // Flag unset: seedpaths shape — every encounter row wave == 4 and
  // NO origin key at all.
  const unset = childRun(60, { SEEDLAND: undefined });
  const unsetEncs = unset.full.v4encounters || [];
  const unsetBadWave = unsetEncs.find(function (r) { return (r.wave | 0) !== 4; });
  const unsetHasOrigin = unsetEncs.find(function (r) { return 'origin' in r; });
  check('flag unset: every encounter row is wave 4 (no wave-5 watch)', !unsetBadWave, unsetBadWave ? JSON.stringify(unsetBadWave).slice(0, 200) : '');
  check('flag unset: no encounter row carries an origin key', !unsetHasOrigin, unsetHasOrigin ? JSON.stringify(unsetHasOrigin).slice(0, 200) : '');
  console.log('  info: flag-unset 60d run recorded ' + unsetEncs.length + ' encounters');
  // D1/D2 with SEEDLAND=1.
  const a = childRun(60, { SEEDLAND: '1' });
  const b = childRun(60, { SEEDLAND: '1' });
  check('D1 repeatability: identical full corpus, recorder ON twice, SEEDLAND=1 (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { SEEDLAND: '1', SEEDPATHS_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF, SEEDLAND=1 (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4 arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4encounters || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  const origins = {};
  for (const r of (a.full.v4encounters || [])) origins[r.origin] = (origins[r.origin] || 0) + 1;
  console.log('  info: D1 60d run recorded ' + (a.full.v4encounters || []).length + ' encounters by origin ' + JSON.stringify(origins) +
    ', ' + (a.full.v4seeds || []).length + ' seed rows');
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
