#!/usr/bin/env node
// test-articlefold-teaching-20261015.js — journey-endgame r12 proof test.
// BLANK (found in the r12 s48 answer transcript): the word-of-mouth teaching
// line composed "showed <learner> the <plantDisplayName>" where the
// description of an unidentified plant opens with its own article —
// "Nadia showed Tariq the a cluster of waxy white pipe-shaped flowers".
// FIX: src/js/game.js spreadPlantKnowledge folds the description's leading
// article ("the a cluster" -> "the cluster").
// RED: the doubled-article line fires. GREEN: it doesn't.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'articlefold-proof' });
  await setupGame(Game);
  const G = Game;
  const p = (G.data.plants || []).find(x => /^a\s/i.test(x.description || ''));
  if (!p) { console.log('SKIP: no a-description plant found'); process.exit(2); }
  console.log('[proof] plant: ' + p.id + ' — "' + String(p.description).slice(0, 60) + '..."');
  const v = G.state.village;
  const me = G.villagerId;
  const others = (v.roster || []).filter(rid => rid !== me);
  if (others.length < 2) { console.log('SKIP: roster too small'); process.exit(2); }
  const knower = others[0], learner = others[1];
  v.familiar = v.familiar || {};
  v.familiar[knower] = [p.id];
  v.taught = v.taught || {};
  delete v.taught[learner];
  if (v.plantKnowledge && v.plantKnowledge[learner]) {
    v.plantKnowledge[learner] = v.plantKnowledge[learner].filter(x => x !== p.id);
  }
  v.plantRumors = { [p.id]: 1 };
  const lines = [];
  const osay = G.say.bind(G);
  G.say = (t) => { lines.push(String(t)); return osay(t); };
  let teachLine = null;
  for (let i = 0; i < 60 && !teachLine; i++) {
    try { G.spreadPlantKnowledge(); }
    catch (e) { console.log('spreadPlantKnowledge threw: ' + (e && e.message)); process.exit(1); }
    teachLine = lines.find(l => /showed/.test(l) && /remember it/.test(l));
  }
  if (!teachLine) { console.log('SKIP: teaching line never fired in 60 spreadPlantKnowledge calls'); process.exit(2); }
  console.log('[proof] line: ' + teachLine);
  if (/the (a|an|the) /i.test(teachLine)) {
    console.log('RED/FAIL: doubled article present ("the a/an/the")');
    process.exit(1);
  }
  if (!/showed .* the /i.test(teachLine)) {
    console.log('FAIL: teaching line lost its shape: ' + teachLine);
    process.exit(1);
  }
  console.log('GREEN/PASS: no doubled article');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
