#!/usr/bin/env node
// scripts/test-presence-a.js — proof test, arm sim-presence-a
// (finding #2599 presence-side: the armed searcaster holder must
// ENTER wave-4+ fights, or the gun must reach the fighters going).
// The lever, env-gated PRESENCE=1; unset = the old pick,
// byte-identical:
// (a) _presenceDraftLead: when a wave-4+ beast arrives, a living
//     armed searcaster holder on the monster's tile — or an adjacent
//     tile (earshot, Chebyshev <= 1) — leads instead of the village
//     drawing lots. On-tile beats adjacent; roster order breaks
//     ties. Armed = roster villager (never the scholar), searcaster
//     in the equipped ranged slot, >= 1 fusion cell, HP > 20, not
//     sheltered, not post-flee resting. Zero Math.random() draws
//     (asserted on every direct call);
// (b) villagerMonsterTick: with PRESENCE=1 the draft runs BEFORE
//     the pick, and when it fires the pick's ONE draw is skipped —
//     that skipped draw is the mechanism, disclosed in the prereg.
//     Off-leg the pick is consumed exactly as before (2 draws per
//     tick: coin flip + pick). The 0.5 coin flip still gates the
//     tick on both legs;
// (c) the live drafted lead FIRES an armed wave-4+ volley with
//     CELLGATE=1 (shots > 0, cells spent per loosed shot, hits in
//     the 64-68 band) — the holder does not just lead, the gun
//     speaks. Encounter-gear fixture throughout: a geared villager
//     fighter with a party, never a fresh un-geared solo scholar;
// (d) the analyzer --selftest covers the cross-leg judge shapes
//     (GO, NO-GO per bar incl. the 1.00x guardrail and the
//     starvation bar).
//
// The env gate lives in the tick, not the helper: direct helper
// calls return the holder with PRESENCE unset too (asserted), so a
// failure of the gate shows up at tick level, where it matters.
//
// Usage: node scripts/test-presence-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf } = require('./presence-driver-a');
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
function setPresence(on) { setFlag('PRESENCE', on); }
function setCellgate(on) { setFlag('CELLGATE', on); }
function setGunrate(on) { setFlag('GUNRATE', on); }
function loosedCount(rec) {
  return (rec && rec.log || []).filter(function (s) { return /^  loosed/.test(String(s)); }).length;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'presence-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const plainA = roster[0], holder = roster[1], plainB = roster[2], holder2 = roster[3];
  const pHolder = personOf(Game, holder), pA = personOf(Game, plainA),
    pB = personOf(Game, plainB), pH2 = personOf(Game, holder2);
  console.log('fighter=' + holder + ' roster=' + roster.length);

  // ---- 1. live data agreement ----
  const eulogy = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  const moth = (Game.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));
  check('draft helper exists on Game', typeof Game._presenceDraftLead === 'function');

  const MTX = 5, MTY = 5; // monster tile for the direct-helper fixtures
  const m4 = { id: 'eulogy', tx: MTX, ty: MTY };
  const m1 = { id: 'mirrormoth', tx: MTX, ty: MTY };
  function armHolder(p, vid, cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function draft(npcIds, m) {
    if (typeof Game._presenceDraftLead !== 'function') return null;
    return Game._presenceDraftLead(npcIds, m);
  }
  function setHp(vid, hp) {
    Game.state.village.health = Game.state.village.health || {};
    if (hp === null) delete Game.state.village.health[vid];
    else Game.state.village.health[vid] = hp;
  }

  // ---- 2. draft-helper fixtures (direct calls, zero draws) ----
  setPresence(true);
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pA); resetVillager(Game, pB); resetVillager(Game, pH2);
  Game.npcSetNode(plainA, MTX, MTY);
  Game.npcSetNode(holder, MTX, MTY);
  Game.npcSetNode(plainB, MTX, MTY);
  const onTile = [plainA, holder, plainB];
  let r = withDraws([0.5], function () { return draft(onTile, m4); });
  check('draft (a): armed holder on the monster tile leads', r.out === holder && r.used === 0,
    'draft=' + r.out + ' want=' + holder + ' draws=' + r.used);
  // (b) adjacent tile (earshot): holder one tile over still leads.
  Game.npcSetNode(holder, MTX + 1, MTY);
  r = withDraws([0.5], function () { return draft([plainA, plainB], m4); });
  check('draft (b): armed holder on an adjacent tile leads', r.out === holder && r.used === 0,
    'draft=' + r.out + ' want=' + holder + ' draws=' + r.used);
  // (c) on-tile beats adjacent: a second armed holder adjacent loses to the on-tile holder.
  armHolder(pH2, holder2, 2);
  Game.npcSetNode(holder, MTX, MTY);
  Game.npcSetNode(holder2, MTX + 1, MTY);
  r = withDraws([0.5], function () { return draft(onTile, m4); });
  check('draft (c): on-tile holder beats an adjacent holder', r.out === holder && r.used === 0,
    'draft=' + r.out + ' want=' + holder + ' draws=' + r.used);
  resetVillager(Game, pH2);
  Game.npcSetNode(holder2, MTX, MTY);
  // (d) no armed holder anywhere near: null.
  resetVillager(Game, pHolder);
  r = withDraws([0.5], function () { return draft(onTile, m4); });
  check('draft (d): no armed holder -> null (old pick stands)', r.out === null && r.used === 0,
    'draft=' + r.out + ' draws=' + r.used);
  // (e) a cell-less holder is not armed: null.
  armHolder(pHolder, holder, 0);
  r = withDraws([0.5], function () { return draft(onTile, m4); });
  check('draft (e): 0-cell holder -> null', r.out === null && r.used === 0,
    'draft=' + r.out + ' draws=' + r.used);
  // (f) a badly hurt holder (HP <= 20) does not step forward: null.
  armHolder(pHolder, holder, 2);
  setHp(holder, 15);
  r = withDraws([0.5], function () { return draft(onTile, m4); });
  check('draft (f): HP-15 holder -> null', r.out === null && r.used === 0,
    'draft=' + r.out + ' draws=' + r.used);
  setHp(holder, null);
  // (g) below wave 4 the draft never fires: null.
  r = withDraws([0.5], function () { return draft(onTile, m1); });
  check('draft (g): wave-1 beast -> null', r.out === null && r.used === 0,
    'draft=' + r.out + ' draws=' + r.used);
  // (h) the env gate lives in the tick, not the helper: with
  // PRESENCE unset the helper still reads the holder (the tick
  // proves the gate below).
  setPresence(false);
  r = withDraws([0.5], function () { return draft(onTile, m4); });
  check('draft (h): helper is env-independent (gate lives in the tick)', r.out === holder && r.used === 0,
    'draft=' + r.out + ' want=' + holder + ' draws=' + r.used);
  setPresence(true);

  // ---- 3. tick-level proof: draft before pick, pick draw skipped ----
  // Monster tile away from the player's tile (the tick skips the
  // player's own tile).
  const px = (Game.map && Game.map.px !== undefined) ? Game.map.px : 4;
  const py = (Game.map && Game.map.py !== undefined) ? Game.map.py : 4;
  const TX = px + 2 <= 8 ? px + 2 : px - 2;
  const TY = py + 2 <= 8 ? py + 2 : py - 2;
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pA); resetVillager(Game, pB);
  Game.npcSetNode(plainA, TX, TY);
  Game.npcSetNode(holder, TX, TY);
  Game.npcSetNode(plainB, TX, TY);
  const savedMonsters = Game.state.worldMonsters;
  Game.state.worldMonsters = [{ id: 'eulogy', tx: TX, ty: TY }];
  let captured = null;
  const realResolve = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m) { captured = { vid: vid, mid: m && m.id }; return { ok: true }; };
  // PRESENCE on: coin flip passes (0.4), pick draw would take
  // roster slot 0 (0.1 * 3 -> plainA) — but the draft fires first,
  // so the pick draw is never consumed and the holder leads.
  setPresence(true);
  captured = null;
  r = withDraws([0.4, 0.1], function () { Game.villagerMonsterTick(); return captured; });
  check('tick (a): PRESENCE on, draft fires — holder leads, 1 draw (pick skipped)',
    r.out && r.out.vid === holder && r.used === 1,
    'lead=' + (r.out && r.out.vid) + ' want=' + holder + ' draws=' + r.used);
  // PRESENCE unset: the same draws take the pick — plainA leads, 2 draws.
  setPresence(false);
  captured = null;
  r = withDraws([0.4, 0.1], function () { Game.villagerMonsterTick(); return captured; });
  check('tick (b): PRESENCE off, pick consumed — plainA leads, 2 draws',
    r.out && r.out.vid === plainA && r.used === 2,
    'lead=' + (r.out && r.out.vid) + ' want=' + plainA + ' draws=' + r.used);
  // The coin flip still gates the tick: 0.9 ends it before any pick.
  setPresence(true);
  captured = null;
  r = withDraws([0.9, 0.1], function () { Game.villagerMonsterTick(); return captured; });
  check('tick (c): coin flip fails — no encounter, 1 draw',
    r.out === null && r.used === 1, 'captured=' + JSON.stringify(r.out) + ' draws=' + r.used);
  Game.resolveWildMonsterEncounter = realResolve;
  Game.state.worldMonsters = savedMonsters;

  // ---- 4. live drafted lead fires an armed wave-4+ volley ----
  setPresence(true); setCellgate(true); setGunrate(true);
  armHolder(pHolder, holder, 4);
  Game.villagerGearUp(holder, true);
  const kit = rangedKitOf(Game, pHolder);
  check('live: holder is geared with the searcaster in the ranged slot',
    kit && kit.rwId === 'searcaster', JSON.stringify(kit));
  resetVillager(Game, pA); resetVillager(Game, pB);
  Game.npcSetNode(plainA, TX, TY);
  Game.npcSetNode(holder, TX, TY);
  Game.npcSetNode(plainB, TX, TY);
  Game.state.worldMonsters = [{ id: 'eulogy', tx: TX, ty: TY }];
  const realFieldFight = Game.fieldFight;
  let leadVid = null, fightRec = null;
  Game.fieldFight = function (vid, mdef, m, opts) {
    leadVid = vid;
    fightRec = realFieldFight.call(Game, vid, mdef, m, opts);
    return fightRec;
  };
  const cellsBefore = ammoCountOf(pHolder.items, 'fusion_cell');
  r = withDraws([0.4, 0.1, 0.7, 0.2, 0.6, 0.3, 0.8, 0.15, 0.55, 0.25],
    function () { Game.villagerMonsterTick(); return { lead: leadVid, rec: fightRec }; });
  check('live: the tick drafts the holder as lead of the real fight',
    r.out && r.out.lead === holder, 'lead=' + (r.out && r.out.lead) + ' want=' + holder);
  check('live: drafted lead fires an armed wave-4 volley (shots > 0)',
    r.out && r.out.rec && r.out.rec.volley && r.out.rec.volley.shots > 0,
    JSON.stringify(r.out && r.out.rec && r.out.rec.volley));
  check('live: volley spends exactly its loosed shots in cells',
    r.out && r.out.rec && r.out.rec.volley && loosedCount(r.out.rec) > 0 &&
    ammoCountOf(pHolder.items, 'fusion_cell') === cellsBefore - loosedCount(r.out.rec),
    'cellsBefore=' + cellsBefore + ' left=' + ammoCountOf(pHolder.items, 'fusion_cell') +
    ' loosed=' + (r.out && r.out.rec && loosedCount(r.out.rec)));
  check('live: volley hits land in the searcaster band (64-68 per hit)',
    r.out && r.out.rec && r.out.rec.volley && r.out.rec.volley.hits > 0 &&
    r.out.rec.volley.dmg >= 64 * r.out.rec.volley.hits &&
    r.out.rec.volley.dmg <= 68 * r.out.rec.volley.hits,
    JSON.stringify(r.out && r.out.rec && r.out.rec.volley));
  Game.fieldFight = realFieldFight;
  Game.state.worldMonsters = savedMonsters;
  setPresence(false); setCellgate(false); setGunrate(false);

  // ---- 5. analyzer selftest (cross-leg judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-presence-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-presence-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /47 passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (47 passed, 0 failed — incl. the GO / NO-GO-per-bar judge)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  console.log('PRESENCE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('PRESENCE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
