// test-midfifth-c-b.js — proof for the (c) MIDDLE→FIFTH suspect set on the
// frozen band (arm sim-midfifth-c-b). G1 det-gate (classifier on the
// judged/committed corpora + broken-classifier/broken-recorder sensitivity +
// the 'the arena' registration + the 'Hushpuppy' monster-name cause, unmapped
// and named + headline predicate + BAND-RULE judge synthetics + pantry /
// sick-list recorder sensitivity), G3 corpus integrity on every new corpus.
// Fixture-based; no sim, no harness load — runs at any SHA.
// Real-corpus legs run when the committed corpora exist and SKIP otherwise.
// Legs: F0r re-verify (8 seeds, 7cd52fbb0) reported as drift vs the F0 freeze
// (fd306cac1) — drift is expected, master moved; it is reported, not a
// verdict. L7/L8 judge the coach fix, L9/L10 the medic-duty widen, L11/L12
// the first-reveal guard, L13/L14 the feast tooltip — each as MOVER / INERT /
// MIXED under the preregistered pair-(b) rule. A single-seed move is a
// trajectory note, never a finger.
// Run: node scripts/test-midfifth-c-b.js
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

// --- THE BAND RULE (binding, from the prereg; pair-(b) form) ---
// Per-seed movement (fix vs pre) on three numeric fields:
//   standing: DOWN if fix-pre <= -6, UP if >= +6, else stable (±5 tolerance).
//   w4 kills: DOWN if fix < pre, UP if fix > pre, else stable.
//   fallen count: UP if fix > pre, DOWN if fix < pre, else stable.
// Per field, the pair direction is the majority sign across the 8 seeds
// (counting only seeds where that field moves beyond tolerance; a tied field
// has no direction). A seed moves with the pair iff >=2 of its 3 fields move
// in their majority direction and none moves opposite.
// MOVER iff >=5/8 move with the pair and 0 opposite; INERT iff no seed moves
// on any field; else MIXED.
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
function driftSummary(pre, fix) {
  const d = [];
  if ((pre.days | 0) !== (fix.days | 0)) d.push('days ' + pre.days + '->' + fix.days);
  if (!!pre.villageLost !== !!fix.villageLost) d.push('end ' + (pre.villageLost ? 'lost' : 'survived') + '->' + (fix.villageLost ? 'lost' : 'survived'));
  if ((pre.standing | 0) !== (fix.standing | 0)) d.push('standing ' + pre.standing + '->' + fix.standing);
  if (seatDay(pre) !== seatDay(fix)) d.push('seatDay ' + seatDay(pre) + '->' + seatDay(fix));
  if (w4kills(pre) !== w4kills(fix)) d.push('w4 ' + w4kills(pre) + '->' + w4kills(fix));
  if (w4faced(pre) !== w4faced(fix)) d.push('w4faced ' + w4faced(pre) + '->' + w4faced(fix));
  if (fallenN(pre) !== fallenN(fix)) d.push('fallen ' + fallenN(pre) + '->' + fallenN(fix));
  return d.length ? d.join(', ') : 'identical';
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

// --- Recorder sensitivity (this arm's broken-recorder checks) ---
// pantrySane: the first daily row (d2) carries the starting pantry, always
// > 0 on a real corpus (F0 d2 pantry is 37,890–41,710 on all 8 seeds). A
// recorder that zeroes pantry fails this; checkCorpus does NOT catch 0
// (it only checks pantryKcal != null).
function pantrySane(c) {
  if (!c || !c.daily || !c.daily.length) return false;
  const d0 = c.daily[0].diag;
  return !!d0 && (d0.pantryKcal | 0) > 0;
}
// sickListsSane: on every recorded row, sickList/woundedList are arrays whose
// lengths match sickN/woundedN (verified on all 65 bandfreeze corpora: the
// only mismatches are the unrecorded F0b control, which has no diag at all).
// A recorder that drops the sick list fails this; checkCorpus does NOT catch
// it (it only checks sickN != null).
function sickListsSane(c) {
  if (!c || c.instrumentOff) return true; // unrecorded shape has no diag to check
  const daily = c.daily || [];
  if (!daily.length) return false;
  return daily.every(function (r) {
    const d = r.diag;
    if (!d) return false;
    return Array.isArray(d.sickList) && d.sickList.length === (d.sickN | 0) &&
      Array.isArray(d.woundedList) && d.woundedList.length === (d.woundedN | 0);
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

// --- G1: broken-recorder sensitivity (this arm's det-gate) ---
// The proof must FAIL on a broken recorder and PASS on the real one.
function goodCorpus() {
  const daily = [];
  for (let d = 2; d <= 10; d++) {
    if (d === 3) continue;
    daily.push({ day: d, living: d < 5 ? 12 : 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  }
  daily.push({ day: 10, living: 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  return { seed: 53011, days: 10, gameDays: 10, endReason: 'village-lost', daily: daily, fallen: [{ day: 5, name: 'X', cause: 'sickness' }], instrumentErrors: [] };
}
check('G1: good synthetic corpus passes pantrySane + sickListsSane (the real shape)',
  pantrySane(goodCorpus()) && sickListsSane(goodCorpus()));
(function () {
  // Broken recorder 1: pantry always 0. checkCorpus does NOT catch 0
  // (pantryKcal != null), so pantrySane is the catcher.
  const broken = goodCorpus();
  broken.daily.forEach(function (r) { r.diag.pantryKcal = 0; });
  check('G1: broken recorder (pantry always 0) FAILS pantrySane — and checkCorpus alone would MISS it (pantry 0 != null)',
    !pantrySane(broken) && A.checkCorpus(broken).ok);
})();
(function () {
  // Broken recorder 2: sick list dropped (sickN kept). checkCorpus does NOT
  // catch a dropped list (it only checks sickN != null), so sickListsSane is
  // the catcher.
  const broken = goodCorpus();
  broken.daily.forEach(function (r) { r.diag.sickN = 1; delete r.diag.sickList; });
  check('G1: broken recorder (sick list dropped) FAILS sickListsSane — and checkCorpus alone would MISS it',
    !sickListsSane(broken) && A.checkCorpus(broken).ok);
})();
(function () {
  // Broken recorder 3: diag dropped on a row. checkCorpus catches this one.
  const broken = goodCorpus();
  broken.daily[3].diag = null;
  check('G1: broken recorder (diag dropped on a row) FAILS integrity',
    !A.checkCorpus(broken).ok);
})();
(function () {
  // The real F0 corpus passes all three sanity checks (the proof passes on
  // the real recorder).
  const f0 = readJson(file('evidence/2026-11-09/perseed-bandfreeze-b/doorwalk-53007-a-s53011-bandfreeze-b-freeze.json'));
  checkSkip('G1: real F0 corpus (53011) passes pantrySane + sickListsSane + integrity',
    f0 ? (pantrySane(f0) && sickListsSane(f0) && A.checkCorpus(f0).ok) : null,
    f0 ? ('pantry=' + pantrySane(f0) + ' lists=' + sickListsSane(f0) + ' integ=' + A.checkCorpus(f0).ok) : 'no committed F0 corpus');
})();

// --- G3: corpus integrity on synthetic corpora (same instrument shape) ---
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
  midF ? ('got ' + headline(midF)) : 'no committed fightblend-b corpus');
const fifthF = readJson(file('evidence/2026-11-09/perseed-fightblend-reask-b/doorwalk-53007-a-s53007-fightblend-reask-b-current.json'));
checkSkip('G1: committed fightblend-reask-b corpus reads other (the fifth shape, standing 184)',
  fifthF ? (headline(fifthF) === 'other' && (fifthF.standing | 0) === 184) : null,
  fifthF ? ('got ' + headline(fifthF) + ' standing=' + fifthF.standing) : 'no committed reask corpus');

// --- Real corpora: the freeze (F0) and the re-verify (F0r) ---
const DIRB = 'evidence/2026-11-09/perseed-bandfreeze-b/';
const DIR = 'evidence/2026-11-09/perseed-midfifth-c-b/';
const SEEDS = [53011, 53012, 53013, 53014, 53015, 53016, 53017, 53018];
function loadLeg(dir, run) {
  const out = {};
  SEEDS.forEach(function (s) {
    out[s] = readJson(file(dir + 'doorwalk-53007-a-s' + s + '-' + run + '.json'));
  });
  return out;
}
const f0 = loadLeg(DIRB, 'bandfreeze-b-freeze');
const f0r = loadLeg(DIR, 'midfifth-c-f0reverify');
SEEDS.forEach(function (s) {
  checkSkip('G3 real: F0r re-verify seed ' + s + ' corpus integrity',
    f0r[s] ? A.checkCorpus(f0r[s]).ok : null,
    f0r[s] ? A.checkCorpus(f0r[s]).problems.join('; ') : 'no F0r corpus for ' + s + ' yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G3 real: F0r seed ' + s + ' passes pantrySane + sickListsSane',
    f0r[s] ? (pantrySane(f0r[s]) && sickListsSane(f0r[s])) : null,
    f0r[s] ? ('pantry=' + pantrySane(f0r[s]) + ' lists=' + sickListsSane(f0r[s])) : 'no F0r corpus for ' + s + ' yet');
});
SEEDS.forEach(function (s) {
  checkSkip('G1 real: F0r drift vs F0 on seed ' + s + ' (REPORTED — master moved, drift is not a failure)',
    (f0[s] && f0r[s]) ? true : null,
    (f0[s] && f0r[s]) ? (endpointsEqual(f0[s], f0r[s]) ? 'EXACT — freeze holds on current master' : 'DRIFT — ' + driftSummary(f0[s], f0r[s])) : 'F0/F0r pair not present yet');
});

// --- Real corpora: attribution legs L7-L14 (SKIP until run) ---
const LEGS = [
  ['L7', 'midfifth-c-pre-coach', 'pre-coach'], ['L8', 'midfifth-c-coach', 'coach'],
  ['L9', 'midfifth-c-pre-medic', 'pre-medic'], ['L10', 'midfifth-c-medic', 'medic'],
  ['L11', 'midfifth-c-pre-reveal', 'pre-reveal'], ['L12', 'midfifth-c-reveal', 'reveal'],
  ['L13', 'midfifth-c-pre-tooltip', 'pre-tooltip'], ['L14', 'midfifth-c-tooltip', 'tooltip'],
];
const legs = {};
LEGS.forEach(function (spec) { legs[spec[0]] = loadLeg(DIR, spec[1]); });
LEGS.forEach(function (spec) {
  SEEDS.forEach(function (s) {
    checkSkip('G3 real: ' + spec[0] + ' ' + spec[2] + ' seed ' + s + ' corpus integrity',
      legs[spec[0]][s] ? A.checkCorpus(legs[spec[0]][s]).ok : null,
      legs[spec[0]][s] ? A.checkCorpus(legs[spec[0]][s]).problems.join('; ') : spec[0] + ' never ran yet');
  });
});
function pairVerdictLeg(label, preLeg, fixLeg) {
  checkSkip('G1 real: pair ' + label + ' band verdict computed (MOVER / INERT / MIXED)',
    (legs[preLeg][53011] && legs[fixLeg][53011]) ? (function () {
      const j = judgePairB(legs[preLeg], legs[fixLeg]);
      console.log('    pair ' + label + ' verdict: ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', anyMove=' + j.anyMove + ', dir=' + JSON.stringify(j.dir) + ', per-seed=' + JSON.stringify(j.perSeed) + ')');
      return ['MOVER', 'INERT', 'MIXED'].indexOf(j.verdict) >= 0;
    })() : null, preLeg + '/' + fixLeg + ' never ran yet');
}
pairVerdictLeg('(c/coach) L7/L8', 'L7', 'L8');
pairVerdictLeg('(c/medic) L9/L10', 'L9', 'L10');
pairVerdictLeg('(c/reveal) L11/L12', 'L11', 'L12');
pairVerdictLeg('(c/tooltip) L13/L14', 'L13', 'L14');

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
