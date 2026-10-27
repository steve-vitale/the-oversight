// w4abstain — player abstains from wave-4 fights (sim-w4abstain-a,
// 2026-10-27, flesh-out loop, axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it isolates the VILLAGER side of wave-4 kill
// conversion by taking the player's sword out of wave-4 fights, paired
// on identical seeds with the sibling arm (sim-w4channel-a) where the
// player fights.
//
// SUBSTRATE (verbatim, see the prereg for the full env set):
// scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
// TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the w5block/w5twokey/w5seq/
// vetsurvive/standmeet substrate. This file wraps it and changes ONLY
// the fight and pending hooks, below. Daily, upkeep, contest and every
// other hook are inherited unchanged, so courtship, seat legs, feasts,
// foraging, teaching and travel are identical to the sibling arm
// except for what the two hooks below do.
//
// WHAT THE POLICY DOES (all of it, nothing hidden):
//   - fight hook: on any player turn of a TB fight that contains a
//     LIVE wave-4 monster fighter, FLEE instead of fighting — walk
//     toward the nearest grid edge one tile per turn, and push
//     THROUGH the barrier (tbBarrierExit) once on the edge. If the
//     push is refused (sealed fight, blocked far side), the player
//     WAITS OUT the turn instead — never strikes, never uses an
//     ability in a wave-4 fight. Every such turn is counted on ctx
//     (w4abstain* counters). Non-wave-4 fights delegate to
//     tableseat-nowait's fight hook (competent tactical fighting)
//     unchanged.
//   - pending hook: a pending FEAST DRAW whose monster is wave 4 is
//     declined with the engine's own honest verb,
//     driveOffFeastDraw (devotion unspent, buff stays live). Any
//     other pending encounter whose monster is wave 4 is COUNTED
//     and left alone — the UI offers no decline verb for it (only
//     "Face it"; the drive-off button exists for feast draws
//     only), so the harness fallback faces it and the fight hook
//     flees it. That asymmetry is a finding, stated here, not a
//     gap papered over.
//
// WHAT THE POLICY DOES NOT SUPPRESS (stated so the census cannot be
// misread as "no wave-4 contact at all"):
//   - Villager fights: field fights, raid-defense fights, patrol
//     fights, aid fights — the engine drives them, not the player.
//     Villagers fight wave-4 monsters freely; their kills are
//     exactly what the census measures.
//   - World births, spawns, raid drafts, monster turns: the policy
//     cannot stop a wave-4 monster from arriving, being drafted,
//     or stepping onto the player's tile. It can only refuse to
//     fight it once a TB fight starts.
//   - Contest-arena TB fights with wave-4 monsters: fled via the
//     fight hook like any TB fight; if sealed, waited out without
//     striking (possible death — the honest cost of refusing a
//     sealed fight, counted in the wall numbers).
//   - Table trials: not monster fights; untouched.
//   - Non-wave-4 player fights, and feast draws of waves 1-3:
//     fought/faced normally.
//   - TIMING HONESTY (read from competent.js + sim-harness.js):
//     feast draws are faced INSIDE competent.upkeep (eveningFeast
//     grants, feastFightRoad faces, one upkeep call) — no policy
//     hook runs between grant and face. A wave-4 draw faced there
//     therefore starts a TB fight that the fight hook then flees;
//     the pending hook's drive-off applies only to draws still
//     pending at driveContests time. The fight hook is the binding
//     abstention layer; both paths are counted (drive-offs,
//     fled fights). The driveoff arm's COMPETENT_SEEK_FIGHTS=0
//     workaround is NOT used here: it would also kill feasted
//     patrol sweeps and move the substrate away from the sibling
//     arm for no census gain, since the fight hook already
//     guarantees zero player strikes.
//
// ACTIVATION GATE (see the prereg — binding): the sweep's strike
// counter (a recorder-style wrap on Game.tbPlayerStrike, installed
// by the sweep, not by this policy) must show ZERO player strikes
// in wave-4 TB fights AND the waveKillLog must show ZERO wave-4
// kills by the scholar. A TB fight that starts and is fled with
// zero strikes is abstention HELD, not a fought fight — the gate
// counts strikes and kills, never starts.
//
// DEFAULT OFF: W4ABSTAIN unset or not '1' -> fight and pending
// delegate to tableseat-nowait with no abstention behavior at all
// (the det-gate in scripts/test-w4abstain-a-policy.js pins that:
// off fight/pending match plain tableseat-nowait on a fake Game,
// with no ctx surface).
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

function w4abstainLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.W4ABSTAIN) || '0') === '1'; } catch (e) { return false; }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Wave of a monster id from the data roster (pure read; null when the
// roster has no such id — an unknown wave is NEVER treated as wave 4).
function waveOfMonster(Game, mid) {
  try {
    const list = ((Game.data || {}).monsters || []);
    const m = list.find(x => x && x.id === mid);
    if (m && m.wave != null) return (m.wave | 0);
  } catch (e) {}
  return null;
}

// Live wave-4 monster fighters in the current TB fight (fighters carry
// monsterId + mdef; prefer mdef.wave, fall back to the roster lookup).
// Returns { w4: [...fighter keys], waves: [...all live monster waves], unknown: [...] }.
function fightWaves(Game) {
  const out = { w4: [], waves: [], unknown: [] };
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Array.isArray(f.fighters)) return out;
    for (const o of f.fighters) {
      if (!o || o.kind !== 'monster' || !o.alive || o.fled) continue;
      let w = null;
      if (o.mdef && o.mdef.wave != null) w = (o.mdef.wave | 0);
      else if (o.monsterId) w = waveOfMonster(Game, o.monsterId);
      if (w == null) out.unknown.push(o.key || o.monsterId || '?');
      else {
        out.waves.push(w);
        if (w === 4) out.w4.push(o.key || o.monsterId || '?');
      }
    }
  } catch (e) {}
  return out;
}

// End the player's turn the passiveFlee way: no movement left, acted,
// then the engine's after-action advance. (tbPlayerWait already
// advances on its own — it is NOT called after this helper.)
function endTurn(Game) {
  try {
    const q = Game.tbFighter('p');
    if (q) { q.moveLeft = 0; q.acted = true; }
    Game.tbAfterPlayerAction();
  } catch (e) {}
}

// Flee one player turn of a wave-4 fight. Returns true (handled) on
// every player turn it runs — the harness must never fall through to
// its default strike for a wave-4 fight.
function abstainFlee(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    if (!p) return false;
    const grid = (f.gridSize | 0) || 9;
    const edge = grid - 1;
    const mid = edge / 2;
    const px = (p.mx != null ? p.mx : 4), py = (p.my != null ? p.my : 4);
    const dx = px <= mid ? -1 : 1;
    const tx = dx < 0 ? 0 : edge;
    ctx.w4abstainTurns = (ctx.w4abstainTurns || 0) + 1;
    const ids = ctx.w4abstainFightIds || (ctx.w4abstainFightIds = []);
    if (f.id && ids.indexOf(f.id) < 0) {
      ids.push(f.id);
      ctx.w4abstainFights = (ctx.w4abstainFights || 0) + 1;
    }
    if (px === tx) {
      // On the chosen edge: push THROUGH (walking along the edge
      // does not exit — only a deliberate barrier exit does).
      try { Game.tbBarrierExit(dx, 0); } catch (e) {}
      ctx.w4abstainBarrierPushes = (ctx.w4abstainBarrierPushes || 0) + 1;
      if (!Game.tbfight || Game.tbfight.over) return true;
      // Push refused (sealed fight / blocked far side): wait the
      // turn out. The player takes monster turns without striking
      // — the honest cost of refusing a sealed fight.
      ctx.w4abstainHeldTurns = (ctx.w4abstainHeldTurns || 0) + 1;
      try { Game.tbPlayerWait(); } catch (e) {}
      return true;
    }
    // Not on the edge yet: one step toward it, then end the turn.
    try { Game.tbPlayerMove(px + dx, py); } catch (e) {}
    ctx.w4abstainFleeSteps = (ctx.w4abstainFleeSteps || 0) + 1;
    endTurn(Game);
    return true;
  } catch (e) { return false; }
}

// The pending draw by DIRECT reads only (pure — never
// feastDrawPending(), which is self-cleaning and deletes a stale
// draw as a side effect). Null when no draw, or when the draw's
// pending encounter is not live.
function liveDraw(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const d = s.feastDraw || null;
    if (!d || !d.monsterId) return null;
    if (!Game.pendingEncounter || Game.pendingMonsterId !== d.monsterId) return null;
    return d;
  } catch (e) { return null; }
}

const w4abstain = Object.assign({}, tableseatNowait, {
  id: 'w4abstain',
  desc: 'tableseat-nowait + player abstains from wave-4 fights (W4ABSTAIN=1; default off = tableseat-nowait)',
  fight(Game, ctx) {
    if (!w4abstainLayerOn()) {
      return (typeof tableseatNowait.fight === 'function') ? tableseatNowait.fight(Game, ctx) : false;
    }
    try {
      const w = fightWaves(Game);
      if (w.w4.length) return abstainFlee(Game, ctx);
      if (w.unknown.length) ctx.w4abstainUnknownWaveTurns = (ctx.w4abstainUnknownWaveTurns || 0) + 1;
    } catch (e) {}
    return (typeof tableseatNowait.fight === 'function') ? tableseatNowait.fight(Game, ctx) : false;
  },
  pending(Game, ctx) {
    if (!w4abstainLayerOn()) {
      return (typeof tableseatNowait.pending === 'function') ? tableseatNowait.pending(Game, ctx) : false;
    }
    try {
      // Wave-4 feast draw: decline with the engine's own verb.
      const d = liveDraw(Game);
      if (d && waveOfMonster(Game, d.monsterId) === 4) {
        ctx.w4abstainDrawAttempts = (ctx.w4abstainDrawAttempts || 0) + 1;
        let r = null;
        try { r = (typeof Game.driveOffFeastDraw === 'function') ? Game.driveOffFeastDraw() : null; } catch (e) { ctx.w4abstainDrawErr = String((e && e.message) || e).slice(0, 120); return false; }
        if (r && r.ok) { ctx.w4abstainDrawDriveoffs = (ctx.w4abstainDrawDriveoffs || 0) + 1; return true; }
        ctx.w4abstainDrawFailed = (ctx.w4abstainDrawFailed || 0) + 1;
        return false;
      }
      // Any other wave-4 pending encounter: counted, left for the
      // harness fallback (no decline verb exists) — the fight hook
      // flees it once it starts.
      if (Game.pendingEncounter && Game.pendingMonsterId) {
        const w = waveOfMonster(Game, Game.pendingMonsterId);
        if (w === 4) {
          const key = dayOf(Game) + ':' + String(Game.pendingMonsterId);
          const keys = ctx.w4abstainPendingKeys || (ctx.w4abstainPendingKeys = []);
          if (keys.indexOf(key) < 0) keys.push(key);
          ctx.w4abstainPendingSeen = keys.length;
          ctx.w4abstainPendingCalls = (ctx.w4abstainPendingCalls || 0) + 1;
        }
      }
    } catch (e) { ctx.w4abstainPendingErr = String((e && e.message) || e).slice(0, 120); }
    return (typeof tableseatNowait.pending === 'function') ? tableseatNowait.pending(Game, ctx) : false;
  },
});

module.exports = { w4abstain, w4abstainLayerOn, waveOfMonster, fightWaves, abstainFlee, liveDraw };
