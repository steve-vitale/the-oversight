// scripts/test-instruments-gap-b16.js — B16 proof: the tbstarts-diag
// recorder covers the direct-build alien-duel entry path
// (gap-instruments, 2026-10-27, d94 finding 1213).
//
// BEFORE (verified 2026-10-27, before the fix): the tbstarts-diag
// recorder wrapped startCombat only, so the 73671 d94 alien duel
// (id fmgpspijo_f53f9n, token 15) produced a tbEnd row with NO start
// row — see scripts/test-d94-a.js (44 PASS) and the corpus row in
// evidence/2026-10-27/perseed-tbstarts-a/s73671-armed.json.
// AFTER (this script, live): a real startAlienCombat call on a real
// loaded game gains a start row that its tbEnd joins by id + token.
//
// CONTROL VIEW (the pre-fix behavior, inside this run): the duel's
// start row carries via:'startAlienCombat' and NO startCombat row
// exists for the fight — a startCombat-only recorder would still
// miss it, exactly as the d94 corpus shows.
//
// Uses the shared sim-harness (loadGame/setupGame), never copied
// eval boilerplate. Writes nothing into the repo. Exit code 0 = pass.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const { newStore, installTbstartsDiag } = require('./policies/tbstarts-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 73671, mode: 'gap-b16-proof', fullTelemetry: false });
  await setupGame(Game, 'Columbus, Ohio');
  check('game loaded with startAlienCombat + apBuildFighter',
    typeof Game.startAlienCombat === 'function' && typeof Game.apBuildFighter === 'function');

  const store = newStore();
  installTbstartsDiag(Game, store);
  check('recorder installed with zero errors', store.installed === true && store.errs === 0,
    'installed=' + store.installed + ' errs=' + store.errs);
  check('no start rows before the duel', store.starts.length === 0);

  // The d94 shape, live: a person-fighter built by the module itself.
  const fighter = Game.apBuildFighter('sarge', 4, 4);
  check('module-built fighter is a hostile person (key ap_sarge)',
    fighter && fighter.kind === 'hostile' && fighter.key === 'ap_sarge' && fighter.alienPid === 'sarge',
    fighter && JSON.stringify({ kind: fighter.kind, key: fighter.key, alienPid: fighter.alienPid }));

  const fight = Game.startAlienCombat(fighter);
  check('startAlienCombat returned the live fight (return value untouched)',
    !!fight && fight === Game.tbfight, fight && fight.id);
  check('recorder errors still 0 after the duel start', store.errs === 0,
    JSON.stringify(store.errors));
  check('exactly one start row recorded for the duel', store.starts.length === 1,
    'starts=' + store.starts.length);

  const row = store.starts[0] || {};
  check('start row is marked via startAlienCombat, alien:true',
    row.via === 'startAlienCombat' && row.alien === true, 'via=' + row.via + ' alien=' + row.alien);
  check('start row postId matches the live fight id',
    row.postId === fight.id, 'postId=' + row.postId + ' fight=' + fight.id);
  check('start row fighter list includes the alien fighter',
    (row.postFighters || []).some(f => f.id === 'sarge' && f.kind === 'hostile'),
    JSON.stringify(row.postFighters));
  check('startCombat-only control view: no startCombat row for this fight',
    !store.starts.some(s => s.via !== 'startAlienCombat' && (s.postId === fight.id || s.preId === fight.id)),
    JSON.stringify(store.starts.map(s => s.via)));

  // End the duel the way real runs do, and prove the join the d94
  // end failed: same fight id AND same token as the new start row.
  const endsBefore = store.ends.length;
  try { Game.tbEnd('lost'); } catch (e) { /* settlement side effects must not hide the row check */ }
  check('a tbEnd row was recorded for the duel', store.ends.length === endsBefore + 1,
    'ends=' + store.ends.length);
  const end = store.ends[store.ends.length - 1] || {};
  check('tbEnd row joins the duel start by fight id',
    end.id === row.postId, 'end.id=' + end.id + ' start.postId=' + row.postId);
  check('tbEnd row joins the duel start by recorder token',
    end.token === row.postToken && end.token !== null,
    'end.token=' + end.token + ' start.postToken=' + row.postToken);
  check('recorder errors still 0 after tbEnd', store.errs === 0,
    JSON.stringify(store.errors));
  check('no throws recorded for the duel path', store.throws.length === 0);

  console.log(`\nB16 proof: ${pass} PASS, ${fail} FAIL`);
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error('B16 proof crashed: ' + (e && e.stack || e)); process.exitCode = 1; });
