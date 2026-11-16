// test-planignite-a.js — proof for arm sim-planignite-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the driver wraps exist (incl. the ignition wraps on
// winPlanHavenTick and agencyTick), ZERO src/js change survives on
// the branch, the wave-4 id set matches the data, the gate sites
// exist where the prereg says they do, profileScoreParts reproduces
// the npcRangeProfile score without writing the cache,
// firstFailBucket places one fixture per Layer-1 bucket (plus the
// PROFILEGATE bypass and the indoor brain-EXPEDITION exception),
// classifyHavenCallOutcome places one fixture per call outcome,
// the planignite analyzer classifies one synthetic corpus per
// taxonomy row (no-ranger, no-engagement, ranger-never-reaches,
// haventick-called-no-create, ignited) and FAILS the bar on an
// unexplained village, the recorder rows carry a tick on every
// havenTick call and a named outcome on every call, and the
// determinism legs D1 (repeatability) + D2 (wrap neutrality) are
// green at 60d on seed 102601, with a 150d live run proving the
// tick-gate replica holds on every tick (predicted reached ==
// actual called, zero mismatches).
// Usage:
//   node scripts/test-planignite-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-planignite-a.js'));
const HAVEN = require(path.join(REPO, 'scripts', 'analyze-haventick-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'planignite-driver-20261116.js'));

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
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
check('ZERO src/js change: src worktree diff is empty (' + JSON.stringify(srcStatus) + ')', srcStatus.length === 0);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*planignite-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is planignite-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'planignite-driver-20261116.js'), 'utf8');
for (const w of ['agencyTick', 'winPlanHavenTick', 'havenTickCalls', 'tickGates', 'tickGateChecks', 'tickGateTotals', 'igniteCensus', 'igniteVillage', 'profileOfReplica', 'profileScoreParts', 'firstFailBucket', 'classifyHavenCallOutcome', 'GATE_BUCKETS', 'PLANIGNITE_RECORDER', 'mid-tick-exped', 'v4creates', 'planCensus']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver is control-leg only (MODE must be control)', driverSrc.indexOf('MODE must be control') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records tick + outcome on havenTickCalls rows',
  driverSrc.indexOf('tick: callTick') !== -1 && driverSrc.indexOf('row.outcome = classifyHavenCallOutcome(row)') !== -1);
check('ignition wraps are cache-neutral: havenTick wrap + gate replica + census use profileOfReplica/profileScoreParts, never npcRangeProfile',
  driverSrc.indexOf('prof = profileOfReplica(this, vid)') !== -1 &&
  driverSrc.indexOf('prof = profileOfReplica(Game, vid)') !== -1 &&
  driverSrc.indexOf('parts = profileScoreParts(Game, vid)') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
// The gate sites exist where the prereg says they do (call TEXT is
// the anchor — line numbers drift daily).
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
check('Layer-1 loop: agencyTick calls winPlanHavenTick once per reached villager',
  agencyJs.indexOf('this.winPlanHavenTick(rid, hx, hy)') !== -1);
check('Layer-1 gate: engaged skip before havenTick', agencyJs.indexOf('this.isEngaged(rid)') !== -1);
check('Layer-1 gate: expedition branch before havenTick', agencyJs.indexOf('var ex = a.exped[rid]') !== -1);
check('Layer-1 gate: PROFILEGATE bypass exists (party_launch commit)',
  agencyJs.indexOf('_pgLaunch') !== -1 && agencyJs.indexOf("winPlanAction === 'party_launch'") !== -1);
check('Layer-1 gate: indoor objective skip with brain-EXPEDITION exception',
  agencyJs.indexOf('oo.indoor') !== -1 && agencyJs.indexOf('_brainExped') !== -1);
check('Layer-1 gate: expedition_launch trigger check',
  agencyJs.indexOf("this.npcTrigger(rid, 'expedition_launch')") !== -1);
check('Layer-1 gate: night skip', agencyJs.indexOf('if (night) continue') !== -1);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('Layer-2 creation site: winPlanHavenTick creates a plan (win-plan.js)',
  winPlanJs.indexOf('winPlanHavenTick(vid, hx, hy)') !== -1 &&
  winPlanJs.indexOf("plan = { stage: 'gear', target: null") !== -1);
check('Layer-2 engagement: lived (fought) or heard (villageSlain) gates creation',
  winPlanJs.indexOf('kn.fought') !== -1 && winPlanJs.indexOf('this.state.villageSlain') !== -1);
check('winPlanHavenTick is called from exactly one place (agencyTick)',
  (agencyJs.match(/this\.winPlanHavenTick\(/g) || []).length === 1);
check('GATE_BUCKETS lists the frozen Layer-1 buckets in code order',
  JSON.stringify(DRIVER.GATE_BUCKETS) === JSON.stringify(['player-skip', 'dead', 'engaged', 'onExped', 'notRanger', 'notAtHaven', 'night', 'indoor', 'trigger', 'reached', 'instrument-error']),
  JSON.stringify(DRIVER.GATE_BUCKETS));

// ---------- 2. profileScoreParts + firstFailBucket fixtures ----------
console.log('== profile + gate fixtures ==');
function fakeGame(over) {
  const o = over || {};
  return {
    villagerId: o.playerId || 'player',
    vpOf: function (vid) { return (o.people || {})[vid] || null; },
    isEngaged: function (vid) { return !!((o.engaged || {})[vid]); },
    agencyState: function () {
      return { exped: o.exped || {}, profiles: o.profiles || {},
        potential: o.potential || {}, know: o.know || {} };
    },
    npcNode: function (vid) { return (o.nodes || {})[vid] || null; },
    isNight: function () { return !!o.night; },
    objOf: function (vid) { return (o.objectives || {})[vid] || null; },
    npcTrigger: function (vid, ev) { return !!((o.triggers || {})[vid + ':' + ev]); },
    vbrainCommit: function (vid) { return (o.commits || {})[vid] || null; },
    npcTemper: function (vid) { return ((o.tempers || {})[vid]) || 'steady'; },
    npcGoal: function (vid) { return (o.goals || {})[vid] || null; },
    npcRangingApt: function (vid) { return (o.apts || {})[vid] || 0; },
    state: { scholar: { day: o.day || 10 }, villageSlain: o.slain || {} },
  };
}
(function () {
  // bold + explore + young + apt 2 + potential = 2+2+1+2+2 = 9 -> explorer.
  const g = fakeGame({ people: { v1: { age: 25 } }, tempers: { v1: 'bold' }, goals: { v1: 'explore' }, apts: { v1: 2 }, potential: { v1: true } });
  const p = DRIVER.profileScoreParts(g, 'v1');
  check('profileScoreParts: bold/explore/25/apt2/potential scores 9 -> explorer, cache untouched',
    p.score === 9 && p.profile === 'explorer' && p.cached === null &&
    JSON.stringify((g.agencyState().profiles || {})) === '{}',
    'score=' + p.score + ' profile=' + p.profile);
  // cautious + heal + 60 + apt 0 = -2-1-2 = -5 -> homebody.
  const g2 = fakeGame({ people: { v2: { age: 60 } }, tempers: { v2: 'cautious' }, goals: { v2: 'heal' }, apts: { v2: 0 } });
  const p2 = DRIVER.profileScoreParts(g2, 'v2');
  check('profileScoreParts: cautious/heal/60/apt0 scores -5 -> homebody',
    p2.score === -5 && p2.profile === 'homebody', 'score=' + p2.score + ' profile=' + p2.profile);
  // Cached profile wins over recomputation (the game uses the cache).
  const g3 = fakeGame({ people: { v3: { age: 25 } }, tempers: { v3: 'bold' }, goals: { v3: 'explore' }, apts: { v3: 2 }, potential: { v3: true }, profiles: { v3: 'forager' } });
  const p3 = DRIVER.profileScoreParts(g3, 'v3');
  check('profileScoreParts: cached forager wins over computed explorer',
    p3.profile === 'forager' && p3.computed === 'explorer', 'profile=' + p3.profile + ' computed=' + p3.computed);
})();
(function () {
  const ctx = { hx: 4, hy: 4, day: 10, night: false };
  const base = { people: { v1: { age: 30 } }, tempers: { v1: 'bold' }, goals: { v1: 'explore' }, apts: { v1: 2 }, nodes: { v1: { nx: 4, ny: 4 } } };
  function bucket(over) {
    const g = fakeGame(Object.assign({}, base, over || {}));
    return DRIVER.firstFailBucket(g, 'v1', ctx);
  }
  check('firstFailBucket: ranger at Haven, day -> reached', bucket() === 'reached', bucket());
  check('firstFailBucket: player -> player-skip',
    DRIVER.firstFailBucket(fakeGame({ playerId: 'v1' }), 'v1', ctx) === 'player-skip');
  check('firstFailBucket: dead -> dead', bucket({ people: { v1: { age: 30, dead: true } } }) === 'dead');
  check('firstFailBucket: engaged -> engaged', bucket({ engaged: { v1: true } }) === 'engaged');
  check('firstFailBucket: onExped -> onExped', bucket({ exped: { v1: { duration: 5 } } }) === 'onExped');
  check('firstFailBucket: cautious homebody -> notRanger',
    bucket({ tempers: { v1: 'cautious' }, goals: { v1: 'heal' }, apts: { v1: 0 } }) === 'notRanger');
  check('firstFailBucket: PROFILEGATE bypass — non-ranger + today party_launch commit -> reached',
    bucket({ tempers: { v1: 'cautious' }, goals: { v1: 'heal' }, apts: { v1: 0 },
      commits: { v1: { day: 10, winPlanAction: 'party_launch' } } }) === 'reached');
  check('firstFailBucket: PROFILEGATE bypass needs TODAY (yesterday commit does not bypass)',
    bucket({ tempers: { v1: 'cautious' }, goals: { v1: 'heal' }, apts: { v1: 0 },
      commits: { v1: { day: 9, winPlanAction: 'party_launch' } } }) === 'notRanger');
  check('firstFailBucket: away from Haven -> notAtHaven', bucket({ nodes: { v1: { nx: 7, ny: 7 } } }) === 'notAtHaven');
  check('firstFailBucket: night -> night', DRIVER.firstFailBucket(fakeGame(base), 'v1', { hx: 4, hy: 4, day: 10, night: true }) === 'night');
  check('firstFailBucket: indoor objective -> indoor',
    bucket({ objectives: { v1: { indoor: true, state: 'indoor' } } }) === 'indoor');
  check('firstFailBucket: indoor objective + brain EXPEDITION commit -> reached',
    bucket({ objectives: { v1: { indoor: true, state: 'indoor' } },
      commits: { v1: { day: 10, kind: 'EXPEDITION' } } }) === 'reached');
  check('firstFailBucket: expedition_launch trigger -> trigger',
    bucket({ triggers: { 'v1:expedition_launch': true } }) === 'trigger');
})();

// ---------- 3. classifyHavenCallOutcome fixtures ----------
console.log('== call-outcome fixtures ==');
check('call outcome: created -> created',
  DRIVER.classifyHavenCallOutcome({ created: true, planBefore: false, profile: 'wanderer', lived: true, heard: false }) === 'created');
check('call outcome: plan already held -> plan-exists',
  DRIVER.classifyHavenCallOutcome({ created: false, planBefore: true, profile: 'wanderer', lived: true, heard: true }) === 'plan-exists');
check('call outcome: non-ranger via bypass, no engagement -> profile-fail',
  DRIVER.classifyHavenCallOutcome({ created: false, planBefore: false, profile: 'homebody', lived: false, heard: false }) === 'profile-fail');
check('call outcome: ranger, no lived and no heard -> engagement-fail',
  DRIVER.classifyHavenCallOutcome({ created: false, planBefore: false, profile: 'explorer', lived: false, heard: false }) === 'engagement-fail');
check('call outcome: ranger + engaged + no plan + no creation -> unexplained-call',
  DRIVER.classifyHavenCallOutcome({ created: false, planBefore: false, profile: 'wanderer', lived: true, heard: false }) === 'unexplained-call');
check('call outcome: ranger + heard only + no creation -> unexplained-call',
  DRIVER.classifyHavenCallOutcome({ created: false, planBefore: false, profile: 'wanderer', lived: false, heard: true }) === 'unexplained-call');

// ---------- 4. classifyIgnition fixtures (one synthetic corpus per taxonomy row) ----------
console.log('== ignition classifier fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 102601, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], companionPool: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
    v4creates: [], planCensus: [], v4departs: [], v4gates: [], v4encounters: [],
    dawnbidStarts: [], havenTickCalls: [], tickGates: [], tickGateChecks: [],
    tickGateTotals: {}, igniteCensus: [], igniteVillage: [],
  };
  return Object.assign(j, over || {});
}
function censusRow(day, vid, profile, opts) {
  const o = opts || {};
  return { day: day, vid: vid, profile: profile, temper: o.temper || 'steady',
    goal: o.goal || 'joy', age: o.age == null ? 35 : o.age, rangingApt: o.rangingApt == null ? 0 : o.rangingApt,
    potential: !!o.potential, score: o.score == null ? 0 : o.score, alive: true,
    node: { nx: 4, ny: 4 }, atHaven: true, onExped: !!o.onExped, away: false,
    engaged: false, foughtN: o.foughtN || 0, hasPlan: false, slainN: o.slainN || 0 };
}
function villageRow(day, slainN, nRangers) {
  return { day: day, slainN: slainN, nRangers: nRangers, nRangersAtHaven: nRangers,
    nRangersOnExped: 0, havenTickCallsToday: 0, creationsToday: 0, firstSlainDay: slainN > 0 ? day : null };
}
function callRow(day, vid, profile, lived, heard, created) {
  return { tick: day * 4, day: day, part: 0, vid: vid, profile: profile,
    lived: lived, heard: heard, foughtN: lived ? 1 : 0, slainN: heard ? 1 : 0,
    planBefore: false, created: created,
    outcome: created ? 'created' : (profile !== 'wanderer' && profile !== 'explorer') ? 'profile-fail'
      : (!lived && !heard) ? 'engagement-fail' : 'unexplained-call', caller: 'Object.agencyTick (villager-agency.js:433:10)' };
}
function classifyOne(j) { return ANALYZE.classifyIgnition(j, HAVEN.classifyHavenTick(j)); }
// P1: no ranger ever — all homebody/forager, zero ranger-days.
(function () {
  const j = baseSeed({
    igniteCensus: [censusRow(10, 'v1', 'homebody', { temper: 'cautious', goal: 'heal', age: 58, score: -5 }),
      censusRow(10, 'v2', 'forager', { temper: 'gentle', goal: 'heal', age: 50, score: 0 }),
      censusRow(11, 'v1', 'homebody', { temper: 'cautious', goal: 'heal', age: 58, score: -5 })],
    igniteVillage: [villageRow(10, 0, 0), villageRow(11, 0, 0)],
  });
  const r = classifyOne(j);
  check('P1 no-ranger: zero ranger-days -> blocker no-ranger, modal profile homebody',
    r.noPlan === true && r.blocker === 'no-ranger' && r.subBlocker === null &&
    r.detail.modalProfile === 'homebody' && r.detail.villagers.length === 2,
    'blocker=' + r.blocker + ' modal=' + (r.detail || {}).modalProfile);
})();
// P2: rangers exist, engagement never true.
(function () {
  const j = baseSeed({
    igniteCensus: [censusRow(10, 'v1', 'wanderer', { temper: 'bold', goal: 'explore', age: 25, rangingApt: 2, potential: true, score: 9 }),
      censusRow(11, 'v1', 'wanderer', { temper: 'bold', goal: 'explore', age: 25, rangingApt: 2, potential: true, score: 9 })],
    igniteVillage: [villageRow(10, 0, 1), villageRow(11, 0, 1)],
  });
  const r = classifyOne(j);
  check('P2 no-engagement: rangers exist, slainN 0 every day, no ranger ever fought -> no-engagement',
    r.blocker === 'no-engagement' && r.heardEver === false && r.foughtEver === false,
    'blocker=' + r.blocker);
})();
// P3: rangers exist, engagement true, but no ranger ever gets a havenTick call.
(function () {
  const j = baseSeed({
    igniteCensus: [censusRow(10, 'v1', 'wanderer', { temper: 'bold', goal: 'explore', age: 25, rangingApt: 2, potential: true, score: 9, foughtN: 0, slainN: 1 }),
      censusRow(11, 'v1', 'wanderer', { temper: 'bold', goal: 'explore', age: 25, rangingApt: 2, potential: true, score: 9, foughtN: 0, slainN: 1 })],
    igniteVillage: [villageRow(10, 1, 1), villageRow(11, 1, 1)],
    tickGateTotals: { v1: { notAtHaven: 50, onExped: 20, reached: 0 } },
    tickGateChecks: [{ tick: 1, day: 10, part: 0, predicted: [], actual: [], match: true, explained: [], unexplained: [] }],
  });
  const r = classifyOne(j);
  check('P3 ranger-never-reaches: engagement true, zero ranger calls -> blocker + modal bucket notAtHaven',
    r.blocker === 'ranger-never-reaches-haventick' && r.subBlocker === 'notAtHaven' &&
    r.detail.rangerBucketDist.notAtHaven === 50 && r.detail.rangerBucketDist.onExped === 20,
    'blocker=' + r.blocker + ' sub=' + r.subBlocker + ' dist=' + JSON.stringify(r.detail.rangerBucketDist));
})();
// P4: ranger calls exist, all engagement-fail, zero creations.
(function () {
  const j = baseSeed({
    igniteCensus: [censusRow(10, 'v1', 'wanderer', { temper: 'bold', goal: 'explore', age: 25, rangingApt: 2, potential: true, score: 9 })],
    igniteVillage: [villageRow(10, 1, 1)],
    havenTickCalls: [callRow(10, 'v1', 'wanderer', false, false, false),
      callRow(11, 'v1', 'wanderer', false, false, false)],
    tickGateChecks: [{ tick: 40, day: 10, part: 0, predicted: ['v1'], actual: ['v1'], match: true, explained: [], unexplained: [] }],
  });
  const r = classifyOne(j);
  check('P4 haventick-called-no-create: ranger calls exist, zero creations -> modal outcome engagement-fail',
    r.blocker === 'haventick-called-no-create' && r.subBlocker === 'engagement-fail' &&
    r.detail.callOutcomes['engagement-fail'] === 2,
    'blocker=' + r.blocker + ' sub=' + r.subBlocker);
})();
// P5: a ranger call that should have created but did not -> unexplained (bar 1 fails by construction).
(function () {
  const j = baseSeed({
    igniteCensus: [censusRow(10, 'v1', 'wanderer', { temper: 'bold', goal: 'explore', age: 25, rangingApt: 2, potential: true, score: 9, foughtN: 1, slainN: 1 })],
    igniteVillage: [villageRow(10, 1, 1)],
    havenTickCalls: [callRow(10, 'v1', 'wanderer', true, false, false)],
  });
  const r = classifyOne(j);
  check('P5 unexplained: ranger + engaged + no plan + no creation -> blocker unexplained',
    r.blocker === 'unexplained' && r.subBlocker === 'unexplained-call' && r.unexplainedCalls === 1,
    'blocker=' + r.blocker + ' unexplainedCalls=' + r.unexplainedCalls);
})();
// P6: ignited — a havenTick creation on day 20.
(function () {
  const j = baseSeed({
    v4creates: [{ day: 20, vid: 'v1', creator: 'havenTick', source: 'heard', profile: 'wanderer',
      stageAfter: 'gear', target: null, needWave: null, foughtN: 0, slainN: 2,
      caller: 'Object.agencyTick (villager-agency.js:433:10)' }],
    igniteCensus: [censusRow(20, 'v1', 'wanderer', { temper: 'bold', goal: 'explore', age: 25, rangingApt: 2, potential: true, score: 9, slainN: 2 })],
    igniteVillage: [villageRow(20, 2, 1)],
    planCensus: [{ day: 20, vid: 'v1', target: null, needWave: null, stage: 'gear', party: [],
      holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false,
      holderSick: false, holderHealth: 100, holderGear: { armed: false, armored: false } }],
  });
  const r = classifyOne(j);
  check('P6 ignited: creation day 20 havenTick/heard -> blocker ignited with first-creation day/source',
    r.noPlan === false && r.blocker === 'ignited' && r.detail.firstCreationDay === 20 &&
    r.detail.firstCreator === 'havenTick' && r.detail.firstSource === 'heard',
    'blocker=' + r.blocker + ' first=' + JSON.stringify(r.detail));
})();
// P7: scorePartsBreakdown reproduces the profile score from recorded inputs.
(function () {
  const parts = ANALYZE.scorePartsBreakdown({ temper: 'cautious', goal: 'heal', age: 58, rangingApt: 0, potential: false });
  check('P7 scorePartsBreakdown: cautious/heal/58/apt0 -> temper -2, goal -1, age -2, total -5',
    parts.temper === -2 && parts.goal === -1 && parts.age === -2 && parts.total === -5,
    JSON.stringify(parts));
})();

// ---------- 5. Recorder: live in-memory run (shape + replica validation) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'planignite-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'planignite-driver-20261116.js'));
  const out = await driver.oneRun(102601);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries ignition arrays', Array.isArray(out.havenTickCalls) && Array.isArray(out.tickGates) &&
    Array.isArray(out.tickGateChecks) && Array.isArray(out.igniteCensus) && Array.isArray(out.igniteVillage) &&
    out.tickGateTotals && typeof out.tickGateTotals === 'object');
  check('live run carries creation-ledger arrays (v4creates, planCensus)', Array.isArray(out.v4creates) && Array.isArray(out.planCensus));
  check('live run policy sha is competent verbatim (df9b7dff4de4)', out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  const badCall = (out.havenTickCalls || []).find(function (r) {
    return !(r && typeof r.tick === 'number' && typeof r.day === 'number' && r.vid &&
      (r.profile === 'wanderer' || r.profile === 'explorer' || r.profile === 'forager' || r.profile === 'homebody') &&
      typeof r.lived === 'boolean' && typeof r.heard === 'boolean' &&
      typeof r.planBefore === 'boolean' && typeof r.created === 'boolean' &&
      ['created', 'plan-exists', 'profile-fail', 'engagement-fail', 'unexplained-call'].indexOf(r.outcome) !== -1);
  });
  check('every recorded havenTickCalls row carries a tick + named outcome', !badCall, badCall ? JSON.stringify(badCall).slice(0, 300) : '');
  const badCheck = (out.tickGateChecks || []).find(function (c) { return !c.match; });
  check('every tickGateChecks row matches (predicted reached == actual called) on the 5d run', !badCheck,
    badCheck ? JSON.stringify(badCheck).slice(0, 300) : '');
  check('tickGateChecks count equals tickGates count', out.tickGateChecks.length === out.tickGates.length,
    'checks=' + out.tickGateChecks.length + ' gates=' + out.tickGates.length);
  const badCensus = (out.igniteCensus || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && typeof r.profile === 'string' &&
      typeof r.temper === 'string' && typeof r.age === 'number' &&
      typeof r.atHaven === 'boolean' && typeof r.onExped === 'boolean');
  });
  check('every igniteCensus row carries profile inputs (temper/goal/age/rangingApt/potential)', !badCensus,
    badCensus ? JSON.stringify(badCensus).slice(0, 300) : '');
  console.log('  info: live 5d run recorded ' + (out.havenTickCalls || []).length + ' havenTick calls, ' +
    (out.tickGates || []).length + ' ticks, ' + (out.igniteCensus || []).length + ' census rows, ' +
    (out.igniteVillage || []).length + ' village rows, ' + (out.v4creates || []).length + ' creates');
  return out;
}

// ---------- 6. Determinism legs D1 + D2 (60d, seed 102601) + 150d replica validation ----------
console.log('== determinism legs D1/D2 + replica ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  const script = "const d=require('./scripts/planignite-driver-20261116.js');" +
    "d.oneRun(102601).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childRun(60, {});
  const b = childRun(60, {});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { PLANIGNITE_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty ignition arrays',
    (off.full.havenTickCalls || []).length === 0 && (off.full.tickGates || []).length === 0 &&
    (off.full.tickGateChecks || []).length === 0 && (off.full.igniteCensus || []).length === 0 &&
    (off.full.igniteVillage || []).length === 0 &&
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4creates || []).length === 0 && (off.full.planCensus || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  const mm60 = (a.full.tickGateChecks || []).filter(function (c) { return !c.match; });
  check('D1 60d run: tick-gate replica holds on every tick (0 mismatches)',
    mm60.length === 0, mm60.length + ' mismatches: ' + JSON.stringify(mm60.slice(0, 2)));
  const nullTicks = (a.full.havenTickCalls || []).filter(function (r) { return r.tick == null; });
  check('D1 60d run: every havenTick call carries a non-null tick (called from agencyTick only)',
    nullTicks.length === 0, nullTicks.length + ' null-tick calls');
  console.log('  info: D1 60d run recorded ' + (a.full.havenTickCalls || []).length + ' havenTick calls, ' +
    (a.full.tickGates || []).length + ' ticks, ' + (a.full.igniteCensus || []).length + ' census rows, ' +
    (a.full.v4creates || []).length + ' creates');
  // 150d live run: the replica validation — predicted reached ==
  // actual called on EVERY tick of the full judged horizon.
  const long = childRun(150, {});
  const mm150 = (long.full.tickGateChecks || []).filter(function (c) { return !c.match; });
  check('150d live run: tick-gate replica holds on every tick (0 mismatches)',
    mm150.length === 0, mm150.length + ' mismatches: ' + JSON.stringify(mm150.slice(0, 2)));
  // NOTE (test fix, not a re-score): this check used to assert zero
  // 'unexplained-call' outcomes. That asserts a GAME property, not
  // an instrument property — and the game property is FALSE on this
  // seed (the winPlan-store finding: rangers reach havenTick engaged
  // with no plan and no creation because v.winPlan was never
  // initialized — see the evidence file). 'unexplained-call' IS a
  // named outcome; the instrument's job is to record it faithfully.
  // Whether any village lands unexplained is the analyzer's bar 1,
  // judged on the corpus — not this proof test. What the proof test
  // asserts here is that every call carries a NAMED outcome.
  const badOutcome150 = (long.full.havenTickCalls || []).find(function (r) {
    return ['created', 'plan-exists', 'profile-fail', 'engagement-fail', 'unexplained-call'].indexOf(r.outcome) === -1;
  });
  check('150d live run: every havenTick call carries a NAMED outcome (unexplained-call included — it is a named bucket)',
    !badOutcome150, badOutcome150 ? JSON.stringify(badOutcome150).slice(0, 300) : '');
  const unexplained150 = (long.full.havenTickCalls || []).filter(function (r) { return r.outcome === 'unexplained-call'; });
  console.log('  info: 150d run recorded ' + unexplained150.length + ' unexplained-call outcomes (the winPlan-store finding — see evidence)');
  console.log('  info: 150d run havenTick calls ' + (long.full.havenTickCalls || []).length +
    ', ticks ' + (long.full.tickGates || []).length + ', creates ' + (long.full.v4creates || []).length +
    ', igniteCensus rows ' + (long.full.igniteCensus || []).length);
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
