// test-m2step2-a.js — proof test, arm sim-m2step2-a
// (finding #2590, evade-on-a-quivered-bow, Step 2: the M2 lever —
// price the volley honestly in the hopeless math). Proves the lever
// + the classifier + the game behavior it reads. It does NOT run the
// judged leg — the pilot's own corpora prove the live path (plus the
// 1-seed smoke).
//   - Static: DEPMAT/ROLL35/AMMO substrate present in game.js,
//     FIBERFETCH absent (concept-dead, not re-landed).
//   - Static M2: the morale block (round >= 2) computes vDpr
//     excluding the opening volley's damage when M2STEP2=1; the
//     volley still lands in rec.mDealt (banked once, in the lead's
//     HP); flag unset = base behavior.
//   - Classifier fixtures: one synthetic meeting per class (the
//     priority order inside vFlee), 0 UNCLASSIFIED on fixture corpora,
//     fought-meeting volleys counted (2 fired / 3 fought, incl. a
//     vFlee WITH a volley), awareness passed through (served
//     aware-gated rate non-null), evadeP independence.
//   - Analyzer: its --selftest runs green from here.
//   - Driver: the m2step2 driver asserts the M2STEP2 leg/flag match
//     and records m2step2Present/m2step2On per corpus file.
// Harness: shared sim-harness (seeded Math.random BEFORE eval).
'use strict';
process.env.DEPMAT = '1';
process.env.ROLL35 = '1';
process.env.AMMO = '1';
process.env.SPEARGATE = '1';
process.env.BOWOPEN = '1';
process.env.SENSEEXPED = '1';
process.env.M2STEP2 = '1';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const analyzer = require('./analyze-m2step2-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function mrow(over) {
  const base = { seed: 1, day: 50, vid: 'v1', mid: 'eater', wave: 4, origin: 'expedition',
    rangedId: 'crude_bow', ammoAtEntry: 4,
    evade: { awareness: true, tracking: 0, behavior: 'territorial', mSpeed: 3, mNotice: 5, mSize: 1, potential: false, abs: {}, abNight: false, evadeP: 0.24, gpTerm: false, obsBefore: 0, obsAfter: 0 },
    outcome: 'evade', rounds: 0, vTaken: 0, mDealt: 0, mHpStart: 1000, calledHelp: false,
    allyVid: null, ally2Vid: null, alliesN: 0, fleeHpFrac: null, fleeWise: false, fleeLearn: false,
    fleeHopeless: false, everHopeless: false, everWinning: false, intent: 'engage', intentWhy: 'seek',
    volley: null };
  return Object.assign(base, over || {});
}
const STAGE = [
  { day: 10, vid: 'v1', staged: true, source: 'crafted', itemId: 'crude_bow', spearHolder: true, depmatSite: true },
  { day: 40, vid: 'v1', staged: true, source: 'fromStash', itemId: 'bow', spearHolder: false, depmatSite: false },
];

async function main() {
  // ---- 1. Static wiring ----
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('substrate DEPMAT present', /DEPMAT/.test(gameSrc) && /weapon_craft_site/.test(gameSrc));
  check('substrate ROLL35 present', /ROLL35/.test(gameSrc) && /roll35Rate/.test(gameSrc));
  check('substrate AMMO present', /AMMO \(sim-ammo-a/.test(gameSrc) && /ammoServed/.test(gameSrc));
  check('FIBERFETCH absent (concept-dead)', !/FIBERFETCH \(sim-fiberfetch-a/.test(gameSrc));
  check('SPEARGATE present (landed gate)', /SPEARGATE/.test(gameSrc) && /volleyWeaponOf/.test(gameSrc));

  // ---- 2. Static M2: the volley is banked, not smeared ----
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  const moraleStart = ffSrc.indexOf('if (round >= 2) {');
  const hopelessIdx = ffSrc.indexOf('hopeless = rtd < rtk * 0.85');
  check('morale block found (round >= 2, hopeless read)', moraleStart !== -1 && hopelessIdx !== -1 && hopelessIdx > moraleStart);
  const moraleBlock = (moraleStart !== -1 && hopelessIdx !== -1) ? ffSrc.slice(moraleStart, hopelessIdx) : '';
  check('M2 comment header present', /M2STEP2 \(sim-m2step2-a/.test(ffSrc));
  check('M2 reads the volley damage off rec.volley', /_m2VolleyDmg = \(rec\.volley && rec\.volley\.dmg\) \| 0/.test(moraleBlock));
  check('M2 env-gates on M2STEP2=1', /process\.env\.M2STEP2 === '1'/.test(moraleBlock));
  check('M2 vDpr excludes the volley when on', /rec\.mDealt - \(_m2On \? _m2VolleyDmg : 0\)\) \/ round/.test(moraleBlock));
  check('M2 change sits inside the morale block (before the hopeless read)',
    moraleBlock.indexOf('_m2VolleyDmg') !== -1 && moraleBlock.indexOf('var rtk = mlead.hp') !== -1);
  const volleyStart = ffSrc.indexOf('RANGED OPENING VOLLEY');
  const volleyEnd = ffSrc.indexOf('// the volley hits the lead', volleyStart);
  const mDealtIdx = ffSrc.indexOf('rec.mDealt += _vd');
  check('volley damage still lands in rec.mDealt (banked once)',
    volleyStart !== -1 && volleyEnd !== -1 && mDealtIdx !== -1 &&
    mDealtIdx > volleyStart && mDealtIdx < volleyEnd);
  // No M1 awareness term in this arm (prereg §0.2): the awareness
  // formula still takes no ranged input — the arm tests M2 alone.
  const awStart = ffSrc.indexOf('// ---- awareness:');
  const awEnd = ffSrc.indexOf('if (RR() < evade)', awStart);
  const awBlock = (awStart !== -1 && awEnd !== -1) ? ffSrc.slice(awStart, awEnd) : '';
  check('awareness formula still takes NO ranged input (M1 NOT built)',
    !/\b(bow|ammo|arrow|quiver|ranged)\b/i.test(awBlock), awBlock.slice(0, 200));

  // ---- 3. Driver: the leg/flag match is asserted, the lever is recorded ----
  const drvSrc = fs.readFileSync(path.join(REPO, 'scripts', 'm2step2-driver-a.js'), 'utf8');
  check('driver requires M2STEP2=1 on the arm leg', /MODE=arm requires M2STEP2=1/.test(drvSrc));
  check('driver requires M2STEP2 unset on the ctl leg', /MODE=ctl requires M2STEP2 unset/.test(drvSrc));
  check('driver requires the substrate ON both legs', /DEPMAT=1 required on BOTH legs/.test(drvSrc) && /ROLL35=1 required on BOTH legs/.test(drvSrc) && /AMMO=1 required on BOTH legs/.test(drvSrc));
  check('driver records m2step2Present/m2step2On per corpus file',
    /m2step2Present: M2STEP2_PRESENT, m2step2On: M2STEP2_ON/.test(drvSrc));

  // ---- 4. Classifier fixtures (one per class + priority order) ----
  const maps = analyzer.servedBowMaps(STAGE);
  check('awareness-evade', analyzer.classifyMeeting(mrow(), maps).cls === 'awareness-evade');
  check('hopeless-after-help', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.3 }), maps).cls === 'hopeless-after-help');
  check('hopeless-alone', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 4, fleeHopeless: true, fleeHpFrac: 0.22 }), maps).cls === 'hopeless-alone');
  check('floor-hp', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeHopeless: false, fleeHpFrac: 0.12 }), maps).cls === 'floor-hp');
  check('wise-leave beats hopeless (priority)', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeWise: true, fleeHopeless: true, calledHelp: true }), maps).cls === 'wise-leave');
  check('learn-withdraw', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeLearn: true, intent: 'learn' }), maps).cls === 'learn-withdraw');
  check('engaged-vKill with volley', analyzer.classifyMeeting(mrow({ outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vKill');
  check('engaged-vDie (volley then R2 death)', analyzer.classifyMeeting(mrow({ outcome: 'vDie', rounds: 2, mDealt: 34, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vDie');
  check('alreadyDead', analyzer.classifyMeeting(mrow({ outcome: 'alreadyDead', rounds: 0 }), maps).cls === 'alreadyDead');
  check('unknown outcome is unclassified', analyzer.classifyMeeting(mrow({ outcome: 'mKill', rounds: 1 }), maps).cls === 'unclassified');
  check('non-served vid is not in the population', analyzer.classifyMeeting(mrow({ vid: 'v9' }), maps) === null);
  check('served but 0 ammo is not quivered', analyzer.classifyMeeting(mrow({ ammoAtEntry: 0 }), maps) === null);
  check('classifier passes awareness through (fix #2)', analyzer.classifyMeeting(mrow(), maps).awareness === true);

  // ---- 5. Fixture corpora: no UNCLASSIFIED, fought volleys counted ----
  const fj = { seed: 1, days: 150, endReason: 'survived', villageLost: false, maxWave: 5, standing: 199, scaleRank: 'regional', won: false,
    deaths: [], instrumentErrors: [], depmatRows: STAGE, ammoRows: [],
    v4encounters: [
      mrow({}),
      mrow({ day: 60, outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.3, mDealt: 120 }),
      mrow({ day: 65, outcome: 'vFlee', rounds: 4, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.37, mDealt: 187, mHpStart: 900, volley: { shots: 1, hits: 1, dmg: 13, ammoLeft: 0 } }),
      mrow({ day: 70, outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }),
      mrow({ day: 75, outcome: 'vDie', rounds: 2, mDealt: 34, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }),
      mrow({ day: 80, outcome: 'mFlee', rounds: 4, mDealt: 300, volley: null }),
      mrow({ day: 90, vid: 'v9', outcome: 'evade', rounds: 0 }),
    ] };
  const fa = analyzer.analyzeFile(fj);
  check('fixture corpus: pool is 6', fa.classified.length === 6, 'got ' + fa.classified.length);
  check('fixture corpus: 0 unclassified', fa.classified.every(function (m) { return m.cls !== 'unclassified'; }), JSON.stringify(fa.classified.map(function (m) { return m.cls; })));
  // Served-bow volleys counted over FOUGHT meetings: 3 fired of 5
  // fought (2 vFlee + vKill + vDie + mFlee = 5 fought; the vDie
  // volley and the 107152-shape vFlee volley count now).
  let volleyFired = 0, foughtN = 0;
  for (const m of fa.classified) {
    if ((m.rounds | 0) >= 1 && m.cls !== 'unclassified') {
      foughtN++;
      if (m.volley && (m.volley.shots | 0) > 0) volleyFired++;
    }
  }
  check('served-bow volleys counted over fought (3 fired / 5 fought)', volleyFired === 3 && foughtN === 5, volleyFired + '/' + foughtN);
  check('evadeP independence: ammo-only difference replicates identically',
    analyzer.replicateEvadeP(mrow().evade) === analyzer.replicateEvadeP(mrow({ ammoAtEntry: 9 }).evade));
  check('evadeP replication matches the driver value 0.24', analyzer.replicateEvadeP(mrow().evade) === 0.24);
  // The 107152-shape meeting's honest read (rtkHonest 16.4, shift 1.1)
  // is the mechanism check's shape on real diag numbers.
  const m152 = fa.classified.filter(function (m) { return m.day === 65; })[0];
  check('107152-shape meeting carries rtkHonest 16.4 / honest shift 1.1',
    m152 && m152.volleyHopeless && m152.volleyHopeless.rtkHonest === 16.4 && m152.volleyHopeless.rtkHonestShiftRounds === 1.1,
    m152 && m152.volleyHopeless ? JSON.stringify(m152.volleyHopeless) : 'missing');

  // ---- 6. Analyzer selftest green from here ----
  const stFails = analyzer.selftest();
  check('analyzer --selftest green', stFails === 0, stFails + ' failures');

  // ---- 7. Live targets exist (the smoke seed proves the full path) ----
  const { Game } = await loadGame({ seed: 31031, mode: 'm2step2-a-test', fullTelemetry: false });
  await quietLog(async function () { await setupGame(Game); });
  check('live: Game.fieldFight is a function', typeof Game.fieldFight === 'function');
  check('live: Game.villagerStageBow is a function', typeof Game.villagerStageBow === 'function');
  check('live: Game.villagerPocketAmmo is a function', typeof Game.villagerPocketAmmo === 'function');
  let rosterN = 0;
  try { rosterN = ((Game.state || {}).village || {}).roster ? Game.state.village.roster.length : 0; } catch (e) {}
  check('live: roster non-empty after setup', rosterN > 0, 'roster=' + rosterN);

  console.log('\nM2STEP2_TEST ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('failures: ' + fails.join('; ')); process.exit(1); }
}

if (require.main === module) {
  main().catch(function (e) { console.error('M2STEP2_TEST FATAL: ' + (e && e.stack || e)); process.exit(1); });
}
