#!/usr/bin/env node
// probe-feed-mechanism-20261014.js — focused probe: HOW does the successor die
// on gap-0 feed days? Records fight state at each scholar death.
'use strict';
process.env.FOURTHLINK = '1';
process.env.SUCCBRAKE = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { succbrake } = require('./policies/succbrake');

async function main() {
  const seed = parseInt(process.env.SEEDS || '44', 10);
  const { Game } = await loadGame({ seed, mode: 'feed-probe', fullTelemetry: true });
  await setupGame(Game);
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const log = [];
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    try {
      const f = this.tbfight;
      log.push({
        day: gday(), cause: String(cause).slice(0, 40),
        vid: String(this.villagerId).slice(0, 14),
        fightLive: !!(f && !f.over),
        fighters: f && f.fighters ? f.fighters.map(x => String((x && (x.monsterId || x.name || x.key)) || '?').slice(0, 40)).slice(0, 6) : null,
        mapTile: this.map ? [this.map.px, this.map.py] : null,
        fortifyUntil: null,
      });
    } catch (e) { log.push({ err: e.message }); }
    return origPD.apply(this, arguments);
  };
  // capture fortify state at each daily
  const base = succbrake;
  const origDaily = base.daily;
  const policy = Object.assign({}, base, { id: base.id + '+probe' });
  policy.daily = (G, ctx) => {
    const r = origDaily(G, ctx);
    try {
      if (log.length && log[log.length - 1].fortifyUntil === null) {
        log[log.length - 1].fortifyUntil = ctx._sbFortifyUntil || 0;
        log[log.length - 1].fortifyDays = ctx._sbFortifyDays || 0;
        log[log.length - 1].declined = ctx._sbDeclined || 0;
      }
    } catch (e) {}
    return r;
  };
  await quietLog(() => runDays(Game, policy, { days: 100, sampleEvery: 10 }));
  for (const e of log) console.log(JSON.stringify(e));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
