// indispensable-diag — the indispensable-gate recorder (sim-indispensable,
// 2026-10-20, flesh-out loop, axis scale-onramp, lever-10 win-path end to
// end).
//
// THE QUESTION (sim-tablepathdriver named next #3, 2026-10-20): "The
// engine's why-string is a real gate: 'the galaxy must actually need you.'
// The feast road never earns it. Either a substrate that manufactures real
// inter-village need (full seat + dependence), or an honest documented
// acceptance that the door is earned-rare by design."
//
// This layer is a PURE-READ instrument (INDISPDIAG=1; unset delegates to
// the wrapped policy byte-identically): every daily, AFTER delegating
// inward, it snapshots the engine's OWN gate state and records the best
// seat ever seen, the full gate components at best-seat time, and whether
// the indispensable door was ever earned. It writes NOTHING to game
// state and draws NO RNG — the DET gate pins byte-identity.
//
// Gate components read (all live engine methods):
//   - Game.tableSeat().seat + the full-seat breakdown (detail = the
//     deedGateReady() object: w1..w5 distinct fought, contestsN, crisesN,
//     rank, stage, foodDeeds, ok) — the FULL seat gate (src/js/table.js,
//     src/js/progression.js: waves 5/5/4/3/2, contests>=3, crises>=3,
//     stage>=2, food-thesis deeds).
//   - Game.tableEarnedPaths() -> the indispensable entry {earned,
//     strength, why}: seat full + foodShared>0 +
//     brokerage+might+foodShared>=10 (src/js/table-indispensable.js).
//   - Game.ledger() -> {brokerage, might, foodShared, foodHoarded}.
//
// COMPOSE UPON (never edit): tablepathdriver.js, relaydark.js — this
// layer wraps OUTSIDE them (they are read-only for this arm).
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

// INDISPDIAG=1 is the only on-switch. Unset delegates to the wrapped
// policy byte-identically (the proof's DET gate pins that).
function layerOn() { return process.env.INDISPDIAG === '1'; }

const SEAT_ORDER = { none: 0, lesser: 1, full: 2 };

// snapGate(Game): the engine's own gate state in one pure-read object.
// Returns null only if the engine methods are missing entirely.
function snapGate(Game) {
  const out = { seat: 'none', gate: null, indisp: null, ledger: null };
  try {
    const seat = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    if (seat) {
      out.seat = seat.seat || 'none';
      // detail is the live deedGateReady() breakdown (or null).
      if (seat.detail) out.gate = pickGate(seat.detail);
    }
  } catch (e) {}
  // Fallback: read the breakdown directly even without a seat object.
  if (!out.gate) {
    try {
      const d = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null;
      if (d) out.gate = pickGate(d);
    } catch (e) {}
  }
  try {
    const paths = (typeof Game.tableEarnedPaths === 'function') ? Game.tableEarnedPaths() : [];
    const ie = (paths || []).find(p => String((p && p.id) || '') === 'indispensable');
    if (ie) out.indisp = {
      earned: !!ie.earned, strength: ie.strength | 0,
      why: String(ie.why || ''),
    };
  } catch (e) {}
  try {
    const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
    const b = L.brokerage | 0, m = L.might | 0, fs = L.foodShared | 0, fh = L.foodHoarded | 0;
    out.ledger = { brokerage: b, might: m, foodShared: fs, foodHoarded: fh, score: b + m + fs };
  } catch (e) {}
  // Wave-5 window context (docs/MONSTER-WAVES.md: wave-5 unlocks at
  // standing>=200 AND wave-4 faced) — the deeper why behind w5=0.
  try { out.standing = (Game.villageStanding ? ((Game.villageStanding() || {}).total | 0) : null); } catch (e) { out.standing = null; }
  try { out.unlockedWave = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0; } catch (e) { out.unlockedWave = 1; }
  return out;
}

function pickGate(d) {
  return {
    w1: d.w1 | 0, w2: d.w2 | 0, w3: d.w3 | 0, w4: d.w4 | 0, w5: d.w5 | 0,
    contestsN: d.contestsN | 0, crisesN: d.crisesN | 0,
    rank: String(d.rank || 'village'), stage: d.stage | 0,
    foodDeeds: !!d.foodDeeds, ok: !!d.ok,
  };
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function ensureDG(ctx) {
  let D = ctx._indispdiag;
  if (!D) {
    D = ctx._indispdiag = {
      best: null,           // snapGate() at the best-seat day (first time reached)
      bestSeat: 'none', bestSeatDay: null,
      indispEver: false, indispFirst: null, // {day, why, strength}
      errs: 0, days: 0,
    };
  }
  return D;
}

function recordDaily(Game, ctx) {
  const D = ensureDG(ctx);
  try {
    const s = snapGate(Game);
    s.day = dayOf(Game);
    D.days++;
    const ord = SEAT_ORDER[s.seat] || 0, bord = SEAT_ORDER[D.bestSeat] || 0;
    if (ord > bord) {
      D.bestSeat = s.seat; D.bestSeatDay = s.day; D.best = s;
    }
    if (s.indisp && s.indisp.earned) {
      D.indispEver = true;
      if (!D.indispFirst) D.indispFirst = { day: s.day, why: s.indisp.why, strength: s.indisp.strength };
    }
  } catch (e) { D.errs = (D.errs | 0) + 1; }
  return D;
}

function withIndispDiag(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // PURE-READ discipline: record AFTER the inner daily runs, and the
      // record path itself performs no writes to game state and draws no
      // RNG — only reads + logging into ctx (the probe's own surface).
      const r = inner.daily(Game, ctx);
      if (layerOn()) recordDaily(Game, ctx);
      return r;
    },
  });
}

module.exports = { layerOn, withIndispDiag, snapGate, pickGate, recordDaily, ensureDG, SEAT_ORDER };
