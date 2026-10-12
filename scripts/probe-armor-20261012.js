#!/usr/bin/env node
// probe-armor-20261012.js — sample: does the competent player ever own or
// wear armor? Sample equipped.armor + inventory armor + recipes known at
// day 30/60/100 across a few seeds.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  for (const seed of [3, 8, 14, 22]) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    await setupGame(Game);
    const policy = Object.assign({}, competent);
    const base = competent.daily;
    const samples = [];
    policy.daily = (G, ctx) => {
      try {
        const s = G.state.scholar; const day = s.day;
        if ([30, 60, 100].includes(day)) {
          const eq = s.equipped || {};
          const armorSlots = ['torso', 'armor', 'head', 'body'].filter(sl => eq[sl]);
          const invArmor = (s.inventory || []).filter(i => {
            const def = (G.data.items || []).find(d => d.id === (i.itemId || i.id));
            return def && def.armor;
          }).map(i => i.itemId || i.id);
          const prot = (typeof G.armorBonus === 'function') ? G.armorBonus() : null;
          const recipes = Object.keys(G.state.codex.recipes || {});
          samples.push({ seed, day, armorSlots, invArmor, prot, recipes: recipes.filter(r => /armor/i.test(r)) });
        }
      } catch (e) {}
      if (base) { try { return base(G, ctx); } catch (e) {} }
    };
    await runDays(Game, policy, { days: 120, manifest, sampleEvery: 10 });
    for (const s of samples) console.log(JSON.stringify(s));
  }
})();
