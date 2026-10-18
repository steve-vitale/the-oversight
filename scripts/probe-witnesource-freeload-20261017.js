#!/usr/bin/env node
// probe-witnesource-freeload-20261017.js — does the freeloader pipeline ever
// fire on the modal road? Dumps v.freeload stages + takeRate7/giveRate7.
// READ-ONLY.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.TAKESEAT = '1';
process.env.MODALPLAY = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadmodalplay, belongmodalplay } = require('./policies/modalplay');

const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9101, 9102, 9103];

function nameOf(Game, id) { try { return (Game.displayName(id) || id).split(' ')[0]; } catch (e) { return id; } }

async function probe(seed, road) {
  const policy = road === 'leadfeast' ? leadmodalplay : belongmodalplay;
  const { Game } = await loadGame({ seed, mode: `witnesource-freeload-${road}` });
  await setupGame(Game);
  await quietLog(() => runDays(Game, policy, { days: 120 }));
  const v = Game.state.village || {};
  const fl = v.freeload || {};
  const rows = Object.keys(fl).map(id => {
    let net7 = '?';
    try { net7 = Math.round(Game.takeRate7(id) - Game.giveRate7(id)); } catch (e) {}
    return { name: nameOf(Game, id), days: fl[id].days, stage: fl[id].stage, net7 };
  }).filter(r => r.days > 0 || r.stage > 0);
  return { seed, road, won: !!Game.won, fired: rows };
}

(async () => {
  for (const seed of SEEDS) for (const road of ['leadfeast', 'belongfeast']) {
    const r = await probe(seed, road);
    console.log(`seed ${seed} ${road} won=${r.won} freeloaders-ever-flagged=${r.fired.length}`);
    for (const f of r.fired) console.log(`   ${f.name}: days=${f.days} stage=${f.stage} net7=${f.net7}`);
  }
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
