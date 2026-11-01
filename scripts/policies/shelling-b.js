'use strict';
// scripts/policies/shelling-b.js — REAL shelling-habit layer (sim-shelling-b).
//
// Policy-side habit, zero src/js changes: on return (immediately BEFORE
// Game.returnToVillage's haul block runs), the scholar shells the pack's
// in-shell nut lots, one engine call per lot, so the engine charges
// 4 ticks PER LOT (food.js shellNuts -> tickAction(4)). Shelled nuts are
// finished food, so the haul block can pool everything over the 2,000
// keep that same return. This is the packcomp flip (51107: 32 acorns,
// 3,616 kcal shelled) turned into a real action.
//
// WHY PACK, NOT COUNTER: the haul block inside returnToVillage is the
// only path by which a return unloads. Lots staged to the counter cannot
// unload that return, and counter-shell + putAwayFinished is a pantry
// deposit, not an unload (already tried as shellcounter, killed). A
// habit judged on unload MUST shell the pack before the haul block.
// The prereg (evidence/2026-11-01/sim-shelling-b-prereg.md) fixes this
// reading before any judged sim; this file implements exactly that.
//
// This file does NOT import shellcounter.js or shellrevive-b.js.
// Guards (all recorded, never silent): scholar alive, no combat, no
// active contest, day-budget guard (dayTicks + 4*lots < TICKS_PER_DAY;
// otherwise tickAction would trigger endDay BEFORE the haul block).
// A skipped return is recorded with its reason; it is never counted
// as a firing.
const KEEP_KCAL = 2000;
const TICKS_PER_LOT = 4;
const TICKS_PER_DAY = 512;

// summarizePack(inventory, isUnprocessed): pure pack census at a return.
// finishedKcal uses the haul-block definition (kcalEach > 0 AND NOT
// isUnprocessed). shelledNet uses the engine formula per lot:
// units x round((hiddenKcal || kcalEach) x 0.75).
function summarizePack(inventory, isUnprocessed) {
  const lots = [];
  let finishedKcal = 0;
  let shelledNet = 0;
  for (let i = 0; i < (inventory || []).length; i++) {
    const it = inventory[i];
    if (!it) continue;
    const unproc = !!isUnprocessed(it);
    const kcal = (it.kcalEach || 0) * (it.units || 0);
    if ((it.kcalEach || 0) > 0 && !unproc) finishedKcal += kcal;
    if (it.foodKind === 'nut' && it.foodState === 'in_shell') {
      const grossEach = it.hiddenKcal || it.kcalEach || 0;
      const netEach = Math.round(grossEach * 0.75);
      const net = netEach * (it.units || 0);
      shelledNet += net;
      lots.push({ index: i, name: it.name || null, units: it.units || 0,
        grossEach, netEach, net, plantId: it.plantId || null });
    }
  }
  finishedKcal = Math.round(finishedKcal);
  shelledNet = Math.round(shelledNet);
  const combined = finishedKcal + shelledNet;
  return { finishedKcal, shelledNet, combined,
    eligible: finishedKcal <= KEEP_KCAL && combined > KEEP_KCAL, lots };
}

// shellOnReturn(Game): fire the habit on one return. Returns an event
// object (fired true/false + reason + tick accounting). NEVER throws:
// a policy layer must not crash a sim; failures are recorded.
function shellOnReturn(Game) {
  const ev = { fired: false, reason: null, lots: 0, ticksCharged: 0,
    dayTicksBefore: null, dayTicksAfter: null, lotNames: [] };
  try {
    const s = (Game.state || {}).scholar || {};
    ev.dayTicksBefore = (s.dayTicks === undefined ? null : s.dayTicks);
    if (Game.over) { ev.reason = 'game-over-at-entry'; return ev; }
    if (Game.tbfight) { ev.reason = 'combat-or-contest'; return ev; }
    if (Game.state && Game.state.activeContest) { ev.reason = 'combat-or-contest'; return ev; }
    const inv = s.inventory || [];
    const isUnproc = (it) => { try { return !!Game.isUnprocessed(it); } catch (e) { return false; } };
    const sum = summarizePack(inv, isUnproc);
    if (!sum.lots.length) { ev.reason = 'no-in-shell-lots'; return ev; }
    const dayTicks = s.dayTicks || 0;
    if (dayTicks + TICKS_PER_LOT * sum.lots.length >= TICKS_PER_DAY) {
      ev.reason = 'late-day'; ev.lots = sum.lots.length; return ev;
    }
    // Shell one lot at a time, re-scanning after each: shellNuts
    // transforms in place, so indices stay valid and no lot is missed.
    let shelled = 0;
    for (;;) {
      const cur = (Game.state.scholar.inventory || []);
      let idx = -1;
      for (let i = 0; i < cur.length; i++) {
        if (cur[i] && cur[i].foodKind === 'nut' && cur[i].foodState === 'in_shell') { idx = i; break; }
      }
      if (idx < 0) break;
      const before = (Game.state.scholar.dayTicks || 0);
      Game.shellNuts(idx);
      const after = (Game.state.scholar.dayTicks || 0);
      // Tick accounting check: shellNuts must have charged exactly 4.
      // If the engine ever charges differently, record it honestly.
      ev._tickDeltas = ev._tickDeltas || [];
      ev._tickDeltas.push(after - before);
      const it = (Game.state.scholar.inventory || [])[idx];
      if (it) ev.lotNames.push(it.name || null);
      shelled++;
      if (shelled > 64) break; // runaway guard; packs never hold this many lots
    }
    ev.fired = shelled > 0;
    ev.lots = shelled;
    ev.ticksCharged = shelled * TICKS_PER_LOT;
    ev.dayTicksAfter = (Game.state.scholar.dayTicks === undefined ? null : Game.state.scholar.dayTicks);
    if (!ev.fired) ev.reason = 'shell-call-noop';
    return ev;
  } catch (e) {
    ev.reason = 'error:' + String(e && e.message).slice(0, 80);
    return ev;
  }
}

module.exports = { KEEP_KCAL, TICKS_PER_LOT, TICKS_PER_DAY, summarizePack, shellOnReturn };
