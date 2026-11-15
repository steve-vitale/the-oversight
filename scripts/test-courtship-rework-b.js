// test-courtship-rework-b.js — proof for the courtship-deeds REWORK arm
// sim-courtship-rework-b (run fleshout-loop-b-20261115T1810Z). The 1630Z
// pilot NO-GO'd on the cost bar, and the diagnosis (prereg
// sim-courtship-rework-b-prereg.md) proved two things from the committed
// corpora + live probes: (a) the 5 starvation deaths are trajectory,
// not aid spend (8–43 days after the last aid; the full-spend seeds
// starved 0) — so the aid price is UNCHANGED; (b) the pilgrimage
// stalls because walkTo greedily picks the minimum-distance jump and
// travelTo refuses it on ONE rubble tile at (4,6) — 146 inter-blocked
// + 50 dest-blocked pilgrim-days on seed 100604, scholar never moving
// a tile, a passing detour open every day.
//
// §1 STATIC (fake Game + synthetic series): the reworked walkTo routes
// around a blocked tile, never steps away from the village, stops
// cleanly when genuinely walled in; a stale trip walks home (voiced)
// and a twice-stale village is never re-pilgrimaged; the pilgrimage
// is voiced once per event; the aid is unchanged; the analyzer's
// pilgrim rollup + the tendsPaidKcal fallback.
// §2 GAME (live 200d smoke on pilot seed 100641, courtship leg, via
// the onlylead driver, IN-MEMORY ONLY — no corpus is written, so the
// pilot band is not spent): the 200d instrument captures a full
// per-day series + shape-candidate roll + daily opinion read + daily
// scholar position + pilgrim state with 0 instrument errors, the
// deeds fire, a study completes within 3 days of its pilgrimage
// start (the ARRIVAL proof), max known opinion reaches 10
// in-window, and a determinism leg (same seed+policy twice →
// identical series). Seed 100641 is the first pilot seed — the smoke
// proves the instrument + rework on the judged leg WITHOUT
// prejudging the pilot (no covenant beat is asserted here; the
// pilot's G2 count is untouched). Same precedent as
// test-courtship-b.js (smoke on pilot seed 100601).
// Shared harness only (scripts/sim-harness.js via the driver) — never
// copied eval boilerplate; Math.random seeded BEFORE eval by the
// harness; Game.save never stubbed.
// Usage: node scripts/test-courtship-rework-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyShape, analyzeShapes, analyze } = require(path.join(REPO, 'scripts', 'analyze-onlylead-b'));
const { oneRun, dirStem, LINK_LINES_CAP, LINK_LINE_RE } = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115'));
const { courtshipStep, aidStep, walkTo, pathBlocked, resetCourtshipStats, courtshipStats, AID_KCAL, AID_PANTRY, COV_CAP, PILGRIM_STALE_DAYS, PILGRIM_MAX_STALE_DROPS } = require(path.join(REPO, 'scripts', 'policies', 'competent-courtship-b'));

let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- fake Game for the rework (mirrors the engine verbs + the travel
// refusal rules the policy must cope with) ---
// tiles: "x,y" -> { blockFrom: {dx, dy, type} } — the engine's
// travelBlockage rule (game.js): a blockage guards its SIDE of the
// tile — entry with a component from the blocked side is stopped.
function fakeGame(o) {
  o = o || {};
  const ovs = (o.villages || [
    { id: 'village_1', name: 'Stonebridge', x: 6, y: 4, opinion: 0 },
    { id: 'village_2', name: 'Thornfield', x: 2, y: 4, opinion: 4 },
  ]).map(function (v) { return Object.assign({}, v); });
  const pan = { kcalEach: (o.pantry != null ? o.pantry : 30000), units: 1 };
  const tiles = o.tiles || {};
  const G = {
    state: {
      scholar: { day: (o.day != null ? o.day : 20), health: (o.hp != null ? o.hp : 100), exiled: false },
      otherVillages: ovs,
      village: { pantry: [pan] },
      pendingNational: o.pendingNational || null,
      pendingCounter: null,
    },
    map: { px: 4, py: 4 },
    over: false, tbfight: false,
    calls: { aid: [], study: [], travel: [] },
    said: [],
    links: o.links || [],
    knowsVillage: function () { return true; },
    linkWith: function (vid) {
      const hit = (o.linkedIds || []).indexOf(vid) >= 0;
      return hit ? { id: 'l-' + vid } : null;
    },
    hierarchyState: function () { return G.links.slice(); },
    maxHealth: function () { return 100; },
    say: function (t) { G.said.push(String(t)); },
    tileAt: function (x, y) {
      const t = tiles[x + ',' + y];
      return t ? { type: 'forest_floor', revealed: true, blockFrom: t.blockFrom || null } : { type: 'forest_floor', revealed: true, blockFrom: null };
    },
    // travelBlockage: game.js's rule, verbatim in shape.
    travelBlockage: function (x, y, fx, fy) {
      const dest = G.tileAt(x, y);
      if (!dest) return null;
      const sx = (fx === undefined) ? G.map.px : fx;
      const sy = (fy === undefined) ? G.map.py : fy;
      const dx = Math.sign(x - sx), dy = Math.sign(y - sy);
      const bf = dest.blockFrom;
      if (bf && ((bf.dx !== 0 && bf.dx === -dx) || (bf.dy !== 0 && bf.dy === -dy))) {
        return { kind: 'blockage', blockType: bf.type, x: x, y: y };
      }
      return null;
    },
    aidVillage: function (vid, kcal) {
      G.calls.aid.push({ vid: vid, kcal: kcal });
      const removed = Math.min(kcal, pan.kcalEach);
      pan.kcalEach -= removed;
      if (!removed) return false;
      const v = ovs.find(function (x) { return x.id === vid; });
      if (v) v.opinion = Math.min(100, (v.opinion || 0) + 10);
      return undefined;
    },
    studyVillageCodex: function (vid) {
      G.calls.study.push(vid);
      const v = ovs.find(function (x) { return x.id === vid; });
      if (!v) return 'No codex here.';
      const dist = Math.abs(v.x - G.map.px) + Math.abs(v.y - G.map.py);
      if (dist > 2) return 'You need to be at the village to study their codex.';
      if (!v._codexOpinionGiven) { v._codexOpinionGiven = true; v.opinion = (v.opinion || 0) + 3; }
      return 'You study their codex.';
    },
    travelTargets: function () {
      const out = [];
      for (let x = 0; x <= 8; x++) for (let y = 0; y <= 8; y++) {
        const d = Math.abs(x - G.map.px) + Math.abs(y - G.map.py);
        if (d >= 1 && d <= 3) out.push({ x: x, y: y });
      }
      return out;
    },
    // travelTo: game.js's refusal shape — destination blockage +
    // intermediate blockages on shortest paths refuse WITHOUT moving.
    travelTo: function (x, y) {
      G.calls.travel.push([x, y]);
      if (G.travelBlockage(x, y)) return { kind: 'blockage', blockType: (G.tileAt(x, y).blockFrom || {}).type };
      const px0 = G.map.px, py0 = G.map.py;
      const dTot = Math.abs(x - px0) + Math.abs(y - py0);
      if (dTot > 1) {
        for (let ty = Math.min(py0, y) - 1; ty <= Math.max(py0, y) + 1; ty++) {
          for (let tx = Math.min(px0, x) - 1; tx <= Math.max(px0, x) + 1; tx++) {
            if ((tx === px0 && ty === py0) || (tx === x && ty === y)) continue;
            const dS = Math.abs(tx - px0) + Math.abs(ty - py0);
            const dT = Math.abs(x - tx) + Math.abs(y - ty);
            if (dS === 0 || dS + dT !== dTot) continue;
            for (const oo of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const ex = tx + oo[0], ey = ty + oo[1];
              const dE = Math.abs(ex - px0) + Math.abs(ey - py0);
              if (dE !== dS - 1 || dE + 1 + dT !== dTot) continue;
              const ib = G.travelBlockage(tx, ty, ex, ey);
              if (ib) return ib;
            }
          }
        }
      }
      G.map.px = x; G.map.py = y;
      return undefined;
    },
  };
  return G;
}
function pantryOf(G) {
  return ((G.state.village || {}).pantry || []).reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
}
// The 100604 map, reduced: rubble at (4,6) guarding its south side
// (blocks entry from (4,5)) — the tile that stalled the pilot.
function rubble46() { return { '4,6': { blockFrom: { dx: 0, dy: -1, type: 'rubble' } } }; }

function sectionStaticWalk() {
  console.log('§1a static — reworked walkTo routes around the rubble');
  // (a) The 100604 shape: scholar (4,4), village_2 (5,6), rubble at
  // (4,6). The direct 3-tile jump (4,4)->(5,6) is refused on the
  // (4,6) intermediate, and (4,6) itself is rubble — but the detour
  // (5,5)->(5,6) is open. The old walk never moved; the new walk
  // arrives in ONE walkTo call.
  {
    resetCourtshipStats();
    const G = fakeGame({ tiles: rubble46(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 5, y: 6, opinion: 0 },
    ] });
    walkTo(G, 5, 6);
    check('walkTo routes around rubble@(4,6) and arrives', G.map.px === 5 && G.map.py === 6, G.map);
    check('walkTo took the detour through (5,5)', G.calls.travel.some(function (t) { return t[0] === 5 && t[1] === 5; }), G.calls.travel);
    // ROUND 2 (design change on purpose — prereg
    // sim-courtship-rework2-b-prereg.md G3): BFS plans around the
    // rubble, so the walk takes ZERO refused jumps by design — the
    // old assertion (walkRefusals >= 1) encoded the round-1 walk,
    // which counted travelTo refusals on jumps BFS never attempts.
    // Every travel call the new walk makes must land.
    check('BFS plans around the rubble with zero refused travelTo calls', courtshipStats().walkRefusals === 0 && G.calls.travel.length > 0, { refusals: courtshipStats().walkRefusals, travelCalls: G.calls.travel });
  }
  // (b) The walk never steps AWAY from the village: every hop in
  // (a) keeps distance-to-target at or below the starting 3.
  {
    resetCourtshipStats();
    const G = fakeGame({ tiles: rubble46(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 5, y: 6, opinion: 0 },
    ] });
    let px = 4, py = 4, maxDist = 3, ok = true;
    const orig = G.travelTo.bind(G);
    G.travelTo = function (x, y) {
      const r = orig(x, y);
      const d = Math.abs(x - 5) + Math.abs(y - 6);
      if (G.map.px === x && G.map.py === y && d > maxDist) ok = false;
      if (G.map.px === x && G.map.py === y) maxDist = Math.min(maxDist, d);
      return r;
    };
    walkTo(G, 5, 6);
    check('walkTo never steps away from the village', ok && G.map.px === 5 && G.map.py === 6, { ok: ok, pos: G.map });
  }
  // (c) Genuinely walled in: rubble on every adjacent tile's entry
  // from Haven — the walk moves nowhere and returns (bounded).
  {
    resetCourtshipStats();
    const tiles = {};
    // Block entry to (4,5) from the south, (5,4) from the west,
    // (3,4) from the east, (4,3) from the north — every first step.
    tiles['4,5'] = { blockFrom: { dx: 0, dy: -1, type: 'rubble' } };
    tiles['5,4'] = { blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } };
    tiles['3,4'] = { blockFrom: { dx: 1, dy: 0, type: 'rubble' } };
    tiles['4,3'] = { blockFrom: { dx: 0, dy: 1, type: 'washed_out' } };
    const G = fakeGame({ tiles: tiles, villages: [
      { id: 'village_2', name: 'Thornfield', x: 5, y: 6, opinion: 0 },
    ] });
    walkTo(G, 5, 6);
    check('walkTo stops cleanly when genuinely walled in', G.map.px === 4 && G.map.py === 4, G.map);
    check('walled-in walk counts refusals, does not spin', courtshipStats().walkRefusals > 0 && G.calls.travel.length < 30, { refusals: courtshipStats().walkRefusals, travelCalls: G.calls.travel.length });
  }
  // (d) pathBlocked agrees with travelTo: the direct jump is blocked
  // (intermediate rubble), the detour step is clear.
  {
    const G = fakeGame({ tiles: rubble46(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 5, y: 6, opinion: 0 },
    ] });
    check('pathBlocked vetoes the direct jump (intermediate rubble)', !!pathBlocked(G, 5, 6), null);
    check('pathBlocked vetoes the rubble tile itself', !!pathBlocked(G, 4, 6), null);
    check('pathBlocked clears the detour step (5,5)', !pathBlocked(G, 5, 5), null);
    check('pathBlocked clears a one-step move (4,5)', !pathBlocked(G, 4, 5), null);
  }
  // (e) The old fake (no blockages) still walks in one hop — the
  // rework does not slow the clear-road case.
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_1', name: 'Stonebridge', x: 7, y: 4, opinion: 0 },
    ] });
    walkTo(G, 7, 4);
    check('walkTo still arrives in one hop on a clear road', G.map.px === 7 && G.map.py === 4 && courtshipStats().walkRefusals === 0, { pos: G.map, refusals: courtshipStats().walkRefusals });
  }
}

function sectionStaticPilgrim() {
  console.log('§1b static — stale walks home, twice-stale retires, voice fires once');
  // Full trip around the rubble: start (d20) → walk (d21, arrives) →
  // study (d22) → walk home (d23) → next pilgrimage. The start line
  // fires once, the return line fires once on arrival home.
  {
    resetCourtshipStats();
    const G = fakeGame({ tiles: rubble46(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 5, y: 6, opinion: 0 },
      { id: 'village_1', name: 'Stonebridge', x: 8, y: 4, opinion: 4 },
    ] });
    const ctx = {};
    const r1 = courtshipStep(G, ctx);
    check('pilgrimage starts on the nearest below-bar village', r1 === 'took-day' && ctx._pilgrim && ctx._pilgrim.vid === 'village_2', ctx._pilgrim);
    check('pilgrimage start is voiced once (names the village + codex)', G.said.length === 1 && /Thornfield/.test(G.said[0]) && /codex/.test(G.said[0]), G.said);
    G.state.scholar.day += 1;
    const r2 = courtshipStep(G, ctx);
    check('pilgrimage walks around the rubble to the fire', r2 === 'took-day' && G.map.px === 5 && G.map.py === 6, G.map);
    G.state.scholar.day += 1;
    const r3 = courtshipStep(G, ctx);
    check('pilgrimage studies at the fire', r3 === 'took-day' && G.calls.study.length === 1 && G.calls.study[0] === 'village_2', G.calls.study);
    check('study moves opinion +3', G.state.otherVillages[0].opinion === 3, G.state.otherVillages[0]);
    G.state.scholar.day += 1;
    const r4 = courtshipStep(G, ctx);
    check('pilgrimage walks home after the study', r4 === 'took-day' && G.map.px === 4 && G.map.py === 4 && !ctx._returning, G.map);
    check('return is voiced once on arrival home', G.said.length === 2 && /walk back into Haven/.test(G.said[1]) && /codex/.test(G.said[1]), G.said);
  }
  // Stale: 15 days out, the trip turns home instead of restarting in
  // place — and the stale line fires once.
  {
    resetCourtshipStats();
    const G = fakeGame({ day: 20, tiles: rubble46(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 5, y: 6, opinion: 0 },
    ] });
    // Wall the scholar in so the walk genuinely cannot arrive:
    // travelBlockage refuses every step (a fully walled-in fire).
    G.travelBlockage = function () { return { kind: 'blockage', blockType: 'rubble', x: 0, y: 0 }; };
    const ctx = { _pilgrim: { vid: 'village_2', day: 5 } };
    G.state.scholar.day = 20; // 15 days out — stale
    G.map.px = 7; G.map.py = 4; // away from home, so the turn-home takes days
    const r = courtshipStep(G, ctx);
    check('stale trip turns home instead of restarting in place', r === 'took-day' && !ctx._pilgrim && ctx._returning === true, { pilgrim: ctx._pilgrim, returning: ctx._returning });
    check('stale drop counted + voiced once', courtshipStats().staleDrops === 1 && G.said.length === 1 && /will not open/.test(G.said[0]) && /codex/.test(G.said[0]), { staleDrops: courtshipStats().staleDrops, said: G.said });
    check('stale trip does NOT restart the same day', !ctx._pilgrim, ctx._pilgrim);
  }
  // Twice-stale: the village is never re-pilgrimaged.
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_1', name: 'Stonebridge', x: 7, y: 4, opinion: 0 },
      { id: 'village_2', name: 'Thornfield', x: 1, y: 4, opinion: 0 },
    ] });
    const ctx = { _ctStale: { village_1: 2 } };
    const r = courtshipStep(G, ctx);
    check('twice-stale village never re-pilgrimaged', r === 'took-day' && ctx._pilgrim && ctx._pilgrim.vid === 'village_2', ctx._pilgrim);
  }
  // Once-stale: the village is still tried again (the cap is two).
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_1', name: 'Stonebridge', x: 7, y: 4, opinion: 0 },
    ] });
    const ctx = { _ctStale: { village_1: 1 } };
    const r = courtshipStep(G, ctx);
    check('once-stale village is tried again', r === 'took-day' && ctx._pilgrim && ctx._pilgrim.vid === 'village_1', ctx._pilgrim);
  }
}

function sectionStaticAidUnchanged() {
  console.log('§1c static — the aid is unchanged (the diagnosis says: no price tuning)');
  check('AID_KCAL still 2000', AID_KCAL === 2000, AID_KCAL);
  check('AID_PANTRY still 12000', AID_PANTRY === 12000, AID_PANTRY);
  check('COV_CAP still 3', COV_CAP === 3, COV_CAP);
  check('PILGRIM_STALE_DAYS still 14 (NOT scaled)', PILGRIM_STALE_DAYS === 14, PILGRIM_STALE_DAYS);
  check('PILGRIM_MAX_STALE_DROPS is 2', PILGRIM_MAX_STALE_DROPS === 2, PILGRIM_MAX_STALE_DROPS);
  {
    resetCourtshipStats();
    const G = fakeGame({});
    const ctx = {};
    aidStep(G, ctx);
    check('aid still fires once per village at 2000 kcal', G.calls.aid.length === 1 && G.calls.aid[0].kcal === 2000 && pantryOf(G) === 28000, { aid: G.calls.aid, pantry: pantryOf(G) });
  }
}

// --- synthetic series builder (same shape as test-courtship-b.js) --------
function mkRec(days, verbEvents, opts) {
  opts = opts || {};
  const series = [];
  for (let d = 1; d <= days.length; d++) {
    const o = days[d - 1] || {};
    series.push({
      d: d,
      shapeCands: o.shapeCands || { lead: null, conquest: null, belong: null, covenant: null, trade: null },
      road: o.road || { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
      netDay: (o.netDay != null ? o.netDay : 32),
      rungDay: (o.rungDay != null ? o.rungDay : 62),
      rungMet: d >= (o.rungDay != null ? o.rungDay : 62),
      pendingNational: o.pendingNational || null,
      nationalLive: !!o.nationalLive,
      scaleRefused: false, exiled: false,
      maxOpinion: (o.maxOpinion != null ? o.maxOpinion : 4),
      opinions: {},
      dip: 0,
      linksRoll: [],
      pos: o.pos || { x: 4, y: 4 },
      pilgrim: o.pilgrim || null,
      returning: !!o.returning,
    });
  }
  return { seed: 999997, policy: 'competent-courtship-b', days: days.length, series: series, verbEvents: verbEvents || [], instrumentErrors: [], deaths: [], waveKills: {}, endReason: 'village-lost', won: false, scaleRank: 'regional', gameDays: days.length,
    capSummary: opts.capSummary || {} };
}
function quietDays(n) { const a = []; for (let i = 0; i < n; i++) a.push({}); return a; }

function sectionStaticAnalyzer() {
  console.log('§1d static — analyzer pilgrim rollup + tendsPaidKcal fallback');
  // (a) Pilgrim rollup: 5 days, pilgrim active d2–d4, positions
  // (4,4) → (5,5) → (5,5) → (5,6): the d3 continuation day is a
  // zero-move day; the d2 start day never counts.
  {
    const days = quietDays(5);
    days[1] = { pos: { x: 4, y: 4 }, pilgrim: { vid: 'village_2', day: 2 } };
    days[2] = { pos: { x: 5, y: 5 }, pilgrim: { vid: 'village_2', day: 2 } };
    days[3] = { pos: { x: 5, y: 5 }, pilgrim: { vid: 'village_2', day: 2 } };
    days[4] = { pos: { x: 5, y: 6 }, pilgrim: null };
    const out = analyze([mkRec(days)]);
    const p = out.pilgrim['999997-competent-courtship-b'];
    check('pilgrim rollup counts pilgrim days', p.pilgrimDays === 3, p);
    check('pilgrim rollup counts one zero-move continuation day', p.zeroMoveDays === 1, p);
    check('pilgrim rollup max run is 1', p.maxZeroMoveRun === 1, p);
  }
  // (b) The start day never counts as zero-move, even unmoved.
  {
    const days = quietDays(3);
    days[1] = { pos: { x: 4, y: 4 }, pilgrim: { vid: 'village_2', day: 2 } };
    const out = analyze([mkRec(days)]);
    const p = out.pilgrim['999997-competent-courtship-b'];
    check('pilgrim start day is not a zero-move day', p.pilgrimDays === 1 && p.zeroMoveDays === 0 && p.maxZeroMoveRun === 0, p);
  }
  // (c) A 14-day stall reads as a 13-run (14 continuation days minus
  // the start day) — the shape the old corpus would have shown.
  {
    const days = quietDays(16);
    for (let i = 1; i <= 14; i++) days[i] = { pos: { x: 4, y: 4 }, pilgrim: { vid: 'village_2', day: 2 } };
    const out = analyze([mkRec(days)]);
    const p = out.pilgrim['999997-competent-courtship-b'];
    check('a 14-day stall reads as 13 zero-move continuation days', p.zeroMoveDays === 13 && p.maxZeroMoveRun === 13, p);
  }
  // (d) tendsPaidKcal fallback: the courtship driver's capSummary
  // nests covenant counters under .covenant — the top-level read was
  // 0 while the driver paid 43,500 kcal / 29 tends (courtship-b #7).
  {
    const out = analyze([mkRec(quietDays(10), [], { capSummary: { covenant: { tendsPaidKcal: 6000 } } })]);
    check('tendsPaidKcal falls back to the nested covenant figure', out.perSeed['999997-competent-courtship-b'].tendsPaidKcal === 6000, out.perSeed['999997-competent-courtship-b'].tendsPaidKcal);
  }
  // (e) No regression: a top-level tendsPaidKcal still wins.
  {
    const out = analyze([mkRec(quietDays(10), [], { capSummary: { tendsPaidKcal: 1500, covenant: { tendsPaidKcal: 6000 } } })]);
    check('top-level tendsPaidKcal still wins over the fallback', out.perSeed['999997-competent-courtship-b'].tendsPaidKcal === 1500, out.perSeed['999997-competent-courtship-b'].tendsPaidKcal);
  }
  // (f) The voiced pilgrimage lines pass LINK_LINE_RE (they reach
  // the corpus — the stall was silent before).
  check('LINK_LINE_RE passes the pilgrimage start line', LINK_LINE_RE.test('You set out on the pilgrimage road to Thornfield\'s fire — their codex waits, and the covenant road is walked, not wished.'), null);
  check('LINK_LINE_RE passes the stale turn-home line', LINK_LINE_RE.test('The road to Thornfield\'s fire will not open — fourteen days of refused paths. You turn for home; their codex stays unread.'), null);
  check('LINK_LINE_RE passes the return line', LINK_LINE_RE.test('You walk back into Haven, Thornfield\'s codex still open in your head.'), null);
  // (g) dirStem for the rework run.
  check('dirStem courtship-rework-b', dirStem('courtship-rework-b') === 'perseed-courtship-rework-b', dirStem('courtship-rework-b'));
  check('LINK_LINES_CAP is 900', LINK_LINES_CAP === 900, LINK_LINES_CAP);
}

async function sectionGame() {
  console.log('§2 game — live 200d smoke, seed 100641, reworked courtship leg');
  const armed = await oneRun(100641, 'competent-courtship-b', { days: 200 });
  check('rework 200d smoke ran', armed && armed.series && armed.series.length > 0, armed && armed.series && armed.series.length);
  check('rework 0 instrument errors', (armed.instrumentErrors || []).length === 0, armed.instrumentErrors);
  check('rework shape-candidate roll present every day', armed.series.every(function (sn) { return sn.shapeCands && sn.road && typeof sn.rungDay === 'number'; }), null);
  check('rework daily opinion read present every day', armed.series.every(function (sn) { return typeof sn.maxOpinion === 'number' || sn.maxOpinion === null; }), null);
  check('rework scholar position present every day', armed.series.every(function (sn) { return sn.pos && typeof sn.pos.x === 'number' && typeof sn.pos.y === 'number'; }), null);
  check('rework pilgrim state present every day', armed.series.every(function (sn) { return ('pilgrim' in sn) && ('returning' in sn); }), null);
  const aidCalls = (armed.verbEvents || []).filter(function (ev) { return ev.verb === 'aidVillage' && ev.caller === 'policy'; });
  const studyCalls = (armed.verbEvents || []).filter(function (ev) { return ev.verb === 'studyVillageCodex' && ev.caller === 'policy'; });
  // The aid is a gate-opener, not a quota: on a fast seed the studies
  // + contest wins can open the gate (and form the 3 links) before
  // the aid window opens — so the smoke requires the aid to fire OR
  // the counters to account for every non-pilgrim day (pantry-blocked
  // + cap-blocked + no-candidate + pilgrimage days ≈ run days).
  const cs = armed.capSummary || {};
  const aidAccounted = (cs.aids | 0) + (cs.aidsBlockedPantry | 0) + (cs.aidsBlockedCap | 0) + (cs.aidsNoCandidate | 0) + 2 * (cs.pilgrimages | 0) + (cs.pilgrimDays | 0);
  check('rework aid deed fired, or its window is counters-accounted', aidCalls.length >= 1 || aidAccounted >= armed.days - 2, { aidCalls: aidCalls.length, aidAccounted: aidAccounted, days: armed.days, aids: cs.aids, blockedPantry: cs.aidsBlockedPantry, blockedCap: cs.aidsBlockedCap, noCandidate: cs.aidsNoCandidate, pilgrimages: cs.pilgrimages, pilgrimDays: cs.pilgrimDays });
  check('rework study deed fired (policy-called studyVillageCodex)', studyCalls.length >= 1, { studyCalls: studyCalls.length });
  const first10 = (armed.series || []).find(function (sn) { return sn.maxOpinion !== null && sn.maxOpinion >= 10; });
  check('rework max known opinion reached 10 in-window', !!first10, { first10Day: first10 ? first10.d : null });
  // ARRIVAL PROOF: every study completes within 3 days of its
  // pilgrimage start (the old walk never arrived in 14).
  const evs = ((armed.capSummary || {}).events || []);
  const starts = {};
  let arrivalOk = true, arrivalDetail = [];
  for (const e of evs) {
    if (e.kind === 'pilgrimage-start') starts[e.village] = e.day;
    if (e.kind === 'study' && starts[e.village] !== undefined) {
      const gap = e.day - starts[e.village];
      arrivalDetail.push({ village: e.village, start: starts[e.village], study: e.day, gap: gap });
      if (gap > 3) arrivalOk = false;
      delete starts[e.village];
    }
  }
  check('rework every study arrives within 3 days of its start', studyCalls.length >= 1 && arrivalOk, arrivalDetail);
  check('rework linkLines within the 900 cap', (armed.linkLines || []).length <= 900, { linkLines: (armed.linkLines || []).length });
  check('rework pilgrimage lines reach the corpus', (armed.linkLines || []).some(function (l) { return /pilgrimage|codex/i.test(l.line); }), null);
  const base = await oneRun(100641, 'competent-covenant-b', { days: 200 });
  check('baseline 200d smoke ran', base && base.series && base.series.length > 0, base && base.series && base.series.length);
  check('baseline 0 instrument errors', (base.instrumentErrors || []).length === 0, base.instrumentErrors);
  check('baseline scholar position present every day', base.series.every(function (sn) { return sn.pos && typeof sn.pos.x === 'number'; }), null);
  const again = await oneRun(100641, 'competent-courtship-b', { days: 200 });
  check('determinism: identical series on re-run', JSON.stringify(again.series) === JSON.stringify(armed.series), null);
  check('determinism: identical verb events on re-run', JSON.stringify(again.verbEvents) === JSON.stringify(armed.verbEvents), null);
}

(async function () {
  sectionStaticWalk();
  sectionStaticPilgrim();
  sectionStaticAidUnchanged();
  sectionStaticAnalyzer();
  await sectionGame();
  console.log('test-courtship-rework-b: ' + PASS + ' passed, ' + FAIL + ' failed');
  process.exitCode = FAIL ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
