#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('finale-counter-access');
const { sigButtons, SIG_PREF } = require('./policies/capable');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const m = K.fight(G, 'speedbump_turtle', { px: 3, py: 4, mx: 4, my: 4 }), f = G.tbfight, p = G.tbFighter('p');
  // Prepared counter arena, not a played campaign or earned-spoil claim.
  m.mdef = G.data.monsters.find(d => d.id === 'finale'); m.monsterId = 'finale';
  f.order = ['p', m.key]; f.turnIdx = 0;
  f.fiCrewSpoils = { redpen: 1, script: 1, badnote: 1 };
  f.fiSkyArmed = [{ x: 3, y: 3, radius: 1 }]; m.fiCountdown = 3;
  let actions = 0; G.tbAfterPlayerAction = () => { actions++; };
  const buttons = () => sigButtons(G, f, p, [m], { notes: [] });
  for (const key of ['tbFiRedPen', 'tbFiLeakedScript', 'tbFiBadNote']) {
    T.ok('parser exposes actual phone button ' + key, buttons().some(b => b.key === key));
    T.ok('ordinary capable policy has a one-use preference for ' + key, SIG_PREF[key] && SIG_PREF[key][1] === 1);
  }
  const pen = buttons().find(b => b.key === 'tbFiRedPen');
  T.ok('parsed Red Pen cancels actual armed sky and consumes earned use', !!pen && pen.call() && !f.fiSkyArmed.length && f.fiCrewSpoils.redpen === 0 && p.acted);
  T.ok('acted player cannot use another parsed crew button', !buttons().some(b => b.key.startsWith('tbFi')));
  p.acted = false;
  const script = buttons().find(b => b.key === 'tbFiLeakedScript'), countdown = m.fiCountdown;
  T.ok('parsed Script extends actual countdown at a one-use cost', !!script && script.call() && m.fiCountdown === countdown + 1 && f.fiCrewSpoils.script === 0 && p.acted);
  p.acted = false;
  const note = buttons().find(b => b.key === 'tbFiBadNote');
  T.ok('parsed Bad Note applies real two-round vulnerability and is consumed', !!note && note.call() && m.fiNoteVuln === 2 && f.fiCrewSpoils.badnote === 0 && p.acted);
  T.ok('three crew actions reach the real action-completion caller', actions === 3);
  p.acted = false; m.fiCountdown = 3;
  G.state.scholar.inventory = [{ itemId: 'stone_knife', units: 0 }];
  T.ok('empty stack cannot satisfy hunger or spend the action', !G.tbFiSacrifice('item') && m.fiCountdown === 3 && !p.acted);
  p.acted = false; m.fiCountdown = 3;
  const zero = { itemId: 'stone_knife', units: 0 }, live = { itemId: 'stone_knife', units: 2 };
  const inv = G.state.scholar.inventory = [zero, live];
  T.ok('duplicate exhausted ID cannot mask the positive-stack cost', G.tbFiSacrifice('item') && live.units === 1 && inv.includes(zero) && m.fiCountdown === null && p.acted);
  p.acted = false; m.fiCountdown = 3;
  const ghost = { name: 'Empty meal', units: 0 }, meal = { name: 'Actual meal', units: 2, kcalEach: 1000 };
  G.state.scholar.inventory = [ghost, meal];
  T.ok('ID-less food pays from the exact positive stack', G.tbFiSacrifice('item') && meal.units === 1 && ghost.units === 0);
  p.acted = false; m.fiCountdown = 3;
  const single = { itemId: 'stone_knife' };
  G.state.scholar.inventory = [single];
  T.ok('legacy missing units still means one item and removes it', G.tbFiSacrifice('item') && G.state.scholar.inventory.length === 0);
  p.acted = false; m.fiCountdown = 3; m.fiEncore = true; G.state.scholar.kcal = 2000;
  T.ok('encore still refuses memory without spending food or action', !G.tbFiSacrifice('memory') && G.state.scholar.kcal === 2000 && !p.acted && m.fiCountdown === 3);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
