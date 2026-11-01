#!/usr/bin/env node
// analyze-p3reset-b.js — 17549 P3 reset-mechanism analyzer (DIAG ONLY).
// (sim-p3reset-b; prereg: evidence/2026-11-01/sim-p3reset-b-prereg.md,
// committed BEFORE any judged table.)
//
// Reads ONE absencehunt corpus JSON (the committed awayeve pilot corpus
// for seed 17549) and builds the per-night pantry-flow table: for each
// night N, the sleep(N) line-prefix (from evenings[N-1].saySeqAtEvening
// up to, excluding, the "— DAY N+1 DAWN —" line), opening pantry
// (evenings[N]), closing pantry (decisions[N+1], null when the leg
// ended), the overnight bridge (closing − opening = sleep(N) net +
// waits(N+1) net — the corpus alone CANNOT split those two terms),
// hungry markers/resets by sleep slice, and every kcal/pantry line in
// the night window tagged by phase (sleep / wait / daily).
//
// ITEMIZATION (prereg, strict): a reset night is FULL only with
// pantry-at-check evidence, which the corpus cannot supply (the
// evening/morning snaps bracket sleep + wait-phase together, and the
// away scholar's deposit paths narrate nothing — presence-gated).
// Corpus-stage verdicts for reset nights are therefore UNITEMIZED
// with the reason stated, never defaulted to a mechanism class.
// Instrumented legs (drive-p3reset-b.js) supply pantry-at-check;
// the evidence judges FULL only under the prereg's reproduction rule.
//
// Usage: node scripts/analyze-p3reset-b.js <corpus.json> [out.json]
//   With out.json: writes the tables JSON there. Without: prints it.
//   Exit 0 with the tables; exit 2 on unreadable corpus.
'use strict';
const fs = require('fs');

function sayLinesOf(corpus) {
  return Array.isArray(corpus.sayLines) ? corpus.sayLines : [];
}

// Sleep slice after loopDay N (superset, death17549 semantics): from
// evenings[N-1].saySeqAtEvening to decisions[N].saySeqAtMorning.
function sleepSlice(corpus, loopDay) {
  const evs = corpus.evenings || [];
  const decs = corpus.decisions || [];
  const lines = sayLinesOf(corpus);
  if (loopDay < 1 || loopDay > evs.length) return [];
  const start = evs[loopDay - 1].saySeqAtEvening;
  const end = loopDay < decs.length ? decs[loopDay].saySeqAtMorning : lines.length + 1000000;
  return lines.filter((s) => s.seq >= start && s.seq < end);
}

// Sleep(N) line-prefix: the slice up to (excluding) the DAY N+1 DAWN line.
// Everything after the dawn line in the slice is the next day's
// wait-phase lines, not sleep.
function sleepPrefix(corpus, loopDay) {
  const slice = sleepSlice(corpus, loopDay);
  const out = [];
  const dawn = new RegExp('DAY ' + (loopDay + 1) + ' DAWN');
  for (const s of slice) {
    if (dawn.test(s.line)) break;
    out.push(s);
  }
  return out;
}

function pantryTrajectory(corpus) {
  const rows = [];
  const decs = corpus.decisions || [];
  const evs = corpus.evenings || [];
  for (let i = 0; i < decs.length; i++) {
    const ev = evs[i];
    if (!ev) break;
    const m = decs[i].pantry ? decs[i].pantry.kcal : null;
    const e = ev.pantry ? ev.pantry.kcal : null;
    const prevE = i > 0 && evs[i - 1].pantry ? evs[i - 1].pantry.kcal : null;
    rows.push({
      loopDay: decs[i].loopDay,
      pantryMorning: m, pantryEvening: e,
      overnightDelta: (m != null && prevE != null) ? m - prevE : null,
      daytimeDelta: (m != null && e != null) ? e - m : null,
    });
  }
  return rows;
}

function hungryStreak(corpus) {
  const markers = [];
  const resets = [];
  let gameOver = { kind: 'none', loopDay: null, line: null };
  const evs = corpus.evenings || [];
  for (let d = 1; d <= evs.length; d++) {
    const slice = sleepSlice(corpus, d);
    for (const s of slice) {
      const m = s.line.match(/Haven's pantry is empty\. Day (\d+) of hunger/);
      if (m) markers.push({ loopDay: d, n: parseInt(m[1], 10), line: s.line, seq: s.seq });
      if (/Haven eats again/.test(s.line)) resets.push({ loopDay: d, seq: s.seq, line: s.line });
      if (/Haven couldn't hold/.test(s.line) && gameOver.kind === 'none') {
        gameOver = { kind: 'scattering', loopDay: d, line: s.line, seq: s.seq };
      }
      if (/Nobody is left\. Not scattered/.test(s.line) && gameOver.kind === 'none') {
        gameOver = { kind: 'extinction', loopDay: d, line: s.line, seq: s.seq };
      }
      if (/No one is left to pick up the Codex/.test(s.line) && gameOver.kind === 'none') {
        gameOver = { kind: 'no-successor', loopDay: d, line: s.line, seq: s.seq };
      }
    }
  }
  return { markers, resets, gameOver };
}

// Phase-tag every kcal/pantry line in the night-N window:
//   sleep: sleepPrefix(N) lines
//   wait:  slice(N) lines after the dawn line, up to the morning snap
//   daily: policy.daily(N) lines [morningSnap(N), eveningSnap(N))
// Deposit patterns (pantry inflows): forage return, big-day haul,
// routine haul ("came back with N kcal", "The pantry breathes"),
// expedition return, scholar unload, granary draw (unnamed kcal).
// Pack lines (scholar bundle, trap) and raid takes are tagged
// explicitly so they are NEVER counted as pantry inflows.
function windowLines(corpus, loopDay) {
  const evs = corpus.evenings || [];
  const decs = corpus.decisions || [];
  if (loopDay < 1 || loopDay > evs.length) return [];
  const out = [];
  const slice = sleepSlice(corpus, loopDay);
  const dawn = new RegExp('DAY ' + (loopDay + 1) + ' DAWN');
  let seenDawn = false;
  // Previous-line lookup (by seq) for the paired pantry-eat pattern:
  // "Took Foraged food." immediately followed by
  // "You eat Foraged food (N kcal)." is a pantry draw (the scholar
  // at haven eating the pantry's 'Foraged food' item). The same eat
  // line WITHOUT the Took line is pack food, never counted.
  const all = sayLinesOf(corpus);
  const prevText = new Map();
  for (let i = 1; i < all.length; i++) prevText.set(all[i].seq, all[i - 1].line);
  const push = (s, phase) => {
    const e = classifyPantryLine(s.line);
    if (!e) return;
    if (e.kind === 'scholar-pantry-eat' && prevText.get(s.seq) !== 'Took Foraged food.') return;
    out.push({ seq: s.seq, day: s.day, phase, kind: e.kind, kcal: e.kcal, line: s.line });
  };
  for (const s of slice) {
    if (!seenDawn && dawn.test(s.line)) seenDawn = true;
    push(s, seenDawn ? 'wait' : 'sleep');
  }
  // Daily(N) lines: [morningSnap(N), eveningSnap(N)).
  const mSnap = decs[loopDay - 1].saySeqAtMorning;
  const eSnap = evs[loopDay - 1].saySeqAtEvening;
  for (const s of sayLinesOf(corpus)) {
    if (s.seq >= mSnap && s.seq < eSnap) push(s, 'daily');
  }
  out.sort((a, b) => a.seq - b.seq);
  return out;
}

function classifyPantryLine(line) {
  let m;
  m = line.match(/returns from foraging the wilds: \+(\d+) kcal to the pantry/);
  if (m) return { kind: 'forage-return', kcal: parseInt(m[1], 10) };
  m = line.match(/had the day of their life — (\d+) kcal/);
  if (m) {
    const dep = line.match(/(\d+) kcal goes in/);
    return { kind: 'big-day-haul', kcal: dep ? parseInt(dep[1], 10) : parseInt(m[1], 10) };
  }
  m = line.match(/came back with (\d+) kcal of something edible/);
  if (m) {
    const dep = line.match(/(\d+) kcal in,/);
    return { kind: 'routine-haul', kcal: dep ? parseInt(dep[1], 10) : parseInt(m[1], 10) };
  }
  m = line.match(/is back from past the \w+ \(\+(\d+) kcal for the pantry/);
  if (m) return { kind: 'expedition-return', kcal: parseInt(m[1], 10) };
  m = line.match(/unload (\d+) kcal into Haven's pantry/);
  if (m) return { kind: 'scholar-unload', kcal: parseInt(m[1], 10) };
  if (/league granary opens/.test(line)) return { kind: 'granary-draw', kcal: null };
  m = line.match(/Village meal: \+(\d+) kcal.*from the communal pantry/);
  if (m) return { kind: 'scholar-meal-draw', kcal: -parseInt(m[1], 10) };
  if (/camp wild tonight — no pantry meal/.test(line)) return { kind: 'camp-wild-no-meal', kcal: 0 };
  if (/Haven's pantry is empty\. Day \d+ of hunger/.test(line)) return { kind: 'hunger-marker', kcal: null };
  if (/Haven eats again/.test(line)) return { kind: 'hunger-reset', kcal: null };
  m = line.match(/carried off ~(\d+) kcal from the pantry/);
  if (m) return { kind: 'raid-take', kcal: -parseInt(m[1], 10) };
  if (/RAID — \d+ raiders.*hit Haven/.test(line)) return { kind: 'monster-raid-unquantified', kcal: null };
  m = line.match(/You eat Foraged food \((\d+) kcal\)/);
  if (m) return { kind: 'scholar-pantry-eat', kcal: -parseInt(m[1], 10) };
  m = line.match(/\((\d+) kcal of dried meat and clean water\. Nothing traceable\.\)/);
  if (m) return { kind: 'PACK-bundle', kcal: parseInt(m[1], 10) };
  m = line.match(/About (\d+) kcal on the bone/);
  if (m) return { kind: 'PACK-trap', kcal: parseInt(m[1], 10) };
  if (/Haven grows by one/.test(line)) return { kind: 'joiner-no-deposit', kcal: 0 };
  if (/keep a day's food.*nothing extra for the pantry/.test(line)) return { kind: 'scholar-keep-only', kcal: 0 };
  return null;
}

const INFLOW_KINDS = ['forage-return', 'big-day-haul', 'routine-haul', 'expedition-return', 'scholar-unload', 'granary-draw'];

// One row per night. Corpus-stage itemization for a reset night is
// UNITEMIZED by construction (no pantry-at-check in the corpus);
// preCheckNamed lists any named pre-check deposits found (phase
// sleep, seq before the reset line) so the evidence can quote them.
function nightTable(corpus) {
  const evs = corpus.evenings || [];
  const decs = corpus.decisions || [];
  const hun = hungryStreak(corpus);
  const markerByNight = {};
  for (const mk of hun.markers) markerByNight[mk.loopDay] = mk;
  const resetByNight = {};
  for (const r of hun.resets) resetByNight[r.loopDay] = r;
  const rows = [];
  for (let d = 1; d <= evs.length; d++) {
    const prefix = sleepPrefix(corpus, d);
    const opening = evs[d - 1].pantry ? evs[d - 1].pantry.kcal : null;
    const openingCount = evs[d - 1].pantry ? evs[d - 1].pantry.count : null;
    const next = d < decs.length ? decs[d] : null;
    const closing = next && next.pantry ? next.pantry.kcal : null;
    const closingCount = next && next.pantry ? next.pantry.count : null;
    const bridge = (opening != null && closing != null) ? closing - opening : null;
    const win = windowLines(corpus, d);
    const reset = resetByNight[d] || null;
    const preCheckNamed = reset
      ? win.filter((w) => w.phase === 'sleep' && w.seq < reset.seq && INFLOW_KINDS.includes(w.kind))
      : [];
    const postCheckSleep = reset
      ? win.filter((w) => w.phase === 'sleep' && w.seq > reset.seq)
      : win.filter((w) => w.phase === 'sleep');
    const waitNamed = win.filter((w) => w.phase === 'wait' && INFLOW_KINDS.includes(w.kind));
    const waitOutflows = win.filter((w) => w.phase === 'wait' && (w.kind === 'scholar-pantry-eat' || w.kind === 'raid-take'));
    const sleepInflows = win.filter((w) => w.phase === 'sleep' && INFLOW_KINDS.includes(w.kind));
    const sleepPostCheckInflows = reset
      ? win.filter((w) => w.phase === 'sleep' && w.seq > reset.seq && INFLOW_KINDS.includes(w.kind))
      : [];
    const dailyNamed = win.filter((w) => w.phase === 'daily' && (INFLOW_KINDS.includes(w.kind) || w.kind === 'scholar-pantry-eat' || w.kind === 'scholar-meal-draw'));
    const packLines = win.filter((w) => w.kind === 'PACK-bundle' || w.kind === 'PACK-trap');
    rows.push({
      night: d,
      sleepPrefixSeq: prefix.length ? { start: prefix[0].seq, end: prefix[prefix.length - 1].seq } : null,
      opening, openingCount, closing, closingCount, bridge,
      marker: markerByNight[d] || null,
      reset: reset ? { seq: reset.seq, line: reset.line } : null,
      preCheckNamed,
      postCheckSleepLines: postCheckSleep,
      sleepInflows,
      sleepPostCheckInflows,
      waitNamedInflows: waitNamed,
      waitOutflows,
      dailyNamed,
      packLinesExcluded: packLines,
      corpusItemization: reset ? 'UNITEMIZED' : null,
      corpusItemizationReason: reset
        ? 'pantry-at-check unobservable from corpus (snaps bracket sleep + wait-phase; away deposit paths narrate nothing); pre-check named deposits: ' + preCheckNamed.length
        : null,
    });
  }
  return { rows, markers: hun.markers, resets: hun.resets, gameOver: hun.gameOver };
}

function analyze(corpus) {
  const traj = pantryTrajectory(corpus);
  const nights = nightTable(corpus);
  return {
    seed: corpus.seed, policy: corpus.policy,
    endReason: corpus.endReason, daysAlive: corpus.daysAlive, gameDays: corpus.gameDays,
    pantryTrajectory: traj,
    nights: nights.rows,
    hungryMarkers: nights.markers, hungryResets: nights.resets, gameOver: nights.gameOver,
    evenings: (corpus.evenings || []).length, decisions: (corpus.decisions || []).length,
  };
}

if (require.main === module) {
  const inPath = process.argv[2];
  const outPath = process.argv[3] || null;
  if (!inPath) { console.error('usage: analyze-p3reset-b.js <corpus.json> [out.json]'); process.exit(2); }
  let corpus;
  try { corpus = JSON.parse(fs.readFileSync(inPath, 'utf8')); }
  catch (e) { console.error('cannot read corpus: ' + e.message); process.exit(2); }
  const tables = analyze(corpus);
  const text = JSON.stringify(tables, null, 2) + '\n';
  if (outPath) fs.writeFileSync(outPath, text);
  else process.stdout.write(text);
}

module.exports = { analyze, sleepSlice, sleepPrefix, pantryTrajectory, hungryStreak, windowLines, classifyPantryLine, nightTable };
