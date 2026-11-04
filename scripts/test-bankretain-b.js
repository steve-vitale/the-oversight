#!/usr/bin/env node
// test-bankretain-b.js — proof for the bankretain classifier.
// Pure checks always run (retention classification incl. named-spoil
// shortfalls, censored-vs-judged extraction from synthetic corpora).
// Corpus checks run only when BANKRETAIN_CORPUS_CHECK=1 with dirs in
// BANKRETAIN_TEST_VARIANT / BANKRETAIN_TEST_OFF: every file present +
// parses, bankfood errs 0, off-vs-variant survival neutrality.
// Usage: node scripts/test-bankretain-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { edibleBankEvents, classifyRetention } = require('./analyze-bankretain-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function pack(edibleKcal, stacks) {
  return { edibleKcal, grossKcal: edibleKcal, lumpUnits: 0, stacks };
}
function st(name, units, kcalEach, spoilDay, edible) {
  return { name, units, kcalEach, edible: edible === undefined ? true : edible, foodState: 'raw', spoilDay };
}

// ---- classifyRetention: clean retention ----
{
  const pb = pack(195, [st('Blackberry', 3, 65, 32)]);
  const fu = { scholarDay: 31, pack: pack(195, [st('Blackberry', 3, 65, 32)]) };
  const c = classifyRetention(pb, fu);
  check('classify clean retention', c.verdict === 'RETAINED', c.verdict);
}
// ---- classifyRetention: full vanish ----
{
  const pb = pack(195, [st('Blackberry', 3, 65, 32)]);
  const fu = { scholarDay: 31, pack: pack(0, []) };
  const c = classifyRetention(pb, fu);
  check('classify full vanish', c.verdict === 'VANISHED', c.verdict);
}
// ---- classifyRetention: named spoil sweep is retention, not vanish ----
{
  const pb = pack(300, [st('Berries', 2, 100, 10), st('Roots', 2, 50, 20)]);
  const fu = { scholarDay: 10, pack: pack(100, [st('Roots', 2, 50, 20)]) };
  const c = classifyRetention(pb, fu);
  check('classify spoil-swept retention', c.verdict === 'RETAINED-SPOIL-SWEPT', c.verdict);
  check('spoil shortfall named', c.shortfalls.length === 1 && c.shortfalls[0].namedSpoil === true, JSON.stringify(c.shortfalls));
}
// ---- classifyRetention: unexplained partial loss is neither ----
{
  const pb = pack(300, [st('Berries', 2, 100, 30), st('Roots', 2, 50, 20)]);
  const fu = { scholarDay: 10, pack: pack(100, [st('Roots', 2, 50, 20)]) };
  const c = classifyRetention(pb, fu);
  check('classify unexplained partial', c.verdict === 'PARTIAL-UNEXPLAINED', c.verdict);
  check('unexplained shortfall unnamed', c.shortfalls.length === 1 && c.shortfalls[0].namedSpoil === false, JSON.stringify(c.shortfalls));
}
// ---- edibleBankEvents: judged vs censored extraction ----
function synthInst(seed, evenings, firstUpkeeps, mornings) {
  return { seed, evenings, firstUpkeeps, bankfoodStore: { mornings, evenings: [], errs: 0 } };
}
function synthRow(loopDay, gameDay, ev, postDailyPack) {
  return { loopDay, gameDay, bankfoodEvening: ev, postDailyPack };
}
{
  // Judged: day-30-style bank with a day-31 morning.
  const ev = { mode: 'flip', clockBefore: 385, clockAfter: 404, kcalAfter: 500,
    packBefore: { edibleKcal: 0 }, actions: [{ kind: 'forage', Eknown: 195, unknownUnits: 3 }] };
  const inst = synthInst(15003,
    [synthRow(30, 30, ev, pack(195, [st('Blackberry', 3, 65, 32)])),
     synthRow(31, 31, null, pack(195, [st('Blackberry', 3, 65, 32)]))],
    [{ scholarDay: 31, kcal: 400, dayTicks: 0, pack: pack(195, [st('Blackberry', 3, 65, 32)]) }],
    [{ loopDay: 31, ate: true, kcalBefore: 400, kcalAfterEat: 595,
      packBefore: pack(195, [st('Blackberry', 3, 65, 32)]),
      packAfter: pack(0, []) }]);
  const evs = edibleBankEvents(inst);
  check('extraction finds judged event', evs.length === 1 && evs[0].judged === true, JSON.stringify(evs.map((e) => e.judged)));
  check('extraction delta 195', evs[0] && evs[0].bankedEdibleDelta === 195, String(evs[0] && evs[0].bankedEdibleDelta));
  check('extraction verdict retained', evs[0] && evs[0].verdict === 'RETAINED', String(evs[0] && evs[0].verdict));
  check('extraction morning eat fired', evs[0] && evs[0].morningPhase && evs[0].morningPhase.ate === true, JSON.stringify(evs[0] && evs[0].morningPhase));
}
{
  // Censored: final-day bank with no next row / no first upkeep.
  const ev = { mode: 'flip', clockBefore: 385, clockAfter: 404, kcalAfter: 500,
    packBefore: { edibleKcal: 0 }, actions: [{ kind: 'forage', Eknown: 195, unknownUnits: 3 }] };
  const inst = synthInst(15003,
    [synthRow(30, 30, ev, pack(195, [st('Blackberry', 3, 65, 32)]))],
    [], []);
  const evs = edibleBankEvents(inst);
  check('extraction censored final-day bank', evs.length === 1 && evs[0].judged === false, JSON.stringify(evs.map((e) => e.judged)));
  check('censored reason named', evs[0] && evs[0].censoredReason === 'no-next-loop-day', String(evs[0] && evs[0].censoredReason));
}
{
  // Not an edible bank: lump-only evening (delta 0) is excluded.
  const ev = { mode: 'flip', clockBefore: 385, clockAfter: 404, kcalAfter: 500,
    packBefore: { edibleKcal: 0 }, actions: [{ kind: 'forage', Eknown: 0, unknownUnits: 7 }] };
  const inst = synthInst(15376,
    [synthRow(8, 8, ev, { edibleKcal: 0, grossKcal: 0, lumpUnits: 7, stacks: [] }),
     synthRow(9, 9, null, { edibleKcal: 0, grossKcal: 0, lumpUnits: 7, stacks: [] })],
    [{ scholarDay: 9, kcal: 400, dayTicks: 0, pack: { edibleKcal: 0, grossKcal: 0, lumpUnits: 7, stacks: [] } }],
    [{ loopDay: 9, ate: false, skip: 'no-pack-food' }]);
  const evs = edibleBankEvents(inst);
  check('lump-only evening excluded', evs.length === 0, JSON.stringify(evs.length));
}
// ---- corpus checks (only when asked) ----
if (process.env.BANKRETAIN_CORPUS_CHECK === '1') {
  const vdir = process.env.BANKRETAIN_TEST_VARIANT;
  const odir = process.env.BANKRETAIN_TEST_OFF;
  const seeds = (process.env.BANKRETAIN_TEST_SEEDS || '').split(',').map((s) => s.trim()).filter(Boolean);
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
      check(`corpus off seed ${seed} survival neutrality`, !!oinst && oinst.daysAlive === (inst && inst.daysAlive) && oinst.endReason === (inst && inst.endReason),
        `off=${oinst && oinst.daysAlive}/${oinst && oinst.endReason} var=${inst && inst.daysAlive}/${inst && inst.endReason}`);
    }
  }
} else {
  console.log('SKIP corpus checks (set BANKRETAIN_CORPUS_CHECK=1 to run them)');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
