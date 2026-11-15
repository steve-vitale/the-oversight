#!/usr/bin/env node
// scripts/test-gorgeprice2-b.js — sim-gorgeprice2-b proof: the CORRECTED
// cost bar (floored rate leg, F = 0.5 starvations per 100 lived-days)
// in scripts/analyze-gorgeprice-b.js, the gorge-price analyzer, and the
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
//                 ignored. (Per-siege is DESCRIPTIVE only in this run —
//                 the prereg drops it as a metric — but the parser is
//                 reused unchanged, so its cases are re-proven here.)
//   bars          computeBars with { rateFloor: 0.5 } on synthetic leg
//                 summaries: the floored rate leg (zero-control
//                 degeneracy fixed; floor binds only above the pooled
//                 background; tripwire still kills on its own — the
//                 cascade shape passes the floored rate leg but fails
//                 the tripwire), P1 ratio vs the 0.6x bar, survival
//                 ratio vs the 0.8x bar, and the combined verdict; plus
//                 the old unfloored form preserved when no floor is
//                 given (zero/positive still fails the rate bar).
//   determinism   armed driver oneRun twice on seed 100501, 60 days
//                 (DAYS env): deaths, days, endReason, series length
//                 identical.
// Usage: node scripts/test-gorgeprice2-b.js [seed] [case]
//   (DAYS env sets the determinism horizon; default 60.)
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '100501');
const kase = process.argv[3] || 'all';
const FLOOR = 0.5; // frozen in evidence/2026-11-15/sim-gorgeprice2-b-prereg.md

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
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-gorgeprice2-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
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
  const added = (diff.match(/^\+[^+]/gm) || []).length;
  if (added !== 16) fail('static', 'guard hunk must add exactly 16 lines, got ' + added);
  pass('static', { base: base.slice(0, 12), srcChanged: srcChanged, hunks: hunks, addedLines: added });
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
  const F = { rateFloor: FLOOR };
  // 1. The 1055Z pilot shape under the CORRECTED bar: control starved
  // 0 (rate 0.0), armed 2 starvations (rate 0.177), P1 0.52x, tripwire
  // 2 <= 0+2, survival 150 vs 140 -> rate leg now PASSES (0.177 <=
  // 1.25 x max(0, 0.5) = 0.625) and the verdict is GO. (The 1055Z
  // NO-GO under the old bar stands; this fixture proves the new form,
  // not a re-score.)
  const pilotShape = analyzer.computeBars(
    { pooledP1: 0.1338, starvationPooled: 0, starvationRate: 0, medianSurvivalDays: 140 },
    { pooledP1: 0.0699, starvationPooled: 2, starvationRate: 0.177, medianSurvivalDays: 150 }, F);
  if (!pilotShape.p1Pass || !pilotShape.costPass || pilotShape.verdict !== 'GO') fail('bars', '1055Z pilot shape must GO under the floored bar, got ' + JSON.stringify(pilotShape));
  if (pilotShape.starvRateRatio !== 0.354) fail('bars', 'floored ratio must be 0.177/0.5 = 0.354, got ' + pilotShape.starvRateRatio);
  // 2. Floor binds: control rate 0.3 (below the floor), armed 0.7 ->
  // effective control is the floor 0.5, allowance 0.625, 0.7 fails.
  const floorBinds = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.3, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 4, starvationRate: 0.7, medianSurvivalDays: 140 }, F);
  if (floorBinds.starvRatePass || floorBinds.costPass) fail('bars', 'floor-binds fixture must fail the rate bar, got ' + JSON.stringify(floorBinds));
  // 3. Control above the floor: control 0.8, armed 0.9 -> ratio 1.125
  // (<= 1.25) passes; armed 1.1 -> 1.375 fails. The floor never
  // loosens a control that already starves above it.
  const aboveFloorPass = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.8, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 4, starvationRate: 0.9, medianSurvivalDays: 140 }, F);
  if (!aboveFloorPass.starvRatePass) fail('bars', 'above-floor pass fixture must pass the rate bar, got ' + JSON.stringify(aboveFloorPass));
  const aboveFloorFail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.8, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 4, starvationRate: 1.1, medianSurvivalDays: 140 }, F);
  if (aboveFloorFail.starvRatePass) fail('bars', 'above-floor fail fixture must fail the rate bar, got ' + JSON.stringify(aboveFloorFail));
  // 4. The floor does NOT whitewash the old kill: the cascade shape
  // (control rate 0.148, armed 0.369, pooled 3 vs 8) passes the
  // floored rate leg (0.369 <= 0.625) but FAILS the tripwire (8 > 5)
  // -> cost NO-GO on the tripwire alone.
  const cascadeShape = analyzer.computeBars(
    { pooledP1: 0.1248, starvationPooled: 3, starvationRate: 0.148, medianSurvivalDays: 123 },
    { pooledP1: 0.0665, starvationPooled: 8, starvationRate: 0.369, medianSurvivalDays: 145.5 }, F);
  if (!cascadeShape.starvRatePass) fail('bars', 'cascade shape must pass the floored rate leg, got ' + JSON.stringify(cascadeShape));
  if (cascadeShape.tripwirePass || cascadeShape.costPass || cascadeShape.verdict !== 'NO-GO') fail('bars', 'cascade shape must fail the tripwire (8 vs 5), got ' + JSON.stringify(cascadeShape));
  // 5. Tripwire fail with a clean floored rate: pooled 6 vs control 3
  // (bar 5), rate 0.4 vs control 0.5 -> cost NO-GO on the tripwire.
  const tripFail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 6, starvationRate: 0.4, medianSurvivalDays: 140 }, F);
  if (tripFail.costPass || tripFail.tripwirePass) fail('bars', 'tripwire-fail fixture must fail the tripwire, got ' + JSON.stringify(tripFail));
  // 6. Survival fail: median 90 vs control 120 (0.75x < 0.8x).
  const survFail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 3, starvationRate: 0.4, medianSurvivalDays: 90 }, F);
  if (survFail.costPass || survFail.survivalPass) fail('bars', 'survival-fail fixture must fail the survival bar, got ' + JSON.stringify(survFail));
  // 7. P1 fail: 0.07 vs 0.10 (0.7x > 0.6x) with a clean cost bar -> NO-GO.
  const p1Fail = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 3, starvationRate: 0.5, medianSurvivalDays: 120 },
    { pooledP1: 0.07, starvationPooled: 3, starvationRate: 0.4, medianSurvivalDays: 140 }, F);
  if (p1Fail.p1Pass || p1Fail.verdict !== 'NO-GO') fail('bars', 'P1-fail fixture must fail P1, got ' + JSON.stringify(p1Fail));
  // 8. Old unfloored form preserved when no floor is given:
  // zero/zero passes; zero/positive fails the rate bar (the 1055Z
  // degeneracy — kept here as the documented old behavior, NOT the
  // judge of this run).
  const zeroZero = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 0, starvationRate: 0, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 0, starvationRate: 0, medianSurvivalDays: 140 });
  if (!zeroZero.starvRatePass) fail('bars', 'unfloored zero/zero rate must pass, got ' + JSON.stringify(zeroZero));
  const zeroPos = analyzer.computeBars(
    { pooledP1: 0.10, starvationPooled: 0, starvationRate: 0, medianSurvivalDays: 120 },
    { pooledP1: 0.05, starvationPooled: 2, starvationRate: 0.2, medianSurvivalDays: 140 });
  if (zeroPos.starvRatePass) fail('bars', 'unfloored zero/positive rate must fail, got ' + JSON.stringify(zeroPos));
  pass('bars', { fixtures: 8, floor: FLOOR });
}

if (kase === 'determinism') (async function () {
  const driver = require(path.join(__dirname, 'cascade-driver-20261115.js'));
  const a = await driver.oneRun(seed, 'competent-answercourt-b');
  const b = await driver.oneRun(seed, 'competent-answercourt-b');
  const key = function (r) { return JSON.stringify({ deaths: r.deaths, days: r.days, endReason: r.endReason, seriesLen: r.series.length }); };
  if (key(a) !== key(b)) fail('determinism', 'two runs on seed ' + seed + ' diverged', { a: { deaths: a.deaths.length, days: a.days, endReason: a.endReason }, b: { deaths: b.deaths.length, days: b.days, endReason: b.endReason } });
  pass('determinism', { seed: seed, days: a.days, deaths: a.deaths.length, endReason: a.endReason });
})().catch(function (e) { fail('determinism', 'threw: ' + (e && e.stack || e)); });
