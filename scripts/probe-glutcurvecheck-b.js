#!/usr/bin/env node
// probe-glutcurvecheck-b.js — sim-surplusfeed-curvecheck-b sweep (DIAGNOSTIC, no lever).
//
// Assignment (#702 named next): measure the landed default-OFF SURPLUSFEED
// governor's effect on the share_surplus dose-response curve, using the
// landed glutprobe instrument. Instrument-only — ZERO src/js changes; the
// governor is ENGINE code (game.js ~15052-15095 `_surplusFeedOn` /
// `surplusFeedGovernor`, called at ~28678 in villagerMealDay's share path,
// Steve's 2026-10-18 make-the-call). Setting SURPLUSFEED=1 in the environment
// is all it takes to arm it (browser default stays off).
//
// This is probe-glut-b.js with the SURPLUSFEED FATAL flipped. Everything
// else is byte-identical logic: same instruments (attachProbe), same horizon
// (180d death-aware), same policies ({leadfeast, belongfeast}).
//
// Usage (ARMED): FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 \
//   SEEDS="8801,8802,8803,8804,8805,8806,8807,8808" POLICY=leadfeast|belongfeast \
//   DAYS=180 OUT=<path> node scripts/probe-glutcurvecheck-b.js
// Usage (RED-EQUIVALENT drift check): same but SURPLUSFEED UNSET — must
// reproduce the landed control corpus (evidence/2026-10-20/perseed-glutprobe-b/)
// byte-identically, minus the volatile `ms` timing field.
//
// EXPLICIT DOCUMENTED EXCEPTION TO SEED FRESHNESS: this arm REUSES seeds
// 8801-8808 as PAIRED before/after against the landed control corpus — it is
// NOT a fresh-seed claim. The inline assertion below enforces that every
// seed belongs to the landed 8801-8808 control set; any OTHER seed passes the
// normal banned/used list.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
const ARMED = process.env.SURPLUSFEED === '1';
if (process.env.SURPLUSFEED && process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SURPLUSFEED must be unset (RED-equivalent) or exactly "1" (armed)');
  process.exit(2);
}
console.log(ARMED
  ? 'MODE: ARMED — SURPLUSFEED=1, the landed governor engages inside villagerMealDay'
  : 'MODE: RED-EQUIVALENT — SURPLUSFEED unset, governor returns give exactly (zero drift expected)');

// the landed glutprobe-b control seed set — paired reuse only
const CONTROL_SET = new Set([8801, 8802, 8803, 8804, 8805, 8806, 8807, 8808]);

// every seed judged on this axis or nearby (banned for fresh-seed claims)
const BANNED = new Set();
for (const [a, b] of [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508], [4601, 4608],
  [4801, 4808], [4901, 4908], [5101, 5108], [5111, 5118], [5201, 5208], [5411, 5426],
  [5601, 5608], [6201, 6208], [6301, 6308], [7001, 7008], [7501, 7508], [7601, 7608],
  [99101, 99108], [105101, 105104]]) for (let s = a; s <= b; s++) BANNED.add(s);
for (const s of [4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 4819, 4820, 4821, 4822,
  6417, 6418, 6419, 6420, 6421, 6422, 6423, 6424,
  6810, 6811, 6813, 6814, 6815, 6816, 6817, 6912,
  8811, 8812, 8813, 8814, // glutprobe-b's proof seeds
  8815, 8816, 8817, 8818, // THIS arm's proof seeds
  9292, 9293, 9294, 9295, 9921, 9922, 9923, 9924, 9925, 9926, 9927, 9928,
  17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018]) BANNED.add(s);

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID];
if (!POLICY) { console.error('FATAL: unknown POLICY ' + POLICY_ID); process.exit(2); }
const SEEDS = (process.env.SEEDS || '8801,8802,8803,8804,8805,8806,8807,8808')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
if (!SEEDS.length) { console.error('FATAL: no seeds'); process.exit(2); }
for (const s of SEEDS) {
  if (CONTROL_SET.has(s)) continue; // PAIRED REUSE EXCEPTION — documented above, no fresh-seed claim
  if (BANNED.has(s)) { console.error('FATAL: seed ' + s + ' is on the banned/used list and not in the paired control set'); process.exit(2); }
}
const paired = SEEDS.every(s => CONTROL_SET.has(s));
console.log((paired ? 'seed gate OK: PAIRED REUSE of the landed control set' : 'seed gate OK: fresh seeds')
  + ': ' + SEEDS.join(','));
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-20/perseed-glutcurvecheck-b/' + POLICY_ID + '.json');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'glutcurvecheck-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachProbe(Game);

  // --- surplusFeed governor sensor: pure telemetry. Calls through, counts
  // calls and trims, draws no RNG, writes no game state. With SURPLUSFEED
  // unset the engine returns `give` exactly (zero writes, zero RNG), so this
  // wrap is behavior-transparent — the RED-equivalent drift check proves it.
  W.sfeed = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
  {
    const o = Game.surplusFeedGovernor;
    if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
      const r = o.apply(this, arguments);
      try {
        W.sfeed.govCalls++;
        if (r < give) {
          W.sfeed.trimCalls++;
          W.sfeed.trimKcal += (give - r);
          const d = dayOf(Game);
          const cell = W.sfeed.days[d] || (W.sfeed.days[d] = { trimCalls: 0, trimKcal: 0 });
          cell.trimCalls++; cell.trimKcal += (give - r);
        }
      } catch (e) {}
      return r;
    };
  }

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
  // sfeed telemetry ONLY when armed — the RED-equivalent (unset) rows must
  // compare field-for-field against the landed control corpus
  if (ARMED) {
    end.sfeed = {
      govCalls: W.sfeed.govCalls, trimCalls: W.sfeed.trimCalls,
      trimKcal: Math.round(W.sfeed.trimKcal),
      trimDays: Object.keys(W.sfeed.days).length,
    };
  }
  return end;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const end = await oneRun(seed, DAYS);
    rows.push(end);
    const sf = end.sfeed ? ` sfeed_trim=${Math.round(end.sfeed.trimKcal / 1000)}k/${end.sfeed.trimDays}d` : '';
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} won=${end.won} nat=${end.national} tab=${end.table} wave=${end.maxWave} choke=${Math.round(end.chokeTotal / 1000)}k unatt=${(end.unattShare * 100).toFixed(2)}% rot=${Math.round(end.rotFresh / 1000)}k thr=${end.throttleEngaged}/${end.throttleCalls} starveD=${end.starveDays}${sf} (${end.ms}ms)`);
  }
  const dir = require('path').dirname(OUT);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    meta: {
      run: 'sim-surplusfeed-curvecheck-b', policy: POLICY_ID, days: DAYS, seeds: SEEDS,
      env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: ARMED ? '1' : 'unset' },
      note: ARMED
        ? 'diagnostic only — SURPLUSFEED governor armed, paired against the landed glutprobe-b control corpus (identical seeds)'
        : 'RED-EQUIVALENT drift check — SURPLUSFEED unset; rows (minus ms) must reproduce the landed control corpus byte-identically',
      pairedReuse: 'seeds 8801-8808 are the landed glutprobe-b control set, reused as paired before/after — not a fresh-seed claim',
    }, rows,
  }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
