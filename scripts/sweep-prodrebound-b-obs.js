#!/usr/bin/env node
// sweep-prodrebound-b-obs.js — OBSERVATIONAL production-response diagnostic
// (arm sim-prodrebound-b, run fleshout-loop-b-20261020TxxxxxxZ).
//
// Diagnostic of sim-findings #570 (feastdraw-b perverse dose-response,
// Pearson(fd nights, pair rot ratio) = +0.73). INSTRUMENT-ONLY: no lever,
// no replay, zero src/js changes. Observes the village's NATURAL
// inflow-side production response on the base substrate:
//
//   per run per day (dawn): pantry kcal, pantryFreshKcal, pantryFreshDays,
//   roster, burnAvg; then that day's inflow by channel, duty smoke-drive
//   throughput, PRODTHROTTLE engagement, assignments, rot attributed to the
//   arrival channel (with arrival->rot lag).
//
// Dose-response: does inflow rise when the dawn pantry falls?
// Marginal-rot: does the marginal production rot within 3d of arrival?
// Attribution: which channel (duty smoke drive / scholar haul / villager
// forage / task-lead duties / share_surplus) drives any rebound?
//
// Substrate: FEASTSCALE_R13=1 SEATDRIVE=0 (asserted); SURPLUSFEED must be
// unset (default-OFF base behavior, documented, not a lever).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 \
//   SEEDS="6810,6811,6813,6814,6815,6816,6817,6912" POLICY=leadfeast \
//   DAYS=180 OUT=evidence/2026-10-20/perseed-prodrebound-b-obs/leadfeast.json \
//   node scripts/sweep-prodrebound-b-obs.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachObs, dayOf, pantryKcal } = require('./prodrebound-obs-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SURPLUSFEED === '1') {
  console.error('FATAL: SURPLUSFEED must be unset (base substrate; the governor is not this diagnostic)');
  process.exit(2);
}

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-prodrebound-b-obs/sweep-' + POLICY_ID + '.json');

// ---- coordinator's banned-seed list (sweep stops on any hit) ----
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708']) {
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
const SEEDS = (process.env.SEEDS || '6810,6811,6813,6814,6815,6816,6817,6912')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
console.log(`seeds: ${SEEDS.join(',')} (banned-check clean)`);

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'prodrebound-b-obs-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachObs(Game);

  // --- starveDays (per day), via the policy wrapper ---
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
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  let exiled = 0, rosterEnd = 0, throttleRedirects = 0, throttleExempt = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    throttleRedirects = v.throttleRedirects || 0;
    throttleExempt = v.throttleExemptDepth || 0;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const round1 = (o) => { const r = {}; for (const k of Object.keys(o)) r[k] = Math.round(o[k]); return r; };
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    tableWaiting: !!((Game.progState ? Game.progState() : {}).tableWaiting),
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled, pkEnd: Math.round(pantryKcal(Game)),
    rotFresh: Math.round(W.rot_fresh || 0), rotPreserved: Math.round(W.rot_preserved || 0),
    rotByCh: round1(W.rotByCh), rotByChFast: round1(W.rotByChFast), rotByChPres: round1(W.rotByChPres),
    dutyPreserved: Math.round(W.dutyPreserved), laundered: W.laundered,
    starveDays: W.starveDays,
    inflow: round1(W.inflow),
    throttleCalls: W.throttleCalls, throttleEngaged: W.throttleEngaged,
    throttleRedirects, throttleExempt,
    assignCounts: W.assignCounts,
    dawn: W.dawnSamples,
    dayInflow: W.dayInflow,
    dayDuty: W.dayDuty, dayLaunder: W.dayLaunder, dayThrottle: W.dayThrottle,
    starveByDay: W.starveByDay,
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  // resume: skip seeds already completed in a prior partial write
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
    const inTot = Object.entries(end.inflow || {}).reduce((t, [k, v]) => t + (k === 'leftovers' || k === 'system' ? 0 : v), 0);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k inflow=${Math.round(inTot / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k thr=${end.throttleEngaged}/${end.throttleCalls} starveD=${end.starveDays} won=${end.won} (${end.ms}ms)`);
    // incremental write after each seed: a crash loses at most one seed
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ meta: { policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: 'unset' }, kind: 'prodrebound-b-obs' }, rows }, null, 1));
  }
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
