// test-zeroattempt-b.js — proof, arm sim-zeroattempt-b
// (DIAG: decompose the dawn scorer's decision chain per villager-day
// — (a) which sub-gate fires when no EXPEDITION candidate is offered,
// (b) what ASSIGN picks instead and why it always wins, (c) why
// 0-plan-holder villages never get a plan, (d) whether the soft path
// ever reaches its chance roll. Extends the expignite proof: static
// checks (zero src/ diff, wraps named, code-read anchors by function
// name), analyzer fixture checks (depart-return derivation, tick-gate
// derivation + bypasses, soft weight/offer, hash-roll properties,
// code-order B-gate, C/assign decomposition, hash consistency,
// store decomposition, synthetic A/B/C/D/E/F classification +
// tamper detection), live-shape checks on a 5d run, and determinism
// legs D1 (recorder ON twice, 60d, identical full corpus) + D2
// (recorder ON vs OFF, 60d, identical daily trajectory signatures +
// wall fields) + D3 (analyzer re-derivation on synthetic + live rows,
// mismatch 0, unknown 0).
// Usage: node scripts/test-zeroattempt-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'zeroattempt-driver-20261116.js'));
const AN = require(path.join(REPO, 'scripts', 'analyze-zeroattempt-b.js'));
const MED = require(path.join(REPO, 'scripts', 'analyze-medicduty-b.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' — ' + String(detail).slice(0, 300) : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + String(detail).slice(0, 300) : '')); }
}
function read(p) { try { return fs.readFileSync(path.join(REPO, p), 'utf8'); } catch (e) { return ''; } }
function gitStatusWithRetry(args) {
  for (let i = 0; i < 6; i++) {
    try { return execSync('git ' + args, { cwd: REPO, encoding: 'utf8' }); }
    catch (e) { if (i === 5) throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000); }
  }
  return '';
}

console.log('== static checks ==');
// 1. Zero src/js game-code change (instrument-only DIAG).
let srcStatus = null, srcErr = null;
try { srcStatus = gitStatusWithRetry('status --porcelain -- src/'); }
catch (e) { srcErr = String((e && e.message) || e).slice(0, 120); }
check('game-code worktree diff is empty (src/ clean)', srcStatus !== null && srcStatus.trim() === '', srcErr || JSON.stringify(srcStatus));
// 2. Driver shape.
const driverSrc = read('scripts/zeroattempt-driver-20261116.js');
check('driver wraps vbrainScorePick', driverSrc.indexOf('Game.vbrainScorePick = function') !== -1);
check('driver wraps vbrainLogGate', driverSrc.indexOf('Game.vbrainLogGate = function') !== -1);
check('driver wraps vbrainExecuteDepart', driverSrc.indexOf('Game.vbrainExecuteDepart = function') !== -1);
check('driver wraps agencyTick', driverSrc.indexOf('Game.agencyTick = function') !== -1);
check('driver wraps startExpedition', driverSrc.indexOf('Game.startExpedition = function') !== -1);
check('driver wraps expeditionReturn', driverSrc.indexOf('Game.expeditionReturn = function') !== -1);
check('driver wraps expedDeath', driverSrc.indexOf('Game.expedDeath = function') !== -1);
check('driver wraps winPlanHavenTick', driverSrc.indexOf('Game.winPlanHavenTick = function') !== -1);
check('driver wraps winPlanSeedFromFight', driverSrc.indexOf('Game.winPlanSeedFromFight = function') !== -1);
check('driver wraps winPlanOf (observe-only)', driverSrc.indexOf('Game.winPlanOf = function') !== -1);
check('driver wraps winPlanNoteKill', driverSrc.indexOf('Game.winPlanNoteKill = function') !== -1);
check('driver records candidate dutyTask/assignTask/chore', driverSrc.indexOf('dutyTask: c.dutyTask') !== -1 &&
  driverSrc.indexOf('assignTask: c.assignTask') !== -1);
check('driver records census winPlanStoreExists/knowFoughtN/villageSlainN/assignedTask',
  driverSrc.indexOf('winPlanStoreExists: storeExistsRaw(Game)') !== -1 &&
  driverSrc.indexOf('knowFoughtN: knowFoughtN(Game, rid)') !== -1 &&
  driverSrc.indexOf('villageSlainN: villageSlainN(Game)') !== -1 &&
  driverSrc.indexOf('assignedTask: assignedTaskRaw(Game, rid)') !== -1);
check('driver records havenRows + creation ledger', driverSrc.indexOf('havenRows.push') !== -1 &&
  driverSrc.indexOf('v4creates.push') !== -1 && driverSrc.indexOf('storeInitRows.push') !== -1);
check('driver has ZEROATTEMPT_RECORDER off-switch', driverSrc.indexOf('ZEROATTEMPT_RECORDER') !== -1);
check('driver refuses a MODE=off run with the recorder on (mislabel trap)',
  driverSrc.indexOf("if (MODE === 'off' && RECORDER_ON)") !== -1 &&
  driverSrc.indexOf("MODE=off requires ZEROATTEMPT_RECORDER=off") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver never calls winPlanStats() (stateOf would create the store)',
  driverSrc.indexOf('Game.winPlanStats(') === -1);
// villageSlainN reads TOP-LEVEL state.villageSlain (game.js
// recordWaveKill writes it there). The nested state.village
// .villageSlain read returned 0 on all 8 seeds of the first sweep
// even on seeds with 5 wave-4 kills in waveKillLog — instrument bug,
// fixed 2026-11-17; the fake-Game checks below pin the path.
check('villageSlainN reads top-level state.villageSlain, not the nested path',
  driver.villageSlainN({ state: { villageSlain: { deer: 2, wolf: 0 } } }) === 1 &&
  driver.villageSlainN({ state: { village: { villageSlain: { deer: 2 } } } }) === 0 &&
  driver.villageSlainN({ state: {} }) === 0);
check('knowFoughtN reads state.village.agency.know[vid].fought',
  driver.knowFoughtN({ state: { village: { agency: { know: { v1: { fought: ['a', 'b'] } } } } } }, 'v1') === 2 &&
  driver.knowFoughtN({ state: { village: { agency: { know: {} } } } }, 'v1') === null);
check('driver never INVOKES state-creating winPlanOf/agencyState/agencyOf/npcTrigger (reads + wrap installs only)',
  driverSrc.indexOf('Game.winPlanOf(') === -1 && driverSrc.indexOf('Game.agencyState(') === -1 &&
  driverSrc.indexOf('Game.agencyOf(') === -1 && driverSrc.indexOf('Game.npcTrigger(') === -1);
check('driver reads agency know + villageSlain as raw state (never agencyState)',
  driverSrc.indexOf('((Game.state || {}).village || {}).agency') !== -1 &&
  driverSrc.indexOf('.villageSlain') !== -1);
check('driver reads the danger belief directly (objVillageDanger), not the trigger registry',
  driverSrc.indexOf('Game.objVillageDanger') !== -1);
check('driver records the call stack for origin', driverSrc.indexOf('new Error().stack') !== -1);
check('driver derives the block reason from the pre-call gate in true order',
  driverSrc.indexOf('deriveBlockReasonFromGate(gate, vid)') !== -1);
check('driver snapshots tick gates BEFORE the tick runs', driverSrc.indexOf('agencyTick-pre') !== -1 &&
  driverSrc.indexOf('return origTick.apply') !== -1);
check('driver records a part-0 daily census', driverSrc.indexOf('censusRows.push') !== -1);
check('driver records a daily trajectory signature on both legs', driverSrc.indexOf('dailySig.push') !== -1);
// 3. Code-read anchors (by function name, not line number).
const brainSrc = read('src/js/villager-brain.js');
check('code anchor: vbrainOwnsDawn always true (legacy chance roll unreachable)',
  brainSrc.indexOf('vbrainOwnsDawn: function () { return true; }') !== -1);
check('code anchor: party_launch always overrides in the scorer',
  brainSrc.indexOf("if (exi.winPlanAction === 'gear_hold' || exi.winPlanAction === 'veteran_guard' ||") !== -1 &&
  brainSrc.indexOf("overrideReason = 'win_plan:' + exi.winPlanAction;") !== -1);
check('code anchor: soft EXPEDITION only on an indoor core pick + hash roll',
  brainSrc.indexOf("var indoorCore = coreKind === 'HAVEN_CHORE' || coreKind === 'REST' ||") !== -1 &&
  brainSrc.indexOf("if (dawnHashRoll(this, vid, 'exped') < chance)") !== -1);
check('code anchor: depart requires today\'s commit',
  brainSrc.indexOf("if (!c || c.day !== dayOf(this)) return 'normal';") !== -1);
check('code anchor: blocked party_launch inviter returns hold',
  brainSrc.indexOf("if (!a2 || !a2.exped[vid]) return 'hold';") !== -1);
const agencySrc = read('src/js/villager-agency.js');
check('code anchor: agency chance roll sits behind the vbrain branch',
  agencySrc.indexOf("if (typeof this.vbrainOwnsDawn === 'function' && this.vbrainOwnsDawn()) {") !== -1 &&
  agencySrc.indexOf('if (R() < chance) this.startExpedition(rid, hx, hy, playerAtHaven);') !== -1);
const objSrc = read('src/js/villager-objectives.js');
check('code anchor: dawn re-pick only for idle/done/returning objectives',
  objSrc.indexOf("if (!o.kind || o.kind === 'idle' || o.state === 'done' || o.state === 'returning') {") !== -1);
check('code anchor: ASSIGN candidate weighs 99 (always wins the scorer)',
  brainSrc.indexOf('w: 99,') !== -1);
check('code anchor: override order is win-plan, then ASSIGN, then DUTY, then hash',
  brainSrc.indexOf("overrideReason = 'assign_standing';") !== -1 &&
  brainSrc.indexOf("overrideReason = 'duty_top_score';") !== -1 &&
  brainSrc.indexOf("overrideReason = 'expedition_hash';") !== -1 &&
  brainSrc.indexOf("overrideReason = 'assign_standing';") < brainSrc.indexOf("overrideReason = 'duty_top_score';") &&
  brainSrc.indexOf("overrideReason = 'duty_top_score';") < brainSrc.indexOf("overrideReason = 'expedition_hash';"));
check('code anchor: expeditionCand gates in order profile -> night -> trigger -> maxDist -> sick',
  brainSrc.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') return null;") !== -1 &&
  brainSrc.indexOf("if (night) return null;") !== -1 &&
  brainSrc.indexOf("if (maxD < 1) return null;") !== -1);
const winPlanSrc = read('src/js/win-plan.js');
check('code anchor: havenTick returns null when the store does not exist (never the first spark)',
  winPlanSrc.indexOf('if (!v || !v.winPlan) return null;') !== -1);
check('code anchor: seedFromFight only seeds wave-3+ fights',
  winPlanSrc.indexOf("if (!mdef || (mdef.wave || 1) < 3) return null;") !== -1);
check('code anchor: noteKill initializes the store via stateOf before its no-plan return',
  winPlanSrc.indexOf('winPlanNoteKill(vid, mdef)') !== -1 &&
  winPlanSrc.indexOf("if (!v || !v.winPlan[vid]) return null;") !== -1);
const gameSrc = read('src/js/game.js');
check('code anchor: assignments are written with no expiry (only rest deletes)',
  gameSrc.indexOf('v.assignments[vid] = { task, assignedDay:') !== -1);
// 4. Policy sha (competent verbatim — re-pinned under journey-landing r140).
const polSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex');
check('competent.js is the verbatim policy blob (df9b7dff4de4…)', polSha === 'df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c', polSha.slice(0, 12));

console.log('== analyzer fixtures ==');
// Hash-roll properties (the exact values are checked against live
// rows in D3 below; here: range, determinism, sensitivity).
check('hash roll: in [0,1), deterministic, varies by vid/day/salt',
  (function () {
    const a = AN.dawnHashRoll('a', 10, 'exped');
    return a >= 0 && a < 1 && a === AN.dawnHashRoll('a', 10, 'exped') &&
      a !== AN.dawnHashRoll('b', 10, 'exped') && a !== AN.dawnHashRoll('a', 11, 'exped') &&
      a !== AN.dawnHashRoll('a', 10, 'other');
  })());
check('hash roll: fixture values (d/10 picks, c/10 fails, f/12 picks)',
  AN.dawnHashRoll('d', 10, 'exped') < 0.275 && AN.dawnHashRoll('c', 10, 'exped') >= 0.275 &&
  AN.dawnHashRoll('f', 12, 'exped') < 0.275,
  'd/10=' + AN.dawnHashRoll('d', 10, 'exped') + ' c/10=' + AN.dawnHashRoll('c', 10, 'exped') + ' f/12=' + AN.dawnHashRoll('f', 12, 'exped'));
// Soft weight / offered.
check('soft weight: explorer 0.55, wanderer 0.28, potential x1.6',
  AN.softWeight({ profile: 'explorer', potential: false }) === 0.55 &&
  AN.softWeight({ profile: 'wanderer', potential: false }) === 0.28 &&
  AN.softWeight({ profile: 'explorer', potential: true }) === 0.88 &&
  AN.softWeight({ profile: 'forager', potential: false }) === null);
check('soft offered: profile/night/trigger/maxDist/sick gates, all exact',
  AN.softOffered({ profile: 'explorer', night: false, danger: 0, maxDist: 3, sick: false, potential: false }) === true &&
  AN.softOffered({ profile: 'forager', night: false, danger: 0, maxDist: 3, sick: false, potential: false }) === false &&
  AN.softOffered({ profile: 'explorer', night: true, danger: 0, maxDist: 3, sick: false, potential: false }) === false &&
  AN.softOffered({ profile: 'explorer', night: false, danger: 4, maxDist: 3, sick: false, potential: false }) === false &&
  AN.softOffered({ profile: 'explorer', night: false, danger: 0, maxDist: 0, sick: false, potential: false }) === false &&
  AN.softOffered({ profile: 'explorer', night: false, danger: 0, maxDist: 3, sick: true, potential: false }) === false);
// Depart-return derivation, every branch.
function depRow(commit, day, ret, expedAfter) { return { commit: commit, day: day, ret: ret, expedAfter: expedAfter }; }
check('depart return: stale commit is normal',
  AN.deriveDepartReturn(depRow({ kind: 'EXPEDITION', winPlanAction: null, day: 9 }, 10, 'normal', false)) === 'normal');
check('depart return: null commit is normal',
  AN.deriveDepartReturn(depRow(null, 10, 'normal', false)) === 'normal');
check('depart return: gear_hold is hold',
  AN.deriveDepartReturn(depRow({ kind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', day: 10 }, 10, 'hold', false)) === 'hold');
check('depart return: party_wait is hold',
  AN.deriveDepartReturn(depRow({ kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', day: 10 }, 10, 'hold', false)) === 'hold');
check('depart return: non-EXPEDITION kind is normal',
  AN.deriveDepartReturn(depRow({ kind: 'FORAGE', winPlanAction: null, day: 10 }, 10, 'normal', false)) === 'normal');
check('depart return: party_launch + no expedition is hold',
  AN.deriveDepartReturn(depRow({ kind: 'EXPEDITION', winPlanAction: 'party_launch', day: 10 }, 10, 'hold', false)) === 'hold');
check('depart return: party_launch + expedition is launch',
  AN.deriveDepartReturn(depRow({ kind: 'EXPEDITION', winPlanAction: 'party_launch', day: 10 }, 10, 'launch', true)) === 'launch');
check('depart return: plain EXPEDITION is launch even when blocked (expedAfter false)',
  AN.deriveDepartReturn(depRow({ kind: 'EXPEDITION', winPlanAction: null, day: 10 }, 10, 'launch', false)) === 'launch');
// Tick-gate derivation, in code order, with the two bypasses.
function snap(over) {
  return Object.assign({ dead: false, engaged: false, hasExped: false, profile: 'explorer',
    atHaven: true, night: false, indoorObj: false, danger: 0, trigger: false }, over || {});
}
const EXPED = { kind: 'EXPEDITION', winPlanAction: null, day: 10 };
const PARTY = { kind: 'EXPEDITION', winPlanAction: 'party_launch', day: 10 };
check('tick gate: all-pass is depart-reached',
  AN.deriveFirstTickGate(snap(), EXPED) === 'depart-reached' &&
  driver.deriveFirstTickGate(snap(), EXPED) === 'depart-reached');
check('tick gate: driver and analyzer agree on every gate',
  ['D-dead', 'D-engaged', 'D-already-out', 'D-profile', 'D-node', 'D-night', 'D-indoor', 'D-trigger', 'depart-reached'].every(function (g) {
    const s = { 'D-dead': snap({ dead: true }), 'D-engaged': snap({ engaged: true }),
      'D-already-out': snap({ hasExped: true }), 'D-profile': snap({ profile: 'forager' }),
      'D-node': snap({ atHaven: false }), 'D-night': snap({ night: true }),
      'D-indoor': snap({ indoorObj: true }), 'D-trigger': snap({ danger: 5, trigger: true }),
      'depart-reached': snap() }[g];
    // D-indoor needs a non-EXPEDITION commit: an EXPEDITION commit
    // bypasses the indoor gate by design (separate check below).
    const c = (g === 'D-indoor') ? { kind: 'FORAGE', winPlanAction: null, day: 10 } : EXPED;
    return AN.deriveFirstTickGate(s, c) === g && driver.deriveFirstTickGate(s, c) === g;
  }));
check('tick gate: party_launch bypasses the profile gate',
  AN.deriveFirstTickGate(snap({ profile: 'forager' }), PARTY) === 'depart-reached');
check('tick gate: EXPEDITION commit bypasses the indoor gate',
  AN.deriveFirstTickGate(snap({ indoorObj: true }), EXPED) === 'depart-reached');
check('tick gate: non-EXPEDITION commit does NOT bypass the indoor gate',
  AN.deriveFirstTickGate(snap({ indoorObj: true }), { kind: 'FORAGE', winPlanAction: null, day: 10 }) === 'D-indoor');
check('tick gate: gate order — dead beats engaged, engaged beats already-out, profile beats node',
  AN.deriveFirstTickGate(snap({ dead: true, engaged: true }), EXPED) === 'D-dead' &&
  AN.deriveFirstTickGate(snap({ engaged: true, hasExped: true }), EXPED) === 'D-engaged' &&
  AN.deriveFirstTickGate(snap({ profile: 'forager', atHaven: false }), EXPED) === 'D-profile');
check('tick gate: null snapshot is unknown-gate',
  AN.deriveFirstTickGate(null, EXPED) === 'unknown-gate');
// Companion-launch identification: the companion call sites are
// derived from the source, never hardcoded. A companion launch has
// no depart row of its own.
check('companion lines: derived from source, at least one companion call site',
  AN.companionLaunchLines().length >= 1, JSON.stringify(AN.companionLaunchLines()));
check('companion launch: companion-frame stack is a companion launch, inviter-frame stack is not',
  (function () {
    const compLine = AN.companionLaunchLines()[0];
    const compStack = '    at Object.vbrainExecuteDepart (src/js/villager-brain.js:' + compLine + ':14)';
    // The inviter call site: startExpedition(vid, ...) inside
    // vbrainExecuteDepart — read from the same file, independently.
    const srcLines = read('src/js/villager-brain.js').split('\n');
    let invLine = null;
    for (let i = 0; i < srcLines.length; i++) {
      if (/this\.startExpedition\(vid, hx, hy, announce, opts\)/.test(srcLines[i])) { invLine = i + 1; break; }
    }
    if (invLine == null) return false;
    const invStack = '    at Object.vbrainExecuteDepart (src/js/villager-brain.js:' + invLine + ':14)';
    return AN.isCompanionLaunch({ stackTop: compStack }) === true &&
      AN.isCompanionLaunch({ stackTop: invStack }) === false &&
      AN.isCompanionLaunch({ stackTop: '' }) === false &&
      AN.isCompanionLaunch(null) === false;
  })());
const stackBrain = '    at Object.vbrainExecuteDepart (/x/src/js/villager-brain.js:1044:9)\n    at Object.agencyTick (/x/src/js/villager-agency.js:439:11)';
const stackRandom = '    at Object.startExpedition (/x/src/js/villager-agency.js:468:5)\n    at Object.agencyTick (/x/src/js/villager-agency.js:453:11)';
check('origin: driver and analyzer agree (vbrain / random / unknown)',
  driver.deriveOrigin(stackBrain, true) === AN.deriveOrigin(stackBrain, true) &&
  driver.deriveOrigin(stackRandom, false) === AN.deriveOrigin(stackRandom, false) &&
  driver.deriveOrigin('', false) === AN.deriveOrigin('', false) &&
  AN.deriveOrigin(stackRandom, false) === 'random-agency');

// Synthetic ignition corpus: one villager-day per class, plus the
// excluded row. Days: F on day 12 (hash picks), the rest on day 10.
(function () {
  const GATE_HEALTHY = { dutyHolder: null, dutyName: null, health: 100, sick: false, maxDist: 3, medicineExists: false, campHealer: false, directed: false };
  const GATE_SICK = Object.assign({}, GATE_HEALTHY, { sick: true });
  function census(vid, day, over) {
    return Object.assign({ seq: 1, day: day, part: 0, vid: vid, name: vid.toUpperCase(), alive: true, away: false,
      engaged: false, atHaven: true, profile: 'explorer', hasExped: false, planStage: null, commit: null,
      objKind: 'idle', objState: 'idle' }, over || {});
  }
  function score(vid, day, over) {
    return Object.assign({ seq: 10, day: day, part: 0, vid: vid, name: vid.toUpperCase(), mode: 'lottery',
      pick: 'HAVEN_CHORE', corePick: 'HAVEN_CHORE', override: null, winPlanAction: null, pickSrc: 'objectives',
      candidates: [{ kind: 'HAVEN_CHORE', score: 3, vbrainSrc: null, winPlanAction: null, companion: null }],
      inputs: { profile: 'explorer', maxDist: 3, sick: false, potential: false, danger: 0, night: false, planStage: null, planNeedWave: null, poolDepth: 2 } }, over || {});
  }
  const synth = { bySeed: { 1: {
    seed: 1, scholarId: 'scholar1',
    censusRows: [
      census('f', 12, { profile: 'explorer' }),
      census('c', 10, { profile: 'explorer' }),
      census('d', 10, { profile: 'explorer' }),
      census('e', 10, { profile: 'explorer', planStage: 'hunt' }),
      census('b', 10, { profile: 'forager' }),
      census('g', 10, { profile: 'forager', planStage: 'party' }),
      census('h', 10, { profile: 'explorer' }),
      census('i', 10, { profile: 'explorer', objKind: 'FORAGE', objState: 'out' }),
      census('j', 10, { profile: 'explorer', away: true }),
      // k: companion consumption — holds her own party_launch commit,
      // gates all pass, but she is launched as someone else's companion
      // earlier in the same tick, so no depart row of her own exists.
      census('k', 10, { profile: 'explorer', planStage: 'party' }),
    ],
    scoreRows: [
      // F: soft candidate offered, hash picks (f/12 roll 0.0077 < 0.275).
      score('f', 12, { seq: 10, pick: 'EXPEDITION', override: 'expedition_hash',
        candidates: [{ kind: 'EXPEDITION', score: 0.55, vbrainSrc: 'agency_range', winPlanAction: null, companion: null },
          { kind: 'HAVEN_CHORE', score: 3, vbrainSrc: null, winPlanAction: null, companion: null }] }),
      // C-hash: soft candidate offered, indoor core, hash fails (c/10 roll 0.6156 >= 0.275).
      score('c', 10, { seq: 10, pick: 'HAVEN_CHORE', corePick: 'HAVEN_CHORE', override: null,
        candidates: [{ kind: 'EXPEDITION', score: 0.55, vbrainSrc: 'agency_range', winPlanAction: null, companion: null },
          { kind: 'HAVEN_CHORE', score: 3, vbrainSrc: null, winPlanAction: null, companion: null }] }),
      // D-trigger: soft candidate offered, hash picks (d/10 roll 0.0487 < 0.275).
      score('d', 10, { seq: 10, pick: 'EXPEDITION', override: 'expedition_hash',
        candidates: [{ kind: 'EXPEDITION', score: 0.55, vbrainSrc: 'agency_range', winPlanAction: null, companion: null },
          { kind: 'HAVEN_CHORE', score: 3, vbrainSrc: null, winPlanAction: null, companion: null }] }),
      // E-sick: party_launch candidate offered and picked.
      score('e', 10, { seq: 10, pick: 'EXPEDITION', override: 'win_plan:party_launch', winPlanAction: 'party_launch',
        candidates: [{ kind: 'EXPEDITION', score: 5, vbrainSrc: 'win_plan', winPlanAction: 'party_launch', companion: 'x' },
          { kind: 'HAVEN_CHORE', score: 3, vbrainSrc: null, winPlanAction: null, companion: null }],
        inputs: { profile: 'explorer', maxDist: 3, sick: false, potential: false, danger: 0, night: false, planStage: 'hunt', planNeedWave: 4, poolDepth: 1 } }),
      // B-profile: forager, no candidate.
      score('b', 10, { seq: 10, pick: 'FORAGE', corePick: 'FORAGE', override: null,
        inputs: { profile: 'forager', maxDist: 3, sick: false, potential: false, danger: 0, night: false, planStage: null, planNeedWave: null, poolDepth: 0 } }),
      // B-profile with party-wait plan context: forager in party stage
      // with an empty pool — the fired gate is PROFILE (no soft
      // candidate can be offered), the party_wait is context, not the
      // gate. (An explorer here WOULD be offered the soft candidate,
      // so the old expignite fixture — explorer + party-wait, no soft
      // candidate — was impossible under the code.)
      score('g', 10, { seq: 10, pick: 'HAVEN_CHORE', corePick: 'HAVEN_CHORE', override: 'win_plan:party_wait', winPlanAction: 'party_wait',
        candidates: [{ kind: 'HAVEN_CHORE', score: 4, vbrainSrc: 'win_plan', winPlanAction: 'party_wait', companion: null },
          { kind: 'HAVEN_CHORE', score: 3, vbrainSrc: null, winPlanAction: null, companion: null }],
        inputs: { profile: 'forager', maxDist: 3, sick: false, potential: false, danger: 0, night: false, planStage: 'party', planNeedWave: 4, poolDepth: 0 } }),
      // k: party_launch candidate offered and picked (her own commit);
      // she never departs on it — consumed as a companion instead.
      score('k', 10, { seq: 10, pick: 'EXPEDITION', override: 'win_plan:party_launch', winPlanAction: 'party_launch',
        candidates: [{ kind: 'EXPEDITION', score: 5, vbrainSrc: 'win_plan', winPlanAction: 'party_launch', companion: 'x' },
          { kind: 'HAVEN_CHORE', score: 3, vbrainSrc: null, winPlanAction: null, companion: null }],
        inputs: { profile: 'explorer', maxDist: 3, sick: false, potential: false, danger: 0, night: false, planStage: 'party', planNeedWave: 4, poolDepth: 1 } }),
      // h: no score rows (gate day instead). i: no rows at all (A).
    ],
    gateRows: [
      { seq: 11, day: 10, part: 0, vid: 'h', name: 'H', kind: 'REST', gateId: 'low_energy' },
    ],
    departRows: [
      { seq: 20, day: 12, part: 0, vid: 'f', name: 'F', commit: { kind: 'EXPEDITION', winPlanAction: null, companion: null, companion2: null, day: 12 }, ret: 'launch', expedAfter: true, expedTx: 5, expedTy: 5 },
      { seq: 20, day: 10, part: 0, vid: 'e', name: 'E', commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', companion2: null, day: 10 }, ret: 'hold', expedAfter: false, expedTx: null, expedTy: null },
    ],
    tickRows: [
      { seq: 15, day: 12, part: 0, vid: 'f', commit: { kind: 'EXPEDITION', winPlanAction: null, companion: null, day: 12 },
        gates: { dead: false, engaged: false, hasExped: false, profile: 'explorer', atHaven: true, night: false, indoorObj: false, danger: 0, trigger: false } },
      { seq: 15, day: 10, part: 0, vid: 'd', commit: { kind: 'EXPEDITION', winPlanAction: null, companion: null, day: 10 },
        gates: { dead: false, engaged: false, hasExped: false, profile: 'explorer', atHaven: true, night: false, indoorObj: false, danger: 5, trigger: true } },
      { seq: 15, day: 10, part: 0, vid: 'e', commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', day: 10 },
        gates: { dead: false, engaged: false, hasExped: false, profile: 'explorer', atHaven: true, night: false, indoorObj: false, danger: 0, trigger: false } },
      // k: gates all pass at part 1, but no depart row — consumed as a
      // companion in the same tick (see the launch row below).
      { seq: 15, day: 10, part: 1, vid: 'k', commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', day: 10 },
        gates: { dead: false, engaged: false, hasExped: false, profile: 'explorer', atHaven: true, night: false, indoorObj: false, danger: 0, trigger: false } },
    ],
    launches: [
      { seq: 21, day: 12, part: 0, vid: 'f', name: 'F', profile: 'explorer', hx: 4, hy: 4, node: { nx: 4, ny: 4 },
        optsTx: null, optsTy: null, optsDuration: null, hasOpts: false, stackTop: stackBrain, origin: 'vbrain-party_launch',
        plan: null, dawnCommit: { kind: 'EXPEDITION', winPlanAction: null, companion: null, day: 12 },
        xpAtLaunch: { tracking: 0, survival: 0 },
        candidate: { vid: 'f', name: 'F', isDuty: false }, dutyHolder: { vid: null, name: null },
        gate: GATE_HEALTHY, pool: [], poolDepth: 0, overwrote: null,
        landed: true, blockReason: null, exped: { tx: 5, ty: 5, dist: 2, duration: 13, sinceDay: 12, sincePart: 0 } },
      { seq: 21, day: 10, part: 0, vid: 'e', name: 'E', profile: 'explorer', hx: 4, hy: 4, node: { nx: 4, ny: 4 },
        optsTx: 5, optsTy: 5, optsDuration: 13, hasOpts: true, stackTop: stackBrain, origin: 'vbrain-party_launch',
        plan: { stage: 'hunt', target: 'x', node: { nx: 5, ny: 5 }, needWave: 4 },
        dawnCommit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', day: 10 },
        xpAtLaunch: { tracking: 0, survival: 0 },
        candidate: { vid: 'e', name: 'E', isDuty: false }, dutyHolder: { vid: null, name: null },
        gate: Object.assign({}, GATE_SICK, { directed: true }), pool: [], poolDepth: 0, overwrote: null,
        landed: false, blockReason: 'sick', exped: null },
      // k: companion launch — the stack names the companion call site
      // (derived from source), and there is no depart row for k.
      { seq: 21, day: 10, part: 1, vid: 'k', name: 'K', profile: 'explorer', hx: 4, hy: 4, node: { nx: 4, ny: 4 },
        optsTx: 5, optsTy: 5, optsDuration: 13, hasOpts: true,
        stackTop: '    at Object.vbrainExecuteDepart (src/js/villager-brain.js:' + AN.companionLaunchLines()[0] + ':14)\n    at Object.agencyTick (src/js/villager-agency.js:439:31)',
        origin: 'vbrain-party_launch',
        plan: { stage: 'party', target: 'x', node: { nx: 5, ny: 5 }, needWave: 4 },
        dawnCommit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', day: 10 },
        xpAtLaunch: { tracking: 0, survival: 0 },
        candidate: { vid: 'k', name: 'K', isDuty: false }, dutyHolder: { vid: null, name: null },
        gate: Object.assign({}, GATE_HEALTHY, { directed: true }), pool: [], poolDepth: 0, overwrote: null,
        landed: true, blockReason: null, exped: { tx: 5, ty: 5, dist: 2, duration: 13, sinceDay: 10, sincePart: 1 } },
    ],
    returns: [
      { day: 15, part: 1, vid: 'f', exped: { sinceDay: 12, sincePart: 0, legs: 12, finds: [{ kcal: 100 }], encounters: [], meat: [] }, clockParts: 13, legs: 12, findsKcal: 100, pantryBefore: 1000, pantryAfter: 1100 },
      { day: 13, part: 1, vid: 'k', exped: { sinceDay: 10, sincePart: 1, legs: 12, finds: [{ kcal: 50 }], encounters: [], meat: [] }, clockParts: 12, legs: 12, findsKcal: 50, pantryBefore: 1000, pantryAfter: 1050 },
    ],
    expedDeaths: [], openExped: [],
    dailySig: [], deaths: [], instrumentErrors: [],
    havenRows: [
      { seq: 1, day: 10, part: 0, vid: 'e', profile: 'explorer', foughtN: 1, slainN: 1, storeBefore: true, planBefore: null, planAfter: 'hunt', created: true },
      { seq: 2, day: 10, part: 0, vid: 'k', profile: 'explorer', foughtN: 0, slainN: 1, storeBefore: true, planBefore: null, planAfter: 'party', created: true },
    ],
    v4creates: [
      { day: 10, vid: 'e', creator: 'havenTick', source: 'both', profile: 'explorer', stageAfter: 'hunt', target: 'x', needWave: 4, foughtN: 1, slainN: 1, caller: null },
      { day: 10, vid: 'k', creator: 'havenTick', source: 'heard', profile: 'explorer', stageAfter: 'party', target: 'x', needWave: 4, foughtN: 0, slainN: 1, caller: null },
      { day: 10, vid: 'g', creator: 'world-tick', source: null, profile: 'forager', stageAfter: 'party', target: 'x', needWave: 3, foughtN: null, slainN: null, caller: null },
    ],
    v4seeds: [],
    storeInitRows: [
      { day: 10, vid: 'e', creator: 'noteKill', source: 'noteKill', wave: 3, mid: 'x' },
    ],
    storeExistsFinal: true,
    winPlanStats: { planSeeds: 3 },
  } } };
  const ign = AN.classifyIgnition(synth);
  const byVid = {};
  for (const r of ign.dayClasses) byVid[r.vid + '|' + r.day] = r;
  check('synthetic: F launched (f/12, hash-picked, depart launch, landed)',
    byVid['f|12'] && byVid['f|12'].cls === 'F', JSON.stringify(byVid['f|12']));
  check('synthetic: C-hash (c/10, soft candidate, indoor core, hash failed)',
    byVid['c|10'] && byVid['c|10'].cls === 'C' && byVid['c|10'].sub === 'hash', JSON.stringify(byVid['c|10']));
  check('synthetic: D-trigger (d/10, commit held, danger gate)',
    byVid['d|10'] && byVid['d|10'].cls === 'D' && byVid['d|10'].sub === 'D-trigger', JSON.stringify(byVid['d|10']));
  check('synthetic: E-sick (e/10, party_launch blocked by sickness)',
    byVid['e|10'] && byVid['e|10'].cls === 'E' && byVid['e|10'].sub === 'sick', JSON.stringify(byVid['e|10']));
  check('synthetic: B-profile (b/10, forager, no candidate)',
    byVid['b|10'] && byVid['b|10'].cls === 'B' && byVid['b|10'].sub === 'profile', JSON.stringify(byVid['b|10']));
  check('synthetic: B-profile with party-wait plan context (g/10, forager, party stage, empty pool — fired gate is profile, plan is context)',
    byVid['g|10'] && byVid['g|10'].cls === 'B' && byVid['g|10'].sub === 'profile' &&
    byVid['g|10'].detail && byVid['g|10'].detail.gate === 'profile' &&
    byVid['g|10'].detail.planCtx && byVid['g|10'].detail.planCtx.planStage === 'party' &&
    byVid['g|10'].detail.planCtx.partyWait === true, JSON.stringify(byVid['g|10']));
  check('synthetic: B-gate (h/10, REST/low_energy pre-empted the lottery)',
    byVid['h|10'] && byVid['h|10'].cls === 'B' && byVid['h|10'].sub === 'gate-low_energy', JSON.stringify(byVid['h|10']));
  check('synthetic: A-mid-errand (i/10, no score, objective still live)',
    byVid['i|10'] && byVid['i|10'].cls === 'A' && byVid['i|10'].sub === 'mid-errand', JSON.stringify(byVid['i|10']));
  check('synthetic: F via companion consumption (k/10, own commit, gates pass, no depart row — launched as companion)',
    byVid['k|10'] && byVid['k|10'].cls === 'F', JSON.stringify(byVid['k|10']));
  check('synthetic: companion consumption is recorded, not a mismatch (1 explained tick)',
    ign.companionConsumed.length === 1 && ign.companionConsumed[0].vid === 'k' && ign.companionConsumed[0].day === 10 && ign.companionConsumed[0].part === 1,
    JSON.stringify(ign.companionConsumed));
  check('synthetic: away villager excluded (j/10), denominator is 9 days',
    ign.dayClasses.length === 9 && ign.excluded.away === 1, 'days=' + ign.dayClasses.length + ' excluded=' + JSON.stringify(ign.excluded));
  check('synthetic: 0 mismatches, 0 unknowns on the clean corpus',
    ign.mismatches.length === 0 && ign.unknowns.length === 0,
    'mismatches=' + JSON.stringify(ign.mismatches) + ' unknowns=' + JSON.stringify(ign.unknowns));
  // Medicduty launch classification still agrees on the synthetic rows.
  const launchCls = MED.classifyLeg(synth);
  check('synthetic: medicduty leg classifies the F trips complete + the E block sick',
    launchCls.trips.length === 2 && launchCls.trips.every(function (t) { return t.status === 'complete'; }) &&
    launchCls.blockedAttempts === 1 && launchCls.blockedByReason.sick === 1 &&
    launchCls.mismatches.length === 0 && launchCls.unknowns.length === 0,
    'trips=' + launchCls.trips.length + ' blocked=' + JSON.stringify(launchCls.blockedByReason) +
    ' mismatches=' + JSON.stringify(launchCls.mismatches) + ' unknowns=' + JSON.stringify(launchCls.unknowns));
  // Tamper detection (D3): a stored depart return that disagrees with
  // the commit, a tick gate that disagrees with the depart row, and a
  // soft-candidate weight that disagrees with the inputs.
  const t1 = JSON.parse(JSON.stringify(synth));
  t1.bySeed[1].departRows[0].ret = 'normal';
  const ignT1 = AN.classifyIgnition(t1);
  check('D3 tamper: stored depart return disagreeing with the commit is flagged',
    ignT1.mismatches.length === 1 && ignT1.mismatches[0].kind === 'depart-return' &&
    ignT1.mismatches[0].stored === 'normal' && ignT1.mismatches[0].rederived === 'launch',
    JSON.stringify(ignT1.mismatches));
  const t2 = JSON.parse(JSON.stringify(synth));
  t2.bySeed[1].tickRows[1].gates.danger = 0;
  t2.bySeed[1].tickRows[1].gates.trigger = false;
  const ignT2 = AN.classifyIgnition(t2);
  check('D3 tamper: tick gate disagreeing with the missing depart row is flagged',
    ignT2.mismatches.length === 1 && ignT2.mismatches[0].kind === 'tick-depart' &&
    ignT2.mismatches[0].rederived === 'depart-reached',
    JSON.stringify(ignT2.mismatches));
  const t3 = JSON.parse(JSON.stringify(synth));
  t3.bySeed[1].scoreRows[1].candidates[0].score = 0.28;
  const ignT3 = AN.classifyIgnition(t3);
  check('D3 tamper: stored soft-candidate weight disagreeing with the inputs is flagged',
    ignT3.mismatches.length === 1 && ignT3.mismatches[0].kind === 'soft-weight' &&
    ignT3.mismatches[0].stored === 0.28 && ignT3.mismatches[0].rederived === 0.55,
    JSON.stringify(ignT3.mismatches));
  // Code-order B-gate: profile beats night beats trigger beats range
  // beats sick; all-pass is soft-should-offer.
  check('code-order gate: profile first, then night, trigger, range, sick',
    AN.codeOrderGate({ profile: 'forager', night: true, danger: 5, maxDist: 0, sick: true }) === 'profile' &&
    AN.codeOrderGate({ profile: 'explorer', night: true, danger: 5, maxDist: 0, sick: true }) === 'night' &&
    AN.codeOrderGate({ profile: 'explorer', night: false, danger: 5, maxDist: 0, sick: true }) === 'trigger' &&
    AN.codeOrderGate({ profile: 'explorer', night: false, danger: 0, maxDist: 0, sick: true }) === 'range' &&
    AN.codeOrderGate({ profile: 'explorer', night: false, danger: 0, maxDist: 3, sick: true }) === 'sick' &&
    AN.codeOrderGate({ profile: 'explorer', night: false, danger: 0, maxDist: 3, sick: false }) === 'soft-should-offer');
  check('plan context: stage + pool + hold flags, never the fired gate',
    (function () {
      const ctx = AN.planCtxOf({ inputs: { planStage: 'party', poolDepth: 0 },
        candidates: [{ kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' }] });
      return ctx.planStage === 'party' && ctx.poolDepth === 0 && ctx.partyWait === true &&
        ctx.gearHold === false && ctx.veteranGuard === false;
    })());
  // Hash stats on the clean synthetic corpus: 3 soft rows (f/c/d),
  // all consulted (indoor core, no override on c, hash override on
  // f/d), 2 passed, 1 failed, 0 mismatches.
  const hashSynth = AN.deriveHashStats(synth);
  check('hash stats: 3 soft rows, 3 consulted, 2 passed, 1 failed, 0 mismatches',
    hashSynth.totals.softRows === 3 && hashSynth.totals.consulted === 3 &&
    hashSynth.totals.passed === 2 && hashSynth.totals.failed === 1 &&
    hashSynth.mismatches.length === 0,
    JSON.stringify(hashSynth.totals) + ' mismatches=' + JSON.stringify(hashSynth.mismatches));
  // Store decomposition on the clean synthetic corpus: store
  // initialized day 10 by noteKill, 2 havenTick + 1 world-tick
  // creations, all three holders traced, 0 mismatches, 0 unknowns.
  const storeSynth = AN.decomposeStore(synth);
  check('store decomp: init day 10 via noteKill, 2 havenTick + 1 world-tick creates, ledger clean',
    storeSynth.perSeed.length === 1 && storeSynth.perSeed[0].storeEverInit === true &&
    storeSynth.perSeed[0].firstInitDay === 10 && storeSynth.perSeed[0].firstInitCreator === 'noteKill' &&
    storeSynth.perSeed[0].createsByCreator.havenTick === 2 &&
    storeSynth.perSeed[0].createsByCreator['world-tick'] === 1 &&
    storeSynth.perSeed[0].firstPlanDay === 10 &&
    storeSynth.mismatches.length === 0 && storeSynth.unknowns.length === 0,
    JSON.stringify(storeSynth.perSeed[0]) + ' mismatches=' + JSON.stringify(storeSynth.mismatches) +
    ' unknowns=' + JSON.stringify(storeSynth.unknowns));
  // Tamper t4: drop the soft candidate from the C-hash row — the
  // inputs all pass, so the day must flag soft-should-offer.
  const t4 = JSON.parse(JSON.stringify(synth));
  t4.bySeed[1].scoreRows[1].candidates = t4.bySeed[1].scoreRows[1].candidates.filter(function (c) { return c.kind !== 'EXPEDITION'; });
  const ignT4 = AN.classifyIgnition(t4);
  check('D3 tamper: soft candidate missing while every gate passes is flagged',
    ignT4.mismatches.length === 1 && ignT4.mismatches[0].kind === 'soft-should-offer',
    JSON.stringify(ignT4.mismatches));
  // Tamper t5: drop k's creation row — the ledger check must flag the
  // holder with no creation.
  const t5 = JSON.parse(JSON.stringify(synth));
  t5.bySeed[1].v4creates = t5.bySeed[1].v4creates.filter(function (cr) { return cr.vid !== 'k'; });
  const storeT5 = AN.decomposeStore(t5);
  check('D3 tamper: plan holder with no creation row is flagged by the ledger check',
    storeT5.unknowns.length === 1 && storeT5.unknowns[0].vid === 'k',
    JSON.stringify(storeT5.unknowns));
  // Fixture t6: a store-never-initialized seed — census store false,
  // no init rows, no creates — must read storeEverInit false even
  // though storeExistsFinal is (contaminated) true, and the engaged
  // store-missing havenTick call must be counted.
  const t6 = { bySeed: { 2: {
    seed: 2, scholarId: 'scholar2',
    censusRows: [
      census('x', 10, { profile: 'explorer', winPlanStoreExists: false, knowFoughtN: 1, villageSlainN: 2 }),
      census('x', 11, { profile: 'explorer', winPlanStoreExists: false, knowFoughtN: 1, villageSlainN: 2 }),
    ],
    scoreRows: [], gateRows: [], departRows: [], tickRows: [], launches: [],
    returns: [], expedDeaths: [], openExped: [], dailySig: [], deaths: [], instrumentErrors: [],
    havenRows: [
      { seq: 1, day: 10, part: 0, vid: 'x', profile: 'explorer', foughtN: 1, slainN: 2, storeBefore: false, planBefore: null, planAfter: null, created: false },
    ],
    v4creates: [], v4seeds: [], storeInitRows: [],
    storeExistsFinal: true, winPlanStats: null,
  } } };
  const storeT6 = AN.decomposeStore(t6);
  check('store decomp: never-initialized seed reads storeEverInit false despite storeExistsFinal true, engaged store-missing counted',
    storeT6.perSeed.length === 1 && storeT6.perSeed[0].storeEverInit === false &&
    storeT6.perSeed[0].firstInitDay == null && storeT6.perSeed[0].firstInitCreator == null &&
    storeT6.perSeed[0].engagedStoreMissing === 1 && storeT6.perSeed[0].firstSlainDay === 10 &&
    storeT6.perSeed[0].firstFoughtDay === 10 &&
    storeT6.mismatches.length === 0 && storeT6.unknowns.length === 0,
    JSON.stringify(storeT6.perSeed[0]));
})();

// ---------- live runs + determinism legs D1/D2 ----------
console.log('== live runs + determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60' }, envExtra || {});
  const script = "const d=require('./scripts/zeroattempt-driver-20261116.js');" +
    "d.oneRun(103201).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,dailySig:o.dailySig};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
(async function () {
  try {
    // 5d live-shape run (in a child — never two harnesses in one process).
    const shortEnv = Object.assign({}, process.env, { DAYS: '5' });
    const shortScript = "const d=require('./scripts/zeroattempt-driver-20261116.js');" +
      "d.oneRun(103201).then(function(o){console.log(JSON.stringify(o));}).catch(function(e){console.error(e.stack);process.exit(1);});";
    const shortOut = JSON.parse(execFileSync('node', ['-e', shortScript], { cwd: REPO, env: shortEnv, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).trim());
    check('live 5d run completes with 0 instrument errors', shortOut.instrumentErrors.length === 0, JSON.stringify(shortOut.instrumentErrors.slice(0, 3)));
    check('live 5d run carries score/gate/depart/tick/census rows',
      (shortOut.scoreRows || []).length > 0 && (shortOut.departRows || []).length > 0 &&
      (shortOut.tickRows || []).length >= 0 && (shortOut.censusRows || []).length > 0,
      'score=' + (shortOut.scoreRows || []).length + ' gate=' + (shortOut.gateRows || []).length +
      ' depart=' + (shortOut.departRows || []).length + ' tick=' + (shortOut.tickRows || []).length +
      ' census=' + (shortOut.censusRows || []).length);
    check('live 5d run carries havenRows (every havenTick call) + creation ledger rows',
      (shortOut.havenRows || []).length > 0 && Array.isArray(shortOut.v4creates) &&
      Array.isArray(shortOut.v4seeds) && Array.isArray(shortOut.storeInitRows),
      'haven=' + (shortOut.havenRows || []).length + ' creates=' + (shortOut.v4creates || []).length +
      ' seeds=' + (shortOut.v4seeds || []).length + ' inits=' + (shortOut.storeInitRows || []).length);
    check('live 5d run carries launches/returns/dailySig arrays', Array.isArray(shortOut.launches) && Array.isArray(shortOut.returns) && Array.isArray(shortOut.dailySig));
    check('live 5d run policy sha is competent verbatim (df9b7dff4de4)', shortOut.policySha === 'df9b7dff4de4', 'got ' + shortOut.policySha);
    check('live 5d run records the scholar id', typeof shortOut.scholarId === 'string' && shortOut.scholarId.length > 0, JSON.stringify(shortOut.scholarId));
    console.log('  info: live 5d run score=' + (shortOut.scoreRows || []).length +
      ' gate=' + (shortOut.gateRows || []).length + ' depart=' + (shortOut.departRows || []).length +
      ' tick=' + (shortOut.tickRows || []).length + ' census=' + (shortOut.censusRows || []).length +
      ' haven=' + (shortOut.havenRows || []).length + ' creates=' + (shortOut.v4creates || []).length +
      ' launches=' + shortOut.launches.length + ' days=' + shortOut.days);
    const badScore = (shortOut.scoreRows || []).find(function (r) {
      return !(r && typeof r.day === 'number' && typeof r.vid === 'string' && typeof r.pick === 'string' &&
        Array.isArray(r.candidates) && r.inputs && typeof r.inputs.profile === 'string');
    });
    check('score rows have their shape (day/vid/pick/candidates/inputs.profile)', !badScore, badScore ? JSON.stringify(badScore).slice(0, 300) : '');
    const badDepart = (shortOut.departRows || []).find(function (r) {
      return !(r && typeof r.day === 'number' && typeof r.vid === 'string' && typeof r.ret === 'string' &&
        typeof r.expedAfter === 'boolean');
    });
    check('depart rows have their shape (day/vid/ret/expedAfter)', !badDepart, badDepart ? JSON.stringify(badDepart).slice(0, 300) : '');
    const badCand = (shortOut.scoreRows || []).reduce(function (acc, r) {
      if (acc) return acc;
      return (r.candidates || []).find(function (c) {
        return !(c && typeof c.kind === 'string' &&
          ('dutyTask' in c) && ('assignTask' in c) && ('chore' in c));
      }) || null;
    }, null);
    check('candidate rows carry dutyTask/assignTask/chore', !badCand, badCand ? JSON.stringify(badCand).slice(0, 300) : '');
    const badHaven = (shortOut.havenRows || []).find(function (r) {
      return !(r && typeof r.day === 'number' && typeof r.vid === 'string' &&
        typeof r.storeBefore === 'boolean' && typeof r.created === 'boolean');
    });
    check('haven rows have their shape (day/vid/storeBefore/created)', !badHaven, badHaven ? JSON.stringify(badHaven).slice(0, 300) : '');
    const badCensus = (shortOut.censusRows || []).find(function (r) {
      return !(r && typeof r.day === 'number' && typeof r.vid === 'string' && typeof r.alive === 'boolean' &&
        typeof r.atHaven === 'boolean' && typeof r.away === 'boolean');
    });
    check('census rows have their shape (day/vid/alive/atHaven/away)', !badCensus, badCensus ? JSON.stringify(badCensus).slice(0, 300) : '');
    const badCensusNew = (shortOut.censusRows || []).find(function (r) {
      return !(('winPlanStoreExists' in r) && ('knowFoughtN' in r) && ('villageSlainN' in r) && ('assignedTask' in r));
    });
    check('census rows carry winPlanStoreExists/knowFoughtN/villageSlainN/assignedTask', !badCensusNew,
      badCensusNew ? JSON.stringify(badCensusNew).slice(0, 300) : '');

    const a = childFingerprint({});
    const b = childFingerprint({});
    check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
      JSON.stringify(a.full) === JSON.stringify(b.full));
    const off = childFingerprint({ ZEROATTEMPT_RECORDER: 'off', MODE: 'off' });
    check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
      JSON.stringify(a.fp) === JSON.stringify(off.fp),
      'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
    check('D2 recorder-off run carries empty ignition rows',
      (off.full.scoreRows || []).length === 0 && (off.full.gateRows || []).length === 0 &&
      (off.full.departRows || []).length === 0 && (off.full.tickRows || []).length === 0 &&
      (off.full.censusRows || []).length === 0 && (off.full.launches || []).length === 0 &&
      (off.full.havenRows || []).length === 0 && (off.full.v4creates || []).length === 0 &&
      (off.full.v4seeds || []).length === 0 && (off.full.storeInitRows || []).length === 0);
    check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
    // D3 on live rows: every live ignition row re-derives cleanly.
    const liveIgn = AN.classifyIgnition({ bySeed: { 103201: a.full } });
    const liveLaunch = MED.classifyLeg({ bySeed: { 103201: a.full } });
    check('D3 live: 0 ignition mismatches on the 60d run', liveIgn.mismatches.length === 0, JSON.stringify(liveIgn.mismatches.slice(0, 2)));
    check('D3 live: 0 ignition unknowns on the 60d run', liveIgn.unknowns.length === 0, JSON.stringify(liveIgn.unknowns.slice(0, 2)));
    check('D3 live: 0 launch mismatches/unknowns on the 60d run', liveLaunch.mismatches.length === 0 && liveLaunch.unknowns.length === 0,
      'mismatches=' + JSON.stringify(liveLaunch.mismatches.slice(0, 2)) + ' unknowns=' + JSON.stringify(liveLaunch.unknowns.slice(0, 2)));
    // D3 live: hash consistency + store ledger on the same 60d run.
    const liveSum = AN.summarizeIgnition({ bySeed: { 103201: a.full } }, liveIgn);
    check('D3 live: 0 hash mismatches on the 60d run', liveSum.hashStats.mismatches.length === 0,
      JSON.stringify(liveSum.hashStats.mismatches.slice(0, 2)));
    check('D3 live: 0 store mismatches/unknowns on the 60d run',
      liveSum.storeStats.mismatches.length === 0 && liveSum.storeStats.unknowns.length === 0,
      'mismatches=' + JSON.stringify(liveSum.storeStats.mismatches.slice(0, 2)) +
      ' unknowns=' + JSON.stringify(liveSum.storeStats.unknowns.slice(0, 2)));
    check('D3 live: havenRows carry storeBefore flags on the 60d run',
      (a.full.havenRows || []).length > 0 &&
      (a.full.havenRows || []).every(function (r) { return typeof r.storeBefore === 'boolean'; }),
      'havenRows=' + (a.full.havenRows || []).length);
    console.log('  info: D1 60d run recorded ' + (a.full.scoreRows || []).length + ' scores, ' +
      (a.full.departRows || []).length + ' departs, ' + (a.full.tickRows || []).length + ' tick rows, ' +
      (a.full.censusRows || []).length + ' census rows, ' + (a.full.havenRows || []).length + ' haven rows, ' +
      (a.full.v4creates || []).length + ' creates, ' + (a.full.launches || []).length + ' launches; ' +
      'live classes: ' + JSON.stringify(liveIgn.classCounts) +
      '; hash: ' + JSON.stringify(liveSum.hashStats.totals) +
      '; store: ' + JSON.stringify(liveSum.storeStats.perSeed[0] ? { init: liveSum.storeStats.perSeed[0].storeEverInit, firstInitDay: liveSum.storeStats.perSeed[0].firstInitDay } : null));
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
