#!/usr/bin/env node
// test-upkeepbf52-a.js — proof for the pack-pinned upkeep-meal
// instrument (sim-upkeepbf52-a). Pure checks always run (pack-pinned
// meal detection, narration verdict window rules, exact-chain vs
// pack-pinned split, morning-window join with stacks). Corpus checks
// run only when UPKEEPBF52_CORPUS_CHECK=1 with the dir in
// UPKEEPBF52_CORPUS_DIR: the 17021 reproduction corpus must parse,
// carry the scholarDay-53 morning window, and reproduce the
// substrate chain (first-upkeep 128 kcal + 270 grapes intact ->
// daily-start 2310 kcal + 0 pack edible, morning phase ate=false
// skip no-pack-food).
// DELIBERATE NON-ASSERTION: the corpus checks assert the verdict is
// COMPUTED (SILENT or NARRATED) but never assert WHICH one — whether
// the meal is silent or narrated is the empirical question the sweep
// answers, not a property of the classifier. Baking in SILENT would
// turn a measurement into a tautology; baking in NARRATED would beg
// the same question the other way.
// Usage: node scripts/test-upkeepbf52-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { isEatLine, namesFood, packPinnedMeal, classifyPackMealNarration,
  packWindows, qualifyUpkeepMeal } = require('./upkeepbf52-a-lib');

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
function gear(name) {
  return { name, units: 1, kcalEach: 0, edible: null, foodState: null, spoilDay: null };
}

// ---- pack-pinned meal: the 17021/52 shape ----
// First-upkeep scholarDay 53: kcal 128, 3x Muscadine Grapes (90 each,
// spoilDay 56) + gear. Daily-start: kcal 2310, grapes gone, gear kept.
{
  const fu = pack(270, [st('Muscadine Grapes', 3, 90, 56), gear('Bow'), gear('Multitool')]);
  const ds = pack(0, [gear('Bow'), gear('Multitool')]);
  const m = packPinnedMeal(fu, ds);
  check('17021/52 shape drop 270', m.dropKcal === 270, JSON.stringify(m));
  check('17021/52 lost grapes 3/270', m.lost.length === 1 && m.lost[0].name === 'Muscadine Grapes' &&
    m.lost[0].unitsLost === 3 && m.lost[0].kcalLost === 270, JSON.stringify(m.lost));
  check('17021/52 foodNames grapes', JSON.stringify(m.foodNames) === JSON.stringify(['Muscadine Grapes']));
}
{
  // Exact-chain rule disqualifies this shape (the adaptation's premise):
  // pack drop 270 != kcal gain 2182, yet the pack meal is real.
  const fu = { scholarDay: 53, kcal: 128, pack: pack(270, [st('Muscadine Grapes', 3, 90, 56)]) };
  const ds = { kcal: 2310, pack: pack(0, []) };
  const q = qualifyUpkeepMeal(fu, ds, { ate: false, skip: 'no-pack-food' });
  check('17021/52 chain inexact (pantry-mixed)', q.qualifies === false && q.reason === 'kcal-chain-inexact',
    JSON.stringify(q));
  check('17021/52 pack meal still detected', packPinnedMeal(fu.pack, ds.pack).dropKcal === 270);
}
{
  // Partial loss: 1 of 3 units eaten.
  const fu = pack(270, [st('Muscadine Grapes', 3, 90, 56)]);
  const ds = pack(180, [st('Muscadine Grapes', 2, 90, 56)]);
  const m = packPinnedMeal(fu, ds);
  check('partial loss 90', m.dropKcal === 90 && m.lost[0].unitsLost === 1, JSON.stringify(m));
}
{
  // Nothing lost: pack intact.
  const fu = pack(270, [st('Muscadine Grapes', 3, 90, 56)]);
  const ds = pack(270, [st('Muscadine Grapes', 3, 90, 56)]);
  check('no loss no meal', packPinnedMeal(fu, ds).dropKcal === 0);
}
{
  // Inedible stacks and gear never contribute, even when removed.
  const fu = pack(0, [{ name: 'Unknown Nuts', units: 3, kcalEach: 0, edible: false, foodState: 'unknown', spoilDay: 56 },
    gear('Bow')]);
  const ds = pack(0, []);
  check('inedible removal no meal', packPinnedMeal(fu, ds).dropKcal === 0);
}
{
  // Missing daily-start pack: no meal (never crash, never invent).
  const fu = pack(270, [st('Muscadine Grapes', 3, 90, 56)]);
  check('missing ds pack no meal', packPinnedMeal(fu, null).dropKcal === 0);
}
{
  // Missing first-upkeep pack: no meal.
  check('missing fu pack no meal', packPinnedMeal(null, pack(0, [])).dropKcal === 0);
}

// ---- narration verdict window rules ----
{
  const n = classifyPackMealNarration(
    ['You eat Muscadine Grapes (270 kcal).', 'Hunger gnaws.'], [], ['Muscadine Grapes']);
  check('named upkeep line NARRATED', n.verdict === 'NARRATED' && n.upkeepNamedLines.length === 1, JSON.stringify(n));
}
{
  const n = classifyPackMealNarration(['You eat (270 kcal).'], [], ['Muscadine Grapes']);
  check('unnamed upkeep line NARRATED unnamed', n.verdict === 'NARRATED' && n.upkeepNamedLines.length === 0, JSON.stringify(n));
}
{
  const n = classifyPackMealNarration(['Nothing edible.', 'Drank clean water.'], [], ['Muscadine Grapes']);
  check('no eat line SILENT', n.verdict === 'SILENT', JSON.stringify(n));
}
{
  // Daily-only eat line NEVER counts: the meal window is upkeep.
  const n = classifyPackMealNarration(['Nothing edible.'], ['You eat Muscadine Grapes (270 kcal).'], ['Muscadine Grapes']);
  check('daily-only eat line still SILENT', n.verdict === 'SILENT' && n.dailyEatLines.length === 1, JSON.stringify(n));
}
{
  check('eat line rejects gather', !isEatLine('You work the patch: 8× Muscadine Grapes.'));
  check('namesFood case-insensitive', namesFood('You eat muscadine grapes (270 kcal).', ['Muscadine Grapes']));
}

// ---- morning-window join with stacks ----
{
  const inst = {
    firstUpkeeps: [{ scholarDay: 53, kcal: 128,
      pack: pack(270, [st('Muscadine Grapes', 3, 90, 56), gear('Bow')]) }],
    bankfoodMornings: [{ loopDay: 53, ate: false, skip: 'no-pack-food', kcalBefore: 2310 }],
    events: [
      { kind: 'upkeep', lines: ['You eat Muscadine Grapes (270 kcal).'] },
      { kind: 'upkeep', lines: ['Drank clean water.'] },
      { kind: 'daily', loopDay: 53, scholarDay: 53, kcalBefore: 2310,
        packBefore: pack(0, [gear('Bow')]),
        pos: { inside: false, tile: 'thicket', mapPx: 7, mapPy: 0 },
        lines: ['Travel 1 tile to thicket.'] },
    ],
  };
  const ws = packWindows(inst);
  check('join one window', ws.length === 1, String(ws.length));
  const w = ws[0];
  check('join loopDay 53 scholarDay 53', w.loopDay === 53 && w.scholarDay === 53);
  check('join pack meal 270', w.packMeal && w.packMeal.dropKcal === 270, JSON.stringify(w.packMeal));
  check('join narration NARRATED named', w.packNarration && w.packNarration.verdict === 'NARRATED' &&
    w.packNarration.upkeepNamedLines.length === 1, JSON.stringify(w.packNarration));
  check('join chain inexact recorded', w.chain && w.chain.reason === 'kcal-chain-inexact', JSON.stringify(w.chain));
  check('join morning phase recorded', w.morningPhase && w.morningPhase.skip === 'no-pack-food' &&
    w.morningPhase.kcalBefore === 2310, JSON.stringify(w.morningPhase));
  check('join wake away thicket', w.wakeInsideHaven === false && w.wakeTileType === 'thicket');
}
{
  // No pack meal -> packNarration null, never a verdict.
  const inst = {
    firstUpkeeps: [{ scholarDay: 52, kcal: 1070, pack: pack(0, [gear('Bow')]) }],
    bankfoodMornings: [{ loopDay: 52, ate: false, skip: 'no-pack-food', kcalBefore: 2098 }],
    events: [
      { kind: 'upkeep', lines: ['Nothing edible.'] },
      { kind: 'daily', loopDay: 52, scholarDay: 52, kcalBefore: 2098,
        packBefore: pack(0, [gear('Bow')]), pos: { inside: false, tile: 'thicket', mapPx: 7, mapPy: 0 },
        lines: [] },
    ],
  };
  const ws = packWindows(inst);
  check('no meal null narration', ws.length === 1 && ws[0].packMeal.dropKcal === 0 && ws[0].packNarration === null);
}

// ---- corpus checks (env-gated) ----
if (process.env.UPKEEPBF52_CORPUS_CHECK === '1') {
  const dir = process.env.UPKEEPBF52_CORPUS_DIR;
  if (!dir) { console.log('FAIL corpus dir unset'); fail++; }
  else {
    const files = fs.readdirSync(dir).filter((x) => /^upkeepbf52-a-s\d+\.json$/.test(x)).sort();
    check('corpus has 17021 file', files.indexOf('upkeepbf52-a-s17021.json') !== -1, JSON.stringify(files));
    if (files.indexOf('upkeepbf52-a-s17021.json') !== -1) {
      const inst = JSON.parse(fs.readFileSync(path.join(dir, 'upkeepbf52-a-s17021.json'), 'utf8'));
      const ws = packWindows(inst);
      const w53 = ws.find((w) => w.loopDay === 53 && w.scholarDay === 53);
      check('corpus has loopDay 53 window', !!w53);
      if (w53) {
        check('corpus 53 first-upkeep kcal 128', w53.firstUpkeep && w53.firstUpkeep.kcal === 128,
          JSON.stringify(w53.firstUpkeep));
        check('corpus 53 pack meal 270 grapes', w53.packMeal && w53.packMeal.dropKcal === 270 &&
          w53.packMeal.foodNames.indexOf('Muscadine Grapes') !== -1, JSON.stringify(w53.packMeal));
        check('corpus 53 daily-start kcal 2310', w53.dailyStart && w53.dailyStart.kcal === 2310,
          JSON.stringify(w53.dailyStart));
        check('corpus 53 morning phase no-pack-food', w53.morningPhase && w53.morningPhase.skip === 'no-pack-food' &&
          w53.morningPhase.ate === false, JSON.stringify(w53.morningPhase));
        check('corpus 53 verdict computed', w53.packNarration &&
          (w53.packNarration.verdict === 'NARRATED' || w53.packNarration.verdict === 'SILENT'),
          JSON.stringify(w53.packNarration && w53.packNarration.verdict));
      }
    }
  }
}

console.log(`\nupkeepbf52 proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
