#!/usr/bin/env node
// scripts/test-shelterdraft-a.js — proof test, arm sim-shelterdraft-a
// (finding #2599 presence-side: the sheltered holder must be
// DRAFTED into wave-4+ fights, or the gun waits in the hall while
// unarmed neighbours die in front of it).
// The lever, env-gated SHELTERDRAFT=1; unset = the old pick,
// byte-identical:
// (a) _shelterDraftLead(m, leadVid): when a wave-4+ beast arrives,
//     a living armed searcaster holder SHELTERING in the hall on the
//     monster's tile — or an adjacent tile (earshot, Chebyshev <= 1)
//     — leads instead of the picked unarmed lead. On-tile beats
//     adjacent; roster order breaks ties. Armed = roster villager
//     (never the scholar), searcaster in the equipped ranged slot,
//     >= 1 fusion cell, HP > 20, sheltered, not post-flee resting.
//     An UNSHELTERED holder is refused outright (presence's
//     territory). Zero Math.random() draws (asserted on every
//     direct call); returns { vid, fired, holder, reason, dist };
// (b) villagerMonsterTick: with SHELTERDRAFT=1 the draft runs AFTER
//     the pick, and when it fires the lead swaps — the pick's ONE
//     draw is consumed exactly as before on both legs (2 draws per
//     tick: coin flip + pick). The 0.5 coin flip still gates the
//     tick on both legs. The tick passes opts.shelterDraft into
//     resolveWildMonsterEncounter, which unshifts the call-out line
//     onto rec.log next to the lend lines;
// (c) the live drafted lead FIRES an armed wave-4+ volley with
//     CELLGATE=1 (shots > 0, cells spent per loosed shot, hits in
//     the 64–68 band) and the call-out line heads the fight log —
//     the holder does not just lead, the gun speaks. Encounter-gear
//     fixture throughout: a geared villager fighter with a party,
//     never a fresh un-geared solo scholar;
// (d) the analyzer --selftest covers the cross-leg judge shapes
//     (GO, NO-GO per bar incl. the fire-rate floor and the
//     starvation / median guardrails).
//
// The env gate lives in the tick, not the helper: direct helper
// calls return the holder with SHELTERDRAFT unset too (asserted),
// so a failure of the gate shows up at tick level, where it matters.
//
// Usage: node scripts/test-shelterdraft-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf } = require('./shelterdraft-driver-a');
const analyze = require('./analyze-shelterdraft-a.js');
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
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setFlag(name, on) { if (on) process.env[name] = '1'; else delete process.env[name]; }
function setShelterdraft(on) { setFlag('SHELTERDRAFT', on); }
function setCellgate(on) { setFlag('CELLGATE', on); }
function setGunrate(on) { setFlag('GUNRATE', on); }
function loosedCount(rec) {
  return (rec && rec.log || []).filter(function (s) { return /^  loosed/.test(String(s)); }).length;
}
function setHp(Game, vid, hp) {
  Game.state.village.health = Game.state.village.health || {};
  if (hp === null) delete Game.state.village.health[vid];
  else Game.state.village.health[vid] = hp;
}
function havenOf(Game) {
  const v = Game.state.village || {};
  return { hx: (v.px != null ? v.px : 4), hy: (v.py != null ? v.py : 4) };
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'shelterdraft-unit' });
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
  check('draft helper exists on Game', typeof Game._shelterDraftLead === 'function');

  const hv = havenOf(Game);
  const MTX = hv.hx, MTY = hv.hy; // monster tile = Haven: a sheltered holder stands ON it
  const m4 = { id: 'eulogy', tx: MTX, ty: MTY };
  const m4adj = { id: 'eulogy', tx: MTX + 1, ty: MTY + 1 }; // adjacent to Haven
  const m1 = { id: 'mirrormoth', tx: MTX, ty: MTY };
  function armHolder(p, vid, cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function armLeadBow(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 1.0 },
      { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
    Game.villagerGearUp(vid, true);
  }
  function armLeadEmptyGun(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    Game.villagerGearUp(vid, true);
  }
  function draft(m, leadVid) {
    if (typeof Game._shelterDraftLead !== 'function') return null;
    return Game._shelterDraftLead(m, leadVid);
  }
  function shelter(p, vid) {
    // The real verb: moves the villager to Haven, inside the hall,
    // behind the barricaded door (shelter.js).
    return Game.shelterVillagers([vid], { quiet: true, reason: 'test' });
  }
  function unshelterAll() {
    try {
      const v = Game.state.village || {};
      if (v.sheltered) { for (const k of Object.keys(v.sheltered)) delete v.sheltered[k]; }
    } catch (e) {}
    // (g) marks the holder post-flee resting for the rest of the day;
    // that flag is section state, not fixture state — clear it at the
    // section boundary or every later section reads holder-unusable.
    try { if (Game._postFleeRest) { for (const k of Object.keys(Game._postFleeRest)) delete Game._postFleeRest[k]; } } catch (e) {}
    for (const vid of roster) { try { Game.npcSetInside(vid, false); } catch (e) {} }
  }

  // ---- 2. draft-helper fixtures (direct calls, zero draws) ----
  setShelterdraft(true);
  armLeadBow(pA, plainA);
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pB); resetVillager(Game, pH2);
  setHp(Game, plainA, 100); setHp(Game, holder, 100);
  // (a) sheltered holder on the monster's tile (Haven itself).
  shelter(pHolder, holder);
  check('shelter verb moved the holder to Haven', (function () { const n = Game.npcNode(holder); return n && n.nx === hv.hx && n.ny === hv.hy; })(),
    JSON.stringify(Game.npcNode(holder)));
  check('holder reads as sheltered', Game.isSheltered(holder) === true, '');
  let r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (a): sheltered holder on-tile leads (fired, dist 0)',
    r.out && r.out.fired === true && r.out.vid === holder && r.out.holder === holder &&
    r.out.reason === 'fired' && r.out.dist === 0 && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (b) sheltered holder adjacent to the monster's tile.
  r = withDraws([0.5], function () { return draft(m4adj, plainA); });
  check('draft (b): sheltered holder adjacent leads (fired, dist 1)',
    r.out && r.out.fired === true && r.out.vid === holder && r.out.reason === 'fired' &&
    r.out.dist === 1 && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (c) on-tile beats adjacent: a second sheltered holder one tile over loses.
  armHolder(pH2, holder2, 2);
  setHp(Game, holder2, 100);
  shelter(pH2, holder2);
  Game.npcSetNode(holder2, MTX + 1, MTY); // still flagged sheltered, standing adjacent
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (c): on-tile sheltered holder beats an adjacent sheltered holder',
    r.out && r.out.fired === true && r.out.vid === holder && r.out.dist === 0 && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  resetVillager(Game, pH2);
  unshelterAll();
  Game.npcSetNode(holder2, MTX, MTY);
  // (d) an UNSHELTERED holder in earshot is refused — presence's territory.
  armHolder(pHolder, holder, 2);
  Game.npcSetNode(holder, MTX, MTY);
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (d): unsheltered holder in earshot -> not fired (no-sheltered-holder)',
    r.out && r.out.fired === false && r.out.vid === null && r.out.reason === 'no-sheltered-holder' && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (e) a cell-less sheltered holder is not armed.
  armHolder(pHolder, holder, 0);
  shelter(pHolder, holder);
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (e): 0-cell sheltered holder -> not fired',
    r.out && r.out.fired === false && r.out.vid === null && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  unshelterAll();
  // (f) a badly hurt sheltered holder (HP <= 20) does not step forward.
  armHolder(pHolder, holder, 2);
  shelter(pHolder, holder);
  setHp(Game, holder, 15);
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (f): HP-15 sheltered holder -> not fired (holder-unusable)',
    r.out && r.out.fired === false && r.out.vid === null && r.out.reason === 'holder-unusable' && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  setHp(Game, holder, null);
  unshelterAll();
  // (g) a resting sheltered holder does not step forward.
  armHolder(pHolder, holder, 2);
  shelter(pHolder, holder);
  Game.markPostFleeRest(holder);
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (g): resting sheltered holder -> not fired (holder-unusable)',
    r.out && r.out.fired === false && r.out.vid === null && r.out.reason === 'holder-unusable' && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  unshelterAll();
  // (h) below wave 4 the draft never fires.
  armHolder(pHolder, holder, 2);
  shelter(pHolder, holder);
  r = withDraws([0.5], function () { return draft(m1, plainA); });
  check('draft (h): wave-1 beast -> not fired (wave-below-4)',
    r.out && r.out.fired === false && r.out.vid === null && r.out.reason === 'wave-below-4' && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (i) an armed lead is NOT replaced — the gun is already in front.
  armHolder(pA, plainA, 2);
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (i): loaded-searcaster lead -> not fired (lead-armed)',
    r.out && r.out.fired === false && r.out.vid === null && r.out.reason === 'lead-armed' && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  armLeadBow(pA, plainA);
  // (j) an empty-gun lead IS replaced — the lead cannot volley.
  armLeadEmptyGun(pA, plainA);
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (j): empty-gun lead + sheltered holder -> fired',
    r.out && r.out.fired === true && r.out.vid === holder && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  armLeadBow(pA, plainA);
  // (k) the env gate lives in the tick, not the helper: with
  // SHELTERDRAFT unset the helper still reads the holder (the tick
  // proves the gate below).
  setShelterdraft(false);
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (k): helper is env-independent (gate lives in the tick)',
    r.out && r.out.fired === true && r.out.vid === holder && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  setShelterdraft(true);
  // (l) pure reads — nothing moved by the evaluation.
  r = withDraws([0.5], function () { return draft(m4, plainA); });
  check('draft (l): pure reads — kits and ammo unchanged after the call',
    r.out && rangedKitOf(Game, pHolder).rwId === 'searcaster' &&
    rangedKitOf(Game, pA).rwId === 'crude_bow' &&
    ammoCountOf(pHolder.items, 'fusion_cell') === 2 && ammoCountOf(pA.items, 'fusion_cell') === 0,
    'holder=' + JSON.stringify(rangedKitOf(Game, pHolder)) + ' lead=' + JSON.stringify(rangedKitOf(Game, pA)));
  unshelterAll();

  // ---- 3. tick-level proof: draft after pick, pick draw kept ----
  // Monster tile adjacent to Haven (so the sheltered holder is in
  // earshot) and away from the player's tile (the tick skips the
  // player's own tile).
  const px = (Game.map && Game.map.px !== undefined) ? Game.map.px : 4;
  const py = (Game.map && Game.map.py !== undefined) ? Game.map.py : 4;
  let TX = hv.hx + 1, TY = hv.hy + 1;
  if (TX === px && TY === py) { TX = hv.hx - 1; TY = hv.hy - 1; }
  if (TX < 0 || TX > 8 || TY < 0 || TY > 8) { TX = hv.hx + 1; TY = hv.hy - 1; }
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pA); resetVillager(Game, pB);
  armLeadBow(pA, plainA);
  Game.npcSetNode(plainA, TX, TY);
  Game.npcSetNode(plainB, TX, TY);
  shelter(pHolder, holder); // holder's node is Haven, adjacent to (TX, TY)
  check('tick fixture: sheltered holder adjacent to the monster tile',
    (function () { const n = Game.npcNode(holder); return Math.max(Math.abs(n.nx - TX), Math.abs(n.ny - TY)) === 1; })(),
    'holderNode=' + JSON.stringify(Game.npcNode(holder)) + ' tile=' + TX + ',' + TY);
  const savedMonsters = Game.state.worldMonsters;
  Game.state.worldMonsters = [{ id: 'eulogy', tx: TX, ty: TY }];
  let captured = null;
  const realResolve = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) { captured = { vid: vid, mid: m && m.id, opts: opts || null }; return { ok: true }; };
  // SHELTERDRAFT on: coin flip passes (0.4), pick draw takes roster
  // slot 0 (0.1 * 2 -> plainA) — then the draft fires and the holder
  // leads. The pick draw is consumed exactly as before: 2 draws.
  setShelterdraft(true);
  captured = null;
  r = withDraws([0.4, 0.1], function () { Game.villagerMonsterTick(); return captured; });
  check('tick (a): SHELTERDRAFT on, draft fires — holder leads, 2 draws (pick kept)',
    r.out && r.out.vid === holder && r.used === 2,
    'lead=' + (r.out && r.out.vid) + ' want=' + holder + ' draws=' + r.used);
  check('tick (a2): resolve receives opts.shelterDraft {holder, replacedLead}',
    r.out && r.out.opts && r.out.opts.shelterDraft && r.out.opts.shelterDraft.holder === holder &&
    r.out.opts.shelterDraft.replacedLead === plainA,
    JSON.stringify(r.out && r.out.opts));
  // SHELTERDRAFT unset: the same draws take the pick — plainA leads, 2 draws, no draft opts.
  setShelterdraft(false);
  captured = null;
  r = withDraws([0.4, 0.1], function () { Game.villagerMonsterTick(); return captured; });
  check('tick (b): SHELTERDRAFT off, pick stands — plainA leads, 2 draws, no shelterDraft opts',
    r.out && r.out.vid === plainA && r.used === 2 && !(r.out.opts && r.out.opts.shelterDraft),
    'lead=' + (r.out && r.out.vid) + ' want=' + plainA + ' draws=' + r.used + ' opts=' + JSON.stringify(r.out && r.out.opts));
  // The coin flip still gates the tick: 0.9 ends it before any pick.
  setShelterdraft(true);
  captured = null;
  r = withDraws([0.9, 0.1], function () { Game.villagerMonsterTick(); return captured; });
  check('tick (c): coin flip fails — no encounter, 1 draw',
    r.out === null && r.used === 1, 'captured=' + JSON.stringify(r.out) + ' draws=' + r.used);
  Game.resolveWildMonsterEncounter = realResolve;
  Game.state.worldMonsters = savedMonsters;

  // ---- 4. live drafted lead fires an armed wave-4+ volley ----
  setShelterdraft(true); setCellgate(true); setGunrate(true);
  armHolder(pHolder, holder, 4);
  Game.villagerGearUp(holder, true);
  const kit = rangedKitOf(Game, pHolder);
  check('live: holder is geared with the searcaster in the ranged slot',
    kit && kit.rwId === 'searcaster', JSON.stringify(kit));
  resetVillager(Game, pA); resetVillager(Game, pB);
  armLeadBow(pA, plainA);
  Game.npcSetNode(plainA, TX, TY);
  Game.npcSetNode(plainB, TX, TY);
  shelter(pHolder, holder);
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
  check('live: the call-out line heads the fight log',
    r.out && r.out.rec && r.out.rec.log && r.out.rec.log.length > 0 &&
    /comes out of the hall, Searcaster in hand/.test(String(r.out.rec.log[0])),
    JSON.stringify(r.out && r.out.rec && r.out.rec.log && r.out.rec.log[0]));
  Game.fieldFight = realFieldFight;
  Game.state.worldMonsters = savedMonsters;
  setShelterdraft(false); setCellgate(false); setGunrate(false);

  // ---- 5. analyzer selftest (cross-leg judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-shelterdraft-a --selftest) ===');
  let anaSelf = null, anaCount = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-shelterdraft-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    const m = /(\d+) passed, 0 failed/.exec(anaOut);
    anaCount = m ? parseInt(m[1], 10) : null;
    anaSelf = anaCount != null && anaCount >= 40;
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer CLI selftest passes (>= 40 passed, 0 failed — incl. the launch-level judge)', anaSelf === true, anaCount === null ? 'no output' : 'passed=' + anaCount);

  console.log('SHELTERDRAFT_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('SHELTERDRAFT_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
