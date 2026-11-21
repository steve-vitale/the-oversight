// test-evadebow-a.js — proof test, arm sim-evadebow-a
// (finding #2590, evade-on-a-quivered-bow). Proves the classifier +
// the game behavior it reads. It does NOT run the judged leg — the
// pilot's own corpora prove the live path (plus the 1-seed smoke).
//   - Static: DEPMAT/ROLL35/AMMO substrate present in game.js,
//     FIBERFETCH absent (concept-dead, not re-landed).
//   - Static formula: the awareness evade block takes NO ranged
//     input (no bow/ammo/arrow/quiver/ranged term) and runs BEFORE
//     the volley code; fighterShouldFlee takes no ranged input; the
//     volley adds its damage to rec.mDealt (so it enters the hopeless
//     read only as a diluted lump).
//   - Classifier fixtures: one synthetic meeting per class (the
//     priority order inside vFlee), 0 UNCLASSIFIED on fixture corpora,
//     served-bow volleys counted (2 fired / 3 engaged), evadeP
//     independence (ammo-only difference -> identical evadeP).
//   - Analyzer: its --selftest runs green from here.
// Harness: shared sim-harness (seeded Math.random BEFORE eval).
'use strict';
process.env.DEPMAT = '1';
process.env.ROLL35 = '1';
process.env.AMMO = '1';
process.env.SPEARGATE = '1';
process.env.BOWOPEN = '1';
process.env.SENSEEXPED = '1';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const analyzer = require('./analyze-evadebow-a');
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

  // ---- 2. Static formula: the flee brain never reads the bow ----
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  const awStart = ffSrc.indexOf('// ---- awareness:');
  const awEnd = ffSrc.indexOf('if (RR() < evade)', awStart);
  check('awareness block found', awStart !== -1 && awEnd !== -1 && awEnd > awStart);
  const awBlock = (awStart !== -1 && awEnd !== -1) ? ffSrc.slice(awStart, awEnd) : '';
  check('awareness formula takes NO ranged input (M1, code read)',
    !/\b(bow|ammo|arrow|quiver|ranged)\b/i.test(awBlock), awBlock.slice(0, 200));
  check('awareness evade check runs BEFORE the volley code',
    awEnd !== -1 && ffSrc.indexOf('rec.volley = null', awEnd) !== -1 &&
    awEnd < ffSrc.indexOf('rec.volley = null'));
  const volleyStart = ffSrc.indexOf('RANGED OPENING VOLLEY');
  const volleyEnd = ffSrc.indexOf('// the volley hits the lead', volleyStart);
  const mDealtIdx = ffSrc.indexOf('rec.mDealt += _vd');
  check('volley damage lands in rec.mDealt (M2: diluted lump, code read)',
    volleyStart !== -1 && volleyEnd !== -1 && mDealtIdx !== -1 &&
    mDealtIdx > volleyStart && mDealtIdx < volleyEnd);
  const vaSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
  const fsfStart = vaSrc.indexOf('fighterShouldFlee(st, sit)');
  const fsfEnd = vaSrc.indexOf('applyFighterState', fsfStart);
  const fsfBody = (fsfStart !== -1 && fsfEnd !== -1) ? vaSrc.slice(fsfStart, fsfEnd) : '';
  check('fighterShouldFlee found', fsfStart !== -1 && fsfEnd !== -1);
  check('fighterShouldFlee takes NO ranged input (M3, code read)',
    !/\b(bow|ammo|arrow|quiver|ranged)\b/i.test(fsfBody));

  // ---- 3. Classifier fixtures (one per class + priority order) ----
  const maps = analyzer.servedBowMaps(STAGE);
  check('awareness-evade', analyzer.classifyMeeting(mrow(), maps).cls === 'awareness-evade');
  check('hopeless-after-help', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.3 }), maps).cls === 'hopeless-after-help');
  check('hopeless-alone', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 4, fleeHopeless: true, fleeHpFrac: 0.22 }), maps).cls === 'hopeless-alone');
  check('floor-hp', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeHopeless: false, fleeHpFrac: 0.12 }), maps).cls === 'floor-hp');
  check('wise-leave beats hopeless (priority)', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeWise: true, fleeHopeless: true, calledHelp: true }), maps).cls === 'wise-leave');
  check('learn-withdraw', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeLearn: true, intent: 'learn' }), maps).cls === 'learn-withdraw');
  check('engaged-vKill with volley', analyzer.classifyMeeting(mrow({ outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vKill');
  check('engaged-vDie (Sam Wilson shape: volley then R2 death)', analyzer.classifyMeeting(mrow({ outcome: 'vDie', rounds: 2, mDealt: 34, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vDie');
  check('alreadyDead', analyzer.classifyMeeting(mrow({ outcome: 'alreadyDead', rounds: 0 }), maps).cls === 'alreadyDead');
  check('unknown outcome is unclassified', analyzer.classifyMeeting(mrow({ outcome: 'mKill', rounds: 1 }), maps).cls === 'unclassified');
  check('non-served vid is not in the population', analyzer.classifyMeeting(mrow({ vid: 'v9' }), maps) === null);
  check('served but 0 ammo is not quivered', analyzer.classifyMeeting(mrow({ ammoAtEntry: 0 }), maps) === null);

  // ---- 4. Fixture corpora: no UNCLASSIFIED, volleys counted ----
  const fj = { seed: 1, days: 150, endReason: 'survived', villageLost: false, maxWave: 5, standing: 199, scaleRank: 'regional', won: false,
    deaths: [], instrumentErrors: [], depmatRows: STAGE, ammoRows: [],
    v4encounters: [
      mrow({}),
      mrow({ day: 60, outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.3, mDealt: 120 }),
      mrow({ day: 70, outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }),
      mrow({ day: 75, outcome: 'vDie', rounds: 2, mDealt: 34, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }),
      mrow({ day: 80, outcome: 'mFlee', rounds: 4, mDealt: 300, volley: null }),
      mrow({ day: 90, vid: 'v9', outcome: 'evade', rounds: 0 }),
    ] };
  const fa = analyzeFileSafe(fj);
  check('fixture corpus: pool is 5', fa.classified.length === 5, 'got ' + fa.classified.length);
  check('fixture corpus: 0 unclassified', fa.classified.every(function (m) { return m.cls !== 'unclassified'; }), JSON.stringify(fa.classified.map(function (m) { return m.cls; })));
  // Served-bow volleys counted: 2 fired of 3 engaged.
  let volleyFired = 0, engagedN = 0;
  for (const m of fa.classified) {
    if (m.cls.indexOf('engaged-') === 0) { engagedN++; if (m.volley && (m.volley.shots | 0) > 0) volleyFired++; }
  }
  check('served-bow volleys counted (2 fired / 3 engaged)', volleyFired === 2 && engagedN === 3, volleyFired + '/' + engagedN);
  check('evadeP independence: ammo-only difference replicates identically',
    analyzer.replicateEvadeP(mrow().evade) === analyzer.replicateEvadeP(mrow({ ammoAtEntry: 9 }).evade));
  check('evadeP replication matches the driver value 0.24', analyzer.replicateEvadeP(mrow().evade) === 0.24);

  // ---- 5. Analyzer selftest green from here ----
  const stFails = analyzer.selftest();
  check('analyzer --selftest green', stFails === 0, stFails + ' failures');

  // ---- 6. Live targets exist (the smoke seed proves the full path) ----
  const { Game } = await loadGame({ seed: 31031, mode: 'evadebow-a-test', fullTelemetry: false });
  await quietLog(async function () { await setupGame(Game); });
  check('live: Game.fieldFight is a function', typeof Game.fieldFight === 'function');
  check('live: Game.villagerStageBow is a function', typeof Game.villagerStageBow === 'function');
  check('live: Game.villagerPocketAmmo is a function', typeof Game.villagerPocketAmmo === 'function');
  let rosterN = 0;
  try { rosterN = ((Game.state || {}).village || {}).roster ? Game.state.village.roster.length : 0; } catch (e) {}
  check('live: roster non-empty after setup', rosterN > 0, 'roster=' + rosterN);

  console.log('\nEVADEBOW_TEST ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('failures: ' + fails.join('; ')); process.exit(1); }
}

function analyzeFileSafe(j) {
  // analyzeFile is exported; call it directly (no dir read).
  return analyzer.analyzeFile(j);
}

if (require.main === module) {
  main().catch(function (e) { console.error('EVADEBOW_TEST FATAL: ' + (e && e.stack || e)); process.exit(1); });
}
