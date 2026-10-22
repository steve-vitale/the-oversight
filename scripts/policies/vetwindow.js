// vetwindow — "the window restraint" (flesh-out loop, 2026-10-22, run
// fleshout-20261022T1215Z, arm sim-vetwindow, axis scale-onramp).
//
// THE SURFACE (PHASE 1 DIAG, evidence/2026-10-22/diag-vetwindow.json):
// the veterans bar fills (w5vets2=2) but the veterans keep dying in
// OPTIONAL wave-4+ fights — the scholar's party engagements in the world,
// often RERUN-overtime-scaled (+25% HP / +12% damage per overtime level
// while the seat is untaken on the non-seat substrate). Zero sortie
// deaths across the DIAG corpus (the base policy never sorties; "endure"
// is the honest default and it holds) — the channel is the scholar's
// party walking into wave-4+ fights. Post-fill wave-4 kills buy ZERO
// veteran-bar progress (the bar is already filled; armorydrive's staging
// stands down on the same logic) — the fights are pure risk against the
// window. The mantle keeps promoting veterans to scholar, and then the
// scholar leads the next wave-4 party (Saleh->Shuting->Sanne;
// Ethan->Mia; Mai->Nadia->Saleh in the DIAG).
//
// THE RESTRAINT: while the window is live (veterans bar FILLED, wave-5
// door NOT open), the scholar's party disengages from wave-4+ fights at
// the first opportunity — immediate directional flee, not the
// assessment-threshold flee. Best-effort, never immunity: sealed fights
// hold (the engine says so), chasers follow (the chase plays out
// honestly), haven defense is never abandoned (chooseFleeDir holds at
// haven and the base handler fights). The door waits on armor/standing/
// bonds/bread meanwhile; the restraint keeps the veterans — and their
// worn armor — alive until it opens.
//
// SCOPE: scripts/policies/ ONLY, zero src/js. Composes OUTSIDE the
// armorydrive stack (AD.armedFor): the drive fills the bar, this layer
// keeps it filled. Never touches armor (no armor verbs exist
// policy-side, finding #646), never dismisses (negative gossip), never
// preempts the base stack.
//
// Env gate VETWINDOW=1 opts IN (default OFF). Gate off = pure
// delegation: fight/daily call the base exactly, ctx untouched — the
// proof test's E1 det-gate pins byte-identical trajectories.
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 = The Mirror
// Draft, bands 35-95 dmg / 850-1500 HP; the readiness gate's VETERANS
// bar = 2 living roster members with wave-4+ kills; VILLAGER XP LAW).
// No canon doc covers armor/equipment — stated, not invented.
'use strict';
const AD = require('./armorydrive');
const { chooseFleeDir } = require('./competent');

function vwOn() { return process.env.VETWINDOW === '1'; }

// The window: veterans bar filled AND the wave-5 door not yet open.
// Bar-filled reads the same live bar armorydrive's staging stands down
// on (AD.w5VetBarMet); the door reads the unlock number directly.
function vwWindowLive(Game) {
  try {
    if (!AD.w5VetBarMet(Game)) return false;
    const uw = (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1) | 0;
    return uw < 5;
  } catch (e) { return false; }
}

// Max wave among living, non-fled monsters in the current TB fight.
function vwFightWave(Game) {
  let w = 0;
  try {
    const f = Game.tbfight;
    if (!f || f.over) return 0;
    const defs = (Game.data || {}).monsters || [];
    for (const x of (f.fighters || [])) {
      if (!x || x.kind !== 'monster' || (x.hp || 0) <= 0 || x.fled) continue;
      const mid = x.monsterId || (x.mdef || {}).id || x.id;
      const def = defs.find(d => d && d.id === mid);
      if (def && def.wave) w = Math.max(w, def.wave | 0);
    }
  } catch (e) {}
  return w;
}

// Immediate directional flee (the competent.js directional-flee shape,
// re-implemented on the exported chooseFleeDir — the wrapper cannot reach
// the base fight handler's inline flee closure). One turn of movement:
// walk toward the havenward edge, or push THROUGH the barrier when
// already on it. Returns true when a flee turn was taken.
function vwFlee(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return false;
    if (!(Game.tbIsPlayerTurn && Game.tbIsPlayerTurn())) return false;
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    if (!p) return false;
    const endTurn = () => {
      try {
        const q = Game.tbFighter('p');
        q.moveLeft = 0; q.acted = true;
        Game.tbAfterPlayerAction();
      } catch (e) {}
    };
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    let dir = null;
    try {
      const mpx = Game.map.px, mpy = Game.map.py;
      dir = chooseFleeDir(Game, mpx, mpy);
    } catch (e) { dir = null; }
    if (!dir) { ctx.vwFleeHeld = (ctx.vwFleeHeld || 0) + 1; return false; } // at haven / no exit: hold
    const tx = dir.dx < 0 ? 0 : dir.dx > 0 ? 8 : px;
    const ty = dir.dy < 0 ? 0 : dir.dy > 0 ? 8 : py;
    if (px === tx && py === ty) {
      try { Game.tbBarrierExit(dir.dx, dir.dy); } catch (e) {}
      ctx.vwFlees = (ctx.vwFlees || 0) + 1;
    } else {
      try { Game.tbPlayerMove(px + dir.dx, py + dir.dy); } catch (e) {}
      ctx.vwFleeWalks = (ctx.vwFleeWalks || 0) + 1;
    }
    endTurn();
    return true;
  } catch (e) { return false; }
}

function withVetWindow(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    fight(Game, ctx) {
      if (!vwOn()) return base.fight(Game, ctx); // gate off: pure delegation
      try {
        if (vwWindowLive(Game) && vwFightWave(Game) >= 4) {
          ctx.vwRestrainedFights = (ctx.vwRestrainedFights || 0) + 1;
          if (vwFlee(Game, ctx)) return true; // disengaged: the turn is spent
          // Flee unavailable (sealed, held at haven, push failed): fall
          // through to the base handler — a held fight is fought, never
          // frozen. The restraint is best-effort.
          ctx.vwFleeFallback = (ctx.vwFleeFallback || 0) + 1;
        }
      } catch (e) { /* fall through to base on any restraint error */ }
      return base.fight(Game, ctx);
    },
    daily(Game, ctx) {
      if (!vwOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // the whole stack runs first and fully — never preempted
      try {
        if (vwWindowLive(Game)) ctx.vwWindowDays = (ctx.vwWindowDays || 0) + 1; // counts only
      } catch (e) {}
    },
  });
}

function normBase(base) { return AD.normBase(base); }
// Control for the pilot: the armorydrive stack (ARMORYDRIVE=1 outside the
// non-seat substrate), VETWINDOW unset.
function substrateFor(base) { return AD.armedFor(normBase(base)); }
// The vetwindow arm: the restraint OUTSIDE the same stack, VETWINDOW=1.
function armedFor(base) {
  const b = normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  return withVetWindow(substrateFor(b),
    `${tag}-vetwindow`,
    `${b} + armorydrive (ARMORYDRIVE=1) + VETWINDOW restraint (VETWINDOW=1): disengage wave-4+ fights while the veterans bar is filled and the wave-5 door is shut`);
}

module.exports = {
  vwOn, vwWindowLive, vwFightWave, vwFlee,
  withVetWindow, normBase, substrateFor, armedFor,
};
