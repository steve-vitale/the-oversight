// splitkill — "the scholar sets up, the village closes" (flesh-out loop,
// 2026-10-22, run fleshout-20261022T0715Z, arm sim-splitkill, axis
// scale-onramp).
//
// THE BIND (evidence/2026-10-22/sim-wave4engage-r2.md, KILLED-AT-PILOT):
// the veterans bar is a companion-DAMAGE (capability) problem, not an
// opportunity problem. The wave4engage arm manufactured 174 patrol days and
// 36 wave-4 fights with engaged companions dealing ~half the party's
// damage — and produced 0/16 armed villager wave-4 kills (control: 7).
// Its no-scholar-finish discipline removed the only reliable finisher;
// companions could not close wave-4 HP pools (850-1500) on their own.
// Its SECOND NAMED NEXT is this arm: SPLIT THE KILL — the scholar
// softens the target INTO THE YIELD BAND, then holds while companions
// close. This is NOT the killed blanket no-finish discipline: the
// scholar's softening is the mechanism under test, and the hold is
// BOUNDED — a stalled hold hands the finish back to the scholar (a
// zero-kill fight is the wave4engage failure mode, never repeated).
//
// DESIGN (all policy-side, zero src/js):
//   SOFTEN: on the scholar's TB turn, with live non-titan wave-4
//     monster(s) and >=1 engaged party companion, the scholar fights
//     normally (falls through to base.fight) while the weakest live
//     wave-4 target's HP is above the yield band + the scholar's
//     observed per-turn damage (the overshoot guard: a strike that
//     would kill outright is never taken — the scholar holds instead).
//   HOLD: once the target is inside the yield band, the scholar holds
//     (Game.tbPlayerWait — the honest hold, advances the turn, can
//     never kill) so the engaged companions' turns get the killing
//     blow. Bounded: scholar hp >= 50%, never round 1, <= 6 hold
//     turns per fight, ends if the monster takes no companion damage
//     for 2 consecutive hold turns (stall) — then the scholar resumes
//     and finishes (via=player, still a kill for the village).
//   COMPANION SURVIVAL: an engaged companion below 40% HP ends the
//     hold — the scholar resumes striking immediately (fastest end =
//     fastest the companion stops taking damage). No breakoff:
//     finding #790 (armorcatch autopsy) proved fight-aborting
//     protection costs the veteran bar its kills, and the
//     scholarsurvive autopsy proved withdrawal relocates encounters
//     rather than reducing them. There is NO per-companion
//     withdrawal verb (#790) — the scholar holding/striking is the
//     whole policy-side action space, and this layer stays inside it.
//
// THE YIELD BAND (honest definition, probe-anchored):
//   "the maximum damage the engaged companions can plausibly land as a
//   finishing blow" = p75 of per-(fight,round) companion damage vs
//   wave-4 non-titan monsters on the control substrate (probe
//   scripts/probe-splitkill-damage-20261022.js, seeds 65501-65504 x
//   {leadfeast,belongfeast}, pre-seat substrate, VGEAR unset — the same
//   substrate the pilot runs on). Band = <SET FROM PROBE> HP.
//   Rationale: at the band, companions land >= the target's remaining
//   HP in a good (top-quartile) round — the scholar's hold gives them
//   up to 6 rounds to have one. PROBE PROVENANCE recorded in the
//   evidence header (evidence/2026-10-22/sim-splitkill.md).
//
// SCOPE: the layer only acts inside wave-4 TB fights the base policy
// already enters — it manufactures NO engagements (opportunity is
// proven on this substrate: sim-villagergear pilot 3/8 armed seeds with
// a villager wave-4 kill vs 0/8 control). Non-wave-4 fights, titan
// fights (herald/nielsen/finale — the muster-gated class, #749), and
// companion-less fights delegate purely to base.fight.
//
// Env gate SPLITKILL=1 opts IN (default OFF). Gate off = pure
// delegation: no protocols, no fight flags, no RNG draws —
// byte-identical to the wrapped stack (the proof test's det-gate pins
// that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 roster +
// bands, the readiness gate, VILLAGER XP LAW — villager kills score the
// ledger exactly like the player's).
'use strict';

// ---- yield band (set from the design probe; see header) ----
// Probe (scripts/probe-splitkill-damage-20261022.js, seeds 65501-65502 x
// {leadfeast,belongfeast}, pre-seat control substrate, VGEAR unset):
//   companion per-(fight,round) damage vs wave-4: p50=10 p75=12 p90=12 max=12 (n=5)
//   companion max single hit: p50=10 p90=12 max=12
//   scholar max single hit: p50=170 p90=192 max=202 (n=21)
// Band = 12: the maximum damage engaged companions plausibly land as a
// finishing blow (one good round). Thin sample (n=5) — ballpark 10-15;
// the design is robust across that range (shave rounds scale linearly).
var YIELD_BAND = 12;
// Scholar per-turn damage estimate, init from probe max (upper bound;
// the overshoot guard must never UNDERESTIMATE the strike).
var SCHOLAR_EST_INIT = 200;
// Hold bounds: the shave from one safe strike (~80 HP left) to the band
// takes ~6 companion rounds at 12/round; cap 10 gives headroom, stall=2
// hands back the finish if companions aren't closing.
var HOLD_CAP = 10;
var STALL_TURNS = 2;

var TITANS = { herald: true, nielsen: true, finale: true };

// ---------- module-level mechanism telemetry (sweep reads, proof ignores)
// Sequential sweeps only (never concurrent in one process). Incremented
// ONLY when the gate is on — gate-off delegation touches nothing.
var tele = null;
function resetTele() {
  tele = { w4Fights: 0, softens: 0, holds: 0, bandHolds: 0, overshootHolds: 0, stallFinishes: 0, rescueStrikes: 0, fightErrors: 0, holdErrors: 0 };
}
function tinc(k) { try { if (tele) tele[k] = (tele[k] | 0) + 1; } catch (e) {} }
resetTele();

function splitkillOn() { return process.env.SPLITKILL === '1'; }

// ---------- reads ----------
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function isTitanMid(mid) { return !!TITANS[mid]; }
// Live non-titan wave-4 monsters in the current TB fight.
function liveWave4(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    return (f.fighters || []).filter(x => x && x.kind === 'monster' &&
      (x.hp || 0) > 0 && !x.fled && !isTitanMid(beastMidOf(x)) &&
      beastWaveOf(Game, beastMidOf(x)) === 4);
  } catch (e) { return []; }
}
// Engaged party companions: alive, not fled, in the scholar's party.
function engagedCompanions(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    const party = (Game.partyMembers ? Game.partyMembers() : []) || [];
    return (f.fighters || []).filter(x => x && x.alive && !x.fled &&
      (x.kind === 'villager' || x.kind === 'ally') &&
      x.villagerId && party.includes(x.villagerId));
  } catch (e) { return []; }
}
function scholarHpPct(Game) {
  try {
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    if (!p) return 1;
    return (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
  } catch (e) { return 1; }
}

// ---------- the discipline ----------
function discipline(Game, ctx) {
  // Returns 'hold' | 'fight' (fall through to base.fight). Never acts
  // when the gate is off — the wrapper guarantees that.
  const f = Game.tbfight;
  if (!f || f.over) return 'fight';
  let isPlayerTurn = false;
  try { isPlayerTurn = !!(Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()); } catch (e) {}
  if (!isPlayerTurn) return 'fight';
  const w4 = liveWave4(Game);
  if (!w4.length) return 'fight';
  const comps = engagedCompanions(Game);
  if (!comps.length) return 'fight'; // no closers staged: the scholar is the finisher

  // Weakest live wave-4 target.
  let tgt = w4[0];
  for (const m of w4) if ((m.hp || 0) < (tgt.hp || 0)) tgt = m;
  const tgtHp = tgt.hp || 0;

  // Per-fight state.
  let ds = ctx._skDisc;
  if (!ds || ds.fight !== f) {
    ds = ctx._skDisc = { fight: f, holds: 0, lastHoldHp: null, stall: 0, scholarEst: SCHOLAR_EST_INIT, lastTgtHp: null };
  }
  // Scholar per-turn damage estimate: the target-HP delta across the
  // scholar's own turns (includes companion damage between turns, so it
  // is an UPPER bound — conservative for the overshoot guard). Monster
  // healing (Ad Break) can push the delta negative; clamp at 0.
  if (ds.lastTgtHp != null && tgtHp < ds.lastTgtHp) {
    const dealt = ds.lastTgtHp - tgtHp;
    if (dealt > ds.scholarEst) ds.scholarEst = dealt;
  }
  ds.lastTgtHp = tgtHp;

  const round = (f && f.round) || 1;
  const hpPct = scholarHpPct(Game);

  // Stall proxy: whether the target's HP decreased since the last hold
  // decision (healing clamps the stall counter — Ad Break can heal).
  const hurtComp = comps.find(c => (c.hp || 0) / Math.max(1, c.maxHp || c.hp || 1) < 0.40);
  if (hurtComp) {
    // COMPANION SURVIVAL: a bleeding companion ends the hold. The
    // fastest way to stop the companion taking damage is to END the
    // fight — the scholar resumes striking. No breakoff (#790).
    if (ds.holds > 0) { ctx.skRescueStrikes = (ctx.skRescueStrikes | 0) + 1; tinc('rescueStrikes'); }
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    return 'fight';
  }

  const inBand = tgtHp <= YIELD_BAND;
  const inOvershoot = !inBand && (tgtHp - ds.scholarEst <= 0);
  if (!inBand && !inOvershoot) {
    // SOFTEN: above band+est — a strike cannot kill. Reset hold state,
    // fall through so the scholar strikes.
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    ctx.skSoftens = (ctx.skSoftens | 0) + 1; tinc('softens');
    return 'fight';
  }
  // HOLD REGIME (shared for the band and the overshoot shave): the
  // scholar holds so the companions close. Bounded on all sides —
  // an unbounded hold is the wave4engage failure mode.
  if (hpPct < 0.5 || round < 2 || ds.holds >= HOLD_CAP) {
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    return 'fight'; // hold window closed — the scholar finishes
  }
  // Stall rule: no target-HP decrease across consecutive hold turns
  // means the companions aren't closing — hand the finish back.
  if (ds.lastHoldHp != null) {
    if (tgtHp >= ds.lastHoldHp) ds.stall++;
    else ds.stall = 0;
  }
  if (ds.stall >= STALL_TURNS) {
    ctx.skStallFinishes = (ctx.skStallFinishes | 0) + 1; tinc('stallFinishes');
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    return 'fight';
  }
  if (inOvershoot) { ctx.skOvershootHolds = (ctx.skOvershootHolds | 0) + 1; tinc('overshootHolds'); }
  return hold(Game, ctx, ds, inOvershoot ? 'overshoot' : 'band');
}

function hold(Game, ctx, ds, why) {
  ds.holds++;
  ds.lastHoldHp = null;
  try {
    const w4 = liveWave4(Game);
    let tgt = w4[0];
    for (const m of w4) if ((m.hp || 0) < (tgt.hp || 0)) tgt = m;
    ds.lastHoldHp = (tgt && tgt.hp) || 0;
  } catch (e) {}
  { ctx.skHolds = (ctx.skHolds | 0) + 1; tinc('holds'); }
  if (why === 'band') { ctx.skBandHolds = (ctx.skBandHolds | 0) + 1; tinc('bandHolds'); }
  try { Game.tbPlayerWait(); } catch (e) { ctx.skHoldErrors = (ctx.skHoldErrors | 0) + 1; tinc('holdErrors'); return 'fight'; }
  return 'hold';
}

function withSplitkill(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    fight(Game, ctx) {
      if (!splitkillOn()) return base.fight(Game, ctx); // gate off: pure delegation, ctx untouched
      try {
        const f = Game.tbfight;
        if (f && ctx._skFightObj !== f) {
          ctx._skFightObj = f;
          ctx._skDisc = null;
          // Count wave-4 fights the discipline sees (titan-split per #749:
          // herald solo entries never start a TB fight; muster-gated titan
          // fights are excluded from the discipline's targets).
          if (liveWave4(Game).length) { ctx.skW4Fights = (ctx.skW4Fights | 0) + 1; tinc('w4Fights'); }
        }
        const call = discipline(Game, ctx);
        if (call === 'hold') return true; // handled: the honest wait
        return base.fight(Game, ctx); // soften / finish / delegate
      } catch (e) {
        { ctx.skFightErrors = (ctx.skFightErrors | 0) + 1; tinc('fightErrors'); }
        return base.fight(Game, ctx);
      }
    },
  });
}

module.exports = { withSplitkill, splitkillOn, YIELD_BAND: function () { return YIELD_BAND; }, _setBand: function (v) { YIELD_BAND = v; }, resetTele: resetTele, tele: function () { return Object.assign({}, tele); } };
