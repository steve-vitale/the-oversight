#!/usr/bin/env node
// scripts/test-feastblow-20261017.js — proof for the feastblow layer.
//
// KILL PROTOCOL (2026-10-17): the feastblow layer was KILLED at pilot NO-GO
// (PRIMARY 15/16 vs 15/16 — the base feastscale policy already fields the
// feasted scholar; the layer moved nothing). scripts/policies/feastblow.js
// is deleted zero-trace. This test keeps the harness det-gate shape for the
// surviving substrate and records the mechanism verdict; the RED→GREEN
// mechanism proof (10/10 green pre-kill, gate OFF byte-identical) and the
// pilot's 150/150 draws-faced measurement live in
// evidence/2026-10-17/sim-feastblow.md.
//
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-feastblow-20261017.js
'use strict';
const assert = require('assert');
let LAYER = null;
try { LAYER = require('./policies/feastblow'); } catch (e) { LAYER = null; }
const { leadfeast } = require('./policies/feastscale');

const SMOKE = process.env.SMOKE === '1';
let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

if (!LAYER) {
  console.log('LAYER ABSENT (killed at pilot NO-GO per evidence/2026-10-17/sim-feastblow.md) — mechanism checks skipped by design.');
  ok('kill-protocol: no feastblow layer file in scripts/policies/', true);
  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
}

// --- below runs only when the layer exists (pre-kill record) ---
const { feastBlowFace, layerOn, leadfeastblow } = LAYER;

function stubGame(overrides) {
  const calls = { faced: 0 };
  const g = {
    over: false, tbfight: null,
    state: { scholar: { day: 10, hp: 100, maxHp: 100, feastBuff: { used: false }, prog: {} } },
    feastedActive: () => true,
    feastDrawPending: () => ({ monsterId: 'hushwolf' }),
    faceFeastDraw: () => { calls.faced++; return { ok: true, monsterId: 'hushwolf' }; },
    _calls: calls,
  };
  return Object.assign(g, overrides || {});
}

function withEnv(v, fn) {
  const prev = process.env.FEASTBLOW;
  if (v == null) delete process.env.FEASTBLOW; else process.env.FEASTBLOW = v;
  try { return fn(); } finally {
    if (prev == null) delete process.env.FEASTBLOW; else process.env.FEASTBLOW = prev;
  }
}

withEnv(null, () => {
  assert.strictEqual(layerOn(), false);
  const g = stubGame(); const ctx = {};
  assert.strictEqual(feastBlowFace(g, ctx), false);
  assert.strictEqual(g._calls.faced, 0);
  ok('RED: gate OFF never faces the draw', true);
});
withEnv('1', () => {
  assert.strictEqual(layerOn(), true);
  const g = stubGame(); const ctx = {};
  assert.strictEqual(feastBlowFace(g, ctx), true);
  assert.strictEqual(g._calls.faced, 1);
  assert.strictEqual(ctx.fbFaced, 1);
  ok('GREEN: gate ON faces the pending draw while feasted', true);
});
withEnv('1', () => {
  const g = stubGame({ state: { scholar: { day: 10, hp: 50, maxHp: 100, feastBuff: { used: false }, prog: {} } } });
  const ctx = {};
  assert.strictEqual(feastBlowFace(g, ctx), false);
  assert.strictEqual(ctx.fbSkippedLowHp, 1);
  ok('low hp (0.5) skips the draw fight', true);
});
withEnv('1', () => {
  const g = stubGame({ state: { scholar: { day: 10, hp: 100, maxHp: 100, feastBuff: { used: true }, prog: {} } } });
  const ctx = {};
  assert.strictEqual(feastBlowFace(g, ctx), false);
  ok('marked buff delegates (deed banked)', true);
});
withEnv('1', () => {
  const g = stubGame(); g.feastDrawPending = () => null;
  const ctx = {};
  assert.strictEqual(feastBlowFace(g, ctx), false);
  ok('no draw pending delegates to base patrol', true);
});
withEnv('1', () => {
  const g = stubGame(); g.tbfight = { over: false };
  const ctx = {};
  assert.strictEqual(feastBlowFace(g, ctx), false);
  ok('live fight refuses (never shadows combat)', true);
});
withEnv('1', () => {
  const g = stubGame(); g.over = true;
  const ctx = {};
  assert.strictEqual(feastBlowFace(g, ctx), false);
  ok('game over refuses', true);
});
ok('policy id is leadfeastblow', leadfeastblow.id === 'leadfeastblow');
ok('wraps the feastscale base', typeof leadfeastblow.upkeep === 'function' && typeof leadfeastblow.daily === 'function');

async function detGate() {
  delete process.env.FEASTBLOW;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const seed = 9501;
  async function traj(policy) {
    const { Game } = await loadGame({ seed, mode: 'feastblow-detgate' });
    await setupGame(Game);
    const hashes = [];
    const base = policy.daily;
    const wrapped = Object.assign({}, policy, {
      daily(G, ctx) { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    return hashes;
  }
  const a = await traj(leadfeast);
  const b = await traj(leadfeastblow);
  const same = a.length === b.length && a.every((h, i) => h === b[i]);
  ok('DET-GATE: gate OFF byte-identical to bare leadfeast (' + a.length + ' days)', same);
}

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
    console.error('TEST STOP: need FEASTSCALE_R13=1 SEATDRIVE=0'); process.exit(2);
  }
  if (!SMOKE) await detGate();
  else console.log('(SMOKE: harness det-gate skipped)');
  console.log(pass + ' checks passed');
})().catch(e => { console.error('TEST FATAL', e); process.exit(1); });
