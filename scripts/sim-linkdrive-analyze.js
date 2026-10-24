#!/usr/bin/env node
// sim-linkdrive-analyze.js — paired analysis for the sim-linkdrive pilot
// (stdout only; never writes, so the read-taint class cannot touch it).
// Reads evidence/2026-10-24/perseed-linkdrive/s<seed>-<arm>.json (top
// level only; probe/ and sense/ subdirs are excluded by the filename
// filter). Recomputes the pre-registered primary + guardrails from the
// corpora, so the evidence file's table is a transcription of this
// output, not a hand count.
//
// Pre-registered bar (binding, evidence header):
//   PRIMARY GO: national armed >= 2/8 AND armed national > control national.
//   GUARDRAILS (breach = KILLED even if primary passes):
//     median survival armed >= 0.8x control median;
//     starvation deaths armed <= control + 2;
//     no lever-caused death-mode spike (any cause with >=3 armed deaths
//       and 0 control deaths must be named and judged).
// Usage: node scripts/sim-linkdrive-analyze.js [EVID=...]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-linkdrive');
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const sum = (rows, fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);

const files = fs.readdirSync(EVID).filter(x => /^s7340\d+-(control|armed)\.json$/.test(x)).sort();
const byArm = { control: [], armed: [] };
for (const f of files) { const d = load(path.join(EVID, f)); byArm[d.arm].push(d); }
for (const a of ['control', 'armed']) byArm[a].sort((x, y) => x.seed - y.seed);

function armSummary(rows) {
  const byCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathTotals.byCause || {})) byCause[k] = (byCause[k] || 0) + v;
  return {
    n: rows.length,
    seeds: rows.map(r => r.seed),
    national: sum(rows, r => r.national), regional: sum(rows, r => r.regional),
    global: sum(rows, r => r.global), table: sum(rows, r => r.table),
    won: sum(rows, r => r.won), exiled: sum(rows, r => r.exiled),
    maxWaveDist: rows.map(r => r.maxWave).reduce((m, w) => { m[w] = (m[w] || 0) + 1; return m; }, {}),
    gameDays: rows.map(r => r.gameDays),
    medianGameDays: med(rows.map(r => r.gameDays)),
    maxGameDays: Math.max(...rows.map(r => r.gameDays)),
    deaths: sum(rows, r => r.deathTotals.total),
    scholarDeaths: sum(rows, r => r.deathTotals.scholar),
    villagerDeaths: sum(rows, r => r.deathTotals.villager),
    villagerCombatDeaths: sum(rows, r => r.deathTotals.villagerCombat),
    starvationDeaths: sum(rows, r => (r.deathTotals.byCause || {}).starvation || 0),
    byCause,
    linksFormed: sum(rows, r => r.links.formed),
    linksDissolved: sum(rows, r => r.links.dissolved),
    maxSubsPerSeed: rows.map(r => r.links.maxSubs),
    finalSubsPerSeed: rows.map(r => r.links.finalSubs),
    court: Object.fromEntries(['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'proposedLead', 'tended', 'defenseCalls']
      .map(k => [k, sum(rows, r => (r.court || {})[k] || 0)])),
    errors: sum(rows, r => (r.errors || []).length),
    anchors: [...new Set(rows.map(r => r.anchor12))],
  };
}
const c = armSummary(byArm.control), a = armSummary(byArm.armed);
const pairedSeeds = byArm.control.map(r => r.seed).filter(s => byArm.armed.some(r => r.seed === s));
const spikes = Object.keys(a.byCause).filter(k => (a.byCause[k] || 0) >= 3 && !(c.byCause[k] || 0))
  .map(k => ({ cause: k, armed: a.byCause[k], control: 0 }));
const verdict = {
  primaryNationalArmedGe2: a.national >= 2,
  primaryArmedGtControl: a.national > c.national,
  primaryGO: a.national >= 2 && a.national > c.national,
  guardMedian: a.medianGameDays >= 0.8 * c.medianGameDays,
  guardMedianRatio: c.medianGameDays ? +(a.medianGameDays / c.medianGameDays).toFixed(3) : null,
  guardStarvation: a.starvationDeaths <= c.starvationDeaths + 2,
  guardStarvationDiff: a.starvationDeaths - c.starvationDeaths,
  guardSpikes: spikes,
  guardSpikesClean: spikes.length === 0,
  guardrailsPass: (a.medianGameDays >= 0.8 * c.medianGameDays) && (a.starvationDeaths <= c.starvationDeaths + 2) && spikes.length === 0,
};
verdict.overall = verdict.primaryGO && verdict.guardrailsPass ? 'GO-CANDIDATE (default-OFF; landing as competent play is a coordinator/Steve call, NOT decided here)' : 'KILLED-AT-PILOT';
console.log(JSON.stringify({ files: files.length, pairedSeeds, control: c, armed: a, verdict }, null, 1));
// Per-seed paired table (gameDays / rank / national / table / maxWave / formed / dissolved / maxSubs).
console.log('PAIRED-SEEDS');
for (const s of pairedSeeds) {
  const cr = byArm.control.find(r => r.seed === s), ar = byArm.armed.find(r => r.seed === s);
  console.log(JSON.stringify({ seed: s,
    control: { gameDays: cr.gameDays, end: cr.endReason, rank: cr.scaleRank, national: cr.national, table: cr.table, won: cr.won, exiled: cr.exiled, maxWave: cr.maxWave, deaths: cr.deathTotals.total, starv: cr.deathTotals.byCause.starvation || 0, villCombat: cr.deathTotals.villagerCombat, formed: cr.links.formed, dissolved: cr.links.dissolved, maxSubs: cr.links.maxSubs, finalSubs: cr.links.finalSubs, court: cr.court },
    armed: { gameDays: ar.gameDays, end: ar.endReason, rank: ar.scaleRank, national: ar.national, table: ar.table, won: ar.won, exiled: ar.exiled, maxWave: ar.maxWave, deaths: ar.deathTotals.total, starv: ar.deathTotals.byCause.starvation || 0, villCombat: ar.deathTotals.villagerCombat, formed: ar.links.formed, dissolved: ar.links.dissolved, maxSubs: ar.links.maxSubs, finalSubs: ar.links.finalSubs, court: ar.court } }));
}
