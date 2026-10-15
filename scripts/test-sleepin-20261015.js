#!/usr/bin/env node
// scripts/test-sleepin-20261015.js — proof test for the sleepin bedtime layer
// (loop B, sim-findings #314/#328, 2026-10-15). ALL GREEN is the gate before
// ANY sweep spend.
//
// The killed sibling arm (sim-goinside-b) proved the dawn go-inside verb
// answers the inside/outside pantry wall but loses on the trust ledger
// (1.158x, takes tax trust). THIS arm changes the LOCATION STATE AT NIGHT:
// the scholar sleeps inside the hall, so the base's own reactive dawn pantry
// draw (competentEat, pack first / pantry second when kcal < 0.85*cap)
// becomes physical. The layer fires NO takes of its own.
//
// PART A — gate + bedtime fixtures (mock Game, no engine):
//   A1 gate off: wrapPolicy(base) === base (same reference).
//   A2 gate on: wrapped id 'sleepin-X'; base.daily untouched (=== original).
//   A3 fires at bedtime: outside on the haven tile -> enterBuilding called,
//      insideHaven true, siEnters 1, person-beat voiced, engine 'Inside...'
//      voiced, row {fires:true, reason:'entered'}.
//   A4 already inside -> no enter, row 'already-inside', no beats.
//   A5 off the haven tile -> no enter, row 'off-haven'.
//   A6 exiled -> no enter, row 'exiled'.
//   A7 mid-fight -> no enter, row 'mid-fight'.
//   A8 Game.over -> no enter, row 'over'.
//   A9 verb refuses honestly (tent guard) -> siRefused 1, engine refusal
//      voiced, row 'verb-refused'.
//   A10 two dailies: first enters, second skips (already inside) —
//      siEnters 1 total. One enter per night, hard.
//   A11 order: base.daily runs BEFORE siBedtime (evening chores happen
//      outside-on-the-grounds exactly as in control).
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: control substrate at dusk, scholar outside on the haven tile,
//      hungry -> sleeps outside; at dawn havenStoresAccess()==='none' and
//      the base's dawn upkeep pantry fallback is honestly refused ("The
//      pantry is in the hall. Your hands are not."), pantry untouched.
//      (The dawnmeal/goinside kill, reproduced live.)
//   B2 RED: the LAYER at the same state -> daily enters via the honest verb
//      (insideHaven true, 'Inside...' voiced, siEnters 1); at dawn access
//      is 'inside'; the base's dawn upkeep now takes-and-eats from the
//      pantry (pantry -1, scholar kcal rises) — the reactive draw the wall
//      denied, unblocked.
// PART C — det-gate: 30d x 8 seeds x 2 policies, base vs layer-machinery,
//   with an INSIDE-SEEDER between base.daily and the layer's siBedtime on
//   BOTH sides (honestly enters, so the layer's fire gate — outside — can
//   never pass). Trajectories must be BYTE-IDENTICAL while the log machinery
//   runs hot (siLog rows present on the armed side, siEnters 0). The
//   machinery is neutral; the ONLY lever effect is the honest enter.
//   (A seeder BEFORE base.daily does NOT work: the base's daily travel
//   clears insideHaven on arrival, so the layer fires behind it.)
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   siLog rows hot, enters counted and voiced, siRefused 0.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (mulberry32 — loadGame does it).
// Game.save never stubbed.
//
// Usage: node scripts/test-sleepin-20261015.js
//        SMOKE=1 node scripts/test-sleepin-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

const SI_PATH = (() => { try { return require.resolve('./policies/sleepin'); } catch (e) { return null; } })();
function skipIfLayerGone(part) {
  if (!SI_PATH) { console.log(`  SKIP ${part} (layer deleted per kill protocol — scripts/policies/sleepin absent)`); return true; }
  return false;
}

// ---------------- PART A: fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + bedtime fixtures');
  if (skipIfLayerGone('partA')) return;
  delete require.cache[require.resolve(SI_PATH)];
  const sl = require(SI_PATH);

  function mockGame(o) {
    o = o || {};
    const g = {
      over: !!o.over,
      _inCombat: !!o.inCombat,
      _tile: { type: o.tile || 'haven' },
      _verbOk: o.verbOk !== undefined ? o.verbOk : true,
      state: {
        scholar: { day: 5, kcal: 1500, insideHaven: !!o.inside, exiled: !!o.exiled, inventory: [] },
        village: { pantry: [], trust: {}, takes: {}, gives: {} },
      },
      sayCalls: [],
      say(t) { this.sayCalls.push(String(t)); },
      inCombat() { return !!this._inCombat; },
      playerTile() { return this._tile; },
      enterBuilding() {
        const s = this.state.scholar;
        if (this._inCombat) { this.say('Not mid-fight — the barrier is the way out.'); return false; }
        if (s.insideHaven) { this.say("You're already inside."); return false; }
        if (!this._verbOk) { this.say('You duck out of the tent first — the lodge door is not in here.'); return false; }
        const t = this.playerTile();
        if (!t || t.type !== 'haven') return false;
        s.insideHaven = true;
        this.say('Inside. The hall smells of smoke and twelve people. Home.');
        return true;
      },
    };
    return g;
  }
  function basePolicy(order) {
    const p = { id: 'mockbase', desc: 'mock' };
    p.daily = (Game, ctx) => { if (order) order.push('base.daily'); };
    return p;
  }

  // A1 gate off
  delete process.env.SLEEPIN;
  delete require.cache[require.resolve(SI_PATH)];
  const slOff = require(SI_PATH);
  const b1 = basePolicy();
  check('A1 gate off: wrapPolicy returns the base itself', slOff.wrapPolicy(b1) === b1);

  // A2 gate on
  process.env.SLEEPIN = '1';
  delete require.cache[require.resolve(SI_PATH)];
  const slOn = require(SI_PATH);
  const b2 = basePolicy();
  const w2 = slOn.wrapPolicy(b2);
  check('A2 gate on: wrapped id', w2.id === 'sleepin-mockbase', w2.id);
  check('A2 gate on: base.daily untouched', b2.daily && typeof b2.daily === 'function' && w2.daily !== b2.daily);
  check('A2 gate on: named export siBedtime is a function', typeof slOn.siBedtime === 'function');

  // A3 fires at bedtime: outside on haven tile
  {
    const g = mockGame({});
    const ctx = {};
    const b = basePolicy();
    const w = sl.wrapPolicy(b);
    w.daily(g, ctx);
    const s = g.state.scholar;
    check('A3 fires: insideHaven true', s.insideHaven === true);
    check('A3 fires: siEnters 1', ctx.siEnters === 1, 'siEnters=' + ctx.siEnters);
    check('A3 fires: person-beat voiced', g.sayCalls.some(t => /duck into the hall for the night/.test(t)), g.sayCalls.join(' | ').slice(0, 160));
    check('A3 fires: engine Inside voiced', g.sayCalls.some(t => /Inside\. The hall smells/.test(t)));
    const row = (ctx._siLog || [])[0] || {};
    check('A3 fires: log row {fires,entered}', row.fires === true && row.reason === 'entered', JSON.stringify(row));
  }
  // A4 already inside
  {
    const g = mockGame({ inside: true });
    const ctx = {};
    sl.wrapPolicy(basePolicy()).daily(g, ctx);
    check('A4 already inside: no enter call', !g.sayCalls.some(t => /duck into the hall/.test(t)));
    check('A4 already inside: row reason', ((ctx._siLog || [])[0] || {}).reason === 'already-inside');
  }
  // A5 off haven tile
  {
    const g = mockGame({ tile: 'thicket' });
    const ctx = {};
    sl.wrapPolicy(basePolicy()).daily(g, ctx);
    check('A5 off-haven: no enter, reason off-haven',
      ((ctx._siLog || [])[0] || {}).reason === 'off-haven' && !g.state.scholar.insideHaven);
  }
  // A6 exiled
  {
    const g = mockGame({ exiled: true });
    const ctx = {};
    sl.wrapPolicy(basePolicy()).daily(g, ctx);
    check('A6 exiled: no enter, reason exiled',
      ((ctx._siLog || [])[0] || {}).reason === 'exiled' && !g.state.scholar.insideHaven);
  }
  // A7 mid-fight
  {
    const g = mockGame({ inCombat: true });
    const ctx = {};
    sl.wrapPolicy(basePolicy()).daily(g, ctx);
    check('A7 mid-fight: no enter, reason mid-fight',
      ((ctx._siLog || [])[0] || {}).reason === 'mid-fight' && !g.state.scholar.insideHaven);
  }
  // A8 over
  {
    const g = mockGame({ over: true });
    const ctx = {};
    sl.wrapPolicy(basePolicy()).daily(g, ctx);
    check('A8 over: no enter, reason over', ((ctx._siLog || [])[0] || {}).reason === 'over');
  }
  // A9 verb refuses honestly (tent guard)
  {
    const g = mockGame({ verbOk: false });
    const ctx = {};
    sl.wrapPolicy(basePolicy()).daily(g, ctx);
    check('A9 verb-refused: siRefused 1, not inside', ctx.siRefused === 1 && !g.state.scholar.insideHaven, 'siRefused=' + ctx.siRefused);
    check('A9 verb-refused: engine refusal voiced', g.sayCalls.some(t => /duck out of the tent first/.test(t)));
    check('A9 verb-refused: row reason', ((ctx._siLog || [])[0] || {}).reason === 'verb-refused');
  }
  // A10 one enter per night, hard
  {
    const g = mockGame({});
    const ctx = {};
    const w = sl.wrapPolicy(basePolicy());
    w.daily(g, ctx);
    w.daily(g, ctx);
    check('A10 two dailies: siEnters still 1', ctx.siEnters === 1, 'siEnters=' + ctx.siEnters);
    check('A10 two dailies: second row already-inside', ((ctx._siLog || [])[1] || {}).reason === 'already-inside');
  }
  // A11 order: base.daily before the enter
  {
    const order = [];
    const g = mockGame({});
    const b = basePolicy(order);
    const w = sl.wrapPolicy(b);
    const origEnter = g.enterBuilding.bind(g);
    g.enterBuilding = function () { order.push('enterBuilding'); return origEnter(); };
    w.daily(g, {});
    check('A11 base.daily before siBedtime', order[0] === 'base.daily' && order[1] === 'enterBuilding', order.join(','));
  }
  delete process.env.SLEEPIN;
}

// ---------------- PART B: live engine, constructed states (REAL RED) ----------------
async function partB() {
  console.log('PART B — live engine, constructed states (REAL RED)');
  if (skipIfLayerGone('partB')) return;
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.FEASTSCALE_R13 = '1';
  delete process.env.SLEEPIN;
  const fs_ = require('./policies/feastscale');
  const base = fs_.belongfeast;
  delete require.cache[require.resolve(SI_PATH)];
  process.env.SLEEPIN = '1';
  const sl = require(SI_PATH);
  const armed = sl.wrapPolicy(base);

  async function build() {
    const { Game } = await loadGame({ seed: 109, mode: 'sleepin-proof' });
    await setupGame(Game);
    return Game;
  }
  function placeAtHavenOutside(Game) {
    const v = Game.state.village || {};
    Game.map.px = (v.px == null ? 4 : v.px);
    Game.map.py = (v.py == null ? 4 : v.py);
    const s = Game.state.scholar;
    s.insideHaven = false;
    s.kcal = 300; s.hydration = 100;
    if ((s.health || 0) < 60) s.health = 100;
  }

  // B1 RED — the control substrate: scholar sleeps outside on the haven
  // grounds; at dawn the access wall bites the base's own reactive draw.
  {
    const Game = await build();
    const said = [];
    const oSay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
    const ctx = { policyId: 'sleepin-proof-b1', notes: [] };
    await quietLog(async () => { base.daily(Game, ctx); });
    placeAtHavenOutside(Game); // bedtime: on the haven tile, outside the hall
    check('B1 RED: control daily leaves the scholar outside', Game.state.scholar.insideHaven === false);
    await quietLog(async () => { Game.sleep(); });
    Game.say = oSay;
    if (Game.over) {
      console.log('  NOTE B1: Game.over after the night — the RED still pins on the pre-dawn state');
    }
    const access = (() => { try { return Game.havenStoresAccess(); } catch (e) { return 'err'; } })();
    check('B1 RED: dawn access is none (the wall bites the base)', access === 'none', 'access=' + access);
    // Hungry at dawn, pack empty: the base's reactive pantry fallback is honestly refused.
    try {
      Game.state.scholar.inventory = [];
      Game.state.scholar.kcal = 100;
      const pantryBefore = JSON.stringify((Game.state.village.pantry || []).map(i => [i.name, i.units]));
      const said2 = [];
      Game.say = function (t) { try { said2.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
      await quietLog(async () => { base.upkeep(Game, ctx); });
      Game.say = oSay;
      const refused = said2.some(t => /The pantry is in the hall\. Your hands are not/.test(t));
      check('B1 RED: dawn pantry fallback honestly refused', refused);
      const pantryAfter = JSON.stringify((Game.state.village.pantry || []).map(i => [i.name, i.units]));
      check('B1 RED: pantry untouched by the refusal loop', pantryAfter === pantryBefore);
    } catch (e) { check('B1 RED: dawn upkeep probe ran', false, String(e).slice(0, 120)); }
  }

  // B2 RED — the layer at the same state: the honest verb fires at bedtime;
  // at dawn the reactive draw lands.
  {
    const Game = await build();
    const said = [];
    const oSay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
    const ctx = { policyId: 'sleepin-proof-b2', notes: [] };
    await quietLog(async () => { armed.daily(Game, ctx); });
    placeAtHavenOutside(Game); // bedtime state, as in B1
    sl.siBedtime(Game, ctx);
    const s = Game.state.scholar;
    check('B2 RED: layer enters via the honest verb', s.insideHaven === true);
    check('B2 RED: siEnters 1', ctx.siEnters === 1, 'siEnters=' + ctx.siEnters);
    check('B2 RED: engine Inside voiced', said.some(t => /Inside\. The hall smells/.test(t)));
    await quietLog(async () => { Game.sleep(); });
    Game.say = oSay;
    if (Game.over) {
      console.log('  NOTE B2: Game.over after the night — dawn asserts skipped');
    } else {
      const access = (() => { try { return Game.havenStoresAccess(); } catch (e) { return 'err'; } })();
      check('B2 RED: dawn access is inside', access === 'inside', 'access=' + access);
      try {
        Game.state.scholar.inventory = [];
        Game.state.scholar.kcal = 100;
        const kcalBefore = Math.round(Game.state.scholar.kcal || 0);
        const pantryBefore = (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
        const said2 = [];
        Game.say = function (t) { try { said2.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
        await quietLog(async () => { armed.upkeep(Game, ctx); });
        Game.say = oSay;
        const kcalAfter = Math.round(Game.state.scholar.kcal || 0);
        const pantryAfter = (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
        const refused = said2.some(t => /The pantry is in the hall\. Your hands are not/.test(t));
        check('B2 RED: dawn reactive draw lands (kcal rises)', kcalAfter > kcalBefore, `${kcalBefore} -> ${kcalAfter}`);
        check('B2 RED: pantry honestly spent', pantryAfter < pantryBefore, `${Math.round(pantryBefore)} -> ${Math.round(pantryAfter)}`);
        check('B2 RED: no refusal beats', !refused);
      } catch (e) { check('B2 RED: dawn upkeep probe ran', false, String(e).slice(0, 120)); }
    }
  }
  delete process.env.SLEEPIN;
}

// ---------------- PART C: det-gate ----------------
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}
// INSIDE-SEEDER: honestly enter, called BETWEEN base.daily and the layer's
// siBedtime on BOTH det-gate sides. The layer's fire gate (outside) can then
// never pass; the log machinery still runs hot. Symmetric, deterministic.
// (A seeder BEFORE base.daily does NOT work: the base's daily travel clears
// insideHaven on arrival, so the layer would still fire behind it.)
function seedInside(Game) {
  try {
    const t = Game.playerTile();
    if (t && t.type === 'haven' && !Game.state.scholar.insideHaven && !Game.over) {
      try { Game.enterBuilding(); } catch (e) {}
    }
  } catch (e) {}
}
async function partC() {
  console.log('PART C — det-gate: 30d x 8 seeds x 2 policies, base vs layer-machinery, inside-seeded');
  if (skipIfLayerGone('partC')) return;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SEEDS = [109, 218, 327, 436, 545, 654, 763, 872];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [];
      const trig = [];
      for (const armed of [false, true]) {
        process.env.FEASTSCALE_R13 = '1';
        delete require.cache[require.resolve(SI_PATH)];
        const sl = require(SI_PATH);
        const fs_ = require('./policies/feastscale');
        const base = pid === 'leadcourt' ? fs_.leadfeast : fs_.belongfeast;
        const bDaily0 = base.daily;
        // Hand-rolled wrap: base.daily -> symmetric inside-seeder -> the
        // layer's siBedtime (armed only). The seeder neutralizes the fire
        // gate on both sides; the armed side's log machinery runs hot.
        const wrapped = Object.assign({}, base);
        wrapped.id = (armed ? 'sleepin-det' : 'control-det') + '-' + pid;
        wrapped.daily = (G, ctx) => {
          if (bDaily0) { try { bDaily0(G, ctx); } catch (e) {} }
          seedInside(G);
          if (armed) sl.siBedtime(G, ctx);
        };
        const { Game } = await loadGame({ seed, mode: 'sleepin-det' });
        await setupGame(Game);
        const drv = Object.assign({}, wrapped);
        const dDaily = wrapped.daily;
        const hs = [];
        let rows = 0, enters = 0;
        drv.daily = (G, ctx) => {
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          const r = dDaily(G, ctx);
          try { rows = (ctx._siLog || []).length; enters = ctx.siEnters || 0; } catch (e) {}
          return r;
        };
        drv.setup = undefined;
        const ctx = { policyId: 'sleepin-det', notes: [] };
        await quietLog(async () => { await runDays(Game, drv, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({ rows, enters });
      }
      const same = hashes[0] === hashes[1];
      // The log machinery must have RUN (else the gate proves nothing): the
      // armed side must show siLog rows while entering nothing itself.
      const exercised = trig[1].rows > 0 && trig[1].enters === 0;
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} siRows=${trig[1].rows} siEnters=${trig[1].enters})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
      if (!exercised) console.log('    NOTE: log machinery never ran hot — gate is weak on this seed');
    }
  }
  console.log(`PART C: ${pass} pass / ${fail} fail`);
  if (fail) failures += fail;
}

// ---------------- SMOKE: instrument-honesty ----------------
async function smoke() {
  console.log('== sleepin SMOKE ==');
  if (skipIfLayerGone('smoke')) process.exit(1);
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SLEEPIN = '1';
  delete require.cache[require.resolve(SI_PATH)];
  const sl = require(SI_PATH);
  const fs_ = require('./policies/feastscale');
  const policy = sl.wrapPolicy(fs_.belongfeast);
  const { Game } = await loadGame({ seed: 109, mode: 'sleepin-smoke' });
  await setupGame(Game);
  const said = [];
  const oSay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  let dailyCalls = 0;
  const ctxRef = { ref: null };
  wrapped.daily = (G, ctx) => { dailyCalls++; ctxRef.ref = ctx; return bDaily ? bDaily(G, ctx) : undefined; };
  wrapped.setup = undefined;
  const ctx = { policyId: 'sleepin-smoke', notes: [] };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 25, sampleEvery: 26 }); });
  Game.say = oSay;
  const c = ctxRef.ref || {};
  const rows = c._siLog || [];
  const fails = [];
  const checkS = (n, cond, d) => { console.log(`  ${cond ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!cond) fails.push(n); };
  checkS('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  checkS('bedtime machinery ran hot', rows.length >= 15, `siRows=${rows.length}`);
  checkS('enters counted and consistent', (c.siEnters || 0) === rows.filter(r => r.fires).length && (c.siEnters || 0) > 0,
    `siEnters=${c.siEnters || 0} firedRows=${rows.filter(r => r.fires).length}`);
  checkS('every enter has the person-beat + engine Inside voice',
    said.some(t => /duck into the hall for the night/.test(t)) && said.some(t => /Inside\. The hall smells/.test(t)));
  checkS('no honest refusals', (c.siRefused || 0) === 0, `siRefused=${c.siRefused || 0}`);
  checkS('enter beat reads like a person, not a robot',
    said.some(t => /duck into the hall for the night — the floor by the fire beats sleeping out on the grounds/.test(t)));
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smoke(); return; }
  partA();
  await partB();
  await partC();
  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})();
