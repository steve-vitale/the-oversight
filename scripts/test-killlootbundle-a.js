// test-killlootbundle-a.js — proof test for arm sim-killlootbundle-a
// (kill-loot searcaster bundle, KILLBUNDLE=1).
// Proves the mechanism BEFORE any judged sim:
//   (1) KILLBUNDLE=1: a forced searcaster kill-loot drop bundles exactly
//       2 fusion cells to the SAME killer as the gun.
//   (2) KILLBUNDLE unset: the same drop lands dry (gun only, 0 cells).
//   (3) KILLBUNDLE=1 + non-searcaster drop: no cells bundled.
//   (4) The driver's snapshot/diff + volley helpers (pure) behave.
//   (5) The analyzer's --selftest passes.
// Live-harness section uses seed 7 via scripts/sim-harness.js
// (Math.random seeded BEFORE eval, per the harness rules).
// Run: node scripts/test-killlootbundle-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-killlootbundle-a'));
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
  };
  return Object.assign(base, over || {});
}
function cellsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'fusion_cell') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}
function gunsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'searcaster') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}

function pureTests() {
  // (4a) snapshot/diff: gun + 2 cells on one holder.
  let g = fakeGame();
  const alice = { id: 'alice', dead: false,
    items: [{ itemId: 'searcaster', units: 1 }, { itemId: 'fusion_cell', units: 2 }], stashed: [] };
  g.data.villagers = [alice];
  g.state.village.roster = ['alice'];
  let snap = driver.snapshotGunCells(g);
  check('snapshot: villager gun + cells', snap.villagers.alice.guns === 1 && snap.villagers.alice.cells === 2);
  const before = { scholar: { guns: 0, cells: 0 }, villagers: { alice: { guns: 0, cells: 0 } } };
  const after = { scholar: { guns: 0, cells: 0 }, villagers: { alice: { guns: 1, cells: 2 } } };
  const d = driver.diffGunCells(before, after);
  check('diff: one gun + two cells on alice', d.length === 1 && d[0].holder === 'alice' &&
    d[0].gunsGained === 1 && d[0].cellsGained === 2 && d[0].cellsAfter === 2);
  // (4b) analyzer selftest.
  check('analyzer selftest passes', analyzer.selftest() === true);
}

async function liveTests() {
  const { Game } = await loadGame({ seed: 7, mode: 'killlootbundle-test', fullTelemetry: false });
  await setupGame(Game);
  // A living roster villager to be the killer.
  const roster = ((Game.state.village || {}).roster || []);
  let vid = null, person = null;
  for (const r of roster) {
    if (!r || r === Game.villagerId) continue;
    const p = Game.getPerson ? Game.getPerson(r) : null;
    if (p && !p.dead) { vid = r; person = p; break; }
  }
  check('live: a living roster villager exists', !!vid && !!person);
  if (!vid) return;
  const origRoll = Game.rollAlienLoot;
  try {
    // (1) KILLBUNDLE=1 + forced searcaster: gun + exactly 2 cells.
    process.env.KILLBUNDLE = '1';
    Game.rollAlienLoot = function () { return 'searcaster'; };
    const gunsBefore = gunsOf(person), cellsBefore = cellsOf(person);
    const drop = Game.villagerKillLoot(vid, { wave: 4, id: 'test-beast' });
    check('live: kill-loot returns searcaster', drop === 'searcaster');
    check('live: KILLBUNDLE=1 gains exactly 1 gun', gunsOf(person) - gunsBefore === 1);
    check('live: KILLBUNDLE=1 bundles exactly 2 cells', cellsOf(person) - cellsBefore === 2);
    // (2) KILLBUNDLE unset + forced searcaster: gun only, 0 cells.
    delete process.env.KILLBUNDLE;
    const gunsBefore2 = gunsOf(person), cellsBefore2 = cellsOf(person);
    const drop2 = Game.villagerKillLoot(vid, { wave: 4, id: 'test-beast' });
    check('live: unset returns searcaster', drop2 === 'searcaster');
    check('live: unset gains exactly 1 gun', gunsOf(person) - gunsBefore2 === 1);
    check('live: unset bundles 0 cells', cellsOf(person) - cellsBefore2 === 0);
    // (3) KILLBUNDLE=1 + non-searcaster drop: no cells.
    process.env.KILLBUNDLE = '1';
    Game.rollAlienLoot = function () { return 'apex_bow'; };
    const cellsBefore3 = cellsOf(person);
    const drop3 = Game.villagerKillLoot(vid, { wave: 4, id: 'test-beast' });
    check('live: non-searcaster drop returns apex_bow', drop3 === 'apex_bow');
    check('live: non-searcaster bundles 0 cells', cellsOf(person) - cellsBefore3 === 0);
  } finally {
    Game.rollAlienLoot = origRoll;
    delete process.env.KILLBUNDLE;
  }
}

(async function () {
  pureTests();
  await liveTests();
  console.log('TEST-KILLLOOTBUNDLE-A: ' + pass + ' passed, ' + fail + ' failed' + (fail ? ' :: ' + failures.join(' | ') : ''));
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
