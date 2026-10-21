'use strict';
// scripts/lib/death-census.js — kind-aware death census (2026-10-21, journey-establishment r22).
//
// THE TAXONOMY TRAP (r21, 2026-10-20): the single tele('death', …) call site
// (corpses.js registerDeath) fires for ALL registrations, INCLUDING monster
// corpses. game.js registers a villager's monster kill as
//   registerDeath({ kind: 'monster', cause: 'villager combat', killerId: vid })
// "villager combat" is COMBAT *BY* A VILLAGER (against a monster) — not
// villager-VS-villager combat. r21 read cause-only and published "8
// villager-vs-villager combat deaths" for seed 82; the records were 9
// villager monster-KILLS. §14: never read cause without kind.
//
// DEATH TELE TAXONOMY (verified in code 2026-10-21):
//   kind 'monster', cause 'villager combat'|'patrol combat', killerId=vid
//       → a VILLAGER KILLED A MONSTER (field fight / patrol)
//   kind 'monster', cause 'combat', killerId=player
//       → the PLAYER killed a monster
//   kind 'monster', cause 'expedition' → monster died on expedition
//   kind 'villager'|'person', cause 'monster' → a villager died TO a monster
//   kind 'villager'|'person', cause 'combat', killerId=player
//       → the PLAYER killed a villager in combat (game.js tb path)
//   kind 'villager'|'person', cause 'ambush', killerId=another villager
//       → betrayal ambush: a villager killed a villager
//   kind 'villager'|'person', cause 'combat', killerId=another villager
//       → TRUE villager-vs-villager combat death (no confirmed sightings
//          through r22; the convention reserves this cell)
//   kind 'villager', other causes ('starvation','thirst',"a wound that
//       wouldn't close",'injuries',…) → needs/wounds deaths
//
// A TRUE v-vs-v combat death = kind in (villager, person) AND killerId set
// AND killerId is not the player AND killerId is not the victim.
// 'player'/'p' (Game.villagerId) marks the scholar.
//
// SPLIT (journey-establishment r23, 2026-10-21): r22's M1 zero-prong
// conflated two mechanics — open-combat v-vs-v (the r21-claimed cell, 0
// sightings in 12 seeds) and betrayal-ambush killing (designed, narrated,
// 2 sightings in 12 seeds). The split helpers below separate them:
// openCombatVV() counts ONLY kind villager/person + cause 'combat' +
// villager killer; betrayalAmbushRecs() counts cause 'ambush' + villager
// killer. The bare villagerVsVillager census count remains the union
// (both are villagers killing villagers); the split is for metric binding.
function census(deaths, opts) {
  opts = opts || {};
  const playerId = opts.playerId || 'p';
  const roster = opts.roster || null; // optional array of villager ids
  const isPlayer = (id) => id === playerId || id === 'player' || id === 'p';
  const out = {
    total: 0,
    personDeaths: 0,            // kind villager|person died (any cause)
    personDeathsByCause: {},
    villagerVsVillager: 0,      // TRUE v-vs-v: kind villager/person, killer = another villager
    villagerVsVillagerRecs: [],
    playerKilledVillager: 0,    // kind villager/person, killer = player
    villagerDiedToMonster: 0,   // kind villager/person, cause 'monster'
    betrayalAmbush: 0,          // kind villager/person, cause 'ambush', killer = villager
    monsterDeaths: 0,           // kind monster died (any cause)
    villagerKilledMonster: 0,   // kind monster, cause villager/patrol combat
    playerKilledMonster: 0,     // kind monster, cause 'combat' (+player killerId)
    monsterDeathsByCause: {},
  };
  for (const d of (deaths || [])) {
    if (!d) continue;
    out.total++;
    const kind = String(d.kind || '?');
    const cause = String(d.cause || '?');
    const killer = d.killerId != null ? String(d.killerId) : (d.killer != null ? String(d.killer) : null);
    const isPerson = kind === 'villager' || kind === 'person';
    const isMonster = kind === 'monster';
    if (isPerson) {
      out.personDeaths++;
      out.personDeathsByCause[cause] = (out.personDeathsByCause[cause] || 0) + 1;
      if (killer && !isPlayer(killer) && killer !== String(d.who) && killer !== String(d.vid)) {
        // killer is someone other than the player and other than the victim
        if (!roster || roster.indexOf(killer) >= 0) {
          out.villagerVsVillager++;
          out.villagerVsVillagerRecs.push(d);
        }
      }
      if (killer && isPlayer(killer)) out.playerKilledVillager++;
      if (cause === 'monster') out.villagerDiedToMonster++;
      if (cause === 'ambush') out.betrayalAmbush++;
    } else if (isMonster) {
      out.monsterDeaths++;
      out.monsterDeathsByCause[cause] = (out.monsterDeathsByCause[cause] || 0) + 1;
      if (cause === 'villager combat' || cause === 'patrol combat') out.villagerKilledMonster++;
      else if (cause === 'combat' && killer && isPlayer(killer)) out.playerKilledMonster++;
    }
  }
  return out;
}

// The r21 misread, preserved as a regression fixture: cause-only counting
// treats 'villager combat' as villager-vs-villager. Must always exceed the
// true count on mixed corpora — the trap is real.
function r21Misread(deaths) {
  let n = 0;
  for (const d of (deaths || [])) {
    if (d && String(d.cause) === 'villager combat') n++;
  }
  return n;
}

// SPLIT HELPERS (r23): separate the two villager-kills-villager mechanics.
// Each returns the matching death records (same shape as villagerVsVillagerRecs).
function _isVillagerKiller(d, playerId, roster) {
  const killer = d.killerId != null ? String(d.killerId) : null;
  if (!killer) return false;
  const isPlayer = killer === playerId || killer === 'player' || killer === 'p';
  if (isPlayer || killer === String(d.who) || killer === String(d.vid)) return false;
  return !roster || roster.indexOf(killer) >= 0;
}
// M1a: open-combat v-vs-v — kind villager/person, cause 'combat', villager killer.
// The r21-claimed cell. Zero sightings through r23 (12 seeds).
function openCombatVV(deaths, opts) {
  opts = opts || {};
  const playerId = opts.playerId || 'p';
  const roster = opts.roster || null;
  return (deaths || []).filter(d => {
    if (!d) return false;
    const kind = String(d.kind || '?');
    if (kind !== 'villager' && kind !== 'person') return false;
    if (String(d.cause || '') !== 'combat') return false;
    return _isVillagerKiller(d, playerId, roster);
  });
}
// M1b: betrayal-ambush — kind villager/person, cause 'ambush', villager killer.
// Designed, narrated, rare-by-design. A RISE is the signal, not the existence.
function betrayalAmbushRecs(deaths, opts) {
  opts = opts || {};
  const playerId = opts.playerId || 'p';
  const roster = opts.roster || null;
  return (deaths || []).filter(d => {
    if (!d) return false;
    const kind = String(d.kind || '?');
    if (kind !== 'villager' && kind !== 'person') return false;
    if (String(d.cause || '') !== 'ambush') return false;
    return _isVillagerKiller(d, playerId, roster);
  });
}

module.exports = { census, r21Misread, openCombatVV, betrayalAmbushRecs };
