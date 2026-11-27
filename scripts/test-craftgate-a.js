#!/usr/bin/env node
// scripts/test-craftgate-a.js — proof test, arm sim-craftgate-a
// (2115Z blank #1: the home-duty craft gate).
//
// Proves the craft-gate instrument (scripts/craftgate-instrument-a.js):
// the pure-read gate replica (away / no-materials / attempt-eligible /
// stocked / cooldown, in duty order), the carried-autoequip weapon read
// (rangedWeaponOf returns null for an unequipped bow — probed live), the
// attempt wrap (cooldown-set => attempted, carried gain => success),
// the pile snapshot read, the daily pile census, and a ledger smoke leg
// (a home-duty batch attributed to its crafter). The driver wraps call
// the originals exactly once and draw no RNG; this test proves the
// helpers those wraps use, on a LIVE loaded village.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the villagers are
// geared wave-4 hunters as the launch leaves them — a bow, a sling, a
// crossbow — not fresh solo scholars.
//
// Usage: node scripts/test-craftgate-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const INST = require('./craftgate-instrument-a');
const { gateSnapshot, pileSnapshot, rangedWeaponRead, ownMatCount } = INST;
const { createAmmoLedger, ammoSnapVid, provShares, ledgerSeed } = require('./aidammo-driver-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return {};
}
function ammoCountOf(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (eid === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  return n;
}
function setMats(Game, mats) {
  try { const st = Game.stashState(); st.materials = Object.assign({}, mats); } catch (e) {}
  try { Game.state.village.stash.materials = Object.assign({}, mats); } catch (e2) {}
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
  try { delete (Game.state.village.away || {})[p.id]; } catch (e) {}
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'craftgate-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  const vid3 = roster[2] || roster[0];
  const p3 = personOf(Game, vid3);
  const day = gday(Game);
  console.log('fighter=' + vid + ' second=' + vid2 + ' third=' + vid3 + ' roster=' + roster.length + ' day=' + day);
  check('instrument loads', typeof INST.install === 'function' && typeof gateSnapshot === 'function');
  check('villagerAmmoCraftDay exists', typeof Game.villagerAmmoCraftDay === 'function');

  // ---- 1. Pure reads: pile snapshot + own-material counting ----
  setMats(Game, { wood: 5, branch: 5, stick: 7, stone: 3, fiber: 2 });
  const pile = pileSnapshot(Game);
  check('pile snapshot reads stick/stone/fiber off v.stash.materials',
    pile.stick === 7 && pile.stone === 3 && pile.fiber === 2, JSON.stringify(pile));
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 },
    { itemId: 'stick', material: 'stick', units: 2 },
    { itemId: 'stone', material: 'stone', units: 1 }];
  check('own-material count follows the duty isMatEntry rule (stick 2, stone 1)',
    ownMatCount(Game, p, 'stick') === 2 && ownMatCount(Game, p, 'stone') === 1 && ownMatCount(Game, p, 'fiber') === 0,
    JSON.stringify({ stick: ownMatCount(Game, p, 'stick'), stone: ownMatCount(Game, p, 'stone'), fiber: ownMatCount(Game, p, 'fiber') }));
  // A weapon item named 'stick' must NOT count as a material.
  p.items.push({ itemId: 'sharpened_stick', name: 'Sharpened stick', units: 1 });
  check('a sharpened_stick weapon does not count as stick material',
    ownMatCount(Game, p, 'stick') === 2, 'got ' + ownMatCount(Game, p, 'stick'));

  // ---- 2. Gate replica: the five states, in duty order ----
  // (a) away carrier -> away / carrier-absent (away beats everything).
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid, true);
  Game.state.village.away = Game.state.village.away || {};
  Game.state.village.away[vid] = true;
  setMats(Game, { stick: 0, stone: 0, fiber: 0 });
  let snap = gateSnapshot(Game, day, true, {});
  let row = snap.rows.find(function (r) { return r.vid === vid; });
  check('away carrier classifies away / carrier-absent',
    !!row && row.state === 'away' && row.cause === 'carrier-absent', JSON.stringify(row));
  delete Game.state.village.away[vid];
  // (b) home, short, empty pile + empty pack -> no-materials.
  snap = gateSnapshot(Game, day, true, {});
  row = snap.rows.find(function (r) { return r.vid === vid; });
  check('home short carrier with an empty pile classifies no-materials / pile-materials-absent',
    !!row && row.state === 'no-materials' && row.cause === 'pile-materials-absent' && row.shortfall.length > 0,
    JSON.stringify(row));
  check('no-materials row names the shortfall material (stick first)',
    !!row && row.shortfall[0] && row.shortfall[0].mat === 'stick' && row.shortfall[0].need === 2,
    JSON.stringify(row && row.shortfall));
  // (c) home, short, materials in the pile -> attempt-eligible.
  setMats(Game, { stick: 20, stone: 20, fiber: 10 });
  snap = gateSnapshot(Game, day, true, {});
  row = snap.rows.find(function (r) { return r.vid === vid; });
  check('home short carrier with materials in the pile classifies attempt-eligible',
    !!row && row.state === 'attempt-eligible' && row.cause === 'attempt', JSON.stringify(row));
  // (d) stocked (5 arrows) -> stocked, not a needing-day.
  p.items.push({ itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 });
  snap = gateSnapshot(Game, day, true, {});
  row = snap.rows.find(function (r) { return r.vid === vid; });
  check('carrier holding a full batch classifies stocked (not needing)',
    !!row && row.state === 'stocked' && row.cause === null, JSON.stringify(row));
  p.items = p.items.filter(function (e) { return (typeof e === 'string' ? e : (e.itemId || e.id)) !== 'arrow'; });
  // (e) cooldown -> cooldown / carrier-present-but-not-crafting.
  Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {};
  Game.state.village.arrowCraftCd[vid] = day;
  snap = gateSnapshot(Game, day, true, {});
  row = snap.rows.find(function (r) { return r.vid === vid; });
  check('carrier within 3d of an attempt classifies cooldown / carrier-present-but-not-crafting',
    !!row && row.state === 'cooldown' && row.cause === 'carrier-present-but-not-crafting', JSON.stringify(row));
  delete Game.state.village.arrowCraftCd[vid];
  // (f) replica is deterministic on unchanged state.
  const s1 = JSON.stringify(gateSnapshot(Game, day, true, {}));
  const s2 = JSON.stringify(gateSnapshot(Game, day, true, {}));
  check('gate replica is deterministic (identical JSON twice)', s1 === s2);
  // (g) spear carrier is not a candidate at all.
  resetVillager(Game, p3);
  p3.items = [{ itemId: 'hunting_spear', name: 'Hunting spear', units: 1, kg: 1.0 }];
  Game.villagerGearUp(vid3, true);
  snap = gateSnapshot(Game, day, true, {});
  const spearRow = snap.rows.find(function (r) { return r.vid === vid3; });
  check('spear carrier gets no gate row (never a candidate)', spearRow === undefined, JSON.stringify(spearRow));

  // ---- 3. Carried-but-unequipped bow: weaponSource + the live duty seats it ----
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  p2.equipped = {};
  const wr = rangedWeaponRead(Game, p2);
  check('carried-but-unequipped bow reads weaponSource carried-autoequip',
    wr.rangedId === 'bow' && wr.ammoId === 'arrow' && wr.weaponSource === 'carried-autoequip', JSON.stringify(wr));
  snap = gateSnapshot(Game, day, true, {});
  row = snap.rows.find(function (r) { return r.vid === vid2; });
  check('carried-autoequip candidate is attempt-eligible with a full pile',
    !!row && row.state === 'attempt-eligible', JSON.stringify(row));
  // Live duty: the duty's autoEquip seats the carried bow and crafts.
  Game.state.village.ammoCraft = Game.state.village.ammoCraft || {};
  Game.state.village.ammoCraft[vid2] = { arrow: 2 }; // learned: 85%
  setMats(Game, { stick: 20, stone: 20, fiber: 10 });
  const savedRandom = Math.random;
  Math.random = () => 0.1; // learned craft succeeds
  let made = null;
  try { made = Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('live duty seats a carried bow and crafts a batch', made >= 1 && ammoCountOf(p2.items, 'arrow') === 5,
    'made=' + made + ' arrows=' + ammoCountOf(p2.items, 'arrow'));

  // ---- 4. Instrument install: attempt rows + gate rows + pile census + ledger smoke ----
  // Stage the second fighter BEFORE install so the ledger seed sees them.
  resetVillager(Game, p3);
  p3.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 }];
  Game.villagerGearUp(vid3, true);
  Game.state.village.ammoCraft[vid3] = { arrow: 2 };
  setMats(Game, { stick: 20, stone: 20, fiber: 10 });
  const preInstallDuty = Game.villagerAmmoCraftDay;
  const inst = INST.install(Game);
  check('install returns the collections', Array.isArray(inst.gateDays) && Array.isArray(inst.attempts) && Array.isArray(inst.pileDaily) && Array.isArray(inst.v4encounters));
  // The duty (wrapped) runs: gate rows + an attempt row for vid3.
  Math.random = () => 0.1;
  let made3 = null;
  try { made3 = Game.villagerAmmoCraftDay(); } finally { Math.random = savedRandom; }
  check('wrapped duty still crafts', made3 >= 1, 'made=' + made3);
  const att = inst.attempts.find(function (a) { return a.vid === vid3; });
  check('attempt row recorded (attempted, success, 5 gained, learned)',
    !!att && att.attempted === true && att.success === true && att.unitsGained === 5 && att.blind === false,
    JSON.stringify(att));
  const grow = inst.gateDays.find(function (r) { return r.vid === vid3; });
  check('gate row recorded pre-duty (attempt-eligible for vid3)',
    !!grow && grow.state === 'attempt-eligible', JSON.stringify(grow));
  check('duty-call counter counts the wrapped calls', inst.dutyCalls() >= 1, 'calls=' + inst.dutyCalls());
  // Ledger smoke: the home-duty batch is attributed to its crafter.
  const homeEv = (inst.ammoLedger.events || []).find(function (e) { return e.kind === 'production' && e.source === 'home-duty' && e.vid === vid3; });
  check('ledger attributes the home-duty batch to its crafter (5 arrows)',
    !!homeEv && homeEv.units === 5, JSON.stringify(homeEv));
  // Daily census: pile + carrier counts, end of day.
  inst.daily(Game, gday(Game));
  const census = inst.pileDaily[inst.pileDaily.length - 1];
  check('daily pile census records pile + candidate counts',
    !!census && census.pile.stick >= 0 && (census.candidates | 0) >= 1, JSON.stringify(census));
  check('daily pile census marks the arrow recipe available with a full pile',
    !!census && census.arrowRecipeOk === true, JSON.stringify(census));
  // Ledger seed smoke (aidammo helper, reused): starting-kit attribution.
  const L0 = createAmmoLedger();
  ledgerSeed(L0, Game, 1);
  const sh = provShares(L0, vid3, 'arrow', 'carried');
  check('seeded ledger sees the crafted arrows (seed after the fact)',
    sh.length === 1 && sh[0].units === 5, JSON.stringify(sh));

  // ---- 5. fieldFight wrap smoke: a wave-4 row with origin + provenance ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.7 },
    { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
  Game.villagerGearUp(vid, true);
  // The staged arrows are an unexplained gain to the ledger — the
  // daily reconcile attributes them to 'other' (a known, named
  // source) before the fight, so the encounter row can attribute them.
  inst.daily(Game, gday(Game));
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; }) || (Game.data.monsters || [])[0];
  let rec = null;
  try { rec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  const enc = inst.v4encounters.find(function (r) { return r.vid === vid && r.mid === mdef.id; });
  check('wave-4 fieldFight records an encounter row', !!enc, JSON.stringify(enc && { origin: enc.origin, ammo: enc.ammoAtEntry }));
  check('encounter row carries an origin + lead ammo at entry (5)',
    !!enc && typeof enc.origin === 'string' && enc.ammoAtEntry === 5,
    JSON.stringify(enc && { origin: enc.origin, ammoAtEntry: enc.ammoAtEntry }));
  // The 5 arrows trace to the §3 live-duty craft, seeded as
  // starting-kit at install (the §5 re-stage nets zero against the
  // seeded snapshot) — what matters is that all 5 units attribute
  // to a known source, not which one the staging produced.
  check('encounter row attributes all 5 arrows to a known source',
    !!enc && Array.isArray(enc.ammoProv) && enc.ammoProv.length > 0 &&
    enc.ammoProv.reduce(function (a, s) { return a + (s.units | 0); }, 0) === 5,
    JSON.stringify(enc && enc.ammoProv));
  inst.uninstall();
  check('uninstall restores the original duty', Game.villagerAmmoCraftDay === preInstallDuty);

  console.log('CRAFTGATE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('CRAFTGATE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
