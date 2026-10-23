// vetformation — "blood the formation" (flesh-out loop, 2026-10-23, run
// fleshout-20261023T1215Z, arm sim-vetformation, axis scale-onramp, the
// FORMATION half of the veterans coincidence trap).
//
// THE BIND (sim-vetkill-autopsy 2026-10-23, evidence/2026-10-23/sim-vetkill-autopsy.md):
// the defer5 readiness bar (standing.js waveCombatReadiness(5)) demands 2
// LIVING wave-4+ killers. The autopsy census (16 configs, armorydrive pinned
// substrate): 15 wave-4+ kills, 10 killer vids, 8 of 10 dead within ~6d —
// but 10/16 configs NEVER FORMED a veteran at all. Formation > retention
// as the bigger lever. Scholar holds 0/10 wave-4 kills (blooded fiction
// lands on companions). This layer attacks FORMATION.
//
// THE CHANNEL (sim-feastdisc-confirm 2026-10-22): 8/8 villager wave-4 kills
// on the armorydrive substrate were TB via=companion kills — the TB fight
// with staged companions is where formation happens. armorydrive stages 2
// companions; this layer stages the KILL-FORMATION and disciplines the
// close, composing OUTSIDE armorydrive's armedFor (zero src/js).
//
// DESIGN (all policy-side, zero src/js):
//   FORMATION (daily beat): threat-driven staging. When the staging window
//     is live (wave-4 unlocked && the wave-5 veterans bar unmet — the same
//     live reads as armorydrive/feastdiscipline) AND a wave-4+ monster sits
//     on a travel target (imminent — feastdiscipline's threat signal), the
//     policy commits the formation: the best armed fighter as anchor PAIRED
//     with the best armed non-veterans (a veteran's repeat kill forms
//     nothing), up to 3 in party (armorydrive holds 2; the formation adds
//     the third when the threat is real). Invites are consent-based
//     (Game.inviteToParty — personality/goals decide, VGEAR protocol
//     shape); NEVER dismisses (people, not pieces). Non-suicidal: armed
//     (weapon to hand, bonus > 0), hp >= 40%, trust >= 20. The commit is
//     voiced once per threat day — brave things, named companions.
//   FINISHING (fight wrapper): inside wave-4 TB fights (non-titan — the
//     #749 muster-gated class is excluded, same as splitclose), on the
//     scholar's turn, when >=1 engaged companion is a non-veteran (a
//     veteran's next kill advances nothing, so the scholar doesn't hold
//     for it): the scholar softens above the yield band and HOLDS inside
//     it (Game.tbPlayerWait — the honest hold) so the engaged companions
//     get kill-finishing priority on the weakened monster. Overshoot guard
//     (a strike that could kill is never taken), hold cap 10, stall 2,
//     companion-survival rescue (<40% HP ends the hold — the fastest way to
//     stop a companion taking damage is to END the fight; no breakoff,
//     finding #790), never round 1, scholar hp >= 50%.
//   The yield band is feasted-aware (the drivenofeast honesty rule),
//   inherited from the splitclose probe on the IDENTICAL substrate
//   (scripts/probe-splitclose-damage-20261022.js, ARMORYDRIVE=1,
//   SEATDRIVE=0): FEASTED p75 = 134 HP, SOBER p75 = 37 HP.
//
// SENSE (SENSE-TESTING LAW): companions must read as people doing brave
// things, not drones — the commit beat names them, the engine's own invite
// acceptance/refusal lines carry the personality, and the killbeat
// (companionKillBeat, game.js) already voices the kill.
//
// Env gate VETFORMATION=1 opts IN (default OFF). Gate off = pure
// delegation: no beats, no fight flags, no RNG draws, no ctx writes —
// byte-identical to the wrapped stack (the proof test's det-gate pins
// that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 = The Mirror
// Draft; the readiness gate's VETERANS bar = 2 living roster members with
// wave-4+ kills in state.waveKillLog; VILLAGER XP LAW; the hold never names
// the wave's title — knowledge-gate discipline). No canon doc covers
// equipment — stated, not invented (same as the sibling arms).
'use strict';
const AD = require('./armorydrive');

function vfOn() { return process.env.VETFORMATION === '1'; }

// ---------- yield bands (inherited — see header) ----------
var YIELD_BAND_FEASTED = 134;
var YIELD_BAND_SOBER = 37;
var SCHOLAR_EST_INIT = 412;
var HOLD_CAP = 10;
var STALL_TURNS = 2;
var FORMATION_SIZE = 3;   // anchor + two forming fighters when the threat is real
var HP_FLOOR = 0.40;      // not suicidally: below this a companion is not committed
var TITANS = { herald: true, nielsen: true, finale: true };

// ---------- module-level mechanism telemetry (sweep reads, proof ignores)
// Sequential sweeps only (never concurrent in one process). Incremented
// ONLY when the gate is on — gate-off delegation touches nothing.
var tele = null;
function resetTele() {
  tele = {
    formationDays: 0, formationCommits: 0, formationInvitesOk: 0,
    skippedNoThreat: 0, skippedWindow: 0, skippedFull: 0, skippedHaven: 0,
    w4Fights: 0, w4FightsWithComp: 0, w4FightsFormed2: 0,
    softens: 0, holds: 0, bandHolds: 0, overshootHolds: 0,
    stallFinishes: 0, rescueStrikes: 0, feastedHolds: 0, soberHolds: 0,
    holdSkippedAllVets: 0, fightErrors: 0, holdErrors: 0,
  };
}
function tinc(k) { try { if (tele) tele[k] = (tele[k] | 0) + 1; } catch (e) {} }
resetTele();

// ---------- reads (engine-honest shapes from the sibling layers) ----------
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function isTitanMid(mid) { return !!TITANS[mid]; }
function stagingWindowLive(Game) {
  try { return AD.wave4Unlocked(Game) && !AD.w5VetBarMet(Game); }
  catch (e) { return false; }
}
function feastedNow(Game) {
  try { return !!(Game.feastedActive && Game.feastedActive()); } catch (e) { return false; }
}
function outOfCombat(Game) {
  try { if (Game.tbfight && !Game.tbfight.over) return false; } catch (e) {}
  try { if (Game.inCombat && Game.inCombat()) return false; } catch (e) {}
  return true;
}
function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}
// Threat signal: a wave-4+ monster on a travel target — the heading the
// scholar could take tomorrow (feastdiscipline's proven read).
function wave4Imminent(Game) {
  try {
    const targets = (Game.travelTargets ? Game.travelTargets() : []) || [];
    for (const tt of targets) {
      let mon = null;
      try { mon = Game.monsterAt ? Game.monsterAt(tt.x, tt.y) : null; } catch (e) { mon = null; }
      if (mon && beastWaveOf(Game, mon.id || mon.monsterId) >= 4) return true;
    }
  } catch (e) {}
  return false;
}
// Armed: a weapon to hand (equipped melee/ranged bonus > 0 — the readiness
// ARMED bar's own shape via the equipment reads armorydrive uses).
function weaponBonusOf(Game, vid) {
  try {
    const S = (globalThis.Scattering || {});
    const vp = (Game.vpOf ? Game.vpOf(vid) : {}) || {};
    const items = (Game.data || {}).items || [];
    if (!S.equipment) return 0;
    return Math.max(
      S.equipment.weaponBonusOf(vp, items, 'melee') || 0,
      S.equipment.weaponBonusOf(vp, items, 'ranged') || 0);
  } catch (e) { return 0; }
}
function hpFracOf(Game, vid) {
  try {
    const hp = ((Game.state || {}).village || {}).health || {};
    const v = hp[vid];
    return (typeof v === 'number') ? Math.max(0, Math.min(1, v / 100)) : 0.5;
  } catch (e) { return 0.5; }
}
function dispOf(Game, vid) {
  try {
    if (typeof Game.disp === 'function') return Game.disp(vid) || String(vid);
  } catch (e) {}
  return String(vid);
}

// ---------- the formation beat ----------
// Threat days: affirm the formation — the best armed fighter as anchor,
// paired with the best armed non-veterans, up to FORMATION_SIZE in party.
// Invites only, consent-based, never dismisses.
function formationBeat(Game, ctx) {
  if (!vfOn()) return;
  if (Game.over) return;
  if (!outOfCombat(Game)) return;
  if (!stagingWindowLive(Game)) { tinc('skippedWindow'); return; }
  if (!wave4Imminent(Game)) { tinc('skippedNoThreat'); return; }
  if (!atHaven(Game)) { tinc('skippedHaven'); return; }
  const day = gday(Game);
  if (ctx._vfFormDay === day) return; // one formation pass per day
  ctx._vfFormDay = day;
  tinc('formationDays');
  try {
    const v = (Game.state || {}).village || {};
    const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
    const trust = v.trust || {};
    const inParty = (id) => { try { return Game.inParty(id); } catch (e) { return false; } };
    const partyNow = [];
    try { for (const id of (Game.partyMembers() || [])) if (id) partyNow.push(id); } catch (e) {}
    // Candidates: alive, armed, standing (hp floor — not suicidally),
    // known (trust floor — inviteToParty's own gate).
    const cands = [];
    for (const id of roster) {
      let vp = null;
      try { vp = Game.vpOf(id) || {}; } catch (e) { vp = {}; }
      if (vp.dead) continue;
      if (hpFracOf(Game, id) < HP_FLOOR) continue;
      if (weaponBonusOf(Game, id) <= 0) continue;
      const tr = (trust[id] == null ? 10 : trust[id]);
      if (tr < 20) continue;
      cands.push({ id, score: AD.combatScore(Game, id), vet: AD.hasWave4Kill(Game, id) });
    }
    // The anchor: the best fighter, veteran or not — the formation pairs
    // WITH them, never sends forming fighters out alone. The forming
    // slots go to the best armed non-veterans (a veteran's repeat kill
    // forms nothing).
    cands.sort((a, b) => b.score - a.score);
    const anchor = cands[0] || null;
    const forming = cands.filter(c => !c.vet && (!anchor || c.id !== anchor.id));
    const want = [];
    if (anchor) want.push(anchor);
    for (const c of forming) {
      if (want.length >= FORMATION_SIZE) break;
      want.push(c);
    }
    // Fill any remaining slot with the next-best armed fighter (veteran
    // or not) — a thin formation day still commits what it can.
    for (const c of cands) {
      if (want.length >= FORMATION_SIZE) break;
      if (want.some(w => w.id === c.id)) continue;
      want.push(c);
    }
    const wantIds = want.map(w => w.id);
    // Affirm the formation for the fight trace: today's committed vids.
    ctx.vfFormationVids = wantIds.slice();
    let invited = 0, refused = 0;
    for (const id of wantIds) {
      if (inParty(id)) continue;
      let full = false;
      try { full = Game.partyFull(); } catch (e) {}
      if (full) { tinc('skippedFull'); break; }
      let r = null;
      try { r = Game.inviteToParty(id); } catch (e) { r = null; }
      if (r && r.ok) {
        invited++;
        tinc('formationInvitesOk');
        ctx.vfInvitesOk = (ctx.vfInvitesOk | 0) + 1;
      } else {
        refused++;
      }
      // A refusal is honest (personality/goals decide) — the fire is
      // patient; the next threat day asks again.
    }
    if (invited > 0) tinc('formationCommits');
    // The brave-things beat: voiced when new blood actually commits (not
    // every threat day — a standing formation doesn't re-announce
    // itself), naming ONLY the companions who committed. Never names a
    // refuser; never claims "nobody argues" on a day someone argued.
    // Deterministic lines (no RNG — the main stream stays untouched),
    // knowledge-gated (the wave's title is never named).
    if (invited > 0) {
      const committed = wantIds.filter(id => inParty(id));
      if (committed.length) {
        const names = committed.slice(0, 3).map(id => dispOf(Game, id)).join(', ');
        const verb = committed.length === 1 ? 'picks up their edge and falls in beside you' : 'pick up their edges and fall in beside you';
        try {
          Game.say(`"That one's one of the big ones," you say quietly. ${names} ${verb}.` + (refused ? '' : ' Nobody argues.'));
        } catch (e) {}
        ctx.vfBeats = (ctx.vfBeats | 0) + 1;
      }
    }
  } catch (e) { ctx.vfBeatErrors = (ctx.vfBeatErrors | 0) + 1; }
}

// ---------- the finishing discipline (fight wrapper) ----------
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
function yieldBand(Game) {
  return feastedNow(Game) ? YIELD_BAND_FEASTED : YIELD_BAND_SOBER;
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
  { ctx.vfHolds = (ctx.vfHolds | 0) + 1; tinc('holds'); }
  if (why === 'band') { ctx.vfBandHolds = (ctx.vfBandHolds | 0) + 1; tinc('bandHolds'); }
  else { ctx.vfOvershootHolds = (ctx.vfOvershootHolds | 0) + 1; tinc('overshootHolds'); }
  if (feastedNow(Game)) { ctx.vfFeastedHolds = (ctx.vfFeastedHolds | 0) + 1; tinc('feastedHolds'); }
  else { ctx.vfSoberHolds = (ctx.vfSoberHolds | 0) + 1; tinc('soberHolds'); }
  ctx.vfLastBand = band;
  try { Game.tbPlayerWait(); } catch (e) { ctx.vfHoldErrors = (ctx.vfHoldErrors | 0) + 1; tinc('holdErrors'); return 'fight'; }
  return 'hold';
}
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
  // FORMATION LEG: the hold serves the forming fighters. If every engaged
  // companion is already a veteran, a held kill forms nothing — the
  // scholar finishes normally.
  const forming = comps.filter(c => !AD.hasWave4Kill(Game, c.villagerId));
  if (!forming.length) { tinc('holdSkippedAllVets'); return 'fight'; }

  // Weakest live wave-4 target.
  let tgt = w4[0];
  for (const m of w4) if ((m.hp || 0) < (tgt.hp || 0)) tgt = m;
  const tgtHp = tgt.hp || 0;
  const band = yieldBand(Game);

  // Per-fight state.
  let ds = ctx._vfDisc;
  if (!ds || ds.fight !== f) {
    ds = ctx._vfDisc = { fight: f, holds: 0, lastHoldHp: null, stall: 0, scholarEst: SCHOLAR_EST_INIT, lastTgtHp: null };
  }
  // Scholar per-turn damage estimate: target-HP delta across the
  // scholar's own turns (an UPPER bound — conservative for the overshoot
  // guard). Clamp monster-healing noise at 0.
  if (ds.lastTgtHp != null && tgtHp < ds.lastTgtHp) {
    const dealt = ds.lastTgtHp - tgtHp;
    if (dealt > ds.scholarEst) ds.scholarEst = dealt;
  }
  ds.lastTgtHp = tgtHp;

  const round = (f && f.round) || 1;
  const hpPct = scholarHpPct(Game);

  const hurtComp = comps.find(c => (c.hp || 0) / Math.max(1, c.maxHp || c.hp || 1) < HP_FLOOR);
  if (hurtComp) {
    // COMPANION SURVIVAL: a bleeding companion ends the hold. The
    // fastest way to stop the companion taking damage is to END the
    // fight — the scholar resumes striking. No breakoff (#790).
    ctx.vfRescueStrikes = (ctx.vfRescueStrikes | 0) + 1; tinc('rescueStrikes');
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    return 'fight';
  }

  const inBand = tgtHp <= band;
  const inOvershoot = !inBand && (tgtHp - ds.scholarEst <= 0);
  if (!inBand && !inOvershoot) {
    // SOFTEN: above band+est — a strike cannot kill. Reset hold state,
    // fall through so the scholar strikes.
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    ctx.vfSoftens = (ctx.vfSoftens | 0) + 1; tinc('softens');
    return 'fight';
  }
  // HOLD REGIME: the scholar holds so the companions close. Bounded on
  // all sides — an unbounded hold is the wave4engage failure mode.
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
    ctx.vfStallFinishes = (ctx.vfStallFinishes | 0) + 1; tinc('stallFinishes');
    ds.holds = 0; ds.stall = 0; ds.lastHoldHp = null;
    return 'fight';
  }
  return hold(Game, ctx, ds, inOvershoot ? 'overshoot' : 'band', band);
}

// ---------- composition ----------
// The layer OUTSIDE armorydrive's armedFor — the substrate where
// companions are staged into wave-4 TB fights. daily: base first (the
// armory drive + fighter staging run fully, never preempted), then the
// formation beat (additive). fight: the finishing discipline, falling
// through to base.fight when it doesn't hold.
function withVetformation(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!vfOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // the whole stack runs fully — never preempted
      formationBeat(Game, ctx); // the formation beat (additive)
    },
    fight(Game, ctx) {
      if (!vfOn()) return base.fight(Game, ctx); // gate off: pure delegation, ctx untouched
      try {
        const f = Game.tbfight;
        if (f && ctx._vfFightObj !== f) {
          ctx._vfFightObj = f;
          ctx._vfDisc = null;
          // Count wave-4 fights the discipline sees + the formation trace
          // (the engagement instrument: formed = engaged companions that
          // the policy affirmed in its latest formation).
          if (liveWave4(Game).length) {
            const engaged = engagedCompanions(Game).map(c => c.villagerId).filter(Boolean);
            const formed = new Set(ctx.vfFormationVids || []);
            const formedEngaged = engaged.filter(id => formed.has(id));
            ctx.vfW4Fights = (ctx.vfW4Fights | 0) + 1; tinc('w4Fights');
            if (engaged.length) { ctx.vfW4FightsWithComp = (ctx.vfW4FightsWithComp | 0) + 1; tinc('w4FightsWithComp'); }
            if (formedEngaged.length >= 2) { ctx.vfW4FightsFormed2 = (ctx.vfW4FightsFormed2 | 0) + 1; tinc('w4FightsFormed2'); }
            (ctx.vfW4FightRows = ctx.vfW4FightRows || []).push({
              day: gday(Game), engaged, formedEngaged,
              holds: 0, // filled by the sense replay, not the sweep
            });
          }
        }
        const call = discipline(Game, ctx);
        if (call === 'hold') return true; // handled: the honest wait
        return base.fight(Game, ctx); // soften / finish / delegate
      } catch (e) {
        { ctx.vfFightErrors = (ctx.vfFightErrors | 0) + 1; tinc('fightErrors'); }
        return base.fight(Game, ctx);
      }
    },
  });
}

// formedFor: the arm's armed stack — armorydrive's armedFor (the
// weapons-in-hands substrate) OUTSIDE which withVetformation composes.
// VETFORMATION=1 only on the armed side; ARMORYDRIVE=1 on both.
function normBase(base) {
  const b = String(base || '').toLowerCase();
  if (b === 'lead' || b === 'leadfeast') return 'leadfeast';
  if (b === 'belong' || b === 'belongfeast') return 'belongfeast';
  throw new Error('vetformation: unknown base ' + base);
}
function formedFor(base) {
  const nb = normBase(base);
  const tag = nb === 'leadfeast' ? 'lead' : 'belong';
  return withVetformation(AD.armedFor(nb),
    `${tag}-vetformation`,
    `${nb} + win-side layers, seat OFF (SEATDRIVE=0) + ARMORYDRIVE (ARMORYDRIVE=1) + VETFORMATION (VETFORMATION=1): threat-driven companion kill-formation staging + finishing discipline for wave-4 fights`);
}
// Control: armorydrive's armedFor alone (the formation's absence is the
// treatment — staging, arms, feasts, and the substrate identical).
function controlFor(base) {
  return AD.armedFor(normBase(base));
}

module.exports = {
  vfOn, stagingWindowLive, feastedNow, wave4Imminent, beastWaveOf,
  weaponBonusOf, hpFracOf, formationBeat, withVetformation,
  liveWave4, engagedCompanions, yieldBand, discipline,
  formedFor, controlFor, normBase,
  bands: function () { return { feasted: YIELD_BAND_FEASTED, sober: YIELD_BAND_SOBER }; },
  _setBands: function (f, s) { YIELD_BAND_FEASTED = f; YIELD_BAND_SOBER = s; },
  resetTele, tele: function () { return Object.assign({}, tele); },
};
