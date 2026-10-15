#!/usr/bin/env node
// scripts/test-bankpath-20261015.js — proof test for the bankpath layer
// (loop B, 2026-10-15, food-economy axis, the #314 bank-cap bind).
//
// The layer (scripts/policies/bankpath.js, BANKPATH=1, default OFF): wrap
// Game.chooseAbility for the parent policy's daily/upkeep; whenever a
// pending System sheet contains deep_reserves, take deep_reserves instead
// of the sheet's first entry — the honest preference of a player who knows
// the bank is the bind. Chained, never clobbered (#119).
//
// ALL GREEN is the gate before ANY sweep spend. Post-kill: the layer is
// deleted per kill protocol; the committed proof stays runnable by skipping
// the layer-dependent parts loudly instead of FATAL-ing (INFO-SKIP).
//
// PART A — gate + redirect fixtures (mock Game, no engine):
//   A1 gate off: wrapPolicy(base) === base (same reference).
//   A2 gate off: named exports are the feastscale policies.
//   A3 gate on: wrapped id 'bankpath-leadcourt'; base untouched.
//   A4 sheet with deep_reserves -> deep_reserves taken (redirect), counters.
//   A5 sheet without deep_reserves -> ch[0] taken, no redirect counters.
//   A6 no sheet -> id passes through, counters silent.
//   A7 full slots + level-up sheet: redirect fires, engine refuses (null),
//      bpDeepAcquired stays 0 (honest: preference fired, engine said no).
//   A8 gate off, layer-shaped call path: no interception (ch[0] taken).
// PART B — live engine, REAL RED:
//   B1 RED: base policy on a real Game takes ch[0] of a crafted sheet
//      containing deep_reserves — deep_reserves is PASSED OVER.
//   B2 GREEN: the layer takes deep_reserves from the same sheet; kcalCap
//      jumps 2400 -> 12000 (the bind actually addressed), maxBank 0 -> 9600.
//   B3 live: sheet without deep_reserves -> layer behaves exactly like base.
// PART C — det-gate: 30d x 2 seeds x 2 policies, base vs wrapped(gate on):
//   trajectories byte-identical AND the interceptor ran hot (bpTakeCalls>0)
//   with zero redirects (no deep_reserves in any sheet -> no divergence).
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy drives; counters
//   consistent (bpSheets distinct keys; bpTakeCalls >= bpSheets); a forced
//   deep_reserves sheet is acquired end-to-end on the live engine.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (loadGame does it).
// Game.save never stubbed.
//
// Usage: node scripts/test-bankpath-20261015.js
//        SMOKE=1 node scripts/test-bankpath-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// Post-kill: the layer is deleted per kill protocol. The committed proof
// stays runnable by skipping the layer-dependent parts loudly.
const BP_PATH = (() => { try { return require.resolve('./policies/bankpath'); } catch (e) { return null; } })();
function skipIfLayerGone(part) {
  if (!BP_PATH) { console.log(`  SKIP ${part} (layer deleted per kill protocol — scripts/policies/bankpath absent)`); return true; }
  return false;
}

// Mock engine chooseAbility: grants the id if it's in the pending sheet and
// a slot is free (level-up sheets with full slots need replaceId, like the
// real engine); clears the sheet on success. Returns non-null on grant.
function mockChooseAbility(slots) {
  return function (id, replaceId) {
    const s = this.state.scholar;
    const sheet = s.abilityChoices || [];
    const choice = sheet.find(c => c.id === id);
    if (!choice) return null;
    const isLevelUp = String(choice.src || '').indexOf('level_up:') === 0;
    if (s.abilities.length >= slots) {
      if (!isLevelUp) return null;
      if (replaceId == null) return null; // full: must name the replacement
      const ri = s.abilities.findIndex(a => a.id === replaceId);
      if (ri < 0) return null;
      s.abilities.splice(ri, 1);
    }
    s.abilities.push({ id: choice.id, name: choice.name });
    s.abilityChoices = null;
    return { id: choice.id };
  };
}
function mockGame(o) {
  const g = {
    state: { scholar: { day: 5, kcal: 1000, abilities: [], abilityChoices: null } },
    chooseAbility: mockChooseAbility(6),
    sayCalls: [],
    say(t) { this.sayCalls.push(String(t)); },
  };
  if (o) Object.assign(g, o);
  return g;
}
const sheetOf = (ids, src) => ids.map(id => ({ id, name: id, src: src || 'arrival' }));
const baseOf = () => ({
  id: 'leadcourt', desc: 'base',
  upkeep(G, ctx) { ctx.u = (ctx.u || 0) + 1; },
  daily(G, ctx) {
    ctx.d = (ctx.d || 0) + 1;
    const ch = (G.state.scholar || {}).abilityChoices;
    if (ch && ch.length && G.chooseAbility) G.chooseAbility(ch[0].id);
  },
});

// ---------------- PART A: fixtures ----------------
function partA() {
  console.log('PART A — gate + redirect fixtures');
  if (skipIfLayerGone('partA')) return;

  // A1 — gate off: wrapPolicy(base) === base.
  delete require.cache[require.resolve(BP_PATH)];
  delete process.env.BANKPATH;
  const bpOff = require(BP_PATH);
  const base = baseOf();
  check('A1 gate off: wrapPolicy(base) === base', bpOff.wrapPolicy(base, 'x') === base);

  // A2 — gate off: named exports are the feastscale policies.
  const { belongfeast, leadfeast } = require('./policies/feastscale');
  check('A2 gate off: named exports are the feastscale policies',
    bpOff.bankpathBelongseek === belongfeast && bpOff.bankpathLeadcourt === leadfeast);

  // A3 — gate on: wrapped id; base untouched.
  process.env.BANKPATH = '1';
  delete require.cache[require.resolve(BP_PATH)];
  const bp = require(BP_PATH);
  const base2 = baseOf();
  const w = bp.wrapPolicy(base2, 'bankpath-leadcourt');
  check('A3 gate on: wrapped id bankpath-leadcourt', w.id === 'bankpath-leadcourt', w.id);
  check('A3 gate on: base untouched',
    base2.id === 'leadcourt' && !base2.daily.toString().includes('bpDeep'),
    `id=${base2.id}`);

  // A4 — sheet WITH deep_reserves: redirected, acquired, counters.
  {
    const G = mockGame();
    G.state.scholar.abilityChoices = sheetOf(['green_thumb', 'deep_reserves', 'pocket_sand']);
    const ctx = {};
    w.daily(G, ctx);
    const held = G.state.scholar.abilities.map(a => a.id);
    check('A4 redirect: deep_reserves taken instead of ch[0]',
      held.length === 1 && held[0] === 'deep_reserves' &&
      ctx.bpTakeCalls === 1 && ctx.bpSheets === 1 &&
      ctx.bpDeepInSheet === 1 && ctx.bpDeepRedirect === 1 && ctx.bpDeepAcquired === 1,
      `held=[${held}] redirect=${ctx.bpDeepRedirect} acquired=${ctx.bpDeepAcquired}`);
  }

  // A5 — sheet WITHOUT deep_reserves: ch[0] taken, no redirect.
  {
    const G = mockGame();
    G.state.scholar.abilityChoices = sheetOf(['green_thumb', 'pocket_sand']);
    const ctx = {};
    w.daily(G, ctx);
    const held = G.state.scholar.abilities.map(a => a.id);
    check('A5 no-deep sheet: ch[0] taken, silent counters',
      held.length === 1 && held[0] === 'green_thumb' &&
      ctx.bpTakeCalls === 1 && ctx.bpSheets === 1 &&
      (ctx.bpDeepInSheet || 0) === 0 && (ctx.bpDeepRedirect || 0) === 0 &&
      (ctx.bpDeepAcquired || 0) === 0,
      `held=[${held}]`);
  }

  // A6 — no sheet: the interceptor passes the id through untouched.
  {
    const G = mockGame(); // no abilityChoices set
    let seenId = null;
    const orig = G.chooseAbility;
    G.chooseAbility = function (id) { seenId = id; return orig.apply(this, arguments); };
    const spy = G.chooseAbility;
    const ctx = {};
    const restore = bp.preferDeepReserves(G, ctx);
    const r = G.chooseAbility('anything');
    restore();
    check('A6 no sheet: passthrough, silent counters',
      seenId === 'anything' && r === null &&
      (ctx.bpTakeCalls || 0) === 0 && (ctx.bpSheets || 0) === 0 &&
      (ctx.bpDeepRedirect || 0) === 0 && G.chooseAbility === spy,
      `seenId=${seenId} takeCalls=${ctx.bpTakeCalls} restored=${G.chooseAbility === spy}`);
  }

  // A7 — full slots + level-up sheet: redirect fires, engine refuses, no acquire.
  {
    const G = mockGame();
    G.chooseAbility = mockChooseAbility(1); // 1 slot
    G.state.scholar.abilities = [{ id: 'green_thumb', name: 'green_thumb' }];
    G.state.scholar.abilityChoices = sheetOf(['iron_stomach', 'deep_reserves'], 'level_up:craft');
    const ctx = {};
    w.daily(G, ctx);
    const held = G.state.scholar.abilities.map(a => a.id);
    check('A7 full slots: preference fired, engine refused, nothing acquired',
      ctx.bpDeepRedirect === 1 && (ctx.bpDeepAcquired || 0) === 0 &&
      held.length === 1 && held[0] === 'green_thumb' &&
      (G.state.scholar.abilityChoices || []).length === 2,
      `redirect=${ctx.bpDeepRedirect} acquired=${ctx.bpDeepAcquired} held=[${held}]`);
  }

  // A8 — same sheet retried across days: counted once (distinct-sheet dedupe).
  {
    const G = mockGame();
    G.chooseAbility = mockChooseAbility(1);
    G.state.scholar.abilities = [{ id: 'green_thumb', name: 'green_thumb' }];
    G.state.scholar.abilityChoices = sheetOf(['iron_stomach', 'deep_reserves'], 'level_up:craft');
    const ctx = {};
    w.daily(G, ctx);
    w.daily(G, ctx);
    w.daily(G, ctx);
    check('A8 retry dedupe: 3 takes, 1 distinct sheet, 1 deep-in-sheet',
      ctx.bpTakeCalls === 3 && ctx.bpSheets === 1 && ctx.bpDeepInSheet === 1 &&
      ctx.bpDeepSrc && ctx.bpDeepSrc['level_up:craft'] === 1,
      `takes=${ctx.bpTakeCalls} sheets=${ctx.bpSheets}`);
  }

  delete process.env.BANKPATH;
}

// ---------------- PART B: live engine, REAL RED ----------------
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}

async function partB() {
  console.log('PART B — live engine (REAL RED)');
  if (skipIfLayerGone('partB')) return;
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.BANKPATH = '1';
  delete require.cache[require.resolve(BP_PATH)];
  const bp = require(BP_PATH);
  const { leadcourt } = require('./policies/leadcourt');

  async function buildGame() {
    const { Game } = await loadGame({ seed: 4242, mode: 'bankpath-proof' });
    await setupGame(Game);
    return Game;
  }
  // A crafted sheet: deep_reserves present but NOT first — the base's ch[0]
  // habit passes it over. src 'level_up:craft' exercises the src counting.
  function craftSheet(Game) {
    const mk = (id) => {
      const def = (Game.data.abilities || []).find(a => a.id === id) || {};
      return { id, name: def.name || id, description: def.description || '', flavor: def.flavor || '', src: 'level_up:craft' };
    };
    Game.state.scholar.abilityChoices = [mk('iron_stomach'), mk('deep_reserves'), mk('cold_blooded')];
    Game.state.scholar.abilities = []; // free slots: the pick lands
  }
  const heldIds = (Game) => ((Game.state.scholar || {}).abilities || []).map(a => (a && a.id) || a);

  // B1 RED: the BASE takes ch[0] (iron_stomach) — deep_reserves passed over.
  {
    const Game = await buildGame();
    craftSheet(Game);
    const ctx = {};
    await quietLog(async () => { leadcourt.daily(Game, ctx); });
    const held = heldIds(Game);
    check('B1 RED: base takes ch[0], deep_reserves passed over',
      held.includes('iron_stomach') && !held.includes('deep_reserves'),
      `held=[${held.join(',')}]`);
  }

  // B2 GREEN: the layer takes deep_reserves; the bank actually expands.
  {
    const Game = await buildGame();
    const capBefore = Game.kcalCap();
    craftSheet(Game);
    const wrapped = bp.wrapPolicy(leadcourt, 'bankpath-leadcourt');
    const ctx = {};
    await quietLog(async () => { wrapped.daily(Game, ctx); });
    const held = heldIds(Game);
    const capAfter = Game.kcalCap();
    const maxBankAfter = Game.maxBank();
    check('B2 GREEN: layer acquires deep_reserves from the sheet',
      held.includes('deep_reserves') && ctx.bpDeepRedirect === 1 && ctx.bpDeepAcquired === 1,
      `held=[${held.join(',')}] redirect=${ctx.bpDeepRedirect}`);
    check('B2 GREEN: kcalCap 2400 -> 12000 (bank_mult x5), maxBank 0 -> 9600',
      capBefore === 2400 && capAfter === 12000 && maxBankAfter === 9600,
      `cap ${capBefore}->${capAfter} maxBank=${maxBankAfter}`);
  }

  // B3 live: a sheet WITHOUT deep_reserves behaves exactly like base.
  {
    const mk = (Game, id) => {
      const def = (Game.data.abilities || []).find(a => a.id === id) || {};
      return { id, name: def.name || id, description: def.description || '', flavor: def.flavor || '', src: 'arrival' };
    };
    const GameA = await buildGame();
    GameA.state.scholar.abilityChoices = [mk(GameA, 'green_thumb'), mk(GameA, 'pocket_sand')];
    GameA.state.scholar.abilities = [];
    const ctxA = {};
    await quietLog(async () => { leadcourt.daily(GameA, ctxA); });
    const GameB = await buildGame();
    GameB.state.scholar.abilityChoices = [mk(GameB, 'green_thumb'), mk(GameB, 'pocket_sand')];
    GameB.state.scholar.abilities = [];
    const wrapped = bp.wrapPolicy(leadcourt, 'bankpath-leadcourt');
    const ctxB = {};
    await quietLog(async () => { wrapped.daily(GameB, ctxB); });
    check('B3 live: no-deep sheet identical to base (green_thumb, no redirect)',
      heldIds(GameA).join(',') === 'green_thumb' && heldIds(GameB).join(',') === 'green_thumb' &&
      (ctxB.bpDeepRedirect || 0) === 0 && dayHash(GameA) === dayHash(GameB),
      `A=[${heldIds(GameA)}] B=[${heldIds(GameB)}]`);
  }
  delete process.env.BANKPATH;
}

// ---------------- PART C: det-gate ----------------
async function partC() {
  console.log('PART C — det-gate: 30d x 2 seeds x 2 policies, base vs wrapped(gate on)');
  if (skipIfLayerGone('partC')) return;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SEEDS = [111, 222];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [];
      const trig = [];
      for (const armed of [false, true]) {
        if (armed) process.env.BANKPATH = '1'; else delete process.env.BANKPATH;
        delete require.cache[require.resolve(BP_PATH)];
        const bp = require(BP_PATH);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? bp.wrapPolicy(base, 'bankpath-' + pid) : base;
        const { Game } = await loadGame({ seed, mode: 'bankpath-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let ctxRef = null;
        wrapped.upkeep = (G, ctx) => { ctxRef = ctx; return bUpkeep ? bUpkeep(G, ctx) : undefined; };
        wrapped.daily = (G, ctx) => {
          ctxRef = ctx;
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({
          takeCalls: (ctxRef && ctxRef.bpTakeCalls) || 0,
          sheets: (ctxRef && ctxRef.bpSheets) || 0,
          redirects: (ctxRef && ctxRef.bpDeepRedirect) || 0,
        });
        delete process.env.BANKPATH;
      }
      const same = hashes[0] === hashes[1];
      // The interceptor must have RUN HOT on real sheets (else the gate is
      // weak), and with no deep_reserves in any sheet there must be zero
      // redirects and byte-identical trajectories.
      const exercised = trig[1].takeCalls > 0 && trig[1].sheets > 0;
      const silent = trig[1].redirects === 0;
      const ok = same && exercised && silent;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} takeCalls=${trig[1].takeCalls} sheets=${trig[1].sheets} redirects=${trig[1].redirects})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
      if (!exercised) console.log('    NOTE: interceptor never ran hot — gate is weak on this seed');
    }
  }
  check('det-gate: byte-identical with interceptor hot, zero redirects', fail === 0, `${pass}/4`);
}

// ---------------- SMOKE ----------------
async function smoke() {
  console.log('== bankpath SMOKE (instrument-honesty) ==');
  if (skipIfLayerGone('smoke')) return;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.BANKPATH = '1';
  delete require.cache[require.resolve(BP_PATH)];
  const bp = require(BP_PATH);
  const base = require('./policies/belongseek').belongseek;
  const policy = bp.wrapPolicy(base, 'bankpath-belongseek');
  const { Game } = await loadGame({ seed: 111, mode: 'bankpath-smoke' });
  await setupGame(Game);
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  let dailyCalls = 0, ctxRef = null;
  wrapped.daily = (G, ctx) => { dailyCalls++; ctxRef = ctx; return bDaily(G, ctx); };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 25, sampleEvery: 26 }); });
  const ctx = ctxRef || {};
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('interceptor ran hot on real sheets', (ctx.bpTakeCalls || 0) > 0 && (ctx.bpSheets || 0) > 0,
    `takeCalls=${ctx.bpTakeCalls} sheets=${ctx.bpSheets}`);
  scheck('no redirects without deep_reserves in a sheet', (ctx.bpDeepRedirect || 0) === 0,
    `redirects=${ctx.bpDeepRedirect}`);
  scheck('deep-in-sheet counter consistent with src map',
    (ctx.bpDeepInSheet || 0) === 0 || (ctx.bpDeepSrc && Object.values(ctx.bpDeepSrc).reduce((a, b) => a + b, 0) === ctx.bpDeepInSheet),
    `inSheet=${ctx.bpDeepInSheet}`);
  // End-to-end: force a deep_reserves sheet on the live engine, take it.
  const mk = (id) => {
    const def = (Game.data.abilities || []).find(a => a.id === id) || {};
    return { id, name: def.name || id, description: def.description || '', flavor: def.flavor || '', src: 'smoke' };
  };
  Game.state.scholar.abilityChoices = [mk('green_thumb'), mk('deep_reserves')];
  Game.state.scholar.abilities = [];
  const capBefore = Game.kcalCap();
  const ctx2 = {};
  await quietLog(async () => { policy.daily(Game, ctx2); });
  const held = ((Game.state.scholar || {}).abilities || []).map(a => (a && a.id) || a);
  scheck('forced deep_reserves sheet acquired end-to-end', held.includes('deep_reserves') && ctx2.bpDeepAcquired === 1,
    `held=[${held.join(',')}]`);
  scheck('kcalCap expanded by the acquisition', Game.kcalCap() === capBefore * 5,
    `cap ${capBefore}->${Game.kcalCap()}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.BANKPATH;
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smoke(); return; }
  partA();
  await partB();
  await partC();
  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
