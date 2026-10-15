#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('peace-turn');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  K.giveAbility(G, 'peacemaker', { force: true });
  G.state.scholar.kcal = 4000;
  K.fight(G, 'bulldozer', { px: 4, py: 4, mx: 5, my: 4, hp: 100 });
  const f = G.tbfight, p = G.tbFighter('p');
  p.acted = false;
  T.ok('peace action is owned and declares a combat turn', G.hasAbility('peacemaker') && G.data.abilities.find(a => a.id === 'peacemaker').actions.find(a => a.id === 'walk_in').cost.turn === true);
  const original = Math.random;
  let used;
  try { Math.random = () => 0; used = G.useAbility('peacemaker', 'walk_in'); }
  finally { Math.random = original; }
  T.ok('actual peace action ends the real contact', used === true && (!G.tbfight || G.tbfight.over) && f.fighters.filter(x => x.kind === 'monster').every(x => x.fled));
  T.ok('the original actor retains the declared spent-turn marker', p.acted === true);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
