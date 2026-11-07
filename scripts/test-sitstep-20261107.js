// test-sitstep-20261107.js — proof for the sit-step seat-gate recorder,
// classifier, and analyzer (arm sim-sitstep-b). Fixture tests for
// classifyGate (every link in the sit chain + edge cases), a fake-Game
// test that the sit-attempt wraps count calls and pass results through,
// and a live leg: seed 53006 staged, 150d, asserting the recorder runs,
// pair days reproduce the confirm2 number (42), sit attempts are
// counted (0), and instrument errors are 0. Exit non-zero on any
// failure. The live leg writes nothing into the repo.
// Usage: node scripts/test-sitstep-20261107.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'sitstep-instrument-20261107'));
const classifyGate = INST.classifyGate;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- classifyGate fixtures ----------
(function () {
  const fullDetail = { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true };
  const base = { day: 100, tableDone: false, seat: 'lesser', seatDetail: fullDetail,
    sentimentTaught: true, feastSurgeUsed: true, tableWaiting: true, winDayFloorOk: true,
    preview: { seat: 'lesser', doors: ['the Feared'], ready: true, why: '' } };

  // 1. Ready preview, never sat -> the instrument finding, not a gate.
  let c = classifyGate(base);
  check('gate-offer-not-taken', c.gate === 'offer-not-taken' && c.missing.length === 1, JSON.stringify(c));
  // 2. Sat -> sat.
  c = classifyGate(Object.assign({}, base, { tableDone: true }));
  check('gate-sat', c.gate === 'sat' && c.missing.length === 0, JSON.stringify(c));
  // 3. No seat, one bar short (wave-3 faced 2/3) -> no-seat names it.
  c = classifyGate(Object.assign({}, base, { seat: 'none',
    seatDetail: Object.assign({}, fullDetail, { w3: 2 }), preview: null }));
  check('gate-no-seat-wave3', c.gate === 'no-seat' && c.missing.some(function (m) { return /wave-3/.test(m); }) &&
    !c.missing.some(function (m) { return /wave-1|wave-2/.test(m); }), JSON.stringify(c));
  // 4. No seat, several bars short -> all named.
  c = classifyGate(Object.assign({}, base, { seat: 'none',
    seatDetail: { w1: 1, w2: 2, w3: 0, contestsN: 0, crisesN: 1, rank: 'village', stage: 1, foodDeeds: false },
    sentimentTaught: false, feastSurgeUsed: false, preview: null }));
  check('gate-no-seat-many', c.gate === 'no-seat' && c.missing.length === 8, JSON.stringify(c));
  // 5. Food-deed split: sentiment taught, surge never spent -> names the surge half.
  c = classifyGate(Object.assign({}, base, { seat: 'none',
    seatDetail: Object.assign({}, fullDetail, { foodDeeds: false }),
    sentimentTaught: true, feastSurgeUsed: false, preview: null }));
  check('gate-no-seat-surge-half', c.gate === 'no-seat' && c.missing.length === 1 &&
    /feast surge/.test(c.missing[0]), JSON.stringify(c));
  // 6. Food-deed split, other half: sentiment never taught.
  c = classifyGate(Object.assign({}, base, { seat: 'none',
    seatDetail: Object.assign({}, fullDetail, { foodDeeds: false }),
    sentimentTaught: false, feastSurgeUsed: true, preview: null }));
  check('gate-no-seat-sentiment-half', c.gate === 'no-seat' && c.missing.length === 1 &&
    /sentiment/.test(c.missing[0]), JSON.stringify(c));
  // 7. Seat earned, no preview, day < 90 -> no-preview names the day floor.
  c = classifyGate(Object.assign({}, base, { day: 60, winDayFloorOk: false, preview: null }));
  check('gate-no-preview-dayfloor', c.gate === 'no-preview' &&
    c.missing.some(function (m) { return /< 90/.test(m); }), JSON.stringify(c));
  // 8. Seat earned, no preview, Arc IV never fired -> no-preview names tableWaiting.
  c = classifyGate(Object.assign({}, base, { day: 100, tableWaiting: false, preview: null }));
  check('gate-no-preview-waiting', c.gate === 'no-preview' &&
    c.missing.some(function (m) { return /tableWaiting/.test(m); }), JSON.stringify(c));
  // 9. Preview present but not ready -> entry-blocked carries the engine's why.
  c = classifyGate(Object.assign({}, base, { preview: { seat: 'lesser', doors: [], ready: false, why: 'Finish the current contest before taking your seat.' } }));
  check('gate-entry-blocked', c.gate === 'entry-blocked' && /contest/.test(c.missing[0]), JSON.stringify(c));
  // 10. Full seat + ready preview -> still offer-not-taken (the seat is not the block).
  c = classifyGate(Object.assign({}, base, { seat: 'full', preview: { seat: 'full', doors: ['the Feared', 'the Beloved'], ready: true, why: '' } }));
  check('gate-full-seat-still-untaken', c.gate === 'offer-not-taken', JSON.stringify(c));
  // 11. Seat 'none' wins over a stale preview (defense in depth: the seat is the first link).
  c = classifyGate(Object.assign({}, base, { seat: 'none', preview: { seat: 'lesser', doors: [], ready: true, why: '' } }));
  check('gate-seat-first', c.gate === 'no-seat', JSON.stringify(c));
  // 12. Empty row -> no-seat, never throws.
  c = classifyGate({});
  check('gate-empty-row', c.gate === 'no-seat' && c.missing.length > 0, JSON.stringify(c));
})();

// ---------- fake-Game sit-wrap test ----------
// The fake mimics the engine contract the stageally + sitstep
// instruments read: combat hooks, standing reads, table reads.
(function () {
  const fg = {
    data: { monsters: [{ id: 'w4a', wave: 4 }], villagers: [{ id: 'scholar', dead: false }, { id: 'bob', dead: false }] },
    state: { scholar: { day: 100, prog: { feastSurgeUsed: true } }, village: { roster: ['scholar', 'bob'], trust: {}, party: ['bob'], fallen: [] }, waveKillLog: [{ by: 'scholar', w: 4, d: 90 }, { by: 'bob', w: 4, d: 95 }] },
    villagerId: 'scholar',
    tbfight: null,
    partyMembers: function () { return ['bob']; },
    partyUnlocked: function () { return true; },
    playerAtHaven: function () { return true; },
    tbPlayerRally: function () { return true; },
    startCombat: function (mid) { fg.tbfight = { id: 7, fighters: [], round: 1, over: false }; return true; },
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
    progState: function () { return { arc: 4, tableWaiting: true, tableAnnounced: true, tableDone: false, sentimentTaught: true }; },
    tableSeat: function () { return { seat: 'lesser', detail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } }; },
    deedGateReady: function () { return { ok: false, w1: 4, w2: 4, w3: 3, w4: 1, w5: 0, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true }; },
    tablePreview: function () { return { seat: 'lesser', doors: ['the Feared'], ready: true, why: '', overtime: 0, fullReady: false }; },
    tableEntryBlock: function () { return ''; },
    winDayFloorOk: function () { return true; },
    tableSeatTakerOptions: function () { return [{ id: 'self', name: 'Bearer', self: true, score: null }, { id: 'bob', name: 'Bob', self: false, score: 12 }]; },
    fullSeatShortfall: function () { return { ready: false, missing: ['only 1 of 3 different wave-4 monsters faced'], line: 'x' }; },
    tableTakeSeat: function () { return { ok: true, msg: '' }; },
    tableOfferSeatTaker: function () { return { ok: true, choosingSeat: true, msg: '' }; },
    tableChooseSeatTaker: function () { return { ok: true, msg: '' }; },
    chooseTableOption: function () { return { ok: true }; },
  };
  const inst = INST.install(fg);
  const snap = inst.snapshot();
  check('fake-seat-fields', snap.seat === 'lesser' && snap.arc === 4 && snap.tableWaiting === true &&
    snap.preview && snap.preview.ready === true && snap.livingVeterans === 2 && snap.pairDay === true &&
    snap.seatTakerOptions === 2 && snap.bestSeatTakerScore === 12 && snap.gate === 'offer-not-taken',
    JSON.stringify({ seat: snap.seat, arc: snap.arc, preview: snap.preview, lv: snap.livingVeterans, gate: snap.gate }));
  check('fake-classify-agrees', classifyGate(snap).gate === 'offer-not-taken', snap.gate);
  const r1 = fg.tableTakeSeat();
  const r2 = fg.tableOfferSeatTaker();
  const r3 = fg.chooseTableOption('x');
  check('fake-sit-wraps-count-and-pass-through', r1.ok === true && r2.ok === true && r3.ok === true &&
    inst.t.sitAttempts.length === 3 &&
    inst.t.sitAttempts[0].call === 'tableTakeSeat' && inst.t.sitAttempts[0].ok === true &&
    inst.t.sitAttempts[1].call === 'tableOfferSeatTaker' &&
    inst.t.sitAttempts[2].call === 'chooseTableOption',
    JSON.stringify(inst.t.sitAttempts));
  const fin = inst.finalize();
  check('fake-finalize', fin.finalSeat && fin.finalSeat.seat === 'lesser' && fin.sitAttempts.length === 3 &&
    fin.finalFullShortfall && fin.finalFullShortfall.missing.length === 1, JSON.stringify(fin.finalSeat));
  inst.uninstall();
  check('fake-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  check('fake-uninstall-restores', fg.tableTakeSeat !== inst.t.sitAttempts && typeof fg.tableTakeSeat === 'function' &&
    fg.tableTakeSeat().ok === true && inst.t.sitAttempts.length === 3, 'wrap not removed or call leaked');
})();

// ---------- live leg: 53006 staged, 150d ----------
// The recorder must run, pair days must reproduce the confirm2 number
// (42), sit attempts must be counted, errors 0. This leg writes
// nothing into the repo.
async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const STAGEDMOD = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
  const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));

  const { Game } = await loadGame({ seed: 53006, mode: 'competent-sitstep-proof', fullTelemetry: false });
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
  const daily = inst.t.daily;
  const pairDays = daily.filter(function (d) { return d.pairDay; }).length;
  const pairRowsOk = daily.filter(function (d) { return d.pairDay; }).every(function (d) { return d.seat != null && d.gate != null; });
  check('live-53006-runs', result && result.days === 150 && daily.length >= 140 &&
    inst.t.instrumentErrors.length === 0,
    'days=' + (result && result.days) + ' snaps=' + daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));
  check('live-53006-determinism', pairDays === 42 && (fin.standing | 0) === 440 &&
    (fin.unlockedWave | 0) === 5 && (fin.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length === 11,
    'pairDays=' + pairDays + ' standing=' + fin.standing + ' unlocked=' + fin.unlockedWave +
    ' w4kills=' + (fin.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length);
  check('live-53006-sit-counted', inst.t.sitAttempts.length === 0 && (fin.sitAttempts || []).length === 0,
    'sitAttempts=' + JSON.stringify(inst.t.sitAttempts));
  check('live-53006-pair-rows-classified', pairRowsOk, 'pairDays=' + pairDays);
  check('live-53006-final-seat', fin.finalSeat && typeof fin.finalSeat.seat === 'string',
    JSON.stringify(fin.finalSeat));

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
