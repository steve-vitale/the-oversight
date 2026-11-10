// test-cookfirst-a.js — proof for the cooking first-numbers instrument
// (arm sim-cookfirst-a, run fleshout-20261110T1915Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-cookfirst-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const CI = require(path.join(REPO, 'scripts', 'cookfirst-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'cookfirst-analyze-20261110'));
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
  eq(CI.classifyTransformPath('at Object.cookFood (x) | at foo'), 'scholar-fire', 'A1 transform scholar-fire');
  eq(CI.classifyTransformPath('at Object.cookAll (x)'), 'batch', 'A2 transform batch');
  eq(CI.classifyTransformPath('at askSpecialist (x) | at cookFood (x)'), 'specialist', 'A3 transform specialist wins over cookFood');
  eq(CI.classifyTransformPath('at pantryDraw (x)'), 'village-meal', 'A4 transform village-meal');
  eq(CI.classifyTransformPath('at somethingElse (x)'), 'other', 'A5 transform other');
  eq(CI.classifyTransformPath(''), 'other', 'A6 transform empty stack other');
  eq(CI.classifyMethodPath('at foo (scripts/policies/competent.js:1:1)'), 'policy', 'A7 method policy origin');
  eq(CI.classifyMethodPath('at Game.cookFood (src/js/game.js:1:1)'), 'internal', 'A8 method internal origin');
})();

// ---- B. Analyzer fixtures (no game load) ----
(function () {
  const seed = {
    seed: 180201, days: 100, gameDays: 100, endReason: 'survived', won: false,
    scaleRank: 'village', maxWave: 2, standing: 12, endPantryKcal: 5000, deaths: [],
    instrumentErrors: [], wrapLive: { cookFood: true },
    transforms: [
      { path: 'scholar-fire', outcome: 'perfect', knows: true, rawTotal: 800, cookedTotal: 800, foodKind: 'meat' },
      { path: 'scholar-fire', outcome: 'burnt', knows: false, rawTotal: 500, cookedTotal: 200, foodKind: 'plant' },
      { path: 'village-meal', outcome: 'perfect', knows: true, rawTotal: 300, cookedTotal: 300, foodKind: 'plant' },
    ],
    methodCalls: [
      { method: 'cookFood', path: 'policy', spoiledRefused: false, rescuedKcal: 0 },
      { method: 'makePemmican', path: 'policy', spoiledRefused: false, rescuedKcal: 0, bars: 3, barKcal: 1800 },
      { method: 'preserveFood', path: 'policy', spoiledRefused: true, rescuedKcal: 400 },
    ],
    learns: [{ day: 3, tech: 'cook', source: 'trial', learned: true }],
    eats: [
      { via: 'eatOne', foodState: 'cooked', ateKcal: 400 },
      { via: 'eatOne', foodState: 'raw', ateKcal: 200 },
      { via: 'tele-eat', foodState: null, ateKcal: 600 },
    ],
    draws: [{ cook: false, taken: 1000, byState: { cooked: 600, raw: 400 }, cookedKcal: 0 }],
    deeds: [{ deed: 'cooking', who: 'player' }],
    daily: [
      { dutyBatches: 1, dutyKcal: 900, cookDuty: [{ vid: 'v1', occ: 'chef', preserver: 2 }], foodXp: { v1: { preserver: 1 } }, spoiledPresentKcal: 0 },
      { dutyBatches: 0, dutyKcal: 0, cookDuty: [{ vid: 'v1', occ: 'chef', preserver: 2 }], foodXp: { v1: { preserver: 3 } }, spoiledPresentKcal: 100 },
    ],
    cookSays: [{ day: 1, line: 'Cooked x' }],
  };
  const s = AN.perSeed(seed);
  eq(s.transformsByPath['scholar-fire'], 2, 'B1 transforms by path');
  eq(s.transformKcalByPath['scholar-fire'], 1000, 'B2 transform kcal by path');
  eq(s.transformOther, 0, 'B3 no other transforms');
  eq(s.methodCallsByMethod.makePemmican, 1, 'B4 method counts');
  eq(s.pemmicanBars, 3, 'B5 pemmican bars');
  eq(s.spoiledRefused, 1, 'B6 spoiled refused');
  eq(s.rescuedKcal, 400, 'B7 rescued kcal');
  eq(s.eatenKcalByState.cooked, 400, 'B8 eaten by state');
  eq(s.eatenCookedKcal, 400, 'B9 eaten cooked total');
  eq(s.eatenRawKcal, 200, 'B10 eaten raw total');
  eq(s.teleEatTotal, 600, 'B11 tele eat total');
  eq(s.dutyBatches, 1, 'B12 duty batches');
  eq(s.dutyKcal, 900, 'B13 duty kcal');
  eq(s.cookDutyDays, 2, 'B14 cook duty days');
  eq(s.foodXpDelta['v1:preserver'], 2, 'B15 foodXp delta');
  eq(s.deedsByDeedWho['cooking:player'], 1, 'B16 deeds');
  const p = AN.pool([s, s]);
  eq(p.transformKcalByPath['scholar-fire'], 2000, 'B17 pool sums');
  eq(p.eatRecon.teleTotal, 1200, 'B18 pool eat recon tele');
  eq(p.eatRecon.wrapTotal, 1200, 'B19 pool eat recon wrap');
  // Neutrality comparison helper is exercised live in section E.
})();

// ---- C. Live instrument fixtures (one loaded game) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180201, mode: 'cookfirst-test', fullTelemetry: false });
  await setupGame(Game);
  const ci = CI.install(Game);
  const t = ci.t;
  try {
    // C1: cookTransform records raw->cooked + outcome on meat (perfect = 100%).
    const meat = { foodKind: 'meat', foodState: 'cleaned', kcalEach: 400, units: 2, name: 'Venison (cleaned)' };
    const rMeat = Game.cookTransform(meat, { knows: true, outcome: { key: 'perfect', mult: 1.0 } });
    ok(rMeat && rMeat.cookedTotal === 800 && rMeat.rawTotal === 800, 'C1 cookTransform meat perfect 100%', rMeat);
    // C2: plant tuber unlocks at the fire (cooked > raw net).
    const tuber = (Game.data.plants || []).find(function (p) { return p.form === 'roots'; })
      || (Game.data.plants || []).find(function (p) { return p.form === 'shoots'; });
    if (tuber) {
      const plant = { foodKind: 'plant', plantId: tuber.id, rawKcal: 100, units: 2, kcalEach: 100, name: tuber.name || 'roots' };
      const rPlant = Game.cookTransform(plant, { knows: true, outcome: { key: 'perfect', mult: 1.0 } });
      ok(rPlant && rPlant.cookedTotal >= rPlant.rawTotal, 'C2 cookTransform plant unlocks', rPlant);
    } else {
      ok(false, 'C2 cookTransform plant unlocks (no roots/shoots plant in data)');
    }
    // C3: burnt outcome is 0.4x.
    const rBurnt = Game.cookTransform({ foodKind: 'meat', foodState: 'cleaned', kcalEach: 400, units: 1, name: 'M' }, { knows: true, outcome: { key: 'burnt', mult: 0.4 } });
    ok(rBurnt && rBurnt.cookedTotal === 160, 'C3 cookTransform burnt 0.4x', rBurnt);
    // C4: caller-path classification via named callers (stack-derived).
    function cookFood() { return Game.cookTransform({ foodKind: 'meat', foodState: 'cleaned', kcalEach: 100, units: 1, name: 'M' }, { knows: true, outcome: { key: 'perfect', mult: 1.0 } }); }
    function cookAll() { return Game.cookTransform({ foodKind: 'meat', foodState: 'cleaned', kcalEach: 100, units: 1, name: 'M' }, { knows: true, outcome: { key: 'perfect', mult: 1.0 } }); }
    function pantryDraw() { return Game.cookTransform({ foodKind: 'meat', foodState: 'cleaned', kcalEach: 100, units: 1, name: 'M' }, { knows: true, outcome: { key: 'perfect', mult: 1.0 } }); }
    cookFood(); cookAll(); pantryDraw();
    const paths = t.transforms.slice(-3).map(function (r) { return r.path; });
    ok(paths[0] === 'scholar-fire' && paths[1] === 'batch' && paths[2] === 'village-meal', 'C4 transform paths from stack', paths);
    // Direct test-file calls (C1–C3) have no engine caller path by
    // construction — they record 'other', which is expected there and
    // is the analyzer's GO check in the pilot, not an instrument error.
    const directOthers = t.transforms.slice(0, 3).filter(function (r) { return r.path === 'other'; }).length;
    ok(directOthers === 3, 'C5 direct calls record other (expected)', { directOthers: directOthers });
    // C6: learnTechnique wrap records rung + source.
    try { Game.state.codex.techniques = Game.state.codex.techniques || {}; Game.state.codex.techniques.render = false; } catch (e) {}
    const learned = Game.learnTechnique('render', 'trial');
    const lr = t.learns[t.learns.length - 1];
    ok(lr && lr.tech === 'render' && lr.source === 'trial' && lr.learned === learned, 'C6 learnTechnique wrap', lr);
    // C7: eatOne wrap attributes kcal by foodState.
    const sch = Game.state.scholar;
    sch.kcal = 0;
    const cooked = { foodKind: 'meat', foodState: 'cooked', kcalEach: 400, units: 2, edible: true, safe: true, name: 'Venison (cooked)' };
    sch.inventory.push(cooked);
    const idx = sch.inventory.length - 1;
    Game.eatOne(idx);
    const er = t.eats.filter(function (r) { return r.via === 'eatOne'; }).pop();
    ok(er && er.foodState === 'cooked' && er.ateKcal > 0, 'C7 eatOne attributes cooked kcal', er);
    // C8: pantryDraw wrap records cook flag + kcal by state. Clean
    // pantry fixture (the starting pantry's staples carry no foodState
    // and would be drawn first under fresh-first sort).
    const v = Game.state.village;
    v.pantry = [
      { foodKind: 'meat', foodState: 'cooked', kcalEach: 300, units: 2, name: 'Meat (cooked)', spoilDay: 9999 },
      { foodKind: 'plant', foodState: 'raw', kcalEach: 100, units: 5, name: 'Berries', spoilDay: 9999 },
    ];
    const dr = Game.pantryDraw(v, 400, { cook: false });
    const drec = t.draws[t.draws.length - 1];
    ok(drec && drec.cook === false && drec.taken === (dr && dr.taken) && drec.byState.raw === 400, 'C8 pantryDraw wrap', drec);
    // C9: askSpecialist wrap records task + specialist (even when
    // refused). Cleaned meat derives task 'preserver' in the engine;
    // a rawKcal item derives 'cook'.
    const ppl = (typeof Game.villagePeople === 'function') ? Game.villagePeople() : [];
    const anyVid = (ppl[0] && ppl[0].id) || 'nobody';
    sch.inventory.push({ foodKind: 'meat', foodState: 'cleaned', kcalEach: 300, units: 1, name: 'Meat (cleaned)' });
    const aIdx = sch.inventory.length - 1;
    Game.askSpecialist(anyVid, aIdx, sch.inventory);
    const arec = t.methodCalls.filter(function (r) { return r.method === 'askSpecialist'; }).pop();
    ok(arec && arec.task === 'preserver', 'C9a askSpecialist wrap records preserver task for cleaned meat', arec);
    sch.inventory.push({ foodKind: 'plant', rawKcal: 200, kcalEach: 100, units: 1, needsCooking: true, diseaseRisk: { p: 0.25, dmg: 8, note: 'raw' }, name: 'Tubers' });
    Game.askSpecialist(anyVid, sch.inventory.length - 1, sch.inventory);
    const arec2 = t.methodCalls.filter(function (r) { return r.method === 'askSpecialist'; }).pop();
    ok(arec2 && arec2.task === 'cook', 'C9b askSpecialist wrap records cook task for rawKcal item', arec2);
    // C10: cookFood wrap records the call (even without a fire — the
    // engine refuses, the wrap still records the attempt).
    const before = t.methodCalls.filter(function (r) { return r.method === 'cookFood'; }).length;
    sch.inventory.push({ foodKind: 'meat', foodState: 'cleaned', kcalEach: 300, units: 1, name: 'Meat (cleaned)' });
    Game.cookFood(sch.inventory.length - 1);
    const after = t.methodCalls.filter(function (r) { return r.method === 'cookFood'; }).length;
    ok(after === before + 1, 'C10 cookFood wrap records attempt', { before: before, after: after });
    // C11: snapshot runs and reads duty/haulcount shapes.
    const snap = ci.snapshot();
    ok(snap && snap.pantry && typeof snap.pantryKcal === 'number' && Array.isArray(snap.cookDuty), 'C11 daily snapshot shape', Object.keys(snap || {}));
    ok(t.instrumentErrors.length === 0, 'C12 zero instrument errors in fixtures', t.instrumentErrors);
    ok(t.wrapLive.cookTransform && t.wrapLive.eatOne && t.wrapLive.pantryDraw && t.wrapLive.learnTechnique, 'C13 wraps live', t.wrapLive);
  } finally {
    ci.uninstall();
  }
  return true;
}

// ---- D. Determinism miniature: same seed twice, byte-identical cooking counters ----
async function determinismMini() {
  async function mini(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'cookfirst-mini', fullTelemetry: false });
    await setupGame(Game);
    const ci = CI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { ci.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 20, manifest: undefined, sampleEvery: 30 }); });
    const out = {
      days: result.days,
      transforms: ci.t.transforms.map(function (r) { return [r.day, r.path, r.outcome, r.rawTotal, r.cookedTotal]; }),
      methods: ci.t.methodCalls.map(function (r) { return [r.day, r.method, r.path]; }),
      eats: ci.t.eats.map(function (r) { return [r.day, r.via, r.foodState, r.ateKcal]; }),
    };
    ci.uninstall();
    return out;
  }
  const a = await mini(180201);
  const b = await mini(180201);
  ok(JSON.stringify(a) === JSON.stringify(b), 'D1 determinism miniature byte-identical', { aDays: a.days, bDays: b.days, aT: a.transforms.length, bT: b.transforms.length });
  ok(a.transforms.length > 0 || a.methods.length > 0, 'D2 miniature observed live cooking calls', { transforms: a.transforms.length, methods: a.methods.length });
  return a;
}

// ---- E. Neutrality miniature: ON vs OFF, short horizon ----
async function neutralityMini() {
  async function mini(seed, instOn) {
    const { Game } = await loadGame({ seed: seed, mode: 'cookfirst-mini', fullTelemetry: false });
    await setupGame(Game);
    let ci = null;
    if (instOn) ci = CI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (ci) ci.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 20, manifest: undefined, sampleEvery: 30 }); });
    let pantryKcal = 0;
    try { pantryKcal = ((Game.state.village || {}).pantry || []).reduce(function (x, i) { return x + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) {}
    const deaths = (result.samples.deaths || []).length;
    if (ci) ci.uninstall();
    return { days: result.days, pantryKcal: pantryKcal, deaths: deaths };
  }
  const on = await mini(180201, true);
  const off = await mini(180201, false);
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
  console.log('\ncookfirst proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
