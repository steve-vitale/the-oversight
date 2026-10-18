#!/usr/bin/env node
// test-facilitate-relay-20261018.js — proof test for the r17 blank #2:
// appointing a villager to the relay never records the architect's credit.
//
// Observed in journey-endgame-r17 (community arm, all 3 won runs): the
// flavor appointed villagers to the relay (commRelayAppointed=1), 6
// ascensions fired across the arm — but pg.table.facilitated stayed None,
// so the epilogue played OUTSHONE ("the record notes... that you watched")
// instead of ARCHITECT. Root cause: the facilitation tracking lives in
// tableFacilitate('relay'), but the real verb — appointSwitchboard, called
// by the Haven UI (app.js) and by policies — never records it. TABLE.md
// names appointSwitchboard itself as the facilitation verb.
//
// RED (before fix): appointSwitchboard succeeds but facilitated stays
// empty. GREEN (after fix): the 'relay' act is recorded at the verb.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 8952, mode: 'test-facilitate-relay' });
  await setupGame(Game);
  // Make the office available: switchboardAvailable() = networkLive && !switchboard().
  Game.state.networkLive = true;
  const cands = (Game.switchboardCandidates ? Game.switchboardCandidates() : []) || [];
  if (!cands.length) { console.log('SKIP: no switchboard candidates'); process.exit(2); }
  const vid = cands[0].id;
  const nm = cands[0].name || vid;

  let ok = false;
  try { ok = !!Game.appointSwitchboard(vid); } catch (e) { console.log('appointSwitchboard threw: ' + e.message); }
  let acts = null;
  try {
    const T = Game.tableState ? Game.tableState() : {};
    const fac = (T && T.facilitated) || {};
    acts = fac[vid] ? fac[vid].acts : null;
  } catch (e) {}
  const recorded = !!(acts && acts.indexOf('relay') >= 0);
  console.log((recorded ? 'PASS' : 'FAIL') + ': appointSwitchboard(' + nm + ') ' +
    (ok ? 'succeeded' : 'FAILED') + ', facilitated acts = ' + JSON.stringify(acts));
  if (!ok || !recorded) { console.log('RED: the relay appointment did not record the architect\'s credit'); process.exit(1); }
  console.log('GREEN: appointing the relay records the facilitation act');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
