#!/usr/bin/env node
'use strict';
// Proof: aidAllyDown fires exactly once per ally per day
// (journey-crisis r274, FIX 1 for the r264 DOWNEDTWICE NO-GO).
//
// THE QUESTION (r264 run note): seed 14600 d95, Maya Cohen's "goes down"
// block emitted twice verbatim, adjacent in sayLines — trust -12 instead
// of -6, 2,000 kcal forgiven instead of 1,000. The #2634 fix guards the
// live->0 transition inside ONE fieldFight call; it does not cover
// aidFight being entered twice for the same fall in the tick. FIX 1 guards
// aidAllyDown itself (per ally+day dedup in src/js/comms.js), so every
// double-entry path is harmless.
//
// GREEN: the first call for an ally applies the fall (trust -6, debt
// -1000, one "goes down" line, returns true); the second call the same
// day for the same ally is a no-op (returns false, nothing moves, no
// second line); a different ally the same day still applies; the same
// ally on a later day applies again; a fall with no link still says the
// line once and dedups the second call.
// Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  Game.state.scholar.day = 5;
  const says = K.captureSays(Game);
  // Stage a real link the game's own way (mirrors
  // scripts/test-aid-comms-20261010.js setupAid): form the link, then set
  // the trust/debt the fall will move.
  const ovs = Game.state.otherVillages || [];
  assert(ovs.length > 0, 'fixture needs at least one other village');
  const VID = ovs[0].id;
  Game._formLink(VID, {}, null);
  const link = Game.linkWith(VID);
  assert(link, 'linkWith finds the formed link');
  link.trust = 50; link.aidDebtKcal = 5000;
  const goesDown = () => says.filter(s => /goes down in Haven's dirt/.test(s)).length;

  // ---- 1. FIRST FALL applies once. ----
  const r1 = Game.aidAllyDown(VID, 'Maya', 'Maya Cohen');
  check('first fall returns true', r1 === true, 'r1=' + r1);
  check('first fall: trust -6 exactly once', link.trust === 44, 'trust=' + link.trust);
  check('first fall: debt -1000 exactly once', link.aidDebtKcal === 4000, 'debt=' + link.aidDebtKcal);
  check('first fall: one goes-down line', goesDown() === 1, 'lines=' + goesDown());

  // ---- 2. SAME ALLY, SAME DAY, SECOND CALL is a no-op (the r264 bug). ----
  const r2 = Game.aidAllyDown(VID, 'Maya', 'Maya Cohen');
  check('second fall same day returns false', r2 === false, 'r2=' + r2);
  check('second fall: trust unmoved', link.trust === 44, 'trust=' + link.trust);
  check('second fall: debt unmoved', link.aidDebtKcal === 4000, 'debt=' + link.aidDebtKcal);
  check('second fall: no second goes-down line', goesDown() === 1, 'lines=' + goesDown());

  // ---- 3. DIFFERENT ALLY, SAME DAY still applies. ----
  const r3 = Game.aidAllyDown(VID, 'Fiona', 'Fiona Navarro');
  check('different ally same day returns true', r3 === true, 'r3=' + r3);
  check('different ally: trust -6 again', link.trust === 38, 'trust=' + link.trust);
  check('different ally: debt -1000 again', link.aidDebtKcal === 3000, 'debt=' + link.aidDebtKcal);
  check('different ally: its own goes-down line', goesDown() === 2, 'lines=' + goesDown());

  // ---- 4. SAME ALLY, NEXT DAY applies again (a new fall is a new fall). ----
  Game.state.scholar.day = 6;
  const r4 = Game.aidAllyDown(VID, 'Maya', 'Maya Cohen');
  check('same ally next day returns true', r4 === true, 'r4=' + r4);
  check('next day: trust -6 again', link.trust === 32, 'trust=' + link.trust);
  check('next day: one more goes-down line', goesDown() === 3, 'lines=' + goesDown());

  // ---- 5. NO LINK: the line still says once and dedups. ----
  const before = goesDown();
  const r5 = Game.aidAllyDown('nowhere-village', 'Sam', 'Sam Okafor');
  check('no-link fall returns true', r5 === true, 'r5=' + r5);
  check('no-link fall: one goes-down line', goesDown() === before + 1, 'lines=' + goesDown());
  const r6 = Game.aidAllyDown('nowhere-village', 'Sam', 'Sam Okafor');
  check('no-link second call returns false', r6 === false, 'r6=' + r6);
  check('no-link second call: no second line', goesDown() === before + 1, 'lines=' + goesDown());

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
