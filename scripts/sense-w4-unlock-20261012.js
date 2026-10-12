#!/usr/bin/env node
// sense-w4-unlock-20261012.js — longsim wave lever r7 (2026-10-12).
// SENSE TOOL: replays the w3-farmer probe (GRANT_MID=1) on a seed known to
// unlock wave 4, capturing every say/sysSay line on the unlock day ±1.
// The human reads the Mirror Draft beat: order, coherence, meaning.
// Usage: GRANT_MID=1 SEED=8 MAXD=200 node scripts/sense-w4-unlock-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { farmer } = require('./probe-w3-ceiling-20261012.js');

(async () => {
  const seed = parseInt(process.env.SEED || '8', 10);
  const maxD = parseInt(process.env.MAXD || '200', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'farmer', fullTelemetry: true });
  await setupGame(Game);
  const log = [];
  const dayOf = () => (Game.state.scholar || {}).day || 0;
  const wrap = (fn, tag) => function (...a) {
    try { log.push({ day: dayOf(), tag, line: String(a.join(' ')).slice(0, 400) }); } catch (e) {}
    return fn.apply(this, arguments);
  };
  // sim-harness silences say/sysSay; re-wrap AFTER loadGame
  Game.say = wrap(Game.say.bind(Game), 'say');
  Game.sysSay = wrap(Game.sysSay.bind(Game), 'sys');
  const policy = Object.assign({}, farmer);
  let unlockDay = null;
  const origDaily = farmer.daily;
  policy.daily = (G, ctx) => {
    try {
      const w = G.unlockedWave ? G.unlockedWave() : 1;
      if (w >= 4 && unlockDay == null) { unlockDay = dayOf(); console.error(`[sense] wave-4 unlock day ${unlockDay}`); }
      if (unlockDay != null && dayOf() > unlockDay + 1) throw { __stop: true };
    } catch (e) { if (e && e.__stop) throw e; }
    if (origDaily) return origDaily(G, ctx);
  };
  try { await runDays(Game, policy, { days: maxD, manifest, sampleEvery: 10 }); }
  catch (e) { if (!(e && e.__stop)) throw e; }
  console.log(`\n===== seed ${seed}: wave-4 unlock day ${unlockDay} =====`);
  if (unlockDay == null) { console.log('(no wave-4 unlock in window)'); return; }
  const BEAT = /wave ledger|mirror draft|wave 4|released|ratings|at the fire|treeline|network/i;
  for (const e of log.filter(e => e.day >= unlockDay - 1 && e.day <= unlockDay + 1 && BEAT.test(e.line))) {
    console.log(`d${e.day} [${e.tag}] ${e.line}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
