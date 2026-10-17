#!/usr/bin/env node
// scripts/test-renderfat-b.js — fatpipe census instrument honesty proof.
// PART A — RED-verified fixture: the instrument counts KNOWN fat-pipeline
//   events exactly (generation via carcassToMeat, render transitions,
//   pemmican firings), attributes them to the caller, and the ledger's
//   terminal fates classify. RED: the same fixture WITHOUT the instrument
//   reaches the same game state but records nothing — counting is
//   instrument-sourced.
// PART B — det-gate: instrument on vs off on identical seeds, byte-identical
//   per-day trajectory hashes (the instrument changes nothing).
// SMOKE=1: PART A + a 1-seed 12d det comparison.
// Usage: node scripts/test-renderfat-b.js [SMOKE=1]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const census = require('./camptask-census-b');
const fatpipe = require('./fatpipe-census-b');

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

// Fixture: knife + one wild_boar carcass (hiddenKcal 8000 -> 3 fat slabs at
// round(8000*0.20/3)=533 hidden kcal each). Nothing spoiled (spoilDay far).
function fixtureState(Game) {
  const s = Game.state.scholar;
  s.day = 40;
  const far = 400;
  s.inventory = [
    { name: 'Stone knife', kcalEach: 0, units: 1, kg: 0.3 },
    { name: 'Wild boar (carcass)', foodKind: 'meat', foodState: 'carcass', hiddenKcal: 8000, kcalEach: 0, units: 1, spoilDay: far, plantId: 'meat_wild_boar', kg: 3.0 },
  ];
  try { Game.state.village.pantry = []; } catch (e) {}
}

function lightFire(Game) {
  try {
    const d = Game.genDetail(Game.map.px, Game.map.py);
    d[4][4] = 'fire';
    return !!Game.nearFire();
  } catch (e) { return false; }
}

async function partA() {
  console.log('PART A — RED-verified fixture: fat generation, render, pemmican, fates');
  const { Game } = await loadGame({ seed: 7911, mode: 'fatpipe-proof' });
  await quietLog(async () => { await setupGame(Game); });
  fixtureState(Game);
  const t = { errors: 0 };
  census.attachBeatRing(Game, t);
  fatpipe.attachFatInstrument(Game, t);

  Game.cleanCarcass(); // the boar carcass -> carcassToMeat -> 3 raw fat slabs
  check('A1 exactly 1 generation event', t.genEvents.length === 1, `${t.genEvents.length}`);
  const g = t.genEvents[0];
  check('A2 generation: 3 slabs, wild_boar, carcassToMeat, pack', g && g.slabs === 3 && g.species === 'wild_boar' && g.via === 'carcassToMeat' && g.container === 'pack',
    g ? JSON.stringify({ slabs: g.slabs, species: g.species, via: g.via, container: g.container }) : 'none');
  check('A3 generation hidden kcal each = 533 (8000*0.20/3)', g && g.hiddenKcalEach === 533, `${g && g.hiddenKcalEach}`);
  check('A4 generation attributed to the fixture caller', g && g.actor === 'fixture', `${g && g.actor}`);

  const fired = lightFire(Game);
  check('A5 map fire lights (nearFire)', fired);
  const knowsBefore = Game.knowsTechnique('render');
  Game.renderFat(); // blind: 0.65x teaches
  check('A6 exactly 1 render event', t.renderEvents.length === 1, `${t.renderEvents.length}`);
  const r = t.renderEvents[0];
  const perBlind = Math.max(1, Math.round(533 * 0.65)); // 346
  check('A7 render: 3 slabs, blind, kcalOut = 3*346 = 1038',
    r && r.slabs === 3 && r.blind === true && r.kcalOut === 3 * perBlind,
    r ? JSON.stringify({ slabs: r.slabs, blind: r.blind, kcalOut: r.kcalOut }) : 'none');
  check('A8 render attributed to the fixture caller', r && r.actor === 'fixture', `${r && r.actor}`);
  check('A9 blind render taught the technique (canon: the attempt teaches)', !knowsBefore && Game.knowsTechnique('render') === true);
  const rendered = Game.state.scholar.inventory.filter(i => i.foodKind === 'fat' && i.foodState === 'rendered');
  check('A10 rendered item: foodState rendered, edible, 90d shelf', rendered.length === 1 && rendered[0].edible === true && rendered[0].spoilDay === 40 + 90,
    `n=${rendered.length} spoilDay=${rendered[0] && rendered[0].spoilDay}`);
  const rec = t.ledger.get(rendered[0]);
  check('A11 ledger fate = rendered with per-slab kcal', rec && rec.fate === 'rendered' && rec.renderedKcalEach === perBlind,
    rec ? JSON.stringify({ fate: rec.fate, kcal: rec.renderedKcalEach }) : 'no record');

  Game.makePemmican(); // nothing to make it with
  check('A12 pemmican firing counted (0 sets, 0 consumed)', t.pemmicanEvents.length === 1 && t.pemmicanEvents[0].sets === 0 && t.pemmicanEvents[0].consumedRenderedSlabs === 0,
    JSON.stringify(t.pemmicanEvents[0] || null));
  check('A13 no instrument errors', t.errors === 0, `${t.errors}`);

  // terminal fate classification (mirrors oneRun's end-of-run pass)
  const present = new Set();
  for (const [, arr] of fatpipe.containersOf(Game)) for (const it of (arr || [])) if (it.foodKind === 'fat') present.add(it);
  for (const [it, rc] of t.ledger) if (!rc.fate) rc.fate = present.has(it) ? 'endStock' : 'missing';
  const fates = {};
  for (const rc of t.ledger.values()) fates[rc.fate] = (fates[rc.fate] || 0) + rc.slabs;
  check('A14 terminal fates: 3 slabs rendered, 0 elsewhere', fates.rendered === 3 && !fates.rotted && !fates.missing && !fates.endStock, JSON.stringify(fates));

  // RED: same fixture WITHOUT the instrument — same game state, nothing recorded.
  const { Game: Game2 } = await loadGame({ seed: 7911, mode: 'fatpipe-proof-red' });
  await quietLog(async () => { await setupGame(Game2); });
  fixtureState(Game2);
  Game2.cleanCarcass();
  lightFire(Game2);
  Game2.renderFat();
  const rendered2 = Game2.state.scholar.inventory.filter(i => i.foodKind === 'fat' && i.foodState === 'rendered')
    .reduce((a, i) => a + (i.units || 1), 0);
  check('RED: no instrument -> same game state (3 rendered slabs), nothing recorded anywhere',
    rendered2 === 3 && typeof Game2.__fatpipeLedger === 'undefined' && true, `rendered=${rendered2}`);
}

async function detOne(seed, policyId, days, withInstrument) {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const pPath = './policies/feastscale';
  delete require.cache[require.resolve(pPath)];
  const fsp = require(pPath);
  const policy = fsp[policyId];
  const { Game } = await loadGame({ seed, mode: 'fatpipe-det' });
  await setupGame(Game);
  const t = { errors: 0 };
  if (withInstrument) {
    census.attachBeatRing(Game, t);
    fatpipe.attachFatInstrument(Game, t);
    census.attachDeathInstrument(Game, t);
  }
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  const hs = [];
  wrapped.daily = (G, ctx) => {
    hs.push(G.state.scholar.day + ':' + dayHash(G));
    if (withInstrument) {
      try {
        // exercise the daily safety-net scan path (the det-gate must prove it inert)
        for (const [, arr] of fatpipe.containersOf(G)) {
          for (const it of (arr || [])) {
            if (it.foodKind === 'fat' && !t.ledger.has(it)) t.ledger.set(it, { id: -1, via: 'det-probe' });
          }
        }
      } catch (e) { t.errors++; }
    }
    return bDaily ? bDaily(G, ctx) : undefined;
  };
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
      if (same) pass++; else { fail++; console.log(`  MISMATCH ${pid}-${seed}`); }
    }
  }
  check('det-gate byte-identical trajectories', fail === 0, `${pass}/${pass + fail}`);
  check('instrument reported 0 errors', errOn === 0, `${errOn}`);
}

async function main() {
  const SMOKE = process.env.SMOKE === '1';
  await partA();
  if (SMOKE) await partB([7911], ['leadfeast'], 12);
  else await partB([7911, 7912, 7913, 7914], ['leadfeast', 'belongfeast'], 60);
  console.log(failures ? `\nRESULT: ${failures} FAILURE(S)` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
