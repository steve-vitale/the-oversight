#!/usr/bin/env node
// matbank2-diag-20261014.js — one-seed diagnostic: does the thicket pull
// actually put vine in the pack? Instruments doAction('forage') to record
// tile type and vine/stick deltas per forage trip.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

const SEED = parseInt(process.env.SEED || '88', 10);
const DAYS = parseInt(process.env.DAYS || '80', 10);

function mats(Game, m) {
  return ((Game.state.scholar || {}).inventory || [])
    .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'matbank2-diag' });
  await setupGame(Game);
  const byTile = {};
  const _doAction = Game.doAction.bind(Game);
  Game.doAction = function (a, o) {
    if (a !== 'forage') return _doAction.apply(this, arguments);
    const v0 = mats(Game, 'vine'), s0 = mats(Game, 'stick');
    let tt = '?';
    try { const t = Game.tileAt(Game.map.px, Game.map.py); tt = t ? t.type : '?'; } catch (e) {}
    const r = _doAction.apply(this, arguments);
    const dv = mats(Game, 'vine') - v0, ds = mats(Game, 'stick') - s0;
    const e = byTile[tt] || (byTile[tt] = { trips: 0, vine: 0, stick: 0 });
    e.trips++; e.vine += dv; e.stick += ds;
    return r;
  };
  const policy = Object.assign({}, leadcourt);
  await runDays(Game, policy, { days: DAYS, manifest: { seed: SEED, policy: 'leadcourt' } });
  console.log(`MATBANK2=${process.env.MATBANK2 === '1' ? '1' : 'off'} seed=${SEED} days=${DAYS}`);
  console.log('tile-type -> trips, total vine gained, total stick gained, vine/trip, stick/trip');
  for (const [t, e] of Object.entries(byTile).sort((a, b) => b[1].trips - a[1].trips)) {
    console.log(` ${t}: trips=${e.trips} vine=${e.vine} stick=${e.stick} v/t=${(e.vine / e.trips).toFixed(2)} s/t=${(e.stick / e.trips).toFixed(2)}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
