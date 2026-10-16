// killroad — competent + the KILL road's courtship layer (scale-onramp r18 ARM 2).
//
// The wave-4 gate is a two-rung bind (r17 tablerecon, 0/16 meet both): (1) 4
// wave-3 ledger kill points (kills only, per-type cap 2) — the kill road
// climbs it (competent: 5 pts d130 on s22); (2) regional+ scale — competent
// never courts (0 links, 0/8 regional). winseek courts (8→2 accepted, 6/8
// regional) but dies median 40d in combat before links season — 11/16 runs
// with same-day double scholar deaths. The successor inherits the same
// battlefield: bolting winseek onto competent just dies faster.
//
// killroad asks: can the KILL road learn scale WITHOUT dying to the
// courtship tax? The design bet: court LATE, from STRENGTH, as PRIMARY.
//   LATE — proposals open at day 35, after the wave-3 unlock (d25) and after
//     the scholar has kills on the board. The courtship window opens when the
//     village can afford it, not on day 1.
//   FROM STRENGTH — judgeLink rewards "Haven is the stronger" (standing
//     bonus when ourS > theirS) and broadcast victories raise their opinion
//     (+2 each): the kill road's wins ARE its courtship resume. A wounded
//     scholar (hp < 70%) or a recovering one never courts — courtship must
//     never compromise survival.
//   AS PRIMARY — they bow to Haven and THEY pay tribute (3,000 kcal/week,
//     modest so it lands and seasons — food-POSITIVE courtship, the opposite
//     of winseek's 6k/week subordinate tax). We never bow: subordinate-term
//     counters are walked away from, honestly, on the record.
//   THE TAX IS REAL — tendLink sends 1,500 kcal/week/link from Haven's
//     pantry (+8 trust); every proposal, tend, tribute, and walk goes
//     through the engine's own verbs and is narrated in transcripts
//     (SENSE-TESTING judgeable: proposal/tend beats must read as village
//     decisions).
//
// Env gate: KILLROAD_COURT=1 opts the layer in. Default OFF — gate-off
// killroad is byte-identical to competent (proven by test; the before/after
// harness gate pattern from competent's COMPETENT_* gates).
'use strict';
const { competent } = require('./competent');

function courtOn() { return process.env.KILLROAD_COURT === '1'; }
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function popAlive(Game) {
  try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return 0; }
}
function scholarHpPct(Game) {
  try {
    const s = Game.state.scholar || {};
    const hp = s.hp != null ? s.hp : (s.health != null ? s.health : 100);
    const max = s.maxHp || 100;
    return hp / Math.max(1, max);
  } catch (e) { return 1; }
}
// recovering(): the policy's own recover-and-return state (competent's
// markRecover sets ctx._recover). Courtship pauses while the scholar is
// getting home alive — the battlefield owns the day.
function isRecovering(Game, ctx) {
  try { return !!(ctx && ctx._recover); } catch (e) { return false; }
}

function killroadCourtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
    // 1. Answer pending offers first — a competent player never leaves mail
    //    unread. Counters are always subordinate terms ("they'll take
    //    Haven", 5,000/week, we pay THEM): the kill road doesn't bow.
    //    Walk, honestly, on the record.
    if (st.pendingCounter && Game.answerCounter) {
      try { Game.answerCounter('walk'); } catch (e) {}
      ctx.courtWalked = (ctx.courtWalked || 0) + 1;
    }
    if (st.pendingAccord && Game.answerAccord) {
      try { Game.answerAccord('gift'); } catch (e) {}
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
      // 2. TEND our subordinates: the weekly grain, when the pantry can
      //    carry it. Trust is a relationship, not a meter — tended weekly.
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
    // 3. PROPOSE — the kill road courts from strength, as primary.
    //    Gates (all honest, all playable through a fight-heavy life):
    //    day>=35 (post wave-3 unlock, kills on the board), pantry>=15,000
    //    (a new bond commits weekly grain), scholar hp>=70% and not
    //    recovering (never court while bleeding), no unread counter,
    //    fewer than 3 primary links (the national bar needs 3 seasoned).
    const active = links.filter(l => l && l.status === 'active');
    const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
    if (day >= 35 && !st.pendingCounter && pantryKcal(Game) > 15000 &&
        scholarHpPct(Game) >= 0.7 && !isRecovering(Game, ctx) && subs < 3) {
      ctx._killCool = ctx._killCool || {};
      const cands = (st.otherVillages || [])
        .filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)))
        // court where we're already heard: best opinion first — the kill
        // road's broadcast wins are the resume.
        .sort((a, b) => (b.opinion || 0) - (a.opinion || 0));
      for (const t of cands) {
        if ((ctx._killCool[t.id] || 0) + 7 > day) continue;
        ctx._killCool[t.id] = day;
        try { Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 3000 }); } catch (e) {}
        ctx.proposedKill = (ctx.proposedKill || 0) + 1;
        break; // one proposal per day — courtship takes time
      }
    }
  } catch (e) {}
}

const killroad = Object.assign({}, competent, {
  id: 'killroad',
  desc: "competent + kill-road courtship (KILLROAD_COURT=1 opt-in): late, from strength, as primary; walk from subordinate counters",
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    if (courtOn()) killroadCourtship(Game, ctx);
  },
});

module.exports = { killroad, courtOn };
