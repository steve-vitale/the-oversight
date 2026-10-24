// vetcommit — journey-endgame r46 (lane B, 2026-10-24): COMMITTED wave-4
// fights on the courtship+deedhunt road.
//
// CONTEXT (r45's binding finding): the capable+deedhunt road faces wave-4s
// (5/2/1 distinct facings) but kills none — competent's fight logic bails
// before the kill: start-of-fight walk-away (outmatched block) plus the
// mid-fight 35% HP eject plus the DPS-race conviction eject. Standing caps
// at 199 on all three waves seeds because the wave-5 readiness deferral's
// VETERANS bar reads 0/2 (living roster members with a wave-4+ kill in
// state.waveKillLog; canon docs/MONSTER-WAVES.md § readiness, engine
// src/js/standing.js waveCombatReadiness).
//
// THE LEVER (policy-side only, ZERO src/js changes): while wave-4 is
// unlocked, wave-5 is not, and the veterans bar is still short, a live
// wave-4+ fight is fought COMMITTED — the wrapper sets BOTH commit flags
// competent.js already honors:
//   ctx._w5Commit — overrides the start-of-fight walk-away for wave-4+
//     (the WAVE5REACH mechanism; scholar >= 50% HP guard kept);
//   ctx._huntCommit — lowers the mid-fight HP eject from 35% to 12%
//     (the COURTKILL mechanism; the flag itself is wave-agnostic at the
//     eject decision point, only the start-of-fight override is wave-3
//     scoped — hence setting both).
// What it does NOT change (honest bravery, not suicide): the DPS-race
// conviction eject still applies — a race lost with conviction still
// retreats, at any HP. A real player can also walk away from a lost race;
// the question is whether commitment converts facings to kills, not
// whether the bot can be made to die standing.
//
// STAND-DOWN: the flags stop being set the moment the veterans bar is met
// (waveUnlockReady(5).short no longer includes 'veterans') or wave-5
// unlocks — the hunt's goal is met, the scholar goes back to cautious
// competent behavior. The seek side is UNCHANGED: deedPatrol patrols
// (r45's road) supply the facings; this wrapper touches only the fight
// side, so r46 vs r45 is a single-variable comparison.
//
// Env gate VETCOMMIT=1 opts IN. Gate off = pure delegation: the wrapper
// returns base.fight without touching ctx at all (byte-identical base).
'use strict';

function vetcommitOn() { return process.env.VETCOMMIT === '1'; }

function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function unlockedWave(Game) {
  try { return (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1) | 0; }
  catch (e) { return 1; }
}
function veteransShort(Game) {
  try {
    const rd = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    if (!rd) return true;
    return (rd.short || []).indexOf('veterans') >= 0;
  } catch (e) { return true; }
}
function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return (s.hp || s.health || 100) / Math.max(1, maxHp);
  } catch (e) { return 1; }
}

// The commit is live: opted in, wave-4 unlocked, wave-5 locked, veterans
// bar still short, and the scholar is not already badly hurt (>= 50% HP —
// the same guard competent's own commit overrides require).
function commitLive(Game) {
  if (!vetcommitOn()) return false;
  const uw = unlockedWave(Game);
  if (uw < 4 || uw >= 5) return false;
  if (!veteransShort(Game)) return false;
  if (scholarHpPct(Game) < 0.5) return false;
  return true;
}

function withVetCommit(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    fight(Game, ctx) {
      // Gate off = pure delegation (no ctx touches at all).
      if (!vetcommitOn()) return base.fight(Game, ctx);
      try {
        ctx._w5Commit = false;
        ctx._huntCommit = false;
        if (commitLive(Game)) {
          const f = Game.tbfight;
          if (f && !f.over) {
            const mons = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0);
            if (mons.some(m => beastWaveOf(Game, beastMidOf(m)) >= 4)) {
              ctx._w5Commit = true;
              ctx._huntCommit = true;
              ctx.vetFights = (ctx.vetFights || 0) + 1;
              if (!ctx.vetFirstDay) { ctx.vetFirstDay = ((Game.state || {}).scholar || {}).day || 0; }
            }
          }
        }
        // Best-effort DPS-race bail census: the conviction eject is the one
        // bail this lever deliberately keeps — count it so a 0-kill result
        // can say which bail fired.
        if (ctx.dpsFled) ctx.vetDpsFledSeen = ctx.dpsFled;
      } catch (e) { ctx._w5Commit = false; ctx._huntCommit = false; }
      return base.fight(Game, ctx);
    },
  });
}

module.exports = {
  vetcommitOn, commitLive, unlockedWave, veteransShort, beastWaveOf, beastMidOf,
  withVetCommit,
};
