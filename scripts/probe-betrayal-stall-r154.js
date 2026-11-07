#!/usr/bin/env node
// probe-betrayal-stall-r154.js — STAGED repro for the r150 betrayal softlock
// (Lane B crisis r154, Q1). r150 seed 13402 froze on day 18: Wren betrays,
// the player flees across a barrier (Wren follows, _pursuit 2->1, "flagging"),
// then 270,599 "No path there." + 270,599 Wren stall lines, gameDay frozen.
// The r154 repro run on the current base diverged before any betrayal fired,
// so this probe STAGES the trigger directly: start a betrayal fight, set the
// player HP low so oracleV2 flees every round (hpPct<0.3 -> flee('neardeath')),
// and drive the fight through runDays chunks, watching for the stall
// signature (gameDay frozen + "No path there." growing). At a stall it
// snapshots positions, the detail grid, and findPath results on both sides
// of the wall — the root-cause evidence — instead of burning iterations.
// Usage: SEED=13402 node scripts/probe-betrayal-stall-r154.js
//   SEEDS=13402,13501,13502 node scripts/probe-betrayal-stall-r154.js
// Output: one JSON line per seed to stdout; diagnostics to stderr.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEEDS = (process.env.SEEDS || process.env.SEED || '13402').split(',').map(s => parseInt(s.trim(), 10));
const MAX_ITERS = parseInt(process.env.MAX_ITERS || '25', 10);
const STALL_ITERS = parseInt(process.env.STALL_ITERS || '10', 10);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }

async function probeSeed(seed) {
  const out = { seed, verdict: 'unknown', iters: 0, gameDayAtEnd: null, noPath: 0, circle: 0, barrierCrossed: 0, fightOver: null, stallSnapshot: null, err: null };
  const lines = []; // rolling last-40 say lines (bounded; a stall prints thousands)
  let noPath = 0, circle = 0, barrier = 0, givesUp = 0, yields = 0, guardFired = 0;
  try {
    const { Game } = await loadGame({ seed, mode: 'crisis-delayed-r70', fullTelemetry: true });
    await setupGame(Game, 'Denver, Colorado');
    // R154: stage the fight on a WILD node, not Haven. Haven's detail grid
    // is a walled room (all edge tiles are walls), so findPath to any edge
    // tile is NULL there and a flee can never reach a barrier — the r150
    // stall happened on wild nodes, where the player CAN cross a barrier.
    // Travel THREE tiles out (not one): one tile out, the bot's westward
    // flee crosses straight back into Haven (safe — chase ends). Three
    // tiles out, a westward crossing lands on another wild node and the
    // chase continues — the r150 shape.
    let nodeBefore = (Game.map ? (Game.map.px + ',' + Game.map.py) : null);
    for (const [tx, ty] of [[5, 4], [6, 4], [7, 4]]) {
      try { Game.travelTo(tx, ty); } catch (e) {}
      if (Game.tbfight) { out.verdict = 'travel-fight'; out.nodeAfterTravel = (Game.map ? (Game.map.px + ',' + Game.map.py) : null); out.noPath = noPath; out.circle = circle; out.barrierCrossed = barrier; out.givesUp = givesUp; out.yields = yields; out.guardFired = guardFired; out.lastLines = lines.slice(-12); return out; }
    }
    out.nodeBefore = nodeBefore;
    out.nodeAfterTravel = (Game.map ? (Game.map.px + ',' + Game.map.py) : null);
    const _say = Game.say.bind(Game);
    Game.say = function (t) {
      try {
        const line = String(t);
        if (/No path there/.test(line)) noPath++;
        if (/🔪 Wren|🔪 .*circles|backs off, breathing hard|feints toward you|paces a wide arc|glances over their shoulder|keeps their distance/.test(line)) circle++;
        if (/BARRIER CROSSED/.test(line)) barrier++;
        if (/gives up the chase|melts back into the treeline/.test(line)) givesUp++;
        if (/yields|yielded/.test(line)) yields++;
        if (/It comes apart/.test(line)) guardFired++;
        lines.push(line); if (lines.length > 40) lines.shift();
      } catch (e) {}
      return _say(t);
    };
    // Pick a living roster villager who is not the player.
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => String(id) !== String(Game.villagerId));
    let vid = null;
    for (const id of roster) {
      try { const vp = Game.vpOf(id); if (vp && !vp.dead) { vid = id; break; } } catch (e) {}
    }
    if (!vid) { out.verdict = 'no-villager'; return out; }
    out.betrayerVid = String(vid);
    try { out.betrayerName = Game.displayName(vid); } catch (e) { out.betrayerName = null; }
    // Low HP so the bot flees every round (the r150 shape: flee, don't fight).
    try {
      const maxHp = (typeof Game.maxHealth === 'function') ? Game.maxHealth() : 100;
      Game.state.scholar.health = Math.max(1, Math.floor(maxHp * 0.2));
      out.playerHpSet = Game.state.scholar.health;
      out.playerMaxHp = maxHp;
    } catch (e) { out.hpErr = String(e && e.message || e); }
    const started = Game.startBetrayalCombat(vid, { aggressor: 'npc' });
    if (!started) { out.verdict = 'fight-not-started'; return out; }
    out.fightStarted = true;
    // R154: wrap tbEnd/tbBarrierExit so the fight-end moment is captured
    // exactly (the rolling say buffer is overwritten by later days).
    const _tbEnd = Game.tbEnd.bind(Game);
    Game.tbEnd = function (result) {
      try {
        out.tbEndCalls = out.tbEndCalls || [];
        out.tbEndCalls.push({ result: result || null, day: dayOf(Game), linesAtEnd: lines.slice(-8), noPathAtEnd: noPath, circleAtEnd: circle, barrierAtEnd: barrier });
      } catch (e) {}
      return _tbEnd(result);
    };
    const _tbBarrierExit = Game.tbBarrierExit ? Game.tbBarrierExit.bind(Game) : null;
    if (_tbBarrierExit) {
      Game.tbBarrierExit = function (dx, dy) {
        let r = false;
        try { r = _tbBarrierExit(dx, dy); } catch (e) { throw e; }
        try {
          out.barrierCalls = out.barrierCalls || [];
          out.barrierCalls.push({ dx, dy, ret: !!r, day: dayOf(Game), linesAtCall: lines.slice(-4) });
        } catch (e) {}
        return r;
      };
    }
    const policy = oracleV2;
    const ctx = { policyId: policy.id, notes: [] };
    let lastDay = dayOf(Game), frozenIters = 0, lastNoPath = 0;
    for (let it = 1; it <= MAX_ITERS; it++) {
      out.iters = it;
      let res = null;
      try { res = await runDays(Game, policy, { days: 1, sampleEvery: 1 }); } catch (e) { out.verdict = 'threw'; out.err = String(e && e.message || e); break; }
      const gd = dayOf(Game);
      const f = Game.tbfight;
      if (!f || f.over) { out.verdict = 'resolved'; out.fightOver = f ? (f.result || 'over') : 'no-fight'; out.gameDayAtEnd = gd; out.fightEndLines = lines.slice(-12); out.fightEndCounts = { noPath, circle, barrier, givesUp, yields }; break; }
      if (gd !== lastDay) { out.verdict = 'resolved-day-advanced'; out.gameDayAtEnd = gd; out.fightEndLines = lines.slice(-12); out.fightEndCounts = { noPath, circle, barrier, givesUp, yields }; break; }
      // Same gameDay: frozen so far. Stall = 10 frozen iters with growing No-path lines.
      frozenIters++;
      if (frozenIters >= STALL_ITERS && noPath > lastNoPath) {
        out.verdict = 'STALL';
        out.gameDayAtEnd = gd;
        out.stallSnapshot = snapshot(Game, vid, lines);
        break;
      }
      lastNoPath = noPath;
      lastDay = gd;
    }
    if (out.verdict === 'unknown') { out.verdict = 'no-stall-in-window'; out.gameDayAtEnd = dayOf(Game); }
  } catch (e) { out.verdict = 'error'; out.err = String(e && e.message || e); }
  out.noPath = noPath; out.circle = circle; out.barrierCrossed = barrier; out.givesUp = givesUp; out.yields = yields; out.guardFired = guardFired;
  out.lastLines = lines.slice(-12);
  return out;
}

function snapshot(Game, vid, lines) {
  const snap = { lastLines: lines.slice(-12) };
  try {
    const f = Game.tbfight;
    snap.fight = f ? {
      over: !!f.over, betrayal: !!f.betrayal, round: f.round || null,
      fighters: (f.fighters || []).map(x => ({ key: x.key, kind: x.kind, name: x.name || null, mx: x.mx, my: x.my, hp: x.hp, alive: !!x.alive, fled: !!x.fled, moveLeft: x.moveLeft, acted: !!x.acted, pursuit: x._pursuit === undefined ? null : x._pursuit })),
    } : null;
  } catch (e) { snap.fight = { err: String(e && e.message || e) }; }
  try {
    const p = Game.tbFighter('p');
    const h = (Game.tbfight && Game.tbfight.fighters || []).find(x => x.kind === 'hostile');
    snap.player = p ? { mx: p.mx, my: p.my, hp: p.hp, maxHp: p.maxHp, moveLeft: p.moveLeft } : null;
    snap.hostile = h ? { mx: h.mx, my: h.my, hp: h.hp, pursuit: h._pursuit === undefined ? null : h._pursuit } : null;
    if (p && h) {
      // Is the edge flee tile reachable? (bot flee targets (0|8, py).)
      const tx = p.mx <= 4 ? 0 : 8;
      snap.fleeTarget = { x: tx, y: p.my };
      try { snap.pathToFleeTarget = Game.findPath(p.mx, p.my, tx, p.my); } catch (e) { snap.pathToFleeTarget = { err: String(e && e.message || e) }; }
      // Is any tile adjacent to the hostile reachable?
      let adjOk = null;
      for (let dx = -1; dx <= 1 && adjOk === null; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const cx = h.mx + dx, cy = h.my + dy;
        if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
        try { const path = Game.findPath(p.mx, p.my, cx, cy); if (path) { adjOk = { x: cx, y: cy, len: path.length }; break; } } catch (e) {}
      }
      snap.pathToHostileAdjacent = adjOk;
      // Reachable-set census: BFS from the player over unblocked cells.
      try {
        const detail = Game.genDetail(Game.map.px, Game.map.py);
        const reach = new Set();
        const q = [[p.mx, p.my]];
        reach.add(p.mx + ',' + p.my);
        while (q.length) {
          const [x, y] = q.shift();
          for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx > 8 || ny < 0 || ny > 8 || reach.has(nx + ',' + ny)) continue;
            const cell = detail[ny] && detail[ny][nx];
            if (Game.cellProps(cell).blocks) continue;
            if (dx !== 0 && dy !== 0) {
              const c1 = detail[y] && detail[y][nx], c2 = detail[ny] && detail[ny][x];
              if (Game.cellProps(c1).blocks || Game.cellProps(c2).blocks) continue;
            }
            reach.add(nx + ',' + ny); q.push([nx, ny]);
          }
        }
        snap.reachableFromPlayer = reach.size;
        snap.hostileTileReachable = reach.has(h.mx + ',' + h.my);
        snap.edgeTilesReachable = [0, 8].flatMap(x => [0,1,2,3,4,5,6,7,8].map(y => x + ',' + y)).filter(k => reach.has(k));
      } catch (e) { snap.reachableErr = String(e && e.message || e); }
    }
  } catch (e) { snap.posErr = String(e && e.message || e); }
  return snap;
}

(async () => {
  for (const seed of SEEDS) {
    const r = await probeSeed(seed);
    console.log(JSON.stringify(r));
  }
})();
