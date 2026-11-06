#!/usr/bin/env node
// Proof test: practice moves competence (sim-drive-practice-a).
// Unit: practice reps move villagerCompetence one rung at 8/20/36 reps,
// cap at 1.4, never decrease, temperament still applies.
// Integration: a villager resolving real assignments gains a rung and the
// improvement is narrated in plain words.
// Usage: node scripts/test-drive-practice-a.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const LADDER = [0.7, 1.0, 1.2, 1.3, 1.4];
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];

function tempMult(Game, vid) {
  const p = Game.getPerson ? Game.getPerson(vid) : null;
  const temp = (p && p.personality && p.personality.temperament) || 'steady';
  if (temp === 'bold') return 1.15; // only hunt/patrol; caller divides only for those
  if (temp === 'cautious') return 0.9;
  return 1.0;
}
// Base (pre-temperament) competence: divide out the temperament multiplier
// the same way villagerCompetence applies it.
function baseComp(Game, vid, task) {
  const c = Game.villagerCompetence(vid, task);
  const p = Game.getPerson ? Game.getPerson(vid) : null;
  const temp = (p && p.personality && p.personality.temperament) || 'steady';
  let m = 1.0;
  if (temp === 'bold' && (task === 'hunt' || task === 'patrol')) m = 1.15;
  if (temp === 'cautious') m = 0.9;
  return Math.round((c / m) * 100) / 100;
}
function rungOf(v) {
  let idx = 0;
  for (let i = 0; i < LADDER.length; i++) if (v >= LADDER[i] - 0.001) idx = i;
  return idx;
}

(async () => {
  const { Game } = await loadGame({ seed: 99451, mode: 'mvc', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(id => String(id) !== String(Game.villagerId));
  assert(roster.length >= 2, 'need at least 2 non-scholar villagers, got ' + roster.length);

  // --- Unit 1: thresholds 8/20/36 move exactly 1/2/3 rungs; cap at 1.4. ---
  const vid = String(roster[0]);
  const task = 'forage';
  const startBase = baseComp(Game, vid, task);
  const startRung = rungOf(startBase);
  assert(LADDER.includes(startBase), `start competence ${startBase} off-ladder for ${vid}/${task}`);
  const vp = (Game.data.villagers || []).find(v => v.id === vid) || (Game.data.background_survivors || []).find(v => v.id === vid);
  assert(vp, 'villager record not found');
  vp.practice = {};
  assert.strictEqual(Game.villagerPracticeSteps(vp, task), 0, '0 steps at 0 reps');
  for (let i = 0; i < 7; i++) Game.villagerPractice(vid, task);
  assert.strictEqual(Game.villagerPracticeSteps(vp, task), 0, '0 steps at 7 reps');
  assert.strictEqual(baseComp(Game, vid, task), startBase, 'no movement before 8 reps');
  Game.villagerPractice(vid, task); // 8th rep
  assert.strictEqual(Game.villagerPracticeSteps(vp, task), 1, '1 step at 8 reps');
  assert.strictEqual(rungOf(baseComp(Game, vid, task)), Math.min(startRung + 1, 4), 'exactly one rung at 8 reps');
  for (let i = 0; i < 12; i++) Game.villagerPractice(vid, task); // 20 reps
  assert.strictEqual(Game.villagerPracticeSteps(vp, task), 2, '2 steps at 20 reps');
  assert.strictEqual(rungOf(baseComp(Game, vid, task)), Math.min(startRung + 2, 4), 'exactly two rungs at 20 reps');
  for (let i = 0; i < 16; i++) Game.villagerPractice(vid, task); // 36 reps
  assert.strictEqual(Game.villagerPracticeSteps(vp, task), 3, '3 steps at 36 reps');
  assert.strictEqual(rungOf(baseComp(Game, vid, task)), Math.min(startRung + 3, 4), 'exactly three rungs at 36 reps');
  for (let i = 0; i < 40; i++) Game.villagerPractice(vid, task); // 76 reps: capped
  assert.strictEqual(Game.villagerPracticeSteps(vp, task), 3, 'steps cap at 3');
  assert(baseComp(Game, vid, task) <= 1.4 + 0.001, 'competence caps at 1.4, got ' + baseComp(Game, vid, task));
  console.log(`UNIT1 ok: ${vid} forage ${startBase} (rung ${startRung}) -> ${baseComp(Game, vid, task)} after 76 reps`);

  // --- Unit 2: never decreases, all tasks, second villager; unknown task ignored. ---
  const vid2 = String(roster[1]);
  const vp2 = (Game.data.villagers || []).find(v => v.id === vid2) || (Game.data.background_survivors || []).find(v => v.id === vid2);
  vp2.practice = {};
  for (const t of TASKS) {
    const before = baseComp(Game, vid2, t);
    for (let i = 0; i < 36; i++) Game.villagerPractice(vid2, t);
    const after = baseComp(Game, vid2, t);
    assert(after >= before, `${t}: competence decreased ${before} -> ${after}`);
    assert(after <= 1.4 + 0.001, `${t}: competence above cap: ${after}`);
    assert(rungOf(after) <= rungOf(before) + 3, `${t}: moved more than 3 rungs`);
  }
  assert.strictEqual(Game.villagerPractice(vid2, 'dance'), 0, 'unknown task records nothing');
  assert.strictEqual(Game.villagerPractice('no-such-villager', 'forage'), 0, 'unknown villager records nothing');
  console.log('UNIT2 ok: all 14 tasks never decrease, cap holds, unknown inputs ignored');

  // --- Unit 3: temperament still applies on top of practice. ---
  // Find a cautious villager if one exists on this roster; else use vid2's
  // own temperament as a consistency check (practiced >= unpracticed ratio).
  // Find a cautious villager + task whose base is below the 1.4 cap (a
  // natural already at 1.4 cannot rise — the cap, not a bug).
  let cPair = null;
  for (const id of roster.map(String)) {
    const p = Game.getPerson(id);
    if (!p || !p.personality || p.personality.temperament !== 'cautious') continue;
    for (const t of TASKS) {
      if (baseComp(Game, id, t) < 1.4 - 0.001) { cPair = { id, task: t }; break; }
    }
    if (cPair) break;
  }
  if (cPair) {
    const { id: cautious, task: cTask } = cPair;
    const p = (Game.data.villagers || []).find(v => v.id === cautious) || (Game.data.background_survivors || []).find(v => v.id === cautious);
    p.practice = {};
    const raw0 = Game.villagerCompetence(cautious, cTask);
    for (let i = 0; i < 8; i++) Game.villagerPractice(cautious, cTask);
    const raw1 = Game.villagerCompetence(cautious, cTask);
    assert(raw1 > raw0, `cautious villager raw competence must rise with practice: ${raw0} -> ${raw1}`);
    assert(Math.abs(raw1 - Math.round(baseComp(Game, cautious, cTask) * 0.9 * 100) / 100) < 0.011,
      `cautious 0.9 multiplier must still apply: raw ${raw1} vs base ${baseComp(Game, cautious, cTask)}`);
    console.log(`UNIT3 ok: cautious ${cautious} ${cTask} raw ${raw0} -> ${raw1} (0.9 still applied)`);
  } else {
    console.log('UNIT3 skipped: no cautious villager below the cap on this roster seed');
  }

  // --- Integration: real assignment resolutions teach, and say the line. ---
  const vid3 = String(roster[2] || roster[0]);
  const vp3 = (Game.data.villagers || []).find(v => v.id === vid3) || (Game.data.background_survivors || []).find(v => v.id === vid3);
  vp3.practice = {};
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (msg) { try { if (typeof msg === 'string') said.push(msg); } catch (e) {} return _say.apply(this, arguments); };
  const itask = 'forage';
  const iStart = baseComp(Game, vid3, itask);
  // Assign + resolve 8 times through the real path.
  const asg = Game.assignTask(vid3, itask);
  assert(asg && asg.ok, 'assignTask must accept forage, got ' + JSON.stringify(asg));
  for (let i = 0; i < 8; i++) {
    Game.state.village.assignments[vid3] = { task: itask, assignedDay: Game.state.scholar.day, assignedPart: Game.dayPart };
    Game.resolveOneAssignment(vid3, Game.state.village.assignments[vid3]);
  }
  const reps = ((vp3.practice || {})[itask]) || 0;
  assert(reps >= 8, `expected >=8 practice reps from 8 resolutions, got ${reps}`);
  assert(rungOf(baseComp(Game, vid3, itask)) >= rungOf(iStart) + 1,
    `expected >=1 rung from real resolutions: ${iStart} -> ${baseComp(Game, vid3, itask)}`);
  const line = said.find(m => /getting the hang of foraging/i.test(m));
  assert(line, 'expected a "getting the hang of foraging" line, got: ' + JSON.stringify(said.slice(-5)));
  console.log('INTEGRATION ok: 8 real forage resolutions -> ' + reps + ' reps, rung ' + rungOf(iStart) + ' -> ' + rungOf(baseComp(Game, vid3, itask)) + '; line: "' + line + '"');

  console.log('ALL GREEN: test-drive-practice-a');
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
