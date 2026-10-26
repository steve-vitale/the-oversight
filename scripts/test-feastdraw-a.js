#!/usr/bin/env node
// scripts/test-feastdraw-a.js — proof tests for the feast-draw yield
// recorder (sim-feastdraw-a, DIAG ONLY). Unit tests over synthetic
// stores + fake-Game integration tests for every wrap. No src/js
// changes, no real game load: the fake Game mimics the feastBuff
// engine contract (fresh draws once, refresh never draws, face
// deletes the draw AFTER startCombat, drive-off clears pending,
// clear kills the draw with the buff) closely enough to prove the
// recorder's join logic, never the engine itself.
//
// Run: node scripts/test-feastdraw-a.js  (exit 1 on any failure)
'use strict';
const assert = require('assert');
const {
  newStore, installFeastdrawDiag, withFeastdrawDiag, analyzeFeastdraw,
} = require('./policies/feastdraw-diag');

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log('  ok: ' + name); }
  catch (e) { console.error('  FAIL: ' + name + ' — ' + (e && e.message)); process.exitCode = 1; }
}

// --- Fake Game: mimics the feastBuff engine contract ---
function fakeGame() {
  const G = {
    state: { scholar: { day: 115, feastDraw: null, feastBuff: null } },
    data: { monsters: [
      { id: 'strike', wave: 4 }, { id: 'cliffhanger', wave: 1 }, { id: 'callback', wave: 3 },
    ] },
    pendingEncounter: false, pendingMonsterId: null,
    startCombatCalls: [],
    startCombat(mid) { this.startCombatCalls.push(mid); return { ok: true }; },
    grantFeastBuff(feast) {
      const s = this.state.scholar;
      if (!((s.prog || {}).feastSurge || (feast && feast.surge))) return { granted: false, why: 'devotion gate' };
      if (s.feastBuff) return { granted: true, refreshed: true, mult: 1.5, quality: 1 };
      s.feastBuff = { day: s.day, quality: 1, mult: 1.5, untilDay: s.day + 2, used: false };
      const draw = this.drawFeastScavenger();
      return { granted: true, refreshed: false, mult: 1.5, quality: 1, draw: (draw && draw.drawn) ? draw.monsterId : null };
    },
    drawFeastScavenger() {
      const s = this.state.scholar;
      if (this.pendingEncounter) return { drawn: false, why: 'already pending' };
      const mid = this._nextCast || 'strike';
      const def = (this.data.monsters || []).find(m => m.id === mid);
      if (!def) return { drawn: false, why: 'unknown id ' + mid };
      s.feastDraw = { monsterId: mid, veteran: !!this._nextVeteran, day: s.day };
      this.pendingEncounter = true; this.pendingMonsterId = mid;
      return { drawn: true, monsterId: mid, veteran: !!this._nextVeteran };
    },
    faceFeastDraw() {
      const s = this.state.scholar;
      const d = s.feastDraw;
      if (!d) return { ok: false };
      const mid = d.monsterId;
      try { this.startCombat(mid); } finally { delete s.feastDraw; }
      return { ok: true, monsterId: mid };
    },
    driveOffFeastDraw() {
      const s = this.state.scholar;
      const d = s.feastDraw;
      if (!d) return { ok: false };
      delete s.feastDraw;
      this.pendingEncounter = false; this.pendingMonsterId = null;
      return { ok: true, drivenOff: true };
    },
    clearFeastBuff(expired) {
      const s = this.state.scholar;
      if (!s.feastBuff) return;
      delete s.feastBuff;
      const d = s.feastDraw;
      if (d && this.pendingEncounter && this.pendingMonsterId === d.monsterId) {
        this.pendingEncounter = false; this.pendingMonsterId = null;
        delete s.feastDraw;
      }
    },
  };
  return G;
}

function armFake() {
  const G = fakeGame();
  G.state.scholar.prog = { feastSurge: 1.5 };
  const store = newStore();
  process.env.FEASTDRAW = '1';
  installFeastdrawDiag(G, store);
  return { G, store };
}

// Fake nonworldkill store: one feast-draw start + one end row.
function fakeNwk(startDay, faceDay, fightId, endResult, newLog) {
  return {
    starts: [{
      day: startDay, arg: 'strike', mid: 'strike', wave: 4,
      tableTrial: false, refused: false, threw: null, fightId: fightId,
      origin: 'null-origin', feastDraw: { monsterId: 'strike', veteran: false, day: faceDay },
      stack: 'faceFeastDraw,feastFightRoad', stackLines: [],
    }],
    ends: [{ day: startDay, fightId: fightId, result: endResult, newLog: newLog }],
  };
}

// --- Integration: fresh grant draws once, links grant->draw ---
check('fresh grant records grant + drawn draw, grantIdx links', () => {
  const { G, store } = armFake();
  const r = G.grantFeastBuff({ quality: 1, surge: 1.5 });
  assert.strictEqual(r.granted, true);
  assert.strictEqual(store.grants.length, 1);
  assert.strictEqual(store.grants[0].granted, true);
  assert.strictEqual(store.grants[0].refreshed, false);
  assert.strictEqual(store.draws.length, 1);
  assert.strictEqual(store.draws[0].drawn, true);
  assert.strictEqual(store.draws[0].monsterId, 'strike');
  assert.strictEqual(store.draws[0].wave, 4);
  assert.strictEqual(store.draws[0].grantIdx, 0);
  assert.strictEqual(store.errs, 0);
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.fresh, 1);
  assert.strictEqual(an.spawned, 1);
  assert.strictEqual(an.drawsPerFreshGrant, 1);
});

check('refresh grant records refreshed, draws nothing', () => {
  const { G, store } = armFake();
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  const drawsBefore = store.draws.length;
  const r = G.grantFeastBuff({ quality: 2, surge: 1.5 });
  assert.strictEqual(r.refreshed, true);
  assert.strictEqual(store.draws.length, drawsBefore);
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.refreshed, 1);
  assert.strictEqual(an.fresh, 1);
});

check('refused grant records refused, draws nothing', () => {
  const G = fakeGame(); // no prog.feastSurge, no feast.surge
  const store = newStore();
  process.env.FEASTDRAW = '1';
  installFeastdrawDiag(G, store);
  const r = G.grantFeastBuff({ quality: 1 });
  assert.strictEqual(r.granted, false);
  assert.strictEqual(store.grants[0].granted, false);
  assert.strictEqual(store.draws.length, 0);
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.refused, 1);
  assert.strictEqual(an.fresh, 0);
  assert.strictEqual(an.drawsPerFreshGrant, null);
});

check('already-pending draw records not-spawned with why', () => {
  const { G, store } = armFake();
  G.pendingEncounter = true; G.pendingMonsterId = 'wanderer_x';
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  assert.strictEqual(store.draws.length, 1);
  assert.strictEqual(store.draws[0].drawn, false);
  assert.strictEqual(store.draws[0].why, 'already pending');
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.notSpawned, 1);
  assert.strictEqual(an.notSpawnedByWhy['already pending'], 1);
  assert.strictEqual(an.spawned, 0);
});

check('face records decision; analyzer joins fight + wave-4 kill', () => {
  const { G, store } = armFake();
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  const r = G.faceFeastDraw();
  assert.strictEqual(r.ok, true);
  assert.strictEqual(store.faces.length, 1);
  assert.strictEqual(store.faces[0].ok, true);
  assert.strictEqual(store.faces[0].preDraw.monsterId, 'strike');
  // Nonworldkill saw the fight: start day 115, feastDraw.day 115.
  const nwk = fakeNwk(115, 115, 'f1', 'won', [{ d: 115, mid: 'strike', w: 4, by: 'elif_demir', via: 'player', trick: null }]);
  const an = analyzeFeastdraw(store, nwk);
  assert.strictEqual(an.outcomes['faced-face'], 1);
  assert.strictEqual(an.facedRate, 1);
  assert.strictEqual(an.killRate, 1);
  assert.strictEqual(an.wave4Draws, 1);
  assert.strictEqual(an.wave4Kills, 1);
  assert.strictEqual(an.veteransPerDraw, 1);
  assert.strictEqual(an.unclassified, 0);
  assert.strictEqual(an.drawOutcomes[0].endResult, 'won');
});

check('drive-off records decision; analyzer outcome driven-off', () => {
  const { G, store } = armFake();
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  const r = G.driveOffFeastDraw();
  assert.strictEqual(r.ok, true);
  assert.strictEqual(store.driveoffs.length, 1);
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.outcomes['driven-off'], 1);
  assert.strictEqual(an.faced, 0);
  assert.strictEqual(an.unclassified, 0);
});

check('unmet draw after clear records unmet-expired', () => {
  const { G, store } = armFake();
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  G.clearFeastBuff(true);
  assert.strictEqual(store.clears.length, 1);
  assert.strictEqual(store.clears[0].preDraw.monsterId, 'strike');
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.outcomes['unmet-expired'], 1);
  assert.strictEqual(an.unclassified, 0);
});

check('unmet draw with no clear records unmet-other', () => {
  const { G, store } = armFake();
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  // Simulate run end: buff never cleared, no decision, no fight.
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.outcomes['unmet-other'], 1);
});

check('harness-faced draw: start row with no face row => faced-harness', () => {
  const { G, store } = armFake();
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  // Harness fallback faced it: start row carries feastDraw, no face row.
  const nwk = fakeNwk(116, 115, 'f2', 'lost', []);
  // fakeNwk's stack says faceFeastDraw; rewrite to harness caller.
  nwk.starts[0].stack = 'driveContestsImpl,driveContests';
  const an = analyzeFeastdraw(store, nwk);
  assert.strictEqual(an.outcomes['faced-harness'], 1);
  assert.strictEqual(an.drawOutcomes[0].endResult, 'lost');
  assert.strictEqual(an.drawOutcomes[0].hasKill, false);
  assert.strictEqual(an.killRate, 0);
});

check('unmatched face / start / null-wave draw count as unclassified', () => {
  const store = newStore();
  store.faces.push({ day: 50, ok: true, monsterId: 'ghost', preDraw: { monsterId: 'ghost', veteran: false, day: 50 } });
  const nwk = {
    starts: [{ day: 60, arg: 'cliffhanger', mid: 'cliffhanger', wave: 1, tableTrial: false, refused: false, threw: null, fightId: 'f9', origin: 'null-origin', feastDraw: { monsterId: 'cliffhanger', veteran: false, day: 60 }, stack: 'faceFeastDraw', stackLines: [] }],
    ends: [],
  };
  const an = analyzeFeastdraw(store, nwk);
  assert.strictEqual(an.unmatchedFaces.length, 1);
  assert.strictEqual(an.unmatchedStarts.length, 1);
  assert.ok(an.unclassified >= 2);
});

check('null-wave draw (def absent) counted, never guessed', () => {
  const { G, store } = armFake();
  G._nextCast = 'no_such_monster';
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  // Fake engine returns 'unknown id' for a missing def — emulate the
  // real draw wrapper's wave lookup by forcing a drawn row instead:
  store.draws.push({ day: 115, drawn: true, monsterId: 'mystery', veteran: false, wave: null, why: null, grantIdx: 0 });
  const an = analyzeFeastdraw(store, null);
  assert.strictEqual(an.nullWaveDraws.length, 1);
  assert.ok(an.unclassified >= 1);
});

check('engine throw is recorded and rethrown unchanged', () => {
  const G = fakeGame();
  G.grantFeastBuff = function () { throw new Error('engine boom'); };
  const store = newStore();
  process.env.FEASTDRAW = '1';
  installFeastdrawDiag(G, store);
  assert.throws(() => G.grantFeastBuff({}), /engine boom/);
  assert.strictEqual(store.grants.length, 1);
  assert.ok(store.grants[0].threw.indexOf('engine boom') >= 0);
  assert.strictEqual(store.errs, 0);
});

check('recorder adds no game state beyond the installed-flag class', () => {
  const G = fakeGame();
  G.state.scholar.prog = { feastSurge: 1.5 };
  const before = Object.keys(G).sort();
  const store = newStore();
  process.env.FEASTDRAW = '1';
  installFeastdrawDiag(G, store);
  G.grantFeastBuff({ quality: 1, surge: 1.5 });
  const after = Object.keys(G).sort();
  const added = after.filter(k => before.indexOf(k) < 0);
  assert.deepStrictEqual(added.sort(), ['_feastdrawDiagInstalled', '_feastdrawDiagStore', '_feastdrawDiagUninstall'].sort());
  // Recorder drew no RNG of its own: engine state changes are the
  // fake engine's own (feastBuff + feastDraw), nothing else.
  assert.strictEqual(G.state.scholar.feastDraw.monsterId, 'strike');
});

check('FEASTDRAW unset: withFeastdrawDiag daily installs nothing', () => {
  delete process.env.FEASTDRAW;
  const inner = { id: 'base', daily() { return 'base-daily'; } };
  const wrapped = withFeastdrawDiag(inner, 'fd', 'test', newStore());
  const G = fakeGame();
  const origGrant = G.grantFeastBuff;
  const r = wrapped.daily(G, {});
  assert.strictEqual(r, 'base-daily');
  assert.strictEqual(G.grantFeastBuff, origGrant);
  assert.strictEqual(G._feastdrawDiagInstalled, undefined);
  process.env.FEASTDRAW = '1';
});

check('analyzer: 73678-like strike join (grant 115, face, won, w4 kill)', () => {
  const store = newStore();
  store.grants.push({ day: 115, granted: true, refreshed: false, mult: 1.5, quality: 1, why: null, drawMonsterId: 'strike', preDraw: null, preBuff: null, postDraw: { monsterId: 'strike', veteran: false, day: 115 }, threw: null });
  store.draws.push({ day: 115, drawn: true, monsterId: 'strike', veteran: false, wave: 4, why: null, grantIdx: 0, threw: null });
  store.faces.push({ day: 115, ok: true, monsterId: 'strike', preDraw: { monsterId: 'strike', veteran: false, day: 115 }, why: null, threw: null });
  const nwk = fakeNwk(115, 115, 'fmgpspioy_8fe9s5', 'won', [{ d: 115, mid: 'strike', w: 4, by: 'elif_demir', via: 'player', trick: null }]);
  const an = analyzeFeastdraw(store, nwk);
  assert.strictEqual(an.drawOutcomes.length, 1);
  const o = an.drawOutcomes[0];
  assert.strictEqual(o.outcome, 'faced-face');
  assert.strictEqual(o.wave4Kills.length, 1);
  assert.strictEqual(o.wave4Kills[0].by, 'elif_demir');
  assert.strictEqual(an.unclassified, 0);
});

check('analyzer: wave distribution + veterans-per-draw over mixed band', () => {
  const store = newStore();
  const mk = (day, mid, wave) => ({ day, drawn: true, monsterId: mid, wave, veteran: false, why: null, grantIdx: 0, threw: null });
  store.grants = [0, 1, 2, 3].map(i => ({ day: 10 + i, granted: true, refreshed: false, mult: 1.5, quality: 1, why: null, drawMonsterId: 'x', preDraw: null, preBuff: null, postDraw: null, threw: null }));
  store.draws = [mk(10, 'strike', 4, 0), mk(11, 'cliffhanger', 1, 0), mk(12, 'callback', 3, 0), mk(13, 'callback', 3, 0)];
  store.faces = [
    { day: 10, ok: true, monsterId: 'strike', preDraw: { monsterId: 'strike', veteran: false, day: 10 }, why: null, threw: null },
    { day: 12, ok: true, monsterId: 'callback', preDraw: { monsterId: 'callback', veteran: false, day: 12 }, why: null, threw: null },
  ];
  store.driveoffs = [{ day: 11, ok: true, drivenOff: true, monsterId: 'cliffhanger', preDraw: { monsterId: 'cliffhanger', veteran: false, day: 11 }, why: null, threw: null }];
  const nwk = {
    starts: [
      { day: 10, arg: 'strike', mid: 'strike', wave: 4, tableTrial: false, refused: false, threw: null, fightId: 'a', origin: 'null-origin', feastDraw: { monsterId: 'strike', veteran: false, day: 10 }, stack: 'faceFeastDraw', stackLines: [] },
      { day: 12, arg: 'callback', mid: 'callback', wave: 3, tableTrial: false, refused: false, threw: null, fightId: 'b', origin: 'null-origin', feastDraw: { monsterId: 'callback', veteran: false, day: 12 }, stack: 'faceFeastDraw', stackLines: [] },
    ],
    ends: [
      { day: 10, fightId: 'a', result: 'won', newLog: [{ d: 10, mid: 'strike', w: 4, by: 's1', via: 'player', trick: null }] },
      { day: 12, fightId: 'b', result: 'won', newLog: [{ d: 12, mid: 'callback', w: 3, by: 's1', via: 'player', trick: null }] },
    ],
  };
  const an = analyzeFeastdraw(store, nwk);
  assert.strictEqual(an.drawsPerFreshGrant, 1);
  assert.strictEqual(an.faced, 2);
  assert.strictEqual(an.facedRate, 0.5);
  assert.strictEqual(an.killRate, 1);
  assert.strictEqual(an.totalKills, 2);
  assert.strictEqual(an.wave4Draws, 1);
  assert.strictEqual(an.wave4Kills, 1);
  assert.strictEqual(an.veteransPerDraw, 0.25);
  assert.deepStrictEqual(an.waveDist, { w4: 1, w1: 1, w3: 2 });
  assert.strictEqual(an.outcomes['unmet-other'], 1); // day-13 draw, no decision
  assert.strictEqual(an.unclassified, 0);
});

console.log(`\ntest-feastdraw-a: ${passed} checks passed${process.exitCode ? ' (WITH FAILURES)' : ''}`);
if (process.exitCode) process.exit(1);
