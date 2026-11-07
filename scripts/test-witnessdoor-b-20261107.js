#!/usr/bin/env node
// scripts/test-witnessdoor-b-20261107.js — proof for the witness-door
// drive (arm sim-witnessdoor-b, run fleshout-loop-b-20261107T1830Z).
//
// Sections:
//   (A) RED: gate OFF never drives the verb — pure delegation, zero
//       Game reads when off (a stub whose engine methods throw if
//       touched proves it).
//   (B) GREEN: gate-ON fixtures on stub Games — witness-first
//       mapping pinned for band 53201–53212; witness offered ->
//       walked witness once and played through to 'done'; witness
//       not offered -> the doorwalk rotation fallback EXACTLY
//       (assigned / first non-feared / only-feared); fight-live /
//       preview-null / seat-taker / already-entered / trial-only /
//       conscript-refuse / downgrade (witness-first, then rotation)
//       / game-over are classified skips and never call the verb
//       wrongly.
//   (C) COMPOSITION: against a real loaded game, the wrapper daily
//       runs doorwalk daily exactly once; upkeep with the gate OFF
//       runs doorwalk upkeep exactly once (linkfeast upkeep once
//       via doorwalk, doorwalk drive untouched by this file); upkeep
//       with the gate ON runs linkfeast upkeep exactly once
//       directly and does NOT call doorwalk upkeep.
//   (D) LIVE: the judged driver, run twice on seed 53001 (a no-seat
//       seed on this base, so the drive can never fire) — baseline
//       vs armed must reproduce the headline numbers EXACTLY,
//       proving the idle reads draw no RNG and write no state in
//       practice; plus a 1-seed ARMED smoke leg on a judged-band sat
//       seed (WIT_SMOKE_SEED, named by the baseline leg) in /tmp
//       asserting structural invariants (sit happened, witness
//       walked when offered, 0 instrument errors).
//   (E) ANALYZER: pure-function fixtures (preEntryMatch,
//       entriesFromVerbs, starvation, medianOf, classifySeatDay,
//       doorStatsOf, effectiveDays / nonInferior, witnessWin via
//       analyzeSeed incl. the downgrade-negates variant).
//
// Usage: node scripts/test-witnessdoor-b-20261107.js
//   (D) runs two 150d sims in /tmp; allow ~4-6 min. The smoke leg
//   runs only when WIT_SMOKE_SEED is set; SKIP_LIVE=1 skips the
//   neutrality legs (re-run after the baseline leg, with the smoke
//   seed, to gate the armed leg without re-running neutrality).
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const WIT = require('./policies/competent-witnessdoor-b');
const DW = require('./policies/competent-doorwalk-b');
const { layerOn, witnessDoorDrive, resetWitnessdoorStats, witnessdoorStats } = WIT;
const ANALYZE = require('./witnessdoor-b-analyze-20261107');
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
// one (the doorwalk proof's stub, with witness in the default earned
// set). tableChoices options change with the phase, exactly as
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
    _earned: ['witness', 'beloved', 'assimilated', 'defiant'],
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
withEnv({ WITNESSDOOR_B: null }, () => {
  assert.strictEqual(layerOn(), false);
  resetWitnessdoorStats();
  const bomb = {
    get over() { throw new Error('read over'); },
    get tbfight() { throw new Error('read tbfight'); },
    tableState() { throw new Error('tableState touched'); },
    chooseTableOption() { throw new Error('verb touched'); },
  };
  witnessDoorDrive(bomb, {});
  const st = witnessdoorStats();
  assert.strictEqual(st.answers, 0);
  assert.strictEqual(st.doorsEntered, 0);
  assert.strictEqual(Object.keys(st.skips).length, 0);
  ok('RED: gate OFF never drives the verb and never reads the engine', true);
});

// --- (B) GREEN: gate-ON fixtures.
withEnv({ WITNESSDOOR_B: '1' }, () => {
  assert.strictEqual(layerOn(), true);
  // Rotation mapping pinned for THIS band (prereg table):
  // 53201 defiant, 53202 assimilated, 53203 beloved, 53204 relay, ...
  assert.deepStrictEqual(
    [53201, 53202, 53203, 53204, 53205, 53206, 53207, 53208, 53209, 53210, 53211, 53212].map(DW.assignedDoorFor),
    ['defiant', 'assimilated', 'beloved', 'relay', 'defiant', 'assimilated', 'beloved', 'relay', 'defiant', 'assimilated', 'beloved', 'relay']);
  ok('GREEN: rotation mapping pinned (53201..53212 -> defiant/assimilated/beloved/relay/...)', true);

  // B1: witness offered (assigned is beloved) -> walked WITNESS once, played through to done.
  resetWitnessdoorStats();
  let g = stubGame(); let ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.deepStrictEqual(g._calls.chosen, ['path:witness', 'beat:mercy', 'beat:mercy', 'final:mercy']);
  let st = witnessdoorStats();
  assert.strictEqual(st.doorsEntered, 1);
  assert.strictEqual(st.walked[0].path, 'witness');
  assert.strictEqual(st.walked[0].fellBack, false);
  assert.strictEqual(st.walked[0].branch, 'light');
  assert.strictEqual(st.offers[0].rule, 'witness-first');
  assert.strictEqual(st.answers, 4);
  assert.strictEqual(g._T.phase, 'done');
  assert.strictEqual(ctx.wdWalked, 1);
  ok('GREEN: witness offered -> walked witness once, beats + final played to done', true);
  // B2: the same sitting re-offered -> already-entered, verb never called again.
  g._T.phase = 'paths'; g._T.path = null;
  g.state.scholar.tableChoices = { options: g._earned.map(function (id) { return { id: 'path:' + id }; }) };
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 4);
  assert.strictEqual(witnessdoorStats().skips['already-entered'], 1);
  ok('GREEN: already-entered — a re-offer for the same sitting is never re-walked', true);
  // B3: witness NOT offered -> the doorwalk rotation fallback EXACTLY (assigned beloved).
  resetWitnessdoorStats();
  g = stubGame({ _earned: ['beloved', 'assimilated', 'defiant'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:beloved');
  st = witnessdoorStats();
  assert.strictEqual(st.walked[0].fellBack, false);
  assert.strictEqual(st.offers[0].rule.indexOf('assigned+beloved'), 0);
  ok('GREEN: witness not offered -> doorwalk rotation fallback (assigned beloved), recorded', true);
  // B4: witness not offered AND assigned not offered -> first non-feared fallback (the doorwalk rule).
  resetWitnessdoorStats();
  g = stubGame({ _earned: ['assimilated', 'defiant'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:assimilated');
  assert.strictEqual(witnessdoorStats().walked[0].fellBack, true);
  assert.strictEqual(witnessdoorStats().offers[0].rule.indexOf('fallback-non-feared'), 0);
  ok('GREEN: assigned not offered either -> first non-feared fallback, recorded', true);
  // B5: only witness offered -> walked witness ('witness-first', not the rotation's only-feared).
  resetWitnessdoorStats();
  g = stubGame({ _earned: ['witness'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:witness');
  assert.strictEqual(witnessdoorStats().offers[0].rule, 'witness-first');
  ok('GREEN: only witness offered -> walked witness via witness-first', true);
  // B6: live fight -> skip 'fight-live', verb never called.
  resetWitnessdoorStats();
  g = stubGame({ tbfight: { over: false } }); ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(witnessdoorStats().skips['fight-live'], 1);
  ok('GREEN: live fight -> classified skip, verb never called', true);
  // B7: no modal pending -> skip 'preview-null'.
  resetWitnessdoorStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = null; g.state.scholar.tableChoices = { options: [] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(witnessdoorStats().skips['preview-null'], 1);
  ok('GREEN: no modal pending -> classified skip', true);
  // B8: seat-taker phase -> skip 'seat-taker', verb never called.
  resetWitnessdoorStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'seat-taker';
  g.state.scholar.tableChoices = { options: [{ id: 'seat:self' }, { id: 'seat:villager-1' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(witnessdoorStats().skips['seat-taker'], 1);
  ok('GREEN: seat-taker phase -> classified skip, sitter never chosen', true);
  // B9: trial-only beat -> skip 'trial-only', the door pick stands, the trial is never taken.
  resetWitnessdoorStats();
  g = stubGame({ beatOpts: [{ id: 'beat:trial' }] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.deepStrictEqual(g._calls.chosen, ['path:witness']);
  assert.strictEqual(witnessdoorStats().skips['trial-only'], 1);
  assert.strictEqual(witnessdoorStats().doorsEntered, 1);
  ok('GREEN: trial-only beat -> classified skip, trial never opted into', true);
  // B10: conscript phase -> refused ('conscript:no'), challenge resumes.
  resetWitnessdoorStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'conscript'; g._T.path = 'witness';
  g.state.scholar.tableChoices = { options: [{ id: 'conscript:yes' }, { id: 'conscript:no' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'conscript:no');
  assert.strictEqual(g._T.phase, 'done'); // refused, then the challenge plays out to done
  ok('GREEN: dark conscript -> refused, challenge resumes', true);
  // B11: downgrade phase with witness still available -> witness-first.
  resetWitnessdoorStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'downgrade'; g._T.path = 'beloved'; g._T.failedDoors = ['beloved'];
  g.state.scholar.tableChoices = { options: [{ id: 'downgrade:witness' }, { id: 'downgrade:defiant' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'downgrade:witness');
  assert.strictEqual(witnessdoorStats().doorsEntered, 1);
  assert.strictEqual(witnessdoorStats().walked[0].path, 'witness');
  ok('GREEN: downgrade with witness available -> witness-first', true);
  // B12: downgrade phase without witness -> doorwalk downgrade rule (assigned beloved).
  resetWitnessdoorStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'downgrade'; g._T.path = 'witness'; g._T.failedDoors = ['witness'];
  g.state.scholar.tableChoices = { options: [{ id: 'downgrade:beloved' }, { id: 'downgrade:defiant' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'downgrade:beloved');
  assert.strictEqual(witnessdoorStats().walked[0].path, 'beloved');
  ok('GREEN: downgrade without witness -> doorwalk downgrade rule (assigned)', true);
  // B13: game over -> skip 'over'.
  resetWitnessdoorStats();
  g = stubGame({ over: true }); ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(witnessdoorStats().skips.over, 1);
  ok('GREEN: game over -> classified skip', true);
  // B14: paths phase with NO options -> skip 'no-doors-offered'.
  resetWitnessdoorStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'paths'; g.state.scholar.tableChoices = { options: [] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53203' }, () => { witnessDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(witnessdoorStats().skips['no-doors-offered'], 1);
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
    { day: 90, call: 'chooseTableOption', arg: 'path:witness', ok: false, before: { phase: 'paths', path: null }, after: { phase: 'challenge', path: 'witness', branch: 'light' }, offered: ['path:witness', 'path:beloved'] },
    { day: 90, call: 'chooseTableOption', arg: 'beat:mercy', ok: false, before: { phase: 'challenge', path: 'witness' }, after: { phase: 'challenge', path: 'witness' }, offered: ['beat:mercy'] },
  ] };
  const entries = ANALYZE.entriesFromVerbs(fake);
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(entries[0].path, 'witness');
  assert.strictEqual(entries[0].day, 90);
  assert.deepStrictEqual(entries[0].offered, ['path:witness', 'path:beloved']);
  ok('ANALYZER: entriesFromVerbs counts a paths->challenge door pick only', true);
  const satRow = { day: 100, tableDone: true, seat: 'lesser' };
  assert.strictEqual(classifySeatDay(satRow, []).gate, 'sat');
  const readyRow = { day: 100, tableDone: false, seat: 'lesser', preview: { ready: true, why: '' } };
  assert.strictEqual(classifySeatDay(readyRow, []).gate, 'offer-not-taken');
  ok('ANALYZER: classifySeatDay gates (sat / offer-not-taken)', true);
  // doorStatsOf: armed leg reads witnessdoorStats, baseline reads doorwalkStats.
  assert.strictEqual(ANALYZE.doorStatsOf({ policy: 'witnessdoor-armed', witnessdoorStats: { doorsEntered: 1 }, doorwalkStats: { doorsEntered: 0 } }).doorsEntered, 1);
  assert.strictEqual(ANALYZE.doorStatsOf({ policy: 'witnessdoor-baseline', witnessdoorStats: { doorsEntered: 0 }, doorwalkStats: { doorsEntered: 2 } }).doorsEntered, 2);
  ok('ANALYZER: doorStatsOf picks the active drive per leg', true);
  // effectiveDays / nonInferior: a win counts at the horizon.
  assert.strictEqual(ANALYZE.effectiveDays(90, true, 150), 150);
  assert.strictEqual(ANALYZE.effectiveDays(97, false, 150), 97);
  assert.strictEqual(ANALYZE.nonInferior(90, true, 150, 150), true);
  assert.strictEqual(ANALYZE.nonInferior(97, false, 150, 150), false);
  assert.strictEqual(ANALYZE.nonInferior(150, false, 150, 150), true);
  ok('ANALYZER: effectiveDays / nonInferior — a win counts at horizon, an earlier death fails', true);
  // witnessWin via analyzeSeed: witness walked + won + final on witness + no downgrade.
  const fakeSeed = function (over) {
    return Object.assign({
      seed: 53203, policy: 'witnessdoor-armed', days: 90, gameDays: 90,
      endReason: 'won', won: true, over: true, standing: 200, scaleRank: 'regional',
      maxWave: 5, unlockedWave: 5,
      daily: [Object.assign(row(90), { tableDone: true, seat: 'lesser' })],
      sitVerbMsgs: [], doorVerbMsgs: fake.doorVerbMsgs,
      takeseatStats: { seatTaken: 1, seatDay: 90, seatKind: 'lesser', skips: {}, errors: 0 },
      linkdriveStats: {}, feastdriveStats: {}, waveKillLog: [], teleDeaths: [],
      finalSeat: { seat: 'lesser' }, instrumentErrors: [],
      witnessdoorStats: {
        walked: [{ day: 90, path: 'witness', branch: 'light', door: 'path:witness', fellBack: false }],
        offers: [{ offered: ['witness', 'beloved'], assigned: 'beloved', picked: 'witness', rule: 'witness-first' }],
        log: [{ phase: 'challenge', path: 'witness' }, { phase: 'finals', path: 'witness', optionId: 'final:mercy' }],
        answers: 5, skips: {}, errors: 0, stalls: 0,
      },
      doorwalkStats: { walked: [], offers: [], log: [], answers: 0, skips: {}, errors: 0, stalls: 0 },
    }, over || {});
  };
  const r1 = ANALYZE.analyzeSeed(fakeSeed());
  assert.strictEqual(r1.witnessEntered, 1);
  assert.strictEqual(r1.witnessWin, true);
  assert.strictEqual(r1.witnessOffered, true);
  assert.strictEqual(r1.witnessOfferedUnwalked, false);
  assert.strictEqual(r1.verbWalkedAgree, true);
  ok('ANALYZER: analyzeSeed — witness walked + won + final on witness -> witnessWin', true);
  const r2 = ANALYZE.analyzeSeed(fakeSeed({
    witnessdoorStats: {
      walked: [{ day: 90, path: 'witness', branch: 'dark', door: 'path:witness', fellBack: false },
               { day: 90, path: 'beloved', branch: 'light', door: 'downgrade:beloved', fellBack: true }],
      offers: [{ offered: ['witness', 'beloved'], assigned: 'beloved', picked: 'witness', rule: 'witness-first' }],
      log: [{ phase: 'challenge', path: 'witness' }, { phase: 'downgrade', path: 'witness' },
            { phase: 'challenge', path: 'beloved' }, { phase: 'finals', path: 'beloved', optionId: 'final:mercy' }],
      answers: 8, skips: {}, errors: 0, stalls: 0,
    },
  }));
  assert.strictEqual(r2.witnessEntered, 1);
  assert.strictEqual(r2.witnessWin, false); // downgrade fired: the win came on the second door
  assert.strictEqual(r2.downgradeAnswers, 1);
  ok('ANALYZER: analyzeSeed — witness walked then downgraded -> NOT a witness win', true);
})();

// --- (C) COMPOSITION against a real loaded game.
(async function () {
  const { loadGame, setupGame } = require('./sim-harness');
  const DWmod = require('./policies/competent-doorwalk-b');
  const LF = require('./policies/competent-linkfeast-b');
  const { Game } = await loadGame({ seed: 53001, mode: 'competent-witnessdoor-b-proof', fullTelemetry: false });
  await setupGame(Game);
  let dwDaily = 0, dwUpkeep = 0, lfUpkeep = 0;
  const origDwDaily = DWmod.doorwalk.daily;
  const origDwUpkeep = DWmod.doorwalk.upkeep;
  const origLfUpkeep = LF.linkfeast.upkeep;
  DWmod.doorwalk.daily = function () { dwDaily++; return origDwDaily.apply(this, arguments); };
  DWmod.doorwalk.upkeep = function () { dwUpkeep++; return origDwUpkeep.apply(this, arguments); };
  LF.linkfeast.upkeep = function () { lfUpkeep++; return origLfUpkeep.apply(this, arguments); };
  try {
    const ctx = {};
    WIT.witnessdoor.daily(Game, ctx);
    assert.strictEqual(dwDaily, 1);
    ok('COMPOSITION: wrapper daily runs doorwalk daily exactly once', true);
    // Gate OFF: upkeep delegates to doorwalk upkeep exactly once
    // (linkfeast upkeep once, via doorwalk).
    withEnv({ WITNESSDOOR_B: null, DOORWALK_B: '1' }, () => {
      dwUpkeep = 0; lfUpkeep = 0;
      WIT.witnessdoor.upkeep(Game, ctx);
      assert.strictEqual(dwUpkeep, 1);
      assert.strictEqual(lfUpkeep, 1);
    });
    ok('COMPOSITION: gate OFF upkeep runs doorwalk upkeep exactly once (+ linkfeast once via it)', true);
    // Gate ON: upkeep runs linkfeast upkeep exactly once directly
    // and does NOT call doorwalk upkeep.
    withEnv({ WITNESSDOOR_B: '1', DOORWALK_B: '1' }, () => {
      dwUpkeep = 0; lfUpkeep = 0;
      WIT.witnessdoor.upkeep(Game, ctx);
      assert.strictEqual(dwUpkeep, 0);
      assert.strictEqual(lfUpkeep, 1);
    });
    ok('COMPOSITION: gate ON upkeep runs linkfeast upkeep exactly once directly, doorwalk upkeep never called', true);
  } finally {
    DWmod.doorwalk.daily = origDwDaily;
    DWmod.doorwalk.upkeep = origDwUpkeep;
    LF.linkfeast.upkeep = origLfUpkeep;
  }

  // --- (D) LIVE: judged driver twice on seed 53001 (no-seat seed).
  const skipLive = process.env.SKIP_LIVE === '1';
  const smokeSeed = process.env.WIT_SMOKE_SEED ? parseInt(process.env.WIT_SMOKE_SEED, 10) : null;
  const tmpBase = '/tmp/witnessdoor-b-proof-baseline';
  const tmpArmed = '/tmp/witnessdoor-b-proof-armed';
  const tmpSmoke = '/tmp/witnessdoor-b-proof-smoke';
  [tmpBase, tmpArmed, tmpSmoke].forEach(function (d) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {}
    fs.mkdirSync(d, { recursive: true });
  });
  const run = function (policy, outdir, seeds, runName) {
    const env = Object.assign({}, process.env, { SEEDS: seeds, DAYS: '150', RUN: runName, POLICY: policy, OUTDIR: outdir });
    execSync('node scripts/witnessdoor-b-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
  };
  if (!skipLive) {
    run('baseline', tmpBase, '53001', 'witnessdoor-proof-baseline');
    run('armed', tmpArmed, '53001', 'witnessdoor-proof-armed');
    const b = JSON.parse(fs.readFileSync(path.join(tmpBase, 'witnessdoor-b-s53001-witnessdoor-proof-baseline.json'), 'utf8'));
    const a = JSON.parse(fs.readFileSync(path.join(tmpArmed, 'witnessdoor-b-s53001-witnessdoor-proof-armed.json'), 'utf8'));
    assert.strictEqual(b.instrumentErrors.length, 0);
    assert.strictEqual(a.instrumentErrors.length, 0);
    ok('LIVE: both proof legs run with 0 instrument errors', true);
    assert.strictEqual((a.witnessdoorStats || {}).doorsEntered, 0);
    assert.strictEqual((b.doorwalkStats || {}).doorsEntered, 0);
    ok('LIVE: no-seat seed 53001 — neither drive fires in either leg', true);
    const head = function (o) {
      return { days: o.days, gameDays: o.gameDays, endReason: o.endReason, standing: o.standing,
        maxWave: o.maxWave, finalSeat: (o.finalSeat || {}).seat || null,
        w4kills: (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length };
    };
    assert.deepStrictEqual(head(a), head(b));
    ok('LIVE: armed reproduces baseline EXACTLY on no-seat seed 53001 (idle reads are trajectory-neutral)', true);
    assert.strictEqual(b.finalSeat ? b.finalSeat.seat : null, 'none');
    ok('LIVE: seed 53001 earns no seat in either leg (smoke structural check)', true);
  } else {
    console.log('LIVE: neutrality legs skipped (SKIP_LIVE=1)');
  }

  // --- (D2) LIVE SMOKE: armed leg on a judged-band sat seed — the
  // drain must walk a door end to end on the real engine, witness
  // first when offered.
  if (smokeSeed) {
    run('armed', tmpSmoke, String(smokeSeed), 'witnessdoor-proof-smoke');
    const s = JSON.parse(fs.readFileSync(path.join(tmpSmoke, 'witnessdoor-b-s' + smokeSeed + '-witnessdoor-proof-smoke.json'), 'utf8'));
    assert.strictEqual(s.instrumentErrors.length, 0);
    ok('LIVE SMOKE: seed ' + smokeSeed + ' armed leg runs with 0 instrument errors', true);
    assert.strictEqual((s.takeseatStats || {}).seatTaken, 1);
    ok('LIVE SMOKE: seed ' + smokeSeed + ' sits (sit drive fires on the wrapper)', true);
    assert.ok(((s.witnessdoorStats || {}).doorsEntered | 0) >= 1, 'a door is entered on ' + smokeSeed);
    const walked = (s.witnessdoorStats || {}).walked || [];
    assert.ok(walked.length >= 1 && walked[0].day === (s.takeseatStats || {}).seatDay, 'entry day = sit day');
    ok('LIVE SMOKE: seed ' + smokeSeed + ' walks a door on its sit day (' + walked.map(function (w) { return w.path + '@d' + w.day + '/' + (w.branch || '?'); }).join(', ') + ')', true);
    const offered = ((s.witnessdoorStats || {}).offers || [])[0];
    // The policy's offers[].offered holds UNPREFIXED door ids
    // ('witness', 'beloved', ...); the driver's verb record holds
    // prefixed ones ('path:witness') — do not mix the shapes.
    if (offered && offered.offered && offered.offered.indexOf('witness') >= 0) {
      assert.strictEqual(walked[0].path, 'witness', 'witness offered -> witness walked');
      ok('LIVE SMOKE: witness was offered on ' + smokeSeed + ' and the witness door was walked', true);
    } else {
      console.log('LIVE SMOKE: witness was NOT offered on ' + smokeSeed + ' (offered: ' + (offered ? offered.offered.join(',') : 'none') + ') — fallback walk recorded');
    }
    assert.ok(((s.witnessdoorStats || {}).answers | 0) >= 1, 'the walked path is answered (door + beats/final as offered)');
    ok('LIVE SMOKE: the walked path is played through (answers >= 1)', true);
  } else {
    console.log('LIVE SMOKE: skipped (WIT_SMOKE_SEED unset — run after the baseline leg names a sat seed)');
  }

  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
