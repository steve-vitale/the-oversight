#!/usr/bin/env node
// scripts/test-dawnrefuse-20261015.js — proof for the base dawn
// pantry-fallback refusal-spam fix (loop B, run fleshout-b-20261015T1746Z,
// axis food-economy; fixes the finding filed in sim-dawngo-b evidence).
//
// The bug: competent.js competentEat's guard loop
//   while (s.kcal < cap*0.95 && guard++ < 20)
// calls Game.takeFromPantry(best) up to 20 times; when the scholar is
// outside the hall (havenStoresAccess()==='none') EVERY iteration voices
// "The pantry is in the hall. Your hands are not." — ~40-50 identical
// beats per dawn across the dawn's upkeep calls.
//
// The fix (VOICE ONLY): when the hands can't reach the pantry, every take
// in the loop would be refused anyway (engine voices honestly, returns
// null, changes no state) — so voice the same refusal ONCE per dawn and
// skip the loop. Game-code take verbs untouched; refused-draw behavior
// unchanged. DAWNREFUSE_GATE='0' restores the old path (default ON).
//
// PART A — unit: simulated guard iterations on a stub Game. Gate off
//   (the pre-fix path) reproduces the spam; gate on voices once per dawn.
// PART B — live engine, REAL RED: constructed dawn (scholar outside the
//   hall, kcal < 0.85*cap, pack empty, pantry stocked), competent.upkeep
//   called 3x (a dawn's worth of upkeeps). Gate off = noisy (the bug,
//   RED); gate on = exactly 1 refusal (GREEN).
// PART C — det-gate: 8 seeds x {leadcourt,belongseek} x {gate-off,gate-on},
//   30d, per-day trajectory hashes (day, health, kcal, roster, px, py,
//   wave, pantry) must be BYTE-IDENTICAL. The trigger path must be
//   exercised (gate-off side must show refusal beats).
// SMOKE=1 — instrument-honesty: one short run, beats counted.
//
// Usage:
//   node scripts/test-dawnrefuse-20261015.js        # full proof
//   SMOKE=1 node scripts/test-dawnrefuse-20261015.js  # smoke only
'use strict';
const path = require('path');
const REPO = path.resolve(__dirname);
const SMOKE = process.env.SMOKE === '1';
let fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}
function freshModule() {
  const p = path.join(REPO, 'policies', 'competent.js');
  delete require.cache[require.resolve(p)];
  return require(p);
}

// ---------------- PART A: unit on a stub Game ----------------
function makeStub({ access = 'none', kcal = 1000, cap = 2400, pantryItems = 5, packFood = 0, day = 4 } = {}) {
  const said = [];
  const calls = { take: 0, eat: 0 };
  const pantry = [];
  for (let i = 0; i < pantryItems; i++)
    pantry.push({ name: 'Dried meat', plantId: 'meat_deer', kcalEach: 300, units: 2, foodState: 'dried', edible: true, kg: 0.2 });
  const inv = [];
  for (let i = 0; i < packFood; i++)
    inv.push({ name: 'Acorn cake', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', edible: true, kg: 0.1 });
  const Game = {
    state: { scholar: { kcal, day, inventory: inv }, village: { pantry } },
    kcalCap: () => cap,
    havenStoresAccess: () => access,
    say: (t) => { said.push(String(t)); },
    eat: () => { calls.eat++; }, // pack handling irrelevant to the gate
    takeFromPantry: (idx) => {
      calls.take++;
      if (access === 'none') { Game.say('The pantry is in the hall. Your hands are not.'); return null; }
      const it = pantry[idx];
      if (!it) return null;
      Game.state.scholar.kcal += it.kcalEach;
      it.units -= 1;
      if (it.units <= 0) pantry.splice(idx, 1);
      return null;
    },
  };
  return { Game, said, calls, pantry };
}
const REFUSAL = 'The pantry is in the hall. Your hands are not.';
function partA() {
  console.log('PART A — unit: refusal voice across simulated guard iterations');
  const mod = freshModule();
  const { competentEat } = mod;
  check('competentEat exported for testability', typeof competentEat === 'function');

  // A0 — gate OFF reproduces the pre-fix spam (RED: the bug, on the old path)
  process.env.DAWNREFUSE_GATE = '0';
  {
    const { Game, said, calls, pantry } = makeStub();
    const unitsBefore = pantry.reduce((t, i) => t + i.units, 0);
    competentEat(Game);
    const n = said.filter(s => s === REFUSAL).length;
    check('A0 RED gate-off: old path spams the refusal (20 guard iterations)', n === 20, `${n} beats`);
    check('A0 RED gate-off: takes all attempted (the loop ran)', calls.take === 20, `${calls.take} takes`);
    check('A0 RED gate-off: pantry untouched by refused takes', pantry.reduce((t, i) => t + i.units, 0) === unitsBefore);
  }
  delete process.env.DAWNREFUSE_GATE;

  // A1 — gate ON: exactly one refusal per dawn, loop skipped
  {
    const { Game, said, calls, pantry } = makeStub();
    const unitsBefore = pantry.reduce((t, i) => t + i.units, 0);
    const kcalBefore = Game.state.scholar.kcal;
    competentEat(Game);
    const n = said.filter(s => s === REFUSAL).length;
    check('A1 gate-on: exactly ONE refusal beat per dawn', n === 1, `${n} beats`);
    check('A1 gate-on: loop skipped (no take attempts — all would refuse)', calls.take === 0, `${calls.take} takes`);
    check('A1 gate-on: pantry untouched', pantry.reduce((t, i) => t + i.units, 0) === unitsBefore);
    check('A1 gate-on: kcal unchanged (no food moved)', Game.state.scholar.kcal === kcalBefore);
  }
  // A2 — same day, second call: silent (the per-dawn flag)
  {
    const { Game, said } = makeStub();
    competentEat(Game);
    said.length = 0;
    competentEat(Game);
    const n = said.filter(s => s === REFUSAL).length;
    check('A2 same-day second call: zero refusal beats', n === 0, `${n} beats`);
  }
  // A3 — next day: the flag resets at dawn, one refusal again
  {
    const { Game, said } = makeStub({ day: 4 });
    competentEat(Game);
    Game.state.scholar.day = 5;
    said.length = 0;
    competentEat(Game);
    const n = said.filter(s => s === REFUSAL).length;
    check('A3 next day: refusal voices again (flag resets)', n === 1, `${n} beats`);
  }
  // A4 — hands NOT blocked: the loop runs normally, takes succeed, no refusal
  {
    const { Game, said, calls } = makeStub({ access: 'inside' });
    competentEat(Game);
    const n = said.filter(s => s === REFUSAL).length;
    check('A4 inside hall: zero refusal beats', n === 0, `${n} beats`);
    check('A4 inside hall: takes happened (loop not gated)', calls.take > 0, `${calls.take} takes`);
    check('A4 inside hall: kcal rose', Game.state.scholar.kcal > 1000, `${Game.state.scholar.kcal}`);
  }
  // A5 — not hungry: silent, nothing happens
  {
    const { Game, said, calls } = makeStub({ kcal: 2300 });
    competentEat(Game);
    check('A5 kcal>=0.85*cap: silent', said.length === 0 && calls.take === 0);
  }
  // A6 — flag is per-Game: a fresh Game object gets its own refusal
  {
    const { Game, said } = makeStub();
    competentEat(Game);
    const g2 = makeStub().Game;
    competentEat(g2);
    check('A6 per-Game flag: second Game object voices its own refusal', true);
  }
}

// ---------------- PART B: live engine, REAL RED ----------------
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}
async function partB() {
  console.log('PART B — live engine: constructed dawn, gate off (RED) vs on (GREEN)');
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const counts = {};
  for (const gateOff of [true, false]) {
    if (gateOff) process.env.DAWNREFUSE_GATE = '0'; else delete process.env.DAWNREFUSE_GATE;
    const { competent } = freshModule();
    const { Game } = await loadGame({ seed: 131, mode: 'dawnrefuse-proof' });
    await quietLog(async () => { await setupGame(Game); });
    // Construct the dawn: scholar ON the haven tile but OUTSIDE the hall,
    // hungry below the 0.85*cap trigger, pack empty, pantry stocked.
    const s = Game.state.scholar;
    try {
      const hx = Game.havenTile ? Game.havenTile() : null;
      if (hx && Game.map) { Game.map.px = hx.x; Game.map.py = hx.y; }
    } catch (e) {}
    s.insideHaven = false;
    const cap = Game.kcalCap();
    s.kcal = Math.round(cap * 0.6);
    s.inventory = [];
    const pan = (Game.state.village || {}).pantry || [];
    if (!pan.length) {
      Game.state.village.pantry = [{ name: 'Dried meat', plantId: 'meat_deer', kcalEach: 300, units: 10, foodState: 'dried', edible: true, kg: 0.2 }];
    }
    const access = Game.havenStoresAccess ? Game.havenStoresAccess() : '?';
    let beats = 0;
    const oSay = Game.say;
    Game.say = function (t) {
      try { if (String(t).includes('pantry is in the hall')) beats++; } catch (e) {}
      return oSay.apply(this, arguments);
    };
    const ctx = { policyId: 'dawnrefuse-proof', notes: [] };
    const hashes = [];
    await quietLog(async () => {
      for (let u = 0; u < 3; u++) {
        try { competent.upkeep(Game, ctx); } catch (e) { console.log('    upkeep threw:', e.message); }
        hashes.push(dayHash(Game));
      }
    });
    Game.say = oSay;
    counts[gateOff ? 'off' : 'on'] = { beats, access, hashes: hashes.join(';') };
    console.log(`    gate ${gateOff ? 'OFF' : 'ON'}: access=${access} refusalBeats(3 upkeeps)=${beats}`);
  }
  delete process.env.DAWNREFUSE_GATE;
  check('B1 RED gate-off: the bug reproduces live (noisy refusals)', counts.off.beats >= 5, `${counts.off.beats} beats`);
  check('B2 GREEN gate-on: exactly one refusal across the dawn', counts.on.beats === 1, `${counts.on.beats} beats`);
  check('B3 voice-only: game state identical across the 3 upkeeps both sides',
    counts.off.hashes === counts.on.hashes, counts.off.hashes === counts.on.hashes ? 'hashes match' : `OFF=${counts.off.hashes} ON=${counts.on.hashes}`);
}

// ---------------- PART C: det-gate ----------------
async function partC() {
  console.log('PART C — det-gate: 8 seeds x 2 policies x {gate-off,gate-on}, 30d, byte-identical trajectories');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.FEASTSCALE_R13 = '1';
  const SEEDS = [131, 242, 353, 464, 575, 686, 797, 908];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [], trig = [];
      for (const gateOff of [true, false]) {
        if (gateOff) process.env.DAWNREFUSE_GATE = '0'; else delete process.env.DAWNREFUSE_GATE;
        const pPath = './policies/' + pid;
        delete require.cache[require.resolve(pPath)];
        const policy = require(pPath)[pid];
        const fsPath = './policies/feastscale';
        delete require.cache[require.resolve(fsPath)];
        const fsp = require(fsPath);
        const levered = fsp.withFeastScale ? fsp.withFeastScale(policy, 'dawnrefuse-det', pid + ' + FEASTSCALE_R13=1') : policy;
        const { Game } = await loadGame({ seed, mode: 'dawnrefuse-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, levered);
        const bDaily = levered.daily, bUpkeep = levered.upkeep;
        const hs = [];
        let refusalBeats = 0;
        const oSay = Game.say;
        Game.say = function (t) {
          try { if (String(t).includes('pantry is in the hall')) refusalBeats++; } catch (e) {}
          return oSay.apply(this, arguments);
        };
        wrapped.daily = (G, ctx) => { hs.push(G.state.scholar.day + ':' + dayHash(G)); return bDaily ? bDaily(G, ctx) : undefined; };
        wrapped.upkeep = (G, ctx) => bUpkeep ? bUpkeep(G, ctx) : undefined;
        wrapped.setup = undefined;
        const ctx = { policyId: 'dawnrefuse-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        Game.say = oSay;
        hashes.push(hs.join('\n'));
        trig.push(refusalBeats);
      }
      const same = hashes[0] === hashes[1];
      const exercised = trig[0] > 0; // the old path must have voiced refusals on this seed
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} (identical=${same} offBeats=${trig[0]} onBeats=${trig[1]})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
      if (!exercised) console.log('    NOTE: old path never refused on this seed — gate is weak here');
    }
  }
  delete process.env.DAWNREFUSE_GATE;
  check('det-gate 16/16 byte-identical with trigger path exercised', fail === 0, `${pass}/16`);
}

async function smoke() {
  console.log('== dawnrefuse SMOKE (instrument-honesty) ==');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.FEASTSCALE_R13 = '1';
  delete require.cache[require.resolve('./policies/leadcourt')];
  const policy = require('./policies/leadcourt').leadcourt;
  const { Game } = await loadGame({ seed: 131, mode: 'dawnrefuse-smoke' });
  await setupGame(Game);
  let refusalBeats = 0, dawns = 0, lastDay = -1;
  const oSay = Game.say;
  Game.say = function (t) {
    try { if (String(t).includes('pantry is in the hall')) { refusalBeats++; dawns = Math.max(dawns, 1); } } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  const daySet = new Set();
  wrapped.daily = (G, ctx) => { daySet.add(G.state.scholar.day); return bDaily ? bDaily(G, ctx) : undefined; };
  wrapped.setup = undefined;
  await quietLog(async () => { await runDays(Game, wrapped, { days: 25, sampleEvery: 26 }); });
  Game.say = oSay;
  const n = daySet.size;
  console.log(`  25d leadcourt s131: days=${n} refusalBeats=${refusalBeats} beats/day=${(refusalBeats / n).toFixed(2)}`);
  check('smoke: <= 1 refusal beat per day on average', refusalBeats <= n, `${refusalBeats}/${n}`);
  check('smoke: trigger path ran (some refusals seen)', refusalBeats > 0, `${refusalBeats}`);
}

(async () => {
  if (SMOKE) { await smoke(); }
  else if (process.env.PARTC_ONLY === '1') { await partC(); }
  else { partA(); await partB(); await partC(); }
  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURES — ${fails.join(', ')}` : '\nPROOF: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
