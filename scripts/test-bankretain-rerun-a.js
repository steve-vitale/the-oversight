#!/usr/bin/env node
// test-bankretain-rerun-a.js — proof for the redefined bankretain classifier.
// Pure checks always run (carried vs banked vs mixed, censored,
// retained, upkeep-eaten kcal chain, vanished, spoil-shortfall naming,
// morning dispositions, revised neutrality, OFF-leg det-gate).
// Corpus checks run only when BANKRETAIN_RERUN_CORPUS_CHECK=1 with
// dirs in BANKRETAIN_RERUN_TEST_VARIANT / BANKRETAIN_RERUN_TEST_OFF:
// every file present + parses, bankfood errs 0, det-gate per seed,
// pre-action trajectory equality per seed.
// Usage: node scripts/test-bankretain-rerun-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { retainedEvents, classifyRetention, morningDisposition,
  neutralityCheck, offDetGate } = require('./analyze-bankretain-rerun');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function pack(edibleKcal, stacks) {
  return { edibleKcal, grossKcal: edibleKcal, lumpUnits: 0, stacks };
}
function st(name, units, kcalEach, spoilDay) {
  return { name, units, kcalEach, edible: true, foodState: 'ready', spoilDay };
}
function synthInst(seed, evenings, firstUpkeeps, mornings) {
  return { seed, evenings, firstUpkeeps, bankfoodStore: { mornings, evenings: [], errs: 0 } };
}
function synthRow(loopDay, gameDay, ev, postDailyPack, kcal) {
  const r = { loopDay, gameDay, bankfoodEvening: ev, postDailyPack, kcal: kcal === undefined ? 2000 : kcal, tile: 'forest_floor', mx: 8, my: 2 };
  if (ev && ev.morningForRow) r.bankfoodMorning = ev.morningForRow;
  return r;
}
function evFlip(packBeforeEd, actions) {
  return { mode: 'flip', clockBefore: 385, clockAfter: 404, kcalAfter: 500,
    packBefore: { edibleKcal: packBeforeEd }, actions };
}

// ---- classifyRetention basics (carried over, still required) ----
{
  const pb = pack(195, [st('Blackberry', 3, 65, 32)]);
  const fu = { scholarDay: 31, pack: pack(195, [st('Blackberry', 3, 65, 32)]) };
  check('classify clean retention', classifyRetention(pb, fu).verdict === 'RETAINED');
}
{
  const pb = pack(195, [st('Blackberry', 3, 65, 32)]);
  const fu = { scholarDay: 31, pack: pack(0, []) };
  check('classify full vanish', classifyRetention(pb, fu).verdict === 'VANISHED');
}
{
  const pb = pack(300, [st('Berries', 2, 100, 10), st('Roots', 2, 50, 20)]);
  const fu = { scholarDay: 10, pack: pack(100, [st('Roots', 2, 50, 20)]) };
  const c = classifyRetention(pb, fu);
  check('classify spoil-swept retention', c.verdict === 'RETAINED-SPOIL-SWEPT', c.verdict);
  check('spoil shortfall named', c.shortfalls.length === 1 && c.shortfalls[0].namedSpoil === true);
}
{
  const pb = pack(300, [st('Berries', 2, 100, 30), st('Roots', 2, 50, 20)]);
  const fu = { scholarDay: 10, pack: pack(100, [st('Roots', 2, 50, 20)]) };
  const c = classifyRetention(pb, fu);
  check('classify unexplained partial', c.verdict === 'PARTIAL-UNEXPLAINED', c.verdict);
}

// ---- carried event: the 16505 shape (before 540, delta 0, upkeep-eaten) ----
{
  const ev = evFlip(540, [{ kind: 'walk' }, { kind: 'gather' }, { kind: 'gather' }]);
  const grapes = [st('Muscadine Grapes', 6, 90, 63)];
  const inst = synthInst(16505,
    [synthRow(59, 60, ev, pack(540, grapes)),
     synthRow(60, 61, null, pack(0, []))],
    [{ scholarDay: 61, kcal: 344, dayTicks: 0, pack: pack(540, grapes) }],
    [{ loopDay: 60, ate: false, skip: 'no-pack-food', kcalBefore: 884, kcalAfterEat: 884,
      packBefore: pack(0, []), packAfter: pack(0, []) }]);
  const evs = retainedEvents(inst);
  check('carried event extracted + judged', evs.length === 1 && evs[0].judged === true, JSON.stringify(evs.map((e) => e.judged)));
  check('carried source named', evs[0] && evs[0].source === 'carried', String(evs[0] && evs[0].source));
  check('carried delta 0', evs[0] && evs[0].bankedEdibleDelta === 0, String(evs[0] && evs[0].bankedEdibleDelta));
  check('carried retained at true morning', evs[0] && evs[0].retainedAtTrueMorning === true, String(evs[0] && evs[0].verdict));
  check('carried morning disposition upkeep-eaten', evs[0] && evs[0].morningDisposition.disposition === 'upkeep-eaten', JSON.stringify(evs[0] && evs[0].morningDisposition));
  check('upkeep-eaten kcal chain exact 884-344=540', evs[0] && evs[0].morningDisposition.kcalGain === 540, JSON.stringify(evs[0] && evs[0].morningDisposition));
  check('upkeep-eaten is NOT vanished', evs[0] && evs[0].verdict !== 'VANISHED', String(evs[0] && evs[0].verdict));
}
// ---- banked event: 15003 shape with a following morning ----
{
  const ev = evFlip(0, [{ kind: 'forage', Eknown: 195, unknownUnits: 3 }]);
  const bb = [st('Blackberry', 3, 65, 32)];
  const inst = synthInst(15003,
    [synthRow(30, 30, ev, pack(195, bb)),
     synthRow(31, 31, null, pack(195, bb))],
    [{ scholarDay: 31, kcal: 400, dayTicks: 0, pack: pack(195, bb) }],
    [{ loopDay: 31, ate: true, kcalBefore: 400, kcalAfterEat: 595,
      packBefore: pack(195, bb), packAfter: pack(0, []) }]);
  const evs = retainedEvents(inst);
  check('banked event extracted + judged', evs.length === 1 && evs[0].judged === true);
  check('banked source named', evs[0] && evs[0].source === 'banked', String(evs[0] && evs[0].source));
  check('banked delta 195', evs[0] && evs[0].bankedEdibleDelta === 195);
  check('banked morning disposition morning-phase-eaten', evs[0] && evs[0].morningDisposition.disposition === 'morning-phase-eaten', JSON.stringify(evs[0] && evs[0].morningDisposition));
}
// ---- mixed event: carried + bank-added ----
{
  const ev = evFlip(100, [{ kind: 'forage', Eknown: 50, unknownUnits: 0 }]);
  const inst = synthInst(99999,
    [synthRow(10, 10, ev, pack(150, [st('Roots', 3, 50, 40)])),
     synthRow(11, 11, null, pack(150, [st('Roots', 3, 50, 40)]))],
    [{ scholarDay: 11, kcal: 300, dayTicks: 0, pack: pack(150, [st('Roots', 3, 50, 40)]) }],
    [{ loopDay: 11, ate: false, kcalBefore: 300, kcalAfterEat: 300, packBefore: pack(150, [st('Roots', 3, 50, 40)]) }]);
  const evs = retainedEvents(inst);
  check('mixed source named', evs.length === 1 && evs[0].source === 'mixed', JSON.stringify(evs.map((e) => e.source)));
  check('mixed morning disposition still-in-pack', evs[0] && evs[0].morningDisposition.disposition === 'still-in-pack', JSON.stringify(evs[0] && evs[0].morningDisposition));
}
// ---- censored: final-day bank, no next row ----
{
  const ev = evFlip(0, [{ kind: 'forage', Eknown: 195, unknownUnits: 3 }]);
  const inst = synthInst(15003,
    [synthRow(30, 30, ev, pack(195, [st('Blackberry', 3, 65, 32)]))],
    [], []);
  const evs = retainedEvents(inst);
  check('censored final-day event', evs.length === 1 && evs[0].judged === false);
  check('censored reason no-next-loop-day', evs[0] && evs[0].censoredReason === 'no-next-loop-day', String(evs[0] && evs[0].censoredReason));
}
// ---- censored: next row exists but no first upkeep ----
{
  const ev = evFlip(540, [{ kind: 'walk' }]);
  const inst = synthInst(16505,
    [synthRow(59, 60, ev, pack(540, [st('Muscadine Grapes', 6, 90, 63)])),
     synthRow(60, 61, null, pack(0, []))],
    [], []);
  const evs = retainedEvents(inst);
  check('censored no-first-upkeep', evs.length === 1 && evs[0].judged === false && evs[0].censoredReason === 'no-first-upkeep-for-next-day', JSON.stringify(evs.map((e) => e.censoredReason)));
}
// ---- lump-only / no-gain excluded ----
{
  const ev = evFlip(0, [{ kind: 'forage', Eknown: 0, unknownUnits: 7 }]);
  const inst = synthInst(15376,
    [synthRow(8, 8, ev, { edibleKcal: 0, grossKcal: 0, lumpUnits: 7, stacks: [] }),
     synthRow(9, 9, null, { edibleKcal: 0, grossKcal: 0, lumpUnits: 7, stacks: [] })],
    [{ scholarDay: 9, kcal: 400, dayTicks: 0, pack: { edibleKcal: 0, grossKcal: 0, lumpUnits: 7, stacks: [] } }],
    [{ loopDay: 9, ate: false, skip: 'no-pack-food' }]);
  check('lump-only evening excluded', retainedEvents(inst).length === 0);
}
// ---- morning-unaccounted: first-upkeep intact, morning pack empty, no kcal gain ----
{
  const ev = evFlip(200, [{ kind: 'walk' }]);
  const food = [st('Roots', 4, 50, 40)];
  const inst = synthInst(99998,
    [synthRow(20, 20, ev, pack(200, food)),
     synthRow(21, 21, null, pack(200, food))],
    [{ scholarDay: 21, kcal: 300, dayTicks: 0, pack: pack(200, food) }],
    [{ loopDay: 21, ate: false, skip: 'no-pack-food', kcalBefore: 300, kcalAfterEat: 300, packBefore: pack(0, []) }]);
  const evs = retainedEvents(inst);
  check('morning-unaccounted disposition', evs.length === 1 && evs[0].morningDisposition.disposition === 'morning-unaccounted', JSON.stringify(evs.map((e) => e.morningDisposition)));
  check('morning-unaccounted still retained at true morning', evs[0] && evs[0].retainedAtTrueMorning === true, 'primary verdict is first-upkeep only');
}
// ---- revised neutrality: pre-action match + named divergence ----
{
  function row(loopDay, kcal) { return { loopDay, gameDay: loopDay, kcal, tile: 'forest_floor', mx: 8, my: 2, bankfoodEvening: null }; }
  const off = { evenings: [row(1, 2000), row(2, 1900), row(3, 1800)] };
  const vrn = { evenings: [row(1, 2000), row(2, 1900),
    Object.assign(row(3, 1728), { bankfoodEvening: { mode: 'flip', actions: [{ kind: 'forage' }] } })] };
  const n = neutralityCheck(off, vrn);
  check('neutrality pre-action match', n.preActionMatch === true, JSON.stringify(n.preActionMismatches));
  check('neutrality divergence day named', n.firstActedLoopDay === 3, String(n.firstActedLoopDay));
  check('neutrality divergence kcal delta', n.divergenceKcalDelta === -72, String(n.divergenceKcalDelta));
}
{
  function row(loopDay, kcal) { return { loopDay, gameDay: loopDay, kcal, tile: 'forest_floor', mx: 8, my: 2, bankfoodEvening: null }; }
  const off = { evenings: [row(1, 2000), row(2, 1900)] };
  const vrn = { evenings: [row(1, 2000), row(2, 1950),
    Object.assign(row(3, 1800), { bankfoodEvening: { mode: 'flip', actions: [{ kind: 'forage' }] } })] };
  const n = neutralityCheck(off, vrn);
  check('neutrality pre-action mismatch detected', n.preActionMatch === false && n.preActionMismatches.length === 1, JSON.stringify(n.preActionMismatches));
}
// ---- OFF-leg det-gate ----
{
  const offOk = { bankfoodStore: { errs: 0 }, evenings: [{ bankfoodEvening: { mode: 'skip', actions: [] } }] };
  check('det-gate passes on clean OFF leg', offDetGate(offOk).pass === true);
  const offBad = { bankfoodStore: { errs: 0 }, evenings: [{ bankfoodEvening: { mode: 'flip', actions: [{ kind: 'forage' }] } }] };
  check('det-gate fails on acted OFF evening', offDetGate(offBad).pass === false);
}

// ---- corpus checks (only when asked) ----
if (process.env.BANKRETAIN_RERUN_CORPUS_CHECK === '1') {
  const vdir = process.env.BANKRETAIN_RERUN_TEST_VARIANT;
  const odir = process.env.BANKRETAIN_RERUN_TEST_OFF;
  const seeds = (process.env.BANKRETAIN_RERUN_TEST_SEEDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  for (const seed of seeds) {
    const vf = path.join(vdir, `bankfood-b-nighttravel-s${seed}.json`);
    let inst = null;
    try { inst = JSON.parse(fs.readFileSync(vf, 'utf8')); } catch (e) { inst = null; }
    check(`corpus variant seed ${seed} present + parses`, !!inst);
    check(`corpus variant seed ${seed} bankfood errs 0`, inst && inst.bankfoodStore && inst.bankfoodStore.errs === 0, 'errs=' + (inst && inst.bankfoodStore && inst.bankfoodStore.errs));
    if (odir) {
      const of = path.join(odir, `bankfood-b-nighttravel-s${seed}.json`);
      let oinst = null;
      try { oinst = JSON.parse(fs.readFileSync(of, 'utf8')); } catch (e) { oinst = null; }
      check(`corpus off seed ${seed} present + parses`, !!oinst);
      if (oinst && inst) {
        const g = offDetGate(oinst);
        check(`corpus off seed ${seed} det-gate`, g.pass === true, JSON.stringify(g));
        const n = neutralityCheck(oinst, inst);
        check(`corpus seed ${seed} pre-action trajectory match`, n.preActionMatch === true, JSON.stringify(n.preActionMismatches) + ' divDay=' + n.firstActedLoopDay);
      }
    }
  }
} else {
  console.log('SKIP corpus checks (set BANKRETAIN_RERUN_CORPUS_CHECK=1 to run them)');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
