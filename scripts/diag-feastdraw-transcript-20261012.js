#!/usr/bin/env node
// diag-feastdraw-transcript-20261012.js — SENSE-TESTING for longsim winpath r4.
// Capture the feast + draw beats with narration ON and read them like a player:
// do the lines make sense, cohere, and land? Also sample villager dialogue
// variety around the feast (the r3 gossip fix) and the drive-off beat.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const H = ROOT + '/scripts/';
const { loadGame, setupGame, driveFights, mulberry32 } = require(H + 'sim-harness');

(async () => {
  Math.random = mulberry32(301);
  const { Game, loadFails } = await loadGame({ seed: 301, mode: 'winseek' });
  if (loadFails && loadFails.length) console.log('loadFails: ' + loadFails.join('; '));
  await setupGame(Game);
  const lines = [];
  Game.say = function (m) { lines.push(String(m)); };
  Game.sysSay = function (m) { lines.push('[SYS] ' + String(m)); };
  const s = Game.state.scholar || {};
  s.prog = s.prog || {};
  s.prog.feastSurge = 1.5;

  console.log('=== THE FEAST (armed) ===');
  const r = Game.hostFeast();
  console.log('hostFeast ok=' + r.ok + ' buffGranted=' + r.buffGranted + ' draw=' + r.draw);
  for (const l of lines.splice(0)) console.log('  | ' + l.slice(0, 220));

  console.log('\n=== THE DRAW (pending panel copy, via feastDrawPending) ===');
  const d = Game.feastDrawPending();
  console.log('draw: ' + JSON.stringify(d));

  console.log('\n=== FACE IT (fight intro lines) ===');
  const fr = Game.faceFeastDraw();
  console.log('faceFeastDraw ok=' + fr.ok);
  for (const l of lines.splice(0)) console.log('  | ' + l.slice(0, 220));
  console.log('inCombat=' + Game.inCombat() + ' fighters=' +
    (Game.tbfight ? Game.tbfight.fighters.map(f => f.kind + ':' + (f.monsterId || f.name)).join(', ') : 'none'));

  console.log('\n=== DRIVE THE FIGHT (first 6 say-lines of combat) ===');
  const winseek = require(H + 'policies/winseek').winseek;
  // play just a few rounds manually to read the combat narration
  let rounds = 0;
  const sig0 = Game.tbfight ? Game.tbfight.round : 0;
  while (Game.tbfight && !Game.tbfight.over && rounds < 3) {
    driveFights(Game, winseek, {});
    rounds++;
    if (Game.tbfight && Game.tbfight.round <= sig0 + 3) break;
  }
  for (const l of lines.splice(0, 8)) console.log('  | ' + l.slice(0, 220));
  console.log('fight over=' + (Game.tbfight ? Game.tbfight.over : 'no-fight') +
    ' feastSurgeUsed=' + !!(((Game.state.scholar || {}).prog || {}).feastSurgeUsed));

  console.log('\n=== DRIVE-OFF BEAT (fresh game) ===');
  Math.random = mulberry32(302);
  const g2 = await loadGame({ seed: 302, mode: 'winseek' });
  await setupGame(g2.Game);
  const lines2 = [];
  g2.Game.say = function (m) { lines2.push(String(m)); };
  const s2 = g2.Game.state.scholar || {};
  s2.prog = s2.prog || {}; s2.prog.feastSurge = 1.5;
  g2.Game.hostFeast();
  lines2.splice(0);
  g2.Game.driveOffFeastDraw();
  for (const l of lines2.splice(0)) console.log('  | ' + l.slice(0, 220));
})().catch(e => { console.error('THREW: ' + (e && e.stack || e)); process.exit(1); });
