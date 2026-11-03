// policies/sortie.js — lingerer-sortie answer layer (Loop A 20261103T0203Z,
// arm sim-sortie-a, axis scale-onramp). POLICY ONLY: zero src/js changes.
//
// Question: the 1915Z diagnostic found a wave-4 visitor lingering at the
// treeline for 6 nights, each night offering "or send a sortie" — never
// taken, because no sim policy ever answers that offer. This layer
// answers it, and only it: no seeking, no escalation, no feast tuning.
//
// PERCEPTION LAW (load-bearing, Steve 2026-10-28): villagers — and the
// player — know who's around only through their own senses. This layer
// therefore decides ONLY from:
//   1. The ANNOUNCED offer: the nightly gorge line the engine speaks to
//      the player ("... gorges at the treeline — ... or send a sortie").
//      It is captured by a say-tap installed in setup (the same pattern
//      as the lair tap in titanroute: wrap the spoken line, record only
//      the matching line, pass everything else through untouched).
//      The recorded offer carries the announcement day and the name as
//      spoken in the line. No id is ever looked up from the name.
//   2. The village's OWN deed record (deedState().wavesFaced): how many
//      distinct wave-4 / wave-5 kinds the village itself has fought.
//      Reading its own fight history is not reading a roster.
//   3. Its own day count and game-over / fight-open guards.
// It never consults any engine channel that reports where anything is,
// who is around, or what is waiting anywhere. It cannot walk toward a
// monster because it never knows one is there; it can only answer an
// offer that was spoken aloud, the way a phone player presses the
// button on the beats panel after reading the same line.
//
// BEHAVIOR: in daily(), if an unanswered offer exists (announced on or
// before today), the full-seat deed bars are unmet (distinct wave-4
// faced < 3 OR distinct wave-5 faced < 2), the game is not over, no
// turn-based fight is open, and no sortie was attempted today, then
// answer the offer with 'sortie' exactly once and record the attempt
// (day, offered name as spoken, verb return fields, or the error).
// One attempt per offer: an answered offer is never re-answered; a
// fresh gorge line on a later night is a fresh offer and may be
// answered again while the bars are still unmet. The sortie itself is
// the engine's own played fight (mustered fighters, real rations,
// villagers can die) — this layer changes no fight behavior.
// No random call is made anywhere in this file: offer order is
// announcement order and the answer rule is deterministic, so
// arm/baseline trajectories differ ONLY through the sortie answers
// and their consequences.
'use strict';

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Distinct wave-4 / wave-5 kinds fought, from the village's OWN deed
// record. Returns null when the record is unreadable (fail closed:
// do not answer on an unread record).
function facedCounts(Game) {
  try {
    const d = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (d && d.wavesFaced) || null;
    if (!faced || typeof faced !== 'object') return null;
    let w4 = 0, w5 = 0;
    for (const mid of Object.keys(faced)) {
      if ((faced[mid] | 0) === 4) w4++;
      else if ((faced[mid] | 0) === 5) w5++;
    }
    return { w4: w4, w5: w5 };
  } catch (e) { return null; }
}

// The nightly gorge announcement, and nothing else. Both halves must be
// present in the same spoken line: the gorge (the price) and the offer.
function isGorgeOffer(line) {
  if (typeof line !== 'string') return false;
  return line.indexOf('gorges at the treeline') !== -1 &&
    line.indexOf('send a sortie') !== -1;
}

function spokenName(line) {
  try {
    const m = /lingering (.+?) gorges at the treeline/.exec(line);
    if (m && m[1]) return String(m[1]).slice(0, 80);
  } catch (e) {}
  return '';
}

function sortieDaily(Game, ctx) {
  try {
    if (Game.over || Game.tbfight) return;
    const st = ctx.sortie || (ctx.sortie = { offers: [], attempts: [], lastAttemptDay: -1 });
    const day = gday(Game);
    if (st.lastAttemptDay === day) return; // at most one answer per day
    let offer = null;
    for (const o of st.offers) {
      if (!o.answered && (o.day || 0) <= day) { offer = o; break; }
    }
    if (!offer) return;
    const counts = facedCounts(Game);
    if (!counts) return; // unread deed record: fail closed
    if (counts.w4 >= 3 && counts.w5 >= 2) return; // bars met: no sortie needed
    if (typeof Game.answerLingerer !== 'function') {
      st.attempts.push({ day: day, offerDay: offer.day, name: offer.name,
        ok: false, why: 'answer-verb-missing' });
      offer.answered = true;
      st.lastAttemptDay = day;
      return;
    }
    let ret = null, err = null;
    try { ret = Game.answerLingerer('sortie'); } catch (e) { err = String(e && e.message || e).slice(0, 120); }
    offer.answered = true;
    st.lastAttemptDay = day;
    const rec = { day: day, offerDay: offer.day, name: offer.name,
      w4FacedAtAnswer: counts.w4, w5FacedAtAnswer: counts.w5 };
    if (err) { rec.ok = false; rec.why = 'threw'; rec.error = err; }
    else if (ret && typeof ret === 'object') {
      rec.ok = !!ret.ok; rec.why = ret.why || null;
      rec.cleared = (ret.cleared | 0); rec.broke = !!ret.broke;
      rec.remaining = (ret.remaining | 0); rec.paid = (ret.paid | 0);
    } else if (typeof ret === 'string') { rec.ok = false; rec.why = ret; }
    else { rec.ok = false; rec.why = 'null-return'; }
    st.attempts.push(rec);
  } catch (e) {}
}

function withSortie(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'sortie',
    desc: desc || 'sortie: answer announced lingerer-sortie offers while the full-seat deed bars are unmet',
    setup(Game, ctx) {
      if (base.setup) {
        try { base.setup(Game, ctx); } catch (e) { ctx.sortieBaseSetupErr = String(e.message).slice(0, 120); }
      }
      // HEARING, not reading: tap the spoken lines and record ONLY the
      // gorge-offer lines. Every other line passes through untouched
      // and is never used for any decision.
      const st = { offers: [], attempts: [], lastAttemptDay: -1, errors: [] };
      ctx.sortie = st;
      try {
        const origSay = Game.say;
        Game.say = function () {
          try {
            const arg = arguments.length ? arguments[0] : null;
            if (typeof arg === 'string' && isGorgeOffer(arg)) {
              st.offers.push({ day: gday(Game), name: spokenName(arg), answered: false });
            }
          } catch (e) { st.errors.push('say-tap: ' + String(e.message).slice(0, 80)); }
          return origSay.apply(this, arguments);
        };
      } catch (e) { st.errors.push('say-tap-install: ' + String(e.message).slice(0, 80)); }
    },
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.sortieBaseDailyErr = String(e.message).slice(0, 120); }
      }
      sortieDaily(Game, ctx);
    },
  });
  return wrapped;
}

module.exports = { withSortie, sortieDaily, facedCounts, isGorgeOffer, spokenName };
