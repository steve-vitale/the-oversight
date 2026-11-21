#!/usr/bin/env node
// scripts/test-lendpool-a.js — proof test, arm sim-lendpool-a
// (finding #2628: the lend-opportunity pool is 0 — diagnose WHY
// holders never stand in earshot of an unarmed lead).
// Proves the near-miss instrument attributes correctly BEFORE any
// judged sim (RED -> GREEN):
// (a) classifyHolderState returns the frozen class on each staged
//     state — sheltered / resting / low-health / on-expedition /
//     away / at-home / in-camp / out-in-world / dead — with the
//     frozen priority order (sheltered > resting > low-health >
//     on-expedition > away > location), staged through the REAL
//     verbs/methods (shelterVillagers, markPostFleeRest,
//     agencyState().exped, village.away, npcSetNode/npcSetInside),
//     never a faked flag;
// (b) nearMissMoment evaluates the launch the lend would see —
//     leadKind (gun | cells | loaded), nearest living armed holder
//     (distance, state, health, cells), earshot flags (armed vs
//     eligible), and the lendPoolMoment cross-check — on fixtures
//     at each distance 0/1/2/3, each holder state, no living
//     holder, loaded lead, wave-1, raid — with 0 draws and pure
//     reads (nothing moved);
// (c) the analyzer --selftest covers the classified-breakdown
//     judge shapes (DIAG-GO / DIAG-NO-GO per bar incl. the
//     coverage bar and the diffuse-breakdown rule).
//
// Encounter-gear fixture throughout: a geared villager fighter
// with a party, never a fresh un-geared solo scholar.
//
// Usage: node scripts/test-lendpool-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf, lendPoolMoment, nearMissMoment, classifyHolderState } = require('./lendpool-driver-a');
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
function setHp(Game, vid, hp) {
  Game.state.village.health = Game.state.village.health || {};
  if (hp === null) delete Game.state.village.health[vid];
  else Game.state.village.health[vid] = hp;
}
function havenOf(Game) {
  const v = Game.state.village || {};
  return { hx: (v.px != null ? v.px : 4), hy: (v.py != null ? v.py : 4) };
}

// One fresh game, staged for a launch: the lead (bow, 5 arrows) on
// the monster tile (5,5), the holder (searcaster + 2 cells) placed by
// the caller, two more roster villagers on the tile as party.
async function freshLaunch(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'lendpool-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const lead = roster[0], holder = roster[1], plainB = roster[2], plainC = roster[3];
  const pLead = personOf(Game, lead), pHolder = personOf(Game, holder),
    pB = personOf(Game, plainB), pC = personOf(Game, plainC);
  const MTX = 5, MTY = 5;
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
  armLeadBow(pLead, lead);
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pB); resetVillager(Game, pC);
  Game.npcSetNode(lead, MTX, MTY);
  Game.npcSetNode(holder, MTX + 1, MTY);
  Game.npcSetNode(plainB, MTX, MTY);
  Game.npcSetNode(plainC, MTX, MTY);
  setHp(Game, lead, 100);
  setHp(Game, holder, 100);
  return { Game: Game, roster: roster, lead: lead, holder: holder,
    pLead: pLead, pHolder: pHolder, MTX: MTX, MTY: MTY,
    armHolder: armHolder, armLeadBow: armLeadBow, armLeadEmptyGun: armLeadEmptyGun };
}

async function main() {
  // ---- 1. live data agreement ----
  const { Game: g0 } = await loadGame({ seed: 7, mode: 'lendpool-unit' });
  await quietLog(async () => { await setupGame(g0); });
  const algorithm = (g0.data.monsters || []).find(function (m) { return m.id === 'algorithm'; });
  const eulogy = (g0.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  const moth = (g0.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  check('algorithm fixture is wave 4', algorithm && (algorithm.wave || 1) === 4, JSON.stringify(algorithm && algorithm.wave));
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));
  check('nearMissMoment exported by the lendpool driver', typeof nearMissMoment === 'function');
  check('classifyHolderState exported by the lendpool driver', typeof classifyHolderState === 'function');
  check('lendPoolMoment still exported (cross-check)', typeof lendPoolMoment === 'function');

  // ---- 2. classifyHolderState — every frozen class, staged real ----
  // (a) at-home: Haven node, inside the hall.
  let b = await freshLaunch(7);
  let hv = havenOf(b.Game);
  b.Game.npcSetNode(b.holder, hv.hx, hv.hy);
  b.Game.npcSetInside(b.holder, true);
  check('classify (a): Haven node + inside -> at-home',
    classifyHolderState(b.Game, b.holder) === 'at-home',
    classifyHolderState(b.Game, b.holder));
  // (b) in-camp: Haven node, outside on the grounds.
  b = await freshLaunch(7);
  hv = havenOf(b.Game);
  b.Game.npcSetNode(b.holder, hv.hx, hv.hy);
  b.Game.npcSetInside(b.holder, false);
  check('classify (b): Haven node + outside -> in-camp',
    classifyHolderState(b.Game, b.holder) === 'in-camp',
    classifyHolderState(b.Game, b.holder));
  // (c) out-in-world: any other node, not on an expedition or away.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 7, 7);
  check('classify (c): far node, no expedition, not away -> out-in-world',
    classifyHolderState(b.Game, b.holder) === 'out-in-world',
    classifyHolderState(b.Game, b.holder));
  // (d) sheltered: the REAL verb — moves to Haven inside + sets the flag.
  b = await freshLaunch(7);
  b.Game.shelterVillagers([b.holder], { quiet: true, reason: 'test' });
  check('classify (d): shelterVillagers -> sheltered (and moved to Haven inside)',
    classifyHolderState(b.Game, b.holder) === 'sheltered' && b.Game.isSheltered(b.holder) === true,
    classifyHolderState(b.Game, b.holder) + ' sheltered=' + b.Game.isSheltered(b.holder));
  // (e) resting: the REAL method — marks today's post-flee rest.
  b = await freshLaunch(7);
  b.Game.markPostFleeRest(b.holder);
  check('classify (e): markPostFleeRest -> resting',
    classifyHolderState(b.Game, b.holder) === 'resting' && b.Game.isPostFleeResting(b.holder) === true,
    classifyHolderState(b.Game, b.holder) + ' resting=' + b.Game.isPostFleeResting(b.holder));
  // (f) low-health: HP 15, nothing else staged.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 7, 7);
  setHp(b.Game, b.holder, 15);
  check('classify (f): HP 15, far node -> low-health',
    classifyHolderState(b.Game, b.holder) === 'low-health',
    classifyHolderState(b.Game, b.holder));
  // (g) on-expedition: a live exped entry, far node.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 7, 7);
  b.Game.agencyState().exped[b.holder] = { target: 'eulogy', tx: 7, ty: 7, day: 1, encounters: [] };
  check('classify (g): live exped entry -> on-expedition',
    classifyHolderState(b.Game, b.holder) === 'on-expedition',
    classifyHolderState(b.Game, b.holder));
  // (h) away: a live away entry, far node.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 7, 7);
  b.Game.state.village.away = b.Game.state.village.away || {};
  b.Game.state.village.away[b.holder] = { purpose: 'forage', day: 1 };
  check('classify (h): live away entry -> away',
    classifyHolderState(b.Game, b.holder) === 'away',
    classifyHolderState(b.Game, b.holder));
  // (i) dead: the person record is dead.
  b = await freshLaunch(7);
  b.pHolder.dead = true;
  check('classify (i): dead person -> dead',
    classifyHolderState(b.Game, b.holder) === 'dead',
    classifyHolderState(b.Game, b.holder));
  // (j) priority: sheltered beats low-health.
  b = await freshLaunch(7);
  setHp(b.Game, b.holder, 15);
  b.Game.shelterVillagers([b.holder], { quiet: true, reason: 'test' });
  check('classify (j): sheltered + HP 15 -> sheltered (priority)',
    classifyHolderState(b.Game, b.holder) === 'sheltered',
    classifyHolderState(b.Game, b.holder));
  // (k) priority: resting beats on-expedition.
  b = await freshLaunch(7);
  b.Game.agencyState().exped[b.holder] = { target: 'eulogy', tx: 7, ty: 7, day: 1, encounters: [] };
  b.Game.markPostFleeRest(b.holder);
  check('classify (k): resting + exped -> resting (priority)',
    classifyHolderState(b.Game, b.holder) === 'resting',
    classifyHolderState(b.Game, b.holder));
  // (l) priority: on-expedition beats away.
  b = await freshLaunch(7);
  b.Game.state.village.away = b.Game.state.village.away || {};
  b.Game.state.village.away[b.holder] = { purpose: 'forage', day: 1 };
  b.Game.agencyState().exped[b.holder] = { target: 'eulogy', tx: 7, ty: 7, day: 1, encounters: [] };
  check('classify (l): exped + away -> on-expedition (priority)',
    classifyHolderState(b.Game, b.holder) === 'on-expedition',
    classifyHolderState(b.Game, b.holder));

  // ---- 3. nearMissMoment — the launch the lend would see ----
  const m4 = { id: 'eulogy', tx: 5, ty: 5 };
  const m1 = { id: 'mirrormoth', tx: 5, ty: 5 };
  // (a) gun lead, holder adjacent out-in-world: the lendable shape.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  let r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (a): gun lead + adjacent holder -> leadKind gun, dist 1, out-in-world, both earshots, lendable, 0 draws',
    r.out && r.out.leadKind === 'gun' && r.out.nearestDist === 1 && r.out.nearestState === 'out-in-world' &&
    r.out.nearestHolder === b.holder && r.out.anyArmedEarshot === true && r.out.anyEligibleEarshot === true &&
    r.out.lendable === true && r.out.livingHolderCount === 1 && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  check('nearMiss (a2): pure reads — nothing moved',
    rangedKitOf(b.Game, b.pHolder).rwId === 'searcaster' && rangedKitOf(b.Game, b.pLead).rwId === 'crude_bow' &&
    ammoCountOf(b.pHolder.items, 'fusion_cell') === 2 && ammoCountOf(b.pLead.items, 'fusion_cell') === 0,
    'holder=' + JSON.stringify(rangedKitOf(b.Game, b.pHolder)) + ' lead=' + JSON.stringify(rangedKitOf(b.Game, b.pLead)));
  // (b) holder on the monster's tile: dist 0, lendable.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 5, 5);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (b): holder on-tile -> dist 0, lendable',
    r.out && r.out.nearestDist === 0 && r.out.lendable === true && r.out.anyArmedEarshot === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (c) holder 3 tiles away: dist 3, no earshot, not lendable.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 8, 5);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (c): holder 3 away -> dist 3, no earshot, not lendable',
    r.out && r.out.nearestDist === 3 && r.out.anyArmedEarshot === false && r.out.anyEligibleEarshot === false &&
    r.out.lendable === false && r.out.nearestState === 'out-in-world' && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (d) sheltered holder in earshot: armed yes, eligible no, not lendable.
  b = await freshLaunch(7);
  b.Game.shelterVillagers([b.holder], { quiet: true, reason: 'test' });
  // Haven is (4,4) by default; monster at (5,5) -> Chebyshev 1 (adjacent).
  hv = havenOf(b.Game);
  const shelterDist = Math.max(Math.abs(hv.hx - 5), Math.abs(hv.hy - 5));
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (d): sheltered holder in earshot -> sheltered, armed yes / eligible no, not lendable',
    r.out && r.out.nearestState === 'sheltered' && r.out.nearestDist === shelterDist &&
    r.out.anyArmedEarshot === true && r.out.anyEligibleEarshot === false && r.out.lendable === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used + ' shelterDist=' + shelterDist);
  // (e) resting holder adjacent: resting, eligible no, not lendable.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  b.Game.markPostFleeRest(b.holder);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (e): resting holder adjacent -> resting, eligible no, not lendable',
    r.out && r.out.nearestState === 'resting' && r.out.anyArmedEarshot === true &&
    r.out.anyEligibleEarshot === false && r.out.lendable === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (f) low-health holder adjacent: low-health, eligible no, not lendable.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  setHp(b.Game, b.holder, 15);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (f): HP-15 holder adjacent -> low-health, eligible no, not lendable',
    r.out && r.out.nearestState === 'low-health' && r.out.nearestHealth === 15 &&
    r.out.anyArmedEarshot === true && r.out.anyEligibleEarshot === false && r.out.lendable === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (g) holder on an expedition, adjacent: the lend does NOT exclude
  // expedition holders — classified on-expedition AND lendable.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  b.Game.agencyState().exped[b.holder] = { target: 'eulogy', tx: 6, ty: 5, day: 1, encounters: [] };
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (g): exped holder adjacent -> on-expedition AND lendable (exped does not exclude)',
    r.out && r.out.nearestState === 'on-expedition' && r.out.lendable === true &&
    r.out.anyEligibleEarshot === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (h) no living holder anywhere: the empty-pool shape.
  b = await freshLaunch(7);
  resetVillager(b.Game, b.pHolder);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (h): no living holder -> no-living-holder, dist null, count 0, no earshot',
    r.out && r.out.nearestState === 'no-living-holder' && r.out.nearestDist === null &&
    r.out.livingHolderCount === 0 && r.out.anyArmedEarshot === false && r.out.lendable === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (i) loaded lead + adjacent holder: leadKind loaded, another holder
  // in earshot, but nothing to lend (the lead already has the gun).
  b = await freshLaunch(7);
  b.armHolder(b.pLead, b.lead, 2);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (i): loaded lead + adjacent holder -> leadKind loaded, armed earshot true, lendable false',
    r.out && r.out.leadKind === 'loaded' && r.out.anyArmedEarshot === true &&
    r.out.lendable === false && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (j) lead carries an EMPTY searcaster: leadKind cells, lendable.
  b = await freshLaunch(7);
  b.armLeadEmptyGun(b.pLead, b.lead);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (j): empty-gun lead + adjacent holder -> leadKind cells, lendable',
    r.out && r.out.leadKind === 'cells' && r.out.lendable === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (k) below wave 4: null.
  b = await freshLaunch(7);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m1, {}); });
  check('nearMiss (k): wave-1 beast -> null', r.out === null && r.used === 0,
    'out=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (l) raids ARE evaluated (a raid is a real fight through the
  // same choke point, and the encounter recorder logs it — the row
  // must exist for the coverage join) but never lendable.
  b = await freshLaunch(7);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, { raid: true }); });
  check('nearMiss (l): raid -> row with raid:true, lendable false (coverage row, never a lend)',
    r.out && r.out.raid === true && r.out.lendable === false && r.out.leadKind === 'gun' && r.used === 0,
    'out=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (l2) a raid with an armed holder adjacent: still never lendable.
  b = await freshLaunch(7);
  b.Game.npcSetNode(b.holder, 6, 5);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, { raid: true }); });
  check('nearMiss (l2): raid + adjacent holder -> raid:true, anyArmedEarshot true, lendable false',
    r.out && r.out.raid === true && r.out.anyArmedEarshot === true && r.out.lendable === false && r.used === 0,
    'out=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (m) the only armed holder IS the lead: the lead is excluded from
  // the holder scan — no other holder exists.
  b = await freshLaunch(7);
  b.armHolder(b.pLead, b.lead, 2);
  resetVillager(b.Game, b.pHolder);
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (m): holder is the lead, no other holder -> no-living-holder, count 0',
    r.out && r.out.leadKind === 'loaded' && r.out.livingHolderCount === 0 &&
    r.out.nearestState === 'no-living-holder' && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (n) nearest of TWO holders wins (closer one, roster order on ties).
  b = await freshLaunch(7);
  const extra = b.roster[2];
  const pExtra = personOf(b.Game, extra);
  b.armHolder(pExtra, extra, 1);
  b.Game.npcSetNode(b.holder, 8, 5); // dist 3
  b.Game.npcSetNode(extra, 6, 5); // dist 1 — nearer
  r = withDraws([0.5], function () { return nearMissMoment(b.Game, b.lead, m4, {}); });
  check('nearMiss (n): two holders -> nearest wins (dist 1), count 2',
    r.out && r.out.nearestHolder === extra && r.out.nearestDist === 1 &&
    r.out.livingHolderCount === 2 && r.out.lendable === true && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);

  // ---- 4. analyzer selftest (classified-breakdown judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-lendpool-a --selftest) ===');
  let anaSelf = null, anaCount = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-lendpool-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    const m = /(\d+) passed, 0 failed/.exec(anaOut);
    anaCount = m ? parseInt(m[1], 10) : null;
    anaSelf = anaCount != null && anaCount >= 20;
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (>= 20 passed, 0 failed — incl. the classified-breakdown judge)', anaSelf === true, anaCount === null ? 'no output' : 'passed=' + anaCount);

  console.log('LENDPOOL_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('LENDPOOL_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
