// feastdraww4 — closecommit + feast-cadence layer for wave-4 draws (Loop A 20261103T0518Z, axis scale-onramp).
//
// THE KNOB (one, policy-side only, zero src/js changes): the ARMED feast
// cadence. The baseline stack feasts armed at most every 7 days
// (competent.js eveningFeast AND feastscale.js scaleFeast both carry a 7d
// armed cadence), but the engine's draw economics are per FRESH grant, not
// per feast: grantFeastBuff() calls drawFeastScavenger() ONLY on a fresh
// grant (never on a refresh — feastBuff.js), and the buff window is only
// 2 dawns (feast-surge.json durationNights 2). A feast at dusk on day D
// buys the night plus the next day; the buff is gone by dawn D+2. The
// baseline's 7d cadence therefore leaves ~5 idle days per cycle in which
// no fresh grant — and therefore no draw — can happen, even when the
// devotion is re-armed and the pantry can carry a feast. The draw chance
// itself is already saturated (feast-surge.json feastDraw.chance = 1.0),
// so there is no per-feast draw rate left to raise; the only policy-side
// rate that moves draws is how often a FRESH armed grant happens.
//
// This layer hosts an armed feast at the FIRST dusk after the buff has
// expired (armed + not currently feasted), keeping every baseline gate
// that is not the cadence itself: dusk, at the haven, one feast per day,
// the r13 contribution rule (pantry donations + tribute/tend paid in the
// last 7 days >= 1500 kcal), the honest affordability buffer
// (plan.have >= plan.cost x 1.5), and the fusion-reactor ceiling (an
// online reactor crowds out the fire, so no feast is wasted on it).
// Every gate except cadence is inherited verbatim from the baseline
// layers; the layer changes NOTHING about fights, travel, sorties,
// asking, or deed-seeking, and it consumes no RNG.
//
// Why this should move wave-4 deeds, when it can: a fresh armed grant
// casts via castMonster() (feastBuff.js drawFeastScavenger), which draws
// from the unlocked-wave pool at the spawn ratios (60% newest wave once
// wave 4 is unlocked — game.js spawnWaveTarget). After wave-4 unlock,
// roughly 6 in 10 draws are Mirror Draft monsters, and the baseline's
// feastFightRoad already faces a pending draw while feasted. More fresh
// grants per unit time therefore means more wave-4 draws faced, without
// any new fight, travel, or asking behavior. If the devotion re-arming
// time (not the cadence) is the real bottleneck, this layer will be
// inert — the pilot's feast/draw counts will show that, and the arm
// dies on its numbers.
//
// Perception-law note: the layer decides ONLY from the scholar's own
// state (day, devotion arming, buff state), the haven the scholar is
// standing in, the feast plan the game itself offers, and the draw the
// game itself announces at the scholar's own fire (feastDrawPending —
// the beast circling the edge of the light, shown on the phone panel).
// It never reads any creature list, any person's whereabouts, or any
// tile the scholar is not standing on. See the proof test's forbidden-token leg.
'use strict';
const { recentGives } = require('./competent');
const { recentTribute } = require('./feastscale');

function freshFeast(Game, ctx) {
  try {
    if (Game.dayPart !== 2) return; // dusk — the buff rides into the night's fights
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (Game.over) return;
    if (s.feastDay === day) return; // the game allows one feast a day
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const armed = !!((s.prog || {}).feastSurge);
    if (!armed) return; // unarmed feasts draw nothing — the social engine is the baseline's job
    try {
      if (Game.fusionReactorOnline && Game.fusionReactorOnline()) return; // reactor ceiling
    } catch (e) {}
    // THE CADENCE: only when the buff is NOT live. A feast while feasted
    // only refreshes (no fresh grant, no draw), so feasting sooner than
    // expiry buys nothing this layer is for. First dusk after expiry is
    // the earliest a fresh grant — and a draw — can happen.
    try {
      if (Game.feastedActive && Game.feastedActive()) return;
    } catch (e) {}
    // Nobody-came room-reading: if the village was in no shape to feast
    // recently, do not re-light the fire every night.
    if (ctx._fdEmptyDay && (day - ctx._fdEmptyDay) < 7) return;
    // R13 CONTRIBUTION RULE, verbatim: donations + tribute/tend >= 1500.
    const contrib = recentGives(Game, ctx, 7) + recentTribute(Game, ctx, 7);
    if (contrib < 1500) return;
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) {}
    if (!plan || !plan.ok) return;
    if (plan.have < plan.cost * 1.5) return; // honest buffer — never feast into famine
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) {}
    if (rep && rep.ok) {
      ctx.fdFeasts = (ctx.fdFeasts || 0) + 1;
      // Record the draw this fresh grant left circling the firelight, so
      // the driver can attribute the fight it becomes (fight identity,
      // never a day join). feastDrawPending is a read of the live draw
      // the game just announced; it cleans nothing when the draw is live.
      try {
        const d = (Game.feastDrawPending && Game.feastDrawPending()) || null;
        if (d && d.monsterId) {
          ctx.fdDraws = ctx.fdDraws || [];
          ctx.fdDraws.push({ day, monsterId: d.monsterId });
        }
      } catch (e) {}
    } else if (rep && /Nobody came/.test(rep.why || '')) {
      ctx._fdEmptyDay = day;
    }
  } catch (e) {}
}

function withFeastDrawW4(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    upkeep(Game, ctx) {
      base.upkeep(Game, ctx);
      freshFeast(Game, ctx);
    },
  });
}

module.exports = { withFeastDrawW4, freshFeast };
