'use strict';
// competent-guarde-entry-b.js — ENTRY-CHECKED ALLOW' (JUDGED INSTRUMENT ONLY)
// (sim-guarde-entry-b, Loop B food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-guarde-entry-b-prereg.md
// (committed BEFORE any judged sim).
//
// The fix shape judged here, and NOTHING else:
//   allow'(origin -> dest) = escapeCheck(dest).ok
//     AND checkHop(origin, dest).blockers is empty.
// escapeCheck + checkHop are imported VERBATIM from
// competent-homewardstep-b.js; this module adds NO other
// logic to the allow path — no credit, no veto-memory, no
// narration change. In particular the entry check consults
// raw checkHop blockers, NOT the roadwork credit pool.
//
// This module is loaded ONLY by the proof test
// (scripts/test-guarde-entry-b.js) and is the analyzer's
// definition of allow'. It is NEVER loaded by a campaign
// driver: no live default changes, no game-code change,
// no policy-default flip. Any deploy of the fix shape
// belongs to a later arm's decision.
//
// allowPrimeFromRecord(hop) is the pure form used on
// recorder output: a recorded hop already carries E
// (escapeCheck from the destination) and entry
// (checkHop with explicit origin), so allow' is computed
// from the record without re-running the game.
const { escapeCheck, checkHop } = require('./competent-homewardstep-b');

function allowPrime(Game, px, py, tx, ty, hx, hy) {
  const esc = escapeCheck(Game, tx, ty, hx, hy);
  const entry = checkHop(Game, px, py, tx, ty);
  const blockers = (entry && entry.blockers) || [];
  return {
    allow: !!esc.ok && blockers.length === 0,
    eOk: !!esc.ok,
    eVia: esc.via || null,
    entryBlockers: blockers.map((b) => ({ x: b.x, y: b.y, blockType: b.blockType || 'unknown' })),
    entryBlocked: blockers.length > 0,
  };
}

function allowPrimeFromRecord(hop) {
  const eOk = !!(hop && hop.E && hop.E.ok);
  const blockers = ((hop && hop.entry && hop.entry.blockers) || []);
  return {
    allow: eOk && blockers.length === 0,
    eOk,
    entryBlockers: blockers.map((b) => ({ x: b.x, y: b.y, blockType: b.blockType || 'unknown' })),
    entryBlocked: blockers.length > 0,
    // Veto status under each rule. Old rule vetoes IFF E fail;
    // new rule vetoes IFF NOT allow'. E-fail hops are vetoed
    // under both — that identity IS veto invariance.
    vetoOld: !eOk,
    vetoNew: !(eOk && blockers.length === 0),
  };
}

module.exports = { allowPrime, allowPrimeFromRecord };
