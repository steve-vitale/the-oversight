#!/usr/bin/env node
// scripts/test-trialcombat-b-20261107.js — proof for the trial-by-combat
// drive (arm sim-trialcombat-b, run fleshout-loop-b-20261108T0530Z).
//
// Sections:
//   (A) RED: gate OFF never drives the verb — pure delegation, zero
//       Game reads when off (a stub whose engine methods throw if
//       touched proves it).
//   (B) GREEN: gate-ON fixtures on stub Games — the trial pick fires
//       ONLY at feared beat 1 with 'beat:trial' offered (never at
//       beat 0/2, never on another path, never when the gate is off);
//       feared offered -> walked feared once and played through to
//       'done' with the trial taken at beat 1; the feareddoor door
//       rule, downgrade, conscript, and all classified skips behave
//       exactly as the feareddoor proof pins them (the drive is a
//       copy of that drive with one pick changed).
//   (C) COMPOSITION: against a real loaded game, the wrapper daily
//       runs feareddoor daily exactly once; upkeep with the gate OFF
//       runs feareddoor upkeep exactly once (linkfeast upkeep once
//       via it); upkeep with the gate ON runs linkfeast upkeep
//       exactly once directly and does NOT call feareddoor upkeep.
//   (D) LIVE: the judged driver, run twice on seed 53001 (a no-seat
//       seed on this base, so the drive can never fire) — baseline
//       vs armed must reproduce the headline numbers EXACTLY,
//       proving the idle reads draw no RNG and write no state in
//       practice; plus a 1-seed ARMED smoke leg on a pilot sat seed
//       (TRIAL_SMOKE_SEED, named by the pilot) in /tmp asserting
//       structural invariants (sit happened, feared walked when
//       offered, trial offered/entered recorded, 0 instrument
//       errors). The pilot's substrate guard (8 seeds) is the same
//       neutrality property at full power, so the LIVE neutrality
//       legs may be skipped pre-pilot (SKIP_LIVE=1) and the smoke
//       runs after the pilot names its seed.
//   (E) ANALYZER: pure-function fixtures (preEntryMatch,
//       entriesFromVerbs, starvation, medianOf, classifySeatDay,
//       doorStatsOf, trialFromVerbs / trialFromPrompts /
//       trialFights, analyzeSeed trial fields incl. won-vs-lost).
//
// Usage: node scripts/test-trialcombat-b-20261107.js
//   (D) runs two 150d sims in /tmp; allow ~4-6 min. The smoke leg
//   runs only when TRIAL_SMOKE_SEED is set; SKIP_LIVE=1 skips the
//   neutrality legs.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const TC = require('./policies/competent-trialcombat-b');
const FEAR = require('./policies/competent-feareddoor-b');
const DW = require('./policies/competent-doorwalk-b');
const { layerOn, trialcombatDoorDrive, resetTrialcombatStats, trialcombatStats, pickOptionTrialcombat } = TC;
const ANALYZE = require('./trialcombat-b-analyze-20261107');
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
// one (the doorwalk proof's stub, with feared in the default earned
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
withEnv({ TRIALCOMBAT_B: null }, () => {
  assert.strictEqual(layerOn(), false);
  resetTrialcombatStats();
  const bomb = {
    get over() { throw new Error('read over'); },
    get tbfight() { throw new Error('read tbfight'); },
    tableState() { throw new Error('tableState touched'); },
    chooseTableOption() { throw new Error('verb touched'); },
  };
  trialcombatDoorDrive(bomb, {});
  const st = trialcombatStats();
  assert.strictEqual(st.answers, 0);
  assert.strictEqual(st.doorsEntered, 0);
  assert.strictEqual(Object.keys(st.skips).length, 0);
  ok('RED: gate OFF never drives the verb and never reads the engine', true);
});

// --- (B) GREEN: gate-ON fixtures.
withEnv({ TRIALCOMBAT_B: '1' }, () => {
  assert.strictEqual(layerOn(), true);
  // Rotation mapping pinned for THIS band (prereg table):
  // 53901 defiant, 53902 assimilated, 53903 beloved, 53904 relay, ...
  assert.deepStrictEqual(
    [53901, 53902, 53903, 53904, 53905, 53906, 53907, 53908].map(DW.assignedDoorFor),
    ['defiant', 'assimilated', 'beloved', 'relay', 'defiant', 'assimilated', 'beloved', 'relay']);
  ok('GREEN: rotation mapping pinned (53901..53908 -> defiant/assimilated/beloved/relay/...)', true);

  // B0: the trial pick itself, as a pure function — ONLY at feared
  // beat 1 with the option offered; everywhere else the safe first
  // option (trial filtered out), never the trial.
  (function () {
    const opts = [{ id: 'beat:lean' }, { id: 'beat:hold' }, { id: 'beat:trial' }];
    const at = function (path, beat) { return pickOptionTrialcombat(null, { phase: 'challenge', opts: opts, T: { path: path, beat: beat } }, 'defiant'); };
    assert.strictEqual(at('feared', 1).id, 'beat:trial');
    assert.strictEqual(at('feared', 1).note, 'trial-opt-in');
    assert.strictEqual(at('feared', 0).id, 'beat:lean');
    assert.strictEqual(at('feared', 2).id, 'beat:lean');
    assert.strictEqual(at('witness', 1).id, 'beat:lean');
    assert.strictEqual(at('beloved', 1).id, 'beat:lean');
    assert.strictEqual(at(null, 1).id, 'beat:lean');
    const noTrial = pickOptionTrialcombat(null, { phase: 'challenge', opts: [{ id: 'beat:lean' }, { id: 'beat:hold' }], T: { path: 'feared', beat: 1 } }, 'defiant');
    assert.strictEqual(noTrial.id, 'beat:lean');
    const trialOnlyB0 = pickOptionTrialcombat(null, { phase: 'challenge', opts: [{ id: 'beat:trial' }], T: { path: 'feared', beat: 0 } }, 'defiant');
    assert.strictEqual(trialOnlyB0.skip, 'trial-only');
    const trialOnlyB1 = pickOptionTrialcombat(null, { phase: 'challenge', opts: [{ id: 'beat:trial' }], T: { path: 'feared', beat: 1 } }, 'defiant');
    assert.strictEqual(trialOnlyB1.id, 'beat:trial');
    ok('GREEN: trial pick fires ONLY at feared beat 1 with the option offered (pure-function pins)', true);
  })();

  // B1: feared offered (assigned is beloved) -> walked FEARED once,
  // beat 0 first option, beat 1 THE TRIAL, final — played to done.
  resetTrialcombatStats();
  let g = stubGame(); let ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.deepStrictEqual(g._calls.chosen, ['path:feared', 'beat:mercy', 'beat:trial', 'final:mercy']);
  let st = trialcombatStats();
  assert.strictEqual(st.doorsEntered, 1);
  assert.strictEqual(st.walked[0].path, 'feared');
  assert.strictEqual(st.walked[0].fellBack, false);
  assert.strictEqual(st.walked[0].branch, 'light');
  assert.strictEqual(st.offers[0].rule, 'feared-first');
  assert.strictEqual(st.answers, 4);
  assert.strictEqual(st.trialsOffered, 1);
  assert.strictEqual(st.trialsEntered, 1);
  assert.strictEqual(g._T.phase, 'done');
  assert.strictEqual(ctx.tcWalked, 1);
  ok('GREEN: feared offered -> walked feared once, trial taken at beat 1, final played to done', true);
  // B2: the same sitting re-offered -> already-entered, verb never called again.
  g._T.phase = 'paths'; g._T.path = null;
  g.state.scholar.tableChoices = { options: g._earned.map(function (id) { return { id: 'path:' + id }; }) };
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 4);
  assert.strictEqual(trialcombatStats().skips['already-entered'], 1);
  ok('GREEN: already-entered — a re-offer for the same sitting is never re-walked', true);
  // B3: feared NOT offered -> the doorwalk rotation fallback EXACTLY (assigned beloved).
  resetTrialcombatStats();
  g = stubGame({ _earned: ['beloved', 'assimilated', 'defiant'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:beloved');
  st = trialcombatStats();
  assert.strictEqual(st.walked[0].fellBack, false);
  assert.strictEqual(st.offers[0].rule.indexOf('assigned+beloved'), 0);
  ok('GREEN: feared not offered -> doorwalk rotation fallback (assigned beloved), recorded', true);
  // B4: feared not offered AND assigned not offered -> first non-feared fallback.
  resetTrialcombatStats();
  g = stubGame({ _earned: ['assimilated', 'defiant'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:assimilated');
  assert.strictEqual(trialcombatStats().walked[0].fellBack, true);
  assert.strictEqual(trialcombatStats().offers[0].rule.indexOf('fallback-non-feared'), 0);
  ok('GREEN: assigned not offered either -> first non-feared fallback, recorded', true);
  // B5: only feared offered -> walked feared ('feared-first', not the rotation's only-feared).
  resetTrialcombatStats();
  g = stubGame({ _earned: ['feared'] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'path:feared');
  assert.strictEqual(trialcombatStats().offers[0].rule, 'feared-first');
  ok('GREEN: only feared offered -> walked feared via feared-first', true);
  // B6: live fight -> skip 'fight-live', verb never called.
  resetTrialcombatStats();
  g = stubGame({ tbfight: { over: false } }); ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(trialcombatStats().skips['fight-live'], 1);
  ok('GREEN: live fight -> classified skip, verb never called', true);
  // B7: no modal pending -> skip 'preview-null'.
  resetTrialcombatStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = null; g.state.scholar.tableChoices = { options: [] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(trialcombatStats().skips['preview-null'], 1);
  ok('GREEN: no modal pending -> classified skip', true);
  // B8: seat-taker phase -> skip 'seat-taker', verb never called.
  resetTrialcombatStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'seat-taker';
  g.state.scholar.tableChoices = { options: [{ id: 'seat:self' }, { id: 'seat:villager-1' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(trialcombatStats().skips['seat-taker'], 1);
  ok('GREEN: seat-taker phase -> classified skip, sitter never chosen', true);
  // B9: trial-only beat at beat 0 -> skip 'trial-only', the door pick stands, the trial is never taken.
  resetTrialcombatStats();
  g = stubGame({ beatOpts: [{ id: 'beat:trial' }] }); ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.deepStrictEqual(g._calls.chosen, ['path:feared']);
  assert.strictEqual(trialcombatStats().skips['trial-only'], 1);
  assert.strictEqual(trialcombatStats().doorsEntered, 1);
  ok('GREEN: trial-only beat -> classified skip, trial never opted into', true);
  // B10: conscript phase -> refused ('conscript:no'), challenge resumes.
  resetTrialcombatStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'conscript'; g._T.path = 'feared';
  g.state.scholar.tableChoices = { options: [{ id: 'conscript:yes' }, { id: 'conscript:no' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'conscript:no');
  assert.strictEqual(g._T.phase, 'done'); // refused, then the challenge plays out to done
  ok('GREEN: dark conscript -> refused, challenge resumes', true);
  // B11: downgrade phase with feared still available -> feared-first.
  resetTrialcombatStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'downgrade'; g._T.path = 'beloved'; g._T.failedDoors = ['beloved'];
  g.state.scholar.tableChoices = { options: [{ id: 'downgrade:feared' }, { id: 'downgrade:defiant' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'downgrade:feared');
  assert.strictEqual(trialcombatStats().doorsEntered, 1);
  assert.strictEqual(trialcombatStats().walked[0].path, 'feared');
  ok('GREEN: downgrade with feared available -> feared-first', true);
  // B12: downgrade phase without feared -> doorwalk downgrade rule (assigned beloved).
  resetTrialcombatStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'downgrade'; g._T.path = 'feared'; g._T.failedDoors = ['feared'];
  g.state.scholar.tableChoices = { options: [{ id: 'downgrade:beloved' }, { id: 'downgrade:defiant' }] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen[0], 'downgrade:beloved');
  assert.strictEqual(trialcombatStats().walked[0].path, 'beloved');
  ok('GREEN: downgrade without feared -> doorwalk downgrade rule (assigned)', true);
  // B13: game over -> skip 'over'.
  resetTrialcombatStats();
  g = stubGame({ over: true }); ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(trialcombatStats().skips.over, 1);
  ok('GREEN: game over -> classified skip', true);
  // B14: paths phase with NO options -> skip 'no-doors-offered'.
  resetTrialcombatStats();
  g = stubGame({ _noPathsOpts: true });
  g._T.phase = 'paths'; g.state.scholar.tableChoices = { options: [] }; ctx = {};
  withEnv({ DOORWALK_SEED: '53903' }, () => { trialcombatDoorDrive(g, ctx); });
  assert.strictEqual(g._calls.chosen.length, 0);
  assert.strictEqual(trialcombatStats().skips['no-doors-offered'], 1);
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
    { day: 90, call: 'chooseTableOption', arg: 'path:feared', ok: false, before: { phase: 'paths', path: null }, after: { phase: 'challenge', path: 'feared', branch: 'light' }, offered: ['path:feared', 'path:beloved'] },
    { day: 90, call: 'chooseTableOption', arg: 'beat:mercy', ok: false, before: { phase: 'challenge', path: 'feared' }, after: { phase: 'challenge', path: 'feared' }, offered: ['beat:mercy'] },
  ] };
  const entries = ANALYZE.entriesFromVerbs(fake);
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(entries[0].path, 'feared');
  assert.strictEqual(entries[0].day, 90);
  assert.deepStrictEqual(entries[0].offered, ['path:feared', 'path:beloved']);
  ok('ANALYZER: entriesFromVerbs counts a paths->challenge door pick only', true);
  const satRow = { day: 100, tableDone: true, seat: 'lesser' };
  assert.strictEqual(classifySeatDay(satRow, []).gate, 'sat');
  const readyRow = { day: 100, tableDone: false, seat: 'lesser', preview: { ready: true, why: '' } };
  assert.strictEqual(classifySeatDay(readyRow, []).gate, 'offer-not-taken');
  ok('ANALYZER: classifySeatDay gates (sat / offer-not-taken)', true);
  // doorStatsOf: armed leg reads trialcombatStats, baseline reads feareddoorStats.
  assert.strictEqual(ANALYZE.doorStatsOf({ policy: 'trialcombat-armed', trialcombatStats: { doorsEntered: 1 }, feareddoorStats: { doorsEntered: 0 } }).doorsEntered, 1);
  assert.strictEqual(ANALYZE.doorStatsOf({ policy: 'trialcombat-baseline', trialcombatStats: { doorsEntered: 0 }, feareddoorStats: { doorsEntered: 2 } }).doorsEntered, 2);
  ok('ANALYZER: doorStatsOf picks the active drive per leg', true);
  // trialFromVerbs / trialFromPrompts: triple-source detection.
  const trialVerbs = { doorVerbMsgs: [
    { day: 90, call: 'chooseTableOption', arg: 'beat:mercy', ok: false, before: { phase: 'challenge', path: 'feared', beat: 0 }, after: { phase: 'challenge', path: 'feared', beat: 1 }, offered: ['beat:kill', 'beat:mercy', 'beat:fire'] },
    { day: 90, call: 'chooseTableOption', arg: 'beat:trial', ok: false, before: { phase: 'challenge', path: 'feared', beat: 1 }, after: { phase: 'challenge', path: 'feared', beat: 1 }, offered: ['beat:lean', 'beat:hold', 'beat:trial'] },
    { day: 90, call: 'chooseTableOption', arg: 'path:beloved', ok: false, before: { phase: 'paths' }, after: { phase: 'challenge', path: 'beloved' }, offered: ['path:beloved'] },
  ] };
  const tv = ANALYZE.trialFromVerbs(trialVerbs);
  assert.strictEqual(tv.offered.length, 1);
  assert.strictEqual(tv.entered.length, 1);
  assert.strictEqual(tv.entered[0].day, 90);
  ok('ANALYZER: trialFromVerbs — offered only at the beat-1 call, entered once on beat:trial', true);
  const trialPrompts = { tablePrompts: [
    { day: 90, table: { phase: 'challenge', path: 'feared', beat: 1 }, options: ['beat:lean', 'beat:hold', 'beat:trial'] },
    { day: 90, table: { phase: 'challenge', path: 'feared', beat: 0 }, options: ['beat:kill', 'beat:mercy', 'beat:fire'] },
    { day: 90, table: { phase: 'challenge', path: 'witness', beat: 1 }, options: ['beat:let', 'beat:cross'] },
  ] };
  assert.strictEqual(ANALYZE.trialFromPrompts(trialPrompts).length, 1);
  ok('ANALYZER: trialFromPrompts — only the feared beat-1 prompt offers the trial', true);
  const trialFightsIn = { tbFights: [
    { id: 'f1', result: 'won', fighters: [{ kind: 'monster', monsterId: 'deer' }] },
    { id: 'f2', result: 'lost', fighters: [{ kind: 'monster', monsterId: 'finale' }], rounds: 4, tableTrial: true },
  ] };
  assert.strictEqual(ANALYZE.trialFights(trialFightsIn).length, 1);
  assert.strictEqual(ANALYZE.trialFights(trialFightsIn)[0].id, 'f2');
  ok('ANALYZER: trialFights — the Finale fight is the trial fight', true);
  // effectiveDays / nonInferior: a win counts at the horizon.
  assert.strictEqual(ANALYZE.effectiveDays(90, true, 150), 150);
  assert.strictEqual(ANALYZE.effectiveDays(97, false, 150), 97);
  assert.strictEqual(ANALYZE.nonInferior(90, true, 150, 150), true);
  assert.strictEqual(ANALYZE.nonInferior(97, false, 150, 150), false);
  assert.strictEqual(ANALYZE.nonInferior(150, false, 150, 150), true);
  ok('ANALYZER: effectiveDays / nonInferior — a win counts at horizon, an earlier death fails', true);
  // fearedWin via analyzeSeed: feared walked + won + final on feared + no downgrade.
  const trialVerbsFull = { doorVerbMsgs: [
    { day: 90, call: 'chooseTableOption', arg: 'path:feared', ok: false, before: { phase: 'paths', path: null }, after: { phase: 'challenge', path: 'feared', branch: 'light' }, offered: ['path:feared', 'path:beloved'] },
    { day: 90, call: 'chooseTableOption', arg: 'beat:mercy', ok: false, before: { phase: 'challenge', path: 'feared', beat: 0 }, after: { phase: 'challenge', path: 'feared', beat: 1 }, offered: ['beat:kill', 'beat:mercy', 'beat:fire'] },
    { day: 90, call: 'chooseTableOption', arg: 'beat:trial', ok: false, before: { phase: 'challenge', path: 'feared', beat: 1 }, after: { phase: 'challenge', path: 'feared', beat: 1 }, offered: ['beat:lean', 'beat:hold', 'beat:trial'] },
    { day: 90, call: 'chooseTableOption', arg: 'final:mercy', ok: false, before: { phase: 'finals', path: 'feared' }, after: { phase: 'done', path: 'feared' }, offered: ['final:mercy'] },
  ] };
  const fakeSeed = function (over) {
    return Object.assign({
      seed: 53903, policy: 'trialcombat-armed', days: 90, gameDays: 90,
      endReason: 'won', won: true, over: true, standing: 200, scaleRank: 'regional',
      maxWave: 5, unlockedWave: 5,
      daily: [Object.assign(row(90), { tableDone: true, seat: 'lesser', ledger: { might: 5, killed: 2, protected: 9, exposed: 1 } })],
      sitVerbMsgs: [], doorVerbMsgs: trialVerbsFull.doorVerbMsgs,
      tableLines: [{ day: 90, line: '◈ TRIAL WON — the Finale is meat.' }],
      tablePrompts: [{ day: 90, table: { phase: 'challenge', path: 'feared', beat: 1 }, options: ['beat:lean', 'beat:hold', 'beat:trial'] }],
      tbFights: [{ id: 'f2', result: 'won', rounds: 6, fighters: [{ kind: 'monster', monsterId: 'finale' }], tableTrial: true }],
      takeseatStats: { seatTaken: 1, seatDay: 90, seatKind: 'lesser', skips: {}, errors: 0 },
      linkdriveStats: {}, feastdriveStats: {}, waveKillLog: [], teleDeaths: [],
      finalSeat: { seat: 'lesser' }, instrumentErrors: [],
      trialcombatStats: {
        walked: [{ day: 90, path: 'feared', branch: 'light', door: 'path:feared', fellBack: false }],
        offers: [{ offered: ['feared', 'beloved'], assigned: 'beloved', picked: 'feared', rule: 'feared-first' }],
        log: [{ phase: 'challenge', path: 'feared', beat: 0, optionId: 'beat:mercy', trialOffered: false, trialPicked: false },
              { phase: 'challenge', path: 'feared', beat: 1, optionId: 'beat:trial', trialOffered: true, trialPicked: true },
              { phase: 'finals', path: 'feared', optionId: 'final:mercy' }],
        answers: 5, skips: {}, errors: 0, stalls: 0, trialsOffered: 1, trialsEntered: 1,
      },
      feareddoorStats: { walked: [], offers: [], log: [], answers: 0, skips: {}, errors: 0, stalls: 0 },
      doorwalkStats: { walked: [], offers: [], log: [], answers: 0, skips: {}, errors: 0, stalls: 0 },
    }, over || {});
  };
  const r1 = ANALYZE.analyzeSeed(fakeSeed());
  assert.strictEqual(r1.fearedEntered, 1);
  assert.strictEqual(r1.fearedWin, true);
  assert.strictEqual(r1.fearedOffered, true);
  assert.strictEqual(r1.fearedOfferedUnwalked, false);
  assert.strictEqual(r1.verbWalkedAgree, true);
  assert.strictEqual(r1.trialOffered, true);
  assert.strictEqual(r1.trialEntered, true);
  assert.strictEqual(r1.trialEnteredDay, 90);
  assert.strictEqual(r1.trialWon, true);
  assert.strictEqual(r1.trialLost, false);
  assert.strictEqual(r1.trialWithheld, false);
  assert.strictEqual(r1.trialFightsCount, 1);
  assert.strictEqual(r1.ledgerAtSit.might + r1.ledgerAtSit.killed, 7);
  assert.strictEqual(r1.fearedPrereqAtSit, true);
  ok('ANALYZER: analyzeSeed — trial offered (3 sources) + entered + WON, prereq met at sit', true);
  // Trial entered but LOST: won false, lost true, still entered.
  const r1b = ANALYZE.analyzeSeed(fakeSeed({
    won: false, endReason: 'village-lost',
    tableLines: [{ day: 90, line: '◈ TRIAL LOST — the champion stands over the body. The mantle passes mid-table.' }],
  }));
  assert.strictEqual(r1b.trialEntered, true);
  assert.strictEqual(r1b.trialWon, false);
  assert.strictEqual(r1b.trialLost, true);
  assert.strictEqual(r1b.fearedWin, false);
  ok('ANALYZER: analyzeSeed — trial entered + LOST reads as a loss, not a feared win', true);
  const r2 = ANALYZE.analyzeSeed(fakeSeed({
    trialcombatStats: {
      walked: [{ day: 90, path: 'feared', branch: 'dark', door: 'path:feared', fellBack: false },
               { day: 90, path: 'beloved', branch: 'light', door: 'downgrade:beloved', fellBack: true }],
      offers: [{ offered: ['feared', 'beloved'], assigned: 'beloved', picked: 'feared', rule: 'feared-first' }],
      log: [{ phase: 'challenge', path: 'feared' }, { phase: 'downgrade', path: 'feared' },
            { phase: 'challenge', path: 'beloved' }, { phase: 'finals', path: 'beloved', optionId: 'final:mercy' }],
      answers: 8, skips: {}, errors: 0, stalls: 0, trialsOffered: 1, trialsEntered: 1,
    },
  }));
  assert.strictEqual(r2.fearedEntered, 1);
  assert.strictEqual(r2.fearedWin, false); // downgrade fired: the win came on the second door
  assert.strictEqual(r2.downgradeAnswers, 1);
  ok('ANALYZER: analyzeSeed — feared walked then downgraded -> NOT a feared win', true);
})();

// --- (C) COMPOSITION against a real loaded game.
(async function () {
  const { loadGame, setupGame } = require('./sim-harness');
  const DWmod = require('./policies/competent-doorwalk-b');
  const LF = require('./policies/competent-linkfeast-b');
  const { Game } = await loadGame({ seed: 53001, mode: 'competent-trialcombat-b-proof', fullTelemetry: false });
  await setupGame(Game);
  let dwDaily = 0, fdUpkeep = 0, lfUpkeep = 0;
  const origDwDaily = DWmod.doorwalk.daily;
  const origFdUpkeep = FEAR.feareddoor.upkeep;
  const origLfUpkeep = LF.linkfeast.upkeep;
  DWmod.doorwalk.daily = function () { dwDaily++; return origDwDaily.apply(this, arguments); };
  FEAR.feareddoor.upkeep = function () { fdUpkeep++; return origFdUpkeep.apply(this, arguments); };
  LF.linkfeast.upkeep = function () { lfUpkeep++; return origLfUpkeep.apply(this, arguments); };
  try {
    const ctx = {};
    TC.trialcombat.daily(Game, ctx);
    assert.strictEqual(dwDaily, 1);
    ok('COMPOSITION: wrapper daily runs feareddoor daily exactly once', true);
    // Gate OFF: upkeep delegates to feareddoor upkeep exactly once
    // (linkfeast upkeep once, via feareddoor).
    withEnv({ TRIALCOMBAT_B: null, FEAREDDOOR_B: '1', DOORWALK_B: '1' }, () => {
      fdUpkeep = 0; lfUpkeep = 0;
      TC.trialcombat.upkeep(Game, ctx);
      assert.strictEqual(fdUpkeep, 1);
      assert.strictEqual(lfUpkeep, 1);
    });
    ok('COMPOSITION: gate OFF upkeep runs feareddoor upkeep exactly once (+ linkfeast once via it)', true);
    // Gate ON: upkeep runs linkfeast upkeep exactly once directly
    // and does NOT call feareddoor upkeep.
    withEnv({ TRIALCOMBAT_B: '1', FEAREDDOOR_B: '1', DOORWALK_B: '1' }, () => {
      fdUpkeep = 0; lfUpkeep = 0;
      TC.trialcombat.upkeep(Game, ctx);
      assert.strictEqual(fdUpkeep, 0);
      assert.strictEqual(lfUpkeep, 1);
    });
    ok('COMPOSITION: gate ON upkeep runs linkfeast upkeep exactly once directly, feareddoor upkeep never called', true);
  } finally {
    DWmod.doorwalk.daily = origDwDaily;
    FEAR.feareddoor.upkeep = origFdUpkeep;
    LF.linkfeast.upkeep = origLfUpkeep;
  }

  // --- (D) LIVE: judged driver twice on seed 53001 (no-seat seed).
  const skipLive = process.env.SKIP_LIVE === '1';
  const smokeSeed = process.env.TRIAL_SMOKE_SEED ? parseInt(process.env.TRIAL_SMOKE_SEED, 10) : null;
  const tmpBase = '/tmp/trialcombat-b-proof-baseline';
  const tmpArmed = '/tmp/trialcombat-b-proof-armed';
  const tmpSmoke = '/tmp/trialcombat-b-proof-smoke';
  [tmpBase, tmpArmed, tmpSmoke].forEach(function (d) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {}
    fs.mkdirSync(d, { recursive: true });
  });
  const run = function (policy, outdir, seeds, runName) {
    const env = Object.assign({}, process.env, { SEEDS: seeds, DAYS: '150', RUN: runName, POLICY: policy, OUTDIR: outdir });
    execSync('node scripts/trialcombat-b-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
  };
  if (!skipLive) {
    run('baseline', tmpBase, '53001', 'trialcombat-proof-baseline');
    run('armed', tmpArmed, '53001', 'trialcombat-proof-armed');
    const b = JSON.parse(fs.readFileSync(path.join(tmpBase, 'trialcombat-b-s53001-trialcombat-proof-baseline.json'), 'utf8'));
    const a = JSON.parse(fs.readFileSync(path.join(tmpArmed, 'trialcombat-b-s53001-trialcombat-proof-armed.json'), 'utf8'));
    assert.strictEqual(b.instrumentErrors.length, 0);
    assert.strictEqual(a.instrumentErrors.length, 0);
    ok('LIVE: both proof legs run with 0 instrument errors', true);
    assert.strictEqual((a.trialcombatStats || {}).doorsEntered, 0);
    assert.strictEqual((b.feareddoorStats || {}).doorsEntered, 0);
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

  // --- (D2) LIVE SMOKE: armed leg on a fresh-band sat seed — the
  // drain must walk a door end to end on the real engine, feared
  // first when offered.
  if (smokeSeed) {
    run('armed', tmpSmoke, String(smokeSeed), 'trialcombat-proof-smoke');
    const s = JSON.parse(fs.readFileSync(path.join(tmpSmoke, 'trialcombat-b-s' + smokeSeed + '-trialcombat-proof-smoke.json'), 'utf8'));
    assert.strictEqual(s.instrumentErrors.length, 0);
    ok('LIVE SMOKE: seed ' + smokeSeed + ' armed leg runs with 0 instrument errors', true);
    assert.strictEqual((s.takeseatStats || {}).seatTaken, 1);
    ok('LIVE SMOKE: seed ' + smokeSeed + ' sits (sit drive fires on the wrapper)', true);
    assert.ok(((s.trialcombatStats || {}).doorsEntered | 0) >= 1, 'a door is entered on ' + smokeSeed);
    const walked = (s.trialcombatStats || {}).walked || [];
    assert.ok(walked.length >= 1 && walked[0].day === (s.takeseatStats || {}).seatDay, 'entry day = sit day');
    ok('LIVE SMOKE: seed ' + smokeSeed + ' walks a door on its sit day (' + walked.map(function (w) { return w.path + '@d' + w.day + '/' + (w.branch || '?'); }).join(', ') + ')', true);
    const offered = ((s.trialcombatStats || {}).offers || [])[0];
    // The policy's offers[].offered holds UNPREFIXED door ids
    // ('feared', 'beloved', ...); the driver's verb record holds
    // prefixed ones ('path:feared') — do not mix the shapes.
    if (offered && offered.offered && offered.offered.indexOf('feared') >= 0) {
      assert.strictEqual(walked[0].path, 'feared', 'feared offered -> feared walked');
      ok('LIVE SMOKE: feared was offered on ' + smokeSeed + ' and the feared door was walked', true);
    } else {
      console.log('LIVE SMOKE: feared was NOT offered on ' + smokeSeed + ' (offered: ' + (offered ? offered.offered.join(',') : 'none') + ') — fallback walk recorded');
    }
    assert.ok(((s.trialcombatStats || {}).answers | 0) >= 1, 'the walked path is answered (door + beats/final as offered)');
    // The trial instrument: if feared was walked, the trial offer was
    // counted at beat 1 (offered) and taken (entered) — or the
    // transcript says why not (withheld / no-show).
    if (walked.length && walked[0].path === 'feared') {
      const tc = s.trialcombatStats || {};
      const trialLines = (s.tableLines || []).filter(function (l) { return /TRIAL/.test(l.line); });
      console.log('LIVE SMOKE: feared walked on ' + smokeSeed + ' — trials offered ' + (tc.trialsOffered | 0) + ', entered ' + (tc.trialsEntered | 0) + ', trial lines ' + trialLines.length);
      if ((tc.trialsOffered | 0) >= 1) {
        assert.strictEqual(tc.trialsEntered, tc.trialsOffered, 'every offered trial is taken');
        ok('LIVE SMOKE: trial offered and entered on the feared walk (' + trialLines.map(function (l) { return l.line.slice(0, 40); }).join(' | ') + ')', true);
      } else {
        console.log('LIVE SMOKE: trial NOT offered on ' + smokeSeed + ' (withheld/no-show lines: ' + trialLines.map(function (l) { return l.line.slice(0, 60); }).join(' | ') + ') — recorded, not a failure of the instrument');
      }
    }
    ok('LIVE SMOKE: the walked path is played through (answers >= 1)', true);
  } else {
    console.log('LIVE SMOKE: skipped (TRIAL_SMOKE_SEED unset — run after the pilot names a sat seed)');
  }

  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
