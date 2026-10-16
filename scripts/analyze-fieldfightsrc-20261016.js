#!/usr/bin/env node
'use strict';
// analyze-fieldfightsrc-20261016.js — source-system attribution analysis for
// the sim-fieldfightsrc diagnostic.
//
// Reads evidence/2026-10-16/perseed-fieldfightsrc/*.json and answers:
//   1. PRIMARY: per-source share of post-invite 'monster'-verb villager
//      combat deaths (RAID / EXPEDITION / WILD-ENCOUNTER / unattributed) —
//      GO = >=95% attributed.
//   2. Per-day death rate by source (village-day denominators): post-invite,
//      post-invite ladder-active (tier>=1).
//   3. Corroboration audit: crisisOpen/crisisRaiders on RAID vs non-RAID;
//      via breakdown; monsterId presence; travel-day distribution.
//   4. Wall numbers (national / table / wins, wave 4-5 unlocks,
//      median survival).
//   5. The fork verdict data: RAID-KNOBS-DOMINANT vs FIELD-EXPOSURE-DOMINANT.
//
// Run: node scripts/analyze-fieldfightsrc-20261016.js
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldfightsrc');

function phaseOf(d, inviteDay) {
  if (inviteDay == null) return 'pre-invite';
  if (d.day < inviteDay) return 'pre-invite';
  const t = d.tier;
  if (t != null && t >= 1) return 'post-invite-in-rerun';
  return 'post-invite-outside-rerun';
}
const isVillager = (d) => /person|villager/i.test(d.kind || '') || d.player === true;

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

// ---- phase day counts (village-day denominators) ----
for (const r of runs) {
  const tierByDay = {};
  for (const row of (r.dayTiers || [])) tierByDay[row.day] = row.tier;
  r._phaseDays = { 'pre-invite': 0, 'post-invite-in-rerun': 0, 'post-invite-outside-rerun': 0 };
  for (let day = 1; day <= r.days; day++) {
    const t = tierByDay[day];
    r._phaseDays[phaseOf({ day, tier: t == null ? 0 : t }, r.inviteDay)]++;
  }
}

const SRC = ['RAID', 'EXPEDITION', 'WILD-ENCOUNTER', 'unattributed'];
const phases = ['post-invite-outside-rerun', 'post-invite-in-rerun'];

// ---- Q1: PRIMARY attribution ----
const pop = [];   // post-invite 'monster'-verb villager deaths
const viaBreak = {};
const causeBreak = {};
const crisisAudit = { RAID: { open: 0, raiders: 0 }, EXPEDITION: { open: 0, raiders: 0 }, 'WILD-ENCOUNTER': { open: 0, raiders: 0 } };
const raidMonsterIds = {};
for (const r of runs) {
  for (const d of (r.deaths || [])) {
    if (!isVillager(d) || d.family !== 'monster') continue;
    if (r.inviteDay == null || d.day < r.inviteDay) continue;
    pop.push(d);
    const vk = `${d.via || 'none'}|raid=${d.raid ? 1 : 0}`;
    viaBreak[vk] = (viaBreak[vk] || 0) + 1;
    causeBreak[d.cause] = (causeBreak[d.cause] || 0) + 1;
    if (crisisAudit[d.src]) {
      if (d.crisisOpen) crisisAudit[d.src].open++;
      if (d.crisisRaiders) crisisAudit[d.src].raiders++;
    }
    if (d.src === 'RAID' && d.monsterId) raidMonsterIds[d.monsterId] = (raidMonsterIds[d.monsterId] || 0) + 1;
  }
}
const share = {};
for (const s of SRC) share[s] = pop.filter(d => d.src === s).length;
const attributed = share.RAID + share.EXPEDITION + share['WILD-ENCOUNTER'];
const attrRate = pop.length ? attributed / pop.length : 1;

// ---- Q2: per-day rate by source (village-day denominators) ----
const rates = {};
for (const ph of phases) {
  const days = runs.reduce((t, r) => t + r._phaseDays[ph], 0);
  const bySrc = {};
  for (const s of SRC) bySrc[s] = 0;
  for (const r of runs) {
    for (const d of (r.deaths || [])) {
      if (!isVillager(d) || d.family !== 'monster') continue;
      if (phaseOf(d, r.inviteDay) !== ph) continue;
      bySrc[d.src] = (bySrc[d.src] || 0) + 1;
    }
  }
  const per = {};
  for (const s of SRC) per[s] = { n: bySrc[s], perDay: days ? bySrc[s] / days : 0 };
  rates[ph] = { days, per };
}
// pre-invite baseline for contrast (same population definition, pre-invite)
{
  const days = runs.reduce((t, r) => t + r._phaseDays['pre-invite'], 0);
  const bySrc = {};
  for (const s of SRC) bySrc[s] = 0;
  for (const r of runs) {
    for (const d of (r.deaths || [])) {
      if (!isVillager(d) || d.family !== 'monster') continue;
      if (phaseOf(d, r.inviteDay) !== 'pre-invite') continue;
      bySrc[d.src] = (bySrc[d.src] || 0) + 1;
    }
  }
  const per = {};
  for (const s of SRC) per[s] = { n: bySrc[s], perDay: days ? bySrc[s] / days : 0 };
  rates['pre-invite'] = { days, per };
}

// ---- travel-day distribution (EXPEDITION correlation honesty check) ----
const travelDays = runs.map(r => ({
  seed: r.seed, policy: r.policyId,
  nTravelDays: Object.keys(r.travelDays || {}).length,
  totalLegs: Object.values(r.travelDays || {}).reduce((a, b) => a + b, 0),
  days: r.days,
}));

// ---- wall numbers ----
const nat = runs.filter(r => r.national === 1).length;
const tbl = runs.filter(r => r.table === 1).length;
const wins = runs.filter(r => r.wins === 1).length;
const w4 = runs.filter(r => r.maxWave >= 4).length;
const w5 = runs.filter(r => r.maxWave >= 5).length;
const surv = runs.map(r => r.days).sort((a, b) => a - b);
const medSurv = surv.length % 2 ? surv[(surv.length - 1) / 2] : (surv[surv.length / 2 - 1] + surv[surv.length / 2]) / 2;
const exiled = runs.filter(r => r.exiled === 1).length;

const out = {
  nRuns: runs.length,
  primary: { population: pop.length, share, attributed, attrRate, go: attrRate >= 0.95 },
  rates,
  viaBreak, causeBreak, crisisAudit, raidMonsterIds,
  travelDays,
  wall: { national: nat, table: tbl, wins, wave4: w4, wave5: w5, medianSurvival: medSurv, exiled },
  perRun: runs.map(r => ({
    seed: r.seed, policy: r.policyId, days: r.days, end: r.endReason,
    inviteDay: r.inviteDay, national: r.national, table: r.table, wins: r.wins, maxWave: r.maxWave,
    nDeaths: r.nDeaths, postInviteMonsterVerb: r.postInviteMonsterVerb,
    postInviteSrcShare: r.postInviteSrcShare, attributionRate: r.attributionRate,
  })),
};
fs.writeFileSync(path.join(EVID, '..', 'fieldfightsrc-summary.json'), JSON.stringify(out, null, 1));

// ---- console report ----
console.log('=== sim-fieldfightsrc source-system attribution ===');
console.log(`runs=${runs.length}, population (post-invite monster-verb villager deaths)=${pop.length}`);
console.log('\nQ1 — PRIMARY (GO: >=95% attributed):');
for (const s of SRC) console.log(`  ${s}: ${share[s]} (${pop.length ? (share[s] / pop.length * 100).toFixed(1) : 0}%)`);
console.log(`  attributed: ${attributed}/${pop.length} = ${(attrRate * 100).toFixed(1)}%  ${attrRate >= 0.95 ? 'GO' : 'NO-GO'}`);
console.log('\nQ2 — per-day death rate by source (village-day denominators):');
for (const ph of ['pre-invite', 'post-invite-outside-rerun', 'post-invite-in-rerun']) {
  const x = rates[ph];
  console.log(`  ${ph} (${x.days}d):`);
  for (const s of SRC) {
    const p = x.per[s];
    console.log(`    ${s}: ${p.n} = ${(p.perDay * 100).toFixed(3)}%/day`);
  }
}
console.log('\nQ3 — corroboration audit:');
console.log('  via|raid breakdown: ' + JSON.stringify(viaBreak));
console.log('  cause breakdown: ' + JSON.stringify(causeBreak));
console.log('  crisis corroboration (open / raiders-flagged): ' + JSON.stringify(crisisAudit));
console.log('  RAID monster ids: ' + JSON.stringify(raidMonsterIds));
console.log('  travel days per run: ' + travelDays.map(t => `${t.policy}-s${t.seed}:${t.nTravelDays}d/${t.totalLegs}legs`).join(' '));
const exp = pop.filter(d => d.src === 'EXPEDITION');
console.log(`  EXPEDITION deaths: scholarAway=${exp.filter(d => d.scholarAway).length}/${exp.length}, via=${JSON.stringify(exp.reduce((a, d) => { a[d.via] = (a[d.via] || 0) + 1; return a; }, {}))}`);
console.log('\nWALL: national ' + nat + '/16 · table ' + tbl + '/16 · wins ' + wins + '/16 · wave4 ' + w4 + '/16 · wave5 ' + w5 + '/16 · median survival ' + medSurv + 'd · exiled ' + exiled + '/16');
const raidShare = pop.length ? share.RAID / pop.length : 0;
console.log(`\nFORK: RAID share of the (b)-channel = ${(raidShare * 100).toFixed(1)}% -> ` +
  (raidShare >= 0.5 ? 'RAID-KNOBS-DOMINANT (tune fix viable)' : 'FIELD-EXPOSURE-DOMINANT (deeper pacing question)'));
console.log('\nSummary JSON: evidence/2026-10-16/fieldfightsrc-summary.json');
