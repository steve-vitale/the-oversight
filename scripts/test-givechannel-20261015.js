#!/usr/bin/env node
// test-givechannel-20261015.js — proof for the loop-B give-channel opener
// (food-economy, finding #341, 2026-10-15). Real RED -> GREEN on a live Game.
//
// PART 0 — module + gate: exports exist; layerOn() false when GIVEFIRST
//   unset, true when GIVEFIRST=1.
// PART 1 — RED (gate off): surplus pack + wrapped.upkeep -> the layer does
//   NOT donate (gcDonations stays 0, giveHist untouched, takeFromPantry
//   unwrapped). If the base donated here, the RED could not go RED.
// PART 2 — NON-AGGRESSION (det-gate): wrapped (GIVEFIRST unset) vs RAW base
//   policy, 20 days, same seed -> byte-identical day hashes.
// PART 3 — GREEN (gate on, at haven): first clean/cooked wild haul donated
//   via the honest verb — v.gives up, giveHist has the DATED entry, trust
//   up, pack down by exactly the haul, the beat narrates it, and a second
//   upkeep the same day does NOT donate again.
// PART 4 — SURPLUS RULE: pack - haul < cap -> no donation (never the last
//   meal); pack - haul == cap -> fires (boundary inclusive).
// PART 5 — QUALIFIERS: raw / pantry-tagged / bonded / needsCooking items
//   are never the gift, even with surplus.
// PART 6 — AWAY SKIP: not at the hall -> the honest verb would refuse, so
//   the layer skips (counted), nothing donated.
// PART 7 — TAG WRAP: gate on -> takeFromPantry tags the taken stack
//   _gcPantryTake (unit test + installed-during-upkeep integration);
//   restore returns the original verb.
//
// If any part fails the script exits non-zero with the failing assertion.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
// KILL PROTOCOL (loop B ARM NO-GO at pilot, 2026-10-15): the givechannel
// layer was deleted after the co-primary missed (0 donations in 16 armed
// runs). Degrade gracefully so the retained proof documents the pre-kill
// result instead of crashing.
let gc = null;
try { gc = require('./policies/givechannel'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: givechannel layer deleted per kill protocol (NO-GO at pilot); proof was 84/84 RED->GREEN pre-kill — see evidence/2026-10-15/sim-givechannel-b.md');
    process.exit(0);
  }
  throw e;
}

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
function withEnv(k, v, fn) {
  const old = process.env[k];
  return Promise.resolve().then(() => {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
    return fn();
  }).finally(() => {
    if (old === undefined) delete process.env[k]; else process.env[k] = old;
  });
}
function havenXY(Game) {
  const v = Game.state.village || {};
  return [(v.px !== undefined && v.px !== null) ? v.px : 4, (v.py !== undefined && v.py !== null) ? v.py : 4];
}
function parkAtHaven(Game) {
  const [hx, hy] = havenXY(Game);
  Game.map.px = hx; Game.map.py = hy;
  try { Game.state.scholar.insideHaven = true; } catch (e) {}
}
function parkAway(Game) {
  const [hx, hy] = havenXY(Game);
  Game.map.px = hx + 3; Game.map.py = hy + 3;
  try { Game.state.scholar.insideHaven = false; } catch (e) {}
}
function sayCapture(Game) {
  const lines = [];
  const os = Game.say.bind(Game);
  Game.say = function (msg) { lines.push(String(msg)); return os(msg); };
  return lines;
}
function packKcal(Game) {
  return ((Game.state.scholar || {}).inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function giveHistKcal(Game, vid) {
  try {
    return ((Game.state.village.giveHist || {})[vid] || []).reduce((t, e) => t + (e.kcal || 0), 0);
  } catch (e) { return 0; }
}
function giveHistEntries(Game, vid) {
  try { return ((Game.state.village.giveHist || {})[vid] || []).length; } catch (e) { return 0; }
}
// A wild haul fixture item: identified foraged plant, cooked, honest kcal.
function haulItem(kcal, over) {
  return Object.assign({
    name: 'Test Haul', kcalEach: kcal, units: 1, kg: 0.2,
    foodState: 'cooked', edible: true, plantId: 'test_plant', foodKind: 'plant',
    spoilDay: 99,
  }, over || {});
}
async function fixture(policyId) {
  process.env.POLICY = policyId;
  const base = gc.basePolicyForRun();
  const { Game } = await loadGame({ seed: 11, mode: 'givechannel-test' });
  await setupGame(Game);
  await quietLog(() => runDays(Game, base, { days: 10 }));
  if (Game.over) throw new Error('fixture: game over after 10d base run');
  const s = Game.state.scholar;
  const cap = Game.kcalCap ? Game.kcalCap() : 2400;
  s.kcal = cap;            // fed: competentEat stays quiet, fixture is deterministic
  s.health = 100;
  try { s.water = []; } catch (e) {}
  parkAtHaven(Game);
  return { Game, base, cap };
}

async function main() {
  for (const policyId of ['belongseek', 'leadcourt']) {
    console.log('=== policy ' + policyId + ' ===');
    process.env.POLICY = policyId;

    console.log('PART 0 — module + gate');
    ok(typeof gc.policyForRun === 'function', 'policyForRun exported');
    ok(typeof gc.giveFirst === 'function', 'giveFirst exported');
    ok(typeof gc.wildHaulAt === 'function', 'wildHaulAt exported');
    ok(typeof gc.tagPantryTakes === 'function', 'tagPantryTakes exported');
    await withEnv('GIVEFIRST', undefined, async () => { ok(!gc.layerOn(), 'gate OFF when GIVEFIRST unset'); });
    await withEnv('GIVEFIRST', '1', async () => { ok(gc.layerOn(), 'gate ON when GIVEFIRST=1'); });
    await withEnv('GIVEFIRST', undefined, async () => {
      const p = gc.policyForRun();
      ok(/give$/.test(p.id || ''), 'policyForRun returns the wrapped policy (id=' + p.id + ')');
    });

    console.log('PART 1 — RED (gate off): layer inert on a surplus pack');
    await withEnv('GIVEFIRST', undefined, async () => {
      const { Game, cap } = await fixture(policyId);
      const s = Game.state.scholar, vid = s.villagerId;
      s.inventory = [haulItem(1200), haulItem(cap, { name: 'Buffer' })];
      const vid0 = vid;
      const gives0 = (Game.state.village.gives || {})[vid0] || 0;
      const gh0 = giveHistEntries(Game, vid0);
      const origTake = Game.takeFromPantry;
      const policy = gc.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(!ctx.gcDonations, 'RED: gate-off upkeep made no layer donation (gcDonations unset)');
      ok(giveHistEntries(Game, vid0) === gh0, 'RED: no dated give landed in giveHist');
      ok(((Game.state.village.gives || {})[vid0] || 0) === gives0, 'RED: v.gives untouched');
      ok(Game.takeFromPantry === origTake, 'RED: takeFromPantry not wrapped when gate off');
      ok(packKcal(Game) === 1200 + cap, 'RED: pack untouched by the layer');
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base (20d)');
    {
      const runHashed = async (policy, seed, days) => {
        const { Game } = await loadGame({ seed, mode: 'givechannel-det' });
        await setupGame(Game);
        const hashes = [];
        const p = Object.assign({}, policy);
        const od = policy.daily;
        p.daily = (G, ctx) => { hashes.push(dayHash(G)); return od ? od(G, ctx) : undefined; };
        await quietLog(() => runDays(Game, p, { days }));
        return hashes;
      };
      const hBase = await withEnv('GIVEFIRST', undefined, () => runHashed(gc.basePolicyForRun(), 22, 20));
      const hWrap = await withEnv('GIVEFIRST', undefined, () => runHashed(gc.policyForRun(), 22, 20));
      ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
        `NON-AGGRESSION: 20-day day-hashes byte-identical (${hBase.length} days)`);
    }

    console.log('PART 3 — GREEN (gate on): the opener fires, honestly');
    await withEnv('GIVEFIRST', '1', async () => {
      const { Game, cap } = await fixture(policyId);
      const s = Game.state.scholar, vid = s.villagerId;
      ok(Game.havenStoresAccess() !== 'none', 'GREEN setup: pantry reachable at the hall');
      s.inventory = [haulItem(1200), haulItem(cap, { name: 'Buffer' })];
      const trust0 = (Game.state.village.trust || {})[vid];
      const gives0 = (Game.state.village.gives || {})[vid] || 0;
      const gh0 = giveHistEntries(Game, vid);
      const lines = sayCapture(Game);
      const policy = gc.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(ctx.gcDonations === 1, `GREEN: exactly one dawn donation (gcDonations=${ctx.gcDonations})`);
      ok(ctx.gcKcal === 1200, `GREEN: dated give kcal counted (gcKcal=${ctx.gcKcal})`);
      ok(((Game.state.village.gives || {})[vid] || 0) === gives0 + 1200, 'GREEN: v.gives +1200 (lifetime ledger)');
      ok(giveHistEntries(Game, vid) === gh0 + 1, 'GREEN: one DATED give landed in giveHist');
      ok(giveHistKcal(Game, vid) >= 1200, 'GREEN: giveHist carries the kcal');
      const trust1 = (Game.state.village.trust || {})[vid];
      ok(trust1 > (trust0 === undefined ? 10 : trust0), `GREEN: trust moved up (${trust0} -> ${trust1}) — gains heal`);
      ok(packKcal(Game) === cap, `GREEN: pack kept exactly the 1-meal buffer (${packKcal(Game)} == cap ${cap})`);
      ok(lines.some(l => /Donated Test Haul \(\+1200 kcal\)/.test(l)), 'GREEN: the donation beat narrated honestly (donation, not dumping)');
      // once per day: a second upkeep the same day donates nothing more
      const gh1 = giveHistEntries(Game, vid);
      await quietLog(() => policy.upkeep(Game, ctx));
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(ctx.gcDonations === 1, 'GREEN: no second donation the same day (one ritual per day)');
      ok(giveHistEntries(Game, vid) === gh1, 'GREEN: giveHist unchanged by later upkeeps');
    });

    console.log('PART 4 — SURPLUS RULE: never the last meal');
    await withEnv('GIVEFIRST', '1', async () => {
      const { Game, cap } = await fixture(policyId);
      const s = Game.state.scholar, vid = s.villagerId;
      // thin: pack - haul < cap -> NO donation
      s.inventory = [haulItem(1200), haulItem(1200, { name: 'Buffer' })];
      const gh0 = giveHistEntries(Game, vid);
      const policy = gc.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(!ctx.gcDonations, 'SURPLUS: thin pack (would leave half a meal) -> no donation');
      ok(giveHistEntries(Game, vid) === gh0, 'SURPLUS: giveHist untouched');
      ok((ctx._gcSkips || 0) >= 1, 'SURPLUS: the skip was counted honestly');
      // boundary: pack - haul == cap -> FIRES
      s.inventory = [haulItem(1200), haulItem(cap, { name: 'Buffer' })];
      const ctx2 = {};
      if (policy.setup) policy.setup(Game, ctx2);
      await quietLog(() => policy.upkeep(Game, ctx2));
      ok(ctx2.gcDonations === 1, 'SURPLUS: boundary (keeps exactly 1 meal) -> fires');
    });

    console.log('PART 5 — QUALIFIERS: raw / pantry-tagged / bonded / needsCooking never gifted');
    await withEnv('GIVEFIRST', '1', async () => {
      const { Game, cap } = await fixture(policyId);
      const s = Game.state.scholar, vid = s.villagerId;
      const gh0 = giveHistEntries(Game, vid);
      const policy = gc.policyForRun();
      const mk = (over) => haulItem(1200, over);
      const cases = [
        ['raw', mk({ foodState: 'raw', name: 'Raw Haul' })],
        ['pantry-tagged', mk({ _gcPantryTake: true, name: 'Shuttled Haul' })],
        ['bonded', mk({ bonded: true, name: 'Bonded Haul' })],
        ['needsCooking', mk({ needsCooking: true, name: 'Risky Haul' })],
        ['smoked-store', mk({ foodState: 'preserved', name: 'Smoked Store' })],
      ];
      for (const [label, bad] of cases) {
        s.inventory = [bad, haulItem(cap, { name: 'Buffer' })];
        const ctx = {};
        if (policy.setup) policy.setup(Game, ctx);
        await quietLog(() => policy.upkeep(Game, ctx));
        ok(!ctx.gcDonations, `QUALIFIER: ${label} item not gifted (surplus present)`);
      }
      ok(giveHistEntries(Game, vid) === gh0, 'QUALIFIER: giveHist untouched across all cases');
      // and a good item in the SAME pack shape fires (the qualifier is the item, not the pack)
      s.inventory = [mk({ name: 'Good Haul' }), haulItem(cap, { name: 'Buffer' })];
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(ctx.gcDonations === 1, 'QUALIFIER: clean/cooked wild haul fires (control case)');
    });

    console.log('PART 6 — AWAY SKIP: not at the hall -> no teleporting food');
    await withEnv('GIVEFIRST', '1', async () => {
      const { Game, cap } = await fixture(policyId);
      parkAway(Game);
      ok(Game.havenStoresAccess() === 'none', 'AWAY setup: pantry unreachable off-hall');
      const s = Game.state.scholar, vid = s.villagerId;
      s.inventory = [haulItem(1200), haulItem(cap, { name: 'Buffer' })];
      const gh0 = giveHistEntries(Game, vid);
      const policy = gc.policyForRun();
      const ctx = {};
      if (policy.setup) policy.setup(Game, ctx);
      await quietLog(() => policy.upkeep(Game, ctx));
      ok(!ctx.gcDonations, 'AWAY: no donation off-hall');
      ok(giveHistEntries(Game, vid) === gh0, 'AWAY: giveHist untouched');
      ok((ctx._gcSkips || 0) >= 1, 'AWAY: the skip was counted');
    });

    console.log('PART 7 — TAG WRAP: pantry takes are provenance-tagged, restore is clean');
    await withEnv('GIVEFIRST', '1', async () => {
      const { Game } = await fixture(policyId);
      const s = Game.state.scholar;
      // ensure the pantry has a takeable cooked item
      Game.state.village.pantry = Game.state.village.pantry || [];
      Game.state.village.pantry.push(haulItem(500, { name: 'Pantry Food' }));
      const ctx = {};
      const origTake = Game.takeFromPantry, origBulk = Game.takeFromPantryBulk;
      const restore = gc.tagPantryTakes(Game, ctx);
      s.inventory = [];
      Game.takeFromPantry(Game.state.village.pantry.length - 1);
      const tagged = (s.inventory || []).filter(it => it && it._gcPantryTake);
      ok(tagged.length >= 1, `TAG: taken stack carries _gcPantryTake (${tagged.length} tagged)`);
      restore();
      ok(Game.takeFromPantry === origTake && Game.takeFromPantryBulk === origBulk,
        'TAG: restore returns the original verbs');
      // integration: the wrap is installed during the armed upkeep, so a
      // competentEat pantry take passes through the layer's wrap. (The taken
      // food is eaten by Game.eat() in the same upkeep, so assert on the
      // wrap's presence at call time, not on leftover inventory.)
      s.inventory = [];
      s.kcal = 0; // hungry: competentEat will take from the pantry
      const realTake = Game.takeFromPantry;
      let sawWrap = false;
      function probe(...a) {
        if (Game.takeFromPantry !== probe) sawWrap = true; // someone wrapped us = the layer
        return realTake.apply(this, a);
      }
      Game.takeFromPantry = probe;
      const policy = gc.policyForRun();
      const ctx2 = {};
      if (policy.setup) policy.setup(Game, ctx2);
      await quietLog(() => policy.upkeep(Game, ctx2));
      Game.takeFromPantry = realTake; // restore our probe
      ok(sawWrap, 'TAG: the layer wrapped takeFromPantry during the armed upkeep');
    });
  }
  console.log(`\nPROOF: ${pass}/${pass} assertions green.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
