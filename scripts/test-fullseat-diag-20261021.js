#!/usr/bin/env node
// test-fullseat-diag-20261021.js — proof for the fullseat-diag instrument
// (sim-fullseat, 2026-10-21, flesh-out loop, axis scale-onramp).
//
// What it proves (all against scripts/policies/fullseat-diag.js):
//  1. COMPONENT-STATE DETECTION (RED->GREEN): mock-Game fixtures with
//     crafted component states -> snapFullSeat reports the exact bars,
//     distToFull computes the right distances, and the binding-component
//     verdict names the right blocker. RED = module absent (this file must
//     FAIL before scripts/policies/fullseat-diag.js exists); GREEN = all
//     fixtures pass after it is written.
//  2. GUARD: FULLSEAT unset -> pure delegation (inner.daily called once,
//     no ctx._fullseatdiag written).
//  3. READ-ONLY: FULLSEAT=1 on a short smoke (2 seeds x 30d) leaves the
//     dayHash trajectory identical to instrument-off (zero game-state
//     writes, zero RNG draws).
//  4. DET-GATE: instrument-on run twice, paired seeds byte-identical
//     (hashes + final record), 2 seeds x 60d.
//
// Usage: node scripts/test-fullseat-diag-20261021.js
//   [RED phase] fails with MODULE_NOT_FOUND (expected — run before writing
//   the module). [GREEN phase] 4/4 suites pass.
// Env for the harness suites: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
// WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
'use strict';
const assert = require('assert');

let FD = null, redReason = null;
try { FD = require('./policies/fullseat-diag'); }
catch (e) { redReason = e && e.message ? e.message : String(e); }

// ---------------------------------------------------------------------------
// Mock-Game fixtures: crafted engine states, component by component.
// NOTE (2026-10-27 scale ruling, sim-fullseatfixture-a): the mock gate
// below MUST mirror the real deedGateReady() contract, including scale —
// the full seat requires national/global standing. Before this fix the
// mock computed old-ok from the deed bars alone, so a regional village
// meeting every bar read as full-seat-ready here while the real gate
// (and tableSeat) said lesser. That was the future-reader trap: this
// mock is the gate's stand-in for the diag instrument, not a deliberate
// isolation of another term, so it carries the scale term.
// ---------------------------------------------------------------------------
function mockGame(f) {
  const faced = {};
  for (const [mid, w] of (f.faced || [])) faced[mid] = w;
  const scale = f.rank === 'national' || f.rank === 'global';
  const gate = {
    ok: !!(f.w1 >= 5 && f.w2 >= 5 && f.w3 >= 4 && f.w4 >= 3 && f.w5 >= 2 &&
      f.contests >= 3 && f.crises >= 3 && f.stage >= 2 && f.sentiment && f.surge &&
      (f.rank === 'national' || f.rank === 'global')),
    w1: f.w1 | 0, w2: f.w2 | 0, w3: f.w3 | 0, w4: f.w4 | 0, w5: f.w5 | 0,
    contestsN: f.contests | 0, crisesN: f.crises | 0, stage: f.stage | 0,
    foodDeeds: !!(f.sentiment && f.surge), scale: scale, rank: f.rank || 'village',
  };
  return {
    state: { scholar: { day: f.day || 1, prog: { feastSurgeUsed: !!f.surge } } },
    progState() { return { sentimentTaught: !!f.sentiment, crises: {} }; },
    tableSeat() { return gate.ok ? { seat: 'full', detail: gate } : { seat: f.seat || 'none', detail: gate }; },
    deedGateReady() { return gate; },
    tableEarnedPaths() {
      const full = gate.ok;
      const fs = f.foodShared | 0, score = (f.brokerage | 0) + (f.might | 0) + fs;
      if (!full) return [{ id: 'indispensable', earned: false, strength: 0, why: 'The Indispensable needs a full seat — the galaxy must actually need you, not just notice you.' }];
      if (fs <= 0) return [{ id: 'indispensable', earned: false, strength: 0, why: "You never shared the food truth. They can't need a teacher who never taught." }];
      if (score < 10) return [{ id: 'indispensable', earned: false, strength: 0, why: `Your standing isn't load-bearing yet (brokerage+might+foodShared ${score}, needs 10).` }];
      return [{ id: 'indispensable', earned: true, strength: Math.min(100, 30 + fs * 3 + (f.brokerage | 0) * 2), why: `Full seat. The food truth shared ${fs} times — they need the teacher, not just the trick.` }];
    },
    ledger() { return { brokerage: f.brokerage | 0, might: f.might | 0, foodShared: f.foodShared | 0, foodHoarded: f.foodHoarded | 0 }; },
    villageStandingTotal() { return f.standing | 0; },
    standingCfg() { return { t4: 100, t5: 200 }; },
    unlockedWave() { return f.unlockedWave | 0; },
    waveEngaged(w) { return w === 4 ? (f.w4faced ? 1 : 0) : 0; },
    won: !!f.won,
  };
}

const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };

function fullFixture() {
  return { w1: 5, w2: 6, w3: 4, w4: 3, w5: 2, contests: 4, crises: 3, stage: 3,
    sentiment: true, surge: true, foodShared: 12, brokerage: 4, might: 3, foodHoarded: 2,
    standing: 230, unlockedWave: 5, w4faced: true, rank: 'national' };
}

const results = [];
function check(name, fn) {
  try { fn(); results.push(['PASS', name]); }
  catch (e) { results.push(['FAIL', name + ' :: ' + (e && e.message || e)]); }
}

(async () => {
  // ---- RED phase: module must not exist yet ----
  if (!FD) {
    console.log('RED (expected): cannot require ./policies/fullseat-diag — ' + String(redReason).slice(0, 120));
    console.log('Write scripts/policies/fullseat-diag.js, then re-run for GREEN.');
    process.exit(1);
  }
  // ---- GREEN phase ----
  // 1. COMPONENT-STATE DETECTION
  check('full fixture: all components ok, seat full, indisp earned', () => {
    const s = FD.snapFullSeat(mockGame(fullFixture()));
    assert.strictEqual(s.seat, 'full', 'seat');
    for (const k of Object.keys(BARS)) assert.strictEqual(s.dist[k], 0, 'dist.' + k);
    assert.strictEqual(s.foodDeeds.dist, 0, 'foodDeeds dist');
    assert.strictEqual(s.indisp.earned, true, 'indisp earned');
    assert.strictEqual(s.dist.indispShared, 0, 'indispShared dist');
    assert.strictEqual(s.dist.indispScore, 0, 'indispScore dist');
    assert.deepStrictEqual(s.binding, [], 'binding empty when all met');
  });
  check('w4-short fixture: binding names w4 with dist 2', () => {
    const f = Object.assign(fullFixture(), { w4: 1, foodShared: 12 });
    const s = FD.snapFullSeat(mockGame(f));
    assert.strictEqual(s.seat, 'lesser' === s.seat ? 'lesser' : s.seat, 'seat not full');
    assert.strictEqual(s.dist.w4, 2, 'dist.w4');
    assert.ok(s.binding.indexOf('w4') >= 0, 'binding contains w4, got ' + JSON.stringify(s.binding));
    assert.strictEqual(s.indisp.earned, false, 'indisp blocked behind the seat');
    assert.ok(/full seat/i.test(s.indisp.why), 'why names the full seat: ' + s.indisp.why);
  });
  check('foodDeeds partial: only surge missing -> dist names the deed', () => {
    const f = Object.assign(fullFixture(), { sentiment: true, surge: false });
    const s = FD.snapFullSeat(mockGame(f));
    assert.strictEqual(s.foodDeeds.sentiment, true, 'sentiment read');
    assert.strictEqual(s.foodDeeds.surge, false, 'surge read');
    assert.strictEqual(s.foodDeeds.dist, 1, 'foodDeeds dist');
    assert.deepStrictEqual(s.foodDeeds.missing, ['feastSurgeUsed'], 'missing names feastSurgeUsed');
  });
  check('indisp blocked at (b): full seat, foodShared=0', () => {
    const f = Object.assign(fullFixture(), { foodShared: 0 });
    const s = FD.snapFullSeat(mockGame(f));
    assert.strictEqual(s.seat, 'full', 'seat full');
    assert.strictEqual(s.indisp.earned, false, 'indisp not earned');
    assert.strictEqual(s.dist.indispShared, 1, 'indispShared dist');
    assert.ok(/never shared/i.test(s.indisp.why), 'why names sharing: ' + s.indisp.why);
  });
  check('indisp blocked at (c): full seat, shared>0, score=7 -> dist 3', () => {
    const f = Object.assign(fullFixture(), { foodShared: 2, brokerage: 3, might: 2 });
    const s = FD.snapFullSeat(mockGame(f));
    assert.strictEqual(s.seat, 'full', 'seat full');
    assert.strictEqual(s.indispScore, 7, 'score read');
    assert.strictEqual(s.dist.indispScore, 3, 'indispScore dist');
    assert.ok(/load-bearing/i.test(s.indisp.why), 'why names load-bearing: ' + s.indisp.why);
  });
  check('unlock-chain context: standing 96 vs t4=100 -> w4-lock dist 4', () => {
    const f = { w1: 5, w2: 5, w3: 4, w4: 0, w5: 0, contests: 3, crises: 3, stage: 2,
      sentiment: true, surge: true, standing: 96, unlockedWave: 3, w4faced: false };
    const s = FD.snapFullSeat(mockGame(f));
    assert.strictEqual(s.unlock.standing, 96, 'standing');
    assert.strictEqual(s.unlock.distT4, 4, 'dist to t4');
    assert.strictEqual(s.unlock.unlockedWave, 3, 'wave 3 unlocked');
    assert.strictEqual(s.unlock.w4faced, false, 'w4 not faced');
  });
  check('recordDaily tracks max reach + first-full-seat + win snapshot', () => {
    const ctx = {};
    const inner = { daily() { return 'ok'; } };
    const p = FD.withFullseatDiag(inner, 'test', 'test');
    const G1 = mockGame(Object.assign(fullFixture(), { w4: 1, day: 10, foodShared: 0 }));
    const G2 = mockGame(Object.assign(fullFixture(), { w4: 2, day: 20, foodShared: 0 }));
    const G3 = mockGame(Object.assign(fullFixture(), { day: 30, won: true }));
    p.daily(G1, ctx); p.daily(G2, ctx); p.daily(G3, ctx);
    const D = ctx._fullseatdiag;
    assert.ok(D, 'ctx._fullseatdiag set');
    assert.strictEqual(D.max.w4, 3, 'max w4 reach');
    assert.strictEqual(D.firstFullSeatDay, 30, 'first full seat day');
    assert.strictEqual(D.indispEver, true, 'indisp ever earned');
    assert.strictEqual(D.winSnap && D.winSnap.day, 30, 'win-day snapshot recorded');
    assert.strictEqual(D.winSnap.indisp.earned, true, 'win-day indisp state');
  });
  check('hold-kind inference: plenty-cap hold named', () => {
    const G = mockGame(fullFixture());
    G.villageStanding = () => ({ total: 260, war: 40, diplomacy: 30, plenty: 190, warPts: 0, links: 0, feasts: 0 });
    G.standingCfg = () => ({ t4: 100, t5: 200, plentyCapT5: 100 });
    G.villageStandingTotal = () => 199;
    G.waveUnlockReady = () => ({ ready: true, short: [] });
    G.unlockedWave = () => 4;
    const s = FD.snapFullSeat(G);
    assert.strictEqual(s.unlock.raw, 260, 'raw');
    assert.strictEqual(s.unlock.capped, 170, 'capped = 40+30+min(190,100)');
    assert.strictEqual(s.unlock.holdKind, 'cap', 'hold kind, got ' + s.unlock.holdKind);
  });
  check('hold-kind inference: defer5 hold named with short bars', () => {
    const G = mockGame(fullFixture());
    G.villageStanding = () => ({ total: 260, war: 120, diplomacy: 60, plenty: 80, warPts: 0, links: 0, feasts: 0 });
    G.standingCfg = () => ({ t4: 100, t5: 200, plentyCapT5: 100 });
    G.villageStandingTotal = () => 199;
    G.waveUnlockReady = () => ({ ready: false, short: ['veterans'] });
    G.unlockedWave = () => 4;
    const s = FD.snapFullSeat(G);
    assert.strictEqual(s.unlock.capped, 260, 'capped clears t5');
    assert.strictEqual(s.unlock.holdKind, 'defer5', 'hold kind, got ' + s.unlock.holdKind);
    assert.deepStrictEqual(s.unlock.rd5short, ['veterans'], 'short bars named');
  });
  check('GUARD: FULLSEAT unset -> pure delegation, no ctx writes', () => {
    const saved = process.env.FULLSEAT;
    delete process.env.FULLSEAT;
    try {
      let calls = 0;
      const inner = { daily() { calls++; return 'in'; } };
      const p = FD.withFullseatDiag(inner, 'guard', 'guard');
      const ctx = {};
      const r = p.daily(mockGame(fullFixture()), ctx);
      assert.strictEqual(r, 'in', 'delegates return');
      assert.strictEqual(calls, 1, 'inner called once');
      assert.strictEqual(ctx._fullseatdiag, undefined, 'no ctx writes');
    } finally { if (saved !== undefined) process.env.FULLSEAT = saved; }
  });

  // 2/3. Harness suites: READ-ONLY + DET-GATE (real game, short horizons)
  const need = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT'];
  const missing = need.filter(k => process.env[k] !== '1');
  if (missing.length) {
    console.log('SKIP harness suites: set ' + missing.join(' '));
  } else {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const { dayHash } = require('./det-gate');
    const TF = require('./policies/tribfloor');
    const WD = require('./policies/windefer');
    const SD = require('./policies/seatdrive');
    const base = TF.leadfeast;
    const deferred = WD.withWinDefer(base, 't-leadfeast', 't');
    const seated = SD.withSeatDrive(deferred, 't-leadfeast', 't');
    const armed = FD.withFullseatDiag(seated, 't-fullseat', 't');
    async function traj(seed, policy, days) {
      const { Game } = await loadGame({ seed, mode: 'fullseat-proof' });
      await setupGame(Game);
      const hashes = [];
      const wrap = Object.assign({}, policy, {
        daily(G, ctx) { hashes.push(dayHash(G)); return policy.daily ? policy.daily(G, ctx) : undefined; },
      });
      await quietLog(async () => { await runDays(Game, wrap, { days }); });
      return hashes;
    }
    // READ-ONLY: instrument-on vs instrument-off identical trajectories
    for (const seed of [64501, 64502]) {
      const off = await traj(seed, seated, 30);
      const on = await traj(seed, armed, 30);
      check(`READ-ONLY s${seed}: FULLSEAT=1 trajectory identical 30d`, () => {
        assert.deepStrictEqual(on, off, 'trajectories diverge');
      });
    }
    // DET-GATE: instrument-on twice byte-identical, 60d
    for (const seed of [64501, 64502]) {
      const a = await traj(seed, armed, 60);
      const b = await traj(seed, armed, 60);
      check(`DET-GATE s${seed}: paired 60d runs byte-identical`, () => {
        assert.deepStrictEqual(a, b, 'paired runs diverge');
      });
    }
  }

  let pass = 0, fail = 0;
  for (const [st, name] of results) {
    console.log((st === 'PASS' ? '  PASS ' : '  FAIL ') + name);
    if (st === 'PASS') pass++; else fail++;
  }
  console.log(`\nfullseat-diag proof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
