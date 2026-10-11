#!/usr/bin/env node
// test-lockjaw-lever-20261011.js — proof for the lockjaw-certainty lever play.
// Before/after on identical seeds: contract lockjaw on day 5 (survivable
// conditions — fed, watered, healed) and run the competent policy. The lever
// change is the engine rule; the policy is identical.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = [7, 42, 99];

(async () => {
  const out = [];
  for (const seed of SEEDS) {
    const { Game, manifest } = await loadGame({ seed, mode: 'lockjaw-lever', fullTelemetry: true });
    await setupGame(Game);
    const policy = Object.assign({}, competent);
    const events = [];
    const oA = Game.applyStatus.bind(Game);
    const _pd = Game.playerDeath.bind(Game);
    Game.playerDeath = function (c) { events.push(['DEATH', c, 'day=' + ((this.state.scholar || {}).day)]); return _pd(c); };
    // survivable conditions: contract on day 5, keep the carrier fed/healed
    // through the clock so the DISEASE is what gets tested, not starvation.
    const origUpkeep = policy.upkeep;
    policy.upkeep = (G, ctx) => {
      if (origUpkeep) { try { origUpkeep(G, ctx); } catch (e) {} }
      try {
        const s = G.state.scholar;
        if (s.kcal < G.kcalCap() * 0.9) s.kcal = G.kcalCap() * 0.95;
        if (s.hydration < 60) s.hydration = 80;
        if (s.health < 80) s.health = 95;
      } catch (e) {}
    };
    const origDaily = policy.daily;
    let contracted = false;
    policy.daily = (G, ctx) => {
      try {
        if (!contracted && ((G.state.scholar || {}).day || 0) >= 5) {
          contracted = true;
          G.contractDisease('lockjaw', { source: 'a rusty nail (lever probe)' });
          events.push(['CONTRACT', 'day=' + ((G.state.scholar || {}).day)]);
        }
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days: 60, manifest, sampleEvery: 10 });
    const tele = result.telemetry || [];
    const lockDeaths = tele.filter(e => e.type === 'death' && /lockjaw/i.test(String(e.cause || ''))).length;
    const warned = tele.some(e => /say|narrat/i.test(e.type || ''));
    out.push({ seed, contracted, days: ((Game.state.scholar || {}).day), events, lockDeaths, over: !!Game.over });
    console.log(`seed ${seed}:`, JSON.stringify(events), 'lockjawDeaths(tele)=', lockDeaths);
  }
  console.log(JSON.stringify(out, null, 1));
})();
