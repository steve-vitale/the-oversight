#!/usr/bin/env node
// probe-witnesource-books-20261017.js — what "rounding errors" exist on the
// modal road? Dumps takes/gives bookkeeping, promises, hoarding at day 90.
// READ-ONLY.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.TAKESEAT = '1';
process.env.MODALPLAY = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadmodalplay, belongmodalplay } = require('./policies/modalplay');

const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9101, 9102];

function nameOf(Game, id) { try { return (Game.displayName(id) || id).split(' ')[0]; } catch (e) { return id; } }

async function probe(seed, road) {
  const policy = road === 'leadfeast' ? leadmodalplay : belongmodalplay;
  const { Game } = await loadGame({ seed, mode: `witnesource-books-${road}` });
  await setupGame(Game);
  await quietLog(() => runDays(Game, policy, { days: 120 }));
  const v = Game.state.village || {};
  const takes = v.takes || {}, gives = v.gives || {};
  const ids = Object.keys(Object.assign({}, takes, gives));
  const rows = ids.map(id => ({
    id, name: nameOf(Game, id),
    takes: Math.round(takes[id] || 0), gives: Math.round(gives[id] || 0),
    net: Math.round((takes[id] || 0) - (gives[id] || 0)),
  })).sort((a, b) => b.net - a.net);
  let ledger = {};
  try { ledger = Game.ledger() || {}; } catch (e) {}
  let promises = null;
  try { promises = Game.podWitnessMaterial ? Game.podWitnessMaterial().length : 'n/a'; } catch (e) { promises = 'err'; }
  return {
    seed, road, won: !!Game.won,
    top: rows.slice(0, 6), bottom: rows.slice(-3),
    nVillagers: ids.length,
    foodHoarded: ledger.foodHoarded | 0, foodShared: ledger.foodShared | 0,
    podWitnessLines: promises,
  };
}

(async () => {
  for (const seed of SEEDS) for (const road of ['leadfeast', 'belongfeast']) {
    const r = await probe(seed, road);
    console.log(`seed ${seed} ${road} won=${r.won} villagers=${r.nVillagers} hoarded=${r.foodHoarded} shared=${r.foodShared} podWitness=${r.podWitnessLines}`);
    for (const t of r.top) console.log(`   ${t.name}: takes=${t.takes} gives=${t.gives} net=${t.net}`);
    console.log('   ...');
    for (const t of r.bottom) console.log(`   ${t.name}: takes=${t.takes} gives=${t.gives} net=${t.net}`);
  }
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
