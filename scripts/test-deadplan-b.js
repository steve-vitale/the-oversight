// test-deadplan-b.js — proof for arm sim-deadplan-b (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the driver wraps exist (all eleven winPlan entry
// points + the dawn-pool completeness array), the game-code diff is
// EMPTY (this arm ships no game change at all — no seed call), the
// wave-4 id set matches the data, the creation sites exist where the
// prereg says they do, exactly ONE delete of a winPlan entry exists
// in src/js (the table-active case) and there is NO death cleanup,
// classifySeedPath / classifyHavenSource place their fixtures, the
// deadplan analyzer classifies NOISE-ONLY vs COSTLY from the frozen
// bar-3 rule (clean corpus, dawn pool touch, depart touch, winPlanOf
// creation for the dead, slot refs, census-noise math, validity
// failures), the recorder rows carry a named method + boolean
// holderAlive on every deadTouches row, and the determinism legs D1
// (repeatability) + D2 (wrap neutrality) are green at 60d on seed
// 103221, with a 150d live run proving every recorded row is named.
// Usage:
//   node scripts/test-deadplan-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-deadplan-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'));

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
check('game-code worktree diff is EMPTY — this DIAG ships no game change (src status: ' + JSON.stringify(srcStatus) + ')',
  srcStatus.length === 0);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*deadplan-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is deadplan-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'winPlanHavenTick', 'winPlanOf', 'winPlanDepart', 'winPlanNoteFight', 'winPlanNoteKill', 'winPlanSecondCompanion', 'winPlanBondsTick', 'winPlanMusterTick', 'startExpedition', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'poolReplica', 'members', 'classifySeedPath', 'classifyHavenSource', 'firstCallerFrame', 'DEADPLAN_RECORDER', 'v4creates', 'planCensus', 'planExistedBefore', 'deadTouches', 'dawnScored', 'touchRow', 'personAlive', 'DEADPLAN_TOUCH_METHODS', 'holderAlive']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver records holderAlive on v4creates rows', driverSrc.indexOf('holderAlive: personAlive(vid), creator:') !== -1);
check('driver records holderAlive on dawnbidScores rows', driverSrc.indexOf('holderAlive: personAlive(vid),\n              cands: candsProj') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver MODE is off|on (no seed call in this arm)', driverSrc.indexOf("MODE must be off|on") !== -1 && driverSrc.indexOf('NO seed call') !== -1);
check('DEADPLAN_TOUCH_METHODS lists the eleven entry points',
  JSON.stringify(DRIVER.DEADPLAN_TOUCH_METHODS) === JSON.stringify(['winPlanOf', 'winPlanHavenTick', 'winPlanDepart', 'winPlanSeedFromFight', 'winPlanNoteFight', 'winPlanNoteKill', 'winPlanFightGate', 'winPlanSecondCompanion', 'winPlanBondsTick', 'winPlanMusterTick', 'vbrainExecuteDepart']),
  JSON.stringify(DRIVER.DEADPLAN_TOUCH_METHODS));
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('exactly three winPlan assignments exist in src/js (havenTick, seed, winPlanOf)',
  (function () {
    const src = winPlanJs;
    const re = /v\.winPlan\[vid\] = /g;
    let m, n = 0;
    while ((m = re.exec(src)) !== null) n++;
    return n === 3;
  })());
check('exactly ONE delete of a winPlan entry exists in src/js (the table-active case, no death cleanup)',
  (function () {
    const re = /delete v\.winPlan\[vid\]/g;
    const hits = winPlanJs.match(re) || [];
    if (hits.length !== 1) return false;
    const idx = winPlanJs.indexOf('delete v.winPlan[vid]');
    const ctx = winPlanJs.slice(Math.max(0, idx - 300), idx + 50);
    return ctx.indexOf('tableActive') !== -1;
  })());
check('agencyTick skips the dead before winPlanHavenTick / winPlanDepart',
  (function () {
    const a = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
    const skip = a.indexOf('if (vp && vp.dead) continue;');
    const haven = a.indexOf('this.winPlanHavenTick(rid, hx, hy)');
    const depart = a.indexOf('this.winPlanDepart(rid, hx, hy, playerAtHaven)');
    return skip !== -1 && haven !== -1 && depart !== -1 && skip < haven && skip < depart;
  })());
check('findCompanion + winPlanSecondCompanion + planActorsAtHaven filter the dead (alive check)',
  winPlanJs.indexOf('if (!alive(self, cid)) continue;') !== -1 &&
  winPlanJs.indexOf('if (!alive(this, cid)) continue;') !== -1 &&
  winPlanJs.indexOf('if (!alive(self, vid)) continue;') !== -1);
check('static reader check: winPlan lives only in game/agency/brain/win-plan; standing/table clean',
  (function () {
    const s = ANALYZE.staticReaderCheck(REPO);
    return s.problems.length === 0 &&
      JSON.stringify(s.filesWithWinPlan) === JSON.stringify(['game.js', 'villager-agency.js', 'villager-brain.js', 'win-plan.js']) &&
      s.standingTableClean === true;
  })());

// ---------- 2. classifySeedPath + classifyHavenSource fixtures ----------
console.log('== classifier fixtures ==');
function fakeStack(frames) {
  return 'Error: deadplan-caller\n' + frames.map(function (f) { return '    at ' + f; }).join('\n');
}
const STACK_WORLD_TICK = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/deadplan-driver-20261117.js:401:20)',
  'Object.resolveWildMonsterEncounter (/home/hatch/workspace/the-scattering/src/js/game.js:20940:10)',
]);
const STACK_AGENCY = fakeStack([
  'Game.winPlanSeedFromFight (/home/hatch/workspace/the-scattering/scripts/deadplan-driver-20261117.js:401:20)',
  'Object.expeditionMonster (/home/hatch/workspace/the-scattering/src/js/villager-agency.js:660:40)',
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
check('classifyHavenSource: fought only -> lived',
  DRIVER.classifyHavenSource(2, 0) === 'lived', DRIVER.classifyHavenSource(2, 0));
check('classifyHavenSource: slain only -> heard',
  DRIVER.classifyHavenSource(0, 3) === 'heard', DRIVER.classifyHavenSource(0, 3));
check('classifyHavenSource: neither -> unknown-deadplan-no-engagement (explicit, never silent)',
  DRIVER.classifyHavenSource(0, 0) === 'unknown-deadplan-no-engagement', DRIVER.classifyHavenSource(0, 0));

// ---------- 3. Deadplan analyzer fixtures ----------
console.log('== deadplan analyzer fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 103221, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], companionPool: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
    v4creates: [], planCensus: [], v4departs: [], v4gates: [], v4encounters: [],
    dawnbidStarts: [], deadTouches: [], dawnScored: [],
  };
  return Object.assign(j, over || {});
}
function censusRow(day, vid, target, stage, alive, party) {
  return { day: day, vid: vid, target: target === undefined ? null : target, needWave: target ? 4 : null, stage: stage,
    party: (party || []).slice(),
    holderAlive: alive, holderNode: { nx: 0, ny: 0 }, holderExped: false,
    holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } };
}
function touchRow(day, method, vid, alive, extra) {
  return Object.assign({ day: day, method: method, vid: vid, holderAlive: alive,
    planExistedBefore: true, planExistedAfter: true, caller: 'Object.agencyTick (villager-agency.js:433:10)' }, extra || {});
}
function dailyRoster(day, entries) {
  return { day: day, waveKillLog: [], roster: entries.map(function (e) { return { vid: e[0], name: e[0], dead: e[1] }; }) };
}

// D1: clean corpus — a dead holder lingers 40 days in the census,
// every touch is live, no pool/slot instance -> NOISE-ONLY.
(function () {
  const census = [];
  for (let d = 10; d <= 14; d++) census.push(censusRow(d, 'v1', null, 'party', true));
  for (let d = 15; d <= 54; d++) census.push(censusRow(d, 'v1', null, 'party', false));
  for (let d = 10; d <= 54; d++) census.push(censusRow(d, 'v2', null, 'gear', true));
  const j = baseSeed({
    v4creates: [{ day: 10, vid: 'v1', holderAlive: true, creator: 'havenTick', source: 'lived', profile: 'wanderer', stageAfter: 'gear', target: null, needWave: null, foughtN: 1, slainN: 0, caller: 'x' }],
    planCensus: census,
    deadTouches: [touchRow(11, 'winPlanHavenTick', 'v1', true), touchRow(12, 'winPlanDepart', 'v1', true, { result: 'hold' })],
    dawnScored: [{ day: 11, part: 0, vid: 'v1', holderAlive: true, planStage: 'party', planTarget: null, hasWinPlanCand: true }],
    daily: [dailyRoster(150, [['v1', true], ['v2', false]])],
  });
  const one = ANALYZE.analyzeOne(j);
  check('D1 clean corpus: linger share 40/90, longest tail span 39, longTails 1',
    one.linger.censusTotal === 90 && one.linger.censusDead === 40 &&
    one.linger.share === +(40 / 90).toFixed(4) &&
    one.linger.longestSpan === 39 && one.linger.longTails === 1 &&
    one.linger.distinctDeadHolders === 1,
    'total=' + one.linger.censusTotal + ' dead=' + one.linger.censusDead + ' span=' + one.linger.longestSpan);
  check('D1 clean corpus: bucket 0-30 has 16 dead rows of 42, bucket 31-60 has 24 dead of 48',
    one.linger.buckets['0-30'].dead === 16 && one.linger.buckets['0-30'].total === 42 &&
    one.linger.buckets['31-60'].dead === 24 &&
    one.linger.buckets['31-60'].total === 48,
    JSON.stringify(one.linger.buckets));
  check('D1 clean corpus: census noise final day incl 2 excl 1 (mean inflation > 1)',
    one.censusNoise.finalDayIncl === 2 && one.censusNoise.finalDayExcl === 1 &&
    one.censusNoise.meanInflation > 1,
    'final=' + one.censusNoise.finalDayIncl + '/' + one.censusNoise.finalDayExcl);
  const c = ANALYZE.classify([j]);
  check('D1 clean corpus classifies NOISE-ONLY with zero pool + zero slot',
    c.verdict === 'NOISE-ONLY' && c.poolTotal === 0 && c.slotTotal === 0 && c.validityOk === true,
    'verdict=' + c.verdict + ' pool=' + c.poolTotal + ' slot=' + c.slotTotal);
})();
// D2: one dawn-scored dead holder -> COSTLY, b0 = 1.
(function () {
  const j = baseSeed({
    planCensus: [censusRow(10, 'v1', null, 'party', true), censusRow(11, 'v1', null, 'party', false)],
    deadTouches: [],
    dawnScored: [{ day: 11, part: 0, vid: 'v1', holderAlive: false, planStage: 'party', planTarget: null, hasWinPlanCand: true }],
    daily: [dailyRoster(150, [['v1', true]])],
  });
  const c = ANALYZE.classify([j]);
  const one = ANALYZE.analyzeOne(j);
  check('D2 dawn-scored dead holder -> COSTLY, b0_dawnScoredDeadN 1, enumerated',
    c.verdict === 'COSTLY' && one.pool.b0_dawnScoredDeadN === 1 &&
    one.pool.b0_dawnScoredDead[0].vid === 'v1' && one.pool.b0_dawnScoredDead[0].day === 11,
    'verdict=' + c.verdict + ' b0=' + one.pool.b0_dawnScoredDeadN);
})();
// D3: dead holder reaches winPlanDepart + winPlanOf creates a plan
// for a dead vid -> COSTLY, both enumerated.
(function () {
  const j = baseSeed({
    planCensus: [censusRow(10, 'v1', null, 'party', true), censusRow(11, 'v1', null, 'party', false)],
    deadTouches: [
      touchRow(11, 'winPlanDepart', 'v1', false, { result: 'normal' }),
      touchRow(11, 'winPlanOf', 'v9', false, { created: true }),
    ],
    v4creates: [{ day: 11, vid: 'v9', holderAlive: false, creator: 'winPlanOf', source: null, profile: 'wanderer', stageAfter: 'gear', target: null, needWave: null, foughtN: null, slainN: null, caller: 'x' }],
    daily: [dailyRoster(150, [['v1', true], ['v9', true]])],
  });
  const c = ANALYZE.classify([j]);
  const one = ANALYZE.analyzeOne(j);
  check('D3 dead depart touch + winPlanOf creation for the dead -> COSTLY',
    c.verdict === 'COSTLY' && one.pool.b4_touchesDeadTotal === 2 &&
    one.pool.b6_winPlanOfDeadN === 1 && one.pool.winPlanOfCreatedDeadN === 1 &&
    one.pool.createsDeadN === 1 && one.slot.winPlanOfCreatedDead.length === 1,
    'verdict=' + c.verdict + ' touchesDead=' + one.pool.b4_touchesDeadTotal);
  check('D3 touch counts by method: winPlanDepart 1 dead of 1, winPlanOf 1 dead of 1',
    one.pool.b4_touchesDeadByMethod['winPlanDepart'].length === 1 &&
    one.pool.b4_touchesDeadByMethod['winPlanOf'].length === 1 &&
    one.pool.touchesByMethod['winPlanDepart'] === 1,
    JSON.stringify(one.pool.touchesByMethod));
})();
// D4: slot — living holder's plan party holds a dead vid; the holder
// launches after the dead ref appears (non-blocking); a second
// launch carries a dead party member (blocking instance).
(function () {
  const j = baseSeed({
    planCensus: [
      censusRow(20, 'v1', 'strike', 'hunt', true, ['v2']),
      censusRow(21, 'v1', 'strike', 'hunt', true, ['v2']),
      censusRow(22, 'v1', 'strike', 'hunt', true, ['v2']),
      censusRow(20, 'v3', 'audit', 'hunt', true, ['v2']),
      censusRow(21, 'v3', 'audit', 'hunt', true, ['v2']),
    ],
    v4departs: [
      { day: 22, vid: 'v1', source: 'winPlanDepart', result: 'launch', stage: 'hunt', target: 'strike',
        party: ['v4'], partySize: 2, partyKillers: 0, partyArmed: 1, holderAlive: true,
        partyAlive: [{ id: 'v4', alive: true }], targetWave: 4 },
      { day: 21, vid: 'v3', source: 'brain', result: 'launch', stage: 'hunt', target: 'audit',
        party: ['v2'], partySize: 2, partyKillers: 0, partyArmed: 1, holderAlive: true,
        partyAlive: [{ id: 'v2', alive: false }], targetWave: 4 },
    ],
    deadTouches: [],
    daily: [dailyRoster(20, [['v2', false]]), dailyRoster(21, [['v2', true]])],
  });
  const one = ANALYZE.analyzeOne(j);
  check('D4 slot: 2 holders carry the dead ref (v1 2 holder-days, v3 1); v1 launched after (non-blocking), v3 launched the same day (not after)',
    one.slot.holders.length === 2 &&
    one.slot.holderDays === 3 &&
    one.slot.holders.find(function (h) { return h.vid === 'v1'; }).launchedAfter === true &&
    one.slot.holders.find(function (h) { return h.vid === 'v3'; }).launchedAfter === false,
    'holders=' + JSON.stringify(one.slot.holders) + ' days=' + one.slot.holderDays);
  check('D4 slot: 1 launch carries a dead party member (v3 day 21) -> COSTLY',
    one.slot.launchesWithDeadParty.length === 1 &&
    one.slot.launchesWithDeadParty[0].vid === 'v3' &&
    ANALYZE.classify([j]).verdict === 'COSTLY',
    'launches=' + JSON.stringify(one.slot.launchesWithDeadParty));
})();
// D5: census noise math — 3 live + 2 dead on day 10, 3 live + 0 dead
// on day 11: mean inflation 1.25, max 1.667, final day 3/3.
(function () {
  const j = baseSeed({
    planCensus: [
      censusRow(10, 'a', null, 'gear', true), censusRow(10, 'b', null, 'gear', true),
      censusRow(10, 'c', null, 'gear', true), censusRow(10, 'd', null, 'gear', false),
      censusRow(10, 'e', null, 'gear', false),
      censusRow(11, 'a', null, 'gear', true), censusRow(11, 'b', null, 'gear', true),
      censusRow(11, 'c', null, 'gear', true),
    ],
    deadTouches: [], daily: [dailyRoster(150, [['d', true], ['e', true]])],
  });
  const one = ANALYZE.analyzeOne(j);
  check('D5 census noise: mean inflation 1.333, max 1.667, final day 3 incl / 3 excl',
    one.censusNoise.meanInflation === 1.333 && one.censusNoise.maxInflation === 1.667 &&
    one.censusNoise.finalDayIncl === 3 && one.censusNoise.finalDayExcl === 3,
    'mean=' + one.censusNoise.meanInflation + ' max=' + one.censusNoise.maxInflation);
})();
// D6: validity — a touch row with holderAlive null fails bar 1; an
// unknown creator fails bar 1.
(function () {
  const badTouch = baseSeed({
    deadTouches: [touchRow(11, 'winPlanDepart', 'v1', null, { result: 'hold' })],
    planCensus: [censusRow(11, 'v1', null, 'party', true)],
  });
  const c1 = ANALYZE.classify([badTouch]);
  check('D6 validity: holderAlive null on a touch row fails validityOk',
    c1.validityOk === false, 'validityOk=' + c1.validityOk);
  const badCreate = baseSeed({
    v4creates: [{ day: 10, vid: 'v1', holderAlive: true, creator: 'unknown-fled-no-caller', source: null, profile: 'wanderer', stageAfter: 'gear', target: null, needWave: null, foughtN: null, slainN: null, caller: 'x' }],
    planCensus: [censusRow(10, 'v1', null, 'party', true)],
  });
  const c2 = ANALYZE.classify([badCreate]);
  check('D6 validity: unknown creator fails validityOk',
    c2.validityOk === false, 'validityOk=' + c2.validityOk);
})();
// D7: wall numbers shape over a two-seed leg.
(function () {
  function oneSeed(seed, standing, rank, won, maxWave, days) {
    return baseSeed({ seed: seed, standing: standing, scaleRank: rank, won: won, maxWave: maxWave,
      gameDays: days,
      daily: [{ day: days, waveKillLog: [{ d: 50, mid: 'strike', w: 4, by: 'v1', via: 'wild', trick: null, pyrrhic: false }], roster: [] }] });
  }
  const leg = ANALYZE.summarizeLeg([oneSeed(103221, 250, 'regional', false, 5, 150), oneSeed(103222, 120, 'national', false, 4, 90)]);
  check('D7 wall: national by standing 1, by rank 1, wave4 2, wave5 1, median survival 120, wave-4 kills 2',
    leg.wall.nationalByStanding === 1 && leg.wall.nationalByScaleRank === 1 &&
    leg.wall.wave4Reached === 2 && leg.wall.wave5Reached === 1 &&
    leg.wall.medianSurvival === 120 && leg.wall.wave4Kills === 2,
    'wall=' + JSON.stringify(leg.wall));
})();

// ---------- 4. Recorder: live in-memory run (shape + touch recording) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'));
  const out = await driver.oneRun(103221);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries companionPool array', Array.isArray(out.companionPool));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run carries creation-ledger arrays (v4creates, planCensus)', Array.isArray(out.v4creates) && Array.isArray(out.planCensus));
  check('live run carries dead-touch arrays (deadTouches, dawnScored)', Array.isArray(out.deadTouches) && Array.isArray(out.dawnScored));
  check('live run policy sha is competent verbatim (df9b7dff4de4)', out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  const badSeed = (out.v4seeds || []).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && r.mid && typeof r.wave === 'number' &&
      typeof r.path === 'string' && (DRIVER.SEED_PATHS.indexOf(r.path) !== -1 || r.path.indexOf('unknown-') === 0) &&
      typeof r.planExistedBefore === 'boolean' && typeof r.holderAlive === 'boolean');
  });
  check('every recorded v4seeds row carries a named path + planExistedBefore + boolean holderAlive', !badSeed, badSeed ? JSON.stringify(badSeed).slice(0, 300) : '');
  const badCreate = (out.v4creates || []).find(function (r) {
    if (!r || typeof r.day !== 'number' || !r.vid || !DRIVER.isNamedCreator(r.creator)) return true;
    if (r.creator === 'havenTick' && (!r.source || r.source.indexOf('unknown-') === 0)) return true;
    if (typeof r.holderAlive !== 'boolean') return true;
    return false;
  });
  check('every recorded v4creates row carries a named creator (+ named source for havenTick) + boolean holderAlive', !badCreate, badCreate ? JSON.stringify(badCreate).slice(0, 300) : '');
  const badTouch = (out.deadTouches || []).find(function (r) {
    return !r || DRIVER.DEADPLAN_TOUCH_METHODS.indexOf(r.method) === -1 || typeof r.holderAlive !== 'boolean';
  });
  check('every recorded deadTouches row carries a named method + boolean holderAlive', !badTouch, badTouch ? JSON.stringify(badTouch).slice(0, 300) : '');
  const badScored = (out.dawnScored || []).find(function (r) {
    return !r || !r.vid || typeof r.holderAlive !== 'boolean';
  });
  check('every recorded dawnScored row carries a vid + boolean holderAlive', !badScored, badScored ? JSON.stringify(badScored).slice(0, 300) : '');
  const namedPaths = {};
  for (const r of (out.v4seeds || [])) namedPaths[r.path] = (namedPaths[r.path] || 0) + 1;
  const namedCreates = {};
  for (const r of (out.v4creates || [])) namedCreates[r.creator] = (namedCreates[r.creator] || 0) + 1;
  const touchMethods = {};
  for (const r of (out.deadTouches || [])) touchMethods[r.method] = (touchMethods[r.method] || 0) + 1;
  console.log('  info: live 5d run recorded ' + (out.v4seeds || []).length + ' seed rows by path ' + JSON.stringify(namedPaths) +
    ', ' + (out.v4creates || []).length + ' creates by creator ' + JSON.stringify(namedCreates) +
    ', ' + (out.planCensus || []).length + ' planCensus rows, ' + (out.companionPool || []).length + ' pool rows' +
    ', ' + (out.deadTouches || []).length + ' touches by method ' + JSON.stringify(touchMethods) +
    ', ' + (out.dawnScored || []).length + ' dawn-scored rows');
  return out;
}

// ---------- 5. Determinism legs D1 + D2 (60d, seed 103221) + 150d coverage ----------
console.log('== determinism legs D1/D2 + coverage ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  const script = "const d=require('./scripts/deadplan-driver-20261117.js');" +
    "d.oneRun(103221).then(function(o){" +
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
  const badTouch = (full.deadTouches || []).find(function (r) {
    return DRIVER.DEADPLAN_TOUCH_METHODS.indexOf(r.method) === -1 || typeof r.holderAlive !== 'boolean';
  });
  const badScored = (full.dawnScored || []).find(function (r) { return !r.vid || typeof r.holderAlive !== 'boolean'; });
  return { badSeed: badSeed, badCreate: badCreate, badTouch: badTouch, badScored: badScored,
    seedCount: (full.v4seeds || []).length, createCount: (full.v4creates || []).length,
    touchCount: (full.deadTouches || []).length, scoredCount: (full.dawnScored || []).length };
}
async function determinism() {
  const a = childRun(60, {});
  const b = childRun(60, {});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { DEADPLAN_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4/ledger/touch arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4creates || []).length === 0 && (off.full.planCensus || []).length === 0 &&
    (off.full.deadTouches || []).length === 0 && (off.full.dawnScored || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  const p60 = rowsNamed(a.full);
  check('D1 60d run: every recorded seed row carries a NAMED path (no unknown-*)',
    !p60.badSeed, p60.badSeed ? JSON.stringify(p60.badSeed).slice(0, 300) : '0 rows recorded (vacuous — see 150d check)');
  check('D1 60d run: every recorded creates row carries a NAMED creator (+ named havenTick source)',
    !p60.badCreate, p60.badCreate ? JSON.stringify(p60.badCreate).slice(0, 300) : '0 rows recorded (vacuous — see 150d check)');
  check('D1 60d run: every recorded touch row carries a NAMED method + boolean holderAlive',
    !p60.badTouch, p60.badTouch ? JSON.stringify(p60.badTouch).slice(0, 300) : '0 rows recorded (vacuous — see 150d check)');
  check('D1 60d run: every recorded dawnScored row carries a vid + boolean holderAlive',
    !p60.badScored, p60.badScored ? JSON.stringify(p60.badScored).slice(0, 300) : '0 rows recorded (vacuous — see 150d check)');
  console.log('  info: D1 60d run recorded ' + p60.seedCount + ' seed rows, ' + p60.createCount + ' creates, ' +
    (a.full.companionPool || []).length + ' pool rows, ' + (a.full.dawnbidScores || []).length + ' score rows, ' +
    p60.touchCount + ' touches, ' + p60.scoredCount + ' dawn-scored rows');
  // 150d live run: the coverage check — every recorded row must carry
  // a named path / creator / source / method. No seed call exists in
  // this arm, so no >=1-seed-row assertion applies (agency rows may
  // or may not exist on this seed).
  const long = childRun(150, {});
  const p150 = rowsNamed(long.full);
  const byPath = {};
  for (const r of (long.full.v4seeds || [])) byPath[r.path] = (byPath[r.path] || 0) + 1;
  const byCreator = {};
  for (const r of (long.full.v4creates || [])) byCreator[r.creator] = (byCreator[r.creator] || 0) + 1;
  const byMethod = {};
  for (const r of (long.full.deadTouches || [])) byMethod[r.method] = (byMethod[r.method] || 0) + 1;
  check('150d live run: every recorded seed row carries a NAMED path',
    !p150.badSeed, p150.badSeed ? JSON.stringify(p150.badSeed).slice(0, 300) : '');
  check('150d live run: every recorded creates row carries a NAMED creator (+ named havenTick source)',
    !p150.badCreate, p150.badCreate ? JSON.stringify(p150.badCreate).slice(0, 300) : '');
  check('150d live run: every recorded touch row carries a NAMED method + boolean holderAlive',
    !p150.badTouch, p150.badTouch ? JSON.stringify(p150.badTouch).slice(0, 300) : '');
  check('150d live run: every recorded dawnScored row carries a vid + boolean holderAlive',
    !p150.badScored, p150.badScored ? JSON.stringify(p150.badScored).slice(0, 300) : '');
  console.log('  info: 150d run seed rows by path ' + JSON.stringify(byPath) +
    ', creates by creator ' + JSON.stringify(byCreator) +
    ', touches by method ' + JSON.stringify(byMethod));
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
