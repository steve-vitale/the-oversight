// test-garden-b.js — proof for the gardening first-numbers instrument
// (arm sim-garden-b, run fleshout-loop-b-20261111T0025Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-garden-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const GI = require(path.join(REPO, 'scripts', 'gardenb-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'gardenb-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Pure classifier fixtures (no game load) ----
(function () {
  eq(GI.classifyHarvestPath('at Object.harvestGarden (x) | at foo'), 'player-harvest', 'A1 harvest player-harvest');
  eq(GI.classifyHarvestPath('at Object.resolveOneAssignment (x)'), 'npc-duty', 'A2 harvest npc-duty');
  eq(GI.classifyHarvestPath('at harvestGarden (x) | at resolveOneAssignment (x)'), 'player-harvest', 'A3 harvest player wins over duty');
  eq(GI.classifyHarvestPath('at somethingElse (x)'), 'other', 'A4 harvest other');
  eq(GI.classifyHarvestPath(''), 'other', 'A5 harvest empty stack other');
  eq(GI.classifyMethodPath('at foo (scripts/policies/competent.js:1:1)'), 'policy', 'A6 method policy origin');
  eq(GI.classifyMethodPath('at Game.tendGarden (src/js/game.js:1:1)'), 'internal', 'A7 method internal origin');
  eq(GI.classifyTeachPath('at Object.sowPlot (x) | at foo'), 'guided-sow', 'A8 teach guided-sow');
  eq(GI.classifyTeachPath('at firesideTeaching (x)'), 'fireside', 'A9 teach fireside');
  eq(GI.classifyTeachPath('at somethingElse (x)'), 'somethingElse', 'A10 teach first frame');
})();

// ---- B. Analyzer fixtures (no game load) ----
(function () {
  const seed = {
    seed: 180217, days: 100, gameDays: 100, endReason: 'survived', won: false,
    scaleRank: 'village', maxWave: 2, standing: 12, endPantryKcal: 5000, deaths: [],
    instrumentErrors: [], wrapLive: { gardenHarvestTaken: true },
    harvests: [
      { pid: 'wild_strawberry', path: 'npc-duty', kcalNominal: 800, units: 32, origin: { ordinary: 1 }, weeds: 0, legacy: false },
      { pid: 'wild_strawberry', path: 'player-harvest', kcalNominal: 1200, units: 32, origin: { assisted: 1 }, weeds: 0, legacy: false },
      { pid: 'sweet_potato', path: 'npc-duty', kcalNominal: 5000, units: 30, origin: { legacy: 1 }, weeds: 4, legacy: true },
    ],
    actions: [
      { action: 'makePlot', ok: true }, { action: 'makePlot', ok: false },
      { action: 'sowPlot', pid: 'wild_strawberry', guided: true, ok: true },
      { action: 'tendGarden', liveBefore: 2, kcalPaid: 40 },
      { action: 'gardenMaintain', vid: 'v1', plotsChanged: 2, throttle: false },
      { action: 'gardenMaintain', vid: 'v1', plotsChanged: 1, throttle: true },
      { action: 'cultivateGarden', vid: 'v1', source: 'green_thumb', bedsAffected: 2, ok: true },
      { action: 'reclaimGarden', vid: null, ok: true },
      { action: 'harvestGarden', ripeBefore: 1, plotsTaken: 1 },
    ],
    teaches: [
      { day: 3, teacher: 'v1', plant: 'wild_strawberry', outcome: 'taught', path: 'guided-sow' },
      { day: 5, teacher: 'v2', plant: 'sweet_potato', outcome: 'null', path: 'fireside' },
    ],
    preps: [{ day: 4, method: 'cookFood', pid: 'sweet_potato' }],
    eats: [
      { via: 'eatOne', garden: true, ateKcal: 400 },
      { via: 'eat', garden: false, ateKcal: 200 },
      { via: 'tele-eat', garden: null, ateKcal: 600 },
    ],
    draws: [
      { cook: false, taken: 1000, gardenKcal: 300, byState: { none: 1000 } },
      { cook: true, taken: 500, gardenKcal: 0, byState: { none: 500 } },
    ],
    deeds: [{ deed: 'gardening', who: 'v1' }, { deed: 'gardening', who: 'player' }],
    daily: [
      { day: 1, plots: { beds: 2, planted: 1, ripe: 0, ripeSafe: 0, ripeUnsafe: 0, unplanted: 1, dead: 0 },
        pantryGarden: { total: 0, byOrigin: {} }, packGarden: { total: 0, byOrigin: {} },
        gardeners: { v1: { occ: 'farmer', reps: 1, steps: 0, known: 3, magic: null } },
        scholarPlants: {}, foodXp: { v1: { preserver: 1 } }, gardenDuty: [{ vid: 'v1', occ: 'farmer' }], keeper: 'v1' },
      { day: 2, plots: { beds: 2, planted: 2, ripe: 1, ripeSafe: 1, ripeUnsafe: 0, unplanted: 0, dead: 0 },
        pantryGarden: { total: 800, byOrigin: { ordinary: 800 } }, packGarden: { total: 1200, byOrigin: { assisted: 1200 } },
        gardeners: { v1: { occ: 'farmer', reps: 9, steps: 1, known: 3, magic: ['green_thumb:1'] } },
        scholarPlants: { wild_strawberry: 1 }, foodXp: { v1: { preserver: 1 } }, gardenDuty: [{ vid: 'v1', occ: 'farmer' }], keeper: 'v1' },
    ],
    gardenEvents: {
      resolutions: [{ day: 1, vid: 'v1', throttle: false }, { day: 2, vid: 'v1', throttle: true }],
      assigns: [{ day: 1, vid: 'v1', ok: true }],
      keeperTurns: [{ day: 1, keeper: 'v1' }],
      keeperSets: [{ day: 1, vid: 'v1', ok: true }],
      npcSows: [{ day: 1, vid: 'v1', msg: 'V1 sowed Wild strawberry in the empty plot — seed gathered during garden duty.' }],
      gardenInflows: [
        { day: 1, door: 'stock', name: 'Garden harvest', kcal: 800, gardenShares: true },
        { day: 2, door: 'deposit', name: 'Wild strawberry', kcal: 1200, gardenShares: true },
      ],
    },
    inflows: [
      { door: 'stock', name: 'Garden harvest', kcal: 800 },
      { door: 'stock', name: 'Foraged food', kcal: 2000 },
      { door: 'stock', name: 'Fish catch', kcal: 500 },
      { door: 'deposit', name: 'Wild strawberry', kcal: 1200 },
      { door: 'pantryAdd', name: 'Game meat', kcal: 0, added: false },
    ],
    gardenSays: [{ day: 1, line: 'V1 works the garden' }],
  };
  const s = AN.perSeed(seed);
  eq(s.harvestsByCrop.wild_strawberry, 2, 'B1 harvests by crop');
  eq(s.harvestKcalByCrop.wild_strawberry, 2000, 'B2 harvest kcal by crop');
  eq(s.harvestKcalByPath['npc-duty'], 5800, 'B3 harvest kcal npc-duty');
  eq(s.harvestOther, 0, 'B4 no other harvests');
  eq(s.harvestWeedyCount, 1, 'B5 weedy harvest counted');
  eq(s.harvestLegacyKcal, 5000, 'B6 legacy kcal');
  eq(s.harvestOriginKcal.assisted, 1200, 'B7 assisted origin kcal');
  eq(s.actionsByAction.makePlot, 2, 'B8 actions by action');
  eq(s.makesOk, 1, 'B9 makes ok');
  eq(s.sowsPlayerGuided, 1, 'B10 guided sow');
  eq(s.tendsNpcPlots, 3, 'B11 npc tend plots');
  eq(s.cultivateBeds, 2, 'B12 cultivate beds');
  eq(s.resolutions, 2, 'B13 resolutions');
  eq(s.resolutionsThrottled, 1, 'B14 throttled resolution');
  eq(s.npcSows, 1, 'B15 npc sows');
  eq(s.gardenInflowKcal, 2000, 'B16 garden inflow kcal');
  eq(s.inflowGarden, 800, 'B17 inflow Garden harvest');
  eq(s.inflowForage, 2000, 'B18 inflow forage');
  eq(s.inflowTotal, 4500, 'B19 inflow total (pantryAdd refused excluded)');
  eq(s.eatenGardenKcal, 400, 'B20 scholar garden kcal eaten');
  eq(s.teleEatTotal, 600, 'B21 tele eat total');
  eq(s.drawGardenKcal, 300, 'B22 meal garden kcal drawn');
  eq(s.teachesByPath['guided-sow'], 1, 'B23 teaches by path');
  eq(s.practiceMax.v1, 9, 'B24 practice max reps');
  eq(s.practiceStepsEnd.v1, 1, 'B25 practice steps end');
  eq(s.deedsByDeedWho['gardening:v1'], 1, 'B26 deeds by who');
  eq(s.pantryGardenPeak, 800, 'B27 pantry garden peak');
  eq(s.packGardenPeak, 1200, 'B28 pack garden peak');
  eq(s.plotDays.planted, 3, 'B29 plot-days planted');
  eq(s.plotDays.ripe, 1, 'B30 plot-days ripe');
  eq(s.foodXpGardenerKeys, 0, 'B31 no gardener foodXp key');
  eq(s.gardenDutyHolders['v1|farmer'].days, 2, 'B32 duty holder days');
  eq(s.keeperDays.v1, 2, 'B33 keeper days');
  const p = AN.pool([s, s]);
  eq(p.harvestKcalByCrop.wild_strawberry, 4000, 'B34 pool sums');
  eq(p.eatRecon.teleTotal, 1200, 'B35 pool eat recon tele');
  eq(p.eatRecon.wrapTotal, 1200, 'B36 pool eat recon wrap');
  // Neutrality comparison helper is exercised live in section E.
})();

// ---- C. Live instrument fixtures (one loaded game) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180217, mode: 'gardenb-test', fullTelemetry: false });
  await setupGame(Game);
  const gi = GI.install(Game);
  const t = gi.t;
  try {
    const plants = Game.data.plants || [];
    const shoot = plants.find(function (p) { return p.form === 'shoots' && (p.caloriesPerUnit || 0) > 0; })
      || plants.find(function (p) { return (p.caloriesPerUnit || 0) > 0; });
    ok(!!shoot, 'C0 fixture shoot plant found', shoot && shoot.id);
    const day = (Game.state.scholar || {}).day || 1;
    // C1: gardenHarvestTaken records pid + nominal kcal + ordinary origin.
    const plot = { pid: shoot.id, plantedDay: 1, lastHarvest: 0, weeds: 0, dead: false,
      magicGrowth: 0, magicYield: 1,
      cultivation: { version: 1, maturityDays: 30, regrowDays: 28, units: 24, singleHarvest: false } };
    const expectUnits = Game.gardenHarvestUnits(plot);
    const expectKcal = Game.plotYieldKcal(plot);
    function harvestGarden() { return Game.gardenHarvestTaken(plot, day); }
    harvestGarden();
    const h1 = t.harvests[t.harvests.length - 1];
    ok(h1 && h1.pid === shoot.id && h1.path === 'player-harvest' && h1.kcalNominal === expectKcal
      && h1.units === expectUnits && h1.origin && h1.origin.ordinary === 1, 'C1 harvestTaken player-harvest ordinary', h1);
    // C2: assisted origin (magic growth/yield set).
    const plotA = { pid: shoot.id, plantedDay: 1, lastHarvest: 0, weeds: 0, dead: false,
      magicGrowth: 4, magicYield: 1.5,
      cultivation: { version: 1, maturityDays: 30, regrowDays: 28, units: 24, singleHarvest: false } };
    function resolveOneAssignment() { return Game.gardenHarvestTaken(plotA, day); }
    resolveOneAssignment();
    const h2 = t.harvests[t.harvests.length - 1];
    ok(h2 && h2.path === 'npc-duty' && h2.origin && h2.origin.assisted === 1 && h2.kcalNominal > expectKcal,
      'C2 harvestTaken npc-duty assisted', h2);
    // C3: legacy plot (no cultivation) keeps the old yield shape.
    const plotL = { pid: shoot.id, plantedDay: 1, lastHarvest: 0, weeds: 0, dead: false };
    Game.gardenHarvestTaken(plotL, day);
    const h3 = t.harvests[t.harvests.length - 1];
    ok(h3 && h3.legacy === true && h3.path === 'other', 'C3 harvestTaken legacy + direct call other (expected)', h3);
    // C4: sowPlot wrap records the attempt (engine may refuse — the wrap
    // still records the attempt, like cookfirst C10).
    const beforeSow = t.actions.filter(function (r) { return r.action === 'sowPlot'; }).length;
    Game.sowPlot(shoot.id);
    const afterSow = t.actions.filter(function (r) { return r.action === 'sowPlot'; }).length;
    const sowRec = t.actions.filter(function (r) { return r.action === 'sowPlot'; }).pop();
    ok(afterSow === beforeSow + 1 && sowRec && sowRec.pid === shoot.id, 'C4 sowPlot wrap records attempt', sowRec);
    // C5: makePlot wrap records the attempt.
    const beforeMake = t.actions.filter(function (r) { return r.action === 'makePlot'; }).length;
    Game.makePlot();
    const afterMake = t.actions.filter(function (r) { return r.action === 'makePlot'; }).length;
    ok(afterMake === beforeMake + 1, 'C5 makePlot wrap records attempt', { before: beforeMake, after: afterMake });
    // C6: tendGarden wrap records the attempt.
    const beforeTend = t.actions.filter(function (r) { return r.action === 'tendGarden'; }).length;
    Game.tendGarden();
    const afterTend = t.actions.filter(function (r) { return r.action === 'tendGarden'; }).length;
    ok(afterTend === beforeTend + 1, 'C6 tendGarden wrap records attempt', { before: beforeTend, after: afterTend });
    // C7: teachPlant wrap records teacher + plant + outcome.
    const ppl = (typeof Game.villagePeople === 'function') ? Game.villagePeople() : [];
    const anyVid = (ppl[0] && ppl[0].id) || 'nobody';
    Game.teachPlant(anyVid, shoot.id);
    const trec = t.teaches[t.teaches.length - 1];
    ok(trec && trec.teacher === anyVid && trec.plant === shoot.id && typeof trec.outcome === 'string',
      'C7 teachPlant wrap', trec);
    // C8: cultivateGarden wrap records the attempt (no ability -> false).
    const beforeCult = t.actions.filter(function (r) { return r.action === 'cultivateGarden'; }).length;
    Game.cultivateGarden();
    const afterCult = t.actions.filter(function (r) { return r.action === 'cultivateGarden'; }).length;
    const crec = t.actions.filter(function (r) { return r.action === 'cultivateGarden'; }).pop();
    ok(afterCult === beforeCult + 1 && crec && crec.ok === false, 'C8 cultivateGarden wrap records refused attempt', crec);
    // C9: gardenMaintain wrap records vid + plots changed.
    Game.gardenMaintain(anyVid);
    const mrec = t.actions.filter(function (r) { return r.action === 'gardenMaintain'; }).pop();
    ok(mrec && mrec.vid === anyVid && typeof mrec.plotsChanged === 'number', 'C9 gardenMaintain wrap', mrec);
    // C10: reclaimGarden wrap records the attempt (no dead bed -> false).
    Game.reclaimGarden();
    const rrec = t.actions.filter(function (r) { return r.action === 'reclaimGarden'; }).pop();
    ok(rrec && rrec.ok === false, 'C10 reclaimGarden wrap records refused attempt', rrec);
    // C11: garden-capture assignTask wrap is live in this chain.
    Game.assignTask(anyVid, 'garden');
    const ev = gi.gardenEvents();
    ok(ev && (ev.assigns || []).length >= 1 && ev.assigns[ev.assigns.length - 1].vid === anyVid,
      'C11 garden-capture assignTask live', ev && ev.assigns && ev.assigns.length);
    // C12: setGardenKeeper wrap (garden-capture) records the call.
    Game.setGardenKeeper(null);
    const ev2 = gi.gardenEvents();
    ok(ev2 && (ev2.keeperSets || []).length >= 1, 'C12 garden-capture setGardenKeeper live',
      ev2 && ev2.keeperSets && ev2.keeperSets.length);
    // C13: eatOne wrap attributes kcal by gardenShares.
    const sch = Game.state.scholar;
    sch.kcal = 0;
    const gfood = { foodKind: 'plant', foodState: 'ready', kcalEach: 100, units: 2, edible: true,
      safe: true, name: 'Garden greens', plantId: shoot.id, gardenShares: { ordinary: 1 } };
    sch.inventory.push(gfood);
    const idx = sch.inventory.length - 1;
    Game.eatOne(idx);
    const er = t.eats.filter(function (r) { return r.via === 'eatOne'; }).pop();
    ok(er && er.garden === true && er.ateKcal > 0, 'C13 eatOne attributes garden kcal', er);
    // C14: pantryDraw wrap records garden kcal drawn. Sort is fresh-first,
    // then kcalEach ascending — so the garden item must be the CHEAPER one
    // to be drawn first (want 400: 2x100 garden + 1x300 wild = 500 taken).
    const v = Game.state.village;
    v.pantry = [
      { foodKind: 'plant', foodState: 'ready', kcalEach: 100, units: 2, name: 'Garden greens',
        spoilDay: 9999, gardenShares: { ordinary: 1 } },
      { foodKind: 'plant', foodState: 'ready', kcalEach: 300, units: 5, name: 'Wild greens', spoilDay: 9999 },
    ];
    const dr = Game.pantryDraw(v, 400, { cook: false });
    const drec = t.draws[t.draws.length - 1];
    ok(drec && drec.cook === false && drec.taken === (dr && dr.taken) && drec.taken === 500 && drec.gardenKcal === 200,
      'C14 pantryDraw wrap garden kcal', drec);
    // C15: snapshot runs and reads plot/stock shapes.
    const snap = gi.snapshot();
    ok(snap && snap.plots && typeof snap.pantryGarden === 'object' && typeof snap.packGarden === 'object'
      && typeof snap.gardeners === 'object' && typeof snap.inflowByName === 'object',
      'C15 daily snapshot shape', Object.keys(snap || {}));
    ok(t.instrumentErrors.length === 0, 'C16 zero instrument errors in fixtures', t.instrumentErrors);
    ok(t.wrapLive.gardenHarvestTaken && t.wrapLive.sowPlot && t.wrapLive.teachPlant
      && t.wrapLive.eatOne && t.wrapLive.pantryDraw,
      'C17 wraps live', t.wrapLive);
  } finally {
    gi.uninstall();
  }
  return true;
}

// ---- D. Determinism miniature: same seed twice, byte-identical garden counters ----
async function determinismMini() {
  async function mini(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'gardenb-mini', fullTelemetry: false });
    await setupGame(Game);
    const gi = GI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { gi.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 40, manifest: undefined, sampleEvery: 30 }); });
    const ev = gi.gardenEvents();
    const out = {
      days: result.days,
      harvests: gi.t.harvests.map(function (r) { return [r.day, r.pid, r.path, r.kcalNominal, r.units]; }),
      actions: gi.t.actions.map(function (r) { return [r.day, r.action, r.pid || r.vid, r.ok]; }),
      teaches: gi.t.teaches.map(function (r) { return [r.day, r.teacher, r.plant, r.outcome, r.path]; }),
      eats: gi.t.eats.map(function (r) { return [r.day, r.via, r.garden, r.ateKcal]; }),
      draws: gi.t.draws.map(function (r) { return [r.day, r.cook, r.taken, r.gardenKcal]; }),
      dailyPlots: gi.t.daily.map(function (s) { return [s.day, s.plots ? s.plots.beds : null, s.plots ? s.plots.planted : null, s.plots ? s.plots.ripe : null, s.plots ? s.plots.dead : null]; }),
      gardenEvents: {
        assigns: (ev.assigns || []).length, resolutions: (ev.resolutions || []).length,
        makes: (ev.makes || []).length, sows: (ev.sows || []).length,
        npcSows: (ev.npcSows || []).length, keeperSets: (ev.keeperSets || []).length,
      },
    };
    gi.uninstall();
    return out;
  }
  const a = await mini(180217);
  const b = await mini(180217);
  ok(JSON.stringify(a) === JSON.stringify(b), 'D1 determinism miniature byte-identical',
    { aDays: a.days, bDays: b.days, aH: a.harvests.length, bH: b.harvests.length });
  ok(a.actions.length > 0 || a.gardenEvents.assigns > 0 || a.gardenEvents.resolutions > 0,
    'D2 miniature observed live garden activity',
    { actions: a.actions.length, assigns: a.gardenEvents.assigns, resolutions: a.gardenEvents.resolutions });
  return a;
}

// ---- E. Neutrality miniature: ON vs OFF, short horizon ----
async function neutralityMini() {
  async function mini(seed, instOn) {
    const { Game } = await loadGame({ seed: seed, mode: 'gardenb-mini', fullTelemetry: false });
    await setupGame(Game);
    let gi = null;
    if (instOn) gi = GI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (gi) gi.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 20, manifest: undefined, sampleEvery: 30 }); });
    let pantryKcal = 0;
    try { pantryKcal = ((Game.state.village || {}).pantry || []).reduce(function (x, i) { return x + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) {}
    const deaths = (result.samples.deaths || []).length;
    if (gi) gi.uninstall();
    return { days: result.days, pantryKcal: pantryKcal, deaths: deaths };
  }
  const on = await mini(180217, true);
  const off = await mini(180217, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths, 'E1 neutrality miniature identical', { on: on, off: off });
}

(async function () {
  try {
    await liveFixtures();
    await determinismMini();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\ngardenb proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
