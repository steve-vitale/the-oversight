// test-fishfirst-a.js — proof for the fishing first-numbers instrument
// (arm sim-fishfirst-a, run fleshout-20261111T0215Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-fishfirst-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const FI = require(path.join(REPO, 'scripts', 'fishfirst-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'fishfirst-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Analyzer classifier fixtures (no game load) ----
(function () {
  ok(AN.isFishName('Fish catch'), 'A1 Fish catch is fish');
  ok(AN.isFishName('Fish catch (smoked)'), 'A2 smoked fish catch is fish');
  ok(AN.isFishName('Smoked fish (downriver)'), 'A3 trader smoked fish is fish');
  ok(AN.isFishName('Bluegill (carcass)'), 'A4 bluegill carcass is fish');
  ok(AN.isFishName('Creek chub'), 'A5 creek chub is fish');
  ok(!AN.isFishName('Foraged food'), 'A6 foraged food is not fish');
  ok(!AN.isFishName('Game meat'), 'A7 game meat is not fish');
  ok(!AN.isFishName('Garden harvest'), 'A8 garden harvest is not fish');
  ok(AN.isFishSpecies('bluegill', ['creek_chub', 'bluegill']), 'A9 species in region list');
  ok(AN.isFishSpecies('catfish', ['creek_chub', 'bluegill']), 'A10 catfish word match');
  ok(!AN.isFishSpecies('deer', ['creek_chub', 'bluegill']), 'A11 deer is not fish');
})();

// ---- B. Live wrap fixtures (one game load, direct calls) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180233, mode: 'fishfirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  ['stockPantry', 'foodCarcass', 'tele', 'assignTask', 'offerDeal', 'appealToGoal',
   'noteDeed', 'creditDeed', 'setNet', 'cleanCarcass', 'pantryDraw', 'eat',
   'eatOne', 'eatStashOne'].forEach(function (n) { orig[n] = Game[n]; });
  const fi = FI.install(Game);
  const t = fi.t;

  // B1: stockPantry deposit recorded with name + kcal.
  Game.stockPantry(400, 'Fish catch');
  ok(t.deposits.length === 1 && t.deposits[0].name === 'Fish catch' && t.deposits[0].kcal === 400,
    'B1 stockPantry Fish catch recorded', t.deposits[0]);
  Game.stockPantry(250, 'Foraged food');
  eq(t.deposits.length, 2, 'B2 second deposit recorded');

  // B3: foodCarcass by origin + species + kcal.
  const carc = Game.foodCarcass({ id: 'bluegill', name: 'Bluegill' }, 150, 1, 'fished');
  ok(t.carcasses.length === 1 && t.carcasses[0].origin === 'fished' && t.carcasses[0].species === 'bluegill' && t.carcasses[0].kcal === 150,
    'B3 foodCarcass fished recorded', t.carcasses[0]);
  ok(carc && carc.foodState === 'carcass' && carc.hiddenKcal === 150, 'B4 foodCarcass returns a real carcass');
  Game.foodCarcass({ id: 'creek_chub', name: 'Creek chub' }, 200, 1, 'netted');
  eq(t.carcasses.length, 2, 'B5 netted carcass recorded');

  // B6: tele('fish') attempt recorded.
  Game.tele('fish', { known: true, cost: 60 });
  ok(t.teleFish.length === 1 && t.teleFish[0].known === true && t.teleFish[0].cost === 60,
    'B6 tele fish recorded', t.teleFish[0]);
  Game.tele('eat', { ateKcal: 123 });
  ok(t.teleEat.length === 1 && t.teleEat[0].ateKcal === 123, 'B7 tele eat recorded');

  // B8: deeds. roster[0] is the scholar themself (scholar counts as a
  // villager) — pick a non-scholar villager for the villager deed.
  const roster = ((Game.state || {}).village || {}).roster || [];
  const vid = roster.find(function (x) { return x !== Game.villagerId; }) || roster[0];
  Game.noteDeed('fishing');
  Game.creditDeed(vid, 'fishing');
  eq(t.deeds.length, 2, 'B8 fishing deeds recorded');
  ok(t.deeds[0].who === 'player' && t.deeds[1].who === vid, 'B9 deed actors', t.deeds);

  // B10: setNet wrap fires (no net held -> honest null, still recorded).
  Game.setNet();
  eq(t.netSets.length, 1, 'B10 setNet recorded');
  ok(t.netSets[0].retNull === true, 'B11 setNet null without a net');

  // B12: assignTask('fish') recorded with return + trust. The scholar
  // is at Haven after setupGame (havenBefore true), so a non-scholar
  // villager must resolve ok/refused. The scholar themself cannot be
  // assigned ("You're the leader. Lead." -> null) — recorded as the
  // null case.
  const r = Game.assignTask(vid, 'fish');
  ok(t.fishCalls.length === 1 && t.fishCalls[0].vid === vid && (t.fishCalls[0].ret === 'ok' || t.fishCalls[0].ret === 'refused'),
    'B12 assignTask fish recorded', { ret: t.fishCalls[0] && t.fishCalls[0].ret, r: r });
  ok(typeof t.fishCalls[0].trustBefore === 'number', 'B13 trust-before recorded');
  const rLead = Game.assignTask(Game.villagerId, 'fish');
  ok(t.fishCalls.length === 2 && t.fishCalls[1].ret === 'null' && rLead === null,
    'B12b assigning the leader records null', t.fishCalls[1]);

  // B14: offerDeal / appealToGoal wraps installed (no fish call made -> no record).
  eq(t.fishCalls.filter(function (c) { return c.verb !== 'assignTask'; }).length, 0, 'B14 no other-path fish calls');

  // B15: cleanCarcass wrap fires (carcass pushed to the scholar pack).
  const s = Game.state.scholar;
  s.inventory = s.inventory || [];
  s.inventory.push(Game.foodCarcass({ id: 'bluegill', name: 'Bluegill' }, 150, s.day || 1, 'fished'));
  const idx = s.inventory.length - 1;
  try { Game.cleanCarcass(idx); } catch (e) {}
  ok(t.cleans.length === 1 && /Bluegill/i.test((t.cleans[0].pre && t.cleans[0].pre.name) || ''),
    'B15 cleanCarcass recorded', t.cleans[0]);

  // B16: pantryDraw wrap fires (draws by name).
  try {
    const v = Game.state.village;
    const res = Game.pantryDraw(v, 100, { cook: false });
    ok(t.draws.length === 1 && t.draws[0].taken !== undefined, 'B16 pantryDraw recorded', t.draws[0]);
    void res;
  } catch (e) { ok(false, 'B16 pantryDraw recorded', { err: String(e && e.message) }); }

  // B17: eat wrap fires.
  try {
    Game.eat();
    ok(t.wrapLive.eat === true, 'B17 eat wrap live');
  } catch (e) { ok(false, 'B17 eat wrap live', { err: String(e && e.message) }); }

  // B18: snapshot shape.
  const snap = fi.snapshot();
  ok(snap.pantryByName && typeof snap.pantryKcal === 'number', 'B18 snapshot pantry roll');
  ok(Array.isArray(snap.fishDuty), 'B19 snapshot fishDuty array');
  ok(snap.homeFish && typeof snap.homeFish.total === 'number', 'B20 snapshot homeFish total', snap.homeFish);
  ok(typeof snap.fishWise === 'boolean', 'B21 snapshot fishWise flag');
  ok(Array.isArray(t.daily) && t.daily.length === 1, 'B22 snapshot stored');

  // B25: thin-pantry duty DOES stock fish (the C3 throttle control).
  // Staff a villager whose trust passes the gate (stored trust >= 10,
  // or unstored — checkObedience reads unstored as 10), drain the
  // pantry so prodThrottle cannot engage, resolve, and the 'Fish
  // catch' deposit must appear.
  const depBefore = t.deposits.filter(function (d) { return d.name === 'Fish catch'; }).length;
  let fishVid = null;
  try {
    const tr = ((Game.state || {}).village || {}).trust || {};
    const ros = ((Game.state || {}).village || {}).roster || [];
    for (const cand of ros) {
      if (cand === Game.villagerId) continue;
      const tv = (tr[cand] === undefined) ? 10 : tr[cand];
      if (tv >= 10) { fishVid = cand; break; }
    }
  } catch (e) {}
  ok(fishVid !== null, 'B25a a trust-passing villager exists for the control', { fishVid: fishVid });
  let assignedOk = false;
  try {
    if (fishVid) {
      const rr = Game.assignTask(fishVid, 'fish');
      assignedOk = !!(rr && rr.ok);
    }
  } catch (e) { ok(false, 'B25b staff the control fisher', { err: String(e && e.message) }); }
  ok(assignedOk, 'B25b staff the control fisher');
  try {
    const vv = Game.state.village;
    vv.pantry = [];
    Game.resolveAssignments();
  } catch (e) { ok(false, 'B25 thin-pantry duty stocks fish', { err: String(e && e.message) }); }
  const fishDeps = t.deposits.filter(function (d) { return d.name === 'Fish catch'; });
  ok(fishDeps.length > depBefore && fishDeps[fishDeps.length - 1].kcal > 0,
    'B25 thin-pantry duty stocks fish', fishDeps[fishDeps.length - 1]);

  // B23: no instrument errors on the fixture run.
  eq(t.instrumentErrors.length, 0, 'B23 zero instrument errors', t.instrumentErrors);

  // B24: uninstall restores every wrapped method.
  fi.uninstall();
  const restored = ['stockPantry', 'foodCarcass', 'tele', 'assignTask', 'offerDeal', 'appealToGoal',
    'noteDeed', 'creditDeed', 'setNet', 'cleanCarcass', 'pantryDraw', 'eat',
    'eatOne', 'eatStashOne'].every(function (n) { return Game[n] === orig[n]; });
  ok(restored, 'B24 uninstall restores all wraps');
}

// ---- C. Live duty miniature: competent staffs + fishes the creek ----
async function dutyMiniature() {
  const { Game } = await loadGame({ seed: 180233, mode: 'fishfirst-proof-c', fullTelemetry: false });
  await setupGame(Game);
  const fi = FI.install(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally { try { fi.snapshot(); } catch (e) {} }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
  fi.uninstall();
  ok(fi.t.fishCalls.length > 0, 'C1 policy calls assignTask fish in 12 days', { n: fi.t.fishCalls.length });
  ok(fi.t.fishCalls.some(function (c) { return c.ret === 'ok'; }), 'C2 at least one fish staffing ok');
  const fishDep = fi.t.deposits.filter(function (d) { return d.name === 'Fish catch'; });
  // C3: zero duty fish while the pantry is full is EXPLAINED, not a gap:
  // PRODTHROTTLE redirects every fish resolution to wood/water/stone
  // while the pantry holds >4 fresh days. Assert the redirect ledger
  // moved (and the B25 fixture proves the duty stocks when thin).
  const thr = (Game.state.village || {}).throttleRedirects || 0;
  ok(fishDep.length === 0 && thr > 0,
    'C3 full-pantry duty fish is 0 AND throttle redirected', { fishDep: fishDep.length, throttleRedirects: thr });
  ok(fi.t.deposits.some(function (d) { return d.name === 'Foraged food'; }), 'C4 forage deposits exist for the share comparison');
  ok(fi.t.daily.some(function (x) { return (x.fishDuty || []).length > 0; }), 'C5 snapshots see fish-duty holders');
  ok(fi.t.daily.every(function (x) { return x.homeFish && typeof x.homeFish.total === 'number'; }), 'C6 every snapshot has a homeFish total');
  eq(fi.t.instrumentErrors.length, 0, 'C7 zero instrument errors in miniature', fi.t.instrumentErrors);
  ok(fi.t.teleFish.length === 0, 'C8 scholar line-fish never fires under competent (tele 0)', { n: fi.t.teleFish.length });
  eq(fi.t.netSets.length, 0, 'C9 no gill-net sets under competent');
  ok(result.days > 0, 'C10 miniature ran days', { days: result.days });
}

// ---- D. Neutrality miniature: instrument on vs off, 12 days ----
async function neutralityMini() {
  async function mini(seed, on) {
    const { Game } = await loadGame({ seed: seed, mode: 'fishfirst-proof-d', fullTelemetry: false });
    await setupGame(Game);
    let fi = null;
    if (on) fi = FI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (fi) fi.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    if (fi) fi.uninstall();
    const pantryKcal = ((Game.state || {}).village || {}).pantry || [];
    const pk = pantryKcal.reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    const deaths = ((result && result.samples && result.samples.deaths) || []).length;
    return { days: result.days, pantryKcal: pk, deaths: deaths, errors: fi ? fi.t.instrumentErrors.length : 0 };
  }
  const on = await mini(180233, true);
  const off = await mini(180233, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths,
    'D1 neutrality miniature identical', { on: on, off: off });
  eq(on.errors, 0, 'D2 miniature instrument errors 0');
}

(async function () {
  try {
    await liveFixtures();
    await dutyMiniature();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\nfishfirst proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
