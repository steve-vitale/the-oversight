#!/usr/bin/env node
// scripts/sweep-wireacquire-b.js — wireacquire acquire-drive pilot sweep.
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9-12, 14-15): pilot
// 8 fresh seeds (31711-31718) x {leadfeast, belongfeast} x {control, armed},
// 180d death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0 substrate.
// WIREACQUIRE=1 arms the drive; unset = byte-identical control.
//
// Pre-registered primary (binds the run): MECHANISM-ATTRIBUTED engagement —
// runs with >=1 wire acquisition through the layer (waWireBought > 0 or
// layer-attributed waWireSets > 0). GO bar: >=3/16 armed runs (b2: 1/16).
//
// Per-run telemetry: traps set/crafted (incl. wire sets), first-trap day,
// trapline kcal, wire-acquire drive engagement (hawker checks, asks,
// refusals, wire wares, wire bought, wire held day, wire sets), scholar
// wire-at-start, survival + scale-wall numbers (national/table/wins, wave
// unlocks, death causes incl. starvation guardrail).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=control node scripts/sweep-wireacquire-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=armed WIREACQUIRE=1 node scripts/sweep-wireacquire-b.js
// Writes per-seed JSON to evidence/2026-10-19/perseed-wireacquire-b3/ + summary.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
// KILL RECORD (2026-10-19, sim-wireacquire-b3): layer KILLED-AT-PILOT,
// scripts/policies/wireacquire.js deleted zero-trace. Pre-kill pilot:
// 0/16 mechanism-attributed (bar ≥3/16). See evidence/2026-10-19/sim-wireacquire-b3.md.
let wa = null;
try { wa = require('./policies/wireacquire'); }
catch (e) { console.log('LAYER DELETED (killed at pilot 2026-10-19) — pre-kill pilot 0/16; see evidence/2026-10-19/sim-wireacquire-b3.md'); process.exit(0); }

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 required (pre-seat substrate).'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
if (ARM === 'armed' && !wa.layerOn()) { console.error('SWEEP STOP: WIREACQUIRE=1 required for ARM=armed.'); process.exit(2); }
if (ARM === 'control' && wa.layerOn()) { console.error('SWEEP STOP: WIREACQUIRE must be unset for ARM=control.'); process.exit(2); }

const SEEDS = [31711, 31712, 31713, 31714, 31715, 31716, 31717, 31718];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-wireacquire-b3');

const dayOf = (Game) => { try { return ((Game.state.scholar || {}).day || 0); } catch (e) { return 0; }; };

// Trapline + acquire instruments (observation wraps: counts only, zero
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
      const { Game } = await loadGame({ seed, mode: 'wireacquire-' + pid + '-' + ARM });
      await setupGame(Game);
      const wire0 = scholarWireAtStart(Game);
      const W = instrument(Game);
      const policy = ARM === 'armed' ? wa.withWireAcquire(base, pid + '-wa') : base;
      let ctxRef = null, firstTrapDay = null;
      const wrapped = Object.assign({}, policy, {
        setup(G, ctx) { ctxRef = ctx; if (policy.setup) return policy.setup(G, ctx); },
        daily(G, ctx) {
          if (!ctxRef) ctxRef = ctx;
          let r;
          if (policy.daily) { try { r = policy.daily(G, ctx); } catch (e) {} }
          try {
            const sets = (ctx.trapsSet || 0) + (ctx.trapsWireSet || 0) + (ctx._waWireSets || 0);
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
      const waBought = (ctxRef && ctxRef._waWireBought) || 0;
      const waSets = (ctxRef && ctxRef._waWireSets) || 0;
      const row = {
        arm: ARM, policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        wireAtStart: wire0,
        trapsCrafted: (ctxRef && ctxRef.trapsCrafted) || 0,
        trapsSet: (ctxRef && ctxRef.trapsSet) || 0,
        trapsWireSet: (ctxRef && ctxRef.trapsWireSet) || 0,
        waWireSets: waSets,
        trapsTotal: ((ctxRef && ctxRef.trapsSet) || 0) + ((ctxRef && ctxRef.trapsWireSet) || 0) + waSets,
        firstTrapDay,
        trapByDay30: (firstTrapDay != null && firstTrapDay <= 30) ? 1 : 0,
        trapKcal: Math.round(W.trapKcal),
        trapCatches: W.trapCatches,
        waHawkerChecks: (ctxRef && ctxRef._waHawkerChecks) || 0,
        waAsks: (ctxRef && ctxRef._waAsks) || 0,
        waAskRefusals: (ctxRef && ctxRef._waAskRefusals) || 0,
        waWireWares: (ctxRef && ctxRef._waWireWares) || 0,
        waWireBought: waBought,
        waWireHeldDay: (ctxRef && ctxRef._waWireHeldDay) || null,
        waDone: (ctxRef && ctxRef._waDone) || null,
        mechAttributed: (waBought > 0 || waSets > 0) ? 1 : 0,
        starveDeaths: W.starveDeaths,
        deaths,
        national, table, won,
        unlockedWave: wave,
      };
      rows.push(row);
      fs.writeFileSync(path.join(OUTDIR, `${ARM}-${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
      console.log(`  [${ARM} ${pid} s${seed}] d=${row.days}/${row.gameDays} ${row.endReason} wire0=${row.wireAtStart} traps=${row.trapsTotal} firstDay=${row.firstTrapDay} by30=${row.trapByDay30} kcal=${row.trapKcal} wa[chk=${row.waHawkerChecks},asks=${row.waAsks},wares=${row.waWireWares},bought=${row.waWireBought},sets=${row.waWireSets}] mech=${row.mechAttributed} starve=${row.starveDeaths} nat=${national} wave=${wave}`);
    }
  }
  const agg = (fn) => rows.reduce((tt, r) => tt + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
  const s = {
    arm: ARM, runs: rows.length,
    mechAttributed: agg(r => r.mechAttributed) + '/' + rows.length,
    byDay30: agg(r => r.trapByDay30) + '/' + rows.length,
    medianFirstTrapDay: med(rows.filter(r => r.firstTrapDay != null).map(r => r.firstTrapDay)),
    trapsTotal: agg(r => r.trapsTotal),
    trapKcal: agg(r => r.trapKcal),
    trapCatches: agg(r => r.trapCatches),
    waHawkerChecks: agg(r => r.waHawkerChecks),
    waAsks: agg(r => r.waAsks),
    waAskRefusals: agg(r => r.waAskRefusals),
    waWireWares: agg(r => r.waWireWares),
    waWireBought: agg(r => r.waWireBought),
    waWireSets: agg(r => r.waWireSets),
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
