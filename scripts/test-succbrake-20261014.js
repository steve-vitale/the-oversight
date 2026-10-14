#!/usr/bin/env node
// scripts/test-succbrake-20261014.js — proof tests for the succession-feed
// brake (scripts/policies/succbrake.js, gate SUCCBRAKE=1, default OFF).
//
// THE DESIGN (pre-registered, evidence/2026-10-14/sim-succbrake.md): after
// ANY scholar combat death, the new bearer <redacted> for FORTIFY_DAYS=2 days —
// holds Haven, takes no wild combat sorties (travel guard declines any
// travelTo away from the haven tile; combatExit/flee always passes). The
// village sets a guard posture (narrated once per window). N=2 tuned from
// the diagnostic (scripts/sweep-succbrake-diag-20261014.js: 4 feed events /
// 36 mantle successions, max gap 1 day).
//
// RED-verified where honest:
//   R1 (RED): gate OFF -> daily/upkeep delegate verb-for-verb identical to
//       the base; NO tracking state written.
//   R2 (REAL RED): gate OFF + scholar combat death -> the successor's daily
//       still ranges wild (the blank, unblocked): travelTo(5,5) passes.
// GREEN:
//   G1: scripted scholar combat death -> fortify: guard-posture say fires
//       once, wild travelTo declined, haven travelTo passes, base daily ran.
//   G2: fortify expires after FORTIFY_DAYS -> travel passes again.
//   G3: chained combat death inside the window EXTENDS it.
//   G4: non-combat scholar death does NOT fortify.
//   G5: combatExit (flee-by-barrier) passes the guard.
//   G6: walk-home: fortify with the scholar away from haven walks them home.
//   G7: upkeep guarded too (wild travel in upkeep declined when fortifying).
//   G8 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical
//       verb sequences AND identical ctx keys (no tracking state).
//
// SMOKE=1: instrument-honesty subset (R1 + G8) only.
'use strict';
// KILL-PROTOCOL NOTE (scale-onramp r29, ARM 3): the succbrake layer was
// deleted per the kill protocol (NO-GO at pilot — the feed is a Haven-siege
// phenomenon, not a ranging phenomenon; see evidence/2026-10-14/sim-succbrake.md).
// The mechanism proof below ran 10/10 GREEN pre-kill (REAL RED verified).
// When the layer is absent this file degrades gracefully instead of
// MODULE_NOT_FOUND.
let W = null;
try { W = require('./policies/succbrake'); } catch (e) { /* deleted per kill protocol */ }
if (!W) {
  console.log('INFO-SKIP: succbrake layer deleted per kill protocol (NO-GO at pilot); mechanism was 10/10 GREEN pre-kill — see evidence/2026-10-14/sim-succbrake.md');
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
      // adjacent tiles (haven at 4,4 included when adjacent)
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
    say(msg) { calls.push(['say', String(msg).slice(0, 160)]); },
    displayName(vid) { return ({ v1: 'Aldo Bren', v2: 'Bea Ciel', v3: 'Cy Dune' }[vid] || String(vid)); },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
// scholar combat death tele (the engine's death stream shape)
function combatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'combat', player: true });
}
function nonCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'starvation', player: true });
}
// the mantle passes: new bearer, still day `day`
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

const layered = W.withSuccbrake(fakeParent, 'testlayer');
const SMOKE = process.env.SMOKE === '1';

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
function r1() {
  delete process.env.SUCCBRAKE;
  const g1 = mockGame(), c1 = mockCtx(), g2 = mockGame(), c2 = mockCtx();
  assert.strictEqual(layered.daily(g1, c1), fakeParent.daily(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls, 'daily verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._sbFortifyUntil, undefined, 'tracking state written gate-off');
  assert.strictEqual(c1._sbSeenDeaths, undefined);
  const g3 = mockGame(), c3 = mockCtx(), g4 = mockGame(), c4 = mockCtx();
  assert.strictEqual(layered.upkeep(g3, c3), fakeParent.upkeep(g4, c4));
  assert.deepStrictEqual(g3.calls, g4.calls, 'upkeep verb sequence differs');
  assert.strictEqual(c3._sbFortifyUntil, undefined);
}
t('R1 gate-off daily+upkeep delegate identically, no tracking state', r1);

// R2 (REAL RED): gate off + scholar combat death -> the successor still ranges
t('R2 REAL RED: gate-off, post-combat-death successor still ranges wild (blank unblocked)', () => {
  delete process.env.SUCCBRAKE;
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass gate-off (the blank)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && /holds Haven/.test(k[1])), 'no guard posture gate-off');
});

if (!SMOKE) {
// G1: combat death -> fortify
t('G1 combat death -> fortify: guard say once, wild declined, haven passes, base daily ran', () => {
  process.env.SUCCBRAKE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  const r = layered.daily(g, c);
  assert.strictEqual(r, 'daily-ret');
  assert.strictEqual(c.parentDaily, 1, 'base daily must run under the guard');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must be declined, got ' + JSON.stringify(trav));
  assert.ok(trav.some(k => k[1] === 4 && k[2] === 4), 'haven travel must pass');
  assert.ok((c._sbDeclined || 0) >= 1, 'declines counted');
  const says = g.calls.filter(k => k[0] === 'say' && /holds Haven/.test(k[1]));
  assert.strictEqual(says.length, 1, 'guard posture said exactly once, got ' + says.length);
  assert.ok(/Aldo/.test(says[0][1]) && /Bea/.test(says[0][1]), 'names the dead and the living: ' + says[0][1]);
  assert.strictEqual(c._sbFortifyDays, 1);
  // second fortify day: no repeat announcement
  g.state.scholar.day = 12;
  layered.daily(g, c);
  const says2 = g.calls.filter(k => k[0] === 'say' && /holds Haven/.test(k[1]));
  assert.strictEqual(says2.length, 1, 'no repeat announcement inside the window');
  delete process.env.SUCCBRAKE;
});

// G2: expiry
t('G2 fortify expires after FORTIFY_DAYS: travel passes again', () => {
  process.env.SUCCBRAKE = '1';
  const g = mockGame(), c = mockCtx();
  assert.strictEqual(W.FORTIFY_DAYS, 2);
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 13; // death day 10 + 2 = 12 < 13 -> expired
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass after expiry');
  delete process.env.SUCCBRAKE;
});

// G3: chained death extends
t('G3 chained combat death inside the window extends it', () => {
  process.env.SUCCBRAKE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11; layered.daily(g, c); // fortify day 1
  combatDeath(g, 11, 'v2'); mantlePass(g, 'v3', 11); // chain: v2 dies too
  g.state.scholar.day = 13; // would be expired (10+2=12) without the chain
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'window must extend on chained death');
  assert.strictEqual(c._sbWindows, 2, 'second window announced');
  delete process.env.SUCCBRAKE;
});

// G4: non-combat death does not fortify
t('G4 non-combat scholar death does NOT fortify', () => {
  process.env.SUCCBRAKE = '1';
  const g = mockGame(), c = mockCtx();
  nonCombatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass (no fortify)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && /holds Haven/.test(k[1])), 'no guard posture');
  assert.strictEqual((c._sbDeaths || []).length, 1, 'death still recorded');
  assert.strictEqual(c._sbDeaths[0].category, 'starvation');
  delete process.env.SUCCBRAKE;
});

// G5: combatExit passes
t('G5 combatExit (flee-by-barrier) passes the guard', () => {
  process.env.SUCCBRAKE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  let r;
  // reach into the guard via a fortify daily whose parent flees
  const fleeParent = Object.assign({}, fakeParent, {
    daily(Game, ctx) { return Game.travelTo(0, 0, false, true); },
  });
  const fleeLayered = W.withSuccbrake(fleeParent, 'fleelayer');
  r = fleeLayered.daily(g, c);
  assert.ok(r && r.moved, 'combatExit travel must pass');
  assert.strictEqual(g.map.px, 0, 'flee moved the scholar');
  delete process.env.SUCCBRAKE;
});

// G6: walk-home
t('G6 fortify walks an away scholar home (bounded, haven-ward)', () => {
  process.env.SUCCBRAKE = '1';
  const g = mockGame(), c = mockCtx();
  g.map.px = 6; g.map.py = 6;
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const d0 = Math.abs(6 - 4) + Math.abs(6 - 4);
  const d1 = Math.abs(g.map.px - 4) + Math.abs(g.map.py - 4);
  assert.ok(d1 < d0, `must walk haven-ward (6,6)->(${g.map.px},${g.map.py})`);
  assert.ok((c._sbWalkHops || 0) >= 1 && (c._sbWalkHops || 0) <= 12, 'bounded hops');
  delete process.env.SUCCBRAKE;
});

// G7: upkeep guarded
t('G7 upkeep guarded when fortifying (patrol sortie declined)', () => {
  process.env.SUCCBRAKE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.upkeep(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 6 && k[2] === 6), 'upkeep sortie must be declined');
  assert.strictEqual(c.parentUpkeep, 1, 'base upkeep ran');
  delete process.env.SUCCBRAKE;
});
} // !SMOKE

// G8 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical.
t('G8 det-gate: gate-off 3-day run identical verb sequences + ctx keys', () => {
  delete process.env.SUCCBRAKE;
  const runScript = (pol) => {
    const g = mockGame(), c = mockCtx();
    for (let d = 10; d <= 12; d++) {
      g.state.scholar.day = d;
      if (d === 11) { combatDeath(g, d, 'v1'); mantlePass(g, 'v2', d); }
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
