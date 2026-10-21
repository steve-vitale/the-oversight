// tributeguard — "never skip the tribute that keeps the court"
// (flesh-out loop, 2026-10-21, arm sim-tributeguard, axis scale-onramp,
// backlog #752: the sim-dissolvetax DIAG's named next).
//
// THE KNIFE-EDGE (evidence/2026-10-21/sim-dissolvetax.md): on the VGEAR=1
// winning substrate, belongfeast-s64907 sat the court d80 and lost the realm
// d92 when a single 135-kcal tribute shortfall tripped the arrears≡0
// good-standing bar. The policy-touchable proxy: belongseek's pantry-skip
// gate (`pantryKcal(Game) > trib * 2` — belongseek.js, belongCourtship
// step 2) CHOSE the skip that created the arrears.
//
// THE GUARD: while a belong court is held — own link in good standing to a
// primary whose realm holds — the tribute is ALWAYS paid; the skip gate
// never fires. "Court held" is the ENGINE'S OWN verdict:
// Game.polityOf(primaryId) returning a 'belong'-shaped polity (hierarchy.js
// polityOf: trust >= 50 via _succTrustOf, arrears ≡ 0, link age >= 14d,
// foreign realm 2 + subs >= 4 fires). Using the engine's own function means
// the guard's definition can never drift from the bar that actually seats
// and dissolves the court. The guard calls the engine's own
// Game.payTribute(link.id) (hierarchy.js ~L852: idempotent, real food leaves
// the pantry, a full payment clears arrears and +3 trust, partials accrue
// honestly). No engine change, no new numbers — the policy just stops
// choosing the skip.
//
// POLICY-SIDE ONLY — zero src/js changes. TRIBGUARD=1 default-OFF; unset =
// pure delegation to the wrapped stack (the proof's det-gate pins
// byte-identical trajectories).
//
// COMPOSITION: withTributeGuard(base, id, desc) wraps the SAME winning
// substrate stack (vgearconfirm.armedFor / seatStackFor) OUTSIDE — same
// shape as withVillagerGear / withSeatDrive. TRIBGUARD is the only switch.
// Both sweep arms share this module; control runs it with TRIBGUARD unset
// (read-only skip counting, zero state writes) and armed runs it with
// TRIBGUARD=1 (the guard).
//
// KILL PROTOCOL: if NO-GO at pilot/confirm, this module is deleted
// zero-trace (verify zero refs); instruments + evidence + proof land with
// the KILLED-VERDICT. Killed arms leave no trace in game code.
//
// Canon: docs/CANON.md read first. NO canon doc covers links/realms/courts/
// tribute mechanics (the sim-dissolvetax arm established this) — every
// mechanism claim in this file is grounded in src/js reads (hierarchy.js),
// cited by function/area; nothing invented.
'use strict';
const VCE = require('./vgearconfirm');

function tributeguardOn() { return process.env.TRIBGUARD === '1'; }

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function gweek(Game) { try { return Game._week ? Game._week() : 0; } catch (e) { return 0; } }

// The BELONG road's bond: Haven's active subordinate link (no covenant/trade
// kind) — the same pick as belongseek.js subLink (verified by read).
function ownSubLink(Game) {
  try {
    const ls = Game.hierarchyState() || [];
    for (const l of ls) {
      if (l && l.status === 'active' && l.subordinate === 'haven' && !l.kind) return l;
    }
  } catch (e) {}
  return null;
}

// "Court held": the engine's own verdict. polityOf(primaryId) returns a
// 'belong'-shaped polity only when trust >= 50, arrears ≡ 0, link age >=
// 14d, and the foreign realm holds >= 4 fires (hierarchy.js polityOf).
function courtHeld(Game, link) {
  try {
    if (!link || !Game.polityOf) return false;
    const p = Game.polityOf(link.primary);
    return !!(p && p.shape === 'belong');
  } catch (e) { return false; }
}

// The skip condition the inner stack applies (belongseek.js step 2): the
// week's tribute is unpaid AND the pantry can't carry 2x the week's tribute.
// When pantryKcal > trib*2, inner pays itself — the guard never fires.
function skipWouldFire(Game, link) {
  try {
    if (!link) return false;
    const week = gweek(Game);
    if ((link.tributePaidWeek || -1) === week) return false; // paid — no skip
    const trib = link.tributeKcalPerWeek || 4000;
    return pantryKcal(Game) <= trib * 2;
  } catch (e) { return false; }
}

// Read-only pre-daily snapshot for the skip instrument. Pure reads:
// hierarchyState, polityOf, pantry, _week — no RNG draws, no state writes.
function snapshot(Game) {
  const link = ownSubLink(Game);
  return {
    link,
    held: courtHeld(Game, link),
    unpaid: link ? ((link.tributePaidWeek || -1) !== gweek(Game)) : false,
    skip: skipWouldFire(Game, link),
  };
}
function logEvent(ctx, kind, Game, snap, extra) {
  try {
    ctx.tgEvents = ctx.tgEvents || [];
    if (ctx.tgEvents.length >= 200) return; // bound the log
    const link = snap.link || {};
    ctx.tgEvents.push(Object.assign({
      kind, day: gday(Game),
      trust: link.trust || 0, arrears: link.arrears || 0,
      trib: link.tributeKcalPerWeek || 0,
      pantryKcal: Math.round(pantryKcal(Game)),
    }, extra || {}));
  } catch (e) {}
}

function withTributeGuard(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      const pre = snapshot(Game);
      if (!tributeguardOn()) {
        // CONTROL: pure delegation + read-only skip counting. No Game
        // state writes, no RNG draws — the det-gate pins byte-identical
        // trajectories against the unwrapped stack.
        const r = base.daily(Game, ctx);
        if (pre.held && pre.unpaid && pre.skip) {
          try {
            const post = snapshot(Game);
            if (post.unpaid) { // the skip materialized — inner never paid
              ctx.tgSkips = (ctx.tgSkips | 0) + 1;
              logEvent(ctx, 'skip', Game, pre);
            }
          } catch (e) {}
        }
        return r;
      }
      // ARMED: the guard. While the court is held and the inner stack would
      // skip this week's tribute, pay it through the engine's own verb —
      // BEFORE inner runs, so inner's gate sees tributePaidWeek === week
      // and never double-pays (payTribute is idempotent anyway).
      if (pre.held && pre.unpaid && pre.skip && Game.payTribute) {
        try {
          const paid = Game.payTribute(pre.link.id);
          ctx.tgGuardPaid = (ctx.tgGuardPaid | 0) + 1;
          const owed = pre.link.tributeKcalPerWeek || 4000;
          const partial = (paid == null ? 0 : paid) < owed;
          if (partial) ctx.tgGuardPartial = (ctx.tgGuardPartial | 0) + 1;
          logEvent(ctx, partial ? 'guard-partial' : 'guard-paid', Game, pre,
            { paid: paid == null ? 0 : Math.round(paid) });
        } catch (e) { ctx.tgGuardError = (ctx.tgGuardError | 0) + 1; }
      }
      return base.daily(Game, ctx);
    },
  });
}

// Paired composition on the VGEAR=1 winning substrate: both arms wrap the
// same vgearconfirm armed stack; TRIBGUARD is the only switch.
function armedFor(base) {
  const b = VCE.normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  return withTributeGuard(VCE.armedFor(b),
    `${tag}-tributeguard`,
    `${b} + vgearconfirm stack (VGEAR=1) + TRIBUTEGUARD (TRIBGUARD=1): never skip the tribute that keeps the court`);
}

module.exports = {
  tributeguardOn, ownSubLink, courtHeld, skipWouldFire, withTributeGuard, armedFor,
};
