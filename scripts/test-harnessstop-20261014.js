#!/usr/bin/env node
// PROOF (harnessstop arm, 2026-10-14): the dead-village stop condition.
// Synthetic fixture: a lived-in village (15 game-days) whose NPCs all die
// through the ENGINE's real removal path (Game.removeVillager 'killed' —
// corpse, gossip, dead mark), leaving the scholar alone. The engine keeps
// the game going (correctly — wanderers can join, babies can be born), but
// for sim measurement the community is gone.
//
// RED (pristine sim-harness.js): runDays has no dead-village stop — the
//   scholar-alone village simulates the whole 75-day horizon.
//   => assertion (endReason === 'village-dead', stopped within +10d tail) FAILS.
// GREEN (fixed): runDays stops after the +10d tail.
//   => assertion PASSES.
//
// Guardrail (b), live villages byte-identical, is covered by
// scripts/measure-harnessstop-20261014.js (trajHash before/after).
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

const SEED = 505, KILL_DAY = 15, HORIZON = 75, TAIL = 10;

async function main() {
  const { Game, manifest } = await loadGame({ seed: SEED, mode: 'harnessstop-proof' });
  await setupGame(Game);
  let killDay = null, npcCountAtKill = null;
  const baseUpkeep = leadcourt.upkeep ? leadcourt.upkeep.bind(leadcourt) : null;
  const baseDaily = leadcourt.daily.bind(leadcourt);
  const policy = Object.assign({}, leadcourt, {
    id: 'leadcourt-killall',
    daily(Game, ctx) {
      baseDaily(Game, ctx);
      const sday = (Game.state.scholar || {}).day || 0;
      if (sday >= KILL_DAY && killDay === null) {
        const v = Game.state.village || {};
        const npcs = (v.roster || []).filter(id => id !== Game.villagerId);
        npcCountAtKill = npcs.length;
        for (const vid of npcs) {
          try { Game.removeVillager(vid, 'killed'); } catch (e) {}
        }
        killDay = sday;
      }
      // FIXTURE SCAFFOLDING (not the engine, not the harness): keep the lone
      // scholar alive so the fixture holds livingNPCs==0 with Game.over==false
      // for the full tail. Without it the scholar dies in combat ~day 20 and
      // the engine (correctly) declares village-lost — a different path than
      // the harness stop under test. Identical in RED and GREEN phases.
      if (killDay !== null) {
        try { Game.state.scholar.health = 100; } catch (e) {}
        // Scaffolding continued: the courtship policy's outflows (~5k/day in
        // tendLink/counter gifts) drain the pantry with one mouth, and the
        // engine correctly scatters a starving village (game.js:26889) — a
        // real engine path, but not the harness stop under test. Restock so
        // the fixture holds "dead village, living scholar" through the tail.
        try {
          const v = Game.state.village || {};
          v.pantry = v.pantry || [];
          const kcal = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
          if (kcal < 20000) {
            v.pantry.push({ id: 'fixture-staple-' + sday, name: 'Fixture grain (scaffolding)', kcalEach: 100, units: 200, daysLeft: 30, fresh: true });
          }
        } catch (e) {}
      }
    },
    fight(Game, ctx) {
      // Scaffolding continued: AFTER the kill only, route every fight (the
      // harness's own time-freeze resolution — an honest in-fiction flee). A
      // lone scholar who stands and fights dies; a fleeing one lives to be
      // measured. Gated on killDay so the pre-kill trajectory is untouched.
      if (killDay === null) return false;
      try {
        if (Game.tbfight && !Game.tbfight.over) { Game.tbEnd('routed'); return true; }
      } catch (e) {}
      return false;
    },
    upkeep(Game, ctx) {
      if (baseUpkeep) baseUpkeep(Game, ctx);
      // Same scaffolding, 3x/day: the scholar takes ~40+ damage per part
      // fighting alone — a once-daily top-up still lets them die mid-day.
      if (killDay !== null) {
        try { Game.state.scholar.health = 100; } catch (e) {}
      }
    },
  });
  const t0 = Date.now();
  let tKill = null;
  const _dailyWrap = policy.daily;
  policy.daily = function (Game, ctx) {
    _dailyWrap(Game, ctx);
    if (killDay !== null && tKill === null) tKill = Date.now();
  };
  const result = await runDays(Game, policy, { days: HORIZON, manifest, sampleEvery: 10 });
  const ms = Date.now() - t0;
  const postKillMs = tKill === null ? null : (Date.now() - tKill);

  console.log(`killDay=${killDay} npcsKilled=${npcCountAtKill} days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} ms=${ms} postKillMs=${postKillMs}`);

  // The fixture must actually kill NPCs and leave the scholar alive.
  assert(killDay !== null, 'fixture failed: kill never fired');
  assert(npcCountAtKill > 0, 'fixture failed: no NPCs to kill');
  assert(!Game.over, 'fixture failed: engine declared game over (not the harness path under test)');

  // THE assertion: dead village stops within the +10d tail.
  assert.strictEqual(result.endReason, 'village-dead',
    `expected endReason 'village-dead', got '${result.endReason}' (days=${result.days})`);
  assert(result.days < HORIZON,
    `expected early stop, ran full horizon (${result.days}d)`);
  assert(result.days <= killDay + TAIL + 3, // +3 loop-day/sday slack
    `tail too long: stopped day ${result.days}, kill was game-day ${killDay}`);
  assert(result.days >= killDay + 5,
    `tail too short (instant stop?): stopped day ${result.days}, kill was game-day ${killDay}`);
  console.log('PROOF GREEN: dead village stopped within +10d tail');
}

main().catch(e => { console.error('PROOF RED: ' + e.message); process.exit(1); });
