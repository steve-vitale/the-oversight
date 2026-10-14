// test-moot-juror-trust-20261014.js — the player's own trial reads earned
// trust. initPlayerCaseBelief used trustInPlayer() = v.trust[playerId], a
// slot seeded at 15 that ordinary play never moves; per-villager trust in the
// player lives in v.trust[vid]. Each juror's starting belief must use THAT
// juror's trust, and trustInPlayer() must track the roster.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('moot-juror-trust');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== me);
  T.ok('roster has at least 3 villagers', npcs.length >= 3, String(npcs.length));
  const [accuser, hi, lo] = npcs;
  const others = npcs.slice(3);
  for (const id of others) v.trust[id] = 10;
  v.trust[accuser] = 10;

  function beliefOf(vid) {
    const c = { accuser, charge: 'assault', belief: {} };
    Game.initPlayerCaseBelief(c);
    return c.belief[vid];
  }
  // same juror, two trust levels: isolates trust from pairAffinity
  v.trust[hi] = 80; const bHigh = beliefOf(hi);
  v.trust[hi] = 5;  const bLow = beliefOf(hi);
  T.ok('a juror who trusts you starts more favorable than when they don\'t', bHigh > bLow, `trust80=${bHigh} trust5=${bLow}`);

  // across jurors in one case
  v.trust[hi] = 80; v.trust[lo] = 5;
  const c = { accuser, charge: 'assault', belief: {} };
  Game.initPlayerCaseBelief(c);
  const adj = (vid) => c.belief[vid] + Game.pairAffinity(vid, accuser) * 0.5 - Game.pairAffinity(vid, me) * 0.4;
  T.ok('high-trust juror leans acquit vs low-trust juror (affinity-adjusted)', adj(hi) > adj(lo), `hi=${c.belief[hi]} lo=${c.belief[lo]}`);

  // aggregate tracks the roster, not the dead player slot
  for (const id of npcs) v.trust[id] = 60;
  v.trust[me] = 15;
  T.ok('trustInPlayer follows earned roster trust', Math.round(Game.trustInPlayer()) === 60, `trustInPlayer=${Game.trustInPlayer()}`);
  T.done();
})();
