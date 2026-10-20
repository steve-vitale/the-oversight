#!/usr/bin/env node
// sweep-dutyfish-b.js — 8-seed pilot sweep for the duty_fish scale-up arm.
//
// 8 fresh seeds (5601-5608) x {leaddutyfish, belongdutyfish} x {control, armed}
// = 32 configs, 180d death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0 / SURPLUSFEED
// unset. One config per invocation (env: SEEDS, POLICY, OUT); a shell loop
// drives all 32 with resume support.
//
// Telemetry via scripts/prodrebound-obs-instruments.js attachObs: dawn
// snapshots (freshDays, roster), per-day per-channel inflow (duty_fish is
// instrument-classified), rot by channel + fast-rot, throttle engagement,
// deaths, laundering, duty smoke drive. Plus dutyfish telemetry (staffed,
// staff-days, throttle hits on staffed days) from ctx.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 DUTYFISH_B=1 POLICY=leaddutyfish \
//     SEEDS=5601,5602 OUT=evidence/2026-10-20/perseed-dutyfish-b/armed-lead.json \
//     node scripts/sweep-dutyfish-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leaddutyfish, belongdutyfish } = require('./policies/dutyfish-b');
const { attachObs, dayOf, pantryKcal } = require('./prodrebound-obs-instruments');

// ---- substrate guards ----
if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1 required (standard substrate)');
  process.exit(2);
}
if (process.env.SEATDRIVE === '1') {
  console.error('FATAL: SEATDRIVE must not be 1 (pre-seat substrate)');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset (base substrate; the governor is not this lever)');
  process.exit(2);
}
const SIDE = process.env.DUTYFISH_B === '1' ? 'armed' : 'control';

const POLICIES = { leaddutyfish, belongdutyfish };
const POLICY_ID = process.env.POLICY || 'leaddutyfish';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leaddutyfish;
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sweep-dutyfish-b-' + SIDE + '-' + POLICY_ID + '.json');

// ---- coordinator's banned-seed list (sweep stops on any hit) ----
// From sweep-sharelean-b.js (the 0830Z run) + 5201-5208 (sharelean) + 8001-8008 (shelltask-b2, 2026-10-20).
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708', '4801-4808', '4901-4908',
    '5201-5208', '8001-8008',
    '6810-6811', '6813-6817', '6912-6912']) {
  const [a, b] = spec.split('-').map(Number);
  for (let s = a; s <= b; s++) BANNED.add(s);
}
for (const spec of ['171,282,393,504,615,726,837,948', '121,232,343,454,565,676,787,898',
    '131,242,353,464,575,686,797,908', '151,262,373,484,595,706,817,928',
    '163,274,385,496,607,718,829,940', '205,246,321,412,523,634,745,856',
    '307,418,529,640,751,862,973,84', '917,928,939,104,215,326,437,548',
    '141,252,363,474', '101,202,303,404,606,707,808,909',
    '137,248,359,470,581,692,803,914']) {
  for (const s of spec.split(',').map(Number)) BANNED.add(s);
}
const SEEDS = (process.env.SEEDS || '5601,5602,5603,5604,5605,5606,5607,5608')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
console.log(`side=${SIDE} policy=${POLICY_ID} seeds: ${SEEDS.join(',')} (banned-check clean)`);

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'dutyfish-b-' + SIDE + '-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachObs(Game);

  // --- per-day dutyfish telemetry + starveDays, via the policy wrapper ---
  const df = { staffed: 0, staffDays: 0, throttleHits: 0, leanDays: 0 };
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) { W.starveDays++; W.starveByDay[dayOf(G)] = 1; }
    } catch (e) {}
    const r = origDaily ? origDaily(G, ctx) : undefined;
    try {
      if (ctx._dfLeanDay) df.leanDays++;
      df.staffed = ctx._dfStaffed || 0;
      df.staffDays = ctx._dfStaffDays || 0;
      df.throttleHits = ctx._dfThrottleHit || 0;
    } catch (e) {}
    return r;
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null, sampleEvery: 181 });
  const ms = Date.now() - t0;
  let exiled = 0, rosterEnd = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const round1 = (o) => { const r = {}; for (const k of Object.keys(o)) r[k] = Math.round(o[k]); return r; };
  const starveDeaths = (W.deaths || []).filter(d => /starv/i.test(d.cause || '')).length;
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    table: (() => { try { return !!((Game.progState ? Game.progState() : {}).tableWaiting); } catch (e) { return null; } })(),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled, pkEnd: Math.round(pantryKcal(Game)),
    rotByCh: round1(W.rotByCh), rotByChFast: round1(W.rotByChFast),
    laundered: W.laundered, starveDays: W.starveDays, starveDeaths,
    inflow: round1(W.inflow),
    dawn: W.dawnSamples, dayInflow: W.dayInflow, dayThrottle: W.dayThrottle,
    assignCounts: W.assignCounts,
    deaths: W.deaths, dutyfish: df, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  try {
    const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    if (prev && Array.isArray(prev.rows)) {
      for (const r of prev.rows) rows.push(r);
      console.log(`resume: ${rows.length} seeds already done (${rows.map(r => r.seed).join(',')})`);
    }
  } catch (e) {}
  const doneSet = new Set(rows.map(r => r.seed));
  for (const seed of SEEDS) {
    if (doneSet.has(seed)) continue;
    const row = await oneRun(seed, DAYS);
    rows.push(row);
    fs.writeFileSync(OUT, JSON.stringify({ side: SIDE, policy: POLICY_ID, days: DAYS, rows }, null, 1));
    console.log(`seed ${seed}: done (${row.end.days}d, ${row.end.endReason}, staffed ${row.end.dutyfish.staffed})`);
  }
  console.log(`wrote ${OUT}`);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
