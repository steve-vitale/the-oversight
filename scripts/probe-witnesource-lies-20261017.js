#!/usr/bin/env node
// probe-witnesource-lies-20261017.js — how many lies exist per run? (npcLies
// census). If lies are common but namings rare, the agency (naming) is the
// lever, not the lies. READ-ONLY.
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
  const { Game } = await loadGame({ seed, mode: `witnesource-lies-${road}` });
  await setupGame(Game);
  await quietLog(() => runDays(Game, policy, { days: 120 }));
  let lies = [];
  try {
    for (const id of (Game.npcIds ? Game.npcIds() : [])) {
      const l = Game.npcLies ? Game.npcLies(id) : null;
      if (!l) continue;
      for (const f of ['occupation', 'origin', 'goal']) {
        if (l[f] && !l[f].confessed) lies.push({ who: nameOf(Game, id), field: f, told: l[f].told, truth: l[f].truth });
      }
    }
  } catch (e) { lies = [{ err: String(e).slice(0, 80) }]; }
  return { seed, road, nLies: lies.length, lies: lies.slice(0, 8) };
}

(async () => {
  for (const seed of SEEDS) for (const road of ['leadfeast', 'belongfeast']) {
    const r = await probe(seed, road);
    console.log(`seed ${seed} ${road} unconfessed-lies=${r.nLies}`);
    for (const l of r.lies) console.log(`   ${l.who}: ${l.field} told="${l.told}" truth="${l.truth}"`);
  }
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
