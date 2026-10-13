#!/usr/bin/env node
// scripts/sweep-preserve-teach-20261013.js — preserve self-trial teach arm.
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9-12: pilot 8 seeds,
// death-aware 150d horizon, competent-family policies).
//
// Baseline: SEEDS="11,22,33,44" POLICIES="belongseek,leadcourt" DAYS=150 node scripts/sweep-preserve-teach-20261013.js
// After:    same invocation with the fix applied.
//
// Per-run telemetry: scholar preserveFood calls (self-trial smokes),
// learnTechnique(preserve, *) events + day, end-state techniques.preserve,
// pantry preserved-kcal (end + peak), rot, survival, wall numbers
// (national/table/wins/wave4) via scale-repro instruments.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const fc = require('./food-coupling-20261013');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

const POLICY_REGISTRY = { belongseek, leadcourt };

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

// Preserve-specific instruments: scholar self-trial smoke calls + teach events.
function attachPreserve(Game) {
  const p = { smokeCalls: 0, learnEvents: [], knowsAtEnd: false, learnedDay: null };
  const origPF = Game.preserveFood;
  if (typeof origPF === 'function') {
    Game.preserveFood = function (...a) { try { p.smokeCalls++; } catch (e) {} return origPF.apply(this, a); };
  }
  const origLT = Game.learnTechnique;
  if (typeof origLT === 'function') {
    Game.learnTechnique = function (t, src) {
      let r = false;
      try {
        if (String(t) === 'preserve') {
          p.learnEvents.push({ day: dayOf(Game), src: String(src || '?') });
          if (p.learnedDay == null) p.learnedDay = dayOf(Game);
        }
      } catch (e) {}
      r = origLT.apply(this, arguments);
      return r;
    };
  }
  return p;
}
function pantryPreservedKcal(Game) {
  let k = 0;
  try {
    for (const it of ((Game.state.village || {}).pantry || [])) {
      if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
        k += (it.kcalEach || 0) * (it.units || 1);
    }
  } catch (e) {}
  return Math.round(k);
}

async function main() {
  const label = process.env.LEVER || 'preserve-teach-baseline';
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'belongseek,leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'preserve-teach-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      const p = attachPreserve(Game);
      let peakPres = 0;
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        try { const pk = pantryPreservedKcal(G); if (pk > peakPres) peakPres = pk; } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      let knowsEnd = false;
      try { knowsEnd = Game.knowsTechnique('preserve'); } catch (e) {}
      p.knowsAtEnd = knowsEnd;
      let wave = 1;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      const f = fc.finalize(Game, m, result);
      const row = {
        label, policy: pid, seed,
        days: result.days, endReason: result.endReason,
        smokeCalls: p.smokeCalls, learnEvents: p.learnEvents,
        learnedDay: p.learnedDay, knowsAtEnd: p.knowsAtEnd,
        pantryPreservedKcalEnd: pantryPreservedKcal(Game),
        pantryPreservedKcalPeak: peakPres,
        rotKcal: f.rotKcal,
        processSmoke: f.process ? f.process.smoke : null,
        unlockedWave: wave,
      };
      Object.assign(row, finalizeScale(Game, m));
      rows.push(row);
      const nat = row.nationalHeldDays > 0 ? 1 : 0;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} smoke=${row.smokeCalls} learns=${JSON.stringify(row.learnEvents)} knowsEnd=${row.knowsAtEnd ? 1 : 0} presEnd=${row.pantryPreservedKcalEnd} presPeak=${row.pantryPreservedKcalPeak} rot=${row.rotKcal} nat=${nat} wave=${row.unlockedWave}`);
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const s = {
    label, runs: rows.length,
    smokeCalls: agg(r => r.smokeCalls),
    scholarLearned: agg(r => (r.learnEvents.some(e => e.src === 'trial') ? 1 : 0)),
    scholarLearnedAny: agg(r => (r.learnEvents.length ? 1 : 0)),
    knowsAtEnd: agg(r => (r.knowsAtEnd ? 1 : 0)),
    pantryPreservedKcalEnd: agg(r => r.pantryPreservedKcalEnd),
    pantryPreservedKcalPeak: agg(r => r.pantryPreservedKcalPeak),
    rotKcal: agg(r => r.rotKcal),
    national: agg(r => (r.nationalHeldDays > 0 ? 1 : 0)),
    wave4: agg(r => (r.unlockedWave >= 4 ? 1 : 0)),
    waveMax: Math.max(...rows.map(r => r.unlockedWave || 1)),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    ms: Date.now() - t0,
  };
  console.log(`\npreserve: smokeCalls ${s.smokeCalls} scholarTrialLearns ${s.scholarLearned}/${s.runs} anyLearns ${s.scholarLearnedAny}/${s.runs} knowsEnd ${s.knowsAtEnd}/${s.runs}`);
  console.log(`pantry: preservedKcalEnd ${s.pantryPreservedKcalEnd} peak ${s.pantryPreservedKcalPeak} rotKcal ${s.rotKcal}`);
  console.log(`wall: national ${s.national}/${s.runs} wave4 ${s.wave4}/${s.runs} waveMax ${s.waveMax} medianDays ${s.medianDays} maxDays ${s.maxDays}`);
  const out = process.env.OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify({ summary: s, rows }, null, 1)); console.error('wrote ' + out); }
  else console.log(JSON.stringify(s));
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
