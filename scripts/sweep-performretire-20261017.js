#!/usr/bin/env node
// scripts/sweep-performretire-20261017.js — sim-performretire pilot sweep
// (flesh-out loop, axis scale-onramp (blocking): PERFORM-THEN-DISENGAGE on
// the trick-execution window).
//
// QUESTION: does retiring after a registered trick performance (PERFORMRETIRE=1)
// cut performer deaths in performed-trick fights vs the base feast policies,
// on identical seeds — leaning into the measured fight shape (tricks buy
// flights, not kills)?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: leadfeast, belongfeast (PERFORMRETIRE unset)
//   armed:   performretire-lead, performretire-belong (PERFORMRETIRE=1)
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1
// (same substrate as the trickfunnel/attrcensus/trickshape corpus).
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written before
// the pilot sweep; see evidence/2026-10-17/sim-performretire.md):
//   PRIMARY: performer combat deaths in performed-trick fights — TB fights
//     with f.trickLogByMid non-empty at tbEnd where fighter 'p' is NOT alive
//     at tbEnd. (Operationalization of "trick-bearing fights": the lever's
//     contact surface is performed fights — it fires only after a performance
//     registers; deaths in non-performed trick-bearing fights cannot be
//     touched by the layer. Non-performed trick-bearing deaths are reported
//     descriptively for transparency.)
//     GO: (armed performerDeaths) - (control performerDeaths) <= -3 across
//     the 16-run pilot.
//     KILL: miss -> delete scripts/policies/performretire.js zero-trace per
//     kill protocol; keep instruments + evidence.
//   SECONDARY (direction check, NOT binding): routed-via-trick fight rate —
//     performed fights ending result='routed' — armed >= control.
//   GUARDRAILS: kill-attributed trick kills >= control-2; national >=
//     control-2 (per 8-seed set); median survival >= control-10d; no new death
//     mode (death-cause key sets compared); det-gate byte-identical (proof).
//   Horizon: 180d death-aware (dead villages stop; the trick game plays out
//     across the whole run — wave-1/2 contacts happen all game).
//   Seeds: 8 FRESH [9941-9948] x {leadfeast, belongfeast} = 16 runs per side
//     (32 total). FRESH = 0 per-seed filename hits across evidence/ (verified
//     before the run).
//   Policies: leadfeast/belongfeast x control/armed.
//   Substrate: SEATDRIVE=0, FEASTSCALE_R13=1 (pre-seat by design).
//
// Per-seed JSONs carry canonical wall keys (finding #482):
//   national, table, wins, exiled.
//
// Usage:
//   SEEDS="9941,9942,9943,9944,9945,9946,9947,9948" DAYS=180 \
//   OUT=evidence/2026-10-17/sim-performretire-pilot.json \
//   PERSEED=evidence/2026-10-17/perseed-performretire \
//   node scripts/sweep-performretire-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { performretireLead, performretireBelong } = require('./policies/performretire');

function nationalAt(Game) {
  try { const r = typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village'; return (r === 'national' || r === 'global') ? 1 : 0; }
  catch (e) { return 0; }
}
function wonAt(Game) {
  try { return Game.won === true ? 1 : 0; } catch (e) { return 0; }
}
function tableAt(Game) {
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
function villagerDeaths(Game) {
  try {
    const fallen = ((Game.state || {}).village || {}).fallen || [];
    return { n: fallen.length, combat: fallen.filter(f => f && f.cause === 'combat').length };
  } catch (e) { return { n: 0, combat: 0 }; }
}
// Performed-trick fight instrument (read-only): wrap tbEnd, snapshot per
// fight {performed: trickLogByMid non-empty, scholarAlive: fighter 'p' alive
// at tbEnd, result}. Det-neutral: wrappers call through; no RNG/logic/save
// contact.
function attachPerfInstrument(Game, rec) {
  try {
    const orig = Game.tbEnd;
    if (typeof orig !== 'function' || orig._prWrapped) return;
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
    wrapped._prWrapped = true;
    Game.tbEnd = wrapped;
  } catch (e) {}
}

async function runOne(policy, gate, seed, days) {
  if (gate) process.env.PERFORMRETIRE = '1'; else delete process.env.PERFORMRETIRE;
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'performretire-' + policy.id, fullTelemetry: true });
  await setupGame(Game);
  const perfFights = [];
  attachPerfInstrument(Game, perfFights);
  const snap = {};
  let runCtx = null;
  const base = policy;
  const origDaily = base.daily;
  const wrapped = Object.assign({}, base, {
    daily(G, ctx) {
      runCtx = ctx;
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, sampleEvery: 15 }));
  const ta = trickAttr(Game);
  const sd = scholarDeaths(Game);
  const vd = villagerDeaths(Game);
  const perfN = perfFights.length;
  const perfDeaths = perfFights.filter(f => !f.scholarAlive).length;
  const perfSurv = perfN - perfDeaths;
  const routedViaTrick = perfFights.filter(f => f.result === 'routed').length;
  // Metric-design note (evidence header): the retire's disengage ends fights
  // as 'fled' (tbBarrierExit -> tbEnd('fled') when nothing follows), not
  // 'routed'. Both rates are recorded; fled is the honest direction check.
  const fledViaTrick = perfFights.filter(f => f.result === 'fled').length;
  let retires = 0;
  try { retires = (runCtx && runCtx.prRetires) || 0; } catch (e) {}
  return {
    policy: policy.id, gate: gate ? '1' : '0', seed,
    days: result.days, endReason: result.endReason || 'alive',
    // canonical wall keys (finding #482)
    national: nationalAt(Game), table: tableAt(Game), wins: wonAt(Game), exiled: exiledAt(Game),
    maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    // PRIMARY: performer deaths in performed-trick fights
    perfFights: perfN, perfDeaths: perfDeaths, perfSurvived: perfSurv,
    perfSurvivalRate: perfN ? +(perfSurv / perfN).toFixed(4) : null,
    // SECONDARY: routed-via-trick fight rate (performed fights ending 'routed')
    routedViaTrick: routedViaTrick,
    routedRate: perfN ? +(routedViaTrick / perfN).toFixed(4) : null,
    // honest direction check: performed fights ending 'fled' (the retire's outcome class)
    fledViaTrick: fledViaTrick,
    fledRate: perfN ? +(fledViaTrick / perfN).toFixed(4) : null,
    // layer mechanism
    retires: retires,
    // guardrail: trick kill-attributed kills
    attr: ta.attr, attrW12: ta.attrW12, attrByVia: ta.byVia, attrByWave: ta.byWave,
    // guardrails: deaths
    scholarDeaths: sd.n, scholarCombatDeaths: sd.combat, scholarDeathCauses: sd.causes,
    villagerDeaths: vd.n, villagerCombatDeaths: vd.combat,
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '9941,9942,9943,9944,9945,9946,9947,9948').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-17/sim-performretire-pilot.json';
  const perSeedDir = process.env.PERSEED || null;
  const arms = [
    { policy: leadfeast, gate: false },
    { policy: belongfeast, gate: false },
    { policy: performretireLead, gate: true },
    { policy: performretireBelong, gate: true },
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
      console.log(`  [${row.policy} s${seed}] d=${row.days} ${row.endReason} perf=${row.perfFights} perfDeaths=${row.perfDeaths} routed=${row.routedViaTrick} fled=${row.fledViaTrick} retires=${row.retires} attr=${row.attr} ` +
        `nat=${row.national} tbl=${row.table} won=${row.wins} ex=${row.exiled} ` +
        `sDeaths=${row.scholarDeaths}(${row.scholarCombatDeaths}c) vDeaths=${row.villagerDeaths}`);
    }
  }
  // Summary.
  const sum = {};
  for (const r of rows) {
    const k = r.gate === '1' ? 'armed' : 'control';
    const s = sum[k] = sum[k] || {
      n: 0, perfFights: 0, perfDeaths: 0, routedViaTrick: 0, fledViaTrick: 0, retires: 0,
      attr: 0, national: 0, table: 0, wins: 0, exiled: 0,
      sDeaths: 0, sCombat: 0, vDeaths: 0, vCombat: 0, lost: 0, days: [],
      deathCauses: {},
    };
    s.n++;
    s.perfFights += r.perfFights; s.perfDeaths += r.perfDeaths; s.routedViaTrick += r.routedViaTrick; s.fledViaTrick += r.fledViaTrick; s.retires += r.retires;
    s.attr += r.attr; s.national += r.national; s.table += r.table; s.wins += r.wins; s.exiled += r.exiled;
    s.sDeaths += r.scholarDeaths; s.sCombat += r.scholarCombatDeaths;
    s.vDeaths += r.villagerDeaths; s.vCombat += r.villagerCombatDeaths;
    if (/village-lost|village-dead|pop-zero/.test(r.endReason)) s.lost++;
    s.days.push(r.days);
    for (const [c, n] of Object.entries(r.scholarDeathCauses || {})) s.deathCauses[c] = (s.deathCauses[c] || 0) + n;
  }
  for (const k of Object.keys(sum)) {
    const s = sum[k];
    s.perfSurvivalRate = s.perfFights ? +( (s.perfFights - s.perfDeaths) / s.perfFights).toFixed(4) : null;
    s.routedRate = s.perfFights ? +(s.routedViaTrick / s.perfFights).toFixed(4) : null;
    s.fledRate = s.perfFights ? +(s.fledViaTrick / s.perfFights).toFixed(4) : null;
    s.days.sort((a, b) => a - b);
    s.medianDays = s.days[Math.floor(s.days.length / 2)];
  }
  const c = sum.control, a = sum.armed;
  const verdict = {
    primary_perfDeathsDiff: a.perfDeaths - c.perfDeaths,
    primary_bar: -3,
    primary_go: (a.perfDeaths - c.perfDeaths) <= -3,
    secondary_routedRateDiff: (a.routedRate == null || c.routedRate == null) ? null : +(a.routedRate - c.routedRate).toFixed(4),
    secondary_direction_ok: (a.routedRate != null && c.routedRate != null) ? (a.routedRate >= c.routedRate) : null,
    fledRateDiff_honest: (a.fledRate == null || c.fledRate == null) ? null : +(a.fledRate - c.fledRate).toFixed(4),
    fledRate_direction_ok: (a.fledRate != null && c.fledRate != null) ? (a.fledRate >= c.fledRate) : null,
  };
  const guard = {
    attr_armed: a.attr, attr_control: c.attr, attr_ok: a.attr >= c.attr - 2,
    national_armed: a.national, national_control: c.national, national_ok: a.national >= c.national - 2,
    medianDays_armed: a.medianDays, medianDays_control: c.medianDays,
    medianDays_ok: a.medianDays >= c.medianDays - 10,
    deathCauses_armed: Object.keys(a.deathCauses).sort(),
    deathCauses_control: Object.keys(c.deathCauses).sort(),
  };
  const report = { seeds, days, verdict, guard, sum, rows };
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 1));
  } catch (e) {}
  console.log('\n== PILOT SUMMARY ==');
  console.log(JSON.stringify({ verdict, guard, control: sum.control, armed: sum.armed }, null, 1));
}

main().catch(e => { console.error('SWEEP CRASH', e); process.exit(1); });
