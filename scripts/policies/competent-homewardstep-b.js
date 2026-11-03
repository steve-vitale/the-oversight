'use strict';
// competent-homewardstep-b.js — HOMEWARD-STEP GUARD
// (sim-homewardstep-b, Loop B food-economy arm, 2026-11-02).
// Re-ported verbatim for sim-homewardstep-rpt-b (2026-11-02) via git show;
// logic unchanged; prereg evidence/2026-11-02/sim-homewardstep-rpt-b-prereg.md.
// Port of the sim-homewardstep-b escape model E(D) (read via git show only),
// with THE ONE CHANGE: the 'never veto a return' passthrough is REMOVED.
//
// Prereg: evidence/2026-11-02/sim-homewardstep-b-prereg.md (committed
// BEFORE any judged sim). Policy-side arm: a NEW policy file, default
// OFF (nothing loads it unless a driver names it), ZERO src/js changes,
// ZERO edits to scripts/policies/competent.js, ZERO policy-default flips.
//
// THE FAILURE THIS FIXES (Loop B 0619Z): the jump-faithful guard vetoed
// on walkTo-home failure alone, but trips escape LATERALLY through
// subsequent picks, not by walking straight home. On 61705 day 14 it
// vetoed (1,6)->(0,6) while the baseline scholar visited (0,6) and came
// home the same day by walking ONWARD: (0,6)->(2,7)->(2,8)->(2,5)->home.
// That veto is a CONFIRMED false close. The same guard also
// repeat-shouted: 49 vetoes on 61704, the same western hop 3x/day.
//
// THE ONE DESIGN (prereg, decided up front): veto ONLY when the
// lateral-escape-aware check E(D) fails from the hop destination D,
// DEPLOYED 2026-11-03 (sim-guarde-deploy-b) as the entry-checked
// allow' (see below): veto when E(D) fails OR the hop itself is
// entry-blocked (checkHop from the hop origin), with the veto line
// distinguishing the cause — escape vetoes keep the old line,
// entry vetoes say "You can't step there — you couldn't get in
// from here." The entry check uses RAW checkHop, never E's
// roadwork credit (credit answers "could you get home if you
// cleared rubble on the way", entry answers "can you step on
// from here"; the engine grants no credit on a real hop).
//   1. DIRECT: the walkTo-faithful return sim (travelTo jumps, d<=3,
//      intermediate-blockage scan replicated exactly, 10-hop cap).
//   2. LATERAL (only if direct fails): up to 4 lateral legs. At sim
//      position P, first re-run the direct sim from P; if it passes,
//      E passes. Else enumerate forage candidates from P as
//      competent.js forageTripSeedFirst reads them (travelTargets
//      offers, stocked >0, not haven/ruin, sorted unblocked-first
//      then by distance then offer order); the first candidate whose
//      SINGLE travelTo hop passes jump-faithfully becomes the next P
//      (marked picked-clean in sim stock, sim-revealed), and the loop
//      repeats. No passing candidate, or 4 legs without a direct
//      success, => E fails.
//   3. ROADWORK CREDIT: ONE credit shared across the WHOLE E(D)
//      evaluation (every direct sub-sim and every lateral hop draws
//      from the same pool of 1). A hop passes on credit only when
//      EVERY blocker is rubble on a SINGLE distinct tile.
// VETO MEMORY (narration only, part of this same guard, NOT an abort):
// the guard remembers vetoed destination tiles for the run (ctx set).
// The FIRST veto of a destination says the line; repeat vetoes of the
// same destination are SILENT — still vetoed, still counted, just not
// re-shout. Game.say is narration (emit text stream); the veto decision
// is identical with or without memory, so memory changes no trajectory.
//
// Passthrough rules (CHANGED from the predecessor): homeward hops are
// NO LONGER exempt — every guarded hop, homeward or outward, is
// evaluated with E(D) and vetoed only if E(D) fails. A hop into haven
// itself always passes (E succeeds in 0 hops), so arriving home is
// never vetoed. Self-calls, combat (inCombat or combatExit), force
// calls, and game over still pass through untouched.
//
// VETOED-STEP BEHAVIOR (prereg): a vetoed homeward step strands the
// scholar where it stands — the refusal breaks the caller's walkTo
// exactly as an engine-refused hop does; no same-day re-pick, no
// injected lateral pick, no trip abort. The next day's competent
// daily re-picks from the veto-origin tile. The veto-origin E is
// recorded on every vetoed homeward hop (pass = the stay was on
// escapable ground; fail = already pocketed before the veto).
//
// BEYOND EDGE (disclosed limitation): the sim NEVER generates beyond
// tiles (looking at the map must not create ground). travelBlockage on
// an ungenerated beyond tile returns null, so the sim is optimistic
// past the edge; every simmed hop touching an ungenerated beyond tile
// is counted and reported. The census battery covers home-board
// configurations exactly; beyond-edge agreement is NOT claimed.
//
// PERCEPTION (Steve 2026-10-28, no magic lists): the guard reads only
// the scholar's own position, the lived-in haven tile, and
// Game.travelBlockage / Game.tileAt (the engine's offered-step and
// lookup checks). It never calls genDetail and never reads unrevealed
// ground beyond what travelTargets itself offers. Candidate stock is
// read from tiles the policy itself could see (travelTargets offers).
const { competent } = require('./competent');

function havenOf(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) };
  } catch (e) { return { x: 4, y: 4 }; }
}

function manhattan(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function tileKey(x, y) { return x + ',' + y; }

// travelTargets recomputed from a SIM position, in engine order.
// (game.js travelTargets: home-board tiles row-major, d>0 and
// ((d<=3 and revealed) or d==1); then orthogonal-adjacent beyond
// tiles in east, west, north, south order, skipping coords that fall
// inside the board.) simRevealed: live revealed UNION tiles stepped
// on during the sim (the real walk reveals each tile it steps on).
function offersFrom(Game, px, py, simRevealed) {
  const out = [];
  let tiles = [];
  try { tiles = (Game.map && Game.map.tiles) || []; } catch (e) { tiles = []; }
  for (let y = 0; y < tiles.length; y++) {
    const row = tiles[y] || [];
    for (let x = 0; x < row.length; x++) {
      const d = Math.abs(x - px) + Math.abs(y - py);
      let t = null;
      try { t = Game.tileAt(x, y); } catch (e) { t = null; }
      const revealed = simRevealed.has(tileKey(x, y)) || !!(t && t.revealed);
      if (d > 0 && ((d <= 3 && revealed) || d === 1)) out.push({ x, y, d });
    }
  }
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = px + dx, y = py + dy;
    if (y >= 0 && y < tiles.length && x >= 0 && x < ((tiles[y] || []).length)) continue;
    out.push({ x, y, d: 1 });
  }
  return out;
}

function boardBounds(Game) {
  let tiles = [];
  try { tiles = (Game.map && Game.map.tiles) || []; } catch (e) { tiles = []; }
  return { rows: tiles.length, cols: (i) => ((tiles[i] || []).length) };
}

// The engine's travelTo hop check, replicated exactly (game.js
// travelTo, INTERMEDIATE BLOCKAGES + BLOCKAGE PARITY): destination
// blockage from the hop origin, then for every tile on ANY shortest
// path (bounding box +-1, dS + dT == dTot), for every orthogonal
// entry origin on a shortest path (dE == dS - 1, dE + 1 + dT == dTot),
// travelBlockage(tile, entry). Returns {blockers, beyondUngenerated}.
// blockers are in engine scan order (destination first, then
// intermediates row-major, entries east/west/north/south).
function checkHop(Game, px, py, tx, ty) {
  const blockers = [];
  let beyondUngenerated = 0;
  const seenBeyond = new Set();
  const bounds = boardBounds(Game);
  const isBeyondUngenerated = (x, y) => {
    const outside = y < 0 || y >= bounds.rows || x < 0 || x >= bounds.cols(y);
    if (!outside) return false;
    let t = null;
    try { t = Game.tileAt(x, y); } catch (e) { t = null; }
    if (t) return false;
    const k = tileKey(x, y);
    if (seenBeyond.has(k)) return false;
    seenBeyond.add(k);
    return true;
  };
  if (isBeyondUngenerated(tx, ty)) beyondUngenerated++;
  let destBlock = null;
  try { destBlock = Game.travelBlockage(tx, ty, px, py) || null; } catch (e) { destBlock = { blockType: 'error' }; }
  if (destBlock) blockers.push({ x: tx, y: ty, blockType: destBlock.blockType || 'unknown' });
  const dTot = Math.abs(tx - px) + Math.abs(ty - py);
  if (dTot > 1) {
    const bx0 = Math.min(px, tx) - 1, bx1 = Math.max(px, tx) + 1;
    const by0 = Math.min(py, ty) - 1, by1 = Math.max(py, ty) + 1;
    for (let iy = by0; iy <= by1; iy++) for (let ix = bx0; ix <= bx1; ix++) {
      if ((ix === px && iy === py) || (ix === tx && iy === ty)) continue;
      const dS = Math.abs(ix - px) + Math.abs(iy - py);
      const dT = Math.abs(tx - ix) + Math.abs(ty - iy);
      if (dS === 0 || dS + dT !== dTot) continue;
      if (isBeyondUngenerated(ix, iy)) beyondUngenerated++;
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ex = ix + ox, ey = iy + oy;
        if (ex < bx0 || ex > bx1 || ey < by0 || ey > by1) continue;
        const dE = Math.abs(ex - px) + Math.abs(ey - py);
        if (dE !== dS - 1 || dE + 1 + dT !== dTot) continue;
        let ib = null;
        try { ib = Game.travelBlockage(ix, iy, ex, ey) || null; } catch (e) { ib = { blockType: 'error' }; }
        if (ib) blockers.push({ x: ix, y: iy, blockType: ib.blockType || 'unknown' });
      }
    }
  }
  return { blockers, beyondUngenerated };
}

// One hop attempt against the shared credit pool. Returns
// {pass, creditUsed, blockers, beyondUngenerated}. A hop passes on
// credit only when EVERY blocker is rubble on a SINGLE distinct tile.
function attemptHop(Game, px, py, tx, ty, pool) {
  const chk = checkHop(Game, px, py, tx, ty);
  if (chk.blockers.length === 0) return { pass: true, creditUsed: 0, blockers: chk.blockers, beyondUngenerated: chk.beyondUngenerated };
  const distinct = new Set(chk.blockers.map((b) => tileKey(b.x, b.y)));
  const allRubble = chk.blockers.every((b) => b.blockType === 'rubble');
  if (allRubble && distinct.size === 1 && pool && pool.credit > 0) {
    pool.credit--; return { pass: true, creditUsed: 1, blockers: chk.blockers, beyondUngenerated: chk.beyondUngenerated };
  }
  return { pass: false, creditUsed: 0, blockers: chk.blockers, beyondUngenerated: chk.beyondUngenerated };
}

// Full walkTo-faithful return simulation against a SHARED credit pool.
// extraRevealed: tiles the scholar has already walked in this escape
// evaluation (lateral steps), treated as revealed for later sub-sims.
// Returns {ok, reason, creditUsed, hops, beyondUngenerated, path}.
function simulateReturnPool(Game, sx, sy, hx, hy, pool, extraRevealed) {
  let creditUsed = 0, hops = 0, beyondUngenerated = 0;
  const simRevealed = new Set([tileKey(sx, sy)]);
  if (extraRevealed) for (const k of extraRevealed) simRevealed.add(k);
  const path = [{ x: sx, y: sy }];
  let cx = sx, cy = sy;
  const fail = (reason) => ({ ok: false, reason, creditUsed, hops, beyondUngenerated, path });
  while (!(cx === hx && cy === hy)) {
    if (hops >= 10) return fail('step-cap');
    const offers = offersFrom(Game, cx, cy, simRevealed);
    if (!offers.length) return fail('no-offers');
    let best = null, bd = Infinity;
    for (const tt of offers) {
      const d = manhattan(tt.x, tt.y, hx, hy);
      if (d < bd) { bd = d; best = tt; }
    }
    const att = attemptHop(Game, cx, cy, best.x, best.y, pool);
    beyondUngenerated += att.beyondUngenerated;
    if (!att.pass) return fail('blocked:' + (att.blockers[0].blockType || 'unknown'));
    creditUsed += att.creditUsed;
    cx = best.x; cy = best.y;
    simRevealed.add(tileKey(cx, cy));
    path.push({ x: cx, y: cy });
    hops++;
  }
  return { ok: true, reason: null, creditUsed, hops, beyondUngenerated, path };
}

// Predecessor-compatible wrapper: opts.credit defaults to 1 (a fresh
// pool of that size); pass 0 for the no-credit census core, which must
// agree EXACTLY with the real walkTo.
function simulateReturnJump(Game, sx, sy, hx, hy, opts) {
  const creditStart = (opts && opts.credit !== undefined) ? opts.credit : 1;
  const pool = { credit: creditStart };
  return simulateReturnPool(Game, sx, sy, hx, hy, pool, null);
}

// Forage candidates from a sim position, as competent.js
// forageTripSeedFirst reads them: travelTargets offers whose tile is
// stocked (>0, sim stock overriding live stock for picked-clean tiles)
// and is not haven/ruin, sorted unblocked-first (destination
// travelBlockage from the sim position, as the policy computes it)
// then by distance d then offer order. Beyond tiles with no tile
// object are skipped (the sim never generates ground).
function lateralCandidates(Game, px, py, simRevealed, simStock) {
  const out = [];
  const offers = offersFrom(Game, px, py, simRevealed);
  for (const tt of offers) {
    let t = null;
    try { t = Game.tileAt(tt.x, tt.y); } catch (e) { t = null; }
    if (!t) continue;
    if (t.type === 'haven' || t.type === 'ruin') continue;
    const k = tileKey(tt.x, tt.y);
    const stock = simStock.has(k) ? simStock.get(k) : (t.stock || 0);
    if (!(stock > 0)) continue;
    let blocked = false, blockType = null;
    try { const b = Game.travelBlockage(tt.x, tt.y, px, py); blocked = !!b; blockType = b && b.blockType; } catch (e) {}
    out.push({ x: tt.x, y: tt.y, d: tt.d, blocked, blockType });
  }
  out.sort((a, b) => (a.blocked - b.blocked) || (a.d - b.d));
  return out;
}

// THE ESCAPE CHECK E(D): direct walkTo-faithful sim, else up to 4
// lateral legs (each leg: direct sim from the lateral position, else
// one stocked forage pick via a single jump-faithful hop). One credit
// pool shared across the whole evaluation. Returns
// {ok, via ('direct'|'lateral'|null), directOk, legs, lateralPath,
//  creditUsed, hops, beyondUngenerated, reason}.
function escapeCheck(Game, sx, sy, hx, hy) {
  const pool = { credit: 1 };
  let creditUsed = 0, hops = 0, beyondUngenerated = 0;
  const direct = simulateReturnPool(Game, sx, sy, hx, hy, pool, null);
  creditUsed += direct.creditUsed; hops += direct.hops; beyondUngenerated += direct.beyondUngenerated;
  if (direct.ok) return { ok: true, via: 'direct', directOk: true, legs: 0, lateralPath: [], creditUsed, hops, beyondUngenerated, reason: null };
  const MAX_LEGS = 4;
  const simRevealed = new Set([tileKey(sx, sy)]);
  const simStock = new Map();
  const lateralPath = [{ x: sx, y: sy }];
  let cx = sx, cy = sy;
  for (let leg = 0; leg < MAX_LEGS; leg++) {
    const sub = simulateReturnPool(Game, cx, cy, hx, hy, pool, simRevealed);
    creditUsed += sub.creditUsed; hops += sub.hops; beyondUngenerated += sub.beyondUngenerated;
    if (sub.ok) return { ok: true, via: 'lateral', directOk: false, legs: leg, lateralPath, creditUsed, hops, beyondUngenerated, reason: null };
    const cands = lateralCandidates(Game, cx, cy, simRevealed, simStock);
    let moved = false;
    for (const c of cands) {
      const att = attemptHop(Game, cx, cy, c.x, c.y, pool);
      beyondUngenerated += att.beyondUngenerated;
      if (!att.pass) continue;
      creditUsed += att.creditUsed;
      cx = c.x; cy = c.y;
      simRevealed.add(tileKey(cx, cy));
      simStock.set(tileKey(cx, cy), 0);
      lateralPath.push({ x: cx, y: cy });
      moved = true;
      break;
    }
    if (!moved) return { ok: false, via: null, directOk: false, legs: leg, lateralPath, creditUsed, hops, beyondUngenerated, reason: 'no-lateral-candidate' };
  }
  return { ok: false, via: null, directOk: false, legs: MAX_LEGS, lateralPath, creditUsed, hops, beyondUngenerated, reason: 'lateral-cap' };
}

// Installs the guarded travelTo on Game; returns a restore function.
// opts.shadow: run the check and log, never veto, never say.
// Exported so the proof test can exercise the wrapper without a full game.
function installGuard(Game, ctx, opts) {
  const shadow = !!(opts && opts.shadow);
  const origTravelTo = Game.travelTo;
  if (typeof origTravelTo !== 'function') return () => {};
  let inOrig = false;
  Game.travelTo = function (x, y, force, combatExit) {
    try {
      if (inOrig) return origTravelTo.apply(this, arguments);
      if (!Game || Game.over) return origTravelTo.apply(this, arguments);
      try { if (Game.inCombat && Game.inCombat()) return origTravelTo.apply(this, arguments); } catch (e) {}
      if (combatExit || force) return origTravelTo.apply(this, arguments);
      const px = Game.map.px, py = Game.map.py;
      if (x === px && y === py) return origTravelTo.apply(this, arguments); // self-call: tent-clearing side effects
      const hv = havenOf(Game);
      const dCur = manhattan(px, py, hv.x, hv.y);
      const dDest = manhattan(x, y, hv.x, hv.y);
      const isHomeward = dDest < dCur; // evaluated, NOT exempt (this arm's change)
      const esc = escapeCheck(Game, x, y, hv.x, hv.y);
      // DEPLOY (sim-guarde-deploy-b): entry-checked allow' — the hop
      // is allowed only if E passes AND the hop itself is
      // engine-crossable from this origin (raw checkHop, no credit).
      // vetoCause: 'escape' when E fails (the old veto set),
      // 'entry' when E passes but entry is blocked (the new vetoes).
      const entry = checkHop(Game, px, py, x, y);
      const entryBlockers = (entry.blockers || []).map((b) => b.blockType || 'unknown');
      const allowPrime = !!esc.ok && entryBlockers.length === 0;
      const vetoCause = !esc.ok ? 'escape' : (!allowPrime ? 'entry' : null);
      if (ctx) {
        ctx.homewardstepSimChecks = (ctx.homewardstepSimChecks || 0) + 1;
        ctx.homewardstepBeyondUngenerated = (ctx.homewardstepBeyondUngenerated || 0) + (esc.beyondUngenerated || 0);
        if (esc.creditUsed) ctx.homewardstepCreditUses = (ctx.homewardstepCreditUses || 0) + esc.creditUsed;
        if (esc.ok && !esc.directOk) ctx.homewardstepLateralPasses = (ctx.homewardstepLateralPasses || 0) + 1;
        try {
          (ctx.homewardstepHopLog = ctx.homewardstepHopLog || []).push({
            from: { x: px, y: py }, to: { x, y },
            simOk: !!esc.ok, directOk: !!esc.directOk, via: esc.via || null,
            legs: esc.legs || 0, creditUsed: esc.creditUsed || 0,
            vetoed: false, homeward: !!isHomeward, originSimOk: null, silent: false, shadow: !!shadow,
            allowPrime: !!allowPrime, vetoCause, entryBlockers,
          });
          if (ctx.homewardstepHopLog.length > 20000) ctx.homewardstepHopLog.splice(0, ctx.homewardstepHopLog.length - 20000);
        } catch (e) {}
      }
      if (allowPrime || shadow) {
        inOrig = true;
        try { return origTravelTo.apply(this, arguments); } finally { inOrig = false; }
      }
      // VETO (when NOT allow': E fails, or E passes but entry is
      // blocked): the scholar stays. walkTo breaks
      // cleanly on no-move; a forage trip tries its next candidate,
      // as it does for any refused hop. VETO MEMORY: first veto of a
      // destination says the line; repeats are silent, still vetoed.
      let silent = false;
      try {
        if (!ctx) silent = false;
        else {
          if (!ctx.homewardstepVetoMemory || !(ctx.homewardstepVetoMemory instanceof Set)) ctx.homewardstepVetoMemory = new Set();
          const k = tileKey(x, y);
          if (ctx.homewardstepVetoMemory.has(k)) silent = true;
          else ctx.homewardstepVetoMemory.add(k);
        }
      } catch (e) { silent = false; }
      if (isHomeward) {
        if (ctx) {
          ctx.homewardstepHomewardVetoes = (ctx.homewardstepHomewardVetoes || 0) + 1;
          try {
            const oesc = escapeCheck(Game, px, py, hv.x, hv.y);
            if (oesc.ok) ctx.homewardstepVetoOriginPass = (ctx.homewardstepVetoOriginPass || 0) + 1;
            else ctx.homewardstepVetoOriginFail = (ctx.homewardstepVetoOriginFail || 0) + 1;
            const log = ctx.homewardstepHopLog || [];
            if (log.length) log[log.length - 1].originSimOk = !!oesc.ok;
          } catch (e) {}
        }
      }
      if (ctx) {
        ctx.homewardstepVetoes = (ctx.homewardstepVetoes || 0) + 1;
        if (vetoCause === 'entry') ctx.homewardstepEntryVetoes = (ctx.homewardstepEntryVetoes || 0) + 1;
        if (silent) ctx.homewardstepSilentVetoes = (ctx.homewardstepSilentVetoes || 0) + 1;
        else ctx.homewardstepSpokenVetoes = (ctx.homewardstepSpokenVetoes || 0) + 1;
        try {
          const log = ctx.homewardstepHopLog || [];
          if (log.length) { log[log.length - 1].vetoed = true; log[log.length - 1].silent = !!silent; }
        } catch (e) {}
      }
      if (!silent) {
        // Veto line by cause (sim-guarde-deploy-b decision (a)):
        // entry vetoes name the blocked step, escape vetoes keep
        // the old line. A both-blocked hop is an escape veto.
        try { Game.say(vetoCause === 'entry' ? "You can't step there — you couldn't get in from here." : "You don't walk there — you couldn't get home from there."); } catch (e) {}
      }
      let block = null;
      try { block = Game.travelBlockage(x, y); } catch (e) {}
      if (block) return block;
      return { blockType: 'homewardstep', vetoed: true };
    } catch (e) {
      // Never break the game on guard failure: fall back to real travel.
      try { inOrig = true; return origTravelTo.apply(this, arguments); } finally { inOrig = false; }
    }
  };
  return () => { Game.travelTo = origTravelTo; };
}

function dailyWithGuard(Game, ctx, shadow) {
  const restore = installGuard(Game, ctx, { shadow: !!shadow });
  try { competent.daily(Game, ctx); } finally { restore(); }
}

const homewardstep = Object.assign({}, competent, {
  daily(Game, ctx) { dailyWithGuard(Game, ctx, false); },
});

const homewardstepShadow = Object.assign({}, competent, {
  daily(Game, ctx) { dailyWithGuard(Game, ctx, true); },
});

module.exports = { homewardstep, homewardstepShadow, installGuard, simulateReturnJump, checkHop, offersFrom, escapeCheck, lateralCandidates, havenOf };
