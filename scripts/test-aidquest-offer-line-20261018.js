#!/usr/bin/env node
// Proof test: the System's aid-quest offer must not leak code calls.
// RED (before fix): sysSay emitted
//   '(Aid quest: WHAT IS GREEN — identify 2 new plants (18 known now)
//    Take it: answerAidQuest("accept"). Refuse it: answerAidQuest("refuse").)'
// — a function call as the player's instruction (safetynets.js:262).
// GREEN (after fix): the line names the quest, states the need, and points
//   the player at the offer card — zero 'answerAidQuest(' in the stream.
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game);

  // capture sysSay exactly like the journey harness does (loadGame silences it)
  const said = [];
  Game.sysSay = function (t) { said.push(String(t == null ? '' : t)); };

  // stage the struggle gate: System arrived, mid-window day, hungry village
  Game.state.systemArrived = true;
  Game.state.scholar.day = 10;
  const v = Game.state.village;
  v.pantry = [];                 // empty pantry -> struggling
  try { Game.state.scholar.kcal = 200; } catch (e) {}

  const q = Game.offerAidQuest();
  console.log('quest offered:', q ? q.title : null);

  const stream = said.join('\n');
  const leaks = said.filter(t => /answerAidQuest\s*\(/.test(t));
  const namesQuest = q && stream.includes(q.title);
  const namesCard = /offer card/i.test(stream);

  console.log('sysSay lines:', said.length);
  console.log('leak lines:', leaks.length, leaks.length ? JSON.stringify(leaks[0]) : '');
  console.log('names the quest:', !!namesQuest, '| points at offer card:', namesCard);

  const ok = !!q && leaks.length === 0 && namesQuest && namesCard;
  console.log(ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('ERROR', e); process.exit(2); });
