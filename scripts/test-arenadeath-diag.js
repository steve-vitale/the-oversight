#!/usr/bin/env node
// scripts/test-arenadeath-diag.js — proof test for scripts/policies/arenadeath-diag.js
// (sim-arenadeath-a, 2026-10-24, axis scale-onramp).
//
// Covers: full fallen-list copying (multi-entry per vid, order preserved),
// classifier cases (scholar arena death -> UNRECORDED-DISTINCTION,
// villager contest death -> ARENA-MANDATORY, no-fallen camera death ->
// ARENA-MANDATORY, non-arena death -> NON-ARENA, dead-no-fallen-no-evidence
// -> UNCLASSIFIED, living -> LIVING, unobservable -> UNCLASSIFIED),
// the ethan_hunt chronology shapes (RESOLVED vs PERSISTS), ARENA-VOLUNTARY
// being structurally unemittable, and recorder purity on a mock Game
// (no game-state writes, no RNG draw, delegation byte-identical when
// ARENADEATH is unset, copy isolation, error counting on a broken Game).
'use strict';
const assert = require('assert');
const { layerOn, withArenadeathDiag, copyKillLog, copyFallenList, copyContestMemory, recordDaily, classifyArenaKiller, arenaSnapshot } = require('./policies/arenadeath-diag');

let passed = 0;
function ok(name, fn) { fn(); passed++; console.log('  PASS ' + name); }

const F = (vid, day, cause) => ({ villagerId: vid, day, cause, name: vid, monsterId: null, monsterName: null });
function killer(by, kills, firstDay) { return { by, kills, firstDay }; }
function evBase(over) {
  return Object.assign({
    status: { alive: false, deathDay: null, deathDayObservable: false, cause: null, source: 'test' },
    fallenAll: [], gossipDied: [], gossipAll: [], pullDays: [], showPullDays: [],
    lineageEntries: [], lastContestDied: false, scholarAtDeath: false,
  }, over || {});
}

// --- copyFallenList: full list, order preserved ---
ok('copyFallenList keeps EVERY entry per vid in order (the #949 fix)', () => {
  const G = { state: { village: { fallen: [F('ethan_hunt', 56, 'monster'), F('jorge_silva', 92, 'the arena'), F('ethan_hunt', 104, 'the arena')] } } };
  const c = copyFallenList(G);
  assert.strictEqual(c.errs, 0);
  assert.strictEqual(c.entries.length, 3);
  assert.deepStrictEqual(c.entries.filter(f => f.villagerId === 'ethan_hunt').map(f => f.day), [56, 104]);
  c.entries[0].cause = 'MUTATED';
  assert.strictEqual(G.state.village.fallen[0].cause, 'monster', 'copy isolation');
});
ok('copyFallenList on missing fallen -> empty, not an error', () => {
  const c = copyFallenList({ state: { village: {} } });
  assert.strictEqual(c.entries.length, 0);
  assert.strictEqual(c.errs, 0);
});

// --- classifier: scholar arena death ---
ok('scholar arena death -> UNRECORDED-DISTINCTION, never ARENA-VOLUNTARY (unrecorded split)', () => {
  const c = classifyArenaKiller(killer('nadia_khoury', 1, 116), evBase({
    status: { alive: false, deathDay: 116, deathDayObservable: true, cause: 'the arena', source: 'test' },
    fallenAll: [F('nadia_khoury', 116, 'the arena')],
    lineageEntries: [{ name: 'Nadia', villagerId: 'nadia_khoury', day: 116, cause: 'the arena' }],
    scholarAtDeath: true,
  }));
  assert.strictEqual(c.class, 'UNRECORDED-DISTINCTION');
  assert.strictEqual(c.daysToArenaDeath, 0);
  assert.strictEqual(c.arenaDeathDay, 116);
  assert.ok(c.reason.indexOf('unrecorded') >= 0);
});
ok('scholar arena death days-to-death: kill d65, arena death d92 -> 27', () => {
  const c = classifyArenaKiller(killer('jorge_silva', 1, 65), evBase({
    fallenAll: [F('jorge_silva', 92, 'the arena')],
    lineageEntries: [{ villagerId: 'jorge_silva', day: 92, cause: 'the arena' }],
    scholarAtDeath: true,
  }));
  assert.strictEqual(c.class, 'UNRECORDED-DISTINCTION');
  assert.strictEqual(c.daysToArenaDeath, 27);
});

// --- classifier: villager contest deaths ---
ok('villager contest-engine hurt death -> ARENA-MANDATORY (no choice screen for villagers)', () => {
  const c = classifyArenaKiller(killer('v1', 1, 40), evBase({
    fallenAll: [F('v1', 45, 'contest')],
  }));
  assert.strictEqual(c.class, 'ARENA-MANDATORY');
  assert.strictEqual(c.daysToArenaDeath, 5);
});
ok('villager camera death with NO fallen entry -> ARENA-MANDATORY via gossip (path b leaves no fallen)', () => {
  const c = classifyArenaKiller(killer('v1', 1, 40), evBase({
    fallenAll: [],
    gossipDied: [{ action: 'contest_died', who: 'v1', contest: 'The Pit', day: 44 }],
    gossipAll: [{ action: 'contest_died', who: 'v1', contest: 'The Pit', day: 44 }],
  }));
  assert.strictEqual(c.class, 'ARENA-MANDATORY');
  assert.ok(c.reason.indexOf('no fallen entry') >= 0);
});
ok('villager camera death via lastContest.died -> ARENA-MANDATORY', () => {
  const c = classifyArenaKiller(killer('v1', 1, 40), evBase({ fallenAll: [], lastContestDied: true }));
  assert.strictEqual(c.class, 'ARENA-MANDATORY');
});

// --- classifier: non-arena / unclassified / living ---
ok('monster death -> NON-ARENA with fallen evidence quoted', () => {
  const c = classifyArenaKiller(killer('v1', 1, 40), evBase({
    fallenAll: [F('v1', 56, 'monster')],
  }));
  assert.strictEqual(c.class, 'NON-ARENA');
  assert.ok(c.reason.indexOf('monster') >= 0);
});
ok('dead, no fallen, no contest evidence -> UNCLASSIFIED (do not guess)', () => {
  const c = classifyArenaKiller(killer('v1', 1, 40), evBase({ fallenAll: [] }));
  assert.strictEqual(c.class, 'UNCLASSIFIED');
  assert.ok(c.reason.indexOf('do not guess') >= 0);
});
ok('living killer -> LIVING, not a death class', () => {
  const c = classifyArenaKiller(killer('v1', 1, 93), evBase({
    status: { alive: true, deathDay: null, deathDayObservable: false, cause: null, source: 'person-alive' },
    fallenAll: [],
  }));
  assert.strictEqual(c.class, 'LIVING');
});
ok('unobservable killer -> UNCLASSIFIED, never silently dead', () => {
  const c = classifyArenaKiller(killer('v9', 1, 40), evBase({
    status: { alive: null, deathDay: null, deathDayObservable: false, cause: null, source: 'no-person-no-fallen' },
    fallenAll: [],
  }));
  assert.strictEqual(c.class, 'UNCLASSIFIED');
});
ok('scholar contest death (lineage + fallen contest) -> UNRECORDED-DISTINCTION, not ARENA-MANDATORY', () => {
  const c = classifyArenaKiller(killer('s1', 1, 40), evBase({
    fallenAll: [F('s1', 50, 'contest')],
    lineageEntries: [{ villagerId: 's1', day: 50, cause: 'contest' }],
    scholarAtDeath: true,
  }));
  assert.strictEqual(c.class, 'UNRECORDED-DISTINCTION');
});

// --- ethan_hunt chronology shapes (#949) ---
ok('ethan RESOLVED shape: fallen d56 monster + d104 arena, kill d103 -> later entry exists', () => {
  const c = classifyArenaKiller(killer('ethan_hunt', 1, 103), evBase({
    fallenAll: [F('ethan_hunt', 56, 'monster'), F('ethan_hunt', 104, 'the arena')],
    lineageEntries: [{ villagerId: 'ethan_hunt', day: 104, cause: 'the arena' }],
    scholarAtDeath: true,
  }));
  assert.strictEqual(c.chronology, 'RESOLVED-first-wins-hid-later-entry');
  assert.strictEqual(c.class, 'UNRECORDED-DISTINCTION');
  assert.strictEqual(c.daysToArenaDeath, 1);
});
ok('ethan PERSISTS shape: only fallen d56 monster, kill d103 -> no later entry', () => {
  const c = classifyArenaKiller(killer('ethan_hunt', 1, 103), evBase({
    fallenAll: [F('ethan_hunt', 56, 'monster')],
  }));
  assert.strictEqual(c.chronology, 'PERSISTS-no-later-entry');
  assert.strictEqual(c.class, 'NON-ARENA');
});

// --- arenaSnapshot on a mock Game ---
function mockGame() {
  return {
    state: {
      scholar: { day: 120, villagerId: 's1' },
      waveKillLog: [
        { d: 65, mid: 'terms_of_service', w: 3, by: 'jorge_silva', via: 'companion', trick: null },
        { d: 103, mid: 'ad_break', w: 3, by: 'ethan_hunt', via: 'player', trick: null },
      ],
      village: {
        fallen: [F('ethan_hunt', 56, 'monster'), F('jorge_silva', 92, 'the arena')],
        _contestPullDays: { jorge_silva: [90], ethan_hunt: [100] },
        _showPullDays: {},
        lastContest: { day: 92, name: 'The Pit', ids: ['jorge_silva'], died: ['jorge_silva'] },
        gossip: [{ action: 'contest_died', dims: { who: 'jorge_silva', contest: 'The Pit' }, day: 92, partKey: 'x' }],
      },
      contestDeathsById: { pit: 1 },
    },
    villagerId: 's1',
    waveUnlockReady: (w) => ({ wave: w, ready: false, veterans: 0 }),
    getPerson: (v) => (v === 'jorge_silva' || v === 'ethan_hunt' ? { dead: true } : null),
    vpOf: () => null,
    progState: () => ({ deathReel: [{ name: 'Jorge', day: 92, challenge: 'pit' }] }),
    lineage: () => [{ name: 'Jorge', villagerId: 'jorge_silva', day: 92, cause: 'the arena' }],
  };
}
ok('arenaSnapshot: full fallen lists + rates + per-killer classes on mock Game', () => {
  const s = arenaSnapshot(mockGame(), []);
  assert.strictEqual(s.fallen.length, 2);
  assert.strictEqual(s.fallenByVidFull.ethan_hunt.length, 1);
  const jorge = s.killers.find(k => k.by === 'jorge_silva');
  const ethan = s.killers.find(k => k.by === 'ethan_hunt');
  assert.strictEqual(jorge.class, 'UNRECORDED-DISTINCTION');
  assert.strictEqual(jorge.daysToArenaDeath, 27);
  assert.deepStrictEqual(jorge.pullDays, [90]);
  assert.strictEqual(ethan.class, 'NON-ARENA');
  assert.strictEqual(ethan.chronology, 'PERSISTS-no-later-entry');
  assert.strictEqual(s.rates.killersTotal, 2);
  assert.strictEqual(s.rates.killersDead, 2);
  assert.strictEqual(s.rates.killersArenaDead, 1);
  assert.strictEqual(s.rates.fallenDistinctVids, 2);
  assert.strictEqual(s.rates.fallenArenaDistinct, 1);
  assert.strictEqual(s.rates.fallenArenaOrContestDistinct, 1);
});
ok('arenaSnapshot: fallen cause counts by entry, not by vid', () => {
  const s = arenaSnapshot(mockGame(), []);
  assert.deepStrictEqual(s.rates.fallenCauseCounts, { monster: 1, 'the arena': 1 });
});

// --- recorder purity on a mock Game ---
function mockInner() {
  return {
    id: 'mock-inner', desc: 'mock',
    daily(G, ctx) { ctx.innerRan = (ctx.innerRan || 0) + 1; return 'inner-result'; },
  };
}
ok('purity: ARENADEATH=1 records without writing game state or drawing RNG', () => {
  process.env.ARENADEATH = '1';
  const G = mockGame();
  const before = JSON.stringify(G.state);
  const realRandom = Math.random;
  let draws = 0;
  Math.random = () => { draws++; return realRandom(); };
  try {
    const wrapped = withArenadeathDiag(mockInner(), 'arenadeath-diag', 'test');
    const ctx = {};
    const r = wrapped.daily(G, ctx);
    assert.strictEqual(r, 'inner-result');
    assert.strictEqual(ctx.innerRan, 1);
    assert.ok(ctx._arenadeathdiag, 'diag surface present when on');
    assert.strictEqual(ctx._arenadeathdiag.days, 1);
    assert.strictEqual(ctx._arenadeathdiag.traj[0].logLen, 2);
    assert.strictEqual(ctx._arenadeathdiag.traj[0].scholarVid, 's1');
    assert.deepStrictEqual(ctx._arenadeathdiag.traj[0].lastContest.ids, ['jorge_silva']);
    assert.strictEqual(JSON.stringify(G.state), before, 'game state must be byte-identical');
    assert.strictEqual(draws, 0, 'recorder must draw no RNG');
  } finally { Math.random = realRandom; delete process.env.ARENADEATH; }
});
ok('delegation: ARENADEATH unset -> wrapped == unwrapped, no diag surface', () => {
  delete process.env.ARENADEATH;
  assert.strictEqual(layerOn(), false);
  const G = mockGame();
  const wrapped = withArenadeathDiag(mockInner(), 'arenadeath-diag', 'test');
  const ctx = {};
  const r = wrapped.daily(G, ctx);
  assert.strictEqual(r, 'inner-result');
  assert.strictEqual(ctx._arenadeathdiag, undefined);
});
ok('copyContestMemory: gossip contest_* filtered, other gossip excluded', () => {
  const G = { state: { village: { gossip: [
    { action: 'contest_died', dims: { who: 'v1', contest: 'Pit' }, day: 10 },
    { action: 'death', dims: { who: 'v2' }, day: 11 },
    { action: 'contest_won', dims: { who: 'v3', contest: 'Moot' }, day: 12 },
  ] } } };
  const m = copyContestMemory(G);
  assert.strictEqual(m.gossipContest.length, 2);
  assert.strictEqual(m.errs, 0);
});
ok('error counting: broken Game (no state) counts errors, never throws silently', () => {
  process.env.ARENADEATH = '1';
  try {
    const G = {};
    const ctx = {};
    recordDaily(G, ctx);
    assert.ok(ctx._arenadeathdiag.errs > 0, 'errs must be > 0 on a broken Game');
  } finally { delete process.env.ARENADEATH; }
});
ok('copyKillLog: non-array log counts an error', () => {
  const c = copyKillLog({ state: { waveKillLog: 'not-an-array' } });
  assert.ok(c.errs > 0);
  assert.strictEqual(c.entries.length, 0);
});

console.log(`\nARENADEATH-DIAG PROOF: ${passed} checks passed`);
