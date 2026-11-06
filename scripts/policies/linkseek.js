// linkseek — competent + LINK-SEEKING diplomacy (sim-linkseek-b,
// axis scale-onramp / winnability chain, run fleshout-loop-b-20261106T0730Z).
//
// POLICY-SIDE ONLY. ZERO src/js. A competent player who ALSO seeks
// links: travels to villages the player actually knows, studies
// their codex at their fire (+3 opinion, once — the climb verb),
// proposes bonds, answers counters/accords, and tends links with
// grain. Perception-gated throughout: only villages the player
// knows via lore / generated / delivered rumor (Game.knowsVillage),
// never from a roster.
//
// Courtship parameters are copied VERBATIM from leadcourt.js
// (propose day>=25, pantry>12000, one/day, 7-day cooldown per
// village, stop at 3 subordinate links, tribute 4000,
// asSubordinate false; answer counter accept / sweeten if pantry
// >25000; tend weekly, pantry>20000; accord 'gift'; national
// shape pick; global 'feast'). The TRAVEL + STUDY leg is the
// delta under test vs leadcourt: leadcourt proposes remotely and
// never walks to a village or studies a codex.
//
// Guards: travel only when the pantry can carry it (>12000 kcal)
// and the living roster is >= 4 — never walk a starving or
// skeleton village into the wild to court. One travel leg per
// day, at most; study once per village (tracked in ctx).
'use strict';
const { competent, walkTo } = require('./competent');

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
function manhattan(ax, ay, bx, by) { return Math.abs((ax || 0) - (bx || 0)) + Math.abs((ay || 0) - (by || 0)); }

// pickTarget: nearest KNOWN village with no link, or null. The
// perception gate lives here — Game.knowsVillage is the only way
// a village becomes a candidate.
function pickTarget(Game) {
  try {
    const st = Game.state || {};
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    let best = null, bd = 1e9;
    for (const v of (st.otherVillages || [])) {
      if (!v || v.id === 'haven') continue;
      if (!Game.knowsVillage || !Game.knowsVillage(v)) continue;
      if (Game.linkWith && Game.linkWith(v.id)) continue;
      const d = manhattan(px, py, v.x, v.y);
      if (d < bd) { bd = d; best = v; }
    }
    return best;
  } catch (e) { return null; }
}

function courtLog(ctx, ev) {
  try {
    ctx.courtLog = ctx.courtLog || [];
    ctx.courtLog.push(ev);
  } catch (e) {}
}

function linkseekCourtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
    // answer pending offers/beats — a competent player answers, never leaves mail unread
    if (st.pendingCounter && Game.answerCounter) {
      const rich = pantryKcal(Game) > 25000;
      let out = null;
      try { out = Game.answerCounter(rich ? 'sweeten' : 'accept'); } catch (e) {}
      courtLog(ctx, { day: day, kind: 'counter-answer', how: rich ? 'sweeten' : 'accept', outcome: out && out.id ? 'formed' : (out === 'counter' ? 'counter' : (out ? 'answered' : 'none')) });
      ctx.courtCounters = (ctx.courtCounters || 0) + 1;
    }
    if (st.pendingAccord && Game.answerAccord) {
      try { Game.answerAccord('gift'); } catch (e) {}
      courtLog(ctx, { day: day, kind: 'accord-answer', how: 'gift', outcome: 'answered' });
      ctx.courtAccords = (ctx.courtAccords || 0) + 1;
    }
    if (st.pendingNational && Game.answerNationalChoice) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { Game.answerNationalChoice(pick); } catch (e) {}
      ctx.courtNational = (ctx.courtNational || 0) + 1;
    }
    if (st.pendingGlobal && Game.answerGlobalChoice) {
      try { Game.answerGlobalChoice('feast'); } catch (e) {}
      ctx.courtGlobal = (ctx.courtGlobal || 0) + 1;
    }
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    const week = (Game._week ? Game._week() : 0);
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      if (link.primary === 'haven' && Game.tendLink) {
        if (link.tendedWeek !== week && pantryKcal(Game) > 20000) {
          try { Game.tendLink(link.id); } catch (e) {}
          ctx.tended = (ctx.tended || 0) + 1;
        }
      }
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(link.id, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
    }
    // TRAVEL + STUDY leg (the delta vs leadcourt): walk to the
    // nearest known unlinked village, study its codex at the fire.
    // Guards: day>=15, pantry>12000, living>=4, one leg per day.
    if (day >= 15 && pantryKcal(Game) > 12000 && popAlive(Game) >= 4 && !Game.over && !Game.tbfight) {
      const target = pickTarget(Game);
      if (target) {
        const px = (Game.map || {}).px, py = (Game.map || {}).py;
        const d0 = manhattan(px, py, target.x, target.y);
        ctx._linkStudied = ctx._linkStudied || {};
        if (d0 > 2) {
          try { walkTo(Game, target.x, target.y); } catch (e) {}
          courtLog(ctx, { day: day, kind: 'travel', target: target.id, fromDist: d0, toDist: manhattan((Game.map || {}).px, (Game.map || {}).py, target.x, target.y) });
          ctx.travelLegs = (ctx.travelLegs || 0) + 1;
        }
        // STUDY THEIR CODEX (climb verb, +3 opinion once): needs
        // dist<=2; the engine refuses farther away, honestly.
        const d1 = manhattan((Game.map || {}).px, (Game.map || {}).py, target.x, target.y);
        if (d1 <= 2 && !ctx._linkStudied[target.id] && Game.studyVillageCodex) {
          let res = null;
          try { res = Game.studyVillageCodex(target.id); } catch (e) {}
          ctx._linkStudied[target.id] = day;
          courtLog(ctx, { day: day, kind: 'study', target: target.id, outcome: typeof res === 'string' ? res.slice(0, 120) : 'unknown' });
          ctx.studies = (ctx.studies || 0) + 1;
        }
      }
    }
    // LEAD courtship (leadcourt parameters, verbatim): day>=25,
    // propose villages as subordinates until three seasoned bonds
    // stand under one head. One proposal per day.
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
      if (subs >= 3) return;
      ctx._leadCool = ctx._leadCool || {};
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      for (const t of cands) {
        if ((ctx._leadCool[t.id] || 0) + 7 > day) continue;
        ctx._leadCool[t.id] = day;
        let out = null;
        try { out = Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }); } catch (e) {}
        const outcome = (out && out.id) ? 'formed' : (out === 'counter' ? 'counter' : (out === null ? 'declined' : 'unknown'));
        courtLog(ctx, { day: day, kind: 'propose', target: t.id, outcome: outcome });
        ctx.proposedLead = (ctx.proposedLead || 0) + 1;
        break;
      }
    }
  } catch (e) {}
}

const linkseek = Object.assign({}, competent, {
  id: 'linkseek',
  desc: 'competent + link-seeking diplomacy (travel to known villages, study codex, propose, answer, tend)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    linkseekCourtship(Game, ctx);
  },
});

module.exports = { linkseek: linkseek, pickTarget: pickTarget, pantryKcal: pantryKcal, gday: gday, manhattan: manhattan };
