#!/usr/bin/env node
// sweep-prodrebound-b2.js — sim-prodrebound-b2 DECISION-LEVEL diagnostic sweep.
//
// Answers sim-findings #570: "why does the village over-produce into gluts it
// cannot eat?" — WHO decided to produce (villager / duty pick / funnel
// decision), WHAT pantry sensor they read (or failed to read), WHEN
// (pantry fresh-days at decision time).
//
// Design (observational diagnostic, instrument-only, zero src/js — mirrors
// the landed 2026-10-20 sim-prodrebound-b DIAG evidence/2026-10-20/sim-prodrebound-b.md):
//   8 FRESH seeds (67101-67108, banned-list clean, unused by any prior run)
//   x {leadfeast, belongfeast} = 16 runs, 180d death-aware, FEASTSCALE_R13=1 /
//   SEATDRIVE=0, post-SURPLUSFEED master (the governor is deleted from game.js;
//   SURPLUSFEED env no longer exists). attachDecision (inner) + attachProbe
//   (outer) + linkBase, exactly the proof's attach order.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 POLICY=leadfeast|belongfeast \
//     SEEDS=67101,...,67108 DAYS=180 OUTDIR=<dir> node scripts/sweep-prodrebound-b2.js
//
// Writes per-seed JSONs incrementally (resume-capable): <OUTDIR>/<policy>/seed-<s>.json
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe } = require('./probe-glut-instruments');
const { attachDecision } = require('./prodrebound-b2-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED is deleted from the game; unset it (stale env)');
  process.exit(2);
}

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUTDIR = process.env.OUTDIR || path.join('/tmp', 'sim-prodrebound-b2', POLICY_ID);

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
const SEEDS = (process.env.SEEDS || '67101,67102,67103,67104,67105,67106,67107,67108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
console.log(`seeds: ${SEEDS.join(',')} (banned-check clean)`);

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'prodrebound-b2-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W2 = attachDecision(Game);   // inner first
  const W1 = attachProbe(Game);      // outer (landed, unchanged)
  W2.linkBase(W1);
  const t0 = Date.now();
  const result = await runDays(Game, POLICY, { days, manifest: null });
  const ms = Date.now() - t0;
  let rosterEnd = 0, exiled = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const evSum = W2.decEvents.reduce((t, e) => t + e.kcal, 0);
  const unexpl = W2.decEvents.filter(e => e.dp === 'unexplained').reduce((t, e) => t + e.kcal, 0);
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    table: !!((Game.progState ? Game.progState() : {}).tableWaiting),
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    national: !!((Game.state || {}).nationalLive),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled, pkEnd: Math.round(pantryKcal(Game)),
    chokeTotal: Math.round(W1.chokeTotal),
    decEventKcal: evSum,
    unexplainedKcal: unexpl,
    explainedShare: W1.chokeTotal > 0 ? 1 - unexpl / W1.chokeTotal : 0,
    instrumentErrors: W2.instrumentErrors,
    errKeys: Object.keys(W2).filter(k => k.startsWith('err_')),
    nDecEvents: W2.decEvents.length,
    nGov: W2.govEvents.length, nCapTrim: W2.capTrimEvents.length,
    nDonations: W2.donationEvents.length, nSmoke: W2.preservationEvents.length,
    dps: [...new Set(W2.decEvents.map(e => e.dp))].sort(),
    ms,
  };
  return {
    seed, policy: POLICY_ID,
    meta: { days: DAYS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: 'removed-from-game' }, base: 'post-SURPLUSFEED master' },
    end,
    dawnSamples: W1.dawnSamples,
    dayInflow: W1.dayInflow,
    decEvents: W2.decEvents,
    govEvents: W2.govEvents,
    capTrimEvents: W2.capTrimEvents,
    donationEvents: W2.donationEvents,
    preservationEvents: W2.preservationEvents,
    sensorReads: W2.sensorReads,
  };
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const doneSet = new Set();
  for (const f of fs.readdirSync(OUTDIR)) {
    const m = f.match(/^seed-(\d+)\.json$/);
    if (m) doneSet.add(parseInt(m[1], 10));
  }
  if (doneSet.size) console.log(`resume: ${doneSet.size} seeds already done (${[...doneSet].sort().join(',')})`);
  for (const seed of SEEDS) {
    if (doneSet.has(seed)) { console.log(`skip seed=${seed} (already done)`); continue; }
    const row = await oneRun(seed, DAYS);
    const fp = path.join(OUTDIR, `seed-${seed}.json`);
    fs.writeFileSync(fp, JSON.stringify(row));
    const e = row.end;
    console.log(`done seed=${seed} days=${e.days} end=${e.endReason} won=${e.won} nat=${e.national} arc=${e.arc} wave=${e.maxWave} ` +
      `choke=${Math.round(e.chokeTotal / 1000)}k expl=${(e.explainedShare * 100).toFixed(2)}% err=${e.instrumentErrors} ev=${e.nDecEvents} (${e.ms}ms)`);
  }
  console.log('wrote ' + OUTDIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
