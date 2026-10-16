#!/usr/bin/env node
'use strict';
// analyze-overtimedeath-20261016.js — attribution analysis for the
// sim-overtimedeath diagnostic.
//
// Reads evidence/2026-10-16/perseed-overtimedeath/*.json and answers the
// four task questions:
//   1. Per-death classification (a/b/c/d) for every post-invite death —
//      GO = 100% attributed, unattributed bucket exactly 0.
//   2. Per-day combat-death rate: pre-invite vs post-invite-in-rerun vs
//      post-invite-outside-rerun (village-day denominators).
//   3. The rerun ladder's escalation trajectory per run.
//   4. Invite timing vs the mortality curve (winDayFloor d90 interaction).
// Plus the wall numbers (national / table / wins, wave 4-5 unlocks,
// median survival).
//
// Run: node scripts/analyze-overtimedeath-20261016.js
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-overtimedeath');

// Pure classifiers — the same contract as the instrument's bucket()/phaseOf().
function bucket(d) {
  if (d.day == null || d.cause == null) return 'd';
  if (d.rerunFight) return 'a';
  const fam = d.family;
  if (fam === 'combat' || fam === 'monster') return 'b';
  return 'c';
}
function phaseOf(d, inviteDay) {
  if (inviteDay == null) return 'pre-invite';
  if (d.day < inviteDay) return 'pre-invite';
  const t = d.tier;
  if (t != null && t >= 1) return 'post-invite-in-rerun';
  return 'post-invite-outside-rerun';
}
const isVillager = (d) => /person|villager/i.test(d.kind || '') || d.player === true;
const isCombat = (d) => d.family === 'combat' || d.family === 'monster';

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

// ---- per-run phase day counts (village-day denominators) ----
for (const r of runs) {
  const tierByDay = {};
  for (const row of (r.dayTiers || [])) tierByDay[row.day] = row.tier;
  const days = r.days;
  const inv = r.inviteDay;
  r._phaseDays = { 'pre-invite': 0, 'post-invite-in-rerun': 0, 'post-invite-outside-rerun': 0 };
  r._phase = {};
  for (let day = 1; day <= days; day++) {
    const t = tierByDay[day];
    const ph = phaseOf({ day, tier: t == null ? 0 : t }, inv);
    r._phase[day] = ph;
    r._phaseDays[ph]++;
  }
}

// ---- question 1: classification completeness ----
const att = { a: 0, b: 0, c: 0, d: 0 };
const attByPhase = {};
const postInviteDeaths = [];
const subc = {}; // (c) family sub-buckets
for (const r of runs) {
  for (const d of (r.deaths || [])) {
    const b = bucket(d);
    const ph = phaseOf(d, r.inviteDay);
    d._bucket = b; d._phase = ph;
    if (d.day >= (r.inviteDay || Infinity)) {
      postInviteDeaths.push(d);
      att[b]++;
      attByPhase[ph] = attByPhase[ph] || { a: 0, b: 0, c: 0, d: 0 };
      attByPhase[ph][b]++;
      if (b === 'c') { const f = d.family || 'unknown'; subc[f] = (subc[f] || 0) + 1; }
    }
  }
}

// ---- question 2: per-day combat-death rates by phase ----
const phases = ['pre-invite', 'post-invite-in-rerun', 'post-invite-outside-rerun'];
const rates = {};
for (const ph of phases) {
  const days = runs.reduce((t, r) => t + r._phaseDays[ph], 0);
  let vCombat = 0, vAll = 0, mCombat = 0;
  for (const r of runs) {
    for (const d of (r.deaths || [])) {
      if (phaseOf(d, r.inviteDay) !== ph) continue;
      if (isVillager(d)) { vAll++; if (isCombat(d)) vCombat++; }
      else if (/monster|animal/i.test(d.kind || '')) { if (isCombat(d)) mCombat++; }
    }
  }
  rates[ph] = { days, vCombat, vAll, mCombat, vCombatPerDay: days ? vCombat / days : 0, vAllPerDay: days ? vAll / days : 0 };
}
// never-offered (inviteDay..89) vs offered (90+) sub-phase, post-invite only
const sub = { 'never-offered(wait)': { days: 0, vCombat: 0, vAll: 0 }, 'offered(d90+)': { days: 0, vCombat: 0, vAll: 0 } };
for (const r of runs) {
  const inv = r.inviteDay;
  if (inv == null) continue;
  const tierByDay = {};
  for (const row of (r.dayTiers || [])) tierByDay[row.day] = row.tier;
  for (let day = Math.max(inv, 1); day <= r.days; day++) {
    const k = day < 90 ? 'never-offered(wait)' : 'offered(d90+)';
    sub[k].days++;
  }
  for (const d of (r.deaths || [])) {
    if (d.day < inv) continue;
    const k = d.day < 90 ? 'never-offered(wait)' : 'offered(d90+)';
    if (isVillager(d)) { sub[k].vAll++; if (isCombat(d)) sub[k].vCombat++; }
  }
}

// ---- question 3: ladder escalation trajectory ----
const ladder = runs.map(r => {
  const tiers = (r.dayTiers || []).map(row => row.tier || 0);
  const maxT = Math.max(0, ...tiers);
  const tierHit = {};
  for (const row of (r.dayTiers || [])) {
    const t = row.tier || 0;
    for (let x = 1; x <= t; x++) if (!(x in tierHit)) tierHit[x] = row.day;
  }
  const deathsByTier = {};
  let rerunShare = 0, vDeaths = 0;
  for (const d of (r.deaths || [])) {
    if (!isVillager(d)) continue;
    vDeaths++;
    const t = d.tier || 0;
    deathsByTier[t] = (deathsByTier[t] || 0) + 1;
    if (d.rerunFight) rerunShare++;
  }
  return {
    seed: r.seed, policy: r.policyId, days: r.days, end: r.endReason,
    inviteDay: r.inviteDay, maxTier: maxT, tierHit,
    vDeaths, deathsByTier, rerunShare,
  };
});
const daysPerTier = {};
const deathsPerTier = {};
for (const r of runs) {
  for (const row of (r.dayTiers || [])) {
    const t = row.tier || 0;
    daysPerTier[t] = (daysPerTier[t] || 0) + 1;
  }
  for (const d of (r.deaths || [])) {
    if (!isVillager(d)) continue;
    const t = d.tier || 0;
    deathsPerTier[t] = (deathsPerTier[t] || 0) + 1;
  }
}

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
  attribution: { total: postInviteDeaths.length, buckets: att, byPhase: attByPhase, subC: subc },
  rates, subPhases: sub,
  ladder, daysPerTier, deathsPerTier,
  wall: { national: nat, table: tbl, wins, wave4: w4, wave5: w5, medianSurvival: medSurv, exiled },
  perRun: runs.map(r => ({
    seed: r.seed, policy: r.policyId, days: r.days, end: r.endReason,
    inviteDay: r.inviteDay, seat: r.seatAtInvite, sittings: r.sittings,
    national: r.national, table: r.table, wins: r.wins, maxWave: r.maxWave,
    nDeaths: r.nDeaths, buckets: r.buckets, phaseDays: r._phaseDays,
  })),
};
fs.writeFileSync(path.join(EVID, '..', 'overtimedeath-summary.json'), JSON.stringify(out, null, 1));

// ---- console report ----
console.log('=== sim-overtimedeath attribution ===');
console.log(`runs=${runs.length}`);
console.log('\nQ1 — post-invite death attribution (GO: 100%, unattributed=0):');
console.log(`  post-invite deaths: ${postInviteDeaths.length}`);
console.log(`  (a) combat-in-rerun: ${att.a}  (b) combat-outside-rerun: ${att.b}  (c) non-combat: ${att.c}  (d) unattributed: ${att.d}`);
console.log(`  by phase: ${JSON.stringify(attByPhase)}`);
console.log(`  (c) sub-buckets: ${JSON.stringify(subc)}`);
console.log('\nQ2 — per-day villager combat-death rate by phase (village-day denominators):');
for (const ph of phases) {
  const x = rates[ph];
  console.log(`  ${ph}: ${x.vCombat}/${x.days}d = ${(x.vCombatPerDay * 100).toFixed(2)}%/day (all villager deaths ${(x.vAllPerDay * 100).toFixed(2)}%/day; monster combat kills ${x.mCombat})`);
}
console.log('  post-invite sub-phases:');
for (const k of Object.keys(sub)) {
  const x = sub[k];
  console.log(`    ${k}: combat ${x.vCombat}/${x.days}d = ${x.days ? (x.vCombat / x.days * 100).toFixed(2) : 0}%/day (all ${x.vAll})`);
}
console.log('\nQ3 — ladder trajectory (days-per-tier, villager deaths-per-tier):');
console.log(`  daysPerTier: ${JSON.stringify(daysPerTier)}`);
console.log(`  deathsPerTier: ${JSON.stringify(deathsPerTier)}`);
const hitDays = {};
for (const l of ladder) for (const [t, d] of Object.entries(l.tierHit)) { (hitDays[t] = hitDays[t] || []).push(d); }
console.log('  median day each tier first hit: ' + Object.keys(hitDays).sort().map(t => {
  const a = hitDays[t].sort((x, y) => x - y);
  return `x${t}@d${a[Math.floor(a.length / 2)]}`;
}).join(', '));
console.log('  per run: ' + ladder.map(l => `${l.policy}-s${l.seed}:inv${l.inviteDay} maxT${l.maxTier} vD${l.vDeaths} rerunFlag${l.rerunShare} end${l.end}d${l.days}`).join(' | '));
console.log('\nQ4 — invite timing:');
const invDays = runs.map(r => r.inviteDay).filter(x => x != null).sort((a, b) => a - b);
console.log(`  invite days: ${invDays.join(',')}`);
console.log(`  invited pre-floor (<90): ${invDays.filter(d => d < 90).length}/${invDays.length}`);
console.log('\nWALL: national ' + nat + '/16 · table ' + tbl + '/16 · wins ' + wins + '/16 · wave4 ' + w4 + '/16 · wave5 ' + w5 + '/16 · median survival ' + medSurv + 'd · exiled ' + exiled + '/16');
console.log('\nSummary JSON: evidence/2026-10-16/overtimedeath-summary.json');
