#!/usr/bin/env node
// scripts/test-distrhalf-20261015.js — proof test for the distrhalf
// distribution-starvation instrument (loop B, 2026-10-15, #272).
//
// PART A — classifier unit fixtures (pure, no engine):
//   (a) empty-pantry villager hunger-day -> a/empty-pantry
//   (b) trust-throttled scholar hunger-day (the engine's real gate:
//       deep pantry + half-ration beat + trust<30) -> b/trust-throttled-half-ration
//   (c) mixed day: deep-pantry villager starved by draw order + scholar
//       starved despite a served full meal -> c/draw-order-exhausted +
//       c/meal-served-still-starved. ALSO: a low-trust villager starving on a
//       deep-pantry half-ration day is NOT (b) — the engine never trust-gates
//       a villager's draw (design assertion).
// PART B — live-engine fixtures (real Game, real villageMeal/villagerMealDay/
//   resolveDay, constructed states only):
//   B1: scholar trust=10, deep pantry, kcal low -> real 'Half ration' beat,
//       taken~=1000, real overnight STARVING -> b/trust-throttled-half-ration,
//       beatGateMismatch==0.
//   B2: real villagerMealDay, empty pantry, fixture appetite -> real starved
//       row -> a/empty-pantry at freshDaysDawn<2; c/draw-order-exhausted at
//       freshDaysDawn=25 (deep at dawn, gone by their turn).
//   B3: one day carrying BOTH a (b) scholar hunger-day and a (c) villager
//       hunger-day -> every hunger-day attributed, unattributed==0.
// PART C — det-gate: 60d x 8 seeds x {leadcourt, belongseek}, pristine vs
//   instrumented, per-day state hashes byte-identical.
//
// Usage: node scripts/test-distrhalf-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');
const { installDistrHalf, classifyHungerDay, finalizeDistrHalf } = require('./distrhalf-lib-20261015');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['leadcourt', 'belongseek'];
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// ---------------- PART A: classifier fixtures ----------------
function partA() {
  console.log('PART A — classifier fixtures');
  // (a) villager, empty pantry at dawn
  let c = classifyHungerDay({ subject: 'villager', day: 40, vid: 'v1', trust: 55,
    freshDaysDawn: 0.4, starvePath: 'empty-pantry', ate: 200, need: 2000 });
  check('(a) villager empty-pantry -> a/empty-pantry',
    c.channel === 'a' && c.label === 'empty-pantry', JSON.stringify(c));
  // (b) scholar, deep pantry, half-ration beat, trust 10 (the engine gate)
  c = classifyHungerDay({ subject: 'scholar', day: 40, vid: 'scholar',
    freshDaysDawn: 26, scholarTrustDawn: 10, trust: 10,
    meal: { trust: 10, taken: 1050, halfRation: true, rationVote: false,
      refused: false, refusedKind: null, mealBelow06: true } });
  check('(b) scholar deep+half-beat+trust10 -> b/trust-throttled-half-ration',
    c.channel === 'b' && c.label === 'trust-throttled-half-ration', JSON.stringify(c));
  // (b) via ration vote instead of the beat
  c = classifyHungerDay({ subject: 'scholar', day: 41, vid: 'scholar',
    freshDaysDawn: 24, trust: 12,
    meal: { trust: 12, taken: 1000, halfRation: false, rationVote: true,
      refused: false, refusedKind: null } });
  check('(b) scholar deep+ration-vote+trust12 -> b', c.channel === 'b', JSON.stringify(c));
  // (b) refused when trust is ABOVE the threshold — the gate is real
  c = classifyHungerDay({ subject: 'scholar', day: 41, vid: 'scholar',
    freshDaysDawn: 24, trust: 45,
    meal: { trust: 45, taken: 1000, halfRation: false, rationVote: true,
      refused: false, refusedKind: null } });
  check('(b) trust>=30 + ration vote, no half beat -> NOT b',
    c.channel !== 'b', JSON.stringify(c));
  // (c) villager, deep at dawn, pantry gone by their turn
  c = classifyHungerDay({ subject: 'villager', day: 40, vid: 'v2', trust: 70,
    freshDaysDawn: 25, starvePath: 'empty-pantry', ate: 300, need: 2000 });
  check('(c) villager deep-dawn/gone-by-turn -> c/draw-order-exhausted',
    c.channel === 'c' && c.label === 'draw-order-exhausted', JSON.stringify(c));
  // (c) villager crumbs
  c = classifyHungerDay({ subject: 'villager', day: 40, vid: 'v3', trust: 70,
    freshDaysDawn: 25, starvePath: 'crumbs-left', ate: 300, need: 2000 });
  check('(c) villager crumbs -> c/floor1-crumbs',
    c.channel === 'c' && c.label === 'floor1-crumbs', JSON.stringify(c));
  // DESIGN ASSERTION: low-trust villager on a deep-pantry half-ration day is
  // NOT (b) — the engine never trust-gates a villager's draw.
  c = classifyHungerDay({ subject: 'villager', day: 40, vid: 'v4', trust: 10,
    freshDaysDawn: 26, halfRationNamed: true, starvePath: 'empty-pantry',
    ate: 300, need: 2000 });
  check('(c) low-trust villager, deep pantry, half-ration day -> NOT b',
    c.channel !== 'b', JSON.stringify(c));
  // (c) scholar, meal served (trust>=30) but still starved
  c = classifyHungerDay({ subject: 'scholar', day: 40, vid: 'scholar',
    freshDaysDawn: 26, trust: 65,
    meal: { trust: 65, taken: 2000, halfRation: false, rationVote: false,
      refused: false, refusedKind: null } });
  check('(c) scholar full meal yet starved -> c/meal-served-still-starved',
    c.channel === 'c' && c.label === 'meal-served-still-starved', JSON.stringify(c));
  // (c) scholar exiled
  c = classifyHungerDay({ subject: 'scholar', day: 40, vid: 'scholar',
    freshDaysDawn: 26, trust: 5,
    meal: { trust: 5, taken: 0, halfRation: false, rationVote: false,
      refused: true, refusedKind: 'exile' } });
  check('(c) scholar exiled -> c/exile-withheld',
    c.channel === 'c' && c.label === 'exile-withheld', JSON.stringify(c));
}

// ---------------- PART B: live-engine fixtures ----------------
async function liveGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'distrhalf-test' });
  await setupGame(Game);
  return Game;
}
function deepPantry(Game, kcal) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'Test grain', kcalEach: 500, units: Math.ceil(kcal / 500),
    spoilDay: (Game.state.scholar.day || 1) + 30 });
}

async function partB() {
  console.log('PART B — live-engine fixtures');
  // B1: the #272 mechanism, end to end on the real engine
  {
    const Game = await liveGame(4242);
    const track = installDistrHalf(Game);
    const v = Game.state.village, scholar = Game.state.scholar;
    const sid = Game.villagerId;
    v.trust = v.trust || {}; v.trust[sid] = 10; // below the engine's 30 gate
    deepPantry(Game, 60000); // ~30 fresh-days
    scholar.kcal = 400; // nearly empty bank
    track.dawn(Game);
    await quietLog(async () => { Game.villageMeal(); });
    const meal = track.meals[track.meals.length - 1];
    check('B1 meal beat names the half-ration', !!meal && meal.halfRation,
      meal ? `trust=${meal.trust} taken=${meal.taken}` : 'no meal record');
    // The share is 1000 but the cook:true draw values food cooked — the taken
    // is the cooked value (~1200 here). What matters: clearly the half-share
    // regime (<< 2000), and the beat fired.
    check('B1 taken in the half-share regime (<< full 2000)',
      !!meal && meal.taken > 0 && meal.taken < 1500,
      meal ? `taken=${meal.taken}` : '');
    check('B1 beat text matches the engine gate (no mismatch)',
      !!meal && meal.beatGateMismatch === false, meal ? `mismatch=${meal.beatGateMismatch}` : '');
    // the real overnight body
    const calObj = globalThis.Scattering.calories;
    await quietLog(async () => {
      calObj.resolveDay(scholar, v, { weather: 'clear', dayTicks: 100 });
    });
    const night = track.nights[track.nights.length - 1];
    check('B1 overnight STARVING fired (real engine)', !!night && night.starving,
      night ? night.warnings.join(' | ').slice(0, 80) : 'no night record');
    const rep = finalizeDistrHalf(Game, track);
    const hd = rep.hungerDays.filter(h => h.subject === 'scholar');
    check('B1 exactly one scholar hunger-day', hd.length === 1, `n=${hd.length}`);
    check('B1 scholar hunger-day -> b/trust-throttled-half-ration',
      hd.length === 1 && hd[0].channel === 'b' && hd[0].label === 'trust-throttled-half-ration',
      hd.length ? `${hd[0].channel}/${hd[0].label} freshDaysDawn=${hd[0].freshDaysDawn}` : '');
    check('B1 zero unattributed', rep.unattributed === 0, `unattributed=${rep.unattributed}`);
    try { track.uninstall(); } catch (e) {}
  }
  // B2: real villagerMealDay on an empty pantry
  {
    const Game = await liveGame(4343);
    const track = installDistrHalf(Game);
    const v = Game.state.village;
    v.pantry = []; // bare shelves
    const sid = Game.villagerId;
    const vid = (v.roster || []).find(id => id !== sid && !(Game.getPerson(id) || {}).dead);
    check('B2 fixture villager exists', !!vid, String(vid));
    if (vid) {
      const person = Game.getPerson(vid);
      const realKpd = person.kcalPerDay;
      person.kcalPerDay = 8000; // fixture appetite: production cannot cover
      track.dawn(Game);
      // force freshDaysDawn to the empty-pantry case AND the deep case
      let row = null;
      await quietLog(async () => { row = Game.villagerMealDay(vid, person, v, {}); });
      person.kcalPerDay = realKpd;
      const starved = row && !row.fasting && (row.ate < 8000 * 0.6);
      check('B2 real villagerMealDay starved on bare pantry', !!starved,
        row ? `ate=${Math.round(row.ate)}` : 'no row');
      if (starved) {
        const rec = track.census.rows[track.census.rows.length - 1];
        const base = { subject: 'villager', day: rec.day, vid: rec.vid, trust: rec.trust,
          ate: rec.ate, need: rec.need, starvePath: classify(rec, {}).starvePath };
        let c = classifyHungerDay(Object.assign({ freshDaysDawn: 0.3 }, base));
        check('B2 bare dawn -> a/empty-pantry', c.channel === 'a' && c.label === 'empty-pantry',
          JSON.stringify(c));
        c = classifyHungerDay(Object.assign({ freshDaysDawn: 25 }, base));
        check('B2 deep dawn, empty by their turn -> c/draw-order-exhausted',
          c.channel === 'c' && c.label === 'draw-order-exhausted', JSON.stringify(c));
      }
    }
    try { track.uninstall(); } catch (e) {}
  }
  // B3: mixed day — one (b), one (c), zero unattributed
  {
    const Game = await liveGame(4444);
    const track = installDistrHalf(Game);
    const v = Game.state.village, scholar = Game.state.scholar;
    const sid = Game.villagerId;
    v.trust = v.trust || {}; v.trust[sid] = 10;
    deepPantry(Game, 60000);
    scholar.kcal = 400;
    const vid = (v.roster || []).find(id => id !== sid && !(Game.getPerson(id) || {}).dead);
    track.dawn(Game);
    await quietLog(async () => { Game.villageMeal(); });
    if (vid) {
      const person = Game.getPerson(vid);
      const realKpd = person.kcalPerDay;
      person.kcalPerDay = 8000;
      // drain the pantry AFTER the scholar ate: deep at dawn, gone by turn
      v.pantry = [];
      await quietLog(async () => { Game.villagerMealDay(vid, person, v, {}); });
      person.kcalPerDay = realKpd;
    }
    const calObj = globalThis.Scattering.calories;
    await quietLog(async () => { calObj.resolveDay(scholar, v, { weather: 'clear', dayTicks: 100 }); });
    const rep = finalizeDistrHalf(Game, track);
    const chans = rep.hungerDays.map(h => `${h.subject}:${h.channel}/${h.label}`).sort();
    check('B3 mixed day: scholar=b, villager=c, none unattributed',
      rep.hungerDays.length === 2 && rep.unattributed === 0 &&
      chans.some(s => s.startsWith('scholar:b/')) && chans.some(s => s.startsWith('villager:c/')),
      JSON.stringify(chans));
    try { track.uninstall(); } catch (e) {}
  }
}

// ---------------- PART C: det-gate ----------------
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}
async function runHashes(seed, policyId, days, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'distrhalf-det' });
  await setupGame(Game);
  const policy = require('./policies/' + policyId)[policyId];
  let track = null;
  if (instrumented) track = installDistrHalf(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  wrapped.daily = (G, ctx) => {
    if (track) track.dawn(G);
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  wrapped.setup = undefined;
  const ctx = { policyId: 'distrhalf-det', notes: [] };
  await quietLog(async () => {
    if (policy.setup) await policy.setup(Game, ctx);
    await runDays(Game, wrapped, { days, sampleEvery: days + 1 });
  });
  if (track) { try { track.uninstall(); } catch (e) {} }
  return hashes.join('\n');
}
async function partC() {
  console.log('PART C — det-gate: 60d x 8 seeds x 2 policies, pristine vs instrumented');
  let pass = 0, fail = 0;
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const a = await runHashes(seed, pid, 60, false);
      const b = await runHashes(seed, pid, 60, true);
      const same = a === b;
      if (same) pass++; else fail++;
      console.log(`  ${same ? 'PASS' : 'FAIL'} ${pid} s${seed} (${a.split('\n').length}d)`);
      if (!same) {
        const al = a.split('\n'), bl = b.split('\n');
        const i = al.findIndex((h, k) => h !== bl[k]);
        console.log(`    first divergence at row ${i}: A=${al[i]} B=${bl[i]}`);
      }
    }
  }
  check('det-gate 16/16 byte-identical', fail === 0, `${pass}/16`);
}

(async () => {
  partA();
  await partB();
  await partC();
  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
