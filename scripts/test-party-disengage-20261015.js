#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('party-disengage');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  // Observe the real end-check decision without invoking rewards/death flows.
  let ended = null;
  G.tbEnd = result => { ended = result; G.tbfight.over = true; };
  const run = (options = {}) => {
    ended = null; G._pendingPack = options.pack || null;
    const p = { key: 'p', kind: 'player', alive: true, hp: 100, mx: 0, my: 0, ...options.player };
    const m = { key: 'm', kind: 'monster', alive: true, hp: 100, mx: 7, my: 7,
      mdef: { size: 1, follows: false, attack: { pattern: { type: 'burst', radius: 1 } } }, ...options.monster };
    G.tbfight = { fighters: [p, m, ...(options.party || [])], round: 1 };
    G.tbEndCheck();
    return ended;
  };
  const ally = { key: 'a', kind: 'ally', alive: true, hp: 100, mx: 6, my: 7 };
  T.ok('living nearby ally holds the fight while bearer stands back', run({ party: [ally] }) === null);
  T.ok('ordinary villager also holds the fight', run({ party: [{ ...ally, kind: 'villager' }] }) === null);
  T.ok('dead ally cannot hold the fight', run({ party: [{ ...ally, alive: false }] }) === 'routed');
  T.ok('fled ally cannot hold the fight', run({ party: [{ ...ally, fled: true }] }) === 'routed');
  T.ok('zero-HP ally is reconciled before disengagement', run({ party: [{ ...ally, hp: 0 }] }) === 'routed');
  T.ok('whole monster body counts at the far corner', run({ party: [{ ...ally, mx: 10, my: 10 }], monster: { mdef: { size: 2, follows: false, attack: { pattern: { type: 'burst', radius: 1 } } } } }) === null);
  T.ok('everyone walking clear still ends a non-chasing fight', run() === 'routed');
  T.ok('chaser still holds the fight at distance', run({ monster: { mdef: { follows: true } } }) === null);
  T.ok('committed telegraph still holds the fight', run({ monster: { telegraph: { ticks: 1 } } }) === null);
  T.ok('long-range beam still holds the fight', run({ monster: { mdef: { follows: false, attack: { pattern: { type: 'beam', length: 9 } } } } }) === null);
  T.ok('explicit bearer escape still ends the fight', run({ player: { fled: true }, party: [ally] }) === 'fled');
  T.ok('incoming chorus prevents an empty field from resolving', run({ monster: { alive: false }, pack: { count: 1 } }) === null);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
