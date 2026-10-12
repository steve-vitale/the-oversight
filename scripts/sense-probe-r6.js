#!/usr/bin/env node
// sense-probe-r6: capture full hunting-story and village-learning beats
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { huntRound, staffHunters } = require('./hunt-hook');
(async () => {
  const seed = parseInt(process.env.SEED || '4', 10);
  const days = parseInt(process.env.DAYS || '40', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'competent+ask', fullTelemetry: true });
  await setupGame(Game);
  const beats = [];
  try {
    const _say = Game.say;
    Game.say = function (m) {
      const s = String(m || '');
      if (/hunting stories|brings down|telling.*fire.*animal|knows it too/i.test(s)) beats.push(s);
      return _say.call(this, m);
    };
  } catch (e) {}
  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    try { huntRound(G, {}); } catch (e) {}
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
  };
  await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
  const va = (Game.state.village || {}).animals || {};
  const ca = (Game.state.codex.animals || {});
  process.stderr.write(`=== BEATS (${beats.length}) ===\n`);
  for (const b of beats.slice(0, 12)) process.stderr.write(b + '\n---\n');
  process.stderr.write(`=== VILLAGE ANIMALS: ${Object.keys(va).join(', ')} ===\n`);
  process.stderr.write(`=== PLAYER CODEX.ANIMALS: ${JSON.stringify(ca, null, 1).slice(0, 800)} ===\n`);
  process.exit(0);
})();
