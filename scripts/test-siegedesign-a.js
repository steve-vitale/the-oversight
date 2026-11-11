#!/usr/bin/env node
// scripts/test-siegedesign-a.js — substrate proof for the siege design note.
//
// The coverage program lists siege as SUBSTRATE-MISSING: no siege system
// exists to measure. This test pins that claim mechanically, so a later run
// can re-run it and catch drift. It asserts BOTH directions:
//   (1) the siege-adjacent substrate the design builds on EXISTS and is wired
//       (raid/linger/gorge/sortie/shelter/aid chain, THE SIEGE + BREACH beats,
//       the siege contest, the unbreakable-haven law); and
//   (2) a siege SYSTEM does NOT exist (no siege state, trigger, phase, or
//       drive-off verb; the word "siege" lives in exactly the ten known files).
// If a siege system ever lands, the absence assertions FAIL LOUDLY on purpose:
// update this test to the new substrate (that is the point — do not delete it).
//
// Run: node scripts/test-siegedesign-a.js
// Writes nothing into the repo.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');
const fails = [];
const passes = [];
function check(name, cond, detail) {
  const okk = !!cond;
  (okk ? passes : fails).push(name);
  console.log(`  ${okk ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}
function src(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

async function main() {
  const { Game } = await loadGame({ seed: 417, mode: 'siegedesign-proof' });
  await quietLog(async () => { await setupGame(Game); });

  console.log('A. Siege-adjacent substrate EXISTS (runtime, loaded game):');
  // Shelter / muster verb (sim-siegeroster's missing verb, built 2026-10-16/17).
  for (const fn of ['shelterVillagers', 'shelterEveryoneBut', 'releaseShelter',
    'shelterAllClear', 'isSheltered', 'shelteredVillagers', 'shelterThreatNearHaven',
    'shelterMusterCheck', 'shelterMuster', 'shelterStandDown']) {
    check(`shelter: Game.${fn} is a function`, typeof Game[fn] === 'function');
  }
  // Raid / lingerer / gorge machinery.
  for (const fn of ['havenRaidTick', 'havenGrowthDaily', 'lingeringRaiders',
    'lingerKeyFor', 'answerLingerer', 'lingererSortie', 'raidPillage']) {
    check(`raid: Game.${fn} is a function`, typeof Game[fn] === 'function');
  }
  // Aid chain.
  for (const fn of ['raiseAidCrisis', 'resolveAidCrisis', 'callForHelp', 'aidCrisis']) {
    check(`aid: Game.${fn} is a function`, typeof Game[fn] === 'function');
  }
  // Crisis beats + dedupe (behavioral, not source grep).
  check('crisis: Game.fireCrisis is a function', typeof Game.fireCrisis === 'function');
  check('crisis: fireCrisis(the-siege) fires once', Game.fireCrisis('the-siege') === true);
  check('crisis: fireCrisis(the-siege) dedupes (second call false)', Game.fireCrisis('the-siege') === false);
  check('crisis: progState records the-siege', Game.progState().crises['the-siege'] === true);
  check('crisis: fireCrisis(breach) fires once', Game.fireCrisis('breach') === true);
  check('crisis: fireCrisis(breach) dedupes', Game.fireCrisis('breach') === false);
  // Siege contest (a televised contest, not a village siege — same word).
  const siegeContest = (Game.data.contests || []).find(c => c && c.id === 'siege');
  check('contest: data has a siege contest', !!siegeContest, siegeContest ? siegeContest.name : 'missing');
  check('contest: siege contest is blood/extreme', siegeContest && siegeContest.cat === 'blood' && siegeContest.risk === 'extreme');
  check('contest: Game._contestSiege is a function', typeof Game._contestSiege === 'function');
  // Shelter gate reads quiet with no apex threat on the fresh game.
  let threat = 'unset';
  try { threat = Game.shelterThreatNearHaven(); } catch (e) { threat = 'threw: ' + e.message; }
  check('shelter: no apex threat near Haven on a fresh game', threat === null, JSON.stringify(threat));
  let muster = null;
  try { muster = Game.shelterMusterCheck(); } catch (e) { muster = { threw: e.message }; }
  check('shelter: muster check stands down with no threat', muster && muster.mustered === false, JSON.stringify(muster));
  check('shelter: no villagers sheltered on a fresh game',
    Array.isArray(Game.shelteredVillagers()) && Game.shelteredVillagers().length === 0);
  // Haven law: destroyCell exists (the unbreakable list itself is source-pinned below).
  check('haven: Game.destroyCell is a function', typeof Game.destroyCell === 'function');
  check('haven: havenTier() reads a number', typeof Game.havenTier() === 'number');

  console.log('B. A siege SYSTEM does NOT exist (absence assertions — fail loudly if one lands):');
  check('absent: no Game.startSiege', typeof Game.startSiege === 'undefined');
  check('absent: no Game.siegeTrigger', typeof Game.siegeTrigger === 'undefined');
  check('absent: no Game.siegeState', typeof Game.siegeState === 'undefined');
  check('absent: no Game.siegePhase', typeof Game.siegePhase === 'undefined');
  check('absent: no Game.endSiege', typeof Game.endSiege === 'undefined');
  check('absent: no Game.breakSiege', typeof Game.breakSiege === 'undefined');
  check('absent: no state.siege key', !Game.state || Game.state.siege === undefined);
  check('absent: no state.siegeEpisodes', !Game.state || Game.state.siegeEpisodes === undefined);
  check('absent: no village.siege key',
    !Game.state.village || Game.state.village.siege === undefined);

  console.log('C. Source pins (drift-catchers for the cited lines):');
  const prog = src('src/js/progression.js');
  check('src: progression.js defines the-siege beat', prog.includes("'the-siege'"));
  check('src: progression.js defines breach beat', prog.includes("'breach'"));
  const gameJs = src('src/js/game.js');
  check('src: destroyCell unbreakable list pins haven cells',
    gameJs.includes("const unbreakable = ['hall', 'bunk', 'door', 'haven', 'sanct', 'base', 'lodge'];"));
  check('src: destroyCell says Havens do not break',
    gameJs.includes('Havens do not break'));
  check('src: lingerer restore keeps the siege on a fled fight',
    gameJs.includes("It didn't leave — you did. The treeline holds its shape; the siege goes on."));
  const hg = src('src/js/havenGrowth.js');
  check('src: gorge take is 500–1500 kcal/night',
    hg.includes('500 + Math.floor'));
  check('src: lingerer drift valve is ~6 nights', hg.includes('> 6'));
  check('src: sortie costs 2000 kcal/fighter', hg.includes('rationEach = 2000'));
  check('src: sortie kills feed the wave ledger',
    hg.includes("recordWaveKill(m.id, leader, 'sortie'"));
  check('src: palisade takes 25% wall damage', hg.includes('* 0.25'));
  check('src: palisade tier is named The Palisade', hg.includes("name: 'The Palisade'"));
  const shelter = src('src/js/shelter.js');
  check('src: muster hysteresis (stand down past radius 3)',
    shelter.includes('shelterStoodDown'));
  check('src: scholar never auto-sheltered',
    shelter.includes('the scholar is the player'));
  // The siege footprint: exactly the ten known files mention siege/besiege.
  const jsDir = path.join(ROOT, 'src', 'js');
  const hitFiles = fs.readdirSync(jsDir)
    .filter(f => f.endsWith('.js'))
    .filter(f => /siege|besiege/i.test(fs.readFileSync(path.join(jsDir, f), 'utf8')))
    .sort();
  const expected = ['app.js', 'comms.js', 'contestEngine.js', 'contests.js', 'game.js',
    'godverbs.js', 'havenGrowth.js', 'progression.js', 'safetynets.js', 'shelter.js'].sort();
  check('src: siege footprint is exactly the ten known files',
    JSON.stringify(hitFiles) === JSON.stringify(expected),
    'got: ' + hitFiles.join(', '));

  console.log('D. Canon pins:');
  check('canon: NO dedicated docs/SIEGE.md', !fs.existsSync(path.join(ROOT, 'docs', 'SIEGE.md')));
  check('canon: MONSTER-WAVES.md scaffolds the wave-6 siege',
    src('docs/MONSTER-WAVES.md').includes('the siege leads to the egg'));
  check('canon: DECISIONS.md states the unbreakable law',
    src('docs/DECISIONS.md').includes('Havens are the ONLY unbreakable structures'));
  check('canon: SCALE.md prices refuse-the-scale with no league for late waves',
    src('docs/SCALE.md').includes('league to call when the late waves come'));

  console.log(`\n${passes.length} passed, ${fails.length} failed.`);
  if (fails.length) {
    console.log('FAILED: ' + fails.join(' | '));
    process.exit(1);
  }
  console.log('siegedesign substrate proof: GREEN');
}

main().catch(e => { console.error(e); process.exit(1); });
