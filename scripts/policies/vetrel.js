// vetrel — the veteran-reliability driver (flesh-out loop, 2026-10-16,
// run fleshout-20261016T2315Z, axis scale-onramp; finding #427's named next).
//
// CONTEXT (evidence/2026-10-16/sim-arming.md): wave-4 readiness's VETERANS
// bar (2 living roster members with wave-3+ kills) is REACHABLE on the
// pre-seat courtship substrate via the companion-veteran channel — 2/16
// wave-4 unlocks vs a 0/64 control baseline, both trace-verified through a
// companion's wave-3 killing blow counting via the tricktag channel
// (via='companion', finding #405) — but RARE. The arming arm was KILLED AT
// PILOT on power (2 < 4 bar); the layer was deleted per kill protocol, but
// the MECHANISM is proven. This is the named next: make the
// companion-veteran channel RELIABLE (more companion kill opportunities,
// better companion survival; road-dependence lead 2/8 vs belong 0/8 noted).
//
// THE LEVER — four pushes, all policy-side, all engine-honest, veteran-bar
// only (no armory, no counters, no armor-crafting — those bars are satisfiable
// on control and the armor-crafting push is knowledge-blocked on this
// substrate: hide_armor L0, bark_armor L1 P=10<15; the armor bar is
// spawn-armor + preservation only — documented, not re-litigated):
//
// (a) COMPANION SELECTION BY COMBAT STATS: invite the STRONGEST available
//     companion through the real inviteToParty verb (trust-gated at 20 by
//     the verb itself), not first-available. Ranked by weapon bonus +
//     armor + health, non-veterans first (a veteran landing another kill
//     doesn't advance the bar). Never invites P>=15 armor wearers — the
//     ARMORED bar is preservation-only on this substrate; risking them in
//     wave-3 hunts could drop a satisfiable bar. Deliberate non-action:
//     no dismissals — dismissFromParty seeds negative gossip
//     (generous -8, honest -4); blooded companions are not discarded for
//     optimization.
// (b) SCHOLAR-SOFTENS / COMPANION-FINISHES: on deliberate wave-3 hunts the
//     scholar commits via the real hunt/commit convention (ctx._huntCommit,
//     read by competent.js's two flee decision points). Veteran-aware:
//     a NON-veteran scholar commits (12% floor — they need their own kill);
//     a VETERAN scholar keeps the standard 35% eject discipline (their life
//     is worth more than the hunt now; the hunt continues for the
//     companions' kill chances). Then the YIELD: a veteran scholar HOLDS
//     their strike (the real tbPlayerWait verb) when the weakest live
//     wave-3 monster is near death (<=20% maxHp) and a committed companion
//     is engaged — the companion's upcoming turns get the killing blow.
//     Bounded (6 yield turns/fight; stops if the monster takes no damage
//     for 2 consecutive yield turns — a companion who can't close doesn't
//     get watched forever) and guarded (scholar hpPct >= 0.5; never on the
//     fight's first rounds). Never fakes a kill: the companion lands the
//     blow through the combat engine or nobody does.
// (c) COMPANION SURVIVAL: on each player turn of a committed wave-3 fight,
//     any engaged companion below 40% HP ends the commitment. The engine
//     already self-ejects companions (brave 0.4 / default 0.5 / helpful 0.7,
//     plus reactive flee), but the WINNING FLOOR holds a winning fighter to
//     5% — a brave companion at 35% in a winning fight won't leave, and one
//     wave-3 hit (20-70) can kill them. There is no companion-order verb,
//     so the engine-honest eject is the scholar's own disengage: break off
//     via the real tbBarrierExit/tbPlayerMove verbs — p.fled ends the fight
//     for everyone ('fled'), the companion stops taking damage. EXCEPTION:
//     if the monster is near death, the fastest way to stop the companion
//     taking damage is to END the fight — the scholar resumes striking
//     (yield cancelled for the fight) instead of walking out.
// (d) DELIBERATE HUNTS: every 3rd day after wave-3 unlocks, HP>=60%, fed
//     (kcal>=200), not exiled, >=1 companion in party, the veteran bar
//     unmet — travel to thicket/ruin/forest/grove (revealed first), walk up
//     to visible wave-3 monsters via the real pathStep verbs (bounded 12
//     steps), then come HOME. Don't strand the village: the leg returns the
//     scholar the same day; max 2 companions (party cap 3 — the village
//     keeps its defenders); never hunts exiled.
//
// Env gate VETREL=1 opts IN (default OFF). Gate off = pure delegation:
// no protocols, no hunt legs, no fight flags — byte-identical to the base
// feast policies (the proof test's det-gate pins that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-3 roster + bands,
// the readiness gate, VILLAGER XP LAW — villager kills score the ledger
// exactly like the player's).
'use strict';
const { leadfeast, belongfeast } = require('./feastscale');

function vetrelOn() { return process.env.VETREL === '1'; }

// ---------- reads ----------
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function wave3Unlocked(Game) {
  try { return (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1) >= 3; }
  catch (e) { return false; }
}
function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return (s.hp || s.health || 100) / Math.max(1, maxHp);
  } catch (e) { return 1; }
}
function isVeteran(Game, vid) {
  try {
    const log = (Game.state || {}).waveKillLog || [];
    return log.some(e => e && e.by === vid && (e.w | 0) >= 3);
  } catch (e) { return false; }
}
function scholarIsVeteran(Game) {
  try { return isVeteran(Game, Game.villagerId); } catch (e) { return false; }
}
// The live VETERANS bar (standing.js): living roster members with a
// wave-3+ kill in waveKillLog. The hunt stands down once the bar is met —
// and resumes if a veteran dies (the read is live, not latched).
function vetBarMet(Game) {
  try {
    const r = Game.waveCombatReadiness(4);
    return (r.veterans | 0) >= ((r.demand && r.demand.veterans) || 2);
  } catch (e) { return false; }
}
function vetHuntLive(Game) {
  return vetrelOn() && wave3Unlocked(Game) && !vetBarMet(Game);
}
// Fighters of kind villager/ally who are party members, alive, not fled —
// the "committed companions" the yield and survival protocols read.
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
function liveWave3(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    return (f.fighters || []).filter(x => x && x.kind === 'monster' &&
      (x.hp || 0) > 0 && !x.fled && beastWaveOf(Game, beastMidOf(x)) === 3);
  } catch (e) { return []; }
}

// ---------- (a) combat-score-ranked companion selection ----------
// Engine-honest reads only: vpOf for the gear record, the equipment module
// for weapon/armor numbers, village.health for current health (0-100).
function combatScore(Game, vid) {
  try {
    const S = (globalThis.Scattering || {});
    const vp = (Game.vpOf ? Game.vpOf(vid) : {}) || {};
    const items = (Game.data || {}).items || [];
    let wb = 0, ar = 0;
    if (S.equipment) {
      wb = (S.equipment.weaponBonusOf(vp, items, 'melee') || 0) +
           (S.equipment.weaponBonusOf(vp, items, 'ranged') || 0);
      ar = S.equipment.armorOf(vp, items) || 0;
    }
    const v = (Game.state || {}).village || {};
    const hp = (v.health || {})[vid];
    const hpFrac = (typeof hp === 'number') ? Math.max(0, Math.min(1, hp / 100)) : 0.5;
    // Weapon bonus dominates (kill-landing is the job), armor keeps them
    // standing, current health breaks ties toward the ready.
    return wb * 3 + ar * 2 + hpFrac * 20;
  } catch (e) { return 0; }
}
function armorP(Game, vid) {
  try {
    const S = (globalThis.Scattering || {});
    const vp = (Game.vpOf ? Game.vpOf(vid) : {}) || {};
    const items = (Game.data || {}).items || [];
    return (S.equipment ? (S.equipment.armorOf(vp, items) || 0) : 0);
  } catch (e) { return 0; }
}

// (a) COMPANION PROTOCOL (daily, at haven): invite the strongest available
// companions — ranked, not first-available — through the real
// inviteToParty verb. Once per day; fills open party slots (max 2
// companions — party cap 3, the village keeps its defenders).
function companionProtocol(Game, ctx) {
  if (!vetrelOn()) return; // gate off: pure silence
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    if (!vetHuntLive(Game)) return; // bar met: stand down
    if (!(Game.playerAtHaven && Game.playerAtHaven())) return; // invites happen at the fire
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 0;
    if (ctx._vetInviteDay === day) return; // one selection pass per day
    ctx._vetInviteDay = day;
    const v = (Game.state || {}).village || {};
    const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
    const trust = v.trust || {};
    const health = v.health || {};
    const inParty = (id) => { try { return Game.inParty(id); } catch (e) { return false; } };
    const cands = [];
    for (const id of roster) {
      if (inParty(id)) continue;
      const hp = health[id];
      if (typeof hp === 'number' && hp <= 0) continue; // dead
      let vp = null;
      try { vp = Game.vpOf(id) || {}; } catch (e) { vp = {}; }
      if (vp.dead) continue;
      const tr = (trust[id] == null ? 10 : trust[id]);
      if (tr < 20) continue; // the verb's own floor — don't waste the ask
      if (armorP(Game, id) >= 15) continue; // PRESERVATION: the ARMORED bar is spawn-armor + preservation only
      cands.push({ id, score: combatScore(Game, id), vet: isVeteran(Game, id) });
    }
    // Non-veterans first (a veteran's next kill doesn't advance the bar),
    // then strongest first.
    cands.sort((a, b) => ((b.vet ? 0 : 1) - (a.vet ? 0 : 1)) || (b.score - a.score));
    for (const c of cands) {
      let full = false;
      try { full = Game.partyFull(); } catch (e) {}
      if (full) break;
      let r = null;
      try { r = Game.inviteToParty(c.id); } catch (e) { r = null; }
      if (r && r.ok) {
        ctx.vetInvitesOk = (ctx.vetInvitesOk || 0) + 1;
        ctx._vetInvitePick = { id: c.id, score: Math.round(c.score), vet: !!c.vet };
      }
      // A refusal is honest (personality/goals decide) — try the next
      // strongest; the fire is patient.
    }
  } catch (e) {}
}

// ---------- (d) the deliberate veteran hunt leg ----------
// ENGAGE (seek side, engine-honest): a visible wave-3 world monster on the
// scholar's node gets walked up to on the detail grid — the same thing a
// player tapping the monster does. Bounded: 12 steps, then the world has
// answered (it closed, fled, or lost the trail — all honest outcomes).
function engageVisibleWave3(Game, ctx) {
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return false;
    const px = Game.map.px, py = Game.map.py;
    const wm = Game.monsterAt && Game.monsterAt(px, py);
    if (!wm || !wm.id) return false;
    if (beastWaveOf(Game, wm.id) !== 3) return false;
    let steps = 0;
    while (!Game.over && !Game.tbfight && steps++ < 12) {
      const cur = Game.monsterAt(Game.map.px, Game.map.py);
      if (!cur || cur.id !== wm.id) break; // gone: fled, died, despawned
      const s = Game.state.scholar || {};
      const sx = s.mx != null ? s.mx : 4, sy = s.my != null ? s.my : 4;
      const cx = cur.mx != null ? cur.mx : 4, cy = cur.my != null ? cur.my : 4;
      const dx = Math.sign(cx - sx), dy = Math.sign(cy - sy);
      if (!dx && !dy) break; // on top of it — contact should have fired
      let ok = false;
      try { ok = Game.pathStep(sx + dx, sy + dy); } catch (e) { ok = false; }
      if (!ok && dx && dy) { try { ok = Game.pathStep(sx + dx, sy); } catch (e) { ok = false; } }
      if (!ok) break; // blocked — the walk stops here, honestly
      ctx.vetHuntSteps = (ctx.vetHuntSteps || 0) + 1;
    }
    if (Game.tbfight) { ctx.vetHuntEngaged = (ctx.vetHuntEngaged || 0) + 1; return true; }
    return false;
  } catch (e) { return false; }
}

// (d) HUNT LEG (seek side): a deliberate excursion into monster country.
// Every 3rd day, healthy and fed, with companions, the scholar travels out
// to thicket/ruin nodes — each node entry rolls the real checkEncounter —
// engages visible wave-3 monsters, then comes HOME. Don't strand the
// village: same-day return, max 2 companions out, never exiled.
function veteranHuntLeg(Game, ctx) {
  if (!vetHuntLive(Game)) return;
  try {
    if (Game.over || Game.tbfight) return;
    const s = (Game.state || {}).scholar || {};
    if (s.exiled) return;
    if (scholarHpPct(Game) < 0.6) return; // hunt healthy or not at all
    if ((s.kcal || 0) < 200) return;      // don't hunt hungry
    let party = [];
    try { party = Game.partyMembers() || []; } catch (e) {}
    if (!party.length) return; // the 2nd veteran needs a villager — solo hunts don't serve the channel
    const day = s.day || 0;
    if (day - (ctx._lastVetHuntDay == null ? -99 : ctx._lastVetHuntDay) < 3) return;
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      let t = null;
      try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
      if (!t || t.type === 'haven' || t.type === 'oldhaven') continue;
      if (t.type !== 'thicket' && t.type !== 'ruin' && t.type !== 'forest' && t.type !== 'grove') continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d || 0, type: t.type, revealed: !!t.revealed });
    }
    if (!cands.length) return;
    // Revealed thickets first — player-visible world knowledge; the fog
    // keeps its secrets.
    cands.sort((a, b) => ((b.revealed - a.revealed) ||
      ((a.type === 'thicket' ? 0 : 1) - (b.type === 'thicket' ? 0 : 1)) || (a.d - b.d)));
    ctx._lastVetHuntDay = day;
    ctx.vetHunts = (ctx.vetHunts || 0) + 1;
    const home = { x: Game.map.px, y: Game.map.py };
    for (const leg of cands.slice(0, 2)) {
      if (Game.over || Game.tbfight) break;
      try { Game.travelTo(leg.x, leg.y); } catch (e) { break; }
      ctx.vetHuntLegs = (ctx.vetHuntLegs || 0) + 1;
      if (Game.over || Game.tbfight) break;
      if (engageVisibleWave3(Game, ctx)) break; // fight started — the harness drives it
    }
    if (!Game.over && !Game.tbfight && (Game.map.px !== home.x || Game.map.py !== home.y)) {
      try { Game.travelTo(home.x, home.y); } catch (e) {}
    }
  } catch (e) {}
}

// ---------- (b)+(c) the fight wrapper ----------
// Honest disengage: walk to the nearest x-edge, then push through the
// barrier via the real tbBarrierExit verb. p.fled ends the fight for
// everyone ('fled') — the companion stops taking damage. Mirrors
// competent.js's flee() in miniature.
function breakOffDisengage(Game, ctx) {
  try {
    const p0 = Game.tbFighter('p');
    if (!p0) return false;
    const px0 = p0.mx != null ? p0.mx : 4, py0 = p0.my != null ? p0.my : 4;
    const onEdge = (px0 === 0 || px0 === 8 || py0 === 0 || py0 === 8);
    if (onEdge) {
      const dx = px0 === 0 ? -1 : px0 === 8 ? 1 : 0;
      const dy = py0 === 0 ? -1 : py0 === 8 ? 1 : 0;
      const ddx = (px0 === 0 || px0 === 8) ? dx : 0;
      const ddy = (px0 === 0 || px0 === 8) ? 0 : dy;
      Game.tbBarrierExit(ddx, ddy);
    } else {
      const tx = px0 <= 4 ? 0 : 8;
      Game.tbPlayerMove(tx, py0);
    }
    // The push may have ended the fight already (tbEnd('fled')) — don't
    // end a turn on a finished fight.
    if (!Game.tbfight || Game.tbfight.over) return true;
    const p1 = Game.tbFighter('p');
    if (p1 && p1.fled) return true;
    const moved = p1 && (p1.mx !== px0 || p1.my !== py0);
    if (!moved) return false; // no-op: don't stand still calling it a retreat
    if (p1) { p1.moveLeft = 0; p1.acted = true; }
    Game.tbAfterPlayerAction();
    return true;
  } catch (e) { return false; }
}
function endTurn(Game) {
  try {
    const q = Game.tbFighter('p');
    if (q) { q.moveLeft = 0; q.acted = true; }
    Game.tbAfterPlayerAction();
  } catch (e) {}
}

function withVetrel(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!vetrelOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // courtship + feast machinery run FIRST and fully — never preempted
      companionProtocol(Game, ctx); // (a) additive
      veteranHuntLeg(Game, ctx);    // (d) additive
    },
    fight(Game, ctx) {
      if (!vetrelOn()) return base.fight(Game, ctx); // gate off: pure delegation, ctx untouched
      // Recomputed every player turn; false whenever the gate is off, the
      // bar is met, or no wave-3 monster is in the fight.
      try {
        ctx._huntCommit = false;
        ctx._vetYield = false;
        if (vetHuntLive(Game) && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
          const w3 = liveWave3(Game);
          if (w3.length) {
            const f = Game.tbfight;
            const scholarVet = scholarIsVeteran(Game);
            // (b) COMMIT, veteran-aware: a non-veteran scholar commits (12%
            // floor — they need their own kill); a veteran keeps the standard
            // 35% eject discipline (their life > the hunt now).
            ctx._huntCommit = !scholarVet;
            if (ctx._vetFightObj !== f) {
              ctx._vetFightObj = f;
              ctx.vetHuntFights = (ctx.vetHuntFights || 0) + 1;
              ctx._vetYieldState = null;
            }
            const comps = engagedCompanions(Game);
            // weakest live wave-3 monster
            let tgt = w3[0];
            for (const m of w3) if ((m.hp || 0) < (tgt.hp || 0)) tgt = m;
            const nearDeath = (tgt.hp || 0) <= 0.2 * ((tgt.maxHp || tgt.hp || 1));
            const hurtComp = comps.find(c => (c.hp || 0) / Math.max(1, c.maxHp || c.hp || 1) < 0.40);
            // (c) COMPANION SURVIVAL: a companion below 40% ends the commitment.
            if (hurtComp) {
              ctx._huntCommit = false; // the scholar is done holding the line too
              if (nearDeath) {
                // The fastest way to stop the companion taking damage is to
                // END the fight: cancel the yield, strike normally.
                ctx._vetYieldState = null;
                ctx.vetRescues = (ctx.vetRescues || 0) + 1;
                // fall through to base.fight — the scholar strikes
              } else {
                // Break off honestly: the scholar leaves, the fight ends
                // 'fled', the companion stops taking damage.
                ctx.vetBreakoffs = (ctx.vetBreakoffs || 0) + 1;
                if (breakOffDisengage(Game, ctx)) return true;
                // The push went nowhere (sealed/blocked): fall through to
                // base.fight rather than standing still.
              }
            } else if (scholarVet && nearDeath && comps.length) {
              // (b) YIELD: veteran scholar holds the strike; the committed
              // companion's upcoming turns get the killing blow.
              const p = Game.tbFighter('p');
              const hpPct = p ? (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1) : 1;
              const round = (f && f.round) || 1;
              let ys = ctx._vetYieldState;
              if (!ys || ys.fight !== f) ys = ctx._vetYieldState = { fight: f, turns: 0, lastHp: null, stall: 0 };
              const stalled = (ys.lastHp != null && (tgt.hp || 0) >= ys.lastHp) ? ys.stall + 1 : 0;
              if (hpPct >= 0.5 && round >= 2 && ys.turns < 6 && stalled < 2) {
                ys.turns++; ys.stall = stalled; ys.lastHp = tgt.hp || 0;
                ctx._vetYield = true;
                ctx.vetYields = (ctx.vetYields || 0) + 1;
                Game.tbPlayerWait(); // the honest hold — advances the turn internally
                return true;
              }
              // Yield window closed (spent, stalled, or scholar hurting):
              // fall through — the scholar fights normally.
              ys.lastHp = tgt.hp || 0;
            }
          }
        }
      } catch (e) { ctx._huntCommit = false; }
      return base.fight(Game, ctx);
    },
  });
}

const vetrelLead = withVetrel(leadfeast, 'vetrel-lead',
  'leadfeast + VETREL veteran-reliability (VETREL=1): combat-ranked companions, scholar-softens/companion-finishes yield, companion-survival breakoffs, deliberate vet hunts');
const vetrelBelong = withVetrel(belongfeast, 'vetrel-belong',
  'belongseek + VETREL veteran-reliability (VETREL=1): combat-ranked companions, scholar-softens/companion-finishes yield, companion-survival breakoffs, deliberate vet hunts');

module.exports = {
  vetrelOn, beastMidOf, beastWaveOf, wave3Unlocked, scholarHpPct,
  scholarIsVeteran, isVeteran, vetBarMet, vetHuntLive,
  engagedCompanions, liveWave3, combatScore, armorP,
  companionProtocol, veteranHuntLeg, engageVisibleWave3,
  withVetrel, vetrelLead, vetrelBelong,
};
