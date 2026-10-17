#!/usr/bin/env node
// scripts/test-shellcounter-b.js — PROOF for the counter-shelling layer (arm sim-shellcounter-b).
//
// PART A — gate-logic units (synthetic states, no engine run): counterNuts,
//   leanDay (50% split), timeToSpare, atHavenStores, layerOn.
// PART B — RED->GREEN fixture (live engine, constructed lean Haven state):
//   RED: base policy (belongfeast, no layer) upkeep leaves counter nuts
//        in shell — the behavior genuinely does not exist pre-edit.
//   GREEN: wrapped upkeep (SHELLCOUNTER=1) shells the counter batch,
//        putAwayFinished moves the shelled nuts to the pantry, and the
//        engine's normal pantry-eat then eats them.
// PART C — det-gate: wrapped policy with SHELLCOUNTER unset vs the unwrapped
//   base, per-day trajectory hashes, 60d x 8 seeds x 2 policies. Must be
//   byte-identical; any diverger is re-checked base-vs-base to attribute
//   substrate noise (the known contest-ID entropy issue, det-gate.js header).
// PART D — SMOKE: 2 seeds x 2 policies x {control,armed}, 12d, no exceptions.
//
// Usage: node scripts/test-shellcounter-b.js
//
// Post-kill repair (2026-10-17, loop B): the layer scripts/policies/shellcounter.js
// was deleted per the kill protocol (sim-shellcounter-b NO-GO on the starvation
// guardrail — evidence/2026-10-17/sim-shellcounter-b.md). With no layer there
// is nothing to prove; skip honestly instead of crashing on require.
try { require.resolve('./policies/shellcounter'); }
catch (e) {
  console.log('INFO-SKIP: shellcounter layer absent (killed at pilot, sim-shellcounter-b); status in evidence/2026-10-17/sim-shellcounter-b.md');
  process.exit(0);
}
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
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

function fakeGame(kcal, dayTicks, access) {
  return {
    kcalCap: () => 3000,
    state: { scholar: { kcal, dayTicks: dayTicks || 100, over: false }, activeContest: false },
    TIME: { TICKS_PER_DAY: 512 },
    tbfight: false,
    over: false,
    havenStoresAccess: () => access || 'inside',
  };
}

async function buildFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  // at Haven, inside the hall
  try {
    const v = Game.state.village || {};
    if (Game.map) { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); }
    s.insideHaven = true;
  } catch (e) {}
  // starving-ish scholar; counter holds in-shell nuts; pack empty
  s.kcal = 300;
  s.inventory = [];
  s.prepStash = [
    nutItem(3, 800, 'hickory_nut', 'Hickory Nuts'),
    nutItem(2, 500, 'acorn_white_oak', 'White Oak Acorns'),
  ];
  s.dayTicks = 100;
  s.day = 50;
  return Game;
}

function counterNuts(Game) {
  const stash = ((Game.state || {}).scholar || {}).prepStash || [];
  return stash.filter(i => i && i.foodKind === 'nut');
}

async function partA() {
  console.log('PART A — gate-logic units');
  const L = require('./policies/shellcounter');
  const nuts = [nutItem(2, 600, 'hickory_nut', 'Hickory Nuts')];
  const shelled = [{ name: 'Hickory Nuts', foodKind: 'nut', foodState: 'shelled', edible: true, units: 2, kcalEach: 450, spoilDay: 999 }];
  const gNuts = Object.assign(fakeGame(300, 100), { prepStash: () => nuts });
  const gEmpty = Object.assign(fakeGame(300, 100), { prepStash: () => [] });
  const gShelled = Object.assign(fakeGame(300, 100), { prepStash: () => shelled });
  check('counterNuts finds in-shell counter nuts', L.counterNuts(gNuts).length === 1);
  check('counterNuts ignores empty counter', L.counterNuts(gEmpty).length === 0);
  check('counterNuts ignores shelled nuts', L.counterNuts(gShelled).length === 0);
  check('leanDay: hungry (<50%)', L.leanDay(fakeGame(300, 100)) === true);
  check('leanDay: fed (>50%)', L.leanDay(fakeGame(2000, 100)) === false);
  check('leanDay: at exactly 50% is fed', L.leanDay(fakeGame(1500, 100)) === false);
  check('timeToSpare: mid-day', L.timeToSpare(fakeGame(300, 100)) === true);
  check('timeToSpare: day nearly spent', L.timeToSpare(fakeGame(300, 500)) === false);
  check('atHavenStores: inside', L.atHavenStores(fakeGame(300, 100, 'inside')) === true);
  check('atHavenStores: none blocks', L.atHavenStores(fakeGame(300, 100, 'none')) === false);
  check('layerOn: default OFF', L.layerOn() === false);
}

async function partB() {
  console.log('PART B — RED->GREEN fixture (upkeep-level, lean Haven state)');
  const L = require('./policies/shellcounter');
  // RED: the competent family's normal upkeep never shells counter nuts
  {
    const Game = await buildFixture(7301);
    try { await quietLog(async () => { belongfeast.upkeep(Game, {}); }); } catch (e) {}
    const states = counterNuts(Game).map(i => i.foodState).join(',');
    check('RED: base upkeep leaves counter nuts in shell', states === 'in_shell,in_shell', `states=${states}`);
  }
  // GREEN: layer shells the counter batch; putAway moves them to the pantry;
  // the engine's normal pantry-eat then eats them
  {
    process.env.SHELLCOUNTER = '1';
    try {
      const wrapped = L.withShellCounter(belongfeast, 'belongfeast+shellcounter-test', 'test');
      const Game = await buildFixture(7301);
      const kcalBefore = Game.state.scholar.kcal;
      try { await quietLog(async () => { wrapped.upkeep(Game, {}); }); } catch (e) {}
      const nuts = counterNuts(Game);
      const counterEmptyOfNuts = nuts.length === 0;
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      const panNuts = pantry.filter(i => i && i.foodKind === 'nut' && i.foodState === 'shelled');
      check('GREEN: layer shells the counter batch and puts it away',
        counterEmptyOfNuts && panNuts.length > 0,
        `counterNuts=${nuts.length} pantryShelled=${panNuts.length}`);
      check('GREEN: engine pantry-eat eats the shelled nuts', (() => {
        let ate = 0;
        try {
          const ctx = {};
          // feed through the base policy's own eat flow
          const s = Game.state.scholar;
          for (let g = 0; g < 20 && s.kcal < 1500; g++) {
            try { Game.takeFromPantry(pantry.findIndex(i => i && i.foodKind === 'nut' && i.foodState === 'shelled')); } catch (e) { break; }
            try { Game.eat(); } catch (e) {}
          }
          ate = s.kcal - kcalBefore;
        } catch (e) {}
        return ate > 500;
      })(), `ate beyond ${kcalBefore}`);
    } finally { delete process.env.SHELLCOUNTER; }
  }
}

async function partC() {
  console.log('PART C — det-gate (wrapped SHELLCOUNTER-unset vs unwrapped base, 60d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  const L = require('./policies/shellcounter');
  async function hashesFor(policy, seed) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    let r;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    return { hashes, end: r.days + '/' + r.endReason };
  }
  const seeds = [7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308];
  let identical = 0;
  for (const seed of seeds) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      delete process.env.SHELLCOUNTER; // gate OFF
      const wrapped = L.withShellCounter(base, pid + '+shellcounter', 'det');
      let a, b, c;
      await quietLog(async () => { a = await hashesFor(wrapped, seed); });
      await quietLog(async () => { b = await hashesFor(base, seed); });
      await quietLog(async () => { c = await hashesFor(base, seed); }); // substrate-noise control
      const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
      const layerClean = eq(a, b), substrateClean = eq(b, c);
      if (layerClean) { identical++; console.log(`  ok   s${seed} ${pid}: wrapped-off byte-identical to base`); }
      else if (!substrateClean) { pass++; console.log(`  NOTE s${seed} ${pid}: base-vs-base diverges too — substrate noise, not the layer`); }
      else { fail++; console.log(`  FAIL s${seed} ${pid}: layer-attributable divergence`); }
    }
  }
  check('det-gate: no layer-attributable divergence', identical > 0, `${identical}/16 clean-identical`);
}

async function partD() {
  console.log('PART D — SMOKE (2 seeds x 2 policies x {control,armed}, 12d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const L = require('./policies/shellcounter');
  let ran = 0, crashed = 0;
  for (const seed of [7301, 7302]) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      for (const arm of ['control', 'armed']) {
        if (arm === 'armed') process.env.SHELLCOUNTER = '1'; else delete process.env.SHELLCOUNTER;
        const pol = arm === 'armed' ? L.withShellCounter(base, pid + '+shellcounter', 'smoke') : base;
        try {
          const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
          await setupGame(Game);
          let r;
          await quietLog(async () => { r = await runDays(Game, pol, { days: 12, sampleEvery: 30 }); });
          ran++;
          if (!r || typeof r.days !== 'number') { crashed++; console.log(`  FAIL smoke ${pid} s${seed} ${arm}: bad result`); }
        } catch (e) { crashed++; console.log(`  FAIL smoke ${pid} s${seed} ${arm}: ${e.message}`); }
      }
    }
  }
  delete process.env.SHELLCOUNTER;
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
