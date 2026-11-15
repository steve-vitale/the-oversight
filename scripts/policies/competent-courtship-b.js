// competent-courtship-b — the COURTSHIP-DEEDS lever (arm sim-courtship-b,
// run fleshout-loop-b-20261115T1330Z, axis winnability chain).
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
const PILGRIM_MIN_HP = 0.7;
const HAVEN_X = 4, HAVEN_Y = 4;

const STATS = { aids: 0, aidsPaidKcal: 0, aidsBlockedPantry: 0,
  aidsBlockedPending: 0, aidsBlockedCap: 0, aidsNoCandidate: 0,
  studies: 0, pilgrimages: 0, pilgrimDays: 0,
  nationalPendingDays: 0, errors: 0, events: [] };
function resetCourtshipStats() {
  STATS.aids = 0; STATS.aidsPaidKcal = 0; STATS.aidsBlockedPantry = 0;
  STATS.aidsBlockedPending = 0; STATS.aidsBlockedCap = 0; STATS.aidsNoCandidate = 0;
  STATS.studies = 0; STATS.pilgrimages = 0; STATS.pilgrimDays = 0;
  STATS.nationalPendingDays = 0; STATS.errors = 0;
  STATS.events = [];
}
function courtshipStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
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

// walkTo (scalecourt.js, verbatim): hop-by-hop honest walk toward
// (hx,hy) — one travelTo per hop, no force, bounded.
function walkTo(Game, hx, hy) {
  try {
    var guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 && !Game.over && !Game.tbfight) {
      var best = null, bd = 1e9;
      var targets = [];
      try { targets = (Game.travelTargets && Game.travelTargets()) || []; } catch (e) {}
      for (var ti = 0; ti < targets.length; ti++) {
        var tt = targets[ti];
        var d = Math.abs(tt.x - hx) + Math.abs(tt.y - hy);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      var px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) break; // refused: stay put, safely
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
      if (!tv || isLinked(Game, pg.vid) || day - pg.day > PILGRIM_STALE_DAYS || Game.over || Game.tbfight) {
        ctx._pilgrim = null; // done, linked, stale, or interrupted — drop it
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
          return 'took-day';
        }
        walkTo(Game, tv.x || HAVEN_X, tv.y || HAVEN_Y);
        return 'took-day';
      }
    }
    // Walk home after a study.
    if (ctx._returning) {
      walkTo(Game, HAVEN_X, HAVEN_Y);
      if (Game.map.px === HAVEN_X && Game.map.py === HAVEN_Y) ctx._returning = false;
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
  AID_KCAL: AID_KCAL, AID_PANTRY: AID_PANTRY, COV_CAP: COV_CAP,
  PILGRIM_STALE_DAYS: PILGRIM_STALE_DAYS, PILGRIM_MIN_HP: PILGRIM_MIN_HP };
