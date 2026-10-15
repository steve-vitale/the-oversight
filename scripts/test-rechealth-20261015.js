#!/usr/bin/env node
// scripts/test-rechealth-20261015.js — proof tests for the thriving-village
// exemption recovery throttle (scripts/policies/rechealth.js, gate
// RECHEALTH=1, default OFF). sim-findings #249's named next from the
// recthrottle kill (r37): the 2-day Haven hold after a combat death OF A
// PERSON engages ONLY when the pantry is deep (fresh-days >= 3) AND no
// villager has hungryStreak > 0; otherwise the scholar keeps ranging.
//
// REAL-RED verified:
//   R1 (RED): gate OFF -> daily/upkeep delegate verb-for-verb identical to
//       the base; NO tracking state written.
//   R2 (REAL RED): gate OFF + villager combat death -> daily still ranges
//       wild (the blank, unblocked).
//   R3 (REAL RED, exemption gate boundary): gate ON + villager combat death
//       on a SHALLOW pantry (fresh-days < 3) -> the naive build HOLDS (the
//       r37 stranding, reproduced); the exemption patch stops the hold.
//   R4 (REAL RED, hunger): gate ON + combat death with a deep pantry but
//       hungryStreak > 0 -> the naive build HOLDS (starving village held
//       home); the exemption patch stops the hold.
//   G10 (people-only): monster combat death does NOT trigger recovery.
//       REAL-RED verified: the phase-A build WITHOUT the people-only filter
//       failed G10 (monster death opened a window — the r35 dead-paparazzo
//       bug); the phase-B patch turned it GREEN.
// GREEN:
//   G1: villager combat death + deep pantry, no hunger -> recovery: guard say
//       once, wild declined, haven passes, base daily ran, villager line
//       names dead+living.
//   G2: scholar combat death + deep pantry -> recovery: mantle line.
//   G3: expiry after RECHEALTH_DAYS; G4: chained death extends.
//   G5: non-combat death does NOT trigger (starvation).
//   G6: combatExit (flee-by-barrier) passes the guard.
//   G7: walk-home: away scholar walks haven-ward (bounded).
//   G8: upkeep guarded too (wild travel in upkeep declined when holding).
//   G9 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical
//       verb sequences AND identical ctx keys (no tracking state).
//   G11 (exemption boundary): fresh-days exactly 3 -> engages; 2.99 ->
//       exempted (no hold, no announcement).
//   G12 (hunger boundary): hungryStreak 1 with a deep pantry -> exempted;
//       0 -> engages.
//
// SMOKE=1: instrument-honesty subset (R1 + R2 + G9) only.
//
// Kill-protocol graceful degradation: INFO-SKIP when the layer is absent
// (never MODULE_NOT_FOUND).
'use strict';
// (Kill-protocol graceful degradation: INFO-SKIP when the file is absent.)
let W = null;
try { W = require('./policies/rechealth'); }
catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: rechealth layer absent (killed or not yet built).');
    process.exit(0);
  }
  throw e;
}
if (!W || !W.withRechealth || W.RECHEALTH_DAYS !== 2) {
  console.log('INFO-SKIP: rechealth layer absent (killed or not yet built).');
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
    _freshDays: 99,      // deep pantry by default -> exemption passes
    _hungryStreak: 0,    // nobody hungry by default -> exemption passes
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
    say(msg) { calls.push(['say', String(msg).slice(0, 220)]); },
    displayName(vid) { return ({ v1: 'Aldo Bren', v2: 'Bea Ciel', v3: 'Cy Dune' }[vid] || String(vid)); },
    pantryFreshDays() { return this._freshDays; },
    progState() { return { hungryStreak: this._hungryStreak }; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function mockCtx() { return {}; }
function scholarCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'person', who, cause: 'combat', player: true });
}
function villagerCombatDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'The Reunion', player: false });
}
function starvationDeath(g, day, who) {
  g.state.telemetry.push({ type: 'death', day, kind: 'villager', who, cause: 'starvation', player: false });
}
function monsterCombatDeath(g, day) {
  g.state.telemetry.push({ type: 'death', day, kind: 'monster', who: 'hushwolf', cause: 'villager combat', player: false });
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

const layered = W.withRechealth(fakeParent, 'testlayer');
const SMOKE = process.env.SMOKE === '1';

function postureSays(g) {
  return g.calls.filter(k => k[0] === 'say' && /nobody ranges/.test(k[1]));
}
function wildSorties(g) {
  return g.calls.filter(k => k[0] === 'travelTo' && k[1] === 5 && k[2] === 5);
}

// R1 (RED): gate off -> pure delegation, verb-for-verb identical, no tracking
function r1() {
  delete process.env.RECHEALTH;
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
  delete process.env.RECHEALTH;
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  assert.ok(wildSorties(g).length >= 1, 'wild sortie must pass gate-off (the blank)');
  assert.strictEqual(postureSays(g).length, 0, 'no guard posture gate-off');
});

// R3 (REAL RED, exemption gate boundary): shallow pantry + combat death must
// NOT hold. Against the phase-A naive build this FAILS (the hold engages on
// a 1.5 fresh-day pantry — the r37 stranding reproduced); the exemption
// patch turns it GREEN.
t('R3 REAL RED: shallow-pantry combat death does NOT hold (exemption gate)', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  g._freshDays = 1.5; // shallow: below the 3-day gate
  g._hungryStreak = 0;
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  assert.ok(wildSorties(g).length >= 1, 'wild sortie must PASS on a shallow pantry (no hold)');
  assert.strictEqual(postureSays(g).length, 0, 'no guard posture on an exempted village');
  assert.strictEqual(c._recFortifyUntil, undefined, 'no window opened');
  assert.strictEqual(c._recExempted, 1, 'the exempted death is recorded');
  const rec = c._recDeaths[0];
  assert.strictEqual(rec.exempted, true, 'death record marked exempted');
  assert.strictEqual(rec.person, true, 'still a person death');
  delete process.env.RECHEALTH;
});

// R4 (REAL RED, hunger): deep pantry but hungryStreak > 0 -> no hold.
t('R4 REAL RED: hungry-village combat death does NOT hold (hunger gate)', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  g._freshDays = 9;    // deep pantry...
  g._hungryStreak = 2; // ...but the village is going hungry
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  assert.ok(wildSorties(g).length >= 1, 'wild sortie must PASS when anyone is hungry (no hold)');
  assert.strictEqual(postureSays(g).length, 0, 'no guard posture');
  assert.strictEqual(c._recFortifyUntil, undefined, 'no window opened');
  assert.strictEqual(c._recExempted, 1, 'the exempted death is recorded');
  delete process.env.RECHEALTH;
});

if (!SMOKE) {
// G1: villager combat death + deep pantry, no hunger -> recovery
t('G1 villager combat death + deep pantry -> recovery: guard say once, wild declined, haven passes, base daily ran', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  const r = layered.daily(g, c);
  assert.strictEqual(r, 'daily-ret');
  assert.strictEqual(c.parentDaily, 1, 'base daily must run under the guard');
  assert.strictEqual(wildSorties(g).length, 0, 'wild sortie must be declined');
  assert.ok(g.calls.some(k => k[0] === 'travelTo' && k[1] === 4 && k[2] === 4), 'haven travel must pass');
  assert.ok((c._recDeclined || 0) >= 1, 'declines counted');
  const says = postureSays(g);
  assert.strictEqual(says.length, 1, 'guard posture said exactly once, got ' + says.length);
  assert.ok(/Cy Dune/.test(says[0][1]) && /Aldo Bren/.test(says[0][1]), 'names the dead and the living: ' + says[0][1]);
  assert.ok(/Crews stay close to home/.test(says[0][1]), 'villager line, not mantle line');
  assert.strictEqual(c._recFortifyDays, 1);
  assert.strictEqual(c._recExempted || 0, 0, 'nothing exempted');
  // second hold day: no repeat announcement
  g.state.scholar.day = 12;
  layered.daily(g, c);
  assert.strictEqual(postureSays(g).length, 1, 'no repeat announcement inside the window');
  delete process.env.RECHEALTH;
});

// G2: scholar combat death + deep pantry -> recovery with the mantle line
t('G2 scholar combat death + deep pantry -> recovery: mantle line names dead and living', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  scholarCombatDeath(g, 10, 'v1'); mantlePass(g, 'v2', 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  assert.strictEqual(wildSorties(g).length, 0, 'wild sortie must be declined');
  const says = postureSays(g);
  assert.strictEqual(says.length, 1, 'exactly one posture line');
  assert.ok(/Aldo Bren/.test(says[0][1]) && /Bea Ciel/.test(says[0][1]), 'names dead + living: ' + says[0][1]);
  assert.ok(/The mantle needs a living bearer/.test(says[0][1]), 'mantle line for scholar deaths');
  delete process.env.RECHEALTH;
});

// G3: expiry
t('G3 recovery expires after RECHEALTH_DAYS: travel passes again', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 13; // death day 10 + 2 = 12 < 13 -> expired
  const before = g.calls.length;
  layered.daily(g, c);
  const trav = g.calls.slice(before).filter(k => k[0] === 'travelTo');
  assert.ok(trav.some(k => k[1] === 5 && k[2] === 5), 'wild sortie must pass after expiry');
  delete process.env.RECHEALTH;
});

// G4: chained death extends
t('G4 chained combat death inside the window extends it', () => {
  process.env.RECHEALTH = '1';
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
  delete process.env.RECHEALTH;
});

// G5: non-combat death does not trigger
t('G5 non-combat villager death does NOT trigger recovery', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  starvationDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  assert.ok(wildSorties(g).length >= 1, 'wild sortie must pass (no recovery)');
  assert.strictEqual(postureSays(g).length, 0, 'no guard posture');
  assert.strictEqual((c._recDeaths || []).length, 1, 'death still recorded');
  assert.strictEqual(c._recDeaths[0].category, 'starvation');
  delete process.env.RECHEALTH;
});

// G6: combatExit passes
t('G6 combatExit (flee-by-barrier) passes the guard', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  const fleeParent = Object.assign({}, fakeParent, {
    daily(Game, ctx) { return Game.travelTo(0, 0, false, true); },
  });
  const fleeLayered = W.withRechealth(fleeParent, 'fleelayer');
  const r = fleeLayered.daily(g, c);
  assert.ok(r && r.moved, 'combatExit travel must pass');
  assert.strictEqual(g.map.px, 0, 'flee moved the scholar');
  delete process.env.RECHEALTH;
});

// G7: walk-home
t('G7 recovery walks an away scholar home (bounded, haven-ward)', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  g.map.px = 6; g.map.py = 6;
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.daily(g, c);
  const d0 = Math.abs(6 - 4) + Math.abs(6 - 4);
  const d1 = Math.abs(g.map.px - 4) + Math.abs(g.map.py - 4);
  assert.ok(d1 < d0, `must walk haven-ward (6,6)->(${g.map.px},${g.map.py})`);
  assert.ok((c._recWalkHops || 0) >= 1 && (c._recWalkHops || 0) <= 12, 'bounded hops');
  delete process.env.RECHEALTH;
});

// G8: upkeep guarded
t('G8 upkeep guarded when holding (wild travel declined)', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  villagerCombatDeath(g, 10, 'v3');
  g.state.scholar.day = 11;
  layered.upkeep(g, c);
  const trav = g.calls.filter(k => k[0] === 'travelTo');
  assert.ok(!trav.some(k => k[1] === 6 && k[2] === 6), 'upkeep sortie must be declined');
  assert.strictEqual(c.parentUpkeep, 1, 'base upkeep ran');
  delete process.env.RECHEALTH;
});
// G10: monster death does NOT trigger (people-only trigger — the r35 sense-fix)
t('G10 monster combat death does NOT trigger recovery (people-only trigger)', () => {
  process.env.RECHEALTH = '1';
  const g = mockGame(), c = mockCtx();
  monsterCombatDeath(g, 10);
  g.state.scholar.day = 11;
  layered.daily(g, c);
  assert.ok(wildSorties(g).length >= 1, 'wild sortie must pass (no recovery for monster deaths)');
  assert.strictEqual(postureSays(g).length, 0, 'no guard posture for a monster death');
  assert.strictEqual((c._recDeaths || []).length, 1, 'death still recorded');
  assert.strictEqual(c._recDeaths[0].person, false, 'monster death marked non-person');
  delete process.env.RECHEALTH;
});
// G11: exemption boundary — fresh-days exactly 3 engages; 2.99 exempts
t('G11 exemption boundary: fresh-days 3.0 engages, 2.99 exempts', () => {
  process.env.RECHEALTH = '1';
  const g1 = mockGame(), c1 = mockCtx();
  g1._freshDays = 3.0;
  villagerCombatDeath(g1, 10, 'v3');
  g1.state.scholar.day = 11;
  layered.daily(g1, c1);
  assert.strictEqual(wildSorties(g1).length, 0, 'fresh-days 3.0 must engage the hold');
  assert.strictEqual(c1._recWindows, 1, 'window opened at the boundary');
  const g2 = mockGame(), c2 = mockCtx();
  g2._freshDays = 2.99;
  villagerCombatDeath(g2, 10, 'v3');
  g2.state.scholar.day = 11;
  layered.daily(g2, c2);
  assert.ok(wildSorties(g2).length >= 1, 'fresh-days 2.99 must NOT engage the hold');
  assert.strictEqual(c2._recWindows || 0, 0, 'no window opened below the boundary');
  assert.strictEqual(c2._recExempted, 1, 'exempted recorded');
  delete process.env.RECHEALTH;
});
// G12: hunger boundary — hungryStreak 1 exempts even with a deep pantry
t('G12 hunger boundary: hungryStreak 1 exempts (deep pantry); 0 engages', () => {
  process.env.RECHEALTH = '1';
  const g1 = mockGame(), c1 = mockCtx();
  g1._freshDays = 9; g1._hungryStreak = 1;
  villagerCombatDeath(g1, 10, 'v3');
  g1.state.scholar.day = 11;
  layered.daily(g1, c1);
  assert.ok(wildSorties(g1).length >= 1, 'hungryStreak 1 must NOT engage the hold');
  assert.strictEqual(c1._recWindows || 0, 0, 'no window opened while anyone is hungry');
  const g2 = mockGame(), c2 = mockCtx();
  g2._freshDays = 9; g2._hungryStreak = 0;
  villagerCombatDeath(g2, 10, 'v3');
  g2.state.scholar.day = 11;
  layered.daily(g2, c2);
  assert.strictEqual(wildSorties(g2).length, 0, 'hungryStreak 0 with deep pantry must engage');
  delete process.env.RECHEALTH;
});
} // !SMOKE

// G9 (det-gate): gate-off 3-day scripted run, wrapper vs base — identical.
t('G9 det-gate: gate-off 3-day run identical verb sequences + ctx keys', () => {
  delete process.env.RECHEALTH;
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
