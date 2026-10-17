#!/usr/bin/env node
// scripts/sweep-perfsurvive-20261017.js — sim-perfsurvive pilot sweep
// (flesh-out loop, axis scale-onramp, finding #433 named next:
// trick-performer survival via companion screening — assembly WITHOUT the
// tricksurvive yield).
//
// QUESTION: does the knowledge-gated companion screen (PERFSURVIVE=1)
// convert more trick performances into trick-attributed kills than the base
// feast policies, on identical seeds — and/or raise performer survival in
// performed-trick fights?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: leadfeast, belongfeast (PERFSURVIVE unset)
//   armed:   perfsurvive-lead, perfsurvive-belong (PERFSURVIVE=1)
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written
// before the pilot sweep):
//   PRIMARY-A: trick kill-attributed kills (attr) — waveKillLog entries
//     with a non-empty trick summary, any killer, any via.
//     GO-A: (armed attr) - (control attr) >= 4 across the 16-run pilot.
//   PRIMARY-B: performer-survival rate in performed-trick fights —
//     TB fights with f.trickLogByMid non-empty at tbEnd where the scholar
//     (fighter 'p') is alive at tbEnd, over all performed-trick fights.
//     GO-B: armed rate - control rate >= 0.15 (15pp).
//     GO iff A or B met. KILL: both miss -> delete
//     scripts/policies/perfsurvive.js zero-trace per kill protocol; keep
//     instruments + evidence.
//   GUARDRAILS: villager deaths <= control; scholar combat deaths <=
//     control+2; national >= control-2 (per 8-seed set); median survival
//     (endReason-based: village-lost rate + total deaths — finding #490:
//     never scholar.day-as-survival) within noise; no new death mode
//     (death-cause key sets compared); det-gate byte-identical (proof).
//   Horizon: 180d death-aware (dead villages stop; the trick game plays
//     out across the whole run — wave-1/2 contacts happen all game).
//   Seeds: 8 FRESH [9931–9938] x {leadfeast, belongfeast} = 16 runs per
//     side (32 total). FRESH = 0 per-seed filename hits across evidence/
//     (verified before the run).
//   Policies: leadfeast/belongfeast x control/armed.
//   Substrate: SEATDRIVE=0, FEASTSCALE_R13=1 (pre-seat by design).
//
// Per-seed JSONs carry canonical wall keys (finding #482):
//   national, table, wins, exiled.
//
// Usage:
//   SEEDS="9931,9932,9933,9934,9935,9936,9937,9938" DAYS=180 \
//   OUT=evidence/2026-10-17/sim-perfsurvive-pilot.json \
//   PERSEED=evidence/2026-10-17/perseed-perfsurvive \
//   node scripts/sweep-perfsurvive-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { perfsurviveLead, perfsurviveBelong } = require('./policies/perfsurvive');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function nationalAt(Game) {
  try { const r = typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village'; return (r === 'national' || r === 'global') ? 1 : 0; }
  catch (e) { return 0; }
}
function wonAt(Game) {
  try { return Game.won === true ? 1 : 0; } catch (e) { return 0; }
}
function tableAt(Game) {
  // ever-table: the table was reached (waiting or done) at any point
  try {
    const tel = (Game.state || {}).telemetry || [];
    if (tel.some(e => e && (e.type === 'table_won' || e.type === 'table_failed' || e.type === 'table_entered'))) return 1;
    const pg = Game.progState ? Game.progState() : {};
    return (pg.tableWaiting || pg.tableDone) ? 1 : 0;
  } catch (e) { return 0; }
}
function exiledAt(Game) {
  try { return ((Game.state || {}).scholar || {}).exiled ? 1 : 0; } catch (e) { return 0; }
}
// Trick kill-attributed kills: waveKillLog entries with a non-empty trick
// summary — the trickSummary/tricktag channel, any killer, any via.
function trickAttr(Game) {
  const wkl = (Game.state || {}).waveKillLog || [];
  const all = wkl.filter(e => e && e.trick);
  const w12 = all.filter(e => ((e.w | 0) <= 2));
  const byVia = {};
  const byWave = {};
  for (const e of all) {
    byVia[e.via || '?'] = (byVia[e.via || '?'] || 0) + 1;
    byWave['w' + (e.w | 0)] = (byWave['w' + (e.w | 0)] || 0) + 1;
  }
  return { attr: all.length, attrW12: w12.length, byVia, byWave };
}
// Scholar deaths (successions) from the tele death stream; combat-caused
// ones counted separately for the guardrail.
function scholarDeaths(Game) {
  const tel = (Game.state || {}).telemetry || [];
  const ds = tel.filter(e => e && e.type === 'death' && e.player === true);
  const causes = {};
  let combat = 0;
  for (const e of ds) {
    const c = String(e.cause || 'unknown');
    causes[c] = (causes[c] || 0) + 1;
    if (/combat|fight|monster|maul|bite|claw|wound|slain|killed|strike/i.test(c)) combat++;
  }
  return { n: ds.length, combat, causes };
}
// Villager deaths (all) from the fallen ledger.
function villagerDeaths(Game) {
  try {
    const fallen = ((Game.state || {}).village || {}).fallen || [];
    return { n: fallen.length, combat: fallen.filter(f => f && f.cause === 'combat').length };
  } catch (e) { return { n: 0, combat: 0 }; }
}
// Performed-trick fight instrument (read-only): wrap tbEnd, snapshot per
// fight {performed: trickLogByMid non-empty, scholarAlive: fighter 'p'
// alive at tbEnd, result}. Det-neutral: wrappers call through; no
// RNG/logic/save contact.
function attachPerfInstrument(Game, rec) {
  try {
    const orig = Game.tbEnd;
    if (typeof orig !== 'function' || orig._psWrapped) return;
    const wrapped = function (result) {
      try {
        const f = Game.tbfight;
        if (f && !f.over) {
          const tlbm = f.trickLogByMid || {};
          const performed = Object.keys(tlbm).some(mid => (tlbm[mid] || []).length > 0);
          if (performed) {
            let pAlive = false;
            try { const p = Game.tbFighter('p'); pAlive = !!(p && p.alive); } catch (e) {}
            rec.push({ day: (Game.state.scholar || {}).day || 0, result: result, scholarAlive: pAlive ? 1 : 0 });
          }
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    wrapped._psWrapped = true;
    Game.tbEnd = wrapped;
  } catch (e) {}
}

async function runOne(policy, gate, seed, days) {
  if (gate) process.env.PERFSURVIVE = '1'; else delete process.env.PERFSURVIVE;
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'perfsurvive-' + policy.id, fullTelemetry: true });
  await setupGame(Game);
  const perfFights = [];
  attachPerfInstrument(Game, perfFights);
  const snap = {};
  const base = policy;
  const origDaily = base.daily;
  const wrapped = Object.assign({}, base, {
    daily(G, ctx) {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        if (ctx.psInvitesOk != null) snap.psInvitesOk = ctx.psInvitesOk;
      } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, sampleEvery: 15 }));
  const ta = trickAttr(Game);
  const sd = scholarDeaths(Game);
  const vd = villagerDeaths(Game);
  const perfN = perfFights.length;
  const perfSurv = perfN ? perfFights.filter(f => f.scholarAlive).length : 0;
  return {
    policy: policy.id, gate: gate ? '1' : '0', seed,
    days: result.days, endReason: result.endReason || 'alive',
    // canonical wall keys (finding #482)
    national: nationalAt(Game), table: tableAt(Game), wins: wonAt(Game), exiled: exiledAt(Game),
    maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    // PRIMARY-A
    attr: ta.attr, attrW12: ta.attrW12, attrByVia: ta.byVia, attrByWave: ta.byWave,
    // PRIMARY-B
    perfFights: perfN, perfSurvived: perfSurv,
    perfSurvivalRate: perfN ? +(perfSurv / perfN).toFixed(4) : null,
    // guardrails
    scholarDeaths: sd.n, scholarCombatDeaths: sd.combat, scholarDeathCauses: sd.causes,
    villagerDeaths: vd.n, villagerCombatDeaths: vd.combat,
    psInvitesOk: snap.psInvitesOk || 0,
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '9931,9932,9933,9934,9935,9936,9937,9938').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-17/sim-perfsurvive-pilot.json';
  const perSeedDir = process.env.PERSEED || null;
  const arms = [
    { policy: leadfeast, gate: false },
    { policy: belongfeast, gate: false },
    { policy: perfsurviveLead, gate: true },
    { policy: perfsurviveBelong, gate: true },
  ];
  const rows = [];
  for (const a of arms) {
    for (const seed of seeds) {
      const row = await runOne(a.policy, a.gate, seed, days);
      rows.push(row);
      if (perSeedDir) {
        try {
          fs.mkdirSync(perSeedDir, { recursive: true });
          fs.writeFileSync(path.join(perSeedDir, `${row.policy}-s${seed}.json`), JSON.stringify(row, null, 1));
        } catch (e) {}
      }
      console.log(`  [${row.policy} s${seed}] d=${row.days} ${row.endReason} attr=${row.attr} ` +
        `perf=${row.perfFights}/${row.perfSurvived}(${row.perfSurvivalRate}) nat=${row.national} tbl=${row.table} won=${row.wins} ex=${row.exiled} ` +
        `sDeaths=${row.scholarDeaths}(${row.scholarCombatDeaths}c) vDeaths=${row.villagerDeaths} inv=${row.psInvitesOk}`);
    }
  }
  // Summary.
  const sum = {};
  for (const r of rows) {
    const k = r.gate === '1' ? 'armed' : 'control';
    const s = sum[k] = sum[k] || {
      n: 0, attr: 0, perfFights: 0, perfSurvived: 0, national: 0, table: 0, wins: 0, exiled: 0,
      sDeaths: 0, sCombat: 0, vDeaths: 0, vCombat: 0, invites: 0, lost: 0, days: [],
      deathCauses: {},
    };
    s.n++;
    s.attr += r.attr; s.perfFights += r.perfFights; s.perfSurvived += r.perfSurvived;
    s.national += r.national; s.table += r.table; s.wins += r.wins; s.exiled += r.exiled;
    s.sDeaths += r.scholarDeaths; s.sCombat += r.scholarCombatDeaths;
    s.vDeaths += r.villagerDeaths; s.vCombat += r.villagerCombatDeaths;
    s.invites += r.psInvitesOk;
    if (/village-lost|village-dead|pop-zero/.test(r.endReason)) s.lost++;
    s.days.push(r.days);
    for (const [c, n] of Object.entries(r.scholarDeathCauses || {})) s.deathCauses[c] = (s.deathCauses[c] || 0) + n;
  }
  for (const k of Object.keys(sum)) {
    const s = sum[k];
    s.attrPerRun = +(s.attr / s.n).toFixed(2);
    s.perfSurvivalRate = s.perfFights ? +(s.perfSurvived / s.perfFights).toFixed(4) : null;
    s.days.sort((a, b) => a - b);
    s.medianDays = s.days[Math.floor(s.days.length / 2)];
  }
  const c = sum.control, a = sum.armed;
  const verdict = {
    primaryA_attrDiff: a.attr - c.attr, primaryA_bar: 4, primaryA_go: (a.attr - c.attr) >= 4,
    primaryB_survDiff: (a.perfSurvivalRate == null || c.perfSurvivalRate == null) ? null : +(a.perfSurvivalRate - c.perfSurvivalRate).toFixed(4),
    primaryB_bar: 0.15,
    primaryB_go: (a.perfSurvivalRate != null && c.perfSurvivalRate != null) ? (a.perfSurvivalRate - c.perfSurvivalRate) >= 0.15 : false,
  };
  verdict.go = verdict.primaryA_go || verdict.primaryB_go;
  const guard = {
    villagerDeaths_armed: a.vDeaths, villagerDeaths_control: c.vDeaths,
    villagerDeaths_ok: a.vDeaths <= c.vDeaths,
    scholarCombat_armed: a.sCombat, scholarCombat_control: c.sCombat,
    scholarCombat_ok: a.sCombat <= c.sCombat + 2,
    national_armed: a.national, national_control: c.national,
    national_ok: a.national >= c.national - 2,
  };
  const report = { seeds, days, verdict, guard, sum, rows };
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 1));
  } catch (e) {}
  console.log('\n== PILOT SUMMARY ==');
  console.log(JSON.stringify({ verdict, guard, control: sum.control, armed: sum.armed }, null, 1));
  console.log('wrote ' + out);
}

main().catch(e => { console.error('sweep crashed: ' + e.stack); process.exit(1); });
