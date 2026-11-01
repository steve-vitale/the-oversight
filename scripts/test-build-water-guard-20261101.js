// test-build-water-guard-20261101.js — WATER-GUARD ARRIVAL proof.
//
// Mechanism (landing r84, proven by the r84 arrival instrument): a thirsty
// scholar's walk home dies on a blocked path. The outing guard's travelTo
// jump was refused by a fallen_tree at (3,3) — hydration skipped 6x,
// arrival 0/4, scholar Jude dying of dehydration next to a full cistern —
// while the same guard arrives immediately when the path is clear (seed
// 762 kcal skips). The standing policy guard has the same failure class:
// competent.js THIRST HOME walks home with walkTo, which "just stops at
// blockages" (its own comment), and the day then goes on with the scholar
// still wild and still thirsty.
//
// This proof drives the REAL competent.daily (not a copy of the guard) on
// the r84 panel seeds (759-762) plus seed 739, in a constructed
// blocked-path state, and asserts the thirst walk delivers the scholar
// home to drink:
//
//   tree33 : scholar (2,3), fallen_tree at (3,3) guarding the west entry,
//            home (4,4). The homeward jump's intermediate scan refuses:
//            (3,3) sits on a shortest path with a shortest-path entry.
//   column : scholar (2,4), a fallen_tree guarding the west entry on EVERY
//            tile of column x=3, home (4,4). No detour exists (BFS cannot
//            cross the column), so only clearing the named blockage works.
//   clear  : scholar (2,3), no blockage. Control: the clear path must
//            still arrive (the seed-762 shape), on old and new code.
//
// Isolation: COMPETENT_WARM=0 (no promise travel) and a recovering shield
// (COMPETENT_DIRECTIONAL_FLEE=1 + ctx._recoverUntilDay) so daily's only
// movement is the thirst walk plus recoverStep's homeward walk — both
// homeward, both blocked the same way on old code. No full landing panel
// is re-run here; the panel numbers are cited, not reproduced.
//
// Run: node scripts/test-build-water-guard-20261101.js
//   (parent spawns one child process per seed x scenario — the harness
//   forbids two loads in one process — and aggregates the results.)
// Exit 0 only when every case passes.
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

const SEEDS = [739, 759, 760, 761, 762];
const SCENARIOS = ['tree33', 'column', 'clear'];
const HOME = { x: 4, y: 4 }; // competent's DIR_FLEE_HAVEN target

async function runChild(seed, scenario) {
  // One harness load per process (sim-harness rule). Shared kit only.
  const { loadGame, setupGame } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  const { Game } = await loadGame({ seed });
  await setupGame(Game, 'Columbus, Ohio');
  const v = Game.state.village || {};
  const hx = HOME.x, hy = HOME.y;
  // Sweep incidental worldgen blockages FIRST (a seed's creek on (3,4)
  // refused the "clear" control on seed 759): the scenario's planted
  // blockages below must be the ONLY blockages on the board, so a pass
  // or fail is about the scenario, never about that seed's map.
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const t = Game.tileAt(x, y);
    if (!t) continue;
    delete t.blockFrom;
    if (t.type === 'creek') t.bridged = true;
  }
  // Scholar start + blockages per scenario (relative to home).
  let sx, sy;
  const plant = (x, y) => {
    const t = Game.tileAt(x, y);
    if (!t) throw new Error('no tile at ' + x + ',' + y);
    // Faithful to worldgen (game.js: a fallen_tree blockFrom carries type).
    t.blockFrom = { dx: -1, dy: 0, type: 'fallen_tree' }; // guards entry from the west
  };
  if (scenario === 'tree33') {
    sx = hx - 2; sy = hy - 1; plant(hx - 1, hy - 1); // (2,3) + tree (3,3)
  } else if (scenario === 'column') {
    sx = hx - 2; sy = hy;
    for (let y = 0; y < 9; y++) plant(hx - 1, y); // full west-guarded column
  } else { // clear control
    sx = hx - 2; sy = hy - 1;
  }
  // Home tile must be offered at d=3 (travelTargets needs revealed).
  const homeTile = Game.tileAt(hx, hy);
  if (homeTile) { homeTile.revealed = true; homeTile.visited = true; }
  // Scholar state: wild, thirsty (below both the <25 guard and the <45
  // policy thresholds), no water carried, well fed (the water-only shape:
  // kcal is NOT the problem, the blocked path is).
  Game.map.px = sx; Game.map.py = sy;
  const startTile = Game.tileAt(sx, sy);
  if (startTile) {
    startTile.revealed = true; startTile.visited = true;
    if (/creek|well|spring|river|pond|haven/i.test(startTile.type || '')) startTile.type = 'meadow';
  }
  const s = Game.state.scholar;
  s.hydration = 20; s.water = []; s.kcal = 1500;
  try { s.insideHaven = false; } catch (e) {}
  const hydBefore = s.hydration;
  // Spy: every travelTo call records the position it leaves the scholar on.
  const visited = [[Game.map.px, Game.map.py]];
  const origTravelTo = Game.travelTo.bind(Game);
  Game.travelTo = function (x, y, force, combatExit) {
    const r = origTravelTo(x, y, force, combatExit);
    visited.push([Game.map.px, Game.map.py]);
    return r;
  };
  const ctx = { policyId: 'water-guard-proof', _recoverUntilDay: (s.day || 0) + 10 };
  let dailyErr = null;
  try { competent.daily(Game, ctx); } catch (e) { dailyErr = String((e && e.message) || e); }
  const reachedHome = visited.some(p => p[0] === hx && p[1] === hy);
  const drank = (Game.state.scholar.hydration || 0) > hydBefore;
  const detours = ctx.thirstHomeDetours || 0;
  const clears = ctx.thirstHomeClears || 0;
  const blockedType = ctx.thirstHomeBlockedType || null;
  // PASS: arrived home and drank. Blocked cases must additionally show the
  // fix doing work (a detour step or a clear) — plain walkTo cannot arrive
  // on either blocked geometry, so an arrival without either would be a
  // false pass from some other leg.
  let pass;
  if (scenario === 'clear') pass = reachedHome && drank;
  else pass = reachedHome && drank && (detours > 0 || clears > 0);
  return {
    seed, scenario, pass,
    start: [sx, sy], end: [Game.map.px, Game.map.py],
    village: [v.px ?? null, v.py ?? null],
    hydBefore, hydAfter: Math.round(Game.state.scholar.hydration || 0),
    reachedHome, drank, detours, clears, blockedType,
    thirstHome: ctx.thirstHome || 0, dailyErr, over: !!Game.over,
  };
}

async function main() {
  if (process.env.PROOF_CHILD === '1') {
    const seed = parseInt(process.env.SEED, 10);
    const scenario = process.env.SCENARIO;
    const r = await runChild(seed, scenario);
    console.log(JSON.stringify(r));
    process.exit(r.pass ? 0 : 1);
  }
  // Parent: one child per seed x scenario (fresh harness each).
  const results = [];
  for (const seed of SEEDS) {
    for (const scenario of SCENARIOS) {
      const env = Object.assign({}, process.env, {
        PROOF_CHILD: '1', SEED: String(seed), SCENARIO: scenario,
        COMPETENT_WARM: '0', COMPETENT_DIRECTIONAL_FLEE: '1',
      });
      const out = spawnSync(process.execPath, [__filename], { env, encoding: 'utf8', timeout: 600000 });
      let r = null;
      try { r = JSON.parse((out.stdout || '').trim().split('\n').pop()); } catch (e) {}
      if (!r) r = { seed, scenario, pass: false, dailyErr: 'no-json-output', stderr: (out.stderr || '').slice(-500) };
      results.push(r);
      console.log(`${r.pass ? 'PASS' : 'FAIL'} seed=${seed} ${scenario} start=${JSON.stringify(r.start)} end=${JSON.stringify(r.end)} hyd=${r.hydBefore}->${r.hydAfter} reachedHome=${r.reachedHome} drank=${r.drank} detours=${r.detours} clears=${r.clears} blocked=${r.blockedType} err=${r.dailyErr || ''}`);
    }
  }
  const nPass = results.filter(r => r.pass).length;
  console.log(`WATER-GUARD: ${nPass}/${results.length} cases pass`);
  process.exit(nPass === results.length ? 0 : 1);
}

main().catch(e => { console.error('PROOF FATAL: ' + (e && e.stack || e)); process.exit(2); });
