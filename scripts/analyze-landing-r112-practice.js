// Practice-movement analyzer for landing r112 (Q1 PRIMARY).
// Reads landing-r112 census JSONs (DIR = argv[2]) and counts competence
// movement d1->d14 and d1->d28 per villager-task, using the driver-recorded
// practice snapshots (Game.villagerCompetence per task). Same villager id in
// both snaps only (a villager who dies or leaves the roster has no d28 snap
// and is excluded, never counted as a move). Temperament is fixed per person,
// so raw villagerCompetence values are comparable across snaps.
// Also counts skill 0->positive moves (specialist / foodXp) and npcSkills
// gained, and totals practice reps. Attribution: a moved cell counts as
// ATTRIBUTED when the villager holds practice reps > 0 in that task at d28.
// Prereg bar (binding): GO if >=1 attributed moved cell pooled across the
// panel; NO-GO if 0 moved cells on all seeds.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-07/landing-r112');
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];

const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
let pooled = { seeds: 0, moved1414: 0, moved1428: 0, attributed1428: 0, skillPos: 0, reps: 0, seedsWithMove: 0 };
const perTask1428 = {};
for (const t of TASKS) perTask1428[t] = 0;

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const seed = d.seed;
  const pr = d.practice || {};
  const s1 = pr.d1 || null, s14 = pr.d14 || null, s28 = pr.d28 || null;
  if (!s1 || !s28) {
    console.log(`seed ${seed}: PRACTICE SNAPSHOTS MISSING (d1=${!!s1} d14=${!!s14} d28=${!!s28}) — instrument gap, counted as NO-GO data`);
    pooled.seeds++;
    continue;
  }
  const byId = (snap) => { const m = {}; for (const v of snap) m[String(v.id)] = v; return m; };
  const m1 = byId(s1), m14 = s14 ? byId(s14) : {}, m28 = byId(s28);
  const countMoves = (a, b) => {
    let moved = 0, attributed = 0; const tasks = {};
    for (const t of TASKS) tasks[t] = 0;
    for (const id of Object.keys(a)) {
      if (!b[id]) continue; // died / left roster — excluded, never a move
      for (const t of TASKS) {
        const va = (a[id].competence || {})[t], vb = (b[id].competence || {})[t];
        if (va == null || vb == null) continue;
        if (vb !== va) {
          moved++; tasks[t]++;
          const reps = ((b[id].practice || {})[t] || 0);
          if (reps > 0) attributed++;
        }
      }
    }
    return { moved, attributed, tasks };
  };
  const r14 = s14 ? countMoves(m1, m14) : { moved: 0, attributed: 0, tasks: {} };
  const r28 = countMoves(m1, m28);
  // skill 0->positive: specialist or foodXp, d1->d28, same villagers.
  let skillPos = 0; const skillsGained = [];
  for (const id of Object.keys(m1)) {
    if (!m28[id]) continue;
    for (const t of SPECS) {
      const sa = (m1[id].specialist || {})[t], sb = (m28[id].specialist || {})[t];
      if (sa === 0 && sb != null && sb > 0) { skillPos++; skillsGained.push(`${m28[id].name || id}:${t} specialist ${sa}->${sb}`); }
      const fa = (m1[id].foodXp || {})[t] || 0, fb = (m28[id].foodXp || {})[t] || 0;
      if (fa === 0 && fb > 0) { skillPos++; skillsGained.push(`${m28[id].name || id}:${t} foodXp 0->${fb}`); }
    }
    const ka = new Set((m1[id].npcSkills || [])), kb = (m28[id].npcSkills || []);
    for (const s of kb) if (!ka.has(s)) skillsGained.push(`${m28[id].name || id}: skill ${s}`);
  }
  let reps = 0;
  for (const id of Object.keys(m28)) for (const t of TASKS) reps += ((m28[id].practice || {})[t] || 0);
  pooled.seeds++;
  pooled.moved1414 += r14.moved; pooled.moved1428 += r28.moved; pooled.attributed1428 += r28.attributed;
  pooled.skillPos += skillPos; pooled.reps += reps;
  if (r28.moved > 0) pooled.seedsWithMove++;
  for (const t of TASKS) perTask1428[t] += (r28.tasks[t] || 0);
  console.log(`seed ${seed}: moved d1->d14=${r14.moved} d1->d28=${r28.moved} (attributed=${r28.attributed}) skill0->pos=${skillPos} practiceReps(d28)=${reps}`);
  const movedLines = [];
  for (const id of Object.keys(m1)) {
    if (!m28[id]) continue;
    for (const t of TASKS) {
      const va = (m1[id].competence || {})[t], vb = (m28[id].competence || {})[t];
      if (va != null && vb != null && vb !== va) movedLines.push(`  ${m28[id].name || id} ${t}: ${va} -> ${vb} (reps ${((m28[id].practice || {})[t] || 0)})`);
    }
  }
  for (const l of movedLines) console.log(l);
  for (const s of skillsGained) console.log(`  skill: ${s}`);
}
console.log(`PRACTICE SUMMARY: seeds=${pooled.seeds} movedCells d1->d14=${pooled.moved1414} d1->d28=${pooled.moved1428} attributed=${pooled.attributed1428} seedsWithMove=${pooled.seedsWithMove}/10 skill0->pos=${pooled.skillPos} practiceReps=${pooled.reps}`);
console.log(`PRACTICE BY TASK d1->d28: ${TASKS.map(t => `${t}=${perTask1428[t]}`).join(' ')}`);
console.log(pooled.attributed1428 >= 1
  ? 'PRACTICE: GO (practice movement detectable in the landing window)'
  : 'PRACTICE: NO-GO (0 attributed moved cells — practice has no landing-leg effect at 28d)');
