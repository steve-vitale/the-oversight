// test-grantrate-a.js — proof test for arm sim-grantrate-a
// (searcaster contest-prize GRANT RATE, finding #2635 follow-up).
// Proves the instrument BEFORE any judged sim:
//   (1) the grant-diff snapshot finds exactly who gained a gun and
//       how many cells came with it (scholar pack vs equipped, villager
//       items, zero-units stacks count as 0);
//   (2) the roll caller taxonomy (contest-prize / kill-loot / other);
//   (3) the tier-4 contest pool, live: 300 rolls at chance 1 / tier 4
//       all land inside the 15-item pool, searcaster ~1/15 unweighted
//       and ~4/18 with GUNRATE=1 (the prereg's static weight claim,
//       proven live, not asserted from data alone);
//   (4) the GUNRATE redirect + 2-cell bundle, live: with 8 staged
//       contest wins (apex) and extreme-risk contests, repeated
//       _cxItemPrize calls eventually land a searcaster on the
//       _gunRateFighter pick with exactly 2 cells beside it;
//   (5) the grant-path methods the wraps rely on exist;
//   (6) the analyzer's --selftest passes.
// Live-harness section uses seed 7 via scripts/sim-harness.js
// (Math.random seeded BEFORE eval, per the harness rules).
// Run: node scripts/test-grantrate-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'grantrate-driver-a'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-grantrate-a'));
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

// The tier-4 contest pool, frozen from src/data (prereg §2): the 15
// items with lootTier 4 and (origin alien OR in extraItems[4]).
const TIER4_POOL = ['adaptive_dermis', 'apex_bow', 'bloodplate', 'commanders_coat',
  'conquerors_plate', 'farstrider_boots', 'fusion_cell', 'genesis_seed', 'godslayer_spear',
  'lifebound_vestments', 'searcaster', 'second_skin_suit', 'starfall_lance',
  'worldbreaker_maul', 'worldroot_plate'];

function pureTests() {
  // (1a) snapshot: villager gun + cells, scholar pack gun.
  let g = fakeGame();
  const alice = { id: 'alice', dead: false,
    items: [{ itemId: 'searcaster', units: 1 }, { itemId: 'fusion_cell', units: 2 }], stashed: [] };
  g.data.villagers = [alice];
  g.state.village.roster = ['alice'];
  g.state.scholar.inventory = [{ itemId: 'searcaster', units: 1 }];
  let snap = driver.snapshotGunCells(g);
  check('snapshot: villager gun + cells', snap.villagers.alice.guns === 1 && snap.villagers.alice.cells === 2);
  check('snapshot: scholar pack gun', snap.scholar.guns === 1 && snap.scholar.cells === 0);
  // (1b) scholar equipped gun counts (inventory + equipped are exclusive).
  g.state.scholar.inventory = [];
  g.state.scholar.equipped = { ranged: { itemId: 'searcaster', name: 'Searcaster' } };
  snap = driver.snapshotGunCells(g);
  check('snapshot: scholar equipped gun', snap.scholar.guns === 1);
  // (1c) zero-units cells count as 0 (taken stack, not a cell).
  alice.items = [{ itemId: 'fusion_cell', units: 0 }];
  snap = driver.snapshotGunCells(g);
  check('snapshot: zero-units cells count as 0', snap.villagers.alice.cells === 0);
  // (1d) diff: gun gained + 2 cells (the GUNRATE bundle shape).
  const before = { scholar: { guns: 0, cells: 0 }, villagers: { alice: { guns: 0, cells: 0 } } };
  const after = { scholar: { guns: 0, cells: 0 }, villagers: { alice: { guns: 1, cells: 2 } } };
  let d = driver.diffGunCells(before, after);
  check('diff: one gun + two cells on alice', d.length === 1 && d[0].holder === 'alice' &&
    d[0].gunsGained === 1 && d[0].cellsGained === 2 && d[0].cellsAfter === 2);
  // (1e) diff: no change -> no rows; scholar gain -> __scholar__ row.
  d = driver.diffGunCells(before, before);
  check('diff: no change, no rows', d.length === 0);
  d = driver.diffGunCells(before, { scholar: { guns: 1, cells: 0 }, villagers: { alice: { guns: 0, cells: 0 } } });
  check('diff: scholar gain is __scholar__', d.length === 1 && d[0].holder === '__scholar__' && d[0].gunsGained === 1);
  // (2) roll caller taxonomy.
  check('classifyRollCaller: contest prize', driver.classifyRollCaller('Error\n at foo (_cxItemPrize) (contests.js:1:1)') === 'contest-prize');
  check('classifyRollCaller: kill loot', driver.classifyRollCaller('Error\n at foo (villagerKillLoot) (game.js:1:1)') === 'kill-loot');
  check('classifyRollCaller: kill loot via tbKillRewards', driver.classifyRollCaller('Error\n at foo (tbKillRewards) (game.js:1:1)') === 'kill-loot');
  check('classifyRollCaller: kill loot via corpse', driver.classifyRollCaller('Error\n at foo (corpseForKill) (game.js:1:1)') === 'kill-loot');
  check('classifyRollCaller: other', driver.classifyRollCaller('Error\n at foo (something-else.js:1:1)') === 'other');
  check('classifyGrantCaller: contest prize', driver.classifyGrantCaller('Error\n at foo (_cxItemPrize) (contests.js:1:1)') === 'contest-prize');
  check('classifyGrantCaller: kill loot via tbKillRewards', driver.classifyGrantCaller('Error\n at foo (tbKillRewards) (game.js:1:1)') === 'kill-loot-corpse');
  check('classifyGrantCaller: show gift', driver.classifyGrantCaller('Error\n at foo (_showVillagerEnd) (contests.js:1:1)') === 'show-gift');
}

async function liveTests() {
  const { Game } = await loadGame({ seed: 7, mode: 'test-grantrate-a', fullTelemetry: false });
  await setupGame(Game);
  const st = Game.state || {};
  const roster = ((st.village || {}).roster) || [];
  const scholarVid = Game.villagerId;
  const npcVid = roster.filter(function (id) { return id !== scholarVid; })[0];
  check('live: roster has a non-scholar villager', !!npcVid);
  // (5) the methods the wraps rely on exist.
  const methods = ['fireContest', '_contestEnd', '_cxItemPrize', 'rollAlienLoot',
    'alienLootGrant', 'villagerKillLoot', '_corpseTakeStack', '_gunRateFighter',
    'broadcastRewardTier', 'unlockedWave', 'contestEligible', 'addNotability'];
  for (const m of methods) check('live: Game.' + m + ' is a function', typeof Game[m] === 'function');
  // (3) the tier-4 contest pool, live — unweighted first.
  delete process.env.GUNRATE;
  const poolSet = {};
  for (const id of TIER4_POOL) poolSet[id] = true;
  let sear = 0, cell = 0, outside = 0, n = 0;
  for (let i = 0; i < 300; i++) {
    const r = Game.rollAlienLoot({ wave: 4, loot: { chance: 1, tier: 4, rewardSource: 'contest' } }, null);
    n++;
    if (r == null) { outside++; continue; }
    if (!poolSet[r]) outside++;
    if (r === 'searcaster') sear++;
    if (r === 'fusion_cell') cell++;
  }
  check('live: 300 tier-4 contest rolls, none null at chance 1', n === 300 && outside === 0);
  check('live: unweighted searcaster share ~1/15 (got ' + sear + '/300)', sear >= 5 && sear <= 40);
  check('live: fusion_cell appears in the tier-4 pool (got ' + cell + '/300)', cell >= 1);
  // Weighted: GUNRATE=1 pushes 3 extra searcaster copies -> 4/18.
  process.env.GUNRATE = '1';
  let searW = 0, outsideW = 0;
  for (let i = 0; i < 300; i++) {
    const r = Game.rollAlienLoot({ wave: 4, loot: { chance: 1, tier: 4, rewardSource: 'contest' } }, null);
    if (r == null || !poolSet[r]) outsideW++;
    if (r === 'searcaster') searW++;
  }
  delete process.env.GUNRATE;
  check('live: GUNRATE-weighted searcaster share ~4/18 (got ' + searW + '/300)', searW >= 40 && searW <= 100);
  check('live: weighted rolls stay inside the pool', outsideW === 0);
  // (4) the GUNRATE redirect + 2-cell bundle, live. Stage apex with 8
  // contest wins (apex = wins >= 8), then call _cxItemPrize with an
  // extreme-risk contest until a searcaster lands. Per call P(gun) is
  // ~0.25 (apex roll) x 0.9 (chance) x 4/18 (pool) ~= 0.05, so 200
  // calls is a ~99.99% net; the seeded stream is deterministic.
  process.env.GUNRATE = '1';
  try {
    for (let i = 0; i < 8; i++) Game.addNotability('player', 'contestWin');
    const wins = (((Game.state.notability || {}).player || {}).contestWin || 0);
    check('live: 8 staged contest wins light apex (wins=' + wins + ')', wins >= 8);
    const fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
    check('live: _gunRateFighter names a living roster villager', !!fighter && fighter !== scholarVid &&
      (function () { try { const p = Game.getPerson(fighter); return !!p && !p.dead; } catch (e) { return false; } })());
    const contest = { id: 'test-extreme', risk: 'extreme' };
    let gunLanding = null, calls = 0;
    for (let i = 0; i < 200 && !gunLanding; i++) {
      const before = driver.snapshotGunCells(Game);
      const predicted = Game._gunRateFighter ? Game._gunRateFighter() : null;
      let ret = null;
      try { ret = Game._cxItemPrize({ variant: 'normal' }, contest, 'player'); } catch (e) { check('live: _cxItemPrize runs without throwing', false); break; }
      calls++;
      const after = driver.snapshotGunCells(Game);
      const gains = driver.diffGunCells(before, after);
      for (const gn of gains) {
        if (gn.gunsGained > 0) { gunLanding = { holder: gn.holder, cellsGained: gn.cellsGained, cellsAfter: gn.cellsAfter, predicted: predicted, ret: ret }; break; }
      }
    }
    check('live: a searcaster lands within 200 extreme prize calls', !!gunLanding);
    if (gunLanding) {
      check('live: the gun lands on the predicted _gunRateFighter pick', gunLanding.holder === gunLanding.predicted);
      check('live: the gun bundles exactly 2 cells (got ' + gunLanding.cellsGained + ')', gunLanding.cellsGained === 2);
    }
  } finally {
    delete process.env.GUNRATE;
  }
}

(async function () {
  try {
    pureTests();
    await liveTests();
    // (6) the analyzer selftest.
    let stOk = false;
    try { stOk = analyzer.selftest(); } catch (e) { console.log('analyzer selftest threw: ' + e.message); }
    check('analyzer --selftest passes', stOk === true);
  } catch (e) {
    fail++;
    failures.push('top-level throw: ' + e.message);
    console.log('TOP-LEVEL THROW: ' + (e.stack || e.message));
  }
  console.log('test-grantrate-a: ' + pass + ' passed, ' + fail + ' failed' + (fail ? ' — ' + failures.join('; ') : ''));
  process.exit(fail === 0 ? 0 : 1);
})();
