// test-fleerepair-20261104.js — proof for arm sim-fleerepair-a.
// Proves the MECHANISM (not the measurement — the judged legs do that):
//  1. Gate-off legacy flee does NOT strike after a failed walk (control).
//  2. Gate-off directional flee does NOT fall through (repair is gated).
//  3. Gate-on directional flee: a failed step with a monster in range
//     falls through to a strike instead of ending the turn.
//  4. Gate-on directional flee: a barrier push consumed without exiting
//     marks the fight unfleeable, and the NEXT flee call fights it out.
//  5. The variant policy opts into exactly the three gates, no defaults.
//  6. The fleerepair instrument attaches a round-1 pending turn
//     (turnSeq 0, closeReason 'round1-pending') with its player-phase hit.
//  7. Live-harness smoke: loadGame + setupGame + 2 days run without error.
// Run: node scripts/test-fleerepair-20261104.js (exit 0 = all pass).
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = path.join(__dirname, '..');

function setGates(on) {
  const keys = ['COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE', 'COMPETENT_FLEE_REPAIR'];
  for (const k of keys) { if (on) process.env[k] = '1'; else delete process.env[k]; }
  delete process.env.COMPETENT_DPS_RACE;
  delete process.env.COMPETENT_FIGHT_ASSESS;
}

// Stub TB fight: player at (px,py), one monster adjacent or at distance,
// tbPlayerMove stubbed to FAIL without moving (terrain-blocked step),
// tbBarrierExit stubbed to CONSUME without moving (sealed/blocked).
function makeStub(opts) {
  const calls = { moves: [], pushes: [], strikes: 0, endTurns: 0 };
  const player = { key: 'p', kind: 'player', mx: opts.px, my: opts.py, hp: opts.hp,
    maxHp: 100, moveLeft: 3, acted: false, alive: true };
  const monster = { key: 'm_0', kind: 'monster', mx: opts.mx, my: opts.my, hp: 500,
    maxHp: 500, alive: true, monsterId: 'stub', mdef: { id: 'stub' } };
  const fight = { id: 'stub-fight-1', over: false, round: 2,
    fighters: [player, monster] };
  const Game = {
    tbfight: fight, map: { px: opts.mapPx, py: opts.mapPy },
    state: { scholar: { day: 10, kcal: 500 } },
    data: { monsters: [{ id: 'stub', wave: 4 }], abilities: [] },
    tbIsPlayerTurn: function () { return true; },
    tbFighter: function (k) { return k === 'p' ? player : monster; },
    tbAfterPlayerAction: function () { calls.endTurns++; },
    tbPlayerMove: function () { calls.moves.push(Array.prototype.slice.call(arguments)); return false; },
    tbBarrierExit: function () { calls.pushes.push(Array.prototype.slice.call(arguments)); return true; },
    tbPlayerStrike: function () { calls.strikes++; player.acted = true; return true; },
    equippedWeapon: function () { return { range: 1, name: 'stub knife' }; },
    tileAt: function (x, y) { return (x === 4 && y === 4) ? { type: 'haven' } : { type: 'wild' }; },
    mapSeen: function () { return false; },
    monsterAt: function () { return false; },
  };
  return { Game: Game, ctx: {}, calls: calls, player: player, monster: monster, fight: fight };
}

async function main() {
  const base = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const policy = base.competent;

  // 7. Live-harness smoke FIRST (before stub env manipulation).
  {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 99101, mode: 'competent-fleerepair-proof', fullTelemetry: false });
    await setupGame(Game);
    const INST = require(path.join(REPO, 'scripts', 'fleerepair-instrument-20261104'));
    const inst = INST.install(Game);
    await quietLog(async function () { await runDays(Game, policy, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    inst.uninstall();
    console.log('smoke: 2-day live run completed');
  }

  // 1. Gate-off legacy flee: failed walk ends the turn, NO strike.
  setGates(false);
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 30, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'legacy fight() should handle the turn');
    assert.strictEqual(s.calls.strikes, 0, 'gate-off legacy: no fallthrough strike');
    assert.ok(s.calls.moves.length >= 1, 'gate-off legacy: walk attempted');
    assert.strictEqual(s.calls.endTurns, 1, 'gate-off legacy: turn ended once');
    console.log('gate-off legacy: walk fails, turn ends, no strike (control)');
  }

  // 2. Directional ON, repair OFF: failed step ends the turn, NO strike.
  setGates(false);
  process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
  process.env.COMPETENT_EXIT_VERIFIED_FLEE = '1';
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 30, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'directional gate-off-repair fight() should handle the turn');
    assert.strictEqual(s.calls.strikes, 0, 'repair-off directional: no fallthrough strike');
    assert.strictEqual(s.ctx.fleeRepairFallthrough || 0, 0, 'repair-off: no fallthrough counted');
    console.log('directional repair-off: step fails, turn ends, no strike (gate pinned)');
  }

  // 3. Repair ON: failed step + monster in range -> strike.
  setGates(true);
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 30, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'repair fight() should handle the turn');
    assert.strictEqual(s.calls.strikes, 1, 'repair: fallthrough strike fired');
    assert.ok((s.ctx.fleeRepairFallthrough || 0) >= 1, 'repair: fallthrough counted');
    console.log('repair fallthrough: failed step -> strike fired');
  }

  // 4. Repair ON: consumed push marks unfleeable; next call strikes.
  setGates(true);
  {
    const s = makeStub({ px: 0, py: 4, mx: 1, my: 4, hp: 30, mapPx: 5, mapPy: 4 });
    const ret1 = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret1, true, 'consumed-push fight() should handle the turn');
    assert.strictEqual(s.calls.pushes.length, 1, 'consumed-push: exactly one push');
    assert.strictEqual(s.calls.strikes, 0, 'consumed-push: no strike on the push turn');
    assert.strictEqual(s.ctx._fleeBlockedFor, 'stub-fight-1', 'consumed-push: fight marked unfleeable');
    const ret2 = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret2, true, 'second fight() should handle the turn');
    assert.strictEqual(s.calls.strikes, 1, 'unfleeable: next flee call fights it out (strike)');
    console.log('repair consumed-push: blocked, then next call strikes');
  }

  // 6. Instrument round-1 pending buffer (fake Game, no live harness).
  {
    const INST = require(path.join(REPO, 'scripts', 'fleerepair-instrument-20261104'));
    const player = { key: 'p', kind: 'player', mx: 4, my: 4, hp: 100, maxHp: 100,
      moveLeft: 3, acted: false, alive: true };
    const monster = { key: 'm_0', kind: 'monster', mx: 5, my: 4, hp: 500, maxHp: 500,
      alive: true, monsterId: 'w4stub', mdef: { id: 'w4stub' } };
    const fight = { id: 'fake-fight-1', over: false, round: 1, fighters: [player, monster] };
    const G = {
      state: { scholar: { day: 10 } },
      data: { monsters: [{ id: 'w4stub', wave: 4 }] },
      pendingMonsterId: 'w4stub', tbfight: null, villagerId: 'fake-scholar',
      tbFighter: function (k) { return k === 'p' ? player : monster; },
      equippedWeapon: function () { return { range: 1, name: 'stub knife' }; },
      monsterCounterKnown: function () { return false; },
      tbPlayerMove: function (x, y) { player.mx = x; player.my = y; return true; },
      tbDamage: function (tk, dmg) { const t = tk === 'p' ? player : monster; t.hp -= dmg; return true; },
      startCombat: function () {
        G.tbfight = fight;
        G.tbPlayerMove(4, 3);
        G.tbDamage('m_0', 10, 'you', 'p');
        return true;
      },
    };
    const inst = INST.install(G);
    G.startCombat('w4stub');
    inst.uninstall();
    assert.strictEqual(inst.t.exposures.length, 1, 'pending: one exposure created');
    const ex = inst.t.exposures[0];
    assert.strictEqual(ex.turns.length, 1, 'pending: exactly one round-1 turn attached');
    assert.strictEqual(ex.turns[0].turnSeq, 0, 'pending: turnSeq 0');
    assert.strictEqual(ex.turns[0].closeReason, 'round1-pending', 'pending: closeReason');
    assert.strictEqual(ex.turns[0].actions.length, 1, 'pending: one action recorded');
    assert.strictEqual(ex.turns[0].actions[0].kind, 'move', 'pending: action is the round-1 move');
    assert.strictEqual(ex.hits.length, 1, 'pending: player-phase hit attached');
    assert.strictEqual(ex.hits[0].turnSeq, 0, 'pending: hit turnSeq 0');
    // The fake Game omits spawnWorldMonster/tbEnd/kill choke points, so
    // install() records exactly those 4 missing-method errors (the same
    // pattern the tbfinish instrument shows on a partial fake). No other
    // error may appear.
    const realErrs = inst.t.instrumentErrors.filter(function (e) { return e.indexOf('install.') !== 0; });
    assert.strictEqual(realErrs.length, 0, 'pending: no instrument errors besides missing-method notes: ' + JSON.stringify(realErrs));
    console.log('instrument: round-1 pending turn attached (turnSeq 0, 1 move, 1 hit)');
  }

  // 5. Variant policy opts into exactly the three gates (LAST: mutates env).
  {
    const before = base.competent;
    const variant = require(path.join(REPO, 'scripts', 'policies', 'competent-fleerepair-a'));
    assert.strictEqual(process.env.COMPETENT_DIRECTIONAL_FLEE, '1', 'variant: directional on');
    assert.strictEqual(process.env.COMPETENT_EXIT_VERIFIED_FLEE, '1', 'variant: exit-verified on');
    assert.strictEqual(process.env.COMPETENT_FLEE_REPAIR, '1', 'variant: flee-repair on');
    assert.strictEqual(process.env.COMPETENT_DPS_RACE, undefined, 'variant: DPS_RACE stays off');
    assert.strictEqual(variant.competent, before, 'variant: competent object unchanged');
    console.log('variant: three gates on, DPS_RACE off, competent unchanged');
  }

  console.log('test-fleerepair-20261104: ALL PASS');
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
