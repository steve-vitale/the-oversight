// test-foodrung-band-b.js — proof for the food-rung pair on the frozen band
// (arm sim-foodrung-band-b). G1 det-gate (classifier on the judged/committed
// corpora + broken-classifier/broken-recorder sensitivity + the 'the arena'
// registration + the 'Hushpuppy' monster-name cause, unmapped and named +
// headline predicate + BAND-RULE judge synthetics), G3 corpus integrity on
// every new corpus, REPRODUCTION legs (fresh L3/L5 re-runs must equal the
// committed bandfreeze L3/L5 corpora exactly, or the verdict is HELD), and
// the BRIDGE leg (committed L5/L6 judge INERT — the place-line fix moves
// nothing on this band, so the L3/L5 pair judges the food rung).
// Fixture-based; no sim, no harness load — runs at any SHA.
// Real-corpus legs run when the committed corpora exist and SKIP otherwise.
// The reproduction legs FAIL (not skip) when both corpora exist but differ.
// Run: node scripts/test-foodrung-band-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./analyze-53007-20261108');

const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function checkSkip(name, cond, extra) {
  if (cond === null) { skip++; console.log('SKIP ' + name + (extra ? ' — ' + extra : '')); }
  else check(name, cond, extra);
}
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}
function file(p) { return path.join(REPO, p); }
function w4kills(c) { return ((c.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length; }
function w4faced(c) { return ((c.finalSeat || {}).detail || {}).w4; }
function fallenN(c) { return (c.fallen || []).length; }
function seatDay(c) { return (c.takeseatStats || {}).seatDay; }

// --- The 'the arena' registration (this arm's classifier) ---
// The frozen analyzer's VIOLENT map keys 'arena' but the game emits the cause
// string 'the arena'. This arm registers 'the arena' as VIOLENT in ITS OWN
// classifier; the frozen analyzer is NOT edited (it is overlaid unchanged).
// classifyCorrected re-applies the 53007-a prereg rule with the extended map.
const VIOLENT_FR = Object.assign({}, A.VIOLENT, { 'the arena': 1 });
function causeOf(f) { return (f && f.cause) ? String(f.cause) : 'unknown'; }
function classifyCorrected(fallen, livingAt30) {
  fallen = (fallen || []).slice().sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
  const n = fallen.length;
  if (!n) return { mech: 'no-deaths', detail: 'no fallen entries' };
  const sick = fallen.filter(function (f) { return causeOf(f) === 'sickness'; });
  const violent = fallen.filter(function (f) { return !!VIOLENT_FR[causeOf(f)]; });
  const attr = fallen.filter(function (f) { return !!A.ATTRITION[causeOf(f)]; });
  const firstViolentDay = violent.length ? Math.min.apply(null, violent.map(function (f) { return f.day | 0; })) : null;
  const thirdSickDay = sick.length >= 3 ? sick[2].day : null;
  if (causeOf(fallen[0]) === 'sickness' && sick.length / n >= 0.4 &&
      (firstViolentDay == null || thirdSickDay == null || firstViolentDay > thirdSickDay)) {
    return { mech: 'sickness-first', detail: 'first death sickness d' + fallen[0].day + '; sickness ' + sick.length + '/' + n + '; first violent ' + (firstViolentDay == null ? 'never' : 'd' + firstViolentDay) };
  }
  const first3Violent = fallen.length >= 3 && fallen.slice(0, 3).every(function (f) { return !!VIOLENT_FR[causeOf(f)]; });
  const lateAttr = attr.filter(function (f) { return (f.day | 0) > 30; }).length;
  if (first3Violent && livingAt30 != null && livingAt30 < 8 && lateAttr >= 3) {
    return { mech: 'attrition-after-thinning', detail: 'first 3 deaths violent; living d30=' + livingAt30 + '; ' + lateAttr + ' attrition deaths after d30' };
  }
  const starv = fallen.filter(function (f) { return causeOf(f) === 'starvation'; });
  const lastDay = fallen[n - 1].day;
  const tail = fallen.filter(function (f) { return (f.day | 0) >= lastDay - 7; });
  const tailStarv = tail.filter(function (f) { return causeOf(f) === 'starvation'; }).length;
  if (starv.length >= 2 && tailStarv >= 1 && tailStarv >= Math.ceil(tail.filter(function (f) { return !!A.ATTRITION[causeOf(f)]; }).length / 2)) {
    return { mech: 'starvation-led', detail: starv.length + ' starvation deaths; ' + tailStarv + ' in the final 7 days' };
  }
  if (violent.length / n >= 0.6) {
    return { mech: 'combat-led', detail: 'violent ' + violent.length + '/' + n };
  }
  const mix = {};
  fallen.forEach(function (f) { const c = causeOf(f); mix[c] = (mix[c] || 0) + 1; });
  return { mech: 'mixed/other', detail: 'cause mix ' + JSON.stringify(mix) };
}

// headline(corpus): the prereg decision tree, applied mechanically.
// 'old'    = 150d survived + sits d95 + standing 584 ± 5 + 5 w4 kills.
// 'moved'  = 150d survived + sits d90 + standing 199 ± 5 + 2 w4 kills.
// 'middle' = 150d survived + sits d90 + standing 199 ± 5 + 1 w4 kill.
// 'new'    = 138d village-lost + sits d92 + standing 100 ± 5 + 0 w4 kills.
// 'endpoint' = dies ~50d (<= 55d), village-lost, sickness-first (frozen rule).
// 'other'  = anything else — NEITHER headline, never forced.
// 'unknown' = no corpus.
function headline(c) {
  if (!c) return 'unknown';
  const sd = seatDay(c);
  const standing = c.standing | 0;
  if (c.days === 150 && !c.villageLost && sd === 95 && Math.abs(standing - 584) <= 5 && w4kills(c) === 5) return 'old';
  if (c.days === 150 && !c.villageLost && sd === 90 && Math.abs(standing - 199) <= 5 && w4kills(c) === 2) return 'moved';
  if (c.days === 150 && !c.villageLost && sd === 90 && Math.abs(standing - 199) <= 5 && w4kills(c) === 1) return 'middle';
  if (c.days === 138 && c.villageLost && sd === 92 && Math.abs(standing - 100) <= 5 && w4kills(c) === 0) return 'new';
  const mech = A.classify(c.fallen, A.livingAt(c, 30)).mech;
  if ((c.days | 0) <= 55 && c.villageLost && mech === 'sickness-first') return 'endpoint';
  return 'other';
}

// --- THE BAND RULE (binding, from the prereg — pair (b) rule) ---
// Per-seed movement (L5 vs L3) on three numeric fields:
//   standing: DOWN if L5-L3 <= -6, UP if >= +6, else stable (±5 tolerance).
//   w4 kills: DOWN if L5 < L3, UP if L5 > L3, else stable.
//   fallen count: UP if L5 > L3, DOWN if L5 < L3, else stable.
// Per field, the pair direction is the majority sign across the 8 seeds
// (counting only seeds where that field moves beyond tolerance; a tied
// field has no direction). A seed moves with the pair iff >=2 of its 3
// fields move in their majority direction and none moves opposite.
// MOVER iff >=5/8 move with the pair and 0 opposite; INERT iff no seed
// moves on any field; else MIXED.
function fieldMoves(pre, fix) {
  const dStanding = (fix.standing | 0) - (pre.standing | 0);
  const standing = dStanding <= -6 ? -1 : (dStanding >= 6 ? 1 : 0);
  const dW4 = w4kills(fix) - w4kills(pre);
  const w4 = dW4 < 0 ? -1 : (dW4 > 0 ? 1 : 0);
  const dFallen = fallenN(fix) - fallenN(pre);
  const fallen = dFallen > 0 ? 1 : (dFallen < 0 ? -1 : 0);
  return { standing: standing, w4: w4, fallen: fallen };
}
function seedMoveVs(pre, fix, dir) {
  const m = fieldMoves(pre, fix);
  let withDir = 0, against = 0;
  Object.keys(dir).forEach(function (k) {
    if (m[k] === dir[k]) withDir++;
    else if (m[k] === -dir[k]) against++;
  });
  if (withDir >= 2 && against === 0) return 'with';
  if (against >= 2 && withDir === 0) return 'against';
  return 'none';
}
function judgePairB(preBySeed, fixBySeed) {
  const seeds = Object.keys(preBySeed).sort();
  const moves = {};
  seeds.forEach(function (s) { moves[s] = fieldMoves(preBySeed[s], fixBySeed[s]); });
  const dir = {};
  ['standing', 'w4', 'fallen'].forEach(function (k) {
    let up = 0, down = 0;
    seeds.forEach(function (s) { if (moves[s][k] === 1) up++; if (moves[s][k] === -1) down++; });
    dir[k] = up > down ? 1 : (down > up ? -1 : 0);
  });
  const effDir = {};
  Object.keys(dir).forEach(function (k) { if (dir[k] !== 0) effDir[k] = dir[k]; });
  const perSeed = {};
  let withN = 0, againstN = 0, anyMove = 0;
  seeds.forEach(function (s) {
    const m = moves[s];
    if (m.standing !== 0 || m.w4 !== 0 || m.fallen !== 0) anyMove++;
    const mv = seedMoveVs(preBySeed[s], fixBySeed[s], effDir);
    perSeed[s] = mv;
    if (mv === 'with') withN++;
    if (mv === 'against') againstN++;
  });
  const verdict = (withN >= 5 && againstN === 0) ? 'MOVER'
    : (anyMove === 0) ? 'INERT' : 'MIXED';
  return { verdict: verdict, with: withN, against: againstN, anyMove: anyMove, dir: dir, perSeed: perSeed };
}

// bandEndpoint(corpus): the binding-field tuple for reproduction.
// Reproduction is EXACT — standing exact, no tolerance.
function bandEndpoint(c) {
  return {
    days: c.days, endReason: c.endReason, villageLost: !!c.villageLost,
    standing: c.standing | 0, seatDay: seatDay(c), w4: w4kills(c),
    w4faced: w4faced(c), fallen: (c.fallen || []).slice(),
    living: (c.daily && c.daily.length) ? c.daily[c.daily.length - 1].living : null,
  };
}
function endpointsEqual(a, b) {
  return JSON.stringify(bandEndpoint(a)) === JSON.stringify(bandEndpoint(b));
}

// firstDivergence(a, b): first day whose (living, pantry, sick, wounded, hungry)
// diag row differs between two corpora; null when no daily row differs.
function firstDivergence(a, b) {
  if (!a || !b || !a.daily || !b.daily) return null;
  const byDay = {};
  b.daily.forEach(function (r) { byDay[r.day] = r; });
  for (const ra of a.daily) {
    const rb = byDay[ra.day];
    if (!rb) continue;
    const da = ra.diag || {}, db = rb.diag || {};
    if (ra.living !== rb.living || da.pantryKcal !== db.pantryKcal || da.sickN !== db.sickN ||
        da.woundedN !== db.woundedN || da.hungryN !== db.hungryN) return ra.day;
  }
  return null;
}

// dailyRowsIdentical(a, b): first-row-per-day daily rows are identical.
// The naive firstDivergence helper misreports on dead seeds because the
// closing snapshot duplicates the final day with a recomputed diag (the
// bandfreeze closing-duplicate artifact) — the first row for the final day
// is compared against the closing row. This helper compares the FIRST row
// for each day (the rowsEqualOnDays pattern) and is the correct daily
// identity check; firstDivergence stays the tool for PAIRED-leg divergence
// (L3 vs L5), where both sides carry the same closing shape.
function dailyRowsIdentical(a, b) {
  if (!a || !b || !a.daily || !b.daily) return false;
  const firstA = {}, firstB = {};
  a.daily.forEach(function (r) { if (firstA[r.day] === undefined) firstA[r.day] = r; });
  b.daily.forEach(function (r) { if (firstB[r.day] === undefined) firstB[r.day] = r; });
  const days = Object.keys(firstA);
  if (days.length !== Object.keys(firstB).length) return false;
  return days.every(function (d) { return JSON.stringify(firstA[d]) === JSON.stringify(firstB[d]); });
}

// rowsEqualOnDays(a, b, days): the daily rows for the given days are identical
// (index-aware: compares the FIRST row for each day, so the duplicated closing
// row cannot alias a mismatch onto another day).
function rowsEqualOnDays(a, b, days) {
  if (!a || !b || !a.daily || !b.daily) return false;
  const firstA = {}, firstB = {};
  a.daily.forEach(function (r) { if (firstA[r.day] === undefined) firstA[r.day] = r; });
  b.daily.forEach(function (r) { if (firstB[r.day] === undefined) firstB[r.day] = r; });
  return days.every(function (d) {
    return firstA[d] !== undefined && firstB[d] !== undefined &&
      JSON.stringify(firstA[d]) === JSON.stringify(firstB[d]);
  });
}

// --- G1: 'the arena' registration ---
check('G1: "the arena" IS registered VIOLENT in this arm classifier (backlog gap closed here)',
  !!VIOLENT_FR['the arena']);
check('G1: "the arena" is NOT in the frozen analyzer VIOLENT map (unchanged overlay)',
  !A.VIOLENT['the arena']);
const arenaFixture = [
  { day: 31, cause: 'the arena' }, { day: 40, cause: 'monster' }, { day: 44, cause: 'contest' },
  { day: 45, cause: 'sickness' }, { day: 50, cause: 'sickness' },
];
check('G1: arena fixture classifies combat-led under the corrected rule (3/5 violent with arena)',
  classifyCorrected(arenaFixture, 11).mech === 'combat-led');
check('G1: same arena fixture classifies mixed/other under the frozen rule (named, not re-scored)',
  A.classify(arenaFixture, 11).mech === 'mixed/other');
check('G1: broken classifier (arena still unmapped) does NOT reproduce the corrected label',
  (function () {
    const m = Object.assign({}, VIOLENT_FR); delete m['the arena'];
    const violent = arenaFixture.filter(function (f) { return !!m[f.cause]; }).length;
    return violent / arenaFixture.length < 0.6;
  })());

// --- G1: 'Hushpuppy' monster-name cause (gap, named not bucketed) ---
check('G1: "Hushpuppy" is in NEITHER VIOLENT map (monster-name cause, unmapped — the gap, named)',
  !A.VIOLENT['Hushpuppy'] && !VIOLENT_FR['Hushpuppy']);
const hushFixture = [
  { day: 17, cause: 'Hushpuppy' }, { day: 36, cause: 'monster' }, { day: 46, cause: 'the wild' },
  { day: 46, cause: 'the wild' }, { day: 65, cause: 'the wild' }, { day: 68, cause: 'the arena' },
  { day: 74, cause: 'starvation' }, { day: 88, cause: 'the wild' }, { day: 144, cause: 'a stranger' },
  { day: 151, cause: 'contest' },
];
check('G1: L0-shape fallen fixture classifies combat-led under the frozen rule (7/10 violent)',
  A.classify(hushFixture, 11).mech === 'combat-led');
check('G1: same fixture classifies combat-led under the corrected rule (8/10 violent with arena)',
  classifyCorrected(hushFixture, 11).mech === 'combat-led');
check('G1: counting the monster-name death as violent keeps combat-led (9/10) — label robust to the gap',
  (function () {
    const violent = hushFixture.filter(function (f) { return !!VIOLENT_FR[f.cause] || f.cause === 'Hushpuppy'; }).length;
    return violent / hushFixture.length >= 0.6;
  })());

// --- G1: classifier fixtures (carried) ---
const attrFixture = [
  { day: 10, cause: 'monster' }, { day: 12, cause: 'combat' }, { day: 14, cause: 'the wild' },
  { day: 35, cause: 'sickness' }, { day: 40, cause: 'starvation' }, { day: 45, cause: 'thirst' },
];
check('G1: violent opener + thin roster + late attrition classifies attrition-after-thinning',
  A.classify(attrFixture, 6).mech === 'attrition-after-thinning');
const combatFixture = [
  { day: 9, cause: 'monster' }, { day: 15, cause: 'combat' }, { day: 20, cause: 'ambush' },
  { day: 25, cause: 'monster' }, { day: 30, cause: 'contest' },
];
check('G1: all-violent deaths classify combat-led',
  A.classify(combatFixture, 10).mech === 'combat-led');
check('G1: night-only deaths land mixed/other, cause stated',
  A.classify([{ day: 5, cause: 'the night' }, { day: 9, cause: 'the night' }], 11).mech === 'mixed/other' &&
  A.classify([{ day: 5, cause: 'the night' }], 11).detail.indexOf('the night') >= 0);

// --- G1: headline predicate on synthetic corpora (det-gate) ---
function synthHead(days, lost, standing, sd, w4) {
  const kills = [];
  for (let i = 0; i < w4; i++) kills.push({ d: 50 + i, mid: 'x', w: 4, by: 'v', via: 'wild', trick: null });
  return { seed: 53007, days: days, gameDays: days, endReason: lost ? 'village-lost' : 'survived', villageLost: !!lost, standing: standing, takeseatStats: { seatDay: sd }, waveKillLog: kills, fallen: [], daily: [], instrumentErrors: [] };
}
check('G1: headline predicate — old shape reads old',
  headline(synthHead(150, false, 584, 95, 5)) === 'old');
check('G1: headline predicate — moved shape reads moved',
  headline(synthHead(150, false, 199, 90, 2)) === 'moved');
check('G1: headline predicate — middle shape reads middle (1 w4 kill, not 2)',
  headline(synthHead(150, false, 199, 90, 1)) === 'middle');
check('G1: headline predicate — new shape reads new',
  headline(synthHead(138, true, 100, 92, 0)) === 'new');
check('G1: headline predicate — standing 194 reads middle (inside ±5 of 199, 1 w4)',
  headline(synthHead(150, false, 194, 90, 1)) === 'middle');
check('G1: headline predicate — standing 193 reads other, not middle (outside ±5 of 199)',
  headline(synthHead(150, false, 193, 90, 1)) === 'other');
check('G1: headline predicate — standing 184 reads other, not middle (15 below 199, the L0 case)',
  headline(synthHead(150, false, 184, 90, 1)) === 'other');
check('G1: headline predicate — standing 105 reads new (inside ±5 of 100)',
  headline(synthHead(138, true, 105, 92, 0)) === 'new');
check('G1: headline predicate — standing 106 reads other, not new (outside ±5 of 100)',
  headline(synthHead(138, true, 106, 92, 0)) === 'other');

// --- G1: band-rule synthetics (the judge itself, tested before it judges) ---
function synthEndpoint(standing, w4, fallen) {
  const kills = [];
  for (let i = 0; i < w4; i++) kills.push({ d: 50 + i, mid: 'x', w: 4, by: 'v', via: 'wild', trick: null });
  const fl = [];
  for (let i = 0; i < fallen; i++) fl.push({ day: 20 + i, name: 'V' + i, cause: 'sickness' });
  return { seed: 53011, days: 150, gameDays: 150, endReason: 'survived', villageLost: false, standing: standing, takeseatStats: { seatDay: 90 }, waveKillLog: kills, fallen: fl, daily: [], instrumentErrors: [] };
}
function bandOf(preFn, fixFn) {
  const pre = {}, fix = {};
  for (let s = 53011; s <= 53018; s++) { pre[s] = preFn(s); fix[s] = fixFn(s); }
  return { pre: pre, fix: fix };
}
(function () {
  // MOVER: 6 seeds move standing up + w4 up, 2 stable, 0 opposite.
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) { return s <= 53016 ? synthEndpoint(350, 3, 6) : synthEndpoint(300, 2, 6); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 6/8 move with the pair, 0 opposite => MOVER (with=' + j.with + ')',
    j.verdict === 'MOVER' && j.with === 6 && j.against === 0);
})();
(function () {
  // INERT: all 8 identical.
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function () { return synthEndpoint(300, 2, 6); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 0/8 move on any field => INERT',
    j.verdict === 'INERT' && j.anyMove === 0);
})();
(function () {
  // MIXED: seeds split directions (3 up, 2 down on standing).
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) {
      if (s <= 53013) return synthEndpoint(350, 3, 4);
      if (s <= 53015) return synthEndpoint(250, 1, 8);
      return synthEndpoint(300, 2, 6);
    });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): split directions => MIXED (with=' + j.with + ', against=' + j.against + ')',
    j.verdict === 'MIXED');
})();
(function () {
  // Single-field moves are trajectory notes: standing alone up on 7 seeds
  // moves NO seed with the pair (needs >=2 fields), so the pair is MIXED
  // only if another field splits — here standing-only means with=0.
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) { return s <= 53017 ? synthEndpoint(350, 2, 6) : synthEndpoint(300, 2, 6); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): standing-only moves on 7/8 seeds => with=0 (a single field never moves a seed)',
    j.with === 0);
})();
(function () {
  // Standing inside the ±5 tolerance does not move: 300 -> 304 is stable.
  const m = fieldMoves(synthEndpoint(300, 2, 6), synthEndpoint(304, 2, 6));
  check('G1 band: standing +4 is stable (inside ±5 tolerance)',
    m.standing === 0 && m.w4 === 0 && m.fallen === 0);
  const m2 = fieldMoves(synthEndpoint(300, 2, 6), synthEndpoint(294, 2, 6));
  check('G1 band: standing -6 moves DOWN (outside ±5 tolerance)',
    m2.standing === -1);
})();
(function () {
  // endpointsEqual: identical endpoints equal; a standing change of 1 fails exactness.
  const a = synthEndpoint(300, 2, 6);
  const b2 = synthEndpoint(300, 2, 6);
  const c = synthEndpoint(301, 2, 6);
  check('G1 band: endpointsEqual is true on identical endpoints, false on a 1-standing drift',
    endpointsEqual(a, b2) && !endpointsEqual(a, c));
})();
(function () {
  // A 5/8-with, 0-against band is MOVER; a 4/8-with band is MIXED (bar is 5, not 4).
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) { return s <= 53014 ? synthEndpoint(350, 3, 6) : synthEndpoint(300, 2, 6); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 4/8 move with the pair => MIXED, not MOVER (the bar is 5)',
    j.verdict === 'MIXED' && j.with === 4 && j.against === 0);
})();

// --- G1: first-divergence helper on synthetic daily rows ---
function synthDaily(days, pantryAt) {
  const daily = [];
  for (let d = 2; d <= days; d++) {
    daily.push({ day: d, living: 12, diag: { pantryKcal: pantryAt(d), foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  }
  return { seed: 53011, days: days, daily: daily };
}
check('G1: firstDivergence finds d10 when pantry first differs there',
  firstDivergence(synthDaily(20, function () { return 8000; }), synthDaily(20, function (d) { return d < 10 ? 8000 : 7982; })) === 10);
check('G1: firstDivergence finds d4 when pantry first differs there',
  firstDivergence(synthDaily(20, function () { return 8000; }), synthDaily(20, function (d) { return d < 4 ? 8000 : 7982; })) === 4);
check('G1: firstDivergence returns null for identical daily rows',
  firstDivergence(synthDaily(20, function () { return 8000; }), synthDaily(20, function () { return 8000; })) === null);
check('G1: rowsEqualOnDays is true on identical rows, false when one day differs',
  rowsEqualOnDays(synthDaily(20, function () { return 8000; }), synthDaily(20, function () { return 8000; }), [17, 18, 19, 20]) &&
  !rowsEqualOnDays(synthDaily(20, function () { return 8000; }), synthDaily(20, function (d) { return d < 18 ? 8000 : 7943; }), [17, 18, 19, 20]));
// Closing-duplicate artifact (bandfreeze, named): the closing snapshot
// duplicates the final day with a recomputed diag, so the NAIVE
// firstDivergence helper reports the final day as a divergence on dead
// seeds even when the daily rows are identical. The artifact-aware
// dailyRowsIdentical helper (first row per day) must NOT be fooled.
(function () {
  function dupDaily() {
    const c = synthDaily(10, function () { return 8000; });
    // Append the closing duplicate: same day 10, recomputed diag (pantry differs).
    c.daily.push({ day: 10, living: 12, diag: { pantryKcal: 0, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
    return c;
  }
  const a = dupDaily();
  const b = synthDaily(10, function () { return 8000; });
  check('G1: naive firstDivergence misreports the closing duplicate as d10 (the artifact, named)',
    firstDivergence(a, b) === 10);
  check('G1: dailyRowsIdentical is NOT fooled by the closing duplicate (first row per day)',
    dailyRowsIdentical(a, b));
  const c2 = synthDaily(10, function (d) { return d < 8 ? 8000 : 7900; });
  check('G1: dailyRowsIdentical still catches a real d8 divergence under a closing duplicate',
    !dailyRowsIdentical(a, c2));
})();

// --- G1: headline predicate on the committed 53007 corpora (carried) ---
const oldA = readJson(file('evidence/2026-11-08/perseed-53007-a/doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G1: committed 53007-a corpus reads old headline',
  oldA ? headline(oldA) === 'old' : null,
  oldA ? ('got ' + headline(oldA)) : 'no committed 53007-a corpus');
const movedB = readJson(file('evidence/2026-11-08/perseed-53007-bisect-b/doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G1: committed bisect-b corpus reads moved headline',
  movedB ? headline(movedB) === 'moved' : null,
  movedB ? ('got ' + headline(movedB)) : 'no committed bisect-b corpus');
const newF = readJson(file('evidence/2026-11-09/perseed-fightblend-53007-b/doorwalk-53007-a-s53007-fightblend-53007-b-current.json'));
checkSkip('G1: committed fightblend-b corpus reads new headline',
  newF ? headline(newF) === 'new' : null,
  newF ? ('got ' + headline(newF)) : 'no committed fightblend-b corpus');
const midF = readJson(file('evidence/2026-11-09/perseed-fightblend-attrib-b/doorwalk-53007-a-s53007-fightblend-attrib-b-current.json'));
checkSkip('G1: committed fightblend-attrib-b corpus reads middle headline',
  midF ? headline(midF) === 'middle' : null,
  midF ? ('got ' + headline(midF)) : 'no committed fightblend-attrib-b corpus');
const fifthF = readJson(file('evidence/2026-11-09/perseed-fightblend-reask-b/doorwalk-53007-a-s53007-fightblend-reask-b-current.json'));
checkSkip('G1: committed fightblend-reask-b corpus reads other (the fifth shape, standing 184)',
  fifthF ? (headline(fifthF) === 'other' && (fifthF.standing | 0) === 184) : null,
  fifthF ? ('got ' + headline(fifthF) + ' standing=' + fifthF.standing) : 'no committed reask corpus');

// --- G3: corpus integrity on synthetic corpora (same instrument shape) ---
function goodCorpus() {
  const daily = [];
  for (let d = 2; d <= 10; d++) {
    if (d === 3) continue;
    daily.push({ day: d, living: d < 5 ? 12 : 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  }
  daily.push({ day: 10, living: 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  return { seed: 53011, days: 10, gameDays: 10, endReason: 'village-lost', daily: daily, fallen: [{ day: 5, name: 'X', cause: 'sickness' }], instrumentErrors: [] };
}
check('G3: good synthetic corpus (instrument shape) PASSES integrity', A.checkCorpus(goodCorpus()).ok);
const noDiag = goodCorpus();
noDiag.daily[3].diag = null;
check('G3: broken recorder (diag dropped on a row) FAILS integrity', !A.checkCorpus(noDiag).ok);
const withErr = goodCorpus();
withErr.instrumentErrors = ['diag-53007: boom'];
check('G3: instrument errors FAIL integrity', !A.checkCorpus(withErr).ok);
// Broken-recorder sensitivity on a REAL corpus shape: strip diag from one
// row of a committed L3 corpus and integrity must fail (the proof catches
// a broken recorder on real data, not just on fixtures).
const commL3s11 = readJson(file('evidence/2026-11-09/perseed-bandfreeze-b/doorwalk-53007-a-s53011-bandfreeze-b-pre-b98f.json'));
checkSkip('G3: broken recorder on real data (diag stripped from one row of committed L3/53011) FAILS integrity',
  commL3s11 ? (function () {
    const mut = JSON.parse(JSON.stringify(commL3s11));
    mut.daily[5].diag = null;
    return !A.checkCorpus(mut).ok;
  })() : null, 'no committed L3 corpus yet');
// Pantry-zero mutation: a recorder that always writes pantry 0 must NOT
// read back as the committed corpus (the reproduction comparator catches it).
checkSkip('G1: pantry-zero mutated recorder does NOT reproduce the committed L3/53011 endpoint',
  commL3s11 ? (function () {
    const mut = JSON.parse(JSON.stringify(commL3s11));
    mut.daily.forEach(function (r) { if (r.diag) r.diag.pantryKcal = 0; });
    return firstDivergence(mut, commL3s11) !== null;
  })() : null, 'no committed L3 corpus yet');

// --- G2: neutrality on synthetic pairs (carried det-gate) ---
const rec = goodCorpus();
const unrec = A.stripDiag(JSON.parse(JSON.stringify(rec)));
check('G2: stripDiag pair is neutral (identical once diag removed)',
  A.neutralityCompare(unrec, rec).ok);
const drifted = A.stripDiag(JSON.parse(JSON.stringify(rec)));
drifted.daily[4].living = 10;
check('G2: a one-life drift in the unrecorded trajectory FAILS neutrality',
  !A.neutralityCompare(drifted, rec).ok);

// --- Real corpora: fresh re-runs (this arm) vs committed bandfreeze legs ---
const DIR = 'evidence/2026-11-09/perseed-foodrung-band-b/';
const COMM = 'evidence/2026-11-09/perseed-bandfreeze-b/';
const SEEDS = [53011, 53012, 53013, 53014, 53015, 53016, 53017, 53018];
function loadLeg(dir, run) {
  const out = {};
  SEEDS.forEach(function (s) {
    out[s] = readJson(file(dir + 'doorwalk-53007-a-s' + s + '-' + run + '.json'));
  });
  return out;
}
const freshL3 = loadLeg(DIR, 'foodrung-band-b-l3');
const freshL5 = loadLeg(DIR, 'foodrung-band-b-l5');
const commL3 = loadLeg(COMM, 'bandfreeze-b-pre-b98f');
const commL5 = loadLeg(COMM, 'bandfreeze-b-pre-e3ef');
const commL6 = loadLeg(COMM, 'bandfreeze-b-e3ef');
SEEDS.forEach(function (s) {
  checkSkip('G3 real: fresh L3 seed ' + s + ' corpus integrity',
    freshL3[s] ? A.checkCorpus(freshL3[s]).ok : null,
    freshL3[s] ? A.checkCorpus(freshL3[s]).problems.join('; ') : 'fresh L3 never ran yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: fresh L5 seed ' + s + ' corpus integrity',
    freshL5[s] ? A.checkCorpus(freshL5[s]).ok : null,
    freshL5[s] ? A.checkCorpus(freshL5[s]).problems.join('; ') : 'fresh L5 never ran yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: fresh L3 seed ' + s + ' has 0 instrument errors',
    freshL3[s] ? (freshL3[s].instrumentErrors || []).length === 0 : null,
    freshL3[s] ? ('errors: ' + (freshL3[s].instrumentErrors || []).join('; ')) : 'fresh L3 never ran yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: fresh L5 seed ' + s + ' has 0 instrument errors',
    freshL5[s] ? (freshL5[s].instrumentErrors || []).length === 0 : null,
    freshL5[s] ? ('errors: ' + (freshL5[s].instrumentErrors || []).join('; ')) : 'fresh L5 never ran yet');
});
// REPRODUCTION: fresh endpoints must equal committed endpoints EXACTLY.
// These are check() (FAIL when both exist but differ) — a drifted re-run
// must fail the proof, not skip past it. Absent fresh corpora SKIP.
SEEDS.forEach(function (s) {
  if (!freshL3[s] || !commL3[s]) {
    checkSkip('G1 real: reproduction L3 seed ' + s + ' (fresh endpoint == committed endpoint, exact)',
      null, 'fresh L3 not present yet');
  } else {
    check('G1 real: reproduction L3 seed ' + s + ' (fresh endpoint == committed endpoint, exact)',
      endpointsEqual(freshL3[s], commL3[s]),
      'fresh ' + JSON.stringify(bandEndpoint(freshL3[s])) + ' vs committed ' + JSON.stringify(bandEndpoint(commL3[s])));
  }
});
SEEDS.forEach(function (s) {
  if (!freshL5[s] || !commL5[s]) {
    checkSkip('G1 real: reproduction L5 seed ' + s + ' (fresh endpoint == committed endpoint, exact)',
      null, 'fresh L5 not present yet');
  } else {
    check('G1 real: reproduction L5 seed ' + s + ' (fresh endpoint == committed endpoint, exact)',
      endpointsEqual(freshL5[s], commL5[s]),
      'fresh ' + JSON.stringify(bandEndpoint(freshL5[s])) + ' vs committed ' + JSON.stringify(bandEndpoint(commL5[s])));
  }
});
SEEDS.forEach(function (s) {
  checkSkip('G1 real: reproduction L3 seed ' + s + ' daily rows identical to committed (first-row-per-day, closing-duplicate aware)',
    (freshL3[s] && commL3[s]) ? dailyRowsIdentical(freshL3[s], commL3[s]) : null,
    (freshL3[s] && commL3[s]) ? 'daily rows differ on first-row-per-day comparison' : 'fresh L3 not present yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G1 real: reproduction L5 seed ' + s + ' daily rows identical to committed (first-row-per-day, closing-duplicate aware)',
    (freshL5[s] && commL5[s]) ? dailyRowsIdentical(freshL5[s], commL5[s]) : null,
    (freshL5[s] && commL5[s]) ? 'daily rows differ on first-row-per-day comparison' : 'fresh L5 not present yet');
});
// BRIDGE: the committed L5/L6 pair judges INERT under the band rule —
// the place-line fix moves nothing on this band, so the L3/L5 pair judges
// the food rung. If this leg ever reads otherwise, the bridge is broken.
checkSkip('G1 real: BRIDGE — committed L5/L6 pair judges INERT (place-line fix moves nothing on the band)',
  (commL5[53011] && commL6[53011]) ? (function () {
    const j = judgePairB(commL5, commL6);
    console.log('    bridge L5/L6: ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', anyMove=' + j.anyMove + ')');
    return j.verdict === 'INERT' && j.anyMove === 0;
  })() : null, 'committed L5/L6 pair not present');
// PAIR VERDICT: judged on the FRESH re-run only, never on the published numbers.
checkSkip('G1 real: food-rung pair verdict computed from the FRESH re-run (MOVER / INERT / MIXED)',
  (freshL3[53011] && freshL5[53011]) ? (function () {
    const j = judgePairB(freshL3, freshL5);
    console.log('    pair verdict (fresh L3 vs L5): ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', anyMove=' + j.anyMove + ', dir=' + JSON.stringify(j.dir) + ', per-seed=' + JSON.stringify(j.perSeed) + ')');
    return ['MOVER', 'INERT', 'MIXED'].indexOf(j.verdict) >= 0;
  })() : null, 'fresh L3/L5 pair not present yet');

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
