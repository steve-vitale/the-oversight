#!/usr/bin/env node
// probe-glut-b.js — sim-glutprobe-b diagnostic sweep (DIAGNOSTIC, no lever).
//
// Assignment (#570 production rebound): on the standard substrate, build
// dose-response curves per-channel inflow vs pantry fresh-days and vs doomed
// stock; find permanent-glut configs; attribute marginal glut inflow by
// channel; NAME the channels that do NOT throttle when the pantry is full.
//
// Instrument-only (scripts/probe-glut-instruments.js): zero src/js changes,
// zero new policy layers.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 \
//   SEEDS="8801,8802,8803,8804,8805,8806,8807,8808" POLICY=leadfeast|belongfeast \
//   DAYS=180 OUT=<path> node scripts/probe-glut-b.js
// SURPLUSFEED must be UNSET (default-OFF base). SEATDRIVE=0 explicit.
// Seed freshness is asserted inline against the banned/used list.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset for the diagnostic substrate');
  process.exit(2);
}

// every seed judged on this axis or nearby (banned for fresh-seed claims)
const BANNED = new Set();
for (const [a, b] of [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508], [4601, 4608],
  [4801, 4808], [4901, 4908], [5101, 5108], [5111, 5118], [5201, 5208], [5411, 5426],
  [5601, 5608], [6201, 6208], [6301, 6308], [7001, 7008], [7501, 7508], [7601, 7608],
  [99101, 99108], [105101, 105104]]) for (let s = a; s <= b; s++) BANNED.add(s);
for (const s of [4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 4819, 4820, 4821, 4822,
  6417, 6418, 6419, 6420, 6421, 6422, 6423, 6424,
  6810, 6811, 6813, 6814, 6815, 6816, 6817, 6912,
  8811, 8812, 8813, 8814, // this diagnostic's own proof seeds
  9292, 9293, 9294, 9295, 9921, 9922, 9923, 9924, 9925, 9926, 9927, 9928,
  17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018]) BANNED.add(s);

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID];
if (!POLICY) { console.error('FATAL: unknown POLICY ' + POLICY_ID); process.exit(2); }
const SEEDS = (process.env.SEEDS || '8801,8802,8803,8804,8805,8806,8807,8808')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error('FATAL: seed ' + s + ' is on the banned/used list — freshness violated'); process.exit(2); }
}
console.log('seed freshness OK: ' + SEEDS.join(',') + ' (all banned-list clean)');
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-20/perseed-glutprobe-b/' + POLICY_ID + '.json');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'glutprobe-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachProbe(Game);

  const t0 = Date.now();
  const result = await runDays(Game, POLICY, { days, manifest: null });
  const ms = Date.now() - t0;

  // instrument-honesty: unattributed share
  const unatt = W.inflow.unattributed || 0;
  const unattShare = W.chokeTotal > 0 ? unatt / W.chokeTotal : 0;

  let nationalLive = false, tableWaiting = false, rank = '?', maxWave = 1, arc = 1, rosterEnd = 0;
  try {
    nationalLive = !!((Game.state || {}).nationalLive);
    const ps = Game.progState ? Game.progState() : {};
    tableWaiting = !!(ps.tableWaiting);
    rank = Game.scaleRank ? Game.scaleRank() : '?';
    maxWave = Game.unlockedWave ? Game.unlockedWave() : 1;
    arc = (ps || {}).arc || 1;
    rosterEnd = (((Game.state || {}).village || {}).roster || []).length;
  } catch (e) {}

  const end = {
    seed,
    won: !!Game.won,
    national: nationalLive,
    table: tableWaiting,
    rank, maxWave, arc, rosterEnd,
    days: result.days, endReason: result.endReason,
    chokeTotal: Math.round(W.chokeTotal),
    unattributed: Math.round(unatt), unattShare: +unattShare.toFixed(4),
    inflow: Object.fromEntries(Object.entries(W.inflow).map(([k, v]) => [k, Math.round(v)])),
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    rotByCh: Object.fromEntries(Object.entries(W.rotByCh).map(([k, v]) => [k, Math.round(v)])),
    rotByChFast: Object.fromEntries(Object.entries(W.rotByChFast).map(([k, v]) => [k, Math.round(v)])),
    dutyPreserved: Math.round(W.dutyPreserved), laundered: W.laundered,
    throttleCalls: W.throttleCalls, throttleEngaged: W.throttleEngaged,
    starveDays: W.starveDays,
    deaths: W.deaths,
    dawnSamples: W.dawnSamples,
    dayInflow: W.dayInflow,
    dayDuty: W.dayDuty,
    dayThrottle: W.dayThrottle,
    ms,
  };
  return end;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const end = await oneRun(seed, DAYS);
    rows.push(end);
    const w = end;
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} won=${end.won} nat=${end.national} tab=${end.table} wave=${end.maxWave} choke=${Math.round(end.chokeTotal / 1000)}k unatt=${(end.unattShare * 100).toFixed(2)}% rot=${Math.round(end.rotFresh / 1000)}k thr=${end.throttleEngaged}/${end.throttleCalls} starveD=${end.starveDays} (${end.ms}ms)`);
  }
  const dir = require('path').dirname(OUT);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    meta: {
      run: 'sim-glutprobe-b', policy: POLICY_ID, days: DAYS, seeds: SEEDS,
      env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: 'unset' },
      note: 'diagnostic only — no lever, no armed side',
    }, rows,
  }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
