#!/usr/bin/env node
// test-simharness-mantle-wrap-20261013.js — PROOF (journey-succession 2026-10-13).
// Bug: journal.js installs its playerDeath wrap (writeEpitaph/welcomeBearer —
// the journal's epitaph in the dying life's register and the new hand's first
// line) on a deferred macrotask (setTimeout 0), because ledger.js loads after
// journal.js. In the browser each <script> is its own task so the timer fires
// after all scripts attach. In node the whole module eval is one synchronous
// block and every subsequent await is a microtask, so the timer starved until
// the sim ended: EVERY sim silently ran without the journal mantle feature.
// No epitaph was ever written and no new-hand line ever recorded in any sim.
//
// Fix: sim-harness loadGame yields one macrotask after eval, before init().
// This test asserts:
//   1. Immediately after loadGame returns (no extra waiting), the journal
//      mantle wrap is installed (Game.playerDeath._journalMantleWrapped).
//   2. A real playerDeath writes the epitaph life + epitaph/newhand marginalia
//      into the journal mantle record.
// RED: on pristine sim-harness (no macrotask yield), assertion 1 fails.
// Usage: node scripts/test-simharness-mantle-wrap-20261013.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: 20261013, mode: 'mvc' });
  check('modules load clean', (loadFails || []).length === 0, (loadFails || []).join('; '));
  check('journal mantle wrap installed by loadGame (no extra wait)',
    !!(Game.playerDeath && Game.playerDeath._journalMantleWrapped),
    'wrap missing: deferred installer never ran');

  await setupGame(Game);
  const oldId = Game.villagerId;
  const oldName = (() => { try { return Game.displayName(oldId); } catch (e) { return '?'; } })();
  try { Game.playerDeath('combat'); } catch (e) { check('playerDeath runs', false, e.message); }
  let mr = null;
  try { mr = Game.mantleRecord(); } catch (e) { check('mantleRecord readable', false, e.message); }
  const lives = (mr && mr.lives) || [];
  check('epitaph life recorded', lives.length === 1 && lives[0].vid === oldId,
    `lives=${lives.length}`);
  if (lives.length === 1) {
    const firstOf = n => String(n || '').split(' ')[0];
    check('epitaph names the dead bearer', firstOf(lives[0].name) === firstOf(oldName), `name=${lives[0].name} vs ${oldName}`);
    check('epitaph cause recorded', lives[0].cause === 'combat', `cause=${lives[0].cause}`);
    check('epitaph has a voice register', !!lives[0].register, 'no register');
  }
  const marg = (mr && mr.marginalia) || [];
  const kinds = marg.map(m => m.kind);
  check('epitaph marginalia written', kinds.includes('epitaph'), `kinds=${kinds.join(',')}`);
  check('new-hand marginalia written', kinds.includes('newhand'), `kinds=${kinds.join(',')}`);
  const nh = marg.find(m => m.kind === 'newhand');
  check('new hand is the successor, not the corpse',
    !!nh && nh.life === Game.villagerId && nh.life !== oldId,
    nh ? `life=${nh.life} bearer=${Game.villagerId} old=${oldId}` : 'no newhand');
  const ep = marg.find(m => m.kind === 'epitaph');
  check('epitaph text non-empty', !!(ep && ep.text && ep.text.length > 10),
    ep ? `len=${(ep.text || '').length}` : 'no epitaph');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.message); process.exit(2); });
