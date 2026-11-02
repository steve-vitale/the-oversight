#!/usr/bin/env node
// test-skill-lesson-diegetic-r86.js -- journey-deepening r86 proof.
// A skill-lesson outcome line is a DIEGETIC ACT, not flavor: the lesson
// already fired (teachSkill recorded, trust bumped, ticks spent) before
// the line is emitted through sayLine, so the run-ledger anti-parrot
// block must not replace it with the dry deflection.
// Transcript-caught on the r86 panel: seed 42254 day 80, Stella is taught
// Bark armor (teachLessons records day-80 bark_armor 'learned'), but the
// spoken line is "...Sorry, lost my train of thought." — because Oliver
// was taught the identical Bark armor line on day 60 and the run ledger
// blocked the repeat. Same seam class as the invite_party fix (r54-r56
// dropped-request seam, conversation.js: the comment there says teach
// "ride[s] different handlers and [was] not touched here").
// Fix: convoTurn emits skill_learn:/skill_teach: turns with
// { diegeticAct: true }, like invite_party. Game logic already guards
// true repeats (one lesson per learner per day, skillLessonDone).
// RED verified pre-fix (T2 fails with the dry line); GREEN post-fix.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}
const isDefl = (Game, t) => { try { return !!Game.convoIsDeflectionLine(t); } catch (e) { return false; } };
const lastNpc = (Game, vid) => {
  const tr = (Game.convoGet(vid).transcript || []).filter(e => e.who !== 'you');
  return tr.length ? String(tr[tr.length - 1].text || '') : '';
};
const TEACH_LINE = /You walk them through Bark armor/;

(async () => {
  const { Game } = await loadGame({ seed: 7772, mode: 'test-skill-lesson-diegetic-r86' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const me = Game.villagerId;
  const vids = (Game.state.village.roster || []).filter(id => id !== me);
  const [v1, v2, v3] = vids;
  // Player knows the Bark armor materials (L2), both learners lack them.
  Game.grantKnowledge('recipe', 'bark_armor', 2, { type: 'test' });
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[v1] = 90;
  Game.state.village.trust[v2] = 90;
  const chk1 = Game.canTeachSkill('player', v1, 'bark_armor');
  const chk2 = Game.canTeachSkill('player', v2, 'bark_armor');
  ok('setup: player can teach bark_armor to both villagers', chk1.ok && chk2.ok,
    `v1=${JSON.stringify(chk1)} v2=${JSON.stringify(chk2)}`);

  // T1: first teach speaks the lesson line honestly.
  Game.startConvo(v1);
  Game.convoTurn(v1, 'skill_teach:bark_armor');
  const L1 = lastNpc(Game, v1);
  ok('T1 first teach line honest', TEACH_LINE.test(L1) && !isDefl(Game, L1), 'got: ' + L1.slice(0, 80));
  Game.endConvo(v1, 'left');

  // T2: second teach (different villager, same skill, same run window)
  // must NOT be run-ledger-blocked into a deflection — the lesson lands
  // either way, so the line must say what happened.
  Game.startConvo(v2);
  Game.convoTurn(v2, 'skill_teach:bark_armor');
  const L2 = lastNpc(Game, v2);
  ok('T2 second teach line honest, not deflection', TEACH_LINE.test(L2) && !isDefl(Game, L2), 'got: ' + L2.slice(0, 80));
  const lessons = (Game.state.village.skillLessons || []).filter(l => l.skill === 'bark_armor');
  ok('T2 lesson recorded for both learners', lessons.length >= 2, 'lessons: ' + JSON.stringify(lessons));
  Game.endConvo(v2, 'left');

  // T3 control: a non-diegetic fixed line in the run ledger still blocks.
  Game.startConvo(v3);
  const fixed = '"The river took the south bridge in the night."';
  Game.sayLine(v3, fixed, {});
  Game.endConvo(v3, 'left');
  Game.startConvo(v1);
  const out = Game.sayLine(v1, fixed, {});
  ok('T3 control: ordinary fixed line still run-blocks', !!out && isDefl(Game, out), 'got: ' + String(out).slice(0, 80));
  Game.endConvo(v1, 'left');

  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
