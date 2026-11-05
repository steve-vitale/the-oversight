// scalecourt-nogate-morntrace3-fill — journey-scale r100 POLICY ARM (2026-11-05).
// r99 morntrace3 clone PLUS one behavior addition (topUpBeforeWalk, below) and
// one logging fix (packTop falls back to the item NAME when itemId/id is
// absent — r99 read raw forage stacks as `?:9`). Tests r99's proposed arm:
// competent tops up bottles at Haven during daily before a pilgrimage
// walk-out (unload-then-fill ordering). No other behavior line changed.
// scalecourt-nogate — journey-scale r32 POLICY ARM (2026-10-25, lane A).
//
// Variant of scalecourt (which carries the r31 scholar.health pilgrimage-gate
// fix) with ONE change: the >12,000 kcal pantry gate on the courtship block
// is DROPPED. r31 showed that gate freezes in-progress pilgrimages (85004:
// 1/5 completed) and starves courtship on poor villages. This variant tests
// whether courting while poor works in-game, or fails for game reasons.
// Tribute (>15,000), trade-call (>10,000), demand (>12,000) and counter
// (>25,000) pay-gates are DELIBERATELY UNCHANGED — a poor village still does
// not pay what it cannot carry; only the courtship verbs (climb + propose)
// run while poor. Standing scalecourt.js is untouched; this arm lives here.
// Instrumentation: ctx.courtPoorDays (courtship days run while pantry <
// 12,000), ctx.pilgrimagesPoor, ctx.proposedPeerPoor.
'use strict';
const { competent, donateHaul } = require('./competent');

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
      // R12 (2026-10-19): COVENANT_ANSWER env exercises the Founding
      // Council's POOL founding-pact choice in sims (default 'pact' —
      // no behavior change for normal runs). The pool founding pour is
      // the covenant road's real-food moment and no current policy takes it.
      const covPick = (process.env.COVENANT_ANSWER === 'pool' || process.env.COVENANT_ANSWER === 'walk') ? process.env.COVENANT_ANSWER : 'pact';
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
      // covenant first (the food-relevant road), then trade.
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
          const kind = covN < 3 && coolOk(t.id, 'covenant') ? 'covenant'
            : trN < 3 && coolOk(t.id, 'trade') ? 'trade' : null;
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
      const scored = inv.map(it => ({ id: (it && (it.itemId || it.id || it.name)) || '?', kg: Math.round(((it && (it.kg || 0)) * ((it && (it.units || it.count)) || 1)) * 10) / 10 })).filter(x => x.kg > 0);
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
// r100 FILL ARM (policy, not game code): a competent player about to walk
// out on a pilgrimage tops up their bottles at Haven first — the game
// offers the verb (fillWater, 1L per call, cistern-drawn, refuses aloud
// when dry or the pack is full); r99 showed competent never asks at the
// right time (its only fill attempts are the 3 upkeep passes, before
// daily sheds weight and before Ruth's dusk water return). Runs AFTER
// competent.daily (after the postCompetent snapshot, so the analyzer can
// compare pre-fill vs postCourt state) and BEFORE courtship walks the
// scholar out. Gate mirrors courtship's own walk conditions: a pilgrimage
// in progress, not returning, not stale, target unlinked, scholar at Haven.
// Steps: (1) UNLOAD — if room for <3L, shed donation-ready surplus via
// competent's own donateHaul (same keep-guard as daily); (2) FILL —
// fillWater until the scholar carries 3L or a refusal stops the loop
// (max 3 calls, 10 kcal + 1 tick each). Counts in ctx for the analyzer.
function topUpBeforeWalk(Game, ctx) {
  try {
    if (!ctx || !ctx._pilgrim) return; // no walk-out today
    if (ctx._returning) return; // walking home, not out
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const pg = ctx._pilgrim;
    const day = gday(Game);
    if (day - pg.day > 14) return; // stale — courtship drops it without walking
    const st = Game.state || {};
    const tv = ((st.otherVillages || []).find(v => v && v.id === pg.vid)) || null;
    if (!tv) return;
    if (Game.linkWith && Game.linkWith(pg.vid)) return;
    const room = () => { try { return Math.floor((Game.carryCapacity ? Game.carryCapacity() : 24) - (Game.packWeight ? Game.packWeight() : 0)); } catch (e) { return 99; } };
    if (room() < 3) {
      try { donateHaul(Game, ctx); } catch (e) {}
      ctx.fillUnloads = (ctx.fillUnloads || 0) + 1;
    }
    const s = Game.state.scholar || {};
    let filled = 0;
    // NOTE: fillWater() returns null on BOTH success and refusal — detect
    // success by the water count growing, not by the return value.
    while (((s.water || []).length) < 3 && filled < 3) {
      const before = (s.water || []).length;
      try { Game.fillWater(); } catch (e) { break; }
      if (((s.water || []).length) <= before) break; // refusal — said aloud by the game
      filled++;
    }
    if (filled > 0) {
      ctx.fillTopUps = (ctx.fillTopUps || 0) + 1;
      ctx.fillTopUpLiters = (ctx.fillTopUpLiters || 0) + filled;
    }
  } catch (e) {}
}
const scalecourt = Object.assign({}, competent, {
  id: 'scalecourt',
  desc: 'competent + covenant-road scale courtship, NO pantry gate (r32 arm) + r100 morntrace3-fill arm',
  daily(Game, ctx) {
    const _before = _mornPush(Game, ctx, 'entry', null);
    competent.daily(Game, ctx);
    const _mid = _mornPush(Game, ctx, 'postCompetent', _before);
    topUpBeforeWalk(Game, ctx);
    courtship(Game, ctx);
    _mornPush(Game, ctx, 'postCourt', _mid);
  },
});

module.exports = { scalecourt };
