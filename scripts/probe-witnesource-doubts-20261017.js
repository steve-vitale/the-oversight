#!/usr/bin/env node
// probe-witnesource-doubts-20261017.js — do truth-doubts form on the modal
// road? (substrate for confrontation->confession->exposure). READ-ONLY.
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
  const { Game } = await loadGame({ seed, mode: `witnesource-doubts-${road}` });
  await setupGame(Game);
  await quietLog(() => runDays(Game, policy, { days: 120 }));
  let doubts = [];
  try {
    const ids = Game.npcIds ? Game.npcIds() : [];
    for (const id of ids) {
      const ds = Game.getDoubts ? Game.getDoubts(id, true) : [];
      for (const d of ds) doubts.push({ who: nameOf(Game, id), kind: d.kind, resolved: !!d.resolved, text: String(d.text || '').slice(0, 80) });
    }
  } catch (e) { doubts = [{ err: String(e).slice(0, 100) }]; }
  return { seed, road, won: !!Game.won, nDoubts: doubts.length, doubts: doubts.slice(0, 12) };
}

(async () => {
  for (const seed of SEEDS) for (const road of ['leadfeast', 'belongfeast']) {
    const r = await probe(seed, road);
    console.log(`seed ${seed} ${road} won=${r.won} doubts=${r.nDoubts}`);
    for (const d of r.doubts) console.log(`   ${d.who} [${d.kind}] resolved=${d.resolved}: ${d.text}`);
  }
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
