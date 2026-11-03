// policies/wave4seek.js — wave-4 seek layer (Loop A 20261103T0115Z,
// arm sim-wave4encounter-lever, axis scale-onramp). POLICY ONLY: zero
// src/js changes.
//
// Question: does actively seeking wave-4 monsters convert the known zero
// (seed 97339: NATIONAL, wave 4 unlocked, ZERO wave-4 fought in 92 days)
// into deeds?
//
// PERCEPTION LAW (load-bearing, Steve 2026-10-28): villagers — and the
// player — know who's around only through their own senses: seeing
// someone in the same place, hearing a shout, following someone they've
// seen. NO magic roster/list feed, ever. This layer therefore NEVER
// reads Game.worldMonsters(), Game.nearestWorldMonster(), Game.monsterAt(),
// or any monster position, roster, or link list. It decides only from:
//   1. Game.unlockedWave() — the wave unlock is ANNOUNCED in-game
//      (checkWaveUnlockBeat: "The Mirror Draft" beat), so an unlocked
//      wave 4 is player knowledge, not engine peeking.
//   2. Game.deedState().wavesFaced — the village's OWN fight history
//      (recordDeedFight: real blow-by-blow fights only). Counting how
//      many distinct wave-4 kinds the village itself has fought is
//      reading its own record, not a roster.
//   3. Game.travelTargets() — the player's OWN revealed map (the same
//      engine-offered destinations deed-seeking's patrol uses). Tile
//      choice is farthest-first and undirected: the policy patrols wild
//      ground hoping the encounter roll fires; it never walks toward a
//      monster, because it never knows where one is.
//   4. Its own kcal guard (same shape as deed-seeking's patrol guard).
// There is NO in-game channel that reports a wave-4 monster's position
// to the player (verified in the prereg: perceptionHints() fires only
// for a monster on/adjacent to the player's own tile; scout reports map
// tiles, never monster positions; the muster beat names a threat near
// Haven without a tile; the titan lair report is titans-only). So this
// layer is UNDIRECTED patrol, not targeted travel — and that distinction
// IS part of the finding: if undirected patrol converts the zero, the
// gap was encounter opportunity; if it does not, no policy-side seek
// can fix it without a new in-game reporting channel (a game change,
// out of scope for this arm).
//
// BEHAVIOR: while wave 4 is unlocked and the village has fought fewer
// than 3 distinct wave-4 kinds (the full-seat deed bar), patrol DAILY
// (deed-seeking patrols ~3x/week; this arm patrols every day the guard
// passes) over up to 4 far wild tiles per daily, foraging on arrival
// (each tile entry runs the engine's own checkEncounter roll). Fight
// behavior is UNCHANGED from the base stack: this arm tests encounter
// opportunity, not fight tactics — a fled fight still records a deed
// (recordDeedFight fires on the fight wraps, and fieldFight outcomes
// mFlee/vFlee record too), so engaging is the base's own business.
// No RNG is consumed by this layer (no random calls): tile order is
// farthest-first deterministic, schedule is every day. Arm/baseline
// trajectories differ ONLY through the patrol actions and their
// consequences (encounters, forage, kcal, day-part spend).
'use strict';

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function unlockedWave(Game) {
  try { return (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : 1; } catch (e) { return 1; }
}

// Distinct wave-4 kinds fought, from the village's OWN deed record.
// Returns -1 when the record is unreadable (fail closed: do not patrol
// on an unread record).
function w4FacedCount(Game) {
  try {
    const d = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (d && d.wavesFaced) || {};
    let n = 0;
    for (const mid of Object.keys(faced)) { if ((faced[mid] | 0) === 4) n++; }
    return n;
  } catch (e) { return -1; }
}

function wave4Patrol(Game, ctx) {
  try {
    if (Game.over || Game.tbfight) return;
    if (unlockedWave(Game) < 4) return;
    const faced = w4FacedCount(Game);
    if (faced < 0 || faced >= 3) return; // unread record, or bar already met
    const day = gday(Game);
    if (ctx._w4seekDay === day) return; // once per day (upkeep runs 3x/day)
    ctx._w4seekDay = day;
    const s = Game.state.scholar || {};
    if ((s.kcal || 0) < (Game.kcalCap ? Game.kcalCap() * 0.4 : 800)) return;
    const cands = [];
    const targets = (Game.travelTargets ? Game.travelTargets() : []) || [];
    for (const tt of targets) {
      let t = null;
      try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
      if (!t || t.type === 'haven') continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d || 0 });
    }
    cands.sort((a, b) => b.d - a.d); // far tiles first: different ground
    let visited = 0;
    for (const c of cands.slice(0, 4)) {
      if (Game.over || Game.tbfight) break;
      try { Game.travelTo(c.x, c.y); } catch (e) { break; }
      if (Game.over || Game.tbfight) break;
      visited++;
      try { Game.doAction('forage', {}); } catch (e) {}
      if (Game.over || Game.tbfight) break;
    }
    if (visited) {
      ctx.w4seek = ctx.w4seek || { patrols: 0, patrolDays: [] };
      ctx.w4seek.patrols++;
      ctx.w4seek.patrolDays.push(day);
    }
  } catch (e) {}
}

function withWave4Seek(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'wave4seek',
    desc: desc || 'wave4seek: daily undirected wild patrol while wave 4 unlocked and w4 deed bar unmet',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.w4seekBaseDailyErr = String(e.message).slice(0, 120); }
      }
      wave4Patrol(Game, ctx);
    },
  });
  return wrapped;
}

module.exports = { withWave4Seek, wave4Patrol, w4FacedCount, unlockedWave };
