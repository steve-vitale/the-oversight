// flee-when-losing — scholar disengages from a LOSING wild wave-4 TB
// fight (arm sim-staypolicy-a, Loop A run fleshout-20261105T0915Z,
// axis winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it isolates the DISENGAGE half of the finishing
// blank (does leaving a losing wave-4 fight preserve the fighter for
// more kill chances later?), paired on identical seeds with the
// competent-verbatim baseline.
//
// WHAT IT CHANGES (all of it, nothing hidden):
//   - fight hook ONLY. In a TB fight containing a LIVE wave-4 monster,
//     when the trigger fires the scholar disengages through the
//     engine-honest barrier exit (nearest-edge walk + tbBarrierExit,
//     the w4abstain-proven verbs). Every other hook (daily, upkeep,
//     pending, contest, ...) is the base competent policy's object,
//     unchanged, and every non-wave-4 fight delegates to base.fight
//     untouched. No env gates are set by requiring this file.
//   - TRIGGER (frozen in the prereg — do not tune): scholar HP
//     fraction < 0.50 AND live wave-4 monsters' remaining HP fraction
//     > 0.50 (summed over live wave-4 fighters). Fires mid-fight, not
//     at fight start; a monster already below half (wounded entry)
//     is never abandoned, however hurt the scholar is.
//   - STUCK / SEALED GUARDS: a flee step that moves the scholar
//     nowhere for 3 consecutive turns, or a barrier push consumed
//     WITHOUT exiting (sealed arena, blocked far side, stasis),
//     marks the fight unfleeable — later turns delegate to base and
//     the scholar fights it out, never stands at the edge pressing
//     flee (the fleerepair-a lesson).
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - Villager field fights: the engine drives them, not the player.
//     This policy cannot touch a field fight's flee line (Step 1 in
//     the prereg: fieldFight computes fleeAt internally, no policy
//     input, no policy hook runs during one). Field fights are the
//     untouched control channel in this arm.
//   - Wave-5 fights, wave 1–3 fights, the pending hook, the map-level
//     fight-selection: all base policy, unchanged.
//   - Directional (havenward) flee: direction stays nearest-edge, the
//     w4abstain mechanics, so the TRIGGER is the only experimental
//     variable. Directional flee is a separate, already-measured axis.
//
// COUNTERS: per-run ctx counters (swl*) plus module-level stats
// (resetStayStats / stayStats) so the driver can capture per-seed
// numbers without reaching into harness ctx.
'use strict';
const base = require('./competent');
const competent = base.competent;

// Frozen trigger line (prereg): scholar below half, monster above half.
const SWL_SCHOLAR_HP = 0.50;
const SWL_MONSTER_HP = 0.50;
const SWL_STUCK_TURNS = 3;

const STATS = { fights: 0, triggerFires: 0, fleeTurns: 0, exits: 0, stuckFallbacks: 0, sealedFallbacks: 0, events: [] };
function resetStayStats() {
  STATS.fights = 0; STATS.triggerFires = 0; STATS.fleeTurns = 0; STATS.exits = 0;
  STATS.stuckFallbacks = 0; STATS.sealedFallbacks = 0; STATS.events = [];
}
function stayStats() { return JSON.parse(JSON.stringify(STATS)); }

// Wave of a monster id from the data roster (pure read; null when the
// roster has no such id — an unknown wave is NEVER treated as wave 4).
// Same convention as scripts/policies/w4abstain.js.
function waveOfMonster(Game, mid) {
  try {
    const list = ((Game.data || {}).monsters || []);
    const m = list.find(function (x) { return x && x.id === mid; });
    if (m && m.wave != null) return (m.wave | 0);
  } catch (e) {}
  return null;
}

// Live wave-4 monster fighters in the current TB fight.
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
        if (w === 4) out.w4.push(o);
      }
    }
  } catch (e) {}
  return out;
}

// Remaining HP fraction of the live wave-4 monsters (summed).
function monsterHpFrac(w4fighters) {
  let hp = 0, max = 0;
  for (const o of w4fighters) {
    hp += Math.max(0, o.hp || 0);
    max += Math.max(0, o.maxHp || o.hp || 0);
  }
  return max > 0 ? hp / max : null;
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// End the player's turn the passive way: no movement left, acted,
// then the engine's after-action advance. (tbPlayerWait already
// advances on its own — it is NOT called after this helper.)
function endTurn(Game) {
  try {
    const q = Game.tbFighter('p');
    if (q) { q.moveLeft = 0; q.acted = true; }
    Game.tbAfterPlayerAction();
  } catch (e) {}
}

// Per-fight disengage state on ctx (keyed by fight OBJECT identity —
// fight ids are not guaranteed — so state can never leak across
// fights). Never on Game.state — policy bookkeeping only.
function fightState(ctx, f) {
  if (!ctx._swlFight || ctx._swlFight.for !== f) {
    ctx._swlFight = { for: f, turns: 0, stuckTurns: 0, fired: false, event: null };
  }
  return ctx._swlFight;
}

// One disengage step of a wave-4 fight whose trigger has fired.
// Returns true (handled) when the step spent the player's turn,
// false when the base policy should act instead (stuck/sealed
// fallback — the turn is still the player's).
function disengageStep(Game, ctx, p) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    if (ctx._swlUnfleeableFor === f) return false;
    const st = fightState(ctx, f);
    ctx.swlFleeTurns = (ctx.swlFleeTurns || 0) + 1;
    STATS.fleeTurns += 1;
    const grid = (f.gridSize | 0) || 9;
    const edge = grid - 1;
    const mid = edge / 2;
    const px = (p.mx != null ? p.mx : 4), py = (p.my != null ? p.my : 4);
    const dx = px <= mid ? -1 : 1;
    const tx = dx < 0 ? 0 : edge;
    if (px === tx) {
      // On the chosen edge: push THROUGH. Only a deliberate barrier
      // exit leaves the fight — walking along the edge does not.
      try { Game.tbBarrierExit(dx, 0); } catch (e) {}
      ctx.swlBarrierPushes = (ctx.swlBarrierPushes || 0) + 1;
      if (!Game.tbfight || Game.tbfight.over) {
        // The push exited the fight: the scholar lives to fight
        // another day. Mark the event and end the turn handling here
        // (the fight is over; there is no turn left to end).
        ctx.swlExits = (ctx.swlExits || 0) + 1;
        STATS.exits += 1;
        if (st.event) st.event.result = 'exited';
        return true;
      }
      // Push consumed WITHOUT exiting (sealed arena, blocked far
      // side, stasis): mark unfleeable, wait this turn out (the push
      // spent it — the same honest cost w4abstain pays), and fight
      // it out from the next turn on.
      ctx._swlUnfleeableFor = f;
      ctx.swlSealedFallbacks = (ctx.swlSealedFallbacks || 0) + 1;
      STATS.sealedFallbacks += 1;
      if (st.event) st.event.result = 'sealed-fallback';
      try { Game.tbPlayerWait(); } catch (e) {}
      return true;
    }
    // Not on the edge yet: one step toward it.
    let moved = false;
    try { Game.tbPlayerMove(px + dx, py); } catch (e) {}
    try {
      const nx = p.mx != null ? p.mx : 4, ny = p.my != null ? p.my : 4;
      moved = (nx !== px || ny !== py);
    } catch (e) {}
    if (!moved) {
      // The step went nowhere (blocked path). Count the stuck turn;
      // a monster in range means the turn is better spent striking
      // (fall through to base); at 3 stuck turns the fight is
      // unfleeable and the base policy fights it out from now on.
      st.stuckTurns += 1;
      ctx.swlStuckTurns = (ctx.swlStuckTurns || 0) + 1;
      let inRange = false;
      try {
        const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
        const range = w.range || 1;
        const alive = (f.fighters || []).filter(function (x) { return x && x.kind === 'monster' && (x.hp || 0) > 0; });
        for (const m of alive) {
          let d = null;
          try { if (typeof Game.fighterDistTo === 'function') d = Game.fighterDistTo(m, px, py); } catch (e2) {}
          if (d == null) d = Math.max(Math.abs((m.mx != null ? m.mx : 4) - px), Math.abs((m.my != null ? m.my : 4) - py));
          if (d != null && d <= range) { inRange = true; break; }
        }
      } catch (e2) {}
      if (inRange) return false;
      if (st.stuckTurns >= SWL_STUCK_TURNS) {
        ctx._swlUnfleeableFor = f;
        ctx.swlStuckFallbacks = (ctx.swlStuckFallbacks || 0) + 1;
        STATS.stuckFallbacks += 1;
        if (st.event) st.event.result = 'stuck-fallback';
        return false;
      }
      endTurn(Game);
      return true;
    }
    st.stuckTurns = 0;
    endTurn(Game);
    return true;
  } catch (e) { return false; }
}

const fleeWhenLosing = Object.assign({}, competent, {
  id: 'flee-when-losing',
  desc: 'competent + disengage from a losing wild wave-4 TB fight (50/50 trigger; policy-side probe only)',
  fight(Game, ctx) {
    try {
      const f = Game.tbfight;
      if (f && !f.over && Game.tbIsPlayerTurn()) {
        const w = fightWaves(Game);
        if (w.w4.length && ctx._swlUnfleeableFor !== f) {
          const p = Game.tbFighter('p');
          if (p) {
            const sFrac = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
            const mFrac = monsterHpFrac(w.w4);
            ctx.swlChecks = (ctx.swlChecks || 0) + 1;
            const st = fightState(ctx, f);
            st.turns += 1;
            if (mFrac != null && sFrac < SWL_SCHOLAR_HP && mFrac > SWL_MONSTER_HP) {
              if (!st.fired) {
                st.fired = true;
                ctx.swlTriggerFires = (ctx.swlTriggerFires || 0) + 1;
                STATS.triggerFires += 1;
                const mid = (w.w4[0].mdef && w.w4[0].mdef.id) || w.w4[0].monsterId || null;
                st.event = { day: dayOf(Game), mid: mid, turn: st.turns,
                  scholarHpFrac: +sFrac.toFixed(3), monsterHpFrac: +mFrac.toFixed(3), result: 'open' };
                STATS.events.push(st.event);
                const seen = ctx._swlFightsSeen || (ctx._swlFightsSeen = []);
                if (seen.indexOf(f) < 0) { seen.push(f); STATS.fights += 1; }
              }
              if (disengageStep(Game, ctx, p)) return true;
              // Stuck/sealed fallback: the turn is still the player's
              // (or already waited) — fall through to base below.
            }
          }
        }
      }
    } catch (e) {}
    return (typeof competent.fight === 'function') ? competent.fight(Game, ctx) : false;
  },
});

module.exports = { fleeWhenLosing: fleeWhenLosing, competentEat: base.competentEat,
  resetStayStats: resetStayStats, stayStats: stayStats,
  SWL_SCHOLAR_HP: SWL_SCHOLAR_HP, SWL_MONSTER_HP: SWL_MONSTER_HP, SWL_STUCK_TURNS: SWL_STUCK_TURNS,
  fightWaves: fightWaves, monsterHpFrac: monsterHpFrac, disengageStep: disengageStep };
