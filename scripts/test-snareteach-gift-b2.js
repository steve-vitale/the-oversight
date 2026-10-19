#!/usr/bin/env node
// scripts/test-snareteach-gift-b2.js — proof test for the landed
// SNARETEACH gift bar (sim-snareteach-gift-b2, lever loop B, 2026-10-19).
// Backlog #632: the old gift bar (kcal > 55% cap + 2 edibles) fired 0/8
// pilot runs — dead code. The landed bar: kcal > 40% cap + 1 edible stack
// (the "never the last meal" protection moved from the stack count to the
// kcal floor). The two measuring sub-arms' machinery (SNARETEACH_GIFT
// low|off) was deleted with the loser; this test proves the landed file.
//
// RED honesty: with SNARETEACH unset the drive is a strict no-op. GREEN:
// the lowered bar fires where the old bar refused, still refuses when the
// scholar is hungry or foodless, the sitting teach-drive is intact, and a
// det-gate (byte-identical trajectories on re-run).
//
// Harness: mock-Game unit checks (fast, deterministic) + full-game smoke
// (loadGame seeds Math.random BEFORE eval; per-loadGame clock reset makes
// trajectories reproducible — sim-harness.js entropy-hunt r27).
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

// ---- RED: gate off = strict no-op ---------------------------------------
check('RED gate-off: courtTrapper returns null, no verbs called', () => {
  withFlag(undefined, () => {
    const G = mockGame({});
    assert.strictEqual(snareteach.courtTrapper(G, freshCtx()), null);
    assert.deepStrictEqual(G.calls.giveFood, []);
    assert.deepStrictEqual(G.calls.talkTo, []);
    assert.deepStrictEqual(G.calls.convoTurn, []);
  });
});

check('RED gate-off: on() is false without the flag', () => {
  withFlag(undefined, () => assert.strictEqual(snareteach.on(), false));
  withFlag('0', () => assert.strictEqual(snareteach.on(), false));
});

// ---- GREEN: the lowered gift bar ------------------------------------------
check('GREEN: gift fires at 45% kcal with 1 edible (old 55%/2 bar refused)', () => {
  withFlag('1', () => {
    const G = mockGame({ kcal: 1125, edibles: 1 }); // 45% of 2500 cap
    const ctx = freshCtx();
    const r = snareteach.courtTrapper(G, ctx);
    assert.strictEqual(r, 'vid_knower');
    assert.deepStrictEqual(G.calls.giveFood, ['vid_knower']);
    assert.strictEqual(ctx.snareteachGifts, 1);
  });
});

check('GREEN: no gift below the 40% floor, sitting still happens', () => {
  withFlag('1', () => {
    const G = mockGame({ kcal: 875, edibles: 3 }); // 35% of cap
    const ctx = freshCtx();
    snareteach.courtTrapper(G, ctx);
    assert.deepStrictEqual(G.calls.giveFood, [], 'never the last meal');
    assert.strictEqual(G.calls.talkTo.length, 1, 'company costs nothing');
  });
});

check('GREEN: no gift with zero edibles', () => {
  withFlag('1', () => {
    const G = mockGame({ kcal: 2000, edibles: 0 });
    const ctx = freshCtx();
    snareteach.courtTrapper(G, ctx);
    assert.deepStrictEqual(G.calls.giveFood, []);
  });
});

check('GREEN: one gift per day max', () => {
  withFlag('1', () => {
    const G = mockGame({ kcal: 1200, edibles: 2 });
    const ctx = freshCtx();
    snareteach.courtTrapper(G, ctx);
    snareteach.courtTrapper(G, ctx);
    assert.strictEqual(ctx.snareteachGifts, 1, 'second call same day: no second gift');
    assert.strictEqual(ctx.snareteachSits, 1, 'second call same day: no second sitting');
  });
});

check('GREEN: no gift when trust already past the gate', () => {
  withFlag('1', () => {
    const G = mockGame({ kcal: 1200, edibles: 2, trust: 45 });
    const ctx = freshCtx();
    const r = snareteach.courtTrapper(G, ctx);
    assert.strictEqual(r, 'vid_knower', 'still sits (lesson may be offered)');
    assert.deepStrictEqual(G.calls.giveFood, [], 'no gift past the gate');
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

// ---- live-game smoke + det-gate --------------------------------------------
// Full-game: leadfeast (competent family; competent.js calls
// snareteach.courtTrapper in its daily). Seed 7801, 10 days, FEASTSCALE
// substrate. The det-gate runs the SAME armed trajectory twice and demands
// byte-identical digests.
async function runTrajectory(seed) {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { POLICY_REGISTRY } = require('./sweep-compare');
  const { Game } = await loadGame({ seed, mode: 'gift-b2-landed' });
  await setupGame(Game);
  const policy = Object.assign({}, POLICY_REGISTRY.leadfeast);
  let ctxRef = null;
  const origSetup = policy.setup;
  policy.setup = (G, ctx) => { ctxRef = ctx; if (origSetup) return origSetup(G, ctx); };
  await runDays(Game, policy, { days: 10 });
  const s = Game.state.scholar, v = Game.state.village;
  const digest = JSON.stringify({
    day: s.day, kcal: Math.round(s.kcal || 0), health: Math.round(s.health || 0),
    hydration: Math.round(s.hydration || 0),
    snare: (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0,
    trust: v.trust || {}, living: (v.roster || []).length,
    deaths: ((Game.state.telemetry || []).filter(e => e.type === 'death') || [])
      .map(e => [e.day, e.who, e.cause].join(':')),
    gifts: (ctxRef && ctxRef.snareteachGifts) || 0,
    sits: (ctxRef && ctxRef.snareteachSits) || 0,
  });
  return { digest, ctx: ctxRef };
}

(async () => {
  const save = { SNARETEACH: process.env.SNARETEACH, FEASTSCALE_R13: process.env.FEASTSCALE_R13, SEATDRIVE: process.env.SEATDRIVE };
  try {
    process.env.SNARETEACH = '1'; process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
    try {
      const a = await runTrajectory(7801);
      const b = await runTrajectory(7801);
      assert.strictEqual(b.digest, a.digest, 'trajectories must be byte-identical on re-run');
      pass++; console.log('  PASS DET-GATE: identical trajectories on re-run (seed 7801, 10d, landed bar)');
    } catch (e) { fail++; console.log('  FAIL DET-GATE — ' + (e && e.message)); }
    try {
      const r = await runTrajectory(7804);
      assert.ok(r.ctx, 'ctx captured');
      pass++; console.log(`  PASS SMOKE: no errors, gifts=${r.ctx.snareteachGifts || 0} sits=${r.ctx.snareteachSits || 0}`);
    } catch (e) { fail++; console.log('  FAIL SMOKE — ' + (e && e.message)); }
  } finally {
    for (const k of Object.keys(save)) {
      if (save[k] === undefined) delete process.env[k]; else process.env[k] = save[k];
    }
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
