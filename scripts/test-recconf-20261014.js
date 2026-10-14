#!/usr/bin/env node
// scripts/test-recconf-20261014.js — proof tests for the recovery throttle,
// stratified re-confirm (scripts/policies/recconf.js, gate RECCONF=1,
// default OFF, base policy leadfeast).
//
// Rebuilt from the preserved spec evidence/2026-10-14/sim-recoverylever.md
// (r35, KILLED at confirm by 0.5d per §14; metric review prescribed the
// stratified/proportional re-confirm — this is that run). The PEOPLE-ONLY
// trigger sense-fix from r35 is part of the spec, not a rediscovery.
//
// THE DESIGN: after any combat death OF A PERSON (the scholar, player:true,
// OR a villager — kind villager/person; NEVER a monster), the village holds
// Haven for RECOVERY_DAYS=2 days — the scholar is Haven-bound, the travel
// guard declines travelTo away from the haven tile ({moved:false}),
// combatExit (flee-by-barrier) always passes, the guard-posture line fires
// once per window-opening naming the dead and the living. Chained combat
// deaths extend the window. Non-combat deaths are recorded, don't trigger.
// No new verbs; every call is an existing engine path.
//
// REAL RED-verified:
//   R1 (RED): gate OFF -> daily/upkeep delegate verb-for-verb identical to
//       the base; NO tracking state written.
//   R2 (REAL RED): gate OFF + villager combat death -> daily still ranges
//       wild (the blank, unblocked).
//   G10 (sense-driven, RED against the pre-fix build): monster combat death
//       does NOT trigger — the village doesn't mourn the hushwolf. The
//       first build of this layer reproduces the r35 pre-fix bug (fires on
//       monster deaths) so G10 genuinely fails RED, then the people-only
//       patch turns it GREEN.
// GREEN:
//   G1: villager combat death -> recovery: guard say once, wild declined,
//       haven passes, base daily ran, villager line names dead+living.
//   G2: scholar combat death -> recovery: mantle line names dead+living.
//   G3: expiry after RECOVERY_DAYS -> travel passes again.
//   G4: chained combat death inside the window EXTENDS it.
//   G5: non-combat death does NOT trigger (starvation).
//   G6: combatExit (flee-by-barrier) passes the guard.
//   G7: walk-home: away scholar walks haven-ward (bounded).
//   G8: upkeep guarded too (wild travel in upkeep declined when holding).
//   G9 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical
//       verb sequences AND identical ctx keys (no tracking state).
//
// SMOKE=1: instrument-honesty subset (R1 + G9) only.
//
// Kill-protocol graceful degradation: INFO-SKIP when the layer file is
// absent (killed arm); never MODULE_NOT_FOUND.
'use strict';
// The gate is read per call, so tests toggle the env between runs.
// (Kill-protocol graceful degradation: INFO-SKIP when the file is absent.)
let W = null;
try { W = require('./policies/recconf'); }
catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: recconf layer absent (killed or not yet built).');
    process.exit(0);
  }
  throw e;
}
if (!W || !W.withRecovery) {
  console.log('INFO-SKIP: recconf layer absent (killed or not yet built).');
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
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [-1, 0], [0, -1]]) out.push({ x: px + dx, y: py + dy });
      return out;
    },
    travelTo(x, y, force, combatExit) {
      calls.push(['travelTo', x, y, !!combatExit]);
      this.map.px = x; this.map.py = y;
      return { moved: true };
    },
    say(msg) { calls.push(['say', String(msg).slice(0, 240)]); },
    displayName(vid) { return ({ v1: 'Aldo Bren', v2: 'Bea Ciel', v3: 'Cy Dune' }[vid] || String(vid)); },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
// scholar combat death tele (engine's death stream shape; day stamped by engine)
function scholarCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'combat', player: true });
}
// villager combat death (monster-named cause — the engine's combat shape)
function villagerCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'The Reunion', player: false });
}
function starvationDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'starvation', player: false });
}
function monsterDeath(g, day, mid) {
  g.state.telemetry.push({ type: 'death', day, kind: 'monster', who: mid, cause: 'villager combat', player: false });
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

const layered = W.withRecovery(fakeParent, 'testlayer');
const SMOKE = process.env.SMOKE === '1';

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
function r1() {
  delete process.env.RECCONF;
  const g1 = mockGame(), c1 = mockCtx(), g2 = mockGame(), c2 = mockCtx();
  assert.strictEqual(layered.daily(g1, c1), fakeParent.daily(g2, c2));
  assert.deepStrictEqual(g1.calls, g2.calls, 'daily verb sequence differs: ' + JSON.stringify(g1.calls));
  assert.strictEqual(c1._recFortifyUntil, undefined, 'tracking state written gate-off');
  assert.strictEqual(c1._recSeen, undefined);
  const g3 = mockGame(), c3 = mockCtx(), g4 = mockGame(), c4 = mockCtx();
  assert.strictEqual(layered.upkeep(g3, c3), fakeParent.upkeep(g4, c4));
  assert.deepStrictEqual(g3.calls, g4.calls, 'upkeep verb sequence differs');
  assert.strictEqual(c3._recFortifyUntil, undefined);
}
t('R1 gate-off daily+upkeep delegate identically, no tracking state', r1);

// R2 (REAL RED): gate off + villager combat death -> daily still ranges wild
t('R2 REAL RED: gate-off, post-combat-death daily still ranges wild (blank unblocked)', () => {
  delete process.env.RECCONF;
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass gate-off (the blank)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && /nobody ranges/.test(k[1])), 'no guard posture gate-off');
});

if (!SMOKE) {
// G1: villager combat death -> recovery
t('G1 villager combat death -> recovery: guard say once, wild declined, haven passes, base daily ran', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  const r = layered.daily(g, c);
  assert.strictEqual(r, 'daily-ret');
  assert.strictEqual(c.parentDaily, 1, 'base daily must run under the guard');
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must be declined, got ' + JSON.stringify(trav));
  assert.ok(trav.some(k => k[1] === 4 && k[2] === 4), 'haven travel must pass');
  assert.ok((c._recDeclined || 0) >= 1, 'declines counted');
  const says = g.calls.filter(k => k[0] === 'say' && /nobody ranges/.test(k[1]));
  assert.strictEqual(says.length, 1, 'guard posture said exactly once, got ' + says.length);
  assert.ok(/Cy Dune/.test(says[0][1]) && /Aldo Bren/.test(says[0][1]), 'names the dead and the living: ' + says[0][1]);
  assert.ok(/Crews stay close to home/.test(says[0][1]), 'villager line, not mantle line');
  assert.strictEqual(c._recFortifyDays, 1);
  // second hold day: no repeat announcement
  g.state.scholar.day = 12;
  layered.daily(g, c);
  const says2 = g.calls.filter(k => k[0] === 'say' && /nobody ranges/.test(k[1]));
  assert.strictEqual(says2.length, 1, 'no repeat announcement inside the window');
  delete process.env.RECCONF;
});

// G2: scholar combat death -> recovery with the mantle line
t('G2 scholar combat death -> recovery: mantle line names dead and living', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  scholarCombatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must be declined');
  const says = g.calls.filter(k => k[0] === 'say' && /nobody ranges/.test(k[1]));
  assert.strictEqual(says.length, 1, 'exactly one posture line');
  assert.ok(/Aldo Bren/.test(says[0][1]) && /Bea Ciel/.test(says[0][1]), 'names dead + living: ' + says[0][1]);
  assert.ok(/The mantle needs a living bearer/.test(says[0][1]), 'mantle line for scholar deaths');
  delete process.env.RECCONF;
});

// G3: expiry
t('G3 recovery expires after RECOVERY_DAYS: travel passes again', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  assert.strictEqual(W.RECOVERY_DAYS, 2);
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 13; // death day 10 + 2 = 12 < 13 -> expired
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass after expiry');
  delete process.env.RECCONF;
});

// G4: chained death extends
t('G4 chained combat death inside the window extends it', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11; layered.daily(g, c); // hold day 1
  villagerCombatDeath(g, 11, 'v2'); // chain: another death inside the window
  g.state.scholar.day = 13; // would be expired (10+2=12) without the chain
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 5 && k[2] === 5), 'window must extend on chained death');
  assert.strictEqual(c._recWindows, 2, 'second window announced');
  delete process.env.RECCONF;
});

// G5: non-combat death does not trigger
t('G5 non-combat villager death does NOT trigger recovery', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  starvationDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass (no recovery)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && /nobody ranges/.test(k[1])), 'no guard posture');
  assert.strictEqual((c._recDeaths || []).length, 1, 'death still recorded');
  assert.strictEqual(c._recDeaths[0].category, 'starvation');
  delete process.env.RECCONF;
});

// G6: combatExit passes
t('G6 combatExit (flee-by-barrier) passes the guard', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  const fleeParent = Object.assign({}, fakeParent, {
    daily(Game, ctx) { return Game.travelTo(0, 0, false, true); },
  });
  const fleeLayered = W.withRecovery(fleeParent, 'fleelayer');
  const r = fleeLayered.daily(g, c);
  assert.ok(r && r.moved, 'combatExit travel must pass');
  assert.strictEqual(g.map.px, 0, 'flee moved the scholar');
  delete process.env.RECCONF;
});

// G7: walk-home
t('G7 recovery walks an away scholar home (bounded, haven-ward)', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  g.map.px = 6; g.map.py = 6;
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const d0 = Math.abs(6 - 4) + Math.abs(6 - 4);
  const d1 = Math.abs(g.map.px - 4) + Math.abs(g.map.py - 4);
  assert.ok(d1 < d0, `must walk haven-ward (6,6)->(${g.map.px},${g.map.py})`);
  assert.ok((c._recWalkHops || 0) >= 1 && (c._recWalkHops || 0) <= 12, 'bounded hops');
  delete process.env.RECCONF;
});

// G8: upkeep guarded
t('G8 upkeep guarded when holding (wild travel declined)', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.upkeep(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 6 && k[2] === 6), 'upkeep sortie must be declined');
  assert.strictEqual(c.parentUpkeep, 1, 'base upkeep ran');
  delete process.env.RECCONF;
});
// G10: monster death does NOT trigger (the village doesn't mourn the hushwolf)
t('G10 monster combat death does NOT trigger recovery (people-only trigger)', () => {
  process.env.RECCONF = '1';
  const g = mockGame(), c = mockCtx();
  monsterDeath(g, 10, 'paparazzo');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass (no recovery for monster deaths)');
  assert.ok(!g.calls.some(k => k[0] === 'say' && /nobody ranges/.test(k[1])), 'no guard posture for a monster death');
  assert.strictEqual((c._recDeaths || []).length, 1, 'death still recorded');
  assert.strictEqual(c._recDeaths[0].person, false, 'monster death marked non-person');
  delete process.env.RECCONF;
});
} // !SMOKE

// G9 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical.
t('G9 det-gate: gate-off 3-day run identical verb sequences + ctx keys', () => {
  delete process.env.RECCONF;
  const runScript = (pol) => {
    const g = mockGame(), c = mockCtx();
    for (let d = 10; d <= 12; d++) {
      g.state.scholar.day = d;
      if (d === 11) { villagerCombatDeath(g, d, 'v3'); }
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
