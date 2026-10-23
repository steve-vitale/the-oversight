#!/usr/bin/env node
// test-relay-road-dark-20261023.js — journey-endgame r43 blank fix (lane B).
//
// BEFORE: a dark-band relay walker with a LIGHT ledger (protected > killed,
// food shared, promises kept) heard "The light road is open." while walking
// the dark merge — seed 85012's transcript. The r5 grey patch (2026-10-12)
// only covered the grey band: the ledger line voiced branch.branch (the
// binary ledger verdict) for dark-band relay walkers. The GRADIENT law
// (docs/TABLE.md) says the ledger-read line voices the BAND for relay.
//
// AFTER: the road line voices the band for all three relay bands —
// "the dark road is open" / "the light road is open" / "the middle road is
// open" (grey, unchanged).
//
// Drives the real Game.tableStartPath via tableScene + chooseTableOption on
// a live setupGame scholar (shared kit). Zero new RNG draws; the seed only
// fixes setupGame's roster.
// Run: node scripts/test-relay-road-dark-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function monstersOfWave(Game, w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}
// texture: a table-ready scholar with a LIGHT ledger (the 85012 shape —
// protected > killed, food shared, promises kept) and the relay claimed.
function texture(Game, ledger) {
  Game.state.scholar.day = 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 85;
  Game.state.scholar.grounding = 100;
  for (const k of Object.keys(ledger || {})) { try { Game.ledgerAdd(k, ledger[k]); } catch (e) {} }
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(Game, w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  const v = Game.state.village; v.pantry = v.pantry || [];
  v.pantry.push({ kcalEach: 5000, units: 10 });
  try { Game.claimRelay(); } catch (e) {}
}
function resetTable(Game) {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
}
// Start the relay path and return the road line ("The X road is open.").
function roadLineFor(Game, lines) {
  lines.length = 0;
  resetTable(Game);
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  return lines.find(l => /road is open/.test(l)) || '';
}

(async () => {
  const { Game } = await loadGame({ seed: 85012, mode: 'relay-road-dark', fullTelemetry: false });

  const lines = [];
  const oSay = Game.say.bind(Game);
  Game.say = (t) => { lines.push(String(t).replace(/<[^>]*>/g, '')); return oSay(t); };
  Game.save = () => {}; Game.wipe = () => {};

  const LIGHT_LEDGER = { defiance: 1, embrace: 2, protected: 6, killed: 0, foodShared: 7, promisesKept: 5 };

  console.log('— 1. dark band + light ledger: the dark road —');
  await setupGame(Game);
  texture(Game, LIGHT_LEDGER);
  for (let i = 0; i < 5; i++) Game.addRelayLean(-10, 'cold work');
  const bandDark = Game.relayBand();
  const darkLine = roadLineFor(Game, lines);
  ok(bandDark === 'dark', 'fixture band is dark (lean -50)', bandDark);
  ok(/The dark road is open/.test(darkLine), 'dark-band walker hears the dark road', darkLine.slice(0, 120));
  ok(!/The light road is open/.test(darkLine), 'dark-band walker does NOT hear the light road', darkLine.slice(0, 120));

  console.log('— 2. light band + light ledger: the light road (no overcorrection) —');
  await setupGame(Game);
  texture(Game, LIGHT_LEDGER);
  for (let i = 0; i < 5; i++) Game.addRelayLean(10, 'tender work');
  const bandLight = Game.relayBand();
  const lightLine = roadLineFor(Game, lines);
  ok(bandLight === 'light', 'fixture band is light (lean +50)', bandLight);
  ok(/The light road is open/.test(lightLine), 'light-band walker hears the light road', lightLine.slice(0, 120));

  console.log('— 3. grey band: the middle road (unchanged) —');
  await setupGame(Game);
  texture(Game, LIGHT_LEDGER);
  for (let i = 0; i < 2; i++) Game.addRelayLean(10, 'tender work');
  const bandGrey = Game.relayBand();
  const greyLine = roadLineFor(Game, lines);
  ok(bandGrey === 'grey', 'fixture band is grey (lean +20)', bandGrey);
  ok(/The middle road is open/.test(greyLine), 'grey-band walker hears the middle road', greyLine.slice(0, 120));
  ok(!/The light road is open|The dark road is open/.test(greyLine), 'grey-band walker hears no binary road');

  Game.say = oSay;
  console.log(`\n${pass} pass, ${fail} fail`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
