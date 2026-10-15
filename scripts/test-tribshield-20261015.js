#!/usr/bin/env node
// scripts/test-tribshield-20261015.js — proof for the tribute-shield layer
// (sim-tribshield, 2026-10-15, scale-onramp axis).
//
// The layer (scripts/policies/tribshield.js, TRIBSHIELD=1, default OFF,
// zero src/js) wraps leadfeast/belongfeast. Inside the shield window —
// young national (first 60 hold-days) OR succession grief live on a link
// (the succpolity 14d proving window and beyond) — the village answers its
// tribute beats instead of letting silence answer:
//   V1 answer staged renegotiation beats (gift when the pantry carries
//      1,500 kcal above the 1-day floor, else visit — never 'wait');
//   V2 weakest-first tend triage on Haven-primary links (trust<45).
// A tribute-PAYMENT verb was designed, measured, and REMOVED: scalecourt
// already pays ALL active Haven-subordinate links weekly at pantry > 15k,
// so a shield payment gate is dead code (R2 below pins the redundancy).
//
// REAL RED phases first (the levered asserts must FAIL with TRIBSHIELD
// unset — the base policy lets the tribute snap), then GREEN with
// TRIBSHIELD=1. D0 pins gate-off pure delegation (byte-identical).
//
// HARNESS QUIRK (2026-10-15): two back-to-back loadGame() calls produce
// games that diverge by one trust point on the next policy run ([3] vs
// [3,1] _trustGain — the weekly settlement leaking across the await
// boundary), even though the games snapshot identical. The interleaved
// create-run-create-run pattern (the sweep's oneRun shape) is
// deterministic; back-to-back creation is not. All fixtures below use the
// sweep's pattern. Fixture writers: never create two games before running
// one.
//
// Usage: node scripts/test-tribshield-20261015.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

let passed = 0, failed = 0;
function ok(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { passed++; console.log('  PASS ' + name); },
    (e) => { failed++; console.log('  FAIL ' + name + ' — ' + e.message); });
}
function expectFail(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { failed++; console.log('  FAIL(red) ' + name + ' — levered assert did NOT fail on the base policy (RED is insensitive!)'); },
    () => { passed++; console.log('  PASS(red) ' + name + ' — correctly failed on the base policy'); });
}

const TRIB = () => require('./policies/tribshield');
const BASE = () => require('./policies/feastscale');

function setGate(on) {
  if (on) process.env.TRIBSHIELD = '1';
  else delete process.env.TRIBSHIELD;
}

async function freshGame() {
  const { Game } = await loadGame({ seed: 4242, mode: 'tribshield-fixture' });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 80;
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = [{ kcalEach: 1000, units: 40 }]; // 40k kcal
  Game.mshipState().links = [];
  Game.state.nationalLive = false;
  return Game;
}
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function youngNational(Game) { Game.state.nationalLive = true; } // S1 trigger
function subLink(Game, id, opts) {
  const l = Object.assign({ id, status: 'active', primary: 'emberhold',
    subordinate: 'haven', trust: 55, day: 60, tributeKcalPerWeek: 6000,
    arrears: 0, tributePaidWeek: -1 }, opts || {});
  Game.mshipState().links.push(l);
  return l;
}
function primLink(Game, id, trust) {
  const l = { id, status: 'active', primary: 'haven', subordinate: 'v-' + id,
    trust, day: 60, tributeKcalPerWeek: 4000, arrears: 0, tendedWeek: -1 };
  Game.mshipState().links.push(l);
  return l;
}
function runDaily(Game, policy) {
  const ctx = { policyId: policy.id, notes: [] };
  policy.daily(Game, ctx);
  return ctx;
}

async function main() {
  // ---------- D0: gate-off pure delegation (byte-identical) ----------
  console.log('\nD0 (det): gate-off delegation is byte-identical to the base policy');
  await ok('D0 wrapped gate-off == base on the R1 fixture', async () => {
    const mk = async () => {
      const Game = await freshGame();
      subLink(Game, 'l-sub', { pendingRenegotiation: { day: 80, sub: true } });
      return Game;
    };
    const snap = (G) => JSON.stringify({
      links: G.mshipState().links.map(l => ({ id: l.id, trust: l.trust, arrears: l.arrears,
        pendingRenegotiation: !!l.pendingRenegotiation, tributePaidWeek: l.tributePaidWeek })),
      pantry: pantryKcal(G),
    });
    setGate(false);
    const gA = await mk();
    runDaily(gA, BASE().belongfeast);
    const sA = snap(gA);
    const gB = await mk();
    runDaily(gB, TRIB().belongfeast);
    assert.strictEqual(snap(gB), sA, 'gate-off wrapper diverged from base');
  });

  // ---------- R1/R2 (RED): the base policy lets the tribute snap ----------
  console.log('\nR1-R2 (RED): base policy must NOT fire the shield verbs');
  await expectFail('R1 the staged beat is answered', async () => {
    setGate(false);
    const Game = await freshGame();
    const l = subLink(Game, 'l-sub', { pendingRenegotiation: { day: 80, sub: true } });
    runDaily(Game, TRIB().belongfeast);
    assert.strictEqual(l.pendingRenegotiation, null,
      'beat still pending on the base policy');
  });
  await expectFail('R2 the haircut link is tended first (triage)', async () => {
    setGate(false);
    const Game = await freshGame();
    youngNational(Game);
    Game.state.village.pantry = [{ kcalEach: 1000, units: 26 }]; // 26k
    const wk = Game._week();
    const mk = (id, trust) => primLink(Game, id, trust);
    mk('h1', 60); mk('h2', 55); mk('h3', 50); mk('h4', 48); mk('h5', 45);
    const thin = mk('thin', 30);
    runDaily(Game, TRIB().leadfeast);
    assert.strictEqual(thin.tendedWeek, wk,
      'base tended in link order and ran out before the trust-30 link');
  });
  // R3 pins the REMOVED verb's redundancy: the base already clears
  // multi-link arrears on its own (scalecourt's all-links 15k gate), so a
  // shield payment verb would be dead code. This documents the discovery;
  // it is not a RED for the layer.
  await ok('R3 (documenting): base clears multi-link arrears without the layer', async () => {
    setGate(false);
    const Game = await freshGame();
    youngNational(Game);
    const l1 = subLink(Game, 'l-a', { arrears: 5000 });
    const l2 = subLink(Game, 'l-b', { arrears: 5000 });
    runDaily(Game, TRIB().belongfeast);
    assert.strictEqual(l1.arrears, 0, 'l-a arrears=' + l1.arrears);
    assert.strictEqual(l2.arrears, 0, 'l-b arrears=' + l2.arrears);
  });

  // ---------- GREEN: TRIBSHIELD=1 fires the verbs ----------
  console.log('\nGREEN: TRIBSHIELD=1');
  await ok('G1 the staged beat is answered with gift (leverage never lands)', async () => {
    setGate(true);
    const Game = await freshGame();
    const l = subLink(Game, 'l-sub', { pendingRenegotiation: { day: 80, sub: true } });
    const trib0 = l.tributeKcalPerWeek;
    const ctx = runDaily(Game, TRIB().belongfeast);
    assert.strictEqual(l.pendingRenegotiation, null, 'beat answered');
    assert.strictEqual(l.tributeKcalPerWeek, trib0, 'the deferred x1.5 leverage never landed');
    assert.ok((ctx.tsReneg_gift || 0) === 1, 'ctx counted the gift, got ' + ctx.tsReneg_gift);
    assert.ok(l.trust > 55, 'trust rose on the gift (got ' + l.trust + ')');
  });
  await ok('G2 weakest-first tend triage (the haircut link eats first)', async () => {
    setGate(true);
    const Game = await freshGame();
    youngNational(Game);
    Game.state.village.pantry = [{ kcalEach: 1000, units: 26 }]; // 26k
    const wk = Game._week();
    const mk = (id, trust) => primLink(Game, id, trust);
    mk('h4', 48);
    mk('h1', 60); mk('h2', 55);
    const h3 = mk('h3', 50);
    mk('h5', 45);
    const thin = mk('thin', 30);
    const ctx = runDaily(Game, TRIB().leadfeast);
    assert.strictEqual(thin.tendedWeek, wk, 'the trust-30 link was tended first');
    // control tends h4,h1,h2,h3 (26k -> 20k); armed tends thin,h4,h1,h2 —
    // the triage stole the last slot from the trust-50 link.
    assert.notStrictEqual(h3.tendedWeek, wk, 'the trust-50 link waited — triage flipped the last slot');
    assert.ok((ctx.tsTends || 0) === 1, 'ctx counted one triage tend, got ' + ctx.tsTends);
  });
  await ok('G3 outside the window the layer is inert (no national, no grief)', async () => {
    setGate(true);
    const Game = await freshGame();
    // no nationalLive, no mourning, no beats, no succession history
    const l = subLink(Game, 'l-sub', { pendingRenegotiation: null });
    const ctx = runDaily(Game, TRIB().belongfeast);
    assert.ok(!ctx.tsReneg_gift && !ctx.tsReneg_visit && !ctx.tsTends, 'no shield verbs counted');
    // the base policy still paid tribute at its own gate (+3); the shield
    // added no gift (+8 would make 66).
    assert.strictEqual(l.trust, 58, 'only the base payment landed (trust=' + l.trust + ')');
  });
  await ok('G4 thin pantry answers the beat with a visit, never silence', async () => {
    setGate(true);
    const Game = await freshGame();
    Game.state.village.pantry = [{ kcalEach: 1000, units: 3 }]; // below the gift gate
    const l = subLink(Game, 'l-sub', { pendingRenegotiation: { day: 80, sub: true } });
    const ctx = runDaily(Game, TRIB().belongfeast);
    assert.strictEqual(l.pendingRenegotiation, null, 'beat answered even when grain is short');
    assert.ok((ctx.tsReneg_visit || 0) === 1, 'answered with visit, got ' + JSON.stringify({ g: ctx.tsReneg_gift, v: ctx.tsReneg_visit }));
  });
  await ok('G5 lead-road young-link beat: gift aids the subordinate pantry', async () => {
    setGate(true);
    const Game = await freshGame();
    youngNational(Game); // S1: the shield window is open
    Game.state.otherVillages = (Game.state.otherVillages || []).concat([{ id: 'v-l5', pantryKcal: 0 }]);
    const l = primLink(Game, 'l5', 50);
    l.day = 70; // 10 days old — a young link
    l.pendingRenegotiation = { day: 80, sub: false };
    const ctx = runDaily(Game, TRIB().leadfeast);
    assert.strictEqual(l.pendingRenegotiation, null, 'beat answered');
    const ov = Game.state.otherVillages.find(v => v.id === 'v-l5');
    assert.ok((ov.pantryKcal || 0) >= 1500, 'the grief grain reached their pantry (got ' + ov.pantryKcal + ')');
    assert.ok((ctx.tsReneg_gift || 0) === 1, 'ctx counted the gift');
  });

  setGate(false);
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
