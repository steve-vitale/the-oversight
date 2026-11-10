// test-answermail-drive-a.js — proof for arm sim-answermail-drive-a.
// Fixture tests for the ANSWERMAIL_DRIVE engine hook (default OFF, env
// gate, available-representative gate, the four verbs, never proposes)
// against the REAL loaded Game (collaborators stubbed on the instance —
// the hook itself is the unit under test) + live harness smoke legs
// (99104 drive 60d and 99104 control 60d, /tmp). Green BEFORE any
// judged sim. RED->GREEN: on base master (no _answermailDriveDaily)
// the ON checks fail with "not a function" — verified by stashing
// src/js/hierarchy.js before the hook commit (see evidence).
// Usage: node scripts/test-answermail-drive-a.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DR = require(path.join(REPO, 'scripts', 'policies', 'competent-answermail-drive-a'));
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let passed = 0;
function check(name, fn) {
  try { const r = fn(); if (r && typeof r.then === 'function') return r.then(function () { passed += 1; console.log('ok ' + passed + ' - ' + name); }, function (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }); passed += 1; console.log('ok ' + passed + ' - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}
function checkAsync(name, fn) {
  return Promise.resolve().then(fn).then(function () { passed += 1; console.log('ok ' + passed + ' - ' + name); }, function (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; });
}

function setDrive(on) {
  if (on) process.env.ANSWERMAIL_DRIVE = '1';
  else delete process.env.ANSWERMAIL_DRIVE;
}

(async function () {
  const { Game } = await loadGame({ seed: 99104, mode: 'answermail-drive-proof', fullTelemetry: false });
  await quietLog(async function () { await setupGame(Game); });

  // Save the real collaborators; each fixture stubs instance properties
  // and restores them, so checks never leak into each other.
  const orig = {
    availableRep: Game._availableRepresentative,
    hierarchyState: Game.hierarchyState,
    answerAccord: Game.answerAccord,
    tendLink: Game.tendLink,
    answerRenegotiation: Game.answerRenegotiation,
    answerDemand: Game.answerDemand,
  };
  function restore() {
    Game._availableRepresentative = orig.availableRep;
    Game.hierarchyState = orig.hierarchyState;
    Game.answerAccord = orig.answerAccord;
    Game.tendLink = orig.tendLink;
    Game.answerRenegotiation = orig.answerRenegotiation;
    Game.answerDemand = orig.answerDemand;
  }
  function freshState() {
    delete Game.state.answermailDrive;
    Game.state.pendingAccord = null;
    Game.state.village.pantry = [{ kcalEach: 25000, units: 1 }];
  }
  function stubVerbs(calls) {
    Game.answerAccord = function (how) { calls.answerAccord.push(how); return true; };
    Game.tendLink = function (id) { calls.tendLink.push(id); return 1500; };
    Game.answerRenegotiation = function (id, how) { calls.answerRenegotiation.push([id, how]); return 'gift'; };
    Game.answerDemand = function (id, acc) { calls.answerDemand.push([id, acc]); return true; };
  }
  function leadLink(id, opts) {
    return Object.assign({ id: id, status: 'active', primary: 'haven', subordinate: 'emberhold', trust: 35, day: 0, tendedWeek: 1 }, opts || {});
  }

  // --- The hook exists ---------------------------------------------------
  check('hook exists: _answermailDriveDaily is a function on the loaded Game', function () {
    assert.strictEqual(typeof Game._answermailDriveDaily, 'function');
    assert.strictEqual(typeof Game.hierarchyDaily, 'function');
  });

  // --- Default OFF ---------------------------------------------------------
  check('OFF by default: env unset, staged accord untouched, no stats object', function () {
    setDrive(false);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return { id: 'rosa', standing: 40 }; };
    Game.hierarchyState = function () { return [leadLink('l1', { pendingRenegotiation: { day: 1 }, pendingDemand: { kind: 'grain' } })]; };
    Game.state.pendingAccord = { linkId: 'l1', day: 0 };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.answerAccord, []);
    assert.deepStrictEqual(calls.tendLink, []);
    assert.deepStrictEqual(calls.answerRenegotiation, []);
    assert.deepStrictEqual(calls.answerDemand, []);
    assert.strictEqual(Game.state.pendingAccord && Game.state.pendingAccord.linkId, 'l1');
    assert.strictEqual(Game.state.answermailDrive, undefined);
    restore();
  });
  check('OFF by default: process undefined shape (browser) — hook no-ops', function () {
    // The hook reads process.env behind a typeof guard; with the env var
    // absent it returns before any collaborator is touched, which is the
    // browser's situation (process undefined) as well as node-without-env.
    setDrive(false);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { throw new Error('must not be called while OFF'); };
    Game.state.pendingAccord = { linkId: 'l1', day: 0 };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.answerAccord, []);
    assert.strictEqual(Game.state.answermailDrive, undefined);
    restore();
  });

  // --- ON: the four verbs --------------------------------------------------
  check('ON: available rep answers accord gift, tends, renegotiates, honors demand', function () {
    setDrive(true);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return { id: 'rosa', standing: 40 }; };
    Game.hierarchyState = function () { return [leadLink('l1', { pendingRenegotiation: { day: 1 }, pendingDemand: { kind: 'grain' } })]; };
    Game.state.pendingAccord = { linkId: 'l1', day: 0 };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.answerAccord, ['gift']);
    assert.deepStrictEqual(calls.tendLink, ['l1']);
    assert.deepStrictEqual(calls.answerRenegotiation, [['l1', 'gift']]);
    assert.deepStrictEqual(calls.answerDemand, [['l1', true]]);
    const ds = Game.state.answermailDrive;
    assert.strictEqual(ds.accordAnswers, 1);
    assert.strictEqual(ds.tends, 1);
    assert.strictEqual(ds.renegotiationAnswers, 1);
    assert.strictEqual(ds.demandAnswers, 1);
    assert.strictEqual(ds.demandKinds.grain, 1);
    assert.strictEqual(ds.answerers.rosa, 4, 'one note per verb carried');
    assert.deepStrictEqual(Object.keys(ds.answererNames), ['rosa'], 'names recorded only for villagers who actually answered, never bystanders');
    assert.strictEqual(ds.firstAnswerDay.l1, Game.state.scholar.day, 'first answer stamped on the current game day (setupGame leaves day at 1, not 0)');
    assert.strictEqual(ds.blockedDays.noAnswerer, 0);
    assert.strictEqual(ds.errors, 0);
    restore();
  });
  check('ON: dead-link accord is NOT answered (no gift for a broken bond)', function () {
    setDrive(true);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return { id: 'rosa', standing: 40 }; };
    Game.hierarchyState = function () { return [leadLink('l1', { status: 'broken' })]; };
    Game.state.pendingAccord = { linkId: 'l1', day: 0 };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.answerAccord, []);
    assert.strictEqual(Game.state.answermailDrive.accordAnswers, 0);
    restore();
  });

  // --- ON: the answerer gate ----------------------------------------------
  check('ON: no available rep — nothing answered, blocked day counted', function () {
    setDrive(true);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return null; };
    Game.hierarchyState = function () { return [leadLink('l1', { pendingRenegotiation: { day: 1 } })]; };
    Game.state.pendingAccord = { linkId: 'l1', day: 0 };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.answerAccord, []);
    assert.deepStrictEqual(calls.tendLink, []);
    assert.deepStrictEqual(calls.answerRenegotiation, []);
    const ds = Game.state.answermailDrive;
    assert.strictEqual(ds.blockedDays.noAnswerer, 1);
    assert.strictEqual(ds.accordAnswers, 0);
    assert.strictEqual(Game.state.pendingAccord && Game.state.pendingAccord.linkId, 'l1');
    restore();
  });

  // --- ON: tend gates -------------------------------------------------------
  check('ON: tend blocked when pantry <= 20000, counted', function () {
    setDrive(true);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return { id: 'rosa', standing: 40 }; };
    Game.state.village.pantry = [{ kcalEach: 20000, units: 1 }];
    Game.hierarchyState = function () { return [leadLink('l1')]; };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.tendLink, []);
    assert.strictEqual(Game.state.answermailDrive.tendsBlockedPantry, 1);
    assert.strictEqual(Game.state.answermailDrive.tends, 0);
    restore();
  });
  check('ON: tend skipped when already tended this week', function () {
    setDrive(true);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return { id: 'rosa', standing: 40 }; };
    Game.hierarchyState = function () { return [leadLink('l1', { tendedWeek: Game._week() })]; };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.tendLink, []);
    restore();
  });
  check('ON: BELONG link is never tended', function () {
    setDrive(true);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return { id: 'rosa', standing: 40 }; };
    Game.hierarchyState = function () { return [leadLink('l1', { primary: 'emberhold', subordinate: 'haven' })]; };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.tendLink, []);
    restore();
  });
  check('ON: broken link is never tended or renegotiated', function () {
    setDrive(true);
    freshState(); restore();
    const calls = { answerAccord: [], tendLink: [], answerRenegotiation: [], answerDemand: [] };
    stubVerbs(calls);
    Game._availableRepresentative = function () { return { id: 'rosa', standing: 40 }; };
    Game.hierarchyState = function () { return [leadLink('l1', { status: 'broken', pendingRenegotiation: { day: 1 } })]; };
    Game._answermailDriveDaily();
    assert.deepStrictEqual(calls.tendLink, []);
    assert.deepStrictEqual(calls.answerRenegotiation, []);
    restore();
  });

  // --- Never proposes ------------------------------------------------------
  check('never proposes: the hook has no propose path (source check)', function () {
    const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'hierarchy.js'), 'utf8');
    const m = src.match(/_answermailDriveDaily\(\) \{([\s\S]*?)\n    \},\n\n    hierarchyDaily/);
    assert.ok(m, 'hook body found');
    assert.ok(!/proposeLink|answerCounter|answerNationalChoice|answerGlobalChoice|payTribute|forgiveArrears/.test(m[1]), 'hook must not call propose/counter/national/global/tribute verbs');
  });
  check('policy never answers: competent-answermail-drive-a calls no answering verb', function () {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-answermail-drive-a.js'), 'utf8');
    const code = src.split('\n').filter(function (l) { return l.trim().indexOf('//') !== 0; }).join('\n');
    assert.ok(!/answerAccord\s*\(|tendLink\s*\(|answerRenegotiation\s*\(|answerDemand\s*\(|proposeLink\s*\(/.test(code), 'policy must not call any answering/proposing verb');
    assert.strictEqual(DR.drivePolicy.id, 'competent-answermail-drive-a');
    assert.strictEqual(typeof DR.drivePolicy.daily, 'function');
    assert.strictEqual(DR.driveStats({ state: {} }), null, 'no drive stats -> null');
    assert.strictEqual(DR.driveStats({ state: { answermailDrive: { accordAnswers: 2 } } }).accordAnswers, 2);
  });
  check('robustness: missing collaborators do not throw', function () {
    setDrive(true);
    freshState(); restore();
    Game._availableRepresentative = undefined;
    Game.hierarchyState = undefined;
    Game.answerAccord = undefined;
    Game.state.pendingAccord = { linkId: 'l1', day: 0 };
    Game._answermailDriveDaily(); // must not throw; errors counted if any
    restore();
  });

  // --- Live harness smoke legs -------------------------------------------
  await checkAsync('live smoke: 99104 drive 60d runs, accord answered, instrument errors 0', function () {
    const outDir = fs.mkdtempSync(path.join('/tmp', 'answermail-drive-proof-'));
    const env = Object.assign({}, process.env, {
      SEEDS: '99104', DAYS: '60', RUN: 'answermail-drive-proof', POLICY: 'drive', OUTDIR: outDir, ANSWERMAIL_DRIVE: '1',
    });
    delete env.ANSWERMAIL_DRIVE;
    env.ANSWERMAIL_DRIVE = '1';
    const out = execFileSync('node', [path.join(REPO, 'scripts', 'answermail-drive-driver-20261110.js')], { env: env, timeout: 600000 }).toString();
    const line = JSON.parse(out.trim().split('\n').pop());
    assert.strictEqual(line.seed, 99104);
    assert.strictEqual(line.driveEnv, true, 'armed leg ran with the drive on');
    assert.strictEqual(line.errors, 0, 'instrument errors 0; got ' + line.errors);
    assert.ok(line.snapshots >= line.days - 2, 'daily snapshots present; got ' + line.snapshots + ' for ' + line.days + ' days');
    const file = path.join(outDir, 'answermail-drive-s99104-answermail-drive-proof.json');
    const run = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(run.driveStats, 'drive stats captured');
    // 99104 forms its link d43 (trustgrowth-b); a 60d armed run must have
    // answered the accord at least once — the mail got answered, not just loaded.
    assert.ok(run.driveStats.accordAnswers >= 1, 'accord answered; stats=' + JSON.stringify(run.driveStats));
    console.log('    smoke armed: days=' + run.days + ' scale=' + run.scaleRank + ' links=' + ((run.daily[run.daily.length - 1] || {}).linkTotal || 0)
      + ' accord=' + run.driveStats.accordAnswers + ' tends=' + run.driveStats.tends + ' blocked=' + ((run.driveStats.blockedDays || {}).noAnswerer || 0));
  });
  await checkAsync('live smoke: 99104 control 60d runs, drive stats null (drive-off proof)', function () {
    const outDir = fs.mkdtempSync(path.join('/tmp', 'answermail-drive-proof-base-'));
    const env = Object.assign({}, process.env, {
      SEEDS: '99104', DAYS: '60', RUN: 'answermail-drive-proof-base', POLICY: 'competent', OUTDIR: outDir,
    });
    delete env.ANSWERMAIL_DRIVE;
    const out = execFileSync('node', [path.join(REPO, 'scripts', 'answermail-drive-driver-20261110.js')], { env: env, timeout: 600000 }).toString();
    const line = JSON.parse(out.trim().split('\n').pop());
    assert.strictEqual(line.seed, 99104);
    assert.strictEqual(line.driveEnv, false, 'control leg ran with the drive off');
    assert.strictEqual(line.errors, 0, 'instrument errors 0; got ' + line.errors);
    const file = path.join(outDir, 'answermail-drive-s99104-answermail-drive-proof-base.json');
    const run = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.strictEqual(run.driveStats, null, 'control leg must carry no drive stats');
    assert.strictEqual(line.accordAnswers, 0, 'control leg answered no accords via the drive');
    console.log('    smoke control: days=' + run.days + ' scale=' + run.scaleRank + ' driveStats=' + run.driveStats);
  });

  setDrive(false);
  restore();
  console.log(passed + ' checks passed');
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
