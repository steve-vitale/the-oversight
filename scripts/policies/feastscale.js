// feastscale — the r13 feast layer for the scale-push policies (longsim scale-wall r13, 2026-10-13).
//
// ONE policy-side feast layer, opt-in via FEASTSCALE_R13=1 (default OFF —
// unset means the wrapper delegates to its parent byte-identically; the
// proof test's RED phase pins that).
//
// The diagnosis (evidence/2026-10-13/sim-scale-wall-r13.md): the food-r7
// feast machinery in competent.js (eveningFeast, inherited by
// belongseek/leadcourt through competent.upkeep) NEVER FIRES on the
// courtship road. Its contribution gate — "the scholar must have given
// >=1500 kcal in the last 7 days" — reads only pantry donations
// (v.gives[vid]). A courtship scholar's own foraging barely covers their
// pack buffer (donateHaul keeps a full day's buffer; measured gives7 = 0 on
// 60/60 dusks on seed 11 belongseek) — their real contribution is the
// TRIBUTE/TEND they pay weekly from the same pantry, which the gate never
// sees. So: 0 feasts -> 0 grants -> 0 combat uses -> prog.feastSurgeUsed
// never marks -> the table's lesser-seat food-deed rung
// (sentimentTaught && feastSurgeUsed) and the Arc IV wave-4 deed gate can
// never fill. The chain is unreachable BY CONSTRUCTION for scale-push
// policies; r8 measured the gap, r13 found the gate.
//
// The layer:
//   1. trackTribute (daily): wraps Game.payTribute / Game.tendLink for the
//      parent's daily, records {day, kcal} from the engines' REAL return
//      values (actual pantry kcal paid, 0 on refusal). Restored in finally.
//   2. scaleFeast (upkeep, dusk): every food-r7 gate kept (dusk, at haven,
//      not exiled via feastPlan, one feast/day, armed cadence 7d / unarmed
//      14d, affordability have >= cost x 1.5, fusion-reactor ceiling) PLUS
//      the r13 contribution rule:
//        recentGives(7) + tributePaid(7) + tendPaid(7) >= 1500
//   3. Devotion + draw-facing inherited from competent: channelDevotion
//      (daily) arms the surge; feastFightRoad (upkeep) faces the feast's
//      scavenger draw while feasted — the fight that marks feastSurgeUsed.
//
// Design call (documented, Steve can overrule): on the courtship road the
// scholar's contribution to the commons IS the tribute/tend — real pantry
// outflow authorized for the village's standing (payTribute draws real
// pantry kcal via _removePantryKcal; tendLink sends a real 1,500 kcal). The
// food-r7 gate's intent ("don't spend the commons' food as a parasite") is
// preserved: a scholar who neither donates nor pays tribute/tends still
// never feasts. No free food: every kcal is really spent (tribute was
// really paid; the feast really draws the pantry; the 1.5x buffer holds).
// The takes/gives ledger is untouched (the r7 fair-share-rate blank stays
// open — lever-5 design question). No fight logic, no game balance changes.
'use strict';
const { belongseek } = require('./belongseek');
const { leadcourt } = require('./leadcourt');
const { recentGives } = require('./competent');

function layerOn() { return process.env.FEASTSCALE_R13 === '1'; }

// recentTribute: pantry kcal the scholar paid as tribute/tend in the last
// `days` days, from the ctx history trackTribute records (engine return
// values — actual paid kcal, never promised amounts).
function recentTribute(Game, ctx, days) {
  try {
    const day = (Game.state.scholar || {}).day || 0;
    const hist = ctx._tribHist || [];
    let t = 0;
    for (const e of hist) if (e && e.day > day - days) t += (e.kcal || 0);
    // AGE TRIM: keep the history bounded (30-day memory is plenty).
    if (ctx._tribHist && ctx._tribHist.length > 40) ctx._tribHist = ctx._tribHist.slice(-40);
    return t;
  } catch (e) { return 0; }
}

// trackTribute: wrap the two courtship outflow verbs for the parent's
// daily; record real paid kcal. Returns a restore function (finally-safe).
function trackTribute(Game, ctx) {
  const op = Game.payTribute, ot = Game.tendLink;
  const rec = (r) => {
    try {
      if (typeof r === 'number' && r > 0) {
        const day = (Game.state.scholar || {}).day || 0;
        ctx._tribHist = ctx._tribHist || [];
        ctx._tribHist.push({ day, kcal: Math.round(r) });
      }
    } catch (e) {}
  };
  if (typeof op === 'function') {
    Game.payTribute = function (...a) { const r = op.apply(this, a); rec(r); return r; };
  }
  if (typeof ot === 'function') {
    Game.tendLink = function (...a) { const r = ot.apply(this, a); rec(r); return r; };
  }
  return () => {
    if (typeof op === 'function') Game.payTribute = op;
    if (typeof ot === 'function') Game.tendLink = ot;
  };
}

// scaleFeast: the evening feast with the r13 contribution rule. All
// food-r7 gates kept; the contribution bar counts pantry donations PLUS
// tribute/tend paid (the courtship scholar's real contribution).
function scaleFeast(Game, ctx) {
  if (!layerOn()) return; // before/after harness gate
  try {
    if (Game.dayPart !== 2) return; // dusk — the buff rides into the night's fights
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (s.feastDay === day) return; // the game allows one feast a day
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const armed = !!((s.prog || {}).feastSurge);
    // FUSION REACTOR CEILING (Steve 2026-10-12): the grant is honestly
    // refused every time — a competent host doesn't waste the pantry.
    let armedForFeast = armed;
    try {
      if (armed && Game.fusionReactorOnline && Game.fusionReactorOnline()) armedForFeast = false;
    } catch (e) {}
    const cadence = armedForFeast ? 7 : 14;
    if (ctx._fsLastFeastDay && (day - ctx._fsLastFeastDay) < cadence) return;
    // R13 CONTRIBUTION RULE: pantry donations this week + tribute/tend paid
    // this week >= 1500 kcal (about one real haul's donation). The
    // courtship scholar's tribute IS their haul — real pantry outflow for
    // the village's standing. A scholar who contributed nothing still
    // never feasts.
    const contrib = recentGives(Game, ctx, 7) + recentTribute(Game, ctx, 7);
    if (contrib < 1500) return;
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) {}
    if (!plan || !plan.ok) return;
    if (plan.have < plan.cost * 1.5) return; // honest buffer — never feast into famine
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) {}
    if (rep && rep.ok) {
      ctx._fsLastFeastDay = day;
      ctx.fsFeasts = (ctx.fsFeasts || 0) + 1;
      if (armedForFeast) ctx.fsArmedFeasts = (ctx.fsArmedFeasts || 0) + 1;
    } else if (rep && /Nobody came/.test(rep.why || '')) {
      // the village is in no shape to feast — read the room, don't re-light
      // the fire tomorrow
      ctx._fsLastFeastDay = day;
    }
  } catch (e) {}
}

function withFeastScale(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    upkeep(Game, ctx) {
      base.upkeep(Game, ctx);
      scaleFeast(Game, ctx);
    },
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      const restore = trackTribute(Game, ctx);
      try { return base.daily(Game, ctx); }
      finally { restore(); }
    },
  });
}

const belongfeast = withFeastScale(
  belongseek, 'belongfeast',
  'belongseek + r13 feast layer (FEASTSCALE_R13=1): tribute/tend count as feast contribution'
);
const leadfeast = withFeastScale(
  leadcourt, 'leadfeast',
  'leadcourt + r13 feast layer (FEASTSCALE_R13=1): tribute/tend count as feast contribution'
);

module.exports = { belongfeast, leadfeast, withFeastScale, layerOn, recentTribute, trackTribute, scaleFeast };
