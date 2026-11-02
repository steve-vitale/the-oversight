'use strict';
// competent-homewardconstruct-b.js — CONSTRUCTED-TRIP policy
// (sim-homewardac-b, Loop B food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-homewardac-b-prereg.md
// (committed BEFORE any judged sim).
//
// The natural-band search for homeward shapes A/C is exhausted
// (0/16 fresh seeds at 1505Z, 0/64 for the entry shape at 1345Z,
// and both 1345Z prototypes re-routed by landing r72). This policy
// constructs the trip instead: on a pre-registered day it forces a
// prescribed walk-out through the engine's OWN travelTo — never a
// teleport, never a state edit — and then lets competent.daily
// play the rest of the day normally (forage, walk home).
//
// Mechanism faithfulness (verified against game.js before the
// prereg was written): node travel is FREE (no tick/kcal cost for
// the boundary itself), so a forced travelTo hop costs exactly
// what a natural trip hop costs. travelTo accepts only
// engine-offered destinations (travelTargets: d<=3 revealed, or
// d==1); the walk-out routes below are ADJACENT steps, hence
// always offered. Only the DESTINATION CHOICE is prescribed.
//
// Guard-days instrument (prereg, disclosed): the guard —
// installGuard/escapeCheck imported VERBATIM from
// competent-homewardstep-b.js, zero changes — is installed ONLY
// on construction days. Other days run pure competent.daily with
// no guard at all. Veto decisions are memory-independent (memory
// affects narration only), so trip-day guard behavior given the
// same state equals the always-on guard's trip-day behavior, and
// pre-trip identity between legs is guaranteed by construction.
//
// Env (driver-enforced, FATAL otherwise):
//   CONSTRUCT_SHAPE=A|C
//   A: CONSTRUCT_DAY_A (default 5),
//      CONSTRUCT_ROUTE_A (default '5,4;6,4;7,4;7,3;7,2;7,1')
//   C: CONSTRUCT_DAY_C1 (default 5),
//      CONSTRUCT_ROUTE_C1 (default '4,5;4,6;4,7;4,8;3,8;2,8'),
//      CONSTRUCT_DAY_C2 (default 6),
//      CONSTRUCT_HOP_C2 (default '2,8>4,8')
// The driver sets ctx.constructLoopDay per day; the policy falls
// back to Game.state.scholar.day when it is absent (proof tests).
const { competent } = require('./competent');
const { installGuard } = require('./competent-homewardstep-b');

function parseRoute(str) {
  if (!str) return [];
  return str.split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
    const m = s.match(/^(-?\d+),(-?\d+)$/);
    if (!m) return null;
    return { x: parseInt(m[1], 10), y: parseInt(m[2], 10) };
  }).filter(Boolean);
}
function parseHop(str) {
  if (!str) return null;
  const m = str.trim().match(/^(-?\d+),(-?\d+)>(\-?\d+),(-?\d+)$/);
  if (!m) return null;
  return { from: { x: parseInt(m[1], 10), y: parseInt(m[2], 10) }, to: { x: parseInt(m[3], 10), y: parseInt(m[4], 10) } };
}
function posOf(Game) {
  try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return { x: null, y: null }; }
}
function samePos(a, b) { return a && b && a.x === b.x && a.y === b.y; }
function inCombat(Game) {
  try { return !!(Game.inCombat && Game.inCombat()); } catch (e) { return false; }
}

function dailyWithConstruct(Game, ctx, shadow) {
  const shape = process.env.CONSTRUCT_SHAPE || 'A';
  const loopDay = (ctx && ctx.constructLoopDay) || ((Game.state || {}).scholar || {}).day || 0;
  let kind = null, route = [], attemptHop = null;
  if (shape === 'A') {
    if (loopDay === parseInt(process.env.CONSTRUCT_DAY_A || '5', 10)) {
      kind = 'walkout';
      route = parseRoute(process.env.CONSTRUCT_ROUTE_A || '5,4;6,4;7,4;7,3;7,2;7,1');
    }
  } else if (shape === 'C') {
    if (loopDay === parseInt(process.env.CONSTRUCT_DAY_C1 || '5', 10)) {
      kind = 'walkout';
      route = parseRoute(process.env.CONSTRUCT_ROUTE_C1 || '4,5;4,6;4,7;4,8;3,8;2,8');
    } else if (loopDay === parseInt(process.env.CONSTRUCT_DAY_C2 || '6', 10)) {
      kind = 'attempt';
      attemptHop = parseHop(process.env.CONSTRUCT_HOP_C2 || '2,8>4,8');
    }
  }
  if (!kind) { competent.daily(Game, ctx); return; }
  const report = { shape, loopDay, kind, startPos: posOf(Game), steps: [], posAfterForced: null, attempt: null };
  const restore = installGuard(Game, ctx, { shadow: !!shadow });
  try {
    if (kind === 'walkout') {
      for (const wp of route) {
        if (Game.over || inCombat(Game)) { report.steps.push({ to: wp, attempted: false, moved: false, reason: Game.over ? 'over' : 'combat' }); break; }
        const before = posOf(Game);
        if (samePos(before, wp)) { report.steps.push({ to: wp, attempted: false, moved: true, reason: 'already-there' }); continue; }
        let res = null;
        try { res = Game.travelTo(wp.x, wp.y); } catch (e) { res = null; }
        const after = posOf(Game);
        report.steps.push({ to: wp, attempted: true, moved: samePos(after, wp), reason: samePos(after, wp) ? 'ok' : 'refused' });
        if (!samePos(after, wp)) break; // engine refused: walk-out ends here
      }
    } else if (kind === 'attempt' && attemptHop) {
      let offered = false;
      try { offered = (Game.travelTargets() || []).some((t) => t.x === attemptHop.to.x && t.y === attemptHop.to.y); } catch (e) { offered = false; }
      if (!offered || Game.over || inCombat(Game)) {
        report.attempt = { hop: attemptHop.from.x + ',' + attemptHop.from.y + '>' + attemptHop.to.x + ',' + attemptHop.to.y, attempted: false, moved: false, reason: Game.over ? 'over' : (inCombat(Game) ? 'combat' : 'not-offered') };
      } else {
        try { Game.travelTo(attemptHop.to.x, attemptHop.to.y); } catch (e) {}
        const after = posOf(Game);
        report.attempt = { hop: attemptHop.from.x + ',' + attemptHop.from.y + '>' + attemptHop.to.x + ',' + attemptHop.to.y, attempted: true, moved: samePos(after, attemptHop.to), reason: samePos(after, attemptHop.to) ? 'ok' : 'refused' };
      }
    }
    report.posAfterForced = posOf(Game);
    competent.daily(Game, ctx);
  } finally {
    restore();
  }
  if (ctx) ctx.constructReport = report;
}

const construct = Object.assign({}, competent, {
  daily(Game, ctx) { dailyWithConstruct(Game, ctx, false); },
});
const constructShadow = Object.assign({}, competent, {
  daily(Game, ctx) { dailyWithConstruct(Game, ctx, true); },
});

module.exports = { construct, constructShadow, parseRoute, parseHop, dailyWithConstruct };
