#!/usr/bin/env node
// scripts/test-wireacquire-b.js — proof test for the WIREACQUIRE
// wire-acquire policy arm (lever loop B, 2026-10-19, backlog #633).
//
// RED honesty: with WIREACQUIRE unset the drive is a strict no-op (no
// talkTo, no convoTurn, no setTrap, zero verbs, zero ctx writes — the
// gate-off side is byte-identical to master).
// GREEN: with WIREACQUIRE=1 the layer (a) enumerates hawkers RNG-clean —
// NEVER calls Game.tradeSpirit, never triggers the lazy _tradeSpiritRolled
// roll, shops only deterministic-gate or already-rolled villagers; (b)
// asks wire-holders first (targeted trade conversation, polite refusal),
// falls back to any known hawker; buys ONLY the wire ware from a surplus;
// (c) takes the proven wire-tackle SET leg on wild ground; goes permanently
// quiet once any trap is set.
//
// Harness: mock-Game unit checks (fast, deterministic) + live-game engine
// verb RED/GREEN (the wire path consumes wire + creates a 2-use snare with
// no recipe knowledge) + one full-game smoke (seeded BEFORE eval per
// AGENTS.md) proving the layer engages without errors.
'use strict';
const assert = require('assert');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  PASS ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' — ' + (e && e.message)); }
}

// ---- mock Game ---------------------------------------------------------
// villagers: array of {vid, entrepreneurial?, occ?, rolled? (null=unrolled),
// holdsWire?}. tradeSpirit THROWS if called — the layer must never call it.
function mockGame(o) {
  o = o || {};
  const calls = { talkTo: [], convoTurn: [], endConvo: [], setTrap: [], tradeSpirit: 0 };
  const villagers = o.villagers || [
    { vid: 'vid_holder', occ: 'forager', rolled: null, holdsWire: true },
  ];
  const wareId = o.wareId === undefined ? 'rope_50ft' : o.wareId;
  const warePrice = o.warePrice === undefined ? 500 : o.warePrice;
  const offerHawkerChoice = o.offerHawkerChoice === undefined ? true : o.offerHawkerChoice;
  let wireInPack = !!o.wireInPack;
  const trapsSet = o.trapsSet || 0;
  const wildTile = o.wildTile === undefined ? false : o.wildTile;
  const foodKcal = o.foodKcal === undefined ? 3000 : o.foodKcal;
  const talkFails = !!o.talkFails;
  const roster = ['vid_scholar'].concat(villagers.map(v => v.vid));
  const recs = {};
  for (const v of villagers) {
    recs[v.vid] = {
      id: v.vid, dead: false,
      entrepreneurial: !!v.entrepreneurial,
      formerOccupation: v.occ || '',
      _tradeSpiritRolled: v.rolled === undefined ? null : v.rolled,
      items: v.holdsWire ? [{ itemId: 'snare_wire', units: 1 }] : [],
      stashed: [],
    };
  }
  const G = {
    calls,
    villagerId: 'vid_scholar',
    over: false,
    data: { villagers: villagers.map(v => recs[v.vid]) },
    state: {
      scholar: { day: o.day === undefined ? 5 : o.day, inventory: [] },
      village: { roster, trust: {} },
    },
    hasItem: (id) => id === 'snare_wire' && wireInPack,
    tradeSpirit: () => { calls.tradeSpirit++; throw new Error('tradeSpirit must never be called by the layer'); },
    getPerson: (vid) => recs[vid] || { id: vid, dead: false },
    vpOf: (vid) => recs[vid] || {},
    isFinishedFood: (it) => !!(it && it.finished),
    talkTo: (vid) => { calls.talkTo.push(vid); return talkFails ? null : 'hi'; },
    convoChoices: (vid) => offerHawkerChoice
      ? [{ id: 'hawker', label: '"Got anything to trade?"' }, { id: 'ask', label: 'ask' }]
      : [{ id: 'ask', label: 'ask' }],
    convoTurn: (vid, id) => { calls.convoTurn.push(id); },
    endConvo: (vid, how) => { calls.endConvo.push([vid, how]); },
    hawkerOffer: (vid) => ({ itemId: wareId, name: wareId, price: warePrice, sold: false }),
    playerTile: () => (wildTile ? { type: 'meadow' } : { type: 'haven' }),
    setTrap: (rid) => { calls.setTrap.push(rid); return rid === 'snare' && wireInPack; },
  };
  if (foodKcal > 0) G.state.scholar.inventory.push({ name: 'Smoked strips', finished: true, kcalEach: 300, units: Math.ceil(foodKcal / 300) });
  if (wireInPack) G.state.scholar.inventory.push({ name: 'Snare wire', itemId: 'snare_wire', units: 1 });
  const ctx = { trapsSet, trapsWireSet: 0 };
  const origCT = G.convoTurn;
  G.convoTurn = (vid, id) => {
    origCT(vid, id);
    if (id === 'hawker_yes' && wareId === 'snare_wire') {
      wireInPack = true;
      G.state.scholar.inventory.push({ name: 'Snare wire', itemId: 'snare_wire', units: 1 });
    }
  };
  return { G, ctx, recs };
}

function withFlag(v, fn) {
  const prev = process.env.WIREACQUIRE;
  if (v === undefined) delete process.env.WIREACQUIRE; else process.env.WIREACQUIRE = v;
  try { return fn(); } finally {
    if (prev === undefined) delete process.env.WIREACQUIRE; else process.env.WIREACQUIRE = prev;
  }
}

// KILL RECORD (2026-10-19, sim-wireacquire-b3): the layer was KILLED-AT-PILOT
// (substrate-missing — villagers don't hawk in real sims; see
// evidence/2026-10-19/sim-wireacquire-b3.md) and scripts/policies/wireacquire.js
// was deleted zero-trace per the kill protocol. Proof was 18/18 GREEN pre-kill
// (incl. the RNG-clean mirror vs the live engine). This instrument is kept as
// the proof record; it self-skips when the layer is gone.
let wa = null;
try {
  wa = require('./policies/wireacquire');
} catch (e) {
  console.log('LAYER DELETED (killed at pilot 2026-10-19, substrate-missing) — proof was 18/18 GREEN pre-kill; see evidence/2026-10-19/sim-wireacquire-b3.md');
  process.exit(0);
}

// ---- RED: gate off = strict no-op --------------------------------------
check('RED gate-off: acquireWire returns null, no verbs, zero ctx writes', () => {
  withFlag(undefined, () => {
    const { G, ctx } = mockGame({ wareId: 'snare_wire' });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, null);
    assert.deepStrictEqual(G.calls.talkTo, []);
    assert.deepStrictEqual(G.calls.convoTurn, []);
    assert.deepStrictEqual(G.calls.setTrap, []);
    assert.strictEqual(G.calls.tradeSpirit, 0);
    assert.deepStrictEqual(Object.keys(ctx).filter(k => k.indexOf('_wa') === 0), [], 'zero layer writes');
  });
});

check('RED gate-off: layerOn() false without the flag', () => {
  withFlag(undefined, () => assert.strictEqual(wa.layerOn(), false));
  withFlag('0', () => assert.strictEqual(wa.layerOn(), false));
});

check('RED gate-off: withWireAcquire wrapper delegates without layer writes', () => {
  withFlag(undefined, () => {
    const { G, ctx } = mockGame({ wareId: 'snare_wire' });
    let baseDaily = 0;
    const base = { id: 'b', daily: (g, c) => { baseDaily++; } };
    const w = wa.withWireAcquire(base, 'w');
    w.daily(G, ctx);
    assert.strictEqual(baseDaily, 1, 'base daily still runs');
    assert.deepStrictEqual(G.calls.talkTo, []);
    assert.deepStrictEqual(Object.keys(ctx).filter(k => k.indexOf('_wa') === 0), []);
  });
});

// ---- GREEN: RNG-clean enumeration ---------------------------------------
check('GREEN RNG-clean: spiritKnown never calls tradeSpirit, never rolls', () => {
  withFlag('1', () => {
    const { G, recs } = mockGame({ villagers: [
      { vid: 'v_bold', occ: 'forager', rolled: null },
      { vid: 'v_merch', occ: 'shopkeep', rolled: null },
      { vid: 'v_entre', occ: 'forager', rolled: null, entrepreneurial: true },
      { vid: 'v_rolled', occ: 'forager', rolled: 1 },
      { vid: 'v_zero', occ: 'forager', rolled: 0 },
    ]});
    assert.strictEqual(wa.spiritKnown(G, 'v_bold'), null, 'unrolled -> null (not shopped)');
    assert.strictEqual(wa.spiritKnown(G, 'v_merch'), 2, 'shopkeep blood -> 2');
    assert.strictEqual(wa.spiritKnown(G, 'v_entre'), 2, 'entrepreneurial flag -> 2');
    assert.strictEqual(wa.spiritKnown(G, 'v_rolled'), 1, 'already-rolled -> 1');
    assert.strictEqual(wa.spiritKnown(G, 'v_zero'), 0, 'already-rolled 0 -> 0');
    assert.strictEqual(G.calls.tradeSpirit, 0, 'tradeSpirit never called');
    assert.strictEqual(recs['v_bold']._tradeSpiritRolled, null, 'lazy roll NOT triggered');
  });
});

check('GREEN RNG-clean: unrolled villagers are never shopped', () => {
  withFlag('1', () => {
    const { G, ctx, recs } = mockGame({ villagers: [
      { vid: 'v_bold', occ: 'forager', rolled: null },
    ]});
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, null, 'quiet, got ' + r);
    assert.deepStrictEqual(G.calls.talkTo, [], 'no conversation with unrolled villagers');
    assert.strictEqual(recs['v_bold']._tradeSpiritRolled, null, 'still unrolled');
  });
});

// ---- GREEN: ask (targeted at wire-holders) -------------------------------
check('GREEN ask: seeks the wire-holder, buys the wire from a surplus', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({
      villagers: [
        { vid: 'vid_holder', occ: 'forager', rolled: 1, holdsWire: true },
        { vid: 'vid_hawker', occ: 'peddler', rolled: null },
      ],
      wareId: 'snare_wire', warePrice: 500, foodKcal: 3000,
    });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'bought', 'got ' + r);
    assert.deepStrictEqual(G.calls.talkTo, ['vid_holder'], 'asked the HOLDER, not the random hawker');
    assert.ok(G.calls.convoTurn.indexOf('hawker_yes') >= 0, 'bought the wire');
    assert.strictEqual(ctx._waAsks, 1, 'ask counted');
    assert.strictEqual(ctx._waWireBought, 1, 'purchase recorded');
    assert.strictEqual(ctx._waHawkerChecks, 1);
  });
});

check('GREEN ask: polite refusal when the holder sells something else', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({
      villagers: [{ vid: 'vid_holder', occ: 'forager', rolled: 1, holdsWire: true }],
      wareId: 'rope_50ft', foodKcal: 3000,
    });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'not-wire', 'got ' + r);
    assert.ok(G.calls.convoTurn.indexOf('hawker_no') >= 0, 'polite pass');
    assert.ok(G.calls.convoTurn.indexOf('hawker_yes') < 0, 'no purchase');
    assert.strictEqual(ctx._waAskRefusals, 1, 'refusal counted');
    assert.strictEqual(ctx._waAsked['vid_holder'], 1, 'holder not re-asked');
    // next day: the asked holder is skipped -> falls quiet (no other hawker)
    G.state.scholar.day = 6;
    const r2 = wa.acquireWire(G, ctx);
    assert.strictEqual(r2, null, 'no re-ask, got ' + r2);
    assert.strictEqual(G.calls.talkTo.length, 1, 'still one conversation total');
  });
});

check('GREEN ask: wire-but-unaffordable recorded, re-asked when the pack fattens', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({
      villagers: [{ vid: 'vid_holder', occ: 'forager', rolled: 1, holdsWire: true }],
      wareId: 'snare_wire', warePrice: 800, foodKcal: 900,
    });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'wire-unaffordable', 'got ' + r);
    assert.ok(G.calls.convoTurn.indexOf('hawker_yes') < 0, 'no purchase on a thin pack');
    assert.deepStrictEqual(ctx._waAsked['vid_holder'], { unaffordable: 800 });
    // pack fattens: re-ask fires
    G.state.scholar.inventory.push({ name: 'Smoked strips', finished: true, kcalEach: 300, units: 10 });
    G.state.scholar.day = 6;
    const r2 = wa.acquireWire(G, ctx);
    assert.strictEqual(r2, 'bought', 're-ask bought, got ' + r2);
    assert.strictEqual(ctx._waWireBought, 1);
  });
});

check('GREEN buy fallback: no holder, shops a known hawker', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({
      villagers: [{ vid: 'vid_hawker', occ: 'merchant', rolled: null }],
      wareId: 'snare_wire', warePrice: 500, foodKcal: 3000,
    });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'bought', 'got ' + r);
    assert.deepStrictEqual(G.calls.talkTo, ['vid_hawker']);
    assert.strictEqual(ctx._waAsks || 0, 0, 'not counted as an ask');
  });
});

check('GREEN: one trade conversation per day', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({
      villagers: [{ vid: 'vid_hawker', occ: 'merchant', rolled: null }],
      wareId: 'rope_50ft',
    });
    wa.acquireWire(G, ctx);
    const r2 = wa.acquireWire(G, ctx);
    assert.strictEqual(r2, null, 'second call same day is quiet');
    assert.strictEqual(G.calls.talkTo.length, 1, 'one conversation per day');
  });
});

check('GREEN: no-hawker-choice ends politely without buying', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({
      villagers: [{ vid: 'vid_hawker', occ: 'merchant', rolled: null }],
      offerHawkerChoice: false,
    });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'no-hawker-choice', 'got ' + r);
    assert.strictEqual(G.calls.endConvo.length, 1, 'clean goodbye');
  });
});

// ---- GREEN: set ----------------------------------------------------------
check('GREEN: holding wire — no shopping, drive switches to SET', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({ wireInPack: true, wildTile: false });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'holding', 'got ' + r);
    assert.deepStrictEqual(G.calls.talkTo, [], 'no shopping once the wire is in hand');
    assert.strictEqual(ctx._waWireHeldDay, 5, 'acquisition day recorded');
  });
});

check('GREEN: wire in hand on wild ground — takes the wire path', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({ wireInPack: true, wildTile: true });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'set', 'got ' + r);
    assert.deepStrictEqual(G.calls.setTrap, ['snare'], 'setTrap(snare) fired once');
    assert.strictEqual(ctx._waWireSets, 1);
    assert.ok(ctx._waDone, 'bootstrap complete — permanently quiet');
  });
});

check('GREEN: set-refused (engine said no) does not mark the bootstrap done', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({ wireInPack: true, wildTile: true });
    G.setTrap = (rid) => { G.calls.setTrap.push(rid); return null; };
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'set-refused', 'got ' + r);
    assert.ok(!ctx._waDone, 'not done — the layer may try again');
  });
});

check('GREEN: traps already set (craft path) — drive permanently quiet', () => {
  withFlag('1', () => {
    const { G, ctx } = mockGame({ trapsSet: 2, wareId: 'snare_wire' });
    const r = wa.acquireWire(G, ctx);
    assert.strictEqual(r, 'done', 'got ' + r);
    assert.deepStrictEqual(G.calls.talkTo, [], 'no shopping after the bootstrap');
    assert.deepStrictEqual(G.calls.setTrap, [], 'no setting after the bootstrap');
    const r2 = wa.acquireWire(G, ctx);
    assert.strictEqual(r2, null, 'stays quiet');
  });
});

// ---- live-game: engine verb RED/GREEN -------------------------------------
async function engineVerbTest() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 31711, mode: 'wireacquire-engine' });
  await setupGame(Game);
  let tx = null, ty = null;
  for (let y = 0; y < 9 && tx === null; y++) for (let x = 0; x < 9; x++) {
    const t = Game.tileAt(x, y);
    if (t && t.type !== 'haven' && t.type !== 'ruin') { tx = x; ty = y; break; }
  }
  assert.ok(tx !== null, 'a wild tile exists');
  Game.map.px = tx; Game.map.py = ty;
  const inv = Game.state.scholar.inventory;
  const r0 = Game.setTrap('snare');
  assert.strictEqual(r0, null, 'no wire: setTrap returns null');
  Game.state.codex.recipes.snare = { level: 0 };
  Game.state.scholar.tools = [];
  inv.push({ name: 'Snare wire', itemId: 'snare_wire', units: 1 });
  const r1 = Game.setTrap('snare');
  assert.ok(r1, 'wire: setTrap succeeds with recipe L0');
  assert.ok(!inv.some(i => (i.itemId || i.id) === 'snare_wire'), 'wire consumed');
  const pt = Game.playerTile();
  const trap = (pt.traps || []).find(t => t.recipeId === 'snare');
  assert.ok(trap, 'snare trap placed on the tile');
  assert.strictEqual(trap.uses, 2, 'improvised 2-use snare, got ' + (trap && trap.uses));
}

// ---- live-game: RNG-clean spirit mirror on the real engine ---------------
async function spiritMirrorTest() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 31711, mode: 'wireacquire-mirror' });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(v => v !== Game.villagerId);
  assert.ok(roster.length > 3, 'roster exists');
  // for every villager where the mirror claims knowledge, the REAL
  // tradeSpirit must agree WITHOUT the mirror having triggered a roll:
  // capture _tradeSpiritRolled before/after across the whole roster.
  const before = {};
  for (const vid of roster) {
    let vp = null;
    try { vp = Game.vpOf(vid); } catch (e) {}
    before[vid] = vp ? vp._tradeSpiritRolled : 'n/a';
  }
  let checked = 0, known = 0;
  for (const vid of roster) {
    const k = wa.spiritKnown(Game, vid);
    checked++;
    if (k != null) {
      known++;
      const real = Game.tradeSpirit(vid);
      assert.strictEqual(real, k, `mirror agrees with tradeSpirit for ${vid} (${k} vs ${real})`);
    }
  }
  // force the engine's own roll on one villager, then verify the mirror
  // agrees with the rolled value (and still triggers nothing itself)
  const guinea = roster[0];
  const rolled = Game.tradeSpirit(guinea); // engine verb: honest RNG draw
  let vp = null;
  try { vp = Game.vpOf(guinea); } catch (e) {}
  assert.ok(vp && vp._tradeSpiritRolled != null, 'engine roll recorded');
  const mk = wa.spiritKnown(Game, guinea);
  assert.strictEqual(mk, rolled, `mirror agrees post-roll (${mk} vs ${rolled})`);
  known++;
  // re-snapshot AFTER the engine's own roll: the mirror must change nothing
  for (const vid of roster) {
    let v2 = null;
    try { v2 = Game.vpOf(vid); } catch (e) {}
    before[vid] = v2 ? v2._tradeSpiritRolled : 'n/a';
    wa.spiritKnown(Game, vid);
  }
  for (const vid of roster) {
    let vp = null;
    try { vp = Game.vpOf(vid); } catch (e) {}
    const after = vp ? vp._tradeSpiritRolled : 'n/a';
    assert.strictEqual(after, before[vid], `no lazy roll triggered for ${vid}`);
  }
  console.log(`    (mirror: ${checked} villagers, ${known} known-positive-or-zero, 0 rolls triggered)`);
}

// ---- live-game smoke ------------------------------------------------------
async function smokeTest() {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { POLICY_REGISTRY } = require('./sweep-compare');
  const prev = process.env.WIREACQUIRE;
  const pf = process.env.FEASTSCALE_R13, ps = process.env.SEATDRIVE;
  process.env.WIREACQUIRE = '1'; process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
  try {
    const { Game } = await loadGame({ seed: 31712, mode: 'wireacquire-smoke' });
    await setupGame(Game);
    const policy = wa.withWireAcquire(POLICY_REGISTRY['belongfeast'], 'belongfeast-wa');
    let ctxRef = null;
    const wrapped = Object.assign({}, policy, {
      setup(G, ctx) { ctxRef = ctx; if (policy.setup) return policy.setup(G, ctx); },
    });
    await runDays(Game, wrapped, { days: 6 });
    assert.ok(ctxRef, 'ctx captured');
    console.log('    (smoke telemetry: checks=' + (ctxRef._waHawkerChecks || 0) +
      ' asks=' + (ctxRef._waAsks || 0) + ' wares=' + (ctxRef._waWireWares || 0) +
      ' bought=' + (ctxRef._waWireBought || 0) + ' sets=' + (ctxRef._waWireSets || 0) + ')');
  } finally {
    if (prev === undefined) delete process.env.WIREACQUIRE; else process.env.WIREACQUIRE = prev;
    if (pf === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = pf;
    if (ps === undefined) delete process.env.SEATDRIVE; else process.env.SEATDRIVE = ps;
  }
}

(async () => {
  try { await engineVerbTest(); pass++; console.log('  PASS ENGINE: wire path consumes wire + 2-use snare, no recipe; RED without wire'); }
  catch (e) { fail++; console.log('  FAIL ENGINE: wire path — ' + (e && e.message)); }
  try { await spiritMirrorTest(); pass++; console.log('  PASS MIRROR: spiritKnown agrees with tradeSpirit, triggers zero lazy rolls'); }
  catch (e) { fail++; console.log('  FAIL MIRROR: spiritKnown agrees with tradeSpirit — ' + (e && e.message)); }
  try { await smokeTest(); pass++; console.log('  PASS SMOKE: layer engages in a live run without errors'); }
  catch (e) { fail++; console.log('  FAIL SMOKE: layer engages in a live run without errors — ' + (e && e.message)); }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
