#!/usr/bin/env node
// sim-envoyaccord-analyze.js — ENVOY->ACCORD census analyzer for arm
// sim-envoyaccord. PURE over per-seed JSON objects (no Game reads), so
// the proof test shares this implementation with the sweep report.
//
// DIAG-GO BAR (binding, MEASUREMENT.md §14 — written in the evidence
// header BEFORE sweeping; backlog #894 fix applied here):
//   diagGo = censusComplete AND envoyEvents >= 1 AND
//     noAccordEvents >= 1 AND dominant failing-condition share >= 0.5
//     among envoy-no-accord events.
// The >=1 event floors are the #894 fix: the rerunclock analyzer's
// diagGo was vacuously true on an empty qualifying population. An
// empty envoy population is NO-GO ('no-population'), never a vacuous
// GO; an all-accord population is NO-GO on this bar too (there is no
// failing condition to name — the gap would be closed, which the
// evidence would report as its own finding, not as a lever GO).
// Balanced panel (§15): N/A by construction for a DIAG census — no
// before/after, no intervention. Stated explicitly; never forced.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyEnvoyEvent } = require(path.join(__dirname, 'sim-envoyaccord-instrument'));

function median(xs) {
  const s = (xs || []).slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function analyzeCorpus(configs, plannedSeeds) {
  plannedSeeds = plannedSeeds || [];
  const bySeed = {};
  for (const c of configs) bySeed[c.seed] = c;
  const present = plannedSeeds.filter(s => bySeed[s]);
  const censusComplete = plannedSeeds.length > 0 && present.length === plannedSeeds.length;
  const rows = [];
  let envoyEvents = 0, noAccordEvents = 0, accordEvents = 0;
  const condCounts = {};
  const epithetCounts = {};
  let allBeats = 0, indispensableBeats = 0;
  const bandPool = { accept: 0, counter: 0, decline: 0, unknown: 0, shutDoor: 0, knownTotal: 0 };
  let national = 0, regional = 0, table = 0, wins = 0, exiled = 0;
  let w4 = 0, w5 = 0;
  const survivals = [];
  const deathCause = {};
  let personDeaths = 0, scholarDeaths = 0, nonScholarDeaths = 0;
  let nonScholarCombatDeaths = 0, scholarCombatDeaths = 0;
  let totalFights = 0;
  for (const seed of plannedSeeds) {
    const c = bySeed[seed];
    if (!c) { rows.push({ seed, missing: true }); continue; }
    const beats = Array.isArray(c.envoyBeats) ? c.envoyBeats : [];
    const envoy = beats.filter(b => b.isEnvoy);
    const atts = envoy.map(ev => classifyEnvoyEvent(ev));
    for (const b of beats) { epithetCounts[b.epithet || '?'] = (epithetCounts[b.epithet || '?'] || 0) + 1; }
    allBeats += beats.length; indispensableBeats += envoy.length;
    envoyEvents += envoy.length;
    for (const a of atts) {
      if (a.outcome === 'accord') accordEvents++;
      else { noAccordEvents++; condCounts[a.condition] = (condCounts[a.condition] || 0) + 1; }
    }
    for (const ev of envoy) {
      for (const k of (ev.known || [])) {
        bandPool.knownTotal++;
        bandPool[k.bandPrimary || 'unknown'] = (bandPool[k.bandPrimary || 'unknown'] || 0) + 1;
        if (k.shutDoor) bandPool.shutDoor++;
      }
    }
    national += (c.national | 0); table += (c.table | 0); wins += (c.won | 0); exiled += (c.exiled | 0);
    if (c.rankAtEnd === 'regional' || c.rankAtEnd === 'national' || c.rankAtEnd === 'global') regional++;
    if (c.unlock && c.unlock.w4Day != null) w4++;
    if (c.unlock && c.unlock.w5Day != null) w5++;
    survivals.push(c.days | 0);
    const deaths = Array.isArray(c.postunlockDeaths) ? c.postunlockDeaths : [];
    for (const d of deaths) {
      if (!d.person) continue;
      personDeaths++;
      const key = String(d.cause || 'unknown');
      deathCause[key] = (deathCause[key] || 0) + 1;
      if (d.player) { scholarDeaths++; if (d.combatCause) scholarCombatDeaths++; }
      else { nonScholarDeaths++; if (d.combatCause) nonScholarCombatDeaths++; }
    }
    totalFights += (c.postunlockFights || []).length;
    rows.push({ seed, days: c.days, endReason: c.endReason, rankAtEnd: c.rankAtEnd,
      national: c.national, table: c.table, won: c.won, maxWave: c.maxWave,
      w4Day: c.unlock ? c.unlock.w4Day : null, w5Day: c.unlock ? c.unlock.w5Day : null,
      beats: beats.length, envoyEvents: envoy.length,
      accordEvents: atts.filter(a => a.outcome === 'accord').length,
      noAccordEvents: atts.filter(a => a.outcome !== 'accord').length,
      conditions: atts.filter(a => a.outcome !== 'accord').map(a => a.condition),
      nLinksAtEnd: c.finalSnap ? c.finalSnap.nLinksActive : null,
      pendingAccordAtEnd: c.finalSnap ? !!c.finalSnap.pendingAccord : null,
      nKnownAtEnd: c.finalSnap ? c.finalSnap.nKnown : null,
      instrumentErrors: ((c.envoyErrors || []).length + (c.instrumentErrors || []).length) });
  }
  let dominant = null, dominantCount = 0;
  for (const k of Object.keys(condCounts)) if (condCounts[k] > dominantCount) { dominant = k; dominantCount = condCounts[k]; }
  const dominantShare = noAccordEvents > 0 ? dominantCount / noAccordEvents : null;
  let diagGo = false, verdictLabel = '';
  if (!censusComplete) verdictLabel = 'NO-GO-incomplete-census';
  else if (envoyEvents === 0) verdictLabel = 'NO-GO-no-population';
  else if (noAccordEvents === 0) verdictLabel = 'NO-GO-no-failing-condition';
  else if (dominantShare < 0.5) verdictLabel = 'NO-GO-diffuse';
  else { diagGo = true; verdictLabel = 'GO'; }
  const deathShares = {};
  for (const k of Object.keys(deathCause)) deathShares[k] = personDeaths ? deathCause[k] / personDeaths : 0;
  return { censusComplete, planned: plannedSeeds.length, present: present.length,
    rows, envoyEvents, accordEvents, noAccordEvents, condCounts, dominant,
    dominantCount, dominantShare, diagGo, verdictLabel,
    epithetCounts, allBeats, indispensableBeats, bandPool,
    wall: { national, regional, table, wins, exiled, w4, w5, n: present.length,
      medianSurvival: median(survivals), maxSurvival: survivals.length ? Math.max.apply(null, survivals) : null },
    deaths: { personDeaths, scholarDeaths, nonScholarDeaths, scholarCombatDeaths,
      nonScholarCombatDeaths, deathCause, deathShares },
    totalFights };
}
function main() {
  const evidDir = process.argv[2];
  const planned = (process.argv[3] || '').split(',').filter(Boolean).map(s => parseInt(s, 10));
  if (!evidDir || !planned.length) { console.error('usage: node sim-envoyaccord-analyze.js <evidDir> <seed,csv>'); process.exit(2); }
  const configs = [];
  for (const s of planned) {
    const fn = path.join(evidDir, `s${s}-competent.json`);
    if (!fs.existsSync(fn)) continue;
    configs.push(JSON.parse(fs.readFileSync(fn, 'utf8')));
  }
  const out = analyzeCorpus(configs, planned);
  console.log(JSON.stringify(out, null, 1));
}
if (require.main === module) main();
module.exports = { analyzeCorpus, median };
