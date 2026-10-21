// sharegate-b — SURPLUSFEED upkeep-skip gate (arm sim-sharegate-b, run
// fleshout-loop-b-20261021T1257Z).
//
// Env-gated SHAREGATE_B=1 (default OFF — unset: pure delegation to the base
// leadfeast/belongfeast, byte-identical; the proof's RED/DET phases pin it).
//
// Context (the named next of sim-surpluskeep-diag-b, landed 440cacf77 /
// 406893331): the SURPLUSFEED trim (ENGINE code, src/js/game.js
// surplusFeedGovernor, env-gated SURPLUSFEED=1 — there is no
// scripts/policies/surplusfeed.js; the trim rides the engine verb, so this
// layer does not re-implement it) is honest glut control, but its lean
// pantry clips the courtship policies' own absolute upkeep gates
// (leadcourt: pantryKcal > 20000 to tendLink; belongseek: pantryKcal >
// 2x-owed to payTribute). The 8802-leadfeast exemplar: the pantry fell
// through the 20k gate → 9 skipped tend-weeks in 28 days → village_1
// trust 100→7 → no-break dissolution at the trust-40 _linkSeasoned bar.
// The trim-dose hypothesis was REJECTED (wrong-signed Pearson, twice); the
// mechanism is threshold-gated. This layer keeps the trim firing (engine,
// untouched) but gates the UPKEEP-SKIP — the skip is threshold-gated, not
// the trim:
//
//   - never skip a tend/tribute week on a link whose trust < 40 (the
//     _linkSeasoned floor) — the policy pays through the lean pantry;
//   - cap consecutive quietly-skipped weeks at 2 per link — two quiet
//     weeks is enough; the third pays anyway.
//
// Every gate decision is voiced (Game.say): gated payments say the bond
// won't stand another thin week; honest skips say the week is let go on a
// pantry that can't carry it while the bond still holds. The engine's own
// verbs (tendLink/payTribute, with mourning/bare-pantry refusals) do the
// paying; the layer never re-litigates a decision the base pass already
// made (attempted-tracking wrap). POLICY-SIDE ONLY: zero src/js changes.
'use strict';
const { leadfeast, belongfeast, trackTribute } = require('./feastscale');

function gateOn() { return process.env.SHAREGATE_B === '1'; }

// The _linkSeasoned floor (hierarchy.js): a polity link seasons at 30+ days
// AND trust >= 40. Skips are gated on this floor, not on the trim dose.
const TRUST_FLOOR = 40;
const MAX_QUIET_SKIPS = 2;

function pantryKcal(Game) {
  try {
    return (((Game.state || {}).village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function linksOf(Game) {
  try { return Game.hierarchyState() || []; } catch (e) { return []; }
}
function weekOf(Game) { try { return (Game._week ? Game._week() : 0); } catch (e) { return 0; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// per-link gate state, run-local (link ids are run-local anyway).
// ctx._sg = { links: { <linkId>: { streak, week, action, kept } } }
// streak = consecutive quietly-skipped weeks; week = last week a decision
// was made; action = 'cover'|'skip'; kept = engine stamped the week.
function sgState(ctx) {
  if (!ctx._sg) ctx._sg = { links: {} };
  if (!ctx._sg.links) ctx._sg.links = {};
  return ctx._sg.links;
}
function firstName(Game) {
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    for (const id of roster) {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      if (p && !p.dead) return String(p.name || 'Someone').split(' ')[0];
    }
  } catch (e) {}
  return 'Someone';
}
function otherName(Game, link, dflt) {
  try {
    if (link.subordinate && link.subordinate !== 'haven') return Game._ovName ? Game._ovName(link.subordinate) : link.subordinate;
    if (link.primary && link.primary !== 'haven') return Game._ovName ? Game._ovName(link.primary) : link.primary;
  } catch (e) {}
  return dflt || 'them';
}

// Wrap an engine verb for the base daily's duration, recording which link
// ids the base pass called (so the second pass never re-litigates a base
// decision — e.g. a mourning refusal the base already narrated). A call
// that the base made marks the week kept: the policy tended/paid, the
// engine stamped it (or refused it aloud); either way it is not a skip.
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

// The weekly gate decision for one link. `stamped` reads whether the
// engine already stamped this week (tendedWeek/tributePaidWeek).
// Returns 'kept'|'cover'|'skip'; never 'skip' when trust < 40; never a
// third consecutive quiet skip.
function gateDecide(Game, ctx, state, link, opts) {
  const week = opts.week;
  const rec = state[link.id] || { streak: 0, week: -1, action: null, kept: false };
  const trust = link.trust | 0;
  const other = otherName(Game, link, opts.other);
  const nm = firstName(Game);
  const pk = pantryKcal(Game);
  // vid: the raw other-village id (cross-run join key for the instrument;
  // display names are run-local fiction).
  let vid = '?';
  try {
    if (link.subordinate && link.subordinate !== 'haven') vid = link.subordinate;
    else if (link.primary && link.primary !== 'haven') vid = link.primary;
  } catch (e) {}
  let action, kept = false, paid = 0;

  if (trust < TRUST_FLOOR) {
    action = 'cover-fray';
  } else if (rec.streak >= MAX_QUIET_SKIPS) {
    action = 'cover-cap';
  } else {
    action = 'skip';
  }

  if (action === 'skip') {
    rec.streak = (rec.week === week - 1 && rec.action === 'skip') ? rec.streak + 1 : 1;
    rec.week = week; rec.action = 'skip'; rec.kept = false;
    state[link.id] = rec;
    ctx.sgSkipHonest = (ctx.sgSkipHonest || 0) + 1;
    ctx.sgDecisions = ctx.sgDecisions || [];
    ctx.sgDecisions.push({ d: dayOf(Game), week, other, vid, side: opts.side, action: 'skip', trust, streak: rec.streak, pk: Math.round(pk) });
    // honest skip, voiced — never silent.
    try {
      Game.say(`${nm} looks at the thin pantry and lets ${other}'s ${opts.noun} wait this week — the bond is still strong (trust ${trust}), and ${opts.nounPronoun} can stand one quiet week.`);
    } catch (e) {}
    return 'skip';
  }

  // cover: call the engine verb; the engine voices the send (or its honest
  // mourning / bare-pantry refusal). The layer voices only the WHY.
  try { paid = Game[opts.verb](link.id) || 0; } catch (e) { paid = 0; }
  kept = !!opts.stamped(link, week);
  rec.week = week; rec.action = action; rec.kept = kept;
  if (kept) rec.streak = 0;
  state[link.id] = rec;
  ctx.sgDecisions = ctx.sgDecisions || [];
  ctx.sgDecisions.push({ d: dayOf(Game), week, other, vid, side: opts.side, action, trust, streak: rec.streak, pk: Math.round(pk), paid: Math.round(paid), kept });
  if (kept) {
    if (opts.side === 'lead') ctx.sgCoverTend = (ctx.sgCoverTend || 0) + 1;
    else ctx.sgCoverTrib = (ctx.sgCoverTrib || 0) + 1;
    try {
      if (action === 'cover-fray') {
        Game.say(`${nm} says the bond with ${other} is wearing thin (trust ${trust}) — one more quiet week and the friendship goes cold. The ${opts.noun} goes anyway; a lean pantry is no excuse to let a friend go hungry.`);
      } else {
        Game.say(`${nm} says two quiet weeks is enough. The ${opts.noun} for ${other} goes out — the pantry is thin, but the rhythm matters more than the shelf.`);
      }
    } catch (e) {}
  } else {
    // engine refused (bare pantry / mourning) — the engine voiced its own
    // refusal; the layer's attempt is recorded, not claimed as kept.
    ctx.sgCoverRefused = (ctx.sgCoverRefused || 0) + 1;
  }
  return 'cover';
}

// LEAD second pass: links the base pass did not attempt this week.
function leadSecondPass(Game, ctx, attempted) {
  const week = weekOf(Game);
  const state = sgState(ctx);
  for (const link of linksOf(Game)) {
    if (!link || link.status !== 'active') continue;
    if (link.primary !== 'haven') continue;
    if (typeof Game.tendLink !== 'function') continue;
    if (link.tendedWeek === week) {
      if (state[link.id]) state[link.id].streak = 0; // week kept by the base pass
      continue;
    }
    if (attempted.has(link.id)) {
      if (state[link.id]) state[link.id].streak = 0; // base called the verb — not a skip
      continue;
    }
    const rec = state[link.id];
    if (rec && rec.week === week) {
      // weekly-deduped: retry only a cover the engine refused (bare pantry
      // may have recovered); never re-decide a quiet skip.
      if (rec.action !== 'skip' && !rec.kept) {
        gateDecide(Game, ctx, state, link, {
          week, side: 'lead', verb: 'tendLink', noun: 'grain', nounPronoun: 'it',
          stamped: (l, w) => l.tendedWeek === w, other: null,
        });
      }
      continue;
    }
    gateDecide(Game, ctx, state, link, {
      week, side: 'lead', verb: 'tendLink', noun: 'grain', nounPronoun: 'it',
      stamped: (l, w) => l.tendedWeek === w, other: null,
    });
  }
}

// BELONG second pass: the subordinate link the base pass did not attempt.
function belongSecondPass(Game, ctx, attempted) {
  const week = weekOf(Game);
  const state = sgState(ctx);
  let link = null;
  for (const l of linksOf(Game)) {
    if (l && l.status === 'active' && l.subordinate === 'haven' && !l.kind) { link = l; break; }
  }
  if (!link || typeof Game.payTribute !== 'function') return;
  if (link.tributePaidWeek === week) {
    if (state[link.id]) state[link.id].streak = 0;
    return;
  }
  if (attempted.has(link.id)) {
    if (state[link.id]) state[link.id].streak = 0;
    return;
  }
  const rec = state[link.id];
  if (rec && rec.week === week) {
    if (rec.action !== 'skip' && !rec.kept) {
      gateDecide(Game, ctx, state, link, {
        week, side: 'belong', verb: 'payTribute', noun: 'tribute', nounPronoun: 'they',
        stamped: (l, w) => l.tributePaidWeek === w, other: null,
      });
    }
    return;
  }
  gateDecide(Game, ctx, state, link, {
    week, side: 'belong', verb: 'payTribute', noun: 'tribute', nounPronoun: 'they',
    stamped: (l, w) => l.tributePaidWeek === w, other: null,
  });
}

const leadfeast_sharegate = Object.assign({}, leadfeast, {
  id: 'leadfeast-sharegate',
  desc: 'leadfeast + SHAREGATE_B lever (SHAREGATE_B=1): threshold-gated upkeep skips — never below trust-40, max 2 consecutive',
  daily(Game, ctx) {
    if (!gateOn()) return leadfeast.daily(Game, ctx); // gate off: pure delegation
    const t = trackAttempts(Game, 'tendLink');
    try { leadfeast.daily(Game, ctx); }
    finally { t.restore(); }
    // the gate's covers are real upkeep payments — they ride the same
    // feast-contribution accounting as the base pass (recentTribute),
    // never a shadow ledger.
    const u = trackTribute(Game, ctx);
    try { leadSecondPass(Game, ctx, t.attempted); }
    finally { u(); }
  },
});

const belongfeast_sharegate = Object.assign({}, belongfeast, {
  id: 'belongfeast-sharegate',
  desc: 'belongfeast + SHAREGATE_B lever (SHAREGATE_B=1): threshold-gated upkeep skips — never below trust-40, max 2 consecutive',
  daily(Game, ctx) {
    if (!gateOn()) return belongfeast.daily(Game, ctx); // gate off: pure delegation
    const t = trackAttempts(Game, 'payTribute');
    try { belongfeast.daily(Game, ctx); }
    finally { t.restore(); }
    // the gate's covers are real upkeep payments — they ride the same
    // feast-contribution accounting as the base pass (recentTribute),
    // never a shadow ledger.
    const u = trackTribute(Game, ctx);
    try { belongSecondPass(Game, ctx, t.attempted); }
    finally { u(); }
  },
});

module.exports = {
  leadfeast_sharegate, belongfeast_sharegate,
  gateOn, TRUST_FLOOR, MAX_QUIET_SKIPS,
  gateDecide, leadSecondPass, belongSecondPass, sgState, pantryKcal,
};
