// test-part2night-a.js — proof for arm sim-part2night-a (DIAG,
// instrument-only). Proves, on synthetic fixtures and live in-memory
// runs (no corpus numbers): no src/ file is touched (in particular
// src/js/win-plan.js is byte-identical to HEAD); the wave-4 id set
// matches the data; the classifier places one fixture per
// classification class (9) with the frozen precedence; orphan skip
// rows are flagged, not classified; the counterfactual evaluates
// would-have-launched / launched-anyway / would-not-launch /
// no-next-dawn / missing-dawn; the recorder rows have their shape
// (incl. holder-state fields and commit part); the agencyTick wrap
// records a REAL night skip row for a committed holder at part 3,
// a REAL away-as-companion row for an away holder, a REAL dawn
// follow-up snapshot at the next part-0 tick, and a REAL
// away-as-companion-this-tick row for a holder who departs as a
// companion during the tick; the vbrainScorePick wrap records a
// part-2 party_launch commit; and the determinism legs D1
// (repeatability) + D2 (wrap neutrality) are green at 60d on seed
// 103411.
// Usage:
//   node scripts/test-part2night-a.js
// Policy is competent verbatim (no env pairing) — set by this file
// itself below so the proof never silently runs the wrong policy.
'use strict';
// The proof's own live run is 5d (DAYS set before the driver loads —
// the module reads DAYS at load). D1/D2 children override DAYS=60
// in their own process env.
process.env.DAYS = '5';
process.env.MODE = 'diag';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-part2night-a.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'part2night-driver-20261117.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

// ---------- 1. Static ----------
console.log('== static ==');
(function () {
  // No src/ diff at all (the arm touches no game code).
  let diff = null;
  try {
    diff = execSync('git diff --name-only HEAD -- src/', { cwd: REPO, encoding: 'utf8', timeout: 300000 }).trim();
  } catch (e) { diff = 'GIT-FAILED:' + (e && e.message ? String(e.message).slice(0, 120) : ''); }
  check('git diff HEAD -- src/ is empty (no game code touched)', diff === '', JSON.stringify(diff));
  // win-plan.js byte-identical to HEAD (the file Loop B works).
  let headBlob = null, workBlob = null;
  try { headBlob = execSync('git rev-parse HEAD:src/js/win-plan.js', { cwd: REPO, encoding: 'utf8', timeout: 120000 }).trim(); } catch (e) {}
  try { workBlob = execSync('git hash-object src/js/win-plan.js', { cwd: REPO, encoding: 'utf8', timeout: 120000 }).trim(); } catch (e) {}
  check('src/js/win-plan.js byte-identical to HEAD', !!headBlob && headBlob === workBlob, 'head=' + headBlob + ' work=' + workBlob);
  const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  check('src/js/win-plan.js carries no PART2NIGHT marker', winPlanJs.indexOf('PART2NIGHT') === -1);
  for (const f of ['scripts/part2night-driver-20261117.js', 'scripts/analyze-part2night-a.js',
    'scripts/build-part2night-panels-20261117.js', 'scripts/test-part2night-a.js']) {
    check('arm file exists: ' + f, fs.existsSync(path.join(REPO, f)));
  }
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'part2night-driver-20261117.js'), 'utf8');
  for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'startExpedition', 'agencyTick', 'installSkipRecorder', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'part2nightSkips', 'part2nightDawns', 'part2nightCensus', 'commitKindOf', 'competent', 'flushDawns', 'away-as-companion-this-tick']) {
    check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
  }
  check('driver has PART2NIGHT_RECORDER off-switch', driverSrc.indexOf('PART2NIGHT_RECORDER') !== -1);
  check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
  check('driver never sets NIGHTCARRY', driverSrc.indexOf('process.env.NIGHTCARRY') === -1);
  const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
  check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
})();

// ---------- 2. Classifier unit fixtures ----------
console.log('== classifier fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 103411, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], dawnbidScores: [], dawnbidDeparts: [],
    dawnbidCensus: [], part2nightSkips: [], part2nightDawns: [], part2nightCensus: [],
    deaths: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
  };
  return Object.assign(j, over || {});
}
function scoreRow(day, part, vid, target, stage, commitAction, commitPart, needWave) {
  const cands = commitAction === 'party_launch'
    ? [{ kind: 'EXPEDITION', w: 5.0, winPlanAction: 'party_launch', companion: 'v2', vbrainSrc: 'win_plan' }]
    : [{ kind: 'HAVEN_CHORE', w: 4.0, winPlanAction: commitAction || null, companion: null, vbrainSrc: null }];
  return { seq: 1, day: day, part: part, vid: vid, cands: cands,
    pick: { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE', winPlanAction: commitAction || null, override: null, corePick: 'HAVEN_CHORE' },
    logCands: cands.map(function (x) { return { kind: x.kind, score: x.w, winPlanAction: x.winPlanAction }; }),
    commit: commitAction ? { kind: commitAction === 'party_launch' ? 'EXPEDITION' : 'HAVEN_CHORE',
      winPlanAction: commitAction, companion: commitAction === 'party_launch' ? 'v2' : null,
      part: (commitPart != null ? commitPart : part), day: day } : null,
    plan: target ? { stage: stage, target: target, needWave: (needWave != null ? needWave : 3), party: ['v2'] } : null,
    holderGear: { armed: true, armored: true } };
}
function departRow(day, vid, result, commitKind, vidExped, compExped, vidBlock, compBlock) {
  return { seq: 1, day: day, vid: vid, source: 'brain', result: result, winPlanAction: 'party_launch',
    commitKind: commitKind, commitPart: commitKind === 'mid-day part-1' ? 1 : (commitKind === 'mid-day part-2' ? 2 : 0),
    companion: 'v2', vidExped: vidExped, companionExped: compExped,
    vidBlock: vidBlock || null, companionBlock: compBlock || null,
    stage: 'party', target: 'spool', party: ['v2'] };
}
function skipRow(day, part, vid, target, stage, reason, commitPart) {
  return { seq: 1, day: day, part: part, vid: vid, target: target, stage: stage, party: ['v2'],
    commitKind: commitPart === 2 ? 'mid-day part-2' : 'dawn', commitPart: commitPart, leg: 'diag', reason: reason,
    executeResult: null, sick: false, health: 100, launchBlock: null, medicDuty: false, companionStates: [],
    raw: { profile: 'forager', node: { nx: 4, ny: 4 }, haven: true, exped: false, away: false,
      night: part === 3, engaged: false, indoor: false, danger: false, dead: false } };
}
function dawnRow(deathDay, vid, over) {
  const j = { seq: 1, deathDay: deathDay, deathPart: 3, dawnDay: deathDay + 1, vid: vid,
    targetAtDeath: 'spool', stageAtDeath: 'party', partyAtDeath: ['v2'],
    planGone: false, stageNow: 'party', targetNow: 'spool', partyNow: ['v2'], partyIntact: true,
    holderAlive: true, holderHaven: true, holderAway: false, holderExped: false,
    holderEngaged: false, holderSick: false, holderHealth: 100, holderLaunchBlock: null,
    holderMedicDuty: false, danger: false, indoor: false,
    companionStates: [{ vid: 'v2', alive: true, haven: true, away: false, exped: false, launchBlock: null }],
    freshCommit: { kind: 'HAVEN_CHORE', winPlanAction: null, companion: null, part: 0 } };
  return Object.assign(j, over || {});
}
function censusRow(day, vid, target, stage) {
  return { day: day, vid: vid, target: target, needWave: 3, stage: stage, party: ['v2'] };
}
function classifyCommits(j) {
  return ANALYZE.classifySeed(j).commits;
}
function expectClass(name, j, cls, sub) {
  const cs = classifyCommits(j);
  const got = cs.length ? cs[0].class + ':' + cs[0].sub : '(no commits)';
  check(name + ' -> ' + cls + ':' + sub, cs.length === 1 && cs[0].class === cls && cs[0].sub === sub,
    'got ' + got + ' over ' + cs.length + ' commits');
}
// One fixture per classification class.
expectClass('executed-launched', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  dawnbidDeparts: [departRow(11, 'v1', 'launch', 'mid-day part-2', true, true)],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'hunt')],
}), 'executed-launched', 'companion-started');
expectClass('executed-launched companion-not-started', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  dawnbidDeparts: [departRow(11, 'v1', 'launch', 'mid-day part-2', true, false)],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'hunt')],
}), 'executed-launched', 'companion-not-started');
expectClass('executed-held', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  dawnbidDeparts: [departRow(11, 'v1', 'hold', 'mid-day part-2', false, null, 'sick', null)],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
}), 'executed-held', 'sick');
expectClass('died-at-night-veto', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2)],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
}), 'died-at-night-veto', 'night');
expectClass('died-at-night-other away', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'away-on-expedition', 2)],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
}), 'died-at-night-other', 'away-on-expedition');
expectClass('died-at-night-other same-tick companion', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'away-as-companion-this-tick', 2)],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
}), 'died-at-night-other', 'away-as-companion-this-tick');
expectClass('overwritten-before-night', baseSeed({
  dawnbidScores: [
    scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch'),
    scoreRow(11, 3, 'v1', 'spool', 'party', 'gear_hold', 3),
  ],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
}), 'overwritten-before-night', 'gear_hold');
expectClass('plan-churned-before-night', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  part2nightCensus: [censusRow(11, 'v9', 'spool', 'party')],
}), 'plan-churned-before-night', 'plan-deleted');
expectClass('holder-died-before-night', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  deaths: [{ day: 11, kind: 'villager', who: 'v1', cause: 'combat', player: false }],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
}), 'holder-died-before-night', 'combat');
(function () {
  const j = baseSeed({
    dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
    gameDays: 11,
  });
  expectClass('run-ended', j, 'run-ended', 'gameDays=11');
})();
expectClass('UNCLASSIFIED (plan live, no row explains it)', baseSeed({
  dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
  part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
}), 'UNCLASSIFIED', 'no-skip-no-depart-no-overwrite-plan-live');
// Precedence: depart beats skip.
(function () {
  const j = baseSeed({
    dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
    dawnbidDeparts: [departRow(11, 'v1', 'launch', 'mid-day part-2', true, true)],
    part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2)],
    part2nightCensus: [censusRow(11, 'v1', 'spool', 'hunt')],
  });
  const cs = classifyCommits(j);
  check('precedence depart-beats-skip -> executed-launched', cs.length === 1 && cs[0].class === 'executed-launched',
    'got ' + (cs[0] || {}).class);
})();
// Precedence: skip beats overwrite (a part-3 re-score after the night tick does not rewrite the death).
(function () {
  const j = baseSeed({
    dawnbidScores: [
      scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch'),
      scoreRow(11, 3, 'v1', 'spool', 'party', 'gear_hold', 3),
    ],
    part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2)],
    part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
  });
  const cs = classifyCommits(j);
  check('precedence skip-beats-overwrite -> died-at-night-veto', cs.length === 1 && cs[0].class === 'died-at-night-veto',
    'got ' + (cs[0] || {}).class);
})();
// Superseded bid: last part-2 commit is another action -> 0 commits, 1 superseded.
(function () {
  const j = baseSeed({
    dawnbidScores: [
      scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch'),
      scoreRow(11, 2, 'v1', 'spool', 'party', 'gear_hold', 2),
    ],
    part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
  });
  const cs = ANALYZE.classifySeed(j);
  check('superseded bid -> 0 commits, 1 superseded', cs.commits.length === 0 && cs.supersededCount === 1,
    'got ' + cs.commits.length + ' commits, ' + cs.supersededCount + ' superseded');
})();
// Orphan skip row: night skip with no score-row commit -> orphanCount 1.
(function () {
  const j = baseSeed({
    part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2)],
    part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
  });
  const cs = ANALYZE.classifySeed(j);
  check('orphan skip row flagged (orphanCount 1, 0 commits)', cs.orphanCount === 1 && cs.commits.length === 0,
    'got orphans=' + cs.orphanCount + ' commits=' + cs.commits.length);
})();
// Wave-4+ subset: a wave-4 target counts, a wave-3 target does not.
(function () {
  const j = baseSeed({
    dawnbidScores: [
      scoreRow(11, 2, 'v1', 'eulogy', 'party', 'party_launch', 2, 4),
      scoreRow(12, 2, 'v2', 'spool', 'party', 'party_launch', 2, 3),
    ],
    part2nightSkips: [
      skipRow(11, 3, 'v1', 'eulogy', 'party', 'night', 2),
      skipRow(12, 3, 'v2', 'spool', 'party', 'night', 2),
    ],
    part2nightCensus: [censusRow(11, 'v1', 'eulogy', 'party'), censusRow(12, 'v2', 'spool', 'party')],
  });
  const cs = ANALYZE.classifySeed(j);
  check('wave-4+ subset is 1 of 2 commits', cs.wave4commits === 1 && cs.commits.length === 2,
    'got wave4=' + cs.wave4commits + ' total=' + cs.commits.length);
  check('wave-4+ counts carry the veto death', cs.wave4counts['died-at-night-veto'] === 1,
    'got ' + cs.wave4counts['died-at-night-veto']);
})();
// ---------- 2b. Counterfactual fixtures ----------
console.log('== counterfactual fixtures ==');
function cfSeed(dawnOver, departs) {
  return baseSeed({
    dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
    part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2)],
    part2nightDawns: [dawnRow(11, 'v1', dawnOver || {})],
    dawnbidDeparts: departs || [],
    part2nightCensus: [censusRow(11, 'v1', 'spool', 'party'), censusRow(12, 'v1', 'spool', 'party')],
  });
}
function cfStatus(j) {
  const cs = ANALYZE.classifySeed(j);
  return cs.counterfactuals.length ? cs.counterfactuals[0].status : '(none)';
}
check('counterfactual all-pass + no dawn launch -> would-have-launched',
  cfStatus(cfSeed()) === 'would-have-launched', 'got ' + cfStatus(cfSeed()));
check('counterfactual all-pass + real dawn launch -> launched-anyway',
  cfStatus(cfSeed(null, [departRow(12, 'v1', 'launch', 'dawn', true, true)])) === 'launched-anyway',
  'got ' + cfStatus(cfSeed(null, [departRow(12, 'v1', 'launch', 'dawn', true, true)])));
for (const t of [
  ['holder away at dawn', { holderAway: true }, 'holder-away'],
  ['plan churned by dawn', { planGone: true, stageNow: null, targetNow: null, partyNow: [] }, 'plan-gone'],
  ['plan retargeted by dawn', { targetNow: 'gavel' }, 'plan-retargeted'],
  ['party changed by dawn', { partyIntact: false, partyNow: ['v3'] }, 'party-changed'],
  ['companion away at dawn', { companionStates: [{ vid: 'v2', alive: true, haven: true, away: true, exped: true, launchBlock: null }] }, 'companion-away'],
  ['holder sick at dawn', { holderSick: true, holderLaunchBlock: 'sick' }, 'holder-block'],
]) {
  const st = cfStatus(cfSeed(t[1]));
  check('counterfactual ' + t[0] + ' -> would-not-launch (' + t[2] + ')', st === 'would-not-launch', 'got ' + st);
  const cs = ANALYZE.classifySeed(cfSeed(t[1]));
  check('counterfactual ' + t[0] + ' records the failure', (cs.counterfactuals[0].failures || []).join(',').indexOf(t[2]) !== -1,
    'got ' + JSON.stringify(cs.counterfactuals[0].failures));
}
check('counterfactual medic-duty holder is NOT a failure (directed launches exempt)',
  cfStatus(cfSeed({ holderMedicDuty: true })) === 'would-have-launched',
  'got ' + cfStatus(cfSeed({ holderMedicDuty: true })));
(function () {
  const j = baseSeed({
    dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
    part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2)],
    part2nightDawns: [],
    gameDays: 11,
    part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
  });
  check('counterfactual run-ended -> no-next-dawn', cfStatus(j) === 'no-next-dawn', 'got ' + cfStatus(j));
})();
(function () {
  const j = baseSeed({
    dawnbidScores: [scoreRow(11, 2, 'v1', 'spool', 'party', 'party_launch')],
    part2nightSkips: [skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2)],
    part2nightDawns: [],
    gameDays: 150,
    part2nightCensus: [censusRow(11, 'v1', 'spool', 'party')],
  });
  check('counterfactual missing dawn row -> missing-dawn', cfStatus(j) === 'missing-dawn', 'got ' + cfStatus(j));
})();
// evaluateCounterfactual directly: noDawn-but-run-continued is a gap.
(function () {
  const death = skipRow(11, 3, 'v1', 'spool', 'party', 'night', 2);
  const ev = ANALYZE.evaluateCounterfactual(death, { noDawn: true, deathDay: 11, vid: 'v1' }, false, 150);
  check('counterfactual noDawn-but-run-continued -> missing-dawn', ev.status === 'missing-dawn', 'got ' + ev.status);
})();

// ---------- 3. Recorder: live 5d run (shape) ----------
console.log('== recorder live (5d run) ==');
async function liveRuns() {
  process.env.DAYS = '5';
  const out = await DRIVER.oneRun(103411);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run policy is competent', out.policy === 'competent', 'got ' + out.policy);
  const expSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12);
  check('live run policy sha is competent.js (df9b7dff4de4)', out.policySha === expSha, 'got ' + out.policySha + ' expected ' + expSha);
  check('live run carries part2night arrays', Array.isArray(out.part2nightSkips) && Array.isArray(out.part2nightDawns) && Array.isArray(out.part2nightCensus));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  const badSkip = (out.part2nightSkips || []).find(function (r) {
    return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && r.target &&
      ANALYZE.KNOWN_SKIP.indexOf(r.reason) !== -1 && r.raw && typeof r.raw === 'object' &&
      ('medicDuty' in r) && ('launchBlock' in r) && Array.isArray(r.companionStates));
  });
  check('skip rows have their shape + holder-state fields + a known reason', !badSkip, badSkip ? JSON.stringify(badSkip).slice(0, 200) : '');
  const badScore = (out.dawnbidScores || []).find(function (r) {
    return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && Array.isArray(r.cands) && r.plan !== undefined);
  });
  check('score rows have their shape', !badScore, badScore ? JSON.stringify(badScore).slice(0, 200) : '');
  const badDawn = (out.part2nightDawns || []).find(function (r) {
    return !(r && typeof r.deathDay === 'number' && r.vid && ('holderHaven' in r) && ('partyIntact' in r) && Array.isArray(r.companionStates || []));
  });
  check('dawn rows have their shape', !badDawn, badDawn ? JSON.stringify(badDawn).slice(0, 200) : '');
  const badCensus = (out.part2nightCensus || []).find(function (r) { return !(r && typeof r.day === 'number' && r.vid && r.target && r.stage); });
  check('census rows have their shape', !badCensus, badCensus ? JSON.stringify(badCensus).slice(0, 200) : '');
  return out;
}

// ---------- 3b. Recorder: staged live (night / dawn / away) ----------
console.log('== recorder staged live ==');
async function recorderLive() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 103411, mode: 'part2night-staged-test', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const today = ((Game.state.scholar || {}).day || 0);
  function atHaven(rid) {
    try { const n = Game.npcNode(rid); return !!(n && n.nx === hx && n.ny === hy); } catch (e) { return false; }
  }
  function dangerOff(rid) {
    try { return !Game.npcTrigger(rid, 'expedition_launch'); } catch (e) { return true; }
  }
  function healthOf(rid) {
    try { const h = (((Game.state.village || {}).health || {})[rid]); return h === undefined ? 100 : h; } catch (e) { return 100; }
  }
  let holder = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId) continue;
    if (!atHaven(rid)) continue;
    try { if (Game.isEngaged && Game.isEngaged(rid)) continue; } catch (e) {}
    if (((v.away || {})[rid])) continue;
    if (!dangerOff(rid)) continue;
    if (healthOf(rid) < 70) continue;
    if (((v.sick || {})[rid])) continue;
    holder = rid; break;
  }
  check('staged fixture: a launchable holder at Haven exists (' + (holder || 'none') + ')', !!holder);
  if (!holder) return;
  let companion = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId || rid === holder) continue;
    if (atHaven(rid) && healthOf(rid) >= 70 && !((v.sick || {})[rid])) { companion = rid; break; }
  }
  check('staged fixture: a companion at Haven exists (' + (companion || 'none') + ')', !!companion);
  if (!companion) return;
  v.vbrain = v.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  v.vbrain.commit = v.vbrain.commit || {};
  v.winPlan = v.winPlan || {};
  v.winPlan[holder] = { stage: 'party', target: 'spool', needWave: 3, party: [companion] };
  const skips = [];
  const dawns = [];
  const recErrors = [];
  const rec = DRIVER.installSkipRecorder(Game, 'diag', recErrors, skips, dawns);
  check('skip recorder installs with 0 errors', recErrors.length === 0, JSON.stringify(recErrors.slice(0, 2)));
  // Case N: part-2 commit, night tick -> 'night' skip row, dawn queued.
  Game.dayPart = 3;
  v.vbrain.commit[holder] = { kind: 'EXPEDITION', day: today, part: 2, winPlanAction: 'party_launch', companion: companion };
  const skipsBeforeN = skips.length;
  let errN = null;
  try { Game.agencyTick(); } catch (e) { errN = String(e && e.message); }
  const holderSkipsN = skips.slice(skipsBeforeN).filter(function (r) { return r.vid === holder; });
  check('recorder N: part-2 commit at night -> night skip row',
    !errN && holderSkipsN.length >= 1 && holderSkipsN[0].reason === 'night' && holderSkipsN[0].commitPart === 2,
    errN || ('got ' + JSON.stringify(holderSkipsN.map(function (r) { return r.reason + '/p' + r.commitPart; }))));
  if (holderSkipsN.length) {
    check('recorder N: skip row carries holder-state fields',
      ('medicDuty' in holderSkipsN[0]) && ('launchBlock' in holderSkipsN[0]) && Array.isArray(holderSkipsN[0].companionStates),
      JSON.stringify(Object.keys(holderSkipsN[0])));
  }
  // Case D: next dawn, part-0 tick -> dawn follow-up snapshot fires.
  try { Game.state.scholar.day = today + 1; } catch (e) {}
  Game.dayPart = 0;
  const dawnsBefore = dawns.length;
  let errD = null;
  try { Game.agencyTick(); } catch (e) { errD = String(e && e.message); }
  const holderDawns = dawns.slice(dawnsBefore).filter(function (r) { return r.vid === holder; });
  check('recorder D: next dawn -> dawn follow-up row for the night death',
    !errD && holderDawns.length === 1 && holderDawns[0].deathDay === today && holderDawns[0].dawnDay === today + 1,
    errD || ('got ' + dawns.length + ' dawn rows'));
  if (holderDawns.length) {
    check('recorder D: dawn row carries holder/plan/companion fields',
      holderDawns[0].holderHaven !== null && ('partyIntact' in holderDawns[0]) && Array.isArray(holderDawns[0].companionStates),
      JSON.stringify(Object.keys(holderDawns[0])));
  }
  // Case A: holder away on expedition (plan still at party stage) at
  // the night tick -> away-as-companion, on a fresh part-2 commit.
  try { if (v.winPlan && v.winPlan[holder]) v.winPlan[holder].stage = 'party'; } catch (e) {}
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    if (a) a.exped[holder] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: today + 1, sincePart: 0, duration: 12, finds: [], encounters: [] };
    v.away = v.away || {};
    v.away[holder] = { nx: 6, ny: 6, purpose: 'expedition' };
  } catch (e) {}
  Game.dayPart = 3;
  v.vbrain.commit[holder] = { kind: 'EXPEDITION', day: today + 1, part: 2, winPlanAction: 'party_launch', companion: companion };
  const skipsBeforeA = skips.length;
  let errA = null;
  try { Game.agencyTick(); } catch (e) { errA = String(e && e.message); }
  const holderSkipsA = skips.slice(skipsBeforeA).filter(function (r) { return r.vid === holder; });
  check('recorder A: away holder at night -> away-as-companion skip row',
    !errA && holderSkipsA.length >= 1 && holderSkipsA[0].reason === 'away-as-companion',
    errA || ('got ' + JSON.stringify(holderSkipsA.map(function (r) { return r.reason; }))));
  try { rec.uninstall(); } catch (e) {}
}

// ---------- 3c. Recorder: same-tick companion departure (live) ----------
// B launches with A as companion before A's roster turn; A's turn is
// skipped (expedition standing) so execute is never called for A, and
// the post-tick re-read must record away-as-companion-this-tick.
console.log('== recorder same-tick live ==');
async function sameTickLive() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 103411, mode: 'part2night-sametick-test', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const today = ((Game.state.scholar || {}).day || 0);
  function atHaven(rid) {
    try { const n = Game.npcNode(rid); return !!(n && n.nx === hx && n.ny === hy); } catch (e) { return false; }
  }
  function dangerOff(rid) {
    try { return !Game.npcTrigger(rid, 'expedition_launch'); } catch (e) { return true; }
  }
  function healthOf(rid) {
    try { const h = (((Game.state.village || {}).health || {})[rid]); return h === undefined ? 100 : h; } catch (e) { return 100; }
  }
  function launchable(rid) {
    if (rid === Game.villagerId) return false;
    if (!atHaven(rid)) return false;
    try { if (Game.isEngaged && Game.isEngaged(rid)) return false; } catch (e) {}
    if (((v.away || {})[rid])) return false;
    if (!dangerOff(rid)) return false;
    if (healthOf(rid) < 70) return false;
    if (((v.sick || {})[rid])) return false;
    // A homebody (maxDist 0) can never start an expedition — the
    // companion's startExpedition would range-0 out, so B's launch
    // could not take A along.
    try { if (Game.npcMaxDist && Game.npcMaxDist(rid) < 1) return false; } catch (e) {}
    return true;
  }
  const roster = v.roster || [];
  let B = null, A = null;
  outer: for (let i = 0; i < roster.length; i++) {
    for (let j = i + 1; j < roster.length; j++) {
      if (launchable(roster[i]) && launchable(roster[j])) { B = roster[i]; A = roster[j]; break outer; }
    }
  }
  check('same-tick fixture: a launchable (B before A) pair exists (' + (B || '?') + ' -> ' + (A || '?') + ')', !!(B && A));
  if (!B || !A) return;
  v.vbrain = v.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  v.vbrain.commit = v.vbrain.commit || {};
  v.winPlan = v.winPlan || {};
  v.winPlan[B] = { stage: 'party', target: 'spool', needWave: 3, party: [A] };
  v.winPlan[A] = { stage: 'party', target: 'gavel', needWave: 3, party: [B] };
  const skips = [];
  const dawns = [];
  const recErrors = [];
  const rec = DRIVER.installSkipRecorder(Game, 'diag', recErrors, skips, dawns);
  check('same-tick: skip recorder installs with 0 errors', recErrors.length === 0, JSON.stringify(recErrors.slice(0, 2)));
  Game.dayPart = 0;
  v.vbrain.commit[B] = { kind: 'EXPEDITION', day: today, part: 0, winPlanAction: 'party_launch', companion: A };
  v.vbrain.commit[A] = { kind: 'EXPEDITION', day: today, part: 0, winPlanAction: 'party_launch', companion: B };
  const calls = [];
  const origExecute = Game.vbrainExecuteDepart.bind(Game);
  Game.vbrainExecuteDepart = function (vid, hx2, hy2, ann) {
    calls.push(vid);
    return origExecute(vid, hx2, hy2, ann);
  };
  let errT = null;
  try { Game.agencyTick(); } catch (e) { errT = String(e && e.message); }
  const bLaunched = calls.indexOf(B) !== -1;
  let aExpedAfter = false;
  try { const ag = Game.agencyState ? Game.agencyState() : null; aExpedAfter = !!(ag && ag.exped && ag.exped[A]); } catch (e) {}
  check('same-tick: B reached execute and A left on B\'s launch', !errT && bLaunched && aExpedAfter,
    errT || ('calls=' + JSON.stringify(calls) + ' aExpedAfter=' + aExpedAfter));
  const aSkips = skips.filter(function (r) { return r.vid === A; });
  check('same-tick: A records away-as-companion-this-tick (not other)',
    aSkips.length >= 1 && aSkips[0].reason === 'away-as-companion-this-tick',
    'got ' + JSON.stringify(aSkips.map(function (r) { return r.reason; })));
  try { rec.uninstall(); } catch (e) {}
}

// ---------- 4. Determinism legs D1 + D2 (60d, seed 103411) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60', MODE: 'diag' }, envExtra || {});
  const script = "const d=require('./scripts/part2night-driver-20261117.js');" +
    "d.oneRun(103411).then(function(o){" +
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
  const off = childFingerprint({ PART2NIGHT_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty dawnbid/part2night/v4 arrays',
    (off.full.dawnbidScores || []).length === 0 && (off.full.v4seeds || []).length === 0 &&
    (off.full.dawnbidCensus || []).length === 0 && (off.full.part2nightSkips || []).length === 0 &&
    (off.full.part2nightDawns || []).length === 0 && (off.full.part2nightCensus || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
}

(async function () {
  try {
    await liveRuns();
    await recorderLive();
    await sameTickLive();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
