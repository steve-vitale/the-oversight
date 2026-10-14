#!/usr/bin/env node
// probe-feed-where-20261014.js — where do feed successors die? Log mapTile +
// fortify state at every scholar combat death, all 8 pilot seeds, armed.
'use strict';
process.env.FOURTHLINK = '1';
process.env.SUCCBRAKE = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { succbrake } = require('./policies/succbrake');

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'feed-where', fullTelemetry: true });
  await setupGame(Game);
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const log = [];
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    try {
      if (String(cause) === 'combat') {
        log.push({
          seed, day: gday(), vid: String(this.villagerId).slice(0, 14),
          mapTile: this.map ? [this.map.px, this.map.py] : null,
        });
      }
    } catch (e) {}
    return origPD.apply(this, arguments);
  };
  const base = succbrake;
  const origDaily = base.daily;
  const policy = Object.assign({}, base, { id: base.id + '+whereprobe' });
  const fortAt = {};
  policy.daily = (G, ctx) => {
    const r = origDaily(G, ctx);
    try { fortAt[gday()] = { until: ctx._sbFortifyUntil || 0, declined: ctx._sbDeclined || 0 }; } catch (e) {}
    return r;
  };
  await quietLog(() => runDays(Game, policy, { days: 180, sampleEvery: 10 }));
  for (const e of log) {
    const f = fortAt[e.day] || {};
    e.fortified = (f.until || 0) >= e.day;
    e.declined = f.declined || 0;
    console.log(JSON.stringify(e));
  }
}
async function main() {
  for (const s of [11, 22, 33, 44, 55, 66, 77, 88]) await runSeed(s);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
