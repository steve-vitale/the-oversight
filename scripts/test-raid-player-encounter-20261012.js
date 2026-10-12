#!/usr/bin/env node
// test-raid-player-encounter-20261012.js — proof for crisis-leg r5 fixes in
// havenRaidTick (src/js/havenGrowth.js):
//   1. DEAD RAIDERS DON'T WALK: if the defenders drop raiders[0], the player
//      must NOT get a pendingEncounter vs the dead raider's id (the old code
//      spawned a fresh copy of a corpse by id — a phantom).
//   2. NO SILENT CLOBBER: a live pendingEncounter (feast draw, wanderer) is
//      never overwritten by the raid tick — the raiders linger instead.
//   3. NORMAL: with live raiders and no pending encounter, the player faces
//      a raider that is actually still standing.
// Run: node scripts/test-raid-player-encounter-20261012.js
// Exit 0 = all green.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'raid-proof', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 10 });
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.travelTo(hx, hy);
  // open the raid gate: 3+ monsters, 3k+ pantry
  let mons = Game.worldMonsters().length;
  const ids = ['hushwolf', 'bulldozer', 'choir_toad'];
  for (let i = mons; i < 3; i++) { try { Game.spawnWorldMonster({ id: ids[i % 3] }, hx + 2, hy + 1, {}); } catch (e) {} }
  return { Game, v, hx, hy };
}
function fireRaid(Game, v) {
  v.lastRaidDay = (Game.state.scholar.day || 10) - 8;
  Game.pendingEncounter = false; Game.pendingMonsterId = null;
  let fired = false, tries = 0;
  while (!fired && tries < 30 && !Game.over) { tries++; fired = Game.havenRaidTick(); }
  return { fired, tries };
}

async function main() {
  console.log('TEST 1: dead raiders don\'t walk (no phantom pendingEncounter)');
  {
    const { Game, v } = await freshGame(424242);
    const deadIds = [];
    const _enc = Game.resolveWildMonsterEncounter;
    let calls = 0;
    Game.resolveWildMonsterEncounter = function (vid, m) {
      calls++;
      if (calls === 1 && m) {
        // simulate the defender dropping raiders[0]
        deadIds.push(m.id);
        try { m.hp = 0; Game.removeWorldMonster(m); } catch (e) {}
        return;
      }
      return _enc.call(this, vid, m);
    };
    const { fired } = fireRaid(Game, v);
    ok(fired, 'raid fired');
    const mid = Game.pendingMonsterId;
    const wms = Game.worldMonsters();
    const phantom = Game.pendingEncounter && deadIds.includes(mid);
    ok(!phantom, `no phantom: pendingEncounter=${!!Game.pendingEncounter} mid=${mid} (dead: ${deadIds.join(',')})`);
    if (Game.pendingEncounter) {
      const live = wms.some(m => m.id === mid && (m.hp || 0) > 0);
      ok(live, `player faces a LIVE raider (${mid})`);
    } else {
      ok(true, 'no pending encounter (all raiders dropped) — honest');
    }
    Game.resolveWildMonsterEncounter = _enc;
  }

  console.log('TEST 2: no silent clobber of a live pendingEncounter');
  {
    const { Game, v } = await freshGame(777);
    // a feast draw is pending
    Game.pendingEncounter = true;
    Game.pendingMonsterId = 'feast_beast_test';
    v.lastRaidDay = (Game.state.scholar.day || 10) - 8;
    let fired = false, tries = 0;
    while (!fired && tries < 15 && !Game.over) { tries++; fired = Game.havenRaidTick(); }
    ok(fired, 'raid fired');
    ok(Game.pendingMonsterId === 'feast_beast_test', `pending NOT overwritten (still '${Game.pendingMonsterId}')`);
    const wms = Game.worldMonsters();
    const lingered = wms.filter(m => m.lingering).length;
    ok(lingered > 0, `${lingered} raider(s) linger at the treeline instead`);
  }

  console.log('TEST 3: normal case — player faces a live raider');
  {
    const { Game, v } = await freshGame(99);
    const { fired } = fireRaid(Game, v);
    ok(fired, 'raid fired');
    ok(!!Game.pendingEncounter, 'pendingEncounter set for the player at haven');
    const wms = Game.worldMonsters();
    const mid = Game.pendingMonsterId;
    const live = wms.some(m => m.id === mid && (m.hp || 0) > 0);
    ok(live, `faced raider is alive in the world (${mid})`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
