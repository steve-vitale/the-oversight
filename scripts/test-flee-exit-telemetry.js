#!/usr/bin/env node
// scripts/test-flee-exit-telemetry.js — proof test for the scale-wall r17
// arm 3 flee-exit instrument (scripts/sweep-compare.js: fleeExitSummary,
// wired into scripts/sweep-dmgaudit-r16-20261013.js).
//
// The blank (r16): the sweep driver's flee telemetry counted ATTEMPTS —
// ctx.fled increments on every flee() tick (edge walks, held ground, no-op
// pushes, real exits). leadcourt s22 logged 5,410 flee() ticks across 13
// fights with ZERO fights ending 'fled'. This instrument counts actual
// fight EXITS separately: a genuine disengage exit is a per-fight audit
// record closed with result 'fled' (door flee, barrier push with no
// chasers / into Haven / all chasers gave up, or the tbEndCheck p.fled
// path — game.js). 'dissolved' (death mid-barrier-crossing, or a fight
// abandoned without tbEnd) is NOT an exit: nobody walked out of it.
//
// Part A (synthetic, live engine, seeded): three fights with known
// outcomes — one genuine barrier exit ('fled'), one strike-down ('won'),
// one barrier-death dissolve ('dissolved', closed through the instrument's
// real closeIfAbandoned path) — must count exactly: exits=1, dissolved=1.
// Part B (replay): the stored r16 baseline JSON must read leadcourt s22 =
// 0 exits / 5,410 attempts / 13 fights, and every run's helper exits must
// equal its records with result==='fled' exactly.
//
// TOOLING only. No game-code changes.
'use strict';
const path = require('path');
const { loadGame, setupGame, driveFights } = require('./sim-harness');
const { attachDmgAudit } = require('./dmg-audit-20261013');
const { fleeExitSummary } = require('./sweep-compare');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function heal(Game) {
  try {
    const s = Game.state.scholar;
    const full = (typeof Game.maxHealth === 'function' ? Game.maxHealth() : 100) || 100;
    s.hp = full; s.health = full;
  } catch (e) {}
}

// Open a turtle fight that STAYS live. The engine is honest: a follows:false
// monster that spawns out of striking range "comes apart" (tbEndCheck →
// 'routed') during startCombat's opening pass instead of forcing a fight —
// so a fresh startCombat sometimes yields no fight at all. Retry until one
// holds; the come-apart leaves no audit record (the record opens only after
// startCombat returns a live fight).
function openLiveTurtle(Game) {
  for (let i = 0; i < 8; i++) {
    heal(Game);
    try { Game.startCombat('speedbump_turtle'); } catch (e) { /* keep trying */ }
    if (Game.tbfight && !Game.tbfight.over) return Game.tbfight;
  }
  return null;
}

// Put the turtle adjacent to the scholar at 1 HP: the control fights are
// about record-keeping, not combat balance — one strike must end them
// deterministically through the real tbEnd path.
function stageQuickKill(Game) {
  const f = Game.tbfight;
  if (!f) return;
  const p = Game.tbFighter('p');
  const m = f.fighters.find(x => x && x.kind === 'monster' && (x.hp || 0) > 0);
  if (p && m) {
    m.mx = Math.max(0, Math.min(8, (p.mx || 4) + 1));
    m.my = Math.max(0, Math.min(8, p.my || 4));
    m.hp = 1;
  }
}

// Drive a genuine barrier exit: turtle (follows:false — nothing can chase)
// at a grid edge, push through toward an in-bounds neighbor node. The
// engine's no-chasers path ends the fight via tbEnd('fled').
function barrierExit(Game) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let i = 0; i < 8 && Game.tbfight && !Game.tbfight.over; i++) {
    const [dx, dy] = dirs[i % 4];
    const nx = Game.map.px + dx, ny = Game.map.py + dy;
    if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue; // world edge: push is a spent turn
    const p = Game.tbFighter('p');
    if (!p) return false;
    p.mx = dx < 0 ? 0 : dx > 0 ? 8 : 4;
    p.my = dy < 0 ? 0 : dy > 0 ? 8 : 4;
    p.moveLeft = 99; p.acted = false;
    let r = false;
    try { r = Game.tbBarrierExit(dx, dy); } catch (e) { return false; }
    if (!r) return false;
    // A blocked far side consumes the push but the fight continues (still
    // the player's turn — try the next direction).
  }
  return !Game.tbfight || Game.tbfight.over;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'flee-exit-test' });
  await setupGame(Game);
  const audit = attachDmgAudit(Game);
  ok('instrument attached', !!audit && Array.isArray(audit.fights));

  // --- Fight 1: genuine disengage exit ---------------------------------
  const f1 = openLiveTurtle(Game);
  ok('fight 1 opened and held', !!(f1 && !f1.over));
  ok('fight 1: player turn at open', Game.tbIsPlayerTurn() === true);
  const exited = barrierExit(Game);
  const rec1 = audit.fights[audit.fights.length - 1];
  ok('fight 1: barrier push ended the fight', exited === true);
  ok('fight 1: record closed as fled (genuine exit)', rec1 && rec1.result === 'fled',
    'got ' + (rec1 && rec1.result));

  // --- Fight 2: control — strike-down is not an exit --------------------
  const f2 = openLiveTurtle(Game);
  ok('fight 2 opened and held', !!(f2 && !f2.over));
  stageQuickKill(Game);
  driveFights(Game, { fight: () => false }, {});
  const rec2 = audit.fights[audit.fights.length - 1];
  ok('fight 2: ended', !Game.tbfight || Game.tbfight.over);
  ok('fight 2: record closed as won (not an exit)', rec2 && rec2.result === 'won',
    'got ' + (rec2 && rec2.result));

  // --- Fight 3: barrier-death dissolve is not an exit -------------------
  // Reproduce tbBarrierExit's death-mid-crossing dissolve EXACTLY
  // (over=true, result='dissolved', tbfight=null), then let the
  // instrument's real closeIfAbandoned path (inside the startCombat
  // wrapper) close the record.
  const fC = openLiveTurtle(Game);
  ok('fight 3 opened and held', !!(fC && !fC.over));
  fC.over = true; fC.result = 'dissolved'; Game.tbfight = null;
  const fD = openLiveTurtle(Game); // wrapper closes fight 3 as 'dissolved'
  ok('fight 4 opened after the dissolve', !!(fD && !fD.over));
  const rec3 = audit.fights[audit.fights.length - 1];
  ok('fight 3: record closed as dissolved via real instrument path',
    rec3 && rec3.result === 'dissolved', 'got ' + (rec3 && rec3.result));
  stageQuickKill(Game);
  driveFights(Game, { fight: () => false }, {});
  const rec4 = audit.fights[audit.fights.length - 1];
  ok('fight 4: follow-up ended won', rec4 && rec4.result === 'won',
    'got ' + (rec4 && rec4.result));

  // --- The count must be exact ------------------------------------------
  // Synthetic ctx: 5 flee() attempt ticks across the session (blocked
  // pushes, edge walks, the one real exit) — attempts live in ctx, exits
  // in the fight records, and the summary reports both.
  const sum = fleeExitSummary(audit.fights, { fled: 5 });
  ok('synthetic: 4 fight records', sum.nFights === 4, 'got ' + sum.nFights);
  ok('synthetic: exactly 1 exit', sum.exits === 1, 'got ' + sum.exits);
  ok('synthetic: exactly 1 dissolved (not an exit)', sum.dissolved === 1,
    'got ' + sum.dissolved);
  ok('synthetic: attempts carried from ctx', sum.attempts === 5, 'got ' + sum.attempts);
  ok('synthetic: byResult {fled:1, won:2, dissolved:1}',
    sum.byResult.fled === 1 && sum.byResult.won === 2 && sum.byResult.dissolved === 1,
    JSON.stringify(sum.byResult));

  // --- Helper robustness --------------------------------------------------
  const empty = fleeExitSummary(undefined, {});
  ok('robust: undefined fights + empty ctx = zeros',
    empty.exits === 0 && empty.attempts === 0 && empty.nFights === 0);
  const noCtx = fleeExitSummary([{ result: 'fled' }]);
  ok('robust: missing ctx defaults attempts to 0, still counts the exit',
    noCtx.exits === 1 && noCtx.attempts === 0);

  // --- Part B: the r16 replay -------------------------------------------
  const base = require(path.join(__dirname, '..', 'evidence', '2026-10-13',
    'sim-scale-wall-r16-dmgmath-baseline.json'));
  const s22 = base.runs.find(r => r.policy === 'leadcourt' && r.seed === 22);
  const s22sum = fleeExitSummary(s22.fights, { fled: s22.fled });
  ok('replay: leadcourt s22 ran 13 fights', s22sum.nFights === 13, 'got ' + s22sum.nFights);
  ok('replay: leadcourt s22 = 5,410 attempt ticks', s22sum.attempts === 5410,
    'got ' + s22sum.attempts);
  ok('replay: leadcourt s22 = 0 genuine exits', s22sum.exits === 0,
    'got ' + s22sum.exits);
  let totA = 0, totE = 0, allExact = true;
  for (const r of base.runs) {
    const s = fleeExitSummary(r.fights, { fled: r.fled });
    totA += s.attempts; totE += s.exits;
    if (s.exits !== r.fights.filter(f => f.result === 'fled').length) allExact = false;
  }
  ok('replay: all 8 runs = 5,515 attempts / 0 exits', totA === 5515 && totE === 0,
    'got ' + totA + '/' + totE);
  ok('replay: helper exits === result-fled records on every run (exactness invariant)',
    allExact === true);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
