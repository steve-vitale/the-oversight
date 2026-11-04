'use strict';
// upkeepbreakfast-a-lib.js — pure upkeep-breakfast narration logic for
// sim-upkeepbreakfast-a (oversight-flesh-out-loop, axis food-economy).
// Shared by scripts/sweep-upkeepbreakfast-a.js (live sims),
// scripts/analyze-upkeepbreakfast-a.js, and
// scripts/test-upkeepbreakfast-a.js (proof), so the proof exercises
// the same classification code the verdict judges by. No RNG reads,
// no game-value writes: inputs are only read, never mutated.
//
// BACKGROUND (from evidence/2026-11-04/sim-bankretain-rerun-a.md §2/§4,
// NOT re-litigated here): seed 16505, loop-day 59 stranded evening,
// 540 kcal Muscadine Grapes carried into the night; first-upkeep
// snapshot (scholarDay 61) kcal 344 with the grapes intact; daily-entry
// morning phase (loop-day 60) kcalBefore 884, ate=false, skip
// 'no-pack-food'. The kcal chain 884-344=540 says the morning upkeep's
// competentEat ate the grapes. The bankretain corpus could NOT see
// upkeep lines: it recorded say lines only around daily(), and stored
// full day lines only on bankfood-evening rows — so its "the day opens
// with NO line about the grapes" was read off a corpus that never
// captured the upkeep window where the eating happened. This instrument
// closes that blind spot: the sweep records say lines per upkeep call
// AND per daily call, and the analyzer joins them to the kcal chain.
// Whether the meal is silent or narrated is an EMPIRICAL result of
// running the sweep, never an assumption baked into this lib: the
// narration verdict is computed from captured lines, and the proof
// test asserts the computation, not the outcome.
//
// QUALIFYING MORNING UPKEEP MEAL (chain-pinned, mechanism-settled):
// first-upkeep pack edible > 0 AND pack edible drops across the
// upkeep window (first-upkeep snapshot -> daily-start snapshot) AND
// the drop equals the kcal gain exactly. The exact chain pins the
// eating to the upkeep window: the daily-entry morning phase runs
// AFTER the daily-start snapshot, so it cannot have eaten anything
// in the chain, and a pantry/feast top-up inside upkeep would break
// the equality and disqualify (reported, never silently counted).
// NARRATION VERDICT (primary window = upkeep calls only): NARRATED
// if any upkeep-call line is an eat line ("You eat ..."); SILENT if
// none. Daily-call eat lines are reported separately and NEVER counted
// toward the verdict — a later-day eat is not breakfast narration —
// but they are quoted in the report so a reader can judge whether
// they refer to the morning meal. A named line (naming any food from
// the eaten stacks) is reported as a subset of eat lines.

function isEatLine(line) {
  return /you eat\b/i.test(String(line || ''));
}

function namesFood(line, foodNames) {
  const l = String(line || '').toLowerCase();
  for (const n of (foodNames || [])) {
    if (n && l.indexOf(String(n).toLowerCase()) !== -1) return true;
  }
  return false;
}

function edibleFoodNames(pack) {
  if (!pack || !Array.isArray(pack.stacks)) return [];
  const out = [];
  for (const s of pack.stacks) {
    if (s && (s.kcalEach || 0) > 0 && s.edible !== false && s.name && out.indexOf(s.name) === -1) out.push(s.name);
  }
  return out;
}

// Chain-pinned qualifying check. firstUpkeep: {kcal, pack}; dailyStart:
// {kcal, pack}; morningPhase: bankfood morning record or null.
function qualifyUpkeepMeal(firstUpkeep, dailyStart, morningPhase) {
  const base = { qualifies: false, reason: null, fuEdible: null, dsEdible: null,
    eaten: null, kcalGain: null, foodNames: [],
    morningPhaseAte: morningPhase ? !!morningPhase.ate : null,
    morningPhaseSkip: morningPhase ? (morningPhase.skip || null) : null };
  if (!firstUpkeep || !dailyStart) return Object.assign({}, base, { reason: 'missing-snapshot' });
  const fuEdible = firstUpkeep.pack ? firstUpkeep.pack.edibleKcal : null;
  const dsEdible = dailyStart.pack ? dailyStart.pack.edibleKcal : null;
  const fuKcal = firstUpkeep.kcal, dsKcal = dailyStart.kcal;
  if (fuEdible === null || dsEdible === null || fuKcal === null || dsKcal === null ||
      fuEdible === undefined || dsEdible === undefined) {
    return Object.assign({}, base, { reason: 'null-snapshot' });
  }
  const eaten = fuEdible - dsEdible;
  const kcalGain = dsKcal - fuKcal;
  const foodNames = edibleFoodNames(firstUpkeep.pack);
  const rec = Object.assign({}, base, { fuEdible, dsEdible, eaten, kcalGain, foodNames });
  if (!(fuEdible > 0)) return Object.assign({}, rec, { reason: 'no-edible-at-first-upkeep' });
  if (!(eaten > 0)) return Object.assign({}, rec, { reason: 'nothing-eaten-in-upkeep-window' });
  if (eaten !== kcalGain) return Object.assign({}, rec, { reason: 'kcal-chain-inexact' });
  return Object.assign({}, rec, { qualifies: true, reason: 'upkeep-eaten-exact-chain' });
}

function classifyNarration(upkeepLines, dailyLines, foodNames) {
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

// Join one seed instance's chronological events into morning windows.
// inst: {events: [{kind:'upkeep'|'daily', ...}], firstUpkeeps, bankfoodMornings}.
// A window opens at each daily event: the upkeep calls since the
// previous daily event (or start) are that morning's upkeep window,
// and the daily event's pre-daily snapshot is the daily-start state.
// Trailing upkeep calls with no following daily (game over mid-day)
// form no window and are dropped, never judged.
function morningWindows(inst) {
  const windows = [];
  let pending = [];
  for (const ev of (inst.events || [])) {
    if (ev.kind === 'upkeep') { pending.push(ev); continue; }
    if (ev.kind !== 'daily') continue;
    const scholarDay = ev.scholarDay;
    const firstUpkeep = (inst.firstUpkeeps || []).find((u) => u.scholarDay === scholarDay) || null;
    const morningPhase = (inst.bankfoodMornings || []).find((m) => m.loopDay === ev.loopDay) || null;
    const dailyStart = { kcal: ev.kcalBefore, pack: ev.packBefore };
    const chain = qualifyUpkeepMeal(firstUpkeep, dailyStart, morningPhase);
    const upkeepLines = [];
    for (const u of pending) for (const l of (u.lines || [])) upkeepLines.push(l);
    const narration = chain.qualifies
      ? classifyNarration(upkeepLines, ev.lines || [], chain.foodNames)
      : { verdict: null, upkeepEatLines: [], upkeepNamedLines: [], dailyEatLines: [], dailyNamedLines: [] };
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
      chain, narration,
      upkeepLines, dailyLines: ev.lines || [],
      morningPhase: morningPhase ? { ate: morningPhase.ate, skip: morningPhase.skip || null,
        kcalBefore: morningPhase.kcalBefore !== undefined ? morningPhase.kcalBefore : null } : null,
    });
    pending = [];
  }
  return windows;
}

function summarizeMornings(windows) {
  const q = (windows || []).filter((w) => w.chain && w.chain.qualifies);
  return {
    windows: (windows || []).length,
    qualifying: q.length,
    narrated: q.filter((w) => w.narration.verdict === 'NARRATED').length,
    silent: q.filter((w) => w.narration.verdict === 'SILENT').length,
    qualifyingAtHaven: q.filter((w) => w.wakeInsideHaven === true).length,
    qualifyingAway: q.filter((w) => w.wakeInsideHaven === false).length,
    qualifyingWakeUnknown: q.filter((w) => w.wakeInsideHaven !== true && w.wakeInsideHaven !== false).length,
  };
}

module.exports = { isEatLine, namesFood, edibleFoodNames, qualifyUpkeepMeal,
  classifyNarration, morningWindows, summarizeMornings };
