#!/usr/bin/env node
// scripts/test-dissolvecause-a.js — sim-dissolvecause-a fixtures.
// Proves the dissolve-cause recorder (scripts/policies/scholarmelt-diag.js
// as edited by this arm) and the analyzer (scripts/analyze-dissolvecause-a.js)
// on synthetic rows BEFORE any judged analysis. No game harness, no jest:
// a fake Game with stubbed startCombat/tbEnd/tbBarrierExit drives the
// real recorder wraps; a synthetic corpus drives the real analyzer.
// Usage: node scripts/test-dissolvecause-a.js
// Exit 0 + FIXTURES-PASS iff every check passes.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { newStore, installScholarmeltDiag, finalizeScholarmeltDiag } = require('./policies/scholarmelt-diag');
const { analyze } = require('./analyze-dissolvecause-a');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok: ${name}`); }
  else { failed++; console.log(`  FAIL: ${name}${detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''}`); }
}

function fakeGame() {
  const G = {
    state: { scholar: { day: 10, health: 100, mx: 4, my: 4, monster: null } },
    map: { px: 4, py: 4 },
    villagerId: 'v1',
    over: false,
    tbfight: null,
    pendingMonsterId: null,
    _world: [],
    worldMonsters() { return this._world.slice(); },
    monsterAt(px, py) { return this._world.find(m => m.tx === px && m.ty === py) || null; },
    startCombat() { return null; },
    tbEnd() {},
    tbBarrierExit() { return false; },
  };
  return G;
}
function heraldObj() {
  return { id: 'herald', hp: 700, maxHp: 900, tx: 4, ty: 4, titan: true, lingering: true, veteran: false };
}
function liveFight() {
  return { over: false, worldOrigin: null, tableTrial: false,
    fighters: [
      { key: 'p', kind: 'player', hp: 80, maxHp: 100, alive: true, fled: false },
      { key: 'm_0', kind: 'monster', monsterId: 'herald', hp: 700, maxHp: 900, alive: true, fled: false, mdef: { id: 'herald' } },
    ] };
}

// --- Test 1: start-post dissolve, no lift; finalize keeps cause+HP ---
{
  const G = fakeGame();
  G.startCombat = function () { G.tbfight = null; return null; };
  const store = newStore();
  installScholarmeltDiag(G, store);
  G.startCombat('herald');
  const r = store.meetings[0];
  check('T1 startPostFightGone', r.startPostFightGone === true, r.startPostFightGone);
  check('T1 cause start-post-gone', r.dissolveCause === 'start-post-gone', r.dissolveCause);
  check('T1 observedAt start-post', r.dissolveObservedAt === 'start-post', r.dissolveObservedAt);
  check('T1 exact HP at post', r.scholarHpAtDissolve === 100, r.scholarHpAtDissolve);
  check('T1 probe tbfight null', r.dissolveProbe && r.dissolveProbe.tbfightState === 'null', r.dissolveProbe);
  check('T1 probe bearer unchanged', r.dissolveProbe && r.dissolveProbe.bearerChanged === false, r.dissolveProbe);
  check('T1 probe over false', r.dissolveProbe && r.dissolveProbe.gameOverAfter === false, r.dissolveProbe);
  check('T1 probe hp before/after', r.dissolveProbe && r.dissolveProbe.scholarHpBefore === 100 && r.dissolveProbe.scholarHpAfter === 100, r.dissolveProbe);
  check('T1 store errs 0', store.errs === 0, store.errors);
  G.state.scholar.health = 90;
  finalizeScholarmeltDiag(G, store);
  check('T1 flushed result', r.result === 'dissolved-no-tbend', r.result);
  check('T1 flush keeps cause', r.dissolveCause === 'start-post-gone', r.dissolveCause);
  check('T1 flush keeps exact HP (not 90)', r.scholarHpAtDissolve === 100, r.scholarHpAtDissolve);
  check('T1 flush keeps observedAt', r.dissolveObservedAt === 'start-post', r.dissolveObservedAt);
}

// --- Test 2: start-post dissolve WITH lift present; next start flushes, no overwrite ---
{
  const G = fakeGame();
  const h = heraldObj();
  G._world = [h];
  // NOTE: the orig must branch on a mode variable — reassigning
  // G.startCombat after install would discard the recorder wrap.
  let mode = 'dissolve';
  G.startCombat = function () { if (mode === 'live') { G.tbfight = liveFight(); return G.tbfight; } G.tbfight = null; return null; };
  const store = newStore();
  installScholarmeltDiag(G, store);
  G.startCombat('herald');
  const r1 = store.meetings[0];
  check('T2 lift snapshot', r1.lift && r1.lift.id === 'herald' && r1.lift.hp === 700, r1.lift);
  check('T2 present => lifted false', r1.lifted === false && r1.postStartPresent === true, { lifted: r1.lifted, post: r1.postStartPresent });
  check('T2 cause start-post-gone', r1.dissolveCause === 'start-post-gone', r1.dissolveCause);
  // Second start: live fight. Its pre-record flushes r1; r1's cause+HP must survive.
  G.state.scholar.health = 90;
  mode = 'live';
  G.startCombat('herald');
  check('T2 flush keeps cause', r1.dissolveCause === 'start-post-gone', r1.dissolveCause);
  check('T2 flush keeps HP 100', r1.scholarHpAtDissolve === 100, r1.scholarHpAtDissolve);
  check('T2 flush result', r1.result === 'dissolved-no-tbend', r1.result);
  const r2 = store.meetings[1];
  check('T2 second row live (no cause)', r2.dissolveCause === null && r2.result === null, { cause: r2.dissolveCause, result: r2.result });
}

// --- Test 3: normal tbEnd fight never gets a cause ---
{
  const G = fakeGame();
  G.startCombat = function () { G.tbfight = liveFight(); return G.tbfight; };
  G.tbEnd = function () { G.tbfight = null; };
  const store = newStore();
  installScholarmeltDiag(G, store);
  G.startCombat('herald');
  G.tbEnd('lost');
  const r = store.meetings[0];
  check('T3 tbEnd result', r.result === 'lost', r.result);
  check('T3 tbEnd no cause', r.dissolveCause === null, r.dissolveCause);
  check('T3 tbEnd no dissolve HP', r.scholarHpAtDissolve === null, r.scholarHpAtDissolve);
  check('T3 tbEnd no observedAt', r.dissolveObservedAt === null, r.dissolveObservedAt);
  check('T3 store errs 0', store.errs === 0, store.errors);
}

// --- Test 4: barrier-death stamp -> flush resolves to barrier-death with stamp HP ---
{
  const G = fakeGame();
  G.startCombat = function () { G.tbfight = liveFight(); return G.tbfight; };
  G.tbBarrierExit = function () { G.tbfight = null; G.villagerId = 'v2'; return true; };
  const store = newStore();
  installScholarmeltDiag(G, store);
  G.startCombat('herald');
  G.state.scholar.health = 77;
  G.tbBarrierExit(1, 0);
  const r = store.meetings[0];
  check('T4 barrier stamp set', r.barrierDeathStamp === true, r.barrierDeathStamp);
  check('T4 barrier stamp HP 77', r.barrierStampHp === 77, r.barrierStampHp);
  check('T4 barrier stamp bearerChanged', r.barrierStampBearerChanged === true, r.barrierStampBearerChanged);
  check('T4 no cause yet (pending)', r.dissolveCause === null && r.result === null, { cause: r.dissolveCause, result: r.result });
  // Next start flushes with HP moved to 60: barrier-death + stamp HP must win.
  G.state.scholar.health = 60;
  G.startCombat('herald');
  check('T4 flush cause barrier-death', r.dissolveCause === 'barrier-death', r.dissolveCause);
  check('T4 flush observedAt next-start', r.dissolveObservedAt === 'next-start', r.dissolveObservedAt);
  check('T4 flush HP is stamp HP 77, not 60', r.scholarHpAtDissolve === 77, r.scholarHpAtDissolve);
}

// --- Test 5: barrier push with fight still live never stamps ---
{
  const G = fakeGame();
  G.startCombat = function () { G.tbfight = liveFight(); return G.tbfight; };
  G.tbBarrierExit = function () { return false; }; // sealed / not on edge: fight stays
  const store = newStore();
  installScholarmeltDiag(G, store);
  G.startCombat('herald');
  G.tbBarrierExit(1, 0);
  const r = store.meetings[0];
  check('T5 live barrier no stamp', r.barrierDeathStamp === false, r.barrierDeathStamp);
  check('T5 live barrier no cause', r.dissolveCause === null, r.dissolveCause);
}

// --- Test 6: barrier after a recorded tbEnd never stamps ---
{
  const G = fakeGame();
  G.startCombat = function () { G.tbfight = liveFight(); return G.tbfight; };
  G.tbEnd = function () { G.tbfight = null; };
  G.tbBarrierExit = function () { G.tbfight = null; G.villagerId = 'v2'; return true; };
  const store = newStore();
  installScholarmeltDiag(G, store);
  G.startCombat('herald');
  G.tbEnd('fled');
  G.tbBarrierExit(1, 0);
  const r = store.meetings[0];
  check('T6 post-tbEnd barrier no stamp', r.barrierDeathStamp === false, r.barrierDeathStamp);
  check('T6 result stays fled', r.result === 'fled', r.result);
}

// --- Test 7: sweep-end finalize flush trigger + bound HP ---
{
  const G = fakeGame();
  G.startCombat = function () { G.tbfight = liveFight(); return G.tbfight; };
  const store = newStore();
  installScholarmeltDiag(G, store);
  G.startCombat('herald');
  // Simulate an in-turn dissolve that is NOT barrier-stamped: fight gone, no tbEnd.
  G.tbfight = null;
  G.state.scholar.health = 55;
  finalizeScholarmeltDiag(G, store);
  const r = store.meetings[0];
  check('T7 sweep-end flush result', r.result === 'dissolved-no-tbend', r.result);
  check('T7 sweep-end cause', r.dissolveCause === 'flush-sweep-end', r.dissolveCause);
  check('T7 sweep-end observedAt', r.dissolveObservedAt === 'sweep-end', r.dissolveObservedAt);
  check('T7 sweep-end HP 55', r.scholarHpAtDissolve === 55, r.scholarHpAtDissolve);
}

// --- Test 8: analyzer on a synthetic corpus (cause dist, within/between deltas, substrate) ---
{
  const scratch = path.join(REPO, 'scratch-dissolvecause-test');
  const dfScratch = path.join(REPO, 'scratch-dissolvecause-test-df');
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(dfScratch, { recursive: true, force: true }); } catch (e) {}
  fs.mkdirSync(scratch, { recursive: true });
  fs.mkdirSync(dfScratch, { recursive: true });
  function synthRow(seed, meetings) {
    return { seed, days: 10, won: 0, waveReach: 1, nationalEver: 0, nationalFinal: 0,
      table: 0, entered: 0, deathTotal: 0,
      scholarmelt: { meetings, diag: { errs: 0, errors: [], overflow: {}, installed: true } } };
  }
  const census = { seed: 0, snapshots: [{ day: 9, monsters: [] }, { day: 10, monsters: [] }] };
  const m1 = { fightSeq: 1, kind: 'start', dayStart: 5, dayEnd: 5, intendedMid: 'herald',
    tilePx: 4, tilePy: 4, lift: heraldObj(), lifted: false, bystander: null,
    result: 'dissolved-no-tbend', scholarHpStart: 100, scholarHpEnd: null,
    restoredIdentity: true, restoredEntry: true, restoredHp: 700,
    dissolveCause: 'start-post-gone', dissolveObservedAt: 'start-post',
    scholarHpAtDissolve: 98, dissolveProbe: { tbfightState: 'null' }, barrierDeathStamp: false };
  const m2 = { fightSeq: 2, kind: 'start', dayStart: 5, dayEnd: 5, intendedMid: 'herald',
    tilePx: 4, tilePy: 4, lift: null, lifted: false, bystander: false,
    result: 'dissolved-no-tbend', scholarHpStart: 98, scholarHpEnd: null,
    restoredIdentity: false, restoredEntry: false, restoredHp: null,
    dissolveCause: 'start-post-gone', dissolveObservedAt: 'start-post',
    scholarHpAtDissolve: 98, dissolveProbe: { tbfightState: 'null' }, barrierDeathStamp: false };
  const m3 = { fightSeq: 3, kind: 'start', dayStart: 6, dayEnd: 6, intendedMid: 'herald',
    tilePx: 4, tilePy: 4, lift: null, lifted: false, bystander: false,
    result: 'lost', scholarHpStart: 98, scholarHpEnd: 80,
    restoredIdentity: false, restoredEntry: false, restoredHp: null,
    dissolveCause: null, dissolveObservedAt: null, scholarHpAtDissolve: null,
    dissolveProbe: null, barrierDeathStamp: false };
  const rowA = synthRow(75101, [m1, m2, m3]);
  const rowB = synthRow(75102, []);
  for (const [dir, row] of [[scratch, rowA], [dfScratch, rowA]]) {
    fs.writeFileSync(path.join(dir, 's75101-fresh.json'), JSON.stringify(row, null, 1) + '\n');
    fs.writeFileSync(path.join(dir, 's75102-fresh.json'), JSON.stringify(rowB, null, 1) + '\n');
    fs.writeFileSync(path.join(dir, 'census-s75101.json'), JSON.stringify(census, null, 1) + '\n');
    fs.writeFileSync(path.join(dir, 'census-s75102.json'), JSON.stringify(census, null, 1) + '\n');
  }
  const res = analyze(scratch, [75101, 75102], dfScratch);
  check('T8 valid 2/2', res.validSeeds === 2, res.validSeeds);
  check('T8 dissolved 2', res.dissolvedTotal === 2, res.dissolvedTotal);
  check('T8 cause coverage 2/2', res.coverage.causeCovered === 2, res.coverage);
  check('T8 HP coverage 2/2', res.coverage.hpCovered === 2, res.coverage);
  check('T8 cause dist', res.causeCounts['start-post-gone'] === 2, res.causeCounts);
  check('T8 fates restored+spawn', res.fateCounts['SCHOLAR-RESTORED'] === 1 && res.fateCounts['SPAWN-ENDED'] === 1, res.fateCounts);
  check('T8 within n=2 neg=1 zero=1 mean=-1', res.withinSummary.n === 2 && res.withinSummary.negative === 1 && res.withinSummary.zero === 1 && res.withinSummary.mean === -1, res.withinSummary);
  check('T8 between n=1 zero mean=0', res.betweenSummary.n === 1 && res.betweenSummary.zero === 1 && res.betweenSummary.mean === 0, res.betweenSummary);
  check('T8 spawnEnded total 1', res.spawnEnded.total === 1, res.spawnEnded.total);
  check('T8 substrate all true', res.substrate.all === true, res.substrate);
  check('T8 unclassified 0', res.unclassified === 0, res.unclassified);
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(dfScratch, { recursive: true, force: true }); } catch (e) {}
  check('T8 scratch removed', !fs.existsSync(scratch) && !fs.existsSync(dfScratch), null);
}

console.log(failed === 0 ? `FIXTURES-PASS ${passed}/${passed}` : `FIXTURES-FAIL passed=${passed} failed=${failed}`);
process.exit(failed === 0 ? 0 : 1);
