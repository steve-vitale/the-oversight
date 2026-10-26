// devotiongate — stage unarmed, reactor-free feasts to observe the
// devotion gate (sim-devotiongate-a, 2026-10-26, flesh-out loop A,
// axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This is a measurement
// instrument, not a play recommendation: prior bands
// (sim-feastdraw-a, sim-driveoff-a, sim-feastrefresh-a) recorded
// devotion-gate refusals = 0 everywhere, because grantFeastBuff
// checks the fusion-reactor ceiling BEFORE the devotion gate —
// any village that is both unarmed and reactor-online reads as a
// reactor refusal, and every feasting village on those bands was
// armed-or-reactor by the time it could feast.
//
// MECHANISM, READ FROM CODE (src/js/feastBuff.js, never invented):
//   - grantFeastBuff gates in order: reactor online => refusal;
//     devotion unarmed (neither prog.feastSurge nor the
//     feast-carried feast.surge) => refusal; an EXISTING live
//     buff => REFRESH; otherwise FRESH.
//   - Devotion arming (src/js/progression.js channelSentiment):
//     requires sentimentTaught first (teachSentiment, on
//     crossing integration 60 while holding a keepsake); then
//     3+ abilities at L3 OR surgeResonance >= 35. Before the
//     gate is met, channeling gives practice XP, not arming.
//   - Policy order: competent daily channels FIRST, then the
//     day's work; competent upkeep (3x/day, one per day-part)
//     feasts at dusk (dayPart 2). The harness calls upkeep at
//     each day-part, then daily, then sleep — so a dusk feast
//     is armed only by channels from EARLIER days. A staging
//     feast in upkeep, before the base upkeep, therefore
//     probes the pre-arming window honestly.
//   - Arming is spent only by real combat use or landed bonus
//     healing; driving off spends nothing. So the unarmed
//     windows a feast can reach are: (i) before
//     sentimentTaught, (ii) after sentimentTaught but before
//     the gate is met (resonance still < 35, fewer than 3
//     L3), (iii) the intra-day post-spend window, which no
//     dusk feast can reach (re-channeling happens in daily
//     the same day as the spend). This instrument stages
//     for (i) and (ii).
//
// WHAT THE LAYER CHANGES (policy choices only — every GAME gate
// still applies): in upkeep, before delegating, it attempts ONE
// staging feast per day when ALL of these hold: dusk
// (dayPart 2), at haven, no feast yet today (the game's 1/day
// rule), no definitely-live buff (raw s.feastBuff read
// directly, untilDay > day — NEVER feastedActive(), which can
// clear state), reactor OFFLINE (pure fusionReactorOnline()
// read — a reactor feast could never show the devotion gate,
// so staging skips those days; skips counted), devotion
// UNARMED on the prog lane (raw prog.feastSurge falsy — the
// harvest_table carried lane is NOT a skip: a carried surge
// is itself a gate decision, recorded by the diag recorder
// via the feast arg), feastPlan ok, affordability at the
// GAME floor (have >= cost — competent's 1.5 buffer is a
// policy choice, the floor is the game's), and a surplus
// floor borrowed from surplusFeast's documented rule
// (have - cost >= living mouths x 2000 kcal — the village
// can carry it). NOTABLY ABSENT, by design: the
// recentGives >= 1500 contribution rule and any cadence —
// both are competent-policy choices, not game gates, and
// both are what keep early feasts from happening.
//
// WHAT IT NEVER DOES: it never writes game state except
// through the game's own hostFeast() call (the same call a
// player makes); it never sets, clears, or fakes
// prog.feastSurge; it never touches the reactor; it never
// flips a default. An unarmed feast observed here is a
// feast the game itself hosted, refused by the game's own
// gate. If no staging feast ever reaches an unarmed
// reactor-free grant, that negative result with the code
// proof IS the deliverable — the layer must not manufacture
// a gate hit.
//
// DEFAULT OFF: DEVOTIONGATE unset or not '1' -> daily,
// upkeep and pending delegate to tableseat-nowait with no
// staging attempts and no ctx dg surface at all (the
// det-gate in scripts/test-devotiongate-a.js pins that:
// off daily/upkeep match plain tableseat-nowait on
// days/gameDays/ts, with no dg surface).
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

function layerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.DEVOTIONGATE) || '0') === '1'; } catch (e) { return false; }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function partOf(Game) { try { return (typeof Game.dayPart === 'number') ? Game.dayPart : null; } catch (e) { return null; } }

function skip(Game, ctx, reason) {
  try {
    ctx.dgSkips = ctx.dgSkips || {};
    ctx.dgSkips[reason] = (ctx.dgSkips[reason] || 0) + 1;
  } catch (e) { ctx.dgErr = String((e && e.message) || e).slice(0, 80); }
}

// attemptStage: one staging-feast attempt per day, at dusk only.
// Returns nothing; records attempts/skips/staged feasts on ctx.
function attemptStage(Game, ctx) {
  try {
    if (partOf(Game) !== 2) return; // dusk only — attempts are counted once per day
    const day = dayOf(Game);
    if (ctx._dgDay === day) return;
    ctx._dgDay = day;
    ctx.dgAttempts = (ctx.dgAttempts || 0) + 1;
    const s = (Game.state || {}).scholar || {};
    if (Game.over) { skip(Game, ctx, 'over'); return; }
    if (typeof Game.playerAtHaven !== 'function' || !Game.playerAtHaven()) { skip(Game, ctx, 'not-haven'); return; }
    if (s.feastDay === day) { skip(Game, ctx, 'already-feasted'); return; }
    // Definitely-live buff, by DIRECT read only (never feastedActive).
    try {
      const b = s.feastBuff || null;
      if (b && typeof b === 'object' && (b.untilDay || 0) > day) { skip(Game, ctx, 'buff-live'); return; }
    } catch (e) { ctx.dgErr = String((e && e.message) || e).slice(0, 80); }
    // Reactor offline required: a reactor feast could never show
    // the devotion gate (the reactor check runs first).
    try {
      if (Game.fusionReactorOnline && Game.fusionReactorOnline()) { skip(Game, ctx, 'reactor-online'); return; }
    } catch (e) { ctx.dgErr = String((e && e.message) || e).slice(0, 80); }
    // Prog lane unarmed required (the carried harvest_table lane
    // is not a skip — it is a gate decision, recorded separately).
    if (s.prog && s.prog.feastSurge) { skip(Game, ctx, 'armed-prog'); return; }
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) { ctx.dgErr = String((e && e.message) || e).slice(0, 80); }
    if (!plan || !plan.ok) { skip(Game, ctx, 'plan:' + String((plan && plan.why) || 'no-plan').slice(0, 40)); return; }
    if (!(plan.have >= plan.cost)) { skip(Game, ctx, 'affordability'); return; }
    // Surplus floor (surplusFeast's documented rule): after the
    // feast, a full day of village food remains.
    let mouths = 0;
    try {
      const vv = (Game.state || {}).village || {};
      for (const id of (vv.roster || [])) {
        if (!id || id === Game.villagerId) continue;
        let dead = false;
        try { const p = Game.getPerson(id); dead = !p || !!p.dead; } catch (e2) { dead = false; }
        if (!dead) mouths++;
      }
    } catch (e) { ctx.dgErr = String((e && e.message) || e).slice(0, 80); }
    if (mouths < 1) mouths = 1;
    if (plan.have - plan.cost < mouths * 2000) { skip(Game, ctx, 'surplus-floor'); return; }
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) { ctx.dgErr = String((e && e.message) || e).slice(0, 80); }
    if (rep && rep.ok) {
      ctx.dgStaged = (ctx.dgStaged || 0) + 1;
      ctx.dgStageDays = ctx.dgStageDays || [];
      if (ctx.dgStageDays.length < 400) ctx.dgStageDays.push(day);
    } else {
      skip(Game, ctx, 'host:' + String((rep && rep.why) || 'no-rep').slice(0, 40));
    }
  } catch (e) {
    try { ctx.dgErr = String((e && e.message) || e).slice(0, 80); } catch (e2) {}
  }
}

const devotiongate = Object.assign({}, tableseatNowait, {
  id: 'devotiongate',
  desc: 'tableseat-nowait + stage one unarmed reactor-free feast per affordable dusk (DEVOTIONGATE=1; default off = tableseat-nowait)',
  upkeep(Game, ctx) {
    if (!layerOn()) {
      return (typeof tableseatNowait.upkeep === 'function') ? tableseatNowait.upkeep(Game, ctx) : undefined;
    }
    attemptStage(Game, ctx);
    return (typeof tableseatNowait.upkeep === 'function') ? tableseatNowait.upkeep(Game, ctx) : undefined;
  },
});

module.exports = { devotiongate, layerOn, attemptStage };
