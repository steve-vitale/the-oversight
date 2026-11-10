#!/usr/bin/env node
// Analyzer: role-formation FIRST NUMBERS (sim-roleform-b, coverage
// program Tier 1 #1, measurement only).
// Reads evidence/2026-11-10/roleform-b-seed*.json, reports first numbers
// for competence-cell movement per villager, skill 0->positive per
// villager, and practice reps by track, and judges the prereg verdict
// rule: GO iff every pilot seed produced a COMPLETE corpus AND the
// instrument is internally consistent (zero competence decreases, zero
// practice-rep decreases across snapshots, rung lines parse to known
// tasks). Movement size itself is NOT judged — the numbers are the
// finding. Roleform-a 80d numbers are printed as recorded context only.
// Usage: node scripts/roleform-analyze-20261110.js [--evid evidence/2026-11-10]
//   Prints verdict + tables; exits 1 on NO-GO, 0 on GO/UNMEASURABLE.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.argv.includes('--evid')
  ? path.resolve(process.argv[process.argv.indexOf('--evid') + 1])
  : path.join(ROOT, 'evidence', '2026-11-10');
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const TRACKS = ['combat', 'field', 'social', 'craft', 'strange'];
const LADDER = [0.7, 1.0, 1.2, 1.3, 1.4];
const THRESH = [18, 48, 96, 192, 384];
// Task->track map (prereg, documented judgment; raw per-task tables are
// always printed alongside so the map never hides data).
const TASK_TRACK = { hunt: 'field', forage: 'field', garden: 'field', fish: 'field', wood: 'craft', stone: 'craft', deadfall: 'field', water: 'field', scout: 'field', patrol: 'combat', cook: 'craft', tend: 'craft', teach: 'social', mend: 'craft' };
const SPEC_TRACK = { butcher: 'field', cook: 'craft', preserver: 'field', spotter: 'field', builder: 'craft' };
const DEED_TRACK = {};
try {
  const tj = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tracks.json'), 'utf8'));
  for (const [deed, rec] of Object.entries(tj.deeds || {})) DEED_TRACK[deed] = rec.track;
} catch (e) { console.warn('tracks.json deeds unreadable', e.message); }
const lvl = xp => THRESH.filter(t => (xp || 0) >= t).length;
const topKey = obj => { let bk = null, bv = -1; for (const k of Object.keys(obj || {})) if (obj[k] > bv) { bv = obj[k]; bk = k; } return bv > 0 ? bk : null; };

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

const files = fs.readdirSync(EVID).filter(f => /^roleform-b-seed\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no roleform-b-seed*.json in ' + EVID); process.exit(2); }
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
  const qual90 = vids.filter(v => (npcDays[v] || 0) >= 90);
  // Recorder-validity: practice reps must be monotone non-decreasing
  // across a villager's ordered snapshots (cumulative counters).
  let practiceViolations = 0;
  for (const vid of Object.keys(snaps)) {
    const arr = snaps[vid];
    for (let i = 1; i < arr.length; i++) {
      for (const t of TASKS) {
        const a = (arr[i - 1].s.practice || {})[t] || 0, b = (arr[i].s.practice || {})[t] || 0;
        if (b < a) practiceViolations++;
      }
    }
  }
  const prof = {};
  for (const r of d.resolved || []) {
    if (!inNpcWindow(r.vid, r.day)) continue;
    const p = prof[String(r.vid)] = prof[String(r.vid)] || { counts: {}, total: 0, seq: [] };
    p.counts[r.task] = (p.counts[r.task] || 0) + 1; p.total++; p.seq.push({ day: r.day, task: r.task });
  }
  const deeds = {};
  for (const r of d.deeds || []) {
    if (r.who === 'player' || !inNpcWindow(r.who, r.day)) continue;
    const p = deeds[String(r.who)] = deeds[String(r.who)] || {};
    p[r.deed] = (p[r.deed] || 0) + 1;
  }
  const taught = {}, learned = {}, sought = {}, kills = {};
  for (const r of d.skillRows || []) {
    if (r.type === 'skill_lesson') {
      if (r.teacher && r.teacher !== 'player' && inNpcWindow(r.teacher, r.day)) taught[r.teacher] = (taught[r.teacher] || 0) + 1;
      if (r.learner && r.learner !== 'player' && inNpcWindow(r.learner, r.day)) learned[r.learner] = (learned[r.learner] || 0) + 1;
    }
    if (r.type === 'villager_seek_knowledge' && r.vid && inNpcWindow(r.vid, r.day)) sought[r.vid] = (sought[r.vid] || 0) + 1;
    if (r.type === 'killer_tale' && r.killer && inNpcWindow(r.killer, r.day)) kills[r.killer] = (kills[r.killer] || 0) + 1;
  }
  // Rung-gain lines per task: parse "getting the hang of <task words>".
  const TASK_WORDS = { wood: 'woodcutting', stone: 'stonework', water: 'water run', fish: 'fishing', cook: 'cooking', garden: 'garden', forage: 'foraging', deadfall: 'deadfall', hunt: 'hunting', scout: 'scouting', patrol: 'patrol', tend: 'tending', teach: 'teaching', mend: 'mending' };
  const rungLinesByTask = {};
  let unknownRungLines = 0;
  for (const pl of d.practiceLines || []) {
    const line = (pl.line || '').toLowerCase();
    let hit = false;
    for (const [t, w] of Object.entries(TASK_WORDS)) {
      if (line.indexOf(w) >= 0) { rungLinesByTask[t] = (rungLinesByTask[t] || 0) + 1; hit = true; break; }
    }
    if (!hit) unknownRungLines++;
  }
  // Lead-days.
  const leadDays = {};
  for (const day of d.daily || []) for (const [task, vid] of Object.entries(day.taskLeads || {})) {
    if (String(day.scholarId) === String(vid) || !inNpcWindow(vid, day.day)) continue;
    const k = String(vid);
    leadDays[k] = leadDays[k] || {}; leadDays[k][task] = (leadDays[k][task] || 0) + 1;
  }
  const buildRow = (vid) => {
    const f = firstSnap(vid), l = lastSnap(vid);
    const p = prof[vid] || { counts: {}, total: 0, seq: [] };
    const sorted = Object.entries(p.counts).sort((a, b) => b[1] - a[1]);
    const shares = sorted.map(([t, n]) => [t, p.total ? n / p.total : 0]);
    const strong = shares.filter(([, s]) => s >= 0.25).map(([t]) => t);
    const comp = (l && l.competence) || {};
    const topTask = sorted.length ? sorted[0][0] : null;
    const matched = topTask ? (comp[topTask] >= 1.4) : null;
    const byDay = {};
    for (const e of p.seq) { (byDay[e.day] = byDay[e.day] || {})[e.task] = (byDay[e.day][e.task] || 0) + 1; }
    const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
    const modal = days.map(day => topKey(byDay[day]));
    let stick = 0, stickN = 0;
    for (let i = 1; i < modal.length; i++) { stickN++; if (modal[i] === modal[i - 1]) stick++; }
    const mid = d.endDay / 2;
    const c1 = {}, c2 = {};
    for (const e of p.seq) { const c = e.day <= mid ? c1 : c2; c[e.task] = (c[e.task] || 0) + 1; }
    const top1 = topKey(c1), top2 = topKey(c2);
    let compChanged = 0, compDecreases = 0;
    const compCellsByTask = {};
    const compCellsByTrack = {};
    for (const t of TRACKS) compCellsByTrack[t] = 0;
    if (f && l) {
      for (const t of TASKS) {
        const sBase = (f.competence || {})[t] == null ? null : (f.competence[t] / tempMult(f, t));
        const eBase = (l.competence || {})[t] == null ? null : (l.competence[t] / tempMult(l, t));
        if (sBase == null || eBase == null) continue;
        const dd = rungOf(eBase) - rungOf(sBase);
        if (dd !== 0) compChanged++;
        if (dd < 0) compDecreases++;
        compCellsByTask[t] = Math.max(0, dd);
        compCellsByTrack[TASK_TRACK[t]] += Math.max(0, dd);
      }
    }
    let specUp = 0, specZeroToPos = 0;
    const specZeroToPosByTrack = {};
    for (const t of TRACKS) specZeroToPosByTrack[t] = 0;
    if (f && l) {
      for (const t of SPECS) {
        const a = (f.specialist || {})[t] || 0, b = (l.specialist || {})[t] || 0;
        if (b > a) specUp++;
        if (a === 0 && b > 0) { specZeroToPos++; specZeroToPosByTrack[SPEC_TRACK[t]]++; }
      }
    }
    const fTr = (f && f.tracks && f.tracks.xp) || null, lTr = (l && l.tracks && l.tracks.xp) || null;
    const trackLevels = lTr ? Object.fromEntries(TRACKS.map(t => [t, lvl(lTr[t])])) : null;
    const trackXp = lTr || {};
    const totalXp = TRACKS.reduce((a, t) => a + (trackXp[t] || 0), 0);
    const topTrack = topKey(trackXp);
    const dominantTrack = (topTrack && (trackXp[topTrack] || 0) >= 18 && totalXp > 0 && (trackXp[topTrack] / totalXp) >= 0.5) ? topTrack : null;
    const dominantTask = (topTask && shares.length && shares[0][1] >= 0.5 && (comp[topTask] || 0) >= 1.2) ? topTask : null;
    const deedTr = {};
    for (const [deed, n] of Object.entries(deeds[vid] || {})) { const tr = DEED_TRACK[deed]; if (tr) deedTr[tr] = (deedTr[tr] || 0) + n; }
    const deedTop = topKey(deedTr);
    const fSkills = (f && f.npcSkills) || [], lSkills = (l && l.npcSkills) || [];
    const gainedSkills = lSkills.filter(s => fSkills.indexOf(s) < 0);
    const fAb = (f && f.npcAbilities) || [], lAb = (l && l.npcAbilities) || [];
    const gainedAb = lAb.filter(s => fAb.indexOf(s) < 0);
    // Practice reps by track: cumulative reps at the last NPC-window
    // snapshot, mapped task -> track. This is the coverage program's
    // third first-numbers metric.
    const practiceByTask = {};
    const practiceByTrack = {};
    for (const t of TRACKS) practiceByTrack[t] = 0;
    let practiceTotal = 0;
    if (l) {
      for (const t of TASKS) {
        const n = ((l.practice || {})[t] || 0) - ((f && f.practice ? f.practice[t] : 0) || 0);
        practiceByTask[t] = Math.max(0, n);
        practiceByTrack[TASK_TRACK[t]] += Math.max(0, n);
        practiceTotal += Math.max(0, n);
      }
    }
    return { vid, occ: (f && f.occ) || (l && l.occ) || '?', temperament: (f && f.temperament) || null,
      seenDays: d.seenDays[vid], npcDays: npcDays[vid] || 0, everScholar: scholars.has(vid),
      totalResolved: p.total, counts: p.counts, topTask, topShare: shares.length ? shares[0][1] : 0,
      strong, hybrid: strong.length >= 2, matchedTop: matched,
      stickiness: stickN ? stick / stickN : null, stickN,
      topFirstHalf: top1, topSecondHalf: top2, switchedHalf: top1 && top2 && top1 !== top2,
      compChanged, compDecreases, compCellsByTask, compCellsByTrack,
      specUp, specZeroToPos, specZeroToPosByTrack,
      trackXp, trackLevels, totalXp, topTrack, dominantTrack, dominantTask,
      deedTop, gainedSkills, gainedAbilities: gainedAb,
      practiceByTask, practiceByTrack, practiceTotal,
      lessonsTaught: taught[vid] || 0, lessonsLearned: learned[vid] || 0,
      seeks: sought[vid] || 0, kills: kills[vid] || 0,
      leadDays: leadDays[vid] || {}, leadTaskCount: Object.keys(leadDays[vid] || {}).length,
      deeds: deeds[vid] || {} };
  };
  const taskTotals = {};
  for (const r of d.resolved || []) { if (!inNpcWindow(r.vid, r.day)) continue; taskTotals[r.task] = (taskTotals[r.task] || 0) + 1; }
  const wkl = Array.isArray(d.waveKillLog) ? d.waveKillLog : [];
  // Kill-log rows carry the wave in `w` (and the kind in `mid`) — an
  // earlier draft read `k.wave`/`k.monster` and silently counted 0.
  const w4 = wkl.filter(k => k.w === 4 || k.w === '4');
  const w5 = wkl.filter(k => k.w === 5 || k.w === '5');
  const survivals = (d.daily || []).length ? d.daily[d.daily.length - 1].day : d.endDay;
  // Completeness: every section the prereg requires must be present.
  const requiredKeys = ['seed', 'startSnap', 'endSnap', 'daily', 'resolved', 'deeds', 'practiceLines', 'wall', 'seenDays'];
  const missingKeys = requiredKeys.filter(k => d[k] == null);
  const complete = missingKeys.length === 0 && (d.daily || []).length > 0 && Object.keys(d.startSnap || {}).length > 0;
  seeds.push({ seed: d.seed, endDay: d.endDay, gameOver: d.gameOver,
    startN: (d.startRoster || []).length, endAlive: (d.daily || []).length ? d.daily[d.daily.length - 1].alive : null,
    everVillagers: vids.length, qual60N: qual60.length, qual30N: qual30.length, qual90N: qual90.length,
    taskTotals, resolvedTotal: Object.values(taskTotals).reduce((a, b) => a + b, 0),
    rungLines: (d.practiceLines || []).length, rungLinesByTask, unknownRungLines,
    practiceViolations, complete, missingKeys,
    wall: d.wall || {}, w4kills: w4.length, w5kills: w5.length,
    rows60: qual60.map(buildRow), rows30: qual30.map(buildRow), rows90: qual90.map(buildRow) });
}

function pooled(rows) {
  const qualN = rows.length;
  const sum = (f) => rows.reduce((a, r) => a + (f(r) || 0), 0);
  const cnt = (f) => rows.filter(f).length;
  const cellsByTrack = {};
  const specZ2PByTrack = {};
  const levelsByTrack = {};
  const movedByTrack = {};
  for (const t of TRACKS) { cellsByTrack[t] = sum(r => (r.compCellsByTrack || {})[t]); specZ2PByTrack[t] = sum(r => (r.specZeroToPosByTrack || {})[t]); levelsByTrack[t] = cnt(r => (r.trackLevels || {})[t] >= 1); movedByTrack[t] = cnt(r => ((r.compCellsByTrack || {})[t] || 0) > 0); }
  const cellsByTask = {};
  for (const t of TASKS) cellsByTask[t] = sum(r => (r.compCellsByTask || {})[t]);
  const practiceByTrack = {};
  const practiceByTask = {};
  for (const t of TRACKS) practiceByTrack[t] = sum(r => (r.practiceByTrack || {})[t]);
  for (const t of TASKS) practiceByTask[t] = sum(r => (r.practiceByTask || {})[t]);
  const practiceTotal = sum(r => r.practiceTotal);
  const domTracks = {};
  for (const r of rows) if (r.dominantTrack) domTracks[r.dominantTrack] = (domTracks[r.dominantTrack] || 0) + 1;
  const domTasks = {};
  for (const r of rows) if (r.dominantTask) domTasks[r.dominantTask] = (domTasks[r.dominantTask] || 0) + 1;
  const tempDom = {};
  for (const r of rows) {
    const k = (r.temperament || '?') + '->' + (r.dominantTrack || r.dominantTask || 'none');
    tempDom[k] = (tempDom[k] || 0) + 1;
  }
  return { qualN,
    compChangedCells: sum(r => r.compChanged), compDecreases: sum(r => r.compDecreases),
    cellsByTrack, cellsByTask, movedByTrack,
    practiceByTrack, practiceByTask, practiceTotal,
    meanPracticePerVillager: qualN ? practiceTotal / qualN : null,
    specUp: sum(r => r.specUp), specZeroToPos: sum(r => r.specZeroToPos), specZ2PByTrack,
    levelsByTrack, anyTrackLevelN: cnt(r => r.trackLevels && TRACKS.some(t => r.trackLevels[t] >= 1)),
    gainedSkillsTotal: sum(r => r.gainedSkills.length), gainedAbilitiesTotal: sum(r => r.gainedAbilities.length),
    domTracks, domTasks, distinctDomTracks: Object.keys(domTracks).length,
    hybridN: cnt(r => r.hybrid), strongN: cnt(r => r.strong.length >= 1), noStrongN: cnt(r => r.strong.length === 0),
    matchedTopN: cnt(r => r.matchedTop === true), unmatchedTopN: cnt(r => r.matchedTop === false), noTaskN: cnt(r => r.totalResolved === 0),
    meanTopShare: qualN ? rows.reduce((a, r) => a + r.topShare, 0) / qualN : null,
    switchedHalfN: cnt(r => r.switchedHalf),
    lessonsTaughtTotal: sum(r => r.lessonsTaught), lessonsLearnedTotal: sum(r => r.lessonsLearned),
    teachersN: cnt(r => r.lessonsTaught > 0), seekersN: cnt(r => r.seeks > 0),
    killersN: cnt(r => r.kills > 0), killsTotal: sum(r => r.kills),
    leadHoldersTotal: cnt(r => r.leadTaskCount > 0), multiLeadN: cnt(r => r.leadTaskCount >= 2),
    tempDom,
    meanStickiness: (() => { const rs = rows.filter(r => r.stickN >= 10); return rs.length ? rs.reduce((a, r) => a + r.stickiness, 0) / rs.length : null; })(),
  };
}
const all60 = seeds.flatMap(s => s.rows60.map(r => Object.assign({ seed: s.seed }, r)));
const all30 = seeds.flatMap(s => s.rows30.map(r => Object.assign({ seed: s.seed }, r)));
const all90 = seeds.flatMap(s => s.rows90.map(r => Object.assign({ seed: s.seed }, r)));
const p60 = pooled(all60);
const p30 = pooled(all30);
const p90 = pooled(all90);
const survivals = seeds.map(s => s.endDay).sort((a, b) => a - b);
const medianSurvival = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
const wallNational = seeds.filter(s => (s.wall.maxRank || 0) >= 2).length;
const wallTable = seeds.filter(s => s.wall.everTable).length;
const wallWins = seeds.filter(s => s.wall.everWon).length;
const w4tot = seeds.reduce((a, s) => a + s.w4kills, 0);
const w5tot = seeds.reduce((a, s) => a + s.w5kills, 0);
const rungTotal = seeds.reduce((a, s) => a + s.rungLines, 0);
const rungByTask = {};
for (const s of seeds) for (const [t, n] of Object.entries(s.rungLinesByTask)) rungByTask[t] = (rungByTask[t] || 0) + n;

console.log('seeds:', seeds.map(s => `${s.seed}: endDay=${s.endDay} over=${s.gameOver} start=${s.startN} endAlive=${s.endAlive} ever=${s.everVillagers} qual60=${s.qual60N} qual30=${s.qual30N} qual90=${s.qual90N} resolved=${s.resolvedTotal} rungLines=${s.rungLines} complete=${s.complete}`).join(' | '));
console.log(`WALL: national ${wallNational}/${seeds.length} | table ${wallTable}/${seeds.length} | wins ${wallWins}/${seeds.length} | wave-4 kills ${w4tot} | wave-5 kills ${w5tot} | median survival ${medianSurvival}d`);
console.log('resolved by task (all seeds, NPC window):', JSON.stringify(seeds.reduce((a, s) => { for (const [t, n] of Object.entries(s.taskTotals)) a[t] = (a[t] || 0) + n; return a; }, {})));
console.log(`rung-gain lines total: ${rungTotal} by task:`, JSON.stringify(rungByTask));

function printPooled(label, p) {
  console.log(`\n== ${label} (qual villagers: ${p.qualN}) ==`);
  console.log('competence cells moved:', JSON.stringify(p.cellsByTrack), '| total', p.compChangedCells, '| decreases', p.compDecreases);
  console.log('cells by task:', JSON.stringify(p.cellsByTask));
  console.log('villagers moved >=1 cell, by track:', JSON.stringify(p.movedByTrack));
  console.log('specialist 0->positive:', p.specZeroToPos, 'by track:', JSON.stringify(p.specZ2PByTrack), '| any spec up:', p.specUp);
  console.log('track level >=1, villagers by track:', JSON.stringify(p.levelsByTrack), '| any track level:', p.anyTrackLevelN);
  console.log('practice reps by track (last NPC-window snapshot minus first):', JSON.stringify(p.practiceByTrack), '| total', p.practiceTotal, '| mean/villager', p.meanPracticePerVillager == null ? 'n/a' : p.meanPracticePerVillager.toFixed(1));
  console.log('practice reps by task:', JSON.stringify(p.practiceByTask));
  console.log('skills gained:', p.gainedSkillsTotal, '| abilities gained:', p.gainedAbilitiesTotal);
  console.log('dominant tracks:', JSON.stringify(p.domTracks), '| distinct:', p.distinctDomTracks);
  console.log('dominant tasks:', JSON.stringify(p.domTasks));
  console.log('temperament -> dominant (track/task):', JSON.stringify(p.tempDom));
  console.log(`behavior: strong>=1 ${p.strongN} | hybrid ${p.hybridN} | no-strong ${p.noStrongN} | top-matched-occ ${p.matchedTopN} | top-unmatched ${p.unmatchedTopN} | no-task ${p.noTaskN} | mean top share ${p.meanTopShare == null ? 'n/a' : p.meanTopShare.toFixed(2)} | switched-half ${p.switchedHalfN} | mean stickiness ${p.meanStickiness == null ? 'n/a' : p.meanStickiness.toFixed(2)}`);
  console.log(`teaching: lessons taught ${p.lessonsTaughtTotal} / learned ${p.lessonsLearnedTotal} | teachers ${p.teachersN} | seekers ${p.seekersN} | killers ${p.killersN} (${p.killsTotal} tales) | leads ${p.leadHoldersTotal} | multi-lead ${p.multiLeadN}`);
}
printPooled('QUAL >=60 NPC DAYS (judged set)', p60);
printPooled('QUAL >=30 NPC DAYS (sensitivity set)', p30);
printPooled('QUAL >=90 NPC DAYS (sensitivity set, 150d horizon)', p90);
console.log('\nroleform-a recorded context (80d, band 99891-99898, NOT re-measured here): qual60=45 villagers, competence 33 changed cells / 50 rung steps (field 14, craft 36), specialist 0->positive 0 villagers, 28/45 at track level >=1, 195 rung-gain lines, 0 resolutions in hunt/scout/patrol/teach/tend/mend.');
console.log('\nper-villager rows, qual60 (seed occ temp npcDays tot top share strong matched stick domTrack domTask levels skills+ ab+ teach/learn seek kills):');
for (const r of all60) console.log(` ${r.seed} ${r.occ} ${r.temperament} npcDays=${r.npcDays} tot=${r.totalResolved} top=${r.topTask} share=${r.topShare.toFixed(2)} strong=[${r.strong.join(',')}] matched=${r.matchedTop} stick=${r.stickiness == null ? '?' : r.stickiness.toFixed(2)} domTrack=${r.dominantTrack} domTask=${r.dominantTask} levels=${JSON.stringify(r.trackLevels)} skills+${r.gainedSkills.length} ab+${r.gainedAbilities.length} teach=${r.lessonsTaught}/${r.lessonsLearned} seek=${r.seeks} kills=${r.kills}`);

// Verdict per prereg rule (FIRST NUMBERS capture: instrument validity +
// complete capture — movement size is NOT judged here).
const incompleteSeeds = seeds.filter(s => !s.complete);
const totalPracticeViolations = seeds.reduce((a, s) => a + s.practiceViolations, 0);
const totalUnknownRungLines = seeds.reduce((a, s) => a + s.unknownRungLines, 0);
const tracksWithSignal = TRACKS.filter(t => (p60.levelsByTrack[t] || 0) >= 1 || (p60.movedByTrack[t] || 0) >= 1);
console.log('\n== VERDICT (prereg rule: instrument validity + complete capture) ==');
console.log('complete corpora:', seeds.filter(s => s.complete).length + '/' + seeds.length, incompleteSeeds.length ? '(incomplete: ' + incompleteSeeds.map(s => s.seed + ':' + s.missingKeys.join(',')).join('; ') + ')' : '');
console.log('competence decreases (judged set):', p60.compDecreases, '| practice-rep decreases across snapshots:', totalPracticeViolations, '| unparsed rung lines:', totalUnknownRungLines);
console.log('tracks with >=1 villager at level>=1 or moved >=1 cell (context only, not judged):', JSON.stringify(tracksWithSignal), `(${tracksWithSignal.length}/5)`);
console.log('distinct dominant tracks (context only):', p60.distinctDomTracks, JSON.stringify(p60.domTracks));
let verdict = 'GO';
const reasons = [];
if (incompleteSeeds.length) { verdict = 'NO-GO'; reasons.push(`${incompleteSeeds.length}/${seeds.length} corpora incomplete`); }
if (p60.compDecreases > 0) { verdict = 'NO-GO'; reasons.push(`${p60.compDecreases} competence decreases (instrument broken)`); }
if (totalPracticeViolations > 0) { verdict = 'NO-GO'; reasons.push(`${totalPracticeViolations} practice-rep decreases (recorder broken)`); }
if (totalUnknownRungLines > 0) { verdict = 'NO-GO'; reasons.push(`${totalUnknownRungLines} rung-gain lines did not parse to a known task`); }
if (verdict === 'GO' && p60.qualN === 0) { verdict = 'UNMEASURABLE'; reasons.push('qual set empty (<60 NPC days for every villager) — capture is valid but the denominator is empty'); }
console.log(verdict + (reasons.length ? ' — ' + reasons.join('; ') : ' — instrument valid, first numbers captured on every pilot seed'));
if (verdict === 'NO-GO') process.exitCode = 1;
