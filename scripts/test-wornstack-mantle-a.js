#!/usr/bin/env node
// scripts/test-wornstack-mantle-a.js — proof test, arm sim-wornstack-a
// (finding #2698, MANTLEBECOME WORN-STACK COLLAPSE DESTROYS A CELL).
//
// Proves mantleBecome carries a worn stack's units onto the scholar:
// a successor wearing a 2-cell fusion_cell stack as gear keeps 2 cells
// after succession (worn with units:2, 0 lost). FAILS on old code — the
// worn copy is Object.assign({}, e) and villager equipped entries never
// carry units (equipment.js autoEquip builds {itemId, name, ...} only),
// so the pool object holding units:2 is spliced out and the worn copy
// reads as 1 — and PASSES on fixed code.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged holder is
// the same geared kit omar carried on seed 107369 — a searcaster with
// 2 cells, equipped. Measured shape: seed 107369 day 134, omar's 2-cell
// stack worn as one accessory collapsed to 1 on succession (net loss
// 1 cell; the gun survived). See evidence/2026-11-22/sim-gunloss-a.md.
//
// Usage: node scripts/test-wornstack-mantle-a.js
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
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function unitsOf(it) {
  if (!it) return 0;
  if (typeof it === 'string') return 1;
  return (it.units != null ? it.units : 1);
}
function itemIdOf(it) {
  return (typeof it === 'string') ? it : (it && (it.itemId || it.id));
}
// Scholar cell total the honest way: inventory units + worn units
// (a worn entry with no units field counts as 1, as before).
function scholarCells(Game) {
  const s = (Game.state || {}).scholar || {};
  let inv = 0, worn = 0;
  for (const it of (s.inventory || [])) if (itemIdOf(it) === 'fusion_cell') inv += unitsOf(it);
  for (const sl of Object.keys(s.equipped || {})) {
    const e = s.equipped[sl];
    if (e && e.itemId === 'fusion_cell') worn += unitsOf(e);
  }
  return { inv, worn, total: inv + worn };
}
function scholarWornSlot(Game, itemId) {
  const s = (Game.state || {}).scholar || {};
  for (const sl of Object.keys(s.equipped || {})) {
    const e = s.equipped[sl];
    if (e && e.itemId === itemId) return sl;
  }
  return null;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'wornstack-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[1] || roster[0];
  const p = personOf(Game, vid);
  console.log('holder=' + vid + ' roster=' + roster.length);

  // ---- stage the measured shape: searcaster + 2-cell stack, equipped ----
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
  p.stashed = [];
  Game.villagerGearUp(vid, true);
  const wornCellSlot = Object.keys(p.equipped || {}).find(sl => p.equipped[sl] && p.equipped[sl].itemId === 'fusion_cell');
  const preCells = (p.items || []).reduce((n, it) => n + (itemIdOf(it) === 'fusion_cell' ? unitsOf(it) : 0), 0);
  check('staging: holder carries 2 cells in the pack', preCells === 2, 'preCells=' + preCells);
  check('staging: a fusion_cell is worn as gear', !!wornCellSlot, 'wornSlot=' + wornCellSlot);
  check('staging: searcaster is the equipped ranged weapon',
    p.equipped && p.equipped.ranged && p.equipped.ranged.itemId === 'searcaster',
    JSON.stringify(p.equipped && p.equipped.ranged));
  check('staging: villager worn entry carries no units field (the defect site)',
    !(p.equipped[wornCellSlot] && ('units' in p.equipped[wornCellSlot])),
    JSON.stringify(p.equipped[wornCellSlot]));
  const preWorn = {};
  for (const sl of Object.keys(p.equipped || {})) preWorn[sl] = p.equipped[sl] && p.equipped[sl].itemId;

  // ---- succession ----
  const oldScholar = Game.villagerId;
  let mantOk = false;
  try { mantOk = Game.mantleBecome(oldScholar, vid); } catch (e) { console.log('mantleBecome error: ' + e.message); }
  check('mantleBecome returns true', mantOk === true, 'mantOk=' + mantOk);

  // ---- the fix: the stack survives intact ----
  const s = Game.state.scholar;
  const cellSlot = scholarWornSlot(Game, 'fusion_cell');
  check('mantle: the worn cell stays worn in the same slot',
    cellSlot === wornCellSlot, 'before=' + wornCellSlot + ' after=' + cellSlot);
  check('mantle: the worn cell carries units:2 (the stack survives)',
    !!cellSlot && s.equipped[cellSlot] && s.equipped[cellSlot].units === 2,
    'equipped=' + JSON.stringify(s.equipped[cellSlot]));
  const sc = scholarCells(Game);
  check('mantle: scholar cell total is 2 (0 lost)', sc.total === 2,
    'inv=' + sc.inv + ' worn=' + sc.worn + ' total=' + sc.total);
  check('mantle: scholar inventory holds no cells (they rode in the worn slot)',
    sc.inv === 0, 'cellsInv=' + sc.inv);

  // ---- no other worn-copy behavior changes ----
  check('mantle: gun lands in scholar.equipped.ranged',
    s.equipped.ranged && s.equipped.ranged.itemId === 'searcaster',
    'ranged=' + JSON.stringify(s.equipped.ranged));
  const postWorn = {};
  for (const sl of Object.keys(s.equipped || {})) postWorn[sl] = s.equipped[sl] && s.equipped[sl].itemId;
  check('mantle: every worn slot matches the villager\'s worn set, same slots',
    JSON.stringify(postWorn) === JSON.stringify(preWorn),
    'before=' + JSON.stringify(preWorn) + ' after=' + JSON.stringify(postWorn));
  check('mantle: non-stacked worn gear gains no units field (gun stays bare)',
    !(s.equipped.ranged && ('units' in s.equipped.ranged)),
    JSON.stringify(s.equipped.ranged));
  const postHolder = personOf(Game, vid);
  check('mantle: villager record wiped (pack empty, equipped empty)',
    (!postHolder.items || postHolder.items.length === 0) &&
    (!postHolder.equipped || Object.keys(postHolder.equipped).length === 0),
    'items=' + JSON.stringify(postHolder.items) + ' equipped=' + JSON.stringify(postHolder.equipped));

  console.log('WORNSTACK_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('WORNSTACK_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
