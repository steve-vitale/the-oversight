#!/usr/bin/env node
// sim-rerunclock-wallseg-instrument.js — door-bar snapshot wrapper for arm
// sim-rerunclock-wallseg (flesh-out loop, axis scale-onramp). DIAG
// instrument: ZERO src/js changes, zero game-state writes, zero RNG draws.
//
// Reuses read-only: scripts/sim-rerunclock-instrument.js (daily overtime-
// tier trace + pure deriveTrajectory + pre-registered killer-class rule)
// and scripts/postunlock-instrument.js (fight/death recorder + pure
// barCounts read of Game.waveUnlockReady(5) — the same bars the gate
// reads). THIS file adds only:
//   - wrapPolicyWithBars(policy, t): RI daily tier trace + one
//     barCounts snapshot per policy.daily call (day, armored, armed,
//     tricks, veterans, roster) into t.doorBars, then the original daily.
//   - snapshotAtDoor(bars, w5Day): pure — the last bar row at or before
//     the door day and the first bar row at or after it (the door-state
//     read for "veteran counts at door, armor/armed at door").
//   - eulogyCascadeCount(deaths, windowOpen): pure — post-window
//     villager deaths whose killer link names the Eulogy (oppMid contains
//     'eulogy', or a linked fight's monsterIds contain it). Cause-
//     attributed via the gap-W2 attribution instrument's linkage fields
//     (oppMid / fight.monsterIds), never invented: a death with no link
//     counts for neither the cascade nor any other killer.
'use strict';
const RI = require('./sim-rerunclock-instrument');
const PI = require('./postunlock-instrument');

function dayOf(Game) {
  try { return (((Game.state || {}).scholar || {}).day) | 0 || 0; } catch (e) { return 0; }
}

function wrapPolicyWithBars(policy, t) {
  if (!Array.isArray(t.doorBars)) t.doorBars = [];
  if (!Array.isArray(t.doorBarErrors)) t.doorBarErrors = [];
  const inner = RI.wrapPolicy(policy, t);
  const innerDaily = inner.daily;
  return Object.assign({}, inner, {
    daily(Game, ctx) {
      try {
        const b = PI.barCounts(Game);
        t.doorBars.push({ day: dayOf(Game), armored: b.armored | 0, armed: b.armed | 0,
          tricks: b.tricks | 0, veterans: b.veterans | 0, roster: b.roster | 0 });
      } catch (e) { t.doorBarErrors.push('doorBars: ' + String((e && e.message) || e)); }
      if (typeof innerDaily === 'function') return innerDaily(Game, ctx);
      return undefined;
    },
  });
}

function snapshotAtDoor(bars, w5Day) {
  bars = Array.isArray(bars) ? bars : [];
  if (w5Day == null) return { atOrBefore: null, atOrAfter: null };
  let before = null, after = null;
  for (const r of bars) {
    if ((r.day | 0) <= (w5Day | 0)) before = r;
    if (after == null && (r.day | 0) >= (w5Day | 0)) after = r;
  }
  return { atOrBefore: before, atOrAfter: after };
}

function isEulogyDeath(d) {
  const opp = String((d && d.oppMid) || '').toLowerCase();
  if (opp.indexOf('eulogy') >= 0) return true;
  try {
    const ids = ((d && d.fight && d.fight.monsterIds) || []).map(x => String(x).toLowerCase());
    if (ids.some(id => id.indexOf('eulogy') >= 0)) return true;
  } catch (e) {}
  return false;
}

function eulogyCascadeCount(deaths, windowOpen) {
  deaths = Array.isArray(deaths) ? deaths : [];
  if (windowOpen == null) return 0;
  let n = 0;
  for (const d of deaths) {
    if (!d.person) continue;
    if ((d.day | 0) < (windowOpen | 0)) continue;
    if (isEulogyDeath(d)) n++;
  }
  return n;
}

module.exports = { wrapPolicyWithBars, snapshotAtDoor, eulogyCascadeCount, isEulogyDeath };
