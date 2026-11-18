#!/usr/bin/env node
// test-table-sitting-20261117.js — proof for the journey-scale r236
// tableActive-distinction fix (Q6, r233-owed).
//
// THE DEFECT (r228 + r233): tableActive() is true in THREE states — a live
// table sitting, the win-day-floor deferral, and the LADDER MERCY window
// (a capstone delivered, finale unresolved). The mercy window is
// protection from AMBIENT pressure (raids, roaming monsters); a titan
// fight is a deliberate, player-initiated coalition hunt, and the
// engine's titan gate never checks tableActive() — the fight is allowed
// during mercy. But the sim driver's muster + march steps hold on
// tableActive(), so during the ~74-day mercy window the competent
// player never musters even though the engine would let the fight
// happen. r233's 103405 held 'tableActive' on 78 muster rows over 74
// days with the titan PRESENT on all 78.
//
// THE FIX (src/js/table.js): a new read-only query tableSitting() — true
// only while a table sequence is actually live (winDeferred, or
// tableDone && phase != 'done'). tableActive() is UNTOUCHED, so every
// ambient router behaves identically; only the muster/march hold
// predicate changes (driver MUSTER_HOLD=sitting). The driver reads the
// same distinction inline on the pre-fix engine, so both arms record
// comparable ta/ts values.
//
// RED (before): tableSitting is not a function — every state check fails.
// GREEN (after): the full state table below passes, and the equivalence
// property tableActive() === tableSitting() || mercy holds in every
// state (mercy = ladderCapstone && phase != 'done') — so the two
// predicates cannot drift apart silently.
//
// Usage: node scripts/test-table-sitting-20261117.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 103701, mode: 'table-sitting-proof' });
  await setupGame(Game);

  check('tableSitting exists (red: method absent)', typeof Game.tableSitting === 'function');
  check('tableActive exists (control)', typeof Game.tableActive === 'function');

  function setState(rig) {
    const pg = Game.progState();
    const T = Game.tableState();
    pg.tableDone = !!rig.tableDone;
    if (rig.capstone) pg.ladderCapstone = rig.capstone; else delete pg.ladderCapstone;
    T.winDeferred = !!rig.winDeferred;
    if (rig.phase) T.phase = rig.phase; else delete T.phase;
  }
  function read() {
    const sitting = (typeof Game.tableSitting === 'function') ? Game.tableSitting() : null;
    const active = (typeof Game.tableActive === 'function') ? Game.tableActive() : null;
    return { sitting, active };
  }
  // name, rig, expected sitting, expected active.
  // mercy (the part of active that is NOT a live sitting) is
  // capstone-delivered && phase != 'done' — asserted per state.
  const STATES = [
    ['fresh run: nothing delivered, no table', {}, false, false],
    ['mercy only: capstone delivered, no sitting', { capstone: 'feast_embassy' }, false, true],
    ['mercy only: military tribute delivered', { capstone: 'military_tribute' }, false, true],
    ['live sitting: tableDone, phase paths', { tableDone: true, phase: 'paths' }, true, true],
    ['live sitting + capstone delivered', { tableDone: true, phase: 'paths', capstone: 'feast_embassy' }, true, true],
    ['resolved finale: tableDone, phase done', { tableDone: true, phase: 'done' }, false, false],
    ['resolved finale + capstone delivered (mercy ends at resolve)', { tableDone: true, phase: 'done', capstone: 'military_tribute' }, false, false],
    ['win-day-floor deferral: winDeferred, no tableDone', { winDeferred: true }, true, true],
    ['win-deferred + capstone delivered', { winDeferred: true, capstone: 'trade_charter' }, true, true],
    ['tableDone but no phase yet (no sitting started)', { tableDone: true }, false, false],
    ['capstone + phase done, tableDone false (odd state: mercy off)', { phase: 'done', capstone: 'feast_embassy' }, false, false],
    ['win-deferred + resolved phase (deferral still sits)', { winDeferred: true, tableDone: true, phase: 'done' }, true, true],
  ];
  for (const [name, rig, wantSitting, wantActive] of STATES) {
    setState(rig);
    const { sitting, active } = read();
    check(name + ' — tableSitting() === ' + wantSitting, sitting === wantSitting, 'got ' + sitting);
    check(name + ' — tableActive() === ' + wantActive + ' (control, untouched)', active === wantActive, 'got ' + active);
    // Equivalence property: active === sitting || mercy, where mercy is
    // the capstone clause of tableActive (delivered && phase != 'done').
    const mercy = !!(rig.capstone && rig.phase !== 'done');
    check(name + ' — tableActive === tableSitting || mercy', active === (sitting || mercy), `active=${active} sitting=${sitting} mercy=${mercy}`);
  }

  // The distinction is what the muster step needs: during mercy the
  // sitting query is false while the active query is true — the two
  // predicates DIFFER exactly on the mercy rows, and agree everywhere
  // else in the table above.
  setState({ capstone: 'feast_embassy' });
  const m = read();
  check('mercy window: sitting false while active true (the distinction)', m.sitting === false && m.active === true, `sitting=${m.sitting} active=${m.active}`);
  setState({ tableDone: true, phase: 'paths' });
  const s = read();
  check('live sitting: both true (sanctity that matters is preserved)', s.sitting === true && s.active === true, `sitting=${s.sitting} active=${s.active}`);

  console.log(`\ntable-sitting: ${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}

main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
