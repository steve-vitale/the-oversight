#!/usr/bin/env node
// test-crisis-question-gate-20261013.js — CRISIS LEG r9 blank fill.
// A villager in crisis (severity>=2 sickness, starving) must not ask
// small-talk nostalgia questions (q_fun, q_first_memory, q_laugh,
// q_laugh_memory): doubled up with gut cramps and asking "What did you do
// for fun? Before." is tonally senseless (r8 open blank).
// RED-verified on pristine master before the fix; must go GREEN after.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261013', 10);
Math.random = mulberry32(SEED);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;

const SMALL = ['q_fun', 'q_first_memory', 'q_laugh', 'q_laugh_memory'];
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('ok   - ' + name); }
  else { fail++; console.log('FAIL - ' + name); }
}

(async () => {
  const Game = globalThis.Scattering.Game;
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.state.scholar.kcal = 50000;
  const ids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const sick = ids[0], starving = ids[1] || ids[0], healthy = ids[2] || ids[0];
  // crisis setup
  const v = Game.state.village;
  v.sick = v.sick || {};
  v.sick[sick] = { name: 'gut rot', daysLeft: 4, severity: 2 };
  try { Game.npcNeeds(starving).hunger = 90; } catch (e) {}
  try { Game.npcNeeds(healthy).hunger = 10; } catch (e) {}
  v.trust = v.trust || {};
  v.trust[sick] = 30; v.trust[starving] = 30; v.trust[healthy] = 30;

  const cg = (Game.data.characterGen || {}).convo || {};
  const qdef = (id) => (cg.questions || []).find(q => q.id === id);
  const mood = (vid) => { try { return Game.npcMood(vid); } catch (e) { return 'steady'; } };

  // 1. the four small-talk questions are tagged in data
  for (const id of SMALL) {
    const q = qdef(id);
    check('data: ' + id + ' tagged smallTalk', !!(q && q.smallTalk));
  }
  // 2. a healthy villager may still ask them
  for (const id of SMALL) {
    const q = qdef(id);
    const ok = q ? Game.convoQuestionOk(q, 30, mood(healthy), healthy) : false;
    check('healthy may ask ' + id, ok === true);
  }
  // 3. a severity-2 sick villager may NOT ask them
  for (const id of SMALL) {
    const q = qdef(id);
    const ok = q ? Game.convoQuestionOk(q, 30, mood(sick), sick) : true;
    check('severity-2 sick does NOT ask ' + id, ok === false);
  }
  // 4. a starving villager may NOT ask them
  for (const id of SMALL) {
    const q = qdef(id);
    const ok = q ? Game.convoQuestionOk(q, 30, mood(starving), starving) : true;
    check('starving does NOT ask ' + id, ok === false);
  }
  // 5. non-small-talk questions still pass for a sick villager (the gate is narrow)
  const qPlan = qdef('q_plan');
  check('sick may still ask q_plan', qPlan ? Game.convoQuestionOk(qPlan, 30, mood(sick), sick) === true : false);
  // 6. trust gate still applies (healthy, trust too low)
  const qf = qdef('q_fun');
  check('trust gate intact (q_fun minTrust 10, trust 5)', qf ? Game.convoQuestionOk(qf, 5, mood(healthy), healthy) === false : false);
  // 7. backward compat: no vid arg behaves as before (no crisis info -> allowed)
  check('no-vid call still allows q_fun', qf ? Game.convoQuestionOk(qf, 30, mood(healthy)) === true : false);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
