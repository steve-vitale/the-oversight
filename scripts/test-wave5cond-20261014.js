#!/usr/bin/env node
// scripts/test-wave5cond-20261014.js — proof tests for the CONDITIONAL wave-5
// survival posture (scripts/policies/wave5cond.js, gate WAVE5COND=1).
//
// THE CONDITION (pre-registered, evidence/2026-10-14/sim-wave5cond.md):
//   post-unlock window; trailing-30d scholar deaths (succession events as
//   state.scholar.villagerId changes) >= 2 → ENGAGE the r24 posture verbs;
//   < 2 → STAND DOWN (the scholar keeps ranging on strong villages).
//
// RED-verified where honest:
//   R1 (RED): gate OFF → daily/upkeep delegate byte-identically to the parent
//       (same verb sequence, same return); NO tracking state written.
//   R2 (RED): gate ON but wave-5 never unlocks → no posture activity even
//       with scripted scholar deaths (tracking is passive; nothing engages).
//   R3 (RED): gate ON, wave-5, FEWER than 2 trailing deaths → no engage
//       (the strong-village case: s77's lesson must hold).
// GREEN:
//   G1: 2 scholar deaths in the trailing 30d at wave-5 → engages (latch say,
//       travel guard declines monster tile + far tile, proposals paused).
//   G2: disengage when deaths age out of the 30d window (release say).
//   G3: travel guard direct (monster tile / far / homeward / combatExit).
//   G4: dusk top-up feast gates (threat + unfeasted + buffer → feast;
//       already-feasted / no-threat / thin-buffer / one-per-day → no feast).
//   G5: defensive load with FEASTSCALE_R13 unset (parent falls back).
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
    state: { scholar: { day: 10, feastDay: -1, villagerId: 'v1' }, village: { px: 4, py: 4 } },
    map: { px: 4, py: 4 },
    dayPart: 2,
    _wave: 1, _monsters: {}, _feasted: false, _plan: { ok: true, have: 100000, cost: 2000 },
    data: { monsters: [{ id: 'm5', wave: 5 }, { id: 'm2', wave: 2 }] },
    unlockedWave() { return this._wave; },
    monsterAt(x, y) { return this._monsters[x + ',' + y] || null; },
    feastedActive() { return this._feasted; },
    feastPlan() { calls.push(['feastPlan']); return this._plan; },
    hostFeast() { calls.push(['hostFeast']); this.state.scholar.feastDay = this.state.scholar.day; return { ok: true }; },
    travelTo(x, y, force, combatExit) {
      calls.push(['travelTo', x, y, !!combatExit]);
      this.map.px = x; this.map.py = y;
      return { moved: true };
    },
    proposeLink(id, opts) { calls.push(['proposeLink', id]); return { ok: true }; },
    say(msg) { calls.push(['say', String(msg).slice(0, 60)]); },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
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

delete process.env.WAVE5COND;
// KILLED AT PILOT (2026-10-14, evidence/2026-10-14/sim-wave5cond.md):
// UNMEASURABLE — per-run nondeterminism (scripts/det-test-20261014.js) makes
// the 8-seed identical-seed comparison noise-dominated. The policy file was
// deleted per the killed-arm protocol. These unit tests (10/10 green at kill
// time) are preserved as the RED/GREEN record; restore
// scripts/policies/wave5cond.js to re-run.
let W;
try {
  W = require('./policies/wave5cond');
} catch (e) {
  console.log('wave5cond policy deleted (killed arm — see evidence/2026-10-14/sim-wave5cond.md); 10/10 were green at kill time');
  process.exit(0);
}
const layered = W.withWave5Cond(fakeParent, 'testlayer');

// R1 (RED): gate off → pure delegation, verb-for-verb identical, no tracking
t('R1 gate-off daily delegates identically, no tracking state', () => {
  delete process.env.WAVE5COND;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  const r1 = layered.daily(g1, c1);
  const r2 = fakeParent.daily(g2, c2);
  assert.strictEqual(r1, r2);
  assert.deepStrictEqual(g1.calls, g2.calls, 'verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._wcLastVid, undefined, 'tracking state must not be written gate-off');
  assert.strictEqual(c1.wcActive, undefined);
});
t('R1 gate-off upkeep delegates identically', () => {
  delete process.env.WAVE5COND;
  const g1 = mockGame({ _wave: 5 }), c1 = mockCtx(), g2 = mockGame({ _wave: 5 }), c2 = mockCtx();
  assert.strictEqual(layered.upkeep(g1, c1), fakeParent.upkeep(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls);
});

// R2 (RED): gate on, wave-5 never unlocks → deaths tracked passively, nothing engages
t('R2 gate-on pre-window: deaths tracked but posture never engages', () => {
  process.env.WAVE5COND = '1';
  const g = mockGame({ _wave: 3 }), c = mockCtx();
  for (let i = 0; i < 4; i++) {
    g.state.scholar.villagerId = 'v' + (i + 1);
    g.state.scholar.day = 10 + i;
    layered.daily(g, c);
  }
  assert.strictEqual(c._wcEngaged, undefined, 'must not engage pre-window');
  assert.strictEqual(c.wcActive, undefined);
  assert.strictEqual((c._wcScholarDeaths || []).length, 3, 'should passively track 3 deaths, got ' + JSON.stringify(c._wcScholarDeaths));
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 8, 'travel must pass through pre-window');
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 4, 'proposals must pass pre-window');
  delete process.env.WAVE5COND;
});

// R3 (RED): gate on, wave-5, fewer than 2 trailing deaths → NO engage (s77 lesson)
t('R3 strong village (1 trailing death) at wave-5: no engage', () => {
  process.env.WAVE5COND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c); // 1 death
  g.state.scholar.day = 90; layered.daily(g, c);
  assert.strictEqual(c.wcActive, undefined, 'must not engage on 1 trailing death');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 6, 'travel must pass through when strong, got ' + trav.length);
  delete process.env.WAVE5COND;
});

// G1: 2 deaths in trailing 30d at wave-5 → engage
t('G1 two trailing scholar deaths at wave-5: posture engages', () => {
  process.env.WAVE5COND = '1';
  const g = mockGame({ _wave: 5, _monsters: { '5,5': { id: 'm5' } } }), c = mockCtx();
  g.state.scholar.villagerId = 'v1'; g.state.scholar.day = 60; layered.daily(g, c);
  g.state.scholar.villagerId = 'v2'; g.state.scholar.day = 61; layered.daily(g, c); // death 1
  g.state.scholar.villagerId = 'v3'; g.state.scholar.day = 62; layered.daily(g, c); // death 2 → engage
  assert.strictEqual(c._wcEngaged, true, 'should engage on 2 trailing deaths');
  assert.strictEqual(c.wcActive, 1);
  assert.strictEqual(c._wcEngages, 1);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /braces/i.test(s)), 'latch say-line missing: ' + JSON.stringify(says));
  // the two pre-engage days (60, 61) let travel through honestly; the
  // engaged day declines both parent hops (they never reach the engine)
  // plus one walk-home hop at engage (scholar was ranged out to (0,0)).
  const trav = g.calls.filter(k => k[0] === 'travelTo').map(k => [k[1], k[2]]);
  assert.deepStrictEqual(trav, [[5, 5], [0, 0], [5, 5], [0, 0], [1, 1]],
    'expected pre-engage passes + walk-home only, got ' + JSON.stringify(trav));
  assert.strictEqual(c.wcMonsterTileDeclined, 1);
  assert.strictEqual(c.wcFarTravelDeclined, 1);
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 2, '2 pre-engage proposals pass, the engaged one pauses');
  assert.strictEqual(c.wcProposalsPaused, 1);
  delete process.env.WAVE5COND;
});

// G2: deaths age out of the 30d window → stand down
t('G2 deaths aging out of the window: posture stands down', () => {
  process.env.WAVE5COND = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  c._wcEngaged = true; c._wcScholarDeaths = [10, 11];
  g.state.scholar.day = 45; // both deaths >30d old
  layered.daily(g, c);
  assert.strictEqual(c._wcEngaged, false, 'should stand down');
  assert.strictEqual(c._wcDisengages, 1);
  const says = g.calls.filter(k => k[0] === 'say').map(k => k[1]);
  assert.ok(says.some(s => /ranging resumes/i.test(s)), 'release say-line missing');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 2, 'travel must pass again when strong');
  delete process.env.WAVE5COND;
});

// G3: travel guard direct
t('G3 travelGuard: monster tile/far declined, haven/homeward/combatExit pass', () => {
  process.env.WAVE5COND = '1';
  const g = mockGame({ _wave: 5, _monsters: { '6,4': { id: 'm2' } } }), c = mockCtx();
  g.map.px = 6; g.map.py = 4; // stranded 2 out
  assert.strictEqual(W.travelGuard(g, c, 6, 4, false), true, 'monster-active wild tile declined');
  assert.strictEqual(W.travelGuard(g, c, 0, 0, false), true, 'far tile declined');
  assert.strictEqual(W.travelGuard(g, c, 5, 4, false), false, 'homeward hop passes');
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), false, 'haven hop passes even with a monster (defense)');
  g._monsters = { '4,4': { id: 'm5' } };
  assert.strictEqual(W.travelGuard(g, c, 4, 4, false), false, 'haven defense always engages');
  assert.strictEqual(W.travelGuard(g, c, 7, 4, true), false, 'combatExit always passes');
  delete process.env.WAVE5COND;
});

// G4: dusk top-up feast gates
t('G4 top-up feast fires at dusk vs wave-5 haven threat when unfeasted', () => {
  process.env.WAVE5COND = '1';
  const g = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false }), c = mockCtx();
  c._wcEngaged = true;
  layered.upkeep(g, c);
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1);
  assert.strictEqual(c.wcTopUpFeasts, 1);
  layered.upkeep(g, c); // same day → one/day gate
  assert.strictEqual(g.calls.filter(k => k[0] === 'hostFeast').length, 1, 'one feast per day');
  delete process.env.WAVE5COND;
});
t('G4 no top-up when feasted / no threat / thin buffer / not dusk', () => {
  process.env.WAVE5COND = '1';
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
  delete process.env.WAVE5COND;
});

// G5: defensive load with the feastscale gate off
t('G5 layer loads and gates with FEASTSCALE_R13 unset', () => {
  delete process.env.FEASTSCALE_R13;
  process.env.WAVE5COND = '1';
  assert.strictEqual(W.layerOn(), true);
  assert.strictEqual(W.condfeast != null, true, 'parent must fall back to leadcourt');
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  assert.strictEqual(W.inWindow(g, c), true);
  delete process.env.WAVE5COND;
  assert.strictEqual(W.layerOn(), false);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
