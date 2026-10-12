// policies/promiser.js — promise-economy policies for trust & social r7
// (2026-10-12). The promise system (promiseHelp/checkPromises) has never
// been exercised by a sim policy: 0 promises made across 36 r5/r6 runs.
// These policies drive it through the REAL conversation path.
//
// promiser: makes formal vows (talkTo -> ask:goal -> goal-thread depth ->
//   offer_help -> promiseHelp) and KEEPS them with keep-kind actions:
//   giveFood (feed/survive), tendVillager (heal), substantive talk
//   (belong/understand — 3+ exchanges fires checkPromises('social')).
//   travel/fight/task keeps broadcast from normal play.
// oathbreaker: makes the same vows, never keeps — measures the rot path
//   (7-day expiry, -15 trust, broken memories). Incidental keeps from the
//   competent survival base (feeding the hungry) still land — honest noise.
//
// Both build on socialite (competent survival + social base).
'use strict';
const { socialite } = require('./socialite');

function openPromises(Game) {
  try {
    const v = Game.state.village || {};
    return Object.entries(v.promises || {})
      .filter(([id, p]) => p && !p.kept && p.kept !== 'broken');
  } catch (e) { return []; }
}

// drivePromiseConvo: talk until offer_help appears (goal known + promise
// discovered or goal-thread depth >= 2), then take it. Returns true if the
// offer_help turn was taken (the vow may still deflect for unkeepable
// goals — counted by the harness wrap on promiseHelp, not here).
function drivePromiseConvo(Game, vid, ctx) {
  let tookOffer = false;
  try {
    if (typeof Game.talkTo !== 'function') return false;
    Game.talkTo(vid);
    for (let t = 0; t < 10; t++) {
      let choices = [];
      try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
      const ids = choices.map(c => c && c.id).filter(Boolean);
      if (ids.indexOf('offer_help') !== -1) {
        try { Game.convoTurn(vid, 'offer_help'); tookOffer = true; } catch (e) {}
        ctx.promOffers = (ctx.promOffers || 0) + 1;
        break;
      }
      // deepen the goal thread first — that's what unlocks the offer
      const pick = choices.find(c => c.id === 'ask:goal')
        || choices.find(c => c.id && c.id.indexOf('follow:goal') === 0)
        || choices.find(c => c.id && c.id.indexOf('ans:') === 0)
        || choices.find(c => c.id && c.id.indexOf('gq:') === 0)
        || choices.find(c => c.id === 'deflect_q')
        || choices.find(c => c.id === 'dlg:more')
        || choices.find(c => c.id === 'more' || c.id === 'theorize' || c.id === 'goon')
        || choices.find(c => c.id === 'dlg:subject')
        || choices.find(c => c.id && /^(ask:|follow:)/.test(c.id));
      if (!pick) break;
      try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    }
  } catch (e) {}
  try { if (Game.endConvo) Game.endConvo(vid, 'left'); } catch (e2) {}
  return tookOffer;
}

function keepPhase(Game, ctx) {
  for (const [pid, p] of openPromises(Game)) {
    let kind = null;
    try { kind = Game.promiseKeepKind(p.goal); } catch (e) {}
    try {
      if (kind === 'food') {
        // feed/survive: hand food when the pantry can take it. The keep
        // is the deed, not the words.
        let kcal = 0;
        try { kcal = Game.pantryKcalLive(Game.state.village); } catch (e) {}
        if (kcal > 4000 && typeof Game.giveFood === 'function') {
          Game.giveFood(pid);
          ctx.promKeepTries = (ctx.promKeepTries || 0) + 1;
        }
      } else if (kind === 'heal') {
        const v = Game.state.village || {};
        const sick = (((v.sick || {})[pid] || {}).daysLeft || 0) > 0;
        const hurt = ((v.health || {})[pid] === undefined ? 100 : v.health[pid]) < 90;
        if ((sick || hurt) && typeof Game.tendVillager === 'function') {
          Game.tendVillager(pid);
          ctx.promKeepTries = (ctx.promKeepTries || 0) + 1;
        }
      } else if (kind === 'social') {
        // belong/understand: a real conversation IS the keep (3+
        // substantive exchanges fire checkPromises('social', vid) inside
        // convoTurn). offer_help is gated off by the open promise, so this
        // just talks deep.
        drivePromiseConvo(Game, pid, ctx);
        ctx.promKeepTries = (ctx.promKeepTries || 0) + 1;
      }
      // travel/fight/task keeps broadcast from normal play (travelTo,
      // tbEnd, resolveAssignments) — nothing extra needed.
    } catch (e) {}
  }
}

function promiseDaily(Game, ctx, keepMode) {
  try {
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    // MAKE: up to 2 promise conversations a day, skipping villagers with
    // an open vow already. Day-rotated start for coverage.
    const cands = roster.filter(id => {
      const pr = (v.promises || {})[id];
      return !pr || !!pr.kept;
    });
    if (cands.length) {
      const day = (Game.state.scholar || {}).day || 0;
      let made = 0;
      for (let i = 0; i < cands.length && made < 2; i++) {
        const vid = cands[(day + i) % cands.length];
        if (drivePromiseConvo(Game, vid, ctx)) made++;
      }
    }
  } catch (e) {}
  if (keepMode) keepPhase(Game, ctx);
}

const promiser = Object.assign({}, socialite, {
  id: 'promiser',
  desc: 'promise economy: makes formal vows via convo and keeps them',
  daily(Game, ctx) {
    if (socialite.daily) socialite.daily(Game, ctx);
    promiseDaily(Game, ctx, true);
  },
});

const oathbreaker = Object.assign({}, socialite, {
  id: 'oathbreaker',
  desc: 'promise economy: makes formal vows via convo, never keeps them',
  daily(Game, ctx) {
    if (socialite.daily) socialite.daily(Game, ctx);
    promiseDaily(Game, ctx, false);
  },
});

module.exports = { promiser, oathbreaker };
