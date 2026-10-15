#!/usr/bin/env node
// sense-table-news-20261015.js — SENSE-TESTING LAW read: stage a sitting table
// and read the table beats directly (opener + lately event + event choice).
'use strict';
const { mulberry32, loadGame, setupGame } = require('./sim-harness');

async function main() {
  Math.random = mulberry32(99173);
  const { Game } = await loadGame({ seed: 77, mode: 'sense-table-news' });
  await setupGame(Game);
  const pg = Game.progState();
  pg.tableSittingId = 1; pg.tableWaiting = false; pg.tableDone = true;
  const T = Game.tableState();
  T.phase = 'paths'; T.seat = 'full'; T.winDeferred = false; T.path = null;
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  const nm = Game.displayName(vid);
  console.log(`=== villager: ${nm} — table SITTING (paths phase), unanswered ===`);
  console.log('convoTableSitting():', Game.convoTableSitting());
  const top = Game.convoTableOpener(vid);
  console.log('OPENER BEAT:', top && top.line ? top.line : JSON.stringify(top));
  // clear the opener's once-per-sitting mark so lately can be read cleanly
  const ev = Game.t2LatelyEvent(vid);
  console.log('LATELY EVENT:', JSON.stringify(ev));
  const lines = Game.t2gen_lately(vid) || [];
  console.log('LATELY LINES:');
  lines.forEach(l => console.log('  THEM:', l));
  const fol = Game.t2fol_lately(vid) || [];
  console.log('FOLLOW-UPS (cope/next/part):');
  (Array.isArray(fol) ? fol.flat() : []).slice(0, 6).forEach(l => console.log('  -', l));
  // full conversation: does the event choice appear?
  const r0 = Game.startConvo(vid);
  const choices = Game.convoChoices(vid) || [];
  const evc = choices.find(c => c && c.id === 'alive:event:table');
  console.log('EVENT CHOICE offered:', evc ? `"${evc.label}"` : 'NO');
  if (evc) {
    const r2 = Game.convoTurn(vid, evc.id);
    console.log('THEM (event choice):', r2.line);
  }
  Game.endConvo(vid, 'done');
  console.log('=== END ===');
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
