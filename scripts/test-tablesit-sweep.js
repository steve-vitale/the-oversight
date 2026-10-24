#!/usr/bin/env node
// scripts/test-tablesit-sweep.js — sim-tablesit pilot + proof gates
// (scale-onramp axis, 2026-10-24).
//
// Measures competent vs tablesit (competent + table-first after
// national) on IDENTICAL seeds, death-aware horizon 180 loop-days
// (dead villages stop via runDays' Game.over break; no fixed-200d).
//
// Modes:
//   default: pilot sweep. SEEDS="71101,71102,..." (default 71101-71108),
//     DAYS=180 (default), OUT=evidence/2026-10-24/sim-tablesit-pilot.json.
//     Writes the per-seed corpus + aggregates + verdict, prints a table.
//     Exit 0 on a completed sweep regardless of GO/NO-GO (the verdict
//     is data, not a script failure); exit 1 on proof-gate failure.
//   --detgate: TABLESIT=0 delegation proof on one seed: competent vs
//     tablesit-with-gate-off must be byte-identical on days/gameDays.
//     Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): tablesit on one
//     seed with the say ring, written to
//     evidence/2026-10-24/sim-tablesit-sense.txt for the sense read.
//     SENSE_SEED env overrides the argv seed.
//
// Proof gates (printed, and G1/G2 failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately; the sweep prints a
//     reminder, it does not re-run it — one process, one seed each).
//   G2 pre-national delegation: for every pilot seed where NEITHER arm
//     ever reached national, days and gameDays must be identical —
//     the wrapper is read-only before national, so any divergence is
//     a wrapper leak, not a treatment effect.
//   G3 corpus integrity: every config produced a row, no zero-day
//     rows, no missing counters object.
//
// Verdict (computed, not asserted by the script): GO iff armed median
// survival (result.days, sweep-compare convention) >= baseline median
// + 15 days AND armed table reach (invited ever) not lower than
// baseline. The evidence file judges; this script only reports.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, snapshotVillagers, quietLog } = require('./sim-harness');
const { competent, walkTo } = require('./policies/competent');
const PI = require('./postunlock-instrument');
// TABLESIT INLINE (sim-tablesit 2026-10-24, NO-GO kill record): the
// policy file scripts/policies/tablesit.js was DELETED per the kill
// rule (killed arms leave no trace — the pilot measured 16/16
// byte-identical configs, so the policy never fired). This inline copy
// is the exact tested logic, carried in the instrument so the NO-GO
// remains reproducible from this file alone. It wraps competent:
// once rank reaches national, (1) take a ready table seat before the
// day's work, then answer table choices first-option (bounded, stall
// guard); (2) while tableWaiting at national+, end the day at Haven.
// Before national it is read-only. TABLESIT=0 restores pure delegation.
const TS_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function tsLayerOn() { return process.env.TABLESIT !== '0'; }
function tsGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function tsRankOrder(Game) { try { return TS_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function tsProgOf(Game) { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } }
function tsAtHaven(Game) { try { return Game.map.px === 4 && Game.map.py === 4; } catch (e) { return false; } }
function tsScholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}
function tsCanPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; } catch (e) { return false; }
}
function tsAnswerTableChoices(Game, ctx) {
  try {
    let n = 0, lastSig = null, stall = 0;
    for (;;) {
      if (Game.over || n >= 30) break;
      if (Game.tbfight && !Game.tbfight.over) break;
      const tc = (Game.state.scholar || {}).tableChoices;
      if (!tc || !tc.options || !tc.options.length || !Game.chooseTableOption) break;
      const sig = tc.frame + '|' + tc.options.map(o => o.id).join(',');
      if (sig === lastSig && ++stall >= 2) break;
      lastSig = sig;
      try { Game.chooseTableOption(tc.options[0].id); } catch (e) { ctx.tsTableErr = String(e && e.message).slice(0, 80); break; }
      n++;
      ctx.tsTableAnswers = (ctx.tsTableAnswers || 0) + 1;
      if (String(tc.options[0].id).indexOf('path:') === 0) ctx.tsTablePath = tc.options[0].id.slice(5);
    }
  } catch (e) { ctx.tsTableErr = String(e && e.message).slice(0, 80); }
}
function tsDriveSeat(Game, ctx) {
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); return; }
  if (!pv) return;
  ctx.tsPreviewSeen = (ctx.tsPreviewSeen || 0) + 1;
  if (!pv.ready) { ctx.tsPreviewNotReady = (ctx.tsPreviewNotReady || 0) + 1; return; }
  if (!tsScholarAlive(Game)) { ctx.tsNoScholar = (ctx.tsNoScholar || 0) + 1; return; }
  if (!tsCanPropose(Game)) { ctx.tsGuardRefused = (ctx.tsGuardRefused || 0) + 1; return; }
  ctx.tsSeatAttempts = (ctx.tsSeatAttempts || 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); return; }
  if (r && r.ok) {
    ctx.tsSeatTaken = (ctx.tsSeatTaken || 0) + 1;
    ctx.tsSeatDay = tsGday(Game);
    ctx.tsSeatKind = pv.seat;
    tsAnswerTableChoices(Game, ctx);
  } else {
    ctx.tsSeatFailed = (ctx.tsSeatFailed || 0) + 1;
  }
}
const tablesit = Object.assign({}, competent, {
  id: 'tablesit',
  desc: 'competent + table-first after national: take the seat when invited, wait at Haven while invited',
  daily(Game, ctx) {
    if (!tsLayerOn()) return competent.daily(Game, ctx);
    try {
      const pg0 = tsProgOf(Game);
      if (!pg0.tableDone && tsRankOrder(Game) >= 2) {
        if (ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
        tsDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); }
    const r = competent.daily(Game, ctx);
    try {
      const pg = tsProgOf(Game);
      if (!pg.tableDone && pg.tableWaiting && tsRankOrder(Game) >= 2) {
        ctx.tsWaitDays = (ctx.tsWaitDays || 0) + 1;
        if (tsAtHaven(Game)) {
          ctx.tsWaitAtHaven = (ctx.tsWaitAtHaven || 0) + 1;
        } else {
          try { walkTo(Game, 4, 4); } catch (e) { ctx.tsWaitErr = String(e && e.message).slice(0, 80); }
          if (tsAtHaven(Game)) ctx.tsWaitReturns = (ctx.tsWaitReturns || 0) + 1;
          else ctx.tsWaitStranded = (ctx.tsWaitStranded || 0) + 1;
        }
      }
      if (tsRankOrder(Game) >= 2 && ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
    } catch (e) { ctx.tsWaitErr = String(e && e.message).slice(0, 80); }
    return r;
  },
});

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

async function runOne(pid, seed, days) {
  const base = pid === 'tablesit' ? tablesit : competent;
  const { Game } = await loadGame({ seed, mode: 'tablesit-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let finalVillagers = null;
  try { finalVillagers = snapshotVillagers(Game); } catch (e) { finalVillagers = null; }
  return {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(result.samples.deaths),
    ts,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge), finalVillagers,
  };
}

function aggregate(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    medianGameDays: medianOf(rs.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    national: rs.reduce((t, r) => t + r.national, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    waitDays: rs.reduce((t, r) => t + (r.ts.tsWaitDays || 0), 0),
    waitReturns: rs.reduce((t, r) => t + (r.ts.tsWaitReturns || 0), 0),
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '71101,71102,71103,71104,71105,71106,71107,71108')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-tablesit-pilot.json');
  const rows = [];
  // INCREMENTAL WRITE (sim-tablesit 2026-10-24): a sweep killed mid-run
  // must not lose its completed configs — rewrite the corpus file after
  // every config (partial report flagged as such until the final write).
  const writePartial = () => {
    try {
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, JSON.stringify({
        label: 'sim-tablesit pilot', seeds, days, rows,
        partial: true, completedConfigs: rows.length,
        generated: new Date().toISOString(),
      }, null, 2));
    } catch (e) { console.error('partial write failed:', e.message); }
  };
  for (const pid of ['competent', 'tablesit']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days);
      rows.push(row);
      writePartial();
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank} nat=${row.national} table=${row.table} entered=${row.entered} won=${row.won} ts=${JSON.stringify(row.ts)}`);
    }
  }
  const byPolicy = { competent: aggregate(rows, 'competent'), tablesit: aggregate(rows, 'tablesit') };
  // G2: pre-national delegation — identical days/gameDays where neither arm reached national.
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'competent' && r.seed === seed);
    const a = rows.find(r => r.policy === 'tablesit' && r.seed === seed);
    if (c && a && !c.national && !a.national) {
      const ok = c.days === a.days && c.gameDays === a.gameDays;
      g2.push({ seed, ok, cDays: c.days, aDays: a.days, cGameDays: c.gameDays, aGameDays: a.gameDays });
    }
  }
  const g2Pass = g2.length ? g2.every(x => x.ok) : null;
  // G3: corpus integrity.
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.ts && typeof r.ts === 'object');
  const go = (byPolicy.tablesit.medianDays >= byPolicy.competent.medianDays + 15)
    && (byPolicy.tablesit.table >= byPolicy.competent.table);
  const report = {
    label: 'sim-tablesit pilot', seeds, days, rows, byPolicy,
    gates: { g2PreNationalDelegation: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    verdict: go ? 'GO' : 'NO-GO',
    verdictRule: 'GO iff armed medianDays >= baseline medianDays + 15 AND armed table >= baseline table',
    generated: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log('\n=== sim-tablesit pilot ===');
  for (const pid of ['competent', 'tablesit']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} nat=${b.national} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} seatTaken=${b.seatTaken} waitDays=${b.waitDays} waitReturns=${b.waitReturns}`);
  }
  console.log(`  G2 pre-national delegation: ${g2Pass === null ? 'n/a (every seed reached national)' : (g2Pass ? 'PASS' : 'FAIL')} (${g2.length} comparable seeds)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  VERDICT: ${report.verdict} (rule: ${report.verdictRule}) -> ${out}`);
  console.log('  NOTE: run --detgate separately for G1 (TABLESIT=0 delegation).');
  if (g2Pass === false || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '71101', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('competent', seed, days);
  process.env.TABLESIT = '0';
  const a = await runOne('tablesit', seed, days);
  const ok = c.days === a.days && c.gameDays === a.gameDays && !(a.ts.tsSeatTaken || a.ts.tsWaitDays);
  console.log(`DETGATE seed=${seed} competent days=${c.days} gameDays=${c.gameDays} | tablesit(TABLESIT=0) days=${a.days} gameDays=${a.gameDays} ts=${JSON.stringify(a.ts)} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '71101', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-tablesit-sense.txt');
  const { Game } = await loadGame({ seed, mode: 'tablesit-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, tablesit, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tablesit days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('TABLESIT SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
