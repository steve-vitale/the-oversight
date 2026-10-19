// winsupport — deferral-window fighter support (flesh-out loop arm
// sim-winsupport, run fleshout-20261019T07xxZ, axis scale-onramp).
//
// CONTEXT (evidence/2026-10-19/sim-windowsurvive.md): the window-death
// diagnostic named the policy-side lever surface — 72 window deaths, 0
// unattributed, 63/72 addressable by window support:
//   (b) RAID DEFENSE DURING DEFERRAL — 40/72 raid deaths, scholar-fight-at-haven
//       the dominant ctx. Scholars die more than villagers (42 vs 30); they
//       die rich, not starving (pantry 28k mean) — a violence problem.
//   (a) FIELD RECOVERY for wave-4-engaged fighters — 9 wave-4 combat deaths,
//       all aid-crisis/expedition channels; scholars answer crises personally
//       and die there.
// The VETREL=1 re-measure (sim-vetrel1) showed the veteran channel buys kills
// with lifespan (median survival -58d) — this lever must NOT repeat that
// trade: it is pure defense (recovery + readiness), never more fighting.
//
// THE LEVER — two named protocols, one honest mechanism (bodies as the
// scarce resource), all policy-side, all engine-honest verbs only:
//   (a) POST-FIGHT TRIAGE: a fight-side recorder snapshots wave-4+ fights;
//       when the scholar takes >=25% maxHp damage in one, a 2-day triage flag
//       is set. On triage days (window-gated): EXTRACT — a wounded fighter
//       away from Haven travels home honestly (Game.travelTo(4,4): hall/
//       fireside sleep instead of sleeping rough in the field); TEND —
//       wounded party companions (<70 on the village health map) get the real
//       tendVillager verb (+25 wound heal, 32 ticks), capped 2/day.
//   (b) RAID-NIGHT POSTURE: while the def5 window is live, the upkeep adds
//       one honest rest/day at Haven when the scholar is wounded and rest can
//       actually heal (fed, hydrated, warm — the verb's own metabolic-crisis
//       and cold-shiver rules decide): doAction('rest') — +5 HP, 96 ticks,
//       40 kcal. The scholar meets the night's raids at full strength. The
//       base policy never rests the scholar; this is the distinct addition.
//
// Env gate WINSUPPORT=1 opts IN (default OFF). Gate off = pure delegation:
// daily/upkeep/fight call the base exactly, ctx untouched — the proof test's
// GATE section pins that, and its DET section pins WINSUPPORT=1 byte-
// identical to unset while the window never opens (reads only until def5).
// No game-code changes. No fake kills, no stat edits.
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, wave-4 bands
// 35-95 dmg, the readiness gate + VETERANS bar; the def5 window is where
// this layer lives).
'use strict';
const { leadfeast, belongfeast } = require('./feastscale');

function winsupportOn() { return process.env.WINSUPPORT === '1'; }

// ---------- reads ----------
// The def5 window: standing at/over t5 with readiness bars short — the
// window the windowsurvive diagnostic attributed (median 78d, 72 deaths).
// Pure engine read (standing.js standingDeferral).
function wsWindowLive(Game) {
  try {
    const df = Game.standingDeferral ? Game.standingDeferral(5) : null;
    return !!(df && df.deferred);
  } catch (e) { return false; }
}
function scholarHp(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const maxH = Game.maxHealth ? Game.maxHealth() : 100;
    const hp = (s.health != null ? s.health : (s.hp != null ? s.hp : maxH));
    return { hp, maxH, pct: hp / Math.max(1, maxH) };
  } catch (e) { return { hp: 100, maxH: 100, pct: 1 }; }
}
function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}
function beastMidOf(x) {
  try { return x.monsterId || (x.mdef || {}).id || x.id || null; } catch (e) { return null; }
}
function maxMonsterWave(Game, f) {
  let w = 1;
  try {
    const defs = (Game.data || {}).monsters || [];
    for (const x of (f.fighters || [])) {
      if (!x || x.kind !== 'monster' || (x.hp || 0) <= 0 || x.fled) continue;
      const def = defs.find(d => d && d.id === beastMidOf(x));
      if (def && def.wave) w = Math.max(w, def.wave | 0);
    }
  } catch (e) {}
  return w;
}
// Can the rest verb actually heal right now? The verb's own rules: no
// healing in metabolic crisis (kcal<=0 or hydration<=0), no healing while
// cold-shivering (cold + exposed + no fire/shelter). Read-only mirror.
function restReady(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    if ((s.kcal || 0) <= 0 || (s.hydration || 0) <= 0) return false;
    const rt = Game.playerTile ? Game.playerTile() : null;
    const haven = Game.location === 'haven' || (rt && rt.type === 'haven');
    let sheltered = false, nearFire = false, coldBlooded = false;
    try { sheltered = !!(Game.shelteredFromSky && Game.shelteredFromSky()); } catch (e) {}
    try { nearFire = !!(Game.nearFire && Game.nearFire()); } catch (e) {}
    try { coldBlooded = !!(Game.hasAbility && Game.hasAbility('cold_blooded')); } catch (e) {}
    const coldShiver = Game.state.weather === 'cold' && !haven && !sheltered && !nearFire && !coldBlooded;
    return !coldShiver;
  } catch (e) { return false; }
}

// ---------- (a) post-fight triage: the recorder ----------
// Fight-side: snapshot wave-4+ fights at open (record only — zero behavior
// change in fights). The daily closeout compares the scholar's persistent
// health pool (fighter hp syncs to scholar.health at tbEnd) against the
// snapshot: wave-4+ AND >=25% maxHp damage in one fight -> 2-day triage.
function recordFightStart(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return;
    if (!(Game.tbIsPlayerTurn && Game.tbIsPlayerTurn())) return;
    if (ctx._wsFight === f) return;
    // Back-to-back fights: close out the previous record before the new
    // snapshot overwrites it (yesterday's mauling still counts).
    if (ctx._wsFight && ctx._wsFight !== f) closeFightRecord(Game, ctx);
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    ctx._wsFight = f;
    ctx._wsFightStartHp = p ? (p.hp || 0) : null;
    ctx._wsFightMaxHp = p ? (p.maxHp || p.hp || 100) : 100;
    ctx._wsFightMaxWave = maxMonsterWave(Game, f);
  } catch (e) {}
}
function closeFightRecord(Game, ctx) {
  try {
    const f = ctx._wsFight;
    if (!f) return;
    if (Game.tbfight && !Game.tbfight.over && Game.tbfight === f) return; // still fighting
    const day = (Game.state.scholar || {}).day || 0;
    const { hp } = scholarHp(Game);
    const startHp = ctx._wsFightStartHp, maxHp = ctx._wsFightMaxHp || 100;
    if (startHp != null && (ctx._wsFightMaxWave | 0) >= 4 &&
        (startHp - hp) >= 0.25 * maxHp) {
      ctx._wsTriageUntil = day + 2;
      ctx.wsTriages = (ctx.wsTriages || 0) + 1;
    }
    ctx._wsFight = null; ctx._wsFightStartHp = null;
  } catch (e) { try { ctx._wsFight = null; } catch (e2) {} }
}

// ---------- (b) raid-night posture (upkeep, window-gated) ----------
// One honest rest/day at Haven while the window is live: the scholar meets
// the night's raids at full strength. Bounded (1/day), honest cost (96
// ticks + 40 kcal — the day pays for the recovery).
function raidPosture(Game, ctx) {
  if (!winsupportOn() || !wsWindowLive(Game)) return;
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    const s = (Game.state || {}).scholar || {};
    if (s.dead || s.exiled) return;
    if (!atHaven(Game)) return; // posture is a haven beat
    const day = s.day || 0;
    if (ctx._wsRestDay === day) return; // one top-up rest per day
    const { hp, maxH } = scholarHp(Game);
    if (hp >= maxH) return; // already full — the night finds them ready
    if (!restReady(Game)) return; // starving/dehydrated/freezing: rest can't heal
    Game.doAction('rest', {});
    ctx._wsRestDay = day;
    ctx.wsRests = (ctx.wsRests || 0) + 1;
  } catch (e) {}
}

// ---------- (a) triage day (daily, window-gated) ----------
// EXTRACT: a fighter mauled in the field (triage flag, or <50% HP) travels
// home honestly — hall/fireside sleep instead of sleeping rough. Bounded
// 1/day; the travel itself rolls real encounters (honest cost).
// TEND: wounded party companions get the real tendVillager verb (+25 wound
// heal, 32 ticks of real care), capped 2/day, haven-gated.
function triageDay(Game, ctx) {
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    const s = (Game.state || {}).scholar || {};
    if (s.dead || s.exiled) return;
    const day = s.day || 0;
    const { pct } = scholarHp(Game);
    const triage = (ctx._wsTriageUntil || 0) >= day;
    if (!atHaven(Game) && (triage || pct < 0.5) && ctx._wsExtractDay !== day) {
      try {
        Game.travelTo(4, 4);
        ctx._wsExtractDay = day;
        ctx.wsExtracts = (ctx.wsExtracts || 0) + 1;
      } catch (e) {}
    }
    if (!atHaven(Game)) return; // tending happens at the fire, not in the field
    let party = [];
    try { party = Game.partyMembers ? Game.partyMembers() : []; } catch (e) {}
    if (!party.length) return;
    const vh = ((Game.state.village || {}).health) || {};
    let tended = 0;
    for (const vid of party) {
      if (tended >= 2) break;
      if (!vid || vid === Game.villagerId) continue;
      let vp = null;
      try { vp = Game.vpOf ? Game.vpOf(vid) : (Game.getPerson ? Game.getPerson(vid) : null); } catch (e) {}
      if (!vp || vp.dead) continue;
      const h = (vh[vid] !== undefined) ? vh[vid] : 100;
      if (h >= 70) continue; // the verb's own wound floor
      try {
        Game.tendVillager(vid);
        tended++;
        ctx.wsTends = (ctx.wsTends || 0) + 1;
      } catch (e) {}
    }
  } catch (e) {}
}

function withWinSupport(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    upkeep(Game, ctx) {
      if (!winsupportOn()) return base.upkeep ? base.upkeep(Game, ctx) : undefined; // gate off: pure delegation
      if (base.upkeep) base.upkeep(Game, ctx); // the whole stack runs first and fully — never preempted
      raidPosture(Game, ctx); // (b) additive
    },
    daily(Game, ctx) {
      if (!winsupportOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // the whole stack runs first and fully — never preempted
      closeFightRecord(Game, ctx); // (a) fight closeout — record only
      if (wsWindowLive(Game)) triageDay(Game, ctx); // (a) window-gated triage
    },
    fight(Game, ctx) {
      if (!winsupportOn()) return base.fight(Game, ctx); // gate off: pure delegation, ctx untouched
      recordFightStart(Game, ctx); // (a) record only — zero behavior change in fights
      return base.fight(Game, ctx);
    },
  });
}

const winsupportLead = withWinSupport(leadfeast, 'leadfeast-winsupport',
  'leadfeast + WINSUPPORT window fighter support (WINSUPPORT=1): post-fight triage for wave-4-engaged fighters (extract+tend) + deferral-window raid posture (honest rest top-up)');
const winsupportBelong = withWinSupport(belongfeast, 'belongfeast-winsupport',
  'belongfeast + WINSUPPORT window fighter support (WINSUPPORT=1): post-fight triage for wave-4-engaged fighters (extract+tend) + deferral-window raid posture (honest rest top-up)');

module.exports = {
  winsupportOn, wsWindowLive, scholarHp, atHaven, beastMidOf, maxMonsterWave,
  restReady, recordFightStart, closeFightRecord, raidPosture, triageDay,
  withWinSupport, winsupportLead, winsupportBelong,
};
