#!/usr/bin/env node
// probe-witnesource-gossip-20261017.js — how often do villagers name lies?
// Counts npcGossipAbout contradictsLie:true returns on the modal road.
// READ-ONLY.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.TAKESEAT = '1';
process.env.MODALPLAY = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadmodalplay, belongmodalplay } = require('./policies/modalplay');

const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9101, 9102, 9103, 9104];

function nameOf(Game, id) { try { return (Game.displayName(id) || id).split(' ')[0]; } catch (e) { return id; } }

async function probe(seed, road) {
  const policy = road === 'leadfeast' ? leadmodalplay : belongmodalplay;
  const { Game } = await loadGame({ seed, mode: `witnesource-gossip-${road}` });
  await setupGame(Game);
  const hits = [];
  const _g = Game.npcGossipAbout;
  if (_g) Game.npcGossipAbout = function (teller, target) {
    const r = _g.apply(this, arguments);
    if (r && r.contradictsLie) {
      hits.push({
        day: (Game.state.scholar || {}).day || 0,
        teller: nameOf(Game, teller), target: nameOf(Game, r.target || target),
        field: r.field,
      });
    }
    return r;
  };
  await quietLog(() => runDays(Game, policy, { days: 120 }));
  return { seed, road, won: !!Game.won, nHits: hits.length, hits: hits.slice(0, 10) };
}

(async () => {
  let total = 0;
  for (const seed of SEEDS) for (const road of ['leadfeast', 'belongfeast']) {
    const r = await probe(seed, road);
    total += r.nHits;
    console.log(`seed ${seed} ${road} won=${r.won} lie-namings=${r.nHits}`);
    for (const h of r.hits) console.log(`   d${h.day}: ${h.teller} named ${h.target}'s ${h.field} lie`);
  }
  console.log('TOTAL lie-namings:', total);
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
