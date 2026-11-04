#!/usr/bin/env node
// test-upkeepbreakfast-a.js — proof for the upkeep-breakfast instrument.
// Pure checks always run (eat-line detection, food naming, exact-chain
// qualification, narration verdict window rules, morning-window join).
// Corpus checks run only when UPKEEPBREAKFAST_CORPUS_CHECK=1 with the
// dir in UPKEEPBREAKFAST_CORPUS_DIR: the 16505 reproduction corpus must
// parse, carry the scholarDay-61 morning window, and reproduce the
// bankretain chain (first-upkeep 344 kcal + 540 grapes -> daily-start
// 884 kcal + 0 pack, morning phase ate=false skip no-pack-food).
// DELIBERATE NON-ASSERTION: the corpus checks assert the verdict is
// COMPUTED (SILENT or NARRATED) but never assert WHICH one — whether
// the meal is silent or narrated is the empirical question the sweep
// answers, not a property of the classifier. Baking in SILENT would
// turn a measurement into a tautology; baking in NARRATED would beg
// the same question the other way.
// Usage: node scripts/test-upkeepbreakfast-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { isEatLine, namesFood, edibleFoodNames, qualifyUpkeepMeal,
  classifyNarration, morningWindows, summarizeMornings } = require('./upkeepbreakfast-a-lib');

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

// ---- eat-line detection ----
check('eat line matches meal beat', isEatLine('You eat Muscadine Grapes (540 kcal).'));
check('eat line matches unnamed beat', isEatLine('You eat (540 kcal).'));
check('eat line rejects gather line', !isEatLine('You gather fallen limbs from under the tree. +1 branch +1 bark strip.'));
check('eat line rejects nothing-edible', !isEatLine('Nothing edible.'));
check('eat line rejects full-enough', !isEatLine('You are full enough.'));

// ---- food naming ----
check('namesFood case-insensitive', namesFood('You eat muscadine grapes (540 kcal).', ['Muscadine Grapes']));
check('namesFood rejects other food', !namesFood('You eat Hickory Nuts (100 kcal).', ['Muscadine Grapes']));
check('namesFood empty list false', !namesFood('You eat Muscadine Grapes (540 kcal).', []));
check('edibleFoodNames filters inedible + lump',
  JSON.stringify(edibleFoodNames(pack(540, [
    st('Muscadine Grapes', 6, 90, 63),
    { name: 'Unknown Nuts', units: 3, kcalEach: 0, edible: false, foodState: 'unknown', spoilDay: 63 },
  ]))) === JSON.stringify(['Muscadine Grapes']));

// ---- exact-chain qualification: the 16505 shape ----
{
  const fu = { scholarDay: 61, kcal: 344, pack: pack(540, [st('Muscadine Grapes', 6, 90, 63)]) };
  const ds = { kcal: 884, pack: pack(0, []) };
  const mp = { ate: false, skip: 'no-pack-food' };
  const q = qualifyUpkeepMeal(fu, ds, mp);
  check('16505 shape qualifies', q.qualifies === true, JSON.stringify(q));
  check('16505 eaten 540', q.eaten === 540, String(q.eaten));
  check('16505 kcalGain 540', q.kcalGain === 540, String(q.kcalGain));
  check('16505 foodNames grapes', q.foodNames.indexOf('Muscadine Grapes') !== -1, JSON.stringify(q.foodNames));
  check('16505 morningPhase skip recorded', q.morningPhaseSkip === 'no-pack-food' && q.morningPhaseAte === false);
}
{
  // Inexact chain (pantry top-up inside upkeep) must NOT qualify.
  const fu = { scholarDay: 61, kcal: 344, pack: pack(540, [st('Muscadine Grapes', 6, 90, 63)]) };
  const ds = { kcal: 1000, pack: pack(0, []) };
  check('inexact chain disqualifies', qualifyUpkeepMeal(fu, ds, null).qualifies === false);
}
{
  // Nothing eaten: pack intact at daily start.
  const fu = { scholarDay: 61, kcal: 344, pack: pack(540, [st('Muscadine Grapes', 6, 90, 63)]) };
  const ds = { kcal: 344, pack: pack(540, [st('Muscadine Grapes', 6, 90, 63)]) };
  check('nothing-eaten disqualifies', qualifyUpkeepMeal(fu, ds, null).qualifies === false);
}
{
  // No edible at first upkeep.
  const fu = { scholarDay: 61, kcal: 344, pack: pack(0, []) };
  const ds = { kcal: 344, pack: pack(0, []) };
  check('no-edible disqualifies', qualifyUpkeepMeal(fu, ds, null).qualifies === false);
}
check('missing snapshot disqualifies', qualifyUpkeepMeal(null, { kcal: 0, pack: pack(0, []) }, null).qualifies === false);

// ---- narration verdict window rules ----
{
  const n = classifyNarration(['You eat Muscadine Grapes (540 kcal).'], [], ['Muscadine Grapes']);
  check('upkeep eat line narrates', n.verdict === 'NARRATED');
  check('upkeep named line recorded', n.upkeepNamedLines.length === 1);
}
{
  // A daily-only eat line is NOT breakfast narration: verdict SILENT,
  // but the daily line is still reported (quoted) for sense judgment.
  const n = classifyNarration(['You work late.'], ['You eat Hickory Nuts (100 kcal).'], ['Muscadine Grapes']);
  check('daily-only eat line still SILENT verdict', n.verdict === 'SILENT');
  check('daily eat line reported separately', n.dailyEatLines.length === 1);
}
{
  const n = classifyNarration([], [], ['Muscadine Grapes']);
  check('no lines at all is SILENT', n.verdict === 'SILENT');
}

// ---- morning-window join (synthetic events) ----
function upEv(seq, day, lines) {
  return { kind: 'upkeep', seq, scholarDayBefore: day, scholarDayAfter: day,
    kcalBefore: 344, kcalAfter: 884, packBefore: null, packAfter: null, lines };
}
function dayEv(loopDay, scholarDay, lines, posInside) {
  return { kind: 'daily', loopDay, scholarDay, kcalBefore: 884, packBefore: pack(0, []),
    pos: { inside: posInside, tile: 'forest_floor', mapPx: 1, mapPy: 2 }, lines,
    bankfoodMorning: null, bankfoodEvening: null, postDailyPack: pack(0, []), gameOver: false };
}
{
  const grapes = [st('Muscadine Grapes', 6, 90, 63)];
  const inst = {
    firstUpkeeps: [
      { scholarDay: 61, kcal: 344, pack: pack(540, grapes) },
      { scholarDay: 62, kcal: 900, pack: pack(0, []) },
    ],
    bankfoodMornings: [{ loopDay: 60, ate: false, skip: 'no-pack-food', kcalBefore: 884 }],
    events: [
      upEv(1, 61, ['The pantry is in the hall. Your hands are not.']),
      upEv(2, 61, []),
      upEv(3, 61, []),
      dayEv(60, 61, ['You forage Hickory Nuts.'], false),
      upEv(4, 62, []),
      upEv(5, 62, []),
      upEv(6, 62, []),
      dayEv(61, 62, [], false),
      upEv(7, 63, ['Trailing upkeep, game over before daily — no window.']),
    ],
  };
  const ws = morningWindows(inst);
  check('two windows joined, trailing upkeep dropped', ws.length === 2, String(ws.length));
  check('window 1 is loop-day 60 / scholarDay 61', ws[0] && ws[0].loopDay === 60 && ws[0].scholarDay === 61);
  check('window 1 upkeep window holds exactly its 3 calls', ws[0] && ws[0].upkeepCallCount === 3);
  check('window 1 upkeep lines exclude next day', ws[0] && ws[0].upkeepLines.length === 1 &&
    ws[0].upkeepLines[0].indexOf('pantry is in the hall') !== -1, JSON.stringify(ws[0] && ws[0].upkeepLines));
  check('window 1 qualifies', ws[0] && ws[0].chain.qualifies === true);
  check('window 1 wake away recorded', ws[0] && ws[0].wakeInsideHaven === false && ws[0].wakeTileType === 'forest_floor');
  check('window 1 morningPhase attached', ws[0] && ws[0].morningPhase && ws[0].morningPhase.skip === 'no-pack-food');
  check('window 2 does not qualify (no edible)', ws[1] && ws[1].chain.qualifies === false);
  const s = summarizeMornings(ws);
  check('summary counts', s.windows === 2 && s.qualifying === 1 && s.silent === 1 && s.qualifyingAway === 1, JSON.stringify(s));
}

// ---- corpus mode: 16505 reproduction (verdict computed, never assumed) ----
if (process.env.UPKEEPBREAKFAST_CORPUS_CHECK === '1') {
  const dir = process.env.UPKEEPBREAKFAST_CORPUS_DIR;
  check('corpus dir set', !!dir);
  if (dir) {
    const f = path.join(dir, 'upkeepbreakfast-a-s16505.json');
    let inst = null, parseOk = false;
    try { inst = JSON.parse(fs.readFileSync(f, 'utf8')); parseOk = true; } catch (e) { parseOk = false; }
    check('16505 corpus present + parses', parseOk);
    if (parseOk) {
      check('16505 bankfood errs 0', (inst.bankfoodErrs || 0) === 0, String(inst.bankfoodErrs));
      const ws = morningWindows(inst);
      const w61 = ws.find((w) => w.scholarDay === 61) || null;
      check('16505 scholarDay-61 window exists', !!w61);
      if (w61) {
        check('16505 window is loop-day 60', w61.loopDay === 60, String(w61.loopDay));
        check('16505 chain qualifies', w61.chain.qualifies === true, JSON.stringify(w61.chain));
        check('16505 eaten 540', w61.chain.eaten === 540, String(w61.chain.eaten));
        check('16505 foodNames include grapes', w61.chain.foodNames.indexOf('Muscadine Grapes') !== -1, JSON.stringify(w61.chain.foodNames));
        check('16505 daily-start pack 0', w61.dailyStart.packEdible === 0, String(w61.dailyStart.packEdible));
        check('16505 morningPhase skip no-pack-food', w61.morningPhase && w61.morningPhase.skip === 'no-pack-food', JSON.stringify(w61.morningPhase));
        check('16505 upkeep window has 3 calls', w61.upkeepCallCount === 3, String(w61.upkeepCallCount));
        check('16505 narration verdict computed (SILENT or NARRATED)',
          w61.narration.verdict === 'SILENT' || w61.narration.verdict === 'NARRATED', String(w61.narration.verdict));
        console.log('CORPUS-16505-VERDICT ' + w61.narration.verdict +
          ' upkeepEatLines=' + JSON.stringify(w61.narration.upkeepEatLines) +
          ' dailyEatLines=' + JSON.stringify(w61.narration.dailyEatLines));
      }
    }
  }
}

console.log(`upkeepbreakfast-a proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
