#!/usr/bin/env node
// test-walktree-b.js — proof for sim-walktree-b (DIAG only).
// Part A: census assertions over the committed census JSONs.
// Part B: live replay (seed 15215, warmed policy stack) to a
//   stranded morning: verifies the recorder's canFell=false is
//   real (tools actually carried) and the engine's findPath
//   verdicts on the real wake tile — pure reads only, NO
//   microMove / cutTree / forage calls from this script.
// Part C: determinism re-run byte-equality (re-run corpus
//   produced by the shell step before this script runs).
// Usage: node scripts/test-walktree-b.js
// Exit non-zero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-30');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

async function main() {
  // ---------- Part A: census assertions ----------
  const on = load(path.join(EVID, 'sim-walktree-b-census-on.json'));
  const guard = load(path.join(EVID, 'sim-walktree-b-census-guard.json'));
  const baseOn = load(path.join(EVID, 'sim-walktree-b-census-base-on.json'));
  const baseGuard = load(path.join(EVID, 'sim-walktree-b-census-base-guard.json'));
  check('ON creek/still/rescued reproduce fresh baseline', on.creekEvenings === 21 && on.stillRefused === 11 && on.rescued === 10,
    [on.creekEvenings, on.stillRefused, on.rescued]);
  check('guard creek/still/rescued reproduce fresh baseline', guard.creekEvenings === 15 && guard.stillRefused === 4 && guard.rescued === 11,
    [guard.creekEvenings, guard.stillRefused, guard.rescued]);
  check('ON == base-ON per-seed creek/still/rescued (equivalence)',
    JSON.stringify(on.perSeed) === JSON.stringify(baseOn.perSeed) || Object.keys(on.perSeed).every((s) =>
      on.perSeed[s].creek === baseOn.perSeed[s].creek && on.perSeed[s].still === baseOn.perSeed[s].still && on.perSeed[s].rescued === baseOn.perSeed[s].rescued));
  check('guard == base-guard per-seed creek/still/rescued (equivalence)',
    Object.keys(guard.perSeed).every((s) =>
      guard.perSeed[s].creek === baseGuard.perSeed[s].creek && guard.perSeed[s].still === baseGuard.perSeed[s].still && guard.perSeed[s].rescued === baseGuard.perSeed[s].rescued));
  check('guard warmth acted 0', guard.warmActed === 0, guard.warmActed);
  check('ON warmth acted 6 log-spent 4', on.warmActed === 6 && on.warmLogSpent === 4, [on.warmActed, on.warmLogSpent]);
  check('ON recorder errors 0', on.recorderErrors === 0, on.recorderErrors);
  check('guard recorder errors 0', guard.recorderErrors === 0, guard.recorderErrors);
  check('ON stranded mornings 11, field 10', on.totals.strandedMornings === 11 && on.totals.fieldMornings === 10, on.totals);
  check('ON field mornings all passable (10/10)', on.totals.fieldPassable === 10, on.totals.fieldPassable);
  check('ON canFell 0/11 (axe gate fails everywhere)', on.totals.canFell === 0, on.totals.canFell);
  check('ON adjacent-perceived 0/11', on.totals.adjacentPerceived === 0, on.totals.adjacentPerceived);
  check('ON clusters 19, reachable 15', on.totals.clusters === 19 && on.totals.clustersReachable === 15, [on.totals.clusters, on.totals.clustersReachable]);
  check('ON same-bank reachable 10, across-river reachable 5, bridge-use 5',
    on.totals.clustersSameBankReachable === 10 && on.totals.clustersAcrossReachable === 5 && on.totals.clustersBridgeUse === 5,
    [on.totals.clustersSameBankReachable, on.totals.clustersAcrossReachable, on.totals.clustersBridgeUse]);
  check('ON LOS-visible 19/19', on.totals.clustersVisible === 19, on.totals.clustersVisible);
  check('ON direct affordable 0 (full) and 0 (kcal-only)', on.totals.directAffordable === 0 && on.totals.directKcalOk === 0, [on.totals.directAffordable, on.totals.directKcalOk]);
  check('ON food-first full affordable 0 at all yields', on.totals.foodFirst.Y200 === 0 && on.totals.foodFirst.Y425 === 0 && on.totals.foodFirst.Y650 === 0, on.totals.foodFirst);
  check('ON food-first kcal-only: Y200 4, Y425 10, Y650 10',
    on.totals.foodFirstKcalOk.Y200 === 4 && on.totals.foodFirstKcalOk.Y425 === 10 && on.totals.foodFirstKcalOk.Y650 === 10, on.totals.foodFirstKcalOk);
  check('ON rescued-any 0', on.totals.rescuedAny === 0, on.totals.rescuedAny);
  // Ledger arithmetic on real census rows (break-even formula).
  const d8 = on.mornings.find((m) => m.seed === 15215 && m.loopDay === 8);
  check('day-8 break-even Y* = walkKcal+80+60+60-morningKcal = 162',
    d8 && d8.breakEvenY === 162 && d8.walkKcal === 6 && d8.morningKcal === 44, d8 && [d8.walkKcal, d8.morningKcal, d8.breakEvenY]);
  check('day-8 north cluster 3 steps, south 7 via bridge',
    d8 && d8.clusters[0].steps === 3 && d8.clusters[0].bridgeUse === false && d8.clusters[1].steps === 7 && d8.clusters[1].bridgeUse === true, d8 && d8.clusters);
  const d10 = on.mornings.find((m) => m.seed === 15215 && m.loopDay === 10);
  check('day-10 south cluster unreachable from (8,0), north 2 steps',
    d10 && d10.clusters[0].steps === 2 && d10.clusters[1].reachable === false, d10 && d10.clusters);
  check('day-10 evening kcal 240 (day nets kcal sometimes) recorded', d10 && d10.eveningKcal === 240, d10 && d10.eveningKcal);
  check('every field morning evening ticksLeft >= 96 (ticks not binding)',
    on.mornings.filter((m) => m.wakeTileType !== 'haven').every((m) => m.eveningTicksLeft === null || m.eveningTicksLeft >= 96),
    on.mornings.filter((m) => m.wakeTileType !== 'haven').map((m) => m.eveningTicksLeft));
  check('every stranded morning has a grid (no null analysis)',
    on.mornings.every((m) => Array.isArray(m.grid) && m.grid.length === 9 && !m.recorderError),
    on.mornings.filter((m) => !Array.isArray(m.grid)).length);

  // ---------- Part B: live replay, seed 15215 ----------
  const { Game } = await loadGame({ seed: 15215, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const snaps = {};
  let callIdx = 0;
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx === 8 || callIdx === 10) {
        const sch = (Game2.state || {}).scholar || {};
        let tools = null, tier = null, ci = null;
        try { tools = (sch.inventory || []).map((it) => it.itemId || it.id || it.name); } catch (e) {}
        try { tier = (typeof Game2.woodcutTier === 'function') ? Game2.woodcutTier() : null; } catch (e) {}
        try { ci = (typeof Game2.cutInfo === 'function') ? Game2.cutInfo('bigtree') : null; } catch (e) {}
        const detail = Game2.genDetail(Game2.map.px, Game2.map.py);
        snaps[callIdx] = {
          tile: Game2.map.px + ',' + Game2.map.py, wake: [sch.mx, sch.my], kcal: Math.round(sch.kcal || 0),
          tools, tier: tier && tier.tier, tierName: tier && tier.name, canFell: ci && ci.canFell,
          grid: detail.map((r) => r.slice()),
          paths: {},
        };
        const S = snaps[callIdx];
        try { S.paths.north = Game2.findPath(S.wake[0], S.wake[1], callIdx === 8 ? 3 : 6, 0); } catch (e) { S.paths.north = 'ERR'; }
        try { S.paths.south = Game2.findPath(S.wake[0], S.wake[1], 0, 6); } catch (e) { S.paths.south = 'ERR'; }
        try { S.paths.bridge = Game2.findPath(S.wake[0], S.wake[1], 1, 2); } catch (e) { S.paths.bridge = 'ERR'; }
      }
      return warmed.daily(Game2, ctx);
    },
  });
  await runDays(Game, policy, { days: 10, manifest: null });
  const s8 = snaps[8], s10 = snaps[10];
  check('replay day-8 morning: creek tile 2,5 wake (0,0)', s8 && s8.tile === '2,5' && s8.wake[0] === 0 && s8.wake[1] === 0, s8 && [s8.tile, s8.wake]);
  check('replay day-10 morning: creek tile 2,5 wake (8,0)', s10 && s10.tile === '2,5' && s10.wake[0] === 8 && s10.wake[1] === 0, s10 && [s10.tile, s10.wake]);
  check('replay: canFell false at BOTH stranded mornings (axe gate real)',
    s8 && s8.canFell === false && s10 && s10.canFell === false, [s8 && s8.canFell, s10 && s10.canFell]);
  check('replay: woodcut tier below fell at stranded mornings',
    s8 && s8.tier !== 'fell' && s10 && s10.tier !== 'fell', [s8 && s8.tier, s10 && s10.tier]);
  console.log('REPLAY-TOOLS day8: ' + JSON.stringify(s8 && s8.tools) + ' tier=' + (s8 && s8.tier) + '/' + (s8 && s8.tierName));
  console.log('REPLAY-TOOLS day10: ' + JSON.stringify(s10 && s10.tools) + ' tier=' + (s10 && s10.tier) + '/' + (s10 && s10.tierName));
  check('replay day-8: north cut-path 3 steps to (3,0)',
    s8 && Array.isArray(s8.paths.north) && s8.paths.north.length === 3, s8 && s8.paths.north);
  check('replay day-8: south cut-path 7 steps via bridge to (0,6)',
    s8 && Array.isArray(s8.paths.south) && s8.paths.south.length === 7 && s8.paths.south.some(([x, y]) => s8.grid[y][x] === 'bridge'), s8 && s8.paths.south);
  check('replay day-10: north cut-path 2 steps to (6,0)',
    s10 && Array.isArray(s10.paths.north) && s10.paths.north.length === 2, s10 && s10.paths.north);
  check('replay day-10: bridge (1,2) UNREACHABLE from (8,0)',
    s10 && s10.paths.bridge === null, s10 && s10.paths.bridge);
  check('replay day-10: south cut-position (0,6) UNREACHABLE from (8,0)',
    s10 && s10.paths.south === null, s10 && s10.paths.south);
  check('replay grids match census grids (day 8 and day 10)',
    s8 && JSON.stringify(s8.grid) === JSON.stringify(d8.grid) && s10 && JSON.stringify(s10.grid) === JSON.stringify(d10.grid));

  // ---------- Part C: determinism ----------
  const detPath = path.join(EVID, 'sim-walktree-b-corpus-determinism', 'walktree-b-nighttravel-s15003.json');
  const onPath = path.join(EVID, 'sim-walktree-b-corpus-on', 'walktree-b-nighttravel-s15003.json');
  if (fs.existsSync(detPath) && fs.existsSync(onPath)) {
    check('determinism re-run (15003 ON) byte-identical',
      fs.readFileSync(detPath, 'utf8') === fs.readFileSync(onPath, 'utf8'));
  } else {
    check('determinism re-run file exists', false, 'run the determinism leg before this proof');
  }

  console.log('walktree proof: ' + pass + ' pass, ' + fail + ' fail');
  if (fail) process.exit(1);
}

main().catch((e) => { console.error('WALKTREE PROOF CRASH', e && (e.stack || e)); process.exit(2); });
