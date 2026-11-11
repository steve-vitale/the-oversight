// test-tributedeliv-b.js — proof test for the tribute-delivery diag
// (Loop B arm sim-tributedeliv-b). Instrument-only arm: this test proves
// the RECORDER and the CLASSIFIER, not game code (no src/js changed).
//
// THE QUESTION (findings #2255): tribute READY on 2/8 vetphantom seeds
// (190393, 190397 — both ending {veterans:2, payable:1}) and delivered
// on 0/8. Two candidate blocking conditions, both read in code:
//   (a) PAYABLE_SHORT — readiness counts the scholar, delivery needs 2
//       PAYABLE (non-scholar) veterans: scholar+1 reads ready but the
//       delivery honestly refuses 'veterans-short'.
//   (b) DELIVERABLE_NO_ATTEMPT — delivery is a player Haven-panel act
//       (app.js panelHaven); the competent policy never calls
//       ladderDeliverCapstone, so a standing pair is never attempted.
// This test proves: the classifier separates (a) from (b) on synthetic
// ready-states; the instrument records every field every day; the
// delivery wrap logs real attempts with real outcomes (refusal at
// payable 1, success at payable 2); and the analyzer leaves 0
// unclassified on a known corpus covering all four codes.
//
// Usage: node scripts/test-tributedeliv-b.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const TD = require('./tributedeliv-instrument-20261111');
const T = K.reporter('tributedeliv-b');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  const Game = await K.load({ seed: 131101 });

  function fresh() {
    K.newRun(Game);
    Game.state.waveKillLog = [];
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    if (others.length < 2) throw new Error('fresh run has <2 non-scholar roster members: ' + JSON.stringify(roster));
    return { vidA: others[0], vidB: others[1], scholarId: scholarId, roster: roster };
  }
  function giveKill(vid, w) {
    Game.state.waveKillLog.push({ by: vid, w: w, day: gday(Game) || 1 });
  }

  // ---- 1. Pure classifier: synthetic ready-states ----
  T.section('1. classifyDay on synthetic ready-states');
  const mk = (day, veterans, payable) => ({ day: day, tribute: { ready: true, veterans: veterans, payable: payable, need: 2, reason: 'ready' } });
  T.ok('payable 1 ready -> PAYABLE_SHORT', TD.classifyDay(mk(10, 2, 1), []) === 'PAYABLE_SHORT', TD.classifyDay(mk(10, 2, 1), []));
  T.ok('payable 0 ready is impossible shape but still PAYABLE_SHORT', TD.classifyDay(mk(10, 1, 0), []) === 'PAYABLE_SHORT', TD.classifyDay(mk(10, 1, 0), []));
  T.ok('payable 2 ready, no attempt -> DELIVERABLE_NO_ATTEMPT', TD.classifyDay(mk(10, 2, 2), []) === 'DELIVERABLE_NO_ATTEMPT', TD.classifyDay(mk(10, 2, 2), []));
  T.ok('payable 3 ready, no attempt -> DELIVERABLE_NO_ATTEMPT', TD.classifyDay(mk(10, 3, 3), []) === 'DELIVERABLE_NO_ATTEMPT', TD.classifyDay(mk(10, 3, 3), []));
  T.ok('attempt refused veterans-short -> ATTEMPT_REFUSED_veterans-short',
    TD.classifyDay(mk(10, 2, 1), [{ day: 10, result: { ok: false, reason: 'veterans-short' } }]) === 'ATTEMPT_REFUSED_veterans-short',
    TD.classifyDay(mk(10, 2, 1), [{ day: 10, result: { ok: false, reason: 'veterans-short' } }]));
  T.ok('attempt ok -> DELIVERED',
    TD.classifyDay(mk(10, 2, 2), [{ day: 10, result: { ok: true } }]) === 'DELIVERED',
    TD.classifyDay(mk(10, 2, 2), [{ day: 10, result: { ok: true } }]));
  T.ok('attempt on another day does not classify this day',
    TD.classifyDay(mk(10, 2, 2), [{ day: 11, result: { ok: true } }]) === 'DELIVERABLE_NO_ATTEMPT',
    TD.classifyDay(mk(10, 2, 2), [{ day: 11, result: { ok: true } }]));
  T.ok('not-ready day -> null (not a ready day)',
    TD.classifyDay({ day: 10, tribute: { ready: false, veterans: 1, payable: 1, need: 2, reason: 'veterans-short' } }, []) === null, 'null');
  T.ok('missing tribute read -> null, never UNCLASSIFIED',
    TD.classifyDay({ day: 10, tribute: null }, []) === null, 'null');

  // ---- 2. Live instrument: scholar+1 reads ready, refuses honestly ----
  T.section('2. Live: scholar+1 veteran — ready, payable 1, refusal logged');
  let f = fresh();
  const inst = TD.install(Game);
  giveKill(f.scholarId, 4);
  giveKill(f.vidA, 4);
  let snap = inst.snapshot();
  T.ok('snapshot records day', snap.day === gday(Game), 'day ' + snap.day);
  T.ok('tribute ready with scholar+1', snap.tribute && snap.tribute.ready === true, JSON.stringify(snap.tribute));
  T.ok('tribute veterans = 2 (scholar counts)', snap.tribute && snap.tribute.veterans === 2, JSON.stringify(snap.tribute));
  T.ok('tribute payable = 1 (scholar cannot pay)', snap.tribute && snap.tribute.payable === 1, JSON.stringify(snap.tribute));
  T.ok('tribute need = 2', snap.tribute && snap.tribute.need === 2, JSON.stringify(snap.tribute));
  T.ok('deliverySeen count = 1 (scholar excluded)', snap.deliverySeen && snap.deliverySeen.count === 1, JSON.stringify(snap.deliverySeen));
  T.ok('deliverySeen names the one payable villager', snap.deliverySeen && snap.deliverySeen.seen[0].by === f.vidA, JSON.stringify(snap.deliverySeen));
  T.ok('scholarIsVeteran = true', snap.scholarIsVeteran === true, String(snap.scholarIsVeteran));
  T.ok('ladderVets4 = 2 agrees with tribute veterans', snap.ladderVets4 === 2, String(snap.ladderVets4));
  T.ok('nothing delivered yet', snap.delivered === null, String(snap.delivered));
  T.ok('no attempts logged yet', inst.t.attempts.length === 0, String(inst.t.attempts.length));
  const r1 = Game.ladderDeliverCapstone('military_tribute');
  T.ok('delivery at payable 1 refuses', r1 && r1.ok === false, JSON.stringify(r1));
  T.ok('refusal reason is veterans-short', r1 && r1.reason === 'veterans-short', JSON.stringify(r1));
  T.ok('refusal reports veterans seen = 1', r1 && r1.veterans === 1, JSON.stringify(r1));
  T.ok('wrap logged the attempt', inst.t.attempts.length === 1, String(inst.t.attempts.length));
  T.ok('logged attempt carries the refusal', inst.t.attempts[0].result.reason === 'veterans-short', JSON.stringify(inst.t.attempts[0]));
  T.ok('ready-day classifies PAYABLE_SHORT before the attempt is counted as refusal only when an attempt exists — attempt present so ATTEMPT_REFUSED',
    TD.classifyDay(snap, inst.t.attempts) === 'ATTEMPT_REFUSED_veterans-short', TD.classifyDay(snap, inst.t.attempts));
  inst.uninstall();

  // ---- 3. Live instrument: second payable veteran — delivery succeeds ----
  T.section('3. Live: two payable veterans — delivery succeeds, logged');
  f = fresh();
  const inst2 = TD.install(Game);
  giveKill(f.scholarId, 4);
  giveKill(f.vidA, 4);
  giveKill(f.vidB, 4);
  snap = inst2.snapshot();
  T.ok('tribute ready with scholar+2', snap.tribute && snap.tribute.ready === true, JSON.stringify(snap.tribute));
  T.ok('tribute payable = 2', snap.tribute && snap.tribute.payable === 2, JSON.stringify(snap.tribute));
  T.ok('deliverySeen count = 2', snap.deliverySeen && snap.deliverySeen.count === 2, JSON.stringify(snap.deliverySeen));
  T.ok('deliverySeen is log order (vidA first)', snap.deliverySeen && snap.deliverySeen.seen[0].by === f.vidA && snap.deliverySeen.seen[1].by === f.vidB, JSON.stringify(snap.deliverySeen));
  T.ok('ready-day classifies DELIVERABLE_NO_ATTEMPT before any attempt',
    TD.classifyDay(snap, inst2.t.attempts) === 'DELIVERABLE_NO_ATTEMPT', TD.classifyDay(snap, inst2.t.attempts));
  const r2 = Game.ladderDeliverCapstone('military_tribute');
  T.ok('delivery at payable 2 succeeds', r2 && r2.ok === true, JSON.stringify(r2));
  T.ok('delivery names both veterans', r2 && r2.veterans && r2.veterans.length === 2, JSON.stringify(r2));
  T.ok('wrap logged the success', inst2.t.attempts.length === 1 && inst2.t.attempts[0].result.ok === true, JSON.stringify(inst2.t.attempts));
  T.ok('ready-day re-classifies DELIVERED after success',
    TD.classifyDay(snap, inst2.t.attempts) === 'DELIVERED', TD.classifyDay(snap, inst2.t.attempts));
  const snap2 = inst2.snapshot();
  T.ok('after delivery tribute reads not-ready', snap2.tribute && snap2.tribute.ready === false, JSON.stringify(snap2.tribute));
  T.ok('after delivery reason is delivered', snap2.tribute && snap2.tribute.reason === 'delivered', JSON.stringify(snap2.tribute));
  T.ok('after delivery delivered field names the capstone', snap2.delivered === 'military_tribute', String(snap2.delivered));
  inst2.uninstall();

  // ---- 4. Driver records all fields on every day ----
  T.section('4. Instrument records all fields across a competent day');
  f = fresh();
  const inst3 = TD.install(Game);
  inst3.snapshot();
  const before = gday(Game);
  await H.quietLog(async function () { await H.runDays(Game, competent, { days: 1 }); });
  const adv = gday(Game);
  T.ok('one competent day advanced', adv === before + 1, 'from d' + before + ' to d' + adv);
  const snap3 = inst3.snapshot();
  const keys = ['day', 'scholarId', 'tribute', 'deliverySeen', 'ladderVets4', 'scholarIsVeteran', 'w4Log', 'delivered'];
  for (const k of keys) {
    T.ok('snapshot has field ' + k, Object.prototype.hasOwnProperty.call(snap3, k) && snap3[k] !== undefined, k + '=' + JSON.stringify(snap3[k]).slice(0, 80));
  }
  T.ok('tribute read carries all fields', snap3.tribute && ['ready', 'veterans', 'payable', 'need', 'reason'].every(function (k) { return k in snap3.tribute; }), JSON.stringify(snap3.tribute));
  T.ok('no instrument errors on the day', inst3.t.instrumentErrors.length === 0, JSON.stringify(inst3.t.instrumentErrors));
  inst3.uninstall();

  // ---- 5. Analyzer leaves 0 unclassified on a known corpus ----
  T.section('5. Analyzer: 0 unclassified on a known corpus (all four codes)');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tributedeliv-test-'));
  const tmpOut = path.join(tmpDir, 'summary.json');
  function fakeSeed(seed, days) {
    return {
      seed: seed, run: 'test-corpus', days: 150, endReason: 'survived', won: false,
      scaleRank: 'regional', maxWave: 5, standing: 300,
      tribute: { ready: true, veterans: 2, payable: 1, need: 2, reason: 'ready' },
      attempts: days.some(function (d) { return d.attempt; }) ? days.filter(function (d) { return d.attempt; }).map(function (d) { return { day: d.day, kind: 'military_tribute', result: d.attempt, threw: false }; }) : [],
      tributeSays: [], instrumentErrors: [],
      daily: days.map(function (d) {
        return { day: d.day, scholarId: 'scholar', tribute: { kind: 'military_tribute', ready: true, veterans: d.veterans, payable: d.payable, need: 2, reason: 'ready' }, deliverySeen: { seen: [], count: d.payable }, ladderVets4: d.veterans, scholarIsVeteran: d.payable < d.veterans, w4Log: [], delivered: null };
      }),
    };
  }
  // Seed A: 3 PAYABLE_SHORT days, then 1 DELIVERABLE_NO_ATTEMPT day.
  // Seed B: 1 ATTEMPT_REFUSED_veterans-short day, 1 DELIVERED day.
  const seedA = fakeSeed(900001, [
    { day: 50, veterans: 2, payable: 1 }, { day: 51, veterans: 2, payable: 1 },
    { day: 52, veterans: 2, payable: 1 }, { day: 53, veterans: 2, payable: 2 },
  ]);
  const seedB = fakeSeed(900002, [
    { day: 60, veterans: 2, payable: 1, attempt: { ok: false, reason: 'veterans-short', veterans: 1, need: 2 } },
    { day: 61, veterans: 2, payable: 2, attempt: { ok: true, reason: null, veterans: ['a', 'b'], need: null } },
  ]);
  fs.writeFileSync(path.join(tmpDir, 'tributedeliv-s900001-test-corpus.json'), JSON.stringify(seedA));
  fs.writeFileSync(path.join(tmpDir, 'tributedeliv-s900002-test-corpus.json'), JSON.stringify(seedB));
  let analyzerOut = '';
  try {
    analyzerOut = execSync('node scripts/tributedeliv-analyze-20261111.js --dir ' + tmpDir + ' --out ' + tmpOut, { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  } catch (e) {
    T.ok('analyzer exits 0 on the known corpus', false, 'exit ' + e.status + ': ' + String((e.stdout || '') + (e.stderr || '')).slice(0, 400));
  }
  const sum = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
  T.ok('analyzer verdict is DIAG-GO', sum.verdict === 'DIAG-GO', sum.verdict);
  T.ok('analyzer counted 6 ready-days', sum.primary.readyDays === 6, String(sum.primary.readyDays));
  T.ok('analyzer classified 6/6', sum.primary.classified === 6 && sum.primary.unclassified === 0, JSON.stringify(sum.primary));
  T.ok('analyzer code totals match the corpus', sum.codeTotals.PAYABLE_SHORT === 3 && sum.codeTotals.DELIVERABLE_NO_ATTEMPT === 1 && sum.codeTotals['ATTEMPT_REFUSED_veterans-short'] === 1 && sum.codeTotals.DELIVERED === 1, JSON.stringify(sum.codeTotals));
  T.ok('analyzer deliverable-pair days = 2', sum.deliverablePairDays === 2, String(sum.deliverablePairDays));
  T.ok('analyzer stdout names DIAG-GO', /DIAG-GO/.test(analyzerOut), analyzerOut.split('\n').slice(-3).join(' | '));

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
