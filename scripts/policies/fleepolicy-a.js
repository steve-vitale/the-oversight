// fleepolicy-a — flee-choosing policy instrument for sim-fleepolicy-a
// (2026-10-30, flesh-out loop, axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes. Default OFF: FLEEPOLICY
// unset or not '1' -> fight delegates to the base fight untouched
// (the gate-off path is pinned by a fixture in
// scripts/test-fleepolicy-a.js). The policy wraps tableseat-nowait
// (the fledcover-a stack: leanlinkrescue courtship + seat legs, NO
// wait leg); only its fight method is overridden, daily is the
// base daily untouched.
//
// WHAT THIS IS: the unbuilt prereg Leg C from sim-fledcover-a —
// a policy that CHOOSES to run from a lingerer fight, so natural
// fled observations exist to classify. sim-fledcover-a proved the
// fled-restore mechanism via scripted scenarios but found the
// natural fled population empty (0 fled on 24 seeds across two
// bands under competent play, because the base fight loop strikes
// until won/lost/routed and never walks a lingerer fight to an
// exit). This instrument supplies the missing choice. It is a
// measurement instrument, NOT a proposal for default play: it
// changes no default, no gate, no deed bar, and landing it as
// competent play is a coordinator/Steve call, never made here.
//
// BEHAVIOR (linger-origin fights only: tbfight.worldOrigin with
// lingering === true && titan === false):
//   - Strike phase: 2 damaging strikes (mirroring the fledcover
//     scenarios' >= 2 strikes), weakest alive monster, stepping
//     adjacent when out of weapon range (step-limited to
//     moveLeft). Turn ended exactly as competent ends it
//     (moveLeft=0, acted=true, tbAfterPlayerAction).
//   - Flee phase: inside Haven -> walk the Haven door tile (4,6)
//     via findPath, step-limited; stepping onto it ends the
//     fight through the engine's own door branch (fledcover
//     S-clear/S-blocked). Outside -> walk the nearest grid edge
//     and push through with tbBarrierExit, repeating crossings
//     for chasers (fledcover S-chase). If the chosen path makes
//     no progress for 3 consecutive flee turns, switch paths
//     (door <-> edge); if neither path ends the fight within 30
//     flee turns, abandon and delegate to the base fight for the
//     remainder of that fight (counted, never scored as fled).
//   - Non-lingerer fights delegate to the base fight untouched.
//   - The override takes over from turn 1 on lingerer fights: it
//     never delegates a strike turn to the base fight, so every
//     fled outcome on a lingerer fight in a FLEEPOLICY band is
//     attributable to this instrument.
// Counters on ctx (never game state): fpLingererFights,
// fpStrikeTurns, fpFleePhaseFights, fpFleeTurns,
// fpFleeAbandoned, fpDoorFlees, fpEdgeFlees. Per-fight state
// lives on ctx._fp (fight object identity + phase counters);
// fight ids contain timestamps/RNG and are never stored.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

const DOOR = [4, 6];
const STRIKES_BEFORE_FLEE = 2;
const NO_PROGRESS_SWITCH = 3;
const FLEE_TURN_ABANDON = 30;

function layerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.FLEEPOLICY) || '0') === '1'; } catch (e) { return false; }
}
function isLingererOrigin(f) {
  try {
    const o = f && f.worldOrigin;
    return !!(o && o.lingering && !o.titan);
  } catch (e) { return false; }
}
function endTurn(Game) {
  try {
    const q = Game.tbFighter('p');
    if (q) { q.moveLeft = 0; q.acted = true; }
    Game.tbAfterPlayerAction();
  } catch (e) {}
}
function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }
// Step toward (tx,ty) as far as this turn's moveLeft allows;
// returns 'moved' | 'arrived' | 'stuck'.
function stepToward(Game, p, tx, ty) {
  try {
    if (p.mx === tx && p.my === ty) return 'arrived';
    const path = Game.findPath(p.mx, p.my, tx, ty);
    if (!path || !path.length) return 'stuck';
    let cost = 0, take = 0;
    for (const [ax, ay] of path) {
      const c = Game.tbTerrainCost(ax, ay);
      if (cost + c > (p.moveLeft || 0)) break;
      cost += c; take++;
    }
    if (!take) return 'stuck';
    const dest = path[take - 1];
    Game.tbPlayerMove(dest[0], dest[1]);
    if (p.mx === tx && p.my === ty) return 'arrived';
    return 'moved';
  } catch (e) { return 'stuck'; }
}
// Walk to the nearest grid edge (one step-limited move); if already
// on an edge, push through with tbBarrierExit. Returns 'exited' |
// 'moved' | 'stuck' (exited = fight over or map node changed).
function edgeFleeStep(Game, p, ctx) {
  try {
    const mapBefore = Game.map.px + ',' + Game.map.py;
    if (p.mx === 0 || p.mx === 8 || p.my === 0 || p.my === 8) {
      const dirs = [];
      if (p.mx === 0) dirs.push([-1, 0]);
      if (p.mx === 8) dirs.push([1, 0]);
      if (p.my === 0) dirs.push([0, -1]);
      if (p.my === 8) dirs.push([0, 1]);
      for (const [dx, dy] of dirs) {
        try { Game.tbBarrierExit(dx, dy); } catch (e) {}
        if (!Game.tbfight || Game.tbfight.over || (Game.map.px + ',' + Game.map.py) !== mapBefore) return 'exited';
      }
      return 'stuck';
    }
    const edges = [[0, p.my], [8, p.my], [p.mx, 0], [p.mx, 8]];
    let path = null, target = null;
    for (const e of edges) {
      const cand = Game.findPath(p.mx, p.my, e[0], e[1]);
      if (cand && cand.length) { path = cand; target = e; break; }
    }
    if (!path) return 'stuck';
    const r = stepToward(Game, p, target[0], target[1]);
    return r === 'stuck' ? 'stuck' : 'moved';
  } catch (e) { return 'stuck'; }
}

function trackFight(ctx, f) {
  if (!ctx._fp || ctx._fp.obj !== f) {
    ctx._fp = { obj: f, strikes: 0, fleeTurns: 0, path: null, noProgress: 0, abandoned: false };
    ctx.fpLingererFights = (ctx.fpLingererFights || 0) + 1;
  }
  return ctx._fp;
}

function fleepolicyFight(Game, ctx, baseFight) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    if (!layerOn()) return baseFight(Game, ctx);
    if (!isLingererOrigin(f)) return baseFight(Game, ctx);
    const st = trackFight(ctx, f);
    if (st.abandoned) return baseFight(Game, ctx);
    const p = Game.tbFighter('p');
    if (!p || !p.alive) return baseFight(Game, ctx);
    const alive = (f.fighters || []).filter(x => x.kind === 'monster' && x.alive && !x.fled && (x.hp || 0) > 0);
    if (!alive.length) return baseFight(Game, ctx);
    // ---- strike phase ----
    if (st.strikes < STRIKES_BEFORE_FLEE) {
      alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      const tgt = alive[0];
      const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
      const range = w.range || 1;
      const d0 = cheb(p.mx, p.my, tgt.mx, tgt.my);
      if (d0 > range) {
        // step adjacent (occupied tiles skipped, as in competent)
        const occupied = new Set((f.fighters || []).filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tgt.mx + dx, cy = tgt.my + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = cheb(cx, cy, p.mx, p.my);
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) stepToward(Game, p, bx, by);
        ctx.fpStrikeTurns = (ctx.fpStrikeTurns || 0) + 1;
        endTurn(Game);
        return true;
      }
      const before = tgt.hp;
      try { Game.tbPlayerStrike(tgt.key); } catch (e) {}
      ctx.fpStrikeTurns = (ctx.fpStrikeTurns || 0) + 1;
      if (tgt.hp < before) st.strikes++;
      endTurn(Game);
      return true;
    }
    // ---- flee phase ----
    if (st.fleeTurns === 0) ctx.fpFleePhaseFights = (ctx.fpFleePhaseFights || 0) + 1;
    if (st.fleeTurns >= FLEE_TURN_ABANDON) {
      st.abandoned = true;
      ctx.fpFleeAbandoned = (ctx.fpFleeAbandoned || 0) + 1;
      return baseFight(Game, ctx);
    }
    if (!st.path) {
      try {
        const inside = (Game.state && Game.state.scholar) ? Game.state.scholar.insideHaven !== false : true;
        st.path = inside ? 'door' : 'edge';
      } catch (e) { st.path = 'edge'; }
    }
    const gridBefore = p.mx + ',' + p.my;
    const mapBefore = Game.map.px + ',' + Game.map.py;
    let outcome = 'stuck';
    if (st.path === 'door') {
      ctx.fpDoorFlees = (ctx.fpDoorFlees || 0) + 1;
      if (p.mx === DOOR[0] && p.my === DOOR[1]) {
        // Already standing on the door tile: stepping off and back
        // costs turns the instrument does not spend — treat as no
        // progress so the path switch fires.
        outcome = 'stuck';
      } else {
        const r = stepToward(Game, p, DOOR[0], DOOR[1]);
        outcome = (!Game.tbfight || Game.tbfight.over) ? 'exited' : (r === 'stuck' ? 'stuck' : 'moved');
      }
    } else {
      ctx.fpEdgeFlees = (ctx.fpEdgeFlees || 0) + 1;
      outcome = edgeFleeStep(Game, p, ctx);
    }
    st.fleeTurns++;
    ctx.fpFleeTurns = (ctx.fpFleeTurns || 0) + 1;
    const progressed = outcome !== 'stuck' &&
      (p.mx + ',' + p.my !== gridBefore || (Game.map.px + ',' + Game.map.py) !== mapBefore ||
        !Game.tbfight || Game.tbfight.over);
    if (outcome === 'exited' || !Game.tbfight || Game.tbfight.over) return true;
    if (progressed) { st.noProgress = 0; }
    else {
      st.noProgress++;
      if (st.noProgress >= NO_PROGRESS_SWITCH) {
        st.path = (st.path === 'door') ? 'edge' : 'door';
        st.noProgress = 0;
      }
    }
    endTurn(Game);
    return true;
  } catch (e) { return false; }
}

const baseFight = tableseatNowait.fight ? tableseatNowait.fight.bind(tableseatNowait) : null;
const fleepolicyNowait = Object.assign({}, tableseatNowait, {
  id: 'fleepolicy-nowait',
  desc: 'tableseat-nowait + flee-choosing lingerer fights (FLEEPOLICY=1; default off = tableseat-nowait)',
  fight(Game, ctx) {
    if (!layerOn()) return baseFight ? baseFight(Game, ctx) : false;
    return fleepolicyFight(Game, ctx, (G, C) => (baseFight ? baseFight(G, C) : false));
  },
});

module.exports = {
  fleepolicyNowait, layerOn, isLingererOrigin, fleepolicyFight,
  DOOR, STRIKES_BEFORE_FLEE, NO_PROGRESS_SWITCH, FLEE_TURN_ABANDON,
};
