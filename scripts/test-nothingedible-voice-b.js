#!/usr/bin/env node
// scripts/test-nothingedible-voice-b.js — proof for the ENGINE-side
// nothing-edible voice gate (loop B, run fleshout-b-20261017T1940Z, axis
// food-economy; fills finding #473).
//
// The bug: the scholar pack-eat flow's "Nothing edible. (<inventory list> —
// not food yet: <prep hint>.)" beat (src/js/game.js:25256) fires
// byte-identical up to 105 times in a single day when pack-eating is
// re-attempted on a starvation day. The prior arm (sim-nothingedible-b,
// 37fb259e) fixed this POLICY-side in the competent policy; this arm gates
// the beat ENGINE-side in Game.eat(): first occurrence per day fires in
// full; repeats within the same day are suppressed (no fallback line).
// NOTHINGEDIBLE_VOICEGATE='0' disables (testing only).
//
// PART A — live engine, constructed starvation state, 5x Game.eat():
//   RED (gate off): 5 identical beats (the bug, live).
//   GREEN (gate on): exactly 1 beat — and its text is byte-identical to the
//   RED side's first beat (first-voice content preserved), state identical.
//   Plus: new day re-arms; per-Game flags; edible/full/empty-pack beats
//   untouched (never gated).
// PART B — det-gate: 8 census seeds x {leadfeast,belongfeast} x
//   {control,armed}, 60d, per-day state trajectories BYTE-IDENTICAL, the
//   old path must have voiced "Nothing edible." on the starvation seeds
//   (trigger exercised). Control = policy-side gate OFF + engine gate OFF
//   (NOTHINGEDIBLE_GATE='0' + NOTHINGEDIBLE_VOICEGATE='0' = the exact
//   pre-fix world); armed = policy-side gate OFF + engine gate ON (isolates
//   the engine gate's effect). FEASTSCALE_R13=1, SEATDRIVE=0 both sides.
//
// Usage:
//   node scripts/test-nothingedible-voice-b.js
//   PARTB_ONLY=1 node scripts/test-nothingedible-voice-b.js
'use strict';
const path = require('path');
const REPO = path.resolve(__dirname);
let fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}

const NOTHING = /^Nothing edible\./;

// dayHash: the same state fingerprint the policy-side arm's det-gate used.
// Deliberately EXCLUDES the narration stream (this.log) — the gate is
// voice-only by construction, and the stream is allowed to differ.
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}

// Construct the starvation state the census observed: scholar hungry, pack
// of ONLY inedible items (edible===false), so Game.eat() lands on the
// nothingEdible branch every attempt.
function starve(Game) {
  const s = Game.state.scholar;
  const cap = Game.kcalCap();
  s.kcal = Math.round(cap * 0.5);
  s.inventory = [
    { name: 'White Oak Acorns (in shell)', kcalEach: 0, units: 3, edible: false, foodState: 'raw', prep: 'Needs shelling — crack and pick the nutmeats. (Shell action)', kg: 0.1 },
    { name: 'Hickory Nuts (in shell)', kcalEach: 0, units: 2, edible: false, foodState: 'raw', prep: 'Needs shelling — crack and pick the nutmeats. (Shell action)', kg: 0.1 },
  ];
  try { Game.state.village.pantry = []; } catch (e) {}
  return s;
}

function countBeats(Game, n) {
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try { if (NOTHING.test(String(t))) beats.push(String(t)); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const hashes = [];
  for (let u = 0; u < n; u++) { try { Game.eat(); } catch (e) { console.log('    Game.eat threw:', e.message); } hashes.push(dayHash(Game)); }
  Game.say = oSay;
  return { beats, hashes: hashes.join(';') };
}

async function partA() {
  console.log('PART A — live engine: constructed starvation state, 5x Game.eat(), gate off (RED) vs on (GREEN)');
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const out = {};
  for (const gateOff of [true, false]) {
    if (gateOff) process.env.NOTHINGEDIBLE_VOICEGATE = '0'; else delete process.env.NOTHINGEDIBLE_VOICEGATE;
    const { Game } = await loadGame({ seed: 6101, mode: 'nevoice-proof' });
    await quietLog(async () => { await setupGame(Game); });
    starve(Game);
    let r;
    await quietLog(async () => { r = countBeats(Game, 5); });
    out[gateOff ? 'off' : 'on'] = r;
    console.log(`    gate ${gateOff ? 'OFF' : 'ON'}: nothingEdibleBeats(5 eats)=${r.beats.length}`);
  }
  delete process.env.NOTHINGEDIBLE_VOICEGATE;
  check('A1 RED gate-off: the bug reproduces live (one beat per attempt)', out.off.beats.length === 5, `${out.off.beats.length} beats`);
  check('A2 GREEN gate-on: exactly ONE beat across 5 attempts', out.on.beats.length === 1, `${out.on.beats.length} beats`);
  check('A3 first-voice content preserved: the one armed beat is byte-identical to the control first beat',
    out.on.beats.length === 1 && out.off.beats.length >= 1 && out.on.beats[0] === out.off.beats[0],
    out.on.beats.length === 1 && out.off.beats.length >= 1
      ? (out.on.beats[0] === out.off.beats[0] ? 'byte-identical' : `DIFF:\n      on =${out.on.beats[0]}\n      off=${out.off.beats[0]}`)
      : 'missing beats');
  check('A4 voice-only: game state identical both sides', out.off.hashes === out.on.hashes,
    out.off.hashes === out.on.hashes ? 'hashes match' : `OFF=${out.off.hashes} ON=${out.on.hashes}`);
  if (out.on.beats.length) console.log(`    first-voice beat: ${out.on.beats[0]}`);

  // A5 — new day re-arms honestly
  {
    const { Game } = await loadGame({ seed: 6102, mode: 'nevoice-proof-day' });
    await quietLog(async () => { await setupGame(Game); });
    const s = starve(Game);
    let r1, r2;
    await quietLog(async () => { r1 = countBeats(Game, 3); });
    s.day = (s.day || 0) + 1;
    await quietLog(async () => { r2 = countBeats(Game, 3); });
    check('A5 new day: the beat voices again, once', r1.beats.length === 1 && r2.beats.length === 1,
      `${r1.beats.length}+${r2.beats.length} beats`);
  }
  // A6 — per-Game flag: a fresh Game object voices its own first beat
  {
    const { Game: G1 } = await loadGame({ seed: 6103, mode: 'nevoice-proof-a' });
    const { Game: G2 } = await loadGame({ seed: 6104, mode: 'nevoice-proof-b' });
    await quietLog(async () => { await setupGame(G1); await setupGame(G2); });
    starve(G1); starve(G2);
    let r1, r2;
    await quietLog(async () => { r1 = countBeats(G1, 2); r2 = countBeats(G2, 2); });
    check('A6 per-Game flag: each Game hears its own first beat', r1.beats.length === 1 && r2.beats.length === 1,
      `${r1.beats.length}+${r2.beats.length} beats`);
  }
  // A7 — the edible path is never gated (normal meal beat voices every time)
  {
    const { Game } = await loadGame({ seed: 6105, mode: 'nevoice-proof-c' });
    await quietLog(async () => { await setupGame(Game); });
    const s = Game.state.scholar;
    s.kcal = Math.round(Game.kcalCap() * 0.3);
    const said = [];
    const oSay = Game.say;
    Game.say = function (t) { said.push(String(t)); return oSay.apply(this, arguments); };
    // Restock between eats: one bulk eat() consumes the whole 2-unit stack,
    // so without restocking the second eat would land on the (out-of-scope)
    // empty-pack branch instead of the meal branch this check targets.
    const restock = () => { s.inventory = [{ name: 'Acorn cake', kcalEach: 300, units: 2, edible: true, foodState: 'cooked', kg: 0.1 }]; };
    await quietLog(async () => { restock(); Game.eat(); restock(); Game.eat(); });
    Game.say = oSay;
    const meals = said.filter(t => /^You eat /.test(t)).length;
    check('A7 edible pack: meal beat voices every time, gate never engages',
      meals === 2 && Game._nothingEdibleDay === undefined,
      `${meals} meal beats / 2 eats, flag=${Game._nothingEdibleDay}`);
  }
  // A8 — empty pack: the "Nothing to eat." beat is NOT in scope, voices every time
  {
    const { Game } = await loadGame({ seed: 6106, mode: 'nevoice-proof-d' });
    await quietLog(async () => { await setupGame(Game); });
    const s = Game.state.scholar;
    s.kcal = Math.round(Game.kcalCap() * 0.5);
    s.inventory = [];
    const said = [];
    const oSay = Game.say;
    Game.say = function (t) { said.push(String(t)); return oSay.apply(this, arguments); };
    await quietLog(async () => { Game.eat(); Game.eat(); Game.eat(); });
    Game.say = oSay;
    const empties = said.filter(t => /^Nothing to eat\./.test(t)).length;
    check('A8 empty pack: "Nothing to eat." beat untouched (3/3)', empties === 3, `${empties}/3`);
  }
  // A9 — full scholar: the "You are full enough." beat is NOT in scope, voices every time
  {
    const { Game } = await loadGame({ seed: 6107, mode: 'nevoice-proof-e' });
    await quietLog(async () => { await setupGame(Game); });
    const s = Game.state.scholar;
    s.kcal = Game.kcalCap();
    s.inventory = [{ name: 'Stone', kcalEach: 0, units: 1, edible: false, foodState: 'raw', prep: '—', kg: 0.5 }];
    const said = [];
    const oSay = Game.say;
    Game.say = function (t) { said.push(String(t)); return oSay.apply(this, arguments); };
    await quietLog(async () => { Game.eat(); Game.eat(); });
    Game.say = oSay;
    const fulls = said.filter(t => /^You are full enough\./.test(t)).length;
    check('A9 full scholar: "You are full enough." beat untouched (2/2)', fulls === 2, `${fulls}/2`);
  }
}

async function partB() {
  console.log('PART B — det-gate: 8 census seeds x {leadfeast,belongfeast} x {control,armed}, 60d, byte-identical trajectories');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const SEEDS = [6101, 6102, 6103, 6104, 6105, 6106, 6107, 6108];
  const PIDS = ['leadfeast', 'belongfeast'];
  const DAYS = 60; // starvation-day phenomenon; earliest trigger on this corpus is d51
  let pass = 0, fail = 0, exercised = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [], trig = [];
      for (const gateOff of [true, false]) {
        // Policy-side gate OFF both sides (isolate the engine gate).
        process.env.NOTHINGEDIBLE_GATE = '0';
        if (gateOff) process.env.NOTHINGEDIBLE_VOICEGATE = '0'; else delete process.env.NOTHINGEDIBLE_VOICEGATE;
        const pPath = './policies/feastscale';
        delete require.cache[require.resolve(pPath)];
        const policy = require(pPath)[pid];
        const { Game } = await loadGame({ seed, mode: 'nevoice-det' });
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
        const ctx = { policyId: 'nevoice-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS, sampleEvery: DAYS + 1 }); });
        Game.say = oSay;
        hashes.push(hs.join('\n'));
        trig.push(nothingBeats);
      }
      const same = hashes[0] === hashes[1];
      const trigOn = trig[0] > 0;
      if (trigOn) exercised++;
      if (same) pass++; else fail++;
      console.log(`  ${same ? 'PASS' : 'FAIL'} ${pid} s${seed} (identical=${same} offBeats=${trig[0]} onBeats=${trig[1]}${trigOn ? '' : ' — no trigger in 60d'})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
    }
  }
  delete process.env.NOTHINGEDIBLE_GATE;
  delete process.env.NOTHINGEDIBLE_VOICEGATE;
  delete process.env.FEASTSCALE_R13;
  delete process.env.SEATDRIVE;
  check('det-gate 16/16 byte-identical trajectories', fail === 0, `${pass}/16`);
  check('det-gate trigger exercised on the starvation seeds (>=5)', exercised >= 5, `${exercised}/16 seeds fired`);
}

(async () => {
  if (process.env.PARTB_ONLY === '1') { await partB(); }
  else if (process.env.PARTA_ONLY === '1') { await partA(); }
  else { await partA(); await partB(); }
  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURES — ${fails.join('; ')}` : '\nPROOF: ALL GREEN');
  if (fails.length) process.exit(2);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
