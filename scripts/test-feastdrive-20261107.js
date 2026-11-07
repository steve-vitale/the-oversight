// test-feastdrive-20261107.js — proof for the feast-chain recorder,
// classifier, and driver (arm sim-feastdrive-b). Fixture tests for
// classifyFeastGate (every link in the feast chain + edge cases), a
// fake-Game test that the feast wraps count calls and pass results
// through (record-after-delegate, throwing origins still propagate),
// and a live leg: seed 53006 staged, 150d, asserting the recorder
// runs, every daily row carries a feast gate, and instrument errors
// are 0. The live leg asserts STRUCTURAL invariants only (per the
// prereg) — exact headline numbers are judged in the diag corpus,
// not pinned here. Exit non-zero on any failure. The live leg writes
// nothing into the repo.
// Usage: node scripts/test-feastdrive-20261107.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'feastdrive-instrument-20261107'));
const classifyFeastGate = INST.classifyFeastGate;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- classifyFeastGate fixtures ----------
(function () {
  const base = { spent: false, faced: 0, spends: 0, drivenOff: 0, draws: 0, grants: 0,
    feasts: 0, everArmed: false, arms: 0, resonance: 10, l3: 1, keepsakesReady: 1,
    buffLive: false, drawLive: false, reactorOnline: false };

  // 1. Spent -> spent, whatever the counters read.
  let c = classifyFeastGate(Object.assign({}, base, { spent: true, faced: 3 }));
  check('feastgate-spent', c.gate === 'spent' && c.missing.length === 0, JSON.stringify(c));
  // 2. Faced the draw, still unspent.
  c = classifyFeastGate(Object.assign({}, base, { faced: 1, draws: 1, grants: 1, feasts: 1, everArmed: true }));
  check('feastgate-faced-unspent', c.gate === 'faced-unspent' && /1 time/.test(c.missing[0]), JSON.stringify(c));
  // 3. Draws offered, all driven off, none faced.
  c = classifyFeastGate(Object.assign({}, base, { draws: 2, drivenOff: 2, grants: 1, feasts: 1, everArmed: true }));
  check('feastgate-driven-off', c.gate === 'draw-driven-off' && /2 draw/.test(c.missing[0]), JSON.stringify(c));
  // 4. Draw offered, never faced, never driven off — buff died first.
  c = classifyFeastGate(Object.assign({}, base, { draws: 1, grants: 1, feasts: 1, everArmed: true }));
  check('feastgate-draw-unfaced', c.gate === 'draw-unfaced' && /buff died/.test(c.missing[0]), JSON.stringify(c));
  // 5. Armed grant(s), no draw at all.
  c = classifyFeastGate(Object.assign({}, base, { grants: 2, granted: 2, feasts: 1, everArmed: true }));
  check('feastgate-grant-no-draw', c.gate === 'grant-no-draw' && /2 armed grant/.test(c.missing[0]), JSON.stringify(c));
  // 5b. Grant CALLED but refused (reactor) — grant-refused, not grant-no-draw.
  c = classifyFeastGate(Object.assign({}, base, { grants: 4, granted: 0, feasts: 4, everArmed: true, reactorOnline: true }));
  check('feastgate-grant-refused', c.gate === 'grant-refused' && /4 grant call/.test(c.missing[0]) && /reactor online/.test(c.missing[0]), JSON.stringify(c));
  // 5c. One granted + one refused, still no draw — the granted one rules.
  c = classifyFeastGate(Object.assign({}, base, { grants: 2, granted: 1, feasts: 2, everArmed: true }));
  check('feastgate-grant-mixed', c.gate === 'grant-no-draw', JSON.stringify(c));
  // 6. Feasts hosted, none granted — unarmed feasts.
  c = classifyFeastGate(Object.assign({}, base, { feasts: 3, everArmed: false, resonance: 12, l3: 1 }));
  check('feastgate-feast-ungranted', c.gate === 'feast-ungranted' && /3 feast/.test(c.missing[0]), JSON.stringify(c));
  // 7. Same, but the reactor is online — the refusal is named.
  c = classifyFeastGate(Object.assign({}, base, { feasts: 1, reactorOnline: true }));
  check('feastgate-feast-ungranted-reactor', c.gate === 'feast-ungranted' && /reactor online/.test(c.missing[0]), JSON.stringify(c));
  // 8. Armed but never feasted.
  c = classifyFeastGate(Object.assign({}, base, { everArmed: true, arms: 2 }));
  check('feastgate-armed-no-feast', c.gate === 'armed-no-feast' && /2 time/.test(c.missing[0]), JSON.stringify(c));
  // 9. Never armed: resonance + L3 shortfall named.
  c = classifyFeastGate(Object.assign({}, base, { resonance: 7, l3: 0 }));
  check('feastgate-never-armed', c.gate === 'never-armed' && /7\/35/.test(c.missing[0]) && /0\/3/.test(c.missing[0]), JSON.stringify(c));
  // 10. Never armed and no keepsake ready — named too.
  c = classifyFeastGate(Object.assign({}, base, { resonance: 0, l3: 0, keepsakesReady: 0 }));
  check('feastgate-never-armed-no-keepsake', c.gate === 'never-armed' && /no keepsake/.test(c.missing[0]), JSON.stringify(c));
  // 11. Empty row -> never-armed, never throws.
  c = classifyFeastGate({});
  check('feastgate-empty-row', c.gate === 'never-armed', JSON.stringify(c));
  // 12. A spend event without the flag is still faced-unspent, not spent
  // (the flag is the deed; the counter alone is not).
  c = classifyFeastGate(Object.assign({}, base, { spends: 1, faced: 1 }));
  check('feastgate-spend-counter-not-flag', c.gate === 'faced-unspent', JSON.stringify(c));
})();

// ---------- fake-Game wrap + snapshot test ----------
// The fake mimics the engine contract the stageally + sitstep +
// regionalstep + feastdrive instruments read. Feast methods behave
// minimally like the engine (arm on channel, grant on feast,
// draw/face/spend move the deed) so the wrap pre/post reads are real.
(function () {
  const fg = {
    data: { monsters: [{ id: 'w4a', wave: 4 }], villagers: [{ id: 'scholar', dead: false }, { id: 'bob', dead: false }] },
    state: { scholar: { day: 100, prog: { feastSurgeUsed: false, sentimentTaught: true, surgeResonance: 40, feastSurge: false },
        abilities: [{ id: 'rage', level: 3 }, { id: 'bird_strike', level: 3 }, { id: 'turncoat', level: 2 }],
        backgroundAbilities: [], inventory: [{ itemId: 'tin_cup', id: 'tin_cup', sentimental: true, name: "Grandma's Tin Cup" }],
        equipped: {}, trauma: 0, feastDay: null, health: 100, kcal: 5000, feastBuff: null, feastDraw: null },
      village: { roster: ['scholar', 'bob'], trust: { bob: 30 }, party: ['bob'], fallen: [], linkRaises: {}, linkRaiseState: {},
        pantry: [{ itemId: 'beans', kcalEach: 500, units: 20 }] },
      waveKillLog: [{ by: 'scholar', w: 4, d: 90 }, { by: 'bob', w: 4, d: 95 }],
      otherVillages: [
        { id: 'thornfield', name: 'Thornfield', opinion: 12, _codexOpinionGiven: true, courtshipDeclined: 0, generated: true },
        { id: 'stonebridge', name: 'Stonebridge', opinion: -5, generated: true },
      ],
      networkLive: false, networkLiveDay: null, _regionalPending: null, pendingAccord: null, accordUnanswered: false, pendingCounter: null, scaleRefused: false },
    villagerId: 'scholar',
    dayPart: 2,
    tbfight: null,
    pendingEncounter: false, pendingMonsterId: null,
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
    tableSeat: function () { return { seat: 'lesser', detail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'village', stage: 2, foodDeeds: false } }; },
    deedGateReady: function () { return { ok: false, w1: 4, w2: 4, w3: 3, w4: 1, w5: 0, contestsN: 2, crisesN: 2, rank: 'village', stage: 2, foodDeeds: false }; },
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
    // --- feast methods (minimal engine-like behavior) ---
    isKeepsake: function (it) { return !!(it && it.sentimental); },
    channelReadyKeepsakes: function () { return [0]; },
    channelSentiment: function (ref) { fg.state.scholar.prog.feastSurge = 1.5; return 'Channel (surge the feast)'; },
    teachSentiment: function () { fg.state.scholar.prog.sentimentTaught = true; return true; },
    sentimentTaught: function () { return !!fg.state.scholar.prog.sentimentTaught; },
    feastPlan: function () { return { ok: true, cost: 2000, have: 5000, why: '', armed: !!fg.state.scholar.prog.feastSurge }; },
    hostFeast: function () { fg.state.scholar.feastDay = fg.state.scholar.day; return { ok: true }; },
    grantFeastBuff: function () { fg.state.scholar.feastBuff = { day: 100, mult: 2.0, untilDay: 102, used: false }; return { granted: true, mult: 2.0, draw: 'w4a' }; },
    drawFeastScavenger: function () { fg.state.scholar.feastDraw = { monsterId: 'w4a', day: 100 }; fg.pendingEncounter = true; fg.pendingMonsterId = 'w4a'; return { drawn: true, monsterId: 'w4a' }; },
    faceFeastDraw: function () { return { ok: true, monsterId: 'w4a' }; },
    driveOffFeastDraw: function () { throw new Error('watch refuses (fixture)'); },
    fusionReactorOnline: function () { return false; },
    _spendFeastedPower: function (kind) { fg.state.scholar.prog.feastSurgeUsed = true; fg.state.scholar.prog.feastSurge = false; return true; },
  };
  const inst = INST.install(fg);
  const snap = inst.snapshot();
  check('fake-feast-fields', snap.keepsakesReady === 1 && snap.surgeResonance === 40 &&
    snap.l3Count === 2 && snap.armed === false && snap.buffLive === false &&
    snap.drawLive === false && snap.reactorOnline === false &&
    snap.feastPlan && snap.feastPlan.ok === true && snap.feastPlan.cost === 2000 &&
    snap.feastGate === 'never-armed',
    JSON.stringify({ keeps: snap.keepsakesReady, res: snap.surgeResonance, l3: snap.l3Count, armed: snap.armed, buff: snap.buffLive, gate: snap.feastGate }));
  // Walk the whole chain through the wrapped methods.
  const ch = fg.channelSentiment(0);
  const te = fg.teachSentiment();
  const hf = fg.hostFeast();
  const gr = fg.grantFeastBuff({ quality: 1, surge: 1.5 });
  const dr = fg.drawFeastScavenger();
  const fa = fg.faceFeastDraw();
  let threw = null;
  try { fg.driveOffFeastDraw(); } catch (e) { threw = e; }
  const sp = fg._spendFeastedPower('combat');
  check('fake-feast-wraps-pass-through', ch === 'Channel (surge the feast)' && te === true &&
    hf && hf.ok === true && gr && gr.granted === true && dr && dr.drawn === true &&
    fa && fa.ok === true && threw && /watch refuses/.test(threw.message) && sp === true,
    JSON.stringify({ ch: ch, hf: hf, gr: gr, threw: threw && threw.message }));
  const snap2 = inst.snapshot();
  check('fake-feast-counters', snap2.channels === 1 && snap2.arms === 1 && snap2.feasts === 1 &&
    snap2.grants === 1 && snap2.granted === 1 && snap2.grantsRefused === 0 && snap2.draws === 1 && snap2.drawn === 1 && snap2.facedOk === 1 &&
    snap2.spends === 1 && snap2.markedSpends === 1 && snap2.spent === true &&
    snap2.buffLive === true && snap2.drawLive === true && snap2.feastGate === 'spent' &&
    snap2.firstArmDay === 100 && snap2.firstFeastDay === 100 && snap2.firstGrantDay === 100 &&
    snap2.firstDrawDay === 100 && snap2.firstSpendDay === 100,
    JSON.stringify({ ch: snap2.channels, arms: snap2.arms, feasts: snap2.feasts, grants: snap2.grants, draws: snap2.draws, faced: snap2.facedOk, spends: snap2.spends, spent: snap2.spent, gate: snap2.feastGate }));
  const fin = inst.finalize();
  check('fake-feast-finalize', fin.feastEvents && fin.feastEvents.channels.length === 1 &&
    fin.feastEvents.channels[0].armedNow === true &&
    fin.feastEvents.spends.length === 1 && fin.feastEvents.spends[0].marked === true &&
    fin.feastEvents.driveOffs.length === 1 && /watch refuses/.test(fin.feastEvents.driveOffs[0].threw || '') &&
    fin.endFeastGate === 'spent' && fin.firstSpendDay === 100,
    JSON.stringify({ n: (fin.feastEvents && fin.feastEvents.channels.length), end: fin.endFeastGate }));
  inst.uninstall();
  check('fake-feast-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  check('fake-feast-uninstall-restores', fg.channelSentiment(0) === 'Channel (surge the feast)' &&
    inst.t.feastEvents.channels.length === 1, 'wrap not removed or call leaked');
})();

// ---------- feastdrive policy fixtures ----------
(function () {
  const FD = require(path.join(REPO, 'scripts', 'policies', 'competent-feastdrive-b'));
  const fs = require('fs');
  // 1. The policy source never references the kill log.
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-feastdrive-b.js'), 'utf8');
  check('policy-no-killlog-ref', src.indexOf('waveKillLog') === -1, 'waveKillLog appears in the policy source');
  // 2. armed / buffLive helpers on raw state.
  const mk = function (prog, buff, day) {
    return { state: { scholar: { day: day, prog: prog, feastBuff: buff } } };
  };
  check('policy-armed', FD.armed(mk({ feastSurge: 1.5 }, null, 10)) === true &&
    FD.armed(mk({ feastSurge: false }, null, 10)) === false &&
    FD.armed(mk({}, null, 10)) === false, 'armed helper');
  check('policy-bufflive', FD.buffLive(mk({}, { untilDay: 12 }, 10)) === true &&
    FD.buffLive(mk({}, { untilDay: 10 }, 10)) === false &&
    FD.buffLive(mk({}, null, 10)) === false, 'buffLive helper (raw day < untilDay)');
  // 3. donateDownToKeep: donates identified surplus above the keep,
  // skips unknowns / unready food, honors the pantry-options cap.
  function fakeDonor(withOptions) {
    const fg = {
      villagerId: 'scholar',
      state: { scholar: { day: 20, kcal: 3000, inventory: [
        { itemId: 'beans', kcalEach: 500, units: 6, edible: true, safe: true },
        { itemId: 'unknown', kcalEach: 0, units: 3 },
        { itemId: 'meat', kcalEach: 800, units: 2, needsCooking: true },
        { itemId: 'sick', kcalEach: 400, units: 5, diseaseRisk: true },
      ] }, village: { gives: {} } },
      havenStoresAccess: function () { return 'open'; },
      isSpoiled: function () { return false; },
      pantryCapKcal: function () { return 100000; },
      pantryKcal: function () { return 10000; },
      donateToPantry: function (i, amount) {
        const it = fg.state.scholar.inventory[i];
        const kcal = it.kcalEach * amount;
        it.units -= amount;
        if (it.units <= 0) fg.state.scholar.inventory.splice(i, 1);
        const g = fg.state.village.gives;
        g[fg.villagerId] = (g[fg.villagerId] || 0) + kcal;
      },
    };
    if (withOptions) fg.pantryDonationOptions = function () { return { ok: true, maxUnits: 2 }; };
    return fg;
  }
  FD.resetFeastdriveStats();
  const fg1 = fakeDonor(false);
  // Add a second ready item: the no-options branch donates WHOLE items
  // only when the remainder still covers the keep (the base rule), so
  // roots (2000) go whole — remainder 3000 still covers 1200 — while
  // beans (3000) then stay: remainder 0 < 1200.
  fg1.state.scholar.inventory.splice(1, 0, { itemId: 'roots', kcalEach: 400, units: 5, edible: true, safe: true });
  const r1 = FD.donateDownToKeep(fg1, {}, 1200);
  check('policy-donate-down', r1.transferred === 1 && r1.kcal === 2000 &&
    (fg1.state.village.gives.scholar || 0) === 2000 &&
    fg1.state.scholar.inventory.find(function (it) { return it.itemId === 'roots'; }) === undefined &&
    fg1.state.scholar.inventory[0].units === 6,
    JSON.stringify(r1));
  FD.resetFeastdriveStats();
  const fg2 = fakeDonor(true);
  const r2 = FD.donateDownToKeep(fg2, {}, 1200);
  // options cap maxUnits 2 -> 2 units = 1000 kcal.
  check('policy-donate-options-cap', r2.transferred === 1 && r2.kcal === 1000,
    JSON.stringify(r2));
  FD.resetFeastdriveStats();
  const fg3 = fakeDonor(false);
  const r3 = FD.donateDownToKeep(fg3, {}, 5000);
  // keep above available -> nothing moves.
  check('policy-donate-keep-blocks', r3.transferred === 0 && r3.kcal === 0 &&
    (fg3.state.village.gives.scholar || 0) === 0, JSON.stringify(r3));
  // 4. No donate verb -> no-op, never throws.
  FD.resetFeastdriveStats();
  const fg4 = { villagerId: 'scholar', state: { scholar: { day: 20, inventory: [] }, village: { gives: {} } } };
  const r4 = FD.donateDownToKeep(fg4, {}, 1200);
  check('policy-donate-no-verb', r4.transferred === 0 && r4.kcal === 0, JSON.stringify(r4));
  // 5. Poisoned kill log cannot change the pure helpers (they never read it).
  const poisoned = mk({ feastSurge: 1.5 }, { untilDay: 12 }, 10);
  poisoned.state.waveKillLog = [{ by: 'scholar', w: 4, d: 1 }, { by: 'scholar', w: 4, d: 2 }];
  check('policy-poisoned-log-inert', FD.armed(poisoned) === true && FD.buffLive(poisoned) === true,
    'helpers read only scholar/prog state');
})();

// ---------- live leg: 53006 staged, 150d (structural only) ----------
async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const STAGEDMOD = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
  const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));

  const { Game } = await loadGame({ seed: 53006, mode: 'competent-feastdrive-proof', fullTelemetry: false });
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
  const gatedRows = daily.filter(function (d) { return d.feastGate != null; }).length;
  const lastRow = daily[daily.length - 1] || {};
  const knownGates = ['spent', 'faced-unspent', 'draw-driven-off', 'draw-unfaced', 'grant-no-draw', 'grant-refused', 'feast-ungranted', 'armed-no-feast', 'never-armed'];
  check('live-53006-runs', result && result.days === 150 && daily.length >= 140 &&
    inst.t.instrumentErrors.length === 0,
    'days=' + (result && result.days) + ' snaps=' + daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));
  check('live-53006-all-rows-feast-gated', gatedRows === daily.length,
    'gated=' + gatedRows + '/' + daily.length);
  check('live-53006-end-gate-known', knownGates.indexOf(fin.endFeastGate) !== -1 &&
    typeof lastRow.spent === 'boolean' && typeof lastRow.surgeResonance === 'number',
    'endGate=' + fin.endFeastGate + ' spent=' + lastRow.spent + ' resonance=' + lastRow.surgeResonance);
  check('live-53006-chain-counters-present', typeof lastRow.channels === 'number' &&
    typeof lastRow.feasts === 'number' && typeof lastRow.grants === 'number' &&
    typeof lastRow.draws === 'number' && typeof lastRow.drivenOff === 'number',
    JSON.stringify({ ch: lastRow.channels, feasts: lastRow.feasts, grants: lastRow.grants, draws: lastRow.draws, off: lastRow.drivenOff }));

  // ---------- live armed leg: 53006 feastdrive, 150d, via the driver ----------
  // The drive must fire on the pair seed (donate-down days > 0 and at
  // least one feast + one grant through either host) with zero
  // instrument errors. The base eveningFeast hosts first whenever the
  // gate is met, so the drive's own feast step is a backstop and its
  // feastAttempts may be 0 — the instrument's feast/grant counts (not
  // the step's) are the drive's effect. Writes only to /tmp — never
  // into the repo.
  const cp = require('child_process');
  const tmpDir = '/tmp/feastdrive-proof-armed';
  try { cp.execSync('rm -rf ' + tmpDir); } catch (e) {}
  const env = Object.assign({}, process.env, { DAYS: '150', SEEDS: '53006', RUN: 'feastdrive-proof-armed', POLICY: 'feastdrive', OUTDIR: tmpDir });
  try {
    cp.execSync('node scripts/feastdrive-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
  } catch (e) {
    check('live-armed-53006-runs', false, 'driver failed: ' + String((e && e.stdout) || (e && e.message) || e).slice(0, 400));
  }
  try {
    const armed = JSON.parse(require('fs').readFileSync(tmpDir + '/feastdrive-s53006-feastdrive-proof-armed.json', 'utf8'));
    const aLast = (armed.daily || [])[(armed.daily || []).length - 1] || {};
    const fds = armed.feastdriveStats || {};
    check('live-armed-53006-runs', armed.days > 0 && (armed.daily || []).length >= 100 && (armed.instrumentErrors || []).length === 0,
      'days=' + armed.days + ' snaps=' + (armed.daily || []).length + ' errs=' + JSON.stringify(armed.instrumentErrors));
    check('live-armed-53006-drive-fires', (fds.donateDownDays | 0) >= 1 && (aLast.feasts | 0) >= 1 && (aLast.grants | 0) >= 1,
      JSON.stringify({ donateDownDays: fds.donateDownDays, donatedKcal: fds.donatedKcal, feasts: aLast.feasts, grants: aLast.grants, feastAttempts: fds.feastAttempts, feastsHosted: fds.feastsHosted, skips: fds.feastSkips }));
    check('live-armed-53006-determinism-guard', typeof aLast.spent === 'boolean' && typeof aLast.surgeResonance === 'number',
      'spent=' + aLast.spent + ' resonance=' + aLast.surgeResonance);
  } catch (e) {
    check('live-armed-53006-reads', false, 'armed corpus unreadable: ' + String((e && e.message) || e).slice(0, 200));
  }

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
