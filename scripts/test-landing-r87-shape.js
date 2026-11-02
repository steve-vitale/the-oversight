// Proof test for the landing r87 shape (r85 RESCUE contract + R86 opportunity contract) (driver-only, zero src/js).
// Validates the OUTPUT CONTRACT of scripts/journey-landing-r86-20261101.js:
// every census JSON in a corpus dir must carry the six R84 fields as arrays,
// every arrival record must carry all required keys INCLUDING the additive
// R85 rescue fields (rescueSteps, nodeFinal, distFinal, atHavenFinal,
// insideHavenFinal), every skip must have a matching arrival record (and
// vice versa), every blocked first hop must show an escalation attempt
// (walkHome/clear in rescueSteps), and every series snap must carry loc +
// scholarHydration (the haven-hydration precondition).
// Self-check first: the checker is exercised on synthetic good + bad records
// so a vacuous pass (checker never flags anything) is impossible.
// Usage: node scripts/test-landing-r85-rescue-shape.js [census-dir]
// Exit 0 = all checks pass; exit 1 = any failure (with FAIL lines printed).
const fs = require('fs');
const path = require('path');

const ARRIVAL_KEYS = ['day', 'home', 'nodeBefore', 'distBefore', 'retKind', 'ret',
  'nodeAfter', 'distAfter', 'atHavenAfter', 'insideHavenAfter',
  'rescueSteps', 'nodeFinal', 'distFinal', 'atHavenFinal', 'insideHavenFinal', 'eatOnArrival'];
const NEXTTOP_KEYS = ['skipDay', 'day', 'node', 'distToHaven', 'atHaven', 'loc', 'hydration'];
const FIELDS = ['outingGuardWaterSkips', 'outingGuardWaterArrivals',
  'outingGuardWaterArrivalNextTop', 'outingGuardSkips', 'outingGuardArrivals',
  'outingGuardArrivalNextTop', 'outingGuardWaterOpportunities', 'armorCraftDetail'];

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
  const checkRescue = (recs, kind) => {
    for (const r of recs) {
      if (!Array.isArray(r.rescueSteps)) errs.push(`${label}: ${kind} record missing rescueSteps array`);
      else if (typeof r.retKind === 'string' && r.retKind.indexOf('blocked:') === 0 && !r.atHavenAfter) {
        if (!r.rescueSteps.some(s => s.indexOf('walkHome') === 0 || s.indexOf('clear:') === 0)) errs.push(`${label}: ${kind} blocked first hop d${r.day} shows no escalation attempt`);
      }
      if (r.nodeFinal && (typeof r.nodeFinal.x !== 'number' || typeof r.nodeFinal.y !== 'number')) errs.push(`${label}: ${kind} nodeFinal not a point`);
    }
  };
  checkRescue(d.outingGuardWaterArrivals, 'water-arrival');
  checkRescue(d.outingGuardArrivals, 'kcal-arrival');
  for (const o of (d.outingGuardWaterOpportunities || [])) {
    if (typeof o.day !== 'number' || typeof o.hydration !== 'number' || o.loc !== 'wild') errs.push(`${label}: opportunity record malformed: ${JSON.stringify(o).slice(0, 160)}`);
  }
  for (const s of (d.series || [])) {
    if (!('loc' in s) || !('scholarHydration' in s)) { errs.push(`${label}: series snap missing loc/scholarHydration`); break; }
    if (!('scholarInsideHaven' in s) || !('scholarStoresAccess' in s) || !('scholarWaterBottles' in s)) { errs.push(`${label}: series snap missing R87 MAEVE fields`); break; }
  }
  for (const c of (d.armorCraftDetail || [])) {
    if (typeof c.day !== 'number' || typeof c.ok !== 'boolean') errs.push(`${label}: armorCraftDetail malformed: ${JSON.stringify(c).slice(0, 120)}`);
  }
  for (const a of [...(d.outingGuardWaterArrivals || []), ...(d.outingGuardArrivals || [])]) {
    if (a.atHavenFinal && (!a.eatOnArrival || typeof a.eatOnArrival !== 'object')) errs.push(`${label}: arrived arrival d${a.day} missing eatOnArrival object`);
    else if (a.atHavenFinal && a.eatOnArrival && !('eatTriggered' in a.eatOnArrival) && !a.eatOnArrival.skipped) errs.push(`${label}: eatOnArrival d${a.day} carries neither trigger flags nor skipped reason`);
  }
  return errs;
}

// --- self-check on synthetic records (checker must catch defects) ---
const goodArrival = { day: 10, home: { x: 4, y: 4 }, nodeBefore: { x: 1, y: 1 }, distBefore: 6, retKind: 'moved', ret: null, nodeAfter: { x: 2, y: 1 }, distAfter: 5, atHavenAfter: false, insideHavenAfter: false, rescueSteps: ['first-travelTo:not-home', 'walkHome:reached:steps:3'], nodeFinal: { x: 4, y: 4 }, distFinal: 0, atHavenFinal: true, insideHavenFinal: true, eatOnArrival: { branch: 'water', day: 10, eatTriggered: true, kcalBefore: 100, kcalAfter: 1500, ate: true } };
const goodNextTop = { skipDay: 10, day: 11, node: { x: 4, y: 4 }, distToHaven: 0, atHaven: true, loc: 'haven', hydration: 60 };
const good = { outingGuardWaterOpportunities: [{ day: 10, kcal: 1500, cap: 2400, hydration: 20, loc: 'wild', cleanWater: 5 }], outingGuardWaterSkips: [{ day: 10 }], outingGuardWaterArrivals: [goodArrival], outingGuardWaterArrivalNextTop: [goodNextTop], outingGuardSkips: [], outingGuardArrivals: [], outingGuardArrivalNextTop: [], series: [{ day: 1, loc: 'haven', scholarHydration: 80, scholarInsideHaven: true, scholarStoresAccess: 'inside', scholarWaterBottles: 1 }], armorCraftDetail: [{ day: 5, vid: 'v1', item: 'bark', ok: true }] };
if (checkCensus(good, 'synthetic-good').length !== 0) fail('self-check: good synthetic census flagged');
else ok('self-check: good synthetic census passes');
const badOpp = Object.assign({}, good, { outingGuardWaterOpportunities: [{ day: 10, kcal: 1500, cap: 2400, loc: 'wild', cleanWater: 5 }] });
if (checkCensus(badOpp, 'synthetic-bad-opp').length === 0) fail('self-check: opportunity missing hydration NOT flagged');
else ok('self-check: opportunity missing hydration flagged');
const badArrival = Object.assign({}, goodArrival); delete badArrival.distAfter;
const bad = Object.assign({}, good, { outingGuardWaterArrivals: [badArrival] });
if (checkCensus(bad, 'synthetic-bad').length === 0) fail('self-check: bad synthetic census (missing distAfter) NOT flagged');
else ok('self-check: bad synthetic census flagged');
const badSkip = Object.assign({}, good, { outingGuardWaterSkips: [{ day: 10 }, { day: 11 }] });
if (checkCensus(badSkip, 'synthetic-bad-skip').length === 0) fail('self-check: skip without arrival NOT flagged');
else ok('self-check: skip without arrival flagged');
const badRescueArrival = Object.assign({}, goodArrival, { retKind: 'blocked:fallen_tree', rescueSteps: ['first-travelTo:not-home'] });
const badRescue = Object.assign({}, good, { outingGuardWaterArrivals: [badRescueArrival] });
if (checkCensus(badRescue, 'synthetic-bad-rescue').length === 0) fail('self-check: blocked first hop without escalation NOT flagged');
else ok('self-check: blocked first hop without escalation flagged');
const badFinal = Object.assign({}, goodArrival); delete badFinal.atHavenFinal;
const badFinalCensus = Object.assign({}, good, { outingGuardWaterArrivals: [badFinal] });
if (checkCensus(badFinalCensus, 'synthetic-bad-final').length === 0) fail('self-check: arrival missing atHavenFinal NOT flagged');
else ok('self-check: arrival missing atHavenFinal flagged');

// --- real corpora ---
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-02/landing-r87');
if (!fs.existsSync(DIR)) { console.log('NO DIR: ' + DIR + ' (pilot/panel not run yet — self-check above is the result)'); process.exit(failures ? 1 : 0); }
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const errs = checkCensus(d, f);
  if (errs.length) { for (const e of errs) fail(e); }
  else ok(`${f}: shape OK (water arrivals=${d.outingGuardWaterArrivals.length}, kcal arrivals=${d.outingGuardArrivals.length})`);
}
console.log(failures === 0 ? 'R87-SHAPE: PASS' : `R87-SHAPE: FAIL (${failures} failures)`);
process.exit(failures ? 1 : 0);
