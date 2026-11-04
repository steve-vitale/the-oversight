// approachconf-summarize-20261104.js — aggregate fleerepair per-seed JSONs
// into the prereg metrics table (baseline vs armed). Pure read of JSONs.
// Usage: node scripts/approachconf-summarize-20261104.js <per-seed-dir> [run-filter]
// Prints a JSON summary to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./approachconf-analyze-20261104');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function main() {
  const dir = process.argv[2];
  const filter = process.argv[3] || '';
  const files = fs.readdirSync(dir).filter(function (f) {
    return f.indexOf('approachconf-s') === 0 && f.endsWith('.json') && (!filter || f.slice(0, -5).endsWith(filter));
  }).sort();
  const perSeed = [];
  let exposures = 0, kills = 0, escapes = 0, fleeTriggered = 0, barrierPushes = 0;
  let zeroTileMoves = 0, turnsTotal = 0, fleeTurns = 0;
  // Approach-loop aggregates (PRIMARY metric of arm sim-approachfall-b).
  let loopFights = 0, failedApproachTurns = 0, noPathLines = 0, waitTurns = 0;
  let fleeWalkTurns = 0, otherBlockedTurns = 0, fallbackEvents = 0, fallbackFights = 0;
  const maxRuns = [];
  const loopFightList = [];
  const strikesPerFight = [], strikesLost = [], fracLost = [], fracAll = [];
  const survDays = [];
  let starvationDeaths = 0, starvationPlayerDeaths = 0;
  const deathCauses = {};
  // Wall numbers are MEASURED from per-seed scale fields (confirm
  // extension, 2026-11-04) — never hard-coded. Files without the fields
  // (pilot corpus) count under scaleMeasured: 0, not as national 0.
  const wall = { wins: 0, national: 0, table: 0, tableWaiting: 0, wave4faced: 0, wave4kills: 0, wave5faced: 0,
    scaleMeasured: 0, maxStanding: null, medianStandingFinal: null };
  const standingFinals = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const sums = (j.exposures || []).map(function (ex) { return A.summarize(ex); });
    const seedEscapes = sums.filter(function (s) { return s.outcome === 'fled'; }).length;
    const seedFleeTrig = sums.filter(function (s) {
      return (s.turns || []).some(function (t) { return t.cls === 'flee-attempt'; });
    }).length;
    const seedPushes = (j.exposures || []).reduce(function (n, ex) {
      return n + (ex.turns || []).reduce(function (m, t) {
        return m + (t.actions || []).filter(function (a) { return a.kind === 'barrierExit'; }).length;
      }, 0);
    }, 0);
    const seedZeroTile = (j.exposures || []).reduce(function (n, ex) {
      return n + (ex.turns || []).reduce(function (m, t) {
        return m + (t.actions || []).filter(function (a) {
          return a.kind === 'move' && a.pre && a.post && a.pre.player && a.post.player &&
            a.pre.player.mx === a.post.player.mx && a.pre.player.my === a.post.player.my;
        }).length;
      }, 0);
    }, 0);
    const seedTurns = (j.exposures || []).reduce(function (n, ex) { return n + (ex.turns || []).length; }, 0);
    const seedFleeTurns = sums.reduce(function (n, s) { return n + (s.turnHist['flee-attempt'] || 0); }, 0);
    for (const s of sums) {
      strikesPerFight.push(s.strikesLanded);
      if (s.outcome === 'fighter-died') {
        strikesLost.push(s.strikesLanded);
        const led = s.ledger || [];
        const dealt = led.reduce(function (n, r) { return n + (r.dealt || 0); }, 0);
        const max = led.reduce(function (n, r) { return n + (r.maxHp || 0); }, 0);
        fracLost.push(max ? dealt / max : 0);
      }
      const ledA = s.ledger || [];
      const dealtA = ledA.reduce(function (n, r) { return n + (r.dealt || 0); }, 0);
      const maxA = ledA.reduce(function (n, r) { return n + (r.maxHp || 0); }, 0);
      fracAll.push(maxA ? dealtA / maxA : 0);
    }
    const deaths = j.deaths || j.deathEvents || [];
    for (const d of deaths) {
      const c = (d && (d.cause || d.reason || d.kind)) || 'unknown';
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (String(c).toLowerCase().indexOf('starv') >= 0) {
        starvationDeaths++;
        if (d && d.player === true) starvationPlayerDeaths++;
      }
    }
    // Approach-loop analysis per exposure (same instrument shape).
    const seedAp = (j.exposures || []).map(function (ex) { return A.analyzeConfirm(ex); });
    const seedLoops = seedAp.filter(function (r) { return r.isLoopFight; });
    loopFights += seedLoops.length;
    failedApproachTurns += seedAp.reduce(function (n, r) { return n + r.approachStepTurns; }, 0);
    fleeWalkTurns += seedAp.reduce(function (n, r) { return n + r.fleeWalkTurns; }, 0);
    otherBlockedTurns += seedAp.reduce(function (n, r) { return n + r.otherBlockedTurns; }, 0);
    fallbackEvents += seedAp.reduce(function (n, r) { return n + r.fallbackEvents; }, 0);
    fallbackFights += seedAp.filter(function (r) { return r.fallbackEvents > 0; }).length;
    noPathLines += seedAp.reduce(function (n, r) { return n + r.noPathLines; }, 0);
    waitTurns += seedAp.reduce(function (n, r) { return n + r.waitTurns; }, 0);
    for (const r of seedAp) maxRuns.push(r.maxSameStepRun);
    for (const r of seedLoops) loopFightList.push({ seed: j.seed, seq: r.seq, day: r.day,
      mid: r.mid, nTurns: r.nTurns, maxRun: r.maxSameStepRun,
      failedTurns: r.approachStepTurns, noPathLines: r.noPathLines });
    exposures += (j.exposures || []).length;
    kills += (j.killRows || []).filter(function (r) { return r.linkSeq != null; }).length;
    escapes += seedEscapes;
    fleeTriggered += seedFleeTrig;
    barrierPushes += seedPushes;
    zeroTileMoves += seedZeroTile;
    turnsTotal += seedTurns;
    fleeTurns += seedFleeTurns;
    survDays.push(j.days);
    if (j.won) wall.wins++;
    wall.wave4faced += (j.exposures || []).length + (j.fieldCallsW4 || 0);
    wall.wave4kills += (j.killRows || []).length;
    if ((j.maxWave || 1) >= 5) wall.wave5faced++;
    if (j.nationalReached !== undefined) {
      wall.scaleMeasured++;
      if (j.nationalReached) wall.national++;
      if (j.tableEntered) wall.table++;
      if (j.tableWaiting) wall.tableWaiting++;
      if (Number.isFinite(j.maxStanding) && (wall.maxStanding == null || j.maxStanding > wall.maxStanding)) wall.maxStanding = j.maxStanding;
      if (Number.isFinite(j.standingFinal)) standingFinals.push(j.standingFinal);
    }
    perSeed.push({ seed: j.seed, days: j.days, end: j.endReason, won: !!j.won,
      spawnsW4: j.spawnsW4, tbCalls: j.tbCalls, exposures: (j.exposures || []).length,
      fieldW4: j.fieldCallsW4, kills: (j.killRows || []).length, escapes: seedEscapes,
      fleeTriggered: seedFleeTrig, pushes: seedPushes, turns: seedTurns,
      loopFights: seedLoops.length,
      failedApproachTurns: seedAp.reduce(function (n, r) { return n + r.approachStepTurns; }, 0),
      fleeWalkTurns: seedAp.reduce(function (n, r) { return n + r.fleeWalkTurns; }, 0),
      otherBlockedTurns: seedAp.reduce(function (n, r) { return n + r.otherBlockedTurns; }, 0),
      fallbackEvents: seedAp.reduce(function (n, r) { return n + r.fallbackEvents; }, 0),
      fallbackFights: seedAp.filter(function (r) { return r.fallbackEvents > 0; }).length,
      maxRun: seedAp.reduce(function (m, r) { return Math.max(m, r.maxSameStepRun); }, 0),
      orphans: (j.orphanTbEnds || []).length,
      errors: (j.instrumentErrors || []).length,
      unended: (j.exposures || []).filter(function (e) { return !e.end; }).length,
      rankFinal: j.scaleRankFinal !== undefined ? j.scaleRankFinal : null,
      standingFinal: j.standingFinal !== undefined ? j.standingFinal : null,
      maxStanding: j.maxStanding !== undefined ? j.maxStanding : null,
      national: j.nationalReached !== undefined ? !!j.nationalReached : null,
      tableEntered: j.tableEntered !== undefined ? !!j.tableEntered : null,
      tableWaiting: j.tableWaiting !== undefined ? !!j.tableWaiting : null,
      arcFinal: j.arcFinal !== undefined ? j.arcFinal : null,
      scaleReadError: j.scaleReadError !== undefined ? j.scaleReadError : null });
  }
  wall.medianStandingFinal = median(standingFinals);
  console.log(JSON.stringify({ files: files, perSeed: perSeed,
    totals: { exposures: exposures, tbKillsLinked: kills, escapes: escapes,
      fleeTriggeredFights: fleeTriggered, barrierPushes: barrierPushes,
      turnsTotal: turnsTotal, fleeAttemptTurns: fleeTurns, zeroTileMoves: zeroTileMoves,
      approachLoopFights: loopFights, loopFightList: loopFightList,
      failedApproachTurns: failedApproachTurns, fleeWalkTurns: fleeWalkTurns,
      otherBlockedTurns: otherBlockedTurns, fallbackEvents: fallbackEvents,
      fallbackFights: fallbackFights, noPathLines: noPathLines,
      waitTurns: waitTurns, maxSameStepRun: maxRuns.length ? Math.max.apply(null, maxRuns) : 0,
      medianStrikesPerFight: median(strikesPerFight),
      medianStrikesLost: median(strikesLost),
      medianFracLost: median(fracLost), medianFracAll: median(fracAll),
      medianSurvivalDays: median(survDays),
      starvationDeaths: starvationDeaths, starvationPlayerDeaths: starvationPlayerDeaths,
      deathCauses: deathCauses, wall: wall } }, null, 2));
}
main();
