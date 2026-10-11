#!/usr/bin/env node
// test-agency-teachv-sense-20261011.js — SENSE-READ for agency r2 lever
// (villager agency: HAVEN_CHORE 'teach' made real).
//
// Steve's SENSE-TESTING LAW: prove the teaching is SENSICAL, not just
// functional. This script stages the scene a player would witness: an
// explorer with earned lessons runs the teach chore at Haven while the
// village lives around them. Game.say is restored and CAPTURED, so the
// text under test is exactly the player-facing text. A human reads the
// output and judges meaning, coherence, relevance, consequences.
//
// Run: node scripts/test-agency-teachv-sense-20261011.js [seed]
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const seed = parseInt(process.argv[2] || '7', 10);

(async () => {
  const { Game } = await loadGame({ seed, mode: 'sense-teachv', fullTelemetry: false });
  const sayLines = [];
  Game.say = function (msg) { sayLines.push(String(msg)); };
  Game.sysSay = function (msg) { sayLines.push('[SYS] ' + String(msg)); };
  await setupGame(Game);

  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const teacher = roster[0], learner = roster[1];
  const st = Game.agencyState();
  const tname = Game.displayName(teacher).split(' ')[0];
  const lname = Game.displayName(learner).split(' ')[0];

  // stage: the teacher knows real plants (design: villagers teach from the
  // identity system — plantsKnownBy)
  const pid0 = (Game.data.plants || []).filter(p => p && p.id)[0].id;
  Game.villagerLearnsPlant(teacher, pid0, 'fieldwork');
  // pin the teacher on the teach chore, indoor, at Haven
  const o = Game.objOf(teacher);
  o.kind = 'HAVEN_CHORE'; o.indoor = true; o.state = 'indoor';
  o.chore = 'teach'; o.partsLeft = 99; o.purpose = 'chore';

  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const learnerXp0 = Game.agencyOf(learner).xp[learner].tracking;
  const taughtDeeds0 = (st.ach || []).filter(d => d.type === 'taught').length;

  for (let i = 0; i < 30; i++) { try { Game.objTick(); } catch (e) {} }

  const taughtDeeds = (st.ach || []).filter(d => d.type === 'taught');
  const learnerRecs = (st.lessons || {})[learner] || [];
  const learnerXp1 = Game.agencyOf(learner).xp[learner].tracking;

  console.log('=== SCENE: the teach chore, witnessed (seed ' + seed + ') ===');
  console.log(`teacher: <knows the wild>   bystander: <at Haven>`);
  console.log('');
  console.log('--- what the player READ (say lines mentioning the teach chore) ---');
  const teachLines = sayLines.filter(l => /📖/.test(l));
  if (!teachLines.length) console.log('(no teach lines were spoken — the chore stayed quiet)');
  for (const l of teachLines) console.log('  ' + l);
  console.log('');
  console.log('--- consequences in the ledger ---');
  const lessonsAll = Object.values(st.lessons || {}).reduce((n, l) => n + (l || []).length, 0);
  console.log(`lessons recorded (all villagers): ${lessonsAll}`);
  console.log(`learner tracking xp: ${learnerXp0} -> ${learnerXp1}`);
  console.log(`'taught' deeds in ledger: ${taughtDeeds0} -> ${taughtDeeds.length}`);
  for (const d of taughtDeeds.slice(taughtDeeds0)) console.log(`  deed: [${d.type}|mag ${d.mag}] ${d.text}`);
  console.log('');
  console.log('--- a few other ambient lines from the same stretch (context) ---');
  const other = sayLines.filter(l => !/📖/.test(l)).slice(0, 10);
  for (const l of other) console.log('  ' + l);
})().catch(e => { console.error('HARNESS CRASH', e); process.exit(2); });
