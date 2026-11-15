// ove48-mech-causal-20261114.js — (c) CAUSAL PATH analyzer for the
// OVE-48 revert-vs-keep sub-questions arm (sim-ove48-mech-a, Loop A
// fleshout-20261115T0215Z). NO new sims: it analyzes the EXISTING
// ove48-conv corpora (evidence/2026-11-14/
// perseed-ove48-conv-t-ove48-conv-base/ and -subj/, V5-replicated
// to band 3) per seed, judging the prereg's checklist
// (evidence/2026-11-14/sim-ove48-mech-prereg.md):
//   (1) kcal cost of opens (10 kcal x opens); (2) tick cost (1 tick
//   x opens) vs the 512-tick day; (3) trust stipend (0-exchange
//   walk-outs pay 0); (4) mood residue (needs 3+ exchanges in a
//   substantive conversation — 0 on walk-out legs); (5) favor
//   promises / teaching / knowledge (need turns or acceptance — 0
//   on walk-out legs); (6) fight outcomes per seed; (7) daily
//   pantry / roster-alive / trust / standing / wave-kill
//   trajectories — first SUSTAINED divergence day per series vs
//   the first day the death sets diverge.
// A state series "diverges" only on a sustained, material move:
// pantry |delta| > 10% of the seed's mean pantry for 3+ consecutive
// days; trust |delta| > 5 for 3+ consecutive days; roster-alive
// count differs on 3+ consecutive days; cumulative wave kills
// differ by >= 2. Single-day noise is not a divergence.
// PROVEN NEGATIVE (per prereg): checklist (1)–(5) all < 1% of the
// relevant budget AND no state series diverges before the first
// death divergence on any seed. RNG-draw-count drift (weighted-pick
// draws 515 vs 569 -> chaotic trajectory divergence with no
// semantic content) is reported as a candidate non-semantic carrier,
// never as a causal chain.
// Usage: node scripts/ove48-mech-causal-20261114.js
// Writes evidence/2026-11-14/ove48-mech-causal.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];
const BASE_DIR = path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-t-ove48-conv-base');
const SUBJ_DIR = path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-conv-t-ove48-conv-subj');

function seriesMap(samples, key) {
  const out = {};
  const arr = (samples && samples[key]) || [];
  for (const pair of arr) { if (Array.isArray(pair) && pair.length >= 2) out[pair[0]] = pair[1]; }
  return out;
}
function mean(vals) {
  if (!vals.length) return null;
  return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
}
// First day of a run of >= n consecutive days satisfying pred(day).
function firstSustained(days, pred, n) {
  n = n || 3;
  let run = 0, start = null;
  for (const d of days) {
    if (pred(d)) { if (run === 0) start = d; run++; if (run >= n) return start; }
    else { run = 0; start = null; }
  }
  return null;
}
function aliveCount(dailyRow) {
  if (!dailyRow || !Array.isArray(dailyRow.roster)) return null;
  let n = 0;
  for (const r of dailyRow.roster) if (r && !r.dead) n++;
  return n;
}
function waveKillsCum(dailyRow) {
  if (!dailyRow || !Array.isArray(dailyRow.waveKillLog)) return null;
  return dailyRow.waveKillLog.length;
}

function analyzeSeed(seed) {
  const bf = path.join(BASE_DIR, 'ove48conv-s' + seed + '-ove48-conv-pilot-fix.json');
  const sf = path.join(SUBJ_DIR, 'ove48conv-s' + seed + '-ove48-conv-pilot-fix.json');
  const b = JSON.parse(fs.readFileSync(bf, 'utf8'));
  const s = JSON.parse(fs.readFileSync(sf, 'utf8'));
  const bOpens = (b.convo && b.convo.opens) || [];
  const sOpens = (s.convo && s.convo.opens) || [];
  const bDays = b.days || 0, sDays = s.days || 0;
  const bPantry = seriesMap(b.samples, 'pantry');
  const sPantry = seriesMap(s.samples, 'pantry');
  const bTrust = seriesMap(b.samples, 'trust');
  const sTrust = seriesMap(s.samples, 'trust');
  const bStand = seriesMap(b.samples, 'standing');
  const sStand = seriesMap(s.samples, 'standing');
  const bPop = seriesMap(b.samples, 'pop');
  const sPop = seriesMap(s.samples, 'pop');
  const days = [];
  const maxDay = Math.max(bDays, sDays);
  for (let d = 1; d <= maxDay; d++) days.push(d);
  const meanPantry = mean(Object.keys(bPantry).map(function (k) { return bPantry[k]; }).concat(Object.keys(sPantry).map(function (k) { return sPantry[k]; })));

  // (1)+(2) cost accounting — per open: 10 kcal + 1 tick (canon).
  const kcalCost = { base: bOpens.length * 10, subj: sOpens.length * 10, delta: (sOpens.length - bOpens.length) * 10 };
  const tickCost = { base: bOpens.length, subj: sOpens.length, delta: sOpens.length - bOpens.length };
  const tickBudgetBase = bDays * 512, tickBudgetSubj = sDays * 512;
  const kcalShareOfMeanPantry = meanPantry ? (kcalCost.delta / meanPantry) : null;
  const tickShare = tickBudgetBase ? (tickCost.delta / tickBudgetBase) : null;

  // (3) trust stipend: walk-out opens pay 0 (0 exchanges). Any open
  // with exchanges >= 1 would be a nonzero stipend — count them.
  function nonzeroStipendOpens(opens) {
    let n = 0;
    for (const o of opens) if (o.exchangesAtClose != null && o.exchangesAtClose >= 1) n++;
    return n;
  }
  const stipend = { baseHeld: nonzeroStipendOpens(bOpens), subjHeld: nonzeroStipendOpens(sOpens) };
  // (4)+(5): mood residue / favors / teaching all need turns or
  // acceptance; walk-out legs have none by construction. Count any
  // held open as the bound.
  const heldBound = { base: stipend.baseHeld, subj: stipend.subjHeld };

  // (6) fight outcomes.
  const fights = { base: (b.fights || []).length, subj: (s.fights || []).length, baseCasts: (b.casts || []).length, subjCasts: (s.casts || []).length, baseKills: (b.killCalls || []).length, subjKills: (s.killCalls || []).length };

  // (7) sustained state divergences.
  const dailyB = {};
  const dailyS = {};
  for (const row of (b.daily || [])) dailyB[row.day] = row;
  for (const row of (s.daily || [])) dailyS[row.day] = row;
  const pantryDiv = firstSustained(days, function (d) {
    if (bPantry[d] == null || sPantry[d] == null || !meanPantry) return false;
    return Math.abs(bPantry[d] - sPantry[d]) > 0.10 * meanPantry;
  }, 3);
  const trustDiv = firstSustained(days, function (d) {
    if (bTrust[d] == null || sTrust[d] == null) return false;
    return Math.abs(bTrust[d] - sTrust[d]) > 5;
  }, 3);
  const rosterDiv = firstSustained(days, function (d) {
    const ab = aliveCount(dailyB[d]), as = aliveCount(dailyS[d]);
    if (ab == null || as == null) return false;
    return ab !== as;
  }, 3);
  const waveKillDiv = firstSustained(days, function (d) {
    const wb = waveKillsCum(dailyB[d]), ws = waveKillsCum(dailyS[d]);
    if (wb == null || ws == null) return false;
    return Math.abs(wb - ws) >= 2;
  }, 3);
  const standingDiv = firstSustained(days, function (d) {
    if (bStand[d] == null || sStand[d] == null) return false;
    return Math.abs(bStand[d] - sStand[d]) > 50;
  }, 3);

  // Death-set divergence: first day on which the cumulative death
  // sets (who+cause) differ.
  function deathSetAt(deaths, day) {
    const out = {};
    for (const d of (deaths || [])) {
      if (d.day <= day) out[(d.who || '?') + '|' + (d.cause || '?') + '|' + d.day] = true;
    }
    return out;
  }
  function setsEqual(a, b) {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!b[k]) return false;
    return true;
  }
  let deathDiv = null;
  for (const d of days) {
    if (!setsEqual(deathSetAt(b.deaths, d), deathSetAt(s.deaths, d))) { deathDiv = d; break; }
  }
  const firstDeaths = {
    base: (b.deaths || []).slice(0, 3).map(function (d) { return { day: d.day, who: d.who, cause: d.cause }; }),
    subj: (s.deaths || []).slice(0, 3).map(function (d) { return { day: d.day, who: d.who, cause: d.cause }; }),
  };
  const stateDivs = { pantry: pantryDiv, trust: trustDiv, roster: rosterDiv, waveKills: waveKillDiv, standing: standingDiv };
  const earliestStateDiv = Object.keys(stateDivs).map(function (k) { return stateDivs[k]; }).filter(function (x) { return x != null; }).sort(function (a, b2) { return a - b2; })[0] || null;
  return {
    seed: seed,
    days: { base: bDays, subj: sDays },
    survived: { base: (b.endReason === 'survived' || b.days >= 150) && !b.villageLost, subj: (s.endReason === 'survived' || s.days >= 150) && !s.villageLost },
    endReason: { base: b.endReason, subj: s.endReason },
    opens: { base: bOpens.length, subj: sOpens.length, perDayAlive: { base: bDays ? +(bOpens.length / bDays).toFixed(2) : null, subj: sDays ? +(sOpens.length / sDays).toFixed(2) : null } },
    weightedPick: { base: bOpens.filter(function (o) { return o.source === 'weighted-pick'; }).length, subj: sOpens.filter(function (o) { return o.source === 'weighted-pick'; }).length },
    kcalCost: kcalCost, kcalShareOfMeanPantry: kcalShareOfMeanPantry == null ? null : +kcalShareOfMeanPantry.toFixed(4),
    tickCost: tickCost, tickShareOfBudget: tickShare == null ? null : +tickShare.toFixed(4),
    stipend: stipend, heldBound: heldBound,
    fights: fights,
    deaths: { base: (b.deaths || []).length, subj: (s.deaths || []).length, first3: firstDeaths },
    stateDivs: stateDivs, earliestStateDiv: earliestStateDiv, deathDiv: deathDiv,
    stateBeforeDeath: (earliestStateDiv != null && deathDiv != null) ? (earliestStateDiv < deathDiv) : null,
    meanPantry: meanPantry == null ? null : Math.round(meanPantry),
  };
}

function main() {
  const perSeed = [];
  let totalOpensB = 0, totalOpensS = 0, totalWeightedB = 0, totalWeightedS = 0;
  let anyStateBeforeDeath = false, anySemantic = false;
  for (const seed of SEEDS) {
    const r = analyzeSeed(seed);
    perSeed.push(r);
    totalOpensB += r.opens.base; totalOpensS += r.opens.subj;
    totalWeightedB += r.weightedPick.base; totalWeightedS += r.weightedPick.subj;
    if (r.stateBeforeDeath === true) anyStateBeforeDeath = true;
  }
  const kcalDelta = (totalOpensS - totalOpensB) * 10;
  const tickDelta = totalOpensS - totalOpensB;
  // Semantic-cost verdict inputs: (1) kcal delta vs mean pantry,
  // (2) tick delta vs total tick budget, (3) stipend opens (must be 0
  // on walk-out legs), (4)+(5) bounded by held opens (must be 0).
  const meanPantryAll = mean(perSeed.map(function (r) { return r.meanPantry || 0; }).filter(function (x) { return x > 0; }));
  const totalTickBudget = perSeed.reduce(function (a, r) { return a + r.days.base * 512; }, 0);
  const kcalShare = meanPantryAll ? kcalDelta / meanPantryAll : null;
  const tickShare = totalTickBudget ? tickDelta / totalTickBudget : null;
  const totalHeld = perSeed.reduce(function (a, r) { return a + r.stipend.baseHeld + r.stipend.subjHeld; }, 0);
  const semanticSmall = (kcalShare == null || Math.abs(kcalShare) < 0.01) && (tickShare == null || Math.abs(tickShare) < 0.01) && totalHeld === 0;
  let verdict = 'DIAG', why = '';
  if (!semanticSmall) {
    verdict = 'CHAIN-CANDIDATE';
    why = 'a checklist cost is NOT < 1% of budget (kcal share ' + (kcalShare == null ? 'null' : (kcalShare * 100).toFixed(2) + '%') + ', tick share ' + (tickShare == null ? 'null' : (tickShare * 100).toFixed(2) + '%') + ', held opens ' + totalHeld + ') — a semantic cost channel exists; trace it per seed below.';
    anySemantic = true;
  } else if (anyStateBeforeDeath) {
    verdict = 'CHAIN-CANDIDATE';
    why = 'costs are < 1% but a state series diverges before the first death divergence on at least one seed — a semantic lead-in exists; trace it per seed below.';
    anySemantic = true;
  } else {
    verdict = 'PROVEN-NEGATIVE';
    why = 'no downstream state delta attributable to opener choice beyond the pick itself: kcal/tick costs < 1% of budget, 0 held opens (no stipend/mood/favor/teaching channel), and no state series diverges before the first death divergence on any seed. The survival effect is unexplained by this mechanism.';
  }
  const out = {
    verdict: verdict, verdictWhy: why,
    totals: {
      opens: { base: totalOpensB, subj: totalOpensS, delta: totalOpensS - totalOpensB },
      weightedPick: { base: totalWeightedB, subj: totalWeightedS, delta: totalWeightedS - totalWeightedB },
      kcalDelta: kcalDelta, kcalShareOfMeanPantry: kcalShare,
      tickDelta: tickDelta, tickShareOfBudget: tickShare,
      heldOpensTotal: totalHeld,
      anyStateBeforeDeath: anyStateBeforeDeath,
    },
    perSeed: perSeed,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-14', 'ove48-mech-causal.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('ove48-mech CAUSAL: ' + verdict + ' — ' + why);
  console.log('  opens base ' + totalOpensB + ' subj ' + totalOpensS + ' (delta ' + (totalOpensS - totalOpensB) + ', +' + (totalOpensS - totalOpensB) * 10 + ' kcal, +' + tickDelta + ' ticks over 8 seeds)');
  console.log('  weighted-pick draws base ' + totalWeightedB + ' subj ' + totalWeightedS + ' (delta ' + (totalWeightedS - totalWeightedB) + ' RNG draws)');
  console.log('  kcal share of mean pantry ' + (kcalShare == null ? 'null' : (kcalShare * 100).toFixed(2) + '%') + ', tick share of budget ' + (tickShare == null ? 'null' : (tickShare * 100).toFixed(3) + '%') + ', held opens ' + totalHeld);
  for (const r of perSeed) {
    console.log('  seed ' + r.seed + ': days ' + r.days.base + '/' + r.days.subj + ' ' + r.endReason.base + '/' + r.endReason.subj + ' opens ' + r.opens.base + '/' + r.opens.subj + ' (' + r.opens.perDayAlive.base + '/' + r.opens.perDayAlive.subj + '/d) deaths ' + r.deaths.base + '/' + r.deaths.subj + ' stateDivs ' + JSON.stringify(r.stateDivs) + ' deathDiv day ' + r.deathDiv + ' stateBeforeDeath ' + r.stateBeforeDeath);
  }
  console.log('  causal: ' + path.relative(REPO, outFile));
  return out;
}

if (require.main === module) { main(); }

module.exports = { SEEDS: SEEDS, analyzeSeed: analyzeSeed, main: main };
