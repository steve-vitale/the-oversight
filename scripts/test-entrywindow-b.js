#!/usr/bin/env node
// test-entrywindow-b.js — proof tests for sim-entrywindow-b (stage 1/2a).
// Pure checks (default): entry prediction (travelTo's formula +
// findWalkableEntry BFS, replicated on existing detail only),
// entry-window counts (sweep's own test), and analyzer census +
// GO/NO-GO boundaries. Live modes on NON-JUDGED seed 60109 only
// (fertrot's control seed; never a judged seed for this arm):
// --live-control runs the entrywindow driver once and asserts the
// census fields exist and the prediction comparison ran;
// --live-det runs it twice and asserts an identical census.
// The census band (60101-60108, fertrot's pilot band re-run with a
// new instrument) is never a proof-test seed. No judged pilot has
// run at the time this file is written; judged seeds are named only
// in the prereg, if one is ever frozen.
'use strict';
const assert = require('assert');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

function detailWith(cells) {
  const detail = [];
  for (let y = 0; y < 9; y++) { detail.push([]); for (let x = 0; x < 9; x++) detail[y].push('dirt'); }
  for (const [x, y, c] of cells) detail[y][x] = c;
  return detail;
}
const BLOCKS = { rock: 1, water: 1, lodge: 1 };
const cellProps = (c) => ({ blocks: !!BLOCKS[c] });

function pure() {
  const d = require('./entrywindow-b-driver');
  const { predictEntry, entryWindowCount } = d;
  check('predict: eastward trip enters at west edge, column preserved', () => {
    const detail = detailWith([]);
    // From (4,4) standing at micro (3,5), heading east to (5,4):
    // odx=1 -> wantX=0, ody=0 -> wantY=clamp(5)=5.
    assert.deepStrictEqual(predictEntry(4, 4, 3, 5, 5, 4, detail, cellProps), { x: 0, y: 5 });
  });
  check('predict: northward trip enters at south edge, row preserved', () => {
    const detail = detailWith([]);
    assert.deepStrictEqual(predictEntry(4, 4, 2, 6, 4, 3, detail, cellProps), { x: 2, y: 8 });
  });
  check('predict: diagonal trip enters at the corner', () => {
    const detail = detailWith([]);
    assert.deepStrictEqual(predictEntry(4, 4, 4, 4, 5, 5, detail, cellProps), { x: 0, y: 0 });
  });
  check('predict: blocking nominal entry falls back to BFS-nearest with exit', () => {
    // Nominal entry (0,5) is rock; (1,5) is dirt with exits.
    const detail = detailWith([[0, 5, 'rock']]);
    assert.deepStrictEqual(predictEntry(4, 4, 3, 5, 5, 4, detail, cellProps), { x: 1, y: 5 });
  });
  check('predict: null without detail (unvisited tile: no genDetail)', () => {
    assert.strictEqual(predictEntry(4, 4, 3, 5, 5, 4, null, cellProps), null);
    assert.strictEqual(predictEntry(4, 4, 3, 5, 5, 4, undefined, cellProps), null);
  });
  check('predict: pocket nominal entry with a diagonal exit stays put', () => {
    // (0,5) dirt ringed by rock on 3 sides, but (1,4)/(1,6) dirt give
    // it a diagonal exit, so hasExit passes and it is returned.
    const detail = detailWith([[0, 4, 'rock'], [0, 6, 'rock'], [1, 5, 'rock']]);
    assert.deepStrictEqual(predictEntry(4, 4, 3, 5, 5, 4, detail, cellProps), { x: 0, y: 5 });
  });
  check('window: forageable minus regrow minus scorched', () => {
    const tile = { detail: detailWith([[4, 4, 'plant'], [5, 4, 'bush'], [3, 4, 'tree'], [4, 3, 'rock']]),
      detailRegrow: { '5,4': { day: 9, was: 'bush' } } };
    const w = entryWindowCount(tile, 4, 4,
      (cx, cy) => cx === 3 && cy === 4, // tree cell scorched
      (t, cx, cy, c) => (c === 'plant' || c === 'bush') ? 'some_plant' : null);
    assert.strictEqual(w.cells, 1); // plant only: bush regrowing, tree scorched, rock not forageable
    assert.strictEqual(w.harvest, 1);
    assert.strictEqual(w.regrow, 1);
  });
  check('window: wood-only tree counts as harvest, species-less plant does not', () => {
    const tile = { detail: detailWith([[4, 4, 'tree'], [5, 4, 'plant']]), detailRegrow: {} };
    const w = entryWindowCount(tile, 4, 4, () => false, () => null);
    assert.strictEqual(w.cells, 2);
    assert.strictEqual(w.harvest, 1); // tree deadfall only; plant with no species is not taken
  });
  check('window: null without detail or micro cell', () => {
    assert.strictEqual(entryWindowCount({ detail: null }, 4, 4, () => false, () => null), null);
    assert.strictEqual(entryWindowCount({ detail: detailWith([]) }, null, null, () => false, () => null), null);
  });
  check('window: edges clip the 3x3 (no out-of-grid cells)', () => {
    const tile = { detail: detailWith([[0, 0, 'plant'], [1, 0, 'plant'], [0, 1, 'plant']]), detailRegrow: {} };
    const w = entryWindowCount(tile, 0, 0, () => false, () => 'p');
    assert.strictEqual(w.cells, 3);
    assert.strictEqual(w.harvest, 3);
  });
  check('policy: empty window +99, paying window identity, unknown identity', () => {
    const p = require('./policies/competent-entrywindow-b');
    assert.strictEqual(p.ENTRYWINDOW_PENALTY, 99);
    assert.strictEqual(p.entrywindow.id, 'competent-entrywindow-b');
    assert.strictEqual(p._adjustedDistance({ x: 4, y: 3, d: 1 }, 0), 100);
    assert.strictEqual(p._adjustedDistance({ x: 4, y: 3, d: 2 }, 3), 2);
    assert.strictEqual(p._adjustedDistance({ x: 4, y: 3, d: 2 }, null), 2);
    // Policy entry-window harvest agrees with the driver census
    // count on unscorched ground (policy omits scorch by design).
    const tile = { detail: detailWith([[4, 4, 'plant'], [5, 4, 'bush']]), detailRegrow: { '5,4': { day: 9, was: 'bush' } } };
    assert.strictEqual(p._entryWindowHarvest(tile, 4, 4, () => 'p'), 1);
    assert.strictEqual(p._entryWindowHarvest(tile, 4, 4, () => 'p'),
      entryWindowCount(tile, 4, 4, () => false, () => 'p').harvest);
    assert.deepStrictEqual(p._predictEntry(4, 4, 3, 5, 5, 4, detailWith([]), cellProps), { x: 0, y: 5 });
    assert.strictEqual(p._predictEntry(4, 4, 3, 5, 5, 4, null, cellProps), null);
  });
  const a = require('./analyze-entrywindow-b');
  const base = { failedTripDayShare: 0.67, meanDailyHaul: 600, starvationDeaths: 1, medianSurvival: 30 };
  check('compare: GO needs share -0.10 AND haul not down AND costs clean', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.57, meanDailyHaul: 600, starvationDeaths: 1, medianSurvival: 30 });
    assert.strictEqual(c.go, true);
  });
  check('compare: haul down rescues nothing', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.40, meanDailyHaul: 599.9, starvationDeaths: 0, medianSurvival: 30 });
    assert.strictEqual(c.go, false);
  });
  check('census: entry-window buckets partition attempts; ordinal split works', () => {
    const f = (ok, w, ord, match, reason) => ({ ok, preAvail: 29, entryWindow: { harvest: w, cells: w, regrow: 0 },
      attemptOrdinal: ord, travelEntryMatch: match, failReason: reason, sayDuring: [], unknownGains: [], added: [] });
    const inst = { policy: 'competent', daysAlive: 30, deaths: [], days: [
      { loopDay: 1, start: { dayTicks: 384 }, end: { dayTicks: 400 }, travels: [], tripEnd: null,
        forages: [f(true, 3, 1, true, null), f(false, 0, 2, true, 'worked_out')] },
      { loopDay: 2, start: { dayTicks: 384 }, end: { dayTicks: 400 }, travels: [], tripEnd: null,
        forages: [f(false, 0, 1, false, 'worked_out'), f(true, 5, 2, true, null)] },
    ], homecomings: [], deposits: [], donates: [] };
    const row = a.analyzeSeedEntrywindow(inst);
    assert.strictEqual(row.entrywindow.predictor.zero.attempts, 2);
    assert.strictEqual(row.entrywindow.predictor.zero.successes, 0);
    assert.strictEqual(row.entrywindow.predictor.threePlus.attempts, 2);
    assert.strictEqual(row.entrywindow.predictor.threePlus.successes, 2);
    assert.strictEqual(row.entrywindow.byOrdinal.first.attempts, 2);
    assert.strictEqual(row.entrywindow.byOrdinal.first.zeroAttempts, 1);
    assert.strictEqual(row.entrywindow.failByReason.worked_out, 2);
    assert.strictEqual(row.entrywindow.prediction.compared, 4);
    assert.strictEqual(row.entrywindow.prediction.matched, 3);
    assert.strictEqual(row.entrywindow.prediction.rate, 0.75);
  });
  console.log('pure: ' + pass + ' checks green');
}

function setCensusEnv() {
  process.env.POLICY = 'competent';
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '0'; process.env.DAYS = '30';
  process.env.SEEDS = '60109';
}

async function liveControl() {
  setCensusEnv();
  const d = require('./entrywindow-b-driver');
  const inst = await d.oneInstance(60109);
  assert.strictEqual(inst.policy, 'competent');
  assert.ok(inst.days.length >= 1, 'at least one loopDay');
  const forages = inst.days.flatMap((x) => x.forages || []);
  assert.ok(forages.length > 0, 'forage attempts recorded');
  for (const f of forages) {
    assert.ok(f.entryCell && f.entryWindow, 'every attempt carries entryCell + entryWindow');
    assert.ok(typeof f.entryWindow.harvest === 'number', 'entryWindow.harvest numeric');
  }
  const compared = forages.filter((f) => f.travelEntryMatch === true || f.travelEntryMatch === false).length;
  assert.ok(compared > 0, 'prediction compared on at least one attempt');
  const matched = forages.filter((f) => f.travelEntryMatch === true).length;
  console.log('live-control: loopDays=' + inst.days.length + ' forages=' + forages.length +
    ' predictedCompared=' + compared + ' matched=' + matched + ' end=' + inst.endReason);
}

function census(inst) {
  return JSON.stringify({
    seed: inst.seed, policy: inst.policy, loopDays: inst.days.length,
    forages: inst.days.map((x) => (x.forages || []).map((f) => [
      f.ok ? 1 : 0, f.entryCell, f.entryWindow, f.failReason, f.travelEntryMatch]).join('|')),
    travels: inst.days.map((x) => (x.travels || []).map((t) => [
      t.from, t.to, t.moved, t.predictedEntry, t.actualEntry, t.entryMatch]).join('|')),
    homecomings: inst.homecomings.length,
    daysAlive: inst.daysAlive, endReason: inst.endReason,
  });
}

async function liveDet() {
  setCensusEnv();
  const d = require('./entrywindow-b-driver');
  const a = await d.oneInstance(60109);
  const b = await d.oneInstance(60109);
  assert.strictEqual(census(a), census(b), 'identical census across runs');
  console.log('live-det: identical census, loopDays=' + a.days.length);
}

async function main() {
  if (process.argv.includes('--live-control')) await liveControl();
  else if (process.argv.includes('--live-det')) await liveDet();
  else pure();
  if (process.exitCode !== 1) console.log('test-entrywindow-b: GREEN');
}
if (require.main === module) main().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
