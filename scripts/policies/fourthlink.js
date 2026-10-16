// fourthlink — leadcourt with the 4th+ link uncapped (fourthlink arm, 2026-10-14).
//
// Opt-in policy-side layer, gate: FOURTHLINK=1 (default OFF — unset exports
// leadcourt unchanged, so the file is inert unless the gate is on).
//
// Phase-1 diagnosis (evidence/2026-10-14/sim-fourthlink.md): leadcourt's
// leadCourtship stops proposing at `subs >= 3` — the proposal branch returns
// before it can ever knock on a 4th village. The engine has no link cap
// (hierarchy.js: proposeLink/judgeLink score the courtship the same for the
// 4th proposal as the 1st; _linkSeasoned is 30+ days AND trust 40+,
// direction-agnostic). The bind is policy-side: the cap.
//
// The lever: the leadCourtship body below is copied verbatim from
// policies/leadcourt.js (2026-10-14) with ONE change — the subs>=3 cap is
// removed, so the policy keeps proposing (day>=25, pantry>12000, no pending
// beats, 7-day per-target cooldown — all unchanged) and keeps tending every
// active primary link weekly (pantry>20000 — unchanged). All verbs stay the
// same engine paths a player clicks, with real pantry costs. No engine edits.
//
// GO (pre-registered): a 4th lead link SEASONS on >=2/8 pilot seeds vs 0/8
// identical-seed baseline. Guardrail: median survival within +-10d of the
// identical-seed baseline; wall metrics no regression.
'use strict';

const FOURTHLINK = process.env.FOURTHLINK === '1';
const { leadcourt } = require('./leadcourt');

// Gate off: this module is inert — the baseline policy, byte-identical.
if (!FOURTHLINK) {
  module.exports = { fourthlink: leadcourt };
  return;
}

const { competent } = require('./competent');

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

// Copied from policies/leadcourt.js leadCourtship (2026-10-14); the single
// change is marked FOURTHLINK. Everything else — guards, cooldowns, tend
// logic, counter answers — is leadcourt byte-for-byte.
function uncappedCourtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
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
    // LEAD courtship, FOURTHLINK: the subs>=3 cap is GONE — the policy keeps
    // courting new villages while the pantry can carry it. One proposal per
    // day, 7-day per-target cooldown, day>=25, pantry>12000 — all unchanged.
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      ctx._leadCool = ctx._leadCool || {};
      for (const t of cands) {
        if ((ctx._leadCool[t.id] || 0) + 7 > day) continue;
        ctx._leadCool[t.id] = day;
        try { Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }); } catch (e) {}
        ctx.proposedLead = (ctx.proposedLead || 0) + 1;
        break;
      }
    }
  } catch (e) {}
}

const fourthlink = Object.assign({}, competent, {
  id: 'fourthlink',
  desc: 'leadcourt with the subs>=3 proposal cap removed (FOURTHLINK=1); all other guards/verbs identical',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    uncappedCourtship(Game, ctx);
  },
});

module.exports = { fourthlink };
