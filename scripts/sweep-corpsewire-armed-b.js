#!/usr/bin/env node
// scripts/sweep-corpsewire-armed-b.js — CORPSEWIRE before/after sweep for arm
// sim-corpsewire-b (backlog #633 MATERIALS leg).
//
// 8 seeds (31701-31708) x {leadfeast, belongfeast} x {control, armed}, 180d
// death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0. CORPSEWIRE=1 arms the layer;
// unset = base policy (byte-identical — proven by det-gate).
//
// Pre-registered primary (binds the run): MECHANISM-ATTRIBUTED wire
// collection — runs with >=1 wire unit collected through the layer
// (cwWireCollected > 0). GO bar: >= 3/16 armed runs.
// Guardrails: median survival >= control-10d; no new death mode (>=2-event
// rule); traps set >= control.
// Secondary (the gap itself): stranded wire units (deposited - collected).
//
// Det-gate use: per-seed digests let the gate verify that armed runs with
// zero layer loot verbs are bit-identical to control (no silent RNG
// perturbation — the wirebootstrap b2 lesson).
//
// Writes per-seed JSON to evidence/2026-10-19/perseed-corpsewire-armed/ + summary.
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const { instrumentWire, harvestWire } = require('./corpsewire-instruments');

let cw = null;
try { cw = require('./policies/corpsewire'); }
catch (e) { console.log('LAYER DELETED (killed at pilot 2026-10-19, harmful — approach displaced the scholar; see evidence/2026-10-19/sim-corpsewire-b.md) — pre-kill pilot: primary 0/16 (bar ≥3/16), guardrails missed; panel review_required with leadfeast communityLost regression_signal'); process.exit(0); }

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 required (pre-seat substrate).'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
if (ARM === 'armed' && !cw.layerOn()) { console.error('SWEEP STOP: CORPSEWIRE=1 required for ARM=armed.'); process.exit(2); }
if (ARM === 'control' && cw.layerOn()) { console.error('SWEEP STOP: CORPSEWIRE must be unset for ARM=control.'); process.exit(2); }

const SEEDS = [31701, 31702, 31703, 31704, 31705, 31706, 31707, 31708];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-corpsewire-armed');

const dayOf = (Game) => { try { return ((Game.state.scholar || {}).day || 0); } catch (e) { return 0; }; };

function instrumentTraps(Game) {
  const W = { trapKcal: 0, trapCatches: 0, starveDeaths: 0 };
  const oCarc = Game.foodCarcass;
  if (typeof oCarc === 'function') Game.foodCarcass = function (animal, kcal, day, how) {
    try { if (how === 'trapped') { W.trapKcal += (kcal || 0); W.trapCatches++; } } catch (e) {}
    return oCarc.apply(this, arguments);
  };
  return W;
}

// Stable digest for the det-gate (same shape as det-gate-corpsewire).
function digest(Game) {
  const s = Game.state || {};
  const stable = (v) => JSON.stringify(v, (k, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const o = {};
      for (const kk of Object.keys(val).sort()) o[kk] = val[kk];
      return o;
    }
    return val;
  });
  try {
    return stable({
      day: (s.scholar || {}).day,
      scholar: s.scholar,
      village: s.village,
      corpses: (Game.corpses ? Game.corpses() : []).map(c => ({
        id: c.id, kind: c.kind, looted: !!c.looted, buried: !!c.buried,
        items: (c.items || []).map(i => ({ n: i.name, u: i.units, id: i.itemId || i.plantId })),
      })),
    });
  } catch (e) { return 'DIGEST-ERROR:' + (e && e.message); }
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of POLICIES) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: 'corpsewire-' + pid + '-' + ARM });
      await setupGame(Game);
      const W = instrumentWire(Game);
      const WT = instrumentTraps(Game);
      const policy = ARM === 'armed' ? cw.withCorpsewire(base, pid + '-cw') : base;
      let ctxRef = null, firstTrapDay = null;
      const wrapped = Object.assign({}, policy, {
        setup(G, ctx) { ctxRef = ctx; if (policy.setup) return policy.setup(G, ctx); },
        daily(G, ctx) {
          if (!ctxRef) ctxRef = ctx;
          let r;
          if (policy.daily) { try { r = policy.daily(G, ctx); } catch (e) {} }
          try {
            const sets = (ctx.trapsSet || 0) + (ctx.trapsWireSet || 0);
            if (firstTrapDay == null && sets > 0) firstTrapDay = dayOf(G);
          } catch (e) {}
          return r;
        },
      });
      let result;
      await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 10 }); });
      const wire = harvestWire(Game, W);
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
          if (/starv/i.test(k)) WT.starveDeaths++;
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
      const stranded = wire.strandedOnCorpse + wire.decayedUnlooted;
      const cwWire = (ctxRef && ctxRef._cwWireCollected) || 0;
      const cwVerbs = (ctxRef && ctxRef._cwLootVerbs) || 0;
      const row = {
        arm: ARM, policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        digest: digest(Game),
        wireDeposited: wire.deposited,
        wireLooted: wire.looted,
        wireBuried: wire.buried,
        wireStrandedOnCorpse: wire.strandedOnCorpse,
        wireDecayedUnlooted: wire.decayedUnlooted,
        wireStrandedTotal: stranded,
        cwWireCollected: cwWire,
        cwLootVerbs: cwVerbs,
        mechAttributed: cwWire > 0 ? 1 : 0,
        trapsSet: (ctxRef && ctxRef.trapsSet) || 0,
        trapsWireSet: (ctxRef && ctxRef.trapsWireSet) || 0,
        trapsTotal: ((ctxRef && ctxRef.trapsSet) || 0) + ((ctxRef && ctxRef.trapsWireSet) || 0),
        firstTrapDay,
        trapByDay30: (firstTrapDay != null && firstTrapDay <= 30) ? 1 : 0,
        trapKcal: Math.round(WT.trapKcal),
        trapCatches: WT.trapCatches,
        starveDeaths: WT.starveDeaths,
        deaths,
        national, table, won,
        unlockedWave: wave,
      };
      rows.push(row);
      fs.writeFileSync(path.join(OUTDIR, `${ARM}-${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
      console.log(`  [${ARM} ${pid} s${seed}] d=${row.days}/${row.gameDays} ${row.endReason} dep=${wire.deposited} loot=${wire.looted} strand=${stranded} cw[wire=${cwWire},verbs=${cwVerbs}] mech=${row.mechAttributed} traps=${row.trapsTotal} firstDay=${row.firstTrapDay} starve=${WT.starveDeaths} nat=${national} wave=${wave}`);
    }
  }
  const agg = (fn) => rows.reduce((tt, r) => tt + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
  const s = {
    arm: ARM, runs: rows.length,
    mechAttributed: agg(r => r.mechAttributed) + '/' + rows.length,
    cwWireCollected: agg(r => r.cwWireCollected),
    cwLootVerbs: agg(r => r.cwLootVerbs),
    wireDeposited: agg(r => r.wireDeposited),
    wireLooted: agg(r => r.wireLooted),
    wireStrandedTotal: agg(r => r.wireStrandedTotal),
    identityDelta: agg(r => r.wireDeposited) - (agg(r => r.wireLooted) + agg(r => r.wireBuried) + agg(r => r.wireStrandedOnCorpse) + agg(r => r.wireDecayedUnlooted)),
    byDay30: agg(r => r.trapByDay30) + '/' + rows.length,
    trapsTotal: agg(r => r.trapsTotal),
    trapsWireSet: agg(r => r.trapsWireSet),
    trapKcal: agg(r => r.trapKcal),
    trapCatches: agg(r => r.trapCatches),
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
