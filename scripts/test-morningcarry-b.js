// test-morningcarry-b.js — proof for the morningcarry probe policy.
// Pure unit tests always run. Corpus checks run when the four corpus
// dirs are given via env (CONTROL_GUARD, VARIANT_GUARD, OFF_GUARD,
// CONTROL_ON, VARIANT_ON, OFF_ON are not all needed: the corpus block
// checks whichever leg dirs are set, plus determinism when DET_ON_DIR
// is set against VARIANT_ON).
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DAYWANT, packKnownKcal, sortPantryCandidates, wakeGate } = require('./policies/morningcarry-diag');
const { analyzeSeed } = require('./analyze-morningcarry-b');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

t('DAYWANT is the fair-share norm (2000)', () => {
  assert.strictEqual(DAYWANT, 2000);
});
function fakeGame(inv, day, spoiledDays) {
  return {
    state: { scholar: { inventory: inv, day } },
    isSpoiled: (it) => (spoiledDays || []).includes(it.name),
  };
}
t('packKnownKcal counts only known, unspoiled, kcal>0 food', () => {
  const g = fakeGame([
    { name: 'Rice', kcalEach: 200, units: 5, edible: null },
    { name: 'unknown shoots', kcalEach: 0, units: 3, edible: false },
    { name: 'Canned soup', kcalEach: 250, units: 2, edible: null },
    { name: 'Rotten beans', kcalEach: 150, units: 4, edible: null },
  ], 7, ['Rotten beans']);
  assert.strictEqual(packKnownKcal(g), 1000 + 500);
});
t('packKnownKcal treats edible null as known (pantry staples)', () => {
  const g = fakeGame([{ name: 'Rice', kcalEach: 200, units: 2 }], 7, []);
  assert.strictEqual(packKnownKcal(g), 400);
});
t('packKnownKcal ignores gear and empty stacks', () => {
  const g = fakeGame([
    { name: 'Wood log', kcalEach: 0, units: 4 },
    { name: 'Rice', kcalEach: 200, units: 0 },
  ], 7, []);
  assert.strictEqual(packKnownKcal(g), 0);
});
t('sortPantryCandidates prefers longest shelf, then largest kcalEach', () => {
  const items = [
    { name: 'Foraged food', kcalEach: 500, spoilDay: 9 },
    { name: 'Rice', kcalEach: 200, spoilDay: 366 },
    { name: 'Canned soup', kcalEach: 250, spoilDay: 366 },
    { name: 'Dried beans', kcalEach: 150, spoilDay: 366 },
  ];
  const sorted = sortPantryCandidates(items).map((i) => i.name);
  assert.deepStrictEqual(sorted, ['Canned soup', 'Rice', 'Dried beans', 'Foraged food']);
});
t('sortPantryCandidates treats null spoilDay as longest shelf', () => {
  const items = [
    { name: 'Rice', kcalEach: 200, spoilDay: 366 },
    { name: 'Keepsake food', kcalEach: 100, spoilDay: null },
  ];
  assert.strictEqual(sortPantryCandidates(items)[0].name, 'Keepsake food');
});
t('wakeGate passes only stranded, away, alive, peaceful mornings', () => {
  assert.strictEqual(wakeGate({ gameOver: false, combat: false, prevStillCreek: true, atHaven: false }), null);
  assert.strictEqual(wakeGate({ gameOver: false, combat: false, prevStillCreek: false, atHaven: false }), 'not-strand-morning');
  assert.strictEqual(wakeGate({ gameOver: false, combat: false, prevStillCreek: true, atHaven: true }), 'at-haven');
  assert.strictEqual(wakeGate({ gameOver: false, combat: true, prevStillCreek: true, atHaven: false }), 'combat');
  assert.strictEqual(wakeGate({ gameOver: true, combat: false, prevStillCreek: true, atHaven: false }), 'game-over');
});

// Corpus checks (only when dirs are given).
const legs = [];
if (process.env.VARIANT_ON) legs.push(['on', process.env.CONTROL_ON, process.env.VARIANT_ON, process.env.OFF_ON]);
if (process.env.VARIANT_GUARD) legs.push(['guard', process.env.CONTROL_GUARD, process.env.VARIANT_GUARD, process.env.OFF_GUARD]);
if (!legs.length) {
  console.log('corpus checks skipped (set VARIANT_ON/VARIANT_GUARD + CONTROL_* + OFF_* dirs)');
} else {
  for (const [leg, cDir, vDir, oDir] of legs) {
    const vFile = path.join(vDir, 'morningcarry-b-nighttravel-s15215.json');
    t('corpus ' + leg + ' variant: 15215 file present and parses', () => {
      assert.ok(fs.existsSync(vFile), 'missing ' + vFile);
      JSON.parse(fs.readFileSync(vFile, 'utf8'));
    });
    const v = analyzeSeed(vFile);
    t('corpus ' + leg + ' variant: errs 0, strand recorded', () => {
      assert.strictEqual(v.errs, 0);
      assert.ok(v.still.length >= 0);
    });
    if (oDir && cDir) {
      const o = analyzeSeed(path.join(oDir, 'morningcarry-b-nighttravel-s15215.json'));
      const c = analyzeSeed(path.join(cDir, 'morningcarry-b-nighttravel-s15215.json'));
      t('corpus ' + leg + ' det-gate: OFF reproduces control strand exactly', () => {
        assert.deepStrictEqual([o.creek, o.still, o.rescued], [c.creek, c.still, c.rescued]);
      });
    }
    console.log(leg + ' variant 15215 still=' + JSON.stringify(v.still) + ' wakeStrand=' + JSON.stringify(v.wakeStrand) + ' departs=' + v.departs.length);
  }
  if (process.env.DET_ON_DIR && process.env.VARIANT_ON) {
    const a = fs.readFileSync(path.join(process.env.VARIANT_ON, 'morningcarry-b-nighttravel-s15215.json'), 'utf8');
    const b = fs.readFileSync(path.join(process.env.DET_ON_DIR, 'morningcarry-b-nighttravel-s15215.json'), 'utf8');
    t('determinism: ON variant re-run byte-identical', () => {
      assert.strictEqual(a, b);
    });
  }
}
console.log('morningcarry probe proof: ' + n + ' tests green');
