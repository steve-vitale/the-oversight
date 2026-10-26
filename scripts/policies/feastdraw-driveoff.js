// feastdraw-driveoff — drive off EVERY feast draw (sim-driveoff-a,
// 2026-10-26, flesh-out loop A, axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This is a measurement
// instrument, not a play recommendation: it prices the
// face-vs-drive-off choice that sim-feastdraw-a left unmeasured
// (always-face policy: 5 draws, 5 faced, 0 driven off).
//
// MECHANISM, READ FROM CODE (src/js/feastBuff.js, never invented):
//   - drawFeastScavenger spawns at most one draw per FRESH armed
//     grant; refreshes never draw. The draw sets s.feastDraw +
//     pendingEncounter/pendingMonsterId.
//   - driveOffFeastDraw deletes s.feastDraw, clears
//     pendingEncounter, returns {ok:true, drivenOff:true}. No
//     fight, no devotion spent, the buff stays live until its
//     dawn — declining the fight declines the deed, honestly.
//   - faceFeastDraw starts combat then deletes the draw.
//   - clearFeastBuff(expired) kills a still-circling draw with
//     the buff.
//   - The harness fallback (sim-harness driveContestsImpl) faces
//     any still-pending encounter by calling startCombat
//     directly. A policy that merely leaves draws pending gets
//     them FACED by the fallback, not driven off. This policy
//     therefore calls driveOffFeastDraw EXPLICITLY, in two
//     places: the upkeep pre-check (before the base upkeep can
//     face anything) and the harness's own policy.pending hook
//     (the explicit-bot-choice slot that runs before the
//     fallback in every driveContests).
//   - Why COMPETENT_SEEK_FIGHTS=0 on the drive-off arm: the
//     base policy's feastFightRoad faces the draw inside
//     competent.upkeep (eveningFeast grants, then feastFightRoad
//     faces, all in one upkeep call) — no policy hook runs
//     between grant and face. The ONLY policy-side way to keep
//     the draw alive long enough to decline it is to stop
//     feastFightRoad from facing (its own env gate, read live
//     per call, scoped to exactly that function) and answer
//     the draw in the pending hook instead. CONFOUND, STATED
//     PLAINLY: COMPETENT_SEEK_FIGHTS=0 also skips feastFightRoad's
//     feasted patrol sweeps. The drive-off arm's delta vs
//     control is therefore (draws driven off) + (no feasted
//     patrol). The per-draw funnel is still cleanly priced:
//     nonworldkill classifies patrol fights under other doors
//     (world-bump etc.), never feast-draw, so no patrol fight
//     can masquerade as a draw outcome. The cost bar in the
//     evidence judges the combined posture, honestly labeled.
//   - PURE READS for the pending check: this policy reads
//     s.feastDraw / pendingEncounter directly, NEVER
//     feastDrawPending() (self-cleaning: it deletes a stale
//     draw as a side effect). driveOffFeastDraw itself calls
//     feastDrawPending internally — that is the game's own
//     validation, not this policy's probe.
//
// DEFAULT OFF: FEASTDRAWDRIVEOFF unset or not '1' -> daily,
// upkeep and pending all delegate to tableseat-nowait with no
// drive-off behavior at all (the det-gate in
// scripts/test-driveoff-a.js pins that: off daily/upkeep/pending
// match plain tableseat-nowait on days/gameDays/ts, with no
// ctx surface and no installed wraps).
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

function driveoffLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.FEASTDRAWDRIVEOFF) || '0') === '1'; } catch (e) { return false; }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// liveDraw: the pending draw by DIRECT reads only (pure — no
// self-cleaning probe). Null when no draw, or when the draw's
// pending encounter is not live (stale marker, someone else's
// encounter) — such a marker is never driven off by this policy.
function liveDraw(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const d = s.feastDraw || null;
    if (!d || !d.monsterId) return null;
    if (!Game.pendingEncounter || Game.pendingMonsterId !== d.monsterId) return null;
    return d;
  } catch (e) { return null; }
}

// driveOffNow: decline one pending draw explicitly, then prove
// no phantom is left behind (pure post-reads: pendingEncounter
// false AND s.feastDraw gone). Every attempt — ok or failed —
// is counted on ctx, never hidden; a failed attempt (game
// validation refused, e.g. buff already expired between the
// check and the call) is recorded with its reason, not retried.
function driveOffNow(Game, ctx, where) {
  try {
    if (Game.over || (Game.tbfight && !Game.tbfight.over)) return false;
    const d = liveDraw(Game);
    if (!d) return false;
    let r = null;
    try { r = (typeof Game.driveOffFeastDraw === 'function') ? Game.driveOffFeastDraw() : null; }
    catch (e) { ctx.fdDriveoffErr = String((e && e.message) || e).slice(0, 120); return false; }
    ctx.fdDriveoffAttempts = (ctx.fdDriveoffAttempts || 0) + 1;
    if (r && r.ok) {
      ctx.fdDriveoffOk = (ctx.fdDriveoffOk || 0) + 1;
      let post = null;
      try {
        const s = (Game.state || {}).scholar || {};
        post = {
          pendingEncounter: !!Game.pendingEncounter,
          pendingMonsterId: Game.pendingMonsterId || null,
          feastDraw: s.feastDraw ? String(s.feastDraw.monsterId) : null,
        };
      } catch (e) { post = null; }
      const checks = ctx.fdDriveoffChecks || (ctx.fdDriveoffChecks = []);
      checks.push({
        day: dayOf(Game), monsterId: String(d.monsterId), where: where,
        post: post, phantom: !!(post && (post.pendingEncounter || post.feastDraw)),
      });
      return true;
    }
    const failed = ctx.fdDriveoffFailed || (ctx.fdDriveoffFailed = []);
    failed.push({ day: dayOf(Game), monsterId: String(d.monsterId), where: where, why: (r && r.why) ? String(r.why).slice(0, 120) : 'not-ok' });
    return false;
  } catch (e) { ctx.fdDriveoffErr = String((e && e.message) || e).slice(0, 120); return false; }
}

const feastdrawDriveoff = Object.assign({}, tableseatNowait, {
  id: 'feastdraw-driveoff',
  desc: 'tableseat-nowait + drive off EVERY feast draw (FEASTDRAWDRIVEOFF=1; default off = tableseat-nowait)',
  upkeep(Game, ctx) {
    if (driveoffLayerOn()) driveOffNow(Game, ctx, 'upkeep');
    return (typeof tableseatNowait.upkeep === 'function') ? tableseatNowait.upkeep(Game, ctx) : undefined;
  },
  daily(Game, ctx) {
    // No daily leg: the pending hook answers every draw at
    // driveContests time (after every part and after sleep),
    // so no draw survives to a daily boundary unanswered.
    return tableseatNowait.daily(Game, ctx);
  },
  pending(Game, ctx) {
    if (!driveoffLayerOn()) return false;
    return driveOffNow(Game, ctx, 'pending');
  },
});

module.exports = { feastdrawDriveoff, driveoffLayerOn, liveDraw, driveOffNow };
