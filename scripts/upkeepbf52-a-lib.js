'use strict';
// upkeepbf52-a-lib.js — pack-pinned upkeep-meal adjudication for
// sim-upkeepbf52-a (oversight-flesh-out-loop, axis food-economy).
//
// ADAPTATION vs the 2115Z arm (scripts/upkeepbreakfast-a-lib.js),
// disclosed in the prereg before any judged sim: the 17021/52 case
// is kcal-chain-INEXACT by construction (pack drop 270 kcal, kcal
// gain 2182 kcal — competentEat's pantry draws add 1912 kcal
// inside the same upkeep window), so the 2115Z exact-chain rule
// would refuse to judge the very case this arm adjudicates. The
// pack evidence alone pins the meal: first-upkeep stacks ->
// daily-start stacks, with the daily-entry morning phase running
// AFTER the daily-start snapshot, so only the upkeep window can
// have removed the grapes. The exact-chain verdict is still
// computed (via the base lib) and reported, but it does not gate
// the primary verdict.
//
// A pack-pinned meal exists when pack edible kcal drops across
// the upkeep window (first-upkeep snapshot -> daily-start
// snapshot) by > 0. The narration verdict reads ONLY the upkeep
// window's say lines: NARRATED iff >= 1 upkeep eat line
// ("You eat ..."); NAMED iff an upkeep eat line names a lost
// food. Daily-call eat lines are quoted separately and NEVER
// counted — a later-day eat is not breakfast narration. The
// verdict is computed from captured lines, never assumed: the
// proof test asserts the computation, not the outcome.
const base = require('./upkeepbreakfast-a-lib');
const isEatLine = base.isEatLine;
const namesFood = base.namesFood;

function stackKey(s) { return String((s && s.name) || ''); }

// Compare first-upkeep pack stacks to daily-start pack stacks.
// Returns { dropKcal, lost: [{name, unitsLost, kcalLost}], foodNames }.
// A stack counts only when edible (kcalEach > 0 and edible !== false).
// Units are matched by name; a stack absent at daily-start lost all
// its units. Non-edible gear/lumps never contribute.
function packPinnedMeal(fuPack, dsPack) {
  const out = { dropKcal: 0, lost: [], foodNames: [] };
  if (!fuPack || !Array.isArray(fuPack.stacks)) return out;
  // A missing daily-start snapshot is UNKNOWN, never a meal: without
  // the after-state, "all food lost" would be invented, not measured.
  // (An present-but-empty stacks array is a real measurement: the
  // pack was emptied.)
  if (!dsPack || !Array.isArray(dsPack.stacks)) return out;
  const dsByName = {};
  for (const s of dsPack.stacks) {
    if (s && s.name) dsByName[stackKey(s)] = s;
  }
  for (const s of fuPack.stacks) {
    if (!s || !s.name) continue;
    if (!((s.kcalEach || 0) > 0) || s.edible === false) continue;
    const ds = dsByName[stackKey(s)] || null;
    const dsUnits = ds ? (ds.units || 0) : 0;
    const lost = (s.units || 0) - dsUnits;
    if (lost > 0) {
      const kcalLost = lost * (s.kcalEach || 0);
      out.lost.push({ name: s.name, unitsLost: lost, kcalLost });
      out.dropKcal += kcalLost;
      if (out.foodNames.indexOf(s.name) === -1) out.foodNames.push(s.name);
    }
  }
  return out;
}

// Narration verdict for one morning window's upkeep lines.
// upkeepLines: all say lines from the window's upkeep calls.
// dailyLines: the daily call's say lines (quoted, never counted).
function classifyPackMealNarration(upkeepLines, dailyLines, foodNames) {
  const up = (upkeepLines || []).filter(isEatLine);
  const dy = (dailyLines || []).filter(isEatLine);
  return {
    verdict: up.length > 0 ? 'NARRATED' : 'SILENT',
    upkeepEatLines: up,
    upkeepNamedLines: up.filter((l) => namesFood(l, foodNames)),
    dailyEatLines: dy,
    dailyNamedLines: dy.filter((l) => namesFood(l, foodNames)),
  };
}

// Join one seed instance's chronological events into morning windows
// WITH pack stacks carried through (the base lib's morningWindows
// drops stacks from dailyStart, which the pack-pinned rule needs).
// A window opens at each daily event: the upkeep calls since the
// previous daily event (or start) are that morning's upkeep window,
// and the daily event's pre-daily snapshot is the daily-start state.
// Trailing upkeep calls with no following daily form no window.
function packWindows(inst) {
  const windows = [];
  let pending = [];
  for (const ev of (inst.events || [])) {
    if (ev.kind === 'upkeep') { pending.push(ev); continue; }
    if (ev.kind !== 'daily') continue;
    const scholarDay = ev.scholarDay;
    const firstUpkeep = (inst.firstUpkeeps || []).find((u) => u.scholarDay === scholarDay) || null;
    const morningPhase = (inst.bankfoodMornings || []).find((m) => m.loopDay === ev.loopDay) || null;
    const dailyStart = { kcal: ev.kcalBefore, pack: ev.packBefore };
    const chain = base.qualifyUpkeepMeal(firstUpkeep, dailyStart, morningPhase);
    const upkeepLines = [];
    for (const u of pending) for (const l of (u.lines || [])) upkeepLines.push(l);
    const packMeal = firstUpkeep
      ? packPinnedMeal(firstUpkeep.pack, ev.packBefore)
      : { dropKcal: 0, lost: [], foodNames: [] };
    const packNarration = packMeal.dropKcal > 0
      ? classifyPackMealNarration(upkeepLines, ev.lines || [], packMeal.foodNames)
      : null;
    windows.push({
      loopDay: ev.loopDay, scholarDay,
      wakeInsideHaven: (ev.pos ? ev.pos.inside : null),
      wakeTileType: (ev.pos ? ev.pos.tile : null),
      wakeMap: (ev.pos ? (ev.pos.mapPx + ',' + ev.pos.mapPy) : null),
      firstUpkeep: firstUpkeep ? { scholarDay: firstUpkeep.scholarDay, kcal: firstUpkeep.kcal,
        packEdible: firstUpkeep.pack ? firstUpkeep.pack.edibleKcal : null,
        stacks: firstUpkeep.pack ? firstUpkeep.pack.stacks : null } : null,
      dailyStart: { kcal: dailyStart.kcal,
        packEdible: dailyStart.pack ? dailyStart.pack.edibleKcal : null },
      upkeepCallCount: pending.length,
      chain, packMeal, packNarration,
      upkeepLines, dailyLines: ev.lines || [],
      morningPhase: morningPhase ? { ate: morningPhase.ate, skip: morningPhase.skip || null,
        kcalBefore: morningPhase.kcalBefore !== undefined ? morningPhase.kcalBefore : null } : null,
    });
    pending = [];
  }
  return windows;
}

function summarizePackMeals(windows) {
  const m = (windows || []).filter((w) => w.packMeal && w.packMeal.dropKcal > 0);
  return {
    windows: (windows || []).length,
    packMeals: m.length,
    narrated: m.filter((w) => w.packNarration && w.packNarration.verdict === 'NARRATED').length,
    silent: m.filter((w) => w.packNarration && w.packNarration.verdict === 'SILENT').length,
    exactChain: m.filter((w) => w.chain && w.chain.qualifies).length,
    pantryMixed: m.filter((w) => w.chain && w.chain.reason === 'kcal-chain-inexact').length,
  };
}

module.exports = { isEatLine, namesFood, stackKey, packPinnedMeal,
  classifyPackMealNarration, packWindows, summarizePackMeals,
  qualifyUpkeepMeal: base.qualifyUpkeepMeal,
  classifyNarration: base.classifyNarration,
  morningWindows: base.morningWindows,
  summarizeMornings: base.summarizeMornings };
