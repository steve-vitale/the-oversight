#!/usr/bin/env node
// scripts/test-doorwalk-b-20261107.js — proof for the door-walk drive
// (arm sim-doorwalk-b, run fleshout-loop-b-20261107T1430Z).
//
// Sections:
//   (A) RED: gate OFF never drives the verb — pure delegation, zero
//       Game reads when off (a stub whose engine methods throw if
//       touched proves it).
//   (B) GREEN: gate-ON fixtures on stub Games — assigned door walked
//       once and played through to 'done'; fallback / only-feared /
//       fight-live / preview-null / seat-taker / already-entered /
//       trial-only / conscript-refuse / downgrade / game-over are
//       classified skips and never call the verb wrongly; the
//       rotation mapping is pinned.
//   (C) COMPOSITION: against a real loaded game, the wrapper daily
//       runs linkfeast daily exactly once, and upkeep runs linkfeast
//       upkeep exactly once (+ door drive).
//   (D) LIVE: the judged driver, run twice on seed 53001 (a no-seat
//       seed, so the drive can never fire) — baseline vs armed must
//       reproduce the headline numbers EXACTLY, proving the idle
//       reads draw no RNG and write no state in practice; plus a
//       1-seed ARMED smoke leg on 53003 in /tmp asserting structural
//       invariants (sit happened, a door was entered, 0 instrument
//       errors).
//   (E) ANALYZER: pure-function fixtures (preEntryMatch,
//       entriesFromVerbs, starvation, medianOf, classifySeatDay).
//
// Usage: node scripts/test-doorwalk-b-20261107.js
//   (D) runs three 150d sims in /tmp; allow ~4-6 min.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const DW = require('./policies/competent-doorwalk-b');
const { layerOn, doorWalkDrive, assignedDoorFor, resetDoorwalkStats, doorwalkStats } = DW;
const ANALYZE = require('./doorwalk-b-analyze-20261107');
const { classifySeatDay } = ANALYZE;

let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

function withEnv(vars, fn) {
  const prev = {};
  Object.keys(vars).forEach(function (k) { prev[k] = process.env[k]; });
  Object.keys(vars).forEach(function (k) {
    if (vars[k] == null) delete process.env[k]; else process.env[k] = vars[k];
  });
  try { return fn(); } finally {
    Object.keys(vars).forEach(function (k) {
      if (prev[k] == null) delete process.env[k]; else process.env[k] = prev[k];
    });
  }
}

// stubGame: a minimal engine surface that PLAYS a table like the real
// one. tableChoices options change with the phase, exactly as
// tableOfferPaths / tableRunBeat / tableFinals do; chooseTableOption
// advances the phase machine (paths -> challenge (2 beats) -> finals
// -> done; downgrade re-enters challenge; conscript:no resumes
// challenge). tableEarnedPaths is the engine's pricing.
function stubGame(overrides) {
  const calls = { chosen: [] };
  const beatOpts = (overrides && overrides.beatOpts) || [{ id: 'beat:mercy' }, { id: 'beat:trial' }];
  const g = {
    over: false, tbfight: null, dayPart: 2,
    state: { scholar: { day: 100, tableChoices: { options: [] } } },
    _pg: { tableDone: true, tableWaiting: false, tableAnnounced: true, tableSittingId: 7 },
    _T: { phase: 'paths', path: null, branch: 'light', beat: 0, failedDoors: [] },
    _earned: ['feared', 'beloved', 'assimilated', 'defiant'],
    _beatOpts: beatOpts,
    progState() { return this._pg; },
    tableState() { return this._T; },
    tableEarnedPaths() {
      return this._earned.map(function (id) { return { id: id, earned: true, why: 'earned' }; });
    },
    chooseTableOption(id) {
      calls.chosen.push(id);
      const T = this._T;
      if (id.indexOf('path:') === 0 && T.phase === 'paths') {
        T.path = id.slice(5); T.phase = 'challenge'; T.beat = 0;
        this.state.scholar.tableChoices = { options: this._beatOpts.slice() };
        return null;
      }
      if (id.indexOf('beat:') === 0 && T.phase === 'challenge') {
        T.beat = (T.beat | 0) + 1;
        if (T.beat >= 2) { T.phase = 'finals'; this.state.scholar.tableChoices = { options: [{ id: 'final:mercy' }] }; }
        return null;
      }
      if (id.indexOf('final:') === 0 && T.phase === 'finals') {
        T.phase = 'done'; this.state.scholar.tableChoices = { options: [] };
        return null;
      }
      if (id.indexOf('downgrade:') === 0 && T.phase === 'downgrade') {
        T.path = id.slice(10); T.phase = 'challenge'; T.beat = 0;
        this.state.scholar.tableChoices = { options: this._beatOpts.slice() };
        return null;
      }
      if (id.indexOf('conscript:') === 0 && T.phase === 'conscript') {
        T.phase = 'challenge'; T.beat = 0;
        this.state.scholar.tableChoices = { options: this._beatOpts.slice() };
        return null;
      }
      return null;
    },
    _calls: calls,
  };
  const out = Object.assign(g, overrides || {});
  // Default paths-phase options (the 7-door offer, earned subset).
  if (!overrides || !overrides._noPathsOpts) {
    out.state.scholar.tableChoices = { options: out._earned.map(function (id) { return { id: 'path:' + id }; }) };
  }
  return out;
}

// --- (A) RED: gate OFF never drives the verb, never reads the engine.
withEnv({ DOORWALK_B: null }, () => {
  assert.strictEqual(layerOn(), false);
  resetDoorwalkStats();
  const bomb = {
    get over() { throw new Error('read over'); },
    get tbfight() { throw new Error('read tbfight'); },
    tableState() { throw new Error('tableState touched'); },
    chooseTableOption() { throw new Error('verb touched'); },
  };
  doorWalkDrive(bomb, {});
  const st = doorwalkStats();
  assert.strictEqual(st.answers, 0);
  assert.strictEqual(st.doorsEntered, 0);
  assert.strictEqual(Object.keys(st.skips).length, 0);
  ok('RED: gate OFF never drives the verb and never reads the engine', true);
});

// --- (B) GREEN: gate-ON fixtures.
withEnv({ DOORWALK_B: '1' }, () => {
  assert.strictEqual(layerOn(), true);
  // Rotation mapping pinned (prereg table).
  assert.deepStrictEqual([53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008].map(assignedDoorFor),
    ['defiant', 'assimilated', 'beloved', 'relay', 'defiant', 'assimilated', 'beloved', 'relay']);
  ok('GREEN: rotation mapping pinned (53001..53008 -> defiant/assimilated/beloved/relay/...)', true);

  // B1: assigned door offered -> walked once, played through to done.
  resetDoorwalkStats();
  let g = stubGame(); let ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.deepStrictEqual(g._calls.chosen, ['path:assimilated', 'beat:mercy', 'beat:mercy', 'final:mercy']);
  let st = doorwalkStats();
  assert.strictEqual(st.doorsEntered, 1);
  assert.strictEqual(st.walked[0].path, 'assimilated');
  assert.strictEqual(st.walked[0].fellBack, false);
  assert.strictEqual(st.walked[0].branch, 'light');
  assert.strictEqual(st.answers, 4);
  assert.strictEqual(g._T.phase, 'done');
  assert.strictEqual(ctx.dwWalked, 1);
  ok('GREEN: assigned door offered -> walked once, beats + final played to done', true);
  // B2: the same sitting re-offered -> already-entered, verb never called again.
  g._T.phase = 'paths'; g._T.path = null;
  g.state.scholar.tableChoices = { options: g._earned.map(function (id) { return { id: 'path:' + id }; }) };
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 4);
  assert.strictEqual(doorwalkStats().skips['already-entered'], 1);
  ok('GREEN: already-entered — a re-offer for the same sitting is never re-walked', true);
  // B3: assigned door NOT offered -> fallback first non-feared in offered order.
  resetDoorwalkStats();
  g = stubGame({ _earned: ['feared', 'beloved', 'defiant'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53004' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:beloved');
  st = doorwalkStats();
  assert.strictEqual(st.walked[0].fellBack, true);
  assert.strictEqual(st.offers[0].rule.indexOf('fallback-non-feared'), 0);
  ok('GREEN: assigned door not offered -> fallback first non-feared, recorded', true);
  // B4: only feared offered -> walked feared ('only-feared').
  resetDoorwalkStats();
  g = stubGame({ _earned: ['feared'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53003' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:feared');
  assert.strictEqual(doorwalkStats().offers[0].rule, 'only-feared');
  ok('GREEN: only feared offered -> walked feared, rule recorded', true);
  // B5: live fight -> skip 'fight-live', verb never called.
  resetDoorwalkStats();
  g = stubGame({ tbfight: { over: false } }); ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(doorwalkStats().skips['fight-live'], 1);
  ok('GREEN: live fight -> classified skip, verb never called', true);
  // B6: no modal pending -> skip 'preview-null'.
  resetDoorwalkStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = null; g.state.scholar.tableChoices = { options: [] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(doorwalkStats().skips['preview-null'], 1);
  ok('GREEN: no modal pending -> classified skip', true);
  // B7: seat-taker phase -> skip 'seat-taker', verb never called.
  resetDoorwalkStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'seat-taker';
  g.state.scholar.tableChoices = { options: [{ id: 'seat:self' }, { id: 'seat:villager-1' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(doorwalkStats().skips['seat-taker'], 1);
  ok('GREEN: seat-taker phase -> classified skip, sitter never chosen', true);
  // B8: trial-only beat -> skip 'trial-only', the door pick stands, the trial is never taken.
  resetDoorwalkStats();
  g = stubGame({ beatOpts: [{ id: 'beat:trial' }] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.deepStrictEqual(g._calls.chosen, ['path:assimilated']);
  assert.strictEqual(doorwalkStats().skips['trial-only'], 1);
  assert.strictEqual(doorwalkStats().doorsEntered, 1);
  ok('GREEN: trial-only beat -> classified skip, trial never opted into', true);
  // B9: conscript phase -> refused ('conscript:no'), challenge resumes.
  resetDoorwalkStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'conscript'; g._T.path = 'feared';
  g.state.scholar.tableChoices = { options: [{ id: 'conscript:yes' }, { id: 'conscript:no' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'conscript:no');
  assert.strictEqual(g._T.phase, 'done'); // refused, then the challenge plays out to done
  ok('GREEN: dark conscript -> refused, challenge resumes', true);
  // B10: downgrade phase -> assigned door re-applied among remaining earned.
  resetDoorwalkStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'downgrade'; g._T.path = 'feared'; g._T.failedDoors = ['feared'];
  g.state.scholar.tableChoices = { options: [{ id: 'downgrade:beloved' }, { id: 'downgrade:defiant' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53003' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'downgrade:beloved');
  assert.strictEqual(doorwalkStats().doorsEntered, 1);
  assert.strictEqual(doorwalkStats().walked[0].path, 'beloved');
  ok('GREEN: downgrade -> door rule re-applied among remaining earned doors', true);
  // B11: game over -> skip 'over'.
  resetDoorwalkStats();
  g = stubGame({ over: true }); ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(doorwalkStats().skips.over, 1);
  ok('GREEN: game over -> classified skip', true);
  // B12: paths phase with NO options -> skip 'no-doors-offered'.
  resetDoorwalkStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'paths'; g.state.scholar.tableChoices = { options: [] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53006' }, () => { doorWalkDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(doorwalkStats().skips['no-doors-offered'], 1);
  ok('GREEN: paths phase with no options -> classified skip no-doors-offered', true);
});

// --- (E) ANALYZER pure functions (before the live legs — fast).
(function () {
  const row = function (day, over) {
    return Object.assign({ day: day, rawStanding: 100 + day, rosterSize: 12, living: 12,
      w4kills: 0, seat: 'none', feastSurgeUsed: false, sentimentTaught: true,
      pairDay: false, scholarAtHaven: true, preview: null }, over || {});
  };
  const base = { daily: [row(90), row(91), row(92)] };
  const armed = { daily: [row(90), row(91), row(92)] };
  const m1 = ANALYZE.preEntryMatch(base, armed, 95);
  assert.strictEqual(m1.match, true);
  assert.strictEqual(m1.daysCompared, 3);
  ok('ANALYZER: preEntryMatch identical rows -> match', true);
  const armed2 = { daily: [row(90), row(91, { rawStanding: 999 }), row(92)] };
  const m2 = ANALYZE.preEntryMatch(base, armed2, 95);
  assert.strictEqual(m2.match, false);
  assert.strictEqual(/day 91 field rawStanding/.test(m2.firstDiff), true);
  ok('ANALYZER: preEntryMatch differing standing -> mismatch named', true);
  assert.strictEqual(ANALYZE.starvation({ teleDeaths: [{ cause: 'starvation' }, { cause: 'monster' }, { kind: 'starved' }] }), 2);
  ok('ANALYZER: starvation counts cause/kind naming starvation', true);
  assert.strictEqual(ANALYZE.medianOf([150, 79, 86, 89, 95, 118, 139, 150]), 106.5);
  ok('ANALYZER: medianOf matches the sitstep2 band median', true);
  // entriesFromVerbs: a path: pick that lands in challenge counts;
  // a refused/failed one does not.
  const fake = { doorVerbMsgs: [
    { day: 90, call: 'tableTakeSeat', arg: null, ok: true, before: { phase: null }, after: { phase: 'paths', path: null }, offered: [] },
    { day: 90, call: 'chooseTableOption', arg: 'path:beloved', ok: false, before: { phase: 'paths', path: null }, after: { phase: 'challenge', path: 'beloved', branch: 'light' }, offered: ['path:feared', 'path:beloved'] },
    { day: 90, call: 'chooseTableOption', arg: 'beat:mercy', ok: false, before: { phase: 'challenge', path: 'beloved' }, after: { phase: 'challenge', path: 'beloved' }, offered: ['beat:mercy'] },
  ] };
  const entries = ANALYZE.entriesFromVerbs(fake);
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(entries[0].path, 'beloved');
  assert.strictEqual(entries[0].day, 90);
  assert.deepStrictEqual(entries[0].offered, ['path:feared', 'path:beloved']);
  ok('ANALYZER: entriesFromVerbs counts a paths->challenge door pick only', true);
  const satRow = { day: 100, tableDone: true, seat: 'lesser' };
  assert.strictEqual(classifySeatDay(satRow, []).gate, 'sat');
  const readyRow = { day: 100, tableDone: false, seat: 'lesser', preview: { ready: true, why: '' } };
  assert.strictEqual(classifySeatDay(readyRow, []).gate, 'offer-not-taken');
  ok('ANALYZER: classifySeatDay gates (sat / offer-not-taken)', true);
})();

// --- (C) COMPOSITION against a real loaded game.
(async function () {
  const { loadGame, setupGame } = require('./sim-harness');
  const STAGED = require('./policies/competent-stageally-a');
  const LINK = require('./policies/competent-linkdrive-b');
  const LF = require('./policies/competent-linkfeast-b');
  const { Game } = await loadGame({ seed: 53001, mode: 'competent-doorwalk-b-proof', fullTelemetry: false });
  await setupGame(Game);
  let stagedDaily = 0, stagedUpkeep = 0, linkCalls = 0;
  const origDaily = STAGED.stagedPolicy.daily;
  const origUpkeep = STAGED.stagedPolicy.upkeep;
  const origLink = LINK.linkDrive;
  STAGED.stagedPolicy.daily = function () { stagedDaily++; return origDaily.apply(this, arguments); };
  STAGED.stagedPolicy.upkeep = function () { stagedUpkeep++; return origUpkeep.apply(this, arguments); };
  LINK.linkDrive = function () { linkCalls++; return origLink.apply(this, arguments); };
  try {
    const ctx = {};
    DW.doorwalk.daily(Game, ctx);
    assert.strictEqual(stagedDaily, 1);
    assert.strictEqual(linkCalls, 1);
    ok('COMPOSITION: wrapper daily runs linkfeast daily exactly once', true);
    DW.doorwalk.upkeep(Game, ctx);
    assert.strictEqual(stagedUpkeep, 1);
    ok('COMPOSITION: wrapper upkeep runs linkfeast upkeep exactly once (+ door drive)', true);
  } finally {
    STAGED.stagedPolicy.daily = origDaily;
    STAGED.stagedPolicy.upkeep = origUpkeep;
    LINK.linkDrive = origLink;
  }

  // --- (D) LIVE: judged driver twice on seed 53001 (no-seat seed).
  const tmpBase = '/tmp/doorwalk-b-proof-baseline';
  const tmpArmed = '/tmp/doorwalk-b-proof-armed';
  const tmpSmoke = '/tmp/doorwalk-b-proof-smoke';
  [tmpBase, tmpArmed, tmpSmoke].forEach(function (d) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {}
    fs.mkdirSync(d, { recursive: true });
  });
  const run = function (policy, outdir, seeds, runName) {
    const env = Object.assign({}, process.env, { SEEDS: seeds, DAYS: '150', RUN: runName, POLICY: policy, OUTDIR: outdir });
    execSync('node scripts/doorwalk-b-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
  };
  run('baseline', tmpBase, '53001', 'doorwalk-proof-baseline');
  run('armed', tmpArmed, '53001', 'doorwalk-proof-armed');
  const b = JSON.parse(fs.readFileSync(path.join(tmpBase, 'doorwalk-b-s53001-doorwalk-proof-baseline.json'), 'utf8'));
  const a = JSON.parse(fs.readFileSync(path.join(tmpArmed, 'doorwalk-b-s53001-doorwalk-proof-armed.json'), 'utf8'));
  assert.strictEqual(b.instrumentErrors.length, 0);
  assert.strictEqual(a.instrumentErrors.length, 0);
  ok('LIVE: both proof legs run with 0 instrument errors', true);
  assert.strictEqual((a.doorwalkStats || {}).doorsEntered, 0);
  assert.strictEqual((b.doorwalkStats || {}).doorsEntered, 0);
  ok('LIVE: no-seat seed 53001 — the drive never fires in either leg', true);
  const head = function (o) {
    return { days: o.days, gameDays: o.gameDays, endReason: o.endReason, standing: o.standing,
      maxWave: o.maxWave, finalSeat: (o.finalSeat || {}).seat || null,
      w4kills: (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length };
  };
  assert.deepStrictEqual(head(a), head(b));
  ok('LIVE: armed reproduces baseline EXACTLY on no-seat seed 53001 (idle reads are trajectory-neutral)', true);
  assert.strictEqual(b.finalSeat ? b.finalSeat.seat : null, 'none');
  ok('LIVE: seed 53001 earns no seat in either leg (smoke structural check)', true);

  // --- (D2) LIVE SMOKE: armed leg on 53003 (a sat seed) — the drain
  // must walk a door end to end on the real engine.
  run('armed', tmpSmoke, '53003', 'doorwalk-proof-smoke');
  const s = JSON.parse(fs.readFileSync(path.join(tmpSmoke, 'doorwalk-b-s53003-doorwalk-proof-smoke.json'), 'utf8'));
  assert.strictEqual(s.instrumentErrors.length, 0);
  ok('LIVE SMOKE: seed 53003 armed leg runs with 0 instrument errors', true);
  assert.strictEqual((s.takeseatStats || {}).seatTaken, 1);
  ok('LIVE SMOKE: seed 53003 sits (sit drive fires on the wrapper)', true);
  assert.ok(((s.doorwalkStats || {}).doorsEntered | 0) >= 1, 'a door is entered on 53003');
  const walked = (s.doorwalkStats || {}).walked || [];
  assert.ok(walked.length >= 1 && walked[0].day === (s.takeseatStats || {}).seatDay, 'entry day = sit day');
  ok('LIVE SMOKE: seed 53003 walks a door on its sit day (' + walked.map(function (w) { return w.path + '@d' + w.day + '/' + (w.branch || '?'); }).join(', ') + ')', true);
  assert.ok(((s.doorwalkStats || {}).answers | 0) >= 1, 'the walked path is answered (door + beats/final as offered)');
  ok('LIVE SMOKE: the walked path is played through (answers >= 1)', true);

  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
