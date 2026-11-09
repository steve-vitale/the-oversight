// test-sitmetric-b.js — proof for the reached-but-never-sat metric fix
// (arm sim-sitmetric-b, run fleshout-loop-b-20261109T0130Z).
//
// Two known cases, both measurement-side (zero src/js):
//  (a) the §15 compare must surface the raw table-invitation flag
//      alongside the ruling-665 sitting metric (flipsocial corpora:
//      winseek row.table 7/8 -> 5/8 while sittings read 0/8 both legs).
//  (b) finalSeat must not price a seat never taken (fightloop seed
//      53004: finalSeat "lesser" with takeseatStats.seatTaken 0).
// Fixture tests for the aligned-seat helper, known-case tests on the
// real corpora, compare tests on the real flipsocial panels, a
// fake-Game test of the instrument finalize (all three taken-signals),
// and a one-seed live leg proving the new finalize fields on real game
// state. Exit non-zero on any failure. The live leg writes nothing
// into the repo. Usage: node scripts/test-sitmetric-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const REPO = path.join(__dirname, '..');
const { pricedSeatOf, seatTakenOf, alignedSeat } = require(path.join(REPO, 'scripts', 'lib', 'seat-taken'));
const INST = require(path.join(REPO, 'scripts', 'sitstep-instrument-20261107'));
const DW = require(path.join(REPO, 'scripts', 'doorwalk-b-analyze-20261107'));
const score = require(path.join(REPO, 'scripts', 'lib', 'balance-scorecard'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- (1) helper fixtures ----------
(function () {
  // 53004-shaped row: priced lesser, never taken.
  const untaken = { seed: 53004, finalSeat: { seat: 'lesser', detail: { w1: 11 } },
    takeseatStats: { seatTaken: 0, seatDay: null, seatKind: null }, sitAttempts: [], daily: [] };
  check('helper-53004-shape', pricedSeatOf(untaken) === 'lesser' && seatTakenOf(untaken) === false &&
    alignedSeat(untaken) === 'none', JSON.stringify({ p: pricedSeatOf(untaken), t: seatTakenOf(untaken), a: alignedSeat(untaken) }));
  // Taken row: priced lesser, taken once.
  const taken = { seed: 53001, finalSeat: { seat: 'lesser', detail: {} },
    takeseatStats: { seatTaken: 1, seatDay: 120, seatKind: 'lesser' }, sitAttempts: [{ call: 'tableTakeSeat', ok: true }], daily: [{ day: 120, tableDone: true }] };
  check('helper-taken-shape', alignedSeat(taken) === 'lesser' && seatTakenOf(taken) === true, alignedSeat(taken));
  // New-instrument boolean field wins over the priced seat.
  check('helper-new-field-true', alignedSeat({ finalSeat: { seat: 'full' }, seatTaken: true }) === 'full', '');
  check('helper-new-field-false', alignedSeat({ finalSeat: { seat: 'full' }, seatTaken: false }) === 'none', '');
  // Daily tableDone alone is a taken signal (dawn tableScene path).
  check('helper-daily-signal', seatTakenOf({ finalSeat: { seat: 'lesser' }, daily: [{ day: 1, tableDone: false }, { day: 90, tableDone: true }] }) === true, '');
  // A recorded ok verb call alone is a taken signal.
  check('helper-verb-signal', seatTakenOf({ finalSeat: { seat: 'lesser' }, sitAttempts: [{ call: 'tableTakeSeat', ok: false }, { call: 'tableTakeSeat', ok: true }] }) === true, '');
  // Failed verb calls only, no other signal: not taken.
  check('helper-failed-verbs', seatTakenOf({ finalSeat: { seat: 'lesser' }, sitAttempts: [{ call: 'tableTakeSeat', ok: false }] }) === false, '');
  // No signal at all: the priced reading stands, never invented.
  check('helper-unknown-preserved', seatTakenOf({ finalSeat: { seat: 'lesser' } }) === null &&
    alignedSeat({ finalSeat: { seat: 'lesser' } }) === 'lesser', '');
  check('helper-empty-row', pricedSeatOf(null) === null && seatTakenOf(null) === null && alignedSeat(null) === null, '');
  check('helper-string-seat', pricedSeatOf({ finalSeat: 'lesser' }) === 'lesser', '');
})();

// ---------- (2) known case on the real fightloop corpora ----------
(function () {
  function load(leg, seed) {
    return JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-08',
      'perseed-fightloop-b-' + leg, 'combatdiv-b-s' + seed + '-fightloop-b-' + leg + '.json'), 'utf8'));
  }
  const b04 = load('baseline', 53004);
  check('corpus-53004-baseline', pricedSeatOf(b04) === 'lesser' && seatTakenOf(b04) === false &&
    alignedSeat(b04) === 'none' && ((b04.takeseatStats || {}).seatTaken | 0) === 0,
    'priced=' + pricedSeatOf(b04) + ' aligned=' + alignedSeat(b04));
  const c04 = load('candidate', 53004);
  check('corpus-53004-candidate', pricedSeatOf(c04) === 'none' && alignedSeat(c04) === 'none' &&
    ((c04.takeseatStats || {}).seatTaken | 0) === 0, 'priced=' + pricedSeatOf(c04));
  const b01 = load('baseline', 53001);
  check('corpus-53001-taken', alignedSeat(b01) === 'lesser' && ((b01.takeseatStats || {}).seatTaken | 0) === 1, alignedSeat(b01));
  // Invariant on all 16 rows: aligned !== 'none' iff a seat was taken.
  let bad = [];
  ['baseline', 'candidate'].forEach(function (leg) {
    [53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008].forEach(function (seed) {
      const o = load(leg, seed);
      const ts = ((o.takeseatStats || {}).seatTaken | 0);
      if ((alignedSeat(o) !== 'none') !== (ts > 0)) bad.push(leg + '/' + seed);
    });
  });
  check('corpus-aligned-equals-taken-16', bad.length === 0, bad.join(','));
  // The analyzer reads the aligned seat: 53004 baseline is 'none' with seatTaken 0.
  const norm = DW.analyzeSeed(b04);
  check('analyzer-53004-baseline', norm.finalSeat === 'none' && norm.tsTaken === 0,
    'finalSeat=' + norm.finalSeat + ' tsTaken=' + norm.tsTaken);
  const normTaken = DW.analyzeSeed(b01);
  check('analyzer-53001-taken', normTaken.finalSeat === 'lesser' && normTaken.tsTaken === 1, normTaken.finalSeat);
})();

// ---------- (3) flipsocial compare: reach surfaced, judged values untouched ----------
(function () {
  function loadPanel(leg) {
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-08',
      'panel-flipsocial-b', leg, 'panel.json.gz'))));
  }
  const before = loadPanel('before'), after = loadPanel('after');
  const rep = score.comparePanels(before, after, {});
  check('compare-decision-unchanged', rep.decision === 'review_required', rep.decision);
  check('compare-contract-unchanged', before.contractDigest === score.contractDigest &&
    after.contractDigest === score.contractDigest, 'digest moved');
  const recorded = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-08',
    'panel-flipsocial-b', 'compare.json'), 'utf8'));
  check('compare-recorded-decision', recorded.decision === rep.decision, recorded.decision);
  check('compare-judged-metrics-identical',
    JSON.stringify(recorded.policies.map(function (p) { return p.metrics; })) ===
    JSON.stringify(rep.policies.map(function (p) { return p.metrics; })),
    'a judged metric moved');
  const win = rep.policies.find(function (p) { return p.policy === 'winseek'; });
  const soc = rep.policies.find(function (p) { return p.policy === 'socialite'; });
  const tableMetric = win.metrics.find(function (m) { return m.id === 'table'; });
  check('compare-winseek-judged-table-0', tableMetric.before === 0 && tableMetric.after === 0,
    tableMetric.before + '/' + tableMetric.after);
  check('compare-winseek-reach-7-to-5', win.tableReach && win.tableReach.invitedBefore === 7 &&
    win.tableReach.invitedAfter === 5 && win.tableReach.sittingsBefore === 0 &&
    win.tableReach.sittingsAfter === 0 && win.tableReach.cases === 8, JSON.stringify(win.tableReach));
  check('compare-socialite-reach-0', soc.tableReach && soc.tableReach.invitedBefore === 0 &&
    soc.tableReach.invitedAfter === 0 && soc.tableReach.sittingsBefore === 0 &&
    soc.tableReach.sittingsAfter === 0 && soc.tableReach.cases === 8, JSON.stringify(soc.tableReach));
  const md = score.markdown(rep);
  check('compare-md-reach-line', md.includes('Table reach (raw') && md.includes('7/8 before') &&
    md.includes('5/8 after') && md.includes('sittings (ruling 665) 0/8'),
    md.split('\n').filter(function (l) { return /Table reach/.test(l); }).join(' '));
  check('compare-md-judged-table-still-0', /Table sitting rate \(seat taken, whether or not a waiting invitation was observed\) \| 0 \| 0 \|/.test(md), '');
})();

// ---------- (4) instrument finalize, fake Game ----------
// Minimal fake of the engine contract the stageally + sitstep
// instruments read (mirrors test-sitstep-20261107.js's fake).
function makeFake(tableDone) {
  let done = !!tableDone;
  const fg = {
    data: { monsters: [{ id: 'w4a', wave: 4 }], villagers: [{ id: 'scholar', dead: false }, { id: 'bob', dead: false }] },
    state: { scholar: { day: 100, prog: { feastSurgeUsed: true } }, village: { roster: ['scholar', 'bob'], trust: {}, party: ['bob'], fallen: [] }, waveKillLog: [{ by: 'scholar', w: 4, d: 90 }] },
    villagerId: 'scholar', tbfight: null,
    partyMembers: function () { return ['bob']; },
    partyUnlocked: function () { return true; },
    playerAtHaven: function () { return true; },
    tbPlayerRally: function () { return true; },
    startCombat: function () { fg.tbfight = { id: 7, fighters: [], round: 1, over: false }; return true; },
    fieldFight: function () { return { outcome: 'fled' }; },
    recordWaveKill: function () { return true; },
    playerDeath: function () { return true; },
    tbEnd: function (result) { const f = fg.tbfight; if (!f || f.over) return; f.over = true; f.result = result; fg.tbfight = null; },
    villageStanding: function () { return { total: 290 }; },
    villageStandingTotal: function () { return 290; },
    waveCombatReadiness: function () { return { wave: 5, ready: true, armored: 2, armed: 2, tricks: 2, veterans: 2, demand: { armored: 2, armed: 2, tricks: 2, veterans: 2 }, short: [] }; },
    waveEngaged: function () { return 1; },
    deedState: function () { return { wavesFaced: {} }; },
    scaleRank: function () { return 'regional'; },
    unlockedWave: function () { return 5; },
    getPerson: function (vid) { return { id: vid, dead: false }; },
    progState: function () { return { arc: 4, tableWaiting: true, tableAnnounced: true, tableDone: done, sentimentTaught: true }; },
    setTableDone: function (v) { done = !!v; },
    tableSeat: function () { return { seat: 'lesser', detail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } }; },
    deedGateReady: function () { return { ok: false }; },
    tablePreview: function () { return { seat: 'lesser', doors: ['the Feared'], ready: true, why: '', overtime: 0, fullReady: false }; },
    tableEntryBlock: function () { return ''; },
    winDayFloorOk: function () { return true; },
    tableSeatTakerOptions: function () { return []; },
    fullSeatShortfall: function () { return { ready: false, missing: ['only 1 of 3 different wave-4 monsters faced'], line: 'x' }; },
    tableTakeSeat: function () { return { ok: true, msg: '' }; },
    tableOfferSeatTaker: function () { return { ok: true, choosingSeat: true, msg: '' }; },
    tableChooseSeatTaker: function () { return { ok: true, msg: '' }; },
    chooseTableOption: function () { return { ok: true }; },
  };
  return fg;
}
(function () {
  // Untaken: priced lesser, no sit call, tableDone false -> 'none',
  // priced seat kept visible, shortfall still prices the priced seat.
  const fg = makeFake(false);
  const inst = INST.install(fg);
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  check('finalize-untaken-none', fin.finalSeat && fin.finalSeat.seat === 'none' && fin.seatTaken === false,
    JSON.stringify(fin.finalSeat) + ' seatTaken=' + fin.seatTaken);
  check('finalize-untaken-priced-kept', fin.finalSeatPriced && fin.finalSeatPriced.seat === 'lesser',
    JSON.stringify(fin.finalSeatPriced));
  check('finalize-untaken-shortfall-priced', fin.finalFullShortfall && fin.finalFullShortfall.missing.length === 1,
    JSON.stringify(fin.finalFullShortfall));
  // Taken via the verb: a successful tableTakeSeat call -> 'lesser'.
  const fg2 = makeFake(false);
  const inst2 = INST.install(fg2);
  inst2.snapshot();
  const r = fg2.tableTakeSeat();
  const fin2 = inst2.finalize();
  inst2.uninstall();
  check('finalize-verb-taken', r.ok === true && fin2.seatTaken === true && fin2.finalSeat &&
    fin2.finalSeat.seat === 'lesser' && fin2.finalSeatPriced.seat === 'lesser',
    JSON.stringify(fin2.finalSeat) + ' seatTaken=' + fin2.seatTaken);
  // Taken via daily tableDone: the dawn tableScene path, no verb call.
  const fg3 = makeFake(false);
  const inst3 = INST.install(fg3);
  inst3.snapshot();
  fg3.setTableDone(true);
  inst3.snapshot();
  const fin3 = inst3.finalize();
  inst3.uninstall();
  check('finalize-daily-taken', fin3.seatTaken === true && fin3.finalSeat && fin3.finalSeat.seat === 'lesser',
    JSON.stringify(fin3.finalSeat) + ' seatTaken=' + fin3.seatTaken);
  // Taken at finalize time only (sit on the last day, after snapshots).
  const fg4 = makeFake(false);
  const inst4 = INST.install(fg4);
  inst4.snapshot();
  fg4.setTableDone(true);
  const fin4 = inst4.finalize();
  inst4.uninstall();
  check('finalize-final-state-taken', fin4.seatTaken === true && fin4.finalSeat.seat === 'lesser', fin4.seatTaken);
})();

// ---------- (5) live leg: one seed, staged, 150d ----------
// Trajectory-independent: only the new finalize fields' internal
// consistency on real game state. Mirrors test-sitstep-20261107.js.
async function liveLeg() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const STAGEDMOD = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
  const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
  const { Game } = await loadGame({ seed: 53006, mode: 'competent-sitmetric-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, STAGEDMOD.stagedPolicy, {
    daily: function (Gm, ctx) {
      try { return STAGEDMOD.stagedPolicy.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== last) { last = d; inst.snapshot(); }
      }
    },
  });
  try { RALLY.resetBankkillerStats(); } catch (e) {}
  try { STAGEDMOD.resetStageallyStats(); } catch (e) {}
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 150, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  // Death-aware horizon: 53006 staged dies village-lost on current
  // master (day 122 on this base), so the run stops early by design —
  // assert the run ended cleanly with snapshots tracking days, not a
  // fixed 150d.
  check('live-runs', result && result.days > 0 && result.days <= 150 &&
    (inst.t.daily || []).length >= result.days - 5 &&
    inst.t.instrumentErrors.length === 0,
    'days=' + (result && result.days) + ' end=' + (result && result.endReason) +
    ' snaps=' + (inst.t.daily || []).length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));
  check('live-finalize-fields', fin.finalSeatPriced && typeof fin.finalSeatPriced.seat === 'string' &&
    typeof fin.seatTaken === 'boolean' && fin.finalSeat && typeof fin.finalSeat.seat === 'string',
    JSON.stringify({ priced: fin.finalSeatPriced && fin.finalSeatPriced.seat, taken: fin.seatTaken, reported: fin.finalSeat && fin.finalSeat.seat }));
  check('live-finalize-consistent', fin.seatTaken === (fin.finalSeat.seat !== 'none') &&
    (fin.seatTaken ? fin.finalSeat.seat === fin.finalSeatPriced.seat : fin.finalSeat.seat === 'none'),
    'taken=' + fin.seatTaken + ' reported=' + fin.finalSeat.seat + ' priced=' + fin.finalSeatPriced.seat);
  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLeg().catch(function (e) { console.error(e.stack); process.exit(1); });
