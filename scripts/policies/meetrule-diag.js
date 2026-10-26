// meetrule-diag — "go to the known monster" condition census for
// sim-meetrule-a (2026-10-26, flesh-out loop, axis scale-onramp,
// DIAG ONLY).
//
// QUESTION: w4opp-a found 22/24 never-fought wave-4 spawns never share
// a tile with an eligible villager, though monsters spawn close
// (mean 2.0 Manhattan tiles from Haven) and persist weeks (mean
// 25.3 days). This recorder does NOT re-derive the opportunity
// partition (w4opp-diag does that, reused verbatim). It measures the
// OTHER side of a hypothetical monster-directed trip: per day, how
// many villagers could even depart, how far can each one range, what
// objectives do they hold, how big is the outdoor crew and the
// player's traveling party — the numbers the condition list in the
// prereg (G1..G6) is judged against.
//
// MECHANISM, READ FROM CODE (never invented):
//   - Meeting set (villagerMonsterTick, game.js): roster minus player,
//     living, not sheltered, not post-flee-resting. Monsters on the
//     player tile offer NO villager meeting. This census uses exactly
//     that set (same filter as the corrected w4opp snapshot).
//   - Range (villager-agency.js npcMaxDist): explorer 6, wanderer 3,
//     forager 1, homebody 0. objDist is Chebyshev (villager-
//     objectives.js). HAUL precedent (villager-mapmem.js
//     mapmemHaulSites): a targeted trip is offered only when
//     dist <= maxD.
//   - Departure gates (objMaybeDepart, villager-objectives.js): at
//     Haven, not engaged, not sick, heal gate, danger verdict, night
//     ban. The census measures the sick-excluded eligible pool;
//     engaged/away/night are named residuals, not measured per
//     villager per day-part (this census is daily, not per-part).
//   - Party, field route (resolveWildMonsterEncounter, game.js):
//     allies come from _outdoorCrew (resolveAssignments snapshot of
//     patrol/scout/hunt/forage assignees); the fight record caps
//     allyVids at 2. Party, player route (party.js travelingWith):
//     partyMembers + followers, cap 3 (day 7) / 4 (day 14) / 5 (day 30).
//   - Travel (objAwayStep): at most one node per day-part; pursue
//     steps move both axes; 35% meander; tightness cap. The
//     analysis uses d parts as the optimistic lower bound, never a
//     fitted travel time.
//   - Meeting gates (villagerMonsterTick / worldTick / checkEncounter,
//     game.js): worldTick runs ONLY on player tile entry; a
//     co-located tick fights with P=0.5 (one occupant picked at
//     random); table sanctity and the player-tile skip apply.
//
// OBSERVATIONAL ONLY. MEETRULE=1 is the only on-switch. Unset
// delegates byte-identically: no census rows, no ctx surface. The
// daily hook records AFTER delegating, writes nothing to game state
// (objective kinds are read from objState() directly, never via
// objOf which would create entries; nodePos is read directly, never
// via npcNode), draws no RNG, never throws into the engine
// (recording errors are counted). One exception, disclosed: npcMaxDist
// is the engine's own memoizing read (npcRangeProfile caches the
// profile it computes); the G2 leg-exact identity check in the sweep
// is the proof that calling it moves nothing. It never calls
// villageStandingTotal() or unlockedWave() mid-run.
'use strict';

const MAX_CENSUS = 20000;

function layerOn() { try { return process.env.MEETRULE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return { census: [], errs: 0, errors: [], overflow: { census: 0 }, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, item) {
  if (store.census.length >= MAX_CENSUS) { store.overflow.census++; return false; }
  store.census.push(item);
  return true;
}

// census(Game, store): one row per policy day, post-day board.
function census(Game, store) {
  try {
    const v = (Game.state || {}).village || {};
    const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
    const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    const roster = (v.roster || []).slice();
    const nodePos = (v.nodePos || {});
    const away = (v.away || {});
    const sick = (v.sick || {});
    const playerId = Game.villagerId;
    let objs = {};
    try { objs = (typeof Game.objState === 'function') ? (Game.objState() || {}) : {}; } catch (e) { noteErr(store, 'census.objState', e); }
    let crewN = 0;
    try { crewN = ((Game._outdoorCrew || []).length) | 0; } catch (e) {}
    let travelingN = 0;
    try { travelingN = (typeof Game.travelingWith === 'function') ? (Game.travelingWith().length | 0) : 0; } catch (e) { noteErr(store, 'census.traveling', e); }
    let tableActive = false;
    try { tableActive = !!(typeof Game.tableActive === 'function' && Game.tableActive()); } catch (e) {}

    const nodes = {};
    const maxDDist = {};
    const objKinds = {};
    let rosterN = 0, livingN = 0, eligibleN = 0, eligibleNotSickN = 0;
    let shelteredN = 0, postFleeN = 0, sickN = 0, deadN = 0, awayN = 0, atHavenEligibleN = 0;
    let companionN = 0;
    for (const rid of roster) {
      rosterN++;
      let dead = false;
      try {
        if (typeof Game.vpOf === 'function') { const vp = Game.vpOf(rid); if (vp && vp.dead) dead = true; }
        else if (typeof Game.getPerson === 'function') { const p = Game.getPerson(rid); if (p && p.dead) dead = true; }
      } catch (e) { /* keep on read error */ }
      if (dead) { deadN++; continue; }
      livingN++;
      const isSick = !!sick[rid];
      if (isSick) sickN++;
      if (away[rid]) awayN++;
      if (rid === playerId) continue; // player is never in the meeting set
      let sheltered = false, postFlee = false;
      try { sheltered = !!(typeof Game.isSheltered === 'function' && Game.isSheltered(rid)); } catch (e) {}
      try { postFlee = !!(typeof Game.isPostFleeResting === 'function' && Game.isPostFleeResting(rid)); } catch (e) {}
      if (sheltered) shelteredN++;
      if (postFlee) postFleeN++;
      if (sheltered || postFlee) continue; // not meeting-eligible
      eligibleN++;
      if (!isSick) eligibleNotSickN++;
      const n = nodePos[rid];
      const nx = (n ? n.nx : hx), ny = (n ? n.ny : hy);
      if (nx === hx && ny === hy) atHavenEligibleN++;
      let maxD = null;
      try { maxD = (typeof Game.npcMaxDist === 'function') ? (Game.npcMaxDist(rid) | 0) : null; } catch (e) { noteErr(store, 'census.maxD', e); }
      if (maxD != null) maxDDist[String(maxD)] = (maxDDist[String(maxD)] || 0) + 1;
      const o = objs[rid] || null;
      const kind = (o && o.kind) ? String(o.kind) : 'idle';
      objKinds[kind] = (objKinds[kind] || 0) + 1;
      if (o && o.companion) companionN++;
      nodes[rid] = [nx, ny, maxD, isSick ? 1 : 0, away[rid] ? 1 : 0];
    }
    pushCapped(store, {
      day: dayOf(Game),
      haven: [hx, hy],
      playerTile: [px, py],
      rosterN: rosterN, livingN: livingN,
      eligibleN: eligibleN, eligibleNotSickN: eligibleNotSickN,
      shelteredN: shelteredN, postFleeN: postFleeN, sickN: sickN,
      deadN: deadN, awayN: awayN, atHavenEligibleN: atHavenEligibleN,
      maxDDist: maxDDist, objKinds: objKinds, companionN: companionN,
      outdoorCrewN: crewN, travelingN: travelingN, tableActive: tableActive,
      nodes: nodes,
    });
  } catch (e) { noteErr(store, 'census', e); }
}

function withMeetruleDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { census(Game, st); } catch (e) { noteErr(st, 'daily.census', e); }
        try { ctx._meetrule = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, withMeetruleDiag, census, MAX_CENSUS };
