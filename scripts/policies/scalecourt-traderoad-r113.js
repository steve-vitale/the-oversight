// scalecourt-traderoad-r113 — journey-scale r113 POLICY ARM (2026-11-09,
// lane A). POLICY-SIDE ONLY. ZERO src/js changes. Clone of
// scalecourt-nogate-morntrace3.js (frozen; untouched) with EXACTLY TWO
// decision deltas, both pre-registered in
// evidence/2026-11-09/journey-scale-r113-prereg.md (Q1, the trade road):
//
// DELTA 1 — PEER-PROPOSE ORDER: trade first, covenant second, while the
// trade window is open (to day 120); covenant first once it closes (the
// fallback). The base proposes covenant until covN==3 and only then trade;
// r112 showed covN never reached 3 on any seed, so trade was NEVER proposed
// (trade=0/0 everywhere) and the charter could never seal. A competent
// player who wants the charter courts the trade league first.
// DELTA 2 — NATIONAL-BEAT ANSWERS: trade → sign (unchanged); covenant →
// 'walk' while the trade window is open (the designed "walking picks the
// road" mechanic — defers that shape 14 days), 'pact' once it closes;
// lead → feast; belong → swear (never walk belong — it breaks the link
// and refuses the scale); conquest → mercy (unchanged). Lead cannot be
// walked from, so the sub-cap guard in the linkraise clone (raises left
// unanswered while subs >= 1 and the window is open) is what keeps the
// village budget for trade. The window (to day 120) is the decision
// rule — the count rule cannot see villages still arriving (pilot
// addendum 2).
//
// Trade viability (live read, daily): sealed already → road done
// (normal answers resume); else viable iff the count rule holds
// (live trade links + unlinked known villages +1 for a pending
// counter ≥ 3). The count is the instrument's read of formable routes
// right now; the WINDOW decides (see tradeWindowOpen).
// The pure helpers (tradeViable / tradeSealed / subCount / tradeBeatPick)
// are exported for the proof test.
// Base lineage (unchanged code below, except the two deltas marked
// TRADE-ROAD r113): scalecourt-nogate-morntrace3.js (r99 instrument
// clone of scalecourt-nogate-morntrace2.js) ← scalecourt-nogate.js
// (r32: the >12,000 kcal pantry gate on the courtship block DROPPED;
// tribute/trade-call/demand/counter pay-gates UNCHANGED).
'use strict';
const { competent } = require('./competent');

// --- TRADE-ROAD r113 helpers (pure reads; exported for the proof test) ---
// tradeSealed: the charter is already sealed (an active trade link with
// chartered=true) — the road is done, normal answers resume.
// subCount: active Haven-primary subordinate links (the lead-road count;
// lead needs 3 to qualify).
// tradeViable: the trade road is still winnable — a trade link exists,
// or an unlinked known village stands at/above the opinion-10 bar to
// propose to, or a peer proposal is in negotiation (pendingCounter).
// PILOT ADDENDUM 1 (r113, after the 97901 pilot, before the band): the
// as-written rule was blind to the CLIMB. Courtship starts day 25 and
// no village is at opinion 10 before the climb, so viability read false
// through the whole early raise window (d24–d41) and the sub-cap guard
// never engaged — subs reached 4 while the policy still meant to hold
// them at 2. The road needs 3 trade links TOTAL, and any known village
// can be climbed to the opinion bar (the r112 runs formed covenant
// links the same way), so viability is now the COUNT rule: live trade
// links + unlinked known villages (+1 for a pending counter) >= 3.
// With fewer than 3 formable routes the road is genuinely dead.
// Fail-closed (false): on a read error the policy falls back to the
// base answers rather than walking away from a live court forever.
// PILOT ADDENDUM 2 (after the pilot RE-RUN, before the band): the
// count rule still failed — at the 3rd raise (d38) only 4 villages
// were KNOWN and 2 were already subs, so the count read 2 < 3 and the
// guard lifted; the 5th village (the trade partner) only became known
// ~d46. A snapshot rule cannot see villages still arriving. The
// DECISIONS therefore use the WINDOW rule below (tradeWindowOpen),
// not this count: the player gives the trade road a real window
// (to day 120, past the charter's earliest seal ~d95) and holds the
// village budget for it, because raises are re-raiseable after their
// 14-day cooldown — holding them costs time, not the road. This
// count rule stays as the instrument's live read of "formable routes
// right now", not as a decision input.
function tradeSealed(Game) {
  try {
    const links = (typeof Game.hierarchyState === 'function' ? Game.hierarchyState() : []) || [];
    return links.some(l => l && l.status === 'active' && l.kind === 'trade' && l.chartered === true);
  } catch (e) { return false; }
}
function subCount(Game) {
  try {
    const links = (typeof Game.hierarchyState === 'function' ? Game.hierarchyState() : []) || [];
    return links.filter(l => l && l.status === 'active' && l.primary === 'haven').length;
  } catch (e) { return 0; }
}
function tradeViable(Game) {
  try {
    if (tradeSealed(Game)) return false;
    const links = (typeof Game.hierarchyState === 'function' ? Game.hierarchyState() : []) || [];
    const active = links.filter(l => l && l.status === 'active');
    const trN = active.filter(l => l.kind === 'trade').length;
    if (trN >= 3) return true;
    if (Game.state && Game.state.pendingCounter) return true;
    const cands = ((Game.state || {}).otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
    // PILOT ADDENDUM: the count rule — live trade links + climbable
    // (unlinked known) villages must reach 3, the road's bar. A single
    // at-the-bar candidate no longer decides it: before the climb no
    // village is at opinion 10, and the road is still winnable.
    return (trN + cands.length) >= 3;
  } catch (e) { return false; }
}
// tradePool: the climbable pool — unlinked known villages, any opinion.
// The instrument snapshots it so the analyzer can see the road's raw
// material even before any village reaches the opinion bar.
function tradePool(Game) {
  try {
    const cands = ((Game.state || {}).otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
    return cands.length;
  } catch (e) { return 0; }
}
// TRADE_WINDOW_END: the trade road's window. The charter's earliest
// seal is ~d95 on the pilot's pace (first trade link d47 + 30d season,
// x3 links); the window runs to d120 to give slow climbs slack, then
// the policy falls back to the base's covenant-first courtship, pact
// answers, and unguarded raises. Past d120 a held trade road is a
// stalled village, not a patient one.
// tradeWindowOpen(Game, day): the trade road is still being pursued —
// the charter is unsealed AND the window is open. This is the
// DECISION rule for the sub-cap guard, the beat walk, and the
// courtship order (pilot addendum 2 — the count rule cannot see
// villages still arriving, so the window, not the count, decides).
const TRADE_WINDOW_END = 120;
function tradeWindowOpen(Game, day) {
  try {
    if (tradeSealed(Game)) return false;
    const d = (day != null ? day : (function () { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } })());
    return d < TRADE_WINDOW_END;
  } catch (e) { return false; }
}
// tradeBeatPick(shape, windowOpen): the national-beat answer for the
// trade-road policy. Trade signs; covenant walks while the window is
// open (defer 14d — walking picks the road) and pacts once it closes;
// lead feasts, belong swears, conquest shows mercy —
// unchanged from the base, because none of those shapes can be
// walked from (belong's walk breaks the link and refuses the scale).
function tradeBeatPick(shape, windowOpen) {
  if (shape === 'trade') return 'sign';
  if (shape === 'covenant') return windowOpen ? 'walk' : 'pact';
  if (shape === 'lead') return 'feast';
  if (shape === 'belong') return 'swear';
  if (shape === 'conquest') return 'mercy';
  return 'feast';
}

// hop-by-hop honest walk toward (hx,hy): one travelTo per hop, no force,
// bounded. travelTargets only reaches d<=3, so a single travelTo can't
// cross the map — walk it like a player would. (pattern from competent.js)
function walkTo(Game, hx, hy) {
  try {
    let guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 && !Game.over && !Game.tbfight) {
      let best = null, bd = 1e9;
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - hx) + Math.abs(tt.y - hy);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      const px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) break; // refused: stay put, safely
    }
  } catch (e) {}
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function popAlive(Game) {
  try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return 0; }
}

function courtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
    // answer pending offers/beats — a competent player answers, never leaves mail unread
    if (st.pendingCounter && Game.answerCounter) {
      const rich = pantryKcal(Game) > 25000;
      try { Game.answerCounter(rich ? 'sweeten' : 'accept'); } catch (e) {}
      ctx.courtCounters = (ctx.courtCounters || 0) + 1;
    }
    if (st.pendingAccord && Game.answerAccord) {
      try { Game.answerAccord('gift'); } catch (e) {}
      ctx.courtAccords = (ctx.courtAccords || 0) + 1;
    }
    if (st.pendingNational && Game.answerNationalChoice) {
      const shape = st.pendingNational.shape;
      // TRADE-ROAD r113 (DELTA 2): covenant walks while the trade road
      // is viable and pacts once trade is dead; trade signs; lead
      // feasts, belong swears, conquest shows mercy (base answers —
      // none of those shapes can be walked from). The COVENANT_ANSWER
      // env 'pool' override is kept (unused by the r113 driver); the
      // env 'walk' override is kept too and forces a walk.
      const covPick = (process.env.COVENANT_ANSWER === 'pool') ? 'pool'
        : (process.env.COVENANT_ANSWER === 'walk') ? 'walk'
        : tradeBeatPick('covenant', tradeWindowOpen(Game, day));
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: covPick, trade: 'sign' }[shape] || 'feast';
      try { Game.answerNationalChoice(pick); } catch (e) {}
      ctx.courtNational = (ctx.courtNational || 0) + 1;
    }
    if (st.pendingGlobal && Game.answerGlobalChoice) {
      try { Game.answerGlobalChoice('feast'); } catch (e) {}
      ctx.courtGlobal = (ctx.courtGlobal || 0) + 1;
    }
    // demands + tribute + defense/trade calls on all active links
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      const lid = link.id;
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(lid, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
      if (link.pendingTradeCall && Game.answerTradeCall) {
        const canSend = pantryKcal(Game) > 10000;
        try { Game.answerTradeCall(lid, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.tradeCalls = (ctx.tradeCalls || 0) + 1;
      }
      if (link.pendingCovenantCrisis && Game.answerCovenantCrisis) {
        try { Game.answerCovenantCrisis(lid, 'concede'); } catch (e) {}
        ctx.covenantCrises = (ctx.covenantCrises || 0) + 1;
      }
      if (link.subordinate !== 'haven') continue;
      if (link.pendingDemand && Game.answerDemand) {
        const rich = pantryKcal(Game) > 12000;
        try { Game.answerDemand(link.id, rich); } catch (e) {}
        ctx.demands = (ctx.demands || 0) + 1;
      }
      const week = (Game._week ? Game._week() : 0);
      if (link.tributePaidWeek !== week && pantryKcal(Game) > 15000 && Game.payTribute) {
        try { Game.payTribute(link.id); } catch (e) {}
        ctx.tributePaid = (ctx.tributePaid || 0) + 1;
      }
    }
    // courtship: day>=25, first link, then peer push toward the covenant bar (3)
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational) { // R32: pantry gate DROPPED (arm)
      const poorCourt = pantryKcal(Game) < 12000; if (poorCourt) ctx.courtPoorDays = (ctx.courtPoorDays || 0) + 1;
      const active = links.filter(l => l && l.status === 'active');
      const covN = active.filter(l => l.kind === 'covenant').length;
      const trN = active.filter(l => l.kind === 'trade').length;
      ctx._propCool = ctx._propCool || {};
      const coolOk = (vid, kind) => ((ctx._propCool[vid + ':' + kind] || 0) + 7 <= day);
      const markCool = (vid, kind) => { ctx._propCool[vid + ':' + kind] = day; };
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      if (!cands.length) return;
      if (!active.length) {
        const t = cands.find(v => coolOk(v.id, 'link')) || null;
        if (t) {
          markCool(t.id, 'link');
          try { Game.proposeLink(t.id); } catch (e) {}
          ctx.proposed = (ctx.proposed || 0) + 1;
        }
        return;
      }
      // TRADE-ROAD r113 (DELTA 1): trade first, covenant second. The
      // base courted covenant until covN==3 and only then trade; r112
      // showed covN never reached 3, so trade was never proposed.
      // A player who wants the charter courts the trade league first.
      // THE CLIMB BEFORE THE KNOCK (journey-scale r5 2026-10-12): peer_binding_needs_courtship
      // refuses proposals below opinion 10 DETERMINISTICALLY — "X barely know Haven's name".
      // Re-proposing weekly to the same below-bar village is spam, not courtship: one run
      // logged 59 identical prerequisite refusals and never climbed. A competent player
      // hears the refusal's own directions ("walk to their fire and study their codex")
      // and DOES the climb: one pilgrimage per unstudied village (studyVillageCodex, +3
      // opinion, once), then lets broadcast wins (+2) and weeks do the rest. Proposals
      // only go out at/above the bar the game itself enforces.
      if (covN < 3 || trN < 3) {
        // continue an in-progress pilgrimage first — the trip is the day's courtship
        if (ctx._pilgrim) {
          const pg = ctx._pilgrim;
          const tv = (st.otherVillages || []).find(v => v && v.id === pg.vid);
          const px = (Game.map || {}).px, py = (Game.map || {}).py;
          try { (ctx.posTrace = ctx.posTrace || []).push({ day, vid: pg.vid, px, py, tx: tv ? (tv.x || 4) : null, ty: tv ? (tv.y || 4) : null, dist: tv ? (Math.abs((tv.x || 4) - px) + Math.abs((tv.y || 4) - py)) : null, stage: 'eval' }); } catch (e) {}
          if (!tv || (Game.linkWith && Game.linkWith(pg.vid)) || day - pg.day > 14 || Game.over || Game.tbfight) {
            try { (ctx.posTrace = ctx.posTrace || []).push({ day, vid: pg.vid, px, py, stage: 'drop', reason: !tv ? 'no-target' : ((Game.linkWith && Game.linkWith(pg.vid)) ? 'linked' : ((day - pg.day > 14) ? 'stale' : (Game.over ? 'over' : 'fight'))) }); } catch (e) {}
            ctx._pilgrim = null; // done, linked, stale, or interrupted — drop it
          } else {
            const dist = Math.abs((tv.x || 4) - px) + Math.abs((tv.y || 4) - py);
            if (dist <= 2) {
              try { if (Game.studyVillageCodex) Game.studyVillageCodex(pg.vid); } catch (e) {}
              try { (ctx.posTrace = ctx.posTrace || []).push({ day, vid: pg.vid, px, py, tx: (tv.x || 4), ty: (tv.y || 4), dist, stage: 'study' }); } catch (e) {}
              ctx.climbStudies = (ctx.climbStudies || 0) + 1;
              ctx._pilgrim = null;
              ctx._returning = true;
              return;
            }
            walkTo(Game, tv.x || 4, tv.y || 4);
            try { const qx = (Game.map || {}).px, qy = (Game.map || {}).py; (ctx.posTrace = ctx.posTrace || []).push({ day, vid: pg.vid, px, py, tx: (tv.x || 4), ty: (tv.y || 4), dist, stage: 'walk', px2: qx, py2: qy, dist2: (Math.abs((tv.x || 4) - qx) + Math.abs((tv.y || 4) - qy)) }); } catch (e) {}
            return;
          }
        }
        // walk home after a study
        if (ctx._returning) {
          walkTo(Game, 4, 4); // haven at the center of the 9x9
          if (Game.map.px === 4 && Game.map.py === 4) ctx._returning = false;
          else return;
        }
        // start a pilgrimage: nearest below-bar, unstudied candidate we still want
        if (!ctx._pilgrim) {
          const needy = cands
            .filter(v => (v.opinion || 0) < 10 && !v._codexOpinionGiven)
            .sort((a, b) => (Math.abs((a.x || 4) - 4) + Math.abs((a.y || 4) - 4)) - (Math.abs((b.x || 4) - 4) + Math.abs((b.y || 4) - 4)));
          const nt = needy[0];
          if (nt) {
            const s = Game.state.scholar || {};
            // R31 (journey-scale r31): scholar HP lives in scholar.health,
            // max via Game.maxHealth() — scholar.hp/maxHp are never set, so
            // the old read gave hpPct 0 forever and no pilgrimage ever
            // started (r30: pilgrimages 0/4 despite eligible candidates).
            const hpNow = (s.health != null ? s.health : (s.hp != null ? s.hp : 100));
            let hpMax = 100;
            try { hpMax = Game.maxHealth ? Game.maxHealth() : 100; } catch (e) {}
            const hpPct = hpNow / Math.max(1, hpMax);
            if (!s.exiled && hpPct > 0.7) {
              ctx._pilgrim = { vid: nt.id, day };
              if (poorCourt) ctx.pilgrimagesPoor = (ctx.pilgrimagesPoor || 0) + 1;
              ctx.pilgrimages = (ctx.pilgrimages || 0) + 1;
              return; // trip starts tomorrow's courtship
            }
          }
        }
        // propose — but only at/above the opinion bar the game enforces
        for (const t of cands) {
          if ((t.opinion || 0) < 10) continue; // below the bar: climb, don't knock
          // TRADE-ROAD r113 (DELTA 1, windowed — pilot addendum 2):
          // trade-first while the window is open, covenant-first once
          // it closes (the fallback). The base order returns after d120.
          const windowOpen = tradeWindowOpen(Game, day);
          const kind = windowOpen
            ? (trN < 3 && coolOk(t.id, 'trade') ? 'trade' : covN < 3 && coolOk(t.id, 'covenant') ? 'covenant' : null)
            : (covN < 3 && coolOk(t.id, 'covenant') ? 'covenant' : trN < 3 && coolOk(t.id, 'trade') ? 'trade' : null);
          if (!kind) continue;
          markCool(t.id, kind);
          try {
            if (kind === 'covenant' && Game.proposeCovenant) Game.proposeCovenant(t.id);
            else if (kind === 'trade' && Game.proposeTrade) Game.proposeTrade(t.id);
          } catch (e) {}
          ctx.proposedPeer = (ctx.proposedPeer || 0) + 1;
          if (poorCourt) ctx.proposedPeerPoor = (ctx.proposedPeerPoor || 0) + 1;
          break; // one proposal per day — courtship takes time
        }
      }
    }
  } catch (e) {}
}

// GRANARY DRAW (LEVER CANDIDATE — not in the baseline): the covenant's
// headline benefit is "draw on it in famine". A competent player whose pantry
// is nearly bare and whose league granary holds food would draw the village's
// daily need. Kept OUT of the baseline so the scale economy can be measured
// as-is; the lever run may add it (policy-side) or wire an automatic famine
// draw (game-code). See evidence/2026-10-11/sim-food-r2.md.

// r99 MORNTRACE3 (logging only): r98's three overnight-window boundary
// snapshots PLUS the fields r98 named for the walk-out water question:
//   packKg = Game.packWeight() (1 decimal) — what the pack weighs
//   carryCap = Game.carryCapacity() — pack room = floor(cap - kg)
//   cistClean / cistDirty = state.village.water (the shared cistern;
//     fillWater refuses aloud at Haven when clean < 1)
//   packTop = 3 heaviest scholar-inventory stacks as id:kg (so a
//     pack-full verdict can name what the weight is)
// Snapshots: entry (after sleep + morning waits, before competent.daily),
// postCompetent (after competent.daily, before courtship), postCourt
// (after courtship: the walk/study/drop itself). Logging only.
function _mornSnap(Game, ctx) {
  try {
    const s = (Game.state || {}).scholar || {};
    let tileType = null;
    try { const t = Game.playerTile ? Game.playerTile() : null; tileType = t ? (t.type || null) : null; } catch (e) {}
    let packKg = null, carryCap = null, packTop = null;
    try { packKg = Game.packWeight ? Math.round(Game.packWeight() * 10) / 10 : null; } catch (e) {}
    try { carryCap = Game.carryCapacity ? Game.carryCapacity() : null; } catch (e) {}
    try {
      const inv = (s.inventory || []);
      const scored = inv.map(it => ({ id: (it && (it.itemId || it.id)) || '?', kg: Math.round(((it && (it.kg || 0)) * ((it && (it.units || it.count)) || 1)) * 10) / 10 })).filter(x => x.kg > 0);
      scored.sort((a, b) => b.kg - a.kg);
      packTop = scored.slice(0, 3).map(x => x.id + ':' + x.kg).join(',') || '-';
    } catch (e) { packTop = null; }
    let cistClean = null, cistDirty = null;
    try { const vw = ((Game.state || {}).village || {}).water || {}; cistClean = (vw.clean == null ? null : vw.clean); cistDirty = (vw.dirty == null ? null : vw.dirty); } catch (e) {}
    return { px: (Game.map || {}).px, py: (Game.map || {}).py,
      hyd: (s.hydration != null ? Math.round(s.hydration) : null),
      pilgrim: (ctx && ctx._pilgrim) ? ctx._pilgrim.vid : null,
      returning: !!(ctx && ctx._returning),
      thirstHome: (ctx && ctx.thirstHome) || 0, forageTrips: (ctx && ctx.forageTrips) || 0,
      standingHomeDays: (ctx && ctx.standingHomeDays) || 0,
      tripHomeDetours: (ctx && ctx.tripHomeDetours) || 0,
      packWater: ((s.water || []).length),
      tileType: tileType,
      insideTent: !!s.insideTent,
      weather: (Game.state || {}).weather || null,
      dayTicks: (s.dayTicks || 0),
      drank: (ctx && ctx.drank) || 0,
      packKg: packKg, carryCap: carryCap, cistClean: cistClean, cistDirty: cistDirty, packTop: packTop };
  } catch (e) { return {}; }
}
function _mornPush(Game, ctx, stage, before) {
  try {
    const snap = _mornSnap(Game, ctx);
    const row = { day: gday(Game), stage, px: snap.px, py: snap.py, hyd: snap.hyd,
      pilgrim: snap.pilgrim, returning: snap.returning,
      packWater: snap.packWater, tileType: snap.tileType, insideTent: snap.insideTent,
      weather: snap.weather, dayTicks: snap.dayTicks, drank: snap.drank,
      packKg: snap.packKg, carryCap: snap.carryCap, cistClean: snap.cistClean, cistDirty: snap.cistDirty, packTop: snap.packTop };
    if (before) {
      row.dThirst = snap.thirstHome - before.thirstHome;
      row.dForage = snap.forageTrips - before.forageTrips;
      row.dStanding = snap.standingHomeDays - before.standingHomeDays;
      row.dDetours = snap.tripHomeDetours - before.tripHomeDetours;
      row.dDrank = snap.drank - before.drank;
    }
    (ctx.mornTrace = ctx.mornTrace || []).push(row);
    return snap;
  } catch (e) { return before || {}; }
}
const scalecourt = Object.assign({}, competent, {
  id: 'scalecourt-traderoad-r113',
  desc: 'competent + TRADE-road scale courtship (r113: trade-first peer proposals, covenant walks while trade is viable) + r99 morntrace3 logging',
  daily(Game, ctx) {
    const _before = _mornPush(Game, ctx, 'entry', null);
    competent.daily(Game, ctx);
    const _mid = _mornPush(Game, ctx, 'postCompetent', _before);
    courtship(Game, ctx);
    _mornPush(Game, ctx, 'postCourt', _mid);
  },
});

module.exports = { scalecourt, tradeViable, tradeSealed, subCount, tradeBeatPick, tradePool, tradeWindowOpen, TRADE_WINDOW_END };
