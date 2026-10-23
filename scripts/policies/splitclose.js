// splitclose — "the scholar sets up, the village closes" (flesh-out loop,
// 2026-10-22, run fleshout-20261022T2125Z, arm sim-splitclose, axis
// scale-onramp, POLICY lever).
//
// THE BIND (evidence/2026-10-22/sim-wave4engage-r2.md, KILLED-AT-PILOT +
// evidence/2026-10-22/sim-compdamage.md DIAG + finding #794):
// the veterans bar is a companion-DAMAGE (capability) problem. The named
// next of both arms: "manufacture companion damage output at ~600+/fight
// median on kill fights, or redesign the kill channel (field fights,
// split-kill discipline)".
//
// THE TWO CAUTIONS THIS DESIGN ROUTES AROUND:
//   1. sim-splitkill KILLED-AT-PILOT: its TB soften/hold discipline fired
//      0/59 wave-4 fights — engagedCompanions() was empty in every one;
//      on its substrate the scholar fights wave-4 TB battles solo. A
//      discipline with no channel is a dead lever. THIS layer composes
//      OUTSIDE armorydrive's armedFor — the substrate where companions ARE
//      staged into wave-4 TB fights (armorydrive-confirm: 8/8 villager
//      wave-4 kills were TB via=companion TRICKTAG kills, 0 from the
//      patrol/wild field channel; the splitkill substrate's one "non-TB"
//      kill was a misattributed scholar kill — Leonard was the bearer at
//      kill time, via='player'). A scholar-soften discipline is
//      mechanically inexpressible in fieldFight (atomic, no scholar
//      present, no per-turn policy hook) — so the discipline goes on the
//      TB channel where the kills actually happen, with the staging the
//      channel needs.
//   2. sim-drivenofeast KILLED-AT-PILOT (finding #794): companion wave-4
//      kills rode the FEASTED x2.53 multiplier — the drive puts edges in
//      hands, the feast multiplies them; drive alone could not close.
//      THIS layer uses the multiplier HONESTLY: the yield band is
//      feasted-aware (probe-splitclose-damage-20261022.js measures
//      companion per-round damage split by FEASTED state), the layer
//      reads feastedActive() per turn and aims the companions' TRUE
//      closing power, and the evidence attributes kills by FEASTED-window
//      explicitly. No pretending the discipline works without it.
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
//     blow. Bounded: scholar hp >= 50%, never round 1, <= 10 hold
//     turns per fight, ends if the monster takes no companion damage
//     for 2 consecutive hold turns (stall) — then the scholar resumes
//     and finishes (via=player, still a kill for the village).
//   COMPANION SURVIVAL: an engaged companion below 40% HP ends the
//     hold — the scholar resumes striking immediately (fastest end =
//     fastest the companion stops taking damage). No breakoff:
//     finding #790 (armorcatch autopsy) proved fight-aborting
//     protection costs the veteran bar its kills. There is NO
//     per-companion withdrawal verb (#790) — the scholar
//     holding/striking is the whole policy-side action space, and this
//     layer stays inside it.
//
// THE YIELD BAND (honest definition, probe-anchored):
//   "the maximum damage the engaged companions can plausibly land as a
//   finishing blow" = p75 of per-(fight,round) companion damage vs
//   wave-4 non-titan monsters on the armorydrive substrate, split by
//   FEASTED state (probe scripts/probe-splitclose-damage-20261022.js,
//   seeds 65601-65602 x {leadfeast,belongfeast}, ARMORYDRIVE=1,
//   SEATDRIVE=0 — the same substrate the pilot runs on).
//   YIELD_BAND_FEASTED = 134 HP; YIELD_BAND_SOBER = 37 HP (probe p75s).
//   The layer picks the band from Game.feastedActive() each turn.
//   SCHOLAR_EST_INIT = 412 (probe scholar max single hit on this
//   substrate; the overshoot guard must never underestimate the strike).
//   HOLD_CAP = 10, STALL_TURNS = 2.
//
// SCOPE: the layer only acts inside wave-4 TB fights the armorydrive
// substrate already enters — it manufactures NO engagements (staging is
// armorydrive's business, owned by that layer). Non-wave-4 fights, titan
// fights (herald/nielsen/finale — the muster-gated class, #749), and
// companion-less fights delegate purely to base.fight.
//
// Env gate SPLITCLOSE=1 opts IN (default OFF). Gate off = pure
// delegation: no protocols, no fight flags, no RNG draws —
// byte-identical to the wrapped stack (the proof test's det-gate pins
// that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 = The Mirror
// Draft; bands damage 35-95, HP 850-1500; the readiness gate's VETERANS
// bar = 2 living roster members with wave-4+ kills in state.waveKillLog;
// VILLAGER XP LAW — villager kills score the ledger exactly like the
// player's; titan hard gate — no solo titan fights). No canon doc
// covers equipment — stated, not invented (same as the sibling arms).
'use strict';
const AD = require('./armorydrive');

// ---- yield bands (set from the design probe; see header) ----
// Probe (scripts/probe-splitclose-damage-20261022.js, seeds 65601-65602 x
// {leadfeast,belongfeast}, ARMORYDRIVE=1, SEATDRIVE=0 — the pilot substrate):
//   channel: 21 wave-4 TB fights, 13 with companion damage (the splitkill
//     substrate had 0/59 — the staging is the channel).
//   companion per-(fight,round) damage vs wave-4 non-titan:
//     FEASTED n=25: p50=76 p75=134 p90=162 max=175
//     SOBER   n=15: p50=26 p75=37  p90=42  max=49
//   companion max single hit: FEASTED p50=46 p90=114 max=134;
//     SOBER p50=24 p90=26 max=30.
//   scholar max single hit: n=37 p50=76 p90=407 max=412.
// Band = p75 of per-round companion damage (a good round closes from the
// band). The feasted/sober split is the drivenofeast honesty rule: the
// discipline aims the companions' TRUE closing power under the live buff.
var YIELD_BAND_FEASTED = 134;
var YIELD_BAND_SOBER = 37;
// Scholar per-turn damage estimate, init from probe max (upper bound;
// the overshoot guard must never UNDERESTIMATE the strike).
var SCHOLAR_EST_INIT = 412;
// Hold bounds (splitkill's proven shape): the shave from one safe
// scholar strike to the band takes a few companion rounds; cap 10 gives
// headroom, stall=2 hands back the finish if companions aren't closing.
var HOLD_CAP = 10;
var STALL_TURNS = 2;

var TITANS = { herald: true, nielsen: true, finale: true };

// ---------- module-level mechanism telemetry (sweep reads, proof ignores)
// Sequential sweeps only (never concurrent in one process). Incremented
// ONLY when the gate is on — gate-off delegation touches nothing.
var tele = null;
function resetTele() {
  tele = { w4Fights: 0, w4FightsWithComp: 0, softens: 0, holds: 0, bandHolds: 0, overshootHolds: 0, stallFinishes: 0, rescueStrikes: 0, feastedHolds: 0, soberHolds: 0, fightErrors: 0, holdErrors: 0 };
}
function tinc(k) { try { if (tele) tele[k] = (tele[k] | 0) + 1; } catch (e) {} }
resetTele();

function splitcloseOn() { return process.env.SPLITCLOSE === '1'; }

// ---------- reads ----------
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function isTitanMid(mid) { return !!TITANS[mid]; }
function feastedNow(Game) {
  try { return !!(Game.feastedActive && Game.feastedActive()); } catch (e) { return false; }
}
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
// The feasted-aware yield band: the companions' true closing power
// under the current buff state (the drivenofeast honesty rule).
function yieldBand(Game) {
  return feastedNow(Game) ? YIELD_BAND_FEASTED : YIELD_BAND_SOBER;
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
  const band = yieldBand(Game);

  // Per-fight state.
  let ds = ctx._scDisc;
  if (!ds || ds.fight !== f) {
    ds = ctx._scDisc = { fight: f, holds: 0, lastHoldHp: null, stall: 0, scholarEst: SCHOLAR_EST_INIT, lastTgtHp: null };
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

  const hurtComp = comps.find(c => (c.hp || 0) / Math.max(1, c.maxHp || c.hp || 1) < 0.40);
  if (hurtComp) {
    // COMPANION SURVIVAL: a bleeding companion ends the hold. The
    // fastest way to stop the companion taking damage is to END the
    // fight — the scholar resumes striking. No breakoff (#790).
    if (ds.holds > 0) { ctx.scRescueStrikes = (ctx.scRescueStrikes | 0) + 1; tinc('rescueStrikes'); }
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    return 'fight';
  }

  const inBand = tgtHp <= band;
  const inOvershoot = !inBand && (tgtHp - ds.scholarEst <= 0);
  if (!inBand && !inOvershoot) {
    // SOFTEN: above band+est — a strike cannot kill. Reset hold state,
    // fall through so the scholar strikes.
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    ctx.scSoftens = (ctx.scSoftens | 0) + 1; tinc('softens');
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
    ctx.scStallFinishes = (ctx.scStallFinishes | 0) + 1; tinc('stallFinishes');
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    return 'fight';
  }
  if (inOvershoot) { ctx.scOvershootHolds = (ctx.scOvershootHolds | 0) + 1; tinc('overshootHolds'); }
  return hold(Game, ctx, ds, inOvershoot ? 'overshoot' : 'band', band);
}

function hold(Game, ctx, ds, why, band) {
  ds.holds++;
  ds.lastHoldHp = null;
  try {
    const w4 = liveWave4(Game);
    let tgt = w4[0];
    for (const m of w4) if ((m.hp || 0) < (tgt.hp || 0)) tgt = m;
    ds.lastHoldHp = (tgt && tgt.hp) || 0;
  } catch (e) {}
  { ctx.scHolds = (ctx.scHolds | 0) + 1; tinc('holds'); }
  if (why === 'band') { ctx.scBandHolds = (ctx.scBandHolds | 0) + 1; tinc('bandHolds'); }
  if (feastedNow(Game)) { ctx.scFeastedHolds = (ctx.scFeastedHolds | 0) + 1; tinc('feastedHolds'); }
  else { ctx.scSoberHolds = (ctx.scSoberHolds | 0) + 1; tinc('soberHolds'); }
  ctx.scLastBand = band;
  try { Game.tbPlayerWait(); } catch (e) { ctx.scHoldErrors = (ctx.scHoldErrors | 0) + 1; tinc('holdErrors'); return 'fight'; }
  return 'hold';
}

function withSplitclose(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    fight(Game, ctx) {
      if (!splitcloseOn()) return base.fight(Game, ctx); // gate off: pure delegation, ctx untouched
      try {
        const f = Game.tbfight;
        if (f && ctx._scFightObj !== f) {
          ctx._scFightObj = f;
          ctx._scDisc = null;
          // Count wave-4 fights the discipline sees (titan-split per #749:
          // herald solo entries never start a TB fight; muster-gated titan
          // fights are excluded from the discipline's targets).
          if (liveWave4(Game).length) {
            ctx.scW4Fights = (ctx.scW4Fights | 0) + 1; tinc('w4Fights');
            if (engagedCompanions(Game).length) { ctx.scW4FightsWithComp = (ctx.scW4FightsWithComp | 0) + 1; tinc('w4FightsWithComp'); }
          }
        }
        const call = discipline(Game, ctx);
        if (call === 'hold') return true; // handled: the honest wait
        return base.fight(Game, ctx); // soften / finish / delegate
      } catch (e) {
        { ctx.scFightErrors = (ctx.scFightErrors | 0) + 1; tinc('fightErrors'); }
        return base.fight(Game, ctx);
      }
    },
  });
}

// Composition: the discipline OUTSIDE armorydrive's armedFor — the
// substrate where companions are staged into wave-4 TB fights (the
// channel the splitkill substrate lacked). SPLITCLOSE=1 only on the
// armed side; ARMORYDRIVE=1 on both.
function armedFor(base) {
  const b = AD.normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  return withSplitclose(AD.armedFor(b),
    `${tag}-splitclose`,
    `${b} + win-side layers, seat OFF (SEATDRIVE=0) + ARMORYDRIVE (ARMORYDRIVE=1) + SPLITCLOSE (SPLITCLOSE=1): scholar-softens/companion-closes discipline on the staged wave-4 channel`);
}
// Control: armorydrive's armedFor alone (the discipline's absence is
// the treatment — staging, arms, and feasts identical).
function controlFor(base) {
  return AD.armedFor(AD.normBase(base));
}

module.exports = {
  withSplitclose, splitcloseOn, armedFor, controlFor,
  yieldBand, feastedNow, liveWave4, engagedCompanions,
  bands: function () { return { feasted: YIELD_BAND_FEASTED, sober: YIELD_BAND_SOBER }; },
  scholarEstInit: function () { return SCHOLAR_EST_INIT; },
  _setBands: function (f, s) { YIELD_BAND_FEASTED = f; YIELD_BAND_SOBER = s; },
  _setScholarEst: function (v) { SCHOLAR_EST_INIT = v; },
  resetTele, tele: function () { return Object.assign({}, tele); },
};
