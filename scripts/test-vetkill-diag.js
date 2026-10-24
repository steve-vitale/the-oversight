#!/usr/bin/env node
// scripts/test-vetkill-diag.js — proof test for scripts/policies/vetkill-diag.js
// (sim-vetkill-a, 2026-10-24, axis scale-onramp).
//
// Covers: log classification on synthetic logs (dead-killer, living-killer,
// empty-log, intraday-fleeting, mixed, wave-filter, unobservable-killer),
// recorder purity on a mock Game (no game-state writes, no RNG draw,
// delegation byte-identical when VETKILL is unset, copy isolation,
// error counting on a broken Game).
'use strict';
const assert = require('assert');
const { layerOn, withVetkillDiag, copyKillLog, snapVeterans, recordDaily, classifyKillLog, resolveKillerStatus } = require('./policies/vetkill-diag');

let passed = 0;
function ok(name, fn) { fn(); passed++; console.log('  PASS ' + name); }

// statusOf builders for synthetic tests.
const alive = (deathDay) => () => ({ alive: true, deathDay: null, deathDayObservable: false, cause: null, source: 'test-alive' });
const dead = (day, cause) => () => ({ alive: false, deathDay: day != null ? day : null, deathDayObservable: day != null, cause: cause || null, source: 'test-dead' });
const unknown = () => ({ alive: null, deathDay: null, deathDayObservable: false, cause: null, source: 'test-unknown' });
function statusMap(map) { return (vid) => (Object.prototype.hasOwnProperty.call(map, vid) ? map[vid]() : unknown()); }
const E = (d, mid, w, by, via) => ({ d, mid, w, by, via: via || 'patrol', trick: null });

// --- classification ---
ok('empty log -> NEVER-KILLED (w3 and w4)', () => {
  const c = classifyKillLog([], statusMap({}));
  assert.strictEqual(c.verdict, 'NEVER-KILLED');
  assert.strictEqual(c.verdictW4, 'NEVER-KILLED');
  assert.strictEqual(c.w3plusKills, 0);
});
ok('wave-2 kills only -> NEVER-KILLED (wave filter)', () => {
  const c = classifyKillLog([E(10, 'deer', 2, 'v1'), E(12, 'deer', 1, 'v1')], statusMap({ v1: alive() }));
  assert.strictEqual(c.verdict, 'NEVER-KILLED');
  assert.strictEqual(c.w3plusKills, 0);
  assert.strictEqual(c.totalEntries, 2);
});
ok('living wave-3 killer -> KILLED-LIVING-KILLER, first day + counts', () => {
  const c = classifyKillLog([E(40, 'm3', 3, 'v1'), E(50, 'm3b', 3, 'v1')], statusMap({ v1: alive() }));
  assert.strictEqual(c.verdict, 'KILLED-LIVING-KILLER');
  assert.strictEqual(c.w3plusKills, 2);
  assert.strictEqual(c.firstW3Day, 40);
  assert.deepStrictEqual(c.livingKillersW3, ['v1']);
  assert.strictEqual(c.killersW3[0].alive, true);
});
ok('dead wave-3 killer with fallen day -> KILLED-DEAD-KILLER + death day', () => {
  const c = classifyKillLog([E(40, 'm3', 3, 'v1')], statusMap({ v1: dead(41, 'combat') }));
  assert.strictEqual(c.verdict, 'KILLED-DEAD-KILLER');
  assert.strictEqual(c.killersW3[0].deathDay, 41);
  assert.strictEqual(c.killersW3[0].deathDayObservable, true);
  assert.strictEqual(c.killersW3[0].cause, 'combat');
});
ok('intraday-fleeting: kill day 40, killer dead (same-day death) -> KILLED-DEAD-KILLER, log proves the kill', () => {
  // This is the 73676 shape: daily veteran samples may show 0 all run,
  // but the append-only log entry survives the killer's death.
  const c = classifyKillLog([E(40, 'm3', 3, 'v1')], statusMap({ v1: dead(40, 'combat') }));
  assert.strictEqual(c.verdict, 'KILLED-DEAD-KILLER');
  assert.strictEqual(c.killersW3[0].firstDay, 40);
  assert.strictEqual(c.killersW3[0].deathDay, 40);
});
ok('mixed living + dead killers -> KILLED-LIVING-KILLER (living proof wins)', () => {
  const c = classifyKillLog([E(40, 'm3', 3, 'v1'), E(60, 'm3', 3, 'v2')], statusMap({ v1: dead(45, 'combat'), v2: alive() }));
  assert.strictEqual(c.verdict, 'KILLED-LIVING-KILLER');
  assert.deepStrictEqual(c.livingKillersW3, ['v2']);
});
ok('dead + unobservable killer, no living -> UNCLASSIFIED with reason naming the vid', () => {
  const c = classifyKillLog([E(40, 'm3', 3, 'v1'), E(60, 'm3', 3, 'v9')], statusMap({ v1: dead(45, 'combat') }));
  assert.strictEqual(c.verdict, 'UNCLASSIFIED');
  assert.ok(c.reason.indexOf('v9') >= 0, 'reason must name v9: ' + c.reason);
  assert.deepStrictEqual(c.unknownKillersW3, ['v9']);
});
ok('wave-4 subset classified independently of wave-3', () => {
  const c = classifyKillLog([E(40, 'm3', 3, 'v1')], statusMap({ v1: alive() }));
  assert.strictEqual(c.verdict, 'KILLED-LIVING-KILLER');
  assert.strictEqual(c.verdictW4, 'NEVER-KILLED');
  assert.strictEqual(c.w4plusKills, 0);
});
ok('wave-4 dead killer -> KILLED-DEAD-KILLER on w4, living w3 killer does not leak across', () => {
  const c = classifyKillLog([E(40, 'm3', 3, 'v1'), E(80, 'm4', 4, 'v2')], statusMap({ v1: alive(), v2: dead(81, 'combat') }));
  assert.strictEqual(c.verdict, 'KILLED-LIVING-KILLER');
  assert.strictEqual(c.verdictW4, 'KILLED-DEAD-KILLER');
  assert.strictEqual(c.firstW4Day, 80);
});
ok('null killer by -> UNCLASSIFIED, never silently dead', () => {
  const c = classifyKillLog([E(40, 'm3', 3, null)], statusMap({}));
  assert.strictEqual(c.verdict, 'UNCLASSIFIED');
});
ok('statusOf throwing -> UNCLASSIFIED, never a guessed death', () => {
  const c = classifyKillLog([E(40, 'm3', 3, 'v1')], () => { throw new Error('boom'); });
  assert.strictEqual(c.verdict, 'UNCLASSIFIED');
});

// --- resolveKillerStatus on mock Games ---
ok('resolveKillerStatus: current scholar -> living', () => {
  const G = { villagerId: 's1', getPerson: () => null, vpOf: () => null };
  const s = resolveKillerStatus(G, 's1', {});
  assert.strictEqual(s.alive, true);
  assert.strictEqual(s.source, 'current-scholar');
});
ok('resolveKillerStatus: dead person + fallen -> death day observed', () => {
  const G = { villagerId: 's1', getPerson: (v) => (v === 'v1' ? { dead: true } : null), vpOf: () => null };
  const s = resolveKillerStatus(G, 'v1', { v1: { villagerId: 'v1', day: 77, cause: 'combat' } });
  assert.strictEqual(s.alive, false);
  assert.strictEqual(s.deathDay, 77);
  assert.strictEqual(s.deathDayObservable, true);
  assert.strictEqual(s.cause, 'combat');
});
ok('resolveKillerStatus: dead person, no fallen -> death day UNOBSERVED (null, never inferred)', () => {
  const G = { villagerId: 's1', getPerson: (v) => (v === 'v1' ? { dead: true } : null), vpOf: () => null };
  const s = resolveKillerStatus(G, 'v1', {});
  assert.strictEqual(s.alive, false);
  assert.strictEqual(s.deathDay, null);
  assert.strictEqual(s.deathDayObservable, false);
});
ok('resolveKillerStatus: no person, no fallen -> unobservable (alive null)', () => {
  const G = { villagerId: 's1', getPerson: () => null, vpOf: () => null };
  const s = resolveKillerStatus(G, 'v9', {});
  assert.strictEqual(s.alive, null);
});

// --- recorder purity on a mock Game ---
function mockGame() {
  return {
    state: {
      scholar: { day: 41 },
      waveKillLog: [{ d: 40, mid: 'm3', w: 3, by: 'v1', via: 'patrol', trick: null }],
      village: { fallen: [] },
    },
    villagerId: 's1',
    waveUnlockReady: (w) => ({ wave: w, ready: false, armored: 0, armed: 0, tricks: 0, veterans: w === 4 ? 0 : 0, demand: null, short: ['veterans'] }),
    getPerson: () => null,
    vpOf: () => null,
  };
}
function mockInner() {
  return {
    id: 'mock-inner', desc: 'mock',
    daily(G, ctx) { ctx.innerRan = (ctx.innerRan || 0) + 1; return 'inner-result'; },
  };
}
ok('purity: VETKILL=1 records without writing game state or drawing RNG', () => {
  process.env.VETKILL = '1';
  const G = mockGame();
  const before = JSON.stringify(G.state);
  const realRandom = Math.random;
  let draws = 0;
  Math.random = () => { draws++; return realRandom(); };
  try {
    const wrapped = withVetkillDiag(mockInner(), 'vetkill-diag', 'test');
    const ctx = {};
    const r = wrapped.daily(G, ctx);
    assert.strictEqual(r, 'inner-result');
    assert.strictEqual(ctx.innerRan, 1);
    assert.ok(ctx._vetkilldiag, 'diag surface present when on');
    assert.strictEqual(ctx._vetkilldiag.days, 1);
    assert.strictEqual(ctx._vetkilldiag.traj[0].logLen, 1);
    assert.strictEqual(ctx._vetkilldiag.traj[0].newEntries.length, 1);
    assert.strictEqual(ctx._vetkilldiag.traj[0].rd4vets, 0);
    assert.strictEqual(JSON.stringify(G.state), before, 'game state must be byte-identical');
    assert.strictEqual(draws, 0, 'recorder must draw no RNG');
  } finally { Math.random = realRandom; delete process.env.VETKILL; }
});
ok('purity: copy isolation — mutating a snapshot cannot rewrite the live log', () => {
  const G = mockGame();
  const { copyKillLog: ckl } = require('./policies/vetkill-diag');
  const snap = ckl(G);
  snap.entries[0].mid = 'MUTATED';
  snap.entries.push({ d: 99, mid: 'fake', w: 9, by: 'x', via: 'x', trick: null });
  assert.strictEqual(G.state.waveKillLog.length, 1);
  assert.strictEqual(G.state.waveKillLog[0].mid, 'm3');
});
ok('delegation: VETKILL unset -> wrapped == unwrapped, no diag surface', () => {
  delete process.env.VETKILL;
  assert.strictEqual(layerOn(), false);
  const G = mockGame();
  const wrapped = withVetkillDiag(mockInner(), 'vetkill-diag', 'test');
  const ctx = {};
  const r = wrapped.daily(G, ctx);
  assert.strictEqual(r, 'inner-result');
  assert.strictEqual(ctx._vetkilldiag, undefined);
});
ok('daily deltas: second day with a new kill records only the new entry', () => {
  process.env.VETKILL = '1';
  try {
    const G = mockGame();
    const ctx = {};
    recordDaily(G, ctx);
    G.state.scholar.day = 42;
    G.state.waveKillLog.push({ d: 42, mid: 'm3b', w: 3, by: 'v2', via: 'wild', trick: null });
    recordDaily(G, ctx);
    assert.strictEqual(ctx._vetkilldiag.days, 2);
    assert.strictEqual(ctx._vetkilldiag.traj[1].newEntries.length, 1);
    assert.strictEqual(ctx._vetkilldiag.traj[1].newEntries[0].mid, 'm3b');
    assert.strictEqual(ctx._vetkilldiag.errs, 0);
  } finally { delete process.env.VETKILL; }
});
ok('error counting: broken Game (no state) counts errors, never throws silently', () => {
  process.env.VETKILL = '1';
  try {
    const G = {};
    const ctx = {};
    recordDaily(G, ctx);
    assert.ok(ctx._vetkilldiag.errs > 0, 'errs must be > 0 on a broken Game');
    assert.ok(ctx._vetkilldiag.traj[0].errs > 0);
  } finally { delete process.env.VETKILL; }
});
ok('snapVeterans: missing waveUnlockReady counts an error, returns nulls', () => {
  const v = snapVeterans({});
  assert.strictEqual(v.rd4vets, null);
  assert.ok(v.errs > 0);
});

console.log(`\nVETKILL-DIAG PROOF: ${passed} checks passed`);
