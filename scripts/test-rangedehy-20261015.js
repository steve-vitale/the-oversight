#!/usr/bin/env node
// test-rangedehy-20261015.js — proof test for the RANGING-DEHYDRATION
// diagnostic instrument (ARM 3, loop B, 2026-10-15, sim-findings #290).
// INSTRUMENT ONLY — scripts/rangedehy-lib-20261015.js; zero src/js changes.
//
// PART A (fixture, seed 11): forced SCHOLAR dehydration death AWAY from
//   haven -> attributed EXACTLY ONCE, fully attributed, ranging=true,
//   mapDist>1, trajectory3d=3, departure computed. Cause split: a forced
//   villager 'thirst' registerDeath must NOT attribute as dehydration.
// PART B (fixture, seed 22): forced dehydration death AT haven ->
//   ranging=false, neverAway, water verbs (fill/drink) counted, one
//   refused fill captured ("The cistern is dry").
// PART C (live honesty): armed-vs-pristine det-gate, seeds 11/22, 40d
//   belongseek — per-day state hashes BYTE-IDENTICAL.
// PART D (SMOKE): 15d competent — policy.daily fires >=10x, >=1 dehydration
//   attribution observed in the fixture suite, zero instrument errors.
//
// RED-verification (never stash on the shared repo): a breaking patch
// (~/workspace/rangedehy-red-20261015.patch) swaps the attribution gate
// cause to a never-matching string; with it applied PART A/B attribution
// checks must FAIL (real RED); restored, all must pass (GREEN).
//
// Usage: node scripts/test-rangedehy-20261015.js
//        SMOKE=1 node scripts/test-rangedehy-20261015.js   # PART D only
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.error('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// Neutralize cheat-death mechanics so the fixture death is honest.
function neutralizeCheats(Game) {
  const s = Game.state.scholar || {};
  try {
    if (Game.hasAbility && Game.hasAbility('second_wind')) { s.secondWindDay = s.day; s.secondWindUses = 99; }
    if (Game.hasAbility && Game.hasAbility('molt')) { s.moltWeek = Math.floor(s.day / 7); s.moltUses = 99; }
    if (Game.state.phoenixLink) Game.state.phoenixLink = null;
  } catch (e) {}
}

function forceDehydration(Game) {
  const s = Game.state.scholar;
  s.kcal = 5000; s.energy = 50;      // not starving: dehydration alone kills
  s.hydration = 0; s.health = 10;    // -12 health overnight -> dead
  neutralizeCheats(Game);
}

async function partA() {
  console.log('PART A — forced dehydration death AWAY from haven (seed 11)');
  const { Game } = await loadGame({ seed: 11, mode: 'rangedehy-fixture-a', fullTelemetry: false });
  await setupGame(Game);
  const track = installRangeDehy(Game);
  await quietLog(async () => { await runDays(Game, competent, { days: 5 }); });
  const dayBefore = track.daily.length;
  check('dawn snapshots recorded (>=5)', dayBefore >= 5, 'n=' + dayBefore);
  // teleport the scholar far from haven (haven tile defaults 4,4)
  Game.map.px = 0; Game.map.py = 0;
  forceDehydration(Game);
  const nDeaths0 = track.deaths.length;
  await quietLog(async () => { Game.endDay(); });
  check('exactly one dehydration attribution', track.deaths.length === nDeaths0 + 1,
    'n=' + (track.deaths.length - nDeaths0));
  const d = track.deaths[track.deaths.length - 1];
  check('attribution record exists (non-vacuous fixture)', !!d);
  if (d) {
  check('fully attributed', d.fullyAttributed === true, 'missing=' + JSON.stringify(d.missingSlots));
  check('ranging (away from haven)', d.ranging === true && d.atHaven === false, 'mapDist=' + d.mapDist);
  check('mapDist > 1', (d.mapDist || 0) > 1, 'mapDist=' + d.mapDist);
  check('death day-part is a real day part', ['dawn', 'midday', 'dusk', 'night'].includes(d.deathDayPart), d.deathDayPart);
  check('trajectory has 3 snapshots', d.trajectory3d.length === 3, 'n=' + d.trajectory3d.length);
  check('trajectory hydration slots present', d.trajectory3d.every(t => t.hydration !== null && t.hydration !== undefined));
  check('departure computed', d.departure && d.departure.slotComputed === true, JSON.stringify(d.departure));
  check('departure cistern slot present', d.departure.cisternAtDepart && d.departure.cisternAtDepart.clean !== null,
    JSON.stringify(d.departure.cisternAtDepart));
  check('pack water slot present', d.packWater && d.packWater.liters !== null, JSON.stringify(d.packWater));
  check('water duty slot present', d.waterDuty && d.waterDuty.n !== null, JSON.stringify(d.waterDuty));
  check('beats captured for sense-test', d.beats && d.beats.length > 0, 'n=' + (d.beats || []).length);
  } // end if (d) — Part A attribution detail checks
  // cause split: a villager 'thirst' death must NOT attribute as dehydration
  const v = Game.state.village || {};
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  const nDehy = track.deaths.length, nOther0 = track.otherDeaths.length;
  let thirstThrew = false;
  try {
    Game.registerDeath({ kind: 'villager', villagerId: vid, name: 'Thirst Fixture', cause: 'thirst', killerId: null });
  } catch (e) { thirstThrew = true; }
  check('villager thirst death does not attribute as dehydration',
    track.deaths.length === nDehy, 'dehy=' + track.deaths.length);
  check('villager thirst death recorded in otherDeaths (or pipeline threw)',
    track.otherDeaths.length === nOther0 + 1 || thirstThrew,
    'other=' + track.otherDeaths.length + ' threw=' + thirstThrew);
  check('no instrument errors', track.instrErrors.length === 0, JSON.stringify(track.instrErrors.slice(0, 3)));
}

async function partB() {
  console.log('PART B — forced dehydration death AT haven + water verbs (seed 22)');
  const { Game } = await loadGame({ seed: 22, mode: 'rangedehy-fixture-b', fullTelemetry: false });
  await setupGame(Game);
  const track = installRangeDehy(Game);
  await quietLog(async () => { await runDays(Game, competent, { days: 4 }); });
  // water verbs: fill at the haven well, drink, then a refused fill
  Game.location = 'haven';
  Game.state.village.water = { clean: 10, dirty: 0 };
  Game.state.scholar.water = [];
  Game.state.scholar.hydration = 40;
  const v0 = track.verbs.length;
  Game.fillWater();
  const fillEntry = track.verbs[track.verbs.length - 1];
  const packAfterFill = (Game.state.scholar.water || []).length;
  Game.drinkWater();
  Game.state.village.water = { clean: 0, dirty: 0 };
  Game.fillWater(); // refused: cistern dry
  const refuseEntry = track.verbs[track.verbs.length - 1];
  check('fill+drink+refused-fill recorded', track.verbs.length === v0 + 3, 'n=' + (track.verbs.length - v0));
  check('successful fill not refused', fillEntry.verb === 'fillWater' && fillEntry.refused === null,
    JSON.stringify(fillEntry));
  check('pack gained the bottle', packAfterFill >= 1, 'n=' + packAfterFill);
  check('drink recorded', track.verbs.some(e => e.verb === 'drinkWater'), JSON.stringify(track.verbs.map(e => e.verb)));
  check('dry-cistern fill refused honestly', refuseEntry.refused === 'The cistern is dry',
    JSON.stringify(refuseEntry.refused));
  // now the death, at haven
  forceDehydration(Game);
  const nDeaths0 = track.deaths.length;
  await quietLog(async () => { Game.endDay(); });
  check('exactly one dehydration attribution', track.deaths.length === nDeaths0 + 1);
  const d = track.deaths[track.deaths.length - 1];
  check('attribution record exists (non-vacuous fixture)', !!d);
  if (d) {
  check('fully attributed', d.fullyAttributed === true, 'missing=' + JSON.stringify(d.missingSlots));
  check('NOT ranging (at haven)', d.ranging === false && d.atHaven === true, 'mapDist=' + d.mapDist);
  check('mapDist <= 1', (d.mapDist || 0) <= 1, 'mapDist=' + d.mapDist);
  check('departure: never away', d.departure && d.departure.neverAway === true, JSON.stringify(d.departure));
  check('verbsAll counted', track.verbs.length >= 3, 'n=' + track.verbs.length);
  check('verbs3d non-empty', d.verbs3d.length >= 3, 'n=' + d.verbs3d.length);
  check('refused fills counted', d.refusedFills.length >= 1, JSON.stringify(d.refusedFills));
  }
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}

async function partC() {
  console.log('PART C — instrument honesty: armed-vs-pristine det-gate (seeds 11/22, 40d)');
  async function runHashes(seed, withInstr) {
    const { Game } = await loadGame({ seed, mode: 'rangedehy-h' + seed + (withInstr ? '1' : '0'), fullTelemetry: false });
    await setupGame(Game);
    let track = null;
    if (withInstr) track = installRangeDehy(Game);
    const hs = [];
    const od = Game.endDay.bind(Game);
    Game.endDay = function () {
      const r = od.apply(this, arguments);
      try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); }
      return r;
    };
    await quietLog(async () => { await runDays(Game, belongseek, { days: 40 }); });
    return hs;
  }
  for (const seed of [11, 22]) {
    const [h0, h1] = [await runHashes(seed, false), await runHashes(seed, true)];
    const same = h0.length === h1.length && h0.every((h, i) => h === h1[i]);
    check(`byte-identical armed-vs-pristine seed ${seed} (40d)`, same,
      same ? h0.length + ' days' : ('pristine=' + h0.length + ' armed=' + h1.length));
  }
}

async function partD() {
  console.log('PART D (SMOKE) — policy drives, instrument measures');
  const { Game } = await loadGame({ seed: 44, mode: 'rangedehy-smoke', fullTelemetry: false });
  await setupGame(Game);
  const track = installRangeDehy(Game);
  let dailyCalls = 0;
  const od = competent.daily;
  const policy = Object.assign({}, competent);
  policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: 15 }); });
  check('policy.daily fires >= 10x', dailyCalls >= 10, 'calls=' + dailyCalls);
  check('dawn snapshots recorded', track.daily.length >= 10, 'n=' + track.daily.length);
  check('no instrument errors', track.instrErrors.length === 0, JSON.stringify(track.instrErrors.slice(0, 3)));
}

async function main() {
  const smokeOnly = process.env.SMOKE === '1';
  try {
    if (!smokeOnly) {
      await partA();
      await partB();
    }
    await partD();
    if (!smokeOnly) await partC();
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main();
