#!/usr/bin/env node
// scripts/sweep-compvet-20261018.js — sim-compvet pilot sweep
// (flesh-out loop arm sim-compvet, 2026-10-18, scale-onramp axis;
// sim-vetsurvive's named next: MANUFACTURE veterans faster via the
// companion-veteran channel).
//
// QUESTION: does the compvet companion-first doctrine (round-1 rally /
// alpha sacrifice + companion-first yield at 40% + blooded escort at 55%)
// raise companion wave-3 kills vs the vetrel-only control on identical
// seeds?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: vetrel-lead, vetrel-belong (VETREL=1, COMPVET unset)
//   armed:   compvet-lead, compvet-belong (VETREL=1, COMPVET=1)
//
// The pipeline (vetrel's deliberate wave-3 hunts) runs IDENTICALLY on both
// arms — the only difference is the companion-first fight doctrine. This
// isolates the "manufacture veterans" half of the answer.
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1,
// TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1 (vetsurvive sibling convention).
//
// PRE-REGISTRATION (written before the pilot — see
// evidence/2026-10-18/sim-compvet.md):
//   PRIMARY (binding, §14): companion wave-3 kills (via='companion', w=3)
//     armed−control ≥ +2, OR wave-4 unlocks (maxWave>=4) armed−control ≥ +1,
//     across the 16 paired runs (8 seeds x {lead,belong}).
//     GO: bar met -> land. KILL: miss -> delete scripts/policies/compvet.js
//     zero-trace.
//   GUARDRAILS: median survival >= control-10d (per policy pair);
//     national >= control-2; starvation deaths <= control+1; no new death
//     mode (n>=3, kind-filtered person deaths only).
//   Seeds: 8 fresh (53704, 53707, 53708, 55104, 55106, 56101, 56104, 56106
//     — verified 0 hits in evidence/). Horizon: 180d death-aware.
//
// Usage:
//   node scripts/sweep-compvet-20261018.js
//   OUT=evidence/2026-10-18/sweep-compvet.json PERSEED=evidence/2026-10-18/perseed-compvet node scripts/sweep-compvet-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { vetrelLead, vetrelBelong } = require('./policies/vetrel');
const { compvetLead, compvetBelong } = require('./policies/compvet');

const SEEDS = (process.env.SEEDS || '53704,53707,53708,55104,55106,56101,56104,56106')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || 'evidence/2026-10-18/sweep-compvet.json';
const PERSEED = process.env.PERSEED || 'evidence/2026-10-18/perseed-compvet';

function baseEnv(armed) {
  if (armed) process.env.COMPVET = '1'; else delete process.env.COMPVET;
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
  const { Game } = await loadGame({ seed, mode: 'compvet-' + policy.id });
  await setupGame(Game);
  const deathRecs = installDeathCapture(Game);
  const snap = {};
  const base = policy;
  const origDaily = base.daily;
  const wrapped = Object.assign({}, base, {
    daily(G, ctx) {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        for (const k of ['vetHunts', 'vetHuntFights', 'vetYields', 'vetBreakoffs',
                         'vetRescues', 'vetInvitesOk',
                         'cvYields', 'cvYieldFights', 'cvRallies', 'cvAlphaWaits',
                         'cvEscorts', 'cvEscortStrikes']) {
          if (ctx[k] != null) snap[k] = ctx[k];
        }
      } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days }));
  const final = readinessRow(Game);
  const log = Game.state.waveKillLog || [];
  // PRIMARY mechanism telemetry: companion vs scholar wave-3 kills
  const w3 = log.filter(e => e && (e.w | 0) === 3);
  const compW3Kills = w3.filter(e => e.via === 'companion').length;
  const scholarW3Kills = w3.filter(e => e.via === 'player').length;
  const w3ByChannel = {};
  for (const e of w3) w3ByChannel[e.via || '?'] = (w3ByChannel[e.via || '?'] || 0) + 1;
  const vetIds = {};
  for (const e of log) if (e && (e.w | 0) >= 3 && e.by) vetIds[e.by] = true;
  const deaths = personDeaths(deathRecs);
  const starveDeaths = deaths.filter(d => /starv/i.test(d.cause)).length;
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
    compW3Kills, scholarW3Kills, w3ByChannel,
    deaths: deaths.length, starveDeaths, vetDeaths,
    deathCauses: deaths.reduce((m, d) => { m[d.cause] = (m[d.cause] || 0) + 1; return m; }, {}),
    snap,
  };
}

async function main() {
  fs.mkdirSync(PERSEED, { recursive: true });
  const rows = [];
  const policies = [
    ['lead', vetrelLead, compvetLead],
    ['belong', vetrelBelong, compvetBelong],
  ];
  for (const seed of SEEDS) {
    for (const [pname, ctrlPol, armedPol] of policies) {
      for (const [armed, pol] of [[false, ctrlPol], [true, armedPol]]) {
        const arm = armed ? 'armed' : 'control';
        let row;
        try {
          row = await runOne(pol, armed, seed, DAYS);
        } catch (e) {
          row = { seed, policy: pname, armed, error: String(e && e.message).slice(0, 200) };
        }
        row.armKey = arm;
        row.policyBase = pname;
        rows.push(row);
        fs.writeFileSync(path.join(PERSEED, `${pname}-${arm}-s${seed}.json`), JSON.stringify(row));
        try { fs.appendFileSync('/tmp/compvet-pilot-progress.log', `${pname}-${arm}-s${seed} done compW3=${row.compW3Kills} w4=${row.w4unlock}\n`); } catch (e) {}
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
  const sum = { armed: { compKills: 0, w4: 0, national: 0, starve: 0, vetDeaths: 0, days: [] },
                control: { compKills: 0, w4: 0, national: 0, starve: 0, vetDeaths: 0, days: [] } };
  for (const p of pairs) {
    for (const [k, r] of [['armed', p.a], ['control', p.c]]) {
      sum[k].compKills += r.compW3Kills | 0;
      sum[k].w4 += r.w4unlock | 0;
      sum[k].national += r.national | 0;
      sum[k].starve += r.starveDeaths | 0;
      sum[k].vetDeaths += r.vetDeaths | 0;
      sum[k].days.push(r.days | 0);
    }
  }
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
  const compDiff = sum.armed.compKills - sum.control.compKills;
  const w4diff = sum.armed.w4 - sum.control.w4;
  const summary = {
    seeds: SEEDS, days: DAYS, pairs: pairs.length,
    primary: {
      compW3Kills: { armed: sum.armed.compKills, control: sum.control.compKills, diff: compDiff, GO: compDiff >= 2 },
      w4unlocks: { armed: sum.armed.w4, control: sum.control.w4, diff: w4diff, GO: w4diff >= 1 },
      verdict: (compDiff >= 2 || w4diff >= 1) ? 'GO' : 'NO-GO (KILL)',
    },
    national: { armed: sum.armed.national, control: sum.control.national, guardrail: '>= control-2' },
    starveDeaths: { armed: sum.armed.starve, control: sum.control.starve, guardrail: '<= control+1' },
    vetDeaths: { armed: sum.armed.vetDeaths, control: sum.control.vetDeaths },
    medianDays: { armed: med(sum.armed.days), control: med(sum.control.days), guardrail: '>= control-10' },
    doctrineTelemetry: { armed: pairs.map(p => p.a.snap).filter(Boolean) },
  };
  const out = { summary, rows };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  try { fs.appendFileSync('/tmp/compvet-pilot-progress.log', `SUMMARY pairs=${pairs.length} compKills ${sum.armed.compKills}v${sum.control.compKills} w4 ${sum.armed.w4}v${sum.control.w4} -> ${summary.primary.verdict}\n`); } catch (e) {}
}

main().catch(e => { try { fs.appendFileSync('/tmp/compvet-pilot-progress.log', 'SWEEP CRASH: ' + (e && e.stack || e) + '\n'); } catch (e2) {} process.exit(2); });
