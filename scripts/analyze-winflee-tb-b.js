// analyze-winflee-tb-b.js — TB turn-economy analyzer CLI (arm sim-winflee-b).
// Turn classes, outcome classes, and the damage-ledger rule are the
// tbfinish analyzer's, verbatim (scripts/tbfinish-analyze-20261103.js,
// via require below) — the pilot re-screens the same shapes on current
// master. On top of summarize(), this CLI counts the winflee-b
// shapes: flee-attempt turns, zero-tile moves (a move action whose
// pre/post player position is identical), rage re-presses (a useAbility
// naming rage while rage is already up — read from the transcript,
// which narrates the re-press — or a second rage use in the same
// fight with no strike between), approach-loop turns (move-only turns
// out of range at start AND end), and arena pre-turn flees (an ally
// fighter fled before the first player turn). Emits
// evidence/2026-11-28/winflee-b-tb-analysis.json.
// Usage: node scripts/analyze-winflee-tb-b.js [--selftest]
'use strict';
const fs = require('fs');
const path = require('path');
const TB = require('./tbfinish-analyze-20261103');

function isRageUse(u) {
  if (!u || !u.args) return false;
  for (const a of u.args) if (String(a) === 'rage') return true;
  return false;
}

function zeroTileMoves(ex) {
  // A move action whose pre/post player position is identical.
  let n = 0; const turns = [];
  for (const t of (ex.turns || [])) {
    let c = 0;
    for (const a of (t.actions || [])) {
      if (a.kind !== 'move' || !a.pre || !a.post) continue;
      const p0 = a.pre.player, p1 = a.post.player;
      if (!p0 || !p1 || p0.mx == null || p1.mx == null) continue;
      if (p0.mx === p1.mx && p0.my === p1.my) { n++; c++; }
    }
    if (c) turns.push({ turnSeq: t.turnSeq, round: t.round, zeroTileMoves: c });
  }
  return { count: n, turns: turns };
}

function ragePresses(ex) {
  // Rage presses in the fight, and rage-instead-of-strike turns: a
  // turn with a rage useAbility, a monster in range at turn start,
  // and no strike attempted that turn.
  const uses = (ex.abilityUses || []).filter(isRageUse);
  let insteadOfStrike = 0; const turns = [];
  for (const t of (ex.turns || [])) {
    const hasRage = (t.actions || []).some(function (a) {
      return a.kind === 'ability' && a.args && a.args.some(function (x) { return String(x) === 'rage'; });
    });
    if (!hasRage) continue;
    const dists = ((t.start || {}).dists || []).filter(function (d) { return d.dist != null; });
    const minDist = dists.length ? Math.min.apply(null, dists.map(function (d) { return d.dist; })) : null;
    const range = (t.start && t.start.weapon) ? t.start.weapon.range : null;
    const inRange = (minDist != null && range != null) ? (minDist <= range) : null;
    const struck = (t.actions || []).some(function (a) { return a.kind === 'strike'; });
    if (inRange === true && !struck) { insteadOfStrike++; turns.push({ turnSeq: t.turnSeq, round: t.round, minDist: minDist, range: range }); }
  }
  return { count: uses.length, insteadOfStrike: insteadOfStrike, turns: turns };
}

function approachLoopTurns(ex) {
  // Move-only turns out of range at start AND end (the confirm's
  // approach-path blocked-step loop shape).
  let n = 0; const turns = [];
  for (const t of (ex.turns || [])) {
    const c = TB.classifyTurn(ex, t);
    if (c.cls === 'move-only' && c.flags.outOfRangeAtStart === true && c.flags.endOutOfRange === true) {
      n++; turns.push({ turnSeq: t.turnSeq, round: t.round });
    }
  }
  return { count: n, turns: turns };
}

function arenaPreTurnFlee(ex) {
  // #2292 signal: an ally fighter fled in round 1 before any player
  // turn ran. Operationalized: an ally-kind npcTurn with post.fled
  // true in round <= 1 while the exposure has no player turn with
  // round <= 1. Listed by hand — the instrument carries no arena
  // flag, so a 0 here means "no signal in startCombat TB fights",
  // not "the arena shape is gone".
  const allyFledR1 = (ex.npcTurns || []).filter(function (nt) {
    return nt.kind === 'ally' && nt.post && nt.post.fled === true && (nt.round | 0) <= 1;
  });
  if (!allyFledR1.length) return null;
  const playerTurnR1 = (ex.turns || []).filter(function (t) { return (t.round | 0) <= 1; }).length;
  if (playerTurnR1 > 0) return null;
  return { npcTurns: allyFledR1.length, mid: ex.mid, day: ex.day, seq: ex.seq };
}

function analyzeFile(data) {
  const exposures = data.exposures || [];
  const out = { seed: data.seed, days: data.days, endReason: data.endReason,
    scaleRank: data.scaleRankFinal || null, standing: (data.standingFinal != null ? data.standingFinal : null),
    maxWave: data.maxWave || null, won: !!data.won,
    tableWaiting: !!data.tableWaiting, tableEntered: !!data.tableEntered,
    nationalReached: !!data.nationalReached,
    instrumentErrors: (data.instrumentErrors || []).length,
    exposures: exposures.length,
    outcomes: {}, turnHist: {},
    fleeAttemptTurns: 0, moveOnlyTurns: 0, failedStrikeTurns: 0, noActionTurns: 0,
    zeroTileMoves: 0, ragePresses: 0, rageInsteadOfStrike: 0,
    approachLoopTurns: 0, barrierPushes: 0,
    fightsWithRageLoop: 0, fightsWithZeroTile: 0, fightsWithApproachLoop: 0,
    arenaPreTurnFlees: [], summaries: [] };
  for (const ex of exposures) {
    const s = TB.summarize(ex);
    out.outcomes[s.outcome] = (out.outcomes[s.outcome] || 0) + 1;
    for (const k of Object.keys(s.turnHist)) out.turnHist[k] = (out.turnHist[k] || 0) + s.turnHist[k];
    out.fleeAttemptTurns += s.turnHist['flee-attempt'] || 0;
    out.moveOnlyTurns += s.turnHist['move-only'] || 0;
    out.failedStrikeTurns += s.turnHist['failed-strike'] || 0;
    out.noActionTurns += s.turnHist['no-action'] || 0;
    const zt = zeroTileMoves(ex);
    const rg = ragePresses(ex);
    const ap = approachLoopTurns(ex);
    out.zeroTileMoves += zt.count;
    out.ragePresses += rg.count;
    out.rageInsteadOfStrike += rg.insteadOfStrike;
    out.approachLoopTurns += ap.count;
    if (zt.count) out.fightsWithZeroTile++;
    if (rg.count >= 2) out.fightsWithRageLoop++;
    if (ap.count) out.fightsWithApproachLoop++;
    const ar = arenaPreTurnFlee(ex);
    if (ar) out.arenaPreTurnFlees.push(ar);
    out.summaries.push({ seq: ex.seq, day: ex.day, mid: ex.mid, outcome: s.outcome,
      nTurns: s.nTurns, turnHist: s.turnHist,
      zeroTileMoves: zt.count, ragePresses: rg.count,
      rageInsteadOfStrike: rg.insteadOfStrike, approachLoopTurns: ap.count,
      barrierPushes: ((ex.turns || []).reduce(function (n, t) {
        return n + (t.actions || []).filter(function (a) { return a.kind === 'barrierExit'; }).length;
      }, 0)) });
  }
  out.barrierPushes = out.summaries.reduce(function (s, x) { return s + x.barrierPushes; }, 0);
  return out;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  if (!files.length) throw new Error('no per-seed files in ' + dir);
  const perSeed = [];
  let instrumentErrors = 0;
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const a = analyzeFile(data);
    a.file = f;
    instrumentErrors += a.instrumentErrors;
    perSeed.push(a);
  }
  function sum(k) { return perSeed.reduce(function (s, x) { return s + (x[k] || 0); }, 0); }
  const exposures = sum('exposures');
  const days = perSeed.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = days.length ? days[Math.floor(days.length / 2)] : null;
  const national = perSeed.filter(function (s) { return !!s.nationalReached; }).length;
  const tableEntered = perSeed.filter(function (s) { return !!s.tableEntered; }).length;
  const tableWaiting = perSeed.filter(function (s) { return !!s.tableWaiting; }).length;
  const wins = perSeed.filter(function (s) { return !!s.won; }).length;
  const wave4 = perSeed.filter(function (s) { return (s.maxWave | 0) >= 4; }).length;
  const wave5 = perSeed.filter(function (s) { return (s.maxWave | 0) >= 5; }).length;
  return { verdict: { instrumentErrorsD2: instrumentErrors === 0,
      substrateD5: exposures >= 1, substrateMissing: exposures < 1 },
    seeds: perSeed.length, exposures: exposures,
    fleeAttemptTurns: sum('fleeAttemptTurns'), moveOnlyTurns: sum('moveOnlyTurns'),
    failedStrikeTurns: sum('failedStrikeTurns'), noActionTurns: sum('noActionTurns'),
    zeroTileMoves: sum('zeroTileMoves'), ragePresses: sum('ragePresses'),
    rageInsteadOfStrike: sum('rageInsteadOfStrike'),
    approachLoopTurns: sum('approachLoopTurns'), barrierPushes: sum('barrierPushes'),
    fightsWithRageLoop: sum('fightsWithRageLoop'),
    fightsWithZeroTile: sum('fightsWithZeroTile'),
    fightsWithApproachLoop: sum('fightsWithApproachLoop'),
    arenaPreTurnFlees: perSeed.reduce(function (s, x) { return s + x.arenaPreTurnFlees.length; }, 0),
    instrumentErrors: instrumentErrors,
    wall: { national: national + '/' + perSeed.length,
      tableEntered: tableEntered + '/' + perSeed.length,
      tableWaiting: tableWaiting + '/' + perSeed.length,
      wins: wins + '/' + perSeed.length,
      wave4: wave4 + '/' + perSeed.length, wave5: wave5 + '/' + perSeed.length,
      medianSurvivalDays: medianDays },
    perSeed: perSeed };
}

function selftest() {
  const assert = require('assert');
  // Zero-tile: a move action with identical pre/post player pos.
  const exZ = { seq: 1, day: 10, mid: 'audit', turns: [
    { turnSeq: 1, round: 2, start: { player: { mx: 4, my: 4 } }, actions: [
      { kind: 'move', pre: { player: { mx: 4, my: 4, moveLeft: 2 } }, post: { player: { mx: 4, my: 4, moveLeft: 2 } } },
      { kind: 'move', pre: { player: { mx: 4, my: 4, moveLeft: 2 } }, post: { player: { mx: 5, my: 4, moveLeft: 1 } } },
    ] },
  ], npcTurns: [], abilityUses: [] };
  assert.strictEqual(zeroTileMoves(exZ).count, 1, 'one zero-tile move');
  assert.strictEqual(zeroTileMoves(exZ).turns[0].zeroTileMoves, 1, 'one per turn');
  // Rage: two rage uses in one fight = a rage loop; a rage turn in
  // range with no strike = rage instead of strike.
  const exR = { seq: 2, day: 11, mid: 'eulogy', abilityUses: [
      { fn: 'useAbility', args: ['v1', 'rage'] }, { fn: 'useAbility', args: ['v1', 'rage'] },
    ], turns: [
    { turnSeq: 1, round: 2, start: { player: { mx: 4, my: 4 }, weapon: { range: 1 }, dists: [{ key: 'm_0', dist: 1 }] }, actions: [
      { kind: 'ability', args: ['v1', 'rage'] },
    ] },
    { turnSeq: 2, round: 3, start: { player: { mx: 4, my: 4 }, weapon: { range: 1 }, dists: [{ key: 'm_0', dist: 3 }] }, actions: [
      { kind: 'ability', args: ['v1', 'rage'] },
    ] },
  ], npcTurns: [] };
  const rg = ragePresses(exR);
  assert.strictEqual(rg.count, 2, 'two rage presses');
  assert.strictEqual(rg.insteadOfStrike, 1, 'one rage-instead-of-strike (round 2 in range)');
  // Approach loop: move-only turn out of range at start and end.
  const exA = { seq: 3, day: 12, mid: 'algorithm', monsters: [{ key: 'm_0', mid: 'algorithm', hpStart: 1000, maxHp: 1000 }],
    hits: [], turns: [
    { turnSeq: 1, round: 2, start: { player: { mx: 4, my: 4, moveLeft: 2 }, weapon: { range: 1 }, dists: [{ key: 'm_0', dist: 2 }] },
      actions: [{ kind: 'move', pre: { player: { mx: 4, my: 4, moveLeft: 2 } }, post: { player: { mx: 4, my: 4, moveLeft: 2 } } }],
      end: { player: { mx: 4, my: 4 }, dists: [{ key: 'm_0', dist: 2 }] } },
  ], npcTurns: [], abilityUses: [] };
  assert.strictEqual(approachLoopTurns(exA).count, 1, 'one approach-loop turn');
  // Arena pre-turn flee: ally fled round 1, no player turn round 1.
  const exP = { seq: 4, day: 13, mid: 'reunion', turns: [], npcTurns: [
    { kind: 'ally', key: 'a_0', round: 1, pre: { pos: { mx: 3, my: 3 } }, post: { pos: { mx: 3, my: 3 }, fled: true } },
  ], abilityUses: [] };
  assert.ok(arenaPreTurnFlee(exP), 'arena pre-turn flee signals');
  const exP2 = { seq: 5, day: 14, mid: 'reunion', turns: [{ turnSeq: 1, round: 1, actions: [] }], npcTurns: [
    { kind: 'ally', key: 'a_0', round: 1, pre: { pos: { mx: 3, my: 3 } }, post: { pos: { mx: 3, my: 3 }, fled: true } },
  ], abilityUses: [] };
  assert.strictEqual(arenaPreTurnFlee(exP2), null, 'no signal once a player turn ran');
  console.log('analyze-winflee-tb-b selftest: 8 checks PASS');
  return true;
}

if (require.main === module) (function () {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') >= 0) { selftest(); return; }
  const dirIdx = args.indexOf('--dir');
  const outIdx = args.indexOf('--out');
  const repo = path.join(__dirname, '..');
  const dir = dirIdx >= 0 ? args[dirIdx + 1] : path.join(repo, 'evidence', '2026-11-28', 'perseed-winflee-b-tb');
  const outFile = outIdx >= 0 ? args[outIdx + 1] : path.join(repo, 'evidence', '2026-11-28', 'winflee-b-tb-analysis.json');
  const res = analyzeDir(dir);
  fs.writeFileSync(outFile, JSON.stringify(res, null, 2) + '\n');
  console.log(JSON.stringify({ seeds: res.seeds, exposures: res.exposures,
    fleeAttemptTurns: res.fleeAttemptTurns, moveOnlyTurns: res.moveOnlyTurns,
    failedStrikeTurns: res.failedStrikeTurns, noActionTurns: res.noActionTurns,
    zeroTileMoves: res.zeroTileMoves, ragePresses: res.ragePresses,
    rageInsteadOfStrike: res.rageInsteadOfStrike,
    approachLoopTurns: res.approachLoopTurns, barrierPushes: res.barrierPushes,
    fightsWithRageLoop: res.fightsWithRageLoop,
    fightsWithZeroTile: res.fightsWithZeroTile,
    fightsWithApproachLoop: res.fightsWithApproachLoop,
    arenaPreTurnFlees: res.arenaPreTurnFlees,
    instrumentErrors: res.instrumentErrors, wall: res.wall, verdict: res.verdict,
    out: path.relative(repo, outFile) }));
})();

module.exports = { TB: TB, zeroTileMoves: zeroTileMoves, ragePresses: ragePresses,
  approachLoopTurns: approachLoopTurns, arenaPreTurnFlee: arenaPreTurnFlee,
  analyzeFile: analyzeFile, analyzeDir: analyzeDir, selftest: selftest };
