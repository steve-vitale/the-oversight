// test-regionalstep-20261107.js — proof for the regional-gate recorder,
// classifier, deterministic judge recomputation, and analyzer (arm
// sim-regionalstep-b). Fixture tests for classifyGate (every link in the
// regional chain + edge cases), a detJudge fixture, a fake-Game test that
// the diplomacy wraps count calls and pass results through, and a live
// leg: seed 53006 staged, 150d, asserting the recorder runs, every daily
// row carries a gate, sitstep-r2 headline numbers reproduce on this
// master (51 pair days, standing 415, 8 wave-4+ kills, wave 5 — the
// trajectory guard; if the master moved them, this fails loudly and the
// expectation is re-pinned with the master-move named, per the prereg),
// and instrument errors are 0. Exit non-zero on any failure. The live leg
// writes nothing into the repo.
// Usage: node scripts/test-regionalstep-20261107.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'regionalstep-instrument-20261107'));
const classifyGate = INST.classifyGate;
const detJudge = INST.detJudge;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- classifyGate fixtures ----------
(function () {
  const base = { scale: 'village', networkLive: false, knownCount: 1, bestDet: 60, bestVillageId: 'thornfield', bestOffer: 'sub',
    proposeCalls: 0, acceptLinkRaiseCalls: 0, proposeCounter: 0, answerCounterCalls: 0, pendingCounter: null,
    activeLinks: 0, everLinks: 0, oldestActiveAge: null, firstLinkDay: null, regionalPending: false, accordUnanswered: false };

  // 1. networkLive -> regional.
  let c = classifyGate(Object.assign({}, base, { networkLive: true }));
  check('gate-regional', c.gate === 'regional' && c.missing.length === 0, JSON.stringify(c));
  // 2. Scale moved without the flag (defense in depth) -> regional.
  c = classifyGate(Object.assign({}, base, { scale: 'national' }));
  check('gate-regional-scale', c.gate === 'regional', JSON.stringify(c));
  // 3. No known village.
  c = classifyGate(Object.assign({}, base, { knownCount: 0, bestDet: null }));
  check('gate-no-known', c.gate === 'no-known-village', JSON.stringify(c));
  // 4. Known but no courtship: best det 20, even +10 below 35.
  c = classifyGate(Object.assign({}, base, { bestDet: 20 }));
  check('gate-known-no-courtship', c.gate === 'known-no-courtship' && /20/.test(c.missing[0]), JSON.stringify(c));
  // 5. Courtship-ready (det 40) but never attempted.
  c = classifyGate(Object.assign({}, base, { bestDet: 40 }));
  check('gate-courtship-no-attempt', c.gate === 'courtship-no-attempt' && /0 proposeLink/.test(c.missing[0]), JSON.stringify(c));
  // 6. Counter staged, never answered (pending).
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 1, proposeCounter: 1, pendingCounter: { targetId: 'thornfield', day: 50 } }));
  check('gate-counter-pending', c.gate === 'counter-unanswered' && /thornfield/.test(c.missing[0]), JSON.stringify(c));
  // 7. Counter staged earlier, still never answered, pending cleared.
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 1, proposeCounter: 1, answerCounterCalls: 0 }));
  check('gate-counter-stale', c.gate === 'counter-unanswered', JSON.stringify(c));
  // 8. Counter answered with a walk, no link -> attempted-no-link.
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 1, proposeCounter: 1, answerCounterCalls: 1 }));
  check('gate-attempted-no-link', c.gate === 'attempted-no-link' && /1 proposeLink/.test(c.missing[0]), JSON.stringify(c));
  // 9. Link formed then broke before the Dawn.
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 1, everLinks: 1, activeLinks: 0, firstLinkDay: 30 }));
  check('gate-link-broken', c.gate === 'link-broken' && /30/.test(c.missing[0]), JSON.stringify(c));
  // 10. Link young: 10 days old, 11 to the Dawn.
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 1, everLinks: 1, activeLinks: 1, oldestActiveAge: 10, oldestActiveId: 'link_9', regionalPending: true }));
  check('gate-link-young', c.gate === 'link-young' && /11d to the Dawn/.test(c.missing[0]), JSON.stringify(c));
  // 11. Seasoned bond, no Dawn, no pending — the checkRegional failure shape.
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 1, everLinks: 1, activeLinks: 1, oldestActiveAge: 25, regionalPending: false }));
  check('gate-seasoned-no-dawn', c.gate === 'seasoned-no-dawn' && /NO _regionalPending/.test(c.missing[0]), JSON.stringify(c));
  // 12. Seasoned bond, Dawn pending — the normal waiting shape.
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 1, everLinks: 1, activeLinks: 1, oldestActiveAge: 30, regionalPending: true }));
  check('gate-seasoned-pending', c.gate === 'seasoned-no-dawn' && /Dawn pending/.test(c.missing[0]), JSON.stringify(c));
  // 13. Empty row -> no-known-village, never throws.
  c = classifyGate({});
  check('gate-empty-row', c.gate === 'no-known-village', JSON.stringify(c));
  // 14. Best det exactly at the counter edge (25 + 10 = 35) -> attempt gate, not courtship.
  c = classifyGate(Object.assign({}, base, { bestDet: 25 }));
  check('gate-counter-edge', c.gate === 'courtship-no-attempt', JSON.stringify(c));
  // 15. A raise accepted counts as an attempt even with 0 proposeLink calls.
  c = classifyGate(Object.assign({}, base, { bestDet: 40, proposeCalls: 0, acceptLinkRaiseCalls: 1 }));
  check('gate-raise-is-attempt', c.gate === 'attempted-no-link', JSON.stringify(c));
})();

// ---------- detJudge fixture ----------
// rep standing 40 -> +20; opinion 12 -> +6; ourS 100 vs theirS 80 ->
// stronger by 20 -> +4; not allied. prim = 38+20+6+4 = 68.
// sub = 38+20+6+10+8 (opinion >= 5, tribute 4000) = 82.
(function () {
  const fg = {
    representative: function () { return { id: 'scholar', standing: 40 }; },
    isAllied: function () { return false; },
    regionalStanding: function () { return 100; },
    villageStandingOf: function () { return 80; },
  };
  const dj = detJudge(fg, { id: 'thornfield', opinion: 12 });
  check('detjudge-values', dj && dj.prim === 68 && dj.sub === 82, JSON.stringify(dj));
  const dj2 = detJudge(fg, { id: 'stonebridge', opinion: -30 });
  // prim = 38+20-15-10 = 33 (weaker? ourS 100 > theirS 80 still -> +4): 38+20-15+4 = 47.
  check('detjudge-negative-opinion', dj2 && dj2.prim === 47 && dj2.sub === 53, JSON.stringify(dj2));
  const dj3 = detJudge({}, { id: 'x', opinion: 0 });
  check('detjudge-unreadable-inputs', dj3 && dj3.prim === 28 && dj3.sub === 48, JSON.stringify(dj3));
})();

// ---------- fake-Game wrap + snapshot test ----------
// The fake mimics the engine contract the stageally + sitstep +
// regionalstep instruments read: combat hooks, standing reads, table
// reads, hierarchy reads, diplomacy verbs.
(function () {
  const fg = {
    data: { monsters: [{ id: 'w4a', wave: 4 }], villagers: [{ id: 'scholar', dead: false }, { id: 'bob', dead: false }] },
    state: { scholar: { day: 100, prog: { feastSurgeUsed: true } },
      village: { roster: ['scholar', 'bob'], trust: { bob: 30 }, party: ['bob'], fallen: [], linkRaises: {}, linkRaiseState: {} },
      waveKillLog: [{ by: 'scholar', w: 4, d: 90 }, { by: 'bob', w: 4, d: 95 }],
      otherVillages: [
        { id: 'thornfield', name: 'Thornfield', opinion: 12, _codexOpinionGiven: true, courtshipDeclined: 0, generated: true },
        { id: 'stonebridge', name: 'Stonebridge', opinion: -5, generated: true },
      ],
      networkLive: false, networkLiveDay: null, _regionalPending: null, pendingAccord: null, accordUnanswered: false, pendingCounter: null, scaleRefused: false },
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
    villageStanding: function () { return { total: 290, war: 200, diplomacy: 0, plenty: 90, links: 0, feasts: 3 }; },
    villageStandingTotal: function () { return 290; },
    waveCombatReadiness: function () { return { wave: 5, ready: true, armored: 2, armed: 2, tricks: 2, veterans: 2, demand: { armored: 2, armed: 2, tricks: 2, veterans: 2 }, short: [] }; },
    waveEngaged: function () { return 1; },
    deedState: function () { return { wavesFaced: {} }; },
    scaleRank: function () { return 'village'; },
    unlockedWave: function () { return 5; },
    getPerson: function (vid) { return { id: vid, dead: false }; },
    progState: function () { return { arc: 4, tableWaiting: true, tableAnnounced: true, tableDone: false, sentimentTaught: true }; },
    tableSeat: function () { return { seat: 'lesser', detail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'village', stage: 2, foodDeeds: true } }; },
    deedGateReady: function () { return { ok: false, w1: 4, w2: 4, w3: 3, w4: 1, w5: 0, contestsN: 2, crisesN: 2, rank: 'village', stage: 2, foodDeeds: true }; },
    tablePreview: function () { return { seat: 'lesser', doors: ['the Feared'], ready: true, why: '', overtime: 0, fullReady: false }; },
    tableEntryBlock: function () { return ''; },
    winDayFloorOk: function () { return true; },
    tableSeatTakerOptions: function () { return [{ id: 'self', name: 'Bearer', self: true, score: null }, { id: 'bob', name: 'Bob', self: false, score: 12 }]; },
    fullSeatShortfall: function () { return { ready: false, missing: ['only 1 of 3 different wave-4 monsters faced'], line: 'x' }; },
    tableTakeSeat: function () { return { ok: true, msg: '' }; },
    tableOfferSeatTaker: function () { return { ok: true, choosingSeat: true, msg: '' }; },
    tableChooseSeatTaker: function () { return { ok: true, msg: '' }; },
    chooseTableOption: function () { return { ok: true }; },
    hierarchyState: function () { return [{ id: 'link_1', primary: 'haven', subordinate: 'thornfield', status: 'active', day: 80, trust: 35, tributeKcalPerWeek: 4000, arrears: 0, conquered: false }]; },
    linkWith: function (id) { return id === 'thornfield' ? fg.hierarchyState()[0] : null; },
    representative: function () { return { id: 'scholar', standing: 40 }; },
    regionalStanding: function () { return 100; },
    villageStandingOf: function () { return 80; },
    isAllied: function () { return false; },
    knowsVillage: function (v) { return v && v.id === 'thornfield'; },
    villageLoreOf: function () { return { thornfield: true }; },
    vgoalWeights: function () { return { build_standing: 2 }; },
    proposeLink: function (id) { return id === 'thornfield' ? { id: 'link_1' } : null; },
    answerCounter: function () { return 'counter'; },
    answerAccord: function () { return true; },
    acceptLinkRaise: function () { return { ok: true, villageId: 'thornfield' }; },
    declineLinkRaise: function () { return { ok: false }; },
    proposeCovenant: function () { return null; },
    proposeTrade: function () { return null; },
    raidVillage: function () { return null; },
    talkTo: function () { return true; },
  };
  const inst = INST.install(fg);
  const snap = inst.snapshot();
  check('fake-regional-fields', snap.scale === 'village' && snap.networkLive === false &&
    snap.activeLinks === 1 && snap.oldestActiveAge === 20 && snap.daysToDawn === 1 &&
    snap.knownCount === 1 && snap.bestDet === 82 && snap.bestOffer === 'sub' &&
    snap.bestVillageId === 'thornfield' && snap.gate === 'link-young' &&
    snap.standingBreakdown && snap.standingBreakdown.diplomacy === 0 &&
    snap.standingBreakdown.total === 290 && snap.raiseEligible === 1 &&
    snap.villages.length === 2 && snap.villages[0].detSub === 82,
    JSON.stringify({ scale: snap.scale, active: snap.activeLinks, age: snap.oldestActiveAge, dawn: snap.daysToDawn, known: snap.knownCount, best: snap.bestDet, gate: snap.gate, elig: snap.raiseEligible }));
  const r1 = fg.proposeLink('thornfield');
  const r2 = fg.answerCounter('accept');
  const r3 = fg.answerAccord('gift');
  const r4 = fg.acceptLinkRaise('bob');
  const r5 = fg.talkTo('bob');
  check('fake-diplo-wraps-count-and-pass-through', r1 && r1.id === 'link_1' && r2 === 'counter' && r3 === true &&
    r4 && r4.ok === true && r5 === true && inst.t.regionalAttempts.length === 4 &&
    inst.t.regionalAttempts[0].call === 'proposeLink' && inst.t.regionalAttempts[0].result === 'link:link_1' &&
    inst.t.regionalAttempts[1].call === 'answerCounter' &&
    inst.t.talkCalls.length === 1 && inst.t.talkCalls[0].vid === 'bob',
    JSON.stringify(inst.t.regionalAttempts));
  const snap2 = inst.snapshot();
  check('fake-counters-on-resnapshot', snap2.proposeCalls === 1 && snap2.proposeFormed === 1 &&
    snap2.answerCounterCalls === 1 && snap2.answerAccordCalls === 1 && snap2.acceptLinkRaiseCalls === 1,
    JSON.stringify({ p: snap2.proposeCalls, f: snap2.proposeFormed, ac: snap2.answerCounterCalls, aa: snap2.answerAccordCalls, al: snap2.acceptLinkRaiseCalls }));
  const fin = inst.finalize();
  check('fake-finalize', fin.regionalAttempts && fin.regionalAttempts.length === 4 && fin.firstLinkDay === 80,
    JSON.stringify({ n: (fin.regionalAttempts || []).length, firstLink: fin.firstLinkDay }));
  inst.uninstall();
  check('fake-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  check('fake-uninstall-restores', typeof fg.proposeLink === 'function' && fg.proposeLink('thornfield').id === 'link_1' &&
    inst.t.regionalAttempts.length === 4, 'wrap not removed or call leaked');
})();

// ---------- live leg: 53006 staged, 150d ----------
// The recorder must run, every daily row must carry a gate, the
// sitstep-r2 headline numbers must reproduce on this master (51 pair
// days, standing 415, 8 wave-4+ kills, wave 5), and instrument errors
// must be 0. This leg writes nothing into the repo.
async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const STAGEDMOD = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
  const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));

  const { Game } = await loadGame({ seed: 53006, mode: 'competent-regionalstep-proof', fullTelemetry: false });
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
  const gatedRows = daily.filter(function (d) { return d.gate != null; }).length;
  const w4kills = (fin.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const netLiveDays = daily.filter(function (d) { return d.networkLive; }).length;
  const proposeCalls = (daily[daily.length - 1] || {}).proposeCalls | 0;
  check('live-53006-runs', result && result.days === 150 && daily.length >= 140 &&
    inst.t.instrumentErrors.length === 0,
    'days=' + (result && result.days) + ' snaps=' + daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));
  check('live-53006-determinism', pairDays === 51 && (fin.standing | 0) === 415 &&
    (fin.unlockedWave | 0) === 5 && w4kills === 8,
    'pairDays=' + pairDays + ' standing=' + fin.standing + ' unlocked=' + fin.unlockedWave +
    ' w4kills=' + w4kills);
  check('live-53006-all-rows-gated', gatedRows === daily.length,
    'gated=' + gatedRows + '/' + daily.length);
  check('live-53006-regional-state', netLiveDays === 0 && proposeCalls === 0,
    'netLiveDays=' + netLiveDays + ' proposeCalls=' + proposeCalls);
  check('live-53006-final-seat', fin.finalSeat && typeof fin.finalSeat.seat === 'string',
    JSON.stringify(fin.finalSeat));

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
