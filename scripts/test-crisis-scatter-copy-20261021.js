#!/usr/bin/env node
// test-crisis-scatter-copy-20261021.js — PROOF for journey-crisis r37 (lane B).
//
// BLANK: the village-lost end screen used one text for every villageLost —
// "THE VILLAGE DIES OUT / No one is left to pick up the Codex. The village
// dies out — quietly, the way villages do." But the scattering's own beat
// says people walked away ALIVE, in different directions ("Haven couldn't
// hold... The scattering, again"), and the extinction beat explicitly
// distinguishes itself with "Not scattered, not gone looking for food —
// dead, every one". A scattered village is not a dead village; the ending
// must name the loss honestly.
//
// RED on pristine HEAD: Game.villageLostCopy is not a function.
// GREEN post-fix:
//   1. the real scattering path (villageEats with an empty pantry on the
//      third hungry day) sets v.scattered=true + villageLost + over, and
//      says the scattering line;
//   2. villageLostCopy() returns THE SCATTERING copy (walking-away truth)
//      for the scattered state;
//   3. villageLostCopy() returns the legacy extinction copy BYTE-IDENTICAL
//      for non-scattered villageLost (test-ending-screen-20261012 keeps
//      passing);
//   4. app.js ending() branches on the scattered state (source-text wiring).
//
// Usage: node scripts/test-crisis-scatter-copy-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  Math.random = mulberry32(4242);
  const { Game } = await loadGame({ seed: 4242, mode: 'crisis-scatter-copy', fullTelemetry: false });
  const said = [];
  const _say = Game.say;
  Game.say = function (m) { try { said.push(String(m || '')); } catch (e) {} return _say ? _say.apply(this, arguments) : undefined; };
  await setupGame(Game);

  check('villageLostCopy-is-function', typeof Game.villageLostCopy === 'function',
    `typeof=${typeof Game.villageLostCopy}`);
  if (typeof Game.villageLostCopy !== 'function') {
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(1);
  }

  // ---- drive the REAL scattering path: empty pantry, third hungry day ----
  const v = Game.state.village;
  v.pantry = [];
  v.pantryKcal = 0;
  v.hungryDays = 2; // famineLimit is 3 without a granary; next hungry day scatters
  delete v.scattered;
  Game.over = false; Game.villageLost = false;
  try { Game.villageEats(); } catch (e) { check('villageEats-runs', false, String(e && e.message || e)); }
  check('scatter-sets-flag', v.scattered === true, `scattered=${v.scattered}`);
  check('scatter-sets-villageLost', Game.villageLost === true, `villageLost=${Game.villageLost}`);
  check('scatter-ends-run', Game.over === true, `over=${Game.over}`);
  const beat = said.find(s => /couldn.t hold/i.test(s));
  check('scatter-beat-narrated', !!beat && /started walking/i.test(beat),
    beat ? beat.slice(0, 110) : 'no scattering line said');

  // ---- the copy ----
  const sc = Game.villageLostCopy();
  check('scatter-title', sc.endTitle === 'THE SCATTERING', `title=${JSON.stringify(sc.endTitle)}`);
  check('scatter-sub-honest', /walked away/i.test(sc.sub) && /not dead/i.test(sc.sub),
    sc.sub.slice(0, 120));
  check('scatter-sub-not-extinction', !/quietly, the way villages do/i.test(sc.sub),
    'must not reuse the extinction framing');
  check('scatter-record-honest', /scattered/i.test(sc.recordTail),
    sc.recordTail.slice(0, 120));

  // ---- extinction path keeps the legacy copy byte-identical ----
  delete v.scattered;
  const ex = Game.villageLostCopy();
  check('extinct-title', ex.endTitle === 'THE VILLAGE DIES OUT', `title=${JSON.stringify(ex.endTitle)}`);
  check('extinct-sub', ex.sub === 'No one is left to pick up the Codex. The village dies out \u2014 quietly, the way villages do. The season ends here.',
    ex.sub.slice(0, 80));
  check('extinct-record', ex.recordTail === 'The Codex closes. Nobody will carry it.',
    ex.recordTail.slice(0, 60));

  // ---- wiring: app.js ending() branches on the scattered state ----
  const appSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'app.js'), 'utf8');
  const endingFn = appSrc.slice(appSrc.indexOf('function ending()'));
  const endBlock = endingFn.slice(0, endingFn.indexOf('\n  }\n') + 4);
  const codeOnly = endBlock.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  check('app-branches-scattered', /villageLostCopy/.test(codeOnly) && /scatter/i.test(codeOnly),
    'ending() must consult the scattered state via villageLostCopy()');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
