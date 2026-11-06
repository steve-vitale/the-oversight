// test-journey-deepening-r109-pkeep-20261106.js -- proof test for the
// R108 P-KEEP revision + RAJ-PHOTO watch scan (analyzer only; this run
// makes NO game-code change) PLUS the R109 additions: RE-ASK class
// (adopted from the r108 metric review) + RE-ASK-ORPHAN scan +
// FIZZLE-WATCH dry-line scan. R108 adopts r107's metric-review revision:
// NAMED-STRUCTURAL now requires a repay-opener line in the later
// sitting's THEM lines, not just a `want: repay` line (Maeve's r107
// day-60 sitting selected repay but never surfaced the promise). The old
// want-only rule is still computed as structOld for continuity.
//   1. Maeve-class: want=repay, no promise-naming THEM line -> SILENT
//      (revised) with structOld=true (old rule would have counted it).
//   2. Repay-opener surfacing -> NAMED via the promise regex.
//   3. Repay-opener line the regex misses ("You came through on ..."
//      with no second sentence) -> NAMED-STRUCTURAL (revised).
//   4. Plain promise wording -> NAMED.
//   5. No later sitting -> NO-LATER-SITTING.
//   6. Unrelated later sitting, no promise lines -> SILENT, structOld=false.
//   7. REPAY_OPENER vocabulary is grounded in src/js/convo-wants.js:
//      every phrase fragment appears in the repay opener/stale-opener
//      pools (guards the analyzer against rewording drift).
//   8-11. RAJ-PHOTO scan (classifyCuriousPlants) on synthetic transcripts:
//      Raj exemplar (plant, untestable), plant with a later photo return
//      (testable + returned), plant with a later sitting that never
//      returns (testable, not returned), betrayal-accept curious sitting
//      (no plant).
//  12-13. Post-panel (r108): NAMED evidence prefers a repay-opener line.
//  14-17. RE-ASK (r109): Chloe-class pair scores RE-ASK; a re-ask naming
//      an unseen short is NOT a re-ask of the thread (and IS an orphan);
//      NAMED outranks RE-ASK; REASK_OPENER is grounded in convo-wants.js.
//  18-21. FIZZLE-WATCH (r109): dry line in an ask_favor sitting counted
//      under ask_favor; dry line elsewhere counted separately; no dry
//      lines -> zero hits; Chloe pair produces no orphan.
// Run: node scripts/test-journey-deepening-r109-pkeep-20261106.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { classifyPromiseThreads, classifyCuriousPlants, scanReaskOrphans, classifyDryLines, REPAY_OPENER, REASK_OPENER } = require('./analyze-journey-deepening-r109-20261106.js');

let pass = 0;
function check(name, fn) { fn(); pass++; console.log('ok - ' + name); }

function sitting(seed, day, vid, wantLine, themLines, wantFinal) {
  const lines = [wantLine].concat(themLines.map(t => 'THEM: ' + t));
  if (wantFinal) lines.push('want final: id=' + wantFinal.id + ' stage=' + (wantFinal.stage || 0) + ' resolution=' + wantFinal.resolution);
  return { seed: String(seed), day, vid, text: lines.join('\n') + '\n' };
}
function promised(seed, day, vid, wantId) {
  return sitting(seed, day, vid, 'want: ' + wantId + ' (stage 0)',
    ['"Can you help? I need food."'], { id: wantId, stage: 1, resolution: 'promised' });
}

// 1. Maeve-class: repay selected, promise never surfaces.
check('pkeep: Maeve-class scores SILENT revised, structOld=true', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: repay (stage 0)', [
    '"I know who took the extra rations but won\'t say."',
    '"Walk with me to the thinking place."',
    '"Wild Strawberry — the leaves are the tea."',
  ], { id: 'repay', stage: 0, resolution: 'unestablished' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th.length, 1);
  assert.strictEqual(th[0].cls, 'SILENT');
  assert.strictEqual(th[0].structOld, true);
});

// 2. Repay-opener surfacing -> NAMED via the regex.
check('pkeep: repay opener surfacing scores NAMED', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: repay (stage 0)', [
    '"I\'ve been thinking about what you promised. I don\'t like owing kindness."',
  ], { id: 'repay', stage: 0, resolution: 'stated' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED');
});

// 3. Repay-opener line the regex misses -> NAMED-STRUCTURAL (revised).
check('pkeep: regex-miss repay opener scores NAMED-STRUCTURAL revised', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: repay (stage 0)', [
    '"You came through on the food I needed."',
  ], { id: 'repay', stage: 0, resolution: 'stated' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED-STRUCTURAL');
  assert.ok(/you came through on/i.test(th[0].evidence.opener));
});

// 4. Plain promise wording -> NAMED.
check('pkeep: plain promise wording scores NAMED', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: just_company (stage 0)', [
    '"You promised you would help with the stores."',
  ], { id: 'just_company', stage: 0, resolution: 'stated' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED');
});

// 5. No later sitting -> NO-LATER-SITTING.
check('pkeep: no later sitting scores NO-LATER-SITTING', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const th = classifyPromiseThreads([t1], []);
  assert.strictEqual(th[0].cls, 'NO-LATER-SITTING');
});

// 6. Unrelated later sitting -> SILENT, structOld=false.
check('pkeep: unrelated later sitting scores SILENT, structOld=false', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: just_company (stage 0)', [
    '"The rain is coming. We should mend the roof."',
  ], { id: 'just_company', stage: 0, resolution: 'stated' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'SILENT');
  assert.strictEqual(th[0].structOld, false);
});

// 7. REPAY_OPENER vocabulary grounded in the live code.
check('pkeep: REPAY_OPENER phrases exist in convo-wants.js', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'convo-wants.js'), 'utf8').toLowerCase().replace(/\\/g, '');
  const fragments = [
    'you came through on', "you said you'd help with", 'have you had a chance',
    'been thinking about what you promised', "haven't forgotten what you said you'd do",
    'keep thinking about what you did', 'still owe you the thanks',
    'keep turning it over', 'still on my mind', 'keep coming back to it',
  ];
  for (const f of fragments) assert.ok(src.includes(f), 'missing from convo-wants.js: ' + f);
  // And the regex itself matches each fragment's line shape.
  for (const f of fragments) assert.ok(REPAY_OPENER.test(f), 'REPAY_OPENER misses its own fragment: ' + f);
});

function curiousPlant(seed, day, vid, decline, laterText) {
  const lines = [
    'want: curious (stage 0)',
    'THEM: "Can I tell you something? I\'m keeping a photo of someone I left behind. I haven\'t told anyone."',
    '(offered=betrayal:accept,betrayal:decline,leave,silence)',
    decline ? 'YOU: [betrayal:decline] "Not this time."' : 'YOU: [betrayal:accept] "Tell me."',
    'THEM: "Another time, then." A small thing, pocketed.',
    'want final: id=curious stage=3 resolution=unestablished',
  ];
  return { seed: String(seed), day, vid, text: lines.join('\n') + '\n' };
}

// 8. Raj exemplar: plant, untestable (no later sitting).
check('raj-photo: Raj exemplar is a plant, untestable, not returned', () => {
  const t1 = curiousPlant(1, 80, 'v', true);
  const pl = classifyCuriousPlants([t1]);
  assert.strictEqual(pl.length, 1);
  assert.strictEqual(pl[0].testable, false);
  assert.strictEqual(pl[0].returned, false);
});

// 9. Plant with a later photo return -> testable + returned.
check('raj-photo: later photo return scores testable + returned', () => {
  const t1 = curiousPlant(1, 45, 'v', true);
  const t2 = sitting(1, 60, 'v', 'want: just_company (stage 0)', [
    '"That photo you mentioned — do you still carry it?"',
  ], { id: 'just_company', stage: 0, resolution: 'stated' });
  const pl = classifyCuriousPlants([t1, t2]);
  assert.strictEqual(pl.length, 1);
  assert.strictEqual(pl[0].testable, true);
  assert.strictEqual(pl[0].returned, true);
});

// 10. Plant with a later sitting that never returns -> testable, not returned.
check('raj-photo: later sitting without a return scores testable, not returned', () => {
  const t1 = curiousPlant(1, 45, 'v', true);
  const t2 = sitting(1, 60, 'v', 'want: just_company (stage 0)', [
    '"The rain is coming. We should mend the roof."',
  ], { id: 'just_company', stage: 0, resolution: 'stated' });
  const pl = classifyCuriousPlants([t1, t2]);
  assert.strictEqual(pl.length, 1);
  assert.strictEqual(pl[0].testable, true);
  assert.strictEqual(pl[0].returned, false);
});

// 11. Betrayal-accept curious sitting is not a plant.
check('raj-photo: betrayal-accept curious sitting is not a plant', () => {
  const t1 = curiousPlant(1, 80, 'v', false);
  const pl = classifyCuriousPlants([t1]);
  assert.strictEqual(pl.length, 0);
});

// 12-13. Post-panel: NAMED evidence prefers a repay-opener line over a
// bare regex hit (r108 Colin day 60: "an experiment someone forgot to
// label" matches "forgot" but names no promise; the sitting later says
// "You came through on the sickness I'm fighting").
check('pkeep: NAMED evidence prefers the repay-opener line', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: repay (stage 0)', [
    '"I think we\'re an experiment someone forgot to label."',
    '"You came through on the sickness I\'m fighting. I won\'t forget it."',
  ], { id: 'repay', stage: 0, resolution: 'engaged' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED');
  assert.ok(/you came through on/i.test(th[0].evidence.line), 'evidence cites the repay line: ' + th[0].evidence.line);
});
check('pkeep: NAMED evidence falls back to the regex hit when no repay opener exists', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: just_company (stage 0)', [
    '"You promised you would help with the stores."',
  ], { id: 'just_company', stage: 0, resolution: 'stated' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED');
  assert.ok(/promised/i.test(th[0].evidence.line));
});

// 14. RE-ASK: Chloe-class pair (r108 transcript lines, verbatim) — the
// day-45 opener names "the food I needed", the day-60 opener re-asks it.
check('reask: Chloe-class pair scores RE-ASK with the favor short', () => {
  const t1 = sitting(1, 45, 'v', 'want: ask_favor (stage 1)', [
    '"Never mind the food I needed — we got it handled. Thanks anyway. This cut — I can\'t clean it properly one-handed. Could you clean it out for me? Please."',
  ], { id: 'ask_favor', stage: 3, resolution: 'promised' });
  const t2 = sitting(1, 60, 'v', 'want: ask_favor (stage 2, fromSeed)', [
    '"About the food I needed — the need hasn\'t gone anywhere. I\'m still asking."',
  ], { id: 'ask_favor', stage: 3, resolution: 'promised' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th.length, 2); // t2 re-promises, opening its own thread
  const first = th.find(x => x.day === 45);
  assert.strictEqual(first.cls, 'RE-ASK');
  assert.strictEqual(first.evidence.short, 'the food I needed');
  assert.strictEqual(first.evidence.day, 60);
  assert.strictEqual(scanReaskOrphans([t1, t2]).length, 0);
});

// 15. RE-ASK: a re-ask naming a short the earlier sitting never named is
// NOT a re-ask of that thread (stays SILENT) — and IS an orphan.
check('reask: unseen short stays SILENT and is an orphan', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: ask_favor (stage 2, fromSeed)', [
    '"About the snare line — the need hasn\'t gone anywhere. I\'m still asking."',
  ], { id: 'ask_favor', stage: 3, resolution: 'promised' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'SILENT');
  const orph = scanReaskOrphans([t1, t2]);
  assert.strictEqual(orph.length, 1);
  assert.strictEqual(orph[0].short, 'the snare line');
});

// 16. NAMED outranks RE-ASK: a later sitting with both a repay opener
// and a re-ask opener scores NAMED, not RE-ASK.
check('reask: NAMED outranks RE-ASK', () => {
  const t1 = sitting(1, 45, 'v', 'want: ask_favor (stage 1)', [
    '"Never mind the food I needed — we got it handled. Thanks anyway. Could you clean this cut for me?"',
  ], { id: 'ask_favor', stage: 3, resolution: 'promised' });
  const t2 = sitting(1, 60, 'v', 'want: repay (stage 0)', [
    '"About the food I needed — the need hasn\'t gone anywhere. I\'m still asking."',
    '"I\'ve been thinking about what you promised. I don\'t like owing kindness."',
  ], { id: 'repay', stage: 0, resolution: 'stated' });
  const th = classifyPromiseThreads([t1, t2], []);
  assert.strictEqual(th[0].cls, 'NAMED');
});

// 17. REASK_OPENER vocabulary is grounded in src/js/convo-wants.js.
check('reask: REASK_OPENER line exists in convo-wants.js', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'convo-wants.js'), 'utf8');
  assert.ok(src.includes("the need hasn't gone anywhere. I'm still asking."), 're-ask opener missing from convo-wants.js');
  assert.ok(REASK_OPENER.test('"About the food I needed — the need hasn\'t gone anywhere. I\'m still asking."'));
});

// 18. FIZZLE: a dry line inside an ask_favor sitting counts under ask_favor.
check('fizzle: dry line in ask_favor sitting counted as ask_favor', () => {
  const t1 = sitting(1, 45, 'v', 'want: ask_favor (stage 1)', [
    '"Could you clean this cut for me?"',
    '"...Sorry, lost my train of thought."',
  ], { id: 'ask_favor', stage: 3, resolution: 'promised' });
  const hits = classifyDryLines([t1]);
  assert.strictEqual(hits.length, 1);
  assert.strictEqual(hits[0].wantId, 'ask_favor');
  assert.strictEqual(hits[0].dryLines, 1);
});

// 19. FIZZLE: a dry line in another want counts separately (other bucket).
check('fizzle: dry line elsewhere counts under its own want', () => {
  const t1 = sitting(1, 45, 'v', 'want: just_company (stage 0)', [
    '"...Sorry, lost my train of thought."',
  ], { id: 'just_company', stage: 0, resolution: 'stated' });
  const hits = classifyDryLines([t1]);
  assert.strictEqual(hits.length, 1);
  assert.strictEqual(hits[0].wantId, 'just_company');
});

// 20. FIZZLE: no dry lines -> zero hits.
check('fizzle: clean transcripts produce zero hits', () => {
  const t1 = promised(1, 45, 'v', 'ask_favor');
  const t2 = sitting(1, 60, 'v', 'want: repay (stage 0)', [
    '"You came through on the food I needed. I won\'t forget it."',
  ], { id: 'repay', stage: 0, resolution: 'stated' });
  assert.strictEqual(classifyDryLines([t1, t2]).length, 0);
});

// 21. RE-ASK-ORPHAN: a re-ask whose short WAS seen before is no orphan
// (the Chloe pair from check 14, scanned alone).
check('reask: seen short produces no orphan', () => {
  const t1 = sitting(1, 45, 'v', 'want: ask_favor (stage 1)', [
    '"Never mind the food I needed — we got it handled. Thanks anyway."',
  ], { id: 'ask_favor', stage: 3, resolution: 'promised' });
  const t2 = sitting(1, 60, 'v', 'want: ask_favor (stage 2, fromSeed)', [
    '"About the food I needed — the need hasn\'t gone anywhere. I\'m still asking."',
  ], { id: 'ask_favor', stage: 3, resolution: 'promised' });
  assert.strictEqual(scanReaskOrphans([t1, t2]).length, 0);
});

console.log(`RESULT: ${pass} PASS, 0 FAIL`);
