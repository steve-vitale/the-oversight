#!/usr/bin/env node
// sense-wave-drops-20261012.js — longsim wave lever r5 (2026-10-12).
// SENSE TOOL: runs full competent-policy sims and prints every say/sysSay
// line on wave-3 unlock day (minus/plus one day) — the human reads the
// drop sequence: RATINGS beat -> System wave beat -> villager fire-side
// reactions -> ledger beats. Judges meaning, coherence, order, relevance.
// Usage: SEEDS="1,2,3" MAXD=150 node scripts/sense-wave-drops-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seeds = (process.env.SEEDS || '1,2,3').split(',').map(s => parseInt(s.trim(), 10));
  const maxD = parseInt(process.env.MAXD || '150', 10);
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: true });
    await setupGame(Game);
    const log = [];
    const dayOf = () => (Game.state.scholar || {}).day || 0;
    const wrap = (fn, tag) => function (...a) {
      try { log.push({ day: dayOf(), tag, line: String(a.join(' ')).slice(0, 300) }); } catch (e) {}
      return fn.apply(this, arguments);
    };
    Game.say = wrap(Game.say.bind(Game), 'say');
    Game.sysSay = wrap(Game.sysSay.bind(Game), 'sys');
    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    let unlockDay = null;
    policy.daily = (G, ctx) => {
      try {
        const w = G.unlockedWave ? G.unlockedWave() : 1;
        if (w >= 3 && unlockDay == null) unlockDay = dayOf();
        if (unlockDay != null && dayOf() > unlockDay + 1) throw { __stop: true };
      } catch (e) { if (e && e.__stop) throw e; }
      if (origDaily) return origDaily(G, ctx);
    };
    try { await runDays(Game, policy, { days: maxD, manifest, sampleEvery: 10 }); }
    catch (e) { if (!(e && e.__stop)) throw e; }
    console.log(`\n===== seed ${seed}: wave-3 unlock day ${unlockDay} =====`);
    if (unlockDay == null) { console.log('(no wave-3 unlock in window)'); continue; }
    for (const e of log.filter(e => e.day >= unlockDay - 1 && e.day <= unlockDay + 1)) {
      console.log(`d${e.day} [${e.tag}] ${e.line}`);
    }
  }
})();
