// policies/creekseek-b.js — competent + an evening creek stop + the
// nightly trip home. POLICY-SIDE ONLY: zero src/js changes.
//
// sim-strandwide-b (prereg: evidence/2026-11-01/
// sim-strandwide-b-prereg.md, committed BEFORE any judged leg).
//
// The blank (sim-strandtile-b, NO-GO on the count bar): on the P1
// nighttravel stack the strand rate lives only on two named seeds
// (17513, 17511) because creek-tile evenings are vanishingly rare
// (7 in 24 legs, all on 2 seeds). This policy tests whether a
// villager who is ALREADY away at day's end can be put at creeks:
// after competent.daily, before nighttravel's nightStep, step to
// the nearest engine-offered creek tile and then let the evening
// return step run unchanged. If the creek is within a haven hop,
// the villager goes home (a creek VISIT, counted nowhere in the
// strand numbers); if haven is out of reach, the evening is a
// creek-tile evening and the FAILED-RETURN machinery classifies
// it exactly as on P1.
//
// Guards (perception-lawful, own senses only): the policy reads
// its own tile, the engine's offered travel targets, and the haven
// node it lives in. It never drags a home villager out (at-haven
// evenings skip), never overrides a deliberate tent camp, never
// forces a hop, never clears a blockage, never routes around.
// It draws NO RNG: nearest by Manhattan distance, tie-break
// lowest x then lowest y. Gate CREEKSEEK_B=1, default OFF: with
// the gate off the policy is P1 (competent + nightStep, no move),
// so a gate-off leg is a pure baseline-equivalence check.
// The night step itself is nighttravel's exported nightStep,
// imported — not copied — so the evening return step is
// byte-identical to P1's, with nighttravel.daily's ctx
// bookkeeping (ctx._ntLast, ntEvenings counters).
//
// Narration: a successful creek move says one line (the move is
// otherwise a silent engine hop, and no silent actions is a
// standing rule). The line is the policy's own, disclosed in the
// evidence, and it fires only on a move that actually happened.
'use strict';
const { competent } = require('./competent');
const { nightStep } = require('./nighttravel');

function creekseekOn() {
  try { return process.env.CREEKSEEK_B === '1'; } catch (e) { return false; }
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

function havenCoords(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { hx: (v.px === undefined ? 4 : v.px), hy: (v.py === undefined ? 4 : v.py) };
  } catch (e) { return { hx: 4, hy: 4 }; }
}

// Pure decision function (unit-tested by scripts/test-creekseek-b.js).
// Inputs are reads only; no Game calls, no RNG.
//   o = { gateOn, gameOver, combat, inTent, atHaven, tile,
//         targets: [{x, y, type}], curPx, curPy }
// Returns { act: false, skip } or { act: true, to: {x, y}, distance }.
function creekseekDecision(o) {
  if (!o || !o.gateOn) return { act: false, skip: 'lever-off' };
  if (o.gameOver) return { act: false, skip: 'game-over' };
  if (o.combat) return { act: false, skip: 'combat' };
  if (o.inTent) return { act: false, skip: 'in-tent' };
  if (o.atHaven) return { act: false, skip: 'at-haven' };
  if (o.tile === 'creek') return { act: false, skip: 'already-creek' };
  const targets = Array.isArray(o.targets) ? o.targets : [];
  const creeks = targets.filter((t) => t && t.type === 'creek');
  if (!creeks.length) return { act: false, skip: 'no-creek-offered' };
  let best = null;
  for (const t of creeks) {
    const d = Math.abs(t.x - o.curPx) + Math.abs(t.y - o.curPy);
    if (!best || d < best.distance ||
        (d === best.distance && (t.x < best.to.x ||
          (t.x === best.to.x && t.y < best.to.y)))) {
      best = { to: { x: t.x, y: t.y }, distance: d };
    }
  }
  return { act: true, to: best.to, distance: best.distance };
}

// The engine step. Returns a record; the driver cross-checks it
// against its own position snapshots (pre-move, post-step) and
// records it as row.creekseek.
function creekMove(Game, ctx) {
  const rec = { attempted: false };
  try {
    const sch = (Game.state || {}).scholar || {};
    if (Game.over) { rec.skip = 'game-over'; return rec; }
    if (combatLive(Game)) { rec.skip = 'combat'; return rec; }
    if (sch.insideTent === true) { rec.skip = 'in-tent'; return rec; }
    let tile = null;
    try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
    rec.tileBefore = tile;
    const { hx, hy } = havenCoords(Game);
    const curPx = (Game.map ? Game.map.px : null);
    const curPy = (Game.map ? Game.map.py : null);
    rec.from = { tile, mapPx: curPx, mapPy: curPy };
    const atHaven = (sch.insideHaven === true) || (tile === 'haven') ||
      (curPx === hx && curPy === hy);
    if (atHaven) { rec.skip = 'at-haven'; return rec; }
    const dec = creekseekDecision({
      gateOn: creekseekOn(), gameOver: !!Game.over, combat: false,
      inTent: false, atHaven: false, tile,
      targets: (() => {
        try {
          return (Game.travelTargets() || []).map((t) => {
            let type = null;
            try { const tt = Game.tileAt(t.x, t.y); type = tt ? (tt.type || null) : null; } catch (e) {}
            return { x: t.x, y: t.y, type };
          });
        } catch (e) { return []; }
      })(),
      curPx, curPy,
    });
    if (!dec.act) { rec.skip = dec.skip; return rec; }
    // ONE honest hop, no force. Judge by position change, not by
    // the return value (success falls off the end: undefined).
    rec.attempted = true;
    rec.to = dec.to;
    rec.distance = dec.distance;
    let hopErr = null;
    try { Game.travelTo(dec.to.x, dec.to.y); } catch (e) { hopErr = String(e && e.message).slice(0, 120); }
    rec.hopError = hopErr;
    const afterPx = (Game.map ? Game.map.px : null);
    const afterPy = (Game.map ? Game.map.py : null);
    rec.arrival = { mapPx: afterPx, mapPy: afterPy };
    if (Game.over) { rec.outcome = 'travel-died'; return rec; }
    if (afterPx !== dec.to.x || afterPy !== dec.to.y) {
      rec.outcome = 'travel-refused'; return rec;
    }
    if (combatLive(Game)) { rec.outcome = 'arrived-combat'; return rec; }
    rec.outcome = 'moved-to-creek';
    try { Game.say('You make for the creek to drink before night.'); } catch (e) {}
    return rec;
  } catch (e) {
    rec.outcome = 'step-error';
    rec.error = String(e && e.message).slice(0, 160);
    return rec;
  }
}

const creekseek = Object.assign({}, competent, {
  id: 'creekseek',
  desc: 'competent + evening creek stop when already away + nightly trip home when within one travel hop',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    if (Game.over) {
      ctx._ntLast = { outcome: 'game-over', method: null };
      ctx._csLast = { attempted: false, skip: 'game-over' };
      return;
    }
    let csRec = null;
    try { csRec = creekMove(Game, ctx); } catch (e) {
      csRec = { attempted: false, outcome: 'step-error', error: String(e && e.message).slice(0, 160) };
    }
    try { ctx._csLast = csRec; } catch (e) {}
    if (Game.over) {
      ctx._ntLast = { outcome: 'game-over', method: null };
      return;
    }
    const rec = nightStep(Game, ctx);
    ctx._ntLast = rec;
    ctx.ntEvenings = ctx.ntEvenings || {};
    ctx.ntEvenings[rec.outcome] = (ctx.ntEvenings[rec.outcome] || 0) + 1;
    if (rec.outcome === 'completed' || rec.outcome === 'already-inside') {
      ctx.ntInsideEvenings = (ctx.ntInsideEvenings || 0) + 1;
    }
    if (rec.before && rec.before.tile !== 'haven' && (rec.outcome === 'completed' || rec.outcome === 'already-inside')) {
      ctx.ntConvertedAway = (ctx.ntConvertedAway || 0) + 1;
    }
  },
});

module.exports = { creekseek, creekseekDecision, creekMove, havenCoords };
