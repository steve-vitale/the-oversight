// competent-partydamage-b — party damage per round (arm sim-partydamage-b,
// run fleshout-loop-b-20261106T1630Z, axis scale-onramp / winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it isolates the PARTY-DAMAGE half of the wave-4
// kill blank (does a party that holds ground and strikes together every
// round it survives — with the finishprobe P3 cascade extended to the
// party — kill wave-4 beasts at >= 10% on identical seeds?), paired with
// the competent-verbatim baseline on band 87001-87008.
//
// WHAT IT CHANGES (all of it, nothing hidden):
//   - Base: the stageally policy (scripts/policies/competent-stageally-a.js,
//     unchanged) — companion staging (party invites at haven) + round-1
//     rally in wave-4+ TB fights with allies present. Daily/pending hooks
//     are the staged policy's object, unchanged.
//   - Fight hook ONLY, wave-4+ TB fights only: the competent fight hook's
//     start-of-fight walk-away (outmatched: total monster HP > 2.5x scholar
//     max HP — true for nearly every wave-4 fight) and its mid-fight 35%-HP
//     eject are BOTH bypassed. The scholar holds ground and fights —
//     never-flee-once-committed. Every other fight delegates to the staged
//     policy untouched.
//   - P3 CASCADE, frozen order (finishprobe spec): patient_aim (take_aim:
//     next shot 2.5x, cannot miss) / freeze_tag (tag) / hogtie (bind) /
//     rage (unleash_rage) / war_cry (bellow). At most one press per ability
//     per fight; at most one turn-costing press per turn; dinner reserve
//     200 kcal (competent's rule). A refused press costs nothing and falls
//     through to striking. hogtie needs a controlled adjacent size-1
//     monster (engine availability gate) — against most wave-4 beasts it
//     will refuse, and the cascade falls through honestly.
//   - STRIKE TOGETHER every round: weakest live monster, in range ->
//     strike; out of range -> close the distance one step (interior tiles
//     1..7 only, step-don't-teleport, never onto the flee-by-barrier edge);
//     no reachable adjacent tile -> WAIT so the monster's turn can change
//     the geometry. Allies are engine-driven; the rally's coordKey focuses
//     their damage. The party-damage numerator is scholar strikes + ally
//     strikes + aimed/ability damage, all recorded by the trace hit log.
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No flee, no retreat, no disengage in wave-4+ fights — the opposite
//     direction from the tbretreat-refind lever. Stand and strike.
//   - Villager field fights: the engine drives them, not the player.
//     This policy cannot touch a field fight's flee line. Field fights
//     are the untouched control channel in this arm.
//   - No hold-for-finish discipline (this is NOT splitkill): the scholar
//     strikes the weakest live monster every round. Whoever lands the
//     killing blow lands it.
//   - No roster, no waveKillLog, no snapshot: the fight hook reads ONLY
//     the fight in front of the scholar (living monsters and their waves,
//     living allies, the scholar's own HP/abilities). The policy NEVER
//     reads state.waveKillLog — pinned by a proof test with a poisoned log.
//   - No gate, price, deed, or readyDemand change. No src/js change.
//
// COUNTERS: per-run ctx counters (pd*) plus module-level stats
// (resetPartydamageStats / partydamageStats) so the driver can capture
// per-seed numbers without reaching into harness ctx.
'use strict';
const STAGED = require('./competent-stageally-a');
const stagedPolicy = STAGED.stagedPolicy;
const RALLY = require('./competent-rally-bankkiller-b');

const CASCADE = [
  { aid: 'patient_aim', act: 'take_aim' },
  { aid: 'freeze_tag', act: 'tag' },
  { aid: 'hogtie', act: 'bind' },
  { aid: 'rage', act: 'unleash_rage' },
  { aid: 'war_cry', act: 'bellow' },
];
const DINNER_RESERVE = 200;

const STATS = { w4plusFights: 0, holdGroundFights: 0, cascadePresses: 0,
  cascadeByAbility: {}, strikes: 0, closes: 0, waits: 0, rallies: 0,
  errors: 0, events: [] };
function resetPartydamageStats() {
  STATS.w4plusFights = 0; STATS.holdGroundFights = 0; STATS.cascadePresses = 0;
  STATS.cascadeByAbility = {}; STATS.strikes = 0; STATS.closes = 0;
  STATS.waits = 0; STATS.rallies = 0; STATS.errors = 0; STATS.events = [];
}
function partydamageStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Live wave-4+ monsters in the current TB fight. Reads ONLY the fight in
// front of the scholar: f.fighters, mdef waves, roster waves.
function liveW4Monsters(Game) {
  const out = [];
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Array.isArray(f.fighters)) return out;
    for (const o of f.fighters) {
      if (!o || !o.alive || o.fled) continue;
      if (o.kind !== 'monster' && o.kind !== 'hostile') continue;
      let w = null;
      if (o.mdef && o.mdef.wave != null) w = (o.mdef.wave | 0);
      else if (o.monsterId) w = RALLY.waveOfMonster(Game, o.monsterId);
      if (w != null && w >= 4) out.push(o);
    }
  } catch (e) {}
  return out;
}
function liveAllies(Game) {
  try {
    const f = Game.tbfight;
    if (!f || !Array.isArray(f.fighters)) return [];
    return f.fighters.filter(function (o) {
      return o && o.alive && !o.fled && (o.kind === 'ally' || o.kind === 'villager') && o.key !== 'p';
    });
  } catch (e) { return []; }
}

// Per-fight policy state on ctx (keyed by fight OBJECT identity — fight
// ids are not guaranteed — so state can never leak across fights). Never
// on Game.state — policy bookkeeping only.
function fightState(ctx, f) {
  if (!ctx._pdFight || ctx._pdFight.for !== f) {
    ctx._pdFight = { for: f, turns: 0, seen: false, rallied: false, pressed: {} };
  }
  return ctx._pdFight;
}

// One cascade press this turn, in the frozen order. Mirrors competent's
// tryPress turn accounting: a press that sets p.acted spent the turn, so
// end it ONLY if it is still the player's turn. Returns true when the
// turn is consumed.
function cascadePress(Game, f, ctx, p, endTurn) {
  const st = fightState(ctx, f);
  try {
    const scholar = (Game.state || {}).scholar || {};
    for (const step of CASCADE) {
      if (st.pressed[step.aid]) continue;
      let okPress = false;
      try {
        if (!Game.hasAbility(step.aid)) continue;
        const def = ((Game.data || {}).abilities || []).find(function (a) { return a && a.id === step.aid; });
        const action = def && (def.actions || []).find(function (a) { return a && a.id === step.act; });
        if (!action) continue;
        const avail = Game._actionAvailable(step.aid, action);
        if (!avail || !avail.ok) continue;
        if ((scholar.kcal || 0) - ((action.cost || {}).kcal || 0) < DINNER_RESERVE) continue;
        const ok = Game.useAbility(step.aid, step.act);
        const pf = Game.tbFighter ? Game.tbFighter('p') : p;
        if (pf && pf.acted) {
          st.pressed[step.aid] = 1;
          if (ok) {
            ctx.pdCascadePresses = (ctx.pdCascadePresses || 0) + 1;
            ctx.pdCascadeByAbility = ctx.pdCascadeByAbility || {};
            ctx.pdCascadeByAbility[step.aid] = (ctx.pdCascadeByAbility[step.aid] || 0) + 1;
            STATS.cascadePresses += 1;
            STATS.cascadeByAbility[step.aid] = (STATS.cascadeByAbility[step.aid] || 0) + 1;
          }
          if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) endTurn();
          return true;
        }
        if (!Game.tbfight || Game.tbfight.over || !Game.tbIsPlayerTurn()) return true;
        return false;
      } catch (e) { continue; }
      void okPress;
    }
    return false;
  } catch (e) { return false; }
}

// The party-damage fight turn: rally (turn 1, allies present), cascade,
// then strike the weakest live monster or close the distance. Never flees.
function partydamageFight(Game, ctx) {
  const f = Game.tbfight;
  if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
  const p = Game.tbFighter('p');
  if (!p) return false;
  const st = fightState(ctx, f);
  st.turns += 1;
  const endTurn = function () {
    try {
      const q = Game.tbFighter('p');
      q.moveLeft = 0; q.acted = true;
      Game.tbAfterPlayerAction();
    } catch (e) {}
  };
  // Turn 1, allies present: rally the line (the stageally verb), then the
  // turn is spent — return handled, never endTurn after it.
  if (st.turns === 1 && !st.rallied && liveAllies(Game).length) {
    st.rallied = true;
    let ok = false;
    try { ok = Game.tbPlayerRally(); } catch (e) {
      ctx.pdRallyErrors = (ctx.pdRallyErrors || 0) + 1;
      STATS.errors += 1;
    }
    if (ok) {
      ctx.pdRallies = (ctx.pdRallies || 0) + 1;
      STATS.rallies += 1;
      return true;
    }
    // Rally refused: fall through to the cascade/strike below — the turn
    // is still the player's. Never fall through to competent.fight: its
    // walk-away would flee this fight.
  }
  // P3 cascade: one press per turn, frozen order, once per ability/fight.
  try { if (cascadePress(Game, f, ctx, p, endTurn)) return true; } catch (e) {}
  const alive = (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile') && (x.hp || 0) > 0 && !x.fled; });
  if (!alive.length) return false;
  alive.sort(function (a, b) { return (a.hp || 0) - (b.hp || 0); });
  const tgt = alive[0];
  const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
  const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
  // CLOSE THE DISTANCE: striking out of range is a no-op that never
  // advances the turn. Step as far toward the target as this turn allows
  // (interior tiles 1..7 only — grid edges are the flee-by-barrier, and
  // stepping on them can end the fight mid-strike).
  try {
    const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
    const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
    if (d0 > (w.range || 1)) {
      const occupied = new Set(
        (f.fighters || []).filter(function (x) { return x && x.alive && x.key !== 'p'; }).map(function (x) { return x.mx + ',' + x.my; }));
      let bx = null, by = null, bd = 1e9;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const cx = tmx + dx, cy = tmy + dy;
        if (cx < 1 || cx > 7 || cy < 1 || cy > 7) continue;
        if (occupied.has(cx + ',' + cy)) continue;
        const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
        if (dd < bd) { bd = dd; bx = cx; by = cy; }
      }
      if (bx != null) {
        try {
          let dx = bx, dy = by;
          const ml = (p.moveLeft || 0);
          if (ml > 0 && typeof Game.findPath === 'function') {
            const path = Game.findPath(px, py, bx, by);
            if (path && path.length > ml) {
              const step = path[ml - 1];
              dx = step[0]; dy = step[1];
            }
          }
          Game.tbPlayerMove(dx, dy);
        } catch (e) {}
        ctx.pdCloses = (ctx.pdCloses || 0) + 1;
        STATS.closes += 1;
        endTurn();
        return true;
      }
      // No reachable adjacent tile: WAIT (tbPlayerWait auto-advances;
      // never endTurn after it) so the monster's turn can change the
      // geometry. A real player reads the room instead of hammering a
      // blocked step until they die.
      if (typeof Game.tbPlayerWait === 'function') {
        try { Game.tbPlayerWait(); } catch (e) {}
        ctx.pdWaits = (ctx.pdWaits || 0) + 1;
        STATS.waits += 1;
        return true;
      }
      endTurn();
      return true;
    }
  } catch (e) {}
  // STRIKE THEN END TURN: tbPlayerStrike leaves moveLeft > 0, so the turn
  // never auto-advances — end explicitly.
  try { Game.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; ctx.pdStrikes = (ctx.pdStrikes || 0) + 1; STATS.strikes += 1; } catch (e) {}
  endTurn();
  return true;
}

const partydamagePolicy = Object.assign({}, stagedPolicy, {
  id: 'competent-partydamage-b',
  desc: 'competent + companion-staging + round-1 rally + hold-ground P3 cascade + strike-together in wave-4+ TB fights (policy-side probe only)',
  fight(Game, ctx) {
    try {
      const f = Game.tbfight;
      if (f && !f.over && Game.tbIsPlayerTurn()) {
        const w4 = liveW4Monsters(Game);
        if (w4.length) {
          const st = fightState(ctx, f);
          if (!st.seen) {
            st.seen = true;
            ctx.pdW4plusFights = (ctx.pdW4plusFights || 0) + 1;
            STATS.w4plusFights += 1;
            ctx.pdHoldGroundFights = (ctx.pdHoldGroundFights || 0) + 1;
            STATS.holdGroundFights += 1;
            STATS.events.push({ day: dayOf(Game), mid: (w4[0].mdef && w4[0].mdef.id) || w4[0].monsterId || null,
              allies: liveAllies(Game).length });
          }
          return partydamageFight(Game, ctx);
        }
      }
    } catch (e) { STATS.errors += 1; }
    return (typeof stagedPolicy.fight === 'function') ? stagedPolicy.fight(Game, ctx) : false;
  },
});

module.exports = { partydamagePolicy: partydamagePolicy,
  resetPartydamageStats: resetPartydamageStats, partydamageStats: partydamageStats,
  liveW4Monsters: liveW4Monsters, liveAllies: liveAllies, fightState: fightState,
  CASCADE: CASCADE, DINNER_RESERVE: DINNER_RESERVE };
