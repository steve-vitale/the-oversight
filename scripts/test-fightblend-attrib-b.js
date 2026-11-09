// test-fightblend-attrib-b.js — proof for the fightblend attribution re-ask on 53007
// (arm sim-fightblend-attrib-b). G1 det-gate (classifier on the judged/committed
// corpora + broken-classifier/broken-recorder/broken-headline sensitivity),
// G2 recorder neutrality (armed vs unrecorded on the SAME tree), G3 corpus
// integrity on every new corpus. Fixture-based; no sim, no harness load —
// runs at any SHA. Real-corpus legs run when the committed corpora exist and
// SKIP otherwise. L1/L2 legs SKIP: the stop rule fired (endpoint moved again),
// so the pre/fix legs never ran.
// Run: node scripts/test-fightblend-attrib-b.js
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
function w4faced(c) {
  const wf = c.wavesFaced || {};
  return Object.keys(wf).filter(function (k) { return (wf[k] | 0) === 4; }).length;
}

// headline(corpus): the prereg decision tree, applied mechanically.
// 'old'    = 150d survived + sits d95 + standing 584 ± 5 + 5 w4 kills.
// 'moved'  = 150d survived + sits d90 + standing 199 ± 5 + 2 w4 kills.
// 'new'    = 138d village-lost + sits d92 + standing 100 ± 5 + 0 w4 kills.
// 'endpoint' = dies ~50d (<= 55d), village-lost, sickness-first.
// 'middle' = anything else — NEITHER headline, never forced.
// 'unknown' = no corpus.
function headline(c) {
  if (!c) return 'unknown';
  const seatDay = (c.takeseatStats || {}).seatDay;
  const standing = c.standing | 0;
  if (c.days === 150 && !c.villageLost && seatDay === 95 && Math.abs(standing - 584) <= 5 && w4kills(c) === 5) return 'old';
  if (c.days === 150 && !c.villageLost && seatDay === 90 && Math.abs(standing - 199) <= 5 && w4kills(c) === 2) return 'moved';
  if (c.days === 138 && c.villageLost && seatDay === 92 && Math.abs(standing - 100) <= 5 && w4kills(c) === 0) return 'new';
  const mech = A.classify(c.fallen, A.livingAt(c, 30)).mech;
  if ((c.days | 0) <= 55 && c.villageLost && mech === 'sickness-first') return 'endpoint';
  return 'middle';
}

// --- G1: classifier on the real committed corpora ---
const p1 = readJson(file('evidence/2026-11-07/xphalf-p1/doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: P1 53007 classifies sickness-first (judged label)',
  p1 ? A.classify(p1.fallen, A.livingAt(p1, 30)).mech === 'sickness-first' : null,
  p1 ? ('got ' + A.classify(p1.fallen, A.livingAt(p1, 30)).mech) : 'no committed xphalf-p1 corpus');
const healed = readJson(file('evidence/2026-11-08/perseed-healerctl-healed-b/doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: healed 53007 classifies sickness-first',
  healed ? A.classify(healed.fallen, A.livingAt(healed, 30)).mech === 'sickness-first' : null,
  healed ? ('got ' + A.classify(healed.fallen, A.livingAt(healed, 30)).mech) : 'no committed healed corpus');
const collapsed = readJson(file('evidence/2026-11-08/perseed-healerctl-collapse-b/doorwalk-b-s53007-doorwalk-baseline.json'));
checkSkip('G1: collapsed 53007 classifies mixed/other (sickness 3/8 < 40%)',
  collapsed ? A.classify(collapsed.fallen, A.livingAt(collapsed, 30)).mech === 'mixed/other' : null,
  collapsed ? ('got ' + A.classify(collapsed.fallen, A.livingAt(collapsed, 30)).mech) : 'no committed collapsed corpus');
function brokenClassify(fallen) {
  const sick = (fallen || []).filter(function (f) { return f.cause === 'sickness'; }).length;
  return (fallen && fallen.length && fallen[0].cause === 'sickness' && sick / fallen.length >= 0.9) ? 'sickness-first' : 'mixed/other';
}
check('G1: broken classifier (90% sickness bar) does NOT reproduce the judged label',
  p1 ? brokenClassify(p1.fallen) !== 'sickness-first' : false,
  p1 ? 'broken rule returned ' + brokenClassify(p1.fallen) : 'no P1 corpus');
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
check('G1: "the arena" is NOT in the VIOLENT map (classifier gap, named not fixed)',
  !A.VIOLENT['the arena'] && A.classify(
    [{ day: 31, cause: 'the arena' }, { day: 40, cause: 'monster' }, { day: 45, cause: 'sickness' }, { day: 50, cause: 'sickness' }],
    11).mech === 'mixed/other');

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
check('G1: headline predicate — new shape reads new',
  headline(synthHead(138, true, 100, 92, 0)) === 'new');
check('G1: headline predicate — L0 middle shape (150d, 199, d90, 1 w4 kill) reads middle, not moved',
  headline(synthHead(150, false, 199, 90, 1)) === 'middle');
check('G1: headline predicate — standing 193 reads middle, not moved (tolerance is ±5, 194 is inside it)',
  headline(synthHead(150, false, 193, 90, 2)) === 'middle');
check('G1: headline predicate — new shape with a seat day of 90 reads middle, not new',
  headline(synthHead(138, true, 100, 90, 0)) === 'middle');
const sick8 = [
  { day: 16, cause: 'sickness' }, { day: 34, cause: 'sickness' }, { day: 39, cause: 'sickness' },
  { day: 40, cause: 'sickness' }, { day: 41, cause: 'sickness' }, { day: 41, cause: 'the night' },
  { day: 47, cause: 'starvation' }, { day: 50, cause: "a wound that wouldn't close" },
];
check('G1: headline predicate — endpoint shape reads endpoint',
  headline((function () { const c = synthHead(50, true, 75, null, 0); c.fallen = sick8; return c; })()) === 'endpoint');

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
const newB = readJson(file('evidence/2026-11-09/perseed-fightblend-53007-b/doorwalk-53007-a-s53007-fightblend-53007-b-current.json'));
checkSkip('G1: committed 0630Z corpus reads new headline',
  newB ? headline(newB) === 'new' : null,
  newB ? ('got ' + headline(newB) + ' days=' + newB.days + ' standing=' + newB.standing + ' seatDay=' + ((newB.takeseatStats || {}).seatDay)) : 'no committed 0630Z corpus');

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

// --- G2 + G3 + headline on the real new corpora ---
const DIR = 'evidence/2026-11-09/perseed-fightblend-attrib-b/';
const cur = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-attrib-b-current.json'));
const curUnrec = readJson(file(DIR + 'doorwalk-53007-a-s53007-fightblend-attrib-b-current-unrec.json'));
checkSkip('G3 real: L0 current armed corpus integrity',
  cur ? A.checkCorpus(cur).ok : null,
  cur ? A.checkCorpus(cur).problems.join('; ') : 'no L0 armed corpus yet');
checkSkip('G3 real: L0 current unrecorded corpus integrity',
  curUnrec ? A.checkCorpus(curUnrec).ok : null,
  curUnrec ? A.checkCorpus(curUnrec).problems.join('; ') : 'no L0 unrecorded corpus yet');
checkSkip('G2 real: L0 armed == unrecorded (same tree)',
  (cur && curUnrec) ? A.neutralityCompare(curUnrec, cur).ok : null,
  (cur && curUnrec) ? A.neutralityCompare(curUnrec, cur).diffs.join(', ') : 'pair not present yet');
checkSkip('G1 real: L0 armed reads MIDDLE, not new (endpoint moved again)',
  cur ? headline(cur) === 'middle' : null,
  cur ? ('got ' + headline(cur) + ' days=' + cur.days + ' end=' + cur.endReason + ' standing=' + cur.standing + ' seatDay=' + ((cur.takeseatStats || {}).seatDay) + ' w4=' + w4kills(cur)) : 'no L0 armed corpus yet');
checkSkip('G1 real: L0 unrecorded reads MIDDLE too',
  curUnrec ? headline(curUnrec) === 'middle' : null,
  curUnrec ? ('got ' + headline(curUnrec)) : 'no L0 unrecorded corpus yet');
// The endpoint-moved-again signal: L0 is NEITHER new NOR moved. The middle
// shape shares moved's days/end/standing/seatDay but differs on w4 kills,
// fallen count, mechanism, and w4 faced — asserted as passing legs.
checkSkip('G1 real: L0 differs from NEW on days, end, standing, seatDay, and w4 kills',
  cur ? (headline(cur) !== 'new' && cur.days === 150 && !cur.villageLost && (cur.standing | 0) === 199 && ((cur.takeseatStats || {}).seatDay) === 90 && w4kills(cur) === 1) : null,
  cur ? ('got ' + headline(cur)) : 'no L0 armed corpus yet');
checkSkip('G1 real: L0 differs from MOVED on w4 kills (1, not 2), fallen (10, not 9), and w4 faced (2 types, not 6)',
  cur ? (w4kills(cur) === 1 && (cur.fallen || []).length === 10 && w4faced(cur) === 2) : null,
  cur ? ('w4=' + w4kills(cur) + ' fallen=' + (cur.fallen || []).length + ' w4faced=' + w4faced(cur)) : 'no L0 armed corpus yet');
checkSkip('G1 real: L0 mechanism is mixed/other by the rule (violent 4/10 < 60%)',
  cur ? A.classify(cur.fallen, A.livingAt(cur, 30)).mech === 'mixed/other' : null,
  cur ? ('got ' + A.classify(cur.fallen, A.livingAt(cur, 30)).mech) : 'no L0 armed corpus yet');

// --- L1/L2 legs: SKIP — the stop rule fired, the pre/fix legs never ran ---
checkSkip('G3 real: L1 pre corpus integrity', null, 'stop rule fired — pre leg never ran');
checkSkip('G1 real: L1 pre headline is old or moved', null, 'stop rule fired — pre leg never ran');
checkSkip('G3 real: L2 fix corpus integrity', null, 'stop rule fired — fix leg never ran');
checkSkip('G1 real: L2 fix headline is old or moved', null, 'stop rule fired — fix leg never ran');

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
