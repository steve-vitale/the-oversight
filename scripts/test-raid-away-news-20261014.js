// test-raid-away-news-20261014.js — havenRaidTick's away-news line read an
// undeclared `pillaged` (raids stopped pillaging at raid time when raiders
// started lingering). The ReferenceError was swallowed by the try, so a raid
// while the player was away never reached scholar.awayNews.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('raid-away-news');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  Game.say = () => {}; Game.sysSay = () => {};
  const v = Game.state.village;
  const mons = [0, 1, 2].map(i => ({ id: 'hushwolf', tx: 1 + i, ty: 1, hp: 20, maxHp: 20 }));
  Game.worldMonsters = () => mons;
  Game.pantryKcalLive = () => 5000;
  Game.playerAtHaven = () => false;
  Game.raiseAidCrisis = () => null;
  Game.resolveWildMonsterEncounter = () => {};
  Game.seedGossip = () => {};
  Game.tableActive = () => false;
  const sch = Game.state.scholar;
  sch.awayNews = [];
  let raided = false;
  for (let i = 0; i < 200 && !raided; i++) {
    v.lastRaidDay = -100;
    raided = Game.havenRaidTick();
  }
  T.ok('a raid fired (18% roll, retried)', raided);
  const news = (sch.awayNews || []).filter(n => /RAID at Haven/.test(n));
  T.ok('raid while away lands in awayNews', news.length === 1, JSON.stringify(sch.awayNews));
  T.done();
})();
