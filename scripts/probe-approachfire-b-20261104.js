// probe-approachfire-b-20261104.js — replay the 99605 seq-2 loop geometry
// through the REAL competent policy (arm sim-approachfire-b).
//
// Corpus: evidence/2026-11-04/perseed-approachconf-b/approachconf-s99605-baseline.json,
// exposure seq 2 (influencer, day 136): player (4,7) HP 33.88/100, monster
// (4,5) HP 637/850, Phase blade range 1, moveLeft 1 per turn, 14 player
// turns all tbPlayerMove(0,7) -> "No path there.", 0 strikes, death.
//
// The policy is require()d VERBATIM from the worktree — never retyped.
// Baseline leg: all COMPETENT_* flee/approach gates cleared. Armed leg:
// scripts/policies/competent-approachfall-b.js required verbatim (it sets
// exactly the four gates; DPS_RACE off). One scenario per process so env
// gates stay clean; the proof test spawns separate processes per leg.
//
// DIRECT COUNTER (not the confounded repick-shape proxy): after every
// turn the harness reads the policy's OWN ctx counters, written only by
// the fallback code — approachFallbackMarks, approachFallbackWaits,
// approachRepickSteps, approachStuckTurns. Reading ctx never alters a
// policy decision. No harness-only policy copy exists.
//
// Engine shim: implements exactly the engine functions the policy calls
// on this path, with game.js semantics for the parts that decide the
// transcript: findPath = BFS over non-blocking cells, no corner-cutting;
// tbPlayerMove = findPath null -> "No path there.", path cost >
// moveLeft -> "Too far", monster-occupied destination refused, otherwise
// step tile by tile deducting moveLeft. Terrain: PRIMARY board blocks
// only (0,7) — the minimal board reproducing the corpus line (a blocked
// destination alone makes BFS return null). No difficult terrain, no
// moderator, no eviction wall in the shim (none is evidenced in the
// corpus); tbBarrierExit records a push and ends the fight (the engine's
// stated exit verb — whether a push exits or a chase continues, the
// 14-step loop shape is broken either way, so no verdict rests on it).
// Monster damage is NOT simulated: player HP per round follows the
// corpus trajectory, which keeps the <35% flee line true throughout.
// Allies are held static, as in the corpus. RNG: a fixed-seed
// deterministic Math.random is installed before the policy require so
// repeat runs are byte-identical; no turn in either primary leg
// consults it (no trick/ability action is recorded in either leg).
//
// Usage:
//   node scripts/probe-approachfire-b-20261104.js --leg baseline --scenario primary --out <dir>
//   node scripts/probe-approachfire-b-20261104.js --leg armed --scenario primary --out <dir>
// Scenarios: primary (map 4,2; blocked 0,7), haven (map 4,4; blocked 0,7),
// node55 (map 5,5; blocked 0,7), blocked-adjacent (map 4,4; blocked 0,7 +
// all tiles adjacent to the monster). --gates approach-only runs the
// armed leg with ONLY COMPETENT_APPROACH_FALLBACK=1 (sensitivity, not
// the variant file). --turns N caps player turns (default 20).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

function parseArgs(argv) {
  const o = { leg: 'baseline', scenario: 'primary', out: null, turns: 20, gates: 'leg' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--leg') o.leg = argv[++i];
    else if (a === '--scenario') o.scenario = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--turns') o.turns = parseInt(argv[++i], 10) || 20;
    else if (a === '--gates') o.gates = argv[++i];
    else { console.error('PROBE STOP: unknown arg ' + a); process.exit(2); }
  }
  if (o.leg !== 'baseline' && o.leg !== 'armed') { console.error('PROBE STOP: --leg baseline|armed'); process.exit(2); }
  if (!o.out) { console.error('PROBE STOP: --out required'); process.exit(2); }
  return o;
}
const ARGS = parseArgs(process.argv.slice(2));

// Fixed-seed deterministic RNG before any policy require (repeat runs
// must be byte-identical; see header).
(function seedRng() {
  let s = 99605;
  Math.random = function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x80000000;
  };
})();

const GATES = ['COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE',
  'COMPETENT_FLEE_REPAIR', 'COMPETENT_APPROACH_FALLBACK'];
function clearGates() { for (const k of GATES) delete process.env[k]; delete process.env.COMPETENT_DPS_RACE; delete process.env.COMPETENT_FIGHT_ASSESS; }

const SCENARIOS = {
  primary: { map: [4, 2], blocked: ['0,7'] },
  haven: { map: [4, 4], blocked: ['0,7'] },
  node55: { map: [5, 5], blocked: ['0,7'] },
  'blocked-adjacent': { map: [4, 4], blocked: ['0,7', '3,4', '3,5', '3,6', '4,4', '4,6', '5,4', '5,5', '5,6'] },
};
const SC = SCENARIOS[ARGS.scenario];
if (!SC) { console.error('PROBE STOP: unknown scenario ' + ARGS.scenario); process.exit(2); }
const BLOCKED = new Set(SC.blocked);

// Corpus HP trajectory by player-turn index (1-based; round = index+1).
function hpAtTurn(i) {
  if (i <= 11) return 33.88333333333333;
  if (i === 12) return 17.883333333333333;
  return 1.8833333333333329;
}

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

  const player = { key: 'p', kind: 'player', mx: 4, my: 7, hp: hpAtTurn(1), maxHp: 100, moveLeft: 1, acted: false, alive: true };
  const monster = { key: 'm_0', kind: 'monster', mx: 4, my: 5, hp: 637, maxHp: 850, alive: true, monsterId: 'influencer', mdef: { id: 'influencer' } };
  const allies = [
    { key: 'v_nikolai_volkov', kind: 'villager', mx: 4, my: 4, hp: 100, maxHp: 100, alive: true },
    { key: 'v_visjoin_111', kind: 'villager', mx: 2, my: 5, hp: 91, maxHp: 100, alive: true },
    { key: 'v_visjoin_119', kind: 'villager', mx: 2, my: 4, hp: 77, maxHp: 100, alive: true },
  ];
  const fight = { id: '99605-seq2', over: false, round: 1, fighters: [player, monster].concat(allies) };
  const sayLines = [];
  const turnActions = [];
  let turnActive = true;
  let endTurnCalls = 0;

  const Game = {
    tbfight: fight,
    map: { px: SC.map[0], py: SC.map[1] },
    state: { scholar: { day: 136, kcal: 500, hp: player.hp } },
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
    tbPlayerStudy: function () { return false; },
    tbPlayerOfferFood: function () { return false; },
    tbBarrierExit: function (dx, dy) {
      turnActions.push({ fn: 'tbBarrierExit', args: [dx, dy], returned: true });
      fight.over = true; return true;
    },
    equippedWeapon: function () { return { range: 1, name: 'Phase blade' }; },
    findPath: findPath,
    tileAt: function (x, y) { return (x === 4 && y === 4) ? { type: 'haven' } : { type: 'wild' }; },
    mapSeen: function () { return false; },
    monsterAt: function () { return false; },
    say: function (line) { sayLines.push(line); },
  };

  const ctx = {};
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
  function branchFor(rec, before, after) {
    if (rec.actions.some(function (a) { return a.fn === 'tbBarrierExit'; })) return 'flee-exit';
    if (rec.actions.some(function (a) { return a.fn === 'tbPlayerWait'; })) return before.approachBlocked || before.marks > 0 ? 'approach-wait' : 'wait-other';
    if (rec.actions.some(function (a) { return a.fn === 'tbPlayerStrike'; })) return 'strike';
    const mv = rec.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; });
    if (!mv.length) return 'other';
    // Flee repair marking mid-turn then falling through to an approach
    // step in the SAME turn: a failed flee move followed by a successful
    // move (node55 turn 6 shape). It is neither pure flee nor pure
    // approach — label it as the fallthrough it is.
    if (after.fleeBlocked && !before.fleeBlocked &&
        mv.some(function (a) { return a.returned === false; }) &&
        mv.some(function (a) { return a.returned === true; })) return 'flee-repair-fallthrough';
    if (before.fleeBlocked || before.approachBlocked) return 'approach';
    const last = mv[mv.length - 1].args;
    const adj = Math.max(Math.abs(last[0] - monster.mx), Math.abs(last[1] - monster.my)) === 1;
    if (adj) return 'approach';
    if ((counterSnap().repickSteps || 0) > before.repickSteps) return 'approach';
    return 'flee';
  }

  for (let i = 1; i <= ARGS.turns; i++) {
    if (fight.over) break;
    player.hp = hpAtTurn(i);
    player.moveLeft = 1; player.acted = false;
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
    rec.branch = branchFor(rec, before, rec.countersAfter);
    turns.push(rec);
    if (fight.over) break;
    // Corpus death: after the round-15 player turn the monster kills the
    // fighter on round 16, so player turns end at 14 on the baseline shape.
    if (i >= 14 && ARGS.scenario !== 'blocked-adjacent') {
      // Armed legs may break the shape earlier (exit/strike); keep going
      // to the cap so the break is visible, but never past the corpus
      // death horizon for the baseline shape comparison.
      if (ARGS.leg === 'baseline') break;
    }
  }

  // Max same-target blocked run: consecutive zero-tile move turns with
  // the same move target (any branch — the corpus shape's definition).
  let maxRun = 0, run = 0, lastTarget = null;
  for (const t of turns) {
    const mv = t.actions.filter(function (a) { return a.fn === 'tbPlayerMove'; });
    const zero = mv.length > 0 && t.post.mx === t.pre.mx && t.post.my === t.pre.my;
    const tgt = mv.length ? mv[mv.length - 1].args.join(',') : null;
    if (zero && tgt === lastTarget) run++;
    else if (zero) { run = 1; lastTarget = tgt; }
    else { run = 0; lastTarget = null; }
    if (run > maxRun) maxRun = run;
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
    mapNode: SC.map, blockedTiles: SC.blocked,
    geometry: { playerStart: [4, 7], playerHpStart: 33.88333333333333, monster: 'influencer', monsterPos: [4, 5], monsterHp: [637, 850], weapon: 'Phase blade', weaponRange: 1, moveLeftPerTurn: 1 },
    turns: turns, summary: summary,
  };
  fs.mkdirSync(ARGS.out, { recursive: true });
  const base = 'approachfire-' + ARGS.scenario + '-' + ARGS.leg + (ARGS.gates !== 'leg' ? '-' + ARGS.gates : '');
  fs.writeFileSync(path.join(ARGS.out, base + '.json'), JSON.stringify(out, null, 2) + '\n');
  const lines = [];
  lines.push('scenario=' + ARGS.scenario + ' leg=' + ARGS.leg + ' gates=' + gatesUsed + ' map=' + SC.map.join(',') + ' blocked=' + SC.blocked.join(';'));
  for (const t of turns) {
    const acts = t.actions.map(function (a) { return a.fn + '(' + a.args.join(',') + ')'; }).join(' ');
    lines.push('turn ' + t.turn + ' round ' + t.round + ' hp ' + t.hpStart + ' [' + t.pre.mx + ',' + t.pre.my + ']->[' + t.post.mx + ',' + t.post.my + '] branch=' + t.branch + ' ' + acts + (t.say.length ? ' SAY: ' + t.say.join(' | ') : '') + ' counters=' + JSON.stringify(t.countersAfter));
  }
  lines.push('SUMMARY ' + JSON.stringify(summary));
  fs.writeFileSync(path.join(ARGS.out, base + '.txt'), lines.join('\n') + '\n');
  console.log(base + ' turns=' + summary.turns + ' marks=' + final.marks + ' waits=' + final.waits + ' repicks=' + final.repickSteps + ' maxRun=' + maxRun + ' strikes=' + summary.strikes + ' exits=' + summary.barrierExits + ' branches=' + summary.branches.join(','));
}

run();
