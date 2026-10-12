#!/usr/bin/env node
// sense-trapline.js — read the transcript: does the trapline read sensical?
// Runs one 40-day sim with the competent policy and prints trap/kill/death beats.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEED = parseInt(process.env.SEED || '5', 10);
const DAYS = parseInt(process.env.DAYS || '40', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'competent', fullTelemetry: true });
  const occ = process.env.SCHOLAR_OCC || null;
  if (occ) {
    Game.genRoster('Columbus, Ohio');
    Game.generatedRoster[0].occupationId = occ;
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();
  } else {
    await setupGame(Game);
  }
  const sayLines = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { sayLines.push(`d${Game.state.scholar.day} ${t}`); return origSay(t); };

  await runDays(Game, competent, { days: DAYS, manifest: null });
  const keep = /🪤|snare|Snare|trap|TRAP|killed|died|death|slain|pantry/i;
  const out = sayLines.filter(l => keep.test(l)).slice(0, 60);
  console.log(`=== trap/combat transcript, seed ${SEED}, ${DAYS}d (${out.length} lines) ===`);
  for (const l of out) console.log(l.slice(0, 220));
  const s = Game.state.scholar;
  console.log('=== end state ===');
  console.log('day:', s.day, 'player alive:', !Game.over);
  console.log('recipe snare level:', ((Game.state.codex.recipes || {}).snare || {}).level);
  console.log('tools:', JSON.stringify((s.tools || []).map(t => t.recipeId)));
  // count tile traps
  let set = 0;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const t = Game.tileAt(x, y); if (t && t.traps) set += t.traps.length;
  }
  console.log('traps still set on tiles:', set);
})().catch(e => { console.error('ERR', e); process.exit(2); });
