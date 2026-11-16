// test-tricklearn-b.js — proof for arm sim-tricklearn-b (DIAG,
// tracker blank #2 — trick learning).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): this arm touches NO src file (instrument-only), the
// driver wraps exist (incl. all four observation wraps + the trick
// census hook + the extended wave-4/5 gate wrap + the fight-context
// marker), the wave-3/4/5 id sets match the data, the taxonomy's
// code anchors still hold (_trickObservation threshold 2, the
// fieldFight evade early-return before the observation call,
// discoverMonsterCounter false for counter-less species,
// noteNodeWitnessKill gated on NODEWITNESS=1, the gate trick-hold),
// the classifier places one fixture per source (incl. a taught
// call for a wave-4 species that classifies taught with learned
// false, a learn with no observation trail classifying other and
// failing, an event missing a required field unclassified with the
// field named), observations-to-learn counts (obs 2 = learn, 1 obs
// = unlearned, villager + scholar sum on the shared bar),
// trick-hold fixtures (incl. the standing disjunct and the
// no-plan null), wait-window fixtures (D+7 learned, D+8 expired,
// second episode after close, hold inside an open window opens
// nothing, no D+7 census row = village-lost), TrickAfter fixtures
// (teaches / does-not-teach / fight-context join / no-context
// no-join), the recorder rows have their shape on live runs, and
// the determinism legs D1 (repeatability) + D2 (wrap neutrality)
// are green at 60d on seed 102141 under competent verbatim.
// Writes evidence/2026-11-16/tricklearn-b-proof.json and
// evidence/2026-11-16/tricklearn-b-determinism.json (read by the
// analyzer's bars 3-4).
// Usage:
//   node scripts/test-tricklearn-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-tricklearn-b.js'));

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
  return /scripts\/(tricklearn-driver-20261116|analyze-tricklearn-b|test-tricklearn-b|build-tricklearn-panels-20261116)\.js$/.test(s);
});
check('scripts worktree diff is tricklearn-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'tricklearn-driver-20261116.js'), 'utf8');
for (const w of ['noteVillagerTrickObservation', 'noteScholarTrickObservation', 'noteNodeWitnessKill',
  'discoverMonsterCounter', 'trickObservations', 'trickCensus', 'currentFight', 'callerFrame',
  'obsState', 'planNeedWave', 'loadWave3Ids']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has TRICKLEARN_RECORDER off-switch', driverSrc.indexOf('TRICKLEARN_RECORDER') !== -1);
check('driver LEG is competent-only (STOP otherwise)', driverSrc.indexOf("LEG !== 'competent'") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver gate wrap records wave 4 AND wave 5', driverSrc.indexOf('(w === 4 || w === 5)') !== -1);
check('driver records discoverMonsterCounter calls for wave-3/4/5 even when false',
  driverSrc.indexOf('w < 3 || w > 5') !== -1 && driverSrc.indexOf('discoverMonsterCounter') !== -1);
check('driver sets the fight-context marker around fieldFight',
  driverSrc.indexOf('currentFight = { day: gday(Game), vid: vid, mid: mdef.id }') !== -1 &&
  driverSrc.indexOf('finally { currentFight = null; }') !== -1);
// Wave-3/4/5 id sets match the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
function liveIds(w) { return (rawMon.monsters || rawMon).filter(function (m) { return m.wave === w; }).map(function (m) { return m.id; }).sort(); }
check('wave-3 id set matches monsters.json (9 ids)',
  JSON.stringify(liveIds(3)) === JSON.stringify(['ad_break', 'buffering', 'callback', 'chorus_line', 'focus_group', 'gavel', 'redactor', 'spool', 'terms_of_service'].sort()),
  JSON.stringify(liveIds(3)));
check('wave-4 id set matches monsters.json (10 ids)',
  JSON.stringify(liveIds(4)) === JSON.stringify(['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'].sort()),
  JSON.stringify(liveIds(4)));
check('wave-5 id set matches monsters.json (10 ids)',
  JSON.stringify(liveIds(5)) === JSON.stringify(['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'].sort()),
  JSON.stringify(liveIds(5)));
// Taxonomy anchors: the code the classification is built on must still hold.
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
check('anchor: _trickObservation threshold 2 (obs[mid] < 2, shared villageCounterObs bar)',
  gameJs.indexOf('_trickObservation(vid, mid, firstPerson)') !== -1 &&
  gameJs.indexOf('obs[mid] < 2') !== -1 && gameJs.indexOf('villageCounterObs') !== -1);
check('anchor: waves 3-5 learn via villagerTricks (no counter field)',
  gameJs.indexOf('state.villagerTricks') !== -1 && gameJs.indexOf('vt[mid] = true') !== -1);
check('anchor: discoverMonsterCounter false for counter-less species',
  gameJs.indexOf('if (!mdef || !mdef.counter) return false;') !== -1);
check('anchor: noteNodeWitnessKill exists and is the only other villagerTricks writer',
  gameJs.indexOf('noteNodeWitnessKill(vid, mid, witnesses)') !== -1);
const ffJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('anchor: fieldFight evade early-returns BEFORE the observation call at :2747',
  ffJs.indexOf("rec.outcome = 'evade'") !== -1 &&
  ffJs.indexOf('noteVillagerTrickObservation') !== -1 &&
  ffJs.indexOf("rec.outcome = 'evade'") < ffJs.indexOf('noteVillagerTrickObservation'));
check('anchor: observation call conditioned on vFlee/mFlee/evade outcomes',
  ffJs.indexOf("rec.outcome === 'vFlee'") !== -1 && ffJs.indexOf("rec.outcome === 'mFlee'") !== -1);
check('anchor: noteNodeWitnessKill gated on NODEWITNESS=1 in the environment',
  ffJs.indexOf('NODEWITNESS') !== -1);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('anchor: gate trick-hold bumps trickHolds and returns null when the trick is unknown',
  winPlanJs.indexOf('trickHolds') !== -1 && winPlanJs.indexOf('villageKnowsTrick') !== -1 &&
  winPlanJs.indexOf("bump(this, 'trickHolds')") !== -1);
check('anchor: no 7-day wait mechanism on master (trickWaitedFor absent)',
  winPlanJs.indexOf('trickWaitedFor') === -1 && gameJs.indexOf('trickWaitedFor') === -1);
// Policy sha (frozen in the prereg).
function sha12(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', file), 'utf8')).digest('hex').slice(0, 12);
}
check('competent policy sha is 74a890f0844e', sha12('competent.js') === '74a890f0844e', 'got ' + sha12('competent.js'));

// ---------- 2. Source-classification fixtures ----------
console.log('== source classification fixtures ==');
function mkEvent(over) {
  const e = { day: 60, vid: 'v1', mid: 'eulogy', wave: 4, source: 'fight-observed', via: null,
    obsBefore: 0, obsAfter: 1, knownBefore: false, knownAfter: false, ret: false,
    caller: 'fieldFights.js:2749', fight: { day: 60, vid: 'v1', mid: 'eulogy' } };
  return Object.assign(e, over || {});
}
function expectSource(name, ev, source, valid) {
  const c = ANALYZE.classifyObservation(ev);
  check(name + ' -> source ' + source + ', valid ' + valid,
    c.source === source && c.valid === valid,
    'got source=' + c.source + ' valid=' + c.valid + ' missing=' + JSON.stringify(c.missing));
}
expectSource('fight-observed: villager survived fieldFight', mkEvent({}), 'fight-observed', true);
expectSource('scholar-observed: scholar survived tbFight',
  mkEvent({ vid: 'player', source: 'scholar-observed', caller: 'game.js:47577', fight: null }), 'scholar-observed', true);
expectSource('node-witnessed: witnessed kill',
  mkEvent({ source: 'node-witnessed', caller: 'fieldFights.js:2770' }), 'node-witnessed', true);
expectSource('taught: discoverMonsterCounter via taught for a wave-4 species, learned=false',
  mkEvent({ vid: null, source: 'taught', via: 'taught', obsBefore: 0, obsAfter: 0, knownAfter: false, ret: false, caller: 'game.js:5046', fight: null }),
  'taught', true);
(function () {
  const c = ANALYZE.classifyObservation(mkEvent({ vid: null, source: 'taught', via: 'taught', knownAfter: false, ret: false }));
  check('taught call for wave-4: the call happened, the trick did not move (knownAfter false, ret false)',
    c.source === 'taught' && c.valid === true, JSON.stringify(c));
})();
expectSource('other: discover call with a non-taught via classifies other',
  mkEvent({ vid: null, source: 'discover:trick', via: 'trick', fight: null }), 'other', false);
(function () {
  const ev = mkEvent({});
  delete ev.caller;
  const c = ANALYZE.classifyObservation(ev);
  check('event missing a required field is unclassified with the field named',
    c.valid === false && c.missing.indexOf('caller') !== -1, 'got missing=' + JSON.stringify(c.missing));
  const ev2 = mkEvent({ source: 'fight-observed' });
  delete ev2.vid;
  const c2 = ANALYZE.classifyObservation(ev2);
  check('observation event missing vid is unclassified (vid named)',
    c2.valid === false && c2.missing.indexOf('vid') !== -1, 'got missing=' + JSON.stringify(c2.missing));
})();
// A learn with no observation trail classifies other and fails.
(function () {
  const j = { seed: 102141, trickCensus: [{ day: 50, obs: {}, tricks: ['eulogy'], monsterCounters: [] }],
    trickObservations: [], wave3Ids: ANALYZE.W3, wave4Ids: ANALYZE.W4, wave5Ids: ANALYZE.W5 };
  const learns = ANALYZE.findLearns(j);
  check('learn with no observation trail: trailOk false (obsToLearn 0)',
    learns.length === 1 && learns[0].trailOk === false && learns[0].obsToLearn === 0,
    JSON.stringify(learns));
})();

// ---------- 3. Observations-to-learn fixtures ----------
console.log('== observations-to-learn fixtures ==');
(function () {
  const events = [
    mkEvent({ day: 10, vid: 'v1', obsBefore: 0, obsAfter: 1 }),
    mkEvent({ day: 20, vid: 'v2', obsBefore: 1, obsAfter: 2, knownAfter: true, ret: true }),
  ];
  check('species learned at obs 2 counts 2',
    ANALYZE.observationsToLearn(events, 'eulogy', 20) === 2,
    'got ' + ANALYZE.observationsToLearn(events, 'eulogy', 20));
  const one = [mkEvent({ day: 10, vid: 'v1', obsBefore: 0, obsAfter: 1 })];
  check('species with 1 obs at run end counts 1 unlearned',
    ANALYZE.observationsToLearn(one, 'eulogy', 150) === 1, 'got ' + ANALYZE.observationsToLearn(one, 'eulogy', 150));
  // Villager + scholar observations sum on the shared bar to a learn.
  const mixed = [
    mkEvent({ day: 10, vid: 'v1', source: 'fight-observed', obsBefore: 0, obsAfter: 1 }),
    mkEvent({ day: 12, vid: 'player', source: 'scholar-observed', obsBefore: 1, obsAfter: 2, knownAfter: true, ret: true, fight: null, caller: 'game.js:47577' }),
  ];
  check('villager + scholar observations sum on the shared bar (2 = learn)',
    ANALYZE.observationsToLearn(mixed, 'eulogy', 12) === 2, 'got ' + ANALYZE.observationsToLearn(mixed, 'eulogy', 12));
  const j = { seed: 102141,
    trickCensus: [{ day: 12, obs: { eulogy: 2 }, tricks: ['eulogy'], monsterCounters: [] }],
    trickObservations: mixed, wave3Ids: ANALYZE.W3, wave4Ids: ANALYZE.W4, wave5Ids: ANALYZE.W5 };
  const learns = ANALYZE.findLearns(j);
  check('mixed-source learn has a matching trail (trailOk true, learnDay 12)',
    learns.length === 1 && learns[0].trailOk === true && learns[0].learnDay === 12 && learns[0].obsToLearn === 2,
    JSON.stringify(learns));
  // A non-progressing call (already known, obs flat) does not count.
  const flat = [
    mkEvent({ day: 10, vid: 'v1', obsBefore: 0, obsAfter: 1 }),
    mkEvent({ day: 11, vid: 'v2', obsBefore: 1, obsAfter: 1, ret: false }),
  ];
  check('non-progressing call (obs flat) does not count toward the bar',
    ANALYZE.observationsToLearn(flat, 'eulogy', 11) === 1, 'got ' + ANALYZE.observationsToLearn(flat, 'eulogy', 11));
})();

// ---------- 4. Trick-hold fixtures ----------
console.log('== trick-hold fixtures ==');
function mkGate(over) {
  const g = { day: 60, vid: 'v1', mid: 'eulogy', wave: 4, result: 'null', reason: null,
    partySize: 3, allArmed: true, allArmored: true, trickKnown: false,
    planStage: 'hunt', planTarget: 'eulogy', needWave: 4, planNeedWave: 4 };
  return Object.assign(g, over || {});
}
function expectHold(name, gate, want) {
  check(name + ' -> trick-hold ' + want, ANALYZE.isTrickHold(gate) === want,
    'got ' + ANALYZE.isTrickHold(gate));
}
expectHold('wave-4 hunt, target match, partyOk, trick unknown', mkGate({}), true);
expectHold('same row with trick known does not hold', mkGate({ trickKnown: true }), false);
expectHold('row with party short does not hold', mkGate({ partySize: 2 }), false);
expectHold('standing-stage row, wave>=3, no target match still holds (standing disjunct)',
  mkGate({ planStage: 'standing', planTarget: null, needWave: null, planNeedWave: null }), true);
expectHold('null row with no plan does not hold', mkGate({ planStage: null, planTarget: null, needWave: null, planNeedWave: null }), false);
expectHold('seek result is not a hold', mkGate({ result: 'seek' }), false);
expectHold('wave-5 row holds under the same rule', mkGate({ mid: 'finale', wave: 5, planTarget: 'finale', needWave: 5, planNeedWave: 5 }), true);
expectHold('party unarmored does not hold', mkGate({ allArmored: false }), false);

// ---------- 5. Wait-window fixtures ----------
console.log('== wait-window fixtures ==');
function mkSeedTrick(over) {
  const j = { seed: 102141, days: 150, gameDays: 150, endReason: 'survived', won: false,
    scaleRank: 'regional', standing: 120, maxWave: 4, instrumentErrors: [], deaths: [],
    v4seeds: [], v4encounters: [], v4gates: [], v4departs: [],
    dawnbidScores: [], dawnbidDeparts: [], dawnbidCensus: [], dawnbidStarts: [],
    seedattachBounces: [], seedattachCreations: [], seedattachLaunches: [], seedattachCensus: [],
    rumorplanLaunches: [], rumorplanTargetDiffs: [], killfailFights: [],
    trickObservations: [], trickCensus: [],
    wave3Ids: ANALYZE.W3, wave4Ids: ANALYZE.W4, wave5Ids: ANALYZE.W5, daily: [] };
  return Object.assign(j, over || {});
}
function censusDay(day, tricks) { return { day: day, obs: {}, tricks: tricks || [], monsterCounters: [] }; }
(function () {
  // Learn on D+7 counts learned.
  const j = mkSeedTrick({
    v4gates: [mkGate({ day: 10 })],
    trickCensus: [censusDay(10, []), censusDay(17, ['eulogy'])],
  });
  const eps = ANALYZE.buildEpisodes(j);
  check('wait window: learn on D+7 counts learned',
    eps.length === 1 && eps[0].outcome === 'learned', JSON.stringify(eps.map(function (e) { return e.outcome; })));
  // Learn on D+8 counts expired.
  const j2 = mkSeedTrick({
    v4gates: [mkGate({ day: 10 })],
    trickCensus: [censusDay(10, []), censusDay(17, []), censusDay(18, ['eulogy'])],
  });
  const eps2 = ANALYZE.buildEpisodes(j2);
  check('wait window: learn on D+8 counts expired',
    eps2.length === 1 && eps2[0].outcome === 'expired', JSON.stringify(eps2.map(function (e) { return e.outcome; })));
  // A second hold after close opens a second episode.
  const j3 = mkSeedTrick({
    v4gates: [mkGate({ day: 10 }), mkGate({ day: 30 })],
    trickCensus: [censusDay(10, []), censusDay(17, []), censusDay(30, []), censusDay(37, [])],
  });
  const eps3 = ANALYZE.buildEpisodes(j3);
  check('wait window: second hold after close opens a second episode',
    eps3.length === 2 && eps3[0].day === 10 && eps3[1].day === 30,
    'got ' + eps3.length + ' episodes');
  // A hold inside an open window does not open a second episode.
  const j4 = mkSeedTrick({
    v4gates: [mkGate({ day: 10 }), mkGate({ day: 12 })],
    trickCensus: [censusDay(10, []), censusDay(17, [])],
  });
  const eps4 = ANALYZE.buildEpisodes(j4);
  check('wait window: hold inside an open window opens no second episode',
    eps4.length === 1, 'got ' + eps4.length);
  // No D+7 census row (village lost before D+7) -> village-lost.
  const j5 = mkSeedTrick({
    v4gates: [mkGate({ day: 10 })],
    trickCensus: [censusDay(10, []), censusDay(12, [])],
    endReason: 'village-lost',
  });
  const eps5 = ANALYZE.buildEpisodes(j5);
  check('wait window: no census row on/after D+7 classifies village-lost, not expired',
    eps5.length === 1 && eps5[0].outcome === 'village-lost', JSON.stringify(eps5.map(function (e) { return e.outcome; })));
  // Within-window counts attached.
  const j6 = mkSeedTrick({
    v4gates: [mkGate({ day: 10 }), mkGate({ day: 11 })],
    trickCensus: [censusDay(10, []), censusDay(17, [])],
    trickObservations: [mkEvent({ day: 12, mid: 'eulogy' }), mkEvent({ day: 30, mid: 'eulogy' })],
    killfailFights: [{ day: 13, vid: 'v1', mid: 'eulogy', wave: 4 }],
    rumorplanLaunches: [{ day: 11, vid: 'v1', targetAfter: 'eulogy' }],
  });
  const eps6 = ANALYZE.buildEpisodes(j6);
  check('wait window: within-window counts attached (obs 1, fights 1, launches 1, gates 2)',
    eps6.length === 1 && eps6[0].observations === 1 && eps6[0].fights === 1 &&
    eps6[0].launches === 1 && eps6[0].gateRows === 2,
    JSON.stringify(eps6[0]));
})();

// ---------- 6. TrickAfter fixtures ----------
console.log('== TrickAfter fixtures ==');
(function () {
  const fight = { day: 60, vid: 'v1', mid: 'eulogy', wave: 4, alliesN: 2, allyVids: ['v2', 'v3'],
    allyFromStart: true, gate: null, trickBefore: false, trickAfter: true,
    fighter: { vid: 'v1', name: 'F', class: 'armed-with-ammo', gateArmed: true, effectivelyArmed: true,
      rangedWeapon: 'bow', ammoNeed: 'arrow', ammoN: 5, otherAmmoN: 0, meleeWeapon: 'spear',
      spearInRangedSlot: false, carriesRangedUnequipped: null, error: null, armorP: 12, weaponB: 20, hpEntry: 100 },
    allies: [], calledAlly: null, mHpEntry: 1000, mdefHp: [900, 1100], mHpLeft: 800,
    outcome: 'vFlee', rounds: 4, vTaken: 30, mDealt: 400, allyDealt: 50, vHpLeft: 70,
    calledHelp: false, allyVid: null, fleeHpFrac: 0.7, volley: null, log: [] };
  const teaches = mkSeedTrick({ killfailFights: [fight] });
  const r = ANALYZE.classifySeedTrick(teaches);
  check('TrickAfter: fight with trickBefore false / trickAfter true counts as teaches',
    r.teaches.length === 1, 'got ' + r.teaches.length);
  const noTeach = mkSeedTrick({ killfailFights: [Object.assign({}, fight, { trickBefore: false, trickAfter: false })] });
  const r2 = ANALYZE.classifySeedTrick(noTeach);
  check('TrickAfter: fight with both false does not count as teaches',
    r2.teaches.length === 0, 'got ' + r2.teaches.length);
  // Fight-context join.
  const ev = mkEvent({ day: 60, vid: 'v1', mid: 'eulogy' });
  check('join: observation event with fight context joins its fight',
    ANALYZE.joinObservationToFight(ev, [fight]) === fight, 'got null');
  const evNoCtx = mkEvent({ day: 60, vid: 'player', mid: 'eulogy', source: 'scholar-observed', fight: null });
  check('join: event without fight context does not join a fight',
    ANALYZE.joinObservationToFight(evNoCtx, [fight]) === null, 'got a fight');
})();

// ---------- 7. Recorder: live in-memory runs ----------
console.log('== recorder live ==');
function loadDriverFresh(days) {
  const driverPath = path.join(REPO, 'scripts', 'tricklearn-driver-20261116.js');
  delete require.cache[require.resolve(driverPath)];
  process.env.LEG = 'competent';
  process.env.DAYS = String(days);
  delete process.env.TABLESEATNOWAIT;
  delete process.env.LEANLINKRESCUE;
  delete process.env.TRICKLEARN_RECORDER;
  return require(driverPath);
}
async function liveRuns() {
  const d1 = loadDriverFresh(5);
  const out = await d1.oneRun(102141);
  check('live competent run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run policy is competent, sha 74a890f0844e', out.policy === 'competent' && out.policySha === '74a890f0844e',
    'got ' + out.policy + '/' + out.policySha);
  check('live run carries trickObservations + trickCensus arrays',
    Array.isArray(out.trickObservations) && Array.isArray(out.trickCensus));
  check('live run carries wave3Ids + wave4Ids + wave5Ids (9 + 10 + 10)',
    Array.isArray(out.wave3Ids) && out.wave3Ids.length === 9 &&
    Array.isArray(out.wave4Ids) && out.wave4Ids.length === 10 &&
    Array.isArray(out.wave5Ids) && out.wave5Ids.length === 10,
    'got w3=' + (out.wave3Ids || []).length + ' w4=' + (out.wave4Ids || []).length + ' w5=' + (out.wave5Ids || []).length);
  check('live run carries the inherited recorder arrays (v4gates wave-4/5, killfailFights, rumorplan, seedattach)',
    Array.isArray(out.v4gates) && Array.isArray(out.killfailFights) && Array.isArray(out.rumorplanLaunches) &&
    Array.isArray(out.seedattachCensus));
  // 150d run: the trick rows must actually populate and hold their shape.
  const dLong = loadDriverFresh(150);
  const outLong = await dLong.oneRun(102141);
  check('live 150d run completes with 0 instrument errors', outLong.instrumentErrors.length === 0, JSON.stringify(outLong.instrumentErrors.slice(0, 3)));
  check('live 150d trick census has one row per live day (sparse-tolerant: >= gameDays-3, strictly increasing)',
    outLong.trickCensus.length >= outLong.gameDays - 3 &&
    outLong.trickCensus.every(function (c, i, a) { return i === 0 || c.day > a[i - 1].day; }),
    'got census=' + outLong.trickCensus.length + ' gameDays=' + outLong.gameDays);
  const badCensus = (outLong.trickCensus || []).find(function (c) {
    return !(c && typeof c.day === 'number' && c.obs && typeof c.obs === 'object' &&
      Array.isArray(c.tricks) && Array.isArray(c.monsterCounters));
  });
  check('trick census rows have their full shape (day + obs + tricks + monsterCounters)', !badCensus,
    badCensus ? JSON.stringify(badCensus).slice(0, 200) : '');
  const badObs = (outLong.trickObservations || []).find(function (e) {
    return !(e && typeof e.day === 'number' && e.mid && typeof e.wave === 'number' &&
      typeof e.source === 'string' && typeof e.obsBefore === 'number' && typeof e.obsAfter === 'number' &&
      typeof e.knownBefore === 'boolean' && typeof e.knownAfter === 'boolean' &&
      typeof e.ret === 'boolean' && (e.caller === null || typeof e.caller === 'string'));
  });
  check('trick observation rows have their full shape (day/mid/wave/source/obsBefore/After/knownBefore/After/ret/caller)', !badObs,
    badObs ? JSON.stringify(badObs).slice(0, 300) : '');
  const badGate = (outLong.v4gates || []).find(function (g) {
    return !(g && (g.wave === 4 || g.wave === 5) && typeof g.trickKnown === 'boolean' &&
      ('planNeedWave' in g) && ('needWave' in g));
  });
  check('v4gates rows cover wave 4 AND wave 5 and carry needWave + planNeedWave', !badGate,
    badGate ? JSON.stringify(badGate).slice(0, 200) : '');
  check('live 150d run produced >=1 trick observation (the pipeline is non-vacuous on this seed)',
    outLong.trickObservations.length >= 1, 'got ' + outLong.trickObservations.length);
}

// ---------- 8. Determinism legs D1 + D2 (60d, seed 102141, competent verbatim) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60', LEG: 'competent' }, envExtra || {});
  delete env.TABLESEATNOWAIT;
  delete env.LEANLINKRESCUE;
  const script = "const d=require('./scripts/tricklearn-driver-20261116.js');" +
    "d.oneRun(102141).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childFingerprint({});
  const b = childFingerprint({});
  const d1 = JSON.stringify(a.full) === JSON.stringify(b.full);
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)', d1);
  const off = childFingerprint({ TRICKLEARN_RECORDER: 'off' });
  const d2 = JSON.stringify(a.fp) === JSON.stringify(off.fp);
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)', d2,
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty trick/killfail/rumorplan/seedattach/v4/dawnbid arrays',
    (off.full.trickObservations || []).length === 0 && (off.full.trickCensus || []).length === 0 &&
    (off.full.killfailFights || []).length === 0 && (off.full.rumorplanLaunches || []).length === 0 &&
    (off.full.rumorplanTargetDiffs || []).length === 0 &&
    (off.full.seedattachBounces || []).length === 0 && (off.full.seedattachCensus || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidScores || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  // Stamps the analyzer reads for bars 3-4.
  const evDir = path.join(REPO, 'evidence', '2026-11-16');
  fs.mkdirSync(evDir, { recursive: true });
  fs.writeFileSync(path.join(evDir, 'tricklearn-b-determinism.json'),
    JSON.stringify({ d1: d1, d2: d2, seed: 102141, days: 60, policy: 'competent' }, null, 2) + '\n');
  return { d1: d1, d2: d2 };
}

(async function () {
  let det = { d1: false, d2: false };
  try {
    await liveRuns();
    det = await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  // Proof stamp (read by the analyzer's bar 4) — written even on
  // failure so the analyzer can report it honestly.
  try {
    const evDir = path.join(REPO, 'evidence', '2026-11-16');
    fs.mkdirSync(evDir, { recursive: true });
    fs.writeFileSync(path.join(evDir, 'tricklearn-b-proof.json'),
      JSON.stringify({ pass: pass, fail: fail, failures: failures, d1: det.d1, d2: det.d2 }, null, 2) + '\n');
  } catch (e) { console.log('  WARN: could not write proof stamp: ' + String(e.message).slice(0, 80)); }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
