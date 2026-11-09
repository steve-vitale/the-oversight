// test-fightblend-reask-b.js — proof for the fightblend re-ask #4 on 53007
// (arm sim-fightblend-reask-b). G1 det-gate (classifier on the judged/committed
// corpora + broken-classifier/broken-recorder/broken-headline sensitivity +
// the 'the arena' registration + the 'Hushpuppy' monster-name cause, unmapped
// and named), G2 recorder neutrality (armed vs unrecorded on the SAME leg
// tree), G3 corpus integrity on every new corpus. Fixture-based; no sim, no
// harness load — runs at any SHA. Real-corpus legs run when the committed
// corpora exist and SKIP otherwise. Legs: L0 current master (0fcff01ea) does
// NOT reproduce MIDDLE — it reads a fifth shape (150d survived, standing 184,
// seatDay 90, 1 w4 kill, fallen 10) — so the prereg STOP fires (DIAG-STOP,
// endpoint-moved-again) and L1–L4 never run (their legs SKIP). GO (STOP) iff
// L0 reads 'other' with the fifth-shape headline and G2/G3 pass on the L0 pair.
// Run: node scripts/test-fightblend-reask-b.js
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

// --- The 'the arena' registration (this arm's classifier) ---
// The frozen analyzer's VIOLENT map keys 'arena' but the game emits the cause
// string 'the arena'. This arm registers 'the arena' as VIOLENT in ITS OWN
// classifier; the frozen analyzer is NOT edited (it is overlaid unchanged).
// classifyCorrected re-applies the 53007-a prereg rule with the extended map.
const VIOLENT_REASK = Object.assign({}, A.VIOLENT, { 'the arena': 1 });
function causeOf(f) { return (f && f.cause) ? String(f.cause) : 'unknown'; }
function classifyCorrected(fallen, livingAt30) {
  fallen = (fallen || []).slice().sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
  const n = fallen.length;
  if (!n) return { mech: 'no-deaths', detail: 'no fallen entries' };
  const sick = fallen.filter(function (f) { return causeOf(f) === 'sickness'; });
  const violent = fallen.filter(function (f) { return !!VIOLENT_REASK[causeOf(f)]; });
  const attr = fallen.filter(function (f) { return !!A.ATTRITION[causeOf(f)]; });
  const firstViolentDay = violent.length ? Math.min.apply(null, violent.map(function (f) { return f.day | 0; })) : null;
  const thirdSickDay = sick.length >= 3 ? sick[2].day : null;
  if (causeOf(fallen[0]) === 'sickness' && sick.length / n >= 0.4 &&
      (firstViolentDay == null || thirdSickDay == null || firstViolentDay > thirdSickDay)) {
    return { mech: 'sickness-first', detail: 'first death sickness d' + fallen[0].day + '; sickness ' + sick.length + '/' + n + '; first violent ' + (firstViolentDay == null ? 'never' : 'd' + firstViolentDay) };
  }
  const first3Violent = fallen.length >= 3 && fallen.slice(0, 3).every(function (f) { return !!VIOLENT_REASK[causeOf(f)]; });
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
  const seatDay = (c.takeseatStats || {}).seatDay;
  const standing = c.standing | 0;
  if (c.days === 150 && !c.villageLost && seatDay === 95 && Math.abs(standing - 584) <= 5 && w4kills(c) === 5) return 'old';
  if (c.days === 150 && !c.villageLost && seatDay === 90 && Math.abs(standing - 199) <= 5 && w4kills(c) === 2) return 'moved';
  if (c.days === 150 && !c.villageLost && seatDay === 90 && Math.abs(standing - 199) <= 5 && w4kills(c) === 1) return 'middle';
  if (c.days === 138 && c.villageLost && seatDay === 92 && Math.abs(standing - 100) <= 5 && w4kills(c) === 0) return 'new';
  const mech = A.classify(c.fallen, A.livingAt(c, 30)).mech;
  if ((c.days | 0) <= 55 && c.villageLost && mech === 'sickness-first') return 'endpoint';
  return 'other';
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
  !!VIOLENT_REASK['the arena']);
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
    const m = Object.assign({}, VIOLENT_REASK); delete m['the arena'];
    const violent = arenaFixture.filter(function (f) { return !!m[f.cause]; }).length;
    return violent / arenaFixture.length < 0.6;
  })());

// --- G1: 'Hushpuppy' monster-name cause (new gap, named not bucketed) ---
// The game emits the monster's NAME as the death cause ('Hushpuppy',
// monsterId hushwolf) — neither VIOLENT map keys it. The L0 label must be
// robust to the gap: combat-led under the frozen rule, the corrected rule,
// and even counting the monster-name death as violent.
check('G1: "Hushpuppy" is in NEITHER VIOLENT map (monster-name cause, unmapped — the gap, named)',
  !A.VIOLENT['Hushpuppy'] && !VIOLENT_REASK['Hushpuppy']);
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
    const violent = hushFixture.filter(function (f) { return !!VIOLENT_REASK[f.cause] || f.cause === 'Hushpuppy'; }).length;
    return violent / hushFixture.length >= 0.6;
  })());

// --- G1: classifier on the real committed corpora ---
const p1 = readJson(file('evidence/2026-11-07/xphalf-p1/doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: P1 53007 classifies sickness-first (judged label)',
  p1 ? A.classify(p1.fallen, A.livingAt(p1, 30)).mech === 'sickness-first' : null,
  p1 ? ('got ' + A.classify(p1.fallen, A.livingAt(p1, 30)).mech) : 'no committed xphalf-p1 corpus');
const collapsed = readJson(file('evidence/2026-11-08/perseed-healerctl-collapse-b/doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: collapsed 53007 classifies mixed/other (sickness 3/8 < 40%)',
  collapsed ? A.classify(collapsed.fallen, A.livingAt(collapsed, 30)).mech === 'mixed/other' : null,
  collapsed ? ('got ' + A.classify(collapsed.fallen, A.livingAt(collapsed, 30)).mech) : 'no committed collapsed corpus');
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
function synthHead(days, lost, standing, seatDay, w4) {
  const kills = [];
  for (let i = 0; i < w4; i++) kills.push({ d: 50 + i, mid: 'x', w: 4, by: 'v', via: 'wild', trick: null });
  return { seed: 53007, days: days, gameDays: days, endReason: lost ? 'village-lost' : 'survived', villageLost: !!lost, standing: standing, takeseatStats: { seatDay: seatDay }, waveKillLog: kills, fallen: [], daily: [], instrumentErrors: [] };
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
check('G1: headline predicate — new shape with a seat day of 90 reads other, not new',
  headline(synthHead(138, true, 100, 90, 0)) === 'other');
check('G1: headline predicate — middle shape with 0 w4 kills reads other (not middle, not new)',
  headline(synthHead(150, false, 199, 90, 0)) === 'other');
const sick8 = [
  { day: 16, cause: 'sickness' }, { day: 34, cause: 'sickness' }, { day: 39, cause: 'sickness' },
  { day: 40, cause: 'sickness' }, { day: 41, cause: 'sickness' }, { day: 41, cause: 'the night' },
  { day: 47, cause: 'starvation' }, { day: 50, cause: "a wound that wouldn't close" },
];
check('G1: headline predicate — endpoint shape reads endpoint',
  headline((function () { const c = synthHead(50, true, 75, null, 0); c.fallen = sick8; return c; })()) === 'endpoint');

// --- G1: first-divergence helper on synthetic daily rows ---
function synthDaily(days, pantryAt) {
  const daily = [];
  for (let d = 2; d <= days; d++) {
    daily.push({ day: d, living: 12, diag: { pantryKcal: pantryAt(d), foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  }
  return { seed: 53007, days: days, daily: daily };
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

// --- G1: headline predicate on the committed corpora ---
const endpoint = readJson(file('evidence/2026-11-08/perseed-53007-endpoint-a/doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G1: committed endpoint corpus reads endpoint headline',
  endpoint ? headline(endpoint) === 'endpoint' : null,
  endpoint ? ('got ' + headline(endpoint)) : 'no committed endpoint corpus');
const oldA = readJson(file('evidence/2026-11-08/perseed-53007-a/doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G1: committed 53007-a corpus reads old headline',
  oldA ? headline(oldA) === 'old' : null,
  oldA ? ('got ' + headline(oldA) + ' days=' + oldA.days + ' standing=' + oldA.standing + ' seatDay=' + ((oldA.takeseatStats || {}).seatDay)) : 'no committed 53007-a corpus');
const movedB = readJson(file('evidence/2026-11-08/perseed-53007-bisect-b/doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G1: committed bisect-b corpus reads moved headline',
  movedB ? headline(movedB) === 'moved' : null,
  movedB ? ('got ' + headline(movedB) + ' days=' + movedB.days + ' standing=' + movedB.standing + ' seatDay=' + ((movedB.takeseatStats || {}).seatDay)) : 'no committed bisect-b corpus');
const newF = readJson(file('evidence/2026-11-09/perseed-fightblend-53007-b/doorwalk-53007-a-s53007-fightblend-53007-b-current.json'));
checkSkip('G1: committed fightblend-b corpus reads new headline',
  newF ? headline(newF) === 'new' : null,
  newF ? ('got ' + headline(newF) + ' days=' + newF.days + ' standing=' + newF.standing + ' seatDay=' + ((newF.takeseatStats || {}).seatDay)) : 'no committed fightblend-b corpus');
const midF = readJson(file('evidence/2026-11-09/perseed-fightblend-attrib-b/doorwalk-53007-a-s53007-fightblend-attrib-b-current.json'));
checkSkip('G1: committed fightblend-attrib-b corpus reads middle headline',
  midF ? headline(midF) === 'middle' : null,
  midF ? ('got ' + headline(midF) + ' days=' + midF.days + ' standing=' + midF.standing + ' seatDay=' + ((midF.takeseatStats || {}).seatDay) + ' w4=' + w4kills(midF)) : 'no committed fightblend-attrib-b corpus');
checkSkip('G1: NEW corpus reads combat-led under the corrected rule (10/15 violent with arena)',
  newF ? classifyCorrected(newF.fallen, A.livingAt(newF, 30)).mech === 'combat-led' : null,
  newF ? ('got ' + classifyCorrected(newF.fallen, A.livingAt(newF, 30)).mech) : 'no committed NEW corpus');
checkSkip('G1: NEW corpus reads mixed/other under the frozen rule (arena x3 unmapped — the gap, named)',
  newF ? A.classify(newF.fallen, A.livingAt(newF, 30)).mech === 'mixed/other' : null,
  newF ? ('got ' + A.classify(newF.fallen, A.livingAt(newF, 30)).mech) : 'no committed NEW corpus');
checkSkip('G1: MIDDLE corpus reads mixed/other under BOTH rules (4/10 corrected, 3/10 frozen)',
  midF ? (classifyCorrected(midF.fallen, A.livingAt(midF, 30)).mech === 'mixed/other' &&
    A.classify(midF.fallen, A.livingAt(midF, 30)).mech === 'mixed/other') : null,
  midF ? ('corrected ' + classifyCorrected(midF.fallen, A.livingAt(midF, 30)).mech + ' / frozen ' + A.classify(midF.fallen, A.livingAt(midF, 30)).mech) : 'no committed MIDDLE corpus');
checkSkip('G1: MIDDLE vs NEW first divergence is d17 (helper reproduces the known value)',
  (midF && newF) ? firstDivergence(midF, newF) === 17 : null,
  (midF && newF) ? ('got d' + firstDivergence(midF, newF)) : 'pair not present');

// --- G3: corpus integrity on synthetic corpora (same instrument shape) ---
function goodCorpus() {
  const daily = [];
  for (let d = 2; d <= 10; d++) {
    if (d === 3) continue;
    daily.push({ day: d, living: d < 5 ? 12 : 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  }
  daily.push({ day: 10, living: 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  return { seed: 53007, days: 10, gameDays: 10, endReason: 'village-lost', daily: daily, fallen: [{ day: 5, name: 'X', cause: 'sickness' }], instrumentErrors: [] };
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

// --- G2 + G3 + headline + first divergence on the real new corpora ---
const DIR = 'evidence/2026-11-09/perseed-fightblend-reask-b/';
const cur = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-reask-b-current.json'));
const curUnrec = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-reask-b-current-unrec.json'));
const l1 = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-reask-b-pre-b98f.json'));
const l2 = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-reask-b-b98f.json'));
const l3 = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-reask-b-pre-e3ef.json'));
const l4 = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-reask-b-e3ef.json'));
checkSkip('G3 real: L0 current armed corpus integrity',
  cur ? A.checkCorpus(cur).ok : null,
  cur ? A.checkCorpus(cur).problems.join('; ') : 'no L0 current corpus yet');
checkSkip('G3 real: L0 current unrecorded corpus integrity',
  curUnrec ? A.checkCorpus(curUnrec).ok : null,
  curUnrec ? A.checkCorpus(curUnrec).problems.join('; ') : 'no L0 unrecorded corpus yet');
checkSkip('G2 real: L0 armed == unrecorded (same master 0fcff01ea)',
  (cur && curUnrec) ? A.neutralityCompare(curUnrec, cur).ok : null,
  (cur && curUnrec) ? A.neutralityCompare(curUnrec, cur).diffs.join(', ') : 'pair not present yet');
checkSkip('G1 real: L0 reads OTHER — the fifth shape, neither MIDDLE nor NEW (STOP signal)',
  cur ? headline(cur) === 'other' : null,
  cur ? ('got ' + headline(cur)) : 'no L0 current corpus yet');
checkSkip('G1 real: L0 does NOT read MIDDLE (standing 184 is 15 below 199, outside ±5)',
  cur ? (headline(cur) !== 'middle' && Math.abs((cur.standing | 0) - 199) > 5) : null,
  cur ? ('got standing ' + cur.standing) : 'no L0 current corpus yet');
checkSkip('G1 real: L0 does NOT read NEW (150d survived, standing 184, seatDay 90, 1 w4 kill)',
  cur ? (headline(cur) !== 'new' && cur.days === 150 && !cur.villageLost && (cur.standing | 0) === 184 && ((cur.takeseatStats || {}).seatDay) === 90 && w4kills(cur) === 1) : null,
  cur ? ('got ' + headline(cur) + ' days=' + cur.days + ' standing=' + cur.standing) : 'no L0 current corpus yet');
checkSkip('G1 real: L0 differs from MIDDLE on standing (184 vs 199), w4 faced (6 vs 2), veterans (0 vs 1)',
  (cur && midF) ? ((cur.standing | 0) === 184 && ((cur.finalSeat || {}).detail || {}).w4 === 6 && ((midF.finalSeat || {}).detail || {}).w4 === 2 && (cur.readiness5 || {}).veterans === 0 && (midF.readiness5 || {}).veterans === 1) : null,
  (cur && midF) ? 'fields match MIDDLE' : 'pair not present yet');
checkSkip('G1 real: L0 differs from NEW on every binding field (days, end, standing, seatDay, w4, fallen)',
  (cur && newF) ? (cur.days !== newF.days && cur.villageLost !== newF.villageLost && cur.standing !== newF.standing && ((cur.takeseatStats || {}).seatDay) !== ((newF.takeseatStats || {}).seatDay) && w4kills(cur) !== w4kills(newF) && (cur.fallen || []).length !== (newF.fallen || []).length) : null,
  (cur && newF) ? 'a binding field matches NEW' : 'pair not present yet');
checkSkip('G1 real: L0 mechanism is combat-led under the frozen rule (7/10 violent)',
  cur ? A.classify(cur.fallen, A.livingAt(cur, 30)).mech === 'combat-led' : null,
  cur ? ('got ' + A.classify(cur.fallen, A.livingAt(cur, 30)).mech) : 'no L0 current corpus yet');
checkSkip('G1 real: L0 mechanism is combat-led under the corrected rule too (8/10 violent with arena)',
  cur ? classifyCorrected(cur.fallen, A.livingAt(cur, 30)).mech === 'combat-led' : null,
  cur ? ('got ' + classifyCorrected(cur.fallen, A.livingAt(cur, 30)).mech) : 'no L0 current corpus yet');
checkSkip('G1 real: L0 fallen carries the unmapped monster-name cause "Hushpuppy" (d17, named not bucketed)',
  cur ? (cur.fallen || []).some(function (f) { return f.cause === 'Hushpuppy'; }) : null,
  cur ? 'no Hushpuppy cause in L0 fallen' : 'no L0 current corpus yet');
const divMid = (cur && midF) ? firstDivergence(cur, midF) : null;
checkSkip('G1 real: L0/MIDDLE daily rows diverge at d4 (first divergence day, within the d2–d30 window)',
  (cur && midF) ? (divMid === 4) : null,
  (cur && midF) ? ('first divergence day d' + divMid) : 'pair not present yet');
const divNew = (cur && newF) ? firstDivergence(cur, newF) : null;
checkSkip('G1 real: L0/NEW daily rows diverge at d4 too (L0 is a new road from the first week)',
  (cur && newF) ? (divNew === 4) : null,
  (cur && newF) ? ('first divergence day d' + divNew) : 'pair not present yet');
checkSkip('G1 real: L0 d2 row is identical to MIDDLE d2 (same village at start; divergence from d4)',
  (cur && midF) ? rowsEqualOnDays(cur, midF, [2]) : null,
  (cur && midF) ? 'L0 d2 row differs from MIDDLE' : 'pair not present yet');
checkSkip('G1 real: L0 w4 kills 1 and fallen 10 (same counts as MIDDLE — counts match, village does not)',
  cur ? (w4kills(cur) === 1 && (cur.fallen || []).length === 10) : null,
  cur ? ('w4=' + w4kills(cur) + ' fallen=' + (cur.fallen || []).length) : 'no L0 current corpus yet');
checkSkip('G1 real: L0 missing days are d3 (standard) + d22 (new skipped snapshot, enumerated not failed)',
  cur ? (function () { const s = new Set(cur.daily.map(function (r) { return r.day; })); const m = []; for (let d = 2; d <= 151; d++) if (!s.has(d)) m.push(d); return JSON.stringify(m) === '[3,22]'; })() : null,
  cur ? 'missing-day set differs' : 'no L0 current corpus yet');
// L1–L4 never ran (STOP): their legs SKIP — the attribution did not happen.
checkSkip('G1 real: L1 pre-secret reads NEW (b98ac0730 finger bar)',
  l1 ? headline(l1) === 'new' : null, 'L1 never ran — STOP (endpoint moved again)');
checkSkip('G1 real: L2 secret reads MIDDLE (b98ac0730 finger bar)',
  l2 ? headline(l2) === 'middle' : null, 'L2 never ran — STOP (endpoint moved again)');
checkSkip('G1 real: L3 pre-place reads NEW (e3ef2b612 finger bar)',
  l3 ? headline(l3) === 'new' : null, 'L3 never ran — STOP (endpoint moved again)');
checkSkip('G1 real: L4 place reads NEW (e3ef2b612 exoneration bar)',
  l4 ? headline(l4) === 'new' : null, 'L4 never ran — STOP (endpoint moved again)');

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
