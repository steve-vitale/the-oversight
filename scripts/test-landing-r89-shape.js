// Proof test for the landing r89 shape (r88 contracts + R89 WAITDIAG/SIDESTEP contracts) (driver-only, zero src/js).
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
const NEXTTOP_KEYS = ['skipDay', 'scholarIdAtSkip', 'scholarIdAtTop', 'day', 'node', 'distToHaven', 'atHaven', 'loc', 'hydration'];
const FIELDS = ['outingGuardWaterSkips', 'outingGuardWaterArrivals',
  'outingGuardWaterArrivalNextTop', 'outingGuardSkips', 'outingGuardArrivals',
  'outingGuardArrivalNextTop', 'outingGuardWaterOpportunities', 'armorCraftDetail', 'doorstepSteps'];

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
    if (!('scholarInsideHaven' in s) || !('scholarStoresAccess' in s) || !('scholarWaterBottles' in s)) { errs.push(`${label}: series snap missing R88 MAEVE fields`); break; }
  }
  for (const c of (d.armorCraftDetail || [])) {
    if (typeof c.day !== 'number' || typeof c.ok !== 'boolean') errs.push(`${label}: armorCraftDetail malformed: ${JSON.stringify(c).slice(0, 120)}`);
  }
  for (const r of (d.doorstepSteps || [])) {
    if (typeof r.day !== 'number') errs.push(`${label}: doorstep record missing day`);
    else if (r.triggered && (!r.eatRec || typeof r.eatRec !== 'object')) errs.push(`${label}: triggered doorstep d${r.day} missing eatRec object`);
    else if (r.triggered && r.eatRec && !('eatTriggered' in r.eatRec) && !r.eatRec.skipped && !r.eatRec.error) errs.push(`${label}: triggered doorstep d${r.day} eatRec carries neither trigger flags nor skipped/error`);
    else if (!r.triggered && !r.skipped && !r.error) errs.push(`${label}: untriggered doorstep d${r.day} carries neither skipped reason nor error`);
  }
  for (const a of [...(d.outingGuardWaterArrivals || []), ...(d.outingGuardArrivals || [])]) {
    if (a.atHavenFinal && (!a.eatOnArrival || typeof a.eatOnArrival !== 'object')) errs.push(`${label}: arrived arrival d${a.day} missing eatOnArrival object`);
    else if (a.atHavenFinal && a.eatOnArrival && !('eatTriggered' in a.eatOnArrival) && !a.eatOnArrival.skipped) errs.push(`${label}: eatOnArrival d${a.day} carries neither trigger flags nor skipped reason`);
  }
  // R89 WAITDIAG + SIDESTEP: every dawn opp carries waitDiag; every
  // approach record carries a sidesteps array (possibly empty).
  if (d.r41Summary && !Array.isArray(d.r41Summary.outingOpps)) errs.push(`${label}: r41Summary.outingOpps missing or not an array`);
  for (const o of ((d.r41Summary || {}).outingOpps || [])) {
    if (typeof o.waitDiag !== 'string' || !o.waitDiag) errs.push(`${label}: dawn opp d${o.day} missing waitDiag: ${JSON.stringify(o).slice(0, 160)}`);
    if (o.approach && !Array.isArray(o.approach.sidesteps)) errs.push(`${label}: dawn opp d${o.day} approach missing sidesteps array`);
    if (o.approach && Array.isArray(o.approach.sidesteps)) for (const s of o.approach.sidesteps) {
      if (typeof s.ok !== 'boolean') errs.push(`${label}: dawn opp d${o.day} sidestep missing ok boolean`);
    }
  }
  return errs;
}

// --- self-check on synthetic records (checker must catch defects) ---
const goodArrival = { day: 10, home: { x: 4, y: 4 }, nodeBefore: { x: 1, y: 1 }, distBefore: 6, retKind: 'moved', ret: null, nodeAfter: { x: 2, y: 1 }, distAfter: 5, atHavenAfter: false, insideHavenAfter: false, rescueSteps: ['first-travelTo:not-home', 'walkHome:reached:steps:3'], nodeFinal: { x: 4, y: 4 }, distFinal: 0, atHavenFinal: true, insideHavenFinal: true, eatOnArrival: { branch: 'water', day: 10, eatTriggered: true, kcalBefore: 100, kcalAfter: 1500, ate: true } };
const goodNextTop = { skipDay: 10, scholarIdAtSkip: 'v1', scholarIdAtTop: 'v1', day: 11, node: { x: 4, y: 4 }, distToHaven: 0, atHaven: true, loc: 'haven', hydration: 60 };
const good = { doorstepSteps: [{ day: 3, atHaven: true, kcal: 100, hyd: 80, insideBefore: false, needEat: true, needDrink: false, triggered: true, branch: 'kcal', eatRec: { branch: 'kcal', eatTriggered: true, insideBefore: false, insideAfter: true, storesBefore: 'none', storesAfter: 'inside', kcalBefore: 100, kcalAfter: 1500, ate: true } }], outingGuardWaterOpportunities: [{ day: 10, kcal: 1500, cap: 2400, hydration: 20, loc: 'wild', cleanWater: 5 }], outingGuardWaterSkips: [{ day: 10 }], outingGuardWaterArrivals: [goodArrival], outingGuardWaterArrivalNextTop: [goodNextTop], outingGuardSkips: [], outingGuardArrivals: [], outingGuardArrivalNextTop: [], series: [{ day: 1, loc: 'haven', scholarHydration: 80, scholarInsideHaven: true, scholarStoresAccess: 'inside', scholarWaterBottles: 1 }], armorCraftDetail: [{ day: 5, vid: 'v1', item: 'bark', ok: true }], r41Summary: { outingOpps: [{ day: 5, waiting: true, waitDiag: 'waiting', approach: { crossings: 1, steps: 1, sidesteps: [{ diag: [3, 6], tried: [{ via: 'x', to: [3, 7], ok: true }], ok: true, via: 'x' }] } }, { day: 6, waiting: false, waitDiag: 'node-not-home' }] } };
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
const badDoor = Object.assign({}, good, { doorstepSteps: [{ day: 3, atHaven: true, triggered: true, branch: 'kcal' }] });
if (checkCensus(badDoor, 'synthetic-bad-doorstep').length === 0) fail('self-check: triggered doorstep without eatRec NOT flagged');
else ok('self-check: triggered doorstep without eatRec flagged');
const badFinal = Object.assign({}, goodArrival); delete badFinal.atHavenFinal;
const badFinalCensus = Object.assign({}, good, { outingGuardWaterArrivals: [badFinal] });
if (checkCensus(badFinalCensus, 'synthetic-bad-final').length === 0) fail('self-check: arrival missing atHavenFinal NOT flagged');
else ok('self-check: arrival missing atHavenFinal flagged');
const badWait = Object.assign({}, good, { r41Summary: { outingOpps: [{ day: 5, waiting: false }] } });
if (checkCensus(badWait, 'synthetic-bad-waitdiag').length === 0) fail('self-check: dawn opp missing waitDiag NOT flagged');
else ok('self-check: dawn opp missing waitDiag flagged');
const badSide = Object.assign({}, good, { r41Summary: { outingOpps: [{ day: 5, waiting: true, waitDiag: 'waiting', approach: { crossings: 1, steps: 0 } }] } });
if (checkCensus(badSide, 'synthetic-bad-sidestep').length === 0) fail('self-check: approach missing sidesteps NOT flagged');
else ok('self-check: approach missing sidesteps flagged');

// --- real corpora ---
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-02/landing-r89');
if (!fs.existsSync(DIR)) { console.log('NO DIR: ' + DIR + ' (pilot/panel not run yet — self-check above is the result)'); process.exit(failures ? 1 : 0); }
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const errs = checkCensus(d, f);
  if (errs.length) { for (const e of errs) fail(e); }
  else ok(`${f}: shape OK (water arrivals=${d.outingGuardWaterArrivals.length}, kcal arrivals=${d.outingGuardArrivals.length})`);
}
console.log(failures === 0 ? 'R89-SHAPE: PASS' : `R89-SHAPE: FAIL (${failures} failures)`);
process.exit(failures ? 1 : 0);
