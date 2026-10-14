#!/usr/bin/env node
// sweep-recoverylever-20261014.js — RECOVERY LEVER PILOT (scale-onramp r35,
// ARM 2).
//
// Before/after on identical seeds (courtship suite: leadcourt + FOURTHLINK=1,
// seeds 11/22/33/44/55/66/77/88, 180d death-aware).
//   control: RECOVERYLEVER unset -> fourthlink (the succbrake road, re-run)
//   armed:   RECOVERYLEVER=1   -> fourthlink + recoverylever layer
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-recoverylever.md — written BEFORE
// the armed run; the control side re-runs the courtship road through this
// driver's instrument on current tip — never trust old numbers):
//   PRIMARY (survival): median survival >= control + 5d.
//   GUARDRAILS: national >= control-2; wave-5 unlocks >= control-1;
//     no new death mode (cause-family level: a family key present in armed
//     but absent from control counts as a new mode only with n>=3 across
//     armed runs — the r29/r34 metric-review n-floor; singleton noise at n=8
//     seeds is not a mode).
//   Horizon 180d death-aware; 8 seeds; courtship both sides. Identical seeds,
//   deterministic (A/A proven on this road).
// A miss is NO-GO per §14 — never re-scored.
//
// The instrument: wave-unlock days + maxRank + exile flag (daily hook) plus
// recovery-layer observability read off the policy ctx each day (windows,
// fortify days, declines, combat deaths seen) — the ctx is shared between
// the driver's wrapper and the armed policy.
//
// Usage (control, one seed):
//   SEEDS=55 OUT=evidence/2026-10-14/sim-recoverylever-control-s55.json \
//     node scripts/sweep-recoverylever-20261014.js
// Usage (armed):
//   SEEDS=55 RECOVERYLEVER=1 OUT=evidence/2026-10-14/sim-recoverylever-armed-s55.json \
//     node scripts/sweep-recoverylever-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
const ARMED = process.env.RECOVERYLEVER === '1';
// DETGATE=1: run the recoverylever WRAPPER with the env gate OFF against raw
// fourthlink — the trajectories must be byte-identical (gate-off delegation).
const DETGATE = process.env.DETGATE === '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// NAMED exports (r20b lesson).
const { fourthlink } = require('./policies/fourthlink');
// Graceful degradation (kill-protocol, r29): if the layer was deleted per
// the kill protocol, armed mode fails LOUDLY instead of measuring the wrong
// thing; control mode is unaffected.
let recoverylever = null;
try { recoverylever = require('./policies/recoverylever').recoverylever; }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED || DETGATE) {
    console.error('FATAL: RECOVERYLEVER requested but scripts/policies/recoverylever.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: recoverylever layer absent — control mode only.');
}
const { stdSnapshot } = require('./sweep-compare');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'recoverylever-pilot', fullTelemetry: true });
  await setupGame(Game);

  const track = { unlockDay: {}, maxRank: 0, exiledEver: false };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;

  const base = DETGATE ? recoverylever : (ARMED ? recoverylever : fourthlink);
  const origDaily = base.daily;
  // recovery observability: read the armed policy's ctx counters each day
  const recStats = { windows: 0, fortifyDays: 0, declined: 0, combatDeaths: 0, lastFortifyUntil: 0 };
  const policy = Object.assign({}, base, {
    id: (base.id || 'base') + '+recoverylever-pilot',
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
      // ctx is shared with the armed layer: accumulate its counters.
      recStats.windows = ctx._recWindows || 0;
      recStats.fortifyDays = ctx._recFortifyDays || 0;
      recStats.declined = ctx._recDeclined || 0;
      recStats.combatDeaths = (ctx._recDeaths || []).filter(d => d.category === 'combat').length;
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
    seed, armed: ARMED, days: result.days, endReason: result.endReason,
    endStanding: end.standing,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    national: track.maxRank >= 2,
    wave5: track.unlockDay[5] != null, wave5Day: track.unlockDay[5] || null,
    wave4: track.unlockDay[4] != null,
    exiled: !!track.exiledEver,
    deathCauses,
    deathFamilies,
    playerDeaths: (result.samples.deaths || []).filter(d => d.player).length,
    villagerDeaths: (result.samples.deaths || []).filter(d => !d.player).length,
    instrErrors: instrErrors.length,
    recStats: ARMED ? recStats : null,
  };
  if (opts.verbose !== false) {
    console.log(`  [${ARMED ? 'armed' : 'ctrl'} seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `w5=${row.wave5 ? 'd' + row.wave5Day : 'no'} rank=${row.maxRank} ` +
      `recW=${ARMED ? recStats.windows : '-'} pd=${row.playerDeaths} vd=${row.villagerDeaths} instrErr=${instrErrors.length}`);
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
  const report = {
    label: DETGATE ? 'recoverylever-detgate' : (ARMED ? 'recoverylever-armed' : 'recoverylever-control'),
    policy: DETGATE ? 'recoverylever-wrapper-gate-OFF' : (ARMED ? 'fourthlink+RECOVERYLEVER=1' : 'fourthlink'),
    seeds, days, commit,
    generated: new Date().toISOString(),
    rows,
    suite: {
      seeds: rows.length,
      medianSurvival: median,
      national: rows.filter(r => r.national).length,
      wave5: rows.filter(r => r.wave5).length,
      wave4: rows.filter(r => r.wave4).length,
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
    },
  };
  if (out) {
    fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
    console.log(`wrote ${out}`);
  }
  const s = report.suite;
  console.log(`SUITE [${report.label}]: median ${s.medianSurvival}d, national ${s.national}/${s.seeds}, ` +
    `w5 ${s.wave5}/${s.seeds}, w4 ${s.wave4}/${s.seeds}, exiled ${s.exiled}, ` +
    `recWindows=${s.recTotals.windows} fortifyDays=${s.recTotals.fortifyDays} declined=${s.recTotals.declined}`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
