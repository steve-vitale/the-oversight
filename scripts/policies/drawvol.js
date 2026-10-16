#!/usr/bin/env node
// scripts/policies/drawvol.js — DRAWDOWN-VOLUME CAP (sim-drawvol-b,
// 2026-10-16, food-economy axis — the sim-floorday3-b named next).
//
// THE FINDING (sim-floorday3-b, 2026-10-16): the drawdown floor (2-day vs
// 3-day) is provably near-vacuous given the fd>4 overstock trigger — 174
// feast events, zero floor contacts. The remaining #200 suspect is the
// uncapped COMBINED daily drawdown outflow on thin-overstock pantries: the
// aid give (1,500) + the feasts (~2-4k) + the parent's weekly tribute/tend
// discipline all firing while fresh-days hovers just above 4. On a
// replenished marginal pantry the village eats ~popx2000/day anyway;
// discretionary drawdown is the marginal drain that tips a balanced pantry
// into decline.
//
// THE LEVER: a daily drawdown-outflow budget (CAP kcal), live only when
// fresh-days < 6. Two outflow classes:
//   OBLIGATED (observed, never held): Game.payTribute / Game.tendLink —
//     the courtship bargain and demand answers. Tracked via the
//     feastscale.js trackTribute pattern (engine return values = actual
//     pantry kcal paid). Obligated outflow consumes the day's budget
//     before discretionary.
//   DISCRETIONARY (held past the cap): the aid give (Game.answerAidBeg —
//     the verb competent's answerAidBeats uses) and the feasts
//     (Game.hostFeast — the verb competent's eveningFeast and feastscale's
//     scaleFeast use). When fresh-days < 6 and the day's cumulative
//     drawdown outflow + the candidacy's cost would exceed the cap, the
//     candidacy is HELD: counted (drawvolHeld, _dvHoldEvents) and narrated
//     as prudence — voice-only, deterministic, no RNG (the tableWaitTalk
//     precedent: say() + computed numbers only).
//
// This is a VOLUME DIAL, not a kill switch: the verbs stay alive — a held
// feast retries another dusk, a held beg is refused aloud with the engine's
// honest consequences (the refusal is real: trust moves, the ledger
// remembers). Guardrail: armed aid+feast count >= 50% of control.
//
// DRAWDVOL=1 gate, default OFF — unset delegates byte-identically to the
// parent (pinned by the proof's RED phase). DRAWDVOL_CAP overrides the cap
// in kcal (the proof uses it to force engagement on fixtures).
//
// CAP CHOICE: derived from the substrate's own outflow distribution —
// scripts/measure-drawvol-20261016.js on the sweep substrate; the numbers
// and the choice are documented in evidence/2026-10-16/sim-drawvol-b.md.
// Do not pick from taste.
//
// COMPOSITION: withDrawVol wraps the FEASTSCALE_R13=1 substrate objects
// (belongfeast/leadfeast). Control and armed share the SAME objects —
// DRAWDVOL is the only switch (the seatdrive convention).
//
// FILE DISCIPLINE: this file is the ONLY game-adjacent change. Zero
// src/js, zero edits to existing policy files — wrap, don't edit.
//
// Policy-side only.
'use strict';
const { belongfeast, leadfeast } = require('./feastscale');

function layerOn() { return process.env.DRAWDVOL === '1'; }

// Fresh-days band: the prudence regime. Above it the cap never binds
// (pinned by the proof: fd>=6 + tiny cap -> verbs fire, zero holds).
const FD_BAND = 6;

// CAP CHOICE (measured 2026-10-16, scripts/measure-drawvol-20261016.js,
// 8 runs: 4 fresh seeds x {belongfeast,leadfeast}, 180d, control substrate):
// daily TOTAL drawdown outflow on fd<6 days: n=265, p50=p60=p75=p90=0,
// max=16,567; only 22/265 thin days had ANY outflow (obligated 94k, aid 2k,
// feast 26k). Simulated holds in harness order (feast@upkeep -> tribute ->
// aid@daily): cap=2500 -> 3 feast + 1 aid holds per 8 runs (~16/32,
// 2x the engagement bar); cap=3000 -> 2+1 (~12/32); cap>=4000 -> 0 holds
// (invisible). 2500 binds on the margin of actual discretionary events
// (~31% of thin-day discretionary firings held, ~69% of verbs alive —
// the volume dial, not a kill switch). Full derivation + numbers in
// evidence/2026-10-16/sim-drawvol-b.md. Do not pick from taste.
const DEFAULT_CAP_KCAL = 2500;

function capKcal() {
  try {
    const e = parseInt(process.env.DRAWDVOL_CAP || '', 10);
    if (Number.isFinite(e) && e > 0) return e;
  } catch (err) {}
  return DEFAULT_CAP_KCAL;
}

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function freshDaysOf(Game) {
  try { return Game.pantryFreshDays ? Game.pantryFreshDays() : -1; }
  catch (e) { return -1; }
}
function dayTotal(b) { return (b.obligated || 0) + (b.discretionary || 0); }

// Per-engine-day bucket. The harness calls upkeep x3 then daily then
// sleep() under one scholar.day, so one bucket covers the whole day.
function dayBucket(Game, ctx) {
  const day = gday(Game);
  if (!ctx._dv || ctx._dv.day !== day) {
    ctx._dv = {
      day, fdStart: +freshDaysOf(Game).toFixed(2),
      obligated: 0, discretionary: 0, holds: 0,
    };
  }
  return ctx._dv;
}

function recordHold(Game, ctx, kind, cost, fdNow) {
  const b = dayBucket(Game, ctx);
  b.holds += 1;
  ctx.drawvolHeld = (ctx.drawvolHeld || 0) + 1;
  ctx._dvHoldEvents = ctx._dvHoldEvents || [];
  ctx._dvHoldEvents.push({
    day: b.day, kind, cost: Math.round(cost) || 0,
    fd: +fdNow.toFixed(2), dayTotalBefore: dayTotal(b),
  });
}

// prudenceBeat: voice-only, deterministic, no RNG (tableWaitTalk precedent).
// The hold already happened — this is the village deciding aloud. The
// pantry truth is village-public (no knowledge gate needed); the begging
// face comes from the engine's own pendingAidBeg descriptor.
function prudenceBeat(Game, kind, fdNow, cost, spentToday, face) {
  try {
    const fd = Math.max(0, Math.round(fdNow));
    const fdWords = `~${fd} day${fd === 1 ? '' : 's'} of fresh`;
    const spent = Math.round(spentToday).toLocaleString();
    if (kind === 'feast') {
      Game.say(`🍖 The feast fire is laid — but the shelves hold only ${fdWords}, and ${spent} kcal has already left the pantry today. "Not tonight," the elders decide. "The fire waits for a fatter day."`);
    } else {
      const who = face ? String(face) : 'the beggar';
      Game.say(`🙏 ${who} begs at the treeline — but the shelves hold only ${fdWords}, and ${spent} kcal has already left the pantry today. The village turns them away gently: "Come back when the bins are full."`);
    }
  } catch (e) {}
}

// The hold decision: fresh-days < 6 AND the candidacy would push the day's
// cumulative drawdown outflow past the cap.
function shouldHold(Game, ctx, cost) {
  if (!layerOn()) return false;
  const fd = freshDaysOf(Game);
  if (!(fd >= 0) || fd >= FD_BAND) return false;
  const b = dayBucket(Game, ctx);
  return dayTotal(b) + cost > capKcal();
}

// Install the outflow wraps for one policy call (daily or upkeep).
// Obligated verbs are observed (engine returns = actuals); discretionary
// verbs are held past the cap. Restored in finally (trackTribute pattern).
function dvInstall(Game, ctx) {
  const oPT = Game.payTribute, oTL = Game.tendLink;
  const oBeg = Game.answerAidBeg, oFeast = Game.hostFeast;
  const rec = (n, kcal) => {
    try { if (kcal > 0) dayBucket(Game, ctx)[n] += Math.round(kcal); } catch (e) {}
  };
  if (typeof oPT === 'function') {
    Game.payTribute = function () {
      const r = oPT.apply(this, arguments);
      if (typeof r === 'number' && r > 0) rec('obligated', r);
      return r;
    };
  }
  if (typeof oTL === 'function') {
    Game.tendLink = function () {
      const r = oTL.apply(this, arguments);
      if (typeof r === 'number' && r > 0) rec('obligated', r);
      return r;
    };
  }
  if (typeof oBeg === 'function') {
    Game.answerAidBeg = function (how) {
      // Capture BEFORE the call: the engine clears pendingAidBeg.
      const ask = begAsk(Game);
      if (how === 'give' && shouldHold(Game, ctx, ask)) {
        const b = dayBucket(Game, ctx);
        let face = null;
        try { face = ((Game.state || {}).pendingAidBeg || {}).face || null; } catch (e) {}
        recordHold(Game, ctx, 'aid', ask, freshDaysOf(Game));
        prudenceBeat(Game, 'aid', freshDaysOf(Game), ask, dayTotal(b), face);
        // The honest path: refuse aloud with the engine's real
        // consequences (trust moves, the ledger remembers) — never a
        // silent drop, never a lingering beg.
        return oBeg.call(this, 'refuse');
      }
      const r = oBeg.apply(this, arguments);
      if (how === 'give' && r === 'gave') rec('discretionary', ask);
      return r;
    };
  }
  if (typeof oFeast === 'function') {
    Game.hostFeast = function () {
      let cost = 0;
      try {
        const p = Game.feastPlan ? Game.feastPlan() : null;
        if (p && p.ok) cost = Math.round(p.cost) || 0;
      } catch (e) {}
      if (cost > 0 && shouldHold(Game, ctx, cost)) {
        const b = dayBucket(Game, ctx);
        recordHold(Game, ctx, 'feast', cost, freshDaysOf(Game));
        prudenceBeat(Game, 'feast', freshDaysOf(Game), cost, dayTotal(b), null);
        return { ok: false, why: `The day's drawdown budget is spent (${Math.round(dayTotal(b)).toLocaleString()} kcal already out) and the shelves hold ~${Math.max(0, Math.round(freshDaysOf(Game)))} days of fresh — the fire waits for a fatter day.` };
      }
      const r = oFeast.apply(this, arguments);
      if (r && r.ok && cost > 0) rec('discretionary', cost);
      return r;
    };
  }
  return () => {
    if (typeof oPT === 'function') Game.payTribute = oPT;
    if (typeof oTL === 'function') Game.tendLink = oTL;
    if (typeof oBeg === 'function') Game.answerAidBeg = oBeg;
    if (typeof oFeast === 'function') Game.hostFeast = oFeast;
  };
}

function begAsk(Game) {
  try { return ((Game.state || {}).pendingAidBeg || {}).amount || 1500; }
  catch (e) { return 1500; }
}

function dvSetup(Game, ctx) {
  ctx._dv = null;
  ctx._dvHoldEvents = [];
  ctx.drawvolHeld = 0;
}

function withDrawVol(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      if (layerOn()) dvSetup(Game, ctx);
      return base.setup ? base.setup(Game, ctx) : undefined;
    },
    daily(Game, ctx) {
      if (!layerOn()) return base.daily ? base.daily(Game, ctx) : undefined;
      const restore = dvInstall(Game, ctx);
      try { return base.daily ? base.daily(Game, ctx) : undefined; }
      finally { restore(); }
    },
    upkeep(Game, ctx) {
      if (!layerOn()) return base.upkeep ? base.upkeep(Game, ctx) : undefined;
      const restore = dvInstall(Game, ctx);
      try { return base.upkeep ? base.upkeep(Game, ctx) : undefined; }
      finally { restore(); }
    },
  });
}

// Control and armed share the SAME objects — DRAWDVOL is the only switch
// (the seatdrive convention). Ids stay the substrate's ('belongfeast',
// 'leadfeast') so per-seed JSONs line up with the substrate's own runs.
const drawvolbelong = withDrawVol(
  belongfeast, 'belongfeast',
  'belongfeast + drawdown-volume cap (DRAWDVOL=1): daily outflow budget when fd<6, discretionary aid/feast holds'
);
const drawvollead = withDrawVol(
  leadfeast, 'leadfeast',
  'leadfeast + drawdown-volume cap (DRAWDVOL=1): daily outflow budget when fd<6, discretionary aid/feast holds'
);

module.exports = {
  layerOn, capKcal, FD_BAND, DEFAULT_CAP_KCAL,
  withDrawVol, drawvolbelong, drawvollead,
  dayBucket, shouldHold,
};
