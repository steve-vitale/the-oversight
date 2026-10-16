#!/usr/bin/env node
// scripts/run-ledgerdiag-20261016.js — the sim-ledgerdiag-b sweep driver
// (loop B, 2026-10-16, food-economy axis; #340 evidence-sharpener).
//
// 16 control runs: seeds [107,218,329,440,551,662,773,884] x
// {leadfeast, belongfeast} (FEASTSCALE_R13=1 — the shared-baseline substrate;
// leadcourt->leadfeast, belongseek->belongfeast per the sleepin precedent),
// 180d death-aware, LEDGERDIAG=1 instrument. Zero src/js changes, zero
// policy changes.
//
// Per run: loadGame + setupGame, installLedgerDiag, wrap policy.daily to
// call track.dawn(Game) first (and track reachability maxima), runDays,
// final track.dawn (the last night), finalize, uninstall. Writes per-seed
// JSONs to evidence/2026-10-16/perseed-ledgerdiag/ and prints the
// counterfactual summary table the steve-call needs.
//
// Determinism note: the seed set is the sibling arm's (sim-eveningmeal-b)
// set, so this control side IS the shared baseline. If these numbers do
// not byte-match the sibling's control side, that is a LOUD finding.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save
// never stubbed). Never run concurrent jest.
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = [107, 218, 329, 440, 551, 662, 773, 884];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-ledgerdiag');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1 required (shared-baseline substrate).');
  process.exit(2);
}
process.env.LEDGERDIAG = '1';

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { installLedgerDiag } = require('./ledgerdiag-lib-20261016');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const POLICIES = { leadfeast, belongfeast };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function snap(Game) {
  const o = { rank: 'village', arc: 1, tableWaiting: false, tableEntered: false, won: false, wave: 1 };
  try { o.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; o.arc = pg.arc || 1; o.tableWaiting = !!pg.tableWaiting; o.tableEntered = !!pg.tableDone; } catch (e) {}
  try { o.won = !!Game.won; } catch (e) {}
  return o;
}

async function oneRun(pid, seed) {
  const { Game, manifest } = await loadGame({ seed, mode: 'ldg-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const track = installLedgerDiag(Game);
  if (!track.on) throw new Error('instrument did not arm (LEDGERDIAG=1)');
  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxWave: 1 };
  const od = base.daily;
  policy.daily = (G, ctx) => {
    track.dawn(G);
    try {
      const s = snap(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
    } catch (e) {}
    if (od) { try { return od(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
  try { track.dawn(Game); } catch (e) {} // row the final night
  const fin = track.finalize();
  track.uninstall();
  const end = snap(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  try { hist.maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  return {
    policy: pid, seed, days: result.days, endReason: result.endReason,
    won: end.won ? 1 : 0,
    national: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: hist.everTable || end.tableWaiting ? 1 : 0,
    entered: hist.everEntered || end.tableEntered ? 1 : 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave,
    deaths,
    diag: fin,
  };
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const runs = [];
  const t0 = process.hrtime.bigint();
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      const r = await oneRun(pid, seed);
      runs.push(r);
      const p = r.diag.primary;
      const cs = r.diag.coldShoulder;
      const f0 = cs.firings[0];
      fs.writeFileSync(path.join(OUTDIR, `${pid}-s${seed}.json`), JSON.stringify(r, null, 1));
      console.log(`  [${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
        `engArm=${p.engineArm} volArm=${p.volArm === null ? 'never' : p.volArm} delta=${p.delta} ` +
        `coldShoulder=${cs.nFirings}${f0 ? ` d${f0.day} vn7=${f0.voluntaryNet7} vn=${f0.voluntaryNet}` : ''} ` +
        `tier25=${r.diag.perVid[r.diag.armingVid] ? r.diag.perVid[r.diag.armingVid].tier25 : '?'} ` +
        `errs=${r.diag.instrErrors.length}`);
    }
  }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;

  // ---- counterfactual summary (the steve-call table) ----
  let goPrimary = 0, goCo = 0;
  const rows = [];
  for (const r of runs) {
    const p = r.diag.primary, cs = r.diag.coldShoulder;
    const pv = r.diag.perVid[r.diag.armingVid] || {};
    const t25 = pv.tier25At || null;
    if (p.go) goPrimary++;
    if (cs.go) goCo++;
    rows.push({
      run: `${r.policy}/s${r.seed}`, days: r.days,
      engArm: p.engineArm, volArm: p.volArm === null ? 'never' : p.volArm,
      delta: p.delta, primaryGo: p.go,
      coldShoulder: cs.nFirings,
      csDay: cs.firings[0] ? cs.firings[0].day : null,
      csVn7: cs.firings[0] ? cs.firings[0].voluntaryNet7 : null,
      csVn: cs.firings[0] ? cs.firings[0].voluntaryNet : null,
      coGo: cs.go,
      tier25day: t25 ? t25.day : null,
      tier25mealShare: t25 ? t25.mealShare : null,
      tier25volArm: pv.volTier25 === null ? 'never' : pv.volTier25,
      trustStings: r.diag.trustStings,
      errs: r.diag.instrErrors.length,
    });
  }
  const summary = {
    label: 'sim-ledgerdiag-b',
    seeds: SEEDS, policies: Object.keys(POLICIES),
    days: DAYS, env: { FEASTSCALE_R13: process.env.FEASTSCALE_R13, LEDGERDIAG: '1' },
    ms,
    preReg: {
      primary: '>= 10/16 runs: cumulative -5000 arms >= 14d before the dated-voluntary ledger would arm it (or voluntary never arms)',
      coPrimary: '>= 8/16 runs: cold-shoulder fiction fires with voluntaryNet7 >= 0 (freeloader-clock reading)',
    },
    primaryGo: `${goPrimary}/16`, coPrimaryGo: `${goCo}/16`,
    // wall numbers (standing directive)
    wall: {
      national: runs.filter(r => r.national).length + '/16',
      table: runs.filter(r => r.table).length + '/16',
      won: runs.filter(r => r.won).length + '/16',
      wave4: runs.filter(r => r.maxWave >= 4).length + '/16',
      wave5: runs.filter(r => r.maxWave >= 5).length + '/16',
      medianDays: runs.map(r => r.days).sort((a, b) => a - b)[Math.floor(runs.length / 2)],
      maxDays: Math.max.apply(null, runs.map(r => r.days)),
    },
    rows,
  };
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(`\n=== sim-ledgerdiag-b: ${runs.length} runs in ${(ms / 1000).toFixed(0)}s ===`);
  console.log(`PRIMARY (voluntary arms >=14d after cumulative, or never): ${goPrimary}/16  (GO needs >=10)`);
  console.log(`CO-PRIMARY (cold-shoulder with voluntaryNet7 >= 0):        ${goCo}/16  (GO needs >=8)`);
  console.log('run               engArm volArm  delta coldSh dVn7   dVn    t25  t25meal t25vol trustSting');
  for (const r of rows) {
    console.log(
      `${r.run.padEnd(17)} ${String(r.engArm).padEnd(6)} ${String(r.volArm).padEnd(6)} ` +
      `${String(r.delta).padEnd(5)} ${String(r.coldShoulder).padEnd(4)} ` +
      `${String(r.csDay == null ? '-' : r.csDay + '/' + r.csVn7).padEnd(7)} ` +
      `${String(r.csVn).padEnd(6)} ${String(r.tier25day).padEnd(4)} ` +
      `${String(r.tier25mealShare).padEnd(7)} ${String(r.tier25volArm).padEnd(6)} ${r.trustStings}`
    );
  }
  const w = summary.wall;
  console.log(`\nwall: national ${w.national} table ${w.table} won ${w.won} wave4 ${w.wave4} wave5 ${w.wave5} medD ${w.medianDays} maxD ${w.maxDays}`);
  console.log('wrote ' + OUTDIR);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
