// approachlive-bus-20261105.js — direct-counter bus (arm sim-approachlive-b).
//
// The approach fallback's own ctx counters (approachFallbackMarks,
// approachFallbackWaits, approachRepickSteps, approachStuckTurns) are
// written only by the fallback code in scripts/policies/competent.js.
// The replay harness (probe-approachbranch-a-20261104.js) reads them
// directly because it owns ctx. In a LIVE sim, ctx is created inside
// runDays (scripts/sim-harness.js) and handed to policy.fight(Game,
// ctx) by driveFights — one ctx per leg, counters accumulating across
// the whole leg (marks are never reset per fight; _approachStuck is
// per-fight via st.for !== f.id).
//
// This bus is the live-sim equivalent of the replay harness's counter
// read: the driver wraps policy.fight (call-through, return value
// preserved) and records a snapshot BEFORE and AFTER every call, plus
// the fight id, round, player-turn state, player position and monster
// geometry at both ends. Reading ctx alters no decision; the wrapper
// adds no Math.random use and never calls a game function that mutates
// state (tbFighter/tbIsPlayerTurn are pure reads).
//
// Attribution is by DELTA (after - before) per call, keyed by fight
// id — so cumulative counters decompose into per-fight firing records
// without ever resetting or touching ctx. The driver joins bus records
// to instrument exposures by fightId after runDays returns; the
// summarizer derives marks/waits/repicks, the post-firing blocked run
// and the frozen-wait flag from the joined records. No Game mutation:
// the bus is a plain module singleton, reset per seed by the driver.
'use strict';

const calls = [];

function snapCounters(ctx) {
  return {
    marks: (ctx && ctx.approachFallbackMarks) || 0,
    waits: (ctx && ctx.approachFallbackWaits) || 0,
    repicks: (ctx && ctx.approachRepickSteps) || 0,
    stuck: (ctx && ctx.approachStuckTurns) || 0,
  };
}

function monsterSig(Game) {
  try {
    const f = Game && Game.tbfight;
    if (!f || !Array.isArray(f.fighters)) return null;
    return f.fighters.filter(function (x) { return x && x.kind === 'monster'; })
      .map(function (x) {
        return (x.key || '?') + ':' + (x.mx == null ? '?' : x.mx) + ',' + (x.my == null ? '?' : x.my) +
          ':' + Math.round(x.hp || 0) + ':' + (x.alive ? 'a' : 'd');
      }).join(';');
  } catch (e) { return 'err'; }
}

function monsterMids(Game) {
  try {
    const f = Game && Game.tbfight;
    if (!f || !Array.isArray(f.fighters)) return [];
    return f.fighters.filter(function (x) { return x && x.kind === 'monster'; })
      .map(function (x) { return ((x.mdef || {}).id || x.monsterId || x.id) || null; })
      .filter(function (m) { return !!m; });
  } catch (e) { return []; }
}

function playerPos(Game) {
  try {
    if (Game && typeof Game.tbFighter === 'function') {
      const p = Game.tbFighter('p');
      if (p) return [p.mx == null ? null : p.mx, p.my == null ? null : p.my];
    }
  } catch (e) {}
  return null;
}

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Record one policy.fight call. before/after are snapCounters() results
// taken by the driver around the call; meta carries the call context.
function record(Game, before, after, meta) {
  const rec = {
    fightId: null, day: dayOf(Game), round: null, playerTurn: !!(meta && meta.playerTurn),
    mids: monsterMids(Game),
    monsterBefore: (meta && meta.monsterBefore != null) ? meta.monsterBefore : null,
    monsterAfter: monsterSig(Game),
    playerBefore: (meta && meta.playerBefore != null) ? meta.playerBefore : null,
    playerAfter: playerPos(Game),
    before: before, after: after,
    delta: { marks: after.marks - before.marks, waits: after.waits - before.waits,
      repicks: after.repicks - before.repicks, stuck: after.stuck - before.stuck },
  };
  try {
    const f = Game && Game.tbfight;
    if (f) {
      rec.fightId = (f.id == null ? null : f.id);
      rec.round = (f.round == null ? null : f.round);
    }
  } catch (e) {}
  if (meta && meta.threw) rec.threw = String(meta.threw).slice(0, 80);
  calls.push(rec);
  return rec;
}

function reset() { calls.length = 0; }

// --- Per-fight rollups (pure functions over bus records; also used by
// the proof test on fixtures). A fight's records are its calls in call
// order. Cumulative marks are reconstructed per call from deltas so a
// rollup never depends on the leg-wide counter value at call time.
// -----------------------------------------------------------------------

function rollupFight(fightCalls) {
  const sorted = (fightCalls || []).slice();
  let marks = 0, waits = 0, repicks = 0, stuck = 0;
  let firstMarkIdx = -1;
  let firstMarkMonster = null;
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i].delta || { marks: 0, waits: 0, repicks: 0, stuck: 0 };
    marks += d.marks || 0; waits += d.waits || 0; repicks += d.repicks || 0; stuck += d.stuck || 0;
    if (firstMarkIdx < 0 && marks >= 1) { firstMarkIdx = i; firstMarkMonster = sorted[i].monsterAfter; }
  }
  // Post-firing blocked run (bus definition): consecutive calls AFTER
  // the first-mark call with a stuck delta >= 1 (a zero-movement
  // approach step) while player AND monster positions are unchanged
  // vs the previous call — with positions frozen, the approach target
  // (nearest monster-adjacent tile) is deterministic, so consecutive
  // frozen stuck calls are same-target blocked steps. Any movement
  // resets the run. Turns are NOT needed for this count.
  let postFiringMaxRun = 0, run = 0;
  if (firstMarkIdx >= 0) {
    for (let i = firstMarkIdx + 1; i < sorted.length; i++) {
      const c = sorted[i];
      const prev = sorted[i - 1];
      const d = c.delta || {};
      const frozen = JSON.stringify(c.playerAfter) === JSON.stringify(prev.playerAfter) &&
        c.monsterAfter === prev.monsterAfter;
      if ((d.stuck || 0) >= 1 && frozen) run++;
      else run = 0;
      if (run > postFiringMaxRun) postFiringMaxRun = run;
    }
  }
  // Frozen-wait flag (prereg bound: 10 waits): after the first mark,
  // total waits >= 10 with ZERO repicks after the mark and NO monster-
  // geometry change after the first mark (every post-mark call's
  // monster geometry equals the geometry at the first-mark call). A
  // strike after the mark is impossible under those conditions: the
  // wait branch runs only while out of range, and reaching range
  // requires the monster to move (geometry change) or a repick to
  // succeed (repick >= 1).
  let waitsAfterMark = 0, repicksAfterMark = 0, geoChangedAfterMark = false;
  if (firstMarkIdx >= 0) {
    for (let i = firstMarkIdx + 1; i < sorted.length; i++) {
      const d = sorted[i].delta || {};
      waitsAfterMark += d.waits || 0;
      repicksAfterMark += d.repicks || 0;
      if (sorted[i].monsterAfter !== firstMarkMonster) geoChangedAfterMark = true;
    }
  }
  const frozenWaitLoop = firstMarkIdx >= 0 && waitsAfterMark >= 10 &&
    repicksAfterMark === 0 && !geoChangedAfterMark;
  return { calls: sorted.length, marks: marks, waits: waits, repicks: repicks,
    stuck: stuck, firstMarkCallIdx: firstMarkIdx,
    waitsAfterMark: waitsAfterMark, repicksAfterMark: repicksAfterMark,
    geoChangedAfterMark: geoChangedAfterMark,
    postFiringMaxRun: postFiringMaxRun, frozenWaitLoop: frozenWaitLoop };
}

module.exports = { calls: calls, snapCounters: snapCounters, monsterSig: monsterSig,
  monsterMids: monsterMids, playerPos: playerPos, dayOf: dayOf,
  record: record, reset: reset, rollupFight: rollupFight };
