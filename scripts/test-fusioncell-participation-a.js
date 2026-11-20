#!/usr/bin/env node
// scripts/test-fusioncell-participation-a.js — proof test, arm
// sim-fusioncell-participation-a (the participation diag: who leads a
// wave-4+ fight, and why an armed party flees).
//
// Proves the participation instrument: the lead-rule classifier on
// fixture stacks, the flee-cause classifier on fixture fight
// records, and — live — that an ally's searcaster NEVER volleys:
// the volley is the lead fighter's only (fieldFights.js ~975-1060
// reads vp's ranged weapon and vp's own items; no ally-volley code
// path exists). The live proof stages an armed ally beside a
// bow lead (allyFromStart, so the ally is in the fight from round
// 1, striking in melee) and shows the ally's cells unconsumed while
// the lead's bow volley fires — plus the control where the LEAD
// holds the searcaster and the volley spends their cells.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): geared wave-4
// hunters with a party behind them, never a fresh solo scholar.
//
// Usage: node scripts/test-fusioncell-participation-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { classifyLeadRule, classifyFleeCause, leadGearOf, ammoCountOf } = require('./fusioncell-participation-driver-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
function fakeStack(fn, file) {
  return 'Error\n    at ' + fn + ' (' + file + ':123:45)\n    at fieldFight (src/js/fieldFights.js:480:10)\n    at Object.<anonymous> (scripts/sim-harness.js:10:5)';
}

async function main() {
  // ---- 1. classifyLeadRule on fixture stacks ----
  check('leadRule expeditionMonster -> expedition-holder',
    classifyLeadRule(fakeStack('expeditionMonster', 'src/js/villager-agency.js')) === 'expedition-holder');
  check('leadRule resolveWildMonsterEncounter -> world-tick',
    classifyLeadRule(fakeStack('resolveWildMonsterEncounter', 'src/js/game.js')) === 'world-tick');
  check('leadRule resolvePatrol -> patrol',
    classifyLeadRule(fakeStack('resolvePatrol', 'src/js/game.js')) === 'patrol');
  check('leadRule aidFight -> aid',
    classifyLeadRule(fakeStack('aidFight', 'src/js/game.js')) === 'aid');
  check('leadRule lingererSortie -> sortie-leader',
    classifyLeadRule(fakeStack('lingererSortie', 'src/js/havenGrowth.js')) === 'sortie-leader');
  check('leadRule alienPlayers file -> alien-leader',
    classifyLeadRule(fakeStack('apFight', 'src/js/alienPlayers.js')) === 'alien-leader');
  check('leadRule contestEngine file -> contest',
    classifyLeadRule(fakeStack('contestFight', 'src/js/contestEngine.js')) === 'contest');
  check('leadRule nomad file -> nomad',
    classifyLeadRule(fakeStack('wildFight', 'src/js/nomad-wild.js')) === 'nomad');
  check('leadRule unknown caller -> other:<fn> (named, counts as attributed)',
    classifyLeadRule(fakeStack('mysteryCaller', 'src/js/game.js')) === 'other:mysteryCaller');
  check('leadRule empty stack -> unclassified',
    classifyLeadRule('Error\n') === 'unclassified');
  check('leadRule null stack -> unclassified (never throws)',
    classifyLeadRule(null) === 'unclassified' || classifyLeadRule('') === 'unclassified');

  // ---- 2. classifyFleeCause on fixture fight records ----
  const base = { outcome: 'vFlee', rounds: 4, log: [] };
  check('fleeCause non-flee -> null',
    classifyFleeCause(Object.assign({}, base, { outcome: 'vKill' })) === null);
  check('fleeCause hopeless alone (no help called)',
    classifyFleeCause(Object.assign({}, base, { fleeHopeless: true, fleeHpFrac: 0.3 })) === 'hopeless-alone');
  check('fleeCause hopeless after help (calledHelp)',
    classifyFleeCause(Object.assign({}, base, { fleeHopeless: true, fleeHpFrac: 0.3, calledHelp: true })) === 'hopeless-after-help');
  check('fleeCause hopeless after help (shoutRound set)',
    classifyFleeCause(Object.assign({}, base, { fleeHopeless: true, fleeHpFrac: 0.3, shoutRound: 2 })) === 'hopeless-after-help');
  check('fleeCause floor-hp (no hopeless flag, hp frac present)',
    classifyFleeCause(Object.assign({}, base, { fleeHopeless: false, fleeHpFrac: 0.12 })) === 'floor-hp');
  check('fleeCause learn-withdrawal (fleeLearn, not hopeless)',
    classifyFleeCause(Object.assign({}, base, { fleeLearn: true, fleeHpFrac: 0.8 })) === 'learn-withdrawal');
  check('fleeCause learn + hopeless -> hopeless-alone (trajectory decided it)',
    classifyFleeCause(Object.assign({}, base, { fleeLearn: true, fleeHopeless: true, fleeHpFrac: 0.3 })) === 'hopeless-alone');
  check('fleeCause committed-finish floor (log line beats the hp frac)',
    classifyFleeCause(Object.assign({}, base, { fleeHpFrac: 0.35, log: ['x is past holding even a finished fight — they run while running still works. (Committed-finish floor)'] })) === 'committed-finish-floor');
  check('fleeCause wise-leave (fleeWise beats hopeless)',
    classifyFleeCause(Object.assign({}, base, { fleeWise: true, fleeHopeless: true })) === 'wise-leave');
  check('fleeCause bare vFlee -> unclassified',
    classifyFleeCause(Object.assign({}, base, {})) === 'unclassified');
  check('fleeCause null rec -> null (never throws)',
    classifyFleeCause(null) === null);

  // ---- 3. live: an ally's searcaster never volleys ----
  const { Game } = await loadGame({ seed: 7, mode: 'fusioncell-participation-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  console.log('fighter=' + vid + ' ally=' + vid2 + ' roster=' + roster.length);
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; }) || (Game.data.monsters || [])[0];

  // Lead with a bow, ally with a searcaster + 4 cells, ally in from round 1.
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 1.0 },
    { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
  Game.villagerGearUp(vid, true);
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 4, kg: 0.4 }];
  Game.villagerGearUp(vid2, true);
  const allyCellsBefore = ammoCountOf(p2.items, 'fusion_cell');
  const leadArrowsBefore = ammoCountOf(p.items, 'arrow');
  let recA = null;
  try { recA = Game.fieldFight(vid, mdef, null, { allies: 1, allyVids: [vid2], allyFromStart: true }); }
  catch (e) { console.log('fieldFight error: ' + e.message); }
  check('ally joined from round 1 (allyVid set)', recA && recA.allyVid === vid2, JSON.stringify(recA && recA.allyVid));
  check('ally fought in melee (allyDealt > 0 — they were in the fight, not watching)',
    recA && (recA.allyDealt | 0) > 0, 'allyDealt=' + (recA && recA.allyDealt));
  check('lead bow volley fired (shots > 0)', recA && recA.volley && recA.volley.shots > 0,
    JSON.stringify(recA && recA.volley));
  check('lead arrows spent exactly the volley shots',
    recA && recA.volley && ammoCountOf(p.items, 'arrow') === leadArrowsBefore - recA.volley.shots,
    'left=' + ammoCountOf(p.items, 'arrow') + ' shots=' + (recA && recA.volley && recA.volley.shots));
  check('ally searcaster cells UNCONSUMED (4 -> 4: the ally never volleys)',
    allyCellsBefore === 4 && ammoCountOf(p2.items, 'fusion_cell') === 4,
    'before=' + allyCellsBefore + ' after=' + ammoCountOf(p2.items, 'fusion_cell'));
  check('ally searcaster never named as firing in the log',
    recA && !(recA.log || []).some(function (s) { return /searcaster/i.test(String(s)) && /loosed/i.test(String(s)); }),
    JSON.stringify((recA && recA.log) || []));

  // ---- 4. live control: the LEAD holding the searcaster DOES volley ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 4, kg: 0.4 }];
  Game.villagerGearUp(vid, true);
  resetVillager(Game, p2);
  p2.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 1.0 },
    { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
  Game.villagerGearUp(vid2, true);
  let recB = null;
  try { recB = Game.fieldFight(vid, mdef, null, { allies: 1, allyVids: [vid2], allyFromStart: true }); }
  catch (e) { console.log('fieldFight error: ' + e.message); }
  check('lead searcaster volleys (shots > 0)', recB && recB.volley && recB.volley.shots > 0,
    JSON.stringify(recB && recB.volley));
  check('lead searcaster volley spends exactly its shots in cells',
    recB && recB.volley && ammoCountOf(p.items, 'fusion_cell') === 4 - recB.volley.shots,
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' shots=' + (recB && recB.volley && recB.volley.shots));
  check('lead searcaster volley hits land 64-68 per hit',
    recB && recB.volley && recB.volley.hits > 0 && recB.volley.dmg >= 64 * recB.volley.hits && recB.volley.dmg <= 68 * recB.volley.hits,
    JSON.stringify(recB && recB.volley));
  check('ally bow arrows UNCONSUMED in the control (the ally never volleys either way)',
    ammoCountOf(p2.items, 'arrow') === 5,
    'ally arrows left=' + ammoCountOf(p2.items, 'arrow'));

  // ---- 5. leadGearOf reads the flee inputs ----
  const lg = leadGearOf(Game, vid);
  check('leadGearOf returns bravery + temper + gear', lg && typeof lg.bravery === 'number' &&
    typeof lg.temper === 'string' && typeof lg.armorP === 'number' && typeof lg.weaponB === 'number',
    JSON.stringify(lg));

  console.log('FUSIONCELL-PARTICIPATION_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('FUSIONCELL-PARTICIPATION_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
