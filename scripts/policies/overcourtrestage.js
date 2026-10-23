// overcourtrestage — belong-road analog of the linkform overcourt layer
// (sim-overcourt-restage, axis scale-onramp, run fleshout-20261023T2015Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Does NOT modify scripts/policies/linkform.js
// (on master, env-gated default-off); it REUSES linkform's LINKFORM-gated
// courtship (linkformCourtship + linkformMode) over a belong-road base.
//
// WHY: the confirm sweeps LINKFORM=2 under BOTH leadfeast and belongfeast
// substrates, ONE DELTA ONLY per (seed, policy): control = AV.armedFor(base)
// with LINKFORM unset; armed = the same substrate chain with the LINKFORM=2
// overcourt courtship. The pilot's proven lead-armed shape is
// LF.linkformArmedFor() (linkform = competent + linkformCourtship, i.e. the
// base's road courtship REPLACED by the overcourt layer). This file builds
// the exact same composition over belongseek so the belong-armed arm is the
// same lever, not a different one: mode 2 = competent + linkformCourtship
// (court to 5 subordinate links, tend all weekly), mode 0 = pure
// belongseek delegation.
//
// Exact numbers (lever discipline, unchanged from the pilot): propose
// tribute 4000 kcal/week; tend 1500 kcal -> +8 trust (engine); pantry gates
// unchanged (propose >12000, tend >20000); propose from day 25, 1/day,
// sub-cap 5 at mode 2.
'use strict';
const { competent } = require('./competent');
const { belongseek } = require('./belongseek');
const { linkformCourtship, linkformMode } = require('./linkform');
const FS = require('./feastscale');
const TF = require('./tribfloor');
const WD = require('./windefer');
const SD = require('./seatdrive');
const AD = require('./armorydrive');
const AV = require('./armorvillage');

// linkformBelong: the belong-road analog of linkform (which is lead-road
// only). Mirrors linkform.daily's shape exactly: gate off (mode 0) -> pure
// delegation to the road policy; gate on (mode 2) -> competent.daily +
// linkformCourtship (the road courtship is REPLACED by the overcourt layer,
// same as the pilot's proven armed shape).
const linkformBelong = Object.assign({}, competent, {
  id: 'linkform-belong',
  desc: 'belongseek + LINKFORM-gated overcourt courtship (mode 2: court to 5 subordinate links, tend all weekly; mode 0 = belongseek)',
  daily(Game, ctx) {
    const mode = linkformMode();
    if (mode === 0) return belongseek.daily(Game, ctx); // gate off: pure delegation
    competent.daily(Game, ctx);
    linkformCourtship(Game, ctx, mode);
  },
});

// linkformBelongArmedFor: the census chain with the linkform-belong base
// swapped in — feastscale -> tribfloor -> windefer -> seatdrive ->
// armorydrive -> armorvillage, same order and env gates as
// AV.armedFor('belongfeast'), so the ONLY delta between the belongfeast
// control leg and the belong-armed leg is the LINKFORM=2 courtship.
function linkformBelongArmedFor() {
  const fs = FS.withFeastScale(linkformBelong, 'linkformbelong-feast',
    'linkform-belong + r13 feast layer (FEASTSCALE_R13=1): tribute/tend count as feast contribution');
  const tf = TF.withTribFloor(fs, 'linkformbelong-feast-tribfloor',
    'linkformbelong-feast + tribfloor (TRIBFLOOR=1): tribute payments never leave the pantry below the 2-day floor');
  const wd = WD.withWinDefer(tf, 'linkformbelong-feast-windefer',
    'linkformbelong-feast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const sd = SD.withSeatDrive(wd, 'linkformbelong-feast-seat',
    'linkformbelong-feast + seat drive (SEATDRIVE=0: pure delegation)');
  const ad = AD.withArmoryDrive(sd, 'linkformbelong-armorydrive',
    'linkformbelong-feast-seat + ARMORYDRIVE (ARMORYDRIVE=1): the non-seat long substrate\'s armory drive');
  return AV.withArmorVillage(ad, 'linkformbelong-armorvillage',
    'linkformbelong-armorydrive + ARMORVILLAGE=1 (armor structure)');
}

module.exports = { linkformBelong, linkformBelongArmedFor };
