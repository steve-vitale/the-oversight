// tbretreat-refind — scholar disengages EARLY from a losing wild
// wave-4+ TB fight and RUNS THE CHASE OUT (arm sim-tbretreat-refind-b,
// Loop B run fleshout-loop-b-20261105T1830Z, axis winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it isolates the RETREAT half of the grind blank
// (does leaving a losing wave-4 fight early, havenward, through the
// whole chase preserve the fighter for more kill chances later?),
// paired on identical seeds with the competent-verbatim baseline.
//
// WHAT IT CHANGES (all of it, nothing hidden):
//   - fight hook ONLY. In a TB fight containing a LIVE wave-4+
//     monster, when the trigger fires the scholar disengages through
//     the engine-honest barrier exit (havenward walk + tbBarrierExit,
//     the competent directional-flee verbs). Every other hook (daily,
//     upkeep, pending, contest, ...) is the base competent policy's
//     object, unchanged, and every non-wave-4+ fight delegates to
//     base.fight untouched. No env gates are set by requiring this
//     file. No pending-encounter handling of any kind: startCombat is
//     the single pending-clearer and this policy never touches it.
//   - TRIGGER (frozen in the prereg — do not tune): scholar HP
//     fraction < 0.75 AND live wave-4+ monsters' remaining HP
//     fraction > 0.75 (summed over live wave-4+ fighters). Fires
//     mid-fight, not at fight start; a monster already below 3/4 is
//     never abandoned, however hurt the scholar is. Earlier than
//     staypolicy's 50/50: at 50% the scholar has ~1-2 hits left
//     against wave-4 damage (35-95) and the chase costs a walk plus
//     up to two more crossings.
//   - DIRECTION (frozen per fight at trigger time): competent's own
//     exported chooseFleeDir — haven +10, havenward +4, known +2,
//     monster-active -6. At the haven node it returns null: HOLD,
//     the trigger does not fire (counted separately as a haven-hold).
//   - PERSISTENT CHASE: after a barrier push, if the fight continues
//     AND the map node changed (crossed, chase continues), the
//     disengage KEEPS GOING in the same frozen direction — never
//     marked unfleeable on a crossing. chasePersistence is 2 by
//     default (game.js:36293), so a chased fighter needs a second
//     push; staypolicy gave up after one. Safety cap: 6 crossings,
//     then fall through to base.
//   - PUSH-OUTCOME CLASSIFICATION (the sibling confirm's "sealed"
//     bucket, corrected): every push is classified at push time —
//     sealed (arenaContest or f.noFlee — a wild fight never sets
//     either; see the prereg mechanism map), world-edge (target node
//     outside 0..8), blocked (blocked far side / stasis), crossed-
//     chase, exited-haven, exited-gaveup. Only a push consumed
//     WITHOUT moving marks the fight unfleeable.
//   - STUCK GUARD: a flee step that moves the scholar nowhere for 3
//     consecutive turns falls through to a strike when a monster is
//     in range, else marks unfleeable (the fleerepair lesson).
//   - SEALED GUARD: the trigger does not fire when arenaContest,
//     f.noFlee, or f.tableTrial is set (the scholar reads the sealed
//     barrier / the trial commitment and stays; counted separately).
//     The guard gates only the FIRST fire: a fight that seals mid-
//     disengage runs the disengage out, and the push itself reports
//     the seal (consumed-sealed classification).
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - Villager field fights: the engine drives them, not the player.
//     This policy cannot touch a field fight's flee line. Field
//     fights are the untouched control channel in this arm.
//   - Wave 1-3 fights, the pending hook, the map-level
//     fight-selection: all base policy, unchanged.
//   - No restore: the sibling NO-GO reverted TBRETREAT_RESTORE, so a
//     fled beast melts. The refind half is measured as
//     RE-ENGAGEMENT (the same scholar faces a wave-4+ beast again
//     within 7 days), never as a same-beast re-find.
//   - No recover-and-return window: competent's markRecover is NOT
//     called on exit (it is inert without the directional-flee env
//     gate, and calling it would add a second experimental variable
//     to the post-exit days). The fighter resumes competent.daily.
//
// COUNTERS: per-run ctx counters (rf*) plus module-level stats
// (resetRefindStats / refindStats) so the driver can capture per-seed
// numbers without reaching into harness ctx.
'use strict';
const base = require('./competent');
const competent = base.competent;
const chooseFleeDir = base.chooseFleeDir;

// Frozen trigger line (prereg): scholar below 3/4, monster above 3/4.
const REFIND_SCHOLAR_HP = 0.75;
const REFIND_MONSTER_HP = 0.75;
const REFIND_STUCK_TURNS = 3;
const REFIND_MAX_CROSSINGS = 6;

const STATS = { fights: 0, triggerFires: 0, fleeTurns: 0, exits: 0,
  exitsHaven: 0, exitsGaveup: 0, crossings: 0, crossingCaps: 0,
  consumedPushes: 0, pushes: { sealed: 0, worldEdge: 0, blocked: 0, crossed: 0 },
  stuckFallbacks: 0, sealedFallbacks: 0, suppressions: 0, havenHolds: 0, events: [] };
function resetRefindStats() {
  STATS.fights = 0; STATS.triggerFires = 0; STATS.fleeTurns = 0; STATS.exits = 0;
  STATS.exitsHaven = 0; STATS.exitsGaveup = 0; STATS.crossings = 0; STATS.crossingCaps = 0;
  STATS.consumedPushes = 0;
  STATS.pushes = { sealed: 0, worldEdge: 0, blocked: 0, crossed: 0 };
  STATS.stuckFallbacks = 0; STATS.sealedFallbacks = 0; STATS.suppressions = 0; STATS.havenHolds = 0;
  STATS.events = [];
}
function refindStats() { return JSON.parse(JSON.stringify(STATS)); }

// Wave of a monster id from the data roster (pure read; null when the
// roster has no such id — an unknown wave is NEVER treated as wave 4+).
// Same convention as scripts/policies/w4abstain.js.
function waveOfMonster(Game, mid) {
  try {
    const list = ((Game.data || {}).monsters || []);
    const m = list.find(function (x) { return x && x.id === mid; });
    if (m && m.wave != null) return (m.wave | 0);
  } catch (e) {}
  return null;
}

// Live wave-4+ monster fighters in the current TB fight.
function fightWaves(Game) {
  const out = { w4plus: [], waves: [], unknown: [] };
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
        if (w >= 4) out.w4plus.push(o);
      }
    }
  } catch (e) {}
  return out;
}

// Remaining HP fraction of the live wave-4+ monsters (summed).
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
  if (!ctx._rfFight || ctx._rfFight.for !== f) {
    ctx._rfFight = { for: f, turns: 0, stuckTurns: 0, fired: false, held: false,
      dir: null, crossings: 0, event: null, suppressedCounted: false };
  }
  return ctx._rfFight;
}

function isHavenNode(Game) {
  try { return Game.map.px === 4 && Game.map.py === 4; } catch (e) { return false; }
}

// One disengage step of a wave-4+ fight whose trigger has fired.
// Returns true (handled) when the step spent the player's turn,
// false when the base policy should act instead (stuck/sealed
// fallback, crossing cap — the turn is still the player's).
function disengageStep(Game, ctx, p) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    if (ctx._rfUnfleeableFor === f) return false;
    const st = fightState(ctx, f);
    if (!st.dir) return false; // haven-hold: no direction, no disengage
    if (st.crossings >= REFIND_MAX_CROSSINGS) {
      ctx._rfUnfleeableFor = f;
      ctx.rfCrossingCaps = (ctx.rfCrossingCaps || 0) + 1;
      STATS.crossingCaps += 1;
      if (st.event) st.event.result = 'crossing-cap';
      return false;
    }
    ctx.rfFleeTurns = (ctx.rfFleeTurns || 0) + 1;
    STATS.fleeTurns += 1;
    const grid = (f.gridSize | 0) || 9;
    const edge = grid - 1;
    const dx = st.dir.dx, dy = st.dir.dy;
    const px = (p.mx != null ? p.mx : 4), py = (p.my != null ? p.my : 4);
    const tx = dx < 0 ? 0 : dx > 0 ? edge : px;
    const ty = dy < 0 ? 0 : dy > 0 ? edge : py;
    if (px === tx && py === ty) {
      // On the chosen edge: push THROUGH. Only a deliberate barrier
      // exit leaves the fight — walking along the edge does not.
      const bx = Game.map.px, by = Game.map.py;
      const sealedNow = !!(((Game.state || {}).arenaContest) || f.noFlee);
      const targetOut = (bx + dx < 0 || bx + dx > 8 || by + dy < 0 || by + dy > 8);
      let pushOk = true;
      try { pushOk = Game.tbBarrierExit(dx, dy); } catch (e) { pushOk = false; }
      ctx.rfBarrierPushes = (ctx.rfBarrierPushes || 0) + 1;
      if (pushOk === false) return false; // nothing spent; base acts
      const fightOver = !Game.tbfight || Game.tbfight.over;
      const moved = (Game.map.px !== bx || Game.map.py !== by);
      if (fightOver) {
        // The push exited the fight: the scholar lives to fight
        // another day. Mark the event and end the turn handling here
        // (the fight is over; there is no turn left to end).
        const haven = isHavenNode(Game);
        ctx.rfExits = (ctx.rfExits || 0) + 1;
        STATS.exits += 1;
        if (haven) { ctx.rfExitsHaven = (ctx.rfExitsHaven || 0) + 1; STATS.exitsHaven += 1; }
        else { ctx.rfExitsGaveup = (ctx.rfExitsGaveup || 0) + 1; STATS.exitsGaveup += 1; }
        if (st.event) {
          st.event.result = 'exited';
          st.event.exitKind = haven ? 'exited-haven' : 'exited-gaveup';
          st.event.crossings = st.crossings;
        }
        return true;
      }
      if (moved) {
        // CROSSED, chase continues on the new node: the fight is
        // still live, but the scholar IS out of the old node. Keep
        // disengaging in the same frozen direction — never mark
        // unfleeable on a crossing (the staypolicy error this arm
        // corrects). The push spent this turn.
        st.crossings += 1;
        ctx.rfCrossings = (ctx.rfCrossings || 0) + 1;
        STATS.crossings += 1;
        STATS.pushes.crossed += 1;
        if (st.event) st.event.crossings = st.crossings;
        st.stuckTurns = 0;
        endTurn(Game);
        return true;
      }
      // Push consumed WITHOUT moving (sealed arena, world edge,
      // blocked far side, stasis): classify it, mark unfleeable,
      // wait this turn out (the push spent it), and fight it out
      // from the next turn on.
      const cat = sealedNow ? 'sealed' : targetOut ? 'worldEdge' : 'blocked';
      ctx._rfUnfleeableFor = f;
      ctx.rfConsumedPushes = (ctx.rfConsumedPushes || 0) + 1;
      STATS.consumedPushes += 1;
      STATS.pushes[cat] += 1;
      ctx.rfSealedFallbacks = (ctx.rfSealedFallbacks || 0) + 1;
      STATS.sealedFallbacks += 1;
      if (st.event) { st.event.result = 'consumed-' + cat; st.event.crossings = st.crossings; }
      try { Game.tbPlayerWait(); } catch (e) {}
      return true;
    }
    // Not on the edge yet: one step toward it.
    let movedStep = false;
    try { Game.tbPlayerMove(px + dx, py + dy); } catch (e) {}
    try {
      const nx = p.mx != null ? p.mx : 4, ny = p.my != null ? p.my : 4;
      movedStep = (nx !== px || ny !== py);
    } catch (e) {}
    if (!movedStep) {
      // The step went nowhere (blocked path). Count the stuck turn;
      // a monster in range means the turn is better spent striking
      // (fall through to base); at 3 stuck turns the fight is
      // unfleeable and the base policy fights it out from now on.
      st.stuckTurns += 1;
      ctx.rfStuckTurns = (ctx.rfStuckTurns || 0) + 1;
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
      if (st.stuckTurns >= REFIND_STUCK_TURNS) {
        ctx._rfUnfleeableFor = f;
        ctx.rfStuckFallbacks = (ctx.rfStuckFallbacks || 0) + 1;
        STATS.stuckFallbacks += 1;
        if (st.event) { st.event.result = 'stuck-fallback'; st.event.crossings = st.crossings; }
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

const tbretreatRefind = Object.assign({}, competent, {
  id: 'tbretreat-refind',
  desc: 'competent + early disengage from a losing wild wave-4+ TB fight (75/75 trigger; havenward + persistent chase; policy-side probe only)',
  fight(Game, ctx) {
    try {
      const f = Game.tbfight;
      if (f && !f.over && Game.tbIsPlayerTurn()) {
        const w = fightWaves(Game);
        if (w.w4plus.length && ctx._rfUnfleeableFor !== f) {
          const p = Game.tbFighter('p');
          if (p) {
            const st = fightState(ctx, f);
            // SEALED GUARD: arena / noFlee / table-trial fights are
            // commitments, not walk-outs. Counted once per fight.
            // Only gates the FIRST fire: a fight that seals mid-
            // disengage runs the disengage out — the push itself
            // reports the seal (consumed-sealed classification).
            if (!st.fired && (((Game.state || {}).arenaContest) || f.noFlee || f.tableTrial)) {
              if (!st.suppressedCounted) {
                st.suppressedCounted = true;
                ctx.rfSuppressions = (ctx.rfSuppressions || 0) + 1;
                STATS.suppressions += 1;
              }
            } else if (!st.held) {
              const sFrac = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
              const mFrac = monsterHpFrac(w.w4plus);
              ctx.rfChecks = (ctx.rfChecks || 0) + 1;
              st.turns += 1;
              // Once the trigger has fired, the disengage runs to its
              // end regardless of later HP drift — the decision was
              // made; the fighter is committed to leaving. Only the
              // FIRST fire is gated on the HP line.
              const triggered = st.fired ||
                (mFrac != null && sFrac < REFIND_SCHOLAR_HP && mFrac > REFIND_MONSTER_HP);
              if (triggered) {
                if (!st.fired) {
                  st.fired = true;
                  ctx.rfTriggerFires = (ctx.rfTriggerFires || 0) + 1;
                  STATS.triggerFires += 1;
                  const wave = Math.max.apply(null, w.waves.filter(function (x) { return x >= 4; }).concat([4]));
                  const mid = (w.w4plus[0].mdef && w.w4plus[0].mdef.id) || w.w4plus[0].monsterId || null;
                  st.event = { day: dayOf(Game), mid: mid, wave: wave, fighterVid: Game.villagerId || null,
                    turn: st.turns, scholarHpFrac: +sFrac.toFixed(3), monsterHpFrac: +mFrac.toFixed(3),
                    result: 'open', exitKind: null, crossings: 0 };
                  STATS.events.push(st.event);
                  const seen = ctx._rfFightsSeen || (ctx._rfFightsSeen = []);
                  if (seen.indexOf(f) < 0) { seen.push(f); STATS.fights += 1; }
                  // Direction, frozen for this fight: havenward via
                  // competent's own scorer. Null at the haven node:
                  // HOLD — no push leads home.
                  let dir = null;
                  try { dir = chooseFleeDir(Game, Game.map.px, Game.map.py); } catch (e) { dir = null; }
                  if (!dir) {
                    st.held = true;
                    ctx.rfHavenHolds = (ctx.rfHavenHolds || 0) + 1;
                    STATS.havenHolds += 1;
                    st.event.result = 'haven-hold';
                  } else {
                    st.dir = { dx: dir.dx, dy: dir.dy, haven: !!dir.haven, score: dir.score };
                  }
                }
                if (!st.held && disengageStep(Game, ctx, p)) return true;
                // Stuck/sealed/cap fallback: the turn is still the
                // player's (or already waited) — fall through to base.
              }
            }
          }
        }
      }
    } catch (e) {}
    return (typeof competent.fight === 'function') ? competent.fight(Game, ctx) : false;
  },
});

module.exports = { tbretreatRefind: tbretreatRefind, competentEat: base.competentEat,
  resetRefindStats: resetRefindStats, refindStats: refindStats,
  REFIND_SCHOLAR_HP: REFIND_SCHOLAR_HP, REFIND_MONSTER_HP: REFIND_MONSTER_HP,
  REFIND_STUCK_TURNS: REFIND_STUCK_TURNS, REFIND_MAX_CROSSINGS: REFIND_MAX_CROSSINGS,
  fightWaves: fightWaves, monsterHpFrac: monsterHpFrac, disengageStep: disengageStep };
