// scripts/corpsewire-instruments.js — wire-by-source instruments for arm sim-corpsewire-b.
//
// QUESTION (backlog #633, MATERIALS leg): does the base policy actually
// COLLECT wire from every corpse, or does wire strand on carcasses?
//
// Code facts this instruments (see evidence/2026-10-19/sim-corpsewire-b.md
// pre-registration for the full code reading):
//   - carcassToMeat (food.js:509) NEVER yields snare_wire — wire is not a
//     butchering yield anywhere. The "corpse channel" is looting DEAD
//     VILLAGERS, whose death packs hold their actual carried+stashed gear
//     (corpses.js generatePossessions).
//   - All wire deposits ride Game.registerDeath (death packs), all scholar
//     wire collections ride Game._corpseTakeStack (shared by corpseTakeItem
//     and corpseLootAll), all burials ride Game.buryCorpse.
//
// RNG-HYGIENE (the wirebootstrap b2 lesson): these wraps are read-only —
// they record into a side table keyed by corpse id (never write onto game
// state), call no engine enumerations that lazily roll RNG
// (never Game.tradeSpirit, never roster enumeration), and consume zero
// game RNG. The det-gate (scripts/det-gate-corpsewire-20261019.js) proves
// instrumented vs plain runs bit-identical.
//
// TOOLING ONLY — no game balance changes, no policy behavior changes.
'use strict';

const WIRE = 'snare_wire';

function isWire(it) {
  if (!it) return false;
  return it.itemId === WIRE || it.plantId === WIRE || it.id === WIRE;
}

function wireUnitsOf(items) {
  let n = 0;
  for (const it of (items || [])) {
    if (isWire(it)) n += (it.units == null ? 1 : it.units);
  }
  return n;
}

// instrumentWire(Game): wraps registerDeath / _corpseTakeStack / buryCorpse.
// Returns W — the side table. All counts are observation-only.
function instrumentWire(Game) {
  const W = {
    deposited: new Map(), // corpseId -> { units, kind, day, who }
    lootedByCorpse: new Map(), // corpseId -> wire units taken via _corpseTakeStack
    looted: 0,            // wire units the scholar took via _corpseTakeStack
    buried: 0,            // wire units sent into the ground via buryCorpse
    buriedByCorpse: new Set(), // corpseIds buried with wire still on them
    depositCalls: 0,
  };

  const oReg = Game.registerDeath;
  if (typeof oReg === 'function') {
    Game.registerDeath = function (opts) {
      const corpse = oReg.apply(this, arguments);
      try {
        if (corpse && corpse.id) {
          const units = wireUnitsOf(corpse.items);
          W.depositCalls++;
          if (units > 0) {
            W.deposited.set(corpse.id, {
              units,
              kind: corpse.kind,
              who: corpse.villagerId || corpse.monsterId || corpse.name,
              day: corpse.dayDied,
            });
          }
        }
      } catch (e) { /* observation must never break the run */ }
      return corpse;
    };
  }

  const oTake = Game._corpseTakeStack;
  if (typeof oTake === 'function') {
    Game._corpseTakeStack = function (c, it) {
      let units = 0;
      try { if (isWire(it)) units = (it.units == null ? 1 : it.units); } catch (e) {}
      const r = oTake.apply(this, arguments);
      try {
        if (units > 0) {
          W.looted += units;
          const cid = c && c.id;
          if (cid) W.lootedByCorpse.set(cid, (W.lootedByCorpse.get(cid) || 0) + units);
        }
      } catch (e) {}
      return r;
    };
  }

  const oBury = Game.buryCorpse;
  if (typeof oBury === 'function') {
    Game.buryCorpse = function (id) {
      let units = 0;
      try {
        const c = (this.corpses() || []).find(x => x && x.id === id);
        units = wireUnitsOf(c && c.items);
      } catch (e) {}
      const r = oBury.apply(this, arguments);
      try {
        if (units > 0 && id) { W.buried += units; W.buriedByCorpse.add(id); }
      } catch (e) {}
      return r;
    };
  }
  return W;
}

// harvestWire(Game, W): end-of-run accounting. Per-corpse exact buckets:
//   deposited — total wire units ever deposited on death packs
//   looted    — wire units collected via corpse verbs (per-corpse attributed)
//   buried    — wire units buried with bodies (grave goods)
//   strandedOnCorpse — wire still sitting on unlooted corpses at run end
//   decayedUnlooted  — wire on vanished corpses (40-cap stage-4 splice)
// Identity: deposited = looted + buried + strandedOnCorpse + decayedUnlooted
// (exact — per-corpse loot attribution, no upper bounds).
function harvestWire(Game, W) {
  const out = { deposited: 0, looted: W.looted, buried: W.buried,
    strandedOnCorpse: 0, decayedUnlooted: 0, strandsByRun: [], corpseCount: 0,
    wireCorpses: 0 };
  let corpses = [];
  try { corpses = Game.corpses() || []; } catch (e) {}
  const byId = new Map();
  for (const c of corpses) { if (c && c.id) byId.set(c.id, c); }
  out.corpseCount = byId.size;
  for (const [id, rec] of W.deposited) {
    out.deposited += rec.units;
    out.wireCorpses++;
    const took = W.lootedByCorpse.get(id) || 0;
    const buried = W.buriedByCorpse.has(id);
    const c = byId.get(id);
    if (!c) {
      // The corpse is gone (40-cap stage-4 splice). Wire not collected is
      // decayed with the bones: deposited - collected, exact.
      const gone = rec.units - took;
      if (gone > 0) {
        out.decayedUnlooted += gone;
        out.strandsByRun.push({ id, who: rec.who, kind: rec.kind, dayDied: rec.day, units: gone, fate: 'decayed-unlooted' });
      }
      continue;
    }
    const still = wireUnitsOf(c.items);
    if (still > 0) {
      out.strandedOnCorpse += still;
      out.strandsByRun.push({ id, who: rec.who, kind: rec.kind, dayDied: rec.day, units: still, fate: buried ? 'buried' : (c.looted ? 'looted-but-wire-left' : 'unlooted') });
    }
  }
  return out;
}

module.exports = { instrumentWire, harvestWire, isWire, wireUnitsOf, WIRE };
