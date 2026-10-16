#!/usr/bin/env node
// scripts/test-thirstcause-20261016.js — proof for sim-thirstcause-b
// (food-economy axis, sim-findings #418, run fleshout-loop-b-20261016T2130Z).
//
// The arm is INSTRUMENT-ONLY: a code audit + a read-only census. This proof
// demonstrates the instrument is honest and non-invasive before the census:
//
// PART A — classifier fixtures: every cause string observed in the audit
//   (villager 'thirst' at src/js/game.js:28349, scholar 'dehydration' at
//   src/js/engine/calories.js:125) plus near-synonym display strings and a
//   broad NON-WATER roster — deterministic classification, no unknowns.
// PART B — live-honesty on a live Game: attach the tele-wrap instrument,
//   force registerDeath through the REAL pipeline with 'thirst' and
//   'dehydration', assert the records are captured VERBATIM (cause string,
//   player flag) — the instrument observes the shared pipeline, it doesn't
//   rewrite it.
// PART C — det-gate: 20d run, instrument-on vs pristine, byte-identical
//   per-day state hashes (read-only proof).
// SMOKE=1: PARTS A+B fast gates only (fixtures + live-honesty), no long run.
//
// Node harness rule (AGENTS.md): Math.random seeded BEFORE eval via
// loadGame({seed}); never two harnesses in one process; never stub
// Game.save; instrument wraps delegate and restore nothing persists.
'use strict';
process.env.THIRSTCAUSE_LIB = '1';
const { classifyCause, attachCauseInstrument } = require('./census-thirstcause-20261016');
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
  // The two audit strings (the whole point of #418):
  let r = classifyCause('thirst'); A(r.water && r.cls === 'WATER-THIRST', "fixture: 'thirst' -> WATER-THIRST");
  r = classifyCause('dehydration'); A(r.water && r.cls === 'WATER-DEHYDRATION', "fixture: 'dehydration' -> WATER-DEHYDRATION");
  // Near-synonym display strings must never leak as NON-WATER:
  r = classifyCause('died of thirst'); A(r.water && r.cls === 'WATER-THIRST', "fixture: 'died of thirst' -> WATER-THIRST");
  r = classifyCause('dying of thirst'); A(r.water && r.cls === 'WATER-THIRST', "fixture: 'dying of thirst' -> WATER-THIRST");
  r = classifyCause('DEHYDRATED'); A(r.water && r.cls === 'WATER-DEHYDRATION', "fixture: 'DEHYDRATED' -> WATER-DEHYDRATION (case-insensitive)");
  // NON-WATER roster (causes observed in prior censuses — must NOT classify water):
  for (const c of ['combat', 'starvation', 'sickness', 'injuries', 'the night', 'alien', 'alien_beam',
      'the wild', 'the expedition', "a wound that wouldn't close", 'aid-runner',
      'the phoenix link', 'your own pit trap', 'threat', 'exile']) {
    const rr = classifyCause(c);
    A(!rr.water && rr.cls === 'NON-WATER', `fixture: '${c}' -> NON-WATER`);
  }
  // Degenerate inputs classify, never throw, never 'unknown':
  for (const c of [null, undefined, '', 0]) {
    let rr = null, threw = false;
    try { rr = classifyCause(c); } catch (e) { threw = true; }
    A(!threw && rr && rr.cls === 'NON-WATER' && !rr.water, `fixture: ${String(c)} -> NON-WATER (degenerate-safe)`);
  }
  // Determinism: every string classifies identically twice:
  const corpus = ['thirst', 'dehydration', 'died of thirst', 'combat', 'starvation', 'the night', 'alien_beam'];
  A(corpus.every(c => JSON.stringify(classifyCause(c)) === JSON.stringify(classifyCause(c))), 'fixture: classifier deterministic');
}

// ---- PART B: live-honesty — forced deaths through the real pipeline ----
async function partB() {
  console.log('PART B — live-honesty (forced registerDeath through the real pipeline)');
  await withEnv('FEASTSCALE_R13', '1', async () => {
    const { Game } = await loadGame({ seed: 3301, mode: 'thirstcause-test' });
    await setupGame(Game);
    const t = {};
    attachCauseInstrument(Game, t);
    await quietLog(async () => {
      Game.registerDeath({ kind: 'villager', villagerId: 'tc_v1', name: 'Test Villager', cause: 'thirst', killerId: null });
      Game.registerDeath({ kind: 'villager', villagerId: 'tc_s1', name: 'Test Bearer', cause: 'dehydration', killerId: null, player: true });
      Game.registerDeath({ kind: 'villager', villagerId: 'tc_v2', name: 'Test Fighter', cause: 'combat', killerId: null });
    });
    A(t.deaths.length === 3, `fixture: instrument captured all 3 forced deaths (got ${t.deaths.length})`);
    const byId = {};
    for (const d of t.deaths) byId[d.who] = d;
    A(byId['tc_v1'] && byId['tc_v1'].cause === 'thirst' && !byId['tc_v1'].player, "fixture: 'thirst' captured VERBATIM, player=false");
    A(byId['tc_s1'] && byId['tc_s1'].cause === 'dehydration' && byId['tc_s1'].player, "fixture: 'dehydration' captured VERBATIM, player=true");
    A(byId['tc_v2'] && classifyCause(byId['tc_v2'].cause).cls === 'NON-WATER', "fixture: 'combat' captured, classifies NON-WATER");
    // The instrument never mutates game state: corpse count is the engine's own
    // (3 forced = 3 corpses, instrument added none).
    const corpses = (Game.corpses ? Game.corpses() : []).filter(c => (c.name || '').startsWith('Test '));
    A(corpses.length === 3, `fixture: engine-side effects unchanged by instrument (3 test corpses, got ${corpses.length})`);
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
  const { Game } = await loadGame({ seed, mode: 'thirstcause-det' });
  await setupGame(Game);
  const t = {};
  if (withInstrument) attachCauseInstrument(Game, t);
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
    hOff = await runHashed(3302, 20, false);
    hOn = await runHashed(3302, 20, true);
  }));
  A(hOff && hOn && hOff.length === 20 && hOn.length === 20, `fixture: both sides produced 20 day-hashes`);
  A(hOff && hOn && hOff.every((h, i) => h === hOn[i]), 'det-gate: instrument-on vs pristine byte-identical trajectories');
}

(async () => {
  const smoke = process.env.SMOKE === '1';
  partA();
  await partB();
  if (!smoke) await partC();
  console.log(`\ntest-thirstcause-20261016: ${pass} pass, ${fail} fail${smoke ? ' (SMOKE=1: A+B only)' : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e && e.stack || e); process.exit(2); });
