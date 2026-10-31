#!/usr/bin/env node
// analyze-tickfell-a.js — tickfell census (sim-tickfell-a).
// Pure reads over tickfell-trace-a corpora. No game writes, no
// RNG, no policy edits. For each corpus dir: per seed, creek /
// still / rescued counts from woodcarry records (still = bucket
// creek + rescued false; rescued = bucket creek + rescued true),
// still loop-days, maximal still-run length (over ALL runs,
// singletons included — the GO length clause counts a
// singleton run as length 1), strand runs of length >= 2 (the
// lackingline census scope, reported alongside), strand
// mornings (loop-days following a still evening) joined to the
// tickfell store record for that loop-day, morning axe snaps,
// player-death day (earliest player:true death, or game-over
// day when daysAlive < 30), and wave reach. The GO judgement
// (both-evening overlap of the two control legs, rescues on
// the tickfell legs, length and death comparisons) is computed
// by judgeLegs() from four per-leg analyses and printed as
// JSON; the evidence file quotes it, never re-derives it by
// hand.
//
// Usage: node scripts/analyze-tickfell-a.js <controlGuardDir>
//   <controlOnDir> <tickfellGuardDir> <tickfellOnDir>
//   prints JSON to stdout.
'use strict';
const fs = require('fs');
const path = require('path');

function runsOf(days) {
  const runs = [];
  let cur = [];
  for (const d of days) {
    if (cur.length && d !== cur[cur.length - 1] + 1) { runs.push(cur); cur = []; }
    cur.push(d);
  }
  if (cur.length) runs.push(cur);
  return runs;
}

function analyzeLeg(dir, leg) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const out = { leg, dir, files: files.length, seeds: {}, strandSeeds: [] };
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const seed = doc.seed;
    const evenings = doc.evenings || [];
    const stillDays = [];
    const rescuedDays = [];
    const creekDays = [];
    const perEvening = {};
    for (const row of evenings) {
      const wc = row.woodcarry || null;
      if (!wc || wc.bucket !== 'creek') continue;
      creekDays.push(row.loopDay);
      const cls = wc.classification || {};
      perEvening[row.loopDay] = {
        loopDay: row.loopDay, rescued: !!wc.rescued, skip: (wc.bridge && wc.bridge.skip) || null,
        narration: wc.narration || null,
        wood: (cls.woodPlayer === undefined ? null : cls.woodPlayer),
        kcal: (cls.kcalLive === undefined || cls.kcalLive === null) ? (cls.kcal === undefined ? null : cls.kcal) : cls.kcalLive,
        ticks: (cls.ticksToDayEnd === undefined ? null : cls.ticksToDayEnd),
      };
      if (wc.rescued) rescuedDays.push(row.loopDay);
      else stillDays.push(row.loopDay);
    }
    const runs = runsOf(stillDays);
    const maxRun = runs.reduce((m, r) => Math.max(m, r.length), 0);
    const strandRuns = runs.filter((r) => r.length >= 2);
    // Strand mornings: loop-days following a still evening.
    const tf = doc.tickfellStore || { attempts: [], skips: [] };
    const tfByDay = {};
    for (const a of (tf.attempts || [])) tfByDay[a.loopDay] = Object.assign({ kind: 'attempt' }, a);
    for (const s of (tf.skips || [])) if (!tfByDay[s.loopDay]) tfByDay[s.loopDay] = Object.assign({ kind: 'skip' }, s);
    const strandMornings = [];
    for (const d of stillDays) {
      const m = d + 1;
      strandMornings.push({ morningLoopDay: m, followsStillLoopDay: d,
        tickfellRecord: tfByDay[m] || null,
        morningSnap: (doc.mornings || []).find((x) => x.loopDay === m) || null });
    }
    // Morning axe snaps on ALL mornings (presence table).
    const axeMornings = (doc.mornings || []).map((m) => ({
      loopDay: m.loopDay, tier: m.morningAxe ? m.morningAxe.tier : null,
      toolName: m.morningAxe ? m.morningAxe.toolName : null,
      canFell: m.morningAxe ? m.morningAxe.canFell : null,
      morningDayTicks: (m.morningDayTicks === undefined ? null : m.morningDayTicks),
      morningWood: (m.morningWood === undefined ? null : m.morningWood),
      kcal: (m.kcal === undefined ? null : m.kcal) }));
    const axeStrandMornings = axeMornings.filter((m) => stillDays.indexOf(m.loopDay - 1) !== -1);
    // Death (addendum definition): earliest player:true death,
    // else game-over day when the run ends before day 30.
    const playerDeaths = (doc.deaths || []).filter((x) => x && x.player === true);
    const playerDeathDay = playerDeaths.length ? Math.min.apply(null, playerDeaths.map((x) => x.day)) : null;
    const gameOverDay = (doc.daysAlive < 30) ? doc.daysAlive : null;
    const deathDay = (playerDeathDay !== null) ? playerDeathDay : gameOverDay;
    out.seeds[seed] = { seed, file: f, daysAlive: doc.daysAlive, endReason: doc.endReason,
      maxWaveUnlocked: doc.maxWaveUnlocked, errs: { wc: (doc.woodcarryStore || {}).errs, ww: (doc.warmthStore || {}).errs, tf: tf.errs },
      creek: creekDays.length, still: stillDays.length, rescued: rescuedDays.length,
      stillDays, rescuedDays, creekDays, runs, maxRun, strandRuns, perEvening,
      strandMornings, axeMornings, axeStrandMornings,
      playerDeathDay, gameOverDay, deathDay,
      tickfellAttempts: (tf.attempts || []).length, tickfellSkips: (tf.skips || []).length,
      cutTreeCalls: (tf.attempts || []).filter((a) => a.fired).length };
    if (strandRuns.length) out.strandSeeds.push(seed);
  }
  return out;
}

function judgeLegs(cg, co, tg, to) {
  const seeds = Object.keys(cg.seeds).map(Number).sort((a, b) => a - b);
  const perSeed = {};
  let goRescues = 0;
  let lengthIncrease = [];
  let earlierDeath = [];
  for (const seed of seeds) {
    const cgs = cg.seeds[seed], cos = co.seeds[seed];
    const tgs = tg.seeds[seed], tos = to.seeds[seed];
    if (!cgs || !cos || !tgs || !tos) { perSeed[seed] = { error: 'missing leg' }; continue; }
    const bothEvenings = cgs.stillDays.filter((d) => cos.stillDays.indexOf(d) !== -1);
    const rescuedOn = {};
    for (const d of bothEvenings) {
      const g = tgs.perEvening[d], o = tos.perEvening[d];
      rescuedOn[d] = { guard: !!(g && g.rescued), on: !!(o && o.rescued) };
      if (rescuedOn[d].guard || rescuedOn[d].on) goRescues++;
    }
    const len = {
      guard: { control: { still: cgs.still, maxRun: cgs.maxRun }, tickfell: { still: tgs.still, maxRun: tgs.maxRun },
        increased: (tgs.still > cgs.still) || (tgs.maxRun > cgs.maxRun) },
      on: { control: { still: cos.still, maxRun: cos.maxRun }, tickfell: { still: tos.still, maxRun: tos.maxRun },
        increased: (tos.still > cos.still) || (tos.maxRun > cos.maxRun) },
    };
    if (len.guard.increased) lengthIncrease.push(seed + ':guard');
    if (len.on.increased) lengthIncrease.push(seed + ':on');
    const death = {
      guard: { control: cgs.deathDay, tickfell: tgs.deathDay,
        earlier: (tgs.deathDay !== null && (cgs.deathDay === null || tgs.deathDay < cgs.deathDay)) },
      on: { control: cos.deathDay, tickfell: tos.deathDay,
        earlier: (tos.deathDay !== null && (cos.deathDay === null || tos.deathDay < cos.deathDay)) },
    };
    if (death.guard.earlier) earlierDeath.push(seed + ':guard');
    if (death.on.earlier) earlierDeath.push(seed + ':on');
    perSeed[seed] = { bothEvenings, rescuedOn, len, death,
      controlStrand: { guard: cgs.strandRuns, on: cos.strandRuns },
      tickfellStrand: { guard: tgs.strandRuns, on: tos.strandRuns } };
  }
  const clauseA = goRescues >= 1;
  const clauseB = lengthIncrease.length === 0;
  const clauseC = earlierDeath.length === 0;
  return { perSeed, goRescues, lengthIncrease, earlierDeath,
    clauseA, clauseB, clauseC, verdict: (clauseA && clauseB && clauseC) ? 'GO' : 'NO-GO' };
}

if (require.main === module) {
  const [cgDir, coDir, tgDir, toDir] = process.argv.slice(2);
  if (!cgDir || !coDir || !tgDir || !toDir) {
    console.error('usage: analyze-tickfell-a.js <controlGuardDir> <controlOnDir> <tickfellGuardDir> <tickfellOnDir>');
    process.exit(2);
  }
  const cg = analyzeLeg(cgDir, 'control-guard');
  const co = analyzeLeg(coDir, 'control-on');
  const tg = analyzeLeg(tgDir, 'tickfell-guard');
  const to = analyzeLeg(toDir, 'tickfell-on');
  console.log(JSON.stringify({ legs: { cg, co, tg, to }, judgement: judgeLegs(cg, co, tg, to) }, null, 2));
}

module.exports = { analyzeLeg, judgeLegs, runsOf };
