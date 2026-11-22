// Proof test for the r238 deathcleanup instrument (prereg thread 10;
// closes r230 metric review 5).
//
// Proves two things, both read-only with respect to the game:
//  1. DRIVER half: a short live run emits census.deathCleanup with the
//     right shape — and, before any plan seeds (day 5), stats is the
//     woken-empty store (planSeeds 0; r265 PLANWAKE wakes the store on
//     the first Haven day by design) and firstPlanDay is null (reading
//     the store cannot seed a plan, and the instrument does not
//     hallucinate one).
//  2. ANALYZER half: the R238 DEATHCLEANUP section aggregates what the
//     records say — real clean numbers pass through, an injected
//     dead-holder entry raises deadHolders + unseeded +
//     ignitionAfterDeath, and a record with no deathCleanup field at all
//     (the old format) is tolerated instead of crashing.
//
// Writes only under /tmp. Reads the real r238 panel JSONs from the
// analyzer's default evidence dir (EVID env overrides, same pattern as
// the driver/analyzer). Exit 0 = pass, 1 = fail.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DRIVER = path.join(__dirname, 'journey-crisis-r238-delayed-20261117.js');
const ANALYZER = path.join(__dirname, 'analyze-crisis-r238-delayed-20261117.js');
const SRC_EVID = process.env.EVID
  || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-17';
const TMP = fs.mkdtempSync(path.join('/tmp', 'deathcleanup-proof-'));

let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log('  ok: ' + name); }
  else { failures++; console.log('  FAIL: ' + name + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); }
}
function cleanup() { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {} }

try {
  // ---- 1. DRIVER half: short live run, plan never ignites ----
  console.log('driver half (SEED=14511 DAYS=5):');
  const driverEvid = path.join(TMP, 'driver-evid');
  const run = spawnSync(process.execPath, [DRIVER], {
    cwd: ROOT,
    env: Object.assign({}, process.env, { SEED: '14511', DAYS: '5', EVID: driverEvid }),
    encoding: 'utf8', timeout: 110000,
  });
  check('driver exits 0', run.status === 0, { status: run.status, stderr: (run.stderr || '').slice(-300) });
  let rec = null;
  try { rec = JSON.parse((run.stdout || '').trim().split('\n').pop()); } catch (e) { rec = null; }
  check('driver stdout parses as one JSON record', !!rec && typeof rec === 'object', (run.stdout || '').slice(-200));
  check('driver record has no top-level error', !!(rec && !rec.error), rec && rec.error);
  const dc = rec && rec.census && rec.census.deathCleanup;
  check('census.deathCleanup present', !!dc, rec && rec.census && Object.keys(rec.census));
  check('deathCleanup has stats/entryCount/entries/firstPlanDay',
    !!(dc && 'stats' in dc && 'entryCount' in dc && 'entries' in dc && 'firstPlanDay' in dc), dc);
  check('entryCount is a number, entries an array',
    !!(dc && typeof dc.entryCount === 'number' && Array.isArray(dc.entries)), dc);
  // r265 PLANWAKE: the store now wakes on the first Haven day BY
  // DESIGN, so stats is a zeroed object (planSeeds 0) rather than
  // null on a 5-day run — "never ignited" now reads planSeeds 0 +
  // firstPlanDay null, not stats null. The instrument reports the
  // woken-but-empty store honestly; it does not hallucinate a plan.
  check('stats is the woken-empty store before any plan seeds (day 5, planSeeds 0)',
    !!(dc && dc.stats && dc.stats.planSeeds === 0 && dc.stats.deathCleanups === 0), dc && dc.stats);
  check('firstPlanDay is null before ignition',
    !!(dc && dc.firstPlanDay === null), dc && dc.firstPlanDay);
  check('instrumentErrors empty', !!(rec && Array.isArray(rec.instrumentErrors) && rec.instrumentErrors.length === 0),
    rec && rec.instrumentErrors);

  // ---- 2. ANALYZER half: real + injected + old-format records ----
  console.log('analyzer half:');
  const inputDir = path.join(TMP, 'input');
  fs.mkdirSync(inputDir, { recursive: true });
  function loadSeed(seed) {
    return JSON.parse(fs.readFileSync(path.join(SRC_EVID, 'journey-crisis-r238-delayed-seed' + seed + '.json'), 'utf8'));
  }
  function writeSeed(seed, obj) {
    fs.writeFileSync(path.join(inputDir, 'journey-crisis-r238-delayed-seed' + seed + '.json'), JSON.stringify(obj));
  }
  function firstDeathDay(obj) {
    const corpses = (obj.census && obj.census.corpses) || [];
    const days = corpses.map(c => c.day).filter(n => Number.isFinite(n));
    return days.length ? Math.min.apply(null, days) : null;
  }
  const a = loadSeed(14511);            // real: clean, 7 cleanups / 7 seeds
  const b = loadSeed(14512);            // real: sleeping village, stats null
  const c = loadSeed(14514);            // injected: dead-holder entry, unseeded, ignition-after-death
  const cDeath = firstDeathDay(c);
  c.census.deathCleanup = {
    stats: { deathCleanups: 0, removalCleanups: 0, planSeeds: 0, partyTrios: 0, partyDissolved: 0 },
    entryCount: 1,
    entries: [{ holder: 'Test Holder', holderId: 'v_test', holderAlive: false, stage: 'seeking', partySize: 2 }],
    firstPlanDay: cDeath + 1,
  };
  const d = loadSeed(14513);            // old format: no deathCleanup field
  delete d.census.deathCleanup;
  writeSeed(14511, a); writeSeed(14512, b); writeSeed(14514, c); writeSeed(14513, d);

  const an = spawnSync(process.execPath, [ANALYZER, inputDir], {
    cwd: ROOT, encoding: 'utf8', timeout: 110000,
  });
  check('analyzer exits 0', an.status === 0, { status: an.status, stderr: (an.stderr || '').slice(-300) });
  const lines = (an.stdout || '').split('\n');
  const hdr = lines.findIndex(l => l.indexOf('R238 DEATHCLEANUP') === 0);
  check('DEATHCLEANUP section printed', hdr >= 0);
  let sec = null;
  try { sec = JSON.parse(lines[hdr + 1]); } catch (e) { sec = null; }
  check('DEATHCLEANUP line parses as JSON', !!sec, lines[hdr + 1]);
  if (sec) {
    const row = s => sec.rows.filter(r => r.seed === s)[0];
    const ra = row(14511), rb = row(14512), rc = row(14514), rd = row(14513);
    const aStats = a.census.deathCleanup.stats;
    check('row A passes real cleanups/seeds through',
      !!(ra && ra.deathCleanups === aStats.deathCleanups && ra.planSeeds === aStats.planSeeds), ra);
    check('row A: no dead holders, not unseeded, no ignition-after-death',
      !!(ra && ra.deadHolders.length === 0 && ra.unseeded === false && ra.ignitionAfterDeath === false), ra);
    check('row B: present, stats null (sleeping village)',
      !!(rb && rb.present === true && rb.deathCleanups === null && rb.firstPlanDay === null), rb);
    check('row B: no ignition-after-death',
      !!(rb && rb.ignitionAfterDeath === false), rb);
    check('row C: injected dead holder flagged',
      !!(rc && rc.deadHolders.length === 1 && rc.deadHolders[0] === 'Test Holder'), rc);
    check('row C: unseeded (planSeeds 0 with an entry present)',
      !!(rc && rc.unseeded === true), rc);
    check('row C: ignition-after-death (firstPlanDay == firstDeathDay+1, 0 cleanups, 0 seeds)',
      !!(rc && rc.ignitionAfterDeath === true), rc);
    check('row D: old-format record tolerated, present false',
      !!(rd && rd.present === false && rd.deathCleanups === null), rd);
    check('panel totals: deathCleanups/planSeeds from A only',
      !!(sec.panel && sec.panel.deathCleanups === aStats.deathCleanups && sec.panel.planSeeds === aStats.planSeeds), sec.panel);
    check('panel totals: 1 dead-holder entry, C unseeded + ignition-after-death',
      !!(sec.panel && sec.panel.deadHolderEntries === 1
        && JSON.stringify(sec.panel.unseededSeeds) === '[14514]'
        && JSON.stringify(sec.panel.ignitionAfterDeathSeeds) === '[14514]'), sec.panel);
  }
} catch (e) {
  failures++;
  console.log('  FAIL: exception — ' + (e && e.stack || e));
} finally {
  cleanup();
}
console.log(failures === 0 ? 'PASS test-deathcleanup-instrument-20261117' : 'FAIL test-deathcleanup-instrument-20261117 (' + failures + ' failures)');
process.exit(failures === 0 ? 0 : 1);
