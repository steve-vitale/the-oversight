// vetbench — "the veteran bench" (flesh-out loop, 2026-10-22, run
// fleshout-20261022T1915Z, arm sim-vetbench, axis scale-onramp).
//
// THE SURFACE (the 1717Z sim-windowloss DIAG + the vetwindow restraint
// probe, evidence/2026-10-22/sim-windowloss.md): the restraint probe
// fired (24 fights/28 window-days) but every window fight was a haven
// assault — chooseFleeDir holds at haven BY DESIGN, so restraint
// executed ZERO disengagements and the veterans still died at the haven
// door. The DIAG's named runner-up: while the post-veterans window is
// live (VETERANS bar filled, wave-5 door shut), veterans do NOT join
// wave-4+ haven-door fights — they bench. The door must still be held
// by non-veterans: no fleeing, no purposeless disengagement (Steve's
// law — monsters were sent to fight, and villagers defend the haven).
//
// THE BENCH (policy-side, zero src/js): once per day (policy.daily,
// which runs before Game.sleep — ahead of the night's raid draft), while
// the window is live, the layer shelters the bar-filling veterans via
// the engine's own shelter verb (src/js/shelter.js). Sheltered villagers
// are mechanically excluded from the haven raid draft (havenGrowth.js
// havenRaidTick reads isSheltered), the wild router (game.js
// villagerMonsterTick), and duties (mustered, not working — lost
// production is the honest, legible cost). When the window closes (door
// opens, or the bar drops), the layer releases the veterans it benched
// — unless the game-side muster owns them (v.shelterMustered) or one
// became the scholar (the player's piece now). The scholar is never
// benched (scholar_never_auto_sheltered — the verb skips the player's
// villager; the vetwindow restraint already covers the scholar's own
// disengagement).
//
// SCOPE: scripts/policies/ ONLY, zero src/js. Composes OUTSIDE the
// armorydrive stack (AD.armedFor): the drive fills the bar, the bench
// keeps it filled — staging stands down exactly when the bench fires
// (stagingLive requires !w5VetBarMet), so the two never overlap. Never
// touches armor (no armor verbs exist policy-side, finding #646),
// never dismisses, never preempts the base stack.
//
// Env gate VETBENCH=1 opts IN (default OFF). Gate off = pure
// delegation: daily calls the base exactly, ctx untouched — the proof
// test's E1 det-gate pins byte-identical trajectories.
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 = The Mirror
// Draft; wave-5 = The Producers; the readiness gate's VETERANS bar = 2
// living roster members with wave-4+ kills in state.waveKillLog).
// No canon doc covers armor/equipment — stated, not invented.
'use strict';
const AD = require('./armorydrive');
const VW = require('./vetwindow');

function vbOn() { return process.env.VETBENCH === '1'; }

// The window: the vetwindow probe's exact recognition (kept identical so
// the two layers agree on when the window is live).
function vbWindowLive(Game) { return VW.vwWindowLive(Game); }

function vbIsLiving(Game, vid) {
  try {
    if (vid === Game.villagerId) return true;
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
    return !!(vp && !vp.dead);
  } catch (e) { return false; }
}

// The bar-filling veterans: living roster members with a wave-4+ kill in
// state.waveKillLog (the VETERANS bar's own counting line, standing.js),
// excluding the scholar (never benched — the verb would skip them anyway).
function vbVetVids(Game) {
  const out = [];
  try {
    const v = (Game.state || {}).village || {};
    const scholar = Game.villagerId || null;
    for (const vid of (v.roster || [])) {
      if (!vid || vid === scholar) continue;
      if (!vbIsLiving(Game, vid)) continue;
      if (AD.hasWave4Kill(Game, vid)) out.push(vid);
    }
  } catch (e) {}
  return out;
}

// Draft-eligible: the same health/home reads the raid draft uses
// (havenGrowth.js havenRaidTick) — a veteran the draft could spend.
function vbDraftEligible(Game, vid) {
  try {
    const v = (Game.state || {}).village || {};
    if (vid === Game.villagerId) return false;
    if (v.away && v.away[vid]) return false;
    if (Game.isSheltered && Game.isSheltered(vid)) return false;
    const h = (v.health || {})[vid];
    if (typeof h === 'number' && h <= 40) return false;
    return true;
  } catch (e) { return false; }
}

function vbName(Game, vid) {
  try {
    if (Game.displayName) return Game.displayName(vid);
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return 'someone';
}

// The bench beat (bounded: once per vid per window). The bench is
// protective and the veterans chafe — they read as people, not counters.
function vbBenchSay(Game, vid) {
  try {
    const n = vbName(Game, vid);
    Game.say(`🛡️ ${n} takes the bench — the village needs its veterans alive while the door waits. ${n} chafes at the order: "You need me at the door." "We need you standing," the watch answers, and bars it.`);
  } catch (e) {}
}

function vbReleaseSay(Game, vids) {
  try {
    if (!vids.length) return;
    const names = vids.map(v => vbName(Game, v)).join(', ');
    Game.say(`📯 The bench stands down — ${names} ${vids.length === 1 ? 'takes' : 'take'} up ${vids.length === 1 ? 'their' : 'their'} work again, rolling the stiffness out of ${vids.length === 1 ? 'their' : 'their'} shoulders.`);
  } catch (e) {}
}

function withVetBench(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!vbOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // the whole stack runs first and fully — never preempted
      try {
        ctx.vbMine = ctx.vbMine || []; // vids THIS layer sheltered
        ctx.vbSaid = ctx.vbSaid || {}; // bench-beat dedupe per window
        const live = vbWindowLive(Game);
        const v = (Game.state || {}).village || {};
        if (live) {
          ctx.vbWindowDays = (ctx.vbWindowDays || 0) + 1;
          const scholar = Game.villagerId || null;
          const mineNow = [];
          for (const vid of ctx.vbMine) {
            if (vid === scholar) {
              try { if (Game.releaseShelter) Game.releaseShelter([vid]); } catch (e) {}
              ctx.vbReleased = (ctx.vbReleased || 0) + 1;
            } else mineNow.push(vid);
          }
          ctx.vbMine = mineNow;
          const vets = vbVetVids(Game);
          const eligible = vets.filter(vid => vbDraftEligible(Game, vid));
          // Veterans the game-side muster already sheltered are benched
          // by the muster, not by this layer — diagnostic only.
          const mustered = vets.filter(vid => {
            try { return !!(Game.isSheltered && Game.isSheltered(vid)) && !eligible.includes(vid); }
            catch (e) { return false; }
          });
          if (mustered.length) ctx.vbMusterCovered = (ctx.vbMusterCovered || 0) + mustered.length;
          // Window anatomy (pure ctx write — no extra Game reads, so the
          // instrument cannot perturb the trajectory it observes).
          try {
            ctx.vbWindowAnatomy = ctx.vbWindowAnatomy || [];
            const day = ((Game.state || {}).scholar || {}).day || 0;
            ctx.vbWindowAnatomy.push({ day, vets: vets.slice(), eligible: eligible.slice(), mustered: mustered.slice(), scholar: Game.villagerId || null });
          } catch (e) {}
          if (eligible.length && Game.shelterVillagers) {
            const n = Game.shelterVillagers(eligible, { reason: 'vetbench', quiet: true }) | 0;
            if (n > 0) {
              ctx.vbBenched = (ctx.vbBenched || 0) + n;
              ctx.vbEngaged = true; // ENGAGEMENT PREDICATE (pre-reg exact)
              for (const vid of eligible) {
                let already = false;
                try { already = !!(Game.isSheltered && Game.isSheltered(vid)); } catch (e) {}
                if (already && ctx.vbMine.indexOf(vid) < 0) ctx.vbMine.push(vid);
                if (!ctx.vbSaid[vid]) { vbBenchSay(Game, vid); ctx.vbSaid[vid] = true; }
              }
            }
          }
          ctx.vbBenchDays = (ctx.vbBenchDays || 0) + ctx.vbMine.length;
        } else {
          // Window closed: stand the bench down. Never release villagers
          // the game-side muster owns (v.shelterMustered) — the muster
          // re-checks daily and stands itself down.
          if (ctx.vbMine.length) {
            const musterActive = !!(v && v.shelterMustered);
            if (!musterActive && Game.releaseShelter) {
              const released = ctx.vbMine.slice();
              Game.releaseShelter(released);
              ctx.vbReleased = (ctx.vbReleased || 0) + released.length;
              vbReleaseSay(Game, released);
            }
            if (musterActive) ctx.vbMineMusterHeld = (ctx.vbMineMusterHeld || 0) + ctx.vbMine.length;
            ctx.vbMine = musterActive ? ctx.vbMine : [];
          }
          ctx.vbSaid = {}; // next window gets fresh beats
        }
      } catch (e) { /* fail-closed: the bench never kills a run */ }
    },
  });
}

function normBase(base) { return AD.normBase(base); }
// Control for the pilot: the armorydrive stack (ARMORYDRIVE=1 outside the
// non-seat substrate), VETBENCH unset.
function substrateFor(base) { return AD.armedFor(normBase(base)); }
// The vetbench arm: the bench OUTSIDE the same stack, VETBENCH=1.
function armedFor(base) {
  const b = normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  return withVetBench(substrateFor(b),
    `${tag}-vetbench`,
    `${b} + armorydrive (ARMORYDRIVE=1) + VETBENCH bench (VETBENCH=1): shelter the bar-filling veterans while the post-veterans window is live (bar filled, wave-5 door shut)`);
}

module.exports = {
  vbOn, vbWindowLive, vbIsLiving, vbVetVids, vbDraftEligible,
  withVetBench, normBase, substrateFor, armedFor,
};
