#!/usr/bin/env node
// scripts/test-cellgate-a.js — proof test, arm sim-cellgate-a
// (finding #2599: CELL SUPPLY PER GUN — the wave-gated searcaster
// volley). The lever, env-gated CELLGATE=1; unset = the old volley,
// byte-identical:
// (a) a searcaster lead holds fire below wave 4 — 0 shots, 0 cells
//     spent, an honest hold line in the log — so the bundle's two
//     cells survive the first low-wave fight;
// (b) the same fixture with CELLGATE unset FIRES below wave 4
//     (control-leg identity: the gate is a no-op when off);
// (c) a searcaster lead fires at wave 4+ with CELLGATE=1 exactly
//     as before (shots > 0, cells spent per shot);
// (d) other weapons are untouched by the gate at any wave (a bow
//     volleys below wave 4 with CELLGATE=1);
// (e) a cell-less searcaster still says "no fusion cells" below
//     wave 4 with CELLGATE=1 — the hold needs cells to save, so the
//     honest no-ammo line (not the hold line) is what an empty gun
//     says.
//
// The SUBSTRATE (gun weight / redirect / bundle) is proven by
// scripts/test-gunrate-a.js, run unmodified against the rebuild
// (39/39). This test proves ONLY the gate. The encounter-gear
// fixture (a geared villager fighter with a party — never a fresh
// un-geared solo scholar) is shared with the gunrate test.
//
// Usage: node scripts/test-cellgate-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf } = require('./gunrate-driver-a');

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
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
function setCellgate(on) { if (on) process.env.CELLGATE = '1'; else delete process.env.CELLGATE; }

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'cellgate-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  console.log('fighter=' + vid + ' roster=' + roster.length);

  const moth = (Game.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  const eulogy = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));

  function armSearcaster(cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }

  // ---- (a) the gate holds fire below wave 4 ----
  setCellgate(true);
  armSearcaster(2);
  let recH = null;
  try { recH = Game.fieldFight(vid, moth, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate holds the volley below wave 4 (0 shots, CELLGATE=1)',
    recH && recH.volley && recH.volley.shots === 0, JSON.stringify(recH && recH.volley));
  check('gate keeps both cells (ammoLeft 2, pack still holds 2)',
    recH && recH.volley && recH.volley.ammoLeft === 2 && ammoCountOf(p.items, 'fusion_cell') === 2,
    'ammoLeft=' + (recH && recH.volley && recH.volley.ammoLeft) + ' cells=' + ammoCountOf(p.items, 'fusion_cell'));
  check('gate narrates the hold honestly',
    recH && (recH.log || []).some(function (s) { return /holds the Searcaster/i.test(String(s)); }),
    JSON.stringify((recH && recH.log) || []));

  // (The volley record reports PLANNED shots: if the monster dies
  // on hit 1 the loop breaks after one loosed shot, so the honest
  // spend check counts loosed lines in the log, not rec.volley.shots.)
  function loosedCount(rec) {
    return (rec && rec.log || []).filter(function (s) { return /^  loosed/.test(String(s)); }).length;
  }
  // ---- (b) control identity: the low-wave volley fires with CELLGATE unset ----
  setCellgate(false);
  armSearcaster(2);
  let recB = null;
  try { recB = Game.fieldFight(vid, moth, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('control (CELLGATE unset): low-wave searcaster volley fires',
    recB && recB.volley && recB.volley.shots > 0, JSON.stringify(recB && recB.volley));
  check('control: the burn spends exactly its loosed shots in cells',
    recB && recB.volley && loosedCount(recB) > 0 && ammoCountOf(p.items, 'fusion_cell') === 2 - loosedCount(recB),
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' loosed=' + loosedCount(recB) + ' planned=' + (recB && recB.volley && recB.volley.shots));

  // ---- (c) the gate fires at wave 4+ ----
  setCellgate(true);
  armSearcaster(2);
  let recW = null;
  try { recW = Game.fieldFight(vid, eulogy, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate fires at wave 4+ (shots > 0, CELLGATE=1)',
    recW && recW.volley && recW.volley.shots > 0, JSON.stringify(recW && recW.volley));
  check('gate wave-4+ volley spends exactly its loosed shots in cells',
    recW && recW.volley && loosedCount(recW) > 0 && ammoCountOf(p.items, 'fusion_cell') === 2 - loosedCount(recW),
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' loosed=' + loosedCount(recW) + ' planned=' + (recW && recW.volley && recW.volley.shots));

  // ---- (d) a bow is untouched by the gate at any wave ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 1.0 },
    { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
  Game.villagerGearUp(vid, true);
  let recBow = null;
  try { recBow = Game.fieldFight(vid, moth, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('bow volleys below wave 4 with CELLGATE=1 (gate is searcaster-only)',
    recBow && recBow.volley && recBow.volley.shots > 0, JSON.stringify(recBow && recBow.volley));

  // ---- (e) a cell-less searcaster still says "no fusion cells" ----
  armSearcaster(0);
  let rec0 = null;
  try { rec0 = Game.fieldFight(vid, moth, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('0-cell searcaster volleys 0 shots below wave 4 (CELLGATE=1)',
    rec0 && rec0.volley && rec0.volley.shots === 0, JSON.stringify(rec0 && rec0.volley));
  check('0-cell volley names fusion cells (not the hold line)',
    rec0 && (rec0.log || []).some(function (s) { return /no fusion cells/i.test(String(s)); }) &&
    !(rec0.log || []).some(function (s) { return /holds the Searcaster/i.test(String(s)); }),
    JSON.stringify((rec0 && rec0.log) || []));
  setCellgate(false);

  console.log('CELLGATE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('CELLGATE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
