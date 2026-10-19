#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('coalition-grid');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const C = globalThis.Scattering.combat, open = () => false;
  T.ok('default helpers keep the ordinary nine-cell boundary', !C.inGrid(9, 8) && C.inGrid(8, 8));
  T.ok('explicit titan grid includes outer cells and rejects edge overflow', C.inGrid(11, 11, 11) && !C.inGrid(12, 11, 11));
  const step = C.stepToward(9, 10, 11, 10, open, null, 11);
  T.ok('ally can close through outer titan columns', step && step.x === 10);
  const away = C.stepAway(10, 10, 9, 10, open, null, 11);
  T.ok('retreat can use outer titan columns', away && away.x === 11);
  const a = { key: 'a', kind: 'ally', name: 'Volunteer', mx: 9, my: 10, speed: 1, ai: 'brave', alive: true, hp: 100, maxHp: 100, wbonus: 10 };
  const m = { key: 'm', kind: 'monster', mx: 11, my: 10, alive: true, hp: 100, maxHp: 100 };
  const dec = C.villagerDecide(a, [a, m], open, null, null, 11);
  T.ok('titan ally closes and attacks instead of standing beyond old bounds', dec.moves.length === 1 && dec.moves[0][0] === 10 && dec.action.type === 'strike');
  // Prepared clear arena; the runtime call must supply its live grid size.
  G.tbfight = { gridSize: 12, fighters: [a, m], terrain: Array.from({ length: 12 }, () => Array(12).fill('grass')), round: 1, zones: [], order: ['a', 'm'] };
  const hp = m.hp;
  G.tbVillagerTurn(a);
  T.ok('real villager-turn caller moves and lands a strike in outer cells', a.mx === 10 && m.hp < hp);
  const flyer = G.tbAirStepToward({ mx: 9, my: 10 }, 11, 10, new Set());
  T.ok('real flying movement caller uses current grid too', flyer && flyer.x === 10);
  const ground = G.tbStepAway({ mx: 10, my: 10 }, 9, 10, open, new Set());
  T.ok('real retreat caller uses current grid too', ground && ground.x === 11);
  G.tbfight.gridSize = 9;
  T.ok('runtime nine-cell movement still rejects outer cells', !G.tbAirStepToward({ mx: 8, my: 4 }, 10, 4, new Set()));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
