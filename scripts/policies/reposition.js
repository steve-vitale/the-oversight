// reposition — the finding-#430 reposition layer (flesh-out loop, 2026-10-16).
//
// FINDING: TB bots never reposition — movement-based counter perform-kinds
// are bot-invisible. `blindside` (sunback: move during the arch) and
// `face_it` (sweeps_week: move away without fleeing) recorded 0 performances
// across 32 runs, while the same-shaped `move_windup` ev fires for other
// species and `eyes` (cliffhanger) kill-attributes regularly. The base's
// beastTrickPlay ends with "Unknown kind: never loop on it." — blindside
// and face_it are unhandled kinds.
//
// THE LAYER (REPOSITION=1, default OFF): wraps leadfeast/belongfeast. On each
// player TB turn, before the base fight(), checks two engine-honest,
// knowledge-gated reposition conditions — each at most ONCE per fight, only
// when the trigger is genuinely present:
//   blindside (sunback): the Sunflash Lunge telegraph is up (the arch).
//     The honest action: move during the arch — a real tbPlayerMove to a
//     free interior tile avoiding the telegraph cells. The engine fires the
//     blindside performance on (move + windup).
//   face_it (sweeps_week): the turn-1 window (f.round === 1). The honest
//     action: back away slow — a real tbPlayerMove to a free interior tile
//     that does NOT close distance (the engine fires on !ev.closer).
//     Interior tiles only (edges are the flee-by-barrier); never a flee.
//
// KNOWLEDGE-GATED (Steve: "If you don't know, it doesn't show"): attempted
// only when the village's real counter-ledger knowledge state holds —
// state.monsterCounters[mid] (fully discovered) OR codex 'slain' stage
// (the hint the player read). Same gate as the base's beastTrickPlay.
//
// SAFETY: the trick is a luxury move. Fire only at scholar hpPct >= 0.7
// (far from the base's 0.35 eject); on turn 1 only when the base's
// outmatched walk-away would NOT fire (totalMhp > 2.5*pmax mirrors it —
// skip and delegate so the base flees). The base's survival decisions are
// never overridden: reposition only spends a turn the base already chose
// to fight.
//
// Gate off = pure delegation, byte-identical (pinned by the proof's RED phase).
'use strict';
const { belongfeast, leadfeast } = require('./feastscale');

function layerOn() { return process.env.REPOSITION === '1'; }

// ---------- real-knowledge gate (same shape as beastTrickPlay's) ----------
function rpMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || null; } catch (e) { return null; } }
function rpCounterOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.counter) || null;
  } catch (e) { return null; }
}
function rpTrickKnown(Game, mid) {
  try {
    if ((Game.state.monsterCounters || {})[mid]) return true;
    const e = ((Game.state.codex || {}).monsters || {})[mid];
    return !!(e && e.stage === 'slain');
  } catch (e) { return false; }
}

// Interior free tiles (1..7): grid edges are the flee-by-barrier — the
// reposition is never a flee, so it never steps on the barrier.
function rpFreeTiles(f, px, py) {
  const out = [];
  try {
    const occupied = new Set(
      ((f.fighters || []).filter(x => x && x.alive && x.key !== 'p')).map(x => x.mx + ',' + x.my));
    for (let tx = 1; tx <= 7; tx++) for (let ty = 1; ty <= 7; ty++) {
      if (tx === px && ty === py) continue;
      if (occupied.has(tx + ',' + ty)) continue;
      out.push([tx, ty]);
    }
  } catch (e) {}
  return out;
}
function rpReachCost(Game, px, py, tx, ty) {
  try {
    if (typeof Game.findPath !== 'function') return 1;
    const path = Game.findPath(px, py, tx, ty) || [];
    if (!path.length) return -1;
    let cost = 0;
    for (const t of path) cost += (Game.tbTerrainCost ? Game.tbTerrainCost(t[0], t[1]) : 1);
    return cost;
  } catch (e) { return -1; }
}
function rpEndTurn(Game) {
  try {
    const q = Game.tbFighter('p');
    q.moveLeft = 0; q.acted = true;
    Game.tbAfterPlayerAction();
  } catch (e) {}
}

// Attempt one honest reposition this turn. Returns true when the turn is consumed.
function repositionPlay(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    if (!p || !p.alive || (p.moveLeft || 0) <= 0) return false;
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const live = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
    if (!live.length) return false;
    // LUXURY-MOVE SAFETY: hurt scholars fight or flee normally, never trick.
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    if (hpPct < 0.7) return false;
    // Fight-local once-per-condition memory.
    if (ctx._rpFight !== f) { ctx._rpFight = f; ctx._rpDone = {}; }
    const done = ctx._rpDone;
    const round = f.round || 1;
    for (const m of live) {
      if (done[m.key]) continue;
      const mid = rpMidOf(m);
      if (!mid) { done[m.key] = 1; continue; }
      const ctr = rpCounterOf(Game, mid);
      if (!ctr || (ctr.kind !== 'blindside' && ctr.kind !== 'face_it')) { done[m.key] = 1; continue; }
      if (!rpTrickKnown(Game, mid)) continue; // knowledge gate: not ours to attempt
      if (ctr.kind === 'blindside') {
        // THE ARCH IS THE TRIGGER: sunback's windup telegraph is genuinely up.
        if (!m.telegraph) continue;
        const cells = (m.telegraph && Array.isArray(m.telegraph.cells)) ? m.telegraph.cells : [];
        const avoid = new Set(cells.map(c => c.cx + ',' + c.cy));
        const cands = rpFreeTiles(f, px, py);
        // dodge the lunge lane/cells, nearest honest reposition first
        cands.sort((a, b) =>
          (Math.max(Math.abs(a[0] - px), Math.abs(a[1] - py)) - Math.max(Math.abs(b[0] - px), Math.abs(b[1] - py))) ||
          (a[0] - b[0]) || (a[1] - b[1]));
        let spot = null;
        for (const c of cands) {
          if (avoid.has(c[0] + ',' + c[1])) continue;
          const cost = rpReachCost(Game, px, py, c[0], c[1]);
          if (cost < 0 || cost > (p.moveLeft || 0)) continue;
          spot = c; break;
        }
        done[m.key] = 1; // the window was real; attempted once either way
        if (!spot) continue;
        try { Game.tbPlayerMove(spot[0], spot[1]); } catch (e) {}
        ctx.rpBlindside = (ctx.rpBlindside || 0) + 1;
        rpEndTurn(Game);
        return true;
      }
      if (ctr.kind === 'face_it') {
        // THE TURN-1 WINDOW: the Sweeps Pounce is firstTurn-only.
        if (round !== 1) { done[m.key] = 1; continue; }
        // TURN-1 WALK-AWAY MIRROR: the base flees outmatched fights on turn
        // 1 (totalMhp > 2.5*pmax). A trick must never replace the flee.
        try {
          let totalMhp = 0;
          for (const x of live) totalMhp += x.maxHp || x.hp || 0;
          const pmax = p.maxHp || 100;
          if (totalMhp > 2.5 * pmax) { done[m.key] = 1; continue; }
        } catch (e) {}
        // BACK AWAY SLOW: move to a free interior tile that does NOT close
        // distance — the honest performable act (engine: !ev.closer).
        const d0 = Math.max(Math.abs(m.mx - px), Math.abs(m.my - py));
        const cands = rpFreeTiles(f, px, py);
        cands.sort((a, b) =>
          (Math.max(Math.abs(b[0] - m.mx), Math.abs(b[1] - m.my)) - Math.max(Math.abs(a[0] - m.mx), Math.abs(a[1] - m.my))) ||
          (a[0] - b[0]) || (a[1] - b[1]));
        let spot = null;
        for (const c of cands) {
          const d1 = Math.max(Math.abs(m.mx - c[0]), Math.abs(m.my - c[1]));
          if (d1 < d0) continue; // never close distance — the gaze is held
          const cost = rpReachCost(Game, px, py, c[0], c[1]);
          if (cost < 0 || cost > (p.moveLeft || 0)) continue;
          spot = c; break;
        }
        done[m.key] = 1;
        if (!spot) continue;
        try { Game.tbPlayerMove(spot[0], spot[1]); } catch (e) {}
        ctx.rpFaceIt = (ctx.rpFaceIt || 0) + 1;
        rpEndTurn(Game);
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function withReposition(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    fight(Game, ctx) {
      if (!layerOn()) return base.fight(Game, ctx); // gate off: pure delegation
      try { if (repositionPlay(Game, ctx)) return true; } catch (e) {}
      return base.fight(Game, ctx);
    },
  });
}

const repositionLead = withReposition(
  leadfeast, 'reposition-lead',
  'leadfeast + reposition layer (REPOSITION=1): honest TB reposition for known movement-kind tricks (blindside/face_it)'
);
const repositionBelong = withReposition(
  belongfeast, 'reposition-belong',
  'belongfeast + reposition layer (REPOSITION=1): honest TB reposition for known movement-kind tricks (blindside/face_it)'
);

module.exports = { repositionLead, repositionBelong, withReposition, layerOn, repositionPlay };
