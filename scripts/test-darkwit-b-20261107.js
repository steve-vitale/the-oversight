#!/usr/bin/env node
// scripts/test-darkwit-b-20261107.js — proof for the dark-branch
// witness drive (arm sim-darkwit-b, run fleshout-loop-b-20261108T0245Z).
//
// Sections:
//   (A) RED: the ROAD gate OFF never touches the engine —
//       ledgerDarkDaily with LEDGERDARK unset returns before any
//       Game read (a stub whose engine methods throw if touched
//       proves it); the DOOR gate OFF never drives the verb (the
//       witnessdoor proof's RED, re-pinned here through the
//       darkwit re-export).
//   (B) GREEN: gate-ON fixtures on stub Games — the road's verbs
//       fire through the wrapper (beg refused, hoard take skipped
//       on a thin pantry, recruit/betrayal inert before their
//       windows); ledgerVector is a pure read; withLedgerDark
//       composition calls road-then-base exactly once each, and
//       fight delegates to the base when no betrayal fight is
//       live; the darkwit door rule walks witness DARK when the
//       stub table reads dark, and LIGHT when it reads light
//       (branch is ledger-earned, never overridden).
//   (C) COMPOSITION: against a real loaded game, the wrapper daily
//       runs doorwalk daily exactly once (road OFF and road ON);
//       upkeep with the door gate OFF runs doorwalk upkeep exactly
//       once; upkeep with the door gate ON runs linkfeast upkeep
//       exactly once directly and does NOT call doorwalk upkeep;
//       LEDGERDARK=1 changes none of the upkeep counts (the road
//       is daily-only).
//   (D) LIVE: the darkwit driver baseline leg (LEDGERDARK unset)
//       on seed 53001 reproduces the witnessdoor driver armed leg
//       on the same seed EXACTLY (headline numbers) — the
//       replacement guard's determinism leg, proving the road-OFF
//       delegation is byte-identical in practice; plus a 1-seed
//       ARMED smoke leg on a judged-band sat seed
//       (DARKWIT_SMOKE_SEED, named by the baseline leg) in /tmp
//       asserting the road engages without stalling (counters move,
//       ledger trace recorded, 0 instrument errors). The smoke does
//       NOT assert the seed still sits: the road perturbs pre-sit
//       trajectories by design (the prereg's replacement guard),
//       so a single seed not sitting proves nothing about the
//       instrument — the pilot armed leg measures the sit rate
//       across 8 seeds. (CORRECTION 2026-11-08, pre-pilot: the
//       smoke as first written asserted sit+walk and failed on
//       53703 for exactly this reason — the road engaged fully
//       (hoard 15, recruit d15, betrayal d40) and the village died
//       d82 where the baseline won d90. The gate was wrong, not
//       the instrument; the sit rate is the pilot's measurement.)
//   (E) ANALYZER: pure-function fixtures (roadAttribution all six
//       outcomes, sitLedger ref-day + fallback, walkNarration
//       framing/testimony/choice-line detection, entriesFromVerbs,
//       starvation, medianOf, classifySeatDay, effectiveDays /
//       nonInferior, darkWitnessWin via analyzeSeed incl. the
//       downgrade-negates variant).
//
// Usage: node scripts/test-darkwit-b-20261107.js
//   (D) runs two 150d sims in /tmp; allow ~4-6 min. The smoke leg
//   runs only when DARKWIT_SMOKE_SEED is set; SKIP_LIVE=1 skips the
//   determinism legs (re-run after the baseline leg, with the smoke
//   seed, to gate the armed leg without re-running determinism).
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const DW = require('./policies/competent-darkwit-b');
const LD = require('./policies/ledgerdark');
const WIT = require('./policies/competent-witnessdoor-b');
const DWALK = require('./policies/competent-doorwalk-b');
const ANALYZE = require('./darkwit-b-analyze-20261107');
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

// --- (A) RED: road gate OFF never touches the engine.
withEnv({ LEDGERDARK: null }, () => {
  assert.strictEqual(LD.layerOn(), false);
  const bomb = {
    get over() { throw new Error('read over'); },
    get state() { throw new Error('read state'); },
    progState() { throw new Error('progState touched'); },
    tablePreview() { throw new Error('tablePreview touched'); },
  };
  const ctx = {};
  LD.ledgerDarkDaily(bomb, ctx);
  assert.strictEqual(ctx._ledgerdark, undefined);
  ok('RED: LEDGERDARK unset -> ledgerDarkDaily returns before any Game read, never touches ctx', true);
});
// Door gate OFF never drives the verb (re-pinned through the darkwit re-export).
withEnv({ WITNESSDOOR_B: null }, () => {
  assert.strictEqual(WIT.layerOn(), false);
  WIT.resetWitnessdoorStats();
  const bomb = {
    get over() { throw new Error('read over'); },
    get tbfight() { throw new Error('read tbfight'); },
    tableState() { throw new Error('tableState touched'); },
    chooseTableOption() { throw new Error('verb touched'); },
  };
  WIT.witnessDoorDrive(bomb, {});
  const st = WIT.witnessdoorStats();
  assert.strictEqual(st.answers, 0);
  assert.strictEqual(st.doorsEntered, 0);
  ok('RED: WITNESSDOOR_B unset -> witnessDoorDrive never drives the verb', true);
});

// --- (B) GREEN: road verbs + composition on stubs.
(function () {
  // A minimal engine surface the road can read: no begs pending,
  // not at Haven, thin pantry, party locked, day 10 (before the
  // recruit window), no preview staged.
  function roadStub(over) {
    return Object.assign({
      over: false, tbfight: null,
      state: { scholar: { day: 10 }, village: { pantry: [] }, pendingBeg: null, pendingAidBeg: null },
      progState() { return { tableDone: false }; },
      tablePreview() { return null; },
      playerAtHaven() { return false; },
      partyUnlocked() { return false; },
      ledger() { return { killed: 0, protected: 25, betrayed: 0, foodShared: 24, foodHoarded: 0, showmanship: 14, might: 0, exposed: 4 }; },
      tableBranch() { return { branch: 'light', dark: 0, light: 5, notes: [] }; },
    }, over || {});
  }
  // B1: road ON, quiet substrate — the road reads but no verb fires.
  withEnv({ LEDGERDARK: '1' }, () => {
    const ctx = {};
    LD.ledgerDarkDaily(roadStub(), ctx);
    const s = ctx._ledgerdark;
    assert.strictEqual(s.active, true);
    assert.strictEqual(s.begsRefused, 0);
    assert.strictEqual(s.hoardTakes, 0);
    assert.strictEqual(s.recruitDone, 0);
    assert.strictEqual(s.betrayalDone, 0);
    ok('GREEN: road ON on a quiet substrate reads but fires no verb (day 10, no begs, not at Haven)', true);
  });
  // B2: a pending beg is refused — foodHoarded +1 is the engine's
  // verb, the road just answers it and counts it.
  withEnv({ LEDGERDARK: '1' }, () => {
    const ctx = {};
    let answered = null;
    const g = roadStub({ state: { scholar: { day: 40 }, village: { pantry: [] }, pendingBeg: { id: 'x' }, pendingAidBeg: null },
      answerBeg(v) { answered = v; return { ok: true }; } });
    LD.ledgerDarkDaily(g, ctx);
    assert.strictEqual(answered, 'refuse');
    assert.strictEqual(ctx._ledgerdark.begsRefused, 1);
    ok('GREEN: pending beg is refused through the real verb and counted', true);
  });
  // B3: ledgerVector is a pure read of the ledger + branch.
  const lv = LD.ledgerVector(roadStub());
  assert.deepStrictEqual({ killed: lv.killed, prot: lv.prot, betrayed: lv.betrayed, shared: lv.shared, hoarded: lv.hoarded, exposed: undefined },
    { killed: 0, prot: 25, betrayed: 0, shared: 24, hoarded: 0, exposed: undefined });
  assert.strictEqual(lv.beloved.branch, 'light');
  ok('GREEN: ledgerVector reads the ledger + witness branch purely (protected 25, light 5v0)', true);
  // B4: withLedgerDark composition — road-then-base exactly once
  // each on daily; fight delegates to the base when no betrayal
  // fight is live.
  let baseDaily = 0, baseFight = 0;
  const fakeBase = {
    id: 'fake-base', desc: 'fake',
    daily() { baseDaily++; return 'daily'; },
    fight() { baseFight++; return 'fight'; },
    upkeep() { return 'upkeep'; },
  };
  const wrapped = LD.withLedgerDark(fakeBase, 'fake-darkwit', 'fake');
  withEnv({ LEDGERDARK: null }, () => {
    baseDaily = 0; baseFight = 0;
    assert.strictEqual(wrapped.daily(roadStub(), {}), 'daily');
    assert.strictEqual(baseDaily, 1);
    assert.strictEqual(wrapped.fight(roadStub(), {}), 'fight');
    assert.strictEqual(baseFight, 1);
    ok('GREEN: road OFF -> wrapper daily/fight delegate to the base exactly once each', true);
  });
  withEnv({ LEDGERDARK: '1' }, () => {
    baseDaily = 0; baseFight = 0;
    assert.strictEqual(wrapped.daily(roadStub(), {}), 'daily');
    assert.strictEqual(baseDaily, 1);
    assert.strictEqual(wrapped.fight(roadStub(), {}), 'fight');
    assert.strictEqual(baseFight, 1);
    ok('GREEN: road ON on a quiet substrate -> base still called exactly once each', true);
  });
  // B5: the darkwit policy object is the composed wrapper with the
  // witnessdoor upkeep intact.
  assert.strictEqual(DW.darkwit.id, 'competent-darkwit-b');
  assert.strictEqual(typeof DW.darkwit.daily, 'function');
  assert.strictEqual(typeof DW.darkwit.upkeep, 'function');
  assert.strictEqual(typeof DW.darkwit.fight, 'function');
  assert.strictEqual(DW.darkwit.upkeep, WIT.witnessdoor.upkeep);
  ok('GREEN: darkwit policy is the withLedgerDark(witnessdoor) wrapper; upkeep passes through untouched', true);
})();

// --- (E) ANALYZER pure functions (before the live legs — fast).
(function () {
  // roadAttribution: all six outcomes.
  const att = ANALYZE.roadAttribution;
  assert.deepStrictEqual(att({ gameDays: 90, ledgerDarkStats: { begsRefused: 3, aidBegsRefused: 0, hoardTakes: 5, betrayalDone: 0, recruitDone: 0 } }).active, true);
  ok('ANALYZER: roadAttribution active when any road verb fired', true);
  assert.strictEqual(att({ gameDays: 10, ledgerDarkStats: {} }).reason, 'died-before-d15');
  assert.strictEqual(att({ gameDays: 90, ledgerDarkStats: { quietExile: 1 } }).reason, 'exiled');
  assert.strictEqual(att({ gameDays: 90, ledgerDarkStats: { stoppedTable: 1 } }).reason, 'preview-staged-early');
  assert.strictEqual(att({ gameDays: 90, ledgerDarkStats: { recruitTried: 2, betrayalSkipped: 4 } }).reason, 'attempted-no-convert');
  assert.strictEqual(att({ gameDays: 90, ledgerDarkStats: {} }).reason, 'UNEXPLAINED');
  ok('ANALYZER: roadAttribution classifies all five non-firing reasons', true);
  // sitLedger: last row at or before the ref day; fallback to last row.
  const rows = { daily: [
    { day: 88, ledger: { killed: 0, protected: 20, witnessBranch: { branch: 'light', dark: 0, light: 4, notes: [] } } },
    { day: 89, ledger: { killed: 3, protected: 20, witnessBranch: { branch: 'light', dark: 3, light: 4, notes: [] } } },
    { day: 90, ledger: { killed: 3, protected: 2, witnessBranch: { branch: 'dark', dark: 7, light: 0, notes: [] } } },
  ] };
  assert.strictEqual(ANALYZE.sitLedger(rows, 89).day, 89);
  assert.strictEqual(ANALYZE.sitLedger(rows, 89).ledger.witnessBranch.branch, 'light');
  assert.strictEqual(ANALYZE.sitLedger(rows, 90).ledger.witnessBranch.branch, 'dark');
  assert.strictEqual(ANALYZE.sitLedger(rows, null).day, 90);
  assert.strictEqual(ANALYZE.sitLedger({ daily: [] }, 90), null);
  ok('ANALYZER: sitLedger picks the last row at/before the ref day, falls back to the last row', true);
  // walkNarration: framing + testimony + choice lines.
  const walkSeed = {
    tablePrompts: [
      { day: 90, frame: 'the Witness', table: { phase: 'challenge', beat: 0 },
        options: ['beat:cold', 'beat:names', 'beat:reserve'],
        text: 'OPENING — THE CHARGES. 4 exposures. Bribes, buried plots, rounding errors — the moots heard them first, and the moots remember.\nThe judges sit very still.' },
      { day: 90, frame: 'the Witness', table: { phase: 'challenge', beat: 1 },
        options: ['beat:let', 'beat:cross', 'beat:silence'],
        text: 'THE DEFENSE — calls YOUR villagers. Two of your own take the stand, and you don\'t control what they say.\nMara, sworn: "They carried me out of the treeline when I couldn\'t walk. That\'s the whole testimony — the rest is paperwork."\nOwen, sworn: "People died. I... people died following them."' },
      { day: 90, frame: 'the Witness', table: { phase: 'challenge', beat: 2 },
        options: ['beat:blood', 'beat:disappoint'],
        text: 'THE CHANT — the audience has started chanting. Not words — it isn\'t a language with words — but you know the feeling, and so does the table. They want blood.' },
    ],
    tableLines: [
      { day: 90, line: 'You read them cold — no heat, no adjectives. The charges land harder for it. One of the judges flickers.' },
      { day: 90, line: 'You let them speak. All of it. The courtroom respects nothing the way it respects a prosecutor who doesn\'t flinch at their own witnesses.' },
      { day: 90, line: 'You give it to them. The verdict lands like an execution, and the chant becomes a roar.' },
    ],
  };
  const nar = ANALYZE.walkNarration(walkSeed, { day: 90, path: 'witness', branch: 'dark' });
  assert.strictEqual(nar.prompts, 3);
  assert.strictEqual(nar.beat0Opening, true);
  assert.strictEqual(nar.beat1Defense, true);
  assert.strictEqual(nar.beat2SettlementOrChant, true);
  assert.strictEqual(nar.testimonyLines, 2);
  assert.strictEqual(/Mara, sworn/.test(nar.testimony[0]), true);
  assert.strictEqual(nar.coldLine, true);
  assert.strictEqual(nar.letLine, true);
  assert.strictEqual(nar.publicOrBloodLine, true);
  ok('ANALYZER: walkNarration finds all three beat framings, both testimony lines, and the cold/let/blood choice lines', true);
  const narEmpty = ANALYZE.walkNarration({ tablePrompts: [], tableLines: [] }, { day: 90, path: 'witness', branch: 'light' });
  assert.strictEqual(narEmpty.prompts, 0);
  assert.strictEqual(narEmpty.testimonyLines, 0);
  assert.strictEqual(narEmpty.coldLine, false);
  ok('ANALYZER: walkNarration on an empty capture reports zero framing/testimony honestly', true);
  // entriesFromVerbs / starvation / medianOf / classifySeatDay (shared shapes).
  assert.strictEqual(ANALYZE.starvation({ teleDeaths: [{ cause: 'starvation' }, { cause: 'monster' }, { kind: 'starved' }] }), 2);
  assert.strictEqual(ANALYZE.medianOf([150, 79, 86, 89, 95, 118, 139, 150]), 106.5);
  assert.strictEqual(classifySeatDay({ day: 100, tableDone: true, seat: 'lesser' }, []).gate, 'sat');
  ok('ANALYZER: starvation / medianOf / classifySeatDay (shared shapes)', true);
  assert.strictEqual(ANALYZE.effectiveDays(90, true, 150), 150);
  assert.strictEqual(ANALYZE.nonInferior(90, true, 150, 150), true);
  assert.strictEqual(ANALYZE.nonInferior(97, false, 150, 150), false);
  ok('ANALYZER: effectiveDays / nonInferior — a win counts at horizon, an earlier death fails', true);
  // darkWitnessWin via analyzeSeed: dark witness walked + won +
  // final on witness + no downgrade; the downgrade-negates variant.
  const row = function (day, over) {
    return Object.assign({ day: day, rawStanding: 100 + day, rosterSize: 12, living: 12,
      w4kills: 0, seat: 'none', feastSurgeUsed: false, sentimentTaught: true,
      pairDay: false, scholarAtHaven: true, preview: null,
      ledger: { killed: 3, protected: 2, betrayed: 1, foodShared: 0, foodHoarded: 9, showmanship: 14, might: 0, exposed: 4,
        witnessBranch: { branch: 'dark', dark: 7, light: 0, notes: ['the ledger counts more killed than protected'] } } }, over || {});
  };
  const fakeSeed = function (over) {
    return Object.assign({
      seed: 53701, policy: 'darkwit-armed', days: 90, gameDays: 90,
      endReason: 'won', won: true, over: true, standing: 200, scaleRank: 'regional',
      maxWave: 5, unlockedWave: 5,
      daily: [Object.assign(row(90), { tableDone: true, seat: 'lesser' })],
      sitVerbMsgs: [], doorVerbMsgs: [
        { day: 90, call: 'chooseTableOption', arg: 'path:witness', ok: false, before: { phase: 'paths', path: null }, after: { phase: 'challenge', path: 'witness', branch: 'dark' }, offered: ['path:witness', 'path:beloved'] },
      ],
      takeseatStats: { seatTaken: 1, seatDay: 90, seatKind: 'lesser', skips: {}, errors: 0 },
      linkdriveStats: {}, feastdriveStats: {}, waveKillLog: [], teleDeaths: [],
      finalSeat: { seat: 'lesser' }, instrumentErrors: [],
      ledgerDarkStats: { active: true, begsRefused: 3, hoardTakes: 12, hoardTakeKcal: 14000, recruitDone: 1, betrayalDone: 1, betrayalDay: 44, betrayalVictim: 'v-test' },
      tablePrompts: [], tableLines: [],
      witnessdoorStats: {
        walked: [{ day: 90, path: 'witness', branch: 'dark', door: 'path:witness', fellBack: false }],
        offers: [{ offered: ['witness', 'beloved'], assigned: 'beloved', picked: 'witness', rule: 'witness-first' }],
        log: [{ phase: 'challenge', path: 'witness' }, { phase: 'finals', path: 'witness', optionId: 'final:charges' }],
        answers: 5, skips: {}, errors: 0, stalls: 0,
      },
      doorwalkStats: { walked: [], offers: [], log: [], answers: 0, skips: {}, errors: 0, stalls: 0 },
    }, over || {});
  };
  const r1 = ANALYZE.analyzeSeed(fakeSeed());
  assert.strictEqual(r1.darkWitnessEntered, 1);
  assert.strictEqual(r1.lightWitnessEntered, 0);
  assert.strictEqual(r1.darkWitnessWin, true);
  assert.strictEqual(r1.witnessWin, true);
  assert.strictEqual(r1.offeredBranch, 'dark');
  assert.strictEqual(r1.sitLedger.protected, 2);
  assert.strictEqual(r1.roadAttribution.active, true);
  assert.strictEqual(r1.ledgerTraceOk, true);
  assert.strictEqual(r1.verbWalkedAgree, true);
  ok('ANALYZER: analyzeSeed — dark witness walked + won, sit ledger dark 7v0, road attributed', true);
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
  assert.strictEqual(r2.darkWitnessEntered, 1);
  assert.strictEqual(r2.darkWitnessWin, false); // downgrade fired: the win came on the second door
  assert.strictEqual(r2.downgradeAnswers, 1);
  ok('ANALYZER: analyzeSeed — dark witness walked then downgraded -> NOT a dark witness win', true);
})();

// --- (C) COMPOSITION against a real loaded game.
(async function () {
  const { loadGame, setupGame } = require('./sim-harness');
  const DWmod = require('./policies/competent-doorwalk-b');
  const LF = require('./policies/competent-linkfeast-b');
  const { Game } = await loadGame({ seed: 53001, mode: 'competent-darkwit-b-proof', fullTelemetry: false });
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
    // Road OFF: wrapper daily runs doorwalk daily exactly once.
    withEnv({ LEDGERDARK: null, WITNESSDOOR_B: '1' }, () => {
      dwDaily = 0;
      DW.darkwit.daily(Game, ctx);
      assert.strictEqual(dwDaily, 1);
    });
    ok('COMPOSITION: road OFF daily runs doorwalk daily exactly once', true);
    // Road ON (day ~0, quiet substrate): still exactly once.
    withEnv({ LEDGERDARK: '1', WITNESSDOOR_B: '1' }, () => {
      dwDaily = 0;
      DW.darkwit.daily(Game, ctx);
      assert.strictEqual(dwDaily, 1);
    });
    ok('COMPOSITION: road ON daily runs doorwalk daily exactly once (road inert at day 0)', true);
    // Gate OFF: upkeep delegates to doorwalk upkeep exactly once
    // (linkfeast upkeep once, via doorwalk).
    withEnv({ LEDGERDARK: null, WITNESSDOOR_B: null, DOORWALK_B: '1' }, () => {
      dwUpkeep = 0; lfUpkeep = 0;
      DW.darkwit.upkeep(Game, ctx);
      assert.strictEqual(dwUpkeep, 1);
      assert.strictEqual(lfUpkeep, 1);
    });
    ok('COMPOSITION: door gate OFF upkeep runs doorwalk upkeep exactly once (+ linkfeast once via it)', true);
    // Gate ON: upkeep runs linkfeast upkeep exactly once directly
    // and does NOT call doorwalk upkeep — with or without the road.
    withEnv({ LEDGERDARK: null, WITNESSDOOR_B: '1', DOORWALK_B: '1' }, () => {
      dwUpkeep = 0; lfUpkeep = 0;
      DW.darkwit.upkeep(Game, ctx);
      assert.strictEqual(dwUpkeep, 0);
      assert.strictEqual(lfUpkeep, 1);
    });
    withEnv({ LEDGERDARK: '1', WITNESSDOOR_B: '1', DOORWALK_B: '1' }, () => {
      dwUpkeep = 0; lfUpkeep = 0;
      DW.darkwit.upkeep(Game, ctx);
      assert.strictEqual(dwUpkeep, 0);
      assert.strictEqual(lfUpkeep, 1);
    });
    ok('COMPOSITION: door gate ON upkeep runs linkfeast upkeep exactly once directly, doorwalk upkeep never called (road on or off)', true);
  } finally {
    DWmod.doorwalk.daily = origDwDaily;
    DWmod.doorwalk.upkeep = origDwUpkeep;
    LF.linkfeast.upkeep = origLfUpkeep;
  }

  // --- (D) LIVE: determinism — darkwit baseline (road OFF) on seed
  // 53001 reproduces the witnessdoor armed leg on the same seed
  // EXACTLY (headline numbers).
  const skipLive = process.env.SKIP_LIVE === '1';
  const smokeSeed = process.env.DARKWIT_SMOKE_SEED ? parseInt(process.env.DARKWIT_SMOKE_SEED, 10) : null;
  const tmpWit = '/tmp/darkwit-b-proof-witnessdoor';
  const tmpBase = '/tmp/darkwit-b-proof-baseline';
  const tmpSmoke = '/tmp/darkwit-b-proof-smoke';
  [tmpWit, tmpBase, tmpSmoke].forEach(function (d) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {}
    fs.mkdirSync(d, { recursive: true });
  });
  const runWit = function (policy, outdir, seeds, runName) {
    const env = Object.assign({}, process.env, { SEEDS: seeds, DAYS: '150', RUN: runName, POLICY: policy, OUTDIR: outdir });
    execSync('node scripts/witnessdoor-b-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
  };
  const runDark = function (policy, outdir, seeds, runName) {
    const env = Object.assign({}, process.env, { SEEDS: seeds, DAYS: '150', RUN: runName, POLICY: policy, OUTDIR: outdir });
    execSync('node scripts/darkwit-b-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
  };
  if (!skipLive) {
    runWit('armed', tmpWit, '53001', 'witnessdoor-proof-armed');
    runDark('baseline', tmpBase, '53001', 'darkwit-proof-baseline');
    const w = JSON.parse(fs.readFileSync(path.join(tmpWit, 'witnessdoor-b-s53001-witnessdoor-proof-armed.json'), 'utf8'));
    const b = JSON.parse(fs.readFileSync(path.join(tmpBase, 'darkwit-b-s53001-darkwit-proof-baseline.json'), 'utf8'));
    assert.strictEqual(w.instrumentErrors.length, 0);
    assert.strictEqual(b.instrumentErrors.length, 0);
    ok('LIVE: both determinism legs run with 0 instrument errors', true);
    const head = function (o) {
      return { days: o.days, gameDays: o.gameDays, endReason: o.endReason, standing: o.standing,
        maxWave: o.maxWave, finalSeat: (o.finalSeat || {}).seat || null,
        w4kills: (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length,
        wdEntered: (o.witnessdoorStats || {}).doorsEntered | 0,
        wdWalked: ((o.witnessdoorStats || {}).walked || []).map(function (x) { return x.path + '@d' + x.day + '/' + (x.branch || '?'); }) };
    };
    assert.deepStrictEqual(head(b), head(w));
    ok('LIVE: darkwit baseline (road OFF) reproduces witnessdoor armed EXACTLY on seed 53001 (determinism leg)', true);
  } else {
    console.log('LIVE: determinism legs skipped (SKIP_LIVE=1)');
  }

  // --- (D2) LIVE SMOKE: armed leg on a judged-band sat seed — the
  // road must engage (counters move), the ledger trace must be
  // recorded, and the run must complete without stalling. The seed
  // sitting (or not) is REPORTED, not asserted: the road perturbs
  // pre-sit trajectories by design, so a single seed's sit outcome
  // is the pilot's measurement, not the smoke's gate.
  if (smokeSeed) {
    runDark('armed', tmpSmoke, String(smokeSeed), 'darkwit-proof-smoke');
    const s = JSON.parse(fs.readFileSync(path.join(tmpSmoke, 'darkwit-b-s' + smokeSeed + '-darkwit-proof-smoke.json'), 'utf8'));
    assert.strictEqual(s.instrumentErrors.length, 0);
    ok('LIVE SMOKE: seed ' + smokeSeed + ' armed leg runs with 0 instrument errors', true);
    const ld = s.ledgerDarkStats || {};
    const roadActivity = (ld.begsRefused | 0) + (ld.aidBegsRefused | 0) + (ld.hoardTakes | 0) + (ld.betrayalDone | 0) + (ld.recruitDone | 0);
    assert.ok(roadActivity > 0, 'the road engaged (activity ' + roadActivity + ')');
    ok('LIVE SMOKE: the ledger-dark road engaged on ' + smokeSeed + ' (begs ' + (ld.begsRefused | 0) + ', hoard ' + (ld.hoardTakes | 0) + ', recruit ' + (ld.recruitDone | 0) + ', betrayal ' + (ld.betrayalDone | 0) + ')', true);
    const traced = (s.daily || []).filter(function (r) { return r.ledger && r.ledger.witnessBranch; }).length;
    assert.ok(traced > 0, 'ledger trace recorded on ' + traced + ' daily rows');
    ok('LIVE SMOKE: ledger trace recorded (' + traced + ' daily rows carry the witness branch)', true);
    assert.ok((s.days | 0) > 0 && !!s.endReason, 'the run completed with an end reason');
    ok('LIVE SMOKE: the run completed without stalling (days ' + s.days + ', ' + s.endReason + ')', true);
    const sat = (s.takeseatStats || {}).seatTaken | 0;
    const walked = (s.witnessdoorStats || {}).walked || [];
    console.log('LIVE SMOKE: seed ' + smokeSeed + ' sat=' + sat + ' walked=' + walked.map(function (w) { return w.path + '@d' + w.day + '/' + (w.branch || '?'); }).join(', ') + ' (reported, not gated)');
  } else {
    console.log('LIVE SMOKE: skipped (DARKWIT_SMOKE_SEED unset — run after the baseline leg names a sat seed)');
  }

  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
