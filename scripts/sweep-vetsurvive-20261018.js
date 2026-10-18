#!/usr/bin/env node
// scripts/sweep-vetsurvive-20261018.js — sim-vetsurvive pilot sweep
// (flesh-out loop arm sim-vetsurvive, 2026-10-18, scale-onramp axis;
// defercensus3's named next: keep veterans alive through the release window).
//
// QUESTION: does the vetsurvive muster (shelter veterans during the wave-4
// deferral window + hunt-draft guard + scholar hold) raise wave-4 unlock
// share vs the vetrel-only control on identical seeds?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: vetrel-lead, vetrel-belong (VETREL=1, VETSURVIVE unset)
//   armed:   vetsurvive-lead, vetsurvive-belong (VETREL=1, VETSURVIVE=1)
//
// The pipeline (vetrel's deliberate wave-3 hunts) runs IDENTICALLY on both
// arms — the only difference is the protection layer. This isolates the
// "keep them alive" half of the answer.
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1,
// TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1 (defercensus3 sibling convention).
//
// PRE-REGISTRATION (written before the pilot — see
// evidence/2026-10-18/sim-vetsurvive.md):
//   PRIMARY (binding, §14): wave-4 unlocks (maxWave>=4) armed-CONTRObar
//     >= +3 across the 16 paired runs (8 seeds x {leadfeast,belongfeast}).
//     GO: bar >= +3 -> confirm on 12-16 fresh seeds.
//     KILL: miss -> delete scripts/policies/vetsurvive.js zero-trace.
//   GUARDRAILS: median survival >= control-10d (per policy pair);
//     national >= control-2; starvation deaths <= control+1; no new death
//     mode (n>=3, kind-filtered person deaths only).
//   Seeds: 8 fresh (51904-51908, 52001, 52002, 52004 — verified unused in
//     evidence/). Horizon: 180d death-aware.
//
// Usage:
//   SEEDS="51904,51905,51906,51907,51908,52001,52002,52004" DAYS=180 \
//   OUT=evidence/2026-10-18/sweep-vetsurvive.json \
//   PERSEED=evidence/2026-10-18/perseed-vetsurvive \
//   node scripts/sweep-vetsurvive-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { vetrelLead, vetrelBelong } = require('./policies/vetrel');
const { vetsurviveLead, vetsurviveBelong } = require('./policies/vetsurvive');

const SEEDS = (process.env.SEEDS || '51904,51905,51906,51907,51908,52001,52002,52004')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || 'evidence/2026-10-18/sweep-vetsurvive.json';
const PERSEED = process.env.PERSEED || 'evidence/2026-10-18/perseed-vetsurvive';

function baseEnv(armed) {
  if (armed) process.env.VETSURVIVE = '1'; else delete process.env.VETSURVIVE;
  process.env.VETREL = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
}

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function readinessRow(Game) {
  try {
    const r = Game.waveCombatReadiness(4);
    return {
      ready: !!r.ready, armored: r.armored | 0, armed: r.armed | 0,
      tricks: r.tricks | 0, veterans: r.veterans | 0,
      short: (r.short || []).join('|') || 'NONE',
      maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    };
  } catch (e) { return { err: String(e && e.message).slice(0, 60) }; }
}

// Person deaths: kind-aware tele capture (the DEATH-TELE KIND POLLUTION
// finding — tele('death') fires for kind 'monster' too). Wrapped per-run;
// dedup on (who,day,cause); the PHANTOM finding (kind:'person' tele without
// the kill landing) is noted — paired arms share the engine, so phantoms
// cannot create an armed-only signal.
function installDeathCapture(Game) {
  const recs = [];
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          recs.push({
            day: dayOf(Game),
            who: data && data.who,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
          });
        }
      } catch (e) {}
      return r;
    };
  } catch (e) {}
  return recs;
}
function personDeaths(recs) {
  const seen = {};
  const out = [];
  for (const t of recs) {
    if (!t) continue;
    const kind = t.kind;
    const isPerson = t.player || kind === 'person' || kind === 'villager' || kind === 'scholar' || kind == null;
    if (!isPerson) continue;
    const key = [t.who, t.day, t.cause].join('|');
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ who: t.who, day: t.day | 0, cause: t.cause || 'unknown' });
  }
  return out;
}

async function runOne(policy, armed, seed, days) {
  baseEnv(armed);
  const { Game } = await loadGame({ seed, mode: 'vetsurvive-' + policy.id });
  await setupGame(Game);
  const deathRecs = installDeathCapture(Game);
  const trace = [];
  const snap = {};
  const base = policy;
  const origDaily = base.daily;
  const wrapped = Object.assign({}, base, {
    daily(G, ctx) {
      const d = dayOf(G);
      if (d % 15 === 0 || d === 1) {
        try { trace.push(Object.assign({ d }, readinessRow(G))); } catch (e) {}
      }
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        for (const k of ['vsMusters', 'vsMusteredTotal', 'vsReleases', 'vsScholarHoldDays',
                         'vsTravelBlocked', 'vsGuardedDrafts',
                         'vetHunts', 'vetHuntFights', 'vetYields']) {
          if (ctx[k] != null) snap[k] = ctx[k];
        }
      } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days }));
  const final = readinessRow(Game);
  const log = Game.state.waveKillLog || [];
  const vetIds = {};
  for (const e of log) if (e && (e.w | 0) >= 3 && e.by) vetIds[e.by] = true;
  const deaths = personDeaths(deathRecs);
  const starveDeaths = deaths.filter(d => /starv/i.test(d.cause)).length;
  // veteran deaths during the run (anyone who ever held a wave-3+ kill)
  const vetDeaths = deaths.filter(d => vetIds[d.who]).length;
  let national = 0, table = 0;
  try {
    const sr = Game.scaleRank ? Game.scaleRank() : '';
    national = /national|global/.test(sr) ? 1 : 0;
  } catch (e) {}
  try { table = Game.tableReached && Game.tableReached() ? 1 : 0; } catch (e) {}
  const end = (() => {
    try {
      if (Game.over) return Game.villageLost ? 'village-lost' : 'ended';
      return 'survived';
    } catch (e) { return 'unknown'; }
  })();
  return {
    seed, policy: policy.id, armed: !!armed,
    days: dayOf(Game), end, national, table,
    maxWave: final.maxWave, w4unlock: (final.maxWave | 0) >= 4 ? 1 : 0,
    finalReadiness: final,
    deaths: deaths.length, starveDeaths, vetDeaths,
    deathCauses: deaths.reduce((m, d) => { m[d.cause] = (m[d.cause] || 0) + 1; return m; }, {}),
    trace, snap,
  };
}

async function main() {
  fs.mkdirSync(PERSEED, { recursive: true });
  const rows = [];
  const policies = [
    ['lead', vetrelLead, vetsurviveLead],
    ['belong', vetrelBelong, vetsurviveBelong],
  ];
  for (const seed of SEEDS) {
    for (const [pname, ctrlPol, armedPol] of policies) {
      for (const [armed, pol] of [[false, ctrlPol], [true, armedPol]]) {
        const arm = armed ? 'armed' : 'control';
        console.log(`run seed=${seed} policy=${pname} arm=${arm} ...`);
        let row;
        try {
          row = await runOne(pol, armed, seed, DAYS);
        } catch (e) {
          console.error(`  ERROR seed=${seed} ${pname}/${arm}:`, String(e && e.message).slice(0, 200));
          row = { seed, policy: pname, armed, error: String(e && e.message).slice(0, 200) };
        }
        row.armKey = arm;
        row.policyBase = pname;
        rows.push(row);
        fs.writeFileSync(path.join(PERSEED, `${pname}-${arm}-s${seed}.json`), JSON.stringify(row));
      }
    }
  }
  // paired summary
  const pairs = [];
  for (const seed of SEEDS) {
    for (const pname of ['lead', 'belong']) {
      const c = rows.find(r => r.seed === seed && r.policyBase === pname && r.armKey === 'control');
      const a = rows.find(r => r.seed === seed && r.policyBase === pname && r.armKey === 'armed');
      if (c && a && !c.error && !a.error) pairs.push({ seed, pname, c, a });
    }
  }
  const sum = { armed: { w4: 0, national: 0, starve: 0, vetDeaths: 0, days: [] },
                control: { w4: 0, national: 0, starve: 0, vetDeaths: 0, days: [] } };
  for (const p of pairs) {
    for (const [k, r] of [['armed', p.a], ['control', p.c]]) {
      sum[k].w4 += r.w4unlock | 0;
      sum[k].national += r.national | 0;
      sum[k].starve += r.starveDeaths | 0;
      sum[k].vetDeaths += r.vetDeaths | 0;
      sum[k].days.push(r.days | 0);
    }
  }
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
  const w4diff = sum.armed.w4 - sum.control.w4;
  const summary = {
    seeds: SEEDS, days: DAYS, pairs: pairs.length,
    w4: { armed: sum.armed.w4, control: sum.control.w4, diff: w4diff, GO: w4diff >= 3 },
    national: { armed: sum.armed.national, control: sum.control.national },
    starveDeaths: { armed: sum.armed.starve, control: sum.control.starve },
    vetDeaths: { armed: sum.armed.vetDeaths, control: sum.control.vetDeaths },
    medianDays: { armed: med(sum.armed.days), control: med(sum.control.days) },
    musterTelemetry: {
      armed: pairs.map(p => p.a.snap).filter(Boolean),
    },
  };
  console.log('\n==== PILOT SUMMARY ====');
  console.log(`pairs: ${pairs.length}`);
  console.log(`PRIMARY w4 unlocks: armed=${sum.armed.w4} control=${sum.control.w4} diff=${w4diff} bar>=+3 -> ${w4diff >= 3 ? 'GO' : 'NO-GO (KILL)'}`);
  console.log(`national: armed=${sum.armed.national} control=${sum.control.national} (guardrail >= control-2)`);
  console.log(`starvation deaths: armed=${sum.armed.starve} control=${sum.control.starve} (guardrail <= control+1)`);
  console.log(`veteran deaths: armed=${sum.armed.vetDeaths} control=${sum.control.vetDeaths}`);
  console.log(`median days: armed=${med(sum.armed.days)} control=${med(sum.control.days)} (guardrail >= control-10)`);
  const out = { summary, rows };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`wrote ${OUT} + ${PERSEED}/ (${rows.length} per-seed JSONs)`);
}

main().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
