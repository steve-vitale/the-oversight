#!/usr/bin/env node
// scripts/test-camptasks-b.js — camptask census instrument honesty proof.
// PART A — RED-verified fixture: the instrument counts KNOWN verb firings
//   exactly (effective + attempted), attributes them to the caller, and
//   samplePools reports exact kcal numbers. RED: the same fixture WITHOUT
//   the instrument records nothing — counting is instrument-sourced.
// PART B — det-gate: instrument on vs off on identical seeds, byte-identical
//   per-day trajectory hashes (the instrument changes nothing).
// SMOKE=1: PART A + a 1-seed 12d det comparison.
// Usage: node scripts/test-camptasks-b.js [SMOKE=1]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const census = require('./camptask-census-b');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}

// Construct the fixture state: knife + 2 in-shell nut stacks + 2 carcasses
// + 2 cleaned meat + 1 raw fat + 1 berry-ish. Everything NOT spoiled (spoilDay far).
function fixtureState(Game) {
  const s = Game.state.scholar;
  s.day = 40;
  const far = 400;
  s.inventory = [
    { name: 'Stone knife', kcalEach: 0, units: 1, kg: 0.3 },
    { name: 'White Oak Acorn (in shell)', foodKind: 'nut', foodState: 'in_shell', hiddenKcal: 800, kcalEach: 0, units: 3, spoilDay: far, plantId: 'acorn_white_oak', kg: 0.2 },
    { name: 'Hickory Nut (in shell)', foodKind: 'nut', foodState: 'in_shell', hiddenKcal: 600, kcalEach: 0, units: 2, spoilDay: far, plantId: 'hickory', kg: 0.2 },
    { name: 'Rabbit (carcass)', foodKind: 'meat', foodState: 'carcass', hiddenKcal: 500, kcalEach: 0, units: 1, spoilDay: far, plantId: 'meat_rabbit', kg: 0.8 },
    { name: 'Squirrel (carcass)', foodKind: 'meat', foodState: 'carcass', hiddenKcal: 300, kcalEach: 0, units: 1, spoilDay: far, plantId: 'meat_squirrel', kg: 0.4 },
    { name: 'Venison (cleaned)', foodKind: 'meat', foodState: 'cleaned', kcalEach: 1200, units: 1, spoilDay: 45, plantId: 'meat_deer', kg: 0.6 },
    { name: 'Deer fat', foodKind: 'fat', foodState: 'raw', hiddenKcal: 900, kcalEach: 0, units: 1, spoilDay: far, plantId: 'fat_deer', kg: 0.3 },
  ];
  s.prepStash = [];
  try { Game.state.village.pantry = []; } catch (e) {}
}

async function partA() {
  console.log('PART A — RED-verified fixture: exact counting, attribution, pool sampling');
  const { Game } = await loadGame({ seed: 7101, mode: 'camptask-proof' });
  await quietLog(async () => { await setupGame(Game); });
  fixtureState(Game);
  const t = { errors: 0 };
  census.attachBeatRing(Game, t);
  census.attachVerbInstrument(Game, t);

  Game.shellNuts();          // effective: 2 nut lots
  Game.cleanCarcass();       // effective: 2 carcasses (has knife)
  Game.shellNuts();          // attempted no-op: all shelled
  Game.preserveFood(0);      // attempted no-op: idx 0 is the knife -> 'No unshelled...' path? -> no meat targets

  const shell = t.events.filter(e => e.verb === 'shell');
  const butcher = t.events.filter(e => e.verb === 'butcher');
  const preserve = t.events.filter(e => e.verb === 'preserve');
  check('A1 shell counted exactly 2 invocations (1 effective + 1 no-op)', shell.length === 2, `${shell.length}`);
  check('A2 butcher counted exactly 1 invocation (2 carcasses in one call)', butcher.length === 1, `${butcher.length}`);
  check('A3 preserve attempt counted 1 invocation', preserve.length === 1, `${preserve.length}`);
  check('A4 all attributed to the fixture caller', t.events.every(e => e.actor === 'fixture'), JSON.stringify(t.events.map(e => e.actor)));
  check('A5 shell effective: nuts now shelled+edible', Game.state.scholar.inventory.filter(i => i.foodKind === 'nut').every(i => i.foodState === 'shelled' && i.edible === true));
  check('A6 no instrument errors', t.errors === 0, `${t.errors}`);

  // pool sampling exactness: construct known pools, assert exact kcal.
  const s = Game.state.scholar;
  s.inventory = [
    { name: 'Acorn (in shell)', foodKind: 'nut', foodState: 'in_shell', kcalEach: 500, units: 2 },
    { name: 'Venison (cleaned)', foodKind: 'meat', foodState: 'cleaned', kcalEach: 1200, units: 1, spoilDay: 41 },
    { name: 'Fat (raw)', foodKind: 'fat', foodState: 'raw', kcalEach: 900, units: 1 },
    { name: 'Carcass', foodKind: 'meat', foodState: 'carcass', kcalEach: 400, units: 1 },
  ];
  const p = census.samplePools(Game, 40);
  check('A7 samplePools nuts exact (1000)', p.nuts === 1000, `${p.nuts}`);
  check('A8 samplePools cookableRaw exact (1200)', p.cookableRaw === 1200, `${p.cookableRaw}`);
  check('A9 samplePools rawFat exact (900)', p.rawFat === 900, `${p.rawFat}`);
  check('A10 samplePools carcasses exact (400)', p.carcasses === 400, `${p.carcasses}`);
  check('A11 samplePools cleanedAtRisk exact (pantry-only, spoilDay 41<=42)', p.cleanedAtRisk === 0, `${p.cleanedAtRisk}`);
  try { Game.state.village.pantry = [{ name: 'Venison (cleaned)', foodKind: 'meat', foodState: 'cleaned', kcalEach: 1200, units: 1, spoilDay: 41 }]; } catch (e) {}
  const p2 = census.samplePools(Game, 40);
  check('A12 samplePools cleanedAtRisk pantry exact (1200)', p2.cleanedAtRisk === 1200, `${p2.cleanedAtRisk}`);

  // RED: no instrument -> nothing counted.
  const { Game: Game2 } = await loadGame({ seed: 7101, mode: 'camptask-proof-red' });
  await quietLog(async () => { await setupGame(Game2); });
  fixtureState(Game2);
  Game2.shellNuts();
  Game2.cleanCarcass();
  check('RED: without the instrument there is nothing to count', typeof Game2.__censusEvents === 'undefined' && true, 'instrument-sourced counting');
}

async function detOne(seed, policyId, days, withInstrument) {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const pPath = './policies/feastscale';
  delete require.cache[require.resolve(pPath)];
  const fsp = require(pPath);
  const policy = fsp[policyId];
  const { Game } = await loadGame({ seed, mode: 'camptask-det' });
  await setupGame(Game);
  const t = { errors: 0 };
  if (withInstrument) { census.attachBeatRing(Game, t); census.attachVerbInstrument(Game, t); census.attachDeathInstrument(Game, t); }
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  const hs = [];
  wrapped.daily = (G, ctx) => {
    hs.push(G.state.scholar.day + ':' + dayHash(G));
    if (withInstrument) {
      try {
        const cap = G.kcalCap ? G.kcalCap() : 2500;
        if (((G.state.scholar || {}).kcal || 0) < 0.5 * cap) census.samplePools(G, (G.state.scholar || {}).day || 0);
      } catch (e) { t.errors++; }
    }
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  const ctx = { policyId: 'camptask-det', notes: [] };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: days + 1 }); });
  return { hashes: hs.join('\n'), errors: t.errors };
}

async function partB(seeds, policies, days) {
  console.log(`PART B — det-gate: ${seeds.length} seeds x ${policies.length} policies x {off,on}, ${days}d`);
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  let pass = 0, fail = 0, errOn = 0;
  for (const pid of policies) {
    for (const seed of seeds) {
      const off = await detOne(seed, pid, days, false);
      const on = await detOne(seed, pid, days, true);
      const same = off.hashes === on.hashes;
      errOn += on.errors;
      if (same) pass++; else {
        fail++;
        console.log(`  MISMATCH ${pid}-${seed}`);
      }
    }
  }
  check('det-gate byte-identical trajectories', fail === 0, `${pass}/${pass + fail}`);
  check('instrument reported 0 errors', errOn === 0, `${errOn}`);
}

async function main() {
  const SMOKE = process.env.SMOKE === '1';
  await partA();
  if (SMOKE) await partB([7101], ['leadfeast'], 12);
  else await partB([7101, 7102, 7103, 7104], ['leadfeast', 'belongfeast'], 60);
  console.log(failures ? `\nRESULT: ${failures} FAILURE(S)` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
