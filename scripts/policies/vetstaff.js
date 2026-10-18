// vetstaff — staffing-only veteran production (flesh-out loop, 2026-10-18,
// run fleshout-20261018T1615Z, axis scale-onramp; the TRACKER'S NAMED NEXT).
//
// CONTEXT (evidence/2026-10-18/sim-vetblood.md): sim-vetblood's staffing
// half MANUFACTURED without its kill-steering yield — 152 hunts on 13/16
// runs, 20 of 23 wave-3 kills landed by villagers (87%), 12/16 ever-veteran
// (median firstVet 72d, earliest d42) — but against NO control (STEP 1
// failed first: the yield's <=20%-window premise never coincides with a
// scholar turn, 2/16 engagement < 4/16 bar, KILLED-AT-PILOT). So the
// production delta of the staffing itself is UNMEASURED. This arm is the
// named next: staffing-only (blood-list hunts, NO yield complexity) against
// a real control.
//
// NOTE on lineage: scripts/policies/vetblood.js was deleted zero-trace per
// the kill protocol, so its staff-invite machinery survives only as a
// pinned API surface in scripts/test-vetblood-20261018.js (INFO-SKIP) —
// this file rebuilds that protocol shape (blood-list head invited through
// the real inviteToParty verb; hunt legs gated on the candidate's party
// presence) WITHOUT the yield. The hunt-leg mechanics follow the
// vetrel.js pattern (engine verbs only: travelTo/travelTargets/monsterAt/
// pathStep), credited but not composed — this layer composes on the
// tribfloor base, NOT on vetrel: clean attribution, an alternative
// production theory, not a stack.
//
// THE LEVER — three pushes, all policy-side, all engine-honest:
// (a) BLOOD-LIST STAFFING: the hunt is staffed through the BLOOD LIST —
//     ordered kill-candidates, living roster villagers (never the scholar),
//     per vetdemand rule (iii) (evidence/2026-10-17/sim-vetdemand.md):
//     tier 0 = rule-iii proven (>=1 wave-3+ kill AND village cumulative
//     wave-3+ kills >= 2), tier 1 = blooded/record thin (a wave-3+ kill with
//     a thin village record, or blooded on wave-2+ combat), tier 2 =
//     armor-paired (armorP >= 10 — per armorbreak, a naked blooding is a dead
//     blooding), tier 3 = unarmored (listed, never staffed). The head is
//     invited through the real inviteToParty verb (its trust-20 floor and
//     personality/goals acceptance stay the last word); a refusal is the
//     verb's honest answer.
// (b) THE CANDIDATE LEADS; THE SCHOLAR ESCORTS: hunt legs run ONLY with the
//     blood-list head in the party (every 3rd day, candidate healthy >= 60,
//     scholar healthy/fed, same-day return, wave-3 unlocked, veterans bar
//     unmet) — deliberate expeditions to thicket/ruin/forest/grove nodes,
//     walk up to visible wave-3 monsters via the real pathStep verbs, then
//     come HOME. Don't strand the village.
// (c) NORMAL COMBAT ONLY: no kill-steering yield — the d42 Spool transcript
//     (evidence/2026-10-18/vetblood-transcripts/belongfeast-s57106.txt)
//     shows the fiction working without it: Ilker lands the blow in normal
//     combat. Committed staffed hunts DO mark ctx._huntCommit (competent's
//     committed-hunt flee discipline, 12% hold instead of 35% eject) —
//     that's the escort holding the line on a deliberate hunt, not
//     steering: no tbPlayerWait, no yield turns, no kill assignment. The
//     fight wrapper otherwise delegates purely.
//
// Env gate VETSTAFF=1 opts IN (default OFF). Gate off = pure delegation:
// no protocols, no hunt legs, no fight flags — byte-identical to the
// tribfloor base (the proof test's det-gate pins that). Zero src/js.
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (design call #4 — the
// four readiness bars; VETERANS = living roster with wave-3+ kills in
// state.waveKillLog; VILLAGER XP LAW — villager kills score the ledger
// exactly like the player's).
'use strict';
const TF = require('./tribfloor');

function vetstaffOn() { return process.env.VETSTAFF === '1'; }

// ---------- reads ----------
// (engine-read helpers, pattern-credited to vetrel.js; self-contained so
// this layer composes on tribfloor without coupling to vetrel's module)
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
// Engine convention (game.js:5995): village.health[vid], default 100 when
// unset. A missing record means a healthy villager, not an unknown one.
function villagerHealth(Game, vid) {
  try {
    const h = (((Game.state || {}).village || {}).health || {})[vid];
    return (typeof h === 'number') ? h : 100;
  } catch (e) { return 100; }
}
function armorP(Game, vid) {
  try {
    const S = (globalThis.Scattering || {});
    const vp = (Game.vpOf ? Game.vpOf(vid) : {}) || {};
    const items = (Game.data || {}).items || [];
    return (S.equipment ? (S.equipment.armorOf(vp, items) || 0) : 0);
  } catch (e) { return 0; }
}
// The live VETERANS bar (standing.js): living roster members with a
// wave-3+ kill in waveKillLog, against the engine's own demand. The layer
// stands down once the bar is met — and resumes if a veteran dies (the
// read is live, not latched).
function vetBarMet(Game) {
  try {
    const r = Game.waveCombatReadiness(4);
    return (r.veterans | 0) >= ((r.demand && r.demand.veterans) || 2);
  } catch (e) { return false; }
}
function staffLive(Game) {
  return vetstaffOn() && wave3Unlocked(Game) && !vetBarMet(Game);
}
// Fighters of kind villager/ally who are party members, alive, not fled —
// the "committed companions" the fight hook reads.
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

// ---------- (a) the blood list ----------
// Ordered kill-candidates, living roster (never the scholar), per
// vetdemand rule (iii): tier 0 = rule-iii proven (>=1 wave-3+ kill AND
// village cumulative wave-3+ kills >= 2); tier 1 = blooded/record thin
// (a wave-3+ kill with a thin village record, or blooded on wave-2+
// combat); tier 2 = armor-paired (armorP >= 10 — a naked blooding is a
// dead blooding); tier 3 = unarmored (listed, never staffed).
function bloodList(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
    const log = (Game.state || {}).waveKillLog || [];
    let cum3 = 0;
    const k3 = {}, k2 = {};
    for (const e of log) {
      if (!e || !e.by) continue;
      if ((e.w | 0) >= 3) { cum3++; k3[e.by] = (k3[e.by] || 0) + 1; }
      else if ((e.w | 0) >= 2) { k2[e.by] = (k2[e.by] || 0) + 1; }
    }
    const list = [];
    for (const id of roster) {
      let vp = null;
      try { vp = Game.vpOf(id); } catch (e) { vp = null; }
      if (!vp || vp.dead) continue; // dead excluded
      if (villagerHealth(Game, id) <= 0) continue; // dead excluded
      const n3 = k3[id] | 0, n2 = k2[id] | 0;
      const ap = armorP(Game, id);
      let tier;
      if (n3 >= 1 && cum3 >= 2) tier = 0;
      else if (n3 >= 1 || n2 >= 1) tier = 1;
      else if (ap >= 10) tier = 2;
      else tier = 3;
      list.push({ id, tier, kills3: n3, kills2: n2, armorP: ap });
    }
    // tier asc, then wave-3 kills desc, then armor desc, then id (deterministic).
    list.sort((a, b) => (a.tier - b.tier) || (b.kills3 - a.kills3) ||
      (b.armorP - a.armorP) || (String(a.id) < String(b.id) ? -1 : 1));
    return list;
  } catch (e) { return []; }
}
function bloodListHead(Game) {
  const list = bloodList(Game);
  return list.find(c => c.tier <= 2) || null; // tier 3 listed, never staffed
}

// (a) STAFFING PROTOCOL (daily, at haven): invite the blood-list head
// through the real inviteToParty verb. Once per day; the verb's trust
// floor (20) and acceptance (personality/goals) stay the last word — a
// refusal is honest, and tomorrow's pass tries again.
function staffingProtocol(Game, ctx) {
  if (!vetstaffOn()) return; // gate off: pure silence
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    if (!staffLive(Game)) return; // bar met: stand down
    if (!(Game.playerAtHaven && Game.playerAtHaven())) return; // invites happen at the fire
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 0;
    if (ctx._vsInviteDay === day) return; // one selection pass per day
    ctx._vsInviteDay = day;
    const head = bloodListHead(Game);
    if (!head) return;
    let inP = false;
    try { inP = Game.inParty(head.id); } catch (e) {}
    if (inP) return; // already staffed
    let r = null;
    try { r = Game.inviteToParty(head.id); } catch (e) { r = null; }
    if (r && r.ok) {
      ctx.vetstaffStaff = (ctx.vetstaffStaff || 0) + 1;
      ctx._vsStaffPick = { id: head.id, tier: head.tier };
    }
  } catch (e) {}
}

// ---------- (b) the deliberate staff hunt leg ----------
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
      ctx.vetstaffHuntSteps = (ctx.vetstaffHuntSteps || 0) + 1;
    }
    if (Game.tbfight) { ctx.vetstaffHuntEngaged = (ctx.vetstaffHuntEngaged || 0) + 1; return true; }
    return false;
  } catch (e) { return false; }
}

// Mark a fight object the hunt leg started, so the fight wrapper can tell
// a committed staffed hunt from a random encounter.
function markHuntFight(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (f && ctx._vsHuntFight !== f) {
      ctx._vsHuntFight = f;
      ctx.vetstaffHuntFights = (ctx.vetstaffHuntFights || 0) + 1;
    }
  } catch (e) {}
}

// (b) HUNT LEG (seek side): a deliberate excursion into monster country.
// Every 3rd day, healthy and fed, with the blood-list head IN the party,
// the scholar travels out to thicket/ruin nodes — each node entry rolls
// the real checkEncounter — engages visible wave-3 monsters, then comes
// HOME. Don't strand the village: the leg returns the scholar the same
// day; never hunts exiled.
function staffHuntLeg(Game, ctx) {
  if (!staffLive(Game)) return;
  try {
    if (Game.over || Game.tbfight) return;
    const s = (Game.state || {}).scholar || {};
    if (s.exiled) return;
    if (scholarHpPct(Game) < 0.6) return; // hunt healthy or not at all
    if ((s.kcal || 0) < 200) return;      // don't hunt hungry
    const head = bloodListHead(Game);
    if (!head) return;
    let inP = false;
    try { inP = Game.inParty(head.id); } catch (e) {}
    if (!inP) return; // the hunt runs ONLY with the designated candidate in the party
    if (villagerHealth(Game, head.id) < 60) return; // candidate healthy >= 60
    const day = s.day || 0;
    if (day - (ctx._vsLastHuntDay == null ? -99 : ctx._vsLastHuntDay) < 3) return;
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
    ctx._vsLastHuntDay = day;
    ctx._vsCandidate = head.id;
    ctx.vetstaffHunts = (ctx.vetstaffHunts || 0) + 1;
    const home = { x: Game.map.px, y: Game.map.py };
    for (const leg of cands.slice(0, 2)) {
      if (Game.over || Game.tbfight) break;
      try { Game.travelTo(leg.x, leg.y); } catch (e) { break; }
      ctx.vetstaffHuntLegs = (ctx.vetstaffHuntLegs || 0) + 1;
      if (Game.over) break;
      if (Game.tbfight) { markHuntFight(Game, ctx); break; } // checkEncounter fired en route
      if (engageVisibleWave3(Game, ctx)) { markHuntFight(Game, ctx); break; }
    }
    if (!Game.over && !Game.tbfight && (Game.map.px !== home.x || Game.map.py !== home.y)) {
      try { Game.travelTo(home.x, home.y); } catch (e) {}
    }
  } catch (e) {}
}

// ---------- (c) the fight wrapper ----------
// NO kill-steering. The escort holds the line on a deliberate staffed
// hunt: a hunt-leg fight with the staffed candidate engaged marks
// ctx._huntCommit (competent's committed-hunt flee discipline) so the
// scholar doesn't walk away from the hunt they rode out for. Random
// encounters keep the standard discipline. Recomputed every player turn;
// false whenever the gate is off, the fight isn't a staffed hunt, or no
// wave-3 monster is in it.
function withVetstaff(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!vetstaffOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // courtship + feast machinery run FIRST and fully — never preempted
      staffingProtocol(Game, ctx); // (a) additive
      staffHuntLeg(Game, ctx);      // (b) additive
    },
    fight(Game, ctx) {
      if (!vetstaffOn()) return base.fight(Game, ctx); // gate off: pure delegation, ctx untouched
      try {
        ctx._huntCommit = false;
        const f = Game.tbfight;
        if (f && !f.over && ctx._vsHuntFight === f &&
            Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
          const cand = ctx._vsCandidate;
          const engaged = cand && engagedCompanions(Game).some(c => c.villagerId === cand);
          if (engaged && liveWave3(Game).length) ctx._huntCommit = true;
        }
      } catch (e) { ctx._huntCommit = false; }
      return base.fight(Game, ctx);
    },
  });
}

const vetstaffLead = withVetstaff(
  TF.leadfeast, 'vetstaff-lead',
  'leadfeast + VETSTAFF blood-list staffing (VETSTAFF=1): blood-list head staffed via the real verb, deliberate staffed wave-3 hunts, normal combat only — no kill-steering');
const vetstaffBelong = withVetstaff(
  TF.belongfeast, 'vetstaff-belong',
  'belongfeast + VETSTAFF blood-list staffing (VETSTAFF=1): blood-list head staffed via the real verb, deliberate staffed wave-3 hunts, normal combat only — no kill-steering');

module.exports = {
  vetstaffOn, beastMidOf, beastWaveOf, wave3Unlocked, scholarHpPct, armorP,
  villagerHealth,
  vetBarMet, staffLive, engagedCompanions, liveWave3,
  bloodList, bloodListHead, staffingProtocol, staffHuntLeg, engageVisibleWave3,
  withVetstaff, vetstaffLead, vetstaffBelong,
};
