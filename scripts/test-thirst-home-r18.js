#!/usr/bin/env node
// test-thirst-home-r18.js — proof for the r18 competent-policy fix.
//
// BUG (journey landing r18, seed 58): the scholar died of dehydration on day
// 11 while away from haven, pantry at 44k kcal, cistern full. The policy's
// THIRST HOME recovery (walk home + drink when dehydrated with no water)
// was gated behind the opt-in COMPETENT_ROUTE_AROUND=1 flag, so every
// non-flagged run had NO thirst recovery at all: the bot sat on a trail
// tile at hydration 0 ignoring the game's "DEHYDRATED: find and treat
// water today." warning until it died.
//
// FIX: THIRST HOME is ungated (a dehydrated competent player always tries
// to recover); drinkSafe runs first in case the current tile offers water,
// then walk home + drink.
//
// PROOF: a dehydrated scholar (hydration 10, no water) away from haven on a
// dry tile. After competent.daily():
//   OLD (flag off): ctx.thirstHome unset, scholar still far from haven,
//                   still dehydrated -> test FAILS (RED).
//   NEW: ctx.thirstHome === 1, scholar moved toward haven and/or drank
//                   -> test PASSES (GREEN).
//
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const { loadGame, quietLog, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 5858 });
  ok(!loadFails.length, 'all modules load', loadFails.join('; '));
  await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
  // Move the scholar to a dry, non-haven tile (direct position set, the
  // same technique other proof tests use).
  let moved = false;
  try {
    for (let x = 0; x <= 8 && !moved; x++) for (let y = 0; y <= 8 && !moved; y++) {
      const t = Game.tileAt ? Game.tileAt(x, y) : null;
      if (t && t.type !== 'haven' && !/creek|well|spring|river|pond/i.test(t.type || '')) {
        Game.map.px = x; Game.map.py = y; moved = true;
      }
    }
  } catch (e) {}
  ok(moved && !Game.playerAtHaven(), 'scholar starts away from haven');

  // Set up the bug scenario: dehydrated, no water, on a dry tile.
  const s = Game.state.scholar;
  s.hydration = 10;
  s.water = [];
  // Make sure the tile offers no water (isolates THIRST HOME from drinkSafe's fill).
  let tileType = null;
  try {
    const t = Game.playerTile ? Game.playerTile() : null;
    tileType = t && t.type;
  } catch (e) {}
  console.log('  tile type: ' + tileType + ' at (' + Game.map.px + ',' + Game.map.py + ')');
  const distBefore = Math.abs(Game.map.px - 4) + Math.abs(Game.map.py - 4);
  console.log('  distance to haven before: ' + distBefore);

  const ctx = { policyId: 'competent-test' };
  try { competent.setup(Game, ctx); } catch (e) { console.log('  (setup: ' + e.message + ')'); }
  await quietLog(async () => { competent.daily(Game, ctx); });

  const distAfter = Math.abs(Game.map.px - 4) + Math.abs(Game.map.py - 4);
  const hydAfter = Game.state.scholar.hydration;
  console.log('  thirstHome counter: ' + ctx.thirstHome);
  console.log('  distance to haven after: ' + distAfter + ', hydration after: ' + hydAfter);

  ok(ctx.thirstHome === 1, 'THIRST HOME fired exactly once', 'thirstHome=' + ctx.thirstHome);
  ok(distAfter < distBefore || hydAfter > 10,
    'scholar moved toward haven and/or drank',
    'dist ' + distBefore + '->' + distAfter + ', hydration 10->' + hydAfter);

  console.log(`\ntest-thirst-home-r18: ${pass} passed, ${fail} failed`);
  if (fail) console.log('failing: ' + failures.join(' | '));
  process.exitCode = fail ? 1 : 0;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
