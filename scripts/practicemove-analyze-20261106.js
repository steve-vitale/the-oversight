#!/usr/bin/env node
// Analyzer: practice-movement replication + diagnosis (sim-practicemove-a).
// Reads practicemove-a-seed*.json (or --glob <prefix> for other corpora,
// e.g. roleform-a-seed for the replication proof) and judges the prereg:
// (1) does practice-attributed competence movement reproduce the roleform
// numbers (33 cells / 50 steps / 195 lines; field+craft only) or refute
// them with counts; (2) is every competence delta attributable to a
// source (practice reps vs rung diffs, with the 1.4 cap accounted for);
// (3) is every zero-movement task's blocking gate named with counts
// (never offered / refused / redirected by the prod-throttle / resolved
// but below the 8-rep threshold / already at the 1.4 cap); (4) how big
// is the specialistSkill hard-gate (foodXp >= 5 with base skill 0).
// Usage: node scripts/practicemove-analyze-20261106.js [--evid dir]
//   [--glob practicemove-a-seed] [--json-out path]
//   Prints verdict + tables; exits 0 on DIAG-GO, 1 on DIAG-NO-GO, 2 on
//   missing corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.argv.includes('--evid')
  ? path.resolve(process.argv[process.argv.indexOf('--evid') + 1])
  : path.join(ROOT, 'evidence', '2026-11-06');
const GLOB = process.argv.includes('--glob') ? process.argv[process.argv.indexOf('--glob') + 1] : 'practicemove-a-seed';
const JSON_OUT = process.argv.includes('--json-out') ? path.resolve(process.argv[process.argv.indexOf('--json-out') + 1]) : null;
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const TRACKS = ['combat', 'field', 'social', 'craft', 'strange'];
const LADDER = [0.7, 1.0, 1.2, 1.3, 1.4];
const THRESH = [18, 48, 96, 192, 384];
const TASK_TRACK = { hunt: 'field', forage: 'field', garden: 'field', fish: 'field', wood: 'craft', stone: 'craft', deadfall: 'field', water: 'field', scout: 'field', patrol: 'combat', cook: 'craft', tend: 'craft', teach: 'social', mend: 'craft' };
const SPEC_TRACK = { butcher: 'field', cook: 'craft', preserver: 'field', spotter: 'field', builder: 'craft' };
const DEED_TRACK = {};
try {
  const tj = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tracks.json'), 'utf8'));
  for (const [deed, rec] of Object.entries(tj.deeds || {})) DEED_TRACK[deed] = rec.track;
} catch (e) { console.warn('tracks.json deeds unreadable', e.message); }
const lvl = xp => THRESH.filter(t => (xp || 0) >= t).length;
const topKey = obj => { let bk = null, bv = -1; for (const k of Object.keys(obj || {})) if (obj[k] > bv) { bv = obj[k]; bk = k; } return bv > 0 ? bk : null; };
// Practice steps from cumulative reps (drive-practice thresholds 8/20/36).
function practiceSteps(reps) { let s = 0, need = 8, cum = 0; while (s < 3) { cum += need; if ((reps || 0) >= cum) s++; else break; need += 4; } return s; }

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

const files = fs.readdirSync(EVID).filter(f => new RegExp('^' + GLOB + '\\d+\\.json$').test(f)).sort();
if (!files.length) { console.error('no ' + GLOB + '*.json in ' + EVID); process.exit(2); }

const seeds = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  const scholars = new Set((d.scholarIds || [d.playerId]).map(String));
  const firstScholarDay = {};
  for (const day of d.daily || []) {
    const sid = String(day.scholarId || '');
    if (sid && firstScholarDay[sid] == null) firstScholarDay[sid] = day.day;
    if (sid) scholars.add(sid);
  }
  const npcDays = {};
  for (const day of d.daily || []) {
    for (const vid of (day.rosterIds || [])) {
      const k = String(vid);
      if (day.day < (firstScholarDay[k] == null ? Infinity : firstScholarDay[k])) npcDays[k] = (npcDays[k] || 0) + 1;
    }
  }
  const inNpcWindow = (vid, day) => day < (firstScholarDay[String(vid)] == null ? Infinity : firstScholarDay[String(vid)]);
  const snaps = {};
  const addSnap = (day, vid, s) => { if (!s) return; (snaps[String(vid)] = snaps[String(vid)] || []).push({ day, s }); };
  for (const [vid, s] of Object.entries(d.startSnap || {})) addSnap(0, vid, s);
  for (const [day, m] of Object.entries(d.periodicSnap || {})) for (const [vid, s] of Object.entries(m)) addSnap(+day, vid, s);
  for (const [vid, s] of Object.entries(d.endSnap || {})) addSnap(d.endDay, vid, s);
  for (const k of Object.keys(snaps)) snaps[k].sort((a, b) => a.day - b.day);
  const firstSnap = vid => (snaps[String(vid)] || [])[0] ? snaps[String(vid)][0].s : null;
  const lastSnap = vid => { const a = (snaps[String(vid)] || []).filter(e => inNpcWindow(vid, e.day)); return a.length ? a[a.length - 1].s : firstSnap(vid); };

  const vids = Object.keys(d.seenDays || {});
  const qual60 = vids.filter(v => (npcDays[v] || 0) >= 60);
  const qual30 = vids.filter(v => (npcDays[v] || 0) >= 30);
  const prof = {};
  for (const r of d.resolved || []) {
    if (!inNpcWindow(r.vid, r.day)) continue;
    const p = prof[String(r.vid)] = prof[String(r.vid)] || { counts: {}, total: 0 };
    p.counts[r.task] = (p.counts[r.task] || 0) + 1; p.total++;
  }
  // Opportunity ledger: direct assignments (assignTask ok/refused) and
  // task-lead days (lead works their domain every part, ~3/day).
  const assignedOk = {}, assignedRefused = {}, leadDays = {};
  for (const t of TASKS) { assignedOk[t] = 0; assignedRefused[t] = 0; leadDays[t] = 0; }
  for (const r of d.assigned || []) {
    if (!inNpcWindow(r.vid, r.day)) continue;
    if (r.ok) assignedOk[r.task] = (assignedOk[r.task] || 0) + 1;
    else assignedRefused[r.task] = (assignedRefused[r.task] || 0) + 1;
  }
  for (const day of d.daily || []) for (const [task, vid] of Object.entries(day.taskLeads || {})) {
    if (String(day.scholarId) === String(vid) || !inNpcWindow(vid, day.day)) continue;
    leadDays[task] = (leadDays[task] || 0) + 1;
  }
  const deeds = {};
  for (const r of d.deeds || []) {
    if (r.who === 'player' || !inNpcWindow(r.who, r.day)) continue;
    const p = deeds[String(r.who)] = deeds[String(r.who)] || {};
    p[r.deed] = (p[r.deed] || 0) + 1;
  }
  const taught = {}, learned = {}, levelUps = {};
  for (const r of d.skillRows || []) {
    if (r.type === 'skill_lesson') {
      if (r.teacher && r.teacher !== 'player' && inNpcWindow(r.teacher, r.day)) taught[r.teacher] = (taught[r.teacher] || 0) + 1;
      if (r.learner && r.learner !== 'player' && inNpcWindow(r.learner, r.day)) learned[r.learner] = (learned[r.learner] || 0) + 1;
    }
    if (r.type === 'villager_level_up') {
      const who = r.vid || r.who;
      if (who && who !== 'player' && inNpcWindow(who, r.day)) levelUps[who] = (levelUps[who] || 0) + 1;
    }
  }
  const TASK_WORDS = { wood: 'woodcutting', stone: 'stonework', water: 'water run', fish: 'fishing', cook: 'cooking', garden: 'garden', forage: 'foraging', deadfall: 'deadfall', hunt: 'hunting', scout: 'scouting', patrol: 'patrol', tend: 'tending', teach: 'teaching', mend: 'mending' };
  const rungLinesByTask = {};
  for (const pl of d.practiceLines || []) {
    const line = (pl.line || '').toLowerCase();
    for (const [t, w] of Object.entries(TASK_WORDS)) {
      if (line.indexOf(w) >= 0) { rungLinesByTask[t] = (rungLinesByTask[t] || 0) + 1; break; }
    }
  }
  const buildRow = (vid) => {
    const f = firstSnap(vid), l = lastSnap(vid);
    const p = prof[vid] || { counts: {}, total: 0 };
    const sorted = Object.entries(p.counts).sort((a, b) => b[1] - a[1]);
    const topTask = sorted.length ? sorted[0][0] : null;
    // Per-task attribution: reps gained vs signed rung diff vs expected
    // rung gain (practice steps from reps, capped by ladder headroom
    // above the occupation base rung).
    const attr = {};
    let mismatches = 0;
    if (f && l) {
      for (const t of TASKS) {
        const reps0 = ((f.practice || {})[t]) || 0;
        const reps1 = ((l.practice || {})[t]) || 0;
        const gained = reps1 - reps0;
        const sBase = (f.competence || {})[t] == null ? null : (f.competence[t] / tempMult(f, t));
        const eBase = (l.competence || {})[t] == null ? null : (l.competence[t] / tempMult(l, t));
        if (sBase == null || eBase == null) { attr[t] = { repsGained: gained, rungDiff: null, expected: null, mismatch: false }; continue; }
        const baseRung = rungOf(sBase);
        const dd = rungOf(eBase) - baseRung;
        const expected = Math.min(practiceSteps(reps1) - practiceSteps(reps0), 4 - baseRung);
        const mismatch = dd !== expected;
        if (mismatch) mismatches++;
        attr[t] = { repsGained: gained, rungDiff: dd, expected, mismatch, baseRung, capped: baseRung >= 4 };
      }
    }
    let compChanged = 0, compDecreases = 0;
    const compCellsByTask = {}, compCellsByTrack = {};
    for (const t of TRACKS) compCellsByTrack[t] = 0;
    if (f && l) {
      for (const t of TASKS) {
        const a = attr[t];
        if (!a || a.rungDiff == null) continue;
        if (a.rungDiff !== 0) compChanged++;
        if (a.rungDiff < 0) compDecreases++;
        compCellsByTask[t] = Math.max(0, a.rungDiff);
        compCellsByTrack[TASK_TRACK[t]] += Math.max(0, a.rungDiff);
      }
    }
    // SpecialistSkill gate sizing: base vs end, foodXp gained.
    let specUp = 0, specZeroToPos = 0;
    const specGateBlocked = {}; // spec -> 1 if foodXp>=5 gained with base 0
    const specFoodXpGained = {};
    if (f && l) {
      for (const t of SPECS) {
        const a = (f.specialist || {})[t] || 0, b = (l.specialist || {})[t] || 0;
        if (b > a) specUp++;
        if (a === 0 && b > 0) specZeroToPos++;
        const fx0 = ((f.foodXp || {})[t]) || 0, fx1 = ((l.foodXp || {})[t]) || 0;
        specFoodXpGained[t] = fx1 - fx0;
        specGateBlocked[t] = (a === 0 && (fx1 - fx0) >= 5) ? 1 : 0;
      }
    }
    const fTr = (f && f.tracks && f.tracks.xp) || null, lTr = (l && l.tracks && l.tracks.xp) || null;
    const trackLevels = lTr ? Object.fromEntries(TRACKS.map(t => [t, lvl(lTr[t])])) : null;
    const trackXp = lTr || {};
    const totalXp = TRACKS.reduce((a, t) => a + (trackXp[t] || 0), 0);
    const topTrack = topKey(trackXp);
    const dominantTrack = (topTrack && (trackXp[topTrack] || 0) >= 18 && totalXp > 0 && (trackXp[topTrack] / totalXp) >= 0.5) ? topTrack : null;
    const fSkills = (f && f.npcSkills) || [], lSkills = (l && l.npcSkills) || [];
    const gainedSkills = lSkills.filter(s => fSkills.indexOf(s) < 0);
    const fAb = (f && f.npcAbilities) || [], lAb = (l && l.npcAbilities) || [];
    const gainedAb = lAb.filter(s => fAb.indexOf(s) < 0);
    return { vid, occ: (f && f.occ) || (l && l.occ) || '?', temperament: (f && f.temperament) || null,
      seenDays: d.seenDays[vid], npcDays: npcDays[vid] || 0, everScholar: scholars.has(vid),
      totalResolved: p.total, counts: p.counts, topTask,
      attr, mismatches, compChanged, compDecreases, compCellsByTask, compCellsByTrack,
      specUp, specZeroToPos, specGateBlocked, specFoodXpGained,
      trackXp, trackLevels, totalXp, topTrack, dominantTrack,
      gainedSkills, gainedAbilities: gainedAb,
      lessonsTaught: taught[vid] || 0, lessonsLearned: learned[vid] || 0, levelUps: levelUps[vid] || 0,
      deeds: deeds[vid] || {} };
  };
  const taskTotals = {};
  for (const r of d.resolved || []) { if (!inNpcWindow(r.vid, r.day)) continue; taskTotals[r.task] = (taskTotals[r.task] || 0) + 1; }
  const wkl = Array.isArray(d.waveKillLog) ? d.waveKillLog : [];
  const w4 = wkl.filter(k => (k.wave === 4 || k.wave === '4' || /wave.?4/i.test(String(k.monster || '') + String(k.wave || ''))));
  const w5 = wkl.filter(k => (k.wave === 5 || k.wave === '5' || /wave.?5/i.test(String(k.monster || '') + String(k.wave || ''))));
  const survivals = (d.daily || []).length ? d.daily[d.daily.length - 1].day : d.endDay;
  seeds.push({ seed: d.seed, endDay: d.endDay, gameOver: d.gameOver,
    startN: (d.startRoster || []).length, endAlive: (d.daily || []).length ? d.daily[d.daily.length - 1].alive : null,
    everVillagers: vids.length, qual60N: qual60.length, qual30N: qual30.length,
    taskTotals, resolvedTotal: Object.values(taskTotals).reduce((a, b) => a + b, 0),
    assignedOk, assignedRefused, leadDays,
    rungLines: (d.practiceLines || []).length, rungLinesByTask,
    throttle: d.throttle || { redirects: null, exemptDepth: null },
    wall: d.wall || {}, w4kills: w4.length, w5kills: w5.length, survival: survivals,
    rows60: qual60.map(buildRow), rows30: qual30.map(buildRow) });
}

function pooled(rows) {
  const qualN = rows.length;
  const sum = (f) => rows.reduce((a, r) => a + (f(r) || 0), 0);
  const cnt = (f) => rows.filter(f).length;
  const cellsByTrack = {}, cellsByTask = {}, movedByTrack = {}, levelsByTrack = {};
  for (const t of TRACKS) { cellsByTrack[t] = sum(r => (r.compCellsByTrack || {})[t]); movedByTrack[t] = cnt(r => ((r.compCellsByTrack || {})[t] || 0) > 0); levelsByTrack[t] = cnt(r => (r.trackLevels || {})[t] >= 1); }
  for (const t of TASKS) cellsByTask[t] = sum(r => (r.compCellsByTask || {})[t]);
  const repsByTask = {}, repsVillagersByTask = {}, mismatches = sum(r => r.mismatches || 0);
  for (const t of TASKS) {
    repsByTask[t] = sum(r => ((r.attr || {})[t] || {}).repsGained || 0);
    repsVillagersByTask[t] = cnt(r => (((r.attr || {})[t] || {}).repsGained || 0) > 0);
  }
  const cappedNoRung = {}; // cells at the 1.4 cap with reps>=8 but no rung (expected, not a defect)
  for (const t of TASKS) cappedNoRung[t] = cnt(r => { const a = (r.attr || {})[t] || {}; return a.capped && (a.repsGained || 0) >= 8 && (a.rungDiff || 0) === 0; });
  const domTracks = {};
  for (const r of rows) if (r.dominantTrack) domTracks[r.dominantTrack] = (domTracks[r.dominantTrack] || 0) + 1;
  const specBlocked = {};
  for (const t of SPECS) specBlocked[t] = sum(r => ((r.specGateBlocked || {})[t]) || 0);
  const specXpGained = {};
  for (const t of SPECS) specXpGained[t] = sum(r => ((r.specFoodXpGained || {})[t]) || 0);
  const skillsGained = sum(r => (r.gainedSkills || []).length);
  const skillsWithLesson = sum(r => ((r.gainedSkills || []).length > 0 && (r.lessonsLearned || 0) > 0) ? (r.gainedSkills || []).length : 0);
  const skillsWithLevelUp = sum(r => ((r.gainedSkills || []).length > 0 && (r.levelUps || 0) > 0) ? (r.gainedSkills || []).length : 0);
  return { qualN,
    compChangedCells: sum(r => r.compChanged), compDecreases: sum(r => r.compDecreases),
    cellsByTrack, cellsByTask, movedByTrack, levelsByTrack,
    repsByTask, repsVillagersByTask, mismatches, cappedNoRung,
    specUp: sum(r => r.specUp), specZeroToPos: sum(r => r.specZeroToPos),
    specBlocked, specXpGained,
    skillsGained, skillsWithLesson, skillsWithLevelUp,
    lessonsTaught: sum(r => r.lessonsTaught), lessonsLearned: sum(r => r.lessonsLearned),
    levelUps: sum(r => r.levelUps),
    domTracks, dominantTrackCount: Object.keys(domTracks).length };
}

const p60 = pooled(seeds.flatMap(s => s.rows60));
const p30 = pooled(seeds.flatMap(s => s.rows30));
const tot = (f) => seeds.reduce((a, s) => a + (f(s) || 0), 0);
const assignedOkTot = {}, assignedRefTot = {}, leadDaysTot = {}, resolvedTot = {}, rungLinesTot = {};
for (const t of TASKS) {
  assignedOkTot[t] = tot(s => (s.assignedOk || {})[t]);
  assignedRefTot[t] = tot(s => (s.assignedRefused || {})[t]);
  leadDaysTot[t] = tot(s => (s.leadDays || {})[t]);
  resolvedTot[t] = tot(s => (s.taskTotals || {})[t]);
  rungLinesTot[t] = tot(s => (s.rungLinesByTask || {})[t]);
}
const rungLinesTotal = tot(s => s.rungLines);
const throttleRecorded = seeds.every(s => (s.throttle || {}).redirects != null);
const throttleRedirects = throttleRecorded ? tot(s => (s.throttle || {}).redirects) : null;
const throttleExempt = throttleRecorded ? tot(s => (s.throttle || {}).exemptDepth) : null;
const cisternRecorded = seeds.every(s => (s.throttle || {}).cisternRedirects != null);
const cisternRedirects = cisternRecorded ? tot(s => (s.throttle || {}).cisternRedirects) : null;
const wall = {
  national: seeds.filter(s => (s.wall || {}).maxRank >= 2).length,
  table: seeds.filter(s => (s.wall || {}).everTable).length,
  wins: seeds.filter(s => (s.wall || {}).everWon).length,
  w4kills: tot(s => s.w4kills), w5kills: tot(s => s.w5kills),
  medianSurvival: (() => { const a = seeds.map(s => s.survival).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; })(),
  endAlive: seeds.map(s => s.endAlive),
};
// Gate naming per zero-movement task (prereg rule): the counts decide.
// The qual60 set is the judged bar, but a task whose workers never reach
// 60 NPC days still shows in the qual30 sensitivity set — that is a
// tenure shape, not an instrument failure, and the gate must say so.
const gates = {};
for (const t of TASKS) {
  const steps = p60.cellsByTask[t] || 0;
  if (steps > 0) { gates[t] = 'moves (' + steps + ' steps)'; continue; }
  const steps30 = p30.cellsByTask[t] || 0;
  const reps30 = p30.repsByTask[t] || 0;
  const offered = (assignedOkTot[t] || 0) + (leadDaysTot[t] || 0) * 3;
  const refused = assignedRefTot[t] || 0;
  const resolved = resolvedTot[t] || 0;
  const repsVillagers = p60.repsVillagersByTask[t] || 0;
  if (steps30 > 0) gates[t] = 'MOVES ONLY IN THE qual30 SET (' + steps30 + ' steps, ' + reps30 + ' reps) — the workers do not reach 60 NPC days; 0 in qual60 is a tenure bar, not zero practice';
  else if (offered === 0 && resolved === 0) gates[t] = 'NEVER OFFERED (0 assignTask ok, 0 lead-days)';
  else if (resolved === 0 && refused > 0 && (assignedOkTot[t] || 0) === 0) gates[t] = 'OFFERED BUT REFUSED (' + refused + ' refusals, 0 accepted)';
  else if (resolved === 0 && (assignedOkTot[t] || 0) > 0 && ['fish', 'forage', 'garden'].indexOf(t) >= 0) gates[t] = 'OFFERED BUT REDIRECTED by prod-throttle (' + assignedOkTot[t] + ' assigned ok, 0 resolved; throttle redirects ' + (throttleRedirects == null ? 'n/a — not recorded in this corpus' : throttleRedirects + ' across seeds') + ')';
  else if (resolved > 0 && repsVillagers === 0 && (p30.repsVillagersByTask[t] || 0) === 0) gates[t] = 'RESOLVED ' + resolved + 'x BUT NO PRACTICE REPS RECORDED (instrument suspect — investigate, do not re-score)';
  else if (resolved > 0 && repsVillagers > 0) gates[t] = 'RESOLVED ' + resolved + 'x, ' + repsVillagers + ' villagers with reps, but 0 rungs — below the 8-rep threshold or at the 1.4 cap (see capped counts)';
  else gates[t] = 'UNNAMED (offered ' + offered + ', refused ' + refused + ', resolved ' + resolved + ') — instrument gap';
}
// Replication shape vs roleform (33 cells / 50 steps / 195 lines;
// field 14 / craft 36 steps; combat/social/strange 0).
const rep = {
  cells: p60.compChangedCells, steps: Object.values(p60.cellsByTask).reduce((a, b) => a + b, 0),
  lines: rungLinesTotal, stepsByTrack: p60.cellsByTrack,
  roleformCells: 33, roleformSteps: 50, roleformLines: 195,
  shapeReproduces: (p60.cellsByTrack.field || 0) > 0 && (p60.cellsByTrack.craft || 0) > 0
    && (p60.cellsByTrack.combat || 0) === 0 && (p60.cellsByTrack.social || 0) === 0 && (p60.cellsByTrack.strange || 0) === 0,
  practiceZeroEverywhere: Object.values(p60.cellsByTask).reduce((a, b) => a + b, 0) === 0 && rungLinesTotal === 0,
};
const unnamedGates = TASKS.filter(t => (p60.cellsByTask[t] || 0) === 0 && String(gates[t]).indexOf('UNNAMED') === 0);
const crossOk = p60.mismatches === 0 && p60.compDecreases === 0;
const verdict = (rep.shapeReproduces || rep.practiceZeroEverywhere) && unnamedGates.length === 0 && crossOk ? 'DIAG-GO' : 'DIAG-NO-GO';
const verdictNote = rep.practiceZeroEverywhere
  ? 'replication REFUTES roleform with counts: practice movement 0 everywhere (brief premise confirmed; roleform instrument or practice build regressed — see evidence)'
  : rep.shapeReproduces
    ? 'replication REPRODUCES the roleform shape: practice moves competence in field+craft only; the brief premise ("nowhere") is refuted with counts'
    : 'replication DIVERGED in shape from roleform — see evidence';

const result = { glob: GLOB, files, seeds: seeds.map(s => ({ seed: s.seed, endDay: s.endDay, gameOver: s.gameOver, endAlive: s.endAlive, qual60N: s.qual60N, qual30N: s.qual30N, resolvedTotal: s.resolvedTotal, rungLines: s.rungLines, throttle: s.throttle, w4kills: s.w4kills, w5kills: s.w5kills })),
  pooled60: p60, pooled30: p30,
  opportunities: { assignedOk: assignedOkTot, assignedRefused: assignedRefTot, leadDays: leadDaysTot, resolved: resolvedTot, rungLinesByTask: rungLinesTot, throttleRedirects, throttleExempt, cisternRedirects },
  gates, replication: rep, wall, crossOk, unnamedGates, verdict, verdictNote };

if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(result, null, 2));

console.log('=== sim-practicemove-a: replication + diagnosis ===');
console.log('seeds: ' + seeds.map(s => s.seed).join(',') + '  qual60=' + p60.qualN + ' qual30=' + p30.qualN);
console.log('--- replication vs roleform (33 cells / 50 steps / 195 lines; field 14 / craft 36; combat/social/strange 0) ---');
console.log('cells changed: ' + rep.cells + '  rung steps: ' + rep.steps + '  rung lines: ' + rep.lines);
console.log('steps by track: ' + JSON.stringify(rep.stepsByTrack));
console.log('steps by task: ' + JSON.stringify(p60.cellsByTask));
console.log('moved villagers by track: ' + JSON.stringify(p60.movedByTrack) + '  levels>=1 by track: ' + JSON.stringify(p60.levelsByTrack));
console.log('dominant tracks: ' + JSON.stringify(p60.domTracks));
console.log('shape reproduces roleform: ' + rep.shapeReproduces + '  practice zero everywhere: ' + rep.practiceZeroEverywhere);
console.log('--- attribution (practice reps -> rung diffs) ---');
console.log('reps gained by task: ' + JSON.stringify(p60.repsByTask));
console.log('villagers with reps by task: ' + JSON.stringify(p60.repsVillagersByTask));
console.log('attribution mismatches (rung diff != expected from reps+cap): ' + p60.mismatches + '  decreases: ' + p60.compDecreases);
console.log('at-cap cells with reps>=8 but no rung (expected): ' + JSON.stringify(p60.cappedNoRung));
console.log('--- opportunities: offered vs taken vs refused (per task, all seeds) ---');
console.log('task | assignOk | refused | leadDays(~x3 parts) | resolved | rungLines');
for (const t of TASKS) console.log('  ' + t.padEnd(9) + String(assignedOkTot[t] || 0).padStart(6) + ' ' + String(assignedRefTot[t] || 0).padStart(7) + ' ' + String(leadDaysTot[t] || 0).padStart(9) + ' ' + String(resolvedTot[t] || 0).padStart(9) + ' ' + String(rungLinesTot[t] || 0).padStart(8));
console.log('throttle ledger: redirects=' + (throttleRedirects == null ? 'n/a (not recorded in this corpus)' : throttleRedirects) + ' exemptDepth=' + (throttleExempt == null ? 'n/a' : throttleExempt) + ' cisternRedirects=' + (cisternRedirects == null ? 'n/a (not recorded in this corpus)' : cisternRedirects));
console.log('--- blocking gate per zero-movement task ---');
for (const t of TASKS) if ((p60.cellsByTask[t] || 0) === 0) console.log('  ' + t + ': ' + gates[t]);
console.log('--- specialistSkill hard-gate sizing (qual60) ---');
console.log('spec 0->positive: ' + p60.specZeroToPos + '  spec ups: ' + p60.specUp);
console.log('gate-blocked villagers (foodXp>=5 gained, base spec 0): ' + JSON.stringify(p60.specBlocked));
console.log('foodXp gained by spec: ' + JSON.stringify(p60.specXpGained));
console.log('--- skills attribution (qual60) ---');
console.log('skills gained: ' + p60.skillsGained + ' (on villagers with lessons learned: ' + p60.skillsWithLesson + '; with level-ups: ' + p60.skillsWithLevelUp + ')  lessons taught/learned: ' + p60.lessonsTaught + '/' + p60.lessonsLearned + '  level-ups: ' + p60.levelUps);
console.log('--- wall ---');
console.log('national ' + wall.national + '/' + seeds.length + '  table ' + wall.table + '/' + seeds.length + '  wins ' + wall.wins + '/' + seeds.length + '  wave-4 kills ' + wall.w4kills + '  wave-5 kills ' + wall.w5kills + '  median survival ' + wall.medianSurvival + 'd  endAlive ' + JSON.stringify(wall.endAlive));
console.log('--- verdict: ' + verdict + ' ---');
console.log(verdictNote);
if (unnamedGates.length) console.log('UNNAMED gates: ' + unnamedGates.join(', '));
if (!crossOk) console.log('CROSS-CHECK FAILED: mismatches=' + p60.mismatches + ' decreases=' + p60.compDecreases);
process.exit(verdict === 'DIAG-GO' ? 0 : 1);
