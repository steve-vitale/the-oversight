#!/usr/bin/env node
// scripts/test-lend-a.js — proof test, arm sim-lend-a
// (finding #2599: the LEND — the gun to the fighters already
// going). The lever, env-gated LEND=1; unset = the old fight,
// byte-identical:
// (a) _lendSearcaster: at a wave-4+ fight launch inside
//     resolveWildMonsterEncounter, when the picked lead is
//     unarmed-or-empty and a living armed searcaster holder
//     stands in earshot (the monster's tile or an adjacent tile)
//     but is NOT the lead, the holder LENDS the gun (shape (a):
//     lead has no searcaster) or just its cells (shape (b): lead
//     carries an empty searcaster) for that one fight. Cells travel
//     with the gun; the borrower's own cells are never moved.
//     Lender pick: roster order, on-tile first, then adjacent.
//     Zero Math.random() draws (asserted on every direct call);
// (b) _returnLentSearcaster: the gun comes home after the fight
//     — gun entry + unspent lent cells return to a living lender
//     by entry-object identity; the borrower re-equips their own
//     bow and the lender re-seats the gun; a dead borrower still
//     returns the gun to a living lender; a dead lender means the
//     borrower keeps the gun;
// (c) the tick: with LEND=1 the lend fires inside a real
//     resolveWildMonsterEncounter, the lent lead fires an armed
//     wave-4+ volley, and the gun is back with the lender after —
//     while the tick consumes exactly the coin flip + pick draws,
//     LEND on or off (the lend adds zero draws; only the volley's
//     own draws diverge, which is the mechanism);
// (d) LEND-off identity: no lend, no move, the old fight;
// (e) the analyzer --selftest covers the cross-leg judge shapes
//     (GO, NO-GO per bar incl. the separated guardrail and the
//     starvation bar).
//
// The env gate lives in the helper, not the hook: with LEND unset
// the helper returns null and the hook is a no-op (asserted).
// Encounter-gear fixture throughout: a geared villager fighter
// with a party, never a fresh un-geared solo scholar.
//
// Usage: node scripts/test-lend-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf } = require('./lend-driver-a');
const REPO = path.join(__dirname, '..');

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
// Feed Math.random a fixed draw sequence; returns how many draws were consumed.
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setFlag(name, on) { if (on) process.env[name] = '1'; else delete process.env[name]; }
function setLend(on) { setFlag('LEND', on); }
function setCellgate(on) { setFlag('CELLGATE', on); }
function setGunrate(on) { setFlag('GUNRATE', on); }
function loosedCount(rec) {
  return (rec && rec.log || []).filter(function (s) { return /^  loosed/.test(String(s)); }).length;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'lend-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const borrower = roster[0], lender = roster[1], plainB = roster[2], lender2 = roster[3];
  const pBorrower = personOf(Game, borrower), pLender = personOf(Game, lender),
    pB = personOf(Game, plainB), pL2 = personOf(Game, lender2);
  console.log('borrower=' + borrower + ' lender=' + lender + ' roster=' + roster.length);

  // ---- 1. live data agreement ----
  const eulogy = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  const moth = (Game.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));
  check('lend helper exists on Game', typeof Game._lendSearcaster === 'function');
  check('return helper exists on Game', typeof Game._returnLentSearcaster === 'function');
  // Post-revert shape (NO-GO arms leave the lever reverted): when the
  // helpers are absent, the 36 lever-on checks below cannot run — record
  // them as FAIL (same record as the presence/gunrate/cellgate arms: the
  // lever-on assertions fail, the lever-independent ones still pass)
  // instead of crashing on the first direct call.
  const leverMissing = typeof Game._lendSearcaster !== 'function' ||
    typeof Game._returnLentSearcaster !== 'function';
  if (leverMissing) {
    for (let i = 0; i < 36; i++) check('lever-on check ' + (i + 1) + '/36 (lever reverted)', false);
  }

  const MTX = 5, MTY = 5; // monster tile for the direct-helper fixtures
  const m4 = { id: 'eulogy', tx: MTX, ty: MTY };
  const m1 = { id: 'mirrormoth', tx: MTX, ty: MTY };
  function armHolder(p, vid, cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function armBorrowerBow(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 1.0 },
      { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
    Game.villagerGearUp(vid, true);
  }
  function armBorrowerEmptyGun(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    Game.villagerGearUp(vid, true);
  }
  // NOTE: _lendSearcaster(vid, m, mdef, opts) — the 3rd arg is mdef
  // (unused: the wave is read from data.monsters by m.id, like the
  // draft) and the 4th is opts. Direct calls below pass (vid, m, null, opts).
  function setHp(vid, hp) {
    Game.state.village.health = Game.state.village.health || {};
    if (hp === null) delete Game.state.village.health[vid];
    else Game.state.village.health[vid] = hp;
  }
  function placeAll() {
    Game.npcSetNode(borrower, MTX, MTY);
    Game.npcSetNode(lender, MTX, MTY);
    Game.npcSetNode(plainB, MTX, MTY);
    Game.npcSetNode(lender2, MTX, MTY);
  }

  if (!leverMissing) {
  // ---- 2. direct-helper fixtures (zero draws) ----
  setLend(true);
  // (a) gun lend, on-tile holder: borrower has a bow, lender armed on the tile.
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  resetVillager(Game, pB); resetVillager(Game, pL2);
  placeAll();
  let r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (a): gun lend fires on-tile, kind gun, 0 draws',
    r.out && r.out.kind === 'gun' && r.out.lender === lender && r.out.from === 'tile' && r.used === 0,
    JSON.stringify(r.out && { kind: r.out.kind, lender: r.out.lender, from: r.out.from }) + ' draws=' + r.used);
  check('lend (a): the gun + cells moved to the borrower',
    rangedKitOf(Game, pBorrower).rwId === 'searcaster' && ammoCountOf(pBorrower.items, 'fusion_cell') === 2,
    JSON.stringify(rangedKitOf(Game, pBorrower)) + ' cells=' + ammoCountOf(pBorrower.items, 'fusion_cell'));
  check('lend (a): the lender is disarmed (no searcaster, no cells)',
    rangedKitOf(Game, pLender).rwId !== 'searcaster' && ammoCountOf(pLender.items, 'fusion_cell') === 0,
    JSON.stringify(rangedKitOf(Game, pLender)) + ' cells=' + ammoCountOf(pLender.items, 'fusion_cell'));
  // (a2) the return brings the gun + cells home; the borrower re-equips the bow.
  let rr = withDraws([0.5], function () { return Game._returnLentSearcaster(r.out); });
  check('return (a): gun + cells return, 0 draws',
    rr.out && rr.out.gunReturned === true && rr.out.cellsReturned === 2 && rr.used === 0,
    JSON.stringify(rr.out) + ' draws=' + rr.used);
  check('return (a): the borrower re-equips their own bow',
    rangedKitOf(Game, pBorrower).rwId === 'crude_bow', JSON.stringify(rangedKitOf(Game, pBorrower)));
  check('return (a): the lender re-seats the gun + cells',
    rangedKitOf(Game, pLender).rwId === 'searcaster' && ammoCountOf(pLender.items, 'fusion_cell') === 2,
    JSON.stringify(rangedKitOf(Game, pLender)) + ' cells=' + ammoCountOf(pLender.items, 'fusion_cell'));
  // (b) gun lend, adjacent holder (earshot): lender one tile over still lends.
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  Game.npcSetNode(lender, MTX + 1, MTY);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (b): gun lend fires from an adjacent tile, 0 draws',
    r.out && r.out.kind === 'gun' && r.out.lender === lender && r.out.from === 'adjacent' && r.used === 0,
    JSON.stringify(r.out && { kind: r.out.kind, from: r.out.from }) + ' draws=' + r.used);
  rr = withDraws([0.5], function () { return Game._returnLentSearcaster(r.out); });
  check('return (b): adjacent lend returns cleanly',
    rr.out && rr.out.gunReturned === true && rr.out.cellsReturned === 2 && rr.used === 0,
    JSON.stringify(rr.out) + ' draws=' + rr.used);
  Game.npcSetNode(lender, MTX, MTY);
  // (c) cell lend: the borrower already carries an EMPTY searcaster.
  armBorrowerEmptyGun(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (c): cell lend to an empty-gun lead, kind cells, 0 draws',
    r.out && r.out.kind === 'cells' && r.out.lender === lender && r.out.gunEntry === null && r.used === 0,
    JSON.stringify(r.out && { kind: r.out.kind, gun: r.out.gunEntry }) + ' draws=' + r.used);
  check('lend (c): the gun stays with the lender, the cells move',
    rangedKitOf(Game, pLender).rwId === 'searcaster' && ammoCountOf(pLender.items, 'fusion_cell') === 0 &&
    ammoCountOf(pBorrower.items, 'fusion_cell') === 2,
    'lenderKit=' + JSON.stringify(rangedKitOf(Game, pLender)) + ' borrowerCells=' + ammoCountOf(pBorrower.items, 'fusion_cell'));
  rr = withDraws([0.5], function () { return Game._returnLentSearcaster(r.out); });
  check('return (c): lent cells return, lender keeps the gun throughout',
    rr.out && rr.out.gunReturned === false && rr.out.cellsReturned === 2 &&
    rangedKitOf(Game, pLender).rwId === 'searcaster' && ammoCountOf(pLender.items, 'fusion_cell') === 2 &&
    ammoCountOf(pBorrower.items, 'fusion_cell') === 0 && rr.used === 0,
    JSON.stringify(rr.out) + ' draws=' + rr.used);
  // (d) no armed holder anywhere near: null.
  armBorrowerBow(pBorrower, borrower);
  resetVillager(Game, pLender);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (d): no armed holder -> null (old fight stands)', r.out === null && r.used === 0,
    'lend=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (e) a cell-less holder is not armed: null.
  armHolder(pLender, lender, 0);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (e): 0-cell holder -> null', r.out === null && r.used === 0,
    'lend=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (f) a badly hurt holder (HP <= 20) does not lend: null.
  armHolder(pLender, lender, 2);
  setHp(lender, 15);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (f): HP-15 holder -> null', r.out === null && r.used === 0,
    'lend=' + JSON.stringify(r.out) + ' draws=' + r.used);
  setHp(lender, null);
  // (g) below wave 4 the lend never fires: null.
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m1, null, {}); });
  check('lend (g): wave-1 beast -> null', r.out === null && r.used === 0,
    'lend=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (h) raids never lend: null.
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, { raid: true }); });
  check('lend (h): raid -> null', r.out === null && r.used === 0,
    'lend=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (i) a borrower who already carries a LOADED searcaster needs nothing: null.
  armHolder(pBorrower, borrower, 2);
  armHolder(pLender, lender, 2);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (i): loaded borrower -> null', r.out === null && r.used === 0,
    'lend=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (j) the env gate lives in the helper: with LEND unset the helper returns null.
  setLend(false);
  armBorrowerBow(pBorrower, borrower);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (j): LEND unset -> null (gate lives in the helper)', r.out === null && r.used === 0,
    'lend=' + JSON.stringify(r.out) + ' draws=' + r.used);
  setLend(true);
  // (l) borrower-dead return: the gun still comes home to a living lender.
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (l): setup lend fires for the dead-borrower return', r.out && r.out.kind === 'gun',
    JSON.stringify(r.out && r.out.kind));
  pBorrower.dead = true;
  rr = withDraws([0.5], function () { return Game._returnLentSearcaster(r.out); });
  check('return (l): dead borrower -> gun + cells return to the living lender',
    rr.out && rr.out.gunReturned === true && rr.out.cellsReturned === 2 && rr.out.borrowerAlive === false &&
    rangedKitOf(Game, pLender).rwId === 'searcaster' && rr.used === 0,
    JSON.stringify(rr.out) + ' draws=' + rr.used);
  pBorrower.dead = false;
  // (m) lender-dead return: the borrower keeps the gun.
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  r = withDraws([0.5], function () { return Game._lendSearcaster(borrower, m4, null, {}); });
  check('lend (m): setup lend fires for the dead-lender return', r.out && r.out.kind === 'gun',
    JSON.stringify(r.out && r.out.kind));
  pLender.dead = true;
  rr = withDraws([0.5], function () { return Game._returnLentSearcaster(r.out); });
  check('return (m): dead lender -> borrower keeps the gun + cells',
    rr.out && rr.out.gunReturned === false && rr.out.lenderAlive === false &&
    rangedKitOf(Game, pBorrower).rwId === 'searcaster' && ammoCountOf(pBorrower.items, 'fusion_cell') === 2 &&
    rr.used === 0,
    JSON.stringify(rr.out) + ' draws=' + rr.used);
  pLender.dead = false;
  // Restore a clean lend for the tick tests: return the kept gun first.
  rr = withDraws([0.5], function () { return Game._returnLentSearcaster(r.out); });
  check('return (m2): restored — gun home after the lender lives again',
    rr.out && rr.out.gunReturned === true, JSON.stringify(rr.out));

  // ---- 3. tick-level proof ----
  // Monster tile away from the player's tile (the tick skips the
  // player's own tile).
  const px = (Game.map && Game.map.px !== undefined) ? Game.map.px : 4;
  const py = (Game.map && Game.map.py !== undefined) ? Game.map.py : 4;
  const TX = px + 2 <= 8 ? px + 2 : px - 2;
  const TY = py + 2 <= 8 ? py + 2 : py - 2;
  const savedMonsters = Game.state.worldMonsters;
  // (c) draw-neutrality at the tick: with fieldFight stubbed, the
  // tick consumes exactly the coin flip + pick draws, LEND on or off.
  setLend(true); setCellgate(true); setGunrate(true);
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  resetVillager(Game, pB); resetVillager(Game, pL2);
  Game.npcSetNode(borrower, TX, TY);
  Game.npcSetNode(lender, TX + 1, TY); // adjacent: in earshot, not in the pick pool
  Game.npcSetNode(plainB, TX, TY);
  Game.state.worldMonsters = [{ id: 'eulogy', tx: TX, ty: TY }];
  const realFieldFight = Game.fieldFight;
  let stubCalls = 0;
  Game.fieldFight = function (vid, mdef, m, opts) { stubCalls++; return { outcome: 'vFlee', rounds: 3, log: [] }; };
  r = withDraws([0.4, 0.1], function () { Game.villagerMonsterTick(); return stubCalls; });
  check('tick (c): LEND on, stubbed fight — exactly 2 draws (coin + pick), lend adds zero',
    r.out === 1 && r.used === 2, 'calls=' + r.out + ' draws=' + r.used);
  setLend(false);
  stubCalls = 0;
  // The gun is home after the stubbed fight's return (the finally ran).
  check('tick (c2): stubbed fight returned the gun to the lender',
    rangedKitOf(Game, pLender).rwId === 'searcaster' && ammoCountOf(pLender.items, 'fusion_cell') === 2,
    JSON.stringify(rangedKitOf(Game, pLender)) + ' cells=' + ammoCountOf(pLender.items, 'fusion_cell'));
  r = withDraws([0.4, 0.1], function () { Game.villagerMonsterTick(); return stubCalls; });
  check('tick (c3): LEND off, stubbed fight — exactly 2 draws (same as on)',
    r.out === 1 && r.used === 2, 'calls=' + r.out + ' draws=' + r.used);
  check('tick (c4): LEND off — the lender keeps the gun + cells, the borrower keeps the bow',
    rangedKitOf(Game, pLender).rwId === 'searcaster' && ammoCountOf(pLender.items, 'fusion_cell') === 2 &&
    rangedKitOf(Game, pBorrower).rwId === 'crude_bow',
    'lender=' + JSON.stringify(rangedKitOf(Game, pLender)) + ' borrower=' + JSON.stringify(rangedKitOf(Game, pBorrower)));
  // (a) live lent lead fires an armed wave-4+ volley.
  setLend(true);
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 4);
  Game.villagerGearUp(lender, true);
  const kit = rangedKitOf(Game, pLender);
  check('live: lender is geared with the searcaster in the ranged slot',
    kit && kit.rwId === 'searcaster', JSON.stringify(kit));
  Game.npcSetNode(borrower, TX, TY);
  Game.npcSetNode(lender, TX + 1, TY);
  Game.npcSetNode(plainB, TX, TY);
  // The stubbed vFlee fights in (c)/(c3) left BOTH on-tile fighters
  // post-flee resting, so the live tick's pool would be empty and no
  // fight would happen at all (verified: 0 draws consumed). Clear
  // the fixture rest state (test-only; the game never clears it
  // mid-day) so the live fight can happen.
  try { if (Game._postFleeRest) { delete Game._postFleeRest[borrower]; delete Game._postFleeRest[plainB]; delete Game._postFleeRest[lender]; } } catch (e) {}
  Game.state.worldMonsters = [{ id: 'eulogy', tx: TX, ty: TY }];
  let leadVid = null, fightRec = null, atFightKit = null;
  Game.fieldFight = function (vid, mdef, m, opts) {
    leadVid = vid;
    atFightKit = rangedKitOf(Game, personOf(Game, vid));
    fightRec = realFieldFight.call(Game, vid, mdef, m, opts);
    return fightRec;
  };
  const cellsBefore = ammoCountOf(pLender.items, 'fusion_cell');
  r = withDraws([0.4, 0.1, 0.7, 0.2, 0.6, 0.3, 0.8, 0.15, 0.55, 0.25],
    function () { Game.villagerMonsterTick(); return { lead: leadVid, rec: fightRec, kit: atFightKit }; });
  check('live: the tick picks the borrower as lead of the real fight',
    r.out && r.out.lead === borrower, 'lead=' + (r.out && r.out.lead) + ' want=' + borrower);
  check('live: at fight time the borrower holds the lent searcaster',
    r.out && r.out.kit && r.out.kit.rwId === 'searcaster', JSON.stringify(r.out && r.out.kit));
  check('live: lent lead fires an armed wave-4 volley (shots > 0)',
    r.out && r.out.rec && r.out.rec.volley && r.out.rec.volley.shots > 0,
    JSON.stringify(r.out && r.out.rec && r.out.rec.volley));
  check('live: volley spends exactly its loosed shots in cells (lender gets the remainder back)',
    r.out && r.out.rec && r.out.rec.volley && loosedCount(r.out.rec) > 0 &&
    ammoCountOf(pLender.items, 'fusion_cell') === cellsBefore - loosedCount(r.out.rec) &&
    ammoCountOf(pBorrower.items, 'fusion_cell') === 0,
    'cellsBefore=' + cellsBefore + ' lenderLeft=' + ammoCountOf(pLender.items, 'fusion_cell') +
    ' borrowerLeft=' + ammoCountOf(pBorrower.items, 'fusion_cell') +
    ' loosed=' + (r.out && r.out.rec && loosedCount(r.out.rec)));
  check('live: volley hits land in the searcaster band (64-68 per hit)',
    r.out && r.out.rec && r.out.rec.volley && r.out.rec.volley.hits > 0 &&
    r.out.rec.volley.dmg >= 64 * r.out.rec.volley.hits &&
    r.out.rec.volley.dmg <= 68 * r.out.rec.volley.hits,
    JSON.stringify(r.out && r.out.rec && r.out.rec.volley));
  check('live: the lend line opens the fight record',
    r.out && r.out.rec && r.out.rec.log && /presses the Searcaster into/.test(String(r.out.rec.log[0])),
    JSON.stringify((r.out && r.out.rec && r.out.rec.log && r.out.rec.log[0]) || null));
  check('live: the return line closes the fight record',
    r.out && r.out.rec && r.out.rec.log && /hands the Searcaster back to/.test(String(r.out.rec.log[r.out.rec.log.length - 1])),
    JSON.stringify((r.out && r.out.rec && r.out.rec.log && r.out.rec.log[r.out.rec.log.length - 1]) || null));
  check('live: after the fight the gun is home and the borrower has the bow again',
    rangedKitOf(Game, pLender).rwId === 'searcaster' && rangedKitOf(Game, pBorrower).rwId === 'crude_bow',
    'lender=' + JSON.stringify(rangedKitOf(Game, pLender)) + ' borrower=' + JSON.stringify(rangedKitOf(Game, pBorrower)));
  Game.fieldFight = realFieldFight;
  Game.state.worldMonsters = savedMonsters;
  setLend(false); setCellgate(false); setGunrate(false);
  } // end if (!leverMissing) — lever-on sections 2–3

  // ---- 4. analyzer selftest (cross-leg judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-lend-a --selftest) ===');
  let anaSelf = null, anaCount = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-lend-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    const m = /(\d+) passed, 0 failed/.exec(anaOut);
    anaCount = m ? parseInt(m[1], 10) : null;
    anaSelf = anaCount != null && anaCount >= 40;
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (>= 40 passed, 0 failed — incl. the GO / NO-GO-per-bar judge)', anaSelf === true, anaCount === null ? 'no output' : 'passed=' + anaCount);

  console.log('LEND_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('LEND_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
