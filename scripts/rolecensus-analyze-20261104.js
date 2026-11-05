#!/usr/bin/env node
// Pure analysis of rolecensus seed JSONs (no harness). Reads
// evidence/2026-11-04/rolecensus-20261104-seed*.json, writes
// rolecensus-20261104-analysis.json and prints summary tables.
// Usage: node scripts/rolecensus-analyze-20261104.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-04');
const THRESH = [18, 48, 96, 192, 384];
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const TRACKS = ['combat', 'field', 'social', 'craft', 'strange'];
const DEED_TRACK = {};
try {
  const tj = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tracks.json'), 'utf8'));
  for (const [deed, rec] of Object.entries(tj.deeds || {})) DEED_TRACK[deed] = rec.track;
} catch (e) { console.warn('tracks.json deeds unreadable', e.message); }
const lvl = xp => THRESH.filter(t => (xp || 0) >= t).length;
const topKey = obj => { let bk = null, bv = -1; for (const k of Object.keys(obj || {})) if (obj[k] > bv) { bv = obj[k]; bk = k; } return bv > 0 ? bk : null; };

const files = fs.readdirSync(EVID).filter(f => /^rolecensus-20261104-seed\d+\.json$/.test(f)).sort();
const seeds = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  const scholars = new Set((d.scholarIds || [d.playerId]).map(String));
  // Mantle timing: first daily entry where this villager holds the scholar
  // role. Everything from that day on is player-driven, not NPC behavior,
  // so profiles use only the NPC window (day < firstScholarDay). A villager
  // who never holds the mantle has firstScholarDay = Infinity.
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
  // Snap timeline per vid: start, periodic 30/60/90, end.
  const snaps = {};
  const addSnap = (day, vid, s) => { if (!s) return; (snaps[String(vid)] = snaps[String(vid)] || []).push({ day, s }); };
  for (const [vid, s] of Object.entries(d.startSnap || {})) addSnap(0, vid, s);
  for (const [day, m] of Object.entries(d.periodicSnap || {})) for (const [vid, s] of Object.entries(m)) addSnap(+day, vid, s);
  for (const [vid, s] of Object.entries(d.endSnap || {})) addSnap(d.endDay, vid, s);
  for (const k of Object.keys(snaps)) snaps[k].sort((a, b) => a.day - b.day);
  const firstSnap = vid => (snaps[String(vid)] || [])[0] ? snaps[String(vid)][0].s : null;
  const lastSnap = vid => { const a = (snaps[String(vid)] || []).filter(e => inNpcWindow(vid, e.day)); return a.length ? a[a.length - 1].s : firstSnap(vid); };

  const vids = Object.keys(d.seenDays || {});
  const qual = vids.filter(v => (npcDays[v] || 0) >= 60);
  // Task profiles from resolved (excluding scholars).
  const prof = {};
  for (const r of d.resolved || []) {
    if (!inNpcWindow(r.vid, r.day)) continue;
    const p = prof[String(r.vid)] = prof[String(r.vid)] || { counts: {}, total: 0, seq: [] };
    p.counts[r.task] = (p.counts[r.task] || 0) + 1; p.total++; p.seq.push({ day: r.day, task: r.task });
  }
  // Deeds per vid.
  const deeds = {};
  for (const r of d.deeds || []) {
    if (r.who === 'player' || !inNpcWindow(r.who, r.day)) continue;
    const p = deeds[String(r.who)] = deeds[String(r.who)] || {};
    p[r.deed] = (p[r.deed] || 0) + 1;
  }
  // Lessons / seeks / kills per vid.
  const taught = {}, learned = {}, sought = {}, kills = {}, fightDeeds = {};
  for (const r of d.skillRows || []) {
    if (r.type === 'skill_lesson') {
      if (r.teacher && r.teacher !== 'player' && inNpcWindow(r.teacher, r.day)) taught[r.teacher] = (taught[r.teacher] || 0) + 1;
      if (r.learner && r.learner !== 'player' && inNpcWindow(r.learner, r.day)) learned[r.learner] = (learned[r.learner] || 0) + 1;
    }
    if (r.type === 'villager_seek_knowledge' && r.vid && inNpcWindow(r.vid, r.day)) sought[r.vid] = (sought[r.vid] || 0) + 1;
    if (r.type === 'killer_tale' && r.killer && inNpcWindow(r.killer, r.day)) kills[r.killer] = (kills[r.killer] || 0) + 1;
  }
  for (const [vid, m] of Object.entries(deeds)) for (const deed of ['fight_won', 'fight_survived', 'alien_fight']) if (m[deed]) fightDeeds[vid] = (fightDeeds[vid] || 0) + m[deed];
  // Lead-days.
  const leadDays = {};
  for (const day of d.daily || []) for (const [task, vid] of Object.entries(day.taskLeads || {})) {
    if (String(day.scholarId) === String(vid) || !inNpcWindow(vid, day.day)) continue;
    const k = String(vid);
    leadDays[k] = leadDays[k] || {}; leadDays[k][task] = (leadDays[k][task] || 0) + 1;
  }
  // Per-qual-villager rows.
  const rows = qual.map(vid => {
    const f = firstSnap(vid), l = lastSnap(vid);
    const p = prof[vid] || { counts: {}, total: 0, seq: [] };
    const sorted = Object.entries(p.counts).sort((a, b) => b[1] - a[1]);
    const shares = sorted.map(([t, n]) => [t, p.total ? n / p.total : 0]);
    const strong = shares.filter(([, s]) => s >= 0.25).map(([t]) => t);
    const comp = (f && f.competence) || {};
    const topTask = sorted.length ? sorted[0][0] : null;
    const matched = topTask ? (comp[topTask] >= 1.4) : null;
    // Stickiness: modal task per active day, P(same modal next active day).
    const byDay = {};
    for (const e of p.seq) { (byDay[e.day] = byDay[e.day] || {})[e.task] = (byDay[e.day][e.task] || 0) + 1; }
    const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
    const modal = days.map(day => topKey(byDay[day]));
    let stick = 0, stickN = 0;
    for (let i = 1; i < modal.length; i++) { stickN++; if (modal[i] === modal[i - 1]) stick++; }
    // First-half vs second-half top task (midpoint = median day of run).
    const mid = d.endDay / 2;
    const c1 = {}, c2 = {};
    for (const e of p.seq) { const c = e.day <= mid ? c1 : c2; c[e.task] = (c[e.task] || 0) + 1; }
    const top1 = topKey(c1), top2 = topKey(c2);
    // Competence / specialist movement first -> last snap.
    let compChanged = 0, specUp = 0, specZeroToPos = 0, xpGainUnskilled = 0;
    if (f && l) {
      for (const t of TASKS) if ((f.competence || {})[t] !== (l.competence || {})[t]) compChanged++;
      for (const t of SPECS) {
        const a = (f.specialist || {})[t] || 0, b = (l.specialist || {})[t] || 0;
        if (b > a) specUp++;
        if (a === 0 && b > 0) specZeroToPos++;
        if (a === 0 && ((l.foodXp || {})[t] || 0) > ((f.foodXp || {})[t] || 0)) xpGainUnskilled++;
      }
    }
    // Tracks first -> last.
    const fTr = (f && f.tracks && f.tracks.xp) || null, lTr = (l && l.tracks && l.tracks.xp) || null;
    const fTop = fTr ? topKey(fTr) : null, lTop = lTr ? topKey(lTr) : null;
    const lLevels = lTr ? Object.fromEntries(TRACKS.map(t => [t, lvl(lTr[t])])) : null;
    const anyLevel = lLevels ? TRACKS.some(t => lLevels[t] >= 1) : false;
    // Deed-dominant track.
    const deedTr = {};
    for (const [deed, n] of Object.entries(deeds[vid] || {})) { const tr = DEED_TRACK[deed]; if (tr) deedTr[tr] = (deedTr[tr] || 0) + n; }
    const deedTop = topKey(deedTr);
    const fSkills = (f && f.npcSkills) || [], lSkills = (l && l.npcSkills) || [];
    const gainedSkills = lSkills.filter(s => fSkills.indexOf(s) < 0);
    const fAb = (f && f.npcAbilities) || [], lAb = (l && l.npcAbilities) || [];
    const gainedAb = lAb.filter(s => fAb.indexOf(s) < 0);
    return { vid, occ: (f && f.occ) || (l && l.occ) || '?', temperament: (f && f.temperament) || null,
      seenDays: d.seenDays[vid], npcDays: npcDays[vid] || 0, everScholar: scholars.has(vid),
      firstDay: d.firstSeen[vid], lastDay: d.lastSeen[vid],
      totalResolved: p.total, counts: p.counts, topTask, topShare: shares.length ? shares[0][1] : 0,
      secondShare: shares.length > 1 ? shares[1][1] : 0, strong, hybrid: strong.length >= 2,
      matchedTop: matched, stickiness: stickN ? stick / stickN : null, stickN,
      topFirstHalf: top1, topSecondHalf: top2, switchedHalf: top1 && top2 && top1 !== top2,
      compChanged, specUp, specZeroToPos, xpGainUnskilled,
      trackFirstTop: fTop, trackLastTop: lTop, trackDrift: fTop && lTop && fTop !== lTop,
      trackLevels: lLevels, anyTrackLevel: anyLevel,
      deedTop, deedTrackMatch: deedTop && lTop ? deedTop === lTop : null,
      gainedSkills, gainedAbilities: gainedAb, lessonsTaught: taught[vid] || 0, lessonsLearned: learned[vid] || 0,
      seeks: sought[vid] || 0, kills: kills[vid] || 0, fightDeeds: fightDeeds[vid] || 0,
      leadDays: leadDays[vid] || {}, leadTaskCount: Object.keys(leadDays[vid] || {}).length,
      deeds: deeds[vid] || {} };
  });
  const taskTotals = {};
  for (const r of d.resolved || []) { if (!inNpcWindow(r.vid, r.day)) continue; taskTotals[r.task] = (taskTotals[r.task] || 0) + 1; }
  const leadHolders = Object.keys(leadDays);
  const maxLeadTasks = Math.max(0, ...Object.values(leadDays).map(m => Object.keys(m).length));
  seeds.push({ seed: d.seed, endDay: d.endDay, gameOver: d.gameOver,
    startN: (d.startRoster || []).length, endAlive: (d.daily || []).length ? d.daily[d.daily.length - 1].alive : null,
    everVillagers: vids.length, scholars: scholars.size, qualN: qual.length,
    neverScholarQualN: qual.filter(v => !scholars.has(v)).length,
    taskTotals, resolvedTotal: Object.values(taskTotals).reduce((a, b) => a + b, 0),
    assignedTotal: (d.assigned || []).length, deedsTotal: (d.deeds || []).length,
    leadHolders: leadHolders.length, maxLeadTasks, rows });
}

// Pooled summaries.
const allRows = seeds.flatMap(s => s.rows.map(r => Object.assign({ seed: s.seed }, r)));
const qualN = allRows.length;
const sum = (f) => allRows.reduce((a, r) => a + (f(r) || 0), 0);
const cnt = (f) => allRows.filter(f).length;
const out = { seeds: seeds.map(s => { const { rows, ...rest } = s; return rest; }), pooled: {
  qualN,
  neverScholarQualN: cnt(r => !r.everScholar), everScholarQualN: cnt(r => r.everScholar),
  compChangedCells: sum(r => r.compChanged),
  specUp: sum(r => r.specUp), specZeroToPos: sum(r => r.specZeroToPos), xpGainUnskilled: sum(r => r.xpGainUnskilled),
  hybridN: cnt(r => r.hybrid), strongN: cnt(r => r.strong.length >= 1), noStrongN: cnt(r => r.strong.length === 0),
  matchedTopN: cnt(r => r.matchedTop === true), unmatchedTopN: cnt(r => r.matchedTop === false), noTaskN: cnt(r => r.totalResolved === 0),
  meanTopShare: qualN ? allRows.reduce((a, r) => a + r.topShare, 0) / qualN : null,
  switchedHalfN: cnt(r => r.switchedHalf), withBothHalves: cnt(r => r.topFirstHalf && r.topSecondHalf),
  trackDriftN: cnt(r => r.trackDrift), trackFirstKnown: cnt(r => r.trackFirstTop), trackLastKnown: cnt(r => r.trackLastTop),
  anyTrackLevelN: cnt(r => r.anyTrackLevel), deedTrackMatchN: cnt(r => r.deedTrackMatch === true), deedTrackMismatchN: cnt(r => r.deedTrackMatch === false),
  gainedSkillsTotal: sum(r => r.gainedSkills.length), gainedAbilitiesTotal: sum(r => r.gainedAbilities.length),
  lessonsTaughtTotal: sum(r => r.lessonsTaught), lessonsLearnedTotal: sum(r => r.lessonsLearned),
  teachersN: cnt(r => r.lessonsTaught > 0), seekersN: cnt(r => r.seeks > 0),
  killersN: cnt(r => r.kills > 0), killsTotal: sum(r => r.kills), fightDeedsTotal: sum(r => r.fightDeeds),
  leadHoldersTotal: cnt(r => r.leadTaskCount > 0), multiLeadN: cnt(r => r.leadTaskCount >= 2),
  meanStickiness: (() => { const rs = allRows.filter(r => r.stickN >= 10); return rs.length ? rs.reduce((a, r) => a + r.stickiness, 0) / rs.length : null; })(),
  stickVillagers: allRows.filter(r => r.stickN >= 10).length,
}, rows: allRows };
fs.writeFileSync(path.join(EVID, 'rolecensus-20261104-analysis.json'), JSON.stringify(out, null, 2));
console.log('seeds:', seeds.map(s => `${s.seed}: endDay=${s.endDay} over=${s.gameOver} start=${s.startN} endAlive=${s.endAlive} ever=${s.everVillagers} qual=${s.qualN}`).join(' | '));
console.log('pooled qual villagers:', qualN);
console.log(JSON.stringify(out.pooled, null, 2));
console.log('\nper-villager rows (seed occ seenDays total top topShare strong matchedTop stick trackFirst->Last deedTop gainedSkills taught/learned seeks kills leadTasks):');
for (const r of allRows) console.log(` ${r.seed} ${r.occ} npcDays=${r.npcDays} everScholar=${r.everScholar} tot=${r.totalResolved} top=${r.topTask} share=${r.topShare.toFixed(2)} strong=[${r.strong.join(',')}] matched=${r.matchedTop} stick=${r.stickiness == null ? '?' : r.stickiness.toFixed(2)} (${r.stickN}) tracks=${r.trackFirstTop}->${r.trackLastTop} deedTop=${r.deedTop} skills+${r.gainedSkills.length} ab+${r.gainedAbilities.length} teach=${r.lessonsTaught}/${r.lessonsLearned} seek=${r.seeks} kills=${r.kills} leads=${r.leadTaskCount}`);
