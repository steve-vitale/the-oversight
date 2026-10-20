#!/usr/bin/env node
// test-witness-oathbreaker-20261020.js — proof for the journey-endgame r28 blank fill.
//
// THE BLANK: the Witness defense beat ("the defense doesn't argue the
// charges. It argues *you*") samples villagers testifying in their own
// words — but its case split only saw protected/killed: 'aided' when the
// player protected people, 'bloody' when they killed villagers, 'unsure'
// otherwise. A run that broke 11 promises (broken>kept — the very signal
// that wires the witness DARK branch in table.js) heard "They try. I don't
// know if trying counts in this court." The village's memory of broken
// words was invisible to the witnesses, even though the branch math prices
// broken>kept as a dark signal.
//
// THE FIX (src/js/table-witness.js): a new 'oathbreaker' testimony case —
// when broken>kept (the same tablePromiseTally the branch uses) and the
// promise records name the broken, witnesses testify to the broken
// promises: who asked, what was promised, that they're still waiting.
// It replaces only the 'unsure' case; 'aided' and 'bloody' are untouched.
//
// RED (before): the defense prompt contains the 'unsure' lines
//   ("They try.", "I don't know what they are") and no oathbreaker line.
// GREEN (after): the defense prompt names a broken promise
//   ("still waiting", "Shorter list") and the branch wires dark.
//
// Usage: node scripts/test-witness-oathbreaker-20261020.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'test-witness-oathbreaker' });
  await setupGame(Game);
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  // A lesser seat (same rig as test-table-defiant-20261011.js).
  Game.state.systemArrived = true; Game.state.scholar.integration = 50;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };

  // The ruthless ledger: exposures kept, nobody protected, nobody killed,
  // food hoarded — and more promises broken than kept.
  Game.progState().ledger = {
    might: 10, brokerage: 0, showmanship: 0, embrace: 0, defiance: 5,
    exposed: 5, unified: 0, fractured: 0,
    foodShared: 0, foodHoarded: 3,
    protected: 0, killed: 0, betrayed: 0,
  };
  const roster = (Game.data.villagers || []).filter(v => v.id !== Game.villagerId);
  const v1 = roster[0].id, v2 = roster[1].id, v3 = roster[2].id, v4 = roster[3].id;
  const nm1 = String(Game.displayName(v1)).split(' ')[0];
  Game.state.village.promises = {
    [v1]: { kept: 'broken', favorId: 'f1', favorTask: 'bring food' },
    [v2]: { kept: 'broken', favorId: 'f2', favorTask: 'sit the night watch' },
    [v3]: { kept: 'broken', favorId: 'f3', favorTask: 'mend the snares' },
    [v4]: { kept: true, favorId: 'f4', favorTask: 'carry water' },
  };
  Game.state.village.favorLedger = {};
  Game.state.village.trust = Game.state.village.trust || {};

  const tc = () => Game.state.scholar.tableChoices;
  const T = () => Game.tableState();

  console.log('— branch wiring: the ruthless ledger wires witness/dark —');
  const br = Game.tableBranch('witness');
  check('branch is dark', br.branch === 'dark', JSON.stringify(br));
  check('dark signals name the broken promises',
    (br.notes || []).some(n => /promises broken/i.test(n)), (br.notes || []).join('; '));

  console.log('— the trial: the defense argues the broken promises —');
  Game.tableScene();
  Game.chooseTableOption('path:witness');
  check('entered witness/dark', T().path === 'witness' && T().branch === 'dark',
    T().path + '/' + T().branch);
  Game.chooseTableOption('beat:cold'); // opening charges -> the defense
  const prompt = tc().prompt || '';
  check('defense beat reached', /THE DEFENSE/i.test(prompt), prompt.slice(0, 120));
  check('oathbreaker testimony names the waiting villager',
    prompt.indexOf(nm1) >= 0 && /still waiting/i.test(prompt), prompt.slice(0, 400));
  // The pool has 6 lines; the temperament hash picks 2 per trial. Assert both
  // witnesses drew DISTINCT oathbreaker-case lines (no-repeat holds) rather
  // than one specific line.
  const oathMarkers = ['still waiting', 'Still owed', 'Shorter list', 'their word', 'stops asking', 'The list says not to'];
  const swornLines = (prompt.match(/sworn: "([^"]+)"/g) || []);
  const oathHits = swornLines.filter(l => oathMarkers.some(mk => l.indexOf(mk) >= 0));
  check('both witnesses testify to the broken promises, distinctly',
    swornLines.length === 2 && oathHits.length === 2 && swornLines[0] !== swornLines[1],
    swornLines.join(' | ').slice(0, 300));
  check('no unsure-case lines on an oathbreaker record',
    prompt.indexOf('They try.') < 0 && prompt.indexOf("I don't know what they are") < 0,
    prompt.slice(0, 400));

  console.log('— regression: aided and bloody cases untouched —');
  // aided: protected>0
  Game.progState().ledger.protected = 4;
  Game.state.village.promises = {};
  Game.progState().tableDone = false; Game.progState().table = null;
  Game.state.scholar.tableChoices = null; Game.over = false; Game.won = false;
  Game.tableScene();
  Game.chooseTableOption('path:witness');
  Game.chooseTableOption('beat:cold');
  const promptAided = (tc() && tc().prompt) || '';
  check('aided case still fires when protected>0',
    /They kept us fed|carried me out of the treeline|the pantry was full/i.test(promptAided),
    promptAided.slice(0, 200));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
