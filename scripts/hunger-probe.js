#!/usr/bin/env node
// hunger-probe.js — measure the scholar's hunger burden under the layer.
//
// For each seed: run 30d control vs SCHOLARDIST=1 armed, track the scholar's
// end-of-day fullness and hunger (npcNeeds), plus thin-day halves. Reports
// per-seed mean scholar fullness and days with fullness < 500.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const scholardist = require('./layers/scholardist-b');

const SEEDS = (process.env.SEEDS || '67501,67502,67503,67504').split(',').map(s => +s);
const POLICY = process.env.POLICY || 'leadfeast';

async function run(seed, arm) {
  const prev = process.env.SCHOLARDIST;
  if (arm === 'armed') process.env.SCHOLARDIST = '1'; else delete process.env.SCHOLARDIST;
  try {
    const { Game, manifest } = await loadGame({ seed, mode: 'hunger-' + arm });
    await setupGame(Game, 'Columbus, Ohio');
    const layer = scholardist.install(Game);
    const series = [];
    const base = POLICY_REGISTRY[POLICY];
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => {
      try {
        const sch = (G.state || {}).scholar || {};
        const me = G.villagerId;
        let hunger = null;
        try { hunger = (G.npcNeeds(me) || {}).hunger; } catch (e) {}
        series.push({ day: sch.day || 0, full: Math.round(sch.fullness || 0), hunger: hunger == null ? null : Math.round(hunger) });
      } catch (e) {}
      if (origDaily) return origDaily(G, ctx);
    };
    const result = await runDays(Game, policy, { days: 30, manifest });
    const tele = JSON.parse(JSON.stringify(layer.tele));
    layer.uninstall();
    return { series, tele, gameDays: result.gameDays };
  } finally {
    if (prev === undefined) delete process.env.SCHOLARDIST;
    else process.env.SCHOLARDIST = prev;
  }
}

(async () => {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  for (const seed of SEEDS) {
    const c = await run(seed, 'control');
    const a = await run(seed, 'armed');
    const stat = (s) => {
      const h = s.series.map(r => r.hunger).filter(x => x != null);
      const mean = h.reduce((x, y) => x + y, 0) / Math.max(1, h.length);
      const bad = h.filter(x => x >= 50).length;
      return `meanHunger=${Math.round(mean)} daysHunger>=50=${bad}/${h.length}`;
    };
    console.log(`s${seed} ${POLICY}: control[${stat(c)}] armed[${stat(a)}] halves=${a.tele.halves} gameDays=${c.gameDays}->${a.gameDays}`);
  }
})().catch(e => { console.error('PROBE FAIL: ' + (e && e.stack || e)); process.exitCode = 1; });
