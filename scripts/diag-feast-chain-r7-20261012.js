#!/usr/bin/env node
// diag-feast-chain-r7-20261012.js — WHERE does the feast chain break under
// the COMPETENT policy? (lever 0, food r7).
// Wraps hostFeast / grantFeastBuff / noteFeastedCombatUse / channelSentiment
// and samples daily: affordability, arming inputs, trauma, keepsakes.
// Usage: SEEDS="11,22,33" DAYS=200 OUT=/tmp/feastchain-r7.json node scripts/diag-feast-chain-r7-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88,99,111,222,333').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/feastchain-r7.json';

function maxedOf(G) {
  try {
    const s = G.state.scholar || {};
    const all = [...(s.abilities || []), ...(s.backgroundAbilities || [])];
    return all.filter(a => (a.level || 1) >= 3).length;
  } catch (e) { return 0; }
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    await setupGame(Game);
    const D = {
      seed, feastCalls: 0, feastOk: 0, feastWhys: {},
      grants: 0, refusals: 0, refusalWhy: '', uses: 0, armDays: [],
      channels: 0, channelArms: 0, channelSoothe: 0, channelPractice: 0, feastDays: [],
      days: 0, affordableDays: 0, affordableSurplusDays: 0, atHavenDays: 0,
      trauma8Days: 0, keepsakeReadyDays: 0, sentimentTaughtDay: 0,
      maxResonance: 0, maxedBest: 0, armedDays: 0, armedNeverFeastedDays: 0,
      pantryP50: 0, costP50: 0,
    };
    const pantry = [], costs = [];
    // --- wrap chain functions ---
    const ogHost = Game.hostFeast.bind(Game);
    Game.hostFeast = function () {
      let armedBefore = false;
      try { armedBefore = !!((Game.state.scholar.prog || {}).feastSurge); } catch (e) {}
      const r = ogHost();
      D.feastCalls++;
      try { D.feastDays.push({ day: ((Game.state.scholar || {}).day) || 0, armed: armedBefore, ok: !!(r && r.ok), buff: !!((r && r.buffGranted)) }); } catch (e) {}
      if (r && r.ok) D.feastOk++;
      else { const w = String((r && r.why) || '?').slice(0, 60); D.feastWhys[w] = (D.feastWhys[w] || 0) + 1; }
      return r;
    };
    const ogGrant = Game.grantFeastBuff.bind(Game);
    Game.grantFeastBuff = function (feast) {
      const r = ogGrant(feast);
      if (r && r.granted) D.grants++;
      else { D.refusals++; D.refusalWhy = String((r && r.why) || '?').slice(0, 80); }
      return r;
    };
    const ogNote = Game.noteFeastedCombatUse.bind(Game);
    Game.noteFeastedCombatUse = function () {
      let mark = false;
      try { mark = !!(Game.state.scholar.feastBuff && !Game.state.scholar.feastBuff.used && Game.inCombat && Game.inCombat()); } catch (e) {}
      const r = ogNote();
      if (mark) D.uses++;
      return r;
    };
    const ogChan = Game.channelSentiment.bind(Game);
    Game.channelSentiment = function (idx) {
      let traumaBefore = 0, surgeBefore = 0;
      try { traumaBefore = Game.state.scholar.trauma || 0; surgeBefore = !!(Game.state.scholar.prog || {}).feastSurge; } catch (e) {}
      const r = ogChan(idx);
      D.channels++;
      try {
        const pg = Game.state.scholar.prog || {};
        if (!surgeBefore && pg.feastSurge) { D.channelArms++; D.armDays.push((Game.state.scholar.day) || 0); }
        else if ((Game.state.scholar.trauma || 0) < traumaBefore) D.channelSoothe++;
        else D.channelPractice++;
      } catch (e) {}
      return r;
    };
    // --- daily sampler (before the policy's own daily work) ---
    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    policy.daily = (G, ctx) => {
      try {
        const s = G.state.scholar || {}, pg = s.prog || {};
        D.days++;
        if (!D.sentimentTaughtDay && G.sentimentTaught && G.sentimentTaught()) D.sentimentTaughtDay = s.day || 0;
        const res = pg.surgeResonance || 0;
        if (res > D.maxResonance) D.maxResonance = res;
        const mx = maxedOf(G);
        if (mx > D.maxedBest) D.maxedBest = mx;
        if ((s.trauma || 0) >= 8) D.trauma8Days++;
        let ready = 0;
        try { ready = (G.channelReadyKeepsakes ? G.channelReadyKeepsakes() : []).length; } catch (e) {}
        if (ready > 0) D.keepsakeReadyDays++;
        let atHaven = false;
        try { atHaven = !!(G.playerAtHaven && G.playerAtHaven()); } catch (e) {}
        if (atHaven) D.atHavenDays++;
        if (pg.feastSurge) { D.armedDays++; if (!G.feastedActive || !G.feastedActive()) D.armedNeverFeastedDays++; }
        // armed-day blocker trace: why doesn't an armed feast fire?
        if (pg.feastSurge && !D.blockers) D.blockers = { notAtHaven: 0, drain: 0, pantry: 0, cadence: 0, feastDay: 0, planNotOk: 0, eligible: 0 };
        if (pg.feastSurge) {
          try {
            const day = s.day || 0;
            if (!(G.playerAtHaven && G.playerAtHaven())) { D.blockers.notAtHaven++; }
            else {
              const vv = G.state.village || {};
              const me = G.villagerId;
              const drain = ((vv.takes || {})[me] || 0) - ((vv.gives || {})[me] || 0);
              if (drain > 3000) { D.blockers.drain++; }
              else {
                const plan = G.feastPlan ? G.feastPlan() : null;
                if (!plan || !plan.ok) { D.blockers.planNotOk++; const w = String((plan && plan.why) || '?').slice(0, 50); D.planWhys = D.planWhys || {}; D.planWhys[w] = (D.planWhys[w] || 0) + 1; }
                else if (plan.have < plan.cost * 1.5) { D.blockers.pantry++; }
                else if (s.feastDay === day) { D.blockers.feastDay++; }
                else if (ctx._lastFeastDay && (day - ctx._lastFeastDay) < 7) { D.blockers.cadence++; }
                else D.blockers.eligible++;
              }
            }
          } catch (e) {}
        }
        // affordability at the day's end (post-daily-work snapshot, pre-sleep)
        try {
          const plan = G.feastPlan ? G.feastPlan() : null;
          if (plan && plan.ok && atHaven) {
            pantry.push(plan.have); costs.push(plan.cost);
            D.affordableDays++;
            if (plan.have >= plan.cost * 1.5) D.affordableSurplusDays++;
          }
        } catch (e) {}
      } catch (e) {}
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days: DAYS });
    pantry.sort((a, b) => a - b); costs.sort((a, b) => a - b);
    if (pantry.length) D.pantryP50 = pantry[Math.floor(pantry.length / 2)];
    if (costs.length) D.costP50 = costs[Math.floor(costs.length / 2)];
    let pg = {};
    try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
    rows.push(Object.assign(D, {
      runDays: result.days, endReason: result.endReason,
      feastSurgeUsed: !!(pg && pg.feastSurgeUsed), sentiment: !!(pg && pg.sentimentTaught),
      maxArc: (pg && pg.arc) || 1,
    }));
    console.log(`seed=${seed} runDays=${result.days} end=${result.endReason} armDays=${JSON.stringify(D.armDays)} feastDays=${JSON.stringify(D.feastDays)} refusals=${D.refusals} blockers=${JSON.stringify(D.blockers || {})} planWhys=${JSON.stringify(D.planWhys || {})} ` +
      `feastCalls=${D.feastCalls} grants=${D.grants} uses=${D.uses} arms=${D.channelArms} ` +
      `channels=${D.channels}(soothe=${D.channelSoothe} practice=${D.channelPractice}) ` +
      `affordable=${D.affordableDays} surplus15x=${D.affordableSurplusDays} ` +
      `maxRes=${D.maxResonance} maxed=${D.maxedBest} keepsakeReadyDays=${D.keepsakeReadyDays} ` +
      `trauma8Days=${D.trauma8Days} taughtDay=${D.sentimentTaughtDay} ` +
      `pantryP50=${D.pantryP50} costP50=${D.costP50} used=${!!(pg && pg.feastSurgeUsed)}`);
  }
  require('fs').writeFileSync(OUT, JSON.stringify({ meta: { seeds: SEEDS, days: DAYS }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
