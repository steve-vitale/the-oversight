// presence — the 11th veteran-production attempt: PRESENCE-ROUTING WITHOUT
// MOVEMENT (flesh-out loop, 2026-10-19, run sim-presence, axis scale-onramp).
//
// THE MECHANISM (investigation, this run — see evidence/2026-10-19/sim-presence.md):
// The join rule (game.js startCombat) is purely positional: villagers on the
// scholar's node with village.positions within Chebyshev 4 of the scholar's
// combat position join (nearest 4 — NO other gate: no health, weapon,
// temperament, or willingness filter).
//
// The diagnostic (scripts/probe-presence-diag-20261019.js, 26 wave-3+ fights
// on the control policy):
//   - 22/26 fights: ZERO villagers with grid positions ("nobody-on-node").
//   - Dominant sub-case is DOOR-SPLIT: the scholar stands OUTSIDE at the
//     treeline (grid edge) while the villagers are INSIDE the hall (asleep).
//     ensureVillagerPositions deletes cross-door positions, so the join rule
//     sees an empty village. (d=69: 10 villagers inside, scholar outside.)
//   - 3/26: villagers on node but >4 tiles (scholar at grid edge).
//   - The raid shape's 5.0% vs haven-TB's 0.7% companion share (killdisc) is
//     the muster effect (more villagers on node), not a different join rule.
//   - Even when the scholar IS inside, positions may be missing:
//     ensureVillagerPositions only runs on scholar movement, and goInside
//     doesn't call it.
//
// THE LEVER ("inside at night" / "stand with the village"): when a wave-3+
// threat is at the Haven node (a wave-3+ world monster on the haven node, or
// an aid crisis active) and the scholar is at Haven but OUTSIDE, the scholar
// goes INSIDE the hall and takes a step (scholar self-movement only). This
// door-aligns the scholar with the villagers (who sleep inside at night;
// npcInside defaults true), and the step triggers ensureVillagerPositions so
// the inside villagers get grid positions the join rule can see. When a
// raider comes inside ("eyes on your bedroll"), the fight starts inside with
// villagers in range.
//
// WHAT IT DOES NOT DO (the vetarm lesson): it never calls Game.assignTask,
// Game.takeWeapon, or any verb that moves, assigns, or risks a villager.
// The scholar moves; the village doesn't. Arming is the armory layer's job
// (deleted); this layer is presence-routing only.
//
// GATE: PRESENCE=1, default OFF. Gate-off is pure delegation: the proof's
// D0 pins byte-identical trajectories (PRESENCE unset vs the unwrapped
// tribfloor stack, identical seeds). Gate-on is deterministic (no RNG draws;
// goInside/microMove are engine verbs with fixed outcomes).
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';
const TF = require('./tribfloor');

function layerOn() { return process.env.PRESENCE === '1'; }

// waveOf: monster wave from the data table (mirrors the killdisc instrument).
function waveOf(Game, mid) {
  try {
    const m = ((Game.data || {}).monsters || []).find(x => x && x.id === mid);
    return (m && m.wave) || 0;
  } catch (e) { return 0; }
}

// threatAtHaven(Game): a wave-3+ monster on the haven node, or an aid crisis
// (raid) active. Pure reads; never throws.
function threatAtHaven(Game) {
  try {
    if (Game.aidCrisis && Game.aidCrisis()) return 'aid-crisis';
  } catch (e) {}
  try {
    const v = (Game.state || {}).village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    const wms = Game.worldMonsters ? Game.worldMonsters() : [];
    for (const m of wms) {
      if (!m || m.tx !== hx || m.ty !== hy) continue;
      if ((waveOf(Game, m.id) | 0) >= 3) return 'w3-at-haven:' + m.id;
    }
  } catch (e) {}
  return null;
}

// presenceBeat(Game, ctx): the "stand with the village" beat. Scholar
// self-movement only. Counts actions in ctx for the proof/telemetry.
function presenceBeat(Game, ctx) {
  if (!layerOn()) return;
  try {
    const s = (Game.state || {}).scholar || {};
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    if (s.insideHaven) return; // already door-aligned
    if (Game.inCombat && Game.inCombat()) return; // never mid-fight
    if (Game.over) return;
    const threat = threatAtHaven(Game);
    if (!threat) return; // no wave-3+ threat: the scholar's routine is their own
    // ONCE-PER-THREAT COOLDOWN (gap-phase2 W1, line 630): the beat fired
    // up to 40x/run — daily + upkeep re-fired it every tick while the same
    // threat lingered at Haven. Standing with the village for a threat is
    // one act, not one per tick: skip when this exact threat already drew
    // the beat. A new threat (new monster id / aid-crisis) fires fresh.
    // Only set on success below, so a failed entry retries next tick.
    if (ctx._presenceBeatFor === threat) return;
    // Go inside (scholar self-movement; no villager touched).
    // The engine verb is enterBuilding (game.js) — "goInside" was a misname.
    const enterFn = (typeof Game.enterBuilding === 'function') ? Game.enterBuilding.bind(Game)
      : (typeof Game.goInside === 'function' ? Game.goInside.bind(Game) : null);
    if (!enterFn) return;
    let ok = false;
    try { ok = !!enterFn(); } catch (e) { return; }
    if (!ok) return;
    ctx._presenceBeatFor = threat;
    ctx.presenceGoInside = (ctx.presenceGoInside || 0) + 1;
    ctx.presenceThreat = threat;
    // A step inside triggers the engine's ensureVillagerPositions (game.js),
    // so the inside villagers get grid positions the join rule can see.
    // enterBuilding places the scholar at (4,7); step north to (4,6).
    try {
      if (Game.microMove && Game.microMove(4, 6)) {
        ctx.presenceStep = (ctx.presenceStep || 0) + 1;
      }
    } catch (e) {}
  } catch (e) {}
}

function withPresence(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      try { presenceBeat(Game, ctx); } catch (e) {}
      return base.daily(Game, ctx);
    },
    upkeep(Game, ctx) {
      if (!layerOn()) {
        return base.upkeep ? base.upkeep(Game, ctx) : undefined;
      }
      try { presenceBeat(Game, ctx); } catch (e) {}
      return base.upkeep ? base.upkeep(Game, ctx) : undefined;
    },
  });
}

const leadpresence = withPresence(
  TF.leadfeast, 'leadpresence',
  'leadpresence + presence (PRESENCE=1): when a wave-3+ threat is at Haven, the scholar goes inside (door-align with the village) — scholar self-movement only, no villager moved/assigned/risked'
);
const belongpresence = withPresence(
  TF.belongfeast, 'belongpresence',
  'belongpresence + presence (PRESENCE=1): when a wave-3+ threat is at Haven, the scholar goes inside (door-align with the village) — scholar self-movement only, no villager moved/assigned/risked'
);

// The sweep imports these ids ('leadpresence', 'belongpresence'); the
// PRESENCE env var is the only switch — control and presence share the
// same objects.
module.exports = {
  leadpresence, belongpresence, withPresence, layerOn,
  threatAtHaven, presenceBeat, waveOf,
};
