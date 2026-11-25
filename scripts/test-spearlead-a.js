#!/usr/bin/env node
// scripts/test-spearlead-a.js — proof test, arm sim-spearlead-a (DIAG).
//
// Proves the spear-lead measurement chain on a LIVE loaded game:
//   1. A spear departure row is recorded with pre/post-staging
//      ranged ids: noSource leaves the spear in hand; a staged bow
//      (from the armory) converts the carrier — and the re-depart
//      supersedes the open departure in spearTrack.
//   2. A live winPlanDepart call pushes a depart row carrying
//      holderRangedId / holderAmmo / partyRanged.
//   3. A lower-wave expedition fight (wave 1, via expeditionMonster)
//      lands in expFights.
//   4. The spearTrack daily updater records lifecycle rows and
//      closes a home departure as 'returned' while leaving a live
//      expedition open.
//   5. The analyzer classifies fixture departures into each of the
//      nine buckets (the frozen priority order).
//   6. The spearopen proof chain it extends: spear volley null +
//      silent; bow volley fires + ammo spent; dry bow blocked with
//      the honest "no arrows" line.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): a geared wave-4
// hunter as the launch leaves them — a spear or a bow with arrows —
// never a fresh un-geared solo scholar.
//
// Usage: node scripts/test-spearlead-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { classifyOpening } = require('./analyze-spearopen-a');
const { classifyDeparture } = require('./analyze-spearlead-a');
const spearDriver = require('./spearlead-driver-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) || {});
}
function setHealth(Game, vid, hp) {
  (Game.state.village.health = Game.state.village.health || {})[vid] = hp;
}
function setMats(Game, mats) {
  try { const st = Game.stashState(); st.materials = Object.assign({}, mats); } catch (e) {}
  try { Game.state.village.stash.materials = Object.assign({}, mats); } catch (e2) {}
}
function emptyArmory(Game) {
  try { const st = Game.stashState ? Game.stashState() : null; const pile = (st && st.weapons) || []; pile.length = 0; } catch (e) {}
}
function addArmory(Game, itemId, units) {
  try { const st = Game.stashState ? Game.stashState() : null; const pile = (st && st.weapons) || []; pile.push({ itemId: itemId, units: units || 1 }); } catch (e) {}
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
}
function ammoCount(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (id === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  return n;
}
function itemDefs(Game) {
  const m = {};
  for (const d of Game.data.items) m[d.id] = d;
  return m;
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'spearlead-unit' });
  if (loadFails && loadFails.length) { console.log('  FAIL module load: ' + loadFails.join('; ')); process.exitCode = 1; return; }
  await quietLog(async () => { await setupGame(Game); });
  const S = globalThis.Scattering || {};
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { console.log('  FAIL need 3+ NPCs, have ' + roster.length); process.exitCode = 1; return; }
  const vid = roster[0];
  const cid = roster[1];
  const p = personOf(Game, vid);
  const cp = personOf(Game, cid);
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const defOf = (id) => (Game.data.items || []).find(d => d.id === id);
  const eulogy = mdef('eulogy');
  console.log('holder=' + vid + ' companion=' + cid + ' roster=' + roster.length + ' monster=eulogy(wave ' + (eulogy && eulogy.wave) + ')');
  check('eulogy is a wave-4 monster', !!eulogy && eulogy.wave === 4);

  // The substrate flags, as the driver main() asserts them.
  process.env.BOWOPEN = '1'; process.env.SPEARGATE = '1';
  process.env.VETREENGAGE = '1'; process.env.PARTYSIZE4 = '1';
  process.env.FLEEREPAIR2 = '1'; process.env.FIGHTALLY2 = '1';
  process.env.SENSEEXPED = '1';

  // Install the exact recorder oneRun runs.
  const L = { spearDeparts: [], allStarts: [], expFights: [], spearTrack: [],
    v4departs: [], dawnbidDeparts: [], v4encounters: [], v4gates: [], open: {} };
  const recErrors = [];
  const rec = spearDriver.installSpearleadRecorder(Game, L, recErrors);
  check('recorder installs with no errors', recErrors.length === 0, JSON.stringify(recErrors));

  // ---- 1. Spear departure rows: noSource, then a staged bow converts ----
  Game.state.village.bowOpen = undefined; Game.state.village.bowOpenByVid = undefined;
  setMats(Game, { wood: 0, vine: 0, branch: 0, stick: 0, stone: 0, fiber: 0 });
  emptyArmory(Game);
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const seen0 = (Game.state.village.bowOpen || {}).spearSeen | 0;
  Game.villagerStageBow(vid);
  check('noSource staging records one spear departure row',
    L.spearDeparts.length === 1 && L.spearDeparts[0].isSpear === true,
    JSON.stringify(L.spearDeparts[0]));
  const row1 = L.spearDeparts[0];
  check('noSource row: pre/post-staging ranged ids are the spear',
    row1 && row1.preRangedId === 'hunting_spear' && row1.postRangedId === 'hunting_spear',
    JSON.stringify(row1));
  check('noSource row: source noSource, not staged, spearSeen bumped',
    row1 && row1.source === 'noSource' && row1.staged === false && row1.spearSeenBump === true &&
    ((Game.state.village.bowOpen || {}).spearSeen | 0) === seen0 + 1,
    JSON.stringify(row1));
  check('noSource departure opens a tracked departure', !!L.open[vid] && L.open[vid].seq === row1.seq);
  // Conversion: a bow in the communal armory stages over the spear.
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  addArmory(Game, 'bow', 1);
  Game.villagerStageBow(vid);
  check('conversion staging records a second spear departure row',
    L.spearDeparts.length === 2 && L.spearDeparts[1].isSpear === true,
    JSON.stringify(L.spearDeparts[1]));
  const row2 = L.spearDeparts[1];
  check('conversion row: pre-staging spear, post-staging bow (fromArmory, staged)',
    row2 && row2.preRangedId === 'hunting_spear' && row2.postRangedId === 'bow' &&
    row2.source === 'fromArmory' && row2.staged === true && row2.stagedItemId === 'bow',
    JSON.stringify(row2));
  check('re-depart supersedes the open departure (close-out row, counted openly)',
    L.spearTrack.some(function (t) { return t.kind === 'close' && t.seq === row1.seq && t.outcome === 'superseded'; }),
    JSON.stringify(L.spearTrack));
  check('the new departure is the open one', !!L.open[vid] && L.open[vid].seq === row2.seq);

  // ---- 2. A real expedition departure for a second villager ----
  let expedVid = null;
  for (let i = 2; i < Math.min(roster.length, 6); i++) {
    const cand = roster[i];
    const cperson = personOf(Game, cand);
    resetVillager(Game, cperson);
    cperson.items = [{ itemId: 'hunting_spear', units: 1 }];
    Game.villagerGearUp(cand, true);
    setHealth(Game, cand, 100);
    const before = L.allStarts.length;
    Game.startExpedition(cand, (Game.state.village.px != null ? Game.state.village.px : 4), (Game.state.village.py != null ? Game.state.village.py : 4), false);
    const started = L.allStarts.slice(before).find(function (r) { return r.vid === cand; });
    if (started && started.expedAfter) { expedVid = cand; break; }
  }
  check('a spear carrier departs on a real expedition (allStarts expedAfter)',
    !!expedVid, 'tried roster[2..5], allStarts=' + JSON.stringify(L.allStarts.map(function (r) { return r.vid + ':' + r.expedAfter; })));
  const depRow = expedVid ? L.spearDeparts.find(function (r) { return r.vid === expedVid && r.isSpear; }) : null;
  check('the expedition departure has a spear ledger row', !!depRow, JSON.stringify(depRow));

  // ---- 3. spearTrack daily updater: home closes, away stays open ----
  const day = (Game.state.scholar && Game.state.scholar.day) || 0;
  spearDriver.updateSpearTrack(Game, L, day);
  check('daily rows recorded for open departures',
    L.spearTrack.some(function (t) { return t.kind === 'daily' && t.vid === vid; }) &&
    L.spearTrack.some(function (t) { return t.kind === 'daily' && t.vid === expedVid; }),
    JSON.stringify(L.spearTrack.filter(function (t) { return t.kind === 'daily'; })));
  check('the home departure closes as returned; the expedition stays open',
    L.spearTrack.some(function (t) { return t.kind === 'close' && t.seq === row2.seq && t.outcome === 'returned'; }) &&
    !L.open[vid] && !!L.open[expedVid],
    JSON.stringify(L.spearTrack.filter(function (t) { return t.kind === 'close'; })));

  // ---- 4. A live winPlanDepart row carries the holder kit ----
  resetVillager(Game, cp);
  cp.items = [{ itemId: 'bow', units: 1 }, { itemId: 'arrow', units: 5 }];
  Game.villagerGearUp(cid, true);
  setHealth(Game, cid, 100);
  (Game.state.village.trust = Game.state.village.trust || {})[cid] = 50;
  (Game.state.village.trust = Game.state.village.trust || {})[vid] = 50;
  setHealth(Game, vid, 100);
  (Game.state.village.winPlan = Game.state.village.winPlan || {})[vid] =
    { stage: 'party', target: 'eulogy', needWave: 4, party: [], holdSinceDay: -1 };
  const hx = (Game.state.village.px != null ? Game.state.village.px : 4);
  const hy = (Game.state.village.py != null ? Game.state.village.py : 4);
  const depRet = Game.winPlanDepart(vid, hx, hy, false);
  const depRows = L.v4departs.filter(function (r) { return r.vid === vid; });
  check('winPlanDepart returns hold|launch and pushes a depart row',
    (depRet === 'hold' || depRet === 'launch') && depRows.length >= 1,
    'ret=' + depRet + ' rows=' + JSON.stringify(depRows));
  const dRow = depRows[depRows.length - 1];
  check('depart row carries holderRangedId/holderAmmo/partyRanged (post-call reads)',
    !!dRow && dRow.holderRangedId != null && typeof dRow.holderAmmo === 'number' && Array.isArray(dRow.partyRanged),
    JSON.stringify(dRow));
  check('depart row holder kit is the converted bow (the carrier departed ranged, not spear)',
    !!dRow && dRow.holderRangedId === 'bow', JSON.stringify(dRow));

  // ---- 5. A lower-wave expedition fight lands in expFights ----
  const expBefore = L.expFights.length;
  Game.expeditionMonster(expedVid, 2, false);
  const newFights = L.expFights.slice(expBefore).filter(function (f) { return f.vid === expedVid; });
  check('expeditionMonster fight lands in expFights (expedition origin, any wave)',
    newFights.length >= 1, JSON.stringify(newFights));
  check('the expedition fight is lower-wave (wave < 4)',
    newFights.length >= 1 && (newFights[0].wave | 0) < 4,
    JSON.stringify(newFights[0]));
  check('the expFights row carries the lead ranged id + ally lists',
    newFights.length >= 1 && newFights[0].rangedId === 'hunting_spear' && Array.isArray(newFights[0].allyVids) && Array.isArray(newFights[0].allySpearVids),
    JSON.stringify(newFights[0]));

  // ---- 6. The analyzer classifies fixture departures into each bucket ----
  const defs = itemDefs(Game);
  function fxDep(seq, dayN, v, o) {
    return Object.assign({ seq: seq, day: dayN, vid: v, isSpear: true, preRangedId: 'hunting_spear', preAmmo: 0,
      source: 'noSource', stagedItemId: null, staged: false, postRangedId: 'hunting_spear', postAmmo: 0,
      planStage: null, planTarget: null, planNeedWave: null, planParty: [] }, o);
  }
  function fxFight(seq, dayN, v, o) {
    return Object.assign({ seq: seq, day: dayN, vid: v, mid: 'eulogy', wave: 4, origin: 'expedition',
      outcome: 'vFlee', rounds: 2, rangedId: 'hunting_spear', allyVids: [], allySpearVids: [] }, o);
  }
  const cases = [
    ['lead-w4-with-spear', fxDep(1, 10, 'a', {}),
      { closeOut: 'returned', leadFights: [fxFight(1, 12, 'a', {})], compFightsSpear: [], compFightsAny: [], avoids: [] }],
    ['companion-w4', fxDep(2, 10, 'b', {}),
      { closeOut: 'returned', leadFights: [], compFightsSpear: [fxFight(2, 12, 'h', { allyVids: ['b'], allySpearVids: ['b'] })], compFightsAny: [fxFight(2, 12, 'h', { allyVids: ['b'], allySpearVids: ['b'] })], avoids: [] }],
    ['gate-avoid-w4', fxDep(3, 10, 'c', {}),
      { closeOut: 'returned', leadFights: [], compFightsSpear: [], compFightsAny: [], avoids: [{ day: 12, vid: 'c', result: 'avoid', wave: 4 }] }],
    ['converted-at-staging', fxDep(4, 10, 'd', { source: 'fromArmory', postRangedId: 'bow', staged: true }),
      { closeOut: 'returned', leadFights: [], compFightsSpear: [], compFightsAny: [], avoids: [] }],
    ['died-away', fxDep(5, 10, 'e', {}),
      { closeOut: 'died', leadFights: [], compFightsSpear: [], compFightsAny: [], avoids: [] }],
    ['plan-never-reached', fxDep(6, 10, 'f', { planStage: 'hunt', planTarget: 'eulogy', planNeedWave: 4 }),
      { closeOut: 'returned', leadFights: [], compFightsSpear: [], compFightsAny: [], avoids: [] }],
    ['autonomous-no-w4', fxDep(7, 10, 'g', {}),
      { closeOut: 'returned', leadFights: [fxFight(7, 12, 'g', { mid: 'bulldozer', wave: 1 })], compFightsSpear: [], compFightsAny: [], avoids: [] }],
    ['still-away-at-end', fxDep(8, 10, 'h', {}),
      { closeOut: 'still-away-at-end', leadFights: [], compFightsSpear: [], compFightsAny: [], avoids: [] }],
    ['unattributed', fxDep(9, 10, 'i', {}),
      { closeOut: 'returned', leadFights: [fxFight(9, 12, 'i', { rangedId: null })], compFightsSpear: [], compFightsAny: [], avoids: [] }],
  ];
  for (const [want, depF, ctx] of cases) {
    const got = classifyDeparture(depF, Object.assign({ defs: defs }, ctx));
    check('analyzer classifies a fixture departure as ' + want, got.bucket === want, JSON.stringify(got));
  }

  // ---- 7. The spearopen proof chain (extended, not replaced) ----
  // Spear defs: melee, range 2, NO ammo.
  const SPEARS = ['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'starfall_lance', 'godslayer_spear'];
  for (const id of SPEARS) {
    const d = defOf(id);
    check('def ' + id + ' is melee range-2 with no ammo',
      !!d && d.weapon && d.weapon.type === 'melee' && d.weapon.range === 2 && !d.weapon.ammo,
      JSON.stringify(d && d.weapon));
  }
  // Spear-only carrier: volley null, silent.
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const rSpear = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('spear fight: rec.volley is null (opening never fires)', rSpear.volley === null, JSON.stringify(rSpear.volley));
  check('spear fight: no dry-ammo line (the skip is silent, not narrated)',
    !(rSpear.log || []).some(function (l) { return /but no (arrows|stones|bolts|fusion cells)/i.test(String(l)); }),
    (rSpear.log || []).slice(0, 4).join(' | '));
  check('analyzer classifies the live spear record as no-volley-path',
    classifyOpening({ rangedId: 'hunting_spear', ammoAtEntry: 0, volley: rSpear.volley, log: rSpear.log || [] }, defs).cls === 'no-volley-path');
  // Bow + arrows: volley fires, ammo spent.
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }, { itemId: 'arrow', units: 5 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const before = ammoCount(p.items, 'arrow');
  const rBow = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('bow fight: volley fires (shots >= 1)', !!rBow.volley && rBow.volley.shots >= 1, JSON.stringify(rBow.volley));
  check('bow fight: volley spends real ammo (' + before + ' -> ' + ammoCount(p.items, 'arrow') + ')',
    ammoCount(p.items, 'arrow') === before - (rBow.volley ? rBow.volley.shots : 0));
  check('analyzer classifies the live bow record as fired',
    classifyOpening({ rangedId: 'bow', ammoAtEntry: 5, volley: rBow.volley, log: rBow.log || [] }, defs).cls === 'fired');
  // Dry bow: blocked, honestly narrated.
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const rDry = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('dry bow fight: volley is shots 0', !!rDry.volley && rDry.volley.shots === 0, JSON.stringify(rDry.volley));
  check('dry bow fight: the "no arrows" line is narrated',
    (rDry.log || []).some(function (l) { return /but no arrows/i.test(String(l)); }),
    (rDry.log || []).slice(0, 4).join(' | '));
  check('analyzer classifies the live dry-bow record as blocked-empty-ammo',
    classifyOpening({ rangedId: 'bow', ammoAtEntry: 0, volley: rDry.volley, log: rDry.log || [] }, defs).cls === 'blocked-empty-ammo');

  // ---- 8. Driver module surface ----
  check('driver exports oneRun + the spearlead recorder + trackers',
    typeof spearDriver.oneRun === 'function' &&
    typeof spearDriver.installSpearleadRecorder === 'function' &&
    typeof spearDriver.updateSpearTrack === 'function' &&
    typeof spearDriver.closeSpearTrack === 'function' &&
    typeof spearDriver.rangedKitOf === 'function');
  check('driver is the spearlead instrument (SEEDLAND hard-on)', spearDriver.SEEDLAND === true);
  check('recorder left no instrument errors', recErrors.length === 0, JSON.stringify(recErrors));
  try { rec.uninstall(); } catch (e) {}
  delete process.env.BOWOPEN; delete process.env.SPEARGATE;
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
  delete process.env.FLEEREPAIR2; delete process.env.FIGHTALLY2;
  delete process.env.SENSEEXPED;

  console.log('test-spearlead-a: ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — ' + fails.join('; ') : ''));
  process.exitCode = failed ? 1 : 0;
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
