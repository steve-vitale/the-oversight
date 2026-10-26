// feastrefresh — feast on a DAILY cadence to exercise the feast
// refresh branch (sim-feastrefresh-a, 2026-10-26, flesh-out loop A,
// axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This is a measurement
// instrument, not a play recommendation: prior bands
// (sim-feastdraw-a, sim-driveoff-a) recorded refreshed = 0
// everywhere, because competent eveningFeast/surplusFeast enforce
// an armed cadence of 7 days while the buff window is 2 dawns —
// a village re-feasts ~7 days later, after the buff expired, so
// every re-feast is fresh and the refresh branch never runs.
//
// MECHANISM, READ FROM CODE (src/js/feastBuff.js, never invented):
//   - grantFeastBuff gates: reactor online => refusal; devotion
//     unarmed => refusal; an EXISTING live buff => REFRESH
//     (better quality wins, multiplier recomputed never
//     multiplied, untilDay = grant day + durationNights (2),
//     returns refreshed:true, NO draw call); otherwise FRESH
//     (sets s.feastBuff, calls drawFeastScavenger once).
//   - feastedBuffState() calls feastedActive(), which lazily
//     clears an expired buff — a grant after the expiry dawn is
//     fresh, not refresh. A dusk feast on day D buys untilDay
//     D+2, so the ONLY dusk inside the window is D+1.
//   - Devotion is spent only by real use (_spendFeastedPower:
//     real combat use or landed bonus healing). Driving off
//     spends NO devotion. So this instrument wraps the
//     COMMITTED feastdraw-driveoff policy: drive-off keeps the
//     arming alive, which is what makes a refresh reachable.
//     (After a FACED draw fight the arming is spent, so a
//     re-feast inside the window would hit the devotion gate,
//     not the refresh branch — that path is not this arm's.)
//   - The ONLY thing this layer changes about feasting is the
//     POLICY's own cadence: in upkeep, before delegating, it
//     clears ctx._lastFeastDay / ctx._sfLastFeastDay, so the base
//     eveningFeast/surplusFeast can feast on consecutive dusks.
//     Every GAME gate still applies: dusk-only, at-haven, one
//     feast/day, affordability (have >= cost*1.5), recentGives
//     >= 1500 in the last 7 days, feastPlan ok.
//
// BUFF SNAPSHOTS (pure reads, on ctx.frBuffSnaps): pre/post
// every upkeep call — day, dayPart, s.feastBuff {quality, mult,
// untilDay, used} read DIRECTLY, s.feastDraw {monsterId, day}
// read DIRECTLY, pendingEncounter/pendingMonsterId. This layer
// NEVER calls feastedActive() or feastDrawPending() (both can
// clear state — feastedActive clears an expired buff,
// feastDrawPending deletes a stale draw). Snapshots are capped
// (overflow counted on ctx, never thrown into the engine).
//
// CONFOUND, STATED PLAINLY: the refresh arm's delta vs control
// is (daily feast cadence + drive-off draws + no feasted patrol
// via COMPETENT_SEEK_FIGHTS=0, inherited from the drive-off
// layer). Grant-level refresh classification is mechanism-clean;
// wall-number deltas are diagnostic side effects only.
//
// DEFAULT OFF: FEASTREFRESH unset or not '1' -> daily, upkeep
// and pending delegate to the drive-off policy with no cadence
// clearing and no snapshots at all (the det-gate in
// scripts/test-feastrefresh-a.js pins that: off daily/upkeep
// match plain tableseat-nowait on days/gameDays/ts, with no
// ctx fr surface and no installed wraps).
'use strict';
const { feastdrawDriveoff } = require('./feastdraw-driveoff');

const MAX_SNAPS = 4000;

function refreshLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.FEASTREFRESH) || '0') === '1'; } catch (e) { return false; }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function partOf(Game) { try { return (typeof Game.dayPart === 'number') ? Game.dayPart : null; } catch (e) { return null; } }

// snapBuffState: PURE direct reads only — never feastedActive()
// (clears expired buffs) or feastDrawPending() (deletes stale draws).
function snapBuffState(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const b = s.feastBuff || null;
    const d = s.feastDraw || null;
    return {
      buff: (b && typeof b === 'object') ? {
        quality: (b.quality != null ? b.quality : null),
        mult: (b.mult != null ? b.mult : null),
        untilDay: (b.untilDay != null ? b.untilDay : null),
        used: !!b.used,
      } : null,
      draw: (d && d.monsterId) ? { monsterId: String(d.monsterId), day: (d.day || 0) } : null,
      pendingEncounter: !!Game.pendingEncounter,
      pendingMonsterId: (Game.pendingMonsterId != null ? String(Game.pendingMonsterId) : null),
    };
  } catch (e) { return { buff: null, draw: null, pendingEncounter: false, pendingMonsterId: null, snapErr: String((e && e.message) || e).slice(0, 80) }; }
}

function snapInto(Game, ctx, where) {
  try {
    const arr = ctx.frBuffSnaps || (ctx.frBuffSnaps = []);
    if (arr.length >= MAX_SNAPS) { ctx.frBuffSnapsOverflow = (ctx.frBuffSnapsOverflow || 0) + 1; return; }
    const st = snapBuffState(Game);
    arr.push({ day: dayOf(Game), part: partOf(Game), where: where, buff: st.buff, draw: st.draw, pendingEncounter: st.pendingEncounter, pendingMonsterId: st.pendingMonsterId });
  } catch (e) { ctx.frSnapErr = String((e && e.message) || e).slice(0, 80); }
}

const feastrefresh = Object.assign({}, feastdrawDriveoff, {
  id: 'feastrefresh',
  desc: 'tableseat-nowait + drive off every feast draw + feast every affordable dusk (FEASTREFRESH=1; default off = drive-off policy)',
  upkeep(Game, ctx) {
    if (!refreshLayerOn()) return feastdrawDriveoff.upkeep(Game, ctx);
    // Pre-upkeep snapshot, then clear ONLY the policy's own
    // cadence markers (the 7-day wait) — every game gate stays.
    snapInto(Game, ctx, 'pre');
    try { ctx._lastFeastDay = null; } catch (e) {}
    try { ctx._sfLastFeastDay = null; } catch (e) {}
    let r = undefined;
    try { r = feastdrawDriveoff.upkeep(Game, ctx); } catch (e) { throw e; } finally {
      // Post-upkeep snapshot: a dusk grant (fresh or refresh) is
      // visible here as the new buff state, whatever the base
      // upkeep did with the evening.
      try { snapInto(Game, ctx, 'post'); } catch (e2) {}
    }
    return r;
  },
  daily(Game, ctx) {
    return feastdrawDriveoff.daily(Game, ctx);
  },
  pending(Game, ctx) {
    return feastdrawDriveoff.pending(Game, ctx);
  },
});

module.exports = { feastrefresh, refreshLayerOn, snapBuffState, MAX_SNAPS };
