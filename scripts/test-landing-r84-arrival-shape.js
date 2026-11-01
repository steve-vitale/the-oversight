// Proof test for the landing r84 ARRIVAL instrument (driver-only, zero src/js).
// Validates the OUTPUT CONTRACT of scripts/journey-landing-r84-20261101.js:
// every census JSON in a corpus dir must carry the six R84 fields as arrays,
// every arrival record must carry all required keys, every skip must have a
// matching arrival record (and vice versa), and every series snap must carry
// loc + scholarHydration (the haven-hydration precondition).
// Self-check first: the checker is exercised on synthetic good + bad records
// so a vacuous pass (checker never flags anything) is impossible.
// Usage: node scripts/test-landing-r84-arrival-shape.js [census-dir]
// Exit 0 = all checks pass; exit 1 = any failure (with FAIL lines printed).
const fs = require('fs');
const path = require('path');

const ARRIVAL_KEYS = ['day', 'home', 'nodeBefore', 'distBefore', 'retKind', 'ret',
  'nodeAfter', 'distAfter', 'atHavenAfter', 'insideHavenAfter'];
const NEXTTOP_KEYS = ['skipDay', 'day', 'node', 'distToHaven', 'atHaven', 'loc', 'hydration'];
const FIELDS = ['outingGuardWaterSkips', 'outingGuardWaterArrivals',
  'outingGuardWaterArrivalNextTop', 'outingGuardSkips', 'outingGuardArrivals',
  'outingGuardArrivalNextTop'];

let failures = 0;
const fail = (msg) => { failures++; console.log('FAIL: ' + msg); };
const ok = (msg) => { console.log('ok: ' + msg); };

function checkCensus(d, label) {
  const errs = [];
  for (const f of FIELDS) {
    if (!Array.isArray(d[f])) errs.push(`${label}: field ${f} missing or not an array`);
  }
  if (errs.length) return errs;
  const checkRecs = (recs, keys, kind) => {
    for (const r of recs) {
      for (const k of keys) {
        if (!(k in r)) errs.push(`${label}: ${kind} record missing key ${k}: ${JSON.stringify(r).slice(0, 160)}`);
      }
      if (r.nodeBefore && (typeof r.nodeBefore.x !== 'number' || typeof r.nodeBefore.y !== 'number')) errs.push(`${label}: ${kind} nodeBefore not a point`);
      if (r.nodeAfter && (typeof r.nodeAfter.x !== 'number' || typeof r.nodeAfter.y !== 'number')) errs.push(`${label}: ${kind} nodeAfter not a point`);
    }
  };
  checkRecs(d.outingGuardWaterArrivals, ARRIVAL_KEYS, 'water-arrival');
  checkRecs(d.outingGuardArrivals, ARRIVAL_KEYS, 'kcal-arrival');
  checkRecs(d.outingGuardWaterArrivalNextTop, NEXTTOP_KEYS, 'water-nexttop');
  checkRecs(d.outingGuardArrivalNextTop, NEXTTOP_KEYS, 'kcal-nexttop');
  for (const s of d.outingGuardWaterSkips) {
    if (!d.outingGuardWaterArrivals.some(a => a.day === s.day)) errs.push(`${label}: water skip d${s.day} has no arrival record`);
  }
  for (const a of d.outingGuardWaterArrivals) {
    if (!d.outingGuardWaterSkips.some(s => s.day === a.day)) errs.push(`${label}: water arrival d${a.day} has no skip record`);
  }
  for (const s of d.outingGuardSkips) {
    if (!d.outingGuardArrivals.some(a => a.day === s.day)) errs.push(`${label}: kcal skip d${s.day} has no arrival record`);
  }
  for (const a of d.outingGuardArrivals) {
    if (!d.outingGuardSkips.some(s => s.day === a.day)) errs.push(`${label}: kcal arrival d${a.day} has no skip record`);
  }
  for (const s of (d.series || [])) {
    if (!('loc' in s) || !('scholarHydration' in s)) { errs.push(`${label}: series snap missing loc/scholarHydration`); break; }
  }
  return errs;
}

// --- self-check on synthetic records (checker must catch defects) ---
const goodArrival = { day: 10, home: { x: 4, y: 4 }, nodeBefore: { x: 1, y: 1 }, distBefore: 6, retKind: 'moved', ret: null, nodeAfter: { x: 2, y: 1 }, distAfter: 5, atHavenAfter: false, insideHavenAfter: false };
const goodNextTop = { skipDay: 10, day: 11, node: { x: 4, y: 4 }, distToHaven: 0, atHaven: true, loc: 'haven', hydration: 60 };
const good = { outingGuardWaterSkips: [{ day: 10 }], outingGuardWaterArrivals: [goodArrival], outingGuardWaterArrivalNextTop: [goodNextTop], outingGuardSkips: [], outingGuardArrivals: [], outingGuardArrivalNextTop: [], series: [{ day: 1, loc: 'haven', scholarHydration: 80 }] };
if (checkCensus(good, 'synthetic-good').length !== 0) fail('self-check: good synthetic census flagged');
else ok('self-check: good synthetic census passes');
const badArrival = Object.assign({}, goodArrival); delete badArrival.distAfter;
const bad = Object.assign({}, good, { outingGuardWaterArrivals: [badArrival] });
if (checkCensus(bad, 'synthetic-bad').length === 0) fail('self-check: bad synthetic census (missing distAfter) NOT flagged');
else ok('self-check: bad synthetic census flagged');
const badSkip = Object.assign({}, good, { outingGuardWaterSkips: [{ day: 10 }, { day: 11 }] });
if (checkCensus(badSkip, 'synthetic-bad-skip').length === 0) fail('self-check: skip without arrival NOT flagged');
else ok('self-check: skip without arrival flagged');

// --- real corpora ---
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-01/landing-r84');
if (!fs.existsSync(DIR)) { console.log('NO DIR: ' + DIR + ' (pilot/panel not run yet — self-check above is the result)'); process.exit(failures ? 1 : 0); }
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const errs = checkCensus(d, f);
  if (errs.length) { for (const e of errs) fail(e); }
  else ok(`${f}: shape OK (water arrivals=${d.outingGuardWaterArrivals.length}, kcal arrivals=${d.outingGuardArrivals.length})`);
}
console.log(failures === 0 ? 'ARRIVAL-SHAPE: PASS' : `ARRIVAL-SHAPE: FAIL (${failures} failures)`);
process.exit(failures ? 1 : 0);
