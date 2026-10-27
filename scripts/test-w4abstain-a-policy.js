#!/usr/bin/env node
// scripts/test-w4abstain-a-policy.js — unit proof for the w4abstain
// policy hooks on a fake Game (no engine load). Proves: layer-off
// delegation with no ctx surface; layer-on wave-4 fights are fled
// (move toward edge + turn ended, zero strikes); non-wave-4 fights
// delegate; wave-4 feast draws are driven off; non-draw wave-4
// pendings are counted, not driven off; unknown waves are never
// treated as wave 4.
'use strict';
const { w4abstain, w4abstainLayerOn, waveOfMonster, fightWaves } = require('./policies/w4abstain');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const MONSTERS = [
  { id: 'congregation', wave: 4 },
  { id: 'strike', wave: 4 },
  { id: 'audit', wave: 4 },
  { id: 'bulldozer', wave: 1 },
];

function fakeGame(opts) {
  const o = opts || {};
  const calls = { moves: [], barriers: [], strikes: [], waits: [], after: [], driveoffs: [] };
  const p = { mx: (o.px != null ? o.px : 4), my: (o.py != null ? o.py : 4), moveLeft: 5, acted: false, hp: 100, maxHp: 100 };
  const fighters = [{ key: 'p', kind: 'player', alive: true, mx: p.mx, my: p.my }];
  for (const m of (o.monsters || [])) {
    fighters.push({ key: m.key || 'm_0', kind: 'monster', alive: true, fled: false,
      monsterId: m.id, mdef: { id: m.id, wave: m.wave }, mx: 5, my: 4 });
  }
  const G = {
    calls,
    data: { monsters: MONSTERS },
    state: { scholar: { day: o.day || 50, feastDraw: o.feastDraw || null } },
    pendingEncounter: !!o.pendingEncounter,
    pendingMonsterId: o.pendingMonsterId || null,
    tbfight: o.fight === false ? null : {
      id: o.fightId || 'f1', over: false, gridSize: o.gridSize || 9, fighters,
    },
    tbIsPlayerTurn: () => (o.playerTurn !== false),
    tbFighter: (k) => (k === 'p' ? p : null),
    tbPlayerMove: (x, y) => { calls.moves.push([x, y]); return true; },
    tbBarrierExit: (dx, dy) => { calls.barriers.push([dx, dy]); return true; },
    tbAfterPlayerAction: () => { calls.after.push(1); },
    tbPlayerWait: () => { calls.waits.push(1); },
    tbPlayerStrike: (k) => { calls.strikes.push(k); return true; },
    driveOffFeastDraw: () => { calls.driveoffs.push(1); return (o.driveoffResult !== undefined ? o.driveoffResult : { ok: true }); },
  };
  return G;
}

function withEnv(v, fn) {
  const prev = process.env.W4ABSTAIN;
  if (v === undefined) delete process.env.W4ABSTAIN; else process.env.W4ABSTAIN = v;
  try { return fn(); } finally {
    if (prev === undefined) delete process.env.W4ABSTAIN; else process.env.W4ABSTAIN = prev;
  }
}

// 1. layerOn reads env per call.
withEnv(undefined, () => check('layer off when unset', w4abstainLayerOn() === false));
withEnv('1', () => check('layer on when 1', w4abstainLayerOn() === true));
withEnv('0', () => check('layer off when 0', w4abstainLayerOn() === false));

// 2. waveOfMonster + fightWaves.
(function () {
  const G = fakeGame({});
  check('waveOfMonster congregation = 4', waveOfMonster(G, 'congregation') === 4);
  check('waveOfMonster bulldozer = 1', waveOfMonster(G, 'bulldozer') === 1);
  check('waveOfMonster unknown = null', waveOfMonster(G, 'nope') === null);
  const G2 = fakeGame({ monsters: [{ id: 'congregation', wave: 4 }, { id: 'bulldozer', wave: 1 }] });
  const w = fightWaves(G2);
  check('fightWaves finds w4', w.w4.length === 1);
  check('fightWaves lists all waves', w.waves.length === 2);
  const G3 = fakeGame({ fight: false });
  check('fightWaves empty with no fight', fightWaves(G3).w4.length === 0);
})();

// 3. Layer ON, wave-4 fight, player turn: fled, zero strikes.
withEnv('1', () => {
  const G = fakeGame({ monsters: [{ id: 'congregation', wave: 4 }] });
  const ctx = {};
  const r = w4abstain.fight(G, ctx);
  check('w4 fight handled (true)', r === true);
  check('w4 fight: no strikes', G.calls.strikes.length === 0);
  check('w4 fight: stepped toward edge', G.calls.moves.length === 1 && G.calls.moves[0][0] === 3);
  check('w4 fight: turn ended', G.calls.after.length === 1);
  check('w4 fight: counters set', ctx.w4abstainTurns === 1 && ctx.w4abstainFights === 1);
});

// 4. Layer ON, wave-4 fight, player already on edge: barrier push.
withEnv('1', () => {
  const G = fakeGame({ px: 0, monsters: [{ id: 'strike', wave: 4 }] });
  const ctx = {};
  const r = w4abstain.fight(G, ctx);
  check('edge w4 fight handled', r === true);
  check('edge w4 fight: barrier push', G.calls.barriers.length === 1 && G.calls.barriers[0][0] === -1);
  check('edge w4 fight: no strikes', G.calls.strikes.length === 0);
  check('edge w4 fight: no step move', G.calls.moves.length === 0);
});

// 5. Layer ON, non-wave-4 fight: delegated, no abstain counters.
withEnv('1', () => {
  const G = fakeGame({ monsters: [{ id: 'bulldozer', wave: 1 }] });
  const ctx = {};
  w4abstain.fight(G, ctx);
  check('non-w4 fight: no abstain turns', ctx.w4abstainTurns === undefined);
  check('non-w4 fight: no abstain fights', ctx.w4abstainFights === undefined);
});

// 6. Layer OFF, wave-4 fight: delegated (competent fight on a fake
// Game must not throw out of the policy), no abstain counters.
withEnv(undefined, () => {
  const G = fakeGame({ monsters: [{ id: 'congregation', wave: 4 }] });
  const ctx = {};
  let threw = false;
  try { w4abstain.fight(G, ctx); } catch (e) { threw = true; }
  check('layer-off fight does not throw', threw === false);
  check('layer-off fight: no abstain surface', ctx.w4abstainTurns === undefined && ctx.w4abstainFights === undefined);
});

// 7. Layer ON, wave-4 feast draw pending: driven off.
withEnv('1', () => {
  const G = fakeGame({ fight: false, pendingEncounter: true, pendingMonsterId: 'strike',
    feastDraw: { monsterId: 'strike' } });
  const ctx = {};
  const r = w4abstain.pending(G, ctx);
  check('w4 draw: pending handled (true)', r === true);
  check('w4 draw: driveoff called', G.calls.driveoffs.length === 1);
  check('w4 draw: counter set', ctx.w4abstainDrawDriveoffs === 1);
});

// 8. Layer ON, wave-4 non-draw pending: counted, NOT driven off,
// harness fallback faces it (returns false).
withEnv('1', () => {
  const G = fakeGame({ fight: false, pendingEncounter: true, pendingMonsterId: 'audit' });
  const ctx = {};
  const r = w4abstain.pending(G, ctx);
  check('w4 non-draw pending: not handled (false)', r === false);
  check('w4 non-draw pending: no driveoff', G.calls.driveoffs.length === 0);
  check('w4 non-draw pending: counted', ctx.w4abstainPendingSeen === 1);
});

// 9. Layer ON, wave-1 feast draw pending: untouched.
withEnv('1', () => {
  const G = fakeGame({ fight: false, pendingEncounter: true, pendingMonsterId: 'bulldozer',
    feastDraw: { monsterId: 'bulldozer' } });
  const ctx = {};
  const r = w4abstain.pending(G, ctx);
  check('w1 draw: not handled', r === false);
  check('w1 draw: no driveoff', G.calls.driveoffs.length === 0);
  check('w1 draw: no w4 counters', ctx.w4abstainDrawDriveoffs === undefined && ctx.w4abstainPendingSeen === undefined);
});

// 10. Layer OFF, pending: no abstain surface.
withEnv(undefined, () => {
  const G = fakeGame({ fight: false, pendingEncounter: true, pendingMonsterId: 'strike',
    feastDraw: { monsterId: 'strike' } });
  const ctx = {};
  w4abstain.pending(G, ctx);
  check('layer-off pending: no abstain surface',
    ctx.w4abstainDrawDriveoffs === undefined && ctx.w4abstainPendingSeen === undefined);
  check('layer-off pending: no driveoff', G.calls.driveoffs.length === 0);
});

// 11. Mixed pack (w4 + w1): the whole fight is fled.
withEnv('1', () => {
  const G = fakeGame({ monsters: [{ id: 'congregation', wave: 4 }, { id: 'bulldozer', wave: 1 }] });
  const ctx = {};
  const r = w4abstain.fight(G, ctx);
  check('mixed pack fled', r === true && G.calls.strikes.length === 0 && ctx.w4abstainFights === 1);
});

// 12. Not the player's turn: fight hook does not act.
withEnv('1', () => {
  const G = fakeGame({ playerTurn: false, monsters: [{ id: 'congregation', wave: 4 }] });
  const ctx = {};
  const r = w4abstain.fight(G, ctx);
  check('not player turn: delegated (not handled as flee)', G.calls.moves.length === 0 && G.calls.strikes.length === 0);
  void r;
});

console.log(`\nw4abstain policy unit proof: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
