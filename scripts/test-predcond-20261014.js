#!/usr/bin/env node
// scripts/test-predcond-20261014.js — proof tests for the preddisc-conditioned
// type-matched spiral posture (scripts/policies/predcond.js, gate PREDCOND=1,
// default OFF), layered on leadfeast.
//
// THE BLANK (sim-findings #163, the preddisc consumer): the spiralverb kill
// showed s44's pantry collapse was RAID-DRIVEN and haul/forage answered the
// wrong cause. This layer consumes the preddisc discriminator's frozen rule
// and forks verbs per TYPE: combat -> homebound-brace; pantry-income ->
// ranging-income-priority (ranging OPEN); mixed -> combat-posture-wins;
// pantry-raid -> brace+conserve (SCOPE CUT — #161 steve-call: raid-defense vs
// apex lingerers is unbuilt, the beat says "Endure it", never "Drive it off").
//
// RED-verified where honest:
//   R1 (RED): gate OFF -> daily/upkeep delegate byte-identically to the
//       parent (same verb sequence, same return); NO tracking state written.
//   R2 (RED): gate ON but wave-5 never unlocks -> deaths, successions and
//       pantry tracked passively, nothing engages (pre-window posture inert).
//   R3 (RED): gate ON, wave-5, ATTRITION (2 scholar deaths 30d apart;
//       healthy pantry; no feed) -> NO engage. The s22 lesson.
//   R4 (RED): single marker alone never engages (acceleration alone with
//       healthy pantry; pantry-trajectory alone with no deaths).
//   R5 (RED): the r28 lesson as a RED — a pantry-income engage must NOT pin
//       travel (no walk-home, travel passes through).
// GREEN:
//   G1: combat spiral (acceleration + feed, healthy pantry) -> engages,
//       type=combat, brace line names markers, walk-home, travel guard
//       declines, proposals pause.
//   G2: pantry spiral, no gorge (accel + falling fresh-days) -> engages,
//       type=pantry-income, ranging-for-food beat, travel PASSES, extra
//       forage trip fires, proposals pause, NO walk-home.
//   G3: pantry spiral WITH raid telemetry (raidExplains7d >= 0.40) ->
//       type=pantry-raid, scope-cut beat, travel guarded, NO top-up feast,
//       apex fenced (no engagement verb ever fires on wave-4/5 lingerers).
//   G4: mixed (0.15 <= raidExplains7d < 0.40) -> type=mixed, combat posture
//       wins (brace verbs + top-up feast allowed).
//   G5: travelGuard direct (monster/far declined with codes; haven/adjacent/
//       homeward/combatExit pass; pantry-income ranging open).
//   G6: dusk top-up feast gates on combat/mixed posture only (threat +
//       unfeasted + buffer -> feast; panrty-raid/pantry-income/disengaged
//       stay silent; not-dusk stays silent).
//   G7: disengage after 7 rolling days with <2 markers (release line; verbs
//       release).
//   G8: latch evaluation — pre-unlock history engages at the unlock day,
//       classified per the new markers.
//   G9: haulCorpses fires at upkeep during pantry-income engage (and only then).
//   G10: re-engage after disengage re-classifies the type per the new markers.
'use strict';
// KILL-PROTOCOL NOTE (predcond, NO-GO at pilot — evidence/2026-10-14/
// sim-predcond.md): the layer was deleted per the kill protocol. The
// mechanism proof below ran 20/20 GREEN pre-kill (including the hook-drop
// R1b pin). When the layer is absent this file degrades gracefully instead
// of MODULE_NOT_FOUND (kill-protocol MODULE_NOT_FOUND hazard pattern).
let predcondMod = null;
try { predcondMod = require('./policies/predcond'); } catch (e) { /* deleted per kill protocol */ }
if (!predcondMod) {
  console.log('INFO-SKIP: predcond layer deleted per kill protocol (NO-GO at pilot); mechanism was 20/20 GREEN pre-kill — see evidence/2026-10-14/sim-predcond.md');
  process.exit(0);
}
const { withPredcond, travelGuard, classifyPredation, deathAccel } = predcondMod;

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok - ' + name); }
  catch (e) { fail++; console.log('  FAIL - ' + name + ' :: ' + e.message); }
}

function mockGame(over) {
  const calls = [];
  const G = {
    calls,
    state: {
      scholar: { day: 10, villagerId: 'v1', tools: [] },
      village: { px: 4, py: 4, pantry: [{ kcalEach: 50000, units: 1 }] },
      telemetry: [],
    },
    map: { px: 4, py: 4 },
    dayPart: 2,
    _wave: 1, _monsters: {}, _feasted: false,
    _plan: { ok: true, have: 100000, cost: 2000 }, _fresh: 20,
    _corpses: [],
    data: { monsters: [{ id: 'm5', wave: 5 }, { id: 'apex1', wave: 5 }, { id: 'm2', wave: 2 }] },
    unlockedWave() { return this._wave; },
    monsterAt(x, y) { return this._monsters[x + ',' + y] || null; },
    worldMonsters() { return []; },
    pantryDaysEstimate() { return this._fresh; },
    feastedActive() { return this._feasted; },
    feastPlan() { calls.push(['feastPlan']); return this._plan; },
    hostFeast() { calls.push(['hostFeast']); return { ok: true }; },
    travelTo(x, y, force, combatExit) {
      calls.push(['travelTo', x, y, !!combatExit]);
      this.map.px = x; this.map.py = y;
      return { moved: true };
    },
    proposeLink(id, opts) { calls.push(['proposeLink', id]); return { ok: true }; },
    say(msg) { calls.push(['say', String(msg).slice(0, 500)]); },
    travelTargets() { return [{ x: 5, y: 5, d: 2 }]; },
    tileAt(x, y) { return (x === 5 && y === 5) ? { type: 'grove', stock: 5, revealed: true } : { type: 'field', stock: 0 }; },
    travelBlockage(x, y) { return null; },
    doAction(name, opts) { calls.push(['doAction', name]); return name === 'forage'; },
    playerTile() { return { type: 'grove' }; },
    hasItem(id) { return false; },
    corpses() { return this._corpses; },
    corpseTakeItem(cid, i) { calls.push(['corpseTakeItem', cid, i]); return true; },
    hasCuttingTool() { return false; },
    cleanCarcass() { calls.push(['cleanCarcass']); return 0; },
    triggerEncounter(id) { calls.push(['triggerEncounter', id]); return { ok: true }; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
// combat_start tele helper for killer attribution
function cs(g, day, mid) { g.state.telemetry.push({ type: 'combat_start', day, vs: mid, wave: 5 }); }
// seed the preddisc track's pantry history directly: {day, kcal, freshDays}
function seedPantry(g, c, rows) {
  const tr = c._pcTrack;
  for (const [day, kcal, fd] of rows) tr.pantry.push({ day, kcal, freshDays: fd });
}
// seed trailing-7d gorge telemetry on the predation track
function seedGorge(g, c, nights) {
  const pt = c._pcTrack.ptrack;
  for (const [day, kcal] of nights) {
    pt.gorgeNights.push({ day, totalGorged: kcal, events: [{ key: 'k' + day, id: 'apex1', wave: 5, got: kcal }] });
  }
}
// seed a lingering apex sample (the fence's evidence)
function seedLinger(g, c, day) {
  const pt = c._pcTrack.ptrack;
  pt.samples.push({ day, pantry: 10000, lingering: [{ key: 'apex-1', id: 'apex1', hp: 5000, wave: 5 }] });
}
// the mock's live pantry sampler reads state.village.pantry — keep it aligned
// with the seeded history so the trailing-7d drain is honest
function setPantryKcal(g, kcal) { g.state.village.pantry = [{ kcalEach: kcal, units: 1 }]; }
const fakeParent = {
  id: 'fakeparent',
  daily(Game, ctx) {
    ctx.parentDaily = (ctx.parentDaily || 0) + 1;
    Game.travelTo(5, 5); Game.travelTo(0, 0); Game.proposeLink('v9', {});
    return 'daily-ret';
  },
  upkeep(Game, ctx) {
    ctx.parentUpkeep = (ctx.parentUpkeep || 0) + 1;
    Game.travelTo(6, 6);
    return 'upkeep-ret';
  },
};

delete process.env.PREDCOND;
const W = predcondMod;
const layered = W.withPredcond(fakeParent, 'testlayer', 'test desc');

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
t('R1 gate-off daily delegates identically, no tracking state', () => {
  delete process.env.PREDCOND;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  const r1 = layered.daily(g1, c1);
  const r2 = fakeParent.daily(g2, c2);
  const assert = require('assert');
  assert.strictEqual(r1, r2);
  assert.deepStrictEqual(g1.calls, g2.calls, 'verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._pcTrack, undefined, 'tracking state must not be written gate-off');
  assert.strictEqual(c1._wcEngaged, undefined);
});
t('R1 gate-off upkeep delegates identically', () => {
  delete process.env.PREDCOND;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  const assert = require('assert');
  assert.strictEqual(layered.upkeep(g1, c1), fakeParent.upkeep(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls);
});

// R2 (RED): gate on, wave-5 never unlocks -> passive tracking only
t('R2 gate-on pre-window: deaths/successions/pantry tracked, posture never engages', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 3 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 12;
  cs(g, 9, 'wolfA');
  for (let i = 0; i < 3; i++) {
    g.state.scholar.villagerId = 'v' + (i + 1);
    g.state.scholar.day = 10 + i;
    if (i > 0) cs(g, 10 + i, 'wolfA');
    layered.daily(g, c);
  }
  assert.strictEqual(c._wcEngaged, undefined, 'must not engage pre-window');
  assert.strictEqual((c._pcDeaths || []).length, 2, 'should passively track 2 deaths');
  assert.strictEqual((c._pcSuccessions || []).length, 2, 'should track successions');
  assert.strictEqual(c._pcSuccessions[1].killer, 'wolfA', 'killer attribution from combat_start');
  assert.ok((c._pcTrack.pantry || []).length >= 3, 'should track pantry samples');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 6, 'travel must pass through pre-window, got ' + trav.length);
  delete process.env.PREDCOND;
});

// R3 (RED): attrition at wave-5 — 2 deaths 30d apart, healthy pantry -> NO engage
t('R3 attrition (non-accelerating deaths, healthy pantry) at wave-5: no engage', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 40; layered.daily(g, c);
  cs(g, 69, 'wolfA');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 99, 'wolfB');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 100; layered.daily(g, c);
  g.state.scholar.day = 101; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, undefined, 'must not engage on non-accelerating attrition');
  delete process.env.PREDCOND;
});

// R4 (RED): a single marker alone never engages
t('R4 single marker (acceleration alone, healthy pantry) does not engage', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 40; layered.daily(g, c);
  cs(g, 69, 'wolfA');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 74, 'wolfB');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 75; layered.daily(g, c);
  assert.ok((c._pcMarkerHist || []).some(h => h.markers.includes('death-acceleration')), 'acceleration marker should be recorded');
  assert.strictEqual(c._wcEngaged, undefined, 'single marker must not engage');
  delete process.env.PREDCOND;
});
t('R4 single marker (pantry-trajectory alone, no deaths) does not engage', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0; g.state.scholar.day = 62; layered.daily(g, c);
  assert.ok((c._pcMarkerHist || []).some(h => h.markers.includes('pantry-trajectory')), 'pantry marker should be recorded');
  assert.strictEqual(c._wcEngaged, undefined, 'pantry alone must not engage');
  delete process.env.PREDCOND;
});

// R5 (RED): the r28 lesson as a RED — a pantry-INCOME engage must NOT pin travel
t('R5 pantry-income engage: ranging stays OPEN — no walk-home, travel passes', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'precondition: engaged');
  assert.strictEqual(c._pcType, 'pantry-income', 'no gorge -> income, got ' + c._pcType);
  assert.strictEqual(c.wcHomeReturns || 0, 0, 'pantry-income must NOT walk home');
  assert.strictEqual(c.wcMonsterTileDeclined || 0, 0, 'pantry-income must not decline travel');
  assert.strictEqual(c.wcFarTravelDeclined || 0, 0, 'pantry-income must not decline travel');
  delete process.env.PREDCOND;
});

// G1: combat spiral (acceleration + feed, healthy pantry) -> engage combat
t('G1 combat spiral (acceleration + feed) engages homebound brace', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5, _monsters: { '5,5': { id: 'm5' } } }), c = mockCtx();
  layered.setup(g, c);
  g.map.px = 0; g.map.py = 0; // stranded
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  cs(g, 69, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 71, 'howlerX');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 71; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage on 2 combat markers');
  assert.strictEqual(c._pcType, 'combat', 'type must be combat, got ' + c._pcType);
  assert.deepStrictEqual(c._pcEngageTypes, ['combat']);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /spiral/.test(s)), 'engage line must say spiral');
  assert.ok(says.some(s => /death-acceleration/.test(s) && /succession-feed/.test(s)), 'engage line must name both markers');
  assert.ok(says.some(s => /braces/.test(s)), 'combat engage must read as a brace');
  const trav = g.calls.filter(k => k[0] === 'travelTo').map(k => [k[1], k[2]]);
  assert.deepStrictEqual(trav, [[5, 5], [0, 0], [5, 5], [0, 0], [4, 4]],
    'expected pre-engage passes + walk-home to haven, got ' + JSON.stringify(trav));
  assert.strictEqual(c.wcMonsterTileDeclined, 1, 'monster-tile decline, got ' + c.wcMonsterTileDeclined);
  assert.strictEqual(c.wcFarTravelDeclined, 1, 'far-travel decline, got ' + c.wcFarTravelDeclined);
  assert.strictEqual(c.wcHomeReturns, 1, 'walk-home counted');
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 2, '2 pre-engage proposals pass, the engaged one pauses');
  assert.strictEqual(c.wcProposalsPaused, 1);
  delete process.env.PREDCOND;
});

// G2: pantry spiral without gorge -> pantry-income: ranging open, extra forage
t('G2 pantry-income engage: ranging for food, extra forage trip, no walk-home', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage on acceleration + pantry-trajectory');
  assert.strictEqual(c._pcType, 'pantry-income', 'type must be pantry-income, got ' + c._pcType);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /pantry-trajectory/.test(s) && /ranging for food/.test(s)), 'engage line must name pantry-trajectory and the ranging beat');
  assert.ok(!says.some(s => /braces/.test(s)), 'pantry engage must NOT read as a brace');
  const forages = g.calls.filter(k => k[0] === 'doAction' && k[1] === 'forage');
  assert.ok(forages.length >= 1, 'extra forage trip must fire, got ' + forages.length);
  assert.strictEqual(c.wvForageTrips, 1, 'extra trip counted once, got ' + c.wvForageTrips);
  delete process.env.PREDCOND;
});

// G3: pantry spiral WITH raid telemetry -> pantry-raid: brace+conserve, scope cut
t('G3 pantry-raid engage: scope cut — brace+conserve, no top-up feast, apex fenced', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  // a pantry collapse in the track history with heavy gorge behind it
  seedPantry(g, c, [[54, 40000, 12], [56, 32000, 9], [58, 24000, 6], [60, 16000, 4], [61, 13000, 3.2]]);
  seedGorge(g, c, [[57, 4400], [58, 4400], [59, 4400], [60, 4400], [61, 4400]]);
  seedLinger(g, c, 61);
  g._fresh = 2.4; // still falling
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; setPantryKcal(g, 16000); layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; setPantryKcal(g, 13000); layered.daily(g, c);
  g._fresh = 1.6;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; setPantryKcal(g, 10000); layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage on accel + pantry-trajectory');
  assert.strictEqual(c._pcType, 'pantry-raid', 'raid telemetry -> pantry-raid, got ' + c._pcType);
  const cls = c._pcLastClass;
  assert.ok(cls && cls.cls === 'predation', 'classifier must read predation, got ' + JSON.stringify(cls));
  assert.ok(cls.p7.raidExplains7d >= 0.40, 'raidExplains7d >= 0.40, got ' + cls.p7.raidExplains7d);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /RAID PREDATION/.test(s) && /endure it/.test(s)), 'scope-cut beat must name predation and say endure it');
  assert.ok(says.some(s => /apex-class/.test(s)), 'beat must fence the apex lingerer');
  // brace verbs: walk-home + guarded travel
  assert.strictEqual(c.wcHomeReturns, 1, 'brace: walk-home fires');
  assert.ok((c.wcMonsterTileDeclined || 0) + (c.wcFarTravelDeclined || 0) >= 1, 'brace: travel guarded');
  // conserve verbs: NO top-up feast even vs a wave-5 haven threat at dusk
  const g2 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c2 = mockCtx();
  c2._pcEngaged = true; c2._pcType = 'pantry-raid'; c2._pcTrack = { pantry: [], ptrack: { gorgeNights: [], samples: [] } };
  layered.upkeep(g2, c2);
  assert.strictEqual(g2.calls.filter(k => k[0] === 'hostFeast').length, 0, 'pantry-raid must never feast the threat (conserve)');
  // THE APEX FENCE: no engagement verb ever fires
  assert.strictEqual(g.calls.filter(k => k[0] === 'triggerEncounter').length, 0, 'never engages the lingerer');
  delete process.env.PREDCOND;
});

// G4: mixed (0.15 <= raidExplains < 0.40) -> combat posture wins
t('G4 mixed classification resolves to the combat posture', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  seedPantry(g, c, [[54, 40000, 12], [56, 34000, 9], [58, 28000, 6], [60, 22000, 4], [61, 20000, 3.2]]);
  seedGorge(g, c, [[60, 2500], [61, 2500]]); // 5000 kcal vs 22000 drain = 0.227 -> mixed
  g._fresh = 2.4;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; setPantryKcal(g, 22000); layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; setPantryKcal(g, 20000); layered.daily(g, c);
  g._fresh = 1.6;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; setPantryKcal(g, 18000); layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage');
  assert.strictEqual(c._pcType, 'mixed', 'mixed telemetry -> mixed, got ' + c._pcType);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /tie-break/.test(s)), 'mixed engage must name the tie-break');
  assert.strictEqual(c.wcHomeReturns, 1, 'mixed: brace family walks home');
  assert.ok((c.wcMonsterTileDeclined || 0) + (c.wcFarTravelDeclined || 0) >= 1, 'mixed: travel guarded');
  // top-up feast IS allowed on mixed (combat-posture-wins)
  const g2 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c2 = mockCtx();
  c2._pcEngaged = true; c2._pcType = 'mixed'; c2._pcTrack = { pantry: [], ptrack: { gorgeNights: [], samples: [] } };
  layered.upkeep(g2, c2);
  assert.strictEqual(g2.calls.filter(k => k[0] === 'hostFeast').length, 1, 'mixed may top-up feast the threat');
  delete process.env.PREDCOND;
});

// G5: travelGuard direct
t('G5 travelGuard: monster/far declined; haven/adjacent/homeward/combatExit pass; income open', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5, _monsters: { '6,4': { id: 'm2' } } }), c = mockCtx();
  c._pcEngaged = true; c._pcType = 'combat';
  g.map.px = 6; g.map.py = 4;
  assert.strictEqual(W.travelGuard(g, c, 6, 4, false), 'monster', 'monster-active wild tile declined');
  assert.strictEqual(W.travelGuard(g, c, 0, 0, false), 'far', 'far tile declined');
  assert.strictEqual(W.travelGuard(g, c, 5, 4, false), null, 'adjacent homeward hop passes');
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), null, 'haven hop passes');
  g._monsters = { '4,4': { id: 'm5' } };
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), null, 'haven defense always engages');
  assert.strictEqual(W.travelGuard(g, c, 7, 4, true), null, 'combatExit always passes');
  c._pcType = 'pantry-income';
  assert.strictEqual(W.travelGuard(g, c, 6, 4, false), null, 'pantry-income: ranging open');
  delete process.env.PREDCOND;
});

// G6: dusk top-up feast gates
t('G6 top-up feast fires at dusk vs wave-5 haven threat on combat posture', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c = mockCtx();
  c._pcEngaged = true; c._pcType = 'combat';
  c._pcTrack = { pantry: [], ptrack: { gorgeNights: [], samples: [] } };
  layered.upkeep(g, c);
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1);
  assert.strictEqual(c.wcTopUpFeasts, 1);
  layered.upkeep(g, c);
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1, 'one feast per day');
  delete process.env.PREDCOND;
});
t('G6 no top-up: feasted / no-threat / thin-buffer / not-dusk / disengaged', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const mk = (over) => { const g = mockGame(over), c = mockCtx();
    c._pcEngaged = true; c._pcType = 'combat';
    c._pcTrack = { pantry: [], ptrack: { gorgeNights: [], samples: [] } };
    return [g, c]; };
  let [g1, c1] = mk({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: true });
  layered.upkeep(g1, c1);
  assert.strictEqual(g1.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast when feasted');
  let [g2, c2] = mk({ _wave: 5, _feasted: false });
  layered.upkeep(g2, c2);
  assert.strictEqual(g2.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast with no threat');
  let [g3, c3] = mk({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false, _plan: { ok: true, have: 1000, cost: 2000 } });
  layered.upkeep(g3, c3);
  assert.strictEqual(g3.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast into famine');
  let [g4, c4] = mk({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false });
  g4.dayPart = 0;
  layered.upkeep(g4, c4);
  assert.strictEqual(g4.calls.filter(k => k[0] === 'hostFeast').length, 0, 'dusk only');
  const g5 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c5 = mockCtx();
  c5._pcTrack = { pantry: [], ptrack: { gorgeNights: [], samples: [] } };
  layered.upkeep(g5, c5); // not engaged
  assert.strictEqual(g5.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast while disengaged');
  delete process.env.PREDCOND;
});

// G7: disengage after 7 rolling days <2 markers
t('G7 <2 markers for 7 rolling days: posture stands down, verbs release', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._pcType, 'pantry-income', 'precondition: pantry-engaged');
  g._fresh = 20;
  for (let d = 63; d <= 68; d++) { g.state.scholar.day = d; layered.daily(g, c); }
  assert.strictEqual(c._wcEngaged, true, '6 low days must not disengage');
  g.state.scholar.day = 69; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, false, 'should stand down on the 7th low day');
  assert.strictEqual(c._wcDisengages, 1);
  assert.strictEqual(c._pcType, null, 'type clears on disengage');
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /spiral has loosened/i.test(s)), 'release line missing');
  const travBefore = g.calls.filter(k => k[0] === 'travelTo').length;
  g.state.scholar.day = 70; layered.daily(g, c);
  const travAfter = g.calls.filter(k => k[0] === 'travelTo').length;
  assert.ok(travAfter > travBefore, 'verbs must release after disengage');
  delete process.env.PREDCOND;
});

// G8: latch — pre-unlock history engages at the unlock day, classified per markers
t('G8 markers from pre-unlock history engage at the latch, classified pantry-income', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 4 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 9;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 50; layered.daily(g, c);
  g._fresh = 4;
  cs(g, 55, 'howlerZ');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 56; layered.daily(g, c);
  g._fresh = 2;
  cs(g, 59, 'howlerY');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 60; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, undefined, 'pre-window: never engages');
  g._wave = 5; // the latch
  layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage at the latch from pre-unlock history');
  assert.strictEqual(c._wcEngages, 1);
  assert.strictEqual(c._pcType, 'pantry-income', 'accel + pantry-trajectory, no gorge -> pantry-income, got ' + c._pcType);
  delete process.env.PREDCOND;
});

// G9: haulCorpses fires at upkeep during pantry-income engage (and only then)
t('G9 upkeep hauls corpses while pantry-income engaged; silent otherwise', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const corpse = { id: 'c1', looted: false, kind: 'monster', items: [{ units: 2, kcalEach: 100 }] };
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._corpses = [corpse];
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._pcType, 'pantry-income', 'precondition');
  layered.upkeep(g, c);
  assert.ok((c.hauled || 0) >= 1, 'must haul the corpse while pantry-income engaged, got ' + c.hauled);
  assert.ok(g.calls.some(k => k[0] === 'corpseTakeItem'), 'corpseTakeItem must fire');
  const g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  g2._corpses = [{ id: 'c2', looted: false, kind: 'monster', items: [{ units: 1, kcalEach: 50 }] }];
  layered.setup(g2, c2);
  layered.upkeep(g2, c2);
  assert.strictEqual(c2.hauled || 0, 0, 'must not haul while disengaged');
  const g3 = mockGame({ _wave: 5 }), c3 = mockCtx();
  layered.setup(g3, c3);
  g3._corpses = [{ id: 'c3', looted: false, kind: 'monster', items: [{ units: 1, kcalEach: 50 }] }];
  c3._pcEngaged = true; c3._pcType = 'combat';
  c3._pcTrack = { pantry: [], ptrack: { gorgeNights: [], samples: [] } };
  layered.upkeep(g3, c3);
  assert.strictEqual(c3.hauled || 0, 0, 'must not haul while combat-engaged');
  delete process.env.PREDCOND;
});

// G10: re-engage after disengage re-classifies per the new markers
t('G10 re-engage re-classifies: pantry-income -> stand down -> combat re-engage', () => {
  process.env.PREDCOND = '1';
  const assert = require('assert');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.setup(g, c);
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._pcType, 'pantry-income', 'precondition: pantry-engaged');
  g._fresh = 20;
  for (let d = 63; d <= 69; d++) { g.state.scholar.day = d; layered.daily(g, c); }
  assert.strictEqual(c._wcEngaged, false, 'precondition: disengaged');
  cs(g, 79, 'howlerQ');
  g.state.scholar.villagerId = 'v4'; g.state.scholar.day = 80; layered.daily(g, c);
  cs(g, 81, 'howlerQ');
  g.state.scholar.villagerId = 'v5'; g.state.scholar.day = 81; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should re-engage');
  assert.strictEqual(c._pcType, 'combat', 're-engage must re-classify combat, got ' + c._pcType);
  assert.deepStrictEqual(c._pcEngageTypes, ['pantry-income', 'combat']);
  delete process.env.PREDCOND;
});

// R1b (RED): the 2026-10-14 hook-drop bug — the wrapper must forward EVERY
// parent hook (fight/contest/...), not just the ones it overrides. Built
// from scratch once dropped leadfeast's `fight`, diverging trajectories
// pre-unlock. The gorgedrive Object.assign pattern pins this.
t('R1b hook surface: fight/contest forward to the parent', () => {
  const assert = require('assert');
  const { leadfeast } = require('./policies/feastscale');
  for (const k of Object.keys(leadfeast)) {
    if (typeof leadfeast[k] === 'function' && !['setup', 'daily', 'upkeep'].includes(k)) {
      assert.strictEqual(W.predcond[k], leadfeast[k], k + ' must forward to the parent, got ' +
        (typeof W.predcond[k]));
    }
  }
});

// frozen-rule unit checks
t('frozen rule: classifyPredation matches the preddisc thresholds', () => {
  const assert = require('assert');
  assert.strictEqual(W.classifyPredation({ raidExplains7d: 0.5, gorgeNights7d: 1, gorgeKcal7d: 1000 }), 'predation');
  assert.strictEqual(W.classifyPredation({ raidExplains7d: 0.1, gorgeNights7d: 3, gorgeKcal7d: 6000 }), 'predation');
  assert.strictEqual(W.classifyPredation({ raidExplains7d: 0.2, gorgeNights7d: 1, gorgeKcal7d: 1000 }), 'mixed');
  assert.strictEqual(W.classifyPredation({ raidExplains7d: 0.05, gorgeNights7d: 0, gorgeKcal7d: 0 }), 'income');
  assert.deepStrictEqual(W.deathAccel([40, 70], 70).accel, false, '30d gap is not acceleration');
  assert.strictEqual(W.deathAccel([69, 75], 75).accel, true, '6d gap accelerates');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
