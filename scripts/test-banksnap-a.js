#!/usr/bin/env node
// test-banksnap-a.js — proof for the sim-banksnap-a instrument fix
// (every-upkeep snapshot) and the 14-event re-judgment. Hand-built
// fixtures; no sims, no repo reads (summarizeDir is exercised on temp
// dirs under /tmp only). Run: node scripts/test-banksnap-a.js
// Proof bar (prereg): this file green AND test-bankadded-probe-a.js
// still 58/58 green BEFORE any judged re-run.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
process.env.BANKFOOD = '1';
const { withBankfood, newStore: newBfStore } = require('./policies/bankfood-diag');
const { buildProbeEvents, preSnapshotWindow, rejudgeEvent, summarizeDir,
  EAT_TRIGGER_KCAL, ENDDAY_BURN_KCAL } = require('./analyze-bankadded-probe');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name); }
}

function pack(stacks, edible) {
  return { edibleKcal: edible, grossKcal: edible, lumpUnits: 0, stacks };
}
const grapes = (units, spoil) => ({ name: 'Muscadine Grapes', units, kcalEach: 40, edible: true, foodState: 'raw', spoilDay: spoil });
const emptyPack = pack([], 0);
const fullPack = pack([grapes(18, 12)], 720);
const snap = (o) => Object.assign({ scholarDay: 10, upkeepIndex: 1, afterDailyCalls: 10,
  kcal: 100, dayTicks: 0, pack: fullPack }, o);

// ---- every-upkeep snapshot: the wrapper records one snap per upkeep
// call, taken BEFORE inner.upkeep (so before that call's eat) ----
{
  const store = newBfStore();
  let eats = 0;
  const inner = { upkeep(Game) {
    const inv = Game.state.scholar.inventory;
    let gained = 0;
    for (const it of inv) if (it.edible && (it.kcalEach || 0) > 0) { gained += (it.kcalEach || 0) * (it.units || 1); it.units = 0; }
    Game.state.scholar.kcal += gained; eats++;
  }, daily() {} };
  const policy = withBankfood(inner, store);
  const Game = { state: { scholar: { day: 10, dayTicks: 400, kcal: 100, inventory: [grapes(18, 12)] } } };
  policy.upkeep(Game, {});
  check('snap 1 taken before the eat (pack still full)', store.upkeepSnaps.length === 1 && store.upkeepSnaps[0].pack.edibleKcal === 720);
  check('inner upkeep eat ran after the snap', eats === 1 && Game.state.scholar.kcal === 820);
  check('first-upkeep fired on day 10', store.firstUpkeeps.length === 1 && store.firstUpkeeps[0].scholarDay === 10);
  policy.upkeep(Game, {});
  check('snap 2 shows the eaten pack', store.upkeepSnaps.length === 2 && store.upkeepSnaps[1].pack.edibleKcal === 0);
  check('no second first-upkeep on the same day', store.firstUpkeeps.length === 1);
  Game.state.scholar.day = 11; Game.state.scholar.dayTicks = 0;
  policy.upkeep(Game, {});
  check('every upkeep snapped (3 calls, 3 snaps)', store.upkeepSnaps.length === 3);
  check('upkeepIndex is consecutive', store.upkeepSnaps.map((s) => s.upkeepIndex).join(',') === '1,2,3');
  check('first-upkeep fired on the new day', store.firstUpkeeps.length === 2 && store.firstUpkeeps[1].scholarDay === 11);
  check('snap and first-upkeep agree on the new day', store.upkeepSnaps[2].pack.edibleKcal === store.firstUpkeeps[1].pack.edibleKcal);
}
{
  // BANKFOOD=0 delegates untouched: no snaps, inner still runs.
  process.env.BANKFOOD = '0';
  const store = newBfStore();
  let ran = 0;
  const policy = withBankfood({ upkeep() { ran++; }, daily() {} }, store);
  policy.upkeep({ state: { scholar: { day: 10, dayTicks: 0, kcal: 0, inventory: [] } } }, {});
  check('OFF leg records no snaps', store.upkeepSnaps.length === 0 && store.firstUpkeeps.length === 0);
  check('OFF leg still delegates to inner', ran === 1);
  process.env.BANKFOOD = '1';
}

check('eat trigger constant is 2040', EAT_TRIGGER_KCAL === 2040);
check('end-day burn constant is 2200', ENDDAY_BURN_KCAL === 2200);

// ---- fixture instances (staged events, loopDay 10, gameDay 10) ----
function morningRec(loopDay, opts) {
  return Object.assign({ loopDay, ate: false, eatErr: null, skip: null,
    kcalBefore: 0, kcalAfterEat: 0,
    packBefore: { edibleKcal: 0, grossKcal: 0, lumpUnits: 0 },
    packAfter: { edibleKcal: 0, grossKcal: 0, lumpUnits: 0 },
    wakeTile: 'forest_floor,1,4' }, opts || {});
}
function baseInst() {
  return {
    seed: 17059, daysAlive: 60, endReason: 'survived',
    bankfoodStore: { mornings: [morningRec(11)], evenings: [], firstUpkeeps: [], errs: 0, errors: [] },
    bankaddedProbeStore: { evenings: [
      { loopDay: 10, gameDay: 10, mode: 'bank-probe', kind: 'staged', staged: true, genuine: false,
        genuineDelta: null, underlyingMode: 'skip', underlyingAdded: false,
        ntOutcome: 'travel-refused',
        clockBefore: 300, clockAfter: 449, rests: 2, restErr: null,
        pressRecords: [], pressDelta: 0, pressEknown: 0, dayRolled: false,
        advancerStop: null, via: 'advance-to-band',
        probeAddedKcal: 720, probeUnits: 18, probeSpoilDay: 12, skip: null,
        packBefore: emptyPack, packAfter: fullPack, kcalAfter: 655 },
    ], errs: 0, errors: [] },
    firstUpkeeps: [{ scholarDay: 11, kcal: 0, dayTicks: 0, pack: emptyPack }],
    upkeepSnaps: [],
    evenings: [
      { loopDay: 10, gameDay: 10, postDailyPack: fullPack,
        bankfoodEvening: { mode: 'skip', packBefore: emptyPack, packAfter: emptyPack, actions: [] },
        bankfoodMorning: null },
      { loopDay: 11, gameDay: 11, postDailyPack: emptyPack,
        bankfoodEvening: null, bankfoodMorning: morningRec(11) },
    ],
  };
}
// Instance A: VANISHED under the old snapshot, eaten at the p=0 upkeep
// of loop-day 11 (drop across the roll: snapPre day 10 -> snapPost day 11).
function vanishedInst() {
  const inst = baseInst();
  inst.upkeepSnaps = [
    snap({ scholarDay: 10, upkeepIndex: 31, afterDailyCalls: 10, kcal: 655, dayTicks: 456, pack: fullPack }),
    snap({ scholarDay: 11, upkeepIndex: 32, afterDailyCalls: 10, kcal: 0, dayTicks: 0, pack: emptyPack }),
  ];
  return inst;
}
// Instance A2: same shape, drop BEFORE the roll (p=1 snap still day 10,
// empty — the eat happened at p=0's inner.upkeep; the roll came later).
function vanishedEarlyInst() {
  const inst = baseInst();
  inst.seed = 17064;
  inst.upkeepSnaps = [
    snap({ scholarDay: 10, upkeepIndex: 31, afterDailyCalls: 10, kcal: 155, dayTicks: 456, pack: fullPack }),
    snap({ scholarDay: 10, upkeepIndex: 32, afterDailyCalls: 10, kcal: 875, dayTicks: 480, pack: emptyPack }),
    snap({ scholarDay: 11, upkeepIndex: 33, afterDailyCalls: 10, kcal: 0, dayTicks: 0, pack: emptyPack }),
  ];
  return inst;
}
// Instance B: RETAINED under the old snapshot; snaps must agree.
function retainedInst() {
  const inst = baseInst();
  inst.seed = 17025;
  inst.bankaddedProbeStore.evenings[0].kcalAfter = 2230;
  inst.firstUpkeeps = [{ scholarDay: 11, kcal: 2090, dayTicks: 0, pack: fullPack }];
  inst.evenings[1].postDailyPack = fullPack;
  inst.bankfoodStore.mornings = [morningRec(11, { kcalBefore: 2090, kcalAfterEat: 2400,
    packBefore: { edibleKcal: 720, grossKcal: 720, lumpUnits: 0 },
    packAfter: { edibleKcal: 400, grossKcal: 400, lumpUnits: 0 } })];
  inst.evenings[1].bankfoodMorning = inst.bankfoodStore.mornings[0];
  inst.upkeepSnaps = [
    snap({ scholarDay: 10, upkeepIndex: 31, afterDailyCalls: 10, kcal: 2230, dayTicks: 456, pack: fullPack }),
    snap({ scholarDay: 11, upkeepIndex: 32, afterDailyCalls: 10, kcal: 2090, dayTicks: 0, pack: fullPack }),
  ];
  return inst;
}
// Instance C: sleep-path VANISHED — the day had already rolled before
// loop-day 11's first upkeep, so the old snapshot was already pre-eat
// and the vanish is real, not a timing artifact.
function sleepPathInst() {
  const inst = vanishedInst();
  inst.seed = 17060;
  inst.upkeepSnaps = [
    snap({ scholarDay: 11, upkeepIndex: 31, afterDailyCalls: 10, kcal: 0, dayTicks: 0, pack: emptyPack }),
  ];
  return inst;
}
// Instance D: roll-after-daily VANISHED — old-day snaps exist but no
// new-day snap in the loop-day p-loop; the window includes daily
// actions, so the drop is not attributable to the upkeep eat.
function rollAfterDailyInst() {
  const inst = vanishedInst();
  inst.seed = 17073;
  inst.upkeepSnaps = [
    snap({ scholarDay: 10, upkeepIndex: 31, afterDailyCalls: 10, kcal: 1328, dayTicks: 456, pack: fullPack }),
    snap({ scholarDay: 10, upkeepIndex: 32, afterDailyCalls: 10, kcal: 1328, dayTicks: 480, pack: fullPack }),
    snap({ scholarDay: 10, upkeepIndex: 33, afterDailyCalls: 10, kcal: 1328, dayTicks: 500, pack: fullPack }),
  ];
  return inst;
}

// ---- preSnapshotWindow on the fixtures ----
{
  const evA = buildProbeEvents(vanishedInst())[0];
  check('A is VANISHED under the old snapshot', evA.verdict === 'VANISHED');
  const w = evA.preSnapshot;
  check('A window is the refused path', w.path === 'refused-path');
  check('A E1: food present before the eating call', w.e1 === true && w.injectedPre === 18 && w.injectedEat === 18);
  check('A E2: food gone at the new-day snapshot', w.e2 === true && w.injectedPost === 0);
  check('A E3: drop localizes to one step across the roll', w.e3 === true && w.dropAtSnapshot === true);
  check('A E4: eat trigger fired (655 < 2040)', w.e4 === true && w.triggerFired === true);
  check('A E5: spoil cannot explain it (spoilDay 12 > day 11)', w.e5 === true && w.spoilImmune === true);
  check('A residual quoted (0 - (655 + 720 - 2200) = 825)', w.residualKcal === 825);
  check('A re-judged RETAINED-THEN-EATEN', evA.rejudgedVerdict === 'RETAINED-THEN-EATEN' && evA.retainedFinal === true);
}
{
  const evA2 = buildProbeEvents(vanishedEarlyInst())[0];
  check('A2 is VANISHED under the old snapshot', evA2.verdict === 'VANISHED');
  check('A2 drop-before-roll also re-judges RETAINED-THEN-EATEN',
    evA2.rejudgedVerdict === 'RETAINED-THEN-EATEN' && evA2.preSnapshot.dropBeforeRoll === true);
  check('A2 eating call is p=0 (kcal 155)', evA2.preSnapshot.kcalEat === 155);
  check('A2 residual quoted (0 - (155 + 720 - 2200) = 1325)', evA2.preSnapshot.residualKcal === 1325);
}
{
  const evB = buildProbeEvents(retainedInst())[0];
  check('B is RETAINED under the old snapshot', evB.verdict === 'RETAINED');
  check('B re-judgment agrees (snaps show 18 at snapPre and snapPost)',
    evB.rejudgedVerdict === 'RETAINED' && evB.preSnapshot.injectedPre === 18 && evB.preSnapshot.injectedPost === 18);
  check('B carries no kcal residual (food eaten after the snapshot)', evB.preSnapshot.residualKcal === null);
}
{
  // Retained event whose snaps disagree: food already gone at snapPre.
  const inst = retainedInst();
  inst.upkeepSnaps[0] = snap({ scholarDay: 10, upkeepIndex: 31, afterDailyCalls: 10, kcal: 2230, dayTicks: 456, pack: emptyPack });
  const ev = buildProbeEvents(inst)[0];
  check('retained-with-missing-pre-snap reads DISAGREED', ev.rejudgedVerdict === 'DISAGREED' && ev.retainedFinal === false);
}
{
  // Trigger not fired: hungry-looking vanish at kcal 2200 stays VANISHED.
  const inst = vanishedInst();
  inst.upkeepSnaps[0] = snap({ scholarDay: 10, upkeepIndex: 31, afterDailyCalls: 10, kcal: 2200, dayTicks: 456, pack: fullPack });
  const ev = buildProbeEvents(inst)[0];
  check('no-trigger vanish stays VANISHED', ev.rejudgedVerdict === 'VANISHED' && ev.preSnapshot.e4 === false);
}
{
  // Partial drop: the eat stopped halfway (10 of 18 left) — not explained.
  const inst = vanishedInst();
  inst.upkeepSnaps[1] = snap({ scholarDay: 11, upkeepIndex: 32, afterDailyCalls: 10, kcal: 0, dayTicks: 0,
    pack: pack([grapes(10, 12)], 400) });
  inst.firstUpkeeps[0].pack = pack([grapes(10, 12)], 400);
  const ev = buildProbeEvents(inst)[0];
  check('partial drop stays PARTIAL-UNEXPLAINED', ev.verdict === 'PARTIAL-UNEXPLAINED' && ev.rejudgedVerdict === 'PARTIAL-UNEXPLAINED');
}
{
  const evC = buildProbeEvents(sleepPathInst())[0];
  check('sleep-path vanish keeps the old verdict', evC.verdict === 'VANISHED' && evC.rejudgedVerdict === 'VANISHED');
  check('sleep-path window is named', evC.preSnapshot.path === 'sleep-path');
}
{
  const evD = buildProbeEvents(rollAfterDailyInst())[0];
  check('roll-after-daily vanish keeps the old verdict', evD.verdict === 'VANISHED' && evD.rejudgedVerdict === 'VANISHED');
  check('roll-after-daily window is named', evD.preSnapshot.path === 'roll-after-daily');
}
{
  // Old corpus (no upkeep snaps): re-judgment falls back to the old verdict.
  const inst = vanishedInst();
  delete inst.upkeepSnaps;
  const ev = buildProbeEvents(inst)[0];
  check('no-snaps corpus falls back to the old verdict',
    ev.rejudgedVerdict === 'VANISHED' && ev.preSnapshot.available === false && ev.preSnapshot.reason === 'no-upkeep-snaps');
}
{
  // Genuine event: no injected identity; old verdict stands, snaps quoted.
  const inst = retainedInst();
  inst.seed = 17063;
  inst.bankaddedProbeStore.evenings = [
    { loopDay: 10, gameDay: 10, mode: 'bank-probe', staged: false, genuine: true,
      genuineDelta: 325, underlyingMode: 'bank', waits: 0, via: null,
      packBefore: emptyPack, packAfter: null, skip: 'genuine-bank-added' },
  ];
  inst.evenings[0].bankfoodEvening = { mode: 'bank',
    packBefore: emptyPack, packAfter: pack([grapes(9, 12)], 360),
    actions: [{ kind: 'forage', Eknown: 360, unknownUnits: 0 }] };
  inst.evenings[0].postDailyPack = pack([grapes(9, 12)], 360);
  inst.firstUpkeeps = [{ scholarDay: 11, kcal: 100, dayTicks: 0, pack: pack([grapes(9, 12)], 360) }];
  inst.upkeepSnaps = [
    snap({ scholarDay: 10, upkeepIndex: 31, afterDailyCalls: 10, kcal: 2240, dayTicks: 456, pack: pack([grapes(9, 12)], 360) }),
    snap({ scholarDay: 11, upkeepIndex: 32, afterDailyCalls: 10, kcal: 100, dayTicks: 0, pack: pack([grapes(9, 12)], 360) }),
  ];
  const ev = buildProbeEvents(inst)[0];
  check('genuine event is built + judged', ev && ev.kind === 'genuine' && ev.judged === true);
  check('genuine keeps the old RETAINED verdict', ev.rejudgedVerdict === 'RETAINED' && ev.retainedFinal === true);
  check('genuine snaps quote the food present at both ends', ev.preSnapshot.ediblePre === 360 && ev.preSnapshot.ediblePost === 360);
  check('genuine carries no kcal residual (no injected food)', ev.preSnapshot.residualKcal === null);
}

// ---- summarizeDir: before/after on identical events ----
function writeInst(dir, seed, inst) {
  fs.writeFileSync(path.join(dir, 'bankfood-b-nighttravel-s' + seed + '.json'), JSON.stringify(inst));
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'banksnap-test-'));
try {
  // 2 VANISHED->RTE + 1 RETAINED: old verdict NO-GO-NON-UNANIMOUS,
  // re-judgment GO-RETAINED — the before/after on identical events.
  const a1 = vanishedInst(); a1.seed = 17059;
  const a2 = vanishedEarlyInst(); a2.seed = 17064;
  // A2's loopDay must differ per seed for distinct counting; seeds differ so distinct is 3 anyway.
  const b = retainedInst(); b.seed = 17025;
  writeInst(tmp, 17059, a1);
  writeInst(tmp, 17064, a2);
  writeInst(tmp, 17025, b);
  const rep = summarizeDir(tmp);
  check('temp dir: 3 distinct judged', rep.totals.distinctJudged === 3);
  check('temp dir: old verdict still NO-GO-NON-UNANIMOUS', rep.totals.verdict === 'NO-GO-NON-UNANIMOUS');
  check('temp dir: old retained count is 1', rep.totals.retainedAtTrueMorning === 1);
  check('temp dir: re-judgment is GO-RETAINED', rep.totals.reVerdict === 'GO-RETAINED');
  check('temp dir: 2 retained-then-eaten', rep.totals.retainedThenEaten === 2);
  check('temp dir: 0 unexplained-vanished', rep.totals.unexplainedVanished === 0);
  check('temp dir: retainedFinal is 3', rep.totals.retainedFinal === 3);
  check('temp dir: zero instrument errors', rep.totals.probeErrs === 0 && rep.totals.bfErrs === 0);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'banksnap-test2-'));
try {
  // A sleep-path vanish among retained events: re-judgment stays NO-GO.
  writeInst(tmp2, 17059, vanishedInst());
  writeInst(tmp2, 17025, retainedInst());
  writeInst(tmp2, 17060, sleepPathInst());
  const rep2 = summarizeDir(tmp2);
  check('mixed dir: re-judgment is NO-GO-UNEXPLAINED', rep2.totals.reVerdict === 'NO-GO-UNEXPLAINED');
  check('mixed dir: 1 unexplained-vanished', rep2.totals.unexplainedVanished === 1);
  check('mixed dir: 1 retained-then-eaten', rep2.totals.retainedThenEaten === 1);
} finally { fs.rmSync(tmp2, { recursive: true, force: true }); }

console.log('test-banksnap-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
