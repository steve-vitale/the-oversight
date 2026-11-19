#!/usr/bin/env node
// scripts/test-bowsource-a.js — proof test, arm sim-bowsource-a (finding #2592).
//
// Proves the bow-supply recorder: the driver (bowsource-driver-a.js)
// captures bow acquisitions by source (tele weapon_craft /
// villager_gear events, villagerKillLoot drops, daily census +
// day-1 baseline, all-departures source check) and the analyzer
// (analyze-bowsource-a.js) attributes every bow appearance to
// exactly one source. Pure helpers are tested on fixtures; the
// recorder is proven on a short LIVE smoke (1 seed, 5 days,
// competent policy) and the live corpus is fed through the analyzer
// to prove driver→analyzer interop.
//
// Usage: node scripts/test-bowsource-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (smoke corpus goes to os.tmpdir());
// prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
process.env.DAYS = '5';
process.env.SENSEEXPED = '1'; // sweep substrate (landed successor to LAUNCHPARTY; see prereg addendum)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const REPO = path.join(__dirname, '..');
const drv = require('./bowsource-driver-a');
const ana = require('./analyze-bowsource-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- 1. Pure helpers (driver exports) ----
  check('RANGED_FROZEN lists the 8 ranged weapons',
    JSON.stringify(drv.RANGED_FROZEN.slice().sort()) === JSON.stringify(['apex_bow', 'bow', 'crossbow', 'crude_bow', 'phase_sling', 'searcaster', 'sling', 'starfall_bow']));
  check('frozen bow recipe is wood 1 + vine 2', JSON.stringify(drv.BOW_RECIPE_FROZEN.bow) === JSON.stringify({ wood: 1, vine: 2 }));
  check('frozen crude_bow recipe is branch 1 + vine 1', JSON.stringify(drv.BOW_RECIPE_FROZEN.crude_bow) === JSON.stringify({ branch: 1, vine: 1 }));
  check('hasMats covers exact needs', drv.hasMats({ wood: 1, vine: 2 }, { wood: 1, vine: 2 }) === true);
  check('hasMats fails on a short material', drv.hasMats({ wood: 1, vine: 1 }, { wood: 1, vine: 2 }) === false);
  check('hasMats reads a missing key as 0', drv.hasMats({}, { wood: 1 }) === false);
  check('hasMats passes an empty need', drv.hasMats({}, {}) === true);
  const c1 = drv.craftableBow(true, false, { wood: 1 }, { vine: 2 }, null);
  check('craftable bow from own wood + pile vine', c1.bow === true && c1.crude === false && c1.any === true, JSON.stringify(c1));
  const c2 = drv.craftableBow(false, true, { branch: 1, vine: 1 }, {}, null);
  check('craftable crude_bow from own materials alone', c2.bow === false && c2.crude === true && c2.any === true, JSON.stringify(c2));
  const c3 = drv.craftableBow(true, true, {}, {}, null);
  check('no materials means nothing craftable', c3.bow === false && c3.crude === false && c3.any === false, JSON.stringify(c3));
  const c4 = drv.craftableBow(false, false, { wood: 9, vine: 9, branch: 9 }, { wood: 9, vine: 9 }, null);
  check('no knowledge means nothing craftable (materials do not teach)', c4.any === false, JSON.stringify(c4));
  const c5 = drv.craftableBow(true, false, { wood: 1, vine: 2 }, {}, { bow: { wood: 2, vine: 2 }, crude_bow: { branch: 1, vine: 1 } });
  check('live recipes override the frozen ones (wood 2 needed, has 1)', c5.bow === false, JSON.stringify(c5));
  check('isVolleyDef true for an ammo-bearing def', drv.isVolleyDef({ weapon: { type: 'ranged', ammo: 'arrow' } }) === true);
  check('isVolleyDef false for a spear (melee, range 2, no ammo)', drv.isVolleyDef({ weapon: { type: 'melee', range: 2 } }) === false);
  check('isRangedDef true for type ranged, false for a spear', drv.isRangedDef({ weapon: { type: 'ranged', ammo: 'arrow' } }) === true && drv.isRangedDef({ weapon: { type: 'melee', range: 2 } }) === false);
  check('defOfId finds by id and nulls on a miss',
    drv.defOfId([{ id: 'bow' }, { id: 'arrow' }], 'bow').id === 'bow' && drv.defOfId([{ id: 'bow' }], 'nope') === null);

  // ---- 2. Live data agrees with the frozen lists ----
  const { Game } = await loadGame({ seed: 7, mode: 'bowsource-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const liveRanged = (Game.data.items || []).filter(function (i) { return i.weapon && i.weapon.type === 'ranged'; }).map(function (i) { return i.id; }).sort();
  check('live items.json ranged set equals RANGED_FROZEN', JSON.stringify(liveRanged) === JSON.stringify(drv.RANGED_FROZEN.slice().sort()),
    'live=' + JSON.stringify(liveRanged));
  const liveRecipes = {};
  for (const r of (Game.data.recipes || [])) if (r.id === 'bow' || r.id === 'crude_bow') liveRecipes[r.id] = r.materials;
  check('live bow recipe is wood 1 + vine 2', JSON.stringify(liveRecipes.bow) === JSON.stringify({ wood: 1, vine: 2 }), JSON.stringify(liveRecipes));
  check('live crude_bow recipe is branch 1 + vine 1', JSON.stringify(liveRecipes.crude_bow) === JSON.stringify({ branch: 1, vine: 1 }), JSON.stringify(liveRecipes));
  const liveBow = (Game.data.items || []).find(function (i) { return i.id === 'bow'; });
  check('live bow def carries ammo arrow (volley-capable)', !!(liveBow && liveBow.weapon && liveBow.weapon.ammo === 'arrow'), JSON.stringify(liveBow && liveBow.weapon));
  const liveSpear = (Game.data.items || []).find(function (i) { return i.id === 'hunting_spear'; });
  check('live hunting_spear is melee range 2 with no ammo', !!(liveSpear && liveSpear.weapon && liveSpear.weapon.type === 'melee' && liveSpear.weapon.range === 2 && !liveSpear.weapon.ammo),
    JSON.stringify(liveSpear && liveSpear.weapon));

  // ---- 3. LIVE smoke: 1 seed, 5 days, competent policy ----
  // oneRun reads DAYS at require time (set to 5 above). The smoke
  // proves the recorder writes its rows on live code with 0
  // instrument errors; the analyzer then reads the live corpus.
  const out = await drv.oneRun(107001);
  check('smoke ran 5 days', out.days === 5 && out.gameDays >= 5, 'days=' + out.days + ' gameDays=' + out.gameDays);
  check('smoke instrument errors are 0', (out.instrumentErrors || []).length === 0, JSON.stringify(out.instrumentErrors));
  check('smoke ran with BOWOPEN off (flag-off proof)', out.bowopenOn === false && out.bowOpen === null, JSON.stringify({ on: out.bowopenOn, counters: out.bowOpen }));
  check('smoke ran with SENSEEXPED on (landed substrate)', out.senseexpedOn === true && out.senseexpedPresent === true && out.launchpartyOn === false,
    JSON.stringify({ se: out.senseexpedOn, sep: out.senseexpedPresent, lp: out.launchpartyOn }));
  check('smoke baseline exists with a roster', !!out.bowBaseline && Array.isArray(out.bowBaseline.roster) && out.bowBaseline.roster.length > 0,
    'roster=' + (out.bowBaseline && out.bowBaseline.roster && out.bowBaseline.roster.length));
  check('smoke baseline carries the census shape',
    !!out.bowBaseline && typeof out.bowBaseline.held === 'object' && typeof out.bowBaseline.stashed === 'object' &&
    typeof out.bowBaseline.stashWeapons === 'object' && typeof out.bowBaseline.mats === 'object' &&
    typeof out.bowBaseline.knows === 'object' && typeof out.bowBaseline.nWeaponlessKnowsBow === 'number',
    JSON.stringify(out.bowBaseline && Object.keys(out.bowBaseline)));
  check('smoke census rows land on observed day-boundaries (harness cadence: some game days roll past unobserved)',
    Array.isArray(out.bowCensus) && out.bowCensus.length >= 3,
    'rows=' + (out.bowCensus && out.bowCensus.length) + ' days=' + JSON.stringify((out.bowCensus || []).map(function (r) { return r.day; })) +
    ' (the analyzer attributes across the gap window, so a skipped day cannot strand an event)');
  check('smoke census rows are day-ordered with eligibility counts',
    (out.bowCensus || []).every(function (r, i, arr) { return (i === 0 || r.day >= arr[i - 1].day) && typeof r.nWeaponlessKnowsBow === 'number' && typeof r.nKnowsBow === 'number'; }),
    'days=' + JSON.stringify((out.bowCensus || []).map(function (r) { return r.day; })));
  check('smoke bowEvents / bowKills / bowDeparts are arrays',
    Array.isArray(out.bowEvents) && Array.isArray(out.bowKills) && Array.isArray(out.bowDeparts),
    JSON.stringify({ ev: out.bowEvents && out.bowEvents.length, k: out.bowKills && out.bowKills.length, d: out.bowDeparts && out.bowDeparts.length }));
  // Tele-wrap liveness: VF's independent tele counts must agree
  // with the driver's captured weapon_craft rows.
  const vfCraft = (out.teleCounts && out.teleCounts.weapon_craft) || 0;
  const drvCraft = (out.bowEvents || []).filter(function (e) { return e.type === 'weapon_craft'; }).length;
  check('tele wrap captures every weapon_craft VF counted', drvCraft === vfCraft, 'driver=' + drvCraft + ' vf=' + vfCraft);
  const vfGear = (out.teleCounts && out.teleCounts.villager_gear) || 0;
  const drvGear = (out.bowEvents || []).filter(function (e) { return e.type === 'villager_gear'; }).length;
  check('tele wrap captures every villager_gear VF counted', drvGear === vfGear, 'driver=' + drvGear + ' vf=' + vfGear);
  // Departure-row shape (when any departure fired in the 5 days).
  const dep0 = (out.bowDeparts || [])[0];
  if (dep0) {
    check('departure row carries volley + source check',
      typeof dep0.hasVolley === 'boolean' && typeof dep0.spearInSlot === 'boolean' &&
      typeof dep0.ownStashBow === 'boolean' && typeof dep0.armoryBow === 'boolean' &&
      typeof dep0.craftableAny === 'boolean' && typeof dep0.couldSource === 'boolean' &&
      dep0.couldSource === (dep0.ownStashBow || dep0.armoryBow || dep0.craftableAny),
      JSON.stringify(dep0));
  } else {
    console.log('  (no departure fired in the 5-day smoke — shape check skipped, not failed)');
  }

  // ---- 4. Analyzer reads the LIVE smoke corpus ----
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bs-smoke-'));
  try {
    fs.writeFileSync(path.join(tmp, 'smoke.json'), JSON.stringify(out));
    const agg = ana.aggregate(tmp);
    check('analyzer accepts the live corpus (1 valid file)', agg.valid === 1 && agg.n === 1, JSON.stringify({ n: agg.n, v: agg.valid }));
    check('analyzer finds 0 instrument errors on the live corpus', agg.errors === 0, 'errors=' + agg.errors);
    check('analyzer starting count equals the baseline bow total',
      agg.starting === (out.bowBaseline.villageBowTotal | 0), 'analyzer=' + agg.starting + ' baseline=' + out.bowBaseline.villageBowTotal);
    check('analyzer departure count equals the driver rows', agg.departs === (out.bowDeparts || []).length,
      'analyzer=' + agg.departs + ' driver=' + out.bowDeparts.length);
    check('analyzer completeness is a number when bows exist, null when none',
      (agg.starting + agg.appearances) > 0 ? (typeof agg.attributionCompleteness === 'number') : (agg.attributionCompleteness === null),
      'completeness=' + agg.attributionCompleteness);
    const j = ana.judge(agg);
    check('analyzer judge returns a DIAG verdict on the live corpus', j.verdict === 'DIAG-GO' || j.verdict === 'DIAG-NO-GO', j.verdict);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }

  console.log('BOWSOURCE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('BOWSOURCE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
