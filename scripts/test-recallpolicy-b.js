#!/usr/bin/env node
// test-recallpolicy-b.js — proof tests for sim-recallpolicy-b (prereg:
// evidence/2026-10-29/sim-recallpolicy-b-prereg.md, sections a–f).
// Run BEFORE any judged leg. Exits non-zero on any failure.
//
// Usage: node scripts/test-recallpolicy-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const RP = require('./recallpolicy-instrument-b');
const TAX = require('./taxonomy-recalldiag-b');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function rowsFor(days) {
  // days: [{d, away, produced, drawn, need}] -> Map(d -> row)
  const m = new Map();
  days.forEach((r) => m.set(r.d, r));
  return m;
}
function sigRow(d, away, produced, drawn, need) {
  return { d: d, away: away, produced: produced, drawn: drawn, need: need || 2000 };
}
// Baseline: 7 away-days at 2000/d, then the test day.
function baseRows(testDay) {
  const days = [];
  for (let d = 1; d <= 7; d++) days.push(sigRow(d, true, 2000, 0));
  days.push(testDay);
  return rowsFor(days);
}

// ---------- (a) trigger reuse: RECALL-TRIGGER v1 Rule A ----------
(function () {
  const fire = baseRows(sigRow(8, true, 800, 700)); // 800 <= 0.40*2000, draws 700 >= 600
  const t = TAX.triggerDay(fire, new Map(), 8, false);
  ok('A1 fires on exact signature', t.fire === true, JSON.stringify(t));
  ok('A2 no-fire not-away', TAX.triggerDay(baseRows(sigRow(8, false, 800, 700)), new Map(), 8, false).fire === false);
  const noMaj = rowsFor([sigRow(1, true, 2000, 0), sigRow(2, true, 2000, 0), sigRow(3, true, 2000, 0),
    sigRow(4, false, 0, 0), sigRow(5, false, 0, 0), sigRow(6, false, 0, 0), sigRow(7, false, 0, 0),
    sigRow(8, true, 800, 700)]);
  ok('A3 no-fire no-majority (3/7)', TAX.triggerDay(noMaj, new Map(), 8, false).fire === false);
  ok('A4 no-fire no-cliff (0.41x)', TAX.triggerDay(baseRows(sigRow(8, true, 820, 700)), new Map(), 8, false).fire === false);
  const thin = rowsFor([sigRow(6, true, 2000, 0), sigRow(7, true, 2000, 0), sigRow(8, true, 800, 700)]);
  ok('A5 no-fire thin baseline (2 away-days)', TAX.triggerDay(thin, new Map(), 8, false).fire === false);
  const low = rowsFor([sigRow(1, true, 700, 0), sigRow(2, true, 700, 0), sigRow(3, true, 700, 0),
    sigRow(4, true, 700, 0), sigRow(5, true, 700, 0), sigRow(6, true, 700, 0), sigRow(7, true, 700, 0),
    sigRow(8, true, 200, 700)]);
  ok('A6 no-fire baseline-too-low (<800)', TAX.triggerDay(low, new Map(), 8, false).fire === false);
  ok('A7 no-fire no-pack-draw', TAX.triggerDay(baseRows(sigRow(8, true, 800, 100)), new Map(), 8, false).fire === false);
  // Rule B pantry condition is NOT consulted by this instrument: the
  // instrument always calls triggerDay with ruleB=false; prove the
  // instrument source never passes ruleB=true.
  const src = fs.readFileSync(path.join(__dirname, 'recallpolicy-instrument-b.js'), 'utf8');
  ok('A8 instrument never enables Rule B', !/triggerDay\([^)]*,\s*true/.test(src) && /new Map\(\), d, false/.test(src));
  const codeOnlyA = src.replace(/\/\/.*$/gm, '');
  ok('A9 instrument code never mentions pantry', !/pantry/i.test(codeOnlyA), (codeOnlyA.match(/pantry/gi) || []).join(','));
})();

// ---------- (b) BFS legality on a stub Game ----------
(function () {
  // 9x9, haven (4,4). Block the direct west approach into (4,4):
  // blockFrom on (4,4) guarding approach from (3,4) -> travelBlockage
  // (4,4, 3,4) returns a block. Mirror travelBlockage's rule: a
  // blockFrom {dx,dy} blocks entry whose approach component matches.
  function stubGame(blockedEdges) {
    return {
      travelBlockage: function (x, y, fx, fy) {
        for (const e of blockedEdges) if (e.x === x && e.y === y && e.fx === fx && e.fy === fy) return { kind: 'blockage', blockType: 'tree', x: x, y: y };
        return null;
      },
    };
  }
  const open = stubGame([]);
  const p1 = RP.bfsPath(open, 6, 4, 4, 4);
  ok('B1 open path is straight + orthogonal', !!p1 && p1.length === 2 && p1[0].nx === 5 && p1[0].ny === 4 && p1[1].nx === 4 && p1[1].ny === 4, JSON.stringify(p1));
  const blocked = stubGame([{ x: 4, y: 4, fx: 3, fy: 4 }]);
  const p2 = RP.bfsPath(blocked, 3, 4, 4, 4);
  const orth = p2 && p2.every((s, i) => {
    const prev = i === 0 ? { nx: 3, ny: 4 } : p2[i - 1];
    return Math.abs(s.nx - prev.nx) + Math.abs(s.ny - prev.ny) === 1;
  });
  const avoids = p2 && !p2.some((s, i) => {
    const prev = i === 0 ? { nx: 3, ny: 4 } : p2[i - 1];
    return s.nx === 4 && s.ny === 4 && prev.nx === 3 && prev.ny === 4;
  });
  ok('B2 blocked edge routed around, orthogonal', !!p2 && orth && avoids, JSON.stringify(p2));
  const walled = stubGame([]);
  walled.travelBlockage = function () { return { kind: 'blockage' }; };
  ok('B3 no-path returns null', RP.bfsPath(walled, 6, 4, 4, 4) === null);
  ok('B4 start==haven returns empty path', JSON.stringify(RP.bfsPath(open, 4, 4, 4, 4)) === '[]');
  const inBounds = p2 && p2.every((s) => s.nx >= 0 && s.nx <= 8 && s.ny >= 0 && s.ny <= 8);
  ok('B5 path stays inside 0..8', inBounds === true);
  const noTb = {};
  ok('B6 missing travelBlockage -> null (never step blind)', RP.bfsPath(noTb, 6, 4, 4, 4) === null);
})();

// ---------- (c) reroute on a fake Game ----------
function fakeGame(opts) {
  opts = opts || {};
  const pos = { v1: { nx: 6, ny: 4 }, v2: { nx: 6, ny: 4 } };
  const G = {
    villagerId: 'scholar',
    state: { scholar: { day: 10 }, village: { px: 4, py: 4, away: { v1: { nx: 6, ny: 4, purpose: 'expedition', sinceDay: 5, sincePart: 0, duration: 20 }, v2: { nx: 6, ny: 4, purpose: 'expedition', sinceDay: 5, sincePart: 0, duration: 20 } }, agency: { exped: { v1: { tx: 8, ty: 4 }, v2: { tx: 8, ty: 4 } } }, contribLog: {} } },
    dayPart: 2,
    npcNode: function (vid) { return pos[vid] || { nx: 4, ny: 4 }; },
    npcSetNode: function (vid, nx, ny) { pos[vid] = { nx: nx, ny: ny }; },
    travelBlockage: opts.travelBlockage || function () { return null; },
    isEngaged: opts.isEngaged || function () { return false; },
    vpOf: opts.vpOf || function () { return { dead: false }; },
    displayName: function (vid) { return vid === 'v1' ? 'Vera One' : 'Vera Two'; },
    getPerson: function () { return { kcalPerDay: 2000 }; },
    villagerMealDay: function () { return { ate: 1500, drawn: 700, gave: 0, fasting: false }; },
    sleep: function () { return 'slept'; },
    say: function () {},
    _pos: pos,
  };
  return G;
}
(function () {
  const prev = process.env.RECALLPOLICY_B;
  process.env.RECALLPOLICY_B = '1';
  const G = fakeGame();
  const inst = RP.install(G);
  const K = inst.K;
  K.epByVid.v1 = { name: 'Vera One', steps: [] };
  G.npcSetNode('v1', 7, 4); // engine leg step outward -> rerouted homeward
  ok('C1 outward leg rerouted to BFS-next toward haven', G._pos.v1.nx === 5 && G._pos.v1.ny === 4, JSON.stringify(G._pos.v1));
  G.npcSetNode('v1', 6, 4); // again: 5,4 -> 4,4 haven
  ok('C2 second step reaches haven', G._pos.v1.nx === 4 && G._pos.v1.ny === 4, JSON.stringify(G._pos.v1));
  G.npcSetNode('v1', 5, 4); // at haven: hold the walk back out
  ok('C3 at-haven hold blocks walk-out', G._pos.v1.nx === 4 && G._pos.v1.ny === 4, JSON.stringify(G._pos.v1));
  G.npcSetNode('v2', 7, 4); // non-recalled: untouched
  ok('C4 non-recalled villager untouched', G._pos.v2.nx === 7 && G._pos.v2.ny === 4, JSON.stringify(G._pos.v2));
  // Snap passthrough: recalled villager far from haven, jump dest.
  G._pos.v1 = { nx: 8, ny: 8 };
  G.npcSetNode('v1', 4, 4);
  ok('C5 snap (Chebyshev>1) passes through untouched', G._pos.v1.nx === 4 && G._pos.v1.ny === 4, JSON.stringify(G._pos.v1));
  inst.uninstall();
  // No-path hold.
  const G2 = fakeGame({ travelBlockage: function () { return { kind: 'blockage' }; } });
  const inst2 = RP.install(G2);
  inst2.K.epByVid.v1 = { name: 'Vera One', steps: [] };
  G2.npcSetNode('v1', 7, 4);
  ok('C6 no-path hold leaves villager put', G2._pos.v1.nx === 6 && G2._pos.v1.ny === 4, JSON.stringify(G2._pos.v1));
  inst2.uninstall();
  // Engaged skip.
  const G3 = fakeGame({ isEngaged: function () { return true; } });
  const inst3 = RP.install(G3);
  inst3.K.epByVid.v1 = { name: 'Vera One', steps: [] };
  G3.npcSetNode('v1', 7, 4);
  ok('C7 engaged villager not moved', G3._pos.v1.nx === 6 && G3._pos.v1.ny === 4, JSON.stringify(G3._pos.v1));
  ok('C8 engaged skip recorded', inst3.K.skipped.some((s) => s.reason === 'engaged-skip-move'));
  inst3.uninstall();
  // OFF: passthrough.
  delete process.env.RECALLPOLICY_B;
  const G4 = fakeGame();
  const inst4 = RP.install(G4);
  inst4.K.epByVid.v1 = { name: 'Vera One', steps: [] };
  G4.npcSetNode('v1', 7, 4);
  ok('C9 OFF leg passes moves through untouched', G4._pos.v1.nx === 7 && G4._pos.v1.ny === 4, JSON.stringify(G4._pos.v1));
  inst4.uninstall();
  if (prev === undefined) delete process.env.RECALLPOLICY_B; else process.env.RECALLPOLICY_B = prev;
})();

// ---------- (d) completion + scope-exclusion + trigger integration ----------
(function () {
  const prev = process.env.RECALLPOLICY_B;
  process.env.RECALLPOLICY_B = '1';
  const G = fakeGame();
  const inst = RP.install(G);
  const K = inst.K;
  // Recalled villager at haven, away still set -> sleep clears away.
  K.epByVid.v1 = { name: 'Vera One', steps: [], awayRec: { sinceDay: 5, sincePart: 0, duration: 20 } };
  G._pos.v1 = { nx: 4, ny: 4 };
  G.state.scholar.day = 8; // partsAway = (8-5)*4 + (2-0) = 14 < 20 -> strict
  G.sleep();
  ok('D1 sleep clears away at haven', !G.state.village.away.v1, JSON.stringify(G.state.village.away));
  ok('D2 completion recorded strict', K.completions.some((c) => c.kind === 'recall-cleared' && c.strict === true), JSON.stringify(K.completions));
  inst.uninstall();
  // Scope-excluded: trigger fires but no expedition record.
  const G5 = fakeGame();
  delete G5.state.village.agency.exped.v1;
  const inst5 = RP.install(G5);
  const K5 = inst5.K;
  G5.state.village.contribLog.v1 = {};
  for (let d = 1; d <= 7; d++) { G5.state.scholar.day = d; G5.state.village.contribLog.v1.produced = 2000; G5.villagerMealDay('v1'); }
  G5.state.scholar.day = 8; G5.state.village.contribLog.v1.produced = 800; G5.villagerMealDay('v1');
  const ep5 = K5.episodes.find((e) => e.vid === 'v1');
  ok('D3 trigger fires on fake meal series', !!ep5, JSON.stringify(K5.episodes.map((e) => e.fireDay)));
  ok('D4 no-expedition trigger is scope-excluded, not recalled', ep5 && ep5.outcome === 'scope-excluded' && !K5.epByVid.v1);
  // Same series WITH an expedition record -> recalled (ON leg).
  const G6 = fakeGame();
  const inst6 = RP.install(G6);
  const K6 = inst6.K;
  G6.state.village.contribLog.v1 = {};
  for (let d = 1; d <= 7; d++) { G6.state.scholar.day = d; G6.state.village.contribLog.v1.produced = 2000; G6.villagerMealDay('v1'); }
  G6.state.scholar.day = 8; G6.state.village.contribLog.v1.produced = 800; G6.villagerMealDay('v1');
  ok('D5 with-expedition trigger is recalled', !!K6.epByVid.v1, JSON.stringify(Object.keys(K6.epByVid)));
  // Second fire day in the same episode does NOT duplicate the episode.
  G6.state.scholar.day = 9; G6.state.village.contribLog.v1.produced = 800; G6.villagerMealDay('v1');
  ok('D6 one episode per away-episode (no duplicate on re-fire)', K6.episodes.filter((e) => e.vid === 'v1').length === 1);
  inst5.uninstall(); inst6.uninstall();
  if (prev === undefined) delete process.env.RECALLPOLICY_B; else process.env.RECALLPOLICY_B = prev;
  // No RNG, no say, no pantry reads (static checks).
  const src = fs.readFileSync(path.join(__dirname, 'recallpolicy-instrument-b.js'), 'utf8');
  const codeOnly = src.replace(/\/\/.*$/gm, '');
  ok('D7 zero Math.random calls', !/Math\.random\s*\(/.test(codeOnly));
  ok('D8 instrument never calls say() itself', !/\.say\s*\(/.test(codeOnly.replace(/wrap\('say'/, '')));
  ok('D9 gate is exactly RECALLPOLICY_B=1', /process\.env\.RECALLPOLICY_B === '1'/.test(src));
})();

// ---------- (e) OFF DET: observe-only vs pristine, 2 seeds x 40d ----------
(async function () {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  async function one(seed, withInst) {
    delete process.env.RECALLPOLICY_B;
    const { Game } = await loadGame({ seed: seed, mode: 'recallpolicy-det', fullTelemetry: false });
    let inst = null;
    if (withInst) { const r = RP.install(Game); inst = r; }
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, competent, { days: 40 }); });
    const proj = { days: result.days, endReason: result.endReason,
      gameDays: ((Game.state || {}).scholar || {}).day || 0, over: !!Game.over, won: !!Game.won,
      roster: (((Game.state || {}).village || {}).roster || []).length };
    if (inst) inst.uninstall();
    return proj;
  }
  for (const seed of [7, 42]) {
    const a = await one(seed, false);
    const b = await one(seed, true);
    ok('E-DET seed ' + seed + ' OFF-instrumented == pristine', JSON.stringify(a) === JSON.stringify(b), 'pristine=' + JSON.stringify(a) + ' inst=' + JSON.stringify(b));
  }
  // ---------- (f) zero src/js touched ----------
  const status = execSync('git status --short', { cwd: ROOT }).toString();
  const srcTouched = status.split('\n').filter((l) => /src\/js\//.test(l));
  ok('F1 zero src/js files touched', srcTouched.length === 0, srcTouched.join(';'));
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
