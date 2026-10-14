#!/usr/bin/env node
// probe4-ledgerpenalty-20261014.js — WHO is taking from the pantry on armed?
// Wraps takeFromPantry/takeFromPantryBulk, logs stack snippet for first few
// takes after day 25 (when control froze but armed continues).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');

async function main() {
  const { Game } = await loadGame({ seed: 11, mode: 'ledgerpenalty-probe4' });
  await setupGame(Game);
  let logged = 0;
  for (const fn of ['takeFromPantry', 'takeFromPantryBulk']) {
    const real = Game[fn];
    Game[fn] = function () {
      const d = (Game.state.scholar || {}).day || 0;
      if (d >= 25 && logged < 6) {
        logged++;
        const stack = (new Error().stack || '').split('\n').slice(2, 7).join(' <- ');
        console.log(`d${d} ${fn} called. stack: ${stack}`);
      }
      return real.apply(this, arguments);
    };
  }
  const base = belongseek;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const r = await runDays(Game, policy, { days: 35, sampleEvery: 1 });
  console.log('done days=' + r.days);
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
