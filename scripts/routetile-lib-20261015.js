// routetile-lib-20261015.js — route tile-type instrument for sim-findings
// #292 (RANGING WITHOUT WILD FILLS): were wild water tiles on-route and
// unfilled, or never on-route?
//
// INSTRUMENT ONLY — zero src/js changes. Harness-side call-through wraps
// (the rangedehy-lib pattern). Wraps Game.travelTo (arrivals: day, from, to,
// destination tile type, pack at travel) and Game.fillWater (fills with
// position + pack before/after). Refusal detection needs no say-wrap: a fill
// that gains no bottle is a refused fill (the rangedehy instrument captures
// the phrases; this one measures the gap).
//
// finalize() joins arrivals to fills with a monotonic travel counter: a
// water-tile visit (travel #N arriving on creek/wetland/pond) is FILLED iff
// a gained fill happened at the same tile with afterTravelN == N (i.e.
// before the next travel). Haven fills and wild fills are counted
// separately — the #292 question is the wild-fill share of water visits.
//
// Usage:
//   const { installRouteTile } = require('./routetile-lib-20261015');
//   const track = installRouteTile(Game);   // AFTER setupGame, before runDays
//   ... runDays(Game, policy, opts) ...
//   const rep = track.finalize();
//
// Byte-identicality (instrument honesty) is proven by
// scripts/test-rangerefill-20261015.js PART E (instrumented-vs-pristine
// det-gate, gate-off policy).
'use strict';

const WILD_WATER = new Set(['creek', 'wetland', 'pond']); // engine-exact fillable set

function installRouteTile(Game) {
  const track = {
    travels: [], // {day, n, from{x,y}, to{x,y}, destType, moved, pack, combatExit}
    fills: [],   // {day, afterTravelN, x, y, tileType, atHaven, gained, packBefore, packAfter}
    instrErrors: [],
    _travelN: 0,
    _haven: { hx: 4, hy: 4 },
  };
  const note = (where, e) => { track.instrErrors.push(where + ': ' + (e && e.message)); };
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const pos = () => { try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return { x: null, y: null }; } };
  const tileType = (x, y) => { try { const t = Game.tileAt(x, y); return (t && t.type) || null; } catch (e) { return null; } };
  const packN = () => { try { return (Game.state.scholar.water || []).length; } catch (e) { return null; } };
  const atHavenNow = () => { try { return !!Game.playerAtHaven(); } catch (e) { return false; } };
  try {
    const v = Game.state.village || {};
    track._haven = { hx: v.px != null ? v.px : 4, hy: v.py != null ? v.py : 4 };
  } catch (e) {}

  // ---- travelTo: arrivals ----
  try {
    if (typeof Game.travelTo !== 'function') { note('missingTravelTo', new Error('no Game.travelTo')); }
    else {
      const orig = Game.travelTo.bind(Game);
      Game.travelTo = function (x, y, force, combatExit) {
        const p0 = pos(), pk0 = packN();
        let ret;
        try { ret = orig.apply(this, arguments); }
        catch (e) { throw e; }
        try {
          track._travelN++;
          const p1 = pos();
          track.travels.push({
            day: gday(), n: track._travelN,
            from: p0, to: { x, y },
            destType: tileType(x, y),
            moved: (p1.x === x && p1.y === y),
            pack: packN(), packBefore: pk0,
            combatExit: !!combatExit,
          });
        } catch (e) { note('travel', e); }
        return ret;
      };
    }
  } catch (e) { note('wrapTravelTo', e); }

  // ---- fillWater: fills with position (refusal = no bottle gained) ----
  try {
    if (typeof Game.fillWater !== 'function') { note('missingFillWater', new Error('no Game.fillWater')); }
    else {
      const orig = Game.fillWater.bind(Game);
      Game.fillWater = function () {
        const p = pos(), pk0 = packN(), ah = atHavenNow();
        const entry = {
          day: gday(), afterTravelN: track._travelN,
          x: p.x, y: p.y, tileType: tileType(p.x, p.y), atHaven: ah,
          gained: false, packBefore: pk0, packAfter: pk0,
        };
        let ret;
        try { ret = orig.apply(this, arguments); }
        finally {
          try { entry.packAfter = packN(); } catch (e) {}
          entry.gained = (entry.packAfter || 0) > (entry.packBefore || 0);
          track.fills.push(entry);
        }
        return ret;
      };
    }
  } catch (e) { note('wrapFillWater', e); }

  track.finalize = function () { return finalizeRouteTile(Game, track); };
  return track;
}

function finalizeRouteTile(Game, track) {
  // water-tile visits: successful arrivals on creek/wetland/pond
  const visits = track.travels.filter(t => t.moved && WILD_WATER.has(t.destType));
  // gained fills keyed by (afterTravelN, x, y)
  const fillKeys = new Set();
  for (const f of track.fills) {
    if (f.gained) fillKeys.add(f.afterTravelN + '|' + f.x + '|' + f.y);
  }
  let filledVisits = 0;
  const visitRows = [];
  for (const v of visits) {
    const filled = fillKeys.has(v.n + '|' + v.to.x + '|' + v.to.y);
    if (filled) filledVisits++;
    if (visitRows.length < 300) {
      visitRows.push({ day: v.day, to: v.to, destType: v.destType, pack: v.pack, filled });
    }
  }
  const havenFills = track.fills.filter(f => f.gained && f.atHaven).length;
  const wildFills = track.fills.filter(f => f.gained && !f.atHaven).length;
  return {
    nTravels: track.travels.length,
    nMoved: track.travels.filter(t => t.moved).length,
    haven: track._haven, // for dist>1 "true wild" visit analysis
    nWaterTileVisits: visits.length,
    nFilledVisits: filledVisits,
    nUnfilledVisits: visits.length - filledVisits,
    wildFillShareOfVisits: visits.length ? +(filledVisits / visits.length).toFixed(4) : null,
    havenFills,
    wildFills,
    nFills: track.fills.filter(f => f.gained).length,
    nFillCalls: track.fills.length,
    refusedFills: track.fills.filter(f => !f.gained).length,
    visits: visitRows,
    instrErrors: track.instrErrors,
  };
}

module.exports = { installRouteTile, finalizeRouteTile, WILD_WATER };
