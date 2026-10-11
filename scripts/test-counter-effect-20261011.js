#!/usr/bin/env node
// test-counter-effect-20261011.js — does performing a monster's counter trick
// change the fight outcome? (moderator: 'wait'; gallowdeer: 'move_windup')
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function duel(mid, playFn, seed) {
  const { Game } = await loadGame({ seed, mode: 'test' });
  await setupGame(Game);
  Game.state.scholar.health = 100;
  Game.startCombat(mid);
  let rounds = 0;
  const endTurn = () => {
    try {
      if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
        const p = Game.tbFighter('p');
        if (p) { p.moveLeft = 0; p.acted = true; }
        Game.tbAfterPlayerAction();
      }
    } catch (e) {}
  };
  while (Game.tbfight && !Game.tbfight.over && rounds++ < 60) {
    if (Game.tbIsPlayerTurn()) {
      if (!playFn(Game)) break;
      endTurn();
    } else break;
  }
  const p = Game.tbFighter ? Game.tbFighter('p') : null;
  return { result: Game.tbfight && Game.tbfight.result, rounds, php: p ? Math.round(p.hp || 0) : null };
}

const strikeAll = (Game) => {
  const tgt = Game.tbfight.fighters.find(x => x.kind === 'monster' && (x.hp || 0) > 0);
  if (!tgt) return false;
  Game.tbPlayerStrike(tgt.key);
  return true;
};
const waitAll = (Game) => { Game.tbPlayerWait(); return true; };

(async () => {
  for (const mid of ['moderator', 'gallowdeer']) {
    const s = { w: 0, l: 0, r: 0 }, w = { w: 0, l: 0, r: 0 };
    for (let seed = 1; seed <= 10; seed++) {
      const a = await duel(mid, strikeAll, seed);
      const b = await duel(mid, waitAll, seed + 100);
      if (a.result === 'won' || a.result === 'routed') s.w++; else if (a.result === 'lost') s.l++; else s.r++;
      if (b.result === 'won' || b.result === 'routed') w.w++; else if (b.result === 'lost') w.l++; else w.r++;
    }
    console.log(`${mid}: strike-always -> W${s.w}/L${s.l}/R${s.r} | wait-always -> W${w.w}/L${w.l}/R${w.r}`);
  }
})();
