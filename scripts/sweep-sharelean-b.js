#!/usr/bin/env node
// sweep-sharelean-b.js — pilot sweep for the share_surplus lean valve
// (arm sim-sharelean-b, run fleshout-loop-b-20261020TxxxxxxZ).
//
// Paired before/after on identical seeds, pooled over lead+belong.
// Control: SHARELEAN unset. Armed: SHARELEAN=1.
// Both sides: sharelean-wrapped feastscale policies (leadsharelean /
// belongsharelean) + FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset.
// Instruments: scripts/prodrebound-obs-instruments.js (read-only, RNG-clean
// per the DIAG's det-gate) for per-day inflow by channel + dawn pantry
// posture + rot attribution + kind-aware deaths.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SHARELEAN=1 \
//   SEEDS="5201,5202,5203,5204,5205,5206,5207,5208" POLICY=leadsharelean \
//   DAYS=180 OUT=evidence/2026-10-20/perseed-sharelean-b/armed-lead.json \
//   node scripts/sweep-sharelean-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadsharelean, belongsharelean } = require('./policies/sharelean');
const { attachObs, dayOf, pantryKcal } = require('./prodrebound-obs-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SURPLUSFEED === '1') {
  console.error('FATAL: SURPLUSFEED must be unset (base substrate; the governor is not this lever)');
  process.exit(2);
}
const SIDE = process.env.SHARELEAN === '1' ? 'armed' : 'control';

const POLICIES = { leadsharelean, belongsharelean };
const POLICY_ID = process.env.POLICY || 'leadsharelean';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadsharelean;
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sweep-sharelean-b-' + SIDE + '-' + POLICY_ID + '.json');

// ---- coordinator's banned-seed list (sweep stops on any hit) ----
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708', '4801-4808', '4901-4908',
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
const SEEDS = (process.env.SEEDS || '5201,5202,5203,5204,5205,5206,5207,5208')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
console.log(`side=${SIDE} policy=${POLICY_ID} seeds: ${SEEDS.join(',')} (banned-check clean)`);

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'sharelean-b-' + SIDE + '-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachObs(Game);

  // --- per-day valve telemetry + starveDays, via the policy wrapper ---
  const valve = { arms: 0, movedKcal: 0, valveDays: 0, leanDays: 0 };
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
      if (ctx._slLeanDay) valve.leanDays++;
      valve.arms = ctx._slArms || 0;
      valve.movedKcal = Math.round(ctx._slMovedKcal || 0);
      valve.valveDays = ctx._slValveDays || 0;
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
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled, pkEnd: Math.round(pantryKcal(Game)),
    rotByCh: round1(W.rotByCh), rotByChFast: round1(W.rotByChFast),
    laundered: W.laundered, starveDays: W.starveDays, starveDeaths,
    inflow: round1(W.inflow),
    dawn: W.dawnSamples, dayInflow: W.dayInflow,
    deaths: W.deaths, valve, ms,
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
    if (doneSet.has(seed)) { console.log(`skip seed=${seed} (already done)`); continue; }
    const { seed: s, end } = await oneRun(seed, DAYS);
    const inTot = Object.entries(end.inflow || {}).reduce((t, [k, v]) => t + v, 0);
    const fastRot = Object.entries(end.rotByChFast || {}).reduce((t, [k, v]) => t + v, 0);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} national=${end.nationalLive} inflow=${Math.round(inTot / 1000)}k fastRot=${Math.round(fastRot / 1000)}k starveD=${end.starveDays} starveDeaths=${end.starveDeaths} valve=${end.valve.valveDays}d/${Math.round(end.valve.movedKcal / 1000)}k won=${end.won} (${end.ms}ms)`);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ meta: { policy: POLICY_ID, side: SIDE, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SHARELEAN: SIDE === 'armed' ? '1' : 'unset', SURPLUSFEED: 'unset' }, kind: 'sharelean-b-pilot' }, rows }, null, 1));
  }
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
