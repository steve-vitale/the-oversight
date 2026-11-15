// competent-courtship-b — the COURTSHIP-DEEDS lever (arm sim-courtship-b,
// run fleshout-loop-b-20261115T1330Z, axis winnability chain).
//
// REWORK (arm sim-courtship-rework-b, run fleshout-loop-b-20261115T1810Z,
// prereg evidence/2026-11-15/sim-courtship-rework-b-prereg.md).
// Diagnosis of the 1630Z PILOT NO-GO, from the committed corpora +
// live probes (scripts/probe-pilgrim-b.js … probe-pilgrim4-b.js):
//   (a) STARVATION IS TRAJECTORY, NOT SPEND. The 5 starvation deaths
//   sit 8–43 days after the last aid (100604 d12 with 10,100 kcal
//   still in the pantry; 100606 d38/d83, 100607 d84, 100608 d118 —
//   all in endgame pantry-collapse troughs 30+ days post-aid), and
//   the three seeds that paid the full 6,000 kcal starved 0. The aid
//   price is UNCHANGED (2,000 kcal, pantry gate 12,000). The stall
//   fix below IS the cost fix: it removes up to 156 days of scholar
//   absence — the trajectory distortion that moved the legs apart.
//   (b) THE STALL IS ONE RUBBLE TILE + A GREEDY WALK. On seed
//   100604 the scholar NEVER MOVED on 196 pilgrim-days: walkTo
//   picked the minimum-distance offered target (a 2–3 tile jump
//   straight at the village) and travelTo refused it because the
//   intermediate tile (4,6) carries rubble — 146 days inter-blocked,
//   50 days dest-blocked, ALL rubble@(4,6), tbfight false every day,
//   a passing detour ((5,4) → (5,5) → (5,6)) open every day. The
//   villages are 3 tiles away, not far; distance was never the cause,
//   so the stale window is NOT scaled (14 days is ~7× the honest
//   walk). Splinter villages sit at (parent.x+1, parent.y) — on the
//   9x9 board too (villageAgency.js _vaMakeSplinterVillage).
// THE REWORK (policy-side, zero src/js):
//   1. walkTo tries EVERY offered target nearest-first with a
//      pure-read blockage pre-check (destination + intermediates,
//      the same scan travelTo runs) and takes the first step that
//      moves the scholar — never stepping AWAY from the village, so
//      it cannot oscillate. A refused jump routes around the rubble
//      instead of stranding the scholar.
//   2. A stale drop walks the scholar HOME (ctx._returning) instead
//      of restarting in place, and a village that goes stale TWICE
//      is never re-pilgrimaged (the aid can still court it).
//   3. The pilgrimage is VOICED — played lines for start / stale
//      turn-home / return (the study already voices itself through
//      the engine's keeper line). No more silent months on the road.
//
// REWORK ROUND 2 (arm sim-courtship-rework2-b, run
// fleshout-loop-b-20261115T1930Z, prereg
// evidence/2026-11-15/sim-courtship-rework2-b-prereg.md).
// Diagnosis of the 1810Z PILOT NO-GO, from the committed corpus +
// live map probe (/tmp/probe-646-map.js): the stall narrowed to ONE
// seed (100646, 54 zero-move days) — a creek + rubble pocket, not a
// rubble tile. village_2 (1,4) and village_3 (1,2) ARE reachable
// (BFS (4,4)->(4,3)->(3,3)->(2,3)->(1,3)->(1,4)), but the first
// step moves AWAY (Manhattan 3->4) and the round-1 never-steps-away
// guard vetoed exactly that step. THE FIX: BFS pathfinding in the
// policy (bfsNextStep, travelBlockage as oracle, orthogonal-only
// over the 9x9 home board) — chosen over a bounded step-away
// allowance because BFS is complete (any walk that exists is
// found), cannot oscillate (every step strictly decreases
// BFS-distance), and is canon's "go around" way (docs/MAP.md).
// The greedy nearest-first step survives as the fallback for a
// missing path / off-board destination. ALSO (round-1 sense-testing
// polish): the return line now distinguishes a completed study
// ("codex now read") from a stale turn-home ("codex stays unread").
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it composes onto the FROZEN covenant-road policy
// (scripts/policies/competent-covenant-b.js, unmodified) and adds ONLY
// the deeds that open the opinion gate the last two runs proved is
// missing (onlylead-b Stage 2 SUBSTRATE-MISSING; onlylead2-b PILOT
// NO-GO 1/8 — opinion-never-10 on 5/8, 454 prerequisite refusals, 0
// declines: the villages are never asked, they just never know Haven
// well enough).
//
// THE DEEDS (frozen in the sim-courtship-b prereg — do not tune),
// two deeds, each ONCE per village — a relationship built by a visit
// and a gift, not a farmed number:
//   1. PILGRIMAGE (visit + study). Once per known, unlinked,
//      unstudied village with opinion < 10, while fewer than 3
//      covenant links stand: walk to their fire,
//      studyVillageCodex(vid) (+3 opinion, once per village — the
//      engine's own once-flag _codexOpinionGiven), walk home.
//      Pattern reused from the scalecourt pilgrimage
//      (scripts/policies/scalecourt.js): hop-by-hop walkTo via
//      travelTargets, ctx._pilgrim state, 14-day staleness, HP > 0.7
//      gate to start, _returning walk home to (4,4). The pilgrimage
//      TAKES OVER the day while in progress — competent.daily and
//      covenantClimb are skipped that day: a visit costs days of
//      your life, honestly.
//   2. FIRST GIFT (aid). Once per known, unlinked village with
//      opinion < 10, while fewer than 3 covenant links stand:
//      aidVillage(vid, 2000) (+10 opinion; 2,000 kcal is the game's
//      own first-gesture gift size). Pantry gate: Haven pantry >
//      12,000 kcal — the propose gate itself, the engine's own
//      affordability line for courtship. One gift per day max.
//      Maximum lever spend: 3 villages x 2,000 kcal = 6,000 kcal
//      per run, all of it real food out of Haven's pantry.
//
// WHAT IT DOES NOT DO:
//   - No proposeAlliance (+5, but requires opinion >= 10 already —
//     it cannot open the gate it presupposes). No guestMeal (needs
//     an alliance first — post-gate). No succession backing /
//     beg-giving (opportunistic arrivals, not summonable deeds;
//     the competent base does not answer them and neither does this
//     arm — both legs leave them exactly as the base leaves them).
//     No joinVillageReal (defection, not courtship — never called).
//   - No tend-gate change (tend stays at the inherited 20,000-kcal
//     gate — onlylead2 finding #3 is the NEXT arm's question). No
//     engine-courtship surfacing (finding #2 — also the next arm).
//   - No proposeLink / proposeTrade / raidVillage / seat-taking.
//   - The only new RNG draws in the courtship leg are the engine's
//     own (travel encounters on pilgrimage walks, judgePeer inside
//     proposeCovenant — the inherited road). Candidate ranking is
//     deterministic (score desc, village id asc; pilgrimage nearest
//     first); no Math.random in this file.
//
// COUNTERS: per-run ctx counters (ctx._ct*) plus module-level stats
// (resetCourtshipStats / courtshipStats) so the driver can capture
// per-seed numbers without reaching into harness ctx. The covenant
// stats module is re-exported so the driver reads the road counters
// through the same counters as the onlylead2 legs.
'use strict';
const { competent } = require('./competent');
const { covenantPolicy, covenantStats, resetCovenantStats, detJudgePeer } = require('./competent-covenant-b');

const AID_KCAL = 2000;
const AID_PANTRY = 12000;
const COV_CAP = 3;
const PILGRIM_STALE_DAYS = 14;
const PILGRIM_MAX_STALE_DROPS = 2;
const PILGRIM_MIN_HP = 0.7;
const HAVEN_X = 4, HAVEN_Y = 4;

const STATS = { aids: 0, aidsPaidKcal: 0, aidsBlockedPantry: 0,
  aidsBlockedPending: 0, aidsBlockedCap: 0, aidsNoCandidate: 0,
  studies: 0, pilgrimages: 0, pilgrimDays: 0,
  walkRefusals: 0, staleDrops: 0,
  nationalPendingDays: 0, errors: 0, events: [] };
function resetCourtshipStats() {
  STATS.aids = 0; STATS.aidsPaidKcal = 0; STATS.aidsBlockedPantry = 0;
  STATS.aidsBlockedPending = 0; STATS.aidsBlockedCap = 0; STATS.aidsNoCandidate = 0;
  STATS.studies = 0; STATS.pilgrimages = 0; STATS.pilgrimDays = 0;
  STATS.walkRefusals = 0; STATS.staleDrops = 0;
  STATS.nationalPendingDays = 0; STATS.errors = 0;
  STATS.events = [];
}
function courtshipStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function villageName(Game, vid) {
  try {
    var v = ((Game.state || {}).otherVillages || []).find(function (x) { return x && x.id === vid; });
    return (v && v.name) || vid;
  } catch (e) { return vid; }
}
function sayLine(Game, text) {
  try { if (Game.say) Game.say(text); } catch (e) { STATS.errors += 1; }
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function activeLinks(Game) {
  try {
    var links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    return links.filter(function (l) { return l && l.status === 'active'; });
  } catch (e) { return []; }
}
function covLinkCount(Game) {
  try { return activeLinks(Game).filter(function (l) { return l.kind === 'covenant'; }).length; } catch (e) { return 0; }
}
function isKnown(Game, v) {
  try { return (typeof Game.knowsVillage === 'function') ? !!Game.knowsVillage(v) : false; } catch (e) { return false; }
}
function isLinked(Game, vid) {
  try { return (typeof Game.linkWith === 'function') ? !!Game.linkWith(vid) : false; } catch (e) { return false; }
}
function event(day, kind, village, outcome, extra) {
  var e = { day: day, kind: kind, village: village || null, outcome: outcome || null };
  if (extra) { for (var k in extra) { if (k !== 'day' && k !== 'kind' && k !== 'village' && k !== 'outcome') e[k] = extra[k]; } }
  STATS.events.push(e);
  if (STATS.events.length > 400) STATS.events.splice(0, STATS.events.length - 400);
}

// pathBlocked (REWORK): the pure-read half of Game.travelTo's
// refusal logic — destination blockage + the intermediate-tile scan
// on every shortest path (game.js travelTo, same bounding box,
// same entry-side rule). Returns the blocking {kind, blockType,
// x, y} or null. PURE reads only (travelBlockage / tileAt): calling
// travelTo speculatively would SAY the blockage line on every
// refusal, flooding the log. Off-board intermediates that are not
// yet generated are treated as open — every village target (and
// Haven) sits on the 9x9 board, so the scan never needs to
// generate ground; travelTo still makes the final call.
function pathBlocked(Game, x, y) {
  try {
    var px0 = Game.map.px, py0 = Game.map.py;
    var dest = null;
    try { dest = Game.travelBlockage ? Game.travelBlockage(x, y) : null; } catch (e) {}
    if (dest) return dest;
    var dTot = Math.abs(x - px0) + Math.abs(y - py0);
    if (dTot > 1) {
      var bx0 = Math.min(px0, x) - 1, bx1 = Math.max(px0, x) + 1;
      var by0 = Math.min(py0, y) - 1, by1 = Math.max(py0, y) + 1;
      for (var ty = by0; ty <= by1; ty++) for (var tx = bx0; tx <= bx1; tx++) {
        if ((tx === px0 && ty === py0) || (tx === x && ty === y)) continue;
        var dS = Math.abs(tx - px0) + Math.abs(ty - py0);
        var dT = Math.abs(x - tx) + Math.abs(y - ty);
        if (dS === 0 || dS + dT !== dTot) continue; // not on a shortest path
        for (var oi = 0; oi < 4; oi++) {
          var o = [[1, 0], [-1, 0], [0, 1], [0, -1]][oi];
          var ex = tx + o[0], ey = ty + o[1];
          if (ex < bx0 || ex > bx1 || ey < by0 || ey > by1) continue;
          var dE = Math.abs(ex - px0) + Math.abs(ey - py0);
          if (dE !== dS - 1 || dE + 1 + dT !== dTot) continue; // entry not on a shortest path
          // Ungenerated off-board intermediates read as open (see above).
          var t = null;
          try { t = Game.tileAt ? Game.tileAt(tx, ty) : null; } catch (e) {}
          if (!t && (tx < 0 || tx > 8 || ty < 0 || ty > 8)) continue;
          var ib = null;
          try { ib = Game.travelBlockage ? Game.travelBlockage(tx, ty, ex, ey) : null; } catch (e) {}
          if (ib) return ib;
        }
      }
    }
    return null;
  } catch (e) { return null; }
}

// walkTo (REWORKED ROUND 2 — BFS pathfinding, arm
// sim-courtship-rework2-b, prereg
// evidence/2026-11-15/sim-courtship-rework2-b-prereg.md): the
// round-1 walk could not take a detour whose first step moves AWAY
// from the destination — on seed 100646 the creek at (3,4) + rubble
// at (3,5)/(2,6) force the first step (4,4)->(4,3), Manhattan
// distance 3->4, and the never-steps-away guard vetoed exactly that
// step, stranding the scholar 54 zero-move days. The new walk
// plans a real path: bfsNextStep runs an orthogonal BFS over the
// 9x9 home board with Game.travelBlockage as the passability
// oracle for each single step (the same rule travelTo applies to
// a d==1 hop, entry side included), and walkTo takes the first
// step of the shortest path. Every BFS step strictly decreases
// BFS-distance to the target, so the walk cannot oscillate — the
// property the never-steps-away guard protected, now exact rather
// than greedy. A bounded step-away allowance was rejected: it can
// still stall in a pocket deeper than the allowance and can
// oscillate at the allowance boundary. Canon (docs/MAP.md):
// blockages offer "cut, clear, bridge, swim, or go around" —
// BFS is the "go around" way. When BFS finds no path (genuinely
// walled in) or the destination is off-board, one greedy
// nearest-first step is tried (the round-1 body, kept as
// greedyStep) so an off-board destination still walks closer.
// The walk stops when no step moves, or a fight goes live.
function bfsNextStep(Game, hx, hy) {
  try {
    var sx = Game.map.px, sy = Game.map.py;
    if (sx === hx && sy === hy) return null;
    // BFS is a home-board walk: villages and Haven sit on the
    // 9x9 (round-1 diagnosis). An off-board destination falls
    // back to the greedy step below.
    if (hx < 0 || hx > 8 || hy < 0 || hy > 8) return null;
    if (sx < 0 || sx > 8 || sy < 0 || sy > 8) return null;
    var key = function (x, y) { return x + ',' + y; };
    var prev = {};
    var seen = {};
    seen[key(sx, sy)] = true;
    var q = [{ x: sx, y: sy }];
    var found = false;
    while (q.length && !found) {
      var cur = q.shift();
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < 4; i++) {
        var nx = cur.x + dirs[i][0], ny = cur.y + dirs[i][1];
        if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
        var k = key(nx, ny);
        if (seen[k]) continue;
        // Passability = the engine's own entry oracle from the
        // step's origin. PURE read (travelBlockage / tileAt):
        // planning never narrates and never moves.
        var blocked = null;
        try { blocked = Game.travelBlockage ? Game.travelBlockage(nx, ny, cur.x, cur.y) : null; } catch (e) {}
        if (blocked) continue;
        seen[k] = true;
        prev[k] = cur;
        if (nx === hx && ny === hy) { found = true; break; }
        q.push({ x: nx, y: ny });
      }
    }
    if (!found) return null;
    // Walk the predecessor chain back from the destination to
    // the first step (guarded: a broken chain returns null
    // instead of spinning).
    var step = { x: hx, y: hy };
    var guard = 0;
    while (guard++ < 100) {
      var p = prev[key(step.x, step.y)];
      if (!p) return null;
      if (p.x === sx && p.y === sy) return step;
      step = p;
    }
    return null;
  } catch (e) { return null; }
}

// greedyStep (ROUND 1 body, kept as the fallback): one
// nearest-first hop toward (hx,hy), pre-checked with
// pathBlocked, never stepping away from the destination.
// Returns true when the scholar moved. Used only when BFS
// finds no path or the destination is off-board.
function greedyStep(Game, hx, hy) {
  try {
    if (Game.inCombat && Game.inCombat()) return false;
    var targets = [];
    try { targets = (Game.travelTargets && Game.travelTargets()) || []; } catch (e) {}
    var dNow = Math.abs(hx - Game.map.px) + Math.abs(hy - Game.map.py);
    targets.sort(function (a, b) {
      var da = Math.abs(a.x - hx) + Math.abs(a.y - hy);
      var db = Math.abs(b.x - hx) + Math.abs(b.y - hy);
      if (da !== db) return da - db;
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });
    for (var ti = 0; ti < targets.length; ti++) {
      var tt = targets[ti];
      // Never step away from the destination (no oscillation), and
      // never re-try a step the pre-check already vetoes.
      if (Math.abs(tt.x - hx) + Math.abs(tt.y - hy) > dNow) continue;
      if (pathBlocked(Game, tt.x, tt.y)) { STATS.walkRefusals += 1; continue; }
      var px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(tt.x, tt.y); } catch (e) { STATS.walkRefusals += 1; continue; }
      if (Game.map.px !== px0 || Game.map.py !== py0) return true;
      STATS.walkRefusals += 1;
      if (Game.inCombat && Game.inCombat()) return false;
    }
    return false;
  } catch (e) { return false; }
}

function walkTo(Game, hx, hy) {
  try {
    var guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 && !Game.over && !Game.tbfight) {
      if (Game.inCombat && Game.inCombat()) break; // mid-fight: the barrier is the way out
      var step = bfsNextStep(Game, hx, hy);
      var moved = false;
      if (step) {
        var px0 = Game.map.px, py0 = Game.map.py;
        try { Game.travelTo(step.x, step.y); } catch (e) { STATS.walkRefusals += 1; break; }
        if (Game.map.px !== px0 || Game.map.py !== py0) { moved = true; }
        else {
          // BFS said the step was open but travelTo refused it:
          // count it and stop — do not spin on a step the engine
          // will not take.
          STATS.walkRefusals += 1;
          if (Game.inCombat && Game.inCombat()) break;
          break;
        }
      } else {
        moved = greedyStep(Game, hx, hy);
      }
      if (!moved) break; // genuinely stuck: no step moves
    }
  } catch (e) {}
}

// courtshipStep: the pilgrimage state machine. Returns 'took-day'
// when the day is spent visiting (the caller skips competent.daily +
// covenantClimb that day), else null. Runs BEFORE the inherited
// covenant daily, so a visit costs the day honestly.
function courtshipStep(Game, ctx) {
  try {
    if (Game.over) return null;
    var day = dayOf(Game);
    var st = Game.state || {};
    if (st.pendingNational) STATS.nationalPendingDays += 1;

    // Continue an in-progress pilgrimage first — the trip is the day.
    if (ctx._pilgrim) {
      var pg = ctx._pilgrim;
      var tv = null;
      try { tv = ((st.otherVillages || []).find(function (v) { return v && v.id === pg.vid; })) || null; } catch (e) {}
      var px = (Game.map || {}).px, py = (Game.map || {}).py;
      if (!tv || isLinked(Game, pg.vid) || Game.over || Game.tbfight) {
        ctx._pilgrim = null; // done, linked, or interrupted — drop it
      } else if (day - pg.day > PILGRIM_STALE_DAYS) {
        // REWORK: a stale trip WALKS HOME instead of restarting in
        // place (the old code dropped the trip and the start logic in
        // the same call re-picked the same village — the 15-day loop).
        // The stall is voiced, not silent, and a village that goes
        // stale twice is never re-pilgrimaged — the road to it does
        // not open on foot, and the scholar stops wasting seasons
        // on it (the aid gift can still court it).
        var staleN = ((ctx._ctStale && ctx._ctStale[pg.vid]) || 0) + 1;
        try { ctx._ctStale = ctx._ctStale || {}; ctx._ctStale[pg.vid] = staleN; } catch (e) {}
        STATS.staleDrops += 1;
        event(day, 'pilgrimage-stale', pg.vid, 'turn-home', { staleCount: staleN });
        sayLine(Game, 'The road to ' + villageName(Game, pg.vid) + '\'s fire will not open — fourteen days of refused paths. You turn for home; their codex stays unread.');
        ctx._pilgrim = null;
        ctx._returning = true;
        ctx._returningFrom = pg.vid;
        ctx._returningStudied = false;
      } else {
        STATS.pilgrimDays += 1;
        var dist = Math.abs((tv.x || HAVEN_X) - px) + Math.abs((tv.y || HAVEN_Y) - py);
        if (dist <= 2) {
          var opBefore = (tv.opinion | 0);
          try { if (Game.studyVillageCodex) Game.studyVillageCodex(pg.vid); } catch (e) { STATS.errors += 1; }
          STATS.studies += 1;
          // Mark the attempt in ctx as well as the engine's once-flag:
          // a village with NO codex never sets _codexOpinionGiven, and
          // without this the policy would pilgrimage to it forever.
          try { ctx._ctStudied = ctx._ctStudied || {}; ctx._ctStudied[pg.vid] = day; } catch (e) {}
          event(day, 'study', pg.vid, 'codex', { opinionBefore: opBefore, opinionAfter: (tv.opinion | 0) });
          ctx._pilgrim = null;
          ctx._returning = true;
          ctx._returningFrom = pg.vid;
          // ROUND 2: the return line distinguishes a completed study
          // from a stale turn-home (round-1 sense-testing: the old
          // line said "codex still open in your head" even when the
          // study had just been completed and the codex was read).
          ctx._returningStudied = true;
          return 'took-day';
        }
        walkTo(Game, tv.x || HAVEN_X, tv.y || HAVEN_Y);
        return 'took-day';
      }
    }
    // Walk home after a study (or a stale turn-home).
    if (ctx._returning) {
      walkTo(Game, HAVEN_X, HAVEN_Y);
      if (Game.map.px === HAVEN_X && Game.map.py === HAVEN_Y) {
        ctx._returning = false;
        if (ctx._returningFrom) {
          // ROUND 2: a completed study reads differently from a
          // turn-home — the codex is read now, not "still open in
          // your head"; a stale turn-home leaves it unread.
          if (ctx._returningStudied) {
            sayLine(Game, 'You walk back into Haven, ' + villageName(Game, ctx._returningFrom) + '\'s codex now read — the road was worth walking.');
          } else {
            sayLine(Game, 'You walk back into Haven, ' + villageName(Game, ctx._returningFrom) + '\'s fire behind you — their codex stays unread.');
          }
          ctx._returningFrom = null;
          ctx._returningStudied = false;
        }
      }
      return 'took-day';
    }
    // Start a pilgrimage: nearest below-bar, unstudied candidate we
    // still want — while fewer than 3 covenant links stand.
    if (covLinkCount(Game) < COV_CAP) {
      var s = Game.state.scholar || {};
      var hpNow = (s.health != null ? s.health : (s.hp != null ? s.hp : 100));
      var hpMax = 100;
      try { hpMax = Game.maxHealth ? Game.maxHealth() : 100; } catch (e) {}
      var hpPct = hpNow / Math.max(1, hpMax);
      if (!s.exiled && hpPct > PILGRIM_MIN_HP) {
        var needy = [];
        try {
          var ovs = (st.otherVillages || []);
          for (var i = 0; i < ovs.length; i++) {
            var v = ovs[i];
            if (!v || !v.id || v.id === 'haven') continue;
            if (!isKnown(Game, v)) continue;
            if (isLinked(Game, v.id)) continue;
            if ((v.opinion || 0) >= 10) continue;
            if (v._codexOpinionGiven) continue;
            if (ctx._ctStudied && ctx._ctStudied[v.id]) continue;
            // REWORK: a village that went stale twice is unreachable
            // on foot — never re-pilgrimage it (the aid can still
            // court it). Without this the stall restarts forever.
            if (ctx._ctStale && (ctx._ctStale[v.id] || 0) >= PILGRIM_MAX_STALE_DROPS) continue;
            needy.push(v);
          }
        } catch (e) { STATS.errors += 1; }
        needy.sort(function (a, b) {
          var da = Math.abs((a.x || HAVEN_X) - HAVEN_X) + Math.abs((a.y || HAVEN_Y) - HAVEN_Y);
          var db = Math.abs((b.x || HAVEN_X) - HAVEN_X) + Math.abs((b.y || HAVEN_Y) - HAVEN_Y);
          if (da !== db) return da - db;
          return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var nt = needy[0] || null;
        if (nt) {
          ctx._pilgrim = { vid: nt.id, day: day };
          STATS.pilgrimages += 1;
          event(day, 'pilgrimage-start', nt.id, 'walk', { opinion: (nt.opinion | 0) });
          sayLine(Game, 'You set out on the pilgrimage road to ' + (nt.name || nt.id) + '\'s fire — their codex waits, and the covenant road is walked, not wished.');
          return 'took-day';
        }
      }
    }
    return null;
  } catch (e) { STATS.errors += 1; return null; }
}

// aidStep: the first gift — once per village, pantry-gated, one per
// day max. Runs AFTER the inherited covenant daily, so the propose
// sees the built opinion the next morning.
function aidStep(Game, ctx) {
  try {
    if (Game.over) return;
    var day = dayOf(Game);
    var st = Game.state || {};
    if (st.pendingNational) { STATS.aidsBlockedPending += 1; return; }
    if (covLinkCount(Game) >= COV_CAP) { STATS.aidsBlockedCap += 1; return; }
    if (pantryKcal(Game) <= AID_PANTRY) { STATS.aidsBlockedPantry += 1; return; }
    var aided = (ctx && ctx._ctAided) || {};
    var best = null, bestScore = null, bestOv = null;
    try {
      var ovs = (st.otherVillages || []);
      for (var i = 0; i < ovs.length; i++) {
        var v = ovs[i];
        if (!v || !v.id || v.id === 'haven') continue;
        if (!isKnown(Game, v)) continue;
        if (isLinked(Game, v.id)) continue;
        if ((v.opinion || 0) >= 10) continue;
        if (aided[v.id]) continue;
        var d = detJudgePeer(Game, v);
        if (d === null || d === undefined) continue;
        if (bestScore == null || d > bestScore || (d === bestScore && v.id < best)) {
          best = v.id; bestScore = d; bestOv = v;
        }
      }
    } catch (e) { STATS.errors += 1; }
    if (!best) { STATS.aidsNoCandidate += 1; return; }
    var panBefore = pantryKcal(Game);
    var opBefore = (bestOv.opinion | 0);
    try { if (typeof Game.aidVillage === 'function') Game.aidVillage(best, AID_KCAL); } catch (e) { STATS.errors += 1; return; }
    var paid = panBefore - pantryKcal(Game);
    if (paid > 0) {
      STATS.aids += 1; STATS.aidsPaidKcal += paid;
      if (ctx) { ctx._ctAided = ctx._ctAided || {}; ctx._ctAided[best] = day; }
      event(day, 'aid', best, 'first-gift', { paid: paid, detPeer: bestScore, opinionBefore: opBefore, opinionAfter: (bestOv.opinion | 0) });
    } else {
      STATS.errors += 1;
      event(day, 'aid', best, 'unpaid', { detPeer: bestScore, opinionBefore: opBefore });
    }
  } catch (e) { STATS.errors += 1; }
}

const courtshipPolicy = Object.assign({}, covenantPolicy, {
  id: 'competent-courtship-b',
  desc: 'competent + COVENANT-road scale climb + COURTSHIP DEEDS: one codex pilgrimage per known unlinked below-bar village (+3 opinion, once) and one 2,000-kcal aid gift per known unlinked below-bar village (+10 opinion, once, pantry > 12,000) — the opinion-building lever for the covenant road; no lead proposes, no trade, no raids — policy-side probe only',
  daily(Game, ctx) {
    var took = null;
    try { took = courtshipStep(Game, ctx); } catch (e) {}
    if (took === 'took-day') return;
    try { covenantPolicy.daily(Game, ctx); } catch (e) {}
    try { aidStep(Game, ctx); } catch (e) {}
  },
});

module.exports = { courtshipPolicy: courtshipPolicy,
  resetCourtshipStats: resetCourtshipStats, courtshipStats: courtshipStats,
  resetCovenantStats: resetCovenantStats, covenantStats: covenantStats,
  courtshipStep: courtshipStep, aidStep: aidStep, walkTo: walkTo,
  bfsNextStep: bfsNextStep, greedyStep: greedyStep,
  pathBlocked: pathBlocked,
  AID_KCAL: AID_KCAL, AID_PANTRY: AID_PANTRY, COV_CAP: COV_CAP,
  PILGRIM_STALE_DAYS: PILGRIM_STALE_DAYS,
  PILGRIM_MAX_STALE_DROPS: PILGRIM_MAX_STALE_DROPS, PILGRIM_MIN_HP: PILGRIM_MIN_HP };
