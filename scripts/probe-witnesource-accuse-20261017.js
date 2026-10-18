#!/usr/bin/env node
// probe-witnesource-accuse-20261017.js — full accusation-substrate census on
// the modal road: doubts by kind, theft memories, bribery rumors, gossip.
// READ-ONLY.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.TAKESEAT = '1';
process.env.MODALPLAY = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadmodalplay, belongmodalplay } = require('./policies/modalplay');

const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9101, 9102, 9103, 9104];

async function probe(seed, road) {
  const policy = road === 'leadfeast' ? leadmodalplay : belongmodalplay;
  const { Game } = await loadGame({ seed, mode: `witnesource-accuse-${road}` });
  await setupGame(Game);
  await quietLog(() => runDays(Game, policy, { days: 120 }));
  const byKind = {};
  let nDoubts = 0, nUnresolved = 0;
  try {
    for (const id of (Game.npcIds ? Game.npcIds() : [])) {
      for (const d of (Game.getDoubts ? Game.getDoubts(id, true) : [])) {
        nDoubts++;
        byKind[d.kind] = (byKind[d.kind] || 0) + 1;
        if (!d.resolved) nUnresolved++;
      }
    }
  } catch (e) {}
  // theft-related memories
  let theftMem = 0;
  try {
    const mem = (Game.state.village || {}).memories || {};
    for (const id of Object.keys(mem)) {
      for (const m of (mem[id] || [])) {
        if (/theft|stole|steal/i.test(String(m.text || '') + ' ' + String(m.kind || ''))) theftMem++;
      }
    }
  } catch (e) {}
  return { seed, road, won: !!Game.won, nDoubts, nUnresolved, byKind, theftMem };
}

(async () => {
  const agg = {};
  for (const seed of SEEDS) for (const road of ['leadfeast', 'belongfeast']) {
    const r = await probe(seed, road);
    console.log(`seed ${seed} ${road} won=${r.won} doubts=${r.nDoubts} unresolved=${r.nUnresolved} kinds=${JSON.stringify(r.byKind)} theftMem=${r.theftMem}`);
    for (const k of Object.keys(r.byKind)) agg[k] = (agg[k] || 0) + r.byKind[k];
  }
  console.log('AGG kinds:', JSON.stringify(agg));
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
