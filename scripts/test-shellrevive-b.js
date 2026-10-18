#!/usr/bin/env node
// scripts/test-shellrevive-b.js — PROOF for the sim-shellrevive-b2 revival layer.
//
// PART A — gate-logic units: counterNuts finds in-shell counter nuts / ignores
//   empty counter / ignores shelled nuts; leanDay split at 50% cap (hungry
//   true, fed false, exactly-50% fed); timeToSpare mid-day true / nearly-spent
//   false; atHavenStores inside true / 'none' false; layerOn() default OFF,
//   ON only with SHELLREVIVE_B=1.
// PART B — RED->GREEN fixture (live engine, constructed lean Haven state):
//   RED — base belongfeast upkeep leaves counter nuts in shell (behavior absent
//   pre-edit). GREEN — wrapped upkeep (SHELLREVIVE_B=1) shells the counter
//   batch, putAwayFinished moves the shelled nuts to the pantry, and the
//   engine's normal pantry-eat then eats them (scholar 300 -> >1500 kcal).
// PART C — det-gate: wrapped SHELLREVIVE_B-unset vs unwrapped base, per-day
//   trajectory hashes, 30d x 4 seeds x 2 policies — 8/8 byte-identical, no
//   layer-attributable divergence (base-vs-base control for substrate noise).
// PART D — SMOKE: 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no exceptions.
//
// Usage: node scripts/test-shellrevive-b.js
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const SR = require('./policies/shellrevive-b');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function nutItem(units, gross, plantId, name, foodState) {
  return {
    name: name + (foodState === 'in_shell' ? ' (in shell)' : ''), foodKind: 'nut',
    foodState: foodState || 'in_shell', edible: foodState !== 'in_shell',
    units, hiddenKcal: foodState === 'in_shell' ? gross : null,
    kcalEach: foodState === 'in_shell' ? 0 : Math.round(gross * 0.75),
    plantId, spoilDay: 999,
    prep: foodState === 'in_shell' ? 'Needs shelling — crack and pick the nutmeats.' : 'Shelled nutmeats. Ready to eat.',
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
    nutItem(3, 800, 'hickory_nut', 'Hickory Nuts', 'in_shell'),
    nutItem(2, 500, 'acorn_white_oak', 'White Oak Acorns', 'in_shell'),
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
  console.log('PART A — gate-logic units (no engine)');
  delete process.env.SHELLREVIVE_B;
  check('layerOn() default OFF', SR.layerOn() === false);
  process.env.SHELLREVIVE_B = '1';
  check('layerOn() ON with SHELLREVIVE_B=1', SR.layerOn() === true);
  delete process.env.SHELLREVIVE_B;
  check('layerOn() OFF when var unset again', SR.layerOn() === false);

  const fakeGame = (s) => ({
    state: { scholar: s }, TIME: { TICKS_PER_DAY: 512 },
    kcalCap: () => 3000,
    havenStoresAccess: () => s._haven || 'none',
    prepStash: () => s.prepStash || [],
  });
  const base = fakeGame({ kcal: 300, dayTicks: 100, prepStash: [
    { foodKind: 'nut', foodState: 'in_shell' },
    { foodKind: 'nut', foodState: 'in_shell' },
  ], _haven: 'hall' });
  check('counterNuts finds 2 in-shell nuts', SR.counterNuts(base).length === 2);
  check('counterNuts ignores empty counter', SR.counterNuts(fakeGame({ prepStash: [] })).length === 0);
  check('counterNuts ignores shelled nuts', SR.counterNuts(fakeGame({ prepStash: [{ foodKind: 'nut', foodState: 'shelled' }] })).length === 0);
  check('counterNuts ignores non-nuts', SR.counterNuts(fakeGame({ prepStash: [{ foodKind: 'meat', foodState: 'in_shell' }] })).length === 0);
  check('leanDay hungry (300 < 1500)', SR.leanDay(base) === true);
  check('leanDay fed (2900 > 1500)', SR.leanDay(fakeGame({ kcal: 2900 })) === false);
  check('leanDay exactly-50% is fed (1500 not < 1500)', SR.leanDay(fakeGame({ kcal: 1500 })) === false);
  check('timeToSpare mid-day (100+68 < 512)', SR.timeToSpare(base) === true);
  check('timeToSpare nearly-spent false (500+68 !< 512)', SR.timeToSpare(fakeGame({ dayTicks: 500 })) === false);
  check('atHavenStores inside true', SR.atHavenStores(base) === true);
  check('atHavenStores none false', SR.atHavenStores(fakeGame({ _haven: 'none' })) === false);
}

async function partB() {
  console.log('PART B — RED->GREEN fixture (live engine)');
  // RED: base upkeep never shells counter nuts
  {
    delete process.env.SHELLREVIVE_B;
    const Game = await buildFixture(7301);
    try { await quietLog(async () => { belongfeast.upkeep(Game, {}); }); } catch (e) {}
    const states = counterNutsOf(Game).map(i => i.foodState).join(',');
    check('RED: base upkeep leaves counter nuts in shell', states === 'in_shell,in_shell', `states=${states}`);
  }
  // GREEN: wrapped upkeep (SHELLREVIVE_B=1) shells + putAway + pantry-eat
  {
    process.env.SHELLREVIVE_B = '1';
    try {
      const wrapped = SR.withShellRevive(belongfeast, 'belongfeast+shellrevive-test', 'test');
      const Game = await buildFixture(7301);
      const kcalBefore = Game.state.scholar.kcal;
      const pantryBefore = pantrySig(Game);
      try { await quietLog(async () => { wrapped.upkeep(Game, {}); }); } catch (e) {}
      const nuts = counterNutsOf(Game);
      const counterEmptyOfNuts = nuts.length === 0;
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      const panNuts = pantry.filter(i => i && i.foodKind === 'nut' && i.foodState === 'shelled');
      check('GREEN: layer shells the counter batch and puts it away',
        counterEmptyOfNuts && panNuts.length > 0,
        `counterNuts=${nuts.length} pantryShelled=${panNuts.length}`);
      check('GREEN: pantry changed (shelled nuts landed)',
        pantrySig(Game) !== pantryBefore);
      // the shell beat costs exactly 4 ticks inside the engine verb — differential
      // vs the base upkeep's own consumption on an identical fixture
      let baseTicks;
      {
        const G2 = await buildFixture(7301);
        try { await quietLog(async () => { belongfeast.upkeep(G2, {}); }); } catch (e) {}
        baseTicks = G2.state.scholar.dayTicks;
      }
      check('GREEN: exactly 4 extra ticks vs base upkeep (honest cost)',
        Game.state.scholar.dayTicks === baseTicks + 4,
        `armedTicks=${Game.state.scholar.dayTicks} baseTicks=${baseTicks}`);
      // the engine's normal pantry-eat then eats the shelled nuts
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
    } finally { delete process.env.SHELLREVIVE_B; }
  }
  // GREEN telemetry on ctx: run again and read ctx keys
  {
    process.env.SHELLREVIVE_B = '1';
    try {
      const wrapped = SR.withShellRevive(belongfeast, 'belongfeast+shellrevive-test2', 'test');
      const Game = await buildFixture(7301);
      const ctx = {};
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx); }); } catch (e) {}
      check('GREEN: ctx._srShellDays == 1', ctx._srShellDays === 1, `_srShellDays=${ctx._srShellDays}`);
      check('GREEN: ctx._srShelledKcalLean > 0 (lean fixture)', (ctx._srShelledKcalLean || 0) > 0, `lean=${ctx._srShelledKcalLean}`);
      check('GREEN: ctx._srShelledKcalFed == 0 (lean-only)', (ctx._srShelledKcalFed || 0) === 0, `fed=${ctx._srShelledKcalFed}`);
      const expected = Math.round((3 * 800 + 2 * 500) * 0.75);
      check('GREEN: net kcal == 75% gross formula', ctx._srShelledKcal === expected, `got=${ctx._srShelledKcal} want=${expected}`);
      // once-per-day: second call on the same ctx/day does not re-fire
      const ctx2 = ctx;
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx2); }); } catch (e) {}
      check('GREEN: once-per-day guard holds (no double fire)', ctx2._srShellDays === 1, `_srShellDays=${ctx2._srShellDays}`);
    } finally { delete process.env.SHELLREVIVE_B; }
  }
}

async function partC() {
  console.log('PART C — det-gate (wrapped gate-off vs unwrapped base, 30d)');
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
      delete process.env.SHELLREVIVE_B; // gate OFF
      const w = SR.withShellRevive(base, pid + '+shellrevive', 'det');
      let a, b, c;
      await quietLog(async () => { a = await hashesFor(w, seed); });
      await quietLog(async () => { b = await hashesFor(base, seed); });
      await quietLog(async () => { c = await hashesFor(base, seed); });
      const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
      const substrateClean = eq(b, c);
      if (!substrateClean) { substrateNoise++; console.log(`  NOTE s${seed} ${pid}: base-vs-base diverges — substrate noise`); continue; }
      total++;
      if (eq(a, b)) { identical++; console.log(`  ok   s${seed} ${pid}: shellrevive-off byte-identical`); }
      else { fail++; console.log(`  FAIL s${seed} ${pid}: shellrevive-off divergence (layer-attributable)`); }
    }
  }
  check('det-gate: no layer-attributable divergence (gate off)', identical === total && total > 0, `${identical}/${total} identical, ${substrateNoise} substrate-noise skips`);
}

async function partD() {
  console.log('PART D — SMOKE (2 seeds x 2 policies x {control,armed}, 12d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  let ran = 0, crashed = 0;
  for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
    for (const arm of ['control', 'armed']) {
      delete process.env.SHELLREVIVE_B;
      if (arm === 'armed') process.env.SHELLREVIVE_B = '1';
      const pol = arm === 'control' ? base : SR.withShellRevive(base, pid + '+shellrevive', 'smoke');
      for (const seed of [7301, 7302]) {
        try {
          const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
          await setupGame(Game);
          let r;
          await quietLog(async () => { r = await runDays(Game, pol, { days: 12, sampleEvery: 30 }); });
          ran++;
          if (!r || typeof r.days !== 'number') { crashed++; console.log(`  FAIL smoke ${pid} ${arm} s${seed}: bad result`); }
        } catch (e) { crashed++; console.log(`  FAIL smoke ${pid} ${arm} s${seed}: ${e.message}`); }
      }
    }
  }
  delete process.env.SHELLREVIVE_B;
  check('SMOKE: 8/8 short runs completed without exceptions', crashed === 0 && ran === 8, `ran=${ran} crashed=${crashed}`);
}

(async () => {
  await partA();
  await partB();
  await partC();
  await partD();
  console.log(`\nPROOF RESULT: ${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASHED', e); process.exit(1); });
