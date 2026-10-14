// test-villain-crime-20261014.js — a stranger's / psycho's crime is not the
// player's. recordCrime books crimes the PLAYER committed; hostile visitors
// (betrayal.js) and the psycho arc (corruption.js) pass `villain`, which used
// to land in the player's crime list (heat + provable moot charges).
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('villain-crime');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const j = Game.justiceState();
  j.crimes = [];
  const victim = (Game.state.village.roster || []).find(id => id !== Game.villagerId) || 'v_x';
  const heat0 = Game.justiceHeat();

  Game.recordCrime('theft', { villain: 'visitor_1', witnessed: true });
  Game.recordCrime('assault', { villain: 'visitor_1', victim, witnessed: true });
  T.ok('stranger crimes are not booked on the player', j.crimes.length === 0, JSON.stringify(j.crimes));
  T.ok('stranger theft adds no player heat', Game.justiceHeat() === heat0, `heat ${heat0} -> ${Game.justiceHeat()}`);

  Game.recordCrime('theft', { villain: Game.villagerId, victim, witnessed: true });
  T.ok('villain === player still books', j.crimes.length === 1);
  Game.dayPart = 'evening';
  Game.recordCrime('intimidation', { victim, witnessed: true });
  T.ok('plain player crime still books', j.crimes.length === 2);
  T.done();
})();
