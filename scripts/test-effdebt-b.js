#!/usr/bin/env node
// test-effdebt-b.js — proof for sim-effdebt-b (DIAG).
// Recomputes every judged number from the committed corpora and
// re-checks the mechanism code reads. No game code is executed
// (pure file reads), no RNG, no state edits. Exit non-zero on
// any failed check. DIAG-only run: no src/js or policy change
// is asserted here beyond the code reads themselves.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-30');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function loadCorpus(dir) {
  return fs.readdirSync(dir).sort().filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}
const census = JSON.parse(fs.readFileSync(path.join(EV, 'sim-effdebt-b-census.json'), 'utf8'));
// 1. Census totals recomputed from the tap logs.
for (const leg of ['guard', 'on']) {
  const insts = loadCorpus(path.join(EV, 'sim-effdebt-b-corpus-' + leg));
  check(leg + ' has 8 seed files', insts.length === 8, insts.length);
  let presses = 0, yielding = 0, refused = 0, neg = 0, would = 0, tapErrs = 0;
  for (const inst of insts) {
    tapErrs += inst.tapErrs || 0;
    check(leg + ' seed ' + inst.seed + ' survived 30 days', inst.endReason === 'survived' && inst.daysAlive === 30, { end: inst.endReason, days: inst.daysAlive });
    for (const t of inst.taps || []) {
      if (t.kind !== 'forage') continue;
      presses++;
      if (t.kcalAfter < t.kcalBefore) yielding++;
      if (t.kcalAfter === t.kcalBefore) refused++;
      if (t.kcalBefore < 60) would++;
      if (t.kcalAfter < 0) {
        neg++;
        check(leg + ' s' + inst.seed + ' d' + t.loopDay + ' negative delta is exactly -60',
          t.kcalAfter - t.kcalBefore === -60, { b: t.kcalBefore, a: t.kcalAfter });
        check(leg + ' s' + inst.seed + ' d' + t.loopDay + ' press never names the 60 cost',
          !(t.sayAdded || []).some((l) => /60 kcal|effort|spent/i.test(l)), t.sayAdded);
      }
    }
  }
  check(leg + ' presses recomputed', presses === census[leg].totals.foragePresses, { presses, census: census[leg].totals.foragePresses });
  check(leg + ' yielding recomputed', yielding === census[leg].totals.yieldingPresses, { yielding, census: census[leg].totals.yieldingPresses });
  check(leg + ' refused recomputed', refused === census[leg].totals.refusedPresses, { refused, census: census[leg].totals.refusedPresses });
  check(leg + ' would-be-debt recomputed', would === census[leg].totals.wouldBeDebt, { would, census: census[leg].totals.wouldBeDebt });
  check(leg + ' negatives recomputed', neg === census[leg].totals.negativePresses, { neg, census: census[leg].totals.negativePresses });
  check(leg + ' tapErrs 0', tapErrs === 0, tapErrs);
}
// 2. Totals across legs.
check('total presses 917', census.totals.foragePresses === 917, census.totals);
check('total negatives 14', census.totals.negativePresses === 14, census.totals);
// 3. Restoration recomputed: morning snap >= 0 for every negative; food/floored split 4/10.
let food = 0, floored = 0;
for (const leg of ['guard', 'on']) {
  for (const n of census[leg].negatives) {
    check('morning snap >= 0 for ' + leg + ' s' + n.seed + ' d' + n.loopDay, n.restoration.morningSnap !== null && n.restoration.morningSnap >= 0, n.restoration);
    if (n.restoration.kind === 'ate-food') food++; else floored++;
  }
}
check('food-restored negatives = 4', food === 4, food);
check('floored-without-food negatives = 10', floored === 10, floored);
// 4. Strand reproduction: 11 controls licensed, 11 presses, east mornings negative as wakeforage.
const replay = loadCorpus(path.join(EV, 'sim-effdebt-b-corpus-replay'));
const controls = replay.filter((r) => r.mode === 'control');
const presses = replay.filter((r) => r.mode === 'press');
check('11 replay controls', controls.length === 11, controls.length);
check('all controls judgedDiffs empty', controls.every((r) => Array.isArray(r.judgedDiffs) && r.judgedDiffs.length === 0),
  controls.map((r) => r.judgedDiffs));
check('11 replay presses', presses.length === 11, presses.length);
const expect = { 'on-10': [0, -60, 540], 'on-11': [31, -29, 720], 'on-14': [0, -60, 720], 'on-15': [52, -8, 630] };
for (const p of presses) {
  const k = p.leg + '-' + p.targetDay;
  if (expect[k]) {
    check('replay ' + k + ' kcal path', p.kcalBefore === expect[k][0] && p.kcalAfter === expect[k][1], { b: p.kcalBefore, a: p.kcalAfter });
    check('replay ' + k + ' known-edible E', p.totals.knownEdibleKcal === expect[k][2], p.totals.knownEdibleKcal);
  } else {
    check('replay ' + k + ' west/nothing press spends nothing', p.kcalAfter === p.kcalBefore && p.totals.knownEdibleKcal === 0,
      { b: p.kcalBefore, a: p.kcalAfter, E: p.totals.knownEdibleKcal });
  }
}
// 5. Determinism: re-run files byte-identical to judged files.
const detRec = fs.readFileSync(path.join(EV, 'sim-effdebt-b-corpus-determinism', 'effdebt-b-nighttravel-s15003.json'), 'utf8');
const judRec = fs.readFileSync(path.join(EV, 'sim-effdebt-b-corpus-on', 'effdebt-b-nighttravel-s15003.json'), 'utf8');
check('recorder determinism byte-identical', detRec === judRec);
const detPress = fs.readFileSync(path.join(EV, 'sim-effdebt-b-corpus-replay-determinism', 'wakeforage-replay-press-s15215-d10-on.json'), 'utf8');
const judPress = fs.readFileSync(path.join(EV, 'sim-effdebt-b-corpus-replay', 'wakeforage-replay-press-s15215-d10-on.json'), 'utf8');
check('press determinism byte-identical', detPress === judPress);
// 6. Mechanism code reads (static, pinned-base game code).
const gameJs = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
check('forage cost line is a bare deduction', gameJs.includes('scholar.kcal -= S.calories.ACTION_COSTS.forage'));
check('rest cost line is clamped', gameJs.includes('scholar.kcal = Math.max(0, restKcalBefore - S.calories.ACTION_COSTS.rest)'));
check('cutTree cost line is clamped', gameJs.includes('this.state.scholar.kcal = Math.max(0, this.state.scholar.kcal - 80)'));
check('talk cost line is clamped', gameJs.includes('this.state.scholar.kcal = Math.max(0, (this.state.scholar.kcal || 0) - 10)'));
const abilityJs = fs.readFileSync(path.join(ROOT, 'src', 'js', 'abilityActions.js'), 'utf8');
check('ability kcal handler refuses when short', abilityJs.includes("if ((s.kcal || 0) < amount)") && abilityJs.includes('Not enough energy'));
const foodPower = fs.readFileSync(path.join(ROOT, 'src', 'js', 'foodPower.js'), 'utf8');
check('foodPower refuses when short', foodPower.includes("if ((s.kcal || 0) < kc)"));
const calories = fs.readFileSync(path.join(ROOT, 'src', 'js', 'engine', 'calories.js'), 'utf8');
check('resolveDay deducts need unclamped then floors', calories.includes('scholar.kcal -= need') && calories.includes('scholar.kcal = Math.max(0, scholar.kcal)'));
check('resolveDay calls negative kcal display/logic noise', calories.includes('Negative kcal/hp are display/logic noise'));
console.log(`test-effdebt-b: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
