#!/usr/bin/env node
// probe-prodrebuff-b.js — sim-prodrebuff-b sweep (DIAGNOSTIC first, then
// conditional lever pilot).
//
// Assignment (#570 production rebound): measure per-channel inflow
// dose-response vs pantry fullness on THIS commit — fine fresh-day buckets
// + throttle coefficients — and attribute marginal-glut inflow; audit each
// unthrottled channel for a clean policy-side governor hook. DIAG first;
// lever (RETURNINTAKE) only on the DIAG's named hook.
//
// Instrument-only in DIAG mode: zero src/js changes, zero new policy
// layers. The analyzer computes buckets + Spearman coefficients offline
// from dawnSamples x dayInflow — no instrument changes needed.
//
// Usage (DIAG): FEASTSCALE_R13=1 SEATDRIVE=0 \
//   SEEDS="8801,8802,8803,8804,8805,8806,8807,8808" POLICY=leadfeast|belongfeast \
//   DAYS=180 OUT=<path> node scripts/probe-prodrebuff-b.js
// Usage (ARMED pilot): same + RETURNINTAKE=1 (the conditional lever pilot;
//   OUT into a separate directory).
// SURPLUSFEED must be UNSET in both modes (the lever under test is
// RETURNINTAKE, not the share_surplus governor). SEATDRIVE=0 explicit.
//
// EXPLICIT DOCUMENTED EXCEPTION TO SEED FRESHNESS: this arm REUSES seeds
// 8801-8808 as a PAIRED control on the current commit — it is NOT a
// fresh-seed claim (master movement since 2026-10-20 shifts trajectories;
// diagnosed by sim-surplusfeed-curvecheck-b). The inline assertion enforces
// that every seed belongs to the landed 8801-8808 control set; the arm's
// own proof seeds are 8819-8822 (banned here and in the driver).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset (the lever under test is RETURNINTAKE)');
  process.exit(2);
}
if (process.env.RETURNINTAKE && process.env.RETURNINTAKE !== '1') {
  console.error('FATAL: RETURNINTAKE must be unset (DIAG) or exactly "1" (lever pilot)');
  process.exit(2);
}
const ARMED = process.env.RETURNINTAKE === '1';
console.log(ARMED
  ? 'MODE: ARMED PILOT — RETURNINTAKE=1, return-intake governor engages in npcNodeTravel'
  : 'MODE: DIAG — RETURNINTAKE unset, default-OFF engine (zero new behavior)');

// the landed glutprobe-b control seed set — paired reuse only
const CONTROL_SET = new Set([8801, 8802, 8803, 8804, 8805, 8806, 8807, 8808]);

// every seed judged on this axis or nearby (banned for fresh-seed claims)
const BANNED = new Set();
for (const [a, b] of [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508], [4601, 4608],
  [4801, 4808], [5101, 5108], [5111, 5118], [5201, 5208], [5411, 5426],
  [5601, 5608], [6201, 6208], [6301, 6308], [7001, 7008], [7501, 7508], [7601, 7608],
  [99101, 99108], [105101, 105104]]) for (let s = a; s <= b; s++) BANNED.add(s);
for (const s of [4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 4819, 4820, 4821, 4822,
  6417, 6418, 6419, 6420, 6421, 6422, 6423, 6424,
  6810, 6811, 6813, 6814, 6815, 6816, 6817, 6912,
  8811, 8812, 8813, 8814, // glutprobe-b's proof seeds
  8815, 8816, 8817, 8818, // surplusfeed-curvecheck-b's proof seeds
  8819, 8820, 8821, 8822, // THIS arm's DIAG proof seeds
  8823, 8824, 8825, 8826, // THIS arm's lever proof seeds
  9292, 9293, 9294, 9295, 9921, 9922, 9923, 9924, 9925, 9926, 9927, 9928,
  17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018]) BANNED.add(s);

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID];
if (!POLICY) { console.error('FATAL: unknown POLICY ' + POLICY_ID); process.exit(2); }
const SEEDS = (process.env.SEEDS || '8801,8802,8803,8804,8805,8806,8807,8808')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (!CONTROL_SET.has(s)) {
    console.error('FATAL: seed ' + s + ' is outside the landed 8801-8808 paired control set');
    process.exit(2);
  }
  if (BANNED.has(s)) { console.error('FATAL: seed ' + s + ' is on the banned/used list'); process.exit(2); }
}
console.log('seed pairing OK: ' + SEEDS.join(',') + ' (all in landed 8801-8808 control set, banned-list clean)');
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-21/perseed-prodrebuff-b/' + POLICY_ID + '.json');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'prodrebuff-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachProbe(Game);

  // governor telemetry (armed mode): the RETURNINTAKE trim, same shape as
  // the landed sfeed sensor in test-glutcurvecheck-b.js
  W.rint = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
  const og = Game.returnIntakeGovernor;
  if (typeof og === 'function') Game.returnIntakeGovernor = function (vid, kcal) {
    const r = og.apply(this, arguments);
    try {
      W.rint.govCalls++;
      if (r < kcal) {
        W.rint.trimCalls++;
        W.rint.trimKcal += (kcal - r);
        const d = dayOf(Game);
        const cell = W.rint.days[d] || (W.rint.days[d] = { trimCalls: 0, trimKcal: 0 });
        cell.trimCalls++; cell.trimKcal += (kcal - r);
      }
    } catch (e) {}
    return r;
  };

  const t0 = Date.now();
  const result = await runDays(Game, POLICY, { days, manifest: null });
  const ms = Date.now() - t0;

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

  return {
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
    rintGovCalls: W.rint.govCalls, rintTrimCalls: W.rint.trimCalls,
    rintTrimKcal: Math.round(W.rint.trimKcal), rintTrimDays: Object.keys(W.rint.days).length,
    starveDays: W.starveDays,
    deaths: W.deaths,
    dawnSamples: W.dawnSamples,
    dayInflow: W.dayInflow,
    dayDuty: W.dayDuty,
    dayThrottle: W.dayThrottle,
    ms,
  };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const end = await oneRun(seed, DAYS);
    rows.push(end);
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} won=${end.won} nat=${end.national} tab=${end.table} wave=${end.maxWave} choke=${Math.round(end.chokeTotal / 1000)}k unatt=${(end.unattShare * 100).toFixed(2)}% rot=${Math.round(end.rotFresh / 1000)}k rint=${end.rintTrimCalls}x/${Math.round(end.rintTrimKcal / 1000)}k starveD=${end.starveDays} (${end.ms}ms)`);
  }
  const dir = require('path').dirname(OUT);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    meta: {
      run: ARMED ? 'sim-prodrebuff-b-armed' : 'sim-prodrebuff-b', policy: POLICY_ID, days: DAYS, seeds: SEEDS,
      env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: 'unset', RETURNINTAKE: ARMED ? '1' : 'unset' },
      note: ARMED ? 'lever pilot: RETURNINTAKE=1 on away_forage intake' : 'diagnostic only — no lever',
    }, rows,
  }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
