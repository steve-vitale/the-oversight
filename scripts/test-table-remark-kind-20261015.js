#!/usr/bin/env node
// test-table-remark-kind-20261015.js — journey-endgame r12 proof test.
// BLANK (found via the r12 post-win probe): the table opener's "once after
// it resolves" half never fired for villagers who had already remarked while
// the table waited. The once-per guard compared sitting only, so a waiting
// remark ate the resolved remark — the two resolved lines ("You walked out
// of the light and came back breathing...") were unreachable for them.
// FIX: src/js/conversation.js convoTableOpener — the remark kind ('waiting'
// vs 'done') is part of the once-per key: one waiting remark AND one
// resolved remark per sitting; repeats within a phase still fire only once.
// RED: post-win opener returns null for a villager who remarked while
// waiting. GREEN: it fires the resolved line once, then goes silent.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 48, mode: 'remark-kind-proof' });
  await setupGame(Game);
  const G = Game;
  const pg = G.progState();
  const T = G.tableState();
  const vids = (G.state.village.roster || []).filter(id => id !== G.villagerId);
  if (vids.length < 2) { console.log('SKIP: roster too small'); process.exit(2); }
  const [va, vb] = vids;
  let pass = 0, fail = 0;
  const check = (name, cond) => {
    console.log((cond ? '  ok   ' : '  FAIL ') + name);
    if (cond) pass++; else fail++;
  };

  // ---- phase 1: table waiting ----
  pg.tableSittingId = 1; pg.tableWaiting = true; pg.tableDone = true;
  T.phase = 'paths'; T.winDeferred = false;
  const w1 = G.convoTableOpener(va);
  check('waiting remark fires for a fresh villager', !!w1 && /table|ring|light|sky|faces/i.test(w1.line));
  const w2 = G.convoTableOpener(va);
  check('waiting remark does not loop (second call silent)', w2 === null);

  // ---- phase 2: resolved (win). va already remarked while waiting. ----
  pg.tableWaiting = false; T.phase = 'done';
  const d1 = G.convoTableOpener(va);
  check('resolved remark fires even though va remarked while waiting (RED case)',
    !!d1 && /walked out of the light|light's gone|meant something|did it work/i.test(d1.line));
  const d2 = G.convoTableOpener(va);
  check('resolved remark does not loop (second call silent)', d2 === null);

  // ---- phase 3: a villager who never remarked gets the resolved line ----
  const d3 = G.convoTableOpener(vb);
  check('resolved remark fires for a villager with no prior remark',
    !!d3 && /walked out of the light|light's gone|meant something|did it work/i.test(d3.line));

  // ---- phase 4: a NEW sitting resets the key ----
  pg.tableSittingId = 2; pg.tableWaiting = true; T.phase = 'paths';
  const w3 = G.convoTableOpener(va);
  check('new sitting re-arms the waiting remark', !!w3);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
