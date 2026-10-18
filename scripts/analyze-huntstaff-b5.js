#!/usr/bin/env node
// scripts/analyze-huntstaff-b5.js — judges the sim-huntstaff-b5
// pre-registered gates from the per-seed corpus
// (evidence/2026-10-18/perseed-huntstaff-b5/). Deterministic.
// Writes evidence/2026-10-18/huntstaff-b5-analysis.json + prints verdicts.
//
// Gates (from the evidence header):
//   PRIMARY: armed boar+bear ENGAGEMENTS >= 6 across the armed side.
//   ENGAGEMENT (kill-fast): armed hunt duties assigned >= 8.
//   GUARDRAILS: per-pair assigned-hunter deaths (wound-chain attributed)
//     <= control+2; median survival >= control-10d; no new death mode;
//     det-gate byte-identical (proved in test-huntstaff-b5.js Part B).
'use strict';
const fs = require('fs');
const path = require('path');

const PERSEED = process.env.PERSEED || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-huntstaff-b5');
const SEEDS = [105101, 105102, 105103, 105104, 107201, 107202, 107203, 107204];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm, p, s) {
  const f = path.join(PERSEED, `${arm}-${p}-s${s}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

const median = (xs) => {
  const a = xs.slice().sort((x, y) => x - y);
  return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};

const rows = { control: [], armed: [] };
for (const arm of ['control', 'armed'])
  for (const p of POLICIES)
    for (const s of SEEDS)
      rows[arm].push({ policy: p, seed: s, r: load(arm, p, s) });

const sum = (arr, fn) => arr.reduce((t, x) => t + (fn(x) || 0), 0);

// --- PRIMARY ---
const armedBB = sum(rows.armed, x => x.r.bbEngagements);
const controlBB = sum(rows.control, x => x.r.bbEngagements);
const armedBBKills = sum(rows.armed, x => x.r.bbKills);
const armedAssignments = sum(rows.armed, x => x.r.huntAssignmentsFired);
const controlAssignments = sum(rows.control, x => x.r.huntAssignAttempts);

// --- engagement breakdown ---
const byAid = { wild_boar: { eng: 0, kills: 0, kcal: 0 }, black_bear: { eng: 0, kills: 0, kcal: 0 } };
const bySource = { 'layer-staffed': 0, 'engine-tasklead': 0 };
const controlBySource = { 'layer-staffed': 0, 'engine-tasklead': 0 };
for (const x of rows.armed) {
  for (const e of (x.r.bbEngageRows || [])) {
    byAid[e.aid].eng++; bySource[e.source] = (bySource[e.source] || 0) + 1;
    if (e.killed) { byAid[e.aid].kills++; byAid[e.aid].kcal += e.kcal || 0; }
  }
}
for (const x of rows.control) {
  for (const e of (x.r.bbEngageRows || [])) controlBySource[e.source] = (controlBySource[e.source] || 0) + 1;
}

// --- guardrails ---
const pairRows = [];
let assignedDeathPairsOk = 0, assignedDeathPairsTotal = 0;
for (const p of POLICIES) for (const s of SEEDS) {
  const a = load('armed', p, s), c = load('control', p, s);
  const aD = (a.assignedHunterDeaths || []).filter(d => d.dayDied != null && d.huntAttributable).length;
  const cD = (c.assignedHunterDeaths || []).filter(d => d.dayDied != null && d.huntAttributable).length;
  const ok = aD <= cD + 2;
  assignedDeathPairsTotal++; if (ok) assignedDeathPairsOk++;
  pairRows.push({ policy: p, seed: s, armedAttrDeaths: aD, controlAttrDeaths: cD, ok });
}
const medArmed = median(rows.armed.map(x => x.r.gameDays));
const medControl = median(rows.control.map(x => x.r.gameDays));
const armedCauses = new Set(), controlCauses = new Set();
for (const x of rows.armed) Object.keys(x.r.villagerCauseCounts || {}).forEach(k => armedCauses.add(k));
for (const x of rows.control) Object.keys(x.r.villagerCauseCounts || {}).forEach(k => controlCauses.add(k));
const newDeathModes = [...armedCauses].filter(k => !controlCauses.has(k));

// --- wall ---
const wall = {};
for (const arm of ['control', 'armed']) {
  const rs = rows[arm].map(x => x.r);
  wall[arm] = {
    national: sum(rows[arm], x => x.r.national),
    table: sum(rows[arm], x => x.r.table),
    wins: sum(rows[arm], x => x.r.wins),
    wave4: sum(rows[arm], x => x.r.wave4),
    wave5: sum(rows[arm], x => x.r.wave5),
    arc2: sum(rows[arm], x => x.r.arc2), arc3: sum(rows[arm], x => x.r.arc3), arc4: sum(rows[arm], x => x.r.arc4),
    fourRealm: sum(rows[arm], x => x.r.fourRealm),
    medianSurvival: median(rs.map(r => r.gameDays)),
    maxSurvival: Math.max(...rs.map(r => r.gameDays)),
    exiled: sum(rows[arm], x => x.r.exiled),
    villagerDeathsDedup: sum(rows[arm], x => x.r.villagerDeathsDedup),
  };
}

const verdicts = {
  primary_bbEngagements_ge6: armedBB >= 6,
  engagement_assignments_ge8: armedAssignments >= 8,
  guard_assignedHunterDeaths_pairs: assignedDeathPairsOk === assignedDeathPairsTotal,
  guard_medianSurvival: medArmed >= medControl - 10,
  guard_noNewDeathMode: newDeathModes.length === 0,
};

const out = {
  arm: 'sim-huntstaff-b5',
  runId: 'fleshout-loop-b-20261018T1530Z',
  primary: {
    armedBBEngagements: armedBB, controlBBEngagements: controlBB,
    armedBBKills, threshold: 6, GO: verdicts.primary_bbEngagements_ge6,
  },
  engagement: {
    armedDutiesAssigned: armedAssignments, controlHuntAssignAttempts: controlAssignments,
    threshold: 8, GO: verdicts.engagement_assignments_ge8,
  },
  byAid, bySource, controlBySource,
  guardrails: {
    assignedHunterDeaths_perPair: { pairs: pairRows, ok: verdicts.guard_assignedHunterDeaths_pairs },
    medianSurvival: { armed: medArmed, control: medControl, GO: verdicts.guard_medianSurvival },
    newDeathModes, GO_noNewDeathMode: verdicts.guard_noNewDeathMode,
  },
  wall,
  verdicts,
  verdict: Object.values(verdicts).every(Boolean) ? 'GO' : 'NO-GO',
};

const outPath = path.join(__dirname, '..', 'evidence', '2026-10-18', 'huntstaff-b5-analysis.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log('wrote', outPath);
console.log(JSON.stringify({
  verdict: out.verdict,
  primary: `${armedBB} armed engagements (>=6) vs ${controlBB} control`,
  engagementGate: `${armedAssignments} duties armed (>=8)`,
  byAid, bySource, controlBBEngagements: controlBB, controlBySource,
  assignedHunterPairs: `${assignedDeathPairsOk}/${assignedDeathPairsTotal}`,
  medianSurvival: `${medArmed}d armed vs ${medControl}d control`,
  newDeathModes,
  wall,
}, null, 2));
