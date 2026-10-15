#!/usr/bin/env node
// scripts/test-wintrace-20261015.js — proof for the wintrace diagnostic
// instrument (sim-wintrace, sim-findings #233).
//
// PHASE A — RED (the gap the instrument fills, on shipped code):
//   A1: attribute() on a traceless ctx (layer off/deleted) cannot attribute
//       anything: traced=false, verdict='unknown'. The diagnostic is
//       impossible without the instrument.
//   A2: the sit-episode counting is load-bearing: the full defer→re-offer→
//       win walk, viewed through a trace that MISSED the re-offer (rows cut
//       at day 80 — the naive-instrument failure mode), misattributes as
//       'deferred-died' instead of 'WIN'. A counter without episodes lies.
// PHASE B — GREEN (shipped instrument, synthetic table walks):
//   B1: full defer→re-offer→win walk → 'WIN', sitEpisodes=2, chain complete.
//   B2: died mid-challenge → 'finale-died'.
//   B3: 180d, table never invited → 'never-sat'.
//   B4: invitation consumed, seat none → 'sat-withdrawn'.
//   B5: deferred, alive at 180, winDeferred still set → 'deferral-reoffer-missed'.
//   B6: deferred, re-offered, died in the second walk → 'reoffer-died'.
// PHASE C — real-sim honesty (short horizons, seed 11):
//   C1: WINTRAZE unset → no trace recorded (gate-off purity).
//   C2: traced vs untraced 30d day-hashes identical (read-only instrument).
//   C3: layerOn() honest on env; policyForRun() resolves both roads.
//
// Usage: node scripts/test-wintrace-20261015.js
'use strict';
const WT = require('./policies/wintrace');

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; fails.push(name); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- fake Game: scripted table walks ----------
// Sparse [day, state] entries; fill() carries each forward to endDay.
function fill(sparse, endDay) {
  const map = {};
  let cur = { arc: 3 };
  let si = 0;
  for (let d = 1; d <= endDay; d++) {
    while (si < sparse.length && sparse[si][0] === d) { cur = Object.assign({}, cur, sparse[si][1]); si++; }
    map[d] = Object.assign({}, cur);
  }
  return map;
}
function fakeGame(rows) {
  let cur = rows[1] || { arc: 3 };
  const G = {
    state: { scholar: { day: 1, tableChoices: null }, village: {} },
    setDay(d) {
      cur = rows[d] || cur;
      G.state.scholar.day = d;
      G.state.scholar.tableChoices = cur.modal ? { frame: 'the Table', options: [{ id: 'x', label: 'x' }] } : null;
    },
    progState() { return { tableWaiting: !!cur.waiting, tableDone: !!cur.done, arc: cur.arc || 3 }; },
    tableState() {
      return { phase: cur.phase || '', path: cur.path || '', beat: cur.beat || 0,
        branch: cur.branch || '', winDeferred: !!cur.winDeferred,
        weakened: cur.weakened || 0, seat: cur.seat || '' };
    },
    tableSeat() { return { seat: cur.pricedSeat || 'none', detail: {} }; },
    tableEarnedPaths() { return (cur.paths || []).map(p => ({ id: p, earned: true, strength: 50, why: 'earned in-walk' })); },
    tableActive() { return !!(cur.done && cur.phase && cur.phase !== 'done'); },
    winDayFloorOk() { return G.state.scholar.day >= 90; },
  };
  return G;
}
function driveWalk(sparse, endDay) {
  const rows = fill(sparse, endDay);
  const G = fakeGame(rows);
  const ctx = {};
  for (let d = 1; d <= endDay; d++) {
    G.setDay(d);
    WT.sampleDay(G, ctx, 'pre');
    WT.sampleDay(G, ctx, 'post');
  }
  return { G, ctx };
}
const FEARED3 = ['feared', 'witness', 'relay'];

function walkFullWin() {
  return driveWalk([
    [60, { waiting: true, pricedSeat: 'lesser', arc: 4 }],
    [61, { waiting: false, done: true, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true, arc: 4 }],
    [62, { done: true, phase: 'challenge', path: 'feared', beat: 0, modal: true }],
    [63, { done: true, phase: 'finals', path: 'feared', modal: true }],
    [64, { done: false, waiting: true, winDeferred: true, phase: 'paths', modal: false }],
    [90, { done: true, waiting: false, winDeferred: false, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true }],
    [91, { done: true, phase: 'challenge', path: 'assimilated', beat: 1, modal: true }],
    [92, { done: true, phase: 'finals', path: 'assimilated', modal: true }],
    [93, { done: true, phase: 'done', path: 'assimilated', modal: false }],
  ], 93);
}

// ---------- PHASE A: RED ----------
console.log('PHASE A — RED (the gap, on shipped code)');
{
  // A1: no trace, no attribution.
  const att = WT.attribute({}, {}, { won: false, gameDays: 180, endReason: 'horizon' });
  check('A1 traceless ctx is unattributable', att.traced === false && att.verdict === 'unknown',
    JSON.stringify({ traced: att.traced, verdict: att.verdict }));
}
{
  // A2: the naive-instrument failure mode — a trace that missed the
  // re-offer misattributes the win walk as 'deferred-died'.
  const { ctx } = walkFullWin();
  ctx._wintrace.rows = ctx._wintrace.rows.filter(r => r.day <= 80);
  // recompute episode state as the naive instrument would see it
  ctx._wintrace.sitEpisodes = 1;
  const att = WT.attribute({}, ctx, { won: false, gameDays: 80, endReason: 'village-lost' });
  check('A2 truncated trace misattributes (deferred-died, not WIN)',
    att.verdict === 'deferred-died', `verdict=${att.verdict}`);
}

// ---------- PHASE B: GREEN ----------
console.log('PHASE B — GREEN (shipped instrument, synthetic walks)');
{
  const { ctx } = walkFullWin();
  const att = WT.attribute({}, ctx, { won: true, gameDays: 93, endReason: 'won' });
  check('B1 full defer→re-offer→win walk attributes WIN', att.verdict === 'WIN', `verdict=${att.verdict}`);
  check('B1 sit episodes counted (2)', att.sitEpisodes === 2, `episodes=${att.sitEpisodes}`);
  check('B1 defer window recorded (starts d64, spans to re-offer)',
    att.deferDays[0] === 64 && att.deferDays[att.deferDays.length - 1] === 89,
    `defer=${att.deferDays[0]}..${att.deferDays[att.deferDays.length - 1]}`);
  check('B1 paths qualified (3)', att.pathsCount === 3 && att.pathsQualified.join(',') === 'feared,witness,relay',
    `paths=${att.pathsQualified.join(',')}`);
  check('B1 paths entered (feared→assimilated)', att.pathsEntered.join(',') === 'feared,assimilated',
    `entered=${att.pathsEntered.join(',')}`);
  check('B1 seat first (lesser)', att.seatFirst === 'lesser', `seat=${att.seatFirst}`);
  check('B1 finals seen', att.finalsSeen === true);
}
{
  const { ctx } = driveWalk([
    [61, { waiting: false, done: true, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true, arc: 4 }],
    [62, { done: true, phase: 'challenge', path: 'feared', beat: 0, modal: true }],
    [63, { done: true, phase: 'challenge', path: 'feared', beat: 1, modal: true }],
  ], 70);
  const att = WT.attribute({}, ctx, { won: false, gameDays: 70, endReason: 'village-lost' });
  check('B2 finale-died', att.verdict === 'finale-died', `verdict=${att.verdict}`);
  check('B2 evidence names phase+path', /challenge/.test(att.evidence.join(' ')) && /feared/.test(att.evidence.join(' ')));
}
{
  const { ctx } = driveWalk([], 180);
  const att = WT.attribute({}, ctx, { won: false, gameDays: 180, endReason: 'horizon' });
  check('B3 never-sat', att.verdict === 'never-sat', `verdict=${att.verdict}`);
}
{
  // B7: horizon survivor with the finale still open — stalled, not died.
  const { ctx } = driveWalk([
    [60, { waiting: true, pricedSeat: 'lesser', arc: 4 }],
    [61, { waiting: false, done: true, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true, arc: 4 }],
    [62, { done: true, phase: 'challenge', path: 'feared', beat: 0, modal: true }],
    [63, { done: true, phase: 'finals', path: 'feared', modal: true }],
  ], 180);
  const att = WT.attribute({}, ctx, { won: false, gameDays: 180, endReason: 'survived' });
  check('B7 horizon survivor, finale open → sequence-stalled (not finale-died)', att.verdict === 'sequence-stalled', `verdict=${att.verdict}`);
}
{
  // B8: ended run with the finale live — died, not stalled.
  const { ctx } = driveWalk([
    [60, { waiting: true, pricedSeat: 'lesser', arc: 4 }],
    [61, { waiting: false, done: true, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true, arc: 4 }],
    [62, { done: true, phase: 'challenge', path: 'feared', beat: 0, modal: true }],
    [63, { done: true, phase: 'finals', path: 'feared', modal: true }],
  ], 100);
  const att = WT.attribute({}, ctx, { won: false, gameDays: 100, endReason: 'village-lost' });
  check('B8 ended run, finale live → finale-died', att.verdict === 'finale-died', `verdict=${att.verdict}`);
}
{
  const { ctx } = driveWalk([
    [100, { waiting: true, pricedSeat: 'none', arc: 4 }],
    [101, { waiting: false, arc: 4 }],
  ], 110);
  const att = WT.attribute({}, ctx, { won: false, gameDays: 110, endReason: 'village-lost' });
  check('B4 sat-withdrawn', att.verdict === 'sat-withdrawn', `verdict=${att.verdict} seat=${att.seatFirst}`);
}
{
  const { ctx } = driveWalk([
    [60, { waiting: true, pricedSeat: 'lesser', arc: 4 }],
    [61, { waiting: false, done: true, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true, arc: 4 }],
    [62, { done: true, phase: 'challenge', path: 'feared', beat: 0, modal: true }],
    [63, { done: true, phase: 'finals', path: 'feared', modal: true }],
    [64, { done: false, waiting: true, winDeferred: true, phase: 'paths', modal: false }],
  ], 180);
  const att = WT.attribute({}, ctx, { won: false, gameDays: 180, endReason: 'horizon' });
  check('B5 deferral-reoffer-missed', att.verdict === 'deferral-reoffer-missed', `verdict=${att.verdict}`);
}
{
  const { ctx } = driveWalk([
    [60, { waiting: true, pricedSeat: 'lesser', arc: 4 }],
    [61, { waiting: false, done: true, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true, arc: 4 }],
    [62, { done: true, phase: 'challenge', path: 'feared', beat: 0, modal: true }],
    [63, { done: true, phase: 'finals', path: 'feared', modal: true }],
    [64, { done: false, waiting: true, winDeferred: true, phase: 'paths', modal: false }],
    [90, { done: true, waiting: false, winDeferred: false, phase: 'paths', seat: 'lesser', paths: FEARED3, modal: true }],
    [91, { done: true, phase: 'challenge', path: 'assimilated', beat: 1, modal: true }],
  ], 100);
  const att = WT.attribute({}, ctx, { won: false, gameDays: 100, endReason: 'village-lost' });
  check('B6 reoffer-died', att.verdict === 'reoffer-died', `verdict=${att.verdict}`);
}

// ---------- PHASE C: real-sim honesty ----------
console.log('PHASE C — real-sim honesty (seed 11)');
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const FS = require('./policies/feastscale');

  async function hashes(policy, days) {
    const { Game } = await loadGame({ seed: 11, mode: 'wintrace-proof', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hs.push(G.state.scholar.day + ':' + dayHash(G)); return base ? base(G, ctx) : undefined; };
    let runCtx = null;
    const oSetup = policy.setup;
    wrapped.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 30 }); });
    return { hs, runCtx };
  }

  // C1: gate-off purity.
  delete process.env.WINTRAZE;
  {
    const { runCtx } = await hashes(FS.belongfeast, 15);
    check('C1 gate-off records no trace', runCtx && runCtx._wintrace === undefined,
      `_wintrace=${runCtx && typeof runCtx._wintrace}`);
  }
  // C2: read-only — traced vs untraced identical.
  let untraced = null, traced = null;
  {
    delete process.env.WINTRAZE;
    untraced = await hashes(FS.belongfeast, 30);
    process.env.WINTRAZE = '1';
    const wrapped = WT.withWinTrace(FS.belongfeast, 'belongfeast-wintrace', 'proof');
    traced = await hashes(wrapped, 30);
    delete process.env.WINTRAZE;
    const same = untraced.hs.length === traced.hs.length &&
      untraced.hs.every((h, i) => h === traced.hs[i]);
    check('C2 traced vs untraced day-hashes identical (30d)',
      same, `lengths ${untraced.hs.length}/${traced.hs.length}`);
    check('C2 traced run recorded rows', traced.runCtx && traced.runCtx._wintrace && traced.runCtx._wintrace.rows.length > 0,
      `rows=${traced.runCtx && traced.runCtx._wintrace && traced.runCtx._wintrace.rows.length}`);
  }
  // C3: env honesty + road resolution.
  {
    delete process.env.WINTRAZE;
    check('C3 layerOn false when unset', WT.layerOn() === false);
    process.env.WINTRAZE = '1';
    check('C3 layerOn true when set', WT.layerOn() === true);
    delete process.env.WINTRAZE;
    process.env.POLICY = 'leadfeast';
    check('C3 policyForRun lead', WT.policyForRun() === FS.leadfeast);
    process.env.POLICY = 'belongseek';
    check('C3 policyForRun belong', WT.policyForRun() === FS.belongfeast);
    delete process.env.POLICY;
  }

  console.log(`\nproof wintrace: ${pass} pass, ${fail} fail${fail ? ' — FAILED: ' + fails.join(', ') : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
