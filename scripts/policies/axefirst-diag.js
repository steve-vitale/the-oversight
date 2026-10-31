// policies/axefirst-diag.js — AXEFIRST ruin-run axe supply (sim-axefirst-b
// 1430Z lever; prereg: evidence/2026-10-31/sim-axefirst-b-r1430-prereg.md,
// committed BEFORE any judged leg). POLICY-SIDE PROTOTYPE ONLY: zero
// src/js changes. The data half of the lever lives in src/data/
// regions.json (one hatchet entry per list pool); this file is the
// policy half, env-gated AXEFIRST=1/0, wrapping the warmed strand
// stack (nighttravel + woodcarry + woodwarm).
//
// On gameDays 2-6 inclusive, if the vessel starts the day at haven and
// holds no axe-tier tool (own woodcutTier only — own state), the vessel
// makes ONE deliberate ruin run that day, then the base daily runs as
// usual: find the nearest ruin (engine-offered travelTargets first;
// else scan the visible board via tileAt for type 'ruin' — the board
// the player sees, same class as stoneRun's rubble scan, NOT a roster,
// NOT a loot queue, NOT another villager's state), hop-walk there with
// competent's walkTo pattern (one travelTo per hop, no force, bounded),
// search with the engine's own doAction('forage') until a hatchet is in
// the vessel's own pack/equipped or a guard stops the loop (12 searches,
// 2 consecutive no-gain searches, ticksLeft <= 64, kcal < 300, game-over,
// combat), then walk back to the day's start tile. The wrapper never
// calls a state-editing verb except travelTo and doAction('forage') —
// the two verbs a player walking to a ruin and searching it would use.
// It never reads another villager's gear, knowledge, materials, or
// position, never reads a loot queue, never builds a list of who holds
// what. Perception-law clean by construction: own tier, own pack, own
// position, own kcal/ticks, the visible board, engine-offered steps.
//
// The tick/kcal guards are load-bearing: a pre-prereg probe showed an
// 8th search crossing the day boundary (dayTicks reset, overnight burn
// to 0 kcal) — the loop must never spend the day boundary or the
// vessel's food floor.
// PILOT FIX (r1430 pilot, disclosed in evidence): the prereg's literal
// "ticksLeft < 64" does NOT honor that invariant — a 64-tick search
// with exactly 64 ticks left lands ON the boundary and endDay fires
// (pilot lever leg: ticksAfter 512, kcalAfter 0 after 2 searches from
// a 128-tick dawn budget). The guard is therefore ticksLeft <= 64:
// a search runs only when MORE than its own cost remains in the day.
// On this stack dawn ticksLeft is ~128 (the harness's 3 waits consume
// the rest), so at most 1 search fits safely per run-day.
'use strict';

const MAX_SEARCHES = 12;
const MAX_NO_GAIN = 2;
const KCAL_FLOOR = 300;
const SEARCH_TICKS = 64;
const MAX_HOPS = 12;

function axefirstOn() {
  try { return process.env.AXEFIRST === '1'; } catch (e) { return false; }
}

function newStore() {
  return { records: [], errs: 0, errors: [], runs: 0, finds: 0, unreached: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

function startsAtHaven(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    if (sch.insideHaven === true) return true;
    const t = Game.playerTile();
    return !!(t && t.type === 'haven');
  } catch (e) { return false; }
}

function ownTier(Game) {
  try {
    const t = (typeof Game.woodcutTier === 'function') ? Game.woodcutTier() : null;
    return t ? (t.tier || null) : null;
  } catch (e) { return null; }
}

function packHasHatchet(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    for (const it of (sch.inventory || [])) {
      if (it === 'hatchet') return true;
      if (it && (it.itemId === 'hatchet' || it.id === 'hatchet')) return true;
    }
    for (const e of Object.values(sch.equipped || {})) {
      if (e === 'hatchet') return true;
      if (e && (e.itemId === 'hatchet' || e.id === 'hatchet')) return true;
    }
  } catch (e) {}
  return false;
}

function packLen(Game) {
  try { return ((Game.state || {}).scholar || {}).inventory ? Game.state.scholar.inventory.length : 0; }
  catch (e) { return 0; }
}

function packIds(Game) {
  // Inventory entries are heterogeneous: gear carries itemId, cans
  // carry plantId, books carry bookId, some entries are bare strings.
  // Map every shape to its id so run gains read sensibly (a can gain
  // previously read as null).
  try {
    return (((Game.state || {}).scholar || {}).inventory || []).map((it) => {
      if (typeof it === 'string') return it;
      return (it && (it.itemId || it.id || it.plantId || it.bookId)) || null;
    });
  } catch (e) { return []; }
}

// Multiset difference: ids in `after` not accounted for by `before`.
function gainedIds(before, after) {
  const counts = {};
  for (const id of (before || [])) counts[id] = (counts[id] || 0) + 1;
  const out = [];
  for (const id of (after || [])) {
    if (counts[id]) counts[id]--;
    else out.push(id);
  }
  return out;
}

function scholarKcal(Game) {
  try { return Math.round(((Game.state || {}).scholar || {}).kcal || 0); } catch (e) { return 0; }
}

function ticksLeft(Game) {
  try {
    const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
    return tpd - (((Game.state || {}).scholar || {}).dayTicks || 0);
  } catch (e) { return 0; }
}

// Pure gate (unit-tested): should this day's daily() attempt a ruin run?
function runDecision(o) {
  if (!o || !o.on) return { run: false, skip: 'lever-off' };
  if (o.gameOver) return { run: false, skip: 'game-over' };
  if (o.combat) return { run: false, skip: 'combat' };
  if (o.gameDay === null || o.gameDay === undefined || o.gameDay < 2 || o.gameDay > 6) return { run: false, skip: 'out-of-window' };
  if (!o.atHaven) return { run: false, skip: 'not-at-haven' };
  if (o.tier === 'fell') return { run: false, skip: 'has-axe' };
  return { run: true, skip: null };
}

// Pure search-loop stop rule (unit-tested). Returns a stop reason or null
// (keep searching).
function searchStop(o) {
  if (o.found) return 'found';
  if (o.gameOver) return 'game-over';
  if (o.combat) return 'combat';
  if (o.searches >= MAX_SEARCHES) return 'search-cap';
  if (o.noGain >= MAX_NO_GAIN) return 'no-gain';
  // <= (not <): a search with exactly its cost left lands ON the day
  // boundary and endDay fires (pilot-proven). See header note.
  if (o.ticksLeft <= SEARCH_TICKS) return 'ticks';
  if (o.kcal < KCAL_FLOOR) return 'kcal';
  return null;
}

// Nearest ruin by Manhattan distance from the current node. Offered
// travelTargets first (tileAt type check on each); if none offered is a
// ruin, scan the whole visible board. Returns {x, y, via} or null.
function nearestRuin(Game) {
  let sx = 0, sy = 0;
  try { sx = Game.map.px; sy = Game.map.py; } catch (e) {}
  const cands = [];
  try {
    for (const tt of (Game.travelTargets() || [])) {
      let t = null;
      try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
      if (t && t.type === 'ruin') cands.push({ x: tt.x, y: tt.y, via: 'offered' });
    }
  } catch (e) {}
  if (!cands.length) {
    let n = 9;
    try { n = (Game.map && Game.map.worldSize) || 9; } catch (e) {}
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        let t = null;
        try { t = Game.tileAt(x, y); } catch (e) {}
        if (t && t.type === 'ruin') cands.push({ x, y, via: 'scan' });
      }
    }
  }
  if (!cands.length) return null;
  let best = null, bd = 1e9;
  for (const c of cands) {
    const d = Math.abs(c.x - sx) + Math.abs(c.y - sy);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

// Hop-walk toward (tx, ty): one travelTo per hop toward the offered
// target minimizing Manhattan distance. No force, no teleport. Returns
// {arrived, hops, reason} where reason is null on arrival.
function hopWalk(Game, tx, ty) {
  let hops = 0;
  for (;;) {
    let cx = null, cy = null;
    try { cx = Game.map.px; cy = Game.map.py; } catch (e) { return { arrived: false, hops, reason: 'no-position' }; }
    if (cx === tx && cy === ty) return { arrived: true, hops, reason: null };
    if (hops >= MAX_HOPS) return { arrived: false, hops, reason: 'hop-cap' };
    if (Game.over) return { arrived: false, hops, reason: 'game-over' };
    if (combatLive(Game)) return { arrived: false, hops, reason: 'combat' };
    let best = null, bd = Math.abs(cx - tx) + Math.abs(cy - ty);
    try {
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - tx) + Math.abs(tt.y - ty);
        if (d < bd) { bd = d; best = tt; }
      }
    } catch (e) { return { arrived: false, hops, reason: 'targets-error' }; }
    if (!best) return { arrived: false, hops, reason: 'no-target' };
    try { Game.travelTo(best.x, best.y); } catch (e) { return { arrived: false, hops, reason: 'travel-error' }; }
    hops++;
    let nx = null, ny = null;
    try { nx = Game.map.px; ny = Game.map.py; } catch (e) {}
    if (nx === cx && ny === cy) return { arrived: false, hops, reason: 'travel-refused' };
  }
}

// One ruin run. Caller guarantees the gate passed. Never throws: all
// failures land in the record.
function runRuinRun(Game, store, loopDay, gameDay) {
  const rec = {
    loopDay, gameDay, acted: true,
    start: null, ruin: null, searches: 0, found: false, foundDay: null,
    stop: null, unreached: null, return: null, returnReason: null,
    kcalBefore: scholarKcal(Game), ticksBefore: ticksLeft(Game),
    kcalAfter: null, ticksAfter: null, errors: [],
    packBefore: packIds(Game), packAfter: null, gained: null,
  };
  try { rec.start = { x: Game.map.px, y: Game.map.py }; } catch (e) {}
  let ruin = null;
  try { ruin = nearestRuin(Game); } catch (e) { noteErr(store, 'ruin.find', e); rec.errors.push('find: ' + String(e && e.message).slice(0, 80)); }
  if (!ruin) { rec.unreached = 'no-ruin'; rec.return = 'unreached'; rec.kcalAfter = scholarKcal(Game); rec.ticksAfter = ticksLeft(Game); rec.packAfter = packIds(Game); rec.gained = []; return rec; }
  rec.ruin = { x: ruin.x, y: ruin.y, via: ruin.via };
  const walk = hopWalk(Game, ruin.x, ruin.y);
  rec.hopsOut = walk.hops;
  if (!walk.arrived) {
    rec.unreached = walk.reason; rec.return = 'unreached';
    rec.kcalAfter = scholarKcal(Game); rec.ticksAfter = ticksLeft(Game);
    rec.packAfter = packIds(Game); rec.gained = [];
    return rec;
  }
  let searches = 0, noGain = 0, found = false, stop = null;
  while (!stop) {
    stop = searchStop({
      found, gameOver: !!Game.over, combat: combatLive(Game),
      searches, noGain, ticksLeft: ticksLeft(Game), kcal: scholarKcal(Game),
    });
    if (stop) break;
    const beforeLen = packLen(Game);
    try { Game.doAction('forage', {}); } catch (e) { noteErr(store, 'ruin.search', e); rec.errors.push('search: ' + String(e && e.message).slice(0, 80)); stop = 'error'; break; }
    searches++;
    found = packHasHatchet(Game);
    if (!found) {
      if (packLen(Game) === beforeLen) noGain++;
      else noGain = 0;
    }
  }
  rec.searches = searches; rec.found = found;
  rec.foundDay = found ? gameDay : null;
  rec.stop = stop || (found ? 'found' : 'guards');
  const back = (rec.start && !Game.over && !combatLive(Game))
    ? hopWalk(Game, rec.start.x, rec.start.y)
    : { arrived: false, hops: 0, reason: Game.over ? 'game-over' : 'combat' };
  rec.hopsBack = back.hops;
  rec.return = back.arrived ? 'home' : 'away';
  rec.returnReason = back.arrived ? null : back.reason;
  rec.kcalAfter = scholarKcal(Game); rec.ticksAfter = ticksLeft(Game);
  rec.packAfter = packIds(Game);
  rec.gained = gainedIds(rec.packBefore, rec.packAfter);
  return rec;
}

function withAxefirst(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'axefirst',
    desc: 'warmed strand stack + deliberate ruin run for a hatchet, days 2-6 (AXEFIRST=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      let rec = null;
      if (!axefirstOn()) {
        rec = { acted: false, skip: 'lever-off', loopDay };
      } else {
        try {
          const sch = (Game.state || {}).scholar || {};
          const gameDay = (sch.day === undefined ? null : sch.day);
          const dec = runDecision({
            on: true, gameOver: !!Game.over, combat: combatLive(Game),
            gameDay, atHaven: startsAtHaven(Game), tier: ownTier(Game),
          });
          if (!dec.run) {
            rec = { acted: false, skip: dec.skip, loopDay, gameDay };
          } else {
            // runRuinRun records kcalBefore/ticksBefore itself at entry.
            rec = runRuinRun(Game, st, loopDay, gameDay);
            st.runs++;
            if (rec.found) st.finds++;
            if (rec.unreached) st.unreached++;
          }
        } catch (e) {
          noteErr(st, 'daily', e);
          rec = { acted: false, skip: 'error', loopDay };
        }
      }
      try { st.records.push(rec); } catch (e) {}
      try { ctx._axLast = rec; } catch (e) { noteErr(st, 'daily.ctx', e); }
      // A vessel who died mid-run takes no base day.
      if (Game.over) return undefined;
      return inner.daily ? inner.daily(Game, ctx) : undefined;
    },
  });
}

module.exports = {
  MAX_SEARCHES, MAX_NO_GAIN, KCAL_FLOOR, SEARCH_TICKS,
  axefirstOn, newStore, runDecision, searchStop, nearestRuin, hopWalk,
  runRuinRun, withAxefirst,
};
