#!/usr/bin/env node
// scripts/test-spiralcond-20261014.js — proof tests for the SPIRAL-SHAPED
// conditional wave-5 survival posture (scripts/policies/spiralcond.js,
// gate SPIRALCOND=1, default OFF).
//
// THE DESIGN (pre-registered, evidence/2026-10-14/sim-spiralcond.md): post-
// unlock, engage the r24 posture verbs iff >=2 of three spiral markers fire
// within a trailing 21-day window:
//   (a) death acceleration — two scholar deaths, second within 14d of first;
//   (b) pantry trajectory — pantry fresh-days < 3 AND falling;
//   (c) succession feed — a successor dies to the SAME monster within 48h.
// Disengage when <2 markers for 7 rolling days. The named next design from
// the r27 wave5cond kill (death-COUNT trigger falsified on s22).
//
// RED-verified where honest:
//   R1 (RED): gate OFF -> daily/upkeep delegate byte-identically to the
//       parent (same verb sequence, same return); NO tracking state written.
//   R2 (RED): gate ON but wave-5 never unlocks -> deaths, successions and
//       pantry tracked passively, nothing engages (pre-window posture inert).
//   R3 (RED): gate ON, wave-5, ATTRITION (2 scholar deaths but NOT
//       accelerating — 30d apart; healthy pantry; no feed) -> NO engage.
//       The s22 lesson: a count is not a spiral.
//   R4 (RED): single marker alone never engages (feed alone; acceleration
//       alone with healthy pantry).
// GREEN:
//   G1: scripted spiral (acceleration + falling fresh-days) -> engages,
//       brace line names both markers, walk-home, travel guard declines,
//       proposals pause.
//   G2: disengage fires after 7 rolling days with <2 markers (release line).
//   G3: travel guard direct (monster tile / far declined; haven / adjacent /
//       homeward / combatExit pass).
//   G4: dusk top-up feast gates (threat + unfeasted + buffer -> feast;
//       already-feasted / no-threat / thin-buffer / not-dusk / one-per-day).
//   G5: succession-feed marker fires on scripted same-monster chain, stays
//       silent on different-monster / >48h / no-attribution cases.
//   G6: latch evaluation — markers from pre-unlock history engage at the
//       unlock day itself.
'use strict';
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
    state: { scholar: { day: 10, villagerId: 'v1' }, village: { px: 4, py: 4 }, telemetry: [] },
    map: { px: 4, py: 4 },
    dayPart: 2,
    _wave: 1, _monsters: {}, _feasted: false, _plan: { ok: true, have: 100000, cost: 2000 }, _fresh: 20,
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
    say(msg) { calls.push(['say', String(msg).slice(0, 200)]); },
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

delete process.env.SPIRALCOND;
const W = require('./policies/spiralcond');
const layered = W.withSpiralCond(fakeParent, 'testlayer');

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
t('R1 gate-off daily delegates identically, no tracking state', () => {
  delete process.env.SPIRALCOND;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  const r1 = layered.daily(g1, c1);
  const r2 = fakeParent.daily(g2, c2);
  assert.strictEqual(r1, r2);
  assert.deepStrictEqual(g1.calls, g2.calls, 'verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._scLastVid, undefined, 'tracking state must not be written gate-off');
  assert.strictEqual(c1.wcActive, undefined);
});
t('R1 gate-off upkeep delegates identically', () => {
  delete process.env.SPIRALCOND;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  assert.strictEqual(layered.upkeep(g1, c1), fakeParent.upkeep(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls);
});

// R2 (RED): gate on, wave-5 never unlocks -> passive tracking only
t('R2 gate-on pre-window: deaths/successions/pantry tracked, posture never engages', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 3 }), c = mockCtx();
  g._fresh = 12;
  cs(g, 9, 'wolfA');
  for (let i = 0; i < 3; i++) {
    g.state.scholar.villagerId = 'v' + (i + 1);
    g.state.scholar.day = 10 + i;
    if (i > 0) cs(g, 10 + i, 'wolfA'); // attribution inside each death's 2d window
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
  delete process.env.SPIRALCOND;
});

// R3 (RED): attrition at wave-5 — 2 deaths but NOT accelerating (30d apart),
// healthy pantry, no feed -> NO engage (the s22 lesson)
t('R3 attrition (non-accelerating deaths, healthy pantry) at wave-5: no engage', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 40; layered.daily(g, c);
  cs(g, 69, 'wolfA');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c); // death 1
  cs(g, 99, 'wolfB');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 100; layered.daily(g, c); // death 2, 30d gap
  g.state.scholar.day = 101; layered.daily(g, c);
  assert.strictEqual(c.wcActive, undefined, 'must not engage on non-accelerating attrition');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 8, 'travel must pass through when strong, got ' + trav.length);
  delete process.env.SPIRALCOND;
});

// R4 (RED): a single marker alone never engages
t('R4 single marker (acceleration alone, healthy pantry) does not engage', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 40; layered.daily(g, c);
  cs(g, 69, 'wolfA');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 74, 'wolfB');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 75; layered.daily(g, c); // 5d gap -> accel fires
  assert.ok((c._scMarkerHist || []).some(h => h.markers.includes('death-acceleration')), 'acceleration marker should be recorded');
  assert.strictEqual(c.wcActive, undefined, 'single marker must not engage');
  delete process.env.SPIRALCOND;
});

// G5: succession-feed marker selectivity
t('G5 feed marker fires on same-monster chain within 48h', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  cs(g, 69, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c); // P dies to howlerX
  cs(g, 71, 'howlerX');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 71; layered.daily(g, c); // successor dies same monster, 24h
  assert.deepStrictEqual(c._scFeedDays, [71], 'feed should fire on day 71, got ' + JSON.stringify(c._scFeedDays));
  assert.ok((c._scMarkerHist || []).some(h => h.markers.includes('succession-feed')), 'feed marker recorded');
  delete process.env.SPIRALCOND;
});
t('G5 feed stays silent: different monster / >48h / no attribution', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  cs(g, 69, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 71, 'howlerY'); // different monster
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 71; layered.daily(g, c);
  assert.strictEqual((c._scFeedDays || []).length, 0, 'different monster must not feed');
  const g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  g2._fresh = 20;
  g2.state.scholar.villagerId = 'v1'; g2.state.scholar.day = 60; layered.daily(g2, c2);
  cs(g2, 69, 'howlerX');
  g2.state.scholar.villagerId = 'v2'; g2.state.scholar.day = 70; layered.daily(g2, c2);
  cs(g2, 75, 'howlerX');
  g2.state.scholar.villagerId = 'v3'; g2.state.scholar.day = 76; layered.daily(g2, c2); // 6d > 48h
  assert.strictEqual((c2._scFeedDays || []).length, 0, '>48h must not feed');
  const g3 = mockGame({ _wave: 5 }), c3 = mockCtx();
  g3._fresh = 20;
  g3.state.scholar.villagerId = 'v1'; g3.state.scholar.day = 60; layered.daily(g3, c3);
  g3.state.scholar.villagerId = 'v2'; g3.state.scholar.day = 70; layered.daily(g3, c3); // no combat_start -> no attribution
  g3.state.scholar.villagerId = 'v3'; g3.state.scholar.day = 71; layered.daily(g3, c3);
  assert.strictEqual((c3._scFeedDays || []).length, 0, 'no attribution must not feed');
  delete process.env.SPIRALCOND;
});

// G1: scripted spiral (acceleration + falling pantry) -> engage
t('G1 spiral (acceleration + falling fresh-days) engages with named markers', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5, _monsters: { '5,5': { id: 'm5' } } }), c = mockCtx();
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c); // fresh 8
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c); // death 1, fresh falling
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c); // death 2 -> accel + pantry
  assert.strictEqual(c._wcEngaged, true, 'should engage on 2 markers');
  assert.strictEqual(c.wcActive, 1);
  assert.strictEqual(c._wcEngages, 1);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /spiral/.test(s)), 'engage line must say spiral, got ' + JSON.stringify(says));
  assert.ok(says.some(s => /death-acceleration/.test(s) && /pantry-trajectory/.test(s)),
    'engage line must name both markers: ' + JSON.stringify(says));
  // pre-engage days (60, 61) pass travel through; engaged day declines both
  // parent hops (never reach the engine) + walk-home from (0,0) to (1,1)
  const trav = g.calls.filter(k => k[0] === 'travelTo').map(k => [k[1], k[2]]);
  assert.deepStrictEqual(trav, [[5, 5], [0, 0], [5, 5], [0, 0], [1, 1]],
    'expected pre-engage passes + walk-home only, got ' + JSON.stringify(trav));
  assert.strictEqual(c.wcMonsterTileDeclined, 1);
  assert.strictEqual(c.wcFarTravelDeclined, 1);
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 2, '2 pre-engage proposals pass, the engaged one pauses');
  assert.strictEqual(c.wcProposalsPaused, 1);
  delete process.env.SPIRALCOND;
});

// G2: disengage after 7 rolling days below 2 markers
t('G2 <2 markers for 7 rolling days: posture stands down', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 8;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g._fresh = 2.5;
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c);
  g._fresh = 2.0;
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'precondition: engaged');
  // pantry recovers -> only acceleration fires (<2); 6 days: still engaged
  g._fresh = 20;
  for (let d = 63; d <= 68; d++) { g.state.scholar.day = d; layered.daily(g, c); }
  assert.strictEqual(c._wcEngaged, true, '6 low days must not disengage');
  // 7th low day -> stand down
  g.state.scholar.day = 69; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, false, 'should stand down on the 7th low day');
  assert.strictEqual(c._wcDisengages, 1);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /Ranging resumes/i.test(s)), 'release line missing: ' + JSON.stringify(says));
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.length >= 12, 'travel must pass again after disengage, got ' + trav.length);
  delete process.env.SPIRALCOND;
});

// G3: travel guard direct
t('G3 travelGuard: monster tile/far declined, haven/adjacent/homeward/combatExit pass', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5, _monsters: { '6,4': { id: 'm2' } } }), c = mockCtx();
  g.map.px = 6; g.map.py = 4; // stranded 2 out
  assert.strictEqual(W.travelGuard(g, c, 6, 4, false), true, 'monster-active wild tile declined');
  assert.strictEqual(W.travelGuard(g, c, 0, 0, false), true, 'far tile declined');
  assert.strictEqual(W.travelGuard(g, c, 5, 4, false), false, 'homeward hop passes');
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), false, 'haven hop passes even with a monster (defense)');
  g._monsters = { '4,4': { id: 'm5' } };
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), false, 'haven defense always engages');
  assert.strictEqual(W.travelGuard(g, c, 7, 4, true), false, 'combatExit always passes');
  delete process.env.SPIRALCOND;
});

// G4: dusk top-up feast gates
t('G4 top-up feast fires at dusk vs wave-5 haven threat when unfeasted', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c = mockCtx();
  c._wcEngaged = true;
  layered.upkeep(g, c);
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1);
  assert.strictEqual(c.wcTopUpFeasts, 1);
  layered.upkeep(g, c); // same day -> one/day gate
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1, 'one feast per day');
  delete process.env.SPIRALCOND;
});
t('G4 no top-up when feasted / no threat / thin buffer / not dusk / disengaged', () => {
  process.env.SPIRALCOND = '1';
  const g1 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: true }), c1 = mockCtx();
  c1._wcEngaged = true; layered.upkeep(g1, c1);
  assert.strictEqual(g1.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast when feasted');
  const g2 = mockGame({ _wave: 5, _feasted: false }), c2 = mockCtx();
  c2._wcEngaged = true; layered.upkeep(g2, c2);
  assert.strictEqual(g2.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast with no threat');
  const g3 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false, _plan: { ok: true, have: 1000, cost: 2000 } }), c3 = mockCtx();
  c3._wcEngaged = true; layered.upkeep(g3, c3);
  assert.strictEqual(g3.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast into famine');
  const g4 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c4 = mockCtx();
  g4.dayPart = 0; c4._wcEngaged = true; layered.upkeep(g4, c4);
  assert.strictEqual(g4.calls.filter(k => k[0] === 'hostFeast').length, 0, 'dusk only');
  const g5 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c5 = mockCtx();
  layered.upkeep(g5, c5); // not engaged
  assert.strictEqual(g5.calls.filter(k => k[0] === 'hostFeast').length, 0, 'no feast while disengaged');
  delete process.env.SPIRALCOND;
});

// G6: latch evaluation — pre-unlock history engages at the unlock day
t('G6 markers from pre-unlock history engage at the latch', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 4 }), c = mockCtx(); // wave 4: window not open
  g._fresh = 9;
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 50; layered.daily(g, c);
  g._fresh = 4;
  cs(g, 55, 'howlerZ');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 56; layered.daily(g, c);
  g._fresh = 2;
  cs(g, 59, 'howlerY');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 60; layered.daily(g, c);
  assert.strictEqual(c.wcActive, undefined, 'pre-window: never engages');
  g._wave = 5; // the latch
  layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'should engage at the latch from pre-unlock history');
  assert.strictEqual(c._wcEngages, 1);
  delete process.env.SPIRALCOND;
});

// G7: feed + acceleration engage (no pantry needed)
t('G7 feed + acceleration engage without the pantry marker', () => {
  process.env.SPIRALCOND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g._fresh = 20; // pantry healthy: only feed + acceleration
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  cs(g, 69, 'howlerX');
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 70; layered.daily(g, c);
  cs(g, 71, 'howlerX');
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 71; layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, true, 'feed + acceleration should engage');
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /succession-feed/.test(s) && /death-acceleration/.test(s)),
    'engage line must name feed + acceleration: ' + JSON.stringify(says));
  delete process.env.SPIRALCOND;
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
