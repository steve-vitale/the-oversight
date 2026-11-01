#!/usr/bin/env node
// test-falsefire-b.js — PURE proof tests for scripts/analyze-falsefire-b.js.
// (DIAG ONLY.) No game load, no file writes, no RNG, no judged seeds.
// Usage: node scripts/test-falsefire-b.js
// No --live mode: corpus re-analysis and the pilot sweep run only AFTER
// the prereg commit and are judged results, never proof-test fixtures.
'use strict';

const { RECOVERY_HORIZON, classifyWindowShape, recoveryAfterConfirmation,
  analyzeSeedFalsefire, summarizeFalsefire } = require('./analyze-falsefire-b');

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; }
  else { failed++; console.error('FAIL: ' + name); }
}

// Synthetic seed: pantry series array, one row per loopDay starting at 1.
// Candidate day is 10 by construction: days 1-5 flat 30000, days 6-9 falling
// 29000/28000/27000/26000, day 10 = 23000 (<= 0.80*30000, 3 falls ending 10).
function mkSeed(series, opts) {
  const o = opts || {};
  const rows = series.map((p, idx) => ({
    loopDay: idx + 1,
    pantryKcal: p,
    freshDays: 5,
    gateEngaged: true,
    hungryStreak: 0,
    alive: 5,
  }));
  return { seed: o.seed || 99999, arm: 'armed', endReason: o.endReason || 'survived',
    daysAlive: rows.length, maxWaveUnlocked: 2, waveKills: {}, rows, sayLines: [] };
}
function base() { return [30000, 30000, 30000, 30000, 30000, 29000, 28000, 27000, 26000, 23000]; }
function pureWindow() { return [22000, 21000, 20000, 19000, 18000]; }
function sustainedPost() { return [17000, 16500, 16000, 15500, 15000, 14500, 14000, 13500, 13000, 12500]; }
function withWinPost(win, post, opts) {
  return analyzeSeedFalsefire(mkSeed(base().concat(win).concat(post), opts));
}

// 1. Pure fall + sustained below for the full horizon: TRUE, sustained-slide.
{
  const a = withWinPost(pureWindow(), sustainedPost());
  check('pure fall: confirms day 15', a.confirmedDay === 15);
  check('pure fall: fireClass true', a.fireClass === 'true');
  check('pure fall: reason sustained-slide', a.fireReason === 'sustained-slide');
  check('pure fall: not censored', a.recoveryCensored === false);
  check('pure fall: 10 evenings observed', a.recoveryObservedEvenings === 10);
  check('pure fall: shape clean', a.windowShape === 'clean');
  check('pure fall: not extension-resting', a.extensionResting === false);
  check('horizon constant is 10', RECOVERY_HORIZON === 10);
}

// 2. Single hairline uplift + sustained: TRUE, hairline-only, not separated.
{
  const a = withWinPost([23215, 22000, 21000, 20000, 19000], sustainedPost());
  check('hairline: confirms', a.confirmedDay === 15);
  check('hairline: fireClass true', a.fireClass === 'true');
  check('hairline: hairlineOnly true', a.hairlineOnly === true);
  check('hairline: shape hairline', a.windowShape === 'hairline');
  check('hairline: not extension-resting', a.extensionResting === false);
}

// 3. Two SEPARATED sub-margin evenings: confirms, shape separated,
// extension-resting true (the dipslide3 gap, now flagged, still firing).
{
  const a = withWinPost([23200, 21000, 23100, 20000, 19000], sustainedPost());
  check('separated: confirms', a.confirmedDay === 15);
  check('separated: shape separated', a.windowShape === 'separated');
  check('separated: aboveDays [11,13]', JSON.stringify(a.windowAboveDays) === '[11,13]');
  check('separated: extension-resting', a.extensionResting === true);
  check('separated: still a true warning (sustained post)', a.fireClass === 'true');
}

// 4. Quick recovery on day +3 (day 18, exactly at candidate level):
// FALSE fire, recoveryDay 18.
{
  const post = [17000, 16000, 23000, 22000, 21000, 20000, 19000, 18000, 17000, 16000];
  const a = withWinPost(pureWindow(), post);
  check('quick recovery: fireClass false', a.fireClass === 'false');
  check('quick recovery: reason quick-recovery', a.fireReason === 'quick-recovery');
  check('quick recovery: recoveryDay 18', a.recoveryDay === 18);
}

// 5. Recovery on the LAST horizon evening (day 25) still counts as false.
{
  const post = [17000, 16500, 16000, 15500, 15000, 14500, 14000, 13500, 13000, 23000];
  const a = withWinPost(pureWindow(), post);
  check('day-25 recovery: false', a.fireClass === 'false' && a.recoveryDay === 25);
}

// 6. Recovery one evening PAST the horizon (day 26) does NOT count: true.
{
  const post = [17000, 16500, 16000, 15500, 15000, 14500, 14000, 13500, 13000, 12500, 24000];
  const a = withWinPost(pureWindow(), post);
  check('day-26 recovery: true (outside horizon)', a.fireClass === 'true');
  check('day-26 recovery: not censored', a.recoveryCensored === false);
}

// 7. Censored: window ends 3 evenings after confirmation, no recovery:
// true AS OBSERVED + censored flag.
{
  const a = withWinPost(pureWindow(), [17000, 16000, 15000]);
  check('censored: true', a.fireClass === 'true');
  check('censored: flag true', a.recoveryCensored === true);
  check('censored: 3 evenings observed', a.recoveryObservedEvenings === 3);
}

// 8. Collapsed seed with a quick recovery is still TRUE (collapse wins).
{
  const post = [17000, 16000, 23000, 22000, 21000, 20000, 19000, 18000, 17000, 16000];
  const a = withWinPost(pureWindow(), post, { endReason: 'starved' });
  check('collapsed: true despite recovery', a.fireClass === 'true');
  check('collapsed: reason collapsed', a.fireReason === 'collapsed');
}

// 9. Flat series: no candidate, no fire, null classification.
{
  const a = analyzeSeedFalsefire(mkSeed(
    [30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000,
     30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000]));
  check('flat: no confirm', a.confirmedDay === null);
  check('flat: fireClass null', a.fireClass === null);
}

// 10. Null pantry evening inside the horizon is skipped, not a recovery;
// a later recovery still counts.
{
  const post = [null, 16000, 23000, 22000, 21000, 20000, 19000, 18000, 17000, 16000];
  const a = withWinPost(pureWindow(), post);
  check('null in horizon: false via later recovery', a.fireClass === 'false' && a.recoveryDay === 18);
  check('null in horizon: 2 evenings observed before recovery', a.recoveryObservedEvenings === 2);
}

// 11. classifyWindowShape unit checks on raw windows.
{
  check('shape clean: no above evenings',
    classifyWindowShape([{ loopDay: 11, pantryKcal: 22000 }], 23000).shape === 'clean');
  check('shape other: margin breach window',
    classifyWindowShape([{ loopDay: 11, pantryKcal: 25000 }], 23000).shape === 'other');
  check('shape other: consecutive above pair',
    classifyWindowShape([{ loopDay: 11, pantryKcal: 23100 }, { loopDay: 12, pantryKcal: 23200 }], 23000).shape === 'other');
  check('shape separated: three separated sub-margin evenings',
    classifyWindowShape([
      { loopDay: 11, pantryKcal: 23100 }, { loopDay: 12, pantryKcal: 21000 },
      { loopDay: 13, pantryKcal: 23200 }, { loopDay: 14, pantryKcal: 20000 },
      { loopDay: 15, pantryKcal: 23150 }], 23000).shape === 'separated');
}

// 12. recoveryAfterConfirmation unit checks.
{
  const series = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map((d) => ({ loopDay: d, pantryKcal: 15000 }));
  const r = recoveryAfterConfirmation(series, 15, 23000);
  check('recovery helper: no recovery, not censored at full horizon',
    r.recoveredWithin10 === false && r.censored === false && r.observedEvenings === 10);
  const series2 = [{ loopDay: 16, pantryKcal: 15000 }, { loopDay: 17, pantryKcal: 15000 }];
  const r2 = recoveryAfterConfirmation(series2, 15, 23000);
  check('recovery helper: short series censored',
    r2.censored === true && r2.observedEvenings === 2);
}

// 13. summarizeFalsefire band bars: 2 true + 1 false + 1 separated-true +
// 1 silent seed -> new rate 1/4, extension 1, sensitivity-excl-extension 3.
{
  const s1 = mkSeed(base().concat(pureWindow()).concat(sustainedPost()), { seed: 1 });
  const s2 = mkSeed(base().concat(pureWindow()).concat([17000, 16000, 23000, 22000, 21000, 20000, 19000, 18000, 17000, 16000]), { seed: 2 });
  const s3 = mkSeed(base().concat([23200, 21000, 23100, 20000, 19000]).concat(sustainedPost()), { seed: 3 });
  const s4 = mkSeed(base().concat(pureWindow()).concat(sustainedPost()), { seed: 4, endReason: 'starved' });
  const s5 = mkSeed([30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000,
    30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000], { seed: 5 });
  const sum = summarizeFalsefire([s1, s2, s3, s4, s5]);
  check('summarize: confirmedCount 4', sum.bars.confirmedCount === 4);
  check('summarize: falseCount 1', sum.bars.falseCount === 1);
  check('summarize: new rate 0.25 passes cap', sum.bars.newFalseFireRate.rate === 0.25 && sum.bars.newFalseFireRate.pass === true);
  check('summarize: extensionRestingCount 1', sum.bars.extensionRestingCount === 1);
  check('summarize: extensionRestingSeeds [3]', JSON.stringify(sum.bars.extensionRestingSeeds) === '[3]');
  check('summarize: sensitivityExcludingExtension 3', sum.bars.sensitivityExcludingExtension === 3);
  check('summarize: old rate counts survived confirms (3/4)',
    sum.bars.oldFalseFireRate.rate === 0.75);
  check('summarize: census valid all', sum.censusValidAll === true);
  check('summarize: wall collapsed [4]', JSON.stringify(sum.wall.collapsed) === '[4]');
}

console.log('test-falsefire-b: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
