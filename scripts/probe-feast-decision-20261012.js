#!/usr/bin/env node
// probe-feast-decision-20261012.js — replay a seed, log eveningFeast's
// internal decision inputs at dusk upkeep.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const pol = require('./policies/competent');
const competent = pol.competent;
const SEED = parseInt(process.env.SEED || '333', 10);
const DAYS = parseInt(process.env.DAYS || '200', 10);
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'competent' });
  await setupGame(Game);
  const p = Object.assign({}, competent);
  const origUpkeep = competent.upkeep;
  const rows = [];
  p.upkeep = (G, ctx) => {
    if (origUpkeep) { try { origUpkeep(G, ctx); } catch (e) {} }
    try {
      if (G.dayPart === 2) {
        const s = G.state.scholar || {}, day = s.day || 0;
        const armed = !!((s.prog || {}).feastSurge);
        let atHaven = false; try { atHaven = !!(G.playerAtHaven && G.playerAtHaven()); } catch (e) {}
        const gives7 = pol.recentGives(G, ctx, 7);
        let planInfo = '?';
        try { const plan = G.feastPlan ? G.feastPlan() : null; planInfo = plan ? `ok=${plan.ok} why=${(plan.why || '').slice(0, 40)} have=${plan.have} cost=${plan.cost}` : 'no-plan'; } catch (e) { planInfo = 'plan-threw'; }
        rows.push(`d${day} dusk: atHaven=${atHaven} armed=${armed} feastDay=${s.feastDay} _lastFeastDay=${ctx._lastFeastDay || 0} gives7=${Math.round(gives7)} ${planInfo}`);
      }
    } catch (e) {}
  };
  await runDays(Game, p, { days: DAYS });
  for (const r of rows) console.log(r);
  console.log('done');
})();
