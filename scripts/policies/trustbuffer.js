// trustbuffer — the TRUSTBUFFER=1 depth lever (sim-trustbuffer, axis
// scale-onramp, run fleshout-20261023T2217Z; claims sim-findings.md #857).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TRUSTBUFFER unset or not '1'
// -> the daily delegates to linkform.daily / linkformBelong.daily through
// the identical code path (the det-gate in scripts/test-trustbuffer.js pins
// that). Does NOT modify scripts/policies/linkform.js — it REUSES
// linkformCourtship + linkformMode.
//
// THE FAILURE (sim-overcourt-restage CONFIRM-NO-GO,
// evidence/2026-10-23/sim-overcourt-restage.md): the succession channel
// defeats link-count redundancy. A funeral applies -8 to EVERY shaken link
// the same day, and weekly tending at the 20000 pantry gate holds every
// link in the 40-48 band, so one funeral routinely knocks 2-4 links below
// the 40 seasoned bar simultaneously (-136 same-day 4-link collapses).
// Redundancy assumed independent single-link failures; the channel is a
// correlated shock. The lever is DEPTH, not count: the sense control case
// (s68912, dip 170, 180d) survived the d176 all-links funeral because
// 100+ days of tending had the links at 60-95 trust. A 5-link realm of
// 40-trust links is five ways to die at once; a 3-link realm of 70-trust
// links is a realm.
//
// THE LEVER (ONE DELTA ONLY): TRUSTBUFFER=1 keeps the same courtship but
// tending targets the 50+ trust band instead of the 40-48 band. The buffer
// tend pass runs FIRST, then linkformCourtship verbatim — the engine's
// once-per-week dedup (tendedWeek) makes the shared loop skip links we
// already tended, so beat answers, defense calls, the 20000-gated tends
// for links at/above the band, and the courtship are literally shared code.
//
// Exact numbers (lever discipline):
//   TRUSTBUFFER_BAND = 58 — the 50+ band + one funeral of margin. The
//     funeral haircut is -8: a link at 58 lands at 50, still above the 40
//     seasoned bar. Grief coalesces (one haircut per grieving window), so
//     -8 is the max per window; two sequential funerals land at 42, still
//     >= 40.
//   pantry gate: the tend's own 1,500 kcal + HALF a day of food at the
//     measured burn rate (burnHistory mean, pop x 2000 fallback — the same
//     burn convention as Game.pantryDaysEstimate). The control's 20000 gate
//     skips tend weeks in the courtship season when the pantry is thin;
//     the buffer never skips a tend week for pantry while above this floor —
//     the village never tends into its last half-day of food. (Why not the
//     tribute 2-day floor: a 1,500-kcal tend is a different magnitude than
//     a 4,000-kcal tribute payment; the sweep's starvation guardrail is the
//     honest check.)
//   engine rules untouched: tendLink's once-per-week dedup, the 7-day
//     mourning refusal (refused weeks retry — tendedWeek is not set on
//     refusal), +8 trust per tend.
'use strict';
const { competent } = require('./competent');
const { linkform, linkformMode, linkformCourtship, linkformArmedFor } = require('./linkform');
const { linkformBelong, linkformBelongArmedFor } = require('./overcourtrestage');
const FS = require('./feastscale');
const TF = require('./tribfloor');
const WD = require('./windefer');
const SD = require('./seatdrive');
const AD = require('./armorydrive');
const AV = require('./armorvillage');

const TRUSTBUFFER_BAND = 58;
const TEND_KCAL = 1500;

function trustbufferMode() {
  try {
    const v = String((typeof process !== 'undefined' && process.env && process.env.TRUSTBUFFER) || '0');
    return v === '1' ? 1 : 0;
  } catch (e) { return 0; }
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

// trustbufferFloor: half a day of food at the measured burn rate — the
// survival floor the buffer tend never crosses. Same burn convention as
// Game.pantryDaysEstimate (rolling 7-day net from burnHistory, pop x 2000
// fallback pre-endDay). When the burn is <= 0 the pantry is holding or
// growing — no floor to defend.
function trustbufferFloor(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const hist = v.burnHistory || [];
    let burn = 0;
    if (hist.length) burn = hist.reduce((a, b) => a + b, 0) / hist.length;
    else burn = (((v.roster || []).length) || 12) * 2000;
    if (!(burn > 0)) return 0;
    return Math.round(burn / 2);
  } catch (e) { return 0; }
}

// trustbufferTend: THE ONE DELTA. Tend every active subordinate link below
// the buffer band whenever the pantry can afford the tend above the floor.
// Refused weeks (mourning) retry — the engine does not set tendedWeek on
// refusal. Successful tends are counted on ctx for the sweep's
// mechanism-engagement read (ctx.trustbufferTended).
function trustbufferTend(Game, ctx) {
  try {
    const week = (Game._week ? Game._week() : 0);
    const floor = trustbufferFloor(Game);
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      if (link.primary !== 'haven') continue;
      if (link.tendedWeek === week) continue;
      if ((link.trust || 0) >= TRUSTBUFFER_BAND) continue;
      if (pantryKcal(Game) <= floor + TEND_KCAL) continue;
      let paid = 0;
      try { paid = Game.tendLink(link.id) || 0; } catch (e) {}
      if (paid > 0) ctx.trustbufferTended = (ctx.trustbufferTended || 0) + 1;
    }
  } catch (e) {}
}

// trustbufferCourtship: the buffer tend pass first, then linkformCourtship
// verbatim (same courtship — answers, defense calls, the 20000-gated tend
// loop for links at/above the band, the LEAD propose block). The engine's
// tendedWeek dedup is what makes this one delta instead of two.
function trustbufferCourtship(Game, ctx, mode) {
  if (trustbufferMode() === 1) trustbufferTend(Game, ctx);
  linkformCourtship(Game, ctx, mode);
}

// trustbuffer: the lead-road shape. Gate off (TRUSTBUFFER unset/'0', or
// LINKFORM not 2) -> pure delegation to linkform.daily. Gate on ->
// competent.daily + trustbufferCourtship.
const trustbuffer = Object.assign({}, competent, {
  id: 'trustbuffer',
  desc: 'linkform + TRUSTBUFFER=1 depth lever (tend subordinate links into the 50+ trust band; off = linkform)',
  daily(Game, ctx) {
    const mode = linkformMode();
    if (mode === 0 || trustbufferMode() === 0) return linkform.daily(Game, ctx);
    competent.daily(Game, ctx);
    trustbufferCourtship(Game, ctx, mode);
  },
});

// trustbufferBelong: the belong-road analog. Gate off -> pure delegation to
// linkformBelong.daily (the overcourt-restage belong control leg). Gate on ->
// competent.daily + trustbufferCourtship (the road courtship is REPLACED by
// the buffered overcourt layer, exactly as the overcourt arm did).
const trustbufferBelong = Object.assign({}, competent, {
  id: 'trustbuffer-belong',
  desc: 'linkform-belong + TRUSTBUFFER=1 depth lever (off = linkform-belong)',
  daily(Game, ctx) {
    const mode = linkformMode();
    if (mode === 0 || trustbufferMode() === 0) return linkformBelong.daily(Game, ctx);
    competent.daily(Game, ctx);
    trustbufferCourtship(Game, ctx, mode);
  },
});

// trustbufferArmedFor / trustbufferBelongArmedFor: the census chain with the
// trustbuffer base swapped in — feastscale -> tribfloor -> windefer ->
// seatdrive -> armorydrive -> armorvillage, same order and env gates as
// AV.armedFor / linkformArmedFor, so the ONLY delta between a control leg
// and its armed leg is the TRUSTBUFFER=1 tending rule.
function trustbufferArmedFor() {
  const fs = FS.withFeastScale(trustbuffer, 'trustbuffer-feast',
    'trustbuffer + r13 feast layer (FEASTSCALE_R13=1): tribute/tend count as feast contribution');
  const tf = TF.withTribFloor(fs, 'trustbuffer-feast-tribfloor',
    'trustbuffer-feast + tribfloor (TRIBFLOOR=1): tribute payments never leave the pantry below the 2-day floor');
  const wd = WD.withWinDefer(tf, 'trustbuffer-feast-windefer',
    'trustbuffer-feast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const sd = SD.withSeatDrive(wd, 'trustbuffer-feast-seat',
    'trustbuffer-feast + seat drive (SEATDRIVE=0: pure delegation)');
  const ad = AD.withArmoryDrive(sd, 'trustbuffer-armorydrive',
    'trustbuffer-feast-seat + ARMORYDRIVE (ARMORYDRIVE=1): the non-seat long substrate\'s armory drive');
  return AV.withArmorVillage(ad, 'trustbuffer-armorvillage',
    'trustbuffer-armorydrive + ARMORVILLAGE=1 (armor structure)');
}

function trustbufferBelongArmedFor() {
  const fs = FS.withFeastScale(trustbufferBelong, 'trustbufferbelong-feast',
    'trustbuffer-belong + r13 feast layer (FEASTSCALE_R13=1)');
  const tf = TF.withTribFloor(fs, 'trustbufferbelong-feast-tribfloor',
    'trustbufferbelong-feast + tribfloor (TRIBFLOOR=1)');
  const wd = WD.withWinDefer(tf, 'trustbufferbelong-feast-windefer',
    'trustbufferbelong-feast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'trustbufferbelong-feast-seat',
    'trustbufferbelong-feast + seat drive (SEATDRIVE=0: pure delegation)');
  const ad = AD.withArmoryDrive(sd, 'trustbufferbelong-armorydrive',
    'trustbufferbelong-feast-seat + ARMORYDRIVE (ARMORYDRIVE=1)');
  return AV.withArmorVillage(ad, 'trustbufferbelong-armorvillage',
    'trustbufferbelong-armorydrive + ARMORVILLAGE=1 (armor structure)');
}

module.exports = {
  trustbuffer, trustbufferBelong, trustbufferMode, trustbufferTend,
  trustbufferCourtship, trustbufferArmedFor, trustbufferBelongArmedFor,
  TRUSTBUFFER_BAND, TEND_KCAL, trustbufferFloor,
};
