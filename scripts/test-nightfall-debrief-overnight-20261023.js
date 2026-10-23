#!/usr/bin/env node
// PROOF TEST: nightfall debrief includes OVERNIGHT-journaled learnings
// (journey-landing r39 — fix for the pre-sim debrief ordering bug).
//
// THE BUG: nightfallDebrief() was called from the endDay wrap BEFORE the
// overnight sim. But the villageBriefing → flowVillageKnowledge overnight
// learning journals its sighting entries (stamped with the day just ended)
// AFTER the debrief already ran. Result in the wild (seed 309): 12
// sighting entries across the run, 0 debrief lines — the beat was dead in
// competent play.
//
// THE FIX (src/js/journal.js): the endDay wrap captures the pre-roll day,
// runs the overnight sim, THEN calls nightfallDebrief(endedDay) — the
// debrief reads the day just ended, including overnight entries.
//
// PROVES:
//   §A (before): the OLD ordering — debrief before the overnight
//      journaling — misses an overnight-journaled learning (documents the
//      bug; this section simulates the old call sequence explicitly).
//   §B (after): the NEW ordering — Game.endDay() with a villageBriefing
//      that journals one overnight sighting — the debrief fires and names
//      the plant.
//   §C (after): daytime + overnight learnings combine into one counted
//      line, deepest first (no double-fire, no filler).
//
// Usage: node scripts/test-nightfall-debrief-overnight-20261023.js
// Deterministic: mulberry32 seeded before eval (sim-harness). Does not
// write into the repo.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 20261023, narration: true, mode: 'nightfall-overnight' });
  await setupGame(Game);

  const fails = [];
  function check(name, cond, detail) {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  }

  const said = [];
  const origSay = Game.say;
  Game.say = function (t) {
    said.push(String(t));
    try { return origSay.call(this, t); } catch (e) { console.warn('[test] say', e); }
  };
  const debriefLines = () => said.filter(l => /^The fire burns low\./.test(l));
  const clearJournal = () => {
    Game.state.codex.journal = { plants: {}, margins: [] };
    Game.state.codex.journalMarks = { plants: {}, life: [] };
  };
  const makeKnown = (pid) => {
    Game.state.codex.plants[pid] = Object.assign(Game.state.codex.plants[pid] || {}, { level: 1 });
  };
  const feed = () => {
    Game.state.scholar.kcal = 9000;
    Game.state.scholar.health = 100;
    Game.state.scholar.hydration = 100;
  };
  // journal an entry exactly the way the overnight village-learning flow
  // does: writePlantEntry stamps {day: scholar.day} at write time.
  const overnightJournal = (pid, kind) => {
    makeKnown(pid);
    return Game.writePlantEntry(pid, kind, `overnight-sentinel ${kind} of ${pid} day ${Game.state.scholar.day}`);
  };

  // --- §A: BEFORE — the old call ordering misses overnight learnings ---
  // Simulate the old sequence explicitly: debrief (pre-sim position) runs
  // first, THEN the overnight sim journals, then the day rolls. The next
  // night's debrief looks for the new day and never sees the entry.
  clearJournal(); said.length = 0; feed();
  makeKnown('dandelion');
  const D = Game.state.scholar.day;
  const preSimMiss = Game.nightfallDebrief(); // old position: nothing journaled yet
  check('old order: pre-sim debrief silent before overnight journaling', preSimMiss === false, String(preSimMiss));
  overnightJournal('dandelion', 'sighting'); // the overnight sim journals, stamped day D
  Game.state.scholar.day = D + 1; // endDay rolls the day
  said.length = 0;
  const nextNight = Game.nightfallDebrief(); // next night reads day D+1
  check('old order: overnight learning never debriefed (the bug)', nextNight === false && debriefLines().length === 0,
    `returned ${nextNight}, lines ${debriefLines().length}`);
  Game.state.scholar.day = D; // restore for the after-sections

  // --- §B: AFTER — endDay() includes the overnight learning ---
  // Wrap villageBriefing (called inside endDay before the day rolls) to
  // journal one overnight sighting, exactly like flowVillageKnowledge.
  clearJournal(); said.length = 0; feed();
  const _vb = Game.villageBriefing.bind(Game);
  let briefed = false;
  Game.villageBriefing = function () {
    const r = _vb();
    if (!briefed) { briefed = true; overnightJournal('cattail', 'sighting'); }
    return r;
  };
  const dayBefore = Game.state.scholar.day;
  Game.endDay();
  Game.villageBriefing = _vb;
  const linesB = debriefLines();
  check('new order: endDay debriefs the overnight learning', linesB.length === 1, `got ${linesB.length}`);
  check('line names the overnight-learned plant', linesB.length === 1 && /Cattail/i.test(linesB[0]), linesB[0]);
  check('day rolled (endDay ran fully)', Game.state.scholar.day === dayBefore + 1, `day ${Game.state.scholar.day}`);

  // --- §C: AFTER — daytime + overnight learnings combine, deepest first ---
  clearJournal(); said.length = 0; feed();
  makeKnown('mayapple'); makeKnown('blackberry');
  Game.writePlantEntry('mayapple', 'tasting', 'daytime-sentinel tasting of mayapple');
  const _vb2 = Game.villageBriefing.bind(Game);
  let briefed2 = false;
  Game.villageBriefing = function () {
    const r = _vb2();
    if (!briefed2) { briefed2 = true; overnightJournal('blackberry', 'deeper'); }
    return r;
  };
  Game.endDay();
  Game.villageBriefing = _vb2;
  const linesC = debriefLines();
  check('one line for daytime + overnight learnings', linesC.length === 1, `got ${linesC.length}`);
  check('line counts both learnings', linesC.length === 1 && /2 new lines/.test(linesC[0]), linesC[0]);
  check('line leads with the deepest (overnight deeper outranks daytime tasting)',
    linesC.length === 1 && /Blackberry/i.test(linesC[0]) && /understood at last/.test(linesC[0]), linesC[0]);

  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join(', ')}` : '\nALL PASS');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
