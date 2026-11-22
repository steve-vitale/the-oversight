// test-corpsecap-a.js — proof test for arm sim-corpsecap-a
// (corpse-cap gun sink, finding #2635 follow-up).
// Proves the instrument BEFORE any judged sim:
//   (1) corpseSnapshot: one row per corpse — id, holder, kind, day
//       died, decay stage, buried, searcasters + cells on the corpse
//       (units-0 stacks count as 0, not a gun);
//   (2) diffCorpseSnapshots: removed corpses found, added corpses
//       ignored, empty diff on no change;
//   (3) live, staged registerDeath: 40 corpses registered on day 1
//       (the first carrying a searcaster + 2 cells), day advanced to
//       20 so all are stage 4 ('bones'), one more death -> the cap
//       splice fires and the driver's wrap catches it in the act:
//       exactly one cull event, the gun corpse, searcasters 1,
//       list 40 -> 40, gun total 1 -> 0;
//   (4) the methods the wraps rely on exist;
//   (5) the analyzer's --selftest passes.
// Live-harness section uses seed 7 via scripts/sim-harness.js
// (Math.random seeded BEFORE eval, per the harness rules).
// Lever-phase sections (CORPSECAP=1 sparing a gun corpse) are added
// only if the diag GOes (prereg §6 bar 3); this file proves the diag
// instrument now. Run: node scripts/test-corpsecap-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'corpsecap-driver-a'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-corpsecap-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; failures.push(name); console.log('FAIL: ' + name); }
}
function fakeGame(over) {
  const base = {
    villagerId: 'scholar1',
    data: { villagers: [], items: [
      { id: 'searcaster', weapon: { bonus: 120, type: 'ranged', range: 8, ammo: 'fusion_cell' } },
      { id: 'fusion_cell' },
    ] },
    state: { scholar: { inventory: [], equipped: {}, day: 10 }, village: { roster: [] }, corpses: [] },
    stashState: function () { return { materials: {}, weapons: [], armor: [], tools: [], medicine: [] }; },
    corpses: function () { return this.state.corpses; },
    corpseStage: function (c) { return ((this.state.scholar.day || 0) - (c.dayDied || 0)) >= 8 ? 4 : 0; },
  };
  return Object.assign(base, over || {});
}

function pureTests() {
  // (1) corpseSnapshot rows.
  const g = fakeGame();
  g.state.corpses = [
    { id: 'corpse_1_a', villagerId: 'vidDead', kind: 'villager', dayDied: 1, buried: false,
      items: [{ itemId: 'searcaster', units: 1 }, { itemId: 'fusion_cell', units: 2 }] },
    { id: 'corpse_1_b', villagerId: null, kind: 'monster', dayDied: 1, buried: false,
      items: [{ itemId: 'searcaster', units: 0 }] },
    { id: 'corpse_9_c', villagerId: null, kind: 'monster', dayDied: 9, buried: true, items: [] },
  ];
  g.state.scholar.day = 10;
  const snap = driver.corpseSnapshot(g);
  check('snapshot: 3 rows', snap.length === 3);
  check('snapshot: gun corpse row', snap[0].id === 'corpse_1_a' && snap[0].searcasters === 1 &&
    snap[0].cells === 2 && snap[0].stage === 4 && snap[0].buried === false);
  check('snapshot: zero-units gun counts as 0', snap[1].searcasters === 0);
  check('snapshot: buried corpse kept, stage 0', snap[2].buried === true && snap[2].stage === 0);
  // (2) diffCorpseSnapshots.
  const before = snap;
  const after = [snap[1], snap[2], { id: 'corpse_10_new', villagerId: null, kind: 'monster',
    dayDied: 10, stage: 0, buried: false, searcasters: 0, cells: 0 }];
  const removed = driver.diffCorpseSnapshots(before, after);
  check('diff: removed corpse found', removed.length === 1 && removed[0].id === 'corpse_1_a');
  check('diff: added corpse ignored', driver.diffCorpseSnapshots(before, before).length === 0);
  check('diff: empty before, empty result', driver.diffCorpseSnapshots([], after).length === 0);
  // (2b) the grant-diff snapshot still works (driver reuse).
  const alice = { id: 'alice', dead: false,
    items: [{ itemId: 'searcaster', units: 1 }, { itemId: 'fusion_cell', units: 2 }], stashed: [] };
  g.data.villagers = [alice];
  g.state.village.roster = ['alice'];
  const gs = driver.snapshotGunCells(g);
  check('snapshotGunCells: villager gun + cells', gs.villagers.alice.guns === 1 && gs.villagers.alice.cells === 2);
}

async function liveTests() {
  const { Game } = await loadGame({ seed: 7, mode: 'test-corpsecap-a', fullTelemetry: false });
  await setupGame(Game);
  // (4) the methods the wraps rely on exist.
  const methods = ['registerDeath', 'corpses', 'corpseStage', '_corpseTakeStack',
    'fireContest', '_contestEnd', '_cxItemPrize', 'rollAlienLoot',
    'alienLootGrant', 'villagerKillLoot'];
  for (const m of methods) check('live: Game.' + m + ' is a function', typeof Game[m] === 'function');
  // (3) staged cap splice, caught by the driver's own wrap shape.
  // Install the driver's registerDeath wrap (same code as the driver:
  // pre/post corpseSnapshot diff via diffCorpseSnapshots).
  const cullEvents = [];
  const errors = [];
  const orig = Game.registerDeath;
  const gday = function () { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  Game.registerDeath = function (opts) {
    let before = null;
    try { before = driver.corpseSnapshot(Game); } catch (e) {}
    const ret = orig.apply(this, arguments);
    try {
      const after = driver.corpseSnapshot(Game);
      for (const c of driver.diffCorpseSnapshots(before, after)) {
        cullEvents.push({ day: gday(), corpseId: c.id, corpseVid: c.villagerId,
          kind: c.kind, dayDied: c.dayDied, stage: c.stage, buried: c.buried,
          searcasters: c.searcasters, cells: c.cells,
          listLenBefore: (before || []).length, listLenAfter: after.length });
      }
    } catch (e) { errors.push(String(e.message).slice(0, 80)); }
    return ret;
  };
  const st = Game.state || {};
  const startLen = Game.corpses().length;
  check('live: corpse list starts empty', startLen === 0);
  // Day 1: the gun corpse first, then 39 fillers — list hits 40,
  // never over (no splice yet; all fresh).
  st.scholar.day = 1;
  Game.registerDeath({ kind: 'monster', monsterId: 'm_gun', name: 'Gun Bearer',
    cause: 'combat', items: [{ itemId: 'searcaster', units: 1 }, { itemId: 'fusion_cell', units: 2 }] });
  const gunCorpseId = Game.corpses()[Game.corpses().length - 1].id;
  for (let i = 0; i < 39; i++) {
    Game.registerDeath({ kind: 'monster', monsterId: 'm_fill_' + i, name: 'Filler ' + i,
      cause: 'combat', items: [] });
  }
  check('live: 40 corpses, no cull yet', Game.corpses().length === 40 && cullEvents.length === 0);
  const gunsBefore = driver.gunLocationsOf(Game).total;
  check('live: gun total 1 before the trigger death', gunsBefore === 1);
  // Day 20: every corpse is stage 4 ('bones', 19 days old). One more
  // death pushes the list to 41 -> the splice fires on the OLDEST
  // stage-4 corpse: the gun corpse.
  st.scholar.day = 20;
  Game.registerDeath({ kind: 'monster', monsterId: 'm_trig', name: 'Trigger',
    cause: 'combat', items: [] });
  check('live: list capped at 40 after the trigger death', Game.corpses().length === 40);
  check('live: exactly one cull event', cullEvents.length === 1, cullEvents);
  if (cullEvents.length === 1) {
    const ev = cullEvents[0];
    check('live: culled corpse is the gun corpse', ev.corpseId === gunCorpseId, ev);
    check('live: cull names the searcaster + 2 cells', ev.searcasters === 1 && ev.cells === 2, ev);
    check('live: cull stage 4, 40 -> 40', ev.stage === 4 && ev.listLenBefore === 40 && ev.listLenAfter === 40, ev);
    check('live: cull day 20', ev.day === 20, ev);
  }
  const gunsAfter = driver.gunLocationsOf(Game).total;
  check('live: gun total 0 after the cull', gunsAfter === 0);
  check('live: wrap errors 0', errors.length === 0, errors);
  // Restore the unwrapped method (the harness Game is disposable, but
  // leave no wrap behind).
  Game.registerDeath = orig;
}

async function main() {
  pureTests();
  await liveTests();
  // (5) analyzer selftest.
  let selfOk = false;
  try { selfOk = analyzer.selftest(); } catch (e) { console.log('FAIL: analyzer selftest threw: ' + e.message); }
  check('analyzer --selftest passes', selfOk === true);
  console.log('corpsecap proof test: ' + pass + ' passed, ' + fail + ' failed');
  if (fail > 0) { console.log('failures: ' + failures.join(', ')); process.exitCode = 1; }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { pureTests: pureTests, liveTests: liveTests };
