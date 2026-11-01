#!/usr/bin/env node
// analyze-death17549-b.js — 17549 death-cause trace analyzer (DIAG ONLY).
// (sim-death17549-b; prereg: evidence/2026-11-01/sim-death17549-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Reads ONE absencehunt/creekseek corpus JSON (the committed awayeve pilot
// corpus for seed 17549) and extracts the dated causal chain: pantry
// trajectory from morning/evening snaps, hungry-day markers + resets from
// the full say-line stream, game-over classification BY NARRATED LINE ONLY
// (scattering / extinction / no-successor / none), deaths verbatim,
// succession days, and gross deposit/meal flows as quoted lines.
// Trajectory numbers come from snapshots ONLY; quoted draws are gross
// flows, never summed into the trajectory (see prereg metric review).
//
// Usage: node scripts/analyze-death17549-b.js <corpus.json> [out.json]
//   With out.json: writes the census JSON there. Without: prints it.
//   Exit 0 with the census; exit 2 on unreadable corpus.
'use strict';
const fs = require('fs');

function sayLinesOf(corpus) {
  return Array.isArray(corpus.sayLines) ? corpus.sayLines : [];
}

// Sleep slice after loopDay N (1-based): from evenings[N-1].saySeqAtEvening
// to decisions[N].saySeqAtMorning (the next morning), or to end of stream
// for the final day. Say day fields during sleep still carry day N until
// dawn, so slices are cut by SEQUENCE, never by day field.
function sleepSlice(corpus, loopDay) {
  const evs = corpus.evenings || [];
  const decs = corpus.decisions || [];
  const lines = sayLinesOf(corpus);
  if (loopDay < 1 || loopDay > evs.length) return [];
  const start = evs[loopDay - 1].saySeqAtEvening;
  const end = loopDay < decs.length ? decs[loopDay].saySeqAtMorning : lines.length + 1000000;
  return lines.filter((s) => s.seq >= start && s.seq < end);
}

function pantryTrajectory(corpus) {
  const rows = [];
  const decs = corpus.decisions || [];
  const evs = corpus.evens || corpus.evenings || [];
  for (let i = 0; i < decs.length; i++) {
    const ev = evs[i];
    if (!ev) break;
    const m = decs[i].pantry ? decs[i].pantry.kcal : null;
    const e = ev.pantry ? ev.pantry.kcal : null;
    const prevE = i > 0 && evs[i - 1].pantry ? evs[i - 1].pantry.kcal : null;
    rows.push({
      loopDay: decs[i].loopDay,
      vessel: decs[i].morning ? decs[i].morning.vesselId : null,
      morningTile: decs[i].morning ? decs[i].morning.tile : null,
      eveningTile: ev.tile || null,
      eveningKcal: ev.kcal != null ? ev.kcal : null,
      pantryMorning: m, pantryEvening: e,
      overnightDelta: (m != null && prevE != null) ? m - prevE : null,
      daytimeDelta: (m != null && e != null) ? e - m : null,
      eveningOutcome: ev.eveningOutcome || null,
    });
  }
  return rows;
}

function hungryStreak(corpus) {
  const markers = []; // {loopDay, n} per "Day N of hunger" line, by sleep slice
  const resets = [];  // loopDays whose sleep slice carries "Haven eats again"
  let gameOver = { kind: 'none', loopDay: null, line: null };
  const evs = corpus.evenings || [];
  for (let d = 1; d <= evs.length; d++) {
    const slice = sleepSlice(corpus, d);
    for (const s of slice) {
      const m = s.line.match(/Haven's pantry is empty\. Day (\d+) of hunger/);
      if (m) markers.push({ loopDay: d, n: parseInt(m[1], 10), line: s.line });
      if (/Haven eats again/.test(s.line)) resets.push(d);
      if (/Haven couldn't hold/.test(s.line) && gameOver.kind === 'none') {
        gameOver = { kind: 'scattering', loopDay: d, line: s.line };
      }
      if (/Nobody is left\. Not scattered/.test(s.line) && gameOver.kind === 'none') {
        gameOver = { kind: 'extinction', loopDay: d, line: s.line };
      }
      if (/No one is left to pick up the Codex/.test(s.line) && gameOver.kind === 'none') {
        gameOver = { kind: 'no-successor', loopDay: d, line: s.line };
      }
    }
  }
  return { markers, resets, gameOver };
}

function successions(corpus) {
  const days = [];
  const decs = corpus.decisions || [];
  for (let i = 1; i < decs.length; i++) {
    const a = decs[i - 1].morning ? decs[i - 1].morning.vesselId : null;
    const b = decs[i].morning ? decs[i].morning.vesselId : null;
    if (a && b && a !== b) days.push({ loopDay: decs[i].loopDay, from: a, to: b });
  }
  return days;
}

// Gross quoted flows. Each entry: {loopDay (sleep-slice day), kcal, line}.
// loopDay here is the sleep slice's day (say day field during sleep equals
// the just-ended day), which is the honest attribution for sleep lines;
// daytime lines carry their own loopDay via the evening dayLines index.
function quotedFlows(corpus) {
  const forage = [], expedition = [], unload = [], keepOnly = [], meals = [];
  const lines = sayLinesOf(corpus);
  for (const s of lines) {
    let m;
    m = s.line.match(/returns from foraging the wilds: \+(\d+) kcal to the pantry/);
    if (m) { forage.push({ day: s.day, kcal: parseInt(m[1], 10), line: s.line }); continue; }
    m = s.line.match(/is back from past the \w+ \(\+(\d+) kcal for the pantry/);
    if (m) { expedition.push({ day: s.day, kcal: parseInt(m[1], 10), line: s.line }); continue; }
    m = s.line.match(/unload (\d+) kcal into Haven's pantry/);
    if (m) { unload.push({ day: s.day, kcal: parseInt(m[1], 10), line: s.line }); continue; }
    if (/keep a day's food.*nothing extra for the pantry/.test(s.line)) {
      keepOnly.push({ day: s.day, line: s.line }); continue;
    }
    m = s.line.match(/Village meal: \+(\d+) kcal.*from the communal pantry/);
    if (m) { meals.push({ day: s.day, kcal: parseInt(m[1], 10), line: s.line }); continue; }
  }
  return { forage, expedition, unload, keepOnly, meals };
}

function textureCounts(corpus) {
  const lines = sayLinesOf(corpus);
  let fishedOut = 0, gardenUnripe = 0, woundedRest = 0, reliefOffer = 0, reliefTaken = 0;
  for (const s of lines) {
    if (/walked the banks — the water's fished out/.test(s.line)) fishedOut++;
    if (/works the garden — watered, weeded, turned\. Nothing ripe yet/.test(s.line)) gardenUnripe++;
    if (/still hurting .* — no healer at haven\. They rest today instead of ranging out/.test(s.line)) woundedRest++;
    if (/Relief is open — triage, rations, hunt, or rally/.test(s.line)) reliefOffer++;
  }
  return { fishedOut, gardenUnripe, woundedRest, reliefOffer, reliefTaken };
}

function analyze(corpus) {
  const traj = pantryTrajectory(corpus);
  const hun = hungryStreak(corpus);
  return {
    seed: corpus.seed, policy: corpus.policy,
    endReason: corpus.endReason, daysAlive: corpus.daysAlive, gameDays: corpus.gameDays,
    maxWaveUnlocked: corpus.maxWaveUnlocked, waveKills: corpus.waveKills,
    deaths: corpus.deaths || [],
    successions: successions(corpus),
    pantryTrajectory: traj,
    hungryMarkers: hun.markers, hungryResets: hun.resets, gameOver: hun.gameOver,
    flows: quotedFlows(corpus),
    texture: textureCounts(corpus),
    errs: corpus.errCount || 0,
    evenings: (corpus.evenings || []).length, decisions: (corpus.decisions || []).length,
  };
}

function corporaIdentical(a, b) {
  const la = sayLinesOf(a).map((s) => s.line);
  const lb = sayLinesOf(b).map((s) => s.line);
  if (la.length !== lb.length) return false;
  for (let i = 0; i < la.length; i++) if (la[i] !== lb[i]) return false;
  return JSON.stringify(a.decisions) === JSON.stringify(b.decisions);
}

if (require.main === module) {
  const inPath = process.argv[2];
  const outPath = process.argv[3] || null;
  if (!inPath) { console.error('usage: analyze-death17549-b.js <corpus.json> [out.json]'); process.exit(2); }
  let corpus;
  try { corpus = JSON.parse(fs.readFileSync(inPath, 'utf8')); }
  catch (e) { console.error('cannot read corpus: ' + e.message); process.exit(2); }
  const census = analyze(corpus);
  const text = JSON.stringify(census, null, 2) + '\n';
  if (outPath) fs.writeFileSync(outPath, text);
  else process.stdout.write(text);
}

module.exports = { analyze, pantryTrajectory, hungryStreak, successions, quotedFlows, textureCounts, sleepSlice, corporaIdentical };
