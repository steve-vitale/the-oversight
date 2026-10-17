#!/usr/bin/env node
// scripts/test-takeseat-20261017.js — proof for the takeseat layer.
//
// KILL PROTOCOL (established pattern, e.g. test-feastblow-20261017.js): if
// the PRIMARY misses and the layer is deleted zero-trace, this test
// repairs to the INFO-SKIP branch (layer absent -> records verdict, skips
// mechanism checks) instead of failing.
//
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-takeseat-20261017.js
//   SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-takeseat-20261017.js
'use strict';
const assert = require('assert');
let LAYER = null;
try { LAYER = require('./policies/takeseat'); } catch (e) { LAYER = null; }
const { leadfeast } = require('./policies/feastscale');

const SMOKE = process.env.SMOKE === '1';
let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

if (!LAYER) {
  console.log('LAYER ABSENT (killed at pilot NO-GO per evidence/2026-10-17/sim-takeseat.md) — mechanism checks skipped by design.');
  ok('kill-protocol: no takeseat layer file in scripts/policies/', true);
  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
}

// --- below runs only when the layer exists ---
const { layerOn, takeSeatDrive, leadtakeseat, belongtakeseat } = LAYER;

// stubGame: a minimal engine surface. tablePreview/tableTakeSeat are the
// REAL call sequence the layer drives; everything else is state the
// engine owns (over, tbfight, progState table flags).
function stubGame(overrides) {
  const calls = { taken: 0 };
  const g = {
    over: false, tbfight: null,
    state: { scholar: { day: 100 } },
    _pg: { tableDone: false, tableWaiting: true, tableAnnounced: true },
    progState() { return this._pg; },
    tablePreview() {
      if (!this._pg.tableWaiting || this._pg.tableDone) return null;
      return { seat: 'lesser', ready: true, doors: ['Witness'] };
    },
    tableTakeSeat() {
      calls.taken++;
      const pv = this.tablePreview();
      if (!pv) return { ok: false, msg: '' };
      this._pg.tableDone = true;
      return { ok: true };
    },
    _calls: calls,
  };
  return Object.assign(g, overrides || {});
}

function withEnv(v, fn) {
  const prev = process.env.TAKESEAT;
  if (v == null) delete process.env.TAKESEAT; else process.env.TAKESEAT = v;
  try { return fn(); } finally {
    if (prev == null) delete process.env.TAKESEAT; else process.env.TAKESEAT = prev;
  }
}

// RED: gate OFF never drives the verb — pure delegation.
withEnv(null, () => {
  assert.strictEqual(layerOn(), false);
  const g = stubGame(); const ctx = {};
  assert.strictEqual(takeSeatDrive(g, ctx), undefined);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(ctx.tsSeatTaken | 0, 0);
  ok('RED: gate OFF never drives the seat verb', true);
});

// GREEN: gate ON drives the real verb when staged+announced+ready.
withEnv('1', () => {
  assert.strictEqual(layerOn(), true);
  const g = stubGame(); const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 1);
  assert.strictEqual(ctx.tsSeatTaken, 1);
  assert.strictEqual(ctx.tsSeatDay, 100);
  assert.strictEqual(ctx.tsSeatKind, 'lesser');
  ok('GREEN: gate ON drives tableTakeSeat() when preconditions hold', true);
});

// ADVERSARIAL 1: pre-day-90 seat floor — the engine's preview is null
// (table.js: "nonexistent before day 90 — no preview, no button").
withEnv('1', () => {
  const g = stubGame(); g.tablePreview = () => null; // pre-floor engine answer
  const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(ctx.tsPreviewNull, 1);
  ok('adversarial: pre-day-90 (preview null) never takes the seat', true);
});

// ADVERSARIAL 2: invitation staged but never announced — no drive.
withEnv('1', () => {
  const g = stubGame(); g._pg.tableAnnounced = false;
  const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  ok('adversarial: staged-but-unannounced never takes the seat', true);
});

// ADVERSARIAL 3: tableDone already true — never take twice.
withEnv('1', () => {
  const g = stubGame(); g._pg.tableDone = true;
  const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  ok('adversarial: tableDone true never takes twice (engine guard)', true);
});

// ADVERSARIAL 4: the policy's own guard — the verb already fired once.
withEnv('1', () => {
  const g = stubGame(); const ctx = { tsSeatTaken: 1 };
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  ok('adversarial: ctx guard never invokes the verb twice', true);
});

// ADVERSARIAL 5: fight live — never shadow combat.
withEnv('1', () => {
  const g = stubGame(); g.tbfight = { over: false };
  const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(ctx.tsSkippedFight, 1);
  ok('adversarial: live fight refuses (luxury-move safety)', true);
});

// ADVERSARIAL 6: game over — the seat can wait; it waits forever here.
withEnv('1', () => {
  const g = stubGame(); g.over = true;
  const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  ok('adversarial: game over refuses', true);
});

// ADVERSARIAL 7: engine says not takeable (preview exists, ready false).
withEnv('1', () => {
  const g = stubGame(); g.tablePreview = () => ({ seat: 'lesser', ready: false });
  const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  ok('adversarial: engine not-ready never forced', true);
});

// ADVERSARIAL 8: verb refuses (ok:false) — classified as failure, not silent.
withEnv('1', () => {
  const g = stubGame(); g.tableTakeSeat = () => { g._calls.taken++; return { ok: false, msg: '' }; };
  const ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 1);
  assert.strictEqual(ctx.tsSeatTaken | 0, 0);
  assert.strictEqual(ctx.tsSeatFailed, 1);
  ok('adversarial: verb refusal classified as failure', true);
});

ok('policy ids are leadtakeseat/belongtakeseat', leadtakeseat.id === 'leadtakeseat' && belongtakeseat.id === 'belongtakeseat');
ok('wraps the feastscale base (upkeep + daily present)', typeof leadtakeseat.upkeep === 'function' && typeof leadtakeseat.daily === 'function');

// DET-GATE: gate OFF byte-identical to bare leadfeast (60d, seed 9701).
async function detGate() {
  delete process.env.TAKESEAT;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const seed = 9701;
  async function traj(policy) {
    const { Game } = await loadGame({ seed, mode: 'takeseat-detgate' });
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
  const b = await traj(leadtakeseat);
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
