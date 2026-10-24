#!/usr/bin/env node
// sim-rerunclock-instrument.js — RERUN-CLOCK census instrument for arm
// sim-rerunclock (flesh-out loop, axis scale-onramp). DIAG instrument:
// ZERO src/js changes, zero game-state writes, zero RNG draws. Namespace
// sim-rerunclock-* (new files only). The proven
// scripts/postunlock-instrument.js is REQUIRED read-only and supplies
// postunlockFights (combat_start rows with overtimeTier + rerun flag),
// postunlockDeaths, unlock {w4Day, w5Day} and the say-ring; THIS file
// adds only the daily overtime-tier trajectory trace.
//
// What it records (per run, in t.rerunclockDaily):
//   one row per policy.daily call: day, rank (scaleRank), overtime tier,
//   tableWaiting/tableDone, seat, unlocked wave, roster, standing.
//   The wrapper calls the original policy.daily AFTER recording the row
//   (the row is the state at the START of that game-day; first-hit days
//   are therefore accurate to within one day, stated in the evidence).
//
// deriveTrajectory(trace, fights, deaths, unlock, end) is PURE (no Game
// reads) so the analyzer and the proof test share one implementation:
//   nationalDay, tableDay, tierFirst{1..6}, tierAtNational, tierAtDoor,
//   tierAtEnd, daysAtTier, rerun counts (all / w4 / w5 / post-national /
//   post-door / post-window), killerClass per config:
//     survived | rerun-clock | single-apex | mixed/other
//   Killer-class rule (PRE-REGISTERED, decided before sweeping):
//     - village not lost -> 'survived'
//     - lost AND end tier >= 4 AND rerun fights in the post-window >= 4
//       -> 'rerun-clock' (the grind, not one fight)
//     - lost AND last villager death within 3 days of a wave-5 fight AND
//       rerun fights in the post-window < 4 -> 'single-apex'
//     - otherwise -> 'mixed/other' (the analyzer reports the numbers;
//       the evidence names the verdict, never re-scored mid-run).
//   The post-window opens at min(nationalDay, w5Day) when either exists,
//   else null (no window -> rerun-window counts are 0 and the config is
//   not qualifying).
'use strict';

function dayOf(Game) {
  try { return (((Game.state || {}).scholar || {}).day) | 0 || 0; } catch (e) { return 0; }
}
function tierOf(Game) {
  try { return (typeof Game.overtimeTier === 'function' ? (Game.overtimeTier() | 0) : 0); } catch (e) { return -1; }
}
function rankOf(Game) {
  try { return (Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'); } catch (e) { return 'village'; }
}
function waveOf(Game) {
  try { return (typeof Game.unlockedWave === 'function' ? (Game.unlockedWave() | 0) : 1); } catch (e) { return -1; }
}
function traceRow(Game) {
  const row = { day: dayOf(Game), rank: rankOf(Game), tier: tierOf(Game), wave: waveOf(Game),
    tableWaiting: false, tableDone: false, seat: 'unknown', roster: -1, standing: null };
  try { const pg = Game.progState ? Game.progState() : {}; row.tableWaiting = !!pg.tableWaiting; row.tableDone = !!pg.tableDone; } catch (e) {}
  try { if (Game.tableSeat) { const s = Game.tableSeat(); row.seat = (s && s.seat) || 'none'; } } catch (e) {}
  try { row.roster = ((((Game.state || {}).village) || {}).roster || []).length; } catch (e) {}
  try { row.standing = Game.villageStanding ? ((Game.villageStanding() || {}).total | 0) : null; } catch (e) {}
  return row;
}

// wrapPolicy(policy, t): returns a policy object identical to `policy`
// except daily() first appends one trace row, then runs the original
// daily(). No other hook is touched; the original policy object is
// never mutated (Object.assign onto a fresh object).
function wrapPolicy(policy, t) {
  if (!Array.isArray(t.rerunclockDaily)) t.rerunclockDaily = [];
  if (!Array.isArray(t.rerunclockErrors)) t.rerunclockErrors = [];
  const origDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(Game, ctx) {
      try { t.rerunclockDaily.push(traceRow(Game)); } catch (e) { t.rerunclockErrors.push('daily.trace: ' + String((e && e.message) || e)); }
      if (typeof origDaily === 'function') return origDaily(Game, ctx);
      return undefined;
    },
  });
  return wrapped;
}

function firstDay(trace, pred) {
  for (const r of trace) { if (pred(r)) return r.day; }
  return null;
}
function rowAtOrBefore(trace, day) {
  let out = null;
  for (const r of trace) { if (r.day <= day) out = r; else break; }
  return out;
}

function deriveTrajectory(trace, fights, deaths, unlock, end) {
  trace = Array.isArray(trace) ? trace : [];
  fights = Array.isArray(fights) ? fights : [];
  deaths = Array.isArray(deaths) ? deaths : [];
  unlock = unlock || {};
  end = end || {};
  const nationalDay = firstDay(trace, r => r.rank === 'national' || r.rank === 'global');
  const tableDay = firstDay(trace, r => r.tableWaiting || r.tableDone);
  const tierFirst = {};
  for (let k = 1; k <= 6; k++) tierFirst[k] = firstDay(trace, r => (r.tier | 0) >= k);
  const last = trace.length ? trace[trace.length - 1] : null;
  const tierAtEnd = last ? last.tier : null;
  const tierAtNational = nationalDay != null ? (rowAtOrBefore(trace, nationalDay) || {}).tier : null;
  const tierAtDoor = unlock.w5Day != null ? (rowAtOrBefore(trace, unlock.w5Day) || {}).tier : null;
  const daysAtTier = {};
  for (const r of trace) { const k = String(r.tier); daysAtTier[k] = (daysAtTier[k] || 0) + 1; }
  const windowOpen = nationalDay != null && unlock.w5Day != null ? Math.min(nationalDay, unlock.w5Day)
    : (nationalDay != null ? nationalDay : unlock.w5Day);
  const rerunFights = fights.filter(f => f.rerun);
  const countIn = (arr, pred) => arr.filter(pred).length;
  const rerun = {
    all: rerunFights.length,
    w4: countIn(rerunFights, f => (f.wave | 0) === 4),
    w5: countIn(rerunFights, f => (f.wave | 0) === 5),
    postNational: nationalDay != null ? countIn(rerunFights, f => (f.day | 0) >= nationalDay) : 0,
    postDoor: unlock.w5Day != null ? countIn(rerunFights, f => (f.day | 0) >= unlock.w5Day) : 0,
    postWindow: windowOpen != null ? countIn(rerunFights, f => (f.day | 0) >= windowOpen) : 0,
  };
  const allFights = { all: fights.length,
    w4: countIn(fights, f => (f.wave | 0) === 4),
    w5: countIn(fights, f => (f.wave | 0) === 5),
    postWindow: windowOpen != null ? countIn(fights, f => (f.day | 0) >= windowOpen) : 0 };
  const villagerDeaths = deaths.filter(d => d.person);
  const lastDeath = villagerDeaths.length ? villagerDeaths[villagerDeaths.length - 1] : null;
  const lastW5Fight = fights.filter(f => (f.wave | 0) === 5).slice(-1)[0] || null;
  let killerClass, killerReason;
  if (end.endReason !== 'village-lost') { killerClass = 'survived'; killerReason = 'village not lost by cap'; }
  else if ((tierAtEnd | 0) >= 4 && rerun.postWindow >= 4) { killerClass = 'rerun-clock'; killerReason = 'end tier>=4 and >=4 rerun fights in post-window'; }
  else if (lastDeath && lastW5Fight && Math.abs((lastDeath.day | 0) - (lastW5Fight.day | 0)) <= 3 && rerun.postWindow < 4) { killerClass = 'single-apex'; killerReason = 'last death within 3d of a wave-5 fight, <4 rerun fights in window'; }
  else { killerClass = 'mixed/other'; killerReason = 'neither rerun-clock nor single-apex rule fires'; }
  const qualifying = (end.national === 1) || (unlock.w5Day != null);
  return { qualifying, nationalDay, tableDay, tierFirst, tierAtNational, tierAtDoor, tierAtEnd,
    daysAtTier, windowOpen, rerun, fights: allFights,
    daysPostDoor: unlock.w5Day != null ? (end.days - unlock.w5Day) : null,
    daysPostNational: nationalDay != null ? (end.days - nationalDay) : null,
    lastDeath: lastDeath ? { day: lastDeath.day, who: lastDeath.whoName || lastDeath.who, cause: lastDeath.cause, opp: lastDeath.oppMid || null, wave: lastDeath.oppWave != null ? lastDeath.oppWave : lastDeath.wave } : null,
    killerClass, killerReason,
    trajectoryComplete: trace.length > 0 && tierAtEnd != null && typeof rerun.all === 'number' };
}

module.exports = { dayOf, tierOf, rankOf, waveOf, traceRow, wrapPolicy, deriveTrajectory };
