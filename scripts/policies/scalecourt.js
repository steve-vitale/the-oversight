// scalecourt — competent + covenant-road scale courtship (longsim food r2 2026-10-11).
//
// A competent player who ALSO courts the scale ladder the way the journey-scale
// leg played it: day 25+ first link (regional accord), then covenant peer links
// toward the national bar (3 same-kind peers), trade links after. Answers
// counters, accords, national/global beats, defense/trade calls, covenant
// crises, primary demands; pays tribute when the pantry can carry it.
// Covenant road is the food-relevant one (the shared league granary).
//
// Exists so the day-40+ food economy AT SCALE can be measured: production by
// source, pantry flow, tribute/pool/tariff in/out, spoilage, nightly draw.
'use strict';
const { competent } = require('./competent');

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
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
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
          if (!tv || (Game.linkWith && Game.linkWith(pg.vid)) || day - pg.day > 14 || Game.over || Game.tbfight) {
            ctx._pilgrim = null; // done, linked, stale, or interrupted — drop it
          } else {
            const dist = Math.abs((tv.x || 4) - px) + Math.abs((tv.y || 4) - py);
            if (dist <= 2) {
              try { if (Game.studyVillageCodex) Game.studyVillageCodex(pg.vid); } catch (e) {}
              ctx.climbStudies = (ctx.climbStudies || 0) + 1;
              ctx._pilgrim = null;
              ctx._returning = true;
              return;
            }
            walkTo(Game, tv.x || 4, tv.y || 4);
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
            const hpPct = (s.hp || 0) / Math.max(1, s.maxHp || s.hp || 1);
            if (!s.exiled && hpPct > 0.7) {
              ctx._pilgrim = { vid: nt.id, day };
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

const scalecourt = Object.assign({}, competent, {
  id: 'scalecourt',
  desc: 'competent + covenant-road scale courtship (propose/answer/tend links)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    courtship(Game, ctx);
  },
});

module.exports = { scalecourt };
