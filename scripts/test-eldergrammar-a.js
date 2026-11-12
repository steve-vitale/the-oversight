// PROOF: veteran-monster say-line grammar (sim-eldergrammar-a, 2026-11-12).
// Tracker blank #6 / sim-findings.md line 2281 (Loop A arm sim-stallcut-a):
// the veteran say line read "A Elder veteran" — "A Elder" must be "An Elder".
// It fired 3 times on the stall-cut band (seeds 190391/190396/190397).
//
// Proves, by driving the REAL startCombat veteran path (not a string
// literal of the fix):
//   (a) the elder variant emits "An Elder veteran" (full line checked);
//   (b) the scarred / pack-leader variants still emit "A Scarred veteran"
//       and "A Pack-leader veteran" (article untouched where it was right);
//   (c) no emitted say line anywhere in the three veteran fights contains
//       "A Elder";
//   (d) the literal "A Elder" no longer appears anywhere in src/js/game.js.
// Canon note: no canon doc covers veteran-monster say lines (MONSTER-WAVES.md
// mentions veterans only as living-roster kill counts); this is a narration
// string only, no sim impact, no sim re-run needed.
// Usage: node scripts/test-eldergrammar-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

async function main() {
  const Game = await L.load({ seed: 7, narration: true });
  L.newRun(Game, 'Columbus, Ohio');
  const s = Game.state.scholar;
  s.kcal = 5000;
  if ((s.health || 0) < 100) s.health = 100;

  const says = L.captureSays(Game);
  const allLines = []; // every say line across all three veteran fights
  const seededRandom = Math.random; // mulberry32(seed) installed by loadGame

  // Force the veteran-variant roll: scarred < 0.34, elder < 0.67, else pack-leader.
  // The forced value stands for the whole startCombat call (the roll is the
  // first Math.random() in the veteran block; other rolls in the call just
  // see a deterministic constant), then the seeded RNG is restored.
  function veteranFight(forcedRoll) {
    says.length = 0;
    s.feastDraw = { monsterId: 'bulldozer', veteran: true, day: s.day || 1 };
    Math.random = () => forcedRoll;
    try {
      Game.startCombat('bulldozer');
    } finally {
      Math.random = seededRandom;
    }
    const line = says.find(t => t.indexOf('This one is different') >= 0) || '';
    allLines.push.apply(allLines, says);
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
    return line;
  }

  const elder = veteranFight(0.50);
  check('elder variant fires the veteran line', elder.length > 0, 'no veteran line captured');
  check('elder line reads "An Elder veteran"',
    elder.indexOf('old, patient, unhurried — it has seen your kind before. An Elder veteran.') >= 0,
    JSON.stringify(elder));
  check('elder line has no "A Elder"', elder.indexOf('A Elder') < 0, JSON.stringify(elder));

  const scarred = veteranFight(0.10);
  check('scarred line reads "A Scarred veteran"',
    scarred.indexOf('scarred, braced, waiting for your opening. A Scarred veteran.') >= 0,
    JSON.stringify(scarred));

  const pack = veteranFight(0.90);
  check('pack-leader line reads "A Pack-leader veteran"',
    pack.indexOf("bigger, and it didn't come alone. A Pack-leader veteran.") >= 0,
    JSON.stringify(pack));

  // (c) + (d): no "A Elder" anywhere in the veteran say path or the source.
  const allSays = allLines.join(' ');
  check('no "A Elder" in any captured say line', allSays.indexOf('A Elder') < 0, JSON.stringify(allSays));
  const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
  check('no literal "A Elder" remains in src/js/game.js', gameSrc.indexOf('A Elder') < 0);

  says.restore();
  console.log(`eldergrammar-a: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('eldergrammar-a crashed:', e); process.exit(1); });
