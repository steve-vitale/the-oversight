// upkeepgate — UPKEEPGATE lever variants of the feast courtship policies (sim-upkeepgate-b, 2026-10-20).
//
// The parent diagnostic (evidence/2026-10-20/sim-linkdissolve-b.md, landed
// f4098b567) confirmed the historical SURPLUSFEED trim -> post-court
// realm-dissolution path as a THRESHOLD effect mediated by the POLICY's own
// pantry gates, not the trim rate (leadcourt skipped tending below 20k
// pantry; belongseek skipped tribute below 2x the week's owed tribute).
// NOTE 2026-10-21 (Steve's own decision, docs/DECISIONS.md): the SURPLUSFEED
// trim governor is REMOVED from game.js — the lever is gone, not parked.
// The named lever here is the policy gate level. This module lowers the
// policy's own gates behind UPKEEPGATE=low.
//
// DEFAULT-OFF: UPKEEPGATE unset (or anything but 'low') => pure delegation to
// leadcourt/belongseek with the ORIGINAL gates (20k / 2x-owed) — the proof
// test's RED phase pins variant-unset trajectories byte-identical to the
// baseline policies. UPKEEPGATE=low => an additive second upkeep pass runs
// after the base policy's daily: links the base pass already attempted are
// skipped (attempted-tracking wrap, so the base's decisions — including its
// mourning/bare-pantry refusals — are never re-litigated), and links the base
// gate skipped get the lowered gate:
//
//   lead  : tending gate 20000 -> 8000  (tendLink costs 1,500 kcal; 8k keeps
//           ~5 weekly tendings of buffer while the 20k gate halted tending
//           for weeks on the lean post-court pantry — the 8801 shape)
//   belong: tribute gate 2.0x-owed -> 1.2x-owed (the arrears bar is
//           razor-thin — one missed week dissolves — so the policy keeps
//           paying through lean weeks with 20% headroom instead of 100%)
//
// POLICY-SIDE ONLY: zero src/js changes. The lowered gates ride the same
// engine verbs (tendLink/payTribute with their mourning/idempotency guards),
// the same _removePantryKcal costs, and — via feastscale's trackTribute wrap
// — the same feast-contribution accounting as the base policies.
//
// Engagement telemetry (ctx, read by the sweep driver):
//   ugTendCalls / ugTribCalls — variant-pass upkeep calls actually made
//   ugGateSkips              — link-days the base gate would skip but the
//                              lowered gate covers (the lever's footprint)
'use strict';
const { leadcourt } = require('./leadcourt');
const { belongseek } = require('./belongseek');
const { withFeastScale } = require('./feastscale');

function lowMode() { return process.env.UPKEEPGATE === 'low'; }

// Gate levels, tuned from code reading (hierarchy.js tendLink/payTribute +
// the parent diagnostic's threshold finding).
function leadGateKcal() { return lowMode() ? 8000 : 20000; }
function belongTributeMult() { return lowMode() ? 1.2 : 2.0; }

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function linksOf(Game) {
  try { return Game.hierarchyState() || []; } catch (e) { return []; }
}
function weekOf(Game) { try { return (Game._week ? Game._week() : 0); } catch (e) { return 0; } }

// Wrap an engine verb for the base daily's duration, recording which link ids
// the base pass attempted (so the second pass never re-litigates a base
// decision — e.g. a mourning refusal the base already narrated).
function trackAttempts(Game, verb) {
  const orig = Game[verb];
  const attempted = new Set();
  if (typeof orig === 'function') {
    Game[verb] = function (id) {
      try { attempted.add(id); } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
  return { attempted, restore() { if (typeof orig === 'function') Game[verb] = orig; } };
}

// LEAD second pass: tend Haven-primary subordinates the base gate skipped.
function lowGateTend(Game, ctx, attempted) {
  try {
    const week = weekOf(Game);
    const gate = leadGateKcal();
    for (const link of linksOf(Game)) {
      if (!link || link.status !== 'active') continue;
      if (attempted.has(link.id)) continue; // base already decided
      if (link.primary !== 'haven' || typeof Game.tendLink !== 'function') continue;
      if (link.tendedWeek === week) continue; // engine idempotency, mirrored
      const pk = pantryKcal(Game);
      if (pk <= 20000 && pk > gate) ctx.ugGateSkips = (ctx.ugGateSkips || 0) + 1;
      if (pk > gate) {
        try { Game.tendLink(link.id); } catch (e) {}
        ctx.ugTendCalls = (ctx.ugTendCalls || 0) + 1;
      }
    }
  } catch (e) {}
}

// BELONG second pass: pay tribute on the subordinate link the base gate skipped.
function lowGateTribute(Game, ctx, attempted) {
  try {
    const week = weekOf(Game);
    const mult = belongTributeMult();
    let link = null;
    for (const l of linksOf(Game)) {
      if (l && l.status === 'active' && l.subordinate === 'haven' && !l.kind) { link = l; break; }
    }
    if (!link || attempted.has(link.id)) return; // base already decided
    if (link.tributePaidWeek === week || typeof Game.payTribute !== 'function') return;
    const trib = link.tributeKcalPerWeek || 4000;
    const pk = pantryKcal(Game);
    if (pk <= trib * 2 && pk > trib * mult) ctx.ugGateSkips = (ctx.ugGateSkips || 0) + 1;
    if (pk > trib * mult) {
      try { Game.payTribute(link.id); } catch (e) {}
      ctx.ugTribCalls = (ctx.ugTribCalls || 0) + 1;
    }
  } catch (e) {}
}

const leadcourt_upkeepgate = Object.assign({}, leadcourt, {
  id: 'leadcourt-upkeepgate',
  desc: 'leadcourt + UPKEEPGATE lever (UPKEEPGATE=low): post-base low-gate tending pass, 20k->8k pantry gate',
  daily(Game, ctx) {
    if (!lowMode()) return leadcourt.daily(Game, ctx); // gate off: pure delegation
    const t = trackAttempts(Game, 'tendLink');
    try { leadcourt.daily(Game, ctx); }
    finally { t.restore(); }
    lowGateTend(Game, ctx, t.attempted);
  },
});

const belongseek_upkeepgate = Object.assign({}, belongseek, {
  id: 'belongseek-upkeepgate',
  desc: 'belongseek + UPKEEPGATE lever (UPKEEPGATE=low): post-base low-gate tribute pass, 2x->1.2x owed gate',
  daily(Game, ctx) {
    if (!lowMode()) return belongseek.daily(Game, ctx); // gate off: pure delegation
    const t = trackAttempts(Game, 'payTribute');
    try { belongseek.daily(Game, ctx); }
    finally { t.restore(); }
    lowGateTribute(Game, ctx, t.attempted);
  },
});

const leadfeast_upkeepgate = withFeastScale(
  leadcourt_upkeepgate, 'leadfeast-upkeepgate',
  'leadcourt-upkeepgate + r13 feast layer (FEASTSCALE_R13=1): lowered upkeep gates ride the same feast accounting'
);
const belongfeast_upkeepgate = withFeastScale(
  belongseek_upkeepgate, 'belongfeast-upkeepgate',
  'belongseek-upkeepgate + r13 feast layer (FEASTSCALE_R13=1): lowered upkeep gates ride the same feast accounting'
);

module.exports = {
  leadfeast_upkeepgate, belongfeast_upkeepgate,
  leadcourt_upkeepgate, belongseek_upkeepgate,
  lowMode, leadGateKcal, belongTributeMult,
};
