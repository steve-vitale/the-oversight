// test-medicduty-b.js — proof, arm sim-medicduty-b
// (DIAG: the medic-duty candidate starves expeditions on whole
// seeds). Extends test-haventarget-b.js: static checks (zero src/
// diff, wraps named, code-read anchors by function name), analyzer
// fixture checks (block-reason derivation in true gate order,
// candidate-duty re-derivation, re-pick table, starved-seed verdict,
// pool-depth stats, tamper detection), live-shape checks on a 5d
// run, and determinism legs D1 (recorder ON twice, 60d, identical
// full corpus) + D2 (recorder ON vs OFF, 60d, identical daily
// trajectory signatures + wall fields) + D3 (analyzer re-derivation
// on synthetic + live rows, mismatch 0).
// Usage: node scripts/test-medicduty-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'medicduty-driver-20261116.js'));
const AN = require(path.join(REPO, 'scripts', 'analyze-medicduty-b.js'));

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
const driverSrc = read('scripts/medicduty-driver-20261116.js');
check('driver wraps startExpedition', driverSrc.indexOf('Game.startExpedition = function') !== -1);
check('driver wraps expeditionReturn', driverSrc.indexOf('Game.expeditionReturn = function') !== -1);
check('driver wraps expedDeath', driverSrc.indexOf('Game.expedDeath = function') !== -1);
check('driver has MEDICDUTY_RECORDER off-switch', driverSrc.indexOf('MEDICDUTY_RECORDER') !== -1);
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
// 3. Code-read anchors (by function name, not line number — lines drift).
const agencySrc = read('src/js/villager-agency.js');
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
const brainSrc = read('src/js/villager-brain.js');
check('code anchor: vbrainExecuteDepart honors one dawn commit; a blocked holder returns hold without a second candidate', brainSrc.indexOf('vbrainExecuteDepart: function (vid, hx, hy, announce)') !== -1 &&
  brainSrc.indexOf("if (!a2 || !a2.exped[vid]) return 'hold';") !== -1);
const winPlanSrc = read('src/js/win-plan.js');
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
  check('synthetic: 5 landed launches classified, 4 blocked attempts counted under their reasons',
    cls.launches.length === 5 && cls.blockedAttempts === 4 && cls.blockedByReason['hurt-no-care'] === 1 && cls.blockedByReason['medic-duty'] === 3,
    'landed=' + cls.launches.length + ' blocked=' + cls.blockedAttempts + ' byReason=' + JSON.stringify(cls.blockedByReason));
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
  check('synthetic: zero-launch seeds are [2]; attempt table counts seed 1 at 6 attempts / 5 landed',
    (function () { const s = AN.summarizeLeg(synth, cls); return JSON.stringify(s.zeroLaunchSeeds) === '[2]' && s.attemptTable[0].attempts === 6 && s.attemptTable[0].landed === 5 && s.totalAttempts === 9; })(),
    JSON.stringify(AN.summarizeLeg(synth, cls).attemptTable));
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
})();

// ---------- live runs + determinism legs D1/D2 ----------
console.log('== live runs + determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60' }, envExtra || {});
  const script = "const d=require('./scripts/medicduty-driver-20261116.js');" +
    "d.oneRun(102801).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,dailySig:o.dailySig};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
(async function () {
  try {
    // 5d live-shape run (in a child — never two harnesses in one process).
    const shortEnv = Object.assign({}, process.env, { DAYS: '5' });
    const shortScript = "const d=require('./scripts/medicduty-driver-20261116.js');" +
      "d.oneRun(102801).then(function(o){console.log(JSON.stringify(o));}).catch(function(e){console.error(e.stack);process.exit(1);});";
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

    const a = childFingerprint({});
    const b = childFingerprint({});
    check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
      JSON.stringify(a.full) === JSON.stringify(b.full));
    const off = childFingerprint({ MEDICDUTY_RECORDER: 'off', MODE: 'off' });
    check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
      JSON.stringify(a.fp) === JSON.stringify(off.fp),
      'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
    check('D2 recorder-off run carries empty launches/returns/sayLines arrays',
      (off.full.launches || []).length === 0 && (off.full.returns || []).length === 0 &&
      (off.full.expedDeaths || []).length === 0 && (off.full.sayLines || []).length === 0);
    check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
    // D3 on live rows: every live launch re-derives cleanly.
    const liveCls = AN.classifyLeg({ bySeed: { 102801: a.full } });
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
