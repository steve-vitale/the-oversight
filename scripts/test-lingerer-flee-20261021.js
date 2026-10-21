#!/usr/bin/env node
// test-lingerer-flee-20261021.js — r38 M4 follow-up proof (RED -> GREEN).
//
// The siege: unmet raiders linger at the treeline (m.lingering), gorging
// nightly until driven off — answered by "Endure it" (6-day moved-on valve)
// or a real sortie (design call #8, 2026-10-16). The scholar lives on the
// haven tile, so they can bump into lingerers.
//
// BUG (r38 probe): startCombat removes the world monster at fight start
// (game.js:31925) and break-it combat-2 (2026-10-09) never restores
// wild-encounter monsters — so a scholar who meets a lingerer and FLEES
// deletes it from the world anyway. The siege evaporates through incidental
// contact; the endure answer never gets its ~6 nights; the moved-on valve
// never fires. (Probe: 5 lingerers cleared in 2 days via startCombat;
// crisis resolved 'fought'; endure was answered and bypassed.)
//
// FIX: lingerers get the titan treatment (worldOrigin): a besieging raider
// the scholar fled from or lost to goes back to the treeline (wounded, not
// full — the blows landed). A routed lingerer broke and ran (treeline
// clear); a slain one is gone.
//
// RED (pre-fix): the lingerer is gone from the world after tbEnd('fled').
// GREEN (post-fix): it's back at the treeline, lingering, wounded.
// Usage: node scripts/test-lingerer-flee-20261021.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
function ling(Game) { try { return (Game.lingeringRaiders() || []); } catch (e) { return []; } }
function monsterFighter(Game) {
  const fs = (Game.tbfight && Game.tbfight.fighters) || [];
  return fs.find(x => x && x.kind === 'monster');
}

async function scenario(result, woundTo) {
  Math.random = mulberry32(9000 + result.length);
  const { Game } = await loadGame({ seed: 9001, mode: 'linger-flee-' + result, fullTelemetry: false });
  Game.say = () => {};
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 6 });
  // Scholar home at haven; lingerer pinned at the haven tile (besieging).
  Game.map.px = 4; Game.map.py = 4;
  const mdef = (Game.data.monsters || []).find(x => x.id === 'bulldozer') || {};
  const m = {
    id: 'bulldozer', tx: 4, ty: 4, mx: 4, my: 4, size: 1,
    hp: 60, maxHp: 60, lingering: true, stance: null, fearTurns: 0,
    veteran: false, variant: null, lostSight: 0,
  };
  Game.worldMonsters().push(m);
  assert.strictEqual(Game.playerMonster(), m, 'setup: playerMonster() resolves the lingerer');
  assert.strictEqual(ling(Game).length, 1, 'setup: one lingerer besieging');
  // The encounter the game itself produces (bedroll path / treeline bump).
  Game.startCombat('bulldozer', {});
  assert.ok(Game.tbfight, 'setup: turn-based fight is up');
  assert.strictEqual(ling(Game).length, 0, 'setup: lingerer lifted off the map at fight start');
  const mf = monsterFighter(Game);
  assert.ok(mf, 'setup: monster fighter present');
  if (woundTo != null) { mf.hp = woundTo; }
  else if (result === 'won' || result === 'routed') { mf.hp = 0; mf.alive = false; }
  Game.tbEnd(result);
  return { Game, m };
}

async function main() {
  // 1. FLEE: the scholar runs — the siege continues.
  {
    const { Game, m } = await scenario('fled', 12);
    const back = Game.worldMonsters().indexOf(m) >= 0;
    ok(back, "fled: lingerer is back in the world (was deleted pre-fix)");
    if (back) {
      ok(ling(Game).length === 1, 'fled: it is lingering again (besieging)');
      ok(m.tx === 4 && m.ty === 4, 'fled: re-pinned to the haven tile (treeline)');
      ok(m.hp === 12, `fled: restored wounded (hp=${m.hp}, not full 60)`);
    }
  }
  // 2. LOST: the scholar died — the siege continues.
  {
    const { Game, m } = await scenario('lost', 30);
    const back = Game.worldMonsters().indexOf(m) >= 0;
    ok(back, "lost: lingerer is back in the world");
    if (back) ok(ling(Game).length === 1, 'lost: it is lingering again');
  }
  // 3. ROUTED: the raider broke and ran — treeline clear, no restore.
  {
    const { Game, m } = await scenario('routed');
    ok(Game.worldMonsters().indexOf(m) < 0, 'routed: driven-off lingerer stays gone (treeline clear)');
    ok(ling(Game).length === 0, 'routed: nothing lingering');
  }
  // 4. WON: the scholar slew it — gone.
  {
    const { Game, m } = await scenario('won');
    ok(Game.worldMonsters().indexOf(m) < 0, 'won: slain lingerer stays gone');
  }
  console.log(`\nALL PASS (${pass} assertions)`);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
