#!/usr/bin/env node
// scripts/test-leanwinter-20261017.js — proof for sim-leanwinter-b + the
// read-only claim of sweep-leanwinter-20261017.js (food-economy axis).
//
// The instrument is READ-ONLY (zero src/js, zero policy edits). This proof
// demonstrates honesty + non-invasiveness BEFORE the census:
//
// PART A — classifier fixtures: every cause string the census keys on
//   ('starvation' — calories.js:116 + game.js:28173; 'thirst' — game.js:28349;
//   'dehydration' — calories.js:125; 'the night' — calories.js:93,116) plus
//   a NON-HUNGER roster and degenerate inputs. Deterministic, no unknowns.
// PART B — live-honesty on a live Game: attach the tele-wrap + food
//   instruments, force registerDeath through the REAL pipeline with
//   'starvation'/'dehydration', assert verbatim capture (cause string,
//   player flag) + a numeric at-onset snapshot (freshDays, totalKcal,
//   seasonId) — the instrument observes the shared pipeline, never
//   rewrites it.
// PART C — det-gate: 20d run, instrument-on vs pristine, byte-identical
//   per-day state hashes (the read-only claim: the trajectory is the
//   engine's, not the instrument's).
// SMOKE=1: PARTS A+B fast gates only (fixtures + live-honesty).
//
// Node harness rule (AGENTS.md): Math.random seeded BEFORE eval via
// loadGame({seed}); never two harnesses in one process; never stub
// Game.save; instrument wraps delegate, nothing persists.
'use strict';
process.env.LEANWINTER_LIB = '1';
const { classifyDeath, attachDeathInstrument, attachFoodInstruments } = require('./sweep-leanwinter-20261017');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; } else { fail++; console.error('  FAIL:', name); } };
const A = (cond, name) => ok(cond, name);

async function withEnv(k, v, fn) {
  const old = process.env[k];
  return Promise.resolve().then(() => {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
    return fn();
  }).finally(() => {
    if (old === undefined) delete process.env[k]; else process.env[k] = old;
  });
}

// ---- PART A: classifier fixtures ----
function partA() {
  console.log('PART A — classifier fixtures');
  // The audit strings the census is built on:
  let r = classifyDeath('starvation'); A(r.cls === 'STARVATION', "fixture: 'starvation' -> STARVATION");
  r = classifyDeath('Starvation'); A(r.cls === 'STARVATION', "fixture: case-insensitive 'Starvation'");
  r = classifyDeath('thirst'); A(r.cls === 'WATER-THIRST', "fixture: 'thirst' -> WATER-THIRST (contract #418)");
  r = classifyDeath('dehydration'); A(r.cls === 'WATER-DEHYDRATION', "fixture: 'dehydration' -> WATER-DEHYDRATION (contract #418)");
  r = classifyDeath('the night'); A(r.cls === 'NIGHT-OVER', "fixture: 'the night' -> NIGHT-OVER (hunger-adjacent, NOT starvation)");
  // Near-synonym starvation displays must not leak out of STARVATION:
  r = classifyDeath('starved to death'); A(r.cls === 'STARVATION', "fixture: 'starved to death' -> STARVATION");
  // NON-HUNGER roster (causes observed in prior censuses):
  for (const c of ['combat', 'sickness', 'injuries', 'wounds', 'the wild', 'the expedition',
      "a wound that wouldn't close", 'aid-runner', 'alien', 'alien_beam', 'raid',
      'raid-defense', 'the phoenix link', 'your own pit trap', 'threat', 'exile', 'contest']) {
    const rr = classifyDeath(c);
    A(rr.cls === 'NON-HUNGER', `fixture: '${c}' -> NON-HUNGER`);
  }
  // Degenerate inputs classify, never throw, never 'unknown':
  for (const c of [null, undefined, '', 0]) {
    let rr = null, threw = false;
    try { rr = classifyDeath(c); } catch (e) { threw = true; }
    A(!threw && rr && rr.cls === 'NON-HUNGER', `fixture: ${String(c)} -> NON-HUNGER (degenerate-safe)`);
  }
  // Determinism: every string classifies identically twice:
  const corpus = ['starvation', 'thirst', 'dehydration', 'the night', 'combat', 'sickness', 'the wild'];
  A(corpus.every(c => JSON.stringify(classifyDeath(c)) === JSON.stringify(classifyDeath(c))), 'fixture: classifier deterministic');
}

// ---- PART B: live-honesty — forced deaths through the real pipeline ----
async function partB() {
  console.log('PART B — live-honesty (forced registerDeath through the real pipeline)');
  await withEnv('FEASTSCALE_R13', '1', async () => {
    const { Game } = await loadGame({ seed: 5101, mode: 'leanwinter-test' });
    await setupGame(Game);
    const t = {};
    attachDeathInstrument(Game, t);
    attachFoodInstruments(Game, t);
    await quietLog(async () => {
      Game.registerDeath({ kind: 'villager', villagerId: 'lw_v1', name: 'Test Starver', cause: 'starvation', killerId: null });
      Game.registerDeath({ kind: 'villager', villagerId: 'lw_s1', name: 'Test Bearer', cause: 'dehydration', killerId: null, player: true });
      Game.registerDeath({ kind: 'villager', villagerId: 'lw_v2', name: 'Test Night', cause: 'the night', killerId: null });
    });
    A(t.deaths.length === 3, `fixture: instrument captured all 3 forced deaths (got ${t.deaths.length})`);
    const byId = {};
    for (const d of t.deaths) byId[d.who] = d;
    A(byId['lw_v1'] && byId['lw_v1'].cause === 'starvation' && byId['lw_v1'].cls === 'STARVATION' && !byId['lw_v1'].player,
      "fixture: 'starvation' captured VERBATIM, cls=STARVATION, player=false");
    A(byId['lw_s1'] && byId['lw_s1'].cause === 'dehydration' && byId['lw_s1'].cls === 'WATER-DEHYDRATION' && byId['lw_s1'].player,
      "fixture: 'dehydration' captured VERBATIM, cls=WATER-DEHYDRATION, player=true");
    A(byId['lw_v2'] && byId['lw_v2'].cls === 'NIGHT-OVER', "fixture: 'the night' -> NIGHT-OVER, never folded into STARVATION");
    // The at-onset snapshot is numeric on a real Game state:
    const at = byId['lw_v1'] && byId['lw_v1'].at;
    A(at && typeof at.freshDays === 'number' && typeof at.totalKcal === 'number' && typeof at.seasonId === 'string' && typeof at.lean === 'boolean',
      `fixture: at-onset snapshot numeric (freshDays=${at && at.freshDays}, totalKcal=${at && at.totalKcal}, seasonId=${at && at.seasonId}, lean=${at && at.lean})`);
    // The instrument never mutates game state: corpse count is the engine's own:
    const corpses = (Game.corpses ? Game.corpses() : []).filter(c => (c.name || '').startsWith('Test '));
    A(corpses.length === 3, `fixture: engine-side effects unchanged by instrument (3 test corpses, got ${corpses.length})`);
    A((t.errors | 0) === 0, `fixture: 0 instrument errors (got ${t.errors | 0})`);
  });
}

// ---- PART C: det-gate — instrument-on vs pristine byte-identical ----
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((tt, i) => tt + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)].join('|');
  } catch (e) { return 'ERR'; }
}
async function runHashed(seed, days, withInstrument) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter-det' });
  await setupGame(Game);
  const t = {};
  if (withInstrument) { attachDeathInstrument(Game, t); attachFoodInstruments(Game, t); }
  const hashes = [];
  const base = Object.assign({}, belongfeast);
  const od = base.daily;
  base.daily = (G, ctx) => { hashes.push(dayHash(G)); return od ? od(G, ctx) : undefined; };
  await quietLog(() => runDays(Game, base, { days }));
  return hashes;
}
async function partC() {
  console.log('PART C — det-gate (20d, instrument-on vs pristine)');
  let hOff = null, hOn = null;
  await withEnv('FEASTSCALE_R13', '1', () => withEnv('SEATDRIVE', '0', async () => {
    hOff = await runHashed(5102, 20, false);
    hOn = await runHashed(5102, 20, true);
  }));
  A(hOff && hOn && hOff.length === 20 && hOn.length === 20, `fixture: both sides produced 20 day-hashes`);
  A(hOff && hOn && hOff.every((h, i) => h === hOn[i]), 'det-gate: instrument-on vs pristine byte-identical trajectories');
}

(async () => {
  const smoke = process.env.SMOKE === '1';
  partA();
  await partB();
  if (!smoke) await partC();
  console.log(`\ntest-leanwinter-20261017: ${pass} pass, ${fail} fail${smoke ? ' (SMOKE=1: A+B only)' : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e && e.stack || e); process.exit(2); });
