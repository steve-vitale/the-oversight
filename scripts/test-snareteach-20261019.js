#!/usr/bin/env node
// scripts/test-snareteach-20261019.js — proof test for the SNARETEACH
// teach-drive policy arm (lever loop B, 2026-10-19).
//
// RED honesty: with SNARETEACH unset the drive is a strict no-op (no
// giveFood, no talkTo — the gate-off side is byte-identical to master).
// GREEN: with SNARETEACH=1 and a knower in the cast, the scholar courts
// the trapper — a gift from surplus and a held sitting that takes the
// wire lesson when offered. Guards: L1 learned -> off; no knowers -> off;
// hungry scholar -> no gift (the sitting still happens).
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
  const calls = { giveFood: [], talkTo: [], convoTurn: [], endConvo: [] };
  const knower = o.knower === undefined ? 'vid_knower' : o.knower;
  const trust = o.trust === undefined ? 10 : o.trust;
  const taughtSnare = !!o.taughtSnare;
  const snareL = o.snareL === undefined ? 0 : o.snareL;
  const kcal = o.kcal === undefined ? 2000 : o.kcal;
  const edibles = o.edibles === undefined ? 3 : o.edibles;
  const offerWire = o.offerWire === undefined ? false : o.offerWire;
  const inv = [];
  for (let i = 0; i < edibles; i++) inv.push({ kcalEach: 400, units: 2 });
  const G = {
    calls,
    villagerId: 'vid_scholar',
    over: false,
    tbfight: null,
    state: {
      scholar: { kcal, day: 5, inventory: inv },
      codex: { recipes: { snare: { level: snareL } } },
      village: {
        roster: knower ? ['vid_scholar', knower, 'vid_other'] : ['vid_scholar', 'vid_other'],
        trust: knower ? { [knower]: trust } : {},
      },
    },
    kcalCap: () => 2500,
    vpOf: (vid) => vid === knower ? { knowsSnare: true, taughtSnare, dead: false } : {},
    getPerson: (vid) => ({ id: vid, dead: false }),
    giveFood: (vid) => { calls.giveFood.push(vid); return true; },
    talkTo: (vid) => { calls.talkTo.push(vid); return 'hi'; },
    convoGet: (vid) => ({ active: true }),
    convoChoices: (vid) => (offerWire && vid === knower
      ? [{ id: 'skill_learn:snare_wire', label: '"Teach me Wire Snares?"' }, { id: 'ask', label: 'ask' }]
      : [{ id: 'ask', label: 'ask' }]),
    convoSkillChoices: (vid) => offerWire && vid === knower
      ? [{ id: 'skill_learn:snare_wire', label: '"Teach me Wire Snares?"' }] : [],
    convoTurn: (vid, id) => { calls.convoTurn.push(id); },
    endConvo: (vid, how) => { calls.endConvo.push([vid, how]); },
    isSpoiled: () => false,
  };
  return G;
}
const freshCtx = () => ({});

function withFlag(v, fn) {
  const prev = process.env.SNARETEACH;
  if (v === undefined) delete process.env.SNARETEACH; else process.env.SNARETEACH = v;
  try { return fn(); } finally {
    if (prev === undefined) delete process.env.SNARETEACH; else process.env.SNARETEACH = prev;
  }
}

const snareteach = require('./policies/snareteach');

// ---- RED: gate off = strict no-op --------------------------------------
check('RED gate-off: courtTrapper returns null, no verbs called', () => {
  withFlag(undefined, () => {
    const G = mockGame({});
    const r = snareteach.courtTrapper(G, freshCtx());
    assert.strictEqual(r, null);
    assert.deepStrictEqual(G.calls.giveFood, []);
    assert.deepStrictEqual(G.calls.talkTo, []);
    assert.deepStrictEqual(G.calls.convoTurn, []);
  });
});

check('RED gate-off: on() is false without the flag', () => {
  withFlag(undefined, () => assert.strictEqual(snareteach.on(), false));
  withFlag('0', () => assert.strictEqual(snareteach.on(), false));
});

// ---- GREEN: the drive fires ---------------------------------------------
check('GREEN gate-on: courts the knower (gift + sitting)', () => {
  withFlag('1', () => {
    const G = mockGame({});
    const ctx = freshCtx();
    const r = snareteach.courtTrapper(G, ctx);
    assert.strictEqual(r, 'vid_knower');
    assert.deepStrictEqual(G.calls.giveFood, ['vid_knower'], 'one gift to the knower');
    assert.deepStrictEqual(G.calls.talkTo, ['vid_knower'], 'one sitting with the knower');
    assert.strictEqual(G.calls.endConvo.length, 1, 'honest goodbye');
    assert.strictEqual(ctx.snareteachGifts, 1);
    assert.strictEqual(ctx.snareteachSits, 1);
  });
});

check('GREEN: takes the wire lesson when the menu offers it', () => {
  withFlag('1', () => {
    const G = mockGame({ offerWire: true, trust: 18 });
    const ctx = freshCtx();
    snareteach.courtTrapper(G, ctx);
    assert.ok(G.calls.convoTurn.indexOf('skill_learn:snare_wire') >= 0, 'wire lesson picked first');
    assert.strictEqual(G.calls.convoTurn[0], 'skill_learn:snare_wire', 'picked before courtesy turns');
    assert.strictEqual(ctx.snareteachWireAsked, 1);
    assert.strictEqual(ctx.snareteachWireOffered, 1);
  });
});

check('GREEN: no gift when trust already past the gate', () => {
  withFlag('1', () => {
    const G = mockGame({ trust: 45 });
    const ctx = freshCtx();
    const r = snareteach.courtTrapper(G, ctx);
    assert.strictEqual(r, 'vid_knower', 'still sits (lesson may be offered)');
    assert.deepStrictEqual(G.calls.giveFood, [], 'no gift past the gate');
    assert.strictEqual(ctx.snareteachSits, 1);
  });
});

check('GREEN: hungry scholar gives no gift but still sits', () => {
  withFlag('1', () => {
    const G = mockGame({ kcal: 800 }); // 32% of cap — hungry
    const ctx = freshCtx();
    snareteach.courtTrapper(G, ctx);
    assert.deepStrictEqual(G.calls.giveFood, [], 'never the last meal');
    assert.strictEqual(G.calls.talkTo.length, 1, 'company costs nothing');
  });
});

check('GREEN: drive off once the recipe is learned', () => {
  withFlag('1', () => {
    const G = mockGame({ snareL: 1 });
    assert.strictEqual(snareteach.courtTrapper(G, freshCtx()), null);
    assert.deepStrictEqual(G.calls.talkTo, []);
  });
});

check('GREEN: drive off with no knowers in the cast', () => {
  withFlag('1', () => {
    const G = mockGame({ knower: null });
    assert.strictEqual(snareteach.courtTrapper(G, freshCtx()), null);
    assert.deepStrictEqual(G.calls.giveFood, []);
  });
});

check('GREEN: spent teachers are skipped, unspent ones courted', () => {
  withFlag('1', () => {
    const G = mockGame({ taughtSnare: true });
    assert.strictEqual(snareteach.courtTrapper(G, freshCtx()), null);
    assert.deepStrictEqual(G.calls.talkTo, [], 'no sitting with a spent teacher');
  });
});

check('GREEN: one gift per day max', () => {
  withFlag('1', () => {
    const G = mockGame({});
    const ctx = freshCtx();
    snareteach.courtTrapper(G, ctx);
    snareteach.courtTrapper(G, ctx);
    assert.strictEqual(ctx.snareteachGifts, 1, 'second call same day: no second gift');
    assert.strictEqual(ctx.snareteachSits, 1, 'second call same day: no second sitting');
  });
});

// ---- live-game smoke ------------------------------------------------------
// Uses the real harness (loadGame/setupGame): full src/js eval, Math.random
// seeded BEFORE eval inside the harness. Runs 6 days with SNARETEACH=1 and
// asserts the layer engaged (sits > 0 when an unspent knower lives) and the
// run stayed healthy. Async: handled by the runner below.
async function smokeTest() {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { belongseek } = require('./policies/belongseek');
  const prev = process.env.SNARETEACH;
  process.env.SNARETEACH = '1';
  try {
    const { Game } = await loadGame({ seed: 22, mode: 'snareteach-smoke' });
    await setupGame(Game);
    const ks = snareteach.knowers(Game);
    const policy = Object.assign({}, belongseek);
    let ctxRef = null;
    const origSetup = policy.setup;
    policy.setup = (G, ctx) => { ctxRef = ctx; if (origSetup) return origSetup(G, ctx); };
    await runDays(Game, policy, { days: 6 });
    assert.ok(ctxRef, 'ctx captured');
    if (ks.length && snareteach.snareLevel(Game) === 0) {
      assert.ok((ctxRef.snareteachSits || 0) > 0, 'sittings happened, got ' + ctxRef.snareteachSits);
    }
  } finally {
    if (prev === undefined) delete process.env.SNARETEACH; else process.env.SNARETEACH = prev;
  }
}

(async () => {
  try { await smokeTest(); pass++; console.log('  PASS SMOKE: layer engages in a live run without errors'); }
  catch (e) { fail++; console.log('  FAIL SMOKE: layer engages in a live run without errors — ' + (e && e.message)); }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
