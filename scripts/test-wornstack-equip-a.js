#!/usr/bin/env node
// scripts/test-wornstack-equip-a.js — proof test, arm sim-wornstack-equip-a
// (finding #2707, SCHOLAR EQUIP/UNEQUIP COLLAPSE A WORN STACK).
//
// Proves the scholar's own equip/unequip round-trip preserves units:
// equipping a 2-unit stack and taking it off again returns 2 units to
// the pack (0 lost). FAILS on old code — equip() splices the whole
// stack out of the pack and seats a units-less worn entry, and
// unequip() pushes units:1 back — and PASSES on fixed code. The
// displaced-piece overwrite in equip() is covered too: equipping a
// second stack over a worn stack must return the displaced stack
// with its units intact.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged scholar
// carries the same geared shape omar carried on seed 107369 — a
// searcaster with 2 cells — plus stacked stone knives, so both the
// task's trinket framing (2-cell stack worn as gear) and the genuine
// player path (a stacked melee weapon via the pack's Equip button)
// are staged. See evidence/2026-11-23/sim-wornstack-equip-a-prereg.md
// (FROZEN) and evidence/2026-11-22/sim-gunloss-a.md.
//
// Usage: node scripts/test-wornstack-equip-a.js
// Exit 0 = all checks pass. Exit 1 = a failure. Writes NOTHING into
// the repo; prints PASS/FAIL lines to stdout. Harness: shared
// sim-harness (seeded Math.random BEFORE eval, full src/js list in
// index.html order minus DOM-only files).
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function unitsOf(it) {
  if (!it) return 0;
  if (typeof it === 'string') return 1;
  return (it.units != null ? it.units : 1);
}
function itemIdOf(it) {
  return (typeof it === 'string') ? it : (it && (it.itemId || it.id));
}
// Total units of one item across pack + worn (a worn entry with no
// units field counts as 1, as before).
function totalOf(Game, itemId) {
  const s = (Game.state || {}).scholar || {};
  let n = 0;
  for (const it of (s.inventory || [])) if (itemIdOf(it) === itemId) n += unitsOf(it);
  for (const sl of Object.keys(s.equipped || {})) {
    const e = s.equipped[sl];
    if (e && e.itemId === itemId) n += unitsOf(e);
  }
  return n;
}
function packUnits(Game, itemId) {
  const s = (Game.state || {}).scholar || {};
  let n = 0;
  for (const it of (s.inventory || [])) if (itemIdOf(it) === itemId) n += unitsOf(it);
  return n;
}
// Pack index of the first entry of an item with exactly `units` units
// (order-independent: equip/unequip reorder the pack as they push).
function packIndexByUnits(Game, itemId, units) {
  const inv = ((Game.state || {}).scholar || {}).inventory || [];
  for (let i = 0; i < inv.length; i++) {
    if (itemIdOf(inv[i]) === itemId && unitsOf(inv[i]) === units) return i;
  }
  return -1;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'wornstack-equip' });
  await quietLog(async () => { await setupGame(Game); });
  const s = Game.state.scholar;
  s.inventory = s.inventory || [];
  s.equipped = {};

  // ---- stage the measured shape: stacked knives + 2 cells ----
  s.inventory.push(
    { itemId: 'stone_knife', name: 'Stone knife', units: 2, kcalEach: 0, kg: 0.5 },
    { itemId: 'stone_knife', name: 'Stone knife', units: 2, kcalEach: 0, kg: 0.5 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kcalEach: 0, kg: 0.4 },
    { itemId: 'stone_knife', name: 'Stone knife', units: 1, kcalEach: 0, kg: 0.5 });
  check('staging: pack holds 5 knives across 3 entries', packUnits(Game, 'stone_knife') === 5,
    'knives=' + packUnits(Game, 'stone_knife'));
  check('staging: pack holds 2 cells in one entry', packUnits(Game, 'fusion_cell') === 2,
    'cells=' + packUnits(Game, 'fusion_cell'));

  // ---- weapon round-trip (the genuine player path) ----
  let idx = packIndexByUnits(Game, 'stone_knife', 2);
  Game.equip(idx, 'melee');
  check('equip: first knife stack lands in the melee slot',
    s.equipped.melee && s.equipped.melee.itemId === 'stone_knife',
    JSON.stringify(s.equipped.melee));
  check('equip: worn knife stack carries units:2 (the stack survives)',
    !!(s.equipped.melee && s.equipped.melee.units === 2),
    JSON.stringify(s.equipped.melee));
  check('equip: no knife is duplicated or lost while worn (total still 5)',
    totalOf(Game, 'stone_knife') === 5, 'total=' + totalOf(Game, 'stone_knife'));
  check('equip: pack holds 3 knives while one stack is worn',
    packUnits(Game, 'stone_knife') === 3, 'pack=' + packUnits(Game, 'stone_knife'));
  Game.unequip('melee');
  check('unequip: melee slot is empty again', !s.equipped.melee);
  check('unequip: pack holds 5 knives again (round-trip 0 lost)',
    packUnits(Game, 'stone_knife') === 5, 'pack=' + packUnits(Game, 'stone_knife'));

  // ---- trinket round-trip (the task's framing: 2-cell stack as gear) ----
  idx = packIndexByUnits(Game, 'fusion_cell', 2);
  Game.equip(idx, 'head');
  check('equip: cell stack lands in the head slot',
    s.equipped.head && s.equipped.head.itemId === 'fusion_cell',
    JSON.stringify(s.equipped.head));
  check('equip: worn cell stack carries units:2 (the stack survives)',
    !!(s.equipped.head && s.equipped.head.units === 2),
    JSON.stringify(s.equipped.head));
  check('equip: no cell is duplicated or lost while worn (total still 2)',
    totalOf(Game, 'fusion_cell') === 2, 'total=' + totalOf(Game, 'fusion_cell'));
  Game.unequip('head');
  check('unequip: head slot is empty again', !s.equipped.head);
  check('unequip: pack holds 2 cells again (round-trip 0 lost)',
    packUnits(Game, 'fusion_cell') === 2, 'pack=' + packUnits(Game, 'fusion_cell'));

  // ---- displacement: a worn stack overwritten by a second stack ----
  idx = packIndexByUnits(Game, 'stone_knife', 2);
  Game.equip(idx, 'melee');
  check('displace: first knife stack worn again, units:2',
    !!(s.equipped.melee && s.equipped.melee.units === 2),
    JSON.stringify(s.equipped.melee));
  idx = packIndexByUnits(Game, 'stone_knife', 2);
  Game.equip(idx, 'melee');
  check('displace: second knife stack now worn, units:2',
    !!(s.equipped.melee && s.equipped.melee.units === 2),
    JSON.stringify(s.equipped.melee));
  check('displace: the displaced stack comes home with units:2 (pack 3)',
    packUnits(Game, 'stone_knife') === 3, 'pack=' + packUnits(Game, 'stone_knife'));
  check('displace: knife total still 5 (nothing created or destroyed)',
    totalOf(Game, 'stone_knife') === 5, 'total=' + totalOf(Game, 'stone_knife'));
  Game.unequip('melee');
  check('displace: after taking the second stack off, pack holds 5 again',
    packUnits(Game, 'stone_knife') === 5, 'pack=' + packUnits(Game, 'stone_knife'));

  // ---- single unit stays bare (no inflation) ----
  idx = packIndexByUnits(Game, 'stone_knife', 1);
  Game.equip(idx, 'melee');
  check('single: a 1-unit knife lands in the melee slot',
    s.equipped.melee && s.equipped.melee.itemId === 'stone_knife',
    JSON.stringify(s.equipped.melee));
  check('single: worn 1-unit knife gains NO units field (stays bare)',
    !(s.equipped.melee && ('units' in s.equipped.melee)),
    JSON.stringify(s.equipped.melee));
  Game.unequip('melee');
  check('single: pack holds 5 knives again (no inflation)',
    packUnits(Game, 'stone_knife') === 5, 'pack=' + packUnits(Game, 'stone_knife'));

  console.log('WORNSTACK_EQUIP_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('WORNSTACK_EQUIP_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
