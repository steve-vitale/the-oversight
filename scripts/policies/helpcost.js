// helpcost — cost-accounting instrument for the sim-helpcost arm (2026-10-17,
// scale-onramp axis).
//
// THE INSTRUMENT: wraps scripts/policies/helpcall.js's armed policies
// (HELPCALL=1, reuse — helpcall.js is NOT modified, zero src/js changes) on
// the armed side, and the tribfloor base (TF.leadfeast/TF.belongfeast) on the
// control side. Both sides run the SAME observation code; HELPCALL is the
// only switch.
//
// WHAT IT MEASURES (the sim-helpcall2 "named next", metric review):
//   (1) runner-absence cost — villager day-parts away during crises,
//       measured SEPARATELY from runner deaths: per-runner away-episode
//       windows, parts consumed (engine-true: partsLeft deltas across daily
//       census), and the crisis-active subset of those parts;
//   (2) aid-runner deaths attributed by situation — every 'died' placement
//       records crisis tier/wave, one-way parts (distance), runner
//       temperament (npcTemper — bold runners are the picked pool), held
//       abilities count, and the engine's own road-danger formula value;
//   (3) engagement volume — apex-raid crisis episode census per run
//       (distinct crises: crisis.raiders && wave>=3, deduped by sinceDay;
//       one crisis at a time by engine construction), run on BOTH sides to
//       test the 38-vs-13 hypothesis (apex frequency vs seeds vs
//       NODEWITNESS).
//
// PURE OBSERVATION. Reads only: Game.aidCrisis() (pure), Game.state.aidRunners
// (read), Game.state.hcLedger (read — NEVER created), Game.npcTemper (pure),
// Game.aidPartsFor (pure), state.village.npcAbilities (read). No RNG reads,
// no state writes, no Game.say wraps. All instrument state lives on a
// WeakMap keyed by Game — never on Game.state — so the det-gate stays
// byte-clean. Gate-off (HELPCALL unset): the wrapper is a pure pass-through;
// the proof's det-gate pins byte-identical game-true fields.
'use strict';
const HC = require('./helpcall');
const TF = require('./tribfloor');

// Per-Game instrument state. WeakMap: dies with the Game, never touches
// Game.state, never survives into the next run.
const perGame = new WeakMap();

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function inst(Game) {
  let s = perGame.get(Game);
  if (!s) {
    s = {
      apexEpisodes: 0,        // distinct apex-raid crises seen
      apexCrisisDays: 0,      // daily ticks with an apex raid crisis active
      seenCrisisKeys: new Set(),
      seenCalls: 0,           // hcLedger.calls consumed
      placementCtx: [],        // per-placement situation records
      runnerDeaths: [],        // 'died' placements with full situation
      runners: new Map(),      // vid -> { windows: [...], cur: {...}|null } (day windows, for death-day matching)
      partAway: {},            // vid -> runner-day-parts away (per-part census, engine-true)
      partAwayCrisis: {},       // vid -> ...of those, while an apex raid crisis was active
    };
    perGame.set(Game, s);
  }
  return s;
}

function apexCrisis(Game) {
  try {
    if (typeof Game.aidCrisis !== 'function') return null;
    const c = Game.aidCrisis();
    if (!c || c.resolved) return null;
    if (!c.raiders) return null;
    if (((c.wave | 0) || 1) < 3) return null;
    return c;
  } catch (e) { return null; }
}

// The ledger: read-only. helpcall.js creates Game.state.hcLedger on the
// armed placement path; on control it stays null and we must NOT create it
// (a state write would dirty the det-gate).
function readLedger(Game) {
  try { return (Game.state && Game.state.hcLedger) || null; } catch (e) { return null; }
}

function runnerSituation(Game, c) {
  const vid = String(c.runner || '');
  const wave = (c.wave | 0) || 1;
  const out = {
    day: c.day, wave, tier: String(c.tier || ''), ret: String(c.ret || ''),
    target: String(c.targetId || ''), runner: vid, parts: null,
    temper: null, abilities: null, mishap: null,
    // The engine's own road-danger formula (comms.js aidSendRunner):
    // danger = 0.12 + 0.02 * wave. Documented, not re-derived.
    danger: +(0.12 + 0.02 * wave).toFixed(4),
  };
  try { if (typeof Game.aidPartsFor === 'function') out.parts = Game.aidPartsFor(c.targetId); } catch (e) {}
  try { if (vid && typeof Game.npcTemper === 'function') out.temper = Game.npcTemper(vid); } catch (e) {}
  try {
    const ab = (Game.state && Game.state.village && Game.state.village.npcAbilities) || {};
    out.abilities = ((ab[vid] || []).length | 0);
  } catch (e) {}
  try {
    const rs = (Game.state && Game.state.aidRunners) || [];
    for (const r of rs) if (String(r.vid || '') === vid) { out.mishap = r.mishap || null; break; }
  } catch (e) {}
  return out;
}

function observe(Game, s) {
  const day = gday(Game);
  // (3) apex-raid episode census — both sides.
  const crisis = apexCrisis(Game);
  if (crisis) {
    const key = String(crisis.sinceDay) + '/w' + ((crisis.wave | 0) || 1) + '/' + String(crisis.name || '');
    if (!s.seenCrisisKeys.has(key)) { s.seenCrisisKeys.add(key); s.apexEpisodes++; }
    s.apexCrisisDays++;
  }
  // (2) new placements — situation recorded once, at placement time.
  const led = readLedger(Game);
  const calls = led ? (led.calls || []) : [];
  for (const c of calls.slice(s.seenCalls)) {
    const sit = runnerSituation(Game, c);
    s.placementCtx.push(sit);
    if (String(c.ret || '') === 'died') s.runnerDeaths.push(sit);
  }
  s.seenCalls = calls.length;
  // (1a) runner-away day windows — for death-day matching (the absence COST
  // attribution). The precise day-part accounting lives in the per-part
  // census (installPartCensus): a daily tick misses runners who complete a
  // short leg inside one harness day.
  let seen = null;
  try { seen = (Game.state && Game.state.aidRunners) || []; } catch (e) { seen = []; }
  const seenVids = new Set();
  for (const r of seen) {
    const vid = String((r && r.vid) || '');
    if (!vid) continue;
    seenVids.add(vid);
    let rec = s.runners.get(vid);
    if (!rec) { rec = { windows: [], cur: null }; s.runners.set(vid, rec); }
    if (!rec.cur) rec.cur = { firstDay: day, lastDay: day };
    rec.cur.lastDay = day;
  }
  for (const [vid, rec] of s.runners) {
    if (rec.cur && !seenVids.has(vid)) { rec.windows.push(rec.cur); rec.cur = null; }
  }
}

// installPartCensus: per-part runner-away accounting. commsTick rides
// advancePart and decrements every runner's partsLeft once per part; the
// entry is removed the part it hits 0. Observing BEFORE the original runs
// counts exactly the engine's own away parts: one observation per part the
// runner is on the road. Pure read of aidRunners + the apex predicate, no
// RNG, no state mutation — the same neutrality class as the daily observe.
function installPartCensus(Game) {
  const s = inst(Game);
  try {
    if (typeof Game.commsTick !== 'function' || Game.commsTick.__hcPartWrapped) return;
    const orig = Game.commsTick.bind(Game);
    const w = function () {
      try {
        const crisis = apexCrisis(Game);
        const rs = (Game.state && Game.state.aidRunners) || [];
        for (const r of rs) {
          const vid = String((r && r.vid) || '');
          if (!vid) continue;
          s.partAway[vid] = (s.partAway[vid] | 0) + 1;
          if (crisis) s.partAwayCrisis[vid] = (s.partAwayCrisis[vid] | 0) + 1;
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    w.__hcPartWrapped = true;
    Game.commsTick = w;
  } catch (e) {}
}

function withHelpCost(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      const r = base.daily ? base.daily(Game, ctx) : undefined;
      try { observe(Game, inst(Game)); } catch (e) {
        // Observation must never break a run. Count, don't throw.
        try { ctx.hcObserveError = (ctx.hcObserveError | 0) + 1; } catch (e2) {}
      }
      return r;
    },
  });
}

// Summary for the sweep JSON. Windows include any still-open episode at
// run end (runner en route when the run ended — attributed, not dropped).
function costSummary(Game) {
  const s = perGame.get(Game);
  if (!s) return null;
  const windows = [];
  let trips = 0;
  for (const [vid, rec] of s.runners) {
    const all = rec.windows.concat(rec.cur ? [rec.cur] : []);
    for (const w of all) {
      trips++;
      windows.push({ vid, firstDay: w.firstDay, lastDay: w.lastDay, open: !!rec.cur && w === rec.cur });
    }
  }
  return {
    apexRaidEpisodes: s.apexEpisodes,
    apexCrisisDays: s.apexCrisisDays,
    runnerTrips: trips,
    runnerAwayDayParts: Object.values(s.partAway).reduce((t, n) => t + (n | 0), 0),
    absenceCrisisDayParts: Object.values(s.partAwayCrisis).reduce((t, n) => t + (n | 0), 0),
    awayPartsByRunner: s.partAway,
    tripWindows: windows,
    placements: s.placementCtx.length,
    placementCtx: s.placementCtx,
    runnerDeaths: s.runnerDeaths,           // aid-runner deaths with full situation
  };
}

const leadCost = withHelpCost(HC.leadhc, 'leadfeast-helpcost',
  'leadfeast + helpcall + cost instrument (HELPCALL=1): apex aid calls, then the base');
const belongCost = withHelpCost(HC.belonghc, 'belongfeast-helpcost',
  'belongfeast + helpcall + cost instrument (HELPCALL=1): apex aid calls, then the base');
const leadBaseCost = withHelpCost(TF.leadfeast, 'leadfeast-helpcost-base',
  'leadfeast + cost instrument, HELPCALL unset (true default-OFF control)');
const belongBaseCost = withHelpCost(TF.belongfeast, 'belongfeast-helpcost-base',
  'belongfeast + cost instrument, HELPCALL unset (true default-OFF control)');

module.exports = {
  withHelpCost, costSummary, inst, installPartCensus,
  leadCost, belongCost, leadBaseCost, belongBaseCost,
};
