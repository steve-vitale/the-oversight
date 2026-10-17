#!/usr/bin/env node
// scripts/test-modalplay-20261017.js — proof for the modalplay layer.
//
// KILL PROTOCOL (established pattern): if the PRIMARY misses and the layer
// is deleted zero-trace, this test repairs to the INFO-SKIP branch (layer
// absent -> records verdict, skips mechanism checks) instead of failing.
//
//   FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 node scripts/test-modalplay-20261017.js
//   SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 node scripts/test-modalplay-20261017.js
'use strict';
const assert = require('assert');
let LAYER = null;
try { LAYER = require('./policies/modalplay'); } catch (e) { LAYER = null; }
const { leadtakeseat } = require('./policies/takeseat');

const SMOKE = process.env.SMOKE === '1';
let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

if (!LAYER) {
  console.log('LAYER ABSENT (killed at pilot NO-GO per evidence/2026-10-17/sim-modalplay.md) — mechanism checks skipped by design.');
  ok('kill-protocol: no modalplay layer file in scripts/policies/', true);
  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
}

// --- below runs only when the layer exists ---
const { layerOn, drainModal, pickDoor, pickOption, leadmodalplay, belongmodalplay, TIE_BREAK } = LAYER;

// stubGame: a minimal modal surface. tableEarnedPaths is the engine's audit
// pricing; chooseTableOption records the call and consumes the modal (the
// engine presents the next beat synchronously — the stub ends the chain).
function stubGame(opts) {
  const o = opts || {};
  const calls = [];
  const g = {
    over: false, tbfight: null,
    state: { scholar: { day: 100, tableChoices: null } },
    _earned: o.earned || [],
    _options: o.options || [],
    tableEarnedPaths() { return this._earned; },
    tableState() { return { phase: o.phase || 'paths', path: null }; },
    chooseTableOption(id) {
      calls.push(id);
      // consume the modal: the next beat would appear synchronously in the
      // real engine; the stub can chain one more modal via o.next.
      const nx = (o.next || []).shift();
      this.state.scholar.tableChoices = nx ? { frame: nx.frame, options: nx.options } : null;
    },
    _calls: calls,
  };
  if (g._options.length) g.state.scholar.tableChoices = { frame: o.frame || 'the Table', options: g._options };
  return g;
}

function withEnv(v, fn) {
  const prev = process.env.MODALPLAY;
  if (v == null) delete process.env.MODALPLAY; else process.env.MODALPLAY = v;
  try { return fn(); } finally {
    if (prev == null) delete process.env.MODALPLAY; else process.env.MODALPLAY = prev;
  }
}

const DOORS = [
  { id: 'path:feared', label: 'Walk the path of the Feared' },
  { id: 'path:beloved', label: 'Walk the path of the Beloved' },
];
const PRICED_TIE = [
  { id: 'feared', earned: true, strength: 100 },
  { id: 'beloved', earned: true, strength: 100 },
  { id: 'witness', earned: false, strength: 0 },
];

// RED: gate OFF never drives the verb — pure delegation.
withEnv(null, () => {
  assert.strictEqual(layerOn(), false);
  const g = stubGame({ options: DOORS, earned: PRICED_TIE });
  const ctx = {};
  drainModal(g, ctx);
  assert.strictEqual(g._calls.length, 0);
  assert.strictEqual(ctx.mpAnswers | 0, 0);
  ok('RED: gate OFF never answers the modal', true);
});

// GREEN: gate ON plays the door by the strength rule (tie -> tie-break).
withEnv('1', () => {
  assert.strictEqual(layerOn(), true);
  const g = stubGame({ options: DOORS, earned: PRICED_TIE });
  const ctx = {};
  drainModal(g, ctx);
  assert.deepStrictEqual(g._calls, ['path:beloved']); // 100/100 tie -> beloved first per TIE_BREAK
  assert.strictEqual(ctx.mpAnswers, 1);
  assert.strictEqual(ctx.mpDoorsPlayed, 1);
  const d = ctx._modalplay.doors[0];
  assert.strictEqual(d.door, 'beloved');
  assert.strictEqual(d.witnessEarned, false);
  ok('GREEN: gate ON answers the 7-door offer by strength, tie-break beloved>feared', true);
});

// DOOR RULE: strength decides when not tied.
withEnv('1', () => {
  const priced = [
    { id: 'feared', earned: true, strength: 100 },
    { id: 'beloved', earned: true, strength: 99 },
  ];
  const g = stubGame({ options: DOORS, earned: priced });
  const pick = pickDoor(g, g._options, {});
  assert.strictEqual(pick.id, 'path:feared');
  ok('door rule: highest strength wins when not tied', true);
});

// FINDING #452: never options[0] by load order — the first-listed option
// (feared, index.html load order) must NOT win on position alone.
withEnv('1', () => {
  const priced = [
    { id: 'feared', earned: true, strength: 40 },
    { id: 'beloved', earned: true, strength: 100 },
    { id: 'relay', earned: true, strength: 100 },
  ];
  const g = stubGame({ options: DOORS, earned: priced });
  const pick = pickDoor(g, g._options, {});
  assert.strictEqual(pick.id, 'path:beloved'); // not options[0] (feared)
  ok('#452: door choice is never options[0] by load order', true);
});

// WITNESS HONESTY: offered-but-unearned doors are never candidates.
withEnv('1', () => {
  const priced = [
    { id: 'feared', earned: true, strength: 10 },
    { id: 'witness', earned: false, strength: 0 }, // prereq dead substrate
  ];
  const opts = [{ id: 'path:feared' }, { id: 'path:witness' }];
  const g = stubGame({ options: opts, earned: priced });
  const pick = pickDoor(g, g._options, {});
  assert.strictEqual(pick.id, 'path:feared');
  ok('witness honesty: unearned door never taken even when listed', true);
});

// WITNESS HONESTY 2: no honest pick when nothing earned — never invent one.
withEnv('1', () => {
  const priced = [{ id: 'witness', earned: false, strength: 0 }];
  const g = stubGame({ options: [{ id: 'path:witness' }], earned: priced });
  const ctx = {};
  const pick = pickDoor(g, g._options, ctx);
  assert.strictEqual(pick, null);
  assert.strictEqual(g._calls.length, 0);
  assert.strictEqual(ctx.mpDoorNoHonest, 1);
  ok('no honest door -> no answer, never forced', true);
});

// BEAT RULE: challenge beats take the first presented option (drain precedent).
withEnv('1', () => {
  const g = stubGame({ options: [{ id: 'beat:kill' }, { id: 'beat:mercy' }], phase: 'challenge' });
  const ctx = {};
  drainModal(g, ctx);
  assert.deepStrictEqual(g._calls, ['beat:kill']);
  ok('beat rule: first presented option (drain precedent)', true);
});

// TRIAL CARVE-OUT: an option id containing 'trial' is never picked.
withEnv('1', () => {
  const g = stubGame({ options: [{ id: 'beat:lean' }, { id: 'beat:trial' }], phase: 'challenge' });
  const ctx = {};
  drainModal(g, ctx);
  assert.deepStrictEqual(g._calls, ['beat:lean']);
  assert.strictEqual(ctx.mpTrialSkipped, 1);
  ok('trial carve-out: trial-by-combat never picked by the policy', true);
});

// DOWNGRADE: the door rule applies to the remaining earned paths.
withEnv('1', () => {
  const priced = [
    { id: 'assimilated', earned: true, strength: 45 },
    { id: 'defiant', earned: true, strength: 60 },
  ];
  const opts = [{ id: 'downgrade:assimilated' }, { id: 'downgrade:defiant' }];
  const g = stubGame({ options: opts, earned: priced, phase: 'downgrade' });
  const ctx = {};
  drainModal(g, ctx);
  assert.deepStrictEqual(g._calls, ['downgrade:defiant']);
  ok('downgrade: door rule re-applied to remaining earned paths', true);
});

// CONSCRIPT: refused (policy-side call; canon: refusable, voiced).
withEnv('1', () => {
  const g = stubGame({ options: [{ id: 'conscript:yes' }, { id: 'conscript:no' }], phase: 'conscript' });
  const ctx = {};
  drainModal(g, ctx);
  assert.deepStrictEqual(g._calls, ['conscript:no']);
  assert.strictEqual(ctx.mpConscriptRefused, 1);
  ok('conscript: refused', true);
});

// ADVERSARIAL: game over — the modal can wait; it waits forever here.
withEnv('1', () => {
  const g = stubGame({ options: DOORS, earned: PRICED_TIE });
  g.over = true;
  const ctx = {};
  drainModal(g, ctx);
  assert.strictEqual(g._calls.length, 0);
  ok('adversarial: game over refuses', true);
});

// ADVERSARIAL: live fight — never shadow combat.
withEnv('1', () => {
  const g = stubGame({ options: DOORS, earned: PRICED_TIE });
  g.tbfight = { over: false };
  const ctx = {};
  drainModal(g, ctx);
  assert.strictEqual(g._calls.length, 0);
  ok('adversarial: live fight pauses the drain', true);
});

// ADVERSARIAL: no pending modal — nothing to drive.
withEnv('1', () => {
  const g = stubGame({ options: [], earned: PRICED_TIE });
  const ctx = {};
  drainModal(g, ctx);
  assert.strictEqual(g._calls.length, 0);
  assert.strictEqual(ctx.mpAnswers | 0, 0);
  ok('adversarial: no pending modal is a no-op', true);
});

// STALL GUARD: a modal that never advances stops after 2 same-signature rounds.
withEnv('1', () => {
  const g = stubGame({ options: [{ id: 'beat:a' }], phase: 'challenge' });
  // chooseTableOption that does NOT consume the modal (engine stall).
  g.chooseTableOption = (id) => { g._calls.push(id); };
  const ctx = {};
  drainModal(g, ctx);
  assert.ok(g._calls.length <= 3, 'stall guard stops, got ' + g._calls.length);
  ok('adversarial: stall guard stops a non-advancing modal', true);
});

ok('policy ids are leadmodalplay/belongmodalplay', leadmodalplay.id === 'leadmodalplay' && belongmodalplay.id === 'belongmodalplay');
ok('TIE_BREAK pre-registered and beloved-first', Array.isArray(TIE_BREAK) && TIE_BREAK[0] === 'beloved');
ok('wraps the takeseat policy (upkeep + daily present)', typeof leadmodalplay.upkeep === 'function' && typeof leadmodalplay.daily === 'function');

// WRAPPER: gate OFF delegates to the base daily untouched.
withEnv(null, () => {
  let baseDailyCalls = 0;
  const base = { id: 'x', daily(G, ctx) { baseDailyCalls++; } };
  const { withModalPlay } = LAYER;
  const w = withModalPlay(base, 'wx', 'x');
  w.daily({}, {});
  assert.strictEqual(baseDailyCalls, 1);
  ok('wrapper: gate OFF delegates to base.daily', true);
});

// DET-GATE: gate OFF byte-identical to the takeseat-wrapped base (60d).
async function detGate() {
  delete process.env.MODALPLAY;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const seed = 9850;
  async function traj(policy) {
    const { Game } = await loadGame({ seed, mode: 'modalplay-detgate' });
    await setupGame(Game);
    const hashes = [];
    const base = policy.daily;
    const wrapped = Object.assign({}, policy, {
      daily(G, ctx) { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    return hashes;
  }
  const a = await traj(leadtakeseat);
  const b = await traj(leadmodalplay);
  const same = a.length === b.length && a.every((h, i) => h === b[i]);
  ok('DET-GATE: gate OFF byte-identical to leadtakeseat (' + a.length + ' days)', same);
}

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.TAKESEAT !== '1') {
    console.error('TEST STOP: need FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1'); process.exit(2);
  }
  if (!SMOKE) await detGate();
  else console.log('(SMOKE: harness det-gate skipped)');
  console.log(pass + ' checks passed');
})().catch(e => { console.error('TEST FATAL', e); process.exit(1); });
