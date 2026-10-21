// repairrate — REPAIRRATE repair-rate variants of the feast courtship policies (sim-repairrate-b, 2026-10-21).
//
// The parent arm (sim-upkeepgate-b, NO-GO) showed the SURPLUSFEED post-court
// dissolution tradeoff is STRUCTURAL through the gate level: with grain
// flowing under lowered gates, succession-heavy trust decay (-8 haircuts,
// tribute shorts) still outruns the +8/week repair verb. The named next is
// the REPAIR RATE — not the pantry gate.
//
// This module pulls the POLICY-side repair-rate sub-lever behind
// REPAIRRATE=1 (default-OFF, zero src/js changes). The engine caps the weekly
// verbs (tendLink +8/week/link idempotent and mourning-choked; payTribute
// +3/week idempotent), and the base policies already tend/pay at max
// coverage — so the policy-side repair-rate headroom is the succession
// beat the base policies never answer:
//
//   Succession-beat gift answers ("raise tending strength"): on a speaker
//   death the engine stages a renegotiation beat on young links
//   (hierarchy.js successionCrisis). The base policies never call
//   answerRenegotiation, so every beat expires after 7 days to silence
//   (-6 trust, _resolveRenegotiation). This variant answers pending beats
//   with the gift (+8 trust, 1,500 kcal via Game.answerRenegotiation) —
//   a +14 trust swing vs the base per beat, additive repair exactly where
//   succession decay lands, beyond the +8/week tendLink cap. Beats are
//   per-succession, not weekly, so this is genuine repair-rate, not
//   re-timing. Young-link beats carry no mourning mark, so the +8 lands
//   ungagged through _trustGain.
//
// The sweep composes this with SUCCPOLITY=1 (the engine's landed,
// experimental, default-OFF haircut-shrink from sim-succpolity 2026-10-15:
// polity-membership bars read the link's pre-death standing for 14 days,
// so the realm doesn't dissolve in the funeral hour — "shrink the
// succession haircut / lower the seasoned bar" in its bar effect, zero
// kcal cost, zero src/js changes). Engagement is attributed separately
// (rrBeatGifts vs rrGraceWindows) so a GO can be decomposed.
//
// DEFAULT-OFF: REPAIRRATE unset (or anything but '1') => pure delegation to
// leadcourt/belongseek with the ORIGINAL gates and unanswered beats — the
// proof test's RED phase pins variant-unset trajectories byte-identical to
// the baseline policies. SUCCPOLITY is a separate env gate owned by the
// engine; this module never touches it.
//
// Engagement telemetry (ctx, read by the sweep driver):
//   rrBeatGifts — succession beats answered with the gift (the lever fired)
//   rrBeatSkips — beats seen but pantry too lean to answer (>1500 floor)
'use strict';
const { leadcourt } = require('./leadcourt');
const { belongseek } = require('./belongseek');
const { withFeastScale } = require('./feastscale');

function repairMode() { return process.env.REPAIRRATE === '1'; }

// Pantry floor for answering a beat: the gift costs 1,500 kcal; never answer
// from a near-empty pantry (survival-guardrail kindness). Beats live 7 days,
// so a lean week usually still finds a fat day; beats that lapse are counted
// by the analyzer from the link histories.
function beatPantryFloorKcal() { return 3000; }

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function linksOf(Game) {
  try { return Game.hierarchyState() || []; } catch (e) { return []; }
}

// Repair pass: answer pending succession renegotiation beats with the gift.
// The base policies never answer beats; unanswered beats expire to silence
// (-6). Each answered gift is +8 trust for 1,500 kcal — a +14 swing vs the
// base per beat. The engine clears pendingRenegotiation on answer, so beats
// are naturally once-each; no attempt-tracking needed.
function answerSuccessionBeats(Game, ctx) {
  try {
    if (typeof Game.answerRenegotiation !== 'function') return;
    const pk = pantryKcal(Game);
    for (const link of linksOf(Game)) {
      if (!link || link.status !== 'active' || !link.pendingRenegotiation) continue;
      if (pk > beatPantryFloorKcal()) {
        try { Game.answerRenegotiation(link.id, 'gift'); } catch (e) {}
        ctx.rrBeatGifts = (ctx.rrBeatGifts || 0) + 1;
      } else {
        ctx.rrBeatSkips = (ctx.rrBeatSkips || 0) + 1;
      }
    }
  } catch (e) {}
}

const leadcourt_repairrate = Object.assign({}, leadcourt, {
  id: 'leadcourt-repairrate',
  desc: 'leadcourt + REPAIRRATE lever (REPAIRRATE=1): succession-beat gift answers (+8 vs -6 silence)',
  daily(Game, ctx) {
    leadcourt.daily(Game, ctx); // base pass first, always
    if (!repairMode()) return;  // lever off: pure delegation, beats lapse as in the base
    answerSuccessionBeats(Game, ctx);
  },
});

const belongseek_repairrate = Object.assign({}, belongseek, {
  id: 'belongseek-repairrate',
  desc: 'belongseek + REPAIRRATE lever (REPAIRRATE=1): succession-beat gift answers (+8 vs -6 silence)',
  daily(Game, ctx) {
    belongseek.daily(Game, ctx); // base pass first, always
    if (!repairMode()) return;  // lever off: pure delegation, beats lapse as in the base
    answerSuccessionBeats(Game, ctx);
  },
});

const leadfeast_repairrate = withFeastScale(
  leadcourt_repairrate, 'leadfeast-repairrate',
  'leadcourt-repairrate + r13 feast layer (FEASTSCALE_R13=1): beat-gift answers ride the same feast accounting'
);
const belongfeast_repairrate = withFeastScale(
  belongseek_repairrate, 'belongfeast-repairrate',
  'belongseek-repairrate + r13 feast layer (FEASTSCALE_R13=1): beat-gift answers ride the same feast accounting'
);

module.exports = {
  leadfeast_repairrate, belongfeast_repairrate,
  leadcourt_repairrate, belongseek_repairrate,
  repairMode, beatPantryFloorKcal,
};
