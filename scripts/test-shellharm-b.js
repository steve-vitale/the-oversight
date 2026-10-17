#!/usr/bin/env node
// scripts/test-shellharm-b.js — PROOF for the sim-shellharm-b diagnostic instruments.
//
// PART A — shellcounter reconstruction fidelity (adapted from the killed arm's
//   own proof, scripts/test-shellcounter-b.js): RED (gate-off fixture leaves
//   counter nuts in shell) -> GREEN (SHELLCOUNTER=1 shells + putAway + engine
//   pantry-eat). If the reconstruction were unfaithful, this fails.
// PART B — perturb neutrality: PERTURBDAWN=1 on the same fixture burns exactly
//   4 ticks, moves NO food (counter nuts stay in shell, pantry byte-stable),
//   changes NO kcal, and fires under the same gate schedule as the shell arm.
// PART C — det-gate: both wrappers gate-off (envs unset) vs unwrapped base,
//   per-day trajectory hashes, 30d x 4 seeds x 2 policies. Must be
//   byte-identical; base-vs-base control disambiguates substrate noise.
// PART D — attribution unit test: synthetic death lists through the
//   collapse-tail / perturb-replication attribution math (mirrors the analyzer
//   in scripts/analyze-shellharm-b.js) — tail deaths attribute to re-timing,
//   pre-collapse deaths with a replicated perturb shift attribute to timing,
//   unexplained pre-collapse excess stays residual.
// PART E — SMOKE: 1 seed x 2 policies x {control,shell,perturb}, 12d, no exceptions.
//
// Usage: node scripts/test-shellharm-b.js
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const SC = require('./policies/shellcounter');
const PD = require('./policies/perturbdawn');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function nutItem(units, gross, plantId, name) {
  return {
    name: name + ' (in shell)', foodKind: 'nut', foodState: 'in_shell', edible: false,
    units, hiddenKcal: gross, kcalEach: 0, plantId, spoilDay: 999,
    prep: 'Needs shelling — crack and pick the nutmeats.',
  };
}

async function buildFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  try {
    const v = Game.state.village || {};
    if (Game.map) { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); }
    s.insideHaven = true;
  } catch (e) {}
  s.kcal = 300;                       // lean: < 50% of a 3000 cap
  s.inventory = [];
  s.prepStash = [
    nutItem(3, 800, 'hickory_nut', 'Hickory Nuts'),
    nutItem(2, 500, 'acorn_white_oak', 'White Oak Acorns'),
  ];
  s.dayTicks = 100;
  s.day = 50;
  return Game;
}

function counterNutsOf(Game) {
  const stash = ((Game.state || {}).scholar || {}).prepStash || [];
  return stash.filter(i => i && i.foodKind === 'nut');
}

function pantrySig(Game) {
  const pantry = ((Game.state || {}).village || {}).pantry || [];
  return pantry.map(i => [i.name, i.foodState, i.units, i.kcalEach].join('|')).join(';');
}

async function partA() {
  console.log('PART A — shellcounter reconstruction fidelity (RED->GREEN fixture)');
  // RED: base upkeep never shells counter nuts
  {
    const Game = await buildFixture(7301);
    try { await quietLog(async () => { belongfeast.upkeep(Game, {}); }); } catch (e) {}
    const states = counterNutsOf(Game).map(i => i.foodState).join(',');
    check('RED: base upkeep leaves counter nuts in shell', states === 'in_shell,in_shell', `states=${states}`);
  }
  // GREEN: wrapped upkeep (SHELLCOUNTER=1) shells the counter batch, putAway
  // moves it to the pantry, and the engine's normal pantry-eat eats it.
  {
    process.env.SHELLCOUNTER = '1';
    try {
      const wrapped = SC.withShellCounter(belongfeast, 'belongfeast+shellcounter-test', 'test');
      const Game = await buildFixture(7301);
      const kcalBefore = Game.state.scholar.kcal;
      try { await quietLog(async () => { wrapped.upkeep(Game, {}); }); } catch (e) {}
      const nuts = counterNutsOf(Game);
      const counterEmptyOfNuts = nuts.length === 0;
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      const panNuts = pantry.filter(i => i && i.foodKind === 'nut' && i.foodState === 'shelled');
      check('GREEN: layer shells the counter batch and puts it away',
        counterEmptyOfNuts && panNuts.length > 0,
        `counterNuts=${nuts.length} pantryShelled=${panNuts.length}`);
      const s = Game.state.scholar;
      let ate = 0;
      try {
        for (let g = 0; g < 20 && s.kcal < 1500; g++) {
          try { Game.takeFromPantry(pantry.findIndex(i => i && i.foodKind === 'nut' && i.foodState === 'shelled')); } catch (e) { break; }
          try { Game.eat(); } catch (e) {}
        }
        ate = s.kcal - kcalBefore;
      } catch (e) {}
      check('GREEN: engine pantry-eat eats the shelled nuts', ate > 500, `ate=${ate} from ${kcalBefore}`);
    } finally { delete process.env.SHELLCOUNTER; }
  }
}

async function partB() {
  console.log('PART B — perturb neutrality (PERTURBDAWN=1, differential vs base upkeep)');
  // Neutrality is differential: the perturb beat must add EXACTLY 4 ticks and
  // nothing else relative to the base policy's own upkeep on an identical
  // fixture (the base upkeep itself eats from the pantry — kcal/pantry move in
  // the control too, so absolute checks are confounded).
  async function runUpkeep(policy) {
    const Game = await buildFixture(7301);
    const pantryBefore = pantrySig(Game);
    const counterBefore = JSON.stringify(counterNutsOf(Game).map(i => [i.name, i.foodState, i.units, i.hiddenKcal]));
    try { await quietLog(async () => { policy.upkeep(Game, {}); }); } catch (e) {}
    return { Game, pantryBefore, counterBefore,
      ticks: Game.state.scholar.dayTicks,
      kcal: Game.state.scholar.kcal,
      pantry: pantrySig(Game),
      counter: JSON.stringify(counterNutsOf(Game).map(i => [i.name, i.foodState, i.units, i.hiddenKcal])),
    };
  }
  {
    delete process.env.PERTURBDAWN;
    const base = await runUpkeep(belongfeast);
    process.env.PERTURBDAWN = '1';
    let armed;
    try {
      const wrapped = PD.withPerturbDawn(belongfeast, 'belongfeast+perturbdawn-test', 'test');
      armed = await runUpkeep(wrapped);
    } finally { delete process.env.PERTURBDAWN; }
    check('perturb: counter nuts untouched (still in shell)',
      armed.counter === armed.counterBefore, 'counter changed');
    check('perturb: no food moved by the beat (pantry delta == base delta)',
      armed.pantry !== armed.pantryBefore ? (armed.pantry === base.pantry) : true,
      `armedPantryMoved=${armed.pantry !== armed.pantryBefore} basePantry=${base.pantry.slice(0, 60)}`);
    check('perturb: scholar kcal delta == base delta (no kcal created/destroyed)',
      armed.kcal === base.kcal, `armed=${armed.kcal} base=${base.kcal}`);
    check('perturb: exactly 4 extra ticks vs base upkeep',
      armed.ticks === base.ticks + 4, `armedTicks=${armed.ticks} baseTicks=${base.ticks}`);
  }
  // Same gates as the shell arm: fed scholar -> no fire -> identical to base
  {
    const fedFixture = async (policy) => {
      const Game = await buildFixture(7301);
      Game.state.scholar.kcal = 2900; // FED
      try { await quietLog(async () => { policy.upkeep(Game, {}); }); } catch (e) {}
      return { ticks: Game.state.scholar.dayTicks, kcal: Game.state.scholar.kcal };
    };
    delete process.env.PERTURBDAWN;
    const base = await fedFixture(belongfeast);
    process.env.PERTURBDAWN = '1';
    let armed;
    try {
      const wrapped = PD.withPerturbDawn(belongfeast, 'belongfeast+perturbdawn-test', 'test');
      armed = await fedFixture(wrapped);
    } finally { delete process.env.PERTURBDAWN; }
    check('perturb: no fire on FED days (identical to base)', armed.ticks === base.ticks && armed.kcal === base.kcal,
      `armed=${armed.ticks}/${armed.kcal} base=${base.ticks}/${base.kcal}`);
  }
}

async function partC() {
  console.log('PART C — det-gate (both wrappers gate-off vs unwrapped base, 30d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  async function hashesFor(policy, seed) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    let r;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days: 30, sampleEvery: 1 }); });
    return { hashes, end: r.days + '/' + r.endReason };
  }
  const seeds = [7301, 7302, 7303, 7304];
  let identical = 0, total = 0, substrateNoise = 0;
  for (const seed of seeds) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      delete process.env.SHELLCOUNTER; delete process.env.PERTURBDAWN; // gates OFF
      const wShell = SC.withShellCounter(base, pid + '+shellcounter', 'det');
      const wPert = PD.withPerturbDawn(base, pid + '+perturbdawn', 'det');
      let a, b, c, d;
      await quietLog(async () => { a = await hashesFor(wShell, seed); });
      await quietLog(async () => { d = await hashesFor(wPert, seed); });
      await quietLog(async () => { b = await hashesFor(base, seed); });
      await quietLog(async () => { c = await hashesFor(base, seed); });
      const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
      const substrateClean = eq(b, c);
      if (!substrateClean) { substrateNoise++; console.log(`  NOTE s${seed} ${pid}: base-vs-base diverges — substrate noise`); continue; }
      total += 2;
      if (eq(a, b)) { identical++; console.log(`  ok   s${seed} ${pid}: shellcounter-off byte-identical`); }
      else { fail++; console.log(`  FAIL s${seed} ${pid}: shellcounter-off divergence (layer-attributable)`); }
      if (eq(d, b)) { identical++; console.log(`  ok   s${seed} ${pid}: perturbdawn-off byte-identical`); }
      else { fail++; console.log(`  FAIL s${seed} ${pid}: perturbdawn-off divergence (layer-attributable)`); }
    }
  }
  check('det-gate: no wrapper-attributable divergence (gates off)', identical === total && total > 0, `${identical}/${total} identical, ${substrateNoise} substrate-noise skips`);
}

async function partD() {
  console.log('PART D — attribution math unit test (mirrors scripts/analyze-shellharm-b.js)');
  const A = require('./analyze-shellharm-b');
  // Case 1: armed excess all in the tail -> 100% timing-attributed
  const pair1 = { controlVill: [{ day: 120 }], shellVill: [{ day: 120 }, { day: 200 }, { day: 205 }], perturbVill: [{ day: 120 }],
                  controlLost: 9999, shellLost: 180 };
  const r1 = A.attributePair(pair1);
  check('tail-only excess -> timing 1.00', r1.timing === 2 && r1.residual === 0 && r1.share === 1,
    JSON.stringify(r1));
  // Case 2: pre-collapse excess, perturb replicates -> timing-attributed
  const pair2 = { controlVill: [{ day: 100 }], shellVill: [{ day: 100 }, { day: 140 }, { day: 150 }],
                  perturbVill: [{ day: 100 }, { day: 138 }, { day: 152 }], controlLost: 9999, shellLost: 9999 };
  const r2 = A.attributePair(pair2);
  check('replicated pre-collapse excess -> timing', r2.timing === 2 && r2.residual === 0, JSON.stringify(r2));
  // Case 3: pre-collapse excess, perturb does NOT replicate -> residual (genuine)
  const pair3 = { controlVill: [{ day: 100 }], shellVill: [{ day: 100 }, { day: 140 }, { day: 150 }],
                  perturbVill: [{ day: 100 }], controlLost: 9999, shellLost: 9999 };
  const r3 = A.attributePair(pair3);
  check('unreplicated pre-collapse excess -> residual', r3.timing === 0 && r3.residual === 2 && r3.share === 0, JSON.stringify(r3));
  // Case 4: mixed
  const pair4 = { controlVill: [{ day: 100 }], shellVill: [{ day: 100 }, { day: 140 }, { day: 210 }],
                  perturbVill: [{ day: 100 }, { day: 142 }], controlLost: 9999, shellLost: 200 };
  const r4 = A.attributePair(pair4);
  check('mixed: tail + replicated pre -> timing 2, residual 0', r4.timing === 2 && r4.residual === 0, JSON.stringify(r4));
  // Case 5: control worse -> no excess, nothing to attribute
  const pair5 = { controlVill: [{ day: 100 }, { day: 120 }], shellVill: [{ day: 100 }],
                  perturbVill: [{ day: 100 }], controlLost: 9999, shellLost: 9999 };
  const r5 = A.attributePair(pair5);
  check('control worse -> zero excess, zero attribution', r5.excess === 0 && r5.timing === 0 && r5.residual === 0, JSON.stringify(r5));
}

async function partE() {
  console.log('PART E — SMOKE (1 seed x 2 policies x {control,shell,perturb}, 12d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  let ran = 0, crashed = 0;
  for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
    for (const arm of ['control', 'shell', 'perturb']) {
      delete process.env.SHELLCOUNTER; delete process.env.PERTURBDAWN;
      if (arm === 'shell') process.env.SHELLCOUNTER = '1';
      if (arm === 'perturb') process.env.PERTURBDAWN = '1';
      const pol = arm === 'control' ? base
        : arm === 'shell' ? SC.withShellCounter(base, pid + '+shellcounter', 'smoke')
        : PD.withPerturbDawn(base, pid + '+perturbdawn', 'smoke');
      try {
        const { Game } = await loadGame({ seed: 7301, mode: 'leanwinter', fullTelemetry: false });
        await setupGame(Game);
        let r;
        await quietLog(async () => { r = await runDays(Game, pol, { days: 12, sampleEvery: 30 }); });
        ran++;
        if (!r || typeof r.days !== 'number') { crashed++; console.log(`  FAIL smoke ${pid} ${arm}: bad result`); }
      } catch (e) { crashed++; console.log(`  FAIL smoke ${pid} ${arm}: ${e.message}`); }
    }
  }
  delete process.env.SHELLCOUNTER; delete process.env.PERTURBDAWN;
  check('SMOKE: 6/6 short runs completed without exceptions', crashed === 0 && ran === 6, `ran=${ran} crashed=${crashed}`);
}

(async () => {
  await partA();
  await partB();
  await partC();
  await partD();
  await partE();
  console.log(`\nPROOF RESULT: ${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASHED', e); process.exit(1); });
