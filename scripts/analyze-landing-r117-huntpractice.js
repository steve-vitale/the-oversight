// Hunt-practice analyzer for landing r117 (Q1 PRIMARY).
// Reads landing census JSONs (DIR = argv[2]) and reports, pooled and per
// seed, the hunt-practice distribution from the driver-recorded practice
// snapshots (Game.villagerCompetence + vp.practice per task at d1/d14/d28):
//   hunt reps total at d28, max hunt reps per villager, # villagers with
//   hunt reps > 0, hunt competence moves (attributed: reps > 0 at d28),
//   monster kills per seed (the denominator — kills are field fights, not
//   practice; villagerPractice('hunt') fires ONLY from resolveOneAssignment,
//   game.js:7524, once per resolved dawn assignment).
// Contrast tasks forage / scout / patrol get the same rep totals + moves:
// do those tasks accumulate reps without moving?
// Pre-registered verdicts (r117 prereg):
//   H1 (no assignments)  if pooled hunt reps == 0 on all seeds.
//   H0 (threshold)        if pooled hunt reps > 0 AND max per-villager hunt
//                         reps < 8 AND hunt moves == 0 (rung 1 needs 8).
//   H2 (moves)            if hunt moves >= 1 attributed cell.
//   CONTRADICTION         if max hunt reps >= 8 but hunt moves == 0 — stop,
//                         adjudicate, no verdict.
// Same villager id in both snaps only (a villager who dies or leaves the
// roster has no d28 snap and is excluded, never counted as a move) — the
// r112 analyzer's rule, verbatim.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-07/landing-r117');
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const CONTRAST = ['forage', 'scout', 'patrol'];

const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (files.length === 0) { console.log('HUNTPRACTICE: no census files in ' + DIR); process.exit(2); }

const pooled = { seeds: 0, huntReps: 0, huntMax: 0, huntVillagers: 0, huntMoves: 0, huntAttr: 0, kills: 0 };
const repTotals = {}, moveTotals = {};
for (const t of TASKS) { repTotals[t] = 0; moveTotals[t] = 0; }

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const seed = d.seed;
  // monsterKills is an ARRAY of kill records in the census (not a count) —
  // the per-seed count is its length.
  const kills = Array.isArray(d.monsterKills) ? d.monsterKills.length : (d.monsterKills || 0);
  const pr = d.practice || {};
  const s1 = pr.d1 || null, s28 = pr.d28 || null;
  if (!s1 || !s28) {
    console.log(`seed ${seed}: PRACTICE SNAPSHOTS MISSING (d1=${!!s1} d28=${!!s28}) — instrument gap`);
    pooled.seeds++;
    continue;
  }
  const byId = (snap) => { const m = {}; for (const v of snap) m[String(v.id)] = v; return m; };
  const m1 = byId(s1), m28 = byId(s28);
  let huntReps = 0, huntMax = 0, huntVillagers = 0, huntMoves = 0, huntAttr = 0;
  const reps = {}, moves = {};
  for (const t of TASKS) { reps[t] = 0; moves[t] = 0; }
  const moveLines = [];
  for (const id of Object.keys(m28)) {
    for (const t of TASKS) {
      const r = ((m28[id].practice || {})[t] || 0);
      reps[t] += r;
      if (t === 'hunt') {
        if (r > 0) huntVillagers++;
        if (r > huntMax) huntMax = r;
      }
    }
    if (!m1[id]) continue; // joined after d1 — reps counted, moves not
    for (const t of TASKS) {
      const va = (m1[id].competence || {})[t], vb = (m28[id].competence || {})[t];
      if (va == null || vb == null) continue;
      if (vb !== va) {
        moves[t]++;
        const r = ((m28[id].practice || {})[t] || 0);
        if (r > 0 && t === 'hunt') huntAttr++;
        moveLines.push(`  ${m28[id].name || id} ${t}: ${va} -> ${vb} (reps ${r})`);
      }
    }
  }
  huntReps = reps.hunt; huntMoves = moves.hunt;
  pooled.seeds++; pooled.huntReps += huntReps;
  pooled.huntMax = Math.max(pooled.huntMax, huntMax);
  pooled.huntVillagers += huntVillagers; pooled.huntMoves += huntMoves;
  pooled.huntAttr += huntAttr; pooled.kills += kills;
  for (const t of TASKS) { repTotals[t] += reps[t]; moveTotals[t] += moves[t]; }
  console.log(`seed ${seed}: kills=${kills} huntReps=${huntReps} huntMax=${huntMax} huntVillagers>0=${huntVillagers} huntMoves=${huntMoves} (attr=${huntAttr}) contrastReps forage=${reps.forage} scout=${reps.scout} patrol=${reps.patrol} contrastMoves forage=${moves.forage} scout=${moves.scout} patrol=${moves.patrol}`);
  for (const l of moveLines) if (l.includes(' hunt:')) console.log(l);
}

console.log(`HUNTPRACTICE SUMMARY: seeds=${pooled.seeds} kills=${pooled.kills} huntReps=${pooled.huntReps} huntMax=${pooled.huntMax} huntVillagers>0=${pooled.huntVillagers} huntMoves=${pooled.huntMoves} (attr=${pooled.huntAttr})`);
console.log(`HUNTPRACTICE REPS BY TASK d28: ${TASKS.map(t => `${t}=${repTotals[t]}`).join(' ')}`);
console.log(`HUNTPRACTICE MOVES BY TASK d1->d28: ${TASKS.map(t => `${t}=${moveTotals[t]}`).join(' ')}`);
if (pooled.huntReps === 0) {
  console.log('HUNTPRACTICE: H1-ESTABLISHED (no hunt assignments resolve in the landing window — pooled hunt reps 0)');
} else if (pooled.huntMax < 8 && pooled.huntMoves === 0) {
  console.log('HUNTPRACTICE: H0-ESTABLISHED (hunt assignments happen but no villager reaches 8 reps — first rung out of reach in 28d)');
} else if (pooled.huntMoves >= 1 && pooled.huntAttr >= 1) {
  console.log('HUNTPRACTICE: H2-MOVES (hunt competence moved — the watch closes)');
} else if (pooled.huntMax >= 8 && pooled.huntMoves === 0) {
  console.log('HUNTPRACTICE: CONTRADICTION (max hunt reps >= 8 but 0 hunt moves — ladder suspect, stop and adjudicate)');
} else {
  console.log('HUNTPRACTICE: OPEN (split reported, no verdict claimed)');
}
