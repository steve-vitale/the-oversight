#!/usr/bin/env node
// PROOF (sim-crumbs-b, 2026-10-16): the CRUMB-FIX tuning arm for finding #121.
// Steve's ruling 2026-10-14: the no-fractionating rule STANDS, but the
// floor1 rounding's crumbs break starves villagers with food in the pantry
// (tuning bug). A hungry villager takes the full piece; pieces stay
// indivisible. Gate: CRUMBFIX=1 (measurement default OFF); landed default-ON.
//
// Synthetic fixture (identical in RED/GREEN/GATEOFF): the s66-d46 shape —
// want=1218 (Nino's need), pantry = one 500-kcal piece expiring soonest,
// then 4 x 2000-kcal pieces (8,000 fresh kcal), all unspoiled.
// Engine sort (urgency-first, slabs-last): the 500 goes first (fits),
// the 2000s are all larger than the remaining 718 want.
//
// RED (PHASE=red, pristine engine — run with game.js reverted to HEAD):
//   pantryDraw(round:'floor1') refuses the 2000s after drawing the 500:
//   taken=500, need 718 remains, 8,000 fresh left, shortOfFresh=false,
//   no crumb take. The bug reproduces: hungry, food in the pantry, refused.
// GREEN (PHASE=green, fix installed, CRUMBFIX=1):
//   the full 2000 piece is taken whole for the crumbs: taken=2500,
//   out.crumbTakes=1, need covered. Plus the already-working !drewAny case
//   (want=400 < one 2000 piece) behaves identically armed vs pristine.
// GATEOFF (PHASE=gateoff, fix installed, CRUMBFIX unset): the fixture
//   behaves byte-identically to RED — the gate changes nothing when off.
// DETGATE (PHASE=detgate, DETOUT=<path>): 2 seeds x 2 policies x 40d with
//   the sharcensus instrument; writes canonical JSON of rows + per-seed
//   summary. Run once pristine, once fix-installed-with-gate-off, and cmp
//   the two files byte-identical from the shell (no stash — patch dance).
// SMOKE (PHASE=smoke): harness boots, gate default OFF, CRUMBFIX=1 ON,
//   fixture draw takes the piece.
//
// Usage (see header recipe; red-verification uses the patch dance, NEVER
// git stash on this hot shared repo):
//   git diff src/js/game.js > /tmp/crumbs-fix.patch
//   git checkout HEAD -- src/js/game.js
//   PHASE=red node scripts/test-crumbs-20261016.js
//   git apply /tmp/crumbs-fix.patch
//   CRUMBFIX=1 PHASE=green node scripts/test-crumbs-20261016.js
//   PHASE=gateoff node scripts/test-crumbs-20261016.js
//   SMOKE=1 node scripts/test-crumbs-20261016.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const SEED = 42;
const WANT = 1218; // Nino's s66-d46 need

// The s66-d46 fixture pantry: one small piece that fits, then 4 x 2000-kcal
// pieces (8,000 fresh kcal) each larger than the remaining want.
function fixturePantry(Game) {
  const d = (Game.state.scholar || {}).day || 1;
  return [
    { name: 'small cut', kcalEach: 500, units: 1, spoilDay: d + 280, safe: true },
    { name: 'big cut', kcalEach: 2000, units: 4, spoilDay: d + 290, safe: true },
  ];
}

function freshLeft(v) {
  return (v.pantry || []).reduce((t, it) => t + (it.kcalEach || 0) * Math.max(0, it.units || 0), 0);
}

async function boot() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crumbs-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) { check.fails = (check.fails || 0) + 1; }
}
function verdict(phase) {
  const f = check.fails || 0;
  console.log(f === 0 ? `\n${phase}: ALL GREEN` : `\n${phase}: ${f} FAILURE(S)`);
  if (f) process.exit(1);
}

async function phaseRed() {
  console.log('PHASE=red — pristine engine, the s66-d46 shape');
  const Game = await boot();
  const v = { pantry: fixturePantry(Game) };
  const out = Game.pantryDraw(v, WANT, { round: 'floor1' });
  const remaining = WANT - out.taken;
  const left = freshLeft(v);
  console.log(`  draw: want=${WANT} taken=${out.taken} remaining=${remaining} freshLeft=${left} shortOfFresh=${out.shortOfFresh} crumbTakes=${out.crumbTakes || 0}`);
  check('took only the fitting piece (500)', out.taken === 500, 'taken=' + out.taken);
  check('need remains (718 > 0)', remaining === 718, 'remaining=' + remaining);
  check('8,000 fresh kcal still in pantry', left === 8000, 'left=' + left);
  check('not genuine exhaustion (shortOfFresh=false)', out.shortOfFresh === false);
  check('no crumb piece taken', !out.crumbTakes);
  // On pristine the gate method does not exist yet — the gate is absent, not off.
  check('no crumbFixOn gate on pristine (or false)', typeof Game.crumbFixOn !== 'function' || Game.crumbFixOn() === false);
  verdict('RED');
}

async function phaseGreen() {
  console.log('PHASE=green — fix installed, CRUMBFIX=1, the s66-d46 shape');
  const Game = await boot();
  check('crumbFixOn() is true with CRUMBFIX=1', Game.crumbFixOn() === true);
  const v = { pantry: fixturePantry(Game) };
  const out = Game.pantryDraw(v, WANT, { round: 'floor1' });
  const remaining = WANT - out.taken;
  console.log(`  draw: want=${WANT} taken=${out.taken} remaining=${remaining} crumbTakes=${out.crumbTakes || 0}`);
  check('full piece taken for crumbs (500 + 2000)', out.taken === 2500, 'taken=' + out.taken);
  check('need covered (remaining <= 0)', remaining <= 0, 'remaining=' + remaining);
  check('exactly one crumb take recorded', out.crumbTakes === 1);
  check('the piece was indivisible (one 2000 unit)', out.items[1] && out.items[1].units === 1 && out.items[1].effectiveKcal === 2000);
  check('not genuine exhaustion (shortOfFresh=false)', out.shortOfFresh === false);
  // The already-working case is untouched: nothing drawn yet, want < piece.
  const v2 = { pantry: [{ name: 'big cut', kcalEach: 2000, units: 2, spoilDay: ((Game.state.scholar || {}).day || 1) + 290, safe: true }] };
  const out2 = Game.pantryDraw(v2, 400, { round: 'floor1' });
  check('!drewAny whole-piece case unchanged (400 want -> 2000 taken)', out2.taken === 2000 && !out2.crumbTakes, 'taken=' + out2.taken);
  // Slab edge: only slabs left — the full piece is still taken (bounded cost, documented).
  const v3 = { pantry: [{ name: 'slab', kcalEach: 30000, units: 1, spoilDay: ((Game.state.scholar || {}).day || 1) + 290, safe: true }] };
  const out3 = Game.pantryDraw(v3, 596, { round: 'floor1' });
  check('slab-only crumbs: full slab taken (!drewAny path)', out3.taken === 30000, 'taken=' + out3.taken);
  // Sense beat: narrate the meal the way a player would read it.
  console.log('\n  SENSE BEAT — Nino, want 1218, pantry 500 + 4x2000:');
  console.log('  "Nino draws a 500-kcal cut, still hungry for 718 — the pantry holds');
  console.log('   four 2000-kcal pieces. The old rule refused them; the fix takes one');
  console.log('   whole 2000 piece. He eats 2500 against a 1218 need — over-fed by one');
  console.log('   indivisible piece, never a broken one. That is the ruling, literal."');
  verdict('GREEN');
}

async function phaseGateoff() {
  console.log('PHASE=gateoff — fix installed, CRUMBFIX unset: identical to RED');
  const Game = await boot();
  check('crumbFixOn() is false with gate unset', Game.crumbFixOn() === false);
  const v = { pantry: fixturePantry(Game) };
  const out = Game.pantryDraw(v, WANT, { round: 'floor1' });
  const remaining = WANT - out.taken;
  const left = freshLeft(v);
  console.log(`  draw: want=${WANT} taken=${out.taken} remaining=${remaining} freshLeft=${left}`);
  check('taken=500 (pristine shape)', out.taken === 500);
  check('remaining=718 (pristine shape)', remaining === 718);
  check('freshLeft=8000 (pristine shape)', left === 8000);
  check('shortOfFresh=false (pristine shape)', out.shortOfFresh === false);
  check('no crumbTakes (pristine shape)', !out.crumbTakes);
  verdict('GATEOFF');
}

async function phaseDetgate() {
  const outPath = process.env.DETOUT;
  if (!outPath) { console.error('DETGATE needs DETOUT=<path>'); process.exit(1); }
  console.log('PHASE=detgate — 2 seeds x 2 policies x 40d, canonical row JSON -> ' + outPath);
  const fs = require('fs');
  const seeds = [11, 22];
  const pids = ['leadcourt', 'belongseek'];
  const all = [];
  for (const pid of pids) {
    const base = pid === 'leadcourt' ? leadcourt : belongseek;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'crumbs-detgate-' + pid, fullTelemetry: false });
      await setupGame(Game);
      const cen = installShareCensus(Game);
      const policy = Object.assign({}, base);
      let result = null;
      await quietLog(async () => { result = await runDays(Game, policy, { days: 40, manifest: undefined, sampleEvery: 10 }); });
      const rows = cen.rows.map(r => {
        const c = classify(r);
        return [r.day, r.vid, Math.round(r.ate), Math.round(r.drew), Math.round(r.need), r.path, c.starved ? 1 : 0, c.starvePath || '-'].join(',');
      }).join('\n');
      cen.uninstall();
      all.push(`## ${pid} s${seed} days=${result.days}\n${rows}`);
      console.log(`  [${pid} s${seed}] days=${result.days} rows=${cen.rows.length}`);
    }
  }
  fs.writeFileSync(outPath, all.join('\n') + '\n');
  console.log('  wrote ' + outPath);
}

async function phaseSmoke() {
  console.log('PHASE=smoke — harness boots, gate responds');
  const Game = await boot();
  check('Game.pantryDraw exists', typeof Game.pantryDraw === 'function');
  check('Game.crumbFixOn exists', typeof Game.crumbFixOn === 'function');
  const gate = process.env.CRUMBFIX === '1';
  check(`crumbFixOn() === ${gate} (CRUMBFIX=${process.env.CRUMBFIX || '<unset>'})`, Game.crumbFixOn() === gate);
  const v = { pantry: fixturePantry(Game) };
  const out = Game.pantryDraw(v, WANT, { round: 'floor1' });
  const expect = gate ? 2500 : 500;
  check(`fixture draw taken=${expect}`, out.taken === expect, 'taken=' + out.taken);
  verdict('SMOKE');
}

async function main() {
  const phase = process.env.PHASE || 'all';
  if (phase === 'red' || phase === 'all') await phaseRed();
  if (phase === 'green') await phaseGreen();
  if (phase === 'gateoff') await phaseGateoff();
  if (phase === 'detgate') await phaseDetgate();
  if (phase === 'smoke' || phase === 'all') await phaseSmoke();
  if (phase === 'all') {
    console.log('\nNOTE: PHASE=all covers red+smoke only. Run green/gateoff/detgate');
    console.log('with the patch-dance recipe in the header (never git stash).');
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
