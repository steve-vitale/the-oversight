#!/usr/bin/env node
// test-tickfell-a.js — proof for sim-tickfell-a.
// Unit checks for the pure decisions in scripts/policies/
// tickfell-diag.js, plus corpus checks when four corpus dirs
// are passed (control-guard, control-on, tickfell-guard,
// tickfell-on, in that order). Corpus checks re-derive the
// census through scripts/analyze-tickfell-a.js and assert the
// invariants the verdict rests on — never the verdict itself
// by hand.
// Usage: node scripts/test-tickfell-a.js [cgDir coDir tgDir toDir]
'use strict';
const fs = require('fs');
const path = require('path');
const tf = require('./policies/tickfell-diag');
const an = require('./analyze-tickfell-a');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra ? ' :: ' + extra : '')); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), 'got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b)); }

// ---- strandDecision ----
eq('strand game-over', tf.strandDecision({ gameOver: true, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }),
  { fire: false, skip: 'game-over' });
eq('strand combat', tf.strandDecision({ gameOver: false, combatLive: true, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }),
  { fire: false, skip: 'combat' });
eq('strand prev-not-stranded (rescued)', tf.strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: true, wakeTileType: 'creek', insideHaven: false }),
  { fire: false, skip: 'prev-not-stranded' });
eq('strand prev-not-stranded (completed)', tf.strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'completed', prevBucket: null, prevRescued: null, wakeTileType: 'creek', insideHaven: false }),
  { fire: false, skip: 'prev-not-stranded' });
eq('strand prev-not-stranded (null prev)', tf.strandDecision({ gameOver: false, combatLive: false, prevOutcome: null, prevBucket: null, prevRescued: null, wakeTileType: 'creek', insideHaven: false }),
  { fire: false, skip: 'prev-not-stranded' });
eq('strand haven-morning', tf.strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'haven', insideHaven: false }),
  { fire: false, skip: 'haven-morning' });
eq('strand inside-haven', tf.strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: true }),
  { fire: false, skip: 'haven-morning' });
eq('strand fires', tf.strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }),
  { fire: true });

// ---- tickProjection ----
eq('proj roomy morning', tf.tickProjection({ morningTicksLeft: 256, walkSteps: 0 }), 120);
eq('proj tight morning', tf.tickProjection({ morningTicksLeft: 128, walkSteps: 0 }), -8);
eq('proj walk costs', tf.tickProjection({ morningTicksLeft: 256, walkSteps: 3 }), 117);
eq('proj boundary 96', tf.tickProjection({ morningTicksLeft: 232, walkSteps: 0 }), 96);
eq('proj boundary 95', tf.tickProjection({ morningTicksLeft: 231, walkSteps: 0 }), 95);

// ---- fellDecision (order: pack -> tool -> kcal -> ticks) ----
eq('fell fires', tf.fellDecision({ wood: 2, canFell: true, kcal: 500, morningTicksLeft: 256, walkSteps: 0 }),
  { fire: true, projected: 120 });
eq('fell pack-ready beats tool-gate', tf.fellDecision({ wood: 4, canFell: false, kcal: 0, morningTicksLeft: 0, walkSteps: 0 }).skip, 'pack-ready');
eq('fell tool-gate beats kcal-floor', tf.fellDecision({ wood: 2, canFell: false, kcal: 0, morningTicksLeft: 256, walkSteps: 0 }).skip, 'tool-gate');
eq('fell cutinfo-unknown', tf.fellDecision({ wood: 2, canFell: null, kcal: 500, morningTicksLeft: 256, walkSteps: 0 }).skip, 'cutinfo-unknown');
eq('fell kcal-floor beats ticks-gate', tf.fellDecision({ wood: 2, canFell: true, kcal: 79, morningTicksLeft: 128, walkSteps: 0 }).skip, 'kcal-floor');
eq('fell kcal boundary 80 passes kcal, ticks decide', tf.fellDecision({ wood: 2, canFell: true, kcal: 80, morningTicksLeft: 128, walkSteps: 0 }).skip, 'ticks-gate');
eq('fell ticks-gate', tf.fellDecision({ wood: 2, canFell: true, kcal: 500, morningTicksLeft: 128, walkSteps: 0 }).skip, 'ticks-gate');
eq('fell ticks boundary fires', tf.fellDecision({ wood: 2, canFell: true, kcal: 500, morningTicksLeft: 232, walkSteps: 0 }).fire, true);
eq('fell wood-unknown', tf.fellDecision({ wood: null, canFell: true, kcal: 500, morningTicksLeft: 256, walkSteps: 0 }).skip, 'wood-unknown');
eq('fell walk pushes under gate', tf.fellDecision({ wood: 2, canFell: true, kcal: 500, morningTicksLeft: 256, walkSteps: 25 }).skip, 'ticks-gate');

// ---- findWoodTarget ----
function gridFrom(rows) { return rows.map((r) => r.split('')); }
const neverBlock = () => false;
eq('target none on empty', tf.findWoodTarget(gridFrom(['.........', '.........', '.........', '.........', '.........', '.........', '.........', '.........', '.........']), [4, 4], neverBlock), null);
eq('target bush ignored', tf.findWoodTarget(gridFrom(['.........', '.........', '.........', '.........', '....b....', '.........', '.........', '.........', '.........']).map((row) => row.map((c) => (c === 'b' ? 'bush' : 'grass'))), [4, 4], neverBlock), null);
{
  // Adjacent tree: path empty, stance is the villager cell.
  const g = gridFrom(['.........', '.........', '.........', '.........', '....t....', '.........', '.........', '.........', '.........'])
    .map((row) => row.map((c) => (c === 't' ? 'tree' : 'grass')));
  const r = tf.findWoodTarget(g, [4, 3], neverBlock);
  eq('target adjacent path empty', r.path, []);
  eq('target adjacent target', r.target, { x: 4, y: 4, cell: 'tree' });
}
{
  // Bigtree beats tree at equal path length; row-major breaks
  // remaining ties. Villager at (4,4); bigtree at (4,6) via
  // stance (4,5) path 1; tree at (6,4) via stance (5,4) path 1.
  const g = Array.from({ length: 9 }, () => Array(9).fill('grass'));
  g[6][4] = 'bigtree'; g[4][6] = 'tree';
  const r = tf.findWoodTarget(g, [4, 4], neverBlock);
  eq('target bigtree tie-break', r.target.cell, 'bigtree');
  // Equal-distance stances: the scan takes the first minimal
  // one (dy -1, dx -1 first), i.e. (3,5) — a valid 1-step
  // diagonal stance, not the orthogonal (4,5).
  eq('target bigtree path', r.path, [[3, 5]]);
}
{
  // Wall blocks: tree behind a wall row is unreachable.
  const g = Array.from({ length: 9 }, () => Array(9).fill('grass'));
  for (let x = 0; x < 9; x++) g[5][x] = 'wall';
  g[6][4] = 'tree';
  const blocks = (c) => c === 'wall';
  eq('target behind wall null', tf.findWoodTarget(g, [4, 4], blocks), null);
}
{
  // Wall at (4,5) blocks the orthogonal approach to tree
  // (4,6), but a diagonal stance (3,5) is still 1 step away
  // — the BFS correctly finds the 1-step diagonal, not a
  // 2-step detour. (A true 2-step case needs a wall pocket;
  // the detour property is covered by the BFS distance
  // itself, unit-checked via the path-length assertions.)
  const g = Array.from({ length: 9 }, () => Array(9).fill('grass'));
  g[5][4] = 'wall'; g[6][4] = 'tree';
  const blocks = (c) => c === 'wall';
  const r = tf.findWoodTarget(g, [4, 4], blocks);
  check('target detour path length 1', r && r.path.length === 1, JSON.stringify(r));
  check('target detour stance adjacent', r && Math.max(Math.abs(r.stance[0] - 4), Math.abs(r.stance[1] - 6)) <= 1, JSON.stringify(r));
}
check('constants', tf.WOOD_NEEDED === 4 && tf.FELL_TICKS === 96 && tf.FELL_KCAL === 80 && tf.BRIDGE_TICKS === 96 && tf.ROUTINE_ALLOWANCE === 40, 'constants drifted');

// ---- corpus checks (only when dirs are passed) ----
const dirs = process.argv.slice(2);
if (dirs.length === 4) {
  const [cg, co, tg, to] = dirs.map((d, i) => an.analyzeLeg(d, ['control-guard', 'control-on', 'tickfell-guard', 'tickfell-on'][i]));
  for (const leg of [cg, co, tg, to]) {
    for (const seed of Object.keys(leg.seeds)) {
      const s = leg.seeds[seed];
      check(leg.leg + ' seed ' + seed + ' errs 0', s.errs.wc === 0 && s.errs.ww === 0 && s.errs.tf === 0, JSON.stringify(s.errs));
      check(leg.leg + ' seed ' + seed + ' survived 30d', s.daysAlive === 30, 'daysAlive=' + s.daysAlive);
      check(leg.leg + ' seed ' + seed + ' strand mornings joined', s.strandMornings.every((m) => (leg.leg.indexOf('control') === 0) || m.tickfellRecord !== null),
        'unjoined mornings: ' + s.strandMornings.filter((m) => !m.tickfellRecord).map((m) => m.morningLoopDay).join(','));
    }
  }
  for (const leg of [cg, co]) {
    for (const seed of Object.keys(leg.seeds)) {
      const s = leg.seeds[seed];
      check(leg.leg + ' seed ' + seed + ' control store empty', s.tickfellAttempts === 0 && s.tickfellSkips === 0,
        'attempts=' + s.tickfellAttempts + ' skips=' + s.tickfellSkips);
    }
  }
  for (const leg of [tg, to]) {
    for (const seed of Object.keys(leg.seeds)) {
      const s = leg.seeds[seed];
      // Re-read raw store for attempt-level invariants.
      const doc = JSON.parse(fs.readFileSync(path.join(leg.dir, s.file), 'utf8'));
      const atts = (doc.tickfellStore || {}).attempts || [];
      const skips = (doc.tickfellStore || {}).skips || [];
      const attDays = atts.map((a) => a.loopDay);
      check(leg.leg + ' seed ' + seed + ' at most one attempt per morning', new Set(attDays).size === attDays.length, 'dup days');
      for (const a of atts) {
        check(leg.leg + ' seed ' + seed + ' attempt loopDay ' + a.loopDay + ' canFell true', a.fired === true && a.cutInfo && a.cutInfo.canFell === true, JSON.stringify(a.cutInfo));
        check(leg.leg + ' seed ' + seed + ' attempt loopDay ' + a.loopDay + ' projected >= 96', a.projected >= 96, 'projected=' + a.projected);
        check(leg.leg + ' seed ' + seed + ' attempt loopDay ' + a.loopDay + ' walk steps match path', a.steps.length === a.path.length, 'steps=' + a.steps.length + ' path=' + a.path.length);
        if (!a.error) check(leg.leg + ' seed ' + seed + ' attempt loopDay ' + a.loopDay + ' fell yields 2..9 wood', (a.woodAfter - a.woodBefore) >= 2 && (a.woodAfter - a.woodBefore) <= 9, 'delta=' + (a.woodAfter - a.woodBefore));
      }
      for (const sk of skips) {
        if (sk.skip === 'tool-gate' || sk.skip === 'cutinfo-unknown') {
          check(leg.leg + ' seed ' + seed + ' skip loopDay ' + sk.loopDay + ' ' + sk.skip + ' has no attempt', attDays.indexOf(sk.loopDay) === -1, 'attempt exists');
        }
      }
      // Every strand morning on a tickfell leg has exactly one
      // record (attempt or skip) for that loopDay.
      const recDays = new Set([...attDays, ...skips.map((x) => x.loopDay)]);
      for (const m of s.strandMornings) {
        check(leg.leg + ' seed ' + seed + ' strand morning ' + m.morningLoopDay + ' recorded', recDays.has(m.morningLoopDay), 'missing');
      }
    }
  }
  const j = an.judgeLegs(cg, co, tg, to);
  check('judgement clauses are booleans', typeof j.clauseA === 'boolean' && typeof j.clauseB === 'boolean' && typeof j.clauseC === 'boolean', JSON.stringify(j));
  check('judgement verdict matches clauses', j.verdict === ((j.clauseA && j.clauseB && j.clauseC) ? 'GO' : 'NO-GO'), j.verdict);
}

console.log('test-tickfell-a: ' + pass + ' passed, ' + fail + ' failed' + (fail ? '\nFAILURES:\n' + failures.join('\n') : ''));
process.exit(fail ? 1 : 0);
