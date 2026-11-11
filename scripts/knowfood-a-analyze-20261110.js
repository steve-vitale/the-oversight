// knowfood-a-analyze-20261110.js — Knowledge FOOD, VILLAGER-SIDE rate
// revision analyzer (arm sim-knowfood-a). Pure function over the per-seed
// JSONs written by scripts/knowfood-a-driver-20261110.js. Deterministic:
// same inputs, byte-identical output (no Date, no Math.random, sorted keys).
//
// Usage:
//   node scripts/knowfood-a-analyze-20261110.js <glob-dir> [run] [mode]
//   e.g. node scripts/knowfood-a-analyze-20261110.js evidence/2026-11-10/perseed-knowfood-a knowfood-a-pilot on
// Prints a markdown report to stdout. Exit 0 on success, 2 on bad args.
'use strict';
const fs = require('fs');
const path = require('path');

function loadSeeds(dir, run, mode) {
  const files = fs.readdirSync(dir)
    .filter(function (f) { return f.indexOf('knowfood-a-s') === 0 && f.indexOf('-' + run + '-' + mode + '.json') !== -1; })
    .sort();
  if (!files.length) throw new Error('no per-seed files for run=' + run + ' mode=' + mode + ' in ' + dir);
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function pct(n, d) { if (!d) return null; return Math.round(1000 * n / d) / 10; }

function analyze(seeds) {
  const perSeed = seeds.map(function (s) {
    // FOOD — villager meals only (non-scholar eaters). The scholar bucket
    // is counted separately and never enters the villager-side rate.
    let draws = 0, itemsKnownV = 0, itemsUnknownV = 0, itemsErrV = 0;
    let itemsKnownS = 0, itemsUnknownS = 0, itemsErrS = 0;
    let drawsWithUnknownV = 0, drawsWithUnknownS = 0;
    let zeroKcalDrawn = 0, cookedKnownV = 0, cookedUnknownV = 0;
    let packSeedDraws = 0, packSeedKnownV = 0, packSeedUnknownV = 0, packSeedErrV = 0;
    let scholarDraws = 0, scholarItems = 0;
    for (const d of (s.foodDraws || [])) {
      if (d.isScholar) { scholarDraws++; scholarItems += (d.items || []).length; continue; }
      draws++;
      let hasUnknownV = false, hasUnknownS = false;
      for (const it of (d.items || [])) {
        if (it.knownVillager === true) itemsKnownV++;
        else if (it.knownVillager === false) { itemsUnknownV++; hasUnknownV = true; }
        else if (it.knownVillager === 'error') itemsErrV++;
        if (it.knownScholar === true) itemsKnownS++;
        else if (it.knownScholar === false) { itemsUnknownS++; hasUnknownS = true; }
        else if (it.knownScholar === 'error') itemsErrS++;
        if ((it.effectiveKcal || 0) <= 0) zeroKcalDrawn++;
        if (it.cooked && it.knownVillager === true) cookedKnownV++;
        else if (it.cooked && it.knownVillager === false) cookedUnknownV++;
        if (d.packSeed) {
          packSeedDraws++;
          if (it.knownVillager === true) packSeedKnownV++;
          else if (it.knownVillager === false) packSeedUnknownV++;
          else if (it.knownVillager === 'error') packSeedErrV++;
        }
      }
      if (hasUnknownV) drawsWithUnknownV++;
      if (hasUnknownS) drawsWithUnknownS++;
    }
    // packSeed draws are a subset of the villager draws above (counted
    // once there); the packSeed counters above count ITEMS in pack-seeded
    // draws. Count pack-seeded DRAW rows separately:
    let packSeedRows = 0;
    for (const d of (s.foodDraws || [])) if (!d.isScholar && d.packSeed) packSeedRows++;
    // SPOILED (desperation draws)
    let spoiledCalls = 0, spoiledCandidates = 0, spoiledCandUnknownV = 0;
    let spoiledTakenKcal = 0, spoiledTakenItems = 0, spoiledTakenUnknownV = 0;
    for (const sp of (s.spoiledDraws || [])) {
      if (sp.isScholar) continue;
      spoiledCalls++;
      spoiledCandidates += sp.candidates || 0;
      spoiledCandUnknownV += sp.candidatesUnknownVillager || 0;
      spoiledTakenKcal += sp.takenKcal || 0;
      for (const ti of (sp.takenItems || [])) {
        spoiledTakenItems++;
        if (ti.knownVillager === false) spoiledTakenUnknownV++;
      }
    }
    // PACK MEALS (away eating)
    let packMeals = 0, packKcal = 0;
    for (const pm of (s.packMeals || [])) { packMeals++; packKcal += pm.taken || 0; }
    // EXPERIMENTS
    const beats = s.experimentBeats || [];
    const beatByOutcome = {}, beatByKind = {}, beatByVerdict = {};
    let beatFired = 0;
    for (const b of beats) {
      beatByOutcome[b.outcome || 'null'] = (beatByOutcome[b.outcome || 'null'] || 0) + 1;
      if (b.fired) beatFired++;
      if (b.target) {
        beatByKind[b.target.kind || 'null'] = (beatByKind[b.target.kind || 'null'] || 0) + 1;
        beatByVerdict[b.verdict || 'null'] = (beatByVerdict[b.verdict || 'null'] || 0) + 1;
      }
    }
    // SAY LINES — encounter voices (thrown-out spoiled stores, sick testers)
    let sayThrownOut = 0, saySickTester = 0, sayTestedSafe = 0, sayDesperation = 0;
    for (const sl of (s.sayLines || [])) {
      const line = sl.line || '';
      if (/threw out spoiled stores/i.test(line)) sayThrownOut++;
      if (/educationally sick|tongue goes numb/i.test(line)) saySickTester++;
      if (/It's food/i.test(line)) sayTestedSafe++;
      if (/eats what should have been thrown out/i.test(line)) sayDesperation++;
    }
    // SNAPSHOTS — unknown flesh present but never drawn
    let maxUnknownFleshItems = 0, maxUnknownFleshUnits = 0, lastUnknownFleshItems = 0, lastUnknownFleshUnits = 0;
    let sumUnknownFleshUnits = 0, snapN = 0;
    for (const dn of (s.daily || [])) {
      if ((dn.unknownFleshItems || 0) > maxUnknownFleshItems) maxUnknownFleshItems = dn.unknownFleshItems;
      if ((dn.unknownFleshUnits || 0) > maxUnknownFleshUnits) maxUnknownFleshUnits = dn.unknownFleshUnits;
      sumUnknownFleshUnits += dn.unknownFleshUnits || 0; snapN++;
      lastUnknownFleshItems = dn.unknownFleshItems || 0; lastUnknownFleshUnits = dn.unknownFleshUnits || 0;
    }
    const lastDaily = (s.daily || [])[(s.daily || []).length - 1] || {};
    // WALL
    const causes = {};
    for (const f of (s.fallen || [])) causes[f.cause || 'unknown'] = (causes[f.cause || 'unknown'] || 0) + 1;
    // Unknown items by plantId (what the eater did NOT know)
    const unknownById = {};
    for (const d of (s.foodDraws || [])) {
      if (d.isScholar) continue;
      for (const it of (d.items || [])) {
        if (it.knownVillager === false) {
          const k = (it.plantId || 'null') + '|' + (it.foodKind || 'null');
          unknownById[k] = (unknownById[k] || 0) + (it.units || 0);
        }
      }
    }
    return {
      seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
      won: s.won, over: s.over, villageLost: s.villageLost,
      scaleRank: s.scaleRank, maxWave: s.maxWave, unlockedWave: s.unlockedWave,
      standing: s.standing, errors: (s.instrumentErrors || []).length,
      food: {
        draws: draws, itemsKnownV: itemsKnownV, itemsUnknownV: itemsUnknownV,
        itemsErrV: itemsErrV, knownShareV: pct(itemsKnownV, itemsKnownV + itemsUnknownV),
        itemsKnownS: itemsKnownS, itemsUnknownS: itemsUnknownS, itemsErrS: itemsErrS,
        knownShareS: pct(itemsKnownS, itemsKnownS + itemsUnknownS),
        drawsWithUnknownV: drawsWithUnknownV, drawsWithUnknownS: drawsWithUnknownS,
        zeroKcalDrawn: zeroKcalDrawn,
        cookedKnownV: cookedKnownV, cookedUnknownV: cookedUnknownV,
        scholarDraws: scholarDraws, scholarItems: scholarItems,
        unknownById: unknownById,
      },
      pack: {
        seedRows: packSeedRows, seedKnownV: packSeedKnownV, seedUnknownV: packSeedUnknownV,
        seedErrV: packSeedErrV,
        seedShareV: pct(packSeedKnownV, packSeedKnownV + packSeedUnknownV),
        meals: packMeals, kcal: packKcal,
      },
      spoiled: {
        calls: spoiledCalls, candidates: spoiledCandidates,
        candidatesUnknownV: spoiledCandUnknownV,
        takenKcal: spoiledTakenKcal, takenItems: spoiledTakenItems,
        takenUnknownV: spoiledTakenUnknownV,
      },
      experiment: {
        calls: beats.length, fired: beatFired,
        byOutcome: beatByOutcome, byKind: beatByKind, byVerdict: beatByVerdict,
      },
      say: {
        thrownOut: sayThrownOut, sickTester: saySickTester,
        testedSafe: sayTestedSafe, desperation: sayDesperation,
      },
      snapshot: {
        maxUnknownFleshItems: maxUnknownFleshItems, maxUnknownFleshUnits: maxUnknownFleshUnits,
        lastUnknownFleshItems: lastUnknownFleshItems, lastUnknownFleshUnits: lastUnknownFleshUnits,
        meanUnknownFleshUnits: snapN ? Math.round(100 * sumUnknownFleshUnits / snapN) / 100 : null,
      },
      produced: s.produced || { total: 0, n: 0 },
      wall: {
        fallen: (s.fallen || []).length, causes: causes,
        lastRoster: lastDaily.roster ?? null, lastAlive: lastDaily.alive ?? null,
        lastPantryKcal: lastDaily.pantryKcal ?? null,
        sharedKnown: lastDaily.sharedKnown ?? null,
        testedVerdicts: lastDaily.testedVerdicts ?? null,
      },
      sayCount: s.sayCount || 0, sayLinesKept: (s.sayLines || []).length,
    };
  });

  function sum(fn) { return perSeed.reduce(function (a, r) { return a + (fn(r) || 0); }, 0); }
  const n = perSeed.length;
  const totals = {
    seeds: n,
    errors: sum(function (r) { return r.errors; }),
    days: perSeed.map(function (r) { return r.gameDays; }),
    won: sum(function (r) { return r.won ? 1 : 0; }),
    national: perSeed.filter(function (r) { return r.scaleRank === 'national' || (typeof r.scaleRank === 'string' && r.scaleRank.indexOf('national') !== -1); }).length,
    table: perSeed.filter(function (r) { return r.scaleRank === 'table' || (typeof r.scaleRank === 'string' && r.scaleRank.indexOf('table') !== -1); }).length,
    maxWaveReached: Math.max.apply(null, perSeed.map(function (r) { return r.maxWave || 1; })),
    foodDraws: sum(function (r) { return r.food.draws; }),
    foodItemsKnownV: sum(function (r) { return r.food.itemsKnownV; }),
    foodItemsUnknownV: sum(function (r) { return r.food.itemsUnknownV; }),
    foodItemsErrV: sum(function (r) { return r.food.itemsErrV; }),
    foodKnownShareV: pct(sum(function (r) { return r.food.itemsKnownV; }), sum(function (r) { return r.food.itemsKnownV + r.food.itemsUnknownV; })),
    foodItemsKnownS: sum(function (r) { return r.food.itemsKnownS; }),
    foodItemsUnknownS: sum(function (r) { return r.food.itemsUnknownS; }),
    foodItemsErrS: sum(function (r) { return r.food.itemsErrS; }),
    foodKnownShareS: pct(sum(function (r) { return r.food.itemsKnownS; }), sum(function (r) { return r.food.itemsKnownS + r.food.itemsUnknownS; })),
    drawsWithUnknownV: sum(function (r) { return r.food.drawsWithUnknownV; }),
    zeroKcalDrawn: sum(function (r) { return r.food.zeroKcalDrawn; }),
    cookedKnownV: sum(function (r) { return r.food.cookedKnownV; }),
    cookedUnknownV: sum(function (r) { return r.food.cookedUnknownV; }),
    scholarDraws: sum(function (r) { return r.food.scholarDraws; }),
    packSeedRows: sum(function (r) { return r.pack.seedRows; }),
    packSeedKnownV: sum(function (r) { return r.pack.seedKnownV; }),
    packSeedUnknownV: sum(function (r) { return r.pack.seedUnknownV; }),
    packSeedErrV: sum(function (r) { return r.pack.seedErrV; }),
    packSeedShareV: pct(sum(function (r) { return r.pack.seedKnownV; }), sum(function (r) { return r.pack.seedKnownV + r.pack.seedUnknownV; })),
    packMeals: sum(function (r) { return r.pack.meals; }),
    packKcal: sum(function (r) { return r.pack.kcal; }),
    spoiledCalls: sum(function (r) { return r.spoiled.calls; }),
    spoiledCandidates: sum(function (r) { return r.spoiled.candidates; }),
    spoiledCandUnknownV: sum(function (r) { return r.spoiled.candidatesUnknownV; }),
    spoiledTakenKcal: sum(function (r) { return r.spoiled.takenKcal; }),
    spoiledTakenItems: sum(function (r) { return r.spoiled.takenItems; }),
    spoiledTakenUnknownV: sum(function (r) { return r.spoiled.takenUnknownV; }),
    beatCalls: sum(function (r) { return r.experiment.calls; }),
    beatFired: sum(function (r) { return r.experiment.fired; }),
    sayThrownOut: sum(function (r) { return r.say.thrownOut; }),
    saySickTester: sum(function (r) { return r.say.sickTester; }),
    sayTestedSafe: sum(function (r) { return r.say.testedSafe; }),
    sayDesperation: sum(function (r) { return r.say.desperation; }),
    producedTotal: sum(function (r) { return r.produced.total; }),
    producedN: sum(function (r) { return r.produced.n; }),
  };
  const sortedDays = totals.days.slice().sort(function (a, b) { return a - b; });
  totals.medianSurvival = sortedDays.length ? sortedDays[Math.floor(sortedDays.length / 2)] : null;
  totals.maxSurvival = sortedDays.length ? sortedDays[sortedDays.length - 1] : null;
  const causeTotals = {};
  for (const r of perSeed) for (const k in r.wall.causes) causeTotals[k] = (causeTotals[k] || 0) + r.wall.causes[k];
  totals.deathCauses = causeTotals;
  totals.totalDeaths = Object.keys(causeTotals).reduce(function (a, k) { return a + causeTotals[k]; }, 0);
  const beatOutcomeTotals = {}, beatKindTotals = {}, beatVerdictTotals = {}, unknownByIdTotals = {};
  for (const r of perSeed) {
    for (const k in r.experiment.byOutcome) beatOutcomeTotals[k] = (beatOutcomeTotals[k] || 0) + r.experiment.byOutcome[k];
    for (const k in r.experiment.byKind) beatKindTotals[k] = (beatKindTotals[k] || 0) + r.experiment.byKind[k];
    for (const k in r.experiment.byVerdict) beatVerdictTotals[k] = (beatVerdictTotals[k] || 0) + r.experiment.byVerdict[k];
    for (const k in r.food.unknownById) unknownByIdTotals[k] = (unknownByIdTotals[k] || 0) + r.food.unknownById[k];
  }
  totals.beatByOutcome = beatOutcomeTotals;
  totals.beatByKind = beatKindTotals;
  totals.beatByVerdict = beatVerdictTotals;
  totals.unknownById = unknownByIdTotals;

  return { perSeed: perSeed, totals: totals };
}

function md(res) {
  const t = res.totals;
  const L = [];
  L.push('# sim-knowfood-a — analyzer output');
  L.push('');
  L.push('Seeds: ' + t.seeds + ' · instrument errors: ' + t.errors);
  L.push('');
  L.push('## Wall');
  L.push('- won: ' + t.won + '/' + t.seeds + ' · national: ' + t.national + ' · table: ' + t.table + ' · max wave reached: ' + t.maxWaveReached);
  L.push('- median survival: ' + t.medianSurvival + 'd · max: ' + t.maxSurvival + 'd · total deaths: ' + t.totalDeaths);
  L.push('- death causes: ' + JSON.stringify(t.deathCauses));
  L.push('');
  L.push('## FOOD — villager-side rate (M1, primary)');
  L.push('- villager meal draws: ' + t.foodDraws + ' · items known-to-eater: ' + t.foodItemsKnownV + ' · unknown-to-eater: ' + t.foodItemsUnknownV + ' · check errors: ' + t.foodItemsErrV);
  L.push('- villager-side known share: ' + (t.foodKnownShareV === null ? 'n/a (no items)' : t.foodKnownShareV + '%'));
  L.push('- SAME draws, scholar-side (pantryItemKnown): known ' + t.foodItemsKnownS + ' · unknown ' + t.foodItemsUnknownS + ' · errors ' + t.foodItemsErrS + ' · share ' + (t.foodKnownShareS === null ? 'n/a' : t.foodKnownShareS + '%'));
  L.push('- draws containing an item unknown to the eater: ' + t.drawsWithUnknownV);
  L.push('- drawn items with 0 kcal (M2 — expect 0): ' + t.zeroKcalDrawn);
  L.push('- cooked draws: known-to-eater ' + t.cookedKnownV + ' · unknown-to-eater ' + t.cookedUnknownV + ' (unknown food never reaches the cook transform)');
  L.push('- scholar-bucket draws excluded from the villager rate: ' + t.scholarDraws);
  L.push('- unknown-to-eater items drawn, by id: ' + JSON.stringify(t.unknownById));
  L.push('');
  L.push('## PACKS — away eating (M3)');
  L.push('- pack-seeded draws: ' + t.packSeedRows + ' rows · items known-to-eater: ' + t.packSeedKnownV + ' · unknown: ' + t.packSeedUnknownV + ' · errors: ' + t.packSeedErrV + ' · share ' + (t.packSeedShareV === null ? 'n/a' : t.packSeedShareV + '%'));
  L.push('- pack meals eaten away: ' + t.packMeals + ' · kcal eaten from packs: ' + t.packKcal);
  L.push('');
  L.push('## DESPERATION — drawSpoiled (M3)');
  L.push('- drawSpoiled calls: ' + t.spoiledCalls + ' · spoiled candidates: ' + t.spoiledCandidates + ' · candidates unknown-to-eater: ' + t.spoiledCandUnknownV);
  L.push('- spoiled items actually eaten: ' + t.spoiledTakenItems + ' · kcal: ' + t.spoiledTakenKcal + ' · of them unknown-to-eater: ' + t.spoiledTakenUnknownV);
  L.push('- desperation say lines ("eats what should have been thrown out"): ' + t.sayDesperation);
  L.push('');
  L.push('## TESTING — villagerExperimentBeat (M3)');
  L.push('- beat calls: ' + t.beatCalls + ' · fired: ' + t.beatFired);
  L.push('- by outcome: ' + JSON.stringify(t.beatByOutcome));
  L.push('- by target kind: ' + JSON.stringify(t.beatByKind) + ' · by verdict: ' + JSON.stringify(t.beatByVerdict));
  L.push('- sick-tester say lines ("educationally sick" / "tongue goes numb"): ' + t.saySickTester + ' · "It\'s food" safe verdicts voiced: ' + t.sayTestedSafe);
  L.push('- thrown-out spoiled-stores say lines: ' + t.sayThrownOut);
  L.push('');
  L.push('## IGNORE — unknown flesh present, never drawn (M2)');
  for (const r of res.perSeed) {
    L.push('- seed ' + r.seed + ': max unknown-flesh items at snapshot ' + r.snapshot.maxUnknownFleshItems + ' (' + r.snapshot.maxUnknownFleshUnits + ' units) · mean units/snapshot ' + r.snapshot.meanUnknownFleshUnits + ' · at end ' + r.snapshot.lastUnknownFleshItems + ' items / ' + r.snapshot.lastUnknownFleshUnits + ' units');
  }
  L.push('- own production (scalar kcal, no identity — unmeasurable-by-construction): ' + Math.round(t.producedTotal) + ' kcal over ' + t.producedN + ' villager-days');
  L.push('');
  L.push('## Per-seed');
  L.push('| seed | days | end | wave | standing | villager known% | scholar known% | draws | beats fired | spoiled eaten | pack kcal | errors |');
  L.push('|---:|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const r of res.perSeed) {
    L.push('| ' + r.seed + ' | ' + r.gameDays + ' | ' + (r.endReason || '') + ' | ' + r.maxWave + ' | ' + (r.standing === null ? 'null' : r.standing) + ' | ' + (r.food.knownShareV === null ? 'n/a' : r.food.knownShareV) + ' | ' + (r.food.knownShareS === null ? 'n/a' : r.food.knownShareS) + ' | ' + r.food.draws + ' | ' + r.experiment.fired + ' | ' + r.spoiled.takenItems + ' | ' + r.pack.kcal + ' | ' + r.errors + ' |');
  }
  return L.join('\n') + '\n';
}

if (require.main === module) {
  const dir = process.argv[2];
  const run = process.argv[3] || 'knowfood-a-pilot';
  const mode = process.argv[4] || 'on';
  if (!dir) { console.error('usage: node knowfood-a-analyze-20261110.js <per-seed-dir> [run] [mode]'); process.exit(2); }
  const seeds = loadSeeds(dir, run, mode);
  const res = analyze(seeds);
  process.stdout.write(md(res));
}

module.exports = { analyze: analyze, loadSeeds: loadSeeds, md: md };
