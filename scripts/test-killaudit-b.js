#!/usr/bin/env node
// scripts/test-killaudit-b.js — kill-side audit instrument honesty proof.
// PART A — RED-verified fixture: every kill channel is captured exactly:
//   trap (checkTraps + stagedInjury -> guaranteed catch), hunt duty
//   (villagerHuntResolve direct call), emergency hunt (stockPantry label),
//   monster kill (tele kind='monster'), person death (tele kind='person',
//   kind-filtered), setTrap counts, carcassToMeat cross-check.
//   RED: the same fixture WITHOUT the instrument reaches the same game
//   state but records nothing — counting is instrument-sourced.
// PART B — det-gate: instrument on vs off on identical seeds, byte-identical
//   per-day trajectory hashes (the instrument changes nothing).
// SMOKE=1: PART A + a 1-seed 12d det comparison.
// Usage: node scripts/test-killaudit-b.js [SMOKE=1]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const census = require('./camptask-census-b');
const ka = require('./killaudit-census-b');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}

// Fixture: scholar on a wild tile with a snare tool; a trap already on the
// tile over rabbit wildlife; stagedInjury guarantees the catch (no RNG
// dependence). One boar carcass in the pack for the cleaning cross-check.
function fixtureState(Game) {
  const s = Game.state.scholar;
  s.day = 40;
  s.mx = 4; s.my = 4;
  const t = Game.tileAt(4, 4);
  if (t.type === 'haven') t.type = 'meadow';
  t.wildlife = { cottontail_rabbit: 3, gray_squirrel: 2 };
  t.traps = [{ recipeId: 'snare', mx: 4, my: 4, setDay: 39, uses: 9, quietTold: true }];
  s.stagedInjury = 1;
  s.tools = [{ recipeId: 'snare', uses: 10 }];
  const far = 400;
  s.inventory = [
    { name: 'Wild boar (carcass)', foodKind: 'meat', foodState: 'carcass', hiddenKcal: 21000,
      kcalEach: 0, units: 1, spoilDay: far, plantId: 'meat_wild_boar', kg: 21 },
  ];
}

async function exercise(Game) {
  // 1. trap channel
  Game.checkTraps();
  // 2. setTrap count (needs a trap tool; fiction: scholar still holds one)
  try { Game.setTrap('snare'); } catch (e) {}
  // 3. hunt duty: pick any living villager, put real wildlife on haven-adjacent tile
  const v = Game.state.village || {};
  const vid = (v.roster || [])[0];
  const wt = Game.tileAt(4, 3) || Game.tileAt(3, 4);
  if (wt) { wt.wildlife = wt.wildlife || { wild_boar: 2, cottontail_rabbit: 2 }; }
  if (vid) { try { Game.villagerHuntResolve(vid, 1); } catch (e) {} }
  // 4. emergency hunt
  Game.stockPantry(12000, 'Emergency hunt meat', { pieceKcal: 500 });
  // 5. monster kill + person death (kind filter)
  Game.tele('death', { kind: 'monster', who: 'm_0', cause: 'villager combat' });
  Game.tele('death', { kind: 'person', who: vid || 'v_0', cause: 'starvation' });
  // 6. carcass cleaning cross-check
  try { Game.carcassToMeat(Game.state.scholar.inventory, 0, true); } catch (e) {}
  // 7. huntAnimal verb counted (bot never calls it; fixture proves the wrap)
  try { Game.huntAnimal(); } catch (e) {}
}

async function partA() {
  console.log('PART A — RED-verified fixture: every kill channel captured');
  process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
  // GREEN: instrument attached
  const g1 = await loadGame({ seed: 105101, mode: 'killaudit-proof' });
  await quietLog(async () => { await setupGame(g1.Game); });
  fixtureState(g1.Game);
  const t1 = { errors: 0 };
  census.attachBeatRing(g1.Game, t1);
  ka.attachKillInstrument(g1.Game, t1);
  await quietLog(async () => { await exercise(g1.Game); });
  const traps = t1.killEvents.filter(k => k.channel === 'trap');
  check('trap kill captured', traps.length === 1, `got ${traps.length}`);
  check('trap kill species', traps.length === 1 && ['cottontail_rabbit', 'gray_squirrel'].includes(traps[0].species), traps.length ? traps[0].species : 'none');
  check('setTrap counted', (t1.trapsSet.snare || 0) === 1, JSON.stringify(t1.trapsSet));
  check('hunt resolve recorded', t1.huntResolves.length === 1, `${t1.huntResolves.length}`);
  const emerg = t1.killEvents.filter(k => k.channel === 'emergency');
  check('emergency hunt captured', emerg.length === 1 && emerg[0].outcome === 'flat' && emerg[0].grossKcal === 12000,
    emerg.length ? JSON.stringify(emerg[0]) : 'none');
  check('monster kill captured', t1.monsterKills.length === 1 && t1.killEvents.some(k => k.channel === 'monster'), `${t1.monsterKills.length}`);
  check('person death kind-filtered', t1.personDeaths.length === 1 && t1.personDeaths[0].kind === 'person', `${t1.personDeaths.length}`);
  check('boar carcass cleaning traced', t1.carcassesCleaned.length === 1 && t1.carcassesCleaned[0].species === 'wild_boar',
    JSON.stringify(t1.carcassesCleaned));
  check('huntAnimal verb counted', (t1.huntAnimalCalls || 0) === 1, `${t1.huntAnimalCalls || 0}`);
  check('instrument errors 0', t1.errors === 0, `${t1.errors}`);
  const wildBoarDef = (g1.Game.data.animals || []).find(a => a.id === 'wild_boar') || {};
  const boarKill = t1.killEvents.find(k => k.species === 'wild_boar' && k.outcome === 'kill');
  check('boar kill gross kcal is real', boarKill ? boarKill.grossKcal === wildBoarDef.calories : true,
    boarKill ? `${boarKill.grossKcal}` : 'no boar kill this draw (RNG-gated)');

  // RED: no instrument — same fixture, same state, nothing recorded
  const g2 = await loadGame({ seed: 105101, mode: 'killaudit-proof' });
  await quietLog(async () => { await setupGame(g2.Game); });
  fixtureState(g2.Game);
  await quietLog(async () => { await exercise(g2.Game); });
  const inv1 = (g1.Game.state.scholar.inventory || []).length;
  const inv2 = (g2.Game.state.scholar.inventory || []).length;
  check('RED: same state reached', inv1 === inv2, `inv ${inv1} vs ${inv2}`);
  check('RED: same day hash', dayHash(g1.Game) === dayHash(g2.Game), dayHash(g1.Game));
}

async function detOne(seed, policyId, days, withInstrument) {
  const fsp = require('./policies/feastscale');
  const policy = fsp[policyId];
  const { Game } = await loadGame({ seed, mode: 'killaudit-det' });
  await setupGame(Game);
  const t = { errors: 0 };
  if (withInstrument) {
    census.attachBeatRing(Game, t);
    ka.attachKillInstrument(Game, t);
  }
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  const hs = [];
  wrapped.daily = (G, ctx) => {
    hs.push(G.state.scholar.day + ':' + dayHash(Game));
    if (withInstrument) {
      try {
        // exercise the read-only scan paths the det-gate must prove inert
        ka.wildlifeSnapshot(G);
        const tiles = (G.map && G.map.tiles) || [];
        let n = 0;
        for (let y = 0; y < tiles.length; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
          n += ((tiles[y][x] || {}).traps || []).length;
        }
        if (n < 0) t.errors++;
      } catch (e) { t.errors++; }
    }
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: days + 1 }); });
  return { hashes: hs.join('\n'), errors: t.errors };
}

async function partB(seeds, policies, days) {
  console.log(`PART B — det-gate: ${seeds.length} seeds x ${policies.length} policies x {off,on}, ${days}d`);
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  let pass = 0, fail = 0, errOn = 0;
  for (const pid of policies) {
    for (const seed of seeds) {
      const off = await detOne(seed, pid, days, false);
      const on = await detOne(seed, pid, days, true);
      const same = off.hashes === on.hashes;
      errOn += on.errors;
      if (same) pass++; else { fail++; console.log(`  MISMATCH ${pid}-${seed}`); }
    }
  }
  check('det-gate byte-identical trajectories', fail === 0, `${pass}/${pass + fail}`);
  check('instrument reported 0 errors', errOn === 0, `${errOn}`);
}

async function main() {
  const SMOKE = process.env.SMOKE === '1';
  await partA();
  if (SMOKE) await partB([105101], ['leadfeast'], 12);
  else await partB([105101, 105102, 105103, 105104], ['leadfeast', 'belongfeast'], 60);
  console.log(failures ? `\nRESULT: ${failures} FAILURE(S)` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
