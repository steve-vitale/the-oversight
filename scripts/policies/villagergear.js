// villagergear — "the village armed, not the scholar" (flesh-out loop,
// 2026-10-20, run fleshout-20261020T1015Z, arm sim-villagergear, axis
// scale-onramp).
//
// THE BIND (evidence/2026-10-20/sim-w5door-measure.md E2/E3): wave-4 kills
// are 10/10 via=player on the pre-seat+windefer substrate — villagers never
// land the killing blow, so the wave-5 door's 2-living-veterans bar never
// fills (B2 short 8/8 engaged runs, terminally). And the scholar-gear lane
// is CONCEPT-CAPPED (backlog #651, evidence/2026-10-19/sim-gearday2.md):
// arming the scholar cut scholar combat deaths -19.6% but RAISED villager
// combat deaths +29% and cut median survival 122.5d->93.5d. The axis needs
// the VILLAGE armed, not the scholar.
//
// LINEAGE (what this reuses, what it refuses):
// - armory.js (sim-armory, 10th production attempt, KILLED at pilot on
//   wave-3 damage-share 0.90x): the ARMING beat is proven sound — 166
//   donations, armed companions 6->17, median companion wbonus 0->8, all
//   guardrails green. What died was the damage-share primary, not the
//   donation channel. This layer re-implements the donation beat fresh
//   (armory.js was deleted per kill protocol) as its weapons-distribution
//   leg — the engine's daily villagerGearDay (villager-build.js) is the
//   honest distributor (greedy biggest-gain, deposit-is-consent).
// - vetrel.js (landed, default-OFF, 18-0 at confirm): combat-ranked party
//   invites, scholar-softens/companion-finishes yield, companion-survival
//   breakoffs — proven on the wave-3 veteran channel. This layer reuses the
//   protocol SHAPE (ranked invites, yield, survival) re-scoped to wave-4
//   TB fights. VETREL itself stays env-inert on this substrate (its hunts
//   consume the day clock — finding #490 — and its bar is wave-3).
// - vetarm (9th, KILLED): NEVER assignTask/patrol — moving fighters kills
//   them (19 patrol-combat deaths). This layer never calls assignTask.
// - sim-armory's named next (#623): presence-routing without movement —
//   the TB join rule is proximity (nearest 4 villagers within 4 squares
//   join, game.js startCombat). Party members travel with the scholar
//   (placePartyAtPlayer) — consent-based staging, not movement orders.
//
// THREE BEATS (all policy-side, zero src/js):
// 1. ARMORY DRIVE (daily, at Haven): worst-spare weapon -> Game.donateWeapon.
//    Strictly worse than the scholar's equipped best; never the only edge;
//    keepsakes/bonded never donated; knap fallback (stone+vine, vinebank
//    defersCraft deference). The base policy's gearUp never donates —
//    this is the layer's domain, not a duplicate.
// 2. FIGHTER STAGING (daily, at Haven, wave-4+ unlocked, veterans bar unmet):
//    combat-score-ranked invites through the real inviteToParty verb
//    (trust floor 20, engine acceptance draw). Non-veterans first
//    (a wave-4+ killer's next kill doesn't advance the bar), strongest
//    first; max 2 companions (party cap 3 — the village keeps defenders);
//    never dismisses (negative gossip).
// 3. WAVE-4 YIELD + SURVIVAL (fight wrapper, player turns): in a TB fight
//    with a live wave-4 monster and an engaged party companion — a
//    non-veteran scholar fights normally (they need their own kill; they're
//    the reliable finisher); a veteran scholar HOLDS (tbPlayerWait, honest
//    turn forfeit) when the weakest live wave-4 monster is <=20% maxHp,
//    scholar hp >= 50%, round >= 2, <=6 yield turns/fight, and the monster
//    took damage in the trailing 2 yield turns (a companion who can't close
//    doesn't get watched forever). Any engaged companion <40% HP ends the
//    commitment: scholar resumes striking if the monster is near death
//    (fastest end = fastest the companion stops taking damage), otherwise
//    breaks off honestly via tbBarrierExit.
//
// DELIBERATE NON-GOALS (documented, not re-litigated):
// - Scholar equipping: gearUp owns it (the #656 lesson — never re-equip
//   what the base equips). This layer never calls Game.equip/unequip on
//   the scholar, never reads state.scholar.equipped for writes.
// - Armor transfers to villagers: NO HONEST CHANNEL (sim-findings #608,
//   steve-call). No communal armor pile (storage.js: "armor/misc have no
//   deposit hook"), no gift verb, individual ownership is Steve's law.
//   Villagers equip from their OWN stashes via the engine's villagerGearDay
//   — the layer does not touch it. If Steve wants scholar->villager armor,
//   that's a game-design call, not a lever.
// - Deliberate wave-4 hunts: wave-4 arrives via unlocks/raids (facing is
//   reliable — w5doormeasure B6: 0); hunt legs consume the day clock
//   (finding #490). Not needed, not included.
// - Patrols / task assignment: the vetarm autopsy. Never.
//
// Env gate VGEAR=1 opts IN (default OFF). Gate off = pure delegation:
// no protocols, no fight flags, no RNG draws — byte-identical to the
// wrapped stack (the proof test's det-gate pins that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 roster + bands,
// the readiness gate, VILLAGER XP LAW — villager kills score the ledger
// exactly like the player's).
'use strict';
const { leadfeast, belongfeast } = require('./feastscale');

function vgearOn() { return process.env.VGEAR === '1'; }

// ---------- reads ----------
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function wave4Unlocked(Game) {
  try { return (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1) >= 4; }
  catch (e) { return false; }
}
function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return (s.hp || s.health || 100) / Math.max(1, maxHp);
  } catch (e) { return 1; }
}
// A wave-4+ killer in the waveKillLog (the veterans bar's own counting
// line, standing.js). The scholar counts too — they're living by the
// gate's isLiving read.
function hasWave4Kill(Game, vid) {
  try {
    const log = (Game.state || {}).waveKillLog || [];
    return log.some(e => e && e.by === vid && (e.w | 0) >= 4);
  } catch (e) { return false; }
}
function scholarIsWave4Vet(Game) {
  try { return hasWave4Kill(Game, Game.villagerId); } catch (e) { return false; }
}
// The live wave-5 VETERANS bar (standing.js): 2 living killers with
// wave-4+ kills. The staging stands down once met — and resumes if a
// veteran dies (the read is live, not latched).
function w5VetBarMet(Game) {
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
    return ((r && r.veterans) | 0) >= (((r && r.demand) || {}).veterans || 2);
  } catch (e) { return false; }
}
function stagingLive(Game) {
  return vgearOn() && wave4Unlocked(Game) && !w5VetBarMet(Game);
}
// Combat score (vetrel's proven formula): weapon bonus dominates
// (kill-landing is the job), armor keeps them standing, current health
// breaks ties toward the ready. Engine-honest reads only.
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
    return wb * 3 + ar * 2 + hpFrac * 20;
  } catch (e) { return 0; }
}

// ---------- beat 1: armory drive ----------
// Worst-spare weapon donation to the communal armory (the armory.js beat,
// re-implemented). The engine's villagerGearDay distributes armory weapons
// to the biggest gains — the layer only stocks the pile.
function scholarBestBonus(Game) {
  try {
    const S = (globalThis.Scattering || {});
    const s = (Game.state || {}).scholar || {};
    const items = (Game.data || {}).items || [];
    if (!S.equipment) return 0;
    return Math.max(
      S.equipment.weaponBonusOf({ equipped: s.equipped || {} }, items, 'melee') || 0,
      S.equipment.weaponBonusOf({ equipped: s.equipped || {} }, items, 'ranged') || 0
    );
  } catch (e) { return 0; }
}
function armoryUnits(Game) {
  try {
    const st = Game.stashState ? Game.stashState() : null;
    return ((st && st.weapons) || []).reduce((t, e) => t + ((e && e.units) || 1), 0);
  } catch (e) { return 0; }
}
function armoryDrive(Game, ctx) {
  if (!vgearOn()) return; // gate off: pure silence
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    if (!(Game.playerAtHaven && Game.playerAtHaven())) return; // donations happen at the hall
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 0;
    if (ctx._vgArmoryDay === day) return; // one push/day
    ctx._vgArmoryDay = day;
    if (armoryUnits(Game) >= 3) return; // stocked — no-op
    const inv = s.inventory || [];
    const defOf = (it) => ((Game.data || {}).items || []).find(d => d && d.id === (it.itemId || it.id));
    const best = scholarBestBonus(Game);
    let donateIdx = -1, donateBonus = Infinity;
    for (let i = 0; i < inv.length; i++) {
      const it = inv[i];
      const def = defOf(it);
      if (!def || def.class !== 'weapon') continue;
      if (it.bonded) continue;
      try { if (Game.isKeepsake && Game.isKeepsake(it)) continue; } catch (e) {}
      let stashable = true;
      try { stashable = Game.isStashableWeapon ? !!Game.isStashableWeapon(it) : true; } catch (e) {}
      if (!stashable) continue;
      const wb = (def.weapon && def.weapon.bonus) || 0;
      // Strictly worse than the scholar's equipped best — the layer never
      // touches what gearUp owns, and never the only edge.
      if (wb >= best) continue;
      if (wb < donateBonus) { donateBonus = wb; donateIdx = i; }
    }
    if (donateIdx >= 0) {
      let r = null;
      try { r = Game.donateWeapon(donateIdx); } catch (e) { r = null; }
      if (r) { ctx.vgDonations = (ctx.vgDonations | 0) + 1; return; }
    }
    // Knap fallback: no spare but stone+vine on hand -> craft a stone_knife
    // and donate it. The vinebank keeps first claim (same deference as
    // competent.js gearUp).
    try {
      const vinebank = require('./vinebank');
      if (vinebank && typeof vinebank.defersCraft === 'function' && vinebank.defersCraft(Game, 'stone_knife')) {
        ctx.vgVinebankDeferred = (ctx.vgVinebankDeferred | 0) + 1;
        return;
      }
    } catch (e) {}
    let hasStone = false, hasVine = false;
    for (const it of inv) {
      // Materials ride as it.material (competent.js packMat), not itemId.
      const m = (it && it.material) || (it && (it.itemId || it.id)) || '';
      if (m === 'stone') hasStone = true;
      if (m === 'vine' || m === 'vine_fiber') hasVine = true;
    }
    if (hasStone && hasVine && typeof Game.craft === 'function') {
      const before = inv.length;
      let made = null;
      try { made = Game.craft('stone_knife'); } catch (e) { made = null; }
      if (made && (s.inventory || []).length > before) {
        const ni = (s.inventory || []).findIndex(it => (it.itemId || it.id) === 'stone_knife');
        if (ni >= 0) {
          let r = null;
          try { r = Game.donateWeapon(ni); } catch (e) { r = null; }
          if (r) ctx.vgDonations = (ctx.vgDonations | 0) + 1;
          else ctx.vgKnapWasted = (ctx.vgKnapWasted | 0) + 1;
        }
      }
    }
  } catch (e) { ctx.vgArmoryError = (ctx.vgArmoryError | 0) + 1; }
}

// ---------- beat 2: fighter staging ----------
// Combat-ranked party invites (vetrel's proven protocol shape, re-scoped
// to wave-4). Party members travel with the scholar (placePartyAtPlayer)
// -> within the TB join radius (nearest 4 within 4 squares, startCombat)
// -> presence in wave-4 fights via the engine's own "joins you" trigger.
// Consent-based (the engine's acceptance draw), never assignTask.
function fighterStaging(Game, ctx) {
  if (!vgearOn()) return; // gate off: pure silence
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    if (!stagingLive(Game)) return; // pre-wave-4 or bar met: stand down
    if (!(Game.playerAtHaven && Game.playerAtHaven())) return; // invites happen at the fire
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 0;
    if (ctx._vgStageDay === day) return; // one selection pass per day
    ctx._vgStageDay = day;
    const v = (Game.state || {}).village || {};
    const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
    const trust = v.trust || {};
    const health = v.health || {};
    const inParty = (id) => { try { return Game.inParty(id); } catch (e) { return false; } };
    const partyCount = (() => { try { return (Game.partyMembers() || []).length; } catch (e) { return 0; } })();
    if (partyCount >= 2) return; // the village keeps its defenders
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
      cands.push({ id, score: combatScore(Game, id), vet: hasWave4Kill(Game, id) });
    }
    // Non-veterans first (a veteran's next kill doesn't advance the bar),
    // then strongest first.
    cands.sort((a, b) => ((b.vet ? 0 : 1) - (a.vet ? 0 : 1)) || (b.score - a.score));
    for (const c of cands) {
      let full = false;
      try { full = Game.partyFull(); } catch (e) {}
      if (full) break;
      try {
        const cur = (Game.partyMembers() || []).length;
        if (cur >= 2) break;
      } catch (e) {}
      let r = null;
      try { r = Game.inviteToParty(c.id); } catch (e) { r = null; }
      if (r && r.ok) {
        ctx.vgInvitesOk = (ctx.vgInvitesOk | 0) + 1;
        ctx._vgStagePick = { id: c.id, score: Math.round(c.score), vet: !!c.vet };
      }
      // A refusal is honest (personality/goals decide) — try the next
      // strongest; the fire is patient.
    }
  } catch (e) { ctx.vgStageError = (ctx.vgStageError | 0) + 1; }
}

// ---------- beat 3: wave-4 yield + survival ----------
// Party companions engaged in the scholar's TB fight (kind villager/ally,
// party member, alive, not fled).
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
function liveWave4(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    return (f.fighters || []).filter(x => x && x.kind === 'monster' &&
      (x.hp || 0) > 0 && !x.fled && beastWaveOf(Game, beastMidOf(x)) === 4);
  } catch (e) { return []; }
}
// Honest disengage: walk to the nearest x-edge, then push through the
// barrier via the real tbBarrierExit verb (vetrel's miniature, same shape).
function breakOffDisengage(Game) {
  try {
    const p0 = Game.tbFighter('p');
    if (!p0) return false;
    const px0 = p0.mx != null ? p0.mx : 4, py0 = p0.my != null ? p0.my : 4;
    const onEdge = (px0 === 0 || px0 === 8 || py0 === 0 || py0 === 8);
    if (onEdge) {
      const ddx = px0 === 0 ? -1 : px0 === 8 ? 1 : 0;
      const ddy = (px0 === 0 || px0 === 8) ? 0 : (py0 === 0 ? -1 : 1);
      Game.tbBarrierExit(ddx, ddy);
    } else {
      const tx = px0 <= 4 ? 0 : 8;
      Game.tbPlayerMove(tx, py0);
    }
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

function withVillagerGear(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!vgearOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // the courtship + feast machinery runs FIRST and fully — never preempted
      armoryDrive(Game, ctx);   // beat 1 (additive)
      fighterStaging(Game, ctx); // beat 2 (additive)
    },
    fight(Game, ctx) {
      if (!vgearOn()) return base.fight(Game, ctx); // gate off: pure delegation, ctx untouched
      try {
        ctx._vgYield = false;
        if (vgearOn() && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
          const w4 = liveWave4(Game);
          if (w4.length) {
            const f = Game.tbfight;
            if (ctx._vgFightObj !== f) {
              ctx._vgFightObj = f;
              ctx.vgW4Fights = (ctx.vgW4Fights | 0) + 1;
              ctx._vgYieldState = null;
            }
            const comps = engagedCompanions(Game);
            if (comps.length) {
              // Weakest live wave-4 monster.
              let tgt = w4[0];
              for (const m of w4) if ((m.hp || 0) < (tgt.hp || 0)) tgt = m;
              const nearDeath = (tgt.hp || 0) <= 0.2 * ((tgt.maxHp || tgt.hp || 1));
              const hurtComp = comps.find(c => (c.hp || 0) / Math.max(1, c.maxHp || c.hp || 1) < 0.40);
              const scholarVet = scholarIsWave4Vet(Game);
              if (hurtComp) {
                // COMPANION SURVIVAL: a companion below 40% ends the
                // commitment. No companion-order verb exists; the
                // engine-honest eject is the scholar's own disengage.
                if (nearDeath) {
                  // Fastest way to stop the companion taking damage is to
                  // END the fight: cancel the yield, strike normally.
                  ctx._vgYieldState = null;
                  ctx.vgRescues = (ctx.vgRescues | 0) + 1;
                  // fall through to base.fight — the scholar strikes
                } else {
                  ctx.vgBreakoffs = (ctx.vgBreakoffs | 0) + 1;
                  if (breakOffDisengage(Game)) return true;
                  // The push went nowhere: fall through to base.fight
                  // rather than standing still.
                }
              } else if (scholarVet && nearDeath) {
                // YIELD: the veteran scholar holds the strike; the engaged
                // companion's upcoming turns get the killing blow. Bounded
                // and guarded: scholar hp >= 50%, never the first round,
                // <=6 yield turns/fight, stops if the monster takes no
                // damage for 2 consecutive yield turns.
                const p = Game.tbFighter('p');
                const hpPct = p ? (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1) : 1;
                const round = (f && f.round) || 1;
                let ys = ctx._vgYieldState;
                if (!ys || ys.fight !== f) ys = ctx._vgYieldState = { fight: f, turns: 0, lastHp: null, stall: 0 };
                const stalled = (ys.lastHp != null && (tgt.hp || 0) >= ys.lastHp) ? ys.stall + 1 : 0;
                if (hpPct >= 0.5 && round >= 2 && ys.turns < 6 && stalled < 2) {
                  ys.turns++; ys.stall = stalled; ys.lastHp = tgt.hp || 0;
                  ctx._vgYield = true;
                  ctx.vgYields = (ctx.vgYields | 0) + 1;
                  Game.tbPlayerWait(); // the honest hold — advances the turn internally
                  return true;
                }
                ys.lastHp = tgt.hp || 0;
                // Yield window closed: fall through — the scholar fights.
              }
              // Non-veteran scholar: fights normally (they need their own
              // kill; they're the reliable finisher). Fall through.
            }
          }
        }
      } catch (e) { /* a beat bug never breaks the fight path */ }
      return base.fight(Game, ctx);
    },
  });
}

const vgearLead = withVillagerGear(leadfeast, 'villargear-lead',
  'leadfeast + VILLAGERGEAR (VGEAR=1): armory weapons drive, fighter staging via party invites, wave-4 yield+survival');
const vgearBelong = withVillagerGear(belongfeast, 'villargear-belong',
  'belongseek + VILLAGERGEAR (VGEAR=1): armory weapons drive, fighter staging via party invites, wave-4 yield+survival');

module.exports = {
  vgearOn, wave4Unlocked, scholarIsWave4Vet, w5VetBarMet, stagingLive,
  combatScore, scholarBestBonus, armoryUnits,
  armoryDrive, fighterStaging, engagedCompanions, liveWave4, breakOffDisengage,
  withVillagerGear, vgearLead, vgearBelong,
};
