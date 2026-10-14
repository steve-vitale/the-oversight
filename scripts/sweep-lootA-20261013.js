#!/usr/bin/env node
// scripts/sweep-lootA-20261013.js — BATCH-LOOT LEVER SWEEP.
//
// Pre-registered GO (MEASUREMENT.md §14 — binding, judged only against this):
//   Primary: deliberate loot verbs per corpse cleared ↓≥60% vs identical-seed
//            baseline (LOOT_ALL=0, the old per-item path).
//   Guardrail: total loot yield (kcal hauled from corpses) ≥ baseline.
// Seeds: 8 (11/22/33/44/55/66/77/88) × competent + belongseek = 16 runs/arm.
// Horizon: 180d death-aware (runDays breaks on pop-zero / Game.over).
//
// Baseline arm (LOOT_ALL=0) runs the NEW policy's per-item fallback, which is
// the old lootCorpses body verbatim (_left is UI-only, never set headless,
// so sim behavior is identical). The only delta between arms is batch vs
// per-item looting.
//
// Usage:
//   OUT=evidence/2026-10-13/sim-lootA-sweep.json node scripts/sweep-lootA-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');

const POLICY_REGISTRY = { competent, belongseek };
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'competent,belongseek').split(',');
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || 'evidence/2026-10-13/sim-lootA-sweep.json';

// per-run loot metrics: wraps OUTSIDE the harness verb wrapper (which still
// records telemetry). Headless sims have no UI and game code never calls the
// loot verbs, so wrapper counts == deliberate (policy-origin) counts; the
// sweep cross-checks wrapper verbs against pacing rows.
function attachLootMetrics(Game) {
  const m = { verbs: 0, kcal: 0, stacks: 0, cleared: [] };
  const clearedSet = new Set();
  const lootedNow = (cid) => {
    try { const c = Game.corpses().find(x => x.id === cid); return !!(c && c.looted); }
    catch (e) { return false; }
  };
  if (typeof Game.corpseTakeItem === 'function' && !Game.corpseTakeItem._lootWrapped) {
    const inner = Game.corpseTakeItem;
    const w = function (cid, idx) {
      m.verbs++;
      let kcal = 0; const was = lootedNow(cid);
      try {
        const c = Game.corpses().find(x => x.id === cid);
        const it = c && (c.items || [])[idx];
        if (it) kcal = (it.kcalEach || 0) * (it.units == null ? 1 : it.units);
      } catch (e) {}
      const r = inner.apply(this, arguments);
      if (r) {
        m.kcal += kcal; m.stacks++; // one successful take = one stack
        if (!was && lootedNow(cid) && !clearedSet.has(cid)) { clearedSet.add(cid); m.cleared.push(cid); }
      }
      return r;
    };
    w._lootWrapped = true;
    Game.corpseTakeItem = w;
  }
  if (typeof Game.corpseLootAll === 'function' && !Game.corpseLootAll._lootWrapped) {
    const inner = Game.corpseLootAll;
    const w = function (cid, skip) {
      m.verbs++;
      const was = lootedNow(cid);
      const r = inner.apply(this, arguments);
      if (r) {
        for (const t of (r.taken || [])) m.kcal += (t.kcalEach || 0) * (t.units || 0);
        m.stacks += (r.taken || []).length;
        if (!was && r.looted && !clearedSet.has(cid)) { clearedSet.add(cid); m.cleared.push(cid); }
      }
      return r;
    };
    w._lootWrapped = true;
    Game.corpseLootAll = w;
  }
  m.clearedCount = () => clearedSet.size;
  return m;
}

function lootVerbsFromPacing(result) {
  let n = 0;
  for (const row of (result.pacing.perDay || [])) {
    for (const k of Object.keys(row.acts || {})) {
      if (k === 'policy:corpseTakeItem' || k === 'policy:corpseLootAll') n += row.acts[k];
    }
  }
  return n;
}

async function oneRun(seed, policyId, lootAll) {
  process.env.LOOT_ALL = lootAll ? '1' : '0';
  const policy = POLICY_REGISTRY[policyId];
  const { Game } = await loadGame({ seed, mode: `lootA-${lootAll ? 'batch' : 'base'}-${policyId}-${seed}`, fullTelemetry: true });
  await setupGame(Game);
  const lm = attachLootMetrics(Game);
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 });
  const pacingVerbs = lootVerbsFromPacing(result);
  const cleared = lm.clearedCount();
  return {
    seed, policy: policyId, arm: lootAll ? 'batch' : 'baseline',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    lootVerbsPacing: pacingVerbs, lootVerbsWrapped: lm.verbs,
    corpsesCleared: cleared, stacksHauled: lm.stacks,
    verbsPerCleared: cleared > 0 ? +(pacingVerbs / cleared).toFixed(2) : null,
    lootKcal: Math.round(lm.kcal),
    totalDeliberate: result.pacing.totalDeliberate,
  };
}

async function main() {
  const rows = [];
  for (const lootAll of [false, true]) {
    for (const policyId of POLICIES) {
      for (const seed of SEEDS) {
        try {
          const r = await oneRun(seed, policyId, lootAll);
          rows.push(r);
          console.log(`${r.arm} ${r.policy} s${seed}: days=${r.days} verbs=${r.lootVerbsPacing} cleared=${r.corpsesCleared} vpc=${r.verbsPerCleared} kcal=${r.lootKcal}`);
        } catch (e) {
          rows.push({ seed, policy: policyId, arm: lootAll ? 'batch' : 'baseline', error: String(e && e.message || e) });
          console.log(`ERROR ${lootAll ? 'batch' : 'baseline'} ${policyId} s${seed}: ${e && e.message}`);
        }
      }
    }
  }
  // per-pair comparison on identical seeds
  const pairs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const b = rows.find(r => r.arm === 'baseline' && r.policy === policyId && r.seed === seed);
      const a = rows.find(r => r.arm === 'batch' && r.policy === policyId && r.seed === seed);
      if (b && a && !b.error && !a.error) pairs.push({ policy: policyId, seed, b, a });
    }
  }
  const mean = (xs) => xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : null;
  const vpcB = pairs.map(p => p.b.verbsPerCleared).filter(x => x != null);
  const vpcA = pairs.map(p => p.a.verbsPerCleared).filter(x => x != null);
  const kcalB = pairs.map(p => p.b.lootKcal), kcalA = pairs.map(p => p.a.lootKcal);
  const stB = pairs.map(p => p.b.stacksHauled), stA = pairs.map(p => p.a.stacksHauled);
  const summary = {
    meta: { seeds: SEEDS, policies: POLICIES, days: DAYS, arms: ['baseline(LOOT_ALL=0)', 'batch(LOOT_ALL=1)'], n: pairs.length },
    verbsPerCleared: { baseline: mean(vpcB), batch: mean(vpcA),
      reduction: (mean(vpcB) && mean(vpcA)) ? +((1 - mean(vpcA) / mean(vpcB)) * 100).toFixed(1) : null },
    lootKcal: { baseline: mean(kcalB), batch: mean(kcalA),
      ratio: (mean(kcalB) && mean(kcalA)) ? +(mean(kcalA) / mean(kcalB)).toFixed(3) : null,
      note: 'STRUCTURALLY ZERO: monster corpse loot tables carry kcalEach 0 (meat comes from butchering); guardrail unevaluable — see metric review' },
    stacksHauled: { baseline: mean(stB), batch: mean(stA),
      ratio: (mean(stB) != null && mean(stA) != null && mean(stB) > 0) ? +(mean(stA) / mean(stB)).toFixed(3) : null,
      note: 'REVISED GUARDRAIL (run 2): item stacks hauled from corpses, batch vs baseline' },
    go: null,
  };
  // RUN 2 verdict (revised guardrail per anti-drift): primary = verbs/cleared
  // reduction ≥60%; guardrail = stacks hauled ratio ≥1.0 (no loot loss).
  // The kcal guardrail is recorded but unevaluable (structurally zero).
  if (summary.verbsPerCleared.reduction != null && summary.stacksHauled.ratio != null) {
    summary.go = (summary.verbsPerCleared.reduction >= 60 && summary.stacksHauled.ratio >= 1.0)
      ? 'GO' : 'NO-GO';
  }
  const out = { summary, pairs: pairs.map(p => ({ policy: p.policy, seed: p.seed,
    b: { v: p.b.lootVerbsPacing, c: p.b.corpsesCleared, vpc: p.b.verbsPerCleared, kcal: p.b.lootKcal, stacks: p.b.stacksHauled, days: p.b.days },
    a: { v: p.a.lootVerbsPacing, c: p.a.corpsesCleared, vpc: p.a.verbsPerCleared, kcal: p.a.lootKcal, stacks: p.a.stacksHauled, days: p.a.days } })) };
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(summary, null, 1));
}

main().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
