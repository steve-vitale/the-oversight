#!/usr/bin/env node
// scripts/sweep-wirebootstrap-b.js — wirebootstrap bootstrap-drive pilot sweep.
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9-12, 14-15): pilot
// 8 fresh seeds (31701-31708) x {leadfeast, belongfeast} x {control, armed},
// 180d death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0 substrate.
// WIREBOOTSTRAP=1 arms the drive; unset = byte-identical control.
//
// Per-run telemetry: traps set/crafted (incl. wire sets), first-trap day
// (the day-30 engagement floor), trapline kcal (trapped carcasses), wire
// bootstrap drive engagement (hawker checks, wire wares, wire bought,
// wire held day, wire sets), scholar wire-at-start, survival + scale-wall
// numbers (national/table/wins, wave unlocks, death causes incl.
// starvation guardrail).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=control node scripts/sweep-wirebootstrap-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=armed WIREBOOTSTRAP=1 node scripts/sweep-wirebootstrap-b.js
// Writes per-seed JSON to evidence/2026-10-19/perseed-wirebootstrap-b/ + summary.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const wb = require('./policies/wirebootstrap');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 required (pre-seat substrate).'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
if (ARM === 'armed' && !wb.layerOn()) { console.error('SWEEP STOP: WIREBOOTSTRAP=1 required for ARM=armed.'); process.exit(2); }
if (ARM === 'control' && wb.layerOn()) { console.error('SWEEP STOP: WIREBOOTSTRAP must be unset for ARM=control.'); process.exit(2); }

const SEEDS = [31701, 31702, 31703, 31704, 31705, 31706, 31707, 31708];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-wirebootstrap-b2');

const dayOf = (Game) => { try { return ((Game.state.scholar || {}).day || 0); } catch (e) { return 0; }; };

// Trapline + bootstrap instruments (observation wraps: counts only, zero
// state writes, zero extra RNG draws — the killdisc-proven pattern).
function instrument(Game) {
  const W = { trapKcal: 0, trapCatches: 0, starveDeaths: 0 };
  const oCarc = Game.foodCarcass;
  if (typeof oCarc === 'function') Game.foodCarcass = function (animal, kcal, day, how) {
    try { if (how === 'trapped') { W.trapKcal += (kcal || 0); W.trapCatches++; } } catch (e) {}
    return oCarc.apply(this, arguments);
  };
  return W;
}

function scholarWireAtStart(Game) {
  try {
    return ((Game.state.scholar || {}).inventory || []).some(i => (i.itemId || i.id) === 'snare_wire') ? 1 : 0;
  } catch (e) { return 0; }
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of POLICIES) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: 'wirebootstrap-' + pid + '-' + ARM });
      await setupGame(Game);
      const wire0 = scholarWireAtStart(Game);
      const W = instrument(Game);
      const policy = ARM === 'armed' ? wb.withWireBootstrap(base, pid + '-wb') : base;
      let ctxRef = null, firstTrapDay = null;
      const wrapped = Object.assign({}, policy, {
        setup(G, ctx) { ctxRef = ctx; if (policy.setup) return policy.setup(G, ctx); },
        daily(G, ctx) {
          if (!ctxRef) ctxRef = ctx;
          let r;
          if (policy.daily) { try { r = policy.daily(G, ctx); } catch (e) {} }
          try {
            const sets = (ctx.trapsSet || 0) + (ctx.trapsWireSet || 0) + (ctx._wbWireSets || 0);
            if (firstTrapDay == null && sets > 0) firstTrapDay = dayOf(G);
          } catch (e) {}
          return r;
        },
      });
      let result;
      await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 10 }); });
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
          if (/starv/i.test(k)) W.starveDeaths++;
        }
      } catch (e) {}
      let wave = 1;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      let national = 0, table = 0, won = 0;
      try {
        const hs = Game.hierarchyState ? (Game.hierarchyState() || []) : [];
        national = hs.some(l => l && l.kind === 'national' && l.status === 'active') ? 1 : 0;
      } catch (e) {}
      try { table = Game.tableEntered ? 1 : 0; } catch (e) {}
      try { won = Game.won ? 1 : 0; } catch (e) {}
      const row = {
        arm: ARM, policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        wireAtStart: wire0,
        trapsCrafted: (ctxRef && ctxRef.trapsCrafted) || 0,
        trapsSet: (ctxRef && ctxRef.trapsSet) || 0,
        trapsWireSet: (ctxRef && ctxRef.trapsWireSet) || 0,
        wbWireSets: (ctxRef && ctxRef._wbWireSets) || 0,
        trapsTotal: ((ctxRef && ctxRef.trapsSet) || 0) + ((ctxRef && ctxRef.trapsWireSet) || 0) + ((ctxRef && ctxRef._wbWireSets) || 0),
        firstTrapDay,
        trapByDay30: (firstTrapDay != null && firstTrapDay <= 30) ? 1 : 0,
        trapKcal: Math.round(W.trapKcal),
        trapCatches: W.trapCatches,
        wbHawkerChecks: (ctxRef && ctxRef._wbHawkerChecks) || 0,
        wbWireWares: (ctxRef && ctxRef._wbWireWares) || 0,
        wbWireBought: (ctxRef && ctxRef._wbWireBought) || 0,
        wbWireHeldDay: (ctxRef && ctxRef._wbWireHeldDay) || null,
        wbDone: (ctxRef && ctxRef._wbDone) || null,
        starveDeaths: W.starveDeaths,
        deaths,
        national, table, won,
        unlockedWave: wave,
      };
      rows.push(row);
      fs.writeFileSync(path.join(OUTDIR, `${ARM}-${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
      console.log(`  [${ARM} ${pid} s${seed}] d=${row.days}/${row.gameDays} ${row.endReason} wire0=${row.wireAtStart} traps=${row.trapsTotal} firstDay=${row.firstTrapDay} by30=${row.trapByDay30} kcal=${row.trapKcal} wb[chk=${row.wbHawkerChecks},wares=${row.wbWireWares},bought=${row.wbWireBought},sets=${row.wbWireSets}] starve=${row.starveDeaths} nat=${national} wave=${wave}`);
    }
  }
  const agg = (fn) => rows.reduce((tt, r) => tt + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
  const s = {
    arm: ARM, runs: rows.length,
    byDay30: agg(r => r.trapByDay30) + '/' + rows.length,
    medianFirstTrapDay: med(rows.filter(r => r.firstTrapDay != null).map(r => r.firstTrapDay)),
    trapsTotal: agg(r => r.trapsTotal),
    trapKcal: agg(r => r.trapKcal),
    trapCatches: agg(r => r.trapCatches),
    wbHawkerChecks: agg(r => r.wbHawkerChecks),
    wbWireWares: agg(r => r.wbWireWares),
    wbWireBought: agg(r => r.wbWireBought),
    wbWireSets: agg(r => r.wbWireSets),
    medianSurvival: med(rows.map(r => r.days)),
    starveDeaths: agg(r => r.starveDeaths),
    national: agg(r => r.national),
    table: agg(r => r.table),
    wins: agg(r => r.won),
    waveMax: Math.max.apply(null, rows.map(r => r.unlockedWave || 1)),
    ms: Date.now() - t0,
  };
  fs.writeFileSync(path.join(OUTDIR, `summary-${ARM}.json`), JSON.stringify({ summary: s, rows }, null, 1));
  console.log('\nSUMMARY ' + ARM + ': ' + JSON.stringify(s, null, 1));
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
