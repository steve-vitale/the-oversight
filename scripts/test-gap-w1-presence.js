#!/usr/bin/env node
// test-gap-w1-presence.js — proof for gap-phase2 W1 scale-combat presence fixes:
//   lines 592/628: startCombat (and startAlienCombat) refresh villager grid
//     positions via ensureVillagerPositions before the positional join rule
//     runs — a stale map no longer joins nobody.
//   line 630: the presence beat fires once per distinct threat, not once per
//     daily/upkeep tick while the same threat lingers at Haven.
// Usage: node scripts/test-gap-w1-presence.js (from the repo root)
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
process.env.PRESENCE = '1';
const PR = require(path.join(REPO, 'scripts', 'policies', 'presence'));
const monsters = require(path.join(REPO, 'src/data', 'monsters.json'));

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// --- line 630: once-per-threat cooldown (mock Game) ---
{
  const G = {
    state: { scholar: { insideHaven: false }, village: { px: 4, py: 4 } },
    data: { monsters },
    playerAtHaven: () => true,
    inCombat: () => false,
    over: false,
    aidCrisis: () => true, // threat: 'aid-crisis'
    worldMonsters: () => [],
    enterBuilding() { this.state.scholar.insideHaven = true; return true; },
    microMove: () => true,
  };
  const ctx = {};
  PR.presenceBeat(G, ctx);
  ok('630 first threat fires', ctx.presenceGoInside === 1, `goInside=${ctx.presenceGoInside}`);
  G.state.scholar.insideHaven = false; // scholar steps back out; same threat lingers
  PR.presenceBeat(G, ctx);
  ok('630 same threat does not refire', ctx.presenceGoInside === 1, `goInside=${ctx.presenceGoInside}`);
  // New threat: aid crisis over, a wave-3 monster arrives at Haven.
  G.aidCrisis = () => false;
  G.worldMonsters = () => [{ tx: 4, ty: 4, id: 'spool' }];
  G.state.scholar.insideHaven = false;
  PR.presenceBeat(G, ctx);
  ok('630 new threat fires fresh', ctx.presenceGoInside === 2, `goInside=${ctx.presenceGoInside}`);
}

// --- lines 592/628: startCombat refreshes positions (real harness) ---
(async () => {
  const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 42, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  // Simulate the stale map: wipe every grid position, scholar on the Haven
  // node on the villagers' side of the door.
  const v = Game.state.village || {};
  v.positions = {};
  const s = Game.state.scholar || {};
  s.insideHaven = true;
  let refreshCalls = 0;
  const orig = Game.ensureVillagerPositions;
  Game.ensureVillagerPositions = function () { refreshCalls++; return orig.apply(this, arguments); };
  let err = null;
  try {
    await quietLog(async () => { Game.startCombat('bulldozer'); });
  } catch (e) { err = e; }
  const positioned = Object.keys(v.positions || {}).length;
  ok('592/628 startCombat calls ensureVillagerPositions', !err && refreshCalls >= 1,
    err ? String(err && err.message) : `calls=${refreshCalls}`);
  ok('592/628 stale map repopulated at fight start', positioned > 0, `positioned=${positioned}`);
  console.log(`\n${pass} pass, ${fail} fail`);
  if (fail) process.exit(1);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
