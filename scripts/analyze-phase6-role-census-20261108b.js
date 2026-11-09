#!/usr/bin/env node
// Analyzer for probe-phase6-role-census-20261108b.js outputs
// (after OVE-81 scout DUTY dawn offers / OVE-83 on tip 84b54f4be).
// Prints per-track movement + DUTY_ad vs DUTY_picked + duty_top_score picks,
// practice deltas (endSnap.practice − firstSnap.practice) for focus cells,
// and a before/after stub vs OVE-82 after-codex-prey evidence when present.
// Usage: node scripts/analyze-phase6-role-census-20261108b.js [--evid DIR] [--before DIR]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.argv.includes('--evid')
  ? path.resolve(process.argv[process.argv.indexOf('--evid') + 1])
  : path.join(ROOT, 'evidence', '2026-11-08', 'phase6-role-census-after-scout');
const BEFORE_EVID = process.argv.includes('--before')
  ? path.resolve(process.argv[process.argv.indexOf('--before') + 1])
  : path.join(ROOT, 'evidence', '2026-11-08', 'phase6-role-census-after-codex-prey');
const FOCUS_PRACTICE = ['hunt', 'patrol', 'teach', 'scout'];
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const TRACKS = ['combat', 'field', 'social', 'craft', 'strange'];
const LADDER = [0.7, 1.0, 1.2, 1.3, 1.4];
const THRESH = [18, 48, 96, 192, 384];
const TASK_TRACK = {
  hunt: 'field', forage: 'field', garden: 'field', fish: 'field', wood: 'craft',
  stone: 'craft', deadfall: 'field', water: 'field', scout: 'field', patrol: 'combat',
  cook: 'craft', tend: 'craft', teach: 'social', mend: 'craft',
};
const SPEC_TRACK = { butcher: 'field', cook: 'craft', preserver: 'field', spotter: 'field', builder: 'craft' };
const DEED_TRACK = {};
try {
  const tj = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tracks.json'), 'utf8'));
  for (const [deed, rec] of Object.entries(tj.deeds || {})) DEED_TRACK[deed] = rec.track;
} catch (e) { console.warn('tracks.json deeds unreadable', e.message); }
const lvl = xp => THRESH.filter(t => (xp || 0) >= t).length;
const topKey = obj => {
  let bk = null, bv = -1;
  for (const k of Object.keys(obj || {})) if (obj[k] > bv) { bv = obj[k]; bk = k; }
  return bv > 0 ? bk : null;
};

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

const files = fs.readdirSync(EVID).filter(f => /^rolecensus-p6-.+-seed\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no rolecensus-p6-*-seed*.json in ' + EVID); process.exit(2); }

const byPolicy = {};
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  const policy = d.policy || 'unknown';
  (byPolicy[policy] = byPolicy[policy] || []).push(d);
}

function analyzeSeed(d) {
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
      if (day.day < (firstScholarDay[k] == null ? Infinity : firstScholarDay[k])) {
        npcDays[k] = (npcDays[k] || 0) + 1;
      }
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
  const lastSnap = vid => {
    const a = (snaps[String(vid)] || []).filter(e => inNpcWindow(vid, e.day));
    return a.length ? a[a.length - 1].s : firstSnap(vid);
  };

  const vids = Object.keys(d.seenDays || {});
  const qual60 = vids.filter(v => (npcDays[v] || 0) >= 60);
  const qual30 = vids.filter(v => (npcDays[v] || 0) >= 30);
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
  const TASK_WORDS = {
    wood: 'woodcutting', stone: 'stonework', water: 'water run', fish: 'fishing', cook: 'cooking',
    garden: 'garden', forage: 'foraging', deadfall: 'deadfall', hunt: 'hunting', scout: 'scouting',
    patrol: 'patrol', tend: 'tending', teach: 'teaching', mend: 'mending',
  };
  const rungLinesByTask = {};
  for (const pl of d.practiceLines || []) {
    const line = (pl.line || '').toLowerCase();
    for (const [t, w] of Object.entries(TASK_WORDS)) {
      if (line.indexOf(w) >= 0) { rungLinesByTask[t] = (rungLinesByTask[t] || 0) + 1; break; }
    }
  }
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
    const practiceDeltaByTask = {};
    const practiceEndByTask = {};
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
      for (const t of TASKS) {
        const sPr = ((f.practice || {})[t]) || 0;
        const ePr = ((l.practice || {})[t]) || 0;
        practiceDeltaByTask[t] = Math.max(0, ePr - sPr);
        practiceEndByTask[t] = ePr;
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
    for (const [deed, n] of Object.entries(deeds[vid] || {})) {
      const tr = DEED_TRACK[deed];
      if (tr) deedTr[tr] = (deedTr[tr] || 0) + n;
    }
    const fSkills = (f && f.npcSkills) || [], lSkills = (l && l.npcSkills) || [];
    const gainedSkills = lSkills.filter(s => fSkills.indexOf(s) < 0);
    const fAb = (f && f.npcAbilities) || [], lAb = (l && l.npcAbilities) || [];
    const gainedAb = lAb.filter(s => fAb.indexOf(s) < 0);
    return {
      vid, occ: (f && f.occ) || (l && l.occ) || '?', temperament: (f && f.temperament) || null,
      seenDays: d.seenDays[vid], npcDays: npcDays[vid] || 0, everScholar: scholars.has(vid),
      totalResolved: p.total, counts: p.counts, topTask, topShare: shares.length ? shares[0][1] : 0,
      strong, hybrid: strong.length >= 2, matchedTop: matched,
      stickiness: stickN ? stick / stickN : null, stickN,
      topFirstHalf: top1, topSecondHalf: top2, switchedHalf: top1 && top2 && top1 !== top2,
      compChanged, compDecreases, compCellsByTask, compCellsByTrack,
      practiceDeltaByTask, practiceEndByTask,
      specUp, specZeroToPos, specZeroToPosByTrack,
      trackXp, trackLevels, totalXp, topTrack, dominantTrack, dominantTask,
      gainedSkills, gainedAbilities: gainedAb,
      lessonsTaught: taught[vid] || 0, lessonsLearned: learned[vid] || 0,
      seeks: sought[vid] || 0, kills: kills[vid] || 0,
      leadDays: leadDays[vid] || {}, leadTaskCount: Object.keys(leadDays[vid] || {}).length,
      deeds: deeds[vid] || {},
    };
  };
  const taskTotals = {};
  for (const r of d.resolved || []) {
    if (!inNpcWindow(r.vid, r.day)) continue;
    taskTotals[r.task] = (taskTotals[r.task] || 0) + 1;
  }
  const duty = d.duty || {};
  return {
    seed: d.seed, policy: d.policy, endDay: d.endDay, gameOver: d.gameOver,
    startN: (d.startRoster || []).length,
    endAlive: (d.daily || []).length ? d.daily[d.daily.length - 1].alive : null,
    everVillagers: vids.length, qual60N: qual60.length, qual30N: qual30.length,
    taskTotals, resolvedTotal: Object.values(taskTotals).reduce((a, b) => a + b, 0),
    rungLines: (d.practiceLines || []).length, rungLinesByTask,
    wall: d.wall || {},
    duty: {
      adEvents: duty.adEvents || 0,
      adCandCount: duty.adCandCount || 0,
      pickEvents: duty.pickEvents || 0,
      dutyTopScorePicks: duty.dutyTopScorePicks || 0,
      adByTask: duty.adByTask || {},
      pickByTask: duty.pickByTask || {},
      pickByOverride: duty.pickByOverride || {},
      daysSampled: duty.daysSampled || 0,
      daysWithOpp: duty.daysWithOpp || 0,
      oppByTask: duty.oppByTask || {},
      logsTotal: duty.logsTotal || 0,
      sampleN: (duty.adSamples || []).length,
      samplePickKinds: (duty.adSamples || []).reduce((a, s) => {
        const k = s.pick || '?';
        a[k] = (a[k] || 0) + 1;
        return a;
      }, {}),
      sampleOverrides: (duty.adSamples || []).reduce((a, s) => {
        const k = s.override || 'none';
        a[k] = (a[k] || 0) + 1;
        return a;
      }, {}),
    },
    rows60: qual60.map(buildRow),
    rows30: qual30.map(buildRow),
    tip: d.commit || d.tipLabel || null,
  };
}

function pooled(rows) {
  const qualN = rows.length;
  const sum = (f) => rows.reduce((a, r) => a + (f(r) || 0), 0);
  const cnt = (f) => rows.filter(f).length;
  const cellsByTrack = {};
  const specZ2PByTrack = {};
  const levelsByTrack = {};
  const movedByTrack = {};
  for (const t of TRACKS) {
    cellsByTrack[t] = sum(r => (r.compCellsByTrack || {})[t]);
    specZ2PByTrack[t] = sum(r => (r.specZeroToPosByTrack || {})[t]);
    levelsByTrack[t] = cnt(r => (r.trackLevels || {})[t] >= 1);
    movedByTrack[t] = cnt(r => ((r.compCellsByTrack || {})[t] || 0) > 0);
  }
  const cellsByTask = {};
  for (const t of TASKS) cellsByTask[t] = sum(r => (r.compCellsByTask || {})[t]);
  const practiceMovedByTrack = {};
  for (const t of TRACKS) practiceMovedByTrack[t] = movedByTrack[t];
  const practiceRepsByTask = {};
  const practiceVillagersByTask = {};
  const practiceMaxByTask = {};
  const practiceGe8ByTask = {};
  for (const t of TASKS) {
    practiceRepsByTask[t] = sum(r => (r.practiceDeltaByTask || {})[t] || 0);
    practiceVillagersByTask[t] = cnt(r => ((r.practiceDeltaByTask || {})[t] || 0) > 0);
    practiceMaxByTask[t] = rows.reduce((m, r) => Math.max(m, (r.practiceEndByTask || {})[t] || 0), 0);
    practiceGe8ByTask[t] = cnt(r => ((r.practiceEndByTask || {})[t] || 0) >= 8);
  }
  const focusPractice = {};
  for (const t of FOCUS_PRACTICE) {
    focusPractice[t] = {
      reps: practiceRepsByTask[t] || 0,
      villagers: practiceVillagersByTask[t] || 0,
      maxEnd: practiceMaxByTask[t] || 0,
      ge8FirstRung: practiceGe8ByTask[t] || 0,
      competenceRungSteps: cellsByTask[t] || 0,
    };
  }
  const domTracks = {};
  for (const r of rows) if (r.dominantTrack) domTracks[r.dominantTrack] = (domTracks[r.dominantTrack] || 0) + 1;
  const trackTable = {};
  for (const t of TRACKS) {
    trackTable[t] = {
      competenceRungSteps: cellsByTrack[t],
      villagersMovedComp: movedByTrack[t],
      trackLevelGe1: levelsByTrack[t],
      specialist0toPos: specZ2PByTrack[t],
      dominantTrack: domTracks[t] || 0,
      signal: (levelsByTrack[t] || 0) >= 1 || (movedByTrack[t] || 0) >= 1,
    };
  }
  return {
    qualN,
    compChangedCells: sum(r => r.compChanged),
    compDecreases: sum(r => r.compDecreases),
    cellsByTrack, cellsByTask, movedByTrack, practiceMovedByTrack,
    practiceRepsByTask, practiceVillagersByTask, practiceMaxByTask, practiceGe8ByTask, focusPractice,
    specUp: sum(r => r.specUp),
    specZeroToPos: sum(r => r.specZeroToPos),
    specZ2PByTrack, levelsByTrack,
    anyTrackLevelN: cnt(r => r.trackLevels && TRACKS.some(t => r.trackLevels[t] >= 1)),
    gainedSkillsTotal: sum(r => r.gainedSkills.length),
    gainedAbilitiesTotal: sum(r => r.gainedAbilities.length),
    domTracks, distinctDomTracks: Object.keys(domTracks).length,
    hybridN: cnt(r => r.hybrid),
    strongN: cnt(r => r.strong.length >= 1),
    matchedTopN: cnt(r => r.matchedTop === true),
    meanTopShare: qualN ? rows.reduce((a, r) => a + r.topShare, 0) / qualN : null,
    switchedHalfN: cnt(r => r.switchedHalf),
    meanStickiness: (() => {
      const rs = rows.filter(r => r.stickN >= 10);
      return rs.length ? rs.reduce((a, r) => a + r.stickiness, 0) / rs.length : null;
    })(),
    trackTable,
  };
}

const analysis = { evid: EVID, tip: null, policies: {} };
for (const [policy, seedsRaw] of Object.entries(byPolicy)) {
  const seeds = seedsRaw.map(analyzeSeed);
  if (!analysis.tip && seeds[0] && seeds[0].tip) analysis.tip = seeds[0].tip;
  const all60 = seeds.flatMap(s => s.rows60.map(r => Object.assign({ seed: s.seed }, r)));
  const all30 = seeds.flatMap(s => s.rows30.map(r => Object.assign({ seed: s.seed }, r)));
  const p60 = pooled(all60);
  const p30 = pooled(all30);
  const dutyTot = {
    adEvents: 0, adCandCount: 0, pickEvents: 0, dutyTopScorePicks: 0,
    daysSampled: 0, daysWithOpp: 0,
    seedsWithAds: 0, seedsWithPicks: 0, seedsWithOpp: 0,
    adByTask: {}, pickByTask: {}, pickByOverride: {}, oppByTask: {},
    samplePickKinds: {}, sampleOverrides: {},
  };
  for (const s of seeds) {
    const dy = s.duty;
    dutyTot.adEvents += dy.adEvents;
    dutyTot.adCandCount += dy.adCandCount;
    dutyTot.pickEvents += dy.pickEvents;
    dutyTot.dutyTopScorePicks += (dy.dutyTopScorePicks || 0);
    dutyTot.daysSampled += dy.daysSampled;
    dutyTot.daysWithOpp += dy.daysWithOpp;
    if (dy.adEvents > 0) dutyTot.seedsWithAds++;
    if (dy.pickEvents > 0) dutyTot.seedsWithPicks++;
    if (dy.daysWithOpp > 0) dutyTot.seedsWithOpp++;
    for (const [t, n] of Object.entries(dy.adByTask)) dutyTot.adByTask[t] = (dutyTot.adByTask[t] || 0) + n;
    for (const [t, n] of Object.entries(dy.pickByTask)) dutyTot.pickByTask[t] = (dutyTot.pickByTask[t] || 0) + n;
    for (const [t, n] of Object.entries(dy.pickByOverride || {})) dutyTot.pickByOverride[t] = (dutyTot.pickByOverride[t] || 0) + n;
    for (const [t, n] of Object.entries(dy.oppByTask)) dutyTot.oppByTask[t] = (dutyTot.oppByTask[t] || 0) + n;
    for (const [t, n] of Object.entries(dy.samplePickKinds)) dutyTot.samplePickKinds[t] = (dutyTot.samplePickKinds[t] || 0) + n;
    for (const [t, n] of Object.entries(dy.sampleOverrides)) dutyTot.sampleOverrides[t] = (dutyTot.sampleOverrides[t] || 0) + n;
  }
  const tracksWithSignal = TRACKS.filter(t => p60.trackTable[t].signal);
  let verdict = 'GO';
  const reasons = [];
  if (p60.qualN === 0) { verdict = 'UNMEASURABLE'; reasons.push('qual set empty'); }
  else {
    if (tracksWithSignal.length < 4) { verdict = 'NO-GO'; reasons.push(`only ${tracksWithSignal.length}/5 tracks show movement/level`); }
    if (p60.distinctDomTracks < 2) { verdict = 'NO-GO'; reasons.push(`only ${p60.distinctDomTracks} distinct dominant track(s)`); }
    if (p60.compDecreases > 0) { verdict = 'NO-GO'; reasons.push(`${p60.compDecreases} competence decreases`); }
  }
  const taskTotals = {};
  for (const s of seeds) for (const [t, n] of Object.entries(s.taskTotals)) taskTotals[t] = (taskTotals[t] || 0) + n;
  const rungByTask = {};
  let rungTotal = 0;
  for (const s of seeds) {
    rungTotal += s.rungLines;
    for (const [t, n] of Object.entries(s.rungLinesByTask)) rungByTask[t] = (rungByTask[t] || 0) + n;
  }
  analysis.policies[policy] = {
    seedN: seeds.length,
    seeds: seeds.map(s => ({
      seed: s.seed, endDay: s.endDay, gameOver: s.gameOver, qual60: s.qual60N, qual30: s.qual30N,
      resolved: s.resolvedTotal, rungLines: s.rungLines,
      dutyAds: s.duty.adEvents, dutyPicks: s.duty.pickEvents,
      dutyTopScorePicks: s.duty.dutyTopScorePicks, daysWithOpp: s.duty.daysWithOpp,
    })),
    p60, p30, duty: dutyTot, taskTotals, rungTotal, rungByTask,
    tracksWithSignal, verdict, reasons,
  };
}

// Optional before/after vs OVE-82 after-codex-prey panel analysis.json
try {
  const beforePath = path.join(BEFORE_EVID, 'analysis.json');
  if (fs.existsSync(beforePath)) {
    const before = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
    analysis.beforeCompare = { tip: before.tip || null, path: beforePath, policies: {} };
    for (const [policy, a] of Object.entries(analysis.policies)) {
      const b = (before.policies || {})[policy];
      if (!b) continue;
      analysis.beforeCompare.policies[policy] = {
        before: {
          tip: before.tip, DUTY_ad: b.duty.adEvents, DUTY_picked: b.duty.pickEvents,
          dutyTopScorePicks: b.duty.dutyTopScorePicks || 0,
          seedsWithPicks: b.duty.seedsWithPicks, cellsByTask: b.p60.cellsByTask,
          pickByTask: (b.duty && b.duty.pickByTask) || {},
          adByTask: (b.duty && b.duty.adByTask) || {},
          focusPractice: (b.p60 && b.p60.focusPractice) || null,
          tracksWithSignal: b.tracksWithSignal, verdict: b.verdict,
        },
        after: {
          tip: analysis.tip, DUTY_ad: a.duty.adEvents, DUTY_picked: a.duty.pickEvents,
          dutyTopScorePicks: a.duty.dutyTopScorePicks, seedsWithPicks: a.duty.seedsWithPicks,
          cellsByTask: a.p60.cellsByTask,
          pickByTask: a.duty.pickByTask || {},
          adByTask: a.duty.adByTask || {},
          focusPractice: a.p60.focusPractice,
          tracksWithSignal: a.tracksWithSignal, verdict: a.verdict,
        },
      };
    }
  }
} catch (e) {
  console.warn('before-compare skipped:', e.message);
}

fs.writeFileSync(path.join(EVID, 'analysis.json'), JSON.stringify(analysis, null, 2));

console.log('tip:', analysis.tip);
console.log('evid:', EVID);
for (const [policy, a] of Object.entries(analysis.policies)) {
  console.log('\n==== POLICY', policy, 'seeds', a.seedN, '====');
  console.log('verdict:', a.verdict, a.reasons.length ? '— ' + a.reasons.join('; ') : '');
  console.log('tracks with signal:', JSON.stringify(a.tracksWithSignal), `(${a.tracksWithSignal.length}/5)`);
  console.log('DUTY_ad events:', a.duty.adEvents, '| DUTY_picked:', a.duty.pickEvents,
    '| duty_top_score picks:', a.duty.dutyTopScorePicks,
    '| seeds ads', a.duty.seedsWithAds + '/' + a.seedN,
    '| seeds picks', a.duty.seedsWithPicks + '/' + a.seedN,
    '| daysWithOpp', a.duty.daysWithOpp + '/' + a.duty.daysSampled);
  console.log('DUTY_ad by task:', JSON.stringify(a.duty.adByTask));
  console.log('DUTY_picked by task:', JSON.stringify(a.duty.pickByTask));
  console.log('DUTY_picked by override:', JSON.stringify(a.duty.pickByOverride));
  console.log('when ads present, logged pick kinds (samples):', JSON.stringify(a.duty.samplePickKinds));
  console.log('when ads present, overrides (samples):', JSON.stringify(a.duty.sampleOverrides));
  console.log('resolved by task:', JSON.stringify(a.taskTotals));
  console.log('rung lines:', a.rungTotal, JSON.stringify(a.rungByTask));
  console.log('\nper-track table (qual60, n=' + a.p60.qualN + '):');
  console.log('| track | comp rung steps | villagers moved | track lvl≥1 | specialist 0→+ | dominant | signal |');
  for (const t of TRACKS) {
    const r = a.p60.trackTable[t];
    console.log(`| ${t} | ${r.competenceRungSteps} | ${r.villagersMovedComp} | ${r.trackLevelGe1} | ${r.specialist0toPos} | ${r.dominantTrack} | ${r.signal} |`);
  }
  console.log('competence cells moved total:', a.p60.compChangedCells, '| by task:', JSON.stringify(a.p60.cellsByTask));
  console.log('focus practice (reps/villagers/maxEnd/ge8/compRungs):', JSON.stringify(a.p60.focusPractice));
  console.log('practice reps by task:', JSON.stringify(a.p60.practiceRepsByTask));
  console.log('specialist 0→+:', a.p60.specZeroToPos, '| skills+:', a.p60.gainedSkillsTotal, '| ab+:', a.p60.gainedAbilitiesTotal);
  console.log('dominant tracks:', JSON.stringify(a.p60.domTracks), '| distinct:', a.p60.distinctDomTracks);
  console.log(`behavior: strong ${a.p60.strongN}/${a.p60.qualN} hybrid ${a.p60.hybridN} matchedTop ${a.p60.matchedTopN} meanTopShare ${a.p60.meanTopShare == null ? 'n/a' : a.p60.meanTopShare.toFixed(2)}`);
  if (analysis.beforeCompare && analysis.beforeCompare.policies[policy]) {
    const c = analysis.beforeCompare.policies[policy];
    console.log('BEFORE(OVE-82) DUTY_ad→picked:', c.before.DUTY_ad, '→', c.before.DUTY_picked,
      '| AFTER(scout) DUTY_ad→picked:', c.after.DUTY_ad, '→', c.after.DUTY_picked,
      '(duty_top_score', c.after.dutyTopScorePicks + ')');
    console.log('BEFORE focusPractice:', JSON.stringify(c.before.focusPractice));
    console.log('AFTER focusPractice:', JSON.stringify(c.after.focusPractice));
    const focusPick = {};
    const focusComp = {};
    for (const t of FOCUS_PRACTICE) {
      focusPick[t] = {
        beforeAd: (c.before.adByTask || {})[t] || 0,
        afterAd: (c.after.adByTask || {})[t] || 0,
        beforePick: (c.before.pickByTask || {})[t] || 0,
        afterPick: (c.after.pickByTask || {})[t] || 0,
      };
      focusComp[t] = {
        beforeComp: (c.before.cellsByTask || {})[t] || 0,
        afterComp: (c.after.cellsByTask || {})[t] || 0,
      };
    }
    console.log('focus DUTY ad/pick before→after:', JSON.stringify(focusPick));
    console.log('focus competence cells before→after:', JSON.stringify(focusComp));
  }
}
console.log('\nwrote', path.join(EVID, 'analysis.json'));
