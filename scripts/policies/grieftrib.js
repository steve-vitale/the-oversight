// grieftrib — the grief-tribute negotiation layer (sim-grieftrib, 2026-10-17,
// scale-onramp axis, findings #459/#460 follow-up).
//
// ONE policy-side layer, opt-in via GRIEFTRIB=1 (default OFF — unset means
// the wrapper never installs and daily delegates byte-identically; the proof
// test's D0 pins that). Wraps leadfeast/belongfeast (the FEASTSCALE_R13=1
// courtship-road substrate). Zero src/js.
//
// THE FAILURE (sim-compoundidx, evidence/2026-10-17/sim-compoundidx.md):
// grief-leveraged tribute on 8/17 compound runs (terms 7,500-11,250
// kcal/week), ALL on the belongfeast/subordinate road: when Haven's speaker
// dies, the primary installs their own and tribute ratchets x1.5 — twice per
// link since the 2026-10-17 gap-closure cap, uncapped before it. Nothing in
// the policy negotiates tribute down or refuses the grab; terms ratchet
// 4,000->11,250 while the village grieves. (The gap-closure capped the
// exponent at 2 grabs/link; this layer negotiates the grabs that remain.)
//
// THE ENGINE'S OWN HANDLE (no invented verbs): mature (>=21d) subordinate
// links get the grab AUTOMATICALLY inside successionCrisis — no beat, no
// negotiation. Young links (<21d) get a staged renegotiation beat
// (answerRenegotiation: 'gift' 1,500 kcal / trust +8, 'visit' 2-day speaker
// / trust +5, 'wait' silence / trust -6 and the leverage lands) — but the
// base courtship policies NEVER answer them (sim-findings #166), so they
// lapse and the leverage lands anyway.
//
// THE LEVER: when a succession hits a mature subordinate-road link, stage the
// engine's renegotiation beat BEFORE the engine's grab path runs. The
// engine's own GRIEF COALESCES guard (2026-10-11) then returns 'grieving' —
// no x1.5 grab, no -8 haircut, no mourning window — and the layer answers
// the beat the same event: 'gift' when the pantry carries 1,500 kcal above
// the 2-day survival floor, else 'visit' (the engine degrades honestly to
// word-and-promises when the bench is empty). Grief is met with grain or a
// face, aloud, with real costs — the same idiom as the young-link beat, now
// played where the ratchet actually lives. Any staged beat on a
// subordinate-road link (young links included) gets answered — never 'wait':
// silence is -6 trust and the deferred leverage landing.
//
// DELIBERATELY NOT BUILT:
//   - The lead road (Haven primary): their-speaker deaths RAISE tribute to
//     Haven (Haven installs its own) — that is Haven's income, not its
//     ratchet. Untouched.
//   - theirLeaderDied on the subordinate road (tribute DOWN x0.75 in their
//     chaos): already Haven's favor. Untouched.
//   - Vetoing the grab silently: a silent veto is a spreadsheet, not
//     people. The beat carries the fiction and the cost.
//   - Links with griefGrabs >= 2: the gap-closure cap already refuses the
//     third grab aloud. Skipped.
//   - Links already grieving (pendingRenegotiation set, mourning live): the
//     coalesce guard already prices the grief in. Skipped.
//
// Deterministic: no RNG, no Date.now — reads only Game.state + link fields.
// Gate-off: no wrapper installed, pure delegation (byte-identical by
// construction, pinned by D0).
'use strict';
const FS = require('./feastscale');

function layerOn() { return process.env.GRIEFTRIB === '1'; }

const HOME = 'haven';
const YOUNG_LINK_DAYS = 21;   // engine's young-link bar: beats stage below it
const GIFT_KCAL = 1500;       // the engine's renegotiation gift price
const FLOOR_DAYS = 2;         // tribfloor's floor convention (engine pantry-days)

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function dailyBurn(Game) {
  try {
    const v = Game.state.village || {};
    const hist = v.burnHistory || [];
    if (!hist.length) {
      const pop = ((v.roster || []).length) || 12;
      return Math.max(1, pop * 2000);
    }
    return hist.reduce((a, b) => a + b, 0) / hist.length;
  } catch (e) { return 1; }
}
function floorKcal(Game) { return FLOOR_DAYS * dailyBurn(Game); }
function activeLinks(Game) {
  try { return (Game.hierarchyState() || []).filter(l => l && l.status === 'active'); }
  catch (e) { return []; }
}
function findLink(Game, linkId) {
  try {
    const ls = Game.hierarchyState() || [];
    for (const l of ls) if (l && l.id === linkId) return l;
  } catch (e) {}
  return null;
}

// subordinateRoad: Haven is the subordinate — the road where grief finds
// tribute terms to leverage. Peer leagues (covenant/trade) shake their own
// way via covenantCrisis and never reach the grab.
function subordinateRoad(link) {
  return !!link && link.subordinate === HOME &&
    link.kind !== 'covenant' && link.kind !== 'trade';
}

// stageable: the engine's grab path would fire on this link — a mature
// subordinate-road link, not already grieving, with grabs left to spend.
function stageable(Game, link) {
  if (!subordinateRoad(link)) return false;
  if (link.status !== 'active') return false;
  if (link.pendingRenegotiation) return false;                    // already grieving
  const day = gday(Game);
  if ((link.mourningUntil || 0) > day) return false;              // already grieving
  if (day - (link.day || 0) < YOUNG_LINK_DAYS) return false;      // engine stages its own beat
  if ((link.griefGrabs || 0) >= 2) return false;                  // the cap's "spent" refusal handles it
  return true;
}

// installWrapper: persistent, installed once per run on first daily.
// Wraps Game.successionCrisis — the single funnel for Haven's-speaker-death
// grief on hierarchy links (called from onLeaderDeath via registerDeath,
// and from covenantCrisis for non-peer links). Before delegating, stage the
// engine's renegotiation beat on a stageable mature subordinate-road link;
// the engine's GRIEF COALESCES guard then returns 'grieving' instead of
// landing the x1.5 grab. After delegating, answer every staged beat on the
// subordinate road (this event's staged beat plus young-link beats the base
// policies leave unanswered).
function installWrapper(Game, ctx) {
  const orig = Game.successionCrisis;
  if (typeof orig !== 'function') return false;
  if (orig._grieftribWrapped) return true; // idempotent across policy re-wraps
  const wrapped = function (linkId) {
    try {
      const link = findLink(this, linkId);
      if (link && stageable(this, link)) {
        // The engine's beat shape: { day, sub } — sub=true means "Haven is
        // the subordinate", which _resolveRenegotiation reads on lapse. We
        // always answer, so no lapse path; the flag stays engine-consistent.
        link.pendingRenegotiation = { day: gday(this), sub: true, grieftrib: true };
        ctx.gtStaged = (ctx.gtStaged || 0) + 1;
      }
    } catch (e) {}
    let r;
    try { r = orig.apply(this, arguments); }
    finally {
      try { answerBeats(this, ctx); } catch (e) {}
    }
    return r;
  };
  wrapped._grieftribWrapped = true;
  Game.successionCrisis = wrapped;
  return true;
}

// answerBeats: answer every staged renegotiation beat on the subordinate
// road — gift when the pantry carries 1,500 kcal above the survival floor,
// else visit. Never 'wait': silence is -6 trust and the deferred leverage
// landing. Beats expire in 7 days via the engine's _renegotiationTick; the
// wrapper answers this event's beats immediately, and the daily pass below
// sweeps any beat staged outside the wrapper (young links, pre-install).
function answerBeats(Game, ctx) {
  let n = 0;
  try {
    if (typeof Game.answerRenegotiation !== 'function') return 0;
    const floor = floorKcal(Game);
    for (const l of activeLinks(Game)) {
      if (!l.pendingRenegotiation) continue;
      if (!subordinateRoad(l)) continue;
      const how = pantryKcal(Game) >= GIFT_KCAL + floor ? 'gift' : 'visit';
      try {
        const r = Game.answerRenegotiation(l.id, how);
        if (r) { n++; ctx['gtAnswered_' + how] = (ctx['gtAnswered_' + how] || 0) + 1; }
      } catch (e) {}
    }
  } catch (e) {}
  return n;
}

function withGrieftrib(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      try {
        if (!ctx._gtWrapped) { installWrapper(Game, ctx); ctx._gtWrapped = true; }
        answerBeats(Game, ctx); // beats staged outside the wrapper (young links, pre-install deaths)
      } catch (e) {}
      return base.daily(Game, ctx);
    },
  });
}

const leadfeast = withGrieftrib(
  FS.leadfeast, 'leadfeast',
  'leadfeast + grieftrib (GRIEFTRIB=1): mature subordinate-link grief grabs become played renegotiation beats (gift/visit), answered the same event'
);
const belongfeast = withGrieftrib(
  FS.belongfeast, 'belongfeast',
  'belongfeast + grieftrib (GRIEFTRIB=1): mature subordinate-link grief grabs become played renegotiation beats (gift/visit), answered the same event'
);

// The sweep imports these ids ('leadfeast', 'belongfeast'); the GRIEFTRIB
// env var is the only switch — control and armed share the same objects.
module.exports = {
  leadfeast, belongfeast, withGrieftrib, layerOn,
  installWrapper, answerBeats, stageable, subordinateRoad,
  pantryKcal, dailyBurn, floorKcal, GIFT_KCAL, FLOOR_DAYS, YOUNG_LINK_DAYS,
};
