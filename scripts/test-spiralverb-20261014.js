#!/usr/bin/env node
// scripts/test-spiralverb-20261014.js — proof tests for the marker-type-
// matched spiral posture (scripts/policies/spiralverb.js, gate SPIRALVERB=1,
// default OFF), layered on leadfeast.
//
// THE BLANK (sim-findings SPIRAL-TYPE-MISMATCH; evidence/2026-10-14/
// sim-spiralcond.md): r28's spiralcond trigger was SELECTIVE (s22: 3 engage/
// 3 disengage cycles, +58d, survived 180) but its verbs mismatched the spiral
// TYPE: s44's spiral was a PANTRY collapse and the homebound posture pinned
// the scholar home, stopping the ranging income a starving village needs
// (-44d on a true spiral read). This arm keeps the r28 trigger (rebuilt from
// the preserved spec/proof) and keys the VERBS to the marker type:
//   COMBAT spiral (death-acceleration and/or succession-feed dominate, pantry
//     absent — or all three firing): the r28 homebound verbs.
//   PANTRY spiral (pantry-trajectory fires without BOTH combat markers):
//     haul/forage priority — the scholar ranges OUT (no travel guard), an
//     extra forage trip, corpse hauling at upkeep, courts paused.
//   MIXED (all three markers): combat posture wins on scholar safety
//     (documented tie-break).
//
// THE TRIGGER (rebuilt from the r28 preserved spec —
// evidence/2026-10-14/sim-spiralcond.md + scripts/test-spiralcond-20261014.js):
// post wave-5 unlock, each day evaluates three spiral markers over a trailing
// 21d window from honest engine reads:
//   (a) death-acceleration — two scholar deaths in-window, 2nd within 14d;
//   (b) pantry-trajectory — pantry fresh-days < 3 AND falling;
//   (c) succession-feed — successor dies to the SAME monster within 48h
//       (combat_start pairing-lite; null attribution never fires).
// ENGAGE iff >=2 markers fire (latch evaluates pre-unlock history).
// DISENGAGE when <2 markers fire for 7 rolling days.
//
// RED-verified where honest:
//   R1 (RED): gate OFF -> daily/upkeep delegate byte-identically to the
//       parent (same verb sequence, same return); NO tracking state written.
//   R2 (RED): gate ON but wave-5 never unlocks -> deaths, successions and
//       pantry tracked passively, nothing engages (pre-window posture inert).
//   R3 (RED): gate ON, wave-5, ATTRITION (2 scholar deaths but NOT
//       accelerating — 30d apart; healthy pantry; no feed) -> NO engage.
//       The s22 lesson: a count is not a spiral.
//   R4 (RED): single marker alone never engages (acceleration alone with
//       healthy pantry; pantry-trajectory alone with no deaths).
// GREEN:
//   G1: combat spiral (acceleration + feed, healthy pantry) -> engages,
//       type=combat, brace line names both markers, walk-home, travel guard
//       declines, proposals pause.
//   G2: pantry spiral (acceleration + falling fresh-days) -> engages,
//       type=pantry, line names pantry-trajectory and the ranging-for-food
//       beat; travel PASSES (no pin — the s44 fix); an extra forage trip
//       fires; proposals pause; NO walk-home.
//   G3: all-three mixed -> engages, type=combat (the documented tie-break).
//   G4: disengage fires after 7 rolling days with <2 markers on a pantry
//       engage (release line); verbs release (travel passes again).
//   G5: travelGuard direct (monster/far declined with codes; haven /
//       adjacent / homeward / combatExit pass).
//   G6: dusk top-up feast gates on the combat posture (threat + unfeasted +
//       buffer -> feast; already-feasted / no-threat / thin-buffer /
//       not-dusk / disengaged / pantry-engaged stay silent).
//   G7: succession-feed marker selectivity (same-monster 48h fires;
//       different monster / >48h / no attribution stay silent).
//   G8: latch evaluation — pre-unlock history engages at the unlock day,
//       classified pantry when the pantry marker fired pre-unlock.
//   G9: haulCorpses fires at upkeep during a pantry engage (and only then).
//   G10: re-engage after disengage re-classifies the type per the new
//       marker set.
'use strict';
// KILL-PROTOCOL NOTE (r29): the spiralverb layer was deleted per the kill
// protocol (NO-GO at pilot — scripts/policies/spiralverb.js no longer
// exists). The mechanism proof below ran 18/18 GREEN pre-kill (see
// evidence/2026-10-14/sim-spiralverb.md), including a verb-fork mutation
// check. When the layer is absent this file degrades gracefully instead of
// MODULE_NOT_FOUND (kill-protocol MODULE_NOT_FOUND hazard pattern).
let spiralverbMod = null;
try { spiralverbMod = require('./policies/spiralverb'); } catch (e) { /* deleted per kill protocol */ }
if (!spiralverbMod) {
  console.log('INFO-SKIP: spiralverb layer deleted per kill protocol (NO-GO at pilot); mechanism was 18/18 GREEN pre-kill — see evidence/2026-10-14/sim-spiralverb.md');
  process.exit(0);
}
const assert = require('assert');

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
      village: { px: 4, py: 4 },
      telemetry: [],
    },
    map: { px: 4, py: 4 },
    dayPart: 2,
    _wave: 1, _monsters: {}, _feasted: false,
    _plan: { ok: true, have: 100000, cost: 2000 }, _fresh: 20,
    _corpses: [],
    data: { monsters: [{ id: 'm5', wave: 5 }, { id: 'm2', wave: 2 }] },
    unlockedWave() { return this._wave; },
    monsterAt(x, y) { return this._monsters[x + ',' + y] || null; },
    pantryFreshDays() { return this._fresh; },
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
    // forage-trip surface (competent.forageTripSeedFirst)
    travelTargets() { return [{ x: 5, y: 5, d: 2 }]; },
    tileAt(x, y) { return (x === 5 && y === 5) ? { type: 'grove', stock: 5, revealed: true } : { type: 'field', stock: 0 }; },
    travelBlockage(x, y) { return null; },
    doAction(name, opts) { calls.push(['doAction', name]); return name === 'forage'; },
    playerTile() { return { type: 'grove' }; },
    hasItem(id) { return false; },
    // haul surface (haul.haulCorpses)
    corpses() { return this._corpses; },
    corpseTakeItem(cid, i) { calls.push(['corpseTakeItem', cid, i]); return true; },
    hasCuttingTool() { return false; },
    cleanCarcass() { calls.push(['cleanCarcass']); return 0; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
// combat_start tele helper for killer attribution
function cs(g, day, mid) { g.state.telemetry.push({ type: 'combat_start', day, vs: mid, wave: 5 }); }
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

delete process.env.SPIRALVERB;
const W = spiralverbMod;
const layered = W.withSpiralVerb(fakeParent, 'testlayer', 'test desc');

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
t('R1 gate-off daily delegates identically, no tracking state', () => {
  delete process.env.SPIRALVERB;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  const r1 = layered.daily(g1, c1);
  const r2 = fakeParent.daily(g2, c2);
  assert.strictEqual(r1, r2);
  assert.deepStrictEqual(g1.calls, g2.calls, 'verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._svLastVid, undefined, 'tracking state must not be written gate-off');
  assert.strictEqual(c1._wcEngaged, undefined);
});
t('R1 gate-off upkeep delegates identically', () => {
  delete process.env.SPIRALVERB;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  assert.strictEqual(layered.upkeep(g1, c1), fakeParent.upkeep(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls);
});

// R2 (RED): gate on, wave-5 never unlocks -> passive tracking only
t('R2 gate-on pre-window: deaths/successions/pantry tracked, posture never engages', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 3 }), c = mockCtx();
  g._fresh = 12;
  cs(g, 9, 'wolfA');
  for (let i = 0; i < 3; i++) {
    g.state.scholar.villagerId = 'v' + (i + 1);
    g.state.scholar.day = 10 + i;
    if (i > 0) cs(g, 10 + i, 'wolfA');
    layered.daily(g, c);
  }
  assert.strictEqual(c._wcEngaged, undefined, 'must not engage pre-window');
  assert.strictEqual(c.wcActive, undefined);
  assert.strictEqual((c._scScholarDeaths || []).length, 2, 'should passively track 2 deaths');
  assert.strictEqual((c._scSuccessions || []).length, 2, 'should track successions');
  assert.strictEqual(c._scSuccessions[1].killer, 'wolfA', 'killer attribution from combat_start, got ' + c._scSuccessions[1].killer);
  assert.strictEqual((c._scPantryHist || []).length, 3, 'should track pantry samples');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 6, 'travel must pass through pre-window');
  delete process.env.SPIRALVERB;
});

// R3 (RED): attrition at wave-5 — 2 deaths but NOT accelerating (30d apart),
// healthy pantry, no feed -> NO engage (the s22 lesson)
t('R3 attrition (non-accelerating deaths, healthy pantry) at wave-5: no engage', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 40; layered.daily(g, c);
  cs(g, 69, 'wolfA');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 99, 'wolfB');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 100; layered.daily(g, c);
  g.state.scholar.day = 101; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, undefined, 'must not engage on non-accelerating attrition');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 8, 'travel must pass through when strong, got ' + trav.length);
  delete process.env.SPIRALVERB;
});

// R4 (RED): a single marker alone never engages
t('R4 single marker (acceleration alone, healthy pantry) does not engage', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 40; layered.daily(g, c);
  cs(g, 69, 'wolfA');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 74, 'wolfB');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 75; layered.daily(g, c);
  assert.ok((c._scMarkerHist || []).some(h => h.markers.includes('death-acceleration')), 'acceleration marker should be recorded');
  assert.strictEqual(c._wcEngaged, undefined, 'single marker must not engage');
  delete process.env.SPIRALVERB;
});
t('R4 single marker (pantry-trajectory alone, no deaths) does not engage', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0; g.state.scholar.day = 62; layered.daily(g, c);
  assert.ok((c._scMarkerHist || []).some(h => h.markers.includes('pantry-trajectory')), 'pantry marker should be recorded');
  assert.strictEqual(c._wcEngaged, undefined, 'pantry alone must not engage');
  delete process.env.SPIRALVERB;
});

// G1: combat spiral (acceleration + feed, healthy pantry) -> engage, type=combat
t('G1 combat spiral (acceleration + feed) engages homebound with named markers', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5, _monsters: { '5,5': { id: 'm5' } } }), c = mockCtx();
  g.map.px = 0; g.map.py = 0; // stranded
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  cs(g, 69, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 71, 'howlerX');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 71; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage on 2 combat markers');
  assert.strictEqual(c.wcActive, 1);
  assert.strictEqual(c._wcEngages, 1);
  assert.strictEqual(c._svEngageType, 'combat', 'type must be combat, got ' + c._svEngageType);
  assert.deepStrictEqual(c._svEngageTypes, ['combat']);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /spiral/.test(s)), 'engage line must say spiral: ' + JSON.stringify(says));
  assert.ok(says.some(s => /death-acceleration/.test(s) && /succession-feed/.test(s)),
    'engage line must name both markers: ' + JSON.stringify(says));
  assert.ok(says.some(s => /braces/.test(s)), 'combat engage must read as a brace: ' + JSON.stringify(says));
  // engaged day: parent hops declined (never reach the engine); walk-home to haven does
  const trav = g.calls.filter(k => k[0] === 'travelTo').map(k => [k[1], k[2]]);
  assert.deepStrictEqual(trav, [[5, 5], [0, 0], [5, 5], [0, 0], [4, 4]],
    'expected pre-engage passes + walk-home to haven, got ' + JSON.stringify(trav));
  assert.strictEqual(c.wcMonsterTileDeclined, 1, 'monster-tile decline, got ' + c.wcMonsterTileDeclined);
  assert.strictEqual(c.wcFarTravelDeclined, 1, 'far-travel decline, got ' + c.wcFarTravelDeclined);
  assert.strictEqual(c.wcHomeReturns, 1, 'walk-home counted');
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 2, '2 pre-engage proposals pass, the engaged one pauses');
  assert.strictEqual(c.wcProposalsPaused, 1);
  delete process.env.SPIRALVERB;
});

// G2: pantry spiral (acceleration + falling fresh-days) -> engage, type=pantry
t('G2 pantry spiral engages ranging-for-food: travel passes, extra forage trip, no walk-home', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage on acceleration + pantry-trajectory');
  assert.strictEqual(c._svEngageType, 'pantry', 'type must be pantry, got ' + c._svEngageType);
  assert.deepStrictEqual(c._svEngageTypes, ['pantry']);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /pantry-trajectory/.test(s) && /ranging for food/.test(s)),
    'engage line must name pantry-trajectory and the ranging beat: ' + JSON.stringify(says));
  assert.ok(!says.some(s => /braces/.test(s)), 'pantry engage must NOT read as a brace');
  // THE s44 FIX: travel passes — no pinning. Parent hops (5,5),(0,0) reach the
  // engine on the engaged day, plus the extra forage trip's own travel.
  assert.strictEqual(c.wcMonsterTileDeclined || 0, 0, 'pantry posture must not decline travel');
  assert.strictEqual(c.wcFarTravelDeclined || 0, 0, 'pantry posture must not decline travel');
  const forages = g.calls.filter(k => k[0] === 'doAction' && k[1] === 'forage');
  assert.ok(forages.length >= 1, 'extra forage trip must fire, got ' + forages.length);
  assert.strictEqual(c.wvForageTrips, 1, 'extra trip counted once, got ' + c.wvForageTrips);
  assert.strictEqual(c.wcHomeReturns || 0, 0, 'pantry engage must NOT walk home');
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 2, '2 pre-engage proposals pass, the engaged one pauses');
  assert.strictEqual(c.wcProposalsPaused, 1, 'courts pause while the bins echo');
  delete process.env.SPIRALVERB;
});

// G3: all-three mixed -> engage, type=combat (documented tie-break)
t('G3 all-three mixed markers engage as combat (tie-break: scholar safety)', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5, _monsters: { '5,5': { id: 'm5' } } }), c = mockCtx();
  g.map.px = 0; g.map.py = 0;
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  cs(g, 60, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  cs(g, 62, 'howlerX');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage on 3 markers');
  assert.strictEqual(c._svEngageType, 'combat', 'mixed must resolve combat, got ' + c._svEngageType);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /braces/.test(s)), 'mixed engage reads as a brace');
  assert.strictEqual(c.wcMonsterTileDeclined, 1, 'combat verbs: travel guarded');
  delete process.env.SPIRALVERB;
});

// G4: disengage after 7 rolling days <2 markers on a pantry engage
t('G4 <2 markers for 7 rolling days on a pantry engage: posture stands down', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._svEngageType, 'pantry', 'precondition: pantry-engaged');
  // pantry recovers -> only acceleration fires (<2); 6 days: still engaged
  g._fresh = 20;
  for (let d = 63; d <= 68; d++) { g.state.scholar.day = d; layered.daily(g, c); }
  assert.strictEqual(c._wcEngaged, true, '6 low days must not disengage');
  // 7th low day -> stand down
  g.state.scholar.day = 69; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, false, 'should stand down on the 7th low day');
  assert.strictEqual(c._wcDisengages, 1);
  assert.strictEqual(c._svEngageType, null, 'type clears on disengage');
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /spiral has loosened/i.test(s)), 'release line missing: ' + JSON.stringify(says));
  const travBefore = g.calls.filter(k => k[0] === 'travelTo').length;
  g.state.scholar.day = 70; layered.daily(g, c);
  const travAfter = g.calls.filter(k => k[0] === 'travelTo').length;
  assert.ok(travAfter > travBefore, 'verbs must release after disengage');
  delete process.env.SPIRALVERB;
});

// G5: travelGuard direct
t('G5 travelGuard: monster/far declined with codes; haven/adjacent/homeward/combatExit pass', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5, _monsters: { '6,4': { id: 'm2' } } }), c = mockCtx();
  g.map.px = 6; g.map.py = 4; // stranded 2 out
  assert.strictEqual(W.travelGuard(g, c, 6, 4, false), 'monster', 'monster-active wild tile declined');
  assert.strictEqual(W.travelGuard(g, c, 0, 0, false), 'far', 'far tile declined');
  assert.strictEqual(W.travelGuard(g, c, 5, 4, false), null, 'adjacent homeward hop passes');
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), null, 'haven hop passes');
  g._monsters = { '4,4': { id: 'm5' } };
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), null, 'haven defense always engages');
  assert.strictEqual(W.travelGuard(g, c, 7, 4, true), null, 'combatExit always passes');
  delete process.env.SPIRALVERB;
});

// G6: dusk top-up feast gates on the combat posture
t('G6 top-up feast fires at dusk vs wave-5 haven threat when combat-engaged', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c = mockCtx();
  c._wcEngaged = true; c._svEngageType = 'combat';
  layered.upkeep(g, c);
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1);
  assert.strictEqual(c.wcTopUpFeasts, 1);
  layered.upkeep(g, c); // same day -> one/day gate
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1, 'one feast per day');
  delete process.env.SPIRALVERB;
});
t('G6 no top-up when feasted / no threat / thin buffer / not dusk / disengaged / pantry-engaged', () => {
  process.env.SPIRALVERB = '1';
  const g1 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: true }), c1 = mockCtx();
  c1._wcEngaged = true; c1._svEngageType = 'combat'; layered.upkeep(g1, c1);
  assert.strictEqual(g1.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast when feasted');
  const g2 = mockGame({ _wave: 5, _feasted: false }), c2 = mockCtx();
  c2._wcEngaged = true; c2._svEngageType = 'combat'; layered.upkeep(g2, c2);
  assert.strictEqual(g2.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast with no threat');
  const g3 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false, _plan: { ok: true, have: 1000, cost: 2000 } }), c3 = mockCtx();
  c3._wcEngaged = true; c3._svEngageType = 'combat'; layered.upkeep(g3, c3);
  assert.strictEqual(g3.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast into famine');
  const g4 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c4 = mockCtx();
  g4.dayPart = 0; c4._wcEngaged = true; c4._svEngageType = 'combat'; layered.upkeep(g4, c4);
  assert.strictEqual(g4.calls.filter(k => k[0] === 'hostFeast').length, 0, 'dusk only');
  const g5 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c5 = mockCtx();
  layered.upkeep(g5, c5); // not engaged
  assert.strictEqual(g5.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast while disengaged');
  const g6 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c6 = mockCtx();
  c6._wcEngaged = true; c6._svEngageType = 'pantry'; layered.upkeep(g6, c6);
  assert.strictEqual(g6.calls.filter(k => k[0] === 'hostFeast').length, 0, 'pantry posture never feasts the threat');
  delete process.env.SPIRALVERB;
});

// G7: succession-feed marker selectivity
t('G7 feed marker fires on same-monster chain within 48h', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  cs(g, 69, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 71, 'howlerX');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 71; layered.daily(g, c);
  assert.deepStrictEqual(c._scFeedDays, [71], 'feed should fire on day 71, got ' + JSON.stringify(c._scFeedDays));
  assert.ok((c._scMarkerHist || []).some(h => h.markers.includes('succession-feed')), 'feed marker recorded');
  delete process.env.SPIRALVERB;
});
t('G7 feed stays silent: different monster / >48h / no attribution', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  cs(g, 69, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 71, 'howlerY');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 71; layered.daily(g, c);
  assert.strictEqual((c._scFeedDays || []).length, 0, 'different monster must not feed');
  const g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  g2._fresh = 20;
  g2.state.scholar.villagerId = 'v1'; g2.state.scholar.day = 60; layered.daily(g2, c2);
  cs(g2, 69, 'howlerX');
  g2.state.scholar.villagerId = 'v2'; g2.state.scholar.day = 70; layered.daily(g2, c2);
  cs(g2, 75, 'howlerX');
  g2.state.scholar.villagerId = 'v3'; g2.state.scholar.day = 76; layered.daily(g2, c2);
  assert.strictEqual((c2._scFeedDays || []).length, 0, '>48h must not feed');
  const g3 = mockGame({ _wave: 5 }), c3 = mockCtx();
  g3._fresh = 20;
  g3.state.scholar.villagerId = 'v1'; g3.state.scholar.day = 60; layered.daily(g3, c3);
  g3.state.scholar.villagerId = 'v2'; g3.state.scholar.day = 70; layered.daily(g3, c3);
  g3.state.scholar.villagerId = 'v3'; g3.state.scholar.day = 71; layered.daily(g3, c3);
  assert.strictEqual((c3._scFeedDays || []).length, 0, 'no attribution must not feed');
  delete process.env.SPIRALVERB;
});

// G8: latch evaluation — pre-unlock history engages at the unlock day, type=pantry
t('G8 markers from pre-unlock history engage at the latch, classified pantry', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 4 }), c = mockCtx(); // wave 4: window not open
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
  assert.strictEqual(c._svEngageType, 'pantry', 'accel + pantry-trajectory classifies pantry, got ' + c._svEngageType);
  delete process.env.SPIRALVERB;
});

// G9: haulCorpses fires at upkeep during a pantry engage (and only then)
t('G9 upkeep hauls corpses while pantry-engaged; silent otherwise', () => {
  process.env.SPIRALVERB = '1';
  const corpse = { id: 'c1', looted: false, kind: 'monster', items: [{ units: 2, kcalEach: 100 }] };
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._corpses = [corpse];
  // drive a real pantry engage (G2 fixture)
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._svEngageType, 'pantry', 'precondition');
  layered.upkeep(g, c);
  assert.ok((c.hauled || 0) >= 1, 'must haul the corpse while pantry-engaged, got ' + c.hauled);
  assert.ok(g.calls.some(k => k[0] === 'corpseTakeItem'), 'corpseTakeItem must fire');
  // disengaged: silent
  const g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  g2._corpses = [{ id: 'c2', looted: false, kind: 'monster', items: [{ units: 1, kcalEach: 50 }] }];
  layered.upkeep(g2, c2);
  assert.strictEqual(c2.hauled || 0, 0, 'must not haul while disengaged');
  // combat-engaged: silent (the haul beat belongs to the pantry posture)
  const g3 = mockGame({ _wave: 5 }), c3 = mockCtx();
  g3._corpses = [{ id: 'c3', looted: false, kind: 'monster', items: [{ units: 1, kcalEach: 50 }] }];
  c3._wcEngaged = true; c3._svEngageType = 'combat';
  layered.upkeep(g3, c3);
  assert.strictEqual(c3.hauled || 0, 0, 'must not haul while combat-engaged');
  delete process.env.SPIRALVERB;
});

// G10: re-engage after disengage re-classifies the type per the new markers
t('G10 re-engage re-classifies: pantry engage -> stand down -> combat re-engage', () => {
  process.env.SPIRALVERB = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._svEngageType, 'pantry', 'precondition: pantry engage');
  // stand down: pantry recovers, deaths age out of the 14d accel gap
  g._fresh = 20;
  for (let d = 63; d <= 69; d++) { g.state.scholar.day = d; layered.daily(g, c); }
  assert.strictEqual(c._wcEngaged, false, 'precondition: disengaged');
  // fresh combat spiral: two quick deaths, same killer, healthy pantry
  cs(g, 79, 'howlerQ');
  g.state.scholar.villagerId = 'v4'; g.state.scholar.day = 80; layered.daily(g, c);
  cs(g, 81, 'howlerQ');
  g.state.scholar.villagerId = 'v5'; g.state.scholar.day = 81; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should re-engage');
  assert.strictEqual(c._svEngageType, 'combat', 're-engage must re-classify combat, got ' + c._svEngageType);
  assert.deepStrictEqual(c._svEngageTypes, ['pantry', 'combat']);
  delete process.env.SPIRALVERB;
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
