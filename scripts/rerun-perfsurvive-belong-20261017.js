#!/usr/bin/env node
// Targeted re-run for the 6 missing perfsurvive-belong armed runs
// (s9933-s9938). The main sweep died at 26/32. This runs ONLY the missing
// arm/seed combos and appends their per-seed JSONs. It does NOT rewrite the
// pilot summary — the coordinator's analyzer merges.
'use strict';
const fs = require('fs');
const path = require('path');
// Reuse the sweep's runOne by stubbing: we import the policy and replicate
// the minimal run via a child that requires the sweep module's internals.
// Simpler: shell out to a node -e that loads the sweep file's functions.
// The sweep file runs main() on require, so instead we inline the needed
// bits here by requiring sim-harness + policies directly (mirroring
// sweep-perfsurvive-20261017.js runOne).
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { perfsurviveBelong } = require('./policies/perfsurvive');

function nationalAt(Game) {
  try { const r = typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village'; return (r === 'national' || r === 'global') ? 1 : 0; }
  catch (e) { return 0; }
}
function wonAt(Game) { try { return Game.won === true ? 1 : 0; } catch (e) { return 0; } }
function tableAt(Game) {
  try {
    const tel = (Game.state || {}).telemetry || [];
    if (tel.some(e => e && (e.type === 'table_won' || e.type === 'table_failed' || e.type === 'table_entered'))) return 1;
    const pg = Game.progState ? Game.progState() : {};
    return (pg.tableWaiting || pg.tableDone) ? 1 : 0;
  } catch (e) { return 0; }
}
function exiledAt(Game) { try { return ((Game.state || {}).scholar || {}).exiled ? 1 : 0; } catch (e) { return 0; } }
function trickAttr(Game) {
  const wkl = (Game.state || {}).waveKillLog || [];
  const all = wkl.filter(e => e && e.trick);
  const w12 = all.filter(e => ((e.w | 0) <= 2));
  const byVia = {}; const byWave = {};
  for (const e of all) { byVia[e.via || '?'] = (byVia[e.via || '?'] || 0) + 1; byWave['w' + (e.w | 0)] = (byWave['w' + (e.w | 0)] || 0) + 1; }
  return { attr: all.length, attrW12: w12.length, byVia, byWave };
}
function scholarDeaths(Game) {
  const tel = (Game.state || {}).telemetry || [];
  const ds = tel.filter(e => e && e.type === 'death' && e.player === true);
  const causes = {}; let combat = 0;
  for (const e of ds) {
    const c = String(e.cause || 'unknown'); causes[c] = (causes[c] || 0) + 1;
    if (/combat|fight|monster|maul|bite|claw|wound|slain|killed|strike/i.test(c)) combat++;
  }
  return { n: ds.length, combat, causes };
}
function villagerDeaths(Game) {
  try { const fallen = ((Game.state || {}).village || {}).fallen || []; return { n: fallen.length, combat: fallen.filter(f => f && f.cause === 'combat').length }; }
  catch (e) { return { n: 0, combat: 0 }; }
}
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

async function runOne(seed, days) {
  process.env.PERFSURVIVE = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const policy = perfsurviveBelong;
  const { Game } = await loadGame({ seed, mode: 'perfsurvive-' + policy.id, fullTelemetry: true });
  await setupGame(Game);
  const perfFights = [];
  attachPerfInstrument(Game, perfFights);
  const snap = {};
  const origDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try { if (ctx.psInvitesOk != null) snap.psInvitesOk = ctx.psInvitesOk; } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, sampleEvery: 15 }));
  const ta = trickAttr(Game); const sd = scholarDeaths(Game); const vd = villagerDeaths(Game);
  const perfN = perfFights.length;
  const perfSurv = perfN ? perfFights.filter(f => f.scholarAlive).length : 0;
  return {
    policy: policy.id, gate: '1', seed,
    days: result.days, endReason: result.endReason || 'alive',
    national: nationalAt(Game), table: tableAt(Game), wins: wonAt(Game), exiled: exiledAt(Game),
    maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    attr: ta.attr, attrW12: ta.attrW12, attrByVia: ta.byVia, attrByWave: ta.byWave,
    perfFights: perfN, perfSurvived: perfSurv,
    perfSurvivalRate: perfN ? +(perfSurv / perfN).toFixed(4) : null,
    scholarDeaths: sd.n, scholarCombatDeaths: sd.combat, scholarDeathCauses: sd.causes,
    villagerDeaths: vd.n, villagerCombatDeaths: vd.combat,
    psInvitesOk: snap.psInvitesOk || 0,
  };
}

(async () => {
  const seeds = [9933, 9934, 9935, 9936, 9937, 9938];
  const dir = 'evidence/2026-10-17/perseed-perfsurvive';
  for (const seed of seeds) {
    const row = await runOne(seed, 180);
    fs.writeFileSync(path.join(dir, `${row.policy}-s${seed}.json`), JSON.stringify(row, null, 1));
    console.log(`  [${row.policy} s${seed}] d=${row.days} ${row.endReason} attr=${row.attr} perf=${row.perfFights}/${row.perfSurvived} nat=${row.national} sDeaths=${row.scholarDeaths}(${row.scholarCombatDeaths}c) vDeaths=${row.villagerDeaths} inv=${row.psInvitesOk}`);
  }
  console.log('done');
})().catch(e => { console.error('rerun crashed: ' + e.stack); process.exit(1); });
