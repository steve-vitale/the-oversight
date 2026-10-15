#!/usr/bin/env node
// probe-evac-miss-20261015.js — why didn't the evac fire for s22 d134 (gap1
// feed, predecessor dead at Haven, successor dead at Haven next day)?
// Logs the layer's scan inputs/decisions around the death days.
//
// FINDING (2026-10-15): the death-tile CHANNEL design was ordering-broken —
// the sweep merged ctx._seDeathTiles only in the daily instrument, but the
// layer scans in upkeep too; a death first seen at an upkeep (seen=true)
// never got its tile, so atHaven=false and the window never opened. Fixed by
// stamping ev.tile on the telemetry record itself (sweep tele wrap); this
// probe is retained as documentation of the bug.
'use strict';
process.env.FOURTHLINK = '1';
process.env.SUCCEVAC = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { succevac } = require('./policies/succevac');

async function main() {
  const seed = parseInt(process.env.SEEDS || '22', 10);
  const { Game } = await loadGame({ seed, mode: 'evac-miss-probe', fullTelemetry: true });
  await setupGame(Game);
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const deathTiles = {};
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    try { deathTiles[String(this.villagerId) + ':' + gday()] = this.map ? [this.map.px, this.map.py] : null; }
    catch (e) {}
    return origPD.apply(this, arguments);
  };
  const base = succevac;
  const origDaily = base.daily;
  const policy = Object.assign({}, base, { id: base.id + '+missprobe' });
  const out = [];
  policy.daily = (G, ctx) => {
    try {
      ctx._seDeathTiles = ctx._seDeathTiles || {};
      for (const k of Object.keys(deathTiles)) if (!ctx._seDeathTiles[k]) ctx._seDeathTiles[k] = deathTiles[k];
    } catch (e) {}
    const d = gday();
    if (d >= 133 && d <= 137) {
      const st = G.map ? [G.map.px, G.map.py] : null;
      out.push(`daily d${d}: scholar=${String(G.villagerId).slice(0,14)} tile=${JSON.stringify(st)} ` +
        `evacUntil=${ctx._seEvacUntil||0} inCombat=${!!(G.tbfight && !G.tbfight.over)}`);
      const tele = (G.state.telemetry || []).filter(e => e.type === 'death' && e.player && e.day >= 133 && e.day <= 136);
      for (const e of tele) {
        const tile = (ctx._seDeathTiles || {})[e.who + ':' + e.day];
        out.push(`   tele death: ${String(e.who).slice(0,14)} d${e.day} cause=${e.cause} tile=${JSON.stringify(tile)} seen=${!!(ctx._seSeen||{})[e.who+':'+e.day]}`);
      }
      out.push(`   scholarTile=${JSON.stringify(st)} haven=[4,4] evacWouldFire=${st && st[0]===4 && st[1]===4 && (ctx._seEvacUntil||0) >= d}`);
    }
    return origDaily(G, ctx);
  };
  await quietLog(() => runDays(Game, policy, { days: 140, sampleEvery: 10 }));
  for (const l of out) console.log(l);
  console.log('done');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
