#!/usr/bin/env node
// test-bankadded-probe-a.js — pure tests for the probe-given-food
// instrument (sim-bankadded-substrate-a prereg). Hand-built fixtures;
// no sims, no repo reads (summarizeDir is exercised on temp dirs
// under /tmp only). Run: node scripts/test-bankadded-probe-a.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { stagingDecision, probeHaul, probeStackKey, stackKey,
  PROBE_UNITS, PROBE_KCAL_EACH, PROBE_ADDED_KCAL } = require('./policies/bankadded-probe-diag');
const { buildProbeEvents, injectedStackCheck, summarizeDir } = require('./analyze-bankadded-probe');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name); }
}

// ---- probe haul shape ----
const haul = probeHaul(10);
check('haul is 18 units', haul.units === PROBE_UNITS && PROBE_UNITS === 18);
check('haul is 40 kcal each', haul.kcalEach === PROBE_KCAL_EACH && PROBE_KCAL_EACH === 40);
check('haul totals 720 kcal', PROBE_ADDED_KCAL === 720);
check('haul spoilDay is day+2', haul.spoilDay === 12);
check('haul is edible raw grapes', haul.name === 'Muscadine Grapes' && haul.edible === true && haul.foodState === 'raw');
check('probeStackKey matches haul key', probeStackKey() === stackKey(haul));

// ---- stagingDecision (pure) ----
const base = { gameOver: false, combatLive: false, stranded: true,
  genuineBankAdded: false, stagedSoFar: 0, cap: 2, clock: 300 };
check('stranded + under cap stages', stagingDecision(base).stage === true);
check('early clock stages via wait-to-band', stagingDecision(base).via === 'wait-to-band');
check('in-band clock stages already-in-band', stagingDecision(Object.assign({}, base, { clock: 460 })).via === 'already-in-band');
check('game-over never stages', stagingDecision(Object.assign({}, base, { gameOver: true })).skip === 'game-over');
check('combat never stages', stagingDecision(Object.assign({}, base, { combatLive: true })).skip === 'combat');
check('not-stranded never stages', stagingDecision(Object.assign({}, base, { stranded: false })).skip === 'not-stranded');
check('genuine bank-added never injects', stagingDecision(Object.assign({}, base, { genuineBankAdded: true })).skip === 'genuine-bank-added');
check('per-seed cap blocks third staging', stagingDecision(Object.assign({}, base, { stagedSoFar: 2 })).skip === 'per-seed-cap');
check('one staged still allows second', stagingDecision(Object.assign({}, base, { stagedSoFar: 1 })).stage === true);

// ---- injectedStackCheck (pure) ----
function pack(stacks, edible) {
  return { edibleKcal: edible, grossKcal: edible, lumpUnits: 0, stacks };
}
const grapes = (units, spoil) => ({ name: 'Muscadine Grapes', units, kcalEach: 40, edible: true, foodState: 'raw', spoilDay: spoil });
const emptyPack = pack([], 0);
const fullPack = pack([grapes(18, 12)], 720);
const firstUpFull = { scholarDay: 11, kcal: 100, dayTicks: 0, pack: fullPack };
check('full retention matches', injectedStackCheck(fullPack, emptyPack, firstUpFull, 10).match === true);
check('full retention reports 18/18', (() => { const c = injectedStackCheck(fullPack, emptyPack, firstUpFull, 10); return c.postBankInjectedUnits === 18 && c.firstUpInjectedUnits === 18; })());
check('spoilDay match when day+2', injectedStackCheck(fullPack, emptyPack, firstUpFull, 10).spoilDayMatch === true);
const firstUpPartial = { scholarDay: 11, kcal: 100, dayTicks: 0, pack: pack([grapes(10, 12)], 400) };
check('partial retention mismatches', injectedStackCheck(fullPack, emptyPack, firstUpPartial, 10).match === false);
check('partial retention reports 10 at morning', injectedStackCheck(fullPack, emptyPack, firstUpPartial, 10).firstUpInjectedUnits === 10);
// Carried grapes of the same key must not count as staged food.
const carriedBefore = pack([grapes(5, 12)], 200);
const postWithCarried = pack([grapes(23, 12)], 920);
const firstUpWithCarried = { scholarDay: 11, kcal: 100, dayTicks: 0, pack: pack([grapes(23, 12)], 920) };
check('carried same-key units subtracted', (() => { const c = injectedStackCheck(postWithCarried, carriedBefore, firstUpWithCarried, 10); return c.postBankInjectedUnits === 18 && c.firstUpInjectedUnits === 18 && c.match === true; })());
const wrongSpoil = pack([grapes(18, 99)], 720);
const firstUpWrongSpoil = { scholarDay: 11, kcal: 100, dayTicks: 0, pack: wrongSpoil };
check('wrong spoilDay flags mismatch', injectedStackCheck(wrongSpoil, emptyPack, firstUpWrongSpoil, 10).spoilDayMatch === false);

// ---- buildProbeEvents on hand-built instances ----
function morningRec(loopDay, opts) {
  return Object.assign({ loopDay, ate: false, eatErr: null, skip: null,
    kcalBefore: 100, kcalAfterEat: 100,
    packBefore: { edibleKcal: 720, grossKcal: 720, lumpUnits: 0 },
    packAfter: { edibleKcal: 720, grossKcal: 720, lumpUnits: 0 },
    wakeTile: 'forest_floor,1,4' }, opts || {});
}
function stagedInst() {
  return {
    seed: 17063, daysAlive: 60, endReason: 'survived',
    bankfoodStore: { mornings: [morningRec(11)], evenings: [], firstUpkeeps: [], errs: 0, errors: [] },
    bankaddedProbeStore: { evenings: [
      { loopDay: 10, gameDay: 10, mode: 'bank-probe', staged: true, genuine: false,
        genuineDelta: null, underlyingMode: 'skip', ntOutcome: 'travel-refused',
        clockBefore: 300, clockAfter: 449, waits: 2, via: 'wait-to-band',
        probeAddedKcal: 720, probeUnits: 18, probeSpoilDay: 12, skip: null,
        packBefore: emptyPack, packAfter: fullPack, kcalAfter: 100 },
    ], errs: 0, errors: [] },
    firstUpkeeps: [firstUpFull],
    evenings: [
      { loopDay: 10, gameDay: 10, postDailyPack: fullPack,
        bankfoodEvening: { mode: 'skip', packBefore: emptyPack, packAfter: emptyPack, actions: [] },
        bankfoodMorning: null },
      { loopDay: 11, gameDay: 11, postDailyPack: fullPack,
        bankfoodEvening: null, bankfoodMorning: morningRec(11) },
    ],
  };
}
const evs = buildProbeEvents(stagedInst());
check('staged event is built', evs.length === 1);
check('staged event kind + mode', evs[0].kind === 'staged' && evs[0].mode === 'bank-probe');
check('staged event is judged', evs[0].judged === true);
check('staged delta is 720', evs[0].bankedEdibleDelta === 720);
check('staged delta matches probe', evs[0].deltaMatchesProbe === true);
check('staged source is banked (pack-before 0)', evs[0].source === 'banked');
check('staged verdict RETAINED', evs[0].verdict === 'RETAINED' && evs[0].retainedAtTrueMorning === true);
check('staged injected stack matches', evs[0].injectedStack && evs[0].injectedStack.match === true);
check('staged morning still-in-pack', evs[0].morningDisposition && evs[0].morningDisposition.disposition === 'still-in-pack');

// Censored: no next loop-day row.
const censNoNext = stagedInst();
censNoNext.evenings = censNoNext.evenings.slice(0, 1);
const censEvs = buildProbeEvents(censNoNext);
check('no-next-loop-day is censored', censEvs.length === 1 && censEvs[0].judged === false && censEvs[0].censoredReason === 'no-next-loop-day');
// Censored: next row exists, no first-upkeep.
const censNoFu = stagedInst();
censNoFu.firstUpkeeps = [];
const censFuEvs = buildProbeEvents(censNoFu);
check('no-first-upkeep is censored', censFuEvs.length === 1 && censFuEvs[0].judged === false && censFuEvs[0].censoredReason === 'no-first-upkeep-for-next-day');
// Skip records produce no events.
const skipInst = stagedInst();
skipInst.bankaddedProbeStore.evenings = [
  { loopDay: 5, gameDay: 5, mode: 'bank-probe', staged: false, genuine: false, skip: 'not-stranded', packBefore: emptyPack, packAfter: null },
];
check('skip records are not events', buildProbeEvents(skipInst).length === 0);
// Genuine event reuses the retainedEvents record (bank mode, delta > 0).
const genInst = stagedInst();
genInst.bankaddedProbeStore.evenings = [
  { loopDay: 10, gameDay: 10, mode: 'bank-probe', staged: false, genuine: true,
    genuineDelta: 325, underlyingMode: 'bank', waits: 0, via: null,
    packBefore: emptyPack, packAfter: null, skip: 'genuine-bank-added' },
];
genInst.evenings[0].bankfoodEvening = { mode: 'bank',
  packBefore: emptyPack, packAfter: pack([grapes(9, 12)], 360),
  actions: [{ kind: 'forage', Eknown: 360, unknownUnits: 0 }] };
genInst.evenings[0].postDailyPack = pack([grapes(9, 12)], 360);
genInst.firstUpkeeps = [{ scholarDay: 11, kcal: 100, dayTicks: 0, pack: pack([grapes(9, 12)], 360) }];
genInst.bankfoodStore.mornings = [morningRec(11, { packBefore: { edibleKcal: 360, grossKcal: 360, lumpUnits: 0 }, packAfter: { edibleKcal: 360, grossKcal: 360, lumpUnits: 0 } })];
const genEvs = buildProbeEvents(genInst);
check('genuine event is built', genEvs.length === 1);
check('genuine event kind + mode', genEvs[0].kind === 'genuine' && genEvs[0].mode === 'bank');
check('genuine event is judged + retained', genEvs[0].judged === true && genEvs[0].verdict === 'RETAINED');
check('genuine event has no injected stack', genEvs[0].injectedStack === null);

// ---- summarizeDir verdict math on temp dirs ----
function writeInst(dir, seed, inst) {
  fs.writeFileSync(path.join(dir, 'bankfood-b-nighttravel-s' + seed + '.json'), JSON.stringify(inst));
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bankadded-probe-test-'));
try {
  // 3 judged staged events, all retained -> GO-RETAINED.
  for (const [seed, day] of [[17064, 10], [17059, 20], [17063, 30]]) {
    const inst = stagedInst();
    inst.seed = seed;
    inst.bankaddedProbeStore.evenings[0].loopDay = day;
    inst.bankaddedProbeStore.evenings[0].gameDay = day;
    inst.evenings[0].loopDay = day; inst.evenings[0].gameDay = day;
    inst.evenings[1].loopDay = day + 1; inst.evenings[1].gameDay = day + 1;
    inst.evenings[1].bankfoodMorning.loopDay = day + 1;
    inst.bankfoodStore.mornings[0].loopDay = day + 1;
    inst.firstUpkeeps[0].scholarDay = day + 1;
    inst.bankaddedProbeStore.evenings[0].probeSpoilDay = day + 2;
    inst.evenings[0].postDailyPack.stacks[0].spoilDay = day + 2;
    inst.firstUpkeeps[0].pack.stacks[0].spoilDay = day + 2;
    writeInst(tmp, seed, inst);
  }
  const rep = summarizeDir(tmp);
  check('3-seed temp dir: 3 distinct judged', rep.totals.distinctJudged === 3);
  check('3-seed temp dir: all retained', rep.totals.retainedAtTrueMorning === 3);
  check('3-seed temp dir: verdict GO-RETAINED', rep.totals.verdict === 'GO-RETAINED');
  check('3-seed temp dir: goBarMet', rep.totals.goBarMet === true);
  check('3-seed temp dir: injected stacks match', rep.totals.injectedStackMatch === 3 && rep.totals.injectedStackMismatch === 0);
  check('3-seed temp dir: zero instrument errors', rep.totals.probeErrs === 0 && rep.totals.bfErrs === 0);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'bankadded-probe-test2-'));
try {
  // 2 judged events only -> INSUFFICIENT-DATA.
  for (const [seed, day] of [[17064, 10], [17059, 20]]) {
    const inst = stagedInst();
    inst.seed = seed;
    inst.bankaddedProbeStore.evenings[0].loopDay = day;
    inst.bankaddedProbeStore.evenings[0].gameDay = day;
    inst.evenings[0].loopDay = day; inst.evenings[0].gameDay = day;
    inst.evenings[1].loopDay = day + 1; inst.evenings[1].gameDay = day + 1;
    inst.evenings[1].bankfoodMorning.loopDay = day + 1;
    inst.bankfoodStore.mornings[0].loopDay = day + 1;
    inst.firstUpkeeps[0].scholarDay = day + 1;
    inst.bankaddedProbeStore.evenings[0].probeSpoilDay = day + 2;
    inst.evenings[0].postDailyPack.stacks[0].spoilDay = day + 2;
    inst.firstUpkeeps[0].pack.stacks[0].spoilDay = day + 2;
    writeInst(tmp2, seed, inst);
  }
  const rep2 = summarizeDir(tmp2);
  check('2-seed temp dir: verdict INSUFFICIENT-DATA', rep2.totals.verdict === 'INSUFFICIENT-DATA');
  check('2-seed temp dir: goBarMet false', rep2.totals.goBarMet === false);
} finally { fs.rmSync(tmp2, { recursive: true, force: true }); }

console.log('test-bankadded-probe-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
