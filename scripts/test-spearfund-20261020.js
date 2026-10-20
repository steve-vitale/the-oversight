#!/usr/bin/env node
// scripts/test-spearfund-20261020.js — proof test for the sim-spearfund arm
// (scripts/policies/spearfund.js, gate SPEARFUND=1).
//
// Every gate-on assertion has a gate-off (or condition-off) RED contrast
// that must show the legacy behavior. Fixture stubs for the drive; a live
// harness run for the gate-off delegation check.
//
//   1. Gate OFF = pure delegation: drive touches nothing (RED — no sf* keys,
//      no take calls). Live: spearfund-lead.daily byte-identical to
//      leadcourt.daily on the same seed.
//   2. Loot leg (gate ON): nearby unburied villager corpse holding a
//      hunting_spear + recipe L0 → corpseTakeItem(cid, idx) once,
//      ctx.sfLooted=1 (GREEN). RED contrasts: no spear in corpse → no take;
//      recipe already L1 → no take; scholar already owns a spear → no take;
//      mid-combat → no take; corpse too far → no take; buried → no take;
//      gate OFF → no take.
//   3. Craft leg (gate ON): recipe L1+ + branch+stone+vine on hand → one
//      craft attempt/day (ctx.sfSpearTries=1, sfTryDay=day) (GREEN).
//      RED contrasts: recipe L0 → no attempt; missing a material → no
//      attempt; same day twice → exactly one attempt; gate OFF → no attempt.
//      Success contrast: craft returns truthy → ctx.sfSpearCrafts=1.
//   4. Fault isolation: a throwing corpseTakeItem is counted, never
//      propagated.
//
// Usage: node scripts/test-spearfund-20261020.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const sf = require('./policies/spearfund');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const SPEAR_RECIPE = { id: 'hunting_spear', materials: { branch: 1, stone: 1, vine: 1 } };

function corpse(o) {
  return Object.assign({
    id: 'c1', kind: 'villager', buried: false,
    node: { x: 4, y: 4 }, mx: 4, my: 4,
    items: [{ itemId: 'hunting_spear', name: 'Hunting spear', units: 1 }],
  }, o || {});
}

// Minimal stub Game the drive needs.
function stubGame(o) {
  o = o || {};
  const calls = { take: [], craft: [] };
  const inv = (o.materials ? Object.entries(o.materials).map(([material, units]) => ({ material, units })) : []);
  if (o.ownsSpear) inv.push({ itemId: 'hunting_spear', name: 'Hunting spear', units: 1 });
  const G = {
    over: false,
    calls,
    map: { px: 4, py: 4 },
    state: {
      scholar: {
        day: o.day == null ? 10 : o.day,
        mx: 4, my: 4,
        equipped: o.equipped || {},
        inventory: inv,
      },
      codex: { recipes: { hunting_spear: { level: o.recipeLevel || 0 } } },
      corpses: o.corpses === undefined ? [corpse()] : o.corpses,
    },
    data: { items: [], recipes: [SPEAR_RECIPE] },
    corpses() { return this.state.corpses; },
    corpseTakeItem(cid, idx) {
      calls.take.push([cid, idx]);
      if (o.takeThrows) throw new Error('boom');
      return { itemId: 'hunting_spear' };
    },
    craft(id) { calls.craft.push(id); return o.craftResult == null ? null : o.craftResult; },
    inCombat() { return !!o.inCombat; },
    say() {},
  };
  return G;
}

(async () => {
  // ---- 1. gate OFF = pure delegation (stub-level) ----
  delete process.env.SPEARFUND;
  {
    const G = stubGame({ recipeLevel: 0, materials: { branch: 1, stone: 1, vine: 1 } });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('gate OFF: drive takes nothing', G.calls.take.length === 0);
    ok('gate OFF: drive crafts nothing', G.calls.craft.length === 0);
    ok('gate OFF: drive writes no ctx keys', Object.keys(ctx).length === 0);
  }
  // live-harness delegation check
  {
    const g1 = await loadGame({ seed: 42, mode: 'sf-delegate-a' }); await setupGame(g1.Game);
    const g2 = await loadGame({ seed: 42, mode: 'sf-delegate-b' }); await setupGame(g2.Game);
    const ctxA = {}, ctxB = {};
    leadcourt.daily(g1.Game, ctxA);
    sf.spearfundLead.daily(g2.Game, ctxB);
    const strip = (c) => JSON.stringify(c, (k, v) => k.startsWith('sf') ? undefined : v);
    ok('gate OFF: spearfund-lead.daily delegates (ctx identical sans sf keys)', strip(ctxA) === strip(ctxB));
  }

  // ---- 2. loot leg ----
  process.env.SPEARFUND = '1';
  {
    const G = stubGame({ recipeLevel: 0 });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot: corpseTakeItem called once with (c1, 0)', G.calls.take.length === 1 && G.calls.take[0][0] === 'c1' && G.calls.take[0][1] === 0);
    ok('loot: ctx.sfLooted=1', ctx.sfLooted === 1);
  }
  {
    const G = stubGame({ recipeLevel: 0, corpses: [corpse({ items: [{ itemId: 'stone_knife', units: 1 }] })] });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot RED: no spear in corpse → no take', G.calls.take.length === 0 && !ctx.sfLooted);
  }
  {
    const G = stubGame({ recipeLevel: 1 });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot RED: recipe already L1 → no take (craft lane owns it)', G.calls.take.length === 0 && !ctx.sfLooted);
  }
  {
    const G = stubGame({ recipeLevel: 0, ownsSpear: true });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot RED: scholar already owns a spear → no take', G.calls.take.length === 0 && !ctx.sfLooted);
  }
  {
    const G = stubGame({ recipeLevel: 0, inCombat: true });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot RED: mid-combat → no take', G.calls.take.length === 0 && !ctx.sfLooted);
  }
  {
    const G = stubGame({ recipeLevel: 0, corpses: [corpse({ node: { x: 9, y: 9 }, mx: 9, my: 9 })] });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot RED: corpse too far → no take', G.calls.take.length === 0 && !ctx.sfLooted);
  }
  {
    const G = stubGame({ recipeLevel: 0, corpses: [corpse({ buried: true })] });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot RED: buried corpse → no take', G.calls.take.length === 0 && !ctx.sfLooted);
  }
  delete process.env.SPEARFUND;
  {
    const G = stubGame({ recipeLevel: 0 });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('loot RED: gate OFF → no take', G.calls.take.length === 0 && !ctx.sfLooted);
  }
  process.env.SPEARFUND = '1';

  // ---- 3. craft leg ----
  {
    const G = stubGame({ corpses: [], recipeLevel: 1, materials: { branch: 1, stone: 1, vine: 1 } });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('craft: one attempt at L1+ with materials', G.calls.craft.length === 1 && G.calls.craft[0] === 'hunting_spear');
    ok('craft: ctx.sfSpearTries=1, sfTryDay=day', ctx.sfSpearTries === 1 && ctx.sfTryDay === 10);
    sf.spearfundDrive(G, ctx);
    ok('craft RED: same day → exactly one attempt', G.calls.craft.length === 1 && ctx.sfSpearTries === 1);
  }
  {
    const G = stubGame({ corpses: [], recipeLevel: 0, materials: { branch: 1, stone: 1, vine: 1 } });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('craft RED: recipe L0 → no attempt', G.calls.craft.length === 0 && !ctx.sfSpearTries);
  }
  {
    const G = stubGame({ corpses: [], recipeLevel: 1, materials: { branch: 1, stone: 1 } });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('craft RED: missing vine → no attempt', G.calls.craft.length === 0 && !ctx.sfSpearTries);
  }
  {
    const G = stubGame({ corpses: [], recipeLevel: 2, materials: { branch: 1, stone: 1, vine: 1 }, craftResult: { ok: 1 } });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('craft: success counted (sfSpearCrafts=1)', ctx.sfSpearCrafts === 1 && ctx.sfSpearTries === 1);
  }
  delete process.env.SPEARFUND;
  {
    const G = stubGame({ corpses: [], recipeLevel: 1, materials: { branch: 1, stone: 1, vine: 1 } });
    const ctx = {};
    sf.spearfundDrive(G, ctx);
    ok('craft RED: gate OFF → no attempt', G.calls.craft.length === 0 && !ctx.sfSpearTries);
  }
  process.env.SPEARFUND = '1';

  // ---- 4. fault isolation ----
  {
    const G = stubGame({ recipeLevel: 0, takeThrows: true });
    const ctx = {};
    let threw = false;
    try { sf.spearfundDrive(G, ctx); } catch (e) { threw = true; }
    ok('faults: throwing corpseTakeItem counted, never propagated', !threw && ctx.sfFaults === 1);
  }
  delete process.env.SPEARFUND;

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
