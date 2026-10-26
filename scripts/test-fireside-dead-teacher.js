#!/usr/bin/env node
// test-fireside-dead-teacher.js — CRISIS LEG r51 proof (before/after).
// FOUND IN THE WILD (journey-crisis-r51, seed 9407 d83): Vyacheslav Matveev
// died on a sortie, and 338 say-lines later the SAME game day the fire
// still taught his lesson — "Fireside lesson: Vyacheslav passes around
// Groundnut." Root cause: firesideTeaching() picks its lesson from the
// sharedKnowledge queue (entry.discoveredBy) and never re-checks that the
// discoverer is still alive. The dead don't teach.
// BEFORE (unfixed): the dead-teacher lesson is voiced.
// AFTER (fixed): no lesson line naming the dead teacher; the entry stays
// untaught (a living villager may teach another entry later).
// Lesson detection keys on the teacher name + lesson phrasing, NOT on the
// plant display name — that name itself changes once the lesson teaches
// it (unknown-stage description -> known name).
// Usage: node scripts/test-fireside-dead-teacher.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game: G } = await loadGame({ seed: 4404, mode: 'fireside-dead-teacher', fullTelemetry: true });
  await setupGame(G);
  const sayLog = [];
  G.say = m => sayLog.push(String(m));
  let fails = 0;
  const check = (n, c, d) => { console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (d ? ' | ' + d : '')); if (!c) fails++; };

  const v = G.state.village;
  const plants = G.data.plants;
  const pid = plants[5].id;
  const teacher = v.roster.find(id => id !== G.villagerId);
  const teacherName = G.displayName(teacher);
  const isLessonLine = (m) => m.includes(teacherName) &&
    /(by the fire|Fireside lesson|passes around|showing everyone|drew .* in the dirt)/i.test(m);
  check('setup: teacher on roster', !!teacher, teacher);
  check('setup: vpOf teacher is a live object', !!G.vpOf(teacher), typeof G.vpOf(teacher));

  // Hermetic queue: setup may already hold sharedKnowledge entries, and the
  // pick is taught[floor(random * len)] — with random forced to 0 that is
  // always the FIRST entry. A single candidate makes the pick deterministic.
  v.sharedKnowledge = {};
  v.sharedKnowledge[pid] = { taughtAround: false, discoveredBy: teacher, identifiedDay: 1 };
  v.taught[teacher] = [pid];

  const realRandom = Math.random;
  Math.random = () => 0; // deterministic fire: single lesson candidate picked
  try {
    // CONTROL: teacher alive -> lesson voiced, entry marked taught.
    G.firesideTeaching(true);
    check('C0 alive teacher lesson voiced', sayLog.some(isLessonLine),
      sayLog.slice(-3).join(' | ').slice(0, 200));
    check('C1 alive teacher entry marked taught', v.sharedKnowledge[pid].taughtAround === true);

    // DEAD CASE: the teacher dies, the queued lesson must NOT be voiced.
    v.sharedKnowledge[pid].taughtAround = false;
    sayLog.length = 0;
    G.vpOf(teacher).dead = true;
    check('setup: teacher now reads dead', G.vpOf(teacher).dead === true);
    G.firesideTeaching(true);
    check('D0 dead teacher lesson NOT voiced', !sayLog.some(isLessonLine),
      sayLog.slice(-3).join(' | ').slice(0, 200));
    check('D1 dead teacher entry left untaught (not consumed)', v.sharedKnowledge[pid].taughtAround === false);
  } finally { Math.random = realRandom; }

  console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
