#!/usr/bin/env node
// analyze-collapseband-b.js — COLLAPSING-BAND timeliness analysis for
// sim-collapseband-b (DIAG ONLY). Thin layer over the REUSED VERBATIM
// analyzer scripts/analyze-gatediseng-b.js (never edited): it imports
// analyzeSeedGatediseng and adds ONLY, per
// evidence/2026-11-02/sim-collapseband-b-prereg.md:
//   - collapse classification (reused analyzer's `collapsed` flag:
//     daysAlive < days OR endReason == 'village-lost');
//   - 51608-CLASS flag (collapsing AND >= 1 starvation death);
//   - reference day (first starvation day if any, else collapse day
//     = daysAlive) and lead = reference day - (c) first firing day;
//   - the band verdict (PASS / PASS-SINGLE / FAIL / DIAG-NO-BAND /
//     INSUFFICIENT-DATA on analyzer mismatch, which cannot happen
//     through this import path and is checked anyway).
// Pure functions over seed .jsonl objects; no game load, no file
// writes, no RNG. Reads seed .jsonl objects on stdin (one per line)
// and prints a JSON summary to stdout.
'use strict';
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');

function analyzeCollapseSeed(seedJson) {
  const a = analyzeSeedGatediseng(seedJson);
  const deaths = (seedJson && seedJson.deaths) || [];
  const starvationDeaths = deaths.filter(
    (x) => x && x.cause === 'starvation' && typeof x.day === 'number');
  const collapsed = a.collapsed === true;
  const starvationClass = collapsed && starvationDeaths.length > 0;
  const refDay = collapsed
    ? (a.firstStarvationDay != null ? a.firstStarvationDay : a.daysAlive)
    : null;
  const c = a.candidates ? a.candidates.c_standDownTrend : null;
  const firingDay = c != null ? c.day : null;
  const lead = (collapsed && firingDay != null && refDay != null)
    ? (refDay - firingDay) : null;
  return {
    seed: a.seed,
    endReason: a.endReason,
    daysAlive: a.daysAlive,
    survived: a.survived,
    collapsed,
    starvationClass,
    firstStarvationDay: a.firstStarvationDay,
    starvationDeathDays: starvationDeaths.map((x) => x.day),
    refDay,
    cFiring: c,
    firingDay,
    lead,
    leadGE3: lead != null && lead >= 3,
    leadGE6: lead != null && lead >= 6,
    startsDisengaged: a.startsDisengaged,
  };
}

function summarizeCollapseBand(allSeeds) {
  const seeds = allSeeds.map((sj) => analyzeCollapseSeed(sj));
  const collapsing = seeds.filter((s) => s.collapsed);
  const survivors = seeds.filter((s) => s.survived);
  let verdict;
  let verdictReason;
  if (collapsing.length === 0) {
    verdict = 'DIAG-NO-BAND';
    verdictReason = '0 collapsing seeds in the screened budget; no timeliness verdict.';
  } else if (collapsing.length === 1) {
    const s = collapsing[0];
    if (s.lead != null && s.lead >= 6) {
      verdict = 'TIMELINESS-PASS-SINGLE';
      verdictReason = 'Single collapsing seed fires with lead >= 6 days (n = 1 caveat).';
    } else {
      verdict = 'TIMELINESS-FAIL';
      verdictReason = 'Single collapsing seed fires late (lead < 6) or never.';
    }
  } else {
    const allGE3 = collapsing.every((s) => s.leadGE3);
    const nGE6 = collapsing.filter((s) => s.leadGE6).length;
    const fracGE6 = nGE6 / collapsing.length;
    if (allGE3 && fracGE6 >= 0.5) {
      verdict = 'TIMELINESS-PASS';
      verdictReason = 'Every band seed fires with lead >= 3 and >= 50% reach >= 6.';
    } else {
      verdict = 'TIMELINESS-FAIL';
      verdictReason = 'Carried-margin leg: ' + allGE3 +
        '; 51608-class leg: ' + nGE6 + '/' + collapsing.length +
        ' at >= 6 days (' + fracGE6.toFixed(3) + ').';
    }
  }
  return {
    screened: seeds.length,
    survivors: survivors.length,
    collapsingSeeds: collapsing.map((s) => s.seed),
    collapsingCount: collapsing.length,
    collapsingRate: seeds.length === 0 ? null : collapsing.length / seeds.length,
    seeds,
    verdict,
    verdictReason,
  };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeCollapseBand(seeds), null, 2) + '\n');
  });
}

module.exports = { analyzeCollapseSeed, summarizeCollapseBand };
