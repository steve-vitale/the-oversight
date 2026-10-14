#!/usr/bin/env node
// test-takedisc-20261014.js — proof for the r29 ARM 2 take-discipline layer
// (scale-onramp, 2026-10-14). Real RED -> GREEN on a live Game, no mocks.
//
// RED (gate off): hungry scholar + stocked pantry + empty pack ->
//   base policy.upkeep does the UNDISCIPLINED pattern (multiple single-unit
//   takeFromPantry calls; the scholarreserve baseline: ~20 events/day).
// NON-AGGRESSION (gate off byte-identical): raw base vs wrapped policy
//   (TAKEDISC unset), 20 days, same seed -> identical day hashes.
// GREEN (gate on): same fixture -> wrapped policy.upkeep batches the need
//   into takeFromPantryBulk packs (single-unit takeFromPantry calls == 0),
//   each pack strictly below theftConfrontation's single-take bar
//   (min(4000, pantryKcal/2)), and the scholar ends fed (>= 85% cap).
// FORAGE-FIRST (gate on): hungry scholar + pack full of honest cooked food
//   -> NO pantry take attempted at all (neither single nor bulk).
//
// If the base policy already batched takes, the RED phase could not go
// RED — that was the brief's pre-check stop condition.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const td = require('./policies/takedisc');

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
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)].join('|');
  } catch (e) { return 'ERR'; }
}
async function runHashed(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'takedisc-test' });
  await setupGame(Game);
  const hashes = [];
  const p = Object.assign({}, policy);
  const od = policy.daily;
  p.daily = (G, ctx) => { hashes.push(dayHash(G)); return od ? od(G, ctx) : undefined; };
  await quietLog(() => runDays(Game, p, { days }));
  return hashes;
}
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
// takeCounter: wraps the take verbs to count calls + kcal (read-only).
function takeCounter(Game) {
  const c = { single: 0, singleKcal: 0, bulk: 0, bulkKcal: 0, bulkTotals: [] };
  const os = Game.takeFromPantry.bind(Game);
  Game.takeFromPantry = function (idx) {
    let k = 0;
    try { const it = (Game.state.village.pantry || [])[idx]; if (it) k = it.kcalEach || 0; } catch (e) {}
    const r = os(idx);
    c.single++; c.singleKcal += k;
    return r;
  };
  const ob = Game.takeFromPantryBulk.bind(Game);
  Game.takeFromPantryBulk = function (sel) {
    let k = 0;
    try {
      const pantry = Game.state.village.pantry || [];
      for (const [key, qty] of Object.entries(sel || {})) {
        if (key === 'water') continue;
        const it = pantry[+key];
        if (it) k += (it.kcalEach || 0) * Math.min(qty, it.units || 0);
      }
    } catch (e) {}
    const r = ob(sel);
    c.bulk++; c.bulkKcal += k; c.bulkTotals.push(k);
    return r;
  };
  return c;
}
// fixture: 10 real days to build a pantry, then a hungry scholar with an
// empty food pack. Returns { Game, base }.
async function fixture(policyId) {
  process.env.POLICY = policyId;
  const base = td.basePolicyForRun();
  const { Game } = await loadGame({ seed: 11, mode: 'takedisc-test' });
  await setupGame(Game);
  await quietLog(() => runDays(Game, base, { days: 10 }));
  const pk = pantryKcal(Game);
  if (pk < 3000) throw new Error('fixture pantry too thin: ' + Math.round(pk) + ' kcal');
  const s = Game.state.scholar;
  s.kcal = 0; // hungry
  s.inventory = []; // empty pack: no weight block, no pack food (maximal-take fixture)
  try { s.water = []; } catch (e) {}
  // park the scholar AT haven with stores access (takes are haven verbs;
  // after 10 free days the scholar is usually ranging with 'none' access)
  try {
    const v = Game.state.village || {};
    const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
    const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
    Game.map.px = hx; Game.map.py = hy;
    s.insideHaven = true;
  } catch (e) {}
  return { Game, base, pkBefore: pk };
}

async function main() {
  for (const policyId of ['belongseek', 'leadcourt']) {
    console.log('=== policy ' + policyId + ' ===');
    process.env.POLICY = policyId;

    console.log('PART 0 — module + gate');
    ok(typeof td.disciplinedPreTake === 'function', 'disciplinedPreTake exported');
    ok(typeof td.policyForRun === 'function', 'policyForRun exported');
    await withEnv('TAKEDISC', undefined, async () => { ok(!td.layerOn(), 'gate OFF when TAKEDISC unset'); });
    await withEnv('TAKEDISC', '1', async () => { ok(td.layerOn(), 'gate ON when TAKEDISC=1'); });

    console.log('PART 1 — RED (gate off): the undisciplined pattern');
    let redSingles = 0;
    await withEnv('TAKEDISC', undefined, async () => {
      const { Game, base } = await fixture(policyId);
      const c = takeCounter(Game);
      const ctx = {};
      if (base.setup) base.setup(Game, ctx);
      await quietLog(() => base.upkeep(Game, ctx));
      redSingles = c.single;
      ok(c.single > 3, `RED: base.upkeep fires ${c.single} single-unit takes (undisciplined, not batched)`);
      ok(c.bulk === 0, 'RED: base.upkeep fires 0 bulk takes');
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base');
    const hBase = await withEnv('TAKEDISC', undefined, () => runHashed(td.basePolicyForRun(), 22, 20));
    const hWrap = await withEnv('TAKEDISC', undefined, () => runHashed(td.policyForRun(), 22, 20));
    ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
      `NON-AGGRESSION: ${hBase.length} day-hashes byte-identical with TAKEDISC unset`);

    console.log('PART 3 — GREEN (gate on): batched, bar-safe, fed');
    await withEnv('TAKEDISC', '1', async () => {
      const { Game, pkBefore } = await fixture(policyId);
      const wrapped = td.policyForRun();
      const c = takeCounter(Game);
      const ctx = {};
      if (wrapped.setup) wrapped.setup(Game, ctx);
      const bar = Math.min(4000, pkBefore / 2);
      await quietLog(() => wrapped.upkeep(Game, ctx));
      ok(c.single === 0, `GREEN: 0 single-unit takes (RED was ${redSingles} undisciplined)`);
      ok(c.bulk >= 1 && c.bulk <= 4, `GREEN: ${c.bulk} bar-safe bulk pack(s) — the need batched, not 20 singles`);
      ok(c.bulkTotals.every(t => t < bar),
        `GREEN: every pack < theft bar min(4000, pantry/2)=${Math.round(bar)} (packs: ${c.bulkTotals.map(Math.round).join(',')})`);
      const s = Game.state.scholar;
      const cap = Game.kcalCap();
      ok(s.kcal >= cap * 0.85, `GREEN: scholar fed to ${Math.round(s.kcal)}/${cap} (>= 85% cap)`);
      ok((ctx.takediscPacks || 0) >= 1, 'GREEN: ctx.takediscPacks counted');
    });

    console.log('PART 4 — FORAGE-FIRST (gate on): full honest pack -> no take');
    await withEnv('TAKEDISC', '1', async () => {
      const { Game } = await fixture(policyId);
      const wrapped = td.policyForRun();
      const s = Game.state.scholar;
      const cap = Game.kcalCap();
      // pack full of honest cooked food (>= 95% cap), scholar hungry
      s.kcal = 0;
      s.inventory = [{ name: 'Test Stew', kcalEach: 500, units: 8, foodState: 'cooked',
        kg: 0.3, unit: 'bowl', edible: true, safe: true, spoilDay: 9999 }];
      const c = takeCounter(Game);
      const ctx = {};
      if (wrapped.setup) wrapped.setup(Game, ctx);
      await quietLog(() => wrapped.upkeep(Game, ctx));
      ok(c.single === 0 && c.bulk === 0,
        `FORAGE-FIRST: no pantry take attempted (single=${c.single}, bulk=${c.bulk}); the pack fed the scholar`);
      ok(s.kcal >= cap * 0.85, `FORAGE-FIRST: scholar fed from pack to ${Math.round(s.kcal)}/${cap}`);
    });
  }
  console.log(`\nALL GREEN: ${pass} assertions`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
