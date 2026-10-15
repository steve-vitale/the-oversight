#!/usr/bin/env node
'use strict';
// test-seatdrive-20261015.js — proof for the seat-taking driver
// (flesh-out loop ARM 3, 2026-10-15, sim-seatdrive).
//
// scripts/policies/seatdrive.js is the missing DRIVER the wincensus named:
// on current master the table sits only via tableTakeSeat() (Steve
// 2026-10-14), and no courtship-road policy calls it — so the landed
// win-side layers (winpursuit drain + windefer discipline) operate on a
// modal that never exists (15/16 invitations, 0 sittings, wins 0/16).
//
// REAL-RED: constructed invited-but-unseated fixtures against the REAL
// engine (no stubs — tablePreview/tableTakeSeat/tableScene all run):
//   D1 gate-off: the wrapped policy's daily takes NO seat (the census
//      finding, reproduced in-fixture). The seat-taken assertion FAILS
//      here — that failure is the RED.
//   D2 gate-on: SEATDRIVE=1 on the same fixture construction -> the seat
//      IS taken (sdSeatTaken=1, tableDone set, the paths modal pending
//      for the drain). GREEN.
// Guard classification (#294): exiled and joinedVillage fixtures ->
// sdGuardRefused=1, sdSeatAttempts=0, no sitting. Scholar-dead fixture ->
// sdNoScholar=1, no attempt. None of these count as failed attempts.
// Det-gate: 16/16 identical day-hash trajectories (8 seeds x
// {leadfeast,belongfeast}, 60d) between the seatdrive-wrapped stack with
// SEATDRIVE unset and the identical composition without the wrapper —
// gate-off purity.
// SMOKE: one 20d armed run — layer-live markers honest, run completes.
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-seatdrive-20261015.js
//   SEEDS="11,22" DAYS=20 node scripts/test-seatdrive-20261015.js   # targeted det-gate
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---------- fixture ----------
// An invited-but-unseated village, constructed through real state (not
// stubs): day 95 (past the win-day floor), a lesser seat priced by the
// real tableSeat() (waves faced 4/4/3 distinct, 2 contests, 2 crises,
// regional via networkLive, integration stage 2, the food-thesis deeds),
// tableWaiting set exactly as the dawn announcer leaves it. The validity
// gate asserts tablePreview().ready before any layer assertion — a fixture
// that cannot produce a sitting is a dead test, and we fail loudly.
async function invitedFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'seatdrive-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.day = 95;
  Game.state.systemArrived = true;
  s.integration = 50; // stage 2: neural creep
  Game.state.networkLive = true; // scaleRank() -> regional
  const pg = Game.progState();
  const deeds = Game.deedState();
  deeds.wavesFaced = { w1a: 1, w1b: 1, w1c: 1, w1d: 1, w2a: 2, w2b: 2, w2c: 2, w2d: 2, w3a: 3, w3b: 3, w3c: 3 };
  deeds.contestsSurvived = 2;
  pg.crises = { c1: 1, c2: 1 };
  pg.sentimentTaught = true;
  // NOTE: mutate s.prog in place — progState() returns s.prog by identity,
  // so replacing the object would orphan the pg reference above.
  s.prog = s.prog || {};
  s.prog.feastSurgeUsed = true;
  pg.tableDone = false;
  pg.tableWaiting = true;
  return Game;
}

function previewReady(Game) {
  try {
    const pv = Game.tablePreview();
    return !!(pv && pv.ready);
  } catch (e) { return false; }
}

function seatTakenNow(Game) {
  try { return !!(Game.progState() || {}).tableDone; } catch (e) { return false; }
}

function modalPending(Game) {
  try {
    const tc = (Game.state.scholar || {}).tableChoices;
    return !!(tc && tc.options && tc.options.length);
  } catch (e) { return false; }
}

function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) { saved[k] = process.env[k]; }
  try {
    for (const [k, v] of Object.entries(vars)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    return fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' };

async function main() {
  console.log('== seatdrive proof ==');

  // ----- fixture validity gate (fail loudly, never vacuous) -----
  {
    const Game = await invitedFixture(11);
    const pv = Game.tablePreview();
    ok('fixture: tablePreview().ready on the constructed invite', previewReady(Game),
      'preview=' + JSON.stringify(pv));
    ok('fixture: seat priced lesser by the real tableSeat()', pv && pv.seat === 'lesser',
      'seat=' + (pv && pv.seat));
    ok('fixture: scholar alive, gate passes on the base fixture',
      SD.scholarAlive(Game) && SD.canPropose(Game), '');
  }

  // ----- D1: gate OFF — the wrapped daily takes no seat (the RED) -----
  {
    const Game = await invitedFixture(22);
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: undefined }), async () => {
      const ctx = {};
      await quietLog(async () => { SD.leadseat.daily(Game, ctx); });
      ok('D1 gate-off: no sitting without the layer (tableDone stays false)', !seatTakenNow(Game), '');
      ok('D1 gate-off: no table modal pending', !modalPending(Game), '');
      ok('D1 gate-off: no seat counters fire', !(ctx.sdSeatTaken || ctx.sdSeatAttempts || ctx.sdPreviewSeen), JSON.stringify(ctx));
      // The seat-taken assertion FAILS on the unwrapped chain — the RED.
      ok('D1 RED: seat-taken assertion fails without the driver', (ctx.sdSeatTaken | 0) !== 1, '');
    });
  }

  // ----- D2: gate ON — the seat is taken (the GREEN) -----
  {
    const Game = await invitedFixture(22);
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: '1' }), async () => {
      const ctx = {};
      await quietLog(async () => { SD.leadseat.daily(Game, ctx); });
      ok('D2 gate-on: the seat is taken (tableDone set)', seatTakenNow(Game), '');
      ok('D2 gate-on: sdSeatTaken=1, exactly one attempt', (ctx.sdSeatTaken | 0) === 1 && (ctx.sdSeatAttempts | 0) === 1,
        JSON.stringify({ t: ctx.sdSeatTaken, a: ctx.sdSeatAttempts, f: ctx.sdSeatFailed }));
      ok('D2 gate-on: kind recorded from the real preview', ctx.sdSeatKind === 'lesser', 'kind=' + ctx.sdSeatKind);
      // The drain owns the modal: by the end of the wrapped daily the
      // windefer daily has already drained it (the design — seat first,
      // then the landed layers drive). What the layer must prove is that
      // a REAL modal existed for the drain: tableAnswers >= 1.
      ok('D2 gate-on: the landed drain engaged the real modal (tableAnswers>=1)', (ctx.tableAnswers | 0) >= 1,
        'answers=' + ctx.tableAnswers + ' won=' + !!Game.won);
      ok('D2 gate-on: no guard refusal, no failure', !(ctx.sdGuardRefused || ctx.sdSeatFailed), '');
    });
  }

  // ----- guard classification (#294): exiled -----
  {
    const Game = await invitedFixture(33);
    Game.state.scholar.exiled = true;
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: '1' }), async () => {
      const ctx = {};
      await quietLog(async () => { SD.driveSeat(Game, ctx); });
      ok('guard/exiled: refusal classified (sdGuardRefused=1)', (ctx.sdGuardRefused | 0) === 1,
        JSON.stringify({ g: ctx.sdGuardRefused, a: ctx.sdSeatAttempts }));
      ok('guard/exiled: no attempt counted', (ctx.sdSeatAttempts | 0) === 0, '');
      ok('guard/exiled: no sitting', !seatTakenNow(Game) && !(ctx.sdSeatTaken | 0), '');
    });
  }

  // ----- guard classification (#294): joined another fire -----
  {
    const Game = await invitedFixture(33);
    Game.state.scholar.joinedVillage = 'somewhere-else';
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: '1' }), async () => {
      const ctx = {};
      await quietLog(async () => { SD.driveSeat(Game, ctx); });
      ok('guard/joined: refusal classified (sdGuardRefused=1)', (ctx.sdGuardRefused | 0) === 1, '');
      ok('guard/joined: no attempt counted', (ctx.sdSeatAttempts | 0) === 0, '');
      ok('guard/joined: no sitting', !seatTakenNow(Game) && !(ctx.sdSeatTaken | 0), '');
    });
  }

  // ----- scholar-dead precondition -----
  {
    const Game = await invitedFixture(33);
    const sid = Game.villagerId;
    const p = sid && typeof Game.getPerson === 'function' ? Game.getPerson(sid) : null;
    if (p) p.dead = true;
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: '1' }), async () => {
      const ctx = {};
      await quietLog(async () => { SD.driveSeat(Game, ctx); });
      ok('dead-scholar: precondition fires (sdNoScholar=1)', (ctx.sdNoScholar | 0) === (p ? 1 : 0),
        'sid=' + sid);
      ok('dead-scholar: no attempt counted', (ctx.sdSeatAttempts | 0) === 0, '');
      ok('dead-scholar: no sitting', !seatTakenNow(Game) && !(ctx.sdSeatTaken | 0), '');
    });
  }

  // ----- layerOn honesty -----
  {
    withEnv({ SEATDRIVE: '1' }, () => ok('layerOn true when SEATDRIVE=1', SD.layerOn() === true, ''));
    withEnv({ SEATDRIVE: undefined }, () => ok('layerOn false when unset', SD.layerOn() === false, ''));
  }

  // ----- det-gate: gate-off purity, 16/16 identical trajectories -----
  {
    const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [11, 22, 33, 44, 55, 66, 77, 88]).filter(Number.isFinite);
    const DAYS = parseInt(process.env.DAYS || '60', 10);
    const PIDS = ['leadfeast', 'belongfeast'];
    const naked = (pid) => pid === 'leadfeast'
      ? WD.withWinDefer(TF.leadfeast, 'leadfeast-windefer', 'det-gate naked')
      : WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'det-gate naked');
    const wrapped = (pid) => pid === 'leadfeast' ? SD.leadseat : SD.belongseat;
    async function hashesFor(seed, policy) {
      const { Game } = await loadGame({ seed, mode: 'seatdrive-detgate' });
      await setupGame(Game);
      const hashes = [];
      const w = Object.assign({}, policy);
      const base = policy.daily;
      w.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
        return base ? base(G, ctx) : undefined;
      };
      const r = await quietLog(async () => runDays(Game, w, { days: DAYS, sampleEvery: 1 }));
      return { hashes, days: r.days, endReason: r.endReason };
    }
    let det = 0, detFails = [];
    for (const pid of PIDS) {
      for (const seed of SEEDS) {
        const a = await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: undefined }), () => hashesFor(seed, wrapped(pid)));
        const b = await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: undefined }), () => hashesFor(seed, naked(pid)));
        const sameLen = a.hashes.length === b.hashes.length;
        const same = sameLen && a.hashes.every((h, i) => h === b.hashes[i]);
        if (same) { det++; }
        else detFails.push(`${pid} s${seed}: len ${a.hashes.length} vs ${b.hashes.length}`);
      }
    }
    ok(`det-gate: ${det}/16 identical gate-off trajectories`, detFails.length === 0, detFails.join('; ').slice(0, 200));
  }

  // ----- SMOKE: one 20d armed run, markers honest -----
  {
    const { Game } = await loadGame({ seed: 11, mode: 'seatdrive-smoke' });
    await setupGame(Game);
    let ctxLive = null, seatLive = null;
    const base = SD.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { ctxLive = ctx; seatLive = SD.layerOn(); if (oSetup) return oSetup(G, ctx); };
    let smokeResult = null;
    await withEnv(Object.assign({}, SUBSTRATE, { SEATDRIVE: '1' }), async () => {
      await quietLog(async () => { smokeResult = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    });
    ok('SMOKE: layer-live marker honest (SEATDRIVE=1)', seatLive === true, '');
    // The harness ran its full iteration budget without crashing; scholar-day
    // advances slower than 1:1 early (gameDays=14 at days=20 is normal).
    ok('SMOKE: run completes its 20 iterations', !!(smokeResult && smokeResult.days >= 20),
      'days=' + (smokeResult && smokeResult.days));
  }

  console.log(`\nseatdrive proof: ${pass} pass, ${fail} fail`);
  if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); process.exit(1); }
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
