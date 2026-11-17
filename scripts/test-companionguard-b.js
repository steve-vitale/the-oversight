// test-companionguard-b.js — proof, arm sim-companionguard-b
// (BUILD: the companion call clobbers a live expedition — findings
// backlog #2462). Extends test-medicduty-b.js: static checks (the
// guard's scope is exactly villager-agency.js + villager-brain.js,
// wraps named, code-read anchors by function name), analyzer fixture
// checks (block-reason derivation in true gate order, candidate-duty
// re-derivation, guard-skip re-derivation, party-launch grouping,
// starvation counting, re-pick table, starved-seed verdict,
// pool-depth stats, tamper detection), live unit scenarios on a real
// game (already-out villager skipped incl. the same-part case,
// not-out villager taken, guard OFF overwrites as before), live-shape
// checks on a 5d run, and determinism legs D1 (recorder ON twice,
// 60d, identical full corpus) + D2 (recorder ON vs OFF, 60d,
// identical daily trajectory signatures + wall fields) + D3 (analyzer
// re-derivation on synthetic + live rows, mismatch 0).
// Usage: node scripts/test-companionguard-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'companionguard-driver-20261116.js'));
const AN = require(path.join(REPO, 'scripts', 'analyze-companionguard-b.js'));

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
// 1. The guard's src/ scope is EXACTLY villager-agency.js (the
// guard) + villager-brain.js (the mirror's plan-record honesty).
// Nothing else in src/ may change on this arm. Measured as the diff
// against the FROZEN PREREG commit (35ba8eb58), not the worktree
// status: the arm lands in two commits (guard + proof, then the GO
// gate removal), and the scope check must pass at both — after the
// first commit the worktree status is clean, after the gate removal
// only agency.js is dirty, but the arm's cumulative src/ change is
// still exactly these two files either way.
let srcStatus = null, srcErr = null;
try { srcStatus = gitStatusWithRetry('diff --name-only 35ba8eb58 -- src/'); }
catch (e) { srcErr = String((e && e.message) || e).slice(0, 120); }
check('game-code change touches only villager-agency.js + villager-brain.js', (function () {
  if (srcStatus === null) return false;
  const files = srcStatus.split('\n').filter(Boolean);
  return files.length === 2 && files.indexOf('src/js/villager-agency.js') !== -1 &&
    files.indexOf('src/js/villager-brain.js') !== -1;
})(), srcErr || JSON.stringify(srcStatus));
const agencySrc = read('src/js/villager-agency.js');
const brainSrc = read('src/js/villager-brain.js');
// GO 2026-11-16: the env gate was REMOVED — the guard ships
// unconditional. No COMPANIONGUARD env READ may remain in the guard
// (the arm name may still appear in comments).
check('guard: startExpedition reads NO COMPANIONGUARD env — the guard ships unconditional', agencySrc.indexOf('process.env.COMPANIONGUARD') === -1);
check('guard: startExpedition returns early when a live expedition record exists for the villager',
  agencySrc.indexOf('st.exped[vid]') !== -1 &&
  agencySrc.indexOf('companionGuardSkips') !== -1);
check('guard: the early return sits before gear-up (a skipped companion burns no gear or care)',
  (function () {
    const g = agencySrc.indexOf('companionGuardSkips');
    const gear = agencySrc.indexOf('villagerGearUp(vid, true)');
    return g !== -1 && gear !== -1 && g < gear;
  })());
check('guard: startExpedition is still the only writer of the live expedition record',
  (agencySrc.match(/st\.exped\[vid\] = \{/g) || []).length === 1 &&
  (brainSrc.match(/exped\[vid\] = \{/g) || []).length === 0);
check('mirror: vbrainExecuteDepart verifies the companion actually launched before recording them',
  brainSrc.indexOf('vbrainExecuteDepart: function (vid, hx, hy, announce)') !== -1 &&
  brainSrc.indexOf('a2c.exped') !== -1);
check('mirror: the companion plan advances only when the companion launched',
  brainSrc.indexOf("launched.indexOf(c.companion) !== -1") !== -1);
// 2. Driver shape.
const driverSrc = read('scripts/companionguard-driver-20261116.js');
check('driver wraps startExpedition', driverSrc.indexOf('Game.startExpedition = function') !== -1);
check('driver wraps expeditionReturn', driverSrc.indexOf('Game.expeditionReturn = function') !== -1);
check('driver wraps expedDeath', driverSrc.indexOf('Game.expedDeath = function') !== -1);
check('driver has COMPANIONGUARD_RECORDER off-switch', driverSrc.indexOf('COMPANIONGUARD_RECORDER') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records launch-time plan snapshot via a pure read (never Game.winPlanOf — it creates state)', driverSrc.indexOf('planOfRaw(Game, vid)') !== -1 && driverSrc.indexOf('Game.winPlanOf') === -1);
check('driver never calls the state-creating agencyOf/agencyState in wraps', driverSrc.indexOf('Game.agencyOf') === -1 && driverSrc.indexOf('Game.agencyState') === -1);
check('driver records the call stack for origin', driverSrc.indexOf('new Error().stack') !== -1);
check('driver derives origin win-plan before agency (order matters)', (function () {
  const a = driverSrc.indexOf("stack.indexOf('win-plan.js')");
  const b = driverSrc.indexOf("stack.indexOf('villager-agency.js')");
  return a !== -1 && b !== -1 && a < b;
})());
check('driver clones the exped record before the return runs', driverSrc.indexOf('cloneExped') !== -1 && driverSrc.indexOf('expeditionReturn-pre') !== -1);
check('driver records a daily trajectory signature on both legs', driverSrc.indexOf('dailySig.push') !== -1);
// 2b. Medic-duty extension shape.
check('driver snapshots the gate BEFORE the original call (heal check can patch)', driverSrc.indexOf('gate = gateSnapshot(Game, vid, hasOpts)') !== -1 &&
  driverSrc.indexOf('gateSnapshot(Game, vid, hasOpts)') < driverSrc.indexOf('origStart.apply'));
check('driver computes the launch-eligible non-duty pool per attempt', driverSrc.indexOf('launchEligiblePool(Game, vid, gate)') !== -1 &&
  driverSrc.indexOf('poolDepth') !== -1);
check('driver derives the block reason from the pre-call gate in true order', driverSrc.indexOf('deriveBlockReasonFromGate(gate, vid)') !== -1);
check('driver records the dawn-brain candidate with isDuty + duty holder', driverSrc.indexOf('candidate: { vid: vid, name: name, isDuty') !== -1 &&
  driverSrc.indexOf('dutyHolder: gate ?') !== -1);
check('driver gate order: medic-duty before hurt-no-care before sick before range', (function () {
  const a = driverSrc.indexOf("if (!gate.directed && gate.dutyHolder");
  const b = driverSrc.indexOf("gate.health != null && gate.health < 70");
  const c = driverSrc.indexOf("if (gate.sick) return 'sick'");
  const d = driverSrc.indexOf("gate.maxDist != null && gate.maxDist < 1");
  return a !== -1 && b !== -1 && c !== -1 && d !== -1 && a < b && b < c && c < d;
})());
check('driver pool excludes the candidate, the scholar, the duty holder, the away, the sick, the hurt-without-care',
  driverSrc.indexOf('if (!id || id === vid) continue') !== -1 &&
  driverSrc.indexOf('if (id === Game.villagerId) continue') !== -1 &&
  driverSrc.indexOf('if (gate && gate.dutyHolder && id === gate.dutyHolder) continue') !== -1 &&
  driverSrc.indexOf('if (away[id]) continue') !== -1 &&
  driverSrc.indexOf('if (sick[id]) continue') !== -1 &&
  driverSrc.indexOf('if (hp < 70 && !med && !healer) continue') !== -1);
// 2c. Companion-guard extension shape (this arm).
check('driver captures the pre-call expedition record OBJECT (reference) for the landing-identity test',
  driverSrc.indexOf('preExpedRef = agencyExped(Game, vid)') !== -1);
check('driver reads the village guard counter before the call', driverSrc.indexOf('preGuardCount') !== -1 &&
  driverSrc.indexOf('companionGuardSkips') !== -1);
check('driver defines landed by object identity (a kept record is not a landing)',
  driverSrc.indexOf('ex !== preExpedRef') !== -1);
check('driver labels a guard skip companion-guard, never via the gate derivation',
  driverSrc.indexOf("guardSkipped ? 'companion-guard'") !== -1);
check('driver records guardOn + guardSkips + guardSkipsState per seed',
  driverSrc.indexOf('guardOn: GUARD_ON') !== -1 && driverSrc.indexOf('guardSkips: launches.filter') !== -1 &&
  driverSrc.indexOf('guardSkipsState') !== -1);
check('driver refuses MODE=on without COMPANIONGUARD=1 and MODE=off with it (legs differ only by the guard)',
  driverSrc.indexOf("MODE === 'on' && !GUARD_ON") !== -1 && driverSrc.indexOf("MODE === 'off' && GUARD_ON") !== -1);
check('driver attaches the new record to the row only when the call landed (a kept record is not row.exped)',
  driverSrc.indexOf('if (landed && ex) row.exped') !== -1);
// 3. Code-read anchors (by function name, not line number — lines drift).
check('code anchor: startExpedition blocks the non-directed duty holder first', agencySrc.indexOf('startExpedition(vid, hx, hy, announce, opts)') !== -1 &&
  agencySrc.indexOf('if (!directed && this.medicDutyHolder && this.medicDutyHolder() === vid)') !== -1);
check('code anchor: startExpedition heal-check then sick then range follow the duty gate', agencySrc.indexOf('if (this.villagerHealCheck(vid, nm0)) return;') !== -1 &&
  agencySrc.indexOf("if ((this.state.village.sick || {})[vid]) return;") !== -1 &&
  agencySrc.indexOf('if (maxD < 1) return;') !== -1);
const gameSrc = read('src/js/game.js');
check('code anchor: villagerHealCheck sits out only hurt-without-medicine-and-healer', gameSrc.indexOf('villagerHealCheck(vid, first, opts)') !== -1 &&
  gameSrc.indexOf('if (cur >= 70) return false;') !== -1 &&
  gameSrc.indexOf("if (medic) {") !== -1);
check('code anchor: medicDutyHolder reads the live duty holder (vacant when away/dead/sick)', gameSrc.indexOf('medicDutyHolder() {') !== -1 &&
  gameSrc.indexOf('const id = v.medicDuty;') !== -1);
check('code anchor: vbrainExecuteDepart honors one dawn commit; a blocked holder returns hold without a second candidate', brainSrc.indexOf('vbrainExecuteDepart: function (vid, hx, hy, announce)') !== -1 &&
  brainSrc.indexOf("if (!a2 || !a2.exped[vid]) return 'hold';") !== -1);
const winPlanSrc = read('src/js/win-plan.js');
check('code anchor: winPlanDepart findCompanion already excludes on-expedition villagers', winPlanSrc.indexOf("if (a && a.exped && a.exped[cid]) continue;") !== -1);
check('code anchor: winPlanDepart launchParty re-checks the companion after the call', winPlanSrc.indexOf("if (a2 && !a2.exped[cid]) return false;") !== -1);
check('code anchor: directed party launches pass opts.tx/ty (exempt from the duty gate)', winPlanSrc.indexOf('opts') !== -1 &&
  agencySrc.indexOf('const directed = !!(opts && opts.tx != null && opts.ty != null);') !== -1);
// 4. Policy sha (competent verbatim — re-pinned under journey-landing r140).
const crypto = require('crypto');
const polSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex');
check('competent.js is the verbatim policy blob (df9b7dff4de4…)', polSha === 'df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c', polSha.slice(0, 12));

console.log('== analyzer fixtures ==');
// Destination: haven-target iff landed tx,ty == hx,hy.
check('destination: landed (4,4)->(4,4) is haven-target',
  AN.deriveDestination({ landed: true, hx: 4, hy: 4, exped: { tx: 4, ty: 4 } }) === 'haven-target');
check('destination: landed (4,4)->(5,5) is off-home',
  AN.deriveDestination({ landed: true, hx: 4, hy: 4, exped: { tx: 5, ty: 5 } }) === 'off-home');
check('destination: unlanded launch is not-launched (no destination drawn)',
  AN.deriveDestination({ landed: false, hx: 4, hy: 4, exped: null }) === 'not-launched');
// Origin: directed callers win over the agency-tick frames beneath them.
const stackWinPlan = '    at Object.launchParty (/x/src/js/win-plan.js:424:11)\n    at Object.winPlanDepart (/x/src/js/win-plan.js:360:9)\n    at Object.agencyTick (/x/src/js/villager-agency.js:455:11)';
const stackBrain = '    at Object.vbrainExecuteDepart (/x/src/js/villager-brain.js:1044:9)\n    at Object.agencyTick (/x/src/js/villager-agency.js:439:11)';
const stackRandom = '    at Object.startExpedition (/x/src/js/villager-agency.js:468:5)\n    at Object.agencyTick (/x/src/js/villager-agency.js:453:11)';
check('origin: win-plan stack is winplan-party_launch', AN.deriveOrigin(stackWinPlan, true) === 'winplan-party_launch');
check('origin: vbrain stack is vbrain-party_launch', AN.deriveOrigin(stackBrain, true) === 'vbrain-party_launch');
check('origin: agency-only stack, no opts, is random-agency', AN.deriveOrigin(stackRandom, false) === 'random-agency');
check('origin: agency-only stack WITH opts is directed-other', AN.deriveOrigin(stackRandom, true) === 'directed-other');
check('origin: empty stack is unknown (names the hook)', AN.deriveOrigin('', false) === 'unknown');
check('origin: driver and analyzer agree on all four stacks',
  driver.deriveOrigin(stackWinPlan, true) === AN.deriveOrigin(stackWinPlan, true) &&
  driver.deriveOrigin(stackBrain, true) === AN.deriveOrigin(stackBrain, true) &&
  driver.deriveOrigin(stackRandom, false) === AN.deriveOrigin(stackRandom, false) &&
  driver.deriveOrigin(stackRandom, true) === AN.deriveOrigin(stackRandom, true));
// Block-reason derivation (true gate order: medic-duty, hurt-no-care,
// sick, range-0). Driver and analyzer must agree on every case.
const GATE_BASE = { dutyHolder: null, dutyName: null, health: 100, sick: false, maxDist: 3, medicineExists: false, campHealer: false, directed: false };
function gate(over) { return Object.assign({}, GATE_BASE, over || {}); }
check('block-reason: duty holder, non-directed, is medic-duty even when also hurt and sick',
  driver.deriveBlockReasonFromGate(gate({ dutyHolder: 'h1', health: 50, sick: true }), 'h1') === 'medic-duty' &&
  AN.deriveBlockReasonFromGate(gate({ dutyHolder: 'h1', health: 50, sick: true }), 'h1') === 'medic-duty');
check('block-reason: directed call to the duty holder is NOT medic-duty (exempt)',
  driver.deriveBlockReasonFromGate(gate({ dutyHolder: 'h1', directed: true }), 'h1') === 'unknown-block' &&
  AN.deriveBlockReasonFromGate(gate({ dutyHolder: 'h1', directed: true }), 'h1') === 'unknown-block');
check('block-reason: hurt without medicine or healer is hurt-no-care — and wins over sick (heal check runs first)',
  driver.deriveBlockReasonFromGate(gate({ health: 50, sick: true }), 'v1') === 'hurt-no-care' &&
  AN.deriveBlockReasonFromGate(gate({ health: 50, sick: true }), 'v1') === 'hurt-no-care');
check('block-reason: hurt WITH medicine is not hurt-no-care (pharmacy patches, launch proceeds)',
  driver.deriveBlockReasonFromGate(gate({ health: 50, medicineExists: true }), 'v1') === 'unknown-block' &&
  AN.deriveBlockReasonFromGate(gate({ health: 50, medicineExists: true }), 'v1') === 'unknown-block');
check('block-reason: hurt WITH a camp healer is not hurt-no-care',
  driver.deriveBlockReasonFromGate(gate({ health: 50, campHealer: true }), 'v1') === 'unknown-block');
check('block-reason: healthy + sick is sick',
  driver.deriveBlockReasonFromGate(gate({ sick: true }), 'v1') === 'sick' &&
  AN.deriveBlockReasonFromGate(gate({ sick: true }), 'v1') === 'sick');
check('block-reason: healthy, not sick, range 0 is range-0',
  driver.deriveBlockReasonFromGate(gate({ maxDist: 0 }), 'v1') === 'range-0' &&
  AN.deriveBlockReasonFromGate(gate({ maxDist: 0 }), 'v1') === 'range-0');
check('block-reason: healthy, not sick, in range, not duty is unknown-block (no gate explains it)',
  driver.deriveBlockReasonFromGate(gate({}), 'v1') === 'unknown-block' &&
  AN.deriveBlockReasonFromGate(gate({}), 'v1') === 'unknown-block');
check('block-reason: null gate is unknown-block',
  driver.deriveBlockReasonFromGate(null, 'v1') === 'unknown-block' &&
  AN.deriveBlockReasonFromGate(null, 'v1') === 'unknown-block');
// Candidate-duty flag: re-derived from the raw duty-holder field.
check('candidate-duty: vid === dutyHolder is duty; anyone else is not',
  AN.deriveIsDuty({ vid: 'h1', dutyHolder: { vid: 'h1', name: 'Ken' } }) === true &&
  AN.deriveIsDuty({ vid: 'v2', dutyHolder: { vid: 'h1', name: 'Ken' } }) === false &&
  AN.deriveIsDuty({ vid: 'v2', dutyHolder: null }) === false &&
  AN.deriveIsDuty({ vid: 'v2' }) === false);
// Encounter parsing.
check('parseEncounter: kill/evade/flee/gave-room/stood-down/hurt',
  AN.parseEncounter('killed the-suburb (3 rounds)') === 'kill' &&
  AN.parseEncounter('evaded the-suburb') === 'evade' &&
  AN.parseEncounter('fled the-suburb — staying out of sight') === 'flee' &&
  AN.parseEncounter('gave the-suburb room — not ready alone') === 'gave-room' &&
  AN.parseEncounter('stood down the-suburb (2 rounds)') === 'stood-down' &&
  AN.parseEncounter('hurt') === 'hurt');
// Guard-skip re-derivation (this arm): the counter is binding — a
// live record before the call AND an incremented counter means the
// guard fired; a flat counter means it did not, whatever the stored
// flag says.
check('guard-skip: live record + counter 0→1 re-derives true',
  AN.deriveGuardSkipped({ hadLiveExped: true, preGuardCount: 0, postGuardCount: 1, guardSkipped: true }) === true);
check('guard-skip: live record + flat counter re-derives false (a gate block, not a guard skip)',
  AN.deriveGuardSkipped({ hadLiveExped: true, preGuardCount: 2, postGuardCount: 2, guardSkipped: true }) === false);
check('guard-skip: no live record + incremented counter re-derives false (counter moved for another villager)',
  AN.deriveGuardSkipped({ hadLiveExped: false, preGuardCount: 0, postGuardCount: 1, guardSkipped: true }) === false);
check('guard-skip: missing counters fall back to the stored flag + a kept record',
  AN.deriveGuardSkipped({ guardSkipped: true, overwrote: { tx: 5, ty: 5 } }) === true &&
  AN.deriveGuardSkipped({ guardSkipped: true, overwrote: null }) === false &&
  AN.deriveGuardSkipped({ guardSkipped: false, overwrote: { tx: 5, ty: 5 } }) === false);
check('guard-skip: null row is false',
  AN.deriveGuardSkipped(null) === false);
// Party-launch grouping (this arm): the first landed directed call
// of a (day, part, tx, ty, duration) group is the inviter; later
// calls in the group are companions on the same target.
check('party-launches: inviter + two companions on one shared target count as 1 party',
  AN.countPartyLaunches([
    { landed: true, hasOpts: true, day: 10, part: 0, tx: 5, ty: 5, duration: 13 },
    { landed: true, hasOpts: true, day: 10, part: 0, tx: 5, ty: 5, duration: 13 },
    { landed: true, hasOpts: true, day: 10, part: 0, tx: 5, ty: 5, duration: 13 },
  ]) === 1);
check('party-launches: two parties in different parts, and a random-agency launch, count as 2',
  AN.countPartyLaunches([
    { landed: true, hasOpts: true, day: 10, part: 0, tx: 5, ty: 5, duration: 13 },
    { landed: true, hasOpts: true, day: 10, part: 1, tx: 5, ty: 5, duration: 13 },
    { landed: true, hasOpts: false, day: 10, part: 0, tx: 6, ty: 6, duration: 8 },
    { landed: false, hasOpts: true, day: 10, part: 2, tx: 5, ty: 5, duration: 13 },
  ]) === 2);
check('party-launches: nested exped shape (raw driver rows) groups the same way',
  AN.countPartyLaunches([
    { landed: true, hasOpts: true, day: 10, part: 0, exped: { tx: 5, ty: 5, duration: 13 } },
    { landed: true, hasOpts: true, day: 10, part: 0, exped: { tx: 5, ty: 5, duration: 13 } },
  ]) === 1);
check('party-launches: empty input is 0', AN.countPartyLaunches([]) === 0);
// Starvation counting (this arm): /starv/i on cause OR kind.
check('starvation: cause starved / kind starvation / kind Starvation count; hunger does not',
  AN.isStarvationDeath({ cause: 'starved', kind: 'death' }) === true &&
  AN.isStarvationDeath({ cause: 'died', kind: 'starvation' }) === true &&
  AN.isStarvationDeath({ cause: 'Starved to death', kind: 'death' }) === true &&
  AN.isStarvationDeath({ cause: 'killed by a deer', kind: 'fight' }) === false &&
  AN.isStarvationDeath({ cause: 'hunger', kind: 'death' }) === false &&
  AN.isStarvationDeath(null) === false);
// Trip assembly on a synthetic mini-corpus: one haven-target directed
// trip (complete), one off-home random trip (complete), one landed
// launch with no return (unmatched -> unknown), one blocked attempt.
(function () {
  const gHealthy = { dutyHolder: null, dutyName: null, health: 100, sick: false, maxDist: 3, medicineExists: false, campHealer: false, directed: false };
  const gHurt = { dutyHolder: null, dutyName: null, health: 50, sick: false, maxDist: 3, medicineExists: false, campHealer: false, directed: false };
  const gDuty = { dutyHolder: 'holder1', dutyName: 'Ken', health: 100, sick: false, maxDist: 3, medicineExists: false, campHealer: false, directed: false };
  const synth = { bySeed: { 1: {
    seed: 1, launches: [
      { vid: 'a', day: 10, part: 0, hx: 4, hy: 4, landed: true, hasOpts: true, origin: 'winplan-party_launch',
        stackTop: stackWinPlan, exped: { tx: 4, ty: 4, dist: 1, duration: 13, sinceDay: 10, sincePart: 0 },
        plan: { stage: 'party', target: 'suburb', node: { nx: 4, ny: 4 } }, dawnCommit: null,
        gate: Object.assign({}, gHealthy, { directed: true }), candidate: { vid: 'a', name: 'A', isDuty: false },
        dutyHolder: { vid: null, name: null }, pool: [{ vid: 'x', name: 'X' }], poolDepth: 1 },
      { vid: 'b', day: 12, part: 1, hx: 4, hy: 4, landed: true, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: { tx: 6, ty: 5, dist: 3, duration: 20, sinceDay: 12, sincePart: 1 },
        plan: null, dawnCommit: null,
        gate: gHealthy, candidate: { vid: 'b', name: 'B', isDuty: false },
        dutyHolder: { vid: null, name: null }, pool: [{ vid: 'x', name: 'X' }], poolDepth: 1 },
      { vid: 'c', day: 14, part: 0, hx: 4, hy: 4, landed: true, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: { tx: 3, ty: 3, dist: 2, duration: 8, sinceDay: 14, sincePart: 0 },
        plan: null, dawnCommit: null,
        gate: gHealthy, candidate: { vid: 'c', name: 'C', isDuty: false },
        dutyHolder: { vid: null, name: null }, pool: [], poolDepth: 0 },
      { vid: 'd', day: 15, part: 2, hx: 4, hy: 4, landed: false, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: null, plan: null, dawnCommit: null, blockReason: 'hurt-no-care',
        gate: gHurt, candidate: { vid: 'd', name: 'D', isDuty: false },
        dutyHolder: { vid: null, name: null }, pool: [{ vid: 'x', name: 'X' }], poolDepth: 1 },
      // Overwritten trip: 'e' launches (5,5) on day 20, then launches
      // again on day 21 while still out — the day-20 record is
      // replaced mid-flight and never returns.
      { vid: 'e', day: 20, part: 0, hx: 4, hy: 4, landed: true, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: { tx: 5, ty: 5, dist: 2, duration: 13, sinceDay: 20, sincePart: 0 },
        plan: null, dawnCommit: null,
        gate: gHealthy, candidate: { vid: 'e', name: 'E', isDuty: false },
        dutyHolder: { vid: null, name: null }, pool: [], poolDepth: 0, overwrote: null },
      { vid: 'e', day: 21, part: 0, hx: 4, hy: 4, landed: true, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: { tx: 6, ty: 6, dist: 3, duration: 13, sinceDay: 21, sincePart: 0 },
        plan: null, dawnCommit: null,
        gate: gHealthy, candidate: { vid: 'e', name: 'E', isDuty: false },
        dutyHolder: { vid: null, name: null }, pool: [], poolDepth: 0,
        overwrote: { tx: 5, ty: 5, dist: 2, legs: 3, sinceDay: 20, sincePart: 0, duration: 13, finds: [{ kcal: 10 }], encounters: [], meat: [] } },
      // Guard skip (this arm): 'f' is already out on their own trip
      // (22/0, 3 legs, 40 kcal of finds); a companion call in the
      // same part is skipped, the trip survives, the counter moves.
      { vid: 'f', day: 22, part: 0, hx: 4, hy: 4, landed: false, hasOpts: true, origin: 'vbrain-party_launch',
        stackTop: stackBrain, exped: null, plan: null,
        dawnCommit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'f', day: 22 },
        blockReason: 'companion-guard', guardSkipped: true,
        gate: Object.assign({}, gHealthy, { directed: true }), candidate: { vid: 'f', name: 'F', isDuty: false },
        dutyHolder: { vid: null, name: null }, pool: [{ vid: 'x', name: 'X' }], poolDepth: 1,
        hadLiveExped: true, preGuardCount: 0, postGuardCount: 1,
        overwrote: { tx: 5, ty: 5, dist: 2, legs: 3, sinceDay: 22, sincePart: 0, duration: 13, finds: [{ kcal: 40 }], encounters: [], meat: [] } },
    ],
    deaths: [
      { day: 30, kind: 'starvation', who: 'x', cause: 'starved', player: false },
    ],
    returns: [
      { vid: 'a', day: 13, part: 1, exped: { sinceDay: 10, sincePart: 0, legs: 12, finds: [{ kcal: 100 }, { kcal: 50 }], encounters: ['killed the-suburb (3 rounds)', 'evaded the-strike'], meat: [] }, clockParts: 13, legs: 12, findsKcal: 150, pantryBefore: 1000, pantryAfter: 1150 },
      { vid: 'b', day: 17, part: 1, exped: { sinceDay: 12, sincePart: 1, legs: 17, finds: [{ kcal: 200 }], encounters: [], meat: [] }, clockParts: 20, legs: 17, findsKcal: 200, pantryBefore: 1000, pantryAfter: 1200 },
    ],
    expedDeaths: [], openExped: [
      { vid: 'e', exped: { tx: 6, ty: 6, dist: 3, legs: 2, sinceDay: 21, sincePart: 0, duration: 13, finds: [], encounters: [], meat: [] }, endDay: 21 },
    ],
  },
  // Seed 2: the starved shape — one duty holder re-picked 3 times,
  // zero launches, pool non-empty twice and empty once.
  2: {
    seed: 2, launches: [
      { vid: 'holder1', day: 5, part: 0, hx: 4, hy: 4, landed: false, hasOpts: false, origin: 'vbrain-party_launch',
        stackTop: stackBrain, exped: null, plan: null, dawnCommit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', day: 5 }, blockReason: 'medic-duty',
        gate: gDuty, candidate: { vid: 'holder1', name: 'Ken', isDuty: true },
        dutyHolder: { vid: 'holder1', name: 'Ken' }, pool: [{ vid: 'x', name: 'X' }, { vid: 'y', name: 'Y' }], poolDepth: 2 },
      { vid: 'holder1', day: 9, part: 0, hx: 4, hy: 4, landed: false, hasOpts: false, origin: 'vbrain-party_launch',
        stackTop: stackBrain, exped: null, plan: null, dawnCommit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', day: 9 }, blockReason: 'medic-duty',
        gate: gDuty, candidate: { vid: 'holder1', name: 'Ken', isDuty: true },
        dutyHolder: { vid: 'holder1', name: 'Ken' }, pool: [], poolDepth: 0 },
      { vid: 'holder1', day: 14, part: 0, hx: 4, hy: 4, landed: false, hasOpts: false, origin: 'vbrain-party_launch',
        stackTop: stackBrain, exped: null, plan: null, dawnCommit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'x', day: 14 }, blockReason: 'medic-duty',
        gate: gDuty, candidate: { vid: 'holder1', name: 'Ken', isDuty: true },
        dutyHolder: { vid: 'holder1', name: 'Ken' }, pool: [{ vid: 'z', name: 'Z' }], poolDepth: 1 },
    ],
    returns: [], expedDeaths: [], openExped: [],
  } } };
  const cls = AN.classifyLeg(synth);
  check('synthetic: 5 landed launches classified, 5 blocked attempts counted under their reasons (incl. 1 companion-guard)',
    cls.launches.length === 5 && cls.blockedAttempts === 5 && cls.blockedByReason['hurt-no-care'] === 1 && cls.blockedByReason['medic-duty'] === 3 && cls.blockedByReason['companion-guard'] === 1,
    'landed=' + cls.launches.length + ' blocked=' + cls.blockedAttempts + ' byReason=' + JSON.stringify(cls.blockedByReason));
  check('synthetic: 1 orphan (the day-20 trip the day-21 call replaced) and 1 guard skip (the kept day-22 trip)',
    cls.orphans === 1 && cls.guardSkips === 1,
    'orphans=' + cls.orphans + ' guardSkips=' + cls.guardSkips);
  check('synthetic: the kept trip on the guard-skip row is NOT an orphan (only landed calls orphan)',
    (function () { const t = cls.trips.filter(function (x) { return x.vid === 'f'; }); return t.length === 0; })(),
    JSON.stringify(cls.trips.filter(function (x) { return x.vid === 'f'; })));
  check('synthetic: 1 party launch (only the directed haven-target call groups); the guard skip groups nothing',
    cls.partyLaunches === 1,
    'partyLaunches=' + cls.partyLaunches);
  check('synthetic: the overwritten trip is classified overwritten (not unknown), with its partial legs/finds at overwrite time',
    (function () { const t = cls.trips.filter(function (x) { return x.vid === 'e' && x.day === 20; })[0];
      return t && t.status === 'overwritten' && t.overwrittenBy.day === 21 && t.partialLegs === 3 && t.partialFindsKcal === 10; })(),
    JSON.stringify(cls.trips.filter(function (x) { return x.vid === 'e'; }).map(function (x) { return { day: x.day, status: x.status }; })));
  check('synthetic: only the return-less launch with no overwriter is unknown (the unmatched c trip)',
    cls.unknowns.length === 1 && /no return\/death\/open/.test(cls.unknowns[0].reason),
    JSON.stringify(cls.unknowns));
  check('synthetic: re-pick table counts the holder 3 times on the starved seed',
    (function () { const t = AN.summarizeLeg(synth, cls).repickTable; return t.length === 1 && t[0].seed === 2 && t[0].holderVid === 'holder1' && t[0].holderName === 'Ken' && t[0].blocks === 3; })(),
    JSON.stringify(AN.summarizeLeg(synth, cls).repickTable));
  check('synthetic: seed 2 is starved (same holder re-picked >=3, 0 launches) and named with its holder',
    (function () { const s = AN.summarizeLeg(synth, cls).starvedSeeds; return s.length === 1 && s[0].seed === 2 && s[0].holderName === 'Ken' && s[0].repicks === 3; })(),
    JSON.stringify(AN.summarizeLeg(synth, cls).starvedSeeds));
  check('synthetic: zero-launch seeds are [2]; attempt table counts seed 1 at 7 attempts / 5 landed / 1 guard skip / 1 orphan',
    (function () { const s = AN.summarizeLeg(synth, cls); return JSON.stringify(s.zeroLaunchSeeds) === '[2]' && s.attemptTable[0].attempts === 7 && s.attemptTable[0].landed === 5 && s.totalAttempts === 10; })(),
    JSON.stringify(AN.summarizeLeg(synth, cls).attemptTable));
  check('synthetic: starvation deaths 1 (seed 1) and per-seed party launches 1 / 0',
    (function () { const s = AN.summarizeLeg(synth, cls); return s.starvationDeaths === 1 && s.perSeed[0].starvationDeaths === 1 && s.perSeed[0].partyLaunches === 1 && s.perSeed[1].partyLaunches === 0 && s.perSeed[0].guardSkips === 1 && s.perSeed[0].orphans === 1; })(),
    JSON.stringify(AN.summarizeLeg(synth, cls).perSeed));
  check('synthetic: pool on medic-duty blocks — 3 blocks, 1 empty, 2 non-empty, median 1',
    (function () { const p = AN.summarizeLeg(synth, cls).poolOnMedicDutyBlocks; return p.n === 3 && p.poolEmpty === 1 && p.poolNonEmpty === 2 && p.median === 1 && p.min === 0 && p.max === 2; })(),
    JSON.stringify(AN.summarizeLeg(synth, cls).poolOnMedicDutyBlocks));
  check('synthetic: haven-target trip is winplan + plan.node == target',
    cls.trips.filter(function (t) { return t.destination === 'haven-target'; }).length === 1 &&
    cls.trips[0].origin === 'winplan-party_launch' && cls.trips[0].planNodeIsTarget === true);
  check('synthetic: unmatched landed launch is flagged unknown (no silent gap)',
    cls.unknowns.length === 1 && /no return\/death\/open/.test(cls.unknowns[0].reason),
    JSON.stringify(cls.unknowns));
  check('synthetic: no re-derivation mismatches', cls.mismatches.length === 0);
  const sum = AN.summarizeLeg(synth, cls);
  check('synthetic: haven share 1/5, haven legs 12, home legs 17',
    sum.havenTarget === 1 && sum.havenShare === 0.2 && sum.havenStats.legs === 12 && sum.homeStats.legs === 17,
    'haven=' + sum.havenTarget + ' share=' + sum.havenShare + ' legs=' + sum.havenStats.legs + '/' + sum.homeStats.legs);
  check('synthetic: haven trip yields 1 kill, 150 kcal, 13 clock parts',
    sum.havenStats.kills === 1 && sum.havenStats.findsKcal === 150 && sum.havenStats.partyDays === 3.25,
    JSON.stringify(sum.havenStats));
  // Tamper detection (D3): a stored origin that disagrees with the stack.
  const tampered = JSON.parse(JSON.stringify(synth));
  tampered.bySeed[1].launches[0].origin = 'random-agency';
  const clsT = AN.classifyLeg(tampered);
  check('D3 tamper: stored origin disagreeing with the stack is flagged',
    clsT.mismatches.length === 1 && clsT.mismatches[0].stored === 'random-agency' && clsT.mismatches[0].rederived === 'winplan-party_launch',
    JSON.stringify(clsT.mismatches));
  // Tamper detection (D3, this arm): a stored block reason that
  // disagrees with the gate snapshot, and a candidate-duty flag that
  // disagrees with the duty holder.
  const tampered2 = JSON.parse(JSON.stringify(synth));
  tampered2.bySeed[1].launches[3].blockReason = 'sick';
  const clsT2 = AN.classifyLeg(tampered2);
  check('D3 tamper: stored block reason disagreeing with the gate is flagged (sick vs hurt-no-care)',
    clsT2.mismatches.length === 1 && clsT2.mismatches[0].kind === 'block-reason' &&
    clsT2.mismatches[0].stored === 'sick' && clsT2.mismatches[0].rederived === 'hurt-no-care',
    JSON.stringify(clsT2.mismatches));
  const tampered3 = JSON.parse(JSON.stringify(synth));
  tampered3.bySeed[2].launches[0].candidate.isDuty = false;
  const clsT3 = AN.classifyLeg(tampered3);
  check('D3 tamper: stored candidate-duty flag disagreeing with the duty holder is flagged',
    clsT3.mismatches.length === 1 && clsT3.mismatches[0].kind === 'candidate-duty' &&
    clsT3.mismatches[0].stored === false && clsT3.mismatches[0].rederived === true,
    JSON.stringify(clsT3.mismatches));
  // Tamper detection (D3, this arm): a stored guardSkipped=false on
  // a guard row whose counter moved is flagged as a guard-skip
  // mismatch — and a guard row relabelled as a gate block is flagged
  // too (the gate says unknown-block for a healthy villager).
  const tampered4 = JSON.parse(JSON.stringify(synth));
  tampered4.bySeed[1].launches[6].guardSkipped = false;
  const clsT4 = AN.classifyLeg(tampered4);
  check('D3 tamper: stored guardSkipped=false on a counter-moved guard row is flagged',
    clsT4.mismatches.length === 1 && clsT4.mismatches[0].kind === 'guard-skip' &&
    clsT4.mismatches[0].stored === false && clsT4.mismatches[0].rederived === true,
    JSON.stringify(clsT4.mismatches));
  const tampered5 = JSON.parse(JSON.stringify(synth));
  tampered5.bySeed[1].launches[6].blockReason = 'sick';
  const clsT5 = AN.classifyLeg(tampered5);
  check('D3 tamper: guard row relabelled as a gate block is flagged (gate re-derivation disagrees)',
    clsT5.mismatches.length === 1 && clsT5.mismatches[0].kind === 'block-reason' &&
    clsT5.mismatches[0].stored === 'sick' && clsT5.mismatches[0].rederived === 'unknown-block',
    JSON.stringify(clsT5.mismatches));
})();

// ---------- live runs + determinism legs D1/D2 ----------
console.log('== live runs + determinism legs D1/D2 ==');
function childEnv(envExtra) {
  // D1/D2 + live-shape children run with MODE=off and no
  // COMPANIONGUARD in the env, whatever the parent process carries
  // — the driver refuses MODE=on without the guard env, so the mode
  // must be explicit here. GO 2026-11-16: the guard ships
  // UNCONDITIONAL, so these children run the SHIPPED trajectory
  // (guard on) — MODE=off is now only the driver's corpus label,
  // not a guard state. D1/D2 stay valid: both sides run the same
  // (always-on) guard state, so the comparison still isolates the
  // recorder alone.
  const env = Object.assign({}, process.env, { DAYS: '60', MODE: 'off' }, envExtra || {});
  delete env.COMPANIONGUARD;
  return env;
}
function childFingerprint(envExtra) {
  const env = childEnv(envExtra);
  const script = "const d=require('./scripts/companionguard-driver-20261116.js');" +
    "d.oneRun(103021).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,dailySig:o.dailySig};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
// Live unit scenarios (this arm): direct startExpedition calls on a
// real game — no driver, no policy run. GO 2026-11-16: the guard
// ships UNCONDITIONAL (env gate removed), so NO env is set anywhere
// here — the skip must fire with no COMPANIONGUARD in the env at
// all. An already-out villager is skipped by a companion-style
// directed call in the SAME part (record object identical,
// legs/since untouched, counter +1); a second directed call skips
// again (counter +2 — no OFF exists anymore). Not-out villager:
// taken. Runs in a child — never two harnesses in one process.
function childUnitScenarios() {
  const script = [
    "const { loadGame, setupGame } = require('./scripts/sim-harness.js');",
    "(async function () {",
    "  const res = { launched: null, skipSameObject: null, skipCounter: null, skipSince: null, skipLegs: null,",
    "    envFreeSkipSameObject: null, envFreeSkipCounter: null, notOutTaken: null, counter0: null, finalCounter: null, errors: [] };",
    "  try {",
    "    const { Game } = await loadGame({ seed: 103021, mode: 'companionguard-unittest', fullTelemetry: false });",
    "    await setupGame(Game);",
    "    const expedOf = function (vid) { try { return ((((Game.state || {}).village || {}).agency || {}).exped || {})[vid] || null; } catch (e) { return null; } };",
    "    const guardCount = function () { try { return (((Game.state || {}).village || {}).companionGuardSkips) || 0; } catch (e) { return 0; } };",
    "    const v = Game.state.village;",
    "    const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);",
    "    const roster = (v.roster || []).filter(function (id) { return id && id !== Game.villagerId; });",
    "    let A = null;",
    "    for (let i = 0; i < roster.length; i++) {",
    "      try { Game.startExpedition(roster[i], hx, hy, false); } catch (e) { continue; }",
    "      if (expedOf(roster[i])) { A = roster[i]; break; }",
    "    }",
    "    if (!A) { res.errors.push('no villager launched'); console.log(JSON.stringify(res)); return; }",
    "    res.launched = A;",
    "    const ref1 = expedOf(A);",
    "    const sinceDay1 = ref1.sinceDay, sincePart1 = ref1.sincePart, legs1 = ref1.legs;",
    "    const counter0 = guardCount();",
    "    res.counter0 = counter0;",
    "    Game.startExpedition(A, hx, hy, false, { tx: 5, ty: 5, duration: 10 });",
    "    const after = expedOf(A);",
    "    res.skipSameObject = (after === ref1);",
    "    res.skipCounter = (guardCount() === counter0 + 1);",
    "    res.skipSince = (after && after.sinceDay === sinceDay1 && after.sincePart === sincePart1);",
    "    res.skipLegs = (after && after.legs === legs1);",
    "    Game.startExpedition(A, hx, hy, false, { tx: 6, ty: 6, duration: 12 });",
    "    const afterFree = expedOf(A);",
    "    res.envFreeSkipSameObject = (afterFree === ref1);",
    "    res.envFreeSkipCounter = (guardCount() === counter0 + 2);",
    "    let B = null;",
    "    for (let i = 0; i < roster.length; i++) {",
    "      if (roster[i] === A || expedOf(roster[i])) continue;",
    "      try { Game.startExpedition(roster[i], hx, hy, false, { tx: 6, ty: 6, duration: 10 }); } catch (e) { continue; }",
    "      if (expedOf(roster[i])) { B = roster[i]; break; }",
    "    }",
    "    res.notOutTaken = (B !== null);",
    "    res.finalCounter = guardCount();",
    "  } catch (e) { res.errors.push(String((e && e.stack) || e).slice(0, 400)); }",
    "  console.log(JSON.stringify(res));",
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });",
  ].join('\n');
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: childEnv({ DAYS: '5' }), encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
(async function () {
  try {
    // 5d live-shape run, MODE=off label — in a child, never two
    // harnesses in one process. GO 2026-11-16: the guard is
    // unconditional, so this runs the SHIPPED trajectory; seed 103021
    // has 0 launches in 5d, hence 0 skips and a 0 counter.
    const shortEnv = childEnv({ DAYS: '5' });
    const shortScript = "const d=require('./scripts/companionguard-driver-20261116.js');" +
      "d.oneRun(103021).then(function(o){console.log(JSON.stringify(o));}).catch(function(e){console.error(e.stack);process.exit(1);});";
    const shortOut = JSON.parse(execFileSync('node', ['-e', shortScript], { cwd: REPO, env: shortEnv, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }).trim());
    check('live 5d run completes with 0 instrument errors', shortOut.instrumentErrors.length === 0, JSON.stringify(shortOut.instrumentErrors.slice(0, 3)));
    check('live 5d run carries launches/returns/dailySig arrays', Array.isArray(shortOut.launches) && Array.isArray(shortOut.returns) && Array.isArray(shortOut.dailySig));
    check('live 5d run policy sha is competent verbatim (df9b7dff4de4)', shortOut.policySha === 'df9b7dff4de4', 'got ' + shortOut.policySha);
    check('live 5d run records the Haven tile (px/py, numbers)', shortOut.haven && typeof shortOut.haven.nx === 'number' && typeof shortOut.haven.ny === 'number',
      JSON.stringify(shortOut.haven));
    console.log('  info: live 5d run haven=' + JSON.stringify(shortOut.haven) + ' launches=' + shortOut.launches.length +
      ' dailySig=' + shortOut.dailySig.length + ' days=' + shortOut.days);
    const badLaunch = (shortOut.launches || []).find(function (r) {
      return !(r && typeof r.day === 'number' && typeof r.vid === 'string' && typeof r.landed === 'boolean' &&
        typeof r.hasOpts === 'boolean' && typeof r.origin === 'string' && typeof r.stackTop === 'string');
    });
    check('launch rows have their shape (day/vid/landed/hasOpts/origin/stackTop)', !badLaunch, badLaunch ? JSON.stringify(badLaunch).slice(0, 300) : '');
    const badMedic = (shortOut.launches || []).find(function (r) {
      return !(r && r.candidate && typeof r.candidate.vid === 'string' && typeof r.candidate.isDuty === 'boolean' &&
        r.gate && typeof r.gate.directed === 'boolean' && typeof r.gate.health === 'number' &&
        Array.isArray(r.pool) && typeof r.poolDepth === 'number' && ('overwrote' in r) &&
        (r.landed ? r.blockReason === null : typeof r.blockReason === 'string'));
    });
    check('launch rows carry candidate/gate/pool (candidate.isDuty, gate fields, poolDepth, blockReason null iff landed)', !badMedic, badMedic ? JSON.stringify(badMedic).slice(0, 400) : '');
    const badPool = (shortOut.launches || []).find(function (r) {
      return r.pool.some(function (p) { return p.vid === r.vid; });
    });
    check('pool never contains the candidate themself', !badPool, badPool ? JSON.stringify(badPool).slice(0, 300) : '');
    const badGuard = (shortOut.launches || []).find(function (r) {
      return !(('guardSkipped' in r) && ('hadLiveExped' in r) && ('preGuardCount' in r) && ('postGuardCount' in r) &&
        (r.landed || r.guardSkipped === false));
    });
    check('launch rows carry guard fields (guardSkipped/hadLiveExped/pre/postGuardCount; landed rows never guard-skipped)', !badGuard, badGuard ? JSON.stringify(badGuard).slice(0, 300) : '');
    check('5d MODE=off run has guardOn false (env label), 0 guard skips, 0 guard counter (no launches in 5d)', shortOut.guardOn === false && shortOut.guardSkips === 0 && shortOut.guardSkipsState === 0,
      'guardOn=' + shortOut.guardOn + ' guardSkips=' + shortOut.guardSkips + ' state=' + shortOut.guardSkipsState);

    // Live unit scenarios: the guard itself, on a real game.
    const unit = childUnitScenarios();
    console.log('  info: unit scenarios: ' + JSON.stringify(unit));
    check('unit: a villager launches on a direct call (guard on, not out)', !!unit.launched && unit.errors.length === 0, JSON.stringify(unit.errors));
    check('unit: already-out villager SKIPPED by a companion-style directed call in the same part (same record object)',
      unit.skipSameObject === true, JSON.stringify(unit));
    check('unit: the two skips increment the village guard counter by exactly 2 (one per skipped call)',
      unit.skipCounter === true && unit.envFreeSkipCounter === true && unit.finalCounter === unit.counter0 + 2, JSON.stringify(unit));
    check('unit: the same-part case is preserved (sinceDay/sincePart and legs untouched by the skip)',
      unit.skipSince === true && unit.skipLegs === true, JSON.stringify(unit));
    check('unit: the guard fires with NO env set (unconditional — no OFF exists anymore; second skip keeps the same record)',
      unit.envFreeSkipSameObject === true && unit.envFreeSkipCounter === true, JSON.stringify(unit));
    check('unit: a not-out villager is TAKEN by a directed call with the guard on',
      unit.notOutTaken === true, JSON.stringify(unit));

    // 5d live-shape run, ARMED trajectory (guard on) — the lever leg
    // works end to end through the driver.
    const armedEnv = Object.assign({}, process.env, { DAYS: '5', MODE: 'on', COMPANIONGUARD: '1' });
    const armedScript = "const d=require('./scripts/companionguard-driver-20261116.js');" +
      "d.oneRun(103021).then(function(o){console.log(JSON.stringify(o));}).catch(function(e){console.error(e.stack);process.exit(1);});";
    const armedOut = JSON.parse(execFileSync('node', ['-e', armedScript], { cwd: REPO, env: armedEnv, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }).trim());
    check('live 5d ARMED run completes with 0 instrument errors', armedOut.instrumentErrors.length === 0, JSON.stringify(armedOut.instrumentErrors.slice(0, 3)));
    check('live 5d ARMED run has guardOn true and its guard counter equals its recorded skips',
      armedOut.guardOn === true && armedOut.guardSkips === armedOut.guardSkipsState,
      'guardOn=' + armedOut.guardOn + ' guardSkips=' + armedOut.guardSkips + ' state=' + armedOut.guardSkipsState);
    console.log('  info: armed 5d run launches=' + armedOut.launches.length + ' guardSkips=' + armedOut.guardSkips +
      ' orphans=' + (armedOut.launches || []).filter(function (r) { return r.landed && r.overwrote; }).length);

    const a = childFingerprint({});
    const b = childFingerprint({});
    check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
      JSON.stringify(a.full) === JSON.stringify(b.full));
    const off = childFingerprint({ COMPANIONGUARD_RECORDER: 'off', MODE: 'off' });
    check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
      JSON.stringify(a.fp) === JSON.stringify(off.fp),
      'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
    check('D2 recorder-off run carries empty launches/returns/sayLines arrays',
      (off.full.launches || []).length === 0 && (off.full.returns || []).length === 0 &&
      (off.full.expedDeaths || []).length === 0 && (off.full.sayLines || []).length === 0);
    check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
    // D3 on live rows: every live launch re-derives cleanly.
    const liveCls = AN.classifyLeg({ bySeed: { 103021: a.full } });
    check('D3 live: 0 re-derivation mismatches on the 60d run', liveCls.mismatches.length === 0, JSON.stringify(liveCls.mismatches.slice(0, 2)));
    check('D3 live: 0 unknown launches on the 60d run', liveCls.unknowns.length === 0, JSON.stringify(liveCls.unknowns.slice(0, 2)));
    check('D3 live: every blocked launch on the 60d run carries a known (non-unknown) block reason',
      (a.full.launches || []).filter(function (r) { return !r.landed && r.blockReason === 'unknown-block'; }).length === 0);
    console.log('  info: D1 60d run recorded ' + (a.full.launches || []).length + ' launches, ' +
      (a.full.returns || []).length + ' returns, ' + (a.full.expedDeaths || []).length + ' expedition deaths, ' +
      (a.full.dailySig || []).length + ' daily signatures; blocked by reason: ' +
      JSON.stringify((a.full.launches || []).filter(function (r) { return !r.landed; }).reduce(function (m, r) { m[r.blockReason] = (m[r.blockReason] || 0) + 1; return m; }, {})));
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
