// test-courtship-rework2-b.js — proof for the courtship-deeds REWORK
// ROUND 2 arm sim-courtship-rework2-b (run
// fleshout-loop-b-20261115T1930Z). The 1810Z re-pilot NO-GO'd on the
// stall bar alone: 54 zero-move continuation pilgrim-days band-wide,
// ALL on seed 100646. The mechanism was proven by live map probe
// (/tmp/probe-646-map.js): village_2 (1,4) and village_3 (1,2) ARE
// reachable (BFS (4,4)->(4,3)->(3,3)->(2,3)->(1,3)->(1,4)), but the
// first step moves AWAY (Manhattan 3->4) because the direct west
// step (3,4) is a creek and the south-west approach is rubble-walled
// — and the round-1 never-steps-away guard vetoed exactly that step.
// The fix (prereg sim-courtship-rework2-b-prereg.md): BFS
// pathfinding in the policy (bfsNextStep, travelBlockage as oracle,
// orthogonal-only over the 9x9 home board), chosen over a bounded
// step-away allowance because BFS is complete, cannot oscillate
// (every step strictly decreases BFS-distance), and is canon's "go
// around" way (docs/MAP.md). The greedy nearest-first step survives
// as the fallback for a missing path / off-board destination. ALSO:
// the return line now distinguishes a completed study ("codex now
// read") from a stale turn-home ("codex stays unread") — round-1
// sense-testing polish.
//
// §1 STATIC (fake Game + synthetic series): BFS takes the
// step-away detour on the exact 100646 creek/rubble shape (both
// the village_2 and the village_3 pockets), never revisits a tile,
// takes zero refused travelTo calls; the greedy fallback alone
// cannot move on that shape (the regression: the old walk's
// failure, reproduced); walled-in returns null and stops cleanly;
// off-board destinations walk one greedy step closer and stop;
// the pilgrimage end-to-end on the 100646 shape studies both
// pocket villages within 3 days of each start and voices the
// study return line ("codex now read").
// §2 GAME (live 200d smoke on pilot seed 100761, courtship leg, via
// the onlylead driver, IN-MEMORY ONLY — no corpus is written, so the
// pilot band is not spent): the 200d instrument captures a full
// per-day series + shape-candidate roll + daily opinion read + daily
// scholar position + pilgrim state with 0 instrument errors, the
// deeds fire, a study completes within 3 days of its pilgrimage
// start (the ARRIVAL proof), max known opinion reaches 10
// in-window, and a determinism leg (same seed+policy twice →
// identical series). Seed 100761 is the first pilot seed — the smoke
// proves the instrument + BFS walk on the judged leg WITHOUT
// prejudging the pilot (no covenant beat is asserted here; the
// pilot's G2 count is untouched). Same precedent as
// test-courtship-rework-b.js (smoke on pilot seed 100641).
// §3 LIVE REGRESSION (in-memory only, seed 100646 — the stalled
// seed from the SPENT 100641–100648 band; NO corpus written, so no
// band is spent): the full 200d courtship leg on 100646 must show
// zero-move continuation pilgrim-days ≤ 8 (the G2 stall bar) AND ≥
// 1 study completing on village_2 or village_3 (the villages that
// stalled) AND the scholar standing on (1,4) or (1,2). If §3 fails,
// the pilot is NOT spent — the BFS fix does not do what the prereg
// claims on the one seed where the defect was proven.
// Shared harness only (scripts/sim-harness.js via the driver) — never
// copied eval boilerplate; Math.random seeded BEFORE eval by the
// harness; Game.save never stubbed.
// Usage: node scripts/test-courtship-rework2-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { analyze } = require(path.join(REPO, 'scripts', 'analyze-onlylead-b'));
const { oneRun, dirStem, LINK_LINES_CAP, LINK_LINE_RE } = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115'));
const { courtshipStep, walkTo, bfsNextStep, greedyStep, pathBlocked, resetCourtshipStats, courtshipStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-courtship-b'));

let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- fake Game for round 2 (mirrors the engine verbs + the travel
// refusal rules the policy must cope with; extends the round-1 fake
// with creek tiles and a movable scholar start) ---
// tiles: "x,y" -> { blockFrom: {dx, dy, type}, type: 'creek',
//   needsBridge: true } — the engine's travelBlockage rule
// (game.js): a blockage guards its SIDE of the tile, and a creek
// needs a bridge or a swimmer (the fake scholar never swims).
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
    map: { px: (o.px != null ? o.px : 4), py: (o.py != null ? o.py : 4) },
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
    hasAbility: function () { return false; },
    say: function (t) { G.said.push(String(t)); },
    tileAt: function (x, y) {
      const t = tiles[x + ',' + y];
      if (!t) return { type: 'forest_floor', revealed: true, blockFrom: null };
      return { type: t.type || 'forest_floor', revealed: true, blockFrom: t.blockFrom || null, needsBridge: !!t.needsBridge, bridged: !!t.bridged };
    },
    // travelBlockage: game.js's rule, verbatim in shape (blockFrom
    // side-guard + unbridged creek, no swimmer on the fake scholar).
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
      if (dest.type === 'creek' && dest.needsBridge && !dest.bridged) {
        return { kind: 'blockage', blockType: 'creek', x: x, y: y };
      }
      return null;
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
      if (G.travelBlockage(x, y)) return { kind: 'blockage', blockType: (G.tileAt(x, y).blockFrom || {}).type || 'creek' };
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

// The 100646 map, reduced: creek at (3,4) (the direct west step),
// rubble at (3,5)/(2,6) walling the south-west approach — the pocket
// that stalled the 1810Z pilot. The BFS detour
// (4,4)->(4,3)->(3,3)->(2,3)->(1,3)->(1,4) stays open.
function pocket646() {
  return {
    '3,4': { type: 'creek', needsBridge: true },
    '3,5': { blockFrom: { dx: 1, dy: 0, type: 'rubble' } },
    '2,6': { blockFrom: { dx: 0, dy: -1, type: 'rubble' } },
  };
}
// The village_3 pocket from the same seed: from (4,2) the steps
// (4,1)/(4,3) both move away, (3,2) is a creek, (5,2) is rubble.
function pocket646v3() {
  const t = pocket646();
  t['3,2'] = { type: 'creek', needsBridge: true };
  t['5,2'] = { blockFrom: { dx: -1, dy: 0, type: 'rubble' } };
  return t;
}

function sectionStaticBFS() {
  console.log('§1a static — BFS takes the step-away detour on the 100646 shape');
  // (a) The village_2 pocket: scholar (4,4), village_2 (1,4),
  // creek (3,4), rubble (3,5)/(2,6). The first BFS step is (4,3)
  // — AWAY in Manhattan (distance 3->4) — and the walk arrives.
  {
    resetCourtshipStats();
    const G = fakeGame({ tiles: pocket646(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 1, y: 4, opinion: 0 },
    ] });
    const first = bfsNextStep(G, 1, 4);
    check('bfsNextStep takes the step away: (4,4)->(4,3) toward (1,4)', !!first && first.x === 4 && first.y === 3, first);
    check('the step away increases Manhattan distance (the exact defect)', !!first && (Math.abs(first.x - 1) + Math.abs(first.y - 4)) === 4, first);
    const before = G.calls.travel.length;
    walkTo(G, 1, 4);
    check('walkTo arrives at (1,4) through the creek/rubble pocket', G.map.px === 1 && G.map.py === 4, G.map);
    check('walkTo took the BFS detour through (3,3) and (1,3)', G.calls.travel.some(function (t) { return t[0] === 3 && t[1] === 3; }) && G.calls.travel.some(function (t) { return t[0] === 1 && t[1] === 3; }), G.calls.travel);
    check('walkTo never revisits a tile (no oscillation)', (function () { const seen = {}; for (const t of G.calls.travel) { const k = t[0] + ',' + t[1]; if (seen[k]) return false; seen[k] = true; } return true; })(), G.calls.travel);
    check('BFS walk takes zero refused travelTo calls', courtshipStats().walkRefusals === 0 && G.calls.travel.length > before, { refusals: courtshipStats().walkRefusals, travelCalls: G.calls.travel });
    check('BFS never steps on the creek (3,4)', !G.calls.travel.some(function (t) { return t[0] === 3 && t[1] === 4; }), G.calls.travel);
  }
  // (b) THE REGRESSION: the greedy fallback alone cannot move on
  // this shape — every offered step is blocked or steps away.
  // (This is the round-1 walk's failure, reproduced in isolation.)
  {
    resetCourtshipStats();
    const G = fakeGame({ tiles: pocket646(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 1, y: 4, opinion: 0 },
    ] });
    const moved = greedyStep(G, 1, 4);
    check('greedyStep alone cannot move on the 100646 pocket', moved === false && G.map.px === 4 && G.map.py === 4, { moved: moved, pos: G.map });
  }
  // (c) The village_3 pocket: scholar (4,2), village_3 (1,2),
  // creek (3,2), rubble (5,2). Same shape, second stall from the
  // 1810Z evidence (sat d48–d60, then d68–d80+).
  {
    resetCourtshipStats();
    const G = fakeGame({ px: 4, py: 2, tiles: pocket646v3(), villages: [
      { id: 'village_3', name: 'Ashford', x: 1, y: 2, opinion: 0 },
    ] });
    const first = bfsNextStep(G, 1, 2);
    check('bfsNextStep takes a step away toward (1,2) too', !!first && (Math.abs(first.x - 1) + Math.abs(first.y - 2)) === 4, first);
    walkTo(G, 1, 2);
    check('walkTo arrives at (1,2) through the second pocket', G.map.px === 1 && G.map.py === 2, G.map);
    check('village_3 walk never revisits a tile', (function () { const seen = {}; for (const t of G.calls.travel) { const k = t[0] + ',' + t[1]; if (seen[k]) return false; seen[k] = true; } return true; })(), G.calls.travel);
    const G2 = fakeGame({ px: 4, py: 2, tiles: pocket646v3(), villages: [
      { id: 'village_3', name: 'Ashford', x: 1, y: 2, opinion: 0 },
    ] });
    check('greedyStep alone cannot move on the village_3 pocket either', greedyStep(G2, 1, 2) === false && G2.map.px === 4 && G2.map.py === 2, { pos: G2.map });
  }
  // (d) Genuinely walled in: BFS returns null, the greedy fallback
  // finds nothing, the walk moves nowhere and returns (bounded).
  {
    resetCourtshipStats();
    const tiles = {};
    tiles['4,5'] = { blockFrom: { dx: 0, dy: -1, type: 'rubble' } };
    tiles['5,4'] = { blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } };
    tiles['3,4'] = { blockFrom: { dx: 1, dy: 0, type: 'rubble' } };
    tiles['4,3'] = { blockFrom: { dx: 0, dy: 1, type: 'washed_out' } };
    const G = fakeGame({ tiles: tiles, villages: [
      { id: 'village_2', name: 'Thornfield', x: 5, y: 6, opinion: 0 },
    ] });
    check('bfsNextStep returns null when genuinely walled in', bfsNextStep(G, 5, 6) === null, null);
    walkTo(G, 5, 6);
    check('walled-in walk moves nowhere', G.map.px === 4 && G.map.py === 4, G.map);
    check('walled-in walk counts refusals, does not spin', courtshipStats().walkRefusals > 0 && G.calls.travel.length < 30, { refusals: courtshipStats().walkRefusals, travelCalls: G.calls.travel.length });
  }
  // (e) Off-board destination: BFS returns null, the greedy fallback
  // walks one step closer (to the board edge) and stops.
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_9', name: 'Farfield', x: 9, y: 4, opinion: 0 },
    ] });
    check('bfsNextStep returns null for an off-board destination', bfsNextStep(G, 9, 4) === null, null);
    walkTo(G, 9, 4);
    check('off-board fallback walks to the board edge and stops', G.map.px === 8 && G.map.py === 4 && G.calls.travel.length === 2, { pos: G.map, travelCalls: G.calls.travel });
  }
  // (f) Clear road: BFS steps straight at the target, no refusals.
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_1', name: 'Stonebridge', x: 7, y: 4, opinion: 0 },
    ] });
    const first = bfsNextStep(G, 7, 4);
    check('bfsNextStep steps straight at a clear-road target', !!first && first.x === 5 && first.y === 4, first);
    walkTo(G, 7, 4);
    check('walkTo arrives on a clear road with zero refusals', G.map.px === 7 && G.map.py === 4 && courtshipStats().walkRefusals === 0, { pos: G.map, refusals: courtshipStats().walkRefusals });
  }
  // (g) pathBlocked still agrees with travelTo (round-1 contract).
  {
    const G = fakeGame({ tiles: pocket646(), villages: [
      { id: 'village_2', name: 'Thornfield', x: 1, y: 4, opinion: 0 },
    ] });
    check('pathBlocked vetoes the creek tile itself', !!pathBlocked(G, 3, 4), null);
    // The diagonal jump (4,4)->(3,3) IS refused: one of its shortest
    // paths crosses the creek at (3,4) (the engine's intermediate
    // rule — travelTo refuses it too). BFS single-steps around it
    // instead, which is why the walk takes (4,3) first.
    check('pathBlocked vetoes the diagonal jump across the creek (3,3)', !!pathBlocked(G, 3, 3), null);
    check('pathBlocked clears a detour step (5,5)', !pathBlocked(G, 5, 5), null);
    check('pathBlocked clears a one-step move (4,3)', !pathBlocked(G, 4, 3), null);
  }
  // (h) The new return lines pass LINK_LINE_RE (they reach the corpus).
  check('LINK_LINE_RE passes the studied return line', LINK_LINE_RE.test('You walk back into Haven, Thornfield\'s codex now read — the road was worth walking.'), null);
  check('LINK_LINE_RE passes the stale return line', LINK_LINE_RE.test('You walk back into Haven, Thornfield\'s fire behind you — their codex stays unread.'), null);
  // (i) dirStem for the round-2 run.
  check('dirStem courtship-rework2-b', dirStem('courtship-rework2-b') === 'perseed-courtship-rework2-b', dirStem('courtship-rework2-b'));
  check('LINK_LINES_CAP is 900', LINK_LINES_CAP === 900, LINK_LINES_CAP);
}

function sectionStaticPilgrim646() {
  console.log('§1b static — pilgrimage end-to-end on the 100646 shape');
  // Full trips on the pocket map: start (d20) → walk (d21, arrives
  // (1,4)) → study (d22) → walk home (d23) → next pilgrimage to
  // village_3 → walk (d25) → study (d26). No stale line ever fires;
  // the return line after each study says "codex now read".
  resetCourtshipStats();
  const G = fakeGame({ tiles: pocket646v3(), villages: [
    { id: 'village_2', name: 'Thornfield', x: 1, y: 4, opinion: 0 },
    { id: 'village_3', name: 'Ashford', x: 1, y: 2, opinion: 0 },
  ] });
  const ctx = {};
  const r1 = courtshipStep(G, ctx);
  check('pilgrimage starts on the nearest pocket village (village_2)', r1 === 'took-day' && ctx._pilgrim && ctx._pilgrim.vid === 'village_2', ctx._pilgrim);
  G.state.scholar.day += 1;
  const r2 = courtshipStep(G, ctx);
  check('pilgrimage walks the detour to village_2 in one day', r2 === 'took-day' && G.map.px === 1 && G.map.py === 4, G.map);
  G.state.scholar.day += 1;
  const r3 = courtshipStep(G, ctx);
  check('pilgrimage studies village_2 within 3 days of its start', r3 === 'took-day' && G.calls.study.length === 1 && G.calls.study[0] === 'village_2', G.calls.study);
  G.state.scholar.day += 1;
  const r4 = courtshipStep(G, ctx);
  check('pilgrimage walks home after the study', r4 === 'took-day' && G.map.px === 4 && G.map.py === 4 && !ctx._returning, G.map);
  check('study return line says the codex is now read', G.said.length === 2 && /codex now read/.test(G.said[1]), G.said);
  check('no stale line fires on a completed trip', !G.said.some(function (s) { return /will not open/.test(s); }), G.said);
  G.state.scholar.day += 1;
  const r5 = courtshipStep(G, ctx);
  check('next pilgrimage picks village_3 (village_2 is studied)', r5 === 'took-day' && ctx._pilgrim && ctx._pilgrim.vid === 'village_3', ctx._pilgrim);
  G.state.scholar.day += 1;
  const r6 = courtshipStep(G, ctx);
  check('pilgrimage walks the second detour to village_3', r6 === 'took-day' && G.map.px === 1 && G.map.py === 2, G.map);
  G.state.scholar.day += 1;
  const r7 = courtshipStep(G, ctx);
  check('pilgrimage studies village_3 within 3 days of its start', r7 === 'took-day' && G.calls.study.length === 2 && G.calls.study[1] === 'village_3', G.calls.study);
  check('both pocket villages studied, zero stale drops', courtshipStats().studies === 2 && courtshipStats().staleDrops === 0, courtshipStats());
}

async function sectionGame() {
  console.log('§2 game — live 200d smoke, seed 100761, BFS courtship leg');
  const armed = await oneRun(100761, 'competent-courtship-b', { days: 200 });
  check('rework2 200d smoke ran', armed && armed.series && armed.series.length > 0, armed && armed.series && armed.series.length);
  check('rework2 0 instrument errors', (armed.instrumentErrors || []).length === 0, armed.instrumentErrors);
  check('rework2 shape-candidate roll present every day', armed.series.every(function (sn) { return sn.shapeCands && sn.road && typeof sn.rungDay === 'number'; }), null);
  check('rework2 daily opinion read present every day', armed.series.every(function (sn) { return typeof sn.maxOpinion === 'number' || sn.maxOpinion === null; }), null);
  check('rework2 scholar position present every day', armed.series.every(function (sn) { return sn.pos && typeof sn.pos.x === 'number' && typeof sn.pos.y === 'number'; }), null);
  check('rework2 pilgrim state present every day', armed.series.every(function (sn) { return ('pilgrim' in sn) && ('returning' in sn); }), null);
  const aidCalls = (armed.verbEvents || []).filter(function (ev) { return ev.verb === 'aidVillage' && ev.caller === 'policy'; });
  const studyCalls = (armed.verbEvents || []).filter(function (ev) { return ev.verb === 'studyVillageCodex' && ev.caller === 'policy'; });
  const cs = armed.capSummary || {};
  const aidAccounted = (cs.aids | 0) + (cs.aidsBlockedPantry | 0) + (cs.aidsBlockedCap | 0) + (cs.aidsNoCandidate | 0) + 2 * (cs.pilgrimages | 0) + (cs.pilgrimDays | 0);
  check('rework2 aid deed fired, or its window is counters-accounted', aidCalls.length >= 1 || aidAccounted >= armed.days - 2, { aidCalls: aidCalls.length, aidAccounted: aidAccounted, days: armed.days, aids: cs.aids, blockedPantry: cs.aidsBlockedPantry, blockedCap: cs.aidsBlockedCap, noCandidate: cs.aidsNoCandidate, pilgrimages: cs.pilgrimages, pilgrimDays: cs.pilgrimDays });
  check('rework2 study deed fired (policy-called studyVillageCodex)', studyCalls.length >= 1, { studyCalls: studyCalls.length });
  const first10 = (armed.series || []).find(function (sn) { return sn.maxOpinion !== null && sn.maxOpinion >= 10; });
  check('rework2 max known opinion reached 10 in-window', !!first10, { first10Day: first10 ? first10.d : null });
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
  check('rework2 every study arrives within 3 days of its start', studyCalls.length >= 1 && arrivalOk, arrivalDetail);
  check('rework2 linkLines within the 900 cap', (armed.linkLines || []).length <= 900, { linkLines: (armed.linkLines || []).length });
  check('rework2 pilgrimage lines reach the corpus', (armed.linkLines || []).some(function (l) { return /pilgrimage|codex/i.test(l.line); }), null);
  const base = await oneRun(100761, 'competent-covenant-b', { days: 200 });
  check('baseline 200d smoke ran', base && base.series && base.series.length > 0, base && base.series && base.series.length);
  check('baseline 0 instrument errors', (base.instrumentErrors || []).length === 0, base.instrumentErrors);
  check('baseline scholar position present every day', base.series.every(function (sn) { return sn.pos && typeof sn.pos.x === 'number'; }), null);
  const again = await oneRun(100761, 'competent-courtship-b', { days: 200 });
  check('determinism: identical series on re-run', JSON.stringify(again.series) === JSON.stringify(armed.series), null);
  check('determinism: identical verb events on re-run', JSON.stringify(again.verbEvents) === JSON.stringify(armed.verbEvents), null);
}

async function sectionRegression646() {
  console.log('§3 live regression — 200d on seed 100646 (the stalled seed), in-memory only');
  const rec = await oneRun(100646, 'competent-courtship-b', { days: 200 });
  check('regression 200d run completed', rec && rec.series && rec.series.length > 0, rec && rec.series && rec.series.length);
  check('regression 0 instrument errors', (rec.instrumentErrors || []).length === 0, rec.instrumentErrors);
  const out = analyze([rec]);
  const p = out.pilgrim['100646-competent-courtship-b'];
  check('regression zero-move continuation pilgrim-days ≤ 8 (G2 stall bar)', !!p && p.zeroMoveDays <= 8, p);
  const evs = ((rec.capSummary || {}).events || []);
  const pocketStudies = evs.filter(function (e) { return e.kind === 'study' && (e.village === 'village_2' || e.village === 'village_3'); });
  check('regression a study completes on village_2 or village_3', pocketStudies.length >= 1, pocketStudies);
  const reached = (rec.series || []).some(function (sn) { return sn.pos && ((sn.pos.x === 1 && sn.pos.y === 4) || (sn.pos.x === 1 && sn.pos.y === 2)); });
  check('regression scholar stands on (1,4) or (1,2)', reached, null);
  console.log('  regression pilgrim rollup: ' + JSON.stringify(p) + ' staleDrops=' + ((rec.capSummary || {}).staleDrops | 0) + ' studies=' + ((rec.capSummary || {}).studies | 0));
}

(async function () {
  sectionStaticBFS();
  sectionStaticPilgrim646();
  await sectionGame();
  await sectionRegression646();
  console.log('test-courtship-rework2-b: ' + PASS + ' passed, ' + FAIL + ' failed');
  process.exitCode = FAIL ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
