// vetcompose-lib-20261017.js — shared lib for the sim-vetcompose arm
// (evidence/2026-10-17/sim-vetcompose.md). The composition under test plus
// the read-only instrument, shared by the sweep and the proof so the two
// can never drift (the wave4census instrument-neutrality precedent).
//
// COMPOSITION: withVetrel over the seatdrive-composed leadseat/belongseat.
// Both sides share the same wrapper objects; VETREL is the only switch
// (process.env.VETREL=1 armed, deleted control — gate-off pure delegation).
//
// INSTRUMENT (read-only, zero writes, zero RNG draws): once per day,
// Game.waveCombatReadiness(4) — the engine's own four-bar reader — plus
// scale/table/exile reads. The proof's instrument-neutrality det-gate
// pins byte-identical trajectories instrumented vs bare.
'use strict';
const SD = require('./policies/seatdrive');
const VR = require('./policies/vetrel');

const SEEDS = [2271121, 2381233, 2491345, 2601457, 2711569, 2821681, 2931793, 3041905];
const POLICIES = ['leadseat', 'belongseat'];
const DAYS = 180;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const leadseatV = VR.withVetrel(SD.leadseat, 'leadseat-vetcomp',
  'seatdrive leadseat + VETREL veteran-reliability composition (VETREL=1)');
const belongseatV = VR.withVetrel(SD.belongseat, 'belongseat-vetcomp',
  'seatdrive belongseat + VETREL veteran-reliability composition (VETREL=1)');

function policyFor(policyId) {
  return policyId === 'leadseat' ? leadseatV : belongseatV;
}
function nakedFor(policyId) {
  return policyId === 'leadseat' ? SD.leadseat : SD.belongseat;
}

// Engine's own wave-4 readiness reader (design call #4, src/js/standing.js).
// Pure state read — no writes, no RNG draws.
function readiness(Game) {
  try {
    const r = Game.waveCombatReadiness(4);
    return {
      ready: !!r.ready, armored: r.armored | 0, armed: r.armed | 0,
      tricks: r.tricks | 0, veterans: r.veterans | 0,
      short: (r.short || []).join('|') || 'NONE',
    };
  } catch (e) { return { err: String(e && e.message).slice(0, 60) }; }
}

// The sweep's daily instrument. `hist` accumulates the run's primary-relevant
// state. Calls oDaily (the composed policy's daily) and returns its value.
// Returns the instrumented daily function.
function makeInstrument(hist, oDaily) {
  let lastBearer = null;
  return function instrumentedDaily(G, ctx) {
    try {
      const b = G.villagerId;
      if (lastBearer !== null && b !== lastBearer) hist.scholarDeaths++;
      lastBearer = b;
    } catch (e) {}
    const rr = readiness(G);
    if (rr.veterans != null) {
      hist.maxVeterans = Math.max(hist.maxVeterans || 0, rr.veterans | 0);
      if ((rr.veterans | 0) >= 2) hist.vet2peak = 1; // PRIMARY: engine's own reader
    }
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank || 0, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };
}

module.exports = {
  SEEDS, POLICIES, DAYS, RANK_ORDER,
  SD, VR,
  leadseatV, belongseatV,
  policyFor, nakedFor,
  readiness, makeInstrument,
};
