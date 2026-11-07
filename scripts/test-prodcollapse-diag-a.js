#!/usr/bin/env node
// test-prodcollapse-diag-a.js — proof for the prodcollapse-a diagnosis instruments.
// Legs: guard refusals (seeds/days/env), oneRun structure (incl. the NEW collapse
// fields: meal-row production factors, snapshot ground/season/labor, flow vigor/hunt),
// determinism (G1 smoke), bare-vs-recorded fingerprint equality (G2 smoke),
// analyzer runs on a 5-day corpus, episode-detector unit test on synthetic corpora,
// flow accounting residual stays small.
// Uses seed 96201 at 5 days only (smoke scale); the judged 8-seed 150d corpus
// is produced by the sweep, not by this test.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const SWEEP = path.join(__dirname, 'sweep-prodcollapse-diag-a.js');
const ANALYZE = path.join(__dirname, 'analyze-prodcollapse-diag-a.js');
const TMP = path.join('/tmp', 'prodcollapse-diag-a-test-' + process.pid);

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
function runSweep(env, expectCode) {
  const r = cp.spawnSync(process.execPath, [SWEEP], {
    env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 60000,
  });
  return r.status;
}

(async () => {
  // L1-L3: guard refusals (spawned; each must exit 2 without running sims).
  leg('L1 bad seeds refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '1,2,3', DAYS: '150' }), 2);
  });
  leg('L2 bad days refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '96201,96202,96203,96204,96205,96206,96207,96208', DAYS: '100' }), 2);
  });
  leg('L3 missing env refused', () => {
    const env = Object.assign({}, process.env);
    delete env.PLENTYDEPRI;
    const r = cp.spawnSync(process.execPath, [SWEEP], {
      env: Object.assign(env, { SEEDS: '96201,96202,96203,96204,96205,96206,96207,96208', DAYS: '150' }),
      encoding: 'utf8', timeout: 60000,
    });
    assert.strictEqual(r.status, 2);
  });

  const { oneRun, writeRobust } = require('./sweep-prodcollapse-diag-a.js');
  const { detectEpisodes } = require('./analyze-prodcollapse-diag-a.js');
  let first = null, second = null, bare = null;
  await aleg('L4 oneRun(96201, 5d) structure incl. collapse fields', async () => {
    first = await oneRun(96201, 5);
    const ps = first.perSeed;
    assert.strictEqual(ps.seed, 96201);
    assert.strictEqual(ps.policy, 'competent');
    assert.ok(Array.isArray(ps.daySeries) && ps.daySeries.length === 5, 'daySeries length 5, got ' + ps.daySeries.length);
    assert.ok(Array.isArray(ps.flowSeries) && ps.flowSeries.length > 0, 'flowSeries non-empty');
    assert.ok(Array.isArray(ps.mealRows), 'mealRows array');
    const keys = ps.mealRows.map(r => r.vid + '|' + r.day);
    assert.strictEqual(new Set(keys).size, keys.length, 'mealRows deduped');
    const d0 = ps.daySeries[0];
    for (const k of ['pantryKcal', 'pantryFreshKcal', 'pantrySpoiledKcal', 'preservedKcal',
      'freshDays', 'pantryCapKcal', 'throttleEngaged', 'throttleRedirects',
      'throttleExemptDepth', 'plentyDepriKcal', 'depositGateKcal', 'pop', 'assignments',
      // NEW collapse fields
      'season', 'weather', 'meanVigor', 'meanStockRatio', 'barrenTiles',
      'pressuredTiles', 'forageableTiles', 'awayCount', 'sickCount', 'meanHealth',
      'foragers', 'foragerMeanComp', 'assignDetail']) {
      assert.ok(k in d0, 'daySeries has ' + k);
    }
    assert.ok(Array.isArray(ps.deathRows), 'deathRows array');
    const f0 = ps.flowSeries[0];
    for (const k of ['stocked', 'stored', 'pantryAdd', 'donated', 'league', 'drawn',
      'spoiledDrawn', 'spoiledSwept', 'takeBulk', 'produced', 'need', 'ate', 'ownEat', 'gave', 'resolved',
      // NEW collapse fields
      'vigorSum', 'vigorN', 'depletedSum', 'barrenSum', 'forageCalls',
      'huntKcal', 'huntZero', 'huntCalls', 'zones']) {
      assert.ok(k in f0, 'flowSeries has ' + k);
    }
    // meal-row production factors
    assert.ok(ps.mealRows.length > 0, 'mealRows non-empty');
    const m0 = ps.mealRows[0];
    for (const k of ['produced', 'expected', 'base', 'kf', 'knownN', 'occSkill',
      'ageCap', 'healthFrac', 'trust', 'task', 'mult']) {
      assert.ok(k in m0, 'mealRow has ' + k);
    }
    assert.ok(first.fingerprint && typeof first.fingerprint.daysAlive === 'number', 'fingerprint present');
    assert.ok(Array.isArray(first.fingerprint.deathKeys), 'fingerprint deathKeys array');
  });
  await aleg('L5 determinism G1 smoke: same seed twice => identical per-seed JSON', async () => {
    second = await oneRun(96201, 5);
    assert.strictEqual(JSON.stringify(second.perSeed), JSON.stringify(first.perSeed));
    assert.strictEqual(JSON.stringify(second.diag), JSON.stringify(first.diag));
    assert.strictEqual(JSON.stringify(second.fingerprint), JSON.stringify(first.fingerprint));
  });
  await aleg('L6 neutrality G2 smoke: bare fingerprint == recorded fingerprint', async () => {
    bare = await oneRun(96201, 5, { bare: true });
    assert.strictEqual(bare.perSeed, null, 'bare run has no perSeed');
    assert.strictEqual(JSON.stringify(bare.fingerprint), JSON.stringify(first.fingerprint),
      'bare vs recorded fingerprint: ' + JSON.stringify(bare.fingerprint) + ' vs ' + JSON.stringify(first.fingerprint));
  });
  await aleg('L7 analyzer runs on a 5-day corpus and prints verdict lines', async () => {
    fs.mkdirSync(TMP, { recursive: true });
    writeRobust(path.join(TMP, 'prodcollapse-a-competent-s96201.json'), JSON.stringify(first.perSeed));
    const r = cp.spawnSync(process.execPath, [ANALYZE, TMP], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 500));
    assert.ok(/D1 PRODUCTION vs BURN/.test(r.stdout), 'D1 section printed');
    assert.ok(/NON-EPISODE BASELINE/.test(r.stdout), 'baseline printed');
    assert.ok(/G2 NEUTRALITY/.test(r.stdout), 'G2 line printed');
    assert.ok(/G3 CORPUS/.test(r.stdout), 'G3 line printed');
    assert.ok(/G4 CLASSIFICATION/.test(r.stdout), 'G4 line printed');
    assert.ok(/DIAGNOSIS VERDICT/.test(r.stdout), 'verdict printed');
  });
  leg('L8 episode detector: synthetic collapse found, healthy corpus clean', () => {
    const mkDays = (prod, need, n) => {
      const out = [];
      for (let d = 1; d <= n; d++) out.push({ day: d, produced: prod, need });
      return out;
    };
    // 25 days at 0.70: trailing-14d ratio drops below 0.80 once the window is
    // mostly low days; the run must be >= 7 days long.
    const eps = detectEpisodes(mkDays(1400, 2000, 25));
    assert.strictEqual(eps.length, 1, 'one episode, got ' + eps.length);
    assert.ok(eps[0].length >= 7, 'episode length >= 7, got ' + eps[0].length);
    assert.ok(eps[0].minRatio < 0.80, 'min ratio < 0.80, got ' + eps[0].minRatio);
    // Healthy: ratio 1.05 throughout — no episode.
    assert.strictEqual(detectEpisodes(mkDays(2100, 2000, 25)).length, 0, 'healthy corpus: 0 episodes');
    // Brief dip (4 low days): trailing ratio never stays < 0.80 for 7 days.
    const brief = mkDays(2100, 2000, 25);
    for (let i = 9; i < 13; i++) brief[i].produced = 1000;
    assert.strictEqual(detectEpisodes(brief).length, 0, 'brief dip: 0 episodes');
  });
  await aleg('L9 flow accounting residual is small on the 5-day seed', async () => {
    const days = first.perSeed.daySeries, flows = first.perSeed.flowSeries;
    const n = days.length;
    const sumF = (fn, from, to) => flows.filter(f => f.day >= from && f.day <= to).reduce((t, f) => t + fn(f), 0);
    const dPantry = (days[n - 1].pantryKcal || 0) - (days[0].pantryKcal || 0);
    const inTot = sumF(f => Object.values(f.stocked || {}).reduce((a, b) => a + b, 0), 2, n)
      + sumF(f => (f.stored || 0) + (f.league || 0), 1, n - 1)
      + sumF(f => (f.pantryAdd || 0) + (f.donated || 0), 2, n);
    const outTot = sumF(f => (f.drawn || 0) + (f.drawGap || 0) + (f.spoiledDrawn || 0), 1, n - 1)
      + sumF(f => (f.spoiledSwept || 0) + (f.takeBulk || 0) + (f.removedKcal || 0), 2, n);
    const residual = dPantry - (inTot - outTot);
    const share = outTot ? Math.abs(residual) / outTot : 0;
    const drawGap = flows.reduce((t, f) => t + (f.drawGap || 0), 0);
    const removedKcal = flows.reduce((t, f) => t + (f.removedKcal || 0), 0);
    console.log('    residual=' + residual + ' inflows=' + inTot + ' outflows=' + outTot + ' drawGap=' + drawGap + ' removedKcal=' + removedKcal + ' share=' + (100 * share).toFixed(1) + '% of outflows');
    assert.ok(share < 0.10, 'residual share < 10% of outflows, got ' + (100 * share).toFixed(1) + '%');
  });

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
