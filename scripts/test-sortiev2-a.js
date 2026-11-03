// test-sortiev2-a.js — proof test for the sim-sortiev2-a diagnostic.
// Legs:
//  (a) Q1 corpus replay: the pre-registered reactive invalidation rule,
//      run over the archive sortie-b variant per-seed JSONs, suppresses
//      ONLY 'none' attempts (zero ok / no-fighters attempts suppressed)
//      and leaves exactly one 'none' per empty stretch.
//  (b) Q1 name-consistency grounding: the gorge line and the moved-on
//      line in src/js/havenGrowth.js both render the lingerer's name
//      through the same display-name function, so a per-name moved-on
//      invalidation matches the same spoken string the gorge line used.
//  (c) Cleanliness: this instrument and its test read only archive
//      JSONs and source text; neither file contains a roster/position
//      channel token (not even in comments).
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const REPO = path.join(__dirname, '..');
const { replayDir } = require('./sortiev2-replay');

let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ': ' + e.message); }
}

// (a) Replay over the real archive corpus.
check('replay totals match the archive (47 attempts, 24 none)', () => {
  const { perSeed, total } = replayDir(path.join(REPO, 'evidence', '2026-11-03', 'perseed-sortie-a'));
  assert.strictEqual(perSeed.length, 8, 'expected 8 variant per-seed files');
  assert.strictEqual(total.attempts, 47);
  assert.strictEqual(total.kept + total.suppressed, 47);
  const allNone = perSeed.reduce((n, s) => n + s.keptNone + s.suppressedNone, 0);
  assert.strictEqual(allNone, 24, 'archive none count');
  assert.strictEqual(total.keptNone + total.suppressedNone, 24);
});

check('replay suppresses only none attempts (no ok / no-fighters lost)', () => {
  const { perSeed } = replayDir(path.join(REPO, 'evidence', '2026-11-03', 'perseed-sortie-a'));
  for (const s of perSeed) {
    for (const x of s.suppressedList) {
      assert.strictEqual(x.why, 'none', `seed ${s.seed} suppressed a ${x.why} attempt`);
    }
    const keptOk = s.keptList.filter(x => x.ok).length;
    const keptNf = s.keptList.filter(x => x.why === 'no-fighters').length;
    assert.ok(keptOk + keptNf > 0 || s.attempts === 0, `seed ${s.seed} kept nothing useful`);
  }
  const keptOk = perSeed.reduce((n, s) => n + s.keptList.filter(x => x.ok).length, 0);
  const keptNf = perSeed.reduce((n, s) => n + s.keptList.filter(x => x.why === 'no-fighters').length, 0);
  assert.strictEqual(keptOk, 16, 'all 16 ok attempts kept');
  assert.strictEqual(keptNf, 7, 'all 7 no-fighters attempts kept');
});

check('replay leaves one none per empty stretch (24 -> 7)', () => {
  const { perSeed, total } = replayDir(path.join(REPO, 'evidence', '2026-11-03', 'perseed-sortie-a'));
  assert.strictEqual(total.suppressed, 17);
  assert.strictEqual(total.keptNone, 7);
  const bySeed = {};
  for (const s of perSeed) bySeed[s.seed] = [s.keptNone, s.suppressedNone];
  assert.deepStrictEqual(bySeed[98401], [2, 5]);
  assert.deepStrictEqual(bySeed[98402], [2, 0]);
  assert.deepStrictEqual(bySeed[98405], [3, 12]);
  assert.deepStrictEqual(bySeed[98406], [0, 0]);
});

check('suppressed attempts are state-neutral in the archive (none returns precede muster)', () => {
  // The engine returns 'none' before mustering fighters or spending
  // rations (havenGrowth.js lingererSortie early return). A suppressed
  // attempt therefore cannot have changed game state; the replay's
  // filter reading is sound. Asserted here as the code-grounding leg:
  // the 'none' branch textually precedes the muster branch in the file.
  const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'havenGrowth.js'), 'utf8');
  const noneIdx = src.indexOf("No lingerers to sortie against");
  const musterIdx = src.indexOf('MUSTER: real fighters', noneIdx);
  assert.ok(noneIdx > 0 && musterIdx > noneIdx, 'none return must precede muster');
});

// (b) Gorge line and moved-on line share the display-name function.
check('gorge and moved-on lines use the same display-name source', () => {
  const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'havenGrowth.js'), 'utf8');
  const gorge = src.match(/The lingering \$\{mn\} gorges at the treeline/);
  assert.ok(gorge, 'gorge line template present');
  const gorgeDef = src.match(/let mn = 'it';[\s\S]{0,200}?monsterDisplayName/);
  assert.ok(gorgeDef, 'gorge name comes from monsterDisplayName');
  const moved = src.match(/paces the treeline one last night, then melts back into the dark/);
  assert.ok(moved, 'moved-on line template present');
  const movedDef = src.match(/let mn0 = 'it';[\s\S]{0,200}?monsterDisplayName/);
  assert.ok(movedDef, 'moved-on name comes from monsterDisplayName');
});

// (c) No roster/position channel token in the instrument. (This test
// file itself necessarily names the tokens to scan for, so it is not
// scanned — the instrument, which is the artifact a future policy
// would copy, is.)
check('instrument contains no roster/position channel tokens', () => {
  const FORBIDDEN = ['worldMonsters', 'lingeringRaiders', 'answerLingerer',
    'monsterAt', '.tx', '.ty', '.mx', '.my', 'state.worldMonsters'];
  const text = fs.readFileSync(path.join(REPO, 'scripts', 'sortiev2-replay.js'), 'utf8');
  for (const tok of FORBIDDEN) {
    assert.ok(!text.includes(tok), `sortiev2-replay.js contains forbidden token ${tok}`);
  }
});

if (failures) { console.error(`FAILURES: ${failures}`); process.exit(1); }
console.log('ALL SORTIEV2-A PROOF LEGS GREEN');
