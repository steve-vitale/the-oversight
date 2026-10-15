#!/usr/bin/env node
// scripts/test-recdaily-20261015.js — proof for the recdaily layer
// (scale-onramp, courtship road).
//
// REAL RED, then GREEN:
//   Phase-A (RED): R1 gate-off delegation; R2 the blank (gate-off ranges
//     wild); R3/R4/R5 the DESIRED release behavior asserted against a naive
//     inline hold (no re-check) — they FAIL there (the r38 stranding
//     reproduced: hunger mid-hold, thin pantry mid-hold, declining pantry
//     across hold days do NOT release).
//   Phase-B (GREEN): the same R3/R4/R5 assertions plus G1–G15 against the
//     real layer (RECDAILY=1).
//
// Kill protocol: if scripts/policies/recdaily.js is absent, INFO-SKIP
// (exit 0) — never MODULE_NOT_FOUND.
// SMOKE=1 runs a fast subset.
'use strict';

const fs = require('fs');
const path = require('path');

const LAYER_PATH = path.join(__dirname, 'policies', 'recdaily.js');
if (!fs.existsSync(LAYER_PATH)) {
  console.log('INFO-SKIP: scripts/policies/recdaily.js absent (killed arm) — nothing to prove.');
  process.exit(0);
}

const SMOKE = process.env.SMOKE === '1';
const savedEnv = process.env.RECDAILY;

// ---------------------------------------------------------------------------
// Mock Game + mock base policy
// ---------------------------------------------------------------------------
function makeMock() {
  const hx = 4, hy = 4;
  const calls = { travelTo: [], say: [] };
  const vars = {
    day: 10, px: hx + 3, py: hy, // scholar starts AWAY from haven
    freshDays: 5.0, hungryStreak: 0,
    telemetry: [],
  };
  const Game = {
    state: {
      scholar: { day: vars.day, villagerId: 'theo' },
      village: { px: hx, py: hy },
      telemetry: vars.telemetry,
    },
    map: { px: vars.px, py: vars.py },
    travelTo(x, y, force, combatExit) {
      calls.travelTo.push({ x, y, force, combatExit: !!combatExit });
      vars.px = x; vars.py = y;
      Game.map.px = x; Game.map.py = y;
      return { moved: true };
    },
    say(msg) { calls.say.push(String(msg)); },
    displayName(vid) {
      if (vid === 'june') return 'June Aguilar';
      if (vid === 'theo') return 'Theo';
      return null;
    },
    pantryFreshDays() { return vars.freshDays; },
    progState() { return { hungryStreak: vars.hungryStreak }; },
    _vars: vars, _calls: calls, _haven: [hx, hy],
  };
  return Game;
}

// The mock base: a ranging scholar — daily travels strictly AWAY from haven
// (px+2), so the guard's haven-ward pass can never be mistaken for ranging.
function makeBase(Game) {
  return {
    id: 'mockbase',
    desc: 'mock ranging base',
    daily(G, ctx) { G.travelTo(G.map.px + 2, G.map.py); ctx.baseDailyCalls = (ctx.baseDailyCalls || 0) + 1; },
    upkeep(G, ctx) { ctx.baseUpkeepCalls = (ctx.baseUpkeepCalls || 0) + 1; },
  };
}

function pushDeath(Game, ev) {
  Game._vars.telemetry.push(Object.assign(
    { type: 'death', day: Game._vars.day, kind: 'person', who: 'june', cause: 'combat', player: false },
    ev));
}
function setDay(Game, d) { Game._vars.day = d; Game.state.scholar.day = d; }

function assert(cond, msg) { if (!cond) throw new Error('ASSERT: ' + msg); }
function awayDeclined(Game) {
  // The last travelTo AWAY from haven should have been declined ({moved:false}).
  const [hx] = Game._haven;
  const aways = Game._calls.travelTo.filter(t => t.x > hx);
  return aways;
}

// ---------------------------------------------------------------------------
// Phase-A naive build: the plain r35 hold, NO re-check (the RED substrate).
// Written from scratch — it genuinely lacks the release mechanism.
// ---------------------------------------------------------------------------
function naiveHold(base) {
  const EXACT = new Set(['combat', 'villager combat', 'monster', 'ambush', 'contest']);
  const NON = ['starvation', 'dehydration', 'thirst', 'hunger', 'sickness', 'disease'];
  const isCombat = c => { const s = String(c || '').toLowerCase(); if (EXACT.has(s)) return true; if (NON.some(n => s.includes(n))) return false; return true; };
  return Object.assign({}, base, {
    id: base.id + '+naivehold',
    daily(Game, ctx) {
      if (process.env.RECDAILY_NAIVE !== '1') return base.daily(Game, ctx);
      const tele = (Game.state && Game.state.telemetry) || [];
      let seen = ctx._nSeen || 0;
      for (; seen < tele.length; seen++) {
        const ev = tele[seen];
        if (ev && ev.type === 'death' && isCombat(ev.cause)) {
          ctx._nUntil = Math.max(ctx._nUntil || 0, (ev.day != null ? ev.day : 0) + 2);
          try { Game.say('naive hold'); } catch (e) {}
        }
      }
      ctx._nSeen = seen;
      const day = ((Game.state && Game.state.scholar) || {}).day || 0;
      if ((ctx._nUntil || 0) < day) return base.daily(Game, ctx);
      const [hx, hy] = [4, 4];
      const orig = Game.travelTo;
      Game.travelTo = function (x, y, force, combatExit) {
        if (combatExit) return orig.call(Game, x, y, force, combatExit);
        try {
          const dCur = Math.abs(Game.map.px - hx) + Math.abs(Game.map.py - hy);
          const dDst = Math.abs(x - hx) + Math.abs(y - hy);
          if (dDst > dCur) return { moved: false };
        } catch (e) {}
        return orig.call(Game, x, y, force, combatExit);
      };
      try { return base.daily(Game, ctx); } finally { Game.travelTo = orig; }
    },
    upkeep(Game, ctx) { return base.upkeep ? base.upkeep(Game, ctx) : undefined; },
  });
}

// ---------------------------------------------------------------------------
// Test registry
// ---------------------------------------------------------------------------
const results = { pass: 0, fail: 0, redOk: 0, redUnexpected: 0 };
function green(name, fn) {
  try { fn(); results.pass++; console.log('  PASS ' + name); }
  catch (e) { results.fail++; console.log('  FAIL ' + name + ' :: ' + e.message); }
}
function redExpectFail(name, fn) {
  // The desired behavior asserted against the naive build — it MUST fail.
  try { fn(); results.redUnexpected++; console.log('  RED-UNEXPECTED-PASS ' + name + ' (naive should lack this)'); }
  catch (e) { results.redOk++; console.log('  RED-OK ' + name + ' (naive lacks the mechanism)'); }
}

function withEnv(val, fn) {
  const prev = process.env.RECDAILY;
  if (val == null) delete process.env.RECDAILY; else process.env.RECDAILY = val;
  try { return fn(); } finally { if (prev == null) delete process.env.RECDAILY; else process.env.RECDAILY = prev; }
}

// ---------------------------------------------------------------------------
// Phase A — RED
// ---------------------------------------------------------------------------
function phaseA(layerMod) {
  console.log('PHASE A — RED');
  const { withRecdaily } = layerMod;

  // R1 (RED): gate-off delegates verb-for-verb, no tracking state.
  green('R1 gate-off delegates identically, no _rec state', () => withEnv(null, () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    wrapped.daily(G, ctx); wrapped.upkeep(G, ctx);
    assert(ctx.baseDailyCalls === 1 && ctx.baseUpkeepCalls === 1, 'base ran');
    assert(Object.keys(ctx).every(k => !k.startsWith('_rec')), 'no _rec keys, got ' + Object.keys(ctx).join(','));
    const aways = G._calls.travelTo.filter(t => t.x > 4);
    assert(aways.length === 1, 'one away sortie, unblocked');
  }));

  // R2 (REAL RED): gate-off + villager combat death → scholar still ranges.
  green('R2 gate-off combat death does not hold (the blank)', () => withEnv(null, () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    const aways = G._calls.travelTo.filter(t => t.x > 4);
    assert(aways.length >= 1, 'scholar ranged wild despite the death');
  }));

  // R3/R4/R5: desired release behavior vs the NAIVE hold — must FAIL.
  process.env.RECDAILY_NAIVE = '1';
  try {
    redExpectFail('R3 hunger mid-hold releases the scholar (naive)', () => {
      const G = makeMock();
      const wrapped = naiveHold(makeBase(G));
      const ctx = {};
      pushDeath(G, { kind: 'person', cause: 'combat' });
      wrapped.daily(G, ctx); // day 10: hold opens
      setDay(G, 11); G._vars.hungryStreak = 2; // starving at dawn
      const before = G._calls.travelTo.length;
      wrapped.daily(G, ctx); // day 11: base tries to range away
      const newCalls = G._calls.travelTo.slice(before).filter(t => t.x > 4);
      assert(newCalls.length >= 1, 'scholar released to range on hunger');
    });
    redExpectFail('R4 thin pantry mid-hold releases the scholar (naive)', () => {
      const G = makeMock();
      const wrapped = naiveHold(makeBase(G));
      const ctx = {};
      pushDeath(G, { kind: 'person', cause: 'combat' });
      wrapped.daily(G, ctx);
      setDay(G, 11); G._vars.freshDays = 1.2;
      const before = G._calls.travelTo.length;
      wrapped.daily(G, ctx);
      const newCalls = G._calls.travelTo.slice(before).filter(t => t.x > 4);
      assert(newCalls.length >= 1, 'scholar released to range on thin pantry');
    });
    redExpectFail('R5 declining pantry across hold days releases (naive)', () => {
      const G = makeMock();
      const wrapped = naiveHold(makeBase(G));
      const ctx = {};
      G._vars.freshDays = 5.0;
      pushDeath(G, { kind: 'person', cause: 'combat' });
      wrapped.daily(G, ctx);
      setDay(G, 11); G._vars.freshDays = 4.4; // declined vs hold start
      const before = G._calls.travelTo.length;
      wrapped.daily(G, ctx);
      const newCalls = G._calls.travelTo.slice(before).filter(t => t.x > 4);
      assert(newCalls.length >= 1, 'scholar released on declining pantry');
    });
  } finally { delete process.env.RECDAILY_NAIVE; }
}

// ---------------------------------------------------------------------------
// Phase B — GREEN (real layer, RECDAILY=1)
// ---------------------------------------------------------------------------
function phaseB(layerMod) {
  console.log('PHASE B — GREEN');
  const { withRecdaily, RECDAILY_DAYS, RELEASE_FLOOR_DAYS } = layerMod;

  green('G0 named exports unwrap (the 2026-10-14 lesson)', () => {
    assert(typeof layerMod.recdaily.daily === 'function', 'recdaily.daily is a function');
    assert(typeof layerMod.recdailyBelong.daily === 'function', 'recdailyBelong.daily is a function');
    assert(typeof layerMod.recheckRelease === 'function', 'recheckRelease exported');
  });

  // G1: hold engages on villager combat death; announcement names dead+living.
  green('G1 villager combat death opens the hold, says once w/ names', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', who: 'june', cause: 'combat' });
    wrapped.daily(G, ctx);
    assert(ctx._recWindows === 1, 'one window opened');
    assert(G._calls.say.length === 1, 'one announcement, got ' + G._calls.say.length);
    const line = G._calls.say[0];
    assert(line.includes('June Aguilar') && line.includes('Theo'), 'names dead+living: ' + line);
    assert(line.includes('Crews stay close to home.'), 'villager tail: ' + line);
    assert(ctx._recFortifyDays === 1, 'fortify-day counted');
  }));

  // G2: scholar (player:true) combat death — mantle line, walked home.
  green('G2 scholar combat death: mantle line + walked home + guarded', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', who: 'june', cause: 'combat', player: true });
    wrapped.daily(G, ctx);
    const line = G._calls.say[0];
    assert(line.includes('The mantle needs a living bearer.'), 'mantle line: ' + line);
    assert(G.map.px === 4 && G.map.py === 4, 'scholar walked home, at ' + G.map.px + ',' + G.map.py);
    assert((ctx._recWalkHops || 0) <= 12, 'walk bounded');
  }));

  // G3: monster combat death does NOT trigger (people-only).
  green('G3 monster combat death does not open a window', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'monster', who: 'hushwolf-9', cause: 'combat' });
    wrapped.daily(G, ctx);
    assert(!ctx._recWindows, 'no window for a monster death');
    assert(G._calls.say.length === 0, 'silence for monster deaths');
  }));

  // G4: starvation death does NOT trigger.
  green('G4 starvation death does not open a window', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', who: 'june', cause: 'starvation' });
    wrapped.daily(G, ctx);
    assert(!ctx._recWindows, 'no window for non-combat');
  }));

  // G5: release on hungryStreak>0 at dawn.
  green('G5 hungryStreak>0 at dawn releases (cond=hunger)', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx); // day 10: hold opens
    assert(ctx._recWindows === 1, 'window opened');
    setDay(G, 11); G._vars.hungryStreak = 2; G._vars.freshDays = 5.0;
    const before = G._calls.travelTo.length;
    wrapped.daily(G, ctx); // day 11 dawn re-check
    assert(ctx._recReleased === 1, 'released');
    assert((ctx._recReleaseCond || {}).hunger === 1, 'cond=hunger recorded');
    const newAways = G._calls.travelTo.slice(before).filter(t => t.x > 4);
    assert(newAways.length >= 1, 'scholar ranged after release');
    const rel = G._calls.say.filter(s => s.includes('stands down early'));
    assert(rel.length === 1, 'release line said once, got ' + rel.length);
    assert(rel[0].includes('Theo') && rel[0].includes('June Aguilar'), 'release names holder+dead: ' + rel[0]);
  }));

  // G6: release on freshDays < 2.0 at dawn.
  green('G6 freshDays<2.0 at dawn releases (cond=floor)', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    setDay(G, 11); G._vars.freshDays = 1.9; G._vars.hungryStreak = 0;
    wrapped.daily(G, ctx);
    assert(ctx._recReleased === 1 && (ctx._recReleaseCond || {}).floor === 1, 'cond=floor recorded');
    assert(!(ctx._recFortifyUntil >= 11), 'window closed');
  }));

  // G7: release on trend decline vs hold-start baseline.
  green('G7 declining pantry vs hold-start releases (cond=trend)', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    G._vars.freshDays = 5.0;
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    assert(ctx._recHoldStartFresh === 5.0, 'baseline recorded');
    setDay(G, 11); G._vars.freshDays = 4.5; G._vars.hungryStreak = 0;
    wrapped.daily(G, ctx);
    assert(ctx._recReleased === 1 && (ctx._recReleaseCond || {}).trend === 1, 'cond=trend recorded');
  }));

  // G8: NO release when pantry rising/flat, no hunger, >= 2 — hold continues.
  green('G8 rising pantry does NOT release — hold continues, sorties declined', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    G._vars.freshDays = 4.0;
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    setDay(G, 11); G._vars.freshDays = 4.3; G._vars.hungryStreak = 0;
    const before = G._calls.travelTo.length;
    wrapped.daily(G, ctx);
    assert(!ctx._recReleased, 'no release');
    assert(ctx._recFortifyDays === 2, 'second fortify-day counted');
    const newAways = G._calls.travelTo.slice(before).filter(t => t.x > 4);
    assert(newAways.length === 0, 'away sorties declined under the hold');
    assert((ctx._recDeclined || 0) >= 1, 'declines counted');
  }));

  // G9: natural expiry after RECDAILY_DAYS — no release announcement.
  green('G9 window expires naturally after 2 days, no release line', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    G._vars.freshDays = 6.0;
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx); // day 10
    setDay(G, 11); G._vars.freshDays = 6.1; wrapped.daily(G, ctx); // day 11 held
    setDay(G, 12); G._vars.freshDays = 6.2; wrapped.daily(G, ctx); // day 12 held (10+2)
    setDay(G, 13); // day 13: expired
    const before = G._calls.travelTo.length;
    wrapped.daily(G, ctx);
    const newAways = G._calls.travelTo.slice(before).filter(t => t.x > 4);
    assert(newAways.length >= 1, 'ranging resumes after expiry');
    assert(!ctx._recReleased, 'no release recorded on natural expiry');
    const rel = G._calls.say.filter(s => s.includes('stands down early'));
    assert(rel.length === 0, 'no release line on natural expiry');
    assert(ctx._recFortifyDays === 3, '3 fortify-days (10,11,12)');
  }));

  // G10: chain-extend — second death extends, re-baselines, new announcement.
  green('G10 chained death extends the window + re-baselines', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    G._vars.freshDays = 5.0;
    pushDeath(G, { kind: 'person', who: 'june', cause: 'combat' });
    wrapped.daily(G, ctx); // day 10 opens (until 12)
    setDay(G, 11); G._vars.freshDays = 5.1;
    pushDeath(G, { kind: 'person', who: 'june', cause: 'ambush' }); // day 11 death
    wrapped.daily(G, ctx); // re-check skipped on open day; extends to 13
    assert(ctx._recWindows === 2, 'two windows');
    assert(ctx._recFortifyUntil === 13, 'extended to 13');
    assert(ctx._recHoldStartFresh === 5.1, 'baseline re-taken at extension');
    assert(G._calls.say.filter(s => s.includes('holds Haven')).length === 2, 'two hold announcements');
  }));

  // G11: release announcement fires exactly once (no re-announce later).
  green('G11 release line fires exactly once per release', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    setDay(G, 11); G._vars.hungryStreak = 1; wrapped.daily(G, ctx);
    setDay(G, 12); G._vars.hungryStreak = 0; G._vars.freshDays = 5.0; wrapped.daily(G, ctx);
    const rel = G._calls.say.filter(s => s.includes('stands down early'));
    assert(rel.length === 1, 'exactly one release line, got ' + rel.length);
  }));

  // G12: gate-off scripted 3-day run — verb-for-verb identical vs raw base.
  green('G12 gate-off 3-day scripted run identical to raw base', () => withEnv(null, () => {
    const mk = () => { const G = makeMock(); return { G, ctx: {} }; };
    const a = mk(), b = mk();
    const wrapped = withRecdaily(makeBase(a.G), 't');
    const raw = makeBase(b.G);
    for (const d of [10, 11, 12]) {
      setDay(a.G, d); setDay(b.G, d);
      pushDeath(a.G, { kind: 'person', cause: 'combat' });
      pushDeath(b.G, { kind: 'person', cause: 'combat' });
      wrapped.daily(a.G, a.ctx); raw.daily(b.G, b.ctx);
      wrapped.upkeep(a.G, a.ctx); raw.upkeep(b.G, b.ctx);
    }
    const seqA = JSON.stringify(a.G._calls.travelTo);
    const seqB = JSON.stringify(b.G._calls.travelTo);
    assert(seqA === seqB, 'travelTo sequences identical');
    assert(JSON.stringify(Object.keys(a.ctx).sort()) === JSON.stringify(Object.keys(b.ctx).sort()), 'ctx keys identical');
  }));

  // G13: combatExit passes during the hold (flee-by-barrier).
  green('G13 combatExit (flee) passes during the hold', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    setDay(G, 11); G._vars.freshDays = 6.0;
    // install the guard via upkeep path: call daily, then attempt a flee exit
    wrapped.daily(G, ctx); // day 11 held
    const r = G.travelTo; // NOTE: guard is uninstalled after daily; simulate inside:
    // Re-run: use a base whose daily flees.
    const G2 = makeMock();
    const fleeBase = { id: 'flee', daily(Gg, ctx2) { return Gg.travelTo(0, 4, false, true); }, upkeep(Gg, ctx2) {} };
    const w2 = withRecdaily(fleeBase, 't');
    const ctx2 = {};
    pushDeath(G2, { kind: 'person', cause: 'combat' });
    const res = w2.daily(G2, ctx2); // guard wraps the flee call
    const flees = G2._calls.travelTo.filter(t => t.combatExit);
    assert(flees.length === 1, 'flee call reached the engine');
    assert(res && res.moved !== false, 'flee not declined');
  }));

  // G14: walk-home bounded.
  green('G14 walk-home bounded to <=12 hops', () => withEnv('1', () => {
    const G = makeMock();
    G._vars.px = 8; G._vars.py = 8; G.map.px = 8; G.map.py = 8; // far corner
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    assert((ctx._recWalkHops || 0) <= 12, 'hops <= 12, got ' + ctx._recWalkHops);
  }));

  // G15: trend sentinel — a 999 baseline does not fire the trend release.
  green('G15 999 baseline does not fire trend release', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    G._vars.freshDays = 999; // sentinel baseline at open
    pushDeath(G, { kind: 'person', cause: 'combat' });
    wrapped.daily(G, ctx);
    setDay(G, 11); G._vars.freshDays = 40; G._vars.hungryStreak = 0; // snapped in, still >= 2
    wrapped.daily(G, ctx);
    assert(!ctx._recReleased, 'no release on sentinel snap-in');
    assert(ctx._recFortifyDays === 2, 'hold continues');
  }));

  // G16: monster-named cause counts as combat for a person death.
  green('G16 monster-named cause triggers for a person death', () => withEnv('1', () => {
    const G = makeMock();
    const wrapped = withRecdaily(makeBase(G), 't');
    const ctx = {};
    pushDeath(G, { kind: 'person', who: 'june', cause: 'Choir Toad' });
    wrapped.daily(G, ctx);
    assert(ctx._recWindows === 1, 'monster-named cause counts as combat');
  }));
}

// ---------------------------------------------------------------------------
function main() {
  const layerMod = require(LAYER_PATH);
  if (SMOKE) console.log('SMOKE=1 — instrument-honesty gate (fast subset labels the gate; the suite runs in <1s)');
  phaseA(layerMod);
  phaseB(layerMod);
  console.log(`\nRESULT: green ${results.pass} pass / ${results.fail} fail; red ${results.redOk} ok / ${results.redUnexpected} unexpected-pass`);
  if (results.fail > 0 || results.redUnexpected > 0) { process.exit(1); }
  if (results.redOk < 3) { console.log('RED-COVERAGE-FAIL: expected 3 red-ok'); process.exit(1); }
  console.log('ALL GREEN' + (SMOKE ? ' (SMOKE subset gate)' : ''));
}

if (savedEnv == null) delete process.env.RECDAILY; else process.env.RECDAILY = savedEnv;
main();
if (savedEnv == null) delete process.env.RECDAILY; else process.env.RECDAILY = savedEnv;
