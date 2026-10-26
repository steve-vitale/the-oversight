// feastdraw-driveoff-clean — drive off EVERY feast draw WITHOUT
// killing the feasted patrol (sim-driveoff-clean-a, 2026-10-26,
// flesh-out loop A, axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This is a measurement
// instrument, not a play recommendation: it separates the two
// ingredients the sim-driveoff-a arm confounded (draws driven off)
// + (no feasted patrol) by driving off every draw while leaving
// feastFightRoad's patrol branch fully alive.
//
// THE CONFOUND, READ FROM CODE (scripts/policies/competent.js):
//   - competent.upkeep runs eveningFeast (a fresh ARMED grant
//     spawns the draw) and then, in the SAME upkeep call,
//     feastFightRoad. feastFightRoad is the ONLY sim caller of
//     Game.faceFeastDraw in this policy chain (app.js UI calls
//     never load in node sims; winseek/shark/livelihood are not
//     in this chain).
//   - feastFightRoad's two branches share ONE env gate:
//     `if (process.env.COMPETENT_SEEK_FIGHTS === '0') return;`
//     — the draw branch (face the pending draw) and the patrol
//     branch (up to 3 sweeps/day while feasted, buff unmarked).
//     The old arm set SEEK_FIGHTS=0 to keep the draw alive until
//     the pending hook could decline it, and thereby killed the
//     patrol too. This policy leaves SEEK_FIGHTS UNSET (on).
//
// THE CLEAN HOOK: a policy-side intercept of Game.faceFeastDraw,
// installed from this policy's upkeep. The sweep installs the
// feastdraw/nonworldkill recorders at setup, before any daily or
// upkeep, so by install time Game.faceFeastDraw is already the
// recorder's face wrapper — the intercept sits OUTSIDE it and
// replaces it. When feastFightRoad calls faceFeastDraw with a
// LIVE draw (direct reads of s.feastDraw + pendingEncounter,
// never the self-cleaning feastDrawPending probe), the intercept
// calls Game.driveOffFeastDraw() LIVE (so the recorder's
// driveoff wrapper fires and records the driveoff row),
// records a post-check (pendingEncounter false AND s.feastDraw
// gone), and returns the driveoff result. The draw is driven off
// at the exact moment it would have been faced, inside the same
// upkeep, with no other competent.upkeep step moved, skipped, or
// reordered. When no live draw is present, the intercept falls
// back to the original faceFeastDraw (defensive; counted in
// ctx.fdCleanFallback — it should not fire in this chain).
//
// WHY NOT THE ALTERNATIVES (see evidence pre-registration):
//   - Splitting competent.upkeep: cookPack/drinkSafe/checkTicks/
//     workWater are NOT exported from competent.js, so a
//     replicated upkeep would diverge from competent. The
//     intercept changes exactly one call site.
//   - Creation-choke (suppress drawFeastScavenger): suppression
//     is not drive-off — no refusal narration, no watcher
//     memory, and the grant's draw field changes. The intercept
//     preserves the real drive-off verb, its narration, and its
//     memory effect.
//
// SAFETY NETS (kept from the old policy, counted separately):
// the upkeep pre-check drives off draws pending BEFORE the base
// upkeep, and the harness policy.pending hook drives off draws
// still pending at driveContests time. Both use the old policy's
// driveOffNow (pure post-checks, never retried). A draw that
// survives a fight-interrupted upkeep is still driven off, never
// left to the harness fallback. Intercept drive-offs are counted
// in ctx.fdCleanIntercept / fdCleanChecks; safety-net drive-offs
// in ctx.fdDriveoff* (old policy's counters).
//
// DEFAULT OFF: FEASTDRAWCLEAN unset or not '1' -> upkeep, daily
// and pending all delegate to tableseat-nowait with no intercept
// installed, no ctx surface, no Game flag (the det-gate in
// scripts/test-feastdraw-driveoff-clean-sweep.js pins that: off
// daily/upkeep/pending match plain tableseat-nowait on
// days/gameDays/ts, with no ctx fd surface and no installed
// wraps).
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');
const { driveOffNow } = require('./feastdraw-driveoff');

function cleanLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.FEASTDRAWCLEAN) || '0') === '1'; } catch (e) { return false; }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// liveDraw: the pending draw by DIRECT reads only (pure — no
// self-cleaning probe). Null when no draw, or when the draw's
// pending encounter is not live (stale marker, someone else's
// encounter) — such a marker is never intercepted.
function liveDraw(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const d = s.feastDraw || null;
    if (!d || !d.monsterId) return null;
    if (!Game.pendingEncounter || Game.pendingMonsterId !== d.monsterId) return null;
    return d;
  } catch (e) { return null; }
}

// installFaceIntercept(Game, ctx): replace Game.faceFeastDraw with
// the intercept, once per Game object. The saved original is the
// recorder-wrapped face (installed at sweep setup) — it is only
// ever called on the no-live-draw fallback path, so a fallback
// still records a proper face row. The intercept itself never
// calls the original: it calls Game.driveOffFeastDraw() live, so
// the recorder's driveoff wrapper records the driveoff row.
function installFaceIntercept(Game, ctx) {
  try {
    if (!Game || typeof Game.faceFeastDraw !== 'function') return false;
    if (Game._fdCleanInterceptInstalled) return true;
    const origFace = Game.faceFeastDraw;
    Game.faceFeastDraw = function () {
      try {
        const d = liveDraw(Game);
        if (!d) {
          // Defensive fallback: no live draw — behave exactly as
          // the original face would (records its own row, says
          // its own line). Counted, never hidden.
          try { ctx.fdCleanFallback = (ctx.fdCleanFallback || 0) + 1; } catch (e) {}
          return origFace.apply(this, arguments);
        }
        let r = null;
        try { r = (typeof Game.driveOffFeastDraw === 'function') ? Game.driveOffFeastDraw() : null; }
        catch (e) { try { ctx.fdCleanErr = String((e && e.message) || e).slice(0, 120); } catch (e2) {} return { ok: false, why: 'driveoff threw' }; }
        try { ctx.fdCleanIntercept = (ctx.fdCleanIntercept || 0) + 1; } catch (e) {}
        if (r && r.ok) {
          let post = null;
          try {
            const s = (Game.state || {}).scholar || {};
            post = {
              pendingEncounter: !!Game.pendingEncounter,
              pendingMonsterId: Game.pendingMonsterId || null,
              feastDraw: s.feastDraw ? String(s.feastDraw.monsterId) : null,
            };
          } catch (e) { post = null; }
          try {
            const checks = ctx.fdCleanChecks || (ctx.fdCleanChecks = []);
            checks.push({
              day: dayOf(Game), monsterId: String(d.monsterId), where: 'intercept',
              post: post, phantom: !!(post && (post.pendingEncounter || post.feastDraw)),
            });
          } catch (e) {}
        } else {
          try {
            const failed = ctx.fdCleanFailed || (ctx.fdCleanFailed = []);
            failed.push({ day: dayOf(Game), monsterId: String(d.monsterId), where: 'intercept', why: (r && r.why) ? String(r.why).slice(0, 120) : 'not-ok' });
          } catch (e) {}
        }
        return r;
      } catch (e) {
        try { ctx.fdCleanErr = String((e && e.message) || e).slice(0, 120); } catch (e2) {}
        return { ok: false, why: 'intercept failed' };
      }
    };
    try { Game._fdCleanInterceptInstalled = true; } catch (e) {}
    return true;
  } catch (e) { return false; }
}

const feastdrawDriveoffClean = Object.assign({}, tableseatNowait, {
  id: 'feastdraw-driveoff-clean',
  desc: 'tableseat-nowait + drive off EVERY feast draw via a faceFeastDraw intercept, patrol preserved (FEASTDRAWCLEAN=1; SEEK_FIGHTS stays on; default off = tableseat-nowait)',
  upkeep(Game, ctx) {
    if (cleanLayerOn()) {
      installFaceIntercept(Game, ctx);
      driveOffNow(Game, ctx, 'precheck');
    }
    return (typeof tableseatNowait.upkeep === 'function') ? tableseatNowait.upkeep(Game, ctx) : undefined;
  },
  daily(Game, ctx) {
    return tableseatNowait.daily(Game, ctx);
  },
  pending(Game, ctx) {
    if (!cleanLayerOn()) return false;
    return driveOffNow(Game, ctx, 'pending');
  },
});

module.exports = { feastdrawDriveoffClean, cleanLayerOn, liveDraw, installFaceIntercept };
