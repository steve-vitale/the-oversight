// test-launchfunnel-a.js — proof for arm sim-launchfunnel-a (DIAG:
// unified launch-funnel census, no game change).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the src/ diff vs the frozen base is 0 lines (DIAG,
// recorder wraps only; win-plan.js untouched), the scripts diff is
// the launchfunnel instrument only, the PROFILEGATE bypass is landed
// and the VETREENGAGE seed call is env-gated in this base, the
// driver widens the gate wrap to wave >= 4 and hard-enables SEEDLAND
// semantics, the funnel analyzer judges the frozen taxonomy on
// fixtures (launched-killed / launched-fought-no-kill /
// launched-no-meeting, window + companion joins, skip-`other`
// reclassification, gate join, pool + attach tables), the live
// recorder shape carries origins + skip rows, and the determinism
// legs D1 (repeatability) + D2 (wrap neutrality) are green at 60d on
// seed 103411 with VETREENGAGE=1.
// Usage:
//   node scripts/test-launchfunnel-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
process.env.VETREENGAGE = '1';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-a.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'launchfunnel-driver-20261117.js'));
const LAUNCHDEF_ANALYZE = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED the frozen prereg.
function frozenBase() {
  if (process.env.LAUNCHFUNNEL_BASE) return process.env.LAUNCHFUNNEL_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-launchfunnel-a-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO }).toString().trim();
  } catch (e) {}
  return null;
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitStatusNames(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim().slice(3); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const BASE = frozenBase();
console.log('  info: frozen base ' + BASE);
check('frozen base resolves (parent of the prereg-adding commit)', !!BASE);
const srcNames = BASE ? gitDiffNames(BASE, 'src/') : ['NO-BASE'];
const srcStatus = gitStatusNames('src/');
check('src/ diff vs base is 0 lines AND worktree src/ is clean (DIAG, recorder wraps only)',
  srcNames.length === 0 && srcStatus.length === 0,
  'diff=' + JSON.stringify(srcNames) + ' status=' + JSON.stringify(srcStatus));
const srcText = ['game.js', 'win-plan.js', 'villager-brain.js', 'villager-agency.js'].map(function (f) {
  return fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8');
});
check('no LAUNCHFUNNEL marker anywhere in src/js (win-plan.js untouched by this arm)',
  srcText.every(function (t) { return t.indexOf('LAUNCHFUNNEL') === -1; }));
check('PROFILEGATE bypass landed in villager-agency.js',
  srcText[3].indexOf('PROFILEGATE (sim-profilegate-a)') !== -1);
check('VETREENGAGE env gate present in game.js (seed call exists, env-gated)',
  srcText[0].indexOf("process.env.VETREENGAGE === '1'") !== -1 &&
  srcText[0].indexOf('winPlanSeedFromFight(vid, mdef, \'fled\')') !== -1);
const EXPECTED_SCRIPTS = [
  'scripts/launchfunnel-driver-20261117.js',
  'scripts/analyze-launchfunnel-a.js',
  'scripts/launchfunnel-drift-check.js',
  'scripts/build-launchfunnel-panels-20261117.js',
  'scripts/test-launchfunnel-a.js',
];
const scriptsDiff = BASE ? gitDiffNames(BASE, 'scripts/') : [];
const scriptsStatus = gitStatusNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsStatus))).sort();
check('scripts diff vs base + untracked is the launchfunnel instrument only (5 files)',
  JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
  'union=' + JSON.stringify(scriptsUnion));
check('launchfunnel instrument files exist',
  EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'launchfunnel-driver-20261117.js'), 'utf8');
check('driver gate wrap widened to wave >= 4', driverSrc.indexOf('if (w >= 4 && mdef && mdef.id) { // LAUNCHFUNNEL') !== -1);
check('driver SEEDLAND semantics hard-on', driverSrc.indexOf('const SEEDLAND = true;') !== -1);
check('driver installs the skip recorder (mode on)', driverSrc.indexOf("installSkipRecorder(Game, 'on', errors, launchdefSkips)") !== -1);
check('driver recorder flag is LAUNCHFUNNEL_RECORDER', driverSrc.indexOf("process.env.LAUNCHFUNNEL_RECORDER !== 'off'") !== -1);
check('driver exports installSkipRecorder + commitKindOf + classifySeedPath + fightOrigin',
  typeof DRIVER.installSkipRecorder === 'function' && typeof DRIVER.commitKindOf === 'function' &&
  typeof DRIVER.classifySeedPath === 'function' && typeof DRIVER.fightOrigin === 'function');

// ---------- 2. classifySeedPath fixtures ----------
console.log('== classifySeedPath fixtures ==');
function fakeStack(frames) {
  return 'Error\n' + frames.map(function (f) { return '    at ' + f; }).join('\n');
}
const P = '/home/hatch/workspace/the-scattering/';
check('world-tick fled -> world-tick', DRIVER.classifySeedPath('fled', fakeStack([
  'Object.resolveWildMonsterEncounter (' + P + 'src/js/game.js:20948:10)'])) === 'world-tick');
check('agency fled -> agency-flee', DRIVER.classifySeedPath('fled', fakeStack([
  'Object.expeditionMonster (' + P + 'src/js/villager-agency.js:660:40)'])) === 'agency-flee');
check('agency evaded -> agency-evade', DRIVER.classifySeedPath('evaded', fakeStack([
  'Object.expeditionMonster (' + P + 'src/js/villager-agency.js:643:40)'])) === 'agency-evade');
check('gate avoided -> gate-avoid', DRIVER.classifySeedPath('avoided', fakeStack([
  'Object.winPlanFightGate (' + P + 'src/js/win-plan.js:512:10)'])) === 'gate-avoid');
check('fled with no caller -> unknown-fled-no-caller (explicit, never silent)',
  DRIVER.classifySeedPath('fled', 'Error\n    at Object.nowhere (/x/y.js:1:1)') === 'unknown-fled-no-caller');

// ---------- 3. Funnel judge fixtures ----------
console.log('== funnel judge fixtures ==');
function mkSeed(over) {
  const j = {
    seed: 103411, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4departs: [], v4gates: [], v4encounters: [],
    dawnbidScores: [], dawnbidDeparts: [], dawnbidCensus: [], dawnbidStarts: [],
    launchdefSkips: [], companionPool: [], daily: [], deaths: [],
  };
  return Object.assign(j, over || {});
}
function seedRow(day, vid, target, wave, path, stageAfter) {
  return { day: day, vid: vid, mid: target, wave: wave, outcome: 'fled', path: path,
    caller: 'test', stageAfter: stageAfter || 'party', target: target, node: null };
}
function scoreRow(day, vid, target, opts) {
  const o = opts || {};
  const cands = o.cands !== undefined ? o.cands : [{ kind: 'winplan', w: 10, winPlanAction: 'party_launch', companion: 'c1' }];
  return { day: day, part: 0, vid: vid, cands: cands,
    pick: { kind: 'winplan', winPlanAction: o.commitAction !== undefined ? o.commitAction : 'party_launch' },
    logCands: cands.map(function (c) { return { kind: c.kind || 'winplan', score: 10, winPlanAction: c.winPlanAction || null }; }),
    commit: o.commit === undefined ? { kind: 'winplan', winPlanAction: 'party_launch', companion: 'c1' } : o.commit,
    plan: { stage: 'party', target: target, needWave: 4, party: ['c1'] },
    holderGear: { armed: true, armored: true } };
}
function depRow(day, vid, target, result, opts) {
  const o = opts || {};
  return { seq: 1, day: day, vid: vid, source: 'brain', result: result,
    winPlanAction: 'party_launch', commitKind: 'dawn', commitPart: 0,
    companion: o.companion !== undefined ? o.companion : 'c1',
    vidExped: result === 'launch', companionExped: result === 'launch',
    vidBlock: o.vidBlock || null, companionBlock: o.companionBlock || null,
    stage: 'party', target: target, party: ['c1'] };
}
function encRow(day, vid, mid, outcome, opts) {
  const o = opts || {};
  return { day: day, vid: vid, mid: mid, wave: o.wave || 4, alliesN: 1, allyVids: [],
    allyFromStart: false, gate: null, outcome: outcome, rounds: o.rounds != null ? o.rounds : 3,
    vTaken: 20, mDealt: 100, calledHelp: false, allyVid: o.allyVid || null,
    fleeHpFrac: null, trickBefore: false, trickAfter: false, lines: [], log: [],
    origin: o.origin || 'expedition' };
}
function gateRow(day, vid, mid, result, trickKnown) {
  return { day: day, vid: vid, mid: mid, wave: 4, result: result, reason: result === 'avoid' ? 'outmatched' : null,
    partySize: 3, sensedSize: 3, countedSize: 0, party: ['v1', 'c1'], sensed: ['v1', 'c1'],
    allArmed: true, allArmored: true, gear: {}, trickKnown: !!trickKnown,
    planStage: 'party', planTarget: mid, planParty: ['c1'], needWave: 4 };
}
function launchedCorpus(opts) {
  const o = opts || {};
  const j = mkSeed();
  j.v4seeds = [seedRow(10, 'v1', 'strike', 4, 'world-tick')];
  j.dawnbidScores = [scoreRow(20, 'v1', 'strike')];
  j.dawnbidDeparts = [depRow(20, 'v1', 'strike', 'launch')];
  j.v4departs = [{ day: 20, vid: 'v1', source: 'brain', result: 'launch', winPlanAction: 'party_launch',
    companion: 'c1', companion2: null, stage: 'party', target: 'strike', party: ['c1'],
    partySize: 2, partyKillers: 0, partyArmed: 1, targetWave: 4 }];
  j.dawnbidCensus = [{ day: 150, vid: 'v1', target: 'strike', needWave: 4, stage: 'party', party: ['c1'],
    holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderSick: false,
    holderHealth: 100, holderGear: { armed: true, armored: true } }];
  j.daily = [{ day: 150, waveKillLog: [], roster: [{ vid: 'v1', dead: false }], wave4Slain: {}, vetsW3: { count: 0 }, vetsW4: { count: 0 }, ready4: { ready: false }, ready5: { ready: false } }];
  if (o.encounters) j.v4encounters = o.encounters;
  if (o.gates) j.v4gates = o.gates;
  if (o.closeDay != null) {
    // Close the instance via a retarget seed row (launchdef closeKind).
    j.v4seeds.push(seedRow(o.closeDay, 'v1', 'eulogy', 4, 'world-tick'));
  }
  return j;
}
(function () { // F1: launched-killed
  const r = ANALYZE.funnelForSeed(launchedCorpus({ encounters: [encRow(25, 'v1', 'strike', 'vKill')] }));
  const inst = r.instances[0];
  check('F1 launched-killed: in-window vKill meeting classifies launched-killed',
    inst.funnelBucket === 'launched-killed' && inst.meetingKills === 1 && r.byFunnel['launched-killed'] === 1,
    'bucket=' + inst.funnelBucket + ' kills=' + inst.meetingKills);
  check('F1 launch party recorded (holder + companion, size 2)',
    inst.launchPartySize === 2 && inst.launchParty.indexOf('v1') !== -1 && inst.launchParty.indexOf('c1') !== -1,
    JSON.stringify(inst.launchParty));
})();
(function () { // F2: launched-fought-no-kill
  const r = ANALYZE.funnelForSeed(launchedCorpus({ encounters: [encRow(25, 'v1', 'strike', 'vFlee', { rounds: 3 })] }));
  const inst = r.instances[0];
  check('F2 launched-fought-no-kill: in-window vFlee meeting, no kill',
    inst.funnelBucket === 'launched-fought-no-kill' && inst.funnelSub === 'vFlee:1' && inst.meetings.length === 1,
    'bucket=' + inst.funnelBucket + ' sub=' + inst.funnelSub);
})();
(function () { // F3: launched-no-meeting
  const r = ANALYZE.funnelForSeed(launchedCorpus({}));
  const inst = r.instances[0];
  check('F3 launched-no-meeting: launch with zero in-window meetings',
    inst.funnelBucket === 'launched-no-meeting' && inst.meetings.length === 0,
    'bucket=' + inst.funnelBucket);
})();
(function () { // F4: window exclusion (before launch, after close)
  const r = ANALYZE.funnelForSeed(launchedCorpus({ closeDay: 40, encounters: [
    encRow(12, 'v1', 'strike', 'vKill'),
    encRow(45, 'v1', 'strike', 'vKill'),
  ] }));
  const inst = r.instances[0];
  check('F4 window: pre-launch + post-close kills excluded (0 meetings)',
    inst.funnelBucket === 'launched-no-meeting' && inst.meetings.length === 0,
    'bucket=' + inst.funnelBucket + ' meetings=' + inst.meetings.length);
})();
(function () { // F5: companion-fighter meeting counts
  const r = ANALYZE.funnelForSeed(launchedCorpus({ encounters: [encRow(25, 'c1', 'strike', 'vKill')] }));
  const inst = r.instances[0];
  check('F5 companion meeting: fight by the launched companion counts as a meeting',
    inst.funnelBucket === 'launched-killed' && inst.meetings.length === 1 && inst.meetings[0].vid === 'c1',
    'bucket=' + inst.funnelBucket);
})();
(function () { // F6: candidate-not-bid (no-companion-party)
  const j = mkSeed();
  j.v4seeds = [seedRow(10, 'v1', 'strike', 4, 'world-tick')];
  j.dawnbidScores = [scoreRow(20, 'v1', 'strike', { cands: [{ kind: 'winplan', w: 5, winPlanAction: 'party_wait' }], commit: null })];
  const r = ANALYZE.funnelForSeed(j);
  const inst = r.instances[0];
  check('F6 candidate-not-bid: party_wait candidate, no bid',
    inst.funnelBucket === 'candidate-not-bid' && inst.funnelSub === 'no-companion-party',
    'bucket=' + inst.funnelBucket + ' sub=' + inst.funnelSub);
})();
(function () { // F7: selected-blocked via skip reason
  const j = mkSeed();
  j.v4seeds = [seedRow(10, 'v1', 'strike', 4, 'world-tick')];
  j.dawnbidScores = [scoreRow(20, 'v1', 'strike')];
  j.dawnbidDeparts = [depRow(20, 'v1', 'strike', 'normal', { companion: 'c1' })];
  j.launchdefSkips = [{ seq: 1, day: 20, part: 0, vid: 'v1', target: 'strike', stage: 'party', party: ['c1'],
    commitKind: 'dawn', commitPart: 0, leg: 'on', reason: 'away-on-expedition', executeResult: 'normal',
    raw: { profile: 'wanderer', node: { nx: 4, ny: 4 }, haven: true, exped: true, away: true, night: false, engaged: false, indoor: false, danger: false, dead: false } }];
  const r = ANALYZE.funnelForSeed(j);
  const inst = r.instances[0];
  check('F7 selected-blocked: normal depart + away-on-expedition skip row',
    inst.funnelBucket === 'selected-blocked' && inst.funnelSub === 'away-on-expedition',
    'bucket=' + inst.funnelBucket + ' sub=' + inst.funnelSub);
})();
(function () { // F8: bid-not-selected
  const j = mkSeed();
  j.v4seeds = [seedRow(10, 'v1', 'strike', 4, 'world-tick')];
  j.dawnbidScores = [scoreRow(20, 'v1', 'strike', { commit: { kind: 'winplan', winPlanAction: null, companion: null } })];
  const r = ANALYZE.funnelForSeed(j);
  const inst = r.instances[0];
  check('F8 bid-not-selected: party_launch bid, commit picks something else',
    inst.funnelBucket === 'bid-not-selected',
    'bucket=' + inst.funnelBucket + ' bids=' + (inst.bids || []).length);
})();
(function () { // F9: skip `other` reclassification (same-tick companion depart)
  const j = launchedCorpus({});
  j.dawnbidDeparts = [depRow(20, 'v1', 'strike', 'normal', { companion: 'c1' })];
  j.v4departs = [];
  j.launchdefSkips = [{ seq: 1, day: 20, part: 0, vid: 'v1', target: 'strike', stage: 'party', party: ['c1'],
    commitKind: 'dawn', commitPart: 0, leg: 'on', reason: 'other', executeResult: null,
    raw: { profile: 'wanderer', node: { nx: 4, ny: 4 }, haven: true, exped: false, away: false, night: false, engaged: false, indoor: false, danger: false, dead: false } }];
  // Another holder departs the same day with v1 as companion.
  j.dawnbidDeparts.push({ seq: 2, day: 20, vid: 'v2', source: 'brain', result: 'launch',
    winPlanAction: 'party_launch', commitKind: 'dawn', commitPart: 0, companion: 'v1',
    vidExped: true, companionExped: true, vidBlock: null, companionBlock: null,
    stage: 'party', target: 'eulogy', party: ['v1'] });
  const r = ANALYZE.funnelForSeed(j);
  check('F9 skip-other reclassified away-as-companion-this-tick (depart join)',
    r.skipReasons['away-as-companion-this-tick'] === 1 && r.otherReclassified === 1 &&
    (r.skipReasons.other || 0) === 0,
    'skipReasons=' + JSON.stringify(r.skipReasons) + ' reclassified=' + r.otherReclassified);
  check('F9 instance sub carries the corrected reason',
    r.instances[0].funnelSub === 'away-as-companion-this-tick',
    'sub=' + r.instances[0].funnelSub);
})();
(function () { // F10: gate join + pool + attach tables
  const r = ANALYZE.funnelForSeed(launchedCorpus({ encounters: [encRow(25, 'v1', 'strike', 'vKill')],
    gates: [gateRow(25, 'v1', 'strike', 'null', false), gateRow(26, 'v1', 'strike', 'avoid', true)] }));
  check('F10 gate join: null + avoid rows joined to the launched window, trick-known avoid counted',
    r.gateJoined.null === 1 && r.gateJoined.avoid === 1 && r.gateJoined.trickKnownAvoid === 1 && r.gateJoined.seek === 0,
    'gateJoined=' + JSON.stringify(r.gateJoined));
  const j2 = mkSeed();
  j2.v4seeds = [
    seedRow(10, 'v1', 'strike', 4, 'world-tick'),
    seedRow(12, 'v1', 'strike', 4, 'agency-flee'),
    seedRow(14, 'v2', 'eulogy', 4, 'gate-avoid', 'hunt'),
  ];
  j2.companionPool = [
    { day: 20, part: 0, vid: 'v1', target: 'strike', stage: 'party', holderProfile: 'wanderer',
      holderNode: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 }, rosterN: 5,
      counts: { selfOrScholar: 2, dead: 0, away: 1, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 2, onExped: 0, eligible: 0 },
      fails: {}, eligible: [], rankedOrder: [], rankedPick: null, rankedVia: 'roster-fallback',
      bidCompanion: null, agree: null, members: [] },
    { day: 21, part: 0, vid: 'v1', target: 'strike', stage: 'party', holderProfile: 'wanderer',
      holderNode: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 }, rosterN: 5,
      counts: { selfOrScholar: 2, dead: 0, away: 1, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 1, onExped: 0, eligible: 1 },
      fails: {}, eligible: ['c1'], rankedOrder: [{ id: 'c1', s: 5 }], rankedPick: 'c1', rankedVia: 'companionRank',
      bidCompanion: 'c1', agree: true, members: [] },
  ];
  const r2 = ANALYZE.funnelForSeed(j2);
  check('F10 attach: 2 attached (world-tick + agency-flee refresh the instance), 1 non-attaching (gate-avoid, hunt stage)',
    r2.attach.attached === 2 && r2.attach.nonAttaching === 1 && r2.attach.wave4Rows === 3,
    'attach=' + JSON.stringify(r2.attach));
  check('F10 attach byPath tallies all three paths',
    r2.attach.byPath['world-tick'] === 1 && r2.attach.byPath['agency-flee'] === 1 && r2.attach.byPath['gate-avoid'] === 1,
    'byPath=' + JSON.stringify(r2.attach.byPath));
  check('F10 pool: eligible-0 and eligible-1 dawns counted, first-fails summed',
    r2.poolDist.dawns === 2 && r2.poolDist.eligible0 === 1 && r2.poolDist.eligible1 === 1 &&
    r2.firstFails.notRanger === 3 && r2.firstFails.away === 2,
    'poolDist=' + JSON.stringify(r2.poolDist) + ' firstFails=' + JSON.stringify(r2.firstFails));
})();
(function () { // F11: ranked leaks + unknown 0 across all fixtures
  const leg = { bySeed: {
    103411: ANALYZE.funnelForSeed(launchedCorpus({ encounters: [encRow(25, 'v1', 'strike', 'vKill')] })),
    103412: ANALYZE.funnelForSeed(launchedCorpus({ encounters: [encRow(25, 'v1', 'strike', 'vFlee')] })),
  }, files: ['a', 'b'] };
  const s = ANALYZE.summarize(leg);
  check('F11 summarize: 2 instances, 0 unknown, ranked leaks list the fought-no-kill leak first',
    s.instancesOpened === 2 && s.unknown === 0 && s.classifiedShare === 1 &&
    s.rankedLeaks[0].stage === 'launched-fought-no-kill' && s.rankedLeaks[0].count === 1 &&
    s.bindingStage === 'launched-fought-no-kill',
    'opened=' + s.instancesOpened + ' unknown=' + s.unknown + ' ranked=' + JSON.stringify(s.rankedLeaks));
})();

// ---------- 4. Recorder: live in-memory run (shape) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'launchfunnel-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'launchfunnel-driver-20261117.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  const out = await driver.oneRun(103411);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries v4 + dawnbid + pool + skip arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.launchdefSkips));
  check('live run policy sha is the frozen competent verbatim (df9b7dff4de4)',
    out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  const noOrigin = (out.v4encounters || []).find(function (r) { return !r.origin || typeof r.origin !== 'string'; });
  check('every recorded v4encounters row carries an origin string', !noOrigin, noOrigin ? JSON.stringify(noOrigin).slice(0, 300) : '');
  const badOrigin = (out.v4encounters || []).find(function (r) {
    return ['expedition', 'world-tick', 'patrol', 'aid', 'unclassified'].indexOf(r.origin) === -1 && r.origin.indexOf('other:') !== 0;
  });
  check('every origin is in the frozen taxonomy', !badOrigin, badOrigin ? JSON.stringify(badOrigin).slice(0, 300) : '');
  const badGateWave = (out.v4gates || []).find(function (r) { return (r.wave | 0) < 4; });
  check('every gate row is wave >= 4 (widened wrap)', !badGateWave, badGateWave ? JSON.stringify(badGateWave).slice(0, 200) : '');
  console.log('  info: live 5d run recorded ' + (out.v4encounters || []).length + ' encounters, ' +
    (out.v4seeds || []).length + ' seed rows, ' + (out.v4gates || []).length + ' gate rows, ' +
    (out.companionPool || []).length + ' pool rows, ' + (out.launchdefSkips || []).length + ' skip rows');
  return out;
}

// ---------- 5. Determinism legs D1/D2 (60d, seed 103411, VETREENGAGE=1) ----------
console.log('== determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), MODE: 'vre', VETREENGAGE: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/launchfunnel-driver-20261117.js');" +
    "d.oneRun(103411).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childRun(60, {});
  const b = childRun(60, {});
  check('D1 repeatability: identical full corpus, recorder ON twice, VETREENGAGE=1 (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { LAUNCHFUNNEL_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF, VETREENGAGE=1 (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty recorder arrays (v4/dawnbid/pool/skips)',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4encounters || []).length === 0 && (off.full.launchdefSkips || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  const origins = {};
  for (const r of (a.full.v4encounters || [])) origins[r.origin] = (origins[r.origin] || 0) + 1;
  console.log('  info: D1 60d run recorded ' + (a.full.v4encounters || []).length + ' encounters by origin ' + JSON.stringify(origins) +
    ', ' + (a.full.v4seeds || []).length + ' seed rows, ' + (a.full.v4gates || []).length + ' gate rows');
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
