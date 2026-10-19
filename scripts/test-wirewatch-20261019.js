#!/usr/bin/env node
// scripts/test-wirewatch-20261019.js — proof test for the WIREWATCH
// watch-drive policy arm (lever loop B, 2026-10-19, arm sim-wirewatch-b).
//
// RED honesty: with WIREWATCH unset the drive is a strict no-op (no
// travelTo, no ctx writes — the gate-off side is byte-identical).
// GREEN: with WIREWATCH=1, a L0 scholar with a living knower who ends the
// day away from haven is walked home (the engine's own travelTo, stopping
// at fights/blockage/refusal). Guards: L1 -> off; no knowers -> off;
// already home -> no verb; fight active -> off; game over -> off.
//
// Harness: mock-Game unit checks (fast, deterministic) + one full-game
// smoke (seeded BEFORE eval per AGENTS.md) proving the layer engages in a
// live run without errors.
'use strict';
const assert = require('assert');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  PASS ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' — ' + (e && e.message)); }
}

// ---- mock Game ---------------------------------------------------------
function mockGame(o) {
  o = o || {};
  const calls = { travelTo: [] };
  const knower = o.knower === undefined ? 'vid_knower' : o.knower;
  const knowerDead = !!o.knowerDead;
  const snareL = o.snareL === undefined ? 0 : o.snareL;
  const px = o.px === undefined ? 7 : o.px;   // scholar pos (default: away)
  const py = o.py === undefined ? 2 : o.py;
  const refuse = !!o.refuse; // travelTo refuses to move
  const G = {
    calls,
    villagerId: 'vid_scholar',
    over: !!o.over,
    tbfight: o.fight ? { over: false } : null,
    map: { px, py },
    state: {
      scholar: { day: 5 },
      codex: { recipes: { snare: { level: snareL } } },
      village: {
        px: 4, py: 4,
        roster: knower ? ['vid_scholar', knower, 'vid_other'] : ['vid_scholar', 'vid_other'],
      },
    },
    vpOf: (vid) => vid === knower ? { knowsSnare: true, dead: knowerDead } : {},
    getPerson: (vid) => ({ id: vid, dead: vid === knower ? knowerDead : false }),
    travelTargets: () => [{ x: 4, y: 4 }, { x: px, y: py }],
    travelTo: (x, y) => {
      calls.travelTo.push([x, y]);
      if (!refuse) { G.map.px = x; G.map.py = y; }
      return true;
    },
  };
  return G;
}
const freshCtx = () => ({});

function withFlag(v, fn) {
  const prev = process.env.WIREWATCH;
  if (v === undefined) delete process.env.WIREWATCH; else process.env.WIREWATCH = v;
  try { return fn(); } finally {
    if (prev === undefined) delete process.env.WIREWATCH; else process.env.WIREWATCH = prev;
  }
}

const wirewatch = require('./policies/wirewatch');

// ---- RED: gate off = strict no-op --------------------------------------
check('RED gate-off: comeHome returns null, no verbs, no ctx writes', () => {
  withFlag(undefined, () => {
    const G = mockGame({}); // scholar away, knower lives
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.deepStrictEqual(G.calls.travelTo, []);
    assert.deepStrictEqual(ctx, {});
  });
});

check('RED gate-off: knowers() still reads (pure query, no verbs)', () => {
  withFlag(undefined, () => {
    const G = mockGame({});
    assert.deepStrictEqual(wirewatch.knowers(G), ['vid_knower']);
    assert.deepStrictEqual(G.calls.travelTo, []);
  });
});

// ---- GREEN: the watch ---------------------------------------------------
check('GREEN on: away scholar with knower is walked home', () => {
  withFlag('1', () => {
    const G = mockGame({});
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), true);
    assert.strictEqual(G.calls.travelTo.length, 1);
    assert.deepStrictEqual(G.calls.travelTo[0], [4, 4]);
    assert.strictEqual(G.map.px, 4); assert.strictEqual(G.map.py, 4);
    assert.strictEqual(ctx.wirewatchComeHomes, 1);
    assert.deepStrictEqual(ctx.wirewatchComeHomeDays, [5]);
  });
});

check('GREEN on: already home -> null, no verb, no ctx write', () => {
  withFlag('1', () => {
    const G = mockGame({ px: 4, py: 4 });
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.deepStrictEqual(G.calls.travelTo, []);
    assert.deepStrictEqual(ctx, {});
  });
});

check('GREEN on: snare L1 -> watch over, null', () => {
  withFlag('1', () => {
    const G = mockGame({ snareL: 1 });
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.deepStrictEqual(G.calls.travelTo, []);
    assert.deepStrictEqual(ctx, {});
  });
});

check('GREEN on: no knowers -> null (dead cast, documented)', () => {
  withFlag('1', () => {
    const G = mockGame({ knower: null });
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.deepStrictEqual(G.calls.travelTo, []);
    assert.deepStrictEqual(ctx, {});
  });
});

check('GREEN on: dead knower does not count', () => {
  withFlag('1', () => {
    const G = mockGame({ knowerDead: true });
    assert.deepStrictEqual(wirewatch.knowers(G), []);
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.deepStrictEqual(G.calls.travelTo, []);
  });
});

check('GREEN on: fight active -> null, never walk out of a fight', () => {
  withFlag('1', () => {
    const G = mockGame({ fight: true });
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.deepStrictEqual(G.calls.travelTo, []);
    assert.deepStrictEqual(ctx, {});
  });
});

check('GREEN on: game over -> null', () => {
  withFlag('1', () => {
    const G = mockGame({ over: true });
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.deepStrictEqual(G.calls.travelTo, []);
  });
});

check('GREEN on: refused travel -> null, no ctx write (stays put, safely)', () => {
  withFlag('1', () => {
    const G = mockGame({ refuse: true });
    const ctx = freshCtx();
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.strictEqual(G.calls.travelTo.length, 1); // the attempt happened
    assert.deepStrictEqual(ctx, {}); // but nothing recorded: no movement
  });
});

check('GREEN on: come-home day logged once per day', () => {
  withFlag('1', () => {
    const G = mockGame({});
    const ctx = freshCtx();
    wirewatch.comeHome(G, ctx);
    // second call same day: already home now -> null, no double count
    assert.strictEqual(wirewatch.comeHome(G, ctx), null);
    assert.strictEqual(ctx.wirewatchComeHomes, 1);
  });
});

console.log(`\n${pass} passed, ${fail} failed`);

// ---- live smoke: full game, 6 days, WIREWATCH=1 --------------------------
async function smoke() {
  process.env.WIREWATCH = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const f = require('./policies/feastscale');
  const { Game } = await loadGame({ seed: 41713, mode: 'wirewatch-smoke' });
  await setupGame(Game);
  const base = f.leadfeast;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      let r;
      if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
      try { wirewatch.comeHome(G, ctx); } catch (e) { console.log('  smoke comeHome threw: ' + e.message); process.exit(1); }
      return r;
    },
  });
  await runDays(Game, policy, { days: 6 });
  console.log(`  smoke: 6d leadfeast s41713 WIREWATCH=1, no errors (scholar day ${(Game.state.scholar || {}).day})`);
  delete process.env.WIREWATCH;
}
smoke().then(() => {
  if (fail) process.exit(1);
  console.log('ALL GREEN');
}).catch(e => { console.error('SMOKE FATAL', e && e.stack || e); process.exit(1); });
