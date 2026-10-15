#!/usr/bin/env node
// scripts/test-capdraw2-20261015.js — proof test for the CAPDRAW2 honest-draw
// fix (loop B run fleshout-b-20261015T1130Z, sim-findings #313/#315).
//
// The bug: the scholar's pantry draw ceils indivisible pieces (no
// fractionating) — want 2000 took a whole 5900-kcal slab; the 2400 bank cap
// banked only room, and (taken - room) kcal vanished SILENTLY behind a
// "+5900 kcal" beat. The fix (src/js/game.js villageMeal + the betrayal.js
// joined half-share wrap): the piece is still taken whole (anti-
// fractionating stands), but what the body can't bank goes back in the bins
// as 'Meal leftovers' via stockPantry, the beat reports the NET banked and
// names the return; ledgers record net. The joined-village abstract draw
// and the betrayal half-share path cap the meal at room instead.
// Behind opt-in gate CAPDRAW2=1, default OFF — gate OFF is pristine.
//
// EXPECT=red|green selects the code state under test (patch-swap of
// src/js/game.js + src/js/betrayal.js, NEVER git stash — the stash stack is
// repo-global):
//   EXPECT=red   — pristine tree: PART R asserts the bug reproduces (silent
//                  waste, lying beat); PART B red-variants; PART C1
//                  det-gate (instrumented vs pristine, 16/16).
//   EXPECT=green — fixed tree. With CAPDRAW2=1: PART R asserts the fix;
//                  PART B green-variants; PART C2 armed determinism.
//                  With CAPDRAW2 unset: PART H — uninstrumented hashes must
//                  equal the pristine baseline (gate OFF byte-identical).
// SMOKE=1 — 1 seed x 25d instrument-honesty: every excess>0 meal voiced
//            iff armed.
// HASHOUT=1 — dump uninstrumented 60d x 8 x 2 hashes to HASHFILE.
// HASHIN=1 — recompute hashes on the fixed tree (gate OFF) and compare to
//            HASHFILE.
//
// Node harness: full src/js list in index.html order via sim-harness;
// Math.random seeded BEFORE eval; Game.save never stubbed.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installCapDraw, summarizeCapDraw } = require('./capdraw-lib-20261015');

const EXPECT = process.env.EXPECT || 'green';
const SMOKE = process.env.SMOKE === '1';
const HASHOUT = process.env.HASHOUT === '1';
const HASHIN = process.env.HASHIN === '1';
const HASHFILE = process.env.HASHFILE || (require('os').homedir() + '/workspace/capdraw2-pristine-hashes.json');
if (EXPECT === 'green' && !HASHIN && !SMOKE) {
  // Armed runs need the gate; HASHIN deliberately runs gate OFF.
  process.env.CAPDRAW2 = '1';
}
const ARMED = EXPECT === 'green' && process.env.CAPDRAW2 === '1';
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['leadcourt', 'belongseek'];
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

async function liveGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'capdraw2-test' });
  await setupGame(Game);
  return Game;
}
function pantryTotal(Game) {
  return (Game.state.village.pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
}
// The s88 d36 replay: trust 45 (share 2000), room 2130, pantry holds ONE
// indivisible 5900-kcal slab and nothing else. want = min(2000, 2130) = 2000;
// the ceil takes the whole slab.
async function slabFixture(seed) {
  const Game = await liveGame(seed);
  const v = Game.state.village, scholar = Game.state.scholar;
  const sid = Game.villagerId;
  const cap = Game.kcalCap();
  v.trust = v.trust || {}; v.trust[sid] = 45;
  scholar.kcal = cap - 2130; // room = 2130
  const day = scholar.day || 1;
  v.pantry = [{ name: 'Smoked haunch', kcalEach: 5900, units: 1,
    spoilDay: day + 30, safe: true }];
  const track = installCapDraw(Game);
  await quietLog(async () => { Game.villageMeal(); });
  const meal = track.meals[track.meals.length - 1];
  return { Game, v, scholar, cap, track, meal };
}

// ---------------- PART R: the bug's footprint ----------------
async function partR() {
  console.log(`PART R — slab footprint (EXPECT=${EXPECT}, armed=${ARMED})`);
  const { Game, v, scholar, cap, track, meal } =
    await slabFixture(4242);
  check('R footprint: gross taken 5900 (the ceil)', meal && meal.taken === 5900,
    meal ? `taken=${meal.taken}` : 'no meal');
  check('R footprint: room 2130', meal && meal.room === 2130, meal ? `room=${meal.room}` : '');
  check('R footprint: excess 3770', meal && meal.excess === 3770,
    meal ? `excess=${meal.excess}` : '');
  if (!ARMED) {
    check('RED scholar banks the cap (2400 total)', scholar.kcal === cap, `kcal=${scholar.kcal} cap=${cap}`);
    check('RED pantry destroyed: 0 kcal left', pantryTotal(Game) === 0, `pantry=${pantryTotal(Game)}`);
    check('RED no leftover items returned', !(v.pantry || []).some(i => i.name === 'Meal leftovers'), `pantryN=${(v.pantry || []).length}`);
    check('RED beat lies: "+5900 kcal"', /Village meal: \+5900 kcal/.test(meal.beats), meal.beats.slice(0, 90));
    check('RED waste is SILENT (no beat names it)', meal.voiced === false, `voiced=${meal.voiced}`);
    check('RED ledger records gross (lastPlayerMeal 5900)', v.lastPlayerMeal === 5900, `lastPlayerMeal=${v.lastPlayerMeal}`);
  } else {
    check('GREEN scholar banks the cap (2400 total)', scholar.kcal === cap, `kcal=${scholar.kcal} cap=${cap}`);
    check('GREEN pantry keeps the excess: 3770 kcal', pantryTotal(Game) === 3770, `pantry=${pantryTotal(Game)}`);
    const left = (v.pantry || []).filter(i => i.name === 'Meal leftovers');
    const leftKcal = left.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
    check('GREEN leftovers returned as real pieces', left.length > 0 && leftKcal === 3770,
      `n=${left.length} kcal=${leftKcal}`);
    check('GREEN leftovers are granular (<=500 each)', left.every(i => (i.kcalEach || 0) <= 500),
      left.map(i => i.kcalEach).join(','));
    check('GREEN beat reports NET banked (+2130)', /Village meal: \+2130 kcal/.test(meal.beats), meal.beats.slice(0, 120));
    check('GREEN beat names the return', /went back in the bins as leftovers/.test(meal.beats), '');
    check('GREEN beat names the piece', /Smoked haunch/.test(meal.beats), '');
    check('GREEN waste is VOICED', meal.voiced === true, `voiced=${meal.voiced}`);
    check('GREEN ledger records net (lastPlayerMeal 2130)', v.lastPlayerMeal === 2130, `lastPlayerMeal=${v.lastPlayerMeal}`);
    check('GREEN freeloader ledger records net', (v.takes || {})[Game.villagerId] === 2130,
      `takes=${(v.takes || {})[Game.villagerId]}`);
  }
  try { track.uninstall(); } catch (e) {}
}

// ---------------- PART B: no-regression fixtures ----------------
async function partB() {
  console.log('PART B — no-regression fixtures');
  // B1: exact-fit draw — no overshoot, no leftovers, beat shape unchanged
  {
    const Game = await liveGame(4343);
    const v = Game.state.village, scholar = Game.state.scholar;
    const sid = Game.villagerId, cap = Game.kcalCap();
    v.trust = v.trust || {}; v.trust[sid] = 45;
    scholar.kcal = cap - 2200;
    const day = scholar.day || 1;
    v.pantry = [{ name: 'Grain', kcalEach: 500, units: 8, spoilDay: day + 30, safe: true }];
    const track = installCapDraw(Game);
    await quietLog(async () => { Game.villageMeal(); });
    const meal = track.meals[track.meals.length - 1];
    check('B1 exact fit: taken 2000, excess 0', meal.taken === 2000 && meal.excess === 0,
      `taken=${meal.taken} excess=${meal.excess}`);
    check('B1 no leftovers created', !(v.pantry || []).some(i => i.name === 'Meal leftovers'), '');
    check('B1 beat keeps its shape', /^Village meal: \+2000 kcal/.test(meal.beats) && !/leftovers/.test(meal.beats),
      meal.beats.slice(0, 100));
    check('B1 ledger == taken', v.lastPlayerMeal === 2000, `lastPlayerMeal=${v.lastPlayerMeal}`);
    try { track.uninstall(); } catch (e) {}
  }
  // B2: full belly — the "You're full" path is untouched
  {
    const Game = await liveGame(4444);
    const v = Game.state.village, scholar = Game.state.scholar;
    const cap = Game.kcalCap();
    scholar.kcal = cap;
    const day = scholar.day || 1;
    v.pantry = [{ name: 'Grain', kcalEach: 500, units: 8, spoilDay: day + 30, safe: true }];
    const track = installCapDraw(Game);
    await quietLog(async () => { Game.villageMeal(); });
    const meal = track.meals[track.meals.length - 1];
    check('B2 full: no draw', meal.taken === 0, `taken=${meal.taken}`);
    check('B2 full: honest beat', /You're full/.test(meal.beats), meal.beats.slice(0, 60));
    check('B2 full: lastPlayerMeal 0', v.lastPlayerMeal === 0, '');
    try { track.uninstall(); } catch (e) {}
  }
  // B3: bare pantry — the "No food" path is untouched
  {
    const Game = await liveGame(4545);
    const v = Game.state.village, scholar = Game.state.scholar;
    const sid = Game.villagerId, cap = Game.kcalCap();
    v.trust = v.trust || {}; v.trust[sid] = 45;
    scholar.kcal = cap - 2000;
    v.pantry = [];
    const track = installCapDraw(Game);
    await quietLog(async () => { Game.villageMeal(); });
    const meal = track.meals[track.meals.length - 1];
    check('B3 bare: no draw', meal.taken === 0, `taken=${meal.taken}`);
    check('B3 bare: honest beat', /No food in the pantry/.test(meal.beats), meal.beats.slice(0, 60));
    try { track.uninstall(); } catch (e) {}
  }
  // B4: joined-village branch — the draw respects the cap there too
  {
    const Game = await liveGame(4646);
    const v = Game.state.village, scholar = Game.state.scholar;
    const cap = Game.kcalCap();
    check('B4 map present (fixture precondition)', !!(Game.map && Game.map.px != null),
      `px=${Game.map && Game.map.px}`);
    const px = Game.map.px, py = Game.map.py;
    scholar.joinedVillage = 'testville';
    // trust 20: full shares at their fire (betrayal.js: trust<15 or
    // probation -> half shares). B5 covers the half-share path.
    Game.state.otherVillages = [{ id: 'testville', name: 'Testville', x: px, y: py,
      pantryKcal: 5000, trust: 20 }];
    scholar.kcal = cap - 400; // room 400
    const track = installCapDraw(Game);
    await quietLog(async () => { Game.villageMeal(); });
    const meal = track.meals[track.meals.length - 1];
    const jv = Game.state.otherVillages[0];
    if (!ARMED) {
      check('B4 RED joined: meal 2000, 1600 silently discarded',
        jv.pantryKcal === 3000 && scholar.kcal === cap && meal.joinedWaste === 1600,
        `pantryKcal=${jv.pantryKcal} kcal=${scholar.kcal} waste=${meal.joinedWaste}`);
    } else {
      check('B4 GREEN joined: meal capped at room (400)',
        jv.pantryKcal === 4600 && scholar.kcal === cap && meal.joinedWaste === 0,
        `pantryKcal=${jv.pantryKcal} kcal=${scholar.kcal} waste=${meal.joinedWaste}`);
      check('B4 GREEN joined: honest beat', /Village meal at Testville: \+400 kcal/.test(meal.beats),
        meal.beats.slice(0, 60));
    }
    try { track.uninstall(); } catch (e) {}
  }
  // B5: betrayal.js half-share path (trust<15 at a joined fire) — the draw
  // respects the cap there too
  {
    const Game = await liveGame(4747);
    const scholar = Game.state.scholar;
    const cap = Game.kcalCap();
    const px = Game.map.px, py = Game.map.py;
    scholar.joinedVillage = 'testville';
    Game.state.otherVillages = [{ id: 'testville', name: 'Testville', x: px, y: py,
      pantryKcal: 5000, trust: 5 }];
    scholar.kcal = cap - 400; // room 400
    const track = installCapDraw(Game);
    await quietLog(async () => { Game.villageMeal(); });
    const meal = track.meals[track.meals.length - 1];
    const jv = Game.state.otherVillages[0];
    if (!ARMED) {
      check('B5 RED half-share: meal 1000, 600 silently discarded',
        jv.pantryKcal === 4000 && scholar.kcal === cap && meal.joinedWaste === 600,
        `pantryKcal=${jv.pantryKcal} kcal=${scholar.kcal} waste=${meal.joinedWaste}`);
    } else {
      check('B5 GREEN half-share: meal capped at room (400)',
        jv.pantryKcal === 4600 && scholar.kcal === cap && meal.joinedWaste === 0,
        `pantryKcal=${jv.pantryKcal} kcal=${scholar.kcal} waste=${meal.joinedWaste}`);
      check('B5 GREEN half-share: honest beat', /Village meal at Testville: \+400 kcal/.test(meal.beats),
        meal.beats.slice(0, 120));
    }
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
  const { Game } = await loadGame({ seed, mode: 'capdraw2-det' });
  await setupGame(Game);
  const policy = require('./policies/' + policyId)[policyId];
  let track = null;
  if (instrumented) track = installCapDraw(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  wrapped.setup = undefined;
  const ctx = { policyId: 'capdraw2-det', notes: [] };
  await quietLog(async () => {
    if (policy.setup) await policy.setup(Game, ctx);
    await runDays(Game, wrapped, { days, sampleEvery: days + 1 });
  });
  if (track) { try { track.uninstall(); } catch (e) {} }
  return hashes;
}
async function partC1() {
  console.log('PART C1 — det-gate: 60d x 8 seeds x 2 policies, pristine vs instrumented');
  let pass = 0, fail = 0;
  const rows = [];
  for (const pid of POLICIES) for (const seed of SEEDS) {
    const a = await runHashes(seed, pid, 60, false);
    const b = await runHashes(seed, pid, 60, true);
    rows.push({ policy: pid, seed, hash: a.join('\n') });
    const same = a.join('\n') === b.join('\n');
    if (same) pass++; else fail++;
    console.log(`  ${same ? 'PASS' : 'FAIL'} ${pid} s${seed}`);
    if (!same) {
      const al = a, bl = b;
      const i = al.findIndex((h, k) => h !== bl[k]);
      console.log(`    first divergence at row ${i}: A=${al[i]} B=${bl[i]}`);
    }
  }
  check('det-gate C1 16/16 byte-identical (instrument observes only)', fail === 0, `${pass}/16`);
  return rows;
}
async function partH(baseline) {
  console.log('PART H — gate-OFF hash equality vs pristine baseline (fixed tree, CAPDRAW2 unset)');
  let pass = 0, fail = 0;
  for (const pid of POLICIES) for (const seed of SEEDS) {
    const key = `${pid}/s${seed}`;
    const now = (await runHashes(seed, pid, 60, false)).join('\n');
    const base = (baseline.find(r => r.policy === pid && r.seed === seed) || {}).hash;
    const same = now === base;
    if (same) pass++; else fail++;
    console.log(`  ${same ? 'PASS' : 'FAIL'} ${key}`);
  }
  check('gate-OFF 16/16 byte-identical to pristine HEAD', fail === 0, `${pass}/16`);
}
async function partC2() {
  console.log('PART C2 — armed determinism: 60d x 8 seeds x 2 policies, armed vs armed');
  let pass = 0, fail = 0;
  for (const pid of POLICIES) for (const seed of SEEDS) {
    const a = (await runHashes(seed, pid, 60, false)).join('\n');
    const b = (await runHashes(seed, pid, 60, false)).join('\n');
    const same = a === b;
    if (same) pass++; else fail++;
    console.log(`  ${same ? 'PASS' : 'FAIL'} ${pid} s${seed}`);
  }
  check('armed determinism 16/16 byte-identical', fail === 0, `${pass}/16`);
}

// ---------------- SMOKE: instrument-honesty ----------------
async function smoke() {
  console.log(`SMOKE — 1 seed x 25d instrument-honesty (armed=${ARMED})`);
  const { Game } = await loadGame({ seed: 11, mode: 'capdraw2-smoke' });
  await setupGame(Game);
  const base = require('./policies/leadcourt')['leadcourt'];
  const track = installCapDraw(Game);
  let dailyCalls = 0;
  const policy = Object.assign({}, base);
  const bDaily = base.daily;
  policy.daily = (G, ctx) => { dailyCalls++; return bDaily ? bDaily(G, ctx) : undefined; };
  await quietLog(async () => { await runDays(Game, policy, { days: 25, sampleEvery: 26 }); });
  const sum = summarizeCapDraw(track);
  check('SMOKE meals captured', track.meals.length > 5, `meals=${track.meals.length}`);
  check('SMOKE policy.daily fired', dailyCalls > 20, `daily=${dailyCalls}`);
  let voiceOk = true;
  for (const m of track.meals) {
    if (m.excess > 0 && (m.voiced !== ARMED)) { voiceOk = false; break; }
  }
  check(`SMOKE every excess>0 meal voiced=${ARMED}`, voiceOk,
    `events=${sum.excessEvents} silent=${sum.silentKcal} voiced=${sum.voicedKcal}`);
  try { track.uninstall(); } catch (e) {}
}

(async () => {
  if (SMOKE) { await smoke(); }
  else if (HASHIN) {
    const baseline = JSON.parse(fs.readFileSync(HASHFILE, 'utf8'));
    await partH(baseline);
  }
  else if (EXPECT === 'red') {
    await partR(); await partB();
    const rows = await partC1();
    if (HASHOUT) {
      fs.writeFileSync(HASHFILE, JSON.stringify(rows, null, 1));
      console.log(`wrote pristine hashes to ${HASHFILE}`);
    }
  }
  else {
    // EXPECT=green armed
    await partR(); await partB(); await partC2();
  }
  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
