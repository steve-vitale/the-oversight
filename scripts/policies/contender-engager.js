// policies/contender-engager.js — a competent-style policy that ENGAGES the
// leadership system instead of letting every challenge auto-resolve into a
// contender domain-takeover (longsim trust r1-r3 2026-10-11: 148-195
// challenges/run raised, 0 answered by any policy — the cascade equilibrium
// is the no-response equilibrium). Measurement purpose: does the cascade
// still take the village when someone answers? Do villagers react like
// people (trust shifts, gossip about the contention, challenges answered vs
// conceded)? Built on competent (survives).
//
// Leader logic (read like a human leader, not an optimizer):
//  1. A challenge answered the same day-part it surfaces: coalition first
//     (askSupport from up to 2 trusted villagers), then yield or stand
//     ground on MERIT — yield to competence (they'll run the domain well,
//     working it every part, +10 trust), stand ground against someone who'd
//     mismanage it (competence < 1.0 and low trust).
//  2. Heat cooled pre-emptively: one rally a day when contender heat is high
//     (rally cools heat by 2, cools challenge age by 2 — the designed toolkit).
//  3. Respect yielded domains: never assign anyone OVER a contender-held
//     domain (taskLead) — giving orders over their crew is what starts the
//     friction in the first place.
'use strict';
const { competent } = require('./competent');

function leadCounters(ctx) {
  return ctx.leadEngage || (ctx.leadEngage = {
    challengesAnswered: 0, challengesYielded: 0, challengesStoodGround: 0,
    alliesBuilt: 0, rallies: 0, leadsRespected: 0,
  });
}

// engageContenders: answer an active challenge NOW (same day-part), or cool
// rising heat before it becomes one. Called from upkeep (per part) and daily.
function engageContenders(Game, ctx) {
  try {
    const v = Game.state.village || {};
    const L = leadCounters(ctx);
    const ch = v.challenge;
    if (ch && ch.cid) {
      // ANSWER THE CHALLENGE — a leader doesn't let it age into a takeover.
      const cid = ch.cid, task = ch.task || 'forage';
      let comp = 1.0;
      try { comp = Game.villagerCompetence ? Game.villagerCompetence(cid, task) : 1.0; } catch (e) {}
      // Coalition first: ask up to 2 trusted villagers to back you against
      // the contender (askSupport: heat -2, alliance recorded, trust>=30 gate).
      const trust = v.trust || {};
      const supporters = (v.roster || []).filter(id =>
        id !== Game.villagerId && id !== cid && (trust[id] || 10) >= 50 &&
        !(v.allies && v.allies[id]));
      let built = 0;
      for (const vid of supporters.slice(0, 2)) {
        try { if (Game.askSupport(vid)) { built++; L.alliesBuilt++; } } catch (e) {}
        if (built >= 2) break;
      }
      const cidTrust = trust[cid] === undefined ? 10 : trust[cid];
      // MERIT CALL: yield to someone who'd run the domain well (a natural
      // runs it well — and a yielded domain WORKS every part, on your
      // behalf). Stand ground against someone who'd mismanage it or who
      // doesn't have your trust.
      if (comp >= 1.2 || (comp >= 1.0 && cidTrust >= 30)) {
        try { if (Game.yieldChallenge(cid)) { L.challengesAnswered++; L.challengesYielded++; } } catch (e) {}
      } else {
        try { if (Game.standGround(cid)) { L.challengesAnswered++; L.challengesStoodGround++; } } catch (e) {}
      }
    } else {
      // PRE-EMPTIVE: contender heat at 2+ is a confrontation loading. One
      // speech a day (rally cools heat by 2 — the designed cooling tool).
      const heat = v.heat || {};
      const hot = Object.keys(heat).filter(id => (heat[id] || 0) >= 2);
      if (hot.length) {
        const day = (Game.state.scholar || {}).day || 0;
        if ((ctx._rallyDay || 0) !== day) {
          ctx._rallyDay = day;
          try { if (Game.rallyVillage()) L.rallies++; } catch (e) {}
        }
      }
    }
  } catch (e) {}
}

// respectLeads: wrap Game.assignTask so the policy never gives orders over a
// contender-held domain (taskLead). The domain is theirs — staff around it.
function respectLeads(Game, ctx) {
  try {
    const orig = Game.assignTask;
    if (typeof orig !== 'function' || orig._respectLeads) return;
    Game.assignTask = function (vid, task, opts) {
      try {
        const leads = ((Game.state || {}).village || {}).taskLeads || {};
        if (leads[task]) {
          leadCounters(ctx).leadsRespected++;
          return { ok: false, respected: true };
        }
      } catch (e) {}
      return orig.call(this, vid, task, opts);
    };
    Game.assignTask._respectLeads = true;
  } catch (e) {}
}

const contenderEngager = Object.assign({}, competent, {
  id: 'contender-engager',
  desc: 'competent leader who answers challenges: coalition, yield-to-competence, stand-ground-on-weakness, respects yielded domains',
  setup(Game, ctx) {
    try { if (competent.setup) competent.setup(Game, ctx); } catch (e) {}
    respectLeads(Game, ctx);
  },
  upkeep(Game, ctx) {
    engageContenders(Game, ctx); // answer challenges the same part
    try { if (competent.upkeep) competent.upkeep(Game, ctx); } catch (e) {}
  },
  daily(Game, ctx) {
    engageContenders(Game, ctx); // catch anything raised during the day's work
    try { if (competent.daily) competent.daily(Game, ctx); } catch (e) {}
  },
});

module.exports = { contenderEngager, engageContenders, respectLeads, leadCounters };
