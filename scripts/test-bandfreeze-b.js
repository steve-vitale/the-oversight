// test-bandfreeze-b.js — proof for the frozen-band freeze + fightblend re-ask
// (arm sim-bandfreeze-b). G1 det-gate (classifier on the judged/committed
// corpora + broken-classifier/broken-recorder sensitivity + the 'the arena'
// registration + the 'Hushpuppy' monster-name cause, unmapped and named +
// headline predicate + BAND-RULE judge synthetics), G2 recorder neutrality
// (armed vs unrecorded on the SAME leg tree), G3 corpus integrity on every
// new corpus. Fixture-based; no sim, no harness load — runs at any SHA.
// Real-corpus legs run when the committed corpora exist and SKIP otherwise.
// Legs: F0 freeze (8 seeds, fd306cac1) must re-verify identically in F0c;
// L1/L2 judge fightblend (OLD->MOVED direction D) on the band; L3/L4 and
// L5/L6 judge b98f/e3ef as movers/inert/mixed. A single-seed move is a
// trajectory note, never a finger.
// Run: node scripts/test-bandfreeze-b.js
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
const VIOLENT_BF = Object.assign({}, A.VIOLENT, { 'the arena': 1 });
function causeOf(f) { return (f && f.cause) ? String(f.cause) : 'unknown'; }
function classifyCorrected(fallen, livingAt30) {
  fallen = (fallen || []).slice().sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
  const n = fallen.length;
  if (!n) return { mech: 'no-deaths', detail: 'no fallen entries' };
  const sick = fallen.filter(function (f) { return causeOf(f) === 'sickness'; });
  const violent = fallen.filter(function (f) { return !!VIOLENT_BF[causeOf(f)]; });
  const attr = fallen.filter(function (f) { return !!A.ATTRITION[causeOf(f)]; });
  const firstViolentDay = violent.length ? Math.min.apply(null, violent.map(function (f) { return f.day | 0; })) : null;
  const thirdSickDay = sick.length >= 3 ? sick[2].day : null;
  if (causeOf(fallen[0]) === 'sickness' && sick.length / n >= 0.4 &&
      (firstViolentDay == null || thirdSickDay == null || firstViolentDay > thirdSickDay)) {
    return { mech: 'sickness-first', detail: 'first death sickness d' + fallen[0].day + '; sickness ' + sick.length + '/' + n + '; first violent ' + (firstViolentDay == null ? 'never' : 'd' + firstViolentDay) };
  }
  const first3Violent = fallen.length >= 3 && fallen.slice(0, 3).every(function (f) { return !!VIOLENT_BF[causeOf(f)]; });
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

// --- THE BAND RULE (binding, from the prereg) ---
// Per-seed movement (fix vs pre) on three numeric fields:
//   standing: DOWN if fix-pre <= -6, UP if >= +6, else stable (±5 tolerance).
//   w4 kills: DOWN if fix < pre, UP if fix > pre, else stable.
//   fallen count: UP if fix > pre, DOWN if fix < pre, else stable.
// OLD->MOVED direction D: standing DOWN (-1), w4 DOWN (-1), fallen UP (+1).
// A seed moves in D iff >=2 fields move in D and none moves opposite D.
// A seed moves opposite D iff >=2 move opposite D and none moves in D.
// Pair (a): FINGERED iff >=5/8 move in D and 0 opposite; EXONERATED iff
// 0 move in D and 0 opposite; else MIXED. Pair (b): per-field majority
// direction is read off the data; MOVER iff >=5/8 move with the pair and
// 0 opposite; INERT iff no seed moves on any field; else MIXED.
function fieldMoves(pre, fix) {
  const dStanding = (fix.standing | 0) - (pre.standing | 0);
  const standing = dStanding <= -6 ? -1 : (dStanding >= 6 ? 1 : 0);
  const dW4 = w4kills(fix) - w4kills(pre);
  const w4 = dW4 < 0 ? -1 : (dW4 > 0 ? 1 : 0);
  const dFallen = fallenN(fix) - fallenN(pre);
  const fallen = dFallen > 0 ? 1 : (dFallen < 0 ? -1 : 0);
  return { standing: standing, w4: w4, fallen: fallen };
}
const DIR_D = { standing: -1, w4: -1, fallen: 1 };
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
function judgePairA(preBySeed, fixBySeed) {
  const perSeed = {};
  let withN = 0, againstN = 0;
  Object.keys(preBySeed).sort().forEach(function (s) {
    const mv = seedMoveVs(preBySeed[s], fixBySeed[s], DIR_D);
    perSeed[s] = mv;
    if (mv === 'with') withN++;
    if (mv === 'against') againstN++;
  });
  const verdict = (withN >= 5 && againstN === 0) ? 'FINGERED'
    : (withN === 0 && againstN === 0) ? 'EXONERATED' : 'MIXED';
  return { verdict: verdict, with: withN, against: againstN, perSeed: perSeed };
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

// bandEndpoint(corpus): the binding-field tuple for freeze stability.
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
  !!VIOLENT_BF['the arena']);
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
    const m = Object.assign({}, VIOLENT_BF); delete m['the arena'];
    const violent = arenaFixture.filter(function (f) { return !!m[f.cause]; }).length;
    return violent / arenaFixture.length < 0.6;
  })());

// --- G1: 'Hushpuppy' monster-name cause (gap, named not bucketed) ---
check('G1: "Hushpuppy" is in NEITHER VIOLENT map (monster-name cause, unmapped — the gap, named)',
  !A.VIOLENT['Hushpuppy'] && !VIOLENT_BF['Hushpuppy']);
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
    const violent = hushFixture.filter(function (f) { return !!VIOLENT_BF[f.cause] || f.cause === 'Hushpuppy'; }).length;
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
  // FINGERED: 6 seeds move in D (standing -50, w4 -1, fallen +2), 2 stable, 0 opposite.
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) { return s <= 53016 ? synthEndpoint(250, 1, 8) : synthEndpoint(300, 2, 6); });
  const j = judgePairA(b.pre, b.fix);
  check('G1 band: 6/8 move in D, 0 opposite => FINGERED (with=' + j.with + ', against=' + j.against + ')',
    j.verdict === 'FINGERED' && j.with === 6 && j.against === 0);
})();
(function () {
  // EXONERATED: all 8 stable (identical endpoints).
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function () { return synthEndpoint(300, 2, 6); });
  const j = judgePairA(b.pre, b.fix);
  check('G1 band: 0/8 move, 0 opposite => EXONERATED',
    j.verdict === 'EXONERATED' && j.with === 0 && j.against === 0);
})();
(function () {
  // MIXED: 3 move in D, 1 moves opposite (standing +50, w4 +1, fallen -2).
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) {
      if (s <= 53013) return synthEndpoint(250, 1, 8);
      if (s === 53014) return synthEndpoint(350, 3, 4);
      return synthEndpoint(300, 2, 6);
    });
  const j = judgePairA(b.pre, b.fix);
  check('G1 band: 3 with, 1 against => MIXED, never fingered (with=' + j.with + ', against=' + j.against + ')',
    j.verdict === 'MIXED' && j.with === 3 && j.against === 1);
})();
(function () {
  // Single-field moves are trajectory notes: standing alone down on 7 seeds
  // moves NO seed in D (needs >=2 fields), so the pair is EXONERATED, not fingered.
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) { return s <= 53017 ? synthEndpoint(250, 2, 6) : synthEndpoint(300, 2, 6); });
  const j = judgePairA(b.pre, b.fix);
  check('G1 band: standing-only moves on 7/8 seeds => EXONERATED (a single field never fingers)',
    j.verdict === 'EXONERATED' && j.with === 0);
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
  // Pair (b) MOVER: 6 seeds move standing down + w4 down, 2 stable, 0 opposite.
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) { return s <= 53016 ? synthEndpoint(250, 1, 6) : synthEndpoint(300, 2, 6); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 6/8 move with the pair, 0 opposite => MOVER (with=' + j.with + ')',
    j.verdict === 'MOVER' && j.with === 6 && j.against === 0);
})();
(function () {
  // Pair (b) INERT: all 8 identical.
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function () { return synthEndpoint(300, 2, 6); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 0/8 move on any field => INERT',
    j.verdict === 'INERT' && j.anyMove === 0);
})();
(function () {
  // Pair (b) MIXED: seeds split directions (3 down, 2 up on standing).
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) {
      if (s <= 53013) return synthEndpoint(250, 1, 8);
      if (s <= 53015) return synthEndpoint(350, 3, 4);
      return synthEndpoint(300, 2, 6);
    });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): split directions => MIXED (with=' + j.with + ', against=' + j.against + ')',
    j.verdict === 'MIXED');
})();
(function () {
  // endpointsEqual: identical endpoints equal; a standing change of 1 fails exactness.
  const a = synthEndpoint(300, 2, 6);
  const b2 = synthEndpoint(300, 2, 6);
  const c = synthEndpoint(301, 2, 6);
  check('G1 band: endpointsEqual is true on identical endpoints, false on a 1-standing drift',
    endpointsEqual(a, b2) && !endpointsEqual(a, c));
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

// --- G2: neutrality on synthetic pairs ---
const rec = goodCorpus();
const unrec = A.stripDiag(JSON.parse(JSON.stringify(rec)));
check('G2: stripDiag pair is neutral (identical once diag removed)',
  A.neutralityCompare(unrec, rec).ok);
const drifted = A.stripDiag(JSON.parse(JSON.stringify(rec)));
drifted.daily[4].living = 10;
check('G2: a one-life drift in the unrecorded trajectory FAILS neutrality',
  !A.neutralityCompare(drifted, rec).ok);

// --- Real corpora: the freeze (F0), control (F0b), re-verify (F0c) ---
const DIR = 'evidence/2026-11-09/perseed-bandfreeze-b/';
const SEEDS = [53011, 53012, 53013, 53014, 53015, 53016, 53017, 53018];
function loadLeg(run) {
  const out = {};
  SEEDS.forEach(function (s) {
    out[s] = readJson(file(DIR + 'doorwalk-53007-a-s' + s + '-' + run + '.json'));
  });
  return out;
}
function loadOne(seed, run) {
  return readJson(file(DIR + 'doorwalk-53007-a-s' + seed + '-' + run + '.json'));
}
const f0 = loadLeg('bandfreeze-b-freeze');
const f0c = loadLeg('bandfreeze-b-freeze-reverify');
const f0b = loadOne(53011, 'bandfreeze-b-freeze-unrec');
SEEDS.forEach(function (s) {
  checkSkip('G3 real: F0 freeze seed ' + s + ' corpus integrity',
    f0[s] ? A.checkCorpus(f0[s]).ok : null,
    f0[s] ? A.checkCorpus(f0[s]).problems.join('; ') : 'no F0 corpus for ' + s + ' yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: F0c re-verify seed ' + s + ' corpus integrity',
    f0c[s] ? A.checkCorpus(f0c[s]).ok : null,
    f0c[s] ? A.checkCorpus(f0c[s]).problems.join('; ') : 'no F0c corpus for ' + s + ' yet');
});
checkSkip('G3 real: F0b unrecorded control (53011) corpus integrity',
  f0b ? A.checkCorpus(f0b).ok : null,
  f0b ? A.checkCorpus(f0b).problems.join('; ') : 'no F0b corpus yet');
checkSkip('G2 real: F0b armed == unrecorded on seed 53011 (same master fd306cac1)',
  (f0[53011] && f0b) ? A.neutralityCompare(f0b, f0[53011]).ok : null,
  (f0[53011] && f0b) ? A.neutralityCompare(f0b, f0[53011]).diffs.join(', ') : 'F0/F0b pair not present yet');
SEEDS.forEach(function (s) {
  checkSkip('G1 real: freeze STABLE on seed ' + s + ' (F0c endpoint == F0 endpoint, exact)',
    (f0[s] && f0c[s]) ? endpointsEqual(f0[s], f0c[s]) : null,
    (f0[s] && f0c[s]) ? 'F0 ' + JSON.stringify(bandEndpoint(f0[s])) + ' vs F0c ' + JSON.stringify(bandEndpoint(f0c[s])) : 'F0/F0c pair not present yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G1 real: F0 seed ' + s + ' has 0 instrument errors',
    f0[s] ? (f0[s].instrumentErrors || []).length === 0 : null,
    f0[s] ? ('errors: ' + (f0[s].instrumentErrors || []).join('; ')) : 'no F0 corpus for ' + s + ' yet');
});

// --- Real corpora: attribution legs (SKIP until run) ---
const l1 = loadLeg('bandfreeze-b-pre-fb');
const l2 = loadLeg('bandfreeze-b-fb');
const l3 = loadLeg('bandfreeze-b-pre-b98f');
const l4 = loadLeg('bandfreeze-b-b98f');
const l5 = loadLeg('bandfreeze-b-pre-e3ef');
const l6 = loadLeg('bandfreeze-b-e3ef');
SEEDS.forEach(function (s) {
  checkSkip('G3 real: L1 pre-fightblend seed ' + s + ' corpus integrity',
    l1[s] ? A.checkCorpus(l1[s]).ok : null,
    l1[s] ? A.checkCorpus(l1[s]).problems.join('; ') : 'L1 never ran — freeze unstable or not yet run');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: L2 fix-fightblend seed ' + s + ' corpus integrity',
    l2[s] ? A.checkCorpus(l2[s]).ok : null,
    l2[s] ? A.checkCorpus(l2[s]).problems.join('; ') : 'L2 never ran — freeze unstable or not yet run');
});
checkSkip('G1 real: pair (a) band verdict computed (FINGERED / EXONERATED / MIXED)',
  (l1[53011] && l2[53011]) ? (function () {
    const j = judgePairA(l1, l2);
    console.log('    pair (a) verdict: ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', per-seed=' + JSON.stringify(j.perSeed) + ')');
    return ['FINGERED', 'EXONERATED', 'MIXED'].indexOf(j.verdict) >= 0;
  })() : null, 'L1/L2 never ran — freeze unstable or not yet run');
SEEDS.forEach(function (s) {
  checkSkip('G3 real: L3 pre-secret seed ' + s + ' corpus integrity',
    l3[s] ? A.checkCorpus(l3[s]).ok : null,
    l3[s] ? A.checkCorpus(l3[s]).problems.join('; ') : 'L3 never ran — (a) unjudged or not yet run');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: L4 secret seed ' + s + ' corpus integrity',
    l4[s] ? A.checkCorpus(l4[s]).ok : null,
    l4[s] ? A.checkCorpus(l4[s]).problems.join('; ') : 'L4 never ran — (a) unjudged or not yet run');
});
checkSkip('G1 real: pair (b/b98f) band verdict computed (MOVER / INERT / MIXED)',
  (l3[53011] && l4[53011]) ? (function () {
    const j = judgePairB(l3, l4);
    console.log('    pair (b/b98f) verdict: ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', anyMove=' + j.anyMove + ', dir=' + JSON.stringify(j.dir) + ', per-seed=' + JSON.stringify(j.perSeed) + ')');
    return ['MOVER', 'INERT', 'MIXED'].indexOf(j.verdict) >= 0;
  })() : null, 'L3/L4 never ran — (a) unjudged or not yet run');
SEEDS.forEach(function (s) {
  checkSkip('G3 real: L5 pre-place seed ' + s + ' corpus integrity',
    l5[s] ? A.checkCorpus(l5[s]).ok : null,
    l5[s] ? A.checkCorpus(l5[s]).problems.join('; ') : 'L5 never ran — (a) unjudged or not yet run');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: L6 place seed ' + s + ' corpus integrity',
    l6[s] ? A.checkCorpus(l6[s]).ok : null,
    l6[s] ? A.checkCorpus(l6[s]).problems.join('; ') : 'L6 never ran — (a) unjudged or not yet run');
});
checkSkip('G1 real: pair (b/e3ef) band verdict computed (MOVER / INERT / MIXED)',
  (l5[53011] && l6[53011]) ? (function () {
    const j = judgePairB(l5, l6);
    console.log('    pair (b/e3ef) verdict: ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', anyMove=' + j.anyMove + ', dir=' + JSON.stringify(j.dir) + ', per-seed=' + JSON.stringify(j.perSeed) + ')');
    return ['MOVER', 'INERT', 'MIXED'].indexOf(j.verdict) >= 0;
  })() : null, 'L5/L6 never ran — (a) unjudged or not yet run');

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
