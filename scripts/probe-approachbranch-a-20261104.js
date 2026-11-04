// probe-approachbranch-a-20261104.js — replay a TRUE-approach geometry
// through the REAL competent policy (arm sim-approachbranch-a).
//
// Corpus: evidence/2026-11-04/perseed-fleerepair-a/
// fleerepair-s99601-confirm-fleerepair.json, exposure seq 4
// (influencer, day 100, fleerepair leg = approach fallback OFF):
// player (4,4), Machete range 1, speed 3 (moveLeft 3), HP 100
// (rounds 2-4) then 56 (rounds 5-8) then 25 (round 9); monster
// influencer (4,6), HP 322/850, NEVER moves; Chebyshev distance 2
// (out of range) every turn; 8 player turns, every move
// tbPlayerMove(3,5) -> "No path there.", 0 strikes, 0 waits,
// fighter died. Ally ivy_wang FLED in round 1, before the first
// recorded player turn, so the replay has no allies. Branch split
// (approachbranch-analyze): rounds 2-8 are TRUE-APPROACH (HP >=
// 0.35, not fight-start turns); round 9 (HP 0.25) is 'other' under
// gated rules. Post-mark true-approach turns: 4 (rounds 5-8).
//
// The policy is require()d VERBATIM from the worktree — never
// retyped. Baseline leg: all COMPETENT_* gates cleared. Armed leg:
// scripts/policies/competent-approachfall-b.js required verbatim
// (exactly the four gates; DPS_RACE off). One scenario per process
// so env gates stay clean; the proof test spawns separate processes
// per leg.
//
// FIGHT-START PRIMING: the replay starts at corpus round 2, and the
// fight-start assessment in competent.js runs only on the fight's
// first fight() call (ctx._fightObj !== f). The live fight's first
// call precedes every recorded turn, so the PRIMARY replay primes
// ctx._fightObj to the fight object before turn 1. The UNPRIMED
// sensitivities run the same geometry with fresh ctx to show the
// turn-1 assessment's behavior; they are reported, never judged.
//
// DIRECT COUNTER (not the confounded repick-shape proxy): after
// every turn the harness reads the policy's OWN ctx counters —
// approachFallbackMarks, approachFallbackWaits, approachRepickSteps,
// approachStuckTurns. Reading ctx never alters a decision.
//
// Engine shim: exactly the engine functions the policy calls on this
// path, with game.js semantics for the parts that decide the
// transcript: findPath = BFS over non-blocking cells, no
// corner-cutting; tbPlayerMove = findPath null -> "No path there.",
// path cost > moveLeft -> "Too far", monster-occupied destination
// refused, otherwise step tile by tile deducting moveLeft.
// Terrain: PRIMARY board blocks only (3,5) — the minimal board
// reproducing the corpus line (a blocked destination alone makes
// BFS return null; the live board may instead block a corner-cut
// side of the diagonal step — see the cornercut sensitivity).
// Monster damage is NOT simulated: player HP per turn follows the
// corpus trajectory. Strikes are decision-only, never kill claims
// (monster HP is held at 322). RNG: a fixed-seed deterministic
// Math.random is installed before the policy require so repeat runs
// are byte-identical.
//
// Usage:
//   node scripts/probe-approachbranch-a-20261104.js --leg baseline --scenario primary --out <dir>
//   node scripts/probe-approachbranch-a-20261104.js --leg armed --scenario primary --out <dir>
// Scenarios: primary (primed, map 4,4 haven, blocked 3,5, seq-4 HP,
// 8 turns), seq5 (primed, map 4,4, blocked 3,5, seq-5 HP, 9 turns),
// cornercut (primed, map 4,4, blocked 4,5, seq-4 HP, 8 turns),
// unprimed (fresh ctx, map 4,4, blocked 3,5, seq-4 HP, 8 turns),
// unprimed-node42 (fresh ctx, map 4,2, blocked 3,5, seq-4 HP, 8 turns),
// mapnode42 (primed, map 4,2, blocked 3,5, seq-4 HP, 8 turns).
// --gates approach-only runs the armed leg with ONLY
// COMPETENT_APPROACH_FALLBACK=1 (sensitivity, not the variant file).
// --turns N caps player turns (default per scenario).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

function parseArgs(argv) {
  const o = { leg: 'baseline', scenario: 'primary', out: null, turns: null, gates: 'leg' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--leg') o.leg = argv[++i];
    else if (a === '--scenario') o.scenario = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--turns') o.turns = parseInt(argv[++i], 10) || null;
    else if (a === '--gates') o.gates = argv[++i];
    else { console.error('PROBE STOP: unknown arg ' + a); process.exit(2); }
  }
  if (o.leg !== 'baseline' && o.leg !== 'armed') { console.error('PROBE STOP: --leg baseline|armed'); process.exit(2); }
  if (!o.out) { console.error('PROBE STOP: --out required'); process.exit(2); }
  return o;
}
const ARGS = parseArgs(process.argv.slice(2));

// Fixed-seed deterministic RNG before any policy require.
(function seedRng() {
  let s = 99601;
  Math.random = function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x80000000;
  };
})();

const GATES = ['COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE',
  'COMPETENT_FLEE_REPAIR', 'COMPETENT_APPROACH_FALLBACK'];
function clearGates() { for (const k of GATES) delete process.env[k]; delete process.env.COMPETENT_DPS_RACE; delete process.env.COMPETENT_FIGHT_ASSESS; }

// HP trajectory by replay-turn index (1-based). seq4: turns 1-3: 100,
// turns 4-7: 56, turn 8: 25. seq5: turns 1-5: 100, turns 6-7: 63,
// turn 8: 33, turn 9: 2.
function hpSeq4(i) { if (i <= 3) return 100; if (i <= 7) return 56; return 25; }
function hpSeq5(i) { if (i <= 5) return 100; if (i <= 7) return 63; if (i === 8) return 33; return 2; }

const SCENARIOS = {
  primary: { map: [4, 4], blocked: ['3,5'], hp: hpSeq4, turns: 8, primed: true },
  seq5: { map: [4, 4], blocked: ['3,5'], hp: hpSeq5, turns: 9, primed: true },
  cornercut: { map: [4, 4], blocked: ['4,5'], hp: hpSeq4, turns: 8, primed: true },
  bothsides: { map: [4, 4], blocked: ['4,5', '3,4'], hp: hpSeq4, turns: 8, primed: true },
  unprimed: { map: [4, 4], blocked: ['3,5'], hp: hpSeq4, turns: 8, primed: false },
  'unprimed-node42': { map: [4, 2], blocked: ['3,5'], hp: hpSeq4, turns: 8, primed: false },
  mapnode42: { map: [4, 2], blocked: ['3,5'], hp: hpSeq4, turns: 8, primed: true },
};
const SC = SCENARIOS[ARGS.scenario];
if (!SC) { console.error('PROBE STOP: unknown scenario ' + ARGS.scenario); process.exit(2); }
const BLOCKED = new Set(SC.blocked);
const TURNS = ARGS.turns || SC.turns;

function findPath(sx, sy, tx, ty) {
  const key = (x, y) => x + ',' + y;
  if (BLOCKED.has(key(tx, ty))) return null;
  const visited = new Set([key(sx, sy)]);
  const queue = [[sx, sy, []]];
  const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (queue.length) {
    const cur = queue.shift();
    const x = cur[0], y = cur[1], pth = cur[2];
    if (x === tx && y === ty) return pth.length ? pth : [[tx, ty]];
    for (const d of DIRS) {
      const nx = x + d[0], ny = y + d[1];
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
      if (visited.has(key(nx, ny))) continue;
      if (BLOCKED.has(key(nx, ny))) continue;
      if (d[0] !== 0 && d[1] !== 0) {
        if (BLOCKED.has(key(x, ny)) || BLOCKED.has(key(nx, y))) continue;
      }
      visited.add(key(nx, ny));
      queue.push([nx, ny, pth.concat([[nx, ny]])]);
    }
  }
  return null;
}

function run() {
  clearGates();
  let policy;
  let gatesUsed;
  if (ARGS.leg === 'armed' && ARGS.gates === 'leg') {
    const variant = require(path.join(REPO, 'scripts', 'policies', 'competent-approachfall-b'));
    policy = variant.competent;
    gatesUsed = 'variant-file (4 gates)';
  } else {
    const base = require(path.join(REPO, 'scripts', 'policies', 'competent'));
    policy = base.competent;
    if (ARGS.leg === 'armed' && ARGS.gates === 'approach-only') {
      process.env.COMPETENT_APPROACH_FALLBACK = '1';
      gatesUsed = 'approach-only';
    } else {
      gatesUsed = 'none (gate-off)';
    }
  }

  const player = { key: 'p', kind: 'player', mx: 4, my: 4, hp: SC.hp(1), maxHp: 100, moveLeft: 3, acted: false, alive: true, speed: 3 };
  const monster = { key: 'm_0', kind: 'monster', mx: 4, my: 6, hp: 322, maxHp: 850, alive: true, monsterId: 'influencer', mdef: { id: 'influencer' } };
  const fight = { id: 'fleer99601-seq4', over: false, round: 1, fighters: [player, monster] };
  const sayLines = [];
  const turnActions = [];
  let turnActive = true;
  let endTurnCalls = 0;

  const Game = {
    tbfight: fight,
    map: { px: SC.map[0], py: SC.map[1] },
    state: { scholar: { day: 100, kcal: 500, hp: player.hp }, monsterCounters: {}, codex: {} },
    data: { monsters: [{ id: 'influencer', wave: 4 }], abilities: [] },
    tbIsPlayerTurn: function () { return turnActive && !fight.over; },
    tbFighter: function (k) {
      if (k === 'p') return player;
      for (const f of fight.fighters) if (f.key === k) return f;
      return null;
    },
    tbAfterPlayerAction: function () { endTurnCalls++; },
    tbPlayerMove: function (cx, cy) {
      turnActions.push({ fn: 'tbPlayerMove', args: [cx, cy] });
      if (!turnActive || fight.over) return false;
      if (player.moveLeft <= 0) { sayLines.push('No movement left this turn.'); turnActions[turnActions.length - 1].returned = false; return false; }
      const pth = findPath(player.mx, player.my, cx, cy);
      if (!pth || !pth.length) { sayLines.push('No path there.'); turnActions[turnActions.length - 1].returned = false; return false; }
      if (pth.length > player.moveLeft) { sayLines.push('Too far — ' + player.moveLeft + ' squares left.'); turnActions[turnActions.length - 1].returned = false; return false; }
      if (monster.alive && monster.mx === cx && monster.my === cy) { sayLines.push("You don't stroll through the influencer."); turnActions[turnActions.length - 1].returned = false; return false; }
      for (const step of pth) { player.mx = step[0]; player.my = step[1]; player.moveLeft -= 1; }
      turnActions[turnActions.length - 1].returned = true;
      return true;
    },
    tbPlayerWait: function () {
      turnActions.push({ fn: 'tbPlayerWait', args: [], returned: true });
      player.acted = true; player.moveLeft = 0; return true;
    },
    tbPlayerStrike: function (key) {
      turnActions.push({ fn: 'tbPlayerStrike', args: [key], returned: true });
      player.acted = true; return true;
    },
    tbPlayerShout: function () { turnActions.push({ fn: 'tbPlayerShout', args: [], returned: false }); return false; },
    tbPlayerOfferFood: function () { turnActions.push({ fn: 'tbPlayerOfferFood', args: [], returned: false }); return false; },
    tbBarrierExit: function (dx, dy) {
      turnActions.push({ fn: 'tbBarrierExit', args: [dx, dy], returned: true });
      fight.over = true; return true;
    },
    equippedWeapon: function () { return { range: 1, name: 'Machete' }; },
    findPath: findPath,
    fighterDistTo: function (m, x, y) { return Math.max(Math.abs(m.mx - x), Math.abs(m.my - y)); },
    tbTerrainCost: function () { return 1; },
    hasAbility: function () { return false; },
    counterTeachable: function () { return false; },
    tileAt: function (x, y) { return (x === 4 && y === 4) ? { type: 'haven' } : { type: 'wild' }; },
    mapSeen: function () { return false; },
    monsterAt: function () { return false; },
    say: function (line) { sayLines.push(line); },
  };

  const ctx = {};
  if (SC.primed) ctx._fightObj = fight;
  const turns = [];
  function counterSnap() {
    return {
      marks: ctx.approachFallbackMarks || 0,
      waits: ctx.approachFallbackWaits || 0,
      repickSteps: ctx.approachRepickSteps || 0,
      stuckTurns: ctx.approachStuckTurns || 0,
      fleeBlocked: !!ctx._fleeBlockedFor,
      approachBlocked: !!ctx._approachBlockedFor,
    };
  }
  // Replicate the policy's approach-tile choice (nearest tile adjacent
  // to the monster, dx-first tie-break, monster-occupied excluded) so a
  // move can be recognised as an approach step even when it is a
  // detour step along a longer path (bothsides turn 1: (2,3) lies on
  // the path to (3,5), so it is approach-issued, not a flee walk —
  // the adjacency heuristic alone mislabels detour steps as flee).
  function approachTarget(px, py) {
    let bx = null, by = null, bd = 1e9;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      const cx = monster.mx + dx, cy = monster.my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      if (cx === monster.mx && cy === monster.my) continue;
      const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
      if (dd < bd) { bd = dd; bx = cx; by = cy; }
    }
    return [bx, by];
  }
  function branchFor(rec, before) {
    if (rec.actions.some(function (a) { return a.fn === 'tbBarrierExit'; })) return 'flee-exit';
    if (rec.actions.some(function (a) { return a.fn === 'tbPlayerWait'; })) return before.approachBlocked || before.marks > 0 ? 'approach-wait' : 'wait-other';
    const mv = rec.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; });
    const struck = rec.actions.some(function (a) { return a.fn === 'tbPlayerStrike'; });
    if (struck && mv.some(function (a) { return a.returned === false; }) && rec.hpStart < 35) return 'flee-fallthrough-strike';
    if (struck) return 'strike';
    if (!mv.length) return 'other';
    if (mv.some(function (a) { return a.returned === false; }) && mv.some(function (a) { return a.returned === true; })) return 'flee-repair-fallthrough';
    if (rec.countersAfter.repickSteps > before.repickSteps) return 'approach-repick';
    if (before.approachBlocked) return 'approach-blocked-step';
    const last = mv[mv.length - 1].args;
    const bx = approachTarget(rec.pre.mx, rec.pre.my);
    const pth = findPath(rec.pre.mx, rec.pre.my, bx[0], bx[1]);
    if ((last[0] === bx[0] && last[1] === bx[1]) ||
        (pth && pth.some(function (step) { return step[0] === last[0] && step[1] === last[1]; }))) return 'approach';
    return 'flee';
  }

  for (let i = 1; i <= TURNS; i++) {
    if (fight.over) break;
    player.hp = SC.hp(i);
    player.moveLeft = 3; player.acted = false;
    fight.round = i + 1;
    turnActive = true;
    const pre = { mx: player.mx, my: player.my, hp: player.hp };
    const before = counterSnap();
    const sayStart = sayLines.length, actStart = turnActions.length, endStart = endTurnCalls;
    let handled = false;
    try { handled = policy.fight(Game, ctx); } catch (e) { turns.push({ turn: i, error: String(e && e.message) }); break; }
    turnActive = false;
    const rec = {
      turn: i, round: fight.round, hpStart: pre.hp,
      pre: pre, post: { mx: player.mx, my: player.my, hp: player.hp, moveLeft: player.moveLeft, acted: player.acted },
      handled: !!handled,
      actions: turnActions.slice(actStart).map(function (a) { return { fn: a.fn, args: a.args, returned: !!a.returned }; }),
      say: sayLines.slice(sayStart),
      endTurnCalls: endTurnCalls - endStart,
      countersBefore: before, countersAfter: counterSnap(),
    };
    rec.branch = branchFor(rec, before);
    turns.push(rec);
    if (fight.over) break;
  }

  // Max same-target blocked run: consecutive zero-tile move turns with
  // the same move target (any branch — the corpus shape's definition).
  // Also the POST-FIRING run: the same count restricted to turns after
  // the first turn whose countersAfter.marks >= 1.
  let maxRun = 0, run = 0, lastTarget = null;
  let firstMarkTurn = null;
  for (const t of turns) {
    if (firstMarkTurn == null && t.countersAfter && t.countersAfter.marks >= 1) firstMarkTurn = t.turn;
    const mv = t.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; });
    const zero = mv.length > 0 && t.post.mx === t.pre.mx && t.post.my === t.pre.my;
    const tgt = mv.length ? mv[mv.length - 1].args.join(',') : null;
    if (zero && tgt === lastTarget) run++;
    else if (zero) { run = 1; lastTarget = tgt; }
    else { run = 0; lastTarget = null; }
    if (run > maxRun) maxRun = run;
  }
  let postFiringMaxRun = 0;
  if (firstMarkTurn != null) {
    run = 0; lastTarget = null;
    for (const t of turns) {
      if (t.turn <= firstMarkTurn) continue;
      const mv = t.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; });
      const zero = mv.length > 0 && t.post.mx === t.pre.mx && t.post.my === t.pre.my;
      const tgt = mv.length ? mv[mv.length - 1].args.join(',') : null;
      if (zero && tgt === lastTarget) run++;
      else if (zero) { run = 1; lastTarget = tgt; }
      else { run = 0; lastTarget = null; }
      if (run > postFiringMaxRun) postFiringMaxRun = run;
    }
  }
  const final = counterSnap();
  const summary = {
    turns: turns.length, fightOver: !!fight.over, finalPos: [player.mx, player.my],
    moves: turns.reduce(function (s, t) { return s + t.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; }).length; }, 0),
    noPathLines: turns.reduce(function (s, t) { return s + t.say.filter(function (l) { return l === 'No path there.'; }).length; }, 0),
    waits: turns.reduce(function (s, t) { return s + t.actions.filter(function (a) { return a.fn === 'tbPlayerWait'; }).length; }, 0),
    strikes: turns.reduce(function (s, t) { return s + t.actions.filter(function (a) { return a.fn === 'tbPlayerStrike'; }).length; }, 0),
    barrierExits: turns.reduce(function (s, t) { return s + t.actions.filter(function (a) { return a.fn === 'tbBarrierExit'; }).length; }, 0),
    maxSameTargetBlockedRun: maxRun,
    firstMarkTurn: firstMarkTurn,
    postFiringMaxRun: postFiringMaxRun,
    branches: turns.map(function (t) { return t.branch; }),
    countersFinal: final,
    firstNonLoopTurn: (function () {
      for (const t of turns) {
        const mv = t.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; });
        const zero = mv.length > 0 && t.post.mx === t.pre.mx && t.post.my === t.pre.my;
        if (!zero) return t.turn;
      }
      return null;
    })(),
  };
  const out = {
    scenario: ARGS.scenario, leg: ARGS.leg, gates: gatesUsed,
    mapNode: SC.map, blockedTiles: SC.blocked, primed: SC.primed,
    geometry: { playerStart: [4, 4], monster: 'influencer', monsterPos: [4, 6], monsterHp: [322, 850], weapon: 'Machete', weaponRange: 1, moveLeftPerTurn: 3 },
    turns: turns, summary: summary,
  };
  fs.mkdirSync(ARGS.out, { recursive: true });
  const base = 'approachbranch-' + ARGS.scenario + '-' + ARGS.leg + (ARGS.gates !== 'leg' ? '-' + ARGS.gates : '');
  fs.writeFileSync(path.join(ARGS.out, base + '.json'), JSON.stringify(out, null, 2) + '\n');
  const lines = [];
  lines.push('scenario=' + ARGS.scenario + ' leg=' + ARGS.leg + ' gates=' + gatesUsed + ' map=' + SC.map.join(',') + ' blocked=' + SC.blocked.join(';') + ' primed=' + SC.primed);
  for (const t of turns) {
    const acts = t.actions.map(function (a) { return a.fn + '(' + a.args.join(',') + ')'; }).join(' ');
    lines.push('turn ' + t.turn + ' round ' + t.round + ' hp ' + t.hpStart + ' [' + t.pre.mx + ',' + t.pre.my + ']->[' + t.post.mx + ',' + t.post.my + '] branch=' + t.branch + ' ' + acts + (t.say.length ? ' SAY: ' + t.say.join(' | ') : '') + ' counters=' + JSON.stringify(t.countersAfter));
  }
  lines.push('SUMMARY ' + JSON.stringify(summary));
  fs.writeFileSync(path.join(ARGS.out, base + '.txt'), lines.join('\n') + '\n');
  console.log(base + ' turns=' + summary.turns + ' marks=' + final.marks + ' waits=' + final.waits + ' repicks=' + final.repickSteps + ' stuck=' + final.stuckTurns + ' maxRun=' + maxRun + ' firstMark=' + firstMarkTurn + ' postFiringMaxRun=' + postFiringMaxRun + ' strikes=' + summary.strikes + ' exits=' + summary.barrierExits + ' branches=' + summary.branches.join(','));
}

run();
