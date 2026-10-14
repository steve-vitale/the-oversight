#!/usr/bin/env node
// sweep-recconf-20261014.js — RECOVERY THROTTLE STRATIFIED RE-CONFIRM
// (scale-onramp, flesh-out loop A).
//
// Rebuilt from evidence/2026-10-14/sim-recoverylever.md (r35 ARM 2, KILLED
// at confirm by 0.5d per §14). The r35 metric review prescribed the honest
// next step: the effect is regime-dependent (+53d pilot, +27.5d r34,
// +4.5d confirm), so the next run uses stratified/proportional bars with
// same-regime confirm seeds — this is that run. People-only trigger is in
// the spec from the start (r35 sense-fix).
//
// Base policy: leadfeast (+FEASTSCALE_R13=1, the current standard road).
//   control: RECCONF unset -> recconf wrapper with gate OFF (pure delegation
//            to leadfeast, byte-identical — proven by det-gate)
//   armed:   RECCONF=1   -> leadfeast + recconf recovery layer
//   detgate: DETGATE=1   -> per-seed: gate-off wrapper vs raw leadfeast,
//            rows must be byte-identical (16/16), plus one A/A spot check.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-recconf.md — written BEFORE the
// first run; the stratum rule below is FIXED, never re-drawn mid-run):
//   QUESTION: does the trauma-triggered recovery throttle hold when
//     measured with stratified bars — hard-seed primary + friendly-seed
//     no-regression bound — on the leadfeast road, identical seeds?
//   SEED SETS (fixed, same-regime per the r35 metric review):
//     SET-A (pilot regime): 11,22,33,44,55,66,77,88
//         (r35 courtship-road control median 94d)
//     SET-B (confirm regime): 111,222,333,444,555,666,777,888,999,1010,1111,1212
//         (r35 courtship-road control median 125.5d)
//   STRATUM RULE (fixed, control-side): compute the CONTROL median survival
//     per set on current tip. The set with control median <100d is the HARD
//     stratum; the set with control median >=100d is the FRIENDLY stratum.
//     Expected (r35 regime finding): SET-A hard, SET-B friendly. If both
//     sets land on the same side of 100d, the lower-median set is treated
//     as HARD and the higher as FRIENDLY (documented fallback; labels are
//     still reported against this run's control medians).
//   PRIMARY (hard stratum): armed median >= control median + 15d.
//   NO-REGRESSION BOUND (friendly stratum): armed median >= control median - 3d.
//   GO iff BOTH hold. A miss on either is NO-GO -> KILL (§14 binds).
//   GUARDRAILS (pooled 20 seeds): national >= pooled-control - 2; wave-5
//     unlocks >= pooled-control - 1; no new death mode (cause-family level,
//     n>=3 floor across armed runs — the r29/r34 metric-review floor);
//     exiled reported; table and other waves report-only.
//   HORIZON: 180d death-aware. Identical seeds, deterministic.
//   DET-GATE: 16/16 byte-identical rows (SET-A + first 8 of SET-B),
//     gate-off wrapper vs raw leadfeast; SMOKE=1 instrument-honesty FIRST;
//     one A/A spot check (control seed 11 x2, identical rows).
// A miss is NO-GO per §14 — never re-scored mid-run.
//
// The instrument: wave-unlock days + maxRank + exile flag (daily hook) plus
// recovery-layer observability read off the policy ctx each day (windows,
// fortify days, declines, combat deaths seen) — the ctx is shared between
// the driver's wrapper and the armed policy.
//
// Usage (control, SET-A): SEEDS=11,22,33,44,55,66,77,88 OUT=evidence/2026-10-14/sim-recconf-control-A.json node scripts/sweep-recconf-20261014.js
// Usage (armed):   ... RECCONF=1 OUT=evidence/2026-10-14/sim-recconf-armed-A.json ...
// Usage (detgate): DETGATE=1 node scripts/sweep-recconf-20261014.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const ARMED = process.env.RECCONF === '1';
const DETGATE = process.env.DETGATE === '1';
if (DETGATE && ARMED) {
  console.error('FATAL: DETGATE=1 requires RECCONF unset (gate-off wrapper vs raw).');
  process.exit(2);
}
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// NAMED exports (r20b lesson). Unwrap-verified below (2026-10-14 unwrap bug
// ran a whole suite policy-less — policy.daily must be a function).
const { leadfeast } = require('./policies/feastscale');
// Graceful degradation (kill-protocol, r29/r35): if the layer was deleted
// per the kill protocol, armed/detgate modes fail LOUDLY instead of
// measuring the wrong thing; control mode is unaffected.
let recconf = null;
try { recconf = require('./policies/recconf').recconf; }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED || DETGATE) {
    console.error('FATAL: RECCONF requested but scripts/policies/recconf.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: recconf layer absent — control mode only.');
}
for (const [nm, pol] of [['leadfeast', leadfeast], ['recconf', recconf]]) {
  if (pol && typeof pol.daily !== 'function') {
    console.error(`FATAL: unwrapped policy ${nm} has no daily function (typeof=${typeof pol.daily}). Refusing to run policy-less.`);
    process.exit(2);
  }
}
const { stdSnapshot } = require('./sweep-compare');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const DETGATE_SEEDS = [11, 22, 33, 44, 55, 66, 77, 88, 111, 222, 333, 444, 555, 666, 777, 888];

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const base = opts.baseOverride || (DETGATE ? recconf : (ARMED ? recconf : leadfeast));
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'recconf-stratified', fullTelemetry: true });
  await setupGame(Game);

  const track = { unlockDay: {}, maxRank: 0, exiledEver: false, tableEver: false };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;

  const origDaily = base.daily;
  // recovery observability: read the armed policy's ctx counters each day
  const recStats = { windows: 0, fortifyDays: 0, declined: 0, combatDeaths: 0, lastFortifyUntil: 0 };
  const policy = Object.assign({}, base, {
    id: (base.id || 'base') + '+recconf-instr',
    desc: 'instrument wrapper',
  });
  policy.daily = (G, ctx) => {
    try {
      const wv = (G.unlockedWave && G.unlockedWave()) || 1;
      for (let w = 1; w <= wv; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = gday(G);
      const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank, RANK_ORDER[s2.rank] || 0);
      if (G.state && G.state.exiled) track.exiledEver = true;
      try { const pg = G.progState ? (G.progState() || {}) : {}; if (pg.tableWaiting || pg.tableDone) track.tableEver = true; } catch (e) {}
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    const r = origDaily ? origDaily(G, ctx) : undefined;
    try {
      // ctx is shared with the armed layer: accumulate its counters.
      recStats.windows = ctx._recWindows || 0;
      recStats.fortifyDays = ctx._recFortifyDays || 0;
      recStats.declined = ctx._recDeclined || 0;
      recStats.combatDeaths = (ctx._recDeaths || []).filter(d => d.category === 'combat').length;
      if (ctx._recFortifyUntil) recStats.lastFortifyUntil = ctx._recFortifyUntil;
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
  // cause FAMILIES for the no-new-death-mode guardrail (r29/r34 metric
  // review): monster names collapse to combat; raw causes otherwise.
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
    seed, armed: ARMED, detgate: DETGATE, days: result.days, endReason: result.endReason,
    endStanding: end.standing,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    national: track.maxRank >= 2,
    wave5: track.unlockDay[5] != null, wave5Day: track.unlockDay[5] || null,
    wave4: track.unlockDay[4] != null,
    table: !!track.tableEver,
    won: !!Game.won,
    exiled: !!track.exiledEver,
    deathCauses,
    deathFamilies,
    playerDeaths: (result.samples.deaths || []).filter(d => d.player).length,
    villagerDeaths: (result.samples.deaths || []).filter(d => !d.player).length,
    instrErrors: instrErrors.length,
    recStats: (ARMED || DETGATE) ? recStats : null,
  };
  if (opts.verbose !== false) {
    console.log(`  [${DETGATE ? 'detgate' : (ARMED ? 'armed' : 'ctrl')} seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `w5=${row.wave5 ? 'd' + row.wave5Day : 'no'} rank=${row.maxRank} ` +
      `recW=${(ARMED || DETGATE) ? recStats.windows : '-'} pd=${row.playerDeaths} vd=${row.villagerDeaths} instrErr=${instrErrors.length}`);
  }
  return { row };
}

function summarize(rows) {
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const median = daysArr.length ? (daysArr[Math.floor((daysArr.length - 1) / 2)] + daysArr[Math.floor(daysArr.length / 2)]) / 2 : null;
  return {
    seeds: rows.length,
    medianSurvival: median,
    national: rows.filter(r => r.national).length,
    wave5: rows.filter(r => r.wave5).length,
    wave4: rows.filter(r => r.wave4).length,
    table: rows.filter(r => r.table).length,
    wins: rows.filter(r => r.won).length,
    exiled: rows.filter(r => r.exiled).length,
    recTotals: rows.reduce((t, r) => {
      if (r.recStats) {
        t.windows += r.recStats.windows; t.fortifyDays += r.recStats.fortifyDays;
        t.declined += r.recStats.declined; t.combatDeaths += r.recStats.combatDeaths;
      }
      return t;
    }, { windows: 0, fortifyDays: 0, declined: 0, combatDeaths: 0 }),
    deathFamilies: rows.reduce((acc, r) => {
      for (const [k, v] of Object.entries(r.deathFamilies)) acc[k] = (acc[k] || 0) + v;
      return acc;
    }, {}),
  };
}

async function detgate() {
  // 16/16: per-seed gate-off wrapper vs raw leadfeast, byte-identical rows.
  // Plus one A/A spot check (control seed 11 x2).
  let ok = 0;
  for (const seed of DETGATE_SEEDS) {
    const a = (await runOne(seed, { days: 180, baseOverride: recconf, verbose: false })).row;
    const b = (await runOne(seed, { days: 180, baseOverride: leadfeast, verbose: false })).row;
    // compare the trajectory fields (recStats identical shape, all zeros gate-off)
    const ka = JSON.stringify(a), kb = JSON.stringify(b);
    if (ka === kb) { ok++; }
    else {
      console.log(`  DETGATE seed ${seed}: DIVERGED`);
      for (const k of Object.keys(a)) {
        if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) console.log(`    ${k}: wrapper=${JSON.stringify(a[k])} raw=${JSON.stringify(b[k])}`);
      }
    }
  }
  // A/A spot check: control seed 11 twice, identical rows.
  const aa1 = (await runOne(11, { days: 180, baseOverride: leadfeast, verbose: false })).row;
  const aa2 = (await runOne(11, { days: 180, baseOverride: leadfeast, verbose: false })).row;
  const aa = JSON.stringify(aa1) === JSON.stringify(aa2);
  console.log(`DETGATE: gate-off wrapper vs raw leadfeast ${ok}/${DETGATE_SEEDS.length} byte-identical; A/A spot (seed 11 x2): ${aa ? 'IDENTICAL' : 'DIVERGED'}`);
  if (ok !== DETGATE_SEEDS.length || !aa) { console.error('FATAL: det-gate failed'); process.exit(1); }
  const out = process.env.OUT;
  const report = {
    label: 'recconf-detgate', policy: 'recconf-wrapper-gate-OFF vs raw leadfeast',
    seeds: DETGATE_SEEDS, commit: commitSha(), generated: new Date().toISOString(),
    identical: ok, total: DETGATE_SEEDS.length, aaSpotIdentical: aa,
  };
  if (out) { fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1)); console.log(`wrote ${out}`); }
}

function commitSha() {
  try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim(); } catch (e) { return 'unknown'; }
}

async function main() {
  if (DETGATE) { await detgate(); return; }
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT;
  const rows = [];
  for (const seed of seeds) rows.push((await runOne(seed, { days })).row);
  const suite = summarize(rows);
  const report = {
    label: ARMED ? 'recconf-armed' : 'recconf-control',
    policy: ARMED ? 'leadfeast+RECCONF=1' : 'leadfeast',
    seeds, days, commit: commitSha(),
    generated: new Date().toISOString(),
    rows,
    suite,
    // FLAT top-level keys for telemetry-check (baseline is flat; the r35
    // schema-mismatch invocation issue is fixed forward here).
    national: suite.national,
    table: suite.table,
    wins: suite.wins,
    exiled: suite.exiled,
  };
  if (out) {
    fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
    console.log(`wrote ${out}`);
  }
  const s = report.suite;
  console.log(`SUITE [${report.label}]: median ${s.medianSurvival}d, national ${s.national}/${s.seeds}, ` +
    `w5 ${s.wave5}/${s.seeds}, w4 ${s.wave4}/${s.seeds}, table ${s.table}/${s.seeds}, wins ${s.wins}/${s.seeds}, exiled ${s.exiled}, ` +
    `recWindows=${s.recTotals.windows} fortifyDays=${s.recTotals.fortifyDays} declined=${s.recTotals.declined}`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
