// test-prefloor-deaths-b.js — the PRE-FLOOR DEATHS det-gate + neutrality + integrity proof
// (arm sim-prefloor-deaths-b, run fleshout-loop-b-20261109T1230Z). DIAG, zero src/js.
// G1: the cause classifier (scripts/analyze-prefloor-deaths-20261109.js)
// classifies every registered cause correctly, the monsterName rule catches
// signature-monster-named causes, dehydration/thirst stay in other (never
// silently merged into starvation or sickness), unknown causes land in
// other-NAMED, and the fixtures DETECT a broken classifier (rule swap /
// monsterName rule removed / dehydration merged into starvation).
// G2: recorder neutrality on the committed corpora when present
// (skip-until-present, as the foundation proof does).
// G3: corpus integrity on the committed corpora when present.
// Real-sim legs: one winseek seed + one doorwalk seed in /tmp (stage 0
// shape) — corpora parse, fallen present with day + cause, classifier
// runs, zero sit-verb calls on either leg (the no-seat-walking config
// proven live), doorwalk leg records zero sits and zero doors entered.
// Usage: node scripts/test-prefloor-deaths-b.js
// Never run concurrent jest; use --cacheDirectory=/tmp/jest-cache-sim-prefloor-deaths-b.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require('./analyze-prefloor-deaths-20261109');
const A = require('./analyze-sitgap-20261108');
const DRV = require('./prefloor-deaths-driver-20261109');

let PASS = 0, FAIL = 0;
const FAILURES = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('PASS ' + name); }
  else { FAIL++; FAILURES.push(name); console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---- G1: classifier fixtures (the preregistered registry) ----
check('G1 wild: the wild', AN.classifyCause({ cause: 'the wild', day: 10 }) === 'wild');
check('G1 wild: monster + monsterName', AN.classifyCause({ cause: 'monster', monsterName: 'Nightlight', day: 10 }) === 'wild');
check('G1 wild: monster, no monsterName', AN.classifyCause({ cause: 'monster', day: 10 }) === 'wild');
check('G1 wild: ambush', AN.classifyCause({ cause: 'ambush', day: 10 }) === 'wild');
check('G1 wild: combat', AN.classifyCause({ cause: 'combat', day: 10 }) === 'wild');
check('G1 wild: a stranger', AN.classifyCause({ cause: 'a stranger', day: 10 }) === 'wild');
check('G1 wild: Ad Break (cause == monster name, monsterName set)', AN.classifyCause({ cause: 'Ad Break', monsterName: 'Ad Break', day: 40 }) === 'wild');
check('G1 wild: The Eulogy (cause == monster name, monsterName set)', AN.classifyCause({ cause: 'The Eulogy', monsterName: 'The Eulogy', day: 55 }) === 'wild');
check('G1 wild: signature monster via monsterName only', AN.classifyCause({ cause: 'The Influencer', monsterName: 'The Influencer', day: 30 }) === 'wild');
check('G1 arena: the arena (exact)', AN.classifyCause({ cause: 'the arena', day: 10 }) === 'arena');
check('G1 arena: bare "arena" is NOT the arena', AN.classifyCause({ cause: 'arena', day: 10 }) === 'other');
check('G1 starvation', AN.classifyCause({ cause: 'starvation', day: 10 }) === 'starvation');
check('G1 sickness: sickness', AN.classifyCause({ cause: 'sickness', day: 10 }) === 'sickness-disease');
check('G1 sickness: wound_fever', AN.classifyCause({ cause: 'wound_fever', day: 10 }) === 'sickness-disease');
check("G1 sickness: a wound that wouldn't close", AN.classifyCause({ cause: "a wound that wouldn't close", day: 10 }) === 'sickness-disease');
check('G1 other: dehydration stays other (never starvation)', AN.classifyCause({ cause: 'dehydration', day: 10 }) === 'other');
check('G1 other: thirst stays other (never starvation)', AN.classifyCause({ cause: 'thirst', day: 10 }) === 'other');
check('G1 other: contest stays other (distinct from the arena)', AN.classifyCause({ cause: 'contest', day: 10 }) === 'other');
check('G1 other: phoenix link (ash)', AN.classifyCause({ cause: 'the phoenix link (ash)', day: 10 }) === 'other');
check('G1 other: unknown cause lands in other-NAMED', AN.classifyCause({ cause: 'fell off a cliff', day: 10 }) === 'other');
check('G1 other: missing cause lands in other', AN.classifyCause({ day: 10 }) === 'other');
check('G1 other: null entry lands in other', AN.classifyCause(null) === 'other');

// ---- G1: the fixtures DETECT a broken classifier (sensitivity) ----
// Broken variant 1: wild/arena rules swapped ('the arena' -> wild).
function brokenSwap(entry) {
  const cause = entry && entry.cause != null ? String(entry.cause) : '';
  if (cause === 'the arena') return 'wild';
  if (cause === 'the wild') return 'arena';
  return AN.classifyCause(entry);
}
check('G1 sensitivity: swapped wild/arena misclassifies the arena fixture (real one does not)',
  brokenSwap({ cause: 'the arena', day: 10 }) !== AN.classifyCause({ cause: 'the arena', day: 10 }));
// Broken variant 2: monsterName rule removed (Ad Break falls to other).
function brokenNoMonsterName(entry) {
  if (!entry || typeof entry !== 'object') return 'other';
  const cause = entry.cause != null ? String(entry.cause) : '';
  if (cause === 'the wild' || cause === 'monster' || cause === 'ambush' || cause === 'combat' || cause === 'a stranger') return 'wild';
  if (cause === 'the arena') return 'arena';
  if (cause === 'starvation') return 'starvation';
  return 'other';
}
check('G1 sensitivity: no-monsterName-rule misclassifies Ad Break (real one does not)',
  brokenNoMonsterName({ cause: 'Ad Break', monsterName: 'Ad Break', day: 40 }) !== AN.classifyCause({ cause: 'Ad Break', monsterName: 'Ad Break', day: 40 }));
// Broken variant 3: dehydration silently merged into starvation.
function brokenDehydrationStarvation(entry) {
  if (entry && (entry.cause === 'dehydration' || entry.cause === 'thirst')) return 'starvation';
  return AN.classifyCause(entry);
}
check('G1 sensitivity: dehydration-as-starvation misclassifies the dehydration fixture (real one does not)',
  brokenDehydrationStarvation({ cause: 'dehydration', day: 10 }) !== AN.classifyCause({ cause: 'dehydration', day: 10 }));

// ---- G1: classifySeed + aggregation on synthetic corpora ----
const synthWinseek = {
  seed: 99901, gameDays: 70, endReason: 'village-lost', standing: 100, maxWave: 4, scaleRank: 'regional', won: false,
  daily: [{ day: 2 }, { day: 70 }], sitVerbMsgs: [], doorVerbMsgs: [], takeseatStats: { seatTaken: 0 }, doorwalkStats: null,
  fallen: [
    { villagerId: 'a', day: 12, cause: 'the wild', name: 'A' },
    { villagerId: 'b', day: 31, cause: 'monster', monsterName: 'Nightlight', name: 'B' },
    { villagerId: 'c', day: 40, cause: 'Ad Break', monsterName: 'Ad Break', name: 'C' },
    { villagerId: 'd', day: 45, cause: 'the arena', name: 'D' },
    { villagerId: 'e', day: 50, cause: 'starvation', name: 'E' },
    { villagerId: 'f', day: 60, cause: 'sickness', name: 'F' },
    { villagerId: 'g', day: 65, cause: 'dehydration', name: 'G' },
    { villagerId: 'h', day: 95, cause: 'the wild', name: 'H' },
    { villagerId: 'i', day: 120, cause: 'the arena', name: 'I' },
  ],
};
const cl = AN.classifySeed(synthWinseek);
check('G1 seed: pre-90 total counts only day<90', cl.pre90Total === 7, 'got ' + cl.pre90Total);
check('G1 seed: wild split counts the wild + monster + Ad Break', cl.split.wild === 3, 'got ' + cl.split.wild);
check('G1 seed: arena split counts only the pre-90 arena death', cl.split.arena === 1, 'got ' + cl.split.arena);
check('G1 seed: starvation split', cl.split.starvation === 1);
check('G1 seed: sickness split', cl.split['sickness-disease'] === 1);
check('G1 seed: dehydration lands in other, named', cl.split.other === 1 && cl.otherBreakdown.dehydration === 1, JSON.stringify(cl.otherBreakdown));
check('G1 seed: floorReach false at 70d', cl.floorReach === false);
check('G1 seed: no contradiction on a clean corpus', cl.contradiction === false);
check('G1 seed: day-95 and day-120 deaths excluded from pre-90', cl.raw['the wild'] === 1 && (cl.raw['the arena'] || 0) === 1, JSON.stringify(cl.raw));
const clFloor = AN.classifySeed(Object.assign({}, synthWinseek, { seed: 99902, gameDays: 120, daily: [{ day: 2 }, { day: 120 }] }));
check('G1 seed: floorReach true at 120d', clFloor.floorReach === true);
const clSit = AN.classifySeed(Object.assign({}, synthWinseek, { seed: 99903, sitVerbMsgs: [{ call: 'tableTakeSeat', day: 90 }] }));
check('G1 seed: sit-verb call flags a contradiction', clSit.contradiction === true && clSit.sitCalls === 1);
const clDayMissing = AN.classifySeed(Object.assign({}, synthWinseek, { seed: 99904, fallen: synthWinseek.fallen.concat([{ villagerId: 'j', cause: 'the wild', name: 'J' }]) }));
check('G1 seed: missing-day fallen counted, not classified', clDayMissing.dayMissing === 1 && clDayMissing.pre90Total === 7, 'dayMissing=' + clDayMissing.dayMissing);

// Aggregation: dominant >= 50% detected; no-dominant shape detected.
const aggDom = AN.aggregateSeedClassifications([cl, AN.classifySeed(Object.assign({}, synthWinseek, { seed: 99905 }))]);
check('G1 aggregate: wild 6/14 is below 50% (no dominant)', aggDom.primaryDominant.cls === 'wild' && aggDom.primaryDominant.meets50 === false, JSON.stringify(aggDom.primaryDominant));
const wildHeavy = AN.classifySeed(Object.assign({}, synthWinseek, {
  seed: 99906,
  fallen: [
    { villagerId: 'a', day: 10, cause: 'the wild', name: 'A' },
    { villagerId: 'b', day: 20, cause: 'the wild', name: 'B' },
    { villagerId: 'c', day: 30, cause: 'monster', monsterName: 'Gavel', name: 'C' },
    { villagerId: 'd', day: 40, cause: 'starvation', name: 'D' },
  ],
}));
const aggDom2 = AN.aggregateSeedClassifications([wildHeavy]);
check('G1 aggregate: wild 3/4 meets the 50% bar', aggDom2.primaryDominant.cls === 'wild' && aggDom2.primaryDominant.meets50 === true, JSON.stringify(aggDom2.primaryDominant));
const aggSubset = AN.aggregateSeedClassifications([cl, clFloor]);
check('G1 aggregate: subset counts only pre-90-ending villages', aggSubset.subsetN === 7 && aggSubset.primaryN === 14, 'subsetN=' + aggSubset.subsetN + ' primaryN=' + aggSubset.primaryN);
check('G1 trueMedian: even count averages the middle two', AN.trueMedian([60, 70, 80, 90]) === 75);
check('G1 trueMedian: odd count takes the middle', AN.trueMedian([60, 70, 80]) === 70);

// ---- Driver write-retry round-trip (reused function) ----
(function () {
  const dir = '/tmp/prefloor-proof-writetest';
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  const file = path.join(dir, 'roundtrip.json');
  try { fs.unlinkSync(file); } catch (e) {}
  const content = JSON.stringify({ probe: 'prefloor', seed: 55201 }) + '\n';
  DRV.writeFileRetry(file, content, { attempts: 3, sleepS: 1 });
  const back = fs.readFileSync(file, 'utf8');
  check('G1 driver: writeFileRetry round-trip (content + JSON parse)', back === content && JSON.parse(back).probe === 'prefloor');
})();

// ---- Real-sim legs (stage 0 shape, /tmp output, not evidence) ----
function runDriverLeg(leg, outDir) {
  try { execFileSync('rm', ['-rf', outDir]); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SEEDS: '55201', DAYS: '150', LEG: leg, RUN: leg === 'winseek' ? 'winseek' : 'doorwalk-baseline',
    OUTDIR: outDir,
  });
  delete env.TAKESEAT_B;
  delete env.DOORWALK_B;
  const r = spawnSync('node', [path.join(REPO, 'scripts', 'prefloor-deaths-driver-20261109.js')], {
    env: env, cwd: REPO, timeout: 600000, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  return r;
}
(function () {
  const outDir = '/tmp/prefloor-proof-winseek';
  const r = runDriverLeg('winseek', outDir);
  check('G1 real-sim: winseek leg driver exits 0 on seed 55201', r.status === 0, 'status=' + r.status + ' stderr=' + String(r.stderr || '').slice(0, 300));
  if (r.status === 0) {
    const file = path.join(outDir, 'prefloor-deaths-b-s55201-winseek.json');
    let c = null;
    try { c = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
    check('G1 real-sim: winseek corpus parses with fallen + daily', !!c && Array.isArray(c.fallen) && Array.isArray(c.daily) && c.daily.length > 10, c ? ('fallen=' + (c.fallen || []).length + ' daily=' + (c.daily || []).length) : 'unparseable');
    if (c) {
      const cl2 = AN.classifySeed(c);
      check('G1 real-sim: winseek corpus classifies (pre-90 deaths present)', cl2.pre90Total > 0, 'pre90=' + cl2.pre90Total);
      check('G1 real-sim: winseek leg records zero sit-verb calls', cl2.sitCalls === 0 && cl2.seatTaken === 0, 'sitCalls=' + cl2.sitCalls + ' seatTaken=' + cl2.seatTaken);
      check('G1 real-sim: winseek corpus has zero instrument errors', (c.instrumentErrors || []).length === 0, JSON.stringify((c.instrumentErrors || []).slice(0, 3)));
      const ck = A.checkCorpusSit(c);
      check('G1 real-sim: winseek corpus passes G3 integrity', ck.ok === true, (ck.problems || []).join('; '));
    }
  }
})();
(function () {
  const outDir = '/tmp/prefloor-proof-doorwalk';
  const r = runDriverLeg('doorwalk', outDir);
  check('G1 real-sim: doorwalk leg driver exits 0 on seed 55201', r.status === 0, 'status=' + r.status + ' stderr=' + String(r.stderr || '').slice(0, 300));
  if (r.status === 0) {
    const file = path.join(outDir, 'prefloor-deaths-b-s55201-doorwalk-baseline.json');
    let c = null;
    try { c = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
    check('G1 real-sim: doorwalk corpus parses with fallen + daily', !!c && Array.isArray(c.fallen) && Array.isArray(c.daily) && c.daily.length > 10, c ? ('fallen=' + (c.fallen || []).length + ' daily=' + (c.daily || []).length) : 'unparseable');
    if (c) {
      const cl2 = AN.classifySeed(c);
      check('G1 real-sim: doorwalk corpus classifies (pre-90 deaths present)', cl2.pre90Total > 0, 'pre90=' + cl2.pre90Total);
      check('G1 real-sim: doorwalk leg records zero sit-verb calls AND zero doors entered (gates OFF live)', cl2.sitCalls === 0 && cl2.seatTaken === 0 && cl2.doorsEntered === 0,
        'sitCalls=' + cl2.sitCalls + ' seatTaken=' + cl2.seatTaken + ' doorsEntered=' + cl2.doorsEntered);
      check('G1 real-sim: doorwalk leg takeseatStats stay zero (sit drive off)', ((c.takeseatStats || {}).seatTaken | 0) === 0 && ((c.takeseatStats || {}).seatAttempts | 0) === 0, JSON.stringify(c.takeseatStats));
      check('G1 real-sim: doorwalk corpus has zero instrument errors', (c.instrumentErrors || []).length === 0, JSON.stringify((c.instrumentErrors || []).slice(0, 3)));
    }
  }
})();

// ---- G2/G3 on the committed corpora when present (skip-until-present) ----
(function () {
  const winDir = path.join(REPO, 'evidence', '2026-11-09', 'perseed-prefloor-deaths-b');
  const dwDir = path.join(REPO, 'evidence', '2026-11-09', 'perseed-prefloor-deaths-b-doorwalk');
  const unrecDir = path.join(REPO, 'evidence', '2026-11-09', 'perseed-prefloor-deaths-b-unrec');
  if (!fs.existsSync(winDir)) { console.log('SKIP G2/G3: winseek corpora not present yet'); return; }
  const wins = AN.loadDir(winDir);
  const seeds = Object.keys(wins).sort();
  check('G3: winseek corpora present (12 seeds)', seeds.length === 12, 'got ' + seeds.length);
  seeds.forEach(function (s) {
    const ck = A.checkCorpusSit(wins[s]);
    check('G3 winseek s' + s + ' integrity', ck.ok === true, (ck.problems || []).join('; '));
  });
  if (fs.existsSync(dwDir)) {
    const dws = AN.loadDir(dwDir);
    const dseeds = Object.keys(dws).sort();
    check('G3: doorwalk corpora present (12 seeds)', dseeds.length === 12, 'got ' + dseeds.length);
    dseeds.forEach(function (s) {
      const ck = A.checkCorpusSit(dws[s]);
      check('G3 doorwalk s' + s + ' integrity', ck.ok === true, (ck.problems || []).join('; '));
    });
  } else { console.log('SKIP G3 doorwalk: corpora not present yet'); }
  if (fs.existsSync(unrecDir)) {
    const unrec = AN.loadDir(unrecDir);
    Object.keys(unrec).sort().forEach(function (s) {
      if (!wins[s]) { console.log('SKIP G2 s' + s + ': no recorded match'); return; }
      const n = A.neutralityCompareSit(unrec[s], wins[s]);
      check('G2 neutrality s' + s + ' (unrecorded == recorded)', n.ok === true, (n.diffs || []).join(', '));
    });
  } else { console.log('SKIP G2: unrecorded controls not present yet'); }
})();

console.log('\n' + PASS + ' passed, ' + FAIL + ' failed' + (FAIL ? ' — ' + FAILURES.join(', ') : ''));
process.exit(FAIL ? 1 : 0);
