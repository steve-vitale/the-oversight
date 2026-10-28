// outdoorcrew — joint foraging outings as a policy-side crew feed
// (sim-outdoorcrew-a, axis scale-onramp, run fleshout-20261028T1628Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: OUTDOORCREW unset or not
// '1' -> upkeep delegates to tableseat-nowait.upkeep with NO outing
// behavior at all (the det-gate in scripts/test-outdoorcrew-a.js pins
// that: off upkeep adds no oc* ctx surface and changes nothing).
//
// QUESTION (from the 1528Z fieldparty census): wild meetings build
// their party SOLELY from Game._outdoorCrew, the snapshot
// resolveAssignments takes from assignments on patrol/scout/hunt/
// forage tasks — and on the shared band that snapshot was empty in
// 0/1,272 meetings because the policy never assigns an outdoor task.
// This layer asks whether a competent-like policy can legitimately
// fill it: send villagers out TOGETHER (a pair on the same forage
// outing, one of Steve's seven ordered villager-rationality items,
// 2026-10-27) so that when one member meets a monster, crew-mates
// are already present via the EXISTING crew path.
//
// CONSTRAINTS, ALL HONORED BY CONSTRUCTION (never bypassed):
// - NO RADAR: the policy never reads monster positions, never routes
//   anyone to a monster tile. Foragers go to forage; the crew path
//   counts them only because they were sent out together. (The
//   villager-objectives.js law — knowledge gates the route, never a
//   radar — is untouched: no route is issued at all.)
// - WILLINGNESS: assignments go through Game.assignTask, whose
//   checkObedience trust gate (+ reluctant roll under trust 40) and
//   <40 HP outdoor refusal are the engine's own willingness logic.
//   A refusal is counted (ocRefused) and the villager stays home.
//   Nothing here forces a join, and nothing here touches fight code
//   — whether a crew-mate answers a shout is the engine's hopeless-
//   shout logic, not this policy.
// - NO GAME NUMBERS: no monster stats, wave gates, table gates, or
//   spawn rates are touched (nothing here can touch them — it is a
//   policy file, and it assigns one existing task type).
//
// DESIGN (the file is the spec; the prereg binds the judgment):
// - Pair size 2, task forage, every upkeep part: each part's
//   resolveAssignments snapshots that part's pair, so the snapshot
//   the daily movement window sees (wild meetings fire on scholar
//   tile entries, i.e. during daily) is always a fresh pair, whatever
//   the loop-day's part alignment. A pair is exactly the party the
//   wild path can express (allyVids capped at 2, at most 1 joins).
// - Selection: free (unassigned, not gardenKeeper, not the scholar,
//   alive), village.health >= 40 where known (the engine's own
//   outdoor floor, pre-checked so the attempt isn't wasted),
//   trust-descending (the crew path itself sorts by trust, so the
//   pair the engine names first is the pair most likely to be
//   named). Only when the village holds >= 6 living roster (never
//   strip a tiny Haven) and the scholar is at Haven (assignTask's
//   in-person requirement — the honest leadership verb).
// - Food distortion is self-bounded by the engine's own prodThrottle:
//   when the pantry holds > 4 fresh days, a forage resolution turns
//   to wood/water/stone BEFORE any yield or depletion — the pair
//   still counts as crew at snapshot time (they set out together;
//   the engine narrates the pantry check honestly), but adds no
//   food. In lean times the pair genuinely forages, which is when
//   the village needs it. The band's wall/food secondaries report
//   the net effect; no food claim is made from this arm.
// - Bond side effect, engine-owned: resolveAssignments calls
//   noteCrewTogether on the snapshot, so a pair that walks out
//   together bonds (+1 combat bond/pair/part). That is the game's
//   own party-bond system, not a lever added here.
//
// A GO verdict means GO CANDIDATE as an instrument, default-OFF only
// — landing this as competent play is a coordinator/Steve call, NOT
// made by this arm. No default flips.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

const OUTDOOR_TASKS = ['patrol', 'scout', 'hunt', 'forage'];

function layerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.OUTDOORCREW) || '0') === '1'; } catch (e) { return false; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) {
  try { const t = ((Game.state || {}).village || {}).trust || {}; return (t[vid] === undefined) ? 10 : t[vid]; } catch (e) { return 10; }
}
function hpOf(Game, vid) {
  try { const h = ((Game.state || {}).village || {}).health || {}; return (h[vid] === undefined) ? 100 : h[vid]; } catch (e) { return 100; }
}

// sendOuting(Game, ctx): one joint-foraging pair for this part.
// Returns the number assigned (0, 1, or 2). Pure policy: reads state,
// calls assignTask (the engine's willingness gate), counts in ctx.
function sendOuting(Game, ctx) {
  try {
    if (!layerOn()) return 0;
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return 0;
    const v = Game.state.village || {};
    const roster = v.roster || [];
    const asg = v.assignments || {};
    // Already out together this part — never double-book the crew.
    if (Object.values(asg).some(a => a && OUTDOOR_TASKS.indexOf(a.task) >= 0)) return 0;
    const alive = roster.filter(id => {
      if (id === Game.villagerId) return false;
      if (asg[id] || v.gardenKeeper === id) return false;
      try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return true; }
    });
    if (alive.length < 5) return 0; // scholar + pair + 3 at Haven: never strip a tiny village
    if (roster.length < 6) return 0;
    const cands = alive.filter(id => hpOf(Game, id) >= 40);
    if (cands.length < 2) return 0;
    cands.sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
    let assigned = 0, refused = 0;
    for (const vid of cands) {
      if (assigned >= 2) break;
      let r = null;
      try { r = Game.assignTask(vid, 'forage', { via: 'in-person' }); } catch (e) { refused++; continue; }
      // assignTask returns null on in-person/haven/task failures and
      // {ok:false,refused:true} on obedience/wound refusals; a
      // successful assignment leaves assignments[vid].task === 'forage'.
      try {
        if ((Game.state.village.assignments || {})[vid] && Game.state.village.assignments[vid].task === 'forage') assigned++;
        else refused++;
      } catch (e) { refused++; }
    }
    ctx.ocUpkeeps = (ctx.ocUpkeeps || 0) + 1;
    ctx.ocAssigned = (ctx.ocAssigned || 0) + assigned;
    ctx.ocRefused = (ctx.ocRefused || 0) + refused;
    if (assigned === 2) ctx.ocPairs = (ctx.ocPairs || 0) + 1;
    else if (assigned === 1) ctx.ocSingles = (ctx.ocSingles || 0) + 1;
    else ctx.ocEmptyParts = (ctx.ocEmptyParts || 0) + 1;
    ctx.ocLastDay = gday(Game);
    return assigned;
  } catch (e) { return 0; }
}

const outdoorcrew = Object.assign({}, tableseatNowait, {
  id: 'outdoorcrew',
  desc: 'tableseat-nowait + joint foraging outings: a forage pair per upkeep part, feeding the existing _outdoorCrew path (default off = tableseat-nowait)',
  upkeep(Game, ctx) {
    const base = tableseatNowait.upkeep ? tableseatNowait.upkeep(Game, ctx) : undefined;
    if (!layerOn()) return base;
    try { sendOuting(Game, ctx); } catch (e) { /* outing failure never breaks the base policy */ }
    return base;
  },
});

module.exports = { outdoorcrew, layerOn, sendOuting, OUTDOOR_TASKS };
