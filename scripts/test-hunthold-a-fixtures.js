#!/usr/bin/env node
// scripts/test-hunthold-a-fixtures.js — sim-hunthold-a lever fixtures.
// Stub-engine proofs (no harness, no RNG): every verdict, the
// budget, the early returns, the narration rule, the OFF env-gate,
// and the analyzer's heldByLever mapping. Exit 1 on any failure.
'use strict';
const assert = require('assert');
const {
  layerOn, newStore, installHunthold, withHunthold, MAX_HOLD,
} = require('./policies/hunthold');

// The analyzer's mapping, imported so fixtures prove the exact
// function the judged run uses (not a copy of it).
const { heldByLever } = require('./test-hunthold-a');

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failures++; console.log(`FAIL - ${name}: ${e.message}`); }
}

// Stub engine: objMaybeDepart mimics the base engine exactly
// for the paths the lever cares about — go departs, anything
// else overwrites to an indoor chore. objDanger is a stub the
// test configures per case; call counts prove what the lever
// did and did not render.
function stubGame(opts) {
  const o = opts || {};
  const objectives = {};
  const obj = o.objective || null;
  if (obj) objectives[obj.vid] = obj;
  const said = [];
  const calls = { danger: 0, engine: 0, depart: 0, tighten: 0 };
  const Game = {
    state: {
      scholar: { day: o.day != null ? o.day : 10 },
      village: {
        objectives,
        sick: o.sick || {},
        away: o.away || {},
        hurtGate: o.hurtGate || {},
      },
    },
    map: { px: o.px != null ? o.px : 4, py: o.py != null ? o.py : 4 },
    _said: said, _calls: calls,
    displayName: (vid) => (o.names && o.names[vid]) || (vid + ' Name'),
    monsterDisplayName: (mid) => (o.descs && o.descs[mid]) || 'the beast',
    articlePhrase: (s) => s,
    say: (line) => { said.push(line); },
    agencyState: () => ({ exped: o.exped || {} }),
    isEngaged: (vid) => !!((o.engaged || {})[vid]),
    objDanger: (vid, tx, ty, hx, hy) => {
      calls.danger++;
      return o.danger || { score: 1, verdict: 'go' };
    },
    objDepart: (vid, obj2) => { calls.depart++; obj2.state = 'out'; return true; },
    objTightenOrDefer: (vid, obj2) => {
      calls.tighten++;
      obj2.kind = 'HAVEN_CHORE'; obj2.purpose = 'chore'; obj2.indoor = true; obj2.state = 'indoor';
    },
    objPick: (vid) => {
      const oo = objectives[vid];
      if (oo) { oo.kind = 'idle'; oo.state = 'idle'; }
      return oo;
    },
    objMaybeDepart: (rid, node, atHaven, hx, hy) => {
      calls.engine++;
      const oo = objectives[rid];
      if (!atHaven) return undefined;
      if ((Game.state.village.sick || {})[rid]) return undefined;
      if ((Game.state.village.away || {})[rid]) return undefined;
      if (Game.agencyState().exped[rid]) return undefined;
      if (Game.isEngaged(rid)) return undefined;
      const hg = (Game.state.village.hurtGate || {})[rid];
      if (hg && hg.day === Game.state.scholar.day && hg.satOut) return undefined;
      if (!oo || oo.state !== 'ready') return undefined;
      const dg = Game.objDanger(rid, oo.tx, oo.ty, hx, hy);
      if (dg.verdict === 'go') return Game.objDepart(rid, oo);
      return Game.objTightenOrDefer(rid, oo);
    },
  };
  return Game;
}

function huntObj(vid) {
  return {
    vid, kind: 'HUNT', purpose: 'hunt', state: 'ready', indoor: false,
    tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 8,
    tightness: 1, partsLeft: 5, targetVid: null, companion: null,
  };
}

// 1. OFF env-gate: HUNTHOLD unset -> daily installs nothing,
// methods identical.
check('OFF env-gate: withHunthold daily leaves methods identical', () => {
  delete process.env.HUNTHOLD;
  assert.strictEqual(layerOn(), false);
  const Game = stubGame({ objective: huntObj('v1') });
  const origMaybe = Game.objMaybeDepart;
  const origPick = Game.objPick;
  const inner = { daily: () => 'inner-daily' };
  const wrapped = withHunthold(inner, 'hunthold', 'test');
  assert.strictEqual(wrapped.daily(Game, {}), 'inner-daily');
  assert.strictEqual(Game.objMaybeDepart, origMaybe);
  assert.strictEqual(Game.objPick, origPick);
});

// 2. go -> delegates, departs, no hold.
check('go verdict delegates and departs, no hold counted', () => {
  const store = newStore();
  const obj = huntObj('v1');
  const Game = stubGame({ objective: obj, danger: { score: 1, verdict: 'go' } });
  installHunthold(Game, store);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._calls.engine, 1);
  assert.strictEqual(obj.state, 'out');
  assert.strictEqual(store.holds, 0);
  assert.strictEqual(obj.dangerHold, undefined);
});

// 3. ask -> holds: engine NOT called, still ready, counter 1.
check('ask verdict holds, engine not called, counter 1', () => {
  const store = newStore();
  const obj = huntObj('v1');
  const Game = stubGame({ objective: obj, danger: { score: 3, verdict: 'ask' } });
  installHunthold(Game, store);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._calls.engine, 0);
  assert.strictEqual(obj.state, 'ready');
  assert.strictEqual(obj.kind, 'HUNT');
  assert.strictEqual(obj.dangerHold, 1);
  assert.strictEqual(store.holds, 1);
});

// 4. tighten -> holds.
check('tighten verdict holds', () => {
  const store = newStore();
  const obj = huntObj('v1');
  const Game = stubGame({ objective: obj, danger: { score: 4, verdict: 'tighten' } });
  installHunthold(Game, store);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._calls.engine, 0);
  assert.strictEqual(obj.state, 'ready');
  assert.strictEqual(obj.dangerHold, 1);
  assert.strictEqual(store.holds, 1);
});

// 5. defer -> delegates, overwrites, no hold.
check('defer verdict delegates and overwrites, no hold', () => {
  const store = newStore();
  const obj = huntObj('v1');
  const Game = stubGame({ objective: obj, danger: { score: 7, verdict: 'defer' } });
  installHunthold(Game, store);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._calls.engine, 1);
  assert.strictEqual(obj.kind, 'HAVEN_CHORE');
  assert.strictEqual(obj.state, 'indoor');
  assert.strictEqual(store.holds, 0);
});

// 6. Budget: MAX_HOLD holds, then the next delegates.
check(`budget: ${MAX_HOLD} holds then delegation on the next ask`, () => {
  assert.strictEqual(MAX_HOLD, 6);
  const store = newStore();
  const obj = huntObj('v1');
  const Game = stubGame({ objective: obj, danger: { score: 5, verdict: 'tighten' } });
  installHunthold(Game, store);
  for (let i = 0; i < MAX_HOLD; i++) {
    Game.objMaybeDepart('v1', null, true, 4, 4);
    assert.strictEqual(Game._calls.engine, 0, `engine called on hold ${i + 1}`);
    assert.strictEqual(obj.dangerHold, i + 1);
  }
  assert.strictEqual(store.holds, MAX_HOLD);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._calls.engine, 1);
  assert.strictEqual(obj.kind, 'HAVEN_CHORE');
  assert.strictEqual(store.exhausted, 1);
});

// 7. Early returns: sick/away/engaged/agency/heal-sat-out/
// not-at-haven -> delegate, no budget, no lever danger call.
check('early returns delegate with no budget and no lever danger call', () => {
  const cases = [
    ['sick', { sick: { v1: true } }],
    ['away', { away: { v1: true } }],
    ['engaged', { engaged: { v1: true } }],
    ['agency', { exped: { v1: true } }],
    ['heal-sat-out', { hurtGate: { v1: { day: 10, satOut: true } } }],
  ];
  for (const [name, extra] of cases) {
    const store = newStore();
    const obj = huntObj('v1');
    const Game = stubGame(Object.assign({ objective: obj, danger: { score: 4, verdict: 'tighten' } }, extra));
    installHunthold(Game, store);
    Game.objMaybeDepart('v1', null, true, 4, 4);
    assert.strictEqual(Game._calls.engine, 1, `${name}: engine not called`);
    assert.strictEqual(Game._calls.danger, 0, `${name}: lever rendered a danger verdict`);
    assert.strictEqual(obj.dangerHold, undefined, `${name}: budget consumed`);
    assert.strictEqual(obj.state, 'ready', `${name}: objective moved`);
    assert.strictEqual(store.holds, 0, `${name}: hold counted`);
  }
  const store2 = newStore();
  const obj2 = huntObj('v1');
  const Game2 = stubGame({ objective: obj2, danger: { score: 4, verdict: 'tighten' } });
  installHunthold(Game2, store2);
  Game2.objMaybeDepart('v1', null, false, 4, 4);
  assert.strictEqual(Game2._calls.engine, 1, 'not-at-haven: engine not called');
  assert.strictEqual(Game2._calls.danger, 0, 'not-at-haven: lever rendered danger');
  assert.strictEqual(obj2.dangerHold, undefined);
});

// 8. Unknown verdict -> delegates, never held.
check('unknown verdict delegates, never held', () => {
  const store = newStore();
  const obj = huntObj('v1');
  const Game = stubGame({ objective: obj, danger: { score: 9, verdict: 'mystery' } });
  installHunthold(Game, store);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._calls.engine, 1);
  assert.strictEqual(store.holds, 0);
});

// 9. Non-HUNT / non-ready -> delegates untouched.
check('non-HUNT and non-ready objectives delegate untouched', () => {
  const store = newStore();
  const water = { vid: 'v1', kind: 'WATER', purpose: 'water', state: 'ready', indoor: false, tx: 4, ty: 5 };
  const Game = stubGame({ objective: water, danger: { score: 4, verdict: 'tighten' } });
  installHunthold(Game, store);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._calls.engine, 1);
  assert.strictEqual(store.holds, 0);
  const store2 = newStore();
  const done = huntObj('v1'); done.state = 'done';
  const Game2 = stubGame({ objective: done, danger: { score: 4, verdict: 'tighten' } });
  installHunthold(Game2, store2);
  Game2.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game2._calls.engine, 1);
  assert.strictEqual(store2.holds, 0);
});

// 10. Narration: once per objective, player at haven only.
check('narration fires once per objective, player at haven only', () => {
  const store = newStore();
  const obj = huntObj('v1');
  const Game = stubGame({ objective: obj, danger: { score: 3, verdict: 'ask' }, px: 4, py: 4 });
  installHunthold(Game, store);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._said.length, 1);
  assert.ok(Game._said[0].includes('waits'), 'line must read as waiting: ' + Game._said[0]);
  assert.ok(Game._said[0].includes('the beast'), 'line must name the beast: ' + Game._said[0]);
  Game.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game._said.length, 1, 'second hold narrated again');
  assert.strictEqual(store.narrated, 1);
  const store2 = newStore();
  const obj2 = huntObj('v1');
  const Game2 = stubGame({ objective: obj2, danger: { score: 3, verdict: 'ask' }, px: 0, py: 0 });
  installHunthold(Game2, store2);
  Game2.objMaybeDepart('v1', null, true, 4, 4);
  assert.strictEqual(Game2._said.length, 0, 'narrated while player away');
  assert.strictEqual(store2.narrated, 0);
});

// 11. objPick wrap clears the counter.
check('fresh objPick clears dangerHold', () => {
  const store = newStore();
  const obj = huntObj('v1'); obj.dangerHold = 4;
  const Game = stubGame({ objective: obj });
  installHunthold(Game, store);
  Game.objPick('v1', 4, 4);
  assert.strictEqual(obj.dangerHold, undefined);
});

// 12. Install is idempotent for the same store (sweep daily
// re-install must not re-wrap and flip the recorder order).
check('install idempotent for same store', () => {
  const store = newStore();
  const Game = stubGame({ objective: huntObj('v1') });
  const orig = Game.objMaybeDepart;
  installHunthold(Game, store);
  const wrapped = Game.objMaybeDepart;
  assert.notStrictEqual(wrapped, orig);
  installHunthold(Game, store);
  assert.strictEqual(Game.objMaybeDepart, wrapped);
});

// 13. Analyzer mapping: heldByLever. The recorder's hold
// record is action 'held-ready' with SUB 'other-held'
// (deriveMaybeAction) — 'other-held' is a sub, not an action.
check('heldByLever mapping: ask/tighten held, defer/go/empty not', () => {
  const mk = (action, sub, danger) => ({ action, sub, danger });
  assert.strictEqual(heldByLever(mk('held-ready', 'other-held', [{ verdict: 'ask', score: 3 }])), true);
  assert.strictEqual(heldByLever(mk('held-ready', 'other-held', [{ verdict: 'tighten', score: 5 }])), true);
  assert.strictEqual(heldByLever(mk('held-ready', 'other-held', [{ verdict: 'ask', score: 2 }, { verdict: 'ask', score: 2 }])), true, 'duplicated pre-check + engine records still held');
  assert.strictEqual(heldByLever(mk('held-ready', 'other-held', [{ verdict: 'defer', score: 7 }])), false);
  assert.strictEqual(heldByLever(mk('held-ready', 'other-held', [{ verdict: 'go', score: 1 }])), false);
  assert.strictEqual(heldByLever(mk('held-ready', 'other-held', [])), false);
  assert.strictEqual(heldByLever(mk('held-ready', 'no-attempt-early-return', [{ verdict: 'tighten', score: 4 }])), false);
  assert.strictEqual(heldByLever(mk('held-ready', 'heal-sat-out', [{ verdict: 'tighten', score: 4 }])), false);
  assert.strictEqual(heldByLever(mk('other-held', null, [{ verdict: 'ask', score: 3 }])), false, 'other-held as an ACTION is not a recorder record');
  assert.strictEqual(heldByLever(mk('departed', null, [{ verdict: 'go', score: 1 }])), false);
});

console.log(failures === 0 ? 'ALL HUNTHOLD FIXTURES PASS' : `${failures} FIXTURE(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
