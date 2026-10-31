#!/usr/bin/env node
// heraldpos-instrument-20261031.js — Herald POSITION instrument
// (sim-heraldpos-a, 2026-10-31, axis scale-onramp). DIAGNOSTIC — no lever.
//
// Answers, on the heraldcontact pilot band, where titanPlace puts the
// Herald's lair, whether the placed Herald moves, and how often any
// villager tile coincides with / comes adjacent to its tile.
//
// Env-gated on HERALDPOS=1. Contract: instrumentOn(), install(Game, t),
// uninstall; when unset the wrappers are never installed and the sim path
// is byte-identical to base — the proof test's det-gate pins that via a
// recorder-on/off re-run comparison on a judged located seed.
//
// PURITY RULE (stricter than the herald instrument, on purpose): this
// file calls NO Game method. npcNode() CREATES a default nodePos entry
// and worldMonsters() CREATES the array, so both are avoided: every read
// below is a direct property read on Game.state / Game.map / Game.data.
// A roster villager with no nodePos entry is recorded at the Haven tile
// by the game's own default rule (npcNode: hx = village px ?? 4), flagged
// inferred:true, WITHOUT materialising the entry. The recorder writes
// ONLY to its own store object, draws zero RNG, and never touches
// Game.state. Wrappers are call-through; a thrown recorder error is
// caught into t.instrumentErrors and never swallowed into the game
// (the original call still runs; a throw inside a wrapper's pre-read
// must not change the call — pre-reads are isolated in try/catch).
//
// Wraps:
//   Game.say — placement-line capture: any line containing 'lair' or
//     'HERALD'/'Herald' is stored with the live Herald entry, player
//     tile, and Haven tile at that moment. The spoken tile is parsed
//     from 'tile X,Y' when present and cross-checked against the entry.
//   Game.sleep — ONE daily census row per sleep (day = scholar day at
//     sleep entry, as in the herald instrument).
//   Game.wanderWorldMonsters — before/after Herald tile; a change is
//     one MOVE row (wander-attributed by construction: the move
//     happened inside this call).
//   Game.worldTick — after-call tick census row per tile entry while
//     a Herald entry exists (intra-day resolution; a fight can
//     remove/move the monster before sleep, and a sleep-only census
//     would miss it).
// The sweep takes a final snapshot after runDays (t.final) so the
// census covers placement..end even if the last day has no sleep.
//
// Row fields (daily + tick + final, identical shape):
//   day, kind, herald{tx,ty,mx,my,hp}, player{x,y}, haven{x,y},
//   distHaven (Manhattan), distPlayer (Manhattan),
//   nearest{vid,man,cheb} | null, nOn, onVids, nAdj, adjVids,
//   nAway (roster nodes != Haven), nNodes (distinct villager nodes),
//   nodeList (daily rows only: distinct 'x,y' villager nodes).
// Adjacent = Chebyshev distance 1 (any of the 8 neighbours).
// Coincide = same tile (Manhattan 0). Villager nodes are roster
// nodes exactly as villagerMonsterTick reads them (roster, minus the
// player id); the game's own contact logic uses the same set, so a
// stale node for a villager who died on a tile is a game-faithful
// read, flagged in the analyzer by cross-checking field fights and
// the sweep deaths list rather than silently filtered here.
'use strict';

function instrumentOn() { return process.env.HERALDPOS === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function heraldEntry(Game) {
  try {
    const arr = ((Game.state || {}).worldMonsters) || [];
    for (let i = 0; i < arr.length; i++) {
      const m = arr[i];
      if (m && m.id === 'herald') return m;
    }
    return null;
  } catch (e) { return null; }
}

function havenTile(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { x: (v.px != null ? v.px : 4), y: (v.py != null ? v.py : 4) };
  } catch (e) { return { x: 4, y: 4 }; }
}

function playerTile(Game) {
  try {
    const mp = Game.map || {};
    return { x: (mp.px != null ? mp.px : null), y: (mp.py != null ? mp.py : null) };
  } catch (e) { return { x: null, y: null }; }
}

function tileTypeOf(Game, x, y) {
  try {
    const tiles = (Game.map || {}).tiles || [];
    const row = tiles[y] || [];
    const cell = row[x];
    if (!cell) return null;
    if (typeof cell === 'string') return cell;
    return cell.type || null;
  } catch (e) { return null; }
}

function man(ax, ay, bx, by) { return Math.abs(ax - bx) + Math.abs(ay - by); }
function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }

// Pure villager-node snapshot: roster ids (minus the player) mapped
// through state.village.nodePos only. No Game method is called.
function villagerNodes(Game) {
  const out = [];
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    const pos = v.nodePos || {};
    const hv = havenTile(Game);
    const self = Game.villagerId;
    for (let i = 0; i < roster.length; i++) {
      const rid = roster[i];
      if (rid === self) continue;
      const n = pos[rid];
      if (n && typeof n.nx === 'number' && typeof n.ny === 'number') {
        out.push({ vid: rid, x: n.nx, y: n.ny, inferred: false });
      } else {
        out.push({ vid: rid, x: hv.x, y: hv.y, inferred: true });
      }
    }
  } catch (e) {}
  return out;
}

function censusRow(Game, kind, withNodeList) {
  const ent = heraldEntry(Game);
  if (!ent || typeof ent.tx !== 'number' || typeof ent.ty !== 'number') return null;
  const pl = playerTile(Game);
  const hv = havenTile(Game);
  const nodes = villagerNodes(Game);
  let nearest = null;
  const onVids = [], adjVids = [];
  let nAway = 0;
  const nodeSet = {};
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const m = man(n.x, n.y, ent.tx, ent.ty);
    const c = cheb(n.x, n.y, ent.tx, ent.ty);
    if (m === 0) onVids.push(n.vid);
    if (c === 1) adjVids.push(n.vid);
    if (n.x !== hv.x || n.y !== hv.y) nAway++;
    nodeSet[n.x + ',' + n.y] = 1;
    if (!nearest || m < nearest.man || (m === nearest.man && c < nearest.cheb)) {
      nearest = { vid: n.vid, man: m, cheb: c };
    }
  }
  const row = {
    day: gday(Game), kind: kind,
    herald: { tx: ent.tx, ty: ent.ty, mx: (ent.mx != null ? ent.mx : null), my: (ent.my != null ? ent.my : null), hp: (ent.hp != null ? ent.hp : null) },
    player: pl, haven: hv,
    distHaven: man(ent.tx, ent.ty, hv.x, hv.y),
    distPlayer: (pl.x != null && pl.y != null) ? man(ent.tx, ent.ty, pl.x, pl.y) : null,
    playerCoincide: (pl.x === ent.tx && pl.y === ent.ty),
    playerAdjacent: (pl.x != null && pl.y != null) ? (cheb(ent.tx, ent.ty, pl.x, pl.y) === 1) : false,
    nearest: nearest, nOn: onVids.length, onVids: onVids,
    nAdj: adjVids.length, adjVids: adjVids,
    nAway: nAway, nNodes: Object.keys(nodeSet).length,
    tileType: tileTypeOf(Game, ent.tx, ent.ty),
  };
  if (withNodeList) row.nodeList = Object.keys(nodeSet).sort();
  return row;
}

// install(Game, t): t = {placement, daily, tick, moves, sayLines,
// instrumentErrors}. Returns {uninstall, finalSnapshot}.
function install(Game, t) {
  if (!t.placement) t.placement = [];
  if (!t.daily) t.daily = [];
  if (!t.tick) t.tick = [];
  if (!t.moves) t.moves = [];
  if (!t.sayLines) t.sayLines = [];
  if (!t.instrumentErrors) t.instrumentErrors = [];
  const orig = {};

  function pushDaily() {
    try {
      const row = censusRow(Game, 'daily', true);
      if (row) t.daily.push(row);
    } catch (e) { err(t, 'daily', e); }
  }

  if (typeof Game.say === 'function') {
    const o = Game.say;
    orig.say = o;
    Game.say = function () {
      let line = '';
      try {
        line = Array.prototype.map.call(arguments, function (a) { return (a === undefined || a === null) ? '' : String(a); }).join(' ');
      } catch (e) {}
      const r = o.apply(this, arguments);
      try {
        if (line && (/lair/i.test(line) || /HERALD/.test(line) || /Herald/.test(line))) {
          const ent = heraldEntry(Game);
          const pl = playerTile(Game);
          const hv = havenTile(Game);
          const spoken = (function () {
            const m = /tile (\d+),(\d+)/.exec(line);
            return m ? { x: parseInt(m[1], 10), y: parseInt(m[2], 10) } : null;
          })();
          const rec = {
            day: gday(Game), line: line,
            spoken: spoken,
            entry: ent ? { tx: ent.tx, ty: ent.ty, mx: ent.mx, my: ent.my, hp: ent.hp } : null,
            agrees: !!(spoken && ent && spoken.x === ent.tx && spoken.y === ent.ty),
            player: pl, haven: hv,
            distHaven: (ent ? man(ent.tx, ent.ty, hv.x, hv.y) : null),
            distPlayer: (ent && pl.x != null && pl.y != null) ? man(ent.tx, ent.ty, pl.x, pl.y) : null,
            tileType: (ent ? tileTypeOf(Game, ent.tx, ent.ty) : null),
          };
          t.sayLines.push(rec);
          if (/Scouts found its lair/.test(line)) t.placement.push(rec);
        }
      } catch (e) { err(t, 'say', e); }
      return r;
    };
  } else { err(t, 'install.missing:say', new Error('not a function')); }

  if (typeof Game.sleep === 'function') {
    const o = Game.sleep;
    orig.sleep = o;
    Game.sleep = function () {
      pushDaily();
      return o.apply(this, arguments);
    };
  } else { err(t, 'install.missing:sleep', new Error('not a function')); }

  if (typeof Game.wanderWorldMonsters === 'function') {
    const o = Game.wanderWorldMonsters;
    orig.wanderWorldMonsters = o;
    Game.wanderWorldMonsters = function () {
      let before = null;
      try {
        const ent = heraldEntry(Game);
        if (ent) before = { tx: ent.tx, ty: ent.ty };
      } catch (e) { err(t, 'wander.before', e); }
      const r = o.apply(this, arguments);
      try {
        const ent = heraldEntry(Game);
        const after = ent ? { tx: ent.tx, ty: ent.ty } : null;
        if (before && after && (before.tx !== after.tx || before.ty !== after.ty)) {
          t.moves.push({ day: gday(Game), kind: 'wander', from: before, to: after, stepMan: man(before.tx, before.ty, after.tx, after.ty) });
        } else if (before && !after) {
          t.moves.push({ day: gday(Game), kind: 'vanished', from: before, to: null, stepMan: null });
        } else if (!before && after) {
          t.moves.push({ day: gday(Game), kind: 'appeared', from: null, to: after, stepMan: null });
        }
      } catch (e) { err(t, 'wander.after', e); }
      return r;
    };
  } else { err(t, 'install.missing:wanderWorldMonsters', new Error('not a function')); }

  if (typeof Game.worldTick === 'function') {
    const o = Game.worldTick;
    orig.worldTick = o;
    Game.worldTick = function () {
      const r = o.apply(this, arguments);
      try {
        const row = censusRow(Game, 'tick', false);
        if (row) t.tick.push(row);
      } catch (e) { err(t, 'worldTick', e); }
      return r;
    };
  } else { err(t, 'install.missing:worldTick', new Error('not a function')); }

  function finalSnapshot() {
    try {
      const row = censusRow(Game, 'final', true);
      if (row) t.final = row;
      else t.final = null;
    } catch (e) { err(t, 'final', e); t.final = null; }
    return t.final;
  }

  function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  }

  return { uninstall: uninstall, finalSnapshot: finalSnapshot };
}

module.exports = { instrumentOn, install, censusRow, heraldEntry, havenTile, playerTile, man, cheb, villagerNodes };
