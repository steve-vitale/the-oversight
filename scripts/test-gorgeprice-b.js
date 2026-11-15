#!/usr/bin/env node
// scripts/test-gorgeprice-b.js — sim-gorgeprice-b proof: the gorge-price
// analyzer + bar computation (scripts/analyze-gorgeprice-b.js) and the
// recovered cascade lever's static check.
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process). The 'all' runner spawns one child
// process per case and aggregates; exit 1 if any case fails. Each case
// prints one JSON line.
//   static        guard text present inside monsterTurn; among src/ files
//                 only src/js/game.js differs vs merge-base with master,
//                 and its diff is the guard hunk only (no flee / damage /
//                 toughness code); policies byte-identical.
//   gorge-parse   parseGorgeLines on synthetic linkLines: voiced gorge
//                 nights + kcal (comma-formatted numbers), zero-kcal
//                 circle nights counted separately, per-siege grouping
//                 by consecutive days + monster name, non-gorge lines
//                 ignored.
//   bars          computeBars on synthetic leg summaries: P1 ratio vs
//                 the 0.6x bar, starvation rate per 100 lived-days vs
//                 the 1.25x bar (including the control-rate-zero edge),
//                 pooled tripwire (armed <= control + 2), survival
//                 ratio vs the 0.8x bar, and the combined cost verdict.
//   determinism   armed driver oneRun twice on seed 100301, 60 days
//                 (DAYS env): deaths, days, endReason, series length
//                 identical.
// Usage: node scripts/test-gorgeprice-b.js [seed] [case]
//   (DAYS env sets the determinism horizon; default 60.)
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '100301');
const kase = process.argv[3] || 'all';

function out(o) { console.log(JSON.stringify(o)); }
function fail(k, detail, extra) { out(Object.assign({ case: k, pass: false, detail: detail }, extra || {})); process.exit(1); }
function pass(k, extra) { out(Object.assign({ case: k, pass: true }, extra || {})); process.exit(0); }

if (kase === 'all') {
  const cases = ['static', 'gorge-parse', 'bars', 'determinism'];
  let allOk = true;
  for (const c of cases) {
    try {
      const env = Object.assign({}, process.env);
      if (c === 'determinism') env.DAYS = '60';
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-gorgeprice-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
      const lines = r.trim().split('\n').filter(Boolean);
      for (const l of lines) { try { const j = JSON.parse(l); if (j.pass === false) allOk = false; console.log(l); } catch (e) { console.log(l); } }
    } catch (e) {
      allOk = false;
      console.log(JSON.stringify({ case: c, pass: false, detail: 'child failed: ' + String((e.stdout || '') + (e.stderr || '') + e.message).slice(0, 800) }));
    }
  }
  process.exit(allOk ? 0 : 1);
}

if (kase === 'static') {
  const gamePath = path.join(repo, 'src', 'js', 'game.js');
  const raw = fs.readFileSync(gamePath, 'utf8');
  const mtIdx = raw.indexOf('monsterTurn() {');
  if (mtIdx < 0) fail('static', 'monsterTurn not found in game.js');
  const mtEnd = raw.indexOf('\n    },', mtIdx);
  const mtBody = raw.slice(mtIdx, mtEnd < 0 ? mtIdx + 8000 : mtEnd);
  if (!/if \(m\.lingering\) return;/.test(mtBody)) fail('static', 'lingering guard not inside monsterTurn');
  if (!/CASCADE \(sim-cascade-b/.test(mtBody)) fail('static', 'guard comment missing in monsterTurn');
  let base = '';
  try { base = execSync('git merge-base HEAD master', { cwd: repo, encoding: 'utf8' }).trim(); } catch (e) { fail('static', 'git merge-base failed: ' + e.message); }
  let changed = [];
  try { changed = execSync('git diff ' + base + ' --name-only', { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch (e) { fail('static', 'git diff failed: ' + e.message); }
  if (changed.indexOf('scripts/policies/competent.js') >= 0) fail('static', 'competent.js modified');
  if (changed.indexOf('scripts/policies/competent-answercourt-b.js') >= 0) fail('static', 'competent-answercourt-b.js modified');
  const srcChanged = changed.filter(function (f) { return f.indexOf('src/') === 0; });
  if (srcChanged.length !== 1 || srcChanged[0] !== 'src/js/game.js') fail('static', 'src change must be exactly src/js/game.js, got: ' + srcChanged.join(','));
  let diff = '';
  try { diff = execSync('git diff ' + base + ' -- src/js/game.js', { cwd: repo, encoding: 'utf8' }); } catch (e) { fail('static', 'git diff game.js failed: ' + e.message); }
  if (/tbBarrierExit|tbPlayerEndTurn|fleeRepair/i.test(diff)) fail('static', 'diff touches flee code');
  if (/tbDamage\(|maxHealth\(\)|damage\s*[:=]/i.test(diff)) fail('static', 'diff touches damage/toughness code');
  const hunks = (diff.match(/^@@/gm) || []).length;
  if (hunks !== 1) fail('static', 'game.js diff must be exactly 1 hunk (the guard), got ' + hunks);
  pass('static', { base: base.slice(0, 12), srcChanged: srcChanged, hunks: hunks });
}

if (kase === 'gorge-parse') {
  const analyzer = require(path.join(__dirname, 'analyze-gorgeprice-b.js'));
  if (typeof analyzer.parseGorgeLines !== 'function') fail('gorge-parse', 'parseGorgeLines not exported');
  const lines = [
    { day: 10, line: '🌙 Night. The lingering Eulogy gorges at the treeline — 1,234 kcal gone from the stores. Endure it (they drift off within ~6 nights — the gorge is the price), or send a sortie: fighters, rations, real risk.' },
    { day: 11, line: '🌙 Night. The lingering Eulogy gorges at the treeline — 500 kcal gone from the stores. Endure it (they drift off within ~6 nights — the gorge is the price), or send a sortie: fighters, rations, real risk.' },
    { day: 12, line: '🌙 Night. The lingering Eulogy circles the treeline, sniffing at empty stores — nothing left to take. Endure it (they drift off within ~6 nights), or send a sortie: fighters, rations, real risk.' },
    { day: 13, line: '🌙 Night. The lingering Algorithm gorges at the treeline — 999 kcal gone from the stores. Endure it (they drift off within ~6 nights — the gorge is the price), or send a sortie: fighters, rations, real risk.' },
    { day: 20, line: '🌙 Night. The lingering Algorithm gorges at the treeline — 750 kcal gone from the stores. Endure it (they drift off within ~6 nights — the gorge is the price), or send a sortie: fighters, rations, real risk.' },
    { day: 21, line: 'The village shares a meal by the fire.' },
    { day: 22, line: '🌙 Night. The lingering Algorithm gorges at the treeline — 0 kcal gone from the stores. Endure it (they drift off within ~6 nights — the gorge is the price), or send a sortie: fighters, rations, real risk.' },
  ];
  const g = analyzer.parseGorgeLines(lines);
  // d10+d11 Eulogy (one siege, 2 nights, 1734 kcal) + d12 circle night;
  // d13 Algorithm (new siege — name change); d20 Algorithm (new siege —
  // day gap); d21 is not a gorge line; d22 "0 kcal" still matches the
  // gorge pattern (a voiced 0-kcal gorge night, distinct from a circle)
  // but starts a fourth siege (d21 breaks the consecutive-day run).
  if (g.nights !== 5) fail('gorge-parse', 'nights must be 5, got ' + g.nights);
  if (g.kcal !== 1234 + 500 + 999 + 750 + 0) fail('gorge-parse', 'kcal must be 3483, got ' + g.kcal);
  if (g.circleNights !== 1) fail('gorge-parse', 'circleNights must be 1, got ' + g.circleNights);
  if (g.sieges.length !== 4) fail('gorge-parse', 'sieges must be 4, got ' + g.sieges.length + ': ' + JSON.stringify(g.sieges));
  if (g.sieges[0].name !== 'Eulogy' || g.sieges[0].nights !== 2 || g.sieges[0].kcal !== 1734) fail('gorge-parse', 'siege 0 wrong: ' + JSON.stringify(g.sieges[0]));
  if (g.sieges[1].name !== 'Algorithm' || g.sieges[1].nights !== 1 || g.sieges[1].kcal !== 999) fail('gorge-parse', 'siege 1 wrong: ' + JSON.stringify(g.sieges[1]));
  if (g.sieges[2].name !== 'Algorithm' || g.sieges[2].nights !== 1 || g.sieges[2].kcal !== 750) fail('gorge-parse', 'siege 2 wrong: ' + JSON.stringify(g.sieges[2]));
  if (g.sieges[3].name !== 'Algorithm' || g.sieges[3].nights !== 1 || g.sieges[3].kcal !== 0) fail('gorge-parse', 'siege 3 wrong: ' + JSON.stringify(g.sieges[3]));
  if (Math.abs(g.kcalPerSiege - 3483 / 4) > 0.1) fail('gorge-parse', 'kcalPerSiege wrong: ' + g.kcalPerSiege);
  const empty = analyzer.parseGorgeLines([]);
  if (empty.nights !== 0 || empty.kcal !== 0 || empty.sieges.length !== 0) fail('gorge-parse', 'empty input must parse to zeros');
  pass('gorge-parse', { nights: g.nights, kcal: g.kcal, circleNights: g.circleNights, sieges: g.sieges.length });
}

if (kase === 'bars') {
  const analyzer = require(path.join(__dirname, 'analyze-gorgeprice-b.js'));
  if (typeof analyzer.computeBars !== 'function') fail('bars', 'computeBars not exported');
  // P1 0.05 vs control 0.10 (0.5x, pass); starvation rate 0.4 vs 0.5
  // per 100 lived-days (0.8x, pass); pooled 4 vs control 3 (tripwire
  // 3+2=5, pass); survival 140 vs 120 (1.17x, pass) -> GO.
  const go = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 4, starvationRate: 0.4, medianSurvivalDays: 140 });
  if (!go.p1Pass || !go.costPass || go.verdict !== 'GO') fail('bars', 'GO fixture must pass, got ' + JSON.stringify(go));
  // Rate fail: armed starvation rate 0.7 vs control 0.5 (1.4x > 1.25x)
  // even though the pooled tripwire passes (4 <= 5) -> cost NO-GO.
  const rateFail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 4, starvationRate: 0.7, medianSurvivalDays: 140 });
  if (rateFail.costPass || rateFail.starvRatePass) fail('bars', 'rate-fail fixture must fail the rate bar, got ' + JSON.stringify(rateFail));
  if (rateFail.verdict !== 'NO-GO') fail('bars', 'rate-fail verdict must be NO-GO, got ' + rateFail.verdict);
  // Tripwire fail: pooled 6 vs control 3 (bar 5) with a clean rate
  // (0.4 vs 0.5) -> cost NO-GO on the tripwire alone.
  const tripFail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 6, starvationRate: 0.4, medianSurvivalDays: 140 });
  if (tripFail.costPass || tripFail.tripwirePass) fail('bars', 'tripwire-fail fixture must fail the tripwire, got ' + JSON.stringify(tripFail));
  // Survival fail: median 90 vs control 120 (0.75x < 0.8x).
  const survFail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 3, starvationRate: 0.4, medianSurvivalDays: 90 });
  if (survFail.costPass || survFail.survivalPass) fail('bars', 'survival-fail fixture must fail the survival bar, got ' + JSON.stringify(survFail));
  // P1 fail: 0.07 vs 0.10 (0.7x > 0.6x) with a clean cost bar -> NO-GO.
  const p1Fail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.07, starvationPooled: 3, starvationRate: 0.4, medianSurvivalDays: 140 });
  if (p1Fail.p1Pass || p1Fail.verdict !== 'NO-GO') fail('bars', 'P1-fail fixture must fail P1, got ' + JSON.stringify(p1Fail));
  // Control-rate-zero edge: control starved 0, armed starved 0 -> rate
  // bar passes; armed starved > 0 -> rate bar fails (any positive rate
  // is infinitely above zero).
  const zeroZero = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 0, starvationRate: 0, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 0, starvationRate: 0, medianSurvivalDays: 140 });
  if (!zeroZero.starvRatePass) fail('bars', 'zero/zero rate must pass, got ' + JSON.stringify(zeroZero));
  const zeroPos = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 0, starvationRate: 0, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 2, starvationRate: 0.2, medianSurvivalDays: 140 });
  if (zeroPos.starvRatePass) fail('bars', 'zero/positive rate must fail, got ' + JSON.stringify(zeroPos));
  if (!zeroPos.tripwirePass) fail('bars', 'zero/positive tripwire must still pass (2 <= 0+2), got ' + JSON.stringify(zeroPos));
  pass('bars', { fixtures: 7 });
}

if (kase === 'determinism') (async function () {
  const driver = require(path.join(__dirname, 'cascade-driver-20261115.js'));
  const a = await driver.oneRun(seed, 'competent-answercourt-b');
  const b = await driver.oneRun(seed, 'competent-answercourt-b');
  const key = function (r) { return JSON.stringify({ deaths: r.deaths, days: r.days, endReason: r.endReason, seriesLen: r.series.length }); };
  if (key(a) !== key(b)) fail('determinism', 'two runs on seed ' + seed + ' diverged', { a: { deaths: a.deaths.length, days: a.days, endReason: a.endReason }, b: { deaths: b.deaths.length, days: b.days, endReason: b.endReason } });
  pass('determinism', { seed: seed, days: a.days, deaths: a.deaths.length, endReason: a.endReason });
})().catch(function (e) { fail('determinism', 'threw: ' + (e && e.stack || e)); });
