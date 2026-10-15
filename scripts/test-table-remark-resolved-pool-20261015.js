#!/usr/bin/env node
// test-table-remark-resolved-pool-20261015.js — journey-endgame r13 BLANK:
// post-win villagers served the WAITING table line ("it's just sitting
// there. Waiting on you.") after the table resolved. Root causes:
//  (1) convoTableOpener's pool branched on `waiting` (pg.tableWaiting,
//      never cleared by resolve paths) instead of the kind-aware wantKind;
//  (2) the 4 terminal resolve sites in table.js never cleared tableWaiting.
// Proof: RED on pristine (waiting line post-win), GREEN post-fix.
// Uses the shared sim-harness kit (seeded RNG before eval). No stash —
// patch round-trip per AGENTS.md.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const WAITING_SIGS = ['Waiting on you', 'nobody knows what to do with their hands', 'Too many angles'];
const RESOLVED_SIGS = ['walked out of the light', "light's gone", 'sky again'];
const DEFERRED_SIGS = ['ninety dawns'];

function sigOf(line) {
  if (WAITING_SIGS.some(s => line.includes(s))) return 'waiting';
  if (RESOLVED_SIGS.some(s => line.includes(s))) return 'resolved';
  if (DEFERRED_SIGS.some(s => line.includes(s))) return 'deferred';
  return 'unknown:' + String(line).slice(0, 60);
}

async function main() {
  const { Game } = await loadGame({ seed: 48, mode: 'test-table-remark-r13' });
  await setupGame(Game);
  const G = Game;
  const roster = (G.state.village.roster || []).filter(id => {
    try { return !(G.getPerson(id) || {}).dead; } catch (e) { return false; }
  });
  if (roster.length < 3) { console.log('SKIP: not enough living villagers'); process.exit(2); }
  const pg = G.progState();
  const T = G.tableState();
  let fails = 0;
  const check = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) fails++;
  };

  // --- Case 1: post-win state (the observed bug). tableWaiting is STALE-true
  // (the old resolve paths never cleared it); the kind must still win.
  pg.tableSittingId = 1; pg.tableWaiting = true; pg.tableDone = true;
  T.phase = 'done'; T.winDeferred = false;
  const r1 = G.convoTableOpener(roster[0]);
  check('post-win remark fires', !!r1, r1 && r1.line);
  check('post-win remark uses the RESOLVED pool', !!r1 && sigOf(r1.line) === 'resolved',
    r1 && ('got [' + sigOf(r1.line) + '] ' + r1.line));

  // --- Case 2: the once-per-kind guard still holds post-win (no loops).
  const r1b = G.convoTableOpener(roster[0]);
  check('post-win remark fires once per kind', r1b === null, r1b && r1b.line);

  // --- Case 3: while the table waits, the WAITING pool still fires.
  pg.tableWaiting = true; pg.tableDone = true; T.phase = 'paths'; T.winDeferred = false;
  const r2 = G.convoTableOpener(roster[1]);
  check('waiting remark fires while sitting', !!r2, r2 && r2.line);
  check('waiting remark uses the WAITING pool', !!r2 && sigOf(r2.line) === 'waiting',
    r2 && ('got [' + sigOf(r2.line) + '] ' + r2.line));

  // --- Case 4: a villager who remarked while waiting still gets the
  // resolved remark after the win (r12's kind-aware guard, intact).
  const c3 = G.convoGet(roster[2]);
  c3.tableRemarked = { sitting: 1, kind: 'waiting' };
  pg.tableWaiting = true; pg.tableDone = true; T.phase = 'done'; T.winDeferred = false;
  const r3 = G.convoTableOpener(roster[2]);
  check('waiting-remarked villager gets the resolved remark', !!r3 && sigOf(r3.line) === 'resolved',
    r3 && ('got [' + sigOf(r3.line) + '] ' + (r3.line || 'null')));

  // --- Case 5: deferral keeps its own line.
  pg.tableWaiting = true; pg.tableDone = false; T.phase = 'paths'; T.winDeferred = true;
  const c4 = G.convoGet(roster[0]); delete c4.tableRemarked;
  const r4 = G.convoTableOpener(roster[0]);
  check('deferral remark keeps the deferral line', !!r4 && sigOf(r4.line) === 'deferred',
    r4 && ('got [' + sigOf(r4.line) + '] ' + (r4.line || 'null')));

  console.log(fails === 0 ? 'ALL GREEN' : fails + ' FAILURES');
  process.exit(fails === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
