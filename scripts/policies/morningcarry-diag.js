// policies/morningcarry-diag.js — morning-side food probe (sim-morningcarry-b).
// POLICY PROTOTYPE ONLY, default-OFF, env-gated (MORNINGCARRY=1).
// Zero edits to any existing policy file, zero src/js changes.
// Wraps the warmed stack (nighttravel + woodcarry + woodwarm) with TWO
// separately-metered halves, each recording into its own store:
//
//   (a) WAKE PACK-EAT — in the wrapper upkeep, BEFORE inner.upkeep, so it
//       is genuinely the first bite of the day (competent.upkeep runs
//       competentEat 3x/day and would otherwise eat the pack first and
//       leave this half nothing to meter). Once per game day, at the
//       first upkeep after a day change, gated on a still-creek previous
//       evening + wake outside the haven: Game.eat() once, nothing else.
//   (b) HAVEN-DEPARTURE PACK CARRY — in the wrapper daily, BEFORE
//       inner.daily (same position as woodcarry's own morning carry):
//       on a haven morning, take pantry food into the pack toward
//       DAYWANT, preferring longest-shelf items first (spoilDay
//       descending), one unit per takeFromPantry call. The engine
//       enforces weight and access; a take that moves nothing ends
//       the loop. takeFromPantry costs no ticks and draws no RNG at
//       ordinary take rates.
//
// Design rationale (trace-shaped, see sim-morningcarry-b-prereg.md):
// strand-morning packs hold NO known food (unknown lumps only,
// kcalEach 0, edible false — eat() refuses them), while the haven
// pantry holds ~20,650 kcal of spoilDay-366 staples the dawn sweep
// cannot take. The chain under test: day-7 departure carry ->
// night survival (spoilDay 366) -> day-8 wake eat -> day-8 evening
// bridge kcal gate (wood 4, ticksLeft 191, kcal 0 on control).
// This file never banks food in the evening, never fells, never
// trims the routine, never touches the sleep clock, never calls
// travelTo, buildBridge, takeWood, or cutTree.
'use strict';

const DAYWANT = 2000;
const MAX_TAKES = 40;

function leverOn() { return process.env.MORNINGCARRY === '1'; }

function newStore() {
  return { wakeRecords: [], departRecords: [], errs: [], lastDaySeen: null };
}
function noteErr(st, where, e) {
  try { st.errs.push(where + ': ' + String((e && e.message) || e).slice(0, 160)); } catch (e2) {}
}

function scholarOf(Game) {
  try { return (Game.state || {}).scholar || {}; } catch (e) { return {}; }
}
function isSpoiledIt(Game, it) {
  try {
    if (typeof Game.isSpoiled === 'function') return !!Game.isSpoiled(it);
  } catch (e) {}
  const sch = scholarOf(Game);
  return !!(it && it.spoilDay !== undefined && it.spoilDay !== null && it.spoilDay <= (sch.day || 0));
}
// Known-edible pack kcal: the engine's own eat() definition — kcalEach > 0,
// edible !== false, unspoiled. Unknown lumps (kcalEach 0, edible false)
// contribute nothing here by construction.
function packKnownKcal(Game) {
  try {
    const inv = scholarOf(Game).inventory || [];
    let sum = 0;
    for (const it of inv) {
      if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
      if (it.edible === false) continue;
      if (isSpoiledIt(Game, it)) continue;
      sum += it.kcalEach * it.units;
    }
    return Math.round(sum);
  } catch (e) { return null; }
}
function scholarKcal(Game) {
  try { return Math.round(scholarOf(Game).kcal || 0); } catch (e) { return null; }
}
function dayTicksOf(Game) {
  try { const s = scholarOf(Game); return (s.dayTicks === undefined ? null : s.dayTicks); } catch (e) { return null; }
}
function atHaven(Game) {
  try {
    const sch = scholarOf(Game);
    if (sch.insideHaven) return true;
    const t = Game.playerTile ? Game.playerTile() : null;
    return !!(t && t.type === 'haven');
  } catch (e) { return false; }
}
function combatLive(Game) {
  try { return !!(Game.inCombat && Game.inCombat()); } catch (e) { return false; }
}
function pantryKcal(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
  } catch (e) { return null; }
}
// Pure candidate ordering for departure takes: longest shelf first
// (null spoilDay counts as longest), then largest kcalEach. Items that
// can never be eaten (kcalEach <= 0, edible false, bonded, spoiled)
// are filtered by the caller, not by this sort.
function sortPantryCandidates(items) {
  const list = (items || []).slice();
  list.sort((a, b) => {
    const sa = (a.spoilDay === null || a.spoilDay === undefined) ? 99999 : a.spoilDay;
    const sb = (b.spoilDay === null || b.spoilDay === undefined) ? 99999 : b.spoilDay;
    if (sb !== sa) return sb - sa;
    return (b.kcalEach || 0) - (a.kcalEach || 0);
  });
  return list;
}
// Pure wake gate (unit-tested): prev evening still-creek + wake outside
// the haven + alive + not in combat.
function wakeGate(o) {
  if (o.gameOver) return 'game-over';
  if (o.combat) return 'combat';
  if (!o.prevStillCreek) return 'not-strand-morning';
  if (o.atHaven) return 'at-haven';
  return null;
}

function withMorningcarry(inner, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id: 'morningcarry',
    desc: 'warmed stack + morningcarry probe (MORNINGCARRY=1): wake pack-eat + haven-departure pack carry',
    upkeep(Game, ctx) {
      let rec = null;
      if (!leverOn()) {
        rec = { kind: 'wake', acted: false, skip: 'lever-off' };
      } else {
        try {
          const sch = scholarOf(Game);
          const day = sch.day || 0;
          const isNewDay = (st.lastDaySeen === null) || (day !== st.lastDaySeen);
          st.lastDaySeen = day;
          if (!isNewDay) {
            rec = null; // later upkeep of the same game day: the wake bite already had its chance
          } else {
            const wc = (ctx && ctx._wcLast) || null;
            const prevStill = !!(wc && wc.bucket === 'creek' && !wc.rescued);
            const gate = wakeGate({ gameOver: !!Game.over, combat: combatLive(Game), prevStillCreek: prevStill, atHaven: atHaven(Game) });
            const kcalBefore = scholarKcal(Game);
            const knownBefore = packKnownKcal(Game);
            const ticksBefore = dayTicksOf(Game);
            if (gate) {
              rec = { kind: 'wake', acted: false, skip: gate, gameDay: day, kcalBefore, knownBefore, ticksBefore };
            } else if (knownBefore === null || knownBefore <= 0) {
              rec = { kind: 'wake', acted: false, skip: 'nothing-known', gameDay: day, kcalBefore, knownBefore, ticksBefore, prevStillCreek: prevStill };
            } else if (kcalBefore !== null && typeof Game.kcalCap === 'function' && kcalBefore >= Game.kcalCap()) {
              rec = { kind: 'wake', acted: false, skip: 'already-full', gameDay: day, kcalBefore, knownBefore, ticksBefore, prevStillCreek: prevStill };
            } else {
              let eatErr = null;
              try { Game.eat(); } catch (e) { eatErr = String((e && e.message) || e).slice(0, 200); }
              const kcalAfter = scholarKcal(Game);
              const knownAfter = packKnownKcal(Game);
              const ticksAfter = dayTicksOf(Game);
              rec = { kind: 'wake', acted: true, gameDay: day, kcalBefore, kcalAfter, ate: (kcalAfter !== null && kcalBefore !== null) ? (kcalAfter - kcalBefore) : null, knownBefore, knownAfter, ticksBefore, ticksAfter, prevStillCreek: prevStill, eatErr };
              if (!eatErr && rec.ate !== null && rec.ate > 0) {
                try { Game.say('You eat from your pack before the day\'s walk — morning food, carried from home. (+' + rec.ate + ' kcal)'); } catch (e) { noteErr(st, 'wake.say', e); }
              }
            }
          }
        } catch (e) {
          noteErr(st, 'wake', e);
          rec = { kind: 'wake', acted: false, skip: 'error' };
        }
      }
      if (rec) {
        try { st.wakeRecords.push(rec); } catch (e) {}
        try { if (ctx) ctx._mcWake = rec; } catch (e) {}
      }
      return inner.upkeep ? inner.upkeep(Game, ctx) : undefined;
    },
    daily(Game, ctx) {
      let rec = null;
      if (!leverOn()) {
        rec = { kind: 'depart', acted: false, skip: 'lever-off' };
      } else {
        try {
          if (Game.over) {
            rec = { kind: 'depart', acted: false, skip: 'game-over' };
          } else if (combatLive(Game)) {
            rec = { kind: 'depart', acted: false, skip: 'combat' };
          } else if (!atHaven(Game)) {
            rec = { kind: 'depart', acted: false, skip: 'not-at-haven' };
          } else {
            let access = null;
            try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
            if (access === 'none') {
              rec = { kind: 'depart', acted: false, skip: 'no-access' };
            } else {
              const knownBefore = packKnownKcal(Game);
              const pantryBefore = pantryKcal(Game);
              const ticksBefore = dayTicksOf(Game);
              if (knownBefore !== null && knownBefore >= DAYWANT) {
                rec = { kind: 'depart', acted: false, skip: 'already-carried', knownBefore, pantryBefore, ticksBefore };
              } else {
                const takes = [];
                let guard = 0;
                while (guard++ < MAX_TAKES) {
                  const knownNow = packKnownKcal(Game);
                  if (knownNow !== null && knownNow >= DAYWANT) break;
                  const v = (Game.state || {}).village || {};
                  const pantry = v.pantry || [];
                  const cands = sortPantryCandidates(pantry).filter((it) => it && (it.kcalEach || 0) > 0 && (it.units || 0) > 0 && it.edible !== false && !it.bonded && !isSpoiledIt(Game, it));
                  if (!cands.length) break;
                  const pick = cands[0];
                  const idx = pantry.indexOf(pick);
                  if (idx < 0) break;
                  const beforeKnown = packKnownKcal(Game);
                  const beforePantry = pantryKcal(Game);
                  try { Game.takeFromPantry(idx); } catch (e) { noteErr(st, 'depart.take', e); break; }
                  const afterKnown = packKnownKcal(Game);
                  const afterPantry = pantryKcal(Game);
                  takes.push({ name: pick.name || null, kcalEach: pick.kcalEach || 0, spoilDay: (pick.spoilDay === undefined ? null : pick.spoilDay) });
                  if (afterKnown === beforeKnown && afterPantry === beforePantry) break; // weight refusal or no-op: stop, don't spin
                }
                const knownAfter = packKnownKcal(Game);
                const pantryAfter = pantryKcal(Game);
                const ticksAfter = dayTicksOf(Game);
                if (!takes.length) {
                  rec = { kind: 'depart', acted: false, skip: 'nothing-to-take', knownBefore, knownAfter, pantryBefore, pantryAfter, ticksBefore, ticksAfter };
                } else {
                  rec = { kind: 'depart', acted: true, takes, units: takes.length, kcalPacked: takes.reduce((t, x) => t + (x.kcalEach || 0), 0), knownBefore, knownAfter, pantryBefore, pantryAfter, ticksBefore, ticksAfter };
                  try { Game.say('You pack ' + rec.units + ' portion' + (rec.units > 1 ? 's' : '') + ' from the pantry for the road — ' + rec.kcalPacked + ' kcal carried.'); } catch (e) { noteErr(st, 'depart.say', e); }
                }
              }
            }
          }
        } catch (e) {
          noteErr(st, 'depart', e);
          rec = { kind: 'depart', acted: false, skip: 'error' };
        }
      }
      if (rec) {
        try { st.departRecords.push(rec); } catch (e) {}
        try { if (ctx) ctx._mcDepart = rec; } catch (e) {}
      }
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      return r;
    },
  });
}

module.exports = {
  DAYWANT, MAX_TAKES, leverOn, newStore,
  packKnownKcal, sortPantryCandidates, wakeGate, withMorningcarry,
};
