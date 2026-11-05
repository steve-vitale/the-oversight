// stayrecover-summarize-20261105.js — aggregate stayrecover per-seed JSONs
// into the prereg metrics table (baseline vs fleerepair vs recovery).
// Copy of the fleerepair summarizer (2026-11-04) + recovery metrics
// (eats, HP restored, kcal, rounds survived in lost fights) and the
// approach-loop metric (the fleerepair confirm's metric-review ask).
// Pure read of JSONs.
// Usage: node scripts/stayrecover-summarize-20261105.js <per-seed-dir> [run-filter]
// Prints a JSON summary to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./stayrecover-analyze-20261105');

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
    return f.indexOf('stayrecover-s') === 0 && f.endsWith('.json') && (!filter || f.indexOf(filter) >= 0);
  }).sort();
  const perSeed = [];
  let exposures = 0, kills = 0, escapes = 0, fleeTriggered = 0, barrierPushes = 0;
  let zeroTileMoves = 0, turnsTotal = 0, fleeTurns = 0;
  let totalEats = 0, totalEatHp = 0, totalEatKcal = 0, totalEatKcalMiss = 0;
  let loopFights = 0, loopMaxRun = 0, loopTurns = 0;
  const hpPerEatAll = [], roundsLostAll = [];
  const strikesPerFight = [], strikesLost = [], fracLost = [], fracAll = [];
  const survDays = [];
  let starvationDeaths = 0;
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
    // RECOVERY (stayrecover): eats are kind 'eat' actions that returned
    // true; HP restored reads the action's own pre/post player HP; kcal
    // is parsed from the turn's eat say-line ("250 kcal, +25 HP") —
    // the instrument never reads the pack (packKcal reseeds the pack on
    // first access, so an instrument read could shift the RNG stream).
    let seedEats = 0, seedEatHp = 0, seedEatKcal = 0, seedEatKcalMiss = 0;
    const hpPerEat = [];
    for (const ex of (j.exposures || [])) {
      for (const t of (ex.turns || [])) {
        for (const a of (t.actions || [])) {
          if (a.kind !== 'eat' || a.returned !== true) continue;
          seedEats++;
          const hb = a.pre && a.pre.player ? a.pre.player.hp : null;
          const ha = a.post && a.post.player ? a.post.player.hp : null;
          const gained = (hb != null && ha != null) ? (ha - hb) : null;
          if (gained != null) { seedEatHp += gained; hpPerEat.push(gained); }
          let kcal = null;
          for (const ln of (t.sayLines || [])) {
            const m = /(\d+) kcal, \+(\d+) HP/.exec(ln);
            if (m) { kcal = parseInt(m[1], 10); break; }
          }
          if (kcal != null) seedEatKcal += kcal; else seedEatKcalMiss++;
        }
      }
    }
    // ROUNDS SURVIVED in lost fights: the round the fight ended on.
    const roundsLost = sums.filter(function (x) { return x.outcome === 'fighter-died'; })
      .map(function (x) { return x.rounds; }).filter(function (r) { return r != null; });
    // APPROACH LOOP (stayrecover; the fleerepair confirm's metric-review
    // ask): consecutive player turns that are move-only, out of range at
    // start, not a flee attempt, and whose every move leaves the fighter
    // on the same tile. Fights whose longest such run is >= 3.
    let seedLoopFights = 0, seedLoopMax = 0, seedLoopTurns = 0;
    for (let ei = 0; ei < (j.exposures || []).length; ei++) {
      const ex = j.exposures[ei];
      const ss = sums[ei];
      let run = 0, maxRun = 0, loopTurnsEx = 0;
      const turns = (ex.turns || []);
      for (let ti = 0; ti < turns.length; ti++) {
        const t = turns[ti];
        const st = (ss && ss.turns && ss.turns[ti]) || null;
        const acts = t.actions || [];
        const moveOnlyZero = acts.length > 0 && acts.every(function (a) {
          return a.kind === 'move' && a.pre && a.post && a.pre.player && a.post.player &&
            a.pre.player.mx === a.post.player.mx && a.pre.player.my === a.post.player.my;
        });
        const isLoop = moveOnlyZero && st && st.flags && st.flags.outOfRangeAtStart === true && !st.flags.fleeAttempt;
        if (isLoop) { run++; loopTurnsEx++; if (run > maxRun) maxRun = run; }
        else run = 0;
      }
      if (maxRun >= 3) seedLoopFights++;
      if (maxRun > seedLoopMax) seedLoopMax = maxRun;
      seedLoopTurns += loopTurnsEx;
    }
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
    totalEats += seedEats; totalEatHp += seedEatHp; totalEatKcal += seedEatKcal;
    totalEatKcalMiss += seedEatKcalMiss;
    for (const h of hpPerEat) hpPerEatAll.push(h);
    for (const r of roundsLost) roundsLostAll.push(r);
    loopFights += seedLoopFights;
    if (seedLoopMax > loopMaxRun) loopMaxRun = seedLoopMax;
    loopTurns += seedLoopTurns;
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
      eats: seedEats, eatHp: seedEatHp, eatKcal: seedEatKcal, eatKcalMiss: seedEatKcalMiss,
      medianHpPerEat: median(hpPerEat), medianRoundsLost: median(roundsLost),
      loopFights: seedLoopFights, loopMaxRun: seedLoopMax, loopTurns: seedLoopTurns,
      fleeTriggered: seedFleeTrig, pushes: seedPushes, turns: seedTurns,
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
      medianStrikesPerFight: median(strikesPerFight),
      medianStrikesLost: median(strikesLost),
      medianFracLost: median(fracLost), medianFracAll: median(fracAll),
      medianSurvivalDays: median(survDays),
      medianRoundsLost: median(roundsLostAll),
      eats: totalEats, eatHpTotal: totalEatHp, eatKcalTotal: totalEatKcal,
      medianHpPerEat: median(hpPerEatAll), eatKcalMiss: totalEatKcalMiss,
      approachLoopFights: loopFights, approachLoopMaxRun: loopMaxRun,
      approachLoopTurns: loopTurns,
      starvationDeaths: starvationDeaths, deathCauses: deathCauses, wall: wall } }, null, 2));
}
main();
