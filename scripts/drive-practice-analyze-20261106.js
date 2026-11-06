#!/usr/bin/env node
// Analyzer: practice-moves-competence census (sim-drive-practice-a).
// Compares baseline vs armed per-seed JSONs from
// scripts/drive-practice-census-20261106.js and judges the prereg bar.
// Usage: node scripts/drive-practice-analyze-20261106.js [--evid evidence/2026-11-06]
//   Prints the verdict + tables; exits 1 on NO-GO (baseline moved or armed
//   share below threshold or any decrease).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.argv.includes('--evid')
  ? path.resolve(process.argv[process.argv.indexOf('--evid') + 1])
  : path.join(ROOT, 'evidence', '2026-11-06');
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const LADDER = [0.7, 1.0, 1.2, 1.3, 1.4];

function tempMult(snap, task) {
  const temp = snap.temperament || 'steady';
  if (temp === 'bold' && (task === 'hunt' || task === 'patrol')) return 1.15;
  if (temp === 'cautious') return 0.9;
  return 1.0;
}
function rungOf(v) {
  if (v == null) return null;
  let idx = -1;
  for (let i = 0; i < LADDER.length; i++) if (v >= LADDER[i] - 0.001) idx = i;
  if (idx < 0) throw new Error('competence value off-ladder: ' + v);
  return idx;
}
function loadLeg(leg) {
  const files = fs.readdirSync(EVID).filter(f => f.startsWith(`drive-practice-a-${leg}-seed`) && f.endsWith('.json')).sort();
  return files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}

function analyzeLeg(leg, rows) {
  const perSeed = [];
  let practicing = 0, moved = 0, cellsMoved = 0, decreases = 0, totalReps = 0;
  const byTask = {};
  for (const t of TASKS) byTask[t] = { practicing: 0, moved: 0, cells: 0, reps: 0 };
  let wallNational = 0, wallTable = 0, wallWins = 0, w4kills = 0, secondKills = [];
  const survivals = [];
  for (const r of rows) {
    survivals.push(r.endDay);
    if ((r.wall.maxRank || 0) >= 2) wallNational++;
    if (r.wall.everTable) wallTable++;
    if (r.wall.everWon) wallWins++;
    // Resolutions per (villager, task).
    const resCount = {};
    for (const x of (r.resolved || [])) {
      const k = x.vid + '|' + x.task;
      resCount[k] = (resCount[k] || 0) + 1;
    }
    // Wave-4 kills from the kill log (context only).
    const kills = Array.isArray(r.waveKillLog) ? r.waveKillLog : [];
    const w4 = kills.filter(k => (k.wave === 4 || k.wave === '4' || /wave.?4/i.test(String(k.monster || '') + String(k.wave || ''))));
    w4kills += w4.length;
    const byKiller = {};
    for (const k of w4) {
      const who = String(k.by || k.killer || k.vid || '?');
      (byKiller[who] = byKiller[who] || []).push(k.day != null ? k.day : null);
    }
    for (const [who, days] of Object.entries(byKiller)) {
      if (days.length >= 2) secondKills.push({ seed: r.seed, killer: who, days: days.filter(d => d != null).sort((a, b) => a - b) });
    }
    let seedPracticing = 0, seedMoved = 0, seedCells = 0;
    for (const [vid, end] of Object.entries(r.endSnap || {})) {
      const start = (r.startSnap || {})[vid];
      if (!start) continue; // joined mid-run: no day-0 baseline
      for (const t of TASKS) {
        const reps = resCount[vid + '|' + t] || 0;
        const prac = (end.practice || {})[t] || 0;
        totalReps += prac;
        byTask[t].reps += prac;
        if (reps < 8) continue;
        seedPracticing++;
        byTask[t].practicing++;
        const sBase = start.competence[t] / tempMult(start, t);
        const eBase = end.competence[t] / tempMult(end, t);
        const d = rungOf(eBase) - rungOf(sBase);
        if (d < 0) decreases++;
        if (d > 0) { seedMoved++; byTask[t].moved++; }
        seedCells += Math.max(0, d);
        byTask[t].cells += Math.max(0, d);
      }
    }
    practicing += seedPracticing; moved += seedMoved; cellsMoved += seedCells;
    perSeed.push({ seed: r.seed, endDay: r.endDay, practicing: seedPracticing, moved: seedMoved, cells: seedCells, resolved: (r.resolved || []).length, practiceLines: (r.practiceLines || []).length, maxRank: r.wall.maxRank, maxArc: r.wall.maxArc, table: r.wall.everTable, won: r.wall.everWon });
  }
  survivals.sort((a, b) => a - b);
  const medianSurvival = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
  return { leg, seeds: rows.length, practicing, moved, cellsMoved, decreases, totalReps,
    shareMoved: practicing ? moved / practicing : null,
    byTask, perSeed, wall: { national: wallNational, table: wallTable, wins: wallWins, w4kills, secondKills, medianSurvival } };
}

const base = analyzeLeg('baseline', loadLeg('baseline'));
const armed = analyzeLeg('armed', loadLeg('armed'));

function printLeg(a) {
  console.log(`\n== ${a.leg.toUpperCase()} (${a.seeds} seeds) ==`);
  console.log(`practicing villagers: ${a.practicing} | moved >=1 cell: ${a.moved} | share: ${a.shareMoved == null ? 'n/a' : (a.shareMoved * 100).toFixed(1) + '%'} | cells moved: ${a.cellsMoved} | decreases: ${a.decreases} | total practice reps: ${a.totalReps}`);
  console.log('by task (practicing/moved/cells/reps):');
  for (const t of TASKS) {
    const b = a.byTask[t];
    if (b.practicing || b.reps) console.log(`  ${t.padEnd(9)} ${String(b.practicing).padStart(3)} / ${String(b.moved).padStart(3)} / ${String(b.cells).padStart(3)} / ${b.reps}`);
  }
  console.log('per seed (seed endDay practicing moved cells resolved rungLines maxRank maxArc table won):');
  for (const s of a.perSeed) console.log(`  ${s.seed} ${s.endDay} ${s.practicing} ${s.moved} ${s.cells} ${s.resolved} ${s.practiceLines} ${s.maxRank} ${s.maxArc} ${s.table} ${s.won}`);
  const w = a.wall;
  console.log(`WALL: national ${w.national}/${a.seeds} | table ${w.table}/${a.seeds} | wins ${w.wins}/${a.seeds} | wave-4 kills ${w.w4kills} | median survival ${w.medianSurvival}d | second kills: ${JSON.stringify(w.secondKills)}`);
}
printLeg(base);
printLeg(armed);

console.log('\n== VERDICT (prereg bar) ==');
let verdict = 'GO';
const reasons = [];
if (base.cellsMoved !== 0 || base.moved !== 0) { verdict = 'NO-GO'; reasons.push(`baseline moved (${base.cellsMoved} cells, ${base.moved} villagers) — instrument broken`); }
if (armed.decreases > 0) { verdict = 'NO-GO'; reasons.push(`${armed.decreases} competence decreases on armed leg`); }
if (armed.shareMoved == null || armed.shareMoved < 0.5) { verdict = 'NO-GO'; reasons.push(`armed share moved ${(armed.shareMoved == null ? 'n/a' : (armed.shareMoved * 100).toFixed(1) + '%')} < 50%`); }
console.log(verdict + (reasons.length ? ' — ' + reasons.join('; ') : ' — armed share ' + (armed.shareMoved * 100).toFixed(1) + '% >= 50%, baseline 0 cells, 0 decreases'));
if (verdict === 'NO-GO') process.exitCode = 1;
