#!/usr/bin/env node
// diag-contest-gates.js — one-run diagnostic: replicate contestTick's gate
// chain at each pre-dawn snapshot and attribute why TV scheduling rolls die.
// Read-only: does not modify game state.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function parseList(env, def) { return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean); }
const dayOf = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

// Replicates contestTick's scheduling math WITHOUT consuming Math.random.
function gateSnapshot(G) {
  const day = dayOf(G);
  const out = { day };
  if (day < 14) { out.gate = 'embargo'; return out; }
  if (G.state.pendingContest) { out.gate = 'pending-contest'; return out; }
  const ac = G.state.activeContest;
  if (ac && ac.phase !== 'done') { out.gate = 'active-contest'; return out; }
  const sb = G.state.showBudget || { week: 0, used: 0 };
  const week = Math.floor(day / 7);
  out.budgetUsed = (sb.week === week) ? sb.used : 0;
  if (out.budgetUsed >= 2) { out.gate = 'budget-exhausted'; return out; }
  // chance replication (from contestTick)
  const v = G.state.village || {};
  let chance = 0.25;
  const ratingsDipping = !!v._dipping;
  if (ratingsDipping) chance += 0.15;
  else {
    const now = safe(() => (typeof G.havenViewership === 'function' ? G.havenViewership() : v.viewership) || 0, 0);
    const lastWeek = v._lastWeekViewership;
    if (lastWeek !== undefined && lastWeek !== null && (now - lastWeek) > 2) chance -= 0.10;
  }
  try {
    const recentDeath = (v.fallen || []).some(f => day - (f.day || 0) <= 3);
    let fracture = false;
    try { fracture = (G.ledger() || {}).fracture > 0; } catch (e) {}
    if (recentDeath || fracture) chance += 0.10;
  } catch (e) {}
  chance = Math.max(0.05, Math.min(0.60, chance));
  out.chance = +chance.toFixed(2);
  out.dipping = ratingsDipping;
  const elig = safe(() => G.contestEligible(), null);
  out.eligibleN = elig ? (elig.eligible || []).length : -1;
  out.playerEligible = elig ? (elig.eligible || []).some(e => e.id === 'player') : false;
  // roll-vs-eligible: replicate the exact RNG? We can't replay the consumed
  // draw; instead classify deterministically:
  //   eligibleN==0 -> 'no-eligible' (roll outcome moot)
  //   else -> 'roll' (the 0.25-class draw decides)
  out.gate = out.eligibleN === 0 ? 'no-eligible' : 'roll';
  return out;
}

(async () => {
  const seeds = parseList('SEEDS', '424242,777001,999983,20261011').map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const gates = {}, chances = [], eligibleNs = [];
  let events = 0;
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    Game.say = function () {}; Game.sysSay = function () {};
    const origFireContest = Game.fireContest.bind(Game);
    const origFireShow = Game.fireShow.bind(Game);
    const origFireSummons = Game.fireRatingsSummons.bind(Game);
    Game.fireContest = function (e) { events++; return origFireContest(e); };
    Game.fireShow = function (s) { events++; return origFireShow(s); };
    Game.fireRatingsSummons = function () { events++; return origFireSummons(); };
    await setupGame(Game);
    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    policy.daily = (G, ctx) => {
      // pre-dawn snapshot (daily runs before Game.sleep's dawn processing)
      const g = gateSnapshot(G);
      gates[g.gate] = (gates[g.gate] || 0) + 1;
      if (g.chance != null) { chances.push(g.chance); eligibleNs.push(g.eligibleN); }
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days, sampleEvery: 10 });
    console.log(`seed=${seed} days=${result.days} end=${result.endReason} events=${events}`);
  }
  console.log('\npre-dawn gate distribution (day 14+, ' + chances.length + ' dawns):');
  for (const [k, v] of Object.entries(gates).sort((a, b) => b[1] - a[1]))
    console.log(`  ${k}: ${v}`);
  const mean = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(3);
  console.log('mean chance:', mean(chances), ' mean eligibleN:', mean(eligibleNs));
  console.log('events:', events);
})();
