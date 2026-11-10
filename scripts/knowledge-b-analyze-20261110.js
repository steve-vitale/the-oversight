// knowledge-b-analyze-20261110.js — Knowledge → behavior, BROAD analyzer
// (arm sim-knowledge-b). Pure function over the per-seed JSONs written by
// scripts/knowledge-b-driver-20261110.js. Deterministic: same inputs,
// byte-identical output (no Date, no Math.random, sorted keys).
//
// Usage:
//   node scripts/knowledge-b-analyze-20261110.js <glob-dir> [run] [mode]
//   e.g. node scripts/knowledge-b-analyze-20261110.js evidence/2026-11-10/perseed-knowledge-b knowledge-b-pilot on
// Prints a markdown report to stdout; with --json also writes nothing to
// disk (the caller redirects stdout). Exit 0 on success, 2 on bad args.
'use strict';
const fs = require('fs');
const path = require('path');

function loadSeeds(dir, run, mode) {
  const files = fs.readdirSync(dir)
    .filter(function (f) { return f.indexOf('knowledge-b-s') === 0 && f.indexOf('-' + run + '-' + mode + '.json') !== -1; })
    .sort();
  if (!files.length) throw new Error('no per-seed files for run=' + run + ' mode=' + mode + ' in ' + dir);
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function pct(n, d) { if (!d) return null; return Math.round(1000 * n / d) / 10; }

function analyze(seeds) {
  const perSeed = seeds.map(function (s) {
    // FOOD
    let draws = 0, itemsKnown = 0, itemsUnknown = 0, itemsErr = 0, drawsWithUnknown = 0;
    for (const d of (s.foodDraws || [])) {
      draws++;
      let hasUnknown = false;
      for (const it of (d.items || [])) {
        if (it.known === true) itemsKnown++;
        else if (it.known === false) { itemsUnknown++; hasUnknown = true; }
        else itemsErr++;
      }
      if (hasUnknown) drawsWithUnknown++;
    }
    // LOOTING
    const haulC = s.haulCandidates || [];
    const haulByChannel = { famine: 0, knowledge: 0, other: 0, none: 0 };
    const haulByKnown = { known: 0, unknown: 0, other: 0 };
    for (const c of haulC) {
      if (haulByChannel[c.channel] !== undefined) haulByChannel[c.channel]++;
      else haulByChannel.other++;
      if (c.known === true) haulByKnown.known++;
      else if (c.known === false) haulByKnown.unknown++;
      else haulByKnown.other++;
    }
    const haulF = s.haulFormed || [];
    const formedByKnown = { known: 0, unknown: 0, other: 0 };
    let formedFresh = 0, formedSecondhand = 0;
    for (const f of haulF) {
      if (f.known === true) formedByKnown.known++;
      else if (f.known === false) formedByKnown.unknown++;
      else formedByKnown.other++;
      if (f.freshUnrevealed === true) formedFresh++;
      if (f.secondhand) formedSecondhand++;
    }
    const haulA = s.haulArrivals || [];
    const arrivalsOk = haulA.filter(function (a) { return a.ok; }).length;
    // PEOPLE
    const visits = s.visitTargets || [];
    const visitChan = { mate: 0, trustHigh: 0, trustMid: 0, away: 0, none: 0 };
    let visitNull = 0, zeroSum = 0;
    for (const vt of visits) {
      zeroSum += vt.nZeroScore || 0;
      if (!vt.target) { visitNull++; continue; }
      const ch = vt.channels || {};
      let any = false;
      if (ch.mate) { visitChan.mate++; any = true; }
      if (ch.trustHigh) { visitChan.trustHigh++; any = true; }
      if (ch.trustMid) { visitChan.trustMid++; any = true; }
      if (ch.away) { visitChan.away++; any = true; }
      if (!any) visitChan.none++;
    }
    const bonds = s.bondEvents || [];
    const bondByOutcome = {};
    for (const b of bonds) bondByOutcome[b.outcome || 'null'] = (bondByOutcome[b.outcome || 'null'] || 0) + 1;
    // FORAGING / EXPLORING
    const picks = s.objPicks || [];
    const pickByKind = {};
    for (const p of picks) {
      const k = p.kind || 'null';
      const row = pickByKind[k] || (pickByKind[k] = { n: 0, visited: 0, fresh: 0, err: 0 });
      row.n++;
      if (p.visitedBefore === true) row.visited++;
      else if (p.visitedBefore === false) row.fresh++;
      else row.err++;
    }
    // WALL
    const causes = {};
    for (const f of (s.fallen || [])) causes[f.cause || 'unknown'] = (causes[f.cause || 'unknown'] || 0) + 1;
    const lastDaily = (s.daily || [])[(s.daily || []).length - 1] || {};
    return {
      seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
      won: s.won, over: s.over, villageLost: s.villageLost,
      scaleRank: s.scaleRank, maxWave: s.maxWave, unlockedWave: s.unlockedWave,
      standing: s.standing, errors: (s.instrumentErrors || []).length,
      food: {
        draws: draws, itemsKnown: itemsKnown, itemsUnknown: itemsUnknown,
        itemsErr: itemsErr, drawsWithUnknown: drawsWithUnknown,
        knownShare: pct(itemsKnown, itemsKnown + itemsUnknown),
      },
      experimentBeats: (s.experimentBeats || []).length,
      looting: {
        candidates: haulC.length, byChannel: haulByChannel, byKnown: haulByKnown,
        formed: haulF.length, formedByKnown: formedByKnown,
        formedFreshUnrevealed: formedFresh, formedSecondhand: formedSecondhand,
        arrivals: haulA.length, arrivalsOk: arrivalsOk,
        cacheFinds: (s.cacheFinds || []).length,
        cacheKcal: (s.cacheFinds || []).reduce(function (a, c) { return a + (c.kcal || 0); }, 0),
        sitesCalls: (s.haulSites || []).length,
      },
      people: {
        visits: visits.length, visitNull: visitNull, visitChan: visitChan,
        zeroScoreMean: visits.length ? Math.round(100 * zeroSum / visits.length) / 100 : null,
        bonds: bonds.length, bondByOutcome: bondByOutcome,
        objVisits: (pickByKind.VISIT || { n: 0 }).n,
      },
      picks: pickByKind,
      exploring: {
        compareMaps: (s.compareMaps || []).length,
        signEvents: (s.signEvents || []).length,
      },
      wall: {
        fallen: (s.fallen || []).length, causes: causes,
        lastRoster: lastDaily.roster ?? null, lastAlive: lastDaily.alive ?? null,
        lastPantryKcal: lastDaily.pantryKcal ?? null,
        sharedKnown: lastDaily.sharedKnown ?? null,
        testedVerdicts: lastDaily.testedVerdicts ?? null,
        mapmemSites: lastDaily.mapmemSites ?? null,
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
    foodItemsKnown: sum(function (r) { return r.food.itemsKnown; }),
    foodItemsUnknown: sum(function (r) { return r.food.itemsUnknown; }),
    foodItemsErr: sum(function (r) { return r.food.itemsErr; }),
    foodKnownShare: pct(sum(function (r) { return r.food.itemsKnown; }), sum(function (r) { return r.food.itemsKnown + r.food.itemsUnknown; })),
    experimentBeats: sum(function (r) { return r.experimentBeats; }),
    haulCandidates: sum(function (r) { return r.looting.candidates; }),
    haulFormed: sum(function (r) { return r.looting.formed; }),
    haulArrivals: sum(function (r) { return r.looting.arrivals; }),
    cacheFinds: sum(function (r) { return r.looting.cacheFinds; }),
    cacheKcal: sum(function (r) { return r.looting.cacheKcal; }),
    visits: sum(function (r) { return r.people.visits; }),
    visitNull: sum(function (r) { return r.people.visitNull; }),
    bonds: sum(function (r) { return r.people.bonds; }),
    compareMaps: sum(function (r) { return r.exploring.compareMaps; }),
    signEvents: sum(function (r) { return r.exploring.signEvents; }),
  };
  const sortedDays = totals.days.slice().sort(function (a, b) { return a - b; });
  totals.medianSurvival = sortedDays.length ? sortedDays[Math.floor(sortedDays.length / 2)] : null;
  totals.maxSurvival = sortedDays.length ? sortedDays[sortedDays.length - 1] : null;
  const causeTotals = {};
  for (const r of perSeed) for (const k in r.wall.causes) causeTotals[k] = (causeTotals[k] || 0) + r.wall.causes[k];
  totals.deathCauses = causeTotals;
  totals.totalDeaths = Object.keys(causeTotals).reduce(function (a, k) { return a + causeTotals[k]; }, 0);
  // per-kind pick totals (FORAGE / EXPLORE / VISIT / HAUL / SEEK)
  const pickTotals = {};
  for (const r of perSeed) {
    for (const k in r.picks) {
      const row = pickTotals[k] || (pickTotals[k] = { n: 0, visited: 0, fresh: 0, err: 0 });
      row.n += r.picks[k].n; row.visited += r.picks[k].visited;
      row.fresh += r.picks[k].fresh; row.err += r.picks[k].err;
    }
  }
  totals.picks = pickTotals;
  // channel totals
  const chanTotals = { famine: 0, knowledge: 0, other: 0, none: 0 };
  const knownTotals = { known: 0, unknown: 0, other: 0 };
  for (const r of perSeed) {
    const bc = r.looting.byChannel;
    chanTotals.famine += bc.famine; chanTotals.knowledge += bc.knowledge;
    chanTotals.other += bc.other; chanTotals.none += bc.none;
    const bk = r.looting.byKnown;
    knownTotals.known += bk.known; knownTotals.unknown += bk.unknown; knownTotals.other += bk.other;
  }
  totals.haulByChannel = chanTotals;
  totals.haulByKnown = knownTotals;
  const visitChanTotals = { mate: 0, trustHigh: 0, trustMid: 0, away: 0, none: 0 };
  for (const r of perSeed) {
    const vc = r.people.visitChan;
    visitChanTotals.mate += vc.mate; visitChanTotals.trustHigh += vc.trustHigh;
    visitChanTotals.trustMid += vc.trustMid; visitChanTotals.away += vc.away; visitChanTotals.none += vc.none;
  }
  totals.visitChan = visitChanTotals;

  return { perSeed: perSeed, totals: totals };
}

function md(res) {
  const t = res.totals;
  const L = [];
  L.push('# sim-knowledge-b — analyzer output');
  L.push('');
  L.push('Seeds: ' + t.seeds + ' · instrument errors: ' + t.errors);
  L.push('');
  L.push('## Wall');
  L.push('- won: ' + t.won + '/' + t.seeds + ' · national: ' + t.national + ' · table: ' + t.table + ' · max wave reached: ' + t.maxWaveReached);
  L.push('- median survival: ' + t.medianSurvival + 'd · max: ' + t.maxSurvival + 'd · total deaths: ' + t.totalDeaths);
  L.push('- death causes: ' + JSON.stringify(t.deathCauses));
  L.push('');
  L.push('## FOOD — villager pantry draws, by known-status');
  L.push('- draws: ' + t.foodDraws + ' · items known-edible: ' + t.foodItemsKnown + ' · unknown: ' + t.foodItemsUnknown + ' · check errors: ' + t.foodItemsErr);
  L.push('- known share of drawn items: ' + (t.foodKnownShare === null ? 'n/a (no items)' : t.foodKnownShare + '%'));
  L.push('- villagerExperimentBeat fires (unknown-food testing): ' + t.experimentBeats);
  L.push('');
  L.push('## LOOTING — mapmem haul + cache luck');
  L.push('- haul candidates offered: ' + t.haulCandidates + ' · by channel: ' + JSON.stringify(t.haulByChannel) + ' · by flesh known-status: ' + JSON.stringify(t.haulByKnown));
  L.push('- haul objectives formed: ' + t.haulFormed + ' · arrivals: ' + t.haulArrivals);
  L.push('- expedition cache finds (knowledge-independent luck): ' + t.cacheFinds + ' · kcal: ' + t.cacheKcal);
  L.push('- trips to known caches: UNMEASURABLE — no known-cache store exists; cache finds are expedition luck (see prereg).');
  L.push('');
  L.push('## PEOPLE — visits + bonds');
  L.push('- objVisitTarget calls: ' + t.visits + ' · null (nobody scorable): ' + t.visitNull);
  L.push('- target channels (a target may carry several): ' + JSON.stringify(t.visitChan));
  L.push('- bond_proposed tele events: ' + t.bonds);
  L.push('');
  L.push('## FORAGING / EXPLORING — destinations vs visited ground');
  for (const k of Object.keys(t.picks).sort()) {
    const p = t.picks[k];
    L.push('- ' + k + ': n=' + p.n + ' · visited-before=' + p.visited + ' (' + pct(p.visited, p.visited + p.fresh) + '%) · new ground=' + p.fresh + ' · err=' + p.err);
  }
  L.push('- compareMaps events (map knowledge shared): ' + t.compareMaps + ' · expeditionSign (places learned): ' + t.signEvents);
  L.push('- trips to known-rich patches: UNMEASURABLE — no patch store exists; FORAGE destinations are random (see prereg).');
  L.push('');
  L.push('## Per-seed');
  L.push('| seed | days | end | wave | standing | food known% | haul formed | visits | bonds | errors |');
  L.push('|---:|---:|---|---|---:|---:|---:|---:|---:|---:|');
  for (const r of res.perSeed) {
    L.push('| ' + r.seed + ' | ' + r.gameDays + ' | ' + (r.endReason || '') + ' | ' + r.maxWave + ' | ' + (r.standing === null ? 'null' : r.standing) + ' | ' + (r.food.knownShare === null ? 'n/a' : r.food.knownShare) + ' | ' + r.looting.formed + ' | ' + r.people.visits + ' | ' + r.people.bonds + ' | ' + r.errors + ' |');
  }
  return L.join('\n') + '\n';
}

if (require.main === module) {
  const dir = process.argv[2];
  const run = process.argv[3] || 'knowledge-b-pilot';
  const mode = process.argv[4] || 'on';
  if (!dir) { console.error('usage: node knowledge-b-analyze-20261110.js <per-seed-dir> [run] [mode]'); process.exit(2); }
  const seeds = loadSeeds(dir, run, mode);
  const res = analyze(seeds);
  process.stdout.write(md(res));
}

module.exports = { analyze: analyze, loadSeeds: loadSeeds, md: md };
