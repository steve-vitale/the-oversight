// policies/commitrefresh.js — commit-own REFRESH prototype (sim-closedecay-a
// follow-up to the decay trace, axis scale-onramp). POLICY ONLY: zero
// src/js changes. Wraps the closecommit stack (titanroute + musterclose +
// mustergap one-episode commit) and adds ONE leg: when the sounded
// coalition still stands, the hard gate is unmet, and Haven's committed
// count has DROPPED below its last-seen value (a blade fell or became the
// bearer), run ONE fresh two-tap commit episode in the same daily
// (tap + confirm, exactly as the button offers in one sitting) to top
// Haven's blades back up toward 3. It never re-sounds the call, never
// touches a spent muster, and never commits when the gate is met.
//
// WHY THIS LEG EXISTS: the closedecay trace (97330, 97338) shows the
// one-episode commit leg's blades evaporating before contact — not
// through allied decay (allies constant) but through the bearer
// succession chain passing through the committed blades themselves
// (each new bearer drops out of muster.haven by bearer exclusion, and
// then dies in the wild as bearer). A player watching the muster would
// notice blades missing and send replacements; the one-episode leg
// cannot, by design. This prototype measures whether noticing-and-
// replacing closes the fight gate, or whether the succession chain eats
// refreshes too.
//
// PERCEPTION LAW (load-bearing): the policy NEVER reads a monster roster,
// an allied roster, or a link list. It decides only from:
//   1. the call record the titanroute leg already heard (ctx.titan.called);
//   2. its OWN muster record (Game.titanMusterState / Game.titanMusterReady
//      — the coalition the village itself assembled);
//   3. its own slain flag (Game.state.titans.slain);
//   4. the player verb Game.titanCommitOwn (the game itself picks the
//      volunteers from Haven's own people, as the two-tap button does).
// No RNG is consumed, so arm/baseline trajectories differ ONLY through
// the refresh actions and their consequences. The mustergap leg's
// episodeDone flag is NOT reset or bypassed from outside: this leg
// calls titanCommitOwn directly, and records its own episodes in
// ctx.commitrefresh, so the two legs' records stay separable.
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

function withCommitRefresh(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'commitrefresh',
    desc: desc || 'commitrefresh: re-commit Haven blades after a drop, while the gate is unmet',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.commitrefreshBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const cr = ctx.commitrefresh || (ctx.commitrefresh = { episodes: [], lastSeenHaven: null });
      try {
        const called = ctx.titan && ctx.titan.called;
        if (!called || typeof called !== 'object') return;
        if (Game.over || Game.tbfight) return;
        if (slain(Game)) return;
        if (typeof Game.titanCommitOwn !== 'function') { cr.commitError = 'titanCommitOwn missing'; return; }
        const muster = musterOf(Game);
        if (!muster || !muster.allies || muster.allies.length === 0) return;
        const now = havenCount(muster);
        // Record the seen count EVERY day the muster stands — including
        // gate-met days. (v1 bug, caught on 97330: returning early while
        // the gate was met meant the 3 -> 2 drop was never recorded, so
        // when the gate finally failed the leg treated 0 as its baseline
        // and never fired. The seen count is a record, not an action.)
        // First sight after the call: record, do not act — the mustergap
        // leg owns the first episode. Act only when the gate is unmet
        // AND the count has dropped below last seen.
        if (cr.lastSeenHaven == null) { cr.lastSeenHaven = now; return; }
        if (musterReady(Game)) { cr.lastSeenHaven = now; return; }
        if (now >= cr.lastSeenHaven) { cr.lastSeenHaven = now; return; }
        if (now >= 3) { cr.lastSeenHaven = now; return; }
        const before = now;
        const r1 = Game.titanCommitOwn('herald');
        let r2 = null, r2done = false;
        if (r1 === 'confirm') { r2 = Game.titanCommitOwn('herald'); r2done = true; }
        const afterMuster = musterOf(Game);
        const after = havenCount(afterMuster);
        cr.episodes.push({ day: gday(Game),
          result: r1 == null ? 'null' : (r2done ? (r2 == null ? 'null' : (r2 === 'confirm' ? 'confirm-only' : 'committed')) : 'committed'),
          taps: r2done ? 2 : 1, havenBefore: before, havenAfter: after });
        cr.lastSeenHaven = after;
      } catch (e) {
        cr.commitError = String((e && e.message) || e).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withCommitRefresh };
