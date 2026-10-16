// learnfight — scale-onramp lever: LEARN-VS-FIGHT default (Steve
// 2026-10-13) on village-defense channels (flesh-out loop, 2026-10-16,
// sim-learnfight).
//
// CONTEXT: sim-observefarm was killed at pilot — scholar-expedition
// observation farming has no supply: trick-bearers never spawn as walk-up
// targets on expedition nodes (50 hunts, 0 engagements). The funnel's
// supply lives in the channels that come TO the village: raids via
// havenRaidTick, treeline stalkers, wild encounters at Haven (see
// evidence/2026-10-16/sim-observefarm.md — "the funnel's supply is the
// village's danger, not the scholar's expedition").
//
// THE LEVER (policy-side only, ZERO src/js changes): when a wave-3+
// trick-bearer whose trick is undiscovered comes to the village and the
// scholar faces it, the scholar takes a WITNESS posture — observes from
// safety (disengages at fight start, healthy) instead of engaging
// blade-first. The engine's own non-lethal observation funnel does the
// teaching: noteScholarTrickObservation fires on the fled/routed/calm end
// (scholar in the fight, alive, beast alive at fight end) — the layer
// invents no knowledge, reads only Game.villagerTrickDefs() +
// Game.villageKnowsTrick() (the engine's own knowledge gates).
//
// PARTY-AWARE (finding #353): a disengage must NEVER abandon villagers
// mid-fight. The witness mark is set ONLY when no villager is committed to
// the same fight (no alive kind==='villager' fighter in f.fighters) —
// villagers committed → HOLD (normal fight behavior, lfHeld counted).
// "Take them with you" has no honest verb in the engine (villager field
// fights are engine-autonomous and separate), so the layer holds instead —
// documented in the evidence, not invented.
//
// THE TRADE (pre-registered): the scholar forgoes the kill — the slain
// path's codex hint and the wave-4 gate's blood-standing point — for an
// observation. A fled wild (non-titan) monster melts away rather than
// lingering, so the village pays no gorge tax for the witness.
//
// Env gate LEARNFIGHT=1 opts IN (default OFF). Gate off = pure
// delegation: no witness marks, byte-identical to the tribfloor->windefer
// composition (the proof's det-gate pins that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, wave-3+
// signature mechanics, the deliberately counter-less wave-4/5 roster —
// counterplay lives in villagerTrickDefs, wired by the counterwire arm).
'use strict';
const WD = require('./windefer');
const TF = require('./tribfloor');

function learnfightOn() { return process.env.LEARNFIGHT === '1'; }

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
function tableBusy(Game) {
  try {
    const pg = Game.progState ? Game.progState() : {};
    return !!(pg.tableDone || pg.tableWaiting);
  } catch (e) { return false; }
}
function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return (s.hp || s.health || 100) / Math.max(1, maxHp);
  } catch (e) { return 1; }
}
function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); }
  catch (e) { return false; }
}

// The learn window: opted in, wave-3+ trick-bearers exist in the world,
// and the scholar is not sitting the table sequence.
function learnLive(Game) {
  if (!learnfightOn()) return false;
  const uw = unlockedWave(Game);
  return uw >= 3 && !tableBusy(Game);
}

// trickTargetOf(Game, mid): a wave-3+ signature-bearing species whose trick
// the village has not learned yet. Waves 1-2 counters are excluded by the
// wave>=3 filter (their slain path is intact; this arm is the wave-3+
// trick game). Known species are skipped — re-farming teaches nothing.
function trickTargetOf(Game, mid) {
  try {
    if (!mid) return false;
    const defs = Game.villagerTrickDefs ? Game.villagerTrickDefs() : null;
    if (!defs || !defs[mid]) return false;
    if (beastWaveOf(Game, mid) < 3) return false;
    if (Game.villageKnowsTrick && Game.villageKnowsTrick(mid)) return false;
    return true;
  } catch (e) { return false; }
}

function fightHasLearnTarget(Game, f) {
  try {
    for (const m of (f.fighters || [])) {
      if (!m || m.kind !== 'monster' || (m.hp || 0) <= 0) continue;
      const mid = beastMidOf(m);
      if (mid && trickTargetOf(Game, mid)) return true;
    }
  } catch (e) {}
  return false;
}

// villagersCommitted(f): any villager fighter alive and not fled in THIS
// fight. The party-aware guard (#353): a disengage while these fighters
// are mid-fight would abandon villagers — the layer holds instead.
function villagersCommitted(f) {
  try {
    for (const x of (f.fighters || [])) {
      if (!x || x.kind !== 'villager') continue;
      if (x.alive === false || (x.hp || 0) <= 0 || x.fled) continue;
      return true;
    }
  } catch (e) {}
  return false;
}

function withLearnFight(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    fight(Game, ctx) {
      // WITNESS MARK (fight side): recomputed every player turn; false
      // whenever the gate is off, the learn window is closed, the fight
      // isn't a village-channel fight (scholar at Haven — raids, treeline
      // stalkers, wild encounters at home; expedition fights are NOT
      // touched — the observefarm channel stays dead), the scholar is
      // already hurt (the base's honest 35% eject owns hurt fights), or no
      // undiscovered wave-3+ trick-bearer is in the fight. PARTY-AWARE:
      // villagers committed to this fight → hold, never disengage
      // (lfHeld counted once per fight); the mid-fight recompute also
      // clears the mark if villagers join after it was set.
      try {
        ctx._learnFight = false;
        if (learnLive(Game)) {
          const f = Game.tbfight;
          if (f && !f.over && atHaven(Game) && scholarHpPct(Game) >= 0.5 &&
              fightHasLearnTarget(Game, f)) {
            if (villagersCommitted(f)) {
              if (ctx._lfHeldFight !== f) { ctx._lfHeldFight = f; ctx.lfHeld = (ctx.lfHeld || 0) + 1; }
            } else {
              ctx._learnFight = true;
            }
          } else if (ctx._lfHeldFight === f) {
            ctx._lfHeldFight = null;
          }
        }
      } catch (e) { ctx._learnFight = false; }
      return base.fight(Game, ctx);
    },
  });
}

// Both sides share the objects pattern — LEARNFIGHT is the only switch.
// Ids match the naked tribfloor->windefer control ('leadfeast-windefer' /
// 'belongfeast-windefer') so telemetry stays comparable; the pre-seat
// substrate (no SEATDRIVE) matches the whole w3drive/observefarm line.
const leadseat = withLearnFight(
  WD.withWinDefer(TF.leadfeast, 'leadfeast-windefer', 'naked tribfloor->windefer base for learnfight'),
  'leadfeast-windefer',
  'tribfloor->windefer + learnfight (LEARNFIGHT=1): witness posture on undiscovered wave-3+ trick-bearers at the village'
);
const belongseat = withLearnFight(
  WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'naked tribfloor->windefer base for learnfight'),
  'belongfeast-windefer',
  'tribfloor->windefer + learnfight (LEARNFIGHT=1): witness posture on undiscovered wave-3+ trick-bearers at the village'
);

module.exports = {
  learnfightOn, withLearnFight, learnLive, trickTargetOf, fightHasLearnTarget,
  villagersCommitted, beastMidOf, beastWaveOf, unlockedWave, scholarHpPct,
  leadseat, belongseat,
};
