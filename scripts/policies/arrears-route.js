'use strict';
// arrears-route — wait-for-arrears muster-call policy variant
// (sim-arrears-route-a, Loop A 20261102T0605Z, axis scale-onramp).
// POLICY-SIDE ONLY: zero src/js changes. Decides WHEN to sound the
// titan call, never how the call behaves, and never touches trust,
// opinion, or arrears itself.
//
// Rule (prereg evidence/2026-11-02/sim-arrears-route-a-prereg.md):
// at a refused Herald attempt, compute readiness with the DEPLOYED
// Game.titanCallReadiness('herald'). If readiness is NOT ready AND
// the ONLY blockers are arrears links (every refusing link refuses
// solely on arrears: trust >= 25 AND opinion >= -10 AND arrears > 0,
// with at least one such link), DEFER sounding and re-check weekly
// for up to 28 days (ticks at deferDay + 7/+14/+21/+28). If a tick
// finds readiness ready, sound then. If the +28 tick still finds
// it not ready, stand down without sounding (no refusal penalty,
// no muster). The policy NEVER sounds a call the faithful rule says
// is unready.
//
// This module is PURE decision logic: it takes readiness-shaped
// objects ({ready, links: [{trust, opinion, arrears, wouldRefuse}]})
// and returns decisions. It calls NO game mutator — no
// soundTitanCall, no titanCommitOwn, no payTribute, no tendLink,
// no answerDemand, no titanStandDown. The replay performs the
// sound; the game function performs the readiness check. Nothing
// here moves trust, opinion, or arrears, so any such movement
// between deferral and sound is the base game's doing, visible in
// the replay's check rows.
//
// ISOLATION (pre-registered): the armed arm sounds ONLY via the
// deferral path. A seed whose first check is already ready, or
// whose block is never arrears-only, never sounds here. At most
// one sound per seed; sounded / stood-down are terminal.

function isArrearsOnlyBlock(readiness) {
  if (!readiness || readiness.ready) return false;
  var links = readiness.links || [];
  var blocked = links.filter(function (l) { return l && l.wouldRefuse; });
  if (!blocked.length) return false;
  return blocked.every(function (l) {
    return (l.trust || 0) >= 25 && (l.opinion || 0) >= -10 && (l.arrears || 0) > 0;
  });
}

// First arrears-refusing link in a readiness object, for naming the
// fire and the debt in narration. Returns null when there is none.
function firstArrearsLink(readiness) {
  var links = (readiness && readiness.links) || [];
  for (var i = 0; i < links.length; i++) {
    var l = links[i];
    if (l && l.wouldRefuse && (l.arrears || 0) > 0 &&
        (l.trust || 0) >= 25 && (l.opinion || 0) >= -10) return l;
  }
  return null;
}

function newState() {
  return { status: 'idle', deferDay: null, tickIndex: 0,
    soundedDay: null, stoodDownDay: null };
}

var TICK_OFFSETS = [7, 14, 21, 28];

// Observe a refused-attempt readiness check. While idle, an
// arrears-only block starts a deferral. While deferring, sounded,
// or stood-down, observations change nothing (ticks, not refusals,
// are the decision moments — sounding at a mid-week refusal would
// be the sumtrigger rule, not this arm's). Returns 'defer' or
// 'none'. Never mutates the readiness object.
function observeRefusal(state, day, readiness) {
  if (!state || state.status !== 'idle') return 'none';
  if (isArrearsOnlyBlock(readiness)) {
    state.status = 'deferring';
    state.deferDay = day;
    state.tickIndex = 0;
    return 'defer';
  }
  return 'none';
}

// The tick number (1..4) due on this day, or null. At most one tick
// per day; a day past several ticks fires only the earliest due one
// (days advance one at a time in the harness, so this is defensive).
function dueTick(state, day) {
  if (!state || state.status !== 'deferring' || state.deferDay == null) return null;
  if (state.tickIndex >= TICK_OFFSETS.length) return null;
  var dueDay = state.deferDay + TICK_OFFSETS[state.tickIndex];
  return (day >= dueDay) ? (state.tickIndex + 1) : null;
}

// Record a tick's outcome. outcome is 'sounded' (the replay sounded
// on a ready row), 'ready-absent' (ready row, but the sound
// returned null — nothing located, no muster, no penalty), or
// 'not-ready'. Returns the new status. Sounded and stood-down are
// terminal: tick 4 not-ready (or ready-absent) stands down.
function onTickResult(state, tick, outcome) {
  if (!state || state.status !== 'deferring') return state ? state.status : 'idle';
  state.tickIndex = tick;
  if (outcome === 'sounded') {
    state.status = 'sounded';
  } else if (tick >= TICK_OFFSETS.length) {
    state.status = 'stood-down';
  }
  return state.status;
}

module.exports = {
  isArrearsOnlyBlock: isArrearsOnlyBlock,
  firstArrearsLink: firstArrearsLink,
  newState: newState,
  dueTick: dueTick,
  observeRefusal: observeRefusal,
  onTickResult: onTickResult,
  tickOffsets: TICK_OFFSETS.slice(),
};
