// armorydrive — "weapons in hands" (flesh-out loop, 2026-10-22, run
// fleshout-20261022T0715Z, arm sim-armorydrive, axis scale-onramp).
//
// THE BIND (evidence/2026-10-22/sim-wave4engage-r2.md, finding #793):
// the veterans bar is a companion-DAMAGE (capability) problem, not an
// opportunity problem. The deliberate wave-4 engagement policy manufactured
// the conjunction (174 patrol days, 36 wave-4 fights, companions dealing
// ~half the party's damage) and produced ZERO villager wave-4 kills —
// wave-4 HP pools (850-1500) outscale companion fight output. The named
// next is this arm: raise companion damage-per-fight — the VGEAR armory
// drive, weapons in hands.
//
// THE SUBSTRATE (finding #714b): the only proven veteran channel (VGEAR
// pilot GO 3/8, combined 4/16 vs 0/16) composed onto the winning seat
// substrate moved nothing — the table win lands ~d90-134 and the run ENDS
// before villagers blood themselves. This arm runs the drive on the
// NON-SEAT long substrate (SEATDRIVE=0, 180d death-aware horizons): the
// win-side stack minus the seat, so villages live long enough for the
// channel to fire.
//
// THE CATCH-22 (finding #735): filling the veteran bar bled armor 5->0,
// then defer5 re-bound on armor. This layer NEVER touches armor — no armor
// verbs exist policy-side (finding #646) and none are attempted. The
// armor count is a guardrail, not a lever.
//
// SCOPE vs the sibling arm (sim-splitkill, same run): the sibling owns the
// TB fight discipline (scholar softens into the yield band, companions
// close). This layer owns CAPABILITY ONLY: the armory drive + fighter
// staging. NO fight wrapper — the scholar fights per base policy, the
// companions per the engine. The split is deliberate and disjoint.
//
// LINEAGE (what this reuses, what it refuses):
// - villagergear.js (VGEAR, landed, default-OFF): the armory-drive +
//   staging protocol SHAPE is proven (166 donations, armed companions 6->17
//   in its pilot lineage). This layer re-implements the shape fresh under
//   its own env gate — VGEAR's beats are gated on VGEAR=1 and its yield leg
//   belongs to the sibling's discipline question. Reuse is shape-only.
// - sim-armory (10th attempt, KILLED): worst-spare donation is proven sound
//   as a channel but moved damage-share 0.90x. This layer's donation logic
//   is deliberately DIFFERENT (best-spare, documented below).
// - vetarm (9th, KILLED): NEVER assignTask/patrol. This layer never moves
//   fighters — invites only, consent-based.
//
// DESIGN CALLS (Steve 2026-10-07: figure it out yourself, document it):
// 1. DONATE THE BEST SPARE, not the worst (VGEAR donated worst-spare +
//    stone_knife knap; median companion wbonus 0->8, bonus-12 tier).
//    Companions need KILLING power: a hunting_spear (30), machete (35) or
//    phase_blade (60) in a companion's hands is 2.5-5x the bonus. The
//    scholar's equipped best is never touched (strictly-worse rule holds —
//    the layer never competes with gearUp, the #656 lesson).
// 2. KEEP ONE SPARE for the scholar. The scholar's backup edge is their
//    insurance; the village's future is the companions'. Donation fires only
//    when >=2 spares exist. (VGEAR donated down to zero spares.)
// 3. STOCK TARGET 6, not 3: one edge per fighter the readiness bar wants
//    armed (wave-4 demand: 5 armed; wave-5: 6).
// 4. CRAFT FALLBACK builds the BEST makeable weapon, not just stone_knife:
//    highest-bonus recipe the scholar knows (codex level>=1) with materials
//    on hand, vinebank defersCraft deference kept. craft() enforces its own
//    gates.
// 5. STAGING is wave-4-gated and bar-gated (stands down once the wave-5
//    veterans bar is met — a live read, resumes if a veteran dies),
//    combat-score ranked, non-veterans first, max 2 companions (party cap 3
//    — the village keeps its defenders), trust floor 20, never dismisses.
// 6. NO fight discipline, NO breakoff leg: the sibling owns the close;
//    finding #790 (armorcatch autopsy) showed fight-aborting protection
//    costs the veteran bar its kills (7->5). This layer adds capability and
//    gets out of the fight's way.
//
// Env gate ARMORYDRIVE=1 opts IN (default OFF). Gate off = pure delegation:
// no protocols, no fight flags, no RNG draws — byte-identical to the
// wrapped stack (the proof test's det-gate pins that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 roster + bands,
// the readiness gate, VILLAGER XP LAW). No canon doc covers
// armor/equipment — stated, not invented (per brief).
'use strict';
const SD = require('./seatdrive');

function adOn() { return process.env.ARMORYDRIVE === '1'; }

// ---------- reads (engine-honest, VGEAR's proven shapes) ----------
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
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
// A wave-4+ killer in the waveKillLog (the veterans bar's own counting
// line, standing.js).
function hasWave4Kill(Game, vid) {
  try {
    const log = (Game.state || {}).waveKillLog || [];
    return log.some(e => e && e.by === vid && (e.w | 0) >= 4);
  } catch (e) { return false; }
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
  return adOn() && wave4Unlocked(Game) && !w5VetBarMet(Game);
}
// Combat score (VGEAR's proven formula): weapon bonus dominates
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
// The scholar's equipped best — read from state.scholar.equipped DIRECTLY
// (finding #620: getPerson(villagerId).equipped is EMPTY in the real game;
// reading it silently no-ops the whole beat).
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

// ---------- beat 1: the armory drive ----------
// Best-spare donation to the communal armory. The engine's villagerGearDay
// distributes armory weapons to the biggest gains — the layer only stocks
// the pile, and stocks it with edges that can actually kill.
function spareWeapons(Game) {
  // Returns scholar inventory indices of donate-eligible spares, best first.
  try {
    const s = (Game.state || {}).scholar || {};
    const inv = s.inventory || [];
    const defOf = (it) => ((Game.data || {}).items || []).find(d => d && d.id === (it.itemId || it.id));
    const best = scholarBestBonus(Game);
    const out = [];
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
      // touches what gearUp owns.
      if (wb >= best) continue;
      out.push({ idx: i, bonus: wb, id: def.id });
    }
    out.sort((a, b) => b.bonus - a.bonus);
    return out;
  } catch (e) { return []; }
}
// Best makeable weapon: highest-bonus weapon recipe the scholar knows
// (codex level>=1) with materials on hand and not already owned.
// craft() enforces every gate itself.
function bestCraftableWeapon(Game) {
  try {
    const recipes = ((Game.data || {}).recipes || []);
    const items = ((Game.data || {}).items || []);
    const codexRecipes = (((Game.state || {}).codex || {}).recipes) || {};
    const inv = (((Game.state || {}).scholar || {}).inventory) || [];
    const owned = new Set(inv.map(it => it && (it.itemId || it.id)).filter(Boolean));
    let best = null;
    for (const r of recipes) {
      if (!r || !r.id) continue;
      const def = items.find(d => d && d.id === r.id);
      if (!def || def.class !== 'weapon' || !((def.weapon || {}).bonus)) continue;
      const k = codexRecipes[r.id];
      if (!k || (k.level || 0) < 1) continue;
      if (owned.has(r.id)) continue;
      const mats = r.materials || {};
      const funded = Object.entries(mats).every(([m, n]) =>
        inv.filter(it => it && it.material === m).reduce((t, it) => t + (it.units || 0), 0) >= n);
      if (!funded) continue;
      if (!best || def.weapon.bonus > best.bonus) best = { id: r.id, bonus: def.weapon.bonus };
    }
    return best;
  } catch (e) { return null; }
}
function armoryDrive(Game, ctx) {
  if (!adOn()) return; // gate off: pure silence
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    if (!(Game.playerAtHaven && Game.playerAtHaven())) return; // donations happen at the hall
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 0;
    if (ctx._adArmoryDay === day) return; // one push/day
    ctx._adArmoryDay = day;
    if (armoryUnits(Game) >= 6) return; // stocked — one edge per fighter
    const spares = spareWeapons(Game);
    if (spares.length >= 2) {
      // DESIGN CALL #1+#2: donate the BEST spare, keep one for the scholar.
      let r = null;
      try { r = Game.donateWeapon(spares[0].idx); } catch (e) { r = null; }
      if (r) { ctx.adDonations = (ctx.adDonations | 0) + 1; ctx.adDonatedBonus = (ctx.adDonatedBonus | 0) + spares[0].bonus; return; }
      ctx.adDonateFailed = (ctx.adDonateFailed | 0) + 1;
    }
    // Craft fallback (DESIGN CALL #4): 0-1 spares, or the donation failed —
    // build the best edge the scholar knows how to make and donate it.
    // The vinebank keeps first claim (same deference as competent.js).
    const bc = bestCraftableWeapon(Game);
    if (bc) {
      try {
        const vinebank = require('./vinebank');
        if (vinebank && typeof vinebank.defersCraft === 'function' && vinebank.defersCraft(Game, bc.id)) {
          ctx.adVinebankDeferred = (ctx.adVinebankDeferred | 0) + 1;
          return;
        }
      } catch (e) {}
      if (typeof Game.craft === 'function') {
        let made = null;
        try { made = Game.craft(bc.id); } catch (e) { made = null; }
        if (made) {
          const ni = ((Game.state || {}).scholar || {}).inventory.findIndex(it => (it.itemId || it.id) === bc.id);
          if (ni >= 0) {
            let r = null;
            try { r = Game.donateWeapon(ni); } catch (e) { r = null; }
            if (r) { ctx.adDonations = (ctx.adDonations | 0) + 1; ctx.adCraftDonations = (ctx.adCraftDonations | 0) + 1; ctx.adDonatedBonus = (ctx.adDonatedBonus | 0) + bc.bonus; }
            else ctx.adKnapWasted = (ctx.adKnapWasted | 0) + 1;
          }
        }
      }
    }
  } catch (e) { ctx.adArmoryError = (ctx.adArmoryError | 0) + 1; }
}

// ---------- beat 2: fighter staging ----------
// Combat-ranked party invites (VGEAR's proven protocol shape). Party
// members travel with the scholar (placePartyAtPlayer) -> within the TB
// join radius (nearest 4 within 4 squares, startCombat) -> presence in
// wave-4 fights via the engine's own "joins you" trigger.
// Consent-based (the engine's acceptance draw), never assignTask.
function fighterStaging(Game, ctx) {
  if (!adOn()) return; // gate off: pure silence
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    if (!stagingLive(Game)) return; // pre-wave-4 or bar met: stand down
    if (!(Game.playerAtHaven && Game.playerAtHaven())) return; // invites happen at the fire
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 0;
    if (ctx._adStageDay === day) return; // one selection pass per day
    ctx._adStageDay = day;
    const v = (Game.state || {}).village || {};
    const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
    const trust = v.trust || {};
    const health = v.health || {};
    const inParty = (id) => { try { return Game.inParty(id); } catch (e) { return false; } };
    let partyCount = 0;
    try { partyCount = (Game.partyMembers() || []).length; } catch (e) {}
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
      try { if ((Game.partyMembers() || []).length >= 2) break; } catch (e) {}
      let r = null;
      try { r = Game.inviteToParty(c.id); } catch (e) { r = null; }
      if (r && r.ok) {
        ctx.adInvitesOk = (ctx.adInvitesOk | 0) + 1;
        ctx._adStagePick = { id: c.id, score: Math.round(c.score), vet: !!c.vet };
      }
      // A refusal is honest (personality/goals decide) — try the next
      // strongest; the fire is patient.
    }
  } catch (e) { ctx.adStageError = (ctx.adStageError | 0) + 1; }
}

// ---------- composition ----------
function withArmoryDrive(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!adOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // the courtship + feast machinery runs FIRST and fully — never preempted
      armoryDrive(Game, ctx);   // beat 1 (additive)
      fighterStaging(Game, ctx); // beat 2 (additive)
    },
    // NO fight wrapper: the scholar fights per base policy, companions per
    // the engine. The TB discipline is the sibling arm's (sim-splitkill).
    // Finding #790: fight-aborting protection costs the veteran bar kills.
  });
}

// Non-seat long substrate (finding #714b): the win-side stack MINUS the
// seat. SEATDRIVE=0 makes withSeatDrive delegate purely to the
// windefer-wrapped tribfloor base (det-gate pinned in the proof test) —
// villages live the long game instead of winning at ~d90-134.
function normBase(base) {
  const b = String(base || '').toLowerCase();
  if (b === 'lead' || b === 'leadfeast') return 'leadfeast';
  if (b === 'belong' || b === 'belongfeast') return 'belongfeast';
  throw new Error('armorydrive: unknown base ' + base);
}
function substrateFor(base) {
  const b = normBase(base);
  // SD.leadseat/belongseat = withSeatDrive(withWinDefer(TF.leadfeast/…));
  // with SEATDRIVE=0 the seat wrapper is pure delegation.
  return b === 'leadfeast' ? SD.leadseat : SD.belongseat;
}
// ARMORYDRIVE=1 wraps the SAME substrate OUTSIDE; unset = pure delegation.
function armedFor(base) {
  const b = normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  return withArmoryDrive(substrateFor(b),
    `${tag}-armorydrive`,
    `${b} + win-side layers, seat OFF (SEATDRIVE=0) + ARMORYDRIVE (ARMORYDRIVE=1): the non-seat long substrate's armory drive`);
}

module.exports = {
  adOn, wave4Unlocked, hasWave4Kill, w5VetBarMet, stagingLive,
  combatScore, scholarBestBonus, armoryUnits, spareWeapons, bestCraftableWeapon,
  armoryDrive, fighterStaging, withArmoryDrive, normBase, substrateFor, armedFor,
};
