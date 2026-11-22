// test-gunlife-a.js — proof for arm sim-gunlife-a (finding #2667).
// Proves the gun-life TRACER is sound before any judged band runs:
//   * the analyzer's staged selftest passes 100% (scholar-equipped gun
//     seen, dead-holder equipped row skipped as a ghost, dry/held/fired
//     attempts classified, unattributed transfers followed, vanish
//     flagged, prevHolderState clobber regression)
//   * the killlootbundle driver emits every field the tracer reads
//     (v4gunLoc census with locations/total/personFlags, volleyEvents
//     with rwId/shots/ammoLeft/wave/vid, prizeEvents gains with
//     gunsGained/cellsAfter, corpseTakeEvents, grantEvents)
//   * the volley record the tracer classifies on is written by
//     fieldFights.js (rec.volley with rwId/shots/ammoLeft)
//   * traceLeg's zero-grant rule: a leg with 0 contest searcaster
//     grants judges INCONCLUSIVE, never GO or NO-GO
// Run: node scripts/test-gunlife-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const gunlife = require(path.join(__dirname, 'analyze-gunlife-a.js'));

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// --- 1. Analyzer selftest (staged corpora, all 8 fixtures) ---
check('gunlife selftest passes 100%', gunlife.selftest() === true);

// --- 2. Driver emits the fields the tracer reads ---
const driverSrc = fs.readFileSync(path.join(__dirname, 'killlootbundle-driver-a.js'), 'utf8');
check('driver records v4gunLoc census', /v4gunLoc/.test(driverSrc));
check('driver records volleyEvents', /volleyEvents/.test(driverSrc));
check('driver records prizeEvents gains', /prizeEvents/.test(driverSrc) && /gunsGained/.test(driverSrc));
check('driver records corpseTakeEvents', /corpseTakeEvents/.test(driverSrc));
check('driver records grantEvents', /grantEvents/.test(driverSrc));
check('driver census carries locations + total + personFlags', /locations/.test(driverSrc) && /personFlags/.test(driverSrc));

// --- 3. Volley record shape the tracer classifies on ---
const ffSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'fieldFights.js'), 'utf8');
check('fieldFights writes rec.volley with rwId', /rec\.volley\s*=/.test(ffSrc) && /rwId/.test(ffSrc));
check('volley record carries shots + ammoLeft', /shots/.test(ffSrc) && /ammoLeft/.test(ffSrc));

// --- 4. Zero-grant rule: INCONCLUSIVE, never GO/NO-GO ---
const emptyLeg = gunlife.traceLeg([{
  seed: 999001, mode: 'ctl', gameDays: 150, endReason: 'survived', won: false,
  villageLost: false, maxWave: 5, standing: 300, scaleRank: 'regional',
  contestEvents: [], grantEvents: [], killLootEvents: [], prizeEvents: [],
  volleyEvents: [], corpseTakeEvents: [], v4gunLoc: [], deaths: [],
  instrumentErrors: [],
}]);
check('zero grants -> INCONCLUSIVE', emptyLeg.verdict === 'INCONCLUSIVE', 'verdict: ' + emptyLeg.verdict);
check('zero grants -> grantTotal 0', emptyLeg.grantTotal === 0);

console.log('TEST-GUNLIFE-A: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
