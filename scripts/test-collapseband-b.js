#!/usr/bin/env node
// test-collapseband-b.js — PROOF TEST for sim-collapseband-b (pure,
// synthetic series only, NO judged seeds — synthetic seed numbers are
// 999xx, invented). Proves the thin band layer in
// scripts/analyze-collapseband-b.js: collapse classification per the
// prereg definition, 51608-class flag, reference-day + lead arithmetic,
// and the band verdicts — including the 76712 shape (survivor with
// starvation deaths is NEVER a collapsing seed).
'use strict';
const assert = require('assert');
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');
const { analyzeCollapseSeed, summarizeCollapseBand } = require('./analyze-collapseband-b');

// Build a synthetic tracer-shaped seed: rows loopDay 1..lastDay with a
// pantry map (default 20000) and gateEngaged true except inside the
// disengaged stretch [stretchStart, lastDay] when given.
function synthSeed(seed, opts) {
  const lastDay = opts.lastDay;
  const rows = [];
  for (let d = 1; d <= lastDay; d++) {
    const engaged = opts.stretchStart == null ? true : d < opts.stretchStart;
    rows.push({
      loopDay: d, gameDay: d,
      pantryKcal: opts.pantry[d] != null ? opts.pantry[d] : 20000,
      freshDays: 5, freshKcal: 10000, gateOn: true,
      gateEngaged: engaged, hungryStreak: 0,
    });
  }
  return {
    seed, days: 30, daysAlive: opts.daysAlive, endReason: opts.endReason,
    maxWaveUnlocked: 2, deaths: opts.deaths || [], rows,
  };
}

let checks = 0;
function check(name, fn) {
  fn();
  checks++;
  console.log('ok ' + checks + ' ' + name);
}

// 1. 51608 shape: collapsing + starvation, (c) fires day 15, ref 21, lead 6.
check('51608-shape: collapsed, starvation-class, firing 15, lead 6', () => {
  const s = synthSeed(99901, {
    lastDay: 25, daysAlive: 25, endReason: 'village-lost',
    deaths: [{ cause: 'starvation', day: 21 }],
    stretchStart: 12,
    pantry: { 12: 10000, 13: 9500, 14: 9000, 15: 8500 },
  });
  const a = analyzeCollapseSeed(s);
  assert.strictEqual(a.collapsed, true);
  assert.strictEqual(a.starvationClass, true);
  assert.strictEqual(a.firstStarvationDay, 21);
  assert.strictEqual(a.refDay, 21);
  assert.strictEqual(a.firingDay, 15);
  assert.strictEqual(a.lead, 6);
  assert.strictEqual(a.leadGE3, true);
  assert.strictEqual(a.leadGE6, true);
  // Cross-check: thin layer agrees with the reused analyzer directly.
  assert.strictEqual(analyzeSeedGatediseng(s).candidates.c_standDownTrend.day, 15);
});

// 2. Collapsing, no starvation: ref day falls back to daysAlive; lead 2 fails.
check('non-starvation collapse: ref = daysAlive, firing 18, lead 2, GE3 false', () => {
  const s = synthSeed(99902, {
    lastDay: 20, daysAlive: 20, endReason: 'village-lost',
    deaths: [{ cause: 'combat', day: 19 }],
    stretchStart: 12,
    pantry: { 12: 10000, 13: 9800, 14: 9600, 15: 9400, 16: 9200, 17: 9100, 18: 8900 },
  });
  const a = analyzeCollapseSeed(s);
  assert.strictEqual(a.collapsed, true);
  assert.strictEqual(a.starvationClass, false);
  assert.strictEqual(a.refDay, 20);
  assert.strictEqual(a.firingDay, 18);
  assert.strictEqual(a.lead, 2);
  assert.strictEqual(a.leadGE3, false);
  assert.strictEqual(a.leadGE6, false);
});

// 3. 76712 shape: survivor with starvation deaths is NEVER collapsing.
check('76712-shape: survived 30d with starvation deaths is not collapsing', () => {
  const s = synthSeed(99903, {
    lastDay: 30, daysAlive: 30, endReason: 'survived',
    deaths: [{ cause: 'starvation', day: 22 }, { cause: 'starvation', day: 23 }],
    stretchStart: 6,
    pantry: { 6: 20650, 7: 16450, 8: 14450, 9: 11242 },
  });
  const a = analyzeCollapseSeed(s);
  assert.strictEqual(a.collapsed, false);
  assert.strictEqual(a.survived, true);
  assert.strictEqual(a.starvationClass, false);
  assert.strictEqual(a.refDay, null);
  assert.strictEqual(a.firingDay, 9);
});

// 4. Collapsing with NO (c) firing: lead null, both legs false.
check('collapsing, no firing: lead null, GE3/GE6 false', () => {
  const s = synthSeed(99904, {
    lastDay: 22, daysAlive: 22, endReason: 'village-lost',
    deaths: [{ cause: 'starvation', day: 20 }],
    stretchStart: 12,
    pantry: { 12: 10000, 13: 10100, 14: 10200, 15: 10300 },
  });
  const a = analyzeCollapseSeed(s);
  assert.strictEqual(a.collapsed, true);
  assert.strictEqual(a.firingDay, null);
  assert.strictEqual(a.lead, null);
  assert.strictEqual(a.leadGE3, false);
  assert.strictEqual(a.leadGE6, false);
});

// 5. Band verdicts: empty -> DIAG-NO-BAND.
check('band verdict: empty band -> DIAG-NO-BAND', () => {
  const v = summarizeCollapseBand([synthSeed(99905, {
    lastDay: 30, daysAlive: 30, endReason: 'survived', deaths: [], stretchStart: null, pantry: {},
  })]);
  assert.strictEqual(v.verdict, 'DIAG-NO-BAND');
  assert.strictEqual(v.collapsingCount, 0);
});

// 6. Single seed lead 6 -> PASS-SINGLE; single seed lead 4 -> FAIL.
check('band verdict: single lead 6 -> PASS-SINGLE; single lead 4 -> FAIL', () => {
  const mk = (seed, fireDay, refDay) => {
    // Stretch from 12, falls arranged so the FIRST (c) firing lands
    // exactly on fireDay: pantry declines linearly from 10000 at day 12
    // to exactly 9000 (= 0.90 * pantry(12)) at fireDay, staying above
    // 9000 on every earlier evening, so no earlier evening can fire.
    const pantry = { 12: 10000 };
    for (let d = 13; d <= fireDay; d++) {
      pantry[d] = 10000 - Math.round(1000 * (d - 12) / (fireDay - 12));
    }
    return synthSeed(seed, {
      lastDay: refDay - 1, daysAlive: refDay - 1, endReason: 'village-lost',
      deaths: [{ cause: 'starvation', day: refDay }],
      stretchStart: 12, pantry,
    });
  };
  const v1 = summarizeCollapseBand([mk(99906, 15, 21)]);
  assert.strictEqual(v1.verdict, 'TIMELINESS-PASS-SINGLE');
  const v2 = summarizeCollapseBand([mk(99907, 17, 21)]);
  // firing 17, ref 21 -> lead 4: GE3 true but GE6 false -> FAIL for n = 1.
  assert.strictEqual(v2.seeds[0].lead, 4);
  assert.strictEqual(v2.verdict, 'TIMELINESS-FAIL');
});

// 7. Two-seed band: leads 6 + 4 -> PASS (all >= 3, 50% >= 6).
check('band verdict: leads 6+4 -> PASS', () => {
  const mk = (seed, fireDay, refDay) => {
    // Same linear-to-9000 construction as check 6: first firing lands
    // exactly on fireDay.
    const pantry = { 12: 10000 };
    for (let d = 13; d <= fireDay; d++) {
      pantry[d] = 10000 - Math.round(1000 * (d - 12) / (fireDay - 12));
    }
    return synthSeed(seed, {
      lastDay: refDay - 1, daysAlive: refDay - 1, endReason: 'village-lost',
      deaths: [{ cause: 'starvation', day: refDay }],
      stretchStart: 12, pantry,
    });
  };
  const v = summarizeCollapseBand([mk(99908, 15, 21), mk(99909, 17, 21)]);
  assert.deepStrictEqual(v.seeds.map((s) => s.lead), [6, 4]);
  assert.strictEqual(v.verdict, 'TIMELINESS-PASS');
});

// 8. Two-seed band: leads 6 + 2 -> FAIL (carried leg broken).
check('band verdict: leads 6+2 -> FAIL', () => {
  // Late seed: firing day 18 against the no-starvation fallback ref day
  // (daysAlive 20) -> lead 2, breaking the carried leg.
  const late = synthSeed(99910, {
    lastDay: 20, daysAlive: 20, endReason: 'village-lost',
    deaths: [{ cause: 'combat', day: 19 }],
    stretchStart: 12,
    pantry: { 12: 10000, 13: 9800, 14: 9600, 15: 9400, 16: 9200, 17: 9100, 18: 8900 },
  });
  assert.strictEqual(analyzeCollapseSeed(late).lead, 2);
  const good = synthSeed(99911, {
    lastDay: 25, daysAlive: 25, endReason: 'village-lost',
    deaths: [{ cause: 'starvation', day: 21 }],
    stretchStart: 12,
    pantry: { 12: 10000, 13: 9500, 14: 9000, 15: 8500 },
  });
  const v = summarizeCollapseBand([good, late]);
  assert.strictEqual(v.verdict, 'TIMELINESS-FAIL');
});

// 9. startsDisengaged flag is reported, not hidden.
check('startsDisengaged reported for a day-1 disengaged stretch', () => {
  const s = synthSeed(99912, {
    lastDay: 30, daysAlive: 30, endReason: 'survived', deaths: [],
    stretchStart: 1, pantry: { 1: 20000, 2: 19000, 3: 18000, 4: 17000, 5: 16000 },
  });
  assert.strictEqual(analyzeCollapseSeed(s).startsDisengaged, true);
});

// 10. Cross-check on every synthetic seed: thin firing == reused firing.
check('cross-check: thin firing day equals reused analyzer on all synthetics', () => {
  const cases = [];
  cases.push(synthSeed(99913, { lastDay: 25, daysAlive: 25, endReason: 'village-lost', deaths: [{ cause: 'starvation', day: 21 }], stretchStart: 12, pantry: { 12: 10000, 13: 9500, 14: 9000, 15: 8500 } }));
  cases.push(synthSeed(99914, { lastDay: 30, daysAlive: 30, endReason: 'survived', deaths: [], stretchStart: null, pantry: {} }));
  for (const s of cases) {
    const thin = analyzeCollapseSeed(s).firingDay;
    const reused = analyzeSeedGatediseng(s).candidates.c_standDownTrend;
    assert.strictEqual(thin, reused == null ? null : reused.day);
  }
});

console.log('test-collapseband-b: ' + checks + '/10 checks passed');
