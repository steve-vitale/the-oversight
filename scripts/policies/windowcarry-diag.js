// policies/windowcarry-diag.js — strand-window-gated morning-food probe
// (sim-windowcarry-b, Loop B run fleshout-loop-b-20261031T1230Z, axis
// food-economy; tracker blank 1 from run 1047Z).
// POLICY PROTOTYPE ONLY, default-OFF, env-gated (WINDOWCARRY=1).
// Zero edits to any existing policy file, zero src/js changes.
// Wraps the warmed stack (nighttravel + woodcarry + woodwarm) with ONE
// half only:
//
//   HAVEN-DEPARTURE PACK CARRY, PRE-STRAND ONLY — in the wrapper daily,
//   BEFORE inner.daily (same position as woodcarry's own morning carry
//   and morningcarry's half (b)): on a haven morning, take pantry food
//   into the pack toward DAYWANT, preferring longest-shelf items first
//   (spoilDay descending), one unit per takeFromPantry call. The engine
//   enforces weight and access; a take that moves nothing ends the loop.
//
//   THE WINDOW GATE (the whole point of this arm): a carry fires ONLY
//   when BOTH hold — (1) this leg's daily-call count (the census
//   loop-day) is <= 7, the last morning before the control strand's
//   first still evening (loop-day 7 on 15215, both legs), AND (2) no
//   still-creek evening has been recorded yet on this leg (ctx._wcLast
//   from the previous evening; once the strand has started, the bank
//   window is closed for good). After the window closes, the lever
//   NEVER acts again on that leg: no re-arming after a return home,
//   no trajectory-wide feeding.
//
//   There is deliberately NO wake-eat half: the routine's own upkeep
//   eat (competentEat) consumes carried staples at wake, so the chain
//   under test is pre-strand carry -> staples survive the night(s) at
//   the creek -> fed strand day -> evening bridge. The driver meters
//   evening pack known-kcal on the night before each rescued evening
//   as the causal-link evidence (see the prereg).
//
// Why this answers sim-morningcarry-b's NO-GO directly:
//   - morningcarry half (b) fired on nearly EVERY haven morning from
//     loop 1, re-routing the whole trajectory; its only ON firing
//     inside the control strand range was loop 5, outside 7-16, so
//     its causal-link clause failed. Windowcarry can fire on at most
//     7 mornings, all pre-strand, so any strand effect is attributable
//     to the bounded pre-strand bank, not to daily re-feeding.
//   - morningcarry's guardrail breaches (new 15211 end-of-horizon
//     strandings, earlier vessel deaths) are re-measured as guards
//     here, not assumed away: a bounded early bank must not re-route
//     a healthy seed into a late stranding either.
//   - The say line names no strand: the vessel cannot know a strand
//     is coming, so prescient narration ("before the strand") would
//     be a sense failure. The line is the same neutral road-packing
//     line morningcarry used.
//
// This file never banks food in the evening, never fells, never trims
// the routine, never touches the sleep clock, never calls travelTo,
// buildBridge, takeWood, or cutTree.
'use strict';

const DAYWANT = 2000;
const MAX_TAKES = 40;
const WINDOW_LAST_LOOPDAY = 7;

function leverOn() { return process.env.WINDOWCARRY === '1'; }

function newStore() {
  return { departRecords: [], errs: [], dailyCount: 0, seenStill: false };
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
// Pure window gate (unit-tested): the bank window is loop-days 1-7 AND
// before the first still-creek evening on this leg. Returns a skip
// reason or null (gate open).
function windowGate(o) {
  if (o.seenStill) return 'window-closed-strand';
  if (o.dailyCount > WINDOW_LAST_LOOPDAY) return 'window-closed-day';
  return null;
}

function withWindowcarry(inner, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id: 'windowcarry',
    desc: 'warmed stack + windowcarry probe (WINDOWCARRY=1): pre-strand haven-departure pack carry only (loop-days 1-7, before first still evening)',
    daily(Game, ctx) {
      let rec = null;
      st.dailyCount += 1;
      const loopDay = st.dailyCount;
      // The previous evening's woodcarry record is the strand sensor:
      // once a still-creek evening exists, the bank window is closed.
      try {
        const wc = (ctx && ctx._wcLast) || null;
        if (wc && wc.bucket === 'creek' && !wc.rescued) st.seenStill = true;
      } catch (e) { noteErr(st, 'daily.still-sense', e); }
      if (!leverOn()) {
        rec = { kind: 'depart', acted: false, skip: 'lever-off', loopDay };
      } else {
        try {
          if (Game.over) {
            rec = { kind: 'depart', acted: false, skip: 'game-over', loopDay };
          } else if (combatLive(Game)) {
            rec = { kind: 'depart', acted: false, skip: 'combat', loopDay };
          } else if (!atHaven(Game)) {
            rec = { kind: 'depart', acted: false, skip: 'not-at-haven', loopDay };
          } else {
            const winSkip = windowGate({ dailyCount: loopDay, seenStill: st.seenStill });
            if (winSkip) {
              rec = { kind: 'depart', acted: false, skip: winSkip, loopDay, seenStill: st.seenStill };
            } else {
              let access = null;
              try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
              if (access === 'none') {
                rec = { kind: 'depart', acted: false, skip: 'no-access', loopDay };
              } else {
                const knownBefore = packKnownKcal(Game);
                const pantryBefore = pantryKcal(Game);
                const ticksBefore = dayTicksOf(Game);
                if (knownBefore !== null && knownBefore >= DAYWANT) {
                  rec = { kind: 'depart', acted: false, skip: 'already-carried', loopDay, knownBefore, pantryBefore, ticksBefore };
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
                    rec = { kind: 'depart', acted: false, skip: 'nothing-to-take', loopDay, knownBefore, knownAfter, pantryBefore, pantryAfter, ticksBefore, ticksAfter };
                  } else {
                    rec = { kind: 'depart', acted: true, takes, units: takes.length, kcalPacked: takes.reduce((t, x) => t + (x.kcalEach || 0), 0), knownBefore, knownAfter, pantryBefore, pantryAfter, ticksBefore, ticksAfter, loopDay };
                    try { Game.say('You pack ' + rec.units + ' portion' + (rec.units > 1 ? 's' : '') + ' from the pantry for the road — ' + rec.kcalPacked + ' kcal carried.'); } catch (e) { noteErr(st, 'depart.say', e); }
                  }
                }
              }
            }
          }
        } catch (e) {
          noteErr(st, 'depart', e);
          rec = { kind: 'depart', acted: false, skip: 'error', loopDay };
        }
      }
      if (rec) {
        try { st.departRecords.push(rec); } catch (e) {}
        try { if (ctx) ctx._wcDepart = rec; } catch (e) {}
      }
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      return r;
    },
  });
}

module.exports = {
  DAYWANT, MAX_TAKES, WINDOW_LAST_LOOPDAY, leverOn, newStore,
  packKnownKcal, sortPantryCandidates, windowGate, withWindowcarry,
};
