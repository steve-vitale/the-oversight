#!/usr/bin/env node
// test-finale-march-refusal-once-per-day-20261119.js — proof for the
// journey-crisis r253 march-gate refusal spam (r233 class).
//
// THE DEFECT (PS4 arm, seed 14562 d103): the Commercial Break march gate
// (finale-campaign.js, startCombat 'finale_crew' pre-gate) said its full
// refusal paragraph on EVERY attempt while the muster stood short — 10
// identical "⛔ THE COMMERCIAL BREAK does not notice you..." lines on one
// day (and 2 on 14561 d103). The Herald titan gate got the r233 fix
// ("said ONCE per titan per day — a scholar camped at a lair was refused
// 10x in one day (103402)"); this sibling march gate never got it. The
// refusal still stands on every attempt (return null); only the spoken
// line is deduped.
//
// THE FIX (src/js/finale-campaign.js): record the march-refusal day in
// campaign state (saved with the run, same home as `started`) and say the
// line only when the day differs — the r233 pattern, same one-line-per-day
// bar the prereg's thread 12 binds ("refusal lines per titan per day ≤ 1").
//
// RED (before): 3 attempts on d103 say the line 3x (want 1). GREEN
// (after): 3 attempts on d103 say it once; one attempt on d104 says it
// once more (5/5).
//
// Usage: node scripts/test-finale-march-refusal-once-per-day-20261119.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 14562, mode: 'finale-march-refusal-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const marchLines = () => said.filter(t => /THE COMMERCIAL BREAK does not notice/i.test(t));

  // Stage: campaign unstarted, muster empty (0 of 20 blades).
  const camp = (Game._finaleTest && Game._finaleTest.campaign) ? Game._finaleTest.campaign() : null;
  check('staging: finale campaign exists and is unstarted',
    !!camp && camp.started === false, JSON.stringify(camp));
  check('staging: finale muster not ready (0 of 20)',
    Game.titanMusterReady('finale') === false);
  Game.state.scholar = Game.state.scholar || {};

  // ---- day 103: three attempts, one spoken line ----
  Game.state.scholar.day = 103;
  const r1 = Game.startCombat('finale_crew');
  const r2 = Game.startCombat('finale_crew');
  const r3 = Game.startCombat('finale_crew');
  check('three march attempts all refused (null, no fight)',
    r1 === null && r2 === null && r3 === null);
  check('day 103: refusal spoken exactly once across 3 attempts',
    marchLines().length === 1, 'said=' + marchLines().length);
  check('day 103: the one line says "(you have 0)"',
    marchLines().length === 1 && /\(you have 0\)/.test(marchLines()[0]),
    marchLines()[0] || '(no line)');

  // ---- day 104: one attempt, spoken once more ----
  Game.state.scholar.day = 104;
  const r4 = Game.startCombat('finale_crew');
  check('day 104: attempt refused (null)', r4 === null);
  check('day 104: refusal spoken once more (total 2)',
    marchLines().length === 2, 'said=' + marchLines().length);

  console.log(fail ? `\nRESULT: FAIL (${fail} failed, ${pass} passed)` : `\nRESULT: PASS (${pass} passed)`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
