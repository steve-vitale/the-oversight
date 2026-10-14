#!/usr/bin/env node
// scripts/test-wave5posture-20261014.js — proof tests for the r24 wave-5
// survival posture (scripts/policies/wave5posture.js).
//
// RED-verified where honest:
//   A1 (RED): gate OFF → posturefeast.daily/upkeep delegate byte-identically
//       to leadfeast (same verb-call sequence on a recording mock). Without
//       the layer the file must be a no-op.
//   A2 (RED): gate ON but wave-5 never unlocks → no posture activity
//       (no latch, no declines, travel/proposeLink pass through).
//   B: travel guard — monster-active wild tile declined; haven allowed;
//      far-from-haven declined; homeward hops allowed; combatExit passes.
//   C: proposeLink paused in window, passes pre-window.
//   D: top-up feast fires at dusk when a wave-5 monster threatens haven and
//      the scholar isn't feasted; honest gates honored (buffer, one/day);
//      no feast when already feasted or no threat.
//   E: defensive load — the layer loads with FEASTSCALE_R13 unset (leadfeast
//      degrades to leadcourt behavior) and still gates correctly.
'use strict';
const assert = require('assert');

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok - ' + name); }
  catch (e) { fail++; console.log('  FAIL - ' + name + ' :: ' + e.message); }
}

// recording mock Game: verbs log their calls; world state scripted.
function mockGame(over) {
  const calls = [];
  const G = {
    calls,
    state: { scholar: { day: 10, feastDay: -1 }, village: {} },
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
    inCombat() { return false; },
    say(msg) { calls.push(['say', String(msg).slice(0, 60)]); },
    villageStandingTotal() { return 210; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
// a fake parent policy that exercises the verbs the real parent uses
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

delete process.env.WAVE5POSTURE;
// KILLED AT PILOT (2026-10-14, evidence/2026-10-14/sim-wave5posture.md):
// the posture policy file was deleted per the killed-arm protocol. These
// unit tests (10/10 green at kill time) are preserved as the RED record;
// restore scripts/policies/wave5posture.js from git history to re-run.
let W;
try {
  W = require('./policies/wave5posture');
} catch (e) {
  console.log('wave5posture policy deleted (killed arm — see evidence/2026-10-14/sim-wave5posture.md); 10/10 were green at kill time');
  process.exit(0);
}
const layered = W.withWave5Posture(fakeParent, 'testlayer', 'test');

// A1 (RED): gate off → pure delegation, verb-for-verb identical to parent
t('A1 gate-off daily delegates identically', () => {
  delete process.env.WAVE5POSTURE;
  const g1 = mockGame(), c1 = mockCtx(), g2 = mockGame(), c2 = mockCtx();
  const r1 = layered.daily(g1, c1);
  const r2 = fakeParent.daily(g2, c2);
  assert.strictEqual(r1, r2);
  assert.deepStrictEqual(g1.calls, g2.calls, 'verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1.wpActive, undefined);
});
t('A1 gate-off upkeep delegates identically', () => {
  delete process.env.WAVE5POSTURE;
  const g1 = mockGame(), c1 = mockCtx(), g2 = mockGame(), c2 = mockCtx();
  const r1 = layered.upkeep(g1, c1);
  const r2 = fakeParent.upkeep(g2, c2);
  assert.strictEqual(r1, r2);
  assert.deepStrictEqual(g1.calls, g2.calls);
});

// A2 (RED): gate on, wave-5 never unlocks → no posture activity
t('A2 gate-on pre-window is a no-op', () => {
  process.env.WAVE5POSTURE = '1';
  const g = mockGame({ _wave: 3 }), c = mockCtx();
  layered.daily(g, c);
  assert.strictEqual(c.wpActive, undefined, 'window latched without wave-5');
  assert.strictEqual(c.wpMonsterTileDeclined, undefined);
  assert.strictEqual(c.wpFarTravelDeclined, undefined);
  assert.strictEqual(c.wpProposalsPaused, undefined);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.strictEqual(trav.length, 2, 'travel should pass through pre-window, got ' + JSON.stringify(trav));
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 1);
});

// B: travel guard in window
t('B monster-active wild tile declined, haven allowed', () => {
  process.env.WAVE5POSTURE = '1';
  const g = mockGame({ _wave: 5, _monsters: { '5,5': { id: 'm5' }, '4,4': { id: 'm5' } } });
  const c = mockCtx();
  const r = layered.daily(g, c); // latches window, returns home (already home)
  assert.strictEqual(c.wpActive, 1);
  assert.strictEqual(r, 'daily-ret');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  // (5,5): monster tile declined; (0,0): far (>1 from haven) declined
  assert.deepStrictEqual(trav.map(k => [k[1], k[2]]), [], 'declined hops must not reach the engine');
  assert.strictEqual(c.wpMonsterTileDeclined, 1);
  assert.strictEqual(c.wpFarTravelDeclined, 1);
});
t('B haven hop allowed even with a monster on it (haven defense)', () => {
  process.env.WAVE5POSTURE = '1';
  const g = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } } });
  g.map.px = 5; g.map.py = 4; // stranded adjacent
  const c = mockCtx();
  layered.daily(g, c);
  const home = g.calls.filter(k => k[0] === 'travelTo' && k[1] === 4 && k[2] === 4);
  assert.strictEqual(home.length, 1, 'return-home must be allowed, got ' + JSON.stringify(g.calls));
  assert.strictEqual(c.wpHomeReturns, 1);
});
t('B homeward hop from the wild allowed; outward declined', () => {
  process.env.WAVE5POSTURE = '1';
  const g = mockGame({ _wave: 5 });
  const c = mockCtx();
  // direct guard calls (no full daily): scholar at (6,4), d=2 from haven
  g.map.px = 6; g.map.py = 4;
  assert.strictEqual(W.travelGuard(g, c, 5, 4, false), false, 'homeward hop should pass');
  assert.strictEqual(W.travelGuard(g, c, 7, 4, false), true, 'outward hop should decline');
  assert.strictEqual(W.travelGuard(g, c, 6, 5, true), false, 'combatExit must pass');
});

// C: proposeLink pause
t('C proposeLink paused in window, passes pre-window', () => {
  process.env.WAVE5POSTURE = '1';
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  layered.daily(g, c);
  const prop = g.calls.filter(k => k[0] === 'proposeLink');
  assert.strictEqual(prop.length, 0, 'proposal must be paused in window');
  assert.strictEqual(c.wpProposalsPaused, 1);
});

// D: top-up feast
t('D top-up feast fires at dusk vs wave-5 threat when not feasted', () => {
  process.env.WAVE5POSTURE = '1';
  const g = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false });
  const c = mockCtx();
  layered.upkeep(g, c);
  const hf = g.calls.filter(k => k[0] === 'hostFeast');
  assert.strictEqual(hf.length, 1, 'expected one honest feast, got ' + JSON.stringify(g.calls));
  assert.strictEqual(c.wpTopUpFeasts, 1);
});
t('D no top-up when already feasted or no threat or buffer thin', () => {
  process.env.WAVE5POSTURE = '1';
  const g1 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: true });
  layered.upkeep(g1, mockCtx());
  assert.strictEqual(g1.calls.filter(k => k[0] === 'hostFeast').length, 0, 'must not feast when feasted');
  const g2 = mockGame({ _wave: 5, _feasted: false }); // no monster at haven
  layered.upkeep(g2, mockCtx());
  assert.strictEqual(g2.calls.filter(k => k[0] === 'hostFeast').length, 0, 'must not feast with no threat');
  const g3 = mockGame({ _wave: 5, _monsters: { '4,4': { id: 'm5' } }, _feasted: false, _plan: { ok: true, have: 1000, cost: 2000 } });
  layered.upkeep(g3, mockCtx());
  assert.strictEqual(g3.calls.filter(k => k[0] === 'hostFeast').length, 0, 'must not feast into famine');
});

// E: defensive load with the feastscale gate off
t('E layer loads and gates correctly with FEASTSCALE_R13 unset', () => {
  delete process.env.FEASTSCALE_R13;
  process.env.WAVE5POSTURE = '1';
  assert.strictEqual(W.layerOn(), true);
  const g = mockGame({ _wave: 5 }), c = mockCtx();
  assert.strictEqual(W.inWindow(g, c), true);
  delete process.env.WAVE5POSTURE;
  assert.strictEqual(W.layerOn(), false);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
