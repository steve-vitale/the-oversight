// fleerepair-summarize-20261104.js — aggregate fleerepair per-seed JSONs
// into the prereg metrics table (baseline vs armed). Pure read of JSONs.
// Usage: node scripts/fleerepair-summarize-20261104.js <per-seed-dir> [run-filter]
// Prints a JSON summary to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./fleerepair-analyze-20261104');

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
    return f.indexOf('fleerepair-s') === 0 && f.endsWith('.json') && (!filter || f.indexOf(filter) >= 0);
  }).sort();
  const perSeed = [];
  let exposures = 0, kills = 0, escapes = 0, fleeTriggered = 0, barrierPushes = 0;
  let zeroTileMoves = 0, turnsTotal = 0, fleeTurns = 0;
  const strikesPerFight = [], strikesLost = [], fracLost = [], fracAll = [];
  const survDays = [];
  let starvationDeaths = 0;
  const deathCauses = {};
  const wall = { wins: 0, national: 0, table: 0, wave4faced: 0, wave4kills: 0, wave5faced: 0 };
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
      if (String(c).toLowerCase().indexOf('starv') >= 0) starvationDeaths++;
    }
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
    perSeed.push({ seed: j.seed, days: j.days, end: j.endReason, won: !!j.won,
      spawnsW4: j.spawnsW4, tbCalls: j.tbCalls, exposures: (j.exposures || []).length,
      fieldW4: j.fieldCallsW4, kills: (j.killRows || []).length, escapes: seedEscapes,
      fleeTriggered: seedFleeTrig, pushes: seedPushes, turns: seedTurns,
      orphans: (j.orphanTbEnds || []).length,
      errors: (j.instrumentErrors || []).length,
      unended: (j.exposures || []).filter(function (e) { return !e.end; }).length });
  }
  console.log(JSON.stringify({ files: files, perSeed: perSeed,
    totals: { exposures: exposures, tbKillsLinked: kills, escapes: escapes,
      fleeTriggeredFights: fleeTriggered, barrierPushes: barrierPushes,
      turnsTotal: turnsTotal, fleeAttemptTurns: fleeTurns, zeroTileMoves: zeroTileMoves,
      medianStrikesPerFight: median(strikesPerFight),
      medianStrikesLost: median(strikesLost),
      medianFracLost: median(fracLost), medianFracAll: median(fracAll),
      medianSurvivalDays: median(survDays),
      starvationDeaths: starvationDeaths, deathCauses: deathCauses, wall: wall } }, null, 2));
}
main();
