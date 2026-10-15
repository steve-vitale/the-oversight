// test-ledger-accused-case-20261014.js — the ledger.js resolveCase wrap
// credited exposed/unified/brokerage by outcome even when the PLAYER was the
// accused: being exiled or paying weregild for your own crime counted as
// exposure/brokerage work. Skip those credits when the player is accused.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('ledger-accused-case');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  Game.say = () => {}; Game.sysSay = () => {};
  const me = Game.villagerId;
  const npcs = (Game.state.village.roster || []).filter(id => id !== me);
  const L = Game.ledger();
  const snap = () => ({ b: L.brokerage, u: L.unified, e: L.exposed });
  const mkCase = (id, accused, role) => ({
    id, plotId: null, charge: 'theft', day: 1, accused, target: npcs[2], accuser: npcs[2],
    belief: {}, evidence: [], bribes: [], exposedBribes: [], foundBribes: [], inconsistencies: [],
    status: 'open', playerRole: role,
  });

  // player accused → weregild
  const c1 = Game.openPlayerCase(npcs[0], 'assault', [], false);
  let s0 = snap();
  Game.resolveCase(c1.id, 'weregild');
  let s1 = snap();
  T.ok('own weregild: no brokerage/unified credit', s1.b === s0.b && s1.u === s0.u, JSON.stringify([s0, s1]));

  // villager accused (player a bystander) → weregild still credits
  const bs = Game.betrayalState();
  bs.cases.push(mkCase('case_t2', [npcs[1]], 'witness'));
  s0 = snap();
  Game.resolveCase('case_t2', 'weregild');
  s1 = snap();
  T.ok('villager weregild still credits brokerage+unified', s1.b === s0.b + 2 && s1.u === s0.u + 1, JSON.stringify([s0, s1]));

  // player accused → exile: no exposed/unified credit
  bs.cases.push(mkCase('case_t3', [me], 'accused'));
  s0 = snap();
  Game.exilePlayer = () => {}; // keep the run alive; only the ledger is under test
  Game.resolveCase('case_t3', 'exile');
  s1 = snap();
  T.ok('own exile: no exposed/unified credit', s1.e === s0.e && s1.u === s0.u, JSON.stringify([s0, s1]));
  T.done();
})();
