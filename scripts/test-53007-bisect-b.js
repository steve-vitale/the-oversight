// test-53007-bisect-b.js — proof for the post-endpoint bisect on 53007
// (arm sim-53007-bisect-b). G1 det-gate (classifier on the judged/committed
// corpora + broken-classifier/broken-recorder/broken-headline sensitivity),
// G2 recorder neutrality (armed vs unrecorded on the SAME tree for every
// run in this arm, Amendment 1) + endpoint-stability vs the committed
// 53007-a corpus, G3 corpus integrity on every new corpus. Fixture-based;
// no sim, no harness load — runs at any SHA. Real-corpus legs run when the
// committed corpora exist and SKIP otherwise; the evidence run records the
// full count with corpora present. Midpoint legs SKIP when that midpoint
// never ran (the stop rule may never run it).
// Run: node scripts/test-53007-bisect-b.js
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

// headline(corpus): the prereg GO bar, applied mechanically.
// 'master'   = 150d horizon survived + sits d95 + standing >= 500.
// 'endpoint' = dies ~50d (<= 55d), village-lost, sickness-first.
// 'middle'   = anything else — NEITHER headline, never forced.
// 'unknown'  = no corpus.
function headline(c) {
  if (!c) return 'unknown';
  const seatDay = (c.takeseatStats || {}).seatDay;
  if (c.days === 150 && !c.villageLost && (c.standing | 0) >= 500 && seatDay === 95) return 'master';
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

// --- G1: headline predicate on synthetic corpora (det-gate) ---
function synthHead(days, lost, standing, seatDay, fallen) {
  return { seed: 53007, days: days, gameDays: days, endReason: lost ? 'village-lost' : 'survived', villageLost: !!lost, standing: standing, takeseatStats: { seatDay: seatDay }, fallen: fallen || [], daily: [], instrumentErrors: [] };
}
const sick8 = [
  { day: 16, cause: 'sickness' }, { day: 34, cause: 'sickness' }, { day: 39, cause: 'sickness' },
  { day: 40, cause: 'sickness' }, { day: 41, cause: 'sickness' }, { day: 41, cause: 'the night' },
  { day: 47, cause: 'starvation' }, { day: 50, cause: "a wound that wouldn't close" },
];
check('G1: headline predicate — master shape reads master',
  headline(synthHead(150, false, 584, 95, [])) === 'master');
check('G1: headline predicate — endpoint shape reads endpoint',
  headline(synthHead(50, true, 75, null, sick8)) === 'endpoint');
check('G1: headline predicate — 80d death reads middle, not endpoint',
  headline(synthHead(80, true, 200, null, sick8)) === 'middle');
check('G1: headline predicate — 150d without a seat reads middle, not master',
  headline(synthHead(150, false, 584, null, [])) === 'middle');
check('G1: headline predicate — standing 499 reads middle, not master (broken-headline sensitivity)',
  headline(synthHead(150, false, 499, 95, [])) === 'middle');

// --- G1: headline predicate on the committed endpoint + 53007-a corpora ---
const endpoint = readJson(file('evidence/2026-11-08/perseed-53007-endpoint-a/doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G1: committed endpoint corpus reads endpoint headline',
  endpoint ? headline(endpoint) === 'endpoint' : null,
  endpoint ? ('got ' + headline(endpoint)) : 'no committed endpoint corpus');
const oldA = readJson(file('evidence/2026-11-08/perseed-53007-a/doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G1: committed 53007-a corpus reads master headline',
  oldA ? headline(oldA) === 'master' : null,
  oldA ? ('got ' + headline(oldA) + ' days=' + oldA.days + ' standing=' + oldA.standing + ' seatDay=' + ((oldA.takeseatStats || {}).seatDay)) : 'no committed 53007-a corpus');

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

// --- G2 + G3 + headline on the real bisect corpora (read by explicit path;
// the bisect dir holds several seed-53007 files, so loadDir would collide) ---
const BISECT = 'evidence/2026-11-08/perseed-53007-bisect-b/';
const BISECT_UNREC = 'evidence/2026-11-08/perseed-53007-bisect-b-unrec/';
const runs = [
  { label: 'current-master re-verify', armed: BISECT + 'doorwalk-53007-a-s53007-doorwalk-baseline.json', unrec: BISECT_UNREC + 'doorwalk-53007-a-s53007-doorwalk-baseline.json' },
  { label: 'medic-duty midpoint b74dc3007', armed: BISECT + 'doorwalk-53007-a-s53007-medic-b74dc3007.json', unrec: BISECT_UNREC + 'doorwalk-53007-a-s53007-medic-b74dc3007.json' },
  { label: 'double-night midpoint ff252c1ac', armed: BISECT + 'doorwalk-53007-a-s53007-doublenight-ff252c1ac.json', unrec: BISECT_UNREC + 'doorwalk-53007-a-s53007-doublenight-ff252c1ac.json' },
];
runs.forEach(function (r) {
  const a = readJson(file(r.armed));
  const u = readJson(file(r.unrec));
  checkSkip('G3 real: ' + r.label + ' armed corpus integrity',
    a ? A.checkCorpus(a).ok : null,
    a ? A.checkCorpus(a).problems.join('; ') : 'no armed corpus yet');
  checkSkip('G3 real: ' + r.label + ' unrecorded corpus integrity',
    u ? A.checkCorpus(u).ok : null,
    u ? A.checkCorpus(u).problems.join('; ') : 'no unrecorded corpus yet');
  checkSkip('G2 real: ' + r.label + ' armed == unrecorded (same tree)',
    (a && u) ? A.neutralityCompare(u, a).ok : null,
    (a && u) ? A.neutralityCompare(u, a).diffs.join(', ') : 'pair not present yet');
  checkSkip('G1 real: ' + r.label + ' headline is master or endpoint (never middle)',
    a ? (headline(a) === 'master' || headline(a) === 'endpoint') : null,
    a ? ('got ' + headline(a) + ' days=' + a.days + ' standing=' + a.standing + ' seatDay=' + ((a.takeseatStats || {}).seatDay) + ' mech=' + A.classify(a.fallen, A.livingAt(a, 30)).mech) : 'no armed corpus yet');
});
// Endpoint-stability: the current-master re-verification must match the
// committed 53007-a corpus trajectory-for-trajectory. A FAIL here is the
// endpoint-moved signal (GO bar 1), not a proof defect — the evidence file
// reports it as such.
const cur = readJson(file(BISECT + 'doorwalk-53007-a-s53007-doorwalk-baseline.json'));
checkSkip('G2 endpoint-stability: current-master re-verify matches committed 53007-a corpus (else endpoint moved)',
  (cur && oldA) ? A.neutralityCompare(A.stripDiag(oldA), cur).ok : null,
  (cur && oldA) ? A.neutralityCompare(A.stripDiag(oldA), cur).diffs.join(', ') : 'pair not present yet');

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
