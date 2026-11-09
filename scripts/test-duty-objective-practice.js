#!/usr/bin/env node
// test-duty-objective-practice.js — OVE-74: DUTY-aligned objective completion
// accrues villagerPractice without writing assignTask.
//
// Proves:
//   1. DUTY teach/patrol/hunt align stamps practiceTask (ASSIGN does not).
//   2. Teach lesson.taught → practice['teach'] +1 via objOnTeachLesson.
//   3. EXPLORE out-and-back → practice['patrol'] via objOnExploreReturn.
//   4. HUNT return (not empty-tile drop) → practice['hunt'] via objOnHuntReturn.
//   5. Empty-tile hunt drop → no practice on return.
//   6. Failing control objDisableDutyPractice strips the new hook.
//   7. No assignTask write on any of the above.
//
// Usage: node scripts/test-duty-objective-practice.js
// Exit 0 = pass, 1 = fail, 2 = setup skip. No repo writes.
'use strict';
const fs = require('fs');
const path = require('path');
const repo = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));

const SEED = 20261109;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function out(o) { console.log(JSON.stringify(o)); }

function practiceOf(Game, vid, task) {
  const vp = (Game.data.villagers || []).find(v => v.id === vid)
    || (Game.data.background_survivors || []).find(v => v.id === vid)
    || {};
  return (vp.practice && vp.practice[task]) || 0;
}

function clearCommit(Game, vid) {
  try {
    const br = Game.state.village.vbrain;
    if (br && br.commit) delete br.commit[vid];
  } catch (e) {}
}

function dutyCand(dutyTask) {
  return {
    kind: 'DUTY',
    w: 50,
    dutyTask,
    vbrainSrc: 'duty',
    considerations: [{ id: 'believed_need', raw: 1, note: 'test_' + dutyTask }],
  };
}

// Real dawn path: scorePick writes commit + override log, then align faces
// the objective and stamps practiceTask (OVE-36 / OVE-74).
function alignDuty(Game, vid, dutyTask, hx, hy) {
  delete (Game.state.village.assignments || {})[vid];
  clearCommit(Game, vid);
  const cands = [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, dutyCand(dutyTask)];
  Game.vbrainScorePick(vid, cands, { rng: () => 0 });
  const o = {
    kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
    chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2,
  };
  Game.vbrainAlignObjective(vid, o, hx, hy);
  const live = Game.objOf(vid);
  Object.assign(live, o);
  return live;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.objAccrueDutyPractice !== 'function' ||
      typeof Game.objOnTeachLesson !== 'function' ||
      typeof Game.objOnExploreReturn !== 'function' ||
      typeof Game.objOnHuntReturn !== 'function' ||
      typeof Game.vbrainAlignObjective !== 'function') {
    out({ skip: 'OVE-74 duty practice API missing' });
    process.exit(2);
  }

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  Game.state.scholar.day = 20;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 2) { out({ skip: 'roster<2' }); process.exit(2); }
  const vid = roster[0];
  const buddy = roster[1];

  for (const id of roster) {
    v.assignments = v.assignments || {};
    delete v.assignments[id];
    v.trust = v.trust || {};
    v.trust[id] = 80;
    try {
      const vp = Game.vpOf ? Game.vpOf(id) : null;
      if (vp) vp.practice = {};
    } catch (e) {}
  }
  Game.objDisableDutyPractice = false;

  // Structural: call sites present in source (failing-control proof partner).
  console.log('== source seams ==');
  {
    const objSrc = fs.readFileSync(path.join(repo, 'src/js/villager-objectives.js'), 'utf8');
    const gameSrc = fs.readFileSync(path.join(repo, 'src/js/game.js'), 'utf8');
    const brainSrc = fs.readFileSync(path.join(repo, 'src/js/villager-brain.js'), 'utf8');
    check('teach seam calls objOnTeachLesson',
      /lesson\.taught[\s\S]{0,240}objOnTeachLesson/.test(objSrc));
    check('empty hunt marks huntEmptyDrop',
      /huntEmptyDrop\s*=\s*true/.test(objSrc));
    check('explore return calls objOnExploreReturn',
      /purpose === 'explore'[\s\S]{0,900}objOnExploreReturn/.test(gameSrc));
    check('hunt return calls objOnHuntReturn',
      /purpose === 'hunt'[\s\S]{0,500}objOnHuntReturn/.test(gameSrc));
    check('DUTY align stamps practiceTask',
      /c\.kind === 'DUTY'[\s\S]{0,120}practiceTask\s*=\s*dutyTask/.test(brainSrc));
  }

  console.log('== DUTY align stamps practiceTask ==');
  {
    clearCommit(Game, vid);
    const teachO = alignDuty(Game, vid, 'teach', hx, hy);
    check('teach align: practiceTask teach', teachO.practiceTask === 'teach',
      JSON.stringify(teachO));
    check('teach align: chore teach', teachO.chore === 'teach', JSON.stringify(teachO));
    check('teach align: no assignTask',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task),
      JSON.stringify((v.assignments || {})[vid]));

    const patrolO = alignDuty(Game, vid, 'patrol', hx, hy);
    check('patrol align: practiceTask patrol', patrolO.practiceTask === 'patrol',
      JSON.stringify(patrolO));
    check('patrol align: kind EXPLORE', patrolO.kind === 'EXPLORE', JSON.stringify(patrolO));

    const huntO = alignDuty(Game, vid, 'hunt', hx, hy);
    check('hunt align: practiceTask hunt', huntO.practiceTask === 'hunt',
      JSON.stringify(huntO));
    check('hunt align: kind HUNT', huntO.kind === 'HUNT', JSON.stringify(huntO));

    // ASSIGN must not stamp (resolveOneAssignment owns that practice).
    clearCommit(Game, vid);
    delete v.assignments[vid];
    const assignCand = {
      kind: 'ASSIGN', w: 50, assignTask: 'patrol', vbrainSrc: 'assign',
      considerations: [{ id: 'standing_order', raw: 1, note: 'test' }],
    };
    Game.vbrainScorePick(vid, [{ kind: 'HAVEN_CHORE', w: 0.01, chore: 'fire' }, assignCand], { rng: () => 0 });
    const assignO = {
      kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor',
      chore: 'fire', tx: hx, ty: hy, tightness: 0, partsLeft: 2, practiceTask: 'stale',
    };
    Game.vbrainAlignObjective(vid, assignO, hx, hy);
    check('ASSIGN align: practiceTask cleared', assignO.practiceTask == null,
      JSON.stringify(assignO));
    delete v.assignments[vid];
    clearCommit(Game, vid);
  }

  console.log('== teach lesson.taught accrues practice ==');
  {
    const o = alignDuty(Game, vid, 'teach', hx, hy);
    const before = practiceOf(Game, vid, 'teach');
    const n = Game.objOnTeachLesson(vid, { taught: true, learner: buddy, topic: 'plant' });
    const after = practiceOf(Game, vid, 'teach');
    check('teach lesson: practice +1', after === before + 1,
      JSON.stringify({ before, after, n }));
    check('teach lesson: practiceTask cleared', o.practiceTask == null,
      JSON.stringify(o));
    check('teach lesson: no assignTask',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task));
    // Untaught lesson must not practice.
    alignDuty(Game, vid, 'teach', hx, hy);
    const b2 = practiceOf(Game, vid, 'teach');
    Game.objOnTeachLesson(vid, { taught: false });
    check('untaught lesson: no practice', practiceOf(Game, vid, 'teach') === b2);
  }

  console.log('== EXPLORE/patrol out-and-back accrues practice ==');
  {
    const o = alignDuty(Game, vid, 'patrol', hx, hy);
    const before = practiceOf(Game, vid, 'patrol');
    const n = Game.objOnExploreReturn(vid);
    const after = practiceOf(Game, vid, 'patrol');
    check('patrol return: practice +1', after === before + 1,
      JSON.stringify({ before, after, n }));
    check('patrol return: objective done', o.state === 'done' || o.kind === 'idle',
      JSON.stringify(o));
    check('patrol return: no assignTask',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task));

    // Scout stamp also practices scout (not patrol).
    const so = alignDuty(Game, vid, 'scout', hx, hy);
    const sb = practiceOf(Game, vid, 'scout');
    Game.objOnExploreReturn(vid);
    check('scout return: practice scout +1', practiceOf(Game, vid, 'scout') === sb + 1);
    check('scout return: practiceTask was scout', so.practiceTask == null);
  }

  console.log('== HUNT real return vs empty-tile drop ==');
  {
    const o = alignDuty(Game, vid, 'hunt', hx, hy);
    o.huntEmptyDrop = false;
    const before = practiceOf(Game, vid, 'hunt');
    const n = Game.objOnHuntReturn(vid);
    check('hunt return: practice +1', practiceOf(Game, vid, 'hunt') === before + 1,
      JSON.stringify({ before, after: practiceOf(Game, vid, 'hunt'), n }));
    check('hunt return: no assignTask',
      !((v.assignments || {})[vid] && (v.assignments || {})[vid].task));

    const empty = alignDuty(Game, vid, 'hunt', hx, hy);
    empty.huntEmptyDrop = true;
    const eb = practiceOf(Game, vid, 'hunt');
    Game.objOnHuntReturn(vid);
    check('empty-tile hunt: no practice', practiceOf(Game, vid, 'hunt') === eb,
      JSON.stringify({ eb, after: practiceOf(Game, vid, 'hunt') }));
    check('empty-tile hunt: practiceTask cleared', empty.practiceTask == null,
      JSON.stringify(empty));
  }

  console.log('== failing control: objDisableDutyPractice ==');
  {
    Game.objDisableDutyPractice = true;
    alignDuty(Game, vid, 'teach', hx, hy);
    const tb = practiceOf(Game, vid, 'teach');
    Game.objOnTeachLesson(vid, { taught: true, learner: buddy });
    check('control: teach blocked', practiceOf(Game, vid, 'teach') === tb);

    alignDuty(Game, vid, 'patrol', hx, hy);
    const pb = practiceOf(Game, vid, 'patrol');
    Game.objOnExploreReturn(vid);
    check('control: patrol blocked', practiceOf(Game, vid, 'patrol') === pb);

    alignDuty(Game, vid, 'hunt', hx, hy);
    const hb = practiceOf(Game, vid, 'hunt');
    Game.objOnHuntReturn(vid);
    check('control: hunt blocked', practiceOf(Game, vid, 'hunt') === hb);

    Game.objDisableDutyPractice = false;
    alignDuty(Game, vid, 'teach', hx, hy);
    const tr = practiceOf(Game, vid, 'teach');
    Game.objOnTeachLesson(vid, { taught: true, learner: buddy });
    check('control restored: teach practices', practiceOf(Game, vid, 'teach') === tr + 1);
  }

  console.log('== standing assign skips objective practice (no double) ==');
  {
    alignDuty(Game, vid, 'patrol', hx, hy);
    v.assignments[vid] = { task: 'patrol', assignedDay: Game.state.scholar.day, via: 'test' };
    const before = practiceOf(Game, vid, 'patrol');
    Game.objOnExploreReturn(vid);
    check('assigned: explore practice skipped', practiceOf(Game, vid, 'patrol') === before);
    delete v.assignments[vid];
  }

  console.log('== summary ==');
  out({ pass: fail === 0, passCount: pass, failCount: fail });
  process.exit(fail === 0 ? 0 : 1);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
