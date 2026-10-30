#!/usr/bin/env node
// test-vestcounter-b.js — proof for sim-vestcounter-b (INSTRUMENT fix).
//   F1 (scholar read): itemId-form pack/equipped/string vests count;
//     old `.id`-form entries still count; non-vests do not. The pre-fix
//     algorithm (`.id` only, scholar only) is reproduced inline as a
//     reference and must read 0 on the itemId forms — that is the blind
//     spot, proven fixed rather than asserted away.
//   F2 (villager read): distinct (holder, vestId) pairs; pack+equipped
//     for one worn vest counts ONCE; dead holders, the scholar's person
//     record, stashed entries and off-roster persons do not count.
//   F3 (read-only): snapshot twice identical; planted state unchanged.
//   F4 (live engine, day 0): real harness states — seed 9915 day 0 has
//     Grace Obi's swat vest (villager 1, scholar 0); seed 9911 day 0 has
//     nothing; seed 9912 day 0 has Lena Ruiz's military vest (villager 1,
//     scholar 0). These match the sim-vests-b census day-0 rows.
// Usage: node scripts/test-vestcounter-b.js
'use strict';
const { stdSnapshot } = require('./sweep-compare');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Pre-fix algorithm, reproduced exactly as reference (scholar only, `.id`).
function oldScholarVests(Game) {
  const VEST_IDS = ['military_vest', 'swat_vest'];
  let n = 0;
  try {
    for (const it of ((Game.state.scholar || {}).inventory || [])) if (it && VEST_IDS.includes(it.id)) n += (it.units || 1);
    for (const v of Object.values((Game.state.scholar || {}).equipped || {})) if (v && VEST_IDS.includes(v.id)) n++;
  } catch (e) {}
  return n;
}

function fakeGame(scholar, villagers, roster, scholarVid) {
  return {
    state: {
      scholar: scholar || { inventory: [], equipped: {} },
      village: { roster: roster || [] },
    },
    data: { villagers: villagers || [], background_survivors: [] },
    villagerId: scholarVid || null,
  };
}

(function f1() {
  // itemId pack vest counts; old algorithm reads 0 on the same state.
  let g = fakeGame({ inventory: [{ itemId: 'military_vest', name: 'Military vest', units: 1 }], equipped: {} }, [], []);
  check('F1 itemId pack vest counts', stdSnapshot(g).vests === 1, 'vests=' + stdSnapshot(g).vests);
  check('F1 old algorithm misses itemId pack vest', oldScholarVests(g) === 0, 'old=' + oldScholarVests(g));
  // itemId equipped vest counts; old algorithm reads 0.
  g = fakeGame({ inventory: [], equipped: { torso: { itemId: 'swat_vest', name: 'SWAT vest' } } }, [], []);
  check('F1 itemId equipped vest counts', stdSnapshot(g).vests === 1, 'vests=' + stdSnapshot(g).vests);
  check('F1 old algorithm misses itemId equipped vest', oldScholarVests(g) === 0, 'old=' + oldScholarVests(g));
  // Old `.id`-form entries still count (backward compatible).
  g = fakeGame({ inventory: [{ id: 'military_vest', units: 1 }], equipped: {} }, [], []);
  check('F1 id-form pack vest still counts', stdSnapshot(g).vests === 1, 'vests=' + stdSnapshot(g).vests);
  // String entry counts.
  g = fakeGame({ inventory: ['swat_vest'], equipped: {} }, [], []);
  check('F1 string entry counts', stdSnapshot(g).vests === 1, 'vests=' + stdSnapshot(g).vests);
  // Non-vest items do not count; empty state reads 0.
  g = fakeGame({ inventory: [{ itemId: 'hide_armor' }, { itemId: 'stone' }], equipped: { head: { itemId: 'hide_armor' } } }, [], []);
  check('F1 non-vests read 0', stdSnapshot(g).vests === 0 && stdSnapshot(g).vestsVillager === 0);
  g = fakeGame(null, null, null, null);
  check('F1 empty state reads 0', stdSnapshot(g).vests === 0 && stdSnapshot(g).vestsVillager === 0);
})();

(function f2() {
  const scholar = { inventory: [], equipped: {} };
  // One villager, one vest in BOTH pack and equipped: ONE pair, not two.
  let villagers = [{ id: 'v_grace', items: [{ itemId: 'swat_vest' }], equipped: { torso: { itemId: 'swat_vest' } } }];
  let g = fakeGame(scholar, villagers, ['v_grace'], 'v_scholar');
  check('F2 worn villager vest counts once', stdSnapshot(g).vestsVillager === 1, 'vv=' + stdSnapshot(g).vestsVillager);
  check('F2 villager vest is not scholar vest', stdSnapshot(g).vests === 0);
  // Two villagers, different vests: two pairs.
  villagers = [
    { id: 'v_a', items: [{ itemId: 'military_vest' }], equipped: {} },
    { id: 'v_b', items: [], equipped: { torso: { itemId: 'swat_vest' } } },
  ];
  g = fakeGame(scholar, villagers, ['v_a', 'v_b'], 'v_scholar');
  check('F2 two villagers two vests', stdSnapshot(g).vestsVillager === 2, 'vv=' + stdSnapshot(g).vestsVillager);
  // Dead holder excluded.
  villagers = [{ id: 'v_dead', dead: true, items: [{ itemId: 'military_vest' }], equipped: {} }];
  g = fakeGame(scholar, villagers, ['v_dead'], 'v_scholar');
  check('F2 dead holder excluded', stdSnapshot(g).vestsVillager === 0, 'vv=' + stdSnapshot(g).vestsVillager);
  // Scholar person record in the roster is excluded (its live pack is
  // state.scholar, counted in `vests`, never double-counted here).
  villagers = [{ id: 'v_scholar', items: [{ itemId: 'military_vest' }], equipped: {} }];
  g = fakeGame(scholar, villagers, ['v_scholar'], 'v_scholar');
  check('F2 scholar person record excluded', stdSnapshot(g).vestsVillager === 0, 'vv=' + stdSnapshot(g).vestsVillager);
  // Stashed entries are not held (scan reads items/equipped only).
  villagers = [{ id: 'v_c', items: [], equipped: {}, stashed: [{ itemId: 'swat_vest' }] }];
  g = fakeGame(scholar, villagers, ['v_c'], 'v_scholar');
  check('F2 stashed vest not held', stdSnapshot(g).vestsVillager === 0, 'vv=' + stdSnapshot(g).vestsVillager);
  // Off-roster person with a vest does not count.
  villagers = [{ id: 'v_off', items: [{ itemId: 'military_vest' }], equipped: {} }];
  g = fakeGame(scholar, villagers, [], 'v_scholar');
  check('F2 off-roster person excluded', stdSnapshot(g).vestsVillager === 0, 'vv=' + stdSnapshot(g).vestsVillager);
  // Same vest id on one villager in two forms is still one pair; a
  // second vest id on the same villager is a second pair.
  villagers = [{ id: 'v_d', items: [{ itemId: 'military_vest' }, { itemId: 'swat_vest' }], equipped: { torso: { itemId: 'military_vest' } } }];
  g = fakeGame(scholar, villagers, ['v_d'], 'v_scholar');
  check('F2 two vest ids one villager', stdSnapshot(g).vestsVillager === 2, 'vv=' + stdSnapshot(g).vestsVillager);
})();

(function f3() {
  const g = fakeGame(
    { inventory: [{ itemId: 'military_vest', units: 1 }], equipped: {} },
    [{ id: 'v_grace', items: [{ itemId: 'swat_vest' }], equipped: { torso: { itemId: 'swat_vest' } } }],
    ['v_grace'], 'v_scholar');
  const before = JSON.stringify(g);
  const s1 = stdSnapshot(g), s2 = stdSnapshot(g);
  check('F3 snapshot idempotent', JSON.stringify(s1) === JSON.stringify(s2), JSON.stringify(s1));
  check('F3 snapshot is a pure read', JSON.stringify(g) === before);
  check('F3 snapshot values', s1.vests === 1 && s1.vestsVillager === 1, JSON.stringify(s1));
})();

(async function f4() {
  const { loadGame, setupGame } = require('./sim-harness');
  const cases = [
    { seed: 9915, wantVests: 0, wantVV: 1, note: 'Grace Obi swat vest' },
    { seed: 9911, wantVests: 0, wantVV: 0, note: 'no vest dealt' },
    { seed: 9912, wantVests: 0, wantVV: 1, note: 'Lena Ruiz military vest' },
  ];
  for (const c of cases) {
    const { Game } = await loadGame({ seed: c.seed, mode: 'vestcounter-b-test', fullTelemetry: false });
    await setupGame(Game);
    const s = stdSnapshot(Game);
    check(`F4 live day-0 seed ${c.seed} (${c.note})`,
      s.vests === c.wantVests && s.vestsVillager === c.wantVV,
      `vests=${s.vests} vv=${s.vestsVillager} want=${c.wantVests}/${c.wantVV}`);
  }
  console.log(`\ntest-vestcounter-b: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
