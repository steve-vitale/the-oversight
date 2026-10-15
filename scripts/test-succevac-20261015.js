#!/usr/bin/env node
// scripts/test-succevac-20261015.js — proof tests for the successor-evacuate
// lever (scripts/policies/succevac.js, gate SUCCEVAC=1, default OFF).
//
// THE DESIGN (pre-registered, evidence/2026-10-15/sim-succevac.md): when a
// scholar combat death happens AT the haven tile (a siege is active), the
// successor's first policy turn moves them OFF Haven to an adjacent known
// tile and holds ~1 day (SUCCEVAC_DAYS=1) — evacuate, don't fortify the siege.
// Deaths without tile attribution fail safe (no evac).
//
// RED-verified where honest:
//   R1 (RED): gate OFF -> daily/upkeep delegate verb-for-verb identical to
//       the base; NO tracking state written.
//   R2 (REAL RED): gate OFF + Haven combat death -> the successor is NOT
//       evacuated (the blank, unblocked): no evac move, no evac line.
// GREEN:
//   G1: Haven combat death -> evac: evac line once (names dead + living),
//       travelTo to an adjacent non-haven tile, further wild travel declined,
//       base daily ran.
//   G2: evac expires after SUCCEVAC_DAYS -> travel passes again.
//   G3: chained Haven combat death inside the window EXTENDS it.
//   G4: wild combat death does NOT evacuate.
//   G5: non-combat Haven death does NOT evacuate.
//   G6: combatExit (flee-by-barrier) passes the guard.
//   G7: upkeep guarded too (evac can fire from upkeep; patrol sortie declined).
//   G8 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical
//       verb sequences AND identical ctx keys (no tracking state).
//
// SMOKE=1: instrument-honesty subset (R1 + G8) only.
'use strict';
// KILL-PROTOCOL NOTE (scale-onramp, sim-succevac): the succevac layer was
// deleted per the kill protocol (NO-GO at pilot — primary hit but the median-
// survival guardrail missed, and the mechanism probe showed the besieger
// pursues: the lever relocates the chain rather than breaking it; see
// evidence/2026-10-15/sim-succevac.md). The mechanism proof below ran 11/11
// GREEN pre-kill (REAL RED verified). When the layer is absent this file
// degrades gracefully instead of MODULE_NOT_FOUND.
let W = null;
try { W = require('./policies/succevac'); } catch (e) { /* deleted per kill protocol */ }
if (!W) {
  console.log('INFO-SKIP: succevac layer deleted per kill protocol (NO-GO at pilot); mechanism was 11/11 GREEN pre-kill — see evidence/2026-10-15/sim-succevac.md');
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
      scholar: { day: 10, villagerId: 'v1' },
      village: { px: 4, py: 4 },
      telemetry: [],
    },
    villagerId: 'v1',
    map: { px: 4, py: 4 },
    travelTargets() {
      const { px, py } = this.map;
      const out = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) out.push({ x: px + dx, y: py + dy });
      return out;
    },
    travelTo(x, y, force, combatExit) {
      calls.push(['travelTo', x, y, !!combatExit]);
      this.map.px = x; this.map.py = y;
      return { moved: true };
    },
    say(msg) { calls.push(['say', String(msg).slice(0, 200)]); },
    displayName(vid) { return ({ v1: 'Aldo Bren', v2: 'Bea Ciel', v3: 'Cy Dune' }[vid] || String(vid)); },
    nodeEpithet(x, y) { return 'tile(' + x + ',' + y + ')'; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
// scholar death tele (the engine's death stream shape) — the tile rides the
// record itself (the sweep's tele wrap stamps it; the layer reads ev.tile)
function scholarDeath(g, ctx, day, who, cause, tile) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause, player: true, tile });
}
function havenCombatDeath(g, ctx, day, who) { scholarDeath(g, ctx, day, who, 'combat', [4, 4]); }
function wildCombatDeath(g, ctx, day, who) { scholarDeath(g, ctx, day, who, 'combat', [6, 6]); }
function havenStarveDeath(g, ctx, day, who) { scholarDeath(g, ctx, day, who, 'starvation', [4, 4]); }
// the mantle passes: new scholar, still day `day`
function mantlePass(g, newVid, day) {
  g.villagerId = newVid;
  g.state.scholar.villagerId = newVid;
  g.state.scholar.day = day;
}
const fakeParent = {
  id: 'fakeparent',
  daily(Game, ctx) {
    ctx.parentDaily = (ctx.parentDaily || 0) + 1;
    Game.travelTo(5, 5); // wild sortie
    Game.travelTo(4, 4); // haven
    Game.say('parent chore');
    return 'daily-ret';
  },
  upkeep(Game, ctx) {
    ctx.parentUpkeep = (ctx.parentUpkeep || 0) + 1;
    Game.travelTo(6, 6); // upkeep sortie (feastFightRoad patrol shape)
    return 'upkeep-ret';
  },
  fight(Game, ctx) { return 'fight-delegated'; },
};

const layered = W.withSuccevac(fakeParent, 'testlayer');
const SMOKE = process.env.SMOKE === '1';
const EVAC_RE = /won't sleep at Haven tonight/;

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
function r1() {
  delete process.env.SUCCEVAC;
  const g1 = mockGame(), c1 = mockCtx(), g2 = mockGame(), c2 = mockCtx();
  assert.strictEqual(layered.daily(g1, c1), fakeParent.daily(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls, 'daily verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._seEvacUntil, undefined, 'tracking state written gate-off');
  assert.strictEqual(c1._seSeen, undefined);
  const g3 = mockGame(), c3 = mockCtx(), g4 = mockGame(), c4 = mockCtx();
  assert.strictEqual(layered.upkeep(g3, c3), fakeParent.upkeep(g4, c4));
  assert.deepStrictEqual(g3.calls, g4.calls, 'upkeep verb sequence differs');
  assert.strictEqual(c3._seEvacUntil, undefined);
}
t('R1 gate-off daily+upkeep delegate identically, no tracking state', r1);

// R2 (REAL RED): gate off + Haven combat death -> successor NOT evacuated
t('R2 REAL RED: gate-off, post-Haven-death successor NOT evacuated (blank unblocked)', () => {
  delete process.env.SUCCEVAC;
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  layered.daily(g, c);
  assert.ok(!g.calls.some(k => k[0] === 'say' && EVAC_RE.test(k[1])), 'no evac line gate-off');
  assert.ok(!g.calls.some(k => k[0] === 'travelTo' && k[1] === 5 && k[2] === 4), 'no evac move gate-off');
  assert.ok(g.calls.some(k => k[0] === 'travelTo' && k[1] === 5 && k[2] === 5), 'parent wild sortie must pass (the blank)');
});

if (!SMOKE) {
// G1: Haven combat death -> evac
t('G1 Haven combat death -> evac: line once, adjacent move, wild declined, base ran', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  const r = layered.daily(g, c);
  assert.strictEqual(r, 'daily-ret');
  assert.strictEqual(c.parentDaily, 1, 'base daily must run under the guard');
  assert.strictEqual(c._seEvacuations, 1, 'exactly one evac move');
  assert.deepStrictEqual([g.map.px, g.map.py], [5, 4], 'evac to first revealed adjacent tile, got ' + g.map.px + ',' + g.map.py);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must be declined, got ' + JSON.stringify(trav));
  assert.ok(!trav.some(k => k[1] === 4 && k[2] === 4), 'return-to-haven must be declined');
  assert.ok((c._seDeclined || 0) >= 2, 'declines counted, got ' + (c._seDeclined || 0));
  const says = g.calls.filter(k => k[0] === 'say' && EVAC_RE.test(k[1]));
  assert.strictEqual(says.length, 1, 'evac line said exactly once, got ' + says.length);
  assert.ok(/Aldo/.test(says[0][1]) && /Bea/.test(says[0][1]), 'names the dead and the living: ' + says[0][1]);
  // second hook same window: no repeat move, no repeat line (already off-haven)
  const n0 = g.calls.length;
  g.state.scholar.day = 10;
  layered.upkeep(g, c);
  assert.strictEqual(c._seEvacuations, 1, 'no repeat evac move');
  const says2 = g.calls.slice(n0).filter(k => k[0] === 'say' && EVAC_RE.test(k[1]));
  assert.strictEqual(says2.length, 0, 'no repeat evac line inside the window');
  delete process.env.SUCCEVAC;
});

// G2: expiry
t('G2 evac expires after SUCCEVAC_DAYS: travel passes again', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  assert.strictEqual(W.SUCCEVAC_DAYS, 1);
  havenCombatDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 12; // evacUntil = 11 < 12 -> expired
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass after expiry');
  assert.strictEqual(c._seEvacuations || 0, 0, 'no evac after expiry');
  delete process.env.SUCCEVAC;
});

// G3: chained Haven death extends
t('G3 chained Haven combat death inside the window extends it', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10; layered.daily(g, c); // evac day 1
  assert.strictEqual(c._seWindows, 1);
  havenCombatDeath(g, c, 11, 'v2'); mantlePass(g, 'v3', 11); // chain
  g.state.scholar.day = 12; // would be expired (10+1=11) without the chain
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'window must extend on chained death');
  assert.strictEqual(c._seWindows, 2, 'second window counted');
  delete process.env.SUCCEVAC;
});

// G4: wild combat death does not evacuate
t('G4 wild combat death does NOT evacuate', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  wildCombatDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass (no evac)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && EVAC_RE.test(k[1])), 'no evac line');
  assert.strictEqual(c._seEvacUntil || 0, 0, 'no window opened');
  delete process.env.SUCCEVAC;
});

// G5: non-combat Haven death does not evacuate
t('G5 non-combat Haven death does NOT evacuate', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  havenStarveDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass (no evac)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && EVAC_RE.test(k[1])), 'no evac line');
  assert.strictEqual((c._seDeaths || []).length, 1, 'death still recorded');
  assert.strictEqual(c._seDeaths[0].category, 'starvation');
  assert.strictEqual(c._seDeaths[0].atHaven, true, 'tile attribution recorded');
  delete process.env.SUCCEVAC;
});

// G6: combatExit passes
t('G6 combatExit (flee-by-barrier) passes the guard', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  const fleeParent = Object.assign({}, fakeParent, {
    daily(Game, ctx) { return Game.travelTo(0, 0, false, true); },
  });
  const fleeLayered = W.withSuccevac(fleeParent, 'fleelayer');
  const r = fleeLayered.daily(g, c);
  assert.ok(r && r.moved, 'combatExit travel must pass');
  assert.strictEqual(g.map.px, 0, 'flee moved the scholar');
  delete process.env.SUCCEVAC;
});

// G7: upkeep guarded (evac fires from upkeep)
t('G7 upkeep guarded: evac fires from upkeep, patrol sortie declined', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  havenCombatDeath(g, c, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  const r = layered.upkeep(g, c);
  assert.strictEqual(r, 'upkeep-ret');
  assert.strictEqual(c._seEvacuations, 1, 'evac move fired from upkeep');
  assert.deepStrictEqual([g.map.px, g.map.py], [5, 4]);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 6 && k[2] === 6), 'upkeep sortie must be declined');
  assert.strictEqual(c.parentUpkeep, 1, 'base upkeep ran');
  delete process.env.SUCCEVAC;
});

// G9: no tile attribution -> fail safe, no evac
t('G9 unattributed death fails safe: no evac without the tile channel', () => {
  process.env.SUCCEVAC = '1';
  const g = mockGame(), c = mockCtx();
  g.state.telemetry.push({ type: 'death', day: 10, kind: 'villager', who: 'v1', cause: 'combat', player: true });
  // NOTE: no tile on the record — the stamp is absent
  mantlePass(g, 'v2', 10);
  g.state.scholar.day = 10;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass (no attribution, no evac)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && EVAC_RE.test(k[1])), 'no evac line');
  delete process.env.SUCCEVAC;
});
} // !SMOKE

// G8 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical.
t('G8 det-gate: gate-off 3-day run identical verb sequences + ctx keys', () => {
  delete process.env.SUCCEVAC;
  const runScript = (pol) => {
    const g = mockGame(), c = mockCtx();
    for (let d = 10; d <= 12; d++) {
      g.state.scholar.day = d;
      if (d === 11) { havenCombatDeath(g, c, d, 'v1'); mantlePass(g, 'v2', d); }
      pol.daily(g, c); pol.upkeep(g, c);
    }
    return { calls: g.calls, ctxKeys: Object.keys(c).sort() };
  };
  const a = runScript(layered), b = runScript(fakeParent);
  assert.deepStrictEqual(a.calls, b.calls, 'verb sequences differ');
  assert.deepStrictEqual(a.ctxKeys, b.ctxKeys, 'ctx keys differ: ' + JSON.stringify(a.ctxKeys));
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
