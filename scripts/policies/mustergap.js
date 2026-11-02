// policies/mustergap.js — muster-completion prototype (Loop B 20261102T1030Z,
// arm sim-mustergap-b, axis scale-onramp). POLICY ONLY: zero src/js changes.
// Wraps a titanroute-wrapped base policy and adds ONE leg: after the call
// has sounded, while the sounded coalition still stands and the hard gate
// is unmet, commit Haven's own blades via the player's own two-tap verb
// (Game.titanCommitOwn). It NEVER re-sounds the call, never touches a
// spent muster, and never commits when the gate is met.
//
// TAP CADENCE (gap2, button-faithful — see prereg addendum): ONE commit
// episode per muster: titanCommitOwn is called twice in the SAME daily
// (tap + confirm, exactly as the button offers in one sitting), then the
// episode ends — no daily re-taps. The gap1 cadence (one tap per daily)
// is NOT the button: titanCommitOwn re-keys its pending confirm to the
// volunteer set on every call, so a churning pool resets pending instead
// of committing (97338 gap1: 13 days of stutter, 1 blade). One episode
// also means committed blades that later attrit are NOT replaced daily;
// a player would have to notice and re-commit, which is out of scope.
//
// PERCEPTION LAW (load-bearing): the policy NEVER reads a monster roster,
// an allied roster, or a link list for this decision. It decides only from:
//   1. the call record the titanroute leg already heard (ctx.titan.called);
//   2. its OWN muster record (Game.titanMusterState / Game.titanMusterReady
//      — the coalition the village itself assembled, whose answers were
//      spoken aloud by name when the call sounded);
//   3. its own slain flag (Game.state.titans.slain);
//   4. the player verb Game.titanCommitOwn (the game itself picks the
//      volunteers from Haven's own people, as the two-tap button does).
// No RNG is consumed (no random calls), so arm/baseline trajectories
// differ ONLY through the commit actions and their consequences.
'use strict';

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function slain(Game) {
  try { return !!((((Game.state || {}).titans || {}).slain || {}).herald); } catch (e) { return false; }
}

function musterOf(Game) {
  try {
    if (typeof Game.titanMusterState === 'function') return Game.titanMusterState('herald');
    return null;
  } catch (e) { return null; }
}

function musterReady(Game) {
  try {
    if (typeof Game.titanMusterReady === 'function') return !!Game.titanMusterReady('herald');
    return false;
  } catch (e) { return false; }
}

function havenCount(muster) {
  try {
    var seen = {};
    ((muster && muster.haven) || []).forEach(function (h) {
      var vid = h && (h.vid || h);
      if (vid) seen[vid] = true;
    });
    return Object.keys(seen).length;
  } catch (e) { return 0; }
}

function withMusterGap(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'mustergap',
    desc: desc || 'mustergap: commit Haven blades after a short sounded call',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.musterBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const mg = ctx.mustergap || (ctx.mustergap = { commitCalls: [] });
      try {
        const called = ctx.titan && ctx.titan.called;
        // Only a call THIS policy's march sounded (an object record), not a
        // preexisting muster and not an unsounded run. One episode per
        // muster: after an episode ends (committed, nothing free, or a
        // confirm-only stutter), never tap again.
        if (!called || typeof called !== 'object') return;
        if (mg.episodeDone) return;
        if (Game.over || Game.tbfight) return;
        if (slain(Game)) return;
        if (typeof Game.titanCommitOwn !== 'function') { mg.commitError = 'titanCommitOwn missing'; return; }
        const muster = musterOf(Game);
        // The sounded coalition must still stand: a spent muster (allies
        // emptied by a lost fight) gets no fresh Haven blades without a
        // new call, and this prototype never re-sounds.
        if (!muster || !muster.allies || muster.allies.length === 0) return;
        if (musterReady(Game)) return;
        if (havenCount(muster) >= 3) return;
        const before = havenCount(muster);
        // ONE episode, two taps in the same daily: tap, then confirm.
        const r1 = Game.titanCommitOwn('herald');
        let r2 = null, r2done = false;
        if (r1 === 'confirm') { r2 = Game.titanCommitOwn('herald'); r2done = true; }
        const afterMuster = musterOf(Game);
        mg.commitCalls.push({ day: gday(Game),
          result: r1 == null ? 'null' : (r2done ? (r2 == null ? 'null' : (r2 === 'confirm' ? 'confirm-only' : 'committed')) : 'committed'),
          taps: r2done ? 2 : 1,
          havenBefore: before, havenAfter: havenCount(afterMuster) });
        mg.episodeDone = true;
      } catch (e) {
        mg.commitError = String((e && e.message) || e).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withMusterGap };
