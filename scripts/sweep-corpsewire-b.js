#!/usr/bin/env node
// scripts/sweep-corpsewire-b.js — wire-by-source measurement sweep for arm
// sim-corpsewire-b (backlog #633 MATERIALS leg).
//
// Measurement only (no lever): 8 seeds (31701-31708, the wirebootstrap b2
// substrate) x {leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1
// / SEATDRIVE=0. Instruments (scripts/corpsewire-instruments.js, det-gate
// PASS 8/8) record every wire unit deposited on death packs and every unit
// collected, so the run measures the corpse-channel flow:
//
//   deposited (on death packs) -> looted | buried | stranded-on-corpse | decayed-unlooted
//
// GO (measurement->build gate, pre-registered): build CORPSEWIRE iff
// stranded >= 3 units across the 16 runs AND >= 2 runs show stranding.
// Otherwise document the materials sub-gap closed with the measurements.
//
// Writes per-seed JSON to evidence/2026-10-19/perseed-corpsewire-b/ + summary.
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const { instrumentWire, harvestWire, isWire, wireUnitsOf } = require('./corpsewire-instruments');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 required (pre-seat substrate).'); process.exit(2); }

const SEEDS = [31701, 31702, 31703, 31704, 31705, 31706, 31707, 31708];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-corpsewire-b');

const dayOf = (Game) => { try { return ((Game.state.scholar || {}).day || 0); } catch (e) { return 0; }; };

// wire held by LIVING villagers at spawn + scholar wire at start (sources).
// Matches generatePossessions' read: rec.items + rec.stashed (entries may be
// string ids or item objects). fullPool wire is latent (never carried) and
// is reported separately as non-death-pack wire.
function wireUnitsMixed(arr) {
  let n = 0;
  for (const it of (arr || [])) {
    if (typeof it === 'string') { if (it === 'snare_wire') n++; continue; }
    if (it && (it.itemId === 'snare_wire' || it.plantId === 'snare_wire' || it.id === 'snare_wire')) n++;
  }
  return n;
}

function wireAtStart(Game) {
  let scholar = 0, livingHolders = 0, livingUnits = 0, latentUnits = 0;
  try {
    scholar = wireUnitsMixed((Game.state.scholar || {}).inventory || []);
  } catch (e) {}
  try {
    const vv = Game.state.village || {};
    const roster = vv.roster || [];
    const seen = new Set();
    for (const vid of roster) {
      if (!vid || seen.has(vid)) continue; seen.add(vid);
      let vp = null;
      try { vp = Game.vpOf ? Game.vpOf(vid) : null; } catch (e) {}
      if (!vp || vp.dead) continue;
      const u = wireUnitsMixed(vp.items) + wireUnitsMixed(vp.stashed);
      const latent = wireUnitsMixed(vp.fullPool);
      latentUnits += latent;
      if (u > 0) { livingHolders++; livingUnits += u; }
    }
  } catch (e) {}
  return { scholar, livingHolders, livingUnits, latentUnits };
}

function instrumentTraps(Game) {
  const W = { trapKcal: 0, trapCatches: 0, starveDeaths: 0 };
  const oCarc = Game.foodCarcass;
  if (typeof oCarc === 'function') Game.foodCarcass = function (animal, kcal, day, how) {
    try { if (how === 'trapped') { W.trapKcal += (kcal || 0); W.trapCatches++; } } catch (e) {}
    return oCarc.apply(this, arguments);
  };
  return W;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of POLICIES) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: 'corpsewire-' + pid });
      await setupGame(Game);
      const w0 = wireAtStart(Game);
      const W = instrumentWire(Game);
      const WT = instrumentTraps(Game);
      let ctxRef = null, firstTrapDay = null;
      const wrapped = Object.assign({}, base, {
        setup(G, ctx) { ctxRef = ctx; if (base.setup) return base.setup(G, ctx); },
        daily(G, ctx) {
          if (!ctxRef) ctxRef = ctx;
          let r;
          if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
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
      const row = {
        policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        wireScholarAtStart: w0.scholar,
        wireLivingHoldersAtStart: w0.livingHolders,
        wireLivingUnitsAtStart: w0.livingUnits,
        wireLatentAtStart: w0.latentUnits,
        wireDeposited: wire.deposited,
        wireLooted: wire.looted,
        wireBuried: wire.buried,
        wireStrandedOnCorpse: wire.strandedOnCorpse,
        wireDecayedUnlooted: wire.decayedUnlooted,
        wireStrandedTotal: stranded,
        wireCorpses: wire.wireCorpses,
        corpseCount: wire.corpseCount,
        strandRuns: wire.strandsByRun,
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
      fs.writeFileSync(path.join(OUTDIR, `${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
      console.log(`  [${pid} s${seed}] d=${row.days}/${row.gameDays} ${row.endReason} w0[sch=${w0.scholar},liv=${w0.livingHolders}/${w0.livingUnits},latent=${w0.latentUnits}] dep=${wire.deposited} loot=${wire.looted} bur=${wire.buried} strand=${stranded} (corpses=${wire.corpseCount}) traps=${row.trapsTotal} firstDay=${row.firstTrapDay} starve=${WT.starveDeaths} nat=${national} wave=${wave}`);
    }
  }
  const agg = (fn) => rows.reduce((tt, r) => tt + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
  const strandedRuns = rows.filter(r => r.wireStrandedTotal > 0).length;
  // accounting identity: deposited = looted + buried + stranded + decayed (exact, per-corpse)
  const identity = agg(r => r.wireDeposited) - (agg(r => r.wireLooted) + agg(r => r.wireBuried) + agg(r => r.wireStrandedOnCorpse) + agg(r => r.wireDecayedUnlooted));
  const s = {
    runs: rows.length,
    identityDelta: identity,
    wireScholarAtStart: agg(r => r.wireScholarAtStart),
    wireLivingHoldersAtStart: agg(r => r.wireLivingHoldersAtStart),
    wireLivingUnitsAtStart: agg(r => r.wireLivingUnitsAtStart),
    wireLatentAtStart: agg(r => r.wireLatentAtStart),
    wireDeposited: agg(r => r.wireDeposited),
    wireLooted: agg(r => r.wireLooted),
    wireBuried: agg(r => r.wireBuried),
    wireStrandedOnCorpse: agg(r => r.wireStrandedOnCorpse),
    wireDecayedUnlooted: agg(r => r.wireDecayedUnlooted),
    wireStrandedTotal: agg(r => r.wireStrandedTotal),
    wireCorpses: agg(r => r.wireCorpses),
    strandedRuns,
    buildGate: (agg(r => r.wireStrandedTotal) >= 3 && strandedRuns >= 2) ? 'BUILD-CORPSEWIRE' : 'NO-GAP-DOCUMENT',
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
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify({ summary: s, rows }, null, 1));
  console.log('\nSUMMARY: ' + JSON.stringify(s, null, 1));
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
