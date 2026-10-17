#!/usr/bin/env node
// scripts/test-nothingedible-20261017.js — proof for the nothing-edible
// guard-loop spam fix (loop B, run fleshout-b-20261017T1235Z, axis
// food-economy; fixes finding #473 filed in sim-feastvoice-b evidence).
//
// The bug: on a starvation day the competent policy's competentEat
// re-attempts pack-eating many times (upkeep + evening callsites); every
// attempt voices the engine's full-inventory "Nothing edible. (<list> —
// not food yet: <prep hint>.)" beat byte-identical again — up to 105 in
// one day (belongfeast-s6101 d143).
//
// The fix (VOICE ONLY, policy-side): once the day's pack-eat attempt has
// heard "nothing edible" and the pack is unchanged, skip the re-attempt.
// A changed pack (forage haul, pantry take, aid parcel) or a new day
// re-arms honestly. NOTHINGEDIBLE_GATE='0' restores the old path (default
// ON). No src/js touched.
//
// PART A — unit: stub Game whose eat() voices the engine beat. Gate off
//   reproduces the spam (RED); gate on voices once per day per pack (GREEN);
//   pack change re-arms; new day re-arms; per-Game flags; edible food path
//   unaffected; not-hungry silent.
// PART B — live engine, REAL RED: constructed starvation state (scholar
//   hungry, pack of ONLY inedible items, pantry empty). 5x competentEat:
//   gate off = 5 beats (RED); gate on = 1 beat (GREEN); state hashes
//   identical (voice-only).
// PART C — det-gate: 8 census seeds x {leadfeast,belongfeast} x
//   {gate-off,gate-on}, 60d (the spam is a starvation-day phenomenon; 30d
//   would be vacuous — earliest trigger on this corpus is d51),
//   per-day trajectory hashes BYTE-IDENTICAL, and the old path must have
//   voiced "Nothing edible." on the starvation seeds (trigger exercised).
// SMOKE=1 — instrument-honesty: short armed run, beats counted.
//
// Usage:
//   node scripts/test-nothingedible-20261017.js
//   SMOKE=1 node scripts/test-nothingedible-20261017.js
//   PARTC_ONLY=1 node scripts/test-nothingedible-20261017.js
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

const NOTHING = /^Nothing edible\./;

// ---------------- PART A: unit on a stub Game ----------------
// Stub eat() mirrors the engine beat (game.js:25107): voices "Nothing
// edible. (<names> — not food yet: <hint>.)" when the pack holds inedible
// items, nothing edible, and the scholar is still hungry; silent otherwise.
function makeStub({ kcal = 1000, cap = 2400, day = 4, pack = null } = {}) {
  const said = [];
  const calls = { eat: 0 };
  const inv = pack !== null ? pack : [
    { name: 'Bitter root', kcalEach: 0, units: 3, edible: false, foodState: 'unknown', prep: 'identify it first', kg: 0.1 },
    { name: 'Acrid greens', kcalEach: 0, units: 2, edible: false, foodState: 'raw', prep: 'cook it', kg: 0.1 },
  ];
  const Game = {
    state: { scholar: { kcal, day, inventory: inv }, village: { pantry: [] } },
    kcalCap: () => cap,
    havenStoresAccess: () => 'inside',
    say: (t) => { said.push(String(t)); },
    eat: () => {
      calls.eat++;
      const s = Game.state.scholar;
      const inedible = s.inventory.filter(i => i.edible === false && (i.units || 0) > 0);
      const hasEdible = s.inventory.some(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0 && i.edible !== false);
      if (s.kcal < cap && inedible.length > 0 && !hasEdible) {
        Game.say(`Nothing edible. (${inedible.map(i => i.name).join(', ')} — not food yet: ${inedible[0].foodState === 'unknown' ? 'identify it first' : inedible[0].prep || 'process it'}.)`);
      }
    },
    takeFromPantry: () => null,
  };
  return { Game, said, calls };
}
function partA() {
  console.log('PART A — unit: nothing-edible voice across repeated pack-eat attempts');
  const mod = freshModule();
  const { competentEat } = mod;
  check('competentEat exported for testability', typeof competentEat === 'function');

  // A0 — RED: gate OFF reproduces the pre-fix spam on the old path
  process.env.NOTHINGEDIBLE_GATE = '0';
  {
    const { Game, said, calls } = makeStub();
    for (let u = 0; u < 5; u++) competentEat(Game);
    const n = said.filter(s => NOTHING.test(s)).length;
    check('A0 RED gate-off: old path voices the beat every attempt', n === 5 && calls.eat === 5, `${n} beats / ${calls.eat} eats`);
  }
  delete process.env.NOTHINGEDIBLE_GATE;

  // A1 — GREEN: gate ON, 5 attempts same day same pack = 1 beat
  {
    const { Game, said, calls } = makeStub();
    for (let u = 0; u < 5; u++) competentEat(Game);
    const n = said.filter(s => NOTHING.test(s)).length;
    check('A1 gate-on: exactly ONE beat across 5 attempts', n === 1, `${n} beats`);
    check('A1 gate-on: engine eat() called exactly once', calls.eat === 1, `${calls.eat} eats`);
  }
  // A2 — pack changes mid-day (forage haul): re-arms honestly, one more beat
  {
    const { Game, said, calls } = makeStub();
    competentEat(Game);
    Game.state.scholar.inventory.push({ name: 'Waxy tuber', kcalEach: 0, units: 1, edible: false, foodState: 'unknown', prep: 'identify it first', kg: 0.1 });
    competentEat(Game);
    competentEat(Game);
    const n = said.filter(s => NOTHING.test(s)).length;
    check('A2 pack changed: re-arms once, then silent again', n === 2 && calls.eat === 2, `${n} beats / ${calls.eat} eats`);
  }
  // A3 — next day: flag resets, one beat again
  {
    const { Game, said, calls } = makeStub({ day: 4 });
    competentEat(Game);
    Game.state.scholar.day = 5;
    competentEat(Game);
    competentEat(Game);
    const n = said.filter(s => NOTHING.test(s)).length;
    check('A3 next day: beat voices again, once', n === 2 && calls.eat === 2, `${n} beats / ${calls.eat} eats`);
  }
  // A4 — per-Game flags: a fresh Game object voices its own beat
  {
    const a = makeStub(), b = makeStub();
    competentEat(a.Game);
    competentEat(b.Game);
    const n = a.said.filter(s => NOTHING.test(s)).length + b.said.filter(s => NOTHING.test(s)).length;
    check('A4 per-Game flag: each Game hears its own first beat', n === 2, `${n} beats`);
  }
  // A5 — edible food in pack: the gate never engages, eat() runs every time
  {
    const { Game, said, calls } = makeStub({ pack: [
      { name: 'Acorn cake', kcalEach: 300, units: 2, edible: true, foodState: 'cooked', kg: 0.1 },
    ]});
    Game.eat = () => { calls.eat++; }; // edible present: engine would eat, not voice
    for (let u = 0; u < 3; u++) competentEat(Game);
    check('A5 edible pack: eat() never gated', calls.eat === 3, `${calls.eat} eats`);
  }
  // A6 — not hungry: silent, nothing happens
  {
    const { Game, said, calls } = makeStub({ kcal: 2300 });
    competentEat(Game);
    check('A6 kcal>=0.85*cap: silent', said.length === 0 && calls.eat === 0);
  }
  // A7 — empty pack: "nothing to eat" class also gated (same spam class)
  {
    const { Game, said, calls } = makeStub({ pack: [] });
    Game.eat = () => { calls.eat++; Game.say('Nothing to eat. The pantry of your pack is empty.'); };
    competentEat(Game); competentEat(Game); competentEat(Game);
    check('A7 empty pack: engine eat() gated after the first hearing', calls.eat === 1, `${calls.eat} eats`);
  }
}

// ---------------- PART B: live engine, REAL RED ----------------
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}
async function partB() {
  console.log('PART B — live engine: constructed starvation state, 5x competentEat, gate off (RED) vs on (GREEN)');
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const counts = {};
  for (const gateOff of [true, false]) {
    if (gateOff) process.env.NOTHINGEDIBLE_GATE = '0'; else delete process.env.NOTHINGEDIBLE_GATE;
    const { competentEat } = freshModule();
    const { Game } = await loadGame({ seed: 6101, mode: 'nothingedible-proof' });
    await quietLog(async () => { await setupGame(Game); });
    // Construct the starvation state: scholar hungry, pack of ONLY inedible
    // items (unknown/raw plants, edible===false), pantry empty so the guard
    // loop breaks without takes.
    const s = Game.state.scholar;
    const cap = Game.kcalCap();
    s.kcal = Math.round(cap * 0.5);
    s.inventory = [
      { name: 'Bitter root', kcalEach: 0, units: 3, edible: false, foodState: 'unknown', prep: 'identify it first', kg: 0.1 },
      { name: 'Acrid greens', kcalEach: 0, units: 2, edible: false, foodState: 'raw', prep: 'cook it', kg: 0.1 },
    ];
    try { Game.state.village.pantry = []; } catch (e) {}
    let beats = 0;
    const firstBeats = [];
    const oSay = Game.say;
    Game.say = function (t) {
      try {
        if (NOTHING.test(String(t))) { beats++; if (firstBeats.length < 3) firstBeats.push(String(t).slice(0, 160)); }
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
    const hashes = [];
    await quietLog(async () => {
      for (let u = 0; u < 5; u++) {
        try { competentEat(Game); } catch (e) { console.log('    competentEat threw:', e.message); }
        hashes.push(dayHash(Game));
      }
    });
    Game.say = oSay;
    counts[gateOff ? 'off' : 'on'] = { beats, firstBeats, hashes: hashes.join(';') };
    console.log(`    gate ${gateOff ? 'OFF' : 'ON'}: nothingEdibleBeats(5 eats)=${beats}`);
  }
  delete process.env.NOTHINGEDIBLE_GATE;
  check('B1 RED gate-off: the bug reproduces live (one beat per attempt)', counts.off.beats === 5, `${counts.off.beats} beats`);
  check('B2 GREEN gate-on: exactly one beat across 5 attempts', counts.on.beats === 1, `${counts.on.beats} beats`);
  check('B3 voice-only: game state identical both sides', counts.off.hashes === counts.on.hashes,
    counts.off.hashes === counts.on.hashes ? 'hashes match' : `OFF=${counts.off.hashes} ON=${counts.on.hashes}`);
  if (counts.on.firstBeats.length) console.log(`    sample beat: ${counts.on.firstBeats[0]}`);
}

// ---------------- PART C: det-gate ----------------
async function partC() {
  console.log('PART C — det-gate: 8 census seeds x {leadfeast,belongfeast} x {gate-off,gate-on}, 60d, byte-identical trajectories');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const SEEDS = [6101, 6102, 6103, 6104, 6105, 6106, 6107, 6108];
  const PIDS = ['leadfeast', 'belongfeast'];
  // 60d (not 30d): the spam is a starvation-day phenomenon — the earliest
  // trigger on this corpus is d51 (belongfeast-s6103, 83/day). A 30d gate
  // would be vacuous.
  const DAYS = 60;
  let pass = 0, fail = 0, exercised = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [], trig = [];
      for (const gateOff of [true, false]) {
        if (gateOff) process.env.NOTHINGEDIBLE_GATE = '0'; else delete process.env.NOTHINGEDIBLE_GATE;
        const pPath = './policies/feastscale';
        delete require.cache[require.resolve(pPath)];
        const fsp = require(pPath);
        const policy = fsp[pid];
        const { Game } = await loadGame({ seed, mode: 'nothingedible-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let nothingBeats = 0;
        const oSay = Game.say;
        Game.say = function (t) {
          try { if (NOTHING.test(String(t))) nothingBeats++; } catch (e) {}
          return oSay.apply(this, arguments);
        };
        wrapped.daily = (G, ctx) => { hs.push(G.state.scholar.day + ':' + dayHash(G)); return bDaily ? bDaily(G, ctx) : undefined; };
        wrapped.upkeep = (G, ctx) => bUpkeep ? bUpkeep(G, ctx) : undefined;
        wrapped.setup = undefined;
        const ctx = { policyId: 'nothingedible-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS, sampleEvery: DAYS + 1 }); });
        Game.say = oSay;
        hashes.push(hs.join('\n'));
        trig.push(nothingBeats);
      }
      const same = hashes[0] === hashes[1];
      const trigOn = trig[0] > 0; // the old path must have voiced the beat on this seed
      if (trigOn) exercised++;
      // Gate criterion: byte-identical ALWAYS (the gate skips state-neutral
      // calls only). Trigger exercise is reported per seed — on seeds with
      // no starvation day in 60d the gate is inert by construction.
      const ok = same;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} (identical=${same} offBeats=${trig[0]} onBeats=${trig[1]}${trigOn ? '' : ' — no trigger in 60d'})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
    }
  }
  delete process.env.NOTHINGEDIBLE_GATE;
  delete process.env.FEASTSCALE_R13;
  delete process.env.SEATDRIVE;
  check('det-gate 16/16 byte-identical trajectories', fail === 0, `${pass}/16`);
  check('det-gate trigger exercised on the starvation seeds (>=5)', exercised >= 5, `${exercised}/16 seeds fired`);
}

async function smoke() {
  console.log('== nothingedible SMOKE (instrument-honesty + gate) ==');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const res = {};
  for (const gateOff of [true, false]) {
    if (gateOff) process.env.NOTHINGEDIBLE_GATE = '0'; else delete process.env.NOTHINGEDIBLE_GATE;
    delete require.cache[require.resolve('./policies/feastscale')];
    const policy = require('./policies/feastscale').belongfeast; // census's 83/day seed
    const { Game } = await loadGame({ seed: 6103, mode: 'nothingedible-smoke' });
    await setupGame(Game);
    const byDay = {};
    const oSay = Game.say;
    Game.say = function (t) {
      try { if (NOTHING.test(String(t))) { const d = Game.state.scholar.day; byDay[d] = (byDay[d] || 0) + 1; } } catch (e) {}
      return oSay.apply(this, arguments);
    };
    const wrapped = Object.assign({}, policy);
    const bDaily = policy.daily, bUpkeep = policy.upkeep;
    wrapped.daily = (G, ctx) => bDaily ? bDaily(G, ctx) : undefined;
    wrapped.upkeep = (G, ctx) => bUpkeep ? bUpkeep(G, ctx) : undefined;
    wrapped.setup = undefined;
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, sampleEvery: 61 }); });
    Game.say = oSay;
    const vals = Object.values(byDay);
    res[gateOff ? 'off' : 'on'] = {
      total: vals.reduce((t, n) => t + n, 0),
      maxDay: vals.length ? Math.max(...vals) : 0,
    };
    console.log(`  gate ${gateOff ? 'OFF' : 'ON'}: beats=${res[gateOff ? 'off' : 'on'].total} max/day=${res[gateOff ? 'off' : 'on'].maxDay}`);
  }
  delete process.env.NOTHINGEDIBLE_GATE;
  delete process.env.FEASTSCALE_R13;
  delete process.env.SEATDRIVE;
  check('smoke: instrument sees the spam (gate-off max/day >= 10)', res.off.maxDay >= 10, `${res.off.maxDay}`);
  check('smoke: gate-on max/day <= 2', res.on.maxDay <= 2, `${res.on.maxDay}`);
  check('smoke: trigger existed armed (beats > 0)', res.on.total > 0, `${res.on.total}`);
}

(async () => {
  if (SMOKE) { await smoke(); }
  else if (process.env.PARTC_ONLY === '1') { await partC(); }
  else { partA(); await partB(); await partC(); }
  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURES — ${fails.join('; ')}` : '\nPROOF: ALL GREEN');
  if (fails.length) process.exit(2);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
