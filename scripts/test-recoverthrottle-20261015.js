#!/usr/bin/env node
// scripts/test-recoverthrottle-20261015.js — proof tests for the
// post-combat-death recovery throttle (scripts/policies/recoverthrottle.js,
// gate RECOVERTHROTTLE=1, default OFF). sim-findings #215.
//
// THE DESIGN (pre-registered, evidence/2026-10-15/sim-recoverthrottle.md):
// after ANY scholar combat death, the new bearer fortifies for
// FORTIFY_DAYS=2 days — holds Haven, takes no wild combat sorties (travel
// guard declines any travelTo away from the haven tile; combatExit/flee
// always passes). The village announces a guard posture once per window.
// N=2 inherited from the succbrake diagnostic. SURVIVAL primary — never a
// feed primary.
//
// REAL-RED verified:
//   R1 (RED): gate OFF -> daily/upkeep delegate verb-for-verb identical to
//       the base; NO tracking state written.
//   R2 (REAL RED): gate OFF + scholar combat death -> the successor's daily
//       still ranges wild (the blank, unblocked): travelTo(5,5) passes.
// GREEN:
//   G0: named exports unwrap (the 2026-10-14 unwrap lesson).
//   G1: scripted scholar combat death -> fortify: guard-posture say fires
//       once, wild travelTo declined, haven travelTo passes, base daily ran;
//       names the dead and the living; posture line uses the improved
//       sense-tested phrasing ("nobody ranges till the watch stands down").
//   G2: fortify expires after FORTIFY_DAYS -> travel passes again.
//   G3: chained combat death inside the window EXTENDS it (+ new window say).
//   G4: non-combat scholar death does NOT fortify (recorded, category kept).
//   G5: combatExit (flee-by-barrier) passes the guard.
//   G6: walk-home: fortify with the scholar away from haven walks them home
//       (bounded <= 12 hops).
//   G7: upkeep guarded too (wild travel in upkeep declined when fortifying).
//   G8 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical
//       verb sequences AND identical ctx keys (no tracking state).
//
// SMOKE=1: instrument-honesty subset (R1 + G0 + G8) only, <1s.
'use strict';
// KILL-PROTOCOL NOTE (scale-onramp, ARM 1, 2026-10-15): if the recoverthrottle
// layer is deleted per the kill protocol, this proof degrades gracefully
// (INFO-SKIP, exit 0 — never MODULE_NOT_FOUND).
let W = null;
try { W = require('./policies/recoverthrottle'); }
catch (e) {
  // Only the layer's own absence is INFO-SKIP; any other load error is a
  // real failure (the 2026-10-15 redaction-corruption lesson).
  if (e.code === 'MODULE_NOT_FOUND' && /recoverthrottle/.test(e.message || '')) { /* deleted per kill protocol */ }
  else throw e;
}
if (!W) {
  console.log('INFO-SKIP: recoverthrottle layer deleted per kill protocol; mechanism proof ran GREEN pre-kill — see evidence/2026-10-15/sim-recoverthrottle.md');
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
    travelTo(x, y, force, combatExit) {
      calls.push(['travelTo', x, y, !!combatExit]);
      this.map.px = x; this.map.py = y;
      return { moved: true };
    },
    say(msg) { calls.push(['say', String(msg).slice(0, 200)]); },
    displayName(vid) { return ({ v1: 'Aldo Bren', v2: 'Bea Ciel', v3: 'Cy Dune' }[vid] || String(vid)); },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
function combatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'combat', player: true });
}
function nonCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'starvation', player: true });
}
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
    Game.travelTo(6, 6); // upkeep sortie
    return 'upkeep-ret';
  },
  fight(Game, ctx) { return 'fight-delegated'; },
};

const layered = W.withRecoverthrottle(fakeParent, 'testlayer');
const SMOKE = process.env.SMOKE === '1';

// G0 (unwrap): named exports exist and daily is a function (2026-10-14 lesson).
t('G0 named-export unwrap: recoverthrottle/withRecoverthrottle/FORTIFY_DAYS present', () => {
  assert.strictEqual(typeof W.withRecoverthrottle, 'function', 'withRecoverthrottle missing');
  assert.strictEqual(typeof W.recoverthrottle, 'object', 'recoverthrottle missing');
  assert.strictEqual(typeof W.recoverthrottle.daily, 'function', 'recoverthrottle.daily not a function');
  assert.strictEqual(W.FORTIFY_DAYS, 2, 'FORTIFY_DAYS must be 2 (succbrake spec N=2)');
});

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
function r1() {
  delete process.env.RECOVERTHROTTLE;
  const g1 = mockGame(), c1 = mockCtx(), g2 = mockGame(), c2 = mockCtx();
  assert.strictEqual(layered.daily(g1, c1), fakeParent.daily(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls, 'daily verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._rtFortifyUntil, undefined, 'tracking state written gate-off');
  assert.strictEqual(c1._rtSeenTele, undefined);
  const g3 = mockGame(), c3 = mockCtx(), g4 = mockGame(), c4 = mockCtx();
  assert.strictEqual(layered.upkeep(g3, c3), fakeParent.upkeep(g4, c4));
  assert.deepStrictEqual(g3.calls, g4.calls, 'upkeep verb sequence differs');
  assert.strictEqual(c3._rtFortifyUntil, undefined);
}
t('R1 gate-off daily+upkeep delegate identically, no tracking state', r1);

// R2 (REAL RED): gate off + scholar combat death -> successor still ranges
t('R2 REAL RED: gate-off, post-combat-death successor still ranges wild (blank unblocked)', () => {
  delete process.env.RECOVERTHROTTLE;
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
  process.env.RECOVERTHROTTLE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  const r = layered.daily(g, c);
  assert.strictEqual(r, 'daily-ret');
  assert.strictEqual(c.parentDaily, 1, 'base daily must run under the guard');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must be declined, got ' + JSON.stringify(trav));
  assert.ok(trav.some(k => k[1] === 4 && k[2] === 4), 'haven travel must pass');
  assert.ok((c._rtDeclined || 0) >= 1, 'declines counted');
  const says = g.calls.filter(k => k[0] === 'say' && /holds Haven/.test(k[1]));
  assert.strictEqual(says.length, 1, 'guard posture said exactly once, got ' + says.length);
  assert.ok(/Aldo/.test(says[0][1]) && /Bea/.test(says[0][1]), 'names the dead and the living: ' + says[0][1]);
  assert.ok(/nobody ranges till the watch stands down/.test(says[0][1]), 'improved sense-tested phrasing: ' + says[0][1]);
  assert.ok(/mantle needs a living bearer/.test(says[0][1]), 'mantle line: ' + says[0][1]);
  assert.strictEqual(c._rtFortifyDays, 1);
  // second fortify day: no repeat announcement
  g.state.scholar.day = 12;
  layered.daily(g, c);
  const says2 = g.calls.filter(k => k[0] === 'say' && /holds Haven/.test(k[1]));
  assert.strictEqual(says2.length, 1, 'no repeat announcement inside the window');
  delete process.env.RECOVERTHROTTLE;
});

// G2: expiry
t('G2 fortify expires after FORTIFY_DAYS: travel passes again', () => {
  process.env.RECOVERTHROTTLE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 13; // death day 10 + 2 = 12 < 13 -> expired
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass after expiry');
  delete process.env.RECOVERTHROTTLE;
});

// G3: chained death extends
t('G3 chained combat death inside the window extends it', () => {
  process.env.RECOVERTHROTTLE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11; layered.daily(g, c); // fortify day 1
  combatDeath(g, 11, 'v2'); mantlePass(g, 'v3', 11); // chain: v2 dies too
  g.state.scholar.day = 13; // would be expired (10+2=12) without the chain
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'window must extend on chained death');
  assert.strictEqual(c._rtWindows, 2, 'second window announced');
  delete process.env.RECOVERTHROTTLE;
});

// G4: non-combat death does not fortify
t('G4 non-combat scholar death does NOT fortify (recorded, categorized)', () => {
  process.env.RECOVERTHROTTLE = '1';
  const g = mockGame(), c = mockCtx();
  nonCombatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass (no fortify)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && /holds Haven/.test(k[1])), 'no guard posture');
  assert.strictEqual((c._rtDeaths || []).length, 1, 'death still recorded');
  assert.strictEqual(c._rtDeaths[0].category, 'starvation');
  delete process.env.RECOVERTHROTTLE;
});

// G5: combatExit passes
t('G5 combatExit (flee-by-barrier) passes the guard', () => {
  process.env.RECOVERTHROTTLE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  const fleeParent = Object.assign({}, fakeParent, {
    daily(Game, ctx) { return Game.travelTo(0, 0, false, true); },
  });
  const fleeLayered = W.withRecoverthrottle(fleeParent, 'fleelayer');
  const r = fleeLayered.daily(g, c);
  assert.ok(r && r.moved, 'combatExit travel must pass');
  assert.strictEqual(g.map.px, 0, 'flee moved the scholar');
  delete process.env.RECOVERTHROTTLE;
});

// G6: walk-home
t('G6 fortify walks an away scholar home (bounded, haven-ward)', () => {
  process.env.RECOVERTHROTTLE = '1';
  const g = mockGame(), c = mockCtx();
  g.map.px = 6; g.map.py = 6;
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const d1 = Math.abs(g.map.px - 4) + Math.abs(g.map.py - 4);
  assert.ok(d1 < 4, `must walk haven-ward (6,6)->(${g.map.px},${g.map.py})`);
  assert.ok((c._rtWalkHops || 0) >= 1 && (c._rtWalkHops || 0) <= 12, 'bounded hops');
  delete process.env.RECOVERTHROTTLE;
});

// G7: upkeep guarded
t('G7 upkeep guarded when fortifying (sortie declined)', () => {
  process.env.RECOVERTHROTTLE = '1';
  const g = mockGame(), c = mockCtx();
  combatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.upkeep(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 6 && k[2] === 6), 'upkeep sortie must be declined');
  assert.strictEqual(c.parentUpkeep, 1, 'base upkeep ran');
  delete process.env.RECOVERTHROTTLE;
});
} // !SMOKE

// G8 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical.
t('G8 det-gate: gate-off 3-day run identical verb sequences + ctx keys', () => {
  delete process.env.RECOVERTHROTTLE;
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
