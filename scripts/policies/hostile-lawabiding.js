// policies/hostile-lawabiding.js — the cold-neighbor policy (journey-social r37, 2026-10-21).
//
// Built for the social-life leg's misjudged-path question: Steve's moots
// ruling (2026-10-16) says justice covers the wronged AND the misjudged,
// but r36's F1 probe fired 0 fabricated cases in 4x140d larceny-leaning
// runs — the false-accusation branch (betrayal.js:4457-4464) starves when
// enemies always have real ammunition ("enemies prefer real crimes").
// This policy builds a strong enemy with ZERO crimes: competent survival,
// but a cold neighbor — never donates, never comforts, never steals, never
// attacks. Hostility is social (the arc driver's hostile convos, a broken
// promise), never criminal.
//
// Deterministic: no unseeded randomness. Donation suppression is a clean
// wrapper (counted in ctx), not a ledger edit.
'use strict';
const { competent } = require('./competent');

function hostileDaily(Game, ctx) {
  // Suppress donations: a cold neighbor keeps their surplus. Wrap for the
  // duration of competent.daily, then restore. Counted, not hidden.
  const origDonate = Game.donateToPantry;
  let suppressed = 0;
  if (typeof origDonate === 'function') {
    Game.donateToPantry = function () { suppressed++; return 0; };
  }
  try {
    competent.daily(Game, ctx);
  } finally {
    if (typeof origDonate === 'function') Game.donateToPantry = origDonate;
  }
  if (suppressed) ctx.donationsSuppressed = (ctx.donationsSuppressed || 0) + suppressed;
  // Never comfort: competent only comforts through promise-keeping
  // (keepPromiseHeal) and its talk loop (COMPETENT_TALK, off in arc drivers).
  // The arc driver stashes the one deliberate broken promise, so no heal
  // promises are ever visible. Documented absence, not a code path.
  // Never steal, never attack: simply no larceny layer. Zero crimes.
  ctx.coldShoulder = (ctx.coldShoulder || 0) + 1;
}

const hostileLawabiding = Object.assign({}, competent, {
  id: 'hostile-lawabiding',
  desc: 'competent survival, zero crimes; cold neighbor: never donates, never comforts, never steals — hostility is social only',
  daily: hostileDaily,
});

module.exports = { hostileLawabiding };
