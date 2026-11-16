// test-haventarget-b.js — proof, arm sim-haventarget-b
// (DIAG: expeditions targeting the Haven tile). Static checks (zero
// src/ diff, wraps named, code-read anchors by function name),
// analyzer fixture checks (destination/origin classification,
// re-derivation tamper detection, trip assembly, encounter parsing),
// live-shape checks on a 5d run, and determinism legs D1 (recorder ON
// twice, 60d, identical full corpus) + D2 (recorder ON vs OFF, 60d,
// identical daily trajectory signatures + wall fields) + D3
// (analyzer re-derivation on synthetic + live rows, mismatch 0).
// Usage: node scripts/test-haventarget-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'haventarget-driver-20261116.js'));
const AN = require(path.join(REPO, 'scripts', 'analyze-haventarget-b.js'));

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
const driverSrc = read('scripts/haventarget-driver-20261116.js');
check('driver wraps startExpedition', driverSrc.indexOf('Game.startExpedition = function') !== -1);
check('driver wraps expeditionReturn', driverSrc.indexOf('Game.expeditionReturn = function') !== -1);
check('driver wraps expedDeath', driverSrc.indexOf('Game.expedDeath = function') !== -1);
check('driver has HAVENTARGET_RECORDER off-switch', driverSrc.indexOf('HAVENTARGET_RECORDER') !== -1);
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
// 3. Code-read anchors (by function name, not line number — lines drift).
const agencySrc = read('src/js/villager-agency.js');
check('code anchor: startExpedition draws dist>=1 in 8 dirs, clamped', agencySrc.indexOf('startExpedition(vid, hx, hy, announce, opts)') !== -1 &&
  agencySrc.indexOf('var dist = 1 + Math.floor(R() * maxD)') !== -1);
check('code anchor: expeditionLeg rolls encounters at dist 0', agencySrc.indexOf('expeditionLeg(vid, hx, hy, playerAtHaven)') !== -1 &&
  agencySrc.indexOf('var mChance = 0.10 + dist * 0.035') !== -1);
check('code anchor: expeditionReturn narrates a direction regardless of distance', agencySrc.indexOf('expeditionReturn(vid, playerAtHaven)') !== -1 &&
  agencySrc.indexOf("back from ${dist >= 4 ? 'far past' : 'past'}") !== -1);
const winPlanSrc = read('src/js/win-plan.js');
check('code anchor: launchParty uses plan.node as the shared target', winPlanSrc.indexOf('if (plan.node) { tx = plan.node.nx; ty = plan.node.ny; }') !== -1);
check('code anchor: winPlanSeedFromFight records the seeder node', winPlanSrc.indexOf('winPlanSeedFromFight(vid, mdef, outcome)') !== -1 &&
  winPlanSrc.indexOf('if (node) plan.node = { nx: node.nx, ny: node.ny };') !== -1);
const brainSrc = read('src/js/villager-brain.js');
check('code anchor: vbrainExecuteDepart mirrors the party launch', brainSrc.indexOf('vbrainExecuteDepart: function (vid, hx, hy, announce)') !== -1 &&
  brainSrc.indexOf("if (plan && plan.node) { tx = plan.node.nx; ty = plan.node.ny; }") !== -1);
const objSrc = read('src/js/villager-objectives.js');
check('code anchor: objectives skip expedition members (idle-at-home cost)', objSrc.indexOf('if (ast.exped && ast.exped[rid]) return;') !== -1);
// 4. Policy sha (competent verbatim).
const crypto = require('crypto');
const polSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex');
check('competent.js is the verbatim policy blob (74a890f0844e…)', polSha === '74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456', polSha.slice(0, 12));

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
  const synth = { bySeed: { 1: {
    seed: 1, launches: [
      { vid: 'a', day: 10, part: 0, hx: 4, hy: 4, landed: true, hasOpts: true, origin: 'winplan-party_launch',
        stackTop: stackWinPlan, exped: { tx: 4, ty: 4, dist: 1, duration: 13, sinceDay: 10, sincePart: 0 },
        plan: { stage: 'party', target: 'suburb', node: { nx: 4, ny: 4 } }, dawnCommit: null },
      { vid: 'b', day: 12, part: 1, hx: 4, hy: 4, landed: true, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: { tx: 6, ty: 5, dist: 3, duration: 20, sinceDay: 12, sincePart: 1 },
        plan: null, dawnCommit: null },
      { vid: 'c', day: 14, part: 0, hx: 4, hy: 4, landed: true, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: { tx: 3, ty: 3, dist: 2, duration: 8, sinceDay: 14, sincePart: 0 },
        plan: null, dawnCommit: null },
      { vid: 'd', day: 15, part: 2, hx: 4, hy: 4, landed: false, hasOpts: false, origin: 'random-agency',
        stackTop: stackRandom, exped: null, plan: null, dawnCommit: null, blockReason: 'hurt-no-care' },
    ],
    returns: [
      { vid: 'a', day: 13, part: 1, exped: { sinceDay: 10, sincePart: 0, legs: 12, finds: [{ kcal: 100 }, { kcal: 50 }], encounters: ['killed the-suburb (3 rounds)', 'evaded the-strike'], meat: [] }, clockParts: 13, legs: 12, findsKcal: 150, pantryBefore: 1000, pantryAfter: 1150 },
      { vid: 'b', day: 17, part: 1, exped: { sinceDay: 12, sincePart: 1, legs: 17, finds: [{ kcal: 200 }], encounters: [], meat: [] }, clockParts: 20, legs: 17, findsKcal: 200, pantryBefore: 1000, pantryAfter: 1200 },
    ],
    expedDeaths: [], openExped: [],
  } } };
  const cls = AN.classifyLeg(synth);
  check('synthetic: 3 landed launches classified, 1 blocked attempt counted under its reason',
    cls.launches.length === 3 && cls.blockedAttempts === 1 && cls.blockedByReason['hurt-no-care'] === 1,
    'landed=' + cls.launches.length + ' blocked=' + cls.blockedAttempts + ' byReason=' + JSON.stringify(cls.blockedByReason));
  check('synthetic: haven-target trip is winplan + plan.node == target',
    cls.trips.filter(function (t) { return t.destination === 'haven-target'; }).length === 1 &&
    cls.trips[0].origin === 'winplan-party_launch' && cls.trips[0].planNodeIsTarget === true);
  check('synthetic: unmatched landed launch is flagged unknown (no silent gap)',
    cls.unknowns.length === 1 && /no return\/death\/open/.test(cls.unknowns[0].reason),
    JSON.stringify(cls.unknowns));
  check('synthetic: no re-derivation mismatches', cls.mismatches.length === 0);
  const sum = AN.summarizeLeg(synth, cls);
  check('synthetic: haven share 1/3, haven legs 12, home legs 17',
    sum.havenTarget === 1 && sum.havenShare === 0.3333 && sum.havenStats.legs === 12 && sum.homeStats.legs === 17,
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
})();

// ---------- live runs + determinism legs D1/D2 ----------
console.log('== live runs + determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60' }, envExtra || {});
  const script = "const d=require('./scripts/haventarget-driver-20261116.js');" +
    "d.oneRun(102201).then(function(o){" +
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
    const shortScript = "const d=require('./scripts/haventarget-driver-20261116.js');" +
      "d.oneRun(102201).then(function(o){console.log(JSON.stringify(o));}).catch(function(e){console.error(e.stack);process.exit(1);});";
    const shortOut = JSON.parse(execFileSync('node', ['-e', shortScript], { cwd: REPO, env: shortEnv, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }).trim());
    check('live 5d run completes with 0 instrument errors', shortOut.instrumentErrors.length === 0, JSON.stringify(shortOut.instrumentErrors.slice(0, 3)));
    check('live 5d run carries launches/returns/dailySig arrays', Array.isArray(shortOut.launches) && Array.isArray(shortOut.returns) && Array.isArray(shortOut.dailySig));
    check('live 5d run policy sha is competent verbatim (74a890f0844e)', shortOut.policySha === '74a890f0844e', 'got ' + shortOut.policySha);
    check('live 5d run records the Haven tile (px/py, numbers)', shortOut.haven && typeof shortOut.haven.nx === 'number' && typeof shortOut.haven.ny === 'number',
      JSON.stringify(shortOut.haven));
    console.log('  info: live 5d run haven=' + JSON.stringify(shortOut.haven) + ' launches=' + shortOut.launches.length +
      ' dailySig=' + shortOut.dailySig.length + ' days=' + shortOut.days);
    const badLaunch = (shortOut.launches || []).find(function (r) {
      return !(r && typeof r.day === 'number' && typeof r.vid === 'string' && typeof r.landed === 'boolean' &&
        typeof r.hasOpts === 'boolean' && typeof r.origin === 'string' && typeof r.stackTop === 'string');
    });
    check('launch rows have their shape (day/vid/landed/hasOpts/origin/stackTop)', !badLaunch, badLaunch ? JSON.stringify(badLaunch).slice(0, 300) : '');

    const a = childFingerprint({});
    const b = childFingerprint({});
    check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
      JSON.stringify(a.full) === JSON.stringify(b.full));
    const off = childFingerprint({ HAVENTARGET_RECORDER: 'off', MODE: 'off' });
    check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
      JSON.stringify(a.fp) === JSON.stringify(off.fp),
      'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
    check('D2 recorder-off run carries empty launches/returns/sayLines arrays',
      (off.full.launches || []).length === 0 && (off.full.returns || []).length === 0 &&
      (off.full.expedDeaths || []).length === 0 && (off.full.sayLines || []).length === 0);
    check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
    // D3 on live rows: every live launch re-derives cleanly.
    const liveCls = AN.classifyLeg({ bySeed: { 102201: a.full } });
    check('D3 live: 0 re-derivation mismatches on the 60d run', liveCls.mismatches.length === 0, JSON.stringify(liveCls.mismatches.slice(0, 2)));
    check('D3 live: 0 unknown launches on the 60d run', liveCls.unknowns.length === 0, JSON.stringify(liveCls.unknowns.slice(0, 2)));
    console.log('  info: D1 60d run recorded ' + (a.full.launches || []).length + ' launches, ' +
      (a.full.returns || []).length + ' returns, ' + (a.full.expedDeaths || []).length + ' expedition deaths, ' +
      (a.full.dailySig || []).length + ' daily signatures');
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
