#!/usr/bin/env node
// test-scholarsurvive.js — proof for the scholarsurvive layer
// (flesh-out loop arm sim-scholarsurvive, run fleshout-20261020T1015Z,
// axis scale-onramp).
//
// RED->GREEN on the hook: the recovery must NOT engage with the gate off
// (pure delegation), and MUST engage with the gate on (kill detected ->
// recovery state -> fight disengage away from Haven -> delegate at Haven
// -> healed end). Plus the DET pin: gate-off wrapper is byte-identical to
// the bare w5door stack on the same seed.
//
// Usage: SCHOLARSURVIVE=0 node scripts/test-scholarsurvive.js   # RED fixtures
//        SCHOLARSURVIVE=1 node scripts/test-scholarsurvive.js   # GREEN fixtures
//        DET=1 SCHOLARSURVIVE=0 node scripts/test-scholarsurvive.js  # DET pin
'use strict';
const assert = require('assert');
const SS = require('./policies/scholarsurvive');
const SW = require('./probe-w5path-20261019'); // policyFor: the landed w5census stack (composed, never edited)
const { loadGame, setupGame } = require('./sim-harness');
const { dayHash } = require('./det-gate');

function armedPolicy() {
  return SS.withScholarsurvive(SW.policyFor('leadfeast'), 'lead-ss', 'leadfeast w5 stack + scholarsurvive');
}
function basePolicy() { return SW.policyFor('leadfeast'); }

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'scholarsurvive-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function ctxFor() { return { policyId: 'test', notes: [] }; }
function injectWave4Kill(Game) {
  (Game.state.waveKillLog = Game.state.waveKillLog || []).push({
    d: (Game.state.scholar || {}).day || 50, mid: 'herald_test', w: 4,
    by: Game.villagerId, via: 'player', trick: null,
  });
}

// Fake Game for the fight fixtures (minimal contract: state/villagerId +
// the TB verbs the disengage touches).
function fakeFightGame(atHaven, mx) {
  const p = { mx: mx == null ? 4 : mx, my: 4, hp: 40, maxHp: 100, alive: true, fled: false, moveLeft: 5, acted: false };
  const calls = { baseFight: 0, moved: 0, barrier: 0, afterAction: 0 };
  return {
    calls,
    state: { scholar: { day: 60, health: 40, kcal: 500, hydration: 3, dead: false }, village: { health: {} } },
    villagerId: 'v-scholar',
    over: false, tbfight: { over: false },
    tbIsPlayerTurn: () => true,
    playerAtHaven: () => atHaven,
    tbFighter: (k) => (k === 'p' ? p : null),
    tbPlayerMove: (x, y) => { calls.moved++; p.mx = x; p.my = y; return true; },
    tbBarrierExit: (dx, dy) => { calls.barrier++; p.fled = true; },
    tbAfterPlayerAction: () => { calls.afterAction++; },
    maxHealth: () => 100,
    say: () => {},
    doAction: () => true,
    tileAt: () => ({ type: 'haven' }),
    map: { worldSize: 9, px: 0, py: 0 },
  };
}
function fakeBase(calls) {
  return {
    id: 'fake-base', desc: 'fake',
    daily: () => 'base-daily',
    fight: () => { calls.baseFight++; return 'base-fight'; },
  };
}

async function main() {
  const GREEN = SS.layerOn();
  const results = [];
  const t = async (name, fn) => { try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name + ' :: ' + (e && e.message)]); } };

  // ---- D0: DET pin — gate-off wrapper byte-identical to the bare stack ----
  await t('D0-det-gate-off-byte-identical', async () => {
    const was = process.env.SCHOLARSURVIVE;
    process.env.SCHOLARSURVIVE = '';
    const g1 = await freshGame(64001), g2 = await freshGame(64001);
    const c1 = ctxFor(), c2 = ctxFor();
    basePolicy().daily(g1, c1);
    armedPolicy().daily(g2, c2);
    assert.strictEqual(dayHash(g2), dayHash(g1), 'gate-off wrapper daily diverges from base daily');
    assert.strictEqual(c2._ssRecover || null, null, 'gate-off must not set recovery state');
    assert.strictEqual(c2._ssLogLen || null, null, 'gate-off must not touch the kill cursor');
    if (was == null) delete process.env.SCHOLARSURVIVE; else process.env.SCHOLARSURVIVE = was;
  });

  // ---- D1 RED: gate off — injected wave-4 kill opens no recovery ----
  await t('D1-red-gate-off-no-recovery', async () => {
    const was = process.env.SCHOLARSURVIVE;
    process.env.SCHOLARSURVIVE = '';
    const Game = await freshGame(64002);
    const ctx = ctxFor();
    const P = armedPolicy();
    P.daily(Game, ctx); // cursor init
    injectWave4Kill(Game);
    P.daily(Game, ctx);
    assert.strictEqual(ctx._ssRecover || null, null, 'RED: gate off must not open recovery on a wave-4 kill');
    assert.strictEqual(ctx.ssKillsDetected || 0, 0, 'RED: gate off must not count kills');
    if (was == null) delete process.env.SCHOLARSURVIVE; else process.env.SCHOLARSURVIVE = was;
  });

  if (GREEN) {
    // ---- D2 GREEN: gate on — wave-4 kill opens recovery ----
    await t('D2-green-kill-opens-recovery', async () => {
      const Game = await freshGame(64003);
      const ctx = ctxFor();
      const P = armedPolicy();
      P.daily(Game, ctx); // cursor init
      Game.state.scholar.health = 40; // wounded: recovery stays open
      injectWave4Kill(Game);
      P.daily(Game, ctx);
      assert.ok(ctx._ssRecover, 'recovery must open on a scholar wave-4 kill');
      assert.strictEqual(ctx._ssRecover.vid, Game.villagerId, 'recovery tracks the killer incarnation');
      assert.strictEqual(ctx._ssRecover.w, 4, 'recovery records the wave');
      assert.strictEqual(ctx.ssKillsDetected, 1, 'kill counter');
      assert.ok(SS.recoveryLive(Game, ctx), 'recoveryLive validates the live record');
    });

    // ---- D3 GREEN: recovery + fight away from Haven -> disengage, no base ----
    await t('D3-green-disengage-away-from-haven', async () => {
      const calls = { baseFight: 0 };
      const Game = fakeFightGame(false, 4);
      const ctx = ctxFor();
      ctx._ssRecover = { vid: 'v-scholar', killDay: 60, untilDay: 90, mid: 'herald_test', w: 4 };
      const P = SS.withScholarsurvive(fakeBase(calls), 'x', 'x');
      const r = P.fight(Game, ctx);
      assert.strictEqual(r, true, 'disengage handles the turn');
      assert.strictEqual(calls.baseFight, 0, 'base.fight must NOT run while withdrawing');
      assert.strictEqual(ctx.ssDisengages, 1, 'disengage counter');
      assert.ok(Game.calls.barrier > 0 || Game.calls.moved > 0, 'the honest edge-walk/barrier verbs were used');
    });

    // ---- D4 GREEN: recovery + fight AT Haven -> STILL disengages (design
    // call #1: full withdrawal, no Haven exception) ----
    await t('D4-green-disengage-at-haven', async () => {
      const calls = { baseFight: 0 };
      const Game = fakeFightGame(true, 4);
      const ctx = ctxFor();
      ctx._ssRecover = { vid: 'v-scholar', killDay: 60, untilDay: 90, mid: 'herald_test', w: 4 };
      const P = SS.withScholarsurvive(fakeBase(calls), 'x', 'x');
      const r = P.fight(Game, ctx);
      assert.strictEqual(r, true, 'at Haven the killer still withdraws');
      assert.strictEqual(calls.baseFight, 0, 'base.fight must NOT run while withdrawing');
      assert.strictEqual(ctx.ssDisengages, 1, 'disengage counter');
    });

    // ---- D5 GREEN: healed scholar ends recovery (after the min sit-out) ----
    await t('D5-green-healed-ends-recovery', async () => {
      const Game = await freshGame(64004);
      const ctx = ctxFor();
      const P = armedPolicy();
      P.daily(Game, ctx);
      Game.state.scholar.health = 40; // wounded: recovery stays open
      injectWave4Kill(Game);
      P.daily(Game, ctx);
      assert.ok(ctx._ssRecover, 'pre: recovery open');
      Game.state.scholar.health = Game.maxHealth();
      Game.state.scholar.day += 11; // past the min sit-out
      P.daily(Game, ctx);
      assert.strictEqual(ctx._ssRecover, null, 'recovery ends when healed past the sit-out');
      assert.strictEqual(ctx._ssRecoverEnd, 'healed', 'end reason recorded');
    });

    // ---- D8 GREEN: min sit-out holds even at full HP ----
    await t('D8-green-min-sitout-holds', async () => {
      const Game = await freshGame(64006);
      const ctx = ctxFor();
      const P = armedPolicy();
      P.daily(Game, ctx);
      Game.state.scholar.health = 40;
      injectWave4Kill(Game);
      P.daily(Game, ctx);
      assert.ok(ctx._ssRecover, 'pre: recovery open');
      Game.state.scholar.health = Game.maxHealth(); // feels fine...
      P.daily(Game, ctx); // ...same day: recovery must NOT end
      assert.ok(ctx._ssRecover, 'recovery holds through the min sit-out even healed');
      assert.ok(SS.recoveryLive(Game, ctx), 'recoveryLive still validates');
    });

    // ---- D6 GREEN: dead killer clears recovery (no protection for the dead) ----
    await t('D6-green-dead-killer-clears', async () => {
      const calls = {};
      const Game = fakeFightGame(false, 4);
      Game.state.village.health = { 'v-scholar': 0 };
      const ctx = ctxFor();
      ctx._ssRecover = { vid: 'v-scholar', killDay: 60, untilDay: 90, mid: 'x', w: 4 };
      // mark dead via health 0 while no longer scholar? keep scholar id but dead flag:
      Game.state.scholar.dead = true;
      assert.strictEqual(SS.recoveryLive(Game, ctx), null, 'dead killer clears recovery');
    });

    // ---- D7 GREEN: no recovery for other villagers' kills ----
    await t('D7-green-ignores-nonscholar-kills', async () => {
      const Game = await freshGame(64005);
      const ctx = ctxFor();
      const P = armedPolicy();
      P.daily(Game, ctx);
      (Game.state.waveKillLog = Game.state.waveKillLog || []).push({
        d: 50, mid: 'herald_test', w: 4, by: 'some-other-villager', via: 'companion', trick: null,
      });
      P.daily(Game, ctx);
      assert.strictEqual(ctx._ssRecover || null, null, 'a companion wave-4 kill opens no scholar recovery');
    });
  } else {
    results.push(['SKIP', 'D2..D7 GREEN fixtures (run with SCHOLARSURVIVE=1)']);
  }

  let fails = 0;
  for (const [s, n] of results) { console.log(s + ' ' + n); if (s === 'FAIL') fails++; }
  console.log(`${results.length - fails}/${results.length} green`);
  if (fails) process.exit(1);
}
main().catch(e => { console.error(e.stack); process.exit(1); });
