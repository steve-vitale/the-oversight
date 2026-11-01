#!/usr/bin/env node
// test-fertrot-b.js — proof tests for sim-fertrot-b.
// Pure checks (default): fertility-signal math (availableCells count,
// barren +99 / fertile -1 / unknown identity), menu reweighting (fresh
// objects, barren sorts last, fertile sorts first), and analyzer
// GO/NO-GO boundaries. Live modes on NON-JUDGED seed 60109 only
// (never a judged seed): --live-control runs the fertrot driver once
// and asserts the rule actually engaged; --live-det runs it twice and
// asserts an identical census. Judged seeds are 60101-60108; control
// 60109 and confirm reserve 60121-60132 are never judged by this file.
'use strict';
const assert = require('assert');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

function pure() {
  const p = require('./policies/competent-fertrot-b');
  const { _availableCells, _adjustedDistance, _adjustedTargets, _tileKey } = p;
  const tileWith = (cells, regrow) => {
    const detail = [];
    for (let y = 0; y < 9; y++) { detail.push([]); for (let x = 0; x < 9; x++) detail[y].push('dirt'); }
    for (const [x, y, c] of cells) detail[y][x] = c;
    return { detail, detailRegrow: regrow || {} };
  };
  check('avail: forageable cells minus regrowing ones', () => {
    const t = tileWith([[0, 0, 'plant'], [1, 0, 'bush'], [2, 0, 'tree'], [3, 0, 'rock']], { '1,0': { day: 9, was: 'bush' } });
    assert.strictEqual(_availableCells(t), 2); // plant + tree; bush regrowing, rock not forageable
    assert.strictEqual(_availableCells({ detail: null }), null);
    assert.strictEqual(_availableCells({}), null);
    assert.strictEqual(_availableCells(tileWith([], {})), 0);
  });
  check('distance: barren +99, fertile -1, thin/unknown identity', () => {
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 1 }, 0), 100);
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 2 }, 6), 1);
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 2 }, 12), 1);
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 2 }, 5), 2);
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 2 }, 1), 2);
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 2 }, null), 2);
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 2 }, undefined), 2);
  });
  check('menu: fresh objects out, barren sorts last, fertile first, unknown untouched', () => {
    const avail = { [_tileKey(4, 3)]: 0, [_tileKey(5, 3)]: 8, [_tileKey(6, 3)]: 3 };
    const menu = [{ x: 4, y: 3, d: 1 }, { x: 5, y: 3, d: 2 }, { x: 6, y: 3, d: 3 }, { x: 7, y: 3, d: 4 }];
    const adj = _adjustedTargets(menu, avail);
    assert.notStrictEqual(adj[0], menu[0]);
    assert.strictEqual(menu[0].d, 1); // input untouched
    assert.strictEqual(adj[0].d, 100); // barren
    assert.strictEqual(adj[1].d, 1); // fertile 8 -> 2-1
    assert.strictEqual(adj[2].d, 3); // thin unchanged
    assert.strictEqual(adj[3].d, 4); // unknown untouched
    const sorted = adj.slice().sort((a, b) => a.d - b.d);
    assert.strictEqual(sorted[0].x, 5); // fertile first
    assert.strictEqual(sorted[sorted.length - 1].x, 4); // barren last
  });
  check('policy exports frozen constants', () => {
    assert.strictEqual(p.FERTROT_PENALTY, 99);
    assert.strictEqual(p.FERTROT_BONUS, 1);
    assert.strictEqual(p.FERTROT_FERTILE_MIN, 6);
    assert.strictEqual(p.fertrot.id, 'competent-fertrot-b');
  });
  const a = require('./analyze-fertrot-b');
  const base = { failedTripDayShare: 0.67, meanDailyHaul: 600, starvationDeaths: 1, medianSurvival: 30 };
  check('compare: GO needs share -0.10 AND haul not down AND costs clean', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.57, meanDailyHaul: 600, starvationDeaths: 1, medianSurvival: 30 });
    assert.strictEqual(c.go, true);
    assert.strictEqual(c.shareDelta, -0.1);
  });
  check('compare: share miss by a point is NO-GO', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.58, meanDailyHaul: 900, starvationDeaths: 0, medianSurvival: 30 });
    assert.strictEqual(c.go, false);
  });
  check('compare: haul down rescues nothing', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.40, meanDailyHaul: 599.9, starvationDeaths: 0, medianSurvival: 30 });
    assert.strictEqual(c.go, false);
  });
  check('compare: cost miss blocks GO', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.40, meanDailyHaul: 900, starvationDeaths: 3, medianSurvival: 30 });
    assert.strictEqual(c.go, false);
    const c2 = a.compareBands(base, { failedTripDayShare: 0.40, meanDailyHaul: 900, starvationDeaths: 1, medianSurvival: 20 });
    assert.strictEqual(c2.go, false);
  });
  check('predictor census: real analyzer buckets partition attempts', () => {
    const f = (ok, preAvail) => ({ ok, preAvail, sayDuring: [], unknownGains: [], added: [] });
    const inst = { policy: 'competent', daysAlive: 30, deaths: [], days: [
      { loopDay: 1, start: { dayTicks: 384 }, end: { dayTicks: 400 }, travels: [], tripEnd: null,
        forages: [f(true, 0), f(false, 0), f(true, 8)],
        fertrot: { forageAttempts: 3, penalizedMenus: 1, barrenTiles: 1, fertileTiles: 1, visitedTiles: 2 } },
      { loopDay: 2, start: { dayTicks: 384 }, end: { dayTicks: 400 }, travels: [], tripEnd: null,
        forages: [f(false, 3), f(true, null)],
        fertrot: { forageAttempts: 2, penalizedMenus: 0, barrenTiles: 0, fertileTiles: 0, visitedTiles: 3 } },
    ], homecomings: [], deposits: [], donates: [] };
    const row = a.analyzeSeedFertrot(inst);
    assert.strictEqual(row.predictor.zero.attempts, 2); assert.strictEqual(row.predictor.zero.successes, 1);
    assert.strictEqual(row.predictor.fertile.attempts, 1); assert.strictEqual(row.predictor.fertile.successes, 1);
    assert.strictEqual(row.predictor.few.attempts, 1); assert.strictEqual(row.predictor.unknown.attempts, 1);
    assert.strictEqual(row.fertrot.forageAttempts, 5);
    assert.strictEqual(row.fertrot.barrenTiles, 1); assert.strictEqual(row.fertrot.fertileTiles, 1);
    assert.strictEqual(row.fertrot.visitedTiles, 3);
  });
  console.log('pure: ' + pass + ' checks green');
}

async function liveControl() {
  process.env.POLICY = 'competent-fertrot-b';
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '0'; process.env.DAYS = '30';
  process.env.SEEDS = '60109';
  const d = require('./fertrot-b-driver');
  const inst = await d.oneInstance(51909);
  assert.strictEqual(inst.policy, 'competent-fertrot-b');
  assert.ok(inst.days.length >= 1, 'at least one loopDay');
  const daysWithPatch = inst.days.filter((x) => x.fertrot);
  assert.ok(daysWithPatch.length > 0, 'fertrot day records present');
  const visited = Math.max(0, ...inst.days.map((x) => (x.fertrot || {}).visitedTiles || 0));
  assert.ok(visited > 0, 'fertrot visited map engaged (visitedTiles > 0)');
  const forages = inst.days.reduce((t, x) => t + (x.forages || []).length, 0);
  assert.ok(forages > 0, 'forage attempts recorded');
  console.log('live-control: loopDays=' + inst.days.length + ' forages=' + forages +
    ' visitedTiles=' + visited + ' end=' + inst.endReason);
}

function census(inst) {
  return JSON.stringify({
    seed: inst.seed, policy: inst.policy, loopDays: inst.days.length,
    forages: inst.days.map((x) => [(x.forages || []).map((f) => (f.ok ? 1 : 0)).join('')]),
    homecomings: inst.homecomings.length,
    daysAlive: inst.daysAlive, endReason: inst.endReason,
  });
}

async function liveDet() {
  process.env.POLICY = 'competent-fertrot-b';
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '0'; process.env.DAYS = '30';
  process.env.SEEDS = '60109';
  const d = require('./fertrot-b-driver');
  const a = await d.oneInstance(60109);
  const b = await d.oneInstance(60109);
  assert.strictEqual(census(a), census(b), 'identical census across runs');
  console.log('live-det: identical census, loopDays=' + a.days.length);
}

async function main() {
  if (process.argv.includes('--live-control')) await liveControl();
  else if (process.argv.includes('--live-det')) await liveDet();
  else pure();
  if (process.exitCode !== 1) console.log('test-fertrot-b: GREEN');
}
if (require.main === module) main().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
