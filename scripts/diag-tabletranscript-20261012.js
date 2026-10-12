#!/usr/bin/env node
// diag-tabletranscript-20261012.js — capture the full table say-log for the
// winning scenario (winpath r5 SENSE-TESTING). Read for meaning, coherence,
// relevance, consequences — never just counts.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const { tableRoad } = require('./policies/winseek');

function makeLesser(Game) {
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 40;
  Game.state.networkLive = true;
  const d = Game.deedState();
  d.wavesFaced = { a: 1, b: 1, c: 1, e2: 1, f: 2, g: 2, h: 2, i: 2, j: 3, k: 3, l: 3 };
  d.contestsSurvived = 2;
  const pg = Game.progState();
  pg.crises = { 'first-grave': 1, breach: 1 };
  pg.sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  // give the bearer a name for the transcript
  try {
    const v = (Game.state.village || {}).roster || [];
  } catch (e) {}
}

(async () => {
  const { Game } = await loadGame({ seed: 4242 });
  await setupGame(Game);
  makeLesser(Game);
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t) { lines.push(String(t)); return origSay(t); };
  Game.tableScene();
  tableRoad(Game, {});
  console.log('won=' + Game.won + ' path=' + Game.tableState().path + ' branch=' + Game.tableState().branch);
  console.log('=== TABLE TRANSCRIPT (' + lines.length + ' beats) ===');
  for (const l of lines) console.log('\n' + l);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
