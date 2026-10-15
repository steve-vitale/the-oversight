#!/usr/bin/env node
// sweep-rechealth-20261015.js — THRIVING-VILLAGE EXEMPTION pilot (scale-onramp,
// run fleshout-a-20261015T021049Z, sim-rechealth). sim-findings #249's named
// next from the recthrottle kill (r37): the 2-day Haven hold after a combat
// death OF A PERSON engages ONLY when the pantry is deep (fresh-days >= 3)
// AND no villager has hungryStreak > 0; otherwise the scholar keeps ranging.
//
// Before/after on identical seeds, SAME ROAD as r37 (courtship):
//   SET-L (lead set):   leadcourt + FOURTHLINK=1, seeds 11/22/33/44/55/66/77/88
//   SET-B (belong set):  belongseek (default), seeds 11/22/33/44/55/66/77/88
// 180d death-aware. The layer is policy-side only (RECHEALTH=1 gate, default
// OFF); no game-code changes.
//
// PRE-REGISTRATION (evidence/2026-10-15/sim-rechealth.md — written BEFORE
// the first measurement run; the control side re-runs the courtship road
// through this driver's instrument on current tip — never trust old numbers,
// CONTROL BASELINE DRIFT #247):
//   STRATUM RULE (control-side, r37 precedent): per-set control median
//     survival <100d = HARD, >=100d = FRIENDLY; same-side fallback:
//     lower-median set = HARD.
//   PRIMARY (hard stratum): armed median >= control median + 15d.
//   NO-REGRESSION (friendly stratum): armed median >= control median - 3d.
//   GO iff BOTH. A miss on either is NO-GO -> KILL (§14 binds).
//   GUARDRAILS (pooled 16): national >= pooled-control-2; no new death mode
//     (family level, n>=3 floor across armed runs — the r29 floor); exiled
//     <= pooled-control+1. Table/wins/other waves report-only. (Wave-5 is
//     report-only this run — r37 metric review: at n=8 the pooled guardrail
//     is too jumpy for a rare event.)
// Identical seeds, deterministic.
//
// Usage (control, lead set):
//   ROAD=lead SEEDS=11,22,33,44,55,66,77,88 OUT=evidence/2026-10-15/sim-rechealth-control-L.json \
//     node scripts/sweep-rechealth-20261015.js
// Usage (armed, belong set):
//   ROAD=belong RECHEALTH=1 OUT=evidence/2026-10-15/sim-rechealth-armed-B.json \
//     node scripts/sweep-rechealth-20261015.js
// DETGATE=1: run the rechealth WRAPPER with the env gate OFF against the
// raw base — trajectories must be byte-identical (gate-off delegation).
// Compare the detgate JSON rows to the control JSON rows (byte-identical).
//
// Report format: rows[] + suite (per-seed detail) AND flat top-level
// aggregates (national, table, wins, exiled, medianSurvival) for
// scripts/telemetry-check.js --metrics national,table,wins,exiled.
'use strict';
process.env.FOURTHLINK = '1';
const ROAD = process.env.ROAD || 'lead'; // 'lead' | 'belong'
const ARMED = process.env.RECHEALTH === '1';
const DETGATE = process.env.DETGATE === '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');
const { belongseek } = require('./policies/belongseek');
// Graceful degradation (kill-protocol, r29): armed/detgate refuse LOUD if the
// layer is absent; control mode still runs.
let W = null;
try { W = require('./policies/rechealth'); }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED || DETGATE) {
    console.error('FATAL: RECHEALTH requested but scripts/policies/rechealth.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: rechealth layer absent — control mode only.');
}
// Unwrap guard (the 2026-10-14 unwrap bug): named exports must be functions.
if (W) {
  for (const k of ['rechealth', 'rechealthBelong']) {
    if (!W[k] || typeof W[k].daily !== 'function') {
      console.error('FATAL: named export ' + k + ' missing or has no daily(). Unwrap bug — refusing to measure.');
      process.exit(2);
    }
  }
}
const { stdSnapshot } = require('./sweep-compare');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const ROADS = {
  lead: { raw: fourthlink, armed: () => W.rechealth, label: 'leadcourt+FOURTHLINK=1' },
  belong: { raw: belongseek, armed: () => W.rechealthBelong, label: 'belongseek' },
};
if (!ROADS[ROAD]) { console.error('FATAL: ROAD must be lead|belong'); process.exit(2); }
const roadCfg = ROADS[ROAD];

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'rechealth-' + ROAD, fullTelemetry: true });
  await setupGame(Game);

  const track = { unlockDay: {}, maxRank: 0, exiledEver: false, tableEver: false, winEver: false };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;

  const base = DETGATE ? roadCfg.armed() : (ARMED ? roadCfg.armed() : roadCfg.raw);
  const origDaily = base.daily;
  // recovery observability: read the armed policy's ctx counters each day
  const recStats = { windows: 0, fortifyDays: 0, declined: 0, combatDeaths: 0, exempted: 0, lastFortifyUntil: 0 };
  const policy = Object.assign({}, base, {
    id: (base.id || 'base') + '+rechealth-instr',
    desc: 'pilot instrument wrapper',
  });
  policy.daily = (G, ctx) => {
    try {
      const wv = (G.unlockedWave && G.unlockedWave()) || 1;
      for (let w = 1; w <= wv; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = gday(G);
      const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank, RANK_ORDER[s2.rank] || 0);
      if (G.state && G.state.exiled) track.exiledEver = true;
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    const r = origDaily ? origDaily(G, ctx) : undefined;
    try {
      recStats.windows = ctx._recWindows || 0;
      recStats.fortifyDays = ctx._recFortifyDays || 0;
      recStats.declined = ctx._recDeclined || 0;
      recStats.combatDeaths = (ctx._recDeaths || []).filter(d => d.category === 'combat').length;
      recStats.exempted = ctx._recExempted || 0;
      if (ARMED && ctx._recFortifyUntil) recStats.lastFortifyUntil = ctx._recFortifyUntil;
    } catch (e) { instrErrors.push('recStats: ' + e.message); }
    return r;
  };

  const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const end = stdSnapshot(Game);

  const deathCauses = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    deathCauses[k] = (deathCauses[k] || 0) + 1;
  }
  // cause FAMILIES for the no-new-death-mode guardrail (r29 metric review):
  // monster names collapse to combat; raw causes otherwise.
  const deathFamilies = {};
  for (const d of (result.samples.deaths || [])) {
    let fam;
    const cause = String(d.cause || 'unknown');
    const lower = cause.toLowerCase();
    if (lower === 'combat' || lower === 'monster' || lower === 'villager combat') fam = 'combat';
    else if (['starvation', 'dehydration', 'thirst'].includes(lower)) fam = 'thirst/hunger';
    else if (lower === 'sickness') fam = 'disease';
    else if (lower === 'contest' || lower === 'the contest') fam = 'contest';
    else if (lower === 'expedition' || lower === 'the expedition') fam = 'expedition';
    else if (lower === "a wound that wouldn't close") fam = 'wound';
    else fam = 'other:' + cause.slice(0, 40);
    const k = (d.player ? 'player' : 'villager') + ':' + fam;
    deathFamilies[k] = (deathFamilies[k] || 0) + 1;
  }

  const row = {
    seed, road: ROAD, armed: ARMED, days: result.days, endReason: result.endReason,
    endStanding: end.standing,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    national: track.maxRank >= 2,
    wave5: track.unlockDay[5] != null, wave5Day: track.unlockDay[5] || null,
    wave4: track.unlockDay[4] != null,
    exiled: !!track.exiledEver,
    table: !!track.tableEver, win: !!track.winEver,
    deathCauses,
    deathFamilies,
    playerDeaths: (result.samples.deaths || []).filter(d => d.player).length,
    villagerDeaths: (result.samples.deaths || []).filter(d => !d.player).length,
    instrErrors: instrErrors.length,
    recStats: ARMED ? recStats : null,
  };
  if (opts.verbose !== false) {
    console.log(`  [${ROAD} ${ARMED ? 'armed' : 'ctrl'} seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `w5=${row.wave5 ? 'd' + row.wave5Day : 'no'} rank=${row.maxRank} ` +
      `recW=${ARMED ? recStats.windows : '-'} exempt=${ARMED ? recStats.exempted : '-'} pd=${row.playerDeaths} vd=${row.villagerDeaths} instrErr=${instrErrors.length}`);
  }
  return { row };
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT;
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const rows = [];
  for (const seed of seeds) rows.push((await runOne(seed, { days })).row);
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const median = daysArr.length ? (daysArr[Math.floor((daysArr.length - 1) / 2)] + daysArr[Math.floor(daysArr.length / 2)]) / 2 : null;
  const suite = {
    seeds: rows.length,
    medianSurvival: median,
    national: rows.filter(r => r.national).length,
    wave5: rows.filter(r => r.wave5).length,
    wave4: rows.filter(r => r.wave4).length,
    exiled: rows.filter(r => r.exiled).length,
    table: rows.filter(r => r.table).length,
    wins: rows.filter(r => r.win).length,
    recTotals: rows.reduce((t, r) => {
      if (r.recStats) {
        t.windows += r.recStats.windows; t.fortifyDays += r.recStats.fortifyDays;
        t.declined += r.recStats.declined; t.combatDeaths += r.recStats.combatDeaths;
        t.exempted += r.recStats.exempted;
      }
      return t;
    }, { windows: 0, fortifyDays: 0, declined: 0, combatDeaths: 0, exempted: 0 }),
    deathFamilies: rows.reduce((acc, r) => {
      for (const [k, v] of Object.entries(r.deathFamilies)) acc[k] = (acc[k] || 0) + v;
      return acc;
    }, {}),
  };
  const report = {
    label: DETGATE ? 'rechealth-detgate' : (ARMED ? 'rechealth-armed' : 'rechealth-control'),
    policy: DETGATE ? 'rechealth-wrapper-gate-OFF' : (ARMED ? roadCfg.label + '+RECHEALTH=1' : roadCfg.label),
    road: ROAD, seeds, days, commit,
    generated: new Date().toISOString(),
    rows,
    suite,
    // FLAT aggregates for scripts/telemetry-check.js --metrics national,table,wins,exiled
    // (the r36 recconf flat-key fix — the r37 sweep's nested-only schema caused
    // a schema-mismatch LOUD line).
    national: suite.national,
    wave5: suite.wave5,
    wave4: suite.wave4,
    exiled: suite.exiled,
    table: suite.table,
    wins: suite.wins,
    medianSurvival: suite.medianSurvival,
  };
  if (out) {
    fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
    console.log(`wrote ${out}`);
  }
  const s = report.suite;
  console.log(`SUITE [${ROAD} ${report.label}]: median ${s.medianSurvival}d, national ${s.national}/${s.seeds}, ` +
    `w5 ${s.wave5}/${s.seeds}, w4 ${s.wave4}/${s.seeds}, exiled ${s.exiled}, table ${s.table}, wins ${s.wins}, ` +
    `recWindows=${s.recTotals.windows} exempted=${s.recTotals.exempted} fortifyDays=${s.recTotals.fortifyDays} declined=${s.recTotals.declined}`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
