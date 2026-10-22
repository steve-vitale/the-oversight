// stagemuster — "muster/patrol redesign" (flesh-out loop, 2026-10-22, run
// fleshout-20261022T1215Z, arm sim-stagemuster, axis scale-onramp).
//
// THE BIND (evidence/2026-10-22/sim-splitkill.md, KILLED-AT-PILOT): the
// scholar-softens/companion-closes TB discipline fired 0 times in 59
// wave-4 TB fights — companions NEVER stage into the scholar's wave-4 TB
// fights on this substrate (partyMembers=[], w4EngageEvents=0/32), so no
// TB-scoped discipline can ever act. The kill channel is STAGING. The
// sibling sim-armorydrive (evidence/2026-10-22/sim-armorydrive-confirm.md,
// CONDITIONAL GO) proved the channel is manufacturable policy-side:
// fire-side staging (invites at the haven + travel glue) put companions in
// 128 wave-4 engagements over 32 configs, 8 villager wave-4 kills on 5/16
// seeds. This arm is the staging half's named next: the MUSTER/PATROL
// REDESIGN — close the two gaps in armorydrive's staging shape:
//
//   GAP 1 (muster): fighterStaging invites ONLY at the fire
//     (playerAtHaven), once per day. A scholar who stays on the field for
//     days while the party disperses (death, refusal, trust-crater
//     hangback, fear) is never re-staged until a haven return.
//   GAP 2 (patrol): no deliberate engagement manufacture. The base policy
//     AVOIDS danger (competent fleeDirScore: danger -= 6), so staged
//     encounters rely on the scholar's own wandering. The wave4engage
//     patrol (174 patrol days, 36 staged wave-4 fights) proved deliberate
//     patrols manufacture the conjunction — its killed no-finish
//     discipline is NOT revived here; only the patrol shape.
//
// DESIGN (all policy-side, zero src/js), composed OUTSIDE armorydrive's
// armedFor (ARMORYDRIVE=1 runs on both arms — unarmed staging is pointless):
//
//   MUSTER beat (per day-part, out of combat): when the veterans bar is
//     live (wave-4 unlocked, w5 bar unmet) and the party holds < 2,
//     invite combatScore-ranked armed companions (non-veterans first,
//     trust >= 20, alive), consent-based via Game.inviteToParty — the
//     engine's own invite verb with its own narration. NOT haven-gated:
//     the fire is not the only muster point. Never dismisses.
//   FORMATION beat (per day-part, out of combat): when the party is staged
//     and the scholar is on the field (not at the haven node), any formal
//     party member whose grid position is missing or > 4 squares from the
//     scholar is re-glued via Game.placePartyAtPlayer(). The engine has NO
//     per-step party follow (placePartyAtPlayer fires only on door/node
//     arrivals; pathStep never re-glues), so grid walking silently leaves
//     the party behind — this beat is the formation discipline: the party
//     keeps up. Bounded 1/day-part. Followers who chose to hang back
//     (trust<40 / fear>85 -> removed from followers) are NOT pulled back:
//     only formal partyMembers() are re-glued.
//   PATROL beat (dawn, once per day): when the bar is live, the party is
//     staged (>= 1), and the scholar is healthy (hp >= 65% — a battered
//     scholar doesn't go looking for mirrors), out of combat: ONE travelTo
//     hop toward the travel target with a world monster on it (Game.
//     monsterAt), preferring wave-4 monsters. travelTo is narrated engine
//     travel; the arrival re-glues the party. Fires from haven too — a
//     dawn departure IS the patrol (the scholar sleeps at home). No hop
//     when no dangerous target exists — the base policy owns the heading.
//   NO fight wrapper: the scholar fights per base policy, the companions
//     per the engine. The splitkill discipline stays OFF (its theory is
//     dead; this arm tests staging, not the discipline). Finding #790
//     honored: no breakoff, no withdrawal verbs, no per-companion
//     protection that costs the bar its kills.
//
// Env gate STAGEMUSTER=1 opts IN (default OFF). Gate off = pure
// delegation: base.daily only, no beats, no tele, no ctx writes, no RNG
// draws — byte-identical to the wrapped stack (the proof test's det-gate
// pins that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 = The Mirror
// Draft; the readiness gate; VILLAGER XP LAW — villager kills score the
// ledger exactly like the player's). No canon doc covers armor/equipment
// — stated, not invented (same as the armorydrive arms).
'use strict';
const AD = require('./armorydrive');

function stagemusterOn() { return process.env.STAGEMUSTER === '1'; }

// ---------- module-level mechanism telemetry (sweep reads, proof ignores)
// Sequential sweeps only (never concurrent in one process). Incremented
// ONLY when the gate is on — gate-off delegation touches nothing.
var tele = null;
function resetTele() {
  tele = { musterPasses: 0, musterInvites: 0, musterInvitesOk: 0, regroups: 0, patrolHops: 0, patrolSkips: 0, beatErrors: 0 };
}
function tinc(k) { try { if (tele) tele[k] = (tele[k] | 0) + 1; } catch (e) {} }
resetTele();

// The veterans-bar staging window: wave-4 unlocked AND the wave-5
// veterans bar not yet met (live read — resumes if a veteran dies).
// Mirrors AD.stagingLive minus the ARMORYDRIVE=1 requirement (the
// det-gate must stay silent with STAGEMUSTER unset even when
// ARMORYDRIVE=1 is on the base).
function stagingWindowLive(Game) {
  try {
    return AD.wave4Unlocked(Game) && !AD.w5VetBarMet(Game);
  } catch (e) { return false; }
}

function partyList(Game) {
  try { return (Game.partyMembers ? Game.partyMembers() : []) || []; } catch (e) { return []; }
}
function outOfCombat(Game) {
  try { if (Game.tbfight && !Game.tbfight.over) return false; } catch (e) {}
  try { if (Game.inCombat && Game.inCombat()) return false; } catch (e) {}
  return true;
}
function scholarHpPct(Game) {
  // NOTE: the state field is `health`, not `hp` (hp lives on TB fighters).
  // Misreading this as s.hp pinned the patrol's battered-guard shut in the
  // first smoke (probe /tmp/probe-patrol.js, 72/72 wave-4 dawns blocked).
  try {
    const s = (Game.state || {}).scholar || {};
    const max = (typeof Game.maxHealth === 'function' ? Game.maxHealth() : (s.maxHealth || 100)) || 100;
    return (s.health || 0) / Math.max(1, max);
  } catch (e) { return 1; }
}
function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}
function dayPartKey(Game) {
  try {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    const part = (Game.dayPart == null ? 0 : Game.dayPart);
    return day * 10 + part;
  } catch (e) { return 0; }
}

// ---------- BEAT 1: muster ----------
// Field-side staging invites: combat-ranked, non-veterans first,
// trust floor 20, consent-based, never dismisses, max 2.
function musterBeat(Game, ctx) {
  if (!stagingWindowLive(Game)) return;
  if (!outOfCombat(Game)) return;
  const key = dayPartKey(Game);
  if (ctx._smMusterKey === key) return; // one invite pass per day-part
  ctx._smMusterKey = key;
  tinc('musterPasses');
  ctx.smMusterPasses = (ctx.smMusterPasses | 0) + 1;
  const party = partyList(Game);
  if (party.length >= 2) return; // the village keeps its defenders
  try {
    const v = (Game.state || {}).village || {};
    const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
    const trust = v.trust || {};
    const health = v.health || {};
    const inParty = (id) => { try { return Game.inParty(id); } catch (e) { return party.includes(id); } };
    const cands = [];
    for (const id of roster) {
      if (inParty(id)) continue;
      const hp = health[id];
      if (typeof hp === 'number' && hp <= 0) continue; // dead
      let vp = null;
      try { vp = Game.vpOf(id) || {}; } catch (e) { vp = {}; }
      if (vp.dead) continue;
      const tr = (trust[id] == null ? 10 : trust[id]);
      if (tr < 20) continue; // inviteToParty's own floor — don't waste the ask
      cands.push({ id, score: AD.combatScore(Game, id), vet: AD.hasWave4Kill(Game, id) });
    }
    // Non-veterans first (a veteran's next kill doesn't advance the bar),
    // then strongest first — weapons in hands is the point.
    cands.sort((a, b) => ((b.vet ? 0 : 1) - (a.vet ? 0 : 1)) || (b.score - a.score));
    for (const c of cands) {
      let full = false;
      try { full = Game.partyFull(); } catch (e) {}
      if (full) break;
      if (partyList(Game).length >= 2) break;
      let r = null;
      try { r = Game.inviteToParty(c.id); } catch (e) { r = null; }
      tinc('musterInvites');
      ctx.smMusterInvites = (ctx.smMusterInvites | 0) + 1;
      if (r && r.ok) {
        tinc('musterInvitesOk');
        ctx.smMusterInvitesOk = (ctx.smMusterInvitesOk | 0) + 1;
      }
      // A refusal is honest (personality/goals decide) — try the next
      // strongest; the muster is patient.
    }
  } catch (e) { tinc('beatErrors'); ctx.smBeatErrors = (ctx.smBeatErrors | 0) + 1; }
}

// ---------- BEAT 2: formation ----------
// The party keeps up: re-glue formal party members whose grid positions
// drifted (missing or > 4 squares from the scholar) via the engine's own
// placePartyAtPlayer. Bounded 1/day-part, out of combat, field only
// (at haven the door rules positions — no pulling anyone through it).
function formationBeat(Game, ctx) {
  if (!stagingWindowLive(Game)) return;
  if (!outOfCombat(Game)) return;
  if (atHaven(Game)) return;
  const party = partyList(Game);
  if (!party.length) return;
  const key = dayPartKey(Game);
  if (ctx._smFormKey === key) return;
  try {
    const v = (Game.state || {}).village || {};
    const pos = v.positions || {};
    const s = (Game.state || {}).scholar || {};
    const px = s.mx ?? 4, py = s.my ?? 4;
    let drifted = false;
    for (const vid of party) {
      const p = pos[vid];
      if (!p) { drifted = true; break; }
      if (Math.max(Math.abs((p.mx ?? 4) - px), Math.abs((p.my ?? 4) - py)) > 4) { drifted = true; break; }
    }
    if (!drifted) return;
    ctx._smFormKey = key;
    try { if (typeof Game.placePartyAtPlayer === 'function') Game.placePartyAtPlayer(); } catch (e) {}
    tinc('regroups');
    ctx.smRegroups = (ctx.smRegroups | 0) + 1;
  } catch (e) { tinc('beatErrors'); ctx.smBeatErrors = (ctx.smBeatErrors | 0) + 1; }
}

function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}

// ---------- BEAT 3: patrol ----------
// Dawn patrol toward danger: one travelTo hop toward the travel target
// with a world monster on it (wave-4 preferred). Narrated engine travel;
// the arrival re-glues the party. Bounded 1/day. The battered scholar
// doesn't patrol (hp >= 65%); the base policy owns the heading when no
// dangerous target exists. Fires from haven too: a dawn departure IS
// the patrol (the scholar sleeps at home — the field-only gate meant the
// beat never fired).
function patrolBeat(Game, ctx) {
  if (!stagingWindowLive(Game)) return;
  if (!outOfCombat(Game)) return;
  if (partyList(Game).length < 1) return; // nobody to patrol with
  if (scholarHpPct(Game) < 0.65) return;
  let part = 0, day = 0;
  try { part = (Game.dayPart == null ? 0 : Game.dayPart); day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  if (part !== 0) return; // dawn only
  if (ctx._smPatrolDay === day) return; // one hop per day
  try {
    const targets = (Game.travelTargets ? Game.travelTargets() : []) || [];
    let best = null, bestWave = 0;
    for (const tt of targets) {
      let mon = null;
      try { mon = Game.monsterAt ? Game.monsterAt(tt.x, tt.y) : null; } catch (e) { mon = null; }
      if (!mon) continue;
      const w = beastWaveOf(Game, mon.id || mon.monsterId);
      if (!best || w > bestWave) { best = tt; bestWave = w; }
    }
    if (!best) { tinc('patrolSkips'); ctx.smPatrolSkips = (ctx.smPatrolSkips | 0) + 1; return; }
    ctx._smPatrolDay = day;
    try { if (typeof Game.travelTo === 'function') Game.travelTo(best.x, best.y); } catch (e) {}
    tinc('patrolHops');
    ctx.smPatrolHops = (ctx.smPatrolHops | 0) + 1;
  } catch (e) { tinc('beatErrors'); ctx.smBeatErrors = (ctx.smBeatErrors | 0) + 1; }
}

// ---------- engaged-companion census (splitkill's logic, exposed) ----------
// Live companions in the scholar's current TB fight: kind villager/ally,
// alive, not fled, with a villagerId in the formal party.
function stagedCompanionsOf(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    const party = partyList(Game);
    return (f.fighters || []).filter(x => x && x.alive && !x.fled &&
      (x.kind === 'villager' || x.kind === 'ally') &&
      x.villagerId && party.includes(x.villagerId));
  } catch (e) { return []; }
}

// ---------- composition ----------
// daily: base.daily first, then muster + formation (per-day cadence).
// upkeep: base.upkeep first (when it exists), then the patrol — upkeep
// runs per day-part in the sim harness, and daily runs once per day at
// NIGHT (pre-sleep), so the dawn patrol cannot live in daily: its
// dayPart===0 gate would never fire there.
function withStagemuster(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!stagemusterOn()) return base.daily(Game, ctx); // gate off: pure delegation, ctx untouched
      base.daily(Game, ctx); // the whole win-side + armory stack runs FIRST and fully — never preempted
      musterBeat(Game, ctx);    // beat 1 (additive)
      formationBeat(Game, ctx); // beat 2 (additive)
      // NO fight wrapper: the scholar fights per base policy, companions
      // per the engine. The splitkill discipline stays OFF — its theory is
      // dead; this arm tests staging, not the discipline.
    },
    // NO fight key of its own — base.fight (if any) carries through.
  });
  wrapped.upkeep = function (Game, ctx) {
    if (base.upkeep) { try { base.upkeep(Game, ctx); } catch (e) {} }
    if (!stagemusterOn()) return; // gate off: pure delegation, ctx untouched
    patrolBeat(Game, ctx); // beat 3 (additive, dawn-gated inside)
  };
  return wrapped;
}

// stagedFor: the pilot's armed stack — armorydrive's armedFor (the weapons-
// in-hands substrate) OUTSIDE which withStagemuster composes. STAGEMUSTER=1
// only on the armed side; ARMORYDRIVE=1 on both.
function stagedFor(base) {
  const b = String(base || '').toLowerCase();
  const nb = (b === 'lead' || b === 'leadfeast') ? 'leadfeast' : (b === 'belong' || b === 'belongfeast') ? 'belongfeast' : null;
  if (!nb) throw new Error('stagemuster: unknown base ' + base);
  const tag = nb === 'leadfeast' ? 'lead' : 'belong';
  return withStagemuster(AD.armedFor(nb),
    `${tag}-stagemuster`,
    `${nb} + win-side layers, seat OFF (SEATDRIVE=0) + ARMORYDRIVE (ARMORYDRIVE=1) + STAGEMUSTER (STAGEMUSTER=1): the non-seat long substrate's muster/patrol redesign`);
}

module.exports = {
  stagemusterOn, stagingWindowLive, musterBeat, formationBeat, patrolBeat,
  stagedCompanionsOf, withStagemuster, stagedFor,
  resetTele, tele: function () { return Object.assign({}, tele); },
};
