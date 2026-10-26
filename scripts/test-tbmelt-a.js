#!/usr/bin/env node
// scripts/test-tbmelt-a.js — unit + fake-Game integration proof for the
// tbmelt recorder + analyzer (sim-tbmelt-a). No engine, no RNG, no
// real sim: a fake Game that mimics the startCombat lift / tbEnd
// restore rules read from game.js, so the recorder's join and fate
// logic are proven before any sweep judges against them.
'use strict';
const assert = require('assert');
const { newStore, installTbmeltDiag, withTbmeltDiag, layerOn } = require('./policies/tbmelt-diag');
const { analyzeTbmelt } = require('./test-tbmelt-diag');
const { classifyStart } = require('./policies/nonworldkill-diag');

let PASS = 0;
function check(name, fn) {
  try { fn(); PASS++; console.log('  ok - ' + name); }
  catch (e) { console.error('  FAIL - ' + name + ': ' + (e && e.stack || e)); process.exitCode = 1; }
}

const DEFS = [
  { id: 'murkcap', wave: 1 }, { id: 'anaconda_empress', wave: 1 },
  { id: 'living_wire', wave: 1 }, { id: 'spool', wave: 3 },
  { id: 'white_noise_heron', wave: 1 }, { id: 'strike', wave: 4 },
];

// Fake Game mimicking the engine rules under test:
//  - startCombat(arg): fighter from arg; lift the tile monster
//    (remove from world list); worldOrigin set iff titan/lingering.
//    If opts.routed, tbEnd is called INSIDE startCombat (adopted).
//  - tbEnd(result): restore worldOrigin iff result !== 'won' and
//    (titan, or lingerer on fled/lost); then tbfight = null.
function fakeGame(world, opts) {
  opts = opts || {};
  const G = {
    state: { scholar: { day: opts.day || 9 } },
    map: { px: 4, py: 4 },
    data: { monsters: DEFS },
    _world: world,
    tbfight: null,
    _fightSeq: 0,
    worldMonsters() { return this._world; },
    startCombat(arg, options) {
      const tile = this._world.find(m => m.tx === 4 && m.ty === 4) || null;
      const fid = 'f' + (++this._fightSeq);
      const fighters = [{ key: 'p', kind: 'player', hp: 100, maxHp: 100, alive: true, fled: false },
        { key: 'm_0', kind: 'monster', monsterId: arg, mdef: { id: arg }, hp: 100, maxHp: 100, alive: true, fled: false }];
      if (tile) {
        const i = this._world.indexOf(tile);
        if (i >= 0) this._world.splice(i, 1);
      }
      this.tbfight = { id: fid, fighters: fighters, over: false,
        worldOrigin: (tile && (tile.titan || tile.lingering)) ? tile : null };
      if (options && options.routed) this.tbEnd(options.routed);
      return this.tbfight;
    },
    tbEnd(result) {
      const f = this.tbfight;
      if (!f) return result;
      const o = f.worldOrigin;
      if (o && result !== 'won') {
        const isLing = !!(o.lingering && !o.titan);
        const keeps = !isLing || result === 'fled' || result === 'lost';
        if (keeps && this._world.indexOf(o) < 0) {
          const mine = f.fighters.filter(x => x.kind === 'monster' && (x.monsterId === o.id));
          const standing = mine.filter(x => x.alive);
          if (!mine.length || standing.length) this._world.push(o);
        }
      }
      f.over = true; f.result = result;
      this.tbfight = null;
      return result;
    },
  };
  return G;
}

function install(G, store) {
  process.env.TBMELT = '1';
  return installTbmeltDiag(G, store);
}

check('mismatch non-lingering bystander melts on a won fight', () => {
  const world = [{ id: 'murkcap', tx: 4, ty: 4, hp: 42, maxHp: 60 }];
  const G = fakeGame(world); const st = newStore(); install(G, st);
  G.startCombat('spool'); G.tbEnd('won');
  assert.strictEqual(st.errs, 0);
  assert.strictEqual(st.lifts.length, 1);
  assert.strictEqual(st.lifts[0].origin, 'world-origin-mismatch');
  assert.strictEqual(st.lifts[0].lifted, true);
  assert.strictEqual(st.ends.length, 1);
  assert.strictEqual(st.ends[0].restored, false);
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.meltsTotal, 1);
  assert.strictEqual(an.meltRows[0].tileId, 'murkcap');
});

check('mismatch lingering bystander restores on fled', () => {
  const world = [{ id: 'white_noise_heron', tx: 4, ty: 4, hp: 50, maxHp: 60, lingering: true }];
  const G = fakeGame(world); const st = newStore(); install(G, st);
  G.startCombat('spool'); G.tbEnd('fled');
  assert.strictEqual(st.ends[0].restored, true);
  assert.strictEqual(st.ends[0].restoredVia, 'identity');
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.meltsTotal, 0);
  assert.strictEqual(an.byFate.restored, 1);
  assert.strictEqual(world.length, 1);
});

check('mismatch titan bystander melts on won, restores on lost', () => {
  const w1 = [{ id: 'strike', tx: 4, ty: 4, hp: 100, maxHp: 1200, titan: true }];
  const G1 = fakeGame(w1); const s1 = newStore(); install(G1, s1);
  G1.startCombat('spool'); G1.tbEnd('won');
  assert.strictEqual(s1.ends[0].restored, false);
  const w2 = [{ id: 'strike', tx: 4, ty: 4, hp: 100, maxHp: 1200, titan: true }];
  const G2 = fakeGame(w2); const s2 = newStore(); install(G2, s2);
  G2.startCombat('spool'); G2.tbEnd('lost');
  assert.strictEqual(s2.ends[0].restored, true);
});

check('world-origin killed fighter is a kill, not a melt', () => {
  const world = [{ id: 'spool', tx: 4, ty: 4, hp: 280, maxHp: 280 }];
  const G = fakeGame(world); const st = newStore(); install(G, st);
  G.startCombat('spool');
  G.tbfight.fighters.find(x => x.kind === 'monster').alive = false;
  G.tbEnd('won');
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.meltsTotal, 0);
  assert.strictEqual(an.killed.length, 1);
});

check('world-origin surviving fighter on fled melts as fought-melt, not bystander melt', () => {
  const world = [{ id: 'spool', tx: 4, ty: 4, hp: 280, maxHp: 280 }];
  const G = fakeGame(world); const st = newStore(); install(G, st);
  G.startCombat('spool'); G.tbEnd('fled');
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.meltsTotal, 0);
  assert.strictEqual(an.foughtMelts.length, 1);
});

check('refused call lifts nothing and is counted separately', () => {
  const world = [{ id: 'murkcap', tx: 4, ty: 4, hp: 42, maxHp: 60 }];
  const G = fakeGame(world); const st = newStore(); install(G, st);
  G.startCombat('spool');
  // Second call while a fight is live: the fake still runs, but the
  // recorder marks it refused (liveFight at pre-record).
  G.startCombat('living_wire');
  const refused = st.lifts.filter(l => l.refused);
  assert.strictEqual(refused.length, 1);
  assert.strictEqual(refused[0].lifted, false);
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.lifted, 1);
  G.tbEnd('won');
});

check('same-call routed fight adopts its end row and fate', () => {
  const world = [{ id: 'murkcap', tx: 4, ty: 4, hp: 42, maxHp: 60 }];
  const G = fakeGame(world); const st = newStore(); install(G, st);
  G.startCombat('spool', { routed: 'routed' });
  assert.strictEqual(st.ends.length, 1);
  assert.strictEqual(st.lifts.length, 1);
  assert.strictEqual(st.lifts[0].fightId, st.ends[0].fightId);
  assert.strictEqual(st.ends[0].liftId, st.lifts[0].liftId);
  assert.strictEqual(st.ends[0].restored, false);
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.meltsTotal, 1);
  assert.strictEqual(an.unaccounted.length, 0);
});

check('null-origin fight end is NOT direct-build (it has a start row, it lifts nothing)', () => {
  const G = fakeGame([]); const st = newStore(); install(G, st);
  G.startCombat('spool'); G.tbEnd('won');
  assert.strictEqual(st.lifts.length, 1);
  assert.strictEqual(st.lifts[0].lifted, false);
  assert.strictEqual(st.lifts[0].origin, 'null-origin');
  assert.strictEqual(st.ends.length, 1);
  assert.strictEqual(st.ends[0].directBuild, false);
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.directBuildEnds, 0);
  assert.strictEqual(an.meltsTotal, 0);
});

check('two sequential null-origin fights both end non-direct-build (no null liftId poisoning)', () => {
  const G = fakeGame([]); const st = newStore(); install(G, st);
  G.startCombat('spool'); G.tbEnd('won');
  G.startCombat('strike'); G.tbEnd('won');
  assert.strictEqual(st.ends.length, 2);
  assert.strictEqual(st.ends[0].directBuild, false);
  assert.strictEqual(st.ends[1].directBuild, false);
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.directBuildEnds, 0);
});

check('direct-build tbEnd is counted separately, never a melt', () => {
  const G = fakeGame([]); const st = newStore(); install(G, st);
  G.tbEnd('lost');
  assert.strictEqual(st.ends.length, 1);
  assert.strictEqual(st.ends[0].directBuild, true);
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.directBuildEnds, 1);
  assert.strictEqual(an.meltsTotal, 0);
});

check('engine throw is recorded and rethrown unchanged, no lift', () => {
  const G = fakeGame([]);
  G.startCombat = function () { throw new Error('boom-test'); };
  const st = newStore(); install(G, st);
  let caught = null;
  try { G.startCombat('spool'); } catch (e) { caught = e; }
  assert.ok(caught && caught.message === 'boom-test');
  assert.strictEqual(st.lifts[0].threw, 'boom-test');
  assert.strictEqual(st.lifts[0].lifted, false);
});

check('recorder OFF delegates byte-identically (no wraps, no surface)', () => {
  delete process.env.TBMELT;
  assert.strictEqual(layerOn(), false);
  const G = fakeGame([]);
  const origStart = G.startCombat, origEnd = G.tbEnd;
  const wrapped = withTbmeltDiag({ id: 'x', desc: 'x', daily() {} }, 'tbmelt-diag', 'test', newStore());
  wrapped.daily(G, {});
  assert.strictEqual(G.startCombat, origStart);
  assert.strictEqual(G.tbEnd, origEnd);
  assert.strictEqual(G._tbmeltDiagInstalled, undefined);
  process.env.TBMELT = '1';
});

check('classifier gives the nonworldkill doors on tbmelt-shaped rows', () => {
  const wanderer = { stack: 'driveContestsImpl,triggerEncounter', arenaContest: null, activeContestArena: false, feastDraw: null, tentBreach: false, pendingInTent: false, tableTrial: false, refused: false, threw: null, mid: 'spool', stackLines: [] };
  assert.strictEqual(classifyStart(wanderer).door, 'wanderer-pending');
  const arena = Object.assign({}, wanderer, { stack: '_contestArena,startCombat', arenaContest: { contestId: 'c1', waves: [], waveIdx: 0 } });
  assert.strictEqual(classifyStart(arena).door, 'contest-arena');
  const bump = Object.assign({}, wanderer, { stack: 'monsterTurn,startCombat' });
  assert.strictEqual(classifyStart(bump).door, 'world-bump');
  const feast = Object.assign({}, wanderer, { stack: 'faceFeastDraw,startCombat', feastDraw: { monsterId: 'spool' } });
  assert.strictEqual(classifyStart(feast).door, 'feast-draw');
});

check('analyzer: melt rate, wave breakdown, by-door on a synthetic corpus', () => {
  function lift(day, tileId, tileWave, mid, doorStack, endRestored, result) {
    const l = { liftId: 100 + day, day: day, arg: mid, mid: mid, wave: 1, origin: 'world-origin-mismatch',
      lifted: true, refused: false, threw: null, tableTrial: false, fightId: 'fx' + day,
      tileMonster: { id: tileId, wave: tileWave, titan: false, lingering: false, veteran: false, hp: 10, maxHp: 10 },
      stack: doorStack, stackLines: [], feastDraw: null, tentBreach: false, pendingInTent: false,
      arenaContest: null, activeContestArena: false, fighters: [] };
    const e = { day: day, fightId: 'fx' + day, result: result, liftId: 100 + day, directBuild: false, restored: endRestored, restoredVia: endRestored ? 'identity' : null, liftedFighter: null };
    return [l, e];
  }
  const pairs = [
    lift(9, 'murkcap', 1, 'spool', 'driveContestsImpl,x', false, 'won'),
    lift(63, 'spool', 3, 'living_wire', 'driveContestsImpl,x', false, 'won'),
    lift(10, 'white_noise_heron', 1, 'spool', '_contestArena,x', true, 'fled'),
  ];
  // Fix the arena row's door: it needs arenaContest set, not just stack.
  pairs[2][0].arenaContest = { contestId: 'c', waves: [], waveIdx: 0 };
  const st = { lifts: pairs.map(p => p[0]), ends: pairs.map(p => p[1]), errs: 0, errors: [], overflow: {} };
  const nwk = { starts: pairs.map(p => p[0]).map(l => Object.assign({}, l, { tableTrial: false })),
    ends: pairs.map(p => p[1]) };
  const an = analyzeTbmelt(st, nwk);
  assert.strictEqual(an.meltsTotal, 2);
  assert.deepStrictEqual(an.meltsByWave, { w1: 1, w3: 1 });
  assert.deepStrictEqual(an.meltsByDoor, { 'wanderer-pending': 2 });
  assert.strictEqual(an.meltRows.filter(r => r.tileWave === 3).length, 1);
  assert.strictEqual(an.restored.length, 1);
  assert.strictEqual(an.unaccounted.length, 0);
  assert.strictEqual(an.cross.agree, true);
});

check('analyzer: adopted-resolved extra mismatch is explained, not a cross failure', () => {
  const l = { liftId: 7, day: 114, arg: 'moderator', mid: 'moderator', wave: 2, origin: 'world-origin-mismatch',
    lifted: true, refused: false, threw: null, tableTrial: false, fightId: 'fx114', fightIdSource: 'end-row+argmid',
    tileMonster: { id: 'bright_idea', wave: 2, titan: false, lingering: true, veteran: false, hp: 1, maxHp: 55 },
    stack: '_contestArena,x', stackLines: [], feastDraw: null, tentBreach: false, pendingInTent: false,
    arenaContest: { contestId: 'siege', waves: ['moderator'], waveIdx: 0 }, activeContestArena: false, fighters: [],
    endVerdict: { restored: false, restoredVia: null, result: 'routed' } };
  const e = { day: 114, fightId: 'fx114', result: 'routed', liftId: 7, directBuild: false, restored: false, restoredVia: null, liftedFighter: null };
  const st = { lifts: [l], ends: [e], errs: 0, errors: [], overflow: {} };
  const nwkStart = { day: 114, arg: 'moderator', mid: null, origin: 'world-origin-unresolved',
    tileMonster: { id: 'bright_idea' }, fightId: 'fx114', fightIdSource: 'end-row',
    tableTrial: false, refused: false, threw: null, arenaContest: { contestId: 'siege' }, stack: '_contestArena,x', stackLines: [] };
  const nwk = { starts: [nwkStart], ends: [e] };
  const an = analyzeTbmelt(st, nwk);
  assert.strictEqual(an.meltsTotal, 1);
  assert.strictEqual(an.meltRows[0].tileId, 'bright_idea');
  assert.strictEqual(an.cross.agree, true);
  assert.strictEqual(an.cross.extraExplained.length, 1);
  assert.strictEqual(an.cross.extraExplained[0].adopted, true);
  assert.strictEqual(an.cross.extraExplained[0].nwkUnresolved, true);
});

check('analyzer: unaccounted lift (no end) is reported, never silently melted', () => {
  const l = { liftId: 1, day: 5, arg: 'spool', mid: 'spool', wave: 3, origin: 'world-origin-mismatch',
    lifted: true, refused: false, threw: null, tableTrial: false, fightId: 'dangling',
    tileMonster: { id: 'murkcap', wave: 1, titan: false, lingering: false, veteran: false, hp: 10, maxHp: 10 },
    stack: 'driveContestsImpl,x', stackLines: [], feastDraw: null, tentBreach: false, pendingInTent: false,
    arenaContest: null, activeContestArena: false, fighters: [], endVerdict: null };
  const st = { lifts: [l], ends: [], errs: 0, errors: [], overflow: {} };
  const an = analyzeTbmelt(st, null);
  assert.strictEqual(an.unaccounted.length, 1);
  assert.strictEqual(an.meltsTotal, 0);
});

console.log(`\ntest-tbmelt-a: ${PASS} checks passed`);
