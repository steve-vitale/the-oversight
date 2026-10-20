// vgearbeats — narration layer for the proven VGEAR veteran channel
// (flesh-out loop, 2026-10-20, arm sim-vgearbeats, axis scale-onramp,
// named next #699 of sim-villagergear).
//
// THE BLANK (evidence/2026-10-20/sim-villagergear.md, "silent arming
// beats"): the VGEAR layer's own beats are invisible in fiction — no beat
// marks a weapon donation to the armory, a fighter-staging invite, or a
// veteran scholar's yield-hold. By Steve's no-silent-actions rule the
// village can't see the arming happen — the companions just show up armed.
// This layer fills the blank with voice, and nothing else.
//
// NARRATION-ONLY WRAPPER (VGEARBEATS=1, default OFF; composes OUTSIDE the
// VGEAR wrapper: withVGearBeats(VG.vgearLead, ...)). Keyed on the layer's
// OWN counters (ctx.vgDonations, ctx.vgInvitesOk, ctx.vgYields) — it
// OBSERVES, never alters: reads counters (+ pure game reads), emits
// Game.say lines only. No RNG draws in the narration path (deterministic
// line selection by stretch-key hash — the kinresolve-det lesson), no
// game-state writes (Game.say writes Game.log, the text stream — never
// Game.state).
//
// DEDUPE (the raidgarrison lesson — sim-raidgarrison 2026-10-20: the
// muster beat fired 24x because the dedupe key included the day):
//   - One beat per event type per day max (rate cap, backstop).
//   - The dedupe key is the STRETCH, never the day:
//       donation -> the arming-drive epoch (armory below target; a new
//                 epoch starts when the armory restocks >=3 then drops
//                 below 3 again). One beat per epoch, then quiet.
//       invite   -> (staging episode, villager): the staging episode is
//                 the stretch while stagingLive() holds (wave-4 unlocked,
//                 vets bar unmet); each staged villager gets their line
//                 once per episode, never a daily repeat.
//       yield    -> the fight (the crisis id). One hold-beat per fight
//                 (the first yield turn), then quiet.
// A same-stretch repeat is a guardrail violation, full stop.
//
// DESIGN CALLS (Steve 2026-10-07: figure it out yourself — documented,
// he can overrule):
// 1. Coverage is measured per stretch (epochs / (episode,vid) pairs /
//    fights with yield), because the beats are per-stretch by the dedupe
//    requirement above. Raw per-occurrence ratios are reported alongside
//    for transparency.
// 2. The engine already says generic verb lines ("Left your X in the
//    armory", "joins your party") — these beats add the LAYER's fiction
//    (the arming drive, the staging, the hold), not a duplicate confirm.
// 3. Voice is second-person scholar + named villagers/weapons, matching
//    the game's SAY voice ("You STRIKE...", "Tariq strikes the Strike.").
//
// Canon read: docs/CANON.md (no-silent-actions), docs/MONSTER-WAVES.md
// (wave-4 roster, the readiness gate, VILLAGER XP LAW).
'use strict';
const VG = require('./villagergear');

function beatsOn() { return process.env.VGEARBEATS === '1'; }
// The beats are meaningless without the layer they narrate. Gate-off
// (either flag unset) = pure delegation: no hooks, no ctx writes.
function beatsActive() { return beatsOn() && VG.vgearOn(); }

// ---------- reads (pure) ----------
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function firstNameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    const n = p && p.name ? String(p.name) : '';
    if (n) return n.split(' ')[0];
  } catch (e) {}
  try {
    const d = Game.displayName ? Game.displayName(vid) : '';
    if (d) return String(d).split(' ')[0];
  } catch (e) {}
  return 'a villager';
}
// Deterministic line selection: FNV-1a hash of the stretch key, mod the
// variant count. NO Math.random anywhere in the narration path.
function pickLine(variants, key) {
  let h = 2166136261;
  const s = String(key == null ? '' : key);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return variants[(h >>> 0) % variants.length];
}

// ---------- voice ----------
const DON_LINES = [
  w => `You lay the ${w} on the armory rack. The village arms — one edge at a time.`,
  w => `The ${w} joins the armory. Yours, given to whoever needs it next.`,
];
const INV_LINES = [
  n => `You ask ${n} to stand ready. When the heralds come, you want them beside you.`,
  n => `${n} agrees to stand ready — a nod, nothing more. The fire pops.`,
];
const YIELD_LINES = [
  n => `You hold your strike — ${n} has the angle. Let them finish it.`,
  n => `You lower your weapon and wait. This kill belongs to ${n}.`,
];

// ---------- observation hooks (call-through, zero behavior change) ----------
// Captures the donated weapon's display name so the beat can name it.
// The beat itself keys on the layer's counter (ctx.vgDonations) — a
// failed donation (hook fired, counter unmoved) never beats.
function ensureHooks(Game, ctx) {
  if (ctx._vgBeatsHooks) return;
  ctx._vgBeatsHooks = true;
  try {
    const oDon = Game.donateWeapon ? Game.donateWeapon.bind(Game) : null;
    if (oDon) Game.donateWeapon = function (idx) {
      try {
        let nm = 'a spare edge';
        if (typeof idx === 'number') {
          const inv = ((Game.state || {}).scholar || {}).inventory || [];
          const it = inv[idx];
          const def = ((Game.data || {}).items || []).find(d => d && d.id === (it && (it.itemId || it.id)));
          nm = (it && it.name) || (def && def.name) || 'a spare edge';
        }
        ctx._vgBeatsPendDon = { name: String(nm) };
      } catch (e) {}
      return oDon(idx);
    };
  } catch (e) {}
}

// ---------- stretch tracking (every daily pass — transitions between
// event days must not be missed) ----------
// Donation stretch = the arming-drive epoch: while the armory sits below
// its target (3 units) the drive is one continuous stretch; restocking to
// >=3 closes it, dropping below again opens a new one.
function trackDonEpoch(Game, ctx) {
  let stocked = true;
  try { stocked = VG.armoryUnits(Game) >= 3; } catch (e) {}
  if (ctx._vgBeatsDonStocked === undefined) {
    ctx._vgBeatsDonStocked = stocked;
    if (!stocked) ctx._vgBeatsDonEpoch = 1;
  } else if (stocked && !ctx._vgBeatsDonStocked) {
    ctx._vgBeatsDonStocked = true; // epoch closed
  } else if (!stocked && ctx._vgBeatsDonStocked) {
    ctx._vgBeatsDonStocked = false;
    ctx._vgBeatsDonEpoch = (ctx._vgBeatsDonEpoch | 0) + 1; // new epoch
  }
  return ctx._vgBeatsDonEpoch | 0;
}
// Invite stretch = the staging episode: the continuous stretch while
// stagingLive() holds (wave-4 unlocked, vets bar unmet).
function trackStageEp(Game, ctx) {
  let live = false;
  try { live = VG.stagingLive(Game); } catch (e) {}
  if (ctx._vgBeatsStageWasLive === undefined) {
    ctx._vgBeatsStageWasLive = live;
    if (live) ctx._vgBeatsStageEp = 1;
  } else if (live && !ctx._vgBeatsStageWasLive) {
    ctx._vgBeatsStageWasLive = true;
    ctx._vgBeatsStageEp = (ctx._vgBeatsStageEp | 0) + 1; // new episode
  } else {
    ctx._vgBeatsStageWasLive = live;
  }
  return ctx._vgBeatsStageEp | 0;
}

// Rate cap: at most one beat per event type per day. (NOTE: the naive
// `(ctx._vgBeatsXDay | -1) === day` idiom is WRONG — `x | -1` is -1 for
// every x. Compare explicitly.)
function dayCapped(ctx, key, day) {
  const v = ctx[key];
  return v !== undefined && v !== null && v === day;
}

// ---------- beat 1: armory donation ----------
// One beat per arming-drive epoch, then quiet for the rest of the epoch.
function donationBeat(Game, ctx, day) {
  const seen = ctx._vgBeatsDonSeen | 0;
  const now = ctx.vgDonations | 0;
  ctx._vgBeatsDonSeen = now;
  if (!(now > seen)) return false; // no new donation this pass
  const epoch = trackDonEpoch(Game, ctx);
  if (epoch <= 0) return false;
  if ((ctx._vgBeatsDonBeatEpoch | 0) === epoch) return false; // same stretch: quiet
  if (dayCapped(ctx, '_vgBeatsDonDay', day)) return false; // rate cap: 1/day
  const pend = ctx._vgBeatsPendDon || {};
  ctx._vgBeatsPendDon = null;
  const w = pend.name || 'a spare edge';
  ctx._vgBeatsDonBeatEpoch = epoch;
  ctx._vgBeatsDonDay = day;
  (ctx._vgBeatsFiredDon = ctx._vgBeatsFiredDon || {})[epoch] = (ctx._vgBeatsFiredDon[epoch] | 0) + 1;
  ctx._vgBeatsDonBeats = (ctx._vgBeatsDonBeats | 0) + 1;
  try { Game.say(pickLine(DON_LINES, 'don:' + epoch)(w)); } catch (e) {}
  return true;
}

// ---------- beat 2: fighter-staging invite ----------
// Stretch = (staging episode, villager). The episode is the continuous
// stretch while stagingLive() holds; a villager staged twice in one
// episode hears it once. The vid comes from the layer's own
// ctx._vgStagePick (set on every accepted invite) — no extra hook.
function inviteBeat(Game, ctx, day) {
  const seen = ctx._vgBeatsInvSeen | 0;
  const now = ctx.vgInvitesOk | 0;
  ctx._vgBeatsInvSeen = now;
  if (!(now > seen)) return false;
  const ep = trackStageEp(Game, ctx);
  const pick = ctx._vgStagePick || {};
  const vid = pick.id || null;
  if (!vid) return false;
  const key = ep + ':' + vid;
  const fired = ctx._vgBeatsFiredInv = ctx._vgBeatsFiredInv || {};
  if (fired[key]) return false; // same stretch: quiet
  if (dayCapped(ctx, '_vgBeatsInvDay', day)) return false; // rate cap: 1/day
  fired[key] = 1;
  ctx._vgBeatsInvDay = day;
  ctx._vgBeatsInvBeats = (ctx._vgBeatsInvBeats | 0) + 1;
  const n = firstNameOf(Game, vid);
  try { Game.say(pickLine(INV_LINES, 'inv:' + key)(n)); } catch (e) {}
  return true;
}

// ---------- beat 3: veteran scholar's yield-hold ----------
// Stretch = the fight (the crisis id). The layer's fight() sets
// ctx._vgYield on a hold turn; the beat fires on the first hold turn of
// each fight, naming the engaged companion who gets the finish.
function yieldBeat(Game, ctx, day, fight, compVids) {
  if (!ctx._vgYield) return false;
  if (!fight) return false;
  if (ctx._vgBeatsFight !== fight) return false; // stale snapshot guard
  const seq = ctx._vgBeatsFightSeq | 0;
  if (seq <= 0) return false;
  if ((ctx._vgBeatsYieldBeatSeq | 0) === seq) return false; // same stretch: quiet
  if (dayCapped(ctx, '_vgBeatsYieldDay', day)) return false; // rate cap: 1/day
  const vid = (compVids || [])[0] || null;
  if (!vid) return false;
  ctx._vgBeatsYieldBeatSeq = seq;
  ctx._vgBeatsYieldDay = day;
  ctx._vgBeatsYieldBeats = (ctx._vgBeatsYieldBeats | 0) + 1;
  const n = firstNameOf(Game, vid);
  try { Game.say(pickLine(YIELD_LINES, 'yield:' + seq)(n)); } catch (e) {}
  return true;
}

function withVGearBeats(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!beatsActive()) return base.daily(Game, ctx); // gate off: pure delegation
      ensureHooks(Game, ctx);
      base.daily(Game, ctx); // the layer's beats run first and fully — observed, never preempted
      try {
        const day = gday(Game);
        trackDonEpoch(Game, ctx); // stretch tracking runs every pass, event or not
        trackStageEp(Game, ctx);
        donationBeat(Game, ctx, day); // beat 1: additive, observation-keyed
        inviteBeat(Game, ctx, day);   // beat 2: additive, observation-keyed
      } catch (e) { ctx._vgBeatsDailyError = (ctx._vgBeatsDailyError | 0) + 1; }
    },
    fight(Game, ctx) {
      if (!beatsActive()) return base.fight(Game, ctx); // gate off: pure delegation
      // Snapshot the engaged companions BEFORE the layer's fight turn —
      // the yield names who gets the finish.
      let fight = null, comps = [];
      try {
        fight = Game.tbfight || null;
        if (fight && !fight.over) {
          if (ctx._vgBeatsFight !== fight) {
            ctx._vgBeatsFight = fight;
            ctx._vgBeatsFightSeq = (ctx._vgBeatsFightSeq | 0) + 1;
            comps = VG.engagedCompanions(Game).map(c => c.villagerId).filter(Boolean);
            ctx._vgBeatsFightComps = comps;
          } else {
            comps = ctx._vgBeatsFightComps || [];
          }
        }
      } catch (e) {}
      const r = base.fight(Game, ctx); // the layer's yield/hold runs — observed, never altered
      try {
        if (fight) yieldBeat(Game, ctx, gday(Game), fight, comps);
      } catch (e) { ctx._vgBeatsFightError = (ctx._vgBeatsFightError | 0) + 1; }
      return r;
    },
  });
}

const vgbLead = withVGearBeats(
  require('./villagergear').vgearLead, 'vgearbeats-lead',
  'vgear-lead + VGEARBEATS (VGEARBEATS=1): narration-only beats for armory donations, staging invites, yield-holds');
const vgbBelong = withVGearBeats(
  require('./villagergear').vgearBelong, 'vgearbeats-belong',
  'vgear-belong + VGEARBEATS (VGEARBEATS=1): narration-only beats for armory donations, staging invites, yield-holds');

module.exports = {
  beatsOn, beatsActive, pickLine,
  DON_LINES, INV_LINES, YIELD_LINES,
  ensureHooks, trackDonEpoch, trackStageEp,
  donationBeat, inviteBeat, yieldBeat,
  withVGearBeats, vgbLead, vgbBelong,
};
