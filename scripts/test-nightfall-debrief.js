#!/usr/bin/env node
// PROOF TEST: nightfall debrief micro-beat (roguelike-celebration P4-4,
// Steve 2026-10-22 — YES ruling).
//
// THE BEAT: at sleep, ONE narrated line summarizing what the village learned
// today, read ONLY from the journal's own diary entries (plant entries +
// margins stamped with the day just ended). Never invents, never grants
// knowledge. Silent when nothing was learned (no filler).
//
// PROVES (all through Game.endDay, the real sleep path):
//   §1 single learning → exactly one debrief line, naming the journaled
//      plant by its believed name (references real journaled content)
//   §2 two learnings → one line, counts them, leads with the deepest
//      (deeper outranks tasting)
//   §3 empty day → no debrief line (honest silence, no filler)
//   §4 yesterday-only entries → not re-debriefed (day-stamp honesty)
//   §5 nightfallDebrief() return contract: true/narrates vs false/silent
//
// Usage:
//   node scripts/test-nightfall-debrief.js        (default seed 20261022)
//   SEED=7 node scripts/test-nightfall-debrief.js (other seeds)
// Deterministic: mulberry32 seeded before eval (sim-harness); assertions
// are seed-independent. Does not write into the repo.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const seed = parseInt(process.env.SEED || '20261022', 10);
  const { Game } = await loadGame({ seed, narration: true, mode: 'nightfall-debrief' });
  await setupGame(Game); // Columbus, Ohio; default roster pick; departed

  const fails = [];
  function check(name, cond, detail) {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  }

  // Capture narration (loadGame narration:true keeps say live).
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
  const journalToday = (pid, kind) =>
    Game.writePlantEntry(pid, kind, `proof-sentinel ${kind} of ${pid} day ${Game.state.scholar.day}`);
  const feed = () => {
    Game.state.scholar.kcal = 9000;
    Game.state.scholar.health = 100;
  };

  // --- §1: single learning → one line naming the journaled plant ---
  clearJournal(); said.length = 0; feed();
  makeKnown('dandelion');
  const wrote = journalToday('dandelion', 'sighting');
  const dayBefore = Game.state.scholar.day;
  Game.endDay();
  const lines1 = debriefLines();
  check('entry journaled through the real writePlantEntry API', wrote === true, String(wrote));
  check('exactly one debrief line on a learning day', lines1.length === 1, `got ${lines1.length}`);
  check('line names the journaled plant (believed name)', lines1.length === 1 && lines1[0].includes('Dandelion'), lines1[0]);
  check('line names the lesson, not a leak', lines1.length === 1 && lines1[0].includes('named and noted'), lines1[0]);
  check('micro-beat: single short line', lines1.length === 1 && lines1[0].length < 160, String(lines1[0] && lines1[0].length));
  check('endDay ran fully (day advanced)', Game.state.scholar.day === dayBefore + 1, `day ${Game.state.scholar.day}`);

  // --- §2: two learnings → one line, counted, deepest first ---
  clearJournal(); said.length = 0; feed();
  makeKnown('mayapple');
  journalToday('mayapple', 'tasting');
  journalToday('mayapple', 'deeper');
  Game.endDay();
  const lines2 = debriefLines();
  check('still one line for two learnings', lines2.length === 1, `got ${lines2.length}`);
  check('line counts the learnings', lines2.length === 1 && /2 new lines/.test(lines2[0]), lines2[0]);
  check('line leads with the deepest (deeper outranks tasting)',
    lines2.length === 1 && lines2[0].includes('Mayapple') && lines2[0].includes('understood at last'), lines2[0]);

  // --- §3: empty day → honest silence (no filler) ---
  clearJournal(); said.length = 0; feed();
  Game.endDay();
  const lines3 = debriefLines();
  check('no debrief line on an empty day', lines3.length === 0,
    lines3.length ? `leaked: ${lines3.join(' | ')}` : undefined);

  // --- §4: yesterday-only entries are not re-debriefed ---
  clearJournal(); said.length = 0; feed();
  makeKnown('dandelion');
  Game.journalPlantEntries('dandelion').push({
    day: Game.state.scholar.day - 1, life: Game.villagerId, first: 'x',
    register: 'plainspoken', kind: 'mastery', text: 'stale sentinel',
  });
  Game.endDay();
  const lines4 = debriefLines();
  check('yesterday-only entries stay silent', lines4.length === 0,
    lines4.length ? `leaked: ${lines4.join(' | ')}` : undefined);

  // --- §5: direct unit contract ---
  clearJournal(); said.length = 0;
  makeKnown('dandelion');
  journalToday('dandelion', 'poison');
  const r1 = Game.nightfallDebrief();
  check('nightfallDebrief() true + narrates with learnings', r1 === true && debriefLines().length === 1,
    `returned ${r1}, lines ${debriefLines().length}`);
  clearJournal(); said.length = 0;
  const r2 = Game.nightfallDebrief();
  check('nightfallDebrief() false + silent when empty', r2 === false && debriefLines().length === 0,
    `returned ${r2}, lines ${debriefLines().length}`);

  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join(', ')}` : '\nALL PASS');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
